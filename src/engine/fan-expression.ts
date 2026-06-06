import type { FanExpressionInput, FanExpression, ExpressionVersion, ExpressionTone } from '../types';

// ── Templates per scenario + tone ──────────────────────────────────────────

interface VersionTemplate {
  korean: string;
  english: string;
  pronunciation: string;
  usageNote: string;
}

interface ScenarioTemplate {
  keywords: string[];
  toneLabel: string;
  formal: VersionTemplate;
  natural: VersionTemplate;
  cute: VersionTemplate;
}

const SCENARIOS: ScenarioTemplate[] = [
  {
    keywords: ['love', 'love you', 'i love', 'adore', 'admire', 'crush', 'amazing', 'perfect', 'idol', 'inspiration', 'role model', 'favorite', 'best', 'number one', 'the best'],
    toneLabel: 'Warm & Heartfelt',
    formal: {
      korean: '진심으로 사랑합니다. 항상 응원하겠습니다.',
      english: 'I sincerely love you. I will always support you.',
      pronunciation: 'Jinsimeuro saranghamnida. Hangsang eungwonhagessseumnida.',
      usageNote: 'Use at formal fan-sign events or when speaking to senior artists.',
    },
    natural: {
      korean: '정말 사랑해요! 항상 응원할게요.',
      english: 'I really love you! I\'ll always cheer for you.',
      pronunciation: 'Jeongmal saranghaeyo! Hangsang eungwonhalgeyo.',
      usageNote: 'Perfect for casual fan meetings and everyday messages.',
    },
    cute: {
      korean: '사랑해용~ 💕 항상 응원할겡~',
      english: 'Love youu~ 💕 I\'ll always cheeer for you~',
      pronunciation: 'Saranghaeyong~ Eungwonhalgeng~',
      usageNote: 'Use with younger artists or when you want to show extra affection.',
    },
  },
  {
    keywords: ['thank', 'thanks', 'grateful', 'appreciate', 'blessing', 'thank you', 'thankful', 'gratitude'],
    toneLabel: 'Respectful & Sincere',
    formal: {
      korean: '진심으로 감사드립니다. 덕분에 매일이 행복합니다.',
      english: 'I am truly grateful. Thanks to you, every day is happy.',
      pronunciation: 'Jinsimeuro gamsadeurimnida. Deokbune maeiri haengbokamnida.',
      usageNote: 'Ideal for official letters, formal events, or expressing deep gratitude.',
    },
    natural: {
      korean: '정말 감사해요! 덕분에 힘이 나요.',
      english: 'Thank you so much! You give me strength.',
      pronunciation: 'Jeongmal gamsahaeyo! Deokbune himi nayo.',
      usageNote: 'Great for everyday fan messages and social media posts.',
    },
    cute: {
      korean: '고마워용~ 🥹 덕분에 완전 행복해용~',
      english: 'Thank youu~ 🥹 I\'m so happy thanks to youu~',
      pronunciation: 'Gomawoyong~ Deokbune wanjeon haengbokhaeyong~',
      usageNote: 'Use when you want to be extra sweet and endearing.',
    },
  },
  {
    keywords: ['support', 'cheer', 'fighting', 'proud', 'believe', 'always', 'forever', 'rooting', 'root for', 'side'],
    toneLabel: 'Energetic & Cheerful',
    formal: {
      korean: '항상 응원하겠습니다! 당신의 길에 박수를 보냅니다.',
      english: 'I will always support you! I send applause to your path.',
      pronunciation: 'Hangsang eungwonhagessseumnida! Dangsine gire baksureul bomnida.',
      usageNote: 'Use at concerts or official events for a respectful cheer.',
    },
    natural: {
      korean: '파이팅! 항상 응원할게요!',
      english: 'Fighting! I\'ll always cheer for you!',
      pronunciation: 'Paiting! Hangsang eungwonhalgeyo!',
      usageNote: 'The go-to phrase for concerts, comebacks, and everyday support.',
    },
    cute: {
      korean: '홧팅홧팅~ 🌟 우리 오빠/언니 짱짱!',
      english: 'Fighting fighting~ 🌟 Our oppa/unnie is the bestest!',
      pronunciation: 'Hwating hwating~ Uri oppa/unnie jjang jjang!',
      usageNote: 'Perfect for social media comments and light-hearted support.',
    },
  },
  {
    keywords: ['tired', 'rest', 'health', 'care', 'worry', 'stay strong', 'healthy', 'rest well', 'take care', 'sleep', 'eat'],
    toneLabel: 'Gentle & Caring',
    formal: {
      korean: '건강이 가장 중요합니다. 무리하지 마시고 꼭 쉬세요.',
      english: 'Health is most important. Please don\'t overwork and rest well.',
      pronunciation: 'Geongangi gajang jungyohamnida. Murihaji masigo kkok swiseyo.',
      usageNote: 'Use when your artist looks tired or during intensive comeback periods.',
    },
    natural: {
      korean: '아프지 말고 꼭 쉬어요. 당신의 건강이 제일 중요해요.',
      english: 'Don\'t get sick and please rest. Your health is most important.',
      pronunciation: 'Apeuji malgo kkok swieoyo. Dangsine geongangi jeil jungyohaeyo.',
      usageNote: 'A warm, caring message for everyday check-ins.',
    },
    cute: {
      korean: '아프지 마용~ 🥺 밥 잘 챙겨 먹구, 푹 쉬어용~',
      english: 'Don\'t be sick~ 🥺 Eat well and rest deep~',
      pronunciation: 'Apeuji mayong~ Bap jal chaenggyeo meokgu, puk swieoyong~',
      usageNote: 'The sweetest way to tell your idol to take care of themselves.',
    },
  },
  {
    keywords: ['meet', 'finally', 'dream', 'waited', 'excited', 'happy', 'joy', "can't wait", 'looking forward'],
    toneLabel: 'Excited & Joyful',
    formal: {
      korean: '드디어 만나 뵙게 되어 영광입니다. 꿈만 같습니다.',
      english: 'I am honored to finally meet you. It feels like a dream.',
      pronunciation: 'Deudieo manna boepge doeeo yeonggwangimnida. Kkumman gatseumnida.',
      usageNote: 'For official fan-sign events or first-time meetings with senior artists.',
    },
    natural: {
      korean: '드디어 만나서 너무 기뻐요! 꿈만 같아요!',
      english: 'I\'m so happy to finally meet you! It feels like a dream!',
      pronunciation: 'Deudieo mannaseo neomu gippeoyo! Kkumman gatayo!',
      usageNote: 'Perfect for fan-sign events and meet-and-greets.',
    },
    cute: {
      korean: '드디어 만났당~ 🥳 너무 떨리고 설레용~',
      english: 'Finally met youu~ 🥳 I\'m so nervous and excited~',
      pronunciation: 'Deudieo mannatdang~ Neomu tteolligo seolleyong~',
      usageNote: 'Great for casual fan meetings or when you want to show pure excitement.',
    },
  },
  {
    keywords: ['goodbye', 'miss', 'wait', 'next time', 'see you', 'come back', 'until', 'soon', 'already'],
    toneLabel: 'Affectionate & Longing',
    formal: {
      korean: '다음에 또 뵙겠습니다. 그날까지 건강하십시오.',
      english: 'I will see you again next time. Please stay healthy until that day.',
      pronunciation: 'Daeume tto boepgessseumnida. Geunalkkaji geonganghasipsio.',
      usageNote: 'A respectful farewell for formal events or when parting after a long wait.',
    },
    natural: {
      korean: '다음에 또 만나요! 보고 싶을 거예요.',
      english: 'See you next time! I\'ll miss you.',
      pronunciation: 'Daeume tto mannayo! Bogo sipeul geoyeyo.',
      usageNote: 'The natural way to say goodbye at any fan event.',
    },
    cute: {
      korean: '벌써 헤어지기 시러용~ 🥺 다음에 꼭 또 봐용~',
      english: 'I don\'t wanna part already~ 🥺 See you again for suree~',
      pronunciation: 'Beolsseo heeojigi sireoyong~ Daeume kkok tto bwayong~',
      usageNote: 'For when you want to be adorably reluctant to leave.',
    },
  },
];

// ── Mood-based fallbacks ───────────────────────────────────────────────────

const DEFAULT_BY_MOOD: Record<string, ScenarioTemplate> = {
  sweet: {
    keywords: [],
    toneLabel: 'Warm & Heartfelt',
    formal: { korean: '오늘 정말 아름답습니다. 행복한 하루 보내세요.', english: 'You are truly beautiful today. Have a happy day.', pronunciation: 'Oneul jeongmal areumdapseumnida. Haengbokan haru bonaeseyo.', usageNote: 'A warm, respectful compliment for any formal setting.' },
    natural: { korean: '오늘 정말 예뻐요! 행복한 하루 보내요.', english: 'You look really pretty today! Have a happy day.', pronunciation: 'Oneul jeongmal yeppeoyo! Haengbokan haru bonaeyo.', usageNote: 'A sweet compliment for everyday moments.' },
    cute: { korean: '오늘 완전 이뽀용~ 🍬 행복한 하루 보내용~', english: 'You\'re super pwetty today~ 🍬 Have a happy dayy~', pronunciation: 'Oneul wanjeon ippoyong~ Haengbokan haru bonaeyong~', usageNote: 'The sweetest compliment for your favorite artist.' },
  },
  passionate: {
    keywords: [],
    toneLabel: 'Energetic & Cheerful',
    formal: { korean: '최고입니다! 정말 대단하십니다!', english: 'You are the best! You are truly amazing!', pronunciation: 'Choegoimnida! Jeongmal daedanhasimnida!', usageNote: 'A powerful cheer for concerts and performances.' },
    natural: { korean: '최고예요! 정말 멋져요!', english: 'You\'re the best! So cool!', pronunciation: 'Choegoyeyo! Jeongmal meotjyeoyo!', usageNote: 'The ultimate fan chant for any occasion.' },
    cute: { korean: '짱짱! 완전 멋져부려용~ 🔥', english: 'Best best! Totally aweeesome~ 🔥', pronunciation: 'Jjang jjang! Wanjeon meotjyeoburyeoyong~', usageNote: 'Hyped-up support for social media and live chats.' },
  },
  shy: {
    keywords: [],
    toneLabel: 'Gentle & Caring',
    formal: { korean: '떨리지만… 진심으로 좋아합니다.', english: 'I\'m nervous but… I sincerely like you.', pronunciation: 'Tteollijiman… jinsimeuro joahamnida.', usageNote: 'A quiet but sincere confession for formal moments.' },
    natural: { korean: '떨리지만… 정말 좋아해요.', english: 'I\'m nervous but… I really like you.', pronunciation: 'Tteollijiman… jeongmal joahaeyo.', usageNote: 'For when you want to be honest but keep it natural.' },
    cute: { korean: '부끄부끄… 🫣 정말 조아해용~', english: 'Shy shy… 🫣 I weally wike youu~', pronunciation: 'Bukkeubukkeu… Jeongmal joahaeyong~', usageNote: 'The most adorable way to share your feelings.' },
  },
  funny: {
    keywords: [],
    toneLabel: 'Playful & Fun',
    formal: { korean: '오늘 정말 즐겁습니다! 웃음이 끊이지 않네요!', english: 'Today is truly enjoyable! The laughter never stops!', pronunciation: 'Oneul jeongmal jeulgeopseumnida! Useumi kkeunci anneuneyo!', usageNote: 'A respectful, fun message for variety show recordings.' },
    natural: { korean: '완전 웃겨요! 오늘도 대박이에요!', english: 'So funny! Today is daebak too!', pronunciation: 'Wanjeon utgyeoyo! Oneuldo daebagieyo!', usageNote: 'The perfect reaction for variety shows and live streams.' },
    cute: { korean: '꿀잼이양~ 🤣 오늘도 웃겨쥬셔서 감사용~', english: 'Super funnny~ 🤣 Thank youu for making us laugh~', pronunciation: 'Kkuljaemiyang~ Oneuldo utgyeojusyeoseo gamsayong~', usageNote: 'For when your idol\'s humor makes your day.' },
  },
  cool: {
    keywords: [],
    toneLabel: 'Confident & Smooth',
    formal: { korean: '정말 멋지십니다. 팬이 된 것을 후회한 적 없습니다.', english: 'You are truly cool. I have never regretted becoming a fan.', pronunciation: 'Jeongmal meotjisimnida. Paeni doen geoseul huhoehan jeok eopseumnida.', usageNote: 'A confident, cool compliment for formal settings.' },
    natural: { korean: '진짜 멋있어요. 팬이 된 걸 후회한 적 없어요.', english: 'Really cool. I\'ve never regretted being a fan.', pronunciation: 'Jinjja meosisseoyo. Paeni doen geol huhoehan jeok eopseoyo.', usageNote: 'A smooth, understated compliment for any occasion.' },
    cute: { korean: '완전 멋져부려용~ 😎 팬이라서 럭키비키잔앙~', english: 'Totally coool~ 😎 So lucky to be a fannn~', pronunciation: 'Wanjeon meotjyeoburyeoyong~ Paeniraseo reokibikijanang~', usageNote: 'A trendy, playful way to show your cool admiration.' },
  },
};

// ── Generator ──────────────────────────────────────────────────────────────

export function generateFanExpression(input: FanExpressionInput): FanExpression {
  const normalized = input.userInput.toLowerCase().trim();

  let matched: ScenarioTemplate | null = null;
  for (const scenario of SCENARIOS) {
    if (scenario.keywords.some((kw) => normalized.includes(kw))) {
      matched = scenario;
      break;
    }
  }

  const moodKey = (input.fanMood && input.fanMood in DEFAULT_BY_MOOD) ? input.fanMood : 'sweet';
  const moodDefault: ScenarioTemplate | undefined = (DEFAULT_BY_MOOD as Record<string, ScenarioTemplate | undefined>)[moodKey];
  const template: ScenarioTemplate = (matched ?? moodDefault ?? DEFAULT_BY_MOOD.sweet) as ScenarioTemplate;

  const tones: ExpressionTone[] = ['formal', 'natural', 'cute'];
  const versions: ExpressionVersion[] = tones.map((tone) => ({
    tone,
    korean: template[tone].korean,
    english: template[tone].english,
    pronunciation: template[tone].pronunciation,
    usageNote: template[tone].usageNote,
  }));

  return {
    userInput: input.userInput,
    toneLabel: template.toneLabel,
    versions,
    saved: [],
  };
}
