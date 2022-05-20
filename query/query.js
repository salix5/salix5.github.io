"use strict";
const extra_url = "../cdb/pre-release.cdb";

// max of int32: 10 digit
const MAX_DIGIT = 10;
const MAX_STRLEN = 200;

var config = {
	locateFile: filename => `./dist/${filename}`
}
var SQL;
var db, db2;

// from strings.conf, lflist.conf
var setname = new Object();
var ltable = new Object();

// from json
var cid_table, name_table, name_table_en, pack_list;

var result = [];
var pack_name = '';

//re_wildcard = /(?<!\$)[%_]/ (lookbehind)
const re_wildcard = /(^|[^\$])[%_]/;
const re_bad_escape = /\$(?![%_])/g;
const re_all_digit = /^\d+$/;

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

function query_card(db, qstr, arg){
	var stmt = db.prepare(qstr);
	stmt.bind(arg);
	while(stmt.step()) {
		// execute
		let card = stmt.getAsObject();
		if(card.id <= 99999999){
			card.db_id = cid_table[card.id];
			card.jp_name = name_table[card.id];
			card.en_name = name_table_en[card.id];
		}
		
		// spell & trap reset data
		if(card.type & (TYPE_SPELL | TYPE_TRAP)){
			card.atk = 0;
			card.def = 0;
			card.lv = 0;
			card.race = 0;
			card.attr = 0;
		}
		// limit
		if(ltable[card.id] === 0)
			card.limit = 0;
		else if(ltable[card.id] === 1)
			card.limit = 1;
		else if(ltable[card.id] === 2)
			card.limit = 2;
		else
			card.limit = 3;
		
		// pack_id
		if(card.id <= 99999999){
			if(pack_name && pack_list[pack_name])
				card.pack_id = pack_list[pack_name].findIndex(x => x === card.id);
			else
				card.pack_id = 0;
		}
		else{
			card.pack_id = card.id % 1000;
		}
		result.push(card);
	}
	stmt.free();
}

const promise_db = fetch(`https://salix5.github.io/CardEditor/${zip_tag}.zip`).then(response => response.blob()).then(JSZip.loadAsync).then(zip_file => zip_file.files["cards.cdb"].async("uint8array"));
const promise_db2 = fetch(extra_url).then(response => response.arrayBuffer()).then(process_buffer);
const promise_sql = initSqlJs(config).then(response => {SQL = response;});

const promise_cid = fetch("text/cid.json").then(response => response.json()).then(data => {cid_table = data;});
const promise_name = fetch("text/name_table.json").then(response => response.json()).then(data => {name_table = data;});
const promise_pack = fetch("text/pack_list.json").then(response => response.json()).then(data => {pack_list = data;});
const promise_name_en = fetch("text/name_table_en.json").then(response => response.json()).then(data => {name_table_en = data;});

const promise_strings = fetch("https://salix5.github.io/CardEditor/strings.conf").then(response => response.text()).then(function(data){
	let ldata = data.replace(/\r\n/g, '\n');
	let line = ldata.split('\n');
	for(let i = 0; i < line.length; ++i){
		let init = line[i].substring(0, 8);
		if(init === '!setname'){
			let tmp = line[i].substring(9);  // code + name
			let j = tmp.indexOf(' ');
			let scode = tmp.substring(0, j);
			let part = tmp.substring(j + 1).split('\t');
			let sname = part[0];
			setname[sname] = parseInt(scode, 16) ? parseInt(scode, 16) : 0;
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
		if(init === '!'){
			++count;
			// only take the first banlist
			if(count === 2)
				break;
		}
		else if(init === '#'){
			continue;
		}
		else{
			let part = line[i].split(' ');
			let id = parseInt(part[0], 10);
			if(id)
				ltable[id] = parseInt(part[1], 10) ? parseInt(part[1], 10) : 0;
		}
	}
}
);

Promise.all([promise_sql, promise_db, promise_db2, promise_cid, promise_name, promise_strings, promise_lflist]).then(function(values){
	db = new SQL.Database(values[1]);
	db2 = new SQL.Database(values[2]);
	url_query();
	button1.disabled = false;
	button2.disabled = false;
}
);

function is_atk(x){
	return (x >= -1);
}

function is_def(x){
	return (x >= -2);
}

function is_normal_atk(x){
	return (x >= 0);
}

function is_modulus(x) {
	return (x >= 0 && x <= 999);
}

function is_lv(x){
	return (x >= 1 && x <= 13);
}

function is_scale(x){
	return (x >= 0 && x <= 13);
}

function is_str(x){
	return (x && x.length <= MAX_STRLEN);
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
		return half_val;
	}
	else
		return '';
}

function pack_cmd(pack){
	var cmd = '';
	cmd = ` AND (datas.id=${pack[0]}`;
	for(let i = 1; i < pack.length; ++i)
		cmd += ` OR datas.id=${pack[i]}`;
	cmd += `)`;
	return cmd;
}

var id_to_type = {
	mtype1: TYPE_NORMAL,
	mtype2: TYPE_EFFECT,
	mtype3: TYPE_RITUAL,
	mtype4: TYPE_PENDULUM,
	
	mtype5: TYPE_FUSION,
	mtype6: TYPE_SYNCHRO,
	mtype7: TYPE_XYZ,
	mtype8: TYPE_LINK,
	
	mtype9: TYPE_TOON,
	mtype10: TYPE_SPIRIT,
	mtype11: TYPE_UNION,
	mtype12: TYPE_DUAL,
	
	mtype13: TYPE_TUNER,
	mtype14: TYPE_FLIP,
	mtype15: TYPE_SPSUMMON,
	mtype16: TYPE_TOKEN,
	
	stype1: TYPE_NORMAL,
	stype2: TYPE_QUICKPLAY,
	stype3: TYPE_CONTINUOUS,
	stype4: TYPE_EQUIP,
	
	stype5: TYPE_RITUAL,
	stype6: TYPE_FIELD,
	
	ttype1: TYPE_NORMAL,
	ttype2: TYPE_CONTINUOUS,
	ttype3: TYPE_COUNTER,
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

// legal string -> sqlite literal
function string_to_literal(str) {
	return re_wildcard.test(str) ? str : `%${str}%`;
}

function setcode_cmd(setcode) {
	const setcode_str1 = `(setcode & 0xfff) == (${setcode} & 0xfff) AND (setcode & (${setcode} & 0xf000)) == (${setcode} & 0xf000)`;
	const setcode_str2 = `(setcode >> 16 & 0xfff) == (${setcode} & 0xfff) AND (setcode >> 16 & (${setcode} & 0xf000)) == (${setcode} & 0xf000)`;
	const setcode_str3 = `(setcode >> 32 & 0xfff) == (${setcode} & 0xfff) AND (setcode >> 32 & (${setcode} & 0xf000)) == (${setcode} & 0xf000)`;
	const setcode_str4 = `(setcode >> 48 & 0xfff) == (${setcode} & 0xfff) AND (setcode >> 48 & (${setcode} & 0xf000)) == (${setcode} & 0xf000)`;
	let ret = `(${setcode_str1} OR ${setcode_str2} OR ${setcode_str3} OR ${setcode_str4})`;
	return ret;
}

// return: name_cmd
// en: table, ja: table, zh: query
function process_name(locale, raw_name, arg){
	const setcode_str = ` OR ${setcode_cmd("$setcode")}`;
	let str_name = raw_name.replace(re_bad_escape, "");
	if (!str_name)
		return "";
	
	let name_cmd = "";
	switch(locale){
		case "en":
			let en_list = [];
			for(const key in name_table_en){
				if (name_table_en[key] && name_table_en[key].toLowerCase().indexOf(str_name.toLowerCase()) !== -1)
					en_list.push(key);
				if (en_list.length > MAX_RESULT_LEN)
					break;
			}
			name_cmd = "0";
			if(en_list.length <= MAX_RESULT_LEN){
				for(let i = 0; i < en_list.length; ++i)
					name_cmd += ` OR datas.id=${en_list[i]}`;
			}
			break;
		default:
			// ja, name
			let jp_list = [];
			for (const key in name_table) {
				if (name_table[key].toHalfWidth().indexOf(str_name) !== -1)
					jp_list.push(key);
				if (jp_list.length > MAX_RESULT_LEN)
					break;
			}
			name_cmd = "0";
			if (jp_list.length <= MAX_RESULT_LEN) {
				for (let i = 0; i < jp_list.length; ++i)
					name_cmd += ` OR datas.id=${jp_list[i]}`;
			}
			// zh, setcode
			if (!re_wildcard.test(str_name)) {
				let real_str = str_name.replace(/\$%/g, '%');
				real_str = real_str.replace(/\$_/g, '_');
				if (setname[real_str]) {
					name_cmd += setcode_str;
					arg.$setcode = setname[real_str];
				}
			}
			// zh, name
			name_cmd += " OR name LIKE $name ESCAPE '$' OR alias IN (SELECT texts.id FROM texts WHERE name LIKE $name ESCAPE '$')";
			arg.$name = string_to_literal(str_name);
			break;
	}
	return name_cmd;
}


// entrance of query
function server_analyze1(params){
	let qstr = "SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts WHERE datas.id == texts.id"
	let arg = new Object();
	arg.$monster = TYPE_MONSTER;
	arg.$spell = TYPE_SPELL;
	arg.$trap = TYPE_TRAP;
	arg.$link = TYPE_LINK;
	arg.$pendulum = TYPE_PENDULUM;
	arg.$token = TYPE_TOKEN;

	let ctype = check_int(params.get("type"));
	let subtype = check_int(params.get("subtype"));

	if (ctype === TYPE_MONSTER && subtype > 0 && (subtype & TYPE_TOKEN)) {
		qstr += " AND (type & $token OR abs(datas.id - alias) >= 10) AND (NOT type & $token OR alias == 0)"
	}
	else {
		qstr += " AND NOT type & $token AND abs(datas.id - alias) >= 10";
	}

	// id, primary key
	let cid = check_int(params.get("id"));
	if(cid && cid > 0){
		text_id.value = cid;
		qstr += " AND datas.id == $id;";
		arg.$id = cid;
		query(qstr, arg);
		if(result.length === 1)
			document.title = result[0].name;
		show_result();
	}
	else {
		server_analyze_data(params, qstr, arg);
	}
}

function get_sw_str(x) {
	let sw_str1 = `race == $race_${x} AND attribute != $attr_${x} AND level != $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	let sw_str2 = ` OR race != $race_${x} AND attribute == $attr_${x} AND level != $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	let sw_str3 = ` OR race != $race_${x} AND attribute != $attr_${x} AND level == $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	let sw_str4 = ` OR race != $race_${x} AND attribute != $attr_${x} AND level != $lv_${x} AND atk == $atk_${x} AND def != $def_${x}`;
	let sw_str5 = ` OR race != $race_${x} AND attribute != $attr_${x} AND level != $lv_${x} AND atk != $atk_${x} AND def == $def_${x}`;
	return `(${sw_str1}${sw_str2}${sw_str3}${sw_str4}${sw_str5})`;
}

function get_single_card(cdata) {
	let qstr0 = "SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts";
	qstr0 += " WHERE datas.id == texts.id AND abs(datas.id - alias) >= 10 AND type & $monster AND NOT type & ($token | $ext)";

	let arg = new Object();
	arg.$monster = TYPE_MONSTER;
	arg.$spell = TYPE_SPELL;
	arg.$trap = TYPE_TRAP;
	arg.$link = TYPE_LINK;
	arg.$pendulum = TYPE_PENDULUM;
	arg.$token = TYPE_TOKEN;
	arg.$ext = TYPE_EXT;

	result.length = 0;
	let cid = check_int(cdata);
	if (cid && cid > 0) {
		let qstr = `${qstr0} AND datas.id == $id;`;
		arg.$id = cid;
		query(qstr, arg);
		if (result.length === 1)
			return result[0];
	}

	let str_name = cdata.replace(re_bad_escape, '');
	let real_str = str_name.replace(/\$%/g, '%');
	real_str = real_str.replace(/\$_/g, '_');
	if (real_str) {
		let qstr = `${qstr0} AND name == $exact;`;
		arg.$exact = real_str;
		query(qstr, arg);
		if (result.length === 1)
			return result[0];
	}

	let nid = Object.keys(name_table).find(key => name_table[key].toHalfWidth() === cdata);
	if (nid && nid > 0) {
		let qstr = `${qstr0} AND datas.id == $nid;`;
		arg.$nid = nid;
		query(qstr, arg);
		if (result.length === 1)
			return result[0];
	}

	let fuzzy_literal = string_to_literal(str_name);
	if (fuzzy_literal) {
		let qstr = `${qstr0} AND name LIKE $fuzzy ESCAPE '$';`;
		arg.$fuzzy = fuzzy_literal;
		query(qstr, arg);
		if (result.length === 1)
			return result[0];
	}
	return null;
}

// entrance of small world
function server_analyze2(params) {
	// id or name
	let cdata1 = check_str(params.get("id1"));
	if (cdata1)
		text_id1.value = cdata1;
	let cdata2 = check_str(params.get("id2"));
	if (cdata2)
		text_id2.value = cdata2;

	let card_begin = get_single_card(cdata1);
	let result_len1 = result.length;
	let card_end = get_single_card(cdata2);
	let result_len2 = result.length;

	let qstr0 = "SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts";
	qstr0 += " WHERE datas.id == texts.id AND abs(datas.id - alias) >= 10 AND type & $monster AND NOT type & ($token | $ext)";
	let arg = new Object();
	arg.$monster = TYPE_MONSTER;
	arg.$spell = TYPE_SPELL;
	arg.$trap = TYPE_TRAP;
	arg.$link = TYPE_LINK;
	arg.$pendulum = TYPE_PENDULUM;
	arg.$token = TYPE_TOKEN;
	arg.$ext = TYPE_EXT;

	if (result_len1 > 1) {
		let row0 = table_result.insertRow(-1);
		let cell0 = row0.insertCell(-1);
		table_result.style.border = '1px solid black';
		cell0.innerHTML = '起點數量太多。';
		return;
	}
	else if (result_len1 < 1) {
		let row0 = table_result.insertRow(-1);
		let cell0 = row0.insertCell(-1);
		table_result.style.border = '1px solid black';
		cell0.innerHTML = '找不到起點。';
		return;
	}
	
	if (result_len2 > 1) {
		let row0 = table_result.insertRow(-1);
		let cell0 = row0.insertCell(-1);
		table_result.style.border = '1px solid black';
		cell0.innerHTML = '終點數量太多。';
		return;
	}
	else if (result_len2 < 1) {
		let row0 = table_result.insertRow(-1);
		let cell0 = row0.insertCell(-1);
		table_result.style.border = '1px solid black';
		cell0.innerHTML = '找不到終點。';
		return;
	}
	
	let qstr_final = `${qstr0} AND ${get_sw_str('begin')} AND ${get_sw_str('end')}`;
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
	server_analyze_data(params, qstr_final, arg);
}

function server_analyze_data(params, qstr, arg){
	// pack
	let tmps = check_str(params.get("pack"));
	pack_name = '';
	switch(tmps){
		case 'o':
			qstr = qstr + " AND datas.ot != 2";
			break;
		case 't':
			qstr = qstr + " AND datas.ot == 2";
			arg.valid = true;
			break;
		default:
			for(const prop in pack_list){
				if(tmps === prop){
					qstr += pack_cmd(pack_list[prop]);
					pack_name = prop;
					arg.valid = true;
					break;
				}
			}
			if(pack_name)
				break;
			for(const prop in pre_release){
				if(tmps === prop){
					qstr += ` AND datas.id>=${pre_release[prop]} AND datas.id<=${pre_release[prop] + 998}`;
					pack_name = prop;
					arg.valid = true;
					break;
				}
			}
			break;
	}
	select_ot.value = tmps;
	
	// type
	let ctype = check_int(params.get("type"));
	let subtype = check_int(params.get("subtype"));
	let sub_op = check_int(params.get("sub_op"));
	let exc = check_int(params.get("exc"));
	
	arg.$ctype = 0;
	arg.$stype = 0;
	if(ctype && ctype > 0){
		qstr = qstr + " AND type & $ctype";
		arg.$ctype = ctype;
	}
	
	switch(ctype){
		case TYPE_MONSTER:
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
			if(exc && exc > 0){
				for(let i = 0; i < cb_exclude.length; ++i){
					if(exc & id_to_type[cb_mtype[i].id])
						cb_exclude[i].checked = true;
				}
				qstr += " AND NOT type & $exc";
				arg.$exc = exc;
			}
			arg.valid = true;
			if(select_type){
				select_type.value = 'm';
				show_subtype('m');
			}
			break;
		case TYPE_SPELL:
			if(subtype && subtype > 0){
				for(let i = 0; i < cb_stype.length; ++i){
					if(subtype & id_to_type[cb_stype[i].id])
						cb_stype[i].checked = true;
				}
				if(subtype & TYPE_NORMAL){
					if(subtype === TYPE_NORMAL){
						qstr += " AND type == $spell";
					}
					else{
						qstr += " AND (type == $spell OR type & $stype)";
						arg.$stype = subtype & ~TYPE_NORMAL;
					}
				}
				else{
					qstr += " AND type & $stype";
					arg.$stype = subtype;
				}
			}
			arg.valid = true;
			if(select_type){
				select_type.value = 's';
				show_subtype('s');
			}
			break;
		case TYPE_TRAP:
			if(subtype && subtype > 0){
				for(let i = 0; i < cb_ttype.length; ++i){
					if(subtype & id_to_type[cb_ttype[i].id])
						cb_ttype[i].checked = true;
				}
				if(subtype & TYPE_NORMAL){
					if(subtype === TYPE_NORMAL){
						qstr += " AND type == $trap";
					}
					else{
						qstr += " AND (type == $trap OR type & $stype)";
						arg.$stype = subtype & ~TYPE_NORMAL;
					}
				}
				else{
					qstr += " AND type & $stype";
					arg.$stype = subtype;
				}
			}
			arg.valid = true;
			if(select_type){
				select_type.value = 't';
				show_subtype('t');
			}
			break;
		default:
			if(select_type){
				select_type.value = '';
				show_subtype('');
			}
			break;
	}
	
	if(arg.$ctype === 0 || arg.$ctype === TYPE_MONSTER){
		let is_monster = false;
		// mat
		let mat = check_str(params.get("mat")).replace(/(^|[^\$])[%_]/g, "");
		if(mat){
			text_mat.value = mat;
			qstr += " AND (desc LIKE $mat1 ESCAPE '$' OR desc LIKE $mat2 ESCAPE '$')";
			arg.$mat1 = `%「${mat}」+%`;
			arg.$mat2 = `%+「${mat}」%`;
			arg.valid = true;
			is_monster = true;
		}
		
		// atk
		let atk1 = check_int(params.get("atk1"));
		let atk2 = check_int(params.get("atk2"));
		let atk_mod = check_int(params.get("atkm"));
		if (atk1 === -1) {
			text_atk1.value = -1;
			qstr += " AND atk == -2";
			arg.valid = true;
			is_monster = true;
		}
		else if (is_normal_atk(atk1)) {
			if (is_normal_atk(atk2)) {
				text_atk1.value = atk1;
				text_atk2.value = atk2;
				qstr += " AND atk >= $atk1 AND atk <= $atk2";
				arg.$atk1 = atk1;
				arg.$atk2 = atk2;
			}
			else {
				text_atk1.value = atk1;
				qstr += " AND atk == $atk1";
				arg.$atk1 = atk1;
			}
			arg.valid = true;
			is_monster = true;
		}
		if (is_modulus(atk_mod)) {
			qstr += " AND atk % 1000 == $atkm";
			arg.$atkm = atk_mod;
			arg.valid = true;
			is_monster = true;
		}

		// def, exclude link monsters
		let def1 = check_int(params.get("def1"));
		let def2 = check_int(params.get("def2"));
		let sum = check_int(params.get("sum"));
		let def_mod = check_int(params.get("defm"));
		if (is_def(def1) || is_normal_atk(def2) || is_normal_atk(sum) || is_modulus(def_mod))
			qstr += " AND NOT type & $link";
		if (def1 === -1) {
			text_def1.value = -1;
			qstr += " AND def == -2";
			arg.valid = true;
			is_monster = true;
		}
		else if (def1 === -2) {
			text_def1.value = -2;
			qstr += " AND def == atk AND def != -2";
			arg.valid = true;
			is_monster = true;
		}
		else if (is_normal_atk(def1)) {
			if (is_normal_atk(def2)) {
				text_def1.value = def1;
				text_def2.value = def2;
				qstr += " AND def >= $def1 AND def <= $def2";
				arg.$def1 = def1;
				arg.$def2 = def2;
			}
			else {
				text_def1.value = def1;
				qstr += " AND def == $def1";
				arg.$def1 = def1;
			}
			arg.valid = true;
			is_monster = true;
		}
		if (is_modulus(def_mod)) {
			qstr += " AND def % 1000 == $defm";
			arg.$defm = def_mod;
			arg.valid = true;
			is_monster = true;
		}
		
		// sum
		if(is_normal_atk(sum)){
			text_sum.value = sum;
			qstr += " AND atk != -2 AND def != -2 AND atk + def == $sum";
			arg.$sum = sum;
			arg.valid = true;
			is_monster = true;
		}
	
		// lv, rank, link
		let lv1 = check_int(params.get("lv1"));
		let lv2 = check_int(params.get("lv2"));
		if(is_lv(lv1)){
			text_lv1.value = lv1;
			if(is_lv(lv2)){
				text_lv2.value = lv2;
				qstr += " AND (level & 0xff) >= $lv1 AND (level & 0xff) <= $lv2";
				arg.$lv1 = lv1;
				arg.$lv2 = lv2;
			}
			else{
				qstr += " AND (level & 0xff) == $lv1";
				arg.$lv1 = lv1;
			}
			arg.valid = true;
			is_monster = true;
		}
		
		// scale, pendulum monster only
		let sc1 = check_int(params.get("sc1"));
		let sc2 = check_int(params.get("sc2"));
		if(is_scale(sc1)){
			text_sc1.value = sc1;
			qstr += " AND type & $pendulum";
			if(is_scale(sc2)){
				text_sc2.value = sc2;
				qstr += " AND (level >> 24 & 0xff) >= $sc1 AND (level >> 24 & 0xff) <= $sc2";
				arg.$sc1 = sc1;
				arg.$sc2 = sc2;
			}
			else{
				qstr += " AND (level >> 24 & 0xff) == $sc1";
				arg.$sc1 = sc1;
			}
			arg.valid = true;
			is_monster = true;
		}
		
		// attr, race
		let cattr = check_int(params.get("attr"));
		let crace = check_int(params.get("race"));
		if(cattr && cattr > 0){
			for(let i = 0; i < cb_attr.length; ++i){
				if(cattr & index_to_attr[i])
					cb_attr[i].checked = true;
			}
			qstr += " AND attribute & $attr";
			arg.$attr = cattr;
			arg.valid = true;
			is_monster = true;
		}
		if(crace && crace > 0){
			for(let i = 0; i < cb_race.length; ++i){
				if(crace & index_to_race[i])
					cb_race[i].checked = true;
			}
			qstr += " AND race & $race";
			arg.$race = crace;
			arg.valid = true;
			is_monster = true;
		}
		// marker
		let cmarker = check_int(params.get("marker"));
		let marker_op = check_int(params.get("marker_op"));
		if(cmarker && cmarker > 0){
			for(let i = 0; i < cb_marker.length; ++i){
				if(cmarker & index_to_marker[i])
					cb_marker[i].checked = true;
			}
			qstr += " AND type & $link";
			if(marker_op){
				select_marker_op.value = 'and';
				qstr += " AND def & $marker == $marker";
			}
			else{
				select_marker_op.value = 'or';
				qstr += " AND def & $marker";
			}
			arg.$marker = cmarker;
			arg.valid = true;
			is_monster = true;
		}
		if(arg.$ctype === 0 && is_monster)
			qstr += " AND type & $monster";
	}
	
	const desc_str = "desc LIKE $desc ESCAPE '$'";
	let cmulti = check_str(params.get("multi")).replace(re_bad_escape, "");
	let clocale = check_str(params.get("locale"));
	switch(clocale){
		case "en":
			select_locale.value = clocale;
			break;
		default:
			clocale = "";
			select_locale.value = "";
			break;
	}
	let name_cmd = process_name(clocale, cmulti, arg);
	if (name_cmd) {
		// multi
		text_multi.value = cmulti;
		qstr += ` AND (${name_cmd} OR ${desc_str})`;
		arg.$desc = string_to_literal(cmulti);
		arg.valid = true;
	}
	else {
		// name
		let cname = check_str(params.get("name")).replace(re_bad_escape, "");
		name_cmd = process_name(clocale, cname, arg);
		if (name_cmd) {
			text_name.value = cname;
			qstr += ` AND (${name_cmd})`;
			arg.valid = true;
		}
		// desc
		let cdesc = check_str(params.get("desc")).replace(re_bad_escape, "");
		if (cdesc) {
			text_effect.value = cdesc;
			qstr += ` AND ${desc_str}`;
			arg.$desc = string_to_literal(cdesc);
			arg.valid = true;
		}
	}
	qstr += ";";
	
	if(!arg.valid){
		return;
	}
	query(qstr, arg);
	if(result.length === 1)
		document.title = result[0].name;
	show_result();
}

function query(qstr, arg){
	result.length = 0;
	query_card(db, qstr, arg);
	query_card(db2, qstr, arg);
}
