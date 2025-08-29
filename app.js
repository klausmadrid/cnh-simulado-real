// CNH Simulado Real — App JS (v0.4: tema Claro/Escuro + seletor + timer 50min + corte + CSV)

const state = {
  questions: [],
  pool: [],
  idx: 0,
  mode: null, // 'study' | 'quiz' | 'srs'
  correctCount: 0,
  answers: {},
  current: null,
};

const THEMES = [
  { id: "leg", name: "Legislação de Trânsito" },
  { id: "dd",  name: "Direção Defensiva" },
  { id: "ps",  name: "Primeiros Socorros" },
  { id: "ma",  name: "Meio Ambiente e Cidadania" },
  { id: "nv",  name: "Noções do Veículo" }
];

const SRS_KEY   = "cnh_srs_v1";
const STATS_KEY = "cnh_stats_v1";
const THEME_KEY = "cnh_theme_v1";

// ===== Util =====
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
const today = () => new Date().toISOString().slice(0,10);
const loadJSON = (url) => fetch(url).then(r=>r.json());

// ===== Tema (Claro/Escuro) =====
function applyTheme(theme){
  const t = (theme === "dark") ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", t);
  try{ localStorage.setItem(THEME_KEY, t); }catch(e){}
  const sel = $("#the
