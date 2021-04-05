// type
const TYPE_MONSTER		=0x1		//怪兽卡
const TYPE_SPELL		=0x2		//魔法卡
const TYPE_TRAP			=0x4		//陷阱卡

// color type
const TYPE_NORMAL			=0x10		//通常怪兽
const TYPE_EFFECT			=0x20		//效果
const TYPE_FUSION			=0x40		//融合
const TYPE_RITUAL			=0x80		//仪式
const TYPE_SYNCHRO		=0x2000		//同调
const TYPE_XYZ			=0x800000	//超量
const TYPE_PENDULUM		=0x1000000	//灵摆
const TYPE_LINK			=0x4000000	//连接
const TYPE_EXT = TYPE_FUSION | TYPE_SYNCHRO | TYPE_XYZ | TYPE_LINK;

// extype
const TYPE_SPIRIT		=0x200		//灵魂
const TYPE_UNION		=0x400		//同盟
const TYPE_DUAL			=0x800		//二重
const TYPE_TUNER		=0x1000		//调整
const TYPE_TOKEN		=0x4000		//衍生物
const TYPE_FLIP			=0x200000	//翻转
const TYPE_TOON			=0x400000	//卡通
const TYPE_SPSUMMON		=0x2000000	//特殊召唤

// spell type
const TYPE_QUICKPLAY		=0x10000	//速攻
const TYPE_CONTINUOUS		=0x20000	//永续
const TYPE_EQUIP			=0x40000	//装备
//const TYPE_RITUAL			=0x80
const TYPE_FIELD			=0x80000	//场地

// trap type
//const TYPE_CONTINUOUS		=0x20000
const TYPE_COUNTER		=0x100000	//反击

// race
const RACE_WARRIOR		=0x1		//战士
const RACE_SPELLCASTER	=0x2		//魔法师
const RACE_FAIRY		=0x4		//天使
const RACE_FIEND		=0x8		//恶魔
const RACE_ZOMBIE		=0x10		//不死
const RACE_MACHINE		=0x20		//机械
const RACE_AQUA			=0x40		//水
const RACE_PYRO			=0x80		//炎
const RACE_ROCK			=0x100		//岩石
const RACE_WINDBEAST	=0x200		//鸟兽
const RACE_PLANT		=0x400		//植物
const RACE_INSECT		=0x800		//昆虫
const RACE_THUNDER		=0x1000			//雷
const RACE_DRAGON		=0x2000		//龙
const RACE_BEAST		=0x4000		//兽
const RACE_BEASTWARRIOR	=0x8000			//兽战士
const RACE_DINOSAUR		=0x10000		//恐龙
const RACE_FISH			=0x20000		//鱼
const RACE_SEASERPENT	=0x40000	//海龙
const RACE_REPTILE		=0x80000		//爬虫类
const RACE_PSYCHO		=0x100000	//念动力
const RACE_DIVINE		=0x200000	//幻神兽
const RACE_CREATORGOD	=0x400000	//创造神
const RACE_WYRM			=0x800000		//幻龙
const RACE_CYBERSE		=0x1000000		//电子界

// attr
const ATTRIBUTE_EARTH	=0x01		//地
const ATTRIBUTE_WATER	=0x02		//水
const ATTRIBUTE_FIRE	=0x04		//炎
const ATTRIBUTE_WIND	=0x08		//风
const ATTRIBUTE_LIGHT	=0x10		//光
const ATTRIBUTE_DARK	=0x20		//暗
const ATTRIBUTE_DIVINE	=0x40		//神

// Link Marker
const LINK_MARKER_BOTTOM_LEFT	=0x001 // ↙
const LINK_MARKER_BOTTOM		=0x002 // ↓
const LINK_MARKER_BOTTOM_RIGHT	=0x004 // ↘

const LINK_MARKER_LEFT			=0x008 // ←
const LINK_MARKER_RIGHT			=0x020 // →

const LINK_MARKER_TOP_LEFT		=0x040 // ↖
const LINK_MARKER_TOP			=0x080 // ↑
const LINK_MARKER_TOP_RIGHT		=0x100 // ↗

const attr_to_str = {
	[ATTRIBUTE_EARTH]: '地',
	[ATTRIBUTE_WATER]: '水',
	[ATTRIBUTE_FIRE]: '炎',
	[ATTRIBUTE_WIND]: '風',
	[ATTRIBUTE_LIGHT]: '光',
	[ATTRIBUTE_DARK]: '暗',
	[ATTRIBUTE_DIVINE]: '神'
};

const race_to_str = {
	[RACE_WARRIOR]: '戰士',
	[RACE_SPELLCASTER]: '魔法使',
	[RACE_FAIRY]: '天使',
	[RACE_FIEND]: '惡魔',
	[RACE_ZOMBIE]: '不死',
	[RACE_MACHINE]: '機械',
	[RACE_AQUA]: '水',
	[RACE_PYRO]: '炎',
	[RACE_ROCK]: '岩石',
	[RACE_WINDBEAST]: '鳥獸',
	[RACE_PLANT]: '植物',
	[RACE_INSECT]: '昆蟲',
	[RACE_THUNDER]: '雷',
	[RACE_DRAGON]: '龍',
	[RACE_BEAST]: '獸',
	[RACE_BEASTWARRIOR]: '獸戰士',
	[RACE_DINOSAUR]: '恐龍',
	[RACE_FISH]: '魚',
	[RACE_SEASERPENT]: '海龍',
	[RACE_REPTILE]: '爬蟲類',
	[RACE_PSYCHO]: '超能',
	[RACE_DIVINE]: '幻神獸',
	[RACE_CREATORGOD]: '創造神',
	[RACE_WYRM]: '幻龍',
	[RACE_CYBERSE]: '電子界'
};
