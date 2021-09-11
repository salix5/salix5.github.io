"use strict";
// type
const TYPE_MONSTER		=0x1		//怪兽卡
const TYPE_SPELL		=0x2		//魔法卡
const TYPE_TRAP			=0x4		//陷阱卡

// subtype
const TYPE_NORMAL			=0x10		//通常怪兽
const TYPE_EFFECT			=0x20		//效果
const TYPE_FUSION			=0x40		//融合
const TYPE_RITUAL			=0x80		//仪式
const TYPE_SYNCHRO		=0x2000		//同调
const TYPE_XYZ			=0x800000	//超量
const TYPE_PENDULUM		=0x1000000	//灵摆
const TYPE_LINK			=0x4000000	//连接
const ext = TYPE_FUSION | TYPE_SYNCHRO | TYPE_XYZ | TYPE_LINK;   

//extype
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

var config = {   
  locateFile: filename => `../query/dist/${filename}`    
}   

var db;
var equip_list = [];
var ss_list = [];
var id_list = [];

// excluded cards
var equip_exc = [
303660,
6203182,
6556178,
9622164,
11699941,
14463695,
22159429,
30979619,
34959756,
45305419,
48206762,
50371210,
52628687,
65993085,
66947913,
70828912,
71453557,
74694807,
78794994,
90239723,
90673413,
97617181,
98552723,
10204849,
];

var ss_exc = [
5489987,
7634581,
12206212,
39711336,
50702124,
63162310,
92377303,
];


function process_buffer(buf){
	let arr = new Uint8Array(buf);
	return arr;
}

// Print the id of the scripts in list which does not match regex (except cards in exc_list)
function process_id_list(list, regex, exc_list, str){
	document.write(`${str}<br>`);
	var promise_list = [];
	for(let i=0; i < list.length; ++i){
		const pr = fetch(`https://raw.githubusercontent.com/Fluorohydride/ygopro-scripts/master/c${list[i]}.lua`).then(response => response.text()).then(function(data){
			if(!regex.test(data) && !exc_list.includes(list[i]))
				document.write(`${list[i]}<br>`);
		});
		promise_list.push(pr);
	}
	return Promise.all(promise_list).then(function(values){
		document.write('done<br><br>');
	});
}

const promise_db = fetch("https://salix5.github.io/CardEditor/cards.cdb").then(response => response.arrayBuffer()).then(process_buffer);
const promise_sql = initSqlJs(config);

var re_equip = /EFFECT_FLAG_CONTINUOUS_TARGET/;
var re_ss = /EFFECT_FLAG_CANNOT_DISABLE\+EFFECT_FLAG_UNCOPYABLE/;
var re_9dig = /\d{9, }/;

Promise.all([promise_sql, promise_db]).then(function(values){
	var SQL = values[0];
	db = new SQL.Database(values[1]);
	
	var qstr0 = `SELECT id FROM datas WHERE abs(id - alias) >= 10`;
	var qstr = `${qstr0} AND type & ${TYPE_EQUIP};`
	var stmt = db.prepare(qstr);
	while(stmt.step()) {
		let row = stmt.getAsObject();
		equip_list.push(row.id);
	}
	qstr = `${qstr0} AND type & ${TYPE_SPSUMMON};`;
	stmt = db.prepare(qstr);
	while(stmt.step()) {
		let row = stmt.getAsObject();
		ss_list.push(row.id);
	}
	qstr = `${qstr0} AND NOT type & ${TYPE_TOKEN} AND type != ${TYPE_MONSTER | TYPE_NORMAL};`;
	stmt = db.prepare(qstr);
	while(stmt.step()) {
		let row = stmt.getAsObject();
		id_list.push(row.id);
	}
	/*process_id_list(equip_list, /EFFECT_FLAG_CONTINUOUS_TARGET/, equip_exc, 'Equip Spell: ').then(function(values){
		process_id_list(ss_list, /EFFECT_FLAG_CANNOT_DISABLE\+EFFECT_FLAG_UNCOPYABLE/, ss_exc, 'Special Summon Monsters: ');
	});*/
	var promise_list = [];
	for(let i=0; i < id_list.length; ++i){
		const pr = fetch(`https://raw.githubusercontent.com/Fluorohydride/ygopro-scripts/master/c${id_list[i]}.lua`).then(response => response.text()).then(function(data){
			if(re_9dig.test(data))
				document.write(`${id_list[i]}, 9dig<br>`);
			if(equip_list.includes(id_list[i])){
				if(!equip_exc.includes(id_list[i]) && !re_equip.test(data))
					document.write(`${id_list[i]}, equip<br>`);
			}
			else if(ss_list.includes(id_list[i])){
				if(!ss_exc.includes(id_list[i]) && !re_ss.test(data))
					document.write(`${id_list[i]}, ss<br>`);
			}
		});
		promise_list.push(pr);
	}
	Promise.all(promise_list).then(function(values){
		document.write('done<br>');
	});
});
