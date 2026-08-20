(function () {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const startOverlay = document.getElementById("startOverlay");
  const startButtonMount = document.getElementById("startButtonMount");
  const gradeOptions = document.getElementById("gradeOptions");
  const backgroundMusic = document.getElementById("backgroundMusic");
  let gameTracker = null;
  if (typeof window.GameTracker === "function") {
    try {
      gameTracker = new window.GameTracker({
        gameId: "bridge_word",
        gameVersion: "1.0.0",
        apiUrl: window.GAME_TRACKER_API_URL || "http://127.0.0.1:8000/api/v1/events",
        getUserId: function () {
          return window.platformUserId || null;
        }
      });
    } catch (error) {
      console.warn("[GameTracker] 初始化失败：", error);
    }
  }
  const WIDTH = 1600;
  const HEIGHT = 900;
  const QUESTION_SECONDS = 20;
  const QUESTIONS_PER_LEVEL = 5;
  const INTRO_DURATION = 6800;
  const LEVEL_COMPLETE_DURATION = 2000;
  const INTRO_WORLD_WIDTH = 2800;
  const INTRO_CAMERA_TRAVEL = 650;
  const TOTAL_HEARTS = 5;
  const SHEEP_BASE_X = 130;
  const SHEEP_SPACING = 58;
  const SHEEP_GROUND_Y = 535;
  const WAITING_SHEEP_GROUND_Y = 720;
  const SAFE_ANIMAL_GROUND_Y = 690;
  const ACTIVE_SHEEP_X = 610;
  const SAFE_ANIMAL_CENTER_X = 1425;
  const WOLF_GAME_X = 92;
  const WOLF_MOVE_INTERVAL = 5000;
  const WOLF_MOVE_DURATION = 1800;
  const WOLF_ANSWER_HIDE_DURATION = 620;
  const WOLF_APPROACH_POSITIONS = [WOLF_GAME_X, 210, 328, 446];
  const ANIMAL_EXIT_DURATION = 2400;
  const WRONG_FEEDBACK_DURATION = 3800;
  const LEGACY_WRONG_MOTION_DURATION = 2800;
  const SUN_X = 1390;
  const SUN_Y = 125;
  const BRIDGE_AREA_X = 650;
  const BRIDGE_AREA_W = 550;
  const BRIDGE_SLOT_GAP = 4;
  const BRIDGE_ROW_GAP = 5;
  const RIVER_BRIDGE_TOP_Y = 558;
  const RIVER_BRIDGE_BOTTOM_Y = 832;
  const CROCODILE_MOUTH_OFFSET_RATIO = 0.41;
  const BRIDGE_BLANK_TOKEN = "__BRIDGE_BLANK__";
  const ANSWER_LINE_TOKEN = "__BRIDGE_ANSWER_LINE__";
  const ANSWER_LINE_WIDTH = 360;
  const REPORT_COLUMNS = {
    unmastered: { x: 380, y: 330, w: 400, h: 364 },
    mastered: { x: 820, y: 330, w: 400, h: 364 }
  };
  const REPORT_ITEM_STEP = 70;
  const BACKGROUND_MUSIC_VOLUME = 0.64;
  const REPORT_BACKGROUND_MUSIC_VOLUME = 0.16;
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const runtimeBanks = window.BRIDGE_QUESTION_BANKS || {};
  const QUESTION_BANKS = [
    { key: "g7u", shortLabel: "七上", label: "七年级上册", rows: runtimeBanks.g7u || [] },
    { key: "g7d", shortLabel: "七下", label: "七年级下册", rows: runtimeBanks.g7d || [] },
    { key: "g8u", shortLabel: "八上", label: "八年级上册", rows: runtimeBanks.g8u || [] },
    { key: "g8d", shortLabel: "八下", label: "八年级下册", rows: runtimeBanks.g8d || [] },
    { key: "g9u", shortLabel: "九上", label: "九年级上册", rows: runtimeBanks.g9u || [] }
  ];
  // assets/report_point/知识点.txt 的音频编号顺序与题库知识点首次出现顺序一致。
  const KNOWLEDGE_POINT_AUDIO = (function () {
    const audioByPoint = Object.create(null);
    let audioNumber = 1;
    QUESTION_BANKS.forEach(function (bank) {
      bank.rows.forEach(function (question) {
        const point = question.knowledgePoint || "";
        if (!point || audioByPoint[point]) return;
        audioByPoint[point] = "assets/report_point/farm-" + String(audioNumber).padStart(4, "0") + ".mp3";
        audioNumber += 1;
      });
    });
    return audioByPoint;
  }());
  let selectedBankKey = "g7u";
  let QUESTIONS = [];
  let QUESTION_LEVELS = [];

  const COLORS = {
    ink: "#17334d",
    muted: "#607a8d",
    cream: "#fff8de",
    orange: "#ff9d3d",
    orangeDark: "#ca5d21",
    green: "#39b878",
    greenDark: "#237a56",
    red: "#ec5f5f",
    blue: "#3d91c9",
    wood: "#c9813d",
    woodLight: "#edb45d",
    woodDark: "#855025"
  };

  const ANIMAL_LEVELS = [
    { key: "sheep", name: "小羊", width: 176, height: 171, footOffset: 52 },
    { key: "goose", name: "大鹅", width: 120, height: 180, footOffset: 50 },
    { key: "duck", name: "小鸭子", width: 162, height: 176, footOffset: 50 },
    { key: "rabbit", name: "小兔子", width: 154, height: 170, footOffset: 48 },
    { key: "cow", name: "小牛", width: 205, height: 166, footOffset: 50 },
    { key: "hen", name: "小鸡", width: 145, height: 180, footOffset: 50 },
    { key: "pig", name: "小猪", width: 194, height: 166, footOffset: 50 },
    { key: "horse", name: "小马", width: 150, height: 180, footOffset: 50 }
  ];

  ANIMAL_LEVELS.forEach(function (animal) {
    animal.image = new Image();
    animal.ready = false;
    animal.image.onload = function () {
      animal.ready = true;
    };
    animal.image.src = "assets/photo/" + animal.key + ".png";
  });

  const background = new Image();
  let backgroundReady = false;
  background.onload = function () {
    backgroundReady = true;
  };
  background.src = "assets/photo/background.svg?v=farm-29";

  const wolfImage = new Image();
  let wolfImageReady = false;
  wolfImage.onload = function () {
    wolfImageReady = true;
  };
  wolfImage.src = "assets/photo/wolf.png";

  const pounceWolfImage = new Image();
  let pounceWolfImageReady = false;
  pounceWolfImage.onload = function () {
    pounceWolfImageReady = true;
  };
  pounceWolfImage.src = "assets/photo/wolf_snap.png";

  const bushImage = new Image();
  let bushImageReady = false;
  bushImage.onload = function () {
    bushImageReady = true;
  };
  bushImage.src = "assets/photo/bush.png";

  const crocodileImage = new Image();
  let crocodileImageReady = false;
  crocodileImage.onload = function () {
    crocodileImageReady = true;
  };
  crocodileImage.src = "assets/photo/crocodile.png";

  const crocodileOpenImage = new Image();
  let crocodileOpenImageReady = false;
  crocodileOpenImage.onload = function () {
    crocodileOpenImageReady = true;
  };
  crocodileOpenImage.src = "assets/photo/crocodile_open.png";

  const heartImage = new Image();
  let heartImageReady = false;
  heartImage.onload = function () {
    heartImageReady = true;
  };
  heartImage.src = "assets/photo/aixin.png";

  const animalSound = new Audio();
  animalSound.preload = "auto";
  animalSound.volume = 1;
  animalSound.playsInline = true;
  let animalSoundKey = "";

  const wolfSound = new Audio("assets/yinxiao/wolf.mp3");
  wolfSound.preload = "auto";
  wolfSound.volume = 1;

  const reportNarrationAudio = new Audio();
  reportNarrationAudio.preload = "auto";
  reportNarrationAudio.volume = 1;
  reportNarrationAudio.playsInline = true;
  let reportNarrationPlaying = false;
  let reportNarrationQueue = [];
  let reportNarrationIndex = 0;
  let reportNarrationRequestId = 0;

  const state = {
    phase: "ready",
    score: 0,
    timeLeft: QUESTION_SECONDS,
    startTime: 0,
    questionStartTime: 0,
    levelIndex: 0,
    questionIndex: 0,
    wordFontSize: 25,
    words: [],
    selectedOptionId: null,
    introStart: 0,
    introCameraX: 0,
    levelCompleteStart: 0,
    feedback: null,
    questionResults: {},
    sessionQuestions: [],
    reportScroll: { unmastered: 0, mastered: 0, drag: null },
    sheepLeft: TOTAL_HEARTS,
    heartsRemaining: TOTAL_HEARTS,
    safeSheep: 0,
    rescuedByAnimal: new Array(ANIMAL_LEVELS.length).fill(0),
    visitedLevels: new Array(ANIMAL_LEVELS.length).fill(false),
    reported: false,
    endReason: "",
    reportSourcePhase: null,
    reportOpenedAt: 0,
    lastFrame: performance.now(),
    reportButton: { x: 394, y: 22, w: 200, h: 58 },
    reportBackButton: { x: 650, y: 748, w: 300, h: 60 },
    reportRestartButton: { x: 830, y: 748, w: 280, h: 60 },
    playAgainButton: { x: 650, y: 748, w: 300, h: 60 },
    lastTouchTime: 0
  };

  let audioContext = null;

  function startBackgroundMusic() {
    if (!backgroundMusic) return;
    backgroundMusic.volume = reportNarrationPlaying ? REPORT_BACKGROUND_MUSIC_VOLUME : BACKGROUND_MUSIC_VOLUME;
    const playback = backgroundMusic.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(function () {
        // 浏览器可能在用户首次交互前阻止自动播放。
      });
    }
  }

  function roundedPath(context, x, y, w, h, radius) {
    const r = Math.max(0, Math.min(radius, Math.min(w, h) / 2));
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + w - r, y);
    context.quadraticCurveTo(x + w, y, x + w, y + r);
    context.lineTo(x + w, y + h - r);
    context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    context.lineTo(x + r, y + h);
    context.quadraticCurveTo(x, y + h, x, y + h - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
  }

  function fillRounded(x, y, w, h, radius, fill, stroke, lineWidth) {
    roundedPath(ctx, x, y, w, h, radius);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.lineWidth = lineWidth || 2;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    if (copy.length > 2 && copy.every(function (item, index) { return item === items[index]; })) {
      const first = copy.shift();
      copy.push(first);
    }
    return copy;
  }

  function getBlankSentenceRange(stem, useCommaClause) {
    const blankIndex = stem.search(/_{2,}/);
    if (blankIndex < 0) return null;
    let start = 0;
    let end = stem.length;
    for (let i = blankIndex - 1; i >= 0; i -= 1) {
      if (/[.?!。！？]/.test(stem[i])) {
        start = i + 1;
        break;
      }
    }
    for (let i = blankIndex; i < stem.length; i += 1) {
      if (/[.?!。！？]/.test(stem[i])) {
        end = i + 1;
        break;
      }
    }

    if (useCommaClause) {
      for (let i = blankIndex - 1; i >= start; i -= 1) {
        if (/[,，]/.test(stem[i])) {
          start = i + 1;
          break;
        }
      }
      for (let i = blankIndex; i < end; i += 1) {
        if (/[,，]/.test(stem[i])) {
          end = i + 1;
          break;
        }
      }
    }
    return { start: start, end: end };
  }

  function getBlankSentence(stem, useCommaClause) {
    const range = getBlankSentenceRange(stem, useCommaClause);
    if (!range) return "";
    return stem.slice(range.start, range.end)
      .trim()
      .replace(/^[-–—]\s*/, "")
      .replace(/[,，]\s*$/, "");
  }

  function isShortSameSpeakerDialogue(stem) {
    const range = getBlankSentenceRange(stem, false);
    if (!range) return false;
    const targetSentence = stem.slice(range.start, range.end);
    if (/^\s*-{1,2}\s*/.test(targetSentence)) return false;
    const before = stem.slice(0, range.start).trim();
    if (!/[.?!。！？]$/.test(before)) return false;

    let lastDialogueStart = -1;
    const markerPattern = /(^|\s)-{1,2}\s*/g;
    let markerMatch = markerPattern.exec(before);
    while (markerMatch) {
      lastDialogueStart = markerMatch.index + markerMatch[1].length;
      markerMatch = markerPattern.exec(before);
    }
    if (lastDialogueStart < 0) return false;
    const shortReply = before.slice(lastDialogueStart).replace(/^-{1,2}\s*/, "").trim();
    const replyWords = shortReply.split(/\s+/).filter(Boolean);
    return replyWords.length > 0 && replyWords.length <= 4 && shortReply.length <= 32;
  }

  function getQuestionDisplayStem(stem, useCommaClause, inlineDialogueBlank) {
    const range = getBlankSentenceRange(stem, useCommaClause);
    if (!range) return stem;
    const targetSentence = stem.slice(range.start, range.end);
    const dialogueMarker = targetSentence.match(/^\s*(-{1,2})\s*/);
    const terminalMatch = useCommaClause ? null : targetSentence.match(/([.?!。！？])\s*$/);
    const terminalPunctuation = terminalMatch ? terminalMatch[1] : "";
    const placeholder = (dialogueMarker ? dialogueMarker[1] + " " : "") + ANSWER_LINE_TOKEN + terminalPunctuation;
    const before = stem.slice(0, range.start).trim();
    const after = stem.slice(range.end).trim();
    if (useCommaClause && /[,，]$/.test(before)) {
      const trailingComma = range.end > 0 && /[,，]/.test(stem[range.end - 1]) && after
        ? stem[range.end - 1]
        : "";
      return [before + " " + placeholder + trailingComma, after].filter(Boolean).join(" ");
    }
    if (useCommaClause && range.end > 0 && /[,，]/.test(stem[range.end - 1]) && after) {
      return placeholder + stem[range.end - 1] + " " + after;
    }
    if (inlineDialogueBlank) {
      return [before + " " + placeholder, after].filter(Boolean).join(" ");
    }
    return [before, placeholder, after].filter(Boolean).join(" ");
  }

  function buildQuestion(entry, bank) {
    if (!entry || typeof entry.stem !== "string" || typeof entry.correctOption !== "string") return null;
    const blanks = entry.stem.match(/_{2,}/g) || [];
    const answer = entry.correctOption.trim();
    const wrongOptions = Array.isArray(entry.wrongOptions) ? entry.wrongOptions.map(function (option) {
      return String(option).trim();
    }).filter(function (option, index, options) {
      return option && option !== answer && options.indexOf(option) === index;
    }).slice(0, 3) : [];
    if (blanks.length !== 1 || !answer || answer === "/" || answer.indexOf(";") >= 0 || !wrongOptions.length) return null;

    const fullTemplate = getBlankSentence(entry.stem, false);
    if (!fullTemplate) return null;
    const fullCompletedSentence = fullTemplate
      .replace(/_{2,}/, answer)
      .replace(/\s+([,.!?;:])/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
    const fullWordCount = fullCompletedSentence.split(/\s+/).filter(Boolean).length;
    const useCommaClause = fullWordCount > 8 && /[,，]/.test(fullTemplate);
    const inlineDialogueBlank = !useCommaClause && isShortSameSpeakerDialogue(entry.stem);
    const bridgeTemplate = useCommaClause ? getBlankSentence(entry.stem, true) : fullTemplate;
    const bridgeTokens = bridgeTemplate
      .replace(/_{2,}/, " " + BRIDGE_BLANK_TOKEN + " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (bridgeTokens.length < 2 || bridgeTokens.length > 24) return null;
    if (bridgeTokens.some(function (word) { return word !== BRIDGE_BLANK_TOKEN && word.length > 24; })) return null;

    const normalizedStem = entry.stem.replace(/_{2,}/g, "________");
    const options = shuffle([{ text: answer, correct: true }].concat(wrongOptions.map(function (text) {
      return { text: text, correct: false };
    })));
    return {
      id: entry.id,
      sourceKey: bank.key,
      sourceLabel: bank.label,
      sourceShortLabel: bank.shortLabel,
      knowledgePoint: entry.knowledgePoint || "",
      usesCommaClause: useCommaClause,
      inlineDialogueBlank: inlineDialogueBlank,
      stem: normalizedStem,
      displayStem: getQuestionDisplayStem(normalizedStem, useCommaClause, inlineDialogueBlank),
      correctOption: answer,
      wrongOptions: wrongOptions,
      options: options,
      bridgeTokens: bridgeTokens
    };
  }

  function createQuestionLevels(bankKey) {
    const bank = QUESTION_BANKS.find(function (item) { return item.key === bankKey; }) || QUESTION_BANKS[0];
    const pool = shuffle(bank.rows.map(function (entry) {
      return buildQuestion(entry, bank);
    }).filter(Boolean));
    const requiredQuestions = QUESTIONS_PER_LEVEL * ANIMAL_LEVELS.length;
    if (pool.length < requiredQuestions) {
      throw new Error("题库中没有足够的单空短句题目用于创建八个关卡");
    }
    return new Array(ANIMAL_LEVELS.length).fill(0).map(function (_, levelIndex) {
      const start = levelIndex * QUESTIONS_PER_LEVEL;
      return pool.slice(start, start + QUESTIONS_PER_LEVEL);
    });
  }

  function wrapTextLines(text, maxWidth, maxLines) {
    const parts = String(text).split(/\s+/);
    const lines = [];
    let line = "";
    parts.forEach(function (part) {
      const candidate = line ? line + " " + part : part;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = part;
      } else {
        line = candidate;
      }
    });
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      lines.length = maxLines;
      let last = lines[maxLines - 1];
      while (last.length > 1 && ctx.measureText(last + "…").width > maxWidth) {
        last = last.slice(0, -1);
      }
      lines[maxLines - 1] = last + "…";
    }
    return lines;
  }

  function drawCenteredWrappedText(text, centerX, firstY, maxWidth, maxLines, lineHeight) {
    const lines = wrapTextLines(text, maxWidth, maxLines);
    lines.forEach(function (line, index) {
      ctx.fillText(line, centerX, firstY + index * lineHeight);
    });
  }

  function wrapQuestionLines(text, maxWidth, maxLines) {
    const turns = String(text)
      .trim()
      .replace(/\s+(-{1,2}\s*)/g, "\n$1")
      .replace(/([\u3400-\u9fff][。！？.!?：:])\s+(?=["']?[A-Za-z_])/g, "$1\n")
      .replace(/([A-Za-z][.!?：:]["']?)\s+(?=[\u3400-\u9fff])/g, "$1\n")
      .split(/\n+/);
    const lines = [];

    turns.forEach(function (turn) {
      if (!turn || lines.length >= maxLines) return;
      const remainingLines = maxLines - lines.length;
      const normalizedTurn = turn.trim().replace(/^(-{1,2})\s*/, "$1 ");
      wrapTextLines(normalizedTurn, maxWidth, remainingLines).forEach(function (line) {
        lines.push(line);
      });
    });

    return lines;
  }

  function measureQuestionLine(line) {
    const tokenIndex = line.indexOf(ANSWER_LINE_TOKEN);
    if (tokenIndex < 0) return ctx.measureText(line).width;
    const prefix = line.slice(0, tokenIndex);
    const suffix = line.slice(tokenIndex + ANSWER_LINE_TOKEN.length);
    return ctx.measureText(prefix).width + ANSWER_LINE_WIDTH + ctx.measureText(suffix).width;
  }

  function drawQuestionLine(line, x, y) {
    const tokenIndex = line.indexOf(ANSWER_LINE_TOKEN);
    if (tokenIndex < 0) {
      ctx.fillText(line, x, y);
      return;
    }

    const prefix = line.slice(0, tokenIndex);
    const suffix = line.slice(tokenIndex + ANSWER_LINE_TOKEN.length);
    if (prefix) ctx.fillText(prefix, x, y);
    const lineX = x + ctx.measureText(prefix).width;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(lineX, y + 10);
    ctx.lineTo(lineX + ANSWER_LINE_WIDTH, y + 10);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();
    if (suffix) ctx.fillText(suffix, lineX + ANSWER_LINE_WIDTH, y);
  }

  function getQuestionPanelLayout(question) {
    const panelY = 112;
    const lineHeight = 31;
    const horizontalPadding = 44;
    const topPadding = 18;
    const knowledgeLineHeight = 22;
    const knowledgeGap = 12;
    const bottomPadding = 20;
    const lines = wrapQuestionLines(question.displayStem || question.stem, 980, 5);
    const lineCount = Math.max(1, lines.length);
    const questionWidth = lines.reduce(function (widest, line) {
      return Math.max(widest, measureQuestionLine(line));
    }, 0);
    ctx.save();
    ctx.font = "800 16px Arial, Microsoft YaHei, sans-serif";
    const knowledgeText = question.knowledgePoint || "综合语法";
    const knowledgeWidth = ctx.measureText(knowledgeText).width;
    ctx.restore();
    const contentWidth = Math.max(questionWidth, knowledgeWidth);
    const minimumPanelWidth = question.usesCommaClause ? 840 : (question.inlineDialogueBlank ? 680 : 300);
    const panelWidth = Math.max(minimumPanelWidth, Math.min(1068, Math.ceil(contentWidth + horizontalPadding * 2)));
    const questionHeight = lineCount * lineHeight;
    const panelHeight = topPadding + knowledgeLineHeight + knowledgeGap + questionHeight + bottomPadding;
    const panelX = (WIDTH - panelWidth) / 2;

    return {
      panelX: panelX,
      panelY: panelY,
      panelWidth: panelWidth,
      panelHeight: panelHeight,
      knowledgeText: knowledgeText,
      knowledgeX: panelX + horizontalPadding,
      knowledgeY: panelY + topPadding + knowledgeLineHeight / 2,
      textX: panelX + horizontalPadding,
      firstTextY: panelY + topPadding + knowledgeLineHeight + knowledgeGap + lineHeight / 2,
      lineHeight: lineHeight,
      lines: lines
    };
  }

  function calculateWordFontSize(question) {
    ctx.save();
    ctx.font = "900 25px Arial, sans-serif";
    const totalWidth = question.bridgeTokens.reduce(function (width, text) {
      const content = text === BRIDGE_BLANK_TOKEN ? question.correctOption : text;
      return width + Math.max(54, Math.min(330, ctx.measureText(content).width + 28)) + BRIDGE_SLOT_GAP;
    }, 0);
    ctx.restore();
    if (!totalWidth) return 25;
    return Math.max(15, Math.min(25, Math.floor(25 * (BRIDGE_AREA_W * 2) / totalWidth)));
  }

  function createWords(question) {
    const shuffled = question.options.map(function (option, index) {
      return { id: "option-" + state.questionIndex + "-" + index, text: option.text, correct: option.correct };
    });

    ctx.save();
    ctx.font = "900 24px Arial, sans-serif";
    const blocks = shuffled.map(function (word) {
      word.w = Math.max(130, Math.min(310, ctx.measureText(word.text).width + 42));
      word.h = 62;
      return word;
    });
    ctx.restore();

    const gap = 16;
    const rows = [];
    let row = [];
    let rowWidth = 0;
    blocks.forEach(function (word) {
      const nextWidth = row.length ? rowWidth + gap + word.w : word.w;
      if (nextWidth > 1360 && row.length) {
        rows.push({ words: row, width: rowWidth });
        row = [word];
        rowWidth = word.w;
      } else {
        row.push(word);
        rowWidth = nextWidth;
      }
    });
    if (row.length) rows.push({ words: row, width: rowWidth });

    const questionLayout = getQuestionPanelLayout(question);
    const panelBottom = questionLayout.panelY + questionLayout.panelHeight;
    const rowStartY = Math.min(panelBottom + 52, 340);
    rows.forEach(function (entry, rowIndex) {
      let x = (WIDTH - entry.width) / 2;
      entry.words.forEach(function (word) {
        word.homeX = x;
        word.homeY = rowStartY + rowIndex * 78;
        x += word.w + gap;
      });
    });
    return blocks;
  }

  function loadQuestion() {
    const question = QUESTIONS[state.questionIndex];
    if (!state.sessionQuestions.some(function (item) { return item.id === question.id; })) {
      state.sessionQuestions.push(question);
    }
    state.wordFontSize = calculateWordFontSize(question);
    state.words = createWords(question);
    state.selectedOptionId = null;
    state.timeLeft = QUESTION_SECONDS;
    state.questionStartTime = performance.now();
  }

  function unlockAudio() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    if (!audioContext) audioContext = new AudioCtor();
    if (audioContext.state === "suspended") audioContext.resume();
  }

  function playTone(frequency, duration, type, volume, delay, endFrequency) {
    if (!audioContext) return;
    const startAt = audioContext.currentTime + (delay || 0);
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type || "sine";
    oscillator.frequency.setValueAtTime(frequency, startAt);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), startAt + duration);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume || 0.04, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.03);
  }

  function playHappySound() {
    [0, 0.12, 0.24].forEach(function (delay, index) {
      playTone(590 + index * 110, 0.12, "sine", 0.055, delay, 780 + index * 80);
    });
  }

  function prepareAnimalSound() {
    const animal = ANIMAL_LEVELS[Math.max(0, Math.min(state.levelIndex, ANIMAL_LEVELS.length - 1))];
    if (!animal || animalSoundKey === animal.key) return;
    animalSound.pause();
    animalSoundKey = animal.key;
    animalSound.src = "assets/yinxiao/" + animal.key + ".mp3";
    animalSound.load();
  }

  function playAnimalSound() {
    prepareAnimalSound();
    try {
      animalSound.currentTime = 0;
    } catch (error) {}
    const playback = animalSound.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(function (error) {
        console.warn("Animal sound playback failed:", error);
      });
    }
  }

  function playWolfSound() {
    wolfSound.currentTime = 0;
    const playback = wolfSound.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(function () {});
    }
  }

  function finishReportNarration(requestId) {
    if (requestId !== reportNarrationRequestId) return;
    reportNarrationPlaying = false;
    reportNarrationQueue = [];
    reportNarrationIndex = 0;
    if (backgroundMusic) backgroundMusic.volume = BACKGROUND_MUSIC_VOLUME;
  }

  function stopReportNarration() {
    reportNarrationRequestId += 1;
    reportNarrationPlaying = false;
    reportNarrationQueue = [];
    reportNarrationIndex = 0;
    reportNarrationAudio.pause();
    try {
      reportNarrationAudio.currentTime = 0;
    } catch (error) {}
    reportNarrationAudio.onended = null;
    reportNarrationAudio.onerror = null;
    if (backgroundMusic) backgroundMusic.volume = BACKGROUND_MUSIC_VOLUME;
  }

  function playNextReportNarration(requestId) {
    if (!reportNarrationPlaying || requestId !== reportNarrationRequestId) return;
    if (reportNarrationIndex >= reportNarrationQueue.length) {
      finishReportNarration(requestId);
      return;
    }

    const itemIndex = reportNarrationIndex;
    const item = reportNarrationQueue[itemIndex];
    let advanced = false;
    function advance() {
      if (advanced || !reportNarrationPlaying || requestId !== reportNarrationRequestId || reportNarrationIndex !== itemIndex) return;
      advanced = true;
      reportNarrationIndex += 1;
      playNextReportNarration(requestId);
    }

    reportNarrationAudio.onended = advance;
    reportNarrationAudio.onerror = function () {
      console.warn("学习报告音频加载失败：", item.src);
      advance();
    };
    reportNarrationAudio.src = item.src;
    const playback = reportNarrationAudio.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(function (error) {
        console.warn("学习报告音频播放失败：", item.src, error);
        advance();
      });
    }
  }

  function startReportNarration() {
    const report = getKnowledgeReport();
    stopReportNarration();
    if (!report.unmastered.length && !report.mastered.length) return;
    const unmasteredPoints = report.unmastered.slice(0, 3);
    const queue = [];

    if (!unmasteredPoints.length) {
      queue.push({ src: "assets/report/2.mp3" });
    } else {
      queue.push({ src: "assets/report/1_1.mp3" });
      unmasteredPoints.forEach(function (point) {
        const src = KNOWLEDGE_POINT_AUDIO[point];
        if (src) queue.push({ src: src });
        else console.warn("没有找到知识点播报音频：", point);
      });
      queue.push({ src: "assets/report/1_2.mp3" });
    }

    if (!queue.length) return;
    reportNarrationPlaying = true;
    reportNarrationQueue = queue;
    reportNarrationIndex = 0;
    const requestId = reportNarrationRequestId;
    if (backgroundMusic) backgroundMusic.volume = REPORT_BACKGROUND_MUSIC_VOLUME;
    playNextReportNarration(requestId);
  }

  function playSadAndLaugh() {
    playTone(520, 0.25, "sine", 0.05, 0, 260);
    playTone(350, 0.28, "triangle", 0.045, 0.2, 170);
    [0.48, 0.62, 0.76].forEach(function (delay, index) {
      playTone(190 + index * 25, 0.1, "square", 0.03, delay, 130);
    });
  }

  function startLevel(levelIndex, withIntro, preserveProgress) {
    stopReportNarration();
    const safeLevelIndex = Math.max(0, Math.min(levelIndex, QUESTION_LEVELS.length - 1));
    QUESTIONS = QUESTION_LEVELS[safeLevelIndex];
    state.levelIndex = safeLevelIndex;
    prepareAnimalSound();
    state.phase = withIntro ? "intro" : "playing";
    if (!preserveProgress) state.score = 0;
    state.timeLeft = QUESTION_SECONDS;
    state.questionIndex = 0;
    state.sheepLeft = TOTAL_HEARTS;
    state.safeSheep = 0;
    state.reported = false;
    state.endReason = "";
    state.reportSourcePhase = null;
    state.reportOpenedAt = 0;
    if (!preserveProgress) {
      state.heartsRemaining = TOTAL_HEARTS;
      state.questionResults = {};
      state.sessionQuestions = [];
      state.rescuedByAnimal = new Array(ANIMAL_LEVELS.length).fill(0);
      state.visitedLevels = new Array(ANIMAL_LEVELS.length).fill(false);
      state.reportScroll = { unmastered: 0, mastered: 0, drag: null };
    }
    state.visitedLevels[safeLevelIndex] = true;
    state.introStart = performance.now();
    state.levelCompleteStart = 0;
    state.startTime = state.introStart;
    state.feedback = null;
    loadQuestion();
  }

  function startGame() {
    unlockAudio();
    startBackgroundMusic();
    QUESTION_LEVELS = createQuestionLevels(selectedBankKey);
    startLevel(0, true, false);
    if (gameTracker) {
      try {
        if (gameTracker.sessionId && !gameTracker.finished) gameTracker.abandon();
        gameTracker.start();
      } catch (error) {
        console.warn("[GameTracker] 开局上报失败：", error);
      }
    }
    startOverlay.classList.add("is_hidden");
    playTone(430, 0.11, "triangle", 0.045, 0, 610);
    playTone(610, 0.15, "triangle", 0.045, 0.13, 780);
  }

  function returnToGradeSelection() {
    stopReportNarration();
    state.phase = "ready";
    state.score = 0;
    state.timeLeft = QUESTION_SECONDS;
    state.levelIndex = 0;
    state.questionIndex = 0;
    state.words = [];
    state.feedback = null;
    state.questionResults = {};
    state.sessionQuestions = [];
    state.reportScroll = { unmastered: 0, mastered: 0, drag: null };
    state.sheepLeft = TOTAL_HEARTS;
    state.heartsRemaining = TOTAL_HEARTS;
    state.safeSheep = 0;
    state.rescuedByAnimal = new Array(ANIMAL_LEVELS.length).fill(0);
    state.visitedLevels = new Array(ANIMAL_LEVELS.length).fill(false);
    state.reported = false;
    state.endReason = "";
    state.reportSourcePhase = null;
    state.reportOpenedAt = 0;
    startOverlay.classList.remove("is_hidden");
  }

  function goToLevel(levelIndex, preserveProgress) {
    if (levelIndex < 0 || levelIndex >= QUESTION_LEVELS.length) return;
    startLevel(levelIndex, false, preserveProgress);
    playTone(480, 0.09, "triangle", 0.04, 0, 650);
  }

  function finishGame(reason) {
    if (state.phase === "ended") return;
    state.phase = "ended";
    state.endReason = reason;
    state.reportScroll.unmastered = 0;
    state.reportScroll.mastered = 0;
    state.reportScroll.drag = null;
    startReportNarration();
    if (!state.reported) {
      state.reported = true;
      if (gameTracker) {
        try {
          gameTracker.finish(Number(state.score) || 0);
        } catch (error) {
          console.warn("[GameTracker] 结束上报失败：", error);
        }
      }
      try {
        window.onReport(state.score);
      } catch (error) {
        console.error("onReport(score) 上报失败：", error);
      }
    }
  }

  function evaluateAnswer(selectedOption) {
    if (state.phase !== "playing") return;
    if (!selectedOption) return;

    const question = QUESTIONS[state.questionIndex];
    const correct = selectedOption.text === question.correctOption;
    const result = state.questionResults[question.id] || { correct: false, wrong: false };
    if (correct) result.correct = true;
    else result.wrong = true;
    state.questionResults[question.id] = result;
    const feedbackStart = performance.now();
    const wolfElapsed = Math.max(0, feedbackStart - state.questionStartTime);
    const wolfState = getWolfApproachState(feedbackStart, wolfElapsed);
    state.phase = "feedback";
    state.feedback = {
      kind: correct ? "correct" : "wrong",
      start: feedbackStart,
      duration: reduceMotion ? 900 : (correct ? 2500 : WRONG_FEEDBACK_DURATION),
      sheepBefore: state.sheepLeft,
      wolfElapsed: wolfElapsed,
      wolfState: wolfState,
      effectSoundPlayed: false
    };

    if (correct) {
      state.score += 1;
      playAnimalSound();
      playHappySound();
    } else {
      state.heartsRemaining = Math.max(0, state.heartsRemaining - 1);
      playSadAndLaugh();
    }
  }

  function triggerQuestionTimeout(now) {
    if (state.phase !== "playing") return;
    const question = QUESTIONS[state.questionIndex];
    const result = state.questionResults[question.id] || { correct: false, wrong: false };
    result.wrong = true;
    state.questionResults[question.id] = result;
    state.phase = "feedback";
    state.selectedOptionId = null;
    state.timeLeft = 0;
    state.feedback = {
      kind: "timeout",
      start: now,
      duration: reduceMotion ? 750 : 2800,
      sheepBefore: state.sheepLeft,
      wolfElapsed: Math.max(0, now - state.questionStartTime),
      effectSoundPlayed: false
    };
    state.heartsRemaining = Math.max(0, state.heartsRemaining - 1);
    playTone(310, 0.22, "sawtooth", 0.04, 0, 180);
  }

  function advanceAfterFeedback(now) {
    if (state.phase !== "feedback" || !state.feedback) return;
    if (now - state.feedback.start < state.feedback.duration) return;

    const outcome = state.feedback.kind;
    state.sheepLeft = Math.max(0, state.sheepLeft - 1);
    if (outcome === "correct") {
      state.safeSheep += 1;
      state.rescuedByAnimal[state.levelIndex] = Math.max(state.rescuedByAnimal[state.levelIndex] || 0, state.safeSheep);
    }

    if (state.heartsRemaining <= 0) {
      finishGame(outcome === "timeout" ? "caught" : "river");
      return;
    }

    if (state.questionIndex >= QUESTIONS.length - 1) {
      if (state.levelIndex >= QUESTION_LEVELS.length - 1) {
        finishGame("completed");
        return;
      }
      state.phase = "levelComplete";
      state.levelCompleteStart = now;
      state.feedback = null;
      return;
    }

    state.questionIndex += 1;
    loadQuestion();
    state.phase = "playing";
    state.feedback = null;
  }

  function getRiverBridgeBounds(y) {
    const riverTopY = 545;
    const riverBottomY = 900;
    const progress = Math.max(0, Math.min(1, (y - riverTopY) / (riverBottomY - riverTopY)));
    return {
      left: 650 + (515 - 650) * progress,
      right: 1200 + (1360 - 1200) * progress
    };
  }

  function getLegacySlotRects() {
    const question = QUESTIONS[state.questionIndex];
    if (!question || !question.bridgeTokens) return [];
    ctx.save();
    ctx.font = "900 " + state.wordFontSize + "px Arial, sans-serif";
    const items = question.bridgeTokens.map(function (text, index) {
      const isBlank = text === BRIDGE_BLANK_TOKEN;
      const content = isBlank ? question.correctOption : text;
      return {
        index: index,
        text: text,
        isBlank: isBlank,
        w: Math.max(isBlank ? 100 : 54, Math.min(isBlank ? 330 : 250, ctx.measureText(content).width + (isBlank ? 38 : 28))),
        h: 66
      };
    });
    ctx.restore();

    const contentWidth = items.reduce(function (width, item, index) {
      return width + item.w + (index ? BRIDGE_SLOT_GAP : 0);
    }, 0);

    if (contentWidth > BRIDGE_AREA_W) {
      function layoutTurningBridge(turningKind, scale) {
        const samples = buildTurningBridgeSamples(turningKind);
        const totalDistance = samples[samples.length - 1].distance;
        const clearance = 10;
        let cursor = 8;
        const rects = [];
        for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
          const item = items[itemIndex];
          const width = item.w * scale;
          const height = Math.max(48, item.h * scale);
          let centerDistance = cursor + width / 2;
          let placedRect = null;
          while (centerDistance + width / 2 <= totalDistance - 4) {
            const point = getTurningPointAtDistance(samples, centerDistance);
            const candidate = {
              index: item.index,
              text: item.text,
              isBlank: item.isBlank,
              x: point.x - width / 2,
              y: point.y - height / 2,
              w: width,
              h: height,
              rowIndex: 0,
              fontScale: scale,
              turning: true,
              turningKind: turningKind
            };
            if (!hasSlotOverlap(rects.concat([candidate]))) {
              placedRect = candidate;
              break;
            }
            centerDistance += 4;
          }
          if (!placedRect) return null;
          rects.push(placedRect);
          cursor = centerDistance + width / 2 + clearance;
        }
        return rects;
      }

      function hasSlotOverlap(rects) {
        const clearance = 6;
        for (let firstIndex = 0; firstIndex < rects.length; firstIndex += 1) {
          for (let secondIndex = firstIndex + 1; secondIndex < rects.length; secondIndex += 1) {
            const first = rects[firstIndex];
            const second = rects[secondIndex];
            const separated = first.x + first.w + clearance <= second.x ||
              second.x + second.w + clearance <= first.x ||
              first.y + first.h + clearance <= second.y ||
              second.y + second.h + clearance <= first.y;
            if (!separated) return true;
          }
        }
        return false;
      }

      function findNonOverlappingLayout(turningKind, minimumScale) {
        for (let scale = 1; scale >= minimumScale; scale -= 0.04) {
          const rects = layoutTurningBridge(turningKind, scale);
          if (rects && !hasSlotOverlap(rects)) return rects;
        }
        return null;
      }

      const cornerLayout = findNonOverlappingLayout("corner", 0.82);
      if (cornerLayout) return cornerLayout;
      return findNonOverlappingLayout("zigzag", 0.58) || layoutTurningBridge("zigzag", 0.54) || [];
    }

    const rows = [];
    let row = [];
    let rowWidth = 0;
    items.forEach(function (item) {
      const nextWidth = row.length ? rowWidth + BRIDGE_SLOT_GAP + item.w : item.w;
      if (row.length && nextWidth > BRIDGE_AREA_W) {
        rows.push({ items: row, width: rowWidth });
        row = [item];
        rowWidth = item.w;
      } else {
        row.push(item);
        rowWidth = nextWidth;
      }
    });
    if (row.length) rows.push({ items: row, width: rowWidth });

    const rowGap = 8;
    const totalHeight = rows.length * 66 + Math.max(0, rows.length - 1) * rowGap;
    const startY = Math.max(510, 620 - totalHeight / 2);
    const rects = [];
    rows.forEach(function (entry, rowIndex) {
      let x = BRIDGE_AREA_X + (BRIDGE_AREA_W - entry.width) / 2;
      entry.items.forEach(function (item) {
        rects.push({
          index: item.index,
          text: item.text,
          isBlank: item.isBlank,
          x: x,
          y: startY + rowIndex * (66 + rowGap),
          w: item.w,
          h: item.h,
          rowIndex: rowIndex
        });
        x += item.w + BRIDGE_SLOT_GAP;
      });
    });
    return rects.sort(function (a, b) { return a.index - b.index; });
  }

  function getSlotRects() {
    const question = QUESTIONS[state.questionIndex];
    if (!question || !question.bridgeTokens) return [];
    let chosenLayout = null;

    for (let scale = 1; scale >= 0.68 && !chosenLayout; scale -= 0.06) {
      const fontScale = Math.max(0.68, scale);
      const itemHeight = Math.max(46, Math.round(58 * fontScale));
      const maxRows = Math.floor((RIVER_BRIDGE_BOTTOM_Y - RIVER_BRIDGE_TOP_Y + BRIDGE_ROW_GAP) / (itemHeight + BRIDGE_ROW_GAP));

      ctx.save();
      ctx.font = "900 " + (state.wordFontSize * fontScale) + "px Arial, sans-serif";
      const items = question.bridgeTokens.map(function (text, index) {
        const isBlank = text === BRIDGE_BLANK_TOKEN;
        const content = isBlank ? question.correctOption : text;
        const horizontalPadding = (isBlank ? 34 : 24) * fontScale;
        return {
          index: index,
          text: text,
          isBlank: isBlank,
          w: Math.max(isBlank ? 82 : 46, Math.min(isBlank ? 300 : 230, ctx.measureText(content).width + horizontalPadding)),
          h: itemHeight,
          fontScale: fontScale
        };
      });
      ctx.restore();

      for (let rowCount = 1; rowCount <= maxRows && !chosenLayout; rowCount += 1) {
        const startY = RIVER_BRIDGE_TOP_Y;
        const rows = [];
        let itemIndex = 0;

        for (let rowIndex = 0; rowIndex < rowCount && itemIndex < items.length; rowIndex += 1) {
          const rowY = startY + rowIndex * (itemHeight + BRIDGE_ROW_GAP);
          const bounds = getRiverBridgeBounds(rowY);
          const availableWidth = bounds.right - bounds.left;
          const rowItems = [];
          let rowWidth = 0;
          const rowsRemaining = rowCount - rowIndex;
          const remainingWidth = items.slice(itemIndex).reduce(function (width, item, index) {
            return width + item.w + (index ? BRIDGE_SLOT_GAP : 0);
          }, 0);
          const targetWidth = Math.min(availableWidth, remainingWidth / rowsRemaining);

          while (itemIndex < items.length) {
            const item = items[itemIndex];
            const nextWidth = rowItems.length ? rowWidth + BRIDGE_SLOT_GAP + item.w : item.w;
            const itemsAfterThis = items.length - itemIndex - 1;
            if (rowItems.length && nextWidth > availableWidth) break;
            if (rowItems.length && nextWidth > targetWidth && itemsAfterThis >= rowsRemaining - 1) break;
            if (!rowItems.length && item.w > availableWidth) break;
            rowItems.push(item);
            rowWidth = nextWidth;
            itemIndex += 1;
          }
          if (!rowItems.length) break;
          rows.push({ items: rowItems, width: rowWidth, y: rowY, bounds: bounds });
        }

        if (itemIndex === items.length) chosenLayout = rows;
      }
    }

    if (!chosenLayout) return [];
    const rects = [];
    chosenLayout.forEach(function (entry, rowIndex) {
      const gapWidth = Math.max(0, entry.items.length - 1) * BRIDGE_SLOT_GAP;
      const availableItemWidth = entry.bounds.right - entry.bounds.left - gapWidth;
      const baseItemWidth = entry.items.reduce(function (width, item) { return width + item.w; }, 0);
      const widthScale = baseItemWidth > 0 ? Math.max(1, availableItemWidth / baseItemWidth) : 1;
      let x = entry.bounds.left;
      entry.items.forEach(function (item) {
        const expandedWidth = item.w * widthScale;
        rects.push({
          index: item.index,
          text: item.text,
          isBlank: item.isBlank,
          x: x,
          y: entry.y,
          w: expandedWidth,
          h: item.h,
          rowIndex: rowIndex,
          fontScale: item.fontScale
        });
        x += expandedWidth + BRIDGE_SLOT_GAP;
      });
    });
    return rects.sort(function (a, b) { return a.index - b.index; });
  }

  function getBridgeHazardLayout(mouthOpen, scale) {
    const slots = getSlotRects();
    const blankSlot = slots.find(function (slot) { return slot.isBlank; });
    const fallbackGap = { x: 875, y: RIVER_BRIDGE_TOP_Y, w: 110, h: 58 };
    const gap = blankSlot || fallbackGap;
    const gapX = gap.x + gap.w / 2;
    const bridgeBottom = slots.length ? Math.max.apply(null, slots.map(function (slot) {
      return slot.y + slot.h;
    })) : RIVER_BRIDGE_TOP_Y + 58;
    const mouth = Math.max(0, Math.min(1, mouthOpen || 0));
    const crocodileScale = scale || 0.88;
    const useOpenImage = mouth > 0.2 && crocodileOpenImageReady;
    const width = 315 * crocodileScale * (1 + mouth * 0.05);
    const height = (useOpenImage ? 90 : 86) * crocodileScale * (1 + mouth * 0.04);
    const facing = gapX > WIDTH / 2 ? -1 : 1;
    const mouthOffset = -facing * width * CROCODILE_MOUTH_OFFSET_RATIO;
    const crocodileX = Math.max(width / 2 + 12, Math.min(WIDTH - width / 2 - 12, gapX - mouthOffset));
    const crocodileY = Math.min(HEIGHT - height / 2 - 12, Math.max(690, bridgeBottom + height / 2 + 14));
    return {
      gap: gap,
      gapX: gapX,
      bridgeBottom: bridgeBottom,
      crocodileX: crocodileX,
      crocodileY: crocodileY,
      crocodileScale: crocodileScale,
      facing: facing
    };
  }

  function getWordRect(word) {
    return { x: word.homeX, y: word.homeY, w: word.w, h: word.h };
  }

  function inside(point, rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
  }

  function pointerPosition(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * WIDTH / rect.width,
      y: (clientY - rect.top) * HEIGHT / rect.height
    };
  }

  function getReportScrollMetrics(key, items) {
    const rect = REPORT_COLUMNS[key];
    const contentRect = {
      x: rect.x + 18,
      y: rect.y + 72,
      w: rect.w - 36,
      h: rect.h - 92
    };
    const contentHeight = items.length ? (items.length - 1) * REPORT_ITEM_STEP + 56 : 0;
    return {
      rect: rect,
      contentRect: contentRect,
      contentHeight: contentHeight,
      maxScroll: Math.max(0, contentHeight - contentRect.h)
    };
  }

  function getReportScrollTarget(point) {
    if (state.phase !== "ended" && state.phase !== "report") return null;
    const report = getKnowledgeReport();
    const keys = ["unmastered", "mastered"];
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const metrics = getReportScrollMetrics(key, report[key]);
      if (inside(point, metrics.contentRect)) {
        return { key: key, items: report[key], metrics: metrics };
      }
    }
    return null;
  }

  function openLearningReport() {
    if (state.phase === "ready" || state.phase === "intro" || state.phase === "ended" || state.phase === "report") return;
    state.reportSourcePhase = state.phase;
    state.reportOpenedAt = performance.now();
    state.reportScroll.unmastered = 0;
    state.reportScroll.mastered = 0;
    state.reportScroll.drag = null;
    state.phase = "report";
    startReportNarration();
  }

  function closeLearningReport() {
    if (state.phase !== "report") return;
    stopReportNarration();
    const now = performance.now();
    const pausedDuration = Math.max(0, now - state.reportOpenedAt);
    const sourcePhase = state.reportSourcePhase || "playing";
    if (sourcePhase === "playing") state.questionStartTime += pausedDuration;
    if (sourcePhase === "feedback" && state.feedback) state.feedback.start += pausedDuration;
    state.phase = sourcePhase;
    state.reportSourcePhase = null;
    state.reportOpenedAt = 0;
    state.reportScroll.drag = null;
    playTone(390, 0.07, "triangle", 0.03, 0, 520);
  }

  function beginPointer(point) {
    if (state.phase === "report") {
      const scrollTarget = getReportScrollTarget(point);
      if (scrollTarget && scrollTarget.metrics.maxScroll > 0) {
        state.reportScroll.drag = {
          key: scrollTarget.key,
          startY: point.y,
          startOffset: state.reportScroll[scrollTarget.key],
          maxScroll: scrollTarget.metrics.maxScroll,
          moved: false
        };
        return;
      }
      if (inside(point, state.reportBackButton)) {
        closeLearningReport();
      } else if (inside(point, state.reportRestartButton)) {
        returnToGradeSelection();
      }
      return;
    }
    if (state.phase === "ended") {
      const scrollTarget = getReportScrollTarget(point);
      if (scrollTarget && scrollTarget.metrics.maxScroll > 0) {
        state.reportScroll.drag = {
          key: scrollTarget.key,
          startY: point.y,
          startOffset: state.reportScroll[scrollTarget.key],
          maxScroll: scrollTarget.metrics.maxScroll,
          moved: false
        };
        return;
      }
      if (inside(point, state.playAgainButton)) returnToGradeSelection();
      return;
    }
    if (state.phase !== "ready" && state.phase !== "intro" && state.phase !== "levelComplete" && inside(point, state.reportButton)) {
      openLearningReport();
      return;
    }
    if (state.phase === "levelComplete") {
      return;
    }
    if (state.phase !== "playing") return;

    let selected = null;
    for (let i = state.words.length - 1; i >= 0; i -= 1) {
      if (inside(point, getWordRect(state.words[i]))) {
        selected = state.words[i];
        break;
      }
    }
    if (!selected) return;
    state.selectedOptionId = selected.id;
    playTone(390, 0.06, "triangle", 0.03);
    evaluateAnswer(selected);
  }

  function movePointer(point) {
    if ((state.phase === "ended" || state.phase === "report") && state.reportScroll.drag) {
      const reportDrag = state.reportScroll.drag;
      const deltaY = point.y - reportDrag.startY;
      state.reportScroll[reportDrag.key] = Math.max(0, Math.min(reportDrag.maxScroll, reportDrag.startOffset - deltaY));
      if (Math.abs(deltaY) > 8) reportDrag.moved = true;
      return;
    }
  }

  function endPointer(point) {
    if (state.reportScroll.drag) {
      state.reportScroll.drag = null;
      return;
    }
  }

  canvas.addEventListener("mousedown", function (event) {
    if (Date.now() - state.lastTouchTime < 700) return;
    beginPointer(pointerPosition(event.clientX, event.clientY));
  });
  window.addEventListener("mousemove", function (event) {
    if (Date.now() - state.lastTouchTime < 700) return;
    movePointer(pointerPosition(event.clientX, event.clientY));
  });
  window.addEventListener("mouseup", function (event) {
    if (Date.now() - state.lastTouchTime < 700) return;
    endPointer(pointerPosition(event.clientX, event.clientY));
  });

  canvas.addEventListener("touchstart", function (event) {
    state.lastTouchTime = Date.now();
    if (!event.changedTouches.length) return;
    event.preventDefault();
    const touch = event.changedTouches[0];
    beginPointer(pointerPosition(touch.clientX, touch.clientY));
  }, { passive: false });
  canvas.addEventListener("touchmove", function (event) {
    if (!event.changedTouches.length) return;
    event.preventDefault();
    const touch = event.changedTouches[0];
    movePointer(pointerPosition(touch.clientX, touch.clientY));
  }, { passive: false });
  canvas.addEventListener("touchend", function (event) {
    if (!event.changedTouches.length) return;
    event.preventDefault();
    const touch = event.changedTouches[0];
    endPointer(pointerPosition(touch.clientX, touch.clientY));
  }, { passive: false });

  canvas.addEventListener("wheel", function (event) {
    if (state.phase !== "ended" && state.phase !== "report") return;
    const point = pointerPosition(event.clientX, event.clientY);
    const scrollTarget = getReportScrollTarget(point);
    if (!scrollTarget || scrollTarget.metrics.maxScroll <= 0) return;
    event.preventDefault();
    const scaleY = HEIGHT / canvas.getBoundingClientRect().height;
    const key = scrollTarget.key;
    state.reportScroll[key] = Math.max(0, Math.min(
      scrollTarget.metrics.maxScroll,
      state.reportScroll[key] + event.deltaY * scaleY
    ));
  }, { passive: false });

  function drawBackground() {
    if (backgroundReady) {
      ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      gradient.addColorStop(0, "#72ccee");
      gradient.addColorStop(1, "#74bc6b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    drawPenBacks();
  }

  function drawBarn(x, groundY, scale) {
    const w = 220 * scale;
    const h = 170 * scale;
    ctx.save();
    ctx.translate(x, groundY);
    ctx.fillStyle = "#b84a3e";
    ctx.fillRect(-w / 2, -h, w, h);
    ctx.fillStyle = "#7e302b";
    ctx.beginPath();
    ctx.moveTo(-w * 0.62, -h);
    ctx.lineTo(0, -h - 78 * scale);
    ctx.lineTo(w * 0.62, -h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff2d0";
    ctx.fillRect(-10 * scale, -h - 42 * scale, 20 * scale, 42 * scale);
    ctx.fillStyle = "#713a2b";
    ctx.fillRect(-48 * scale, -104 * scale, 96 * scale, 104 * scale);
    ctx.strokeStyle = "#f4d8a7";
    ctx.lineWidth = 7 * scale;
    ctx.beginPath();
    ctx.moveTo(-44 * scale, -98 * scale);
    ctx.lineTo(44 * scale, -6 * scale);
    ctx.moveTo(44 * scale, -98 * scale);
    ctx.lineTo(-44 * scale, -6 * scale);
    ctx.stroke();
    ctx.fillStyle = "#c9e7f1";
    ctx.fillRect(-86 * scale, -132 * scale, 34 * scale, 34 * scale);
    ctx.fillRect(52 * scale, -132 * scale, 34 * scale, 34 * scale);
    ctx.restore();
  }

  function drawFenceLine(x1, x2, y, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    const outline = color || "#89582f";
    const railGradient = ctx.createLinearGradient(0, y - 34, 0, y + 14);
    railGradient.addColorStop(0, "#d9a064");
    railGradient.addColorStop(0.5, "#be7f46");
    railGradient.addColorStop(1, "#9c6035");
    [y - 29, y].forEach(function (railY) {
      ctx.save();
      ctx.shadowColor = "rgba(76,46,24,0.2)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 3;
      fillRounded(x1, railY, x2 - x1, 11, 4, railGradient, outline, 1.5);
      ctx.restore();
      ctx.strokeStyle = "rgba(255,224,177,0.34)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1 + 8, railY + 3);
      ctx.lineTo(x2 - 8, railY + 3);
      ctx.stroke();
    });

    const posts = [];
    for (let x = x1; x <= x2; x += 82) posts.push(x);
    if (posts[posts.length - 1] < x2 - 18) posts.push(x2);
    posts.forEach(function (x, index) {
      const top = y - 52 - (index % 2) * 3;
      const height = 76 + (index % 2) * 3;
      ctx.save();
      ctx.shadowColor = "rgba(76,46,24,0.22)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 3;
      fillRounded(x - 7, top, 14, height, 4, "#c98b50", "#7d4b2b", 1.7);
      ctx.restore();

      ctx.fillStyle = "#c98b50";
      ctx.strokeStyle = "#7d4b2b";
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(x - 7, top + 5);
      ctx.lineTo(x, top - 6);
      ctx.lineTo(x + 7, top + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,221,170,0.38)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x - 3, top + 10);
      ctx.lineTo(x - 3, top + height - 9);
      ctx.stroke();

      ctx.fillStyle = "#6f452c";
      ctx.beginPath();
      ctx.arc(x + 2, y - 8 + (index % 3) * 7, 2.3, 0, Math.PI * 2);
      ctx.fill();
      [y - 23, y + 6].forEach(function (nailY) {
        ctx.fillStyle = "#5d5960";
        ctx.beginPath();
        ctx.arc(x, nailY, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.46)";
        ctx.beginPath();
        ctx.arc(x - 0.7, nailY - 0.7, 0.7, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    ctx.restore();
  }

  function drawPerspectiveFenceRail(x1, y1, x2, y2, farWidth, nearWidth) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / length;
    const ny = dx / length;
    const farHalf = farWidth / 2;
    const nearHalf = nearWidth / 2;
    const wood = ctx.createLinearGradient(x1, y1, x2, y2);
    wood.addColorStop(0, "#d59a5d");
    wood.addColorStop(0.55, "#bd7d45");
    wood.addColorStop(1, "#9c6035");

    ctx.save();
    ctx.shadowColor = "rgba(76,46,24,0.22)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = wood;
    ctx.strokeStyle = "#7d4b2b";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x1 + nx * farHalf, y1 + ny * farHalf);
    ctx.lineTo(x2 + nx * nearHalf, y2 + ny * nearHalf);
    ctx.lineTo(x2 - nx * nearHalf, y2 - ny * nearHalf);
    ctx.lineTo(x1 - nx * farHalf, y1 - ny * farHalf);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(255,224,177,0.34)";
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1 + nx * farHalf * 0.42, y1 + ny * farHalf * 0.42);
    ctx.lineTo(x2 + nx * nearHalf * 0.42, y2 + ny * nearHalf * 0.42);
    ctx.stroke();
    ctx.restore();
  }

  function drawPerspectiveFencePost(x, railY, scale, facing, index) {
    const halfWidth = 7 * scale;
    const top = railY - 52 * scale;
    const height = 76 * scale;
    ctx.save();
    ctx.shadowColor = "rgba(76,46,24,0.22)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2 * facing;
    ctx.shadowOffsetY = 3;
    fillRounded(x - halfWidth, top, halfWidth * 2, height, 4 * scale, "#c98b50", "#7d4b2b", 1.7);
    ctx.restore();

    ctx.fillStyle = "#c98b50";
    ctx.strokeStyle = "#7d4b2b";
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(x - halfWidth, top + 5 * scale);
    ctx.lineTo(x, top - 6 * scale);
    ctx.lineTo(x + halfWidth, top + 5 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,221,170,0.38)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x - 3 * scale * facing, top + 10 * scale);
    ctx.lineTo(x - 3 * scale * facing, top + height - 9 * scale);
    ctx.stroke();

    ctx.fillStyle = "#6f452c";
    ctx.beginPath();
    ctx.arc(x + 2 * scale * facing, railY - 8 * scale + (index % 2) * 7 * scale, 2.1 * scale, 0, Math.PI * 2);
    ctx.fill();
    [railY - 23 * scale, railY + 6 * scale].forEach(function (nailY) {
      ctx.fillStyle = "#5d5960";
      ctx.beginPath();
      ctx.arc(x, nailY, 2.1 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.46)";
      ctx.beginPath();
      ctx.arc(x - 0.7 * facing, nailY - 0.7, 0.7, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawFenceSide(backX, backY, frontX, frontY, alpha) {
    const facing = frontX >= backX ? 1 : -1;
    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;

    // The two rails follow the pen's depth. Their widening toward the front
    // makes the left and right sides read as mirrored perspective fences.
    drawPerspectiveFenceRail(backX, backY - 25, frontX, frontY - 29, 7, 11);
    drawPerspectiveFenceRail(backX, backY, frontX, frontY, 7, 11);

    [0.56].forEach(function (t, index) {
      const x = backX + (frontX - backX) * t;
      const y = backY + (frontY - backY) * t;
      const scale = 0.76 + t * 0.24;
      drawPerspectiveFencePost(x, y, scale, facing, index);
    });
    ctx.restore();
  }

  function drawPenBacks() {
    drawFenceLine(70, 420, 640, "#9a673c", 0.5);
    drawFenceLine(1245, 1580, 555, "#9a673c", 0.62);
  }

  function drawFenceSideGate(backX, backY, frontX, frontY, gateStart, gateEnd, openProgress, swingDirection, hingeAtEnd, alpha) {
    const open = smoothStep(openProgress);
    const lowerPoint = function (t) {
      return {
        x: backX + (frontX - backX) * t,
        y: backY + (frontY - backY) * t
      };
    };
    const upperPoint = function (t) {
      return {
        x: backX + (frontX - backX) * t,
        y: backY - 25 + (frontY - 29 - (backY - 25)) * t
      };
    };
    const hingeLower = lowerPoint(gateStart);
    const latchLower = lowerPoint(gateEnd);
    const hingeUpper = upperPoint(gateStart);
    const latchUpper = upperPoint(gateEnd);
    const endLower = {
      x: latchLower.x + swingDirection * 68 * open,
      y: hingeLower.y + (latchLower.y - hingeLower.y) * (1 - open * 0.88)
    };
    const endUpper = {
      x: latchUpper.x + swingDirection * 68 * open,
      y: hingeUpper.y + (latchUpper.y - hingeUpper.y) * (1 - open * 0.88)
    };
    const gateStartWidth = 7 + gateStart * 4;
    const gateEndWidth = 7 + gateEnd * 4;
    const fixedLower = hingeAtEnd ? latchLower : hingeLower;
    const fixedUpper = hingeAtEnd ? latchUpper : hingeUpper;
    const movingLower = hingeAtEnd ? hingeLower : latchLower;
    const movingUpper = hingeAtEnd ? hingeUpper : latchUpper;
    const fixedWidth = hingeAtEnd ? gateEndWidth : gateStartWidth;
    const movingWidth = hingeAtEnd ? gateStartWidth : gateEndWidth;
    endLower.x = movingLower.x + swingDirection * 68 * open;
    endLower.y = fixedLower.y + (movingLower.y - fixedLower.y) * (1 - open * 0.88);
    endUpper.x = movingUpper.x + swingDirection * 68 * open;
    endUpper.y = fixedUpper.y + (movingUpper.y - fixedUpper.y) * (1 - open * 0.88);

    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    if (gateStart > 0.01) {
      drawPerspectiveFenceRail(backX, backY - 25, hingeUpper.x, hingeUpper.y, 7, gateStartWidth);
      drawPerspectiveFenceRail(backX, backY, hingeLower.x, hingeLower.y, 7, gateStartWidth);
    }
    drawPerspectiveFenceRail(latchUpper.x, latchUpper.y, frontX, frontY - 29, gateEndWidth, 11);
    drawPerspectiveFenceRail(latchLower.x, latchLower.y, frontX, frontY, gateEndWidth, 11);

    drawPerspectiveFenceRail(fixedUpper.x, fixedUpper.y, endUpper.x, endUpper.y, fixedWidth, movingWidth);
    drawPerspectiveFenceRail(fixedLower.x, fixedLower.y, endLower.x, endLower.y, fixedWidth, movingWidth);
    if (gateStart > 0.06) {
      drawPerspectiveFenceRail(fixedLower.x, fixedLower.y, endUpper.x, endUpper.y, 5, 6);
    }
    if (open > 0.02) {
      drawPerspectiveFencePost(endLower.x, endLower.y, 0.88, swingDirection, 1);
    }
    if (!(hingeAtEnd && gateStart <= 0.06)) {
      drawPerspectiveFencePost(hingeLower.x, hingeLower.y, 0.76 + gateStart * 0.24, swingDirection, 0);
    }
    drawPerspectiveFencePost(latchLower.x, latchLower.y, 0.76 + gateEnd * 0.24, -swingDirection, 1);

    ctx.fillStyle = "#6f452c";
    ctx.beginPath();
    ctx.arc(latchLower.x, latchLower.y - 22, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function getLeftGateOpen(now) {
    const sourcePhase = state.phase === "report" ? state.reportSourcePhase : state.phase;
    if (sourcePhase !== "playing") return 0;
    const sourceNow = state.phase === "report" ? state.reportOpenedAt : now;
    const elapsed = Math.max(0, sourceNow - state.questionStartTime);
    const duration = reduceMotion ? 650 : ANIMAL_EXIT_DURATION;
    const p = Math.max(0, Math.min(1, elapsed / duration));
    return smoothStep(p / 0.12) * (1 - smoothStep((p - 0.58) / 0.2));
  }

  function getRightGateOpen(now) {
    if (state.phase !== "feedback" || !state.feedback || state.feedback.kind !== "correct") return 0;
    const p = Math.max(0, Math.min(1, (now - state.feedback.start) / state.feedback.duration));
    return smoothStep((p - 0.58) / 0.1) * (1 - smoothStep((p - 0.86) / 0.1));
  }

  function drawPenFronts(now) {
    drawFenceSide(70, 640, 70, 770, 0.8);
    drawFenceSideGate(420, 640, 420, 770, 0.28, 0.72, getLeftGateOpen(now), 1, true, 0.88);
    drawFenceLine(70, 420, 770, "#89582f", 0.86);

    drawFenceSideGate(1245, 555, 1290, 750, 0, 0.36, getRightGateOpen(now), -1, true, 0.94);
    drawFenceSide(1580, 555, 1560, 750, 0.9);
    drawFenceLine(1290, 1560, 750, "#89582f", 0.9);
  }

  function drawIntroBackdrop(cameraX) {
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, "#72ccee");
    sky.addColorStop(0.68, "#d7f3f2");
    sky.addColorStop(1, "#a8dfac");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "rgba(255,239,137,0.9)";
    ctx.beginPath();
    ctx.arc(210 - cameraX * 0.08, 135, 58, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(-cameraX * 0.16, 0);
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    [300, 1040, 1780, 2520].forEach(function (cloudX, index) {
      const cloudY = 150 + (index % 2) * 52;
      ctx.beginPath();
      ctx.ellipse(cloudX, cloudY, 104, 33, 0, 0, Math.PI * 2);
      ctx.ellipse(cloudX - 54, cloudY + 8, 58, 25, 0, 0, Math.PI * 2);
      ctx.ellipse(cloudX + 62, cloudY + 10, 68, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    ctx.save();
    ctx.translate(-cameraX * 0.32, 0);
    ctx.fillStyle = "#8bc88b";
    for (let x = -240; x < INTRO_WORLD_WIDTH + 400; x += 520) {
      ctx.beginPath();
      ctx.ellipse(x + 250, 535, 330, 178, 0, Math.PI, Math.PI * 2);
      ctx.lineTo(x + 580, 625);
      ctx.lineTo(x - 80, 625);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "#4f9b6d";
    for (let x = -180; x < INTRO_WORLD_WIDTH + 400; x += 460) {
      ctx.beginPath();
      ctx.ellipse(x + 210, 610, 300, 148, 0, Math.PI, Math.PI * 2);
      ctx.lineTo(x + 520, 690);
      ctx.lineTo(x - 100, 690);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    const ground = ctx.createLinearGradient(0, 530, 0, 900);
    ground.addColorStop(0, "#8bd25e");
    ground.addColorStop(1, "#3f9b58");
    ctx.fillStyle = ground;
    ctx.fillRect(0, 560, WIDTH, HEIGHT - 560);
  }

  function drawIntroCropField(x, y, width, height) {
    ctx.save();
    ctx.fillStyle = "#b66b39";
    ctx.beginPath();
    ctx.moveTo(x + width * 0.12, y);
    ctx.lineTo(x + width * 0.88, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.fill();
    const cropColors = ["#f0c94a", "#ff8f52", "#70bd57", "#f36b6b"];
    for (let row = 0; row < 4; row += 1) {
      const rowY = y + 24 + row * 30;
      ctx.strokeStyle = "rgba(108,61,35,0.48)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x + 30 - row * 4, rowY + 9);
      ctx.lineTo(x + width - 30 + row * 4, rowY + 9);
      ctx.stroke();
      for (let column = 0; column < 8; column += 1) {
        const plantX = x + 48 + column * ((width - 96) / 7);
        ctx.fillStyle = cropColors[(row + column) % cropColors.length];
        ctx.beginPath();
        ctx.arc(plantX, rowY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#3d8b47";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(plantX, rowY + 5);
        ctx.lineTo(plantX, rowY + 17);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawIntroPond(x, y, scale) {
    ctx.save();
    ctx.fillStyle = "rgba(47,133,148,0.22)";
    ctx.beginPath();
    ctx.ellipse(x, y + 10 * scale, 190 * scale, 60 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#73c9c7";
    ctx.beginPath();
    ctx.ellipse(x, y, 182 * scale, 53 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(225,252,245,0.7)";
    ctx.lineWidth = 4;
    [-58, 28, 92].forEach(function (offset) {
      ctx.beginPath();
      ctx.ellipse(x + offset * scale, y, 34 * scale, 9 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawIntroHayBales(x, y) {
    [0, 88, 44].forEach(function (offset, index) {
      const baleY = y - (index === 2 ? 54 : 0);
      fillRounded(x + offset, baleY, 76, 54, 16, "#e6b94f", "#b98132", 3);
      ctx.strokeStyle = "rgba(255,238,158,0.7)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + offset + 14, baleY + 18);
      ctx.lineTo(x + offset + 62, baleY + 36);
      ctx.stroke();
    });
  }

  function drawIntroScene(now) {
    const duration = reduceMotion ? 700 : INTRO_DURATION;
    const p = Math.min(1, (now - state.introStart) / duration);
    const cameraX = INTRO_CAMERA_TRAVEL * smoothStep((p - 0.12) / 0.78);
    state.introCameraX = cameraX;
    drawIntroBackdrop(cameraX);

    ctx.save();
    ctx.translate(-cameraX, 0);

    drawBarn(360, 625, 1.03);
    const introAnimals = [
      { index: 6, x: 990, y: 690, scale: 0.38 },
      { index: 3, x: 700, y: 740, scale: 0.42 },
      { index: 4, x: 1300, y: 775, scale: 0.43 },
      { index: 5, x: 1080, y: 815, scale: 0.43 },
      { index: 0, x: 560, y: 825, scale: 0.45 },
      { index: 1, x: 835, y: 850, scale: 0.48 },
      { index: 7, x: 965, y: 865, scale: 0.51 },
      { index: 2, x: 1210, y: 840, scale: 0.48 }
    ];
    introAnimals.forEach(function (entry, index) {
      drawAnimalAsset(ANIMAL_LEVELS[entry.index], entry.x, entry.y, entry.scale, p > 0.66 ? "anxious" : "normal", now / 120 + index);
    });

    if (p > 0.52) {
      const sneak = smoothStep((p - 0.52) / 0.38);
      const wolfX = 2050 + (1500 - 2050) * sneak;
      const wolfY = 660 + Math.sin(p * Math.PI * 8) * 3;
      ctx.save();
      ctx.globalAlpha = smoothStep((p - 0.52) / 0.1);
      drawWolf(wolfX, wolfY, 0.72, p > 0.7 ? "angry" : "normal", now / 135, -1);
      ctx.restore();
    }
    drawBush(1500, 710, 0.96);
    ctx.restore();

    if (p > 0.93) {
      const fade = (p - 0.93) / 0.07;
      ctx.fillStyle = "rgba(20,45,42," + (fade * 0.18) + ")";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }

  function drawTopHud() {
    const animal = getCurrentAnimal();
    drawHudButton(state.reportButton, "学习报告", COLORS.blue, "▤");
    drawStatusPill(608, 22, 216, 58, "本题：" + state.timeLeft + "秒", COLORS.orange, "⏱");
    drawStatusPill(838, 22, 264, 58, "Level：" + (state.levelIndex + 1) + " · " + animal.name, COLORS.blue, "◆");
    drawStatusPill(1116, 22, 220, 58, "Score：" + state.score, COLORS.green, "★");
    drawHeartStrip(1350, 22, 236, 58);
  }

  function drawHeartStrip(x, y, w, h) {
    fillRounded(x, y, w, h, 25, "rgba(255,255,255,0.94)", "rgba(255,255,255,0.9)", 4);
    const heartSize = 34;
    const heartGap = 8;
    const totalWidth = TOTAL_HEARTS * heartSize + (TOTAL_HEARTS - 1) * heartGap;
    const startX = x + (w - totalWidth) / 2;
    const heartY = y + (h - heartSize) / 2;

    for (let index = 0; index < TOTAL_HEARTS; index += 1) {
      const isLost = index >= state.heartsRemaining;
      ctx.save();
      if (isLost) {
        ctx.filter = "grayscale(1) saturate(0) brightness(0.78)";
        ctx.globalAlpha = 0.48;
      }
      if (heartImageReady) {
        ctx.drawImage(heartImage, 46, 38, 134, 124, startX + index * (heartSize + heartGap), heartY, heartSize, heartSize);
      } else {
        ctx.fillStyle = isLost ? "#aab1b7" : COLORS.red;
        ctx.font = "900 29px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("♥", startX + index * (heartSize + heartGap) + heartSize / 2, y + h / 2 + 2);
      }
      ctx.restore();
    }
  }

  function drawHudButton(rect, text, color, icon) {
    fillRounded(rect.x, rect.y, rect.w, rect.h, 25, "rgba(255,255,255,0.94)", "rgba(255,255,255,0.9)", 4);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(rect.x + 31, rect.y + rect.h / 2, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "900 18px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(icon, rect.x + 31, rect.y + rect.h / 2 + 1);
    ctx.fillStyle = COLORS.ink;
    ctx.font = "900 21px Microsoft YaHei, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(text, rect.x + 59, rect.y + rect.h / 2 + 1);
  }

  function drawStatusPill(x, y, w, h, text, color, icon) {
    fillRounded(x, y, w, h, 25, "rgba(255,255,255,0.94)", "rgba(255,255,255,0.9)", 4);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 31, y + h / 2, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "900 18px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(icon, x + 31, y + h / 2 + 1);
    ctx.fillStyle = COLORS.ink;
    ctx.font = "900 22px Arial, Microsoft YaHei, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(text, x + 59, y + h / 2 + 1);
  }

  function drawQuestionPanel() {
    const question = QUESTIONS[state.questionIndex];
    ctx.font = "800 21px Arial, Microsoft YaHei, sans-serif";
    const layout = getQuestionPanelLayout(question);
    fillRounded(layout.panelX, layout.panelY, layout.panelWidth, layout.panelHeight, 30, "rgba(255,255,255,0.93)", "rgba(255,255,255,0.92)", 5);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = COLORS.blue;
    ctx.font = "800 16px Arial, Microsoft YaHei, sans-serif";
    ctx.fillText(layout.knowledgeText, layout.knowledgeX, layout.knowledgeY);
    ctx.fillStyle = COLORS.ink;
    ctx.font = "800 21px Arial, Microsoft YaHei, sans-serif";
    layout.lines.forEach(function (line, index) {
      drawQuestionLine(line, layout.textX, layout.firstTextY + index * layout.lineHeight);
    });
  }

  function drawBridgeSlots() {
    const slots = getSlotRects();
    if (!slots.length) return;
    const bridgeBroken = state.phase === "feedback" && state.feedback && state.feedback.kind === "wrong";
    ctx.save();
    ctx.strokeStyle = "#6a4725";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    const rowIndexes = slots.map(function (slot) { return slot.rowIndex; }).filter(function (rowIndex, index, values) {
      return values.indexOf(rowIndex) === index;
    });
    rowIndexes.forEach(function (rowIndex) {
      const rowSlots = slots.filter(function (slot) { return slot.rowIndex === rowIndex; });
      const contentStartX = rowSlots[0].x;
      const contentEndX = rowSlots[rowSlots.length - 1].x + rowSlots[rowSlots.length - 1].w;
      const railStartX = contentStartX - 22;
      const railEndX = contentEndX + 22;
      const railTopY = rowSlots[0].y + 10;
      const railBottomY = rowSlots[0].y + rowSlots[0].h - 10;
      const brokenSlot = bridgeBroken ? rowSlots.find(function (slot) { return slot.isBlank; }) : null;
      [railTopY, railBottomY].forEach(function (railY) {
        ctx.beginPath();
        if (!brokenSlot) {
          ctx.moveTo(railStartX, railY);
          ctx.lineTo(railEndX, railY);
        } else {
          const gapStartX = brokenSlot.x - 5;
          const gapEndX = brokenSlot.x + brokenSlot.w + 5;
          if (gapStartX > railStartX) {
            ctx.moveTo(railStartX, railY);
            ctx.lineTo(gapStartX, railY);
          }
          if (gapEndX < railEndX) {
            ctx.moveTo(gapEndX, railY);
            ctx.lineTo(railEndX, railY);
          }
        }
        ctx.stroke();
      });

      ctx.save();
      ctx.strokeStyle = "rgba(106,71,37,0.62)";
      ctx.lineWidth = 3;
      for (let tieX = railStartX + 24; tieX < railEndX - 12; tieX += 54) {
        if (brokenSlot && tieX >= brokenSlot.x - 5 && tieX <= brokenSlot.x + brokenSlot.w + 5) continue;
        ctx.beginPath();
        ctx.moveTo(tieX, railTopY + 2);
        ctx.lineTo(tieX, railBottomY - 2);
        ctx.stroke();
      }
      ctx.restore();
    });

    const selectedOption = state.words.find(function (word) { return word.id === state.selectedOptionId; });
    const drawSlots = slots.filter(function (slot) { return !slot.isBlank; })
      .concat(slots.filter(function (slot) { return slot.isBlank && !bridgeBroken; }));
    drawSlots.forEach(function (slot) {
      ctx.save();
      ctx.translate(slot.x + slot.w / 2, slot.y + slot.h / 2);
      let fill = COLORS.woodLight;
      let stroke = COLORS.woodDark;
      if (slot.isBlank) {
        fill = "rgba(255,248,222,0.96)";
        stroke = COLORS.orangeDark;
        if (selectedOption && state.feedback) {
          fill = state.feedback.kind === "correct" ? "#dff8e8" : "#ffe1d8";
          stroke = state.feedback.kind === "correct" ? COLORS.greenDark : COLORS.red;
        }
      }
      ctx.shadowColor = "rgba(73,45,22,0.18)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      fillRounded(-slot.w / 2, -slot.h / 2, slot.w, slot.h, 12, fill, stroke, slot.isBlank ? 4 : 3);
      ctx.shadowColor = "transparent";
      ctx.fillStyle = COLORS.ink;
      const label = slot.isBlank ? (selectedOption ? selectedOption.text : "?") : slot.text;
      let fontSize = state.wordFontSize * (slot.fontScale || 1);
      ctx.font = "900 " + fontSize + "px Arial, sans-serif";
      while (fontSize > 13 && ctx.measureText(label).width > slot.w - 18) {
        fontSize -= 1;
        ctx.font = "900 " + fontSize + "px Arial, sans-serif";
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 0, 2);
      ctx.restore();
    });
    ctx.restore();
  }

  function drawWordBlock(word) {
    const rect = getWordRect(word);
    const selected = state.selectedOptionId === word.id;
    ctx.save();
    if (selected) {
      ctx.shadowColor = "rgba(36,48,55,0.34)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 7;
    }
    let border = selected ? COLORS.blue : "#c7863b";
    if (selected && state.feedback) border = state.feedback.kind === "correct" ? COLORS.greenDark : COLORS.red;
    fillRounded(rect.x, rect.y, rect.w, rect.h, 18, selected ? "#fff9e7" : "#fff4cf", border, selected ? 5 : 3);
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "rgba(199,134,59,0.12)";
    ctx.fillRect(rect.x + 12, rect.y + 10, Math.max(8, rect.w - 24), 4);
    ctx.fillStyle = COLORS.ink;
    let fontSize = 24;
    ctx.font = "900 " + fontSize + "px Arial, sans-serif";
    while (fontSize > 13 && ctx.measureText(word.text).width > rect.w - 24) {
      fontSize -= 1;
      ctx.font = "900 " + fontSize + "px Arial, sans-serif";
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(word.text, rect.x + rect.w / 2, rect.y + rect.h / 2 + 3);
    ctx.restore();
  }

  function drawWordBank() {
    state.words.forEach(drawWordBlock);
  }

  function drawSunCastShadow(x, groundY, radiusX, radiusY, alpha, castLength) {
    const lightX = state.phase === "intro" ? 210 + state.introCameraX * 0.92 : SUN_X;
    const lightY = state.phase === "intro" ? 135 : SUN_Y;
    const dx = x - lightX;
    const dy = groundY - lightY;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const offsetX = dx / distance * castLength;
    const offsetY = dy / distance * castLength * 0.48;
    const angle = Math.atan2(offsetY, offsetX);
    ctx.save();
    ctx.translate(x + offsetX, groundY + offsetY);
    ctx.rotate(angle);
    ctx.fillStyle = "rgba(31,66,59," + alpha + ")";
    ctx.beginPath();
    ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function getCurrentAnimal() {
    return ANIMAL_LEVELS[Math.max(0, Math.min(state.levelIndex, ANIMAL_LEVELS.length - 1))];
  }

  function drawAnimalAsset(animal, x, y, scale, mood, step) {
    if (!animal || !animal.ready) return;
    const width = animal.width * scale;
    const height = animal.height * scale;
    const footOffset = animal.footOffset * scale;
    const bounceAmount = mood === "happy" ? 7 : (mood === "sad" ? 1 : (mood === "anxious" ? 0 : 1.5));
    const bounce = Math.sin(step || 0) * bounceAmount;
    drawSunCastShadow(x, y + footOffset, width * 0.32, height * 0.052, 0.16, 21 * scale);
    ctx.save();
    ctx.translate(x, y + bounce);
    if (mood === "happy") ctx.rotate(Math.sin((step || 0) * 0.7) * 0.035);
    if (mood === "sad") ctx.rotate(-0.045);
    if (mood === "anxious") ctx.rotate(Math.sin((step || 0) * 1.8) * 0.006);
    ctx.drawImage(animal.image, -width / 2, -height + footOffset, width, height);
    ctx.restore();
  }

  function drawAnimal(x, y, scale, mood, step) {
    drawAnimalAsset(getCurrentAnimal(), x, y, scale, mood, step);
  }

  function drawWolf(x, y, scale, mood, step, facing) {
    if (!wolfImageReady) return;
    const width = 145 * scale;
    const height = 182 * scale;
    const footOffset = 45 * scale;
    const bounce = Math.sin(step || 0) * (mood === "angry" ? 3 : (mood === "smug" ? 1 : 0));
    drawSunCastShadow(x, y + footOffset, width * 0.31, height * 0.047, 0.2, 23 * scale);
    ctx.save();
    ctx.translate(x, y + bounce);
    if (mood === "angry") ctx.rotate(Math.sin((step || 0) * 1.4) * 0.025);
    if (mood === "smug") ctx.rotate(0.025);
    ctx.scale(facing || 1, 1);
    ctx.drawImage(wolfImage, -width / 2, -height + footOffset, width, height);
    ctx.restore();
  }

  function drawPouncingWolf(x, groundY, scale, lift, rotation, mood, step) {
    if (!pounceWolfImageReady) return;
    const width = 220 * scale;
    const height = 191 * scale;
    const footOffset = 45 * scale;
    const jumpLift = Math.max(0, lift || 0);
    const shadowScale = Math.max(0.62, 1 - jumpLift / 190);
    drawSunCastShadow(x, groundY + footOffset, width * 0.31 * shadowScale, height * 0.047 * shadowScale, 0.2, 23 * scale);
    ctx.save();
    ctx.translate(x, groundY - jumpLift);
    ctx.rotate(rotation || 0);
    if (mood === "angry") ctx.rotate(Math.sin((step || 0) * 1.4) * 0.018);
    ctx.drawImage(pounceWolfImage, -width / 2, -height + footOffset, width, height);
    ctx.restore();
  }

  function drawBush(x, groundY, scale) {
    if (!bushImageReady) return;
    const width = 220 * scale;
    const height = 185 * scale;
    const imageSink = 10 * scale;
    drawSunCastShadow(x, groundY, width * 0.31, 8 * scale, 0.11, 22 * scale);
    ctx.save();
    ctx.fillStyle = "rgba(31,66,59,0.13)";
    ctx.beginPath();
    ctx.ellipse(x, groundY - 1 * scale, width * 0.3, 9 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(31,66,59,0.24)";
    ctx.beginPath();
    ctx.ellipse(x, groundY - 2 * scale, width * 0.2, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.drawImage(bushImage, x - width / 2, groundY - height + imageSink, width, height);
    ctx.restore();
  }

  function drawCrocodile(x, y, scale, mouthOpen, step, facing) {
    const bob = Math.sin((step || 0) * 0.7) * 4 * scale;
    const mouth = Math.max(0, Math.min(1, mouthOpen || 0));
    const useOpenImage = mouth > 0.2 && crocodileOpenImageReady;
    const image = useOpenImage ? crocodileOpenImage : crocodileImage;
    if ((!useOpenImage && !crocodileImageReady) || !image) return;
    const width = 315 * scale * (1 + mouth * 0.05);
    const height = (useOpenImage ? 90 : 86) * scale * (1 + mouth * 0.04);

    ctx.save();
    ctx.fillStyle = "rgba(31,66,59,0.2)";
    ctx.beginPath();
    ctx.ellipse(x, y + 22 * scale, width * 0.39, 13 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(x, y + bob - mouth * 5 * scale);
    ctx.scale(facing || 1, 1);
    if (mouth > 0.2) ctx.rotate(Math.sin((step || 0) * 1.8) * 0.015);
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
    ctx.restore();
  }

  function drawRiverRipples(now, x, y) {
    const rippleX = Number.isFinite(x) ? x : 930;
    const rippleY = Number.isFinite(y) ? y : 742;
    ctx.save();
    ctx.strokeStyle = "rgba(216,247,239,0.48)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    const wobble = Math.sin(now / 420) * 12;
    ctx.beginPath();
    ctx.ellipse(rippleX + wobble, rippleY, 128, 21, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(rippleX - wobble * 0.5, rippleY + 32, 86, 13, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawAnimalGroup(baseX, count, mood, now, groundY, spacing, scale) {
    const run = now / 85;
    for (let i = count - 1; i >= 0; i -= 1) {
      drawAnimal(baseX + i * (spacing || SHEEP_SPACING), groundY || SHEEP_GROUND_Y, scale || 0.64, mood, run + i);
    }
  }

  function drawSafeAnimals(count, now) {
    const spacing = 50;
    const safeCount = Math.max(0, count);
    const baseX = SAFE_ANIMAL_CENTER_X - Math.max(0, safeCount - 1) * spacing / 2;
    drawAnimalGroup(baseX, safeCount, "happy", now, SAFE_ANIMAL_GROUND_Y, spacing, 0.68);
  }

  function smoothStep(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  }

  function drawFarmAnimalsBase(now, waitingCount) {
    drawSafeAnimals(state.safeSheep, now);
    drawAnimalGroup(SHEEP_BASE_X, Math.max(0, waitingCount), "anxious", now, WAITING_SHEEP_GROUND_Y, SHEEP_SPACING);
  }

  function getWolfElapsed(now) {
    if (state.phase === "playing") return Math.max(0, now - state.questionStartTime);
    if (state.phase === "report" && state.reportSourcePhase === "playing") {
      return Math.max(0, state.reportOpenedAt - state.questionStartTime);
    }
    if (state.feedback && Number.isFinite(state.feedback.wolfElapsed)) return state.feedback.wolfElapsed;
    return 0;
  }

  function getWolfApproachState(now, elapsedOverride) {
    const elapsed = Math.max(0, Number.isFinite(elapsedOverride) ? elapsedOverride : getWolfElapsed(now));
    const lastStep = WOLF_APPROACH_POSITIONS.length - 1;
    const targetStep = Math.min(lastStep, Math.floor(elapsed / WOLF_MOVE_INTERVAL));
    if (targetStep <= 0) {
      return { x: WOLF_APPROACH_POSITIONS[0], moving: false, progress: 0 };
    }
    const moveElapsed = elapsed - targetStep * WOLF_MOVE_INTERVAL;
    const moveDuration = reduceMotion ? 1 : WOLF_MOVE_DURATION;
    const rawProgress = Math.max(0, Math.min(1, moveElapsed / moveDuration));
    const travelProgress = smoothStep((rawProgress - 0.18) / 0.64);
    const fromX = WOLF_APPROACH_POSITIONS[targetStep - 1];
    const toX = WOLF_APPROACH_POSITIONS[targetStep];
    return {
      x: fromX + (toX - fromX) * travelProgress,
      moving: rawProgress < 1,
      progress: rawProgress
    };
  }

  function drawWolfDisguiseAt(x, now, mood, moving, moveProgress, answerCrouchProgress) {
    const rise = moving ? smoothStep(moveProgress / 0.24) : 0;
    let crouch = moving ? smoothStep((moveProgress - 0.7) / 0.3) : 0;
    let standing = rise * (1 - crouch);
    let bushSettle = moving ? smoothStep((moveProgress - 0.93) / 0.07) : 1;
    let bushPose = moving ? rise * (1 - bushSettle) : 0;
    const walkProgress = Math.max(0, Math.min(1, (moveProgress - 0.18) / 0.64));
    let walking = moving && moveProgress > 0.18 && moveProgress < 0.76;
    let step = walking ? Math.sin(walkProgress * Math.PI * 6) : 0;
    if (Number.isFinite(answerCrouchProgress)) {
      const hide = smoothStep(answerCrouchProgress);
      const startingBushSettle = bushSettle;
      crouch += (1 - crouch) * hide;
      standing = rise * (1 - crouch);
      bushSettle = startingBushSettle + (1 - startingBushSettle) * smoothStep((hide - 0.82) / 0.18);
      bushPose = rise * (1 - bushSettle);
      step *= 1 - hide;
      walking = false;
    }
    const wolfGroundY = 535 - Math.abs(step) * 2.4;
    const bushGroundY = 578 - bushPose * 33 - Math.abs(step) * 1.2;
    const halfFootReveal = 15 * rise * (1 - bushSettle);
    const wolfVisibleBottomY = bushGroundY + 10 * 0.84 + halfFootReveal;
    const wolfSpriteTopY = wolfGroundY - 182 * 0.74 + 45 * 0.74;
    const wolfVisibleTopY = wolfSpriteTopY + (wolfVisibleBottomY - wolfSpriteTopY) * crouch;
    if (standing > 0.004) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, wolfVisibleTopY, WIDTH, Math.max(0, wolfVisibleBottomY - wolfVisibleTopY));
      ctx.clip();
      ctx.globalAlpha = smoothStep(rise / 0.24);
      drawWolf(x, wolfGroundY, 0.74, mood || "normal", now / 110);
      ctx.restore();
    }
    drawBush(x, bushGroundY, 0.84);
  }

  function drawHiddenWolf(now, mood) {
    const feedback = state.phase === "feedback" ? state.feedback : null;
    if (feedback && feedback.kind !== "timeout" && feedback.wolfState) {
      const frozenWolf = feedback.wolfState;
      if (frozenWolf.moving) {
        const hideDuration = reduceMotion ? 1 : WOLF_ANSWER_HIDE_DURATION;
        const hideProgress = Math.max(0, Math.min(1, (now - feedback.start) / hideDuration));
        drawWolfDisguiseAt(frozenWolf.x, now, mood, true, frozenWolf.progress, hideProgress);
      } else {
        drawWolfDisguiseAt(frozenWolf.x, now, mood, false, 0);
      }
      return;
    }
    const approach = getWolfApproachState(now);
    drawWolfDisguiseAt(approach.x, now, mood, approach.moving, approach.progress);
  }

  function drawCrossingSheep(progress, now) {
    const p = Math.max(0, Math.min(1, progress));
    let x;
    let y;
    if (p < 0.66) {
      const t = smoothStep(p / 0.66);
      x = ACTIVE_SHEEP_X + (1200 - ACTIVE_SHEEP_X) * t;
      y = SHEEP_GROUND_Y + (560 - SHEEP_GROUND_Y) * t - Math.sin(t * Math.PI * 5) * 5;
    } else if (p < 0.84) {
      const t = smoothStep((p - 0.66) / 0.18);
      x = 1200 + (1290 - 1200) * t;
      y = 560 + (620 - 560) * t;
    } else {
      const t = smoothStep((p - 0.84) / 0.16);
      x = 1290 + (1340 - 1290) * t;
      y = 620 + (SAFE_ANIMAL_GROUND_Y - 620) * t;
    }
    drawAnimal(x, y, 0.68, "happy", now / 75);
  }

  function drawExitingAnimal(now) {
    const elapsed = Math.max(0, now - state.questionStartTime);
    const duration = reduceMotion ? 650 : ANIMAL_EXIT_DURATION;
    const p = Math.max(0, Math.min(1, elapsed / duration));
    let x = 350;
    let y = 705;
    if (p >= 0.14 && p < 0.38) {
      const t = smoothStep((p - 0.14) / 0.24);
      x = 350 + (420 - 350) * t;
    } else if (p >= 0.38 && p < 0.56) {
      const t = smoothStep((p - 0.38) / 0.18);
      x = 420 + (485 - 420) * t;
      y = 705 + (670 - 705) * t;
    } else if (p >= 0.56) {
      const t = smoothStep((p - 0.56) / 0.44);
      x = 485 + (ACTIVE_SHEEP_X - 485) * t;
      y = 670 + (SHEEP_GROUND_Y - 670) * t - Math.sin(t * Math.PI) * 7;
    }
    drawAnimal(x, y, 0.68, p < 0.9 ? "happy" : "anxious", now / 82);
  }

  function getWrongAnswerAnimation(now) {
    const active = state.phase === "feedback" && state.feedback && state.feedback.kind === "wrong";
    const elapsed = active ? Math.max(0, now - state.feedback.start) : 0;
    const legacyProgress = Math.min(1, elapsed / LEGACY_WRONG_MOTION_DURATION);
    const approach = smoothStep(Math.min(1, legacyProgress / 0.42));
    const fall = smoothStep(Math.max(0, (legacyProgress - 0.34) / 0.54));
    const mouthOpen = smoothStep((elapsed - 920) / 760) * (1 - smoothStep((elapsed - 2440) / 180));
    const bite = smoothStep((elapsed - 2380) / 320);
    const sink = smoothStep((elapsed - 2660) / 980);
    const alpha = 1 - smoothStep((sink - 0.36) / 0.64);
    return {
      active: active,
      elapsed: elapsed,
      approach: approach,
      fall: fall,
      bite: bite,
      sink: sink,
      sinkOffset: sink * 108,
      alpha: alpha,
      mouthOpen: Math.max(0.03, mouthOpen)
    };
  }

  function drawFallingSheep(animation, now, hazard) {
    const approach = animation.approach;
    const gapGroundY = Math.max(SHEEP_GROUND_Y, hazard.gap.y + 8);
    const approachX = ACTIVE_SHEEP_X + (hazard.gapX - ACTIVE_SHEEP_X) * approach;
    const bittenX = hazard.gapX - hazard.facing * 18;
    const x = approachX + (bittenX - approachX) * animation.bite;
    const fall = animation.fall;
    const approachY = SHEEP_GROUND_Y + (gapGroundY - SHEEP_GROUND_Y) * approach;
    const fallingY = approachY + (hazard.crocodileY - 8 - approachY) * fall - Math.sin(Math.min(1, approach) * Math.PI) * 30;
    const bittenY = hazard.crocodileY - 25 + animation.sinkOffset;
    const y = fallingY + (bittenY - fallingY) * animation.bite;
    const scale = 0.68 * (1 - fall * 0.44) * (1 - animation.sink * 0.08);
    const topDownScaleY = 1 - fall * 0.3;
    ctx.save();
    ctx.globalAlpha = animation.alpha;
    ctx.translate(x, y);
    ctx.scale(1, topDownScaleY);
    ctx.translate(-x, -y);
    drawAnimal(x, y, scale, "sad", now / 90);
    ctx.restore();
    if (fall > 0.2 && animation.sink < 0.82) {
      ctx.save();
      ctx.strokeStyle = "rgba(224,250,244," + ((1 - animation.sink) * 0.72) + ")";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(hazard.gapX, hazard.crocodileY + animation.sinkOffset + 8, 28 + fall * 75, 9 + fall * 17, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawWrongAnswerAnimalBelowBridge(now) {
    const animation = getWrongAnswerAnimation(now);
    if (!animation.active || animation.fall <= 0.01) return;
    const hazard = getBridgeHazardLayout(animation.mouthOpen, 0.96);
    drawFallingSheep(animation, now, hazard);
  }

  function drawBridgeHazards(now) {
    const animation = getWrongAnswerAnimation(now);
    const hazard = getBridgeHazardLayout(animation.active ? animation.mouthOpen : 0.03, animation.active ? 0.96 : 0.88);
    const crocodileY = hazard.crocodileY + animation.sinkOffset;
    const crocodileScale = hazard.crocodileScale * (1 - animation.sink * 0.1);
    ctx.save();
    ctx.globalAlpha = animation.alpha;
    drawRiverRipples(now, hazard.crocodileX, crocodileY + 7);
    if (animation.active && animation.fall <= 0.01) drawFallingSheep(animation, now, hazard);
    drawCrocodile(
      hazard.crocodileX,
      crocodileY,
      crocodileScale,
      animation.active ? animation.mouthOpen : 0.03,
      now / (animation.active ? 110 : 260),
      hazard.facing
    );
    ctx.restore();

    if (animation.active && animation.sink > 0.04) {
      ctx.save();
      ctx.globalAlpha = (1 - animation.sink) * 0.72;
      ctx.strokeStyle = "rgba(225,250,244,0.82)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(hazard.gapX, crocodileY + 13, 46 + animation.sink * 118, 10 + animation.sink * 24, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawCharacters(now) {
    if (state.phase === "feedback" && state.feedback) {
      const p = Math.min(1, (now - state.feedback.start) / state.feedback.duration);
      if (state.feedback.kind === "correct") {
        drawFarmAnimalsBase(now, Math.max(0, state.feedback.sheepBefore - 1));
        drawHiddenWolf(now, "normal");
        return;
      }

      const sheepBefore = state.feedback.sheepBefore || state.sheepLeft;
      if (state.feedback.kind === "wrong") {
        drawSafeAnimals(state.safeSheep, now);
        drawAnimalGroup(SHEEP_BASE_X, Math.max(0, sheepBefore - 1), "anxious", now, WAITING_SHEEP_GROUND_Y, SHEEP_SPACING);
        drawHiddenWolf(now, "normal");
        return;
      }

      drawFarmAnimalsBase(now, Math.max(0, sheepBefore - 1));
      const frozenApproach = getWolfApproachState(now, state.feedback.wolfElapsed);
      const launchProgress = Math.min(1, p / 0.46);
      const approach = smoothStep(launchProgress);
      const retreat = smoothStep(Math.max(0, (p - 0.58) / 0.42));
      const attackX = frozenApproach.x + (555 - frozenApproach.x) * approach;
      const wolfX = attackX + (frozenApproach.x - attackX) * retreat;
      const outboundLift = p <= 0.46 ? Math.sin(launchProgress * Math.PI) * 68 : 0;
      const returnLift = p > 0.58 ? Math.sin(retreat * Math.PI) * 20 : 0;
      const wolfLift = outboundLift + returnLift;
      const caught = p >= 0.43;
      const sheepX = caught ? wolfX + 68 : ACTIVE_SHEEP_X;
      const sheepY = SHEEP_GROUND_Y - (caught ? wolfLift * 0.55 + Math.sin(retreat * Math.PI) * 25 : 0);
      const pounceRotation = p <= 0.46 ? -Math.sin(launchProgress * Math.PI) * 0.17 : retreat * 0.035;
      drawAnimal(sheepX, sheepY, 0.68, "sad", now / 85);
      drawPouncingWolf(wolfX, 535, 0.78, wolfLift, pounceRotation, p < 0.58 ? "angry" : "smug", now / 70);
      drawBush(frozenApproach.x, 578, 0.84);
      return;
    }

    const questionInProgress = state.phase === "playing";
    const waitingCount = questionInProgress ? Math.max(0, state.sheepLeft - 1) : state.sheepLeft;
    drawFarmAnimalsBase(now, waitingCount);
    if (questionInProgress && state.sheepLeft > 0) {
      drawExitingAnimal(now);
    }
    drawHiddenWolf(now, "normal");
  }

  function drawCorrectAnswerAnimalAboveBridge(now) {
    if (state.phase !== "feedback" || !state.feedback || state.feedback.kind !== "correct") return;
    const progress = Math.min(1, (now - state.feedback.start) / state.feedback.duration);
    drawCrossingSheep(progress, now);
  }

  function drawFeedback(now) {
    if (state.phase !== "feedback" || !state.feedback) return;
    const animalName = getCurrentAnimal().name;
    const elapsed = now - state.feedback.start;
    const p = Math.min(1, elapsed / state.feedback.duration);
    const kind = state.feedback.kind;
    const correct = kind === "correct";
    const timeout = kind === "timeout";
    const boxW = 520;
    const boxX = (WIDTH - boxW) / 2;
    const lift = reduceMotion ? 0 : Math.sin(Math.min(1, p * 2) * Math.PI) * 8;
    fillRounded(boxX, 338 - lift, boxW, 116, 34, correct ? "rgba(229,255,238,0.96)" : "rgba(255,234,226,0.96)", "rgba(255,255,255,0.95)", 5);
    ctx.fillStyle = correct ? COLORS.green : COLORS.red;
    ctx.font = "900 40px Microsoft YaHei, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(correct ? "答对了！+1 分" : (timeout ? "时间到！狼抓走了" + animalName : "答错了！" + animalName + "掉进河里"), 800, 377 - lift);
    ctx.fillStyle = COLORS.muted;
    ctx.font = "800 20px Microsoft YaHei, sans-serif";
    ctx.fillText(correct ? animalName + "正在前往对岸的安全围栏！" : (timeout ? "每道题只有 20 秒，要抓紧选择！" : "鳄鱼出现了，下一只" + animalName + "要更小心！"), 800, 421 - lift);
  }

  function getReportGradeLabel() {
    const firstQuestion = state.sessionQuestions[0] || QUESTIONS[0];
    const sourceKey = firstQuestion ? firstQuestion.sourceKey : selectedBankKey;
    const match = String(sourceKey).match(/^g(\d+)([ud])$/);
    if (!match) return "年级：--";
    return "年级：" + match[1] + "年级" + (match[2] === "u" ? "上" : "下") + "册";
  }

  function getKnowledgeReport() {
    const points = [];
    state.sessionQuestions.forEach(function (question) {
      if (!state.questionResults[question.id]) return;
      const point = question.knowledgePoint || "综合语法";
      if (points.indexOf(point) < 0) points.push(point);
    });

    return points.reduce(function (report, point) {
      const relatedQuestions = state.sessionQuestions.filter(function (question) {
        return state.questionResults[question.id] && (question.knowledgePoint || "综合语法") === point;
      });
      const mastered = relatedQuestions.every(function (question) {
        const result = state.questionResults[question.id];
        return result && result.correct && !result.wrong;
      });
      report[mastered ? "mastered" : "unmastered"].push(point);
      return report;
    }, { unmastered: [], mastered: [] });
  }

  function getRescueSummary() {
    const summary = ANIMAL_LEVELS.map(function (animal, index) {
      if (!state.visitedLevels[index]) return null;
      return animal.name + " " + (state.rescuedByAnimal[index] || 0);
    }).filter(Boolean).join("  ·  ");
    return summary || "暂无";
  }

  function drawKnowledgeColumn(key, title, items, color) {
    const metrics = getReportScrollMetrics(key, items);
    const x = metrics.rect.x;
    const y = metrics.rect.y;
    const w = metrics.rect.w;
    const h = metrics.rect.h;
    const contentRect = metrics.contentRect;
    const scrollOffset = Math.max(0, Math.min(metrics.maxScroll, state.reportScroll[key]));
    state.reportScroll[key] = scrollOffset;
    fillRounded(x, y, w, h, 28, "rgba(255,255,255,0.74)", "rgba(255,255,255,0.96)", 4);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 34, y + 38, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.ink;
    ctx.font = "900 23px Microsoft YaHei, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(title + "（" + items.length + "）", x + 54, y + 39);

    if (!items.length) {
      ctx.fillStyle = COLORS.muted;
      ctx.font = "700 19px Microsoft YaHei, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("暂无", contentRect.x + contentRect.w / 2, contentRect.y + contentRect.h / 2);
      return;
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(contentRect.x, contentRect.y, contentRect.w, contentRect.h);
    ctx.clip();
    items.forEach(function (item, index) {
      const itemY = contentRect.y + index * REPORT_ITEM_STEP - scrollOffset;
      if (itemY + 56 < contentRect.y || itemY > contentRect.y + contentRect.h) return;
      fillRounded(contentRect.x + 4, itemY, contentRect.w - 12, 56, 18, "rgba(255,248,222,0.94)", "rgba(224,197,132,0.58)", 2);
      let fontSize = 19;
      do {
        ctx.font = "800 " + fontSize + "px Arial, Microsoft YaHei, sans-serif";
        if (ctx.measureText(item).width <= w - 88 || fontSize <= 14) break;
        fontSize -= 1;
      } while (fontSize >= 14);
      ctx.fillStyle = key === "unmastered" ? COLORS.red : COLORS.ink;
      ctx.textAlign = "left";
      ctx.fillText(item, contentRect.x + 24, itemY + 29);
    });
    ctx.restore();

    if (metrics.maxScroll > 0) {
      const trackX = x + w - 14;
      const thumbHeight = Math.max(46, contentRect.h * contentRect.h / metrics.contentHeight);
      const thumbTravel = contentRect.h - thumbHeight;
      const thumbY = contentRect.y + scrollOffset / metrics.maxScroll * thumbTravel;
      fillRounded(trackX, contentRect.y, 6, contentRect.h, 3, "rgba(96,122,141,0.16)", null, 0);
      fillRounded(trackX, thumbY, 6, thumbHeight, 3, color, null, 0);
    }
  }

  function drawLevelCompleteScreen(now) {
    const animal = getCurrentAnimal();
    const nextAnimal = ANIMAL_LEVELS[state.levelIndex + 1];
    const transitionProgress = Math.max(0, Math.min(1, (now - state.levelCompleteStart) / LEVEL_COMPLETE_DURATION));

    ctx.fillStyle = "rgba(24,48,64,0.46)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    fillRounded(480, 235, 640, 390, 38, "rgba(255,248,222,0.98)", "rgba(255,255,255,0.96)", 6);
    ctx.fillStyle = COLORS.green;
    ctx.beginPath();
    ctx.arc(800, 315, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "900 56px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★", 800, 318);
    ctx.fillStyle = COLORS.orangeDark;
    ctx.font = "900 36px Arial, Microsoft YaHei, sans-serif";
    ctx.fillText("第 " + (state.levelIndex + 1) + " 关完成！", 800, 405);

    ctx.fillStyle = COLORS.ink;
    ctx.font = "900 28px Arial, Microsoft YaHei, sans-serif";
    ctx.fillText("Score：" + state.score, 800, 452);

    ctx.font = "900 25px Microsoft YaHei, sans-serif";
    ctx.fillText("本关救出 " + state.safeSheep + " 只" + animal.name, 800, 492);
    if (nextAnimal) {
      ctx.fillStyle = COLORS.muted;
      ctx.font = "800 20px Microsoft YaHei, sans-serif";
      ctx.fillText("2 秒后自动进入下一关：" + nextAnimal.name, 800, 535);
    }

    fillRounded(590, 570, 420, 12, 6, "rgba(82,118,112,0.18)", null, 0);
    fillRounded(590, 570, 420 * transitionProgress, 12, 6, COLORS.green, null, 0);
  }

  function drawEndScreen(isLiveReport) {
    const report = getKnowledgeReport();
    const actionButton = isLiveReport ? state.reportBackButton : state.playAgainButton;
    actionButton.x = isLiveReport ? 490 : 650;
    actionButton.y = 748;
    actionButton.w = isLiveReport ? 280 : 300;
    actionButton.h = 60;
    state.reportRestartButton.x = 830;
    state.reportRestartButton.y = 748;
    state.reportRestartButton.w = 280;
    state.reportRestartButton.h = 60;
    ctx.fillStyle = "rgba(24,48,64,0.54)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    fillRounded(330, 55, 940, 790, 44, "rgba(255,248,222,0.98)", "rgba(255,255,255,0.96)", 6);

    ctx.fillStyle = COLORS.ink;
    ctx.font = "900 38px Microsoft YaHei, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("学习报告", 800, 105);

    fillRounded(380, 145, 840, 58, 20, "rgba(255,255,255,0.78)", "rgba(255,255,255,0.94)", 3);
    ctx.fillStyle = COLORS.ink;
    ctx.font = "900 24px Microsoft YaHei, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(getReportGradeLabel(), 410, 175);

    fillRounded(380, 213, 840, 58, 20, "rgba(255,255,255,0.78)", "rgba(255,255,255,0.94)", 3);
    const rescueSummary = "已救动物：" + getRescueSummary();
    let rescueFontSize = 20;
    ctx.font = "900 " + rescueFontSize + "px Arial, Microsoft YaHei, sans-serif";
    while (rescueFontSize > 15 && ctx.measureText(rescueSummary).width > 780) {
      rescueFontSize -= 1;
      ctx.font = "900 " + rescueFontSize + "px Arial, Microsoft YaHei, sans-serif";
    }
    ctx.fillStyle = COLORS.greenDark;
    ctx.fillText(rescueSummary, 410, 243);

    ctx.fillStyle = COLORS.ink;
    ctx.font = "900 27px Microsoft YaHei, sans-serif";
    ctx.fillText("知识点", 380, 306);
    drawKnowledgeColumn("unmastered", "未掌握知识点", report.unmastered, COLORS.red);
    drawKnowledgeColumn("mastered", "已掌握知识点", report.mastered, COLORS.green);

    drawEndButton(actionButton, isLiveReport ? "继续挑战" : "再玩一次", isLiveReport ? COLORS.blue : COLORS.orange, false);
    if (isLiveReport) drawEndButton(state.reportRestartButton, "再玩一次", COLORS.orange, false);
  }

  function drawEndButton(rect, text, color, disabled) {
    fillRounded(rect.x, rect.y, rect.w, rect.h, 28, disabled ? "#c5ced3" : color, disabled ? "#e6ecef" : "#fff4c7", 4);
    ctx.fillStyle = disabled ? "#eef2f4" : "#fff";
    ctx.font = "900 23px Microsoft YaHei, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
  }

  function render(now) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    if (state.phase === "intro") {
      drawIntroScene(now);
      return;
    }

    drawBackground();
    drawTopHud();
    if (state.phase !== "ready") {
      drawQuestionPanel();
      drawCharacters(now);
      drawWrongAnswerAnimalBelowBridge(now);
      drawBridgeSlots();
      drawCorrectAnswerAnimalAboveBridge(now);
      drawBridgeHazards(now);
      drawPenFronts(now);
      drawWordBank();
      drawFeedback(now);
      if (state.phase === "levelComplete") drawLevelCompleteScreen(now);
      if (state.phase === "ended") drawEndScreen(false);
      if (state.phase === "report") drawEndScreen(true);
    } else {
      drawCharacters(now);
      drawPenFronts(now);
    }
  }

  function update(now) {
    if (state.phase === "playing") {
      const elapsed = now - state.questionStartTime;
      state.timeLeft = Math.max(0, Math.ceil((QUESTION_SECONDS * 1000 - elapsed) / 1000));
      if (state.timeLeft <= 0) {
        triggerQuestionTimeout(now);
      }
    }

    if (state.phase === "intro") {
      const introDuration = reduceMotion ? 700 : INTRO_DURATION;
      if (now - state.introStart >= introDuration) {
        state.phase = "playing";
        state.startTime = now;
        state.questionStartTime = now;
        state.timeLeft = QUESTION_SECONDS;
      }
    }
    if (state.phase === "levelComplete" && now - state.levelCompleteStart >= LEVEL_COMPLETE_DURATION) {
      goToLevel(state.levelIndex + 1, true);
    }
    if (state.phase === "feedback" && state.feedback && state.feedback.kind === "timeout" && !state.feedback.effectSoundPlayed) {
      if (now - state.feedback.start >= state.feedback.duration * 0.5) {
        state.feedback.effectSoundPlayed = true;
        playWolfSound();
      }
    }
    advanceAfterFeedback(now);
    state.lastFrame = now;
  }

  function gameLoop(now) {
    update(now);
    render(now);
    window.requestAnimationFrame(gameLoop);
  }

  if (typeof window.onReport !== "function") {
    window.onReport = function (score) {
      console.log("游戏得分上报：", score);
    };
  }

  QUESTION_BANKS.forEach(function (bank) {
    const gradeBtn = document.createElement("button");
    gradeBtn.type = "button";
    gradeBtn.className = "grade_button" + (bank.key === selectedBankKey ? " is_selected" : "");
    gradeBtn.innerText = bank.shortLabel;
    gradeBtn.setAttribute("data-grade", bank.key);
    gradeBtn.setAttribute("aria-pressed", bank.key === selectedBankKey ? "true" : "false");
    gradeBtn.addEventListener("click", function () {
      selectedBankKey = bank.key;
      Array.prototype.forEach.call(gradeOptions.querySelectorAll(".grade_button"), function (button) {
        const selected = button.getAttribute("data-grade") === selectedBankKey;
        button.classList.toggle("is_selected", selected);
        button.setAttribute("aria-pressed", selected ? "true" : "false");
      });
    });
    gradeOptions.appendChild(gradeBtn);
  });

  const btn = document.createElement('button');
  btn.className = 'start_button';
  btn.innerText = '开始游戏';
  btn.style.cursor = 'pointer';
  btn.addEventListener("click", startGame);
  startButtonMount.appendChild(btn);

  startBackgroundMusic();
  document.addEventListener("pointerdown", startBackgroundMusic, { once: true });
  document.addEventListener("keydown", startBackgroundMusic, { once: true });

  QUESTION_LEVELS = createQuestionLevels(selectedBankKey);
  QUESTIONS = QUESTION_LEVELS[0];
  loadQuestion();
  window.requestAnimationFrame(gameLoop);
}());
