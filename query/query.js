"use strict";
// MAX_SAFE_INTEGER in JS: 16 digit
const MAX_DIGIT = 15;

var cid_table;
var cid_xhr = new XMLHttpRequest();
cid_xhr.onload = e => {
	cid_table = cid_xhr.response;
};
cid_xhr.open('GET', 'cid.json', true);	
cid_xhr.responseType = 'json';
cid_xhr.send();

var name_table;
var name_xhr = new XMLHttpRequest();
name_xhr.onload = e => {
	name_table = name_xhr.response;
};
name_xhr.open('GET', 'name_table.json', true);	
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


var config = {
	locateFile: filename => `./dist/${filename}`
}

var db, db2;
const url1 = 'https://salix5.github.io/CardEditor/expansions/beta.cdb';
const url2 = 'beta.cdb';

// The `initSqlJs` function is globally provided by all of the main dist files if loaded in the browser.   
// We must specify this locateFile function if we are loading a wasm file from anywhere other than the current html page's folder.   
initSqlJs(config).then(function(SQL){   

	var xhr = new XMLHttpRequest();
	xhr.onload = e => {
		var arr1 = new Uint8Array(xhr.response);
		var button1 = document.getElementById('button1');
		var button2 = document.getElementById('button2');
		db = new SQL.Database(arr1);
		button1.disabled = false;
		button2.disabled = false;
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

// require: type
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

String.prototype.toHalfWidth = function() {
    return this.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) - 0xFEE0)});
};

String.prototype.toFullWidth = function() {
    return this.replace(/[A-Za-z0-9]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);});
};

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
	var cb_marker = document.getElementsByName('cb_marker');
	
	var row_lv = document.getElementById('row_lv');
	var row_sc = document.getElementById('row_sc');
	var row_marker = document.getElementById('row_marker');
	var row_attr = document.getElementById('row_attr');
	var row_race = document.getElementById('row_race');
	var row_atk = document.getElementById('row_atk');
	var row_def = document.getElementById('row_def');
	
	var button1 = document.getElementById('button1');
	var button2 = document.getElementById('button2');
	var table_result = document.getElementById('table_result');
	
	var qstr = 'SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts WHERE datas.id==texts.id AND abs(datas.id - alias) >= 10';
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
	var query_monster = false;
	var cb_list;
	
	var result = [];
	
	button1.disabled = true;
	button2.disabled = true;
	
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
		for(let i = 0; i < cb_attr.length; ++i){
			if(cb_attr[i].checked)
				cattr |= tmp;
			tmp <<= 1;
		}
		if(cattr){
			qstr = qstr + " AND attribute & $attr";
			arg.$attr = cattr;
			valid = true;
			query_monster = true;
		}
		
		tmp = RACE_WARRIOR;
		for(let i = 0; i < cb_race.length; ++i){
			if(cb_race[i].checked)
				crace |= tmp;
			tmp <<= 1;
		}
		if(crace){
			qstr = qstr + " AND race & $race";
			arg.$race = crace;
			valid = true;
			query_monster = true;
		}
		// marker
		for(let i = 0; i < cb_marker.length; ++i){
			if(cb_marker[i].checked){
				cmarker |= id_to_marker[cb_marker[i].id];
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
			query_monster = true;
		}
	}
	//effect
	if(text_effect.value.length <= 1000 && text_effect.value != ''){
		qstr = qstr + " AND desc LIKE $desc";
		arg.$desc = '%' + text_effect.value.replace(/[%_]/, '') + '%';
		valid = true;
	}
	// avoid trap monsters
	if(select_type.value == '' && query_monster)
		qstr = qstr + " AND type & " + TYPE_MONSTER;
	// name
	if(text_name.value.length <= 1000 && text_name.value != ''){
		var cname = text_name.value.toHalfWidth();
		var nid = Object.keys(name_table).find(key => name_table[key] === cname);
		if(setname[cname]){
			var set_code = parseInt(setname[cname], 16);
			exact_qstr = qstr + ' AND name == $exact_name';
			qstr += " AND (name LIKE $name";
			qstr += " OR setcode & 0xfff == $settype AND setcode & 0xf000 & $setsubtype == $setsubtype OR setcode >> 16 & 0xfff == $settype AND setcode >> 16 & 0xf000 & $setsubtype == $setsubtype";
			qstr += " OR setcode >> 32 & 0xfff == $settype AND setcode >> 32 & 0xf000 & $setsubtype == $setsubtype OR setcode >> 48 & 0xfff == $settype AND setcode >> 48 & 0xf000 & $setsubtype == $setsubtype";
			arg.$exact_name = cname.replace(/[%_]/, '');
			arg.$name = '%' + cname.replace(/[%_]/, '') + '%';
			arg.$settype = set_code & 0xfff;
			arg.$setsubtype = set_code & 0xf000;
		}
		else{
			exact_qstr = qstr + ' AND name == $exact_name';
			qstr = qstr + " AND (name LIKE $name";
			arg.$exact_name = cname.replace(/[%_]/, '');
			arg.$name = '%' + cname.replace(/[%_]/, '') + '%';
		}
		if(nid){
			qstr += " OR datas.id == $nid);";
			arg.$nid = nid;
		}
		else
			qstr += ");";
		valid = true;
	}

	if(!valid){
		event.preventDefault();
		button1.disabled = false;
		button2.disabled = false;
		return;
	}
	// released cards
	var stmt = db.prepare(qstr);
	stmt.bind(arg);
	while(stmt.step()) {
		// execute
		var card = stmt.getAsObject();
		if(is_virtual(card))
			continue;
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
		if(is_virtual(card))
			continue;
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
	
	table_result.innerHTML = '';
	if(result.length > 0){
		result.sort(compare_card);
		result.forEach(create_rows);
	}
	else{
		var row0 = table_result.insertRow(-1);
		var cell0 = row0.insertCell(-1);
		cell0.innerHTML = '沒有符合搜尋的項目。';
	}
	event.preventDefault();
	button1.disabled = false;
	button2.disabled = false;
	document.activeElement.blur();
}
