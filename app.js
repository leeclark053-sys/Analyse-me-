const CHECKS = [
  { id: "sleep_late_frag", label: "Sleep starts later or becomes fragmented", weight: 3, phase: "14–10 days", confidence: "85–90%" },
  { id: "wired_tired", label: "Wired but tired / exhausted", weight: 3, phase: "14–10 days", confidence: "80–90%" },
  { id: "analysing_fixation", label: "Increased analysing / researching / fixation", weight: 2, phase: "14–10 days", confidence: "75–85%" },
  { id: "mild_agitation", label: "Mild internal agitation", weight: 2, phase: "14–10 days", confidence: "70–80%" },

  { id: "fragmented_sleep_clear", label: "Sleep clearly fragmented", weight: 4, phase: "10–7 days", confidence: "90–95%" },
  { id: "overstim_exhausted", label: "Brain overstimulated despite exhaustion", weight: 4, phase: "10–7 days", confidence: "90%" },
  { id: "racing_switching", label: "Racing / switching thoughts", weight: 4, phase: "10–7 days", confidence: "85–90%" },
  { id: "fixation_harder", label: "Fixation harder to stop", weight: 3, phase: "10–7 days", confidence: "85%" },
  { id: "physical_agitation", label: "Physical agitation: feet / jaw / legs", weight: 3, phase: "10–7 days", confidence: "80–85%" },
  { id: "doom_dread", label: "Doom / dread feeling increases", weight: 2, phase: "10–7 days", confidence: "80%" },

  { id: "severe_insomnia", label: "Severe insomnia or very broken sleep", weight: 5, phase: "7–3 days", confidence: "95%" },
  { id: "depression_agitation", label: "Depression + agitation together", weight: 5, phase: "7–3 days", confidence: "95%" },
  { id: "thought_loops", label: "Thought loops / rapid switching", weight: 4, phase: "7–3 days", confidence: "90–95%" },
  { id: "compulsive_overfocus", label: "Compulsive overfocus", weight: 3, phase: "7–3 days", confidence: "85–90%" },
  { id: "exhausted_driven", label: "Exhausted but internally driven", weight: 5, phase: "7–3 days", confidence: "90–95%" },

  { id: "almost_no_sleep", label: "Very broken sleep / almost no sleep", weight: 6, phase: "3–1 days", confidence: "95%" },
  { id: "severe_inner_agitation", label: "Severe inner agitation", weight: 6, phase: "3–1 days", confidence: "95%" },
  { id: "marked_racing", label: "Marked racing / switching thoughts", weight: 6, phase: "3–1 days", confidence: "95%" },
  { id: "unable_settle", label: "Unable to mentally settle", weight: 6, phase: "3–1 days", confidence: "95%" },
  { id: "driven_peak", label: "Exhausted but driven", weight: 6, phase: "3–1 days", confidence: "95%" },

  { id: "unsafe_si", label: "Safety concern: suicidal thoughts feel unsafe, plans/intent, confusion, psychosis, or family cannot keep me safe", weight: 99, phase: "urgent", confidence: "crisis marker" }
];

const TIMELINE = [
  {
    title: "14–10 days before — Early warning",
    items: [
      "Sleep starts later / fragmented — 85–90%",
      "Wired but tired — 80–90%",
      "Increased analysing / researching / fixation — 75–85%",
      "Mild internal agitation — 70–80%"
    ],
    note: "Something feels off, but it may still look like anxiety or stress."
  },
  {
    title: "10–7 days before — Activation",
    items: [
      "Sleep clearly fragmented — 90–95%",
      "Brain overstimulated despite exhaustion — 90%",
      "Racing / switching thoughts — 85–90%",
      "Fixation harder to stop — 85%",
      "Physical agitation: feet / jaw / legs — 80–85%",
      "Doom / dread increases — 80%"
    ],
    note: "This is where it starts looking less like ordinary anxiety and more like episode build-up."
  },
  {
    title: "7–3 days before — Mixed build-up",
    items: [
      "Severe insomnia / very broken sleep — 95%",
      "Depression + agitation together — 95%",
      "Thought loops / rapid switching — 90–95%",
      "Exhausted but internally driven — 90–95%",
      "Compulsive overfocus — 85–90%"
    ],
    note: "Major threshold point: low mood plus activation together."
  },
  {
    title: "3–1 days before — Peak build-up",
    items: [
      "Very broken sleep / almost no sleep — 95%",
      "Severe inner agitation — 95%",
      "Marked racing / switching thoughts — 95%",
      "Unable to mentally settle — 95%",
      "Exhausted but driven — 95%"
    ],
    note: "This looks like active mixed-state build-up rather than just warning signs."
  }
];

const STORAGE_KEY = "moodEarlyWarningEntriesV1";

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function init() {
  document.getElementById("checkDate").value = todayISO();
  renderChecklist();
  renderTimeline();
  renderHistory();
  document.getElementById("calculateBtn").addEventListener("click", calculateAndShow);
  document.getElementById("saveBtn").addEventListener("click", saveToday);
  document.getElementById("resetBtn").addEventListener("click", clearTicks);
  document.getElementById("exportBtn").addEventListener("click", exportCSV);
  document.getElementById("deleteBtn").addEventListener("click", deleteAll);
}

function renderChecklist() {
  const wrap = document.getElementById("checklist");
  wrap.innerHTML = "";
  CHECKS.forEach(item => {
    const row = document.createElement("label");
    row.className = "check-item";
    row.innerHTML = `
      <input type="checkbox" data-id="${item.id}">
      <span>${item.label}</span>
      <span class="weight">${item.phase} • ${item.confidence}</span>
    `;
    wrap.appendChild(row);
  });
}

function renderTimeline() {
  const wrap = document.getElementById("timeline");
  wrap.innerHTML = "";
  TIMELINE.forEach(block => {
    const el = document.createElement("div");
    el.className = "time-block";
    el.innerHTML = `
      <h3>${block.title}</h3>
      <p class="muted">${block.note}</p>
      <ul>${block.items.map(i => `<li>${i}</li>`).join("")}</ul>
    `;
    wrap.appendChild(el);
  });
}

function getSelected() {
  return [...document.querySelectorAll("#checklist input:checked")].map(i => i.dataset.id);
}

function calculateRisk(selected = getSelected()) {
  const selectedItems = CHECKS.filter(c => selected.includes(c.id));
  if (selected.includes("unsafe_si")) {
    return {
      level: "CRISIS",
      score: 99,
      css: "risk-purple",
      title: "Urgent safety marker selected",
      advice: [
        "Do not manage this alone.",
        "Contact crisis team, NHS 111, A&E, or 999 depending on urgency.",
        "Involve Lisa/family now if available."
      ],
      medPrompt: "Follow your written clinical crisis plan. This app cannot advise medication in a crisis."
    };
  }

  const score = selectedItems.reduce((sum, item) => sum + item.weight, 0);
  const hasSleep = selected.some(id => ["sleep_late_frag","fragmented_sleep_clear","severe_insomnia","almost_no_sleep"].includes(id));
  const hasActivation = selected.some(id => ["wired_tired","overstim_exhausted","racing_switching","marked_racing","physical_agitation","severe_inner_agitation","unable_settle"].includes(id));
  const hasMixed = selected.includes("depression_agitation") || selected.includes("exhausted_driven") || selected.includes("driven_peak");

  if (score >= 24 || (hasSleep && hasActivation && hasMixed)) {
    return {
      level: "RED",
      score,
      css: "risk-red",
      title: "High risk pattern",
      advice: [
        "Your check-in matches the stronger 7–3 day / 3–1 day build-up pattern.",
        "Reduce stimulation, involve Lisa/family, and consider contacting the clinical team if this continues or worsens."
      ],
      medPrompt: "Medication prompt: only follow the rescue-medication plan Dan has written/agreed. This app should not decide dose."
    };
  }

  if (score >= 12 || (hasSleep && hasActivation)) {
    return {
      level: "AMBER",
      score,
      css: "risk-amber",
      title: "Early activation pattern",
      advice: [
        "Your check-in matches the 14–7 day early warning/activation pattern.",
        "Prioritise sleep protection, reduce researching/overstimulation, and watch for escalation tomorrow."
      ],
      medPrompt: "Medication prompt: if Dan has agreed rescue medication after one poor night of sleep, check that written plan."
    };
  }

  return {
    level: "GREEN",
    score,
    css: "risk-low",
    title: "Lower risk today",
    advice: [
      "No strong build-up pattern from today’s ticks.",
      "Keep routine steady and check again tomorrow."
    ],
    medPrompt: "No medication prompt from the app."
  };
}

function calculateAndShow() {
  const risk = calculateRisk();
  showResult(risk);
  return risk;
}

function showResult(risk) {
  const box = document.getElementById("resultBox");
  const badge = document.getElementById("riskBadge");
  badge.className = "risk-badge " + risk.css;
  badge.textContent = `${risk.level} • score ${risk.score}`;
  box.innerHTML = `
    <div class="result-title">${risk.title}</div>
    <p><strong>Risk:</strong> ${risk.level} | <strong>Score:</strong> ${risk.score}</p>
    <ul>${risk.advice.map(a => `<li>${a}</li>`).join("")}</ul>
    <p><strong>${risk.medPrompt}</strong></p>
  `;
}

function saveToday() {
  const selected = getSelected();
  const risk = calculateRisk(selected);
  showResult(risk);

  const entry = {
    date: document.getElementById("checkDate").value || todayISO(),
    selected,
    riskLevel: risk.level,
    score: risk.score,
    savedAt: new Date().toISOString()
  };

  const entries = loadEntries().filter(e => e.date !== entry.date);
  entries.push(entry);
  entries.sort((a,b) => b.date.localeCompare(a.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  renderHistory();
}

function loadEntries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function renderHistory() {
  const wrap = document.getElementById("history");
  const entries = loadEntries();
  if (!entries.length) {
    wrap.innerHTML = `<p class="muted">No saved check-ins yet.</p>`;
    return;
  }
  wrap.innerHTML = entries.slice(0, 30).map(e => `
    <div class="history-item">
      <strong>${e.date}</strong> — ${e.riskLevel} / score ${e.score}<br>
      <span class="muted">${e.selected.length} items ticked</span>
    </div>
  `).join("");
}

function clearTicks() {
  document.querySelectorAll("#checklist input").forEach(i => i.checked = false);
  document.getElementById("riskBadge").className = "risk-badge";
  document.getElementById("riskBadge").textContent = "Not checked";
  document.getElementById("resultBox").textContent = "Complete today’s check-in.";
}

function deleteAll() {
  if (!confirm("Delete all saved check-ins from this device?")) return;
  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
}

function exportCSV() {
  const entries = loadEntries();
  if (!entries.length) return alert("No saved entries to export.");
  const rows = [["date","riskLevel","score","selectedItems","savedAt"]];
  entries.forEach(e => rows.push([
    e.date,
    e.riskLevel,
    e.score,
    e.selected.join("|"),
    e.savedAt
  ]));
  const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mood-checkins.csv";
  a.click();
  URL.revokeObjectURL(url);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}

init();
