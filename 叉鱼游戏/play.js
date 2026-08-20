/**
 * 钓鱼游戏主逻辑文件
 * 游戏说明：玩家通过点击海里的鱼来捕获它们，需要根据播放的单词音频选择正确的鱼
 * 游戏特性：
 * - 60秒倒计时
 * - 5次机会（爱心显示）
 * - 5个关卡，每关捕获5条正确的鱼
 * - 支持鼠标和触摸操作
 * - 兼容iOS音频播放
 * - 屏幕自适应适配
 */

// 获取Canvas上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 小游戏参与/完成数据上报组件（必须在正式游戏开始后才创建会话）。
const gameTracker = typeof window.GameTracker === 'function'
    ? new window.GameTracker({
        gameId: 'fishing_game',
        gameVersion: '1.0.0',
        apiUrl: 'http://127.0.0.1:8000/api/v1/events',
        getUserId: function () {
            // 鉴权模块接入后替换为平台提供的内部用户 ID。
            return null;
        }
    })
    : null;

// 记录当前缩放比例（避免重复缩放）
let currentScale = 1;

// 游戏设计尺寸常量（16:9）
const DESIGN_WIDTH = 1600;
const DESIGN_HEIGHT = 900;
const HUD_GAP = 20;
const HUD_RIGHT_MARGIN = HUD_GAP;
const LIVES_BAR = { x: DESIGN_WIDTH - HUD_RIGHT_MARGIN - 300, y: 24, width: 300, height: 58, radius: 18 };
const STATUS_BAR = { x: LIVES_BAR.x - HUD_GAP - 700, y: 24, width: 700, height: 58, radius: 18 };
const END_GAME_BUTTON = { x: STATUS_BAR.x - HUD_GAP - 180, y: 24, width: 180, height: 58, radius: 18 };
const HUD_COLORS = {
    top: '#bdeeff',
    bottom: '#68c5eb',
    hoverTop: '#d9f6ff',
    hoverBottom: '#80d6f4',
    text: '#07507d',
    border: 'rgba(255, 255, 255, 0.72)'
};

/**
 * 适配屏幕大小
 */
function resizeCanvas() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // 获取设备像素比（解决iPad等高清屏幕模糊问题）
    const dpr = window.devicePixelRatio || 1;
    
    // 设置Canvas实际像素尺寸（保持16:9设计比例，乘以设备像素比）
    canvas.width = DESIGN_WIDTH * dpr;
    canvas.height = DESIGN_HEIGHT * dpr;
    
    // 重置缩放并重新设置（避免累积缩放）
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    currentScale = dpr;
    
    // Canvas样式铺满整个屏幕
    canvas.style.width = `${windowWidth}px`;
    canvas.style.height = `${windowHeight}px`;
    canvas.style.left = '0px';
    canvas.style.top = '0px';
}

// 游戏状态变量
let gameState = 'start';      // 游戏状态: start, tutorial, upgradeIntro, playing, report
let reportResult = null;      // 当前报告来源: quit（手动）/ win / lose（自然结束）
let score = 0;                // 得分
let timeLeft = 60;            // 剩余时间(秒)
let lives = 5;                // 剩余机会数
let currentLevel = 1;         // 当前关卡
let totalLevels = 27;         // 总关卡数
let fishCaughtInLevel = 0;    // 当前关卡已捕获鱼数
let fishToCatch = 5;          // 每关需要捕获的鱼数
let targetWord = '';          // 当前目标单词（需要点击的鱼）
let usedWords = [];           // 已使用过的单词（不能重复作为正确单词）
let caughtWordsInLevel = [];  // 本关已捕获的单词（不再出现）
let audioInitialized = false; // 音频是否已初始化（兼容iOS）
let gameSpeed = 1.0;          // 游戏速度（0.7-1.3）
let levelTransitionTimer = null; // 关卡结算后自动进入下一关的计时器
let isEndGameButtonHovered = false;

// 交互式新手关状态（每次页面打开只展示一次，不占用正式关卡时间）
let tutorialStep = 0;
let tutorialShownThisSession = false;
let tutorialFinishCallback = null;
let tutorialPhase = 'move';
let tutorialDragDistance = 0;
let tutorialLastBoatX = 0;
let tutorialBoatPressed = false;
let tutorialBoatMoved = false;
let tutorialWord = 'apple';
let tutorialMessage = '';
let tutorialMessageType = 'success';
let tutorialTransitionTimer = null;
let tutorialMessageTimer = null;
let tutorialRepeatAudioTimer = null;
let tutorialHasInteracted = false;
let upgradeIntroAnimationId = null;
let upgradeIntroFinishTimer = null;
let upgradeIntroCallback = null;

const BOAT_UPGRADE_INTERVAL = 15; // 每钓到15条正确的鱼升级一次
const MAX_BOAT_LEVEL = 8;
const BOAT_DRAW_BOX = { width: 420, height: 260 };
const HARPOON_REST_DROP_MULTIPLIER = 0.9;
const DEFAULT_BOAT_POINTS = {
    line: { x: 0.9825, y: 0.0625 },
    rest: { x: 0.9875, y: 0.25 }
};
const BOAT_LEVEL_CONFIG = {
    5: {
        boatOffsetY: 22,
        line: { x: 0.985, y: 0.08 },
        rest: { x: 0.985, y: 0.34 },
        harpoonHeight: 136,
        restDrop: 0.9
    },
    6: {
        boatOffsetY: 30,
        line: { x: 0.984, y: 0.64 },
        rest: { x: 0.984, y: 0.74 },
        harpoonHeight: 105,
        restDrop: 0.9
    },
    7: {
        line: { x: 0.98, y: 0.25 },
        rest: { x: 0.98, y: 0.43 },
        harpoonHeight: 122,
        restDrop: 0.9
    },
    8: {
        line: { x: 0.98, y: 0.49 },
        rest: { x: 0.98, y: 0.59 },
        harpoonHeight: 112,
        restDrop: 0.9
    }
};

// 船升级系统变量
let currentBoatLevel = 0;     // 当前船等级（0: boat, 1: boat1 ... 8: boat8）
let consecutiveErrors = 0;    // 当前连续错误计数
let boatIsDamaged = false;    // 船是否破损
let damageStages = 0;         // 破损阶段（0:完好, 1:已破洞, 2:需降级）
let isUpgrading = false;      // 是否正在升级动画中
let upgradeProgress = 0;      // 升级进度（0-100）
let hammers = [];             // 锤子动画数组
let smokeParticles = [];      // 烟雾粒子数组
let targetBoatLevel = 0;      // 目标船等级（升级动画期间使用）
let nextBoatUpgradeScore = BOAT_UPGRADE_INTERVAL;

/**
 * 检查船是否需要升级
 * @returns {boolean} 是否会升级
 */
function checkBoatUpgrade() {
    if (isUpgrading || currentBoatLevel >= MAX_BOAT_LEVEL) {
        return false;
    }

    if (score >= nextBoatUpgradeScore) {
        const nextLevel = Math.min(currentBoatLevel + 1, MAX_BOAT_LEVEL);
        startUpgradeAnimation(nextLevel);
        nextBoatUpgradeScore += BOAT_UPGRADE_INTERVAL;
        return true;
    }

    return false;
}

function resetBoatProgress() {
    currentBoatLevel = 0;
    consecutiveErrors = 0;
    boatIsDamaged = false;
    damageStages = 0;
    isUpgrading = false;
    upgradeProgress = 0;
    hammers = [];
    smokeParticles = [];
    targetBoatLevel = 0;
    nextBoatUpgradeScore = BOAT_UPGRADE_INTERVAL;
}

/**
 * 开始船升级动画
 */
function startUpgradeAnimation(targetLevel) {
    isUpgrading = true;
    targetBoatLevel = targetLevel;
    upgradeProgress = 0;
    hammers = [];
    smokeParticles = [];
    
    playBoatUpgradeSound();
    
    // 创建初始锤子
    createHammer();
    
    console.log(`开始升级到等级 ${targetLevel}`);
}

/** 播放正式游戏与升级规则演示共用的船只升级音效。 */
function playBoatUpgradeSound() {
    const audio = new Audio('assets/yinxiao/boat.mp3');
    audio.volume = 1;
    audio.play().catch(() => {});
}

/**
 * 创建锤子动画
 */
function createHammer() {
    if (!images.hammer) return;
    
    // 在船的不同位置创建锤子（均匀分布）
    const positions = [
        { x: boat.x - 150, y: boat.y - 50 },  // 左上角
        { x: boat.x - 80, y: boat.y - 30 },   // 左中
        { x: boat.x, y: boat.y - 40 },         // 中间
        { x: boat.x + 80, y: boat.y - 30 },   // 右中
        { x: boat.x + 150, y: boat.y - 50 },  // 右上角
        { x: boat.x - 120, y: boat.y + 20 },  // 左下角
        { x: boat.x + 120, y: boat.y + 20 },  // 右下角
        { x: boat.x - 60, y: boat.y },        // 左侧中部
        { x: boat.x + 60, y: boat.y }         // 右侧中部
    ];
    
    // 找到一个还没有锤子的位置
    let availablePositions = positions.filter(pos => {
        return !hammers.some(hammer => 
            Math.abs(hammer.targetX - pos.x) < 40 && Math.abs(hammer.targetY - pos.y) < 40
        );
    });
    
    // 如果所有位置都有锤子了，随机选择一个
    if (availablePositions.length === 0) {
        availablePositions = positions;
    }
    
    const randomPos = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    
    hammers.push({
        x: randomPos.x,
        y: randomPos.y - 50,  // 从上方开始
        targetX: randomPos.x,
        targetY: randomPos.y,
        speed: 8,
        angle: 0,
        hit: false,
        scale: 0.8 + Math.random() * 0.4
    });
}

/**
 * 创建烟雾粒子
 */
function createSmoke(x, y) {
    for (let i = 0; i < 5; i++) {
        smokeParticles.push({
            x: x + (Math.random() - 0.5) * 30,
            y: y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 2 - 1,
            life: 1,
            size: 5 + Math.random() * 10
        });
    }
}

/**
 * 更新升级动画
 */
function updateUpgradeAnimation() {
    if (!isUpgrading) return;
    
    upgradeProgress += 2;
    
    // 定期创建锤子（最多5个）
    if (Math.random() < 0.3 && hammers.length < 5) {
        createHammer();
    }
    
    // 更新锤子动画
    for (let i = hammers.length - 1; i >= 0; i--) {
        const hammer = hammers[i];
        
        if (!hammer.hit) {
            // 锤子下落
            hammer.y += hammer.speed;
            if (hammer.y >= hammer.targetY) {
                hammer.y = hammer.targetY;
                hammer.hit = true;
                hammer.angle = -0.3;  // 敲击角度
                
                // 创建烟雾
                createSmoke(hammer.x, hammer.y);
            }
        } else {
            // 锤子弹回
            hammer.y -= hammer.speed * 1.5;
            hammer.angle = 0;
            
            if (hammer.y < hammer.targetY - 60) {
                hammers.splice(i, 1);
            }
        }
    }
    
    // 更新烟雾粒子
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const smoke = smokeParticles[i];
        smoke.x += smoke.vx;
        smoke.y += smoke.vy;
        smoke.life -= 0.02;
        smoke.size += 0.2;
        
        if (smoke.life <= 0) {
            smokeParticles.splice(i, 1);
        }
    }
    
    // 升级完成
    if (upgradeProgress >= 100) {
        finishUpgrade();
    }
}

/**
 * 完成升级
 */
function finishUpgrade() {
    currentBoatLevel = targetBoatLevel;
    boatIsDamaged = false;
    consecutiveErrors = 0;
    damageStages = 0;
    isUpgrading = false;
    hammers = [];
    smokeParticles = [];
    if (!harpoon.isFlying) {
        resetHarpoonToBoat();
    }
    
    console.log(`船升级到等级 ${currentBoatLevel}`);
}

/**
 * 处理错误时的船降级逻辑
 * 规则：连续错2次→破洞；再连续错2次（不管中间是否答对）→降级
 */
function handleBoatDamage() {
    consecutiveErrors++;
    
    // 如果当前船有等级，检查是否需要破损或降级
    if (currentBoatLevel > 0) {
        // 连续错2次
        if (consecutiveErrors >= 2) {
            // 增加破损阶段
            damageStages++;
            consecutiveErrors = 0;  // 重置当前连续错误计数
            
            if (damageStages >= 2) {
                // 第二个破损阶段，船降级
                currentBoatLevel--;
                boatIsDamaged = false;
                damageStages = 0;
                if (!harpoon.isFlying) {
                    resetHarpoonToBoat();
                }
                console.log(`船降级到等级 ${currentBoatLevel}`);
            } else {
                // 第一个破损阶段，船破洞
                boatIsDamaged = true;
                console.log('船破损了！');
            }
        }
    }
}

/**
 * 重置连续错误计数（答对时调用）
 */
function resetConsecutiveErrors() {
    consecutiveErrors = 0;
    // 答对不会修复破洞，破洞会一直存在直到升级或降级
}

// 成绩统计变量
let masteredWords = [];       // 已掌握单词列表（抓到正确单词）
let unmasteredWords = [];     // 未掌握单词列表（抓错单词）
let totalTargetWords = 0;     // 参与过的正确单词总数

// 游戏对象
let fishArray = [];           // 鱼数组
let harpoon = {               // 鱼叉对象
    x: 0,                     // 当前X坐标
    y: 0,                     // 当前Y坐标
    angle: 0,                 // 角度
    isFlying: false,          // 是否正在飞行
    targetX: 0,               // 目标X坐标
    targetY: 0                // 目标Y坐标
};
let boat = { x: 800, y: 220 }; // 船的位置（向下移动70像素）
let waterRipples = [];        // 水波效果数组
let isDraggingBoat = false;   // 是否正在拖动船

// 定时器ID
let animationId;              // 动画帧ID
let gameTimer;                // 游戏倒计时定时器
let spawnTimer;               // 鱼生成定时器
let repeatAudioTimer;         // 重复播放音频定时器

// 音频对象(用于控制音频播放)
let currentAudio = null;      // 当前正在播放的音频对象
let bgMusic = null;           // 背景音乐对象
let reportNarrationAudio = null; // 当前正在播放的报告播报音频
let reportNarrationRunId = 0;    // 用于取消旧的报告播报队列

// 页面加载完成后立即初始化背景音乐对象
document.addEventListener('DOMContentLoaded', () => {
    bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        bgMusic.volume = 0.2;
        bgMusic.loop = true;
        console.log('背景音乐对象已初始化');
        
        // 尝试自动播放
        bgMusic.play().catch(err => {
            console.log('自动播放被阻止，等待用户交互');
            
            // 添加全局点击监听器，点击页面任意位置都能播放背景音乐
            const handleGlobalClick = () => {
                console.log('检测到用户点击，尝试播放背景音乐');
                bgMusic.play().then(() => {
                    console.log('背景音乐播放成功');
                }).catch(e => {
                    console.error('播放失败:', e);
                });
                // 移除监听器，只在第一次点击时播放
                document.removeEventListener('click', handleGlobalClick);
                document.removeEventListener('touchstart', handleGlobalClick);
            };
            
            // 添加点击和触摸事件监听器
            document.addEventListener('click', handleGlobalClick);
            document.addEventListener('touchstart', handleGlobalClick);
        });
    } else {
        console.error('背景音乐元素未找到！');
    }
});

// 图片资源对象
const images = {
    background: null,          // 背景图片
    boat: null,               // 船图片
    hook: null,               // 鱼叉图片
    heart: null,              // 爱心图片
    torpedo: null,            // 鱼雷图片
    tutorialHand: null,        // 新手教学手势图片
    fishLeft: [],             // 向左移动的鱼图片数组 (fish1.png~fish7.png)
    fishRight: []             // 向右移动的鱼图片数组 (fish1(1).png~fish7(1).png)
};

// 音频文件列表（单词）
const audioFiles = [
    'apple', 'are', 'arm', 'bag', 'ball', 'banana', 'bed', 'big', 'bird', 'black',
    'blow', 'blue', 'book', 'box', 'brother', 'brush', 'burger', 'bus', 'cake', 'can',
    'candle', 'cap', 'car', 'card', 'cat', 'chocolate', 'coat', 'coke', 'color', 'cookie',
    'cow', 'cup', 'cut', 'dad', 'dance', 'desk', 'dog', 'dolphin', 'dress', 'eat',
    'egg', 'eight', 'elephant', 'face', 'fat', 'feed', 'find', 'five', 'fly', 'foot',
    'four', 'from', 'grandma', 'grandpa', 'grape', 'green', 'hair', 'hand', 'hat', 'have',
    'head', 'hello', 'hen', 'hippo', 'hop', 'horse', 'how', 'jump', 'kangaroo', 'kite',
    'leg', 'lemon', 'let', 'like', 'lollipop', 'long', 'look', 'love', 'man', 'many',
    'map', 'milk', 'mix', 'mom', 'monkey', 'moon', 'name', 'neck', 'nine', 'no',
    'nod', 'nose', 'old', 'one', 'orange', 'panda', 'pants', 'pear', 'pen', 'pig',
    'play', 'rabbit', 'red', 'rice', 'row', 'run', 'sad', 'scarf', 'school', 'sea',
    'see', 'seven', 'she', 'shoes', 'sing', 'sister', 'sit', 'six', 'sky', 'sleep',
    'socks', 'some', 'sun', 'swim', 'ten', 'the', 'this', 'three', 'tiger', 'touch',
    'toy', 'tree', 'two', 'watermelon', 'whale', 'what', 'white', 'who', 'yellow', 'yes', 'your', 'zoo'
];

function getActiveAudioFiles() {
    if (typeof getCurrentWords === 'function') {
        const currentWords = getCurrentWords();
        if (Array.isArray(currentWords) && currentWords.length > 0) {
            return currentWords;
        }
    }

    return audioFiles;
}

function getWordAudioUrl(word) {
    const audioPath = typeof getAudioPath === 'function' ? getAudioPath() : 'assets/audio';
    return `${audioPath}/${encodeURIComponent(word)}.mp3`;
}

/**
 * 加载所有图片资源
 * @returns {Promise} 加载完成的Promise
 */
function loadImages() {
    return new Promise((resolve) => {
        let loaded = 0;
        const imageSources = [
            { key: 'background', src: 'assets/image/background.png' },
            { key: 'boat', src: 'assets/image/boat.png' },
            { key: 'hole', src: 'assets/image/dong.png' },
            { key: 'hammer', src: 'assets/image/chuizi.png' },
            { key: 'hook', src: 'assets/image/hook.png' },
            { key: 'heart', src: 'assets/image/aixin.png' },
            { key: 'torpedo', src: 'assets/image/fishlei.png' },
            { key: 'tutorialHand', src: 'assets/image/tutorial-hand.png' }
        ];

        for (let i = 1; i <= MAX_BOAT_LEVEL; i++) {
            imageSources.push({ key: `boat${i}`, src: `assets/image/boat${i}.png` });
        }

        for (let i = 3; i <= MAX_BOAT_LEVEL; i++) {
            imageSources.push({ key: `harpoon${i}`, src: `assets/image/harpoon${i}.png` });
        }

        const total = imageSources.length + 14;

        // 图片加载完成或失败回调
        const onLoad = () => {
            loaded++;
            console.log(`图片加载进度: ${loaded}/${total}`);
            if (loaded === total) {
                console.log('所有图片加载完成');
                resolve();
            }
        };

        imageSources.forEach(({ key, src }) => {
            images[key] = new Image();
            images[key].onload = onLoad;
            images[key].onerror = onLoad; // 加载失败也算完成
            images[key].src = src;
        });

        // 加载向左移动的鱼图片 (fish1.png~fish7.png)
        for (let i = 1; i <= 7; i++) {
            const fishImg = new Image();
            fishImg.onload = onLoad;
            fishImg.onerror = onLoad; // 加载失败也算完成
            fishImg.src = `assets/image/fish${i}.png`;
            images.fishLeft.push(fishImg);
        }

        // 加载向右移动的鱼图片 (fish1(1).png~fish7(1).png)
        for (let i = 1; i <= 7; i++) {
            const fishImg = new Image();
            fishImg.onload = onLoad;
            fishImg.onerror = onLoad; // 加载失败也算完成
            fishImg.src = `assets/image/fish${i}(1).png`;
            images.fishRight.push(fishImg);
        }
    });
}

/**
 * 播放单词音频
 * @param {string} word - 要播放的单词
 * @returns {Promise} 播放完成的Promise
 */
function playAudio(word) {
    return new Promise((resolve) => {
        // 停止当前正在播放的音频（防止两个音频同时播放）
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        
        // 使用当前年级的动态音频路径
        const audio = new Audio(getWordAudioUrl(word));
        audio.volume = 1;
        
        // 添加一个标记来检查是否被取消
        audio._cancelled = false;
        
        audio.onended = () => {
            if (!audio._cancelled) {
                currentAudio = null;
                resolve();
            }
        };  // 播放结束回调
        
        audio.onerror = () => {
            if (!audio._cancelled) {
                currentAudio = null;
                resolve();
            }
        };  // 播放出错回调
        
        audio.oncanplay = () => {
            if (audio._cancelled) return; // 如果已取消，不再播放
            
            audio.play().catch(() => {
                if (!audio._cancelled) {
                    currentAudio = null;
                    resolve();
                }
            }); // iOS兼容
        };
        
        // 保存当前音频对象
        currentAudio = audio;
        
        // 确保在音频加载完成前也能被停止
        audio.onloadstart = () => {
            if (audio._cancelled) {
                audio.pause();
            }
        };
        
        audio.load();
    });
}

/** 停止报告页当前音频及后续播报队列。 */
function stopReportNarration() {
    reportNarrationRunId++;

    if (reportNarrationAudio) {
        const audio = reportNarrationAudio;
        audio.pause();
        audio.currentTime = 0;
        if (typeof audio._finishReportNarration === 'function') {
            audio._finishReportNarration('cancelled');
        } else {
            reportNarrationAudio = null;
        }
    }

}

/**
 * 播放报告队列中的一段音频。
 * @param {string} src - 音频地址
 * @param {number} runId - 当前播报队列标识
 * @returns {Promise<'ended'|'error'|'blocked'|'cancelled'>}
 */
function playReportNarrationClip(src, runId) {
    return new Promise((resolve) => {
        if (runId !== reportNarrationRunId || gameState !== 'report') {
            resolve('cancelled');
            return;
        }

        const audio = new Audio(src);
        audio.volume = 1;
        audio.preload = 'auto';
        reportNarrationAudio = audio;
        let settled = false;

        const finish = (result) => {
            if (settled) return;
            settled = true;
            audio.onended = null;
            audio.onerror = null;
            audio._finishReportNarration = null;
            if (reportNarrationAudio === audio) reportNarrationAudio = null;
            resolve(result);
        };

        audio._finishReportNarration = finish;
        audio.onended = () => finish('ended');
        audio.onerror = () => finish('error');
        audio.play().catch(() => finish('blocked'));
    });
}

/** 按“提示语 → 前三个未掌握单词 → 结束语”的顺序播报报告。 */
async function playReportNarration() {
    if (gameState !== 'report') return;

    stopReportNarration();
    const runId = reportNarrationRunId;
    const wordsToRead = unmasteredWords.slice(0, 3);
    const narrationQueue = wordsToRead.length > 0
        ? [
            'assets/report/1_1.mp3',
            ...wordsToRead.map(getWordAudioUrl),
            'assets/report/1_2.mp3'
        ]
        : ['assets/report/2.mp3'];

    for (const src of narrationQueue) {
        const result = await playReportNarrationClip(src, runId);
        if (result === 'cancelled' || result === 'blocked') break;
        if (runId !== reportNarrationRunId || gameState !== 'report') return;
    }
}

/**
 * 播放游戏音效
 * @param {string} soundName - 音效名称: 'fishright', 'fishwrong', 'fishlei'
 * @returns {Promise} 音效播放完成的Promise
 */
function playSoundEffect(soundName) {
    return new Promise((resolve) => {
        const audio = new Audio(`assets/yinxiao/${soundName}.mp3`);
        audio.volume = 0.5;
        
        audio.onended = () => {
            resolve();
        };
        
        audio.onerror = () => {
            resolve();
        };
        
        audio.play().catch(err => {
            console.log('音效播放失败:', err);
            resolve();
        });
    });
}

/**
 * 获取随机单词
 * @param {number} count - 需要的单词数量
 * @returns {string[]} 随机单词数组
 */
function getRandomWords(count) {
    const shuffled = [...getActiveAudioFiles()].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

/**
 * 生成鱼（包括普通鱼和鱼雷）
 */
function spawnFish() {
    if (gameState !== 'playing') return;

    // 最多同时存在12条鱼
    if (fishArray.length >= 12) return;

    // 统计当前画面中鱼雷数量
    const currentTorpedoCount = fishArray.filter(f => f.isTorpedo).length;
    
    // 如果没有鱼雷，强制生成一个
    if (currentTorpedoCount === 0) {
        const direction = Math.random() < 0.5 ? 1 : -1;
        const baseWidth = 140;
        const imageRatio = images.torpedo.height / images.torpedo.width;
        
        fishArray.push({
            x: direction === 1 ? -100 : DESIGN_WIDTH + 100,
            y: DESIGN_HEIGHT * 0.5 + Math.random() * (DESIGN_HEIGHT * 0.4),
            width: baseWidth,
            height: baseWidth * imageRatio,
            speed: 0.8 + Math.random() * 0.4,
            direction: direction,
            word: '',
            image: images.torpedo,
            isTorpedo: true,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            state: 'normal',       // 状态: normal, caught, wrong
            shakeTime: 0,          // 晃动时间
            carryOffset: {x: 0, y: 0} // 被携带时的偏移
        });
        
        if (fishArray.length >= 12) return;
    }

    // 获取本关已捕获的单词（这些单词在本关不再出现）
    const caughtWords = new Set(caughtWordsInLevel);
    
    // 获取当前画面中已有的所有单词
    const existingWords = new Set(fishArray.filter(f => !f.isTorpedo).map(f => f.word));
    
    // 如果目标单词鱼不存在，生成目标单词鱼
    if (targetWord && !existingWords.has(targetWord) && !caughtWords.has(targetWord)) {
        const direction = Math.random() < 0.5 ? 1 : -1;
        const fishImages = direction === 1 ? images.fishRight : images.fishLeft;
        const fishImage = fishImages[Math.floor(Math.random() * fishImages.length)];
        const baseWidth = 150;
        const scale = 1 + Math.random();
        const imageRatio = fishImage.height / fishImage.width;
        
        fishArray.push({
            x: direction === 1 ? -100 : DESIGN_WIDTH + 100,
            y: DESIGN_HEIGHT * 0.5 + Math.random() * (DESIGN_HEIGHT * 0.4),
            width: baseWidth * scale,
            height: baseWidth * scale * imageRatio,
            speed: 0.8 + Math.random() * 3.1,
            direction: direction,
            word: targetWord,
            image: fishImage,
            isTorpedo: false,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            state: 'normal',       // 状态: normal, caught, wrong
            shakeTime: 0,          // 晃动时间
            carryOffset: {x: 0, y: 0} // 被携带时的偏移
        });
        
        // 如果鱼数量不足5条，继续生成其他鱼
        if (fishArray.length < 5) {
            spawnAdditionalFish(caughtWords);
        }
        return;
    }

    // 如果鱼数量不足5条，强制生成鱼
    if (fishArray.length < 5) {
        spawnAdditionalFish(caughtWords);
        return;
    }

    // 生成其他单词鱼（只排除本关已捕获的单词，其他单词可以重复）
    const words = getRandomWords(5);
    const availableWords = words.filter(w => !caughtWords.has(w));
    
    if (availableWords.length === 0) return;
    
    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    // 最多同时存在3个鱼雷
    const isTorpedo = currentTorpedoCount < 3 && Math.random() < 0.2;
    const direction = Math.random() < 0.5 ? 1 : -1;
    const fishImages = direction === 1 ? images.fishRight : images.fishLeft;
    const fishImage = isTorpedo ? images.torpedo : fishImages[Math.floor(Math.random() * fishImages.length)];
    const startX = direction === 1 ? -100 : DESIGN_WIDTH + 100;

    const baseWidth = isTorpedo ? 140 : 150;
    const scale = isTorpedo ? 1 : 1 + Math.random();
    
    const imageRatio = fishImage.height / fishImage.width;
    const scaledWidth = baseWidth * scale;
    const scaledHeight = scaledWidth * imageRatio;

    fishArray.push({
        x: startX,
        y: DESIGN_HEIGHT * 0.5 + Math.random() * (DESIGN_HEIGHT * 0.4),
        width: scaledWidth,
        height: scaledHeight,
        speed: isTorpedo ? 0.8 + Math.random() * 0.4 : 0.8 + Math.random() * 3.1,
        direction: direction,
        word: word,
        image: fishImage,
        isTorpedo: isTorpedo,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        state: 'normal',       // 状态: normal, caught, wrong
        shakeTime: 0,          // 晃动时间
        carryOffset: {x: 0, y: 0} // 被携带时的偏移
    });
}

/**
 * 额外生成鱼，确保画面中至少有5条鱼
 */
function spawnAdditionalFish(caughtWords) {
    const targetCount = 5;
    const currentCount = fishArray.length;
    
    for (let i = currentCount; i < targetCount && fishArray.length < 12; i++) {
        const words = getRandomWords(5);
        const availableWords = words.filter(w => !caughtWords.has(w));
        
        if (availableWords.length === 0) break;
        
        const word = availableWords[Math.floor(Math.random() * availableWords.length)];
        const direction = Math.random() < 0.5 ? 1 : -1;
        const fishImages = direction === 1 ? images.fishRight : images.fishLeft;
        const fishImage = fishImages[Math.floor(Math.random() * fishImages.length)];
        const startX = direction === 1 ? -100 : DESIGN_WIDTH + 100;

        const baseWidth = 150;
        const scale = 1 + Math.random();
        const imageRatio = fishImage.height / fishImage.width;
        const scaledWidth = baseWidth * scale;
        const scaledHeight = scaledWidth * imageRatio;

        fishArray.push({
            x: startX,
            y: DESIGN_HEIGHT * 0.5 + Math.random() * (DESIGN_HEIGHT * 0.4),
            width: scaledWidth,
            height: scaledHeight,
            speed: 0.8 + Math.random() * 3.1,
            direction: direction,
            word: word,
            image: fishImage,
            isTorpedo: false,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            state: 'normal',
            shakeTime: 0,
            carryOffset: {x: 0, y: 0}
        });
    }
}

/**
 * 创建水波效果
 * @param {number} x - 水波中心X坐标
 * @param {number} y - 水波中心Y坐标
 */
function createWaterRipple(x, y) {
    // 创建多层水波（增加到5层，更明显）
    for (let i = 0; i < 5; i++) {
        waterRipples.push({
            x: x,
            y: y,
            radius: 5 + i * 12,
            maxRadius: 150 + i * 40,  // 增大最大半径
            opacity: 1 - i * 0.15,     // 更不透明
            speed: 3 + i * 0.8,         // 更快扩散
            lineWidth: 4 - i * 0.5      // 外层更细
        });
    }
}

/**
 * 让周围的鱼加速离开
 * @param {number} x - 爆炸中心X坐标
 * @param {number} y - 爆炸中心Y坐标
 */
function scareNearbyFish(x, y) {
    const scareRadius = 500; // 影响范围（原来的1.5倍）
    
    fishArray.forEach(fish => {
        // 跳过鱼雷和已经在特殊状态的鱼
        if (fish.isTorpedo || fish.state !== 'normal') return;
        
        // 计算距离
        const dx = fish.x - x;
        const dy = fish.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 在影响范围内的鱼
        if (distance < scareRadius && distance > 0) {
            // 根据距离计算逃离强度（越近越强烈）
            const scareIntensity = 1 - (distance / scareRadius);
            
            // 加速逃离（远离爆炸中心）
            fish.speed *= (1 + scareIntensity * 2);
            
            // 如果鱼朝向爆炸中心，则反转方向
            const fishDirection = fish.direction;
            const awayDirection = dx > 0 ? 1 : -1;
            
            if (fishDirection !== awayDirection) {
                // 小概率反转方向逃离
                if (Math.random() < scareIntensity * 0.5) {
                    fish.direction = awayDirection;
                    
                    // 切换到对应方向的鱼图片（不能倒着游）
                    const fishImages = awayDirection === 1 ? images.fishRight : images.fishLeft;
                    fish.image = fishImages[Math.floor(Math.random() * fishImages.length)];
                }
            }
        }
    });
}

/**
 * 更新水波效果
 */
function updateWaterRipples() {
    waterRipples = waterRipples.filter(ripple => {
        ripple.radius += ripple.speed;
        ripple.opacity -= 0.02;
        
        // 当水波消失时移除
        return ripple.opacity > 0 && ripple.radius < ripple.maxRadius;
    });
}

/**
 * 更新鱼的位置
 */
function updateFish() {
    fishArray = fishArray.filter(fish => {
        // 检查是否被标记为移除（如鱼雷被击中）
        if (fish.toRemove) {
            return false;
        }
        
        // 被捕获的鱼 - 随鱼叉移动到船的位置
        if (fish.state === 'caught') {
            // 计算到船的距离
            const dx = fish.targetX - fish.x;
            const dy = fish.targetY - fish.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 如果还没有保存初始大小，先保存
            if (!fish.originalWidth) {
                fish.originalWidth = fish.width;
                fish.originalHeight = fish.height;
                fish.maxDistance = distance; // 保存初始距离
            }
            
            // 计算缩小比例（越接近船越小，最小缩小到原来的30%）
            const shrinkRatio = Math.max(0.3, distance / fish.maxDistance);
            
            // 应用缩小效果
            fish.width = fish.originalWidth * shrinkRatio;
            fish.height = fish.originalHeight * shrinkRatio;
            
            if (distance < 15) {
                // 到达船的位置，标记为移除
                fish.toRemove = true;
                return false;
            }
            
            // 向船的位置移动
            fish.x += dx * 0.15;
            fish.y += dy * 0.15;
            
            return true;
        }
        
        // 错误单词鱼 - 先晃动挣扎，然后加速逃跑
        if (fish.state === 'wrong') {
            // 晃动阶段
            if (fish.shakeTime > 0) {
                fish.shakeTime--;
                // 左右晃动
                fish.x += Math.sin(fish.shakeTime * 0.4) * 3;
            }
            
            // 正常移动（加速逃跑）
            fish.x += fish.speed * fish.direction * gameSpeed;
            
            // 移除超出画面的鱼
            if (fish.direction === 1) {
                if (fish.x > DESIGN_WIDTH + 100) return false;
            } else {
                if (fish.x < -100) return false;
            }
            
            return true;
        }
        
        // 正常状态的鱼
        fish.x += fish.speed * fish.direction * gameSpeed;
        
        // 移除超出画面的鱼
        if (fish.direction === 1) {
            if (fish.x > DESIGN_WIDTH + 100) return false;
        } else {
            if (fish.x < -100) return false;
        }
        
        return true;
    });
}

/**
 * 绘制游戏背景（使用背景图片）
 */
function drawBackground() {
    // 先清除画布
    ctx.clearRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    
    // 如果背景图片已加载，使用图片作为背景
    if (images.background) {
        ctx.drawImage(images.background, 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    } else {
        // 备用：天空到水面的渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, DESIGN_HEIGHT);
        gradient.addColorStop(0, '#87CEEB');   // 天空蓝
        gradient.addColorStop(0.6, '#1E90FF'); // 浅海水蓝
        gradient.addColorStop(1, '#006994');   // 深海蓝
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    }

    // 水草区域（如果背景图片没有水草，则绘制）
    if (!images.background) {
        // 绘制水草区域
        ctx.fillStyle = '#2E8B57';
        ctx.fillRect(0, DESIGN_HEIGHT * 0.3, DESIGN_WIDTH, 20);

        // 绘制水草
        for (let i = 0; i < 15; i++) {
            ctx.fillStyle = `rgba(46, 139, 87, ${0.3 + Math.random() * 0.4})`;
            ctx.fillRect(
                Math.random() * DESIGN_WIDTH,
                DESIGN_HEIGHT * 0.3,
                30 + Math.random() * 50,
                5 + Math.random() * 10
            );
        }
    }
}

function getBoatImage(level = currentBoatLevel) {
    for (let i = level; i >= 0; i--) {
        const key = i === 0 ? 'boat' : `boat${i}`;
        if (images[key]) {
            return images[key];
        }
    }
    return images.boat;
}

function getHarpoonImage(level = currentBoatLevel) {
    if (level >= 3) {
        return images[`harpoon${level}`] || images.hook;
    }
    return images.hook;
}

function getHarpoonDrawHeight(level = currentBoatLevel) {
    return BOAT_LEVEL_CONFIG[level]?.harpoonHeight || 120;
}

function getBoatRect(level = currentBoatLevel) {
    const boatImage = getBoatImage(level);
    const imageWidth = boatImage && boatImage.width ? boatImage.width : 400;
    const imageHeight = boatImage && boatImage.height ? boatImage.height : 160;
    const imageRatio = imageWidth / imageHeight;

    let width = BOAT_DRAW_BOX.width;
    let height = width / imageRatio;

    if (height > BOAT_DRAW_BOX.height) {
        height = BOAT_DRAW_BOX.height;
        width = height * imageRatio;
    }

    return {
        x: boat.x - width / 2,
        y: boat.y - height / 2 + (BOAT_LEVEL_CONFIG[level]?.boatOffsetY || 0),
        width,
        height
    };
}

function getBoatPoint(kind, level = currentBoatLevel) {
    const rect = getBoatRect(level);
    const points = BOAT_LEVEL_CONFIG[level] || DEFAULT_BOAT_POINTS;
    const point = points[kind] || DEFAULT_BOAT_POINTS[kind];

    return {
        x: rect.x + rect.width * point.x,
        y: rect.y + rect.height * point.y
    };
}

function resetHarpoonToBoat() {
    const restPoint = getBoatPoint('rest');
    const restDrop = BOAT_LEVEL_CONFIG[currentBoatLevel]?.restDrop ?? HARPOON_REST_DROP_MULTIPLIER;
    harpoon.x = restPoint.x;
    harpoon.y = restPoint.y + getHarpoonDrawHeight() * restDrop;
}

function getHarpoonAngle(linePoint) {
    if (harpoon.isFlying) {
        return Math.atan2(harpoon.targetY - harpoon.y, harpoon.targetX - harpoon.x);
    }

    return Math.atan2(harpoon.y - linePoint.y, harpoon.x - linePoint.x);
}

function getHarpoonMetrics(linePoint) {
    const harpoonImage = getHarpoonImage();
    if (!harpoonImage) return null;

    const height = getHarpoonDrawHeight();
    const imageRatio = harpoonImage.width / harpoonImage.height;
    const width = height * imageRatio;
    const rotation = getHarpoonAngle(linePoint) - Math.PI / 2;

    return { image: harpoonImage, width, height, rotation };
}

function getHarpoonRingPoint(metrics) {
    // Image is drawn with its fork/tips near the local origin and the ring near the top.
    const localX = 0;
    const localY = -metrics.height * 0.91;
    const cos = Math.cos(metrics.rotation);
    const sin = Math.sin(metrics.rotation);

    return {
        x: harpoon.x + localX * cos - localY * sin,
        y: harpoon.y + localX * sin + localY * cos
    };
}

/**
 * 绘制船
 */
function drawBoat() {
    const displayLevel = currentBoatLevel;
    const boatImage = getBoatImage(displayLevel);
    const boatRect = getBoatRect(displayLevel);
    
    if (boatImage) {
        ctx.drawImage(boatImage, boatRect.x, boatRect.y, boatRect.width, boatRect.height);
        
        // 如果船破损，绘制破洞效果（非升级状态）
        if (boatIsDamaged && currentBoatLevel > 0 && !isUpgrading) {
            const holeSize = Math.min(70, boatRect.width * 0.18, boatRect.height * 0.35);
            if (images.hole) {
                // 使用破洞图片
                ctx.drawImage(images.hole, boat.x - holeSize / 2, boat.y - holeSize * 0.2, holeSize, holeSize);
            } else {
                // 备用绘制圆形破洞
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.beginPath();
                ctx.arc(boat.x, boat.y + holeSize * 0.25, holeSize * 0.36, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // 绘制升级动画效果
    drawUpgradeAnimation();
}

/**
 * 绘制升级动画（锤子和烟雾）
 */
function drawUpgradeAnimation() {
    if (!isUpgrading) return;
    
    // 绘制烟雾粒子
    for (const smoke of smokeParticles) {
        ctx.save();
        ctx.globalAlpha = smoke.life * 0.6;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(smoke.x, smoke.y, smoke.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加白色外圈
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }
    
    // 绘制锤子
    if (images.hammer) {
        for (const hammer of hammers) {
            ctx.save();
            ctx.translate(hammer.x, hammer.y);
            ctx.rotate(hammer.angle);
            ctx.scale(hammer.scale, hammer.scale);
            ctx.drawImage(images.hammer, -30, -15, 60, 30);
            ctx.restore();
        }
    }
}

/**
 * 绘制鱼叉和鱼线
 */
function drawHarpoon() {
    // 鱼竿位置（连接点）
    const linePoint = getBoatPoint('line');
    const harpoonMetrics = getHarpoonMetrics(linePoint);
    const ringPoint = harpoonMetrics ? getHarpoonRingPoint(harpoonMetrics) : harpoon;

    // 绘制黑色鱼线
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(linePoint.x, linePoint.y);
    ctx.lineTo(ringPoint.x, ringPoint.y);
    ctx.stroke();

    if (!harpoonMetrics) return;

    // 保存当前绘图状态
    ctx.save();
    ctx.translate(harpoon.x, harpoon.y);
    ctx.rotate(harpoonMetrics.rotation);

    // 绘制鱼叉
    ctx.drawImage(
        harpoonMetrics.image,
        -harpoonMetrics.width / 2,
        -harpoonMetrics.height,
        harpoonMetrics.width,
        harpoonMetrics.height
    );
    ctx.restore();
}

/**
 * 绘制圆角矩形（兼容旧版Canvas API）
 * @param {number} x - 左上角X坐标
 * @param {number} y - 左上角Y坐标
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @param {number} radius - 圆角半径
 */
function drawRoundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

/**
 * 绘制所有鱼
 */
/**
 * 绘制水波效果
 */
function drawWaterRipples() {
    waterRipples.forEach(ripple => {
        ctx.save();
        // 使用更鲜艳的颜色（白色到蓝色渐变）
        ctx.strokeStyle = `rgba(200, 220, 255, ${ripple.opacity})`;
        ctx.lineWidth = ripple.lineWidth || 3;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 添加内层高亮效果
        if (ripple.opacity > 0.5) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity * 0.6})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius - 2, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    });
}

function drawFish() {
    fishArray.forEach(fish => {
        ctx.save();
        ctx.translate(fish.x, fish.y);

        // 绘制鱼雷或普通鱼
        if (fish.isTorpedo) {
            // 鱼雷图片本身是向左的，向右移动时需要水平翻转
            if (fish.direction === 1) {
                ctx.scale(-1, 1);
            }
            ctx.drawImage(fish.image, -fish.width / 2, -fish.height / 2, fish.width, fish.height);
        } else {
            // 绘制鱼图片
            ctx.drawImage(fish.image, -fish.width / 2, -fish.height / 2, fish.width, fish.height);
            
            // 根据鱼的大小计算字体大小（适配鱼的尺寸）
            let fontSize = Math.max(10, Math.min(28, fish.width * 0.14)); // 字体大小范围：10px ~ 28px
            
            // 检查单词长度，确保单词宽度不超过鱼宽度的3/5
            ctx.font = `bold ${fontSize}px Arial`;
            const maxTextWidth = fish.width * 0.6; // 单词最大宽度为鱼宽度的3/5
            let textWidth = ctx.measureText(fish.word).width;
            
            // 如果单词太长，减小字体大小
            while (textWidth > maxTextWidth && fontSize > 8) {
                fontSize -= 1;
                ctx.font = `bold ${fontSize}px Arial`;
                textWidth = ctx.measureText(fish.word).width;
            }
            
            // 只绘制单词文字（无背景和边框）
            ctx.fillStyle = '#333';
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            
            // 绘制单词文字（始终正向显示）
            ctx.fillText(fish.word, 0, fontSize / 3);
        }
        
        ctx.restore();
    });
}

/**
 * 绘制UI界面（时间、得分、关卡、爱心）
 */
function drawUI() {
    drawEndGameButton();
    drawStatusBar();
    drawLivesBar();
}

function drawHudPanel({ x, y, width, height, radius }) {
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, HUD_COLORS.top);
    gradient.addColorStop(1, HUD_COLORS.bottom);

    ctx.save();
    ctx.shadowColor = 'rgba(4, 67, 108, 0.28)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    roundedRectPath(x, y, width, height, radius);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = HUD_COLORS.border;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function drawStatusBar() {
    const { x, y, width, height } = STATUS_BAR;
    const items = [
        { label: 'Level', value: `${currentLevel}/${totalLevels}` },
        { label: 'Fish', value: `${fishCaughtInLevel}/${fishToCatch}` },
        { label: 'Score', value: `${score}` },
        { label: 'Time', value: `${timeLeft}s` }
    ];
    const cellWidth = width / items.length;

    drawHudPanel(STATUS_BAR);

    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 21px Arial';

    items.forEach((item, index) => {
        if (index > 0) {
            const dividerX = x + index * cellWidth;
            ctx.beginPath();
            ctx.moveTo(dividerX, y + 13);
            ctx.lineTo(dividerX, y + height - 13);
            ctx.strokeStyle = 'rgba(7, 80, 125, 0.24)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        const label = `${item.label}: `;
        const labelWidth = ctx.measureText(label).width;
        const valueWidth = ctx.measureText(item.value).width;
        const textX = x + index * cellWidth + (cellWidth - labelWidth - valueWidth) / 2;

        ctx.textAlign = 'left';
        ctx.fillStyle = HUD_COLORS.text;
        ctx.fillText(label, textX, y + height / 2 + 1);
        ctx.fillStyle = '#07304c';
        ctx.fillText(item.value, textX + labelWidth, y + height / 2 + 1);
    });

    ctx.restore();
}

function drawLivesBar() {
    const { x, y, height } = LIVES_BAR;
    const maxLives = 5;

    drawHudPanel(LIVES_BAR);

    ctx.save();
    ctx.fillStyle = HUD_COLORS.text;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Lives', x + 20, y + height / 2 + 1);

    if (images.heart) {
        for (let i = 0; i < maxLives; i++) {
            ctx.save();
            if (i >= lives) {
                ctx.filter = 'grayscale(1) brightness(0.9)';
                ctx.globalAlpha = 0.55;
            }
            ctx.drawImage(images.heart, x + 86 + i * 39, y + 13, 32, 32);
            ctx.restore();
        }
    }

    ctx.restore();
}

function roundedRectPath(x, y, width, height, radius) {
    const right = x + width;
    const bottom = y + height;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(right - radius, y);
    ctx.quadraticCurveTo(right, y, right, y + radius);
    ctx.lineTo(right, bottom - radius);
    ctx.quadraticCurveTo(right, bottom, right - radius, bottom);
    ctx.lineTo(x + radius, bottom);
    ctx.quadraticCurveTo(x, bottom, x, bottom - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function drawEndGameButton() {
    const { x, y, width, height, radius } = END_GAME_BUTTON;
    const gradient = ctx.createLinearGradient(x, y, x, y + height);

    if (isEndGameButtonHovered) {
        gradient.addColorStop(0, HUD_COLORS.hoverTop);
        gradient.addColorStop(1, HUD_COLORS.hoverBottom);
    } else {
        gradient.addColorStop(0, HUD_COLORS.top);
        gradient.addColorStop(1, HUD_COLORS.bottom);
    }

    ctx.save();
    ctx.shadowColor = 'rgba(4, 67, 108, 0.28)';
    ctx.shadowBlur = isEndGameButtonHovered ? 12 : 8;
    ctx.shadowOffsetY = 3;
    roundedRectPath(x, y, width, height, radius);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = HUD_COLORS.text;
    ctx.lineWidth = 2;
    ctx.stroke();

    const iconX = x + 30;
    const iconY = y + height / 2;
    ctx.strokeStyle = HUD_COLORS.text;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    roundedRectPath(iconX - 12, iconY - 15, 24, 30, 4);
    ctx.stroke();

    ctx.lineWidth = 2;
    [-7, 0, 7].forEach(offsetY => {
        ctx.beginPath();
        ctx.moveTo(iconX - 5, iconY + offsetY);
        ctx.lineTo(iconX + 6, iconY + offsetY);
        ctx.stroke();
    });

    ctx.fillStyle = HUD_COLORS.text;
    ctx.font = 'bold 21px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('学习报告', x + 101, y + height / 2 + 1);
    ctx.restore();
}

function isEndGameButtonHit(x, y) {
    return x >= END_GAME_BUTTON.x &&
        x <= END_GAME_BUTTON.x + END_GAME_BUTTON.width &&
        y >= END_GAME_BUTTON.y &&
        y <= END_GAME_BUTTON.y + END_GAME_BUTTON.height;
}

/**
 * 重置鱼叉位置（回到初始状态）
 */
function resetHarpoon() {
    resetHarpoonToBoat();
    harpoon.isFlying = false;
}

/**
 * 发射鱼叉
 * @param {number} targetX - 目标X坐标
 * @param {number} targetY - 目标Y坐标
 */
function launchHarpoon(targetX, targetY) {
    harpoon.isFlying = true;
    harpoon.targetX = targetX;
    harpoon.targetY = targetY;
}

/**
 * 更新鱼叉位置（飞行中）
 */
function updateHarpoon() {
    if (!harpoon.isFlying) return;

    // 计算到目标的距离
    const dx = harpoon.targetX - harpoon.x;
    const dy = harpoon.targetY - harpoon.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 飞行过程中持续检测碰撞
    if (checkHit(harpoon.x, harpoon.y)) {
        // 如果击中了鱼，重置鱼叉
        resetHarpoon();
        return;
    }

    // 到达目标附近时重置鱼叉
    if (distance < 10) {
        resetHarpoon();
    } else {
        // 向目标移动（带缓动效果，受游戏速度影响）
        harpoon.x += dx * 0.1 * gameSpeed;
        harpoon.y += dy * 0.1 * gameSpeed;
    }
}

/**
 * 检查鱼叉是否击中目标
 * @param {number} x - 鱼叉位置X
 * @param {number} y - 鱼叉位置Y
 * @returns {boolean} - 是否击中了鱼
 */
function checkHit(x, y) {
    let hit = false;
    
    fishArray.forEach(fish => {
        // 跳过已经处于特殊状态的鱼
        if (fish.state !== 'normal') return;
        
        // 计算鱼叉与鱼的碰撞（使用矩形碰撞检测）
        const harpoonSize = 15; // 鱼叉的碰撞范围（半径）
        const fishLeft = fish.x - fish.width / 2;
        const fishRight = fish.x + fish.width / 2;
        const fishTop = fish.y - fish.height / 2;
        const fishBottom = fish.y + fish.height / 2;
        
        // 检查鱼叉是否在鱼的矩形范围内（稍微扩大一点范围，更灵敏）
        const isHit = x >= fishLeft - harpoonSize && 
                      x <= fishRight + harpoonSize && 
                      y >= fishTop - harpoonSize && 
                      y <= fishBottom + harpoonSize;

        // 击中检测
        if (isHit) {
            hit = true;
            
            // 击中鱼雷
            if (fish.isTorpedo) {
                lives--;
                playSoundEffect('fishlei'); // 播放鱼雷音效
                
                // 处理船破损/降级（击中鱼雷也算错误）
                handleBoatDamage();
                
                // 创建水波效果
                createWaterRipple(fish.x, fish.y);
                
                // 让周围的鱼加速离开
                scareNearbyFish(fish.x, fish.y);
                
                // 鱼雷直接消失（不移动到船）
                fish.toRemove = true;
                
                if (lives <= 0) {
                    setTimeout(() => endGame('lose'), 500);
                }
                return;
            }

            // 击中普通鱼
            if (fish.word === targetWord) {
                // 正确单词 - 标记为被捕获，随鱼叉移动到船的位置
                fish.state = 'caught';
                fish.targetX = boat.x;
                fish.targetY = boat.y;
                
                score++;
                fishCaughtInLevel++;
                
                // 记录本关已捕获的单词（不再出现）
                if (!caughtWordsInLevel.includes(targetWord)) {
                    caughtWordsInLevel.push(targetWord);
                }
                
                // 重置连续错误计数（答对了）
                resetConsecutiveErrors();
                
                // 记录已掌握单词
                if (!masteredWords.includes(targetWord)) {
                    masteredWords.push(targetWord);
                }
                
                // 停止重复播放（因为已经击中了正确的鱼）
                stopRepeatAudio();
                
                // 停止当前正在播放的音频（防止与音效和下一个单词音频重叠）
                if (currentAudio) {
                    if (currentAudio._cancelled !== undefined) {
                        currentAudio._cancelled = true;
                    }
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                    currentAudio = null;
                }
                
                // 播放音效
                playSoundEffect('fishright').then(() => {
                    if (gameState !== 'playing') return;

                    // 音效播放完后检查船升级
                    const willUpgrade = checkBoatUpgrade();
                    
                    // 计算下一个单词的播放延迟（考虑升级动画时间）
                    let delay = 1000;
                    if (willUpgrade) {
                        // 如果要升级，等待升级动画完成（约5秒）+ 1秒
                        delay = 2000;
                    }
                    
                    setTimeout(() => {
                        if (fishCaughtInLevel >= fishToCatch) {
                            levelComplete();
                        } else {
                            playTargetWord();
                        }
                    }, delay);
                });
            } else {
                // 错误单词 - 标记为挣扎状态
                fish.state = 'wrong';
                fish.shakeTime = 30; // 晃动30帧（约0.5秒）
                fish.originalSpeed = fish.speed;
                fish.speed *= 2; // 加速逃跑
                
                lives--;
                fishCaughtInLevel++; // 算完成这个单词
                
                // 处理船破损/降级
                handleBoatDamage();
                
                // 记录未掌握单词（当前目标单词）
                if (!unmasteredWords.includes(targetWord)) {
                    unmasteredWords.push(targetWord);
                }
                
                // 让目标单词鱼快速离开画面
                fishArray.forEach(f => {
                    if (f.word === targetWord && f.state === 'normal') {
                        f.speed *= 4; // 4倍速度快速离开
                        f.state = 'wrong'; // 标记为错误状态，后续会被移除
                    }
                });
                
                // 停止重复播放当前单词
                stopRepeatAudio();
                
                // 立即清空目标单词，防止在延迟期间再次被错误击中
                targetWord = '';
                
                // 停止当前正在播放的音频
                if (currentAudio) {
                    if (currentAudio._cancelled !== undefined) {
                        currentAudio._cancelled = true;
                    }
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                    currentAudio = null;
                }
                
                // 播放音效
                playSoundEffect('fishwrong');
                
                // 1秒后播放下一个单词（不管音效是否播放完成）
                setTimeout(() => {
                    if (gameState !== 'playing') return;

                    if (lives <= 0) {
                        endGame('lose');
                    } else if (fishCaughtInLevel >= fishToCatch) {
                        levelComplete();
                    } else {
                        playTargetWord();
                    }
                }, 1000);
            }
        }
    });

    // 移除已处理完的鱼（被捕获或逃出画面）
    fishArray = fishArray.filter(fish => {
        if (fish.state === 'caught' && fish.toRemove) return false;
        if (fish.state === 'wrong' && (fish.x < -100 || fish.x > DESIGN_WIDTH + 100)) return false;
        return true;
    });

    // 只有到达目标位置且没有击中任何东西时才扣血
    // 飞行过程中未击中不扣血
    return hit;
}

/**
 * 播放目标单词音频（直接从单词列表中选择，不等待鱼出现）
 */
function playTargetWord() {
    if (gameState !== 'playing' && gameState !== 'tutorial') return;

    // 从音频文件列表中获取未使用过的单词
    const activeWords = getActiveAudioFiles();
    const availableWords = activeWords.filter(word => !usedWords.includes(word));
    
    // 如果所有单词都已使用过，重置已使用单词列表（从头开始）
    if (availableWords.length === 0) {
        usedWords = [];
        return playTargetWord(); // 重新调用
    }
    
    // 随机选择一个未使用过的单词作为目标
    targetWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    // 将该单词标记为已使用
    usedWords.push(targetWord);
    
    // 记录参与过的正确单词总数（去重）
    const allTargetWords = [...new Set([...masteredWords, ...unmasteredWords, targetWord])];
    totalTargetWords = allTargetWords.length;
    
    // 播放目标单词音频
    playAudio(targetWord);
    
    // 启动重复播放定时器（每2秒播放一次）
    startRepeatAudio();
}

/**
 * 启动重复播放音频定时器
 */
function startRepeatAudio() {
    // 清除之前的定时器
    clearInterval(repeatAudioTimer);
    
    // 每2秒重复播放当前单词
    repeatAudioTimer = setInterval(() => {
        if (targetWord && gameState === 'playing') {
            playAudio(targetWord);
        }
    }, 3000);
}

/**
 * 停止重复播放音频
 */
function stopRepeatAudio() {
    clearInterval(repeatAudioTimer);
    
    // 停止当前正在播放的音频（确保万无一失）
    if (currentAudio) {
        // 标记音频为已取消（防止oncanplay回调后继续播放）
        if (currentAudio._cancelled !== undefined) {
            currentAudio._cancelled = true;
        }
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}

function resetWordSelectionState() {
    usedWords = [];
    caughtWordsInLevel = [];
    targetWord = '';
    stopRepeatAudio();
}

/**
 * 关卡完成处理
 */
function levelComplete() {
    if (gameState !== 'playing') return;

    // 清除所有定时器
    clearInterval(gameTimer);
    clearInterval(spawnTimer);
    cancelAnimationFrame(animationId);
    
    // 检查是否通关所有关卡
    if (currentLevel >= totalLevels) {
        endGame('win');
    } else {
        showLevelComplete();
    }
}

/**
 * 显示关卡完成界面
 */
function showLevelComplete() {
    const overlay = document.getElementById('resultOverlay');
    const title = document.getElementById('resultTitle');
    const scoreText = document.getElementById('resultScore');
    const whaleImage = document.getElementById('whaleImage');
    const buttons = document.getElementById('resultButtons');
    const reportContent = document.getElementById('reportContent');
    
    // 隐藏成绩列表内容
    reportContent.innerHTML = '';
    
    // 显示结算界面元素
    title.style.display = 'none'; // 隐藏标题，只显示得分
    scoreText.style.display = 'block';
    scoreText.textContent = `Final Score: ${score}`;
    whaleImage.style.display = 'block';
    buttons.innerHTML = '';
    buttons.style.display = 'none';
    
    overlay.style.display = 'flex';

    clearTimeout(levelTransitionTimer);
    levelTransitionTimer = setTimeout(() => {
        levelTransitionTimer = null;
        nextLevel();
    }, 1000);
}

/**
 * 返回上一关
 */
function prevLevel() {
    if (currentLevel > 1) {
        currentLevel--;
    }
    startLevel();
}

/**
 * 重新开始当前关卡
 */
function restartLevel() {
    startLevel();
}

/**
 * 进入下一关
 */
function nextLevel() {
    currentLevel++;
    startLevel();
}

function startGameplayTimers() {
    clearInterval(gameTimer);
    clearInterval(spawnTimer);

    const timerInterval = Math.round(1000 / gameSpeed);
    gameTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            endGame('lose');
        }
    }, timerInterval);

    const spawnInterval = Math.round(3000 / gameSpeed);
    spawnTimer = setInterval(spawnFish, spawnInterval);
}

/**
 * 开始关卡
 */
function startLevel() {
    clearTimeout(levelTransitionTimer);
    levelTransitionTimer = null;

    const overlay = document.getElementById('resultOverlay');
    overlay.style.display = 'none';
    
    // 清除之前的定时器（防止切换关卡时多个定时器同时运行）
    clearInterval(gameTimer);
    clearInterval(spawnTimer);
    cancelAnimationFrame(animationId);
    stopRepeatAudio(); // 停止之前的重复播放
    stopReportNarration();
    
    // 重置关卡状态
    fishCaughtInLevel = 0;
    fishArray = [];
    caughtWordsInLevel = [];  // 重置本关已捕获的单词
    resetHarpoon();
    
    // 重置时间（lives不在这里重置，保持跨关卡的生命值）
    timeLeft = 60;
    gameState = 'playing';
    
    // 启动倒计时和鱼生成定时器（受游戏速度影响）
    startGameplayTimers();
    
    // 先播放目标单词，然后生成鱼（确保目标单词已设置）
    setTimeout(() => {
        playTargetWord();
        setTimeout(spawnFish, 500);
    }, 500);
    
    // 启动游戏循环
    gameLoop();
}

/**
 * 从手动打开的报告页继续当前挑战
 */
function continueChallenge() {
    if (gameState !== 'report' || reportResult !== 'quit') return;

    const overlay = document.getElementById('resultOverlay');
    const reportContent = document.getElementById('reportContent');
    stopReportNarration();
    overlay.style.display = 'none';
    reportContent.innerHTML = '';

    reportResult = null;
    gameState = 'playing';
    playBackgroundMusic();
    startGameplayTimers();

    if (targetWord) {
        playAudio(targetWord);
        startRepeatAudio();
    } else {
        playTargetWord();
    }

    if (fishArray.length === 0) {
        setTimeout(() => {
            if (gameState === 'playing') spawnFish();
        }, 300);
    }

    gameLoop();
}

/**
 * 从报告页返回年级选择并彻底重置
 */
function replayFromReport() {
    goHome();
}

/**
 * 返回首页
 */
function goHome() {
    // 中途返回首页只计参与，不计完成。
    if (gameTracker) gameTracker.abandon();

    clearTimeout(levelTransitionTimer);
    levelTransitionTimer = null;
    clearInterval(gameTimer);
    clearInterval(spawnTimer);
    cancelAnimationFrame(animationId);
    stopRepeatAudio();
    stopReportNarration();

    // 重置游戏状态
    gameState = 'start';
    reportResult = null;
    score = 0;
    timeLeft = 60;
    lives = 5;
    currentLevel = 1;
    fishCaughtInLevel = 0;
    resetWordSelectionState();
    fishArray = [];
    waterRipples = [];
    resetBoatProgress();
    boat.x = DESIGN_WIDTH / 2;
    resetHarpoon();
    isStartingGame = false;
    
    // 重置成绩统计变量
    masteredWords = [];
    unmasteredWords = [];
    totalTargetWords = 0;
    
    // 隐藏结果界面，重新显示年级选择界面
    const resultOverlay = document.getElementById('resultOverlay');
    const reportContent = document.getElementById('reportContent');
    resultOverlay.style.display = 'none';
    reportContent.innerHTML = '';

    ctx.clearRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    drawBackground();
    drawBoat();
    showGradeSelector();
    
    // 重新播放背景音乐
    playBackgroundMusic();
}

/**
 * 重新开始游戏
 */
function restartGame() {
    stopReportNarration();

    // 重置游戏状态
    score = 0;
    timeLeft = 60;
    lives = 5;
    currentLevel = 1;
    fishCaughtInLevel = 0;
    usedWords = [];
    fishArray = [];
    resetBoatProgress();
    
    // 重置成绩统计变量
    masteredWords = [];
    unmasteredWords = [];
    totalTargetWords = 0;
    
    // 隐藏结果界面
    const resultOverlay = document.getElementById('resultOverlay');
    resultOverlay.style.display = 'none';
    
    // 重新开始视为一局新的游戏会话。
    if (gameTracker) gameTracker.start();

    // 开始第一关
    startLevel();
    
    // 重新播放背景音乐
    playBackgroundMusic();
}

/**
 * 分享得分
 */
function shareScore() {
    // 创建分享文本
    const shareText = `我在钓鱼游戏中获得了 ${score} 分！快来挑战吧！`;
    
    // 尝试使用Web Share API
    if (navigator.share) {
        navigator.share({
            title: '钓鱼游戏',
            text: shareText,
        }).catch(() => {
            // 如果分享失败，复制到剪贴板
            copyToClipboard(shareText);
        });
    } else {
        // 不支持Web Share API，复制到剪贴板
        copyToClipboard(shareText);
    }
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('得分已复制到剪贴板！');
    }).catch(() => {
        alert(`得分：${score} 分`);
    });
}

/**
 * 结束游戏
 * @param {string} result - 游戏结果: 'win' 或 'lose'
 */
function endGame(result) {
    if (gameState !== 'playing') return;

    const isNaturalEnd = result !== 'quit';
    const finalScore = score;

    // 清除所有定时器
    clearTimeout(levelTransitionTimer);
    levelTransitionTimer = null;
    clearInterval(gameTimer);
    clearInterval(spawnTimer);
    cancelAnimationFrame(animationId);
    stopRepeatAudio(); // 停止重复播放音频
    // 背景音乐保持播放，并在学习报告界面继续循环。
    
    // 显示成绩列表界面
    showReport(result);

    if (!isNaturalEnd) return;

    if (gameTracker) gameTracker.finish(finalScore);
    
    // 延迟上报得分（给用户看结果的时间）
    setTimeout(() => {
        if (typeof onReport === 'function') {
            onReport(finalScore);
        }
    }, 1000);
}

/**
 * 显示成绩列表界面
 */
function showReport(result) {
    stopReportNarration();
    gameState = 'report';
    reportResult = result;
    
    const overlay = document.getElementById('resultOverlay');
    const title = document.getElementById('resultTitle');
    const scoreText = document.getElementById('resultScore');
    const whaleImage = document.getElementById('whaleImage');
    const buttons = document.getElementById('resultButtons');
    const reportContent = document.getElementById('reportContent');
    
    // 隐藏结算界面的元素
    title.style.display = 'none';
    scoreText.style.display = 'none';
    whaleImage.style.display = 'none';
    buttons.style.display = 'none';
    
    // 构建未掌握单词字符串
    const unmasteredText = unmasteredWords.length > 0 
        ? unmasteredWords.join('、') 
        : '无';
    
    // 构建已掌握单词字符串
    const masteredText = masteredWords.length > 0 
        ? masteredWords.join('、') 
        : '无';
    
    // 计算掌握进度
    const masteredCount = masteredWords.length;
    const totalCount = masteredWords.length + unmasteredWords.length;
    const progressText = `单词掌握进度：${masteredCount}/${totalCount > 0 ? totalCount : 0}`;
    const reportActions = result === 'quit'
        ? `
            <div class="report-actions">
                <button type="button" class="report-action-button" onclick="continueChallenge()">继续挑战</button>
                <button type="button" class="report-action-button" onclick="replayFromReport()">再玩一次</button>
            </div>
        `
        : `
            <div class="report-actions">
                <button type="button" class="report-action-button" onclick="replayFromReport()">再玩一次</button>
            </div>
        `;
    
    // 设置成绩列表内容
    reportContent.innerHTML = `
        <div class="report-container">
            <img src="assets/image/report.png" alt="成绩报告" class="report-bg">
            
            <!-- 未掌握单词区域 -->
            <div class="unmastered-section">
                <span class="unmastered-label">未掌握单词：</span>
                <div class="unmastered-content notranslate" lang="en" translate="no">${unmasteredText}</div>
            </div>
            
            <!-- 已掌握单词区域 -->
            <div class="mastered-section">
                <span class="mastered-label">已掌握单词：</span>
                <div class="mastered-scroll notranslate" lang="en" translate="no">${masteredText}</div>
            </div>
            
            <!-- 掌握进度 -->
            <div class="report-progress">${progressText}</div>

            ${reportActions}
        </div>
    `;
    
    // 显示结果界面
    overlay.style.display = 'flex';

    // 报告打开后自动播报。
    setTimeout(() => {
        if (gameState === 'report' && reportResult === result) playReportNarration();
    }, 150);
}

/**
 * 游戏主循环
 */
function gameLoop() {
    if (gameState !== 'playing' && gameState !== 'tutorial') return;
    
    // 绘制游戏元素（背景图会清除画布）
    drawBackground();
    drawWaterRipples(); // 绘制水波效果（在鱼之前绘制）
    drawFish();
    drawBoat();
    drawHarpoon();
    if (gameState === 'playing') {
        drawUI();
    } else {
        drawTutorialGuidance();
    }
    
    // 更新游戏状态
    if (gameState === 'playing') {
        updateFish();
        updateHarpoon();
        updateUpgradeAnimation(); // 更新船升级动画
    } else {
        updateTutorial();
    }
    updateWaterRipples(); // 更新水波效果
    
    // 下一帧
    animationId = requestAnimationFrame(gameLoop);
}

/**
 * 处理点击/触摸事件
 * @param {number} x - 点击位置X坐标
 * @param {number} y - 点击位置Y坐标
 */
function handleClick(x, y) {
    if (gameState !== 'playing' && gameState !== 'tutorial') return;
    
    // 初始化音频（iOS兼容）
    if (!audioInitialized) {
        audioInitialized = true;
    }

    // 结束按钮优先处理，避免同时触发发射鱼叉或拖动船
    if (gameState === 'playing' && isEndGameButtonHit(x, y)) {
        endGame('quit');
        return;
    }
    
    // 检测是否点击了船（使用实际等比绘制后的区域）
    const boatRect = getBoatRect();
    const boatLeft = boatRect.x;
    const boatRight = boatRect.x + boatRect.width;
    const boatTop = boatRect.y;
    const boatBottom = boatRect.y + boatRect.height;
    
    if (x >= boatLeft && x <= boatRight && y >= boatTop && y <= boatBottom) {
        // 点击了船，开始拖动
        if (gameState === 'playing' || tutorialStep === 0 || tutorialStep === 2) {
            isDraggingBoat = true;
            tutorialLastBoatX = boat.x;
            if (gameState === 'tutorial' && tutorialStep === 0) {
                tutorialBoatPressed = true;
            } else if (gameState === 'tutorial' && tutorialStep === 2) {
                markTutorialInteraction();
            }
        }
        return; // 点击船不发射鱼叉
    }

    if (gameState === 'tutorial') {
        handleTutorialClick(x, y);
        return;
    }
    
    // 只有鱼叉不在飞行时才能发射
    if (!harpoon.isFlying) {
        launchHarpoon(x, y);
    }
}

/**
 * 处理鼠标/触摸移动事件（拖动船）
 * @param {number} x - 鼠标位置X坐标
 * @param {number} y - 鼠标位置Y坐标
 */
function handleMouseMove(x, y) {
    if ((gameState !== 'playing' && gameState !== 'tutorial') || !isDraggingBoat) return;
    
    // 移动船的位置（保持Y坐标不变，限制在画面范围内）
    const boatRect = getBoatRect();
    const halfWidth = boatRect.width / 2;
    const minX = halfWidth;
    const maxX = DESIGN_WIDTH - halfWidth;
    boat.x = Math.max(minX, Math.min(maxX, x));

    if (gameState === 'tutorial') {
        const boatMoveDistance = Math.abs(boat.x - tutorialLastBoatX);
        tutorialDragDistance += boatMoveDistance;
        tutorialLastBoatX = boat.x;

        if (tutorialStep === 0 && boatMoveDistance > 2) {
            tutorialBoatMoved = true;
        }

        if (tutorialStep === 0 && tutorialPhase === 'move' && tutorialDragDistance >= 180) {
            completeTutorialMoveStep();
        } else if (tutorialStep === 2 && tutorialPhase === 'move-to-safe' && boat.x <= 500) {
            tutorialPhase = 'aim';
            setTutorialHud('新手训练 3/3');
        }
    }
    
    // 如果鱼叉不在飞行状态，同步移动鱼叉位置
    if (!harpoon.isFlying) {
        resetHarpoonToBoat();
    }
}

/**
 * 处理鼠标/触摸松开事件
 */
function handleMouseUp() {
    isDraggingBoat = false;
}

/**
 * 将鼠标/触摸坐标转换为Canvas坐标
 * @param {Event} e - 事件对象
 * @returns {Object} - {x, y} 坐标对象
 */
function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = DESIGN_WIDTH / rect.width;
    const scaleY = DESIGN_HEIGHT / rect.height;
    
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

// 鼠标按下事件（开始拖动）
canvas.addEventListener('mousedown', (e) => {
    const coords = getCanvasCoordinates(e);
    handleClick(coords.x, coords.y);
});

// 鼠标移动事件（拖动中）
canvas.addEventListener('mousemove', (e) => {
    const coords = getCanvasCoordinates(e);
    isEndGameButtonHovered = gameState === 'playing' && isEndGameButtonHit(coords.x, coords.y);
    canvas.style.cursor = isEndGameButtonHovered ? 'pointer' : 'default';
    handleMouseMove(coords.x, coords.y);
});

// 鼠标松开事件（结束拖动）
canvas.addEventListener('mouseup', () => {
    handleMouseUp();
});

// 鼠标离开画布时也结束拖动
canvas.addEventListener('mouseleave', () => {
    isEndGameButtonHovered = false;
    canvas.style.cursor = 'default';
    handleMouseUp();
});

// 触摸开始事件
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const coords = getCanvasCoordinates(touch);
    handleClick(coords.x, coords.y);
});

// 触摸移动事件（拖动中）
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const coords = getCanvasCoordinates(touch);
    handleMouseMove(coords.x, coords.y);
});

// 触摸结束事件
canvas.addEventListener('touchend', () => {
    handleMouseUp();
});

/** 更新屏幕顶部的教学步骤。 */
function setTutorialHud(progress) {
    const progressElement = document.getElementById('tutorialProgress');
    if (progressElement) progressElement.textContent = progress;
}

/** 创建位置固定的教学鱼。 */
function createTutorialFish({ x, y, word = '', role, imageIndex = 2, direction = 1, width = 230, isTorpedo = false }) {
    const fishImages = direction === 1 ? images.fishRight : images.fishLeft;
    const image = isTorpedo ? images.torpedo : fishImages[Math.min(imageIndex, fishImages.length - 1)];
    const imageRatio = image && image.width ? image.height / image.width : 0.5;

    return {
        x,
        y,
        width,
        height: width * imageRatio,
        speed: 0,
        direction,
        word,
        image,
        isTorpedo,
        state: 'normal',
        shakeTime: 0,
        carryOffset: { x: 0, y: 0 },
        tutorialRole: role
    };
}

/**
 * 启动可交互的新手关，完成或跳过后再进入正式第一关。
 * @param {Function} onFinish - 教学结束后的回调
 */
function showTutorial(onFinish) {
    clearInterval(gameTimer);
    clearInterval(spawnTimer);
    cancelAnimationFrame(animationId);
    stopRepeatAudio();

    tutorialShownThisSession = true;
    tutorialFinishCallback = onFinish;
    tutorialWord = getActiveAudioFiles()[0] || 'apple';
    gameState = 'tutorial';

    const hud = document.getElementById('tutorialHud');
    if (hud) hud.hidden = false;

    setTutorialStep(0);
    gameLoop();
}

/** 按照教学进度布置一个简化、可操作的游戏场景。 */
function setTutorialStep(step) {
    clearTimeout(tutorialTransitionTimer);
    clearTimeout(tutorialMessageTimer);
    stopTutorialRepeatAudio();
    tutorialStep = step;
    tutorialMessage = '';
    tutorialDragDistance = 0;
    tutorialBoatPressed = false;
    tutorialBoatMoved = false;
    tutorialHasInteracted = false;
    isDraggingBoat = false;
    waterRipples = [];
    resetHarpoon();

    if (step === 0) {
        tutorialPhase = 'move';
        boat.x = DESIGN_WIDTH / 2;
        fishArray = [];
        resetHarpoonToBoat();
        tutorialLastBoatX = boat.x;
        setTutorialHud('新手训练 1/3');
    } else if (step === 1) {
        tutorialPhase = 'catch';
        boat.x = DESIGN_WIDTH / 2;
        fishArray = [createTutorialFish({
            x: 820,
            y: 630,
            word: tutorialWord,
            role: 'target',
            imageIndex: 2,
            direction: 1,
            width: 255
        })];
        resetHarpoonToBoat();
        setTutorialHud('新手训练 2/3');
        playAudio(tutorialWord);
    } else {
        const wrongWord = getActiveAudioFiles().find(word => word !== tutorialWord) || 'book';
        tutorialPhase = 'move-to-safe';
        boat.x = DESIGN_WIDTH / 2;
        fishArray = [
            createTutorialFish({ x: 955, y: 490, role: 'torpedo', width: 175, isTorpedo: true, direction: -1 }),
            createTutorialFish({ x: 1160, y: 590, word: wrongWord, role: 'wrong', imageIndex: 5, direction: -1, width: 225 }),
            createTutorialFish({ x: 900, y: 720, word: tutorialWord, role: 'target', imageIndex: 2, direction: 1, width: 225 })
        ];
        resetHarpoonToBoat();
        setTutorialHud('新手训练 3/3');
        // 玩家操作前持续提示本轮正确单词。
        startTutorialRepeatAudio();
    }
}

/** 第3步进入后立即播放，并在玩家操作前每3秒重复一次。 */
function startTutorialRepeatAudio() {
    stopTutorialRepeatAudio();
    playAudio(tutorialWord);
    tutorialRepeatAudioTimer = setInterval(() => {
        if (gameState === 'tutorial' && tutorialStep === 2 && !tutorialHasInteracted) {
            playAudio(tutorialWord);
        }
    }, 3000);
}

function stopTutorialRepeatAudio() {
    if (tutorialRepeatAudioTimer) {
        clearInterval(tutorialRepeatAudioTimer);
        tutorialRepeatAudioTimer = null;
    }
}

/** 首次按船、拖动或点击海中目标时停止教学单词循环。 */
function markTutorialInteraction() {
    if (tutorialStep !== 2 || tutorialHasInteracted) return;
    tutorialHasInteracted = true;
    stopTutorialRepeatAudio();
}

/** 教学阶段点击海面时，按当前任务决定是否发射鱼叉。 */
function handleTutorialClick(x, y) {
    if (tutorialPhase === 'success' || tutorialPhase === 'retry' || harpoon.isFlying) return;

    if (tutorialStep === 1) {
        const target = fishArray.find(fish => fish.tutorialRole === 'target');
        if (target && isPointInsideFish(x, y, target, 25)) {
            launchHarpoon(target.x, target.y);
        } else {
            showTutorialMessage('请点击发光的单词鱼', 'warning', 900);
        }
    } else if (tutorialStep === 2 && y > 330) {
        markTutorialInteraction();
        launchHarpoon(x, y);
    }
}

function isPointInsideFish(x, y, fish, padding = 15) {
    return x >= fish.x - fish.width / 2 - padding &&
           x <= fish.x + fish.width / 2 + padding &&
           y >= fish.y - fish.height / 2 - padding &&
           y <= fish.y + fish.height / 2 + padding;
}

/** 玩家完成拖船动作后，自动开放点击鱼任务。 */
function completeTutorialMoveStep() {
    tutorialPhase = 'success';
    isDraggingBoat = false;
    showTutorialMessage('移动成功！', 'success');
    tutorialTransitionTimer = setTimeout(() => {
        if (gameState === 'tutorial' && tutorialStep === 0) setTutorialStep(1);
    }, 800);
}

/** 更新教学鱼叉并进行真实路径碰撞判断。 */
function updateTutorial() {
    if (!harpoon.isFlying) return;

    const hitFish = fishArray.find(fish => fish.state === 'normal' && isPointInsideFish(harpoon.x, harpoon.y, fish));
    if (hitFish) {
        resetHarpoon();
        handleTutorialHit(hitFish);
        return;
    }

    const dx = harpoon.targetX - harpoon.x;
    const dy = harpoon.targetY - harpoon.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 10) {
        resetHarpoon();
    } else {
        harpoon.x += dx * 0.1;
        harpoon.y += dy * 0.1;
    }
}

/** 处理教学关中的正确命中或障碍碰撞。 */
function handleTutorialHit(fish) {
    createWaterRipple(fish.x, fish.y);

    if (fish.tutorialRole === 'target') {
        tutorialPhase = 'success';
        showTutorialMessage(tutorialStep === 1 ? '钓到了！' : '安全命中，教学完成！', 'success');
        playSoundEffect('fishright');

        tutorialTransitionTimer = setTimeout(() => {
            if (gameState !== 'tutorial') return;
            if (tutorialStep === 1) {
                setTutorialStep(2);
            } else {
                finishTutorial();
            }
        }, tutorialStep === 1 ? 900 : 1200);
        return;
    }

    tutorialPhase = 'retry';
    showTutorialMessage('碰到障碍，请再试一次', 'error');
    playSoundEffect(fish.isTorpedo ? 'fishlei' : 'fishwrong');

    tutorialTransitionTimer = setTimeout(() => {
        if (gameState !== 'tutorial' || tutorialStep !== 2) return;
        tutorialMessage = '';
        tutorialPhase = boat.x <= 500 ? 'aim' : 'move-to-safe';
    }, 1000);
}

/** 在场景中央短暂显示操作反馈。 */
function showTutorialMessage(message, type = 'success', duration = 0) {
    clearTimeout(tutorialMessageTimer);
    tutorialMessage = message;
    tutorialMessageType = type;
    if (duration > 0) {
        tutorialMessageTimer = setTimeout(() => {
            if (gameState === 'tutorial') tutorialMessage = '';
        }, duration);
    }
}

function drawTutorialArrow(startX, endX, y, color) {
    const direction = Math.sign(endX - startX) || 1;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(endX, y);
    ctx.lineTo(endX - direction * 30, y - 22);
    ctx.lineTo(endX - direction * 30, y + 22);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawTutorialLabel(x, y, text, background = 'rgba(5, 52, 82, 0.9)', color = '#fff') {
    ctx.save();
    ctx.font = 'bold 24px "Microsoft YaHei", Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const width = ctx.measureText(text).width + 34;
    drawRoundRect(x - width / 2, y - 22, width, 44, 22);
    ctx.fillStyle = background;
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillText(text, x, y + 1);
    ctx.restore();
}

function drawTutorialHighlight(fish, color, animated = true) {
    const pulse = animated ? 1 + (Math.sin(Date.now() / 220) + 1) * 0.08 : 1;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.ellipse(fish.x, fish.y, fish.width * 0.62 * pulse, Math.max(54, fish.height * 0.75) * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

/** 在危险目标红圈右上方绘制三个固定的红色感叹号。 */
function drawTutorialDangerMarks(fish) {
    const radiusX = fish.width * 0.62;
    const radiusY = Math.max(54, fish.height * 0.75);
    ctx.save();
    ctx.font = '900 42px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#f03b35';
    ctx.strokeText('!!!', fish.x + radiusX * 0.78, fish.y - radiusY - 12);
    ctx.fillText('!!!', fish.x + radiusX * 0.78, fish.y - radiusY - 12);
    ctx.restore();
}

/** 绘制用户提供的新手教学手势素材。 */
function drawTutorialHand(x, y, size = 112) {
    const handImage = images.tutorialHand;
    const bob = Math.sin(Date.now() / 230) * 7;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 30, 55, 0.28)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;

    if (handImage && handImage.complete && handImage.width) {
        const ratio = handImage.height / handImage.width;
        ctx.drawImage(handImage, x - size / 2, y - size * ratio / 2 + bob, size, size * ratio);
    } else {
        ctx.font = `${Math.round(size * 0.68)}px "Segoe UI Emoji", "Apple Color Emoji"`;
        ctx.textAlign = 'center';
        ctx.fillText('☝️', x, y + bob);
    }
    ctx.restore();
}

/** 将手势指尖贴到鱼腹下方，避免手势与目标之间留出过大间距。 */
function drawTutorialHandBelowFish(fish, size = 104) {
    const fingertipX = fish.x + fish.width * 0.28;
    const fingertipY = fish.y + fish.height / 2 + 3;
    drawTutorialHand(
        fingertipX + size * 0.14,
        fingertipY + size * 0.12,
        size
    );
}

/** 绘制贴着游戏对象的手势、箭头、危险提示和安全路线。 */
function drawTutorialGuidance() {
    const pulse = (Math.sin(Date.now() / 230) + 1) / 2;
    ctx.save();

    if (tutorialStep === 0) {
        const boatRect = getBoatRect();
        if (!tutorialBoatMoved) {
            ctx.globalAlpha = 0.72 + pulse * 0.28;
            drawTutorialArrow(boatRect.x - 35, Math.max(70, boatRect.x - 250), boat.y + 145, '#ffe09a');
            drawTutorialArrow(boatRect.x + boatRect.width + 35, Math.min(DESIGN_WIDTH - 70, boatRect.x + boatRect.width + 250), boat.y + 145, '#ffe09a');
            ctx.globalAlpha = 1;
        }
        if (!tutorialBoatPressed) {
            drawTutorialHand(boat.x + 38, boat.y + 112, 118);
        }
        drawTutorialLabel(boat.x, boat.y + 210, '按住船身，左右拖动');
    } else if (tutorialStep === 1) {
        const target = fishArray.find(fish => fish.tutorialRole === 'target');
        if (target) {
            drawTutorialHighlight(target, '#ffe09a');
            drawTutorialHandBelowFish(target, 104);
            drawTutorialLabel(target.x, target.y - 105, '点击这条鱼', '#fff1bd', '#07304c');
        }
    } else {
        const target = fishArray.find(fish => fish.tutorialRole === 'target');
        const hazards = fishArray.filter(fish => fish.tutorialRole !== 'target');

        hazards.forEach(fish => {
            drawTutorialHighlight(fish, '#ff5148', false);
            drawTutorialDangerMarks(fish);
        });

        if (tutorialPhase === 'move-to-safe') {
            ctx.save();
            ctx.fillStyle = 'rgba(89, 235, 174, 0.16)';
            ctx.strokeStyle = 'rgba(220, 255, 230, 0.9)';
            ctx.lineWidth = 5;
            ctx.setLineDash([18, 12]);
            drawRoundRect(205, 128, 310, 210, 24);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            drawTutorialArrow(boat.x - 40, 390, boat.y + 145, '#d9ffe3');
            drawTutorialLabel(360, 365, '把船拖到安全区', '#d9ffe3', '#075c48');
        } else if (tutorialPhase === 'aim' && target) {
            ctx.save();
            ctx.strokeStyle = '#d9ffe3';
            ctx.lineWidth = 7;
            ctx.setLineDash([18, 14]);
            ctx.beginPath();
            ctx.moveTo(harpoon.x, harpoon.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
            ctx.restore();
            drawTutorialHighlight(target, '#7dffb4');
            drawTutorialHandBelowFish(target, 98);
        }
    }

    if (tutorialMessage) {
        const isError = tutorialMessageType === 'error';
        drawTutorialLabel(
            DESIGN_WIDTH / 2,
            420,
            `${isError ? '✕' : '✓'}  ${tutorialMessage}`,
            isError ? 'rgba(151, 39, 35, 0.94)' : 'rgba(7, 116, 77, 0.94)'
        );
    }

    ctx.restore();
}

/** 关闭教学场景并执行正式游戏启动回调。 */
function finishTutorial() {
    clearTimeout(tutorialTransitionTimer);
    clearTimeout(tutorialMessageTimer);
    stopTutorialRepeatAudio();
    stopRepeatAudio();
    isDraggingBoat = false;
    fishArray = [];
    waterRipples = [];
    boat.x = DESIGN_WIDTH / 2;
    resetHarpoon();

    const hud = document.getElementById('tutorialHud');
    if (hud) hud.hidden = true;

    gameState = 'start';
    const onFinish = tutorialFinishCallback;
    tutorialFinishCallback = null;
    if (onFinish) onFinish();
}

/**
 * 展示捕获数量达到阈值即可升级渔船的规则动画。
 * 动画展示初始船捕鱼；达到阈值后用黑色船形遮罩隐藏升级后的外观。
 */
function showUpgradeIntro(onFinish) {
    const overlay = document.getElementById('upgradeIntro');
    const panel = document.getElementById('upgradeIntroPanel');
    const count = document.getElementById('upgradeIntroCount');
    const targetLabel = document.getElementById('upgradeIntroTarget');
    const totalLabel = document.getElementById('upgradeIntroTotal');
    const fill = document.getElementById('upgradeIntroFill');

    if (!overlay || !panel || !count || !targetLabel || !totalLabel || !fill) {
        onFinish();
        return;
    }

    cancelAnimationFrame(upgradeIntroAnimationId);
    clearTimeout(upgradeIntroFinishTimer);
    upgradeIntroCallback = onFinish;
    gameState = 'upgradeIntro';

    const target = BOAT_UPGRADE_INTERVAL;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = reducedMotion ? 0 : 3000;
    const holdDuration = reducedMotion ? 1850 : 2800;

    targetLabel.textContent = target;
    totalLabel.textContent = target;
    count.textContent = '0';
    fill.style.transform = 'scaleX(0)';
    panel.classList.remove('is-ready');
    overlay.classList.remove('is-leaving');
    overlay.hidden = false;

    const startedAt = performance.now();
    const renderProgress = now => {
        const progress = duration === 0 ? 1 : Math.min(1, (now - startedAt) / duration);
        const displayedCount = Math.min(target, Math.floor(progress * target));

        count.textContent = displayedCount;
        fill.style.transform = `scaleX(${progress})`;

        if (progress < 1) {
            upgradeIntroAnimationId = requestAnimationFrame(renderProgress);
            return;
        }

        count.textContent = target;
        fill.style.transform = 'scaleX(1)';
        playBoatUpgradeSound();
        panel.classList.add('is-ready');
        upgradeIntroFinishTimer = setTimeout(finishUpgradeIntro, holdDuration);
    };

    upgradeIntroAnimationId = requestAnimationFrame(renderProgress);
}

function finishUpgradeIntro() {
    const overlay = document.getElementById('upgradeIntro');
    if (!overlay || overlay.hidden) return;

    cancelAnimationFrame(upgradeIntroAnimationId);
    clearTimeout(upgradeIntroFinishTimer);

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const onFinish = upgradeIntroCallback;
    upgradeIntroCallback = null;

    // 遮罩仍完全可见时先初始化并绘制正式关卡，避免淡出时露出教学关残帧。
    if (onFinish) {
        onFinish();
    } else {
        gameState = 'start';
    }

    const hideOverlay = () => {
        overlay.classList.add('is-leaving');
        upgradeIntroFinishTimer = setTimeout(() => {
            overlay.hidden = true;
            overlay.classList.remove('is-leaving');
        }, reducedMotion ? 0 : 300);
    };

    if (reducedMotion) {
        hideOverlay();
    } else {
        // 等正式关卡画布提交一帧后再开始遮罩淡出。
        upgradeIntroAnimationId = requestAnimationFrame(hideOverlay);
    }
}

document.getElementById('tutorialSkip')?.addEventListener('click', finishTutorial);

// 开始游戏按钮点击事件
let isStartingGame = false; // 防止重复点击
async function startGame() {
    if (isStartingGame) return; // 防止重复点击
    isStartingGame = true;
    
    hideGradeSelector();
    
    // 初始化游戏状态
    audioInitialized = true;
    currentLevel = 1;
    score = 0;
    lives = 5;
    fishCaughtInLevel = 0;
    resetBoatProgress();
    
    // 确保背景音乐播放（在用户交互后取消静音并播放）
    if (bgMusic) {
        bgMusic.muted = false;
        bgMusic.volume = 0.2;
        bgMusic.loop = true;
        bgMusic.play().catch(e => console.log('播放失败:', e));
    } else {
        playBackgroundMusic();
    }
    
    const beginFirstLevel = () => {
        // 教学结束并真正进入正式第一关时，才上报本局开始。
        if (gameTracker) gameTracker.start();
        startLevel();
        isStartingGame = false; // 教学结束后才解除启动锁
    };

    // 本次打开页面时，第一次进入游戏先完成新手训练。
    if (!tutorialShownThisSession) {
        showTutorial(() => showUpgradeIntro(beginFirstLevel));
    } else {
        beginFirstLevel();
    }
}

/**
 * 播放背景音乐
 */
function playBackgroundMusic() {
    if (!bgMusic) {
        bgMusic = document.getElementById('bgMusic');
    }
    
    if (!bgMusic) {
        console.error('背景音乐元素未找到！');
        return;
    }
    
    console.log('尝试播放背景音乐...');
    
    bgMusic.volume = 0.2; // 设置音量为20%,背景音乐最小
    bgMusic.loop = true;
    bgMusic.muted = false;
    
    // 尝试播放
    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log('背景音乐播放成功！');
        }).catch(err => {
            console.log('背景音乐自动播放被阻止:', err.message);
            console.log('等待用户交互后再播放...');
            
            const handleUserInteraction = () => {
                console.log('检测到用户交互，尝试播放背景音乐');
                bgMusic.muted = false;
                bgMusic.volume = 0.2;
                bgMusic.play().then(() => {
                    console.log('背景音乐在用户交互后播放成功！');
                }).catch(e => {
                    console.error('用户交互后播放仍失败:', e);
                });
                document.removeEventListener('click', handleUserInteraction);
                document.removeEventListener('touchstart', handleUserInteraction);
            };
            
            document.addEventListener('click', handleUserInteraction);
            document.addEventListener('touchstart', handleUserInteraction);
        });
    } else {
        console.log('浏览器不支持Promise方式播放音频');
    }
}

/**
 * 停止背景音乐
 */
function stopBackgroundMusic() {
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }
}

// 暴露函数到全局作用域供HTML按钮调用
window.prevLevel = prevLevel;
window.restartLevel = restartLevel;
window.nextLevel = nextLevel;

/**
 * Initialize grade selector interface
 */
function initGradeSelector() {
    showGradeLevel1();
}

/**
 * Show first level: grade range selection
 */
function showGradeLevel1() {
    const gradeTitle = document.getElementById('gradeTitle');
    const gradeGrid = document.getElementById('gradeGrid');
    
    if (!gradeTitle || !gradeGrid) return;
    
    gradeTitle.textContent = '选择年级';
    gradeGrid.innerHTML = '';
    
    // 设置为网格布局（3列）
    gradeGrid.style.display = 'grid';
    gradeGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    gradeGrid.style.gap = '20px';
    gradeGrid.style.justifyContent = 'center';
    
    // Define grade ranges
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
                // Grades 1-3 directly selected and confirmed
                selectGrade('1-3');
                resetWordSelectionState();
                console.log('Selected grade:', getGradeDisplayName('1-3'));
                startGame();
            } else {
                // Other grades show second level selection
                showGradeLevel2(range.id);
            }
        });
        
        gradeGrid.appendChild(btn);
    });
}

/**
 * Show second level: semester selection
 */
function showGradeLevel2(gradeNum) {
    const gradeTitle = document.getElementById('gradeTitle');
    const gradeGrid = document.getElementById('gradeGrid');
    
    if (!gradeTitle || !gradeGrid) return;
    
    gradeTitle.textContent = `选择${gradeNum}年级`;
    gradeGrid.innerHTML = '';
    
    // 设置为flex布局，居中对齐
    gradeGrid.style.display = 'flex';
    gradeGrid.style.justifyContent = 'center';
    gradeGrid.style.gap = '30px';
    
    // Create semester buttons
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
            // Update selected grade
            selectGrade(sem.id);
            resetWordSelectionState();
            console.log('Selected grade:', getGradeDisplayName(sem.id));
            startGame();
        });
        
        gradeGrid.appendChild(btn);
    });
}

/**
 * Get grade display name
 */
function getGradeDisplayName(gradeId) {
    if (typeof gradeNames !== 'undefined' && gradeNames[gradeId]) {
        return gradeNames[gradeId];
    }
    return gradeId;
}

/**
 * Hide grade selector
 */
function hideGradeSelector() {
    const gradeSelector = document.getElementById('gradeSelector');
    if (gradeSelector) {
        gradeSelector.style.display = 'none';
    }
}

/**
 * Show grade selector
 */
function showGradeSelector() {
    const gradeSelector = document.getElementById('gradeSelector');
    if (gradeSelector) {
        gradeSelector.style.display = 'flex';
        initGradeSelector();
    }
}

// 加载图片后初始化界面
loadImages().then(() => {
    console.log('图片加载完成，开始初始化界面');
    
    // 隐藏加载动画（使用直接方式）
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
        console.log('隐藏加载动画');
    }
    
    // 显示年级选择界面
    showGradeSelector();
    console.log('显示年级选择界面');
    
    // 适配屏幕大小
    resizeCanvas();
    console.log('适配屏幕大小');
    
    // 绘制背景图（使用实际Canvas宽高来绘制）
    ctx.clearRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    
    // 绘制背景图
    if (images.background) {
        ctx.drawImage(images.background, 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
        console.log('绘制背景图');
    } else {
        // 备用渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, DESIGN_HEIGHT);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.6, '#1E90FF');
        gradient.addColorStop(1, '#006994');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
        console.log('绘制备用背景');
    }
    
    // 绘制船（开始界面显示船）
    if (images.boat) {
        const boatRect = getBoatRect(0);
        ctx.drawImage(images.boat, boatRect.x, boatRect.y, boatRect.width, boatRect.height);
        console.log('绘制船');
    }
});

// 窗口大小改变时重新适配
window.addEventListener('resize', () => {
    resizeCanvas();
    if (gameState === 'playing' || gameState === 'tutorial') {
        ctx.clearRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
        drawBackground();
        drawFish();
        drawBoat();
        drawHarpoon();
        if (gameState === 'playing') {
            drawUI();
        } else {
            drawTutorialGuidance();
        }
    }
});
