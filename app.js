// app.js
// UI wiring: navigation, mobile drawer, composer submit, quick-action chips, greeting.
// Non-Home/Live nav items are truthfully labeled placeholders — no fake data,
// per the non-negotiable product rules (no fake leads/analytics/content).

const PLACEHOLDER_COPY = {
  conversations: ["Conversations", "Full conversation history lands in Milestone 2, once memory is persistent."],
  business: ["Business", "The Business World Model — identity, products, audience, goals — is built in Milestone 2."],
  leads: ["Leads", "Real lead capture and pipeline arrive once Website/Receptionist and CRM connections exist (Milestone 3–4)."],
  content: ["Content", "The Content Agent activates in Milestone 3. Right now, ask AION directly on Home and it will reason about content with Gemini."],
  website: ["Website", "Website inspection and the Landing Page Agent arrive in Milestone 3–4."],
  analytics: ["Analytics", "Real analytics require real activity to measure — this fills in as missions start running in Milestone 3."],
  specialists: ["Specialists", "The workforce roster is visible on Home. Specialists actually execute starting Milestone 3."],
  missions: ["Missions", "The durable Mission Engine — objective, baseline, target, deadline, tasks — is built in Milestone 3."],
  activity: ["Activity", "The AI Activity feed starts populating once specialists are doing real work in Milestone 3."],
  integrations: ["Integrations", "Connection management (social, calendar, CRM, etc.) is built out in Milestone 4."],
  permissions: ["Permissions", "OFF / VIEW_ONLY / APPROVAL_REQUIRED / AUTOMATIC controls arrive alongside real actions in Milestone 3–4."],
  settings: ["Settings", "Account and billing settings are built out around Milestone 4–5."]
};

const QUICK_ACTIONS = [
  { label: "Find leads", message: "Help me find qualified leads for my business." },
  { label: "Create content", message: "Create content for this week." },
  { label: "Analyze business", message: "How is my business doing?" },
  { label: "More…", message: null }
];

function initNav(items) {
  items.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      setActiveNav(view);
      showView(view, cleanLabel(btn.textContent));
      closeDrawer();
    });
  });
}

function setActiveNav(view) {
  document.querySelectorAll(".nav-item, .mtab[data-view]").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === view || (view === "live" && b.dataset.view === "live"));
  });
}

function cleanLabel(text) {
  return text.replace(/^[^\w]+/, "").trim();
}

function showView(viewKey, label) {
  const home = document.getElementById("view-home");
  const placeholder = document.getElementById("view-placeholder");

  if (viewKey === "home" || viewKey === "live") {
    home.classList.remove("hidden");
    placeholder.classList.add("hidden");
    return;
  }

  home.classList.add("hidden");
  placeholder.classList.remove("hidden");

  const copy = PLACEHOLDER_COPY[viewKey] || [label, "Not built yet."];
  document.getElementById("placeholderTitle").textContent = copy[0];
  document.getElementById("placeholderText").textContent = copy[1];
}

function initComposer() {
  const form = document.getElementById("composerForm");
  const input = document.getElementById("composerInput");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value;
    if (!val.trim()) return;
    input.value = "";
    AionBrain.send(val);
  });
}

function insertQuickActions() {
  const log = document.getElementById("chatLog");
  const row = document.createElement("div");
  row.className = "quick-actions";
  QUICK_ACTIONS.forEach((qa) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "quick-chip";
    chip.textContent = qa.label;
    chip.addEventListener("click", () => {
      if (qa.message) {
        AionBrain.send(qa.message);
      } else {
        document.getElementById("composerInput").focus();
      }
    });
    row.appendChild(chip);
  });
  log.appendChild(row);
}

function openDrawer() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("drawerBackdrop").classList.add("open");
}
function closeDrawer() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("drawerBackdrop").classList.remove("open");
}

function initMobile() {
  document.getElementById("navToggle").addEventListener("click", openDrawer);
  document.getElementById("drawerBackdrop").addEventListener("click", closeDrawer);
  document.getElementById("moreTab").addEventListener("click", openDrawer);

  document.querySelectorAll(".mtab[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      setActiveNav(view);
      showView(view, cleanLabel(btn.textContent));
    });
  });
}

function initTopSearch() {
  document.getElementById("topSearchTrigger").addEventListener("click", () => {
    setActiveNav("home");
    showView("home");
    document.getElementById("composerInput").focus();
  });
}

function initVoiceButton() {
  document.getElementById("voiceBtn").addEventListener("click", () => {
    appendMessage(
      "error",
      "Voice isn't wired to real-time Gemini yet — that's a fast-follow inside Milestone 1's remaining work, not faked here. Text is fully live."
    );
  });
}

function initRefresh() {
  document.getElementById("refreshOps").addEventListener("click", () => {
    AionBrain.checkConnection();
  });
}

function greet() {
  appendMessage(
    "aion",
    "Hi — I'm AION. I'm running at Milestone 1 right now, so I can reason with you honestly and start shaping a plan, but I don't have real tools, memory, or a working workforce connected yet. What would you like us to accomplish?"
  );
  insertQuickActions();
}

document.addEventListener("DOMContentLoaded", () => {
  renderWorkforceRoster();
  initNav(document.querySelectorAll(".nav-item"));
  initComposer();
  initMobile();
  initTopSearch();
  initVoiceButton();
  initRefresh();
  AionBrain.checkConnection();
  greet();
});
