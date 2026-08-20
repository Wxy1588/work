// 从“语法”PDF 中自动提取：仅包含选择题。
// 每道题仅保留题干、正确选项、错误选项和知识点。
const grammarQuestionBank = {
  "七年级": {
    "上册": [
      {
        "stem": "—________ do you like sports? —Because they can make me healthy.",
        "correctOption": "Why",
        "wrongOptions": [
          "What",
          "Where",
          "When"
        ],
        "knowledgePoint": "wh-特殊疑问句"
      },
      {
        "stem": "—________ are they talking to? —I am not sure. Maybe a new teacher.",
        "correctOption": "Who",
        "wrongOptions": [
          "What",
          "When",
          "Where"
        ],
        "knowledgePoint": "wh-特殊疑问句"
      },
      {
        "stem": "—________ is the meeting? —At 4:00 in the afternoon.",
        "correctOption": "When",
        "wrongOptions": [
          "What",
          "Why",
          "Where"
        ],
        "knowledgePoint": "wh-特殊疑问句"
      },
      {
        "stem": "— ________ do you do in the evening? — I do my homework or watch TV.",
        "correctOption": "What",
        "wrongOptions": [
          "When",
          "Where",
          "Why"
        ],
        "knowledgePoint": "wh-特殊疑问句"
      },
      {
        "stem": "—________ are koalas from? —Australia.",
        "correctOption": "Where",
        "wrongOptions": [
          "When",
          "What",
          "Why"
        ],
        "knowledgePoint": "wh-特殊疑问句"
      },
      {
        "stem": "—________ animals do you like? —I like pandas from China.",
        "correctOption": "What",
        "wrongOptions": [
          "Where",
          "Why",
          "When"
        ],
        "knowledgePoint": "wh-特殊疑问句"
      },
      {
        "stem": "—________ do you like dolphins? —Because they are very smart.",
        "correctOption": "Why",
        "wrongOptions": [
          "Where",
          "When",
          "What"
        ],
        "knowledgePoint": "wh-特殊疑问句"
      },
      {
        "stem": "Our school ______ the library for students every weekday.",
        "correctOption": "opens",
        "wrongOptions": [
          "opened",
          "will open",
          "is opening"
        ],
        "knowledgePoint": "含实义动词的一般现在时结构"
      },
      {
        "stem": "Sarah often ______ AI for painting and it brings her a fresh experience.",
        "correctOption": "uses",
        "wrongOptions": [
          "used",
          "will use",
          "is using"
        ],
        "knowledgePoint": "含实义动词的一般现在时结构"
      },
      {
        "stem": "Where ________ Kate and Michael study?",
        "correctOption": "do",
        "wrongOptions": [
          "is",
          "are",
          "does"
        ],
        "knowledgePoint": "含实义动词的一般现在时结构"
      },
      {
        "stem": "“6” ________ a lucky number.",
        "correctOption": "is",
        "wrongOptions": [
          "am",
          "are",
          "be"
        ],
        "knowledgePoint": "含be动词的一般现在时结构"
      },
      {
        "stem": "-Is his name Jim Green? -________.",
        "correctOption": "No, it isn’t",
        "wrongOptions": [
          "Yes, he is",
          "No, he isn’t",
          "Yes, it isn’t"
        ],
        "knowledgePoint": "含be动词的一般现在时结构"
      },
      {
        "stem": "-Are you Lucy? -________.",
        "correctOption": "Yes, I am",
        "wrongOptions": [
          "Yes, she is",
          "Yes, I’m",
          "No, she isn’t"
        ],
        "knowledgePoint": "含be动词的一般现在时结构"
      },
      {
        "stem": "-________ the ruler on the sofa? -No, it isn’t.",
        "correctOption": "Is",
        "wrongOptions": [
          "Do",
          "Does",
          "Are"
        ],
        "knowledgePoint": "含be动词的一般现在时结构"
      },
      {
        "stem": "— Did you go to the cinema to see 3D Titanic last night? — No, I ________ go to the cinema. The tickets are too expensive.",
        "correctOption": "hardly",
        "wrongOptions": [
          "nearly",
          "still",
          "only"
        ],
        "knowledgePoint": "频度副词"
      },
      {
        "stem": "I _________ ride a bike to school. But this morning, I walked to school.",
        "correctOption": "usually",
        "wrongOptions": [
          "never",
          "hardly",
          "seldom"
        ],
        "knowledgePoint": "频度副词"
      },
      {
        "stem": "—Do you like eating junk food, Jack? —No. I ________ eat it. It’s bad for our health.",
        "correctOption": "never",
        "wrongOptions": [
          "often",
          "always",
          "sometimes"
        ],
        "knowledgePoint": "频度副词"
      },
      {
        "stem": "He ________ the first student to arrive because he ________ up early.",
        "correctOption": "is always, always gets",
        "wrongOptions": [
          "is always, gets always",
          "always is, gets always",
          "always is, always gets"
        ],
        "knowledgePoint": "频度副词"
      },
      {
        "stem": "________ we go to the cinema and at other times we go for a walk.",
        "correctOption": "Sometimes",
        "wrongOptions": [
          "Some times",
          "Sometime",
          "Some time"
        ],
        "knowledgePoint": "频度副词"
      },
      {
        "stem": "—Peter, you got to school by taxi? —Oh, I _______ take a taxi to school, but my bike needs repairing(修理) today.",
        "correctOption": "seldom",
        "wrongOptions": [
          "usually",
          "sometimes",
          "often"
        ],
        "knowledgePoint": "频度副词"
      },
      {
        "stem": "“We usually play basketball on the playground.”这句话中,一般现在时的时间标志是:________",
        "correctOption": "usually",
        "wrongOptions": [
          "we",
          "play basketball",
          "on the playground"
        ],
        "knowledgePoint": "一般现在时的用法"
      },
      {
        "stem": "Most students read English books ________.",
        "correctOption": "every day",
        "wrongOptions": [
          "everyday",
          "every days",
          "everydays"
        ],
        "knowledgePoint": "一般现在时的用法"
      },
      {
        "stem": "Lucy is very ________. She always helps others.",
        "correctOption": "kind",
        "wrongOptions": [
          "difficult",
          "cold",
          "beautiful"
        ],
        "knowledgePoint": "形容词的功能"
      },
      {
        "stem": "It's difficult _________ this map.",
        "correctOption": "to understand",
        "wrongOptions": [
          "understanding",
          "understands",
          "understood"
        ],
        "knowledgePoint": "形容词的功能"
      },
      {
        "stem": "—_______ there any restaurants around here? —No, there _______.",
        "correctOption": "Are; aren’t",
        "wrongOptions": [
          "Are; are",
          "Is; isn’t",
          "Is; is"
        ],
        "knowledgePoint": "there be的句型结构"
      },
      {
        "stem": "How many boys ________ in the classroom?",
        "correctOption": "are there",
        "wrongOptions": [
          "there are",
          "are they",
          "is there"
        ],
        "knowledgePoint": "there be的句型结构"
      },
      {
        "stem": "—There _______ many foreign students in her class. —Yes. I know two of them are Japanese.",
        "correctOption": "are",
        "wrongOptions": [
          "is",
          "am",
          "be"
        ],
        "knowledgePoint": "there be句型be动词的选用"
      },
      {
        "stem": "There ________ a set of keys on the desk.",
        "correctOption": "is",
        "wrongOptions": [
          "am",
          "are",
          "has"
        ],
        "knowledgePoint": "there be句型be动词的选用"
      },
      {
        "stem": "There ________ a dictionary on the desk.",
        "correctOption": "is",
        "wrongOptions": [
          "am",
          "are",
          "be"
        ],
        "knowledgePoint": "there be句型be动词的选用"
      },
      {
        "stem": "There ________ some ice-cream on the top of the cake.",
        "correctOption": "is",
        "wrongOptions": [
          "are",
          "be"
        ],
        "knowledgePoint": "there be句型be动词的选用"
      },
      {
        "stem": "There _______ two banks and a hotel on Centre Street.",
        "correctOption": "are",
        "wrongOptions": [
          "is",
          "am",
          "be"
        ],
        "knowledgePoint": "there be句型be动词的选用"
      },
      {
        "stem": "There _______ a small post office and some bookstores in the school.",
        "correctOption": "is",
        "wrongOptions": [
          "are",
          "am",
          "be"
        ],
        "knowledgePoint": "there be句型be动词的选用"
      },
      {
        "stem": "There ________ some beef, tomatoes and tofu in the basket.",
        "correctOption": "is",
        "wrongOptions": [
          "are",
          "am"
        ],
        "knowledgePoint": "there be句型be动词的选用"
      },
      {
        "stem": "给下列一般将来时句子选出对应的时间标志。 My father will buy a new car for me ________.",
        "correctOption": "next year",
        "wrongOptions": [
          "every year",
          "usually"
        ],
        "knowledgePoint": "一般将来时will"
      },
      {
        "stem": "给下列一般将来时句子选出对应的时间标志。 They will learn a lot about Chinese history ________.",
        "correctOption": "in the future",
        "wrongOptions": [
          "sometimes",
          "every month"
        ],
        "knowledgePoint": "一般将来时will"
      },
      {
        "stem": "My parents and I ______ a big dinner tomorrow evening.",
        "correctOption": "will have",
        "wrongOptions": [
          "have",
          "had",
          "has"
        ],
        "knowledgePoint": "一般将来时will"
      },
      {
        "stem": "She ________ come to have class tomorrow.",
        "correctOption": "won't",
        "wrongOptions": [
          "is",
          "willn't"
        ],
        "knowledgePoint": "一般将来时will"
      },
      {
        "stem": "He wants to play games, but I ________ with him.",
        "correctOption": "won't go",
        "wrongOptions": [
          "will going",
          "won't going"
        ],
        "knowledgePoint": "一般将来时will"
      },
      {
        "stem": "—________ you go shopping this Saturday? —No, we won’t. We will camp in the mountains.",
        "correctOption": "Will",
        "wrongOptions": [
          "Do",
          "Did",
          "Were"
        ],
        "knowledgePoint": "一般将来时will"
      },
      {
        "stem": "—Will your parents go to visit the Great Wall next year? —No, ________.",
        "correctOption": "they won’t",
        "wrongOptions": [
          "they willn’t",
          "they aren’t",
          "they don’t"
        ],
        "knowledgePoint": "一般将来时will"
      },
      {
        "stem": "—Where ________ you go tomorrow, Lisa? —I will go to a big party.",
        "correctOption": "will",
        "wrongOptions": [
          "have gone",
          "went",
          "are"
        ],
        "knowledgePoint": "一般将来时will"
      },
      {
        "stem": "—What will you do this weekend? —I ________ some friends to my home.",
        "correctOption": "will invite",
        "wrongOptions": [
          "invited",
          "invites",
          "inviting"
        ],
        "knowledgePoint": "一般将来时will"
      },
      {
        "stem": "给下列一般将来时句子选出对应的时间标志。 I am going to visit my grandparents ________.",
        "correctOption": "tomorrow",
        "wrongOptions": [
          "every month",
          "always"
        ],
        "knowledgePoint": "一般将来时be going to"
      },
      {
        "stem": "给下列一般将来时句子选出对应的时间标志。 Look at the dark clouds! It is going to rain _________.",
        "correctOption": "soon",
        "wrongOptions": [
          "often",
          "every day"
        ],
        "knowledgePoint": "一般将来时be going to"
      },
      {
        "stem": "I ________ my homework in ten minutes.",
        "correctOption": "am not going to finish",
        "wrongOptions": [
          "is not going to finish",
          "am finishing to",
          "am going to finishing"
        ],
        "knowledgePoint": "一般将来时be going to"
      },
      {
        "stem": "________ Jack ________ to get up late and then read a book tomorrow?",
        "correctOption": "Is; going",
        "wrongOptions": [
          "Does; going",
          "Are; going",
          "Is; go"
        ],
        "knowledgePoint": "一般将来时be going to"
      },
      {
        "stem": "— Is Jenny going to have a picnic on the beach? —________",
        "correctOption": "No, she isn’t.",
        "wrongOptions": [
          "Yes, Jenny is.",
          "Yes, she can.",
          "No, she doesn’t."
        ],
        "knowledgePoint": "一般将来时be going to"
      },
      {
        "stem": "— When ________ Henry ________ Hainan Island (海南岛)? — Next Sunday.",
        "correctOption": "is; going to visit",
        "wrongOptions": [
          "did; visit",
          "do; visit",
          "does; visit"
        ],
        "knowledgePoint": "一般将来时be going to"
      },
      {
        "stem": "— You won’t pass the exam(考试) ________ you don’t work hard. — OK, I’ll do my best.",
        "correctOption": "if",
        "wrongOptions": [
          "and",
          "but",
          "so"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "If it is sunny, we ________ the mountains.",
        "correctOption": "will climb",
        "wrongOptions": [
          "climb",
          "climbed"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "You ________ a lot of good friends if you are kind to others.",
        "correctOption": "will make",
        "wrongOptions": [
          "make",
          "made",
          "have made"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "If I ________ time tomorrow, I will clean the room.",
        "correctOption": "have",
        "wrongOptions": [
          "will have",
          "had",
          "am having"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "If it ________ tomorrow, we ________ to play basketball in the playground.",
        "correctOption": "doesn’t rain; will go",
        "wrongOptions": [
          "won’t rain; go",
          "won’t rain; will go",
          "doesn’t rain; go"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "You should see a doctor if you ________ feel well.",
        "correctOption": "don't",
        "wrongOptions": [
          "didn't",
          "will not"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "If you _________ the food into your mouth in the lab, you may eat some of dangerous things.",
        "correctOption": "put",
        "wrongOptions": [
          "will put",
          "puts"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "给下列一般过去时句子选出对应的时间标志。 Mr Li came to Shanghai ________.",
        "correctOption": "3 years ago",
        "wrongOptions": [
          "every year",
          "next year"
        ],
        "knowledgePoint": "一般过去时的用法"
      },
      {
        "stem": "给下面一般过去时的句子选出对应的时间标志。 Tom visited his grandpa ________.",
        "correctOption": "last week",
        "wrongOptions": [
          "on weekends",
          "every week",
          "tomorrow morning"
        ],
        "knowledgePoint": "一般过去时的用法"
      },
      {
        "stem": "给下列一般过去时句子选出对应的时间标志。 She watered the flowers ________.",
        "correctOption": "yesterday morning",
        "wrongOptions": [
          "tomorrow",
          "sometimes",
          "twice a week"
        ],
        "knowledgePoint": "一般过去时的用法"
      },
      {
        "stem": "—Were your parents at work yesterday? —________.",
        "correctOption": "Yes, they were",
        "wrongOptions": [
          "Yes, they wasn’t",
          "No, they were",
          "No, they wasn’t"
        ],
        "knowledgePoint": "含be动词的一般过去时结构"
      },
      {
        "stem": "—________ you at school last night? —No, I ________ at home.",
        "correctOption": "Were; was",
        "wrongOptions": [
          "Was; was",
          "Were; were"
        ],
        "knowledgePoint": "含be动词的一般过去时结构"
      },
      {
        "stem": "—________ your sister in Zhejiang in 2013? —Yes, she ________.",
        "correctOption": "Was; was",
        "wrongOptions": [
          "Were; were",
          "Is; is",
          "Does; does"
        ],
        "knowledgePoint": "含be动词的一般过去时结构"
      },
      {
        "stem": "— Where did you take these beautiful photos? — I ______ them in the park.",
        "correctOption": "took",
        "wrongOptions": [
          "take",
          "will take",
          "am taking"
        ],
        "knowledgePoint": "含实义动词的一般过去时结构"
      },
      {
        "stem": "Last month,we ______ Hangzhou and had a great time there.",
        "correctOption": "visited",
        "wrongOptions": [
          "visit",
          "are visiting",
          "will visit"
        ],
        "knowledgePoint": "含实义动词的一般过去时结构"
      },
      {
        "stem": "—Did they watch TV last night? —________. They went to see the movies.",
        "correctOption": "No, they didn’t",
        "wrongOptions": [
          "Yes, they did",
          "Yes, they didn’t",
          "No, they did"
        ],
        "knowledgePoint": "含实义动词的一般过去时结构"
      },
      {
        "stem": "— Did you see any flowers in the garden? — ________.",
        "correctOption": "Yes, we did",
        "wrongOptions": [
          "Yes, we do",
          "No, we don’t",
          "No, we’re not"
        ],
        "knowledgePoint": "含实义动词的一般过去时结构"
      },
      {
        "stem": "—Where ________ you ________ yesterday? —I went to a zoo.",
        "correctOption": "did; go",
        "wrongOptions": [
          "was; go",
          "do; go",
          "did; went"
        ],
        "knowledgePoint": "含实义动词的一般过去时结构"
      },
      {
        "stem": "— When ________ you ________ your old friend? — The day before yesterday.",
        "correctOption": "did; visit",
        "wrongOptions": [
          "will; visit",
          "was; visit",
          "were; visit"
        ],
        "knowledgePoint": "含实义动词的一般过去时结构"
      },
      {
        "stem": "My sister Amy likes singing. ________ is in the music club.",
        "correctOption": "She",
        "wrongOptions": [
          "His",
          "He"
        ],
        "knowledgePoint": "人称代词"
      },
      {
        "stem": "—Amy, who is the young man in the photo? —________ is my uncle.",
        "correctOption": "He",
        "wrongOptions": [
          "She",
          "We"
        ],
        "knowledgePoint": "人称代词"
      },
      {
        "stem": "My sister and I like sports. _________ often go swimming after school.",
        "correctOption": "We",
        "wrongOptions": [
          "I",
          "You",
          "They"
        ],
        "knowledgePoint": "人称代词"
      },
      {
        "stem": "Who is the boy over there? Do you know ________?",
        "correctOption": "him",
        "wrongOptions": [
          "he",
          "his",
          "that"
        ],
        "knowledgePoint": "人称代词"
      },
      {
        "stem": "Peter is a nice boy. We all want to play with ________.",
        "correctOption": "him",
        "wrongOptions": [
          "me",
          "her",
          "them"
        ],
        "knowledgePoint": "人称代词"
      },
      {
        "stem": "Jack is my friend. ________ father is a teacher.",
        "correctOption": "His",
        "wrongOptions": [
          "He",
          "He’s",
          "Her"
        ],
        "knowledgePoint": "形容词性物主代词"
      },
      {
        "stem": "My brother loves music, and ______ guitar sounds amazing.",
        "correctOption": "his",
        "wrongOptions": [
          "your",
          "their",
          "her"
        ],
        "knowledgePoint": "形容词性物主代词"
      },
      {
        "stem": "My brother likes reading and ______ favourite book is Charlie and the Chocolate Factory.",
        "correctOption": "his",
        "wrongOptions": [
          "your",
          "their",
          "her"
        ],
        "knowledgePoint": "形容词性物主代词"
      },
      {
        "stem": "________ is Dave. I’m ________ brother.",
        "correctOption": "He; his",
        "wrongOptions": [
          "She; her",
          "She; his",
          "He; her"
        ],
        "knowledgePoint": "形容词性物主代词"
      },
      {
        "stem": "-Excuse me, are these ________ English books? -No, they are ________ English books.",
        "correctOption": "your; her",
        "wrongOptions": [
          "my; she",
          "your; he",
          "he; her"
        ],
        "knowledgePoint": "形容词性物主代词"
      },
      {
        "stem": "I can't find my pen. Can I use ________?",
        "correctOption": "yours",
        "wrongOptions": [
          "you",
          "my",
          "mine"
        ],
        "knowledgePoint": "名词性物主代词"
      },
      {
        "stem": "— Is this __________ eraser? — Yes, it is. __________ is in the box.",
        "correctOption": "her; Mine",
        "wrongOptions": [
          "yours; His",
          "hers; My",
          "us; Them"
        ],
        "knowledgePoint": "名词性物主代词"
      },
      {
        "stem": "— Are these ________ English books? — No. They’re ________ .",
        "correctOption": "her; his",
        "wrongOptions": [
          "your; my",
          "his; her",
          "you; mine"
        ],
        "knowledgePoint": "名词性物主代词"
      },
      {
        "stem": "—Is this the Greens' house? —No. ________ is over here.",
        "correctOption": "Theirs",
        "wrongOptions": [
          "His",
          "Their",
          "Them"
        ],
        "knowledgePoint": "形物代和名物代的辨析"
      },
      {
        "stem": "—Is this your e-book? —No, ________ is in the schoolbag.",
        "correctOption": "mine",
        "wrongOptions": [
          "it",
          "yours",
          "my"
        ],
        "knowledgePoint": "形物代和名物代的辨析"
      },
      {
        "stem": "—Is that ________ schoolbag? —No. ________ is white.",
        "correctOption": "his; His",
        "wrongOptions": [
          "her; His",
          "he; His",
          "her; Her"
        ],
        "knowledgePoint": "形物代和名物代的辨析"
      }
    ],
    "下册": [
      {
        "stem": "Can you see ________ man over there? He’s our new English teacher.",
        "correctOption": "the",
        "wrongOptions": [
          "a",
          "an"
        ],
        "knowledgePoint": "定冠词"
      },
      {
        "stem": "This is ________ orange. ________ orange is ________ orange.",
        "correctOption": "an; The; /",
        "wrongOptions": [
          "an; A; a",
          "a; An; a",
          "a; A; an"
        ],
        "knowledgePoint": "定冠词"
      },
      {
        "stem": "There's ________ alarm on Mark's desk. ________ alarm goes off at 7 o'clock every morning.",
        "correctOption": "an; The",
        "wrongOptions": [
          "an; An",
          "the; An",
          "the; The"
        ],
        "knowledgePoint": "定冠词"
      },
      {
        "stem": "That is ________ eraser and ________ eraser is blue.",
        "correctOption": "an; the",
        "wrongOptions": [
          "a; a",
          "an; an",
          "the; an"
        ],
        "knowledgePoint": "定冠词"
      },
      {
        "stem": "________ moon goes around ________ earth.",
        "correctOption": "The; the",
        "wrongOptions": [
          "The; an",
          "A; the",
          "An; a"
        ],
        "knowledgePoint": "定冠词"
      },
      {
        "stem": "The little girl began to play ________ violin at the age of five.",
        "correctOption": "the",
        "wrongOptions": [
          "a",
          "/"
        ],
        "knowledgePoint": "定冠词"
      },
      {
        "stem": "In ________ end, his dream came true because he worked hard.",
        "correctOption": "the",
        "wrongOptions": [
          "a",
          "an",
          "/"
        ],
        "knowledgePoint": "定冠词"
      },
      {
        "stem": "— What vegetables do you like? — I like carrots ________ tomatoes.",
        "correctOption": "and",
        "wrongOptions": [
          "or",
          "but",
          "so"
        ],
        "knowledgePoint": "基础连词"
      },
      {
        "stem": "Please come _______ have dinner with us.",
        "correctOption": "and",
        "wrongOptions": [
          "or",
          "but",
          "so"
        ],
        "knowledgePoint": "基础连词"
      },
      {
        "stem": "I want to eat ice cream, ______ my mum says it's too cold.",
        "correctOption": "but",
        "wrongOptions": [
          "and",
          "for",
          "or"
        ],
        "knowledgePoint": "基础连词"
      },
      {
        "stem": "We are not in the same class, ________ we are friends.",
        "correctOption": "but",
        "wrongOptions": [
          "so",
          "because"
        ],
        "knowledgePoint": "基础连词"
      },
      {
        "stem": "Lily is badly ill, ________ she has to stay at home.",
        "correctOption": "so",
        "wrongOptions": [
          "or",
          "but",
          "if"
        ],
        "knowledgePoint": "基础连词"
      },
      {
        "stem": "—Listen! What’s that noise? —My mother ________ dinner in the kitchen.",
        "correctOption": "is making",
        "wrongOptions": [
          "makes",
          "made"
        ],
        "knowledgePoint": "现在进行时的用法"
      },
      {
        "stem": "The children ________ in the pool right now.",
        "correctOption": "are swimming",
        "wrongOptions": [
          "is swimming",
          "swim",
          "are swim"
        ],
        "knowledgePoint": "现在进行时的用法"
      },
      {
        "stem": "It’s 10 a.m. Tom ________ in his room now.",
        "correctOption": "is reading",
        "wrongOptions": [
          "reads",
          "read",
          "reading"
        ],
        "knowledgePoint": "现在进行时的用法"
      },
      {
        "stem": "Look! The children ________ their classroom!",
        "correctOption": "are cleaning",
        "wrongOptions": [
          "cleaned",
          "is going to clean",
          "cleans"
        ],
        "knowledgePoint": "现在进行时的用法"
      },
      {
        "stem": "The final tests are coming, and the students ________ hard for them these days.",
        "correctOption": "are studying",
        "wrongOptions": [
          "study",
          "will study",
          "studied"
        ],
        "knowledgePoint": "现在进行时的用法"
      },
      {
        "stem": "He ________ English these days.",
        "correctOption": "is learning",
        "wrongOptions": [
          "learn",
          "learn",
          "will learn"
        ],
        "knowledgePoint": "现在进行时的用法"
      },
      {
        "stem": "—What are you busy with? —Nothing much. I newspapers these days.",
        "correctOption": "am reading",
        "wrongOptions": [
          "read",
          "reads",
          "reading"
        ],
        "knowledgePoint": "现在进行时的用法"
      },
      {
        "stem": "Look! They ________ in the hallway.",
        "correctOption": "are running",
        "wrongOptions": [
          "run",
          "running",
          "is running"
        ],
        "knowledgePoint": "现在进行时的句型结构"
      },
      {
        "stem": "Look! The boys ______ basketball on the playground.",
        "correctOption": "are playing",
        "wrongOptions": [
          "play",
          "played",
          "will play"
        ],
        "knowledgePoint": "现在进行时的句型结构"
      },
      {
        "stem": "Look! The students ______ butterflies in the garden now.",
        "correctOption": "are studying",
        "wrongOptions": [
          "study",
          "studied",
          "will study"
        ],
        "knowledgePoint": "现在进行时的句型结构"
      },
      {
        "stem": "—________ you ________ a book? —Yes, I am.",
        "correctOption": "Are; reading",
        "wrongOptions": [
          "Do; read",
          "Are; read",
          "Are; looking"
        ],
        "knowledgePoint": "现在进行时的句型结构"
      },
      {
        "stem": "—Are they visiting the Great Wall right now? —No, they ________.",
        "correctOption": "aren’t",
        "wrongOptions": [
          "don’t",
          "isn’t",
          "doesn’t"
        ],
        "knowledgePoint": "现在进行时的句型结构"
      },
      {
        "stem": "—________? —She is reading a story book.",
        "correctOption": "What is Nancy doing",
        "wrongOptions": [
          "What does she do",
          "What is she",
          "What are you doing"
        ],
        "knowledgePoint": "现在进行时的句型结构"
      },
      {
        "stem": "—This is Ben speaking. Can I speak to Mrs. Green? —I’m sorry. She ________ in the kitchen and you can call again later.",
        "correctOption": "is cooking",
        "wrongOptions": [
          "cooks",
          "doesn’t cook",
          "isn’t cooking"
        ],
        "knowledgePoint": "现在进行时和一般现在时的辨析"
      },
      {
        "stem": "My mother ________ soup now and she often ________ it for us.",
        "correctOption": "is making; makes",
        "wrongOptions": [
          "making; makes",
          "makes; makes",
          "is making; is making"
        ],
        "knowledgePoint": "现在进行时和一般现在时的辨析"
      },
      {
        "stem": "你自己",
        "correctOption": "yourself",
        "wrongOptions": [
          "you",
          "yourselves"
        ],
        "knowledgePoint": "反身代词"
      },
      {
        "stem": "Don’t play with the knife, or you’ll cut ________.",
        "correctOption": "yourself",
        "wrongOptions": [
          "itself",
          "ourselves"
        ],
        "knowledgePoint": "反身代词"
      },
      {
        "stem": "On the way home, Lisa bought ________ two pieces of cake and some coffee.",
        "correctOption": "herself",
        "wrongOptions": [
          "she",
          "hers",
          "her"
        ],
        "knowledgePoint": "反身代词"
      },
      {
        "stem": "I made the cake by ________. Help ________, Tom.",
        "correctOption": "myself; yourself",
        "wrongOptions": [
          "me; him",
          "myself; you",
          "ourselves; yourself"
        ],
        "knowledgePoint": "反身代词"
      },
      {
        "stem": "Our first English class started with introducing ________.",
        "correctOption": "ourselves",
        "wrongOptions": [
          "us",
          "we",
          "ours"
        ],
        "knowledgePoint": "反身代词"
      },
      {
        "stem": "—Where is your music room? —It's the third floor.",
        "correctOption": "on",
        "wrongOptions": [
          "in",
          "at",
          "for"
        ],
        "knowledgePoint": "方位介词in/on/under"
      },
      {
        "stem": "We planted some flowers ________ the garden yesterday.",
        "correctOption": "in",
        "wrongOptions": [
          "on",
          "to"
        ],
        "knowledgePoint": "方位介词in/on/under"
      },
      {
        "stem": "—Mom, where are my shoes? —They are ________ your bed.",
        "correctOption": "under",
        "wrongOptions": [
          "to",
          "at",
          "of"
        ],
        "knowledgePoint": "方位介词in/on/under"
      },
      {
        "stem": "It is the first bridge __________ the river.",
        "correctOption": "over",
        "wrongOptions": [
          "under",
          "behind",
          "above"
        ],
        "knowledgePoint": "方位介词表示在 ......上/下"
      },
      {
        "stem": "The tower rises (耸立) ________ the trees. On top of it, you can see the town ________.",
        "correctOption": "above; below",
        "wrongOptions": [
          "above; under",
          "over; under",
          "over; below"
        ],
        "knowledgePoint": "方位介词表示在 ......上/下"
      },
      {
        "stem": "The painting is ________ the wall ________ the sofa.",
        "correctOption": "on; above",
        "wrongOptions": [
          "on; in",
          "in; under"
        ],
        "knowledgePoint": "方位介词表示在 ......上/下"
      },
      {
        "stem": "In the picture, the trees are ________ the house.",
        "correctOption": "behind",
        "wrongOptions": [
          "in front of",
          "at the back of",
          "across from"
        ],
        "knowledgePoint": "方位介词表示在 ......前/后"
      },
      {
        "stem": "David sits ________ Lucy. He is very tall, so she can’t see the screen.",
        "correctOption": "in front of",
        "wrongOptions": [
          "behind",
          "near",
          "next to"
        ],
        "knowledgePoint": "方位介词表示在 ......前/后"
      },
      {
        "stem": "Look! Betty is drawing pictures on the blackboard ________ the classroom.",
        "correctOption": "at the back of",
        "wrongOptions": [
          "behind",
          "in front of"
        ],
        "knowledgePoint": "方位介词表示在 ......前/后"
      },
      {
        "stem": "There are some trees _______ the classroom and there is a blackboard _______ it.",
        "correctOption": "in front of; in the front of",
        "wrongOptions": [
          "in front of; in front of",
          "in the front of; in the front of",
          "in the front of; in front of"
        ],
        "knowledgePoint": "方位介词表示在 ......前/后"
      },
      {
        "stem": "There is a picture ________ the wall and a desk ________ the window.",
        "correctOption": "on; near",
        "wrongOptions": [
          "on; in",
          "in; near"
        ],
        "knowledgePoint": "方位介词表示在 ......旁/间"
      },
      {
        "stem": "Wang Kai is sitting ________ the pool, and his sister is skating ________ a river.",
        "correctOption": "by; on",
        "wrongOptions": [
          "on; by",
          "on; on",
          "by; in"
        ],
        "knowledgePoint": "方位介词表示在 ......旁/间"
      },
      {
        "stem": "—Who is the boy _______ Simon? —Tom, a new classmate.",
        "correctOption": "next to",
        "wrongOptions": [
          "in front",
          "next",
          "in the front of"
        ],
        "knowledgePoint": "方位介词表示在 ......旁/间"
      },
      {
        "stem": "Don’t ride _______ me. It’s not safe to ride side by side.",
        "correctOption": "beside",
        "wrongOptions": [
          "before",
          "after",
          "behind"
        ],
        "knowledgePoint": "方位介词表示在 ......旁/间"
      },
      {
        "stem": "Look at the map. There is a post office _______ the library and the bank.",
        "correctOption": "between",
        "wrongOptions": [
          "on",
          "across",
          "next"
        ],
        "knowledgePoint": "方位介词表示在 ......旁/间"
      },
      {
        "stem": "Thank you for lending (借) me the CD. Now it’s very popular ________ young people.",
        "correctOption": "among",
        "wrongOptions": [
          "between",
          "in",
          "of"
        ],
        "knowledgePoint": "方位介词表示在 ......旁/间"
      },
      {
        "stem": "She has ________ homework this weekend.",
        "correctOption": "much",
        "wrongOptions": [
          "many",
          "too",
          "a lot"
        ],
        "knowledgePoint": "many/much"
      },
      {
        "stem": "There are too ________ rules in the school.",
        "correctOption": "many",
        "wrongOptions": [
          "much",
          "a lot of",
          "some"
        ],
        "knowledgePoint": "many/much"
      },
      {
        "stem": "Jane has ________ hamburgers, but she doesn't have ________ bread.",
        "correctOption": "many; much",
        "wrongOptions": [
          "many; many",
          "much; much",
          "much; many"
        ],
        "knowledgePoint": "many/much"
      },
      {
        "stem": "—________ is the chicken? —Fifty yuan per kilo. ________ do you need?",
        "correctOption": "How much; How much",
        "wrongOptions": [
          "How much; How many",
          "How many; How much",
          "How many; How many"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "________ clubs can a ten-year-old child join?",
        "correctOption": "How many",
        "wrongOptions": [
          "How much"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "We have ________ bread, but we have ________ vegetables. Let’s buy some vegetables in the supermarket.",
        "correctOption": "a little; few",
        "wrongOptions": [
          "a little; a few",
          "few; a little"
        ],
        "knowledgePoint": "few/a few/little/a little"
      },
      {
        "stem": "There are ________ apples on the table. Please help yourselves.",
        "correctOption": "a few",
        "wrongOptions": [
          "few",
          "little",
          "a little"
        ],
        "knowledgePoint": "few/a few/little/a little"
      },
      {
        "stem": "I’m new here, so I have ________ friends here.",
        "correctOption": "few",
        "wrongOptions": [
          "a few",
          "a little"
        ],
        "knowledgePoint": "few/a few/little/a little"
      },
      {
        "stem": "There is ________ news about this movie star in the newspaper. Where can I get some?",
        "correctOption": "little",
        "wrongOptions": [
          "many",
          "a few",
          "a lot"
        ],
        "knowledgePoint": "few/a few/little/a little"
      },
      {
        "stem": "In our school, many students can speak ________ English, but ________ students can speak it well.",
        "correctOption": "a little; few",
        "wrongOptions": [
          "a little; a few",
          "little; few",
          "little; a few"
        ],
        "knowledgePoint": "few/a few/little/a little"
      },
      {
        "stem": "—________ the man over there be Mr Li? —No, it can't be him. Mr Li is much taller.",
        "correctOption": "Can",
        "wrongOptions": [
          "Can't",
          "Should"
        ],
        "knowledgePoint": "情态动词can"
      },
      {
        "stem": "Alice is good at learning languages. She ________ speak Chinese, English and French.",
        "correctOption": "can",
        "wrongOptions": [
          "must",
          "should"
        ],
        "knowledgePoint": "情态动词can"
      },
      {
        "stem": "—Jack, can you sing? —Yes, I ________.",
        "correctOption": "can",
        "wrongOptions": [
          "may",
          "must",
          "need"
        ],
        "knowledgePoint": "情态动词can"
      },
      {
        "stem": "—What can Ma Li do? —She can ________ kung fu.",
        "correctOption": "do",
        "wrongOptions": [
          "doing",
          "to do"
        ],
        "knowledgePoint": "情态动词can"
      },
      {
        "stem": "My little sister ________ now, but she ________ some English songs.",
        "correctOption": "can't swim; can sing",
        "wrongOptions": [
          "can't to swim; can sings",
          "can swims; can't sings",
          "can't swimming; can singing"
        ],
        "knowledgePoint": "情态动词can"
      },
      {
        "stem": "—Tony, can your mum cook any Chinese food? —_______, she _______. She can just cook English food.",
        "correctOption": "No; can’t",
        "wrongOptions": [
          "Yes; can’t",
          "No; can",
          "Yes; can"
        ],
        "knowledgePoint": "情态动词can"
      },
      {
        "stem": "—________ —He can draw.",
        "correctOption": "What can he do?",
        "wrongOptions": [
          "Can he draw?",
          "Does he like drawing?",
          "What does he like?"
        ],
        "knowledgePoint": "情态动词can"
      },
      {
        "stem": "-May I use your telephone? Mine has no electricity. -Sure, you ______. Here it is.",
        "correctOption": "may",
        "wrongOptions": [
          "must",
          "need",
          "have to"
        ],
        "knowledgePoint": "情态动词 may/might"
      },
      {
        "stem": "The red light is on. We ________ cross the road now.",
        "correctOption": "mustn't",
        "wrongOptions": [
          "needn't",
          "should",
          "can"
        ],
        "knowledgePoint": "情态动词must和have to"
      },
      {
        "stem": "—Must I finish my homework now, Mum? —No, you __________. You can do it later.",
        "correctOption": "needn’t",
        "wrongOptions": [
          "mustn’t",
          "can’t",
          "don’t"
        ],
        "knowledgePoint": "情态动词must和have to"
      },
      {
        "stem": "—Must I go there by subway? —_________. You can take a bus, too.",
        "correctOption": "No, you don’t have to.",
        "wrongOptions": [
          "Yes, you must.",
          "No, you mustn’t.",
          "No, you don’t."
        ],
        "knowledgePoint": "情态动词must和have to"
      },
      {
        "stem": "Betty's mother is sick. She ________ stay at home and look after her.",
        "correctOption": "has to",
        "wrongOptions": [
          "have to",
          "will have to",
          "hasn’t"
        ],
        "knowledgePoint": "情态动词must和have to"
      },
      {
        "stem": "We ________ wear our school uniforms on weekends. We can wear our own clothes then.",
        "correctOption": "don’t have to",
        "wrongOptions": [
          "must",
          "mustn’t",
          "have to"
        ],
        "knowledgePoint": "情态动词must和have to"
      },
      {
        "stem": "He gets up late today, so he ________ take the next bus.",
        "correctOption": "has to",
        "wrongOptions": [
          "must",
          "can",
          "may"
        ],
        "knowledgePoint": "情态动词must和have to"
      },
      {
        "stem": "It is very warm here. You ________ wear the coat.",
        "correctOption": "don't have to",
        "wrongOptions": [
          "must",
          "have to",
          "must not"
        ],
        "knowledgePoint": "情态动词must和have to"
      },
      {
        "stem": "You ________ take me to the station. My brother’s taking me.",
        "correctOption": "don’t have to",
        "wrongOptions": [
          "can’t",
          "mustn’t"
        ],
        "knowledgePoint": "情态动词must和have to"
      },
      {
        "stem": "It’s raining all day, so I ________ stay at home.",
        "correctOption": "have to",
        "wrongOptions": [
          "must",
          "must to",
          "can"
        ],
        "knowledgePoint": "情态动词must和have to"
      },
      {
        "stem": "—Volunteers from Lantian Saving Team have saved many travellers in the mountains. —________ they are!",
        "correctOption": "What great men",
        "wrongOptions": [
          "How great a man",
          "How great men",
          "What a great man"
        ],
        "knowledgePoint": "What感叹句"
      },
      {
        "stem": "________ terrible news! Three of us didn’t pass the exam.",
        "correctOption": "What",
        "wrongOptions": [
          "How",
          "What a",
          "How a"
        ],
        "knowledgePoint": "What感叹句"
      },
      {
        "stem": "—________ sweet song it is! —Yeah. It’s My Heart Will Go Onby Celine Dion.",
        "correctOption": "What a",
        "wrongOptions": [
          "How",
          "How a",
          "What"
        ],
        "knowledgePoint": "What感叹句"
      },
      {
        "stem": "________ quickly the time passed!",
        "correctOption": "How",
        "wrongOptions": [
          "What",
          "What a",
          "How a"
        ],
        "knowledgePoint": "How感叹句"
      },
      {
        "stem": "— Our school carries out the policy to solve the problem. — ________ We hope it can work well.",
        "correctOption": "How good the plan is!",
        "wrongOptions": [
          "How good is the plan!",
          "How bad is the plan!",
          "How bad the plan is!"
        ],
        "knowledgePoint": "How感叹句"
      },
      {
        "stem": "_______ beautiful she is!",
        "correctOption": "How",
        "wrongOptions": [
          "What",
          "What a",
          "How a"
        ],
        "knowledgePoint": "How感叹句"
      },
      {
        "stem": "Please ______ on the bright side of life and stay positive.",
        "correctOption": "look",
        "wrongOptions": [
          "to look",
          "looked",
          "looking"
        ],
        "knowledgePoint": "肯定祈使句"
      },
      {
        "stem": "Please ________ quiet, Tom. Your mother is sleeping now.",
        "correctOption": "be",
        "wrongOptions": [
          "is",
          "keeps"
        ],
        "knowledgePoint": "肯定祈使句"
      },
      {
        "stem": "—The air is fresh now. —Yes.________ go out for a walk.",
        "correctOption": "Let’s",
        "wrongOptions": [
          "Let",
          "Let is",
          "Let we"
        ],
        "knowledgePoint": "肯定祈使句"
      },
      {
        "stem": "________ the new book with you tomorrow. We'll learn a new lesson.",
        "correctOption": "Bring",
        "wrongOptions": [
          "Bringing",
          "Brought",
          "To bring"
        ],
        "knowledgePoint": "肯定祈使句"
      },
      {
        "stem": "—Tony, ________ your teeth quickly. —OK, Mom.",
        "correctOption": "brush",
        "wrongOptions": [
          "brushes",
          "brushing",
          "to brush"
        ],
        "knowledgePoint": "肯定祈使句"
      },
      {
        "stem": "________ your homework after school.",
        "correctOption": "Do",
        "wrongOptions": [
          "Doing",
          "To do",
          "Does"
        ],
        "knowledgePoint": "肯定祈使句"
      },
      {
        "stem": "Tony, never ________ that again!",
        "correctOption": "do",
        "wrongOptions": [
          "does",
          "did",
          "doing"
        ],
        "knowledgePoint": "否定祈使句"
      },
      {
        "stem": "Don't ________ late for school again, or your teacher will be angry.",
        "correctOption": "be",
        "wrongOptions": [
          "/",
          "is"
        ],
        "knowledgePoint": "否定祈使句"
      },
      {
        "stem": "You can’t swim here. Don’t you see the sign “No ________”.",
        "correctOption": "swimming",
        "wrongOptions": [
          "swim",
          "swims",
          "to swim"
        ],
        "knowledgePoint": "否定祈使句"
      },
      {
        "stem": "Mary, ________ in bed. It’s bad for your eyes.",
        "correctOption": "don’t read",
        "wrongOptions": [
          "not read",
          "doesn’t read",
          "no read"
        ],
        "knowledgePoint": "否定祈使句"
      },
      {
        "stem": "Cathy was singing in the room ________ his parents came in.",
        "correctOption": "when",
        "wrongOptions": [
          "while",
          "after",
          "since"
        ],
        "knowledgePoint": "when引导时间状语从句"
      },
      {
        "stem": "________ I got home, I found that my father was watching TV.",
        "correctOption": "When",
        "wrongOptions": [
          "Before",
          "Since",
          "If"
        ],
        "knowledgePoint": "when引导时间状语从句"
      },
      {
        "stem": "Kate will call me when she ________ back to Shanghai tomorrow afternoon.",
        "correctOption": "comes",
        "wrongOptions": [
          "came",
          "will come"
        ],
        "knowledgePoint": "when引导时间状语从句"
      },
      {
        "stem": "When Daisy ________ a book, the bell rang.",
        "correctOption": "was reading",
        "wrongOptions": [
          "reads",
          "is reading",
          "will read"
        ],
        "knowledgePoint": "when引导时间状语从句"
      },
      {
        "stem": "Love your parents _________ they are alive. Don't wait until it is too late.",
        "correctOption": "while",
        "wrongOptions": [
          "though",
          "because",
          "unless"
        ],
        "knowledgePoint": "while/as引导时间状语从句"
      },
      {
        "stem": "Never trouble me while I ________ in my room.",
        "correctOption": "am sleeping",
        "wrongOptions": [
          "will sleep",
          "asleep",
          "slept"
        ],
        "knowledgePoint": "while/as引导时间状语从句"
      },
      {
        "stem": "________ days went by, Jack grew into a tall young man.",
        "correctOption": "As",
        "wrongOptions": [
          "When",
          "While",
          "Since"
        ],
        "knowledgePoint": "while/as引导时间状语从句"
      },
      {
        "stem": "—You didn’t answer my phone last night. What’s up? —Oh, I was so tired and I just fell asleep ________ I lay down on the bed.",
        "correctOption": "as soon as",
        "wrongOptions": [
          "until",
          "though",
          "so that"
        ],
        "knowledgePoint": "as soon as引导时间状语从句"
      },
      {
        "stem": "________ he heard the little girl crying for help outside, he rushed out of the room.",
        "correctOption": "As soon as",
        "wrongOptions": [
          "Unless",
          "If",
          "Although"
        ],
        "knowledgePoint": "as soon as引导时间状语从句"
      },
      {
        "stem": "—Could you please give the notebook to Jane? —Sure, I’ll bring her ________ she comes back.",
        "correctOption": "as soon as",
        "wrongOptions": [
          "before",
          "because"
        ],
        "knowledgePoint": "as soon as引导时间状语从句"
      },
      {
        "stem": "I ________ you a copy of the report as soon as I finish it.",
        "correctOption": "will send",
        "wrongOptions": [
          "sent",
          "have sent"
        ],
        "knowledgePoint": "as soon as引导时间状语从句"
      },
      {
        "stem": "— Can you tell me when you are going to arrive there? — I’m not sure. But I’ll ring you up as soon as I ________ there tomorrow.",
        "correctOption": "arrive",
        "wrongOptions": [
          "arrived",
          "will arrive",
          "am going to arrive"
        ],
        "knowledgePoint": "as soon as引导时间状语从句"
      },
      {
        "stem": "— When should I hand in my paper? — Your must hand in your paper as soon as the bell ________.",
        "correctOption": "rings",
        "wrongOptions": [
          "will ring",
          "rang"
        ],
        "knowledgePoint": "as soon as引导时间状语从句"
      },
      {
        "stem": "He got off the bus as soon as it ______.",
        "correctOption": "stopped",
        "wrongOptions": [
          "stops",
          "is stopping",
          "will stop"
        ],
        "knowledgePoint": "as soon as引导时间状语从句"
      },
      {
        "stem": "— Please call me as soon as you ________ in London. — Sure, I will.",
        "correctOption": "arrive",
        "wrongOptions": [
          "are arriving",
          "will arrive",
          "arrived"
        ],
        "knowledgePoint": "as soon as引导时间状语从句"
      },
      {
        "stem": "Just now, the managers kept arguing about the problem ________ they agree with each other.",
        "correctOption": "until",
        "wrongOptions": [
          "when",
          "although",
          "unless"
        ],
        "knowledgePoint": "until/till引导时间状语从句"
      },
      {
        "stem": "He ________ to bed until he finished his homework last night.",
        "correctOption": "didn’t go",
        "wrongOptions": [
          "went",
          "does go",
          "doesn’t go"
        ],
        "knowledgePoint": "until/till引导时间状语从句"
      },
      {
        "stem": "Did you ________ eat too much meat when you were a child?",
        "correctOption": "use to",
        "wrongOptions": [
          "used to",
          "be used to",
          "was used to"
        ],
        "knowledgePoint": "情态动词 used to"
      },
      {
        "stem": "I ________ read books every day because I didn’t have enough time.",
        "correctOption": "didn’t use to",
        "wrongOptions": [
          "used to",
          "was used not to",
          "was used to"
        ],
        "knowledgePoint": "情态动词 used to"
      },
      {
        "stem": "—I remember there _______ a lot of fish in Yanglan Lake. Now it has been polluted. —What a pity. I think we should play a role in protecting the environment.",
        "correctOption": "used to be",
        "wrongOptions": [
          "are used to have",
          "are used to be",
          "used to have"
        ],
        "knowledgePoint": "情态动词 used to"
      },
      {
        "stem": "My grandmother ________ a good memory, but now she always forgets things.",
        "correctOption": "used to have",
        "wrongOptions": [
          "used to having",
          "were used to having",
          "are used to having"
        ],
        "knowledgePoint": "情态动词 used to"
      },
      {
        "stem": "Your father used to eat meat, ________?",
        "correctOption": "usedn't he",
        "wrongOptions": [
          "did you",
          "didn't you",
          "used he"
        ],
        "knowledgePoint": "情态动词 used to"
      }
    ]
  },
  "八年级": {
    "上册": [
      {
        "stem": "________ is waiting for you at the gate. He wants to say thanks to you.",
        "correctOption": "Somebody",
        "wrongOptions": [
          "Anybody",
          "Everybody",
          "Nobody"
        ],
        "knowledgePoint": "复合不定代词"
      },
      {
        "stem": "You don't have a drink. Can I get you ________?",
        "correctOption": "something",
        "wrongOptions": [
          "anything",
          "nothing",
          "everything"
        ],
        "knowledgePoint": "复合不定代词"
      },
      {
        "stem": "—Did you go ________ on vacation? —No, I stayed at home.",
        "correctOption": "anywhere interesting",
        "wrongOptions": [
          "somewhere interesting",
          "interesting somewhere",
          "interesting anywhere"
        ],
        "knowledgePoint": "复合不定代词"
      },
      {
        "stem": "My host family tried to cook ________ for me when I studied in New Zealand.",
        "correctOption": "something different",
        "wrongOptions": [
          "different something",
          "different anything",
          "anything different"
        ],
        "knowledgePoint": "复合不定代词"
      },
      {
        "stem": "Do you have something to ________? I am thirsty.",
        "correctOption": "drink",
        "wrongOptions": [
          "eat",
          "eating",
          "drinking"
        ],
        "knowledgePoint": "复合不定代词"
      },
      {
        "stem": "There are still ________ potatoes, but there aren’t ________ tomatoes at home.",
        "correctOption": "some; any",
        "wrongOptions": [
          "some; some",
          "any; some"
        ],
        "knowledgePoint": "some/any"
      },
      {
        "stem": "—Do you have ________ friends in Fuzhou? —Yes, I have ________ good friends here.",
        "correctOption": "any; some",
        "wrongOptions": [
          "some; some",
          "some; any"
        ],
        "knowledgePoint": "some/any"
      },
      {
        "stem": "—Would you like ________ orange juice? —No, thanks. There is ________ in my bottle.",
        "correctOption": "some; some",
        "wrongOptions": [
          "any; any",
          "some; any",
          "any; some"
        ],
        "knowledgePoint": "some/any"
      },
      {
        "stem": "—When is International Workers' Day? —It is on the ________ day of May.",
        "correctOption": "first",
        "wrongOptions": [
          "second",
          "third"
        ],
        "knowledgePoint": "序数词"
      },
      {
        "stem": "September is the _______ month of a year.",
        "correctOption": "ninth",
        "wrongOptions": [
          "eighth",
          "nineth"
        ],
        "knowledgePoint": "序数词"
      },
      {
        "stem": "Father's Day is on the ________ Sunday of June.",
        "correctOption": "third",
        "wrongOptions": [
          "three",
          "thirteenth"
        ],
        "knowledgePoint": "序数词"
      },
      {
        "stem": "The reading room is on ________ floor. You need to go upstairs.",
        "correctOption": "the fourth",
        "wrongOptions": [
          "fourth",
          "the four",
          "four"
        ],
        "knowledgePoint": "序数词"
      },
      {
        "stem": "There are ________ days in a week. Thursday is the ________ day of the week.",
        "correctOption": "seven; fifth",
        "wrongOptions": [
          "seven; sixth",
          "seventh; five"
        ],
        "knowledgePoint": "序数词"
      },
      {
        "stem": "Today is my sister's _________ birthday. I want to buy a gift for her.",
        "correctOption": "twenty-fifth",
        "wrongOptions": [
          "twenty-five",
          "the twenty-five",
          "the twenty-fifth"
        ],
        "knowledgePoint": "序数词"
      },
      {
        "stem": "The building has ________ floors (层). They live on the ________ floor.",
        "correctOption": "twelve; twelfth",
        "wrongOptions": [
          "twelve; twelve",
          "twelfth; twelfth",
          "twelfth; twelve"
        ],
        "knowledgePoint": "序数词"
      },
      {
        "stem": "My car number is 53659. It reads “________”.",
        "correctOption": "five three six five nine",
        "wrongOptions": [
          "five four six five eight",
          "five two seven five ten",
          "five six three five nine"
        ],
        "knowledgePoint": "基数词"
      },
      {
        "stem": "—What’s 55 in English? —It’s ________.",
        "correctOption": "fifty-five",
        "wrongOptions": [
          "fifty five",
          "fifty and five",
          "five and five"
        ],
        "knowledgePoint": "基数词"
      },
      {
        "stem": "I spent thirty-eight yuan on ________ notebooks. Every one of them cost two yuan.",
        "correctOption": "nineteen",
        "wrongOptions": [
          "nine",
          "ten",
          "nineteenth"
        ],
        "knowledgePoint": "基数词"
      },
      {
        "stem": "—Which room does Robinson live in? —________.",
        "correctOption": "Room 0809",
        "wrongOptions": [
          "0809 Room",
          "0809 rooms"
        ],
        "knowledgePoint": "基数词"
      },
      {
        "stem": "Please turn to Page ________ and look at the passage.",
        "correctOption": "Five",
        "wrongOptions": [
          "the five",
          "Fifth",
          "the fifth"
        ],
        "knowledgePoint": "基数词"
      },
      {
        "stem": "Mrs. King’s grandma is old. She is ________.",
        "correctOption": "eighty years old",
        "wrongOptions": [
          "eighty year old",
          "eighty-year-old"
        ],
        "knowledgePoint": "基数词"
      },
      {
        "stem": "Erie is ten years old and he has an ________ sister.",
        "correctOption": "eight-year-old",
        "wrongOptions": [
          "eight year old",
          "eight year olds"
        ],
        "knowledgePoint": "基数词"
      },
      {
        "stem": "Tom is a ________ boy and his little sister Joan is only five years old.",
        "correctOption": "fifteen-year-old",
        "wrongOptions": [
          "fifteen-year-olds",
          "fifteen years old",
          "fifteen year olds"
        ],
        "knowledgePoint": "基数词"
      },
      {
        "stem": "The Yangtze River is ________ river in China.",
        "correctOption": "the longest",
        "wrongOptions": [
          "long",
          "longer",
          "longest"
        ],
        "knowledgePoint": "形容词最高级的用法"
      },
      {
        "stem": "—I think Cindy is ________ student in our class. —I don’t think so. Linda is ________ than her.",
        "correctOption": "the smartest; smarter",
        "wrongOptions": [
          "smarter; smarter",
          "the smartest; the smartest",
          "smarter; the smartest"
        ],
        "knowledgePoint": "形容词最高级的用法"
      },
      {
        "stem": "—How do you like the book you read yesterday? —Oh! It’s one of ________ books I’ve ever read.",
        "correctOption": "the most interesting",
        "wrongOptions": [
          "interesting",
          "more interesting",
          "most interesting"
        ],
        "knowledgePoint": "形容词最高级的用法"
      },
      {
        "stem": "The Yangtze River is one of _______ rivers in the world.",
        "correctOption": "the longest",
        "wrongOptions": [
          "long",
          "longer",
          "longest"
        ],
        "knowledgePoint": "形容词最高级的用法"
      },
      {
        "stem": "The elephant is one of ________ in the world. But the number of them is getting smaller and smaller.",
        "correctOption": "the largest animals",
        "wrongOptions": [
          "the larger animal",
          "the larger animals",
          "the largest animal"
        ],
        "knowledgePoint": "形容词最高级的用法"
      },
      {
        "stem": "The Yangtze River is ________ longest river in the world.",
        "correctOption": "the third",
        "wrongOptions": [
          "three",
          "third",
          "the three"
        ],
        "knowledgePoint": "形容词最高级的用法"
      },
      {
        "stem": "Tony is only thinner than Jim. He is ______ in his class.",
        "correctOption": "the second fattest",
        "wrongOptions": [
          "two fattest",
          "the two fattest"
        ],
        "knowledgePoint": "形容词最高级的用法"
      },
      {
        "stem": "Going to Beihai Park with friends makes me ______ than staying at home.",
        "correctOption": "happier",
        "wrongOptions": [
          "happy",
          "happiest",
          "the happiest"
        ],
        "knowledgePoint": "形容词比较级的用法"
      },
      {
        "stem": "—What do you think of math, Kate? —I think it is ________ than English.",
        "correctOption": "more difficult",
        "wrongOptions": [
          "difficult",
          "very difficult",
          "as difficult"
        ],
        "knowledgePoint": "形容词比较级的用法"
      },
      {
        "stem": "Huang Lei is ________ than Larry, so he has ________ friends than Larry.",
        "correctOption": "friendlier; more",
        "wrongOptions": [
          "friendlier; many",
          "friendly; more"
        ],
        "knowledgePoint": "形容词比较级的用法"
      },
      {
        "stem": "With the effort (努力) of Chinese government, the life of Tibetans (西藏人⺠) becomes ________.",
        "correctOption": "better and better",
        "wrongOptions": [
          "good and good",
          "well and well"
        ],
        "knowledgePoint": "形容词比较级的用法"
      },
      {
        "stem": "Everyone knows that China is getting ________.",
        "correctOption": "stronger and stronger",
        "wrongOptions": [
          "strong and strong",
          "strongest and strongest"
        ],
        "knowledgePoint": "形容词比较级的用法"
      },
      {
        "stem": "Our hometown is becoming ________.",
        "correctOption": "more and more beautiful",
        "wrongOptions": [
          "beautiful and beautiful",
          "more beautiful and beautiful",
          "more beautiful and more beautiful"
        ],
        "knowledgePoint": "形容词比较级的用法"
      },
      {
        "stem": "We need to read good books. ________.",
        "correctOption": "The more, the better",
        "wrongOptions": [
          "The many, the better",
          "More, better"
        ],
        "knowledgePoint": "形容词比较级的用法"
      },
      {
        "stem": "________ the mountain is, ________ the air is.",
        "correctOption": "The higher; the thinner",
        "wrongOptions": [
          "The highest; the thinnest",
          "Higher; thinner",
          "The highest; the thinner"
        ],
        "knowledgePoint": "形容词比较级的用法"
      },
      {
        "stem": "— You won’t pass the exam(考试) ________ you don’t work hard. — OK, I’ll do my best.",
        "correctOption": "if",
        "wrongOptions": [
          "and",
          "but",
          "so"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "If it is sunny, we ________ the mountains.",
        "correctOption": "will climb",
        "wrongOptions": [
          "climb",
          "climbed"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "You ________ a lot of good friends if you are kind to others.",
        "correctOption": "will make",
        "wrongOptions": [
          "make",
          "made",
          "have made"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "If I ________ time tomorrow, I will clean the room.",
        "correctOption": "have",
        "wrongOptions": [
          "will have",
          "had",
          "am having"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "If it ________ tomorrow, we ________ to play basketball in the playground.",
        "correctOption": "doesn’t rain; will go",
        "wrongOptions": [
          "won’t rain; go",
          "won’t rain; will go",
          "doesn’t rain; go"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "You should see a doctor if you ________ feel well.",
        "correctOption": "don't",
        "wrongOptions": [
          "didn't",
          "will not"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "If you _________ the food into your mouth in the lab, you may eat some of dangerous things.",
        "correctOption": "put",
        "wrongOptions": [
          "will put",
          "puts"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "Tell me if you ________ the answer.",
        "correctOption": "know",
        "wrongOptions": [
          "knew",
          "will know"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "If you ________ your parents, please speak out.",
        "correctOption": "love",
        "wrongOptions": [
          "will love",
          "are loving"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "If she called, I ________ right away.",
        "correctOption": "answered",
        "wrongOptions": [
          "answer",
          "will answer",
          "answers"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "If I ________ that, I didn’t mean to hurt (伤害) anyone.",
        "correctOption": "said",
        "wrongOptions": [
          "say",
          "will say",
          "says"
        ],
        "knowledgePoint": "if引导条件状语从句"
      },
      {
        "stem": "Jack’s shoes are as ________ as Jim’s.",
        "correctOption": "cheap",
        "wrongOptions": [
          "cheaper",
          "the cheaper",
          "the cheapest"
        ],
        "knowledgePoint": "形容词副词的同级比较"
      },
      {
        "stem": "Helping others is just as ______ as getting help from others.",
        "correctOption": "exciting",
        "wrongOptions": [
          "more exciting",
          "most exciting",
          "the most exciting"
        ],
        "knowledgePoint": "形容词副词的同级比较"
      },
      {
        "stem": "She checked the exam paper as ________ as her sister.",
        "correctOption": "carefully",
        "wrongOptions": [
          "most carefully",
          "the most carefully",
          "more carefully"
        ],
        "knowledgePoint": "形容词副词的同级比较"
      },
      {
        "stem": "Millie is good at singing. She sings ________ the famous singer CoCo.",
        "correctOption": "as well as",
        "wrongOptions": [
          "as better as",
          "as the best as"
        ],
        "knowledgePoint": "形容词副词的同级比较"
      },
      {
        "stem": "My computer at home doesn’t work as ________ as the one in the school office.",
        "correctOption": "fast",
        "wrongOptions": [
          "faster",
          "fastest",
          "the fastest"
        ],
        "knowledgePoint": "形容词副词的同级比较"
      },
      {
        "stem": "I’m surprised to hear that Bob is ________ outgoing ________ he was two years ago. I remember he liked to talk with others at that time.",
        "correctOption": "not so; as",
        "wrongOptions": [
          "more; than",
          "as; as"
        ],
        "knowledgePoint": "形容词副词的同级比较"
      },
      {
        "stem": "Japanese isn’t ________ important ________ English.",
        "correctOption": "A and B",
        "wrongOptions": [
          "as; as",
          "so; as",
          "as; so"
        ],
        "knowledgePoint": "形容词副词的同级比较"
      },
      {
        "stem": "— Have you finished your homework ________? — Yes, I have ________ finished it.",
        "correctOption": "yet; already",
        "wrongOptions": [
          "yet; yet",
          "already; yet"
        ],
        "knowledgePoint": "现在完成时表示过去对现在造成影响"
      },
      {
        "stem": "— Have you ________ seen this movie? — No, I have not seen it ________.",
        "correctOption": "ever; yet",
        "wrongOptions": [
          "yet; already",
          "ever; already"
        ],
        "knowledgePoint": "现在完成时表示过去对现在造成影响"
      },
      {
        "stem": "We ________ English for nearly three years. We can easily speak it now.",
        "correctOption": "have learned",
        "wrongOptions": [
          "learn",
          "learned",
          "were learning"
        ],
        "knowledgePoint": "现在完成时表示过去持续的动作或状态"
      },
      {
        "stem": "Cindy ________ a lot of work since she joined our volunteer team.",
        "correctOption": "has done",
        "wrongOptions": [
          "was doing",
          "does",
          "did"
        ],
        "knowledgePoint": "现在完成时表示过去持续的动作或状态"
      },
      {
        "stem": "—Why do you look so excited, Sally? —My uncle is coming back next month. We haven’t seen each other ________ 2003.",
        "correctOption": "since",
        "wrongOptions": [
          "in",
          "for"
        ],
        "knowledgePoint": "现在完成时表示过去持续的动作或状态"
      },
      {
        "stem": "Ben has lived here ________ he was born.",
        "correctOption": "since",
        "wrongOptions": [
          "for",
          "when",
          "from"
        ],
        "knowledgePoint": "现在完成时表示过去持续的动作或状态"
      },
      {
        "stem": "Our teacher has been back ________ half an hour.",
        "correctOption": "for",
        "wrongOptions": [
          "since",
          "in",
          "after"
        ],
        "knowledgePoint": "现在完成时表示过去持续的动作或状态"
      },
      {
        "stem": "Kate ________ the film before, but she decides to see it a second time.",
        "correctOption": "has seen",
        "wrongOptions": [
          "have seen",
          "had seen",
          "saw"
        ],
        "knowledgePoint": "现在完成时句式变换"
      },
      {
        "stem": "— _____ have you improved your English? — By watching English movies.",
        "correctOption": "How",
        "wrongOptions": [
          "What",
          "Who",
          "Why"
        ],
        "knowledgePoint": "现在完成时句式变换"
      },
      {
        "stem": "— _____ city have you visited, Xi'an or Chongqing? — Chongqing.",
        "correctOption": "Which",
        "wrongOptions": [
          "Where",
          "Whom",
          "How"
        ],
        "knowledgePoint": "现在完成时句式变换"
      },
      {
        "stem": "—May I speak to your headmaster? —Sorry, he isn’t here. He ________ to Guiyang on business.",
        "correctOption": "has gone",
        "wrongOptions": [
          "have gone",
          "have been",
          "has been"
        ],
        "knowledgePoint": "have gone to/have been to/have been in"
      },
      {
        "stem": "She ________ to the farm many times, so she knows every corner of it.",
        "correctOption": "has been",
        "wrongOptions": [
          "went",
          "will go",
          "has gone"
        ],
        "knowledgePoint": "have gone to/have been to/have been in"
      },
      {
        "stem": "—Can I see Miss Gu at the moment, please? —I’m afraid not. She ________ Nanjing for 2 days. She’ll come back in three days.",
        "correctOption": "has been in",
        "wrongOptions": [
          "has been to",
          "has gone to",
          "went"
        ],
        "knowledgePoint": "have gone to/have been to/have been in"
      },
      {
        "stem": "The great playwright (剧作家) ________ for 105 years, but people will continue to enjoy his plays for many years to come.",
        "correctOption": "has been dead",
        "wrongOptions": [
          "has dead",
          "has been died",
          "has died"
        ],
        "knowledgePoint": "瞬间动词和持续动词的现在完成时"
      },
      {
        "stem": "The young man ________ his hometown for a long time. He really misses it.",
        "correctOption": "has been away from",
        "wrongOptions": [
          "left",
          "has left"
        ],
        "knowledgePoint": "瞬间动词和持续动词的现在完成时"
      },
      {
        "stem": "—Mum, I want to watch the news on CCTV-1. Change the channel, please! —What a pity! It ________ for a while.",
        "correctOption": "has been over",
        "wrongOptions": [
          "was over",
          "has finished"
        ],
        "knowledgePoint": "瞬间动词和持续动词的现在完成时"
      },
      {
        "stem": "Our math teacher ________ in our school for 20 years and he ________ here when he was 23 years old.",
        "correctOption": "has taught; came",
        "wrongOptions": [
          "has taught; has come",
          "taught; comes",
          "taught; came"
        ],
        "knowledgePoint": "现在完成时与一现、一过的辨析"
      },
      {
        "stem": "—________ you ever ________ the movie Harry Potter? —Yes. I ________ it last week.",
        "correctOption": "Have; watched; watched",
        "wrongOptions": [
          "Did; watched; watched",
          "Have; watched; have watched",
          "Did; watch; watched"
        ],
        "knowledgePoint": "现在完成时与一现、一过的辨析"
      },
      {
        "stem": "In 2008, my uncle ________ in England. But he ________ in Shanghai since ten years ago.",
        "correctOption": "lived; has lived",
        "wrongOptions": [
          "lived; lives",
          "has lived; lived",
          "has lived; will live"
        ],
        "knowledgePoint": "现在完成时与一现、一过的辨析"
      },
      {
        "stem": "— ________ you ________ a new watch yet? The old one is broken. — Yes. I ________ one in the New Century Department last week.",
        "correctOption": "Have; bought; bought",
        "wrongOptions": [
          "Have; bought; have bought",
          "Did; buy; bought",
          "Did; buy; have bought"
        ],
        "knowledgePoint": "现在完成时与一现、一过的辨析"
      },
      {
        "stem": "—Tom, ________ you ever ________ the new film? —Yes. I ________ it a week ago.",
        "correctOption": "have; seen; saw",
        "wrongOptions": [
          "have; seen; see",
          "did; see; saw"
        ],
        "knowledgePoint": "现在完成时与一现、一过的辨析"
      },
      {
        "stem": "There are no buses to the beach. ________ you have a car, it’s difficult to get there.",
        "correctOption": "Unless",
        "wrongOptions": [
          "Since",
          "After",
          "Because"
        ],
        "knowledgePoint": "unless引导条件状语从句"
      },
      {
        "stem": "He can’t catch up with the other students ________ he works hard.",
        "correctOption": "unless",
        "wrongOptions": [
          "until",
          "if"
        ],
        "knowledgePoint": "unless引导条件状语从句"
      },
      {
        "stem": "Jack won’t have a holiday with his family ________ he can finish the project in time.",
        "correctOption": "unless",
        "wrongOptions": [
          "when",
          "if",
          "so that"
        ],
        "knowledgePoint": "unless引导条件状语从句"
      },
      {
        "stem": "—Have you finished your task yet? —Not yet. We won’t finish the task in time unless you ________ us.",
        "correctOption": "help",
        "wrongOptions": [
          "helped",
          "will help"
        ],
        "knowledgePoint": "unless引导条件状语从句"
      },
      {
        "stem": "Unless it ________ tomorrow, we will climb the mountain.",
        "correctOption": "rains",
        "wrongOptions": [
          "will rain",
          "doesn't rain",
          "won't rain"
        ],
        "knowledgePoint": "unless引导条件状语从句"
      },
      {
        "stem": "Eric ________ football with me unless he ________ time tomorrow.",
        "correctOption": "won’t play; has",
        "wrongOptions": [
          "won’t play; will have",
          "doesn’t play; has",
          "doesn’t play; will have"
        ],
        "knowledgePoint": "unless引导条件状语从句"
      },
      {
        "stem": "You __________ out unless you __________ all the work.",
        "correctOption": "can't go; finish",
        "wrongOptions": [
          "can go; don't finish",
          "go; finish",
          "can't go; will finish"
        ],
        "knowledgePoint": "unless引导条件状语从句"
      },
      {
        "stem": "Don't try to change them unless they themselves ________ to change.",
        "correctOption": "want",
        "wrongOptions": [
          "wants",
          "will want",
          "wanted"
        ],
        "knowledgePoint": "unless引导条件状语从句"
      },
      {
        "stem": "— I hate vegetables. I ___________ eat them. — But they are good for your health! You should eat them every day.",
        "correctOption": "seldom",
        "wrongOptions": [
          "always",
          "often",
          "usually"
        ],
        "knowledgePoint": "副词"
      },
      {
        "stem": "Michael is a ________ baseball player, because he can play baseball ________.",
        "correctOption": "good; well",
        "wrongOptions": [
          "good; good",
          "well; well",
          "well; good"
        ],
        "knowledgePoint": "副词与形容词"
      },
      {
        "stem": "He is a ________ hero. We ________ respect(尊敬) him.",
        "correctOption": "real; really",
        "wrongOptions": [
          "real; real",
          "really; really",
          "really; real"
        ],
        "knowledgePoint": "副词与形容词"
      },
      {
        "stem": "I often have a ________ breakfast, but my teacher tells me eating ________ is not good for my health.",
        "correctOption": "quick; quickly",
        "wrongOptions": [
          "quick; quick",
          "quickly; quickly",
          "quickly; quick"
        ],
        "knowledgePoint": "副词与形容词"
      },
      {
        "stem": "Although we met with some accidents on the way, we got there ________.",
        "correctOption": "safely",
        "wrongOptions": [
          "safe",
          "safer",
          "safety"
        ],
        "knowledgePoint": "副词与形容词"
      },
      {
        "stem": "His brother gets up very ________, so he doesn’t have breakfast and goes to school ________.",
        "correctOption": "late; quickly",
        "wrongOptions": [
          "lately; late",
          "early; quickly",
          "lately; early"
        ],
        "knowledgePoint": "形容词副词同形"
      },
      {
        "stem": "She taught herself English last year, and she learnt very ________.",
        "correctOption": "fast",
        "wrongOptions": [
          "fastly",
          "faster"
        ],
        "knowledgePoint": "形容词副词同形"
      },
      {
        "stem": "It was raining too _________, so we could _________ see anything below.",
        "correctOption": "hard; hardly",
        "wrongOptions": [
          "hard; hard",
          "hardly; hardly",
          "hardly; hard"
        ],
        "knowledgePoint": "形容词副词同形"
      },
      {
        "stem": "Henry is a good runner. He runs __________ than his friends.",
        "correctOption": "faster",
        "wrongOptions": [
          "fast",
          "slower",
          "slowest"
        ],
        "knowledgePoint": "副词比较级最高级"
      },
      {
        "stem": "In order to pass the exam, you need to work much_______now.",
        "correctOption": "harder",
        "wrongOptions": [
          "hard",
          "hardest",
          "hardly"
        ],
        "knowledgePoint": "副词比较级最高级"
      },
      {
        "stem": "If you take schoolwork ________, you are sure to learn well.",
        "correctOption": "seriously",
        "wrongOptions": [
          "serious",
          "more serious",
          "less seriously"
        ],
        "knowledgePoint": "副词比较级最高级"
      }
    ],
    "下册": [
      {
        "stem": "—Did you have a good time in the park? —No, we didn't. When we got there, it began ________.",
        "correctOption": "to rain",
        "wrongOptions": [
          "rain",
          "rains",
          "rained"
        ],
        "knowledgePoint": "不定式作宾语"
      },
      {
        "stem": "At the meeting, all countries promised ________ greenhouse effect by using less fossil fuel.",
        "correctOption": "to reduce",
        "wrongOptions": [
          "reduce",
          "reducing",
          "to reducing"
        ],
        "knowledgePoint": "不定式作宾语"
      },
      {
        "stem": "—The movie Mulan is on tonight. I plan ________ it. Do you want to go with me? —Oh, great. I love action movies.",
        "correctOption": "to watch",
        "wrongOptions": [
          "watch",
          "watching",
          "watched"
        ],
        "knowledgePoint": "不定式作宾语"
      },
      {
        "stem": "Judy misses his family a lot and wishes ________ his mother's delicious food.",
        "correctOption": "to have",
        "wrongOptions": [
          "has",
          "having",
          "had"
        ],
        "knowledgePoint": "不定式作宾语"
      },
      {
        "stem": "Please tell Mike and Alice ________ for me at the gate of the school.",
        "correctOption": "to wait",
        "wrongOptions": [
          "waiting",
          "wait"
        ],
        "knowledgePoint": "不定式作补语"
      },
      {
        "stem": "I expected Mark ________ his talents in the competition, but he didn’t appear.",
        "correctOption": "to show",
        "wrongOptions": [
          "showing",
          "choosing",
          "to choose"
        ],
        "knowledgePoint": "不定式作补语"
      },
      {
        "stem": "When I was young, my parents taught me ________ older people kindly.",
        "correctOption": "to treat",
        "wrongOptions": [
          "treats",
          "treated",
          "treat"
        ],
        "knowledgePoint": "不定式作补语"
      },
      {
        "stem": "My parents allow me ________ the Internet for half an hour every weekend.",
        "correctOption": "to surf",
        "wrongOptions": [
          "surf",
          "surfs",
          "surfing"
        ],
        "knowledgePoint": "不定式作补语"
      },
      {
        "stem": "The boy went to the hospital _______ after his mother.",
        "correctOption": "to look",
        "wrongOptions": [
          "looked",
          "look"
        ],
        "knowledgePoint": "不定式作状语"
      },
      {
        "stem": "She got up early ________ the first bus.",
        "correctOption": "to catch",
        "wrongOptions": [
          "catch",
          "catching",
          "caught"
        ],
        "knowledgePoint": "不定式作状语"
      },
      {
        "stem": "—Alice wants to know ________ to hand in her biology report. —Oh, tomorrow morning.",
        "correctOption": "when",
        "wrongOptions": [
          "how",
          "where",
          "what"
        ],
        "knowledgePoint": "疑问词 +不定式"
      },
      {
        "stem": "—Excuse me. Could you tell me ________ to get to the Sports Center? —Sure. Take Line 2 and get off at the Sports Center Station.",
        "correctOption": "how",
        "wrongOptions": [
          "when",
          "what",
          "where"
        ],
        "knowledgePoint": "疑问词 +不定式"
      },
      {
        "stem": "The boy is teaching his grandfather how ________ WeChat.",
        "correctOption": "to use",
        "wrongOptions": [
          "uses",
          "use",
          "using"
        ],
        "knowledgePoint": "疑问词 +不定式"
      },
      {
        "stem": "The old man didn't know ________ when the house caught fire.",
        "correctOption": "what to do",
        "wrongOptions": [
          "how to do",
          "what to do it"
        ],
        "knowledgePoint": "疑问词 +不定式"
      },
      {
        "stem": "Most experts think it is very important for children to learn ________ the housework.",
        "correctOption": "how to do",
        "wrongOptions": [
          "what do",
          "what to do",
          "how do"
        ],
        "knowledgePoint": "疑问词 +不定式"
      },
      {
        "stem": "—Millie, could you give me some advice? I don’t know ________. —Why don’t you wear this red shirt?",
        "correctOption": "what to wear",
        "wrongOptions": [
          "when to wear",
          "how to wear",
          "where to wear"
        ],
        "knowledgePoint": "疑问词 +不定式"
      },
      {
        "stem": "Let’s ________ to the supermarket together.",
        "correctOption": "go",
        "wrongOptions": [
          "goes",
          "going"
        ],
        "knowledgePoint": "常⻅省略 to的不定式"
      },
      {
        "stem": "He is very funny. He can make everyone ________.",
        "correctOption": "laugh",
        "wrongOptions": [
          "laughs",
          "to laugh",
          "laughing"
        ],
        "knowledgePoint": "常⻅省略 to的不定式"
      },
      {
        "stem": "We can often hear the birds ________ in our village in the morning.",
        "correctOption": "sing",
        "wrongOptions": [
          "to sing",
          "sings"
        ],
        "knowledgePoint": "常⻅省略 to的不定式"
      },
      {
        "stem": "Our headmaster isn't in his office. I can't find him anywhere. Did you notice him ______ the office?",
        "correctOption": "leave",
        "wrongOptions": [
          "to enter",
          "enter",
          "to leave"
        ],
        "knowledgePoint": "常⻅省略 to的不定式"
      },
      {
        "stem": "—What’s next? —I’ll have Tony ________ you around.",
        "correctOption": "show",
        "wrongOptions": [
          "to showing",
          "showed",
          "shown"
        ],
        "knowledgePoint": "常⻅省略 to的不定式"
      },
      {
        "stem": "— ________ is one of the best ways to lose weight. — I agree with you.",
        "correctOption": "Running",
        "wrongOptions": [
          "Run",
          "Runs",
          "Ran"
        ],
        "knowledgePoint": "动名词作主语"
      },
      {
        "stem": "________ mountains on weekends ________ a good way to relax myself.",
        "correctOption": "Climbing; is",
        "wrongOptions": [
          "Climb; are",
          "Climbing; are",
          "Climb; is"
        ],
        "knowledgePoint": "动名词作主语"
      },
      {
        "stem": "He is considering _______ Shanghai.",
        "correctOption": "visiting",
        "wrongOptions": [
          "to visit",
          "will visit",
          "visited"
        ],
        "knowledgePoint": "动名词作宾语"
      },
      {
        "stem": "Her father likes _______ meals but hates _______ the dishes.",
        "correctOption": "cooking; doing",
        "wrongOptions": [
          "cooking; make",
          "doing; doing",
          "does; making"
        ],
        "knowledgePoint": "动名词作宾语"
      },
      {
        "stem": "— It's too cold today. Would you mind ________ the window? — Certainly not. Go ahead.",
        "correctOption": "closing",
        "wrongOptions": [
          "to close",
          "close",
          "closed"
        ],
        "knowledgePoint": "动名词作宾语"
      },
      {
        "stem": "Jane suggested ________ her father for advice.",
        "correctOption": "asking",
        "wrongOptions": [
          "to ask",
          "ask",
          "to asking"
        ],
        "knowledgePoint": "动名词作宾语"
      },
      {
        "stem": "We suggest ______ to the restaurant earlier. Because it's hard to get a table.",
        "correctOption": "getting",
        "wrongOptions": [
          "arrive",
          "get",
          "arriving"
        ],
        "knowledgePoint": "动名词作宾语"
      },
      {
        "stem": "It's impossible to succeed without _______ any effort.",
        "correctOption": "making",
        "wrongOptions": [
          "make",
          "made",
          "to make"
        ],
        "knowledgePoint": "动名词作宾语"
      },
      {
        "stem": "— _______ did you tell him about the news? —By _______ an e-mail.",
        "correctOption": "How; sending",
        "wrongOptions": [
          "How; send",
          "How; sent",
          "What; sending"
        ],
        "knowledgePoint": "动名词作宾语"
      },
      {
        "stem": "She is fond of _______. She cooks for her family every day.",
        "correctOption": "cooking",
        "wrongOptions": [
          "cook",
          "cooks",
          "cooked"
        ],
        "knowledgePoint": "动名词作宾语"
      },
      {
        "stem": "There's little time left. How about _______ some fast food for lunch today?",
        "correctOption": "having",
        "wrongOptions": [
          "have",
          "to have",
          "had"
        ],
        "knowledgePoint": "动名词作宾语"
      },
      {
        "stem": "Hong Kong Disneyland is well worth ________.",
        "correctOption": "visiting",
        "wrongOptions": [
          "to visit",
          "visit",
          "visited"
        ],
        "knowledgePoint": "动名词作宾语"
      },
      {
        "stem": "When people watch the talent show, they usually play a role in ________ the winner.",
        "correctOption": "deciding",
        "wrongOptions": [
          "decide",
          "decides",
          "to decide"
        ],
        "knowledgePoint": "动名词作宾语"
      },
      {
        "stem": "This book is ________. I'm really ________ in it.",
        "correctOption": "interesting; interested",
        "wrongOptions": [
          "interesting; interesting",
          "interested; interesting"
        ],
        "knowledgePoint": "-ed/-ing结尾的形容词"
      },
      {
        "stem": "We are ________ about the ________ animal show.",
        "correctOption": "excited; exciting",
        "wrongOptions": [
          "excited; excited",
          "exciting; exciting"
        ],
        "knowledgePoint": "-ed/-ing结尾的形容词"
      },
      {
        "stem": "The children are all ________ on Chinese New Year.",
        "correctOption": "excited",
        "wrongOptions": [
          "excite",
          "exciting"
        ],
        "knowledgePoint": "-ed/-ing结尾的形容词"
      },
      {
        "stem": "He's so ________. He should have a rest.",
        "correctOption": "tired",
        "wrongOptions": [
          "tiring",
          "interested"
        ],
        "knowledgePoint": "-ed/-ing结尾的形容词"
      },
      {
        "stem": "I won’t leave my office until my work ________.",
        "correctOption": "is finished",
        "wrongOptions": [
          "finish",
          "will finish",
          "are finished"
        ],
        "knowledgePoint": "一般现在时的被动语态"
      },
      {
        "stem": "—Is the kite ________ now? —Yes. We can fly it this afternoon.",
        "correctOption": "done",
        "wrongOptions": [
          "do",
          "doing",
          "does"
        ],
        "knowledgePoint": "一般现在时的被动语态"
      },
      {
        "stem": "—What languages ______ in that country? —German and English.",
        "correctOption": "are spoken",
        "wrongOptions": [
          "are speaking",
          "speak",
          "is spoken"
        ],
        "knowledgePoint": "一般现在时的被动语态"
      },
      {
        "stem": "I won't go to Tina's birthday party unless I ________.",
        "correctOption": "am invited",
        "wrongOptions": [
          "am inviting",
          "will be invited",
          "was invited"
        ],
        "knowledgePoint": "一般现在时的被动语态"
      },
      {
        "stem": "—Many measures ________ to stop COVID-19 from spreading in China in 2020. Did you notice that? —Yes, I think they have really worked well even up to now.",
        "correctOption": "were taken",
        "wrongOptions": [
          "are taken",
          "have been taken",
          "should be taken"
        ],
        "knowledgePoint": "一般过去时的被动语态"
      },
      {
        "stem": "—Did you go to Tom’s birthday party? —No, I ______.",
        "correctOption": "wasn’t invited",
        "wrongOptions": [
          "haven’t invited",
          "didn’t invite",
          "am not invited"
        ],
        "knowledgePoint": "一般过去时的被动语态"
      },
      {
        "stem": "When the baby dog ________, it was very hungry. So we gave it some food.",
        "correctOption": "was found",
        "wrongOptions": [
          "is found",
          "has been found",
          "will be found"
        ],
        "knowledgePoint": "一般过去时的被动语态"
      },
      {
        "stem": "—When ______ the Party ______? —In 1921.",
        "correctOption": "was; founded",
        "wrongOptions": [
          "was; found",
          "is; found",
          "has; been founded"
        ],
        "knowledgePoint": "一般过去时的被动语态"
      },
      {
        "stem": "The task ________ into four parts. The workers finished them easily.",
        "correctOption": "was divided",
        "wrongOptions": [
          "is divided",
          "will be divided",
          "has divided"
        ],
        "knowledgePoint": "一般过去时的被动语态"
      },
      {
        "stem": "You ________ if you break the traffic rules.",
        "correctOption": "will be punished",
        "wrongOptions": [
          "will punish",
          "punish",
          "are punished"
        ],
        "knowledgePoint": "一般将来时的被动语态"
      },
      {
        "stem": "—There is often so much rubbish in the river. —Yes. Luckily, to save water, much action _______.",
        "correctOption": "is going to be taken",
        "wrongOptions": [
          "is taking",
          "is going to take",
          "is going to be taking"
        ],
        "knowledgePoint": "一般将来时的被动语态"
      },
      {
        "stem": "Let’s wait and see whether books _______ by the Internet in the future.",
        "correctOption": "will be replaced",
        "wrongOptions": [
          "replace",
          "replaced",
          "were replaced"
        ],
        "knowledgePoint": "一般将来时的被动语态"
      },
      {
        "stem": "—How soon _______ the building _______? —In a month.",
        "correctOption": "will; be completed",
        "wrongOptions": [
          "will; complete",
          "is; going to complete",
          "are; going to be completed"
        ],
        "knowledgePoint": "一般将来时的被动语态"
      },
      {
        "stem": "It's difficult _________ this map.",
        "correctOption": "to understand",
        "wrongOptions": [
          "understanding",
          "understands",
          "understood"
        ],
        "knowledgePoint": "形容词的功能"
      },
      {
        "stem": "-My grandpa began to learn to use We Chat in his sixties. -That's great. As the saying goes, \"It's never____to learn. \"",
        "correctOption": "too old",
        "wrongOptions": [
          "too young",
          "young enough",
          "old enough"
        ],
        "knowledgePoint": "too + 形容词; (not +) 形容词 + enough"
      },
      {
        "stem": "Jack is always ____ to wait for a long time without getting angry.",
        "correctOption": "patient enough",
        "wrongOptions": [
          "too patient",
          "enough patient",
          "very impatient"
        ],
        "knowledgePoint": "too + 形容词; (not +) 形容词 + enough"
      },
      {
        "stem": "It's very kind ____ him to cook for us.",
        "correctOption": "of",
        "wrongOptions": [
          "for",
          "to",
          "with"
        ],
        "knowledgePoint": "It's+形容词 +of/for sb. to do sth."
      },
      {
        "stem": "-It's clever _____ you to help me work out the difficult math problem. Thanks! -You are welcome. Now it's easier _______ you to understand it.",
        "correctOption": "of; for",
        "wrongOptions": [
          "of; of",
          "for; of",
          "for; for"
        ],
        "knowledgePoint": "It's+形容词 +of/for sb. to do sth."
      },
      {
        "stem": "—It's very kind ________ you ________ me carry the heavy luggage. Thank you so much. —It's my pleasure.",
        "correctOption": "of; to help",
        "wrongOptions": [
          "for; to help",
          "of; helping",
          "for; helping"
        ],
        "knowledgePoint": "It's+形容词 +of/for sb. to do sth."
      },
      {
        "stem": "As middle school students, we ________ follow the public rules wherever we go.",
        "correctOption": "should",
        "wrongOptions": [
          "wouldn't",
          "might",
          "could"
        ],
        "knowledgePoint": "情态动词 should"
      },
      {
        "stem": "—I’m so worried about my parents! Can you help me? —I think you ________ ask the police for help.",
        "correctOption": "should",
        "wrongOptions": [
          "need",
          "will",
          "would"
        ],
        "knowledgePoint": "情态动词 should"
      },
      {
        "stem": "—Should I go there right now? —________.",
        "correctOption": "Yes, you should",
        "wrongOptions": [
          "No, you could",
          "Yes, you could",
          "No, you don’t."
        ],
        "knowledgePoint": "情态动词 should"
      },
      {
        "stem": "You look too tired. You ________ rest and ________ work too much.",
        "correctOption": "should; shouldn’t",
        "wrongOptions": [
          "should; should",
          "shouldn’t; shouldn’t",
          "shouldn’t; should"
        ],
        "knowledgePoint": "情态动词 should"
      },
      {
        "stem": "You ________ leave your little sister at home alone. She is too young.",
        "correctOption": "shouldn't",
        "wrongOptions": [
          "needn't",
          "daren't"
        ],
        "knowledgePoint": "情态动词 should"
      },
      {
        "stem": "It's going to rain this afternoon. You'd better ________ the windows when you go out.",
        "correctOption": "close",
        "wrongOptions": [
          "to close",
          "closed",
          "closing"
        ],
        "knowledgePoint": "情态动词 had better"
      },
      {
        "stem": "To achieve your dream, you'd better ________ whenever you meet difficulties.",
        "correctOption": "not give up",
        "wrongOptions": [
          "give up",
          "to give up",
          "not to give up"
        ],
        "knowledgePoint": "情态动词 had better"
      },
      {
        "stem": "Your watch is broken. You ________ buy a new one.",
        "correctOption": "had better",
        "wrongOptions": [
          "had better to",
          "had better not",
          "had better not to"
        ],
        "knowledgePoint": "情态动词 had better"
      },
      {
        "stem": "Peter ________ with his brother on the phone at 21:00 last night.",
        "correctOption": "was talking",
        "wrongOptions": [
          "talks",
          "is talking",
          "talked"
        ],
        "knowledgePoint": "过去进行时的用法"
      },
      {
        "stem": "—Did you watch the film Frozen on the Internet yesterday? —No, I ________ my mother do housework all day.",
        "correctOption": "was helping",
        "wrongOptions": [
          "would help",
          "had helped",
          "help"
        ],
        "knowledgePoint": "过去进行时的用法"
      },
      {
        "stem": "—What were you doing at about 4 o’clock yesterday afternoon? —I ________ to music.",
        "correctOption": "was listening",
        "wrongOptions": [
          "listen",
          "listened",
          "will listen"
        ],
        "knowledgePoint": "过去进行时的用法"
      },
      {
        "stem": "—Why did the car hit the man? —Because the driver ________ too fast at that time.",
        "correctOption": "was driving",
        "wrongOptions": [
          "will drive",
          "is driving",
          "drive"
        ],
        "knowledgePoint": "过去进行时的用法"
      },
      {
        "stem": "He ________ in the library when the rainstorm came.",
        "correctOption": "was reading",
        "wrongOptions": [
          "will read",
          "reads",
          "is reading"
        ],
        "knowledgePoint": "过去进行时的用法"
      },
      {
        "stem": "She _______ a newspaper while her father was watching TV.",
        "correctOption": "was reading",
        "wrongOptions": [
          "read",
          "reads",
          "is reading"
        ],
        "knowledgePoint": "过去进行时的用法"
      },
      {
        "stem": "Cathy was singing in the room ________ his parents came in.",
        "correctOption": "when",
        "wrongOptions": [
          "while",
          "after",
          "since"
        ],
        "knowledgePoint": "when引导时间状语从句"
      },
      {
        "stem": "________ I got home, I found that my father was watching TV.",
        "correctOption": "When",
        "wrongOptions": [
          "Before",
          "Since",
          "If"
        ],
        "knowledgePoint": "when引导时间状语从句"
      },
      {
        "stem": "Kate will call me when she ________ back to Shanghai tomorrow afternoon.",
        "correctOption": "comes",
        "wrongOptions": [
          "came",
          "will come"
        ],
        "knowledgePoint": "when引导时间状语从句"
      },
      {
        "stem": "When Daisy ________ a book, the bell rang.",
        "correctOption": "was reading",
        "wrongOptions": [
          "reads",
          "is reading",
          "will read"
        ],
        "knowledgePoint": "when引导时间状语从句"
      },
      {
        "stem": "— ________ they ________ their homework when I went shopping? — Yes, they were.",
        "correctOption": "Were; doing",
        "wrongOptions": [
          "Do; do",
          "Are; doing",
          "Did; do"
        ],
        "knowledgePoint": "过去进行时的结构"
      },
      {
        "stem": "Love your parents _________ they are alive. Don't wait until it is too late.",
        "correctOption": "while",
        "wrongOptions": [
          "though",
          "because",
          "unless"
        ],
        "knowledgePoint": "while/as引导时间状语从句"
      },
      {
        "stem": "Never trouble me while I ________ in my room.",
        "correctOption": "am sleeping",
        "wrongOptions": [
          "will sleep",
          "asleep",
          "slept"
        ],
        "knowledgePoint": "while/as引导时间状语从句"
      },
      {
        "stem": "________ days went by, Jack grew into a tall young man.",
        "correctOption": "As",
        "wrongOptions": [
          "When",
          "While",
          "Since"
        ],
        "knowledgePoint": "while/as引导时间状语从句"
      },
      {
        "stem": "—What is your favorite animal? —I like pandas ________ they are kind of cute.",
        "correctOption": "because",
        "wrongOptions": [
          "because of"
        ],
        "knowledgePoint": "because, because of辨析"
      },
      {
        "stem": "Most people enjoy shopping online, ________ they can buy almost everything without going out.",
        "correctOption": "because",
        "wrongOptions": [
          "because of"
        ],
        "knowledgePoint": "because, because of辨析"
      },
      {
        "stem": "Three hundred people are waiting at the airport ________ the storm.",
        "correctOption": "because of",
        "wrongOptions": [
          "because"
        ],
        "knowledgePoint": "because, because of辨析"
      }
    ]
  },
  "九年级": {
    "上册": [
      {
        "stem": "This ________ my ring. Mine is in the bag.",
        "correctOption": "isn't",
        "wrongOptions": [
          "is",
          "are",
          "aren't"
        ],
        "knowledgePoint": "陈述句"
      },
      {
        "stem": "Bill is in China, but his brothers ________.",
        "correctOption": "aren't",
        "wrongOptions": [
          "doesn't",
          "don't"
        ],
        "knowledgePoint": "陈述句"
      },
      {
        "stem": "You are too tired. You ________ rest and you ________ do much work.",
        "correctOption": "should; shouldn't",
        "wrongOptions": [
          "shouldn't; should",
          "should; should"
        ],
        "knowledgePoint": "陈述句"
      },
      {
        "stem": "—The robot ________ play chess with us. It's so smart. —That would be fine.",
        "correctOption": "can",
        "wrongOptions": [
          "may",
          "must",
          "need"
        ],
        "knowledgePoint": "陈述句"
      },
      {
        "stem": "You ________ ask a lady about her age. It's not polite.",
        "correctOption": "shouldn't",
        "wrongOptions": [
          "needn't",
          "must",
          "may"
        ],
        "knowledgePoint": "陈述句"
      },
      {
        "stem": "I ________ like math.",
        "correctOption": "don't",
        "wrongOptions": [
          "doesn't",
          "not",
          "am not"
        ],
        "knowledgePoint": "陈述句"
      },
      {
        "stem": "The boys in our school ________ basketball and they play it after school.",
        "correctOption": "like",
        "wrongOptions": [
          "likes",
          "don't like",
          "doesn't like"
        ],
        "knowledgePoint": "陈述句"
      },
      {
        "stem": "—Are you in Class One? —________.",
        "correctOption": "No, I’m not",
        "wrongOptions": [
          "No, I don’t",
          "Yes, I do",
          "Yes, I’m"
        ],
        "knowledgePoint": "一般疑问句"
      },
      {
        "stem": "—Is the bread in the kitchen? —No, ________.",
        "correctOption": "it isn't",
        "wrongOptions": [
          "they are",
          "they aren't",
          "it is"
        ],
        "knowledgePoint": "一般疑问句"
      },
      {
        "stem": "—Can you play ping-pong? —________. I think it’s easy.",
        "correctOption": "Yes, I can",
        "wrongOptions": [
          "Yes, I do",
          "No, I don’t",
          "No, I can’t"
        ],
        "knowledgePoint": "一般疑问句"
      },
      {
        "stem": "I want to read the book. Can you ________?",
        "correctOption": "give it to me",
        "wrongOptions": [
          "give me it",
          "give it me",
          "give it for me"
        ],
        "knowledgePoint": "一般疑问句"
      },
      {
        "stem": "—________ your sister ________ computer games? —No, she ________.",
        "correctOption": "Does; play; doesn’t",
        "wrongOptions": [
          "Do; play; does",
          "Do; plays; doesn’t",
          "Does; plays; doesn’t"
        ],
        "knowledgePoint": "一般疑问句"
      },
      {
        "stem": "________ you ________ TV last night?",
        "correctOption": "Did; watch",
        "wrongOptions": [
          "Do; watch",
          "Are; watched",
          "Were; watched"
        ],
        "knowledgePoint": "一般疑问句"
      },
      {
        "stem": "________ your mother ________ carrots?",
        "correctOption": "Does; eat",
        "wrongOptions": [
          "Do; eat",
          "Is; eat",
          "Are; eat"
        ],
        "knowledgePoint": "一般疑问句"
      },
      {
        "stem": "—________ do you like sports? —Because they can make me healthy.",
        "correctOption": "Why",
        "wrongOptions": [
          "What",
          "Where",
          "When"
        ],
        "knowledgePoint": "wh-特殊疑问句"
      },
      {
        "stem": "—________ are they talking to? —I am not sure. Maybe a new teacher.",
        "correctOption": "Who",
        "wrongOptions": [
          "What",
          "When",
          "Where"
        ],
        "knowledgePoint": "wh-特殊疑问句"
      },
      {
        "stem": "—________ is the meeting? —At 4:00 in the afternoon.",
        "correctOption": "When",
        "wrongOptions": [
          "What",
          "Why",
          "Where"
        ],
        "knowledgePoint": "wh-特殊疑问句"
      },
      {
        "stem": "— ________ do you do in the evening? — I do my homework or watch TV.",
        "correctOption": "What",
        "wrongOptions": [
          "When",
          "Where",
          "Why"
        ],
        "knowledgePoint": "wh-特殊疑问句"
      },
      {
        "stem": "—________ are koalas from? —Australia.",
        "correctOption": "Where",
        "wrongOptions": [
          "When",
          "What",
          "Why"
        ],
        "knowledgePoint": "wh-特殊疑问句"
      },
      {
        "stem": "—________ animals do you like? —I like pandas from China.",
        "correctOption": "What",
        "wrongOptions": [
          "Where",
          "Why",
          "When"
        ],
        "knowledgePoint": "wh-特殊疑问句"
      },
      {
        "stem": "—________ do you like dolphins? —Because they are very smart.",
        "correctOption": "Why",
        "wrongOptions": [
          "Where",
          "When",
          "What"
        ],
        "knowledgePoint": "wh-特殊疑问句"
      },
      {
        "stem": "—________? —It's December 6th.",
        "correctOption": "What's the date",
        "wrongOptions": [
          "What's the time",
          "What day is it"
        ],
        "knowledgePoint": "what常考句型"
      },
      {
        "stem": "—________ my new trousers? —They are very nice.",
        "correctOption": "What do you think of",
        "wrongOptions": [
          "What do you like",
          "How do you think of",
          "How would you like"
        ],
        "knowledgePoint": "what常考句型"
      },
      {
        "stem": "—What does she look like? —________.",
        "correctOption": "She is tall and thin",
        "wrongOptions": [
          "She is very friendly",
          "She likes dancing",
          "She is fine"
        ],
        "knowledgePoint": "what常考句型"
      },
      {
        "stem": "Could you tell us ________ to do next week?",
        "correctOption": "what",
        "wrongOptions": [
          "which",
          "how",
          "that"
        ],
        "knowledgePoint": "what常考句型"
      },
      {
        "stem": "—I like English. ________ you? —Me too.",
        "correctOption": "What about",
        "wrongOptions": [
          "What are",
          "Where are"
        ],
        "knowledgePoint": "what常考句型"
      },
      {
        "stem": "—How do you do, Miss White? — ________",
        "correctOption": "How do you do?",
        "wrongOptions": [
          "Thank you a lot.",
          "Yes, it is.",
          "You are right."
        ],
        "knowledgePoint": "how特殊疑问句"
      },
      {
        "stem": "—How ________ your father? —He's fine. Thanks.",
        "correctOption": "is",
        "wrongOptions": [
          "are",
          "do",
          "does"
        ],
        "knowledgePoint": "how特殊疑问句"
      },
      {
        "stem": "—How's it _________? —Terrible.",
        "correctOption": "going",
        "wrongOptions": [
          "go",
          "to go",
          "goes"
        ],
        "knowledgePoint": "how特殊疑问句"
      },
      {
        "stem": "—________? —It's cloudy and windy.",
        "correctOption": "How's the weather",
        "wrongOptions": [
          "How's it like",
          "What's the weather",
          "Do you like the weather"
        ],
        "knowledgePoint": "how特殊疑问句"
      },
      {
        "stem": "—________ the weather like in Hangzhou? —It's cloudy.",
        "correctOption": "What's",
        "wrongOptions": [
          "How's",
          "What",
          "How"
        ],
        "knowledgePoint": "how特殊疑问句"
      },
      {
        "stem": "— _________ is the weather today? — It is _________.",
        "correctOption": "How; rainy",
        "wrongOptions": [
          "What; rainy",
          "How; rain",
          "What; rain"
        ],
        "knowledgePoint": "how特殊疑问句"
      },
      {
        "stem": "________ does Lucy ________ her school life?",
        "correctOption": "What; think of",
        "wrongOptions": [
          "How; think of",
          "What; like",
          "How; think"
        ],
        "knowledgePoint": "how特殊疑问句"
      },
      {
        "stem": "— How do you like the talk show? — ________. It's really boring.",
        "correctOption": "I can't stand it",
        "wrongOptions": [
          "I like it very much",
          "Yes, I'd like to",
          "I don't think so"
        ],
        "knowledgePoint": "how特殊疑问句"
      },
      {
        "stem": "—How about ________ a walk after dinner? —That's a good idea.",
        "correctOption": "taking",
        "wrongOptions": [
          "to take",
          "took",
          "takes"
        ],
        "knowledgePoint": "how特殊疑问句"
      },
      {
        "stem": "—________ does Rock go to school? —He rides a bike.",
        "correctOption": "How",
        "wrongOptions": [
          "What",
          "When",
          "Where"
        ],
        "knowledgePoint": "how特殊疑问句"
      },
      {
        "stem": "—________ can you learn English so well? —By reading English books.",
        "correctOption": "How",
        "wrongOptions": [
          "When",
          "Where",
          "Who"
        ],
        "knowledgePoint": "how特殊疑问句"
      },
      {
        "stem": "—________ is the chicken? —Fifty yuan per kilo. ________ do you need?",
        "correctOption": "How much; How much",
        "wrongOptions": [
          "How much; How many",
          "How many; How much",
          "How many; How many"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "________ clubs can a ten-year-old child join?",
        "correctOption": "How many",
        "wrongOptions": [
          "How much"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "— ________? — Twice a week.",
        "correctOption": "How often do you use the Internet",
        "wrongOptions": [
          "How do you like the Internet",
          "What time do you use the Internet",
          "What do you usually do on the Internet"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "—How wonderfully you are playing the piano! ________ do you practice it? —Twice a week. Practice makes perfect.",
        "correctOption": "How often",
        "wrongOptions": [
          "How many",
          "How long",
          "How much"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "—________ do you hang out with friends? —Hardly ever. I don't have much free time right now.",
        "correctOption": "How often",
        "wrongOptions": [
          "How long",
          "How far",
          "How soon"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "—________ do you play sports, Tina? —Every day. It's necessary for us to play sports an hour a day at school.",
        "correctOption": "How often",
        "wrongOptions": [
          "How long",
          "How soon",
          "How far"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "—________ is the Yellow River? —It is about 5,464 km.",
        "correctOption": "How long",
        "wrongOptions": [
          "How deep",
          "How wide",
          "How high"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "—________ is it from your home to school? —It's about 15 minutes' walk.",
        "correctOption": "How far",
        "wrongOptions": [
          "How long",
          "How soon"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "— ________ do you sleep every day, Eric? — For about eight hours.",
        "correctOption": "How long",
        "wrongOptions": [
          "How much",
          "How far",
          "How often"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "—________ will you stay in Shanghai? —For about three weeks.",
        "correctOption": "How long",
        "wrongOptions": [
          "How far",
          "How often",
          "How many"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "—________ does it take to get to school? —It takes about 20 minutes by bus.",
        "correctOption": "How long",
        "wrongOptions": [
          "How far",
          "How soon",
          "How often"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "—________ is Betty's home from school? —800 metres. Her home is close to school.",
        "correctOption": "How far",
        "wrongOptions": [
          "How many",
          "How long"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "—________ will he come back? —In ten minutes.",
        "correctOption": "How soon",
        "wrongOptions": [
          "How far",
          "How long",
          "How often"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "—________ is your brother? —________ twelve.",
        "correctOption": "How old; He's",
        "wrongOptions": [
          "How old; His",
          "How; He is",
          "What; He's"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "—________ is the Mount Qomolangma now? —It is 8848.86 meters.",
        "correctOption": "How high",
        "wrongOptions": [
          "How long",
          "How far",
          "How big"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "— __________was Janek Mela when he got to the North Pole? — He was only 15 years old then.",
        "correctOption": "How old",
        "wrongOptions": [
          "How long",
          "How far",
          "How many"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "—________ is that tree? —It's six meters tall.",
        "correctOption": "How tall",
        "wrongOptions": [
          "How long",
          "How many",
          "How much"
        ],
        "knowledgePoint": "how短语特殊疑问句"
      },
      {
        "stem": "—Would you like a cup of tea ________ a glass of juice? —A glass of juice, please.",
        "correctOption": "or",
        "wrongOptions": [
          "and",
          "with",
          "but"
        ],
        "knowledgePoint": "选择疑问句"
      },
      {
        "stem": "— Does Mark have a big mouth or a small mouth? — ________.",
        "correctOption": "He has a big mouth",
        "wrongOptions": [
          "Yes, he has a big mouth",
          "No, he has a small mouth",
          "Yes, he does"
        ],
        "knowledgePoint": "选择疑问句"
      },
      {
        "stem": "—________? —He is very heavy.",
        "correctOption": "Is Jack thin or heavy",
        "wrongOptions": [
          "Is Jack thin",
          "Is Jack heavy",
          "Is Jack tall or short"
        ],
        "knowledgePoint": "选择疑问句"
      },
      {
        "stem": "—Which one do you like, swimming or fishing? —________. I really want to have a house with a swimming pool.",
        "correctOption": "Swimming",
        "wrongOptions": [
          "Yes, I do",
          "No, I don't",
          "Fishing"
        ],
        "knowledgePoint": "选择疑问句"
      },
      {
        "stem": "What does your sister like, music, art ________ sports?",
        "correctOption": "or",
        "wrongOptions": [
          "and",
          "but",
          "∕"
        ],
        "knowledgePoint": "选择疑问句"
      },
      {
        "stem": "________ does he usually go to work, by bus or on foot?",
        "correctOption": "How",
        "wrongOptions": [
          "What",
          "Where",
          "When"
        ],
        "knowledgePoint": "选择疑问句"
      },
      {
        "stem": "—________ robot is yours, the big one or the small one? —The big one.",
        "correctOption": "Which",
        "wrongOptions": [
          "What",
          "How many",
          "Whose"
        ],
        "knowledgePoint": "选择疑问句"
      },
      {
        "stem": "—________ would you like to live, Chengdu, Beijing or Shanghai? —Chengdu, I think.",
        "correctOption": "Where",
        "wrongOptions": [
          "How",
          "What",
          "When"
        ],
        "knowledgePoint": "选择疑问句"
      },
      {
        "stem": "—Volunteers from Lantian Saving Team have saved many travellers in the mountains. —________ they are!",
        "correctOption": "What great men",
        "wrongOptions": [
          "How great a man",
          "How great men",
          "What a great man"
        ],
        "knowledgePoint": "What感叹句"
      },
      {
        "stem": "________ terrible news! Three of us didn’t pass the exam.",
        "correctOption": "What",
        "wrongOptions": [
          "How",
          "What a",
          "How a"
        ],
        "knowledgePoint": "What感叹句"
      },
      {
        "stem": "—________ sweet song it is! —Yeah. It’s My Heart Will Go Onby Celine Dion.",
        "correctOption": "What a",
        "wrongOptions": [
          "How",
          "How a",
          "What"
        ],
        "knowledgePoint": "What感叹句"
      },
      {
        "stem": "________ quickly the time passed!",
        "correctOption": "How",
        "wrongOptions": [
          "What",
          "What a",
          "How a"
        ],
        "knowledgePoint": "How感叹句"
      },
      {
        "stem": "— Our school carries out the policy to solve the problem. — ________ We hope it can work well.",
        "correctOption": "How good the plan is!",
        "wrongOptions": [
          "How good is the plan!",
          "How bad is the plan!",
          "How bad the plan is!"
        ],
        "knowledgePoint": "How感叹句"
      },
      {
        "stem": "_______ beautiful she is!",
        "correctOption": "How",
        "wrongOptions": [
          "What",
          "What a",
          "How a"
        ],
        "knowledgePoint": "How感叹句"
      },
      {
        "stem": "A set of keys _______ here and some ID cards _______ on the table.",
        "correctOption": "is,are",
        "wrongOptions": [
          "is,is",
          "are,is",
          "are,are"
        ],
        "knowledgePoint": "系动词"
      },
      {
        "stem": "—Mum, flowers for you. Happy Mother's Day! —Thanks, my son. They ________ so sweet.",
        "correctOption": "smell",
        "wrongOptions": [
          "get",
          "sound",
          "taste"
        ],
        "knowledgePoint": "系动词"
      },
      {
        "stem": "—Do you think eating too much food ________ good for us? —I don't think so. We should do some exercise, I think.",
        "correctOption": "is",
        "wrongOptions": [
          "are",
          "was"
        ],
        "knowledgePoint": "系动词"
      },
      {
        "stem": "—Wow, what's mother cooking in the kitchen? It______so nice. —Fish, I guess. Let's have a look.",
        "correctOption": "smells",
        "wrongOptions": [
          "tastes",
          "sounds"
        ],
        "knowledgePoint": "系动词"
      },
      {
        "stem": "The cotton______very soft and______white, I think it has good quality.",
        "correctOption": "feels,looks",
        "wrongOptions": [
          "is felt,is looked",
          "smells,sounds",
          "is felt,looks"
        ],
        "knowledgePoint": "系动词"
      },
      {
        "stem": "Behind the playground ______ some tall trees,but there aren't flowers.",
        "correctOption": "are;any",
        "wrongOptions": [
          "is;some",
          "has;any",
          "have;some"
        ],
        "knowledgePoint": "系动词"
      },
      {
        "stem": "The pancake tastes really ______. I'd like one more please.",
        "correctOption": "good",
        "wrongOptions": [
          "well",
          "bad",
          "badly"
        ],
        "knowledgePoint": "系动词"
      },
      {
        "stem": "I enjoy learning English ________ it takes me a lot of time.",
        "correctOption": "though",
        "wrongOptions": [
          "unless",
          "because",
          "for"
        ],
        "knowledgePoint": "让步状语从句"
      },
      {
        "stem": "________ he was ill yesterday, ________ he still went to school.",
        "correctOption": "Though; /",
        "wrongOptions": [
          "/; though",
          "Though; but",
          "But; though"
        ],
        "knowledgePoint": "让步状语从句"
      },
      {
        "stem": "—My little sister hardly ever eats vegetables ________ it's good for her health. —It's not a good habit.",
        "correctOption": "although",
        "wrongOptions": [
          "because",
          "so",
          "and"
        ],
        "knowledgePoint": "让步状语从句"
      },
      {
        "stem": "________ I know Nelly, I hardly talk to her.",
        "correctOption": "Although",
        "wrongOptions": [
          "Because",
          "And",
          "So"
        ],
        "knowledgePoint": "让步状语从句"
      },
      {
        "stem": "—Why does everybody believe in Bruce no matter ________ he says? —Because he is honest. He never tells a lie.",
        "correctOption": "what",
        "wrongOptions": [
          "when",
          "how",
          "who"
        ],
        "knowledgePoint": "让步状语从句"
      },
      {
        "stem": "______ well you drive, you must drive carefully.",
        "correctOption": "No matter how",
        "wrongOptions": [
          "No matter where",
          "In order that",
          "As soon as"
        ],
        "knowledgePoint": "让步状语从句"
      },
      {
        "stem": "Bill decided to climb K2 (乔戈里峰 ), the world’s second highest mountain, ________ he knew it was dangerous.",
        "correctOption": "even though",
        "wrongOptions": [
          "so that",
          "as if"
        ],
        "knowledgePoint": "让步状语从句"
      },
      {
        "stem": "—The Dragon Boat races are so exciting, but our boat is still behind. —Don’t worry. I am sure ________ our team will win!",
        "correctOption": "that",
        "wrongOptions": [
          "if",
          "whether",
          "why"
        ],
        "knowledgePoint": "语法 -宾语从句的引导词"
      },
      {
        "stem": "He thinks ________ the race is very interesting.",
        "correctOption": "/",
        "wrongOptions": [
          "what",
          "where",
          "how"
        ],
        "knowledgePoint": "语法 -宾语从句的引导词"
      },
      {
        "stem": "We'll plant trees tomorrow, but I don't know ________ Tom will come and join us.",
        "correctOption": "if",
        "wrongOptions": [
          "which",
          "what",
          "where"
        ],
        "knowledgePoint": "语法 -宾语从句的引导词"
      },
      {
        "stem": "No one knows _______ the professor will come to our school tomorrow to give us a talk or not.",
        "correctOption": "whether",
        "wrongOptions": [
          "when",
          "where",
          "weather"
        ],
        "knowledgePoint": "语法 -宾语从句的引导词"
      },
      {
        "stem": "It’s difficult to imagine ________ it is like in that village after the earthquake.",
        "correctOption": "what",
        "wrongOptions": [
          "when",
          "where",
          "which"
        ],
        "knowledgePoint": "语法 -宾语从句的引导词"
      },
      {
        "stem": "— Look at the stone bridge! Do you know ________ it was built? — In the 1860s. It is quite old.",
        "correctOption": "when",
        "wrongOptions": [
          "how",
          "where",
          "why"
        ],
        "knowledgePoint": "语法 -宾语从句的引导词"
      },
      {
        "stem": "—Do you know that girl in red under the tree? —Sorry. I don’t know ________.",
        "correctOption": "who she is",
        "wrongOptions": [
          "what is she",
          "which is she",
          "how she is"
        ],
        "knowledgePoint": "语法 -宾语从句的引导词"
      },
      {
        "stem": "— Winter vacation is coming! Could you tell me ________? — Xi’an. I really want to visit the Terracotta Army(兵⻢俑).",
        "correctOption": "where you are going",
        "wrongOptions": [
          "how are you going",
          "what are you going",
          "when you are going"
        ],
        "knowledgePoint": "语法 -宾语从句的引导词"
      },
      {
        "stem": "I _______ he _______ tomorrow.",
        "correctOption": "don’t think; will come",
        "wrongOptions": [
          "think; won’t come",
          "not think; will come",
          "think; don’t come"
        ],
        "knowledgePoint": "宾语从句的否定前移"
      },
      {
        "stem": "I want to know _______.",
        "correctOption": "what she thinks of our school",
        "wrongOptions": [
          "how does she go to school every day",
          "where did she go on vacation",
          "how far does she live from the school"
        ],
        "knowledgePoint": "语法 -宾语从句的语序"
      },
      {
        "stem": "—Excuse me. Could you tell me ________? —Yes. There is a video shop on River Road.",
        "correctOption": "where I can buy some CDs",
        "wrongOptions": [
          "where can I buy some CDs",
          "when can I buy some CDs",
          "when I can buy some CDs"
        ],
        "knowledgePoint": "语法 -宾语从句的语序"
      },
      {
        "stem": "—Do you know ________ the Capital Museum? —Maybe next Friday.",
        "correctOption": "when they will visit",
        "wrongOptions": [
          "when will they visit",
          "when did they visit",
          "when they visited"
        ],
        "knowledgePoint": "语法 -宾语从句的语序"
      },
      {
        "stem": "I don’t feel very well. Mum asked me ______ this morning.",
        "correctOption": "what was wrong",
        "wrongOptions": [
          "what the matter is",
          "what is wrong",
          "what wrong was"
        ],
        "knowledgePoint": "语法 -宾语从句的语序"
      },
      {
        "stem": "Tom asked whether ________ after he finished his project.",
        "correctOption": "he could go to the cinema",
        "wrongOptions": [
          "could he go to the cinema",
          "he can go to the cinema"
        ],
        "knowledgePoint": "语法 -宾语从句的语序"
      },
      {
        "stem": "I don't know _________ the day after tomorrow.",
        "correctOption": "whether he'll come",
        "wrongOptions": [
          "when does he come",
          "how will he come",
          "if he comes"
        ],
        "knowledgePoint": "语法 -宾语从句的语序"
      },
      {
        "stem": "The parents hope their son ________ a football player when he grows up.",
        "correctOption": "will be",
        "wrongOptions": [
          "does",
          "to be",
          "do"
        ],
        "knowledgePoint": "语法 -宾语从句的时态"
      },
      {
        "stem": "—Judy, could you tell me _________ the schoolbag? —Oh, yes. I bought it in a store on the Internet.",
        "correctOption": "where you bought",
        "wrongOptions": [
          "where did you buy",
          "where will you buy",
          "where you will buy"
        ],
        "knowledgePoint": "语法 -宾语从句的时态"
      },
      {
        "stem": "Who can tell us ______ about over there?",
        "correctOption": "what they are talking",
        "wrongOptions": [
          "what they talk",
          "what do they talk",
          "what are they talking"
        ],
        "knowledgePoint": "语法 -宾语从句的时态"
      },
      {
        "stem": "—Let’s go fishing if it ________ this weekend. —But nobody knows if it ________.",
        "correctOption": "is fine; will rain",
        "wrongOptions": [
          "will be fine; rains",
          "will be fine; will rain",
          "is fine; rains"
        ],
        "knowledgePoint": "语法 -宾语从句的时态"
      },
      {
        "stem": "—Jenny, do you know when our African friend ________ in Chongqing? —I’m not sure, mom. When he ________ tomorrow, I will tell you right away.",
        "correctOption": "will arrive; arrives",
        "wrongOptions": [
          "arrives; arrives",
          "arrives; will arrive",
          "will arrive; will arrive"
        ],
        "knowledgePoint": "语法 -宾语从句的时态"
      },
      {
        "stem": "—What did your son say in the letter? —He told me that he ________ the Disney World the next day.",
        "correctOption": "would visit",
        "wrongOptions": [
          "will visit",
          "has visited",
          "is going to visit"
        ],
        "knowledgePoint": "语法 -宾语从句的时态"
      },
      {
        "stem": "— Honey, what did Jason say to you? — Oh, he asked me ________.",
        "correctOption": "where his brother had gone",
        "wrongOptions": [
          "if I know where his brother has gone",
          "when will brother come back",
          "why his brother doesn’t take him out"
        ],
        "knowledgePoint": "语法 -宾语从句的时态"
      },
      {
        "stem": "The geography teacher told us that the sun _________ in the east.",
        "correctOption": "rises",
        "wrongOptions": [
          "has risen",
          "would rise",
          "rose"
        ],
        "knowledgePoint": "语法 -宾语从句的时态"
      },
      {
        "stem": "Yesterday the teacher told us the earth ________ the sun.",
        "correctOption": "goes around",
        "wrongOptions": [
          "went around",
          "is going around",
          "would go around"
        ],
        "knowledgePoint": "语法 -宾语从句的时态"
      },
      {
        "stem": "I like the clothes ________ make me feel comfortable.",
        "correctOption": "that",
        "wrongOptions": [
          "who",
          "what",
          "whatever"
        ],
        "knowledgePoint": "关系代词 that/which引导的定语从句"
      },
      {
        "stem": "We should value the friendship ________ we have developed in the past years.",
        "correctOption": "that",
        "wrongOptions": [
          "who",
          "whose",
          "what"
        ],
        "knowledgePoint": "关系代词 that/which引导的定语从句"
      },
      {
        "stem": "Rome is an ancient city _______ is full of places of interest.",
        "correctOption": "which",
        "wrongOptions": [
          "where",
          "who"
        ],
        "knowledgePoint": "关系代词 that/which引导的定语从句"
      },
      {
        "stem": "—Why are you so worried? —I've lost the computer ________ my father bought me on my birthday.",
        "correctOption": "which",
        "wrongOptions": [
          "what",
          "who"
        ],
        "knowledgePoint": "关系代词 that/which引导的定语从句"
      },
      {
        "stem": "I like the city in ________ the people are really kind and friendly.",
        "correctOption": "which",
        "wrongOptions": [
          "that",
          "where",
          "who"
        ],
        "knowledgePoint": "关系代词 that/which引导的定语从句"
      },
      {
        "stem": "The weather turned out to be very good, ________ was more than we could expect.",
        "correctOption": "which",
        "wrongOptions": [
          "what",
          "that",
          "it"
        ],
        "knowledgePoint": "关系代词 that/which引导的定语从句"
      },
      {
        "stem": "I can’t forget the teachers and the university ________ I visited two years ago. They brought me many sweet memories.",
        "correctOption": "that",
        "wrongOptions": [
          "which",
          "what"
        ],
        "knowledgePoint": "关系代词 that/which引导的定语从句"
      },
      {
        "stem": "—Have you seen the film The Wandering Earth (《流浪地球》)? —Yes. It's the best one ________ I have ever seen.",
        "correctOption": "that",
        "wrongOptions": [
          "which",
          "where",
          "why"
        ],
        "knowledgePoint": "关系代词 that/which引导的定语从句"
      },
      {
        "stem": "Zhong Nanshan is a brave doctor ________ is known to millions of Chinese people.",
        "correctOption": "who",
        "wrongOptions": [
          "which",
          "what",
          "when"
        ],
        "knowledgePoint": "关系代词 who/whom引导的定语从句"
      },
      {
        "stem": "We should remember those ________ lost their lives for our country.",
        "correctOption": "who",
        "wrongOptions": [
          "whom",
          "which"
        ],
        "knowledgePoint": "关系代词 who/whom引导的定语从句"
      },
      {
        "stem": "—Do you know the boy with ________ Ms. Green is talking? —Oh, that’s Peter. He's going to make a speech at our graduation party.",
        "correctOption": "whom",
        "wrongOptions": [
          "that",
          "what"
        ],
        "knowledgePoint": "关系代词 who/whom引导的定语从句"
      },
      {
        "stem": "The book ________ he bought yesterday is very interesting.",
        "correctOption": "/",
        "wrongOptions": [
          "why",
          "when",
          "what"
        ],
        "knowledgePoint": "定语从句注意事项"
      },
      {
        "stem": "She is one of the teachers who always ________ the students laugh.",
        "correctOption": "make",
        "wrongOptions": [
          "makes",
          "has made"
        ],
        "knowledgePoint": "定语从句注意事项"
      },
      {
        "stem": "The students who ________ my classmates are going to help the old man.",
        "correctOption": "are",
        "wrongOptions": [
          "am",
          "is"
        ],
        "knowledgePoint": "定语从句注意事项"
      },
      {
        "stem": "She is the only one of the students who _______ praised.",
        "correctOption": "was",
        "wrongOptions": [
          "were",
          "has",
          "have been"
        ],
        "knowledgePoint": "定语从句注意事项"
      }
    ],
    "下册": []
  }
};

if (typeof window !== "undefined") window.grammarQuestionBank = grammarQuestionBank;
if (typeof module !== "undefined" && module.exports) module.exports = grammarQuestionBank;
