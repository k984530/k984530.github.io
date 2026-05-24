import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile("AppHub/index.html", "utf8");
const promptPackCheckout = "https://gumroad.com/checkout?product=nffhl&quantity=1";
const creatorDepositCheckout = "https://gumroad.com/checkout?product=ithrs&quantity=1";
const screenshotBrief = "../Kova/ai-app-store-screenshot-service/?source=apphub&package=launch-visual-sprint&platform=both&slots=8&aov=100000&appUrl=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.AppHub#screenshotBriefBuilder";
const scopeReadinessGate = "../Kova/10m-scope-lock/#scopeDepositReadiness";

assert.match(html, /id="apphubLaunchLane"/, "AppHub must expose a launch-lane selector");
assert.match(html, /data-path="promptPack"/, "AppHub selector must include the prompt-pack path");
assert.match(html, /data-path="screenshots"/, "AppHub selector must include the screenshot-service path");
assert.match(html, /data-path="creatorCampaign"/, "AppHub selector must include the creator-campaign deposit path");
assert.match(html, /data-path="portfolioSystem"/, "AppHub selector must include the portfolio-system scope path");
assert.ok(html.includes(promptPackCheckout), "AppHub selector must keep the prompt pack Gumroad checkout");
assert.ok(html.includes(creatorDepositCheckout), "AppHub selector must keep the creator deposit Gumroad checkout");
assert.ok(html.includes(screenshotBrief), "AppHub selector must keep the source-aware screenshot brief link");
assert.ok(html.includes(scopeReadinessGate), "AppHub selector must route the scope deposit through readiness");
assert.equal(html.includes("https://gumroad.com/checkout?product=vrtiu"), false, "AppHub must not expose raw scope-deposit checkout");

const scriptMatch = html.match(/<script>\s*([\s\S]*?const apphubLaunchPaths[\s\S]*?)\s*<\/script>/);
assert.ok(scriptMatch, "AppHub launch-lane script must define apphubLaunchPaths");

const listeners = new Map();
const elements = new Map();

function addElement(id, properties = {}) {
  const element = {
    classList: {
      classes: new Set(),
      toggle(className, shouldHaveClass) {
        if (shouldHaveClass) {
          this.classes.add(className);
        } else {
          this.classes.delete(className);
        }
      },
    },
    href: "",
    textContent: "",
    setAttribute(name, value) {
      this[name] = value;
    },
    ...properties,
    addEventListener(eventName, callback) {
      const key = `${id}:${eventName}`;
      listeners.set(key, [...(listeners.get(key) || []), callback]);
    },
  };
  elements.set(id, element);
  return element;
}

function fire(id, eventName) {
  for (const callback of listeners.get(`${id}:${eventName}`) || []) {
    callback();
  }
}

const optionElements = [
  addElement("promptPath", { dataset: { path: "promptPack" } }),
  addElement("screenshotPath", { dataset: { path: "screenshots" } }),
  addElement("campaignPath", { dataset: { path: "creatorCampaign" } }),
  addElement("portfolioPath", { dataset: { path: "portfolioSystem" } }),
];

addElement("apphubLaunchPrice");
addElement("apphubLaunchTitle");
addElement("apphubLaunchCopy");
addElement("apphubLaunchPrimary");
addElement("apphubLaunchSecondary");

vm.runInNewContext(
  scriptMatch[1],
  {
    document: {
      querySelectorAll: (selector) => (selector === "[data-apphub-launch-option]" ? optionElements : []),
      getElementById: (id) => elements.get(id) ?? null,
    },
  },
  { timeout: 1000 },
);

assert.equal(elements.get("apphubLaunchTitle").textContent, "Start with the prompt pack");
assert.equal(elements.get("apphubLaunchPrimary").href, promptPackCheckout);
assert.equal(elements.get("apphubLaunchSecondary").href, screenshotBrief);
assert.equal(elements.get("promptPath").ariaPressed, "true");

fire("screenshotPath", "click");
assert.equal(elements.get("apphubLaunchTitle").textContent, "Turn AppHub planning into store screenshots");
assert.equal(elements.get("apphubLaunchPrimary").href, screenshotBrief);
assert.equal(elements.get("apphubLaunchSecondary").href, promptPackCheckout);
assert.equal(elements.get("screenshotPath").ariaPressed, "true");

fire("campaignPath", "click");
assert.equal(elements.get("apphubLaunchTitle").textContent, "Commission the creator campaign system");
assert.equal(elements.get("apphubLaunchPrimary").href, creatorDepositCheckout);
assert.match(elements.get("apphubLaunchCopy").textContent, /2 extra prompt recipes/);
assert.equal(elements.get("campaignPath").ariaPressed, "true");

fire("portfolioPath", "click");
assert.equal(elements.get("apphubLaunchTitle").textContent, "Scope the portfolio revenue system");
assert.equal(elements.get("apphubLaunchPrimary").href, scopeReadinessGate);
assert.match(elements.get("apphubLaunchCopy").textContent, /readiness gate/);
assert.equal(elements.get("portfolioPath").ariaPressed, "true");

console.log("AppHub launch-lane verification passed");
