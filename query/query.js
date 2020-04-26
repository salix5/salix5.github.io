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
const TYPE_EXT = TYPE_FUSION | TYPE_SYNCHRO | TYPE_XYZ | TYPE_LINK;   

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

// race
const RACE_WARRIOR		=0x1		//战士
const RACE_SPELLCASTER	=0x2		//魔法师
const RACE_FAIRY			=0x4		//天使
const RACE_FIEND			=0x8		//恶魔
const RACE_ZOMBIE			=0x10		//不死
const RACE_MACHINE		=0x20		//机械
const RACE_AQUA			=0x40		//水
const RACE_PYRO			=0x80		//炎
const RACE_ROCK			=0x100		//岩石
const RACE_WINDBEAST		=0x200		//鸟兽
const RACE_PLANT			=0x400		//植物
const RACE_INSECT			=0x800		//昆虫
const RACE_THUNDER		=0x1000			//雷
const RACE_DRAGON			=0x2000		//龙
const RACE_BEAST			=0x4000		//兽
const RACE_BEASTWARRIOR	=0x8000			//兽战士
const RACE_DINOSAUR		=0x10000		//恐龙
const RACE_FISH			=0x20000		//鱼
const RACE_SEASERPENT		=0x40000	//海龙
const RACE_REPTILE		=0x80000		//爬虫类
const RACE_PSYCHO			=0x100000	//念动力
const RACE_DIVINE			=0x200000	//幻神兽
const RACE_CREATORGOD		=0x400000	//创造神
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

// table width
const MAX_WIDTH = 700;	

// MAX_SAFE_INTEGER in JS: 16 digit
const MAX_DIGIT = 15;

var config = {   
  locateFile: filename => `./dist/${filename}`    
}   

var db, db2;
var ltable = new Object();
var setname = new Object();
var cid_table;

var lflist = new XMLHttpRequest();
lflist.onload = e => {
	var ldata = lflist.responseText.replace(/\r\n/g, '\n');
	var line = ldata.split('\n');
	var count = 0;
	for(var i = 0; i < line.length; ++i){
		var init = line[i].substring(0, 1);
		if(init == '!'){
			++count;
			if(count == 2)
				break;
		}
		else if(init == '#'){}
		else{
			var part = line[i].split(' ');
			var id = parseInt(part[0], 10);
			var limit = parseInt(part[1], 10);
			ltable[id] = limit;
		}
	}
};
lflist.open('GET', 'https://salix5.github.io/CardEditor/lflist.conf', true);
lflist.send();

var strings = new XMLHttpRequest();
strings.onload = e => {
	var ldata = strings.responseText.replace(/\r\n/g, '\n');
	var line = ldata.split('\n');
	var count = 0;
	for(var i = 0; i < line.length; ++i){
		var init = line[i].substring(0, 8);
		if(init == '!setname'){
			var tmp = line[i].substring(9);  // code + name
			var j = tmp.indexOf(' ');
			var scode = tmp.substring(0, j);
			var part = tmp.substring(j + 1).split('\t');
			var sname = part[0];
			setname[sname] = scode;
		}
	}
};
strings.open('GET', 'https://salix5.github.io/CardEditor/strings.conf', true);
strings.send();

var cid_xhr = new XMLHttpRequest();
cid_xhr.onload = e => {
	cid_table = cid_xhr.response;
};
cid_xhr.open('GET', 'cid.json', true);	
cid_xhr.responseType = 'json';
cid_xhr.send();

// The `initSqlJs` function is globally provided by all of the main dist files if loaded in the browser.   
// We must specify this locateFile function if we are loading a wasm file from anywhere other than the current html page's folder.   
initSqlJs(config).then(function(SQL){   

	var xhr = new XMLHttpRequest();
	xhr.onload = e => {
		var arr1 = new Uint8Array(xhr.response);
		var button1 = document.getElementById('button1');
		db = new SQL.Database(arr1);
		button1.disabled = false;
	};
	xhr.open('GET', 'https://salix5.github.io/CardEditor/cards.cdb', true);
	xhr.responseType = 'arraybuffer';
	xhr.send();
	
	var xhr2 = new XMLHttpRequest();
	xhr2.onload = e => {
		var arr1 = new Uint8Array(xhr2.response);
		db2 = new SQL.Database(arr1);
	};
	xhr2.open('GET', 'beta.cdb', true);
	xhr2.responseType = 'arraybuffer';	
	xhr2.send();
	}
);

// require: id, alias, type
function is_virtual(result) {
	if(Math.abs(result.alias-result.id) < 10)
		return true;
	if(result.type & TYPE_TOKEN)
		return true;
}

function is_atk(x){
	if(x == -1 || x >= 0)
	    return true;
	else
	    return false;
}

function is_lv(x){
	if(x >= 1 && x <= 12)
		return true;
	else
		return false;
}

function is_scale(x){
	if(x >= 0 && x <= 13)
		return true;
	else
		return false;
}

var id_to_type = {
	mtype1: TYPE_NORMAL,
	mtype2: TYPE_EFFECT,
	mtype3: TYPE_RITUAL,
	mtype4: TYPE_FUSION,
	mtype5: TYPE_SYNCHRO,
	mtype6: TYPE_XYZ,
	mtype7: TYPE_PENDULUM,
	mtype8: TYPE_LINK,
	mtype9: TYPE_SPIRIT,
	mtype10: TYPE_UNION,
	mtype11: TYPE_DUAL,
	mtype12: TYPE_TUNER,
	mtype13: TYPE_FLIP,
	mtype14: TYPE_TOON,
	mtype15: TYPE_SPSUMMON,
	
	stype2: TYPE_QUICKPLAY,
	stype3: TYPE_CONTINUOUS,
	stype4: TYPE_EQUIP,
	stype5: TYPE_RITUAL,
	stype6: TYPE_FIELD,
	
	ttype2: TYPE_CONTINUOUS,
	ttype3: TYPE_COUNTER
};

var id_to_marker = {
	marker1: LINK_MARKER_TOP_LEFT,
	marker2: LINK_MARKER_TOP,
	marker3: LINK_MARKER_TOP_RIGHT,
	marker4: LINK_MARKER_LEFT,
	marker5: LINK_MARKER_RIGHT,
	marker6: LINK_MARKER_BOTTOM_LEFT,
	marker7: LINK_MARKER_BOTTOM,
	marker8: LINK_MARKER_BOTTOM_RIGHT
};

var attr_to_str = {
	[ATTRIBUTE_EARTH]: '地',
	[ATTRIBUTE_WATER]: '水',
	[ATTRIBUTE_FIRE]: '炎',
	[ATTRIBUTE_WIND]: '風',
	[ATTRIBUTE_LIGHT]: '光',
	[ATTRIBUTE_DARK]: '暗',
	[ATTRIBUTE_DIVINE]: '神'
};

var race_to_str = {
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

function print_ad(x){
	if(x == -2)
		return '?';
	else
		return x;
}

function print_link(id, ot){
	switch(id){
		case 68811206:
			return 'https://yugipedia.com/wiki/68811206'
		default:
			var url = 'https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=' + cid_table[id];
			if(ot == 2)
				return url + '&request_locale=en';
			else
				return url + '&request_locale=ja';
	}
}

function print_limit(id){
	if(ltable[id] == 0)
		return '<img src="0.png" height="20" width="20">';
	else if(ltable[id] == 1)
		return '<img src="1.png" height="20" width="20">';
	else if(ltable[id] == 2)
		return '<img src="2.png" height="20" width="20">';
	else
		return '';
}

function create_rows(result){
	//var div_result = document.getElementById('div_result');
	var table1 = document.getElementById('table_result');
	table1.className = 'query';
	if(window.innerWidth > MAX_WIDTH)
		table1.style.width = MAX_WIDTH + 'px';
	else
		table1.style.width = '90%';
	var row = table1.insertRow(-1);
	var cell1 = row.insertCell(-1);
	var cell2 = row.insertCell(-1);
		
		cell1.className = 'card_id';
		cell2.className = 'query';
		if(result.id <= 99999999)
			cell1.innerHTML = '<a href="' + print_link(result.id, result.ot) + '" target="_blank">' + result.id.toString().padStart(8, '0') + '</a>';
		else
			cell1.innerHTML = result.id.toString();
		
		cell2.innerHTML = result.name + print_limit(result.id);
		if(result.ot == 2)
			cell2.innerHTML += '<img src="tcg.png" height="20" width="40">';
		
		var mtype = '';
		var subtype = '';
		var lvstr = '等級';
        var marker = '';
        var data = '';
        var output = '';

		if(result.type & TYPE_MONSTER){
			mtype = '怪獸';
			if(result.type & TYPE_RITUAL)
				subtype = '/儀式';
			else if(result.type & TYPE_FUSION)
				subtype = '/融合';
			else if(result.type & TYPE_SYNCHRO)
				subtype = '/同步';
			else if(result.type & TYPE_XYZ){
				subtype = '/超量';
				lvstr = '階級';
			}
			else if(result.type & TYPE_LINK){
				subtype = '/連結';
				lvstr = 'LINK-';
			}
			// extype
			if(result.type & TYPE_PENDULUM){
			           subtype += '/靈擺';
			}
			if(result.type & TYPE_NORMAL)
				subtype += '/通常';
			
			if(result.type & TYPE_SPIRIT)
				subtype += '/靈魂';
			if(result.type & TYPE_UNION)
				subtype += '/聯合';
			if(result.type & TYPE_DUAL)
				subtype += '/二重';
			if(result.type & TYPE_TUNER)
				subtype += '/協調';
			if(result.type & TYPE_FLIP)
				subtype += '/反轉';
			if(result.type & TYPE_TOON)
				subtype += '/卡通';
			if(result.type & TYPE_SPSUMMON)
				subtype += '/特殊召喚';
			if(result.type & TYPE_EFFECT)
				subtype += '/效果';
			data = '[' + mtype + subtype + '] ';
		}
		else if(result.type & TYPE_SPELL){
			mtype = '魔法';
			if(result.type & TYPE_QUICKPLAY)
				subtype = '速攻';
			else if(result.type & TYPE_CONTINUOUS)
				subtype = '永續';
			else if(result.type & TYPE_EQUIP)
				subtype = '裝備';
			else if(result.type & TYPE_RITUAL)
				subtype = '儀式';
			else if(result.type & TYPE_FIELD)
				subtype = '場地';
			else
				subtype = '通常';
			data = '[' + subtype + mtype + '] ';
		}
		else if(result.type & TYPE_TRAP){
			mtype = '陷阱';
			if(result.type & TYPE_CONTINUOUS)
				subtype = '永續';
			else if(result.type & TYPE_COUNTER)
				subtype = '反擊';
			else
				subtype = '通常';
			data = '[' + subtype + mtype + '] ';
		}
		
		if(result.type & TYPE_MONSTER){
			data += lvstr + (result.level & 0xff);
			data += '/' + attr_to_str[result.attribute];
			data += '/' + race_to_str[result.race] + '族<br>'; 
			data += print_ad(result.atk);
			if(result.type & TYPE_LINK){
				data += '/-';
				marker = '<div class="marker">';
				if(result.def & LINK_MARKER_TOP_LEFT)
					marker += '<span class="ul t">▲</span>';
				else
					marker += '<span class="ul f">△</span>';
				if(result.def & LINK_MARKER_TOP )
					marker += '<span class="t">▲</span>';
				else
					marker += '<span class="f">△</span>';
				if(result.def & LINK_MARKER_TOP_RIGHT)
					marker += '<span class="ur t">▲</span>';
				else
					marker += '<span class="ur f">△</span>';

				marker += '<br>';
				if(result.def & LINK_MARKER_LEFT)
					marker += '<span class="l t">▲</span>';
				else
					marker += '<span class="l f">△</span>';
				marker += '<span>　</span>';
				if(result.def & LINK_MARKER_RIGHT)
					marker += '<span class="r t">▲</span>';
				else
					marker += '<span class="r f">△</span>';
				marker = marker + '<br>';

				if(result.def & LINK_MARKER_BOTTOM_LEFT)
					marker += '<span class="dl t">▲</span>';
				else
					marker += '<span class="dl f">△</span>';
				if(result.def & LINK_MARKER_BOTTOM )
					marker += '<span class="d t">▲</span>';
				else
					marker += '<span class="d f">△</span>';
				if(result.def & LINK_MARKER_BOTTOM_RIGHT)
					marker += '<span class="dr t">▲</span>';
				else
					marker += '<span class="dr f">△</span>';
				marker += '</div>';
			}
			else{
				data +=  '/' + print_ad(result.def);
			}
			if(result.type & TYPE_PENDULUM){
				data += '/刻度' + ((result.level >> 24) & 0xff);
			}
		}
		output = '<span style="color: Blue;">' + data + '<br></span>' + marker;
		output += result.desc.replace(/\n/g, "<br>");
		var row_effect = table1.insertRow(-1);
		var cell_effect = row_effect.insertCell(-1);
		cell_effect.className = "query";
		cell_effect.innerHTML = output;
		cell_effect.colSpan = "2";
		
		/*div_result.insertBefore(table1, null);
		var div_half = document.createElement('div');
		div_half.className = 'half-line';
		div_half.innerHTML = '&nbsp;';
		div_result.insertBefore(div_half, null);*/
}

function query(){
	var text_id = document.getElementById('text_id');
	var text_name = document.getElementById('text_name');
	var text_effect = document.getElementById('text_effect');
	
	var text_lv1 = document.getElementById('text_lv1');
	var text_lv2 = document.getElementById('text_lv2');
	var text_sc1 = document.getElementById('text_sc1');
	var text_sc2 = document.getElementById('text_sc2');
	
	var text_atk1 = document.getElementById('text_atk1');
	var text_atk2 = document.getElementById('text_atk2');
	var text_def1 = document.getElementById('text_def1');
    var text_def2 = document.getElementById('text_def2');
	
	var select_ot  = document.getElementById('select_ot');
	var select_type = document.getElementById('select_type');
	var select_ao1 = document.getElementById('select_ao1');
	var select_ao2 = document.getElementById('select_ao2');
	
	var dm = document.getElementById('subtype_m');
	var ds = document.getElementById('subtype_s');
	var dt = document.getElementById('subtype_t');
	
	var mtype_deck = document.getElementById('mtype_deck');
	var stype1 = document.getElementById('stype1');
	var ttype1 = document.getElementById('ttype1');
	var cb_attr = document.getElementsByName("cb_attr");
	var cb_race = document.getElementsByName("cb_race");
	
	var row_lv = document.getElementById('row_lv');
	var row_sc = document.getElementById('row_sc');
	var row_marker = document.getElementById('row_marker');
	var row_attr = document.getElementById('row_attr');
	var row_race = document.getElementById('row_race');
	var row_atk = document.getElementById('row_atk');
	var row_def = document.getElementById('row_def');
	
	var result = document.getElementById('table_result');
	var qstr = 'SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts WHERE datas.id==texts.id';
	var cid = 0;
	var ot = 0;
	var ctype = 0;
	var cattr = 0;
	var crace = 0;
	
	var atk1 = -2;
	var atk2 = -2;
	var def1 = -2;
	var def2 = -2;
	var lv1 = 0;
	var lv2 = 0;
	var sc1 = -1;
	var sc2 = -1;
	
	var arg = new Object();
	var valid = false;
	var query_monster = false;
	var cb_list;
	
	button1.disabled = true;
	// id
	if(text_id.value.length <= MAX_DIGIT)
		cid = parseInt(text_id.value, 10);
	if(cid > 0){
		qstr = qstr + " AND datas.id == $id";
		arg.$id = cid;
		valid = true;
	}
	
	// ot
	switch (select_ot.value){
		case 'o':
		    qstr = qstr + " AND datas.ot != 2";
		    valid = true;
		    break;
		case 't':
		    qstr = qstr + " AND datas.ot == 2";
		    valid = true;
		    break;
	}
	
	// type
	switch(select_type.value){
		case 'm':
			qstr = qstr + " AND type & " + TYPE_MONSTER;
			if(mtype_deck.checked)
				qstr = qstr + " AND NOT type & " + TYPE_EXT;
			
			cb_list = document.getElementsByName('cb_mtype');
			for(let i = 0; i < cb_list.length; ++i){
				if(cb_list[i].checked)
					ctype |= id_to_type[cb_list[i].id];
			}
			if(ctype){
				if(select_ao1.value == 'or')
					qstr = qstr + " AND type & $type";
				else
					qstr = qstr + " AND type & $type == $type";
				arg.$type = ctype;
			}
			valid = true;
			break;
		case 's':
			qstr = qstr + " AND type & " + TYPE_SPELL;
			cb_list = document.getElementsByName('cb_stype');
			for(let i = 0; i < cb_list.length; ++i){
				if(cb_list[i].checked)
					ctype |= id_to_type[cb_list[i].id];
			}
			if(ctype){
				if(stype1.checked)
					qstr = qstr + " AND (type & $type OR type == " + TYPE_SPELL + ")";
				else
					qstr = qstr + " AND type & $type";
				arg.$type = ctype;
			}
			valid = true;
			break;
		case 't':
			qstr = qstr + " AND type & " + TYPE_TRAP;
			cb_list = document.getElementsByName('cb_ttype');
			for(let i = 0; i < cb_list.length; ++i){
				if(cb_list[i].checked)
					ctype |= id_to_type[cb_list[i].id];
			}
			if(ctype){
				if(stype1.checked)
					qstr = qstr + " AND (type & $type OR type == " + TYPE_TRAP + ")";
				else
					qstr = qstr + " AND type & $type";
				arg.$type = ctype;
			}
			valid = true;
			break;
	}
	
	if(select_type.value == '' || select_type.value == 'm'){
		// atk
		if(text_atk1.value.length <= MAX_DIGIT)
			atk1 = parseInt(text_atk1.value, 10);
		if(text_atk2.value.length <= MAX_DIGIT)
			atk2 = parseInt(text_atk2.value, 10);
	
		if(is_atk(atk1) || is_atk(atk2)){
			if(atk1 == -1 || atk2 == -1){
				qstr = qstr + " AND atk == $atk";
				arg.$atk = -2;
			}
			else if(!is_atk(atk2)){
				qstr = qstr + " AND atk == $atk";
				arg.$atk = atk1;
			}
			else if(!is_atk(atk1)){
				qstr = qstr + " AND atk == $atk";
				arg.$atk = atk2;
			}
			else {
				qstr = qstr + " AND atk >= $atk1 AND atk <= $atk2";
				arg.$atk1 = atk1;
				arg.$atk2 = atk2;
			}
			valid = true;
			query_monster = true;
		}
		
		// def, exclude link monsters
		if(text_def1.value.length <= MAX_DIGIT)
			def1 = parseInt(text_def1.value, 10);
		if(text_def2.value.length <= MAX_DIGIT)
			def2 = parseInt(text_def2.value, 10);
	
		if(is_atk(def1) || is_atk(def2)){
			qstr = qstr + " AND NOT type & " + TYPE_LINK;
			if(def1 == -1 || def2 == -1){
				qstr = qstr + " AND def == $def";
				arg.$def = -2;
			}
			else if(!is_atk(def2)){
				qstr = qstr + " AND def == $def";
				arg.$def = def1;
			}
			else if(!is_atk(def1)){
				qstr = qstr + " AND def == $def";
				arg.$def = def2;
			}
			else {
				qstr = qstr + " AND def >= $def1 AND def <= $def_max";
				arg.$def1 = def1;
				arg.$def2 = def2;
			}
			valid = true;
			query_monster = true;
		}
		// lv, scale
		if(text_lv1.value.length <= MAX_DIGIT)
			lv1 = parseInt(text_lv1.value, 10);
		if(text_lv2.value.length <= MAX_DIGIT)
			lv2 = parseInt(text_lv2.value, 10);
		if(text_sc1.value.length <= MAX_DIGIT)
			sc1 = parseInt(text_sc1.value, 10);
		if(text_sc2.value.length <= MAX_DIGIT)
			sc2 = parseInt(text_sc2.value, 10);
		if(is_lv(lv1) || is_lv(lv2)){
			if(!is_lv(lv2)){
				qstr = qstr + " AND level & 0xff == $lv";
				arg.$lv = lv1;
			}
			else if(!is_lv(lv1)){
				qstr = qstr + " AND level & 0xff == $lv";
				arg.$lv = lv2;
			}
			else{
				qstr = qstr + " AND level & 0xff >= $lv1 AND level & 0xff <= $lv2";
				arg.$lv1 = lv1;
				arg.$lv2 = lv2;
			}
			valid = true;
			query_monster = true;
		}
		if(is_scale(sc1) || is_scale(sc2)){
			qstr = qstr + " AND type&" + TYPE_PENDULUM;
			if(!is_scale(sc2)){
				qstr = qstr + " AND (level >> 24) & 0xff == $sc";
				arg.$sc = sc1;
			}
			else if(!is_scale(sc1)){
				qstr = qstr + " AND (level >> 24) & 0xff == $sc";
				arg.$sc = sc2;
			}
			else{
				qstr = qstr + " AND (level >> 24) & 0xff >= $sc1 AND (level >> 24) & 0xff <= $sc2";
				arg.$sc1 = sc1;
				arg.$sc2 = sc2;
			}
			valid = true;
			query_monster = true;
		}
		
		// attr, race
		var tmp = ATTRIBUTE_EARTH;
		arg.$attr = 0;
		for(let i = 0; i < cb_attr.length; ++i){
			if(cb_attr[i].checked)
				arg.$attr |= tmp;
			tmp <<= 1;
		}
		if(arg.$attr){
			qstr = qstr + " AND attribute & $attr";
			valid = true;
			query_monster = true;
		}
		
		tmp = RACE_WARRIOR;
		arg.$race = 0;
		for(let i = 0; i < cb_race.length; ++i){
			if(cb_race[i].checked)
				arg.$race |= tmp;
			tmp <<= 1;
		}
		if(arg.$race){
			qstr = qstr + " AND race & $race";
			valid = true;
			query_monster = true;
		}
		// marker
		arg.$marker = 0;
		cb_list = document.getElementsByName('cb_marker');
		for(let i = 0; i < cb_list.length; ++i){
			if(cb_list[i].checked){
				arg.$marker |= id_to_marker[cb_list[i].id];
				cb_list[i].checked = false;
			}
		}
		if(arg.$marker){
			qstr = qstr + " AND type & " + TYPE_LINK;
			if(select_ao2.value == 'or')
				qstr = qstr + " AND def & $marker";
			else
				qstr = qstr + " AND def & $marker == $marker";
			valid = true;
			query_monster = true;
		}
	}
	// name, effect
	if(text_name.value.length <= 1000 && text_name.value != ''){
		if(setname[text_name.value]){
			var set_code = parseInt(setname[text_name.value], 16);
			qstr = qstr + " AND (name LIKE $name OR setcode & 0xfff == $settype AND setcode & 0xf000 & $setsubtype == $setsubtype OR setcode >> 16 & 0xfff == $settype AND setcode >> 16 & 0xf000 & $setsubtype == $setsubtype OR setcode >> 32 & 0xfff == $settype AND setcode >> 32 & 0xf000 & $setsubtype == $setsubtype OR setcode >> 48 & 0xfff == $settype AND setcode >> 48 & 0xf000 & $setsubtype == $setsubtype)";
			arg.$name = '%' + text_name.value.replace(/[%_]/, '') + '%';
			arg.$settype = set_code & 0xfff;
			arg.$setsubtype = set_code & 0xf000;
		}
		else{
			qstr = qstr + " AND name LIKE $name";
			arg.$name = '%' + text_name.value.replace(/[%_]/, '') + '%';
		}
		valid = true;
	}
	if(text_effect.value.length <= 1000 && text_effect.value != ''){
		qstr = qstr + " AND desc LIKE $desc";
		arg.$desc = '%' + text_effect.value.replace(/[%_]/, '') + '%';
		valid = true;
	}
	if(select_type.value == '' && query_monster)
		qstr = qstr + " AND type & " + TYPE_MONSTER;

	// clear
	result.innerHTML = '';
	text_id.value = '';
	text_name.value = '';
	text_lv1.value = '';
	text_lv2.value = '';
	text_sc1.value = '';
	text_sc2.value = '';
	
	text_atk1.value = '';
	text_atk2.value = '';
	text_def1.value = '';
	text_def2.value = '';
	text_effect.value = '';
	
	select_ot.selectedIndex = 0;
	select_type.selectedIndex = 0;
	select_ao1.selectedIndex = 0;
	select_ao1.style.display = 'none';
	select_ao2.selectedIndex = 0;
	
	clear_cb('mtype');
	clear_cb('stype');
	clear_cb('ttype');
	dm.style.display = 'none';
	ds.style.display = 'none';
	dt.style.display = 'none';
	row_lv.style.display = '';
	row_sc.style.display = '';
	row_marker.style.display = '';
	row_attr.style.display = '';
	row_race.style.display = '';
	row_atk.style.display = '';
	row_def.style.display = '';
	
	clear_cb('attr');
	clear_cb('race');
	
	if(!valid){
		button1.disabled = false;
		return;
	}
	
	// Prepare a statement
	var stmt = db.prepare(qstr);
	stmt.bind(arg);
	while(stmt.step()) {
		// execute
		var result = stmt.getAsObject();
		if(is_virtual(result))
			continue;
		create_rows(result);			
	}
	stmt = db2.prepare(qstr);
	stmt.bind(arg);
	while(stmt.step()) {
		// execute
		var result = stmt.getAsObject();
		if(is_virtual(result))
			continue;
		create_rows(result);			
	}
	button1.disabled = false;
}
