import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import vm from "node:vm";

const iosUrl = "https://apps.apple.com/us/app/kova-ai-photo-editor/id6766026914";
const androidUrl = "https://play.google.com/store/apps/details?id=com.aly.kova";
const contactEmail = "alyduho984530@gmail.com";

function verifyReadinessCheckerRuntime(html) {
  const scriptMatch = html.match(/<script>\s*([\s\S]*?const corporateBriefPackages[\s\S]*?)\s*<\/script>/);
  assert.ok(scriptMatch, "Corporate headshot page must include the corporate brief builder script");

  const listeners = new Map();
  const elements = new Map();
  const addElement = (id, properties = {}) => {
    const element = {
      checked: false,
      href: "",
      textContent: "",
      value: "",
      options: [],
      selectedIndex: 0,
      ...properties,
      addEventListener: (eventName, callback) => {
        const key = `${id}:${eventName}`;
        listeners.set(key, [...(listeners.get(key) || []), callback]);
      },
    };
    elements.set(id, element);
    return element;
  };
  const fire = (id, eventName) => {
    for (const callback of listeners.get(`${id}:${eventName}`) || []) {
      callback();
    }
  };

  addElement("corporateBriefForm");
  addElement("corporateBriefPackage", {
    value: "team-profile-pack",
    options: [
      { dataset: { price: "990000" }, textContent: "Founder profile refresh - 990,000 KRW" },
      { dataset: { price: "2900000" }, textContent: "Team profile pack - 2,900,000 KRW" },
      { dataset: { price: "9900000" }, textContent: "Hiring page visual system - 9,900,000 KRW+" },
    ],
  });
  addElement("corporateBriefSource", { value: "Corporate headshot page" });
  addElement("corporateBriefTeamSize", { value: "6" });
  addElement("corporateBriefCompanyPage", { value: "https://example.com/team" });
  addElement("corporateBriefUseCase", { value: "Employee directory refresh" });
  addElement("corporateBriefDeadline", { value: "This month" });
  addElement("corporateBriefNotes", { value: "" });
  addElement("corporateBriefCostPerPerson");
  addElement("corporateBriefPackageFit");
  addElement("corporateInvoicePreview");
  addElement("readinessInvoiceLink");
  addElement("readinessScore");
  addElement("readinessRecommendation");
  addElement("readinessFaceVisible", { checked: true });
  addElement("readinessLighting", { checked: true });
  addElement("readinessNoObstruction");
  addElement("readinessReferenceUrl");

  vm.runInNewContext(
    scriptMatch[1],
    {
      document: {
        getElementById: (id) => elements.get(id) ?? null,
      },
      encodeURIComponent,
      URLSearchParams,
      window: {
        location: {
          search: "?source=hiring&package=hiring-page-visual-system&teamSize=12",
        },
      },
      Intl,
    },
    { timeout: 1000 },
  );

  assert.equal(elements.get("corporateBriefPackage").value, "hiring-page-visual-system");
  assert.equal(elements.get("corporateBriefSource").value, "Hiring page headshots page");
  assert.equal(elements.get("corporateBriefTeamSize").value, "12");
  assert.equal(elements.get("corporateBriefCostPerPerson").textContent, "Estimated per-person sprint cost: 825,000 KRW");
  assert.match(elements.get("corporateInvoicePreview").value, /Selected package: Hiring page visual system - 9,900,000 KRW\+/);
  assert.match(elements.get("corporateInvoicePreview").value, /Referral source: Hiring page headshots page/);
  assert.match(elements.get("corporateInvoicePreview").value, /Team size: 12/);
  assert.match(elements.get("corporateInvoicePreview").value, /Estimated per-person sprint cost: 825,000 KRW/);
  assert.equal(elements.get("readinessScore").textContent, "2/4 ready");
  assert.match(elements.get("corporateInvoicePreview").value, /Photo readiness: 2\/4 ready/);
  assert.match(decodeURIComponent(elements.get("readinessInvoiceLink").href), /Kova Corporate Headshot Sprint invoice request/);
  assert.match(decodeURIComponent(elements.get("readinessInvoiceLink").href), /Photo readiness: 2\/4 ready/);

  elements.get("readinessNoObstruction").checked = true;
  fire("readinessNoObstruction", "change");
  elements.get("readinessReferenceUrl").checked = true;
  fire("readinessReferenceUrl", "change");

  assert.equal(elements.get("readinessScore").textContent, "4/4 ready");
  assert.equal(elements.get("readinessRecommendation").textContent, "These photos are ready for invoice review.");
  assert.match(elements.get("corporateInvoicePreview").value, /Photo readiness: 4\/4 ready/);
  assert.match(elements.get("corporateInvoicePreview").value, /company or LinkedIn reference URL ready/);
  assert.match(decodeURIComponent(elements.get("readinessInvoiceLink").href), /Photo readiness: 4\/4 ready/);

  elements.get("corporateBriefPackage").value = "team-profile-pack";
  fire("corporateBriefPackage", "change");
  elements.get("corporateBriefTeamSize").value = "4";
  fire("corporateBriefForm", "input");

  assert.equal(elements.get("corporateBriefCostPerPerson").textContent, "Estimated per-person sprint cost: 725,000 KRW");
  assert.match(elements.get("corporateBriefPackageFit").textContent, /Team profile pack is usually best for 2 to 8 people/);
  assert.match(elements.get("corporateInvoicePreview").value, /Selected package: Team profile pack - 2,900,000 KRW/);
  assert.match(elements.get("corporateInvoicePreview").value, /Team size: 4/);
  assert.match(elements.get("corporateInvoicePreview").value, /Estimated per-person sprint cost: 725,000 KRW/);
  assert.match(decodeURIComponent(elements.get("readinessInvoiceLink").href), /Estimated per-person sprint cost: 725,000 KRW/);
}

function verifyTeamSourcePacketRuntime(html) {
  const scriptMatch = html.match(/<script>\s*([\s\S]*?const packageOptions[\s\S]*?)\s*<\/script>/);
  assert.ok(scriptMatch, "Team Headshot Sprint page must include the team source packet script");

  const listeners = new Map();
  const elements = new Map();
  const addElement = (id, properties = {}) => {
    const element = {
      checked: false,
      dataset: {},
      href: "",
      textContent: "",
      value: "",
      ...properties,
      addEventListener: (eventName, callback) => {
        const key = `${id}:${eventName}`;
        listeners.set(key, [...(listeners.get(key) || []), callback]);
      },
    };
    elements.set(id, element);
    return element;
  };
  const fire = (id, eventName) => {
    for (const callback of listeners.get(`${id}:${eventName}`) || []) {
      callback();
    }
  };

  addElement("teamBriefBuilder");
  addElement("teamBriefEmailPreview");
  addElement("teamBriefInvoiceLink");
  addElement("teamBriefPackageFit");
  addElement("teamBriefUsageScope");
  addElement("teamBriefPackage", { value: "founder-profile-refresh" });
  addElement("teamBriefBuyer");
  addElement("teamBriefTeamSize", { value: "1" });
  addElement("teamBriefCompanyPage");
  addElement("teamBriefDeadline");
  addElement("teamBriefNotes");
  addElement("teamSizeCalculatorInput", { value: "6" });
  addElement("teamCostPackageName");
  addElement("teamCostTotal");
  addElement("teamCostPerPerson");
  addElement("teamCostFitNote");
  addElement("teamSourcePacketSize", { value: "6" });
  addElement("sourcePacketUseCase", { value: "LinkedIn refresh" });
  addElement("sourcePacketPhotosReady");
  addElement("sourcePacketReferenceReady");
  addElement("sourcePacketDecisionOwner");
  addElement("sourcePacketPhotoCount");
  addElement("sourcePacketStatus");
  addElement("sourcePacketInvoiceNote");
  addElement("sourcePacketRecommendation");

  vm.runInNewContext(
    scriptMatch[1],
    {
      document: {
        getElementById: (id) => elements.get(id) ?? null,
      },
      encodeURIComponent,
      Intl,
    },
    { timeout: 1000 },
  );

  assert.equal(elements.get("teamBriefPackage").value, "team-profile-pack");
  assert.match(elements.get("teamBriefEmailPreview").value, /Selected package: Team profile pack - 2,900,000 KRW/);
  assert.match(elements.get("teamBriefEmailPreview").value, /Team size: 6/);
  assert.match(elements.get("teamBriefEmailPreview").value, /Source packet: 0\/3 packet ready; 6 source photos needed/);
  assert.match(decodeURIComponent(elements.get("teamBriefInvoiceLink").href), /Source packet: 0\/3 packet ready; 6 source photos needed/);

  elements.get("teamSourcePacketSize").value = "10";
  fire("teamSourcePacketSize", "input");

  assert.equal(elements.get("teamBriefPackage").value, "hiring-page-visual-system");
  assert.match(elements.get("teamBriefEmailPreview").value, /Selected package: Hiring page visual system - 9,900,000 KRW\+/);
  assert.match(elements.get("teamBriefEmailPreview").value, /Team size: 10/);
  assert.match(elements.get("teamBriefEmailPreview").value, /Source packet: 0\/3 packet ready; 10 source photos needed/);

  for (const id of ["sourcePacketPhotosReady", "sourcePacketReferenceReady", "sourcePacketDecisionOwner"]) {
    elements.get(id).checked = true;
    fire(id, "change");
  }

  assert.equal(elements.get("sourcePacketStatus").textContent, "3/3 packet ready");
  assert.equal(elements.get("sourcePacketRecommendation").textContent, "This source packet is ready for invoice review.");
  assert.match(elements.get("teamBriefEmailPreview").value, /Source packet: 3\/3 packet ready; 10 source photos needed/);
  assert.match(decodeURIComponent(elements.get("teamBriefInvoiceLink").href), /Source packet: 3\/3 packet ready; 10 source photos needed/);
  assert.match(decodeURIComponent(elements.get("teamBriefInvoiceLink").href), /decision owner ready/);
}

function verifyProHeadshotReadinessRuntime(html) {
  const scriptMatch = html.match(/<script>\s*([\s\S]*?const proPackageLabels[\s\S]*?)\s*<\/script>/);
  assert.ok(scriptMatch, "Profile headshot page must include the professional readiness script");

  const listeners = new Map();
  const elements = new Map();
  const addElement = (id, properties = {}) => {
    const element = {
      checked: false,
      href: "",
      textContent: "",
      value: "",
      options: [],
      selectedIndex: 0,
      ...properties,
      addEventListener: (eventName, callback) => {
        const key = `${id}:${eventName}`;
        listeners.set(key, [...(listeners.get(key) || []), callback]);
      },
    };
    elements.set(id, element);
    return element;
  };
  const fire = (id, eventName) => {
    for (const callback of listeners.get(`${id}:${eventName}`) || []) {
      callback();
    }
  };

  addElement("proHeadshotForm");
  addElement("proHeadshotPackage", {
    value: "professional-refresh",
    options: [
      { dataset: { price: "290000" }, textContent: "Professional refresh - 290,000 KRW" },
      { dataset: { price: "990000" }, textContent: "Founder profile kit - 990,000 KRW" },
      { dataset: { price: "2900000" }, textContent: "Market-facing visual system - 2,900,000 KRW+" },
    ],
  });
  addElement("proHeadshotSource", { value: "CryptoAI" });
  addElement("proHeadshotUse", { value: "Finance creator profile" });
  addElement("proHeadshotAov", { value: "100000" });
  addElement("proHeadshotProfileLink", { value: "https://example.com/profile" });
  addElement("proHeadshotDeadline", { value: "This week" });
  addElement("proHeadshotNotes", { value: "" });
  addElement("proHeadshotEmailPreview");
  addElement("proHeadshotInvoiceLink");
  addElement("proReadinessFaceVisible", { checked: true });
  addElement("proReadinessLighting", { checked: true });
  addElement("proReadinessNoObstruction");
  addElement("proReadinessReferenceReady");
  addElement("proReadinessScore");
  addElement("proReadinessRecommendation");
  addElement("proReadinessInvoiceNote");

  vm.runInNewContext(
    scriptMatch[1],
    {
      document: {
        getElementById: (id) => elements.get(id) ?? null,
      },
      encodeURIComponent,
      URLSearchParams,
      window: {
        location: {
          search: "?source=cryptoai&package=founder-profile-kit&use=Founder%20or%20analyst%20bio&aov=125000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.CryptoAI&deadline=This%20week&notes=Source%20app%20visitor%20wants%20professional%20finance%20headshot",
        },
      },
    },
    { timeout: 1000 },
  );

  assert.equal(elements.get("proHeadshotPackage").value, "founder-profile-kit");
  assert.equal(elements.get("proHeadshotSource").value, "CryptoAI");
  assert.equal(elements.get("proHeadshotUse").value, "Founder or analyst bio");
  assert.equal(elements.get("proHeadshotAov").value, "125000");
  assert.equal(elements.get("proHeadshotProfileLink").value, "https://play.google.com/store/apps/details?id=com.aly.CryptoAI");
  assert.equal(elements.get("proHeadshotDeadline").value, "This week");
  assert.equal(elements.get("proHeadshotNotes").value, "Source app visitor wants professional finance headshot");
  assert.equal(elements.get("proReadinessScore").textContent, "2/4 ready");
  assert.match(elements.get("proReadinessRecommendation").textContent, /Add blur-free source photos and a reference profile/);
  assert.match(elements.get("proHeadshotEmailPreview").textContent, /Source photo readiness: 2\/4 ready/);
  assert.match(elements.get("proHeadshotEmailPreview").textContent, /Selected package: Founder profile kit - 990,000 KRW/);
  assert.match(elements.get("proHeadshotEmailPreview").textContent, /Referral source: CryptoAI/);
  assert.match(elements.get("proHeadshotEmailPreview").textContent, /Primary use: Founder or analyst bio/);
  assert.match(elements.get("proHeadshotEmailPreview").textContent, /https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.aly\.CryptoAI/);
  assert.match(elements.get("proHeadshotEmailPreview").textContent, /Average paid order value: 125,000 KRW/);
  assert.match(elements.get("proHeadshotEmailPreview").textContent, /Estimated paid orders to recover fee: about 8/);
  assert.match(decodeURIComponent(elements.get("proHeadshotInvoiceLink").href), /Source photo readiness: 2\/4 ready/);

  elements.get("proReadinessNoObstruction").checked = true;
  fire("proReadinessNoObstruction", "change");
  elements.get("proReadinessReferenceReady").checked = true;
  fire("proReadinessReferenceReady", "change");

  assert.equal(elements.get("proReadinessScore").textContent, "4/4 ready");
  assert.equal(elements.get("proReadinessRecommendation").textContent, "This source-photo set is ready for professional invoice review.");
  assert.match(elements.get("proHeadshotEmailPreview").textContent, /Source photo readiness: 4\/4 ready/);
  assert.match(decodeURIComponent(elements.get("proHeadshotInvoiceLink").href), /reference profile ready/);
}

function verifyDatingSourceReadinessRuntime(html) {
  const scriptMatch = html.match(/<script>\s*([\s\S]*?const datingReadinessItems[\s\S]*?)\s*<\/script>/);
  assert.ok(scriptMatch, "Dating profile page must include the source readiness script");

  const listeners = new Map();
  const elements = new Map();
  const addElement = (id, properties = {}) => {
    const element = {
      checked: false,
      href: "",
      textContent: "",
      value: "",
      options: [],
      selectedIndex: 0,
      ...properties,
      addEventListener: (eventName, callback) => {
        const key = `${id}:${eventName}`;
        listeners.set(key, [...(listeners.get(key) || []), callback]);
      },
    };
    elements.set(id, element);
    return element;
  };
  const fire = (id, eventName) => {
    for (const callback of listeners.get(`${id}:${eventName}`) || []) {
      callback();
    }
  };

  addElement("datingSprintForm");
  addElement("datingSprintPackage", {
    value: "profile-refresh",
    options: [
      { dataset: { price: "149000" }, textContent: "Profile refresh - 149,000 KRW" },
      { dataset: { price: "390000" }, textContent: "Social set - 390,000 KRW" },
      { dataset: { price: "990000" }, textContent: "Creator profile system - 990,000 KRW" },
    ],
  });
  addElement("datingSprintSource", { value: "Lookey" });
  addElement("datingSprintGoal", { value: "Dating app profile refresh" });
  addElement("datingSprintAov", { value: "50000" });
  addElement("datingSprintProfileLink", { value: "https://example.com/profile" });
  addElement("datingSprintDeadline", { value: "This week" });
  addElement("datingSprintNotes", { value: "" });
  addElement("datingSprintEmailPreview");
  addElement("datingSprintInvoiceLink");
  addElement("datingReadinessFaceVisible", { checked: true });
  addElement("datingReadinessLighting", { checked: true });
  addElement("datingReadinessPhotoVariety");
  addElement("datingReadinessReferenceReady");
  addElement("datingReadinessScore");
  addElement("datingReadinessRecommendation");
  addElement("datingReadinessInvoiceNote");

  vm.runInNewContext(
    scriptMatch[1],
    {
      document: {
        getElementById: (id) => elements.get(id) ?? null,
      },
      encodeURIComponent,
      URLSearchParams,
      window: {
        location: {
          search: "?source=friendai&package=social-set&goal=Social%20bio%20portrait%20set&aov=75000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.FriendAI&deadline=This%20week&notes=Source%20app%20visitor%20wants%20profile%20photo%20refresh",
        },
      },
    },
    { timeout: 1000 },
  );

  assert.equal(elements.get("datingSprintPackage").value, "social-set");
  assert.equal(elements.get("datingSprintSource").value, "FriendAI");
  assert.equal(elements.get("datingSprintGoal").value, "Social bio portrait set");
  assert.equal(elements.get("datingSprintAov").value, "75000");
  assert.equal(elements.get("datingSprintProfileLink").value, "https://play.google.com/store/apps/details?id=com.aly.FriendAI");
  assert.equal(elements.get("datingSprintDeadline").value, "This week");
  assert.equal(elements.get("datingSprintNotes").value, "Source app visitor wants profile photo refresh");
  assert.equal(elements.get("datingReadinessScore").textContent, "2/4 ready");
  assert.match(elements.get("datingReadinessRecommendation").textContent, /Add varied source photos and a reference style/);
  assert.match(elements.get("datingSprintEmailPreview").textContent, /Profile photo readiness: 2\/4 ready/);
  assert.match(elements.get("datingSprintEmailPreview").textContent, /Selected package: Social set - 390,000 KRW/);
  assert.match(elements.get("datingSprintEmailPreview").textContent, /Referral source: FriendAI/);
  assert.match(elements.get("datingSprintEmailPreview").textContent, /Primary goal: Social bio portrait set/);
  assert.match(elements.get("datingSprintEmailPreview").textContent, /https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.aly\.FriendAI/);
  assert.match(elements.get("datingSprintEmailPreview").textContent, /Average paid order value: 75,000 KRW/);
  assert.match(elements.get("datingSprintEmailPreview").textContent, /Estimated paid orders to recover fee: about 6/);
  assert.match(decodeURIComponent(elements.get("datingSprintInvoiceLink").href), /Profile photo readiness: 2\/4 ready/);

  elements.get("datingReadinessPhotoVariety").checked = true;
  fire("datingReadinessPhotoVariety", "change");
  elements.get("datingReadinessReferenceReady").checked = true;
  fire("datingReadinessReferenceReady", "change");

  assert.equal(elements.get("datingReadinessScore").textContent, "4/4 ready");
  assert.equal(elements.get("datingReadinessRecommendation").textContent, "This profile source set is ready for invoice review.");
  assert.match(elements.get("datingSprintEmailPreview").textContent, /Profile photo readiness: 4\/4 ready/);
  assert.match(decodeURIComponent(elements.get("datingSprintInvoiceLink").href), /reference style ready/);
}

function verifyPetPortraitSprintRuntime(html) {
  const scriptMatch = html.match(/<script>\s*([\s\S]*?const petPortraitPackages[\s\S]*?)\s*<\/script>/);
  assert.ok(scriptMatch, "Pet portrait page must include the pet portrait sprint script");

  const listeners = new Map();
  const elements = new Map();
  const addElement = (id, properties = {}) => {
    const element = {
      href: "",
      textContent: "",
      value: "",
      ...properties,
      addEventListener: (eventName, callback) => {
        const key = `${id}:${eventName}`;
        listeners.set(key, [...(listeners.get(key) || []), callback]);
      },
    };
    elements.set(id, element);
    return element;
  };
  const fire = (id, eventName) => {
    for (const callback of listeners.get(`${id}:${eventName}`) || []) {
      callback();
    }
  };

  addElement("petPortraitForm");
  addElement("petPortraitPackage", { value: "pet-memory" });
  addElement("petPortraitSource", { value: "Direct pet portrait page" });
  addElement("petPortraitGoal", { value: "Pet memory portrait" });
  addElement("petPortraitPetType", { value: "Cat" });
  addElement("petPortraitAov", { value: "50000" });
  addElement("petPortraitPhotoLink", { value: "" });
  addElement("petPortraitDeadline", { value: "" });
  addElement("petPortraitNotes", { value: "" });
  addElement("petPortraitRecoveryOrders");
  addElement("petPortraitPackageFit");
  addElement("petPortraitEmailPreview");
  addElement("petPortraitInvoiceLink");

  vm.runInNewContext(
    scriptMatch[1],
    {
      document: {
        getElementById: (id) => elements.get(id) ?? null,
      },
      encodeURIComponent,
      URLSearchParams,
      window: {
        location: {
          search: "?source=dogsthoughts&package=social-pet-set&goal=Shareable%20pet%20portrait%20set&petType=Dog&aov=65000&petPhotoLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.DogsThoughts&deadline=This%20week&notes=Source%20app%20visitor%20wants%20dog%20portrait",
        },
      },
    },
    { timeout: 1000 },
  );

  assert.equal(elements.get("petPortraitPackage").value, "social-pet-set");
  assert.equal(elements.get("petPortraitSource").value, "DogsThoughts");
  assert.equal(elements.get("petPortraitGoal").value, "Shareable pet portrait set");
  assert.equal(elements.get("petPortraitPetType").value, "Dog");
  assert.equal(elements.get("petPortraitAov").value, "65000");
  assert.equal(elements.get("petPortraitPhotoLink").value, "https://play.google.com/store/apps/details?id=com.aly.DogsThoughts");
  assert.equal(elements.get("petPortraitDeadline").value, "This week");
  assert.equal(elements.get("petPortraitNotes").value, "Source app visitor wants dog portrait");
  assert.equal(elements.get("petPortraitRecoveryOrders").textContent, "Estimated paid orders to recover fee: about 6");
  assert.match(elements.get("petPortraitPackageFit").textContent, /Good fit when the visitor can share 3-6 clear pet photos/);
  assert.match(elements.get("petPortraitEmailPreview").textContent, /Selected package: Social pet set - 390,000 KRW/);
  assert.match(elements.get("petPortraitEmailPreview").textContent, /Referral source: DogsThoughts/);
  assert.match(elements.get("petPortraitEmailPreview").textContent, /Pet type: Dog/);
  assert.match(elements.get("petPortraitEmailPreview").textContent, /Average paid order value: 65,000 KRW/);
  assert.match(decodeURIComponent(elements.get("petPortraitInvoiceLink").href), /Kova Pet Portrait Sprint invoice request/);

  elements.get("petPortraitPackage").value = "pet-brand-system";
  fire("petPortraitPackage", "change");
  elements.get("petPortraitAov").value = "100000";
  fire("petPortraitForm", "input");

  assert.equal(elements.get("petPortraitRecoveryOrders").textContent, "Estimated paid orders to recover fee: about 10");
  assert.match(elements.get("petPortraitPackageFit").textContent, /Best for shops, creators, or communities/);
  assert.match(elements.get("petPortraitEmailPreview").textContent, /Selected package: Pet brand system - 990,000 KRW\+/);
}

function verifyJournalCoverSprintRuntime(html) {
  const scriptMatch = html.match(/<script>\s*([\s\S]*?const journalCoverPackages[\s\S]*?)\s*<\/script>/);
  assert.ok(scriptMatch, "Journal cover page must include the journal cover sprint script");

  const listeners = new Map();
  const elements = new Map();
  const addElement = (id, properties = {}) => {
    const element = {
      href: "",
      textContent: "",
      value: "",
      ...properties,
      addEventListener: (eventName, callback) => {
        const key = `${id}:${eventName}`;
        listeners.set(key, [...(listeners.get(key) || []), callback]);
      },
    };
    elements.set(id, element);
    return element;
  };
  const fire = (id, eventName) => {
    for (const callback of listeners.get(`${id}:${eventName}`) || []) {
      callback();
    }
  };

  addElement("journalCoverSprintForm");
  addElement("journalCoverPackage", { value: "private-memory-cover" });
  addElement("journalCoverSource", { value: "Direct journal cover page" });
  addElement("journalCoverGoal", { value: "Private diary memory cover" });
  addElement("journalCoverAov", { value: "50000" });
  addElement("journalCoverReference", { value: "" });
  addElement("journalCoverDeadline", { value: "" });
  addElement("journalCoverNotes", { value: "" });
  addElement("journalCoverRecoveryOrders");
  addElement("journalCoverPackageFit");
  addElement("journalCoverEmailPreview");
  addElement("journalCoverInvoiceLink");

  vm.runInNewContext(
    scriptMatch[1],
    {
      document: {
        getElementById: (id) => elements.get(id) ?? null,
      },
      encodeURIComponent,
      URLSearchParams,
      window: {
        location: {
          search: "?source=selah&package=reflection-card-set&goal=Prayer%20and%20gratitude%20reflection%20cards&aov=50000&reference=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.Selah&deadline=This%20week&notes=Source%20app%20visitor%20wants%20reflection%20card%20visuals",
        },
      },
    },
    { timeout: 1000 },
  );

  assert.equal(elements.get("journalCoverPackage").value, "reflection-card-set");
  assert.equal(elements.get("journalCoverSource").value, "Selah");
  assert.equal(elements.get("journalCoverGoal").value, "Prayer and gratitude reflection cards");
  assert.equal(elements.get("journalCoverAov").value, "50000");
  assert.equal(elements.get("journalCoverReference").value, "https://play.google.com/store/apps/details?id=com.aly.Selah");
  assert.equal(elements.get("journalCoverDeadline").value, "This week");
  assert.equal(elements.get("journalCoverNotes").value, "Source app visitor wants reflection card visuals");
  assert.equal(elements.get("journalCoverRecoveryOrders").textContent, "Estimated paid orders to recover fee: about 8");
  assert.match(elements.get("journalCoverPackageFit").textContent, /Good fit for prayer, gratitude, sleep, or wellness card sets/);
  assert.match(elements.get("journalCoverEmailPreview").textContent, /Selected package: Reflection card set - 390,000 KRW/);
  assert.match(elements.get("journalCoverEmailPreview").textContent, /Referral source: Selah/);
  assert.match(elements.get("journalCoverEmailPreview").textContent, /Primary goal: Prayer and gratitude reflection cards/);
  assert.match(elements.get("journalCoverEmailPreview").textContent, /https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.aly\.Selah/);
  assert.match(decodeURIComponent(elements.get("journalCoverInvoiceLink").href), /Kova Journal Cover Sprint invoice request/);
  assert.match(decodeURIComponent(elements.get("journalCoverInvoiceLink").href), /Reflection card set - 390,000 KRW/);

  elements.get("journalCoverPackage").value = "journal-visual-system";
  fire("journalCoverPackage", "change");
  elements.get("journalCoverAov").value = "100000";
  fire("journalCoverSprintForm", "input");

  assert.equal(elements.get("journalCoverRecoveryOrders").textContent, "Estimated paid orders to recover fee: about 10");
  assert.match(elements.get("journalCoverPackageFit").textContent, /Best for creators, paid communities, or app teams/);
  assert.match(elements.get("journalCoverEmailPreview").textContent, /Selected package: Journal visual system - 990,000 KRW\+/);
  assert.match(elements.get("journalCoverEmailPreview").textContent, /Average paid order value: 100,000 KRW/);
}

function verifyFashionStyleSprintRuntime(html) {
  const scriptMatch = html.match(/<script>\s*([\s\S]*?const styleProfilePackages[\s\S]*?)\s*<\/script>/);
  assert.ok(scriptMatch, "Fashion photo page must include the style profile sprint script");

  const listeners = new Map();
  const elements = new Map();
  const addElement = (id, properties = {}) => {
    const element = {
      href: "",
      textContent: "",
      value: "",
      options: [],
      selectedIndex: 0,
      ...properties,
      addEventListener: (eventName, callback) => {
        const key = `${id}:${eventName}`;
        listeners.set(key, [...(listeners.get(key) || []), callback]);
      },
    };
    elements.set(id, element);
    return element;
  };
  const fire = (id, eventName) => {
    for (const callback of listeners.get(`${id}:${eventName}`) || []) {
      callback();
    }
  };

  addElement("styleProfileSprintForm");
  addElement("styleProfilePackage", {
    value: "style-profile-refresh",
    options: [
      { dataset: { price: "149000" }, textContent: "Style profile refresh - 149,000 KRW" },
      { dataset: { price: "390000" }, textContent: "Outfit social set - 390,000 KRW" },
    ],
  });
  addElement("styleProfileSource", { value: "Fashion photo page" });
  addElement("styleProfileGoal", { value: "Dating or social profile refresh" });
  addElement("styleProfileAov", { value: "50000" });
  addElement("styleProfileReference", { value: "https://example.com/style" });
  addElement("styleProfileDeadline", { value: "This week" });
  addElement("styleProfileNotes", { value: "" });
  addElement("styleProfileEmailPreview");
  addElement("styleProfileInvoiceLink");

  vm.runInNewContext(
    scriptMatch[1],
    {
      document: {
        getElementById: (id) => elements.get(id) ?? null,
      },
      encodeURIComponent,
      URLSearchParams,
      window: {
        location: {
          search: "?source=modee&package=outfit-social-set&goal=Style%20profile%20picture%20set&aov=100000&reference=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.MODEE&deadline=This%20week&notes=Source%20app%20visitor%20wants%20style%20profile%20pictures",
        },
      },
    },
    { timeout: 1000 },
  );

  assert.equal(elements.get("styleProfilePackage").value, "outfit-social-set");
  assert.equal(elements.get("styleProfileSource").value, "MODEE");
  assert.equal(elements.get("styleProfileGoal").value, "Style profile picture set");
  assert.equal(elements.get("styleProfileAov").value, "100000");
  assert.equal(elements.get("styleProfileReference").value, "https://play.google.com/store/apps/details?id=com.aly.MODEE");
  assert.equal(elements.get("styleProfileDeadline").value, "This week");
  assert.equal(elements.get("styleProfileNotes").value, "Source app visitor wants style profile pictures");
  assert.match(elements.get("styleProfileEmailPreview").textContent, /Selected package: Outfit social set - 390,000 KRW/);
  assert.match(elements.get("styleProfileEmailPreview").textContent, /Referral source: MODEE/);
  assert.match(elements.get("styleProfileEmailPreview").textContent, /Primary goal: Style profile picture set/);
  assert.match(elements.get("styleProfileEmailPreview").textContent, /https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.aly\.MODEE/);
  assert.match(elements.get("styleProfileEmailPreview").textContent, /Estimated paid orders to recover fee: about 4/);
  assert.match(decodeURIComponent(elements.get("styleProfileInvoiceLink").href), /Kova Style Profile Sprint invoice request/);
  assert.match(decodeURIComponent(elements.get("styleProfileInvoiceLink").href), /Outfit social set - 390,000 KRW/);

  elements.get("styleProfileAov").value = "100000";
  fire("styleProfileSprintForm", "input");

  assert.match(elements.get("styleProfileEmailPreview").textContent, /Average paid order value: 100,000 KRW/);
  assert.match(elements.get("styleProfileEmailPreview").textContent, /Estimated paid orders to recover fee: about 4/);
  assert.match(decodeURIComponent(elements.get("styleProfileInvoiceLink").href), /Average paid order value: 100%2C000 KRW|Average paid order value: 100,000 KRW/);
}

function verifyLinkedInHeadshotSprintRuntime(html) {
  const scriptMatch = html.match(/<script>\s*([\s\S]*?const linkedinSprintPackages[\s\S]*?)\s*<\/script>/);
  assert.ok(scriptMatch, "LinkedIn photo page must include the LinkedIn Headshot Sprint script");

  const listeners = new Map();
  const elements = new Map();
  const addElement = (id, properties = {}) => {
    const element = {
      href: "",
      textContent: "",
      value: "",
      options: [],
      selectedIndex: 0,
      ...properties,
      addEventListener: (eventName, callback) => {
        const key = `${id}:${eventName}`;
        listeners.set(key, [...(listeners.get(key) || []), callback]);
      },
    };
    elements.set(id, element);
    return element;
  };
  const fire = (id, eventName) => {
    for (const callback of listeners.get(`${id}:${eventName}`) || []) {
      callback();
    }
  };

  addElement("linkedinSprintForm");
  addElement("linkedinSprintPackage", {
    value: "linkedin-profile-refresh",
    options: [
      { dataset: { price: "290000" }, textContent: "LinkedIn profile refresh - 290,000 KRW" },
      { dataset: { price: "990000" }, textContent: "Executive profile pack - 990,000 KRW" },
    ],
  });
  addElement("linkedinSprintSource", { value: "LinkedIn photo page" });
  addElement("linkedinSprintUse", { value: "LinkedIn or resume profile" });
  addElement("linkedinSprintAov", { value: "200000" });
  addElement("linkedinSprintProfileLink", { value: "https://example.com/linkedin" });
  addElement("linkedinSprintDeadline", { value: "This week" });
  addElement("linkedinSprintNotes", { value: "" });
  addElement("linkedinSprintEmailPreview");
  addElement("linkedinSprintInvoiceLink");

  vm.runInNewContext(
    scriptMatch[1],
    {
      document: {
        getElementById: (id) => elements.get(id) ?? null,
      },
      encodeURIComponent,
      URLSearchParams,
      window: {
        location: {
          search: "?source=linkedin&package=executive-profile-pack",
        },
      },
    },
    { timeout: 1000 },
  );

  assert.equal(elements.get("linkedinSprintPackage").value, "executive-profile-pack");
  assert.equal(elements.get("linkedinSprintSource").value, "LinkedIn photo page");
  assert.match(elements.get("linkedinSprintEmailPreview").textContent, /Selected package: Executive profile pack - 990,000 KRW/);
  assert.match(elements.get("linkedinSprintEmailPreview").textContent, /Referral source: LinkedIn photo page/);
  assert.match(elements.get("linkedinSprintEmailPreview").textContent, /Estimated paid orders to recover fee: about 5/);
  assert.match(decodeURIComponent(elements.get("linkedinSprintInvoiceLink").href), /Kova LinkedIn Headshot Sprint invoice request/);
  assert.match(decodeURIComponent(elements.get("linkedinSprintInvoiceLink").href), /Executive profile pack - 990,000 KRW/);

  elements.get("linkedinSprintAov").value = "300000";
  fire("linkedinSprintForm", "input");

  assert.match(elements.get("linkedinSprintEmailPreview").textContent, /Average paid order value: 300,000 KRW/);
  assert.match(elements.get("linkedinSprintEmailPreview").textContent, /Estimated paid orders to recover fee: about 4/);
  assert.match(decodeURIComponent(elements.get("linkedinSprintInvoiceLink").href), /Average paid order value: 300,000 KRW/);
}

function verifyHiringPageBriefRuntime(html) {
  const scriptMatch = html.match(/<script>\s*([\s\S]*?const hiringBriefPackages[\s\S]*?)\s*<\/script>/);
  assert.ok(scriptMatch, "Hiring page headshots page must include the hiring brief builder script");

  const listeners = new Map();
  const elements = new Map();
  const addElement = (id, properties = {}) => {
    const element = {
      href: "",
      textContent: "",
      value: "",
      options: [],
      selectedIndex: 0,
      ...properties,
      addEventListener: (eventName, callback) => {
        const key = `${id}:${eventName}`;
        listeners.set(key, [...(listeners.get(key) || []), callback]);
      },
    };
    elements.set(id, element);
    return element;
  };
  const fire = (id, eventName) => {
    for (const callback of listeners.get(`${id}:${eventName}`) || []) {
      callback();
    }
  };

  addElement("hiringBriefForm");
  addElement("hiringBriefPackage", {
    value: "team-profile-pack",
    options: [
      { dataset: { price: "990000" }, textContent: "Founder profile refresh - 990,000 KRW" },
      { dataset: { price: "2900000" }, textContent: "Team profile pack - 2,900,000 KRW" },
      { dataset: { price: "9900000" }, textContent: "Hiring page visual system - 9,900,000 KRW+" },
    ],
  });
  addElement("hiringBriefSource", { value: "Hiring page headshots page" });
  addElement("hiringBriefTeamSize", { value: "9" });
  addElement("hiringBriefCompanyPage", { value: "https://example.com/careers" });
  addElement("hiringBriefGoal", { value: "Recruiting launch" });
  addElement("hiringBriefDeadline", { value: "This month" });
  addElement("hiringBriefNotes", { value: "" });
  addElement("hiringBriefEmailPreview");
  addElement("hiringBriefInvoiceLink");
  addElement("hiringBriefPackageFit");
  addElement("hiringBriefCostPerPerson");

  vm.runInNewContext(
    scriptMatch[1],
    {
      document: {
        getElementById: (id) => elements.get(id) ?? null,
      },
      encodeURIComponent,
      URLSearchParams,
      window: {
        location: {
          search: "?source=linkedin&package=hiring-page-visual-system&teamSize=12",
        },
      },
      Intl,
    },
    { timeout: 1000 },
  );

  assert.equal(elements.get("hiringBriefPackage").value, "hiring-page-visual-system");
  assert.equal(elements.get("hiringBriefSource").value, "LinkedIn photo page");
  assert.equal(elements.get("hiringBriefTeamSize").value, "12");
  assert.equal(elements.get("hiringBriefCostPerPerson").textContent, "Estimated per-person sprint cost: 825,000 KRW");
  assert.match(elements.get("hiringBriefEmailPreview").textContent, /Selected package: Hiring page visual system - 9,900,000 KRW\+/);
  assert.match(elements.get("hiringBriefEmailPreview").textContent, /Referral source: LinkedIn photo page/);
  assert.match(elements.get("hiringBriefEmailPreview").textContent, /Team size: 12/);
  assert.match(elements.get("hiringBriefEmailPreview").textContent, /Estimated per-person sprint cost: 825,000 KRW/);
  assert.match(decodeURIComponent(elements.get("hiringBriefInvoiceLink").href), /Kova Hiring Page Headshot Sprint invoice request/);

  elements.get("hiringBriefPackage").value = "team-profile-pack";
  fire("hiringBriefPackage", "change");
  elements.get("hiringBriefTeamSize").value = "4";
  fire("hiringBriefForm", "input");

  assert.equal(elements.get("hiringBriefCostPerPerson").textContent, "Estimated per-person sprint cost: 725,000 KRW");
  assert.match(elements.get("hiringBriefPackageFit").textContent, /Team profile pack is usually best for 2 to 8 people/);
  assert.match(elements.get("hiringBriefEmailPreview").textContent, /Selected package: Team profile pack - 2,900,000 KRW/);
  assert.match(elements.get("hiringBriefEmailPreview").textContent, /Team size: 4/);
  assert.match(elements.get("hiringBriefEmailPreview").textContent, /Estimated per-person sprint cost: 725,000 KRW/);
}

function verifyAppLaunchBriefRuntime(html) {
  const scriptMatch = html.match(/<script>\s*([\s\S]*?const launchBriefPackages[\s\S]*?)\s*<\/script>/);
  assert.ok(scriptMatch, "App launch visuals page must include the launch brief builder script");

  const listeners = new Map();
  const elements = new Map();
  const addElement = (id, properties = {}) => {
    const element = {
      href: "",
      textContent: "",
      value: "",
      options: [],
      selectedIndex: 0,
      ...properties,
      addEventListener: (eventName, callback) => {
        const key = `${id}:${eventName}`;
        listeners.set(key, [...(listeners.get(key) || []), callback]);
      },
    };
    elements.set(id, element);
    return element;
  };
  const fire = (id, eventName) => {
    for (const callback of listeners.get(`${id}:${eventName}`) || []) {
      callback();
    }
  };

  addElement("launchBriefForm");
  addElement("launchBriefPackage", {
    value: "launch-visual-sprint",
    options: [
      { dataset: { price: "990000" }, textContent: "Launch visual sprint - 990,000 KRW" },
      { dataset: { price: "2900000" }, textContent: "Creator campaign system - 2,900,000 KRW" },
      { dataset: { price: "9900000" }, textContent: "Portfolio revenue system - 9,900,000 KRW+" },
    ],
  });
  addElement("launchBriefSource", { value: "App launch visuals page" });
  addElement("launchBriefOutcome", { value: "Launch posts" });
  addElement("launchBriefAov", { value: "100000" });
  addElement("launchBriefAppUrl", { value: "https://example.com/app" });
  addElement("launchBriefLaunchDate", { value: "This month" });
  addElement("launchBriefMaterialsLink", { value: "https://example.com/brief" });
  addElement("launchBriefNotes", { value: "" });
  addElement("launchBriefRecoveryOrders");
  addElement("launchBriefPackageFit");
  addElement("launchBriefEmailPreview");
  addElement("launchBriefInvoiceLink");

  vm.runInNewContext(
    scriptMatch[1],
    {
      document: {
        getElementById: (id) => elements.get(id) ?? null,
      },
      encodeURIComponent,
      URLSearchParams,
      window: {
        location: {
          search: "?source=apphub&package=creator-campaign-system&aov=250000",
        },
      },
      Intl,
    },
    { timeout: 1000 },
  );

  assert.equal(elements.get("launchBriefPackage").value, "creator-campaign-system");
  assert.equal(elements.get("launchBriefSource").value, "AppHub landing page");
  assert.equal(elements.get("launchBriefAov").value, "250000");
  assert.equal(elements.get("launchBriefRecoveryOrders").textContent, "Estimated paid orders to recover sprint fee: about 12");
  assert.match(elements.get("launchBriefEmailPreview").textContent, /Selected package: Creator campaign system - 2,900,000 KRW/);
  assert.match(elements.get("launchBriefEmailPreview").textContent, /Referral source: AppHub landing page/);
  assert.match(elements.get("launchBriefEmailPreview").textContent, /Average paid order value: 250,000 KRW/);
  assert.match(elements.get("launchBriefEmailPreview").textContent, /Estimated paid orders to recover sprint fee: about 12/);
  assert.match(decodeURIComponent(elements.get("launchBriefInvoiceLink").href), /Kova App Launch Visual Sprint invoice request/);
  assert.match(decodeURIComponent(elements.get("launchBriefInvoiceLink").href), /Creator campaign system - 2,900,000 KRW/);

  elements.get("launchBriefPackage").value = "portfolio-revenue-system";
  fire("launchBriefPackage", "change");
  elements.get("launchBriefAov").value = "500000";
  fire("launchBriefForm", "input");

  assert.equal(elements.get("launchBriefRecoveryOrders").textContent, "Estimated paid orders to recover sprint fee: about 20");
  assert.match(elements.get("launchBriefPackageFit").textContent, /Portfolio revenue system is best when one launch page must support multiple apps or offers/);
  assert.match(elements.get("launchBriefEmailPreview").textContent, /Selected package: Portfolio revenue system - 9,900,000 KRW\+/);
  assert.match(elements.get("launchBriefEmailPreview").textContent, /Average paid order value: 500,000 KRW/);
  assert.match(elements.get("launchBriefEmailPreview").textContent, /Estimated paid orders to recover sprint fee: about 20/);
  assert.match(decodeURIComponent(elements.get("launchBriefInvoiceLink").href), /Estimated paid orders to recover sprint fee: about 20/);
}

function verifyScreenshotBriefRuntime(html) {
  const scriptMatch = html.match(/<script>\s*([\s\S]*?const packageLabels[\s\S]*?)\s*<\/script>/);
  assert.ok(scriptMatch, "Screenshot service page must include the screenshot brief builder script");

  const listeners = new Map();
  const elements = new Map();
  const addElement = (id, properties = {}) => {
    const element = {
      href: "",
      textContent: "",
      value: "",
      options: [],
      selectedIndex: 0,
      ...properties,
      addEventListener: (eventName, callback) => {
        const key = `${id}:${eventName}`;
        listeners.set(key, [...(listeners.get(key) || []), callback]);
      },
    };
    elements.set(id, element);
    return element;
  };
  const fire = (id, eventName) => {
    for (const callback of listeners.get(`${id}:${eventName}`) || []) {
      callback();
    }
  };

  addElement("screenshotBriefBuilder");
  addElement("screenshotPackage", {
    value: "launch-visual-sprint",
    options: [
      { dataset: { price: "990000" }, textContent: "Launch visual sprint - 990,000 KRW" },
      { dataset: { price: "2900000" }, textContent: "Creator campaign system - 2,900,000 KRW" },
      { dataset: { price: "9900000" }, textContent: "Portfolio revenue system - 9,900,000 KRW+" },
    ],
  });
  addElement("screenshotReferralSource", { value: "Screenshot service page" });
  addElement("screenshotPlatform", { value: "App Store screenshots" });
  addElement("screenshotAppUrl", { value: "" });
  addElement("screenshotValueProp", { value: "Show the result first, then explain the paid upgrade path." });
  addElement("screenshotSlotCount", { value: "6" });
  addElement("screenshotLaunchDate", { value: "" });
  addElement("screenshotAov", { value: "100000" });
  addElement("screenshotEmailPreview");
  addElement("screenshotRecoveryEstimate");
  addElement("screenshotInvoiceLink");

  vm.runInNewContext(
    scriptMatch[1],
    {
      document: {
        getElementById: (id) => elements.get(id) ?? null,
      },
      encodeURIComponent,
      URLSearchParams,
      window: {
        location: {
          search: "?source=apphub&package=creator-campaign-system&aov=250000&platform=both&slots=8&appUrl=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.AppHub",
        },
      },
      Intl,
    },
    { timeout: 1000 },
  );

  assert.equal(elements.get("screenshotPackage").value, "creator-campaign-system");
  assert.equal(elements.get("screenshotReferralSource").value, "AppHub landing page");
  assert.equal(elements.get("screenshotPlatform").value, "App Store and Google Play");
  assert.equal(elements.get("screenshotSlotCount").value, "8");
  assert.equal(elements.get("screenshotAov").value, "250000");
  assert.equal(elements.get("screenshotAppUrl").value, "https://play.google.com/store/apps/details?id=com.aly.AppHub");
  assert.equal(elements.get("screenshotRecoveryEstimate").textContent, "Estimated paid orders to recover fee: 12");
  assert.match(elements.get("screenshotEmailPreview").value, /Selected package: Creator campaign system - 2,900,000 KRW/);
  assert.match(elements.get("screenshotEmailPreview").value, /Referral source: AppHub landing page/);
  assert.match(elements.get("screenshotEmailPreview").value, /Store surface: App Store and Google Play/);
  assert.match(elements.get("screenshotEmailPreview").value, /App or store URL: https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.aly\.AppHub/);
  assert.match(elements.get("screenshotEmailPreview").value, /Average paid order value: 250,000 KRW/);
  assert.match(elements.get("screenshotEmailPreview").value, /Estimated paid orders to recover fee: 12/);
  assert.match(decodeURIComponent(elements.get("screenshotInvoiceLink").href), /Kova App Store Screenshot Service invoice request/);
  assert.match(decodeURIComponent(elements.get("screenshotInvoiceLink").href), /Referral source: AppHub landing page/);

  elements.get("screenshotPackage").value = "portfolio-revenue-system";
  fire("screenshotPackage", "change");
  elements.get("screenshotAov").value = "500000";
  fire("screenshotBriefBuilder", "input");

  assert.equal(elements.get("screenshotRecoveryEstimate").textContent, "Estimated paid orders to recover fee: 20");
  assert.match(elements.get("screenshotEmailPreview").value, /Selected package: Portfolio revenue system - 9,900,000 KRW\+/);
  assert.match(elements.get("screenshotEmailPreview").value, /Average paid order value: 500,000 KRW/);
  assert.match(decodeURIComponent(elements.get("screenshotInvoiceLink").href), /Estimated paid orders to recover fee: 20/);
}

function verifyProductPhotoBriefRuntime(html, options = {}) {
  const {
    search = "?source=figurine&package=shop-launch-pack&aov=120000&productCount=8",
    expectedSource = "AI figurine generator page",
    initialPackage = "shop-launch-pack",
    initialAov = "120000",
    initialProductCount = "8",
    initialRecoveryOrders = "9",
    initialPackageLabel = "Shop launch pack - 990,000 KRW",
    initialFitPattern = /Shop launch pack is best when a small catalog needs product listings and launch ads/,
    changedPackage = "campaign-product-system",
    changedAov = "250000",
    changedProductCount = "18",
    changedRecoveryOrders = "12",
    changedPackageLabel = "Campaign product system - 2,900,000 KRW+",
    changedFitPattern = /Campaign product system is best when one product line needs ads, listing images, and launch visuals/,
  } = options;
  const scriptMatch = html.match(/<script>\s*([\s\S]*?const productBriefPackages[\s\S]*?)\s*<\/script>/);
  assert.ok(scriptMatch, "Product photo brief page must include the product photo brief builder script");

  const listeners = new Map();
  const elements = new Map();
  const addElement = (id, properties = {}) => {
    const element = {
      href: "",
      textContent: "",
      value: "",
      options: [],
      selectedIndex: 0,
      ...properties,
      addEventListener: (eventName, callback) => {
        const key = `${id}:${eventName}`;
        listeners.set(key, [...(listeners.get(key) || []), callback]);
      },
    };
    elements.set(id, element);
    return element;
  };
  const fire = (id, eventName) => {
    for (const callback of listeners.get(`${id}:${eventName}`) || []) {
      callback();
    }
  };

  addElement("productBriefForm");
  addElement("productBriefPackage", {
    value: "creator-product-refresh",
    options: [
      { dataset: { price: "290000" }, textContent: "Creator product refresh - 290,000 KRW" },
      { dataset: { price: "990000" }, textContent: "Shop launch pack - 990,000 KRW" },
      { dataset: { price: "2900000" }, textContent: "Campaign product system - 2,900,000 KRW+" },
    ],
  });
  addElement("productBriefSource", { value: "AI figurine generator page" });
  addElement("productBriefProductCount", { value: "3" });
  addElement("productBriefSalesChannel", { value: "Shopify product page" });
  addElement("productBriefAov", { value: "100000" });
  addElement("productBriefProductUrl", { value: "https://example.com/product" });
  addElement("productBriefDeadline", { value: "This month" });
  addElement("productBriefNotes", { value: "" });
  addElement("productBriefRecoveryOrders");
  addElement("productBriefPackageFit");
  addElement("productBriefEmailPreview");
  addElement("productBriefInvoiceLink");

  vm.runInNewContext(
    scriptMatch[1],
    {
      document: {
        getElementById: (id) => elements.get(id) ?? null,
      },
      encodeURIComponent,
      URLSearchParams,
      window: {
        location: {
          search,
        },
      },
      Intl,
    },
    { timeout: 1000 },
  );

  assert.equal(elements.get("productBriefPackage").value, initialPackage);
  assert.equal(elements.get("productBriefSource").value, expectedSource);
  assert.equal(elements.get("productBriefProductCount").value, initialProductCount);
  assert.equal(elements.get("productBriefAov").value, initialAov);
  assert.equal(elements.get("productBriefRecoveryOrders").textContent, `Estimated paid orders to recover sprint fee: about ${initialRecoveryOrders}`);
  assert.match(elements.get("productBriefPackageFit").textContent, initialFitPattern);
  assert.match(elements.get("productBriefEmailPreview").value, new RegExp(`Selected package: ${initialPackageLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  assert.match(elements.get("productBriefEmailPreview").value, new RegExp(`Referral source: ${expectedSource.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  assert.match(elements.get("productBriefEmailPreview").value, new RegExp(`Product count: ${initialProductCount}`));
  assert.match(elements.get("productBriefEmailPreview").value, new RegExp(`Average paid order value: ${new Intl.NumberFormat("en-US").format(Number(initialAov))} KRW`));
  assert.match(elements.get("productBriefEmailPreview").value, new RegExp(`Estimated paid orders to recover sprint fee: about ${initialRecoveryOrders}`));
  assert.match(decodeURIComponent(elements.get("productBriefInvoiceLink").href), /Kova Product Photo Sprint invoice request/);
  assert.match(decodeURIComponent(elements.get("productBriefInvoiceLink").href), new RegExp(initialPackageLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

  elements.get("productBriefPackage").value = changedPackage;
  fire("productBriefPackage", "change");
  elements.get("productBriefAov").value = changedAov;
  elements.get("productBriefProductCount").value = changedProductCount;
  fire("productBriefForm", "input");

  assert.equal(elements.get("productBriefRecoveryOrders").textContent, `Estimated paid orders to recover sprint fee: about ${changedRecoveryOrders}`);
  assert.match(elements.get("productBriefPackageFit").textContent, changedFitPattern);
  assert.match(elements.get("productBriefEmailPreview").value, new RegExp(`Selected package: ${changedPackageLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  assert.match(elements.get("productBriefEmailPreview").value, new RegExp(`Product count: ${changedProductCount}`));
  assert.match(elements.get("productBriefEmailPreview").value, new RegExp(`Average paid order value: ${new Intl.NumberFormat("en-US").format(Number(changedAov))} KRW`));
  assert.match(decodeURIComponent(elements.get("productBriefInvoiceLink").href), new RegExp(`Estimated paid orders to recover sprint fee: about ${changedRecoveryOrders}`));
}

const requiredFiles = [
  "Kova/index.html",
  "Kova/download/index.html",
  "Kova/shared-result/index.html",
  "Kova/download-qr.svg",
  "Kova/quick-start/index.html",
  "Kova/free-ai-photo-editor/index.html",
  "Kova/app-launch-visuals/index.html",
  "Kova/ai-app-store-screenshot-service/index.html",
  "Kova/ai-idea-visualizer/index.html",
  "Kova/studio-sprint/index.html",
  "Kova/team-headshot-sprint/index.html",
  "Kova/ai-hiring-page-headshots/index.html",
  "Kova/ai-corporate-headshot-generator/index.html",
  "Kova/pricing/index.html",
  "Kova/examples/index.html",
  "Kova/ai-photo-editor-styles/index.html",
  "Kova/ai-product-photo-generator/index.html",
  "Kova/ai-figurine-generator/index.html",
  "Kova/ai-fashion-photo-generator/index.html",
  "Kova/ai-selfie-generator/index.html",
  "Kova/ai-linkedin-photo-generator/index.html",
  "Kova/ai-profile-headshot-generator/index.html",
  "Kova/ai-avatar-generator/index.html",
  "Kova/ai-anime-portrait-generator/index.html",
  "Kova/ai-dating-profile-picture-generator/index.html",
  "Kova/ai-pet-portrait-generator/index.html",
  "Kova/ai-journal-cover-generator/index.html",
  "Kova/privacy.html",
  "Kova/terms.html",
  "Kova/support.html",
  "Kova/assets/anime.webp",
  "Kova/assets/cyberpunk.webp",
  "Kova/assets/figurine.webp",
  "Kova/assets/figurine_male_before.webp",
  "Kova/assets/figurine_male_after.webp",
  "Kova/assets/figurine_female_before.webp",
  "Kova/assets/figurine_female_after.webp",
  "Kova/assets/profile_headshot_male_before.webp",
  "Kova/assets/profile_headshot_male_after.webp",
  "Kova/assets/polaroid.webp",
  "Kova/assets/profile_headshot.webp",
  "Kova/download/Icon.png",
];

for (const file of requiredFiles) {
  await access(file);
}

const [rootIndex, sitemap, index, download, sharedResult, quickStart, freeEditor, appLaunch, appStoreScreenshots, ideaVisualizer, studioSprint, teamHeadshotSprint, tenMScopeLock, hiringPageHeadshots, corporateHeadshots, pricing, examples, styles, productPhoto, figurine, fashion, selfie, linkedin, profileHeadshot, avatar, anime, dating, pet, journal, privacy, terms, support] = await Promise.all([
  readFile("index.html", "utf8"),
  readFile("sitemap.xml", "utf8"),
  readFile("Kova/index.html", "utf8"),
  readFile("Kova/download/index.html", "utf8"),
  readFile("Kova/shared-result/index.html", "utf8"),
  readFile("Kova/quick-start/index.html", "utf8"),
  readFile("Kova/free-ai-photo-editor/index.html", "utf8"),
  readFile("Kova/app-launch-visuals/index.html", "utf8"),
  readFile("Kova/ai-app-store-screenshot-service/index.html", "utf8"),
  readFile("Kova/ai-idea-visualizer/index.html", "utf8"),
  readFile("Kova/studio-sprint/index.html", "utf8"),
  readFile("Kova/team-headshot-sprint/index.html", "utf8"),
  readFile("Kova/10m-scope-lock/index.html", "utf8"),
  readFile("Kova/ai-hiring-page-headshots/index.html", "utf8"),
  readFile("Kova/ai-corporate-headshot-generator/index.html", "utf8"),
  readFile("Kova/pricing/index.html", "utf8"),
  readFile("Kova/examples/index.html", "utf8"),
  readFile("Kova/ai-photo-editor-styles/index.html", "utf8"),
  readFile("Kova/ai-product-photo-generator/index.html", "utf8"),
  readFile("Kova/ai-figurine-generator/index.html", "utf8"),
  readFile("Kova/ai-fashion-photo-generator/index.html", "utf8"),
  readFile("Kova/ai-selfie-generator/index.html", "utf8"),
  readFile("Kova/ai-linkedin-photo-generator/index.html", "utf8"),
  readFile("Kova/ai-profile-headshot-generator/index.html", "utf8"),
  readFile("Kova/ai-avatar-generator/index.html", "utf8"),
  readFile("Kova/ai-anime-portrait-generator/index.html", "utf8"),
  readFile("Kova/ai-dating-profile-picture-generator/index.html", "utf8"),
  readFile("Kova/ai-pet-portrait-generator/index.html", "utf8"),
  readFile("Kova/ai-journal-cover-generator/index.html", "utf8"),
  readFile("Kova/privacy.html", "utf8"),
  readFile("Kova/terms.html", "utf8"),
  readFile("Kova/support.html", "utf8"),
]);

assert.match(rootIndex, /name: "Kova"/);
assert.match(rootIndex, /detail: "Kova\/"/);
assert.match(rootIndex, /https:\/\/apps\.apple\.com\/us\/app\/kova-ai-photo-editor\/id6766026914/);
assert.match(rootIndex, /https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.aly\.kova/);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/privacy\.html/);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/terms\.html/);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/support\.html/);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/examples\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/shared-result\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/quick-start\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/free-ai-photo-editor\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/app-launch-visuals\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-app-store-screenshot-service\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-idea-visualizer\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/studio-sprint\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/team-headshot-sprint\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/10m-scope-lock\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-hiring-page-headshots\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-corporate-headshot-generator\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-selfie-generator\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-fashion-photo-generator\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-product-photo-generator\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-figurine-generator\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-linkedin-photo-generator\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-avatar-generator\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-anime-portrait-generator\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-dating-profile-picture-generator\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-pet-portrait-generator\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-journal-cover-generator\//);

assert.match(index, /<title>Kova: AI Photo Editor<\/title>/);
assert.match(index, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/">/);
assert.match(index, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(index, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));
assert.match(index, /Kova\/download\/index\.html/);
assert.match(index, /download-qr\.svg/);
assert.match(index, /download\/Icon\.png/);
assert.match(index, /20 starter credits/i);
assert.match(index, /about 2 standard image generations/i);
assert.match(index, /application\/ld\+json/);
assert.match(index, /SoftwareApplication/);
assert.match(index, /assets\/figurine\.webp/);
assert.match(index, /assets\/anime\.webp/);
assert.match(index, /assets\/polaroid\.webp/);
assert.match(index, /assets\/cyberpunk\.webp/);
assert.match(index, /Credits and membership ready/);
assert.match(index, /RevenueCat credits/);
assert.match(index, /private galleries/i);
assert.match(index, /privacy\.html/);
assert.match(index, /terms\.html/);
assert.match(index, /support\.html/);
assert.match(index, /pricing\//);
assert.match(index, /examples\//);
assert.match(index, /shared-result\//);
assert.match(index, /quick-start\//);
assert.match(index, /free-ai-photo-editor\//);
assert.match(index, /app-launch-visuals\//);
assert.match(index, /ai-app-store-screenshot-service\//);
assert.match(index, /ai-idea-visualizer\//);
assert.match(index, /studio-sprint\//);
assert.match(index, /team-headshot-sprint\//);
assert.match(index, /ai-hiring-page-headshots\//);
assert.match(index, /ai-corporate-headshot-generator\//);
assert.match(index, /ai-product-photo-generator\//);
assert.match(index, /ai-photo-editor-styles\//);
assert.match(index, /ai-fashion-photo-generator\//);
assert.match(index, /ai-selfie-generator\//);
assert.match(index, /ai-linkedin-photo-generator\//);
assert.match(index, /ai-avatar-generator\//);
assert.match(index, /ai-anime-portrait-generator\//);
assert.match(index, /ai-dating-profile-picture-generator\//);
assert.match(index, /ai-pet-portrait-generator\//);
assert.match(index, /ai-journal-cover-generator\//);
assert.match(index, new RegExp(contactEmail));
assert.match(index, /id="paidServiceRouter"/);
assert.match(index, /Need Kova output for a launch or team/);
assert.match(index, /App Store screenshot brief/);
assert.match(index, /Launch visual sprint/);
assert.match(index, /Team headshot sprint/);
assert.match(index, /990,000 KRW/);
assert.match(index, /2,900,000 KRW/);
assert.match(index, /9,900,000 KRW\+/);
assert.match(index, /Request screenshot invoice/);
assert.match(index, /Request launch invoice/);
assert.match(index, /Request team invoice/);
assert.match(index, /live Gumroad 50% deposit checkouts/);
assert.match(index, /ai-app-store-screenshot-service\/#screenshotBriefBuilder/);
assert.match(index, /studio-sprint\/#sprintBriefBuilder/);
assert.match(index, /team-headshot-sprint\/#teamBriefBuilder/);

assert.match(download, /const iosUrl = "https:\/\/apps\.apple\.com\/us\/app\/kova-ai-photo-editor\/id6766026914"/);
assert.match(download, /const androidUrl = "https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.aly\.kova(?:&referrer=[^"]+)?"/);
assert.match(download, /iPhone\|iPad\|iPod/);
assert.match(download, /Android/i);
assert.match(download, /App Store/);
assert.match(download, /Google Play/);
assert.match(download, /20 starter credits/i);
assert.match(download, /about 2 standard image generations/i);
assert.match(download, /before choosing a membership or credit pack/i);
assert.match(download, /\.\.\/quick-start\//);
assert.match(download, /\.\.\/free-ai-photo-editor\//);
assert.match(download, /privacy\.html/);
assert.match(download, /terms\.html/);
assert.match(download, /support\.html/);

assert.match(sharedResult, /<title>Made With Kova \| Shared AI Photo Result<\/title>/);
assert.match(sharedResult, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/shared-result\/">/);
assert.match(sharedResult, /Made With Kova/);
assert.match(sharedResult, /Someone made this style from one photo/i);
assert.match(sharedResult, /20 starter credits/i);
assert.match(sharedResult, /about 2 standard image generations/i);
assert.match(sharedResult, /10 credits per standard image generation/i);
assert.match(sharedResult, /Open Kova on your phone/i);
assert.match(sharedResult, /Compare pricing/i);
assert.match(sharedResult, /See examples/i);
assert.match(sharedResult, /application\/ld\+json/);
assert.match(sharedResult, /SoftwareApplication/);
assert.match(sharedResult, /FAQPage/);
assert.match(sharedResult, /assets\/figurine\.webp/);
assert.match(sharedResult, /assets\/anime\.webp/);
assert.match(sharedResult, /assets\/polaroid\.webp/);
assert.match(sharedResult, /download\/index\.html/);
assert.match(sharedResult, /pricing\//);
assert.match(sharedResult, /examples\//);
assert.match(sharedResult, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(sharedResult, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(quickStart, /<title>Kova Quick Start \| Create Your First AI Photo Edit<\/title>/);
assert.match(quickStart, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/quick-start\/">/);
assert.match(quickStart, /Create your first Kova edit/);
assert.match(quickStart, /20 starter credits/i);
assert.match(quickStart, /about 2 standard image generations/i);
assert.match(quickStart, /10 credits per standard image generation/i);
assert.match(quickStart, /Choose one clear photo/);
assert.match(quickStart, /Pick a ready-made style/);
assert.match(quickStart, /Generate the first result/);
assert.match(quickStart, /Save, share, or try one more/);
assert.match(quickStart, /application\/ld\+json/);
assert.match(quickStart, /HowTo/);
assert.match(quickStart, /assets\/figurine\.webp/);
assert.match(quickStart, /assets\/anime\.webp/);
assert.match(quickStart, /assets\/profile_headshot_male_after\.webp/);
assert.match(quickStart, /assets\/polaroid\.webp/);
assert.match(quickStart, /\.\.\/download\/index\.html/);
assert.match(quickStart, /\.\.\/examples\//);
assert.match(quickStart, /\.\.\/free-ai-photo-editor\//);
assert.match(quickStart, /\.\.\/pricing\//);
assert.match(quickStart, /\.\.\/ai-photo-editor-styles\//);
assert.match(quickStart, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(quickStart, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(freeEditor, /<title>Free AI Photo Editor \| Kova<\/title>/);
assert.match(freeEditor, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/free-ai-photo-editor\/">/);
assert.match(freeEditor, /Free AI Photo Editor/);
assert.match(freeEditor, /free to install/i);
assert.match(freeEditor, /20 starter credits/i);
assert.match(freeEditor, /about 2 standard image generations/i);
assert.match(freeEditor, /10 credits per standard image generation/i);
assert.match(freeEditor, /No prompt writing required/);
assert.match(freeEditor, /Try before choosing a plan/);
assert.match(freeEditor, /application\/ld\+json/);
assert.match(freeEditor, /SoftwareApplication/);
assert.match(freeEditor, /FAQPage/);
assert.match(freeEditor, /assets\/figurine\.webp/);
assert.match(freeEditor, /assets\/anime\.webp/);
assert.match(freeEditor, /assets\/profile_headshot_male_after\.webp/);
assert.match(freeEditor, /\.\.\/download\/index\.html/);
assert.match(freeEditor, /\.\.\/quick-start\//);
assert.match(freeEditor, /\.\.\/pricing\//);
assert.match(freeEditor, /\.\.\/examples\//);
assert.match(freeEditor, /\.\.\/ai-photo-editor-styles\//);
assert.match(freeEditor, /\.\.\/ai-selfie-generator\//);
assert.match(freeEditor, /\.\.\/ai-linkedin-photo-generator\//);
assert.match(freeEditor, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(freeEditor, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(appLaunch, /<title>AI App Launch Visuals \| Kova<\/title>/);
assert.match(appLaunch, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/app-launch-visuals\/">/);
assert.match(appLaunch, /AI App Launch Visuals/);
assert.match(appLaunch, /for app makers/i);
assert.match(appLaunch, /founder profile/i);
assert.match(appLaunch, /launch posts/i);
assert.match(appLaunch, /product-style visuals/i);
assert.match(appLaunch, /20 starter credits/i);
assert.match(appLaunch, /about 2 standard image generations/i);
assert.match(appLaunch, /10 credits per standard image generation/i);
assert.match(appLaunch, /application\/ld\+json/);
assert.match(appLaunch, /SoftwareApplication/);
assert.match(appLaunch, /FAQPage/);
assert.match(appLaunch, /assets\/profile_headshot\.webp/);
assert.match(appLaunch, /assets\/figurine\.webp/);
assert.match(appLaunch, /assets\/polaroid\.webp/);
assert.match(appLaunch, /assets\/anime\.webp/);
assert.match(appLaunch, /\.\.\/download\/index\.html/);
assert.match(appLaunch, /\.\.\/quick-start\//);
assert.match(appLaunch, /\.\.\/pricing\//);
assert.match(appLaunch, /\.\.\/examples\//);
assert.match(appLaunch, /\.\.\/ai-photo-editor-styles\//);
assert.match(appLaunch, /\.\.\/ai-idea-visualizer\//);
assert.match(appLaunch, /\.\.\/studio-sprint\//);
assert.match(appLaunch, /\.\.\/ai-app-store-screenshot-service\//);
assert.match(appLaunch, /Kova Studio Sprint/);
assert.match(appLaunch, /Launch Visual Sprint brief builder/);
assert.match(appLaunch, /id="launchBriefBuilder"/);
assert.match(appLaunch, /id="launchBriefForm"/);
assert.match(appLaunch, /id="launchBriefPackage"/);
assert.match(appLaunch, /id="launchBriefSource"/);
assert.match(appLaunch, /id="launchBriefOutcome"/);
assert.match(appLaunch, /id="launchBriefAov"/);
assert.match(appLaunch, /id="launchBriefAppUrl"/);
assert.match(appLaunch, /id="launchBriefMaterialsLink"/);
assert.match(appLaunch, /id="launchBriefRecoveryOrders"/);
assert.match(appLaunch, /id="launchBriefPackageFit"/);
assert.match(appLaunch, /id="launchBriefEmailPreview"/);
assert.match(appLaunch, /id="launchBriefInvoiceLink"/);
assert.match(appLaunch, /Kova App Launch Visual Sprint invoice request/);
assert.match(appLaunch, /Estimated paid orders to recover sprint fee:/);
assert.match(appLaunch, /const launchBriefPackages/);
assert.match(appLaunch, /invoice builder only prepares a local email draft/);
assert.match(appLaunch, /\.\.\/\.\.\/AppHub\//);
assert.match(appLaunch, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(appLaunch, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));
verifyAppLaunchBriefRuntime(appLaunch);

assert.match(appStoreScreenshots, /<title>AI App Store Screenshot Service \| Kova Studio Sprint<\/title>/);
assert.match(appStoreScreenshots, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-app-store-screenshot-service\/">/);
assert.match(appStoreScreenshots, /AI App Store Screenshot Service/);
assert.match(appStoreScreenshots, /App Store screenshots/i);
assert.match(appStoreScreenshots, /Google Play graphics/i);
assert.match(appStoreScreenshots, /Kova Studio Sprint/);
assert.match(appStoreScreenshots, /990,000 KRW/);
assert.match(appStoreScreenshots, /2,900,000 KRW/);
assert.match(appStoreScreenshots, /9,900,000 KRW\+/);
assert.match(appStoreScreenshots, /Screenshot brief builder/);
assert.match(appStoreScreenshots, /id="screenshotBriefBuilder"/);
assert.match(appStoreScreenshots, /id="screenshotPackage"/);
assert.match(appStoreScreenshots, /id="screenshotReferralSource"/);
assert.match(appStoreScreenshots, /id="screenshotPlatform"/);
assert.match(appStoreScreenshots, /id="screenshotAppUrl"/);
assert.match(appStoreScreenshots, /id="screenshotValueProp"/);
assert.match(appStoreScreenshots, /id="screenshotSlotCount"/);
assert.match(appStoreScreenshots, /id="screenshotLaunchDate"/);
assert.match(appStoreScreenshots, /id="screenshotAov"/);
assert.match(appStoreScreenshots, /id="screenshotEmailPreview"/);
assert.match(appStoreScreenshots, /id="screenshotInvoiceLink"/);
assert.match(appStoreScreenshots, /function updateScreenshotBrief/);
assert.match(appStoreScreenshots, /URLSearchParams\(window\.location\.search\)/);
assert.match(appStoreScreenshots, /Math\.ceil\(packagePrice \/ averageOrderValue\)/);
assert.match(appStoreScreenshots, /Selected package:/);
assert.match(appStoreScreenshots, /Referral source:/);
assert.match(appStoreScreenshots, /Store surface:/);
assert.match(appStoreScreenshots, /Screenshot slots:/);
assert.match(appStoreScreenshots, /Estimated paid orders to recover fee:/);
assert.match(appStoreScreenshots, /no store edit or review submission is created/);
assert.match(appStoreScreenshots, /application\/ld\+json/);
assert.match(appStoreScreenshots, /Service/);
assert.match(appStoreScreenshots, /OfferCatalog/);
assert.match(appStoreScreenshots, /FAQPage/);
assert.match(appStoreScreenshots, /assets\/profile_headshot\.webp/);
assert.match(appStoreScreenshots, /assets\/figurine\.webp/);
assert.match(appStoreScreenshots, /assets\/polaroid\.webp/);
assert.match(appStoreScreenshots, /\.\.\/studio-sprint\//);
assert.match(appStoreScreenshots, /\.\.\/app-launch-visuals\//);
assert.match(appStoreScreenshots, /\.\.\/download\/index\.html/);
assert.match(appStoreScreenshots, /\.\.\/\.\.\/AppHub\//);
assert.match(appStoreScreenshots, /\.\.\/\.\.\/MindMapAI\//);
assert.match(appStoreScreenshots, /\.\.\/\.\.\/MobileCode\//);
assert.match(appStoreScreenshots, /mindmapai: "MindMapAI landing page"/);
assert.match(appStoreScreenshots, /mailto:alyduho984530@gmail\.com\?subject=Kova%20App%20Store%20Screenshot%20Service%20invoice%20request/);
assert.match(appStoreScreenshots, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(appStoreScreenshots, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));
verifyScreenshotBriefRuntime(appStoreScreenshots);

assert.match(ideaVisualizer, /<title>AI Idea Visualizer \| Kova<\/title>/);
assert.match(ideaVisualizer, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-idea-visualizer\/">/);
assert.match(ideaVisualizer, /AI Idea Visualizer/);
assert.match(ideaVisualizer, /for visual thinkers/i);
assert.match(ideaVisualizer, /mind maps/i);
assert.match(ideaVisualizer, /idea boards/i);
assert.match(ideaVisualizer, /concept directions/i);
assert.match(ideaVisualizer, /MindMapAI/i);
assert.match(ideaVisualizer, /20 starter credits/i);
assert.match(ideaVisualizer, /about 2 standard image generations/i);
assert.match(ideaVisualizer, /10 credits per standard image generation/i);
assert.match(ideaVisualizer, /application\/ld\+json/);
assert.match(ideaVisualizer, /SoftwareApplication/);
assert.match(ideaVisualizer, /FAQPage/);
assert.match(ideaVisualizer, /assets\/polaroid\.webp/);
assert.match(ideaVisualizer, /assets\/profile_headshot\.webp/);
assert.match(ideaVisualizer, /assets\/anime\.webp/);
assert.match(ideaVisualizer, /assets\/figurine\.webp/);
assert.match(ideaVisualizer, /\.\.\/download\/index\.html/);
assert.match(ideaVisualizer, /\.\.\/quick-start\//);
assert.match(ideaVisualizer, /\.\.\/pricing\//);
assert.match(ideaVisualizer, /\.\.\/examples\//);
assert.match(ideaVisualizer, /\.\.\/ai-photo-editor-styles\//);
assert.match(ideaVisualizer, /\.\.\/studio-sprint\//);
assert.match(ideaVisualizer, /Kova Studio Sprint/);
assert.match(ideaVisualizer, /\.\.\/\.\.\/MindMapAI\//);
assert.match(ideaVisualizer, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(ideaVisualizer, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(studioSprint, /<title>Kova Studio Sprint \| AI Launch Visual Service<\/title>/);
assert.match(studioSprint, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/studio-sprint\/">/);
assert.match(studioSprint, /\.hero > div\s*\{[\s\S]*?min-width: 0;/);
assert.match(studioSprint, /Kova Studio Sprint/);
assert.match(studioSprint, /for app makers, creators, and small teams/i);
assert.match(studioSprint, /Launch-week pilot intake/);
assert.equal((studioSprint.match(/id="pilotIntakeTitle"/g) || []).length, 1);
assert.match(studioSprint, /2 pilot slots/);
assert.match(studioSprint, /Source-aware feeder proof/);
assert.match(studioSprint, /1,810\+ Google Play lower-bound app-maker downloads/);
assert.match(studioSprint, /500\+ GhostLens lower-bound downloads/);
assert.match(studioSprint, /smallest recoverable package/i);
assert.match(studioSprint, /Build invoice-ready brief/);
assert.match(studioSprint, /mailto:alyduho984530@gmail\.com\?subject=Kova%20Studio%20Sprint%20launch-week%20pilot/);
const pilotMailLink = studioSprint.match(/mailto:alyduho984530@gmail\.com\?subject=Kova%20Studio%20Sprint%20launch-week%20pilot&body=([^"]+)/);
assert.ok(pilotMailLink);
const decodedPilotEmail = decodeURIComponent(pilotMailLink[1]);
assert.match(decodedPilotEmail, /Selected package:/);
assert.match(decodedPilotEmail, /Average paid order value:/);
assert.match(decodedPilotEmail, /Launch date:/);
assert.match(decodedPilotEmail, /Source materials link:/);
assert.match(decodedPilotEmail, /Smallest recoverable package:/);
assert.match(studioSprint, /990,000 KRW/);
assert.match(studioSprint, /2,900,000 KRW/);
assert.match(studioSprint, /9,900,000 KRW\+/);
assert.match(studioSprint, /Launch visual sprint/);
assert.match(studioSprint, /Creator campaign system/);
assert.match(studioSprint, /Portfolio revenue system/);
assert.match(studioSprint, /Package deliverables/);
assert.match(studioSprint, /8 launch visuals/);
assert.match(studioSprint, /12 campaign visuals/);
assert.match(studioSprint, /24 funnel visuals/);
assert.match(studioSprint, /3 prompt recipes/);
assert.match(studioSprint, /8 prompt recipes/);
assert.match(studioSprint, /12 prompt recipes/);
assert.match(studioSprint, /Package fit guide/);
assert.equal((studioSprint.match(/id="packageFitTitle"/g) || []).length, 1);
assert.match(studioSprint, /Choose Launch visual sprint/);
assert.match(studioSprint, /one focused app, product, or creator launch/i);
assert.match(studioSprint, /Choose Creator campaign system/);
assert.match(studioSprint, /repeatable campaign visuals/i);
assert.match(studioSprint, /Choose Portfolio revenue system/);
assert.match(studioSprint, /multiple apps or offers/i);
assert.match(studioSprint, /Revenue checkpoint/);
assert.equal((studioSprint.match(/id="revenueCheckpointTitle"/g) || []).length, 1);
assert.match(studioSprint, /100,000 KRW per paid order/i);
assert.match(studioSprint, /about 10 paid orders/i);
assert.match(studioSprint, /about 29 paid orders/i);
assert.match(studioSprint, /about 99 paid orders/i);
assert.match(studioSprint, /Paid-order calculator/);
assert.equal((studioSprint.match(/id="paidOrderCalculatorTitle"/g) || []).length, 1);
assert.match(studioSprint, /id="paidOrderCalculator"/);
assert.match(studioSprint, /Average paid order value/);
assert.match(studioSprint, /id="averageOrderValue"/);
assert.match(studioSprint, /Estimated orders to recover sprint fee/);
assert.match(studioSprint, /data-package-price="990000"/);
assert.match(studioSprint, /data-package-price="2900000"/);
assert.match(studioSprint, /data-package-price="9900000"/);
assert.match(studioSprint, /function updatePaidOrderCalculator/);
assert.match(studioSprint, /Math\.ceil\(packagePrice \/ averageOrderValue\)/);
assert.match(studioSprint, /Founder profile/);
assert.match(studioSprint, /App launch posts/);
assert.match(studioSprint, /Prompt system handoff/);
assert.match(studioSprint, /Proof before invoice/);
assert.equal((studioSprint.match(/id="proofTitle"/g) || []).length, 1);
assert.match(studioSprint, /Visible Kova examples/);
assert.match(studioSprint, /Before\/after figurine and profile examples/i);
assert.match(studioSprint, /\.\.\/examples\//);
assert.match(studioSprint, /Source-aware launch funnels/);
assert.match(studioSprint, /AppHub and MindMapAI visitors/i);
assert.match(studioSprint, /Invoice-ready handoff proof/);
assert.match(studioSprint, /selected package, referral source, and commercial usage scope/i);
assert.match(studioSprint, /Typical delivery timeline/);
assert.match(studioSprint, /Scope confirmation before invoice/);
assert.match(studioSprint, /Payment due before production begins/);
assert.match(studioSprint, /First visual board in 3 business days/);
assert.match(studioSprint, /Final launch kit in 5 business days/);
assert.match(studioSprint, /One revision pass included/);
assert.match(studioSprint, /Buyer FAQ/);
assert.match(studioSprint, /Who can use the final assets commercially/);
assert.match(studioSprint, /agreed commercial usage scope/);
assert.match(studioSprint, /What source materials do you need/);
assert.match(studioSprint, /product or creator link, target audience, 3 reference visuals or pages/i);
assert.match(studioSprint, /Can we request an invoice before payment/);
assert.match(studioSprint, /invoice can be prepared after scope confirmation/i);
assert.match(studioSprint, /Invoice-ready sprint request/);
assert.match(studioSprint, /How paid sprint starts/);
assert.match(studioSprint, /within 24 hours KST/i);
assert.match(studioSprint, /Request invoice/);
assert.match(studioSprint, /Request 990,000 KRW invoice/);
assert.match(studioSprint, /Request 2,900,000 KRW invoice/);
assert.match(studioSprint, /Request 9,900,000 KRW\+ invoice/);
assert.match(studioSprint, /id="launch-visual-sprint"/);
assert.match(studioSprint, /id="creator-campaign-system"/);
assert.match(studioSprint, /id="portfolio-revenue-system"/);
assert.match(studioSprint, /Referral source/);
assert.match(studioSprint, /sourceLabels/);
assert.match(studioSprint, /AppHub landing page/);
assert.match(studioSprint, /GeniePlanner landing page/);
assert.match(studioSprint, /GhostLens landing page/);
assert.match(studioSprint, /MindMapAI landing page/);
assert.match(studioSprint, /MobileCode landing page/);
assert.match(studioSprint, /StatUP landing page/);
assert.match(studioSprint, /VibePlanning landing page/);
assert.match(studioSprint, /sourceLabels\.genieplanner/);
assert.match(studioSprint, /sourceLabels\.ghostlens/);
assert.match(studioSprint, /sourceLabels\.mobilecode/);
assert.match(studioSprint, /sourceLabels\.statup/);
assert.match(studioSprint, /sourceLabels\.vibeplanning/);
assert.match(studioSprint, /Sprint brief builder/);
assert.match(studioSprint, /id="sprintBriefBuilder"/);
assert.match(studioSprint, /name="brief_package"/);
assert.match(studioSprint, /name="brief_referral_source"/);
assert.match(studioSprint, /name="brief_buyer"/);
assert.match(studioSprint, /name="brief_primary_outcome"/);
assert.match(studioSprint, /name="brief_revenue_target"/);
assert.match(studioSprint, /name="brief_average_order_value"/);
assert.match(studioSprint, /name="brief_payment_preference"/);
assert.match(studioSprint, /name="brief_receipt_needed"/);
assert.match(studioSprint, /name="brief_launch_date"/);
assert.match(studioSprint, /name="brief_product_link"/);
assert.match(studioSprint, /name="brief_materials_link"/);
assert.match(studioSprint, /name="brief_commercial_scope"/);
assert.match(studioSprint, /name="brief_decision_timeline"/);
assert.match(studioSprint, /name="brief_notes"/);
assert.match(studioSprint, /id="briefInvoiceLink"/);
assert.match(studioSprint, /Invoice email preview/);
assert.match(studioSprint, /id="briefEmailPreview"/);
assert.match(studioSprint, /name="brief_email_preview"/);
assert.match(studioSprint, /briefEmailPreview\.value = body/);
assert.match(studioSprint, /function updateBriefInvoiceLink/);
assert.match(studioSprint, /Create invoice email/);
assert.match(studioSprint, /Commercial usage scope/);
assert.match(studioSprint, /Payment preference/);
assert.match(studioSprint, /Primary outcome/);
assert.match(studioSprint, /Revenue target/);
assert.match(studioSprint, /Average paid order value/);
assert.match(studioSprint, /App installs/);
assert.match(studioSprint, /Paid orders/);
assert.match(studioSprint, /Creator inquiries/);
assert.match(studioSprint, /Portfolio funnel/);
assert.match(studioSprint, /5,000,000 KRW monthly revenue/);
assert.match(studioSprint, /20,000,000 KRW\+ monthly revenue/);
assert.match(studioSprint, /mailto:alyduho984530@gmail\.com\?subject=Kova%20Studio%20Sprint%20inquiry/);
assert.match(studioSprint, /Budget%3A%20990%2C000%20%2F%202%2C900%2C000%20%2F%209%2C900%2C000%2B%20KRW/);
assert.match(studioSprint, /Target%20launch%20date/);
assert.match(studioSprint, /Product%20or%20creator%20link/);
assert.match(studioSprint, /mailto:alyduho984530@gmail\.com\?subject=Kova%20Studio%20Sprint%20invoice%20request/);
const sprintInvoiceMailLink = studioSprint.match(/mailto:alyduho984530@gmail\.com\?subject=Kova%20Studio%20Sprint%20invoice%20request&body=([^"]+)/);
assert.ok(sprintInvoiceMailLink);
const decodedSprintInvoiceEmail = decodeURIComponent(sprintInvoiceMailLink[1]);
assert.match(decodedSprintInvoiceEmail, /Selected package:/);
assert.match(decodedSprintInvoiceEmail, /Buyer or company:/);
assert.match(decodedSprintInvoiceEmail, /Primary outcome:/);
assert.match(decodedSprintInvoiceEmail, /Revenue target:/);
assert.match(decodedSprintInvoiceEmail, /Average paid order value:/);
assert.match(decodedSprintInvoiceEmail, /Payment preference:/);
assert.match(decodedSprintInvoiceEmail, /Receipt or tax invoice needed:/);
assert.match(decodedSprintInvoiceEmail, /Commercial usage scope:/);
assert.match(decodedSprintInvoiceEmail, /Decision timeline:/);
const packageInvoiceMailLinks = [...studioSprint.matchAll(/mailto:alyduho984530@gmail\.com\?subject=Kova%20Studio%20Sprint%20invoice%20request&body=([^"]+)/g)]
    .map((match) => decodeURIComponent(match[1]));
for (const selectedPackage of [
    "Selected package: Launch visual sprint - 990,000 KRW",
    "Selected package: Creator campaign system - 2,900,000 KRW",
    "Selected package: Portfolio revenue system - 9,900,000 KRW+",
]) {
    assert.ok(
        packageInvoiceMailLinks.some((body) => body.includes(selectedPackage)),
        `Missing package-specific invoice link for ${selectedPackage}`,
    );
}
assert.match(studioSprint, /application\/ld\+json/);
assert.match(studioSprint, /OfferCatalog/);
assert.match(studioSprint, /FAQPage/);
assert.match(studioSprint, /Service/);
assert.match(studioSprint, /assets\/profile_headshot\.webp/);
assert.match(studioSprint, /assets\/figurine\.webp/);
assert.match(studioSprint, /assets\/polaroid\.webp/);
assert.match(studioSprint, /\.\.\/app-launch-visuals\//);
assert.match(studioSprint, /\.\.\/ai-app-store-screenshot-service\//);
assert.match(studioSprint, /\.\.\/ai-idea-visualizer\//);
assert.match(studioSprint, /\.\.\/team-headshot-sprint\//);
assert.match(studioSprint, /\.\.\/10m-scope-lock\//);
assert.match(studioSprint, /\.\.\/download\/index\.html/);
assert.match(studioSprint, /\.\.\/\.\.\/AI-Creator-Prompt-Pack\//);
assert.match(studioSprint, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(studioSprint, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(teamHeadshotSprint, /<title>Kova Team Headshot Sprint \| AI LinkedIn Team Photos<\/title>/);
assert.match(teamHeadshotSprint, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/team-headshot-sprint\/">/);
assert.match(teamHeadshotSprint, /Team Headshot Sprint/);
assert.match(teamHeadshotSprint, /LinkedIn team headshots/i);
assert.match(teamHeadshotSprint, /startup team/i);
assert.match(teamHeadshotSprint, /990,000 KRW/);
assert.match(teamHeadshotSprint, /2,900,000 KRW/);
assert.match(teamHeadshotSprint, /9,900,000 KRW\+/);
assert.match(teamHeadshotSprint, /Founder profile refresh/);
assert.match(teamHeadshotSprint, /Team profile pack/);
assert.match(teamHeadshotSprint, /Hiring page visual system/);
assert.match(teamHeadshotSprint, /Request invoice/);
assert.match(teamHeadshotSprint, /mailto:alyduho984530@gmail\.com\?subject=Kova%20Team%20Headshot%20Sprint%20invoice%20request/);
assert.match(teamHeadshotSprint, /Selected package:/);
assert.match(teamHeadshotSprint, /Buyer or company:/);
assert.match(teamHeadshotSprint, /Team size:/);
assert.match(teamHeadshotSprint, /LinkedIn or company page:/);
assert.match(teamHeadshotSprint, /Commercial usage scope:/);
assert.match(teamHeadshotSprint, /Team cost calculator/);
assert.match(teamHeadshotSprint, /id="teamCostCalculator"/);
assert.match(teamHeadshotSprint, /id="teamSizeCalculatorInput"/);
assert.match(teamHeadshotSprint, /Recommended package/);
assert.match(teamHeadshotSprint, /id="teamCostPackageName"/);
assert.match(teamHeadshotSprint, /Estimated sprint fee/);
assert.match(teamHeadshotSprint, /id="teamCostTotal"/);
assert.match(teamHeadshotSprint, /Estimated per-person cost/);
assert.match(teamHeadshotSprint, /id="teamCostPerPerson"/);
assert.match(teamHeadshotSprint, /data-team-price="990000"/);
assert.match(teamHeadshotSprint, /data-team-price="2900000"/);
assert.match(teamHeadshotSprint, /data-team-price="9900000"/);
assert.match(teamHeadshotSprint, /Founder profile refresh is best for one public-facing leader/);
assert.match(teamHeadshotSprint, /Team profile pack is best for 2 to 8 people/);
assert.match(teamHeadshotSprint, /Hiring page visual system is best for 9 or more people/);
assert.match(teamHeadshotSprint, /function updateTeamCostCalculator/);
assert.match(teamHeadshotSprint, /Math\.ceil\(packagePrice \/ teamSize\)/);
assert.match(teamHeadshotSprint, /#teamSourcePacketPlanner/);
assert.match(teamHeadshotSprint, /Team source packet planner/);
assert.match(teamHeadshotSprint, /id="teamSourcePacketPlanner"/);
assert.match(teamHeadshotSprint, /id="teamSourcePacketSize"/);
assert.match(teamHeadshotSprint, /id="sourcePacketPhotosReady"/);
assert.match(teamHeadshotSprint, /id="sourcePacketReferenceReady"/);
assert.match(teamHeadshotSprint, /id="sourcePacketDecisionOwner"/);
assert.match(teamHeadshotSprint, /id="sourcePacketUseCase"/);
assert.match(teamHeadshotSprint, /id="sourcePacketPhotoCount"/);
assert.match(teamHeadshotSprint, /id="sourcePacketStatus"/);
assert.match(teamHeadshotSprint, /id="sourcePacketRecommendation"/);
assert.match(teamHeadshotSprint, /Source packet:/);
assert.match(teamHeadshotSprint, /function updateTeamSourcePacketPlanner/);
verifyTeamSourcePacketRuntime(teamHeadshotSprint);
assert.match(teamHeadshotSprint, /Team brief builder/);
assert.match(teamHeadshotSprint, /id="teamBriefBuilder"/);
assert.match(teamHeadshotSprint, /id="teamBriefPackage"/);
assert.match(teamHeadshotSprint, /Founder profile refresh - 990,000 KRW/);
assert.match(teamHeadshotSprint, /Team profile pack - 2,900,000 KRW/);
assert.match(teamHeadshotSprint, /Hiring page visual system - 9,900,000 KRW\+/);
assert.match(teamHeadshotSprint, /id="teamBriefBuyer"/);
assert.match(teamHeadshotSprint, /id="teamBriefTeamSize"/);
assert.match(teamHeadshotSprint, /id="teamBriefCompanyPage"/);
assert.match(teamHeadshotSprint, /id="teamBriefUsageScope"/);
assert.match(teamHeadshotSprint, /id="teamBriefDeadline"/);
assert.match(teamHeadshotSprint, /id="teamBriefNotes"/);
assert.match(teamHeadshotSprint, /id="teamBriefEmailPreview"/);
assert.match(teamHeadshotSprint, /Team invoice email preview/);
assert.match(teamHeadshotSprint, /id="teamBriefInvoiceLink"/);
assert.match(teamHeadshotSprint, /Create team invoice email/);
assert.match(teamHeadshotSprint, /Estimated package fit/);
assert.match(teamHeadshotSprint, /updateTeamBriefInvoiceLink/);
assert.match(teamHeadshotSprint, /encodeURIComponent\(body\)/);
assert.match(teamHeadshotSprint, /application\/ld\+json/);
assert.match(teamHeadshotSprint, /Service/);
assert.match(teamHeadshotSprint, /OfferCatalog/);
assert.match(teamHeadshotSprint, /FAQPage/);
assert.match(teamHeadshotSprint, /assets\/profile_headshot_female_before\.webp/);
assert.match(teamHeadshotSprint, /assets\/profile_headshot_female_after\.webp/);
assert.match(teamHeadshotSprint, /assets\/profile_headshot_male_before\.webp/);
assert.match(teamHeadshotSprint, /assets\/profile_headshot_male_after\.webp/);
assert.match(teamHeadshotSprint, /\.\.\/ai-linkedin-photo-generator\//);
assert.match(teamHeadshotSprint, /\.\.\/ai-profile-headshot-generator\//);
assert.match(teamHeadshotSprint, /\.\.\/ai-hiring-page-headshots\//);
assert.match(teamHeadshotSprint, /\.\.\/ai-corporate-headshot-generator\//);
assert.match(teamHeadshotSprint, /\.\.\/ai-corporate-headshot-generator\/#sourcePhotoReadiness/);
assert.match(teamHeadshotSprint, /\.\.\/studio-sprint\//);
assert.match(teamHeadshotSprint, /\.\.\/10m-scope-lock\//);
assert.match(teamHeadshotSprint, /\.\.\/download\/index\.html/);
assert.match(teamHeadshotSprint, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(teamHeadshotSprint, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(tenMScopeLock, /<title>Kova 10M Scope Lock \| AI Sprint SOW<\/title>/);
assert.match(tenMScopeLock, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/10m-scope-lock\/">/);
assert.match(tenMScopeLock, /Kova 10M Scope Lock/);
assert.match(tenMScopeLock, /10,000,000 KRW/);
assert.match(tenMScopeLock, /Scope lock before payment/);
assert.match(tenMScopeLock, /No live 10,000,000 KRW service contract/);
assert.match(tenMScopeLock, /Team Headshot Sprint/);
assert.match(tenMScopeLock, /Studio Sprint/);
assert.match(tenMScopeLock, /Hiring page visual system - 9,900,000 KRW\+/);
assert.match(tenMScopeLock, /Portfolio revenue system - 9,900,000 KRW\+/);
assert.match(tenMScopeLock, /Statement of work/);
assert.match(tenMScopeLock, /Acceptance criteria/);
assert.match(tenMScopeLock, /Payment due before production begins/);
assert.match(tenMScopeLock, /new written quote/);
assert.match(tenMScopeLock, /Buyer or company name/);
assert.match(tenMScopeLock, /Decision owner/);
assert.match(tenMScopeLock, /Source materials URL/);
assert.match(tenMScopeLock, /Acceptance owner/);
assert.match(tenMScopeLock, /mailto:alyduho984530@gmail\.com\?subject=Kova%2010M%20Scope%20Lock%20request/);
assert.match(tenMScopeLock, /Selected service path:/);
assert.match(tenMScopeLock, /Quote amount: 10,000,000 KRW/);
assert.match(tenMScopeLock, /Commercial usage scope:/);
assert.match(tenMScopeLock, /Receipt or tax invoice details:/);
assert.match(tenMScopeLock, /Action-time confirmation required before any live send/);
assert.match(tenMScopeLock, /\.\.\/studio-sprint\//);
assert.match(tenMScopeLock, /\.\.\/team-headshot-sprint\//);
assert.match(tenMScopeLock, /\.\.\/examples\//);

assert.match(hiringPageHeadshots, /<title>AI Hiring Page Headshots \| Kova Team Headshot Sprint<\/title>/);
assert.match(hiringPageHeadshots, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-hiring-page-headshots\/">/);
assert.match(hiringPageHeadshots, /AI Hiring Page Headshots/);
assert.match(hiringPageHeadshots, /startup hiring page/i);
assert.match(hiringPageHeadshots, /Team Headshot Sprint/);
assert.match(hiringPageHeadshots, /Founder profile refresh/);
assert.match(hiringPageHeadshots, /Team profile pack/);
assert.match(hiringPageHeadshots, /Hiring page visual system/);
assert.match(hiringPageHeadshots, /990,000 KRW/);
assert.match(hiringPageHeadshots, /2,900,000 KRW/);
assert.match(hiringPageHeadshots, /9,900,000 KRW\+/);
assert.match(hiringPageHeadshots, /Team invoice email preview/);
assert.match(hiringPageHeadshots, /Request team invoice/);
assert.match(hiringPageHeadshots, /id="hiringPageBriefBuilder"/);
assert.match(hiringPageHeadshots, /Hiring Page Headshot brief builder/);
assert.match(hiringPageHeadshots, /id="hiringBriefForm"/);
assert.match(hiringPageHeadshots, /id="hiringBriefPackage"/);
assert.match(hiringPageHeadshots, /id="hiringBriefSource"/);
assert.match(hiringPageHeadshots, /id="hiringBriefTeamSize"/);
assert.match(hiringPageHeadshots, /id="hiringBriefCostPerPerson"/);
assert.match(hiringPageHeadshots, /id="hiringBriefEmailPreview"/);
assert.match(hiringPageHeadshots, /id="hiringBriefInvoiceLink"/);
assert.match(hiringPageHeadshots, /Kova Hiring Page Headshot Sprint invoice request/);
assert.match(hiringPageHeadshots, /Estimated per-person sprint cost:/);
assert.match(hiringPageHeadshots, /mailto:alyduho984530@gmail\.com\?subject=Kova%20Team%20Headshot%20Sprint%20invoice%20request/);
verifyHiringPageBriefRuntime(hiringPageHeadshots);
assert.match(hiringPageHeadshots, /application\/ld\+json/);
assert.match(hiringPageHeadshots, /Service/);
assert.match(hiringPageHeadshots, /OfferCatalog/);
assert.match(hiringPageHeadshots, /FAQPage/);
assert.match(hiringPageHeadshots, /assets\/profile_headshot_female_before\.webp/);
assert.match(hiringPageHeadshots, /assets\/profile_headshot_female_after\.webp/);
assert.match(hiringPageHeadshots, /assets\/profile_headshot_male_before\.webp/);
assert.match(hiringPageHeadshots, /assets\/profile_headshot_male_after\.webp/);
assert.match(hiringPageHeadshots, /\.\.\/team-headshot-sprint\//);
assert.match(hiringPageHeadshots, /\.\.\/ai-corporate-headshot-generator\//);
assert.match(hiringPageHeadshots, /\.\.\/ai-linkedin-photo-generator\//);
assert.match(hiringPageHeadshots, /\.\.\/ai-profile-headshot-generator\//);
assert.match(hiringPageHeadshots, /\.\.\/download\/index\.html/);
assert.match(hiringPageHeadshots, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(hiringPageHeadshots, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(corporateHeadshots, /<title>AI Corporate Headshot Generator \| Kova Team Headshot Sprint<\/title>/);
assert.match(corporateHeadshots, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-corporate-headshot-generator\/">/);
assert.match(corporateHeadshots, /AI Corporate Headshot Generator/);
assert.match(corporateHeadshots, /employee headshots/i);
assert.match(corporateHeadshots, /company headshots/i);
assert.match(corporateHeadshots, /Team Headshot Sprint/);
assert.match(corporateHeadshots, /Founder profile refresh/);
assert.match(corporateHeadshots, /Team profile pack/);
assert.match(corporateHeadshots, /Hiring page visual system/);
assert.match(corporateHeadshots, /990,000 KRW/);
assert.match(corporateHeadshots, /2,900,000 KRW/);
assert.match(corporateHeadshots, /9,900,000 KRW\+/);
assert.match(corporateHeadshots, /Corporate invoice email preview/);
assert.match(corporateHeadshots, /Request corporate invoice/);
assert.match(corporateHeadshots, /Source photo checklist/);
assert.match(corporateHeadshots, /Source photo readiness checker/);
assert.match(corporateHeadshots, /id="sourcePhotoReadiness"/);
assert.match(corporateHeadshots, /id="corporateBriefBuilder"/);
assert.match(corporateHeadshots, /Corporate Headshot brief builder/);
assert.match(corporateHeadshots, /id="corporateBriefForm"/);
assert.match(corporateHeadshots, /id="corporateBriefPackage"/);
assert.match(corporateHeadshots, /id="corporateBriefSource"/);
assert.match(corporateHeadshots, /id="corporateBriefTeamSize"/);
assert.match(corporateHeadshots, /id="corporateBriefCompanyPage"/);
assert.match(corporateHeadshots, /id="corporateBriefUseCase"/);
assert.match(corporateHeadshots, /id="corporateBriefCostPerPerson"/);
assert.match(corporateHeadshots, /id="corporateBriefPackageFit"/);
assert.match(corporateHeadshots, /Kova Corporate Headshot Sprint invoice request/);
assert.match(corporateHeadshots, /Estimated per-person sprint cost:/);
assert.match(corporateHeadshots, /const corporateBriefPackages/);
assert.match(corporateHeadshots, /id="readinessFaceVisible"/);
assert.match(corporateHeadshots, /id="readinessLighting"/);
assert.match(corporateHeadshots, /id="readinessNoObstruction"/);
assert.match(corporateHeadshots, /id="readinessReferenceUrl"/);
assert.match(corporateHeadshots, /id="readinessScore"/);
assert.match(corporateHeadshots, /id="readinessRecommendation"/);
assert.match(corporateHeadshots, /id="readinessInvoiceLink"/);
assert.match(corporateHeadshots, /Photo readiness:/);
assert.match(corporateHeadshots, /photos are ready for invoice review/i);
assert.match(corporateHeadshots, /function updatePhotoReadinessChecker/);
assert.match(corporateHeadshots, /checkedItems\.length/);
assert.match(corporateHeadshots, /\.\.\/team-headshot-sprint\/#teamCostCalculator/);
assert.match(corporateHeadshots, /mailto:alyduho984530@gmail\.com\?subject=Kova%20Team%20Headshot%20Sprint%20invoice%20request/);
verifyReadinessCheckerRuntime(corporateHeadshots);
assert.match(corporateHeadshots, /application\/ld\+json/);
assert.match(corporateHeadshots, /Service/);
assert.match(corporateHeadshots, /OfferCatalog/);
assert.match(corporateHeadshots, /FAQPage/);
assert.match(corporateHeadshots, /assets\/profile_headshot_female_before\.webp/);
assert.match(corporateHeadshots, /assets\/profile_headshot_female_after\.webp/);
assert.match(corporateHeadshots, /assets\/profile_headshot_male_before\.webp/);
assert.match(corporateHeadshots, /assets\/profile_headshot_male_after\.webp/);
assert.match(corporateHeadshots, /\.\.\/team-headshot-sprint\//);
assert.match(corporateHeadshots, /\.\.\/ai-hiring-page-headshots\//);
assert.match(corporateHeadshots, /\.\.\/ai-linkedin-photo-generator\//);
assert.match(corporateHeadshots, /\.\.\/ai-profile-headshot-generator\//);
assert.match(corporateHeadshots, /\.\.\/download\/index\.html/);
assert.match(corporateHeadshots, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(corporateHeadshots, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(pricing, /Kova Pricing, Credits, and Memberships/);
assert.match(pricing, /20 starter credits/i);
assert.match(pricing, /about 2 standard image generations/i);
assert.match(pricing, /10 credits per standard image generation/i);
assert.match(pricing, /Credit Packs/);
assert.match(pricing, /100 Credits/);
assert.match(pricing, /about 10 standard image generations/i);
assert.match(pricing, /\$2\.00/);
assert.match(pricing, /500 Credits/);
assert.match(pricing, /about 50 standard image generations/i);
assert.match(pricing, /\$10\.00/);
assert.match(pricing, /1000 Credits/);
assert.match(pricing, /about 100 standard image generations/i);
assert.match(pricing, /\$20\.00/);
assert.match(pricing, /Monthly Plans/);
assert.match(pricing, /500 monthly credits/);
assert.match(pricing, /about 50 standard image generations/i);
assert.match(pricing, /\$9\.99\/month/);
assert.match(pricing, /2000 monthly credits/);
assert.match(pricing, /about 200 standard image generations/i);
assert.match(pricing, /\$29\.99\/month/);
assert.match(pricing, /10000 monthly credits/);
assert.match(pricing, /about 1000 standard image generations/i);
assert.match(pricing, /\$99\.99\/month/);
assert.match(pricing, /Choose a credit pack/i);
assert.match(pricing, /Choose a monthly plan/i);
assert.match(pricing, /\.\.\/download\/index\.html/);
assert.match(pricing, /\.\.\/quick-start\//);
assert.match(pricing, /\.\.\/free-ai-photo-editor\//);
assert.match(pricing, /\.\.\/ai-photo-editor-styles\//);
assert.match(pricing, /\.\.\/ai-selfie-generator\//);
assert.match(pricing, /\.\.\/ai-linkedin-photo-generator\//);
assert.match(pricing, /\.\.\/examples\//);
assert.match(pricing, /\.\.\/privacy\.html/);
assert.match(pricing, /\.\.\/terms\.html/);
assert.match(pricing, /\.\.\/support\.html/);

assert.match(examples, /<title>Kova AI Photo Examples<\/title>/);
assert.match(examples, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/examples\/">/);
assert.match(examples, /Kova AI Photo Examples/);
assert.match(examples, /Before/);
assert.match(examples, /After/);
assert.match(examples, /Figurine package/);
assert.match(examples, /Profile headshot/);
assert.match(examples, /20 starter credits/i);
assert.match(examples, /about 2 standard image generations/i);
assert.match(examples, /assets\/figurine_male_before\.webp/);
assert.match(examples, /assets\/figurine_male_after\.webp/);
assert.match(examples, /assets\/figurine_female_before\.webp/);
assert.match(examples, /assets\/figurine_female_after\.webp/);
assert.match(examples, /assets\/profile_headshot_male_before\.webp/);
assert.match(examples, /assets\/profile_headshot_male_after\.webp/);
assert.match(examples, /\.\.\/download\/index\.html/);
assert.match(examples, /\.\.\/quick-start\//);
assert.match(examples, /\.\.\/free-ai-photo-editor\//);
assert.match(examples, /\.\.\/ai-selfie-generator\//);
assert.match(examples, /\.\.\/ai-linkedin-photo-generator\//);
assert.match(examples, /\.\.\/pricing\//);
assert.match(examples, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(examples, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(styles, /AI Photo Editor Styles/);
assert.match(styles, /Collectible Figurine/);
assert.match(styles, /Anime Portrait/);
assert.match(styles, /RevenueCat/);
assert.match(styles, /\.\.\/download\/index\.html/);
assert.match(styles, /\.\.\/pricing\//);
assert.match(styles, /\.\.\/free-ai-photo-editor\//);
assert.match(styles, /\.\.\/ai-selfie-generator\//);
assert.match(styles, /\.\.\/ai-fashion-photo-generator\//);
assert.match(styles, /\.\.\/ai-product-photo-generator\//);
assert.match(styles, /\.\.\/ai-figurine-generator\//);
assert.match(styles, /\.\.\/ai-linkedin-photo-generator\//);
assert.match(styles, /\.\.\/app-launch-visuals\//);
assert.match(styles, /\.\.\/ai-idea-visualizer\//);
assert.match(styles, /\.\.\/ai-avatar-generator\//);
assert.match(styles, /\.\.\/ai-anime-portrait-generator\//);
assert.match(styles, /\.\.\/privacy\.html/);
assert.match(styles, /\.\.\/terms\.html/);
assert.match(styles, /\.\.\/support\.html/);

assert.match(productPhoto, /<title>AI Product Photo Generator \| Kova Product Photo Sprint<\/title>/);
assert.match(productPhoto, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-product-photo-generator\/">/);
assert.match(productPhoto, /AI Product Photo Generator/);
assert.match(productPhoto, /ecommerce product photos/i);
assert.match(productPhoto, /product listing visuals/i);
assert.match(productPhoto, /Shopify product page/i);
assert.match(productPhoto, /Product Photo Sprint brief builder/);
assert.match(productPhoto, /290,000 KRW/);
assert.match(productPhoto, /990,000 KRW/);
assert.match(productPhoto, /2,900,000 KRW\+/);
assert.match(productPhoto, /id="productBriefBuilder"/);
assert.match(productPhoto, /id="productBriefForm"/);
assert.match(productPhoto, /id="productBriefPackage"/);
assert.match(productPhoto, /id="productBriefSource"/);
assert.match(productPhoto, /id="productBriefProductCount"/);
assert.match(productPhoto, /id="productBriefSalesChannel"/);
assert.match(productPhoto, /id="productBriefAov"/);
assert.match(productPhoto, /id="productBriefProductUrl"/);
assert.match(productPhoto, /id="productBriefRecoveryOrders"/);
assert.match(productPhoto, /id="productBriefPackageFit"/);
assert.match(productPhoto, /id="productBriefEmailPreview"/);
assert.match(productPhoto, /id="productBriefInvoiceLink"/);
assert.match(productPhoto, /Kova Product Photo Sprint invoice request/);
assert.match(productPhoto, /Estimated paid orders to recover sprint fee:/);
assert.match(productPhoto, /const productBriefPackages/);
assert.match(productPhoto, /No live checkout, payment link, store edit, or buyer message is created/);
assert.match(productPhoto, /assets\/figurine\.webp/);
assert.match(productPhoto, /assets\/dollbox\.webp/);
assert.match(productPhoto, /\.\.\/ai-figurine-generator\/\?source=product-photo&package=shop-launch-pack#productBriefBuilder/);
assert.match(productPhoto, /\.\.\/app-launch-visuals\/#launchBriefBuilder/);
assert.match(productPhoto, /\.\.\/studio-sprint\/#sprintBriefBuilder/);
assert.match(productPhoto, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(productPhoto, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));
verifyProductPhotoBriefRuntime(productPhoto, {
  search: "?source=product-photo&package=campaign-product-system&aov=250000&productCount=18",
  expectedSource: "AI product photo generator page",
  initialPackage: "campaign-product-system",
  initialAov: "250000",
  initialProductCount: "18",
  initialRecoveryOrders: "12",
  initialPackageLabel: "Campaign product system - 2,900,000 KRW+",
  initialFitPattern: /Campaign product system is best when one product line needs ads, listing images, and launch visuals/,
  changedPackage: "shop-launch-pack",
  changedAov: "120000",
  changedProductCount: "8",
  changedRecoveryOrders: "9",
  changedPackageLabel: "Shop launch pack - 990,000 KRW",
  changedFitPattern: /Shop launch pack is best when a small catalog needs product listings and launch ads/,
});

assert.match(figurine, /<title>AI Figurine Generator \| Kova<\/title>/);
assert.match(figurine, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-figurine-generator\/">/);
assert.match(figurine, /AI Figurine Generator/);
assert.match(figurine, /AI product photo generator/i);
assert.match(figurine, /ecommerce product photos/i);
assert.match(figurine, /product listing visuals/i);
assert.match(figurine, /toy-box portrait/i);
assert.match(figurine, /SoftwareApplication/);
assert.match(figurine, /assets\/figurine_female_before\.webp/);
assert.match(figurine, /assets\/figurine_female_after\.webp/);
assert.match(figurine, /assets\/figurine_male_before\.webp/);
assert.match(figurine, /assets\/figurine_male_after\.webp/);
assert.match(figurine, /assets\/dollbox\.webp/);
assert.match(figurine, /\.\.\/download\/index\.html/);
assert.match(figurine, /\.\.\/pricing\//);
assert.match(figurine, /\.\.\/ai-profile-headshot-generator\//);
assert.match(figurine, /\.\.\/ai-product-photo-generator\//);
assert.match(figurine, /\.\.\/ai-photo-editor-styles\//);
assert.match(figurine, /Product Photo Sprint brief builder/);
assert.match(figurine, /id="productBriefBuilder"/);
assert.match(figurine, /id="productBriefForm"/);
assert.match(figurine, /id="productBriefPackage"/);
assert.match(figurine, /id="productBriefSource"/);
assert.match(figurine, /id="productBriefProductCount"/);
assert.match(figurine, /id="productBriefAov"/);
assert.match(figurine, /id="productBriefSalesChannel"/);
assert.match(figurine, /id="productBriefProductUrl"/);
assert.match(figurine, /id="productBriefRecoveryOrders"/);
assert.match(figurine, /id="productBriefPackageFit"/);
assert.match(figurine, /id="productBriefEmailPreview"/);
assert.match(figurine, /id="productBriefInvoiceLink"/);
assert.match(figurine, /Kova Product Photo Sprint invoice request/);
assert.match(figurine, /Estimated paid orders to recover sprint fee:/);
assert.match(figurine, /const productBriefPackages/);
assert.match(figurine, /No live checkout, payment link, store edit, or buyer message is created/);
assert.match(figurine, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(figurine, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));
verifyProductPhotoBriefRuntime(figurine);

assert.match(fashion, /<title>AI Fashion Photo Generator \| Kova<\/title>/);
assert.match(fashion, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-fashion-photo-generator\/">/);
assert.match(fashion, /AI Fashion Photo Generator/);
assert.match(fashion, /fashion photo/i);
assert.match(fashion, /outfit photo/i);
assert.match(fashion, /style profile pictures/i);
assert.match(fashion, /20 starter credits/i);
assert.match(fashion, /about 2 standard image generations/i);
assert.match(fashion, /10 credits per standard image generation/i);
assert.match(fashion, /SoftwareApplication/);
assert.match(fashion, /FAQPage/);
assert.match(fashion, /assets\/profile_headshot_female_before\.webp/);
assert.match(fashion, /assets\/profile_headshot_female_after\.webp/);
assert.match(fashion, /assets\/profile_headshot_male_before\.webp/);
assert.match(fashion, /assets\/profile_headshot_male_after\.webp/);
assert.match(fashion, /assets\/polaroid\.webp/);
assert.match(fashion, /\.\.\/download\/index\.html/);
assert.match(fashion, /\.\.\/pricing\//);
assert.match(fashion, /\.\.\/examples\//);
assert.match(fashion, /\.\.\/ai-dating-profile-picture-generator\/\?source=fashion-photo&package=profile-refresh#datingSprintBuilder/);
assert.match(fashion, /\.\.\/ai-profile-headshot-generator\//);
assert.match(fashion, /\.\.\/ai-photo-editor-styles\//);
assert.match(fashion, /id="styleProfileSprintBuilder"/);
assert.match(fashion, /Style Profile Sprint brief builder/);
assert.match(fashion, /id="styleProfilePackage"/);
assert.match(fashion, /id="styleProfileSource"/);
assert.match(fashion, /id="styleProfileAov"/);
assert.match(fashion, /id="styleProfileEmailPreview"/);
assert.match(fashion, /id="styleProfileInvoiceLink"/);
assert.match(fashion, /Kova Style Profile Sprint invoice request/);
assert.match(fashion, /Estimated paid orders to recover fee:/);
assert.match(fashion, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(fashion, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));
verifyFashionStyleSprintRuntime(fashion);

assert.match(selfie, /<title>AI Selfie Generator \| Kova<\/title>/);
assert.match(selfie, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-selfie-generator\/">/);
assert.match(selfie, /AI Selfie Generator/);
assert.match(selfie, /selfie/i);
assert.match(selfie, /profile photo/i);
assert.match(selfie, /one phone photo/i);
assert.match(selfie, /20 starter credits/i);
assert.match(selfie, /about 2 standard image generations/i);
assert.match(selfie, /10 credits per standard image generation/i);
assert.match(selfie, /SoftwareApplication/);
assert.match(selfie, /FAQPage/);
assert.match(selfie, /assets\/profile_headshot_female_before\.webp/);
assert.match(selfie, /assets\/profile_headshot_female_after\.webp/);
assert.match(selfie, /assets\/anime\.webp/);
assert.match(selfie, /assets\/figurine\.webp/);
assert.match(selfie, /\.\.\/download\/index\.html/);
assert.match(selfie, /\.\.\/pricing\//);
assert.match(selfie, /\.\.\/examples\//);
assert.match(selfie, /\.\.\/ai-photo-editor-styles\//);
assert.match(selfie, /\.\.\/ai-avatar-generator\//);
assert.match(selfie, /\.\.\/ai-profile-headshot-generator\//);
assert.match(selfie, /\.\.\/ai-linkedin-photo-generator\//);
assert.match(selfie, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(selfie, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(linkedin, /<title>AI LinkedIn Photo Generator \| Kova<\/title>/);
assert.match(linkedin, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-linkedin-photo-generator\/">/);
assert.match(linkedin, /AI LinkedIn Photo Generator/);
assert.match(linkedin, /LinkedIn profile photo/i);
assert.match(linkedin, /professional headshot/i);
assert.match(linkedin, /resume/i);
assert.match(linkedin, /one phone photo/i);
assert.match(linkedin, /20 starter credits/i);
assert.match(linkedin, /about 2 standard image generations/i);
assert.match(linkedin, /10 credits per standard image generation/i);
assert.match(linkedin, /SoftwareApplication/);
assert.match(linkedin, /FAQPage/);
assert.match(linkedin, /assets\/profile_headshot_female_before\.webp/);
assert.match(linkedin, /assets\/profile_headshot_female_after\.webp/);
assert.match(linkedin, /assets\/profile_headshot_male_before\.webp/);
assert.match(linkedin, /assets\/profile_headshot_male_after\.webp/);
assert.match(linkedin, /\.\.\/download\/index\.html/);
assert.match(linkedin, /\.\.\/pricing\//);
assert.match(linkedin, /\.\.\/examples\//);
assert.match(linkedin, /\.\.\/ai-profile-headshot-generator\//);
assert.match(linkedin, /\.\.\/ai-selfie-generator\//);
assert.match(linkedin, /\.\.\/ai-photo-editor-styles\//);
assert.match(linkedin, /\.\.\/team-headshot-sprint\//);
assert.match(linkedin, /\.\.\/ai-hiring-page-headshots\//);
assert.match(linkedin, /\.\.\/ai-corporate-headshot-generator\//);
assert.match(linkedin, /id="linkedinSprintBuilder"/);
assert.match(linkedin, /LinkedIn Headshot Sprint brief builder/);
assert.match(linkedin, /id="linkedinSprintPackage"/);
assert.match(linkedin, /id="linkedinSprintSource"/);
assert.match(linkedin, /id="linkedinSprintAov"/);
assert.match(linkedin, /id="linkedinSprintEmailPreview"/);
assert.match(linkedin, /id="linkedinSprintInvoiceLink"/);
assert.match(linkedin, /Kova LinkedIn Headshot Sprint invoice request/);
assert.match(linkedin, /Estimated paid orders to recover fee:/);
assert.match(linkedin, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(linkedin, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));
verifyLinkedInHeadshotSprintRuntime(linkedin);

assert.match(profileHeadshot, /<title>AI Profile Picture & Headshot Generator \| Kova<\/title>/);
assert.match(profileHeadshot, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-profile-headshot-generator\/">/);
assert.match(profileHeadshot, /profile headshot/i);
assert.match(profileHeadshot, /Professional Headshot Sprint/);
assert.match(profileHeadshot, /290,000 KRW/);
assert.match(profileHeadshot, /990,000 KRW/);
assert.match(profileHeadshot, /2,900,000 KRW\+/);
assert.match(profileHeadshot, /id="proHeadshotBuilder"/);
assert.match(profileHeadshot, /id="proHeadshotPackage"/);
assert.match(profileHeadshot, /id="proHeadshotSource"/);
assert.match(profileHeadshot, /id="proHeadshotUse"/);
assert.match(profileHeadshot, /id="proHeadshotProfileLink"/);
assert.match(profileHeadshot, /id="proHeadshotDeadline"/);
assert.match(profileHeadshot, /id="proHeadshotEmailPreview"/);
assert.match(profileHeadshot, /id="proHeadshotInvoiceLink"/);
assert.match(profileHeadshot, /Source photo readiness checker/);
assert.match(profileHeadshot, /id="proSourceReadinessChecker"/);
assert.match(profileHeadshot, /id="proReadinessFaceVisible"/);
assert.match(profileHeadshot, /id="proReadinessLighting"/);
assert.match(profileHeadshot, /id="proReadinessNoObstruction"/);
assert.match(profileHeadshot, /id="proReadinessReferenceReady"/);
assert.match(profileHeadshot, /id="proReadinessScore"/);
assert.match(profileHeadshot, /id="proReadinessRecommendation"/);
assert.match(profileHeadshot, /id="proReadinessInvoiceNote"/);
assert.match(profileHeadshot, /Source photo readiness:/);
assert.match(profileHeadshot, /function updateProHeadshotBrief/);
assert.match(profileHeadshot, /Estimated paid orders to recover fee:/);
assert.match(profileHeadshot, /invoice button only opens a draft email for manual review/);
assert.match(profileHeadshot, /mailto:alyduho984530@gmail\.com\?subject=Kova%20Professional%20Headshot%20Sprint%20invoice%20request/);
assert.match(profileHeadshot, /\.\.\/ai-linkedin-photo-generator\//);
assert.match(profileHeadshot, /\.\.\/team-headshot-sprint\//);
assert.match(profileHeadshot, /\.\.\/ai-hiring-page-headshots\//);
assert.match(profileHeadshot, /\.\.\/ai-corporate-headshot-generator\//);

assert.match(avatar, /<title>AI Avatar Generator \| Kova<\/title>/);
assert.match(avatar, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-avatar-generator\/">/);
assert.match(avatar, /AI Avatar Generator/);
assert.match(avatar, /avatar/i);
assert.match(avatar, /profile picture/i);
assert.match(avatar, /20 starter credits/i);
assert.match(avatar, /about 2 standard image generations/i);
assert.match(avatar, /10 credits per standard image generation/i);
assert.match(avatar, /assets\/anime\.webp/);
assert.match(avatar, /assets\/profile_headshot_male_after\.webp/);
assert.match(avatar, /assets\/figurine\.webp/);
assert.match(avatar, /application\/ld\+json/);
assert.match(avatar, /SoftwareApplication/);
assert.match(avatar, /\.\.\/download\/index\.html/);
assert.match(avatar, /\.\.\/pricing\//);
assert.match(avatar, /\.\.\/examples\//);
assert.match(avatar, /\.\.\/ai-photo-editor-styles\//);
assert.match(avatar, /\.\.\/ai-anime-portrait-generator\//);
assert.match(avatar, /\.\.\/ai-profile-headshot-generator\//);
assert.match(avatar, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(avatar, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(anime, /<title>AI Anime Portrait Generator \| Kova<\/title>/);
assert.match(anime, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-anime-portrait-generator\/">/);
assert.match(anime, /AI Anime Portrait Generator/);
assert.match(anime, /Anime Portrait/);
assert.match(anime, /assets\/anime\.webp/);
assert.match(anime, /application\/ld\+json/);
assert.match(anime, /SoftwareApplication/);
assert.match(anime, /\.\.\/download\/index\.html/);
assert.match(anime, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(anime, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));
assert.match(anime, /\.\.\/pricing\//);
assert.match(anime, /\.\.\/ai-photo-editor-styles\//);
assert.match(anime, /\.\.\/ai-figurine-generator\//);
assert.match(anime, /\.\.\/ai-profile-headshot-generator\//);

assert.match(dating, /<title>AI Dating Profile Picture Generator \| Kova<\/title>/);
assert.match(dating, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-dating-profile-picture-generator\/">/);
assert.match(dating, /AI Dating Profile Picture Generator/);
assert.match(dating, /dating profile/i);
assert.match(dating, /profile picture/i);
assert.match(dating, /20 starter credits/i);
assert.match(dating, /about 2 standard image generations/i);
assert.match(dating, /10 credits per standard image generation/i);
assert.match(dating, /assets\/profile_headshot_male_before\.webp/);
assert.match(dating, /assets\/profile_headshot_male_after\.webp/);
assert.match(dating, /assets\/profile_headshot_female_before\.webp/);
assert.match(dating, /assets\/profile_headshot_female_after\.webp/);
assert.match(dating, /application\/ld\+json/);
assert.match(dating, /SoftwareApplication/);
assert.match(dating, /Dating Profile Photo Sprint/);
assert.match(dating, /149,000 KRW/);
assert.match(dating, /390,000 KRW/);
assert.match(dating, /990,000 KRW\+/);
assert.match(dating, /id="datingSprintBuilder"/);
assert.match(dating, /id="datingSprintPackage"/);
assert.match(dating, /id="datingSprintSource"/);
assert.match(dating, /id="datingSprintGoal"/);
assert.match(dating, /id="datingSprintProfileLink"/);
assert.match(dating, /id="datingSprintDeadline"/);
assert.match(dating, /id="datingSprintEmailPreview"/);
assert.match(dating, /id="datingSprintInvoiceLink"/);
assert.match(dating, /Source photo readiness checker/);
assert.match(dating, /id="datingSourceReadinessChecker"/);
assert.match(dating, /id="datingReadinessFaceVisible"/);
assert.match(dating, /id="datingReadinessLighting"/);
assert.match(dating, /id="datingReadinessPhotoVariety"/);
assert.match(dating, /id="datingReadinessReferenceReady"/);
assert.match(dating, /id="datingReadinessScore"/);
assert.match(dating, /id="datingReadinessRecommendation"/);
assert.match(dating, /id="datingReadinessInvoiceNote"/);
assert.match(dating, /Profile photo readiness:/);
assert.match(dating, /function updateDatingSprintBrief/);
assert.match(dating, /Estimated paid orders to recover fee:/);
assert.match(dating, /Profile sprint invoices stay manual for review/);
assert.match(dating, /mailto:alyduho984530@gmail\.com\?subject=Kova%20Dating%20Profile%20Photo%20Sprint%20invoice%20request/);
assert.match(dating, /\.\.\/download\/index\.html/);
assert.match(dating, /\.\.\/pricing\//);
assert.match(dating, /\.\.\/examples\//);
assert.match(dating, /\.\.\/ai-profile-headshot-generator\//);
assert.match(dating, /\.\.\/ai-photo-editor-styles\//);
assert.match(dating, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(dating, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));
verifyDatingSourceReadinessRuntime(dating);

assert.match(pet, /<title>AI Pet Portrait Generator \| Kova<\/title>/);
assert.match(pet, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-pet-portrait-generator\/">/);
assert.match(pet, /AI Pet Portrait Generator/);
assert.match(pet, /pet portrait/i);
assert.match(pet, /cat photo/i);
assert.match(pet, /dog photo/i);
assert.match(pet, /20 starter credits/i);
assert.match(pet, /about 2 standard image generations/i);
assert.match(pet, /10 credits per standard image generation/i);
assert.match(pet, /Pet Portrait Sprint/);
assert.match(pet, /149,000 KRW/);
assert.match(pet, /390,000 KRW/);
assert.match(pet, /990,000 KRW\+/);
assert.match(pet, /id="petPortraitBuilder"/);
assert.match(pet, /id="petPortraitPackage"/);
assert.match(pet, /id="petPortraitSource"/);
assert.match(pet, /id="petPortraitGoal"/);
assert.match(pet, /id="petPortraitPetType"/);
assert.match(pet, /id="petPortraitPhotoLink"/);
assert.match(pet, /id="petPortraitDeadline"/);
assert.match(pet, /id="petPortraitEmailPreview"/);
assert.match(pet, /id="petPortraitInvoiceLink"/);
assert.match(pet, /Estimated paid orders to recover fee:/);
assert.match(pet, /Pet sprint invoices stay manual for review/);
assert.match(pet, /mailto:alyduho984530@gmail\.com\?subject=Kova%20Pet%20Portrait%20Sprint%20invoice%20request/);
assert.match(pet, /application\/ld\+json/);
assert.match(pet, /SoftwareApplication/);
assert.match(pet, /download\/Icon\.png/);
assert.match(pet, /\.\.\/download\/index\.html/);
assert.match(pet, /\.\.\/pricing\//);
assert.match(pet, /\.\.\/examples\//);
assert.match(pet, /\.\.\/ai-photo-editor-styles\//);
assert.match(pet, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(pet, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));
verifyPetPortraitSprintRuntime(pet);

assert.match(journal, /<title>AI Journal Cover Generator \| Kova<\/title>/);
assert.match(journal, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-journal-cover-generator\/">/);
assert.match(journal, /AI Journal Cover Generator/);
assert.match(journal, /journal cover visuals/i);
assert.match(journal, /memory covers/i);
assert.match(journal, /reflection cards/i);
assert.match(journal, /20 starter credits/i);
assert.match(journal, /about 2 standard image generations/i);
assert.match(journal, /10 credits per standard image generation/i);
assert.match(journal, /SoftwareApplication/);
assert.match(journal, /FAQPage/);
assert.match(journal, /assets\/polaroid\.webp/);
assert.match(journal, /assets\/profile_headshot\.webp/);
assert.match(journal, /assets\/anime\.webp/);
assert.match(journal, /\.\.\/download\/index\.html/);
assert.match(journal, /\.\.\/pricing\//);
assert.match(journal, /\.\.\/examples\//);
assert.match(journal, /\.\.\/ai-photo-editor-styles\//);
assert.match(journal, /id="journalCoverSprintBuilder"/);
assert.match(journal, /Journal Cover Sprint brief builder/);
assert.match(journal, /id="journalCoverPackage"/);
assert.match(journal, /id="journalCoverSource"/);
assert.match(journal, /id="journalCoverGoal"/);
assert.match(journal, /id="journalCoverAov"/);
assert.match(journal, /id="journalCoverReference"/);
assert.match(journal, /id="journalCoverEmailPreview"/);
assert.match(journal, /id="journalCoverInvoiceLink"/);
assert.match(journal, /Kova Journal Cover Sprint invoice request/);
assert.match(journal, /Estimated paid orders to recover fee:/);
assert.match(journal, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(journal, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));
verifyJournalCoverSprintRuntime(journal);

assert.match(privacy, /Privacy Policy/);
assert.match(privacy, /Kova/);
assert.match(privacy, /Firebase/);
assert.match(privacy, /RevenueCat/);
assert.match(privacy, /Cloudflare R2/);
assert.match(privacy, /public community/i);
assert.match(privacy, /delete/i);
assert.match(privacy, new RegExp(contactEmail));

assert.match(terms, /Terms of Service/);
assert.match(terms, /Credits, Purchases, and Subscriptions/);
assert.match(terms, /AI Generated Output/);
assert.match(terms, /Acceptable Use/);
assert.match(terms, /Privacy Policy/);
assert.match(terms, new RegExp(contactEmail));

assert.match(support, /Kova Support/);
assert.match(support, /restore purchases/i);
assert.match(support, /credits/i);
assert.match(support, /account deletion/i);
assert.match(support, /privacy\.html/);
assert.match(support, /terms\.html/);
assert.match(support, new RegExp(contactEmail));

verifyProHeadshotReadinessRuntime(profileHeadshot);

console.log("Kova public pages verification passed");
