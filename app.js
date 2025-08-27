
// CNH Simulado Real — App JS
const state = {
  questions: [],
  pool: [], // ids da sessão
  idx: 0,
  mode: null, // 'study' | 'quiz' | 'srs'
  correctCount: 0,
  answers: {}, // id -> {picked, correct}
  current: null,
};

const THEMES = [
  { id: "leg", name: "Legislação de Trânsito" },
  { id: "dd",  name: "Direção Defensiva" },
  { id: "ps",  name: "Primeiros Socorros" },
  { id: "ma",  name: "Meio Ambiente e Cidadania" },
  { id: "nv",  name: "Noções do Veículo" }
];

const SRS_KEY = "cnh_srs_v1";
const STATS_KEY = "cnh_stats_v1";

// Util
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
const today = () => new Date().toISOString().slice(0,10);

function loadJSON(url){
  return fetch(url).then(r=>r.json());
}

function loadSRS(){
  try{ return JSON.parse(localStorage.getItem(SRS_KEY) || "{}"); } catch(e){ return {}; }
}
function saveSRS(srs){ localStorage.setItem(SRS_KEY, JSON.stringify(srs)); }

function loadStats(){
  try{ return JSON.parse(localStorage.getItem(STATS_KEY) || '{"done":0,"correct":0}'); } catch(e){ return {done:0,correct:0}; }
}
function saveStats(st){ localStorage.setItem(STATS_KEY, JSON.stringify(st)); }

// SRS — SM-2 simplificado
function srsUpdate(item, wasCorrect){
  // item = { ease, interval, reps, due }
  let ease = item.ease ?? 2.5;
  let reps = item.reps ?? 0;
  let interval = item.interval ?? 0;

  if(wasCorrect){
    if(reps === 0){ interval = 1; }
    else if(reps === 1){ interval = 6; }
    else { interval = Math.round(interval * ease); }
    reps += 1;
    ease = Math.max(1.3, ease + 0.1);
  } else {
    reps = 0;
    interval = 1;
    ease = Math.max(1.3, ease - 0.2);
  }
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);
  return { ease, reps, interval, due: dueDate.toISOString().slice(0,10) };
}

function nextDue(srs){
  const due = [];
  for(const q of state.questions){
    const it = srs[q.id];
    if(!it || (it && it.due <= today())){
      due.push(q.id);
    }
  }
  return shuffle(due).slice(0, 20); // até 20 por sessão
}

// Render helpers
function renderThemes(){
  const el = $("#themes");
  el.innerHTML = THEMES.map(t=>`<button class="secondary theme" data-id="${t.id}">${t.name}</button>`).join("");
  el.querySelectorAll(".theme").forEach(btn => {
    btn.addEventListener("click", () => startStudy(btn.dataset.id));
  });
}

function renderQuestion(q){
  $("#qarea").innerHTML = `
    <div class="card">
      <div><span class="badge">${q.moduleName}</span><span class="badge">Dificuldade: ${q.difficulty||1}</span></div>
      <h3>${q.stem}</h3>
      ${q.options.map((op,i)=>`<div class="option" data-i="${i}">${String.fromCharCode(65+i)}) ${op}</div>`).join("")}
      <div class="explain hidden" id="expl">${q.explain || ""}</div>
    </div>
  `;
  $$("#qarea .option").forEach(op => {
    op.addEventListener("click", () => pickAnswer(q, parseInt(op.dataset.i,10)));
  });
}

function pickAnswer(q, i){
  const correctIndex = q.answerIndex;
  const nodes = $$("#qarea .option");
  nodes.forEach((n,idx)=>{
    if(idx === correctIndex) n.classList.add("correct");
    if(idx === i && i !== correctIndex) n.classList.add("wrong");
  });
  $("#expl").classList.remove("hidden");

  state.answers[q.id] = { picked: i, correct: i === correctIndex };
  if(i === correctIndex) state.correctCount++;

  // stats
  const st = loadStats();
  st.done += 1;
  if(i === correctIndex) st.correct += 1;
  saveStats(st);

  // SRS update se modo srs
  if(state.mode === "srs"){
    const srs = loadSRS();
    srs[q.id] = srsUpdate(srs[q.id] || {}, i === correctIndex);
    saveSRS(srs);
  }
}

function showCurrent(){
  const qid = state.pool[state.idx];
  const q = state.questions.find(x => x.id === qid);
  state.current = q;
  $("#qmeta").textContent = `Questão ${state.idx+1}/${state.pool.length}`;
  renderQuestion(q);
}

function startStudy(themeId){
  state.mode = "study";
  const pool = state.questions.filter(q => q.module === themeId).map(q=>q.id);
  state.pool = shuffle(pool).slice(0, 20);
  state.idx = 0; state.correctCount = 0; state.answers = {};
  $("#menu").classList.add("hidden");
  $("#config").classList.add("hidden");
  $("#quiz").classList.remove("hidden");
  showCurrent();
}

function startQuiz(){
  state.mode = "quiz";
  state.pool = shuffle(state.questions.map(q=>q.id)).slice(0, 30);
  state.idx = 0; state.correctCount = 0; state.answers = {};
  $("#menu").classList.add("hidden");
  $("#config").classList.add("hidden");
  $("#quiz").classList.remove("hidden");
  showCurrent();
}

function startSRS(){
  state.mode = "srs";
  const srs = loadSRS();
  const pool = nextDue(srs);
  if(pool.length === 0){
    alert("Nada para revisar agora. Resolva algumas questões no modo Estudo/Simulado primeiro.");
    return;
  }
  state.pool = pool;
  state.idx = 0; state.correctCount = 0; state.answers = {};
  $("#menu").classList.add("hidden");
  $("#config").classList.add("hidden");
  $("#quiz").classList.remove("hidden");
  showCurrent();
}

function showResults(){
  $("#quiz").classList.add("hidden");
  $("#results").classList.remove("hidden");
  const pct = Math.round((state.correctCount / state.pool.length) * 100);
  const byTheme = {};
  for(const qid of Object.keys(state.answers)){
    const q = state.questions.find(x => x.id === qid);
    const ok = state.answers[qid].correct;
    byTheme[q.moduleName] = byTheme[q.moduleName] || {done:0,ok:0};
    byTheme[q.moduleName].done += 1;
    if(ok) byTheme[q.moduleName].ok += 1;
  }
  const lines = Object.entries(byTheme).map(([name,v])=>{
    const p = Math.round((v.ok/v.done)*100);
    return `<li>${name}: ${v.ok}/${v.done} (${p}%)</li>`;
  }).join("");
  $("#summary").innerHTML = `<p>Acertos: <strong>${state.correctCount}/${state.pool.length}</strong> — ${pct}%</p><ul>${lines}</ul>`;
}

function updateStats(){
  const st = loadStats();
  const pct = st.done ? Math.round((st.correct/st.done)*100) : 0;
  $("#statsList").innerHTML = `
    <li>Questões respondidas (histórico): ${st.done}</li>
    <li>Acertos (histórico): ${st.correct} — ${pct}%</li>
    <li>Revisões agendadas para hoje: ${nextDue(loadSRS()).length}</li>
  `;
}

// Events
window.addEventListener("load", async () => {
  // PWA
  if("serviceWorker" in navigator){
    try { navigator.serviceWorker.register("./sw.js"); } catch(e){}
  }
  const data = await loadJSON("./questions.json");
  state.questions = data.questions.map(q => ({
    ...q,
    moduleName: THEMES.find(t=>t.id===q.module)?.name || q.module
  }));

  $("#btn-study").addEventListener("click", () => {
    $("#menu").classList.add("hidden");
    $("#config").classList.remove("hidden");
  });
  $("#btn-quiz").addEventListener("click", startQuiz);
  $("#btn-srs").addEventListener("click", startSRS);
  $("#btn-stats").addEventListener("click", () => {
    $("#menu").classList.add("hidden");
    $("#stats").classList.remove("hidden");
    updateStats();
  });

  $("#back1").addEventListener("click", () => { $("#config").classList.add("hidden"); $("#menu").classList.remove("hidden"); });
  $("#back2").addEventListener("click", () => { $("#results").classList.add("hidden"); $("#menu").classList.remove("hidden"); });
  $("#back3").addEventListener("click", () => { $("#stats").classList.add("hidden"); $("#menu").classList.remove("hidden"); });
  $("#again").addEventListener("click", startQuiz);

  $("#prev").addEventListener("click", () => {
    if(state.idx>0){ state.idx--; showCurrent(); }
  });
  $("#next").addEventListener("click", () => {
    if(state.idx<state.pool.length-1){ state.idx++; showCurrent(); }
    else { showResults(); }
  });
  $("#showAnswer").addEventListener("click", () => {
    const expl = $("#expl");
    if(expl) expl.classList.remove("hidden");
    // Marca visualmente a correta
    $$("#qarea .option").forEach((n,idx)=>{
      if(idx === state.current.answerIndex) n.classList.add("correct");
    });
  });

  renderThemes();
});
