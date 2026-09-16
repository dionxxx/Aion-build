// workforce.js
const AION_WORKFORCE_ROSTER = [
  { id: "research", name: "Research Agent" },
  { id: "prospecting", name: "Prospecting Agent" },
  { id: "attraction", name: "Attraction Agent" },
  { id: "content", name: "Content Agent" },
  { id: "qualification", name: "Qualification Agent" },
  { id: "leadIntel", name: "Lead Intelligence Agent" },
  { id: "sales", name: "Follow-up / Sales Agent" },
  { id: "analytics", name: "Analytics Agent" }
];
function renderWorkforceRoster() {
  const list = document.getElementById("workforceList");
  const summary = document.getElementById("workforceSummary");
  if (!list) return;
  list.innerHTML = "";
  AION_WORKFORCE_ROSTER.forEach((spec) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="wf-name"><span class="wf-dot"></span>${spec.name}</span>
      <span class="wf-status">Not active</span>
    `;
    list.appendChild(li);
  });
  if (summary) summary.textContent = `0/${AION_WORKFORCE_ROSTER.length} Active — arrives Milestone 3`;
}
