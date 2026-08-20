(() => {
  "use strict";

  const levels = Array.isArray(window.CROSSWORD_LEVELS) ? window.CROSSWORD_LEVELS : [];
  const bank = Array.isArray(window.WORD_BANK) ? window.WORD_BANK : [];
  const clues = window.WORD_CLUES && typeof window.WORD_CLUES === "object" ? window.WORD_CLUES : {};
  const meanings = window.WORD_MEANINGS && typeof window.WORD_MEANINGS === "object" ? window.WORD_MEANINGS : {};
  const FEEDBACK_MS = 340;
  const SEARCH_LIMIT = 50000;
  const TIME_LIMIT_SECONDS = 120;
  const BACKGROUND_VOLUME = 0.22;
  const BACKGROUND_DUCKED_VOLUME = 0.08;
  const HINT_DEFAULTS = Object.freeze({ letter: 1, levelsPassed: 0 });
  const HINT_STORAGE_KEY = "word-bloom-crossword-hint-inventory";
  const COMPLETION_STORAGE_KEY = "word-bloom-crossword-completed";
  const REPORT_AUDIO_PATHS = Object.freeze({
    reviewIntro: "report/1_1.mp3",
    reviewOutro: "report/1_2.mp3",
    allMastered: "report/2.mp3",
  });
  const wordBuckets = new Map();
  const allWordBuckets = new Map();
  const referenceGroupCache = new Map();
  const variantBags = new Map();
  const lastVariantIndices = new Map();
  const levelBags = new Map();
  const lastLevelIds = new Map();
  const wordAudioPathCache = new Map();
  const gameTracker = typeof window.GameTracker === "function"
    ? new window.GameTracker({
      gameId: "word-bloom-crossword",
      gameVersion: "1.0.0",
      apiUrl: "http://127.0.0.1:8000/api/v1/events",
      getUserId() {
        return window.platformUserId || null;
      },
    })
    : null;

  const elements = {
    brandHome: document.querySelector("#brand-home"),
    gameTopActions: document.querySelector("#game-top-actions"),
    learningReportOpen: document.querySelector("#learning-report-open"),
    levelView: document.querySelector("#level-view"),
    levelGrid: document.querySelector("#level-grid"),
    termModal: document.querySelector("#term-modal"),
    termModalTitle: document.querySelector("#term-modal-title"),
    termModalClose: document.querySelector("#term-modal-close"),
    termOptions: document.querySelector("#term-options"),
    gameView: document.querySelector("#game-view"),
    scoreCard: document.querySelector("#score-card"),
    scoreValue: document.querySelector("#score-value"),
    timerCard: document.querySelector("#timer-card"),
    timerValue: document.querySelector("#timer-value"),
    boardWrap: document.querySelector(".board-wrap"),
    crossword: document.querySelector("#crossword"),
    cluePosition: document.querySelector("#clue-position"),
    clueText: document.querySelector("#clue-text"),
    hintLetter: document.querySelector("#hint-letter"),
    hintLetterCount: document.querySelector("#hint-letter-count"),
    solvedWordsPanel: document.querySelector("#solved-words-panel"),
    solvedWordsCount: document.querySelector("#solved-words-count"),
    solvedWordsList: document.querySelector("#solved-words-list"),
    floatingKeyboard: document.querySelector("#floating-keyboard"),
    wordWheel: document.querySelector("#word-wheel"),
    wordWheelLetters: document.querySelector("#word-wheel-letters"),
    wheelDelete: document.querySelector("#wheel-delete"),
    wheelClear: document.querySelector("#wheel-clear"),
    learningReport: document.querySelector("#learning-report"),
    learningReportWords: document.querySelector("#learning-report-words"),
    learningReportLevels: document.querySelector("#learning-report-levels"),
    completion: document.querySelector("#completion"),
    completionProgress: document.querySelector("#completion-progress"),
    toast: document.querySelector("#toast"),
    backgroundMusic: document.querySelector("#background-music"),
    wordAudio: document.querySelector("#word-audio"),
    reportAudio: document.querySelector("#report-audio"),
  };

  const state = {
    level: null,
    cells: new Map(),
    values: new Map(),
    sources: new Map(),
    owners: new Map(),
    overwriteBackups: new Map(),
    solved: new Set(),
    accepted: new Map(),
    wrong: new Set(),
    activeId: null,
    activeKey: null,
    inputLocked: true,
    complete: false,
    selectedGrade: null,
    totalScore: 0,
    hints: { ...HINT_DEFAULTS },
    used: { letter: 0 },
    keyboardOpen: false,
    toastTimer: null,
    completionAdvanceTimer: null,
    countdownTimer: null,
    countdownDeadline: 0,
    remainingSeconds: TIME_LIMIT_SECONDS,
    reportOpen: false,
    reportReason: null,
    reportAudioPlaying: false,
    reportAudioToken: 0,
    reportAudioResolve: null,
    wordAudioToken: 0,
    wheelOuterLetters: [],
  };

  function keyOf(row, col) {
    return `${row},${col}`;
  }

  function delay(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  function clearCompletionAdvance() {
    window.clearTimeout(state.completionAdvanceTimer);
    state.completionAdvanceTimer = null;
  }

  function showToast(message) {
    window.clearTimeout(state.toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    state.toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 1800);
  }

  function startTrackedSession() {
    gameTracker?.start();
  }

  function finishTrackedSession() {
    if (!gameTracker) return;
    void gameTracker.finish(state.solved.size);
  }

  function abandonTrackedSession() {
    if (gameTracker?.sessionId && !gameTracker.finished) gameTracker.abandon();
  }

  function playBackgroundMusic(allowMutedFallback = false) {
    const audio = elements.backgroundMusic;
    if (!audio || !audio.paused) return;
    audio.muted = false;
    const playback = audio.play();
    if (!playback || typeof playback.catch !== "function") return;
    playback.catch(() => {
      if (!allowMutedFallback || !audio.paused) return;
      audio.muted = true;
      const mutedPlayback = audio.play();
      if (mutedPlayback && typeof mutedPlayback.catch === "function") mutedPlayback.catch(() => {});
    });
  }

  function unlockBackgroundMusic() {
    const audio = elements.backgroundMusic;
    if (!audio) return;
    audio.muted = false;
    const playback = audio.play();
    const finishUnlock = () => {
      if (audio.paused || audio.muted) return;
      document.removeEventListener("pointerdown", unlockBackgroundMusic);
      document.removeEventListener("keydown", unlockBackgroundMusic);
    };
    if (playback && typeof playback.then === "function") {
      playback.then(finishUnlock).catch(() => {});
    } else {
      finishUnlock();
    }
  }

  function restoreBackgroundMusicVolume() {
    if (elements.backgroundMusic) elements.backgroundMusic.volume = BACKGROUND_VOLUME;
  }

  function wordAudioPathFor(word, preferredGrade) {
    const normalized = String(word || "").trim().toLowerCase();
    if (!normalized) return "";
    const cacheKey = `${preferredGrade}:${normalized}`;
    if (wordAudioPathCache.has(cacheKey)) return wordAudioPathCache.get(cacheKey);
    const preferred = bank.find((entry) => (
      entry.grade === preferredGrade && entry.word === normalized && entry.audio
    ));
    const fallback = preferred || bank.find((entry) => entry.word === normalized && entry.audio);
    const audioPath = fallback?.audio || "";
    wordAudioPathCache.set(cacheKey, audioPath);
    return audioPath;
  }

  function playWordAudio(word, preferredGrade) {
    const audio = elements.wordAudio;
    const audioPath = wordAudioPathFor(word, preferredGrade);
    if (!audio || !audioPath) return;
    state.wordAudioToken += 1;
    const token = state.wordAudioToken;
    audio.pause();
    audio.src = audioPath;
    audio.currentTime = 0;
    if (elements.backgroundMusic) elements.backgroundMusic.volume = BACKGROUND_DUCKED_VOLUME;
    const playback = audio.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(() => {
        if (token === state.wordAudioToken) restoreBackgroundMusicVolume();
      });
    }
  }

  function renderCountdown() {
    elements.timerValue.textContent = String(state.remainingSeconds);
    elements.timerCard.setAttribute("aria-label", `剩余时间 ${state.remainingSeconds} 秒`);
  }

  function renderScore() {
    elements.scoreValue.textContent = String(state.totalScore);
    elements.scoreCard.setAttribute("aria-label", `累计得分 ${state.totalScore}`);
  }

  function stopCountdown({ reset = false } = {}) {
    window.clearInterval(state.countdownTimer);
    state.countdownTimer = null;
    state.countdownDeadline = 0;
    if (reset) {
      state.remainingSeconds = TIME_LIMIT_SECONDS;
      renderCountdown();
    }
  }

  function updateCountdown() {
    if (!state.countdownDeadline) return;
    const remaining = Math.max(0, Math.ceil((state.countdownDeadline - Date.now()) / 1000));
    if (remaining === state.remainingSeconds) return;
    state.remainingSeconds = remaining;
    renderCountdown();
    if (remaining === 0) {
      stopCountdown();
      if (!state.complete && document.body.classList.contains("is-playing")) openLearningReport("timeout");
    }
  }

  function startCountdown() {
    stopCountdown({ reset: true });
    state.countdownDeadline = Date.now() + TIME_LIMIT_SECONDS * 1000;
    state.countdownTimer = window.setInterval(updateCountdown, 250);
  }

  function completionStore() {
    try {
      return JSON.parse(window.localStorage.getItem(COMPLETION_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function hintInventoryStore() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(HINT_STORAGE_KEY) || "null");
      return {
        letter: Math.max(0, Number.isFinite(stored?.letter) ? Math.floor(stored.letter) : HINT_DEFAULTS.letter),
        levelsPassed: Math.max(0, Number.isFinite(stored?.levelsPassed) ? Math.floor(stored.levelsPassed) : 0),
      };
    } catch {
      return { ...HINT_DEFAULTS };
    }
  }

  function saveHintInventory() {
    try {
      window.localStorage.setItem(HINT_STORAGE_KEY, JSON.stringify(state.hints));
    } catch {
      // Storage is optional; the inventory remains available for this session.
    }
  }

  function spendHint(type) {
    state.hints[type] = Math.max(0, state.hints[type] - 1);
    saveHintInventory();
  }

  function awardCompletionHints() {
    state.hints.levelsPassed += 1;
    const earnedLetter = state.hints.levelsPassed % 2 === 0;
    if (earnedLetter) state.hints.letter += 1;
    saveHintInventory();
    return earnedLetter;
  }

  function saveCompletion() {
    try {
      const completed = completionStore();
      completed[state.level.id] = {
        used: { ...state.used },
        answers: Object.fromEntries(state.accepted),
        completedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(COMPLETION_STORAGE_KEY, JSON.stringify(completed));
    } catch {
      // Storage is optional; gameplay remains available when it is blocked.
    }
  }

  function resetGameProgress() {
    try {
      window.localStorage.removeItem(COMPLETION_STORAGE_KEY);
      window.localStorage.removeItem(HINT_STORAGE_KEY);
    } catch {
      // Storage is optional; reset the in-memory state even when it is blocked.
    }
    state.hints = { ...HINT_DEFAULTS };
    state.totalScore = 0;
    renderScore();
    levelBags.clear();
    lastLevelIds.clear();
    variantBags.clear();
    lastVariantIndices.clear();
    referenceGroupCache.clear();
  }

  function gradeGroupKey(level) {
    if (!level) return "";
    if (level.grade === "grade1_3") return "grade1_3";
    const match = level.grade.match(/^grade(\d+)_/);
    return match ? `grade${match[1]}` : level.grade;
  }

  function pendingLevelsInCurrentTerm() {
    if (!state.level) return [];
    const completed = completionStore();
    return levels.filter((level) => (
      level.grade === state.level.grade && !completed[level.id]
    ));
  }

  function startNextLevel(levelOptions) {
    if (!levelOptions?.length) return;
    const completed = completionStore();
    const pending = levelOptions.filter((level) => !completed[level.id]);
    const pool = pending.length ? pending : levelOptions;
    const poolIds = new Set(pool.map((level) => level.id));
    const bagKey = levelOptions.map((level) => level.id).sort().join("|");
    let bag = (levelBags.get(bagKey) || []).filter((id) => poolIds.has(id));
    if (!bag.length) {
      bag = shuffled([...poolIds]);
      const lastId = lastLevelIds.get(bagKey);
      if (bag.length > 1 && bag[bag.length - 1] === lastId) {
        [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
      }
    }
    const selectedId = bag.pop();
    levelBags.set(bagKey, bag);
    lastLevelIds.set(bagKey, selectedId);
    startLevel(selectedId);
  }

  function isGradeComplete(level) {
    const completed = completionStore();
    const key = gradeGroupKey(level);
    const gradeLevels = levels.filter((item) => gradeGroupKey(item) === key);
    return gradeLevels.length > 0 && gradeLevels.every((item) => Boolean(completed[item.id]));
  }

  function sortedPlacements() {
    return [...(state.level?.placements || [])].sort((first, second) => (
      first.number - second.number || (first.direction === "H" ? -1 : 1)
    ));
  }

  function displayGridMetrics() {
    if (!state.level) return { transposed: false, rows: 0, cols: 0 };
    const transposed = state.level.rows > state.level.cols;
    return {
      transposed,
      rows: transposed ? state.level.cols : state.level.rows,
      cols: transposed ? state.level.rows : state.level.cols,
    };
  }

  function displayDirection(placement) {
    const horizontal = placement.direction === "H";
    return displayGridMetrics().transposed ? (horizontal ? "竖" : "横") : (horizontal ? "横" : "竖");
  }

  function referenceWord(placement) {
    return placement.cells.map((cell) => cell.letter).join("").toUpperCase();
  }

  function shuffled(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function buildWordWheel() {
    if (!state.level) return;
    const center = String(state.level.centerLetter || "").toLowerCase();
    const keyboardLetters = state.wheelOuterLetters;
    elements.wordWheelLetters.innerHTML = "";

    keyboardLetters.forEach((letter, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `wheel-letter${letter === center ? " wheel-letter--center" : ""}`;
      button.dataset.index = String(index);
      button.dataset.letter = letter;
      button.textContent = letter.toUpperCase();
      button.setAttribute(
        "aria-label",
        `${letter === center ? "必选" : ""}字母 ${letter.toUpperCase()}`,
      );
      elements.wordWheelLetters.append(button);
    });
    elements.wordWheel.setAttribute(
      "aria-label",
      `本关字母键盘：${keyboardLetters.join("、").toUpperCase()}；蓝色按键 ${center.toUpperCase()} 为必选字母`,
    );
  }

  function backupMapForPlacement(placement) {
    if (!state.overwriteBackups.has(placement.id)) {
      state.overwriteBackups.set(placement.id, new Map());
    }
    return state.overwriteBackups.get(placement.id);
  }

  function rememberOverwrittenEntry(placement, key) {
    const owner = state.owners.get(key);
    if (!state.values.get(key) || state.sources.get(key) !== "player" || owner === placement.id) return;
    const backups = backupMapForPlacement(placement);
    if (backups.has(key)) return;
    backups.set(key, {
      value: state.values.get(key),
      source: state.sources.get(key),
      owner,
    });
  }

  function restoreOrRemoveOwnedEntry(placement, key) {
    const backups = state.overwriteBackups.get(placement.id);
    if (backups?.has(key)) {
      const previous = backups.get(key);
      state.values.set(key, previous.value);
      state.sources.set(key, previous.source);
      if (previous.owner) state.owners.set(key, previous.owner);
      else state.owners.delete(key);
      backups.delete(key);
      return true;
    }
    if (state.owners.get(key) !== placement.id) return false;
    state.values.delete(key);
    state.sources.delete(key);
    state.owners.delete(key);
    return true;
  }

  function resetPlacementPlayerInput(placement) {
    placement.cells.forEach((cell) => {
      const key = keyOf(cell.row, cell.col);
      if (!isEditableKey(key)) return;
      restoreOrRemoveOwnedEntry(placement, key);
    });
    state.overwriteBackups.delete(placement.id);
    state.activeKey = findEditable(placement, 0, { emptyOnly: true })?.key
      || findEditable(placement, 0)?.key
      || state.activeKey;
    clearWrongState(placement);
  }

  function clearActiveWord() {
    if (state.inputLocked || state.complete) return;
    const placement = activePlacement();
    if (!placement) return;
    resetPlacementPlayerInput(placement);
    render();
  }

  function handleWheelClick(event) {
    const button = event.target.closest?.(".wheel-letter");
    if (!button) return;
    activateWheelLetter(button);
  }

  function activateWheelLetter(button) {
    if (state.inputLocked || state.complete) return;
    writeLetter(button.dataset.letter);
    button.classList.remove("is-tapped");
    void button.offsetWidth;
    button.classList.add("is-tapped");
    button.addEventListener("animationend", () => {
      button.classList.remove("is-tapped");
    }, { once: true });
  }

  function createRandomizedLevel(template) {
    referenceGroupCache.delete(template.id);
    const variants = Array.isArray(template.variants) && template.variants.length
      ? template.variants
      : [template];
    let bag = variantBags.get(template.id);
    if (!bag?.length) {
      bag = shuffled(variants.map((_, index) => index));
      const lastIndex = lastVariantIndices.get(template.id);
      if (bag.length > 1 && bag[bag.length - 1] === lastIndex) {
        [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
      }
      variantBags.set(template.id, bag);
    }
    const variantIndex = bag.pop();
    const variant = variants[variantIndex];
    lastVariantIndices.set(template.id, variantIndex);
    const level = {
      ...template,
      ...variant,
      id: template.id,
      order: template.order,
      grade: template.grade,
      gradeLabel: template.gradeLabel,
      title: template.title,
      variants: template.variants,
    };
    if (Array.isArray(variant.referenceGroups) && variant.referenceGroups.length) {
      const words = variant.referenceGroups[0];
      const group = new Map(
        level.placements.map((placement, index) => [placement.id, words[index]]),
      );
      referenceGroupCache.set(template.id, group);
    }
    return level;
  }

  function originalReferenceGroup() {
    return new Map(sortedPlacements().map((placement) => [placement.id, referenceWord(placement).toLowerCase()]));
  }

  function referencePrefillConstraints() {
    const constraints = new Map();
    state.level.prefills.forEach(({ row, col }) => {
      const key = keyOf(row, col);
      const cell = state.cells.get(key);
      if (cell) constraints.set(key, cell.letter);
    });
    return constraints;
  }

  function findAlternativeReferenceGroup(originalGroup) {
    const placements = sortedPlacements();
    const chosen = new Map();
    const usedWords = new Set();
    let visited = 0;

    function search(open, constraints) {
      visited += 1;
      if (visited > SEARCH_LIMIT || !open.length) {
        if (open.length) return null;
        const isDifferent = placements.some((placement) => (
          chosen.get(placement.id) !== originalGroup.get(placement.id)
        ));
        return isDifferent ? new Map(chosen) : null;
      }

      let bestIndex = -1;
      let bestCandidates = null;
      for (let index = 0; index < open.length; index += 1) {
        const placement = open[index];
        const originalWord = originalGroup.get(placement.id);
        const candidates = wordsForLength(state.level.grade, placement.cells.length)
          .filter((word) => !usedWords.has(word) && placement.cells.every((cell, letterIndex) => {
            const required = constraints.get(keyOf(cell.row, cell.col));
            return !required || required === word[letterIndex];
          }))
          .sort((first, second) => Number(first === originalWord) - Number(second === originalWord));
        if (!candidates.length) return null;
        if (!bestCandidates || candidates.length < bestCandidates.length) {
          bestIndex = index;
          bestCandidates = candidates;
        }
      }

      const placement = open[bestIndex];
      const nextOpen = open.filter((_, index) => index !== bestIndex);
      for (const word of bestCandidates) {
        const nextConstraints = placeWordInConstraints(placement, word, constraints);
        if (!nextConstraints) continue;
        chosen.set(placement.id, word);
        usedWords.add(word);
        const result = search(nextOpen, nextConstraints);
        if (result) return result;
        usedWords.delete(word);
        chosen.delete(placement.id);
      }
      return null;
    }

    return search(placements, referencePrefillConstraints());
  }

  function referenceGroupForReport() {
    const cached = referenceGroupCache.get(state.level.id);
    if (cached) return cached;
    const originalGroup = originalReferenceGroup();
    referenceGroupCache.set(state.level.id, originalGroup);
    return originalGroup;
  }

  function playerWordForReport(placement) {
    const accepted = state.accepted.get(placement.id);
    return accepted ? accepted.toUpperCase() : "";
  }

  function reportNarrationWords() {
    if (!state.level) return [];
    const referenceGroup = referenceGroupForReport();
    return sortedPlacements()
      .filter((placement) => !state.solved.has(placement.id))
      .map((placement) => referenceGroup.get(placement.id))
      .filter(Boolean)
      .slice(0, 3);
  }

  function finishReportAudioClip() {
    const resolve = state.reportAudioResolve;
    state.reportAudioResolve = null;
    if (resolve) resolve();
  }

  function stopReportNarration({ restoreVolume = true } = {}) {
    state.reportAudioToken += 1;
    state.reportAudioPlaying = false;
    const audio = elements.reportAudio;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    finishReportAudioClip();
    if (restoreVolume) restoreBackgroundMusicVolume();
  }

  function playReportAudioClip(audioPath, token) {
    const audio = elements.reportAudio;
    if (!audio || !audioPath || token !== state.reportAudioToken) return Promise.resolve();
    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        audio.removeEventListener("ended", finish);
        audio.removeEventListener("error", finish);
        if (state.reportAudioResolve === finish) state.reportAudioResolve = null;
        resolve();
      };
      state.reportAudioResolve = finish;
      audio.addEventListener("ended", finish, { once: true });
      audio.addEventListener("error", finish, { once: true });
      audio.pause();
      audio.src = audioPath;
      audio.currentTime = 0;
      const playback = audio.play();
      if (playback && typeof playback.catch === "function") playback.catch(finish);
    });
  }

  async function startReportNarration() {
    if (!state.reportOpen || state.reportAudioPlaying) return;
    const words = reportNarrationWords();
    const queue = words.length
      ? [
        REPORT_AUDIO_PATHS.reviewIntro,
        ...words.map((word) => wordAudioPathFor(word, state.level.grade)).filter(Boolean),
        REPORT_AUDIO_PATHS.reviewOutro,
      ]
      : [REPORT_AUDIO_PATHS.allMastered];
    state.reportAudioToken += 1;
    const token = state.reportAudioToken;
    state.reportAudioPlaying = true;
    state.wordAudioToken += 1;
    elements.wordAudio?.pause();
    if (elements.backgroundMusic) elements.backgroundMusic.volume = BACKGROUND_DUCKED_VOLUME;

    for (const audioPath of queue) {
      if (token !== state.reportAudioToken || !state.reportOpen) break;
      await playReportAudioClip(audioPath, token);
    }

    if (token !== state.reportAudioToken) return;
    state.reportAudioPlaying = false;
    state.reportAudioResolve = null;
    restoreBackgroundMusicVolume();
  }

  function renderLearningReport() {
    const placements = sortedPlacements();
    const referenceGroup = referenceGroupForReport();
    elements.learningReportWords.innerHTML = "";

    placements.forEach((placement) => {
      const solved = state.solved.has(placement.id);
      const row = document.createElement("div");
      row.className = `learning-report__word${solved ? " is-complete" : ""}`;
      row.innerHTML = `
        <span class="learning-report__word-number">${placement.number}${placement.direction === "H" ? "横" : "纵"}</span>
        <strong class="learning-report__player-word">${playerWordForReport(placement)}</strong>
        <span class="learning-report__word-arrow" aria-hidden="true">→</span>
        <strong class="learning-report__reference-word">${referenceGroup.get(placement.id).toUpperCase()}</strong>
      `;
      elements.learningReportWords.append(row);
    });
  }

  function hideLearningReport() {
    stopReportNarration();
    elements.learningReport.hidden = true;
    document.documentElement.classList.remove("is-report-open");
    document.body.classList.remove("is-report-open");
    state.reportOpen = false;
    state.reportReason = null;
  }

  function openLearningReport(reason = "manual") {
    if (!state.level || state.reportOpen) return;
    stopCountdown();
    closeFloatingKeyboard();
    elements.solvedWordsPanel.hidden = true;
    finishTrackedSession();
    state.reportOpen = true;
    state.reportReason = reason;
    state.inputLocked = true;
    document.documentElement.classList.add("is-report-open");
    document.body.classList.add("is-report-open");
    renderLearningReport();
    elements.learningReport.hidden = false;
    renderControls();
    void startReportNarration();
  }

  function activePlacement() {
    return state.level?.placements.find((placement) => placement.id === state.activeId) || null;
  }

  function clueForPlacement(placement) {
    if (!placement || !state.level) return "选择词格后，这里会显示一句提示。";
    const word = (placement.word || referenceWord(placement)).toLowerCase();
    return clues[state.level.grade]?.[word]
      || placement.clue
      || `这是一个由 ${placement.cells.length} 个字母组成的单词。`;
  }

  function meaningForWord(word, preferredGrade) {
    const normalized = String(word || "").trim().toLowerCase();
    if (!normalized) return "";
    if (meanings[preferredGrade]?.[normalized]) return meanings[preferredGrade][normalized];
    for (const gradeMeanings of Object.values(meanings)) {
      if (gradeMeanings?.[normalized]) return gradeMeanings[normalized];
    }
    return "暂无中文释义";
  }

  function compactMeaningForWord(word, preferredGrade) {
    const fullMeaning = meaningForWord(word, preferredGrade);
    const cleanedMeaning = fullMeaning
      .replace(/[\uFF08(][^\uFF09)]*[\uFF09)]/g, "")
      .replace(/[\uFF09)]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const meaningParts = cleanedMeaning
      .split(/[\uFF1B;]/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (meaningParts.length > 1) {
      return meaningParts.slice(0, 2).join("\uFF1B");
    }

    if ([...cleanedMeaning].length > 14) {
      const shortParts = cleanedMeaning
        .split(/[\uFF0C,]/)
        .map((part) => part.trim())
        .filter(Boolean);
      if (shortParts.length > 1) return shortParts.slice(0, 2).join("\uFF1B");
    }

    return cleanedMeaning || fullMeaning;
  }

  function renderSolvedWords() {
    if (!state.level) return;
    const solvedPlacements = sortedPlacements().filter((placement) => state.solved.has(placement.id));
    elements.solvedWordsCount.textContent = `${solvedPlacements.length}/${state.level.placements.length}`;
    elements.solvedWordsList.hidden = solvedPlacements.length === 0;
    elements.solvedWordsList.innerHTML = "";

    solvedPlacements.forEach((placement) => {
      const word = state.accepted.get(placement.id) || currentAnswer(placement);
      const item = document.createElement("div");
      item.className = "solved-word";
      const english = document.createElement("strong");
      english.textContent = word.toUpperCase();
      const chinese = document.createElement("span");
      chinese.textContent = compactMeaningForWord(word, state.level.grade);
      item.append(english, chinese);
      elements.solvedWordsList.append(item);
    });
  }

  function renderClue() {
    const placement = activePlacement() || sortedPlacements().find((item) => !state.solved.has(item.id));
    if (!placement) {
      elements.cluePosition.textContent = "完成";
      elements.clueText.textContent = "这一题的单词已经全部完成。";
      return;
    }
    elements.cluePosition.textContent = `${placement.number} ${displayDirection(placement)}`;
    elements.clueText.textContent = clueForPlacement(placement);
  }

  function buildCellMap(level) {
    const cells = new Map();
    level.placements.forEach((placement) => {
      placement.cells.forEach((cell) => {
        const key = keyOf(cell.row, cell.col);
        if (!cells.has(key)) {
          cells.set(key, { row: cell.row, col: cell.col, letter: cell.letter, placementIds: [] });
        }
        cells.get(key).placementIds.push(placement.id);
      });
    });
    return cells;
  }

  function wordsForLength(grade, length) {
    const cacheKey = `${grade}:${length}`;
    if (!wordBuckets.has(cacheKey)) {
      const seen = new Set();
      const words = bank.filter((entry) => {
        const valid = entry.grade === grade
          && entry.word.length === length
          && /^[a-z]+$/.test(entry.word)
          && !seen.has(entry.word);
        if (valid) seen.add(entry.word);
        return valid;
      }).map((entry) => entry.word);
      wordBuckets.set(cacheKey, words);
    }
    return wordBuckets.get(cacheKey);
  }

  function allWordsForLength(length) {
    if (!allWordBuckets.has(length)) {
      const seen = new Set();
      const words = bank.filter((entry) => {
        const valid = entry.word.length === length
          && /^[a-z]+$/.test(entry.word)
          && !seen.has(entry.word);
        if (valid) seen.add(entry.word);
        return valid;
      }).map((entry) => entry.word);
      allWordBuckets.set(length, words);
    }
    return allWordBuckets.get(length);
  }

  function rankedWordsForLength(grade, length) {
    const gradeWords = wordsForLength(grade, length);
    const gradeSet = new Set(gradeWords);
    return [...gradeWords, ...allWordsForLength(length).filter((word) => !gradeSet.has(word))];
  }

  function lockedConstraints() {
    const constraints = new Map();
    state.cells.forEach((cell, key) => {
      if (isLockedKey(key) && state.values.get(key)) constraints.set(key, state.values.get(key));
    });
    return constraints;
  }

  function candidatesForPlacement(placement, constraints) {
    return rankedWordsForLength(state.level.grade, placement.cells.length).filter((word) => (
      placement.cells.every((cell, index) => {
        const required = constraints.get(keyOf(cell.row, cell.col));
        return !required || required === word[index];
      })
    ));
  }

  function placeWordInConstraints(placement, word, constraints) {
    const next = new Map(constraints);
    for (let index = 0; index < placement.cells.length; index += 1) {
      const cell = placement.cells[index];
      const key = keyOf(cell.row, cell.col);
      if (next.has(key) && next.get(key) !== word[index]) return null;
      next.set(key, word[index]);
    }
    return next;
  }

  function findGridSolution(options = {}) {
    const { fixedId = null, fixedWord = null, respectPlayerFor = null } = options;
    let constraints = lockedConstraints();
    const solution = new Map();
    const remaining = sortedPlacements().filter((placement) => !state.solved.has(placement.id));

    if (respectPlayerFor) {
      const placement = placementForId(respectPlayerFor);
      placement?.cells.forEach((cell) => {
        const key = keyOf(cell.row, cell.col);
        if (state.sources.get(key) === "player" && state.values.get(key)) {
          constraints.set(key, state.values.get(key));
        }
      });
    }

    if (fixedId && fixedWord) {
      const placement = placementForId(fixedId);
      if (!placement || fixedWord.length !== placement.cells.length || !/^[a-z]+$/.test(fixedWord)) return null;
      const next = placeWordInConstraints(placement, fixedWord, constraints);
      if (!next) return null;
      constraints = next;
      solution.set(fixedId, fixedWord);
    }

    const unresolved = remaining.filter((placement) => placement.id !== fixedId);
    let visited = 0;
    function search(open, currentConstraints) {
      visited += 1;
      if (visited > SEARCH_LIMIT) return null;
      if (!open.length) return new Map(solution);

      let bestIndex = -1;
      let bestCandidates = null;
      for (let index = 0; index < open.length; index += 1) {
        const candidates = candidatesForPlacement(open[index], currentConstraints);
        if (!candidates.length) return null;
        if (!bestCandidates || candidates.length < bestCandidates.length) {
          bestIndex = index;
          bestCandidates = candidates;
          if (candidates.length === 1) break;
        }
      }

      const placement = open[bestIndex];
      const nextOpen = open.filter((_, index) => index !== bestIndex);
      for (const word of bestCandidates) {
        const nextConstraints = placeWordInConstraints(placement, word, currentConstraints);
        if (!nextConstraints) continue;
        solution.set(placement.id, word);
        const result = search(nextOpen, nextConstraints);
        if (result) return result;
        solution.delete(placement.id);
      }
      return null;
    }

    return search(unresolved, constraints);
  }

  function baseCandidateCount(placement) {
    return candidatesForPlacement(placement, lockedConstraints()).length;
  }

  function classifyWord(word, grade) {
    if (wordsForLength(grade, word.length).includes(word)) {
      return { valid: true, label: "本年级词库" };
    }
    if (allWordsForLength(word.length).includes(word)) {
      return { valid: true, label: "全部词库" };
    }
    return { valid: false, label: "未收录" };
  }

  function placementForId(id) {
    return state.level?.placements.find((placement) => placement.id === id) || null;
  }

  function unsolvedPlacementsForKey(key) {
    const cell = state.cells.get(key);
    if (!cell) return [];
    return cell.placementIds
      .filter((id) => !state.solved.has(id))
      .map(placementForId)
      .filter(Boolean)
      .sort((first, second) => first.number - second.number || (first.direction === "H" ? -1 : 1));
  }

  function isLockedKey(key) {
    const source = state.sources.get(key);
    if (source === "prefill" || source === "hint") return true;
    const cell = state.cells.get(key);
    return Boolean(cell?.placementIds.some((id) => state.solved.has(id)));
  }

  function isEditableKey(key) {
    return state.cells.has(key) && !isLockedKey(key);
  }

  function placementIndexForKey(placement, key) {
    return placement.cells.findIndex((cell) => keyOf(cell.row, cell.col) === key);
  }

  function findEditable(placement, startIndex = 0, options = {}) {
    const { emptyOnly = false, backwards = false, includeStart = true } = options;
    const length = placement.cells.length;
    for (let step = includeStart ? 0 : 1; step < length + (includeStart ? 0 : 1); step += 1) {
      const offset = backwards ? -step : step;
      const index = (startIndex + offset + length) % length;
      const key = keyOf(placement.cells[index].row, placement.cells[index].col);
      if (!isEditableKey(key)) continue;
      if (emptyOnly && state.values.get(key)) continue;
      return { index, key };
    }
    return null;
  }

  function isWordFull(placement) {
    return placement.cells.every((cell) => Boolean(state.values.get(keyOf(cell.row, cell.col))));
  }

  function currentAnswer(placement) {
    return placement.cells.map((cell) => state.values.get(keyOf(cell.row, cell.col)) || "").join("");
  }

  function setActivePlacement(id, focusKey = null) {
    const placement = placementForId(id);
    if (!placement || state.solved.has(id) || state.complete) return;
    state.activeId = id;

    const focusedIndex = focusKey ? placementIndexForKey(placement, focusKey) : -1;
    if (focusedIndex >= 0 && isEditableKey(focusKey)) {
      state.activeKey = focusKey;
    } else {
      const startIndex = focusedIndex >= 0 ? focusedIndex : 0;
      const includeStart = focusedIndex < 0;
      state.activeKey = findEditable(placement, startIndex, { emptyOnly: true, includeStart })?.key
        || findEditable(placement, startIndex, { includeStart })?.key
        || keyOf(placement.cells[0].row, placement.cells[0].col);
    }

    render();
  }

  function selectCell(row, col) {
    if (state.inputLocked || state.complete) return false;
    const key = keyOf(row, col);
    const candidates = unsolvedPlacementsForKey(key);
    if (!candidates.length) {
      if (state.cells.has(key)) showToast("这里的单词已经完成了");
      return false;
    }

    const current = activePlacement();
    let next = null;
    if (key === state.activeKey && candidates.length > 1) {
      const currentIndex = candidates.findIndex((item) => item.id === state.activeId);
      next = candidates[(currentIndex + 1 + candidates.length) % candidates.length];
    } else if (current) {
      next = candidates.find((item) => item.direction === current.direction) || candidates[0];
    } else {
      next = candidates[0];
    }
    setActivePlacement(next.id, key);
    return Boolean(state.activeKey && isEditableKey(state.activeKey));
  }

  function openFloatingKeyboard() {
    if (state.inputLocked || state.complete) return;
    state.keyboardOpen = true;
    elements.floatingKeyboard.hidden = false;
    document.body.classList.add("is-keyboard-open");
    window.requestAnimationFrame(() => {
      fitCrosswordToBoard();
      positionSolvedWordsPanel();
      keepActiveCellVisible();
    });
  }

  function closeFloatingKeyboard() {
    state.keyboardOpen = false;
    elements.floatingKeyboard.hidden = true;
    document.body.classList.remove("is-keyboard-open");
    window.requestAnimationFrame(fitCrosswordToBoard);
  }

  function positionSolvedWordsPanel() {
    if (elements.solvedWordsPanel.hidden || elements.floatingKeyboard.hidden) return;
    const sideKeyboard = window.matchMedia("(max-height: 720px) and (min-width: 901px)").matches;
    if (!sideKeyboard) return;
    const keyboardRect = elements.floatingKeyboard.getBoundingClientRect();
    const clueRect = document.querySelector("#clue-card").getBoundingClientRect();
    const top = Math.ceil(clueRect.bottom + 12);
    const bottom = Math.ceil(window.innerHeight - keyboardRect.top + 12);
    elements.solvedWordsPanel.style.top = `${top}px`;
    elements.solvedWordsPanel.style.bottom = `${bottom}px`;
  }

  function keepActiveCellVisible() {
    if (!state.keyboardOpen || !state.activeKey) return;
    const activeCell = elements.crossword.querySelector(`[data-key="${state.activeKey}"]`);
    if (!activeCell) return;
    const cellRect = activeCell.getBoundingClientRect();
    const keyboardRect = elements.floatingKeyboard.getBoundingClientRect();
    const overlapsKeyboardHorizontally =
      cellRect.right > keyboardRect.left && cellRect.left < keyboardRect.right;
    if (!overlapsKeyboardHorizontally) return;
    const visibleBottom = keyboardRect.top - 18;
    if (cellRect.bottom <= visibleBottom) return;
    window.scrollBy({
      top: cellRect.bottom - visibleBottom,
      behavior: "smooth",
    });
  }

  function clearWrongState(placement) {
    state.wrong.delete(placement.id);
    elements.crossword.classList.remove("is-shaking");
  }

  function writeLetter(letter) {
    if (state.inputLocked || state.complete) return;
    const placement = activePlacement();
    if (!placement) {
      showToast("请先选择一个单词");
      return;
    }

    const normalized = letter.toLowerCase();
    let index = placementIndexForKey(placement, state.activeKey);
    if (index < 0) index = 0;
    let currentKey = keyOf(placement.cells[index].row, placement.cells[index].col);
    if (!isEditableKey(currentKey)) {
      const next = findEditable(placement, index, { emptyOnly: true, includeStart: false })
        || findEditable(placement, index, { includeStart: false });
      if (!next) return;
      index = next.index;
      currentKey = next.key;
      state.activeKey = next.key;
    }

    rememberOverwrittenEntry(placement, currentKey);
    state.values.set(currentKey, normalized);
    state.sources.set(currentKey, "player");
    state.owners.set(currentKey, placement.id);
    clearWrongState(placement);

    if (isWordFull(placement)) {
      render();
      void validatePlacement(placement);
      return;
    }

    const next = findEditable(placement, index, { emptyOnly: true, includeStart: false });
    if (next) state.activeKey = next.key;
    render();
  }

  function deleteLetter() {
    if (state.inputLocked || state.complete) return;
    const placement = activePlacement();
    if (!placement) return;
    for (let index = placement.cells.length - 1; index >= 0; index -= 1) {
      const key = keyOf(placement.cells[index].row, placement.cells[index].col);
      if (!isEditableKey(key) || state.owners.get(key) !== placement.id || !state.values.get(key)) continue;
      restoreOrRemoveOwnedEntry(placement, key);
      state.activeKey = key;
      clearWrongState(placement);
      render();
      return;
    }
  }

  async function validatePlacement(placement) {
    if (state.inputLocked || state.complete || state.solved.has(placement.id)) return;
    state.inputLocked = true;
    renderControls();

    const answer = currentAnswer(placement);
    const classification = await classifyWord(answer, state.level.grade);
    const gridSolution = classification.valid
      ? findGridSolution({ fixedId: placement.id, fixedWord: answer })
      : null;
    if (!classification.valid || !gridSolution) {
      state.wrong.add(placement.id);
      showToast(
        classification.valid
          ? "这个单词会使交叉位置无解，已清空，请重新输入"
          : "你的词库中没有这个单词，已清空，请重新输入",
      );
      renderBoard();
      elements.crossword.classList.remove("is-shaking");
      void elements.crossword.offsetWidth;
      elements.crossword.classList.add("is-shaking");
      await delay(FEEDBACK_MS);
      resetPlacementPlayerInput(placement);
      state.inputLocked = false;
      render();
      return;
    }

    state.solved.add(placement.id);
    state.accepted.set(placement.id, answer);
    state.overwriteBackups.delete(placement.id);
    state.wrong.delete(placement.id);
    state.totalScore += 1;
    playWordAudio(answer, state.level.grade);
    showToast(`${answer.toUpperCase()} · ${classification.label}`);
    render();
    await delay(250);

    if (state.solved.size === state.level.placements.length) {
      finishLevel();
      return;
    }

    state.inputLocked = false;
    const next = sortedPlacements().find((item) => !state.solved.has(item.id));
    if (!next) return;
    setActivePlacement(next.id);
    if (isWordFull(next)) {
      void validatePlacement(next);
    }
  }

  function revealLetter() {
    if (state.inputLocked || state.complete) return;
    if (state.hints.letter <= 0) {
      showToast("揭示字母已经用完了");
      return;
    }
    const placement = activePlacement();
    if (!placement) {
      showToast("请先选择一个单词");
      return;
    }

    const solutionWord = referenceWord(placement).toLowerCase();
    if (!solutionWord) {
      showToast("当前交叉字母下没有可用单词");
      return;
    }

    let startIndex = placementIndexForKey(placement, state.activeKey);
    if (startIndex < 0) startIndex = 0;
    let target = null;
    for (let step = 0; step < placement.cells.length; step += 1) {
      const index = (startIndex + step) % placement.cells.length;
      const cell = placement.cells[index];
      const key = keyOf(cell.row, cell.col);
      if (!isEditableKey(key) || state.values.get(key) === solutionWord[index]) continue;
      target = { key, index };
      break;
    }
    if (!target) {
      showToast("当前词没有可揭示的字母");
      return;
    }

    state.inputLocked = true;
    state.values.set(target.key, solutionWord[target.index]);
    state.sources.set(target.key, "hint");
    state.owners.delete(target.key);
    state.overwriteBackups.get(placement.id)?.delete(target.key);
    spendHint("letter");
    state.used.letter += 1;
    clearWrongState(placement);
    const next = findEditable(placement, target.index, { emptyOnly: true, includeStart: false });
    if (next) state.activeKey = next.key;
    showToast(`已揭示并锁定一个字母，剩余 ${state.hints.letter} 次`);
    render();
    state.inputLocked = false;
    render();
    if (isWordFull(placement)) void validatePlacement(placement);
  }

  function finishLevel() {
    if (state.complete) return;
    clearCompletionAdvance();
    state.complete = true;
    state.inputLocked = true;
    stopCountdown();
    closeFloatingKeyboard();
    finishTrackedSession();
    saveCompletion();
    const earnedLetter = awardCompletionHints();
    const gradeComplete = isGradeComplete(state.level);
    elements.completionProgress.textContent = `${state.solved.size} / ${state.level.placements.length}`;
    renderControls();
    showToast(earnedLetter ? "通关奖励：揭示字母 +1" : "通关成功！再通过 1 关可获得揭示字母");
    window.setTimeout(() => {
      if (gradeComplete) {
        openLearningReport("grade-complete");
      } else {
        elements.completion.hidden = false;
        state.completionAdvanceTimer = window.setTimeout(continueAfterCompletion, 2000);
      }
    }, 260);
  }

  function continueAfterCompletion() {
    clearCompletionAdvance();
    const pending = pendingLevelsInCurrentTerm();
    elements.completion.hidden = true;
    if (pending.length) {
      const currentTermLevels = levels.filter((level) => level.grade === state.level.grade);
      startNextLevel(currentTermLevels);
      return;
    }
    showLevelList();
  }

  function renderBoard() {
    if (!state.level) return;
    const active = activePlacement();
    const activeKeys = new Set(active?.cells.map((cell) => keyOf(cell.row, cell.col)) || []);
    const startNumbers = new Map();
    state.level.placements.forEach((placement) => {
      const key = keyOf(placement.row, placement.col);
      if (!startNumbers.has(key)) startNumbers.set(key, placement.number);
    });

    const displayGrid = displayGridMetrics();

    elements.crossword.innerHTML = "";
    elements.crossword.classList.toggle("is-transposed", displayGrid.transposed);
    elements.crossword.style.setProperty("--cols", displayGrid.cols);
    elements.crossword.style.setProperty("--rows", displayGrid.rows);
    elements.crossword.setAttribute("aria-rowcount", displayGrid.rows);
    elements.crossword.setAttribute("aria-colcount", displayGrid.cols);

    for (let displayRow = 0; displayRow < displayGrid.rows; displayRow += 1) {
      for (let displayCol = 0; displayCol < displayGrid.cols; displayCol += 1) {
        const row = displayGrid.transposed ? displayCol : displayRow;
        const col = displayGrid.transposed ? displayRow : displayCol;
        const key = keyOf(row, col);
        const cell = state.cells.get(key);
        if (!cell) {
          const block = document.createElement("span");
          block.className = "grid-block";
          block.setAttribute("aria-hidden", "true");
          elements.crossword.append(block);
          continue;
        }

        const button = document.createElement("button");
        const value = state.values.get(key) || "";
        const solvedHere = cell.placementIds.some((id) => state.solved.has(id));
        const wrongHere = cell.placementIds.some((id) => state.wrong.has(id));
        button.type = "button";
        button.className = "grid-cell";
        button.dataset.row = String(row);
        button.dataset.col = String(col);
        button.dataset.key = key;
        button.dataset.placementIds = cell.placementIds.join(",");
        button.setAttribute("role", "gridcell");
        button.setAttribute("aria-label", `第 ${displayRow + 1} 行，第 ${displayCol + 1} 列${value ? `，字母 ${value.toUpperCase()}` : "，空格"}`);
        if (activeKeys.has(key)) button.classList.add("is-word-active");
        if (state.activeKey === key) button.classList.add("is-cursor");
        if (state.sources.get(key) === "prefill") button.classList.add("is-prefill");
        if (state.sources.get(key) === "hint") button.classList.add("is-revealed");
        if (solvedHere) button.classList.add("is-solved");
        if (wrongHere && !solvedHere) button.classList.add("is-wrong");
        button.disabled = state.inputLocked || state.complete;
        button.addEventListener("click", () => {
          if (selectCell(row, col)) openFloatingKeyboard();
        });

        if (startNumbers.has(key)) {
          const number = document.createElement("span");
          number.className = "grid-cell__number";
          number.textContent = String(startNumbers.get(key));
          button.append(number);
        }
        const letter = document.createElement("span");
        letter.className = "grid-cell__letter";
        letter.textContent = value;
        button.append(letter);
        elements.crossword.append(button);
      }
    }
    window.requestAnimationFrame(() => {
      fitCrosswordToBoard();
      positionSolvedWordsPanel();
      keepActiveCellVisible();
    });
  }

  function fitCrosswordToBoard() {
    if (!state.level || !elements.boardWrap.clientWidth || !elements.boardWrap.clientHeight) return;
    const displayGrid = displayGridMetrics();
    const boardStyle = window.getComputedStyle(elements.boardWrap);
    const gridStyle = window.getComputedStyle(elements.crossword);
    const horizontalPadding = parseFloat(boardStyle.paddingLeft) + parseFloat(boardStyle.paddingRight);
    const verticalPadding = parseFloat(boardStyle.paddingTop) + parseFloat(boardStyle.paddingBottom);
    const columnGap = parseFloat(gridStyle.columnGap) || 4;
    const rowGap = parseFloat(gridStyle.rowGap) || columnGap;
    const safetyInset = 18;
    const availableWidth = elements.boardWrap.clientWidth - horizontalPadding - safetyInset;
    const availableHeight = elements.boardWrap.clientHeight - verticalPadding - safetyInset;
    const widthCellSize = (availableWidth - columnGap * (displayGrid.cols - 1)) / displayGrid.cols;
    const heightCellSize = (availableHeight - rowGap * (displayGrid.rows - 1)) / displayGrid.rows;
    let cellSize = Math.max(8, Math.min(55, widthCellSize, heightCellSize));
    cellSize = Math.floor(cellSize * 10) / 10;
    elements.crossword.style.setProperty("--cell-size", `${cellSize}px`);

    const renderedRect = elements.crossword.getBoundingClientRect();
    const overflowScale = Math.min(
      1,
      availableWidth / Math.max(1, renderedRect.width),
      availableHeight / Math.max(1, renderedRect.height),
    );
    if (overflowScale < 1) {
      const correctedSize = Math.max(8, Math.floor((cellSize * overflowScale - 0.5) * 10) / 10);
      elements.crossword.style.setProperty("--cell-size", `${correctedSize}px`);
    }
  }

  function renderControls() {
    const disabled = state.inputLocked || state.complete || !state.level;
    elements.learningReportOpen.disabled = disabled;
    elements.hintLetter.disabled = disabled || state.hints.letter <= 0;
    elements.hintLetterCount.textContent = `x${state.hints.letter}`;
    elements.hintLetter.setAttribute("aria-label", `揭示字母，剩余 ${state.hints.letter} 次`);
    elements.wordWheelLetters.querySelectorAll("button").forEach((button) => {
      button.disabled = disabled;
    });
    elements.wheelDelete.disabled = disabled;
    elements.wheelClear.disabled = disabled;
  }

  function render() {
    if (!state.level) return;
    renderScore();
    renderClue();
    renderSolvedWords();
    renderBoard();
    renderControls();
  }

  function renderLevelCards() {
    const completed = completionStore();
    elements.levelGrid.innerHTML = "";
    const groups = new Map();
    levels.forEach((level) => {
      const match = level.grade.match(/^grade(\d+)_/);
      const key = level.grade === "grade1_3" ? "grade1_3" : `grade${match?.[1] || level.grade}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label: key === "grade1_3" ? "1-3年级" : `${match?.[1]}年级`,
          levels: [],
        });
      }
      groups.get(key).levels.push(level);
    });

    elements.levelGrid.className = "level-grid level-grid--grades";
    groups.forEach((group) => {
      const button = document.createElement("button");
      const isComplete = group.levels.every((level) => Boolean(completed[level.id]));
      button.type = "button";
      button.className = `level-card level-card--grade${isComplete ? " is-complete" : ""}`;
      button.innerHTML = `<span class="level-card__grade">${group.label}</span>`;
      button.addEventListener("click", () => {
        unlockBackgroundMusic();
        if (group.key === "grade1_3") {
          startNextLevel(group.levels);
          return;
        }
        openTermModal(group);
      });
      elements.levelGrid.append(button);
    });
  }

  function closeTermModal() {
    elements.termModal.hidden = true;
    document.documentElement.classList.remove("is-term-modal-open");
    document.body.classList.remove("is-term-modal-open");
    state.selectedGrade = null;
  }

  function openTermModal(group) {
    const completed = completionStore();
    state.selectedGrade = group.key;
    elements.termModalTitle.textContent = `${group.label} · 选择册别`;
    elements.termOptions.innerHTML = "";
    const termGroups = new Map();
    group.levels.forEach((level) => {
      if (!termGroups.has(level.grade)) termGroups.set(level.grade, []);
      termGroups.get(level.grade).push(level);
    });
    [...termGroups.entries()].sort(([first], [second]) => first.localeCompare(second)).forEach(([grade, termLevels]) => {
      const button = document.createElement("button");
      const term = grade.endsWith("_1") ? "上册" : "下册";
      const isComplete = termLevels.every((level) => Boolean(completed[level.id]));
      button.type = "button";
      button.className = `term-option${isComplete ? " is-complete" : ""}`;
      button.innerHTML = `<strong>${term}</strong>`;
      button.addEventListener("click", () => {
        unlockBackgroundMusic();
        closeTermModal();
        startNextLevel(termLevels);
      });
      elements.termOptions.append(button);
    });
    document.documentElement.classList.add("is-term-modal-open");
    document.body.classList.add("is-term-modal-open");
    elements.termModal.hidden = false;
    window.requestAnimationFrame(() => elements.termOptions.querySelector("button")?.focus());
  }

  function showLevelList() {
    clearCompletionAdvance();
    abandonTrackedSession();
    closeTermModal();
    closeFloatingKeyboard();
    hideLearningReport();
    stopCountdown({ reset: true });
    document.body.classList.remove("is-playing");
    document.documentElement.classList.remove("is-playing");
    document.body.classList.add("is-level-selecting");
    elements.completion.hidden = true;
    elements.gameView.hidden = true;
    elements.levelView.hidden = false;
    elements.gameTopActions.hidden = true;
    elements.solvedWordsPanel.hidden = true;
    state.inputLocked = true;
    state.complete = false;
    state.selectedGrade = null;
    state.totalScore = 0;
    renderScore();
    renderLevelCards();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startLevel(levelId) {
    clearCompletionAdvance();
    unlockBackgroundMusic();
    closeTermModal();
    hideLearningReport();
    const template = levels.find((item) => item.id === levelId);
    if (!template) return;
    const level = createRandomizedLevel(template);
    state.level = level;
    state.cells = buildCellMap(level);
    state.values = new Map();
    state.sources = new Map();
    state.owners = new Map();
    state.overwriteBackups = new Map();
    state.solved = new Set();
    state.accepted = new Map();
    state.wrong = new Set();
    state.activeId = null;
    state.activeKey = null;
    state.inputLocked = false;
    state.complete = false;
    state.hints = hintInventoryStore();
    state.used = { letter: 0 };
    state.keyboardOpen = false;
    state.wheelOuterLetters = shuffled([...String(level.wheelLetters || "")]);
    document.body.classList.remove("is-keyboard-open");

    level.prefills.forEach(({ row, col }) => {
      const key = keyOf(row, col);
      const cell = state.cells.get(key);
      if (!cell) return;
      state.values.set(key, cell.letter);
      state.sources.set(key, "prefill");
    });

    elements.levelView.hidden = true;
    elements.gameView.hidden = false;
    elements.gameTopActions.hidden = false;
    elements.completion.hidden = true;
    elements.solvedWordsPanel.hidden = false;
    document.body.classList.remove("is-level-selecting");
    document.documentElement.classList.add("is-playing");
    document.body.classList.add("is-playing");
    const first = sortedPlacements()[0];
    setActivePlacement(first.id);
    buildWordWheel();
    openFloatingKeyboard();
    startTrackedSession();
    startCountdown();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function bindWordWheel() {
    elements.wordWheel.addEventListener("click", handleWheelClick);
    elements.wheelDelete.addEventListener("click", deleteLetter);
    elements.wheelClear.addEventListener("click", clearActiveWord);
  }

  function handleKeyboard(event) {
    if (state.reportOpen) {
      return;
    }
    if (event.key === "Escape" && !elements.termModal.hidden) {
      closeTermModal();
      return;
    }
  }

  function dismissTermModal(event) {
    if (event.target === elements.termModal) closeTermModal();
  }

  let layoutFrame = 0;
  let layoutSettleTimer = 0;

  function scheduleLayout() {
    if (layoutFrame) window.cancelAnimationFrame(layoutFrame);
    layoutFrame = window.requestAnimationFrame(() => {
      layoutFrame = 0;
      fitCrosswordToBoard();
      positionSolvedWordsPanel();
    });
  }

  function scheduleSettledLayout() {
    scheduleLayout();
    window.clearTimeout(layoutSettleTimer);
    layoutSettleTimer = window.setTimeout(scheduleLayout, 180);
  }

  function init() {
    if (!levels.length || !bank.length) {
      elements.levelGrid.innerHTML = "<p>未找到关卡数据，请先生成 level-data.js。</p>";
      return;
    }

    resetGameProgress();
    elements.backgroundMusic.volume = BACKGROUND_VOLUME;
    elements.wordAudio.addEventListener("ended", restoreBackgroundMusicVolume);
    elements.wordAudio.addEventListener("error", restoreBackgroundMusicVolume);
    playBackgroundMusic(true);
    bindWordWheel();
    showLevelList();

    elements.learningReportOpen.addEventListener("click", () => openLearningReport("manual"));
    elements.brandHome.addEventListener("click", (event) => {
      event.preventDefault();
      showLevelList();
    });
    elements.hintLetter.addEventListener("click", revealLetter);
    elements.termModalClose.addEventListener("click", closeTermModal);
    elements.termModal.addEventListener("click", dismissTermModal);
    elements.learningReportLevels.addEventListener("click", showLevelList);
    document.addEventListener("pointerdown", unlockBackgroundMusic);
    document.addEventListener("keydown", unlockBackgroundMusic);
    document.addEventListener("keydown", handleKeyboard);
    window.addEventListener("resize", scheduleLayout, { passive: true });
    window.addEventListener("orientationchange", scheduleSettledLayout, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", scheduleLayout, { passive: true });
    }
    window.addEventListener("pageshow", (event) => {
      if (!event.persisted) return;
      resetGameProgress();
      showLevelList();
    });
    if ("ResizeObserver" in window) {
      new ResizeObserver(scheduleLayout).observe(elements.boardWrap);
    }
  }

  init();
})();
