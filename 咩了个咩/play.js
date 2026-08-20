/**
 * 小羊快跑游戏 - 主游戏逻辑
 * 一个基于HTML5 Canvas的跑酷游戏，玩家需要听单词并移动小羊到正确的跑道
 */

// 获取Canvas元素和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 获取 UI 元素
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const resultPanel = document.getElementById('resultPanel');
const resultScore = document.getElementById('resultScore');
const reportPanel = document.getElementById('reportPanel');
const reportContent = document.getElementById('reportContent');
const reportNarrationStatus = document.getElementById('reportNarrationStatus');
const continueChallengeBtn = document.getElementById('continueChallengeBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const topHud = document.getElementById('topHud');
const reportShortcutBtn = document.getElementById('reportShortcutBtn');
const levelInfo = document.getElementById('levelInfo');
const scoreInfo = document.getElementById('scoreInfo');
const livesInfoBar = document.getElementById('livesInfoBar');
const hudHearts = Array.from(document.querySelectorAll('.hud-heart'));

// 游戏数据统计（正式部署时将 apiUrl 替换为运维提供的 HTTPS 地址）
const gameTracker = new GameTracker({
    gameId: 'runner-game',
    gameVersion: '1.0.0',
    apiUrl: 'http://127.0.0.1:8000/api/v1/events',
    getUserId: function () {
        return null;
    }
});

// 加载界面元素
const loadingScreen = document.getElementById('loadingScreen');
const loadingProgress = document.getElementById('loadingProgress');
const loadingPercent = document.getElementById('loadingPercent');

// 年级选择界面元素
const gradeSelector = document.getElementById('gradeSelector');
const gradeGrid = document.getElementById('gradeGrid');
const gradeTitle = document.getElementById('gradeTitle');

// 设计尺寸常量
const DESIGN_WIDTH = 1600;
const DESIGN_HEIGHT = 900;
const NUM_LANES = 3; // 跑道数量

// 缩放和偏移量
let SCALE = 1;
let OFFSET_X = 0;
let OFFSET_Y = 0;

// 画布实际尺寸
let canvasWidth = DESIGN_WIDTH;
let canvasHeight = DESIGN_HEIGHT;

// 游戏状态变量
let gameState = 'start'; // 游戏状态: start, playing, running_out, ended
let score = 0; // 本局累计得分（跨关卡保留）
let timeLeft = 60; // 剩余时间（秒）
let lives = 5; // 生命值
let level = 0; // 当前关卡（0-27）
let maxLevels = 28; // 总关卡数
let questionsAnswered = 0; // 当前关卡已回答问题数
let gameSpeed = 0.8; // 游戏速度
let baseGameSpeed = 0.8; // 用户设置的基础速度（用于在结算界面显示）
let usedCorrectWords = []; // 已使用的正确答案单词
const maxQuestionsPerLevel = 5; // 每关最大问题数

// 成绩跟踪变量
let levelResults = []; // 每关的成绩记录 {level: 0, correct: ['are'], incorrect: ['arm', 'bag']}
let totalCorrectCount = 0; // 总共答对的单词数
let totalAttemptedCount = 0; // 总共参与过的单词数

/**
 * 获取跑道高度
 * @returns {number} 跑道高度
 */
function getLaneHeight() {
    return canvasHeight * 0.244;
}

/**
 * 获取跑道顶部位置
 * @returns {number} 跑道顶部Y坐标
 */
function getLaneTop() {
    return canvasHeight * 0.266;
}

// 小羊对象
let sheep = {
    x: 200 * SCALE, // X 位置
    width: 180 * SCALE, // 宽度（增加 20%）
    height: 216 * SCALE, // 高度（增加 20%）
    lane: 1, // 当前跑道（0-2）
    frame: 0, // 当前帧
    frameCount: 2, // 总帧数
    frameTimer: 0, // 帧计时器
    speed: 8, // 移动速度
    isMoving: false, // 是否正在移动
    moveProgress: 0, // 移动进度（0-1）
    targetLane: 1 // 目标跑道
};

// 小羊形象升级：每连续答对 6 个，按顺序升级一个形象。
const APPEARANCE_UPGRADE_STREAK = 6;
const MAX_APPEARANCE_LEVEL = 6;
// sheep2（火箭）、sheep4（披风）和 sheep7（飞机）对应的形象等级。
const FLYING_APPEARANCE_LEVELS = new Set([1, 3, 6]);
let consecutiveCorrect = 0;
let appearanceLevel = 0;
let appearanceFloatPhase = 0;

/**
 * 记录一次正确答案，并在达到连续答对门槛时升级形象。
 */
function recordCorrectAnswerForAppearance() {
    consecutiveCorrect++;

    if (appearanceLevel >= MAX_APPEARANCE_LEVEL) {
        consecutiveCorrect = Math.min(consecutiveCorrect, APPEARANCE_UPGRADE_STREAK);
        return;
    }

    if (consecutiveCorrect >= APPEARANCE_UPGRADE_STREAK) {
        appearanceLevel++;
        consecutiveCorrect = 0;
    }
}

/**
 * 答错或撞到石头时中断连对，并将当前形象降低一级。
 */
function downgradeAppearance() {
    consecutiveCorrect = 0;
    if (appearanceLevel > 0) {
        appearanceLevel--;
    }
}

// 游戏对象数组
let obstacles = []; // 障碍物数组
let words = []; // 单词数组
let clouds = []; // 云朵数组
let grasses = []; // 小草数组
let particles = []; // 粒子数组
let roadOffset = 0; // 跑道线条偏移量

// 障碍物生成控制
const SPAWN_INTERVAL_MS = 1500;
const MIN_WORD_SPAWN_INTERVAL_MS = 6000;
const WORD_SPAWN_COOLDOWN_TICKS = Math.ceil(MIN_WORD_SPAWN_INTERVAL_MS / SPAWN_INTERVAL_MS);
let lastSpawnType = null; // 最后生成的障碍物类型 ('word' 或 'obstacle')
let lastWordX = 0; // 记录最后一个单词的x位置
let wordSpawnCooldownTicks = 0;

// 音频相关变量
let currentAudio = null; // 当前播放的音频
let audioInitialized = false; // 音频是否已初始化
let backgroundMusic = null; // 背景音乐
let reportNarrationAudio = null; // 当前报告播报音频
let reportNarrationRunId = 0; // 用于取消过期的连续播报
let reportNarrationWords = []; // 本次报告需要播报的未掌握单词（最多 3 个）

// 图片资源
let sheepImg = new Image(); // 小羊图片1
let sheep1Img = new Image(); // 小羊图片2（用于奔跑动画）
let sheepAppearanceImages = []; // 依次对应 sheep2.png 到 sheep7.png
let caoImg = new Image(); // 小草图片
let heartImg = new Image(); // 爱心图片

// 单词列表在 words.js 中定义

/**
 * 打乱数组顺序
 * @param {Array} array - 要打乱的数组
 * @returns {Array} 打乱后的数组
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * 创建单词分组（8个关卡）
 * @returns {Array} 包含8个单词组的数组
 */
function createWordGroups() {
    const shuffled = shuffleArray(allWords);
    const groups = [];
    const wordsPerGroup = Math.ceil(allWords.length / maxLevels);
    for (let i = 0; i < maxLevels; i++) {
        const start = i * wordsPerGroup;
        const end = Math.min(start + wordsPerGroup, allWords.length);
        groups.push(shuffled.slice(start, end));
    }
    return groups;
}

// 创建单词分组
let wordGroups = createWordGroups();

/**
 * 获取当前关卡的单词列表
 * @returns {Array} 当前关卡的单词列表
 */
function getWordList() {
    return wordGroups[level];
}

// 动画和定时器ID
let animationId;
let timerInterval;
let obstacleSpawnInterval;
let nextLevelTimeout;
let reportReturnState = null;

/**
 * 初始化游戏
 */
function init() {
    // 初始化资源加载
    let loadedCount = 0;
    const totalResources = 11; // 8 张小羊图片、草、爱心和背景音乐
    
    const updateLoading = () => {
        loadedCount++;
        const percent = Math.round((loadedCount / totalResources) * 100);
        loadingProgress.style.width = percent + '%';
        loadingPercent.textContent = percent + '%';
        
        // 所有资源加载完成
        if (loadedCount >= totalResources) {
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                // 初始化画布尺寸
                handleResize();
                // 显示年级选择界面
                showGradeSelector();
                // 绘制背景
                drawStartScreen();
            }, 500);
        }
    };
    
    // 加载图片资源
    sheepImg = new Image();
    sheepImg.onload = updateLoading;
    sheepImg.onerror = updateLoading;
    sheepImg.src = 'assets/image/sheep.png';
    
    sheep1Img = new Image();
    sheep1Img.onload = updateLoading;
    sheep1Img.onerror = updateLoading;
    sheep1Img.src = 'assets/image/sheep1.png';
    
    sheepAppearanceImages = [];
    for (let imageNumber = 2; imageNumber <= 7; imageNumber++) {
        const appearanceImg = new Image();
        appearanceImg.onload = updateLoading;
        appearanceImg.onerror = updateLoading;
        appearanceImg.src = `assets/image/sheep${imageNumber}.png`;
        sheepAppearanceImages.push(appearanceImg);
    }
    
    caoImg = new Image();
    caoImg.onload = updateLoading;
    caoImg.onerror = updateLoading;
    caoImg.src = 'assets/image/cao.png';
    
    heartImg = new Image();
    heartImg.onload = updateLoading;
    heartImg.onerror = updateLoading;
    heartImg.src = 'assets/image/aixin.png';
    
    // 初始化背景音乐（作为最后一个加载项）
    initBackgroundMusic(() => {
        updateLoading();
        // audioInitialized 在用户第一次交互后设置（handleStart中）
    });
    
    // 初始化云朵
    initClouds();
    
    // 初始化年级选择界面
    initGradeSelector();
    
    // 添加事件监听
    startBtn.addEventListener('click', handleStart);
    startBtn.addEventListener('touchstart', handleStart);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    reportShortcutBtn.addEventListener('click', handleReportShortcut);
    continueChallengeBtn.addEventListener('click', continueChallenge);
    playAgainBtn.addEventListener('click', restartFromGradeSelection);
    
    // 速度控制按钮监听
    const speedDecreaseBtn = document.querySelector('.speed-decrease');
    const speedIncreaseBtn = document.querySelector('.speed-increase');
    const speedValue = document.querySelector('.speed-value');
    
    speedDecreaseBtn.addEventListener('click', () => {
        if (gameSpeed > 0.5) {
            gameSpeed = Math.round(gameSpeed * 10 - 1) / 10;
            baseGameSpeed = gameSpeed; // 保存基础速度
            speedValue.textContent = gameSpeed.toFixed(1);
        }
    });
    
    speedIncreaseBtn.addEventListener('click', () => {
        if (gameSpeed < 1.1) {
            gameSpeed = Math.round(gameSpeed * 10 + 1) / 10;
            baseGameSpeed = gameSpeed; // 保存基础速度
            speedValue.textContent = gameSpeed.toFixed(1);
        }
    });
    
    // 退出按钮点击事件
}

/**
 * 从游戏 HUD 直接打开当前成绩报告。
 */
function handleReportShortcut(e) {
    e.preventDefault();
    if (gameState !== 'playing' && gameState !== 'running_out') return;
    showReport('manual');
}

/**
 * 处理窗口大小变化
 */
function handleResize() {
    const container = document.getElementById('gameContainer');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    canvasWidth = containerWidth;
    canvasHeight = containerHeight;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    canvas.style.left = '0px';
    canvas.style.top = '0px';
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    
    SCALE = canvasWidth / DESIGN_WIDTH;

    // 报告沿用原画比例等比缩放，避免窄屏下内容和三个操作按钮被裁切。
    const reportScale = Math.min(1, (containerWidth - 16) / 650, (containerHeight - 80) / 478);
    document.documentElement.style.setProperty('--report-panel-scale', Math.max(0.45, reportScale).toFixed(3));
}

/**
 * 初始化云朵
 */
function initClouds() {
    for (let i = 0; i < 6; i++) {
        clouds.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * 150 * SCALE + 30 * SCALE,
            size: (Math.random() * 60 + 50) * SCALE,
            speed: Math.random() * 0.4 + 0.15
        });
    }
}

/**
 * 初始化背景音乐
 */
function initBackgroundMusic(onLoaded) {
    try {
        backgroundMusic = new Audio('assets/audio/background.mp3');
        backgroundMusic.loop = true; // 循环播放
        backgroundMusic.volume = 0.1; // 设置音量为10%
        
        // 加载完成后调用回调
        backgroundMusic.addEventListener('loadeddata', () => {
            if (onLoaded) onLoaded();
        });
        
        // 如果加载失败也调用回调
        backgroundMusic.addEventListener('error', () => {
            if (onLoaded) onLoaded();
        });
        
        // 尝试自动播放（浏览器可能会阻止）
        backgroundMusic.play().catch(() => {
            console.log('Autoplay prevented, will play on user interaction');
        });
    } catch (e) {
        console.log('Failed to initialize background music:', e);
        if (onLoaded) onLoaded();
    }
}

/**
 * 处理开始游戏事件
 * @param {Event} e - 事件对象
 */
function handleStart(e) {
    e.preventDefault();
    if (gameState !== 'start') return;
    
    // 确保已选择年级
    if (!selectedGrade || !gradeWords[selectedGrade]) {
        console.log('请先选择年级');
        showGradeSelector();
        return;
    }
    
    audioInitialized = true;
    level = 0;
    score = 0; // 仅在开始一局新游戏时重置得分
    consecutiveCorrect = 0;
    appearanceLevel = 0;
    appearanceFloatPhase = 0;
    wordGroups = createWordGroups();
    lives = 5; // 设置总生命值为5
    gameTracker.start();
    
    // 确保背景音乐正在播放
    if (backgroundMusic) {
        backgroundMusic.play().then(() => {
            console.log('Background music playing');
        }).catch((e) => {
            console.log('Background music play failed:', e);
        });
    }
    
    // 隐藏开始界面元素
    overlay.classList.add('hidden');
    startBtn.classList.add('hidden');
    
    // 隐藏速度控制按钮
    const speedControl = document.getElementById('speedControl');
    if (speedControl) {
        speedControl.classList.add('hidden');
    }
    
    // 开始第一关
    startLevel();
}

/**
 * 更新计时器
 */
function updateTimer() {
    timeLeft--;
    // 随着回答问题数量增加，游戏速度逐渐提升（但不超过最大速度限制）
    const maxSpeed = 1.1; // 最大速度
    const dynamicSpeed = baseGameSpeed + (questionsAnswered / maxQuestionsPerLevel) * 0.3;
    gameSpeed = Math.min(dynamicSpeed, maxSpeed);
    
    if (timeLeft <= 0) {
        gameOver('time');
    }
}

/**
 * 生成障碍物
 */
function spawnObstacles() {
    if (gameState !== 'playing') return;
    
    const rand = Math.random();
    if (wordSpawnCooldownTicks > 0) {
        wordSpawnCooldownTicks--;
    }
    const canSpawnWord = wordSpawnCooldownTicks === 0;
    
    // 如果最后生成的是单词，则必须先生成其他障碍物
    if (lastSpawnType === 'word') {
        // 只生成草丛或石头障碍物
        if (rand < 0.7) {
            spawnGrassObstacle();
        } else {
            spawnRockObstacle();
        }
        lastSpawnType = 'obstacle';
    } else {
        // 可以生成单词或其他障碍物
        if (rand < 0.5 && canSpawnWord) {
            if (spawnWordQuestion()) {
                lastSpawnType = 'word';
            }
        } else if (rand < 0.9) {
            spawnRockObstacle();
            lastSpawnType = 'obstacle';
        }
    }
}

/**
 * 生成草丛障碍物
 */
function spawnGrassObstacle() {
    const lane = Math.floor(Math.random() * NUM_LANES);
    const laneHeight = getLaneHeight();
    const laneTop = getLaneTop();
    obstacles.push({
        x: canvasWidth + 50 * SCALE,
        y: laneTop + lane * laneHeight + 20 * SCALE + Math.random() * 20 * SCALE,
        width: 70 * SCALE,
        height: 60 * SCALE,
        lane: lane,
        type: 'grass',
        passed: false
    });
}

/**
 * 生成石头障碍物
 */
function spawnRockObstacle() {
    const lane = Math.floor(Math.random() * NUM_LANES);
    const laneHeight = getLaneHeight();
    const laneTop = getLaneTop();
    obstacles.push({
        x: canvasWidth + 50 * SCALE,
        y: laneTop + lane * laneHeight + laneHeight / 2 - 40 * SCALE,
        width: 80 * SCALE,
        height: 80 * SCALE,
        lane: lane,
        type: 'rock',
        passed: false
    });
}

/**
 * 生成单词问题
 */
function spawnWordQuestion() {
    // 如果已经达到最大答题数，不再生成新单词
    if (questionsAnswered >= maxQuestionsPerLevel) {
        return false;
    }
    
    const currentWordList = getWordList();
    
    // 过滤出未使用过的正确答案单词
    let availableCorrectWords = currentWordList.filter(word => !usedCorrectWords.includes(word));
    
    // 如果当前关卡没有可用的正确单词，从其他关卡的单词中选择
    if (availableCorrectWords.length === 0) {
        // 从所有未使用过的单词中选择
        availableCorrectWords = allWords.filter(word => !usedCorrectWords.includes(word));
    }
    
    // 如果所有单词都已使用过，重置使用记录（新游戏循环）
    if (availableCorrectWords.length === 0) {
        usedCorrectWords = [];
        availableCorrectWords = [...currentWordList];
    }
    
    // 随机选择一个正确答案
    const shuffledCorrect = [...availableCorrectWords].sort(() => Math.random() - 0.5);
    const correctWord = shuffledCorrect[0];
    usedCorrectWords.push(correctWord);
    
    // 选择3个单词（包含正确答案）
    // 错误单词从所有单词中选择（除了当前关卡的正确单词）
    // 使用过的正确单词可以继续当错误单词使用
    const wrongWordPool = allWords.filter(word => !currentWordList.includes(word));
    const shuffledWrong = [...wrongWordPool].sort(() => Math.random() - 0.5);
    
    let selectedWords = [correctWord];
    
    // 从错误单词池中选择错误单词
    for (let i = 0; i < shuffledWrong.length && selectedWords.length < NUM_LANES; i++) {
        if (!selectedWords.includes(shuffledWrong[i])) {
            selectedWords.push(shuffledWrong[i]);
        }
    }
    
    // 如果错误单词池不够，从当前关卡已使用的单词中补充（作为错误单词）
    if (selectedWords.length < NUM_LANES) {
        const usedPool = usedCorrectWords.filter(word => word !== correctWord);
        const shuffledUsed = [...usedPool].sort(() => Math.random() - 0.5);
        for (let i = 0; i < shuffledUsed.length && selectedWords.length < NUM_LANES; i++) {
            if (!selectedWords.includes(shuffledUsed[i])) {
                selectedWords.push(shuffledUsed[i]);
            }
        }
    }
    
    // 打乱单词顺序
    selectedWords = selectedWords.sort(() => Math.random() - 0.5);
    const correctIndex = selectedWords.indexOf(correctWord);
    
    // 创建单词对象
    const wordObj = {
        x: canvasWidth + 50 * SCALE,
        words: selectedWords,
        correctIndex: correctIndex,
        correctWord: correctWord,
        passed: false,
        answered: false
    };
    
    words.push(wordObj);
    lastWordX = wordObj.x; // 记录单词位置
    wordSpawnCooldownTicks = WORD_SPAWN_COOLDOWN_TICKS;
    
    // 播放正确答案的音频
    // 如果当前画面上只有这一组单词，立即播放
    // 如果有多个单词，等待前一组单词消失后再播放
    if (words.length <= 1) {
        playWordAudio(correctWord);
    } else {
        // 标记需要延迟播放的单词
        wordObj.pendingAudio = correctWord;
    }
    return true;
}

/**
 * 播放单词音频
 * @param {string} word - 要播放的单词
 */
function playWordAudio(word) {
    if (!audioInitialized) {
        console.log('Audio not initialized yet');
        return;
    }
    
    try {
        // 停止当前播放的音频
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        
        let playCount = 0;
        const playAudio = () => {
            const audioPath = getAudioPath();
            const audio = new Audio(`${audioPath}/${word}.mp3`);
            currentAudio = audio;
            audio.volume = 1.0; // 设置音量为100%
            
            // 监听音频播放完成事件，播放第二次
            audio.addEventListener('ended', () => {
                playCount++;
                if (playCount < 2) {
                    playAudio();
                } else if (currentAudio === audio) {
                    currentAudio = null;
                }
            });
            
            // 监听音频错误
            audio.addEventListener('error', (e) => {
                console.log('Audio error:', word, e);
                if (currentAudio === audio) currentAudio = null;
            });
            
            audio.load();
            
            // 立即尝试播放
            audio.play().then(() => {
                console.log('Audio playing:', word);
            }).catch((e) => {
                console.log('Audio play failed:', word, e);
                if (currentAudio === audio) currentAudio = null;
            });
        };
        
        playAudio();
    } catch (e) {
        console.log('Audio play error:', e);
    }
}

/**
 * 停止报告播报并让正在等待的连续播报失效。
 */
function stopReportNarration() {
    reportNarrationRunId++;

    if (reportNarrationAudio) {
        reportNarrationAudio.pause();
        reportNarrationAudio.removeAttribute('src');
        reportNarrationAudio.load();
        reportNarrationAudio = null;
    }
}

/**
 * 播放报告中的一段音频。
 * @returns {Promise<'ended'|'error'|'blocked'|'cancelled'>}
 */
function playReportAudioSegment(src, runId) {
    return new Promise((resolve) => {
        if (runId !== reportNarrationRunId || gameState !== 'report') {
            resolve('cancelled');
            return;
        }

        const audio = new Audio(src);
        let settled = false;
        reportNarrationAudio = audio;
        audio.volume = 1.0;

        const finish = (result) => {
            if (settled) return;
            settled = true;
            if (reportNarrationAudio === audio) reportNarrationAudio = null;
            resolve(result);
        };

        audio.addEventListener('ended', () => finish('ended'), { once: true });
        audio.addEventListener('error', () => {
            console.warn('报告播报音频加载失败:', src);
            finish('error');
        }, { once: true });

        audio.play().catch((error) => {
            console.warn('报告播报未能自动开始:', src, error);
            finish(error && error.name === 'NotAllowedError' ? 'blocked' : 'error');
        });
    });
}

/**
 * 根据未掌握单词生成报告播报清单，单词最多取前 3 个。
 */
function createReportNarrationSequence(incorrectWords, audioPath) {
    const wordsToNarrate = incorrectWords.slice(0, 3);
    if (wordsToNarrate.length === 0) return ['assets/report/2.mp3'];

    return [
        'assets/report/1_1.mp3',
        ...wordsToNarrate.map(word => `${audioPath}/${word}.mp3`),
        'assets/report/1_2.mp3'
    ];
}

/**
 * 按 report.txt 约定的顺序播报学习报告。
 */
async function playReportNarration() {
    if (gameState !== 'report') return;

    stopReportNarration();
    const runId = reportNarrationRunId;
    reportNarrationStatus.textContent = '正在播报学习报告';

    const audioPath = getAudioPath();
    const sequence = createReportNarrationSequence(reportNarrationWords, audioPath);

    for (const src of sequence) {
        const result = await playReportAudioSegment(src, runId);
        if (result === 'cancelled' || runId !== reportNarrationRunId) return;
        if (result === 'blocked') {
            reportNarrationStatus.textContent = '浏览器阻止了报告自动播报';
            return;
        }
    }

    if (runId !== reportNarrationRunId) return;
    reportNarrationStatus.textContent = '学习报告播报完成';
}

/**
 * 游戏主循环
 */
function gameLoop() {
    if (gameState !== 'playing' && gameState !== 'running_out') return;
    
    update();
    render();
    
    // update 过程中可能进入结算或报告状态，终态下不再启动下一帧
    if (gameState === 'playing' || gameState === 'running_out') {
        animationId = requestAnimationFrame(gameLoop);
    }
}

/**
 * 更新游戏状态
 */
function update() {
    // 更新小羊帧动画
    sheep.frameTimer++;
    if (sheep.frameTimer >= 8) {
        sheep.frame = (sheep.frame + 1) % sheep.frameCount;
        sheep.frameTimer = 0;
    }

    // 飞行形象持续进行缓慢的上下漂浮；切换到地面形象后从平稳位置重新开始。
    if (FLYING_APPEARANCE_LEVELS.has(appearanceLevel)) {
        appearanceFloatPhase = (appearanceFloatPhase + 0.055) % (Math.PI * 2);
    } else {
        appearanceFloatPhase = 0;
    }
    
    // 关卡完成时，小羊跑向画面右边缘
    if (gameState === 'running_out') {
        sheep.x += sheep.speed * 2 * SCALE;
        
        // 当小羊完全移出画面时，显示结算界面
        if (sheep.x > canvasWidth + sheep.width) {
            levelCompleteFinal();
        }
        return; // 其他元素停止更新
    }
    
    // 更新跑道线条偏移量
    roadOffset += sheep.speed * gameSpeed * SCALE;
    const dashPatternLength = 130 * SCALE;
    roadOffset %= dashPatternLength;
    
    // 更新小羊移动
    if (sheep.isMoving) {
        sheep.moveProgress += 0.15;
        const laneHeight = getLaneHeight();
        const laneTop = getLaneTop();
        if (sheep.moveProgress >= 1) {
            sheep.moveProgress = 0;
            sheep.isMoving = false;
            sheep.lane = sheep.targetLane;
            sheep.y = laneTop + sheep.lane * laneHeight + laneHeight / 2 - sheep.height / 2;
        } else {
            const startY = laneTop + sheep.lane * laneHeight + laneHeight / 2 - sheep.height / 2;
            const endY = laneTop + sheep.targetLane * laneHeight + laneHeight / 2 - sheep.height / 2;
            sheep.y = startY + (endY - startY) * easeOutQuad(sheep.moveProgress);
        }
    }
    
    // 更新游戏对象
    updateClouds();
    updateObstacles();
    updateWords();
    updateGrasses();
    spawnGrass();
    updateParticles();
    checkCollisions();
}

/**
 * 缓动函数 - easeOutQuad
 * @param {number} t - 时间参数（0-1）
 * @returns {number} 缓动后的值
 */
function easeOutQuad(t) {
    return t * (2 - t);
}

/**
 * 更新云朵位置
 */
function updateClouds() {
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x < -cloud.size) {
            cloud.x = canvasWidth + cloud.size;
            cloud.y = Math.random() * 150 + 30;
        }
    });
}

/**
 * 更新障碍物位置
 */
function updateObstacles() {
    obstacles = obstacles.filter(obs => {
        obs.x -= sheep.speed * gameSpeed;
        return obs.x > -100;
    });
}

/**
 * 更新单词位置
 */
function updateWords() {
    // 记录移除前的单词数量
    const prevCount = words.length;
    
    words = words.filter(w => {
        w.x -= sheep.speed * gameSpeed;
        return w.x > -150;
    });
    
    // 如果有单词被移除，检查是否需要播放延迟的音频
    if (words.length < prevCount && words.length > 0) {
        // 检查剩下的单词中是否有需要延迟播放的音频
        const nextWord = words.find(w => w.pendingAudio);
        if (nextWord) {
            playWordAudio(nextWord.pendingAudio);
            nextWord.pendingAudio = null; // 清除标记
        }
    }
}

/**
 * 生成小草（装饰用）
 */
function spawnGrass() {
    if (gameState !== 'playing') return;
    
    // 最多保持5棵小草
    if (grasses.length >= 5) return;
    
    // 10%的概率生成小草
    const rand = Math.random();
    if (rand > 0.1) return;
    
    const lane = Math.floor(Math.random() * NUM_LANES);
    const laneHeight = getLaneHeight();
    const laneTop = getLaneTop();
    
    // 检查同一跑道上的小草间距
    const laneGrasses = grasses.filter(g => g.lane === lane);
    const minDistance = 200 * SCALE;
    const newX = canvasWidth + Math.random() * 100 * SCALE;
    
    // 确保新生成的小草与已有小草保持足够距离
    const tooClose = laneGrasses.some(g => {
        return Math.abs(newX - g.x) < minDistance;
    });
    
    if (!tooClose) {
        grasses.push({
            x: newX,
            y: laneTop + lane * laneHeight + 20 * SCALE + Math.random() * 20 * SCALE,
            lane: lane
        });
    }
}

/**
 * 更新小草位置
 */
function updateGrasses() {
    grasses = grasses.filter(g => {
        g.x -= sheep.speed * gameSpeed;
        return g.x > -100 * SCALE;
    });
}

/**
 * 更新粒子效果
 */
function updateParticles() {
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.alpha = p.life / p.maxLife;
        return p.life > 0;
    });
}

/**
 * 碰撞检测
 */
function checkCollisions() {
    if (gameState !== 'playing') return;

    // 小羊碰撞盒（稍微缩小以避免误判）
    const sheepHitbox = {
        x: sheep.x + 10,
        y: sheep.y + 10,
        width: sheep.width - 20,
        height: sheep.height - 20
    };
    
    // 检测障碍物碰撞（小羊正在移动时不检测，避免频繁换跑道时误触发）
    if (!sheep.isMoving) {
        for (const obs of obstacles) {
            // 只有石头障碍物才会造成伤害，草丛障碍物是无害的
            if (!obs.passed && obs.lane === sheep.lane && obs.type === 'rock') {
                const obsHitbox = {
                    x: obs.x,
                    y: obs.y,
                    width: obs.width,
                    height: obs.height
                };
                if (checkRectCollision(sheepHitbox, obsHitbox)) {
                    obs.passed = true;
                    loseLife();
                    if (gameState !== 'playing') return;
                }
            }
        }
    }
    
    // 检测单词碰撞（回答问题）
    for (const w of words) {
        if (!w.passed && !w.answered) {
            const laneHeight = getLaneHeight();
            const laneTop = getLaneTop();
            const wordArea = {
                x: w.x,
                y: laneTop,
                width: 120,
                height: laneHeight * NUM_LANES
            };
            
            // 检测小羊是否到达单词区域
            if (sheep.x + sheep.width > w.x && sheep.x < w.x + 120) {
                if (!w.answered) {
                    w.answered = true;
                    w.passed = true;
                    
                    questionsAnswered++;
                    totalAttemptedCount++;
                    
                    // 判断答案是否正确
                    if (sheep.lane === w.correctIndex) {
                        score++;
                        totalCorrectCount++;
                        // 播放正确答案音效
                        playSound('sheepright');
                        createParticles(sheep.x + sheep.width / 2, sheep.y + sheep.height / 2, '#00ff00');
                        // 记录正确答案（正确单词）- 避免重复
                        if (!levelResults[level].correct.includes(w.correctWord)) {
                            levelResults[level].correct.push(w.correctWord);
                        }
                        
                        recordCorrectAnswerForAppearance();
                    } else {
                        // 先记录错误答案（未掌握的单词 - 正确答案就是未掌握的）- 避免重复
                        if (!levelResults[level].incorrect.includes(w.correctWord)) {
                            levelResults[level].incorrect.push(w.correctWord);
                        }
                        // 播放错误答案音效
                        playSound('sheepwrong');
                        loseLifeWithoutSound();
                        createParticles(sheep.x + sheep.width / 2, sheep.y + sheep.height / 2, '#ff0000');

                        // 生命耗尽后已经进入报告页，不能再触发关卡完成逻辑
                        if (gameState !== 'playing') return;
                        
                        downgradeAppearance();
                    }
                    
                    // 检查是否完成当前关卡
                    if (questionsAnswered >= maxQuestionsPerLevel) {
                        levelComplete();
                        return;
                    }
                }
            }
        }
    }
}

/**
 * 矩形碰撞检测
 * @param {Object} rect1 - 第一个矩形
 * @param {Object} rect2 - 第二个矩形
 * @returns {boolean} 是否碰撞
 */
function checkRectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * 处理键盘事件
 * @param {KeyboardEvent} e - 键盘事件
 */
function handleKeyDown(e) {
    if (gameState !== 'playing') return;
    
    // 上移：ArrowUp 或 W/w
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (sheep.lane > 0 && !sheep.isMoving) {
            sheep.targetLane = sheep.lane - 1;
            sheep.isMoving = true;
            sheep.moveProgress = 0;
        }
    } 
    // 下移：ArrowDown 或 S/s
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        if (sheep.lane < NUM_LANES - 1 && !sheep.isMoving) {
            sheep.targetLane = sheep.lane + 1;
            sheep.isMoving = true;
            sheep.moveProgress = 0;
        }
    }
}

/**
 * 处理点击事件
 * @param {MouseEvent} e - 鼠标事件
 */
function handleClick(e) {
    if (gameState !== 'playing') return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvasHeight / rect.height;
    const y = (e.clientY - rect.top) * scaleY;
    
    handleTouchLaneChange(y);
}

/**
 * 处理触摸事件
 * @param {TouchEvent} e - 触摸事件
 */
function handleTouch(e) {
    if (gameState !== 'playing') return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvasHeight / rect.height;
    const y = (touch.clientY - rect.top) * scaleY;
    
    handleTouchLaneChange(y);
}

/**
 * 根据触摸位置改变跑道
 * @param {number} y - 触摸的Y坐标
 */
function handleTouchLaneChange(y) {
    if (sheep.isMoving) return;
    
    const laneHeight = getLaneHeight();
    const laneTop = getLaneTop();
    
    for (let i = 0; i < NUM_LANES; i++) {
        const currentLaneTop = laneTop + i * laneHeight;
        const laneBottom = currentLaneTop + laneHeight;
        if (y >= currentLaneTop && y <= laneBottom) {
            if (i !== sheep.lane) {
                sheep.targetLane = i;
                sheep.isMoving = true;
                sheep.moveProgress = 0;
            }
            break;
        }
    }
}

/**
 * 处理点击（空函数，保留兼容性）
 */
function processClick(x, y) {}

/**
 * 失去生命值（撞到障碍物）
 */
function loseLife() {
    lives--;
    downgradeAppearance();
    // 播放撞击障碍物音效
    playSound('sheepstone');
    // 创建红色粒子效果
    createParticles(sheep.x + sheep.width / 2, sheep.y + sheep.height / 2, '#ff6b6b');
    
    // 如果生命值为0，游戏结束
    if (lives <= 0) {
        gameOver('lose');
    }
}

/**
 * 失去生命值（不播放音效，用于选择错误单词时）
 */
function loseLifeWithoutSound() {
    lives--;
    // 创建红色粒子效果
    createParticles(sheep.x + sheep.width / 2, sheep.y + sheep.height / 2, '#ff6b6b');
    
    // 如果生命值为0，游戏结束
    if (lives <= 0) {
        gameOver('lose');
    }
}

/**
 * 创建粒子效果
 * @param {number} x - 粒子生成位置X
 * @param {number} y - 粒子生成位置Y
 * @param {string} color - 粒子颜色
 */
function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8 * SCALE,
            vy: (Math.random() - 0.5) * 8 * SCALE,
            color: color,
            size: (Math.random() * 8 + 4) * SCALE,
            life: 30,
            maxLife: 30,
            alpha: 1
        });
    }
}

/**
 * 播放音效
 * @param {string} soundName - 音效文件名（不含扩展名）
 */
function playSound(soundName) {
    if (!audioInitialized) {
        console.log('playSound: Audio not initialized');
        return;
    }
    
    try {
        // 音效文件（sheepright, sheepwrong, sheepstone）始终从 assets/audio 加载
        const audioPath = (soundName === 'sheepright' || soundName === 'sheepwrong' || soundName === 'sheepstone') 
            ? 'assets/audio' 
            : getAudioPath();
        const audio = new Audio(`${audioPath}/${soundName}.mp3`);
        audio.volume = 0.7;
        audio.play().then(() => {
            console.log('playSound:', soundName);
        }).catch((e) => {
            console.log('playSound failed:', soundName, e);
        });
    } catch (e) {
        console.log('Sound play error:', e);
    }
}

/**
 * 游戏结束
 * @param {string} type - 结束类型: 'win', 'time', 'lose'
 */
function gameOver(type) {
    if (gameState !== 'playing') return;

    gameState = 'ended';
    topHud.classList.add('hidden');
    
    // 停止游戏循环和定时器
    cancelAnimationFrame(animationId);
    clearInterval(timerInterval);
    clearInterval(obstacleSpawnInterval);
    
    // 停止当前音频
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    // 检查是否需要显示成绩报告（5 次机会用完或全部关卡通过）
    const shouldShowReport = (lives <= 0) || (level >= maxLevels - 1);
    
    if (shouldShowReport) {
        // 显示成绩报告
        showReport('natural');
    } else {
        // 显示普通结算界面
        overlay.classList.remove('hidden');
        resultPanel.classList.remove('hidden');
        
        // 显示速度控制按钮
        const speedControl = document.getElementById('speedControl');
        if (speedControl) {
            speedControl.classList.remove('hidden');
        }
        
        // 设置结算信息
        resultScore.textContent = `得分：${score}`;
        scheduleNextLevel();
    }
}

/**
 * 显示成绩报告（游戏完全结束时）
 */
function showReport(mode = 'natural') {
    if (gameState === 'report') return;

    const isManualReport = mode === 'manual';
    if (isManualReport) {
        if (gameState !== 'playing' && gameState !== 'running_out') return;
        reportReturnState = gameState;
    } else {
        reportReturnState = null;
        gameTracker.finish(score);
    }

    gameState = 'report';
    topHud.classList.add('hidden');
    clearTimeout(nextLevelTimeout);
    nextLevelTimeout = undefined;
    
    // 停止游戏循环和定时器
    cancelAnimationFrame(animationId);
    animationId = undefined;
    clearInterval(timerInterval);
    timerInterval = undefined;
    clearInterval(obstacleSpawnInterval);
    obstacleSpawnInterval = undefined;
    
    // 停止当前音频
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    stopReportNarration();

    // 报告界面继续播放低音量背景音乐，语音播报与其并行播放。
    if (backgroundMusic) {
        backgroundMusic.play().catch((error) => {
            console.log('报告界面背景音乐播放失败:', error);
        });
    }
    
    // 隐藏速度控制按钮（成绩报告界面不需要）
    const speedControl = document.getElementById('speedControl');
    if (speedControl) {
        speedControl.classList.add('hidden');
    }

    // 报告页是游戏终态，确保关间结算层不会同时显示
    resultPanel.classList.add('hidden');
    
    // 生成成绩报告内容
    let html = '<div class="report-section">';
    
    // 汇总所有关卡的成绩
    let allIncorrect = [];
    let allCorrect = [];
    
    for (let i = 0; i < levelResults.length; i++) {
        const result = levelResults[i];
        if (result) {
            allIncorrect = allIncorrect.concat(result.incorrect);
            allCorrect = allCorrect.concat(result.correct);
        }
    }

    // 按出现顺序播报未掌握单词，数量较多时只取前 3 个。
    reportNarrationWords = allIncorrect.slice(0, 3);
    
    // 显示未掌握单词（标签固定在左侧）
    if (allIncorrect.length > 0) {
        html += `<div class="report-item incorrect">`;
        html += `<span class="label">未掌握单词:</span>`;
        html += `<span class="words">${allIncorrect.join('、')}</span>`;
        html += `</div>`;
    }
    
    // 显示已掌握单词（标签固定在左侧，可滑动）
    if (allCorrect.length > 0) {
        html += `<div class="report-item correct">`;
        html += `<span class="label">已掌握单词:</span>`;
        html += `<span class="words">${allCorrect.join('、')}</span>`;
        html += `</div>`;
    }
    
    html += '</div>';
    
    // 添加掌握进度
    html += '<div class="report-progress">';
    html += `单词掌握进度：${totalCorrectCount}/${totalAttemptedCount}`;
    html += '</div>';
    
    reportContent.innerHTML = html;

    reportNarrationStatus.textContent = '报告已生成，即将自动播报';

    // 手动查看报告时可以继续本局；自然结束时只允许重新开始。
    continueChallengeBtn.classList.toggle('hidden', !isManualReport);
    
    // 显示报告面板
    reportPanel.classList.remove('hidden');
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => playReportNarration());
}

/**
 * 关闭手动报告，恢复进入报告前的游戏状态。
 */
function continueChallenge() {
    if (gameState !== 'report' || !reportReturnState) return;

    const resumeState = reportReturnState;
    stopReportNarration();
    reportReturnState = null;
    reportPanel.classList.add('hidden');
    overlay.classList.add('hidden');
    gameState = resumeState;
    topHud.classList.remove('hidden');

    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);

    clearInterval(obstacleSpawnInterval);
    obstacleSpawnInterval = undefined;
    if (resumeState === 'playing') {
        obstacleSpawnInterval = setInterval(spawnObstacles, SPAWN_INTERVAL_MS);
    }

    if (backgroundMusic) {
        backgroundMusic.play().catch(() => {});
    }

    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
}

/**
 * 清空本局数据并返回年级选择界面。
 */
function restartFromGradeSelection() {
    stopReportNarration();
    cancelAnimationFrame(animationId);
    animationId = undefined;
    clearInterval(timerInterval);
    timerInterval = undefined;
    clearInterval(obstacleSpawnInterval);
    obstacleSpawnInterval = undefined;
    clearTimeout(nextLevelTimeout);
    nextLevelTimeout = undefined;

    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }

    gameTracker.abandon();
    reportReturnState = null;
    gameState = 'start';
    score = 0;
    timeLeft = 60;
    lives = 5;
    level = 0;
    questionsAnswered = 0;
    gameSpeed = 0.8;
    baseGameSpeed = 0.8;
    usedCorrectWords = [];
    wordGroups = [];
    levelResults = [];
    totalCorrectCount = 0;
    totalAttemptedCount = 0;
    consecutiveCorrect = 0;
    appearanceLevel = 0;
    appearanceFloatPhase = 0;
    obstacles = [];
    words = [];
    clouds = [];
    grasses = [];
    particles = [];
    roadOffset = 0;
    lastSpawnType = null;
    lastWordX = 0;
    wordSpawnCooldownTicks = 0;
    selectedGrade = null;
    initClouds();

    reportContent.innerHTML = '';
    reportPanel.classList.add('hidden');
    resultPanel.classList.add('hidden');
    topHud.classList.add('hidden');
    overlay.classList.remove('hidden');
    startBtn.classList.remove('hidden');

    const speedControl = document.getElementById('speedControl');
    const speedValue = document.querySelector('.speed-value');
    if (speedControl) speedControl.classList.add('hidden');
    if (speedValue) speedValue.textContent = baseGameSpeed.toFixed(1);

    drawUI();
    showGradeSelector();
    drawStartScreen();
}

/**
 * 关卡完成（开始跑向终点）
 */
function levelComplete() {
    if (gameState !== 'playing') return;

    gameState = 'running_out';
    
    // 停止生成新单词和障碍物
    clearInterval(obstacleSpawnInterval);
}

/**
 * 关卡完成最终处理（显示结算界面）
 */
function levelCompleteFinal() {
    if (gameState !== 'running_out') return;

    gameState = 'ended';
    topHud.classList.add('hidden');
    
    // 停止游戏循环和定时器
    cancelAnimationFrame(animationId);
    clearInterval(timerInterval);
    clearInterval(obstacleSpawnInterval);
    
    // 停止当前音频
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    // 检查是否通过了所有关卡
    if (level >= maxLevels - 1) {
        // 显示成绩报告
        showReport('natural');
        return;
    }
    
    // 显示普通结算界面
    overlay.classList.remove('hidden');
    resultPanel.classList.remove('hidden');
    
    // 显示速度控制按钮
    const speedControl = document.getElementById('speedControl');
    const speedValue = document.querySelector('.speed-value');
    if (speedControl) {
        speedControl.classList.remove('hidden');
        // 同步速度显示值（显示用户设置的基础速度）
        if (speedValue) {
            speedValue.textContent = baseGameSpeed.toFixed(1);
        }
    }
    
    // 设置结算信息（不显示标题，只显示得分）
    resultScore.textContent = `Final Score: ${score}`;
    scheduleNextLevel();
}

/**
 * 结算画面停留 1 秒后自动进入下一关
 */
function scheduleNextLevel() {
    clearTimeout(nextLevelTimeout);
    nextLevelTimeout = setTimeout(() => {
        if (gameState === 'ended' && level < maxLevels - 1) {
            nextLevelTimeout = undefined;
            level++;
            startLevel();
        }
    }, 1000);
}

/**
 * 开始新关卡
 */
function startLevel() {
    // 报告页是终态，任何残留的异步回调都不能重新启动游戏
    if (gameState === 'report') return;

    clearTimeout(nextLevelTimeout);
    nextLevelTimeout = undefined;

    // 隐藏结算界面
    resultPanel.classList.add('hidden');
    overlay.classList.add('hidden');
    
    // 隐藏速度控制按钮
    const speedControl = document.getElementById('speedControl');
    if (speedControl) {
        speedControl.classList.add('hidden');
    }
    
    // 重置关卡相关变量（累计得分和 gameSpeed 跨关卡保留）
    timeLeft = 60;
    questionsAnswered = 0;
    // gameSpeed 不再重置，保持用户设置的值
    // usedCorrectWords 不再重置，保持全局记录（每个单词只能作为正确单词一次）
    obstacles = [];
    words = [];
    grasses = [];
    particles = [];
    lastSpawnType = null;
    lastWordX = 0;
    wordSpawnCooldownTicks = 0;
    
    // 初始化当前关卡的成绩记录
    levelResults[level] = {
        correct: [],
        incorrect: []
    };
    
    // 恢复背景音乐播放
    if (backgroundMusic) {
        backgroundMusic.play().catch(() => {});
    }
    
    // 设置小羊初始状态
    const laneHeight = getLaneHeight();
    const laneTop = getLaneTop();
    sheep = {
        x: 200 * SCALE,
        y: laneTop + laneHeight + laneHeight / 2 - 90 * SCALE,
        width: 150 * SCALE,
        height: 180 * SCALE,
        lane: 1,
        frame: 0,
        frameCount: 2,
        frameTimer: 0,
        speed: 8,
        isMoving: false,
        moveProgress: 0,
        targetLane: 1
    };
    
    // 设置游戏状态为进行中
    gameState = 'playing';
    topHud.classList.remove('hidden');
    
    // 启动定时器
    timerInterval = setInterval(updateTimer, 1000);
    obstacleSpawnInterval = setInterval(spawnObstacles, SPAWN_INTERVAL_MS);
    
    // 初始化小草（均匀分布在画面上）
    for (let i = 0; i < 3; i++) {
        const lane = i % NUM_LANES;
        grasses.push({
            x: canvasWidth * (0.3 + i * 0.25) + Math.random() * 50 * SCALE,
            y: laneTop + lane * laneHeight + 20 * SCALE + Math.random() * 20 * SCALE,
            lane: lane
        });
    }
    
    // 生成初始障碍物并开始游戏循环
    spawnObstacles();
    gameLoop();
}

/**
 * 渲染所有游戏元素
 */
function render() {
    drawBackground();
    drawClouds();
    drawRoad();
    drawGrasses();
    drawObstacles();
    drawWords();
    drawSheep();
    drawParticles();
    drawUI();
}

/**
 * 绘制背景
 */
function drawBackground() {
    const laneTop = getLaneTop();
    const laneHeight = getLaneHeight();
    
    // 天空渐变（从蓝色到浅绿色）
    const gradient = ctx.createLinearGradient(0, 0, 0, laneTop);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, laneTop);
    
    // 底部天空（蓝色）
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, laneTop + laneHeight * NUM_LANES, canvasWidth, canvasHeight - laneTop - laneHeight * NUM_LANES);
}

/**
 * 绘制云朵
 */
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    clouds.forEach(cloud => {
        drawCloud(cloud.x, cloud.y, cloud.size);
    });
}

/**
 * 绘制单个云朵
 * @param {number} x - 云朵位置X
 * @param {number} y - 云朵位置Y
 * @param {number} size - 云朵大小
 */
function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y - size * 0.1, size * 0.25, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y, size * 0.3, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y + size * 0.1, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * 绘制跑道（草地风格，带棕色横杆分隔）
 */
function drawRoad() {
    const laneHeight = getLaneHeight();
    const laneTop = getLaneTop();
    
    for (let i = 0; i < NUM_LANES; i++) {
        const laneY = laneTop + i * laneHeight;
        
        // 绘制草地跑道（绿色）
        ctx.fillStyle = '#7CB342';
        ctx.fillRect(0, laneY, canvasWidth, laneHeight);
        
        // 绘制棕色横杆（跑道顶部）
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(0, laneY, canvasWidth, 6 * SCALE);
        
        // 绘制棕色横杆（跑道底部）
        ctx.fillRect(0, laneY + laneHeight - 6 * SCALE, canvasWidth, 6 * SCALE);
        
        // 绘制浅棕色分隔带（在跑道之间）
        if (i < NUM_LANES - 1) {
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(0, laneY + laneHeight - 6 * SCALE, canvasWidth, 10 * SCALE);
            // 移除了小石子的绘制代码，只保留横杆
        }
    }
}

/**
 * 绘制小草
 */
function drawGrasses() {
    grasses.forEach(g => {
        if (caoImg.complete && caoImg.naturalWidth > 0) {
            const grassWidth = 70 * SCALE;
            const grassHeight = grassWidth * (caoImg.naturalHeight / caoImg.naturalWidth);
            ctx.drawImage(caoImg, g.x, g.y, grassWidth, grassHeight);
        }
    });
}

/**
 * 绘制小羊
 */
function drawSheep() {
    if (appearanceLevel > 0) {
        const appearanceImg = sheepAppearanceImages[appearanceLevel - 1];
        if (appearanceImg && appearanceImg.complete && appearanceImg.naturalWidth > 0) {
            drawContainedAppearance(appearanceImg);
            return;
        }
    }

    if (sheepImg.complete && sheepImg.naturalWidth > 0) {
        // 普通状态：根据当前帧切换显示两张图片（奔跑动画）
        if (sheep.frame === 1 && sheep1Img.complete && sheep1Img.naturalWidth > 0) {
            ctx.drawImage(sheep1Img, sheep.x, sheep.y, sheep.width, sheep.height);
        } else {
            ctx.drawImage(sheepImg, sheep.x, sheep.y, sheep.width, sheep.height);
        }
    } else {
        // 备用绘制（当图片加载失败时）
        const drawY = sheep.y;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(sheep.x + sheep.width / 2, drawY + sheep.height / 2, sheep.width / 2, sheep.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制金色耳朵
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(sheep.x + sheep.width * 0.2, drawY + sheep.height * 0.3, 8 * SCALE, 0, Math.PI * 2);
        ctx.arc(sheep.x + sheep.width * 0.6, drawY + sheep.height * 0.3, 8 * SCALE, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制黑色眼睛
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(sheep.x + sheep.width * 0.35, drawY + sheep.height * 0.4, 5 * SCALE, 0, Math.PI * 2);
        ctx.arc(sheep.x + sheep.width * 0.55, drawY + sheep.height * 0.4, 5 * SCALE, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制粉色脸颊
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(sheep.x + sheep.width * 0.3, drawY + sheep.height * 0.55, 8 * SCALE, 0, Math.PI);
        ctx.arc(sheep.x + sheep.width * 0.6, drawY + sheep.height * 0.55, 8 * SCALE, 0, Math.PI);
        ctx.fill();
    }
}

/**
 * 在统一的角色显示区域内等比绘制升级形象，避免车辆类图片被拉伸。
 * 碰撞盒仍沿用小羊本体尺寸，不会因为宽形图片而误撞相邻物体。
 * @param {HTMLImageElement} image - 当前等级对应的形象图片
 */
function drawContainedAppearance(image) {
    const maxWidth = 240 * SCALE;
    const maxHeight = sheep.height;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const boundsRatio = maxWidth / maxHeight;
    let drawWidth;
    let drawHeight;

    if (imageRatio > boundsRatio) {
        drawWidth = maxWidth;
        drawHeight = maxWidth / imageRatio;
    } else {
        drawHeight = maxHeight;
        drawWidth = maxHeight * imageRatio;
    }

    const isFlying = FLYING_APPEARANCE_LEVELS.has(appearanceLevel);
    const bob = Math.sin(appearanceFloatPhase);
    const lift = isFlying ? -(17 + bob * 9) * SCALE : 0;
    const tilt = isFlying ? Math.cos(appearanceFloatPhase) * 0.025 : 0;
    const drawX = sheep.x + (sheep.width - drawWidth) / 2;
    const drawY = sheep.y + sheep.height - drawHeight + lift;

    if (isFlying) {
        // 高度越高，地面阴影越小、越淡，让角色看起来真正离开跑道。
        const heightProgress = (bob + 1) / 2;
        const shadowRadiusX = drawWidth * (0.25 - heightProgress * 0.035);
        const shadowAlpha = 0.17 - heightProgress * 0.055;
        ctx.save();
        ctx.fillStyle = `rgba(42, 58, 31, ${shadowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(
            sheep.x + sheep.width / 2,
            sheep.y + sheep.height - 2 * SCALE,
            shadowRadiusX,
            5 * SCALE,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
    }

    // 围绕形象中心做极轻微俯仰，配合升降形成飞行中的惯性感。
    const centerX = drawX + drawWidth / 2;
    const centerY = drawY + drawHeight / 2;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(tilt);
    ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
}

/**
 * 绘制障碍物
 */
function drawObstacles() {
    obstacles.forEach(obs => {
        if (obs.type === 'grass') {
            // 绘制草丛障碍物
            if (caoImg.complete && caoImg.naturalWidth > 0) {
                ctx.drawImage(caoImg, obs.x, obs.y, obs.width, obs.height);
            } else {
                ctx.fillStyle = '#7CB342';
                ctx.beginPath();
                ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // 绘制石头障碍物（灰色多边形）
            ctx.fillStyle = '#696969';
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width * 0.2, obs.y + obs.height * 0.3);
            ctx.lineTo(obs.x + obs.width * 0.5, obs.y);
            ctx.lineTo(obs.x + obs.width * 0.8, obs.y + obs.height * 0.4);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();
        }
    });
}

/**
 * 绘制单词
 */
function drawWords() {
    const laneHeight = getLaneHeight();
    const laneTop = getLaneTop();
    
    words.forEach(w => {
        if (w.answered) return; // 已回答的单词不显示
        
        for (let i = 0; i < NUM_LANES; i++) {
            const laneY = laneTop + i * laneHeight + laneHeight / 2;
            
            // 白色粗体字显示单词
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold ' + (83 * SCALE) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(w.words[i], w.x + 50 * SCALE, laneY);
        }
    });
}

/**
 * 绘制粒子效果
 */
function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

/**
 * 同步顶部 DOM HUD（报告按钮、关卡和得分、固定 5 颗爱心）。
 */
function drawUI() {
    levelInfo.textContent = 'Level: ' + (level + 1) + '/' + maxLevels;
    scoreInfo.textContent = 'Score: ' + score;

    hudHearts.forEach((heart, index) => {
        heart.classList.toggle('lost', index >= lives);
    });
    livesInfoBar.setAttribute('aria-label', '剩余 ' + lives + ' 次机会，共 5 次');
}

/**
 * 绘制爱心形状
 * @param {number} x - 爱心位置X
 * @param {number} y - 爱心位置Y
 * @param {number} size - 爱心大小
 */
function drawHeart(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size);
    ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size);
    ctx.bezierCurveTo(x - size, y + size * 1.5, x, y + size * 1.8, x, y + size * 2);
    ctx.bezierCurveTo(x, y + size * 1.8, x + size, y + size * 1.5, x + size, y + size);
    ctx.bezierCurveTo(x + size, y, x, y, x, y + size);
    ctx.fill();
}

/**
 * 绘制开始界面
 */
function drawStartScreen() {
    drawBackground();
    drawClouds();
    drawRoad();
    
    // 半透明遮罩（降低透明度让背景更清晰）
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 显示速度控制按钮
    const speedControl = document.getElementById('speedControl');
    const speedValue = document.querySelector('.speed-value');
    if (speedControl) {
        speedControl.classList.remove('hidden');
        // 同步速度显示值（显示用户设置的基础速度）
        if (speedValue) {
            speedValue.textContent = baseGameSpeed.toFixed(1);
        }
    }
}

/**
 * 初始化年级选择界面
 */
function initGradeSelector() {
    // 显示第一级：年级范围选择
    showGradeLevel1();
}

/**
 * 显示第一级：年级范围选择
 */
function showGradeLevel1() {
    gradeTitle.textContent = '选择年级';
    gradeGrid.innerHTML = '';
    
    // 定义年级范围 - 显示1-9年级
    const gradeRanges = [
        { id: '1-3', name: '1-3年级' },
        { id: '4', name: '4年级' },
        { id: '5', name: '5年级' },
        { id: '6', name: '6年级' },
        { id: '7', name: '7年级' },
        { id: '8', name: '8年级' },
        { id: '9', name: '9年级' }
    ];
    
    gradeRanges.forEach(range => {
        const btn = document.createElement('button');
        btn.className = 'grade-btn';
        btn.textContent = range.name;
        btn.dataset.range = range.id;
        
        btn.addEventListener('click', () => {
            if (range.id === '1-3') {
                // 1-3年级直接选中并确认
                selectedGrade = '1-3';
                // 自动确认，隐藏选择界面
                selectGrade(selectedGrade);
                gradeSelector.classList.add('hidden');
                console.log('已选择年级:', gradeNames[selectedGrade]);
            } else {
                // 其他年级显示第二级选择
                showGradeLevel2(range.id);
            }
        });
        
        gradeGrid.appendChild(btn);
    });
}

/**
 * 显示第二级：上下册选择
 */
function showGradeLevel2(gradeNum) {
    gradeTitle.textContent = `选择${gradeNum}年级`;
    gradeGrid.innerHTML = '';
    
    // 创建上册和下册按钮
    const semesters = [
        { id: `${gradeNum}-1`, name: '上册' },
        { id: `${gradeNum}-2`, name: '下册' }
    ];
    
    semesters.forEach(sem => {
        const btn = document.createElement('button');
        btn.className = 'grade-btn';
        btn.textContent = sem.name;
        btn.dataset.semester = sem.id;
        
        btn.addEventListener('click', () => {
            // 更新选中的年级
            selectedGrade = sem.id;
            // 保存选择并隐藏界面
            selectGrade(selectedGrade);
            gradeSelector.classList.add('hidden');
            console.log('已选择年级:', gradeNames[selectedGrade]);
        });
        
        gradeGrid.appendChild(btn);
    });
}

/**
 * 显示年级选择界面
 */
function showGradeSelector() {
    // 始终从第一级开始显示
    showGradeLevel1();
    gradeSelector.classList.remove('hidden');
}

// 页面加载完成后初始化游戏
window.addEventListener('load', init);
