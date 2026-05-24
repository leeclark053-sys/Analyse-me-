const QUESTIONS = [
  { id: "almost_no_sleep", group: "Sleep", text: "Have you had very broken sleep or almost no sleep?", help: "This is one of the strongest early signs in your diary pattern.", weight: 6 },
  { id: "severe_insomnia", group: "Sleep", text: "Has sleep felt severely disrupted or impossible to settle into?", help: "Tick this if sleep is much worse than your usual bad night.", weight: 5 },
  { id: "depression_agitation", group: "Mood and energy", text: "Do you feel low or depressed but also agitated inside?", help: "This mixed feeling is important: low mood plus activation at the same time.", weight: 6 },
  { id: "exhausted_driven", group: "Mood and energy", text: "Do you feel exhausted but still internally driven?", help: "For example, tired but unable to fully stop, settle, or switch off.", weight: 5 },
  { id: "severe_inner_agitation", group: "Body signs", text: "Is the inner agitation strong today?", help: "This can feel like a restless charge in your body or nervous system.", weight: 5 },
  { id: "racing_switching", group: "Thoughts", text: "Are your thoughts racing or switching from thing to thing?", help: "Tick this if your thoughts keep jumping, looping, or speeding up.", weight: 5 },
  { id: "unable_settle", group: "Thoughts", text: "Are you struggling to mentally settle?", help: "For example, feeling unable to rest even when you want to.", weight: 5 },
  { id: "wired_tired", group: "Mood and energy", text: "Have you felt wired but exhausted?", help: "Your body feels tired but your mind or nervous system feels switched on.", weight: 4 },
  { id: "fragmented_sleep", group: "Sleep", text: "Has your sleep become clearly fragmented?", help: "Tick this if sleep has become broken, delayed, or lighter than normal.", weight: 4 },
  { id: "fixation", group: "Thoughts", text: "Have you been more fixated, analysing, researching, or checking?", help: "This includes getting stuck trying to understand, solve, or check things repeatedly.", weight: 3 },
  { id: "physical_agitation", group: "Body signs", text: "Have you noticed physical agitation?", help: "For example, feet rubbing, jaw tension, leg movement, toe clenching or restlessness.", weight: 3 },
  { id: "doom_dread", group: "Anxiety signs", text: "Has the doom or dread feeling increased?", help: "Tick this if the feeling of threat, fear, or something bad happening is stronger.", weight: 3 },
  { id: "overstimulation", group: "Triggers", text: "Have you been overstimulated by researching, screens, noise, or stress?", help: "This can lower your threshold even if it is not the main cause.", weight: 2 },
  { id: "stress_conflict", group: "Triggers", text: "Has there been emotional stress, conflict, or a major worry?", help: "Tick this if stress has been building or there has been a significant emotional trigger.", weight: 2 },
  { id: "isolation_rumination", group: "Triggers", text: "Have you been isolated and ruminating more than usual?", help: "This includes withdrawing, staying in bed, ignoring people, or looping on worries.", weight: 2 },
  { id: "med_change", group: "Triggers", text: "Has there been a recent medication change or withdrawal effect?", help: "Tick this if a dose change, stopping, or withdrawal symptoms may be affecting you.", weight: 3 },
  { id: "safety", group: "Safety", text: "Do suicidal thoughts feel unsafe, or are there plans, intent, confusion, psychosis, or family unable to keep you safe?", help: "If yes, this needs urgent real-world support, not just app tracking.", weight: 100 }
];

const GUIDE = [
  { title: "Day -14 to -10: early changes", text: "Sleep may start shifting, you may feel wired but tired, and analysing or fixation can increase." },
  { title: "Day -10 to -7: activation builds", text: "Sleep becomes more broken, thoughts may race or switch, and physical agitation can start to show." },
  { title: "Day -7 to -3: mixed build-up", text: "Low mood and agitation may appear together. Thought loops, overfocus and the exhausted-but-driven feeling become more noticeable." },
  { title: "Day -3 to -1: peak build-up", text: "Sleep may collapse further, agitation can become severe, and it may feel hard to mentally settle." }
];

const STORAGE_KEY = "analyseMeWarmEntriesV1";
let current = 0;
let answers = {};
let startedAt = null;

function qs(id) { return document.getElementById(id); }

function todayLabel() {
  const d = new Date();
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  qs(id).classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.screen === id));
  if (id === "guideScreen") renderGuide();
  if (id === "historyScreen") renderHistory();
}

function startCheck() {
  current = 0;
  answers = {};
  startedAt = new Date();
  qs("dateTimePill").textContent = startedAt.toLocaleString("en-GB");
  renderQuestion();
  showScreen("questionScreen");
}

function renderQuestion() {
  const q = QUESTIONS[current];
  qs("progressLabel").textContent = `Question ${current + 1} of ${QUESTIONS.length}`;
  qs("progressBar").style.width = `${((current + 1) / QUESTIONS.length) * 100}%`;
  qs("questionGroup").textContent = q.group;
  qs("questionText").textContent = q.text;
  qs("questionHelp").textContent = q.help;
  qs("answerTick").checked = !!answers[q.id];
  qs("backBtn").style.visibility = current === 0 ? "hidden" : "visible";
  qs("nextBtn").textContent = current === QUESTIONS.length - 1 ? "See today’s insight" : "Next";
}

function nextQuestion() {
  const q = QUESTIONS[current];
  answers[q.id] = qs("answerTick").checked;
  if (current < QUESTIONS.length - 1) {
    current++;
    renderQuestion();
  } else {
    renderInsight();
    showScreen("insightScreen");
  }
}

function backQuestion() {
  const q = QUESTIONS[current];
  answers[q.id] = qs("answerTick").checked;
  if (current > 0) {
    current--;
    renderQuestion();
  }
}

function selectedItems() {
  return QUESTIONS.filter(q => answers[q.id]);
}

function calculate() {
  const selected = selectedItems();
  const score = selected.reduce((sum, q) => sum + q.weight, 0);
  const hasSafety = answers.safety;
  const hasSleep = ["almost_no_sleep", "severe_insomnia", "fragmented_sleep"].some(id => answers[id]);
  const hasActivation = ["depression_agitation", "exhausted_driven", "severe_inner_agitation", "racing_switching", "unable_settle", "wired_tired"].some(id => answers[id]);
  const hasMixed = ["depression_agitation", "exhausted_driven", "almost_no_sleep", "severe_inner_agitation"].filter(id => answers[id]).length >= 2;

  if (hasSafety) {
    return {
      stage: "urgent support needed",
      title: "This sounds like a moment for extra support.",
      text: "I know this may feel frightening, but you do not need to handle it alone. Please involve Lisa or someone nearby and contact your crisis team, NHS 111, A&E or 999 depending on urgency.",
      advice: ["Stay with someone if possible.", "Move away from anything you could use to harm yourself.", "Use crisis support now rather than waiting.", "Keep the next step very simple: tell one person."],
      med: "Follow your written crisis plan. This app cannot advise medication in an emergency.",
      score
    };
  }

  if (score >= 28 || (hasSleep && hasActivation && hasMixed)) {
    return {
      stage: "mixed build-up or episode pattern",
      title: "Your answers suggest a mixed build-up pattern may be present.",
      text: "This does not mean anything bad is inevitable. It means the pattern looks worth taking seriously today, especially around sleep, agitation and racing thoughts.",
      advice: ["Lower stimulation for the rest of today.", "Pause symptom researching and repeated checking.", "Keep light, noise and screen use gentle.", "Let Lisa know what the app has noticed.", "Prioritise sleep protection and routine."],
      med: "If your agreed rescue-medication guidance applies, this would be a sensible time to follow that plan or contact your clinical team for advice.",
      score
    };
  }

  if (score >= 14 || (hasSleep && hasActivation)) {
    return {
      stage: "early build-up signs",
      title: "There are some early build-up signs today.",
      text: "This looks like a good time to simplify the evening, reduce stimulation, and keep an eye on sleep. You have spotted it early, which is useful.",
      advice: ["Make tonight quieter and more predictable.", "Avoid big decisions if possible.", "Reduce scrolling/research loops.", "Check in again tomorrow.", "Tell Lisa if symptoms increase."],
      med: "If your written plan says to use rescue medication after one poor night of sleep, check that plan and follow Dan’s guidance.",
      score
    };
  }

  return {
    stage: "settled or lower-signal day",
    title: "Today looks lower signal.",
    text: "Nothing in this check-in strongly suggests the usual build-up pattern. Keep the day steady and check again tomorrow.",
    advice: ["Keep routine gentle and steady.", "Do something low-pressure.", "Protect sleep tonight.", "Avoid over-analysing a single day."],
    med: "No rescue-plan prompt from today’s answers.",
    score
  };
}

function renderInsight() {
  const r = calculate();
  qs("insightTitle").textContent = r.title;
  qs("insightText").textContent = r.text;
  qs("signalCount").textContent = selectedItems().length;
  qs("adviceList").innerHTML = r.advice.map(a => `<li>${a}</li>`).join("");
  qs("medPrompt").textContent = r.med;
}

function saveCheck() {
  const r = calculate();
  const entry = {
    startedAt: (startedAt || new Date()).toISOString(),
    savedAt: new Date().toISOString(),
    stage: r.stage,
    signals: selectedItems().map(q => q.id),
    score: r.score
  };
  const entries = loadEntries();
  entries.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  renderHistory();
  alert("Check-in saved.");
}

function loadEntries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function renderGuide() {
  qs("guideList").innerHTML = GUIDE.map(g => `
    <div class="guide-block">
      <h3>${g.title}</h3>
      <p>${g.text}</p>
    </div>
  `).join("");
}

function renderHistory() {
  const entries = loadEntries();
  if (!entries.length) {
    qs("historyList").innerHTML = `<div class="history-item"><p>No saved check-ins yet.</p></div>`;
    return;
  }
  qs("historyList").innerHTML = entries.map(e => {
    const date = new Date(e.startedAt).toLocaleString("en-GB");
    return `<div class="history-item"><strong>${date}</strong><p>${e.stage} • ${e.signals.length} signals noticed</p></div>`;
  }).join("");
}

function exportCSV() {
  const entries = loadEntries();
  if (!entries.length) return alert("No saved check-ins to export.");
  const rows = [["startedAt","stage","signals","score","savedAt"]];
  entries.forEach(e => rows.push([e.startedAt, e.stage, e.signals.join("|"), e.score, e.savedAt]));
  const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "analyse-me-checkins.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function deleteAll() {
  if (!confirm("Delete all saved check-ins from this device?")) return;
  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
}

function init() {
  qs("dateTimePill").textContent = todayLabel();
  qs("startBtn").addEventListener("click", startCheck);
  qs("nextBtn").addEventListener("click", nextQuestion);
  qs("backBtn").addEventListener("click", backQuestion);
  qs("saveBtn").addEventListener("click", saveCheck);
  qs("newCheckBtn").addEventListener("click", startCheck);
  qs("exportBtn").addEventListener("click", exportCSV);
  qs("deleteBtn").addEventListener("click", deleteAll);

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => showScreen(btn.dataset.screen));
  });

  renderGuide();
  renderHistory();
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}

init();
