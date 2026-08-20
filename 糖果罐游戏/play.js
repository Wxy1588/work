(function () {
  "use strict";

  var WIDTH = 1600;
  var HEIGHT = 900;
  var JAR_THEME_ORDER = ["lemon", "strawberry", "cocoa", "rainbow", "watermelon", "grape"];
  var JAR_CAPACITIES = [10, 14, 18, 22, 26, 30];
  var BOTTLE_ASSET_COUNT = 10;
  var CANDY_ASSET_COUNT = 15;
  var CANDIES_PER_THEME_CLEAR = 3;
  var HEARTS = 5;
  var CATCH_JAR_W = 224;
  var CATCH_JAR_H = 248;
  var CATCH_JAR_Y = 622;
  var FALLING_SIZE = 98;
  var SHELF_X = 1360;
  var SHELF_Y = 116;
  var SHELF_W = 228;
  var SHELF_H = 518;
  var SHELF_JAR_W = 92;
  var SHELF_JAR_H = 104;

  var WORDS = [
    "apple", "are", "arm", "autumn", "bad",
    "bag", "ball", "banana", "basketball", "bathroom",
    "beach", "bear", "beautiful", "bed", "bedroom",
    "behind", "big", "bike", "bird", "black",
    "blow", "blue", "boat", "book", "bottle",
    "box", "bread", "brother", "brown", "brush",
    "burger", "bus", "by", "cake", "can",
    "candle", "cap", "car", "card", "cat",
    "catch", "chair", "chicken", "China", "chips",
    "chocolate", "clean", "climb", "close", "coat",
    "coke", "color", "computer", "cookie", "cow",
    "crayon", "crocodile", "cup", "cut", "cute",
    "dad", "dance", "dancing", "desk", "dinosaur",
    "dirty", "dog", "doll", "dolphin", "door",
    "draw", "dress", "drink", "drive", "drum",
    "duck", "ears", "eat", "eating", "egg",
    "eight", "eighteen", "elephant", "eleven", "eraser",
    "eyebrow", "eyes", "face", "fast", "fat",
    "father", "feed", "feeding", "feet", "fifteen",
    "find", "five", "floor", "flower", "flush",
    "fly", "foot", "football", "fork", "four",
    "fourteen", "fridge", "from", "game", "giraffe",
    "grandma", "grandpa", "grape", "green", "grey",
    "guitar", "hair", "hand", "happy", "hat",
    "have", "he", "head", "helicopter", "hello",
    "hen", "hiking", "hippo", "hoodie", "hop",
    "horse", "how", "in", "is", "jacket",
    "juice", "jump", "kangaroo", "kitchen", "kite",
    "leg", "lemon", "let", "like", "lollipop",
    "long", "look", "lorry", "love", "man",
    "many", "map", "menu", "milk", "mirror",
    "mix", "mom", "monkey", "moon", "mother",
    "motorbike", "mountain", "mouse", "mouth", "my",
    "name", "neck", "nine", "nineteen", "no",
    "nod", "noodles", "nose", "old", "on",
    "one", "open", "orange", "pajamas", "panda",
    "pants", "pear", "pen", "pencil", "phone",
    "piano", "pig", "pink", "pizza", "plane",
    "play", "please", "pocket", "point", "potato",
    "purple", "rabbit", "rainbow", "red", "rice",
    "ride", "robot", "rooster", "rope", "row",
    "ruler", "run", "running", "sad", "scarf",
    "school", "schoolbag", "sea", "see", "seesaw",
    "seven", "seventeen", "shake", "she", "sheep",
    "shoes", "short", "sing", "sister", "sit",
    "six", "sixteen", "skateboard", "skipping", "skirt",
    "sky", "sleep", "sleeping", "slide", "slow",
    "small", "so", "socks", "sofa", "some",
    "spoon", "stand", "star", "strawberry", "student",
    "sun", "sunglasses", "supermarket", "swim", "swimming",
    "swing", "table", "tail", "teacher", "teeth",
    "ten", "tennis", "the", "these", "thin",
    "thirteen", "this", "three", "tiger", "toilet",
    "tomato", "touch", "toy", "tractor", "train",
    "tree", "twelve", "twenty", "two", "ugly",
    "UK", "under", "uniform", "USA", "wash",
    "water", "watermelon", "wear", "whale", "what",
    "where", "which", "white", "who", "window",
    "woman", "would", "yellow", "yes", "yogurt",
    "young", "your", "yuck", "yummy", "zoo"
  ];
  var DEFAULT_WORDS = WORDS.slice();
  var DEFAULT_WORD_SET = {
    id: "grade1_3",
    label: "1-3\u5e74\u7ea7",
    dir: "grade_audio/audio",
    levels: 20,
    words: DEFAULT_WORDS.map(function (word) {
      return { word: word, file: word + ".mp3" };
    })
  };
  var WORD_SETS = [DEFAULT_WORD_SET].concat(window.GRADE_WORD_SETS || []);
  var WORD_SET_GROUPS = [
    { id: "grade1_3", label: "1-3\u5e74\u7ea7", wordSetId: "grade1_3" },
    { id: "grade4", label: "4\u5e74\u7ea7", semesters: [{ label: "\u4e0a\u518c", wordSetId: "grade4_1" }, { label: "\u4e0b\u518c", wordSetId: "grade4_2" }] },
    { id: "grade5", label: "5\u5e74\u7ea7", semesters: [{ label: "\u4e0a\u518c", wordSetId: "grade5_1" }, { label: "\u4e0b\u518c", wordSetId: "grade5_2" }] },
    { id: "grade6", label: "6\u5e74\u7ea7", semesters: [{ label: "\u4e0a\u518c", wordSetId: "grade6_1" }, { label: "\u4e0b\u518c", wordSetId: "grade6_2" }] },
    { id: "grade7", label: "7\u5e74\u7ea7", semesters: [{ label: "\u4e0a\u518c", wordSetId: "grade7_1" }, { label: "\u4e0b\u518c", wordSetId: "grade7_2" }] },
    { id: "grade8", label: "8\u5e74\u7ea7", semesters: [{ label: "\u4e0a\u518c", wordSetId: "grade8_1" }, { label: "\u4e0b\u518c", wordSetId: "grade8_2" }] },
    { id: "grade9", label: "9\u5e74\u7ea7", semesters: [{ label: "\u4e0a\u518c", wordSetId: "grade9_1" }, { label: "\u4e0b\u518c", wordSetId: "grade9_2" }] }
  ];
  var DIFFICULTIES = [
    { id: "easy", label: "\u7b80\u5355", hint: "\u8f7b\u677e\u70ed\u8eab", maxSpeedScale: 1.45 },
    { id: "medium", label: "\u4e2d\u7b49", hint: "\u8282\u594f\u52a0\u5feb", maxSpeedScale: 1.75 },
    { id: "hard", label: "\u56f0\u96be", hint: "\u6781\u901f\u6311\u6218", maxSpeedScale: 2.1354166666666665 }
  ];
  var selectedWordSet = DEFAULT_WORD_SET;
  var wordAudioFiles = {};

  var canvas = document.getElementById("gameCanvas");
  var ctx = canvas.getContext("2d");
  var reportBackdropCanvas = document.createElement("canvas");
  var reportBackdropCtx = reportBackdropCanvas.getContext("2d");
  var gameTracker = null;
  if (typeof window.GameTracker === "function") {
    try {
      gameTracker = new window.GameTracker({
        gameId: "candy_game",
        gameVersion: "1.0.0",
        apiUrl: window.CANDY_GAME_TRACKER_API_URL || "http://127.0.0.1:8000/api/v1/events",
        getUserId: function () {
          return window.platformUserId || null;
        }
      });
    } catch (error) {
      console.warn("[CandyGame] GameTracker initialization failed:", error);
    }
  }
  var THEMES = {
    lemon: {
      assetSetId: "lemon",
      label: "\u871c\u7cd6\u8f6f\u7cd6",
      note: "\u5976\u6cb9\u6674\u7a7a",
      preview: "assets/photo/candy1.png",
      dir: "assets/photo",
      bottleDir: "assets/photo",
      bottleOffset: 0,
      hands: { dir: "assets/photo", left: "lefthand.png", right: "righthand.png" },
      background: "#fff5d8",
      stripe: "#dff2fa",
      accent: "#f3c44d",
      shelf: "#b8753c",
      shelfDark: "#724019",
      panel: "rgba(255, 250, 231, 0.94)",
      reportOverlay: "rgba(255, 248, 224, 0.84)",
      reportCard: "rgba(255, 255, 255, 0.86)",
      buttonTop: "#fffdf4",
      buttonBottom: "#f5cf61",
      buttonShadow: "#c99024",
      buttonInk: "#5c4318",
      accentInk: "#5c4318"
    },
    strawberry: {
      assetSetId: "strawberry",
      label: "\u8584\u8377\u7cd6",
      note: "\u6e05\u51c9\u6d77\u98ce",
      preview: "assets/photo/candy8.png",
      dir: "assets/photo",
      bottleDir: "assets/photo",
      bottleOffset: 1,
      hands: { dir: "assets/photo", left: "lefthand.png", right: "righthand.png" },
      background: "#e4f2fb",
      stripe: "#2865a0",
      accent: "#2d6eab",
      shelf: "#b8753c",
      shelfDark: "#724019",
      panel: "rgba(238, 248, 254, 0.95)",
      reportOverlay: "rgba(228, 242, 251, 0.86)",
      reportCard: "rgba(250, 253, 255, 0.88)",
      buttonTop: "#f4fbff",
      buttonBottom: "#9ccbe9",
      buttonShadow: "#276095",
      buttonInk: "#173e68",
      accentInk: "#ffffff"
    },
    cocoa: {
      assetSetId: "lemon",
      label: "\u53ef\u53ef\u5939\u5fc3",
      preview: "assets/photo/candy2.png",
      bottleOffset: 2,
      background: "#f8eee9",
      stripe: "#a66850",
      accent: "#92513a",
      shelf: "#805044",
      shelfDark: "#4d2924",
      panel: "rgba(255, 249, 246, 0.95)",
      reportOverlay: "rgba(248, 238, 233, 0.87)",
      reportCard: "rgba(255, 255, 255, 0.88)",
      buttonTop: "#fff9f5",
      buttonBottom: "#d99773",
      buttonShadow: "#824331",
      buttonInk: "#4e2d26",
      accentInk: "#ffffff"
    },
    rainbow: {
      assetSetId: "lemon",
      label: "\u5f69\u8679\u679c\u51bb",
      preview: "assets/photo/candy4.png",
      bottleOffset: 1,
      background: "#eafaff",
      stripe: "#ff9aa9",
      accent: "#e87a92",
      shelf: "#a6748d",
      shelfDark: "#674355",
      panel: "rgba(249, 254, 255, 0.95)",
      reportOverlay: "rgba(236, 250, 255, 0.87)",
      reportCard: "rgba(255, 255, 255, 0.89)",
      buttonTop: "#fffafb",
      buttonBottom: "#ffb3a2",
      buttonShadow: "#c75e75",
      buttonInk: "#733a4b",
      accentInk: "#ffffff"
    },
    watermelon: {
      assetSetId: "lemon",
      label: "\u897f\u74dc\u6ce1\u6ce1",
      preview: "assets/photo/candy5.png",
      bottleOffset: 4,
      background: "#edf8ed",
      stripe: "#72b86f",
      accent: "#4f9a58",
      shelf: "#69955f",
      shelfDark: "#3d653c",
      panel: "rgba(248, 255, 247, 0.95)",
      reportOverlay: "rgba(237, 248, 237, 0.87)",
      reportCard: "rgba(255, 255, 255, 0.89)",
      buttonTop: "#fbfff9",
      buttonBottom: "#a9d98e",
      buttonShadow: "#397c46",
      buttonInk: "#315938",
      accentInk: "#ffffff"
    },
    grape: {
      assetSetId: "strawberry",
      label: "\u8461\u8404\u8f6f\u7cd6",
      preview: "assets/photo/candy10.png",
      bottleOffset: 5,
      background: "#f4effa",
      stripe: "#7f5aa8",
      accent: "#79519d",
      shelf: "#76548e",
      shelfDark: "#4b345f",
      panel: "rgba(252, 249, 255, 0.95)",
      reportOverlay: "rgba(244, 239, 250, 0.87)",
      reportCard: "rgba(255, 255, 255, 0.89)",
      buttonTop: "#fcf9ff",
      buttonBottom: "#b79ad2",
      buttonShadow: "#5c397d",
      buttonInk: "#482d61",
      accentInk: "#ffffff"
    }
  };
  var assetSets = {
    lemon: { candies: [], bottles: [], hands: { left: null, right: null }, heart: null, report: null, dogCry: null },
    strawberry: { candies: [], bottles: [], hands: { left: null, right: null }, heart: null, report: null, dogCry: null }
  };
  var assets = assetSets.lemon;
  var audioCache = {};
  var backgroundAudio = null;
  var rightAudio = null;
  var wrongAudio = null;
  var unlockAudio = null;
  var reportAudioCache = {};
  var foregroundQueue = [];
  var foregroundPlaying = false;
  var foregroundAudio = null;
  var foregroundCleanup = null;
  var foregroundRunId = 0;
  var imageCount = 0;
  var loadedImages = 0;
  var bookProgress = {};
  var lastTouchAt = 0;
  var startOverlay = null;
  var showStartSelection = null;
  var showDifficultyStep = null;
  var showThemeSelection = null;
  var jarDropCanvas = null;
  var progressJarCanvas = null;
  var jarMaskCache = typeof WeakMap === "function" ? new WeakMap() : null;
  var bottleAssignment = {};

  var state = {
    phase: "loading",
    score: 0,
    lives: HEARTS,
    currentJarIndex: 0,
    questionIndex: 0,
    choices: [],
    fallingCandies: [],
    jarX: (WIDTH - CATCH_JAR_W) / 2,
    jarTargetX: (WIDTH - CATCH_JAR_W) / 2,
    lastFrameAt: 0,
    nextDropAt: 0,
    buttons: [],
    drops: [],
    message: "",
    messageUntil: 0,
    wrongChoiceIndex: -1,
    dogCryStartedAt: 0,
    timerId: null,
    promptTimerId: null,
    rafId: null,
    reported: false,
    started: false,
    currentWord: null,
    completedJars: [],
    completedThemeIds: [],
    highestUnlockedJarIndex: 0,
    unlockedCandyCount: CANDIES_PER_THEME_CLEAR,
    pendingThemeUnlockId: null,
    themeSelectionUnlockId: null,
    jarIntro: null,
    jarCeremony: null,
    jarReturn: null,
    shelfShowcase: null,
    nextThemeAfterCeremony: null,
    unlockAnimation: null,
    jarOnField: false,
    masteredWords: [],
    unmasteredWords: [],
    wordStatus: {},
    masteredCount: 0,
    attemptedCount: 0,
    wordOrder: [],
    reportScrollY: 0,
    reportScrollMax: 0,
    reportScrollArea: null,
    reportDragging: false,
    reportDragLastY: 0,
    reportReturnPhase: null,
    selectedThemeId: "lemon",
    jarThemeOrder: JAR_THEME_ORDER.slice(),
    selectedDifficultyId: "easy",
    selectedGradeId: "grade1_3",
    selectedWordSetId: DEFAULT_WORD_SET.id
  };

  function getDifficultyById(difficultyId) {
    for (var i = 0; i < DIFFICULTIES.length; i += 1) {
      if (DIFFICULTIES[i].id === difficultyId) {
        return DIFFICULTIES[i];
      }
    }
    return DIFFICULTIES[0];
  }

  function getWordSetById(wordSetId) {
    for (var i = 0; i < WORD_SETS.length; i += 1) {
      if (WORD_SETS[i].id === wordSetId) {
        return WORD_SETS[i];
      }
    }
    return DEFAULT_WORD_SET;
  }

  function getGradeGroupById(gradeId) {
    for (var i = 0; i < WORD_SET_GROUPS.length; i += 1) {
      if (WORD_SET_GROUPS[i].id === gradeId) {
        return WORD_SET_GROUPS[i];
      }
    }
    return WORD_SET_GROUPS[0];
  }

  function setWordSet(wordSetId) {
    var nextSet = getWordSetById(wordSetId);
    selectedWordSet = nextSet;
    state.selectedWordSetId = nextSet.id;
    wordAudioFiles = {};
    WORDS = nextSet.words.map(function (entry) {
      wordAudioFiles[entry.word] = entry.file || (entry.word + ".mp3");
      return entry.word;
    });
    audioCache = {};
    state.wordOrder = [];
  }

  function buildWordOrder() {
    return shuffle(WORDS);
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function loadImage(src, onDone) {
    imageCount += 1;
    var img = new Image();
    img.onload = function () {
      loadedImages += 1;
      onDone(img);
      checkLoadingComplete();
    };
    img.onerror = function () {
      loadedImages += 1;
      onDone(null);
      checkLoadingComplete();
    };
    img.src = src;
  }

  function checkLoadingComplete() {
    if (state.phase !== "loading") return;
    if (!imageCount || loadedImages < imageCount) return;
    state.phase = "ready";
    if (startOverlay) {
      startOverlay.className = "start_overlay";
    }
  }

  function loadAssets() {
    Object.keys(assetSets).forEach(function (assetSetId) {
      var themeAssets = assetSets[assetSetId];
      var assetTheme = THEMES[assetSetId];
      var dir = assetTheme.dir;
      var bottleDir = assetTheme.bottleDir || dir;
      loadImage(dir + "/aixin.png", function (img) {
        themeAssets.heart = img;
      });
      loadImage(dir + "/dogcry.png", function (img) {
        themeAssets.dogCry = img;
      });
      var handDir = assetTheme.hands.dir || dir;
      loadImage(handDir + "/" + assetTheme.hands.left, function (img) {
        themeAssets.hands.left = img;
      });
      loadImage(handDir + "/" + assetTheme.hands.right, function (img) {
        themeAssets.hands.right = img;
      });
      for (var i = 1; i <= BOTTLE_ASSET_COUNT; i += 1) {
        (function (index) {
          loadImage(bottleDir + "/bottle" + index + ".png", function (img) {
            themeAssets.bottles[index - 1] = img;
          });
        })(i);
      }
      for (var c = 1; c <= CANDY_ASSET_COUNT; c += 1) {
        (function (index) {
          loadImage(dir + "/candy" + index + ".png", function (img) {
            themeAssets.candies[index - 1] = img;
          });
        })(c);
      }
    });
  }

  function currentTheme() {
    return THEMES[state.selectedThemeId] || THEMES.lemon;
  }

  function currentJarCapacity() {
    return JAR_CAPACITIES[Math.min(JAR_CAPACITIES.length - 1, state.currentJarIndex)] || JAR_CAPACITIES[0];
  }

  function themeIndex(themeId) {
    var index = JAR_THEME_ORDER.indexOf(themeId);
    return index < 0 ? 0 : index;
  }

  function completedThemePrefixCount() {
    for (var i = 0; i < JAR_THEME_ORDER.length; i += 1) {
      if (state.completedThemeIds.indexOf(JAR_THEME_ORDER[i]) < 0) {
        return i;
      }
    }
    return JAR_THEME_ORDER.length;
  }

  function computeHighestUnlockedJarIndex() {
    return Math.min(JAR_THEME_ORDER.length - 1, completedThemePrefixCount());
  }

  function refreshUnlockedJarIndex() {
    state.highestUnlockedJarIndex = computeHighestUnlockedJarIndex();
    return state.highestUnlockedJarIndex;
  }

  function isThemeUnlocked(themeId) {
    return themeIndex(themeId) <= state.highestUnlockedJarIndex || state.completedThemeIds.indexOf(themeId) >= 0;
  }

  function pickDefaultUnlockedTheme() {
    refreshUnlockedJarIndex();
    for (var i = state.highestUnlockedJarIndex; i >= 0; i -= 1) {
      var themeId = JAR_THEME_ORDER[i];
      if (state.completedThemeIds.indexOf(themeId) < 0) return themeId;
    }
    return JAR_THEME_ORDER[state.highestUnlockedJarIndex] || JAR_THEME_ORDER[0];
  }

  function syncSelectedBookProgress() {
    var progressKey = state.selectedWordSetId || "grade1_3";
    var savedProgress = bookProgress[progressKey] || null;
    state.completedJars = savedProgress && savedProgress.completedJars ? savedProgress.completedJars.slice() : [];
    state.completedThemeIds = state.completedJars.map(function (jar) { return jar.themeId; });
    state.unlockedCandyCount = savedProgress && savedProgress.unlockedCandyCount ? savedProgress.unlockedCandyCount : Math.min(CANDY_ASSET_COUNT, CANDIES_PER_THEME_CLEAR + state.completedThemeIds.length * CANDIES_PER_THEME_CLEAR);
    state.pendingThemeUnlockId = savedProgress && savedProgress.pendingThemeUnlockId ? savedProgress.pendingThemeUnlockId : null;
    refreshUnlockedJarIndex();
  }

  function unlockedCandyCountForProgress() {
    var savedCount = state.unlockedCandyCount || CANDIES_PER_THEME_CLEAR;
    return Math.max(CANDIES_PER_THEME_CLEAR, Math.min(CANDY_ASSET_COUNT, savedCount));
  }

  function jarImageForTheme(themeId) {
    var theme = THEMES[themeId] || THEMES.lemon;
    var themeAssets = assetSets.lemon;
    var bottlePool = themeAssets.bottles;
    if (!bottlePool.length) return null;
    var assigned = bottleAssignment[themeId];
    return bottlePool[assigned == null ? (theme.bottleOffset || 0) % bottlePool.length : assigned] || bottlePool[0];
  }

  function currentJarImage() {
    return jarImageForTheme(state.selectedThemeId);
  }

  function setCandyTheme(themeId) {
    if (!THEMES[themeId] || !isThemeUnlocked(themeId)) return;
    state.selectedThemeId = themeId;
    assets = assetSets[THEMES[themeId].assetSetId] || assetSets.lemon;
    if (startOverlay) {
      startOverlay.setAttribute("data-candy-theme", themeId);
      var buttons = startOverlay.querySelectorAll(".theme_button");
      for (var i = 0; i < buttons.length; i += 1) {
        var selected = buttons[i].getAttribute("data-theme") === themeId;
        var locked = buttons[i].getAttribute("data-locked") === "true";
        buttons[i].className = "theme_button" + (selected ? " is_selected" : "") + (locked ? " is_locked" : "");
        buttons[i].setAttribute("aria-pressed", selected ? "true" : "false");
      }
    }
  }

  function bindTap(element, handler) {
    element.addEventListener("click", handler);
    element.addEventListener("touchend", function (event) {
      event.preventDefault();
      handler(event);
    }, false);
  }

  function createThemeButton(themeId) {
    var theme = THEMES[themeId];
    var button = document.createElement("button");
    var isSelected = themeId === state.selectedThemeId;
    var locked = !isThemeUnlocked(themeId);
    var isUnlocking = !locked && state.themeSelectionUnlockId === themeId;
    button.className = "theme_button" + (isSelected ? " is_selected" : "") + (locked ? " is_locked" : "") + (isUnlocking ? " is_unlocking" : "");
    button.setAttribute("data-theme", themeId);
    button.setAttribute("data-locked", locked ? "true" : "false");
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    button.disabled = locked;
    button.type = "button";
    var preview = document.createElement("img");
    preview.className = "theme_preview";
    preview.src = theme.preview;
    preview.alt = "";
    preview.setAttribute("aria-hidden", "true");
    var labelSpan = document.createElement("span");
    labelSpan.className = "theme_label";
    labelSpan.innerText = theme.label;
    var statusSpan = document.createElement("span");
    statusSpan.className = "theme_status";
    statusSpan.innerText = locked ? "\u672a\u89e3\u9501" : (isUnlocking ? "\u65b0\u89e3\u9501" : (state.completedThemeIds.indexOf(themeId) >= 0 ? "\u5df2\u6536\u96c6" : "\u53ef\u9009\u62e9"));
    if (locked || isUnlocking) {
      var lockSpan = document.createElement("span");
      lockSpan.className = "theme_lock";
      lockSpan.setAttribute("aria-hidden", "true");
      button.appendChild(lockSpan);
    }
    button.appendChild(preview);
    button.appendChild(labelSpan);
    button.appendChild(statusSpan);
    button.style.cursor = locked ? "not-allowed" : "pointer";
    bindTap(button, function (event) {
      if (event) {
        event.preventDefault();
      }
      if (locked) return;
      initAudioAfterInteraction();
      setCandyTheme(themeId);
    });
    button.addEventListener("mousedown", initAudioAfterInteraction);
    button.addEventListener("touchstart", function (event) {
      initAudioAfterInteraction();
      event.preventDefault();
    }, false);
    return button;
  }

  function activateJarTheme(jarIndex) {
    var jarThemes = state.jarThemeOrder || JAR_THEME_ORDER;
    var safeIndex = Math.max(0, Math.min(jarThemes.length - 1, jarIndex));
    var themeId = jarThemes[safeIndex] || JAR_THEME_ORDER[0];
    state.currentJarIndex = safeIndex;
    setCandyTheme(themeId);
  }

  function setJarThemeOrder(firstThemeId) {
    state.jarThemeOrder = JAR_THEME_ORDER.slice();
    if (THEMES[firstThemeId] && isThemeUnlocked(firstThemeId)) {
      state.selectedThemeId = firstThemeId;
    }
  }

  function clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function createPanelTitle(text) {
    var title = document.createElement("div");
    title.className = "start_title";
    title.innerText = text;
    return title;
  }

  function createStartOverlay() {
    var overlay = document.createElement("div");
    overlay.className = "start_overlay is_hidden";
    startOverlay = overlay;

    var panel = document.createElement("div");
    panel.className = "start_panel start_panel_setup";

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    function createDifficultyButton(difficulty) {
      var button = document.createElement("button");
      button.className = difficulty.id === state.selectedDifficultyId ? "difficulty_button is_selected" : "difficulty_button";
      button.setAttribute("data-difficulty", difficulty.id);
      button.type = "button";

      var label = document.createElement("span");
      label.className = "difficulty_label";
      label.innerText = difficulty.label;
      button.appendChild(label);

      bindTap(button, function (event) {
        if (event) {
          event.preventDefault();
        }
        initAudioAfterInteraction();
        state.selectedDifficultyId = difficulty.id;
        var buttons = panel.querySelectorAll(".difficulty_button");
        for (var i = 0; i < buttons.length; i += 1) {
          var selected = buttons[i].getAttribute("data-difficulty") === difficulty.id;
          buttons[i].className = selected ? "difficulty_button is_selected" : "difficulty_button";
          buttons[i].setAttribute("aria-pressed", selected ? "true" : "false");
        }
      });
      button.setAttribute("aria-pressed", difficulty.id === state.selectedDifficultyId ? "true" : "false");
      button.addEventListener("mousedown", initAudioAfterInteraction);
      button.addEventListener("touchstart", function (event) {
        initAudioAfterInteraction();
        event.preventDefault();
      }, false);
      return button;
    }

    function createSection(titleText, className) {
      var section = document.createElement("section");
      section.className = "setup_section " + className;
      var title = document.createElement("h2");
      title.className = "setup_section_title";
      title.innerText = titleText;
      section.appendChild(title);
      return section;
    }

    function createPickerWheel(options, selectedIndex, label, onSelect) {
      var wheel = document.createElement("div");
      wheel.className = "picker_wheel";
      wheel.setAttribute("role", "listbox");
      wheel.setAttribute("aria-label", label);
      wheel.tabIndex = 0;
      var activeIndex = clamp(selectedIndex, 0, options.length - 1);
      var scrollFrame = null;

      function selectIndex(nextIndex, shouldScroll) {
        nextIndex = clamp(nextIndex, 0, options.length - 1);
        if (shouldScroll) {
          wheel.scrollTo({ top: nextIndex * 56, behavior: "smooth" });
        }
        if (nextIndex === activeIndex && wheel.children[nextIndex].classList.contains("is_selected")) return;
        activeIndex = nextIndex;
        for (var j = 0; j < wheel.children.length; j += 1) {
          var selected = j === activeIndex;
          wheel.children[j].className = selected ? "picker_option is_selected" : "picker_option";
          wheel.children[j].setAttribute("aria-selected", selected ? "true" : "false");
        }
        onSelect(options[activeIndex], activeIndex);
      }

      for (var i = 0; i < options.length; i += 1) {
        (function (option, optionIndex) {
          var item = document.createElement("div");
          item.className = optionIndex === activeIndex ? "picker_option is_selected" : "picker_option";
          item.setAttribute("role", "option");
          item.setAttribute("aria-selected", optionIndex === activeIndex ? "true" : "false");
          item.innerText = option.label;
          item.addEventListener("click", function () {
            initAudioAfterInteraction();
            selectIndex(optionIndex, true);
          });
          wheel.appendChild(item);
        })(options[i], i);
      }

      wheel.addEventListener("scroll", function () {
        if (scrollFrame) cancelAnimationFrame(scrollFrame);
        scrollFrame = requestAnimationFrame(function () {
          scrollFrame = null;
          selectIndex(Math.round(wheel.scrollTop / 56), false);
        });
      });

      wheel.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        event.preventDefault();
        selectIndex(activeIndex + (event.key === "ArrowDown" ? 1 : -1), true);
      });

      requestAnimationFrame(function () {
        wheel.scrollTop = activeIndex * 56;
      });
      return wheel;
    }

    function getSemesterOptions(gradeGroup) {
      if (gradeGroup.semesters && gradeGroup.semesters.length) return gradeGroup.semesters;
      return [{ label: "\u5168\u518c", wordSetId: gradeGroup.wordSetId }];
    }

    function appendStepHeading(step, titleText, subtitleText) {
      var totalSteps = 2;
      var heading = document.createElement("header");
      heading.className = titleText ? "setup_heading" : "setup_heading is_compact";

      var brand = document.createElement("div");
      brand.className = "start_brand";
      var brandCandy = document.createElement("span");
      brandCandy.className = "brand_candy";
      brandCandy.setAttribute("aria-hidden", "true");
      brand.appendChild(brandCandy);
      var brandText = document.createElement("span");
      brandText.innerText = "\u7cd6\u679c\u82f1\u8bed\u6311\u6218";
      brand.appendChild(brandText);
      heading.appendChild(brand);

      var progress = document.createElement("div");
      progress.className = "setup_progress";
      progress.setAttribute("aria-label", "\u5f00\u5c40\u8bbe\u7f6e\uff0c\u7b2c " + Math.min(step, totalSteps) + " \u6b65\uff0c\u5171 " + totalSteps + " \u6b65");
      for (var i = 1; i <= totalSteps; i += 1) {
        if (i > 1) {
          var line = document.createElement("span");
          line.className = i <= step ? "progress_line is_active" : "progress_line";
          progress.appendChild(line);
        }
        var dot = document.createElement("span");
        dot.className = i === step ? "progress_step is_active" : (i < step ? "progress_step is_done" : "progress_step");
        dot.innerText = i;
        progress.appendChild(dot);
      }
      heading.appendChild(progress);
      if (titleText) {
        heading.appendChild(createPanelTitle(titleText));
      }
      if (subtitleText) {
        var subtitle = document.createElement("p");
        subtitle.className = "start_subtitle";
        subtitle.innerText = subtitleText;
        heading.appendChild(subtitle);
      }
      panel.appendChild(heading);
    }

    function createActionButton(className, label, handler) {
      var button = document.createElement("button");
      button.className = className;
      button.innerText = label;
      button.style.cursor = "pointer";
      button.type = "button";
      bindTap(button, handler);
      button.addEventListener("mousedown", initAudioAfterInteraction);
      button.addEventListener("touchstart", initAudioAfterInteraction, false);
      return button;
    }

    function showGradeStep() {
      clearElement(panel);
      panel.className = "start_panel start_panel_grade";
      appendStepHeading(1, "", "\u6eda\u52a8\u9009\u62e9\u5e74\u7ea7\u548c\u518c\u522b");

      var pickerSection = createSection("\u5e74\u7ea7\u4e0e\u518c\u522b", "picker_section");
      var pickerRow = document.createElement("div");
      pickerRow.className = "picker_row";
      var semesterSlot = document.createElement("div");
      semesterSlot.className = "picker_column";

      function rebuildSemesterWheel() {
        clearElement(semesterSlot);
        var gradeGroup = getGradeGroupById(state.selectedGradeId);
        var semesterOptions = getSemesterOptions(gradeGroup);
        var selectedSemesterIndex = 0;
        for (var i = 0; i < semesterOptions.length; i += 1) {
          if (semesterOptions[i].wordSetId === state.selectedWordSetId) selectedSemesterIndex = i;
        }
        var label = document.createElement("div");
        label.className = "picker_label";
        label.innerText = "\u518c\u522b";
        semesterSlot.appendChild(label);
        var frame = document.createElement("div");
        frame.className = "picker_frame";
        frame.appendChild(createPickerWheel(semesterOptions, selectedSemesterIndex, "\u9009\u62e9\u518c\u522b", function (semester) {
          setWordSet(semester.wordSetId);
        }));
        var highlight = document.createElement("div");
        highlight.className = "picker_highlight";
        frame.appendChild(highlight);
        semesterSlot.appendChild(frame);
      }

      var gradeColumn = document.createElement("div");
      gradeColumn.className = "picker_column";
      var gradeLabel = document.createElement("div");
      gradeLabel.className = "picker_label";
      gradeLabel.innerText = "\u5e74\u7ea7";
      gradeColumn.appendChild(gradeLabel);
      var gradeFrame = document.createElement("div");
      gradeFrame.className = "picker_frame";
      var selectedGradeIndex = 0;
      for (var i = 0; i < WORD_SET_GROUPS.length; i += 1) {
        if (WORD_SET_GROUPS[i].id === state.selectedGradeId) selectedGradeIndex = i;
      }
      gradeFrame.appendChild(createPickerWheel(WORD_SET_GROUPS, selectedGradeIndex, "\u9009\u62e9\u5e74\u7ea7", function (gradeGroup) {
        if (gradeGroup.id === state.selectedGradeId) return;
        state.selectedGradeId = gradeGroup.id;
        if (gradeGroup.wordSetId) {
          setWordSet(gradeGroup.wordSetId);
        } else {
          setWordSet(gradeGroup.semesters[0].wordSetId);
        }
        rebuildSemesterWheel();
      }));
      var gradeHighlight = document.createElement("div");
      gradeHighlight.className = "picker_highlight";
      gradeFrame.appendChild(gradeHighlight);
      gradeColumn.appendChild(gradeFrame);

      pickerRow.appendChild(gradeColumn);
      pickerRow.appendChild(semesterSlot);
      pickerSection.appendChild(pickerRow);
      panel.appendChild(pickerSection);
      rebuildSemesterWheel();

      var actions = document.createElement("div");
      actions.className = "start_actions";
      actions.appendChild(createActionButton("start_button next_button", "下一步", function (event) {
        if (event) event.preventDefault();
        if (showDifficultyStep) showDifficultyStep();
      }));
      panel.appendChild(actions);
    }

    function appendSelectedBookChip() {
      var gradeGroup = getGradeGroupById(state.selectedGradeId);
      var semesterOptions = getSemesterOptions(gradeGroup);
      var semesterLabel = semesterOptions[0].label;
      for (var s = 0; s < semesterOptions.length; s += 1) {
        if (semesterOptions[s].wordSetId === state.selectedWordSetId) semesterLabel = semesterOptions[s].label;
      }
      var selectedBook = document.createElement("div");
      selectedBook.className = "selected_book_chip";
      selectedBook.innerText = gradeGroup.id === "grade1_3" ? gradeGroup.label : gradeGroup.label + " \u00b7 " + semesterLabel;
      panel.appendChild(selectedBook);
    }

    showDifficultyStep = function () {
      clearElement(panel);
      panel.className = "start_panel start_panel_choice";
      appendStepHeading(2, "", "");
      appendSelectedBookChip();

      var difficultySection = createSection("\u9009\u62e9\u96be\u5ea6", "difficulty_section");
      var difficultyGrid = document.createElement("div");
      difficultyGrid.className = "difficulty_options";
      for (var d = 0; d < DIFFICULTIES.length; d += 1) {
        difficultyGrid.appendChild(createDifficultyButton(DIFFICULTIES[d]));
      }
      difficultySection.appendChild(difficultyGrid);
      panel.appendChild(difficultySection);

      var actions = document.createElement("div");
      actions.className = "start_actions";
      actions.appendChild(createActionButton("back_button", "上一步", function (event) {
        if (event) event.preventDefault();
        showGradeStep();
      }));
      actions.appendChild(createActionButton("start_button", "开始游戏", startFromButton));
      panel.appendChild(actions);
    };

    function showThemeStep() {
      clearElement(panel);
      panel.className = "start_panel start_panel_setup";
      syncSelectedBookProgress();
      state.themeSelectionUnlockId = state.pendingThemeUnlockId;
      if (state.themeSelectionUnlockId) {
        state.selectedThemeId = state.themeSelectionUnlockId;
      } else if (!isThemeUnlocked(state.selectedThemeId)) {
        state.selectedThemeId = pickDefaultUnlockedTheme();
      }
      setCandyTheme(state.selectedThemeId);
      appendStepHeading(2, "", "选择当前可收集主题");
      appendSelectedBookChip();

      var themeSection = createSection("选择主题", "theme_section");
      var themeGrid = document.createElement("div");
      themeGrid.className = "theme_options";
      for (var i = 0; i < JAR_THEME_ORDER.length; i += 1) {
        themeGrid.appendChild(createThemeButton(JAR_THEME_ORDER[i]));
      }
      themeSection.appendChild(themeGrid);
      panel.appendChild(themeSection);

      var actions = document.createElement("div");
      actions.className = "start_actions";
      actions.appendChild(createActionButton("back_button", "上一步", function (event) {
        if (event) event.preventDefault();
        if (showDifficultyStep) showDifficultyStep();
      }));
      actions.appendChild(createActionButton("start_button", "开始游戏", startFromButton));
      panel.appendChild(actions);
      if (state.themeSelectionUnlockId) {
        playUnlockSound();
        window.setTimeout(function () {
          if (state.phase === "ready" && state.themeSelectionUnlockId) {
            state.pendingThemeUnlockId = null;
            state.themeSelectionUnlockId = null;
            var progressKey = state.selectedWordSetId || "grade1_3";
            if (bookProgress[progressKey]) {
              bookProgress[progressKey].pendingThemeUnlockId = null;
            }
            showThemeStep();
          }
        }, 1300);
      }
    }

    showThemeSelection = function () {
      showThemeStep();
      overlay.className = "start_overlay";
    };

    function startFromButton(event) {
      if (event) {
        event.preventDefault();
      }
      if (state.phase === "loading") return;
      initAudioAfterInteraction();
      setWordSet(state.selectedWordSetId);
      syncSelectedBookProgress();
      state.selectedThemeId = pickDefaultUnlockedTheme();
      setJarThemeOrder(state.selectedThemeId);
      startGame();
      overlay.className = "start_overlay is_hidden";
    }

    showStartSelection = function () {
      showGradeStep();
      overlay.className = "start_overlay";
    };

    setWordSet(state.selectedWordSetId);
    showGradeStep();
  }

  function initAudioAfterInteraction() {
    startBackgroundMusic();
    getRightAudio();
    getWrongAudio();
    getUnlockAudio();
    if (state.currentWord) {
      getAudio(state.currentWord);
    }
  }

  function getBackgroundAudio() {
    if (!backgroundAudio) {
      backgroundAudio = new Audio("assets/yinxiao/background.mp3");
      backgroundAudio.preload = "auto";
      backgroundAudio.loop = true;
      backgroundAudio.volume = 0.14;
      try {
        backgroundAudio.load();
      } catch (error) {}
    }
    return backgroundAudio;
  }

  function startBackgroundMusic() {
    var audio = getBackgroundAudio();
    try {
      audio.loop = true;
      audio.muted = false;
      audio.play().catch(function () {});
    } catch (error) {}
  }

  function playQueuedAudio(audio) {
    if (!audio) return;
    foregroundQueue.push(audio);
    drainForegroundQueue();
  }

  function stopForegroundAudio() {
    foregroundRunId += 1;
    foregroundQueue = [];
    if (foregroundCleanup) {
      foregroundCleanup();
      foregroundCleanup = null;
    }
    if (foregroundAudio) {
      try {
        foregroundAudio.pause();
        foregroundAudio.currentTime = 0;
      } catch (error) {}
    }
    foregroundAudio = null;
    foregroundPlaying = false;
  }

  function playPriorityAudio(audio) {
    if (!audio) return;
    stopForegroundAudio();
    foregroundQueue.unshift(audio);
    drainForegroundQueue();
  }

  function drainForegroundQueue() {
    if (foregroundPlaying) return;
    if (!foregroundQueue.length) {
      return;
    }

    var audio = foregroundQueue.shift();
    var runId = foregroundRunId + 1;
    foregroundPlaying = true;
    foregroundAudio = audio;
    foregroundRunId = runId;

    var finished = false;
    var timerId = 0;
    function cleanup() {
      window.clearTimeout(timerId);
      audio.removeEventListener("ended", finish);
      audio.removeEventListener("error", finish);
    }
    function finish() {
      if (finished) return;
      if (runId !== foregroundRunId) return;
      finished = true;
      cleanup();
      if (foregroundCleanup === cleanup) {
        foregroundCleanup = null;
      }
      if (foregroundAudio === audio) {
        foregroundAudio = null;
      }
      foregroundPlaying = false;
      drainForegroundQueue();
    }

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      audio.addEventListener("ended", finish);
      audio.addEventListener("error", finish);
      foregroundCleanup = cleanup;
      timerId = window.setTimeout(finish, 6500);
      audio.play().catch(finish);
    } catch (error) {
      finish();
    }
  }

  function getRightAudio() {
    if (!rightAudio) {
      rightAudio = new Audio("assets/yinxiao/right.mp3");
      rightAudio.preload = "auto";
      rightAudio.volume = 0.86;
      try {
        rightAudio.load();
      } catch (error) {}
    }
    return rightAudio;
  }

  function playRightSound() {
    var audio = getRightAudio();
    playPriorityAudio(audio);
  }

  function getWrongAudio() {
    if (!wrongAudio) {
      wrongAudio = new Audio("assets/yinxiao/wrong.mp3");
      wrongAudio.preload = "auto";
      wrongAudio.volume = 0.86;
      try {
        wrongAudio.load();
      } catch (error) {}
    }
    return wrongAudio;
  }

  function playWrongSound() {
    var audio = getWrongAudio();
    playPriorityAudio(audio);
  }

  function getUnlockAudio() {
    if (!unlockAudio) {
      unlockAudio = new Audio("assets/yinxiao/unlock.mp3");
      unlockAudio.preload = "auto";
      unlockAudio.volume = 0.86;
      try {
        unlockAudio.load();
      } catch (error) {}
    }
    return unlockAudio;
  }

  function playUnlockSound() {
    var audio = getUnlockAudio();
    playPriorityAudio(audio);
  }

  function getAudio(word) {
    var key = selectedWordSet.id + ":" + word;
    if (!audioCache[key]) {
      var fileName = wordAudioFiles[word] || (word + ".mp3");
      var audio = new Audio(selectedWordSet.dir + "/" + encodeURIComponent(fileName));
      audio.preload = "auto";
      audio.volume = 1;
      audioCache[key] = audio;
      try {
        audio.load();
      } catch (error) {}
    }
    return audioCache[key];
  }

  function playWord(word) {
    var audio = getAudio(word);
    playQueuedAudio(audio);
  }

  function getReportAudio(fileName) {
    if (!reportAudioCache[fileName]) {
      var audio = new Audio("assets/report/" + encodeURIComponent(fileName));
      audio.preload = "auto";
      audio.volume = 1;
      reportAudioCache[fileName] = audio;
      try {
        audio.load();
      } catch (error) {}
    }
    return reportAudioCache[fileName];
  }

  function playReportNarration() {
    if (state.phase !== "report") return;
    stopForegroundAudio();

    if (!state.unmasteredWords.length) {
      playQueuedAudio(getReportAudio("2.mp3"));
      return;
    }

    playQueuedAudio(getReportAudio("1_1.mp3"));
    state.unmasteredWords.slice(0, 3).forEach(function (word) {
      playQueuedAudio(getAudio(word));
    });
    playQueuedAudio(getReportAudio("1_2.mp3"));
  }

  function drawRoundRect(x, y, w, h, r, fillStyle, strokeStyle, lineWidth) {
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
    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
    if (strokeStyle) {
      ctx.lineWidth = lineWidth || 2;
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    }
  }

  function drawBackground() {
    var theme = currentTheme();
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    var stripeIndex = 0;
    for (var x = -1200; x < WIDTH + 1300; x += 192) {
      ctx.fillStyle = theme.stripePalette ? theme.stripePalette[stripeIndex % theme.stripePalette.length] : theme.stripe;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 92, 0);
      ctx.lineTo(x - 808, HEIGHT);
      ctx.lineTo(x - 900, HEIGHT);
      ctx.closePath();
      ctx.fill();
      stripeIndex += 1;
    }
    if (state.selectedThemeId === "strawberry") {
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 5;
      for (var i = 0; i < 7; i += 1) {
        var cx = 110 + i * 210;
        var cy = 154 + (i % 3) * 128;
        ctx.beginPath();
        ctx.moveTo(cx - 34, cy);
        ctx.lineTo(cx + 34, cy);
        ctx.moveTo(cx, cy - 34);
        ctx.lineTo(cx, cy + 34);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawContain(img, x, y, w, h) {
    if (!img) {
      drawRoundRect(x, y, w, h, 16, "#fff3bd", "#d6b35c", 3);
      return;
    }
    drawContainOn(ctx, img, x, y, w, h);
  }

  function containRect(img, x, y, w, h) {
    if (!img) {
      return { x: x, y: y, w: w, h: h };
    }
    var scale = Math.min(w / img.width, h / img.height);
    var dw = img.width * scale;
    var dh = img.height * scale;
    return {
      x: x + (w - dw) / 2,
      y: y + (h - dh) / 2,
      w: dw,
      h: dh
    };
  }

  function drawContainOn(targetCtx, img, x, y, w, h) {
    var rect = containRect(img, x, y, w, h);
    targetCtx.drawImage(img, rect.x, rect.y, rect.w, rect.h);
  }

  function drawProgressJarWater(jar, x, y, w, h, progress) {
    progress = clamp(progress, 0, 1);
    if (progress <= 0.002) return;
    if (!jar) {
      drawRoundRect(x + w * 0.2, y + h * 0.12, w * 0.6, h * 0.78, w * 0.16, "rgba(255,255,255,0.52)", "rgba(84, 143, 170, 0.72)", 2);
      var fallbackWaterH = h * 0.68 * progress;
      drawRoundRect(x + w * 0.24, y + h * 0.82 - fallbackWaterH, w * 0.52, fallbackWaterH, w * 0.12, "rgba(77, 194, 237, 0.7)", null, 0);
      return;
    }

    if (!progressJarCanvas) {
      progressJarCanvas = document.createElement("canvas");
    }
    var localW = Math.max(1, Math.ceil(w));
    var localH = Math.max(1, Math.ceil(h));
    if (progressJarCanvas.width !== localW || progressJarCanvas.height !== localH) {
      progressJarCanvas.width = localW;
      progressJarCanvas.height = localH;
    }

    var waterCtx = progressJarCanvas.getContext("2d");
    waterCtx.clearRect(0, 0, localW, localH);

    var rect = containRect(jar, 0, 0, localW, localH);
    var waterTop = rect.y + rect.h * (1 - progress);
    var wave = Math.max(1.2, rect.h * 0.025);
    var now = Date.now() / 420;

    waterCtx.beginPath();
    waterCtx.moveTo(rect.x, rect.y + rect.h);
    waterCtx.lineTo(rect.x, waterTop);
    for (var px = 0; px <= rect.w; px += Math.max(2, rect.w / 18)) {
      var py = waterTop + Math.sin(now + px / rect.w * Math.PI * 2) * wave;
      waterCtx.lineTo(rect.x + px, py);
    }
    waterCtx.lineTo(rect.x + rect.w, rect.y + rect.h);
    waterCtx.closePath();
    var waterGradient = waterCtx.createLinearGradient(0, waterTop, 0, rect.y + rect.h);
    waterGradient.addColorStop(0, "rgba(135, 226, 255, 0.74)");
    waterGradient.addColorStop(1, "rgba(44, 156, 219, 0.82)");
    waterCtx.fillStyle = waterGradient;
    waterCtx.fill();

    waterCtx.globalCompositeOperation = "destination-in";
    drawContainOn(waterCtx, jarAlphaMask(jar), 0, 0, localW, localH);
    waterCtx.globalCompositeOperation = "source-over";

    ctx.drawImage(progressJarCanvas, x, y, w, h);
  }

  function drawJarProgressHud() {
    var panelX = 1418;
    var panelY = 16;
    var panelW = 158;
    var panelH = 72;
    var theme = currentTheme();
    var capacity = currentJarCapacity();
    var progress = capacity ? state.drops.length / capacity : 0;
    var percent = Math.round(clamp(progress, 0, 1) * 100);
    var jar = currentJarImage();

    drawRoundRect(panelX, panelY, panelW, panelH, 14, theme.panel, "rgba(255,255,255,0.84)", 3);
    ctx.save();
    ctx.globalAlpha = 0.58;
    drawContain(jar, panelX + 12, panelY + 7, 54, 58);
    ctx.restore();
    drawProgressJarWater(jar, panelX + 12, panelY + 7, 54, 58, progress);
    ctx.save();
    ctx.globalAlpha = 0.48;
    drawContain(jar, panelX + 12, panelY + 7, 54, 58);
    ctx.restore();

    ctx.fillStyle = "#24313a";
    ctx.font = "900 28px Arial, Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(percent + "%", panelX + 108, panelY + panelH / 2);
  }

  function drawLearningReportIcon(x, y) {
    ctx.save();
    ctx.strokeStyle = currentTheme().buttonInk;
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    drawRoundRect(x, y, 27, 34, 5, ctx.fillStyle, ctx.strokeStyle, 3);
    ctx.beginPath();
    ctx.moveTo(x + 7, y + 10);
    ctx.lineTo(x + 20, y + 10);
    ctx.moveTo(x + 7, y + 17);
    ctx.lineTo(x + 20, y + 17);
    ctx.moveTo(x + 7, y + 24);
    ctx.lineTo(x + 16, y + 24);
    ctx.stroke();
    ctx.restore();
  }

  function drawLearningReportButton(x, y, w, h) {
    var theme = currentTheme();
    var top = theme.buttonTop;
    var bottom = theme.buttonBottom;
    var outline = "rgba(255,255,255,0.94)";
    var gradient = ctx.createLinearGradient(0, y, 0, y + h);
    gradient.addColorStop(0, top);
    gradient.addColorStop(1, bottom);

    drawRoundRect(x, y, w, h, 12, gradient, outline, 3);
    ctx.save();
    ctx.globalAlpha = 0.45;
    drawRoundRect(x + 5, y + 4, w - 10, 17, 9, "rgba(255,255,255,0.72)", null, 0);
    ctx.restore();
    drawLearningReportIcon(x + 22, y + 12);

    ctx.fillStyle = "#24313a";
    ctx.font = "900 25px Arial, Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\u5b66\u4e60\u62a5\u544a", x + 128, y + h / 2 + 1);

    if (state.phase === "playing") {
      state.buttons.push({ type: "reportOpen", x: x, y: y, w: w, h: h, enabled: true });
    }
  }

  function drawHud() {
    var panelY = 24;
    var panelW = 208;
    var panelH = 58;
    var reportX = 530;
    var levelX = 752;
    var candyX = 974;
    var scoreX = 1196;
    for (var i = 0; i < HEARTS; i += 1) {
      var hx = 254 + i * 54;
      if (i < state.lives && assets.heart) {
        ctx.drawImage(assets.heart, hx, 28, 48, 41);
      } else {
        ctx.globalAlpha = 0.25;
        if (assets.heart) {
          ctx.drawImage(assets.heart, hx, 28, 48, 41);
        } else {
          drawHeartShape(hx + 24, 50, 22, "#ee7480");
        }
        ctx.globalAlpha = 1;
      }
    }

    var theme = currentTheme();
    drawRoundRect(levelX, panelY, panelW, panelH, 12, theme.panel, "rgba(255,255,255,0.84)", 3);
    drawRoundRect(candyX, panelY, panelW, panelH, 12, theme.panel, "rgba(255,255,255,0.84)", 3);
    drawRoundRect(scoreX, panelY, panelW, panelH, 12, theme.panel, "rgba(255,255,255,0.84)", 3);
    drawLearningReportButton(reportX, panelY, panelW, panelH);

    ctx.fillStyle = "#24313a";
    ctx.font = "900 28px Arial, Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Jar: " + (state.currentJarIndex + 1) + "/" + JAR_THEME_ORDER.length, levelX + panelW / 2, 54);
    ctx.fillText("Candy: " + state.drops.length + "/" + currentJarCapacity(), candyX + panelW / 2, 54);
    ctx.fillText("Score: " + state.score, scoreX + panelW / 2, 54);
    drawJarProgressHud();

    drawJarShelf();
  }

  function drawHeartShape(cx, cy, size, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(size / 32, size / 32);
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.bezierCurveTo(-30, -10, -16, -32, 0, -16);
    ctx.bezierCurveTo(16, -32, 30, -10, 0, 10);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function bottleIndexForJar(jarNumber) {
    var jarThemes = state.jarThemeOrder || JAR_THEME_ORDER;
    var themeId = jarThemes[jarNumber] || state.selectedThemeId;
    return bottleAssignment[themeId] == null ? 0 : bottleAssignment[themeId];
  }

  function completedJarForTheme(themeId) {
    for (var i = 0; i < state.completedJars.length; i += 1) {
      if (state.completedJars[i].themeId === themeId) return state.completedJars[i];
    }
    return null;
  }

  function drawLockShape(cx, cy, size, progress) {
    var unlockProgress = progress == null ? 0 : progress;
    var shackleLift = size * 0.18 * unlockProgress;
    var shackleRotate = -0.34 * unlockProgress;
    ctx.save();
    ctx.translate(cx, cy - shackleLift);
    ctx.rotate(shackleRotate);
    ctx.lineWidth = Math.max(3, size * 0.1);
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.94)";
    ctx.beginPath();
    ctx.arc(0, -size * 0.06, size * 0.31, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy + size * 0.16 + size * 0.05 * unlockProgress);
    ctx.rotate(0.08 * unlockProgress);
    drawRoundRect(-size * 0.42, -size * 0.26, size * 0.84, size * 0.54, size * 0.1, "rgba(255, 255, 255, 0.95)", "rgba(118, 94, 66, 0.28)", 2);
    ctx.fillStyle = "rgba(102, 80, 55, 0.74)";
    ctx.beginPath();
    ctx.arc(0, -size * 0.04, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-size * 0.035, size * 0.02, size * 0.07, size * 0.17);
    ctx.restore();
  }

  function drawLockedJarOverlay(slot, index, themeId) {
    var animation = state.unlockAnimation && state.unlockAnimation.themeId === themeId ? state.unlockAnimation : null;
    var progress = 0;
    if (animation) {
      progress = clamp((Date.now() - animation.startedAt) / animation.duration, 0, 1);
    }
    var alpha = animation ? 1 - easeOutCubic(progress) : 1;
    if (alpha <= 0.02) return;

    ctx.save();
    ctx.globalAlpha = alpha;
    drawRoundRect(slot.x + 2, slot.y + 1, slot.w - 4, slot.h - 2, 16, "rgba(87, 74, 67, 0.48)", null, 0);
    ctx.filter = "grayscale(45%)";
    ctx.globalAlpha = 0.26 * alpha;
    drawContain(jarImageForTheme(themeId), slot.x, slot.y, slot.w, slot.h);
    ctx.filter = "none";
    ctx.globalAlpha = alpha;
    drawLockShape(slot.x + slot.w / 2, slot.y + slot.h * 0.48, Math.min(slot.w, slot.h) * 0.46, progress);
    if (animation) {
      var burst = easeOutCubic(progress);
      ctx.globalAlpha = (1 - progress) * 0.9;
      for (var s = 0; s < 8; s += 1) {
        var angle = (Math.PI * 2 / 8) * s;
        var sx = slot.x + slot.w / 2 + Math.cos(angle) * (18 + burst * 34);
        var sy = slot.y + slot.h * 0.46 + Math.sin(angle) * (14 + burst * 26);
        drawTinyStar(sx, sy, 7 + 5 * (1 - progress), "#fff2a8", "#ffffff");
      }
    }
    ctx.restore();
  }

  function shelfSlotAt(index, baseX, baseY) {
    var col = index % 2;
    var row = Math.floor(index / 2);
    return {
      x: baseX + 24 + col * 106,
      y: baseY + 48 + row * 138,
      w: SHELF_JAR_W,
      h: SHELF_JAR_H
    };
  }

  function shelfSlot(index) {
    return shelfSlotAt(index, SHELF_X, SHELF_Y);
  }

  function clipJarInterior(jarX, jarY, scale) {
    scale = scale || 1;
    var cx = jarX + 174 * scale;
    var cy = jarY + 250 * scale;
    var rx = 142 * scale;
    var ry = 136 * scale;
    var ox = rx * 0.5522848;
    var oy = ry * 0.5522848;
    ctx.beginPath();
    ctx.moveTo(cx - rx, cy);
    ctx.bezierCurveTo(cx - rx, cy - oy, cx - ox, cy - ry, cx, cy - ry);
    ctx.bezierCurveTo(cx + ox, cy - ry, cx + rx, cy - oy, cx + rx, cy);
    ctx.bezierCurveTo(cx + rx, cy + oy, cx + ox, cy + ry, cx, cy + ry);
    ctx.bezierCurveTo(cx - ox, cy + ry, cx - rx, cy + oy, cx - rx, cy);
    ctx.closePath();
    ctx.clip();
  }

  function candySlot(index, capacityOverride) {
    var slots = [
      { x: 112, y: 315 }, { x: 146, y: 309 }, { x: 178, y: 316 }, { x: 210, y: 309 }, { x: 242, y: 315 },
      { x: 96, y: 282 }, { x: 128, y: 274 }, { x: 160, y: 282 }, { x: 192, y: 274 }, { x: 224, y: 282 }, { x: 252, y: 276 },
      { x: 108, y: 244 }, { x: 144, y: 236 }, { x: 178, y: 244 }, { x: 212, y: 236 }, { x: 246, y: 244 },
      { x: 114, y: 205 }, { x: 148, y: 197 }, { x: 182, y: 205 }, { x: 216, y: 197 }, { x: 248, y: 205 },
      { x: 112, y: 169 }, { x: 146, y: 161 }, { x: 180, y: 169 }, { x: 214, y: 161 }, { x: 246, y: 169 },
      { x: 130, y: 144 }, { x: 164, y: 136 }, { x: 198, y: 144 }, { x: 232, y: 136 }
    ];
    return slots[index % slots.length];
  }

  function candyJarInteriorRect(jar, localW, localH) {
    var rect = containRect(jar, 0, 0, localW, localH);
    var wide = rect.w / Math.max(1, rect.h);
    var insetX = wide > 1.16 ? rect.w * 0.2 : rect.w * 0.22;
    var top = rect.y + rect.h * (wide > 1.16 ? 0.34 : 0.25);
    var bottom = rect.y + rect.h * (wide > 1.16 ? 0.78 : 0.85);
    return {
      x: rect.x + insetX,
      y: top,
      w: Math.max(1, rect.w - insetX * 2),
      h: Math.max(1, bottom - top),
      wide: wide > 1.16
    };
  }

  function safeCandyDrop(drop, jar, localW, localH) {
    var size = drop.size || 72;
    var base = candyJarInteriorRect(jar, localW || 348, localH || 348);
    var margin = Math.max(8, size * (base.wide ? 0.28 : 0.36) * ((localW || 348) / 348));
    var sourceX = clamp(drop.x, 84, 266);
    var sourceY = clamp(drop.y, 134, 326);
    var xRatio = (sourceX - 84) / 182;
    var yRatio = (sourceY - 134) / 192;
    return {
      candyIndex: drop.candyIndex,
      x: clamp(base.x + base.w * xRatio, base.x + margin, base.x + base.w - margin),
      y: clamp(base.y + base.h * yRatio, base.y + margin * 0.4, base.y + base.h - margin * 0.3),
      size: size,
      rotate: drop.rotate
    };
  }

  function jarAlphaMask(jar) {
    if (!jar || !jar.width || !jar.height) return null;
    if (jarMaskCache) {
      var cached = jarMaskCache.get(jar);
      if (cached) return cached;
    } else if (jar._alphaMask) {
      return jar._alphaMask;
    }

    var mask = document.createElement("canvas");
    mask.width = jar.naturalWidth || jar.width;
    mask.height = jar.naturalHeight || jar.height;

    try {
      var maskCtx = mask.getContext("2d");
      maskCtx.drawImage(jar, 0, 0, mask.width, mask.height);
      var pixels = maskCtx.getImageData(0, 0, mask.width, mask.height);
      var data = pixels.data;
      for (var i = 0; i < data.length; i += 4) {
        var insideJar = data[i + 3] > 16;
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = insideJar ? 255 : 0;
      }
      maskCtx.putImageData(pixels, 0, 0);
    } catch (error) {
      mask = jar;
    }

    if (jarMaskCache) {
      jarMaskCache.set(jar, mask);
    } else {
      jar._alphaMask = mask;
    }
    return mask;
  }

  function drawDropsWithJarMask(jar, jarX, jarY, jarW, jarH, drops) {
    if (!jarDropCanvas) {
      jarDropCanvas = document.createElement("canvas");
    }

    var localW = Math.max(1, Math.ceil(jarW));
    var localH = Math.max(1, Math.ceil(jarH));
    if (jarDropCanvas.width !== localW || jarDropCanvas.height !== localH) {
      jarDropCanvas.width = localW;
      jarDropCanvas.height = localH;
    }

    var dropCtx = jarDropCanvas.getContext("2d");
    dropCtx.clearRect(0, 0, localW, localH);

    var scale = localW / 348;
    var isShelfJar = jarW <= SHELF_JAR_W + 4;
    for (var i = 0; i < drops.length; i += 1) {
      var drop = safeCandyDrop(drops[i], jar, localW, localH);
      var candy = assets.candies[drop.candyIndex];
      var size = drop.size * scale;
      var drawX = drop.x;
      var drawY = drop.y;
      if (isShelfJar) {
        size *= 1.12;
        drawX = localW * 0.5 + (drawX - localW * 0.5) * 0.86;
        drawY = localH * 0.53 + (drawY - localH * 0.53) * 0.9;
      }
      dropCtx.save();
      dropCtx.translate(drawX, drawY);
      dropCtx.rotate(drop.rotate);
      if (candy) {
        drawContainOn(dropCtx, candy, -size / 2, -size / 2, size, size);
      }
      dropCtx.restore();
    }

    var mask = jarAlphaMask(jar);
    if (mask) {
      dropCtx.globalCompositeOperation = "destination-in";
      drawContainOn(dropCtx, mask, 0, 0, localW, localH);
      dropCtx.globalCompositeOperation = "source-over";
    }

    ctx.drawImage(jarDropCanvas, jarX, jarY, jarW, jarH);
  }

  function drawJarWithDrops(jarX, jarY, jarW, jarH, bottleIndex, drops, jarImage) {
    bottleIndex = Math.max(0, bottleIndex);
    var jar = jarImage || assets.bottles[bottleIndex];
    var scale = jarW / 348;

    drawContain(jar, jarX, jarY, jarW, jarH);

    if (jar) {
      drawDropsWithJarMask(jar, jarX, jarY, jarW, jarH, drops);
    } else {
      ctx.save();
      clipJarInterior(jarX, jarY, scale);
      for (var i = 0; i < drops.length; i += 1) {
        var drop = safeCandyDrop(drops[i], null, jarW, jarH);
        var candy = assets.candies[drop.candyIndex];
        var size = drop.size * scale;
        ctx.save();
        ctx.translate(jarX + drop.x, jarY + drop.y);
        ctx.rotate(drop.rotate);
        if (candy) {
          drawContain(candy, -size / 2, -size / 2, size, size);
        }
        ctx.restore();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = 0.28;
    drawContain(jar, jarX, jarY, jarW, jarH);
    ctx.restore();
  }

  function drawJarHands(jarX, jarY, jarW, jarH) {
    if (!assets.hands) return;
    var leftHand = assets.hands.left;
    var rightHand = assets.hands.right;
    if (!leftHand && !rightHand) return;

    var sizeRatio = jarW / CATCH_JAR_W;
    var alpha = clamp((sizeRatio - 0.42) / 0.48, 0, 1);
    if (alpha <= 0) return;

    var handH = jarH * 1.18;
    var handY = jarY + jarH * 0.18;

    ctx.save();
    ctx.globalAlpha = alpha;

    if (leftHand) {
      var leftW = leftHand.width / leftHand.height * handH;
      ctx.drawImage(leftHand, jarX - leftW * 0.5, handY, leftW, handH);
    }
    if (rightHand) {
      var rightW = rightHand.width / rightHand.height * handH;
      ctx.drawImage(rightHand, jarX + jarW - rightW * 0.5, handY, rightW, handH);
    }

    ctx.restore();
  }

  function drawHeldJarWithDrops(jarX, jarY, jarW, jarH, bottleIndex, drops) {
    drawJarHands(jarX, jarY, jarW, jarH);
    drawJarWithDrops(jarX, jarY, jarW, jarH, bottleIndex, drops, currentJarImage());
  }

  function drawTinyStar(cx, cy, radius, fillStyle, strokeStyle) {
    ctx.beginPath();
    for (var i = 0; i < 10; i += 1) {
      var angle = -Math.PI / 2 + i * Math.PI / 5;
      var r = i % 2 === 0 ? radius : radius * 0.45;
      var x = cx + Math.cos(angle) * r;
      var y = cy + Math.sin(angle) * r;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    if (strokeStyle) {
      ctx.lineWidth = Math.max(1, radius * 0.18);
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    }
  }

  function drawSparkShelfJarDecorations(slot, index) {
    var jar = assets.bottles[bottleIndexForJar(index)];
    var rect = containRect(jar, slot.x, slot.y, slot.w, slot.h);
    var x = rect.x;
    var y = rect.y;
    var w = rect.w;
    var h = rect.h;
    var cx = x + w / 2;
    var theme = index % 6;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    function drawDot(px, py, radius, fillStyle, strokeStyle) {
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2, false);
      ctx.fillStyle = fillStyle;
      ctx.fill();
      if (strokeStyle) {
        ctx.lineWidth = Math.max(1, radius * 0.22);
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
      }
    }

    function drawSparkle(px, py, size, fillStyle) {
      ctx.beginPath();
      ctx.moveTo(px, py - size);
      ctx.lineTo(px + size * 0.24, py - size * 0.24);
      ctx.lineTo(px + size, py);
      ctx.lineTo(px + size * 0.24, py + size * 0.24);
      ctx.lineTo(px, py + size);
      ctx.lineTo(px - size * 0.24, py + size * 0.24);
      ctx.lineTo(px - size, py);
      ctx.lineTo(px - size * 0.24, py - size * 0.24);
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.92)";
      ctx.lineWidth = Math.max(1, size * 0.12);
      ctx.stroke();
    }

    function drawTiltLabel(px, py, labelW, labelH, angle, fillStyle, strokeStyle) {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);
      drawRoundRect(-labelW / 2, -labelH / 2, labelW, labelH, Math.max(3, labelH * 0.28), fillStyle, strokeStyle, Math.max(1.2, labelH * 0.12));
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = Math.max(1, labelH * 0.08);
      ctx.beginPath();
      ctx.moveTo(-labelW * 0.28, 0);
      ctx.lineTo(labelW * 0.28, 0);
      ctx.stroke();
      ctx.restore();
    }

    function drawOrbit(px, py, rx, ry, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1.6, Math.min(w, h) * 0.04);
      ctx.beginPath();
      ctx.ellipse(px, py, rx, ry, -0.22, Math.PI * 0.04, Math.PI * 1.58, false);
      ctx.stroke();
      drawDot(px + rx * 0.72, py - ry * 0.55, Math.max(2, Math.min(w, h) * 0.05), "#ffffff", color);
    }

    function drawFlightTrail(px, py, trailW, trailH, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1.8, Math.min(w, h) * 0.045);
      ctx.beginPath();
      ctx.moveTo(px - trailW * 0.5, py + trailH * 0.2);
      ctx.bezierCurveTo(px - trailW * 0.16, py - trailH * 0.38, px + trailW * 0.18, py + trailH * 0.36, px + trailW * 0.5, py - trailH * 0.2);
      ctx.stroke();
      ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.026);
      ctx.strokeStyle = "rgba(255,255,255,0.72)";
      ctx.beginPath();
      ctx.moveTo(px - trailW * 0.38, py + trailH * 0.24);
      ctx.bezierCurveTo(px - trailW * 0.1, py - trailH * 0.08, px + trailW * 0.1, py + trailH * 0.16, px + trailW * 0.34, py - trailH * 0.08);
      ctx.stroke();
    }

    if (theme === 0) {
      drawTiltLabel(cx, y + h * 0.5, w * 0.44, h * 0.16, -0.08, "rgba(100, 200, 255, 0.78)", "rgba(255,255,255,0.94)");
      drawSparkle(x + w * 0.68, y + h * 0.36, Math.min(w, h) * 0.08, "#ffd44f");
      drawDot(x + w * 0.32, y + h * 0.38, Math.min(w, h) * 0.035, "#65d59a", "rgba(255,255,255,0.88)");
    } else if (theme === 1) {
      drawOrbit(cx, y + h * 0.55, w * 0.3, h * 0.16, "rgba(63, 156, 211, 0.9)");
      drawSparkle(x + w * 0.32, y + h * 0.42, Math.min(w, h) * 0.07, "#ffd44f");
    } else if (theme === 2) {
      drawTiltLabel(cx, y + h * 0.52, w * 0.38, h * 0.14, 0.08, "rgba(255, 212, 79, 0.76)", "rgba(255,255,255,0.94)");
      drawDot(x + w * 0.67, y + h * 0.43, Math.min(w, h) * 0.045, "#64c8ff", "rgba(255,255,255,0.92)");
      drawDot(x + w * 0.72, y + h * 0.52, Math.min(w, h) * 0.03, "#65d59a", "rgba(255,255,255,0.88)");
    } else if (theme === 3) {
      drawSparkle(cx, y + h * 0.5, Math.min(w, h) * 0.1, "#64c8ff");
      drawDot(x + w * 0.35, y + h * 0.43, Math.min(w, h) * 0.035, "#ffd44f", "rgba(255,255,255,0.88)");
      drawDot(x + w * 0.66, y + h * 0.6, Math.min(w, h) * 0.032, "#65d59a", "rgba(255,255,255,0.88)");
    } else if (theme === 4) {
      drawDot(x + w * 0.36, y + h * 0.5, Math.min(w, h) * 0.05, "rgba(100, 200, 255, 0.72)", "rgba(255,255,255,0.92)");
      drawDot(x + w * 0.5, y + h * 0.42, Math.min(w, h) * 0.04, "rgba(255, 212, 79, 0.74)", "rgba(255,255,255,0.92)");
      drawDot(x + w * 0.62, y + h * 0.54, Math.min(w, h) * 0.035, "rgba(101, 213, 154, 0.76)", "rgba(255,255,255,0.9)");
      drawSparkle(x + w * 0.68, y + h * 0.36, Math.min(w, h) * 0.06, "#ffffff");
    } else {
      drawFlightTrail(cx, y + h * 0.52, w * 0.62, h * 0.34, "rgba(63, 156, 211, 0.88)");
      drawSparkle(x + w * 0.38, y + h * 0.38, Math.min(w, h) * 0.065, "#ffd44f");
      drawDot(x + w * 0.68, y + h * 0.48, Math.min(w, h) * 0.032, "#65d59a", "rgba(255,255,255,0.88)");
    }

    ctx.restore();
  }

  function drawShelfJarDecorations(slot, index) {
    var x = slot.x;
    var y = slot.y;
    var w = slot.w;
    var h = slot.h;
    var cx = x + w / 2;
    var theme = index % 6;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    function drawPearls(count, startX, endX, baseY, dip, radius, fillStyle) {
      for (var p = 0; p < count; p += 1) {
        var t = count === 1 ? 0.5 : p / (count - 1);
        var px = startX + (endX - startX) * t;
        var py = baseY + Math.sin(t * Math.PI) * dip;
        var pearlGradient = ctx.createRadialGradient(px - radius * 0.42, py - radius * 0.45, radius * 0.18, px, py, radius);
        pearlGradient.addColorStop(0, "#ffffff");
        pearlGradient.addColorStop(0.45, fillStyle || "#fff7df");
        pearlGradient.addColorStop(1, "#e6b8ca");
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2, false);
        ctx.fillStyle = pearlGradient;
        ctx.fill();
        ctx.strokeStyle = "rgba(214, 157, 179, 0.92)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px - radius * 0.34, py - radius * 0.38, radius * 0.22, 0, Math.PI * 2, false);
        ctx.fillStyle = "rgba(255,255,255,0.72)";
        ctx.fill();
      }
    }

    function drawCharmTag(px, py, tagW, tagH, color, angle) {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);
      ctx.shadowColor = "rgba(98, 68, 43, 0.24)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      var tagGradient = ctx.createLinearGradient(-tagW * 0.35, -tagH * 0.48, tagW * 0.45, tagH * 0.48);
      tagGradient.addColorStop(0, "rgba(255,255,255,0.82)");
      tagGradient.addColorStop(0.18, color);
      tagGradient.addColorStop(1, "rgba(70, 145, 204, 0.62)");
      ctx.beginPath();
      ctx.moveTo(-tagW * 0.34, -tagH * 0.5);
      ctx.lineTo(tagW * 0.34, -tagH * 0.42);
      ctx.lineTo(tagW * 0.46, tagH * 0.46);
      ctx.lineTo(-tagW * 0.42, tagH * 0.5);
      ctx.closePath();
      ctx.fillStyle = tagGradient;
      ctx.fill();
      ctx.shadowColor = "rgba(0,0,0,0)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      ctx.lineWidth = Math.max(1.4, w * 0.026);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.62)";
      ctx.lineWidth = Math.max(1, w * 0.014);
      ctx.beginPath();
      ctx.moveTo(-tagW * 0.2, -tagH * 0.28);
      ctx.lineTo(tagW * 0.24, tagH * 0.28);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-tagW * 0.14, -tagH * 0.33, tagW * 0.08, 0, Math.PI * 2, false);
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.fill();
      drawTinyStar(tagW * 0.06, tagH * 0.08, tagW * 0.13, "rgba(255,255,255,0.92)", null);
      ctx.restore();
    }

    function drawHangingLine(fromX, fromY, toX, toY, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2.2, w * 0.035);
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.bezierCurveTo(fromX, fromY + h * 0.08, toX, toY - h * 0.08, toX, toY);
      ctx.stroke();
    }

    function drawGem(px, py, radius, color) {
      var gemGradient = ctx.createRadialGradient(px - radius * 0.4, py - radius * 0.45, radius * 0.12, px, py, radius);
      gemGradient.addColorStop(0, "#ffffff");
      gemGradient.addColorStop(0.38, color);
      gemGradient.addColorStop(1, "rgba(151, 92, 128, 0.82)");
      ctx.save();
      ctx.shadowColor = "rgba(82, 58, 47, 0.22)";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2, false);
      ctx.fillStyle = gemGradient;
      ctx.fill();
      ctx.shadowColor = "rgba(0,0,0,0)";
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = Math.max(1.2, radius * 0.28);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px - radius * 0.32, py - radius * 0.36, radius * 0.2, 0, Math.PI * 2, false);
      ctx.fillStyle = "rgba(255,255,255,0.78)";
      ctx.fill();
      ctx.restore();
    }

    if (theme === 0) {
      drawPearls(7, x + w * 0.22, x + w * 0.78, y + h * 0.31, h * 0.055, w * 0.046, "#fff7df");
      drawGem(cx, y + h * 0.52, w * 0.075, "#ffcf57");
    } else if (theme === 1) {
      ctx.strokeStyle = "rgba(255, 245, 196, 0.98)";
      ctx.lineWidth = Math.max(3, w * 0.042);
      ctx.beginPath();
      ctx.arc(cx - w * 0.04, y + h * 0.49, w * 0.22, Math.PI * 0.2, Math.PI * 1.5, false);
      ctx.stroke();
      drawTinyStar(x + w * 0.69, y + h * 0.36, w * 0.1, "#ffcf57", "#ffffff");
      drawGem(x + w * 0.36, y + h * 0.63, w * 0.052, "#7ec8ff");
    } else if (theme === 2) {
      drawHangingLine(x + w * 0.53, y + h * 0.27, x + w * 0.63, y + h * 0.45, "rgba(255, 226, 188, 0.95)");
      drawCharmTag(x + w * 0.67, y + h * 0.56, w * 0.28, h * 0.32, "rgba(126, 200, 255, 0.82)", -0.14);
      drawTinyStar(x + w * 0.36, y + h * 0.54, w * 0.07, "#ffcf57", "#ffffff");
    } else if (theme === 3) {
      ctx.strokeStyle = "rgba(255, 245, 196, 0.98)";
      ctx.lineWidth = Math.max(3, w * 0.04);
      ctx.beginPath();
      ctx.moveTo(x + w * 0.28, y + h * 0.44);
      ctx.bezierCurveTo(x + w * 0.42, y + h * 0.58, x + w * 0.58, y + h * 0.58, x + w * 0.72, y + h * 0.44);
      ctx.stroke();
      drawGem(cx, y + h * 0.58, w * 0.085, "#ffcf57");
      drawTinyStar(x + w * 0.7, y + h * 0.35, w * 0.055, "#fff7df", "#ffcf57");
    } else if (theme === 4) {
      ctx.strokeStyle = "rgba(238, 166, 204, 0.98)";
      ctx.lineWidth = Math.max(3, w * 0.046);
      ctx.beginPath();
      ctx.moveTo(x + w * 0.25, y + h * 0.39);
      ctx.lineTo(x + w * 0.75, y + h * 0.39);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, y + h * 0.39);
      ctx.lineTo(cx - w * 0.13, y + h * 0.29);
      ctx.lineTo(cx - w * 0.04, y + h * 0.45);
      ctx.moveTo(cx, y + h * 0.39);
      ctx.lineTo(cx + w * 0.13, y + h * 0.29);
      ctx.lineTo(cx + w * 0.04, y + h * 0.45);
      ctx.stroke();
      drawPearls(4, x + w * 0.31, x + w * 0.69, y + h * 0.66, h * 0.025, w * 0.037, "#fff7df");
    } else {
      drawHangingLine(x + w * 0.42, y + h * 0.28, x + w * 0.38, y + h * 0.45, "rgba(255, 226, 188, 0.95)");
      drawCharmTag(x + w * 0.34, y + h * 0.56, w * 0.24, h * 0.3, "rgba(221, 178, 238, 0.84)", 0.18);
      drawTinyStar(x + w * 0.66, y + h * 0.45, w * 0.1, "#7ec8ff", "#ffffff");
      drawGem(x + w * 0.7, y + h * 0.67, w * 0.05, "#8fdc7d");
    }

    ctx.restore();
  }

  function drawJarShelfAt(baseX, baseY, jars, options) {
    options = options || {};
    jars = jars || [];
    var theme = currentTheme();
    drawRoundRect(baseX, baseY, SHELF_W, SHELF_H, 14, "rgba(139, 89, 43, 0.9)", theme.shelfDark, 4);
    ctx.fillStyle = "#a86833";
    ctx.fillRect(baseX + 15, baseY + 28, 18, SHELF_H - 56);
    ctx.fillRect(baseX + SHELF_W - 33, baseY + 28, 18, SHELF_H - 56);
    for (var shelf = 0; shelf < 3; shelf += 1) {
      var plankY = baseY + 143 + shelf * 138;
      drawRoundRect(baseX + 18, plankY, SHELF_W - 36, 22, 7, theme.shelf, theme.shelfDark, 3);
      ctx.fillStyle = "rgba(255, 226, 170, 0.24)";
      ctx.fillRect(baseX + 28, plankY + 4, SHELF_W - 56, 4);
    }

    var jarThemes = JAR_THEME_ORDER;
    for (var i = 0; i < jarThemes.length; i += 1) {
      var slot = shelfSlotAt(i, baseX, baseY);
      var themeId = jarThemes[i];
      var jarState = completedJarForTheme(themeId);
      var locked = !isThemeUnlocked(themeId) || (options.lockPendingUnlock && themeId === state.pendingThemeUnlockId);
      if (options.hideActive && themeId === state.selectedThemeId) continue;

      if (jarState) {
        drawJarWithDrops(slot.x, slot.y, slot.w, slot.h, jarState.bottleIndex, jarState.drops, jarState.jarImage);
        drawShelfJarDecorations(slot, i);
      } else if (options.activeDrops && options.activeDrops.length && themeId === state.selectedThemeId) {
        drawJarWithDrops(slot.x, slot.y, slot.w, slot.h, bottleIndexForJar(i), options.activeDrops, currentJarImage());
        drawShelfJarDecorations(slot, i);
      } else {
        drawContain(jarImageForTheme(themeId), slot.x, slot.y, slot.w, slot.h);
        drawShelfJarDecorations(slot, i);
      }
      if (locked || (state.unlockAnimation && state.unlockAnimation.themeId === themeId)) {
        drawLockedJarOverlay(slot, i, themeId);
      }
    }
  }

  function drawJarShelf() {
    if (state.shelfShowcase) {
      var elapsed = Date.now() - state.shelfShowcase.startedAt;
      var p = clamp(elapsed / state.shelfShowcase.moveDuration, 0, 1);
      var eased = easeOutCubic(p);
      var centerX = (WIDTH - SHELF_W) / 2;
      var centerY = 170;
      var x = SHELF_X + (centerX - SHELF_X) * eased;
      var y = SHELF_Y + (centerY - SHELF_Y) * eased;
      if (state.shelfShowcase.unlockThemeId && elapsed >= state.shelfShowcase.unlockDelay) {
        if (!state.shelfShowcase.unlockSoundPlayed) {
          playUnlockSound();
          state.shelfShowcase.unlockSoundPlayed = true;
          state.unlockAnimation = {
            themeId: state.shelfShowcase.unlockThemeId,
            startedAt: Date.now(),
            duration: state.shelfShowcase.unlockDuration
          };
        }
      }
      drawJarShelfAt(x, y, state.shelfShowcase.jars, {
        lockPendingUnlock: state.shelfShowcase.lockPendingUnlock
      });
      return;
    }

    drawJarShelfAt(SHELF_X, SHELF_Y, state.completedJars, {
      activeDrops: state.drops,
      hideActive: !!(state.jarIntro || state.jarCeremony || state.jarReturn || state.jarOnField)
    });
  }

  function drawJar() {
    var bottleIndex = bottleIndexForJar(state.currentJarIndex);
    var jarX = state.jarX;
    var jarY = CATCH_JAR_Y;
    var jarW = CATCH_JAR_W;
    var jarH = CATCH_JAR_H;

    drawHeldJarWithDrops(jarX, jarY, jarW, jarH, bottleIndex, state.drops);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function drawJarIntro() {
    if (!state.jarIntro) return;
    var from = shelfSlot(JAR_THEME_ORDER.indexOf(state.selectedThemeId));
    var elapsed = Date.now() - state.jarIntro.startedAt;
    var p = clamp(elapsed / state.jarIntro.duration, 0, 1);
    var eased = easeOutCubic(p);
    var toX = state.jarX;
    var toY = CATCH_JAR_Y;
    var x = from.x + (toX - from.x) * eased;
    var y = from.y + (toY - from.y) * eased;
    var w = from.w + (CATCH_JAR_W - from.w) * eased;
    var h = from.h + (CATCH_JAR_H - from.h) * eased;
    drawHeldJarWithDrops(x, y, w, h, bottleIndexForJar(state.currentJarIndex), state.drops);
  }

  function drawJarReturn() {
    if (!state.jarReturn) return;
    var to = shelfSlot(JAR_THEME_ORDER.indexOf(state.selectedThemeId));
    var elapsed = Date.now() - state.jarReturn.startedAt;
    var p = clamp(elapsed / state.jarReturn.duration, 0, 1);
    var eased = easeOutCubic(p);
    var fromX = state.jarReturn.fromX;
    var fromY = CATCH_JAR_Y;
    var x = fromX + (to.x - fromX) * eased;
    var y = fromY + (to.y - fromY) * eased;
    var w = CATCH_JAR_W + (to.w - CATCH_JAR_W) * eased;
    var h = CATCH_JAR_H + (to.h - CATCH_JAR_H) * eased;
    drawHeldJarWithDrops(x, y, w, h, bottleIndexForJar(state.currentJarIndex), state.drops);
  }

  function drawJarSparkle(cx, cy, size, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.23, -size * 0.23);
    ctx.lineTo(size, 0);
    ctx.lineTo(size * 0.23, size * 0.23);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.23, size * 0.23);
    ctx.lineTo(-size, 0);
    ctx.lineTo(-size * 0.23, -size * 0.23);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawJarCeremony() {
    if (!state.jarCeremony) return;
    var elapsed = Date.now() - state.jarCeremony.startedAt;
    var returnStart = 1160;
    var returnDuration = 900;
    var jarX = 626;
    var jarY = 272;
    var jarW = 348;
    var jarH = 384;

    ctx.save();
    ctx.fillStyle = "rgba(225, 229, 233, 0.54)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawRoundRect(438, 158, 724, 560, 18, "rgba(255, 248, 225, 0.9)", "rgba(255,255,255,0.9)", 4);
    drawJarSparkle(532, 248, 28, "#ffcf57");
    drawJarSparkle(1086, 260, 24, "#ff8f70");
    drawJarSparkle(1038, 636, 18, "#8fdc7d");

    if (elapsed >= returnStart) {
      var slot = shelfSlot(JAR_THEME_ORDER.indexOf(state.selectedThemeId));
      var p = clamp((elapsed - returnStart) / returnDuration, 0, 1);
      var eased = easeOutCubic(p);
      jarX = jarX + (slot.x - jarX) * eased;
      jarY = jarY + (slot.y - jarY) * eased;
      jarW = jarW + (slot.w - jarW) * eased;
      jarH = jarH + (slot.h - jarH) * eased;
    }

    drawHeldJarWithDrops(jarX, jarY, jarW, jarH, state.jarCeremony.bottleIndex, state.jarCeremony.drops);
    ctx.restore();
  }

  function fitText(text, x, y, maxWidth, fontSize) {
    var size = fontSize;
    do {
      ctx.font = "900 " + size + "px Arial, Microsoft YaHei";
      if (ctx.measureText(text).width <= maxWidth) break;
      size -= 2;
    } while (size > 22);
    ctx.fillText(text, x, y);
  }

  function drawFallingCandies() {
    for (var i = 0; i < state.fallingCandies.length; i += 1) {
      var item = state.fallingCandies[i];
      var candy = assets.candies[item.candyIndex];
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotate);
      drawContain(candy, -item.size / 2, -item.size / 2, item.size, item.size);
      ctx.restore();

      drawRoundRect(item.x - 92, item.y + item.size / 2 - 6, 184, 48, 9, "rgba(255, 248, 225, 0.94)", "rgba(255,255,255,0.86)", 2);
      ctx.fillStyle = "#24313a";
      ctx.font = "900 28px Arial, Microsoft YaHei";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      fitText(item.word, item.x, item.y + item.size / 2 + 18, 166, 28);
    }
  }

  function drawLoading() {
    var progress = imageCount ? loadedImages / imageCount : 0;
    var now = Date.now();
    var centerX = WIDTH / 2;
    var centerY = 438;
    var candyIndexes = [0, 1, 2, 3, 4];
    var theme = currentTheme();

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#24313a";
    ctx.font = "900 44px Arial, Microsoft YaHei";
    ctx.fillText("Loading...", centerX, 558);

    for (var i = 0; i < candyIndexes.length; i += 1) {
      var angle = now / 520 + i * Math.PI * 2 / candyIndexes.length;
      var x = centerX + Math.cos(angle) * 142;
      var y = centerY + Math.sin(angle) * 36;
      var size = 78 + Math.sin(now / 240 + i) * 10;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle * 0.45);
      drawContain(assets.candies[candyIndexes[i]], -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    drawRoundRect(530, 628, 540, 34, 15, "rgba(255, 255, 255, 0.72)", "rgba(255,255,255,0.86)", 3);
    drawRoundRect(530, 628, 540 * progress, 34, 15, theme.accent, null, 0);
    ctx.fillStyle = "#24313a";
    ctx.font = "900 24px Arial, Microsoft YaHei";
    ctx.fillText(Math.round(progress * 100) + "%", centerX, 646);
    ctx.restore();
  }

  function drawLevelComplete() {
    ctx.fillStyle = "rgba(225, 229, 233, 0.58)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    drawRoundRect(490, 178, 620, 250, 22, "rgba(255, 248, 225, 0.95)", "rgba(255,255,255,0.92)", 5);
    drawRoundRect(540, 386, 520, 18, 9, "rgba(255, 207, 87, 0.42)", null, 0);
    drawRoundRect(592, 386, 120, 18, 9, "rgba(255, 143, 112, 0.42)", null, 0);
    drawRoundRect(820, 386, 140, 18, 9, "rgba(126, 200, 255, 0.38)", null, 0);
    drawJarSparkle(548, 224, 18, "#ffcf57");
    drawJarSparkle(1052, 224, 17, "#ff8f70");
    drawJarSparkle(548, 382, 13, "#8fdc7d");
    drawJarSparkle(1052, 382, 13, "#7ec8ff");

    ctx.fillStyle = "#24313a";
    ctx.font = "900 48px Arial, Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Score: " + state.score, 800, 303);
  }

  function drawFinal() {
    drawOverlay(state.message, "Final Score: " + state.score);
  }

  function drawArrowHead(x, y, angle, size) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(angle - 0.65) * size, y - Math.sin(angle - 0.65) * size);
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(angle + 0.65) * size, y - Math.sin(angle + 0.65) * size);
    ctx.stroke();
  }

  function drawOverlayButtonIcon(type, x, y, w, h, enabled) {
    var cx = x + w / 2;
    var cy = y + h / 2;
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.globalAlpha = enabled ? 1 : 0.52;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (type === "prev" || type === "next") {
      var dir = type === "prev" ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(cx - dir * 30, cy);
      ctx.lineTo(cx + dir * 30, cy);
      ctx.stroke();
      drawArrowHead(cx + dir * 30, cy, dir > 0 ? 0 : Math.PI, 18);
    } else if (type === "retry") {
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx - 36, cy - 13);
      ctx.lineTo(cx + 34, cy - 13);
      ctx.stroke();
      drawArrowHead(cx + 34, cy - 13, 0, 18);
      ctx.beginPath();
      ctx.moveTo(cx + 36, cy + 15);
      ctx.lineTo(cx - 34, cy + 15);
      ctx.stroke();
      drawArrowHead(cx - 34, cy + 15, Math.PI, 18);
    } else if (type === "end" || type === "reportEnd") {
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy - 12);
      ctx.lineTo(cx + 12, cy + 12);
      ctx.moveTo(cx + 12, cy - 12);
      ctx.lineTo(cx - 12, cy + 12);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWrappedText(text, x, y, maxWidth, lineHeight, maxLines) {
    var words = text.split(" ");
    var line = "";
    var lines = 0;
    for (var i = 0; i < words.length; i += 1) {
      var testLine = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, y + lines * lineHeight);
        lines += 1;
        line = words[i];
        if (maxLines && lines >= maxLines) return;
      } else {
        line = testLine;
      }
    }
    if (line && (!maxLines || lines < maxLines)) {
      ctx.fillText(line, x, y + lines * lineHeight);
    }
  }

  function buildReportWordLines(text, maxWidth) {
    var words = text === "None" ? [text] : text.split("\u3001");
    var line = "";
    var lines = [];
    for (var i = 0; i < words.length; i += 1) {
      var word = words[i];
      var piece = word + (i < words.length - 1 ? "\u3001" : "");
      var testLine = line ? line + piece : piece;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = piece;
      } else {
        line = testLine;
      }
    }
    if (line) {
      lines.push(line);
    }
    return lines;
  }

  function drawReportWordsInline(text, x, y, maxWidth, lineHeight, maxLines, scrollY) {
    var lines = buildReportWordLines(text, maxWidth);
    var start = Math.max(0, Math.floor((scrollY || 0) / lineHeight) - 1);
    var end = maxLines ? Math.min(lines.length, start + maxLines + 3) : lines.length;
    for (var i = start; i < end; i += 1) {
      ctx.fillText(lines[i], x, y + i * lineHeight - (scrollY || 0));
    }
    return lines.length * lineHeight;
  }

  function drawReportList(title, words, x, y, w, h, color, options) {
    options = options || {};
    var scale = Math.max(0.72, Math.min(1, w / 650));
    var text = words.length ? words.join("\u3001") : (options.emptyText || "None");
    var titleGap = 4 * scale;
    var lineHeight = 34 * scale;
    var maxLines = Math.floor(h / lineHeight);
    ctx.fillStyle = "#111111";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = Math.round(25 * scale) + "px Arial, Microsoft YaHei";
    ctx.fillText(title, x, y);
    var wordsX = x + ctx.measureText(title).width + titleGap;
    var wordsWidth = w - (wordsX - x);
    ctx.font = Math.round(26 * scale) + "px Arial, Microsoft YaHei";
    ctx.fillStyle = color;
    if (options.scrollKey === "mastered") {
      var scrollBarWidth = 12 * scale;
      var scrollArea = {
        x: wordsX,
        y: y,
        w: wordsWidth - scrollBarWidth - 4 * scale,
        h: h
      };
      ctx.save();
      ctx.beginPath();
      ctx.rect(scrollArea.x, scrollArea.y, scrollArea.w, scrollArea.h);
      ctx.clip();
      var contentHeight = drawReportWordsInline(text, wordsX, y + 2 * scale, wordsWidth, lineHeight, 0, state.reportScrollY);
      ctx.restore();
      state.reportScrollArea = scrollArea;
      state.reportScrollMax = Math.max(0, contentHeight - scrollArea.h + 8 * scale);
      state.reportScrollY = clamp(state.reportScrollY, 0, state.reportScrollMax);
      if (state.reportScrollMax > 0) {
        var trackX = x + w - scrollBarWidth;
        var trackY = y + 2 * scale;
        var trackH = h - 4 * scale;
        var thumbH = Math.max(34 * scale, trackH * scrollArea.h / contentHeight);
        var thumbY = trackY + (trackH - thumbH) * (state.reportScrollY / state.reportScrollMax);
        drawRoundRect(trackX, trackY, scrollBarWidth, trackH, 5 * scale, "rgba(80, 61, 42, 0.16)", null, 0);
        drawRoundRect(trackX + 2 * scale, thumbY, scrollBarWidth - 4 * scale, thumbH, 4 * scale, "rgba(80, 61, 42, 0.62)", null, 0);
      }
      return;
    }
    drawReportWordsInline(text, wordsX, y + 2 * scale, wordsWidth, lineHeight, maxLines, 0);
  }

  function getSelectedBookLabel() {
    var gradeGroup = getGradeGroupById(state.selectedGradeId);
    var semesters = gradeGroup.semesters && gradeGroup.semesters.length ? gradeGroup.semesters : [{ label: "\u5168\u518c", wordSetId: gradeGroup.wordSetId }];
    var semesterLabel = semesters[0].label;
    for (var i = 0; i < semesters.length; i += 1) {
      if (semesters[i].wordSetId === state.selectedWordSetId) {
        semesterLabel = semesters[i].label;
        break;
      }
    }
    return gradeGroup.id === "grade1_3" ? gradeGroup.label : gradeGroup.label + semesterLabel;
  }

  function drawReportWordCard(x, y, w, h, title, words, accent, emptyText, scrollable, surface) {
    drawRoundRect(x, y, w, h, 28, surface, accent, 2);
    drawRoundRect(x + 1, y + 1, w - 2, 70, 26, "rgba(255, 255, 255, 0.52)", null, 0);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "900 28px Arial, Microsoft YaHei";
    ctx.fillStyle = accent;
    ctx.fillText(title + " (" + words.length + ")", x + 26, y + 38);

    if (!words.length) {
      ctx.font = "800 25px Arial, Microsoft YaHei";
      ctx.fillStyle = "#94897e";
      ctx.fillText("\u65e0", x + 28, y + 112);
      return;
    }

    drawReportList("", words, x + 26, y + 100, w - 52, h - 126, accent, scrollable ? { scrollKey: "mastered", emptyText: emptyText } : { emptyText: emptyText });
  }

  function drawReportFooterButton(type, label, x, y, w, h, fill, shadow, ink) {
    state.buttons.push({ type: type, x: x, y: y, w: w, h: h, enabled: true });
    drawRoundRect(x, y + 8, w, h, 18, shadow, null, 0);
    drawRoundRect(x, y, w, h, 18, fill, "rgba(255, 255, 255, 0.92)", 3);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 29px Arial, Microsoft YaHei";
    ctx.fillStyle = ink;
    ctx.fillText(label, x + w / 2, y + h / 2 + 2);
  }

  function drawReportBackdrop(theme) {
    if (reportBackdropCanvas.width !== WIDTH || reportBackdropCanvas.height !== HEIGHT) {
      reportBackdropCanvas.width = WIDTH;
      reportBackdropCanvas.height = HEIGHT;
    }
    reportBackdropCtx.clearRect(0, 0, WIDTH, HEIGHT);
    reportBackdropCtx.drawImage(canvas, 0, 0, WIDTH, HEIGHT);
    ctx.save();
    ctx.filter = "blur(15px)";
    ctx.drawImage(reportBackdropCanvas, -12, -12, WIDTH + 24, HEIGHT + 24);
    ctx.restore();
    ctx.fillStyle = theme.reportOverlay;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  function drawReport() {
    var theme = currentTheme();
    var panel = { x: 300, y: 82, w: 1000, h: 738 };
    var headerH = 106;
    var cardY = 216;
    var cardW = 447;
    var cardH = 402;
    var leftCardX = panel.x + 40;
    var rightCardX = leftCardX + cardW + 26;
    var footerY = 654;

    drawReportBackdrop(theme);
    drawRoundRect(panel.x, panel.y, panel.w, panel.h, 38, theme.panel, theme.accent, 3);
    drawRoundRect(panel.x + 2, panel.y + 2, panel.w - 4, headerH, 36, "rgba(255, 255, 255, 0.68)", null, 0);
    ctx.fillStyle = "rgba(104, 75, 40, 0.14)";
    ctx.fillRect(panel.x, panel.y + headerH, panel.w, 1);

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = theme.buttonInk;
    ctx.font = "900 38px Arial, Microsoft YaHei";
    ctx.fillText("\u5b66\u4e60\u62a5\u544a", panel.x + 42, panel.y + 43);
    ctx.font = "800 25px Arial, Microsoft YaHei";
    ctx.fillStyle = "#786c5e";
    ctx.fillText("\u5e74\u7ea7\uff1a" + getSelectedBookLabel(), panel.x + 42, panel.y + 86);

    state.reportScrollArea = null;
    drawReportWordCard(leftCardX, cardY, cardW, cardH, "\u672a\u638c\u63e1", state.unmasteredWords, "#df6870", "\u65e0", false, theme.reportCard);
    drawReportWordCard(rightCardX, cardY, cardW, cardH, "\u5df2\u638c\u63e1", state.masteredWords, "#42a98a", "\u65e0", true, theme.reportCard);

    ctx.fillStyle = "rgba(104, 75, 40, 0.14)";
    ctx.fillRect(panel.x, footerY, panel.w, 1);
    if (state.reportReturnPhase) {
      drawReportFooterButton("reportBack", "\u7ee7\u7eed\u6311\u6218", 532, 700, 250, 64, theme.accent, theme.buttonShadow, theme.accentInk);
      drawReportFooterButton("reportReplay", "\u518d\u73a9\u4e00\u6b21", 818, 700, 250, 64, theme.buttonBottom, theme.buttonShadow, theme.buttonInk);
    } else {
      drawReportFooterButton("reportReplay", "\u518d\u73a9\u4e00\u6b21", 675, 700, 250, 64, theme.buttonBottom, theme.buttonShadow, theme.buttonInk);
    }
  }

  function drawOverlay(title, subtitle) {
    ctx.fillStyle = "rgba(225, 229, 233, 0.62)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawRoundRect(500, 285, 600, 300, 16, "rgba(255, 248, 225, 0.94)", "rgba(255,255,255,0.9)", 4);
    ctx.fillStyle = "#24313a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 64px Arial, Microsoft YaHei";
    ctx.fillText(title, 800, 390);
    ctx.font = "900 38px Arial, Microsoft YaHei";
    ctx.fillText(subtitle, 800, 462);
  }

  function addOverlayButton(type, label, x, y, w, h, enabled) {
    var isReportButton = type === "reportBack" || type === "reportReplay" || type === "reportEnd";
    var useCandyTheme = enabled && isReportButton;
    var fill = enabled ? "#ffcf57" : "#d7dde1";
    var stroke = enabled ? "#ffffff" : "#c2c9cf";
    var shadow = enabled ? "#d66b3f" : "#aab3bb";
    var textColor = enabled ? "#24313a" : "#68747e";
    if (useCandyTheme) {
      var theme = currentTheme();
      fill = ctx.createLinearGradient(0, y, 0, y + h);
      fill.addColorStop(0, theme.buttonTop);
      fill.addColorStop(1, theme.buttonBottom);
      shadow = theme.buttonShadow;
      textColor = theme.buttonInk;
    }
    state.buttons.push({ type: type, x: x, y: y, w: w, h: h, enabled: enabled });
    drawRoundRect(x, y + 7, w, h, 12, shadow, null, 0);
    drawRoundRect(x, y, w, h, 12, fill, stroke, 3);
    if (type === "prev" || type === "retry" || type === "next" || type === "end" || type === "reportEnd") {
      drawOverlayButtonIcon(type, x, y, w, h, enabled);
      return;
    }
    ctx.fillStyle = textColor;
    ctx.font = "900 30px Arial, Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + w / 2, y + h / 2);
  }

  function drawMessage() {
    if (!state.message || Date.now() >= state.messageUntil || state.phase !== "playing") return;
    ctx.save();
    ctx.globalAlpha = 0.9;
    drawRoundRect(610, 482, 380, 54, 12, "rgba(255,255,255,0.82)", null, 0);
    ctx.fillStyle = "#24313a";
    ctx.font = "900 30px Arial, Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(state.message, 800, 509);
    ctx.restore();
  }

  function triggerDogCry() {
    state.dogCryStartedAt = Date.now();
  }

  function drawDogCryEffect() {
    if (!assets.dogCry || !state.dogCryStartedAt) return;

    var duration = 550;
    var elapsed = Date.now() - state.dogCryStartedAt;
    if (elapsed >= duration) {
      state.dogCryStartedAt = 0;
      return;
    }

    var progress = elapsed / duration;
    var alpha = 1;
    if (progress < 0.14) {
      alpha = progress / 0.14;
    } else if (progress > 0.72) {
      alpha = (1 - progress) / 0.28;
    }
    alpha = clamp(alpha, 0, 1);

    var appearProgress = clamp(progress / 0.2, 0, 1);
    var scale = 0.88 + easeOutCubic(appearProgress) * 0.12;
    var boxW = 340 * scale;
    var boxH = 410 * scale;
    var x = (WIDTH - boxW) / 2;
    var y = (HEIGHT - boxH) / 2;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = "rgba(73, 47, 31, 0.26)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    drawContain(assets.dogCry, x, y, boxW, boxH);
    ctx.restore();
  }

  function removeWordFromList(list, word) {
    for (var i = list.length - 1; i >= 0; i -= 1) {
      if (list[i] === word) {
        list.splice(i, 1);
      }
    }
  }

  function addUniqueWord(list, word) {
    if (list.indexOf(word) < 0) {
      list.push(word);
    }
  }

  function recordWordResult(word, mastered) {
    if (mastered) {
      if (state.wordStatus[word] === true) return false;
      if (state.wordStatus[word] !== false) {
        state.attemptedCount += 1;
      }
      state.masteredCount += 1;
      state.wordStatus[word] = true;
      removeWordFromList(state.unmasteredWords, word);
      addUniqueWord(state.masteredWords, word);
      return true;
    }
    if (state.wordStatus[word] !== undefined) return false;
    state.attemptedCount += 1;
    if (state.wordStatus[word] === true) return;
    state.wordStatus[word] = false;
    addUniqueWord(state.unmasteredWords, word);
    return true;
  }

  function advanceQuestion(options) {
    options = options || {};
    state.questionIndex += 1;
    setupQuestion();
    if (!options.deferPrompt) {
      startPromptLoop();
    }
    return "playing";
  }

  function catchFallingCandy(item) {
    clearPromptLoop();
    state.fallingCandies = [];
    if (item.word !== state.currentWord) {
      recordWordResult(state.currentWord, false);
      state.lives = Math.max(0, state.lives - 1);
      playWrongSound();
      triggerDogCry();
      if (state.lives <= 0) {
        showReport("Game Over!");
        return;
      }
      state.message = "";
      state.messageUntil = 0;
      state.wrongChoiceIndex = -1;
      advanceQuestion();
      return;
    }

    if (recordWordResult(state.currentWord, true)) {
      state.score += 1;
    }
    playRightSound();
    state.message = "";
    state.messageUntil = 0;
    if (addCandyDrop(item.candyIndex)) {
      startJarCeremony();
      return;
    }
    advanceQuestion();
  }

  function missCurrentWord() {
    clearPromptLoop();
    state.fallingCandies = [];
    recordWordResult(state.currentWord, false);
    state.lives = Math.max(0, state.lives - 1);
    playWrongSound();
    triggerDogCry();
    if (state.lives <= 0) {
      showReport("Game Over!");
      return;
    }
    state.message = "";
    state.messageUntil = 0;
    advanceQuestion();
  }

  function startJarIntro(options) {
    options = options || {};
    clearTimer();
    clearPromptLoop();
    state.phase = "jarIntro";
    state.fallingCandies = [];
    state.jarOnField = false;
    state.jarX = (WIDTH - CATCH_JAR_W) / 2;
    state.jarTargetX = state.jarX;
    state.jarIntro = {
      startedAt: Date.now(),
      duration: 920,
      resetTimer: !!options.resetTimer,
      setupQuestion: !!options.setupQuestion
    };
  }

  function startJarReturn(nextPhase) {
    clearTimer();
    clearPromptLoop();
    state.phase = "jarReturn";
    state.fallingCandies = [];
    state.jarOnField = false;
    state.jarReturn = {
      startedAt: Date.now(),
      duration: 860,
      fromX: state.jarX,
      nextPhase: nextPhase
    };
  }

  function finishJarReturn() {
    var nextPhase = state.jarReturn ? state.jarReturn.nextPhase : "playing";
    state.jarReturn = null;
    state.jarOnField = false;
    if (nextPhase === "report") {
      showReport("Report");
      return;
    }
    state.phase = nextPhase;
  }

  function finishJarIntro() {
    var intro = state.jarIntro;
    state.jarIntro = null;
    state.phase = "playing";
    state.jarOnField = true;
    state.lastFrameAt = 0;
    if (intro && (intro.setupQuestion || !state.currentWord)) {
      setupQuestion();
    }
    startPromptLoop();
  }

  function startJarCeremony() {
    clearTimer();
    clearPromptLoop();
    state.fallingCandies = [];
    state.phase = "jarCeremony";
    state.jarOnField = false;
    state.jarCeremony = {
      startedAt: Date.now(),
      themeId: state.selectedThemeId,
      bottleIndex: bottleIndexForJar(state.currentJarIndex),
      drops: state.drops.slice()
    };
  }

  function shelfCapacity() {
    return JAR_THEME_ORDER.length;
  }

  function finishAfterJarDestination(next, showcase) {
    if (next === "report") {
      showReport("Report");
      return;
    }
    if (next === "nextTheme") {
      if (showcase && showcase.unlockThemeId) {
        state.pendingThemeUnlockId = null;
        var progressKey = state.selectedWordSetId || "grade1_3";
        if (bookProgress[progressKey]) {
          bookProgress[progressKey].pendingThemeUnlockId = null;
        }
        activateJarTheme(themeIndex(showcase.unlockThemeId));
        state.lastFrameAt = 0;
        startJarIntro({ setupQuestion: true });
      }
      return;
    }
    if (next === "playing") {
      startJarIntro({ setupQuestion: false });
    }
  }

  function startShelfShowcase(next, options) {
    options = options || {};
    state.shelfShowcase = {
      startedAt: Date.now(),
      duration: options.duration || 1780,
      moveDuration: 880,
      jars: state.completedJars.slice(),
      next: next,
      unlockThemeId: options.unlockThemeId || null,
      unlockDelay: options.unlockDelay || 980,
      unlockDuration: options.unlockDuration || 780,
      lockPendingUnlock: !!options.lockPendingUnlock,
      unlockSoundPlayed: false
    };
    state.phase = "shelfShowcase";
    state.jarOnField = false;
  }

  function finishShelfShowcase() {
    var showcase = state.shelfShowcase;
    var next = showcase ? showcase.next : "playing";
    state.shelfShowcase = null;
    state.unlockAnimation = null;
    finishAfterJarDestination(next, showcase);
  }

  function finishJarCeremony() {
    var ceremony = state.jarCeremony;
    state.jarCeremony = null;
    if (ceremony) {
      var completedJar = {
        themeId: ceremony.themeId || state.selectedThemeId,
        bottleIndex: ceremony.bottleIndex,
        drops: ceremony.drops.slice(),
        jarImage: currentJarImage()
      };
      var replaced = false;
      for (var ci = 0; ci < state.completedJars.length; ci += 1) {
        if (state.completedJars[ci].themeId === completedJar.themeId) {
          state.completedJars[ci] = completedJar;
          replaced = true;
          break;
        }
      }
      if (!replaced) state.completedJars.push(completedJar);
      var firstThemeClear = state.completedThemeIds.indexOf(ceremony.themeId || state.selectedThemeId) < 0;
      if (firstThemeClear) {
        state.completedThemeIds.push(ceremony.themeId || state.selectedThemeId);
        state.unlockedCandyCount = Math.min(CANDY_ASSET_COUNT, unlockedCandyCountForProgress() + CANDIES_PER_THEME_CLEAR);
      }
      var unlockedBefore = state.highestUnlockedJarIndex;
      refreshUnlockedJarIndex();
      var unlockedAfter = state.highestUnlockedJarIndex;
      if (unlockedAfter > unlockedBefore && unlockedAfter < JAR_THEME_ORDER.length) {
        state.pendingThemeUnlockId = JAR_THEME_ORDER[unlockedAfter];
      }
      var nextThemeId = null;
      if (state.currentJarIndex < JAR_THEME_ORDER.length - 1) {
        nextThemeId = JAR_THEME_ORDER[state.currentJarIndex + 1];
      }
      bookProgress[state.selectedWordSetId || "grade1_3"] = {
        completedJars: state.completedJars.slice(),
        highestUnlockedJarIndex: state.highestUnlockedJarIndex,
        unlockedCandyCount: state.unlockedCandyCount,
        pendingThemeUnlockId: state.pendingThemeUnlockId,
        bottleAssignment: Object.assign({}, bottleAssignment)
      };
      state.nextThemeAfterCeremony = nextThemeId;
    }
    state.drops = [];
    state.jarOnField = false;
    if (state.nextThemeAfterCeremony) {
      startShelfShowcase("nextTheme", {
        duration: 1880,
        unlockThemeId: state.nextThemeAfterCeremony,
        lockPendingUnlock: true
      });
      state.nextThemeAfterCeremony = null;
    } else if (state.currentJarIndex >= JAR_THEME_ORDER.length - 1) {
      startShelfShowcase("report");
    } else {
      showReport("Report");
    }
  }

  function updateJarTransitions() {
    if (state.phase === "jarIntro" && state.jarIntro) {
      if (Date.now() - state.jarIntro.startedAt >= state.jarIntro.duration) {
        finishJarIntro();
      }
      return;
    }
    if (state.phase === "jarReturn" && state.jarReturn) {
      if (Date.now() - state.jarReturn.startedAt >= state.jarReturn.duration) {
        finishJarReturn();
      }
      return;
    }
    if (state.phase === "jarCeremony" && state.jarCeremony) {
      if (Date.now() - state.jarCeremony.startedAt >= 2060) {
        finishJarCeremony();
      }
      return;
    }
    if (state.phase === "shelfShowcase" && state.shelfShowcase) {
      if (Date.now() - state.shelfShowcase.startedAt >= state.shelfShowcase.duration) {
        finishShelfShowcase();
      }
    }
  }

  function updateFalling(timestamp) {
    if (state.phase !== "playing") {
      state.lastFrameAt = timestamp;
      return;
    }

    if (!state.lastFrameAt) {
      state.lastFrameAt = timestamp;
    }
    var delta = Math.min(0.04, (timestamp - state.lastFrameAt) / 1000);
    state.lastFrameAt = timestamp;

    state.jarX += (state.jarTargetX - state.jarX) * Math.min(1, delta * 14);
    state.jarX = clamp(state.jarX, 40, WIDTH - CATCH_JAR_W - 40);

    if (!state.fallingCandies.length) {
      if (Date.now() >= state.nextDropAt) {
        setupFallingCandies();
      }
      return;
    }

    var catchLeft = state.jarX + 52;
    var catchRight = state.jarX + CATCH_JAR_W - 52;
    var catchTop = CATCH_JAR_Y + 42;
    var caught = null;
    var allMissed = true;

    for (var i = 0; i < state.fallingCandies.length; i += 1) {
      var item = state.fallingCandies[i];
      item.y += item.speed * delta;
      item.rotate += item.spin * delta;
      if (item.y - item.size / 2 <= HEIGHT + 16) {
        allMissed = false;
      }
      if (item.y + item.size / 2 >= catchTop && item.y < CATCH_JAR_Y + 160 && item.x >= catchLeft && item.x <= catchRight) {
        caught = item;
        break;
      }
    }

    if (caught) {
      catchFallingCandy(caught);
      return;
    }

    if (allMissed) {
      missCurrentWord();
    }
  }

  function render(timestamp) {
    updateJarTransitions();
    updateFalling(timestamp || 0);
    state.buttons = [];
    drawBackground();
    if (state.phase === "loading") {
      drawLoading();
    }
    if (state.phase !== "loading") {
      drawHud();
      if (state.phase === "playing") {
        drawFallingCandies();
      }
      if (state.jarOnField && state.phase === "playing") {
        drawJar();
      }
      if (state.phase === "jarIntro") {
        drawJarIntro();
      }
      if (state.phase === "jarReturn") {
        drawJarReturn();
      }
      if (state.phase === "jarCeremony") {
        drawJarCeremony();
      }
      drawMessage();
    }
    if (state.phase === "report") {
      drawReport();
      drawDogCryEffect();
      if (state.dogCryStartedAt) {
        state.rafId = window.requestAnimationFrame(render);
      } else {
        state.rafId = null;
      }
      return;
    }
    if (state.phase === "finished") {
      drawFinal();
      return;
    }
    drawDogCryEffect();
    state.rafId = window.requestAnimationFrame(render);
  }

  function startLoop() {
    if (state.rafId) {
      window.cancelAnimationFrame(state.rafId);
    }
    state.rafId = window.requestAnimationFrame(render);
  }

  function startGame() {
    if (state.started) return;
    state.started = true;
    if (gameTracker) {
      try {
        gameTracker.start();
      } catch (error) {
        console.warn("[CandyGame] GameTracker start failed:", error);
      }
    }
    state.score = 0;
    state.lives = HEARTS;
    state.currentJarIndex = 0;
    state.questionIndex = 0;
    state.dogCryStartedAt = 0;
    state.drops = [];
    var progressKey = state.selectedWordSetId || "grade1_3";
    var savedProgress = bookProgress[progressKey] || null;
    state.completedJars = savedProgress && savedProgress.completedJars ? savedProgress.completedJars.slice() : [];
    state.completedThemeIds = state.completedJars.map(function (jar) { return jar.themeId; });
    refreshUnlockedJarIndex();
    state.jarIntro = null;
    state.jarCeremony = null;
    state.jarReturn = null;
    state.shelfShowcase = null;
    state.nextThemeAfterCeremony = null;
    state.unlockAnimation = null;
    state.jarOnField = false;
    state.masteredWords = [];
    state.unmasteredWords = [];
    state.wordStatus = {};
    state.masteredCount = 0;
    state.attemptedCount = 0;
    state.wordOrder = buildWordOrder();
    state.fallingCandies = [];
    state.currentWord = null;
    state.jarX = (WIDTH - CATCH_JAR_W) / 2;
    state.jarTargetX = state.jarX;
    state.lastFrameAt = 0;
    state.reported = false;
    state.reportReturnPhase = null;
    if (!isThemeUnlocked(state.selectedThemeId)) {
      state.selectedThemeId = pickDefaultUnlockedTheme();
    }
    setJarThemeOrder(state.selectedThemeId);
    bottleAssignment = savedProgress && savedProgress.bottleAssignment ? Object.assign({}, savedProgress.bottleAssignment) : {};
    if (Object.keys(bottleAssignment).length !== JAR_THEME_ORDER.length) {
      bottleAssignment = {};
      var bottleIndexes = [];
      for (var b = 0; b < BOTTLE_ASSET_COUNT; b += 1) {
        bottleIndexes.push(b);
      }
      bottleIndexes = shuffle(bottleIndexes);
      for (var bi = 0; bi < JAR_THEME_ORDER.length; bi += 1) {
        bottleAssignment[JAR_THEME_ORDER[bi]] = bottleIndexes[bi];
      }
    }
    activateJarTheme(themeIndex(state.selectedThemeId));
    startBackgroundMusic();
    startJarIntro({ setupQuestion: true });
  }

  function clearTimer() {
    if (state.timerId) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function clearPromptLoop() {
    if (state.promptTimerId) {
      window.clearInterval(state.promptTimerId);
      state.promptTimerId = null;
    }
  }

  function startPromptLoop() {
    clearPromptLoop();
    if (state.phase !== "playing" || !state.currentWord) return;
    playWord(state.currentWord);
    state.promptTimerId = window.setInterval(function () {
      if (state.phase !== "playing" || !state.currentWord) {
        clearPromptLoop();
        return;
      }
      if (!foregroundPlaying && !foregroundQueue.length) {
        playWord(state.currentWord);
      }
    }, 1000);
  }

  function setupQuestion() {
    if (!state.wordOrder.length) state.wordOrder = buildWordOrder();
    var correct = state.wordOrder[state.questionIndex % state.wordOrder.length];
    var distractors = shuffle(WORDS.filter(function (word) {
      return word !== correct;
    })).slice(0, 2);
    var words = shuffle([correct, distractors[0], distractors[1]]);
    var unlockedCandies = unlockedCandyCountForProgress();
    var unlockedList = [];
    for (var ci = 0; ci < unlockedCandies; ci += 1) {
      unlockedList.push(ci);
    }
    var candyIndexes = shuffle(unlockedList).slice(0, 3);
    state.currentWord = correct;
    state.choices = words.map(function (word, index) {
      return {
        word: word,
        candyIndex: candyIndexes[index % candyIndexes.length]
      };
    });
    state.fallingCandies = [];
    state.nextDropAt = Date.now() + 240;
  }

  function setupFallingCandies() {
    var xs = shuffle([360, 800, 1240]);
    var baseSpeed = 180 + state.currentJarIndex * 18;
    var capacity = currentJarCapacity();
    var progress = capacity > 1 ? state.drops.length / (capacity - 1) : 0;
    var maxSpeedScale = getDifficultyById(state.selectedDifficultyId).maxSpeedScale;
    var accelerationRange = maxSpeedScale - 1;
    var speedScale = 1 + Math.min(accelerationRange, progress * accelerationRange);
    state.fallingCandies = state.choices.map(function (choice, index) {
      var startSpeed = baseSpeed + rand(-10, 18);
      return {
        word: choice.word,
        candyIndex: choice.candyIndex,
        x: xs[index],
        y: -90 - index * 44,
        size: FALLING_SIZE,
        speed: startSpeed * speedScale,
        rotate: rand(-0.28, 0.28),
        spin: rand(-0.45, 0.45)
      };
    });
  }

  function addCandyDrop(candyIndex) {
    var count = state.drops.length;
    var slot = candySlot(count, currentJarCapacity());
    state.drops.push({
      candyIndex: candyIndex,
      x: slot.x + rand(-6, 6),
      y: slot.y + rand(-5, 5),
      size: rand(60, 72),
      rotate: rand(-0.48, 0.48)
    });
    return state.drops.length >= currentJarCapacity();
  }

  function finishGame(won, finalMessage) {
    if (state.phase === "finished") return;
    clearTimer();
    clearPromptLoop();
    state.fallingCandies = [];
    state.jarIntro = null;
    state.jarCeremony = null;
    state.jarReturn = null;
    state.shelfShowcase = null;
    state.nextThemeAfterCeremony = null;
    state.jarOnField = false;
    if (state.rafId) {
      window.cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    state.phase = "finished";
    state.message = finalMessage || (won ? "Great Job!" : "Time's up!");
    render();
    reportScore();
  }

  function showReport(finalMessage) {
    if (state.phase === "report") return;
    state.reportReturnPhase = null;
    clearTimer();
    clearPromptLoop();
    state.fallingCandies = [];
    state.jarIntro = null;
    state.jarCeremony = null;
    state.jarReturn = null;
    state.shelfShowcase = null;
    state.nextThemeAfterCeremony = null;
    state.unlockAnimation = null;
    state.jarOnField = false;
    if (state.rafId) {
      window.cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    state.phase = "report";
    state.message = finalMessage || "Report";
    state.reportScrollY = 0;
    state.reportScrollMax = 0;
    state.reportScrollArea = null;
    state.reportDragging = false;
    render();
    playReportNarration();
    reportScore();
  }

  function openLearningReport() {
    if (state.phase !== "playing") return;
    state.reportReturnPhase = state.phase;
    clearPromptLoop();
    state.phase = "report";
    state.reportScrollY = 0;
    state.reportScrollMax = 0;
    state.reportScrollArea = null;
    state.reportDragging = false;
    render();
    playReportNarration();
  }

  function closeLearningReport() {
    if (state.phase !== "report" || !state.reportReturnPhase) return;
    var returnPhase = state.reportReturnPhase;
    stopForegroundAudio();
    state.reportReturnPhase = null;
    state.phase = returnPhase;
    state.reportScrollY = 0;
    state.reportScrollMax = 0;
    state.reportScrollArea = null;
    state.reportDragging = false;
    state.lastFrameAt = 0;
    if (state.phase === "playing") {
      startPromptLoop();
    }
    startLoop();
  }

  function replayFromDifficultySelection() {
    if (state.phase !== "report") return;
    reportScore();
    clearTimer();
    clearPromptLoop();
    stopForegroundAudio();
    state.reportReturnPhase = null;
    state.reportScrollY = 0;
    state.reportScrollMax = 0;
    state.reportScrollArea = null;
    state.reportDragging = false;
    state.buttons = [];
    state.phase = "ready";
    state.started = false;
    if (showDifficultyStep) {
      showDifficultyStep();
      if (startOverlay) {
        startOverlay.className = "start_overlay";
      }
    }
    startLoop();
  }

  function reportScore() {
    if (state.reported) return;
    state.reported = true;
    if (gameTracker) {
      try {
        gameTracker.finish(Number(state.score) || 0);
      } catch (error) {
        console.warn("[CandyGame] GameTracker finish failed:", error);
      }
    }
    try {
      if (typeof window.onReport === "function") {
        window.onReport(state.score);
      }
    } catch (error) {}
  }

  function canvasPoint(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * WIDTH / rect.width,
      y: (clientY - rect.top) * HEIGHT / rect.height
    };
  }

  function hit(point, rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
  }

  function scrollReportBy(deltaY) {
    if (state.phase !== "report" || state.reportScrollMax <= 0) return false;
    var oldY = state.reportScrollY;
    state.reportScrollY = clamp(state.reportScrollY + deltaY, 0, state.reportScrollMax);
    if (state.reportScrollY !== oldY) {
      render();
      return true;
    }
    return false;
  }

  function beginReportScroll(point) {
    if (state.phase !== "report" || state.reportScrollMax <= 0 || !state.reportScrollArea) return false;
    if (!hit(point, state.reportScrollArea)) return false;
    state.reportDragging = true;
    state.reportDragLastY = point.y;
    return true;
  }

  function updateReportScroll(point) {
    if (!state.reportDragging) return false;
    var deltaY = state.reportDragLastY - point.y;
    state.reportDragLastY = point.y;
    scrollReportBy(deltaY);
    return true;
  }

  function endReportScroll() {
    state.reportDragging = false;
  }

  function exitGamePage() {
    try {
      if (window.axxBridge && window.axxBridge.closePage) {
        window.axxBridge.closePage();
        return;
      }
    } catch (error) {}
    try {
      window.close();
    } catch (error2) {}
  }

  function moveJarTo(point) {
    if (state.phase !== "playing") return;
    state.jarTargetX = clamp(point.x - CATCH_JAR_W / 2, 40, WIDTH - CATCH_JAR_W - 40);
  }

  function processPoint(point) {
    initAudioAfterInteraction();
    if (state.phase === "finished" || state.phase === "loading") return;

    for (var b = state.buttons.length - 1; b >= 0; b -= 1) {
      var button = state.buttons[b];
      if (hit(point, button)) {
        if (button.enabled === false) return;
        if (button.type === "reportEnd") {
          exitGamePage();
        } else if (button.type === "reportBack") {
          closeLearningReport();
        } else if (button.type === "reportReplay") {
          replayFromDifficultySelection();
        } else if (button.type === "reportOpen") {
          openLearningReport();
        }
        return;
      }
    }

    if (state.phase === "report") return;
    moveJarTo(point);
  }

  function onMouseDown(event) {
    initAudioAfterInteraction();
    var point = canvasPoint(event.clientX, event.clientY);
    if (beginReportScroll(point)) {
      event.preventDefault();
    }
  }

  function onMouseMove(event) {
    var point = canvasPoint(event.clientX, event.clientY);
    if (updateReportScroll(point)) {
      event.preventDefault();
      return;
    }
    moveJarTo(point);
  }

  function onMouseUp(event) {
    if (Date.now() - lastTouchAt < 700) return;
    event.preventDefault();
    if (state.reportDragging) {
      endReportScroll();
      return;
    }
    processPoint(canvasPoint(event.clientX, event.clientY));
  }

  function onTouchStart(event) {
    lastTouchAt = Date.now();
    initAudioAfterInteraction();
    if (event.touches && event.touches.length) {
      var point = canvasPoint(event.touches[0].clientX, event.touches[0].clientY);
      if (beginReportScroll(point)) {
        event.preventDefault();
        return;
      }
      moveJarTo(point);
    }
    event.preventDefault();
  }

  function onTouchMove(event) {
    lastTouchAt = Date.now();
    event.preventDefault();
    if (!event.touches || !event.touches.length) return;
    var point = canvasPoint(event.touches[0].clientX, event.touches[0].clientY);
    if (updateReportScroll(point)) return;
    moveJarTo(point);
  }

  function onTouchEnd(event) {
    lastTouchAt = Date.now();
    event.preventDefault();
    if (state.reportDragging) {
      endReportScroll();
      return;
    }
    if (!event.changedTouches || !event.changedTouches.length) return;
    var touch = event.changedTouches[0];
    processPoint(canvasPoint(touch.clientX, touch.clientY));
  }

  function onWheel(event) {
    if (state.phase !== "report" || state.reportScrollMax <= 0 || !state.reportScrollArea) return;
    var point = canvasPoint(event.clientX, event.clientY);
    if (!hit(point, state.reportScrollArea)) return;
    var rect = canvas.getBoundingClientRect();
    var scaledDelta = event.deltaY * HEIGHT / rect.height;
    if (scrollReportBy(scaledDelta)) {
      event.preventDefault();
    }
  }

  function bindEvents() {
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, false);
    canvas.addEventListener("touchstart", onTouchStart, false);
    canvas.addEventListener("touchmove", onTouchMove, false);
    canvas.addEventListener("touchend", onTouchEnd, false);
    canvas.addEventListener("touchcancel", function (event) {
      event.preventDefault();
    }, false);
  }

  function init() {
    loadAssets();
    createStartOverlay();
    bindEvents();
    startLoop();
    startBackgroundMusic();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, false);
  } else {
    init();
  }
})();
