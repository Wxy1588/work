/**
 * 火车匹配游戏 - 主逻辑文件
 * 游戏流程：三阶段玩法，每阶段点击3个正确区域获得3分，总分9分
 * 阶段1：播放cat音频 -> 点击区域 -> 火车1离开 -> 火车2出现
 * 阶段2：播放dog音频 -> 点击区域 -> 火车2离开 -> 火车3出现
 * 阶段3：播放bird音频 -> 点击区域 -> 火车3离开 -> 游戏胜利
 */

// 获取Canvas元素和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// 获取UI元素
const timeDisplayEl = document.getElementById('timeDisplay');
const scoreDisplayEl = document.getElementById('scoreDisplay');
const endGameButtonEl = document.getElementById('endGameButton');
const gameHudEl = document.querySelector('.game-hud');
// 获取加载界面元素
const loadingScreen = document.getElementById('loadingScreen');
const loadingProgress = document.getElementById('loadingProgress');
const loadingPercent = document.getElementById('loadingPercent');

// 游戏数据统计：本地调试地址，正式部署时替换为运维提供的 HTTPS 地址
const gameTracker = new GameTracker({
    gameId: 'trainrun',
    gameVersion: '1.0.0',
    apiUrl: 'http://127.0.0.1:8000/api/v1/events',
    getUserId: function () {
        return null;
    }
});

// 资源加载状态
let resourcesLoaded = false;
let totalResources = 0;
let loadedResources = 0;

// Canvas尺寸设置
canvas.width = 1600;
canvas.height = 900;

// 游戏状态管理
let gameState = 'start';       // 游戏状态: start/playing/end
let score = 0;                 // 累计得分
let scoreAtLevelStart = 0;     // 进入当前关卡时的累计得分
let timeLeft = 60;             // 剩余时间（秒）
let countdownTimer = null;     // 倒计时定时器
let delayTimer = null;         // 延迟定时器（用于错误选择后的延迟）
let correctClicked = 0;        // 当前阶段已点击的正确区域数
let totalClicked = 0;          // 当前阶段已点击的区域总数（包括正确和错误）
let hasWrongSelection = false; // 当前阶段是否有错误选择
let gamePhase = 1;             // 当前游戏阶段（1/2/3）
let gameTimeRecorded = null;   // 记录的游戏用时（选择完第三阶段答案时记录）

// 图片资源
let backgroundImg = null;      // 背景图片
let trainImg = null;           // 火车1图片（移动时）
let trainImgStatic = null;     // 火车1图片（静止时）
let train2Img = null;          // 火车2图片（移动时）
let train2ImgStatic = null;    // 火车2图片（静止时）
let train3Img = null;          // 火车3图片（移动时）
let train3ImgStatic = null;    // 火车3图片（静止时）
let blackSmokeImg = null;      // 黑烟图片1（错误选择时显示）
let blackSmokeImg2 = null;     // 黑烟图片2（火车向左移动时显示）
let zoneImg = null;            // 阶段1正确区域图片（car1_1.png）
let zoneImg2 = null;           // 阶段2正确区域图片（car2_1.png）
let zoneImg3 = null;           // 阶段3正确区域图片（car3_1.png）

// 结算界面图片
let endImg1 = null;             // 得分1的庆祝图片
let endImg2 = null;             // 得分2的庆祝图片
let endImg3 = null;             // 得分3的庆祝图片
let reportImg = null;           // 成绩报告底图

// 单词掌握情况（用于成绩报告）
let masteredWords = [];        // 已掌握的单词列表
const allWords = {
    level1: ['cat', 'dog', 'bird'],
    level2: ['red', 'yes', 'four'],
    level3: ['six', 'one', 'five'],
    level4: ['cut', 'two', 'blue'],
    level5: ['eat', 'egg', 'pear'],
    level6: ['big', 'arm', 'hand'],
    level7: ['who', 'how', 'foot'],
    level8: ['sun', 'she', 'moon'],
    level9: ['run', 'bag', 'love'],
    level10: ['leg', 'sit', 'face'],
    level11: ['pen', 'old', 'book'],
    level12: ['hat', 'can', 'head'],
    level13: ['let', 'the', 'desk'],
    level14: ['man', 'are', 'tree'],
    level15: ['nod', 'car', 'feed'],
    level16: ['sea', 'sky', 'like'],
    level17: ['toy', 'sad', 'milk'],
    level18: ['USA', 'hen', 'kite'],
    level19: ['cap', 'bed', 'long'],
    level20: ['hop', 'bus', 'look'],
    level21: ['fat', 'pig', 'rice'],
    level22: ['row', 'map', 'cake'],
    level23: ['zoo', 'cup', 'nose'],
    level24: ['cow', 'dad', 'many'],
    level25: ['fly', 'see', 'jump'],
    level26: ['box', 'mom', 'find'],
    level27: ['mix', 'ten', 'have']
};
let totalMastered = 0;         // 总掌握单词数
let totalWordsCount = 81;      // 所有关卡的单词总数（27关 × 3个）
let playedLevels = [];         // 玩过的关卡列表（用于成绩报告）
let playedPhases = [];         // 玩过的阶段列表（格式："level-phase"，用于成绩报告）
let wrongCount = 0;            // 答错次数（累计到5次时显示成绩报告）

// 音频资源及状态
let catAudio = null;           // cat音频
let audioPlayed = false;       // cat音频是否已播放
let audioEnded = false;        // cat音频是否播放完成
let dogAudio = null;           // dog音频
let dogAudioPlayed = false;    // dog音频是否已播放
let dogAudioEnded = false;     // dog音频是否播放完成
let birdAudio = null;          // bird音频
let birdAudioPlayed = false;   // bird音频是否已播放
let birdAudioEnded = false;    // bird音频是否播放完成

// 第二关音频
let redAudio = null;           // red音频
let redAudioPlayed = false;    // red音频是否已播放
let redAudioEnded = false;     // red音频是否播放完成
let yesAudio = null;           // yes音频
let yesAudioPlayed = false;    // yes音频是否已播放
let yesAudioEnded = false;     // yes音频是否播放完成
let fourAudio = null;          // four音频
let fourAudioPlayed = false;   // four音频是否已播放
let fourAudioEnded = false;    // four音频是否播放完成

// 第三关音频
let sixAudio = null;           // six音频
let sixAudioPlayed = false;    // six音频是否已播放
let sixAudioEnded = false;     // six音频是否播放完成
let oneAudio = null;           // one音频
let oneAudioPlayed = false;    // one音频是否已播放
let oneAudioEnded = false;     // one音频是否播放完成
let fiveAudio = null;          // five音频
let fiveAudioPlayed = false;   // five音频是否已播放
let fiveAudioEnded = false;    // five音频是否播放完成
let cutAudio = null;           // cut音频
let cutAudioPlayed = false;    // cut音频是否已播放
let cutAudioEnded = false;     // cut音频是否播放完成
let twoAudio = null;           // two音频
let twoAudioPlayed = false;    // two音频是否已播放
let twoAudioEnded = false;     // two音频是否播放完成
let blueAudio = null;          // blue音频
let blueAudioPlayed = false;   // blue音频是否已播放
let blueAudioEnded = false;    // blue音频是否播放完成

// 第五关音频
let eatAudio = null;           // eat音频
let eatAudioPlayed = false;    // eat音频是否已播放
let eatAudioEnded = false;     // eat音频是否播放完成
let eggAudio = null;           // egg音频
let eggAudioPlayed = false;    // egg音频是否已播放
let eggAudioEnded = false;     // egg音频是否播放完成
let pearAudio = null;          // pear音频
let pearAudioPlayed = false;   // pear音频是否已播放
let pearAudioEnded = false;    // pear音频是否播放完成

// 第六关音频
let bigAudio = null;           // big音频
let bigAudioPlayed = false;    // big音频是否已播放
let bigAudioEnded = false;     // big音频是否播放完成
let armAudio = null;           // arm音频
let armAudioPlayed = false;    // arm音频是否已播放
let armAudioEnded = false;     // arm音频是否播放完成
let handAudio = null;          // hand音频
let handAudioPlayed = false;   // hand音频是否已播放
let handAudioEnded = false;    // hand音频是否播放完成

// 第7关音频
let whoAudio = null;           // who音频
let whoAudioPlayed = false;    // who音频是否已播放
let whoAudioEnded = false;     // who音频是否播放完成
let howAudio = null;           // how音频
let howAudioPlayed = false;    // how音频是否已播放
let howAudioEnded = false;     // how音频是否播放完成
let footAudio = null;          // foot音频
let footAudioPlayed = false;   // foot音频是否已播放
let footAudioEnded = false;    // foot音频是否播放完成

// 第8关音频
let sunAudio = null;           // sun音频
let sunAudioPlayed = false;    // sun音频是否已播放
let sunAudioEnded = false;     // sun音频是否播放完成
let sheAudio = null;           // she音频
let sheAudioPlayed = false;    // she音频是否已播放
let sheAudioEnded = false;     // she音频是否播放完成
let moonAudio = null;          // moon音频
let moonAudioPlayed = false;   // moon音频是否已播放
let moonAudioEnded = false;    // moon音频是否播放完成

// 第9关音频
let runAudio = null;           // run音频
let runAudioPlayed = false;    // run音频是否已播放
let runAudioEnded = false;     // run音频是否播放完成
let bagAudio = null;           // bag音频
let bagAudioPlayed = false;    // bag音频是否已播放
let bagAudioEnded = false;     // bag音频是否播放完成
let loveAudio = null;          // love音频
let loveAudioPlayed = false;   // love音频是否已播放
let loveAudioEnded = false;    // love音频是否播放完成

// 第10关音频
let legAudio = null;           // leg音频
let legAudioPlayed = false;    // leg音频是否已播放
let legAudioEnded = false;     // leg音频是否播放完成
let sitAudio = null;           // sit音频
let sitAudioPlayed = false;    // sit音频是否已播放
let sitAudioEnded = false;     // sit音频是否播放完成
let faceAudio = null;          // face音频
let faceAudioPlayed = false;   // face音频是否已播放
let faceAudioEnded = false;    // face音频是否播放完成

// 第11关音频
let penAudio = null;           // pen音频
let penAudioPlayed = false;    // pen音频是否已播放
let penAudioEnded = false;     // pen音频是否播放完成
let oldAudio = null;           // old音频
let oldAudioPlayed = false;    // old音频是否已播放
let oldAudioEnded = false;     // old音频是否播放完成
let bookAudio = null;          // book音频
let bookAudioPlayed = false;   // book音频是否已播放
let bookAudioEnded = false;    // book音频是否播放完成

// 第12关音频
let hatAudio = null;           // hat音频
let hatAudioPlayed = false;    // hat音频是否已播放
let hatAudioEnded = false;     // hat音频是否播放完成
let canAudio = null;           // can音频
let canAudioPlayed = false;    // can音频是否已播放
let canAudioEnded = false;     // can音频是否播放完成
let headAudio = null;          // head音频
let headAudioPlayed = false;   // head音频是否已播放
let headAudioEnded = false;    // head音频是否播放完成

// 第13关音频
let letAudio = null;           // let音频
let letAudioPlayed = false;    // let音频是否已播放
let letAudioEnded = false;     // let音频是否播放完成
let theAudio = null;           // the音频
let theAudioPlayed = false;    // the音频是否已播放
let theAudioEnded = false;     // the音频是否播放完成
let deskAudio = null;          // desk音频
let deskAudioPlayed = false;   // desk音频是否已播放
let deskAudioEnded = false;    // desk音频是否播放完成

// 第14关音频
let manAudio = null;           // man音频
let manAudioPlayed = false;    // man音频是否已播放
let manAudioEnded = false;     // man音频是否播放完成
let areAudio = null;           // are音频
let areAudioPlayed = false;    // are音频是否已播放
let areAudioEnded = false;     // are音频是否播放完成
let treeAudio = null;          // tree音频
let treeAudioPlayed = false;   // tree音频是否已播放
let treeAudioEnded = false;    // tree音频是否播放完成

// 第15关音频
let nodAudio = null;           // nod音频
let nodAudioPlayed = false;    // nod音频是否已播放
let nodAudioEnded = false;     // nod音频是否播放完成
let carAudio = null;           // car音频
let carAudioPlayed = false;    // car音频是否已播放
let carAudioEnded = false;     // car音频是否播放完成
let feedAudio = null;          // feed音频
let feedAudioPlayed = false;   // feed音频是否已播放
let feedAudioEnded = false;    // feed音频是否播放完成

// 第16关音频
let seaAudio = null;           // sea音频
let seaAudioPlayed = false;    // sea音频是否已播放
let seaAudioEnded = false;     // sea音频是否播放完成
let skyAudio = null;           // sky音频
let skyAudioPlayed = false;    // sky音频是否已播放
let skyAudioEnded = false;     // sky音频是否播放完成
let likeAudio = null;          // like音频
let likeAudioPlayed = false;   // like音频是否已播放
let likeAudioEnded = false;    // like音频是否播放完成

// 第17关音频
let toyAudio = null;           // toy音频
let toyAudioPlayed = false;    // toy音频是否已播放
let toyAudioEnded = false;     // toy音频是否播放完成
let sadAudio = null;           // sad音频
let sadAudioPlayed = false;    // sad音频是否已播放
let sadAudioEnded = false;     // sad音频是否播放完成
let milkAudio = null;          // milk音频
let milkAudioPlayed = false;   // milk音频是否已播放
let milkAudioEnded = false;    // milk音频是否播放完成

// 第18关音频
let USAAudio = null;           // USA音频
let USAAudioPlayed = false;    // USA音频是否已播放
let USAAudioEnded = false;     // USA音频是否播放完成
let henAudio = null;           // hen音频
let henAudioPlayed = false;    // hen音频是否已播放
let henAudioEnded = false;     // hen音频是否播放完成
let kiteAudio = null;          // milk音频
let kiteAudioPlayed = false;   // milk音频是否已播放
let kiteAudioEnded = false;    // milk音频是否播放完成

// 第19关音频
let capAudio = null;           // cap音频
let capAudioPlayed = false;    // cap音频是否已播放
let capAudioEnded = false;     // cap音频是否播放完成
let bedAudio = null;           // bed音频
let bedAudioPlayed = false;    // bed音频是否已播放
let bedAudioEnded = false;     // bed音频是否播放完成
let longAudio = null;          // long音频
let longAudioPlayed = false;   // long音频是否已播放
let longAudioEnded = false;    // long音频是否播放完成

// 第20关音频
let hopAudio = null;           // hop音频
let hopAudioPlayed = false;    // hop音频是否已播放
let hopAudioEnded = false;     // hop音频是否播放完成
let busAudio = null;           // bus音频
let busAudioPlayed = false;    // bus音频是否已播放
let busAudioEnded = false;     // bus音频是否播放完成
let lookAudio = null;          // look音频
let lookAudioPlayed = false;   // look音频是否已播放
let lookAudioEnded = false;    // look音频是否播放完成

// 第21关音频
let fatAudio = null;           // fat音频
let fatAudioPlayed = false;    // fat音频是否已播放
let fatAudioEnded = false;     // fat音频是否播放完成
let pigAudio = null;           // pig音频
let pigAudioPlayed = false;    // pig音频是否已播放
let pigAudioEnded = false;     // pig音频是否播放完成
let riceAudio = null;          // rice音频
let riceAudioPlayed = false;   // rice音频是否已播放
let riceAudioEnded = false;    // rice音频是否播放完成

// 第22关音频
let rowAudio = null;           // row音频
let rowAudioPlayed = false;    // row音频是否已播放
let rowAudioEnded = false;     // row音频是否播放完成
let mapAudio = null;           // map音频
let mapAudioPlayed = false;    // map音频是否已播放
let mapAudioEnded = false;     // map音频是否播放完成
let cakeAudio = null;          // cake音频
let cakeAudioPlayed = false;   // cake音频是否已播放
let cakeAudioEnded = false;    // cake音频是否播放完成

// 第23关音频
let zooAudio = null;           // zoo音频
let zooAudioPlayed = false;    // zoo音频是否已播放
let zooAudioEnded = false;     // zoo音频是否播放完成
let cupAudio = null;           // cup音频
let cupAudioPlayed = false;    // cup音频是否已播放
let cupAudioEnded = false;     // cup音频是否播放完成
let noseAudio = null;          // nose音频
let noseAudioPlayed = false;   // nose音频是否已播放
let noseAudioEnded = false;    // nose音频是否播放完成

// 第24关音频
let cowAudio = null;           // cow音频
let cowAudioPlayed = false;    // cow音频是否已播放
let cowAudioEnded = false;     // cow音频是否播放完成
let dadAudio = null;           // dad音频
let dadAudioPlayed = false;    // dad音频是否已播放
let dadAudioEnded = false;     // dad音频是否播放完成
let manyAudio = null;          // many音频
let manyAudioPlayed = false;   // many音频是否已播放
let manyAudioEnded = false;    // many音频是否播放完成

// 第25关音频
let flyAudio = null;           // fly音频
let flyAudioPlayed = false;    // fly音频是否已播放
let flyAudioEnded = false;     // fly音频是否播放完成
let seeAudio = null;           // see音频
let seeAudioPlayed = false;    // see音频是否已播放
let seeAudioEnded = false;     // see音频是否播放完成
let jumpAudio = null;          // jump音频
let jumpAudioPlayed = false;   // jump音频是否已播放
let jumpAudioEnded = false;    // jump音频是否播放完成

// 第26关音频
let boxAudio = null;           // box音频
let boxAudioPlayed = false;    // box音频是否已播放
let boxAudioEnded = false;     // box音频是否播放完成
let momAudio = null;           // mom音频
let momAudioPlayed = false;    // mom音频是否已播放
let momAudioEnded = false;     // mom音频是否播放完成
let findAudio = null;          // find音频
let findAudioPlayed = false;   // find音频是否已播放
let findAudioEnded = false;    // find音频是否播放完成

// 第27关音频
let mixAudio = null;           // mix音频
let mixAudioPlayed = false;    // mix音频是否已播放
let mixAudioEnded = false;     // mix音频是否播放完成
let tenAudio = null;           // ten音频
let tenAudioPlayed = false;    // ten音频是否已播放
let tenAudioEnded = false;     // ten音频是否播放完成
let haveAudio = null;          // have音频
let haveAudioPlayed = false;   // have音频是否已播放
let haveAudioEnded = false;    // have音频是否播放完成

let backgroundAudio = null;    // 背景音乐
let wrongAudio = null;          // 错误音效
let trainSound = null;          // 火车音效

// 学习报告播报状态
let reportNarrationRunId = 0;
let reportNarrationAudio = null;
let finishCurrentReportAudio = null;
let resumeBackgroundAfterNarration = false;

// 音频自动播放定时器
let audioTimer = null;         // 当前阶段的音频播放定时器

// 火车动画状态
let trainMoving = false;       // 火车1是否在移动（向右离开时移动）
let trainAnimationId = null;   // 火车1动画帧ID
let train1ReadyToLeave = false; // 火车1是否已选择完所有正确区域（准备离开）
let train1MovingLeft = false;  // 火车1是否正在向左移动（错误选择时）
let showBlackSmoke = false;    // 是否显示黑烟效果（黑烟1）
let showBlackSmoke2 = false;   // 是否显示黑烟效果（黑烟2，向左移动时）
let smokeTrainIndex = 0;       // 显示黑烟的火车索引（1/2/3）
let smokeTimer = null;         // 黑烟显示定时器
let train2Entering = false;    // 火车2是否正在进入（从左侧到目标位置）
let train2Leaving = false;     // 火车2是否正在离开（向右移动）
let train2AnimationId = null;  // 火车2动画帧ID
let train2ReadyToLeave = false; // 火车2是否已选择完所有正确区域（准备离开）
let train2MovingLeft = false;  // 火车2是否正在向左移动（错误选择时）
let train3Entering = false;    // 火车3是否正在进入（从左侧到目标位置）
let train3Leaving = false;     // 火车3是否正在离开（向右移动）
let train3AnimationId = null;  // 火车3动画帧ID
let train3ReadyToLeave = false; // 火车3是否已选择完所有正确区域（准备离开）
let train3MovingLeft = false;  // 火车3是否正在向左移动（错误选择时）
let smoke2X = 0;               // 黑烟2的X位置（用于火车消失后继续移动）
let disableClick = false;       // 是否禁止点击（错误选择时使用）
let showCorrectWord = false;   // 是否显示正确单词（错误选择时在火车上方显示）
let correctWordPhase = 0;     // 显示正确单词时的游戏阶段（1/2/3）
let correctWordFixedX = 0;    // 正确单词出现时的固定X位置（不随火车移动）
let correctWordFixedY = 0;    // 正确单词出现时的固定Y位置
let correctWordTimer = null;  // 正确单词显示计时器
let correctWordFlash = false; // 正确单词是否闪动
let correctWordFlashTimer = null; // 正确单词闪动计时器

// 火车1配置（红色火车）
const trainConfig = {
    x: 50,           // 初始X位置
    y: -35,          // 初始Y位置
    width: 600,      // 宽度
    height: 350      // 高度
};

// 火车2配置（黄色火车）
const train2Config = {
    x: -600,         // 初始X位置（画面左侧外）
    y: 180,          // 初始Y位置
    width: 500,      // 宽度
    height: 280,     // 高度
    targetX: 50      // 目标X位置（火车1原位置）
};

// 火车3配置（蓝色火车）
const train3Config = {
    x: -300,         // 初始X位置（画面左侧外）
    y: 400,          // 初始Y位置（火车2原位置下方）
    width: 450,      // 宽度
    height: 250,     // 高度
    targetX: 50      // 目标X位置（火车2原位置）
};

// 火车上显示的字母（按顺序）
let train1Letters = [];  // 火车1的字母：cat
let train2Letters = [];  // 火车2的字母：dog  
let train3Letters = [];  // 火车3的字母：bird

// 当前关卡（随机选择1-27关）
let currentLevel = Math.floor(Math.random() * 27) + 1;

// 火车正确字母顺序（第一关）
const level1Train1Order = ['c', 'a', 't'];
const level1Train2Order = ['d', 'o', 'g'];
const level1Train3Order = ['b', 'i', 'r', 'd'];

// 火车正确字母顺序（第二关）
const level2Train1Order = ['r', 'e', 'd'];
const level2Train2Order = ['y', 'e', 's'];
const level2Train3Order = ['f', 'o', 'u', 'r'];

// 火车正确字母顺序（第三关）
const level3Train1Order = ['s', 'i', 'x'];
const level3Train2Order = ['o', 'n', 'e'];
const level3Train3Order = ['f', 'i', 'v', 'e'];

// 火车正确字母顺序（第四关）
const level4Train1Order = ['c', 'u', 't'];
const level4Train2Order = ['t', 'w', 'o'];
const level4Train3Order = ['b', 'l', 'u', 'e'];

// 第五关火车字母顺序
const level5Train1Order = ['e', 'a', 't'];
const level5Train2Order = ['e', 'g', 'g'];
const level5Train3Order = ['p', 'e', 'a', 'r'];

// 第六关火车字母顺序
const level6Train1Order = ['b', 'i', 'g'];
const level6Train2Order = ['a', 'r', 'm'];
const level6Train3Order = ['h', 'a', 'n', 'd'];

// 第7关火车字母顺序
const level7Train1Order = ['w', 'h', 'o'];
const level7Train2Order = ['h', 'o', 'w'];
const level7Train3Order = ['f', 'o', 'o', 't'];

// 第8关火车字母顺序
const level8Train1Order = ['s', 'u', 'n'];
const level8Train2Order = ['s', 'h', 'e'];
const level8Train3Order = ['m', 'o', 'o', 'n'];

// 第9关火车字母顺序
const level9Train1Order = ['r', 'u', 'n'];
const level9Train2Order = ['b', 'a', 'g'];
const level9Train3Order = ['l', 'o', 'v', 'e'];

// 第10关火车字母顺序
const level10Train1Order = ['l', 'e', 'g'];
const level10Train2Order = ['s', 'i', 't'];
const level10Train3Order = ['f', 'a', 'c', 'e'];

// 第11关火车字母顺序
const level11Train1Order = ['p', 'e', 'n'];
const level11Train2Order = ['o', 'l', 'd'];
const level11Train3Order = ['b', 'o', 'o', 'k'];

// 第12关火车字母顺序
const level12Train1Order = ['h', 'a', 't'];
const level12Train2Order = ['c', 'a', 'n'];
const level12Train3Order = ['h', 'e', 'a', 'd'];

// 第13关火车字母顺序
const level13Train1Order = ['l', 'e', 't'];
const level13Train2Order = ['t', 'h', 'e'];
const level13Train3Order = ['d', 'e', 's', 'k'];

// 第14关火车字母顺序
const level14Train1Order = ['m', 'a', 'n'];
const level14Train2Order = ['a', 'r', 'e'];
const level14Train3Order = ['t', 'r', 'e', 'e'];

// 第15关火车字母顺序
const level15Train1Order = ['n', 'o', 'd'];
const level15Train2Order = ['c', 'a', 'r'];
const level15Train3Order = ['f', 'e', 'e', 'd'];

// 第16关火车字母顺序
const level16Train1Order = ['s', 'e', 'a'];
const level16Train2Order = ['s', 'k', 'y'];
const level16Train3Order = ['l', 'i', 'k', 'e'];

// 第17关火车字母顺序
const level17Train1Order = ['t', 'o', 'y'];
const level17Train2Order = ['s', 'a', 'd'];
const level17Train3Order = ['m', 'i', 'l', 'k'];

// 第18关火车字母顺序
const level18Train1Order = ['U', 'S', 'A'];
const level18Train2Order = ['h', 'e', 'n'];
const level18Train3Order = ['k', 'i', 't', 'e'];

// 第19关火车字母顺序
const level19Train1Order = ['c', 'a', 'p'];
const level19Train2Order = ['b', 'e', 'd'];
const level19Train3Order = ['l', 'o', 'n', 'g'];

// 第20关火车字母顺序
const level20Train1Order = ['h', 'o', 'p'];
const level20Train2Order = ['b', 'u', 's'];
const level20Train3Order = ['l', 'o', 'o', 'k'];

// 第21关火车字母顺序
const level21Train1Order = ['f', 'a', 't'];
const level21Train2Order = ['p', 'i', 'g'];
const level21Train3Order = ['r', 'i', 'c', 'e'];

// 第22关火车字母顺序
const level22Train1Order = ['r', 'o', 'w'];
const level22Train2Order = ['m', 'a', 'p'];
const level22Train3Order = ['c', 'a', 'k', 'e'];

// 第23关火车字母顺序
const level23Train1Order = ['z', 'o', 'o'];
const level23Train2Order = ['c', 'u', 'p'];
const level23Train3Order = ['n', 'o', 's', 'e'];

// 第24关火车字母顺序
const level24Train1Order = ['c', 'o', 'w'];
const level24Train2Order = ['d', 'a', 'd'];
const level24Train3Order = ['m', 'a', 'n', 'y'];

// 第25关火车字母顺序
const level25Train1Order = ['f', 'l', 'y'];
const level25Train2Order = ['s', 'e', 'e'];
const level25Train3Order = ['j', 'u', 'm', 'p'];

// 第26关火车字母顺序
const level26Train1Order = ['b', 'o', 'x'];
const level26Train2Order = ['m', 'o', 'm'];
const level26Train3Order = ['f', 'i', 'n', 'd'];

// 第27关火车字母顺序
const level27Train1Order = ['m', 'i', 'x'];
const level27Train2Order = ['t', 'e', 'n'];
const level27Train3Order = ['h', 'a', 'v', 'e'];

// ============ 火车字母位置配置 ============
// 每个火车的字母显示位置可以单独调整
const trainLetterConfig = {
    // 火车1字母配置
    train1: {
        scale: 0.3,           // 字母大小占火车高度的比例 (0.3 = 30%)
        offsetX: -40,           // 水平偏移（正值向右，负值向左）
        offsetY: 28,           // 垂直偏移（正值向下，负值向上）
        spacing: 0.6          // 字母间距系数（1.0 = 正常间距）
    },
    // 火车2字母配置
    train2: {
        scale: 0.3,           // 字母大小占火车高度的比例
        offsetX: -40,           // 水平偏移
        offsetY: 28,           // 垂直偏移
        spacing: 0.6          // 字母间距系数
    },
    // 火车3字母配置
    train3: {
        scale: 0.3,           // 字母大小占火车高度的比例
        offsetX: -40,           // 水平偏移
        offsetY: 5,           // 垂直偏移
        spacing: 0.6          // 字母间距系数
    }
};

// ============ 阶段1区域位置配置（火车1阶段）============
// 4个车厢：第1排第1列、第1排第3列、第3排第1列、第3排第3列
const phase1Zones = [
    { x: 900, y: 145, id: 1, clicked: false },
    { x: 1300, y: 145, id: 3, clicked: false },
    { x: 900, y: 500, id: 7, clicked: false },
    { x: 1300, y: 500, id: 9, clicked: false }
];

// ============ 阶段2区域位置配置（火车2阶段）============
// 4个车厢：第1排第1列、第1排第3列、第3排第1列、第3排第3列
const phase2Zones = [
    { x: 900, y: 167, id: 1, clicked: false },
    { x: 1300, y: 167, id: 3, clicked: false },
    { x: 900, y: 519, id: 7, clicked: false },
    { x: 1300, y: 519, id: 9, clicked: false }
];

// ============ 阶段3区域位置配置（火车3阶段）============
// 5个车厢：第1排第1列、第1排第3列、第2排第2列、第3排第1列、第3排第3列
const phase3Zones = [
    { x: 900, y: 173, id: 1, clicked: false },
    { x: 1300, y: 173, id: 3, clicked: false },
    { x: 1100, y: 324, id: 5, clicked: false },
    { x: 900, y: 523, id: 7, clicked: false },
    { x: 1300, y: 523, id: 9, clicked: false }
];

// 当前阶段的区域配置引用
let zones = phase1Zones;

// ============ 阶段1区域图片尺寸配置（火车1阶段）============
const phase1ZoneSize = {
    width: trainConfig.width / 5,  
    height: trainConfig.height / 3  
};

// ============ 阶段2区域图片尺寸配置（火车2阶段）============
const phase2ZoneSize = {
    width: train2Config.width / 5,  
    height: train2Config.height / 3 
};

// ============ 阶段3区域图片尺寸配置（火车3阶段）============
const phase3ZoneSize = {
    width: train3Config.width / 5,  
    height: train3Config.height / 3 
};

// ============ 各阶段字母配置 ============
// 阶段1字母配置
const phase1Letters = {
    correct: ['c', 'a', 't'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q w e r y u i o p l k j h g f d s z x v b n m'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置
const phase2Letters = {
    correct: ['d', 'o', 'g'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q w e r y u i a p l k j h t f c s z x v b n m'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第一关）
const phase3Letters = {
    correct: ['b', 'i', 'r', 'd'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q w e y u o p l k j h g f s z x v n m c a t'.split(' ')  // 错误区域字母池
};

// ============ 第二关字母配置 ============
// 阶段1字母配置（第二关）
const level2Phase1Letters = {
    correct: ['r', 'e', 'd'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q w t y u i o p l k j h g f c s z x v b n m a'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第二关）
const level2Phase2Letters = {
    correct: ['y', 'e', 's'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q w r d u i o p l k j h g f c t z x v b n m a'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第二关）
const level2Phase3Letters = {
    correct: ['f', 'o', 'u', 'r'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q w e y i p l k j h g d s z x b v n m c a t'.split(' ')  // 错误区域字母池
};

// ============ 第三关字母配置 ============
// 阶段1字母配置（第三关）
const level3Phase1Letters = {
    correct: ['s', 'i', 'x'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q w e r t y u o p l k j h g f d c z v b n m a'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第三关）
const level3Phase2Letters = {
    correct: ['o', 'n', 'e'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q w r d s i x u p l k j h g f c t z v b m a y'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第三关）
const level3Phase3Letters = {
    correct: ['f', 'i', 'v', 'e'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q w s x o n r u p l k j h g d z b m c a t y'.split(' ')  // 错误区域字母池
};

// ============ 第四关字母配置 ============
// 阶段1字母配置（第四关）
const level4Phase1Letters = {
    correct: ['c', 'u', 't'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q w e r y i p o l k j h g d s f z x b v n m a'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第四关）
const level4Phase2Letters = {
    correct: ['t', 'w', 'o'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q e r d s i x u p l k j h g f n c z v b m a y'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第四关）
const level4Phase3Letters = {
    correct: ['b', 'l', 'u', 'e'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q w s x o n r t i p k j h g d z v m c a f y'.split(' ')  // 错误区域字母池
};

// ============ 第五关字母配置 ============
// 阶段1字母配置（第五关）
const level5Phase1Letters = {
    correct: ['e', 'a', 't'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q w r y u i o p l k j h g d s f c z x v b n m'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第五关）
const level5Phase2Letters = {
    correct: ['e', 'g', 'g'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q w r t y u i o p l k j h d s f c z x v b n m a'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第五关）
const level5Phase3Letters = {
    correct: ['p', 'e', 'a', 'r'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q w s x o n t u l i b k j h g d z v m c f y'.split(' ')  // 错误区域字母池
};

// ============ 第六关字母配置 ============
// 阶段1字母配置（第6关）
const level6Phase1Letters = {
    correct: ['b', 'i', 'g'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q w r y u a o p l k j h t d s f c z x v e n m'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第6关）
const level6Phase2Letters = {
    correct: ['a', 'r', 'm'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q w g t y u i o p l k j h d s f c z x v b n e'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第6关）
const level6Phase3Letters = {
    correct: ['h', 'a', 'n', 'd'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q w s x o e t u l i b k j p g r z v m c f y'.split(' ')  // 错误区域字母池
};

// ============ 第7关字母配置 ============
// 阶段1字母配置（第7关）
const level7Phase1Letters = {
    correct: ['w', 'h', 'o'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b r y u a g p l k j i t d s f c z x v e n m'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第7关）
const level7Phase2Letters = {
    correct: ['h', 'o', 'w'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q m g t y u i r p l k j a d s f c z x v b n e'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第7关）
const level7Phase3Letters = {
    correct: ['f', 'o', 'o', 't'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q w s x a n e d u l i b k j p g r z v m c h y'.split(' ')  // 错误区域字母池
};

// ============ 第8关字母配置 ============
// 阶段1字母配置（第8关）
const level8Phase1Letters = {
    correct: ['s', 'u', 'n'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b r y h a g p l k j i t d w f c z x v e o m'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第8关）
const level8Phase2Letters = {
    correct: ['s', 'h', 'e'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q m g t y u i r p l k j a d o f c z x v b n w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第8关）
const level8Phase3Letters = {
    correct: ['m', 'o', 'o', 'n'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q w s x a t e d u l i b k j p g r z v f c h y'.split(' ')  // 错误区域字母池
};

// ============ 第9关字母配置 ============
// 阶段1字母配置（第9关）
const level9Phase1Letters = {
    correct: ['r', 'u', 'n'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b s y h a g p l k j i t d w f c z x v e o m'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第9关）
const level9Phase2Letters = {
    correct: ['b', 'a', 'g'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q m e t y u i r p l k j h d o f c z x v s n w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第9关）
const level9Phase3Letters = {
    correct: ['l', 'o', 'v', 'e'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q w s x a t n d u m i b k j p g r z f c h y'.split(' ')  // 错误区域字母池
};

// ============ 第10关字母配置 ============
// 阶段1字母配置（第10关）
const level10Phase1Letters = {
    correct: ['l', 'e', 'g'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b s y h a n p r k j i t d w f c z x v u o m'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第10关）
const level10Phase2Letters = {
    correct: ['s', 'i', 't'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q m e g y u a r p l k j h d o f c z x v b n w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第10关）
const level10Phase3Letters = {
    correct: ['f', 'a', 'c', 'e'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q w s x o t n d u m i b k j p g r z l v h y'.split(' ')  // 错误区域字母池
};

// ============ 第11关字母配置 ============
// 阶段1字母配置（第11关）
const level11Phase1Letters = {
    correct: ['p', 'e', 'n'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b s y h a g l r k j i t d w f c z x v u o m'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第11关）
const level11Phase2Letters = {
    correct: ['o', 'l', 'd'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q m e g y u a r p i k j h t s f c z x v b n w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第11关）
const level11Phase3Letters = {
    correct: ['b', 'o', 'o', 'k'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q w s x a c t n d u m i f e j p g r z l v h y'.split(' ')  // 错误区域字母池
};

// ============ 第12关字母配置 ============
// 阶段1字母配置（第12关）
const level12Phase1Letters = {
    correct: ['h', 'a', 't'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b s y p e g l r k j i n d w f c z x v u o m'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第12关）
const level12Phase2Letters = {
    correct: ['c', 'a', 'n'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q m e g y u l r p i k j h t s f o z x v b d w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第12关）
const level12Phase3Letters = {
    correct: ['h', 'e', 'a', 'd'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q x w s b c t n k u m i f j p g r z l v o y'.split(' ')  // 错误区域字母池
};

// ============ 第13关字母配置 ============
// 阶段1字母配置（第13关）
const level13Phase1Letters = {
    correct: ['l', 'e', 't'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b s y p a g h r k j i n d w f c z x v u o m'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第13关）
const level13Phase2Letters = {
    correct: ['t', 'h', 'e'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q m n g y u l r p i k j a c s f o z x v b d w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第13关）
const level13Phase3Letters = {
    correct: ['d', 'e', 's', 'k'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q a w h x c t n b u m i f j p g r z l v o y'.split(' ')  // 错误区域字母池
};

// ============ 第14关字母配置 ============
// 阶段1字母配置（第14关）
const level14Phase1Letters = {
    correct: ['m', 'a', 'n'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b s y p e g h r k j i t d w f c z x v u o l'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第14关）
const level14Phase2Letters = {
    correct: ['a', 'r', 'e'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q m n g y u l h p i k j t c s f o z x v b d w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第14关）
const level14Phase3Letters = {
    correct: ['t', 'r', 'e', 'e'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q a w h x c n u m i d b f j p g s k z l v o y'.split(' ')  // 错误区域字母池
};

// ============ 第15关字母配置 ============
// 阶段1字母配置（第15关）
const level15Phase1Letters = {
    correct: ['n', 'o', 'd'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b s y p e g h r k j i t m w f c z x v u a l'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第15关）
const level15Phase2Letters = {
    correct: ['c', 'a', 'r'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q m n g y u l h p i k j t e s f o z x v b d w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第15关）
const level15Phase3Letters = {
    correct: ['f', 'e', 'e', 'd'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q a w h x c n r b t u m i j p g s k z l v o y'.split(' ')  // 错误区域字母池
};

// ============ 第16关字母配置 ============
// 阶段1字母配置（第16关）
const level16Phase1Letters = {
    correct: ['s', 'e', 'a'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b n y p o g h r k j i t m w f c z x v u d l'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第16关）
const level16Phase2Letters = {
    correct: ['s', 'k', 'y'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q m n g r u l h p i a j t e c f o z x v b d w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第16关）
const level16Phase3Letters = {
    correct: ['l', 'i', 'k', 'e'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q a w h x c n r b t u m d j p g s z f v o y'.split(' ')  // 错误区域字母池
};

// ============ 第17关字母配置 ============
// 阶段1字母配置（第17关）
const level17Phase1Letters = {
    correct: ['t', 'o', 'y'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b n a p e g h r k j i s m w f c z x v u d l'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第17关）
const level17Phase2Letters = {
    correct: ['s', 'a', 'd'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q m n g r u l h p i k j t e c f o z x v b y w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第17关）
const level17Phase3Letters = {
    correct: ['m', 'i', 'l', 'k'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q a w h x c n r b t u e d j p g s z f v o y'.split(' ')  // 错误区域字母池
};

// ============ 第18关字母配置 ============
// 阶段1字母配置（第18关）
const level18Phase1Letters = {
    correct: ['U', 'S', 'A'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'Q W E R T Y D I O P F G H J K L M N B V C X Z '.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第18关）
const level18Phase2Letters = {
    correct: ['h', 'e', 'n'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q m d g r u l s p i k j t a c f o z x v b y w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第18关）
const level18Phase3Letters = {
    correct: ['k', 'i', 't', 'e'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q a w h x c n r b m u l d j p g s z f v o y'.split(' ')  // 错误区域字母池
};

// ============ 第19关字母配置 ============
// 阶段1字母配置（第19关）
const level19Phase1Letters = {
    correct: ['c', 'a', 'p'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b n y s e g h r k j i o m w f u z x v t d l'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第19关）
const level19Phase2Letters = {
    correct: ['b', 'e', 'd'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q m n g r u l s p i k j t a c f o z x v g y w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第19关）
const level19Phase3Letters = {
    correct: ['l', 'o', 'n', 'g'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q a w h x c t r b m u k d j p e s z f v i y'.split(' ')  // 错误区域字母池
};

// ============ 第20关字母配置 ============
// 阶段1字母配置（第20关）
const level20Phase1Letters = {
    correct: ['h', 'o', 'p'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b n y s e g c r k j i a m w f u z x v t d l'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第20关）
const level20Phase2Letters = {
    correct: ['b', 'u', 's'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q m n g r e l d p i k j t a c f o z x v g y w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第20关）
const level20Phase3Letters = {
    correct: ['l', 'o', 'o', 'k'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q a w h x c t r b m u g n d j p e s z f v i y'.split(' ')  // 错误区域字母池
};

// ============ 第21关字母配置 ============
// 阶段1字母配置（第21关）
const level21Phase1Letters = {
    correct: ['f', 'a', 't'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b n y s e g c r k j i o m w h u z x v p d l'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第21关）
const level21Phase2Letters = {
    correct: ['p', 'i', 'g'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q m n s r e l d b u k h j t a c f o z x v y w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第21关）
const level21Phase3Letters = {
    correct: ['r', 'i', 'c', 'e'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q a w h x k t l b m u g n d j p s z f v o y'.split(' ')  // 错误区域字母池
};

// ============ 第22关字母配置 ============
// 阶段1字母配置（第22关）
const level22Phase1Letters = {
    correct: ['r', 'o', 'w'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b n y s e g c f k j i a m t h u z x v p d l'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第22关）
const level22Phase2Letters = {
    correct: ['m', 'a', 'p'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q g n s r e l d b u k h j t i c f o z x v y w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第22关）
const level22Phase3Letters = {
    correct: ['c', 'a', 'k', 'e'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q r w h x i t l b m u g n d j p s z f v o y'.split(' ')  // 错误区域字母池
};

// ============ 第23关字母配置 ============
// 阶段1字母配置（第23关）
const level23Phase1Letters = {
    correct: ['z', 'o', 'o'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b n y s e g c f k j i a m t h u r w x v p d l'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第23关）
const level23Phase2Letters = {
    correct: ['c', 'u', 'p'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q g n s r e l d b a k h j t i m f o z x v y w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第23关）
const level23Phase3Letters = {
    correct: ['n', 'o', 's', 'e'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q r w h x i t l b m u g c d j p k z f v a y'.split(' ')  // 错误区域字母池
};

// ============ 第24关字母配置 ============
// 阶段1字母配置（第24关）
const level24Phase1Letters = {
    correct: ['c', 'o', 'w'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b n y s e g z f k j i a m t h u r x v p d l'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第24关）
const level24Phase2Letters = {
    correct: ['d', 'a', 'd'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q g n s r e l c h b u p k j t i m f o z x v y w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第24关）
const level24Phase3Letters = {
    correct: ['m', 'a', 'n', 'y'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q r w h x i t l b o u g c d j p k z f v s e'.split(' ')  // 错误区域字母池
};

// ============ 第25关字母配置 ============
// 阶段1字母配置（第25关）
const level25Phase1Letters = {
    correct: ['f', 'l', 'y'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b n s e g c z k j i a m t h u r w x v p d o'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第25关）
const level25Phase2Letters = {
    correct: ['s', 'e', 'e'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q g n c r u p l d b a k h j t i m f o z x v y w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第25关）
const level25Phase3Letters = {
    correct: ['j', 'u', 'm', 'p'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q r w h x i t l b s o g c d n e k z f v a y'.split(' ')  // 错误区域字母池
};

// ============ 第26关字母配置 ============
// 阶段1字母配置（第26关）
const level26Phase1Letters = {
    correct: ['b', 'o', 'x'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q z n y s e g c f k j i a m t h u r w v p d l'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第26关）
const level26Phase2Letters = {
    correct: ['m', 'o', 'm'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q g n s r e l d b a k h j t i c f u p z x v y w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第26关）
const level26Phase3Letters = {
    correct: ['f', 'i', 'n', 'd'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q r w h x o t l b m u g c e j p k z s v a y'.split(' ')  // 错误区域字母池
};

// ============ 第27关字母配置 ============
// 阶段1字母配置（第27关）
const level27Phase1Letters = {
    correct: ['m', 'i', 'x'],                              // 正确区域字母
    correctZoneIds: [1, 2, 3],                             // 正确区域ID
    wrongPool: 'q b n y s e g c f k j o a z t h u r w v p d l'.split(' ')  // 错误区域字母池
};

// 阶段2字母配置（第27关）
const level27Phase2Letters = {
    correct: ['t', 'e', 'n'],                              // 正确区域字母
    correctZoneIds: [4, 5, 6],                             // 正确区域ID
    wrongPool: 'q g p s r u l d b a h k j c i m f o z x v y w'.split(' ')  // 错误区域字母池
};

// 阶段3字母配置（第27关）
const level27Phase3Letters = {
    correct: ['h', 'a', 'v', 'e'],                         // 正确区域字母
    correctZoneIds: [1, 2, 4, 7],                          // 正确区域ID
    wrongPool: 'q r w n x i t l b m u g c d j p k z f s o y'.split(' ')  // 错误区域字母池
};

// ============ 各阶段正确区域配置 ============
// 阶段1（火车1）：3个正确区域，6个错误区域
let phase1CorrectZones = [1, 2, 3];  // 正确区域ID（动态更新）
// 阶段2（火车2）：3个正确区域，6个错误区域
let phase2CorrectZones = [4, 5, 6];  // 正确区域ID（动态更新）
// 阶段3（火车3）：4个正确区域，5个错误区域
let phase3CorrectZones = [1, 2, 4, 7];  // 正确区域ID（动态更新）

/**
 * 随机生成正确区域ID
 * @param {number} totalZones - 区域总数
 * @param {number} correctCount - 正确区域数量
 * @returns {array} - 随机选中的正确区域ID数组
 */
function generateRandomCorrectZones(availableIds, correctCount) {
    // 打乱可用ID数组
    const shuffled = [...availableIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // 返回前correctCount个ID
    return shuffled.slice(0, correctCount).sort((a, b) => a - b);
}

/**
 * 初始化当前阶段的随机正确区域
 */
function initRandomCorrectZones() {
    if (gamePhase === 1) {
        // 阶段1可用区域ID: [1, 3, 7, 9]，选择3个正确区域
        phase1CorrectZones = generateRandomCorrectZones([1, 3, 7, 9], 3);
    } else if (gamePhase === 2) {
        // 阶段2可用区域ID: [1, 3, 7, 9]，选择3个正确区域
        phase2CorrectZones = generateRandomCorrectZones([1, 3, 7, 9], 3);
    } else if (gamePhase === 3) {
        // 阶段3可用区域ID: [1, 3, 5, 7, 9]，选择4个正确区域
        phase3CorrectZones = generateRandomCorrectZones([1, 3, 5, 7, 9], 4);
    }
}

/**
 * 初始化当前阶段的字母
 */
function initPhaseLetters() {
    let letterConfig = null;
    if (gamePhase === 1) {
        if (currentLevel === 1) letterConfig = phase1Letters;
        else if (currentLevel === 2) letterConfig = level2Phase1Letters;
        else if (currentLevel === 3) letterConfig = level3Phase1Letters;
        else if (currentLevel === 4) letterConfig = level4Phase1Letters;
        else if (currentLevel === 5) letterConfig = level5Phase1Letters;
        else if (currentLevel === 6) letterConfig = level6Phase1Letters;
        else if (currentLevel === 7) letterConfig = level7Phase1Letters;
        else if (currentLevel === 8) letterConfig = level8Phase1Letters;
        else if (currentLevel === 9) letterConfig = level9Phase1Letters;
        else if (currentLevel === 10) letterConfig = level10Phase1Letters;
        else if (currentLevel === 11) letterConfig = level11Phase1Letters;
        else if (currentLevel === 12) letterConfig = level12Phase1Letters;
        else if (currentLevel === 13) letterConfig = level13Phase1Letters;
        else if (currentLevel === 14) letterConfig = level14Phase1Letters;
        else if (currentLevel === 15) letterConfig = level15Phase1Letters;
        else if (currentLevel === 16) letterConfig = level16Phase1Letters;
        else if (currentLevel === 17) letterConfig = level17Phase1Letters;
        else if (currentLevel === 18) letterConfig = level18Phase1Letters;
        else if (currentLevel === 19) letterConfig = level19Phase1Letters;
        else if (currentLevel === 20) letterConfig = level20Phase1Letters;
        else if (currentLevel === 21) letterConfig = level21Phase1Letters;
        else if (currentLevel === 22) letterConfig = level22Phase1Letters;
        else if (currentLevel === 23) letterConfig = level23Phase1Letters;
        else if (currentLevel === 24) letterConfig = level24Phase1Letters;
        else if (currentLevel === 25) letterConfig = level25Phase1Letters;
        else if (currentLevel === 26) letterConfig = level26Phase1Letters;
        else letterConfig = level27Phase1Letters;
    } else if (gamePhase === 2) {
        if (currentLevel === 1) letterConfig = phase2Letters;
        else if (currentLevel === 2) letterConfig = level2Phase2Letters;
        else if (currentLevel === 3) letterConfig = level3Phase2Letters;
        else if (currentLevel === 4) letterConfig = level4Phase2Letters;
        else if (currentLevel === 5) letterConfig = level5Phase2Letters;
        else if (currentLevel === 6) letterConfig = level6Phase2Letters;
        else if (currentLevel === 7) letterConfig = level7Phase2Letters;
        else if (currentLevel === 8) letterConfig = level8Phase2Letters;
        else if (currentLevel === 9) letterConfig = level9Phase2Letters;
        else if (currentLevel === 10) letterConfig = level10Phase2Letters;
        else if (currentLevel === 11) letterConfig = level11Phase2Letters;
        else if (currentLevel === 12) letterConfig = level12Phase2Letters;
        else if (currentLevel === 13) letterConfig = level13Phase2Letters;
        else if (currentLevel === 14) letterConfig = level14Phase2Letters;
        else if (currentLevel === 15) letterConfig = level15Phase2Letters;
        else if (currentLevel === 16) letterConfig = level16Phase2Letters;
        else if (currentLevel === 17) letterConfig = level17Phase2Letters;
        else if (currentLevel === 18) letterConfig = level18Phase2Letters;
        else if (currentLevel === 19) letterConfig = level19Phase2Letters;
        else if (currentLevel === 20) letterConfig = level20Phase2Letters;
        else if (currentLevel === 21) letterConfig = level21Phase2Letters;
        else if (currentLevel === 22) letterConfig = level22Phase2Letters;
        else if (currentLevel === 23) letterConfig = level23Phase2Letters;
        else if (currentLevel === 24) letterConfig = level24Phase2Letters;
        else if (currentLevel === 25) letterConfig = level25Phase2Letters;
        else if (currentLevel === 26) letterConfig = level26Phase2Letters;
        else letterConfig = level27Phase2Letters;
    } else if (gamePhase === 3) {
        if (currentLevel === 1) letterConfig = phase3Letters;
        else if (currentLevel === 2) letterConfig = level2Phase3Letters;
        else if (currentLevel === 3) letterConfig = level3Phase3Letters;
        else if (currentLevel === 4) letterConfig = level4Phase3Letters;
        else if (currentLevel === 5) letterConfig = level5Phase3Letters;
        else if (currentLevel === 6) letterConfig = level6Phase3Letters;
        else if (currentLevel === 7) letterConfig = level7Phase3Letters;
        else if (currentLevel === 8) letterConfig = level8Phase3Letters;
        else if (currentLevel === 9) letterConfig = level9Phase3Letters;
        else if (currentLevel === 10) letterConfig = level10Phase3Letters;
        else if (currentLevel === 11) letterConfig = level11Phase3Letters;
        else if (currentLevel === 12) letterConfig = level12Phase3Letters;
        else if (currentLevel === 13) letterConfig = level13Phase3Letters;
        else if (currentLevel === 14) letterConfig = level14Phase3Letters;
        else if (currentLevel === 15) letterConfig = level15Phase3Letters;
        else if (currentLevel === 16) letterConfig = level16Phase3Letters;
        else if (currentLevel === 17) letterConfig = level17Phase3Letters;
        else if (currentLevel === 18) letterConfig = level18Phase3Letters;
        else if (currentLevel === 19) letterConfig = level19Phase3Letters;
        else if (currentLevel === 20) letterConfig = level20Phase3Letters;
        else if (currentLevel === 21) letterConfig = level21Phase3Letters;
        else if (currentLevel === 22) letterConfig = level22Phase3Letters;
        else if (currentLevel === 23) letterConfig = level23Phase3Letters;
        else if (currentLevel === 24) letterConfig = level24Phase3Letters;
        else if (currentLevel === 25) letterConfig = level25Phase3Letters;
        else if (currentLevel === 26) letterConfig = level26Phase3Letters;
        else letterConfig = level27Phase3Letters;
    }
    
    if (!letterConfig) return;
    
    // 复制错误字母池并打乱顺序
    let wrongLetters = [...letterConfig.wrongPool];
    wrongLetters.sort(() => Math.random() - 0.5);
    
    // 使用已经随机生成的正确区域
    let currentCorrectZones = [];
    if (gamePhase === 1) {
        currentCorrectZones = phase1CorrectZones;
    } else if (gamePhase === 2) {
        currentCorrectZones = phase2CorrectZones;
    } else if (gamePhase === 3) {
        currentCorrectZones = phase3CorrectZones;
    }
    
    // 为每个区域分配字母
    zones.forEach(zone => {
        const correctIndex = currentCorrectZones.indexOf(zone.id);
        if (correctIndex !== -1) {
            // 正确区域：分配正确字母
            zone.letter = letterConfig.correct[correctIndex];
        } else {
            // 错误区域：从错误字母池中取一个
            zone.letter = wrongLetters.shift();
        }
    });
}

/**
 * 判断区域在当前阶段是否正确
 * @param {object} zone - 区域对象
 * @returns {boolean} - 是否为正确区域
 */
function isZoneCorrect(zone) {
    if (gamePhase === 1) {
        return phase1CorrectZones.includes(zone.id);
    } else if (gamePhase === 2) {
        return phase2CorrectZones.includes(zone.id);
    } else if (gamePhase === 3) {
        return phase3CorrectZones.includes(zone.id);
    }
    return false;
}

/**
 * 获取指定阶段的正确单词
 * @param {number} phase - 游戏阶段（1/2/3），默认使用 correctWordPhase
 * @returns {string} - 正确单词（如 'cat', 'dog', 'bird' 等）
 */
function getCorrectWord(phase) {
    const p = phase || correctWordPhase;
    if (p === 1) {
        if (currentLevel === 1) return level1Train1Order.join('');
        if (currentLevel === 2) return level2Train1Order.join('');
        if (currentLevel === 3) return level3Train1Order.join('');
        if (currentLevel === 4) return level4Train1Order.join('');
        if (currentLevel === 5) return level5Train1Order.join('');
        if (currentLevel === 6) return level6Train1Order.join('');
        if (currentLevel === 7) return level7Train1Order.join('');
        if (currentLevel === 8) return level8Train1Order.join('');
        if (currentLevel === 9) return level9Train1Order.join('');
        if (currentLevel === 10) return level10Train1Order.join('');
        if (currentLevel === 11) return level11Train1Order.join('');
        if (currentLevel === 12) return level12Train1Order.join('');
        if (currentLevel === 13) return level13Train1Order.join('');
        if (currentLevel === 14) return level14Train1Order.join('');
        if (currentLevel === 15) return level15Train1Order.join('');
        if (currentLevel === 16) return level16Train1Order.join('');
        if (currentLevel === 17) return level17Train1Order.join('');
        if (currentLevel === 18) return level18Train1Order.join('');
        if (currentLevel === 19) return level19Train1Order.join('');
        if (currentLevel === 20) return level20Train1Order.join('');
        if (currentLevel === 21) return level21Train1Order.join('');
        if (currentLevel === 22) return level22Train1Order.join('');
        if (currentLevel === 23) return level23Train1Order.join('');
        if (currentLevel === 24) return level24Train1Order.join('');
        if (currentLevel === 25) return level25Train1Order.join('');
        if (currentLevel === 26) return level26Train1Order.join('');
        return level27Train1Order.join('');
    } else if (p === 2) {
        if (currentLevel === 1) return level1Train2Order.join('');
        if (currentLevel === 2) return level2Train2Order.join('');
        if (currentLevel === 3) return level3Train2Order.join('');
        if (currentLevel === 4) return level4Train2Order.join('');
        if (currentLevel === 5) return level5Train2Order.join('');
        if (currentLevel === 6) return level6Train2Order.join('');
        if (currentLevel === 7) return level7Train2Order.join('');
        if (currentLevel === 8) return level8Train2Order.join('');
        if (currentLevel === 9) return level9Train2Order.join('');
        if (currentLevel === 10) return level10Train2Order.join('');
        if (currentLevel === 11) return level11Train2Order.join('');
        if (currentLevel === 12) return level12Train2Order.join('');
        if (currentLevel === 13) return level13Train2Order.join('');
        if (currentLevel === 14) return level14Train2Order.join('');
        if (currentLevel === 15) return level15Train2Order.join('');
        if (currentLevel === 16) return level16Train2Order.join('');
        if (currentLevel === 17) return level17Train2Order.join('');
        if (currentLevel === 18) return level18Train2Order.join('');
        if (currentLevel === 19) return level19Train2Order.join('');
        if (currentLevel === 20) return level20Train2Order.join('');
        if (currentLevel === 21) return level21Train2Order.join('');
        if (currentLevel === 22) return level22Train2Order.join('');
        if (currentLevel === 23) return level23Train2Order.join('');
        if (currentLevel === 24) return level24Train2Order.join('');
        if (currentLevel === 25) return level25Train2Order.join('');
        if (currentLevel === 26) return level26Train2Order.join('');
        return level27Train2Order.join('');
    } else if (p === 3) {
        if (currentLevel === 1) return level1Train3Order.join('');
        if (currentLevel === 2) return level2Train3Order.join('');
        if (currentLevel === 3) return level3Train3Order.join('');
        if (currentLevel === 4) return level4Train3Order.join('');
        if (currentLevel === 5) return level5Train3Order.join('');
        if (currentLevel === 6) return level6Train3Order.join('');
        if (currentLevel === 7) return level7Train3Order.join('');
        if (currentLevel === 8) return level8Train3Order.join('');
        if (currentLevel === 9) return level9Train3Order.join('');
        if (currentLevel === 10) return level10Train3Order.join('');
        if (currentLevel === 11) return level11Train3Order.join('');
        if (currentLevel === 12) return level12Train3Order.join('');
        if (currentLevel === 13) return level13Train3Order.join('');
        if (currentLevel === 14) return level14Train3Order.join('');
        if (currentLevel === 15) return level15Train3Order.join('');
        if (currentLevel === 16) return level16Train3Order.join('');
        if (currentLevel === 17) return level17Train3Order.join('');
        if (currentLevel === 18) return level18Train3Order.join('');
        if (currentLevel === 19) return level19Train3Order.join('');
        if (currentLevel === 20) return level20Train3Order.join('');
        if (currentLevel === 21) return level21Train3Order.join('');
        if (currentLevel === 22) return level22Train3Order.join('');
        if (currentLevel === 23) return level23Train3Order.join('');
        if (currentLevel === 24) return level24Train3Order.join('');
        if (currentLevel === 25) return level25Train3Order.join('');
        if (currentLevel === 26) return level26Train3Order.join('');
        return level27Train3Order.join('');
    }
    return '';
}

/**
 * 获取指定阶段火车的正确字母顺序数组
 * @param {number} phase - 游戏阶段（1/2/3），默认使用 correctWordPhase
 * @returns {array} - 正确字母顺序数组
 */
function getCurrentTrainOrder(phase) {
    const p = phase || correctWordPhase;
    if (p === 1) {
        if (currentLevel === 1) return level1Train1Order;
        if (currentLevel === 2) return level2Train1Order;
        if (currentLevel === 3) return level3Train1Order;
        if (currentLevel === 4) return level4Train1Order;
        if (currentLevel === 5) return level5Train1Order;
        if (currentLevel === 6) return level6Train1Order;
        if (currentLevel === 7) return level7Train1Order;
        if (currentLevel === 8) return level8Train1Order;
        if (currentLevel === 9) return level9Train1Order;
        if (currentLevel === 10) return level10Train1Order;
        if (currentLevel === 11) return level11Train1Order;
        if (currentLevel === 12) return level12Train1Order;
        if (currentLevel === 13) return level13Train1Order;
        if (currentLevel === 14) return level14Train1Order;
        if (currentLevel === 15) return level15Train1Order;
        if (currentLevel === 16) return level16Train1Order;
        if (currentLevel === 17) return level17Train1Order;
        if (currentLevel === 18) return level18Train1Order;
        if (currentLevel === 19) return level19Train1Order;
        if (currentLevel === 20) return level20Train1Order;
        if (currentLevel === 21) return level21Train1Order;
        if (currentLevel === 22) return level22Train1Order;
        if (currentLevel === 23) return level23Train1Order;
        if (currentLevel === 24) return level24Train1Order;
        if (currentLevel === 25) return level25Train1Order;
        if (currentLevel === 26) return level26Train1Order;
        return level27Train1Order;
    } else if (p === 2) {
        if (currentLevel === 1) return level1Train2Order;
        if (currentLevel === 2) return level2Train2Order;
        if (currentLevel === 3) return level3Train2Order;
        if (currentLevel === 4) return level4Train2Order;
        if (currentLevel === 5) return level5Train2Order;
        if (currentLevel === 6) return level6Train2Order;
        if (currentLevel === 7) return level7Train2Order;
        if (currentLevel === 8) return level8Train2Order;
        if (currentLevel === 9) return level9Train2Order;
        if (currentLevel === 10) return level10Train2Order;
        if (currentLevel === 11) return level11Train2Order;
        if (currentLevel === 12) return level12Train2Order;
        if (currentLevel === 13) return level13Train2Order;
        if (currentLevel === 14) return level14Train2Order;
        if (currentLevel === 15) return level15Train2Order;
        if (currentLevel === 16) return level16Train2Order;
        if (currentLevel === 17) return level17Train2Order;
        if (currentLevel === 18) return level18Train2Order;
        if (currentLevel === 19) return level19Train2Order;
        if (currentLevel === 20) return level20Train2Order;
        if (currentLevel === 21) return level21Train2Order;
        if (currentLevel === 22) return level22Train2Order;
        if (currentLevel === 23) return level23Train2Order;
        if (currentLevel === 24) return level24Train2Order;
        if (currentLevel === 25) return level25Train2Order;
        if (currentLevel === 26) return level26Train2Order;
        return level27Train2Order;
    } else if (p === 3) {
        if (currentLevel === 1) return level1Train3Order;
        if (currentLevel === 2) return level2Train3Order;
        if (currentLevel === 3) return level3Train3Order;
        if (currentLevel === 4) return level4Train3Order;
        if (currentLevel === 5) return level5Train3Order;
        if (currentLevel === 6) return level6Train3Order;
        if (currentLevel === 7) return level7Train3Order;
        if (currentLevel === 8) return level8Train3Order;
        if (currentLevel === 9) return level9Train3Order;
        if (currentLevel === 10) return level10Train3Order;
        if (currentLevel === 11) return level11Train3Order;
        if (currentLevel === 12) return level12Train3Order;
        if (currentLevel === 13) return level13Train3Order;
        if (currentLevel === 14) return level14Train3Order;
        if (currentLevel === 15) return level15Train3Order;
        if (currentLevel === 16) return level16Train3Order;
        if (currentLevel === 17) return level17Train3Order;
        if (currentLevel === 18) return level18Train3Order;
        if (currentLevel === 19) return level19Train3Order;
        if (currentLevel === 20) return level20Train3Order;
        if (currentLevel === 21) return level21Train3Order;
        if (currentLevel === 22) return level22Train3Order;
        if (currentLevel === 23) return level23Train3Order;
        if (currentLevel === 24) return level24Train3Order;
        if (currentLevel === 25) return level25Train3Order;
        if (currentLevel === 26) return level26Train3Order;
        return level27Train3Order;
    }
    return [];
}

/**
 * 获取指定阶段火车的配置信息
 * @param {number} phase - 游戏阶段（1/2/3），默认使用 correctWordPhase
 * @returns {object} - 包含 x, y, width, height 的火车配置
 */
function getCurrentTrainConfig(phase) {
    const p = phase || correctWordPhase;
    if (p === 1) return trainConfig;
    if (p === 2) return train2Config;
    if (p === 3) return train3Config;
    return null;
}

/**
 * 获取指定阶段火车的字母配置
 * @param {number} phase - 游戏阶段（1/2/3），默认使用 correctWordPhase
 * @returns {object} - 字母配置对象
 */
function getCurrentLetterConfig(phase) {
    const p = phase || correctWordPhase;
    if (p === 1) return trainLetterConfig.train1;
    if (p === 2) return trainLetterConfig.train2;
    if (p === 3) return trainLetterConfig.train3;
    return null;
}

/**
 * 播放当前阶段对应的单词音频（纯播放，不修改任何状态或回调）
 * @param {number} phase - 游戏阶段（1/2/3），默认使用 correctWordPhase
 */
function playCurrentWordAudio(phase) {
    const p = phase || correctWordPhase;
    let audio = null;
    
    if (p === 1) {
        if (currentLevel === 1) audio = catAudio;
        else if (currentLevel === 2) audio = redAudio;
        else if (currentLevel === 3) audio = sixAudio;
        else if (currentLevel === 4) audio = cutAudio;
        else if (currentLevel === 5) audio = eatAudio;
        else if (currentLevel === 6) audio = bigAudio;
        else if (currentLevel === 7) audio = whoAudio;
        else if (currentLevel === 8) audio = sunAudio;
        else if (currentLevel === 9) audio = runAudio;
        else if (currentLevel === 10) audio = legAudio;
        else if (currentLevel === 11) audio = penAudio;
        else if (currentLevel === 12) audio = hatAudio;
        else if (currentLevel === 13) audio = letAudio;
        else if (currentLevel === 14) audio = manAudio;
        else if (currentLevel === 15) audio = nodAudio;
        else if (currentLevel === 16) audio = seaAudio;
        else if (currentLevel === 17) audio = toyAudio;
        else if (currentLevel === 18) audio = USAAudio;
        else if (currentLevel === 19) audio = capAudio;
        else if (currentLevel === 20) audio = hopAudio;
        else if (currentLevel === 21) audio = fatAudio;
        else if (currentLevel === 22) audio = rowAudio;
        else if (currentLevel === 23) audio = zooAudio;
        else if (currentLevel === 24) audio = cowAudio;
        else if (currentLevel === 25) audio = flyAudio;
        else if (currentLevel === 26) audio = boxAudio;
        else audio = mixAudio;
    } else if (p === 2) {
        if (currentLevel === 1) audio = dogAudio;
        else if (currentLevel === 2) audio = yesAudio;
        else if (currentLevel === 3) audio = oneAudio;
        else if (currentLevel === 4) audio = twoAudio;
        else if (currentLevel === 5) audio = eggAudio;
        else if (currentLevel === 6) audio = armAudio;
        else if (currentLevel === 7) audio = howAudio;
        else if (currentLevel === 8) audio = sheAudio;
        else if (currentLevel === 9) audio = bagAudio;
        else if (currentLevel === 10) audio = sitAudio;
        else if (currentLevel === 11) audio = oldAudio;
        else if (currentLevel === 12) audio = canAudio;
        else if (currentLevel === 13) audio = theAudio;
        else if (currentLevel === 14) audio = areAudio;
        else if (currentLevel === 15) audio = carAudio;
        else if (currentLevel === 16) audio = skyAudio;
        else if (currentLevel === 17) audio = sadAudio;
        else if (currentLevel === 18) audio = henAudio;
        else if (currentLevel === 19) audio = bedAudio;
        else if (currentLevel === 20) audio = busAudio;
        else if (currentLevel === 21) audio = pigAudio;
        else if (currentLevel === 22) audio = mapAudio;
        else if (currentLevel === 23) audio = cupAudio;
        else if (currentLevel === 24) audio = dadAudio;
        else if (currentLevel === 25) audio = seeAudio;
        else if (currentLevel === 26) audio = momAudio;
        else audio = tenAudio;
    } else if (p === 3) {
        if (currentLevel === 1) audio = birdAudio;
        else if (currentLevel === 2) audio = fourAudio;
        else if (currentLevel === 3) audio = fiveAudio;
        else if (currentLevel === 4) audio = blueAudio;
        else if (currentLevel === 5) audio = pearAudio;
        else if (currentLevel === 6) audio = handAudio;
        else if (currentLevel === 7) audio = footAudio;
        else if (currentLevel === 8) audio = moonAudio;
        else if (currentLevel === 9) audio = loveAudio;
        else if (currentLevel === 10) audio = faceAudio;
        else if (currentLevel === 11) audio = bookAudio;
        else if (currentLevel === 12) audio = headAudio;
        else if (currentLevel === 13) audio = deskAudio;
        else if (currentLevel === 14) audio = treeAudio;
        else if (currentLevel === 15) audio = feedAudio;
        else if (currentLevel === 16) audio = likeAudio;
        else if (currentLevel === 17) audio = milkAudio;
        else if (currentLevel === 18) audio = kiteAudio;
        else if (currentLevel === 19) audio = longAudio;
        else if (currentLevel === 20) audio = lookAudio;
        else if (currentLevel === 21) audio = riceAudio;
        else if (currentLevel === 22) audio = cakeAudio;
        else if (currentLevel === 23) audio = noseAudio;
        else if (currentLevel === 24) audio = manyAudio;
        else if (currentLevel === 25) audio = jumpAudio;
        else if (currentLevel === 26) audio = findAudio;
        else audio = haveAudio;
    }
    
    if (audio) {
        // 清除旧的 onended 回调，防止触发 startAudioTimer 等干扰逻辑
        audio.onended = null;
        audio.currentTime = 0;
        audio.play().catch((err) => {
            console.log('Word audio play failed:', err);
        });
    }
}

/**
 * 显示绿色正确单词并启动后续流程
 * 捕获当前火车位置作为固定位置，播放3遍单词音频，同时正确单词闪动，播放完后火车向左移动
 * @param {number} phase - 游戏阶段（1/2/3）
 */
function showCorrectWordAndSchedule(phase) {
    showCorrectWord = true;
    correctWordPhase = phase;
    
    // 捕获当前火车位置作为固定位置（不随火车移动）
    const trainCfg = getCurrentTrainConfig(phase);
    if (trainCfg) {
        correctWordFixedX = trainCfg.x;
        correctWordFixedY = trainCfg.y;
    }
    
    // 增加答错次数（每个阶段答错算1次）
    wrongCount++;
    
    // 更新爱心显示
    updateHeartsDisplay();
    
    // 显示黑烟效果1
    showBlackSmoke = true;
    smokeTrainIndex = phase;
    
    // 开始正确单词闪动
    startCorrectWordFlash();
    
    // 播放3遍对应的单词音频（即使答错次数达到5次也要播放）
    playWordAudioThreeTimes(phase);
}

/**
 * 开始正确单词闪动效果
 */
function startCorrectWordFlash() {
    correctWordFlash = true;
    // 每500ms切换一次显示状态
    if (correctWordFlashTimer) clearInterval(correctWordFlashTimer);
    correctWordFlashTimer = setInterval(() => {
        correctWordFlash = !correctWordFlash;
    }, 500);
}

/**
 * 停止正确单词闪动效果
 */
function stopCorrectWordFlash() {
    correctWordFlash = false;
    if (correctWordFlashTimer) {
        clearInterval(correctWordFlashTimer);
        correctWordFlashTimer = null;
    }
}

/**
 * 播放单词音频3次
 * @param {number} phase - 游戏阶段（1/2/3）
 */
function playWordAudioThreeTimes(phase) {
    let playCount = 0;
    
    function playNext() {
        if (playCount >= 3) {
            // 播放完3遍，停止闪动并开始火车向左移动
            stopCorrectWordFlash();
            showCorrectWord = false;     // 隐藏正确单词
            showBlackSmoke = false;      // 隐藏黑烟1
            showBlackSmoke2 = true;      // 显示黑烟2
            
            // 如果答错次数达到5次，停止所有非背景音乐的音频
            if (wrongCount >= 5) {
                stopAllWordAudios();
            }
            
            // 开始火车向左移动动画
            if (phase === 1) {
                startTrain1MoveLeft();
            } else if (phase === 2) {
                startTrain2MoveLeft();
            } else if (phase === 3) {
                startTrain3MoveLeft();
            }
            return;
        }
        
        const audio = getCurrentWordAudio(phase);
        if (audio) {
            // 确保音频已加载完成
            if (audio.readyState < 2) {
                // 音频还未加载完成，等待加载
                audio.addEventListener('canplaythrough', function listener() {
                    audio.removeEventListener('canplaythrough', listener);
                    playAudioOnce();
                });
                // 预加载音频
                audio.load();
                return;
            }
            
            playAudioOnce();
        } else {
            // 没有音频，继续下一次
            playCount++;
            playNext();
        }
    }
    
    function playAudioOnce() {
        const audio = getCurrentWordAudio(phase);
        if (!audio) {
            playCount++;
            playNext();
            return;
        }
        
        // 移除之前的 onended 事件监听器，防止重复触发
        audio.onended = null;
        
        // 重置音频到开始位置
        audio.currentTime = 0;
        
        // 直接监听 onended 事件
        audio.onended = function onAudioEnded() {
            audio.onended = null; // 移除监听器
            playCount++;
            // 音频播放完后，等待短暂时间再播放下一遍
            setTimeout(playNext, 200);
        };
        
        // 播放音频
        audio.play().catch((err) => {
            // 播放失败，继续下一次
            audio.onended = null;
            playCount++;
            playNext();
        });
    }
    
    // 开始播放第一遍
    playNext();
}

/**
 * 获取当前阶段的单词音频
 * @param {number} phase - 游戏阶段（1/2/3）
 * @returns {Audio|null}
 */
function getCurrentWordAudio(phase) {
    const p = phase || correctWordPhase;
    
    if (p === 1) {
        if (currentLevel === 1) return catAudio;
        else if (currentLevel === 2) return redAudio;
        else if (currentLevel === 3) return sixAudio;
        else if (currentLevel === 4) return cutAudio;
        else if (currentLevel === 5) return eatAudio;
        else if (currentLevel === 6) return bigAudio;
        else if (currentLevel === 7) return whoAudio;
        else if (currentLevel === 8) return sunAudio;
        else if (currentLevel === 9) return runAudio;
        else if (currentLevel === 10) return legAudio;
        else if (currentLevel === 11) return penAudio;
        else if (currentLevel === 12) return hatAudio;
        else if (currentLevel === 13) return letAudio;
        else if (currentLevel === 14) return manAudio;
        else if (currentLevel === 15) return nodAudio;
        else if (currentLevel === 16) return seaAudio;
        else if (currentLevel === 17) return toyAudio;
        else if (currentLevel === 18) return USAAudio;
        else if (currentLevel === 19) return capAudio;
        else if (currentLevel === 20) return hopAudio;
        else if (currentLevel === 21) return fatAudio;
        else if (currentLevel === 22) return rowAudio;
        else if (currentLevel === 23) return zooAudio;
        else if (currentLevel === 24) return cowAudio;
        else if (currentLevel === 25) return flyAudio;
        else if (currentLevel === 26) return boxAudio;
        else return mixAudio;
    } else if (p === 2) {
        if (currentLevel === 1) return dogAudio;
        else if (currentLevel === 2) return yesAudio;
        else if (currentLevel === 3) return oneAudio;
        else if (currentLevel === 4) return twoAudio;
        else if (currentLevel === 5) return eggAudio;
        else if (currentLevel === 6) return armAudio;
        else if (currentLevel === 7) return howAudio;
        else if (currentLevel === 8) return sheAudio;
        else if (currentLevel === 9) return bagAudio;
        else if (currentLevel === 10) return sitAudio;
        else if (currentLevel === 11) return oldAudio;
        else if (currentLevel === 12) return canAudio;
        else if (currentLevel === 13) return theAudio;
        else if (currentLevel === 14) return areAudio;
        else if (currentLevel === 15) return carAudio;
        else if (currentLevel === 16) return skyAudio;
        else if (currentLevel === 17) return sadAudio;
        else if (currentLevel === 18) return henAudio;
        else if (currentLevel === 19) return bedAudio;
        else if (currentLevel === 20) return busAudio;
        else if (currentLevel === 21) return pigAudio;
        else if (currentLevel === 22) return mapAudio;
        else if (currentLevel === 23) return cupAudio;
        else if (currentLevel === 24) return dadAudio;
        else if (currentLevel === 25) return seeAudio;
        else if (currentLevel === 26) return momAudio;
        else return tenAudio;
    } else if (p === 3) {
        if (currentLevel === 1) return birdAudio;
        else if (currentLevel === 2) return fourAudio;
        else if (currentLevel === 3) return fiveAudio;
        else if (currentLevel === 4) return blueAudio;
        else if (currentLevel === 5) return pearAudio;
        else if (currentLevel === 6) return handAudio;
        else if (currentLevel === 7) return footAudio;
        else if (currentLevel === 8) return moonAudio;
        else if (currentLevel === 9) return loveAudio;
        else if (currentLevel === 10) return faceAudio;
        else if (currentLevel === 11) return bookAudio;
        else if (currentLevel === 12) return headAudio;
        else if (currentLevel === 13) return deskAudio;
        else if (currentLevel === 14) return treeAudio;
        else if (currentLevel === 15) return feedAudio;
        else if (currentLevel === 16) return likeAudio;
        else if (currentLevel === 17) return milkAudio;
        else if (currentLevel === 18) return kiteAudio;
        else if (currentLevel === 19) return longAudio;
        else if (currentLevel === 20) return lookAudio;
        else if (currentLevel === 21) return riceAudio;
        else if (currentLevel === 22) return cakeAudio;
        else if (currentLevel === 23) return noseAudio;
        else if (currentLevel === 24) return manyAudio;
        else if (currentLevel === 25) return jumpAudio;
        else if (currentLevel === 26) return findAudio;
        else return haveAudio;
    }
    return null;
}

/**
 * 加载所有图片资源
 */
// 资源加载完成回调函数
function onResourceLoaded() {
    loadedResources++;
    const progress = Math.round((loadedResources / totalResources) * 100);
    loadingProgress.style.width = `${progress}%`;
    loadingPercent.textContent = `${progress}%`;
    
    // 所有资源加载完成
    if (loadedResources >= totalResources) {
        resourcesLoaded = true;
        // 隐藏加载界面
        loadingScreen.style.display = 'none';
        // 显示开始按钮
        const startBtn = document.querySelector('.start_button');
        if (startBtn) {
            startBtn.style.display = 'block';
        }
        // 绘制开始界面
        if (gameState === 'start') {
            drawStartScreen();
        }
        
        // 尝试播放背景音乐（使用用户交互技巧绕过浏览器限制）
        // 创建一个临时的用户交互事件来触发音频播放
        if (!backgroundAudio) {
            backgroundAudio = new Audio('assets/background.mp3');
            backgroundAudio.loop = true;
            backgroundAudio.volume = 0.17;
            
            // 尝试直接播放
            backgroundAudio.play().catch((err) => {
                console.log('Background audio autoplay failed, will play on first user interaction:', err);
                // 如果自动播放失败，监听用户的第一次交互
                const playOnInteraction = () => {
                    if (backgroundAudio && backgroundAudio.paused) {
                        backgroundAudio.play().catch(() => {});
                    }
                    // 移除监听器
                    document.removeEventListener('click', playOnInteraction);
                    document.removeEventListener('touchstart', playOnInteraction);
                };
                document.addEventListener('click', playOnInteraction);
                document.addEventListener('touchstart', playOnInteraction);
            });
        }
    }
}

// 加载单个图片资源
function loadImage(img, src) {
    totalResources++;
    img.src = src;
    img.onload = onResourceLoaded;
    img.onerror = () => {
        console.error('图片加载失败:', src);
        onResourceLoaded(); // 即使加载失败也继续
    };
}

function loadImages() {
    // 加载背景图
    backgroundImg = new Image();
    loadImage(backgroundImg, 'assets/background.png');
    
    // 加载火车1图片（移动时）
    trainImg = new Image();
    loadImage(trainImg, 'assets/car1.png');
    
    // 加载火车1图片（静止时）
    trainImgStatic = new Image();
    loadImage(trainImgStatic, 'assets/car1(1).png');
    
    // 加载火车2图片（移动时）
    train2Img = new Image();
    loadImage(train2Img, 'assets/car2.png');
    
    // 加载火车2图片（静止时）
    train2ImgStatic = new Image();
    loadImage(train2ImgStatic, 'assets/car2(1).png');
    
    // 加载火车3图片（移动时）
    train3Img = new Image();
    loadImage(train3Img, 'assets/car3.png');
    
    // 加载火车3图片（静止时）
    train3ImgStatic = new Image();
    loadImage(train3ImgStatic, 'assets/car3(1).png');
    
    // 加载黑烟图片1（错误选择时显示）
    blackSmokeImg = new Image();
    loadImage(blackSmokeImg, 'assets/heiyan1.png');
    
    // 加载黑烟图片2（火车向左移动时显示）
    blackSmokeImg2 = new Image();
    loadImage(blackSmokeImg2, 'assets/heiyan2.png');
    
    // 加载阶段1正确区域图片
    zoneImg = new Image();
    loadImage(zoneImg, 'assets/car1_1.png');
    
    // 加载阶段2正确区域图片
    zoneImg2 = new Image();
    loadImage(zoneImg2, 'assets/car2_1.png');
    
    // 加载阶段3正确区域图片
    zoneImg3 = new Image();
    loadImage(zoneImg3, 'assets/car3_1.png');
    
    // 加载结算界面庆祝图片
    endImg1 = new Image();
    loadImage(endImg1, 'assets/end1.png');
    
    endImg2 = new Image();
    loadImage(endImg2, 'assets/end2.png');
    
    endImg3 = new Image();
    loadImage(endImg3, 'assets/end3.png');
    
    // 加载成绩报告底图
    reportImg = new Image();
    loadImage(reportImg, 'assets/report.png');
}

/**
 * 绘制开始界面
 * 显示背景图 + 半透明遮罩
 */
function drawStartScreen() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 绘制背景图
    if (backgroundImg) {
        ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    }
    // 绘制半透明灰色遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 显示开始按钮（由HTML中定义，资源加载完成后显示）
    const startBtn = document.querySelector('.start_button');
    if (startBtn && resourcesLoaded) {
        startBtn.style.display = 'block';
    }
}

/**
 * 开始游戏
 * 初始化游戏状态、创建音频对象、启动倒计时和绘制循环
 * @param {boolean} resetCurrentLevelScore - 是否重置当前关卡已获得的分数
 */
function startGame(resetCurrentLevelScore = true) {
    // 仅在玩家真正开始一局时上报；关卡间自动切换不会重复创建会话
    if (!gameTracker.sessionId) {
        gameTracker.start();
    }

    // 游戏开始后显示顶部信息栏和学习报告入口
    if (gameHudEl) {
        gameHudEl.style.display = 'flex';
    }
    if (endGameButtonEl) {
        endGameButtonEl.style.display = 'flex';
    }

    // 移除开始按钮
    const btn = document.querySelector('.start_button');
    if (btn) {
        btn.remove();
    }
    
    // 记录玩过的关卡
    if (!playedLevels.includes(currentLevel)) {
        playedLevels.push(currentLevel);
    }
    
    // 根据关卡创建音频对象（在用户交互时创建，兼容iOS）
    const wordVolume = 1; // 单词音频音量（0-1）
    if (currentLevel === 1) {
        catAudio = new Audio('assets/cat.mp3'); catAudio.volume = wordVolume;
        dogAudio = new Audio('assets/dog.mp3'); dogAudio.volume = wordVolume;
        birdAudio = new Audio('assets/bird.mp3'); birdAudio.volume = wordVolume;
    } else if (currentLevel === 2) {
        redAudio = new Audio('assets/red.mp3'); redAudio.volume = wordVolume;
        yesAudio = new Audio('assets/yes.mp3'); yesAudio.volume = wordVolume;
        fourAudio = new Audio('assets/four.mp3'); fourAudio.volume = wordVolume;
    } else if (currentLevel === 3) {
        sixAudio = new Audio('assets/six.mp3'); sixAudio.volume = wordVolume;
        oneAudio = new Audio('assets/one.mp3'); oneAudio.volume = wordVolume;
        fiveAudio = new Audio('assets/five.mp3'); fiveAudio.volume = wordVolume;
    } else if (currentLevel === 4) {
        cutAudio = new Audio('assets/cut.mp3'); cutAudio.volume = wordVolume;
        twoAudio = new Audio('assets/two.mp3'); twoAudio.volume = wordVolume;
        blueAudio = new Audio('assets/blue.mp3'); blueAudio.volume = wordVolume;
    } else if (currentLevel === 5) {
        eatAudio = new Audio('assets/eat.mp3'); eatAudio.volume = wordVolume;
        eggAudio = new Audio('assets/egg.mp3'); eggAudio.volume = wordVolume;
        pearAudio = new Audio('assets/pear.mp3'); pearAudio.volume = wordVolume;
    } else if (currentLevel === 6) {
        bigAudio = new Audio('assets/big.mp3'); bigAudio.volume = wordVolume;
        armAudio = new Audio('assets/arm.mp3'); armAudio.volume = wordVolume;
        handAudio = new Audio('assets/hand.mp3'); handAudio.volume = wordVolume;
    } else if (currentLevel === 7) {
        whoAudio = new Audio('assets/who.mp3'); whoAudio.volume = wordVolume;
        howAudio = new Audio('assets/how.mp3'); howAudio.volume = wordVolume;
        footAudio = new Audio('assets/foot.mp3'); footAudio.volume = wordVolume;
    } else if (currentLevel === 8) {
        sunAudio = new Audio('assets/sun.mp3'); sunAudio.volume = wordVolume;
        sheAudio = new Audio('assets/she.mp3'); sheAudio.volume = wordVolume;
        moonAudio = new Audio('assets/moon.mp3'); moonAudio.volume = wordVolume;
    } else if (currentLevel === 9) {
        runAudio = new Audio('assets/run.mp3'); runAudio.volume = wordVolume;
        bagAudio = new Audio('assets/bag.mp3'); bagAudio.volume = wordVolume;
        loveAudio = new Audio('assets/love.mp3'); loveAudio.volume = wordVolume;
    } else if (currentLevel === 10) {
        legAudio = new Audio('assets/leg.mp3'); legAudio.volume = wordVolume;
        sitAudio = new Audio('assets/sit.mp3'); sitAudio.volume = wordVolume;
        faceAudio = new Audio('assets/face.mp3'); faceAudio.volume = wordVolume;
    } else if (currentLevel === 11) {
        penAudio = new Audio('assets/pen.mp3'); penAudio.volume = wordVolume;
        oldAudio = new Audio('assets/old.mp3'); oldAudio.volume = wordVolume;
        bookAudio = new Audio('assets/book.mp3'); bookAudio.volume = wordVolume;
    } else if (currentLevel === 12) {
        hatAudio = new Audio('assets/hat.mp3'); hatAudio.volume = wordVolume;
        canAudio = new Audio('assets/can.mp3'); canAudio.volume = wordVolume;
        headAudio = new Audio('assets/head.mp3'); headAudio.volume = wordVolume;
    } else if (currentLevel === 13) {
        letAudio = new Audio('assets/let.mp3'); letAudio.volume = wordVolume;
        theAudio = new Audio('assets/the.mp3'); theAudio.volume = wordVolume;
        deskAudio = new Audio('assets/desk.mp3'); deskAudio.volume = wordVolume;
    } else if (currentLevel === 14) {
        manAudio = new Audio('assets/man.mp3'); manAudio.volume = wordVolume;
        areAudio = new Audio('assets/are.mp3'); areAudio.volume = wordVolume;
        treeAudio = new Audio('assets/tree.mp3'); treeAudio.volume = wordVolume;
    } else if (currentLevel === 15) {
        nodAudio = new Audio('assets/nod.mp3'); nodAudio.volume = wordVolume;
        carAudio = new Audio('assets/car.mp3'); carAudio.volume = wordVolume;
        feedAudio = new Audio('assets/feed.mp3'); feedAudio.volume = wordVolume;
    } else if (currentLevel === 16) {
        seaAudio = new Audio('assets/sea.mp3'); seaAudio.volume = wordVolume;
        skyAudio = new Audio('assets/sky.mp3'); skyAudio.volume = wordVolume;
        likeAudio = new Audio('assets/like.mp3'); likeAudio.volume = wordVolume;
    } else if (currentLevel === 17) {
        toyAudio = new Audio('assets/toy.mp3'); toyAudio.volume = wordVolume;
        sadAudio = new Audio('assets/sad.mp3'); sadAudio.volume = wordVolume;
        milkAudio = new Audio('assets/milk.mp3'); milkAudio.volume = wordVolume;
    } else if (currentLevel === 18) {
        USAAudio = new Audio('assets/USA.mp3'); USAAudio.volume = wordVolume;
        henAudio = new Audio('assets/hen.mp3'); henAudio.volume = wordVolume;
        kiteAudio = new Audio('assets/kite.mp3'); kiteAudio.volume = wordVolume;
    } else if (currentLevel === 19) {
        capAudio = new Audio('assets/cap.mp3'); capAudio.volume = wordVolume;
        bedAudio = new Audio('assets/bed.mp3'); bedAudio.volume = wordVolume;
        longAudio = new Audio('assets/long.mp3'); longAudio.volume = wordVolume;
    } else if (currentLevel === 20) {
        hopAudio = new Audio('assets/hop.mp3'); hopAudio.volume = wordVolume;
        busAudio = new Audio('assets/bus.mp3'); busAudio.volume = wordVolume;
        lookAudio = new Audio('assets/look.mp3'); lookAudio.volume = wordVolume;
    } else if (currentLevel === 21) {
        fatAudio = new Audio('assets/fat.mp3'); fatAudio.volume = wordVolume;
        pigAudio = new Audio('assets/pig.mp3'); pigAudio.volume = wordVolume;
        riceAudio = new Audio('assets/rice.mp3'); riceAudio.volume = wordVolume;
    } else if (currentLevel === 22) {
        rowAudio = new Audio('assets/row.mp3'); rowAudio.volume = wordVolume;
        mapAudio = new Audio('assets/map.mp3'); mapAudio.volume = wordVolume;
        cakeAudio = new Audio('assets/cake.mp3'); cakeAudio.volume = wordVolume;
    } else if (currentLevel === 23) {
        zooAudio = new Audio('assets/zoo.mp3'); zooAudio.volume = wordVolume;
        cupAudio = new Audio('assets/cup.mp3'); cupAudio.volume = wordVolume;
        noseAudio = new Audio('assets/nose.mp3'); noseAudio.volume = wordVolume;
    } else if (currentLevel === 24) {
        cowAudio = new Audio('assets/cow.mp3'); cowAudio.volume = wordVolume;
        dadAudio = new Audio('assets/dad.mp3'); dadAudio.volume = wordVolume;
        manyAudio = new Audio('assets/many.mp3'); manyAudio.volume = wordVolume;
    } else if (currentLevel === 25) {
        flyAudio = new Audio('assets/fly.mp3'); flyAudio.volume = wordVolume;
        seeAudio = new Audio('assets/see.mp3'); seeAudio.volume = wordVolume;
        jumpAudio = new Audio('assets/jump.mp3'); jumpAudio.volume = wordVolume;
    } else if (currentLevel === 26) {
        boxAudio = new Audio('assets/box.mp3'); boxAudio.volume = wordVolume;
        momAudio = new Audio('assets/mom.mp3'); momAudio.volume = wordVolume;
        findAudio = new Audio('assets/find.mp3'); findAudio.volume = wordVolume;
    } else if (currentLevel === 27) {
        mixAudio = new Audio('assets/mix.mp3'); mixAudio.volume = wordVolume;
        tenAudio = new Audio('assets/ten.mp3'); tenAudio.volume = wordVolume;
        haveAudio = new Audio('assets/have.mp3'); haveAudio.volume = wordVolume;
    }
    
    // 创建错误音效对象（如果还没有创建）
    if (!wrongAudio) {
        wrongAudio = new Audio('assets/wrong.mp3');
        wrongAudio.volume = 0.5; // 设置音量
    }
    
    // 创建火车音效对象（不自动播放，需要时播放）
    trainSound = new Audio('assets/train.mp3');
    trainSound.volume = 0.5; // 设置音量（0-1）
    
    // 重置游戏状态
    gameState = 'playing';
    if (resetCurrentLevelScore) {
        score = scoreAtLevelStart;
    } else {
        scoreAtLevelStart = score;
    }
    timeLeft = 60;
    
    // 重置当前关卡的掌握单词记录（只记录最新一局）
    const levelWords = allWords[`level${currentLevel}`];
    if (levelWords) {
        // 移除当前关卡之前记录的单词
        masteredWords = masteredWords.filter(word => !levelWords.includes(word));
        // 更新总掌握数
        totalMastered = masteredWords.length;
    }
    correctClicked = 0;
    totalClicked = 0;
    hasWrongSelection = false;
    
    // 根据关卡重置音频状态
    if (currentLevel === 1) {
        audioPlayed = false;
        audioEnded = false;
        dogAudioPlayed = false;
        dogAudioEnded = false;
        birdAudioPlayed = false;
        birdAudioEnded = false;
    } else if (currentLevel === 2) {
        audioPlayed = false;
        audioEnded = false;
        yesAudioPlayed = false;
        yesAudioEnded = false;
        fourAudioPlayed = false;
        fourAudioEnded = false;
    } else if (currentLevel === 3) {
        audioPlayed = false;
        audioEnded = false;
        oneAudioPlayed = false;
        oneAudioEnded = false;
        fiveAudioPlayed = false;
        fiveAudioEnded = false;
    } else if (currentLevel === 4) {
        audioPlayed = false;
        audioEnded = false;
        cutAudioPlayed = false;
        cutAudioEnded = false;
        twoAudioPlayed = false;
        twoAudioEnded = false;
        blueAudioPlayed = false;
        blueAudioEnded = false;
    }
    
    trainMoving = false;           // 重置火车1移动状态
    train1ReadyToLeave = false;   // 重置火车1准备离开状态
    trainConfig.x = 50;           // 重置火车1位置
    train2Config.x = -600;
    train2Entering = false;
    train2Leaving = false;
    train2ReadyToLeave = false;   // 重置火车2准备离开状态
    train3Config.x = -500;
    train3Entering = false;
    train3Leaving = false;
    train3ReadyToLeave = false;   // 重置火车3准备离开状态
    train3MovingLeft = false;     // 重置火车3向左移动状态
    showBlackSmoke = false;       // 重置黑烟1显示状态
    showBlackSmoke2 = false;      // 重置黑烟2显示状态
    smoke2X = 0;                  // 重置黑烟2位置
    smokeTrainIndex = 0;          // 重置黑烟火车索引
    showCorrectWord = false;      // 重置正确单词显示状态
    correctWordPhase = 0;         // 重置正确单词阶段
    if (correctWordTimer) { clearTimeout(correctWordTimer); correctWordTimer = null; }  // 清除正确单词定时器
    gamePhase = 1;
    
    // 重置当前阶段的区域配置为阶段1
    zones = phase1Zones;
    
    // 重置火车字母
    train1Letters = [];
    train2Letters = [];
    train3Letters = [];
    
    // 重置所有区域状态
    zones.forEach(z => {
        z.clicked = false;
        z.vanished = false;
    });
    
    // 初始化阶段1的随机正确区域
    initRandomCorrectZones();
    // 初始化阶段1的字母
    initPhaseLetters();
    
    // 更新UI显示（显示时间和得分）
    timeDisplayEl.textContent = `Time: ${timeLeft}s`;
    scoreDisplayEl.textContent = `Score: ${score}`;
    
    // 更新爱心显示
    updateHeartsDisplay();
    
    // 启动定时器更新显示
    startCountdownFromCurrentTime();
    
    // 1秒后播放cat音频
    setTimeout(() => {
        playCatAudio();
    }, 500);
    
    // 启动绘制循环
    draw();
}

/**
 * 播放阶段1音频（根据关卡播放不同音频）
 */
function playCatAudio() {
    if (currentLevel === 1 && catAudio) {
        catAudio.currentTime = 0;  // 重置播放位置
        catAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('Cat audio play failed:', err);
        });
        
        catAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 2 && redAudio) {
        redAudio.currentTime = 0;  // 重置播放位置
        redAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('Red audio play failed:', err);
        });
        
        redAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 3 && sixAudio) {
        sixAudio.currentTime = 0;  // 重置播放位置
        sixAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('Six audio play failed:', err);
        });
        
        sixAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 4 && cutAudio) {
        cutAudio.currentTime = 0;  // 重置播放位置
        cutAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('Cut audio play failed:', err);
        });
        
        cutAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 5 && eatAudio) {
        eatAudio.currentTime = 0;  // 重置播放位置
        eatAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('Eat audio play failed:', err);
        });
        
        eatAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 6 && bigAudio) {
        bigAudio.currentTime = 0;  // 重置播放位置
        bigAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('big audio play failed:', err);
        });
        
        bigAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 7 && whoAudio) {
        whoAudio.currentTime = 0;  // 重置播放位置
        whoAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('who audio play failed:', err);
        });
        
        whoAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 8 && sunAudio) {
        sunAudio.currentTime = 0;  // 重置播放位置
        sunAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('sun audio play failed:', err);
        });
        
        sunAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 9 && runAudio) {
        runAudio.currentTime = 0;  // 重置播放位置
        runAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('run audio play failed:', err);
        });
        
        runAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 10 && legAudio) {
        legAudio.currentTime = 0;  // 重置播放位置
        legAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('leg audio play failed:', err);
        });
        
        legAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 11 && penAudio) {
        penAudio.currentTime = 0;  // 重置播放位置
        penAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('pen audio play failed:', err);
        });
        
        penAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 12 && hatAudio) {
        hatAudio.currentTime = 0;  // 重置播放位置
        hatAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('hat audio play failed:', err);
        });
        
        hatAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 13 && letAudio) {
        letAudio.currentTime = 0;  // 重置播放位置
        letAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('let audio play failed:', err);
        });
        
        letAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 14 && manAudio) {
        manAudio.currentTime = 0;  // 重置播放位置
        manAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('man audio play failed:', err);
        });
        
        manAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 15 && nodAudio) {
        nodAudio.currentTime = 0;  // 重置播放位置
        nodAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('nod audio play failed:', err);
        });
        
        nodAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 16 && seaAudio) {
        seaAudio.currentTime = 0;  // 重置播放位置
        seaAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('sea audio play failed:', err);
        });
        
        seaAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 17 && toyAudio) {
        toyAudio.currentTime = 0;  // 重置播放位置
        toyAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('toy audio play failed:', err);
        });
        
        toyAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 18 && USAAudio) {
        USAAudio.currentTime = 0;  // 重置播放位置
        USAAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('USA audio play failed:', err);
        });
        
        USAAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 19 && capAudio) {
        capAudio.currentTime = 0;  // 重置播放位置
        capAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('cap audio play failed:', err);
        });
        
        capAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 20 && hopAudio) {
        hopAudio.currentTime = 0;  // 重置播放位置
        hopAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('hop audio play failed:', err);
        });
        
        hopAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 21 && fatAudio) {
        fatAudio.currentTime = 0;  // 重置播放位置
        fatAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('fat audio play failed:', err);
        });
        
        fatAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 22 && rowAudio) {
        rowAudio.currentTime = 0;  // 重置播放位置
        rowAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('row audio play failed:', err);
        });
        
        rowAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 23 && zooAudio) {
        zooAudio.currentTime = 0;  // 重置播放位置
        zooAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('zoo audio play failed:', err);
        });
        
        zooAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 24 && cowAudio) {
        cowAudio.currentTime = 0;  // 重置播放位置
        cowAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('cow audio play failed:', err);
        });
        
        cowAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 25 && flyAudio) {
        flyAudio.currentTime = 0;  // 重置播放位置
        flyAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('fly audio play failed:', err);
        });
        
        flyAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 26 && boxAudio) {
        boxAudio.currentTime = 0;  // 重置播放位置
        boxAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('box audio play failed:', err);
        });
        
        boxAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 27 && mixAudio) {
        mixAudio.currentTime = 0;  // 重置播放位置
        mixAudio.play().then(() => {
            audioPlayed = true;
        }).catch((err) => {
            console.log('mix audio play failed:', err);
        });
        
        mixAudio.onended = () => {
            audioEnded = true;
            startAudioTimer();
        };
    }
}

/**
 * 启动音频自动播放定时器
 */
function startAudioTimer() {
    // 先清除之前的定时器
    stopAudioTimer();
    
    // 每3秒播放一次当前阶段的音频（根据关卡选择）
    audioTimer = setInterval(() => {
        if (gameState !== 'playing') return;
        
        switch (gamePhase) {
            case 1:
                if (currentLevel === 1 && catAudio) {
                    catAudio.currentTime = 0;
                    catAudio.play().catch(() => {});
                } else if (currentLevel === 2 && redAudio) {
                    redAudio.currentTime = 0;
                    redAudio.play().catch(() => {});
                } else if (currentLevel === 3 && sixAudio) {
                    sixAudio.currentTime = 0;
                    sixAudio.play().catch(() => {});
                } else if (currentLevel === 4 && cutAudio) {
                    cutAudio.currentTime = 0;
                    cutAudio.play().catch(() => {});
                } else if (currentLevel === 5 && eatAudio) {
                    eatAudio.currentTime = 0;
                    eatAudio.play().catch(() => {});
                } else if (currentLevel === 6 && bigAudio) {
                    bigAudio.currentTime = 0;
                    bigAudio.play().catch(() => {});
                } else if (currentLevel === 7 && whoAudio) {
                    whoAudio.currentTime = 0;
                    whoAudio.play().catch(() => {});
                } else if (currentLevel === 8 && sunAudio) {
                    sunAudio.currentTime = 0;
                    sunAudio.play().catch(() => {});
                } else if (currentLevel === 9 && runAudio) {
                    runAudio.currentTime = 0;
                    runAudio.play().catch(() => {});
                } else if (currentLevel === 10 && legAudio) {
                    legAudio.currentTime = 0;
                    legAudio.play().catch(() => {});
                } else if (currentLevel === 11 && penAudio) {
                    penAudio.currentTime = 0;
                    penAudio.play().catch(() => {});
                } else if (currentLevel === 12 && hatAudio) {
                    hatAudio.currentTime = 0;
                    hatAudio.play().catch(() => {});
                } else if (currentLevel === 13 && letAudio) {
                    letAudio.currentTime = 0;
                    letAudio.play().catch(() => {});
                } else if (currentLevel === 14 && manAudio) {
                    manAudio.currentTime = 0;
                    manAudio.play().catch(() => {});
                } else if (currentLevel === 15 && nodAudio) {
                    nodAudio.currentTime = 0;
                    nodAudio.play().catch(() => {});
                } else if (currentLevel === 16 && seaAudio) {
                    seaAudio.currentTime = 0;
                    seaAudio.play().catch(() => {});
                } else if (currentLevel === 17 && toyAudio) {
                    toyAudio.currentTime = 0;
                    toyAudio.play().catch(() => {});
                } else if (currentLevel === 18 && USAAudio) {
                    USAAudio.currentTime = 0;
                    USAAudio.play().catch(() => {});
                } else if (currentLevel === 19 && capAudio) {
                    capAudio.currentTime = 0;
                    capAudio.play().catch(() => {});
                } else if (currentLevel === 20 && hopAudio) {
                    hopAudio.currentTime = 0;
                    hopAudio.play().catch(() => {});
                } else if (currentLevel === 21 && fatAudio) {
                    fatAudio.currentTime = 0;
                    fatAudio.play().catch(() => {});
                } else if (currentLevel === 22 && rowAudio) {
                    rowAudio.currentTime = 0;
                    rowAudio.play().catch(() => {});
                } else if (currentLevel === 23 && zooAudio) {
                    zooAudio.currentTime = 0;
                    zooAudio.play().catch(() => {});
                } else if (currentLevel === 24 && cowAudio) {
                    cowAudio.currentTime = 0;
                    cowAudio.play().catch(() => {});
                } else if (currentLevel === 25 && flyAudio) {
                    flyAudio.currentTime = 0;
                    flyAudio.play().catch(() => {});
                } else if (currentLevel === 26 && boxAudio) {
                    boxAudio.currentTime = 0;
                    boxAudio.play().catch(() => {});
                } else if (currentLevel === 27 && mixAudio) {
                    mixAudio.currentTime = 0;
                    mixAudio.play().catch(() => {});
                }
                break;
            case 2:
                if (currentLevel === 1 && dogAudio) {
                    dogAudio.currentTime = 0;
                    dogAudio.play().catch(() => {});
                } else if (currentLevel === 2 && yesAudio) {
                    yesAudio.currentTime = 0;
                    yesAudio.play().catch(() => {});
                } else if (currentLevel === 3 && oneAudio) {
                    oneAudio.currentTime = 0;
                    oneAudio.play().catch(() => {});
                } else if (currentLevel === 4 && twoAudio) {
                    twoAudio.currentTime = 0;
                    twoAudio.play().catch(() => {});
                } else if (currentLevel === 5 && eggAudio) {
                    eggAudio.currentTime = 0;
                    eggAudio.play().catch(() => {});
                } else if (currentLevel === 6 && armAudio) {
                    armAudio.currentTime = 0;
                    armAudio.play().catch(() => {});
                } else if (currentLevel === 7 && howAudio) {
                    howAudio.currentTime = 0;
                    howAudio.play().catch(() => {});
                } else if (currentLevel === 8 && sheAudio) {
                    sheAudio.currentTime = 0;
                    sheAudio.play().catch(() => {});
                } else if (currentLevel === 9 && bagAudio) {
                    bagAudio.currentTime = 0;
                    bagAudio.play().catch(() => {});
                } else if (currentLevel === 10 && sitAudio) {
                    sitAudio.currentTime = 0;
                    sitAudio.play().catch(() => {});
                } else if (currentLevel === 11 && oldAudio) {
                    oldAudio.currentTime = 0;
                    oldAudio.play().catch(() => {});
                } else if (currentLevel === 12 && canAudio) {
                    canAudio.currentTime = 0;
                    canAudio.play().catch(() => {});
                } else if (currentLevel === 13 && theAudio) {
                    theAudio.currentTime = 0;
                    theAudio.play().catch(() => {});
                } else if (currentLevel === 14 && areAudio) {
                    areAudio.currentTime = 0;
                    areAudio.play().catch(() => {});
                } else if (currentLevel === 15 && carAudio) {
                    carAudio.currentTime = 0;
                    carAudio.play().catch(() => {});
                } else if (currentLevel === 16 && skyAudio) {
                    skyAudio.currentTime = 0;
                    skyAudio.play().catch(() => {});
                } else if (currentLevel === 17 && sadAudio) {
                    sadAudio.currentTime = 0;
                    sadAudio.play().catch(() => {});
                } else if (currentLevel === 18 && henAudio) {
                    henAudio.currentTime = 0;
                    henAudio.play().catch(() => {});
                } else if (currentLevel === 19 && bedAudio) {
                    bedAudio.currentTime = 0;
                    bedAudio.play().catch(() => {});
                } else if (currentLevel === 20 && busAudio) {
                    busAudio.currentTime = 0;
                    busAudio.play().catch(() => {});
                } else if (currentLevel === 21 && pigAudio) {
                    pigAudio.currentTime = 0;
                    pigAudio.play().catch(() => {});
                } else if (currentLevel === 22 && mapAudio) {
                    mapAudio.currentTime = 0;
                    mapAudio.play().catch(() => {});
                } else if (currentLevel === 23 && cupAudio) {
                    cupAudio.currentTime = 0;
                    cupAudio.play().catch(() => {});
                } else if (currentLevel === 24 && dadAudio) {
                    dadAudio.currentTime = 0;
                    dadAudio.play().catch(() => {});
                } else if (currentLevel === 25 && seeAudio) {
                    seeAudio.currentTime = 0;
                    seeAudio.play().catch(() => {});
                } else if (currentLevel === 26 && momAudio) {
                    momAudio.currentTime = 0;
                    momAudio.play().catch(() => {});
                } else if (currentLevel === 27 && tenAudio) {
                    tenAudio.currentTime = 0;
                    tenAudio.play().catch(() => {});
                }
                break;
            case 3:
                if (currentLevel === 1 && birdAudio) {
                    birdAudio.currentTime = 0;
                    birdAudio.play().catch(() => {});
                } else if (currentLevel === 2 && fourAudio) {
                    fourAudio.currentTime = 0;
                    fourAudio.play().catch(() => {});
                } else if (currentLevel === 3 && fiveAudio) {
                    fiveAudio.currentTime = 0;
                    fiveAudio.play().catch(() => {});
                } else if (currentLevel === 4 && blueAudio) {
                    blueAudio.currentTime = 0;
                    blueAudio.play().catch(() => {});
                } else if (currentLevel === 5 && pearAudio) {
                    pearAudio.currentTime = 0;
                    pearAudio.play().catch(() => {});
                } else if (currentLevel === 6 && handAudio) {
                    handAudio.currentTime = 0;
                    handAudio.play().catch(() => {});
                } else if (currentLevel === 7 && footAudio) {
                    footAudio.currentTime = 0;
                    footAudio.play().catch(() => {});
                } else if (currentLevel === 8 && moonAudio) {
                    moonAudio.currentTime = 0;
                    moonAudio.play().catch(() => {});
                } else if (currentLevel === 9 && loveAudio) {
                    loveAudio.currentTime = 0;
                    loveAudio.play().catch(() => {});
                } else if (currentLevel === 10 && faceAudio) {
                    faceAudio.currentTime = 0;
                    faceAudio.play().catch(() => {});
                } else if (currentLevel === 11 && bookAudio) {
                    bookAudio.currentTime = 0;
                    bookAudio.play().catch(() => {});
                } else if (currentLevel === 12 && headAudio) {
                    headAudio.currentTime = 0;
                    headAudio.play().catch(() => {});
                } else if (currentLevel === 13 && deskAudio) {
                    deskAudio.currentTime = 0;
                    deskAudio.play().catch(() => {});
                } else if (currentLevel === 14 && treeAudio) {
                    treeAudio.currentTime = 0;
                    treeAudio.play().catch(() => {});
                } else if (currentLevel === 15 && feedAudio) {
                    feedAudio.currentTime = 0;
                    feedAudio.play().catch(() => {});
                } else if (currentLevel === 16 && likeAudio) {
                    likeAudio.currentTime = 0;
                    likeAudio.play().catch(() => {});
                } else if (currentLevel === 17 && milkAudio) {
                    milkAudio.currentTime = 0;
                    milkAudio.play().catch(() => {});
                } else if (currentLevel === 18 && kiteAudio) {
                    kiteAudio.currentTime = 0;
                    kiteAudio.play().catch(() => {});
                } else if (currentLevel === 19 && longAudio) {
                    longAudio.currentTime = 0;
                    longAudio.play().catch(() => {});
                } else if (currentLevel === 20 && lookAudio) {
                    lookAudio.currentTime = 0;
                    lookAudio.play().catch(() => {});
                } else if (currentLevel === 21 && riceAudio) {
                    riceAudio.currentTime = 0;
                    riceAudio.play().catch(() => {});
                } else if (currentLevel === 22 && cakeAudio) {
                    cakeAudio.currentTime = 0;
                    cakeAudio.play().catch(() => {});
                } else if (currentLevel === 23 && noseAudio) {
                    noseAudio.currentTime = 0;
                    noseAudio.play().catch(() => {});
                } else if (currentLevel === 24 && manyAudio) {
                    manyAudio.currentTime = 0;
                    manyAudio.play().catch(() => {});
                } else if (currentLevel === 25 && jumpAudio) {
                    jumpAudio.currentTime = 0;
                    jumpAudio.play().catch(() => {});
                } else if (currentLevel === 26 && findAudio) {
                    findAudio.currentTime = 0;
                    findAudio.play().catch(() => {});
                } else if (currentLevel === 27 && haveAudio) {
                    haveAudio.currentTime = 0;
                    haveAudio.play().catch(() => {});
                }
                break;
        }
    }, 3000);
}

/**
 * 停止音频自动播放定时器
 */
function stopAudioTimer() {
    if (audioTimer) {
        clearInterval(audioTimer);
        audioTimer = null;
    }
}

/**
 * 更新爱心显示
 */
function updateHeartsDisplay() {
    const heartsContainer = document.getElementById('heartsContainer');
    if (!heartsContainer) return;
    
    const hearts = heartsContainer.querySelectorAll('.heart');
    const remainingAttempts = 5 - wrongCount;
    
    hearts.forEach((heart, index) => {
        heart.style.opacity = index < remainingAttempts ? 1 : 0.3;
    });
}

/**
 * 停止所有单词音频（保留背景音乐）
 */
function stopAllWordAudios() {
    // 停止当前关卡的单词音频
    if (currentLevel === 1) {
        if (catAudio) { catAudio.pause(); catAudio.currentTime = 0; }
        if (dogAudio) { dogAudio.pause(); dogAudio.currentTime = 0; }
        if (birdAudio) { birdAudio.pause(); birdAudio.currentTime = 0; }
    } else if (currentLevel === 2) {
        if (redAudio) { redAudio.pause(); redAudio.currentTime = 0; }
        if (yesAudio) { yesAudio.pause(); yesAudio.currentTime = 0; }
        if (fourAudio) { fourAudio.pause(); fourAudio.currentTime = 0; }
    } else if (currentLevel === 3) {
        if (sixAudio) { sixAudio.pause(); sixAudio.currentTime = 0; }
        if (oneAudio) { oneAudio.pause(); oneAudio.currentTime = 0; }
        if (fiveAudio) { fiveAudio.pause(); fiveAudio.currentTime = 0; }
    } else if (currentLevel === 4) {
        if (cutAudio) { cutAudio.pause(); cutAudio.currentTime = 0; }
        if (twoAudio) { twoAudio.pause(); twoAudio.currentTime = 0; }
        if (blueAudio) { blueAudio.pause(); blueAudio.currentTime = 0; }
    } else if (currentLevel === 5) {
        if (eatAudio) { eatAudio.pause(); eatAudio.currentTime = 0; }
        if (eggAudio) { eggAudio.pause(); eggAudio.currentTime = 0; }
        if (pearAudio) { pearAudio.pause(); pearAudio.currentTime = 0; }
    } else if (currentLevel === 6) {
        if (bigAudio) { bigAudio.pause(); bigAudio.currentTime = 0; }
        if (armAudio) { armAudio.pause(); armAudio.currentTime = 0; }
        if (handAudio) { handAudio.pause(); handAudio.currentTime = 0; }
    } else if (currentLevel === 7) {
        if (whoAudio) { whoAudio.pause(); whoAudio.currentTime = 0; }
        if (howAudio) { howAudio.pause(); howAudio.currentTime = 0; }
        if (footAudio) { footAudio.pause(); footAudio.currentTime = 0; }
    } else if (currentLevel === 8) {
        if (sunAudio) { sunAudio.pause(); sunAudio.currentTime = 0; }
        if (sheAudio) { sheAudio.pause(); sheAudio.currentTime = 0; }
        if (moonAudio) { moonAudio.pause(); moonAudio.currentTime = 0; }
    } else if (currentLevel === 9) {
        if (runAudio) { runAudio.pause(); runAudio.currentTime = 0; }
        if (bagAudio) { bagAudio.pause(); bagAudio.currentTime = 0; }
        if (loveAudio) { loveAudio.pause(); loveAudio.currentTime = 0; }
    } else if (currentLevel === 10) {
        if (legAudio) { legAudio.pause(); legAudio.currentTime = 0; }
        if (sitAudio) { sitAudio.pause(); sitAudio.currentTime = 0; }
        if (faceAudio) { faceAudio.pause(); faceAudio.currentTime = 0; }
    } else if (currentLevel === 11) {
        if (penAudio) { penAudio.pause(); penAudio.currentTime = 0; }
        if (oldAudio) { oldAudio.pause(); oldAudio.currentTime = 0; }
        if (bookAudio) { bookAudio.pause(); bookAudio.currentTime = 0; }
    } else if (currentLevel === 12) {
        if (hatAudio) { hatAudio.pause(); hatAudio.currentTime = 0; }
        if (canAudio) { canAudio.pause(); canAudio.currentTime = 0; }
        if (headAudio) { headAudio.pause(); headAudio.currentTime = 0; }
    } else if (currentLevel === 13) {
        if (letAudio) { letAudio.pause(); letAudio.currentTime = 0; }
        if (theAudio) { theAudio.pause(); theAudio.currentTime = 0; }
        if (deskAudio) { deskAudio.pause(); deskAudio.currentTime = 0; }
    } else if (currentLevel === 14) {
        if (manAudio) { manAudio.pause(); manAudio.currentTime = 0; }
        if (areAudio) { areAudio.pause(); areAudio.currentTime = 0; }
        if (treeAudio) { treeAudio.pause(); treeAudio.currentTime = 0; }
    } else if (currentLevel === 15) {
        if (nodAudio) { nodAudio.pause(); nodAudio.currentTime = 0; }
        if (carAudio) { carAudio.pause(); carAudio.currentTime = 0; }
        if (feedAudio) { feedAudio.pause(); feedAudio.currentTime = 0; }
    } else if (currentLevel === 16) {
        if (seaAudio) { seaAudio.pause(); seaAudio.currentTime = 0; }
        if (skyAudio) { skyAudio.pause(); skyAudio.currentTime = 0; }
        if (likeAudio) { likeAudio.pause(); likeAudio.currentTime = 0; }
    } else if (currentLevel === 17) {
        if (toyAudio) { toyAudio.pause(); toyAudio.currentTime = 0; }
        if (sadAudio) { sadAudio.pause(); sadAudio.currentTime = 0; }
        if (milkAudio) { milkAudio.pause(); milkAudio.currentTime = 0; }
    } else if (currentLevel === 18) {
        if (USAAudio) { USAAudio.pause(); USAAudio.currentTime = 0; }
        if (henAudio) { henAudio.pause(); henAudio.currentTime = 0; }
        if (kiteAudio) { kiteAudio.pause(); kiteAudio.currentTime = 0; }
    } else if (currentLevel === 19) {
        if (capAudio) { capAudio.pause(); capAudio.currentTime = 0; }
        if (bedAudio) { bedAudio.pause(); bedAudio.currentTime = 0; }
        if (longAudio) { longAudio.pause(); longAudio.currentTime = 0; }
    } else if (currentLevel === 20) {
        if (hopAudio) { hopAudio.pause(); hopAudio.currentTime = 0; }
        if (busAudio) { busAudio.pause(); busAudio.currentTime = 0; }
        if (lookAudio) { lookAudio.pause(); lookAudio.currentTime = 0; }
    } else if (currentLevel === 21) {
        if (fatAudio) { fatAudio.pause(); fatAudio.currentTime = 0; }
        if (pigAudio) { pigAudio.pause(); pigAudio.currentTime = 0; }
        if (riceAudio) { riceAudio.pause(); riceAudio.currentTime = 0; }
    } else if (currentLevel === 22) {
        if (rowAudio) { rowAudio.pause(); rowAudio.currentTime = 0; }
        if (mapAudio) { mapAudio.pause(); mapAudio.currentTime = 0; }
        if (cakeAudio) { cakeAudio.pause(); cakeAudio.currentTime = 0; }
    } else if (currentLevel === 23) {
        if (zooAudio) { zooAudio.pause(); zooAudio.currentTime = 0; }
        if (cupAudio) { cupAudio.pause(); cupAudio.currentTime = 0; }
        if (noseAudio) { noseAudio.pause(); noseAudio.currentTime = 0; }
    } else if (currentLevel === 24) {
        if (cowAudio) { cowAudio.pause(); cowAudio.currentTime = 0; }
        if (dadAudio) { dadAudio.pause(); dadAudio.currentTime = 0; }
        if (manyAudio) { manyAudio.pause(); manyAudio.currentTime = 0; }
    } else if (currentLevel === 25) {
        if (flyAudio) { flyAudio.pause(); flyAudio.currentTime = 0; }
        if (seeAudio) { seeAudio.pause(); seeAudio.currentTime = 0; }
        if (jumpAudio) { jumpAudio.pause(); jumpAudio.currentTime = 0; }
    } else if (currentLevel === 26) {
        if (boxAudio) { boxAudio.pause(); boxAudio.currentTime = 0; }
        if (momAudio) { momAudio.pause(); momAudio.currentTime = 0; }
        if (findAudio) { findAudio.pause(); findAudio.currentTime = 0; }
    } else if (currentLevel === 27) {
        if (mixAudio) { mixAudio.pause(); mixAudio.currentTime = 0; }
        if (tenAudio) { tenAudio.pause(); tenAudio.currentTime = 0; }
        if (haveAudio) { haveAudio.pause(); haveAudio.currentTime = 0; }
    }
    
    // 停止错误音效
    if (wrongAudio) {
        wrongAudio.pause();
        wrongAudio.currentTime = 0;
    }
    
    // 停止火车音效
    if (trainSound) {
        trainSound.pause();
        trainSound.currentTime = 0;
    }
}

/**
 * 开始火车1动画（向右移动离开画面）
 */
function startTrainAnimation() {
    // 停止当前阶段的音频自动播放
    stopAudioTimer();
    // 火车开始移动0.1秒后播放音效
    setTimeout(() => {
        if (trainSound) {
            trainSound.currentTime = 0;
            trainSound.play().catch((err) => {
                console.log('Train sound play failed:', err);
            });
        }
    }, 100);
    trainMoving = true;
    animateTrain();
}

/**
 * 火车1动画循环
 * 火车1向右移动，移动到一半时触发火车2出现
 */
function animateTrain() {
    if (gameState !== 'playing') return;
    if (!trainMoving) return;
    
    trainConfig.x += 9;  // 每帧移动9像素
    
    // 当火车1移动到一半路程时，触发火车2出现
    const halfDistance = (canvas.width + trainConfig.width) / 4;
    if (trainConfig.x >= halfDistance && !train2Entering && !train2Leaving) {
        startTrain2Animation();
    }
    
    // 火车完全移出画面后停止动画
    if (trainConfig.x > canvas.width + trainConfig.width) {
        trainMoving = false;
    }
    
    trainAnimationId = requestAnimationFrame(animateTrain);
}

/**
 * 开始火车2动画（从左侧进入画面）
 */
function startTrain2Animation() {
    train2Entering = true;
    animateTrain2();
}

/**
 * 火车2动画循环（进入阶段）
 * 火车2从左侧进入，移动到目标位置后停止，1秒后播放音频
 */
function animateTrain2() {
    if (gameState !== 'playing') return;
    if (!train2Entering) return;
    
    if (train2Config.x < train2Config.targetX) {
        train2Config.x += 6;  // 每帧移动6像素
        if (train2Config.x >= train2Config.targetX) {
            train2Config.x = train2Config.targetX;
            train2Entering = false;
            // 火车到达后立即切换到阶段2并显示图片
            gamePhase = 2;
            
            zones = phase2Zones;
            correctClicked = 0;
            totalClicked = 0;
            hasWrongSelection = false;
            zones.forEach(z => {
                z.clicked = false;
                z.vanished = false;
            });
            // 初始化阶段2的随机正确区域
            initRandomCorrectZones();
            initPhaseLetters();
            // 停止后1秒播放dog音频
            setTimeout(() => {
                playDogAudio();
            }, 1000);
        }
        train2AnimationId = requestAnimationFrame(animateTrain2);
    }
}

/**
 * 播放阶段2音频（根据关卡播放不同音频）
 * 播放完成后进入阶段2，重置区域状态
 */
function playDogAudio() {
    if (currentLevel === 1 && dogAudio) {
        dogAudio.currentTime = 0;  // 重置播放位置
        dogAudio.play().then(() => {
            dogAudioPlayed = true;
        }).catch((err) => {
            console.log('Dog audio play failed:', err);
        });
        
        dogAudio.onended = () => {
            dogAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 2 && yesAudio) {
        yesAudio.currentTime = 0;  // 重置播放位置
        yesAudio.play().then(() => {
            yesAudioPlayed = true;
        }).catch((err) => {
            console.log('Yes audio play failed:', err);
        });
        
        yesAudio.onended = () => {
            yesAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 3 && oneAudio) {
        oneAudio.currentTime = 0;  // 重置播放位置
        oneAudio.play().then(() => {
            oneAudioPlayed = true;
        }).catch((err) => {
            console.log('One audio play failed:', err);
        });
        
        oneAudio.onended = () => {
            oneAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 4 && twoAudio) {
        twoAudio.currentTime = 0;  // 重置播放位置
        twoAudio.play().then(() => {
            twoAudioPlayed = true;
        }).catch((err) => {
            console.log('Two audio play failed:', err);
        });
        
        twoAudio.onended = () => {
            twoAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 5 && eggAudio) {
        eggAudio.currentTime = 0;  // 重置播放位置
        eggAudio.play().then(() => {
            eggAudioPlayed = true;
        }).catch((err) => {
            console.log('Egg audio play failed:', err);
        });
        
        eggAudio.onended = () => {
            eggAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 6 && armAudio) {
        armAudio.currentTime = 0;  // 重置播放位置
        armAudio.play().then(() => {
            armAudioPlayed = true;
        }).catch((err) => {
            console.log('arm audio play failed:', err);
        });
        
        armAudio.onended = () => {
            armAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 7 && howAudio) {
        howAudio.currentTime = 0;  // 重置播放位置
        howAudio.play().then(() => {
            howAudioPlayed = true;
        }).catch((err) => {
            console.log('how audio play failed:', err);
        });
        
        howAudio.onended = () => {
            howAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 8 && sheAudio) {
        sheAudio.currentTime = 0;  // 重置播放位置
        sheAudio.play().then(() => {
            sheAudioPlayed = true;
        }).catch((err) => {
            console.log('she audio play failed:', err);
        });
        
        sheAudio.onended = () => {
            sheAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 9 && bagAudio) {
        bagAudio.currentTime = 0;  // 重置播放位置
        bagAudio.play().then(() => {
            bagAudioPlayed = true;
        }).catch((err) => {
            console.log('bag audio play failed:', err);
        });
        
        bagAudio.onended = () => {
            bagAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 10 && sitAudio) {
        sitAudio.currentTime = 0;  // 重置播放位置
        sitAudio.play().then(() => {
            sitAudioPlayed = true;
        }).catch((err) => {
            console.log('sit audio play failed:', err);
        });
        
        sitAudio.onended = () => {
            sitAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 11 && oldAudio) {
        oldAudio.currentTime = 0;  // 重置播放位置
        oldAudio.play().then(() => {
            oldAudioPlayed = true;
        }).catch((err) => {
            console.log('old audio play failed:', err);
        });
        
        oldAudio.onended = () => {
            oldAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 12 && canAudio) {
        canAudio.currentTime = 0;  // 重置播放位置
        canAudio.play().then(() => {
            canAudioPlayed = true;
        }).catch((err) => {
            console.log('can audio play failed:', err);
        });
        
        canAudio.onended = () => {
            canAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 13 && theAudio) {
        theAudio.currentTime = 0;  // 重置播放位置
        theAudio.play().then(() => {
            theAudioPlayed = true;
        }).catch((err) => {
            console.log('the audio play failed:', err);
        });
        
        theAudio.onended = () => {
            theAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 14 && areAudio) {
        areAudio.currentTime = 0;  // 重置播放位置
        areAudio.play().then(() => {
            areAudioPlayed = true;
        }).catch((err) => {
            console.log('are audio play failed:', err);
        });
        
        areAudio.onended = () => {
            areAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 15 && carAudio) {
        carAudio.currentTime = 0;  // 重置播放位置
        carAudio.play().then(() => {
            carAudioPlayed = true;
        }).catch((err) => {
            console.log('car audio play failed:', err);
        });
        
        carAudio.onended = () => {
            carAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 16 && skyAudio) {
        skyAudio.currentTime = 0;  // 重置播放位置
        skyAudio.play().then(() => {
            skyAudioPlayed = true;
        }).catch((err) => {
            console.log('sky audio play failed:', err);
        });
        
        skyAudio.onended = () => {
            skyAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 17 && sadAudio) {
        sadAudio.currentTime = 0;  // 重置播放位置
        sadAudio.play().then(() => {
            sadAudioPlayed = true;
        }).catch((err) => {
            console.log('sad audio play failed:', err);
        });
        
        sadAudio.onended = () => {
            sadAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 18 && henAudio) {
        henAudio.currentTime = 0;  // 重置播放位置
        henAudio.play().then(() => {
            henAudioPlayed = true;
        }).catch((err) => {
            console.log('hen audio play failed:', err);
        });
        
        henAudio.onended = () => {
            henAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 19 && bedAudio) {
        bedAudio.currentTime = 0;  // 重置播放位置
        bedAudio.play().then(() => {
            bedAudioPlayed = true;
        }).catch((err) => {
            console.log('bed audio play failed:', err);
        });
        
        bedAudio.onended = () => {
            bedAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 20 && busAudio) {
        busAudio.currentTime = 0;  // 重置播放位置
        busAudio.play().then(() => {
            busAudioPlayed = true;
        }).catch((err) => {
            console.log('bus audio play failed:', err);
        });
        
        busAudio.onended = () => {
            busAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 21 && pigAudio) {
        pigAudio.currentTime = 0;  // 重置播放位置
        pigAudio.play().then(() => {
            pigAudioPlayed = true;
        }).catch((err) => {
            console.log('pig audio play failed:', err);
        });
        
        pigAudio.onended = () => {
            pigAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 22 && mapAudio) {
        mapAudio.currentTime = 0;  // 重置播放位置
        mapAudio.play().then(() => {
            mapAudioPlayed = true;
        }).catch((err) => {
            console.log('map audio play failed:', err);
        });
        
        mapAudio.onended = () => {
            mapAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 23 && cupAudio) {
        cupAudio.currentTime = 0;  // 重置播放位置
        cupAudio.play().then(() => {
            cupAudioPlayed = true;
        }).catch((err) => {
            console.log('cup audio play failed:', err);
        });
        
        cupAudio.onended = () => {
            cupAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 24 && dadAudio) {
        dadAudio.currentTime = 0;  // 重置播放位置
        dadAudio.play().then(() => {
            dadAudioPlayed = true;
        }).catch((err) => {
            console.log('dad audio play failed:', err);
        });
        
        dadAudio.onended = () => {
            dadAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 25 && seeAudio) {
        seeAudio.currentTime = 0;  // 重置播放位置
        seeAudio.play().then(() => {
            seeAudioPlayed = true;
        }).catch((err) => {
            console.log('see audio play failed:', err);
        });
        
        seeAudio.onended = () => {
            seeAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 26 && momAudio) {
        momAudio.currentTime = 0;  // 重置播放位置
        momAudio.play().then(() => {
            momAudioPlayed = true;
        }).catch((err) => {
            console.log('mom audio play failed:', err);
        });
        
        momAudio.onended = () => {
            momAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 27 && tenAudio) {
        tenAudio.currentTime = 0;  // 重置播放位置
        tenAudio.play().then(() => {
            tenAudioPlayed = true;
        }).catch((err) => {
            console.log('ten audio play failed:', err);
        });
        
        tenAudio.onended = () => {
            tenAudioEnded = true;
            startAudioTimer();
        };
    }
}

/**
 * 在火车上绘制字母（按正确顺序显示）
 * @param {array} selectedLetters - 用户选择的字母数组
 * @param {array} correctOrder - 正确的字母顺序
 * @param {number} x - 火车X位置
 * @param {number} y - 火车Y位置
 * @param {number} width - 火车宽度
 * @param {number} height - 火车高度
 * @param {object} config - 字母配置对象（包含scale, offsetX, offsetY, spacing）
 */
function drawTrainLetters(selectedLetters, correctOrder, x, y, width, height, config) {
    if (selectedLetters.length === 0 || !correctOrder) return;
    
    // 使用配置参数，默认值保证兼容性
    const scale = config?.scale ?? 0.3;
    const offsetX = config?.offsetX ?? 0;
    const offsetY = config?.offsetY ?? 0;
    const spacing = config?.spacing ?? 0.8; // 减小间距，让字母更紧凑
    
    // 计算字母大小（基于配置的scale）
    const letterSize = Math.min(width / (correctOrder.length + 1), height * scale);
    const centerY = y + height / 2 + offsetY;
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${letterSize}px "Comic Sans MS", "Chalkboard", "Comic Neue", cursive, sans-serif`;
    ctx.lineWidth = 4;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    
    // 确定显示顺序
    let displayLetters = [];
    
    // 检查是否全部选择了正确字母（没有错误字母且数量相等）
    const allCorrect = selectedLetters.length === correctOrder.length && 
                       selectedLetters.every(letter => correctOrder.includes(letter));
    
    if (allCorrect) {
        // 全部正确：按正确顺序显示
        displayLetters = [...correctOrder];
    } else {
        // 有错误或未选完：按选择顺序显示
        displayLetters = [...selectedLetters];
    }
    
    // 计算起始位置（根据实际显示的字母数量）
    const totalWidth = displayLetters.length * letterSize * spacing;
    const startX = x + (width - totalWidth) / 2 + offsetX;
    
    // 绘制所有字母
    displayLetters.forEach((letter, index) => {
        const letterX = startX + index * letterSize * spacing;
        ctx.strokeText(letter, letterX, centerY);
        ctx.fillText(letter, letterX, centerY);
    });
}

/**
 * 游戏主绘制循环
 * 绘制背景、火车和匹配区域
 */
function draw() {
    if (gameState !== 'playing') return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景图
    if (backgroundImg) {
        ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    }
    
    // 绘制火车1（静止时使用静态图片，向右移动时使用动态图片，向左移动时使用静态图片）
    // 显示条件：火车在画面内或正在向左移动
    if ((trainImg || trainImgStatic) && (trainConfig.x >= -trainConfig.width && trainConfig.x <= canvas.width + trainConfig.width)) {
        // 只有实际移动时使用动态图片，停止时使用静态图片
        const currentTrain1Img = trainMoving ? trainImg : trainImgStatic;
        if (currentTrain1Img) {
            ctx.drawImage(currentTrain1Img, trainConfig.x, trainConfig.y, trainConfig.width, trainConfig.height);
            // 在火车1上绘制字母（根据关卡选择顺序）
            let train1Order;
            if (currentLevel === 1) train1Order = level1Train1Order;
            else if (currentLevel === 2) train1Order = level2Train1Order;
            else if (currentLevel === 3) train1Order = level3Train1Order;
            else if (currentLevel === 4) train1Order = level4Train1Order;
            else if (currentLevel === 5) train1Order = level5Train1Order;
            else if (currentLevel === 6) train1Order = level6Train1Order;
            else if (currentLevel === 7) train1Order = level7Train1Order;
            else if (currentLevel === 8) train1Order = level8Train1Order;
            else if (currentLevel === 9) train1Order = level9Train1Order;
            else if (currentLevel === 10) train1Order = level10Train1Order;
            else if (currentLevel === 11) train1Order = level11Train1Order;
            else if (currentLevel === 12) train1Order = level12Train1Order;
            else if (currentLevel === 13) train1Order = level13Train1Order;
            else if (currentLevel === 14) train1Order = level14Train1Order;
            else if (currentLevel === 15) train1Order = level15Train1Order;
            else if (currentLevel === 16) train1Order = level16Train1Order;
            else if (currentLevel === 17) train1Order = level17Train1Order;
            else if (currentLevel === 18) train1Order = level18Train1Order;
            else if (currentLevel === 19) train1Order = level19Train1Order;
            else if (currentLevel === 20) train1Order = level20Train1Order;
            else if (currentLevel === 21) train1Order = level21Train1Order;
            else if (currentLevel === 22) train1Order = level22Train1Order;
            else if (currentLevel === 23) train1Order = level23Train1Order;
            else if (currentLevel === 24) train1Order = level24Train1Order;
            else if (currentLevel === 25) train1Order = level25Train1Order;
            else if (currentLevel === 26) train1Order = level26Train1Order;
            else train1Order = level27Train1Order;
            drawTrainLetters(train1Letters, train1Order, trainConfig.x, trainConfig.y, trainConfig.width, trainConfig.height, trainLetterConfig.train1);
        }
    }
    
    // 绘制火车2（进入、移动中或已到达目标位置时显示，向右离开时使用动态图片，进入、停止或向左移动时使用静态图片）
    // 显示条件：进入、离开、到达目标位置或向左移动时，且火车在画面内
    if ((train2Img || train2ImgStatic) && (train2Entering || train2Leaving || train2Config.x >= train2Config.targetX || train2MovingLeft) && (train2Config.x >= -train2Config.width && train2Config.x <= canvas.width + train2Config.width)) {
        // 只有向右离开时使用动态图片，进入、停止或向左移动时使用静态图片（无白烟）
        const currentTrain2Img = train2Leaving ? train2Img : train2ImgStatic;
        if (currentTrain2Img) {
            ctx.drawImage(currentTrain2Img, train2Config.x, train2Config.y, train2Config.width, train2Config.height);
            // 在火车2上绘制字母（根据关卡选择顺序）
            let train2Order;
            if (currentLevel === 1) train2Order = level1Train2Order;
            else if (currentLevel === 2) train2Order = level2Train2Order;
            else if (currentLevel === 3) train2Order = level3Train2Order;
            else if (currentLevel === 4) train2Order = level4Train2Order;
            else if (currentLevel === 5) train2Order = level5Train2Order;
            else if (currentLevel === 6) train2Order = level6Train2Order;
            else if (currentLevel === 7) train2Order = level7Train2Order;
            else if (currentLevel === 8) train2Order = level8Train2Order;
            else if (currentLevel === 9) train2Order = level9Train2Order;
            else if (currentLevel === 10) train2Order = level10Train2Order;
            else if (currentLevel === 11) train2Order = level11Train2Order;
            else if (currentLevel === 12) train2Order = level12Train2Order;
            else if (currentLevel === 13) train2Order = level13Train2Order;
            else if (currentLevel === 14) train2Order = level14Train2Order;
            else if (currentLevel === 15) train2Order = level15Train2Order;
            else if (currentLevel === 16) train2Order = level16Train2Order;
            else if (currentLevel === 17) train2Order = level17Train2Order;
            else if (currentLevel === 18) train2Order = level18Train2Order;
            else if (currentLevel === 19) train2Order = level19Train2Order;
            else if (currentLevel === 20) train2Order = level20Train2Order;
            else if (currentLevel === 21) train2Order = level21Train2Order;
            else if (currentLevel === 22) train2Order = level22Train2Order;
            else if (currentLevel === 23) train2Order = level23Train2Order;
            else if (currentLevel === 24) train2Order = level24Train2Order;
            else if (currentLevel === 25) train2Order = level25Train2Order;
            else if (currentLevel === 26) train2Order = level26Train2Order;
            else train2Order = level27Train2Order;
            drawTrainLetters(train2Letters, train2Order, train2Config.x, train2Config.y, train2Config.width, train2Config.height, trainLetterConfig.train2);
        }
    }
    
    // 绘制火车3（进入、移动中或已到达目标位置时显示，向右离开时使用动态图片，进入、停止或向左移动时使用静态图片）
    // 显示条件：进入、离开、到达目标位置或向左移动时，且火车在画面内
    if ((train3Img || train3ImgStatic) && (train3Entering || train3Leaving || train3Config.x >= train3Config.targetX || train3MovingLeft) && (train3Config.x >= -train3Config.width && train3Config.x <= canvas.width + train3Config.width)) {
        // 只有向右离开时使用动态图片，进入、停止或向左移动时使用静态图片（无白烟）
        const currentTrain3Img = train3Leaving ? train3Img : train3ImgStatic;
        if (currentTrain3Img) {
            ctx.drawImage(currentTrain3Img, train3Config.x, train3Config.y, train3Config.width, train3Config.height);
            // 在火车3上绘制字母（根据关卡选择顺序）
            let train3Order;
            if (currentLevel === 1) train3Order = level1Train3Order;
            else if (currentLevel === 2) train3Order = level2Train3Order;
            else if (currentLevel === 3) train3Order = level3Train3Order;
            else if (currentLevel === 4) train3Order = level4Train3Order;
            else if (currentLevel === 5) train3Order = level5Train3Order;
            else if (currentLevel === 6) train3Order = level6Train3Order;
            else if (currentLevel === 7) train3Order = level7Train3Order;
            else if (currentLevel === 8) train3Order = level8Train3Order;
            else if (currentLevel === 9) train3Order = level9Train3Order;
            else if (currentLevel === 10) train3Order = level10Train3Order;
            else if (currentLevel === 11) train3Order = level11Train3Order;
            else if (currentLevel === 12) train3Order = level12Train3Order;
            else if (currentLevel === 13) train3Order = level13Train3Order;
            else if (currentLevel === 14) train3Order = level14Train3Order;
            else if (currentLevel === 15) train3Order = level15Train3Order;
            else if (currentLevel === 16) train3Order = level16Train3Order;
            else if (currentLevel === 17) train3Order = level17Train3Order;
            else if (currentLevel === 18) train3Order = level18Train3Order;
            else if (currentLevel === 19) train3Order = level19Train3Order;
            else if (currentLevel === 20) train3Order = level20Train3Order;
            else if (currentLevel === 21) train3Order = level21Train3Order;
            else if (currentLevel === 22) train3Order = level22Train3Order;
            else if (currentLevel === 23) train3Order = level23Train3Order;
            else if (currentLevel === 24) train3Order = level24Train3Order;
            else if (currentLevel === 25) train3Order = level25Train3Order;
            else if (currentLevel === 26) train3Order = level26Train3Order;
            else train3Order = level27Train3Order;
            drawTrainLetters(train3Letters, train3Order, train3Config.x, train3Config.y, train3Config.width, train3Config.height, trainLetterConfig.train3);
        }
    }
    
    // 绘制黑烟效果1（错误选择时显示在当前阶段火车上方）
    if (showBlackSmoke && smokeTrainIndex > 0 && blackSmokeImg && blackSmokeImg.complete) {
        let smokeX, smokeY;
        const smokeWidth = 300;
        const smokeHeight = 200;
        
        if (smokeTrainIndex === 1) {
            smokeX = trainConfig.x + trainConfig.width * 0.85 - 145;
            smokeY = trainConfig.y - smokeHeight * 0.4 + 50;//加为向下移动
        } else if (smokeTrainIndex === 2) {
            smokeX = train2Config.x + train2Config.width * 0.85 - 145;
            smokeY = train2Config.y - smokeHeight * 0.4 + 16;
        } else if (smokeTrainIndex === 3) {
            smokeX = train3Config.x + train3Config.width * 0.85 - 145;
            smokeY = train3Config.y - smokeHeight * 0.4 +2;
        }
        
        ctx.drawImage(blackSmokeImg, smokeX, smokeY, smokeWidth, smokeHeight);
    }
    
    // 绘制黑烟效果2（火车向左移动时显示在火车上，火车消失后继续跟随移动）
    if (showBlackSmoke2 && smokeTrainIndex > 0 && blackSmokeImg2 && blackSmokeImg2.complete) {
        let smokeX, smokeY;
        const smokeWidth = 300;
        const smokeHeight = 200;
        
        if (smokeTrainIndex === 1) {
            // 在火车1上方显示（向左移动时）
            if (train1MovingLeft) {
                smokeX = trainConfig.x + trainConfig.width * 0.5 + 150;
                smoke2X = smokeX; // 记录位置用于火车消失后继续移动
            } else {
                // 火车已消失，继续向左移动黑烟
                smoke2X -= 8;
                smokeX = smoke2X;
            }
            smokeY = trainConfig.y - smokeHeight * 0.5 + 72;
        } else if (smokeTrainIndex === 2) {
            // 在火车2上方显示（向左移动时）
            if (train2MovingLeft) {
                smokeX = train2Config.x + train2Config.width * 0.5 + 120;
                smoke2X = smokeX;
            } else {
                smoke2X -= 8;
                smokeX = smoke2X;
            }
            smokeY = train2Config.y - smokeHeight * 0.5 + 39;
        } else if (smokeTrainIndex === 3) {
            // 在火车3上方显示（向左移动时）
            if (train3MovingLeft) {
                smokeX = train3Config.x + train3Config.width * 0.5 + 100;
                smoke2X = smokeX;
            } else {
                smoke2X -= 8;
                smokeX = smoke2X;
            }
            smokeY = train3Config.y - smokeHeight * 0.5 + 24;
        }
        
        // 检查黑烟是否已经离开画面
        if (smokeX !== undefined && smokeY !== undefined) {
            if (smokeX > -smokeWidth) {
                ctx.drawImage(blackSmokeImg2, smokeX, smokeY, smokeWidth, smokeHeight);
            }
        }
    }
    
    // 绘制绿色正确单词（错误选择时在火车字母上方显示，固定位置不随火车移动）
    if (showCorrectWord && correctWordFlash) {
        const trainCfg = getCurrentTrainConfig();
        const letterCfg = getCurrentLetterConfig();
        const correctOrder = getCurrentTrainOrder();
        const correctWord = getCorrectWord();
        
        if (trainCfg && letterCfg && correctOrder && correctWord) {
            const scale = letterCfg.scale ?? 0.3;
            const offsetX = letterCfg.offsetX ?? 0;
            const offsetY = letterCfg.offsetY ?? 0;
            const spacing = letterCfg.spacing ?? 0.8;
            
            // 计算字母大小
            const letterSize = Math.min(trainCfg.width / (correctOrder.length + 1), trainCfg.height * scale);
            const correctLetterSize = letterSize * 0.85;  // 稍小一点
            
            // 使用固定位置（correctWordFixedX/Y 在出现时已捕获）
            const correctTotalWidth = correctWord.length * correctLetterSize * spacing;
            const correctStartX = correctWordFixedX + (trainCfg.width - correctTotalWidth) / 2 + offsetX-30;
            const correctWordY = correctWordFixedY + trainCfg.height / 2 + offsetY - letterSize * 1.1+25;
            
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${correctLetterSize}px "Comic Sans MS", "Chalkboard", "Comic Neue", cursive, sans-serif`;
            ctx.lineWidth = 4;
            
            // 绘制每个正确字母
            for (let i = 0; i < correctWord.length; i++) {
                const letterX = correctStartX + i * correctLetterSize * spacing + correctLetterSize / 2;
                // 绿色描边
                ctx.strokeStyle = '#006400';  // 深绿色描边
                ctx.strokeText(correctWord[i], letterX, correctWordY);
                // 绿色填充
                ctx.fillStyle = '#00FF00';  // 亮绿色填充
                ctx.fillText(correctWord[i], letterX, correctWordY);
            }
        }
    }
    
    // 绘制匹配区域
    zones.forEach(zone => {
        // 检查当前阶段的火车是否已到达目标位置
        let trainArrived = true;
        if (gamePhase === 2) {
            trainArrived = (train2Config.x >= train2Config.targetX);
        } else if (gamePhase === 3) {
            trainArrived = (train3Config.x >= train3Config.targetX);
        }
        
        // 如果火车未到达目标位置，不绘制区域
        if (!trainArrived) {
            return;
        }
        
        const correct = isZoneCorrect(zone);
        // 根据当前阶段获取对应的尺寸配置
        let size = phase1ZoneSize;  // 默认使用阶段1尺寸
        if (gamePhase === 2) {
            size = phase2ZoneSize;
        } else if (gamePhase === 3) {
            size = phase3ZoneSize;
        }
        
        // 计算晃动偏移量
        let shakeOffset = 0;
        if (zone.shaking) {
            // 更新晃动动画
            zone.shakeOffset += 8 * zone.shakeDirection;
            shakeOffset = zone.shakeOffset;
            
            // 控制晃动幅度和次数
            if (Math.abs(zone.shakeOffset) >= 20) {
                zone.shakeDirection *= -1;
                zone.shakeCount++;
                
                // 晃动一定次数后停止晃动
                if (zone.shakeCount >= 6) {
                    zone.shaking = false;
                    zone.vanished = true;
                }
            }
        }
        
        // 如果区域已消失，跳过绘制
        if (zone.vanished) {
            return;
        }
        
        // 如果下一阶段的火车正在进入，不显示当前阶段的区域图片
        if ((train2Entering && gamePhase === 1) || (train3Entering && gamePhase === 2)) {
            return;
        }
        
        // 显示对应阶段的区域图片（正确选择后不显示图片）
        if (!zone.clicked || !correct) {
            let currentZoneImg = null;
            if (gamePhase === 1 && zoneImg) {
                currentZoneImg = zoneImg;
            } else if (gamePhase === 2 && zoneImg2) {
                currentZoneImg = zoneImg2;
            } else if (gamePhase === 3 && zoneImg3) {
                currentZoneImg = zoneImg3;
            }
            
            if (currentZoneImg) {
                // 错误选择时图片和字母一起晃动
                ctx.drawImage(currentZoneImg, zone.x + shakeOffset, zone.y, size.width, size.height);
            }
        } else {
            // 正确选择：显示绿色覆盖层
            ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            ctx.fillRect(zone.x, zone.y, size.width, size.height);
        }
        
        // 绘制字母在图片中间
        if (zone.letter) {
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;
            ctx.font = `bold ${Math.min(size.width, size.height) / 2}px "Comic Sans MS", "Chalkboard", "Comic Neue", cursive, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 先绘制描边
            ctx.strokeText(zone.letter, zone.x + shakeOffset + size.width / 2, zone.y + size.height / 2);
            // 再绘制填充
            ctx.fillText(zone.letter, zone.x + shakeOffset + size.width / 2, zone.y + size.height / 2);
        }
    });
    
    requestAnimationFrame(draw);
}

/**
 * 根据点击位置获取对应的匹配区域
 * @param {number} x - 点击的X坐标（屏幕坐标）
 * @param {number} y - 点击的Y坐标（屏幕坐标）
 * @returns {object|null} - 匹配的区域对象，未找到返回null
 */
function getZoneAtPosition(x, y) {
    // 计算缩放比例（适配不同屏幕尺寸）
    const scaleX = canvas.width / window.innerWidth;
    const scaleY = canvas.height / window.innerHeight;
    
    // 转换为Canvas坐标
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    // 遍历所有区域，查找点击位置是否在区域内
    for (let zone of zones) {
        if (zone.clicked) continue;  // 跳过已点击的区域
        
        // 根据当前阶段获取对应的尺寸配置
        let size = phase1ZoneSize;
        if (gamePhase === 2) {
            size = phase2ZoneSize;
        } else if (gamePhase === 3) {
            size = phase3ZoneSize;
        }
        
        // 所有区域都使用矩形点击检测
        if (canvasX >= zone.x && canvasX <= zone.x + size.width &&
            canvasY >= zone.y && canvasY <= zone.y + size.height) {
            return zone;
        }
    }
    return null;
}

/**
 * 处理用户点击事件
 * @param {number} x - 点击的X坐标
 * @param {number} y - 点击的Y坐标
 */
function handleClick(x, y) {
    if (gameState !== 'playing') return;
    
    // 检查是否禁止点击（错误选择后）
    if (disableClick) return;
    
    // 根据当前阶段检查音频是否播放完成
    if (gamePhase === 1 && !audioEnded) return;
    // 第二阶段：根据当前关卡检查对应的音频结束状态
    if (gamePhase === 2) {
        if (currentLevel === 1 && !dogAudioEnded) return;
        if (currentLevel === 2 && !yesAudioEnded) return;
        if (currentLevel === 3 && !oneAudioEnded) return;
        if (currentLevel === 4 && !twoAudioEnded) return;
    }
    // 第三阶段：根据当前关卡检查对应的音频结束状态
    if (gamePhase === 3) {
        if (currentLevel === 1 && !birdAudioEnded) return;
        if (currentLevel === 2 && !fourAudioEnded) return;
        if (currentLevel === 3 && !fiveAudioEnded) return;
        if (currentLevel === 4 && !blueAudioEnded) return;
    }
    
    // 获取点击的区域
    const zone = getZoneAtPosition(x, y);
    if (!zone) return;

    // 只有真正选择过选项的阶段才计入学习报告
    const selectedPhaseKey = `${currentLevel}-${gamePhase}`;
    if (!playedPhases.includes(selectedPhaseKey)) {
        playedPhases.push(selectedPhaseKey);
    }
    
    zone.clicked = true;
    
    // 判断当前阶段该区域是否正确
    const correct = isZoneCorrect(zone);
    
    if (correct) {
        // 正确选择：图片直接消失
        zone.vanished = true;
        correctClicked++;
        totalClicked++;
        
        // 将正确字母添加到对应火车上（允许重复字母）
        if (gamePhase === 1) {
            train1Letters.push(zone.letter);
        } else if (gamePhase === 2) {
            train2Letters.push(zone.letter);
        } else if (gamePhase === 3) {
            train3Letters.push(zone.letter);
        }
        
        // 如果有错误选择，检查是否已选完所需数量，触发错误完成逻辑
        if (hasWrongSelection) {
            let correctZoneCount = 0;
            if (gamePhase === 1) {
                correctZoneCount = phase1CorrectZones.length;
            } else if (gamePhase === 2) {
                correctZoneCount = phase2CorrectZones.length;
            } else if (gamePhase === 3) {
                correctZoneCount = phase3CorrectZones.length;
            }
            
            if (totalClicked >= correctZoneCount) {
                // 禁止点击其他区域
                disableClick = true;
                
                // 停止当前阶段的音频自动播放
                stopAudioTimer();
                
                // 让所有区域消失
                zones.forEach(z => {
                    z.vanished = true;
                });
                
                // 先播放错误音效，播放完后再显示绿色正确单词
                const currentPhase = gamePhase;
                if (wrongAudio) {
                    wrongAudio.currentTime = 0;
                    wrongAudio.play().then(() => {
                        wrongAudio.onended = () => {
                            showCorrectWordAndSchedule(currentPhase);
                        };
                    }).catch((err) => {
                        // 播放失败时直接显示正确单词
                        console.log('Wrong audio play failed:', err);
                        showCorrectWordAndSchedule(currentPhase);
                    });
                } else {
                    showCorrectWordAndSchedule(currentPhase);
                }
            }
            return; // 有错误选择时不继续执行正确完成逻辑
        }
        
        // 根据当前阶段处理完成逻辑（只有没有错误选择时才进入正确完成逻辑）
        if (gamePhase === 1 && correctClicked >= phase1CorrectZones.length) {
            // 阶段1完成：设置火车1准备离开状态（切换到带烟雾的图片）
            train1ReadyToLeave = true;
            score++;  // 完成阶段1得1分
            // 记录掌握的单词
            const level1Word = allWords[`level${currentLevel}`][0];
            if (!masteredWords.includes(level1Word)) {
                masteredWords.push(level1Word);
                totalMastered++;
            }
            // 让所有错误区域消失，先播放音频，播放完再启动火车离开动画
            zones.forEach(z => {
                if (!isZoneCorrect(z)) {
                    z.vanished = true;
                }
            });
            // 根据关卡播放音频，播放完成后启动火车离开动画
            if (currentLevel === 1) {
                catAudio.onended = () => {
                    startTrainAnimation();
                    catAudio.onended = null;
                };
                catAudio.currentTime = 0;
                catAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 2) {
                redAudio.onended = () => {
                    startTrainAnimation();
                    redAudio.onended = null;
                };
                redAudio.currentTime = 0;
                redAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 3) {
                sixAudio.onended = () => {
                    startTrainAnimation();
                    sixAudio.onended = null;
                };
                sixAudio.currentTime = 0;
                sixAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 4) {
                cutAudio.onended = () => {
                    startTrainAnimation();
                    cutAudio.onended = null;
                };
                cutAudio.currentTime = 0;
                cutAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 5) {
                eatAudio.onended = () => {
                    startTrainAnimation();
                    eatAudio.onended = null;
                };
                eatAudio.currentTime = 0;
                eatAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 6) {
                bigAudio.onended = () => {
                    startTrainAnimation();
                    bigAudio.onended = null;
                };
                bigAudio.currentTime = 0;
                bigAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 7) {
                whoAudio.onended = () => {
                    startTrainAnimation();
                    whoAudio.onended = null;
                };
                whoAudio.currentTime = 0;
                whoAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 8) {
                sunAudio.onended = () => {
                    startTrainAnimation();
                    sunAudio.onended = null;
                };
                sunAudio.currentTime = 0;
                sunAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 9) {
                runAudio.onended = () => {
                    startTrainAnimation();
                    runAudio.onended = null;
                };
                runAudio.currentTime = 0;
                runAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 10) {
                legAudio.onended = () => {
                    startTrainAnimation();
                    legAudio.onended = null;
                };
                legAudio.currentTime = 0;
                legAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 11) {
                penAudio.onended = () => {
                    startTrainAnimation();
                    penAudio.onended = null;
                };
                penAudio.currentTime = 0;
                penAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 12) {
                hatAudio.onended = () => {
                    startTrainAnimation();
                    hatAudio.onended = null;
                };
                hatAudio.currentTime = 0;
                hatAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 13) {
                letAudio.onended = () => {
                    startTrainAnimation();
                    letAudio.onended = null;
                };
                letAudio.currentTime = 0;
                letAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 14) {
                manAudio.onended = () => {
                    startTrainAnimation();
                    manAudio.onended = null;
                };
                manAudio.currentTime = 0;
                manAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 15) {
                nodAudio.onended = () => {
                    startTrainAnimation();
                    nodAudio.onended = null;
                };
                nodAudio.currentTime = 0;
                nodAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 16) {
                seaAudio.onended = () => {
                    startTrainAnimation();
                    seaAudio.onended = null;
                };
                seaAudio.currentTime = 0;
                seaAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 17) {
                toyAudio.onended = () => {
                    startTrainAnimation();
                    toyAudio.onended = null;
                };
                toyAudio.currentTime = 0;
                toyAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 18) {
                USAAudio.onended = () => {
                    startTrainAnimation();
                    USAAudio.onended = null;
                };
                USAAudio.currentTime = 0;
                USAAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 19) {
                capAudio.onended = () => {
                    startTrainAnimation();
                    capAudio.onended = null;
                };
                capAudio.currentTime = 0;
                capAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 20) {
                hopAudio.onended = () => {
                    startTrainAnimation();
                    hopAudio.onended = null;
                };
                hopAudio.currentTime = 0;
                hopAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 21) {
                fatAudio.onended = () => {
                    startTrainAnimation();
                    fatAudio.onended = null;
                };
                fatAudio.currentTime = 0;
                fatAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 22) {
                rowAudio.onended = () => {
                    startTrainAnimation();
                    rowAudio.onended = null;
                };
                rowAudio.currentTime = 0;
                rowAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 23) {
                zooAudio.onended = () => {
                    startTrainAnimation();
                    zooAudio.onended = null;
                };
                zooAudio.currentTime = 0;
                zooAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 24) {
                cowAudio.onended = () => {
                    startTrainAnimation();
                    cowAudio.onended = null;
                };
                cowAudio.currentTime = 0;
                cowAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 25) {
                flyAudio.onended = () => {
                    startTrainAnimation();
                    flyAudio.onended = null;
                };
                flyAudio.currentTime = 0;
                flyAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 26) {
                boxAudio.onended = () => {
                    startTrainAnimation();
                    boxAudio.onended = null;
                };
                boxAudio.currentTime = 0;
                boxAudio.play().catch(() => {
                    startTrainAnimation();
                });
            } else if (currentLevel === 27) {
                mixAudio.onended = () => {
                    startTrainAnimation();
                    mixAudio.onended = null;
                };
                mixAudio.currentTime = 0;
                mixAudio.play().catch(() => {
                    startTrainAnimation();
                });
            }
        } else if (gamePhase === 2 && correctClicked >= phase2CorrectZones.length) {
            // 阶段2完成：设置火车2准备离开状态（切换到带烟雾的图片）
            train2ReadyToLeave = true;
            score++;  // 完成阶段2得1分
            // 记录掌握的单词
            const level2Word = allWords[`level${currentLevel}`][1];
            if (!masteredWords.includes(level2Word)) {
                masteredWords.push(level2Word);
                totalMastered++;
            }
            // 让所有错误区域消失，先播放音频，播放完再启动火车离开动画
            zones.forEach(z => {
                if (!isZoneCorrect(z)) {
                    z.vanished = true;
                }
            });
            // 根据关卡播放音频，播放完成后启动火车离开动画
            if (currentLevel === 1) {
                dogAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    dogAudio.onended = null;
                };
                dogAudio.currentTime = 0;
                dogAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 2) {
                yesAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    yesAudio.onended = null;
                };
                yesAudio.currentTime = 0;
                yesAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 3) {
                oneAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    oneAudio.onended = null;
                };
                oneAudio.currentTime = 0;
                oneAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 4) {
                twoAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    twoAudio.onended = null;
                };
                twoAudio.currentTime = 0;
                twoAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 5) {
                eggAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    eggAudio.onended = null;
                };
                eggAudio.currentTime = 0;
                eggAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 6) {
                armAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    armAudio.onended = null;
                };
                armAudio.currentTime = 0;
                armAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 7) {
                howAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    howAudio.onended = null;
                };
                howAudio.currentTime = 0;
                howAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 8) {
                sheAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    sheAudio.onended = null;
                };
                sheAudio.currentTime = 0;
                sheAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 9) {
                bagAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    bagAudio.onended = null;
                };
                bagAudio.currentTime = 0;
                bagAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 10) {
                sitAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    sitAudio.onended = null;
                };
                sitAudio.currentTime = 0;
                sitAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 11) {
                oldAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    oldAudio.onended = null;
                };
                oldAudio.currentTime = 0;
                oldAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 12) {
                canAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    canAudio.onended = null;
                };
                canAudio.currentTime = 0;
                canAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 13) {
                theAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    theAudio.onended = null;
                };
                theAudio.currentTime = 0;
                theAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 14) {
                areAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    areAudio.onended = null;
                };
                areAudio.currentTime = 0;
                areAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 15) {
                carAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    carAudio.onended = null;
                };
                carAudio.currentTime = 0;
                carAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 16) {
                skyAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    skyAudio.onended = null;
                };
                skyAudio.currentTime = 0;
                skyAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 17) {
                sadAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    sadAudio.onended = null;
                };
                sadAudio.currentTime = 0;
                sadAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 18) {
                henAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    henAudio.onended = null;
                };
                henAudio.currentTime = 0;
                henAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 19) {
                bedAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    bedAudio.onended = null;
                };
                bedAudio.currentTime = 0;
                bedAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 20) {
                busAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    busAudio.onended = null;
                };
                busAudio.currentTime = 0;
                busAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 21) {
                pigAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    pigAudio.onended = null;
                };
                pigAudio.currentTime = 0;
                pigAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 22) {
                mapAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    mapAudio.onended = null;
                };
                mapAudio.currentTime = 0;
                mapAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 23) {
                cupAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    cupAudio.onended = null;
                };
                cupAudio.currentTime = 0;
                cupAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 24) {
                dadAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    dadAudio.onended = null;
                };
                dadAudio.currentTime = 0;
                dadAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 25) {
                seeAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    seeAudio.onended = null;
                };
                seeAudio.currentTime = 0;
                seeAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 26) {
                momAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    momAudio.onended = null;
                };
                momAudio.currentTime = 0;
                momAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            } else if (currentLevel === 27) {
                tenAudio.onended = () => {
                    startTrain2LeaveAnimation();
                    tenAudio.onended = null;
                };
                tenAudio.currentTime = 0;
                tenAudio.play().catch(() => {
                    startTrain2LeaveAnimation();
                });
            }
        } else if (gamePhase === 3 && correctClicked >= phase3CorrectZones.length) {
            // 阶段3完成：设置火车3准备离开状态（切换到带烟雾的图片）
            train3ReadyToLeave = true;
            score++;  // 完成阶段3得1分
            // 记录掌握的单词
            const level3Word = allWords[`level${currentLevel}`][2];
            if (!masteredWords.includes(level3Word)) {
                masteredWords.push(level3Word);
                totalMastered++;
            }
            // 记录游戏用时（选择完正确答案时立即记录）
            if (gameTimeRecorded === null) {
                gameTimeRecorded = 60 - timeLeft;
            }
            // 让所有错误区域消失，先播放音频，播放完再启动火车离开动画
            zones.forEach(z => {
                if (!isZoneCorrect(z)) {
                    z.vanished = true;
                }
            });
            // 根据关卡播放音频，播放完成后启动火车离开动画
            if (currentLevel === 1) {
                birdAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    birdAudio.onended = null;
                };
                birdAudio.currentTime = 0;
                birdAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 2) {
                fourAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    fourAudio.onended = null;
                };
                fourAudio.currentTime = 0;
                fourAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 3) {
                fiveAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    fiveAudio.onended = null;
                };
                fiveAudio.currentTime = 0;
                fiveAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 4) {
                blueAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    blueAudio.onended = null;
                };
                blueAudio.currentTime = 0;
                blueAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 5) {
                pearAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    pearAudio.onended = null;
                };
                pearAudio.currentTime = 0;
                pearAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 6) {
                handAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    handAudio.onended = null;
                };
                handAudio.currentTime = 0;
                handAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 7) {
                footAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    footAudio.onended = null;
                };
                footAudio.currentTime = 0;
                footAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 8) {
                moonAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    moonAudio.onended = null;
                };
                moonAudio.currentTime = 0;
                moonAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 9) {
                loveAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    loveAudio.onended = null;
                };
                loveAudio.currentTime = 0;
                loveAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 10) {
                faceAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    faceAudio.onended = null;
                };
                faceAudio.currentTime = 0;
                faceAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 11) {
                bookAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    bookAudio.onended = null;
                };
                bookAudio.currentTime = 0;
                bookAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 12) {
                headAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    headAudio.onended = null;
                };
                headAudio.currentTime = 0;
                headAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 13) {
                deskAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    deskAudio.onended = null;
                };
                deskAudio.currentTime = 0;
                deskAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 14) {
                treeAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    treeAudio.onended = null;
                };
                treeAudio.currentTime = 0;
                treeAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 15) {
                feedAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    feedAudio.onended = null;
                };
                feedAudio.currentTime = 0;
                feedAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 16) {
                likeAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    likeAudio.onended = null;
                };
                likeAudio.currentTime = 0;
                likeAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 17) {
                milkAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    milkAudio.onended = null;
                };
                milkAudio.currentTime = 0;
                milkAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 18) {
                kiteAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    kiteAudio.onended = null;
                };
                kiteAudio.currentTime = 0;
                kiteAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 19) {
                longAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    longAudio.onended = null;
                };
                longAudio.currentTime = 0;
                longAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 20) {
                lookAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    lookAudio.onended = null;
                };
                lookAudio.currentTime = 0;
                lookAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 21) {
                riceAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    riceAudio.onended = null;
                };
                riceAudio.currentTime = 0;
                riceAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 22) {
                cakeAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    cakeAudio.onended = null;
                };
                cakeAudio.currentTime = 0;
                cakeAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 23) {
                noseAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    noseAudio.onended = null;
                };
                noseAudio.currentTime = 0;
                noseAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 24) {
                manyAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    manyAudio.onended = null;
                };
                manyAudio.currentTime = 0;
                manyAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 25) {
                jumpAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    jumpAudio.onended = null;
                };
                jumpAudio.currentTime = 0;
                jumpAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 26) {
                findAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    findAudio.onended = null;
                };
                findAudio.currentTime = 0;
                findAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            } else if (currentLevel === 27) {
                haveAudio.onended = () => {
                    startTrain3LeaveAnimation();
                    haveAudio.onended = null;
                };
                haveAudio.currentTime = 0;
                haveAudio.play().catch(() => {
                    startTrain3LeaveAnimation();
                });
            }
        }
    } else {
        // 错误选择：开始晃动动画
        zone.shaking = true;      // 标记开始晃动
        zone.shakeOffset = 0;     // 晃动偏移量
        zone.shakeDirection = 1;  // 晃动方向
        zone.shakeCount = 0;      // 晃动次数计数
        
        // 停止当前阶段的音频自动播放
        stopAudioTimer();
        
        // 标记有错误选择
        hasWrongSelection = true;
        
        // 将错误字母添加到对应火车上（允许重复字母）
        if (gamePhase === 1) {
            train1Letters.push(zone.letter);
        } else if (gamePhase === 2) {
            train2Letters.push(zone.letter);
        } else if (gamePhase === 3) {
            train3Letters.push(zone.letter);
        }
        
        // 增加已选择区域计数
        totalClicked++;
        
        // 检查是否已选完该阶段所需的正确区域数量
        let correctZoneCount = 0;
        if (gamePhase === 1) {
            correctZoneCount = phase1CorrectZones.length;
        } else if (gamePhase === 2) {
            correctZoneCount = phase2CorrectZones.length;
        } else if (gamePhase === 3) {
            correctZoneCount = phase3CorrectZones.length;
        }
        
        // 如果已选完所需数量，让所有区域消失，然后显示正确单词
        if (totalClicked >= correctZoneCount) {
            // 禁止点击其他区域
            disableClick = true;
            
            // 让所有区域消失
            zones.forEach(z => {
                z.vanished = true;
            });
            
            // 先播放错误音效，播放完后再显示绿色正确单词
            const currentPhase = gamePhase;
            if (wrongAudio) {
                wrongAudio.currentTime = 0;
                wrongAudio.play().then(() => {
                    wrongAudio.onended = () => {
                        showCorrectWordAndSchedule(currentPhase);
                    };
                }).catch((err) => {
                    // 播放失败时直接显示正确单词
                    console.log('Wrong audio play failed:', err);
                    showCorrectWordAndSchedule(currentPhase);
                });
            } else {
                showCorrectWordAndSchedule(currentPhase);
            }
        }
    }
}

/**
 * 开始火车1向左移动动画（错误选择时）
 */
function startTrain1MoveLeft() {
    train1MovingLeft = true;
    animateTrain1MoveLeft();
}

/**
 * 火车1向左移动动画循环
 */
function animateTrain1MoveLeft() {
    if (gameState !== 'playing') return;
    if (!train1MovingLeft) return;
    
    // 火车向左移动
    trainConfig.x -= 8;
    
    // 检查是否已经离开画面
    if (trainConfig.x < -trainConfig.width) {
        train1MovingLeft = false;
        showCorrectWord = false;  // 隐藏正确单词
        
        // 如果答错次数达到5次，直接进入成绩报告界面
        if (wrongCount >= 5) {
            // 等待黑烟完全消失后进入成绩报告界面
            waitForSmokeToDisappear();
            return;
        }
        
        // 重置火车1位置，开始下一个阶段
        trainConfig.x = -600;
        train2Entering = true;
        startTrain2Animation();
        
        // 重置当前阶段的选择状态
        resetPhase();
        
        return;
    }
    
    requestAnimationFrame(animateTrain1MoveLeft);
}

/**
 * 开始火车2向左移动动画（错误选择时）
 */
function startTrain2MoveLeft() {
    train2MovingLeft = true;
    animateTrain2MoveLeft();
}

/**
 * 火车2向左移动动画循环
 */
function animateTrain2MoveLeft() {
    if (gameState !== 'playing') return;
    if (!train2MovingLeft) return;
    
    // 火车向左移动
    train2Config.x -= 8;
    
    // 检查是否已经离开画面
    if (train2Config.x < -train2Config.width) {
        train2MovingLeft = false;
        showCorrectWord = false;  // 隐藏正确单词
        
        // 如果答错次数达到5次，直接进入成绩报告界面
        if (wrongCount >= 5) {
            // 等待黑烟完全消失后进入成绩报告界面
            waitForSmokeToDisappear();
            return;
        }
        
        // 重置火车2位置，开始下一个阶段
        train2Config.x = -600;
        train3Entering = true;
        startTrain3Animation();
        
        // 重置当前阶段的选择状态
        resetPhase();
        
        return;
    }
    
    requestAnimationFrame(animateTrain2MoveLeft);
}

/**
 * 开始火车3向左移动动画（错误选择时）
 */
function startTrain3MoveLeft() {
    train3MovingLeft = true;
    animateTrain3MoveLeft();
}

/**
 * 火车3向左移动动画循环
 */
function animateTrain3MoveLeft() {
    if (gameState !== 'playing') return;
    if (!train3MovingLeft) return;
    
    // 火车向左移动
    train3Config.x -= 8;
    
    // 检查是否已经离开画面
    if (train3Config.x < -train3Config.width) {
        train3MovingLeft = false;
        showCorrectWord = false;  // 隐藏正确单词
        
        // 重置火车3位置
        train3Config.x = -500;
        
        // 等待黑烟完全消失后再进入结算界面
        waitForSmokeToDisappear();
        
        return;
    }
    
    requestAnimationFrame(animateTrain3MoveLeft);
}

/**
 * 等待黑烟完全消失后进入结算界面或成绩报告界面
 */
function waitForSmokeToDisappear() {
    // 设置最大等待时间为3秒，防止卡住
    const maxWaitTime = 3000;
    const startTime = Date.now();
    
    function checkAndWait() {
        const elapsed = Date.now() - startTime;
        
        // 如果超过最大等待时间，强制进入对应界面
        if (elapsed >= maxWaitTime || smoke2X <= -300) {
            // 黑烟已经消失或超时
            showBlackSmoke2 = false;
            smokeTrainIndex = 0;
            
            // 如果答错次数达到5次，直接进入成绩报告界面
            if (wrongCount >= 5) {
                displayReport({ naturalEnd: true });
            } else {
                // 进入结算界面
                if (score >= 9) {
                    endGame('win');
                } else {
                    endGame('lose');
                }
            }
            return;
        }
        
        // 继续更新黑烟位置
        smoke2X -= 8;
        requestAnimationFrame(checkAndWait);
    }
    
    checkAndWait();
}

/**
 * 重置当前阶段状态
 */
function resetPhase() {
    correctClicked = 0;
    disableClick = false;  // 重新允许点击
    showCorrectWord = false;  // 隐藏正确单词
    correctWordPhase = 0;     // 重置正确单词阶段
    stopCorrectWordFlash();   // 停止正确单词闪动
    if (correctWordTimer) { clearTimeout(correctWordTimer); correctWordTimer = null; }  // 清除正确单词定时器
    zones.forEach(z => {
        z.clicked = false;
        z.shaking = false;
        z.vanished = false;
    });
}

/**
 * 开始火车2离开动画（向右移动离开画面）
 */
function startTrain2LeaveAnimation() {
    // 停止当前阶段的音频自动播放
    stopAudioTimer();
    // 火车开始移动0.1秒后播放音效
    setTimeout(() => {
        if (trainSound) {
            trainSound.currentTime = 0;
            trainSound.play().catch((err) => {
                console.log('Train sound play failed:', err);
            });
        }
    }, 100);
    train2Leaving = true;
    animateTrain2Leave();
}

/**
 * 火车2离开动画循环
 * 火车2向右移动，移动到一半时触发火车3出现
 */
function animateTrain2Leave() {
    if (gameState !== 'playing') return;
    if (!train2Leaving) return;
    
    train2Config.x += 9;  // 每帧移动9像素
    
    // 当火车2移动到一半路程时，触发火车3出现
    const halfDistance = (canvas.width + train2Config.width + Math.abs(train2Config.targetX)) / 4;
    const currentDistance = train2Config.x - train2Config.targetX;
    if (currentDistance >= halfDistance && !train3Entering && !train3Leaving) {
        startTrain3Animation();
    }
    
    // 火车完全移出画面后停止动画
    if (train2Config.x > canvas.width + train2Config.width) {
        train2Leaving = false;
    }
    
    train2AnimationId = requestAnimationFrame(animateTrain2Leave);
}

/**
 * 开始火车3离开动画（向右移动离开画面）
 */
function startTrain3LeaveAnimation() {
    // 停止当前阶段的音频自动播放
    stopAudioTimer();
    // 火车开始移动0.1秒后播放音效
    setTimeout(() => {
        if (trainSound) {
            trainSound.currentTime = 0;
            trainSound.play().catch((err) => {
                console.log('Train sound play failed:', err);
            });
        }
    }, 100);
    train3Leaving = true;
    animateTrain3Leave();
}

/**
 * 火车3离开动画循环
 * 火车3向右移动，完全移出画面后游戏胜利
 */
function animateTrain3Leave() {
    if (gameState !== 'playing') return;
    if (!train3Leaving) return;
    
    train3Config.x += 9;  // 每帧移动9像素
    
    // 火车完全移出画面后结束游戏
    if (train3Config.x > canvas.width + train3Config.width) {
        train3Leaving = false;
        // 检查是否获得9分或以上
        if (score >= 9) {
            endGame('win');
        } else {
            endGame('lose');
        }
        return;
    }
    
    train3AnimationId = requestAnimationFrame(animateTrain3Leave);
}

/**
 * 开始火车3动画（从左侧进入画面）
 */
function startTrain3Animation() {
    train3Entering = true;
    animateTrain3();
}

/**
 * 火车3动画循环（进入阶段）
 * 火车3从左侧进入，移动到目标位置后停止，1秒后播放音频
 */
function animateTrain3() {
    if (gameState !== 'playing') return;
    if (!train3Entering) return;
    
    if (train3Config.x < train3Config.targetX) {
        train3Config.x += 6;  // 每帧移动6像素
        if (train3Config.x >= train3Config.targetX) {
            train3Config.x = train3Config.targetX;
            train3Entering = false;
            // 火车到达后立即切换到阶段3并显示图片
            gamePhase = 3;
            
            zones = phase3Zones;
            correctClicked = 0;
            totalClicked = 0;
            hasWrongSelection = false;
            zones.forEach(z => {
                z.clicked = false;
                z.vanished = false;
            });
            // 初始化阶段3的随机正确区域
            initRandomCorrectZones();
            initPhaseLetters();
            // 停止后1秒播放bird音频
            setTimeout(() => {
                playBirdAudio();
            }, 1000);
        }
        train3AnimationId = requestAnimationFrame(animateTrain3);
    }
}

/**
 * 播放阶段3音频（根据关卡播放不同音频）
 * 播放完成后进入阶段3，重置区域状态
 */
function playBirdAudio() {
    if (currentLevel === 1 && birdAudio) {
        birdAudio.currentTime = 0;  // 重置播放位置
        birdAudio.play().then(() => {
            birdAudioPlayed = true;
        }).catch((err) => {
            console.log('Bird audio play failed:', err);
        });
        
        birdAudio.onended = () => {
            birdAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 2 && fourAudio) {
        fourAudio.currentTime = 0;  // 重置播放位置
        fourAudio.play().then(() => {
            fourAudioPlayed = true;
        }).catch((err) => {
            console.log('Four audio play failed:', err);
        });
        
        fourAudio.onended = () => {
            fourAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 3 && fiveAudio) {
        fiveAudio.currentTime = 0;  // 重置播放位置
        fiveAudio.play().then(() => {
            fiveAudioPlayed = true;
        }).catch((err) => {
            console.log('Five audio play failed:', err);
        });
        
        fiveAudio.onended = () => {
            fiveAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 4 && blueAudio) {
        blueAudio.currentTime = 0;  // 重置播放位置
        blueAudio.play().then(() => {
            blueAudioPlayed = true;
        }).catch((err) => {
            console.log('Blue audio play failed:', err);
        });
        
        blueAudio.onended = () => {
            blueAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 5 && pearAudio) {
        pearAudio.currentTime = 0;  // 重置播放位置
        pearAudio.play().then(() => {
            pearAudioPlayed = true;
        }).catch((err) => {
            console.log('Pear audio play failed:', err);
        });
        
        pearAudio.onended = () => {
            pearAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 6 && handAudio) {
        handAudio.currentTime = 0;  // 重置播放位置
        handAudio.play().then(() => {
            handAudioPlayed = true;
        }).catch((err) => {
            console.log('hand audio play failed:', err);
        });
        
        handAudio.onended = () => {
            handAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 7 && footAudio) {
        footAudio.currentTime = 0;  // 重置播放位置
        footAudio.play().then(() => {
            footAudioPlayed = true;
        }).catch((err) => {
            console.log('foot audio play failed:', err);
        });
        
        footAudio.onended = () => {
            footAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 8 && moonAudio) {
        moonAudio.currentTime = 0;  // 重置播放位置
        moonAudio.play().then(() => {
            moonAudioPlayed = true;
        }).catch((err) => {
            console.log('moon audio play failed:', err);
        });
        
        moonAudio.onended = () => {
            moonAudioEnded = true;
            startAudioTimer();
        };
     } else if (currentLevel === 9 && loveAudio) {
        loveAudio.currentTime = 0;  // 重置播放位置
        loveAudio.play().then(() => {
            loveAudioPlayed = true;
        }).catch((err) => {
            console.log('love audio play failed:', err);
        });
        
        loveAudio.onended = () => {
            loveAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 10 && faceAudio) {
        faceAudio.currentTime = 0;  // 重置播放位置
        faceAudio.play().then(() => {
            faceAudioPlayed = true;
        }).catch((err) => {
            console.log('face audio play failed:', err);
        });
        
        faceAudio.onended = () => {
            faceAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 11 && bookAudio) {
        bookAudio.currentTime = 0;  // 重置播放位置
        bookAudio.play().then(() => {
            bookAudioPlayed = true;
        }).catch((err) => {
            console.log('book audio play failed:', err);
        });
        
        bookAudio.onended = () => {
            bookAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 12 && headAudio) {
        headAudio.currentTime = 0;  // 重置播放位置
        headAudio.play().then(() => {
            headAudioPlayed = true;
        }).catch((err) => {
            console.log('head audio play failed:', err);
        });
        
        headAudio.onended = () => {
            headAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 13 && deskAudio) {
        deskAudio.currentTime = 0;  // 重置播放位置
        deskAudio.play().then(() => {
            deskAudioPlayed = true;
        }).catch((err) => {
            console.log('desk audio play failed:', err);
        });
        
        deskAudio.onended = () => {
            deskAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 14 && treeAudio) {
        treeAudio.currentTime = 0;  // 重置播放位置
        treeAudio.play().then(() => {
            treeAudioPlayed = true;
        }).catch((err) => {
            console.log('tree audio play failed:', err);
        });
        
        treeAudio.onended = () => {
            treeAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 15 && feedAudio) {
        feedAudio.currentTime = 0;  // 重置播放位置
        feedAudio.play().then(() => {
            feedAudioPlayed = true;
        }).catch((err) => {
            console.log('feed audio play failed:', err);
        });
        
        feedAudio.onended = () => {
            feedAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 16 && likeAudio) {
        likeAudio.currentTime = 0;  // 重置播放位置
        likeAudio.play().then(() => {
            likeAudioPlayed = true;
        }).catch((err) => {
            console.log('like audio play failed:', err);
        });
        
        likeAudio.onended = () => {
            likeAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 17 && milkAudio) {
        milkAudio.currentTime = 0;  // 重置播放位置
        milkAudio.play().then(() => {
            milkAudioPlayed = true;
        }).catch((err) => {
            console.log('milk audio play failed:', err);
        });
        
        milkAudio.onended = () => {
            milkAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 18 && kiteAudio) {
        kiteAudio.currentTime = 0;  // 重置播放位置
        kiteAudio.play().then(() => {
            kiteAudioPlayed = true;
        }).catch((err) => {
            console.log('kite audio play failed:', err);
        });
        
        kiteAudio.onended = () => {
            kiteAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 19 && longAudio) {
        longAudio.currentTime = 0;  // 重置播放位置
        longAudio.play().then(() => {
            longAudioPlayed = true;
        }).catch((err) => {
            console.log('long audio play failed:', err);
        });
        
        longAudio.onended = () => {
            longAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 20 && lookAudio) {
        lookAudio.currentTime = 0;  // 重置播放位置
        lookAudio.play().then(() => {
            lookAudioPlayed = true;
        }).catch((err) => {
            console.log('look audio play failed:', err);
        });
        
        lookAudio.onended = () => {
            lookAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 21 && riceAudio) {
        riceAudio.currentTime = 0;  // 重置播放位置
        riceAudio.play().then(() => {
            riceAudioPlayed = true;
        }).catch((err) => {
            console.log('rice audio play failed:', err);
        });
        
        riceAudio.onended = () => {
            riceAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 22 && cakeAudio) {
        cakeAudio.currentTime = 0;  // 重置播放位置
        cakeAudio.play().then(() => {
            cakeAudioPlayed = true;
        }).catch((err) => {
            console.log('cake audio play failed:', err);
        });
        
        cakeAudio.onended = () => {
            cakeAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 23 && noseAudio) {
        noseAudio.currentTime = 0;  // 重置播放位置
        noseAudio.play().then(() => {
            noseAudioPlayed = true;
        }).catch((err) => {
            console.log('nose audio play failed:', err);
        });
        
        noseAudio.onended = () => {
            noseAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 24 && manyAudio) {
        manyAudio.currentTime = 0;  // 重置播放位置
        manyAudio.play().then(() => {
            manyAudioPlayed = true;
        }).catch((err) => {
            console.log('many audio play failed:', err);
        });
        
        manyAudio.onended = () => {
            manyAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 25 && jumpAudio) {
        jumpAudio.currentTime = 0;  // 重置播放位置
        jumpAudio.play().then(() => {
            jumpAudioPlayed = true;
        }).catch((err) => {
            console.log('jump audio play failed:', err);
        });
        
        jumpAudio.onended = () => {
            jumpAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 26 && findAudio) {
        findAudio.currentTime = 0;  // 重置播放位置
        findAudio.play().then(() => {
            findAudioPlayed = true;
        }).catch((err) => {
            console.log('find audio play failed:', err);
        });
        
        findAudio.onended = () => {
            findAudioEnded = true;
            startAudioTimer();
        };
    } else if (currentLevel === 27 && haveAudio) {
        haveAudio.currentTime = 0;  // 重置播放位置
        haveAudio.play().then(() => {
            haveAudioPlayed = true;
        }).catch((err) => {
            console.log('have audio play failed:', err);
        });
        
        haveAudio.onended = () => {
            haveAudioEnded = true;
            startAudioTimer();
        };
    }
}

/**
 * 按当前剩余时间启动倒计时
 */
function startCountdownFromCurrentTime() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }
    timeDisplayEl.textContent = `Time: ${timeLeft}s`;
    scoreDisplayEl.textContent = `Score: ${score}`;
    countdownTimer = setInterval(() => {
        timeLeft--;
        timeDisplayEl.textContent = `Time: ${timeLeft}s`;
        scoreDisplayEl.textContent = `Score: ${score}`;

        if (timeLeft <= 0) {
            endGame('time');
        }
    }, 1000);
}

/**
 * 主动查看学习报告时暂停游戏，并保留当前挑战状态
 */
function pauseGameplayForReport() {
    gameState = 'paused';
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    stopAudioTimer();
    stopAllWordAudios();

    if (trainAnimationId) {
        cancelAnimationFrame(trainAnimationId);
        trainAnimationId = null;
    }
    if (train2AnimationId) {
        cancelAnimationFrame(train2AnimationId);
        train2AnimationId = null;
    }
    if (train3AnimationId) {
        cancelAnimationFrame(train3AnimationId);
        train3AnimationId = null;
    }
    if (gameHudEl) {
        gameHudEl.style.display = 'none';
    }
}

/**
 * 从主动报告返回，继续当前挑战
 */
function resumeGameplayFromReport() {
    gameState = 'playing';
    if (gameHudEl) {
        gameHudEl.style.display = 'flex';
    }
    if (endGameButtonEl) {
        endGameButtonEl.style.display = 'flex';
    }

    startCountdownFromCurrentTime();
    draw();

    let animationResumed = false;
    if (trainMoving) { animateTrain(); animationResumed = true; }
    if (train1MovingLeft) { animateTrain1MoveLeft(); animationResumed = true; }
    if (train2Entering) { animateTrain2(); animationResumed = true; }
    if (train2Leaving) { animateTrain2Leave(); animationResumed = true; }
    if (train2MovingLeft) { animateTrain2MoveLeft(); animationResumed = true; }
    if (train3Entering) { animateTrain3(); animationResumed = true; }
    if (train3Leaving) { animateTrain3Leave(); animationResumed = true; }
    if (train3MovingLeft) { animateTrain3MoveLeft(); animationResumed = true; }
    if (!animationResumed) {
        startAudioTimer();
    }
}

/**
 * 停止当前游戏流程，供结算界面和自然结束报告使用
 */
function stopGameplay() {
    gameState = 'end';

    // 清理所有定时器和动画
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    // 停止音频自动播放定时器
    stopAudioTimer();
    if (delayTimer) {
        clearTimeout(delayTimer);
        delayTimer = null;
    }
    if (trainAnimationId) {
        cancelAnimationFrame(trainAnimationId);
        trainAnimationId = null;
    }
    if (train2AnimationId) {
        cancelAnimationFrame(train2AnimationId);
        train2AnimationId = null;
    }
    if (train3AnimationId) {
        cancelAnimationFrame(train3AnimationId);
        train3AnimationId = null;
    }
    trainMoving = false;
    train1ReadyToLeave = false;
    train1MovingLeft = false;
    train2Entering = false;
    train2Leaving = false;
    train2ReadyToLeave = false;
    train2MovingLeft = false;
    train3Entering = false;
    train3Leaving = false;
    train3ReadyToLeave = false;
    train3MovingLeft = false;
    showBlackSmoke = false;
    showBlackSmoke2 = false;
    smokeTrainIndex = 0;
    disableClick = false;         // 重置禁止点击状态

    if (endGameButtonEl) {
        endGameButtonEl.style.display = 'none';
    }
    if (gameHudEl) {
        gameHudEl.style.display = 'none';
    }
}

/**
 * 获取报告中单词对应的音频路径。
 * bird 的现有素材文件名末尾带一个空格，因此在这里保留该实际文件名。
 * @param {string} word - 单词
 * @returns {string}
 */
function getReportWordAudioSrc(word) {
    const audioFileName = word === 'bird' ? 'bird ' : word;
    return `assets/${encodeURIComponent(audioFileName)}.mp3`;
}

/**
 * 停止当前报告播报，并在需要时恢复背景音乐。
 * @param {{ resumeBackground?: boolean }} options
 */
function stopReportNarration(options = {}) {
    const shouldResumeBackground = options.resumeBackground !== false;
    reportNarrationRunId++;

    if (reportNarrationAudio) {
        reportNarrationAudio.pause();
        reportNarrationAudio.currentTime = 0;
        reportNarrationAudio = null;
    }
    if (finishCurrentReportAudio) {
        const finish = finishCurrentReportAudio;
        finishCurrentReportAudio = null;
        finish(false);
    }

    if (shouldResumeBackground && resumeBackgroundAfterNarration && backgroundAudio) {
        backgroundAudio.play().catch(() => {});
    }
    resumeBackgroundAfterNarration = false;
}

/**
 * 播放报告播报序列中的一段音频。
 * @param {{ src: string, label: string }} item
 * @param {number} runId
 * @param {HTMLElement|null} statusEl
 * @returns {Promise<boolean>}
 */
function playReportAudioItem(item, runId, statusEl) {
    return new Promise((resolve, reject) => {
        if (runId !== reportNarrationRunId) {
            resolve(false);
            return;
        }

        const audio = new Audio(item.src);
        audio.volume = 1;
        audio.preload = 'auto';
        reportNarrationAudio = audio;

        if (statusEl) {
            statusEl.textContent = item.label;
        }

        let settled = false;
        const finish = (completed) => {
            if (settled) return;
            settled = true;
            audio.onended = null;
            audio.onerror = null;
            if (reportNarrationAudio === audio) {
                reportNarrationAudio = null;
            }
            if (finishCurrentReportAudio === finish) {
                finishCurrentReportAudio = null;
            }
            resolve(completed);
        };
        finishCurrentReportAudio = finish;

        audio.onended = () => finish(true);
        audio.onerror = () => {
            if (settled) return;
            settled = true;
            if (reportNarrationAudio === audio) {
                reportNarrationAudio = null;
            }
            if (finishCurrentReportAudio === finish) {
                finishCurrentReportAudio = null;
            }
            reject(new Error(`Report audio failed to load: ${item.src}`));
        };

        audio.play().catch((error) => {
            if (settled) return;
            settled = true;
            audio.onended = null;
            audio.onerror = null;
            if (reportNarrationAudio === audio) {
                reportNarrationAudio = null;
            }
            if (finishCurrentReportAudio === finish) {
                finishCurrentReportAudio = null;
            }
            reject(error);
        });
    });
}

/**
 * 播报学习报告。有未掌握单词时只播报列表中的前 3 个。
 * @param {string[]} unMasteredWords
 * @param {HTMLElement|null} statusEl
 */
async function playReportNarration(unMasteredWords, statusEl) {
    stopReportNarration();
    const runId = reportNarrationRunId;
    const wordsToRead = unMasteredWords.slice(0, 3);
    const hasPlayedWords = playedPhases.length > 0;
    const sequence = wordsToRead.length > 0
        ? [
            { src: 'report/1_1.mp3', label: '正在播放学习建议…' },
            ...wordsToRead.map(word => ({
                src: getReportWordAudioSrc(word),
                label: `正在播报：${word}`
            })),
            { src: 'report/1_2.mp3', label: '正在播放学习建议…' }
        ]
        : (hasPlayedWords
            ? [{ src: 'report/2.mp3', label: '正在播放学习成果…' }]
            : []);

    if (sequence.length === 0) {
        if (statusEl) {
            statusEl.textContent = '完成一次单词挑战后即可播报';
        }
        return;
    }

    if (backgroundAudio && !backgroundAudio.paused) {
        resumeBackgroundAfterNarration = true;
        backgroundAudio.pause();
    }

    try {
        for (const item of sequence) {
            const completed = await playReportAudioItem(item, runId, statusEl);
            if (!completed || runId !== reportNarrationRunId) return;
        }

        if (runId === reportNarrationRunId && statusEl) {
            statusEl.textContent = wordsToRead.length > 0
                ? `已播报：${wordsToRead.join('、')}`
                : '播报完成';
        }
    } catch (error) {
        if (runId === reportNarrationRunId) {
            console.log('Report narration play failed:', error);
            if (statusEl) statusEl.textContent = '播报暂时无法播放';
        }
    } finally {
        if (runId === reportNarrationRunId) {
            if (resumeBackgroundAfterNarration && backgroundAudio) {
                backgroundAudio.play().catch(() => {});
            }
            resumeBackgroundAfterNarration = false;
        }
    }
}

/**
 * 结束游戏
 * @param {string} result - 游戏结果: win(胜利)/time(超时)/lose(失败)
 */
function endGame(result) {
    stopGameplay();
    
    // 创建结算界面遮罩
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.style.pointerEvents = 'auto';
    
    // 根据得分选择庆祝图片
    let endImgSrc = '';
    if (score >= 9) {
        endImgSrc = 'assets/end3.png';
    } else if (score >= 6) {
        endImgSrc = 'assets/end2.png';
    } else {
        endImgSrc = 'assets/end1.png';
    }
    
    // 显示结算信息
    overlay.innerHTML = `
        <img src="${endImgSrc}" style="max-width: 600px; max-height: 400px; transform: translateY(28px);">
    `;
    document.body.appendChild(overlay);
    
    // 判断是否需要显示成绩报告
    // 条件：所有单词都掌握了（全部答对）或者答错了5次
    const showReport = (totalMastered === totalWordsCount) || (wrongCount >= 5);
    
    // 结算画面停留1秒；完成全部内容时进入成绩报告，否则自动进入下一关
    setTimeout(() => {
        if (showReport) {
            displayReport({ naturalEnd: true });
            return;
        }

        // 移除结算界面
        overlay.remove();
        // 进入下一关（第27关后回到第1关，保持原有循环规则）
        currentLevel = currentLevel === 27 ? 1 : currentLevel + 1;
        startGame(false);
    }, 1000);
    
    // 上报得分
    if (typeof onReport === 'function') {
        onReport(score);
    }
}

// 添加鼠标点击事件监听
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleClick(x, y);
});

// 添加触摸事件监听（兼容移动端）
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleClick(x, y);
});

// 添加窗口resize事件监听
window.addEventListener('resize', () => {
    if (gameState === 'start') {
        drawStartScreen();
    }
});

/**
 * 显示成绩报告
 * @param {{ naturalEnd?: boolean }} options - 是否由游戏自然结束进入报告
 */
function displayReport(options = {}) {
    const naturalEnd = options.naturalEnd === true;

    // 自然结束会彻底停止游戏；主动查看时只暂停，便于继续挑战
    if (naturalEnd) {
        stopGameplay();
    } else {
        pauseGameplayForReport();
    }

    // 只有自然结束报告是本局的正式结果页
    if (naturalEnd) {
        gameTracker.finish(score);
    }

    // 隐藏原来的结算界面
    const existingOverlay = document.querySelector('.overlay');
    if (existingOverlay) {
        existingOverlay.style.display = 'none';
    }
    
    // 创建报告遮罩层
    const reportOverlay = document.createElement('div');
    reportOverlay.className = 'overlay';
    reportOverlay.style.pointerEvents = 'auto';
    reportOverlay.style.zIndex = '150';
    reportOverlay.style.background = 'rgba(0, 0, 0, 0.5)';
    
    // 获取参与过的阶段的单词
    const playedWordsList = playedPhases.map(phaseKey => {
        const [level, phase] = phaseKey.split('-').map(Number);
        const words = allWords[`level${level}`];
        // 阶段1对应第1个单词，阶段2对应第2个单词，阶段3对应第3个单词
        return words[phase - 1];
    });
    // 计算这些单词中未掌握的
    const unMasteredWords = playedWordsList.filter(word => !masteredWords.includes(word));
    // 计算这些单词中已掌握的
    const masteredPlayedWords = playedWordsList.filter(word => masteredWords.includes(word));

    // 主动查看报告时，“继续挑战”位于“再玩一次”左侧
    const reportActionHtml = `
        ${naturalEnd ? '' : `
            <button id="continueChallengeBtn" class="report-action-button" type="button">
                继续挑战
            </button>
        `}
        <button id="replayGameBtn" class="report-action-button" type="button" aria-label="再玩一次，返回游戏开始页面">
            再玩一次
        </button>
    `;
    
    // 构建报告内容
    reportOverlay.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center;">
            <!-- 底图 -->
            <div style="position: relative; width: 700px; height: 500px;">
                <img src="assets/report.png" style="width: 100%; height: 100%; object-fit: contain;">
                <!-- 未掌握单词区域 - 靠左对齐 -->
                <div style="position: absolute; top: 100px; left: 120px;">
                    <div style="display: flex; align-items: flex-start;">
                        <p style="font-size: 20px; color: #333; font-weight: bold; margin: 0;">未掌握单词:</p>
                        <div style="font-size: 18px; color: #d32f2f; line-height: 1.6; border: 0px solid #e04040; padding: 2px; min-height: 50px; max-height: 50px; width: 370px; margin-left: 5px; overflow-y: auto;">
                            ${unMasteredWords.length > 0 ? unMasteredWords.join('、') : '无'}
                        </div>
                    </div>
                </div>
                <!-- 已掌握单词区域 - 靠左对齐，在未掌握单词下方 -->
                <div style="position: absolute; top: 180px; left: 120px;">
                    <div style="display: flex; align-items: flex-start;">
                        <p style="font-size: 20px; color: #333; font-weight: bold; margin: 0;">已掌握单词:</p>
                        <div style="font-size: 18px; color: #2e7d32; line-height: 1.6; border: 0px solid #4CAF50; padding: 2px; min-height: 180px; width: 370px; margin-left: 5px;">
                            ${masteredPlayedWords.length > 0 ? masteredPlayedWords.join('、') : '无'}
                        </div>
                    </div>
                </div>
                <!-- 单词掌握进度 -->
                <div style="position: absolute; bottom: 90px; left: 320px;">
                    <p style="font-size: 20px; color: #333; font-weight: bold;">单词掌握进度: ${totalMastered}/${playedWordsList.length}</p>
                </div>
            </div>
            <div id="reportNarrationStatus" class="report-narration-status" aria-live="polite"></div>
            <!-- 按钮区域 - 在底图下方 -->
            <div style="display: flex; align-items: center; gap: 16px; margin-top: 10px;">
                ${reportActionHtml}
            </div>
        </div>
    `;
    
    document.body.appendChild(reportOverlay);

    const narrationStatus = reportOverlay.querySelector('#reportNarrationStatus');
    // 报告打开后自动播报，不在报告界面显示额外的播报控件。
    playReportNarration(unMasteredWords, narrationStatus);

    // 自然结束后重新加载游戏，回到干净的开始页面并重置全部本局状态
    const replayBtn = document.getElementById('replayGameBtn');
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            stopReportNarration({ resumeBackground: false });
            if (!naturalEnd) {
                gameTracker.finish(score);
            }
            window.location.reload();
        });
    }

    const continueBtn = document.getElementById('continueChallengeBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            stopReportNarration();
            reportOverlay.remove();
            resumeGameplayFromReport();
        });
    }
}

if (endGameButtonEl) {
    endGameButtonEl.addEventListener('click', () => displayReport());
}

// 加载图片资源，启动游戏
loadImages();
