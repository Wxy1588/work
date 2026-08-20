const QUESTION_BANK = window.grammarQuestionBank || {};

const gameTracker = typeof window.GameTracker === "function" ? new window.GameTracker({
  gameId: "flappy-grammar",
  gameVersion: "1.0.0",
  apiUrl: "http://127.0.0.1:8000/api/v1/events",
  getUserId() {
    return window.platformUserId || null;
  }
}) : null;

function startTrackingGame() {
  if (!gameTracker) return;
  try {
    if (gameTracker.sessionId && !gameTracker.finished) gameTracker.abandon();
    gameTracker.start();
  } catch (error) {
    console.warn("[GameTracker] Start failed:", error);
  }
}

function finishTrackingGame(score) {
  if (!gameTracker) return;
  try {
    void gameTracker.finish(Number(score) || 0);
  } catch (error) {
    console.warn("[GameTracker] Finish failed:", error);
  }
}

function abandonTrackingGame() {
  if (!gameTracker?.sessionId || gameTracker.finished) return;
  gameTracker.abandon();
}

function getBookQuestions(grade, semester) {
  const questions = QUESTION_BANK[grade]?.[semester] || [];
  return questions.filter(question => question && question.stem && question.correctOption && question.wrongOptions?.length);
}

function createQuestionDeck(sourceQuestions) {
  const questions = [...sourceQuestions];
  for (let index = questions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [questions[index], questions[swapIndex]] = [questions[swapIndex], questions[index]];
  }
  return questions;
}

function getLevelQuestions(deck, level, questionsPerLevel, correctlyAnswered = new Set()) {
  const start = (level - 1) * questionsPerLevel;
  const questions = deck.slice(start, start + questionsPerLevel);
  const isLastLevel = level === Math.ceil(deck.length / questionsPerLevel);
  if (!isLastLevel || questions.length === questionsPerLevel) return questions;

  const unanswered = deck.filter(question => !correctlyAnswered.has(question));
  const unused = unanswered.filter(question => !questions.includes(question));
  for (let index = unused.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [unused[index], unused[swapIndex]] = [unused[swapIndex], unused[index]];
  }

  while (questions.length < questionsPerLevel && unused.length) questions.push(unused.pop());
  while (questions.length < questionsPerLevel && unanswered.length) {
    questions.push(unanswered[Math.floor(Math.random() * unanswered.length)]);
  }
  return questions;
}

const CONFIG = { questionsPerLevel: 9, maxHearts: 5, potionStreak: 5, gravity: 1.2, flap: -0.4, birdX: 0.23, gateSpeed: 0.00012 };
const GATE_LANES = ["raised", "lowered", "center", "raised", "lowered"];

const ui = {
  shell: document.querySelector("#gameShell"), start: document.querySelector("#startScreen"), game: document.querySelector("#gameScreen"),
  potionIntro: document.querySelector("#potionIntro"),
  end: document.querySelector("#endScreen"), field: document.querySelector("#playField"), bird: document.querySelector("#bird"), gate: document.querySelector("#gate"),
  chickenSprite: document.querySelector("#chickenSprite"), retry: document.querySelector("#retryButton"),
  top: document.querySelector("#topAnswer"), bottom: document.querySelector("#bottomAnswer"), guide: document.querySelector("#tapGuide"),
  feedback: document.querySelector("#feedbackIcon"), level: document.querySelector("#levelText"), progress: document.querySelector("#progressText"), hearts: document.querySelector("#heartsDisplay"),
  potion: document.querySelector("#revivePotion"), potionCount: document.querySelector("#potionCount"), potionProgress: document.querySelector("#potionProgress"),
  potionProgressFill: document.querySelector("#potionProgressFill"),
  reviveChoice: document.querySelector("#reviveChoice"), reviveChoiceContent: document.querySelector("#reviveChoiceContent"),
  reviveCountdown: document.querySelector("#reviveCountdown"), reviveCountdownNumber: document.querySelector("#reviveCountdownNumber"),
  reviveConfirm: document.querySelector("#reviveConfirmButton"), reviveDecline: document.querySelector("#reviveDeclineButton"),
  reportButton: document.querySelector("#reportButton"), report: document.querySelector("#learningReport"),
  reportBook: document.querySelector("#reportBook"),
  unmasteredCount: document.querySelector("#unmasteredCount"), masteredCount: document.querySelector("#masteredCount"),
  unmasteredList: document.querySelector("#unmasteredList"), masteredList: document.querySelector("#masteredList"),
  reportContinue: document.querySelector("#reportContinueButton"), reportReplay: document.querySelector("#reportReplayButton"),
  score: document.querySelector("#scoreText"), result: document.querySelector("#resultState"), resultHearts: document.querySelector("#resultHearts"),
  resultScore: document.querySelector("#resultScore"),
  confetti: document.querySelector("#confettiLayer"),
  celebrationEmoji: document.querySelector("#celebrationEmoji"),
  bookButtons: [...document.querySelectorAll(".book-option")]
};
ui.question = document.querySelector("#questionPanel");
const audio = {
  click: new Audio("assets/audio/click.wav"), right: new Audio("assets/audio/right.wav"), wrong: new Audio("assets/audio/wrong.wav"),
  celebration: new Audio("assets/audio/celebration.wav"), end: new Audio("assets/audio/end.mp3"), bgm: new Audio("assets/audio/bgm.flac"),
  reportNarration: new Audio()
};
audio.bgm.loop = true;
audio.bgm.volume = .1;
audio.reportNarration.preload = "auto";
const state = {
  phase: "start", selectedGrade: "七年级", selectedSemester: "上册", selectedBookLabel: "七年级上册",
  level: 1, totalLevels: Math.max(1, Math.ceil(getBookQuestions("七年级", "上册").length / CONFIG.questionsPerLevel)),
  questionDeck: [], rounds: [], correctlyAnswered: new Set(), index: 0, score: 0, levelStartScore: 0, hearts: CONFIG.maxHearts,
  correctStreak: 0, revivePotions: 0, levelStartCorrectStreak: 0, levelStartRevivePotions: 0,
  knowledgeStats: Object.create(null), reportReturnPhase: null, reportFromFailure: false, reportNarrating: false, reportNarrationToken: 0, reportNarrationCancel: null,
  y: .48, velocity: 0, flatFlightActive: false, gateX: 1.08, correctGate: "top", resolved: true, lastTime: 0, raf: 0,
  gateActive: false, preparingGate: false, tutorialTap: false, terminal: false, timers: new Set(),
  tutorialComplete: false, potionIntroComplete: false,
  gateLaneIndex: 0, topGateCenter: .29, bottomGateCenter: .68,
  lastFlapSoundAt: 0, viewWidth: 1, viewHeight: 1, gateWidth: 1, birdWidth: 1, birdHeight: 1, chickenFrame: 0, chickenTimer: 0
};

function play(name) {
  const sound = audio[name];
  if (!sound || (state.terminal && !["celebration", "end"].includes(name))) return Promise.resolve(false);
  try { sound.currentTime = 0; } catch (_) {}
  return sound.play().then(() => true).catch(() => false);
}

async function playToEnd(name) {
  const ok = await play(name);
  if (!ok) return;
  await new Promise(resolve => audio[name].addEventListener("ended", resolve, { once: true }));
}

function startBgm() {
  if (state.terminal) return;
  audio.bgm.play().catch(() => {});
}

function timer(fn, ms) {
  const id = setTimeout(() => { state.timers.delete(id); fn(); }, ms);
  state.timers.add(id);
  return id;
}

function finishPotionIntro() {
  if (state.phase !== "potionIntro") return;
  ui.potionIntro.hidden = true;
  state.potionIntroComplete = true;
  if (state.tutorialComplete) beginMainGame();
  else startTutorial();
}

function startPotionIntro() {
  cancelAnimationFrame(state.raf);
  state.raf = 0;
  state.phase = "potionIntro";
  ui.start.hidden = true;
  ui.game.hidden = true;
  ui.end.hidden = true;
  ui.potionIntro.hidden = false;

  timer(finishPotionIntro, 2000);
}

function startChickenAnimation() {
  stopChickenAnimation();
  state.chickenFrame = 0;
  ui.chickenSprite.src = "assets/images/chicken1.png";
  state.chickenTimer = window.setInterval(() => {
    if (state.terminal || ui.game.hidden) return;
    state.chickenFrame = state.chickenFrame ? 0 : 1;
    ui.chickenSprite.src = state.chickenFrame ? "assets/images/chicken2.png" : "assets/images/chicken1.png";
  }, 100);
}

function stopChickenAnimation() {
  if (!state.chickenTimer) return;
  clearInterval(state.chickenTimer);
  state.chickenTimer = 0;
}

function resetBird() {
  state.y = .48;
  state.velocity = 0;
  renderBird();
}

function startFlatFlight() {
  state.velocity = 0;
  state.flatFlightActive = true;
  renderBird();
}

function refreshMetrics() {
  const fieldRect = ui.field.getBoundingClientRect();
  state.viewWidth = Math.max(1, fieldRect.width);
  state.viewHeight = Math.max(1, fieldRect.height);
  state.gateWidth = Math.max(1, ui.gate.getBoundingClientRect().width);
  const birdRect = ui.bird.getBoundingClientRect();
  state.birdWidth = Math.max(1, birdRect.width);
  state.birdHeight = Math.max(1, birdRect.height);
  renderBird();
}

function renderBird() {
  const tilt = Math.max(-22, Math.min(28, state.velocity * 32));
  const y = state.y * state.viewHeight - state.birdHeight * .5;
  ui.bird.style.transform = `translate3d(-50%, ${y}px, 0) rotate(${tilt}deg)`;
}

function setAnswer(element, option) {
  element.textContent = option;
  element.dataset.option = option;
  element.classList.toggle("long-option", option.length > 18);
  element.classList.toggle("very-long-option", option.length > 30);
  element.classList.remove("correct-flash", "wrong-flash");
}

function formatQuestionText(stem) {
  const abbreviations = [];
  let text = stem.replace(/\s+/g, " ").trim();

  text = text.replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|St|No)\./g, abbreviation => {
    const marker = `\uE000${abbreviations.length}\uE001`;
    abbreviations.push(abbreviation);
    return marker;
  });

  text = text
    .replace(/\s+(?=—)/g, "\n")
    .replace(/([.!?][”’"']?)\s*(?=—)/g, "$1\n")
    .replace(/([.!?][”’"']?)\s+(?=-)/g, "$1\n")
    .split("\n")
    .map(line => {
      const trimmedLine = line.trim();

      // Keep every sentence spoken by the same dialogue turn on one line.
      if (/^[—-]/.test(trimmedLine)) return trimmedLine;

      return trimmedLine
        .replace(/([.!?][”’"']?)(?=[\u4e00-\u9fff])/g, "$1\n")
        .replace(/([。！？][”’"']?)\s*/g, "$1\n")
        .replace(/([.!?][”’"']?)\s+(?=[“"A-Z\u4e00-\u9fff])/g, "$1\n")
        .replace(/([：:])\s+(?=[—A-Za-z])/g, "$1\n");
    })
    .join("\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

  return text.replace(/\uE000(\d+)\uE001/g, (_, index) => abbreviations[Number(index)]);
}

function setQuestion(question) {
  const knowledge = document.createElement("span");
  knowledge.className = "question-knowledge";
  knowledge.textContent = `知识点 · ${question.knowledgePoint || "综合语法"}`;

  const stem = document.createElement("span");
  stem.className = "question-stem";
  stem.textContent = formatQuestionText(question.stem);

  ui.question.replaceChildren(knowledge, stem);
  ui.question.classList.toggle("long-question", question.stem.length > 100);
  ui.question.classList.toggle("very-long-question", question.stem.length > 140);
  ui.question.hidden = false;
}

function recordKnowledge(question, correct) {
  const point = question?.knowledgePoint || "综合语法";
  const stats = state.knowledgeStats[point] || { correct: 0, wrong: 0 };
  stats[correct ? "correct" : "wrong"] += 1;
  state.knowledgeStats[point] = stats;
}

function getKnowledgeReport() {
  const entries = Object.entries(state.knowledgeStats).map(([point, stats]) => ({ point, ...stats }));
  const sortByPoint = (left, right) => left.point.localeCompare(right.point, "zh-CN");
  return {
    answered: entries.reduce((total, entry) => total + entry.correct + entry.wrong, 0),
    correct: entries.reduce((total, entry) => total + entry.correct, 0),
    unmastered: entries.filter(entry => entry.wrong > 0).sort(sortByPoint),
    mastered: entries.filter(entry => entry.correct > 0 && entry.wrong === 0).sort(sortByPoint)
  };
}

function getKnowledgePointAudioPath(point) {
  const seen = new Set();
  let position = 0;
  for (const grade of Object.values(QUESTION_BANK)) {
    for (const questions of Object.values(grade)) {
      for (const question of questions) {
        const currentPoint = question?.knowledgePoint || "综合语法";
        if (seen.has(currentPoint)) continue;
        seen.add(currentPoint);
        position += 1;
        if (currentPoint === point) return `assets/report_point/flappy-${String(position).padStart(4, "0")}.mp3`;
      }
    }
  }
  return null;
}

function stopReportNarration() {
  state.reportNarrationToken += 1;
  state.reportNarrating = false;
  const cancelCurrentAudio = state.reportNarrationCancel;
  state.reportNarrationCancel = null;
  cancelCurrentAudio?.();
  const narration = audio.reportNarration;
  narration.pause();
  try { narration.currentTime = 0; } catch (_) {}
  narration.removeAttribute("src");
  narration.load();
}

function playReportAudio(url, token) {
  return new Promise(resolve => {
    if (token !== state.reportNarrationToken || ui.report.hidden) {
      resolve(false);
      return;
    }
    const narration = audio.reportNarration;
    let settled = false;
    const finish = completed => {
      if (settled) return;
      settled = true;
      narration.removeEventListener("ended", onEnded);
      narration.removeEventListener("error", onError);
      if (state.reportNarrationCancel === cancel) state.reportNarrationCancel = null;
      resolve(completed);
    };
    const onEnded = () => finish(true);
    const onError = () => finish(false);
    const cancel = () => finish(false);
    state.reportNarrationCancel = cancel;
    narration.addEventListener("ended", onEnded, { once: true });
    narration.addEventListener("error", onError, { once: true });
    narration.src = url;
    narration.load();
    narration.play().catch(() => finish(false));
  });
}

async function narrateLearningReport() {
  stopReportNarration();
  const report = getKnowledgeReport();
  const pointAudio = report.unmastered.slice(0, 3)
    .map(entry => getKnowledgePointAudioPath(entry.point))
    .filter(Boolean);
  const playlist = report.unmastered.length
    ? ["assets/report/1_1.mp3", ...pointAudio, "assets/report/1_2.mp3"]
    : ["assets/report/2.mp3"];

  state.reportNarrating = true;
  state.reportNarrationToken += 1;
  const token = state.reportNarrationToken;

  for (const url of playlist) {
    const completed = await playReportAudio(url, token);
    if (!completed || token !== state.reportNarrationToken) return;
  }
  if (token === state.reportNarrationToken) {
    state.reportNarrating = false;
  }
}

function renderKnowledgeTags(container, entries, emptyText) {
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "knowledge-empty";
    empty.textContent = emptyText;
    container.replaceChildren(empty);
    return;
  }
  const tags = entries.map(entry => {
    const tag = document.createElement("span");
    tag.className = "knowledge-report-tag";
    tag.textContent = entry.point;
    tag.setAttribute("title", `答对 ${entry.correct} 次，答错 ${entry.wrong} 次`);
    return tag;
  });
  container.replaceChildren(...tags);
}

function renderLearningReport() {
  const report = getKnowledgeReport();
  ui.reportBook.textContent = state.selectedBookLabel;
  ui.unmasteredCount.textContent = report.unmastered.length;
  ui.masteredCount.textContent = report.mastered.length;
  renderKnowledgeTags(ui.unmasteredList, report.unmastered, "暂时没有未掌握的知识点");
  renderKnowledgeTags(ui.masteredList, report.mastered, "答对题目后会显示在这里");
  ui.reportContinue.hidden = state.reportFromFailure;
}

function openLearningReport(fromFailure = false) {
  if (!fromFailure && (state.terminal || state.phase !== "main")) return;
  stopReportNarration();
  cancelAnimationFrame(state.raf);
  state.raf = 0;
  state.reportReturnPhase = fromFailure ? null : state.phase;
  state.reportFromFailure = fromFailure;
  state.phase = fromFailure ? "failedReport" : "report";
  stopChickenAnimation();
  renderLearningReport();
  ui.report.hidden = false;
  ui.reportButton.disabled = true;
  ui.reportButton.setAttribute("aria-expanded", "true");
  play("click");
  void narrateLearningReport();
}

function closeLearningReport() {
  if (state.reportFromFailure || state.phase !== "report") return;
  stopReportNarration();
  ui.report.hidden = true;
  state.phase = state.reportReturnPhase || "main";
  state.reportReturnPhase = null;
  ui.reportButton.setAttribute("aria-expanded", "false");
  startChickenAnimation();
  startFlatFlight();
  updateHud();
  state.lastTime = performance.now();
  state.raf = requestAnimationFrame(loop);
  play("click");
}

function renderHearts(element, remaining) {
  const hearts = Array.from({ length: CONFIG.maxHearts }, (_, index) => {
    const heart = document.createElement("span");
    heart.className = `heart-icon ${index < remaining ? "heart-active" : "heart-spent"}`;
    heart.setAttribute("aria-hidden", "true");
    return heart;
  });
  element.replaceChildren(...hearts);
  element.setAttribute("aria-label", `剩余 ${remaining} 颗爱心`);
}

function updatePotionHud() {
  const canUsePotion = state.phase === "main" && state.revivePotions > 0 && state.hearts < CONFIG.maxHearts && !state.terminal;
  ui.potionCount.textContent = state.revivePotions;
  ui.potionProgress.textContent = `${state.correctStreak}/${CONFIG.potionStreak}`;
  ui.potionProgressFill.style.width = `${state.correctStreak / CONFIG.potionStreak * 100}%`;
  ui.potion.disabled = !canUsePotion;
  ui.potion.classList.toggle("potion-ready", canUsePotion);
  ui.potion.setAttribute("aria-label", `复活药水：${state.revivePotions} 瓶，连续答对进度 ${state.correctStreak}/${CONFIG.potionStreak}${canUsePotion ? "，点击恢复一颗爱心" : ""}`);
}

function updateHud() {
  const total = state.rounds.length || CONFIG.questionsPerLevel;
  const current = state.phase === "main" && state.index < total ? state.index + 1 : state.index;
  ui.level.textContent = `Level：${state.level}`;
  ui.progress.textContent = `Question：${Math.min(current, total)}/${total}`;
  ui.score.textContent = `Score：${state.score}`;
  renderHearts(ui.hearts, state.hearts);
  updatePotionHud();
  ui.reportButton.disabled = state.terminal || state.phase !== "main";
}

function selectBook(button) {
  state.selectedGrade = button.dataset.grade;
  state.selectedSemester = button.dataset.semester;
  state.selectedBookLabel = button.dataset.label;
  state.level = 1;
  state.score = 0;
  state.levelStartScore = 0;
  state.questionDeck = [];
  state.correctlyAnswered = new Set();
  state.totalLevels = Math.max(1, Math.ceil(getBookQuestions(state.selectedGrade, state.selectedSemester).length / CONFIG.questionsPerLevel));
  ui.bookButtons.forEach(bookButton => {
    const selected = bookButton === button;
    bookButton.classList.toggle("selected", selected);
    bookButton.setAttribute("aria-pressed", String(selected));
  });
  updateHud();
}

function startSelectedBook() {
  stopReportNarration();
  const questions = getBookQuestions(state.selectedGrade, state.selectedSemester);
  state.questionDeck = createQuestionDeck(questions);
  state.level = 1;
  state.score = 0;
  state.levelStartScore = 0;
  state.hearts = CONFIG.maxHearts;
  state.correctStreak = 0;
  state.revivePotions = 0;
  state.levelStartCorrectStreak = 0;
  state.levelStartRevivePotions = 0;
  state.gateLaneIndex = 0;
  state.knowledgeStats = Object.create(null);
  state.correctlyAnswered = new Set();
  state.reportReturnPhase = null;
  state.reportFromFailure = false;
  ui.report.hidden = true;
  hideReviveChoice();
  ui.reportButton.setAttribute("aria-expanded", "false");
  state.totalLevels = Math.max(1, Math.ceil(state.questionDeck.length / CONFIG.questionsPerLevel));
  startTrackingGame();
  play("click");
  startBgm();
  if (state.potionIntroComplete) {
    if (state.tutorialComplete) beginMainGame();
    else startTutorial();
  } else {
    startPotionIntro();
  }
}

async function startTutorial() {
  state.phase = "tutorial";
  state.resolved = true;
  state.tutorialTap = false;
  ui.start.hidden = true;
  ui.potionIntro.hidden = true;
  ui.game.hidden = false;
  ui.report.hidden = true;
  hideReviveChoice();
  ui.result.hidden = true;
  ui.gate.hidden = true;
  ui.question.hidden = true;
  ui.question.textContent = "";
  ui.guide.hidden = false;
  ui.bird.hidden = false;
  startChickenAnimation();
  refreshMetrics();
  resetBird();
  updateHud();
}

function startTutorialGate() {
  state.phase = "tutorialGate";
  ui.gate.classList.add("training");
  ui.gate.dataset.lane = "center";
  ui.top.replaceChildren();
  ui.bottom.replaceChildren();
  ui.guide.hidden = false;
  launchGate();
}

function beginMainGame() {
  cancelAnimationFrame(state.raf);
  state.raf = 0;
  ui.start.hidden = true;
  ui.potionIntro.hidden = true;
  ui.game.hidden = false;
  ui.report.hidden = true;
  hideReviveChoice();
  if (!state.questionDeck.length) {
    state.questionDeck = createQuestionDeck(getBookQuestions(state.selectedGrade, state.selectedSemester));
    state.totalLevels = Math.max(1, Math.ceil(state.questionDeck.length / CONFIG.questionsPerLevel));
  }
  state.rounds = getLevelQuestions(state.questionDeck, state.level, CONFIG.questionsPerLevel, state.correctlyAnswered);
  state.levelStartScore = state.score;
  state.levelStartCorrectStreak = state.correctStreak;
  state.levelStartRevivePotions = state.revivePotions;
  state.phase = "main";
  state.index = 0;
  state.velocity = 0;
  state.flatFlightActive = false;
  state.gateActive = false;
  state.preparingGate = false;
  state.resolved = true;
  ui.result.hidden = true;
  ui.bird.hidden = false;
  ui.bird.classList.remove("dead", "hit");
  ui.guide.hidden = true;
  ui.gate.classList.remove("training");
  ui.gate.hidden = true;
  startChickenAnimation();
  refreshMetrics();
  updateHud();
  state.lastTime = performance.now();
  state.raf = requestAnimationFrame(loop);
  prepareNextGate();
}

function prepareNextGate() {
  if (state.terminal || state.preparingGate || state.gateActive) return;
  if (state.phase === "main" && state.index >= state.rounds.length) return finishMain();
  state.preparingGate = true;
  state.resolved = true;
  ui.gate.hidden = true;
  updateHud();

  const question = state.rounds[state.index];
  if (!question) return finishMain();
  setQuestion(question);
  state.preparingGate = false;
  spawnQuestionGate(question);
}

function spawnQuestionGate(question) {
  const wrong = question.wrongOptions[Math.floor(Math.random() * question.wrongOptions.length)];
  ui.gate.dataset.lane = GATE_LANES[state.gateLaneIndex % GATE_LANES.length];
  state.gateLaneIndex += 1;
  state.correctGate = Math.random() < .5 ? "top" : "bottom";
  setAnswer(ui.top, state.correctGate === "top" ? question.correctOption : wrong);
  setAnswer(ui.bottom, state.correctGate === "bottom" ? question.correctOption : wrong);
  launchGate();
}

function launchGate() {
  state.gateX = 1.06;
  state.resolved = false;
  state.gateActive = true;
  ui.gate.hidden = false;
  state.gateWidth = Math.max(1, ui.gate.getBoundingClientRect().width);
  const fieldRect = ui.field.getBoundingClientRect();
  const topRect = ui.top.getBoundingClientRect();
  const bottomRect = ui.bottom.getBoundingClientRect();
  state.topGateCenter = (topRect.top + topRect.height * .5 - fieldRect.top) / Math.max(1, fieldRect.height);
  state.bottomGateCenter = (bottomRect.top + bottomRect.height * .5 - fieldRect.top) / Math.max(1, fieldRect.height);
  ui.gate.style.transform = "translateX(0)";
  if (!state.raf) {
    state.lastTime = performance.now();
    state.raf = requestAnimationFrame(loop);
  }
}

function flap() {
  if (state.terminal) return;
  if (state.phase === "tutorial") {
    if (state.tutorialTap) return;
    state.tutorialTap = true;
    state.velocity = CONFIG.flap;
    ui.guide.hidden = true;
    play("click");
    timer(startTutorialGate, 500);
    return;
  }
  if (!["tutorialGate", "main"].includes(state.phase)) return;
  if (state.phase === "tutorialGate" && state.resolved) return;
  if (state.phase === "main") state.flatFlightActive = false;
  state.velocity = CONFIG.flap;
  const now = Date.now();
  if (now - state.lastFlapSoundAt >= 90) {
    state.lastFlapSoundAt = now;
    play("click");
  }
}

function loop(now) {
  if (state.terminal || !["tutorialGate", "main"].includes(state.phase)) {
    state.raf = 0;
    return;
  }
  const dt = Math.min(34, Math.max(0, now - state.lastTime));
  state.lastTime = now;
  const isFlatFlight = state.phase === "main" && state.flatFlightActive;
  if (isFlatFlight) state.velocity = 0;
  else {
    state.velocity += CONFIG.gravity * dt / 1000;
    state.y += state.velocity * dt / 1000;
  }
  let boundaryHit = false;
  if (!isFlatFlight && state.y < .05) {
    state.y = .05;
    if (state.velocity < 0) state.velocity = 0;
    boundaryHit = true;
  } else if (!isFlatFlight && state.y > 1.12) {
    boundaryHit = true;
  }
  renderBird();

  if (state.gateActive) {
    state.gateX -= CONFIG.gateSpeed * dt;
    ui.gate.style.transform = `translate3d(${(state.gateX - 1.06) * state.viewWidth}px, 0, 0)`;
    const birdCenterX = state.viewWidth * CONFIG.birdX;
    const birdLeft = birdCenterX - state.birdWidth * .5;
    const birdRight = birdCenterX + state.birdWidth * .5;
    const gateLeft = state.gateX * state.viewWidth;
    const gateWidth = state.gateWidth;
    const gateRight = gateLeft + gateWidth;
    const horizontalOverlap = gateLeft <= birdRight && gateRight >= birdLeft;
    const isTraining = state.phase === "tutorialGate";
    const target = state.y < .5 ? "top" : "bottom";
    const center = isTraining ? .5 : target === "top" ? state.topGateCenter : state.bottomGateCenter;
    const inOpening = Math.abs(state.y - center) < (isTraining ? .20 : .115);

    if (!state.resolved && boundaryHit) resolveRound(false, "collision");
    else if (!state.resolved && horizontalOverlap && !inOpening) resolveRound(false, "collision");
    else if (!state.resolved && horizontalOverlap && !isTraining && target !== state.correctGate) {
      resolveRound(false, "wrong");
    } else if (!state.resolved && gateRight < birdLeft) {
      const correct = isTraining || target === state.correctGate;
      resolveRound(correct, correct ? "correct" : "wrong");
    }

    if (gateRight < -20) {
      if (!state.resolved) resolveRound(false, "collision");
      state.gateActive = false;
      ui.gate.hidden = true;
      if (state.phase === "main") prepareNextGate();
    }
  }

  if (state.y > 1.12 && state.phase !== "failing") {
    state.y = .28;
    state.velocity = 0;
    renderBird();
  }

  state.raf = requestAnimationFrame(loop);
}

function flashFeedback(correct, collision = false) {
  ui.feedback.textContent = correct ? "✅" : collision ? "💥" : "❌";
  ui.feedback.classList.remove("show");
  void ui.feedback.offsetWidth;
  ui.feedback.classList.add("show");
  if (collision) {
    ui.bird.classList.remove("hit");
    void ui.bird.offsetWidth;
    ui.bird.classList.add("hit");
  }
}

function resolveRound(correct, reason) {
  if (state.resolved || state.terminal) return;
  state.resolved = true;
  const selected = state.y < .5 ? ui.top : ui.bottom;

  if (state.phase === "tutorialGate") {
    if (correct) {
      state.tutorialComplete = true;
      ui.guide.hidden = true;
    }
    flashFeedback(correct, reason === "collision");
    play(correct ? "right" : "wrong");
    if (correct) timer(beginMainGame, 700);
    else timer(() => { resetBird(); startTutorialGate(); }, 700);
    return;
  }

  recordKnowledge(state.rounds[state.index], correct);

  if (correct) {
    state.correctlyAnswered.add(state.rounds[state.index]);
    state.score += 1;
    state.correctStreak += 1;
    if (state.correctStreak >= CONFIG.potionStreak) {
      state.correctStreak = 0;
      state.revivePotions += 1;
      ui.potion.classList.remove("potion-earned");
      void ui.potion.offsetWidth;
      ui.potion.classList.add("potion-earned");
      timer(() => ui.potion.classList.remove("potion-earned"), 720);
    }
    selected.classList.add("correct-flash");
    play("right");
    flashFeedback(true);
    state.index += 1;
    updateHud();
    return;
  }

  state.hearts = Math.max(0, state.hearts - 1);
  state.correctStreak = 0;
  state.index += 1;
  state.phase = "dying";
  state.gateActive = false;
  ui.gate.hidden = true;
  selected.classList.add("wrong-flash");
  flashFeedback(false, reason === "collision");
  play("wrong");
  ui.bird.classList.remove("hit", "dead");
  void ui.bird.offsetWidth;
  ui.bird.classList.add("dead");
  updateHud();

  timer(() => {
    ui.bird.classList.remove("dead", "hit");
    if (state.hearts === 0) {
      if (state.revivePotions > 0) showReviveChoice();
      else enterFailureScreen();
      return;
    }
    state.phase = "main";
    resetBird();
    startFlatFlight();
    prepareNextGate();
  }, 520);
}

function finishMain() {
  showResult();
}

function useRevivePotion() {
  if (state.terminal || state.phase !== "main" || state.revivePotions < 1 || state.hearts >= CONFIG.maxHearts) return;
  state.revivePotions -= 1;
  state.hearts += 1;
  play("click");
  ui.potion.classList.remove("potion-used");
  void ui.potion.offsetWidth;
  ui.potion.classList.add("potion-used");
  timer(() => ui.potion.classList.remove("potion-used"), 520);
  updateHud();
}

function hideReviveChoice() {
  ui.reviveChoice.hidden = true;
  ui.reviveChoiceContent.hidden = false;
  ui.reviveCountdown.hidden = true;
  ui.reviveCountdownNumber.textContent = "3";
}

function showReviveChoice() {
  if (state.revivePotions < 1) {
    enterFailureScreen();
    return;
  }
  cancelAnimationFrame(state.raf);
  state.raf = 0;
  state.phase = "revivePrompt";
  state.resolved = true;
  state.gateActive = false;
  state.preparingGate = false;
  ui.gate.hidden = true;
  stopChickenAnimation();
  resetBird();
  ui.reviveChoiceContent.hidden = false;
  ui.reviveCountdown.hidden = true;
  ui.reviveChoice.hidden = false;
  updateHud();
  play("click");
  ui.reviveConfirm.focus();
}

function resumeAfterRevive() {
  if (state.phase !== "reviveCountdown") return;
  hideReviveChoice();
  state.phase = "main";
  state.resolved = true;
  state.gateActive = false;
  state.preparingGate = false;
  ui.bird.hidden = false;
  resetBird();
  startFlatFlight();
  startChickenAnimation();
  updateHud();
  state.lastTime = performance.now();
  state.raf = requestAnimationFrame(loop);
  prepareNextGate();
}

function acceptReviveChoice() {
  if (state.phase !== "revivePrompt" || state.revivePotions < 1) return;
  state.revivePotions -= 1;
  state.hearts = 1;
  state.phase = "reviveCountdown";
  ui.reviveChoiceContent.hidden = true;
  ui.reviveCountdown.hidden = false;
  ui.reviveCountdownNumber.textContent = "3";
  play("click");
  updateHud();

  let remaining = 3;
  const tick = () => {
    if (state.phase !== "reviveCountdown") return;
    remaining -= 1;
    if (remaining === 0) {
      resumeAfterRevive();
      return;
    }
    ui.reviveCountdownNumber.textContent = remaining;
    timer(tick, 1000);
  };
  timer(tick, 1000);
}

function declineReviveChoice() {
  if (state.phase !== "revivePrompt") return;
  hideReviveChoice();
  enterFailureScreen();
}

function showResult() {
  cancelAnimationFrame(state.raf);
  state.raf = 0;
  state.resolved = true;
  ui.gate.hidden = true;
  ui.question.hidden = true;
  ui.bird.hidden = true;

  if (state.level >= state.totalLevels) {
    finishTrackingGame(state.score);
    ui.result.hidden = true;
    openLearningReport(true);
    return;
  }

  state.phase = "result";
  ui.result.hidden = false;
  renderHearts(ui.resultHearts, state.hearts);
  ui.resultScore.textContent = `Score：${state.score}`;
  timer(completeGame, 2000);
}

function stopForTerminal() {
  stopReportNarration();
  state.terminal = true;
  cancelAnimationFrame(state.raf);
  state.raf = 0;
  state.timers.forEach(clearTimeout);
  state.timers.clear();
  stopChickenAnimation();
  Object.values(audio).forEach(sound => { sound.pause(); try { sound.currentTime = 0; } catch (_) {} });
  ui.game.hidden = true;
  ui.end.hidden = false;
}

function enterFailureScreen() {
  if (state.terminal) return;
  cancelAnimationFrame(state.raf);
  state.raf = 0;
  state.resolved = true;
  state.gateActive = false;
  state.preparingGate = false;
  ui.gate.hidden = true;
  ui.bird.hidden = true;
  finishTrackingGame(state.score);
  openLearningReport(true);
}

function createConfetti() {
  const colors = ["#ff4d6d", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93", "#fff"];
  ui.confetti.replaceChildren(...Array.from({ length: 72 }, (_, i) => {
    const piece = document.createElement("i");
    piece.className = "confetti-piece";
    piece.style.left = `${(i * 37) % 101}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--fall-duration", `${3.4 + (i % 9) * .24}s`);
    piece.style.setProperty("--fall-delay", `${-(i % 13) * .31}s`);
    piece.style.setProperty("--drift", `${-70 + (i % 15) * 10}px`);
    piece.style.setProperty("--spin", `${360 + (i % 6) * 180}deg`);
    return piece;
  }));
}

function completeGame() {
  if (state.terminal) return;
  if (state.level < state.totalLevels) {
    state.level += 1;
    play("click");
    beginMainGame();
    return;
  }
  ui.result.hidden = true;
  openLearningReport(true);
}

function resetToHome() {
  stopReportNarration();
  abandonTrackingGame();
  cancelAnimationFrame(state.raf);
  state.raf = 0;
  state.timers.forEach(clearTimeout);
  state.timers.clear();
  stopChickenAnimation();
  ["click", "right", "wrong", "celebration", "end"].forEach(name => {
    audio[name].pause();
    try { audio[name].currentTime = 0; } catch (_) {}
  });

  state.terminal = false;
  state.phase = "start";
  state.selectedGrade = "七年级";
  state.selectedSemester = "上册";
  state.selectedBookLabel = "七年级上册";
  state.level = 1;
  state.totalLevels = Math.max(1, Math.ceil(getBookQuestions("七年级", "上册").length / CONFIG.questionsPerLevel));
  state.questionDeck = [];
  state.rounds = [];
  state.correctlyAnswered = new Set();
  state.index = 0;
  state.score = 0;
  state.levelStartScore = 0;
  state.hearts = CONFIG.maxHearts;
  state.correctStreak = 0;
  state.revivePotions = 0;
  state.levelStartCorrectStreak = 0;
  state.levelStartRevivePotions = 0;
  state.knowledgeStats = Object.create(null);
  state.reportReturnPhase = null;
  state.reportFromFailure = false;
  state.y = .48;
  state.velocity = 0;
  state.flatFlightActive = false;
  state.gateX = 1.08;
  state.gateActive = false;
  state.preparingGate = false;
  state.resolved = true;
  state.tutorialTap = false;
  state.gateLaneIndex = 0;
  state.lastFlapSoundAt = 0;

  ui.bookButtons.forEach(button => {
    const selected = button.dataset.grade === "七年级" && button.dataset.semester === "上册";
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  ui.start.hidden = false;
  ui.potionIntro.hidden = true;
  ui.game.hidden = true;
  ui.end.hidden = true;
  ui.result.hidden = true;
  ui.report.hidden = true;
  hideReviveChoice();
  ui.gate.hidden = true;
  ui.question.hidden = true;
  ui.question.textContent = "";
  ui.guide.hidden = true;
  ui.bird.hidden = false;
  ui.bird.classList.remove("dead", "hit");
  ui.gate.classList.remove("training");
  ui.gate.dataset.lane = "center";
  ui.gate.style.transform = "";
  ui.feedback.classList.remove("show");
  ui.feedback.textContent = "";
  ui.potion.classList.remove("potion-earned", "potion-used");
  ui.retry.hidden = true;
  ui.confetti.replaceChildren();
  ui.reportButton.setAttribute("aria-expanded", "false");

  updateHud();
  renderLearningReport();
  play("click");
  startBgm();
}

function restartGame() {
  const restartingFromReport = state.phase === "report" || state.phase === "failedReport";
  const restartingFromLegacyFailure = state.terminal && state.phase === "failed";
  if (!restartingFromReport && !restartingFromLegacyFailure) return;
  state.terminal = false;
  state.phase = "start";
  state.reportReturnPhase = null;
  state.reportFromFailure = false;
  state.index = 0;
  state.score = state.levelStartScore;
  state.hearts = CONFIG.maxHearts;
  state.correctStreak = state.levelStartCorrectStreak;
  state.revivePotions = state.levelStartRevivePotions;
  state.gateActive = false;
  state.preparingGate = false;
  state.resolved = true;
  state.velocity = 0;
  ui.bird.classList.remove("dead", "hit");
  ui.report.hidden = true;
  hideReviveChoice();
  ui.reportButton.setAttribute("aria-expanded", "false");
  ui.retry.hidden = true;
  ui.game.hidden = false;
  ui.end.hidden = true;
  ui.confetti.replaceChildren();
  play("click");
  startBgm();
  if (state.tutorialComplete) beginMainGame();
  else startTutorial();
}

document.querySelector("#startButton").addEventListener("click", startSelectedBook);
ui.bookButtons.forEach(button => button.addEventListener("click", () => selectBook(button)));
ui.retry.addEventListener("click", restartGame);
ui.reportButton.addEventListener("click", () => openLearningReport(false));
ui.reportContinue.addEventListener("click", closeLearningReport);
ui.reportReplay.addEventListener("click", resetToHome);
ui.reviveConfirm.addEventListener("click", acceptReviveChoice);
ui.reviveDecline.addEventListener("click", declineReviveChoice);
ui.potion.addEventListener("pointerdown", event => event.stopPropagation());
ui.potion.addEventListener("click", useRevivePotion);
ui.field.addEventListener("pointerdown", event => { event.preventDefault(); flap(); });
document.addEventListener("keydown", event => {
  if (state.phase === "revivePrompt") {
    if (event.code === "Escape") { event.preventDefault(); declineReviveChoice(); }
    return;
  }
  if (state.phase === "reviveCountdown") return;
  if (event.code === "Escape" && state.phase === "report") { event.preventDefault(); closeLearningReport(); return; }
  if (["Space", "ArrowUp"].includes(event.code)) { event.preventDefault(); flap(); }
});
window.addEventListener("pagehide", abandonTrackingGame);
window.addEventListener("resize", refreshMetrics, { passive: true });

["selectstart", "dragstart", "contextmenu"].forEach(type => {
  ui.shell.addEventListener(type, event => event.preventDefault());
});

updateHud();
startBgm();
document.addEventListener("pointerdown", startBgm, { once: true, capture: true });
document.addEventListener("keydown", startBgm, { once: true, capture: true });
["assets/images/chicken1.png", "assets/images/chicken2.png", "assets/images/startbtn.png", "assets/images/retry.png", "assets/images/aixin.png", "assets/images/revive-potion.png"].forEach(src => {
  const image = new Image();
  image.src = src;
});
