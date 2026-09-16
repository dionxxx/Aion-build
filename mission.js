// mission.js
const AionMissionView = {
  state: { objective: null, understanding: null, plan: [], executionState: null, facts: [] },
  EXECUTION_LABELS: {
    UNDERSTANDING: { label: "Understanding", cls: "badge" },
    PLANNED: { label: "Planned", cls: "badge" },
    WAITING_FOR_APPROVAL: { label: "Waiting — Approval", cls: "badge badge-waiting" },
    WAITING_FOR_CONNECTION: { label: "Waiting — Connection", cls: "badge badge-waiting" },
    WAITING_FOR_HUMAN: { label: "Waiting — You", cls: "badge badge-waiting" },
    BLOCKED: { label: "Blocked", cls: "badge badge-blocked" }
  },
  update(brainResponse) {
    this.state.objective = brainResponse.objective || null;
    this.state.understanding = brainResponse.understanding || null;
    this.state.plan = Array.isArray(brainResponse.plan) ? brainResponse.plan : [];
    this.state.executionState = brainResponse.executionState || null;
    if (Array.isArray(brainResponse.savedFacts)) this.state.facts = brainResponse.savedFacts;
    this.render();
  },
  setFactsOnly(facts) {
    this.state.facts = Array.isArray(facts) ? facts : [];
    this.renderFacts();
  },
  render() {
    const badge = document.getElementById("execStateBadge");
    const objBody = document.getElementById("objectiveBody");
    const planBody = document.getElementById("planBody");
    if (this.state.executionState && this.EXECUTION_LABELS[this.state.executionState]) {
      const meta = this.EXECUTION_LABELS[this.state.executionState];
      badge.textContent = meta.label;
      badge.className = meta.cls;
    } else {
      badge.textContent = "—";
      badge.className = "badge badge-muted";
    }
    if (this.state.objective && this.state.objective.statement) {
      objBody.innerHTML = `
        <div style="margin-bottom:6px;"><strong>${escapeHtml(this.state.objective.statement)}</strong></div>
        <div class="muted small">Success: ${escapeHtml(this.state.objective.successCriteria || "not yet defined")}</div>
        <div class="muted small">Gap: ${escapeHtml(this.state.objective.gap || "unknown")}</div>
      `;
    } else {
      objBody.innerHTML = `
        <div class="muted">No active outcome yet. Tell AION what you want to accomplish.</div>
        ${this.state.understanding ? `<div class="muted small" style="margin-top:6px;">${escapeHtml(this.state.understanding)}</div>` : ""}
      `;
    }
    if (this.state.plan.length) {
      planBody.innerHTML = this.state.plan.map((p) => `
        <div class="plan-step">
          <span class="step-specialist">${escapeHtml(p.specialist || "AION")}</span>
          <span>${escapeHtml(p.step)}</span>
          <span class="step-status">${escapeHtml(p.status || "PLANNED")}</span>
        </div>`).join("");
    } else {
      planBody.innerHTML = `<div class="muted">All steps stay PLANNED until Milestone 3 gives specialists the ability to actually run them.</div>`;
    }
    this.renderFacts();
  },
  renderFacts() {
    const factsBody = document.getElementById("factsBody");
    if (!factsBody) return;
    if (this.state.facts && this.state.facts.length) {
      factsBody.innerHTML = this.state.facts.map((f) => `<span class="fact-chip">${escapeHtml(f)}</span>`).join("");
    } else {
      factsBody.innerHTML = `<div class="muted">Nothing saved yet — facts AION learns about your business will persist here across sessions.</div>`;
    }
  }
};
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}
