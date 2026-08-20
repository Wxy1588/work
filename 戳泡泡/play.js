var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

canvas.width = 1600;
canvas.height = 900;

var gameState = 'loading'; // loading, intro1, tutorial, intro2, start, playing, win, lose

var gameTracker = new GameTracker({
    gameId: 'poke_bubbles',
    gameVersion: '1.0.0',
    apiUrl: 'http://127.0.0.1:8000/api/v1/events',
    getUserId: function () {
        return null;
    }
});

// 加载界面元素
var loadingOverlay = document.getElementById('loadingOverlay');
var loadingProgress = document.getElementById('loadingProgress');

// 初始界面元素
var introOverlay1 = null;
var introOverlay2 = null;

// 指导关卡相关变量
var tutorialBubbles = [];
var tutorialFireworks = [];
var tutorialCompleted = false;
var showShellHint = false;
var shellHintStartTime = 0;
var showJiantou = false;
var jiantouStartTime = 0;
var showHand = false;

// 资源列表
var assetsToLoad = [
    'assets/background.png',
    'assets/level.png',
    'assets/poke.png',
    'assets/qipao.png',
    'assets/person.png',
    'assets/fish.png',
    'assets/last.png',
    'assets/restart.png',
    'assets/next.png',
    'assets/end.png',
    'assets/Levels.jpg',
    'assets/end1.png',
    'assets/end2.png',
    'assets/end3.png',
    'assets/report.png',
    'assets/jiantou.png',
    'assets/hand.png'
];

// 资源加载计数器
var loadedCount = 0;
var totalAssets = assetsToLoad.length;

// 创建初始界面按钮
function createIntroButton() {
    var button = document.createElement('button');
    button.style.width = '220px';
    button.style.height = '80px';
    button.style.background = '#2563eb';
    button.style.border = 'none';
    button.style.borderRadius = '40px';
    button.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.4), inset 0 -4px 0 rgba(0, 0, 0, 0.2)';
    button.style.cursor = 'pointer';
    button.style.transition = 'all 0.3s ease';
    button.style.position = 'relative';
    button.style.outline = 'none';
    
    var arrowSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrowSVG.setAttribute('width', '50');
    arrowSVG.setAttribute('height', '50');
    arrowSVG.setAttribute('viewBox', '0 0 24 24');
    
    var arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M9 18l6-6-6-6');
    arrowPath.setAttribute('stroke', 'white');
    arrowPath.setAttribute('stroke-width', '3');
    arrowPath.setAttribute('stroke-linecap', 'round');
    arrowPath.setAttribute('stroke-linejoin', 'round');
    arrowPath.setAttribute('fill', 'none');
    
    arrowSVG.appendChild(arrowPath);
    button.appendChild(arrowSVG);
    
    button.onmouseover = function() {
        button.style.transform = 'translateY(-3px) scale(1.05)';
        button.style.boxShadow = '0 12px 35px rgba(37, 99, 235, 0.5), inset 0 -4px 0 rgba(0, 0, 0, 0.2)';
    };
    
    button.onmouseout = function() {
        button.style.transform = 'translateY(0) scale(1)';
        button.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.4), inset 0 -4px 0 rgba(0, 0, 0, 0.2)';
    };
    
    return button;
}

// 显示第一个初始界面
function showIntroScreen1() {
    gameState = 'intro1';
    
    introOverlay1 = document.createElement('div');
    introOverlay1.style.position = 'absolute';
    introOverlay1.style.top = '0';
    introOverlay1.style.left = '0';
    introOverlay1.style.width = '100%';
    introOverlay1.style.height = '100%';
    introOverlay1.style.background = 'linear-gradient(180deg, #b8e6f5 0%, #e0f4f8 50%, #b8e6f5 100%)';
    introOverlay1.style.display = 'flex';
    introOverlay1.style.flexDirection = 'column';
    introOverlay1.style.justifyContent = 'center';
    introOverlay1.style.alignItems = 'center';
    introOverlay1.style.zIndex = '9999';
    introOverlay1.style.cursor = 'pointer';
    
    // 创建跳过按钮（右上角）
    var skipButton = document.createElement('button');
    skipButton.style.position = 'absolute';
    skipButton.style.top = '30px';
    skipButton.style.right = '30px';
    skipButton.style.width = '80px';
    skipButton.style.height = '36px';
    skipButton.style.background = '#2563eb';
    skipButton.style.border = 'none';
    skipButton.style.borderRadius = '20px';
    skipButton.style.color = 'white';
    skipButton.style.fontSize = '14px';
    skipButton.style.fontWeight = 'bold';
    skipButton.style.cursor = 'pointer';
    skipButton.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
    skipButton.style.transition = 'all 0.3s ease';
    skipButton.style.zIndex = '10000';
    skipButton.innerText = '跳过';
    
    skipButton.onmouseover = function() {
        skipButton.style.transform = 'translateY(-2px)';
        skipButton.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.5)';
    };
    
    skipButton.onmouseout = function() {
        skipButton.style.transform = 'translateY(0)';
        skipButton.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
    };
    
    skipButton.onclick = function(e) {
        e.stopPropagation();
        introOverlay1.style.display = 'none';
        document.body.removeChild(introOverlay1);
        introOverlay1 = null;
        // 直接进入游戏开始界面
        gameState = 'start';
        if (startOverlay) {
            startOverlay.style.display = 'flex';
        }
        if (startBtn) {
            startBtn.style.display = 'block';
        }
    };
    
    introOverlay1.appendChild(skipButton);
    
    var startButton = createIntroButton();
    
    startButton.onclick = function(e) {
        e.stopPropagation();
        introOverlay1.style.display = 'none';
        document.body.removeChild(introOverlay1);
        introOverlay1 = null;
        // 进入指导关卡
        showTutorial();
    };
    
    introOverlay1.appendChild(startButton);
    
    introOverlay1.onclick = function() {
        introOverlay1.style.display = 'none';
        document.body.removeChild(introOverlay1);
        introOverlay1 = null;
        // 进入指导关卡
        showTutorial();
    };
    
    document.body.appendChild(introOverlay1);
}

// 显示第二个初始界面
function showIntroScreen2() {
    gameState = 'intro2';
    
    introOverlay2 = document.createElement('div');
    introOverlay2.style.position = 'absolute';
    introOverlay2.style.top = '0';
    introOverlay2.style.left = '0';
    introOverlay2.style.width = '100%';
    introOverlay2.style.height = '100%';
    introOverlay2.style.background = 'linear-gradient(180deg, #b8e6f5 0%, #e0f4f8 50%, #b8e6f5 100%)';
    introOverlay2.style.display = 'flex';
    introOverlay2.style.flexDirection = 'column';
    introOverlay2.style.justifyContent = 'center';
    introOverlay2.style.alignItems = 'center';
    introOverlay2.style.zIndex = '9999';
    introOverlay2.style.cursor = 'pointer';
    
    var startButton = createIntroButton();
    
    startButton.onclick = function(e) {
        e.stopPropagation();
        introOverlay2.style.display = 'none';
        document.body.removeChild(introOverlay2);
        introOverlay2 = null;
        gameState = 'start';
        if (startOverlay) {
            startOverlay.style.display = 'flex';
        }
        if (startBtn) {
            startBtn.style.display = 'block';
        }
    };
    
    introOverlay2.appendChild(startButton);
    
    introOverlay2.onclick = function() {
        introOverlay2.style.display = 'none';
        document.body.removeChild(introOverlay2);
        introOverlay2 = null;
        gameState = 'start';
        if (startOverlay) {
            startOverlay.style.display = 'flex';
        }
        if (startBtn) {
            startBtn.style.display = 'block';
        }
    };
    
    document.body.appendChild(introOverlay2);
}

// 显示初始界面（入口函数）
function showIntroScreen() {
    showIntroScreen1();
}

// 创建指导关卡的气泡（轻微飘移，不向上移动）
function createTutorialBubble(x, y, radius, letter, isCorrect) {
    return {
        x: x,
        y: y,
        radius: radius,
        baseX: x,
        baseY: y,
        letter: letter,
        isCorrect: isCorrect,
        alreadyClicked: false,
        shaking: false,
        shakeTime: 0,
        originalX: x,
        originalY: y,
        opacity: 0.8,
        waveOffset: Math.random() * Math.PI * 2,
        waveAmplitude: 15,
        waveFrequency: 0.02
    };
}

// 生成礼花粒子
function generateFireworks(x, y) {
    var colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'];
    var particleCount = 50;
    
    for (var i = 0; i < particleCount; i++) {
        var angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
        var speed = Math.random() * 5 + 3;
        tutorialFireworks.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 6 + 3,
            alpha: 1,
            life: 60
        });
    }
}

// 更新礼花
function updateFireworks() {
    for (var i = tutorialFireworks.length - 1; i >= 0; i--) {
        var p = tutorialFireworks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // 重力
        p.alpha -= 0.015;
        p.life--;
        
        if (p.life <= 0 || p.alpha <= 0) {
            tutorialFireworks.splice(i, 1);
        }
    }
}

// 绘制礼花
function drawFireworks() {
    for (var i = 0; i < tutorialFireworks.length; i++) {
        var p = tutorialFireworks[i];
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 更新指导关卡的气泡（轻微飘移，不向上移动）
function updateTutorialBubbles() {
    for (var i = tutorialBubbles.length - 1; i >= 0; i--) {
        var bubble = tutorialBubbles[i];
        
        // 如果气泡正在晃动
        if (bubble.shaking) {
            bubble.shakeTime += 1;
            var shakeOffset = Math.sin(bubble.shakeTime * 0.3) * 15;
            bubble.x = bubble.originalX + shakeOffset;
            
            if (bubble.shakeTime > 20) {
                tutorialBubbles.splice(i, 1);
            }
            continue;
        }
        
        // 轻微飘移（不向上移动）
        bubble.waveOffset += bubble.waveFrequency;
        bubble.x = bubble.baseX + Math.sin(bubble.waveOffset) * bubble.waveAmplitude;
        bubble.y = bubble.baseY + Math.cos(bubble.waveOffset * 0.7) * (bubble.waveAmplitude * 0.5);
    }
}

// 绘制指导关卡的气泡
function drawTutorialBubbles() {
    for (var i = 0; i < tutorialBubbles.length; i++) {
        var bubble = tutorialBubbles[i];
        
        if (bubbleImg.complete) {
            var size = bubble.radius * 2;
            ctx.globalAlpha = bubble.opacity;
            ctx.drawImage(bubbleImg, bubble.x - bubble.radius, bubble.y - bubble.radius, size, size);
            ctx.globalAlpha = 1;
        }
        
        // 绘制字母在气泡中间
        ctx.fillStyle = '#0000ff';
        ctx.font = 'bold ' + (bubble.radius * 0.8) + 'px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bubble.letter, bubble.x, bubble.y);
    }
    
    // 绘制手的提示（在正确气泡下方）
    if (showHand && handImg.complete && tutorialBubbles.length > 0) {
        // 找到正确的气泡（A）
        var correctBubble = tutorialBubbles[0]; // 第一个气泡是正确的A
        
        // 更新手的缩放动画
        handScale += handConfig.speed * handScaleDirection;
        if (handScale >= handConfig.scaleMax) {
            handScale = handConfig.scaleMax;
            handScaleDirection = -1;
        } else if (handScale <= handConfig.scaleMin) {
            handScale = handConfig.scaleMin;
            handScaleDirection = 1;
        }
        
        // 计算手的尺寸
        var handHeight = handConfig.width * (handImg.height / handImg.width);
        var currentHandWidth = handConfig.width * handScale;
        var currentHandHeight = handHeight * handScale;
        
        // 手的位置：在正确气泡下方
        var handX = correctBubble.x - currentHandWidth / 2+40;
        var handY = correctBubble.y + correctBubble.radius-10 ;
        
        // 绘制手
        ctx.drawImage(handImg, handX, handY, currentHandWidth, currentHandHeight);
    }
}

// 显示指导关卡
function showTutorial() {
    gameState = 'tutorial';
    hideLearningReportButton();
    tutorialCompleted = false;
    tutorialBubbles = [];
    tutorialFireworks = [];
    
    // 隐藏关卡选择按钮
    if (levelSelectBtn) {
        levelSelectBtn.style.display = 'none';
    }
    
    // 启动贝壳提示效果（持续2秒）
    showShellHint = true;
    shellHintStartTime = Date.now();
    
    // 启动箭头显示（持续2秒）
    showJiantou = true;
    jiantouStartTime = Date.now();
    
    // 创建两个气泡：一个正确（A），一个错误（B）
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var bubbleRadius = 70;
    
    // 正确气泡（A）- 左侧
    tutorialBubbles.push(createTutorialBubble(
        centerX - 150, 
        centerY, 
        bubbleRadius, 
        'A', 
        true
    ));
    
    // 错误气泡（B）- 右侧
    tutorialBubbles.push(createTutorialBubble(
        centerX + 150, 
        centerY, 
        bubbleRadius, 
        'B', 
        false
    ));
    
    // 播放背景音乐
    if (backgroundMusic) {
        try {
            backgroundMusic.currentTime = 0;
            backgroundMusic.play().catch(function() {});
        } catch(e) {}
    }
}

// 处理指导关卡的点击
function handleTutorialClick(pos) {
    for (var i = tutorialBubbles.length - 1; i >= 0; i--) {
        var bubble = tutorialBubbles[i];
        
        // 检查是否点击到气泡
        var dx = pos.x - bubble.x;
        var dy = pos.y - bubble.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= bubble.radius) {
            // 检查气泡是否已经被点击过
            if (bubble.alreadyClicked) {
                return;
            }
            
            bubble.alreadyClicked = true;
            showHand = false; // 点击气泡时手消失
            
            if (bubble.isCorrect) {
                // 点击正确气泡：播放字母读音，生成礼花，直接进入开始游戏界面
                playLetterSound(bubble.letter);
                generateFireworks(bubble.x, bubble.y);
                
                // 移除正确气泡
                tutorialBubbles.splice(i, 1);
                
                // 1秒后直接进入开始游戏界面
                setTimeout(function() {
                    gameState = 'start';
                    tutorialBubbles = [];
                    tutorialFireworks = [];
                    if (startOverlay) {
                        startOverlay.style.display = 'flex';
                    }
                    if (startBtn) {
                        startBtn.style.display = 'block';
                    }
                }, 1000);
            } else {
                // 点击错误气泡
                // 第3、4、6阶段（读音阶段）播放错误音效，其他阶段播放字母读音
                if (currentStage === 3 || currentStage === 4 || currentStage === 6) {
                    initWrongSound();
                    try {
                        wrongSound.currentTime = 0;
                        wrongSound.play().catch(function() {});
                    } catch(e) {}
                } else {
                    playLetterSound(bubble.letter);
                }
                bubble.shaking = true;
                bubble.shakeTime = 0;
                bubble.originalX = bubble.x;
                bubble.originalY = bubble.y;
            }
            return;
        }
    }
}

// 加载资源
function loadAssets() {
    assetsToLoad.forEach(function(src) {
        var img = new Image();
        img.onload = function() {
            loadedCount++;
            var percent = Math.round((loadedCount / totalAssets) * 100);
            loadingProgress.innerText = percent + '%';
            
            if (loadedCount >= totalAssets) {
                // 所有资源加载完成
                setTimeout(function() {
                    loadingOverlay.style.display = 'none';
                    // 播放背景音乐
                    if (!backgroundMusic) {
                        backgroundMusic = new Audio('assets/background.mp3');
                        backgroundMusic.volume = 0.10;
                        backgroundMusic.loop = true;
                    }
                    try {
                        backgroundMusic.play().catch(function() {});
                    } catch(e) {}
                    // 显示初始界面
                    showIntroScreen();
                }, 500);
            }
        };
        img.onerror = function() {
            loadedCount++;
            var percent = Math.round((loadedCount / totalAssets) * 100);
            loadingProgress.innerText = percent + '%';
            
            if (loadedCount >= totalAssets) {
                // 所有资源加载完成（即使有加载失败的）
                setTimeout(function() {
                    loadingOverlay.style.display = 'none';
                    // 播放背景音乐
                    if (!backgroundMusic) {
                        backgroundMusic = new Audio('assets/background.mp3');
                        backgroundMusic.volume = 0.10;
                        backgroundMusic.loop = true;
                    }
                    try {
                        backgroundMusic.play().catch(function() {});
                    } catch(e) {}
                    // 显示初始界面
                    showIntroScreen();
                }, 500);
            }
        };
        img.src = src;
    });
}

// 页面加载完成后开始加载资源
window.onload = function() {
    loadAssets();
};

var score = 0;
var timeLeft = 60;
var timer = null;
var audioPlayTimer = null; // 音频播放定时器
var foundAreas = 0;
var currentLevel = 1; // 当前关卡
var displayedShellLetter = null; // 当前关卡显示在贝壳上的字母（用于大小写不敏感关卡）
var currentStage = 1; // 当前阶段（1-6）
var consecutiveHighAccuracy = 0; // 连续高正确率计数
var levelAccuracy = 0; // 当前关卡正确率
var playCount = 0; // 玩家玩过的关数

// 记录每个阶段已玩过的关卡（用于阶段通关判断）
var stageProgress = {
    1: [], // 关卡1-26
    2: [], // 关卡27-52
    3: [], // 关卡53-78
    4: [], // 关卡79-104
    5: [], // 关卡105-130
    6: []  // 关卡131-156
};

// 阶段配置
var stageConfig = [
    { start: 1, end: 26 },
    { start: 27, end: 52 },
    { start: 53, end: 78 },
    { start: 79, end: 104 },
    { start: 105, end: 130 },
    { start: 131, end: 156 }
];

// 答对效果状态
var showWhale = false;
var whaleTimer = null;
var stars = [];

// 匹配区域定义（可自定义位置和大小）
var matchAreas = [
    { x: 380, y: 195, radius: 70, found: false },  // 1号区域
    { x: 1025, y: 286, radius: 69, found: false },  // 2号区域
    { x: 678, y: 290, radius: 67, found: false },  // 3号区域
    { x: 820, y: 500, radius: 72, found: false },  // 4号区域
    { x: 460, y: 600, radius: 78, found: false }   // 5号区域
];

// 错误气泡终止位置定义（可自定义位置、大小和字母）
var wrongBubbleTargets = [
    { x: 250, y: 400, radius: 68, letter: 'B' },  // 错误气泡1
    { x: 1230, y: 440, radius: 70, letter: 'C' }, // 错误气泡2
    { x: 780, y: 700, radius: 75, letter: 'D' },  // 错误气泡3
    { x: 1130, y: 630, radius: 80, letter: 'E' }  // 错误气泡4
];

var backgroundImg = new Image();
backgroundImg.src = 'assets/background.png';

// 贝壳图片（可配置位置和大小）
var shellImg = new Image();
shellImg.src = 'assets/level.png';

// 喇叭图片（用于第3、4、6阶段）
var labaImg = new Image();
labaImg.src = 'assets/laba.png';

// 错误音效
var wrongSound = null;
function initWrongSound() {
    if (!wrongSound) {
        wrongSound = new Audio('assets/wrong.mp3');
        wrongSound.volume = 0.8;
        wrongSound.preload = 'auto';
    }
}

// 贝壳配置（可以修改这些值来改变贝壳的位置和大小）
var shellConfig = {
    x: 917,      // 贝壳的 X 坐标
    y: 35,      // 贝壳的 Y 坐标
    width: 160   // 贝壳的宽度（高度会自动按比例缩放）
};

// 戳泡泡示意图（仅第一关显示）
var pokeImg = new Image();
pokeImg.src = 'assets/poke.png';

// 戳泡泡示意图配置（可以修改这些值来改变位置和大小）
var pokeConfig = {
    x: 350,      // 示意图的 X 坐标
    y: 30,       // 示意图的 Y 坐标
    width: 120,  // 示意图的宽度（高度会自动按比例缩放）
    scaleMin: 0.9,   // 最小缩放比例
    scaleMax: 1.1,   // 最大缩放比例
    speed: 0.01      // 缩放动画速度
};

// 戳泡泡缩放动画变量
var pokeScale = 1;
var pokeScaleDirection = 1;

// 指导关卡箭头图片
var jiantouImg = new Image();
jiantouImg.src = 'assets/jiantou.png';

// 箭头配置
var jiantouConfig = {
    width: 80,       // 箭头宽度
    scaleMin: 0.85,  // 最小缩放比例
    scaleMax: 1.15,  // 最大缩放比例
    speed: 0.009      // 缩放动画速度
};

// 箭头缩放动画变量
var jiantouScale = 1;
var jiantouScaleDirection = 1;

// 手的图片
var handImg = new Image();
handImg.src = 'assets/hand.png';

// 手的配置
var handConfig = {
    width: 80,       // 手的宽度
    scaleMin: 0.85,  // 最小缩放比例
    scaleMax: 1.15,  // 最大缩放比例
    speed: 0.009      // 缩放动画速度
};

// 手的缩放动画变量
var handScale = 1;
var handScaleDirection = 1;

// 按钮图片
var lastBtnImg = new Image();
lastBtnImg.src = 'assets/last.png';

var restartBtnImg = new Image();
restartBtnImg.src = 'assets/restart.png';

var nextBtnImg = new Image();
nextBtnImg.src = 'assets/next.png';

var endBtnImg = new Image();
endBtnImg.src = 'assets/end.png';

// 背景音乐
var backgroundMusic = null;

// 动画帧 ID，用于停止渲染循环
var animationFrameId = null;

// 倍速控制变量
var speedLevels = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2]; // 可用倍速列表
var currentSpeedIndex = 3; // 默认1.0倍速（索引为3）
var speedButton = null;

// 字母音效缓存（懒加载）
var letterAudios = {};
var allLetters = ['A', 'B', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'N', 'M', 'a', 'b', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'n', 'm'];

// 学习报告播报。每次只允许一条播报队列运行，关闭报告或重新开局时会立即停止。
var reportNarrationAudio = null;
var reportNarrationResolve = null;
var reportNarrationRunId = 0;

function stopReportNarration() {
    reportNarrationRunId++;

    if (reportNarrationAudio) {
        try {
            reportNarrationAudio.pause();
            reportNarrationAudio.currentTime = 0;
        } catch(e) {}
        reportNarrationAudio = null;
    }

    if (reportNarrationResolve) {
        var resolveCurrentClip = reportNarrationResolve;
        reportNarrationResolve = null;
        resolveCurrentClip();
    }
}

function playReportNarrationClip(src, runId) {
    return new Promise(function(resolve) {
        if (runId !== reportNarrationRunId) {
            resolve();
            return;
        }

        var audio = new Audio(src);
        var finished = false;
        reportNarrationAudio = audio;
        reportNarrationResolve = finish;
        audio.preload = 'auto';
        audio.volume = 1;

        function finish() {
            if (finished) return;
            finished = true;
            audio.removeEventListener('ended', finish);
            audio.removeEventListener('error', finish);
            if (reportNarrationAudio === audio) {
                reportNarrationAudio = null;
                reportNarrationResolve = null;
            }
            resolve();
        }

        audio.addEventListener('ended', finish);
        audio.addEventListener('error', finish);

        try {
            var playPromise = audio.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(finish);
            }
        } catch(e) {
            finish();
        }
    });
}

function playReportNarration(letterRecords) {
    stopReportNarration();

    // 没有任何学习记录时不把“暂无记录”误报为“全部掌握”。
    if (!letterRecords || letterRecords.length === 0) {
        return;
    }

    var unmasteredRecords = letterRecords.filter(function(item) {
        return item.accuracy < 60;
    }).sort(function(a, b) {
        if (a.accuracy !== b.accuracy) {
            return a.accuracy - b.accuracy;
        }
        return a.letter.localeCompare(b.letter);
    });

    var narrationQueue = [];
    if (unmasteredRecords.length === 0) {
        narrationQueue.push('assets/report/2.mp3');
    } else {
        var recordsToRead = unmasteredRecords.length <= 3
            ? unmasteredRecords
            : unmasteredRecords.slice(0, 3);

        narrationQueue.push('assets/report/1_1.mp3');
        recordsToRead.forEach(function(item) {
            narrationQueue.push('assets/' + item.audioLetter.toUpperCase() + '.mp3');
        });
        narrationQueue.push('assets/report/1_2.mp3');
    }

    // 报告播报期间避免背景音乐和结算音效盖住人声。
    if (backgroundMusic) {
        try {
            backgroundMusic.pause();
        } catch(e) {}
    }
    if (typeof resultAudios !== 'undefined') {
        resultAudios.forEach(function(audio) {
            try {
                audio.pause();
                audio.currentTime = 0;
            } catch(e) {}
        });
    }

    var runId = reportNarrationRunId;
    function playNext(index) {
        if (runId !== reportNarrationRunId || index >= narrationQueue.length) {
            return;
        }
        playReportNarrationClip(narrationQueue[index], runId).then(function() {
            playNext(index + 1);
        });
    }

    playNext(0);
}

// 各字母得分记录（用于统计准确率）
// 记录每个字母在不同阶段的最新得分
var letterScores = {};
// 初始化所有字母的得分记录
allLetters.forEach(function(letter) {
    letterScores[letter] = { 
        stageRecords: {}, // 记录每个阶段的最新得分 {stageNumber: lastScore}
        lastStage: 0 // 记录最新一次所在的阶段
    };
});

// 播放字母读音音效
function playLetterSound(letter) {
    var upperLetter = letter.toUpperCase();
    
    // 检查是否是有效的字母
    if (allLetters.indexOf(upperLetter) === -1) {
        return;
    }
    
    // 如果没有缓存，创建新的音频对象
    if (!letterAudios[upperLetter]) {
        letterAudios[upperLetter] = new Audio('assets/' + upperLetter + '.mp3');
        letterAudios[upperLetter].volume = 1;
    }
    
    // 播放音效
    try {
        letterAudios[upperLetter].currentTime = 0;
        letterAudios[upperLetter].play().catch(function() {});
    } catch(e) {}
}

// 鲸鱼图片
var whaleImg = new Image();
whaleImg.src = 'assets/fish.png';

var rightAudio = null;
var wrongAudio = null;

var startBtn = document.getElementById('startBtn');
var startOverlay = document.getElementById('startOverlay');
var gameHudStack = document.getElementById('gameHudStack');
var learningReportBtn = document.getElementById('learningReportBtn');
var gameInfoStrip = document.getElementById('gameInfoStrip');
var levelInfo = document.getElementById('levelInfo');
var scoreInfo = document.getElementById('scoreInfo');
var learningReportOverlay = null;
var gamePausedForReport = false;

// 关卡选择按钮和弹窗
var levelSelectBtn = null;
var levelSelectOverlay = null;

// 结算界面的 overlay
var resultOverlay = null;

// 气泡图片
var bubbleImg = new Image();
bubbleImg.src = 'assets/qipao.png';

// 美人鱼图片
var mermaidImg = new Image();
mermaidImg.src = 'assets/person.png';

// 气泡数组
var bubbles = [];
var bubbleTimer = null;

function showLearningReportButton() {
    if (gameHudStack) {
        gameHudStack.style.display = 'flex';
        alignLearningReportButtonWithScore();
    }
}

function hideLearningReportButton() {
    if (gameHudStack) {
        gameHudStack.style.display = 'none';
    }
}

function alignLearningReportButtonWithScore() {
    if (!gameHudStack || gameHudStack.style.display !== 'flex') {
        return;
    }

    var canvasRect = canvas.getBoundingClientRect();
    if (!canvasRect.width) {
        return;
    }

    // 整组只定位一次，按钮的 hover/active 变换不会再影响上方信息条。
    var stackWidth = gameHudStack.offsetWidth;
    var groupRightOnScreen = canvasRect.left + (canvas.width - 15) * canvasRect.width / canvas.width;
    var alignedLeft = Math.round(groupRightOnScreen - stackWidth) + 'px';

    if (gameHudStack.style.left !== alignedLeft) {
        gameHudStack.style.left = alignedLeft;
        gameHudStack.style.right = 'auto';
    }
}

function getLearningReportCanvasRect() {
    if (!gameHudStack || gameHudStack.style.display !== 'flex' || !learningReportBtn) {
        return null;
    }

    var buttonRect = learningReportBtn.getBoundingClientRect();
    var canvasRect = canvas.getBoundingClientRect();
    if (!canvasRect.width || !canvasRect.height) {
        return null;
    }

    return {
        left: (buttonRect.left - canvasRect.left) * canvas.width / canvasRect.width,
        top: (buttonRect.top - canvasRect.top) * canvas.height / canvasRect.height,
        right: (buttonRect.right - canvasRect.left) * canvas.width / canvasRect.width,
        bottom: (buttonRect.bottom - canvasRect.top) * canvas.height / canvasRect.height
    };
}

function keepBubbleOutsideLearningReport(bubble) {
    var reportRect = getLearningReportCanvasRect();
    if (!reportRect) {
        return;
    }

    var padding = 14;
    var overlapsVertically = bubble.y + bubble.radius >= reportRect.top - padding &&
        bubble.y - bubble.radius <= reportRect.bottom + padding;
    var overlapsHorizontally = bubble.x + bubble.radius >= reportRect.left - padding &&
        bubble.x - bubble.radius <= reportRect.right + padding;

    if (!overlapsVertically || !overlapsHorizontally) {
        return;
    }

    // 报告按钮位于右上角，气泡统一从左侧绕行，避免来回抖动。
    var safeX = reportRect.left - padding - bubble.radius;
    bubble.x = Math.min(bubble.x, safeX);
    if (typeof bubble.baseX === 'number') {
        bubble.baseX = Math.min(bubble.baseX, safeX - (bubble.waveAmplitude || 0));
    }
}

function closeLearningReport() {
    stopReportNarration();
    if (learningReportOverlay && document.body.contains(learningReportOverlay)) {
        document.body.removeChild(learningReportOverlay);
    }
    learningReportOverlay = null;
    gamePausedForReport = false;

    if (gameState === 'playing') {
        showLearningReportButton();
        if (backgroundMusic) {
            try {
                backgroundMusic.play().catch(function() {});
            } catch(e) {}
        }
    }
}

function restartEverything() {
    stopReportNarration();
    // 重新加载页面，确保关卡、得分、学习记录、速度和所有计时器全部重置。
    window.location.reload();
}

function showLearningReport() {
    if (gameState !== 'playing' || learningReportOverlay) {
        return;
    }

    gamePausedForReport = true;
    hideLearningReportButton();
    if (backgroundMusic) {
        try {
            backgroundMusic.pause();
        } catch(e) {}
    }

    learningReportOverlay = document.createElement('div');
    learningReportOverlay.className = 'overlay';
    learningReportOverlay.style.zIndex = '250';
    learningReportOverlay.setAttribute('role', 'dialog');
    learningReportOverlay.setAttribute('aria-modal', 'true');
    learningReportOverlay.setAttribute('aria-label', '学习报告');
    document.body.appendChild(learningReportOverlay);

    addScoreReport({
        overlay: learningReportOverlay,
        closeOnly: true,
        onClose: closeLearningReport
    });
}

// 关卡配置
var levelConfig = {
    1: {
        correctLetter: 'A',
        wrongLetters: ['B','Q','W','E','R','T','Y','U','I','O','P','S','D','F','G','H','J','K','L','Z','X','C','V','N','M']
    },
    2: {
        correctLetter: 'B',
        wrongLetters: ['Q','W','E','R','T','Y','U','I','O','P','A','S','D','F','G','H','J','K','L','Z','X','C','V','N','M']
    },
    3: {
        correctLetter: 'C',
        wrongLetters: ['Q','W','E','R','T','Y','U','I','O','P','A','S','D','F','G','H','J','K','L','Z','X','B','V','N','M']
    },
    4: {
        correctLetter: 'D',
        wrongLetters: ['Q','W','E','R','T','Y','U','I','O','P','A','S','C','F','G','H','J','K','L','Z','X','B','V','N','M']
    },
    5: {
        correctLetter: 'E',
        wrongLetters: ['Q','W','D','R','T','Y','U','I','O','P','A','S','C','F','G','H','J','K','L','Z','X','B','V','N','M']
    },
    6: {
        correctLetter: 'F',
        wrongLetters: ['Q','W','D','R','T','Y','U','I','O','P','A','S','E','G','H','J','K','L','Z','X','B','V','N','M']
    },
    7: {
        correctLetter: 'G',
        wrongLetters: ['Q','W','D','R','T','Y','U','I','O','P','A','S','E','F','H','J','K','L','Z','X','B','V','N','M']
    },
    8: {
        correctLetter: 'H',
        wrongLetters: ['Q','W','D','R','T','Y','U','I','O','P','A','S','E','F','G','J','K','L','Z','X','B','V','N','M']
    },
    9: {
        correctLetter: 'I',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','O','P','A','S','E','F','G','J','K','L','Z','X','B','V','N','M']
    },
    10: {
        correctLetter: 'J',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','O','P','A','S','E','F','G','I','K','L','Z','X','B','V','N','M']
    },
    11: {
        correctLetter: 'K',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','O','P','A','S','E','F','G','I','J','L','Z','X','B','V','N','M']
    },
    12: {
        correctLetter: 'L',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','O','P','A','S','E','F','G','I','J','K','Z','X','B','V','N','M']
    },
    13: {
        correctLetter: 'M',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','O','P','A','S','E','F','G','I','J','K','Z','X','B','V','N','L']
    },
    14: {
        correctLetter: 'N',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','O','P','A','S','E','F','G','I','J','K','Z','X','B','V','M','L']
    },
    15: {
        correctLetter: 'O',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','N','P','A','S','E','F','G','I','J','K','Z','X','B','V','M','L']
    },
    16: {
        correctLetter: 'P',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','N','O','A','S','E','F','G','I','J','K','Z','X','B','V','M','L']
    },
    17: {
        correctLetter: 'Q',
        wrongLetters: ['P','W','D','R','T','Y','U','H','N','O','A','S','E','F','G','I','J','K','Z','X','B','V','M','L']
    },
    18: {
        correctLetter: 'R',
        wrongLetters: ['P','W','D','Q','T','Y','U','H','N','O','A','S','E','F','G','I','J','K','Z','X','B','V','M','L']
    },
    19: {
        correctLetter: 'S',
        wrongLetters: ['P','W','D','Q','T','Y','U','H','N','O','A','R','E','F','G','I','J','K','Z','X','B','V','M','L']
    },
    20: {
        correctLetter: 'T',
        wrongLetters: ['P','W','D','Q','S','Y','U','H','N','O','A','R','E','F','G','I','J','K','Z','X','B','V','M','L']
    },
    21: {
        correctLetter: 'U',
        wrongLetters: ['P','W','D','Q','S','Y','T','H','N','O','A','R','E','F','G','I','J','K','Z','X','B','V','M','L']
    },
    22: {
        correctLetter: 'V',
        wrongLetters: ['P','W','D','Q','S','Y','T','H','N','O','A','R','E','F','G','I','J','K','Z','X','B','U','M','L']
    },
    23: {
        correctLetter: 'W',
        wrongLetters: ['P','V','D','Q','S','Y','T','H','N','O','A','R','E','F','G','I','J','K','Z','X','B','U','M','L']
    },
    24: {
        correctLetter: 'X',
        wrongLetters: ['P','V','D','Q','S','Y','T','H','N','O','A','R','E','F','G','I','J','K','Z','W','B','U','M','L']
    },
    25: {
        correctLetter: 'Y',
        wrongLetters: ['P','V','D','Q','S','X','T','H','N','O','A','R','E','F','G','I','J','K','Z','W','B','U','M','L']
    },
    26: {
        correctLetter: 'Z',
        wrongLetters: ['P','V','D','Q','S','X','T','H','N','O','A','R','E','F','G','I','J','K','Y','W','B','U','M','L']
    },
    27: {
        correctLetter: 'a',
        wrongLetters: ['b','q','w','e','r','t','y','u','i','o','p','s','d','f','g','h','j','k','l','z','x','c','v','n','m']
    },
    28: {
        correctLetter: 'b',
        wrongLetters: ['q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','l','z','x','c','v','n','m']
    },
    29: {
        correctLetter: 'c',
        wrongLetters: ['q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','l','z','x','b','v','n','m']
    },
    30: {
        correctLetter: 'd',
        wrongLetters: ['q','w','e','r','t','y','u','i','o','p','a','s','c','f','g','h','j','k','l','z','x','b','v','n','m']
    },
    31: {
        correctLetter: 'e',
        wrongLetters: ['q','w','d','r','t','y','u','i','o','p','a','s','c','f','g','h','j','k','l','z','x','b','v','n','m']
    },
    32: {
        correctLetter: 'f',
        wrongLetters: ['q','w','d','r','t','y','u','i','o','p','a','s','e','g','h','j','k','l','z','x','b','v','n','m']
    },
    33: {
        correctLetter: 'g',
        wrongLetters: ['q','w','d','r','t','y','u','i','o','p','a','s','e','f','h','j','k','l','z','x','b','v','n','m']
    },
    34: {
        correctLetter: 'h',
        wrongLetters: ['q','w','d','r','t','y','u','i','o','p','a','s','e','f','g','j','k','l','z','x','b','v','n','m']
    },
    35: {
        correctLetter: 'i',
        wrongLetters: ['q','w','d','r','t','y','u','h','o','p','a','s','e','f','g','j','k','l','z','x','b','v','n','m']
    },
    36: {
        correctLetter: 'j',
        wrongLetters: ['q','w','d','r','t','y','u','h','o','p','a','s','e','f','g','i','k','l','z','x','b','v','n','m']
    },
    37: {
        correctLetter: 'k',
        wrongLetters: ['q','w','d','r','t','y','u','h','o','p','a','s','e','f','g','i','j','l','z','x','b','v','n','m']
    },
    38: {
        correctLetter: 'l',
        wrongLetters: ['q','w','d','r','t','y','u','h','o','p','a','s','e','f','g','i','j','k','z','x','b','v','n','m']
    },
    39: {
        correctLetter: 'm',
        wrongLetters: ['q','w','d','r','t','y','u','h','o','p','a','s','e','f','g','i','j','k','z','x','b','v','n','l']
    },
    40: {
        correctLetter: 'n',
        wrongLetters: ['q','w','d','r','t','y','u','h','o','p','a','s','e','f','g','i','j','k','z','x','b','v','m','l']
    },
    41: {
        correctLetter: 'o',
        wrongLetters: ['q','w','d','r','t','y','u','h','n','p','a','s','e','f','g','i','j','k','z','x','b','v','m','l']
    },
    42: {
        correctLetter: 'p',
        wrongLetters: ['q','w','d','r','t','y','u','h','n','o','a','s','e','f','g','i','j','k','z','x','b','v','m','l']
    },
    43: {
        correctLetter: 'q',
        wrongLetters: ['p','w','d','r','t','y','u','h','n','o','a','s','e','f','g','i','j','k','z','x','b','v','m','l']
    },
    44: {
        correctLetter: 'r',
        wrongLetters: ['p','w','d','q','t','y','u','h','n','o','a','s','e','f','g','i','j','k','z','x','b','v','m','l']
    },
    45: {
        correctLetter: 's',
        wrongLetters: ['p','w','d','q','t','y','u','h','n','o','a','r','e','f','g','i','j','k','z','x','b','v','m','l']
    },
    46: {
        correctLetter: 't',
        wrongLetters: ['p','w','d','q','s','y','u','h','n','o','a','r','e','f','g','i','j','k','z','x','b','v','m','l']
    },
    47: {
        correctLetter: 'u',
        wrongLetters: ['p','w','d','q','s','y','t','h','n','o','a','r','e','f','g','i','j','k','z','x','b','v','m','l']
    },
    48: {
        correctLetter: 'v',
        wrongLetters: ['p','w','d','q','s','y','t','h','n','o','a','r','e','f','g','i','j','k','z','x','b','u','m','l']
    },
    49: {
        correctLetter: 'w',
        wrongLetters: ['p','v','d','q','s','y','t','h','n','o','a','r','e','f','g','i','j','k','z','x','b','u','m','l']
    },
    50: {
        correctLetter: 'x',
        wrongLetters: ['p','v','d','q','s','y','t','h','n','o','a','r','e','f','g','i','j','k','z','w','b','u','m','l']
    },
    51: {
        correctLetter: 'y',
        wrongLetters: ['p','v','d','q','s','x','t','h','n','o','a','r','e','f','g','i','j','k','z','w','b','u','m','l']
    },
    52: {
        correctLetter: 'z',
        wrongLetters: ['p','v','d','q','s','x','t','h','n','o','a','r','e','f','g','i','j','k','y','w','b','u','m','l']
    },
    // 第二阶段关卡（不显示贝壳字母，播放5遍音频）- 大写字母
    53: {
        correctLetter: 'A',
        wrongLetters: ['B','Q','W','E','R','T','Y','U','I','O','P','S','D','F','G','H','J','K','L','Z','X','C','V','N','M'],
        showShellLetter: false
    },
    54: {
        correctLetter: 'B',
        wrongLetters: ['Q','W','E','R','T','Y','U','I','O','P','A','S','D','F','G','H','J','K','L','Z','X','C','V','N','M'],
        showShellLetter: false
    },
    55: {
        correctLetter: 'C',
        wrongLetters: ['Q','W','E','R','T','Y','U','I','O','P','A','S','D','F','G','H','J','K','L','Z','X','B','V','N','M'],
        showShellLetter: false
    },
    56: {
        correctLetter: 'D',
        wrongLetters: ['Q','W','E','R','T','Y','U','I','O','P','A','S','C','F','G','H','J','K','L','Z','X','B','V','N','M'],
        showShellLetter: false
    },
    57: {
        correctLetter: 'E',
        wrongLetters: ['Q','W','D','R','T','Y','U','I','O','P','A','S','C','F','G','H','J','K','L','Z','X','B','V','N','M'],
        showShellLetter: false
    },
    58: {
        correctLetter: 'F',
        wrongLetters: ['Q','W','D','R','T','Y','U','I','O','P','A','S','E','G','H','J','K','L','Z','X','B','V','N','M'],
        showShellLetter: false
    },
    59: {
        correctLetter: 'G',
        wrongLetters: ['Q','W','D','R','T','Y','U','I','O','P','A','S','E','F','H','J','K','L','Z','X','B','V','N','M'],
        showShellLetter: false
    },
    60: {
        correctLetter: 'H',
        wrongLetters: ['Q','W','D','R','T','Y','U','I','O','P','A','S','E','F','G','J','K','L','Z','X','B','V','N','M'],
        showShellLetter: false
    },
    61: {
        correctLetter: 'I',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','O','P','A','S','E','F','G','J','K','L','Z','X','B','V','N','M'],
        showShellLetter: false
    },
    62: {
        correctLetter: 'J',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','O','P','A','S','E','F','G','I','K','L','Z','X','B','V','N','M'],
        showShellLetter: false
    },
    63: {
        correctLetter: 'K',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','O','P','A','S','E','F','G','I','J','L','Z','X','B','V','N','M'],
        showShellLetter: false
    },
    64: {
        correctLetter: 'L',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','O','P','A','S','E','F','G','I','J','K','Z','X','B','V','N','M'],
        showShellLetter: false
    },
    65: {
        correctLetter: 'M',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','O','P','A','S','E','F','G','I','J','K','Z','X','B','V','N','L'],
        showShellLetter: false
    },
    66: {
        correctLetter: 'N',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','O','P','A','S','E','F','G','I','J','K','Z','X','B','V','M','L'],
        showShellLetter: false
    },
    67: {
        correctLetter: 'O',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','N','P','A','S','E','F','G','I','J','K','Z','X','B','V','M','L'],
        showShellLetter: false
    },
    68: {
        correctLetter: 'P',
        wrongLetters: ['Q','W','D','R','T','Y','U','H','N','O','A','S','E','F','G','I','J','K','Z','X','B','V','M','L'],
        showShellLetter: false
    },
    69: {
        correctLetter: 'Q',
        wrongLetters: ['P','W','D','R','T','Y','U','H','N','O','A','S','E','F','G','I','J','K','Z','X','B','V','M','L'],
        showShellLetter: false
    },
    70: {
        correctLetter: 'R',
        wrongLetters: ['P','W','D','Q','T','Y','U','H','N','O','A','S','E','F','G','I','J','K','Z','X','B','V','M','L'],
        showShellLetter: false
    },
    71: {
        correctLetter: 'S',
        wrongLetters: ['P','W','D','Q','T','Y','U','H','N','O','A','R','E','F','G','I','J','K','Z','X','B','V','M','L'],
        showShellLetter: false
    },
    72: {
        correctLetter: 'T',
        wrongLetters: ['P','W','D','Q','S','Y','U','H','N','O','A','R','E','F','G','I','J','K','Z','X','B','V','M','L'],
        showShellLetter: false
    },
    73: {
        correctLetter: 'U',
        wrongLetters: ['P','W','D','Q','S','Y','T','H','N','O','A','R','E','F','G','I','J','K','Z','X','B','V','M','L'],
        showShellLetter: false
    },
    74: {
        correctLetter: 'V',
        wrongLetters: ['P','W','D','Q','S','Y','T','H','N','O','A','R','E','F','G','I','J','K','Z','X','B','U','M','L'],
        showShellLetter: false
    },
    75: {
        correctLetter: 'W',
        wrongLetters: ['P','V','D','Q','S','Y','T','H','N','O','A','R','E','F','G','I','J','K','Z','X','B','U','M','L'],
        showShellLetter: false
    },
    76: {
        correctLetter: 'X',
        wrongLetters: ['P','V','D','Q','S','Y','T','H','N','O','A','R','E','F','G','I','J','K','Z','W','B','U','M','L'],
        showShellLetter: false
    },
    77: {
        correctLetter: 'Y',
        wrongLetters: ['P','V','D','Q','S','X','T','H','N','O','A','R','E','F','G','I','J','K','Z','W','B','U','M','L'],
        showShellLetter: false
    },
    78: {
        correctLetter: 'Z',
        wrongLetters: ['P','V','D','Q','S','X','T','H','N','O','A','R','E','F','G','I','J','K','Y','W','B','U','M','L'],
        showShellLetter: false
    },
    // 第二阶段关卡（不显示贝壳字母，播放5遍音频）- 小写字母
    79: {
        correctLetter: 'a',
        wrongLetters: ['b','q','w','e','r','t','y','u','i','o','p','s','d','f','g','h','j','k','l','z','x','c','v','n','m'],
        showShellLetter: false
    },
    80: {
        correctLetter: 'b',
        wrongLetters: ['q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','l','z','x','c','v','n','m'],
        showShellLetter: false
    },
    81: {
        correctLetter: 'c',
        wrongLetters: ['q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','l','z','x','b','v','n','m'],
        showShellLetter: false
    },
    82: {
        correctLetter: 'd',
        wrongLetters: ['q','w','e','r','t','y','u','i','o','p','a','s','c','f','g','h','j','k','l','z','x','b','v','n','m'],
        showShellLetter: false
    },
    83: {
        correctLetter: 'e',
        wrongLetters: ['q','w','d','r','t','y','u','i','o','p','a','s','c','f','g','h','j','k','l','z','x','b','v','n','m'],
        showShellLetter: false
    },
    84: {
        correctLetter: 'f',
        wrongLetters: ['q','w','d','r','t','y','u','i','o','p','a','s','e','g','h','j','k','l','z','x','b','v','n','m'],
        showShellLetter: false
    },
    85: {
        correctLetter: 'g',
        wrongLetters: ['q','w','d','r','t','y','u','i','o','p','a','s','e','f','h','j','k','l','z','x','b','v','n','m'],
        showShellLetter: false
    },
    86: {
        correctLetter: 'h',
        wrongLetters: ['q','w','d','r','t','y','u','i','o','p','a','s','e','f','g','j','k','l','z','x','b','v','n','m'],
        showShellLetter: false
    },
    87: {
        correctLetter: 'i',
        wrongLetters: ['q','w','d','r','t','y','u','h','o','p','a','s','e','f','g','j','k','l','z','x','b','v','n','m'],
        showShellLetter: false
    },
    88: {
        correctLetter: 'j',
        wrongLetters: ['q','w','d','r','t','y','u','h','o','p','a','s','e','f','g','i','k','l','z','x','b','v','n','m'],
        showShellLetter: false
    },
    89: {
        correctLetter: 'k',
        wrongLetters: ['q','w','d','r','t','y','u','h','o','p','a','s','e','f','g','i','j','l','z','x','b','v','n','m'],
        showShellLetter: false
    },
    90: {
        correctLetter: 'l',
        wrongLetters: ['q','w','d','r','t','y','u','h','o','p','a','s','e','f','g','i','j','k','z','x','b','v','n','m'],
        showShellLetter: false
    },
    91: {
        correctLetter: 'm',
        wrongLetters: ['q','w','d','r','t','y','u','h','o','p','a','s','e','f','g','i','j','k','z','x','b','v','n','l'],
        showShellLetter: false
    },
    92: {
        correctLetter: 'n',
        wrongLetters: ['q','w','d','r','t','y','u','h','o','p','a','s','e','f','g','i','j','k','z','x','b','v','m','l'],
        showShellLetter: false
    },
    93: {
        correctLetter: 'o',
        wrongLetters: ['q','w','d','r','t','y','u','h','n','p','a','s','e','f','g','i','j','k','z','x','b','v','m','l'],
        showShellLetter: false
    },
    94: {
        correctLetter: 'p',
        wrongLetters: ['q','w','d','r','t','y','u','h','n','o','a','s','e','f','g','i','j','k','z','x','b','v','m','l'],
        showShellLetter: false
    },
    95: {
        correctLetter: 'q',
        wrongLetters: ['p','w','d','r','t','y','u','h','n','o','a','s','e','f','g','i','j','k','z','x','b','v','m','l'],
        showShellLetter: false
    },
    96: {
        correctLetter: 'r',
        wrongLetters: ['p','w','d','q','t','y','u','h','n','o','a','s','e','f','g','i','j','k','z','x','b','v','m','l'],
        showShellLetter: false
    },
    97: {
        correctLetter: 's',
        wrongLetters: ['p','w','d','q','t','y','u','h','n','o','a','r','e','f','g','i','j','k','z','x','b','v','m','l'],
        showShellLetter: false
    },
    98: {
        correctLetter: 't',
        wrongLetters: ['p','w','d','q','s','y','u','h','n','o','a','r','e','f','g','i','j','k','z','x','b','v','m','l'],
        showShellLetter: false
    },
    99: {
        correctLetter: 'u',
        wrongLetters: ['p','w','d','q','s','y','t','h','n','o','a','r','e','f','g','i','j','k','z','x','b','v','m','l'],
        showShellLetter: false
    },
    100: {
        correctLetter: 'v',
        wrongLetters: ['p','w','d','q','s','y','t','h','n','o','a','r','e','f','g','i','j','k','z','x','b','u','m','l'],
        showShellLetter: false
    },
    101: {
        correctLetter: 'w',
        wrongLetters: ['p','v','d','q','s','y','t','h','n','o','a','r','e','f','g','i','j','k','z','x','b','u','m','l'],
        showShellLetter: false
    },
    102: {
        correctLetter: 'x',
        wrongLetters: ['p','v','d','q','s','y','t','h','n','o','a','r','e','f','g','i','j','k','z','w','b','u','m','l'],
        showShellLetter: false
    },
    103: {
        correctLetter: 'y',
        wrongLetters: ['p','v','d','q','s','x','t','h','n','o','a','r','e','f','g','i','j','k','z','w','b','u','m','l'],
        showShellLetter: false
    },
    104: {
        correctLetter: 'z',
        wrongLetters: ['p','v','d','q','s','x','t','h','n','o','a','r','e','f','g','i','j','k','y','w','b','u','m','l'],
        showShellLetter: false
    },
    // 第五阶段关卡（大小写混合，大小写不敏感匹配）
    105: {
        correctLetter: 'A',
        wrongLetters: ['B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    106: {
        correctLetter: 'B',
        wrongLetters: ['A','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    107: {
        correctLetter: 'C',
        wrongLetters: ['A','B','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    108: {
        correctLetter: 'D',
        wrongLetters: ['A','B','C','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    109: {
        correctLetter: 'E',
        wrongLetters: ['A','B','C','D','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    110: {
        correctLetter: 'F',
        wrongLetters: ['A','B','C','D','E','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    111: {
        correctLetter: 'G',
        wrongLetters: ['A','B','C','D','E','F','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    112: {
        correctLetter: 'H',
        wrongLetters: ['A','B','C','D','E','F','G','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    113: {
        correctLetter: 'I',
        wrongLetters: ['A','B','C','D','E','F','G','H','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    114: {
        correctLetter: 'J',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    115: {
        correctLetter: 'K',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    116: {
        correctLetter: 'L',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    117: {
        correctLetter: 'M',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    118: {
        correctLetter: 'N',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','o','p','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    119: {
        correctLetter: 'O',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','p','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    120: {
        correctLetter: 'P',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','q','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    121: {
        correctLetter: 'Q',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','r','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    122: {
        correctLetter: 'R',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','s','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    123: {
        correctLetter: 'S',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','t','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    124: {
        correctLetter: 'T',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','u','v','w','x','y','z'],
        caseInsensitive: true
    },
    125: {
        correctLetter: 'U',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','v','w','x','y','z'],
        caseInsensitive: true
    },
    126: {
        correctLetter: 'V',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','w','x','y','z'],
        caseInsensitive: true
    },
    127: {
        correctLetter: 'W',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','x','y','z'],
        caseInsensitive: true
    },
    128: {
        correctLetter: 'X',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','y','z'],
        caseInsensitive: true
    },
    129: {
        correctLetter: 'Y',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','z'],
        caseInsensitive: true
    },
    130: {
        correctLetter: 'Z',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y'],
        caseInsensitive: true
    },
    // 第六阶段关卡（不显示贝壳字母，播放5遍音频，大小写混合）
    131: {
        correctLetter: 'A',
        wrongLetters: ['B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    132: {
        correctLetter: 'B',
        wrongLetters: ['A','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    133: {
        correctLetter: 'C',
        wrongLetters: ['A','B','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    134: {
        correctLetter: 'D',
        wrongLetters: ['A','B','C','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    135: {
        correctLetter: 'E',
        wrongLetters: ['A','B','C','D','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    136: {
        correctLetter: 'F',
        wrongLetters: ['A','B','C','D','E','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    137: {
        correctLetter: 'G',
        wrongLetters: ['A','B','C','D','E','F','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    138: {
        correctLetter: 'H',
        wrongLetters: ['A','B','C','D','E','F','G','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    139: {
        correctLetter: 'I',
        wrongLetters: ['A','B','C','D','E','F','G','H','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    140: {
        correctLetter: 'J',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    141: {
        correctLetter: 'K',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    142: {
        correctLetter: 'L',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    143: {
        correctLetter: 'M',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    144: {
        correctLetter: 'N',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','o','p','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    145: {
        correctLetter: 'O',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','p','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    146: {
        correctLetter: 'P',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','q','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    147: {
        correctLetter: 'Q',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','r','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    148: {
        correctLetter: 'R',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','s','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    149: {
        correctLetter: 'S',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','t','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    150: {
        correctLetter: 'T',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','u','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    151: {
        correctLetter: 'U',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','v','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    152: {
        correctLetter: 'V',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','w','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    153: {
        correctLetter: 'W',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','x','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    154: {
        correctLetter: 'X',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','y','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    155: {
        correctLetter: 'Y',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','z'],
        showShellLetter: false,
        caseInsensitive: true
    },
    156: {
        correctLetter: 'Z',
        wrongLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y'],
        showShellLetter: false,
        caseInsensitive: true
    }
};

// 创建正确气泡（大小与目标区域相同，向上移动，字母根据关卡变化）
function createBubble(targetAreaIndex) {
    var targetArea = matchAreas[targetAreaIndex];
    var radius = targetArea.radius;
    var config = levelConfig[currentLevel] || levelConfig[1];
    
    // 对于大小写不敏感的关卡，随机选择大写或小写字母
    var letter = config.correctLetter;
    if (config.caseInsensitive) {
        letter = Math.random() > 0.5 ? config.correctLetter.toUpperCase() : config.correctLetter.toLowerCase();
    }
    
    return {
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: canvas.height + radius,
        radius: radius,
        baseX: Math.random() * (canvas.width - radius * 2) + radius,
        letter: letter,
        isCorrect: true,
        alreadyScored: false,
        speed: window.currentBubbleSpeed || 2,
        opacity: Math.random() * 0.4 + 0.4,
        waveOffset: Math.random() * Math.PI * 2,
        waveAmplitude: Math.random() * 30 + 20,
        waveFrequency: Math.random() * 0.02 + 0.01
    };
}

// 创建错误气泡（向上移动，字母根据关卡变化）
function createWrongBubble(targetIndex) {
    var target = wrongBubbleTargets[targetIndex];
    var config = levelConfig[currentLevel] || levelConfig[1];
    var wrongLetters = config.wrongLetters;
    var randomLetter = wrongLetters[Math.floor(Math.random() * wrongLetters.length)];
    
    // 对于大小写不敏感的关卡，随机转换字母大小写
    if (config.caseInsensitive) {
        randomLetter = Math.random() > 0.5 ? randomLetter.toUpperCase() : randomLetter.toLowerCase();
    }
    
    return {
        x: Math.random() * (canvas.width - target.radius * 2) + target.radius,
        y: canvas.height + target.radius,
        radius: target.radius,
        baseX: Math.random() * (canvas.width - target.radius * 2) + target.radius,
        letter: randomLetter,
        isCorrect: false,
        speed: window.currentBubbleSpeed || 2,
        opacity: Math.random() * 0.4 + 0.4,
        waveOffset: Math.random() * Math.PI * 2,
        waveAmplitude: Math.random() * 30 + 20,
        waveFrequency: Math.random() * 0.02 + 0.01
    };
}

// 更新气泡位置（向上移动并带有波浪轨迹）
function updateBubbles() {
    if (gamePausedForReport) {
        return;
    }

    for (var i = bubbles.length - 1; i >= 0; i--) {
        var bubble = bubbles[i];
        keepBubbleOutsideLearningReport(bubble);
        
        // 如果气泡正在等待鲸鱼效果，不移动
        if (bubble.waitingForWhale) {
            continue;
        }
        
        // 如果气泡正在晃动
        if (bubble.shaking) {
            bubble.shakeTime += 1;
            
            // 计算晃动偏移
            var shakeOffset = Math.sin(bubble.shakeTime * 0.3) * 15;
            bubble.x = Math.max(bubble.radius, Math.min(canvas.width - bubble.radius, bubble.originalX + shakeOffset));
            
            // 晃动一段时间后消失
            if (bubble.shakeTime > 20) {
                bubbles.splice(i, 1);
            }
            continue;
        }
        
        // 如果气泡正在移动到美人鱼位置
        if (bubble.movingToMermaid) {
            var dx = bubble.mermaidTargetX - bubble.x;
            var dy = bubble.mermaidTargetY - bubble.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            
            // 移动速度加快
            var moveSpeed = 8;
            
            if (distance > moveSpeed) {
                bubble.x += (dx / distance) * moveSpeed;
                bubble.y += (dy / distance) * moveSpeed;
                // 逐渐缩小气泡
                bubble.radius *= 0.98;
                keepBubbleOutsideLearningReport(bubble);
            } else {
                // 到达美人鱼位置后消失
                bubbles.splice(i, 1);
            }
            continue;
        }
        
        // 正常向上移动并带有波浪轨迹
        bubble.y -= bubble.speed;
        bubble.waveOffset += bubble.waveFrequency;
        bubble.x = Math.max(bubble.radius, Math.min(canvas.width - bubble.radius, bubble.baseX + Math.sin(bubble.waveOffset) * bubble.waveAmplitude));
        keepBubbleOutsideLearningReport(bubble);
        
        // 如果气泡移出画面顶部，则消失
        if (bubble.y < -bubble.radius) {
            bubbles.splice(i, 1);
        }
    }
    
    // 检查游戏结束条件：所有正确气泡是否都已处理
    checkGameEnd();
}

// 检查游戏结束
function checkGameEnd() {
    // 只有当所有气泡都生成完毕后才检查
    if (!window.allBubblesGenerated) {
        return;
    }
    
    var correctBubblesRemaining = 0;
    
    for (var i = 0; i < bubbles.length; i++) {
        if (bubbles[i].isCorrect && !bubbles[i].alreadyScored) {
            correctBubblesRemaining++;
        }
    }
    
    // 如果没有剩余未点击的正确气泡，游戏结束
    if (correctBubblesRemaining === 0 && foundAreas > 0) {
        setTimeout(function() {
            gameOver('win');
        }, 1000);
    }
}

// 绘制气泡
function drawBubbles() {
    for (var i = 0; i < bubbles.length; i++) {
        var bubble = bubbles[i];
        
        if (bubbleImg.complete) {
            var size = bubble.radius * 2;
            ctx.globalAlpha = bubble.opacity;
            ctx.drawImage(bubbleImg, bubble.x - bubble.radius, bubble.y - bubble.radius, size, size);
            ctx.globalAlpha = 1;
        }
        
        // 绘制字母在气泡中间（所有气泡字母都是蓝色）
        ctx.fillStyle = '#0000ff';
        ctx.font = 'bold ' + (bubble.radius * 0.8) + 'px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bubble.letter, bubble.x, bubble.y);
    }
}

// 正确音效数组（根据点击数量使用不同音效）
var rightAudios = [];

// 初始化音频（每次交互后调用）
function initAudio() {
    // 加载4个不同阶段的正确音效
    rightAudios = [
        new Audio('assets/right1.mp3'),
        new Audio('assets/right2.mp3'),
        new Audio('assets/right3.mp3'),
        new Audio('assets/right4.mp3')
    ];
    rightAudios.forEach(function(audio) {
        audio.volume = 0.5;
    });
    wrongAudio = new Audio('assets/wrong.mp3');
    wrongAudio.volume = 0.5;
}

// 播放正确音效（根据已点击的正确泡泡数量选择不同音效）
function playRightSound(correctCount) {
    var audioIndex = 0;
    if (correctCount <= 5) {
        audioIndex = 0; // right1.mp3
    } else if (correctCount <= 10) {
        audioIndex = 1; // right2.mp3
    } else if (correctCount <= 15) {
        audioIndex = 2; // right3.mp3
    } else {
        audioIndex = 3; // right4.mp3
    }
    
    var audio = rightAudios[audioIndex];
    if (audio) {
        try {
            audio.currentTime = 0;
            audio.play().catch(function() {});
        } catch(e) {}
    }
}

// 播放错误音效
function playWrongSound() {
    if (wrongAudio) {
        try {
            wrongAudio.currentTime = 0;
            wrongAudio.play().catch(function() {});
        } catch(e) {}
    }
}

// 生成星星粒子
function generateStars() {
    stars = [];
    var starCount = 30;
    for (var i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 15 + 8,
            rotation: Math.random() * Math.PI * 2,
            color: Math.random() > 0.3 ? '#ffd700' : '#ffffff',
            alpha: Math.random() * 0.5 + 0.5,
            twinkleSpeed: Math.random() * 0.05 + 0.02,
            twinkleOffset: Math.random() * Math.PI * 2
        });
    }
}

// 更新星星（不旋转、不闪烁）
function updateStars() {
    // 星星保持静止，不旋转、不闪烁
}

// 绘制星星（不旋转、无亮光效果）
function drawStars() {
    for (var i = 0; i < stars.length; i++) {
        var star = stars[i];
        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.fillStyle = star.color;
        ctx.beginPath();
        for (var j = 0; j < 5; j++) {
            var angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
            var x = Math.cos(angle) * star.size;
            var y = Math.sin(angle) * star.size;
            if (j === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

// 显示鲸鱼答对效果
function showWhaleEffect() {
    // 清除之前的定时器
    if (whaleTimer) {
        clearTimeout(whaleTimer);
    }
    showWhale = true;
    generateStars();
    // 0.4秒后隐藏鲸鱼
    whaleTimer = setTimeout(function() {
        showWhale = false;
        stars = [];
    }, 400);
}

// 绘制鲸鱼
function drawWhale() {
    if (whaleImg.complete && showWhale) {
        // 鲸鱼大小和位置（参照图片比例）
        var whaleWidth = 675;
        var whaleHeight = whaleWidth * (whaleImg.height / whaleImg.width);
        var x = (canvas.width - whaleWidth) / 2;
        var y = (canvas.height - whaleHeight) / 2 + 50;
        
        ctx.drawImage(whaleImg, x, y, whaleWidth, whaleHeight);
    }
}

// 创建倍速按钮
function createSpeedButton() {
    if (speedButton) {
        return; // 已经创建过了
    }
    
    speedButton = document.createElement('div');
    speedButton.style.position = 'absolute';
    speedButton.style.top = '20px';
    speedButton.style.right = '20px';
    speedButton.style.width = '180px';
    speedButton.style.height = '40px';
    speedButton.style.background = 'rgba(0, 115, 255, 0.9)';
    speedButton.style.border = '2px solid rgba(255, 255, 255, 0.5)';
    speedButton.style.borderRadius = '10px';
    speedButton.style.cursor = 'pointer';
    speedButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    speedButton.style.transition = 'all 0.3s ease';
    speedButton.style.zIndex = '100';
    speedButton.style.display = 'none';
    speedButton.style.display = 'flex';
    speedButton.style.flexWrap = 'nowrap';
    speedButton.style.alignItems = 'center';
    speedButton.style.justifyContent = 'center';
    speedButton.style.gap = '8px';
    speedButton.style.padding = '0 10px';
    
    // 创建左箭头（增大倍速）
    var leftArrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    leftArrow.setAttribute('width', '50');
    leftArrow.setAttribute('height', '34');
    leftArrow.setAttribute('viewBox', '0 0 24 24');
    leftArrow.style.cursor = 'pointer';
    leftArrow.style.transition = 'all 0.2s ease';
    
    var leftPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    leftPath.setAttribute('d', 'M15 18l-6-6 6-6');
    leftPath.setAttribute('stroke', 'white');
    leftPath.setAttribute('stroke-width', '2.5');
    leftPath.setAttribute('stroke-linecap', 'round');
    leftPath.setAttribute('stroke-linejoin', 'round');
    leftPath.setAttribute('fill', 'none');
    
    leftArrow.appendChild(leftPath);
    
    leftArrow.onmouseover = function() {
        leftArrow.style.transform = 'scale(1.2)';
    };
    leftArrow.onmouseout = function() {
        leftArrow.style.transform = 'scale(1)';
    };
    leftArrow.onclick = function(e) {
        e.stopPropagation();
        // 增大倍速
        if (currentSpeedIndex < speedLevels.length - 1) {
            currentSpeedIndex++;
            updateGameSpeed();
        }
    };
    
    speedButton.appendChild(leftArrow);
    
    // 创建倍速显示文本
    var speedText = document.createElement('span');
    speedText.id = 'speedText';
    speedText.innerText = speedLevels[currentSpeedIndex].toFixed(1);
    speedText.style.color = 'white';
    speedText.style.fontSize = '25px';
    speedText.style.fontWeight = 'bold';
    speedText.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.5)';
    speedText.style.userSelect = 'none';
    
    speedButton.appendChild(speedText);
    
    // 创建右箭头（减小倍速）
    var rightArrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    rightArrow.setAttribute('width', '50');
    rightArrow.setAttribute('height', '34');
    rightArrow.setAttribute('viewBox', '0 0 24 24');
    rightArrow.style.cursor = 'pointer';
    rightArrow.style.transition = 'all 0.2s ease';
    
    var rightPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    rightPath.setAttribute('d', 'M9 18l6-6-6-6');
    rightPath.setAttribute('stroke', 'white');
    rightPath.setAttribute('stroke-width', '2.5');
    rightPath.setAttribute('stroke-linecap', 'round');
    rightPath.setAttribute('stroke-linejoin', 'round');
    rightPath.setAttribute('fill', 'none');
    
    rightArrow.appendChild(rightPath);
    
    rightArrow.onmouseover = function() {
        rightArrow.style.transform = 'scale(1.2)';
    };
    rightArrow.onmouseout = function() {
        rightArrow.style.transform = 'scale(1)';
    };
    rightArrow.onclick = function(e) {
        e.stopPropagation();
        // 减小倍速
        if (currentSpeedIndex > 0) {
            currentSpeedIndex--;
            updateGameSpeed();
        }
    };
    
    speedButton.appendChild(rightArrow);
    
    speedButton.onmouseover = function() {
        speedButton.style.transform = 'translateY(-2px) scale(1.05)';
        speedButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
    };
    
    speedButton.onmouseout = function() {
        speedButton.style.transform = 'translateY(0) scale(1)';
        speedButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    };
    
    document.body.appendChild(speedButton);
}

// 更新游戏速度
function updateGameSpeed() {
    var currentSpeed = speedLevels[currentSpeedIndex];
    
    // 更新按钮显示
    var speedText = document.getElementById('speedText');
    if (speedText) {
        speedText.innerText = 'x' + currentSpeed.toFixed(1);
    }
    
    // 更新气泡移动速度
    window.currentBubbleSpeed = 2 * currentSpeed;
    
    // 更新所有现有气泡的速度
    for (var i = 0; i < bubbles.length; i++) {
        bubbles[i].speed = 2 * currentSpeed;
    }
    
    // 更新定时器间隔
    if (timer) {
        clearInterval(timer);
        timer = setInterval(function() {
            if (gamePausedForReport) return;
            timeLeft--;
            if (timeLeft <= 0) {
                gameOver('lose');
            }
        }, 1000 / currentSpeed);
    }
}

// 显示倍速按钮
function showSpeedButton() {
    createSpeedButton();
    speedButton.style.display = 'flex';
}

// 隐藏倍速按钮
function hideSpeedButton() {
    if (speedButton) {
        speedButton.style.display = 'none';
    }
}

// 创建关卡选择按钮（使用图片）
function createLevelSelectBtn() {
    if (levelSelectBtn) {
        return; // 已经创建过了
    }
    
    levelSelectBtn = document.createElement('img');
    levelSelectBtn.src = 'assets/Levels.png';
    levelSelectBtn.style.position = 'absolute';
    levelSelectBtn.style.bottom = '20px';
    levelSelectBtn.style.left = '20px';
    levelSelectBtn.style.width = '60px';
    levelSelectBtn.style.height = '60px';
    levelSelectBtn.style.border = 'none';
    levelSelectBtn.style.borderRadius = '10px';
    levelSelectBtn.style.cursor = 'pointer';
    levelSelectBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    levelSelectBtn.style.transition = 'all 0.3s ease';
    levelSelectBtn.style.zIndex = '100';
    
    levelSelectBtn.onmouseover = function() {
        levelSelectBtn.style.transform = 'translateY(-2px) scale(1.1)';
        levelSelectBtn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
    };
    
    levelSelectBtn.onmouseout = function() {
        levelSelectBtn.style.transform = 'translateY(0) scale(1)';
        levelSelectBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    };
    
    levelSelectBtn.onclick = function() {
        showLevelSelect();
    };
    
    document.body.appendChild(levelSelectBtn);
}

// 显示关卡选择弹窗
function showLevelSelect() {
    // 如果已经存在，先移除
    if (levelSelectOverlay) {
        document.body.removeChild(levelSelectOverlay);
    }
    
    // 隐藏开始界面
    if (startBtn) {
        startBtn.style.display = 'none';
    }
    if (startOverlay) {
        startOverlay.style.display = 'none';
    }
    
    levelSelectOverlay = document.createElement('div');
    levelSelectOverlay.className = 'overlay';
    levelSelectOverlay.style.display = 'flex';
    levelSelectOverlay.style.flexDirection = 'column';
    levelSelectOverlay.style.alignItems = 'center';
    levelSelectOverlay.style.justifyContent = 'flex-start';
    levelSelectOverlay.style.zIndex = '200'; // 设置足够高的层级
    levelSelectOverlay.style.padding = '30px';
    levelSelectOverlay.style.maxHeight = '90vh';
    levelSelectOverlay.style.overflowY = 'auto';
    
    // 创建标题
    var title = document.createElement('h2');
    title.innerText = 'Select Level';
    title.style.fontSize = '48px';
    title.style.color = 'white';
    title.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
    title.style.marginBottom = '30px';
    levelSelectOverlay.appendChild(title);
    
    // 创建关卡组容器
    var levelsContainer = document.createElement('div');
    levelsContainer.style.display = 'flex';
    levelsContainer.style.flexDirection = 'column';
    levelsContainer.style.gap = '30px';
    levelsContainer.style.alignItems = 'center';
    
    // 关卡组配置
    var levelGroups = [
        { startLevel: 1, endLevel: 26, letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], title: 'Stage 1 - Uppercase', color: '#10b981' },
        { startLevel: 27, endLevel: 52, letters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'], title: 'Stage 2 - Lowercase', color: '#3b82f6' },
        { startLevel: 53, endLevel: 78, letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], title: 'Stage 3 - Listening (Upper)', color: '#f59e0b' },
        { startLevel: 79, endLevel: 104, letters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'], title: 'Stage 4 - Listening (Lower)', color: '#ec4899' },
        { startLevel: 105, endLevel: 130, letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], title: 'Stage 5 - Mixed Case', color: '#8b5cf6' },
        { startLevel: 131, endLevel: 156, letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], title: 'Stage 6 - Listening (Mixed)', color: '#14b8a6' }
    ];
    
    // 创建每个关卡组
    for (var groupIndex = 0; groupIndex < levelGroups.length; groupIndex++) {
        var group = levelGroups[groupIndex];
        
        // 创建组标题
        var groupTitle = document.createElement('h3');
        groupTitle.innerText = group.title;
        groupTitle.style.fontSize = '20px';
        groupTitle.style.color = 'white';
        groupTitle.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.5)';
        groupTitle.style.marginBottom = '15px';
        levelsContainer.appendChild(groupTitle);
        
        // 创建字母网格容器
        var letterGrid = document.createElement('div');
        letterGrid.style.display = 'grid';
        letterGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
        letterGrid.style.gap = '10px';
        letterGrid.style.maxWidth = '480px';
        
        // 创建关卡按钮
        for (var i = 0; i < group.letters.length; i++) {
            var letterBtn = document.createElement('button');
            letterBtn.innerText = group.letters[i];
            letterBtn.style.width = '55px';
            letterBtn.style.height = '55px';
            letterBtn.style.fontSize = '22px';
            letterBtn.style.fontWeight = 'bold';
            letterBtn.style.color = 'white';
            
            var levelNum = group.startLevel + i;
            
            // 检查该关卡是否存在
            if (levelConfig[levelNum]) {
                letterBtn.style.background = 'linear-gradient(135deg, ' + group.color + ', ' + adjustColor(group.color, -30) + ')';
                letterBtn.style.cursor = 'pointer';
                letterBtn.onclick = (function(level, stageNum) {
                return function() {
                    currentLevel = level;
                    currentStage = stageNum; // 设置当前阶段
                    document.body.removeChild(levelSelectOverlay);
                    levelSelectOverlay = null;
                    // 如果结算界面存在，也移除它
                    if (resultOverlay && document.body.contains(resultOverlay)) {
                        document.body.removeChild(resultOverlay);
                        resultOverlay = null;
                    }
                    startGame();
                };
            })(levelNum, groupIndex + 1);
            } else {
                letterBtn.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
                letterBtn.style.cursor = 'not-allowed';
                letterBtn.style.opacity = '0.6';
            }
            
            letterBtn.style.border = 'none';
            letterBtn.style.borderRadius = '8px';
            letterBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
            letterBtn.style.transition = 'all 0.3s ease';
            
            letterBtn.onmouseover = function() {
                if (this.style.cursor === 'pointer') {
                    this.style.transform = 'translateY(-2px) scale(1.1)';
                    this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
                }
            };
            
            letterBtn.onmouseout = function() {
                if (this.style.cursor === 'pointer') {
                    this.style.transform = 'translateY(0) scale(1)';
                    this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
                }
            };
            
            letterGrid.appendChild(letterBtn);
        }
        
        levelsContainer.appendChild(letterGrid);
    }
    
    levelSelectOverlay.appendChild(levelsContainer);
    
    // 辅助函数：调整颜色亮度
    function adjustColor(color, amount) {
        var hex = color.replace('#', '');
        var r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        var g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        var b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
    }
    
    // 添加关闭按钮
    var closeBtn = document.createElement('button');
    closeBtn.innerText = 'Close';
    closeBtn.style.marginTop = '30px';
    closeBtn.style.padding = '10px 30px';
    closeBtn.style.fontSize = '18px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.color = 'white';
    closeBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '10px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    closeBtn.style.transition = 'all 0.3s ease';
    
    closeBtn.onmouseover = function() {
        closeBtn.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
        closeBtn.style.transform = 'translateY(-2px)';
        closeBtn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
    };
    
    closeBtn.onmouseout = function() {
        closeBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        closeBtn.style.transform = 'translateY(0)';
        closeBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    };
    
    closeBtn.onclick = function() {
        document.body.removeChild(levelSelectOverlay);
        levelSelectOverlay = null;
        // 如果游戏还没开始（初始状态），显示开始界面
        if (score === 0 && gameState === 'start') {
            if (startBtn) {
                startBtn.style.display = 'block';
            }
            if (startOverlay) {
                startOverlay.style.display = 'flex';
            }
        }
    };
    
    levelSelectOverlay.appendChild(closeBtn);
    
    document.body.appendChild(levelSelectOverlay);
}

// 显示关卡选择按钮
function showLevelSelectBtn() {
    createLevelSelectBtn();
    levelSelectBtn.style.display = 'block';
}

// 开始游戏
function startGame() {
    // 增加玩家玩过的关数
    playCount++;
    
    // 如果是从开始按钮启动，随机选择关卡（只在第一阶段1-26关中随机）
    if (startBtn.style.display !== 'none') {
        // 随机生成 1-26 之间的关卡号（第一阶段）
        currentLevel = Math.floor(Math.random() * 26) + 1;
    }
    
    // 根据关卡号自动确定当前阶段
    if (currentLevel >= 1 && currentLevel <= 26) {
        currentStage = 1;
    } else if (currentLevel >= 27 && currentLevel <= 52) {
        currentStage = 2;
    } else if (currentLevel >= 53 && currentLevel <= 78) {
        currentStage = 3;
    } else if (currentLevel >= 79 && currentLevel <= 104) {
        currentStage = 4;
    } else if (currentLevel >= 105 && currentLevel <= 130) {
        currentStage = 5;
    } else if (currentLevel >= 131 && currentLevel <= 156) {
        currentStage = 6;
    }
    
    // 对于大小写不敏感的关卡，随机确定贝壳上显示的字母（大写或小写）
    var config = levelConfig[currentLevel];
    if (config && config.caseInsensitive) {
        displayedShellLetter = Math.random() > 0.5 ? config.correctLetter.toUpperCase() : config.correctLetter.toLowerCase();
    } else {
        displayedShellLetter = null;
    }
    
    gameState = 'playing';
    gamePausedForReport = false;
    if (learningReportOverlay) {
        closeLearningReport();
    }
    score = 0;
    gameTracker.start();
    timeLeft = 60;
    foundAreas = 0;
    showWhale = false;
    window.allBubblesGenerated = false;
    // 使用用户在开始界面设置的倍速
    window.currentBubbleSpeed = 2 * speedLevels[currentSpeedIndex];
    stars = [];
    if (whaleTimer) {
        clearTimeout(whaleTimer);
        whaleTimer = null;
    }
    
    for (var i = 0; i < matchAreas.length; i++) {
        matchAreas[i].found = false;
    }
    
    startBtn.style.display = 'none';
    startOverlay.style.display = 'none';
    
    // 隐藏关卡选择按钮
    if (levelSelectBtn) {
        levelSelectBtn.style.display = 'none';
    }
    
    // 隐藏倍速按钮（游戏进行中不显示）
    hideSpeedButton();
    showLearningReportButton();
    
    // 播放背景音乐（循环播放）
    if (!backgroundMusic) {
        backgroundMusic = new Audio('assets/background.mp3');
        backgroundMusic.volume = 0.10;
        backgroundMusic.loop = true;
    }
    try {
        backgroundMusic.play().catch(function() {});
    } catch(e) {}
    
    initAudio();
    
    // 如果是第3、4、6阶段（不显示贝壳字母，读音阶段），每3秒播放一次正确字母音频
    var config = levelConfig[currentLevel];
    if (config && config.showShellLetter === false) {
        // 立即播放一次
        setTimeout(function() {
            playLetterSound(config.correctLetter);
        }, 500);
        
        // 之后每3秒播放一次
        audioPlayTimer = setInterval(function() {
            if (gamePausedForReport) return;
            playLetterSound(config.correctLetter);
        }, 3000);
    }
    
    timer = setInterval(function() {
        if (gamePausedForReport) return;
        timeLeft--;
        if (timeLeft <= 0) {
            gameOver('lose');
        }
    }, 1000);
    
    // 启动气泡生成（20 个正确气泡 + 30 个错误气泡，随机乱序）
    bubbles = [];
    
    // 创建气泡类型序列（20 个正确气泡，30 个错误气泡）
    var bubbleSequence = [];
    for (var i = 0; i < 20; i++) {
        bubbleSequence.push({ type: 'correct', index: i % 5 });
    }
    for (var j = 0; j < 30; j++) {
        bubbleSequence.push({ type: 'wrong', index: j % 4 });
    }
    
    // 打乱顺序（Fisher-Yates 洗牌算法）
    for (var k = bubbleSequence.length - 1; k > 0; k--) {
        var m = Math.floor(Math.random() * (k + 1));
        var temp = bubbleSequence[k];
        bubbleSequence[k] = bubbleSequence[m];
        bubbleSequence[m] = temp;
    }
    
    var sequenceIndex = 0;
    var currentSpawnInterval = 800 / speedLevels[currentSpeedIndex]; // 初始生成间隔（毫秒），应用倍速
    var currentSpeed = 2 * speedLevels[currentSpeedIndex]; // 初始移动速度，应用倍速
    var speedIncreaseInterval = 5000 / speedLevels[currentSpeedIndex]; // 速度增加间隔，应用倍速
    var lastSpeedIncreaseTime = Date.now();
    
    // 立即生成第一个气泡
    if (sequenceIndex < bubbleSequence.length) {
        var firstBubble = bubbleSequence[sequenceIndex];
        if (firstBubble.type === 'correct') {
            bubbles.push(createBubble(firstBubble.index));
        } else {
            bubbles.push(createWrongBubble(firstBubble.index));
        }
        sequenceIndex++;
    }
    
    // 气泡生成定时器
    var spawnBubble = function() {
        if (gamePausedForReport) {
            bubbleTimer = setTimeout(spawnBubble, 100);
            return;
        }

        if (sequenceIndex >= bubbleSequence.length) {
            if (bubbleTimer) {
                clearInterval(bubbleTimer);
                bubbleTimer = null;
                window.allBubblesGenerated = true;
            }
            return;
        }
        
        var bubbleInfo = bubbleSequence[sequenceIndex];
        if (bubbleInfo.type === 'correct') {
            bubbles.push(createBubble(bubbleInfo.index));
        } else {
            bubbles.push(createWrongBubble(bubbleInfo.index));
        }
        sequenceIndex++;
        
        // 逐渐加快生成速度（每生成一个气泡，间隔减少 20ms，最小 150ms）
        currentSpawnInterval = Math.max(400, currentSpawnInterval - 20);
        
        // 清除旧的定时器，设置新的定时器
        if (bubbleTimer) {
            clearInterval(bubbleTimer);
        }
        bubbleTimer = setTimeout(spawnBubble, currentSpawnInterval);
    };
    
    // 启动气泡生成
    bubbleTimer = setTimeout(spawnBubble, currentSpawnInterval);
    
    // 定期增加气泡移动速度
    var speedTimer = setInterval(function() {
        if (gamePausedForReport) {
            return;
        }

        if (sequenceIndex >= bubbleSequence.length) {
            clearInterval(speedTimer);
            return;
        }
        
        // 每 5 秒增加一次速度（增加 0.5）
        currentSpeed = Math.min(10, currentSpeed + 0.60);
        window.currentBubbleSpeed = currentSpeed;
        
        // 更新所有现有气泡的速度
        for (var i = 0; i < bubbles.length; i++) {
            bubbles[i].speed = currentSpeed;
        }
    }, speedIncreaseInterval);
}

// 游戏结束
function gameOver(result) {
    gameState = result;
    gamePausedForReport = false;
    hideLearningReportButton();
    stopReportNarration();
    if (learningReportOverlay && document.body.contains(learningReportOverlay)) {
        document.body.removeChild(learningReportOverlay);
        learningReportOverlay = null;
    }
    
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    if (audioPlayTimer) {
        clearInterval(audioPlayTimer);
        audioPlayTimer = null;
    }
    
    if (bubbleTimer) {
        clearTimeout(bubbleTimer);
        bubbleTimer = null;
    }
    
    if (whaleTimer) {
        clearTimeout(whaleTimer);
        whaleTimer = null;
    }
    
    // 清除所有定时器
    var id = window.setTimeout(function() {}, 0);
    while (id--) {
        window.clearTimeout(id);
        window.clearInterval(id);
    }
    
    stars = [];
    window.allBubblesGenerated = false;
    window.currentBubbleSpeed = 2;
    
    // 更新当前关卡字母的得分记录
    var currentLetter = levelConfig[currentLevel] ? levelConfig[currentLevel].correctLetter : 'A';
    letterScores[currentLetter].stageRecords[currentStage] = score; // 记录该阶段最新一次得分
    letterScores[currentLetter].lastStage = currentStage; // 记录最新一次所在的阶段
    
    // 计算当前关卡正确率（满分20分，正确率 = score / 20 * 100%）
    levelAccuracy = (score / 20) * 100;
    
    // 更新当前阶段的进度（记录已玩过的关卡）
    if (!stageProgress[currentStage].includes(currentLevel)) {
        stageProgress[currentStage].push(currentLevel);
    }
    
    // 阶段升级逻辑
    if (levelAccuracy >= 85) {
        consecutiveHighAccuracy++;
        
        // 前5个阶段：连续3关正确率 >= 85% 可以直接升级，随机选择新阶段的关卡
        // 但是如果当前是阶段最后一关，不立即升级，需要在下一关（阶段第一关）才升级
        if (consecutiveHighAccuracy >= 3 && currentStage < 6) {
            var currentStageCfg = stageConfig[currentStage - 1];
            // 检查当前是否是阶段的最后一关
            if (currentLevel < currentStageCfg.end) {
                // 不是最后一关，可以升级
                currentStage++;
                consecutiveHighAccuracy = 0;
                // 随机选择新阶段的一个关卡
                var newStageConfig = stageConfig[currentStage - 1];
                currentLevel = Math.floor(Math.random() * (newStageConfig.end - newStageConfig.start + 1)) + newStageConfig.start;
            }
            // 如果是最后一关，不升级，保持连续计数，在下一关（阶段第一关）再检查
        }
        // 第6阶段：连续3关正确率 >= 85% 不升级，继续按顺序进行
    } else {
        // 如果正确率低于85%，重置连续计数
        consecutiveHighAccuracy = 0;
    }
    
    onReport(score);
    gameTracker.finish(score);
    showResult(result);
}

// 预加载结算图片
var end1Img = new Image();
end1Img.src = 'assets/end1.png';
var end2Img = new Image();
end2Img.src = 'assets/end2.png';
var end3Img = new Image();
end3Img.src = 'assets/end3.png';

// 显示结果界面
// 结算音效缓存
var resultAudios = [];

// 播放结算音效
function playResultSound(score) {
    // 如果没有缓存，创建音效对象
    if (resultAudios.length === 0) {
        resultAudios = [
            new Audio('assets/right1.mp3'),
            new Audio('assets/right2.mp3'),
            new Audio('assets/right3.mp3'),
            new Audio('assets/right4.mp3')
        ];
        resultAudios.forEach(function(audio) {
            audio.volume = 0.5;
        });
    }
    
    var audioIndex = 0;
    if (score >= 18) {
        audioIndex = 3; // right4.mp3
    } else if (score >= 16) {
        audioIndex = 2; // right3.mp3
    } else if (score >= 12) {
        audioIndex = 1; // right2.mp3
    } else {
        audioIndex = 0; // right1.mp3
    }
    
    try {
        resultAudios[audioIndex].currentTime = 0;
        resultAudios[audioIndex].play().catch(function() {});
    } catch(e) {}
}

function showResult(result) {
    hideLearningReportButton();
    // 隐藏关卡选择按钮（结算界面不需要）
    if (levelSelectBtn) {
        levelSelectBtn.style.display = 'none';
    }
    
    // 显示倍速按钮（结算界面也需要）
    showSpeedButton();
    
    resultOverlay = document.createElement('div');
    resultOverlay.className = 'overlay';
    resultOverlay.style.zIndex = '50'; // 设置低于关卡选择按钮
    
    // 根据得分显示不同的界面并播放对应音效
    var endImg;
    if (score >= 18) {
        // 得分 >= 18：显示 end3.png 图片
        endImg = document.createElement('img');
        endImg.src = 'assets/end3.png';
        playResultSound(score); // 播放 right4.mp3
    } else if (score >= 16) {
        // 得分 >= 16 且 < 18：显示 end2.png 图片
        endImg = document.createElement('img');
        endImg.src = 'assets/end2.png';
        playResultSound(score); // 播放 right3.mp3
    } else if (score >= 12) {
        // 得分 >= 12 且 < 16：显示 end1.png 图片
        endImg = document.createElement('img');
        endImg.src = 'assets/end1.png';
        playResultSound(score); // 播放 right2.mp3
    }
    
    if (endImg) {
        endImg.style.width = '400px';
        endImg.style.height = 'auto';
        endImg.style.borderRadius = '10px';
        resultOverlay.appendChild(endImg);
    } else {
        // 得分 < 12：显示之前的结算界面
        var title = document.createElement('h1');
        title.style.fontSize = '64px';
        title.style.marginBottom = '20px';
        title.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
        title.style.color = 'white';
        if (result === 'win') {
            title.innerText = 'Keep it up!';
        } else {
            title.innerText = "Time's up!";
        }
        resultOverlay.appendChild(title);
        
        playResultSound(score); // 播放 right1.mp3
    }
    
    // 显示分数
    var scoreText = document.createElement('p');
    scoreText.innerText = 'Final Score: ' + score;
    scoreText.style.fontSize = '32px';
    scoreText.style.margin = '0';
    scoreText.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.5)';
    scoreText.style.color = 'white';
    resultOverlay.appendChild(scoreText);
    
    // 检查是否所有关卡都已通过（所有字母都有记录且最新得分 >= 12）
    function checkAllLevelsCompleted() {
        for (var i = 0; i < allLetters.length; i++) {
            var letter = allLetters[i];
            var record = letterScores[letter];
            // 如果有字母没有尝试过，或者最新得分 < 12，则未完成
            if (record.lastStage === 0 || record.stageRecords[record.lastStage] < 12) {
                return false;
            }
        }
        return true;
    }
    
    // 通关后的关间结算不再显示操作按钮，停留 1.5 秒后沿用原规则进入下一关。
    var shouldAutoAdvance = score >= 12 && !checkAllLevelsCompleted();
    
    document.body.appendChild(resultOverlay);

    if (shouldAutoAdvance) {
        setTimeout(function() {
            if (resultOverlay && document.body.contains(resultOverlay)) {
                document.body.removeChild(resultOverlay);
                resultOverlay = null;
            }
            showLevelSelectBtn();

            // 保持原“下一关”按钮的阶段升级和关卡循环规则。
            var stageAdvanced = consecutiveHighAccuracy === 0 && levelAccuracy >= 95 && currentStage > 1;

            if (!stageAdvanced) {
                var currentStageCfg = stageConfig[currentStage - 1];
                if (currentLevel >= currentStageCfg.end) {
                    currentLevel = currentStageCfg.start;
                    if (consecutiveHighAccuracy >= 3 && currentStage < 6) {
                        currentStage++;
                        consecutiveHighAccuracy = 0;
                        var newStageConfig = stageConfig[currentStage - 1];
                        currentLevel = Math.floor(Math.random() * (newStageConfig.end - newStageConfig.start + 1)) + newStageConfig.start;
                    }
                } else if (levelConfig[currentLevel + 1]) {
                    currentLevel++;
                } else if (currentStage === 6) {
                    var stage6 = stageConfig[5];
                    var unplayedLevels = [];
                    for (var i = stage6.start; i <= stage6.end; i++) {
                        if (!stageProgress[6].includes(i)) {
                            unplayedLevels.push(i);
                        }
                    }

                    if (unplayedLevels.length > 0) {
                        currentLevel = unplayedLevels[0];
                    } else {
                        var allCleared = true;
                        for (var k = stage6.start; k <= stage6.end; k++) {
                            if (!stageProgress[6].includes(k)) {
                                allCleared = false;
                                break;
                            }
                        }
                        if (allCleared) {
                            addScoreReport();
                            return;
                        }
                    }
                } else {
                    var allCleared = true;
                    for (var j = currentStageCfg.start; j <= currentStageCfg.end; j++) {
                        var record = letterScores[levelConfig[j].correctLetter.toUpperCase()];
                        if (!stageProgress[currentStage].includes(j) || (record.lastStage > 0 && record.stageRecords[record.lastStage] < 12)) {
                            allCleared = false;
                            break;
                        }
                    }

                    if (allCleared) {
                        currentStage++;
                        currentLevel = stageConfig[currentStage - 1].start;
                    } else {
                        currentLevel = currentStageCfg.start;
                    }
                }
            }
            startGame();
        }, 1500);
    }
    
    // 得分 < 12 时，2秒后自动结束游戏
    // 检查第6阶段是否所有关卡都已通关
    function checkStage6Completed() {
        var stage6 = stageConfig[5];
        for (var i = stage6.start; i <= stage6.end; i++) {
            if (!stageProgress[6].includes(i)) {
                return false;
            }
        }
        return true;
    }
    
    // 当得分 < 12 或者第6阶段所有关卡都已通关时，显示成绩列表
    var showReport = score < 12 || checkStage6Completed();
    
    if (showReport) {
        // 1秒后隐藏结算界面元素，只显示成绩列表
        setTimeout(function() {
            // 清空结算界面的所有子元素（标题和分数）
            while (resultOverlay.firstChild) {
                resultOverlay.removeChild(resultOverlay.firstChild);
            }
            
            // 显示成绩列表（包含 end 按钮）
            addScoreReport();
        }, 1000); // 1秒后显示成绩列表
    }
}

// 添加成绩列表
function addScoreReport(options) {
    options = options || {};
    var targetOverlay = options.overlay || resultOverlay;

    // 创建成绩列表容器（使用 report.png 作为背景）
    var reportContainer = document.createElement('div');
    reportContainer.style.marginTop = '20px';
    reportContainer.style.width = '600px';
    reportContainer.style.height = '550px';
    reportContainer.style.backgroundImage = 'url(assets/report.png)';
    reportContainer.style.backgroundSize = 'contain';
    reportContainer.style.backgroundRepeat = 'no-repeat';
    reportContainer.style.backgroundPosition = 'center';
    reportContainer.style.position = 'relative';
    reportContainer.style.overflow = 'hidden';
    
    // 创建内容容器（在云朵形框内）
    var contentContainer = document.createElement('div');
    contentContainer.style.position = 'absolute';
    contentContainer.style.top = '210px';
    contentContainer.style.left = '75px';
    contentContainer.style.right = '75px';
    contentContainer.style.bottom = '170px';
    contentContainer.style.overflowY = 'auto';
    
    // 计算每个字母的准确率并显示
    var reportContent = document.createElement('div');
    reportContent.style.display = 'flex';
    reportContent.style.flexWrap = 'wrap';
    reportContent.style.justifyContent = 'flex-start';
    reportContent.style.gap = '8px';
    
    // 收集玩家玩过的字母在各个阶段的记录
    var letterRecords = [];
    var uppercaseLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    
    uppercaseLetters.forEach(function(upperLetter) {
        var lowerLetter = upperLetter.toLowerCase();
        var upperRecord = letterScores[upperLetter];
        var lowerRecord = letterScores[lowerLetter];
        
        // 获取该字母所有阶段的记录（大写和小写合并）
        var allStages = {};
        
        // 添加大写字母的所有阶段记录
        for (var stage in upperRecord.stageRecords) {
            allStages[stage] = {
                score: upperRecord.stageRecords[stage],
                isUpper: true
            };
        }
        
        // 添加小写字母的所有阶段记录
        for (var stage in lowerRecord.stageRecords) {
            allStages[stage] = {
                score: lowerRecord.stageRecords[stage],
                isUpper: false
            };
        }
        
        // 遍历所有阶段记录
        for (var stage in allStages) {
            var stageNum = parseInt(stage);
            var record = allStages[stage];
            var accuracy = Math.round((record.score / 20) * 100);
            
            // 根据阶段确定显示格式
            var displayText = '';
            var letterDisplay = '';
            
            switch(stageNum) {
                case 1: // 大写字母字形
                    letterDisplay = upperLetter;
                    displayText = upperLetter + '字形掌握进度：' + accuracy + '%';
                    break;
                case 2: // 小写字母字形
                    letterDisplay = lowerLetter;
                    displayText = lowerLetter + '字形掌握进度：' + accuracy + '%';
                    break;
                case 3: // 大写字母读音
                    letterDisplay = upperLetter;
                    displayText = upperLetter + '读音掌握进度：' + accuracy + '%';
                    break;
                case 4: // 小写字母读音
                    letterDisplay = lowerLetter;
                    displayText = lowerLetter + '读音掌握进度：' + accuracy + '%';
                    break;
                case 5: // 大写字母小写字母字形
                    letterDisplay = upperLetter + lowerLetter;
                    displayText = upperLetter + lowerLetter + '字形掌握进度：' + accuracy + '%';
                    break;
                case 6: // 大写字母小写字母读音
                    letterDisplay = upperLetter + lowerLetter;
                    displayText = upperLetter + lowerLetter + '读音掌握进度：' + accuracy + '%';
                    break;
            }
            
            letterRecords.push({
                letter: letterDisplay,
                audioLetter: upperLetter,
                fullText: displayText,
                accuracy: accuracy
            });
        }
    });
    
    // 排序：按准确率降序，准确率相同按字母升序
    letterRecords.sort(function(a, b) {
        // 先按准确率降序
        if (b.accuracy !== a.accuracy) {
            return b.accuracy - a.accuracy;
        }
        // 准确率相同，按字母升序
        return a.letter.localeCompare(b.letter);
    });
    
    // 渲染排序后的字母
    letterRecords.forEach(function(item) {
        var letterItem = document.createElement('div');
        letterItem.style.background = 'rgba(255, 255, 255, 0.7)';
        letterItem.style.padding = '3px 8px';
        letterItem.style.borderRadius = '4px';
        letterItem.style.minWidth = '100px';
        letterItem.style.textAlign = 'center';
        
        var letterText = document.createElement('span');
        letterText.innerText = item.fullText;
        letterText.style.fontSize = '12px';
        // 掌握进度低于60%的标红，大于等于60%的保持原色
        letterText.style.color = item.accuracy < 60 ? '#FF0000' : '#333';
        letterText.style.fontWeight = 'bold';
        
        letterItem.appendChild(letterText);
        reportContent.appendChild(letterItem);
    });

    if (letterRecords.length === 0) {
        var emptyMessage = document.createElement('div');
        emptyMessage.innerText = '无';
        emptyMessage.style.width = '100%';
        emptyMessage.style.padding = '22px 12px';
        emptyMessage.style.color = '#17647b';
        emptyMessage.style.fontSize = '24px';
        emptyMessage.style.fontWeight = 'bold';
        emptyMessage.style.textAlign = 'center';
        reportContent.appendChild(emptyMessage);
    }
    
    contentContainer.appendChild(reportContent);
    reportContainer.appendChild(contentContainer);
    // 不再显示底部进度条
    
    // 添加报告操作按钮
    var endBtn = document.createElement('button');
    if (options.closeOnly) {
        var actionContainer = document.createElement('div');
        actionContainer.className = 'report-manual-actions';

        endBtn.innerText = '继续挑战';
        endBtn.className = 'report-manual-button report-continue-button';
        endBtn.onclick = function() {
            if (typeof options.onClose === 'function') {
                options.onClose();
            }
        };

        var manualReplayBtn = document.createElement('button');
        manualReplayBtn.innerText = '再玩一次';
        manualReplayBtn.className = 'report-manual-button report-manual-replay-button';
        manualReplayBtn.onclick = restartEverything;

        actionContainer.appendChild(endBtn);
        actionContainer.appendChild(manualReplayBtn);
        reportContainer.appendChild(actionContainer);
    } else {
        endBtn.innerText = '再玩一次';
        endBtn.className = 'report-replay-button';
        endBtn.style.position = 'absolute';
        // 向上移动一个按钮自身的高度（48px）。
        endBtn.style.bottom = '48px';
        endBtn.style.left = '50%';
        endBtn.style.transform = 'translateX(-50%)';
        endBtn.style.outline = 'none';
        endBtn.onclick = restartEverything;
        reportContainer.appendChild(endBtn);
    }
    
    if (targetOverlay) {
        targetOverlay.appendChild(reportContainer);
        playReportNarration(letterRecords);
    }
}

// 绘制红色虚线圆
function drawDashedCircle(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff0000';
    ctx.setLineDash([10, 5]);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.setLineDash([]);
}

// 绘制绿色填充圆
function drawGreenCircle(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
    ctx.fill();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.stroke();
}

// 绘制灰色圆框
function drawGrayCircle(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = 'rgba(128, 128, 128, 0.2)';
    ctx.fill();
}

// 绘制区域编号
function drawAreaNumber(x, y, number) {
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number.toString(), x, y);
}

// 绘制橙色虚线圆（错误气泡目标位置）
function drawOrangeDashedCircle(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff8800';
    ctx.setLineDash([10, 5]);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.setLineDash([]);
}

// 绘制错误气泡目标位置编号
function drawWrongBubbleNumber(x, y, number) {
    ctx.fillStyle = '#ff8800';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number.toString(), x, y);
}

// 更新UI（关卡、得分信息条与学习报告按钮均由 DOM 层显示）
function drawUI() {
    if (levelInfo) {
        levelInfo.innerText = playCount;
    }
    if (scoreInfo) {
        scoreInfo.innerText = score;
    }
    alignLearningReportButtonWithScore();
}

// 主绘制函数
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (backgroundImg.complete) {
        var imgWidth = backgroundImg.width;
        var imgHeight = backgroundImg.height;
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;
        
        var scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
        var x = (canvasWidth - imgWidth * scale) / 2;
        var y = (canvasHeight - imgHeight * scale) / 2;
        
        ctx.drawImage(backgroundImg, x, y, imgWidth * scale, imgHeight * scale);
    }
    
    // 绘制戳泡泡示意图（跟随当前关卡显示）
    if (gameState === 'playing' && pokeImg.complete) {
        // 更新缩放动画
        pokeScale += pokeConfig.speed * pokeScaleDirection;
        if (pokeScale >= pokeConfig.scaleMax || pokeScale <= pokeConfig.scaleMin) {
            pokeScaleDirection *= -1;
        }
        
        // 计算当前缩放后的尺寸
        var pokeHeight = pokeConfig.width * (pokeImg.height / pokeImg.width);
        var currentWidth = pokeConfig.width * pokeScale;
        var currentHeight = pokeHeight * pokeScale;
        
        // 计算绘制位置（保持中心点不变）
        var drawX = pokeConfig.x - (currentWidth - pokeConfig.width) / 2;
        var drawY = pokeConfig.y - (currentHeight - pokeHeight) / 2;
        
        // 绘制示意图
        ctx.drawImage(pokeImg, drawX, drawY, currentWidth, currentHeight);
    }
    
    // 绘制贝壳（在画面上方）
    if (shellImg.complete) {
        var shellHeight = shellConfig.width * (shellImg.height / shellImg.width);
        
        // 指导关卡贝壳提示效果
        if (gameState === 'tutorial' && showShellHint) {
            var elapsed = Date.now() - shellHintStartTime;
            if (elapsed < 4000) { // 持续4秒
                // 计算脉冲动画（逐渐减弱）
                var progress = elapsed / 4000;
                var pulsePhase = Math.sin(elapsed / 150) * 0.5 + 0.5;
                var alpha = (1 - progress) * pulsePhase * 0.8; // 逐渐减弱，最大0.6透明度
                
                // 绘制柔和的光晕效果
                ctx.save();
                ctx.globalAlpha = alpha;
                
                // 外圈光晕
                var glowRadius = shellConfig.width * 0.8 + Math.sin(elapsed / 100) * 10;
                var gradient = ctx.createRadialGradient(
                    shellConfig.x + shellConfig.width / 2,
                    shellConfig.y + shellHeight / 2,
                    shellConfig.width * 0.3,
                    shellConfig.x + shellConfig.width / 2,
                    shellConfig.y + shellHeight / 2,
                    glowRadius
                );
                gradient.addColorStop(0, 'rgba(255, 0, 0, 1)'); // 红色中心
                gradient.addColorStop(0.5, 'rgba(255, 182, 193, 0.5)'); // 粉色中间
                gradient.addColorStop(1, 'rgba(173, 216, 230, 0)'); // 淡蓝色透明边缘
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(
                    shellConfig.x + shellConfig.width / 2,
                    shellConfig.y + shellHeight / 2,
                    glowRadius,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.restore();
            } else {
                showShellHint = false;
            }
        }
        
        ctx.drawImage(shellImg, shellConfig.x, shellConfig.y, shellConfig.width, shellHeight);
        
        // 在游戏进行中、结束或指导关卡时绘制贝壳中间的字母
        if (gameState === 'playing' || gameState === 'end' || gameState === 'tutorial') {
            var config = levelConfig[currentLevel] || levelConfig[1];
            // 检查是否需要显示贝壳字母（指导关卡始终显示，其他关卡根据配置）
            var shouldShowLetter = gameState === 'tutorial' || config.showShellLetter === undefined || config.showShellLetter === true;
            
            if (shouldShowLetter) {
                var letter = 'A'; // 指导关卡固定显示A
                if (gameState !== 'tutorial') {
                    letter = config.correctLetter;
                    // 对于大小写不敏感的关卡，使用预先确定的字母
                    if (config.caseInsensitive && displayedShellLetter) {
                        letter = displayedShellLetter;
                    }
                }
                
                // 计算字母位置（贝壳中心）
                var letterX = shellConfig.x + shellConfig.width / 2 +1;
                var letterY = shellConfig.y + shellHeight / 2 +5;
                
                // 设置字母样式
                ctx.font = 'bold ' + (shellConfig.width * 0.5) + 'px Arial';
                ctx.fillStyle = '#1e40af'; // 深蓝色
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 3;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                
                // 第5阶段（关卡105-130）：同时显示大写字母和小写字母在贝壳内
                if (currentStage === 5 && config.caseInsensitive) {
                    // 确定大写和小写字母
                    var upperLetter = letter.toUpperCase();
                    var lowerLetter = letter.toLowerCase();
                    
                    // 大写字母使用较大字体
                    ctx.font = 'bold ' + (shellConfig.width * 0.35) + 'px Arial';
                    ctx.fillText(upperLetter, letterX - shellConfig.width * 0.12, letterY);
                    
                    // 小写字母使用稍小字体
                    ctx.font = 'bold ' + (shellConfig.width * 0.28) + 'px Arial';
                    ctx.fillText(lowerLetter, letterX + shellConfig.width * 0.14, letterY);
                } else {
                    // 其他阶段：正常显示一个字母
                    ctx.fillText(letter, letterX, letterY);
                }
                
                // 清除阴影
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }
            
            // 第3、4、6阶段（读音阶段）：在贝壳上显示喇叭图标
            if ((currentStage === 3 || currentStage === 4 || currentStage === 6) && labaImg.complete) {
                // 计算喇叭位置（贝壳中心）
                var labaX = shellConfig.x + shellConfig.width / 2;
                var labaY = shellConfig.y + shellHeight / 2;
                // 设置喇叭大小（根据贝壳大小缩放）
                var labaSize = shellConfig.width * 0.5;
                ctx.drawImage(labaImg, labaX - labaSize / 2, labaY - labaSize / 2, labaSize, labaSize);
            }
            
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        
        // 指导关卡：绘制指向贝壳的红色箭头（持续2秒）
        if (gameState === 'tutorial' && showJiantou && jiantouImg.complete) {
            var jiantouElapsed = Date.now() - jiantouStartTime;
            if (jiantouElapsed < 2500) { // 持续2.5秒
                // 更新箭头缩放动画
                jiantouScale += jiantouConfig.speed * jiantouScaleDirection;
                if (jiantouScale >= jiantouConfig.scaleMax) {
                    jiantouScale = jiantouConfig.scaleMax;
                    jiantouScaleDirection = -1;
                } else if (jiantouScale <= jiantouConfig.scaleMin) {
                    jiantouScale = jiantouConfig.scaleMin;
                    jiantouScaleDirection = 1;
                }
                
                // 计算箭头尺寸
                var jiantouHeight = jiantouConfig.width * (jiantouImg.height / jiantouImg.width);
                var currentJiantouWidth = jiantouConfig.width * jiantouScale;
                var currentJiantouHeight = jiantouHeight * jiantouScale;
                
                // 箭头位置：在贝壳左下方，指向贝壳
                var jiantouX = shellConfig.x - currentJiantouWidth + 160;
                var jiantouY = shellConfig.y + shellHeight / 2 - currentJiantouHeight / 2 + 80;
                
                // 保存当前状态
                ctx.save();
                
                // 移动到箭头中心，旋转45度指向右上方（指向贝壳）
                ctx.translate(jiantouX + currentJiantouWidth / 2, jiantouY + currentJiantouHeight / 2);
                ctx.rotate(Math.PI / 4); // 旋转45度指向右上方
                
                // 绘制箭头（居中）
                ctx.drawImage(
                    jiantouImg,
                    -currentJiantouWidth / 2,
                    -currentJiantouHeight / 2,
                    currentJiantouWidth,
                    currentJiantouHeight
                );
                
                ctx.restore();
            } else {
                showJiantou = false;
                showHand = true; // 箭头消失后显示手
            }
        }
    }
    
    // 绘制美人鱼（在右下角）
    if (mermaidImg.complete) {
        var mermaidWidth = 900;
        var mermaidHeight = mermaidWidth * (mermaidImg.height / mermaidImg.width);
        var mermaidX = canvas.width - mermaidWidth +310;
        var mermaidY = canvas.height - mermaidHeight +80;
        ctx.drawImage(mermaidImg, mermaidX, mermaidY, mermaidWidth, mermaidHeight);
    }
    
    if (gameState === 'playing') {
        updateBubbles();
        drawBubbles();
        drawUI();
        
        // 绘制星星效果（鲸鱼出现时显示）
        if (showWhale) {
            updateStars();
            drawStars();
        }
        
        // 绘制鲸鱼答对效果（最上层）
        drawWhale();
    } else if (gameState === 'tutorial') {
        // 指导关卡：更新和绘制指导气泡
        updateTutorialBubbles();
        drawTutorialBubbles();
        
        // 更新和绘制礼花
        updateFireworks();
        drawFireworks();
    } else {
        // 游戏未进行中且不是指导关卡时，显示关卡选择按钮
        if (gameState !== 'tutorial') {
            showLevelSelectBtn();
            // 倍速按钮在开始界面和结算界面都显示
            if (gameState === 'start' || gameState === 'win' || gameState === 'lose') {
                showSpeedButton();
            } else {
                hideSpeedButton();
            }
        } else if (levelSelectBtn) {
            // 指导关卡时确保隐藏关卡按钮和倍速按钮
            levelSelectBtn.style.display = 'none';
            hideSpeedButton();
        }
    }
    
    animationFrameId = requestAnimationFrame(draw);
}

// 检查点击是否在匹配区域内
function checkHit(x, y) {
    for (var i = 0; i < matchAreas.length; i++) {
        var area = matchAreas[i];
        var dx = x - area.x;
        var dy = y - area.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= area.radius) {
            return i;
        }
    }
    return -1;
}

// 获取缩放后的坐标
function getScaledPosition(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

// 检查点击是否在气泡上
function checkBubbleHit(x, y) {
    for (var i = bubbles.length - 1; i >= 0; i--) {
        var bubble = bubbles[i];
        // 使用矩形边界框检测，点击气泡图片任意位置都算命中
        var left = bubble.x - bubble.radius;
        var right = bubble.x + bubble.radius;
        var top = bubble.y - bubble.radius;
        var bottom = bubble.y + bubble.radius;
        
        if (x >= left && x <= right && y >= top && y <= bottom) {
            return i;
        }
    }
    return -1;
}

// 处理点击事件
function handleClick(e) {
    if (gamePausedForReport) return;

    // 处理指导关卡的点击
    if (gameState === 'tutorial') {
        var clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        var pos = getScaledPosition(clientX, clientY);
        handleTutorialClick(pos);
        return;
    }
    
    if (gameState !== 'playing') return;
    
    var clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    var pos = getScaledPosition(clientX, clientY);
    
    var bubbleIndex = checkBubbleHit(pos.x, pos.y);
    if (bubbleIndex >= 0) {
        var bubble = bubbles[bubbleIndex];
        
        // 检查气泡是否已经被点击过
        if (bubble.alreadyClicked) {
            return; // 已经点击过，不做任何处理
        }
        
        // 标记气泡已经被点击过
        bubble.alreadyClicked = true;
        
        if (bubble.isCorrect) {
            // 点击正确气泡：得分+1，播放字母读音，播放鲸鱼效果，之后移动到美人鱼位置
            bubble.alreadyScored = true;
            bubble.waitingForWhale = true;
            score++;
            foundAreas++;
            playLetterSound(bubble.letter);
            showWhaleEffect();
            
            // 鲸鱼效果结束后，开始移动到美人鱼位置
            setTimeout(function() {
                bubble.waitingForWhale = false;
                bubble.movingToMermaid = true;
                // 设置目标位置为美人鱼位置
                var mermaidWidth = 600;
                var mermaidHeight = mermaidWidth * (mermaidImg.height / mermaidImg.width);
                bubble.mermaidTargetX = canvas.width - mermaidWidth - 50 + mermaidWidth / 2;
                bubble.mermaidTargetY = canvas.height - mermaidHeight - 50 + mermaidHeight / 2;
            }, 500);
        } else {
            // 点击错误气泡：添加晃动效果，播放音效，然后消失
            bubble.shaking = true;
            bubble.shakeTime = 0;
            bubble.originalX = bubble.x;
            bubble.originalY = bubble.y;
            // 第3、4、6阶段（读音阶段）播放错误音效，其他阶段播放字母读音
            if (currentStage === 3 || currentStage === 4 || currentStage === 6) {
                initWrongSound();
                try {
                    wrongSound.currentTime = 0;
                    wrongSound.play().catch(function() {});
                } catch(e) {}
            } else {
                playLetterSound(bubble.letter);
            }
        }
        return;
    }
    
    // 点击空白区域，不播放音效
}

// 开始按钮点击事件
startBtn.addEventListener('click', function(e) {
    e.preventDefault();
    startGame();
});

// 添加触摸事件支持
startBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    startGame();
});

if (learningReportBtn) {
    learningReportBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showLearningReport();
    });
}

// Canvas点击事件
canvas.addEventListener('click', handleClick);
canvas.addEventListener('touchstart', handleClick);

// 页面加载完成后开始绘制
window.addEventListener('load', draw);

// 通知宿主应用退出游戏
function exitGame() {
    if (window.axxBridge && window.axxBridge.closePage) {
        window.axxBridge.closePage();
        return;
    } else {
        window.close();
    }
}

// 定义上报方法（如果未定义）
function onReport(score) {
    console.log('Reporting score:', score);
}
