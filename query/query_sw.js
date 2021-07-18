"use strict";
// max of int32: 10 digit
const MAX_DIGIT = 10;
const MAX_STRLEN = 600;

var config = {
	locateFile: filename => `./dist/${filename}`
}
var db, db2;
var cid_table, name_table;
var setname = new Object();
var ltable = new Object();
var result = [];
var pack_name = '';

const url = '../cdb/pre-release.cdb';

//re_wildcard = /(?<!\$)[%_]/ (lookbehind)
const re_wildcard = /(^|[^\$])[%_]/;
const re_all = /^%+$/;

String.prototype.toHalfWidth = function() {
	return this.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) - 0xFEE0)});
};

String.prototype.toFullWidth = function() {
	return this.replace(/[A-Za-z0-9]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);});
};

function process_buffer(buf){
	let arr = new Uint8Array(buf);
	return arr;
}

const promise_db = fetch(`https://raw.githubusercontent.com/salix5/CardEditor/${tag}/cards.cdb`).then(response => response.arrayBuffer()).then(process_buffer);
const promise_db2 = fetch(url).then(response => response.arrayBuffer()).then(process_buffer);
const promise_sql = initSqlJs(config);

const promise_cid = fetch("text/cid.json").then(response => response.json()).then(data => {cid_table = data;});
const promise_name = fetch("text/name_table.json").then(response => response.json()).then(data => {name_table = data;});

const promise_strings = fetch(`https://raw.githubusercontent.com/salix5/CardEditor/${tag}/strings.conf`).then(response => response.text()).then(function(data){
	let ldata = data.replace(/\r\n/g, '\n');
	let line = ldata.split('\n');
	for(let i = 0; i < line.length; ++i){
		let init = line[i].substring(0, 8);
		if(init == '!setname'){
			let tmp = line[i].substring(9);  // code + name
			let j = tmp.indexOf(' ');
			let scode = tmp.substring(0, j);
			let part = tmp.substring(j + 1).split('\t');
			let sname = part[0];
			setname[sname] = scode;
		}
	}
}
);

const promise_lflist = fetch("text/lflist.conf").then(response => response.text()).then(function(data){
	let ldata = data.replace(/\r\n/g, '\n');
	let line = ldata.split('\n');
	let count = 0;
	for(let i = 0; i < line.length; ++i){
		let init = line[i].substring(0, 1);
		if(init == '!'){
			++count;
			// only take the first banlist
			if(count == 2)
				break;
		}
		else if(init == '#'){
			continue;
		}
		else{
			let part = line[i].split(' ');
			let id = parseInt(part[0], 10);
			let limit = parseInt(part[1], 10);
			ltable[id] = limit;
		}
	}
}
);

Promise.all([promise_sql, promise_db, promise_db2, promise_cid, promise_name, promise_strings, promise_lflist]).then(function(values){
	let SQL = values[0];
	db = new SQL.Database(values[1]);
	db2 = new SQL.Database(values[2]);
	url_query();
	button1.disabled = false;
	button2.disabled = false;
}
);

function is_atk(x){
	if(Number.isNaN(x))
		return false;
	else if(x >= -1)
		return true;
	else
		return false;
}

function is_def(x){
	if(Number.isNaN(x))
		return false;
	else if(x >= -2)
		return true;
	else
		return false;
}

function is_lv(x){
	if(Number.isNaN(x))
		return false;
	else if(x >= 1 && x <= 13)
		return true;
	else
		return false;
}

function is_scale(x){
	if(Number.isNaN(x))
		return false;
	else if(x >= 0 && x <= 13)
		return true;
	else
		return false;
}

function is_str(x){
	if(x && x.length <= MAX_STRLEN){
		return true;
	}
	else
		return false;
}

function check_int(val){
	if(val && val.length <= MAX_DIGIT){
		let x = parseInt(val, 10);
		return x;
	}
	else
		return Number.NaN;
}

function check_str(val){
	if(!val)
		return '';
	let half_val = val.toHalfWidth()
	if(is_str(half_val)){
		return val;
	}
	else
		return '';
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
	mtype4: TYPE_PENDULUM,
	
	mtype9: TYPE_TOON,
	mtype10: TYPE_SPIRIT,
	mtype11: TYPE_UNION,
	mtype12: TYPE_DUAL,
	
	mtype13: TYPE_TUNER,
	mtype14: TYPE_FLIP,
	mtype15: TYPE_SPSUMMON,
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
	RACE_CYBERSE,
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


function query(event){
	var params = new URLSearchParams();
	var cid1 = 0;
	var cid2 = 0;
	
	button1.disabled = true;
	button2.disabled = true;
	// id
	if(text_id1.value && text_id1.value.length <= MAX_DIGIT)
		cid1 = parseInt(text_id1.value, 10);
	if(cid1 && cid1 > 0){
		params.set('id1', cid1.toString().padStart(8, '0'));
	}
	if(text_id2.value && text_id2.value.length <= MAX_DIGIT)
		cid2 = parseInt(text_id2.value, 10);
	if(cid2 && cid2 > 0){
		params.set('id2', cid2.toString().padStart(8, '0'));
	}
	
	// pack
	let pack = select_ot.value.toHalfWidth();
	if(is_str(pack))
		params.set('pack', pack);
	
	// type
	let subtype = 0;
	for(let i = 0; i < cb_mtype.length; ++i){
		if(cb_mtype[i].checked)
			subtype |= id_to_type[cb_mtype[i].id];
	}
	if(subtype){
		params.set('subtype', subtype.toString(10));
		// default: or
		if(select_subtype_op.value == 'and')
			params.set('sub_op', 1);
		else
			params.set('sub_op', 0);
	}
	// exclude has the same checkboxes
	let exc = 0;
	for(let i = 0; i < cb_exclude.length; ++i){
		if(cb_exclude[i].checked)
			exc |= id_to_type[cb_mtype[i].id];
	}
	if(exc) {
		params.set('exc', exc.toString(10));
	}
	
	// atk
	let atk1 = -10;
	let atk2 = -10;
	if(text_atk1.value && text_atk1.value.length <= MAX_DIGIT)
		atk1 = parseInt(text_atk1.value, 10);
	if(text_atk2.value && text_atk2.value.length <= MAX_DIGIT)
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
	let def1 = -10;
	let def2 = -10;
	if(text_def1.value && text_def1.value.length <= MAX_DIGIT)
		def1 = parseInt(text_def1.value, 10);
	if(text_def2.value && text_def2.value.length <= MAX_DIGIT)
		def2 = parseInt(text_def2.value, 10);
	if(is_def(def1) || is_def(def2)){
		if(def1 == -1 || def2 == -1){
			params.set('def1', -1);
		}
		else if(def1 == -2 || def2 == -2){
			params.set('def1', -2);
		}
		else if(!is_def(def2)){
			params.set('def1', def1);
		}
		else if(!is_def(def1)){
			params.set('def1', def2);
		}
		else {
			params.set('def1', def1);
			params.set('def2', def2);
		}
	}
	
	// lv, scale
	let lv1 = -10;
	let lv2 = -10;
	let sc1 = -10;
	let sc2 = -10;
	if(text_lv1.value && text_lv1.value.length <= MAX_DIGIT)
		lv1 = parseInt(text_lv1.value, 10);
	if(text_lv2.value && text_lv2.value.length <= MAX_DIGIT)
		lv2 = parseInt(text_lv2.value, 10);
	if(text_sc1.value && text_sc1.value.length <= MAX_DIGIT)
		sc1 = parseInt(text_sc1.value, 10);
	if(text_sc2.value && text_sc2.value.length <= MAX_DIGIT)
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
	let cattr = 0;
	for(let i = 0; i < cb_attr.length; ++i){
		if(cb_attr[i].checked)
			cattr |= index_to_attr[i];
	}
	if(cattr){
		params.set('attr', cattr.toString(10));
	}
	
	let crace = 0;
	for(let i = 0; i < cb_race.length; ++i){
		if(cb_race[i].checked)
			crace |= index_to_race[i];
	}
	if(crace){
		params.set('race', crace.toString(10));
	}
			
		
		//multi
		let cmulti = text_multi.value.toHalfWidth();
		if(is_str(cmulti))
			params.set('multi', cmulti);
		else{
			// name
			let cname = text_name.value.toHalfWidth();
			if(is_str(cname))
				params.set('name', cname);
			
			//effect
			let cdesc = text_effect.value.toHalfWidth();
			if(is_str(cdesc))
				params.set('desc', cdesc);
		}
	
	document.activeElement.blur();
	event.preventDefault();
	if(params.toString() != ''){
		window.location.search = '?' + params.toString();
	}
	else{
		button1.disabled = false;
		button2.disabled = false;
	}
}
form1.onsubmit = query;

function get_single_card(id){
	let qstr = 'SELECT datas.id, type, atk, def, level, attribute, race, name FROM datas, texts';
	qstr += ' WHERE datas.id == texts.id AND NOT type & ($token | $ext) AND datas.id == $id';
	
	let arg = new Object();
	arg.$token = TYPE_TOKEN;
	arg.$ext = TYPE_EXT;
	arg.$id = id;
	
	let card = null;
	
	let stmt1 = db.prepare(qstr);
	stmt1.bind(arg);
	if(stmt1.step()){
		card = stmt1.getAsObject();
	}
	else {
		let stmt2 = db2.prepare(qstr);
		stmt2.bind(arg);
		if(stmt2.step())
			card = stmt2.getAsObject();
	}
	return card;
}

function get_sw_str(x){
	let sw_str1 = `race == $race_${x} AND attribute != $attr_${x} AND level != $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	let sw_str2 = ` OR race != $race_${x} AND attribute == $attr_${x} AND level != $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	let sw_str3 = ` OR race != $race_${x} AND attribute != $attr_${x} AND level == $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	let sw_str4 = ` OR race != $race_${x} AND attribute != $attr_${x} AND level != $lv_${x} AND atk == $atk_${x} AND def != $def_${x}`;
	let sw_str5 = ` OR race != $race_${x} AND attribute != $attr_${x} AND level != $lv_${x} AND atk != $atk_${x} AND def == $def_${x}`;
	let sw_str = `(${sw_str1}${sw_str2}${sw_str3}${sw_str4}${sw_str5})`
	return sw_str
}

function server_analyze(params){
	// id, primary key
	let cid1 = check_int(params.get("id1"));
	let cid2 = check_int(params.get("id2"));
	let card_begin = null;
	let card_end = null;
	
	if(cid1 && cid1 > 0){
		text_id1.value = cid1;
		card_begin = get_single_card(cid1);
	}
	if(cid2 && cid2 > 0){
		text_id2.value = cid2;
		card_end = get_single_card(cid2);
	}
	
	if(!card_begin){
		result.length = 0;
		let row0 = table_result.insertRow(-1);
		let cell0 = row0.insertCell(-1);
		table_result.style.border = '1px solid black';
		cell0.innerHTML = '找不到起點。';
		return;
	}
	if(!card_end){
		result.length = 0;
		let row0 = table_result.insertRow(-1);
		let cell0 = row0.insertCell(-1);
		table_result.style.border = '1px solid black';
		cell0.innerHTML = '找不到終點。';
		return;
	}
	
	var qstr = 'SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts'
	qstr += ' WHERE datas.id == texts.id AND abs(datas.id - alias) >= 10 AND type & $monster AND NOT type & ($token | $ext)';
	
	var arg = new Object();
	var valid = false;
	
	arg.$monster = TYPE_MONSTER;
	arg.$link = TYPE_LINK;
	arg.$pendulum = TYPE_PENDULUM;
	arg.$token = TYPE_TOKEN;
	arg.$ext = TYPE_EXT;
	
	arg.$race_begin = card_begin.race;
	arg.$attr_begin = card_begin.attribute;
	arg.$lv_begin = card_begin.level;
	arg.$atk_begin = card_begin.atk;
	arg.$def_begin = card_begin.def;
	
	arg.$race_end = card_end.race;
	arg.$attr_end = card_end.attribute;
	arg.$lv_end = card_end.level;
	arg.$atk_end = card_end.atk;
	arg.$def_end = card_end.def;
		
	// pack
	let tmps = check_str(params.get("pack"));
	switch(tmps){
		case 'o':
			qstr = qstr + " AND datas.ot != 2";
			pack_name = '';
			break;
		case 't':
			qstr = qstr + " AND datas.ot == 2";
			pack_name = '';
			break;

		default:
			for(const prop in pack_list){
				if(tmps === prop){
					qstr += pack_cmd(pack_list[prop]);
					pack_name = prop;
					valid = true;
					break;
				}
			}
			if(!valid){
				for(const prop in pre_release){
					if(tmps === prop){
						qstr += ` AND datas.id>=${pre_release[prop]} AND datas.id<=${pre_release[prop] + 998}`;
						pack_name = prop;
						valid = true;
						break;
					}
				}
			}
			if(!valid)
				pack_name = '';
			break;
	}
	select_ot.value = tmps;
	
	// type
	let subtype = check_int(params.get("subtype"));
	let sub_op = check_int(params.get("sub_op"));
	let exc = check_int(params.get("exc"));

	if(subtype && subtype > 0){
		for(let i = 0; i < cb_mtype.length; ++i){
			if(subtype & id_to_type[cb_mtype[i].id])
				cb_mtype[i].checked = true;
		}
		if(sub_op){
			select_subtype_op.value = 'and';
			qstr += " AND type & $stype == $stype";
		}
		else{
			select_subtype_op.value = 'or';
			qstr += " AND type & $stype";
		}
		arg.$stype = subtype;
	}
	else
		subtype = 0;
	
	if(exc && exc > 0){
		for(let i = 0; i < cb_exclude.length; ++i){
			if(exc & id_to_type[cb_mtype[i].id])
				cb_exclude[i].checked = true;
		}
		qstr += " AND NOT type & $exc";
		arg.$exc = exc;
	}
	else
		exc = 0;
	
	
	// atk
	let atk1 = check_int(params.get("atk1"));
	let atk2 = check_int(params.get("atk2"));
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
	}
	
	// def, exclude link monsters
	let def1 = check_int(params.get("def1"));
	let def2 = check_int(params.get("def2"));
	if(is_def(def1)){
		qstr += " AND NOT type & $link";
		if(is_def(def2)){
			if(def1 == -1 || def2 == -1){
				text_def1.value = -1;
				qstr = qstr + " AND def == $def1";
				arg.$def1 = -2;
			}
			else if(def1 == -2 || def2 == -2){
				text_def1.value = -2;
				qstr = qstr + " AND def == atk";
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
			if(def1 == -1){
				qstr = qstr + " AND def == $def1";
				arg.$def1 = -2;
			}
			else if(def1 == -2){
				qstr = qstr + " AND def == atk";
			}
			else{
				qstr = qstr + " AND def == $def1";
				arg.$def1 = def1;
			}
		}
	}
	
	// lv, rank, link
	let lv1 = check_int(params.get("lv1"));
	let lv2 = check_int(params.get("lv2"));
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
	}
	
	// scale, pendulum monster only
	let sc1 = check_int(params.get("sc1"));
	let sc2 = check_int(params.get("sc2"));
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
	}
	
	// attr, race
	let cattr = check_int(params.get("attr"));
	let crace = check_int(params.get("race"));
	if(cattr && cattr > 0){
		for(let i = 0; i < cb_attr.length; ++i){
			if(cattr & index_to_attr[i])
				cb_attr[i].checked = true;
		}
		qstr = qstr + " AND attribute & $attr";
		arg.$attr = cattr;
	}
	if(crace && crace > 0){
		for(let i = 0; i < cb_race.length; ++i){
			if(crace & index_to_race[i])
				cb_race[i].checked = true;
		}
		qstr = qstr + " AND race & $race";
		arg.$race = crace;
	}
	
	//text
	const setcode_str1 = '(setcode & 0xfff) == $settype AND (setcode & 0xf000 & $setsubtype) == $setsubtype';
	const setcode_str2 = '(setcode >> 16 & 0xfff) == $settype AND (setcode >> 16 & 0xf000 & $setsubtype) == $setsubtype';
	const setcode_str3 = '(setcode >> 32 & 0xfff) == $settype AND (setcode >> 32 & 0xf000 & $setsubtype) == $setsubtype';
	const setcode_str4 = '(setcode >> 48 & 0xfff) == $settype AND (setcode >> 48 & 0xf000 & $setsubtype) == $setsubtype';
	const setcode_str = ` OR (${setcode_str1} OR ${setcode_str2} OR ${setcode_str3} OR ${setcode_str4})`;
	const name_str = "name LIKE $name ESCAPE '$'";
	const desc_str = "desc LIKE $desc ESCAPE '$'";
	
	let cmulti = check_str(params.get("multi"));
	let cname = '';
	let cdesc = '';
	if(cmulti){
		cname = cmulti;
		cdesc = '';
	}
	else{
		cname = check_str(params.get("name"));
		cdesc = check_str(params.get("desc"));
	}
	
	// name
	if(cname){
		let search_str = cname;
		let name_cmd = name_str;
		search_str = search_str.replace(/\$(?![%_])/g, '');
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
			
			if(search_str)
				search_str = `%${search_str}%`;
		}
		arg.$name = search_str;
		
		if(cmulti){
			name_cmd += ` OR ${desc_str}`;
			arg.$desc = search_str;
		}
		qstr += ` AND (${name_cmd})`;
	}
	
	//effect
	if(cdesc){
		let search_str = cdesc;
		search_str = search_str.replace(/\$(?![%_])/g, '');
		text_effect.value = search_str;
		if(!re_wildcard.test(search_str)){
			if(search_str)
				search_str = `%${search_str}%`;
		}
		qstr += ` AND ${desc_str}`;
		arg.$desc = search_str;
	}
	
	qstr += ` AND ${get_sw_str('begin')}`;
	qstr += ` AND ${get_sw_str('end')}`;
	qstr += ";";
	
	//console.log(qstr);
	//console.log(arg);

	
	result.length = 0;
	// released cards
	var stmt = db.prepare(qstr);
	stmt.bind(arg);
	while(stmt.step()) {
		// execute
		let card = stmt.getAsObject();
		if(card.id <= 99999999){
			card.db_id = cid_table[card.id];
			card.jp_name = name_table[card.id];
		}
		// limit
		if(ltable[card.id] == 0)
			card.limit = 0;
		else if(ltable[card.id] == 1)
			card.limit = 1;
		else if(ltable[card.id] == 2)
			card.limit = 2;
		else
			card.limit = 3;
		
		// pack_id
		if(card.id <= 99999999){
			if(pack_list[pack_name])
				card.pack_id = pack_list[pack_name].findIndex(x => x == card.id) + 1;
			else
				card.pack_id = 0;
		}
		else{
			card.pack_id = card.id % 1000;
		}
		result.push(card);
	}
	
	// pre-release cards
	stmt = db2.prepare(qstr);
	stmt.bind(arg);
	while(stmt.step()) {
		// execute
		let card = stmt.getAsObject();
		if(card.id <= 99999999){
			card.db_id = cid_table[card.id];
			card.jp_name = name_table[card.id];
		}
		// limit
		if(ltable[card.id] == 0)
			card.limit = 0;
		else if(ltable[card.id] == 1)
			card.limit = 1;
		else if(ltable[card.id] == 2)
			card.limit = 2;
		else
			card.limit = 3;
		
		// pack_id
		if(card.id <= 99999999){
			if(pack_list[pack_name])
				card.pack_id = pack_list[pack_name].findIndex(x => x == card.id) + 1;
			else
				card.pack_id = 0;
		}
		else{
			card.pack_id = card.id % 1000;
		}
		result.push(card);
	}
	if(result.length == 1)
		document.title = result[0].name;
	show_result();
}

function url_query(){
	if(window.location.search.substring(1) == '')
		return;
	var params = new URLSearchParams(window.location.search);
	server_analyze(params);
}