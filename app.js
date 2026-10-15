const CONFIG = Object.freeze({
  answerLength: 5,
  maxAttempts: 6,
  storageKey: "cacapalavras:v1",
  themes: {
    cordel: "Gráfica, brasileira e tátil.",
    observatorio: "Calma, misteriosa e tecnológica.",
    banca: "Quente, acessível e divertida."
  },
  answers: ["FESTA", "LIVRO", "NINHO", "PRAIA", "RISCO", "SABOR", "TEMPO", "VALOR"],
  validGuesses: [
    "ABRIR", "ACENO", "AMIGO", "AROMA", "ATRIO", "AVISO", "BANDO", "BARCO",
    "BEBER", "BRISA", "CALDO", "CAMPO", "CANTO", "CARRO", "CASAS", "CERTO",
    "CHAVE", "CLARO", "CORPO", "DANCA", "DADOS", "DENTE", "FELIZ", "FESTA",
    "FOLHA", "FORTE", "FRUTA", "GENTE", "GRUPO", "HORAS", "IDEIA", "IGUAL",
    "LIVRO", "LUZES", "MUNDO", "NINHO", "NOITE", "NORTE", "OLHAR", "PAPEL",
    "PARTE", "PEDRA", "PEIXE", "PINTA", "PRAIA", "RADIO", "RISCO", "SABOR",
    "SALTO", "SINAL", "TEMPO", "TERMO", "TERRA", "VALOR", "VERDE", "VISTA"
  ]
});

const alphabet = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const notes = CONFIG.themes;
const VALID_GUESSES = new Set(CONFIG.validGuesses.map(normalizeWord));
const elements = {
  body: document.body,
  board: document.querySelector("#board"),
  keyboard: document.querySelector("#keyboard"),
  hint: document.querySelector("#hint"),
  status: document.querySelector("#status"),
  stats: document.querySelector("#stats"),
  distribution: document.querySelector("#distribution"),
  challengeLabel: document.querySelector("#challenge-label"),
  subtitle: document.querySelector("#game-subtitle"),
  themeNote: document.querySelector("#theme-note"),
  share: document.querySelector("#share-button"),
  practice: document.querySelector("#practice-button"),
  help: document.querySelector("#help-dialog")
};

let state = createState("daily");

function normalizeWord(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

function getSaoPauloDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function hash(value) {
  return [...value].reduce((result, character) => ((result << 5) - result + character.charCodeAt(0)) | 0, 0) >>> 0;
}

function getDailyPuzzle() {
  const puzzleId = getSaoPauloDate();
  return { puzzleId, answer: CONFIG.answers[hash(puzzleId) % CONFIG.answers.length] };
}

function isPreviousPuzzle(previousId, currentId) {
  if (!previousId || !/^\d{4}-\d{2}-\d{2}$/.test(previousId) || !/^\d{4}-\d{2}-\d{2}$/.test(currentId)) return false;
  const previous = new Date(`${previousId}T12:00:00Z`);
  const current = new Date(`${currentId}T12:00:00Z`);
  return (current - previous) / 86400000 === 1;
}

function createState(mode) {
  const puzzle = mode === "daily" ? getDailyPuzzle() : {
    puzzleId: `practice-${Date.now()}`,
    answer: CONFIG.answers[Math.floor(Math.random() * CONFIG.answers.length)]
  };
  return {
    mode,
    puzzleId: puzzle.puzzleId,
    answer: normalizeWord(puzzle.answer),
    currentGuess: "",
    attemptIndex: 0,
    guesses: [],
    evaluations: [],
    phase: "playing"
  };
}

function emptyStats() {
  return { played: 0, wins: 0, currentStreak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0, 0], lastPuzzleId: null };
}

function isValidStats(stats) {
  return stats && Number.isFinite(stats.played) && stats.played >= 0
    && Number.isFinite(stats.wins) && stats.wins >= 0
    && Number.isFinite(stats.currentStreak) && stats.currentStreak >= 0
    && Number.isFinite(stats.maxStreak) && stats.maxStreak >= 0
    && Array.isArray(stats.distribution) && stats.distribution.length === 6
    && stats.distribution.every(value => Number.isFinite(value) && value >= 0);
}

function isValidDaily(daily) {
  return daily && typeof daily.puzzleId === "string"
    && typeof daily.currentGuess === "string"
    && Number.isInteger(daily.attemptIndex) && daily.attemptIndex >= 0 && daily.attemptIndex <= CONFIG.maxAttempts
    && Array.isArray(daily.guesses) && daily.guesses.length <= CONFIG.maxAttempts
    && daily.guesses.every(guess => typeof guess === "string" && guess.length === CONFIG.answerLength)
    && Array.isArray(daily.evaluations) && daily.evaluations.length === daily.guesses.length
    && daily.evaluations.every(row => Array.isArray(row) && row.length === CONFIG.answerLength
      && row.every(result => ["correct", "present", "absent"].includes(result)))
    && ["playing", "won", "lost"].includes(daily.phase);
}

function readData() {
  try {
    const raw = localStorage.getItem(CONFIG.storageKey);
    if (!raw) return { stats: emptyStats(), daily: null, preferences: {} };
    const data = JSON.parse(raw);
    const stats = isValidStats(data.stats) ? {
      ...emptyStats(),
      ...data.stats,
      distribution: data.stats.distribution.map(value => Math.floor(value))
    } : emptyStats();
    return {
      stats,
      daily: isValidDaily(data.daily) ? data.daily : null,
      preferences: data.preferences && typeof data.preferences === "object" ? data.preferences : {}
    };
  } catch {
    elements.status.textContent = "Não foi possível recuperar seus dados locais. Começamos uma nova partida.";
    return { stats: emptyStats(), daily: null, preferences: {} };
  }
}

function saveData(data) {
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
  } catch {
    elements.status.textContent = "O jogo continua, mas não foi possível salvar seu progresso neste navegador.";
  }
}

function restoreDaily() {
  const data = readData();
  const puzzle = getDailyPuzzle();
  if (data.daily?.puzzleId !== puzzle.puzzleId) return null;
  return { ...createState("daily"), ...data.daily, answer: normalizeWord(puzzle.answer) };
}

function persistGame() {
  const data = readData();
  if (state.mode === "daily") data.daily = {
    puzzleId: state.puzzleId,
    currentGuess: state.currentGuess,
    attemptIndex: state.attemptIndex,
    guesses: state.guesses,
    evaluations: state.evaluations,
    phase: state.phase
  };
  saveData(data);
}

function evaluateGuess(guess, answer) {
  const result = Array(answer.length).fill("absent");
  const remaining = answer.split("");
  [...guess].forEach((letter, index) => {
    if (letter === answer[index]) {
      result[index] = "correct";
      remaining[index] = null;
    }
  });
  [...guess].forEach((letter, index) => {
    if (result[index] === "correct") return;
    const found = remaining.indexOf(letter);
    if (found !== -1) {
      result[index] = "present";
      remaining[found] = null;
    }
  });
  return result;
}

function buildBoard() {
  elements.board.innerHTML = "";
  for (let index = 0; index < CONFIG.maxAttempts * CONFIG.answerLength; index += 1) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.setAttribute("role", "gridcell");
    tile.setAttribute("aria-label", "Casa vazia");
    elements.board.append(tile);
  }
}

function addKey(row, label, value, extraClass = "") {
  const key = document.createElement("button");
  key.className = `key ${extraClass}`;
  key.type = "button";
  key.textContent = label;
  key.dataset.value = value;
  key.setAttribute("aria-label", value === "DELETE" ? "Apagar letra" : value === "ENTER" ? "Enviar palavra" : `Letra ${value}`);
  key.addEventListener("click", () => handleInput(value));
  row.append(key);
}

function buildKeyboard() {
  elements.keyboard.innerHTML = "";
  alphabet.forEach((letters, rowIndex) => {
    const row = document.createElement("div");
    row.className = "key-row";
    if (rowIndex === 2) addKey(row, "⌫", "DELETE", "wide");
    [...letters].forEach(letter => addKey(row, letter, letter));
    if (rowIndex === 2) addKey(row, "ENTER", "ENTER", "wide");
    elements.keyboard.append(row);
  });
}

function tileLabel(letter, result) {
  const text = { correct: "correta", present: "presente em outra posição", absent: "ausente" };
  return `${letter}: ${text[result]}`;
}

function renderBoard() {
  const tiles = [...elements.board.children];
  tiles.forEach(tile => {
    tile.className = "tile";
    tile.textContent = "";
    tile.setAttribute("aria-label", "Casa vazia");
  });
  state.guesses.forEach((guess, rowIndex) => {
    [...guess].forEach((letter, index) => {
      const tile = tiles[rowIndex * CONFIG.answerLength + index];
      tile.className = `tile ${state.evaluations[rowIndex][index]}`;
      tile.textContent = letter;
      tile.setAttribute("aria-label", tileLabel(letter, state.evaluations[rowIndex][index]));
    });
  });
  [...state.currentGuess].forEach((letter, index) => {
    const tile = tiles[state.attemptIndex * CONFIG.answerLength + index];
    tile.className = "tile filled";
    tile.textContent = letter;
    tile.setAttribute("aria-label", `Letra ${letter}`);
  });
}

function renderStats() {
  const stats = readData().stats;
  const percentage = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
  elements.stats.replaceChildren();
  [["jogados", stats.played], ["vitórias", `${percentage}%`], ["sequência", stats.currentStreak]].forEach(([label, value]) => {
    const stat = document.createElement("div");
    stat.className = "stat";
    const number = document.createElement("strong");
    const caption = document.createElement("span");
    number.textContent = value;
    caption.textContent = label;
    stat.append(number, caption);
    elements.stats.append(stat);
  });
  const max = Math.max(...stats.distribution, 1);
  elements.distribution.replaceChildren();
  stats.distribution.forEach((value, index) => {
    const row = document.createElement("div");
    const label = document.createElement("span");
    const progress = document.createElement("div");
    const bar = document.createElement("i");
    const total = document.createElement("b");
    row.className = "progress-row";
    progress.className = "progress";
    label.textContent = index + 1;
    bar.style.width = `${Math.round((value / max) * 100)}%`;
    total.textContent = value;
    progress.append(bar);
    row.append(label, progress, total);
    elements.distribution.append(row);
  });
}

function updateKeyboard() {
  const priorities = { absent: 1, present: 2, correct: 3 };
  const letters = {};
  state.guesses.forEach((guess, rowIndex) => [...guess].forEach((letter, index) => {
    const result = state.evaluations[rowIndex][index];
    if (!letters[letter] || priorities[result] > priorities[letters[letter]]) letters[letter] = result;
  }));
  document.querySelectorAll(".key").forEach(key => {
    const result = letters[key.dataset.value];
    key.className = `key ${result || ""} ${key.dataset.value === "ENTER" || key.dataset.value === "DELETE" ? "wide" : ""}`;
  });
}

function render() {
  const daily = state.mode === "daily";
  elements.challengeLabel.textContent = daily ? `desafio diário · ${state.puzzleId}` : "modo livre";
  elements.subtitle.textContent = daily ? "Descubra em até 6 tentativas." : "Pratique sem alterar sua sequência.";
  elements.share.disabled = state.guesses.length === 0;
  elements.practice.textContent = daily ? "Jogar no modo livre" : "Novo desafio diário";
  renderBoard();
  updateKeyboard();
  renderStats();
}

function handleInput(value) {
  if (state.phase !== "playing") return;
  if (value === "DELETE") state.currentGuess = state.currentGuess.slice(0, -1);
  else if (value === "ENTER") submitGuess();
  else if (/^[A-Z]$/.test(value) && state.currentGuess.length < CONFIG.answerLength) state.currentGuess += value;
  render();
}

function submitGuess() {
  if (state.currentGuess.length < CONFIG.answerLength) {
    elements.hint.textContent = "Complete as 5 letras antes de enviar.";
    return;
  }
  const guess = normalizeWord(state.currentGuess);
  if (!VALID_GUESSES.has(guess)) {
    elements.hint.textContent = "Essa palavra não está na lista de tentativas.";
    return;
  }
  const evaluation = evaluateGuess(guess, state.answer);
  state.guesses.push(guess);
  state.evaluations.push(evaluation);
  state.currentGuess = "";
  state.attemptIndex += 1;
  if (guess === state.answer) finishGame("won");
  else if (state.attemptIndex === CONFIG.maxAttempts) finishGame("lost");
  else elements.hint.textContent = "As pistas apareceram. Tente de novo.";
  persistGame();
  render();
}

function finishGame(phase) {
  state.phase = phase;
  if (state.mode !== "daily") {
    elements.hint.textContent = phase === "won" ? `Boa! Você acertou em ${state.attemptIndex}.` : `Quase! A palavra era ${state.answer}.`;
    return;
  }
  const data = readData();
  if (data.daily?.phase === phase) return;
  data.stats.played += 1;
  if (phase === "won") {
    data.stats.wins += 1;
    data.stats.currentStreak = isPreviousPuzzle(data.stats.lastPuzzleId, state.puzzleId)
      ? data.stats.currentStreak + 1
      : 1;
    data.stats.maxStreak = Math.max(data.stats.maxStreak, data.stats.currentStreak);
    data.stats.distribution[state.attemptIndex - 1] += 1;
    elements.hint.textContent = `Boa demais! Você encontrou a palavra em ${state.attemptIndex} tentativa${state.attemptIndex === 1 ? "" : "s"}.`;
  } else {
    data.stats.currentStreak = 0;
    elements.hint.textContent = `Quase! A palavra era ${state.answer}.`;
  }
  data.stats.lastPuzzleId = state.puzzleId;
  data.daily = { puzzleId: state.puzzleId, currentGuess: "", attemptIndex: state.attemptIndex, guesses: state.guesses, evaluations: state.evaluations, phase };
  saveData(data);
  elements.status.textContent = "Partida encerrada. Compartilhe seu resultado sem spoiler.";
}

function buildShareText() {
  const symbols = { correct: "🟩", present: "🟨", absent: "⬛" };
  const rows = state.evaluations.map(row => row.map(result => symbols[result]).join("")).join("\n");
  const result = state.phase === "won" ? `${state.attemptIndex}/${CONFIG.maxAttempts}` : `X/${CONFIG.maxAttempts}`;
  return `caçaPalavras · ${result}\n${rows}`;
}

async function shareResult() {
  if (!state.guesses.length) {
    elements.status.textContent = "Faça pelo menos uma tentativa para compartilhar.";
    return;
  }
  const text = buildShareText();
  try {
    if (navigator.share) await navigator.share({ title: "caçaPalavras", text });
    else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else {
      const fallback = document.createElement("textarea");
      fallback.value = text;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.append(fallback);
      fallback.select();
      const copied = document.execCommand("copy");
      fallback.remove();
      if (!copied) throw new Error("Clipboard indisponível");
    }
    elements.status.textContent = "Resultado compartilhado sem spoiler.";
  } catch {
    elements.status.textContent = "Não foi possível compartilhar agora. Tente novamente.";
  }
}

function setTheme(theme) {
  if (!Object.hasOwn(notes, theme)) theme = "cordel";
  elements.body.dataset.theme = theme;
  elements.themeNote.textContent = notes[theme];
  document.querySelectorAll("[data-theme-choice]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme)));
  const data = readData();
  data.preferences.theme = theme;
  saveData(data);
}

function setPreference(className, button, label) {
  elements.body.classList.toggle(className);
  const enabled = elements.body.classList.contains(className);
  button.setAttribute("aria-pressed", String(enabled));
  button.setAttribute("aria-label", `${enabled ? "Desativar" : "Ativar"} ${label}`);
  elements.hint.textContent = `${label} ${enabled ? "ativado." : "desativado."}`;
  const data = readData();
  data.preferences[className] = enabled;
  saveData(data);
}

function startPractice() {
  if (state.mode === "daily") {
    state = createState("practice");
    elements.status.textContent = "Modo livre iniciado. Esta partida não altera sua sequência.";
  } else {
    state = restoreDaily() || createState("daily");
    elements.status.textContent = "Desafio diário carregado.";
  }
  elements.hint.textContent = "Escolha uma letra para começar.";
  render();
}

function bindEvents() {
  document.addEventListener("keydown", event => {
    const target = event.target;
    const isControl = target instanceof HTMLElement
      && (target.matches("button, a, input, select, textarea, summary") || target.isContentEditable);
    if (isControl) return;
    if (event.key === "Enter" || event.key === "Backspace" || /^[a-zA-Z]$/.test(event.key)) {
      event.preventDefault();
      if (event.key === "Enter") handleInput("ENTER");
      else if (event.key === "Backspace") handleInput("DELETE");
      else handleInput(event.key.toUpperCase());
    }
  });
  document.querySelectorAll("[data-theme-choice]").forEach(button => button.addEventListener("click", () => setTheme(button.dataset.themeChoice)));
  elements.share.addEventListener("click", shareResult);
  elements.practice.addEventListener("click", startPractice);
  document.querySelector("#help-button").addEventListener("click", () => elements.help.showModal());
  document.querySelector("#close-help").addEventListener("click", () => elements.help.close());
  document.querySelector("#contrast-button").addEventListener("click", event => setPreference("high-contrast", event.currentTarget, "Alto contraste"));
  document.querySelector("#motion-button").addEventListener("click", event => setPreference("reduced-motion", event.currentTarget, "Movimento reduzido"));
}

function init() {
  const data = readData();
  const restored = restoreDaily();
  state = restored || createState("daily");
  setTheme(data.preferences.theme || "cordel");
  ["high-contrast", "reduced-motion"].forEach(className => {
    if (data.preferences[className]) {
      elements.body.classList.add(className);
      const button = document.querySelector(`#${className === "high-contrast" ? "contrast" : "motion"}-button`);
      button.setAttribute("aria-pressed", "true");
      button.setAttribute("aria-label", `Desativar ${className === "high-contrast" ? "Alto contraste" : "Movimento reduzido"}`);
    }
  });
  buildBoard();
  buildKeyboard();
  bindEvents();
  render();
}

init();
