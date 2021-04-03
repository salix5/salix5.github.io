"use strict";
// max of int32: 10 digit
const MAX_DIGIT = 10;
const MAX_STRLEN = 600;

var config = {
	locateFile: filename => `./dist/${filename}`
}
var db, db2;
var result = [];
const url1 = 'https://salix5.github.io/CardEditor/expansions/beta.cdb';
const url2 = 'beta.cdb';

//re_wildcard = /(?<!\$)[%_]/ (lookbehind)
const re_wildcard = /(^|[^\$])[%_]/;
const re_all = /^%+$/;

initSqlJs(config).then(function(SQL){
	let xhr = new XMLHttpRequest();
	xhr.onload = e => {
		let xhr_pre = new XMLHttpRequest();
		xhr_pre.onload = e => {
			let arr1 = new Uint8Array(xhr_pre.response);
			db2 = new SQL.Database(arr1);
			button1.disabled = false;
			button2.disabled = false;
			url_query();
		};
		xhr_pre.open('GET', url2, true);
		xhr_pre.responseType = 'arraybuffer';	
		xhr_pre.send();
		let arr1 = new Uint8Array(xhr.response);
		db = new SQL.Database(arr1);
	};
	xhr.open('GET', 'https://salix5.github.io/CardEditor/cards.cdb', true);
	xhr.responseType = 'arraybuffer';
	xhr.send();
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

function is_atk(x){
	if(x === null)
		return false;
	else if(x == -1 || x >= 0)
	    return true;
	else
	    return false;
}

function is_lv(x){
	if(x === null)
		return false;
	else if(x >= 1 && x <= 13)
		return true;
	else
		return false;
}

function is_scale(x){
	if(x === null)
		return false;
	else if(x >= 0 && x <= 13)
		return true;
	else
		return false;
}

function is_str(x){
	if(x === null)
		return false;
	else if(x != '' && x.length <= MAX_STRLEN)
		return true;
	else
		return false;
}

function check_int(params, key){
	let val = params.get(key);
	if(val && val.length <= MAX_DIGIT){
		let x = parseInt(val, 10);
		if(!Number.isNaN(x))
			return x;
		else
			return null;
	}
	else
		return null;
}

function pack_cmd(pack){
	var cmd = '';
	cmd = ` AND (datas.id==${pack[0]}`;
	for(let i = 1; i < pack.length; ++i)
		cmd += ` OR datas.id==${pack[i]}`;
	cmd += `)`;
	return cmd;
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
	
	mtype9: TYPE_TOON,
	mtype10: TYPE_SPIRIT,
	mtype11: TYPE_UNION,
	mtype12: TYPE_DUAL,
	mtype13: TYPE_TUNER,
	mtype14: TYPE_FLIP,
	mtype15: TYPE_SPSUMMON,
	mtype16: TYPE_TOKEN,
	mtype_deck: 0,
	
	stype1: TYPE_NORMAL,
	stype2: TYPE_QUICKPLAY,
	stype3: TYPE_CONTINUOUS,
	stype4: TYPE_EQUIP,
	stype5: TYPE_RITUAL,
	stype6: TYPE_FIELD,
	
	ttype1: TYPE_NORMAL,
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
	var params = new URLSearchParams();
	var cid = 0;
	var ot = 0;
	var subtype = 0;
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
	
	// id
	if(text_id.value.length <= MAX_DIGIT)
		cid = parseInt(text_id.value, 10);
	if(cid > 0){
		params.set('id', cid.toString().padStart(8, '0'));
	}
	
	// ot
	if(is_str(select_ot.value))
		params.set('pack', select_ot.value);
	
	// type
	switch(select_type.value){
		case 'm':
			params.set('type', TYPE_MONSTER);
			for(let i = 0; i < cb_mtype.length; ++i){
				if(cb_mtype[i].checked)
					subtype |= id_to_type[cb_mtype[i].id];
			}
			if(subtype){
				params.set('subtype', subtype.toString(10));
				// default: or
				if(select_ao1.value == 'and')
					params.set('sub_op', 1);
				else
					params.set('sub_op', 0);
			}
			if(mtype_deck.checked)
				params.set('is_deck', 1);
			break;
		case 's':
			params.set('type', TYPE_SPELL);
			for(let i = 0; i < cb_stype.length; ++i){
				if(cb_stype[i].checked)
					subtype |= id_to_type[cb_stype[i].id];
			}
			if(subtype)
				params.set('subtype', subtype.toString(10));
			break;
		case 't':
			params.set('type', TYPE_TRAP);
			for(let i = 0; i < cb_ttype.length; ++i){
				if(cb_ttype[i].checked)
					subtype |= id_to_type[cb_ttype[i].id];
			}
			if(subtype)
				params.set('subtype', subtype.toString(10));
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
				params.set('atk1', -1);
			}
			else if(!is_atk(atk2)){
				params.set('atk1', atk1);
			}
			else if(!is_atk(atk1)){
				params.set('atk1', atk2);
			}
			else {
				params.set('atk1', atk1);
				params.set('atk2', atk2);
			}
		}
		
		// def, exclude link monsters
		if(text_def1.value.length <= MAX_DIGIT)
			def1 = parseInt(text_def1.value, 10);
		if(text_def2.value.length <= MAX_DIGIT)
			def2 = parseInt(text_def2.value, 10);
		if(is_atk(def1) || is_atk(def2)){
			if(def1 == -1 || def2 == -1){
				params.set('def1', -1);
			}
			else if(!is_atk(def2)){
				params.set('def1', def1);
			}
			else if(!is_atk(def1)){
				params.set('def1', def2);
			}
			else {
				params.set('def1', def1);
				params.set('def2', def2);
			}
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
				params.set('lv1', lv1);
			}
			else if(!is_lv(lv1)){
				params.set('lv1', lv2);
			}
			else{
				params.set('lv1', lv1);
				params.set('lv2', lv2);
			}
		}
		if(is_scale(sc1) || is_scale(sc2)){			
			if(!is_scale(sc2)){
				params.set('sc1', sc1);
			}
			else if(!is_scale(sc1)){
				params.set('sc1', sc2);
			}
			else{
				params.set('sc1', sc1);
				params.set('sc2', sc2);
			}
		}
		
		// attr, race
		for(let i = 0; i < cb_attr.length; ++i){
			if(cb_attr[i].checked)
				cattr |= index_to_attr[i];
		}
		if(cattr){
			params.set('attr', cattr.toString(10));
		}
		
		for(let i = 0; i < cb_race.length; ++i){
			if(cb_race[i].checked)
				crace |= index_to_race[i];
		}
		if(crace){
			params.set('race', crace.toString(10));
		}
		// marker
		for(let i = 0; i < cb_marker.length; ++i){
			if(cb_marker[i].checked){
				cmarker |= index_to_marker[i];
			}
		}
		if(cmarker){
			params.set('marker', cmarker.toString(10));
			if(select_ao2.value == 'and')
				params.set('marker_op', 1);
			else
				params.set('marker_op', 0);
		}
	}
	
	//multi
	if(is_str(text_multi.value) && !re_all.test(text_multi.value)){
		let search_str = text_multi.value.toHalfWidth();
		params.set('multi', search_str);
	}
	else{
		// name
		if(is_str(text_name.value) && !re_all.test(text_name.value)){
			let search_str = text_name.value.toHalfWidth();
			params.set('name', search_str);
		}
		
		//effect
		if(is_str(text_effect.value) && !re_all.test(text_effect.value)){
			let search_str = text_effect.value.toHalfWidth();
			params.set('desc', search_str);
		}
	}	
	event.preventDefault();
	button1.disabled = false;
	button2.disabled = false;
	document.activeElement.blur();
	if(params.toString() != ''){
		window.location.search = '?' + params.toString();
	}
}
form1.onsubmit = query;

function server_analyze(params){
	var qstr = 'SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts WHERE datas.id == texts.id AND (type & $token OR abs(datas.id - alias) >= 10) AND (NOT type & $token OR alias == 0)';
	
	var arg = new Object();
	var valid = false;
	var is_monster = false;
	var pre_release = false;
	
	arg.$monster = TYPE_MONSTER;
	arg.$spell = TYPE_SPELL;
	arg.$trap = TYPE_TRAP;
	arg.$link = TYPE_LINK;
	arg.$pendulum = TYPE_PENDULUM;
	arg.$ext = TYPE_EXT;
	arg.$token = TYPE_TOKEN;
	
	// id
	let cid = check_int(params, 'id');
	if(cid && cid > 0){
		text_id.value = cid;
		qstr = qstr + " AND datas.id == $id";
		arg.$id = cid;
		valid = true;
	}
	else
		cid = 0;
	
	// ot
	let str_pack = params.get('pack');
	if(is_str(str_pack))
		select_ot.value = str_pack;
	switch(str_pack){
		case 'o':
		    qstr = qstr + " AND datas.ot != 2";
			break;
		case 't':
			qstr = qstr + " AND datas.ot == 2";
			valid = true;
			break;
		case '1104':
			qstr = qstr + pack_cmd(LIOV);
			valid = true;
			break;
		case '1105':
			qstr = qstr + " AND datas.id>=101105001 AND datas.id<=101105999";
			pre_release = true;
			valid = true;
			break;
		case 'DBAG':
			qstr = qstr + pack_cmd(DBAG);
			valid = true;
			break;
		default:
			break;
	}
	
	// type
	let ctype = check_int(params, 'type');
	let subtype = check_int(params, 'subtype');
	let sub_op = check_int(params, 'sub_op');
	let is_deck = check_int(params, 'is_deck');
	if(ctype !== null && ctype > 0){
		qstr = qstr + " AND type & $ctype";
		arg.$ctype = ctype;
	}
	else
		ctype = 0;
	
	switch(ctype){
		case TYPE_MONSTER:
			select_type.value = 'm';
			if(subtype !== null && subtype > 0){
				for(let i = 0; i < cb_mtype.length; ++i){
					if(subtype & id_to_type[cb_mtype[i].id])
						cb_mtype[i].checked = true;
				}
				if(sub_op){
					select_ao1.value = 'and';
					qstr += " AND type & $stype == $stype";
				}
				else{
					select_ao1.value = 'or';
					qstr += " AND type & $stype";
				}
				arg.$stype = subtype;
			}
			else
				subtype = 0;
			
			if(is_deck !== null && is_deck > 0){
				mtype_deck.checked = true;
				qstr += " AND NOT type & $ext";
			}
			valid = true;
			show_subtype('m');
			break;
		case TYPE_SPELL:
			select_type.value = 's';
			if(subtype !== null && subtype > 0){
				for(let i = 0; i < cb_stype.length; ++i){
					if(subtype & id_to_type[cb_stype[i].id])
						cb_stype[i].checked = true;
				}
				if(subtype & TYPE_NORMAL){
					if(subtype == TYPE_NORMAL){
						qstr += ' AND type == $spell';
					}
					else{
						qstr += ' AND (type == $spell OR type & $stype)';
						arg.$stype = subtype & ~TYPE_NORMAL;
					}
				}
				else{
					qstr += ' AND type & $stype';
					arg.$stype = subtype;
				}
			}
			else
				subtype = 0;
			valid = true;
			show_subtype('s');
			break;
		case TYPE_TRAP:
			select_type.value = 't';
			if(subtype !== null && subtype > 0){
				for(let i = 0; i < cb_ttype.length; ++i){
					if(subtype & id_to_type[cb_ttype[i].id])
						cb_ttype[i].checked = true;
				}
				if(subtype & TYPE_NORMAL){
					if(subtype == TYPE_NORMAL){
						qstr += ' AND type == $trap';
					}
					else{
						qstr += ' AND (type == $trap OR type & $stype)';
						arg.$stype = subtype & ~TYPE_NORMAL;
					}
				}
				else{
					qstr += ' AND type & $stype';
					arg.$stype = subtype;
				}
			}
			else
				subtype = 0;
			valid = true;
			show_subtype('t');
			break;
		default:
			subtype = 0;
			show_subtype('');
			break;
	}
	
	if(ctype == 0 || ctype == TYPE_MONSTER){
		// atk
		let atk1 = check_int(params, 'atk1');
		let atk2 = check_int(params, 'atk2');
		if(is_atk(atk1)){
			if(is_atk(atk2)){
				if(atk1 == -1 || atk2 == -1){
					text_atk1.value = -1;
					qstr += " AND atk == $atk1";
					arg.$atk1 = -2;
				}
				else{
					text_atk1.value = atk1;
					text_atk2.value = atk2;
					qstr += " AND atk >= $atk1 AND atk <= $atk2";
					arg.$atk1 = atk1;
					arg.$atk2 = atk2;
				}
			}
			else{
				text_atk1.value = atk1;
				qstr += " AND atk == $atk1";
				if(atk1 == -1)
					arg.$atk1 = -2;
				else
					arg.$atk1 = atk1;
			}
			valid = true;
			is_monster = true;
		}
		
		// def, exclude link monsters
		let def1 = check_int(params, 'def1');
		let def2 = check_int(params, 'def2');
		if(is_atk(def1)){
			qstr += " AND NOT type & $link";
			if(is_atk(def2)){
				if(def1 == -1 || def2 == -1){
					text_def1.value = -1;
					qstr = qstr + " AND def == $def1";
					arg.$def1 = -2;
				}
				else{
					text_def1.value = def1;
					text_def2.value = def2;
					qstr = qstr + " AND def >= $def1 AND def <= $def2";
					arg.$def1 = def1;
					arg.$def2 = def2;
				}
			}
			else{
				text_def1.value = def1;
				qstr = qstr + " AND def == $def1";
				if(def1 == -1)
					arg.$def1 = -2;
				else
					arg.$def1 = def1;
			}
			valid = true;
			is_monster = true;
		}
	
		// lv, rank, link
		let lv1 = check_int(params, 'lv1');
		let lv2 = check_int(params, 'lv2');
		if(is_lv(lv1)){
			text_lv1.value = lv1;
			if(is_lv(lv2)){
				text_lv2.value = lv2;
				qstr = qstr + " AND (level & 0xff) >= $lv1 AND (level & 0xff) <= $lv2";
				arg.$lv1 = lv1;
				arg.$lv2 = lv2;
			}
			else{
				qstr = qstr + " AND (level & 0xff) == $lv1";
				arg.$lv1 = lv1;
			}
			valid = true;
			is_monster = true;
		}
		
		// scale, pendulum monster only
		let sc1 = check_int(params, 'sc1');
		let sc2 = check_int(params, 'sc2');
		if(is_scale(sc1)){
			text_sc1.value = sc1;
			qstr += " AND type & $pendulum";
			if(is_scale(sc2)){
				text_sc2.value = sc2;
				qstr = qstr + " AND (level >> 24 & 0xff) >= $sc1 AND (level >> 24 & 0xff) <= $sc2";
				arg.$sc1 = sc1;
				arg.$sc2 = sc2;
			}
			else{
				qstr = qstr + " AND (level >> 24 & 0xff) == $sc1";
				arg.$sc1 = sc1;
			}
			valid = true;
			is_monster = true;
		}
		
		// attr, race
		let cattr = check_int(params, 'attr');
		let crace = check_int(params, 'race');
		if(cattr !== null && cattr > 0){
			for(let i = 0; i < cb_attr.length; ++i){
				if(cattr & index_to_attr[i])
					cb_attr[i].checked = true;
			}
			qstr = qstr + " AND attribute & $attr";
			arg.$attr = cattr;
			valid = true;
			is_monster = true;
		}
		if(crace !== null && crace > 0){
			for(let i = 0; i < cb_race.length; ++i){
				if(crace & index_to_race[i])
					cb_race[i].checked = true;
			}
			qstr = qstr + " AND race & $race";
			arg.$race = crace;
			valid = true;
			is_monster = true;
		}
		// marker
		let cmarker = check_int(params, 'marker');
		let marker_op = check_int(params, 'marker_op');
		if(cmarker !== null && cmarker > 0){
			for(let i = 0; i < cb_marker.length; ++i){
				if(cmarker & index_to_marker[i])
					cb_marker[i].checked = true;
			}
			qstr = qstr + " AND type & $link";
			if(marker_op){
				select_ao2.value = 'and';
				qstr = qstr + " AND def & $marker == $marker";
			}
			else{
				select_ao2.value = 'or';
				qstr = qstr + " AND def & $marker";
			}
			arg.$marker = cmarker;
			valid = true;
			is_monster = true;
		}
	}
	
	//text
	const setcode_str1 = '(setcode & 0xfff) == $settype AND (setcode & 0xf000 & $setsubtype) == $setsubtype';
	const setcode_str2 = '(setcode >> 16 & 0xfff) == $settype AND (setcode >> 16 & 0xf000 & $setsubtype) == $setsubtype';
	const setcode_str3 = '(setcode >> 32 & 0xfff) == $settype AND (setcode >> 32 & 0xf000 & $setsubtype) == $setsubtype';
	const setcode_str4 = '(setcode >> 48 & 0xfff) == $settype AND (setcode >> 48 & 0xf000 & $setsubtype) == $setsubtype';
	const setcode_str = ` OR (${setcode_str1} OR ${setcode_str2} OR ${setcode_str3} OR ${setcode_str4})`;
	const name_str = "name LIKE $name ESCAPE '$'";
	const desc_str = "desc LIKE $desc ESCAPE '$'";
	
	let cmulti = params.get('multi');
	let cname = '';
	let cdesc = '';
	if(cmulti){
		cname = cmulti;
		cdesc = '';
	}
	else{
		cname = params.get('name');
		cdesc = params.get('desc');
	}
	
	// name
	if(is_str(cname) && !re_all.test(cname)){
		let search_str = cname.toHalfWidth();
		let name_cmd = name_str;
		if(cmulti)
			text_multi.value = search_str;
		else
			text_name.value = search_str;
		
		if(!re_wildcard.test(search_str)){
			let real_str = search_str.replace(/\$%/g, '%');
			real_str = real_str.replace(/\$_/g, '_');
			
			let nid = Object.keys(name_table).find(key => name_table[key] === real_str);
			if(setname[real_str]){
				let set_code = parseInt(setname[real_str], 16);
				name_cmd += setcode_str;
				arg.$settype = set_code & 0x0fff;
				arg.$setsubtype = set_code & 0xf000;
			}
			
			if(nid){
				name_cmd += " OR datas.id == $nid";
				arg.$nid = nid;
			}
			search_str = `%${search_str}%`;
		}
		arg.$name = search_str;
		
		if(cmulti){
			name_cmd += ` OR ${desc_str}`;
			arg.$desc = search_str;
		}
		qstr += ` AND (${name_cmd})`;
		valid = true;
	}
	
	//effect
	if(is_str(cdesc) && !re_all.test(cdesc)){
		let search_str = cdesc.toHalfWidth();
		text_effect.value = search_str;
		if(!re_wildcard.test(search_str)){
			search_str = `%${search_str}%`;
		}
		qstr +=  ` AND ${desc_str}`;
		arg.$desc = search_str;
		valid = true;
	}
	
	// avoid trap monsters and tokens
	if(ctype == 0 && is_monster)
		qstr += " AND type & $monster";
	if(cid == 0 && !(subtype & TYPE_TOKEN))
		qstr += " AND NOT type & $token";
	qstr += ";";
	
	//console.log(qstr);
	//console.log(arg);
	
	if(!valid){
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
}

function url_query(){
	if(window.location.search.substring(1) == '')
		return;
	var params = new URLSearchParams(window.location.search);
	server_analyze(params);
}
