(function () {
  "use strict";

  var canvas = document.getElementById("gameCanvas");
  var ctx = canvas.getContext("2d");
  var startLayer = document.getElementById("startLayer");
  var startPrompt = document.getElementById("startPrompt");
  var WIDTH = 1600;
  var HEIGHT = 900;
  var ROUND_SECONDS = 120;
  var CELEBRATION_STEP = 2;
  var WRONG_SHAKE_DURATION = 0.48;
  var WRONG_SHAKE_DISTANCE = 14;
  var MAX_FRAME_DELTA = 1 / 30;
  var MAX_COLLISION_PUSH = 2.6;
  var PLAYER_COUNT = 2;
  var LETTER_PAIR_COUNT = 6;
  var MIN_WORD_PAIR_COUNT = 5;
  var MAX_WORD_PAIR_COUNT = 7;
  var LETTER_BUBBLE_RADIUS = 48;
  var LETTER_FONT_SIZE = 50;
  var ENGLISH_WORD_FONT_SIZE = 23;
  var LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  var MODE_OPTIONS = [
    { key: "letters", label: "\u5b57\u6bcd" },
    { key: "grade1_3", label: "1-3\u5e74\u7ea7" },
    { key: "grade4_up", label: "4\u5e74\u7ea7\u4e0a\u518c" },
    { key: "grade4_down", label: "4\u5e74\u7ea7\u4e0b\u518c" },
    { key: "grade5_up", label: "5\u5e74\u7ea7\u4e0a\u518c" },
    { key: "grade5_down", label: "5\u5e74\u7ea7\u4e0b\u518c" },
    { key: "grade6_up", label: "6\u5e74\u7ea7\u4e0a\u518c" },
    { key: "grade6_down", label: "6\u5e74\u7ea7\u4e0b\u518c" },
    { key: "grade7_up", label: "7\u5e74\u7ea7\u4e0a\u518c" },
    { key: "grade7_down", label: "7\u5e74\u7ea7\u4e0b\u518c" },
    { key: "grade8_up", label: "8\u5e74\u7ea7\u4e0a\u518c" },
    { key: "grade8_down", label: "8\u5e74\u7ea7\u4e0b\u518c" },
    { key: "grade9_up", label: "9\u5e74\u7ea7\u4e0a\u518c" },
    { key: "grade9_down", label: "9\u5e74\u7ea7\u4e0b\u518c" }
  ];
  var PRONUNCIATION_AUDIO_FOLDERS = {
    letters: "words",
    grade1_3: "grade1_3",
    grade4_up: "grade4_1",
    grade4_down: "grade4_2",
    grade5_up: "grade5_1",
    grade5_down: "grade5_2",
    grade6_up: "grade6_1",
    grade6_down: "grade6_2",
    grade7_up: "grade7_1",
    grade7_down: "grade7_2",
    grade8_up: "grade8_1",
    grade8_down: "grade8_2",
    grade9_up: "grade9_1",
    grade9_down: "grade9_2"
  };
  var GRADE_OPTIONS = [
    { label: "\u5b57\u6bcd", key: "letters", color: "mint" },
    { label: "1-3\u5e74\u7ea7", key: "grade1_3", color: "mint" },
    { label: "4\u5e74\u7ea7", grade: "4", color: "gold" },
    { label: "5\u5e74\u7ea7", grade: "5", color: "blue" },
    { label: "6\u5e74\u7ea7", grade: "6", color: "mint" },
    { label: "7\u5e74\u7ea7", grade: "7", color: "gold" },
    { label: "8\u5e74\u7ea7", grade: "8", color: "blue" },
    { label: "9\u5e74\u7ea7", grade: "9", color: "mint" }
  ];
  var BUBBLE_COLORS = ["#ff6f9f", "#53c8d7", "#ffd04e", "#80d26b", "#a985f4", "#ff9558"];
  var BUBBLE_IMAGE_SOURCES = [
    "assets/photo/qipao1.png",
    "assets/photo/qipao2.png",
    "assets/photo/qipao3.png",
    "assets/photo/qipao4.png",
    "assets/photo/qipao5.png"
  ];
  var AVATAR_IMAGE_SOURCES = [
    "assets/photo/avatar1.png",
    "assets/photo/avatar2.png",
    "assets/photo/avatar3.png",
    "assets/photo/avatar4.png",
    "assets/photo/avatar5.png"
  ];
  var AVATAR_TEAR_SETTINGS = [
    { left: { x: 33, y: 46 }, right: { x: 63, y: 46 } },
    { left: { x: 34, y: 59 }, right: { x: 61, y: 59 } },
    { left: { x: 32, y: 37 }, right: { x: 54, y: 37 } },
    { left: { x: 33, y: 40 }, right: { x: 63, y: 40 } },
    { left: { x: 37, y: 36 }, right: { x: 58, y: 34 } }
  ];
  var PLAY_BOUNDS = [
    null,
    {
      upper: { left: 70, right: 730, top: 178, bottom: 468 },
      lower: { left: 70, right: 730, top: 558, bottom: 848 }
    },
    {
      upper: { left: 870, right: 1530, top: 178, bottom: 468 },
      lower: { left: 870, right: 1530, top: 558, bottom: 848 }
    }
  ];
  var BUBBLE_SLOTS = [
    [0.12, 0.25], [0.50, 0.20], [0.88, 0.25],
    [0.22, 0.75], [0.62, 0.72], [0.90, 0.76], [0.44, 0.50]
  ];
  var LETTER_BUBBLE_SLOTS = [
    [0.12, 0.26], [0.50, 0.20], [0.88, 0.26],
    [0.22, 0.74], [0.62, 0.72], [0.90, 0.76]
  ];
  var background = new Image();
  var bubbleImages = [];
  var avatarImages = [];
  var backgroundMusic = null;
  var wrongSound = null;
  var pronunciationAudio = null;
  var reportAudio = null;
  var reportAudioQueue = [];
  var reportAudioIndex = 0;
  var rightSounds = [];
  var gameTracker = null;
  var animationId = 0;
  var lastFrameTime = 0;
  var timerId = 0;
  var resultTimers = [];
  var reportLocked = false;
  var selectedModeKey = "letters";
  var playerNames = [];
  var playerAvatarIndexes = [];
  var currentRoundPairs = [];
  var usedWordIdsByMode = {};

  var game = {
    phase: "ready",
    timeLeft: ROUND_SECONDS,
    elapsed: 0,
    players: [],
    playerResults: [],
    wordStats: {},
    wordStatSequence: 0
  };

  background.onload = draw;
  background.src = "background.svg";
  loadBubbleImages();
  loadAvatarImages();
  setupBackgroundMusic();
  setupRightSounds();
  setupWrongSound();
  setupPronunciationAudio();
  setupReportAudio();
  setupGameTracker();
  startBackgroundMusic();

  function setupGameTracker() {
    if (typeof window.GameTracker !== "function") {
      return;
    }
    try {
      gameTracker = new window.GameTracker({
        gameId: "word_pairing",
        gameVersion: "1.0.0",
        apiUrl: window.GAME_TRACKER_API_URL || "http://127.0.0.1:8000/api/v1/events",
        getUserId: function () {
          return window.platformUserId || null;
        }
      });
    } catch (error) {
      console.warn("[GameTracker] Initialization failed:", error);
      gameTracker = null;
    }
  }

  function startTrackingMatch() {
    if (!gameTracker) {
      return;
    }
    try {
      if (gameTracker.sessionId && !gameTracker.finished) {
        gameTracker.abandon();
      }
      gameTracker.start();
    } catch (error) {
      console.warn("[GameTracker] Start failed:", error);
    }
  }

  function finishTrackingMatch(score) {
    if (!gameTracker) {
      return;
    }
    try {
      gameTracker.finish(score);
    } catch (error) {
      console.warn("[GameTracker] Finish failed:", error);
    }
  }

  function abandonTrackingMatch() {
    if (!gameTracker || !gameTracker.sessionId || gameTracker.finished) {
      return;
    }
    gameTracker.abandon();
  }

  function setupBackgroundMusic() {
    backgroundMusic = new Audio("assets/yinxiao/background.mp3");
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.2;
    backgroundMusic.preload = "auto";
    document.addEventListener("mousedown", unlockBackgroundMusic, { once: true });
    document.addEventListener("touchstart", unlockBackgroundMusic, { once: true, passive: true });
  }

  function unlockBackgroundMusic() {
    startBackgroundMusic();
  }

  function startBackgroundMusic() {
    if (!backgroundMusic || !backgroundMusic.paused) {
      return;
    }
    var playPromise = backgroundMusic.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  function setupRightSounds() {
    var sources = [
      "assets/yinxiao/right1.mp3",
      "assets/yinxiao/right2.mp3",
      "assets/yinxiao/right3.mp3",
      "assets/yinxiao/right4.mp3",
      "assets/yinxiao/right5.mp3"
    ];
    for (var i = 0; i < sources.length; i += 1) {
      var audio = new Audio(sources[i]);
      audio.preload = "auto";
      audio.volume = 0.8;
      rightSounds.push(audio);
    }
  }

  function playRightCelebration(playerState) {
    if (playerState.correctStreak <= 0 || playerState.correctStreak % CELEBRATION_STEP !== 0 || rightSounds.length === 0) {
      return;
    }
    var soundIndex = playerState.rightSoundIndex % rightSounds.length;
    var sound = rightSounds[soundIndex];
    playerState.rightSoundIndex += 1;
    sound.currentTime = 0;
    var playPromise = sound.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  function setupWrongSound() {
    wrongSound = new Audio("assets/yinxiao/wrong.mp3");
    wrongSound.preload = "auto";
    wrongSound.volume = 0.8;
  }

  function playWrongSound() {
    if (!wrongSound) {
      return;
    }
    wrongSound.currentTime = 0;
    var playPromise = wrongSound.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  function setupPronunciationAudio() {
    pronunciationAudio = new Audio();
    pronunciationAudio.preload = "auto";
    pronunciationAudio.volume = 1;
  }

  function setupReportAudio() {
    reportAudio = new Audio();
    reportAudio.preload = "auto";
    reportAudio.volume = 1;
    reportAudio.onended = playNextMistakeAudio;
    reportAudio.onerror = playNextMistakeAudio;
  }

  function playItemPronunciation(item) {
    var folder = PRONUNCIATION_AUDIO_FOLDERS[selectedModeKey];
    var audioName;
    var playPromise;
    if (!pronunciationAudio || !folder || !item) {
      return;
    }
    audioName = item.kind === "letter" ? item.text : item.word;
    if (!audioName) {
      return;
    }
    pronunciationAudio.pause();
    pronunciationAudio.src = "assets/video/" + folder + "/" + encodeURIComponent(audioName) + ".mp3";
    pronunciationAudio.currentTime = 0;
    playPromise = pronunciationAudio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  function getReportPronunciationSource(stat) {
    var folder = PRONUNCIATION_AUDIO_FOLDERS[selectedModeKey];
    if (!folder || !stat || !stat.word) {
      return "";
    }
    return "assets/video/" + folder + "/" + encodeURIComponent(stat.word) + ".mp3";
  }

  function startMistakeReportAudio(stats) {
    var spokenStats = stats.slice(0, 3);
    var sources = ["assets/report/1_1.mp3"];
    var i;

    for (i = 0; i < spokenStats.length; i += 1) {
      var source = getReportPronunciationSource(spokenStats[i]);
      if (source) {
        sources.push(source);
      }
    }
    sources.push("assets/report/1_2.mp3");

    startReportAudioQueue(sources);
  }

  function startMasteredReportAudio() {
    startReportAudioQueue(["assets/report/2.mp3"]);
  }

  function startReportAudioQueue(sources) {
    stopReportAudio();
    if (pronunciationAudio) {
      pronunciationAudio.pause();
    }

    reportAudioQueue = sources;
    reportAudioIndex = 0;
    if (backgroundMusic) {
      backgroundMusic.volume = 0.08;
    }
    playNextMistakeAudio();
  }

  function playNextMistakeAudio() {
    var playPromise;
    if (!reportAudio || reportAudioIndex >= reportAudioQueue.length) {
      finishReportAudio();
      return;
    }
    reportAudio.src = reportAudioQueue[reportAudioIndex];
    reportAudioIndex += 1;
    reportAudio.currentTime = 0;
    playPromise = reportAudio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  function stopReportAudio() {
    if (reportAudio) {
      reportAudio.pause();
      reportAudio.removeAttribute("src");
      reportAudio.load();
    }
    finishReportAudio();
  }

  function finishReportAudio() {
    reportAudioQueue = [];
    reportAudioIndex = 0;
    if (backgroundMusic) {
      backgroundMusic.volume = 0.2;
    }
  }

  function loadBubbleImages() {
    for (var i = 0; i < BUBBLE_IMAGE_SOURCES.length; i += 1) {
      var img = new Image();
      img.onload = draw;
      img.src = BUBBLE_IMAGE_SOURCES[i];
      bubbleImages.push(img);
    }
  }

  function loadAvatarImages() {
    for (var i = 0; i < AVATAR_IMAGE_SOURCES.length; i += 1) {
      var img = new Image();
      img.onload = draw;
      img.src = AVATAR_IMAGE_SOURCES[i];
      avatarImages.push(img);
    }
  }

  function t(key) {
    var text = {
      startGame: "\u5f00\u59cb\u6e38\u620f",
      restart: "\u91cd\u65b0\u5f00\u59cb",
      player: "\u73a9\u5bb6",
      ready1: "\u73a9\u5bb61\u51c6\u5907",
      ready2: "\u73a9\u5bb62\u51c6\u5907",
      duelTitle: "\u53cc\u4eba\u5bf9\u6218",
      enterDuel: "\u8fdb\u5165\u53cc\u4eba\u5bf9\u6218",
      nextPlayer: "\u4e0b\u4e00\u4f4d",
      finishReady: "\u5b8c\u6210\u51c6\u5907",
      nameRequired: "\u8bf7\u8f93\u5165\u6635\u79f0",
      nameDuplicate: "\u73a9\u5bb6\u6635\u79f0\u4e0d\u80fd\u76f8\u540c",
      p1UsedTime: "\u73a9\u5bb61\u7528\u65f6 ",
      p2UsedTime: "\u73a9\u5bb62\u7528\u65f6 ",
      roundEnd: "\u672c\u8f6e\u7ed3\u675f",
      p1WinMore: "\u73a9\u5bb61\u83b7\u80dc\uff01\u914d\u5bf9\u66f4\u591a\u5b57\u6bcd",
      p2WinMore: "\u73a9\u5bb62\u83b7\u80dc\uff01\u914d\u5bf9\u66f4\u591a\u5b57\u6bcd",
      p1WinTime: "\u73a9\u5bb61\u83b7\u80dc\uff01\u7528\u65f6 ",
      p2WinTime: "\u73a9\u5bb62\u83b7\u80dc\uff01\u7528\u65f6 ",
      tie: "\u5e73\u5c40\uff01\u4e24\u4f4d\u73a9\u5bb6\u90fd\u5f88\u5feb",
      multiTie: "\u5e73\u5c40\uff01\u591a\u4f4d\u73a9\u5bb6\u8868\u73b0\u4e00\u6837\u597d",
      p1Short: "\u73a9\u5bb61\uff1a",
      p2Short: "\u73a9\u5bb62\uff1a",
      second: "\u79d2",
      time: "\u65f6\u95f4 ",
      score: "\u5f97\u5206 ",
      leftLabel: "\u5927\u5199\u5b57\u6bcd",
      rightLabel: "\u5c0f\u5199\u5b57\u6bcd",
      wordLeftLabel: "\u82f1\u6587\u5355\u8bcd",
      wordRightLabel: "\u4e2d\u6587\u610f\u601d"
    };
    return text[key] || key;
  }

  function shuffle(items) {
    var copy = items.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function isLetterMode() {
    return selectedModeKey === "letters";
  }

  function getModeOption(key) {
    for (var i = 0; i < MODE_OPTIONS.length; i += 1) {
      if (MODE_OPTIONS[i].key === key) {
        return MODE_OPTIONS[i];
      }
    }
    return MODE_OPTIONS[0];
  }

  function getModePool(modeKey) {
    if (!window.WORD_DATA || !window.WORD_DATA[modeKey]) {
      return [];
    }
    return window.WORD_DATA[modeKey].pairs || [];
  }

  function makeLetterPairs() {
    var pairs = [];
    var letters = chooseFreshItems(LETTERS, LETTER_PAIR_COUNT, function (letter) {
      return letter;
    }, "letters");
    for (var i = 0; i < letters.length; i += 1) {
      pairs.push({
        id: letters[i],
        left: letters[i],
        right: letters[i].toLowerCase(),
        kind: "letter"
      });
    }
    return pairs;
  }

  function makeWordId(pair) {
    return pair.word.toLowerCase();
  }

  function estimateWordPairCount(pool) {
    if (!pool.length) {
      return 0;
    }
    var sampleCount = Math.min(pool.length, 80);
    var wordTotal = 0;
    var meaningTotal = 0;
    for (var i = 0; i < sampleCount; i += 1) {
      wordTotal += pool[i].word.length;
      meaningTotal += pool[i].meaning.length;
    }
    var avgWord = wordTotal / sampleCount;
    var avgMeaning = meaningTotal / sampleCount;
    var count = Math.floor(9 - avgWord * 0.14 - avgMeaning * 0.16);
    return Math.max(MIN_WORD_PAIR_COUNT, Math.min(MAX_WORD_PAIR_COUNT, count));
  }

  function chooseWordPairs(modeKey) {
    var pool = getModePool(modeKey);
    var targetCount = Math.min(estimateWordPairCount(pool), pool.length);
    var i;
    if (!targetCount) {
      return [];
    }
    var chosen = chooseFreshItems(pool, targetCount, makeWordId, modeKey, false);
    targetCount = Math.min(targetCount, estimatePairCountFromActual(chosen));
    chosen = chosen.slice(0, targetCount);
    markFreshItemsUsed(chosen, makeWordId, modeKey);
    return chosen.map(function (pair) {
      return {
        id: makeWordId(pair),
        left: pair.word,
        right: pair.meaning,
        kind: "word"
      };
    });
  }

  function chooseFreshItems(pool, targetCount, getId, modeKey, shouldMarkUsed) {
    var used = usedWordIdsByMode[modeKey] || {};
    var chosen = [];
    var chosenIds = {};
    var available = [];
    var i;

    usedWordIdsByMode[modeKey] = used;
    for (i = 0; i < pool.length; i += 1) {
      if (!used[getId(pool[i])]) {
        available.push(pool[i]);
      }
    }

    addFreshItems(chosen, chosenIds, available, targetCount, getId);
    if (chosen.length < targetCount) {
      used = {};
      usedWordIdsByMode[modeKey] = used;
      addFreshItems(chosen, chosenIds, pool, targetCount, getId);
    }

    if (shouldMarkUsed !== false) {
      for (i = 0; i < chosen.length; i += 1) {
        used[getId(chosen[i])] = true;
      }
    }
    return chosen;
  }

  function markFreshItemsUsed(items, getId, modeKey) {
    var used = usedWordIdsByMode[modeKey] || {};
    usedWordIdsByMode[modeKey] = used;
    for (var i = 0; i < items.length; i += 1) {
      used[getId(items[i])] = true;
    }
  }

  function addFreshItems(chosen, chosenIds, pool, targetCount, getId) {
    var shuffled = shuffle(pool);
    for (var i = 0; i < shuffled.length && chosen.length < targetCount; i += 1) {
      var id = getId(shuffled[i]);
      if (!chosenIds[id]) {
        chosen.push(shuffled[i]);
        chosenIds[id] = true;
      }
    }
  }

  function estimatePairCountFromActual(pairs) {
    var maxRadius = 0;
    var minCount = Math.min(MIN_WORD_PAIR_COUNT, pairs.length);
    for (var i = 0; i < pairs.length; i += 1) {
      maxRadius = Math.max(maxRadius, getItemRadius(pairs[i].word, "word"));
      maxRadius = Math.max(maxRadius, getItemRadius(pairs[i].meaning, "word"));
    }
    if (maxRadius >= 78) {
      return minCount;
    }
    if (maxRadius >= 68) {
      return Math.min(pairs.length, Math.max(minCount, 6));
    }
    return pairs.length;
  }

  function chooseRoundPairs() {
    if (isLetterMode()) {
      return makeLetterPairs();
    }
    return chooseWordPairs(selectedModeKey);
  }

  function makePairItems(playerNumber, side, sourcePairs) {
    var items = [];
    var bounds = PLAY_BOUNDS[playerNumber][side];
    var usableW = bounds.right - bounds.left;
    var usableH = bounds.bottom - bounds.top;
    for (var i = 0; i < sourcePairs.length; i += 1) {
      var pair = sourcePairs[i];
      var slots = pair.kind === "letter" ? LETTER_BUBBLE_SLOTS : BUBBLE_SLOTS;
      var slot = slots[i % slots.length];
      var jitterX = (Math.random() - 0.5) * (pair.kind === "letter" ? 18 : 26);
      var jitterY = (Math.random() - 0.5) * (pair.kind === "letter" ? 14 : 22);
      var x = bounds.left + slot[0] * usableW + jitterX;
      var y = bounds.top + slot[1] * usableH + jitterY;
      var speed = 8 + Math.random() * 12;
      var angle = Math.random() * Math.PI * 2;
      var text = side === "upper" ? pair.left : pair.right;
      var radius = getItemRadius(text, pair.kind);
      items.push({
        id: pair.id,
        matchKey: getPairMatchKey(pair),
        word: pair.left,
        meaning: pair.right,
        text: text,
        kind: pair.kind,
        x: clamp(x, bounds.left + radius, bounds.right - radius),
        y: clamp(y, bounds.top + radius, bounds.bottom - radius),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: radius,
        bounds: bounds,
        color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
        image: bubbleImages[i % bubbleImages.length],
        matched: false,
        pulse: Math.random() * Math.PI * 2
      });
    }
    return items;
  }

  function getPairMatchKey(pair) {
    if (pair.kind === "word") {
      return String(pair.right || "").replace(/\s+/g, " ").trim();
    }
    return pair.id;
  }

  function getItemRadius(text, kind) {
    if (kind === "letter") {
      return LETTER_BUBBLE_RADIUS;
    }
    var len = text.length;
    if (/[\u4e00-\u9fff]/.test(text)) {
      return Math.max(48, Math.min(82, 43 + Math.ceil(len / 4) * 6));
    }
    ctx.font = "900 " + ENGLISH_WORD_FONT_SIZE + "px Arial";
    return Math.max(46, Math.min(82, Math.ceil(ctx.measureText(text).width / 1.9) + 10));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function makePlayerState(playerNumber) {
    var playerState = {
      player: playerNumber,
      score: 0,
      correctStreak: 0,
      rightSoundIndex: 0,
      elapsed: 0,
      selectedUpper: null,
      selectedLower: null,
      selectedUpperAt: null,
      selectedLowerAt: null,
      upperItems: makePairItems(playerNumber, "upper", shuffle(currentRoundPairs)),
      lowerItems: makePairItems(playerNumber, "lower", shuffle(currentRoundPairs)),
      finished: false,
      finishReason: ""
    };
    settleBubbles(playerState.upperItems);
    settleBubbles(playerState.lowerItems);
    return playerState;
  }

  function resetMatch() {
    stopReportAudio();
    currentRoundPairs = chooseRoundPairs();
    game.wordStats = {};
    game.wordStatSequence = 0;
    game.phase = "playing";
    game.timeLeft = ROUND_SECONDS;
    game.elapsed = 0;
    game.players = [makePlayerState(1), makePlayerState(2)];
    game.playerResults = [];
    reportLocked = false;
  }

  function showStart(promptText, buttonText, onClick) {
    clearResultTimers();
    startPrompt.innerText = promptText;
    startPrompt.className = "";
    startLayer.className = "";
    clearStartExtras();

    var btn = document.createElement("button");
    btn.className = "start_button";
    btn.innerText = buttonText || t("startGame");
    btn.style.cursor = "pointer";
    btn.addEventListener("click", function () {
      startBackgroundMusic();
      startLayer.className = "hidden";
      onClick();
    });
    startLayer.appendChild(btn);
  }

  function showGradeSelection() {
    clearResultTimers();
    clearStartExtras();
    startLayer.className = "grade_layer";
    startPrompt.className = "grade_title";
    startPrompt.innerText = "\u9009\u62e9\u5e74\u7ea7";
    startLayer.appendChild(makeGradeGrid());
  }

  function makeGradeGrid() {
    var grid = document.createElement("div");
    grid.className = "grade_grid";
    for (var i = 0; i < GRADE_OPTIONS.length; i += 1) {
      grid.appendChild(makeGradeButton(GRADE_OPTIONS[i]));
    }
    return grid;
  }

  function makeGradeButton(option) {
    var btn = document.createElement("button");
    btn.className = "grade_button " + option.color;
    btn.innerText = option.label;
    btn.addEventListener("click", function () {
      startBackgroundMusic();
      if (option.key) {
        selectedModeKey = option.key;
        showDuelModeSelection();
        return;
      }
      showBookSelection(option.grade);
    });
    return btn;
  }

  function showBookSelection(grade) {
    clearStartExtras();
    startLayer.className = "grade_layer";
    startPrompt.className = "grade_title";
    startPrompt.innerText = "\u9009\u62e9" + grade + "\u5e74\u7ea7";
    startLayer.appendChild(makeBookGrid(grade));
  }

  function makeBookGrid(grade) {
    var grid = document.createElement("div");
    var up = { label: "\u4e0a\u518c", key: "grade" + grade + "_up", color: "purple" };
    var down = { label: "\u4e0b\u518c", key: "grade" + grade + "_down", color: "purple" };
    grid.className = "book_grid";
    grid.appendChild(makeBookButton(up));
    grid.appendChild(makeBookButton(down));
    return grid;
  }

  function makeBookButton(option) {
    var btn = document.createElement("button");
    btn.className = "grade_button " + option.color;
    btn.innerText = option.label;
    btn.addEventListener("click", function () {
      startBackgroundMusic();
      selectedModeKey = option.key;
      showDuelModeSelection();
    });
    return btn;
  }

  function showDuelModeSelection() {
    clearResultTimers();
    clearStartExtras();
    startLayer.className = "duel_layer";
    startPrompt.className = "grade_title";
    startPrompt.innerText = t("duelTitle");

    var panel = document.createElement("div");
    var card = document.createElement("div");
    var playerOne = makeDuelPlayer(1);
    var versus = document.createElement("div");
    var playerTwo = makeDuelPlayer(2);
    var btn = document.createElement("button");

    panel.className = "duel_mode_panel";
    card.className = "duel_mode_card";
    card.setAttribute("role", "img");
    card.setAttribute("aria-label", "\u73a9\u5bb61\u5bf9\u6218\u73a9\u5bb62");
    versus.className = "duel_versus";
    versus.innerText = "VS";
    btn.className = "start_button";
    btn.innerText = t("enterDuel");
    btn.style.cursor = "pointer";

    btn.addEventListener("click", function () {
      startBackgroundMusic();
      setupPlayerNames();
      game.playerResults = [];
      showPlayerReady(1);
    });

    card.appendChild(playerOne);
    card.appendChild(versus);
    card.appendChild(playerTwo);
    panel.appendChild(card);
    panel.appendChild(btn);
    startLayer.appendChild(panel);
  }

  function makeDuelPlayer(playerNumber) {
    var player = document.createElement("div");
    var number = document.createElement("span");
    var label = document.createElement("span");
    player.className = "duel_player duel_player_" + playerNumber;
    number.className = "duel_player_number";
    number.innerText = String(playerNumber);
    label.className = "duel_player_label";
    label.innerText = "\u73a9\u5bb6 " + playerNumber;
    player.appendChild(number);
    player.appendChild(label);
    return player;
  }

  function showPlayerReady(playerNumber, prefixText) {
    clearResultTimers();
    clearStartExtras();
    startLayer.className = "";
    startPrompt.className = "";
    setPlayerReadyPrompt(playerNumber, prefixText);

    var panel = document.createElement("div");
    var input = document.createElement("input");
    var hint = document.createElement("div");
    var btn = document.createElement("button");

    panel.className = "player_name_panel";
    input.className = "player_name_input";
    input.type = "text";
    input.maxLength = 4;
    input.placeholder = t("nameRequired");
    input.value = playerNames[playerNumber - 1] || "";
    hint.className = "player_name_hint";
    btn.className = "start_button";
    btn.innerText = playerNumber < PLAYER_COUNT ? t("nextPlayer") : t("finishReady");
    btn.style.cursor = "pointer";

    input.addEventListener("input", function () {
      playerNames[playerNumber - 1] = sanitizePlayerName(input.value);
      input.classList.remove("invalid");
      hint.innerText = "";
      setPlayerReadyPrompt(playerNumber, prefixText);
    });
    btn.addEventListener("click", function () {
      var playerName = sanitizePlayerName(input.value);
      playerNames[playerNumber - 1] = playerName;
      if (!playerName) {
        input.classList.add("invalid");
        hint.innerText = t("nameRequired");
        setPlayerReadyPrompt(playerNumber, prefixText);
        input.focus();
        return;
      }
      if (isDuplicatePlayerName(playerName, playerNumber)) {
        input.classList.add("invalid");
        hint.innerText = t("nameDuplicate");
        setPlayerReadyPrompt(playerNumber, prefixText);
        input.focus();
        return;
      }
      startBackgroundMusic();
      if (playerNumber < PLAYER_COUNT) {
        showPlayerReady(playerNumber + 1, getPlayerLabel(playerNumber) + " \u5df2\u51c6\u5907");
        return;
      }
      startLayer.className = "hidden";
      startMatch();
    });

    panel.appendChild(input);
    panel.appendChild(hint);
    panel.appendChild(btn);
    startLayer.appendChild(panel);
    input.focus();
  }

  function setPlayerReadyPrompt(playerNumber, prefixText) {
    startPrompt.innerText = "";
    if (prefixText) {
      var prefix = document.createElement("div");
      prefix.className = "ready_prefix";
      prefix.innerText = prefixText;
      startPrompt.appendChild(prefix);
    }
    startPrompt.appendChild(makePlayerTitleNode(playerNumber, formatPlayerReady(playerNumber)));
  }

  function clearStartExtras() {
    while (startLayer.children.length > 1) {
      startLayer.removeChild(startLayer.lastChild);
    }
  }

  function clearResultTimers() {
    for (var i = 0; i < resultTimers.length; i += 1) {
      clearTimeout(resultTimers[i]);
    }
    resultTimers = [];
  }

  function queueResultStep(fn, delay) {
    resultTimers.push(setTimeout(fn, delay));
  }

  function startMatch() {
    resetMatch();
    startTrackingMatch();
    clearInterval(timerId);
    timerId = setInterval(function () {
      if (game.phase !== "playing") {
        return;
      }
      game.timeLeft -= 1;
      if (game.timeLeft <= 0) {
        game.timeLeft = 0;
        finishMatch("timeout");
      }
    }, 1000);
  }

  function reportScore(score) {
    if (reportLocked) {
      return;
    }
    reportLocked = true;
    finishTrackingMatch(score);
    if (typeof window.onReport === "function") {
      window.onReport(score);
    } else {
      console.log("onReport", score);
    }
  }

  function finishPlayer(playerState, reason) {
    if (game.phase !== "playing" || playerState.finished) {
      return;
    }
    playerState.finished = true;
    playerState.finishReason = reason;
    playerState.elapsed = Math.min(ROUND_SECONDS, game.elapsed);
    var result = {
      player: playerState.player,
      score: playerState.score,
      elapsed: playerState.elapsed,
      reason: reason
    };
    game.playerResults[playerState.player - 1] = result;
    if (areAllPlayersFinished()) {
      finishMatch("complete");
    }
  }

  function areAllPlayersFinished() {
    return game.players.length === PLAYER_COUNT && game.players.every(function (playerState) {
      return playerState.finished;
    });
  }

  function finishMatch(reason) {
    if (game.phase !== "playing") {
      return;
    }
    if (reason === "timeout") {
      for (var i = 0; i < game.players.length; i += 1) {
        if (!game.players[i].finished) {
          game.players[i].finished = true;
          game.players[i].finishReason = "timeout";
          game.players[i].elapsed = ROUND_SECONDS;
          game.playerResults[i] = {
            player: game.players[i].player,
            score: game.players[i].score,
            elapsed: ROUND_SECONDS,
            reason: "timeout"
          };
        }
      }
    }
    clearInterval(timerId);
    game.phase = "result";
    reportScore(Math.max(game.players[0].score, game.players[1].score));
    showFinalResultSequence();
  }

  function getWinnerInfo() {
    var results = [];
    var best = null;
    var tiedWinners = [];
    var i;
    var title = "";
    for (i = 0; i < PLAYER_COUNT; i += 1) {
      if (game.playerResults[i]) {
        results.push(game.playerResults[i]);
      }
    }
    if (!results.length) {
      return { title: t("roundEnd"), winnerPlayer: 0, winnerPlayers: [], results: results };
    }
    best = results[0];
    for (i = 1; i < results.length; i += 1) {
      if (isBetterResult(results[i], best)) {
        best = results[i];
      }
    }
    for (i = 0; i < results.length; i += 1) {
      if (results[i].score === best.score && Math.abs(results[i].elapsed - best.elapsed) < 0.05) {
        tiedWinners.push(results[i]);
      }
    }
    if (tiedWinners.length > 1) {
      title = t("tie");
      return {
        title: title,
        winnerPlayer: 0,
        winnerPlayers: tiedWinners.map(function (result) {
          return result.player;
        }),
        results: results
      };
    }
    if (best.score >= currentRoundPairs.length) {
      title = getPlayerLabel(best.player) + getPlayerLabelGap(best.player) + "\u83b7\u80dc\uff01\u7528\u65f6 " + formatTime(best.elapsed);
    } else {
      title = getPlayerLabel(best.player) + getPlayerLabelGap(best.player) + "\u83b7\u80dc\uff01\u914d\u5bf9\u6700\u591a";
    }
    return { title: title, winnerPlayer: best.player, winnerPlayers: [best.player], results: results };
  }

  function isBetterResult(a, b) {
    if (a.score !== b.score) {
      return a.score > b.score;
    }
    return a.elapsed < b.elapsed;
  }

  function showFinalResultSequence() {
    var info = getWinnerInfo();
    var colors = ["#ff6f9f", "#53c8d7", "#ffd04e", "#80d26b", "#a985f4", "#ff9558"];
    clearResultTimers();
    clearStartExtras();
    startLayer.className = "result_layer";
    setResultPrompt("\u6bd4\u8d5b\u7ed3\u675f", "result_title");

    queueResultStep(function () {
      clearStartExtras();
      setResultPrompt("\u53cc\u65b9\u6210\u7ee9", "result_title");
      startLayer.appendChild(makeResultBoard(info));
    }, 900);

    queueResultStep(function () {
      clearStartExtras();
      startLayer.className = "result_layer final_result_layer";
      setResultPrompt(info.title, "result_title celebrate_title");
      var celebrationStage = makeCelebrationStage(info);
      if (celebrationStage) {
        startLayer.appendChild(celebrationStage);
      }
      startLayer.appendChild(makeLeaderboard(info));
      var reportInfo = getReportInfo();
      var mistakeBoard = makeMistakeBoard(reportInfo);
      if (mistakeBoard) {
        startLayer.appendChild(mistakeBoard);
      }
      startLayer.appendChild(makeHomeButton());
      addResultConfetti(colors);
      if (reportInfo.hasMistakes) {
        startMistakeReportAudio(reportInfo.stats);
      } else if (reportInfo.stats.length) {
        startMasteredReportAudio();
      }
    }, 2400);
  }

  function makeHomeButton() {
    var btn = document.createElement("button");
    btn.className = "home_button";
    btn.innerText = "\u8fd4\u56de\u9996\u9875";
    btn.addEventListener("click", function () {
      stopReportAudio();
      startBackgroundMusic();
      clearResultTimers();
      game.phase = "ready";
      game.playerResults = [];
      playerNames = [];
      currentRoundPairs = [];
      game.players = [];
      showGradeSelection();
    });
    return btn;
  }

  function makeRestartButton() {
    var btn = document.createElement("button");
    btn.className = "start_button";
    btn.innerText = t("restart");
    btn.style.cursor = "pointer";
    btn.addEventListener("click", function () {
      startBackgroundMusic();
      clearResultTimers();
      game.playerResults = [];
      setupPlayerAvatars();
      startMatch();
      startLayer.className = "hidden";
    });
    return btn;
  }

  function setResultPrompt(text, className) {
    startPrompt.className = "";
    startPrompt.innerText = text;
    startPrompt.offsetWidth;
    startPrompt.className = className;
  }

  function makeResultBoard(info) {
    var board = document.createElement("div");
    var sortedResults = info.results.slice().sort(compareResultTime);
    var i;
    board.className = "result_board";
    for (i = 0; i < sortedResults.length; i += 1) {
      var result = sortedResults[i];
      var badge = document.createElement("div");
      var text = document.createElement("span");
      badge.className = "result_badge" + (isWinnerPlayer(info, result.player) ? " win" : "");
      badge.appendChild(makeAvatarNode(result.player, "result_avatar"));
      text.innerText = formatPlayerShort(result.player) + formatResultSummary(result);
      badge.appendChild(text);
      board.appendChild(badge);
    }
    return board;
  }

  function makeLeaderboard(info) {
    var board = document.createElement("div");
    var heading = document.createElement("div");
    var list = document.createElement("div");
    var sortedResults = info.results.slice().sort(compareResultTime);
    var i;

    board.className = "leaderboard";
    heading.className = "leaderboard_title";
    heading.innerText = "\u6392\u884c\u699c";
    list.className = "leaderboard_list";
    board.appendChild(heading);
    board.appendChild(list);

    for (i = 0; i < sortedResults.length; i += 1) {
      var result = sortedResults[i];
      var row = document.createElement("div");
      var rank = document.createElement("span");
      var details = document.createElement("span");
      var name = document.createElement("span");
      var time = document.createElement("span");

      row.className = "leaderboard_row" + (isWinnerPlayer(info, result.player) ? " win" : "");
      rank.className = "leaderboard_rank";
      rank.innerText = String(i + 1);
      details.className = "leaderboard_details";
      name.className = "leaderboard_name";
      name.innerText = getPlayerLabel(result.player);
      time.className = "leaderboard_time";
      time.innerText = formatResultSummary(result);

      details.appendChild(name);
      details.appendChild(time);
      row.appendChild(rank);
      row.appendChild(makeAvatarNode(result.player, "leaderboard_avatar"));
      row.appendChild(details);
      list.appendChild(row);
    }
    return board;
  }

  function makeMistakeBoard(reportInfo) {
    var board = document.createElement("div");
    var heading = document.createElement("div");
    var list = document.createElement("div");
    var stats = reportInfo.stats;
    var i;

    board.className = "mistake_board";
    heading.className = "mistake_board_title";
    list.className = "mistake_list";
    board.appendChild(heading);
    board.appendChild(list);

    if (reportInfo.hasMistakes) {
      heading.innerText = isLetterMode() ? "\u672c\u573a\u6613\u9519\u5b57\u6bcd" : "\u672c\u573a\u6613\u9519\u5355\u8bcd";
    } else {
      heading.innerText = isLetterMode() ? "\u7528\u65f6\u6700\u957f\u5b57\u6bcd" : "\u7528\u65f6\u6700\u957f\u5355\u8bcd";
    }

    if (!stats.length) {
      var empty = document.createElement("div");
      empty.className = "mistake_empty";
      empty.innerText = "\u6682\u65e0\u9009\u62e9\u8bb0\u5f55";
      list.appendChild(empty);
      return board;
    }

    for (i = 0; i < Math.min(5, stats.length); i += 1) {
      var stat = stats[i];
      var row = document.createElement("div");
      var text = document.createElement("div");
      var word = document.createElement("span");
      var meaning = document.createElement("span");

      row.className = "mistake_row";
      text.className = "mistake_text";
      word.className = "mistake_word";
      word.innerText = stat.word;
      meaning.className = "mistake_meaning";
      meaning.innerText = stat.meaning;

      text.appendChild(word);
      text.appendChild(meaning);
      row.appendChild(text);
      list.appendChild(row);
    }
    return board;
  }

  function getReportInfo() {
    var mistakeStats = [];
    var allStats = [];
    var key;

    for (key in game.wordStats) {
      if (Object.prototype.hasOwnProperty.call(game.wordStats, key)) {
        allStats.push(game.wordStats[key]);
        if (game.wordStats[key].errorCount > 0) {
          mistakeStats.push(game.wordStats[key]);
        }
      }
    }

    if (mistakeStats.length) {
      mistakeStats.sort(compareWordStats);
      return { hasMistakes: true, stats: mistakeStats };
    }
    allStats.sort(compareSelectionTime);
    return { hasMistakes: false, stats: allStats };
  }

  function compareWordStats(a, b) {
    if (a.errorCount !== b.errorCount) {
      return b.errorCount - a.errorCount;
    }
    var averageDifference = getAverageSelectionTime(b) - getAverageSelectionTime(a);
    if (Math.abs(averageDifference) > 0.001) {
      return averageDifference;
    }
    return a.order - b.order;
  }

  function compareSelectionTime(a, b) {
    var averageDifference = getAverageSelectionTime(b) - getAverageSelectionTime(a);
    if (Math.abs(averageDifference) > 0.001) {
      return averageDifference;
    }
    return a.order - b.order;
  }

  function getAverageSelectionTime(stat) {
    return stat.selectionTime / Math.max(1, stat.selectionCount || 0);
  }

  function makeCelebrationStage(info) {
    var winners = info.winnerPlayers || (info.winnerPlayer ? [info.winnerPlayer] : []);
    if (!winners.length) {
      return null;
    }
    var stage = document.createElement("div");
    var winnerSide = document.createElement("div");
    var loserSide = document.createElement("div");
    var losers = info.results.filter(function (result) {
      return !isWinnerPlayer(info, result.player);
    });
    var i;

    stage.className = "celebration_panel";
    winnerSide.className = "celebration_winners_row avatar_count_" + winners.length;
    loserSide.className = "celebration_losers_row avatar_count_" + losers.length;
    for (i = 0; i < winners.length; i += 1) {
      winnerSide.appendChild(makeMoodAvatarNode(winners[i], "happy"));
    }

    for (i = 0; i < losers.length; i += 1) {
      loserSide.appendChild(makeMoodAvatarNode(losers[i].player, "sad"));
    }

    stage.appendChild(winnerSide);
    stage.appendChild(makeRestartButton());
    if (losers.length) {
      stage.appendChild(loserSide);
    }
    return stage;
  }

  function isWinnerPlayer(info, playerNumber) {
    var winners = info.winnerPlayers || (info.winnerPlayer ? [info.winnerPlayer] : []);
    for (var i = 0; i < winners.length; i += 1) {
      if (winners[i] === playerNumber) {
        return true;
      }
    }
    return false;
  }

  function makeMoodAvatarNode(playerNumber, mood) {
    var wrap = document.createElement("div");
    var img = document.createElement("img");
    var playerName;
    wrap.className = "celebration_avatar_wrap";
    img.className = "celebration_avatar " + (mood === "happy" ? "celebration_avatar_happy" : "celebration_avatar_sad");
    img.src = getPlayerMoodAvatarSource(playerNumber, mood);
    img.alt = "";
    wrap.appendChild(img);
    if (mood === "sad") {
      wrap.appendChild(makeTearNode("left", getPlayerAvatarIndex(playerNumber)));
      wrap.appendChild(makeTearNode("right", getPlayerAvatarIndex(playerNumber)));
      playerName = document.createElement("span");
      playerName.className = "celebration_player_name";
      playerName.innerText = playerNames[playerNumber - 1] || getPlayerLabel(playerNumber);
      playerName.title = playerName.innerText;
      wrap.appendChild(playerName);
    }
    return wrap;
  }

  function makeTearNode(side, avatarIndex) {
    var tear = document.createElement("span");
    var setting = getAvatarTearSetting(avatarIndex, side);
    tear.className = "tear " + side;
    tear.style.left = setting.x + "%";
    tear.style.top = setting.y + "%";
    return tear;
  }

  function getAvatarTearSetting(avatarIndex, side) {
    var settings = AVATAR_TEAR_SETTINGS[avatarIndex] || AVATAR_TEAR_SETTINGS[0];
    return settings[side] || settings.left;
  }

  function compareResultTime(a, b) {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    if (Math.abs(a.elapsed - b.elapsed) > 0.05) {
      return a.elapsed - b.elapsed;
    }
    return a.player - b.player;
  }

  function addResultConfetti(colors) {
    for (var i = 0; i < 34; i += 1) {
      var piece = document.createElement("i");
      piece.className = "result_confetti";
      piece.style.left = 8 + Math.random() * 84 + "%";
      piece.style.top = -8 - Math.random() * 18 + "%";
      piece.style.backgroundColor = colors[i % colors.length];
      piece.style.animationDelay = Math.random() * 0.9 + "s";
      piece.style.transform = "rotate(" + Math.floor(Math.random() * 180) + "deg)";
      startLayer.appendChild(piece);
    }
  }

  function formatTime(seconds) {
    return seconds.toFixed(1) + t("second");
  }

  function formatResultSummary(result) {
    return result.score + "\u5206 \u00b7 " + formatTime(result.elapsed);
  }

  function formatPlayerReady(playerNumber) {
    return getPlayerLabel(playerNumber) + getPlayerLabelGap(playerNumber) + "\u51c6\u5907";
  }

  function formatPlayerShort(playerNumber) {
    return getPlayerLabel(playerNumber) + "\uff1a";
  }

  function getPlayerLabel(playerNumber) {
    var name = playerNames[playerNumber - 1];
    if (name) {
      return "\u73a9\u5bb6 " + name;
    }
    return "\u73a9\u5bb6" + playerNumber;
  }

  function getPlayerLabelGap(playerNumber) {
    return playerNames[playerNumber - 1] ? " " : "";
  }

  function sanitizePlayerName(value) {
    return value.replace(/\s+/g, "").slice(0, 4);
  }

  function isDuplicatePlayerName(name, playerNumber) {
    for (var i = 0; i < playerNames.length; i += 1) {
      if (i !== playerNumber - 1 && playerNames[i] === name) {
        return true;
      }
    }
    return false;
  }

  function setupPlayerNames() {
    var nextNames = [];
    for (var i = 0; i < PLAYER_COUNT; i += 1) {
      nextNames[i] = playerNames[i] || "";
    }
    playerNames = nextNames;
    setupPlayerAvatars();
  }

  function setupPlayerAvatars() {
    var avatarIndexes = [];
    var shuffled = shuffle(AVATAR_IMAGE_SOURCES.map(function (_source, index) {
      return index;
    }));
    for (var i = 0; i < PLAYER_COUNT; i += 1) {
      avatarIndexes[i] = shuffled[i % shuffled.length];
    }
    playerAvatarIndexes = avatarIndexes;
  }

  function getPlayerAvatarIndex(playerNumber) {
    var avatarIndex = playerAvatarIndexes[playerNumber - 1];
    if (typeof avatarIndex !== "number") {
      return (playerNumber - 1) % AVATAR_IMAGE_SOURCES.length;
    }
    return avatarIndex;
  }

  function getPlayerAvatarSource(playerNumber) {
    return AVATAR_IMAGE_SOURCES[getPlayerAvatarIndex(playerNumber)];
  }

  function getPlayerMoodAvatarSource(playerNumber, mood) {
    return "assets/photo/avatar" + (getPlayerAvatarIndex(playerNumber) + 1) + "_" + mood + ".png";
  }

  function getPlayerAvatarImage(playerNumber) {
    return avatarImages[getPlayerAvatarIndex(playerNumber)];
  }

  function makeAvatarNode(playerNumber, className) {
    var avatar = document.createElement("img");
    avatar.className = className;
    avatar.src = getPlayerAvatarSource(playerNumber);
    avatar.alt = "";
    return avatar;
  }

  function makePlayerTitleNode(playerNumber, text) {
    var row = document.createElement("span");
    var label = document.createElement("span");
    row.className = "player_ready_title";
    row.appendChild(makeAvatarNode(playerNumber, "player_ready_avatar"));
    label.innerText = text;
    row.appendChild(label);
    return row;
  }

  function getCanvasPoint(source) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (source.clientX - rect.left) * (WIDTH / rect.width),
      y: (source.clientY - rect.top) * (HEIGHT / rect.height)
    };
  }

  function findHitItem(point, items) {
    for (var i = 0; i < items.length; i += 1) {
      var item = items[i];
      if (item.matched) {
        continue;
      }
      var dx = point.x - item.x;
      var dy = point.y - item.y;
      if (dx * dx + dy * dy <= item.radius * item.radius) {
        return item;
      }
    }
    return null;
  }

  function handleInput(evt) {
    if (evt.cancelable) {
      evt.preventDefault();
    }
    if (game.phase !== "playing") {
      return;
    }
    var sources = evt.changedTouches || [evt];
    for (var i = 0; i < sources.length; i += 1) {
      handlePlayerInput(getCanvasPoint(sources[i]));
    }
  }

  function handlePlayerInput(point) {
    var playerNumber = point.x < WIDTH / 2 ? 1 : 2;
    var playerState = game.players[playerNumber - 1];
    if (!playerState || playerState.finished) {
      return;
    }
    var upper = findHitItem(point, playerState.upperItems);
    var lower = findHitItem(point, playerState.lowerItems);
    if (upper) {
      playItemPronunciation(upper);
      if (playerState.selectedUpper !== upper) {
        playerState.selectedUpper = upper;
        playerState.selectedUpperAt = game.elapsed;
      }
    }
    if (lower) {
      if (playerState.selectedLower !== lower) {
        playerState.selectedLower = lower;
        playerState.selectedLowerAt = game.elapsed;
      }
    }
    if (playerState.selectedUpper && playerState.selectedLower) {
      checkSelection(playerState);
    }
  }

  function checkSelection(playerState) {
    var upper = playerState.selectedUpper;
    var lower = playerState.selectedLower;
    var firstSelectedAt = Math.min(playerState.selectedUpperAt, playerState.selectedLowerAt);
    var selectionDuration = Math.max(0, game.elapsed - firstSelectedAt);
    var isCorrect = upper.matchKey === lower.matchKey;

    recordItemSelection([upper, lower], selectionDuration, !isCorrect);
    if (isCorrect) {
      playerState.selectedUpper.matched = true;
      playerState.selectedLower.matched = true;
      playerState.score += 1;
      playerState.correctStreak += 1;
      playRightCelebration(playerState);
      clearCurrentSelection(playerState);
      if (playerState.score >= currentRoundPairs.length) {
        finishPlayer(playerState, "complete");
      }
      return;
    }
    playerState.correctStreak = 0;
    playerState.rightSoundIndex = 0;
    playWrongSound();
    shakeWrongPair(upper, lower);
    clearCurrentSelection(playerState);
  }

  function shakeWrongPair(upper, lower) {
    upper.shakeStartedAt = game.elapsed;
    upper.shakePhase = 0;
    lower.shakeStartedAt = game.elapsed;
    lower.shakePhase = Math.PI;
  }

  function recordItemSelection(items, selectionDuration, isWrong) {
    var seenIds = {};
    for (var i = 0; i < items.length; i += 1) {
      var item = items[i];
      if (seenIds[item.id]) {
        continue;
      }
      seenIds[item.id] = true;
      if (!game.wordStats[item.id]) {
        game.wordStats[item.id] = {
          word: item.word,
          meaning: item.meaning,
          errorCount: 0,
          selectionTime: 0,
          selectionCount: 0,
          order: game.wordStatSequence
        };
        game.wordStatSequence += 1;
      }
      game.wordStats[item.id].selectionTime += selectionDuration;
      game.wordStats[item.id].selectionCount += 1;
      if (isWrong) {
        game.wordStats[item.id].errorCount += 1;
      }
    }
  }

  function clearCurrentSelection(playerState) {
    playerState.selectedUpper = null;
    playerState.selectedLower = null;
    playerState.selectedUpperAt = null;
    playerState.selectedLowerAt = null;
  }

  function drawRoundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawBackground() {
    if (background.complete && background.naturalWidth > 0) {
      ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
      return;
    }
    var gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, "#fff7fb");
    gradient.addColorStop(0.5, "#dff6ff");
    gradient.addColorStop(1, "#fff3d8");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  function drawHeader() {
    if (game.players.length !== PLAYER_COUNT) {
      return;
    }
    drawPlayerHeader(game.players[0], 70, "rgba(255, 111, 159, 0.68)");
    drawPlayerHeader(game.players[1], 910, "rgba(83, 200, 215, 0.72)");

    drawRoundRect(710, 26, 180, 78, 34);
    ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(111, 49, 89, 0.28)";
    ctx.stroke();
    ctx.fillStyle = game.timeLeft <= 15 ? "#d93667" : "#68345f";
    ctx.font = "900 34px Microsoft YaHei, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(game.timeLeft + "s", 800, 65);
  }

  function drawPlayerHeader(playerState, x, borderColor) {
    var labelText = getPlayerLabel(playerState.player);
    var scoreText = t("score") + playerState.score;
    drawRoundRect(x, 26, 620, 78, 32);
    ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
    drawCanvasAvatar(playerState.player, x + 52, 65, 48, 48);
    ctx.fillStyle = "#68345f";
    ctx.font = "800 28px Microsoft YaHei, Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(labelText, x + 92, 65, 310);
    ctx.textAlign = "right";
    ctx.fillStyle = playerState.finished ? "#3c9760" : "#68345f";
    ctx.fillText(playerState.finished ? "\u5b8c\u6210 " + playerState.score + "\u5206" : scoreText, x + 584, 65);
  }

  function drawCanvasAvatar(playerNumber, centerX, centerY, maxWidth, maxHeight) {
    var avatar = getPlayerAvatarImage(playerNumber);
    var scale;
    var width;
    var height;
    if (!avatar || !avatar.complete || avatar.naturalWidth <= 0) {
      return;
    }
    scale = Math.min(maxWidth / avatar.naturalWidth, maxHeight / avatar.naturalHeight);
    width = avatar.naturalWidth * scale;
    height = avatar.naturalHeight * scale;
    ctx.drawImage(avatar, centerX - width / 2, centerY - height / 2, width, height);
  }

  function drawLabels() {
    if (game.players.length !== PLAYER_COUNT) {
      return;
    }
    var labels = getAreaLabels();
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.font = "900 25px Microsoft YaHei, Arial";
    ctx.fillStyle = "#7b416e";
    ctx.fillText(labels.left, 400, 166);
    ctx.fillText(labels.right, 400, 546);
    ctx.fillText(labels.left, 1200, 166);
    ctx.fillText(labels.right, 1200, 546);

    ctx.strokeStyle = "rgba(123, 65, 110, 0.28)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(800, 122);
    ctx.lineTo(800, 864);
    ctx.moveTo(62, 512);
    ctx.lineTo(738, 512);
    ctx.moveTo(862, 512);
    ctx.lineTo(1538, 512);
    ctx.stroke();
  }

  function getAreaLabels() {
    if (isLetterMode()) {
      return { left: t("leftLabel"), right: t("rightLabel") };
    }
    return { left: t("wordLeftLabel"), right: t("wordRightLabel") };
  }

  function drawBubble(item, selected) {
    if (item.matched) {
      return;
    }
    var x = item.x;
    var y = item.y;
    var radius = item.radius;
    var size = radius * 2;
    var shakeElapsed = game.elapsed - item.shakeStartedAt;
    if (typeof item.shakeStartedAt === "number" && shakeElapsed >= 0 && shakeElapsed < WRONG_SHAKE_DURATION) {
      var shakeStrength = 1 - shakeElapsed / WRONG_SHAKE_DURATION;
      x += Math.sin(shakeElapsed * 72 + item.shakePhase) * WRONG_SHAKE_DISTANCE * shakeStrength;
      y += Math.sin(shakeElapsed * 108 + item.shakePhase) * 3 * shakeStrength;
    }
    ctx.save();

    ctx.fillStyle = selected ? "rgba(255, 219, 83, 0.5)" : "rgba(70, 80, 120, 0.12)";
    ctx.beginPath();
    ctx.arc(x, y, radius + (selected ? 11 : 5), 0, Math.PI * 2);
    ctx.fill();

    if (item.image && item.image.complete && item.image.naturalWidth > 0) {
      ctx.drawImage(item.image, x - size / 2, y - size / 2, size, size);
    } else {
      var gradient = ctx.createRadialGradient(x - 8, y - 10, 3, x, y, radius);
      gradient.addColorStop(0, item.color);
      gradient.addColorStop(1, shadeColor(item.color, -18));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.lineWidth = selected ? 6 : 4;
    ctx.strokeStyle = selected ? "#ffe15a" : "rgba(94, 58, 110, 0.3)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    drawBubbleText(item, x, y);
    ctx.restore();
  }

  function drawBubbleText(item, x, y) {
    var maxWidth = item.radius * 1.58;
    var hasChinese = /[\u4e00-\u9fff]/.test(item.text);
    var fontSize = item.kind === "letter" ? LETTER_FONT_SIZE : hasChinese ? 22 : ENGLISH_WORD_FONT_SIZE;
    var lines;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(255, 255, 255, 0.55)";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 2;

    if (!hasChinese) {
      ctx.font = "900 " + fontSize + "px Arial";
      if (item.kind === "letter") {
        drawTextLine(item.text, x, y + 2, fontSize);
        return;
      }
      drawTextLine(item.text, x, y + 2, fontSize);
      return;
    }

    ctx.font = "900 " + fontSize + "px Microsoft YaHei, Arial";
    lines = wrapText(item.text, maxWidth);
    while (fontSize > 16 && !textFitsInBubble(lines, fontSize, item.radius)) {
      fontSize -= 2;
      ctx.font = "900 " + fontSize + "px Microsoft YaHei, Arial";
      lines = wrapText(item.text, maxWidth);
    }
    drawTextLines(lines, x, y, fontSize);
  }

  function drawTextLine(text, x, y, fontSize) {
    ctx.font = "900 " + fontSize + "px Arial";
    ctx.lineWidth = Math.max(5, Math.floor(fontSize / 6));
    ctx.strokeStyle = "rgba(255, 250, 225, 0.92)";
    ctx.strokeText(text, x, y);
    ctx.fillStyle = "#5f2556";
    ctx.fillText(text, x, y);
  }

  function drawTextLines(lines, x, y, fontSize, fontFamily) {
    var lineHeight = fontSize + 5;
    var startY = y - ((lines.length - 1) * lineHeight) / 2;
    ctx.font = "900 " + fontSize + "px " + (fontFamily || "Microsoft YaHei, Arial");
    ctx.lineWidth = Math.max(4, Math.floor(fontSize / 6));
    ctx.strokeStyle = "rgba(255, 250, 225, 0.92)";
    ctx.fillStyle = "#5f2556";
    for (var i = 0; i < lines.length; i += 1) {
      ctx.strokeText(lines[i], x, startY + i * lineHeight);
      ctx.fillText(lines[i], x, startY + i * lineHeight);
    }
  }

  function textFitsInBubble(lines, fontSize, radius) {
    var lineHeight = fontSize + 4;
    return lines.length * lineHeight <= radius * 1.48;
  }

  function wrapText(text, maxWidth) {
    var lines = [];
    var current = "";
    for (var i = 0; i < text.length; i += 1) {
      var next = current + text.charAt(i);
      if (current && ctx.measureText(next).width > maxWidth) {
        lines.push(current);
        current = text.charAt(i);
      } else {
        current = next;
      }
    }
    if (current) {
      lines.push(current);
    }
    return lines;
  }

  function shadeColor(hex, amount) {
    var raw = hex.replace("#", "");
    var num = parseInt(raw, 16);
    var r = clamp((num >> 16) + amount, 0, 255);
    var g = clamp(((num >> 8) & 255) + amount, 0, 255);
    var b = clamp((num & 255) + amount, 0, 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function updateMovingBubble(item, delta) {
    if (item.matched) {
      return;
    }
    var minX = item.bounds.left + item.radius;
    var maxX = item.bounds.right - item.radius;
    var minY = item.bounds.top + item.radius;
    var maxY = item.bounds.bottom - item.radius;
    item.pulse += delta * 2.5;
    item.x += item.vx * delta;
    item.y += item.vy * delta;

    if (item.x < minX || item.x > maxX) {
      item.x = clamp(item.x, minX, maxX);
      item.vx *= -1;
    }
    if (item.y < minY || item.y > maxY) {
      item.y = clamp(item.y, minY, maxY);
      item.vy *= -1;
    }
  }

  function resolveBubbleCollisions(items, maxPush) {
    for (var pass = 0; pass < 3; pass += 1) {
      for (var i = 0; i < items.length; i += 1) {
        var a = items[i];
        if (a.matched) {
          continue;
        }
        for (var j = i + 1; j < items.length; j += 1) {
          var b = items[j];
          if (b.matched) {
            continue;
          }
          var dx = b.x - a.x;
          var dy = b.y - a.y;
          var minDistance = a.radius + b.radius + 10;
          var distSq = dx * dx + dy * dy;
          if (distSq >= minDistance * minDistance) {
            continue;
          }

          var dist = Math.sqrt(distSq);
          var nx = dist > 0.01 ? dx / dist : 1;
          var ny = dist > 0.01 ? dy / dist : 0;
          var push = (minDistance - dist) / 2;
          if (maxPush) {
            push = Math.min(push, maxPush);
          }
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;

          a.x = clamp(a.x, a.bounds.left + a.radius, a.bounds.right - a.radius);
          a.y = clamp(a.y, a.bounds.top + a.radius, a.bounds.bottom - a.radius);
          b.x = clamp(b.x, b.bounds.left + b.radius, b.bounds.right - b.radius);
          b.y = clamp(b.y, b.bounds.top + b.radius, b.bounds.bottom - b.radius);

          var av = a.vx * nx + a.vy * ny;
          var bv = b.vx * nx + b.vy * ny;
          a.vx += (bv - av) * nx;
          a.vy += (bv - av) * ny;
          b.vx += (av - bv) * nx;
          b.vy += (av - bv) * ny;
        }
      }
    }
  }

  function settleBubbles(items) {
    for (var i = 0; i < 12; i += 1) {
      resolveBubbleCollisions(items);
    }
  }

  function drawResultsBanner() {
    if (game.phase !== "result" || startLayer.className !== "hidden") {
      return;
    }
    drawRoundRect(455, 332, 690, 198, 38);
    ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 127, 168, 0.6)";
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  function drawConfetti(time) {
    if (game.playerResults.length < 2) {
      return;
    }
    for (var i = 0; i < 54; i += 1) {
      var x = (i * 137 + time * 0.08) % WIDTH;
      var y = (i * 59 + time * 0.16) % HEIGHT;
      ctx.fillStyle = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((time * 0.002 + i) % Math.PI);
      ctx.fillRect(-8, -4, 16, 8);
      ctx.restore();
    }
  }

  function drawArenaSurfaces() {
    if (game.players.length !== PLAYER_COUNT) {
      return;
    }
    drawRoundRect(48, 122, 704, 738, 34);
    ctx.fillStyle = "rgba(255, 235, 243, 0.36)";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(255, 111, 159, 0.42)";
    ctx.stroke();

    drawRoundRect(848, 122, 704, 738, 34);
    ctx.fillStyle = "rgba(225, 248, 251, 0.38)";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(83, 200, 215, 0.46)";
    ctx.stroke();
  }

  function drawPlayerFinishedOverlay(playerState) {
    if (!playerState.finished || game.phase !== "playing") {
      return;
    }
    var centerX = playerState.player === 1 ? 400 : 1200;
    drawRoundRect(centerX - 150, 406, 300, 116, 32);
    ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = playerState.player === 1 ? "rgba(255, 111, 159, 0.72)" : "rgba(83, 200, 215, 0.76)";
    ctx.stroke();
    ctx.fillStyle = "#3c9760";
    ctx.font = "900 32px Microsoft YaHei, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\u5b8c\u6210\uff01" + formatTime(playerState.elapsed), centerX, 464);
  }

  function draw(time) {
    drawBackground();
    drawConfetti(time || 0);
    drawArenaSurfaces();
    drawHeader();
    drawLabels();

    for (var p = 0; p < game.players.length; p += 1) {
      var playerState = game.players[p];
      for (var i = 0; i < playerState.upperItems.length; i += 1) {
        var upper = playerState.upperItems[i];
        drawBubble(upper, playerState.selectedUpper === upper);
      }
      for (var j = 0; j < playerState.lowerItems.length; j += 1) {
        var lower = playerState.lowerItems[j];
        drawBubble(lower, playerState.selectedLower === lower);
      }
      drawPlayerFinishedOverlay(playerState);
    }
    drawResultsBanner();
  }

  function loop(time) {
    if (!lastFrameTime) {
      lastFrameTime = time;
    }
    var delta = Math.min((time - lastFrameTime) / 1000, MAX_FRAME_DELTA);
    lastFrameTime = time;
    if (game.phase === "playing") {
      game.elapsed += delta;
      for (var p = 0; p < game.players.length; p += 1) {
        var playerState = game.players[p];
        if (playerState.finished) {
          continue;
        }
        for (var i = 0; i < playerState.upperItems.length; i += 1) {
          updateMovingBubble(playerState.upperItems[i], delta);
        }
        for (var j = 0; j < playerState.lowerItems.length; j += 1) {
          updateMovingBubble(playerState.lowerItems[j], delta);
        }
        resolveBubbleCollisions(playerState.upperItems, MAX_COLLISION_PUSH);
        resolveBubbleCollisions(playerState.lowerItems, MAX_COLLISION_PUSH);
      }
    }
    draw(time);
    animationId = requestAnimationFrame(loop);
  }

  canvas.addEventListener("mousedown", handleInput);
  canvas.addEventListener("touchstart", handleInput, { passive: false });

  showGradeSelection();

  animationId = requestAnimationFrame(loop);

  window.addEventListener("beforeunload", function () {
    clearResultTimers();
    clearInterval(timerId);
    if (game.phase === "playing") {
      abandonTrackingMatch();
    }
    if (backgroundMusic) {
      backgroundMusic.pause();
    }
    if (reportAudio) {
      reportAudio.pause();
    }
    cancelAnimationFrame(animationId);
  });
}());
