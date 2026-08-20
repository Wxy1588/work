// 年级单词配置
const gradeWords = {
    '1-3': [
        'are', 'arm', 'bag', 'ball', 'bed', 'big', 'bird', 'blue', 'book', 'box', 'bus', 'cake',
        'can', 'cap', 'car', 'card', 'cat', 'cow', 'cup', 'cut', 'dad', 'desk', 'dog',
        'eat', 'egg', 'face', 'fat', 'feed', 'find', 'five', 'fly', 'foot', 'four', 'from',
        'hair', 'hand', 'hat', 'have', 'head', 'hen', 'hop', 'how', 'jump', 'kite', 'leg',
        'let', 'like', 'long', 'look', 'love', 'man', 'many', 'map', 'milk', 'mix',
        'mom', 'moon', 'nod', 'nose', 'old', 'one', 'pear', 'pen', 'pig', 'play', 'red',
        'rice', 'row', 'run', 'sad', 'sea', 'see', 'she', 'sing', 'sit', 'six', 'sky', 'some',
        'sun', 'ten', 'the', 'this', 'toy', 'tree', 'two', 'USA', 'what', 'who', 'yes', 'your', 'zoo',
        'yellow','green','apple','banana','orange','three','watermelon','lemon','no','seven','eight',
        'nine','cookie','blow','chocolate','candle','monkey','panda','tiger','elephant','swim','burger',
        'hippo','kangaroo','horse','rabbit','dolphin','coke','lollipop','hello','name','color','dance',
        'sleep','brother','sister','grandpa','grandma','coat','dress','scarf','black','white','shoes',
        'pants','socks','whale','touch','neck','brush','school','grape'
    ],
    '4-1': [
        'Africa', 'Christmas', 'agree', 'ahead', 'always', 'animal', 'around', 'aunt', 'autumn',
        'bathroom', 'beautiful', 'because', 'best', 'bin', 'birthday', 'boat', 'boil', 'careful',
        'cheer', 'chore', 'class', 'cleaner', 'clear', 'complete', 'dance', 'date', 'dear',
        'delicious', 'dirty', 'dish', 'doctor', 'door', 'dragon', 'drink', 'driver', 'drop',
        'dumpling', 'during', 'elephant', 'evening', 'example', 'exercise', 'farmer', 'favourite',
        'feel', 'festival', 'fine', 'firework', 'fireworks', 'floor', 'flower', 'forward', 'full',
        'funny', 'game', 'gardener', 'gift', 'glad', 'grandpa', 'great', 'greens', 'guest',
        'happy', 'hard', 'hold', 'hope', 'host', 'hot', 'house', 'idea', 'information', 'kind',
        'kitchen', 'laugh', 'leave', 'leftovers', 'maybe', 'meal', 'minute', 'mooncake', 'mop',
        'more', 'morning', 'most', 'near', 'never', 'nice', 'night', 'note', 'nurse', 'once',
        'open', 'part', 'party', 'photo', 'photographer', 'pick', 'picture', 'playground',
        'please', 'policeman', 'policewoman', 'problem', 'ready', 'really', 'remember', 'rubbish',
        'scientist', 'share', 'show', 'sing', 'sister', 'small', 'smile', 'some', 'song', 'sound',
        'spend', 'spoon', 'spring', 'story', 'subject', 'surprise', 'sweep', 'sweet', 'table',
        'take', 'taste', 'taxi', 'technology', 'thanks', 'then', 'there', 'think', 'through',
        'tissue', 'together', 'uncle', 'waiter', 'walk', 'warm', 'wash', 'water', 'weekend',
        'wish', 'word', 'would', 'yourself'
    ],
    '4-2': [
        'August', 'December', 'February', 'Friday', 'September', 'Tuesday', 'Wednesday',
        'about', 'also', 'apple', 'asleep', 'basketball', 'beach', 'beautiful', 'because', 'bee',
        'behind', 'best', 'better', 'bird', 'bit', 'black', 'boiled', 'call', 'candy', 'care',
        'carrot', 'choice', 'cinema', 'class', 'clever', 'climb', 'cool', 'course', 'cousin',
        'dark', 'day', 'decision', 'dog', 'down', 'draw', 'drawer', 'duck', 'during', 'easy',
        'example', 'fall', 'farmer', 'fast', 'fold', 'food', 'football', 'forward', 'fox',
        'fresh', 'front', 'fruit', 'goodbye', 'grass', 'great', 'green', 'group', 'grow',
        'hamburger', 'hang', 'hot', 'how', 'interest', 'jacket', 'job', 'kind', 'kite', 'late',
        'later', 'laugh', 'learn', 'less', 'light', 'like', 'live', 'local', 'meal', 'mean',
        'milk', 'month', 'more', 'most', 'mouse', 'once', 'orange', 'own', 'pair', 'parent',
        'park', 'party', 'pearl', 'picture', 'pig', 'quiet', 'rainy', 'red', 'remember', 'room',
        'rose', 'round', 'saying', 'season', 'second', 'see', 'sheep', 'shirt', 'shoe',
        'snowman', 'snowy', 'start', 'stay', 'still', 'supermarket', 'sure', 'sweater', 'swim',
        'swine', 'tell', 'tennis', 'than', 'there', 'these', 'thin', 'think', 'third', 'three',
        'tired', 'tomorrow', 'tour', 'town', 'train', 'tree', 'trip', 'trousers', 'want',
        'watch', 'water', 'weather', 'week', 'what', 'which', 'wind', 'zoo'
    ],
    '5-1': [
        'Celsius', 'English', 'February', 'November', 'West', 'ability', 'about', 'afternoon',
        'around', 'ask', 'away', 'before', 'between', 'birthday', 'both', 'bottle', 'bowl',
        'building', 'bun', 'busy', 'cake', 'can', 'cartoon', 'chocolate', 'chopstick', 'cinema',
        'coffee', 'coke', 'cold', 'colour', 'coloured', 'comic', 'computer', 'course', 'cousin',
        'cream', 'dance', 'dear', 'delicious', 'design', 'dinner', 'down', 'draw', 'drawing',
        'dry', 'dumpling', 'enjoy', 'every', 'everyone', 'example', 'feed', 'find', 'fine',
        'fork', 'fresh', 'game', 'glass', 'hamburger', 'hard', 'hat', 'healthy', 'high', 'hobby',
        'holiday', 'hungry', 'ice', 'idea', 'information', 'inside', 'interesting', 'join',
        'knife', 'lesson', 'library', 'little', 'lunch', 'lunchtime', 'machine', 'map', 'meat',
        'menu', 'milk', 'model', 'moment', 'more', 'news', 'night', 'noodle', 'outdoors',
        'outside', 'painter', 'palace', 'pancake', 'park', 'place', 'plane', 'plate',
        'playground', 'plenty', 'potato', 'pupil', 'really', 'report', 'rice', 'sandwich',
        'season', 'seldom', 'set', 'sing', 'sky', 'smell', 'snack', 'snow', 'some', 'something',
        'son', 'sound', 'soup', 'sour', 'stamp', 'street', 'suit', 'sun', 'sunny', 'sure',
        'talk', 'talking', 'taste', 'terrible', 'than', 'their', 'together', 'tomato', 'tooth',
        'tree', 'under', 'unhealthy', 'vegetable', 'visit', 'watch', 'water', 'way', 'wear',
        'weather', 'went', 'with', 'yours', 'yourself'
    ],
    '5-2': [
        'American', 'Australia', 'Australian', 'China', 'London', 'across', 'ahead', 'answer',
        'anything', 'arrive', 'bad', 'beach', 'beauty', 'believe', 'bridge', 'call', 'camp',
        'candy', 'centre', 'classmate', 'climb', 'clothes', 'colourful', 'cross', 'crossing',
        'dangerous', 'date', 'dear', 'deer', 'direction', 'dry', 'eighth', 'either', 'enter',
        'excited', 'exciting', 'excuse', 'fall', 'famous', 'fan', 'favourite', 'feed', 'festival',
        'fifth', 'first', 'forget', 'guy', 'hey', 'holiday', 'hospital', 'hotel', 'hour', 'hurt',
        'invitation', 'invite', 'island', 'lake', 'late', 'leave', 'left', 'light', 'lost',
        'main', 'make', 'market', 'meeting', 'middle', 'miss', 'month', 'mountain', 'museum',
        'music', 'must', 'natural', 'next', 'noon', 'nothing', 'office', 'oops', 'opposite',
        'outdoor', 'outdoors', 'palace', 'party', 'pass', 'photo', 'picnic', 'plan', 'plant',
        'play', 'police', 'pool', 'post', 'prefer', 'problem', 'restaurant', 'right', 'road',
        'round', 'run', 'safe', 'safety', 'season', 'second', 'sharp', 'ship', 'show', 'sick',
        'ski', 'snowman', 'someone', 'sound', 'special', 'stair', 'stand', 'station', 'stay',
        'stranger', 'street', 'suddenly', 'summer', 'supermarket', 'surprise', 'swim', 'tall',
        'taxi', 'test', 'third', 'through', 'together', 'took', 'train', 'travel', 'trip',
        'trouble', 'turn', 'underground', 'until', 'valley', 'watch', 'way', 'were', 'why',
        'winter', 'workshop', 'world', 'would', 'zoo'
    ],
    '6-1': [
        'China', 'Disneyland', 'Earth', 'Saturday', 'afraid', 'afternoon', 'angry', 'another',
        'basketball', 'bean', 'because', 'before', 'brown', 'brush', 'bus', 'came', 'candy',
        'celebrate', 'cheap', 'cheer', 'chicken', 'chip', 'cinema', 'clap', 'climb', 'cold',
        'comfortable', 'countryside', 'course', 'cousin', 'desk', 'diary', 'diet', 'dig', 'dirty',
        'discover', 'doctor', 'down', 'drink', 'duck', 'each', 'email', 'even', 'exercise',
        'experience', 'fever', 'few', 'film', 'finally', 'floor', 'flower', 'fresh', 'friend',
        'grandparent', 'grass', 'group', 'hair', 'hear', 'heavy', 'help', 'hold', 'hole', 'horse',
        'jiaozi', 'joy', 'jump', 'lake', 'lantern', 'last', 'leg', 'less', 'live', 'llama', 'lot',
        'lucky', 'met', 'milk', 'modern', 'museum', 'nearby', 'new', 'night', 'noisy', 'oneself',
        'only', 'other', 'pair', 'park', 'people', 'photo', 'pick', 'picnic', 'plant', 'plenty',
        'plural', 'poet', 'polite', 'pond', 'quiet', 'race', 'rain', 'raise', 'read', 'remember',
        'rest', 'saw', 'school', 'second', 'secret', 'seldom', 'short', 'show', 'simple', 'slow',
        'smile', 'snowflake', 'soup', 'space', 'sport', 'stomachache', 'store', 'storybook',
        'street', 'strong', 'tap', 'teaching', 'than', 'thanks', 'theatre', 'then', 'thing',
        'tidy', 'toothache', 'train', 'travel', 'trip', 'twice', 'wait', 'wake', 'walk', 'warm',
        'weekend', 'wet', 'wide', 'wish', 'with', 'yesterday', 'zongzi'
    ],
    '6-2': [
        'Africa', 'Asia', 'Austria', 'Britain', 'Canada', 'Chinatown', 'Disneyland', 'Dr',
        'France', 'Hollywood', 'Italy', 'Japan', 'Milan', 'Ottawa', 'Paris', 'Switzerland',
        'Sydney', 'Tokyo', 'Toronto', 'Wellington', 'abroad', 'actor', 'airport', 'another',
        'appear', 'beauty', 'book', 'bottom', 'bridge', 'brightly', 'brought', 'bulb', 'capital',
        'careless', 'choose', 'crash', 'danger', 'dark', 'die', 'difficult', 'disappear', 'dish',
        'dragon', 'earth', 'elephant', 'ever', 'except', 'ferry', 'field', 'flag', 'forest',
        'forever', 'free', 'frog', 'full', 'fur', 'gelato', 'giraffe', 'ground', 'happen',
        'harbour', 'harder', 'hare', 'himself', 'history', 'horse', 'hurry', 'impolite', 'inside',
        'into', 'invent', 'inventor', 'kangaroo', 'kiwi', 'koala', 'land', 'laugh', 'lead',
        'leader', 'leaf', 'leaves', 'light', 'line', 'lion', 'made', 'magic', 'manners', 'maple',
        'mean', 'monkey', 'movie', 'musician', 'natural', 'nature', 'neck', 'none', 'ocean',
        'only', 'opera', 'ox', 'painter', 'panda', 'passport', 'patient', 'person', 'physics',
        'pig', 'pollute', 'professor', 'proud', 'province', 'public', 'pupuil', 'push', 'rabbit',
        'ram', 'rat', 'rooster', 'sad', 'save', 'scientist', 'sea', 'seat', 'several', 'share',
        'sign', 'silly', 'snake', 'starfish', 'steady', 'stop', 'such', 'suddenly', 'throw',
        'ticket', 'tiger', 'tortoise', 'tower', 'tram', 'trouble', 'turn', 'university', 'upset',
        'waterfall', 'whale', 'win', 'word', 'writer'
    ],
    '7-1': [
        'absolutely', 'across', 'act', 'add', 'admiration', 'alive', 'almost', 'amazing', 'ancient',
        'annual', 'appearance', 'article', 'artwork', 'attend', 'attract', 'billion', 'bit',
        'blow', 'breathe', 'butterfly', 'caring', 'charity', 'chemical', 'circle', 'coin',
        'collect', 'continue', 'corner', 'courage', 'customer', 'dark', 'decide', 'desert',
        'design', 'determination', 'develop', 'divide', 'dollar', 'drama', 'dream', 'energy',
        'envelope', 'equipment', 'event', 'explain', 'explore', 'feature', 'file', 'flat',
        'follow', 'fresh', 'friendship', 'gas', 'gather', 'glove', 'grade', 'grain', 'greeting',
        'groundwater', 'guide', 'heart', 'hike', 'historic', 'honest', 'however', 'improve',
        'include', 'influence', 'insect', 'introduction', 'kick', 'kilogram', 'kilometre',
        'lander', 'landscape', 'lightning', 'list', 'literature', 'local', 'member', 'memory',
        'metre', 'mind', 'mood', 'nail', 'natural', 'neighbour', 'north', 'pack', 'painting',
        'part', 'patient', 'pattern', 'peaceful', 'poem', 'pole', 'pollution', 'popular',
        'presentation', 'produce', 'programme', 'project', 'protect', 'real', 'realize', 'reason',
        'release', 'respect', 'rocky', 'sale', 'same', 'sandcastle', 'sandstorm', 'seem', 'send',
        'senior', 'shape', 'single', 'site', 'size', 'snack', 'snake', 'soft', 'spacesuit',
        'spoon', 'sticker', 'stone', 'straight', 'suggestion', 'support', 'surface', 'survey',
        'system', 'through', 'thunder', 'tie', 'tip', 'trust', 'universe', 'unlock', 'valuable',
        'view', 'war', 'weigh', 'west', 'western', 'wife', 'wrapper'
    ],
    '7-2': [
        'ability', 'accident', 'achieve', 'admire', 'advice', 'against', 'agriculture', 'allow',
        'asleep', 'athlete', 'attention', 'audience', 'award', 'bath', 'blind', 'bored', 'borrow',
        'brain', 'branch', 'brave', 'business', 'cafe', 'career', 'climate', 'coast',
        'communicate', 'community', 'compare', 'competition', 'connect', 'contribution',
        'convenient', 'create', 'diamond', 'dig', 'disaster', 'discover', 'dolphin', 'effort',
        'either', 'electricity', 'encourage', 'endangered', 'engineering', 'environment',
        'eventually', 'everyday', 'excellent', 'extinct', 'female', 'fireman', 'fit', 'fix',
        'form', 'found', 'future', 'global', 'goods', 'government', 'grey', 'guard', 'guest',
        'hen', 'honour', 'host', 'household', 'huge', 'human', 'imagine', 'inspire', 'instruction',
        'instrument', 'journey', 'kiss', 'knowledge', 'lifetime', 'lift', 'lively', 'match',
        'material', 'medical', 'method', 'narrow', 'nearly', 'nowadays', 'online', 'otherwise',
        'perfect', 'perform', 'personality', 'praise', 'probably', 'product', 'proud', 'public',
        'range', 'receive', 'research', 'retire', 'return', 'review', 'role', 'root', 'rule',
        'salt', 'scared', 'seldom', 'service', 'shark', 'shoot', 'shower', 'side', 'sightseeing',
        'silent', 'smoke', 'smokejumper', 'society', 'sometime', 'somewhere', 'soon', 'source',
        'species', 'speed', 'step', 'stick', 'stretch', 'strict', 'superman', 'tablet', 'tap',
        'task', 'team', 'technology', 'thick', 'throughout', 'tough', 'trade', 'translation',
        'treat', 'type', 'uniform', 'unique', 'volcano', 'wherever', 'while', 'wild', 'wool',
        'yogurt'
    ],
    '8-1': [
        'accept', 'adaptation', 'advise', 'although', 'anxious', 'anywhere', 'artist', 'artistic',
        'attach', 'attack', 'author', 'avoid', 'awake', 'benefit', 'birth', 'breakthrough',
        'budget', 'captain', 'cause', 'central', 'challenge', 'check', 'chemistry', 'chessboard',
        'choice', 'chopstick', 'comment', 'company', 'completely', 'confused', 'contain',
        'content', 'context', 'count', 'currently', 'data', 'deal', 'death', 'depend', 'diet',
        'digital', 'dinosaur', 'distance', 'editor', 'effect', 'electronic', 'empty', 'enemy',
        'enter', 'era', 'especially', 'everywhere', 'expect', 'expert', 'fail', 'faithful',
        'feeling', 'fight', 'fill', 'flash card', 'flat', 'flight', 'flood', 'fork', 'grateful',
        'heat', 'hide', 'hold', 'honeymoon', 'image', 'independent', 'indoors', 'intelligent',
        'international', 'laptop', 'list', 'litter', 'lonely', 'magical', 'maintain', 'major',
        'microchip', 'microprocessor', 'midnight', 'mixture', 'mobile', 'negative', 'nervous',
        'normal', 'note', 'notebook', 'nut', 'onion', 'opinion', 'order', 'organize', 'original',
        'particular', 'payment', 'perhaps', 'personally', 'petrol', 'phase', 'prehistoric',
        'press', 'pretend', 'pride', 'prize', 'promise', 'pull', 'queen', 'record', 'regularly',
        'relationship', 'relax', 'repeat', 'reply', 'represent', 'responsible', 'schedule',
        'sense', 'servant', 'sharply', 'shock', 'silver', 'situation', 'soldier', 'statement',
        'stressed', 'succeed', 'suffering', 'talented', 'technique', 'tend', 'therefore', 'tiny',
        'traffic', 'treatment', 'trick', 'unfamiliar', 'unlikely', 'vehicle', 'victory', 'visual',
        'weight', 'wheel', 'wonder', 'yet'
    ],
    '8-2': [
        'Christmas', 'abroad', 'ache', 'acquire', 'advanced', 'advantage', 'afford', 'alone',
        'argue', 'arrange', 'average', 'backward', 'ballet', 'beef', 'behaviour', 'belong',
        'blog', 'boss', 'breath', 'camera', 'cancer', 'clap', 'classic', 'clue', 'combine',
        'concerned', 'conclusion', 'copy', 'corn', 'costume', 'cough', 'crash', 'crazy',
        'creative', 'creature', 'damage', 'daughter', 'deliver', 'detail', 'direct', 'direction',
        'disappoint', 'disease', 'donate', 'ease', 'elderly', 'element', 'emergency', 'emphasize',
        'eve', 'exhibition', 'expression', 'fear', 'folk', 'force', 'frightened', 'fuel', 'gap',
        'gun', 'gym', 'handsome', 'hero', 'hit', 'hold', 'immediately', 'impression', 'joy',
        'lab', 'law', 'leather', 'lifestyle', 'limit', 'lose', 'madam', 'master', 'masterpiece',
        'meaning', 'mention', 'mind', 'mirror', 'mistake', 'muscle', 'nod', 'observe', 'offer',
        'official', 'opportunity', 'pain', 'performance', 'permission', 'pleasant', 'pleasure',
        'poetry', 'point', 'pound', 'priceless', 'probable', 'progress', 'promote', 'publish',
        'punish', 'raise', 'rare', 'recognize', 'refuse', 'remind', 'require', 'risk', 'rosy',
        'satellite', 'sculpture', 'seafood', 'select', 'separate', 'serious', 'shake', 'sheet',
        'shoulder', 'shy', 'sore', 'spaceflight', 'spare', 'speech', 'spirits', 'stage', 'stick',
        'structure', 'supply', 'suppose', 'temperature', 'tent', 'theme', 'thirsty', 'throat',
        'throw', 'truly', 'typical', 'ugly', 'uncomfortable', 'unfortunately', 'unnecessary',
        'value', 'volunteer', 'warning', 'wave', 'whether', 'worth', 'youth'
    ],
    '9-1': [
        'America', 'abroad', 'accuse', 'achievement', 'action', 'adventure', 'afford', 'album',
        'among', 'annoying', 'applause', 'artist', 'ashamed', 'astronomer', 'beat', 'beef',
        'bill', 'board', 'bowl', 'boxing', 'braces', 'brave', 'business', 'careful', 'careless',
        'celebrated', 'cent', 'certain', 'cola', 'comb', 'comment', 'confirmation',
        'congratulations', 'consider', 'contestant', 'correct', 'customer', 'daughter', 'deal',
        'decision', 'diet', 'director', 'displace', 'doubt', 'draw', 'event', 'exactly', 'exam',
        'expect', 'fail', 'fashion', 'fashionable', 'fill', 'forward', 'frog', 'genius', 'gift',
        'golden', 'goods', 'graduation', 'hamburger', 'hate', 'hit', 'invitation', 'invite',
        'iron', 'knee', 'lazy', 'lead', 'mad', 'meal', 'medical', 'mess', 'metal', 'mind',
        'mistake', 'model', 'necessary', 'news', 'none', 'note', 'novel', 'online', 'onto',
        'pale', 'personal', 'philosopher', 'pie', 'pity', 'plot', 'polite', 'possessions', 'pot',
        'pound', 'praise', 'preference', 'present', 'pretend', 'prison', 'progress', 'protein',
        'racing', 'real', 'reduce', 'regret', 'relationship', 'relaxed', 'request', 'research',
        'rest', 'review', 'salad', 'sandwich', 'seat', 'second', 'seem', 'sense', 'serve',
        'service', 'set', 'silence', 'single', 'situation', 'solve', 'state', 'steam',
        'steamboat', 'step', 'sugar', 'suggest', 'suppose', 'survey', 'sympathy', 'task',
        'theory', 'tonight', 'trust', 'truth', 'type', 'universe', 'university', 'upon', 'usual',
        'victory', 'view', 'while', 'writer', 'yard'
    ],
    '9-2': [
        'Africa', 'American', 'Australia', 'Australian', 'Canada', 'Canadian', 'admiration',
        'admit', 'adult', 'adventure', 'alive', 'announcement', 'anyway', 'arrive', 'asteroid',
        'atmosphere', 'autumn', 'awake', 'bad', 'badly', 'badminton', 'baseball', 'besides',
        'boss', 'bright', 'camp', 'cancel', 'cancer', 'coach', 'coal', 'concern', 'concert',
        'conduct', 'consumer', 'continent', 'couple', 'dead', 'deaf', 'degree', 'dentist',
        'destroy', 'develop', 'development', 'discovery', 'earthquake', 'education', 'enemy',
        'enter', 'especially', 'everyday', 'eyesight', 'fail', 'fee', 'fellow', 'final',
        'firework', 'fleet', 'flood', 'focus', 'force', 'foreign', 'friendly', 'fuel', 'gentle',
        'giraffe', 'glove', 'government', 'green', 'guard', 'guess', 'habit', 'honest', 'idiom',
        'immediately', 'increase', 'international', 'lifeless', 'lifestyle', 'line', 'low',
        'manage', 'melt', 'missing', 'national', 'nature', 'notice', 'nowhere', 'object',
        'official', 'opposite', 'over', 'pass', 'passport', 'peer', 'people', 'pink', 'pioneer',
        'pool', 'positive', 'pound', 'preserve', 'president', 'pressure', 'priceless', 'private',
        'probable', 'proper', 'purple', 'purpose', 'quarrel', 'rapid', 'recovery', 'recycle',
        'region', 'regular', 'relation', 'repetition', 'resort', 'result', 'rise', 'risk', 'rope',
        'route', 'schedule', 'screen', 'sea level', 'shame', 'silent', 'silk', 'slope', 'soil',
        'solution', 'spare', 'spread', 'stare', 'state', 'stress', 'surface', 'temperature',
        'trade', 'turkey', 'typhoon', 'uniform', 'vacation', 'voyage', 'wealth', 'whatever',
        'whether'
    ]
};

// 年级名称映射
const gradeNames = {
    '1-3': '1-3年级',
    '4-1': '4年级上',
    '4-2': '4年级下',
    '5-1': '5年级上',
    '5-2': '5年级下',
    '6-1': '6年级上',
    '6-2': '6年级下',
    '7-1': '7年级上',
    '7-2': '7年级下',
    '8-1': '8年级上',
    '8-2': '8年级下',
    '9-1': '9年级上',
    '9-2': '9年级下'
};

// 年级文件夹路径映射
const gradePaths = {
    '1-3': 'assets/audio',
    '4-1': 'assets/grade4_1',
    '4-2': 'assets/grade4_2',
    '5-1': 'assets/grade5_1',
    '5-2': 'assets/grade5_2',
    '6-1': 'assets/grade6_1',
    '6-2': 'assets/grade6_2',
    '7-1': 'assets/grade7_1',
    '7-2': 'assets/grade7_2',
    '8-1': 'assets/grade8_1',
    '8-2': 'assets/grade8_2',
    '9-1': 'assets/grade9_1',
    '9-2': 'assets/grade9_2'
};

// 默认选中的年级
let selectedGrade = localStorage.getItem('selectedGrade') || '1-3';

// 当前使用的单词列表
let allWords = gradeWords[selectedGrade];

// 获取当前年级的音频路径
function getAudioPath() {
    return gradePaths[selectedGrade] || 'assets/audio';
}

// 切换年级
function selectGrade(grade) {
    if (gradeWords[grade]) {
        selectedGrade = grade;
        allWords = gradeWords[grade];
        localStorage.setItem('selectedGrade', grade);
        console.log('切换到年级:', gradeNames[grade], '单词数量:', allWords.length);
        return true;
    }
    return false;
}

// 导出单词列表
if (typeof module !== 'undefined' && module.exports) {
    module.exports = allWords;
}