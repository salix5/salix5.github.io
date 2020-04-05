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
var id_list = [];
var script_list = [];

// known exceptions
var exc = [
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
98552723
];

/*
Check the scripts of all equip cards, and list scripts without EFFECT_FLAG_CONTINUOUS_TARGET.
Equip cards like Premature Burial are exceptions.
*/
initSqlJs(config).then(function(SQL){
	var xhr = new XMLHttpRequest();
	
	xhr.onload = e => {
		var arr1 = new Uint8Array(xhr.response);
		db = new SQL.Database(arr1);
		var qstr = 'SELECT id FROM datas WHERE type & ' + TYPE_EQUIP;
		var stmt = db.prepare(qstr);

		while(stmt.step()) {
			var row = stmt.getAsObject();
			id_list.push(row.id);
		}
		for(let i=0; i < id_list.length; ++i){
			let xhr_script = new XMLHttpRequest();
			xhr_script.onload = e => {
				let creg = /EFFECT_FLAG_CONTINUOUS_TARGET/
				if(!creg.test(xhr_script.responseText) && !exc.includes(id_list[i])){
					script_list.push(id_list[i]);
					document.write(id_list[i] + '<br>');
				}
			};
			xhr_script.open('GET', 'https://raw.githubusercontent.com/Fluorohydride/ygopro-scripts/master/c' + id_list[i] + '.lua', true);
			xhr_script.send();
		}
	};
	xhr.open('GET', 'https://salix5.github.io/CardEditor/cards.cdb', true);
	xhr.responseType = 'arraybuffer';
	xhr.send();
	}
);
