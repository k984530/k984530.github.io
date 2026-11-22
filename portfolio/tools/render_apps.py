#!/usr/bin/env python3
"""Fill the app data, HTML list and counts in /index.html from portfolio/apps.json.

Run from the repository root after updating portfolio/apps.json:

    python3 portfolio/tools/render_apps.py

The inline `projects` array keeps the `{ name: "...", ios: "...", android: "...", detail: "..." }`
shape that scripts/verify-*.mjs read from index.html.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INDEX = ROOT / "index.html"
DATA = ROOT / "portfolio" / "apps.json"

doc = json.loads(DATA.read_text(encoding="utf-8"))
apps = sorted(doc["apps"], key=lambda a: (a["date"], a["name"]))
checked = doc["checked"]
this_year = int(checked[:4])

stats = {
    "total": len(apps),
    "appStore": sum(1 for a in apps if a.get("ios")),
    "googlePlay": sum(1 for a in apps if a.get("android")),
    "both": sum(1 for a in apps if a.get("ios") and a.get("android")),
    "firstRelease": int(apps[0]["date"][:4]),
    "thisYear": this_year,
    "thisYearCount": sum(1 for a in apps if int(a["date"][:4]) == this_year),
    "checked": checked,
}


def js_str(value):
    return json.dumps(value, ensure_ascii=False)


def data_block():
    lines = [
        f"        // {checked} 조회: App Store(lookup us+kr) {stats['appStore']} · Google Play(공개 페이지 200) {stats['googlePlay']} · 합계 {stats['total']}",
        "        // 고칠 때는 portfolio/apps.json을 바꾸고 python3 portfolio/tools/render_apps.py를 돌린다.",
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
        lines.append("            { " + ", ".join(parts) + " },")
    lines[-1] = lines[-1].rstrip(",")
    lines.append("        ];")
    lines.append("        const appStats = " + json.dumps(stats, ensure_ascii=False) + ";")
    return "\n".join(lines)


def list_block():
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
            f"<span class=\"app-name\">{name}</span></a>"
            f"<span class=\"app-meta\"><span>{a['date'][:4]}</span>{''.join(stores)}</span>"
            "</li>"
        )
    return "\n".join(out)


text = INDEX.read_text(encoding="utf-8")
text = re.sub(r"(/\* apps-data:start \*/\n)[\s\S]*?(/\* apps-data:end \*/)", lambda m: m.group(1) + data_block() + "\n" + m.group(2), text)
text = re.sub(r"(<!-- apps-list:start -->\n)[\s\S]*?(<!-- apps-list:end -->)", lambda m: m.group(1) + list_block() + "\n" + m.group(2), text)
for key, value in stats.items():
    text = re.sub(rf'(data-stat="{key}"[^>]*>)[^<]*(<)', lambda m, v=value: f"{m.group(1)}{v}{m.group(2)}", text)
text = re.sub(r"앱 \d+개", f"앱 {stats['total']}개", text)
INDEX.write_text(text, encoding="utf-8")
print(json.dumps(stats, ensure_ascii=False))
