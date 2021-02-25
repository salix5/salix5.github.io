"use strict";
// MAX_SAFE_INTEGER in JS: 16 digit
const MAX_DIGIT = 15;

var config = {
	locateFile: filename => `./dist/${filename}`
}
var db, db2;
var result = [];
const url1 = 'https://salix5.github.io/CardEditor/expansions/beta.cdb';
const url2 = 'beta.cdb';

// The `initSqlJs` function is globally provided by all of the main dist files if loaded in the browser.   
// We must specify this locateFile function if we are loading a wasm file from anywhere other than the current html page's folder.   
initSqlJs(config).then(function(SQL){
	var xhr = new XMLHttpRequest();
	xhr.onload = e => {
		var arr1 = new Uint8Array(xhr.response);
		db = new SQL.Database(arr1);
		button1.disabled = false;
		button2.disabled = false;
		url_query();
	};
	xhr.open('GET', 'https://salix5.github.io/CardEditor/cards.cdb', true);
	xhr.responseType = 'arraybuffer';
	xhr.send();
	
	var xhr2 = new XMLHttpRequest();
	xhr2.onload = e => {
		var arr1 = new Uint8Array(xhr2.response);
		db2 = new SQL.Database(arr1);
	};
	xhr2.open('GET', url1, true);
	xhr2.responseType = 'arraybuffer';	
	xhr2.send();
	}
);

var cid_table;
var cid_xhr = new XMLHttpRequest();
cid_xhr.onload = e => {
	cid_table = cid_xhr.response;
};
cid_xhr.open('GET', 'text/cid.json', true);	
cid_xhr.responseType = 'json';
cid_xhr.send();

var name_table;
var name_xhr = new XMLHttpRequest();
name_xhr.onload = e => {
	name_table = name_xhr.response;
};
name_xhr.open('GET', 'text/name_table.json', true);	
name_xhr.responseType = 'json';
name_xhr.send();

var setname = new Object();
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

var ltable = new Object();
var lflist = new XMLHttpRequest();
lflist.onload = e => {
	var ldata = lflist.responseText.replace(/\r\n/g, '\n');
	var line = ldata.split('\n');
	var count = 0;
	for(var i = 0; i < line.length; ++i){
		var init = line[i].substring(0, 1);
		if(init == '!'){
			++count;
			// only take the first banlist
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
lflist.open('GET', 'https://raw.githubusercontent.com/Fluorohydride/ygopro/master/lflist.conf', true);
lflist.send();

function is_virtual(card) {
	if(card.type & TYPE_TOKEN)
		return true;
}

function is_atk(x){
	if(x == -1 || x >= 0)
	    return true;
	else
	    return false;
}

function is_lv(x){
	if(x >= 1 && x <= 13)
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

var LIOV = [
32164201,
68258355,
4647954,
31042659,
67436768,
94821366,
30829071,
67314110,
93708824,
29107423,
66192538,
92586237,
29981935,
65479980,
91864689,
28868394,
54257392,
91642007,
27036706,
53535814,
80529459,
26914168,
53318263,
89707961,
15792576,
52296675,
88685329,
15079028,
51474037,
87468732,
14957440,
40352445,
87746184,
13735899,
40139997,
76524506,
12018201,
49407319,
75402014,
2896663,
48285768,
74689476,
1174075,
47163170,
74567889,
952523,
36346532,
73345237,
9839945,
36224040,
62623659,
4017398,
31002402,
7496001,
34995106,
70389815,
6374519,
33773528,
69167267,
6552971,
32056070,
68045685,
5439384,
31834488,
68223137,
94317736,
31712840,
67100549,
93595154,
20989253,
66984907,
93473606,
29867611,
55262310,
92650018,
28645123,
55049722,
91534476,
27923575,
54927180
];

var id_to_type = {
	mtype1: TYPE_NORMAL,
	mtype2: TYPE_EFFECT,
	mtype3: TYPE_RITUAL,
	mtype4: TYPE_FUSION,
	mtype5: TYPE_SYNCHRO,
	mtype6: TYPE_XYZ,
	mtype7: TYPE_PENDULUM,
	mtype8: TYPE_LINK,
	
	mtype9: TYPE_TOON,
	mtype10: TYPE_SPIRIT,
	mtype11: TYPE_UNION,
	mtype12: TYPE_DUAL,
	mtype13: TYPE_TUNER,
	mtype14: TYPE_FLIP,
	mtype15: TYPE_SPSUMMON,
	
	stype2: TYPE_QUICKPLAY,
	stype3: TYPE_CONTINUOUS,
	stype4: TYPE_EQUIP,
	stype5: TYPE_RITUAL,
	stype6: TYPE_FIELD,
	
	ttype2: TYPE_CONTINUOUS,
	ttype3: TYPE_COUNTER
};

var index_to_attr = [
	ATTRIBUTE_EARTH,
	ATTRIBUTE_WATER,
	ATTRIBUTE_FIRE,
	ATTRIBUTE_WIND,
	ATTRIBUTE_LIGHT,
	ATTRIBUTE_DARK,
	ATTRIBUTE_DIVINE,
];

var index_to_race = [
	RACE_AQUA,
	RACE_PYRO,
	RACE_THUNDER,
	RACE_DRAGON,
	RACE_BEAST,
	RACE_FISH,
	RACE_FAIRY,
	RACE_FIEND,
	RACE_ZOMBIE,
	RACE_WARRIOR,
	RACE_DINOSAUR,
	RACE_WINDBEAST,
	RACE_INSECT,
	RACE_PLANT,
	RACE_SEASERPENT,
	RACE_ROCK,
	RACE_MACHINE,
	RACE_PSYCHO,
	RACE_WYRM,
	RACE_SPELLCASTER,
	RACE_BEASTWARRIOR,
	RACE_REPTILE,
	RACE_DIVINE,
	RACE_CREATORGOD,
	RACE_CYBERSE
];

var index_to_marker = [
	LINK_MARKER_TOP_LEFT,
	LINK_MARKER_TOP,
	LINK_MARKER_TOP_RIGHT,
	LINK_MARKER_LEFT,
	LINK_MARKER_RIGHT,
	LINK_MARKER_BOTTOM_LEFT,
	LINK_MARKER_BOTTOM,
	LINK_MARKER_BOTTOM_RIGHT
];

String.prototype.toHalfWidth = function() {
    return this.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) - 0xFEE0)});
};

String.prototype.toFullWidth = function() {
    return this.replace(/[A-Za-z0-9]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);});
};

function query(event){
	var qstr = 'SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts WHERE datas.id == texts.id AND abs(datas.id - alias) >= 10 AND NOT type & ' + TYPE_TOKEN;
	var exact_qstr = '';
	var cid = 0;
	var ot = 0;
	var ctype = 0;
	var cattr = 0;
	var crace = 0;
	var cmarker = 0;
	
	var atk1 = -2;	//null
	var atk2 = -2;
	var def1 = -2;
	var def2 = -2;
	var lv1 = 0;
	var lv2 = 0;
	var sc1 = -1;
	var sc2 = -1;
	
	var arg = new Object();
	var valid = false;
	var is_monster = false;
	var pre_release = false;
	
	button1.disabled = true;
	button2.disabled = true;
	
	//LIOV string
	var liov_str = '';
	liov_str = ' AND (datas.id==' + LIOV[0];
	for(let i = 1; i < LIOV.length; ++i)
		liov_str = liov_str + ' OR datas.id==' + LIOV[i];
	liov_str = liov_str + ')';
	
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
			break;
		case 't':
			qstr = qstr + " AND datas.ot == 2";
			valid = true;
			break;
		case '1104':
			qstr = qstr + liov_str;
			valid = true;
			break;
		case 'DBAG':
			qstr = qstr + " AND datas.id >= 100416001 AND datas.id <= 100416999";
			pre_release =true;
			valid = true;
			break;
	}
	
	// type
	switch(select_type.value){
		case 'm':
			qstr = qstr + " AND type & " + TYPE_MONSTER;
			if(mtype_deck.checked)
				qstr = qstr + " AND NOT type & " + TYPE_EXT;
			for(let i = 0; i < cb_mtype.length; ++i){
				if(cb_mtype[i].checked)
					ctype |= id_to_type[cb_mtype[i].id];
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
			for(let i = 1; i < cb_stype.length; ++i){
				if(cb_stype[i].checked)
					ctype |= id_to_type[cb_stype[i].id];
			}
			if(stype1.checked){
				if(ctype > 0){
					qstr = qstr + ' AND (type == ' + TYPE_SPELL + ' OR type & $type)';
					arg.$type = ctype;
				}
				else
				    qstr = qstr + ' AND type == ' + TYPE_SPELL;
			}
			else if(ctype > 0){
				qstr = qstr + ' AND type & $type';
				arg.$type = ctype;
			}
			valid = true;
			break;
		case 't':
			qstr = qstr + " AND type & " + TYPE_TRAP;
			for(let i = 1; i < cb_ttype.length; ++i){
				if(cb_ttype[i].checked)
					ctype |= id_to_type[cb_ttype[i].id];
			}
			if(ttype1.checked){
				if(ctype > 0){
					qstr = qstr + ' AND (type == ' + TYPE_TRAP + ' OR type & $type)';
					arg.$type = ctype;
				}
				else
				    qstr = qstr + ' AND type == ' + TYPE_TRAP;
			}
			else if(ctype > 0){
				qstr = qstr + ' AND type & $type';
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
			is_monster = true;
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
			is_monster = true;
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
			is_monster = true;
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
			is_monster = true;
		}
		
		// attr, race
		for(let i = 0; i < cb_attr.length; ++i){
			if(cb_attr[i].checked)
				cattr |= index_to_attr[i];
		}
		if(cattr){
			qstr = qstr + " AND attribute & $attr";
			arg.$attr = cattr;
			valid = true;
			is_monster = true;
		}
		
		for(let i = 0; i < cb_race.length; ++i){
			if(cb_race[i].checked)
				crace |= index_to_race[i];
		}
		if(crace){
			qstr = qstr + " AND race & $race";
			arg.$race = crace;
			valid = true;
			is_monster = true;
		}
		// marker
		for(let i = 0; i < cb_marker.length; ++i){
			if(cb_marker[i].checked){
				cmarker |= index_to_marker[i];
			}
		}
		if(cmarker){
			qstr = qstr + " AND type & " + TYPE_LINK;
			if(select_ao2.value == 'or')
				qstr = qstr + " AND def & $marker";
			else
				qstr = qstr + " AND def & $marker == $marker";
			arg.$marker = cmarker;
			valid = true;
			is_monster = true;
		}
	}
	
	//text
	const setcode_str = "(setcode & 0xfff == $settype AND setcode & 0xf000 & $setsubtype == $setsubtype OR setcode >> 16 & 0xfff == $settype AND setcode >> 16 & 0xf000 & $setsubtype == $setsubtype OR setcode >> 32 & 0xfff == $settype AND setcode >> 32 & 0xf000 & $setsubtype == $setsubtype OR setcode >> 48 & 0xfff == $settype AND setcode >> 48 & 0xf000 & $setsubtype == $setsubtype)";
	const name_str = "name LIKE $name ESCAPE '$'";
	const desc_str = "desc LIKE $desc ESCAPE '$'";
	const re_wildcard = /(?<!\$)[%_]/;
	const re_all = /^%+$/;
	
	if(text_multi.value.length <= 1000 && text_multi.value != '' && !re_all.test(text_multi.value)){
		let search_str = text_multi.value.toHalfWidth();
		//name
		qstr = qstr + " AND (" + name_str;
		
		if(!re_wildcard.test(search_str)){
			let real_str = search_str.replaceAll('$%', '%');
			real_str = real_str.replaceAll('$_', '_');
			
			let nid = Object.keys(name_table).find(key => name_table[key] === real_str);
			if(setname[real_str]){
				let set_code = parseInt(setname[real_str], 16);
				qstr = qstr + " OR " + setcode_str;
				arg.$settype = set_code & 0x0fff;
				arg.$setsubtype = set_code & 0xf000;
			}
			
			if(nid){
				qstr += " OR datas.id == $nid";
				arg.$nid = nid;
			}
			search_str = '%' + search_str + '%';
		}
		
		//effect
		qstr = qstr + " OR " + desc_str + ")";
		arg.$name = search_str;
		arg.$desc = search_str;
		valid = true;
	}
	else{
		//effect
		if(text_effect.value.length <= 1000 && text_effect.value != '' && !re_all.test(text_effect.value)){
			let search_str = text_effect.value.toHalfWidth();
			if(!re_wildcard.test(search_str)){
				search_str = '%' + search_str + '%';
			}
			qstr = qstr + " AND " + desc_str;
			arg.$desc = search_str;
			valid = true;
		}
		
		// name
		if(text_name.value.length <= 1000 && text_name.value != '' && !re_all.test(text_name.value)){
			let search_str = text_name.value.toHalfWidth();
			//name
			qstr = qstr + " AND (" + name_str;
			
			if(!re_wildcard.test(search_str)){
				let real_str = search_str.replaceAll('$%', '%');
				real_str = real_str.replaceAll('$_', '_');
				
				let nid = Object.keys(name_table).find(key => name_table[key] === real_str);
				if(setname[real_str]){
					let set_code = parseInt(setname[real_str], 16);
					qstr = qstr + " OR " + setcode_str;
					arg.$settype = set_code & 0x0fff;
					arg.$setsubtype = set_code & 0xf000;
				}
				
				if(nid){
					qstr += " OR datas.id == $nid";
					arg.$nid = nid;
				}
				search_str = '%' + search_str + '%';
			}
			
			qstr = qstr + ")";
			arg.$name = search_str;
			valid = true;
		}
	}
	// avoid trap monsters and finalize
	if(select_type.value == '' && is_monster)
		qstr = qstr + " AND type & " + TYPE_MONSTER;
	qstr = qstr + ";";

	if(!valid){
		event.preventDefault();
		button1.disabled = false;
		button2.disabled = false;
		return;
	}
	
	result.length = 0;
	// released cards
	var stmt = db.prepare(qstr);
	stmt.bind(arg);
	while(stmt.step()) {
		// execute
		var card = stmt.getAsObject();
		if(card.id <= 99999999){
			card.db_id = cid_table[card.id];
			card.jp_name = name_table[card.id];
		}
		if(ltable[card.id] == 0)
			card.limit = 0;
		else if(ltable[card.id] == 1)
			card.limit = 1;
		else if(ltable[card.id] == 2)
			card.limit = 2;
		else
			card.limit = 3;
		result.push(card);
	}
	
	// pre-release cards
	stmt = db2.prepare(qstr);
	stmt.bind(arg);
	while(stmt.step()) {
		// execute
		var card = stmt.getAsObject();
		if(card.id <= 99999999){
			card.db_id = cid_table[card.id];
			card.jp_name = name_table[card.id];
		}
		if(ltable[card.id] == 0)
			card.limit = 0;
		else if(ltable[card.id] == 1)
			card.limit = 1;
		else if(ltable[card.id] == 2)
			card.limit = 2;
		else
			card.limit = 3;
		result.push(card);
	}
	show_result(pre_release);
	
	event.preventDefault();
	button1.disabled = false;
	button2.disabled = false;
	document.activeElement.blur();
}
form1.onsubmit = query;

function url_query(){
	//parse search string
	var params = new URLSearchParams(window.location.search.substring(1));
	var id = params.get("id");
	var url_id = 0;
	
	if(id && id.length <= MAX_DIGIT)
		url_id = parseInt(id, 10);
	if(url_id <= 0)
		return;
	
	var qstr = 'SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts WHERE datas.id == texts.id AND abs(datas.id - alias) >= 10 AND NOT type & ' + TYPE_TOKEN + ' AND datas.id == ' + url_id;
	var stmt = db.prepare(qstr);
	
	result.length = 0;
	while(stmt.step()) {
		// execute
		var card = stmt.getAsObject();
		if(card.id <= 99999999){
			card.db_id = cid_table[card.id];
			card.jp_name = name_table[card.id];
		}
		if(ltable[card.id] == 0)
			card.limit = 0;
		else if(ltable[card.id] == 1)
			card.limit = 1;
		else if(ltable[card.id] == 2)
			card.limit = 2;
		else
			card.limit = 3;
		result.push(card);
	}
	show_result(false);
}
