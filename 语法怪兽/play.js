(function () {
  'use strict';

  var canvas = document.getElementById('gameCanvas');
  var ctx = canvas.getContext('2d');
  var WIDTH = 1600;
  var HEIGHT = 900;
  var GAME_SECONDS = 60;
  var MAX_STAGES = 18;
  var QUESTIONS_PER_STAGE = 3;
  var BOSS_QUESTIONS = { 6: 6, 12: 9, 18: 12 };
  var BOSS_HEALTH_COLORS = ['#ff5a68', '#ff9f43', '#ffd95e', '#b982ff'];
  var PLAYER_MAX_LIVES = 6;
  var AMMO_RADIUS = 64;
  var PROJECTILE_RADIUS = 24;
  var SLING = { x: 275, y: 530 };
  var MONSTER = { x: 1110, y: 310, w: 420, h: 455, cx: 1320, cy: 530, shieldRadius: 260 };
  var REPORT_BUTTON = { x: 330, y: 22, w: 150, h: 64 };
  var POTION_BUTTON = { x: 490, y: 22, w: 88, h: 64 };
  var STORED_POTION_WIDTH = 110;
  var STORED_POTION_GAP = 10;
  var STORED_POTION_LAYOUT_SHIFT = 120;
  var HUD_INFO = { x: 590, y: 22, w: 660, h: 64 };
  var POTION_STREAK_TARGET = 5;
  var RESTART_RECT = { x: 620, y: 500, w: 360, h: 96 };
  var STAGE_MENU_DURATION_MS = 1000;
  var BOSS_WARNING_DURATION_MS = 2400;
  var BOSS_ATTACK_DURATION = 2;
  var BOSS_ATTACK_REDUCED_DURATION = 0.8;
  var WIND_ABILITY_DURATION = 1.35;
  var FIRE_ABILITY_DURATION = 1.45;
  var BOSS_EYE_RATIOS = {
    2: [[0.23, 0.372], [0.39, 0.372]],
    5: [[0.398, 0.154], [0.51, 0.154]],
    8: [[0.42, 0.242], [0.495, 0.242]]
  };
  // Canvas text has no inline markup, so titles that require typographic
  // emphasis are kept explicit instead of guessing from capitalization.
  var QUESTION_WORK_TITLES = [
    'Charlie and the Chocolate Factory',
    'The Wandering Earth',
    'Titanic',
    'Mulan',
    'Frozen'
  ];
  // Order matches assets/roport_point/知识点.txt and monster-0001..0074.mp3.
  var KNOWLEDGE_AUDIO_POINTS = [
    'wh-特殊疑问句',
    '含实义动词的一般现在时结构',
    '含be动词的一般现在时结构',
    '频度副词',
    '一般现在时的用法',
    '形容词的功能',
    'there be的句型结构',
    'there be句型be动词的选用',
    '一般将来时',
    '条件状语从句',
    '一般过去时的用法',
    '含实义动词的一般过去时结构',
    '人称代词',
    '形容词性物主代词',
    '名词性物主代词',
    '形物代和名物代的辨析',
    '定冠词',
    '基础连词',
    '现在进行时的用法',
    '现在进行时的句型结构',
    '现在进行时和一般现在时的辨析',
    '反身代词',
    '方位介词',
    '方位介词表示在......上/下',
    '方位介词表示在......前/后',
    '方位介词表示在......旁/间',
    'many/much',
    'how短语特殊疑问句',
    'few/a few/little/a little',
    '情态动词',
    '感叹句',
    '肯定祈使句',
    '否定祈使句',
    '时间状语从句',
    '复合不定代词',
    '序数词',
    '基数词',
    '形容词最高级的用法',
    '形容词比较级的用法',
    '形容词副词的同级比较',
    '现在完成时表示过去持续的动作或状态',
    '现在完成时句式变换',
    'have gone to/have been to/have been in',
    '瞬间动词和持续动词的现在完成时',
    '副词',
    '副词与形容词',
    '形容词副词同形',
    '副词比较级最高级',
    '不定式作宾语',
    '不定式作补语',
    '不定式作状语',
    '疑问词+不定式',
    '常⻅省略to的不定式',
    '动名词作主语',
    '动名词作宾语',
    '-ed/-ing结尾的形容词',
    '一般现在时的被动语态',
    '一般过去时的被动语态',
    '一般将来时的被动语态',
    'too + 形容词;(not +) 形容词 + enough',
    'It\'s+形容词+of/for sb. to do sth.',
    '过去进行时的用法',
    'because, because of辨析',
    '陈述句',
    '一般疑问句',
    'what常考句型',
    '特殊疑问句',
    '选择疑问句',
    '系动词',
    '让步状语从句',
    '语法-宾语从句的引导词',
    '语法-宾语从句的时态',
    '关系代词引导的定语从句',
    '定语从句注意事项'
  ];

  var monsterImages = [];
  var heartImage = null;
  var reviveImage = null;
  var questionDeck = [];
  var deckCursor = 0;
  var stageQuestionSets = {};
  var audioContext = null;
  var effectAudio = {};
  var reportNarrationAudio = null;
  var reportNarrationToken = 0;
  var reportNarrationBackgroundWasPlaying = false;
  var backgroundAutoplayAttempted = false;
  var backgroundMusicPlaying = false;
  var lastFrame = 0;
  var reducedMotion = false;
  var monsterMapTimer = null;
  var loadingStartedAt = Date.now();
  var preloadImages = [];
  var reviveTutorialSeen = false;
  var gameTracker = new GameTracker({
    gameId: 'monster_battle',
    gameVersion: '1.5.0',
    apiUrl: 'http://127.0.0.1:8000/api/v1/events',
    getUserId: function () {
      return window.platformUserId || null;
    }
  });

  var state = {
    phase: 'ready',
    score: 0,
    playerLives: PLAYER_MAX_LIVES,
    stage: 1,
    hp: QUESTIONS_PER_STAGE,
    questionInStage: 0,
    question: null,
    knowledgePoint: '',
    options: [],
    grade: '',
    term: '',
    correctIndex: -1,
    selectedAmmo: -1,
    loadedX: SLING.x,
    loadedY: SLING.y,
    dragging: false,
    projectile: null,
    particles: [],
    shieldActive: true,
    shieldFlash: 0,
    monsterAlpha: 1,
    monsterShake: 0,
    monsterHurtTimer: 0,
    roarTimer: 0,
    lifeEndTimer: 0,
    stageMenuDeadline: 0,
    stageMenuDuration: STAGE_MENU_DURATION_MS,
    bossWrongStreak: 0,
    bossAttackTimer: 0,
    windAbilityUsed: false,
    windAbilityTimer: 0,
    fireAbilityUsed: false,
    fireAbilityTimer: 0,
    elementAbilitySchedule: [],
    transitionKind: '',
    transitionTimer: 0,
    feedback: '',
    feedbackTimer: 0,
    startTime: 0,
    stageDuration: GAME_SECONDS,
    timeLeft: GAME_SECONDS,
    correctStreak: 0,
    revivePotionCount: 0,
    potionPulse: 0,
    reported: false,
    finishReason: '',
    knowledgeResults: {},
    currentQuestionAnswered: false
  };

  var ammoHomes = [];

  function roundedPath(context, x, y, w, h, radius) {
    var r = Math.min(radius, w / 2, h / 2);
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

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function markReviveTutorialSeen() {
    reviveTutorialSeen = true;
  }

  function isBossStage(stageNumber) {
    return Object.prototype.hasOwnProperty.call(BOSS_QUESTIONS, stageNumber);
  }

  function hasRandomWindAbility(stageNumber) {
    return stageNumber >= 7 && stageNumber <= 12;
  }

  function hasRandomElementAbility(stageNumber) {
    return stageNumber >= 13 && stageNumber <= 17;
  }

  function hasDualElementAbility(stageNumber) {
    return stageNumber === 18;
  }

  function questionsForStage(stageNumber) {
    return isBossStage(stageNumber) ? BOSS_QUESTIONS[stageNumber] : QUESTIONS_PER_STAGE;
  }

  function buildElementAbilitySchedule(stageNumber) {
    if (hasRandomWindAbility(stageNumber)) {
      return [{
        question: 1 + Math.floor(Math.random() * questionsForStage(stageNumber)),
        type: 'wind'
      }];
    }
    if (hasRandomElementAbility(stageNumber)) {
      return [{
        question: 1 + Math.floor(Math.random() * questionsForStage(stageNumber)),
        type: Math.random() < 0.5 ? 'wind' : 'fire'
      }];
    }
    if (hasDualElementAbility(stageNumber)) {
      var firstQuestion = 1 + Math.floor(Math.random() * questionsForStage(stageNumber));
      var secondQuestion = firstQuestion;
      while (secondQuestion === firstQuestion) {
        secondQuestion = 1 + Math.floor(Math.random() * questionsForStage(stageNumber));
      }
      var questions = firstQuestion < secondQuestion ?
        [firstQuestion, secondQuestion] : [secondQuestion, firstQuestion];
      var windFirst = Math.random() < 0.5;
      return [
        { question: questions[0], type: windFirst ? 'wind' : 'fire' },
        { question: questions[1], type: windFirst ? 'fire' : 'wind' }
      ];
    }
    return [];
  }

  function bossWaveCount(stageNumber) {
    return Math.ceil(questionsForStage(stageNumber) / QUESTIONS_PER_STAGE);
  }

  function secondsForStage(stageNumber) {
    return GAME_SECONDS * questionsForStage(stageNumber) / QUESTIONS_PER_STAGE;
  }

  function monsterIndexForStage(stageNumber) {
    return Math.min(8, Math.floor((stageNumber - 1) / 2));
  }

  function currentHudShift() {
    return state.revivePotionCount > 0 ? STORED_POTION_LAYOUT_SHIFT : 0;
  }

  function currentReportButton() {
    return {
      x: REPORT_BUTTON.x - currentHudShift(),
      y: REPORT_BUTTON.y,
      w: REPORT_BUTTON.w,
      h: REPORT_BUTTON.h
    };
  }

  function currentPotionButton() {
    return {
      x: POTION_BUTTON.x - currentHudShift(),
      y: POTION_BUTTON.y,
      w: POTION_BUTTON.w,
      h: POTION_BUTTON.h
    };
  }

  function currentStoredPotionButton() {
    var potionButton = currentPotionButton();
    return {
      x: potionButton.x + potionButton.w + STORED_POTION_GAP,
      y: POTION_BUTTON.y,
      w: STORED_POTION_WIDTH,
      h: POTION_BUTTON.h
    };
  }

  function resizeGameShell() {
    var shell = document.getElementById('gameShell');
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || WIDTH;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || HEIGHT;
    shell.style.width = viewportWidth + 'px';
    shell.style.height = viewportHeight + 'px';
  }

  function shuffle(items) {
    var output = items.slice();
    var i;
    for (i = output.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = output[i];
      output[i] = output[j];
      output[j] = temp;
    }
    return output;
  }

  function buildAmmoHomes(optionCount) {
    if (optionCount <= 2) {
      return [
        { x: 90, y: 315 },
        { x: 260, y: 315 }
      ].slice(0, optionCount);
    }
    if (optionCount === 3) {
      return [
        { x: 90, y: 245 },
        { x: 260, y: 245 },
        { x: 175, y: 410 }
      ];
    }
    return [
      { x: 90, y: 230 },
      { x: 260, y: 230 },
      { x: 90, y: 400 },
      { x: 260, y: 400 }
    ].slice(0, optionCount);
  }

  function buildQuestionDeck() {
    var all = [];
    var i;
    if (typeof GRAMMAR_QUESTIONS === 'undefined' || !state.grade || !state.term) {
      return [];
    }
    var list = GRAMMAR_QUESTIONS[state.grade] && GRAMMAR_QUESTIONS[state.grade][state.term];
    if (!list) {
      return [];
    }
    for (i = 0; i < list.length; i += 1) {
      var source = list[i];
      var answer = source.correctOption !== undefined ? source.correctOption : source.answer;
      var options = source.wrongOptions ? source.wrongOptions.slice() : (source.options || []).slice();
      if (answer !== undefined && options.indexOf(answer) < 0) {
        options.push(answer);
      }
      if (!source.question || answer === undefined || options.length < 2) {
        continue;
      }
      all.push({
        grade: state.grade + '年级' + state.term + '册',
        question: source.question,
        knowledgePoint: source.knowledgePoint || '综合语法',
        options: options,
        answer: answer
      });
    }
    return shuffle(all);
  }

  function updateLoadingProgress(completed, total) {
    var percent = total ? Math.round(completed / total * 100) : 100;
    var fill = document.getElementById('loadingBarFill');
    var label = document.getElementById('loadingPercent');
    var progress = document.querySelector('.loading_bar');
    if (fill) {
      fill.style.width = percent + '%';
    }
    if (label) {
      label.innerText = percent + '%';
    }
    if (progress) {
      progress.setAttribute('aria-valuenow', String(percent));
    }
  }

  function finishLoadingScreen() {
    var overlay = document.getElementById('loadingOverlay');
    var remaining = Math.max(0, 850 - (Date.now() - loadingStartedAt));
    window.setTimeout(function () {
      createStartScreen();
      if (!overlay) {
        return;
      }
      overlay.className += ' is-hidden';
      window.setTimeout(function () {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 400);
    }, remaining);
  }

  function loadImages(onComplete) {
    var total = 13;
    var completed = 0;
    var finished = false;
    var fallbackTimer = null;

    function completeLoading() {
      if (finished) {
        return;
      }
      finished = true;
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
      }
      updateLoadingProgress(total, total);
      if (onComplete) {
        onComplete();
      }
    }

    function markLoaded() {
      if (finished) {
        return;
      }
      completed += 1;
      updateLoadingProgress(completed, total);
      if (completed >= total) {
        completeLoading();
      }
    }

    function watchImage(image, source) {
      var settled = false;
      var settle = function () {
        if (settled) {
          return;
        }
        settled = true;
        image.onload = null;
        image.onerror = null;
        markLoaded();
      };
      image.onload = settle;
      image.onerror = settle;
      if (source) {
        image.src = source;
      }
      if (image.complete) {
        window.setTimeout(settle, 0);
      }
    }

    updateLoadingProgress(0, total);
    var i;
    for (i = 1; i <= 9; i += 1) {
      var image = new Image();
      monsterImages.push(image);
      watchImage(image, 'assets/photo/monster' + i + '.png');
    }
    heartImage = new Image();
    watchImage(heartImage, 'assets/photo/aixin.png');

    reviveImage = new Image();
    watchImage(reviveImage, 'assets/photo/revive.png');

    var mapImage = new Image();
    preloadImages.push(mapImage);
    watchImage(mapImage, 'assets/photo/monster_map.svg');

    var backgroundImage = document.getElementById('background');
    if (backgroundImage) {
      watchImage(backgroundImage);
    } else {
      markLoaded();
    }

    fallbackTimer = window.setTimeout(completeLoading, 8000);
  }

  function loadAudioEffects() {
    if (typeof window.Audio !== 'function') {
      return;
    }
    var sources = {
      background: 'assets/yinxiao/background.mp3',
      flick: 'assets/yinxiao/flick.mp3',
      hit: 'assets/yinxiao/hit.mp3',
      monsterhurt: 'assets/yinxiao/monsterhurt.mp3',
      monsterroar: 'assets/yinxiao/monsterroar.mp3',
      monsterlaugh: 'assets/yinxiao/monsterlaugh.mp3',
      wind: 'assets/yinxiao/wind.mp3',
      fire: 'assets/yinxiao/fire.mp3',
      reportNarration: 'assets/report/2.mp3'
    };
    Object.keys(sources).forEach(function (name) {
      var audio = new window.Audio();
      audio.preload = 'auto';
      audio.src = sources[name];
      if (name === 'background') {
        audio.autoplay = true;
        audio.loop = true;
        audio.volume = 0.66;
        audio.playsInline = true;
      } else if (name === 'wind' || name === 'fire') {
        audio.volume = 0.86;
      }
      audio.load();
      effectAudio[name] = audio;
    });
  }

  function takeQuestionFromDeck() {
    if (!questionDeck.length) {
      questionDeck = buildQuestionDeck();
      deckCursor = 0;
    }
    if (deckCursor >= questionDeck.length) {
      questionDeck = shuffle(questionDeck);
      deckCursor = 0;
    }
    var question = questionDeck[deckCursor];
    deckCursor += 1;
    return question;
  }

  function buildStageQuestionSet(stageNumber) {
    var questions = [];
    var i;
    for (i = 0; i < questionsForStage(stageNumber); i += 1) {
      var question = takeQuestionFromDeck();
      var options = shuffle(question.options);
      questions.push({
        question: question,
        options: options,
        correctIndex: options.indexOf(question.answer)
      });
    }
    return questions;
  }

  function prepareQuestion() {
    if (!stageQuestionSets[state.stage]) {
      stageQuestionSets[state.stage] = buildStageQuestionSet(state.stage);
    }
    var questionIndex = clamp(state.questionInStage, 0, questionsForStage(state.stage) - 1);
    var savedQuestion = stageQuestionSets[state.stage][questionIndex];
    state.question = savedQuestion.question;
    state.knowledgePoint = savedQuestion.question.knowledgePoint || '综合语法';
    state.options = savedQuestion.options.slice();
    ammoHomes = buildAmmoHomes(state.options.length);
    state.correctIndex = savedQuestion.correctIndex;
    state.selectedAmmo = -1;
    state.loadedX = SLING.x;
    state.loadedY = SLING.y;
    state.dragging = false;
    state.projectile = null;
    state.shieldActive = true;
    state.currentQuestionAnswered = false;
  }

  function recordKnowledgeResult(isCorrect) {
    var name = state.knowledgePoint || '综合语法';
    if (!state.knowledgeResults[name]) {
      state.knowledgeResults[name] = { correct: 0, wrong: 0 };
    }
    if (isCorrect) {
      state.knowledgeResults[name].correct += 1;
    } else {
      state.knowledgeResults[name].wrong += 1;
    }
  }

  function startReviveTutorialAnimation(overlay) {
    var tutorialCanvas = overlay.querySelector('.revive_tutorial_canvas');
    if (!tutorialCanvas) {
      return function () {};
    }
    var tutorialCtx = tutorialCanvas.getContext('2d');
    var tutorialWidth = tutorialCanvas.width;
    var tutorialHeight = tutorialCanvas.height;
    var startAt = 0;
    var frameId = 0;
    var stopped = false;
    var duration = 12.3;
    var stepElements = overlay.querySelectorAll('.revive_tutorial_step');

    function easeOut(value) {
      var t = clamp(value, 0, 1);
      return 1 - Math.pow(1 - t, 3);
    }

    function tutorialPanel(x, y, w, h, fill, stroke, radius) {
      roundedPath(tutorialCtx, x, y, w, h, radius);
      tutorialCtx.fillStyle = fill;
      tutorialCtx.fill();
      if (stroke) {
        tutorialCtx.strokeStyle = stroke;
        tutorialCtx.lineWidth = 2;
        tutorialCtx.stroke();
      }
    }

    function drawTutorialText(textValue, x, y, size, color, align, weight) {
      tutorialCtx.fillStyle = color;
      tutorialCtx.font = (weight || 800) + ' ' + size + 'px "Microsoft YaHei", Arial, sans-serif';
      tutorialCtx.textAlign = align || 'center';
      tutorialCtx.textBaseline = 'middle';
      tutorialCtx.fillText(textValue, x, y);
    }

    function drawTutorialMonster(shake, flashColor) {
      var image = monsterImages[currentMonsterIndex()] || monsterImages[0];
      var boxX = 638 + (shake ? Math.sin(Date.now() / 24) * 8 : 0);
      var boxY = 64;
      var boxW = 172;
      var boxH = 222;
      if (flashColor) {
        tutorialCtx.save();
        tutorialCtx.globalAlpha = 0.5;
        tutorialCtx.strokeStyle = flashColor;
        tutorialCtx.lineWidth = 8;
        tutorialCtx.beginPath();
        tutorialCtx.arc(boxX + boxW / 2, boxY + boxH / 2, 102, 0, Math.PI * 2);
        tutorialCtx.stroke();
        tutorialCtx.restore();
      }
      if (!image || !image.complete || !image.naturalWidth) {
        tutorialPanel(boxX + 18, boxY + 24, boxW - 36, boxH - 30, '#6e526f', '#b88fba', 58);
        return;
      }
      var ratio = image.naturalWidth / image.naturalHeight;
      var drawH = boxH;
      var drawW = drawH * ratio;
      if (drawW > boxW) {
        drawW = boxW;
        drawH = drawW / ratio;
      }
      tutorialCtx.save();
      tutorialCtx.shadowColor = 'rgba(0,0,0,.55)';
      tutorialCtx.shadowBlur = 18;
      tutorialCtx.drawImage(image, boxX + (boxW - drawW) / 2, boxY + boxH - drawH, drawW, drawH);
      tutorialCtx.restore();
    }

    function drawTutorialSlingshot() {
      tutorialCtx.save();
      tutorialCtx.strokeStyle = '#9a572d';
      tutorialCtx.lineWidth = 12;
      tutorialCtx.lineCap = 'round';
      tutorialCtx.beginPath();
      tutorialCtx.moveTo(82, 238);
      tutorialCtx.lineTo(82, 151);
      tutorialCtx.moveTo(82, 166);
      tutorialCtx.lineTo(57, 128);
      tutorialCtx.moveTo(82, 166);
      tutorialCtx.lineTo(108, 128);
      tutorialCtx.stroke();
      tutorialCtx.strokeStyle = '#48281f';
      tutorialCtx.lineWidth = 5;
      tutorialCtx.beginPath();
      tutorialCtx.moveTo(57, 128);
      tutorialCtx.lineTo(104, 151);
      tutorialCtx.lineTo(108, 128);
      tutorialCtx.stroke();
      tutorialCtx.restore();
    }

    function drawTutorialProjectile(progressValue, correct) {
      var progress = easeOut(progressValue);
      var startX = 104;
      var startY = 151;
      var endX = 656;
      var endY = 157;
      var x = startX + (endX - startX) * progress;
      var y = startY + (endY - startY) * progress - Math.sin(progress * Math.PI) * 38;
      var color = correct ? '#70f6d5' : '#ff5f70';
      var i;
      tutorialCtx.save();
      for (i = 6; i >= 1; i -= 1) {
        var trailProgress = clamp(progress - i * 0.025, 0, 1);
        var trailX = startX + (endX - startX) * trailProgress;
        var trailY = startY + (endY - startY) * trailProgress - Math.sin(trailProgress * Math.PI) * 38;
        tutorialCtx.globalAlpha = (7 - i) * 0.055;
        tutorialCtx.fillStyle = color;
        tutorialCtx.beginPath();
        tutorialCtx.arc(trailX, trailY, 7 + (7 - i), 0, Math.PI * 2);
        tutorialCtx.fill();
      }
      tutorialCtx.globalAlpha = 1;
      tutorialCtx.shadowColor = color;
      tutorialCtx.shadowBlur = 18;
      tutorialCtx.fillStyle = color;
      tutorialCtx.beginPath();
      tutorialCtx.arc(x, y, 21, 0, Math.PI * 2);
      tutorialCtx.fill();
      tutorialCtx.shadowBlur = 0;
      tutorialCtx.strokeStyle = '#effffb';
      tutorialCtx.lineWidth = 3;
      tutorialCtx.stroke();
      drawTutorialText(correct ? '✓' : '×', x, y + 1, 25, '#07332b', 'center', 900);
      tutorialCtx.restore();
    }

    function drawTutorialPotion(x, y, w, h, progressValue, opacity) {
      if (!reviveImage || !reviveImage.complete || !reviveImage.naturalWidth) {
        return;
      }
      tutorialCtx.save();
      tutorialCtx.globalAlpha = opacity === undefined ? 1 : opacity;
      tutorialCtx.filter = 'grayscale(1) brightness(.68)';
      tutorialCtx.drawImage(reviveImage, x, y, w, h);
      tutorialCtx.filter = 'none';
      if (progressValue > 0) {
        var filledHeight = h * clamp(progressValue, 0, 1);
        tutorialCtx.save();
        tutorialCtx.beginPath();
        tutorialCtx.rect(x, y + h - filledHeight, w, filledHeight);
        tutorialCtx.clip();
        tutorialCtx.drawImage(reviveImage, x, y, w, h);
        tutorialCtx.restore();
      }
      tutorialCtx.restore();
    }

    function drawStoredTutorialPotion(count, scaleValue) {
      if (count <= 0 || !reviveImage || !reviveImage.complete || !reviveImage.naturalWidth) {
        return;
      }
      var scale = scaleValue || 1;
      var x = 438;
      var y = 198;
      tutorialCtx.save();
      tutorialCtx.translate(x + 29, y + 39);
      tutorialCtx.scale(scale, scale);
      tutorialCtx.shadowColor = '#ffe47e';
      tutorialCtx.shadowBlur = 18;
      tutorialCtx.drawImage(reviveImage, -27, -38, 54, 76);
      tutorialCtx.shadowBlur = 0;
      tutorialPanel(17, -29, 42, 27, '#ffe47e', '', 12);
      drawTutorialText('×' + count, 38, -15, 15, '#533500', 'center', 900);
      tutorialCtx.restore();
    }

    function drawTutorialHearts(count, restoredProgress) {
      var i;
      for (i = 0; i < PLAYER_MAX_LIVES; i += 1) {
        var x = 612 + i * 34;
        var alive = i < count;
        var isRestoredHeart = i === PLAYER_MAX_LIVES - 1 && restoredProgress > 0;
        tutorialCtx.save();
        tutorialCtx.globalAlpha = alive ? 1 : 0.13;
        if (isRestoredHeart) {
          var restoreProgress = clamp(restoredProgress, 0.01, 1);
          var restoreScale = restoreProgress < 0.65 ?
            0.45 + easeOut(restoreProgress / 0.65) * 0.9 :
            1.35 - easeOut((restoreProgress - 0.65) / 0.35) * 0.35;
          tutorialCtx.translate(x + 13.5, 34.5);
          tutorialCtx.scale(restoreScale, restoreScale);
          tutorialCtx.translate(-(x + 13.5), -34.5);
          tutorialCtx.shadowColor = '#70f6d5';
          tutorialCtx.shadowBlur = 22 * (1 - restoreProgress) + 8;
        }
        if (heartImage && heartImage.complete && heartImage.naturalWidth) {
          tutorialCtx.drawImage(heartImage, x, 22, 27, 25);
        } else {
          tutorialCtx.fillStyle = '#ff5068';
          tutorialCtx.beginPath();
          tutorialCtx.arc(x + 9, 30, 7, Math.PI, 0);
          tutorialCtx.arc(x + 18, 30, 7, Math.PI, 0);
          tutorialCtx.lineTo(x + 13.5, 44);
          tutorialCtx.fill();
        }
        tutorialCtx.restore();
        if (isRestoredHeart && restoredProgress < 0.9) {
          tutorialCtx.save();
          tutorialCtx.globalAlpha = (1 - restoredProgress / 0.9) * 0.8;
          tutorialCtx.strokeStyle = '#70f6d5';
          tutorialCtx.lineWidth = 3;
          tutorialCtx.beginPath();
          tutorialCtx.arc(x + 13.5, 34.5, 14 + restoredProgress * 23, 0, Math.PI * 2);
          tutorialCtx.stroke();
          tutorialCtx.restore();
        }
      }
    }

    function drawFlyingPotion(progressValue) {
      if (!reviveImage || !reviveImage.complete || !reviveImage.naturalWidth) {
        return;
      }
      var p = easeOut(progressValue);
      var startX = 465;
      var startY = 235;
      var endX = 792;
      var endY = 33;
      var x = startX + (endX - startX) * p;
      var y = startY + (endY - startY) * p - Math.sin(p * Math.PI) * 32;
      var size = 48 - p * 20;
      tutorialCtx.save();
      tutorialCtx.globalAlpha = 0.35 + p * 0.65;
      tutorialCtx.shadowColor = '#70f6d5';
      tutorialCtx.shadowBlur = 20;
      tutorialCtx.drawImage(reviveImage, x - size * 0.36, y - size / 2, size * 0.72, size);
      tutorialCtx.restore();
    }

    function setActiveStep(index) {
      var i;
      for (i = 0; i < stepElements.length; i += 1) {
        if (i === index) {
          stepElements[i].classList.add('is-active');
        } else {
          stepElements[i].classList.remove('is-active');
        }
      }
    }

    function renderTutorial(timeValue) {
      tutorialCtx.clearRect(0, 0, tutorialWidth, tutorialHeight);
      var gradient = tutorialCtx.createLinearGradient(0, 0, tutorialWidth, tutorialHeight);
      gradient.addColorStop(0, '#102b35');
      gradient.addColorStop(0.55, '#0a1d2b');
      gradient.addColorStop(1, '#1a1725');
      tutorialCtx.fillStyle = gradient;
      tutorialCtx.fillRect(0, 0, tutorialWidth, tutorialHeight);

      tutorialCtx.save();
      tutorialCtx.globalAlpha = 0.12;
      tutorialCtx.strokeStyle = '#70f6d5';
      tutorialCtx.lineWidth = 2;
      var line;
      for (line = 0; line < 8; line += 1) {
        tutorialCtx.beginPath();
        tutorialCtx.moveTo(line * 125 - 30, tutorialHeight);
        tutorialCtx.lineTo(line * 125 + 120, 0);
        tutorialCtx.stroke();
      }
      tutorialCtx.restore();

      drawTutorialSlingshot();
      var phaseIndex = timeValue < 5.2 ? 0 : (timeValue < 8.7 ? 1 : 2);
      setActiveStep(phaseIndex);
      var progressCount = 0;
      var hearts = PLAYER_MAX_LIVES;
      var storedCount = 0;
      var monsterShake = false;
      var monsterFlash = '';
      var caption = '';
      var storedScale = 1;
      var restoredHeartProgress = 0;

      if (phaseIndex === 0) {
        var cycleLength = 0.8;
        var shotIndex = Math.floor(timeValue / cycleLength);
        var shotLocal = timeValue - shotIndex * cycleLength;
        if (shotIndex < 5) {
          if (shotLocal < 0.62) {
            drawTutorialProjectile(shotLocal / 0.58, true);
          }
          var hasHit = shotLocal >= 0.56;
          progressCount = clamp(shotIndex + (hasHit ? 1 : 0), 0, 5);
          monsterShake = shotLocal >= 0.56 && shotLocal < 0.72;
          monsterFlash = monsterShake ? '#70f6d5' : '';
        } else {
          progressCount = 5;
          storedCount = 1;
          storedScale = 1 + Math.sin((timeValue - 4) * Math.PI * 2) * 0.08;
        }
        caption = progressCount < 5 ? '正确弹药命中怪物：' + progressCount + ' / 5' : '命中 5 次，收集到 1 瓶复活药水！';
      } else if (phaseIndex === 1) {
        var secondTime = timeValue - 5.2;
        storedCount = 1;
        if (secondTime >= 0.15 && secondTime < 1.02) {
          drawTutorialProjectile((secondTime - 0.15) / 0.75, true);
        }
        if (secondTime >= 0.9) {
          progressCount = 1;
        }
        if (secondTime >= 1.35 && secondTime < 2.3) {
          drawTutorialProjectile((secondTime - 1.35) / 0.78, false);
        }
        if (secondTime >= 2.1) {
          progressCount = 0;
          hearts = PLAYER_MAX_LIVES - 1;
          monsterFlash = '#ff5f70';
          monsterShake = secondTime < 2.5;
          caption = '选择错误，进度清零';
        } else if (secondTime >= 0.9) {
          caption = '正确命中一次，收集进度20%';
        } else {
          caption = '';
        }
      } else {
        var thirdTime = timeValue - 8.7;
        progressCount = 0;
        hearts = thirdTime >= 2.45 ? PLAYER_MAX_LIVES : PLAYER_MAX_LIVES - 1;
        storedCount = thirdTime >= 1.2 ? 0 : 1;
        if (thirdTime >= 0.8 && thirdTime < 1.25) {
          tutorialCtx.save();
          tutorialCtx.strokeStyle = '#ffe47e';
          tutorialCtx.lineWidth = 4;
          tutorialCtx.globalAlpha = 0.45 + Math.sin(thirdTime * 18) * 0.25;
          tutorialCtx.beginPath();
          tutorialCtx.arc(467, 237, 43 + Math.sin(thirdTime * 12) * 4, 0, Math.PI * 2);
          tutorialCtx.stroke();
          tutorialCtx.restore();
        }
        if (thirdTime >= 1.2 && thirdTime < 2.25) {
          drawFlyingPotion((thirdTime - 1.2) / 1.05);
        }
        if (thirdTime >= 2.45) {
          restoredHeartProgress = clamp((thirdTime - 2.45) / 0.5, 0.01, 1);
        }
        caption = thirdTime < 2.25 ? '点击使用复活药水' : '药水生效，恢复一颗爱心';
      }

      drawTutorialMonster(monsterShake, monsterFlash);
      drawTutorialHearts(hearts, restoredHeartProgress);
      var potionProgress = progressCount / POTION_STREAK_TARGET;
      drawTutorialPotion(298, 170, 66, 92, potionProgress, 1);
      tutorialPanel(294, 264, 76, 23, 'rgba(3,12,22,.88)', '', 11);
      drawTutorialText(Math.round(potionProgress * 100) + '%', 332, 276, 14, '#dff9f3', 'center', 900);
      drawStoredTutorialPotion(storedCount, storedScale);

      if (caption) {
        tutorialPanel(18, 15, 558, 36, 'rgba(3,12,22,.88)', 'rgba(255,255,255,.14)', 16);
        drawTutorialText(caption, 297, 34, 15, phaseIndex === 1 && hearts < PLAYER_MAX_LIVES ? '#ffd1d5' : '#effffb', 'center', 800);
      }
    }

    function animateTutorial(timestamp) {
      if (stopped) {
        return;
      }
      if (!startAt) {
        startAt = timestamp;
      }
      var timeValue = ((timestamp - startAt) / 1000) % duration;
      renderTutorial(timeValue);
      frameId = window.requestAnimationFrame(animateTutorial);
    }

    frameId = window.requestAnimationFrame(animateTutorial);
    return function () {
      stopped = true;
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }

  function maybeOpenRevivePotionTutorial() {
    if (reviveTutorialSeen) {
      return false;
    }
    var existing = document.querySelector('.revive_tutorial_overlay');
    if (existing) {
      return true;
    }

    var previousPhase = state.phase;
    var stageMenuRemaining = previousPhase === 'stageMenu' ?
      Math.max(0, state.stageMenuDeadline - Date.now()) : 0;
    state.phase = 'tutorial';
    state.dragging = false;

    var overlay = document.createElement('section');
    overlay.className = 'revive_tutorial_overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '复活药水玩法说明');
    overlay.innerHTML =
      '<div class="revive_tutorial_panel">' +
        '<h2 class="revive_tutorial_title">复活药水</h2>' +
        '<div class="revive_tutorial_demo" aria-hidden="true"><canvas class="revive_tutorial_canvas" width="840" height="300"></canvas></div>' +
        '<div class="revive_tutorial_steps">' +
          '<div class="revive_tutorial_step is-one"><strong>正确命中5次</strong></div>' +
          '<div class="revive_tutorial_step is-two"><strong>中途答错进度清零</strong></div>' +
          '<div class="revive_tutorial_step is-three"><strong>使用恢复生命</strong></div>' +
        '</div>' +
        '<button class="revive_tutorial_confirm" type="button">知道了</button>' +
      '</div>';

    var stopTutorialAnimation = function () {};

    function closeTutorial() {
      markReviveTutorialSeen();
      stopTutorialAnimation();
      document.removeEventListener('keydown', handleKeydown);
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      if (previousPhase === 'playing') {
        state.phase = 'playing';
        state.startTime = Date.now() - (state.stageDuration - state.timeLeft) * 1000;
      } else if (previousPhase === 'stageMenu') {
        state.phase = 'stageMenu';
        state.stageMenuDeadline = Date.now() + stageMenuRemaining;
      } else {
        state.phase = previousPhase;
      }
      lastFrame = 0;
    }

    function handleKeydown(event) {
      if (event.key === 'Escape' || event.key === 'Enter') {
        event.preventDefault();
        closeTutorial();
      }
    }

    overlay.querySelector('.revive_tutorial_confirm').addEventListener('click', closeTutorial);
    document.addEventListener('keydown', handleKeydown);
    document.body.appendChild(overlay);
    stopTutorialAnimation = startReviveTutorialAnimation(overlay);
    window.setTimeout(function () {
      var confirmButton = overlay.querySelector('.revive_tutorial_confirm');
      if (confirmButton) {
        confirmButton.focus();
      }
    }, 0);
    return true;
  }

  function resetCorrectStreak() {
    state.correctStreak = 0;
  }

  function collectRevivePotionProgress() {
    state.correctStreak = Math.min(POTION_STREAK_TARGET, state.correctStreak + 1);
    if (state.correctStreak < POTION_STREAK_TARGET) {
      return false;
    }
    state.revivePotionCount += 1;
    state.correctStreak = 0;
    state.potionPulse = reducedMotion ? 0.35 : 1.25;
    state.feedback = '连续答对 5 题！复活药水库存 ×' + state.revivePotionCount;
    state.feedbackTimer = 2;
    sound('correct');
    return true;
  }

  function useRevivePotion() {
    if (state.revivePotionCount <= 0) {
      state.feedback = '复活药水收集中：' + Math.round(state.correctStreak / POTION_STREAK_TARGET * 100) + '%';
      state.feedbackTimer = 1.2;
      return;
    }
    if (state.playerLives >= PLAYER_MAX_LIVES) {
      state.feedback = '爱心已满，复活药水已为你保留';
      state.feedbackTimer = 1.4;
      return;
    }
    state.playerLives = Math.min(PLAYER_MAX_LIVES, state.playerLives + 1);
    state.revivePotionCount -= 1;
    state.potionPulse = reducedMotion ? 0.25 : 0.8;
    if (state.lifeEndTimer > 0) {
      state.lifeEndTimer = 0;
      state.roarTimer = 0;
      resetAttempt();
    }
    state.feedback = '使用复活药水，恢复 1 颗爱心！库存 ×' + state.revivePotionCount;
    state.feedbackTimer = 1.8;
    sound('correct');
  }

  function knowledgeReportLists() {
    var mastered = [];
    var unmastered = [];
    Object.keys(state.knowledgeResults).forEach(function (name) {
      var result = state.knowledgeResults[name];
      if (result.wrong > 0 || result.correct === 0) {
        unmastered.push(name);
      } else {
        mastered.push(name);
      }
    });
    return {
      mastered: mastered.sort(),
      unmastered: unmastered.sort()
    };
  }

  function appendKnowledgeList(container, items, emptyText) {
    var list = document.createElement('ul');
    list.className = 'knowledge_list';
    if (!items.length) {
      var empty = document.createElement('li');
      empty.className = 'knowledge_empty';
      empty.innerText = emptyText;
      list.appendChild(empty);
    } else {
      items.forEach(function (item) {
        var listItem = document.createElement('li');
        listItem.className = 'knowledge_item';
        listItem.innerText = item;
        list.appendChild(listItem);
      });
    }
    container.appendChild(list);
  }

  function knowledgeAudioSource(name) {
    var index = KNOWLEDGE_AUDIO_POINTS.indexOf(name);
    if (index < 0) {
      return null;
    }
    var audioNumber = String(index + 1);
    while (audioNumber.length < 4) {
      audioNumber = '0' + audioNumber;
    }
    return 'assets/roport_point/monster-' + audioNumber + '.mp3';
  }

  function reportNarrationSources(unmastered) {
    if (!unmastered.length) {
      return ['assets/report/2.mp3'];
    }
    var sources = ['assets/report/1_1.mp3'];
    unmastered.slice(0, 3).forEach(function (name) {
      var source = knowledgeAudioSource(name);
      if (source) {
        sources.push(source);
      }
    });
    sources.push('assets/report/1_2.mp3');
    return sources;
  }

  function restoreBackgroundAfterNarration() {
    var music = effectAudio.background;
    if (!reportNarrationBackgroundWasPlaying || !music) {
      reportNarrationBackgroundWasPlaying = false;
      return;
    }
    reportNarrationBackgroundWasPlaying = false;
    var playPromise = music.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(function () {
        backgroundMusicPlaying = true;
      }).catch(function () {
        backgroundMusicPlaying = false;
      });
    } else {
      backgroundMusicPlaying = !music.paused;
    }
  }

  function stopReportNarration(restoreBackground) {
    reportNarrationToken += 1;
    if (reportNarrationAudio) {
      reportNarrationAudio.onended = null;
      reportNarrationAudio.onerror = null;
      reportNarrationAudio.pause();
      reportNarrationAudio = null;
    }
    if (restoreBackground !== false) {
      restoreBackgroundAfterNarration();
    }
  }

  function startReportNarration(unmastered) {
    stopReportNarration();
    if (typeof window.Audio !== 'function' && !effectAudio.reportNarration) {
      return;
    }

    var sources = reportNarrationSources(unmastered);
    var token = reportNarrationToken;
    var music = effectAudio.background;
    reportNarrationBackgroundWasPlaying = Boolean(music && !music.paused);
    if (reportNarrationBackgroundWasPlaying) {
      music.pause();
      backgroundMusicPlaying = false;
    }
    var audio = effectAudio.reportNarration || new window.Audio();
    reportNarrationAudio = audio;

    function playNext(index) {
      if (token !== reportNarrationToken || reportNarrationAudio !== audio) {
        return;
      }
      if (index >= sources.length) {
        stopReportNarration();
        return;
      }
      audio.pause();
      audio.preload = 'auto';
      audio.src = sources[index];
      audio.volume = 1;
      audio.playsInline = true;
      var settled = false;
      function advance() {
        if (settled) {
          return;
        }
        settled = true;
        audio.onended = null;
        audio.onerror = null;
        playNext(index + 1);
      }
      audio.onended = advance;
      audio.onerror = advance;
      var playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(advance);
      }
    }

    playNext(0);
  }

  function createLearningReport(isPreview) {
    stopReportNarration();
    var existing = document.querySelector('.learning_report_overlay');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    var lists = knowledgeReportLists();
    var overlay = document.createElement('section');
    overlay.className = 'learning_report_overlay';
    overlay.setAttribute('aria-label', '学习报告');

    var panel = document.createElement('div');
    panel.className = 'learning_report_panel';

    var header = document.createElement('header');
    header.className = 'learning_report_header';
    var meta = document.createElement('p');
    meta.className = 'learning_report_meta';
    meta.innerText = '年级：' + state.grade + '年级' + state.term + '册';
    header.appendChild(meta);

    var body = document.createElement('div');
    body.className = 'learning_report_body';
    var sectionTitle = document.createElement('h2');
    sectionTitle.className = 'learning_report_section_title';
    sectionTitle.innerText = '知识点';
    body.appendChild(sectionTitle);

    var groups = document.createElement('div');
    groups.className = 'knowledge_groups';

    var unmasteredGroup = document.createElement('section');
    unmasteredGroup.className = 'knowledge_group is-unmastered';
    var unmasteredTitle = document.createElement('h3');
    unmasteredTitle.className = 'knowledge_group_title';
    unmasteredTitle.innerText = '未掌握知识点（' + lists.unmastered.length + '）';
    unmasteredGroup.appendChild(unmasteredTitle);
    appendKnowledgeList(unmasteredGroup, lists.unmastered, '本次没有未掌握知识点');

    var masteredGroup = document.createElement('section');
    masteredGroup.className = 'knowledge_group is-mastered';
    var masteredTitle = document.createElement('h3');
    masteredTitle.className = 'knowledge_group_title';
    masteredTitle.innerText = '已掌握知识点（' + lists.mastered.length + '）';
    masteredGroup.appendChild(masteredTitle);
    appendKnowledgeList(masteredGroup, lists.mastered, '本次暂无已掌握知识点');

    groups.appendChild(unmasteredGroup);
    groups.appendChild(masteredGroup);
    body.appendChild(groups);

    var actions = document.createElement('div');
    actions.className = 'learning_report_actions';
    var focusButton = null;

    if (isPreview) {
      var continueButton = document.createElement('button');
      continueButton.className = 'learning_report_restart';
      continueButton.type = 'button';
      continueButton.innerText = '继续挑战';
      continueButton.addEventListener('click', function () {
        stopReportNarration();
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        state.phase = 'playing';
        state.startTime = Date.now() - (state.stageDuration - state.timeLeft) * 1000;
        lastFrame = 0;
      });
      actions.appendChild(continueButton);
      focusButton = continueButton;
    }

    var restartButton = document.createElement('button');
    restartButton.className = 'learning_report_restart' + (isPreview ? ' is-replay' : '');
    restartButton.type = 'button';
    restartButton.innerText = '再玩一次';
    restartButton.addEventListener('click', function () {
      stopReportNarration();
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      returnToGradeSelection();
    });
    actions.appendChild(restartButton);
    focusButton = focusButton || restartButton;

    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(actions);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    focusButton.focus();
    startReportNarration(lists.unmastered);
  }

  function openLearningReport() {
    if (state.phase !== 'playing') {
      return;
    }
    state.phase = 'report';
    state.dragging = false;
    createLearningReport(true);
  }

  function unlockAudio() {
    Object.keys(effectAudio).forEach(function (name) {
      var audio = effectAudio[name];
      audio.muted = true;
      var playPromise = audio.play();
      var resetAudio = function () {
        if (!audio.muted) {
          return;
        }
        audio.pause();
        try {
          audio.currentTime = 0;
        } catch (error) {
          // Some older iOS versions reject seeking until metadata is available.
        }
        audio.muted = false;
      };
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(resetAudio).catch(function () {
          if (audio.muted) {
            audio.muted = false;
          }
        });
      } else {
        resetAudio();
      }
    });

    var AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      return;
    }
    if (!audioContext) {
      audioContext = new AudioCtor();
    }
    if (audioContext.state === 'suspended' && audioContext.resume) {
      audioContext.resume();
    }
  }

  function playEffect(name, onEnded) {
    var audio = effectAudio[name];
    if (!audio) {
      if (onEnded) {
        onEnded();
      }
      return;
    }

    audio.pause();
    audio.muted = false;
    try {
      audio.currentTime = 0;
    } catch (error) {
      // Playback can still begin on iOS even when an early seek is unavailable.
    }
    var completed = false;
    var fallbackTimer = null;
    var completeEffect = function () {
      if (completed) {
        return;
      }
      completed = true;
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
      }
      audio.onended = null;
      if (onEnded) {
        onEnded();
      }
    };
    audio.onended = onEnded ? completeEffect : null;
    if (onEnded) {
      var fallbackDelay = isFinite(audio.duration) && audio.duration > 0 ? audio.duration * 1000 + 300 : 2500;
      fallbackTimer = window.setTimeout(completeEffect, fallbackDelay);
    }
    var playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        completeEffect();
      });
    }
  }

  function startBackgroundMusic() {
    var music = effectAudio.background;
    if (!music) {
      return;
    }
    backgroundAutoplayAttempted = true;
    music.loop = true;
    music.volume = 0.66;
    music.muted = false;
    var playPromise = music.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(function () {
        backgroundMusicPlaying = true;
      }).catch(function () {
        backgroundMusicPlaying = false;
        // A later user interaction can retry playback if the browser blocks it.
      });
    } else {
      backgroundMusicPlaying = !music.paused;
    }
  }

  function sound(kind) {
    if (!audioContext) {
      return;
    }
    var now = audioContext.currentTime;
    var oscillator = audioContext.createOscillator();
    var gain = audioContext.createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    if (kind === 'launch') {
      oscillator.frequency.setValueAtTime(280, now);
      oscillator.frequency.exponentialRampToValueAtTime(620, now + 0.14);
    } else if (kind === 'correct') {
      oscillator.frequency.setValueAtTime(520, now);
      oscillator.frequency.exponentialRampToValueAtTime(920, now + 0.2);
    } else if (kind === 'wrong') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(190, now);
      oscillator.frequency.exponentialRampToValueAtTime(95, now + 0.22);
    } else if (kind === 'roar') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(245, now);
      oscillator.frequency.exponentialRampToValueAtTime(72, now + 0.24);
    } else if (kind === 'wind') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now);
      oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.24);
    } else if (kind === 'fire') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(135, now);
      oscillator.frequency.exponentialRampToValueAtTime(520, now + 0.11);
      oscillator.frequency.exponentialRampToValueAtTime(92, now + 0.24);
    } else {
      oscillator.frequency.setValueAtTime(360, now);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.13, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    oscillator.start(now);
    oscillator.stop(now + 0.25);
  }

  function buildAllStageQuestionSets() {
    var stageNumber;
    for (stageNumber = 1; stageNumber <= MAX_STAGES; stageNumber += 1) {
      stageQuestionSets[stageNumber] = buildStageQuestionSet(stageNumber);
    }
  }

  function buildMonsterMapData() {
    var mapData = [];
    var monsterIndex;
    for (monsterIndex = 0; monsterIndex < monsterImages.length; monsterIndex += 1) {
      var knowledgePoints = [];
      var seen = {};
      var firstStage = monsterIndex * 2 + 1;
      var stageNumber;
      for (stageNumber = firstStage; stageNumber <= firstStage + 1; stageNumber += 1) {
        var questions = stageQuestionSets[stageNumber] || [];
        var questionIndex;
        for (questionIndex = 0; questionIndex < questions.length; questionIndex += 1) {
          var point = questions[questionIndex].question.knowledgePoint || '综合语法';
          if (!seen[point]) {
            seen[point] = true;
            knowledgePoints.push(point);
          }
        }
      }
      mapData.push({
        index: monsterIndex,
        knowledgePoints: knowledgePoints.length ? knowledgePoints : ['综合语法']
      });
    }
    return mapData;
  }

  function enterPlayingPhase() {
    state.phase = 'playing';
    state.stageDuration = secondsForStage(state.stage);
    state.timeLeft = state.stageDuration;
    state.startTime = Date.now();
    lastFrame = 0;
  }

  function createMonsterMapScreen() {
    var existing = document.querySelector('.monster_map_overlay');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
    if (monsterMapTimer) {
      window.clearTimeout(monsterMapTimer);
      monsterMapTimer = null;
    }

    var overlay = document.createElement('section');
    overlay.className = 'monster_map_overlay';
    overlay.setAttribute('aria-label', '怪兽知识地图');

    var viewport = document.createElement('div');
    viewport.className = 'monster_map_viewport';
    var track = document.createElement('div');
    track.className = 'monster_map_track';

    var route = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    route.setAttribute('class', 'monster_map_route');
    route.setAttribute('viewBox', '0 0 2400 560');
    route.setAttribute('aria-hidden', 'true');
    var routePath = 'M180 390 C280 390 340 250 440 240 S600 350 700 390 ' +
      'S860 225 960 210 S1120 310 1220 380 S1380 220 1480 200 ' +
      'S1640 310 1740 370 S1900 230 2000 190 S2160 290 2240 360';
    var routeShadow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    routeShadow.setAttribute('class', 'monster_map_route_shadow');
    routeShadow.setAttribute('d', routePath);
    var routeLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    routeLine.setAttribute('class', 'monster_map_route_line');
    routeLine.setAttribute('d', routePath);
    route.appendChild(routeShadow);
    route.appendChild(routeLine);
    track.appendChild(route);

    var nodePositions = [
      { x: 180, y: 390, label: 'above' },
      { x: 440, y: 240, label: 'below' },
      { x: 700, y: 390, label: 'above' },
      { x: 960, y: 210, label: 'below' },
      { x: 1220, y: 380, label: 'above' },
      { x: 1480, y: 200, label: 'below' },
      { x: 1740, y: 370, label: 'above' },
      { x: 2000, y: 190, label: 'below' },
      { x: 2240, y: 360, label: 'above' }
    ];

    buildMonsterMapData().forEach(function (monster) {
      var position = nodePositions[monster.index];
      var node = document.createElement('article');
      node.className = 'monster_map_node';
      node.style.left = position.x + 'px';
      node.style.top = position.y + 'px';
      node.setAttribute('aria-label', '怪兽 ' + (monster.index + 1) + '：' + monster.knowledgePoints.join('、'));

      var marker = document.createElement('span');
      marker.className = 'monster_map_marker';

      var figure = document.createElement('figure');
      figure.className = 'monster_map_figure';
      var image = document.createElement('img');
      image.className = 'monster_map_image';
      image.src = 'assets/photo/monster' + (monster.index + 1) + '.png';
      image.alt = '怪兽 ' + (monster.index + 1);
      var caption = document.createElement('figcaption');
      caption.className = 'monster_map_name';
      caption.innerText = '怪兽 ' + (monster.index + 1);
      figure.appendChild(image);
      figure.appendChild(caption);

      var knowledge = document.createElement('div');
      knowledge.className = 'monster_map_knowledge is-' + position.label;
      knowledge.innerText = monster.knowledgePoints.join(' · ');

      node.appendChild(marker);
      node.appendChild(figure);
      node.appendChild(knowledge);
      track.appendChild(node);
    });

    viewport.appendChild(track);
    overlay.appendChild(viewport);
    var progress = document.createElement('div');
    progress.className = 'monster_map_progress';
    overlay.appendChild(progress);
    document.body.appendChild(overlay);

    window.requestAnimationFrame(function () {
      var travel = Math.max(0, track.scrollWidth - viewport.clientWidth);
      if (travel > 0) {
        window.setTimeout(function () {
          track.style.transition = 'transform 4.8s linear';
          track.style.transform = 'translateX(-' + travel + 'px)';
        }, 800);
      }
    });

    window.setTimeout(function () {
      overlay.className += ' is-ending';
    }, 5700);
    monsterMapTimer = window.setTimeout(function () {
      monsterMapTimer = null;
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      enterPlayingPhase();
    }, 6000);
  }

  function startGame(showMonsterMap) {
    if (!state.grade || !state.term) {
      return;
    }
    gameTracker.start();
    unlockAudio();
    state.phase = showMonsterMap ? 'map' : 'playing';
    state.score = 0;
    state.playerLives = PLAYER_MAX_LIVES;
    state.stage = 1;
    state.hp = questionsForStage(state.stage);
    state.questionInStage = 0;
    state.particles = [];
    state.transitionKind = '';
    state.transitionTimer = 0;
    state.feedback = '';
    state.feedbackTimer = 0;
    state.monsterAlpha = 1;
    state.monsterShake = 0;
    state.monsterHurtTimer = 0;
    state.roarTimer = 0;
    state.lifeEndTimer = 0;
    state.stageMenuDeadline = 0;
    state.stageMenuDuration = STAGE_MENU_DURATION_MS;
    state.bossWrongStreak = 0;
    state.bossAttackTimer = 0;
    state.windAbilityUsed = false;
    state.windAbilityTimer = 0;
    state.fireAbilityUsed = false;
    state.fireAbilityTimer = 0;
    state.elementAbilitySchedule = buildElementAbilitySchedule(state.stage);
    state.shieldFlash = 0;
    state.stageDuration = secondsForStage(state.stage);
    state.timeLeft = state.stageDuration;
    state.startTime = 0;
    state.correctStreak = 0;
    state.revivePotionCount = 0;
    state.potionPulse = 0;
    state.reported = false;
    state.finishReason = '';
    state.knowledgeResults = {};
    state.currentQuestionAnswered = false;
    questionDeck = buildQuestionDeck();
    deckCursor = 0;
    stageQuestionSets = {};
    buildAllStageQuestionSets();
    prepareQuestion();
    startBackgroundMusic();
    if (showMonsterMap) {
      createMonsterMapScreen();
    } else {
      enterPlayingPhase();
    }
  }

  function returnToGradeSelection() {
    var existingReport = document.querySelector('.learning_report_overlay');
    var existingStart = document.querySelector('.start_overlay');
    if (existingReport && existingReport.parentNode) {
      existingReport.parentNode.removeChild(existingReport);
    }
    if (existingStart && existingStart.parentNode) {
      existingStart.parentNode.removeChild(existingStart);
    }
    if (monsterMapTimer) {
      window.clearTimeout(monsterMapTimer);
      monsterMapTimer = null;
    }
    state.phase = 'ready';
    state.grade = '';
    state.term = '';
    state.dragging = false;
    state.projectile = null;
    state.transitionKind = '';
    state.transitionTimer = 0;
    state.stageMenuDeadline = 0;
    state.stageDuration = GAME_SECONDS;
    state.timeLeft = state.stageDuration;
    lastFrame = 0;
    createStartScreen();
  }

  function createStartScreen() {
    var overlay = document.createElement('section');
    overlay.className = 'start_overlay';

    var panel = document.createElement('div');
    panel.className = 'grade_panel';

    var gradeOptions = document.createElement('div');
    gradeOptions.className = 'grade_options';
    gradeOptions.setAttribute('role', 'group');
    gradeOptions.setAttribute('aria-label', '选择年级和分册');

    var tip = document.createElement('p');
    tip.className = 'start_tip';
    tip.innerText = '选择正确弹药 → 拖到后方蓄力瞄准 → 松手击碎护盾　每关命中 3 次';

    var btn = document.createElement('button');
    btn.className = 'start_button';
    btn.innerText = '选择年级';
    btn.disabled = true;
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', function () {
      if (!state.grade || !state.term) {
        return;
      }
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      startGame(true);
    });

    ['上', '下'].forEach(function (term) {
      ['7', '8', '9'].forEach(function (grade) {
        var questionCount = typeof GrammarQuestions !== 'undefined' ? GrammarQuestions.forBook(grade, term).length : 0;
        if (!questionCount) {
          return;
        }
        var gradeButton = document.createElement('button');
        gradeButton.className = 'grade_button';
        gradeButton.type = 'button';
        gradeButton.setAttribute('aria-pressed', 'false');
        gradeButton.innerHTML = '<span class="grade_name">' + grade + ' 年级' + term + '册</span>';
        gradeButton.addEventListener('click', function () {
          var buttons = gradeOptions.querySelectorAll('.grade_button');
          var i;
          state.grade = grade;
          state.term = term;
          for (i = 0; i < buttons.length; i += 1) {
            buttons[i].setAttribute('aria-pressed', buttons[i] === gradeButton ? 'true' : 'false');
          }
          btn.disabled = false;
          btn.style.cursor = 'pointer';
          btn.innerText = '开始挑战';
          sound('select');
        });
        gradeOptions.appendChild(gradeButton);
      });
    });

    panel.appendChild(gradeOptions);
    panel.appendChild(btn);
    overlay.appendChild(tip);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }

  function reportScore() {
    if (state.reported) {
      return;
    }
    state.reported = true;
    if (typeof window.onReport !== 'function') {
      window.onReport = function (reportedScore) {
        if (window.console && console.log) {
          console.log('onReport:', reportedScore);
        }
      };
    }
    gameTracker.finish(state.score);
    onReport(state.score);
  }

  function finishGame(reason, lifeSoundAlreadyPlayed) {
    if (state.phase !== 'playing' && state.phase !== 'stageMenu') {
      return;
    }
    state.phase = 'ended';
    state.dragging = false;
    state.projectile = null;
    state.finishReason = reason;
    state.timeLeft = reason === 'timeout' ? 0 : state.timeLeft;
    if (!state.currentQuestionAnswered && state.knowledgePoint) {
      recordKnowledgeResult(false);
    }
    reportScore();
    if (reason === 'lives' && !lifeSoundAlreadyPlayed) {
      playEffect('monsterlaugh');
    } else if (reason !== 'lives') {
      sound(reason === 'victory' ? 'correct' : 'wrong');
    }
    createLearningReport();
  }

  function canvasPoint(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * WIDTH / rect.width,
      y: (clientY - rect.top) * HEIGHT / rect.height
    };
  }

  function distance(x1, y1, x2, y2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function pointInRect(point, rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.w &&
      point.y >= rect.y && point.y <= rect.y + rect.h;
  }

  function startStage(stageNumber) {
    state.stage = clamp(stageNumber, 1, MAX_STAGES);
    state.phase = 'playing';
    state.hp = questionsForStage(state.stage);
    state.questionInStage = 0;
    state.dragging = false;
    state.projectile = null;
    state.selectedAmmo = -1;
    state.loadedX = SLING.x;
    state.loadedY = SLING.y;
    state.particles = [];
    state.transitionKind = '';
    state.transitionTimer = 0;
    state.feedback = '';
    state.feedbackTimer = 0;
    state.monsterAlpha = 1;
    state.monsterShake = 0;
    state.monsterHurtTimer = 0;
    state.shieldFlash = 0;
    state.roarTimer = 0;
    state.lifeEndTimer = 0;
    state.stageMenuDeadline = 0;
    state.stageMenuDuration = STAGE_MENU_DURATION_MS;
    state.bossWrongStreak = 0;
    state.bossAttackTimer = 0;
    state.windAbilityUsed = false;
    state.windAbilityTimer = 0;
    state.fireAbilityUsed = false;
    state.fireAbilityTimer = 0;
    state.elementAbilitySchedule = buildElementAbilitySchedule(state.stage);
    state.stageDuration = secondsForStage(state.stage);
    state.timeLeft = state.stageDuration;
    state.startTime = Date.now();
    prepareQuestion();
    if (isBossStage(state.stage)) {
      state.feedback = 'BOSS 战开始！击破 ' + bossWaveCount(state.stage) + ' 管血条';
      state.feedbackTimer = 2;
    }
  }

  function beginInput(point) {
    var reportButton = currentReportButton();
    var potionButton = currentPotionButton();
    var storedPotionButton = currentStoredPotionButton();
    if ((state.phase === 'playing' || state.phase === 'stageMenu') &&
        state.revivePotionCount > 0 && pointInRect(point, storedPotionButton)) {
      if (maybeOpenRevivePotionTutorial()) {
        return;
      }
      sound('select');
      useRevivePotion();
      return;
    }
    if ((state.phase === 'playing' || state.phase === 'stageMenu') && pointInRect(point, potionButton)) {
      if (maybeOpenRevivePotionTutorial()) {
        return;
      }
      state.feedback = '下一瓶复活药水收集中：' + Math.round(state.correctStreak / POTION_STREAK_TARGET * 100) + '%';
      state.feedbackTimer = 1.2;
      sound('select');
      return;
    }
    if (state.phase === 'playing' && pointInRect(point, reportButton)) {
      sound('select');
      openLearningReport();
      return;
    }
    if (state.phase === 'stageMenu') {
      return;
    }
    if (state.phase === 'ended') {
      if (point.x >= RESTART_RECT.x && point.x <= RESTART_RECT.x + RESTART_RECT.w &&
          point.y >= RESTART_RECT.y && point.y <= RESTART_RECT.y + RESTART_RECT.h) {
        returnToGradeSelection();
      }
      return;
    }
    if (state.phase !== 'playing' || state.transitionKind || state.projectile ||
        state.lifeEndTimer > 0 || state.bossAttackTimer > 0 ||
        state.windAbilityTimer > 0 || state.fireAbilityTimer > 0) {
      return;
    }
    if (state.selectedAmmo >= 0 && distance(point.x, point.y, state.loadedX, state.loadedY) <= 72) {
      state.dragging = true;
      moveInput(point);
      return;
    }
    var i;
    for (i = 0; i < state.options.length && i < ammoHomes.length; i += 1) {
      if (i !== state.selectedAmmo &&
          distance(point.x, point.y, ammoHomes[i].x, ammoHomes[i].y) <= AMMO_RADIUS + 12) {
        state.selectedAmmo = i;
        state.loadedX = SLING.x;
        state.loadedY = SLING.y;
        state.feedback = '弹药已装填，向左后方拉动！';
        state.feedbackTimer = 1.15;
        sound('select');
        return;
      }
    }
  }

  function moveInput(point) {
    if (!state.dragging || state.phase !== 'playing') {
      return;
    }
    var dx = point.x - SLING.x;
    var dy = point.y - SLING.y;
    var length = Math.sqrt(dx * dx + dy * dy);
    var maxPull = 165;
    if (length > maxPull) {
      dx = dx / length * maxPull;
      dy = dy / length * maxPull;
    }
    state.loadedX = clamp(SLING.x + dx, SLING.x - maxPull, SLING.x + 35);
    state.loadedY = clamp(SLING.y + dy, SLING.y - 130, SLING.y + 150);
  }

  function endInput() {
    if (!state.dragging || state.phase !== 'playing') {
      return;
    }
    state.dragging = false;
    var pullX = SLING.x - state.loadedX;
    var pullY = SLING.y - state.loadedY;
    var pull = Math.sqrt(pullX * pullX + pullY * pullY);
    if (pull < 38 || pullX < 20) {
      state.loadedX = SLING.x;
      state.loadedY = SLING.y;
      state.feedback = '请向左后方拉远一些再松手';
      state.feedbackTimer = 1.1;
      return;
    }
    state.projectile = {
      x: SLING.x,
      y: SLING.y,
      vx: pullX * 7.2,
      vy: pullY * 7.2,
      optionIndex: state.selectedAmmo,
      mode: 'flight',
      life: 0,
      trail: []
    };
    state.loadedX = SLING.x;
    state.loadedY = SLING.y;
    sound('launch');
  }

  function addImpactParticles(x, y, correct, colorOverride) {
    var count = reducedMotion ? 8 : 24;
    var i;
    for (i = 0; i < count; i += 1) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 90 + Math.random() * 260;
      state.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 170,
        life: 0.45 + Math.random() * 0.5,
        maxLife: 0.95,
        size: 4 + Math.random() * 9,
        color: colorOverride || (correct ? (Math.random() > 0.45 ? '#78ffe3' : '#fff08a') : '#9fd6ff')
      });
    }
  }

  function addWindParticles(x, y) {
    var count = reducedMotion ? 10 : 34;
    var i;
    for (i = 0; i < count; i += 1) {
      state.particles.push({
        x: x + (Math.random() - 0.5) * 90,
        y: y + (Math.random() - 0.5) * 160,
        vx: -180 - Math.random() * 440,
        vy: -90 + Math.random() * 180,
        gravity: 0,
        life: 0.55 + Math.random() * 0.65,
        maxLife: 1.2,
        size: 3 + Math.random() * 8,
        color: Math.random() > 0.35 ? '#a9fff0' : '#ffffff'
      });
    }
  }

  function addFireAshParticles(x, y) {
    var count = reducedMotion ? 18 : 58;
    var i;
    for (i = 0; i < count; i += 1) {
      var ember = i < count * 0.48;
      state.particles.push({
        x: x + (Math.random() - 0.5) * 52,
        y: y + (Math.random() - 0.5) * 52,
        vx: -105 + Math.random() * 210,
        vy: ember ? -90 - Math.random() * 230 : -35 - Math.random() * 155,
        gravity: ember ? 110 : 58,
        life: ember ? 0.48 + Math.random() * 0.58 : 0.85 + Math.random() * 0.75,
        maxLife: ember ? 1.06 : 1.6,
        size: ember ? 3 + Math.random() * 7 : 4 + Math.random() * 10,
        color: ember ? (Math.random() > 0.5 ? '#ffb12e' : '#ff4c24') :
          (Math.random() > 0.5 ? '#4b4543' : '#8a817d')
      });
    }
  }

  function activateWindAbility(projectile) {
    state.windAbilityUsed = true;
    state.windAbilityTimer = reducedMotion ? 0.65 : WIND_ABILITY_DURATION;
    projectile.mode = 'wind';
    projectile.vx = -Math.max(820, Math.abs(projectile.vx) * 0.8);
    projectile.vy = -260;
    projectile.life = 0;
    state.feedback = '风能力发动！弹药被龙卷风吹回';
    state.feedbackTimer = 1.35;
    state.shieldFlash = 0.25;
    state.monsterShake = 0.18;
    addWindParticles(projectile.x, projectile.y);
    if (effectAudio.wind) {
      playEffect('wind');
    } else {
      sound('wind');
    }
  }

  function activateFireAbility(projectile) {
    state.fireAbilityUsed = true;
    state.fireAbilityTimer = reducedMotion ? 0.72 : FIRE_ABILITY_DURATION;
    projectile.mode = 'fire';
    projectile.vx = 0;
    projectile.vy = 0;
    projectile.life = 0;
    projectile.trail = [];
    state.feedback = '火能力发动！弹药被烧成灰烬';
    state.feedbackTimer = 1.45;
    state.shieldFlash = 0.28;
    state.monsterShake = 0.2;
    addFireAshParticles(projectile.x, projectile.y);
    if (effectAudio.fire) {
      playEffect('fire');
    } else {
      sound('fire');
    }
  }

  function addAshParticles() {
    var count = reducedMotion ? 22 : 72;
    var i;
    for (i = 0; i < count; i += 1) {
      state.particles.push({
        x: MONSTER.x + 60 + Math.random() * (MONSTER.w - 120),
        y: MONSTER.y + 80 + Math.random() * (MONSTER.h - 100),
        vx: -45 + Math.random() * 90,
        vy: -160 - Math.random() * 210,
        gravity: 90,
        life: 0.75 + Math.random() * 0.9,
        maxLife: 1.65,
        size: 4 + Math.random() * 12,
        color: Math.random() > 0.5 ? '#627078' : '#b6c0bf'
      });
    }
  }

  function resolveBossAttack() {
    state.bossAttackTimer = 0;
    if (state.phase !== 'playing') {
      return;
    }
    var lostLastLife = state.playerLives === 1;
    if (!lostLastLife) {
      state.playerLives = Math.max(0, state.playerLives - 1);
    } else {
      state.lifeEndTimer = 8;
    }
    state.feedback = lostLastLife ? 'BOSS 攻击命中！最后一颗爱心受到威胁' : 'BOSS 攻击命中，额外失去 1 颗爱心！';
    state.feedbackTimer = 2;
    state.monsterShake = 0.35;
    addImpactParticles(SLING.x + 35, SLING.y, false, '#ff4966');
    sound('wrong');
  }

  function handleMonsterHit(projectile) {
    var isCorrect = projectile.optionIndex === state.correctIndex;
    if (!isCorrect) {
      recordKnowledgeResult(false);
      resetCorrectStreak();
      projectile.mode = 'deflect';
      projectile.vx = -Math.abs(projectile.vx) * 0.72;
      projectile.vy = -430;
      projectile.life = 0.82;
      state.shieldFlash = 0.5;
      var bossBattle = isBossStage(state.stage);
      var bossAttack = false;
      if (bossBattle) {
        state.bossWrongStreak += 1;
        if (state.bossWrongStreak >= 3) {
          bossAttack = true;
          state.bossWrongStreak = 0;
        }
      } else {
        state.bossWrongStreak = 0;
      }
      var lostLastLife = state.playerLives === 1;
      if (!lostLastLife) {
        state.playerLives = Math.max(0, state.playerLives - 1);
      }
      state.roarTimer = 0;
      state.monsterShake = 0.25;
      if (bossAttack) {
        state.feedback = lostLastLife ? '连续错弹 3 次！最后一颗爱心受到威胁' : '错弹失去 1 颗爱心，BOSS 正在发动攻击！';
        projectile.resetMessage = state.feedback;
      } else if (bossBattle) {
        state.feedback = lostLastLife ? '弹药错误！最后一颗爱心受到威胁' :
          '弹药错误，失去 1 颗爱心 · BOSS 警戒 ' + state.bossWrongStreak + '/3';
        projectile.resetMessage = state.feedback;
      } else {
        state.feedback = lostLastLife ? '无效弹药！最后一条生命受到威胁' : '无效弹药！怪兽怒吼，失去 1 条生命';
      }
      state.feedbackTimer = 1.05;
      addImpactParticles(projectile.x, projectile.y, false);
      if (lostLastLife) {
        state.lifeEndTimer = 8;
      }
      if (bossBattle && !lostLastLife) {
        if (bossAttack) {
          state.bossAttackTimer = reducedMotion ? BOSS_ATTACK_REDUCED_DURATION : BOSS_ATTACK_DURATION;
          state.roarTimer = state.bossAttackTimer;
          state.monsterShake = state.bossAttackTimer;
          playEffect('flick');
          playEffect('monsterroar');
          return;
        }
        playEffect('flick');
        return;
      }
      playEffect('flick', function () {
        if (state.phase !== 'playing') {
          return;
        }
        state.roarTimer = 0.9;
        state.monsterShake = 0.85;
        playEffect('monsterroar', lostLastLife ? function () {
          if (state.phase !== 'playing') {
            return;
          }
          state.playerLives = 0;
          state.feedback = '生命耗尽！怪兽正在得意大笑';
          state.feedbackTimer = 2.2;
          var startMonsterLaugh = function () {
            if (state.phase !== 'playing' || state.playerLives > 0) {
              return;
            }
            playEffect('monsterlaugh', function () {
              if (state.phase === 'playing' && state.playerLives <= 0) {
                finishGame('lives', true);
              }
            });
          };
          if (effectAudio.monsterlaugh) {
            window.setTimeout(startMonsterLaugh, 180);
          } else {
            startMonsterLaugh();
          }
        } : null);
      });
      return;
    }

    var scheduledAbility = state.elementAbilitySchedule.length ? state.elementAbilitySchedule[0] : null;
    if (scheduledAbility && scheduledAbility.question === state.questionInStage + 1) {
      state.elementAbilitySchedule.shift();
      if (scheduledAbility.type === 'fire') {
        activateFireAbility(projectile);
      } else {
        activateWindAbility(projectile);
      }
      return;
    }

    state.projectile = null;
    state.shieldActive = false;
    state.shieldFlash = 0.65;
    state.monsterShake = 0.45;
    state.monsterHurtTimer = reducedMotion ? 0.3 : 0.58;
    state.bossWrongStreak = 0;
    recordKnowledgeResult(true);
    state.currentQuestionAnswered = true;
    state.score += 1;
    state.hp -= 1;
    state.questionInStage += 1;
    state.feedback = '命中！护盾破碎，怪兽 -1 HP';
    state.feedbackTimer = 1.0;
    var potionAwarded = collectRevivePotionProgress();
    if (isBossStage(state.stage) && state.hp > 0 && state.hp % QUESTIONS_PER_STAGE === 0 && !potionAwarded) {
      var newWave = Math.floor((questionsForStage(state.stage) - state.hp) / QUESTIONS_PER_STAGE) + 1;
      state.feedback = 'BOSS 进入第 ' + newWave + ' 阶段，血条颜色已改变！';
      state.feedbackTimer = 1.8;
    }
    addImpactParticles(projectile.x, projectile.y, true);
    playEffect('hit', function () {
      playEffect('monsterhurt');
    });

    if (state.hp <= 0) {
      state.transitionKind = 'defeat';
      state.transitionTimer = reducedMotion ? 0.7 : 1.35;
      addAshParticles();
    } else {
      state.transitionKind = 'nextQuestion';
      state.transitionTimer = reducedMotion ? 0.25 : 0.68;
    }
  }

  function resetAttempt(message) {
    state.projectile = null;
    state.selectedAmmo = -1;
    state.loadedX = SLING.x;
    state.loadedY = SLING.y;
    if (message) {
      state.feedback = message;
      state.feedbackTimer = 0.9;
    }
  }

  function updateProjectile(dt) {
    var p = state.projectile;
    if (!p) {
      return;
    }
    p.life += dt;
    if (p.mode !== 'fire') {
      p.trail.push({ x: p.x, y: p.y, life: 0.35 });
      if (p.trail.length > 14) {
        p.trail.shift();
      }
    }
    var i;
    for (i = 0; i < p.trail.length; i += 1) {
      p.trail[i].life -= dt;
    }
    if (p.mode !== 'fire') {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.mode === 'deflect' ? 520 : (p.mode === 'wind' ? 150 : 390)) * dt;
    }

    if (p.mode === 'flight') {
      var hitDistance = distance(p.x, p.y, MONSTER.cx, MONSTER.cy);
      if (p.x > 1000 && hitDistance <= MONSTER.shieldRadius + 34) {
        handleMonsterHit(p);
        return;
      }
      if (p.y - PROJECTILE_RADIUS > HEIGHT) {
        resetAttempt('没有命中，再瞄准一次！');
        return;
      }
      if (p.x > WIDTH + 60) {
        resetAttempt('没有命中，再瞄准一次！');
      }
    } else if (p.mode === 'fire') {
      if (p.life >= (reducedMotion ? 0.72 : FIRE_ABILITY_DURATION)) {
        resetAttempt('');
      }
    } else if (p.life >= (p.mode === 'wind' ? 1.05 : 1.28) || p.x < -90 || p.y - PROJECTILE_RADIUS > HEIGHT) {
      resetAttempt(p.mode === 'wind' ? '' : (p.resetMessage || '换一枚弹药再试试！'));
    }
  }

  function updateParticles(dt) {
    var i;
    for (i = state.particles.length - 1; i >= 0; i -= 1) {
      var particle = state.particles[i];
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += particle.gravity * dt;
      if (particle.life <= 0) {
        state.particles.splice(i, 1);
      }
    }
  }

  function openStageMenu() {
    var bossIncoming = state.stage < MAX_STAGES && isBossStage(state.stage + 1);
    state.phase = 'stageMenu';
    state.stageMenuDuration = bossIncoming ? BOSS_WARNING_DURATION_MS : STAGE_MENU_DURATION_MS;
    state.stageMenuDeadline = Date.now() + state.stageMenuDuration;
    state.dragging = false;
    state.projectile = null;
    state.selectedAmmo = -1;
    state.monsterAlpha = 0;
    state.shieldActive = false;
    state.feedback = '';
    state.feedbackTimer = 0;
  }

  function updateTransitions(dt) {
    if (!state.transitionKind) {
      return;
    }
    state.transitionTimer -= dt;
    if (state.transitionKind === 'defeat') {
      state.monsterAlpha = clamp(state.transitionTimer / (reducedMotion ? 0.7 : 1.35), 0, 1);
    } else if (state.transitionKind === 'monsterEnter') {
      state.monsterAlpha = clamp(1 - state.transitionTimer / (reducedMotion ? 0.15 : 0.55), 0, 1);
    }
    if (state.transitionTimer > 0) {
      return;
    }
    var completed = state.transitionKind;
    state.transitionKind = '';
    if (completed === 'nextQuestion') {
      prepareQuestion();
    } else if (completed === 'defeat') {
      openStageMenu();
    } else if (completed === 'monsterEnter') {
      state.monsterAlpha = 1;
    }
  }

  function update(dt) {
    updateParticles(dt);
    if (state.phase === 'stageMenu') {
      if (Date.now() >= state.stageMenuDeadline) {
        if (state.stage >= MAX_STAGES) {
          finishGame('victory');
        } else {
          startStage(state.stage + 1);
        }
      }
      return;
    }
    if (state.phase !== 'playing') {
      return;
    }

    state.feedbackTimer = Math.max(0, state.feedbackTimer - dt);
    state.shieldFlash = Math.max(0, state.shieldFlash - dt);
    state.monsterShake = Math.max(0, state.monsterShake - dt);
    state.monsterHurtTimer = Math.max(0, state.monsterHurtTimer - dt);
    state.roarTimer = Math.max(0, state.roarTimer - dt);
    state.windAbilityTimer = Math.max(0, state.windAbilityTimer - dt);
    state.fireAbilityTimer = Math.max(0, state.fireAbilityTimer - dt);
    state.potionPulse = Math.max(0, state.potionPulse - dt);
    if (state.lifeEndTimer > 0) {
      state.lifeEndTimer = Math.max(0, state.lifeEndTimer - dt);
      updateProjectile(dt);
      if (state.lifeEndTimer <= 0) {
        state.playerLives = 0;
        state.lifeEndTimer = 3;
        playEffect('monsterlaugh', function () {
          if (state.phase === 'playing') {
            finishGame('lives', true);
          }
        });
      }
      return;
    }
    if (state.bossAttackTimer > 0) {
      state.bossAttackTimer = Math.max(0, state.bossAttackTimer - dt);
      updateProjectile(dt);
      if (state.bossAttackTimer <= 0) {
        resolveBossAttack();
      }
      return;
    }
    state.timeLeft = Math.max(0, state.stageDuration - (Date.now() - state.startTime) / 1000);
    if (state.timeLeft <= 0) {
      finishGame('timeout');
      return;
    }
    updateProjectile(dt);
    updateTransitions(dt);
  }

  function drawPanel(x, y, w, h, fill, stroke, radius) {
    roundedPath(ctx, x, y, w, h, radius);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  function drawHud() {
    var reportButton = currentReportButton();
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.4)';
    ctx.shadowBlur = 16;
    drawPanel(reportButton.x, reportButton.y, reportButton.w, reportButton.h,
      'rgba(8,17,29,.88)', 'rgba(126,255,226,.55)', 22);
    drawPanel(HUD_INFO.x, HUD_INFO.y, HUD_INFO.w, HUD_INFO.h,
      'rgba(8,17,29,.88)', 'rgba(126,255,226,.55)', 22);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = '#70f6d5';
    ctx.lineWidth = 3;
    roundedPath(ctx, reportButton.x + 20, 37, 26, 34, 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(reportButton.x + 27, 48);
    ctx.lineTo(reportButton.x + 39, 48);
    ctx.moveTo(reportButton.x + 27, 56);
    ctx.lineTo(reportButton.x + 39, 56);
    ctx.moveTo(reportButton.x + 27, 64);
    ctx.lineTo(reportButton.x + 35, 64);
    ctx.stroke();
    ctx.fillStyle = '#e8fff9';
    ctx.font = '800 18px "Microsoft YaHei", sans-serif';
    ctx.fillText('学习报告', reportButton.x + 55, 55);

    var secondsText = String(Math.ceil(state.timeLeft));
    if (secondsText.length < 2) {
      secondsText = '0' + secondsText;
    }

    ctx.fillStyle = '#cfe0e2';
    ctx.font = '800 18px Arial, sans-serif';
    ctx.fillText('Level', 615, 55);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px Arial, sans-serif';
    ctx.fillText(state.stage + '/' + MAX_STAGES, 680, 55);

    ctx.strokeStyle = 'rgba(255,255,255,.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(755, 36);
    ctx.lineTo(755, 72);
    ctx.moveTo(925, 36);
    ctx.lineTo(925, 72);
    ctx.moveTo(1085, 36);
    ctx.lineTo(1085, 72);
    ctx.stroke();

    var bossStage = isBossStage(state.stage);
    ctx.fillStyle = bossStage ? '#ffb64d' : '#70f6d5';
    ctx.font = '800 16px Arial, sans-serif';
    ctx.fillText(bossStage ? 'BOSS' : 'Monster Lv.', 780, 55);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px Arial, sans-serif';
    ctx.fillText(bossStage ? questionsForStage(state.stage) + 'Q' :
      String(((state.stage - 1) % 2) + 1), bossStage ? 850 : 890, 55);

    ctx.fillStyle = '#ffe47e';
    ctx.font = '800 18px Arial, sans-serif';
    ctx.fillText('Score', 950, 55);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px Arial, sans-serif';
    ctx.fillText(String(state.score), 1018, 55);

    ctx.fillStyle = '#8dffe6';
    ctx.font = '800 18px Arial, sans-serif';
    ctx.fillText('Time', 1110, 55);
    ctx.fillStyle = state.timeLeft <= 10 ? '#ff7784' : '#ffffff';
    ctx.font = '900 28px Arial, sans-serif';
    ctx.fillText(secondsText + 's', 1164, 55);
    ctx.restore();
  }

  function drawRevivePotion() {
    var progress = state.correctStreak / POTION_STREAK_TARGET;
    var potionButton = currentPotionButton();
    var imageX = potionButton.x + 8;
    var imageY = potionButton.y + 3;
    var imageW = 42;
    var imageH = 58;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.4)';
    ctx.shadowBlur = 12;
    drawPanel(potionButton.x, potionButton.y, potionButton.w, potionButton.h,
      'rgba(8,17,29,.9)', 'rgba(126,255,226,.4)', 22);
    ctx.shadowBlur = 0;

    if (reviveImage && reviveImage.complete && reviveImage.naturalWidth) {
      ctx.save();
      ctx.globalAlpha = 0.78;
      ctx.filter = 'grayscale(1) brightness(.68)';
      ctx.drawImage(reviveImage, imageX, imageY, imageW, imageH);
      ctx.restore();

      if (progress > 0) {
        var colorHeight = imageH * progress;
        ctx.save();
        ctx.beginPath();
        ctx.rect(imageX, imageY + imageH - colorHeight, imageW, colorHeight);
        ctx.clip();
        ctx.drawImage(reviveImage, imageX, imageY, imageW, imageH);
        ctx.restore();
      }
    }

    drawPanel(potionButton.x + 46, potionButton.y + 35, 37, 22,
      'rgba(2,11,20,.9)', '', 10);
    ctx.fillStyle = '#d8ebe7';
    ctx.font = '900 11px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(progress * 100) + '%', potionButton.x + 64.5, potionButton.y + 46);
    ctx.restore();
  }

  function drawStoredPotion() {
    if (state.revivePotionCount <= 0) {
      return;
    }
    var storedButton = currentStoredPotionButton();
    var pulse = state.potionPulse > 0 && !reducedMotion ? 0.5 + Math.sin(Date.now() / 95) * 0.5 : 0;
    ctx.save();
    ctx.shadowColor = 'rgba(255,217,106,' + (0.48 + pulse * 0.32) + ')';
    ctx.shadowBlur = 17 + pulse * 9;
    drawPanel(storedButton.x, storedButton.y, storedButton.w, storedButton.h,
      'rgba(52,43,18,.94)', '#ffe47e', 22);
    ctx.shadowBlur = 0;
    if (reviveImage && reviveImage.complete && reviveImage.naturalWidth) {
      ctx.drawImage(reviveImage, storedButton.x + 8, storedButton.y + 3, 42, 58);
    }
    drawPanel(storedButton.x + 58, storedButton.y + 16, 44, 32, '#ffe47e', '', 14);
    ctx.fillStyle = '#533500';
    ctx.font = '900 17px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×' + state.revivePotionCount, storedButton.x + 80, storedButton.y + 32);
    ctx.restore();
  }

  function drawLives() {
    ctx.save();
    drawPanel(1270, 24, 300, 62, 'rgba(8,17,29,.82)', 'rgba(255,124,145,.45)', 20);
    ctx.fillStyle = '#ffb3bf';
    ctx.font = '800 15px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Lives', 1288, 55);
    var i;
    for (i = 0; i < PLAYER_MAX_LIVES; i += 1) {
      var x = 1342 + i * 37;
      var alive = i < state.playerLives;
      if (heartImage && heartImage.complete && heartImage.naturalWidth) {
        ctx.globalAlpha = alive ? 1 : 0.16;
        ctx.drawImage(heartImage, x, 38, 34, 31);
      } else {
        ctx.globalAlpha = alive ? 1 : 0.16;
        ctx.fillStyle = '#ff4f68';
        ctx.beginPath();
        ctx.arc(x + 15, 48, 10, Math.PI, 0, false);
        ctx.arc(x + 29, 48, 10, Math.PI, 0, false);
        ctx.lineTo(x + 22, 70);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function questionTextRuns(text) {
    var source = String(text);
    var runs = [];
    var cursor = 0;
    while (cursor < source.length) {
      var nextIndex = -1;
      var nextTitle = '';
      var i;
      for (i = 0; i < QUESTION_WORK_TITLES.length; i += 1) {
        var title = QUESTION_WORK_TITLES[i];
        var titleIndex = source.indexOf(title, cursor);
        if (titleIndex >= 0 && (nextIndex < 0 || titleIndex < nextIndex ||
          (titleIndex === nextIndex && title.length > nextTitle.length))) {
          nextIndex = titleIndex;
          nextTitle = title;
        }
      }
      if (nextIndex < 0) {
        runs.push({ text: source.slice(cursor), italic: false });
        break;
      }
      if (nextIndex > cursor) {
        runs.push({ text: source.slice(cursor, nextIndex), italic: false });
      }
      runs.push({ text: nextTitle, italic: true });
      cursor = nextIndex + nextTitle.length;
    }
    return runs;
  }

  function appendQuestionRun(runs, text, italic) {
    if (!text) {
      return;
    }
    var last = runs[runs.length - 1];
    if (last && last.italic === italic) {
      last.text += text;
    } else {
      runs.push({ text: text, italic: italic });
    }
  }

  function measureQuestionRuns(runs, normalFont, italicFont) {
    var width = 0;
    var i;
    for (i = 0; i < runs.length; i += 1) {
      ctx.font = runs[i].italic ? italicFont : normalFont;
      width += ctx.measureText(runs[i].text).width;
    }
    return width;
  }

  function wrapQuestionText(text, maxWidth, normalFont, italicFont) {
    var paragraphs = String(text).split('\n');
    var lines = [];
    var paragraphIndex;
    for (paragraphIndex = 0; paragraphIndex < paragraphs.length; paragraphIndex += 1) {
      var paragraph = paragraphs[paragraphIndex].trim();
      if (!paragraph) {
        continue;
      }
      var paragraphRuns = questionTextRuns(paragraph);
      var characterMode = !/\s/.test(paragraph) && /[\u3400-\u9fff]/.test(paragraph) &&
        measureQuestionRuns(paragraphRuns, normalFont, italicFont) > maxWidth;
      var tokens = [];
      var runIndex;
      for (runIndex = 0; runIndex < paragraphRuns.length; runIndex += 1) {
        var parts = characterMode ? Array.from(paragraphRuns[runIndex].text) :
          paragraphRuns[runIndex].text.match(/\S+/g) || [];
        var partIndex;
        for (partIndex = 0; partIndex < parts.length; partIndex += 1) {
          tokens.push({ text: parts[partIndex], italic: paragraphRuns[runIndex].italic });
        }
      }

      var line = [];
      var lineWidth = 0;
      var tokenIndex;
      for (tokenIndex = 0; tokenIndex < tokens.length; tokenIndex += 1) {
        var token = tokens[tokenIndex];
        var separator = line.length && !characterMode ? ' ' : '';
        ctx.font = normalFont;
        var separatorWidth = ctx.measureText(separator).width;
        ctx.font = token.italic ? italicFont : normalFont;
        var tokenWidth = ctx.measureText(token.text).width;
        if (line.length && lineWidth + separatorWidth + tokenWidth > maxWidth) {
          lines.push(line);
          line = [];
          lineWidth = 0;
          separator = '';
          separatorWidth = 0;
        }
        appendQuestionRun(line, separator, false);
        appendQuestionRun(line, token.text, token.italic);
        lineWidth += separatorWidth + tokenWidth;
      }
      if (line.length) {
        lines.push(line);
      }
    }
    return lines;
  }

  function formatQuestionForWrapping(text) {
    var formatted = String(text).trim();
    var dialogue = formatted.match(/^(?:[-–—]\s*)?(.+?[?!.])\s*[-–—]\s*(.+)$/);
    if (dialogue) {
      return '- ' + dialogue[1].trim() + '\n- ' + dialogue[2].trim();
    }

    var chineseToEnglish = /([。！？：:；;.](?:\s*[（(]\s*[）)])?)\s*(?=["'A-Za-z])/g;
    var boundary;
    while ((boundary = chineseToEnglish.exec(formatted)) !== null) {
      if (/[\u3400-\u9fff]/.test(formatted.slice(0, boundary.index))) {
        formatted = formatted.slice(0, boundary.index) + boundary[1] + '\n' +
          formatted.slice(chineseToEnglish.lastIndex);
        break;
      }
    }

    return formatted.replace(/(["”'’?!])\s*(?=[\u3400-\u9fff])/g, '$1\n');
  }

  function questionBubbleLayout(questionText) {
    var questionFont = '700 27px "Microsoft YaHei", Arial, sans-serif';
    var questionItalicFont = 'italic ' + questionFont;
    var knowledgeFont = '800 18px "Microsoft YaHei", Arial, sans-serif';
    var paragraphs = String(questionText).split('\n');
    var preferredContentWidth = 0;
    var i;
    ctx.save();
    for (i = 0; i < paragraphs.length; i += 1) {
      preferredContentWidth = Math.max(preferredContentWidth, measureQuestionRuns(
        questionTextRuns(paragraphs[i]), questionFont, questionItalicFont
      ));
    }
    ctx.font = knowledgeFont;
    preferredContentWidth = Math.max(preferredContentWidth, ctx.measureText(state.knowledgePoint).width);
    var width = clamp(Math.ceil(preferredContentWidth + 70), 460, 760);
    var lines = wrapQuestionText(questionText, width - 70, questionFont, questionItalicFont);
    ctx.restore();
    var lineHeight = 36;
    var height = Math.max(126, 70 + lines.length * lineHeight + 20);
    return {
      x: 1555 - width,
      y: clamp(300 - height, 92, 125),
      w: width,
      h: height,
      lines: lines,
      lineHeight: lineHeight,
      questionFont: questionFont,
      questionItalicFont: questionItalicFont,
      knowledgeFont: knowledgeFont
    };
  }

  function drawQuestionBubble() {
    if (!state.question) {
      return;
    }
    var questionText = formatQuestionForWrapping(state.question.question);
    var layout = questionBubbleLayout(questionText);
    var x = layout.x;
    var y = layout.y;
    var w = layout.w;
    var h = layout.h;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.38)';
    ctx.shadowBlur = 18;
    drawPanel(x, y, w, h, 'rgba(249,255,249,.96)', '#62d7bf', 28);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f9fff9';
    ctx.strokeStyle = '#62d7bf';
    ctx.lineWidth = 3;
    var tailCenterX = clamp(MONSTER.cx - 25, x + 90, x + w - 90);
    ctx.beginPath();
    ctx.moveTo(tailCenterX - 48, y + h - 1);
    ctx.lineTo(tailCenterX, y + h + 42);
    ctx.lineTo(tailCenterX + 48, y + h - 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#167563';
    ctx.font = layout.knowledgeFont;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.knowledgePoint, x + 35, y + 30);

    ctx.fillStyle = '#17303a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    var i;
    for (i = 0; i < layout.lines.length; i += 1) {
      var lineX = x + 35;
      var runIndex;
      for (runIndex = 0; runIndex < layout.lines[i].length; runIndex += 1) {
        var run = layout.lines[i][runIndex];
        ctx.font = run.italic ? layout.questionItalicFont : layout.questionFont;
        ctx.fillText(run.text, lineX, y + 76 + i * layout.lineHeight);
        lineX += ctx.measureText(run.text).width;
      }
    }
    ctx.restore();
  }

  function drawRoarEffect() {
    if (state.roarTimer <= 0) {
      return;
    }
    var strength = clamp(state.roarTimer / 0.9, 0, 1);
    var progress = 1 - strength;
    var ringCount = reducedMotion ? 1 : 3;
    var i;
    ctx.save();
    ctx.shadowColor = '#ff2945';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = '#ff4057';
    for (i = 0; i < ringCount; i += 1) {
      var delay = reducedMotion ? 0 : i * 0.16;
      if (progress < delay) {
        continue;
      }
      var ringProgress = reducedMotion ? 0.35 : clamp((progress - delay) / (1 - delay), 0, 1);
      var radius = reducedMotion ? 225 : 145 + ringProgress * 245;
      ctx.globalAlpha = (1 - ringProgress) * (0.82 - i * 0.12) * state.monsterAlpha;
      ctx.lineWidth = reducedMotion ? 4 : 9 - ringProgress * 6;
      ctx.beginPath();
      ctx.arc(MONSTER.cx, MONSTER.cy, radius, 0, Math.PI * 2, false);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBossLaserAttack() {
    if (state.bossAttackTimer <= 0 || !isBossStage(state.stage) || state.monsterAlpha <= 0) {
      return;
    }
    var image = monsterImages[currentMonsterIndex()];
    if (!image || !image.complete || !image.naturalWidth) {
      return;
    }

    var duration = reducedMotion ? BOSS_ATTACK_REDUCED_DURATION : BOSS_ATTACK_DURATION;
    var attackProgress = 1 - clamp(state.bossAttackTimer / duration, 0, 1);
    var chargeProgress = clamp(attackProgress / 0.27, 0, 1);
    var beamProgress = clamp((attackProgress - 0.25) / 0.28, 0, 1);
    var bloomProgress = 1 - Math.pow(1 - beamProgress, 3);
    var bloomTurn = clamp((attackProgress - 0.38) / 0.45, 0, 1) * 0.13;
    var endFade = attackProgress > 0.88 ? clamp((1 - attackProgress) / 0.12, 0, 1) : 1;
    var pulse = 0.78 + Math.sin(Date.now() / 32) * 0.22;
    var ratio = image.naturalWidth / image.naturalHeight;
    var drawH = MONSTER.h;
    var drawW = drawH * ratio;
    if (drawW > MONSTER.w) {
      drawW = MONSTER.w;
      drawH = drawW / ratio;
    }
    var shakeX = state.monsterShake > 0 ? Math.sin(state.monsterShake * 95) * 12 : 0;
    var drawX = MONSTER.cx + shakeX - drawW / 2;
    var drawY = MONSTER.y + MONSTER.h - drawH;
    var eyeRatios = BOSS_EYE_RATIOS[currentMonsterIndex()] || [[0.42, 0.28], [0.58, 0.28]];
    var eyes = [
      { x: drawX + drawW * eyeRatios[0][0], y: drawY + drawH * eyeRatios[0][1] },
      { x: drawX + drawW * eyeRatios[1][0], y: drawY + drawH * eyeRatios[1][1] }
    ];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var i;
    for (i = 0; i < eyes.length; i += 1) {
      var eye = eyes[i];
      var eyeRadius = 8 + chargeProgress * 15 + pulse * 3;
      var eyeGlow = ctx.createRadialGradient(eye.x, eye.y, 1, eye.x, eye.y, eyeRadius * 2.1);
      eyeGlow.addColorStop(0, 'rgba(255,255,255,' + (0.9 * chargeProgress) + ')');
      eyeGlow.addColorStop(0.18, 'rgba(255,54,82,' + (0.95 * chargeProgress) + ')');
      eyeGlow.addColorStop(1, 'rgba(255,0,35,0)');
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, eyeRadius * 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,238,244,' + (chargeProgress * endFade) + ')';
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, 3 + chargeProgress * 5, 0, Math.PI * 2);
      ctx.fill();

      if (beamProgress <= 0) {
        continue;
      }
      var beamCount = reducedMotion ? 8 : 14;
      var j;
      ctx.lineCap = 'round';
      for (j = 0; j < beamCount; j += 1) {
        var rayDelay = (j % 4) * 0.025;
        var rayProgress = clamp((attackProgress - 0.25 - rayDelay) / 0.26, 0, 1);
        if (rayProgress <= 0) {
          continue;
        }
        var angle = -Math.PI + (Math.PI * 2 * j / beamCount) + (i === 0 ? -bloomTurn : bloomTurn);
        var rayX = Math.cos(angle);
        var rayY = Math.sin(angle);
        var edgeDistanceX = Math.abs(rayX) < 0.0001 ? Infinity :
          (rayX > 0 ? (WIDTH - eye.x) / rayX : -eye.x / rayX);
        var edgeDistanceY = Math.abs(rayY) < 0.0001 ? Infinity :
          (rayY > 0 ? (HEIGHT - eye.y) / rayY : -eye.y / rayY);
        var edgeDistance = Math.min(edgeDistanceX, edgeDistanceY);
        var beamEndX = eye.x + rayX * edgeDistance;
        var beamEndY = eye.y + rayY * edgeDistance;
        var beamAlpha = rayProgress * endFade * (0.78 + pulse * 0.22);

        ctx.shadowColor = '#ff123d';
        ctx.shadowBlur = 22;
        ctx.strokeStyle = 'rgba(255,18,61,' + (0.25 * beamAlpha) + ')';
        ctx.lineWidth = reducedMotion ? 9 : 14;
        ctx.beginPath();
        ctx.moveTo(eye.x, eye.y);
        ctx.lineTo(beamEndX, beamEndY);
        ctx.stroke();

        ctx.shadowBlur = 11;
        ctx.strokeStyle = 'rgba(255,77,115,' + (0.82 * beamAlpha) + ')';
        ctx.lineWidth = reducedMotion ? 4 : 6;
        ctx.beginPath();
        ctx.moveTo(eye.x, eye.y);
        ctx.lineTo(beamEndX, beamEndY);
        ctx.stroke();

        ctx.shadowBlur = 5;
        ctx.strokeStyle = 'rgba(255,246,249,' + (0.96 * beamAlpha) + ')';
        ctx.lineWidth = reducedMotion ? 1.2 : 2.2;
        ctx.beginPath();
        ctx.moveTo(eye.x, eye.y);
        ctx.lineTo(beamEndX, beamEndY);
        ctx.stroke();

        if (rayProgress > 0.72) {
          var tipRadius = 5 + pulse * 4;
          var tipGlow = ctx.createRadialGradient(beamEndX, beamEndY, 1, beamEndX, beamEndY, tipRadius * 2.5);
          tipGlow.addColorStop(0, 'rgba(255,255,255,' + (0.9 * endFade) + ')');
          tipGlow.addColorStop(0.3, 'rgba(255,50,91,' + (0.7 * endFade) + ')');
          tipGlow.addColorStop(1, 'rgba(255,0,35,0)');
          ctx.fillStyle = tipGlow;
          ctx.beginPath();
          ctx.arc(beamEndX, beamEndY, tipRadius * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.shadowColor = '#ff315e';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = 'rgba(255,126,152,' + (0.72 * endFade * bloomProgress) + ')';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, 24 + bloomProgress * 25, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    if (beamProgress > 0.8) {
      ctx.save();
      var dangerGlow = ctx.createRadialGradient(MONSTER.cx, MONSTER.cy, 80, MONSTER.cx, MONSTER.cy, 980);
      dangerGlow.addColorStop(0, 'rgba(255,38,66,' + (0.09 * endFade) + ')');
      dangerGlow.addColorStop(0.55, 'rgba(255,20,55,' + (0.045 * endFade) + ')');
      dangerGlow.addColorStop(1, 'rgba(255,0,30,0)');
      ctx.fillStyle = dangerGlow;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.restore();
    }
  }

  function drawWindAbility() {
    if (state.windAbilityTimer <= 0) {
      return;
    }
    var duration = reducedMotion ? 0.65 : WIND_ABILITY_DURATION;
    var progress = 1 - clamp(state.windAbilityTimer / duration, 0, 1);
    var fadeIn = clamp(progress / 0.12, 0, 1);
    var fadeOut = progress > 0.78 ? clamp((1 - progress) / 0.22, 0, 1) : 1;
    var alpha = fadeIn * fadeOut;
    var centerX = MONSTER.x - 48;
    var topY = 330;
    var tornadoHeight = 390;
    var phase = Date.now() / (reducedMotion ? 220 : 62);
    var i;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.shadowColor = '#7effe5';
    ctx.shadowBlur = 22;
    for (i = 0; i < 9; i += 1) {
      var level = i / 8;
      var y = topY + level * tornadoHeight;
      var radiusX = 142 - level * 101;
      var radiusY = 26 - level * 10;
      var sway = Math.sin(phase + i * 0.9) * (18 - level * 9);
      ctx.globalAlpha = alpha * (0.42 + (1 - level) * 0.35);
      ctx.strokeStyle = i % 2 === 0 ? '#aafff0' : '#63dfff';
      ctx.lineWidth = 10 - level * 5;
      ctx.beginPath();
      ctx.ellipse(centerX + sway, y, radiusX, radiusY, -0.08, 0.18, Math.PI * 1.86);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.88)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(centerX + sway - 6, y - 3, radiusX * 0.78, radiusY * 0.62, -0.08, 0.35, Math.PI * 1.55);
      ctx.stroke();
    }

    ctx.shadowBlur = 14;
    for (i = 0; i < 7; i += 1) {
      var laneY = 365 + i * 49;
      var travel = (phase * 58 + i * 123) % 560;
      var gustStartX = centerX - 40 - travel;
      var gustLength = 125 + (i % 3) * 32;
      ctx.globalAlpha = alpha * (0.28 + (i % 2) * 0.18);
      ctx.strokeStyle = i % 2 === 0 ? '#bafff3' : '#8cecff';
      ctx.lineWidth = 4 + (i % 3);
      ctx.beginPath();
      ctx.moveTo(gustStartX, laneY);
      ctx.bezierCurveTo(gustStartX - 30, laneY - 18, gustStartX - gustLength + 35, laneY + 18,
        gustStartX - gustLength, laneY);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    var windGlow = ctx.createRadialGradient(centerX, 520, 35, centerX, 520, 260);
    windGlow.addColorStop(0, 'rgba(112,246,213,' + (0.17 * alpha) + ')');
    windGlow.addColorStop(1, 'rgba(112,246,213,0)');
    ctx.fillStyle = windGlow;
    ctx.fillRect(centerX - 280, 240, 560, 560);
    ctx.restore();
  }

  function drawFireAbility() {
    var p = state.projectile;
    if (state.fireAbilityTimer <= 0 || !p || p.mode !== 'fire') {
      return;
    }
    var duration = reducedMotion ? 0.72 : FIRE_ABILITY_DURATION;
    var progress = 1 - clamp(state.fireAbilityTimer / duration, 0, 1);
    var reach = clamp(progress / 0.2, 0, 1);
    var fadeOut = progress > 0.82 ? clamp((1 - progress) / 0.18, 0, 1) : 1;
    var alpha = Math.min(1, progress * 6) * fadeOut;
    var phase = Date.now() / (reducedMotion ? 170 : 48);
    var mouthX = MONSTER.cx - 38;
    var mouthY = MONSTER.cy - 42;
    var endX = mouthX + (p.x - mouthX) * reach;
    var endY = mouthY + (p.y - mouthY) * reach;
    var dx = endX - mouthX;
    var dy = endY - mouthY;
    var length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    var normalX = -dy / length;
    var normalY = dx / length;
    var bend = Math.sin(phase) * 16;
    var gradient = ctx.createLinearGradient(mouthX, mouthY, endX, endY);
    gradient.addColorStop(0, 'rgba(255,255,190,' + (0.95 * alpha) + ')');
    gradient.addColorStop(0.28, 'rgba(255,218,55,' + (0.98 * alpha) + ')');
    gradient.addColorStop(0.68, 'rgba(255,91,25,' + (0.94 * alpha) + ')');
    gradient.addColorStop(1, 'rgba(167,22,8,' + (0.35 * alpha) + ')');

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.shadowColor = '#ff5424';
    ctx.shadowBlur = 34;
    ctx.strokeStyle = 'rgba(255,55,18,' + (0.34 * alpha) + ')';
    ctx.lineWidth = reducedMotion ? 42 : 68;
    ctx.beginPath();
    ctx.moveTo(mouthX, mouthY);
    ctx.bezierCurveTo(mouthX + dx * 0.34 + normalX * bend, mouthY + dy * 0.34 + normalY * bend,
      mouthX + dx * 0.7 - normalX * bend * 0.7, mouthY + dy * 0.7 - normalY * bend * 0.7, endX, endY);
    ctx.stroke();

    ctx.shadowBlur = 22;
    ctx.strokeStyle = gradient;
    ctx.lineWidth = reducedMotion ? 25 : 39;
    ctx.beginPath();
    ctx.moveTo(mouthX, mouthY);
    ctx.bezierCurveTo(mouthX + dx * 0.34 + normalX * bend, mouthY + dy * 0.34 + normalY * bend,
      mouthX + dx * 0.7 - normalX * bend * 0.7, mouthY + dy * 0.7 - normalY * bend * 0.7, endX, endY);
    ctx.stroke();

    ctx.shadowColor = '#fff0a1';
    ctx.shadowBlur = 13;
    ctx.strokeStyle = 'rgba(255,250,190,' + (0.9 * alpha) + ')';
    ctx.lineWidth = reducedMotion ? 7 : 12;
    ctx.beginPath();
    ctx.moveTo(mouthX, mouthY);
    ctx.bezierCurveTo(mouthX + dx * 0.34 + normalX * bend * 0.65,
      mouthY + dy * 0.34 + normalY * bend * 0.65,
      mouthX + dx * 0.7 - normalX * bend * 0.45,
      mouthY + dy * 0.7 - normalY * bend * 0.45, endX, endY);
    ctx.stroke();

    var i;
    for (i = 0; i < (reducedMotion ? 4 : 8); i += 1) {
      var lane = (i / (reducedMotion ? 3 : 7) - 0.5) * 2;
      var laneWave = Math.sin(phase * 1.35 + i * 1.8) * 21;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = i % 2 === 0 ?
        'rgba(255,186,35,' + (0.72 * alpha) + ')' : 'rgba(255,71,20,' + (0.68 * alpha) + ')';
      ctx.lineWidth = 4 + (i % 3) * 2;
      ctx.beginPath();
      ctx.moveTo(mouthX + normalX * lane * 10, mouthY + normalY * lane * 10);
      ctx.bezierCurveTo(mouthX + dx * 0.36 + normalX * (lane * 22 + laneWave),
        mouthY + dy * 0.36 + normalY * (lane * 22 + laneWave),
        mouthX + dx * 0.73 + normalX * (lane * 34 - laneWave * 0.6),
        mouthY + dy * 0.73 + normalY * (lane * 34 - laneWave * 0.6),
        endX + normalX * lane * 15, endY + normalY * lane * 15);
      ctx.stroke();
    }

    var burst = clamp((progress - 0.12) / 0.2, 0, 1) * fadeOut;
    var fireGlow = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 88);
    fireGlow.addColorStop(0, 'rgba(255,255,205,' + (0.9 * burst) + ')');
    fireGlow.addColorStop(0.24, 'rgba(255,177,28,' + (0.72 * burst) + ')');
    fireGlow.addColorStop(0.62, 'rgba(255,55,18,' + (0.38 * burst) + ')');
    fireGlow.addColorStop(1, 'rgba(90,18,10,0)');
    ctx.fillStyle = fireGlow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 88, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 16;
    for (i = 0; i < (reducedMotion ? 6 : 11); i += 1) {
      var flameAngle = Math.PI * 2 * i / (reducedMotion ? 6 : 11) + phase * 0.05;
      var flameLength = 34 + (i % 3) * 13 + Math.sin(phase + i) * 7;
      ctx.strokeStyle = i % 2 === 0 ?
        'rgba(255,227,85,' + (0.86 * burst) + ')' : 'rgba(255,73,22,' + (0.82 * burst) + ')';
      ctx.lineWidth = 7 - (i % 3);
      ctx.beginPath();
      ctx.moveTo(p.x + Math.cos(flameAngle) * 18, p.y + Math.sin(flameAngle) * 18);
      ctx.quadraticCurveTo(p.x + Math.cos(flameAngle + 0.28) * flameLength * 0.62,
        p.y + Math.sin(flameAngle + 0.28) * flameLength * 0.62,
        p.x + Math.cos(flameAngle) * flameLength, p.y + Math.sin(flameAngle) * flameLength);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHealthBar() {
    var x = 1160;
    var y = 786;
    var w = 320;
    var h = 45;
    var bossBattle = isBossStage(state.stage);
    var totalHp = questionsForStage(state.stage);
    var waveTotal = bossBattle ? bossWaveCount(state.stage) : 1;
    var completedHp = totalHp - state.hp;
    var waveIndex = state.hp <= 0 ? waveTotal - 1 : Math.floor(completedHp / QUESTIONS_PER_STAGE);
    waveIndex = clamp(waveIndex, 0, waveTotal - 1);
    var visibleHp = state.hp <= 0 ? 0 : ((state.hp - 1) % QUESTIONS_PER_STAGE) + 1;
    var healthColor = bossBattle ? BOSS_HEALTH_COLORS[waveIndex] : BOSS_HEALTH_COLORS[0];
    ctx.save();
    drawPanel(x, y, w, h, 'rgba(5,12,20,.82)', bossBattle ? healthColor : 'rgba(255,255,255,.2)', 17);
    var segmentW = 88;
    var gap = 10;
    var i;
    for (i = 0; i < QUESTIONS_PER_STAGE; i += 1) {
      var active = i < visibleHp;
      drawPanel(x + 17 + i * (segmentW + gap), y + 12, segmentW, 21,
        active ? healthColor : 'rgba(255,255,255,.1)', '', 9);
    }
    ctx.fillStyle = bossBattle ? healthColor : '#ffffff';
    ctx.font = bossBattle ? '900 14px Arial, sans-serif' : '800 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    if (bossBattle) {
      ctx.fillText('BOSS HP · ' + (waveIndex + 1) + '/' + waveTotal, x + w / 2, y - 10);
    } else {
      ctx.fillText('HP', x - 25, y + 29);
    }
    ctx.restore();
  }

  function currentMonsterIndex() {
    return monsterIndexForStage(state.stage);
  }

  function drawMonster() {
    var image = monsterImages[currentMonsterIndex()];
    if (!image || !image.complete || !image.naturalWidth || state.monsterAlpha <= 0) {
      return;
    }
    ctx.save();
    ctx.globalAlpha = state.monsterAlpha;
    var shakeX = state.monsterShake > 0 ? Math.sin(state.monsterShake * 95) * 12 : 0;
    var hurtDuration = reducedMotion ? 0.3 : 0.58;
    var hurtPhase = state.monsterHurtTimer > 0 ? 1 - clamp(state.monsterHurtTimer / hurtDuration, 0, 1) : 1;
    var hurtWave = state.monsterHurtTimer > 0 ? Math.sin(hurtPhase * Math.PI) : 0;
    var hurtWobble = state.monsterHurtTimer > 0 && !reducedMotion ? Math.sin(hurtPhase * Math.PI * 3) * (1 - hurtPhase) : 0;
    var recoilX = reducedMotion ? 0 : hurtWave * 24;
    var recoilY = reducedMotion ? 0 : -hurtWave * 7;
    var scaleX = 1 - hurtWobble * 0.1;
    var scaleY = 1 + hurtWobble * 0.075;
    var hurtRotation = reducedMotion ? 0 : hurtWave * 0.045;
    var ratio = image.naturalWidth / image.naturalHeight;
    var drawH = MONSTER.h;
    var drawW = drawH * ratio;
    if (drawW > MONSTER.w) {
      drawW = MONSTER.w;
      drawH = drawW / ratio;
    }
    var y = MONSTER.y + MONSTER.h - drawH;
    ctx.translate(MONSTER.cx + shakeX + recoilX, y + drawH + recoilY);
    ctx.rotate(hurtRotation);
    ctx.scale(scaleX, scaleY);
    if (state.monsterHurtTimer > 0) {
      ctx.shadowColor = 'rgba(255,66,79,' + (0.45 + hurtWave * 0.45) + ')';
      ctx.shadowBlur = 26 + hurtWave * 22;
      ctx.shadowOffsetY = 0;
    } else {
      ctx.shadowColor = 'rgba(0,0,0,.55)';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetY = 18;
    }
    ctx.drawImage(image, -drawW / 2, -drawH, drawW, drawH);
    ctx.restore();
  }

  function drawMonsterHurtEffect() {
    if (state.monsterHurtTimer <= 0 || state.monsterAlpha <= 0) {
      return;
    }
    var hurtDuration = reducedMotion ? 0.3 : 0.58;
    var phase = 1 - clamp(state.monsterHurtTimer / hurtDuration, 0, 1);
    var fade = 1 - phase;
    var impactX = MONSTER.cx - 145;
    var impactY = MONSTER.cy - 10;
    var radius = 34 + phase * 88;
    var i;

    ctx.save();
    ctx.globalAlpha = fade * state.monsterAlpha;
    ctx.translate(impactX, impactY);
    ctx.rotate(-0.18);
    ctx.shadowColor = '#ff3e55';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = '#ff6875';
    ctx.lineWidth = 8 - phase * 5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, -1.2, 1.2, false);
    ctx.stroke();

    ctx.strokeStyle = '#fff0a8';
    ctx.lineWidth = 4 - phase * 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.7, -1.05, 1.05, false);
    ctx.stroke();

    if (!reducedMotion) {
      ctx.strokeStyle = '#ff8b65';
      ctx.lineWidth = 5;
      for (i = -2; i <= 2; i += 1) {
        var angle = i * 0.48;
        var inner = 45 + phase * 22;
        var outer = 76 + phase * 54;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawShield() {
    if ((!state.shieldActive && state.shieldFlash <= 0) || state.monsterAlpha <= 0) {
      return;
    }
    ctx.save();
    var flash = state.shieldFlash > 0 ? state.shieldFlash / 0.65 : 0;
    var gradient = ctx.createRadialGradient(MONSTER.cx - 75, MONSTER.cy - 80, 15, MONSTER.cx, MONSTER.cy, MONSTER.shieldRadius);
    gradient.addColorStop(0, 'rgba(205,255,250,' + (0.05 + flash * 0.2) + ')');
    gradient.addColorStop(0.72, 'rgba(61,222,235,' + (0.07 + flash * 0.28) + ')');
    gradient.addColorStop(1, 'rgba(104,255,225,' + (0.22 + flash * 0.55) + ')');
    ctx.fillStyle = gradient;
    ctx.strokeStyle = 'rgba(139,255,235,' + (0.58 + flash * 0.4) + ')';
    ctx.lineWidth = 5 + flash * 5;
    ctx.beginPath();
    ctx.arc(MONSTER.cx, MONSTER.cy, MONSTER.shieldRadius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(235,255,250,' + (0.18 + flash * 0.55) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(MONSTER.cx, MONSTER.cy, MONSTER.shieldRadius - 16, -2.7, -1.55, false);
    ctx.stroke();
    if (flash > 0.2) {
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(MONSTER.cx - 22, MONSTER.cy - 205);
      ctx.lineTo(MONSTER.cx + 12, MONSTER.cy - 150);
      ctx.lineTo(MONSTER.cx - 18, MONSTER.cy - 103);
      ctx.moveTo(MONSTER.cx + 205, MONSTER.cy - 30);
      ctx.lineTo(MONSTER.cx + 148, MONSTER.cy + 8);
      ctx.lineTo(MONSTER.cx + 190, MONSTER.cy + 54);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSlingshot() {
    ctx.save();
    ctx.lineCap = 'round';

    var targetX = state.selectedAmmo >= 0 && !state.projectile ? state.loadedX : SLING.x;
    var targetY = state.selectedAmmo >= 0 && !state.projectile ? state.loadedY : SLING.y;

    // Rear prong curves upward behind the main wooden frame.
    ctx.strokeStyle = '#3a2118';
    ctx.lineWidth = 34;
    ctx.beginPath();
    ctx.moveTo(365, 630);
    ctx.bezierCurveTo(390, 580, 410, 515, 410, 455);
    ctx.stroke();
    ctx.strokeStyle = '#95603a';
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(365, 630);
    ctx.bezierCurveTo(390, 580, 410, 515, 410, 455);
    ctx.stroke();

    // Rear rubber band runs left toward the leather pouch.
    ctx.strokeStyle = '#2b1919';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(410, 498);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    // Straight handle and front prong form the classic upright fork.
    ctx.strokeStyle = '#3b2118';
    ctx.lineWidth = 38;
    ctx.beginPath();
    ctx.moveTo(365, 750);
    ctx.lineTo(365, 630);
    ctx.bezierCurveTo(350, 580, 330, 515, 330, 455);
    ctx.stroke();
    ctx.strokeStyle = '#ad6c3d';
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.moveTo(365, 750);
    ctx.lineTo(365, 630);
    ctx.bezierCurveTo(350, 580, 330, 515, 330, 455);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(238,162,91,.68)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(359, 735);
    ctx.lineTo(359, 634);
    ctx.bezierCurveTo(345, 580, 330, 515, 331, 462);
    ctx.stroke();

    ctx.restore();
  }

  function drawSlingshotFront() {
    var hasLoadedAmmo = state.selectedAmmo >= 0 && !state.projectile;
    var targetX = hasLoadedAmmo ? state.loadedX : SLING.x;
    var targetY = hasLoadedAmmo ? state.loadedY : SLING.y;
    var pouchAngle = Math.atan2(498 - targetY, 330 - targetX);
    var joinLocalX = hasLoadedAmmo ? -3 : 15;
    var joinLocalY = hasLoadedAmmo ? 0 : -3;
    var bandEndX = targetX + joinLocalX * Math.cos(pouchAngle) - joinLocalY * Math.sin(pouchAngle);
    var bandEndY = targetY + joinLocalX * Math.sin(pouchAngle) + joinLocalY * Math.cos(pouchAngle);
    ctx.save();
    ctx.lineCap = 'round';

    // The outer rubber band is drawn after the ammo so it remains visible.
    ctx.strokeStyle = '#211315';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(330, 498);
    ctx.lineTo(bandEndX, bandEndY);
    ctx.stroke();

    ctx.save();
    ctx.translate(targetX, targetY);
    ctx.rotate(pouchAngle);
    ctx.fillStyle = '#432824';
    ctx.strokeStyle = '#1c1112';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (hasLoadedAmmo) {
      // Side-view pouch: it grips only the left side and covers less than half the ball.
      ctx.moveTo(-29, -18);
      ctx.quadraticCurveTo(-13, -18, -3, -11);
      ctx.lineTo(-3, 11);
      ctx.quadraticCurveTo(-13, 18, -29, 18);
      ctx.quadraticCurveTo(-36, 0, -29, -18);
    } else {
      ctx.moveTo(-18, -8);
      ctx.quadraticCurveTo(0, -15, 18, -8);
      ctx.lineTo(15, 9);
      ctx.quadraticCurveTo(0, 15, -15, 9);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  function optionColor(index) {
    var colors = [
      ['#ffd36a', '#d83d24'],
      ['#91ecff', '#2478c2'],
      ['#d5ad73', '#5d3f2a'],
      ['#c9fff4', '#43a894']
    ];
    return colors[index % colors.length];
  }

  function fittedOptionFontSize(lines, radius) {
    var fontSize = 28;
    var maxTextWidth = radius * 2 - 18;
    var fontFamily = 'Arial, "Microsoft YaHei", sans-serif';
    var fits = false;
    var i;
    while (fontSize > 14 && !fits) {
      ctx.font = '900 ' + fontSize + 'px ' + fontFamily;
      fits = true;
      for (i = 0; i < lines.length; i += 1) {
        if (ctx.measureText(lines[i]).width > maxTextWidth) {
          fits = false;
          fontSize -= 1;
          break;
        }
      }
    }
    return fontSize;
  }

  function optionTextLayout(text, radius) {
    var words = String(text).trim().split(/\s+/);
    var oneLine = [String(text)];
    var bestLines = oneLine;
    var bestSize;
    var i;
    ctx.save();
    bestSize = fittedOptionFontSize(oneLine, radius);
    if (bestSize < 22 && words.length > 1) {
      for (i = 1; i < words.length; i += 1) {
        var candidate = [words.slice(0, i).join(' '), words.slice(i).join(' ')];
        var candidateSize = fittedOptionFontSize(candidate, radius);
        if (candidateSize > bestSize) {
          bestLines = candidate;
          bestSize = candidateSize;
        }
      }
    }
    ctx.restore();
    return { lines: bestLines, fontSize: bestSize };
  }

  function sharedOptionFontSize(radius) {
    var fontSize = 28;
    var i;
    for (i = 0; i < state.options.length; i += 1) {
      fontSize = Math.min(fontSize, optionTextLayout(state.options[i], radius).fontSize);
    }
    return fontSize;
  }

  function drawElementAmmo(x, y, index, radius, alpha, showText) {
    if (!state.options[index]) {
      return;
    }
    var color = optionColor(index);
    ctx.save();
    ctx.globalAlpha = alpha;

    if (index === 0) {
      ctx.fillStyle = 'rgba(255,103,40,.82)';
      ctx.beginPath();
      ctx.moveTo(x - radius * 0.65, y - radius * 0.28);
      ctx.quadraticCurveTo(x - radius * 0.75, y - radius * 0.95, x - radius * 0.18, y - radius * 0.72);
      ctx.quadraticCurveTo(x, y - radius * 1.35, x + radius * 0.22, y - radius * 0.72);
      ctx.quadraticCurveTo(x + radius * 0.82, y - radius * 1.02, x + radius * 0.65, y - radius * 0.2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.shadowColor = color[0];
    ctx.shadowBlur = showText ? 12 : 16;
    var gradient = ctx.createRadialGradient(x - radius * 0.34, y - radius * 0.38, 3, x, y, radius);
    if (index === 0) {
      gradient.addColorStop(0, '#ffd777');
      gradient.addColorStop(0.38, '#ff9b32');
      gradient.addColorStop(1, '#bb2e24');
    } else if (index === 1) {
      gradient.addColorStop(0, '#9cecf6');
      gradient.addColorStop(0.38, '#54d7f2');
      gradient.addColorStop(1, '#2467ad');
    } else if (index === 2) {
      gradient.addColorStop(0, '#c9a16c');
      gradient.addColorStop(0.42, '#9c7448');
      gradient.addColorStop(1, '#4d3728');
    } else {
      gradient.addColorStop(0, 'rgba(194,250,237,.76)');
      gradient.addColorStop(0.45, 'rgba(132,238,218,.86)');
      gradient.addColorStop(1, 'rgba(43,137,125,.8)');
    }
    ctx.fillStyle = gradient;
    ctx.strokeStyle = color[0];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.lineWidth = Math.max(1.5, radius * 0.045);
    ctx.lineCap = 'round';
    if (index === 0) {
      ctx.strokeStyle = 'rgba(255,244,155,.36)';
      ctx.beginPath();
      ctx.arc(x - radius * 0.08, y + radius * 0.05, radius * 0.48, 2.9, 5.1, false);
      ctx.stroke();
    } else if (index === 1) {
      ctx.strokeStyle = 'rgba(233,255,255,.38)';
      ctx.beginPath();
      ctx.arc(x, y + radius * 0.05, radius * 0.55, 0.2, 2.75, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + radius * 0.28, y - radius * 0.34, radius * 0.11, 0, Math.PI * 2, false);
      ctx.stroke();
    } else if (index === 2) {
      ctx.strokeStyle = 'rgba(65,42,29,.48)';
      ctx.beginPath();
      ctx.moveTo(x - radius * 0.12, y - radius * 0.72);
      ctx.lineTo(x + radius * 0.08, y - radius * 0.2);
      ctx.lineTo(x - radius * 0.2, y + radius * 0.12);
      ctx.lineTo(x + radius * 0.12, y + radius * 0.68);
      ctx.moveTo(x + radius * 0.08, y - radius * 0.2);
      ctx.lineTo(x + radius * 0.58, y - radius * 0.05);
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(241,255,251,.4)';
      ctx.beginPath();
      ctx.arc(x - radius * 0.12, y, radius * 0.55, -1.15, 1.55, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + radius * 0.15, y + radius * 0.08, radius * 0.34, 1.8, 5.3, false);
      ctx.stroke();
    }

    if (!showText) {
      ctx.restore();
      return;
    }

    var text = state.options[index];
    var textLayout = optionTextLayout(text, radius);
    var fontSize = sharedOptionFontSize(radius);
    var fontFamily = 'Arial, "Microsoft YaHei", sans-serif';
    ctx.font = '900 ' + fontSize + 'px ' + fontFamily;
    ctx.shadowColor = 'rgba(0,0,0,.92)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(16,31,43,.78)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    var lineStep = fontSize * 0.92;
    var lineStartY = y - (textLayout.lines.length - 1) * lineStep / 2;
    var lineIndex;
    for (lineIndex = 0; lineIndex < textLayout.lines.length; lineIndex += 1) {
      var lineY = lineStartY + lineIndex * lineStep;
      ctx.strokeText(textLayout.lines[lineIndex], x, lineY);
      ctx.fillText(textLayout.lines[lineIndex], x, lineY);
    }
    ctx.restore();
  }

  function drawAmmo() {
    var now = Date.now() / 500;
    var i;
    for (i = 0; i < state.options.length && i < ammoHomes.length; i += 1) {
      if (i === state.selectedAmmo) {
        continue;
      }
      var bob = reducedMotion ? 0 : Math.sin(now + i * 1.4) * 5;
      drawElementAmmo(ammoHomes[i].x, ammoHomes[i].y + bob, i, AMMO_RADIUS, 1, true);
    }
    if (state.selectedAmmo >= 0 && !state.projectile) {
      drawElementAmmo(state.loadedX, state.loadedY, state.selectedAmmo, 30, 1, false);
    }
  }

  function drawTrajectory() {
    if (!state.dragging || state.selectedAmmo < 0) {
      return;
    }
    var vx = (SLING.x - state.loadedX) * 7.2;
    var vy = (SLING.y - state.loadedY) * 7.2;
    ctx.save();
    var i;
    for (i = 1; i <= 12; i += 1) {
      var time = i * 0.11;
      var x = SLING.x + vx * time;
      var y = SLING.y + vy * time + 0.5 * 390 * time * time;
      if (x > 1050 || y < 90 || y > 850) {
        break;
      }
      ctx.globalAlpha = 0.85 - i * 0.055;
      ctx.fillStyle = '#e8fff8';
      ctx.beginPath();
      ctx.arc(x, y, Math.max(3, 8 - i * 0.35), 0, Math.PI * 2, false);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawProjectile() {
    var p = state.projectile;
    if (!p) {
      return;
    }
    ctx.save();
    var i;
    for (i = 0; i < p.trail.length; i += 1) {
      if (p.trail[i].life <= 0) {
        continue;
      }
      ctx.globalAlpha = p.trail[i].life / 0.35 * 0.45;
      ctx.fillStyle = optionColor(p.optionIndex)[0];
      ctx.beginPath();
      ctx.arc(p.trail[i].x, p.trail[i].y, 16, 0, Math.PI * 2, false);
      ctx.fill();
    }
    ctx.restore();
    if (p.mode === 'fire') {
      var fireDuration = reducedMotion ? 0.72 : FIRE_ABILITY_DURATION;
      var burnProgress = clamp(p.life / fireDuration, 0, 1);
      var burnScale = 1 - burnProgress * 0.68;
      var burnAlpha = 1 - clamp((burnProgress - 0.7) / 0.3, 0, 1);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(burnScale, burnScale);
      ctx.rotate(Math.sin(p.life * 15) * 0.08);
      ctx.filter = 'grayscale(' + burnProgress + ') brightness(' + (1 - burnProgress * 0.68) + ')';
      drawElementAmmo(0, 0, p.optionIndex, PROJECTILE_RADIUS, burnAlpha, false);
      ctx.filter = 'none';
      ctx.globalAlpha = burnAlpha * burnProgress;
      ctx.strokeStyle = '#171313';
      ctx.lineWidth = 2.5;
      for (i = 0; i < 4; i += 1) {
        var crackAngle = i * Math.PI * 0.5 + 0.35;
        ctx.beginPath();
        ctx.moveTo(Math.cos(crackAngle) * 4, Math.sin(crackAngle) * 4);
        ctx.lineTo(Math.cos(crackAngle) * 14, Math.sin(crackAngle) * 14);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    if (p.mode === 'wind') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(p.x, p.y);
      ctx.rotate(-p.life * 8);
      ctx.shadowColor = '#8dffe6';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = 'rgba(141,255,230,' + (0.85 - clamp(p.life / 1.05, 0, 1) * 0.45) + ')';
      ctx.lineWidth = 5;
      for (i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.ellipse(0, 0, 34 + i * 9, 15 + i * 4, i * 0.65, 0, Math.PI * 1.55);
        ctx.stroke();
      }
      ctx.restore();
    }
    drawElementAmmo(p.x, p.y, p.optionIndex, PROJECTILE_RADIUS, 1, false);
  }

  function drawParticles() {
    var i;
    for (i = 0; i < state.particles.length; i += 1) {
      var p = state.particles[i];
      ctx.save();
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.life * 4);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
  }

  function drawInstructions() {
    ctx.save();
    if (state.stage === 1) {
      drawPanel(150, 770, 430, 94, 'rgba(8,17,29,.76)', 'rgba(126,255,226,.25)', 22);
      ctx.fillStyle = '#72f6d6';
      ctx.font = '800 21px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('① 选择答案弹药', 175, 809);
      ctx.fillText('② 向左后方拉动，松手发射', 175, 843);
    }
    if (state.feedbackTimer > 0 && state.feedback) {
      drawPanel(590, 812, 550, 55, 'rgba(8,17,29,.88)', 'rgba(255,255,255,.18)', 20);
      ctx.fillStyle = state.feedback.indexOf('命中') >= 0 ? '#8dffe6' : '#ffffff';
      ctx.font = '800 22px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(state.feedback, 865, 848);
    }
    ctx.restore();
  }

  function drawEndScreen() {
    if (state.phase !== 'ended') {
      return;
    }
    ctx.save();
    ctx.fillStyle = 'rgba(4,9,16,.68)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.shadowColor = 'rgba(0,0,0,.5)';
    ctx.shadowBlur = 28;
    drawPanel(475, 260, 650, 395, 'rgba(14,26,39,.96)', '#77f5da', 38);
    ctx.shadowBlur = 0;

    drawPanel(570, 335, 460, 105, 'rgba(5,14,25,.74)', 'rgba(126,255,226,.25)', 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 46px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Score ' + state.score, 800, 388);

    drawPanel(RESTART_RECT.x, RESTART_RECT.y, RESTART_RECT.w, RESTART_RECT.h, '#63e9c7', '#dffff7', 22);
    ctx.fillStyle = '#082720';
    ctx.font = '900 32px "Microsoft YaHei", sans-serif';
    ctx.fillText('再玩一次', 800, 549);
    ctx.restore();
  }

  function drawStageMenu() {
    if (state.phase !== 'stageMenu') {
      return;
    }
    var nextStage = Math.min(MAX_STAGES, state.stage + 1);
    var bossIncoming = state.stage < MAX_STAGES && isBossStage(nextStage);
    var accentColor = bossIncoming ? '#ffb64d' : '#71f3d7';
    ctx.save();
    ctx.fillStyle = 'rgba(4,9,16,.72)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.shadowColor = 'rgba(0,0,0,.55)';
    ctx.shadowBlur = 30;
    drawPanel(520, 170, 560, 560,
      bossIncoming ? 'rgba(38,20,24,.97)' : 'rgba(13,27,42,.97)', accentColor, 34);
    ctx.shadowBlur = 0;

    ctx.fillStyle = bossIncoming ? '#ffd36a' : '#8dffe6';
    ctx.font = bossIncoming ? '900 34px "Microsoft YaHei", sans-serif' : '900 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bossIncoming ? 'BOSS 来袭！' : 'STAGE CLEAR', 800, 215);

    var imageStage = bossIncoming ? nextStage : state.stage;
    var image = monsterImages[monsterIndexForStage(imageStage)];
    if (image && image.complete && image.naturalWidth) {
      var maxW = 280;
      var maxH = 220;
      var ratio = image.naturalWidth / image.naturalHeight;
      var drawW = maxW;
      var drawH = drawW / ratio;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * ratio;
      }
      ctx.save();
      ctx.shadowColor = bossIncoming ? 'rgba(255,90,70,.62)' : 'rgba(113,243,215,.48)';
      ctx.shadowBlur = bossIncoming ? 38 : 28;
      ctx.drawImage(image, 800 - drawW / 2, 575 - drawH, drawW, drawH);
      ctx.restore();
    }

    drawPanel(bossIncoming ? 610 : 650, 250, bossIncoming ? 380 : 300, 105,
      'rgba(5,14,25,.74)', bossIncoming ? 'rgba(255,182,77,.48)' : 'rgba(126,255,226,.25)', 24);
    if (bossIncoming) {
      ctx.fillStyle = '#fff1c4';
      ctx.font = '900 27px "Microsoft YaHei", sans-serif';
      ctx.fillText('第 ' + nextStage + ' 关', 800, 280);
      ctx.fillStyle = '#ffbf5e';
      ctx.font = '800 18px "Microsoft YaHei", sans-serif';
      ctx.fillText('答对 ' + questionsForStage(nextStage) + ' 题 · ' + bossWaveCount(nextStage) + ' 管血条', 800, 322);
    } else {
      ctx.fillStyle = '#ffe47e';
      ctx.font = '800 20px Arial, sans-serif';
      ctx.fillText('Score', 740, 303);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 52px Arial, sans-serif';
      ctx.fillText(String(state.score), 865, 303);
    }

    ctx.fillStyle = bossIncoming ? '#ffd7c5' : '#cfe0e2';
    ctx.font = '800 18px "Microsoft YaHei", sans-serif';
    ctx.fillText(bossIncoming ? '连续错弹 3 次，BOSS 将发动攻击' :
      (state.stage >= MAX_STAGES ? '挑战完成，即将结算…' : '下一关即将开始…'), 800, 630);

    var progress = clamp(1 - (state.stageMenuDeadline - Date.now()) / state.stageMenuDuration, 0, 1);
    drawPanel(620, 665, 360, 8, 'rgba(255,255,255,.12)', '', 4);
    drawPanel(620, 665, 360 * progress, 8, accentColor, '', 4);
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (state.phase !== 'ready' && state.phase !== 'map') {
      drawHud();
      drawRevivePotion();
      drawStoredPotion();
      drawLives();
      drawQuestionBubble();
      drawMonster();
      drawShield();
      drawMonsterHurtEffect();
      drawRoarEffect();
      drawBossLaserAttack();
      drawWindAbility();
      drawFireAbility();
      drawHealthBar();
      drawSlingshot();
      drawTrajectory();
      drawAmmo();
      drawSlingshotFront();
      drawProjectile();
      drawParticles();
      drawInstructions();
      drawStageMenu();
      drawEndScreen();
    }
  }

  function loop(timestamp) {
    var dt = lastFrame ? Math.min(0.034, (timestamp - lastFrame) / 1000) : 0;
    lastFrame = timestamp;
    update(dt);
    render();
    window.requestAnimationFrame(loop);
  }

  canvas.addEventListener('mousedown', function (event) {
    event.preventDefault();
    beginInput(canvasPoint(event.clientX, event.clientY));
  });

  window.addEventListener('mousemove', function (event) {
    if (!state.dragging) {
      return;
    }
    event.preventDefault();
    moveInput(canvasPoint(event.clientX, event.clientY));
  });

  window.addEventListener('mouseup', function (event) {
    if (!state.dragging) {
      return;
    }
    event.preventDefault();
    endInput();
  });

  canvas.addEventListener('touchstart', function (event) {
    if (!event.changedTouches.length) {
      return;
    }
    event.preventDefault();
    var touch = event.changedTouches[0];
    beginInput(canvasPoint(touch.clientX, touch.clientY));
  }, { passive: false });

  canvas.addEventListener('touchmove', function (event) {
    if (!state.dragging || !event.changedTouches.length) {
      return;
    }
    event.preventDefault();
    var touch = event.changedTouches[0];
    moveInput(canvasPoint(touch.clientX, touch.clientY));
  }, { passive: false });

  canvas.addEventListener('touchend', function (event) {
    if (!state.dragging) {
      return;
    }
    event.preventDefault();
    endInput();
  }, { passive: false });

  document.addEventListener('visibilitychange', function () {
    lastFrame = 0;
  });

  window.addEventListener('resize', resizeGameShell);

  if (window.matchMedia) {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  window.__grammarMonsterGame = {
    getSnapshot: function () {
      return {
        phase: state.phase,
        grade: state.grade,
        term: state.term,
        score: state.score,
        stage: state.stage,
        hp: state.hp,
        stageQuestionCount: questionsForStage(state.stage),
        isBossStage: isBossStage(state.stage),
        bossWave: isBossStage(state.stage) ?
          clamp(Math.floor((questionsForStage(state.stage) - state.hp) / QUESTIONS_PER_STAGE) + 1, 1, bossWaveCount(state.stage)) : 0,
        bossWaveCount: isBossStage(state.stage) ? bossWaveCount(state.stage) : 0,
        bossWrongStreak: state.bossWrongStreak,
        playerLives: state.playerLives,
        stageDuration: state.stageDuration,
        correctStreak: state.correctStreak,
        revivePotionReady: state.revivePotionCount > 0,
        revivePotionCount: state.revivePotionCount,
        bossAttackTimer: state.bossAttackTimer,
        windAbilityAvailable: state.elementAbilitySchedule.some(function (ability) {
          return ability.type === 'wind';
        }),
        windAbilityUsed: state.windAbilityUsed,
        windAbilityTimer: Number(state.windAbilityTimer.toFixed(2)),
        fireAbilityAvailable: state.elementAbilitySchedule.some(function (ability) {
          return ability.type === 'fire';
        }),
        fireAbilityUsed: state.fireAbilityUsed,
        fireAbilityTimer: Number(state.fireAbilityTimer.toFixed(2)),
        elementAbilitySchedule: state.elementAbilitySchedule.map(function (ability) {
          return { question: ability.question, type: ability.type };
        }),
        backgroundAutoplayAttempted: backgroundAutoplayAttempted,
        backgroundMusicPlaying: backgroundMusicPlaying,
        monsterHurtTimer: state.monsterHurtTimer,
        roarTimer: state.roarTimer,
        timeLeft: Math.ceil(state.timeLeft),
        question: state.question ? state.question.question : '',
        knowledgePoint: state.knowledgePoint,
        options: state.options.slice(),
        ammoCount: ammoHomes.length,
        selectedAmmo: state.selectedAmmo,
        projectile: state.projectile ? {
          x: Math.round(state.projectile.x),
          y: Math.round(state.projectile.y),
          mode: state.projectile.mode
        } : null
      };
    }
  };

  loadImages(finishLoadingScreen);
  loadAudioEffects();
  startBackgroundMusic();
  resizeGameShell();
  window.requestAnimationFrame(loop);
}());
