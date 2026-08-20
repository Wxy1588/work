(function () {
  "use strict";

  var canvas = document.getElementById("gameCanvas");
  var ctx = canvas.getContext("2d");
  var uiLayer = document.getElementById("uiLayer");
  var hud = document.getElementById("hud");
  var timerHud = document.getElementById("timerHud");
  var scoreHud = document.getElementById("scoreHud");
  var playerGrid = document.getElementById("playerGrid");
  var backgroundMusic = document.getElementById("backgroundMusic");
  var MAX_PLAYERS = 5;
  var PLAYER_AVATARS = [
    "photo/avatar1.png",
    "photo/avatar2.png",
    "photo/avatar3.png",
    "photo/avatar4.png",
    "photo/avatar5.png"
  ];
  var AVATAR_TEAR_SETTINGS = [
    { left: { x: 33, y: 46 }, right: { x: 63, y: 46 } },
    { left: { x: 34, y: 59 }, right: { x: 61, y: 59 } },
    { left: { x: 32, y: 37 }, right: { x: 54, y: 37 } },
    { left: { x: 33, y: 40 }, right: { x: 63, y: 40 } },
    { left: { x: 37, y: 36 }, right: { x: 58, y: 34 } }
  ];
  var DIFFICULTIES = [
    { key: "easy", label: "简单" },
    { key: "medium", label: "中等" },
    { key: "hard", label: "困难" }
  ];
  var defaultThemeGroups = {
    easy: ["水果", "动物", "交通工具"],
    medium: ["含字母 a 的英文单词", "电影或动画角色", "城市"],
    hard: ["不含字母 e 的英文单词", "四个字的成语", "世界首都"]
  };
  var themeGroups = normalizeThemeGroups(window.WORD_BOMB_THEMES);

  var state = {
    screen: "boot",
    players: 2,
    difficulty: "easy",
    score: 0,
    theme: "",
    winner: "",
    winnerPlayerId: 0,
    winnerAvatar: "",
    playerStats: [],
    turnPlayerId: 0,
    round: 0,
    lastThemeIndexByDifficulty: { easy: -1, medium: -1, hard: -1 },
    startedAt: 0,
    raf: 0
  };
  var THEME_CARD_BOUNDS = {
    left: 395,
    right: 1205,
    top: 279,
    bottom: 549
  };

  if (typeof window.onReport !== "function") {
    window.onReport = function (score) {
      console.log("onReport", score);
    };
  }

  function playBackgroundMusic() {
    if (!backgroundMusic) {
      return;
    }

    backgroundMusic.volume = 0.35;
    backgroundMusic.loop = true;
    var playPromise = backgroundMusic.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        // 浏览器可能要求先有一次用户操作，后续手势会再次尝试播放。
      });
    }
  }

  window.addEventListener("pointerdown", playBackgroundMusic, { once: true });
  window.addEventListener("touchstart", playBackgroundMusic, { once: true, passive: true });
  window.addEventListener("keydown", playBackgroundMusic, { once: true });
  playBackgroundMusic();

  function normalizeThemeGroups(source) {
    var groups = {};

    DIFFICULTIES.forEach(function (difficulty) {
      groups[difficulty.key] = defaultThemeGroups[difficulty.key].slice();
    });

    if (Array.isArray(source) && source.length) {
      DIFFICULTIES.forEach(function (difficulty) {
        groups[difficulty.key] = source.slice();
      });
      return groups;
    }

    if (source && typeof source === "object") {
      DIFFICULTIES.forEach(function (difficulty) {
        var value = source[difficulty.key];
        if (Array.isArray(value) && value.length) {
          groups[difficulty.key] = value.slice();
        } else if (value && Array.isArray(value.items) && value.items.length) {
          groups[difficulty.key] = value.items.slice();
        }
      });
    }

    return groups;
  }

  function getDifficultyMeta(key) {
    for (var i = 0; i < DIFFICULTIES.length; i += 1) {
      if (DIFFICULTIES[i].key === key) {
        return DIFFICULTIES[i];
      }
    }
    return DIFFICULTIES[0];
  }

  function createPlayerStats() {
    var players = [];
    var avatars = PLAYER_AVATARS.slice();

    for (var avatarIndex = avatars.length - 1; avatarIndex > 0; avatarIndex -= 1) {
      var randomIndex = Math.floor(Math.random() * (avatarIndex + 1));
      var avatar = avatars[avatarIndex];
      avatars[avatarIndex] = avatars[randomIndex];
      avatars[randomIndex] = avatar;
    }

    for (var i = 1; i <= state.players; i += 1) {
      players.push({
        id: i,
        name: "玩家 " + i,
        avatar: avatars[i - 1],
        score: 0,
        eliminated: false
      });
    }
    return players;
  }

  function getActivePlayers() {
    return state.playerStats.filter(function (player) {
      return !player.eliminated;
    });
  }

  function getRankedPlayers() {
    return state.playerStats.slice().sort(function (a, b) {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (a.id === state.winnerPlayerId) {
        return -1;
      }
      if (b.id === state.winnerPlayerId) {
        return 1;
      }
      return a.id - b.id;
    });
  }

  function getRankedEntries() {
    var previousScore = null;
    var place = 0;

    return getRankedPlayers().map(function (player, index) {
      if (index === 0 || player.score !== previousScore) {
        place += 1;
      }
      previousScore = player.score;
      return { player: player, place: place };
    });
  }

  function makeAvatarTear(side, avatarSource) {
    var match = /avatar(\d+)\.png$/.exec(avatarSource);
    var avatarIndex = match ? Number(match[1]) - 1 : 0;
    var settings = AVATAR_TEAR_SETTINGS[avatarIndex] || AVATAR_TEAR_SETTINGS[0];
    var position = settings[side] || settings.left;
    var tear = document.createElement("span");
    tear.className = "loser_tear " + side;
    tear.style.left = position.x + "%";
    tear.style.top = position.y + "%";
    return tear;
  }

  function syncPlayerGridLayout() {
    var rect = canvas.getBoundingClientRect();
    var scaleX = rect.width / canvas.width;
    var scaleY = rect.height / canvas.height;
    var cardLeft = rect.left + THEME_CARD_BOUNDS.left * scaleX;
    var cardRight = rect.left + THEME_CARD_BOUNDS.right * scaleX;
    var cardTop = rect.top + THEME_CARD_BOUNDS.top * scaleY;
    var cardBottom = rect.top + THEME_CARD_BOUNDS.bottom * scaleY;

    playerGrid.style.setProperty("--lane-top", (cardTop / 2) + "px");
    playerGrid.style.setProperty("--lane-bottom", ((cardBottom + window.innerHeight) / 2) + "px");
    playerGrid.style.setProperty("--lane-left", (cardLeft / 2) + "px");
    playerGrid.style.setProperty("--lane-right", ((cardRight + window.innerWidth) / 2) + "px");
  }

  function distributePlayers(players) {
    var total = players.length;
    var bottomCount = Math.min(2, total);
    var outerPlayers = players.slice(bottomCount);

    return {
      bottom: players.slice(0, bottomCount),
      right: outerPlayers.slice(0, 1),
      top: outerPlayers.length === 3 ? outerPlayers.slice(1, 2) : [],
      left: outerPlayers.length === 2 ? outerPlayers.slice(1, 2) : outerPlayers.slice(2, 3)
    };
  }

  function clearNode(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function bindPress(el, handler) {
    var touchedAt = 0;

    el.addEventListener("touchstart", function (event) {
      touchedAt = Date.now();
      event.preventDefault();
      handler(event);
    }, { passive: false });

    el.addEventListener("mousedown", function (event) {
      if (Date.now() - touchedAt < 650) {
        return;
      }
      handler(event);
    });
  }

  function setHud(visible) {
    hud.style.display = "none";
    hud.setAttribute("aria-hidden", "true");
    timerHud.innerText = "计时 --";
    scoreHud.innerText = "得分 " + state.score;
  }

  function makePanel(title, body) {
    clearNode(uiLayer);
    uiLayer.appendChild(hud);
    uiLayer.appendChild(playerGrid);
    playerGrid.style.display = "none";

    var scrim = document.createElement("div");
    scrim.className = "scrim";

    var panel = document.createElement("div");
    panel.className = "panel";

    var heading = document.createElement(state.screen === "start" ? "h1" : "h2");
    heading.innerText = title;
    panel.appendChild(heading);

    if (body) {
      var paragraph = document.createElement("p");
      paragraph.innerText = body;
      panel.appendChild(paragraph);
    }

    scrim.appendChild(panel);
    uiLayer.appendChild(scrim);
    return panel;
  }

  function showPlayerSetup() {
    state.screen = "setup";
    setHud(false);
    var panel = makePanel("选择人数", "");
    panel.className += " setup_panel";

    var picker = document.createElement("div");
    picker.className = "count_picker";

    var minus = document.createElement("button");
    minus.className = "count_button";
    minus.innerText = "-";
    minus.setAttribute("aria-label", "减少人数");

    var input = document.createElement("input");
    input.id = "playerCount";
    input.className = "count_input";
    input.type = "number";
    input.min = "2";
    input.max = String(MAX_PLAYERS);
    input.step = "1";
    input.inputMode = "numeric";
    input.value = String(state.players);
    input.setAttribute("aria-label", "玩家人数");

    var plus = document.createElement("button");
    plus.className = "count_button";
    plus.innerText = "+";
    plus.setAttribute("aria-label", "增加人数");

    picker.appendChild(minus);
    picker.appendChild(input);
    picker.appendChild(plus);
    panel.appendChild(picker);

    var row = document.createElement("div");
    row.className = "button_row";

    var next = document.createElement("button");
    next.className = "game_button";
    next.innerText = "下一步";

    var toast = document.createElement("div");
    toast.className = "toast";

    function normalizeCount() {
      var count = Math.round(Number(input.value));
      if (!Number.isFinite(count)) {
        count = state.players;
      }
      count = Math.max(2, Math.min(MAX_PLAYERS, count));
      input.value = String(count);
      return count;
    }

    bindPress(minus, function () {
      input.value = String(Math.max(2, normalizeCount() - 1));
      toast.innerText = "";
    });

    bindPress(plus, function () {
      input.value = String(Math.min(MAX_PLAYERS, normalizeCount() + 1));
      toast.innerText = "";
    });

    input.addEventListener("input", function () {
      var count = Number(input.value);
      if (input.value !== "" && Number.isFinite(count) && count > MAX_PLAYERS) {
        input.value = String(MAX_PLAYERS);
      }
    });

    input.addEventListener("change", normalizeCount);

    bindPress(next, function () {
      var count = normalizeCount();
      state.players = count;
      showRules();
    });

    row.appendChild(next);
    panel.appendChild(row);
    panel.appendChild(toast);
    input.focus();
  }

  function showDifficultySetup() {
    state.screen = "difficulty";
    setHud(false);
    var panel = makePanel("选择难度", "");
    panel.className += " difficulty_panel";

    var intro = document.createElement("div");
    intro.className = "difficulty_intro";
    intro.innerText = "单词炸弹";
    panel.insertBefore(intro, panel.firstChild);

    var options = document.createElement("div");
    options.className = "difficulty_options";

    DIFFICULTIES.forEach(function (difficulty) {
      var button = document.createElement("button");
      button.className = "difficulty_button " + difficulty.key;

      var icon = document.createElement("span");
      icon.className = "difficulty_icon";
      icon.innerText = difficulty.key === "easy" ? "轻" : difficulty.key === "medium" ? "准" : "爆";

      var title = document.createElement("span");
      title.className = "difficulty_title";
      title.innerText = difficulty.label;

      var action = document.createElement("span");
      action.className = "difficulty_action";
      action.innerText = "点击选择";

      button.appendChild(icon);
      button.appendChild(title);
      button.appendChild(action);

      bindPress(button, function () {
        state.difficulty = difficulty.key;
        showPlayerSetup();
      });

      options.appendChild(button);
    });

    panel.appendChild(options);
  }

  function showRules() {
    state.screen = "rules";
    setHud(false);
    var panel = makePanel("游戏规则", "");
    panel.className += " rules_panel";

    var chip = document.createElement("div");
    chip.className = "difficulty_chip";
    chip.innerText = getDifficultyMeta(state.difficulty).label + "模式";
    panel.appendChild(chip);

    var steps = document.createElement("div");
    steps.className = "rule_steps";

    [
      "所有人围成一圈，按顺序轮流接词",
      "根据本轮主题说对应单词，不能重复",
      "卡顿超过 3 秒就算输"
    ].forEach(function (text, index) {
      var step = document.createElement("div");
      step.className = "rule_step";

      var badge = document.createElement("div");
      badge.className = "rule_badge";
      badge.innerText = String(index + 1);

      var label = document.createElement("div");
      label.className = "rule_text";
      label.innerText = text;

      step.appendChild(badge);
      step.appendChild(label);
      steps.appendChild(step);
    });

    panel.appendChild(steps);

    var row = document.createElement("div");
    row.className = "button_row";

    var start = document.createElement("button");
    start.className = "game_button";
    start.innerText = "游戏开始";
    bindPress(start, startRound);

    row.appendChild(start);
    panel.appendChild(row);
  }

  function pickTheme() {
    var themes = themeGroups[state.difficulty] || themeGroups.easy || defaultThemeGroups.easy;

    if (themes.length === 1) {
      state.lastThemeIndexByDifficulty[state.difficulty] = 0;
      return themes[0];
    }

    var lastIndex = state.lastThemeIndexByDifficulty[state.difficulty];
    var index = lastIndex;
    while (index === lastIndex) {
      index = Math.floor(Math.random() * themes.length);
    }
    state.lastThemeIndexByDifficulty[state.difficulty] = index;
    return themes[index];
  }

  function startRound() {
    state.screen = "playing";
    state.round += 1;
    state.theme = pickTheme();
    state.winner = "";
    state.winnerPlayerId = 0;
    state.winnerAvatar = "";
    state.playerStats = createPlayerStats();
    state.turnPlayerId = state.playerStats[0].id;
    state.score = 0;
    state.startedAt = performance.now();

    clearNode(uiLayer);
    uiLayer.appendChild(hud);
    uiLayer.appendChild(playerGrid);
    setHud(true);
    renderPlayerButtons();
  }

  function renderPlayerButtons() {
    syncPlayerGridLayout();
    clearNode(playerGrid);
    playerGrid.style.display = "block";

    var lanes = distributePlayers(state.playerStats);

    function createPlayerCard(player) {
      var card = document.createElement("div");
      var isCurrentTurn = !player.eliminated && player.id === state.turnPlayerId;
      card.className = "player_card" + (isCurrentTurn ? " current_turn" : "") + (player.eliminated ? " eliminated" : "");

      var avatar = document.createElement("img");
      avatar.className = "player_avatar";
      avatar.src = player.avatar;
      avatar.alt = "";
      avatar.draggable = false;

      var name = document.createElement("div");
      name.className = "player_name";
      name.innerText = player.name;

      var score = document.createElement("div");
      score.className = "player_score";
      score.innerText = String(player.score);

      var plus = document.createElement("button");
      plus.className = "judge_button judge_yes";
      plus.innerText = "√";
      plus.setAttribute("aria-label", player.name + " 加分");
      plus.disabled = player.eliminated || !isCurrentTurn;
      bindPress(plus, function () {
        addPlayerScore(player.id);
      });

      var out = document.createElement("button");
      out.className = "judge_button judge_no";
      out.innerText = "×";
      out.setAttribute("aria-label", player.name + " 淘汰");
      out.disabled = player.eliminated || !isCurrentTurn;
      bindPress(out, function () {
        eliminatePlayer(player.id);
      });

      card.appendChild(avatar);
      card.appendChild(name);
      card.appendChild(score);
      card.appendChild(plus);
      card.appendChild(out);
      return card;
    }

    ["top", "left", "right", "bottom"].forEach(function (laneName) {
      var lanePlayers = lanes[laneName];
      if (!lanePlayers.length) {
        return;
      }

      var lane = document.createElement("div");
      lane.className = "player_lane " + laneName;

      lanePlayers.forEach(function (player) {
        lane.appendChild(createPlayerCard(player));
      });

      playerGrid.appendChild(lane);
    });
  }

  function findPlayer(playerId) {
    for (var i = 0; i < state.playerStats.length; i += 1) {
      if (state.playerStats[i].id === playerId) {
        return state.playerStats[i];
      }
    }
    return null;
  }

  function getNextActivePlayerId(playerId) {
    var total = state.playerStats.length;
    var startIndex = -1;

    for (var i = 0; i < total; i += 1) {
      if (state.playerStats[i].id === playerId) {
        startIndex = i;
        break;
      }
    }

    for (var offset = 1; offset <= total; offset += 1) {
      var player = state.playerStats[(startIndex + offset) % total];
      if (!player.eliminated) {
        return player.id;
      }
    }

    return 0;
  }

  function addPlayerScore(playerId) {
    if (state.screen !== "playing") {
      return;
    }
    var player = findPlayer(playerId);
    if (!player || player.eliminated || player.id !== state.turnPlayerId) {
      return;
    }
    player.score += 1;
    state.turnPlayerId = getNextActivePlayerId(player.id);
    renderPlayerButtons();
  }

  function eliminatePlayer(playerId) {
    if (state.screen !== "playing") {
      return;
    }
    var player = findPlayer(playerId);
    if (!player || player.eliminated || player.id !== state.turnPlayerId) {
      return;
    }
    player.eliminated = true;

    var activePlayers = getActivePlayers();
    if (activePlayers.length === 1) {
      endWithWinner(activePlayers[0]);
      return;
    }

    state.turnPlayerId = getNextActivePlayerId(player.id);

    renderPlayerButtons();
  }

  function endWithWinner(player) {
    state.screen = "winner";
    state.winner = player.name;
    state.winnerPlayerId = player.id;
    state.winnerAvatar = player.avatar.replace(/\.png$/, "_happy.png");
    state.score = player.score;
    scoreHud.innerText = "得分 " + state.score;
    playerGrid.style.display = "none";
    window.onReport(state.score);
    showWinner();
  }

  function showWinner() {
    setHud(true);
    var panel = makePanel("", "");
    panel.className += " winner_panel";
    clearNode(panel);

    var homeButton = document.createElement("button");
    homeButton.className = "winner_home_button";
    homeButton.innerText = "返回首页";
    homeButton.setAttribute("aria-label", "返回难度选择");
    bindPress(homeButton, showDifficultySetup);
    panel.appendChild(homeButton);

    var layout = document.createElement("div");
    layout.className = "winner_layout";

    var winnerAvatar = document.createElement("img");
    winnerAvatar.className = "winner_avatar";
    winnerAvatar.src = state.winnerAvatar;
    winnerAvatar.alt = state.winner + " 获胜头像";
    winnerAvatar.draggable = false;

    var avatarGroup = document.createElement("div");
    avatarGroup.className = "winner_avatar_group";
    avatarGroup.appendChild(winnerAvatar);

    var loserAvatarRow = document.createElement("div");
    var loserCount = state.playerStats.length - 1;
    loserAvatarRow.className = "loser_avatar_row avatar_count_" + loserCount;

    state.playerStats.forEach(function (player) {
      if (player.id === state.winnerPlayerId) {
        return;
      }

      var loserAvatarItem = document.createElement("div");
      loserAvatarItem.className = "loser_avatar_item";

      var loserAvatar = document.createElement("img");
      loserAvatar.className = "loser_avatar";
      loserAvatar.src = player.avatar.replace(/\.png$/, "_sad.png");
      loserAvatar.alt = player.name + " 伤心头像";
      loserAvatar.draggable = false;

      var loserAvatarVisual = document.createElement("div");
      loserAvatarVisual.className = "loser_avatar_visual";
      loserAvatarVisual.appendChild(loserAvatar);
      loserAvatarVisual.appendChild(makeAvatarTear("left", player.avatar));
      loserAvatarVisual.appendChild(makeAvatarTear("right", player.avatar));

      var loserName = document.createElement("div");
      loserName.className = "loser_avatar_name";
      loserName.innerText = player.name;

      loserAvatarItem.appendChild(loserAvatarVisual);
      loserAvatarItem.appendChild(loserName);
      loserAvatarRow.appendChild(loserAvatarItem);
    });

    avatarGroup.appendChild(loserAvatarRow);

    var summary = document.createElement("div");
    summary.className = "winner_summary";

    var mark = document.createElement("div");
    mark.className = "winner_mark";
    mark.innerText = "冠";
    summary.appendChild(mark);

    var title = document.createElement("div");
    title.className = "winner_title";
    title.innerText = "本轮冠军";
    summary.appendChild(title);

    var subtitle = document.createElement("div");
    subtitle.className = "winner_subtitle";
    subtitle.innerText = "反应够快，词库够稳";
    summary.appendChild(subtitle);

    var winner = document.createElement("div");
    winner.className = "winner_champion";
    winner.innerText = state.winner;
    summary.appendChild(winner);

    var theme = document.createElement("div");
    theme.className = "winner_theme";
    theme.innerText = getDifficultyMeta(state.difficulty).label + "模式 / 本轮主题：" + state.theme;
    summary.appendChild(theme);

    var row = document.createElement("div");
    row.className = "button_row";

    var replay = document.createElement("button");
    replay.className = "game_button";
    replay.innerText = "重新开始";
    bindPress(replay, startRound);

    row.appendChild(replay);
    summary.appendChild(row);

    var ranking = document.createElement("div");
    ranking.className = "rank_panel";

    var rankTitle = document.createElement("div");
    rankTitle.className = "rank_title";
    rankTitle.innerText = "排行榜";
    ranking.appendChild(rankTitle);

    getRankedEntries().forEach(function (entry) {
      var player = entry.player;
      var item = document.createElement("div");
      item.className = "rank_item";

      var place = document.createElement("div");
      place.className = "rank_place";
      place.innerText = String(entry.place);

      var avatar = document.createElement("img");
      avatar.className = "rank_avatar";
      avatar.src = player.avatar;
      avatar.alt = "";
      avatar.draggable = false;

      var name = document.createElement("div");
      name.className = "rank_name";
      name.innerText = player.name;

      var score = document.createElement("div");
      score.className = "rank_score";
      score.innerText = String(player.score);

      item.appendChild(place);
      item.appendChild(avatar);
      item.appendChild(name);
      item.appendChild(score);
      ranking.appendChild(item);
    });

    layout.appendChild(avatarGroup);
    layout.appendChild(summary);
    layout.appendChild(ranking);
    panel.appendChild(layout);
  }

  function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  function drawBomb(cx, cy, scale, fusePulse) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    ctx.fillStyle = "rgba(24, 32, 52, 0.18)";
    ctx.beginPath();
    ctx.ellipse(18, 86, 170, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#222b40";
    ctx.beginPath();
    ctx.arc(0, 0, 118, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.beginPath();
    ctx.arc(-42, -48, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#111827";
    roundRect(-28, -142, 56, 58, 14);
    ctx.fill();

    ctx.strokeStyle = "#3b4358";
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(8, -148);
    ctx.bezierCurveTo(74, -206, 134, -144, 86, -102);
    ctx.stroke();

    ctx.restore();
  }

  function drawThemeCard(now) {
    var pulse = (Math.sin(now / 260) + 1) / 2;
    var wobble = Math.sin(now / 520) * 4;

    ctx.save();
    ctx.translate(800, 414 + wobble);
    ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
    ctx.strokeStyle = "rgba(24, 32, 52, 0.13)";
    ctx.lineWidth = 3;
    roundRect(-405, -135, 810, 270, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f04f45";
    ctx.font = "900 42px Microsoft YaHei, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("本轮主题", 0, -64);

    if (state.screen !== "playing") {
      ctx.fillStyle = "rgba(246, 184, 63, 0.22)";
      roundRect(-76, -122, 152, 36, 8);
      ctx.fill();
      ctx.fillStyle = "#945e05";
      ctx.font = "900 20px Microsoft YaHei, Arial";
      ctx.fillText(getDifficultyMeta(state.difficulty).label + "模式", 0, -104);
    }

    ctx.fillStyle = "#182034";
    ctx.font = fitFont(state.theme, 600, 76, 36);
    ctx.fillText(state.theme, 0, 18);

    ctx.fillStyle = "rgba(30, 155, 120, 0.16)";
    roundRect(-148, 78, 296, 42, 8);
    ctx.fill();
    ctx.fillStyle = "#16745f";
    ctx.font = "800 24px Microsoft YaHei, Arial";
    ctx.fillText("√ 加分  × 淘汰", 0, 100);
    ctx.restore();

    drawBomb(295, 508, 0.82, pulse);
    drawBomb(1308, 494, 0.64, 1 - pulse);
  }

  function fitFont(text, maxWidth, startSize, minSize) {
    var size = startSize;
    do {
      ctx.font = "900 " + size + "px Microsoft YaHei, Arial";
      if (ctx.measureText(text).width <= maxWidth || size <= minSize) {
        return ctx.font;
      }
      size -= 2;
    } while (size > minSize);
    return "900 " + minSize + "px Microsoft YaHei, Arial";
  }

  function drawIdle(now) {
    var pulse = (Math.sin(now / 420) + 1) / 2;
    drawBomb(800, 455 + Math.sin(now / 620) * 6, 1.02, pulse);

    ctx.fillStyle = "rgba(255, 255, 255, 0.58)";
    roundRect(492, 668, 616, 58, 8);
    ctx.fill();
    ctx.fillStyle = "#1f2a42";
    ctx.font = "900 28px Microsoft YaHei, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("接住主题，别让炸弹停下来", 800, 697);
  }

  function drawWinner(now) {
    drawThemeCard(now);
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "#f6b83f";
    for (var i = 0; i < 24; i += 1) {
      var angle = i * Math.PI * 2 / 24 + now / 900;
      var radius = 210 + Math.sin(now / 180 + i) * 22;
      ctx.beginPath();
      ctx.arc(800 + Math.cos(angle) * radius, 424 + Math.sin(angle) * radius, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function draw() {
    var now = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (state.screen === "playing") {
      drawThemeCard(now);
    } else if (state.screen === "winner") {
      drawWinner(now);
    } else {
      drawIdle(now);
    }

    state.raf = requestAnimationFrame(draw);
  }

  syncPlayerGridLayout();
  window.addEventListener("resize", syncPlayerGridLayout);
  showDifficultySetup();
  draw();
})();
