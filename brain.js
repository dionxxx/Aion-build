// brain.js
const AionBrain = {
  ENDPOINT: "/api/Aion",
  BUSINESS_ID: "local-preview-business",
  history: [],
  busy: false,
  async checkConnection() {
    const topDot = document.querySelector("#connectionBadge .dot");
    const topText = document.getElementById("connectionText");
    const pill = document.getElementById("geminiPill");
    const setState = (dotClass, topLabel, pillLabel) => {
      topDot.className = "dot " + dotClass;
      topText.textContent = topLabel;
      pill.innerHTML = `<span class="dot ${dotClass}"></span> ${pillLabel}`;
    };
    try {
      const res = await fetch(this.ENDPOINT, { method: "GET" });
      const data = await res.json();
      if (res.ok && data.ok && data.geminiConfigured) {
        setState("dot-ok", "Online · M2", "Gemini Connected");
      } else if (res.ok && data.ok && !data.geminiConfigured) {
        setState("dot-error", "Key missing", "Gemini not configured");
      } else {
        setState("dot-error", "Unreachable", "Backend unreachable");
      }
    } catch (e) {
      setState("dot-error", "Unreachable", "Backend unreachable");
    }
  },
  async loadSavedState(onEmptyCallback) {
    try {
      const res = await fetch(`${this.ENDPOINT}?businessId=${encodeURIComponent(this.BUSINESS_ID)}`, { method: "GET" });
      const data = await res.json();
      const saved = data && data.savedState;
      if (saved && Array.isArray(saved.history) && saved.history.length) {
        this.history = saved.history;
        const log = document.getElementById("chatLog");
        log.innerHTML = "";
        saved.history.forEach((m) => appendMessage(m.role === "model" ? "aion" : "user", m.text));
        insertQuickActions();
        AionMissionView.setFactsOnly(saved.facts || []);
        if (saved.lastObjective) {
          AionMissionView.update({
            objective: saved.lastObjective,
            understanding: null,
            plan: saved.lastPlan || [],
            executionState: saved.lastExecutionState || null,
            savedFacts: saved.facts || []
          });
        }
      } else {
        onEmptyCallback();
      }
    } catch (e) {
      onEmptyCallback();
    }
  },
  async send(message) {
    if (this.busy || !message.trim()) return;
    this.busy = true;
    setComposerBusy(true);
    appendMessage("user", message);
    this.history.push({ role: "user", text: message });
    const typingEl = appendTyping();
    try {
      const res = await fetch(this.ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, businessId: this.BUSINESS_ID, history: this.history.slice(0, -1) })
      });
      const data = await res.json();
      typingEl.remove();
      if (!res.ok || !data.ok) {
        const errText = data && data.error ? data.error : "I hit a problem while working on that. Your work is safe.";
        appendMessage("error", errText);
        return;
      }
      appendMessage("aion", data.reply);
      this.history.push({ role: "model", text: data.reply });
      AionMissionView.update(data);
    } catch (networkErr) {
      typingEl.remove();
      appendMessage("error", "AI reasoning unavailable — connection required. Your work is safe; try again.");
    } finally {
      this.busy = false;
      setComposerBusy(false);
    }
  }
};
function appendMessage(role, text) {
  const log = document.getElementById("chatLog");
  const el = document.createElement("div");
  el.className = role === "user" ? "msg msg-user" : role === "error" ? "msg msg-error" : "msg msg-aion";
  el.textContent = text;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}
function appendTyping() {
  const log = document.getElementById("chatLog");
  const el = document.createElement("div");
  el.className = "typing";
  el.innerHTML = "<span></span><span></span><span></span>";
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}
function setComposerBusy(isBusy) {
  document.getElementById("sendBtn").disabled = isBusy;
  document.getElementById("composerInput").disabled = isBusy;
}
