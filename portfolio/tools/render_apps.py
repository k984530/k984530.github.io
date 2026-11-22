#!/usr/bin/env python3
"""Fill /index.html from portfolio/apps.json and portfolio/channels.json.

Run from the repository root after updating either file:

    python3 portfolio/tools/render_apps.py

Every number and date on the home page comes from here (no hand-written counts):
  - the inline `projects` / `appStats` / `channels` data read by portfolio/home.js,
  - the HTML app list and channel list (search engines, screen readers, no-WebGL),
  - every element with data-stat="<key>" (its text becomes appStats[key]),
  - the counts in <title> and the meta descriptions.

The inline `projects` array keeps the `{ name: "...", ios: "...", android: "...", detail: "..." }`
shape that scripts/verify-*.mjs read from index.html. Channels use `{ channel: "..." }` so those scripts
do not mistake them for apps. scripts/verify-home-story.mjs checks the result.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INDEX = ROOT / "index.html"
DATA = ROOT / "portfolio" / "apps.json"
CHANNELS = ROOT / "portfolio" / "channels.json"
HANGUL = re.compile(r"[가-힣]")


def dot_date(iso):
    return iso.replace("-", ".")


def dot_month(iso):
    return iso[:7].replace("-", ".")


def compute(apps, channels, checked):
    """All numbers shown on the page. apps must be sorted by release date."""
    first, latest = apps[0], apps[-1]
    first_year = int(first["date"][:4])
    in_first_year = [a for a in apps if int(a["date"][:4]) == first_year]
    # The closing run of games: the newest releases that are all games, counted back from the latest.
    games_start = len(apps)
    while games_start > 0 and apps[games_start - 1].get("genre") == "Games":
        games_start -= 1
    games = apps[games_start:]
    return {
        "total": len(apps),
        "appStore": sum(1 for a in apps if a.get("ios")),
        "googlePlay": sum(1 for a in apps if a.get("android")),
        "both": sum(1 for a in apps if a.get("ios") and a.get("android")),
        "span": f"{dot_month(first['date'])} — {dot_month(latest['date'])}",
        "firstDate": dot_date(first["date"]),
        "firstTitle": first["title"],
        "firstYear": first_year,
        "firstYearCount": len(in_first_year),
        "firstYearRange": f"{dot_month(in_first_year[0]['date'])} — {dot_month(in_first_year[-1]['date'])}",
        "gamesCount": len(games),
        "gamesStart": games_start,
        "gamesRange": f"{dot_date(games[0]['date'])} — {dot_date(games[-1]['date'])}" if games else "",
        "latestTitle": latest["title"],
        "latestDate": dot_date(latest["date"]),
        "next": len(apps) + 1,
        "channels": len(channels),
        "checked": checked,
        "checkedLabel": dot_date(checked),
    }


def js_str(value):
    return json.dumps(value, ensure_ascii=False)


def lang_attr(text):
    return ' lang="ko"' if HANGUL.search(text) else ""


def data_block(apps, stats, channels):
    lines = [
        f"        // {stats['checked']} 조회: App Store(lookup us+kr) {stats['appStore']} · Google Play(공개 페이지 200) {stats['googlePlay']} · 합계 {stats['total']}",
        "        // 고칠 때는 portfolio/apps.json · portfolio/channels.json을 바꾸고 python3 portfolio/tools/render_apps.py를 돌린다.",
        "        const projects = [",
    ]
    for a in apps:
        parts = [f'name: {js_str(a["name"])}', f'title: {js_str(a["title"])}', f'year: {int(a["date"][:4])}', f'date: {js_str(a["date"])}', f'icon: {js_str(a["icon"])}']
        if a.get("ios"):
            parts.append(f'ios: {js_str(a["ios"])}')
        if a.get("android"):
            parts.append(f'android: {js_str(a["android"])}')
        if a.get("detail"):
            parts.append(f'detail: {js_str(a["detail"])}')
        if a.get("spotlight") is False:
            # 첫 화면 앞줄 · 가운데 같은 눈에 띄는 자리에 세우지 않는다(목록 · 숫자 · 벽 · 탑에는 그대로 있다).
            parts.append("spotlight: false")
        lines.append("            { " + ", ".join(parts) + " },")
    lines[-1] = lines[-1].rstrip(",")
    lines.append("        ];")
    lines.append("        const appStats = " + json.dumps(stats, ensure_ascii=False) + ";")
    lines.append("        const channels = [")
    for c in channels:
        lines.append(f'            {{ channel: {js_str(c["name"])}, topic: {js_str(c["topic"])}, url: {js_str(c["url"])}, avatar: {js_str(c["avatar"])} }},')
    if channels:
        lines[-1] = lines[-1].rstrip(",")
    lines.append("        ];")
    return "\n".join(lines)


def list_block(apps):
    out = []
    for a in apps:
        primary = a.get("detail") or a.get("ios") or a.get("android")
        external = not a.get("detail")
        attrs = ' target="_blank" rel="noopener"' if external else ""
        name = html.escape(a["title"])
        stores = []
        if a.get("ios"):
            stores.append(f'<a href="{html.escape(a["ios"])}" target="_blank" rel="noopener">App Store</a>')
        if a.get("android"):
            stores.append(f'<a href="{html.escape(a["android"])}" target="_blank" rel="noopener">Google Play</a>')
        out.append(
            "                <li class=\"app-item\">"
            f"<a class=\"app-main\" href=\"{html.escape(primary)}\"{attrs}>"
            f"<img src=\"{a['icon']}\" alt=\"\" width=\"56\" height=\"56\" loading=\"lazy\" decoding=\"async\">"
            f"<span class=\"app-name\"{lang_attr(a['title'])}>{name}</span></a>"
            f"<span class=\"app-meta\"><span>{dot_date(a['date'])}</span>{''.join(stores)}</span>"
            "</li>"
        )
    return "\n".join(out)


def channel_block(channels):
    out = []
    for c in channels:
        out.append(
            "                        <li class=\"channel-item\">"
            f"<a class=\"channel-link\" href=\"{html.escape(c['url'])}\" target=\"_blank\" rel=\"noopener\">"
            f"<img src=\"{c['avatar']}\" alt=\"\" width=\"64\" height=\"64\" loading=\"lazy\" decoding=\"async\">"
            f"<strong{lang_attr(c['name'])}>{html.escape(c['name'])}</strong>"
            f"<span>{html.escape(c['topic'])}</span></a>"
            "</li>"
        )
    return "\n".join(out)


def main():
    doc = json.loads(DATA.read_text(encoding="utf-8"))
    apps = sorted(doc["apps"], key=lambda a: (a["date"], a["name"]))
    channels = json.loads(CHANNELS.read_text(encoding="utf-8")).get("channels", []) if CHANNELS.exists() else []
    stats = compute(apps, channels, doc["checked"])

    text = INDEX.read_text(encoding="utf-8")
    text = re.sub(r"(/\* apps-data:start \*/\n)[\s\S]*?(/\* apps-data:end \*/)", lambda m: m.group(1) + data_block(apps, stats, channels) + "\n" + m.group(2), text)
    text = re.sub(r"(<!-- apps-list:start -->\n)[\s\S]*?(<!-- apps-list:end -->)", lambda m: m.group(1) + list_block(apps) + "\n" + m.group(2), text)
    block = channel_block(channels)
    text = re.sub(r"(<!-- channels-list:start -->\n)[\s\S]*?(<!-- channels-list:end -->)", lambda m: m.group(1) + block + ("\n" if block else "") + m.group(2), text)
    # 채널 목록이 비어 있으면 구역을 통째로 숨긴다.
    text = re.sub(r'<section class="channels" id="channels"( hidden)?', '<section class="channels" id="channels"' + ("" if channels else " hidden"), text)
    for key, value in stats.items():
        text = re.sub(rf'(data-stat="{key}"[^>]*>)[^<]*(<)', lambda m, v=value: f"{m.group(1)}{html.escape(str(v), quote=False)}{m.group(2)}", text)
    text = re.sub(r"\b\d+ APPS\b", f"{stats['total']} APPS", text)
    text = re.sub(r"\b\d+ apps\b", f"{stats['total']} apps", text)
    text = re.sub(r"\b\d+ YouTube channels\b", f"{stats['channels']} YouTube channels", text)
    text = re.sub(r"\b\d{4}\.\d{2} — \d{4}\.\d{2}(?=\. \d+ YouTube)", stats["span"], text)
    INDEX.write_text(text, encoding="utf-8")
    print(json.dumps(stats, ensure_ascii=False))


if __name__ == "__main__":
    main()
