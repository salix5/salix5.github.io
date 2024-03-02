"use strict";
const MAX_STRING_LEN = 10;
const MAX_TEXT_LEN = 200;

let current_stmt = "";
const result = [];

//re_wildcard = /(?<!\$)[%_]/ (lookbehind)
const re_wildcard = /(^|[^\$])[%_]/;
const re_bad_escape = /\$(?![%_])/;
const re_special = /[\$%_]/;

const re_id = /^\d{1,9}$/;
const re_value = /^\d{1,2}$/;
const re_pack = /^_?\w{4}$/;
const re_number = /^-?\d+$/;

const mtype_list = [
	TYPE_FUSION,
	TYPE_SYNCHRO,
	TYPE_XYZ,
	TYPE_LINK,
	TYPE_NORMAL,

	TYPE_EFFECT,
	TYPE_RITUAL,
	TYPE_PENDULUM,
	TYPE_TOON,
	TYPE_SPIRIT,

	TYPE_UNION,
	TYPE_DUAL,
	TYPE_TUNER,
	TYPE_FLIP,
	TYPE_SPSUMMON,
];

const exclude_list = [
	TYPE_FUSION,
	TYPE_SYNCHRO,
	TYPE_XYZ,
	TYPE_LINK,
	TYPE_NORMAL,

	TYPE_EFFECT,
	TYPE_RITUAL,
	TYPE_PENDULUM,
	TYPE_TOON,
	TYPE_SPIRIT,

	TYPE_UNION,
	TYPE_DUAL,
	TYPE_TUNER,
	TYPE_FLIP,
	TYPE_SPSUMMON,
];

const stype_list = [
	TYPE_NORMAL,
	TYPE_QUICKPLAY,
	TYPE_CONTINUOUS,
	TYPE_EQUIP,
	TYPE_RITUAL,
	TYPE_FIELD,
];

const ttype_list = [
	TYPE_NORMAL,
	TYPE_CONTINUOUS,
	TYPE_COUNTER,
];

const attr_list = [
	ATTRIBUTE_EARTH,
	ATTRIBUTE_WATER,
	ATTRIBUTE_FIRE,
	ATTRIBUTE_WIND,
	ATTRIBUTE_LIGHT,
	ATTRIBUTE_DARK,
	ATTRIBUTE_DIVINE,
];

const race_list = [
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
	RACE_ILLUSION,
];

const marker_list = [
	LINK_MARKER_TOP_LEFT,
	LINK_MARKER_TOP,
	LINK_MARKER_TOP_RIGHT,

	LINK_MARKER_LEFT,
	LINK_MARKER_RIGHT,

	LINK_MARKER_BOTTOM_LEFT,
	LINK_MARKER_BOTTOM,
	LINK_MARKER_BOTTOM_RIGHT,
];

const form_keys = Object.create(null);
Object.assign(form_keys, {
	"cname": 1,
	"locale": 1,
	"desc": 1,
	"keyword": 1,
	"pack": 1,
	"type": 1,
	"stype": 1,
	"ttype": 1,
	"mtype": 2,
	"mtype_operator": 2,
	"exclude": 2,

	"mat": 3,
	"attr": 2,
	"race": 2,
	"lv1": 2,
	"lv2": 2,
	"scale": 2,
	"sc1": 2,
	"sc2": 2,
	"marker": 3,
	"marker_operator": 3,
	"atk1": 2,
	"atk2": 2,
	"atkm": 2,
	"def1": 2,
	"def2": 2,
	"defm": 2,
	"sum": 2,
	"page": 1,
});

/**
 * toHalfWidth()
 * @param {string} str
 * @returns
 */
function toHalfWidth(str) {
	return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
}

/**
 * toFullWidth()
 * @param {string} str
 * @returns 
 */
function toFullWidth(str) {
	return str.replace(/[A-Za-z0-9]/g, (s) => String.fromCharCode(s.charCodeAt(0) + 0xFEE0));
}

function is_locale(x) {
	switch (x) {
		case "en":
			return true;
		default:
			return false;
	}
}

function is_pack(x) {
	switch (x) {
		case "o":
			return true;
		case "t":
			return true;
		default:
			return re_pack.test(x) && !!(pack_list[x] || pre_release[x]);
	}
}

function check_checkbox(params, name, min = 1) {
	const node_list = document.getElementsByName(name);
	if (node_list.length === 0) {
		params.delete(name);
		return;
	}
	const values = params.getAll(name);
	params.delete(name);
	for (const value of values) {
		if (value.length === 0 || value.length > MAX_STRING_LEN)
			continue;
		if (!re_value.test(value) || params.has(name, value))
			continue;
		let x = Number.parseInt(value);
		if (x >= min && x <= min + node_list.length - 1)
			params.append(name, value);
	}
}

/**
 * @param {URLSearchParams} params 
 * @param {string} key 
 * @returns 
 */
function check_text(params, key) {
	const value = params.get(key);
	if (value === null)
		return "";
	if (value.length === 0 || value.length > MAX_TEXT_LEN || re_bad_escape.test(value)) {
		params.delete(key);
		return "";
	}
	else {
		params.set(key, value);
		return value;
	}
}

function check_normal_text(params, key) {
	let value = params.get(key);
	if (value === null)
		return false;
	if (value.length === 0 || value.length > MAX_TEXT_LEN || re_special.test(value)) {
		params.delete(key);
		return false;
	}
	else {
		params.set(key, value);
		return true;
	}
}

function check_entry(params, key) {
	const value = params.get(key);
	if (value === null)
		return false;
	if (value.length === 0 || value.length > MAX_STRING_LEN) {
		params.delete(key);
		return false;
	}
	return true;
}

function check_value(params, key, min, max) {
	if (!check_entry(params, key))
		return false;
	const value = params.get(key);
	if (!re_number.test(value)) {
		params.delete(key);
		return false;
	}
	const x = Number.parseInt(value);
	if (Number.isSafeInteger(x) && x >= min && x <= max) {
		params.set(key, value);
		return true
	}
	else {
		params.delete(key);
		return false;
	}
}

/**
 * validate common keys
 * @param {URLSearchParams} params 
 * @param {boolean} extra_monster
 */
function validate_params(params, extra_monster) {
	if (!extra_monster) {
		params.delete("mtype", "1");
		params.delete("mtype", "2");
		params.delete("mtype", "3");
		params.delete("mtype", "4");
		params.delete("exclude", "1");
		params.delete("exclude", "2");
		params.delete("exclude", "3");
		params.delete("exclude", "4");
		for (const [key, value] of Object.entries(form_keys)) {
			if (value == 3)
				params.delete(key);
		}
	}
	if (check_text(params, "keyword")) {
		params.delete("cname");
		params.delete("locale");
		params.delete("desc");
	}
	else if (check_text(params, "cname")) {
		switch (params.get("locale")) {
			case "en":
				params.set("locale", "en");
				break;
			default:
				params.delete("locale");
				break;
		}
		check_text(params, "desc");
	}
	else {
		params.delete("locale");
		check_text(params, "desc");
	}
	check_entry(params, "pack");
	const pack = params.get("pack");
	if (pack && is_pack(pack)) {
		params.set("pack", pack);
	}
	else {
		params.delete("pack");
	}
	switch (params.get("type")) {
		case "1":
			params.set("type", "1");
			params.delete("stype");
			params.delete("ttype");
			check_checkbox(params, "mtype");
			if (params.get("mtype_operator") === "1")
				params.set("mtype_operator", "1");
			else
				params.set("mtype_operator", "0");
			check_checkbox(params, "exclude");
			break;
		case "2":
			params.set("type", "2");
			params.delete("mtype");
			params.delete("mtype_operator");
			params.delete("exclude");
			params.delete("ttype");
			check_checkbox(params, "stype");
			break;
		case "3":
			params.set("type", "3");
			params.delete("mtype");
			params.delete("mtype_operator");
			params.delete("exclude");
			params.delete("stype");
			check_checkbox(params, "ttype");
			break;
		default:
			params.delete("type");
			params.delete("mtype");
			params.delete("mtype_operator");
			params.delete("exclude");
			params.delete("stype");
			params.delete("ttype");
			break;
	}
	if (params.get("type") === null || params.get("type") === "1") {
		check_normal_text(params, "mat");
		check_checkbox(params, "attr");
		check_checkbox(params, "race");
		check_value(params, "lv1", 1, 13);
		check_value(params, "lv2", 1, 13);
		check_checkbox(params, "scale", 0);
		if (params.has("scale")) {
			params.delete("sc1");
			params.delete("sc2");
		}
		else {
			check_value(params, "sc1", 0, 13);
			check_value(params, "sc2", 0, 13);
		}
		if (extra_monster) {
			check_checkbox(params, "marker");
			if (params.get("marker_operator") === "1")
				params.set("marker_operator", "1");
			else
				params.set("marker_operator", "0");
		}
		check_value(params, "atk1", -1, 100000);
		const atk1 = Number.parseInt(params.get("atk1"));
		if (atk1 < 0) {
			params.delete("atk2");
			params.delete("atkm");
			params.delete("sum");
		}
		else {
			check_value(params, "atk2", 0, 100000);
			check_value(params, "atkm", 0, 999);
		}
		check_value(params, "def1", -2, 100000);
		const def1 = Number.parseInt(params.get("def1"));
		if (def1 < 0) {
			params.delete("def2");
			params.delete("defm");
			params.delete("sum");
		}
		else {
			check_value(params, "def2", 0, 100000);
			check_value(params, "defm", 0, 999);
		}
		check_value(params, "sum", 0, 100000);
	}
	else {
		for (const [key, value] of Object.entries(form_keys)) {
			if (value >= 2)
				params.delete(key);
		}
	}
	check_value(params, "page", 1, 1000);
}

/**
 * Validate the input of query.
 * @param {URLSearchParams} params original params
 * @returns validated params
 */
function server_validate1(params) {
	const valid_params = new URLSearchParams();
	check_value(params, "id", 1, 102000000);
	const id = params.get("code");
	if (id) {
		valid_params.set("code", id);
	}
	else {
		validate_params(params, true);
		for (const key of Object.keys(form_keys)) {
			for (const value of params.getAll(key)) {
				valid_params.append(key, value);
			}
		}
	}
	return valid_params;
}

// string -> wildcard literal
function string_to_literal(str) {
	return re_wildcard.test(str) ? str : `%${str}%`;
}

/**
 * Generate the name condition of a statement.
 * @param {string} locale 
 * @param {string} name_string 
 * @param {Object} arg 
 * @returns name condition
 */
function process_name(locale, name_string, arg) {
	if (!name_string)
		return '';
	let name_cmd = '';
	switch (locale) {
		case 'en': {
			const en_list = [];
			const en_name = name_string.toLowerCase();
			for (const [cid, name] of Object.entries(name_table_en)) {
				if (name.toLowerCase().includes(en_name))
					en_list.push(cid_to_id[cid]);
				if (en_list.length > MAX_RESULT_LEN) {
					en_list.length = 0;
					break;
				}
			}
			name_cmd = '0';
			for (let i = 0; i < en_list.length; ++i)
				name_cmd += ` OR datas.id=${en_list[i]}`;
			break;
		}
		default: {
			name_cmd = '0';
			let is_setname = false;
			// zh, setcode
			if (!re_wildcard.test(name_string)) {
				const mapObj = Object.create(null);
				mapObj['$%'] = '%';
				mapObj['$_'] = '_';
				let zh_name = name_string.replace(/\$%|\$_/g, (x) => mapObj[x]).toLowerCase();
				for (const [keyword, value] of Object.entries(setname)) {
					if (keyword.toLowerCase() === zh_name) {
						const setcode = Number.parseInt(value);
						const setcode_str = ` OR ${setcode_condition(setcode, arg)}`;
						name_cmd += setcode_str;
						is_setname = true;
						break;
					}
				}
			}
			// zh, name
			name_cmd += ` OR name LIKE $name ESCAPE '$' OR desc LIKE $kanji ESCAPE '$'`;
			name_cmd += ` OR alias IN (${stmt_no_alias} AND name LIKE $name ESCAPE '$')`;
			arg.$name = string_to_literal(name_string);
			arg.$kanji = `%※${string_to_literal(name_string)}`;
			// ja, name
			if (!is_setname) {
				const jp_list = [];
				const jp_name = toHalfWidth(name_string);
				for (const [cid, name] of Object.entries(name_table_jp)) {
					if (toHalfWidth(name).includes(jp_name))
						jp_list.push(cid_to_id[cid]);
					if (jp_list.length > MAX_RESULT_LEN) {
						jp_list.length = 0;
						break;
					}
				}
				for (let i = 0; i < jp_list.length; ++i)
					name_cmd += ` OR datas.id=${jp_list[i]}`;
			}
			break;
		}
	}
	return name_cmd;
}

/**
 * Parse param into sqlite statement condition.
 * @param {URLSearchParams} params 
 * @param {Object} arg 
 * @returns sqlite statement condition
 */
function param_to_condition(params, arg) {
	let qstr = "";
	// id, primary key
	const id = Number.parseInt(params.get("code"), 10);
	if (id) {
		text_id.value = id;
		qstr += " AND datas.id == $id;";
		arg.$id = id;
		return qstr;
	}

	qstr += artwork_filter;
	// pack
	const pack = params.get("pack");
	if (pack === "o") {
		qstr += " AND datas.ot != $tcg";
		arg.$tcg = 2;
	}
	else if (pack === "t") {
		qstr += " AND datas.ot == $tcg";
		arg.$tcg = 2;
	}
	else if (pack_list[pack]) {
		qstr += pack_cmd(pack_list[pack]);
		arg.pack = pack;
	}
	else if (pre_release[pack]) {
		qstr += ` AND datas.id>=${pre_release[pack]} AND datas.id<=${pre_release[pack] + 998}`;
		arg.pack = pack;
	}
	select_ot.value = pack;

	// type
	arg.$ctype = 0;
	let subtype = 0;
	let exc = 0;
	switch (params.get("type")) {
		case "1": {
			qstr += " AND type & $ctype";
			arg.$ctype = TYPE_MONSTER;
			for (const val of params.getAll("mtype")) {
				const idx = Number.parseInt(val) - 1;
				subtype |= mtype_list[idx];
				if (cb_mtype[idx].type === "checkbox")
					cb_mtype[idx].checked = true;
			}
			let mtype_operator = 0;
			if (params.get("mtype_operator") === "1") {
				mtype_operator = 1;
				select_subtype_op.value = "1";
			}
			else {
				mtype_operator = 0;
				select_subtype_op.value = "0";
			}
			if (subtype) {
				if (mtype_operator)
					qstr += " AND type & $mtype == $mtype";
				else
					qstr += " AND type & $mtype";
				arg.$mtype = subtype;
			}
			for (const val of params.getAll("exclude")) {
				const idx = Number.parseInt(val) - 1;
				exc |= exclude_list[idx];
				if (cb_exclude[idx].type === "checkbox")
					cb_exclude[idx].checked = true;
			}
			if (exc) {
				qstr += " AND NOT type & $exclude";
				arg.$exclude = exc;
			}
			break;
		}
		case "2": {
			qstr += " AND type & $ctype";
			arg.$ctype = TYPE_SPELL;
			for (const val of params.getAll("stype")) {
				const idx = Number.parseInt(val) - 1;
				subtype |= stype_list[idx];
				if (cb_stype)
					cb_stype[idx].checked = true;
			}
			if (subtype) {
				if (subtype & TYPE_NORMAL) {
					if (subtype === TYPE_NORMAL) {
						qstr += " AND type == $ctype";
					}
					else {
						qstr += " AND (type == $ctype OR type & $stype)";
						arg.$stype = subtype & ~TYPE_NORMAL;
					}
				}
				else {
					qstr += " AND type & $stype";
					arg.$stype = subtype;
				}
			}
			break;
		}
		case "3": {
			qstr += " AND type & $ctype";
			arg.$ctype = TYPE_TRAP;
			for (const val of params.getAll("ttype")) {
				const idx = Number.parseInt(val) - 1;
				subtype |= ttype_list[idx];
				if (cb_ttype)
					cb_ttype[idx].checked = true;
			}
			if (subtype) {
				if (subtype & TYPE_NORMAL) {
					if (subtype === TYPE_NORMAL) {
						qstr += " AND type == $ctype";
					}
					else {
						qstr += " AND (type == $ctype OR type & $ttype)";
						arg.$ttype = subtype & ~TYPE_NORMAL;
					}
				}
				else {
					qstr += " AND type & $ttype";
					arg.$ttype = subtype;
				}
			}
			break;
		}
		default:
			break;
	}

	if (arg.$ctype === 0 || arg.$ctype === TYPE_MONSTER) {
		let is_monster = false;
		// mat
		const mat = params.get("mat");
		if (mat) {
			text_mat.value = mat;
			qstr += " AND (desc LIKE $mat1 ESCAPE '$' OR desc LIKE $mat2 ESCAPE '$' OR desc LIKE $mat3 ESCAPE '$')";
			arg.$mat1 = `%${mat}+%`;
			arg.$mat2 = `%+${mat}%`;
			arg.$mat3 = `%${mat}×%`;
			is_monster = true;
		}

		// atk
		if (params.has("atk1")) {
			const atk1 = Number.parseInt(params.get("atk1"));
			text_atk1.value = atk1;
			is_monster = true;
			if (atk1 === -1) {
				qstr += " AND atk == $unknown";
				arg.$unknown = -2;
			}
			else {
				qstr += " AND atk >= $atk1";
				arg.$atk1 = atk1;
			}
		}
		if (params.has("atk2")) {
			const atk2 = Number.parseInt(params.get("atk2"));
			text_atk2.value = atk2;
			is_monster = true;
			qstr += " AND atk >= $zero AND atk <= $atk2";
			arg.$zero = 0;
			arg.$atk2 = atk2;
		}
		if (params.has("atkm")) {
			const atk_mod = Number.parseInt(params.get("atkm"));
			qstr += " AND atk % 1000 == $atkm";
			arg.$atkm = atk_mod;
			is_monster = true;
		}

		// def, exclude link monsters
		if (params.has("def1") || params.has("def2") || params.has("defm") || params.has("sum")) {
			qstr += " AND NOT type & $link";
			arg.$link = TYPE_LINK;
			is_monster = true;
		}
		if (params.has("def1")) {
			const def1 = Number.parseInt(params.get("def1"));
			text_def1.value = def1;
			if (def1 === -1) {
				qstr += " AND def == $unknown";
				arg.$unknown = -2;
			}
			else if (def1 === -2) {
				qstr += " AND def == atk AND def >= $zero";
				arg.$zero = 0;
			}
			else {
				qstr += " AND def >= $def1";
				arg.$def1 = def1;
			}
		}
		if (params.has("def2")) {
			const def2 = Number.parseInt(params.get("def2"));
			text_def2.value = def2;
			qstr += " AND def >= $zero AND def <= $def2";
			arg.$zero = 0;
			arg.$def2 = def2;
		}
		if (params.has("defm")) {
			const def_mod = Number.parseInt(params.get("defm"));
			qstr += " AND def % 1000 == $defm";
			arg.$defm = def_mod;
		}
		if (params.has("sum")) {
			const sum = Number.parseInt(params.get("sum"));
			text_sum.value = sum;
			qstr += " AND atk != $unknown AND def != $unknown AND atk + def == $sum";
			arg.$unknown = -2;
			arg.$sum = sum;
		}

		// lv, rank, link
		if (params.has("lv1")) {
			const lv1 = Number.parseInt(params.get("lv1"));
			text_lv1.value = lv1;
			is_monster = true;
			qstr += " AND (level & $mask) >= $lv1";
			arg.$mask = 0xff;
			arg.$lv1 = lv1;
		}
		if (params.has("lv2")) {
			const lv2 = Number.parseInt(params.get("lv2"));
			text_lv2.value = lv2;
			is_monster = true;
			qstr += " AND (level & $mask) <= $lv2";
			arg.$mask = 0xff;
			arg.$lv2 = lv2;
		}

		// scale, pendulum monster only
		if (params.has("scale") || params.has("sc1") || params.has("sc2")) {
			qstr += " AND type & $pendulum";
			arg.$pendulum = TYPE_PENDULUM;
			is_monster = true;
		}
		if (params.has("scale")) {
			let scale_condtion = "0";
			let index = 0;
			for (const value of params.getAll("scale")) {
				const scale = Number.parseInt(value);
				cb_scale[scale].checked = true;
				scale_condtion += ` OR (level >> $offset & $mask) == $scale${index}`;
				arg[`$scale${index}`] = scale;
				++index;
			}
			qstr += ` AND (${scale_condtion})`;
			arg.$offset = 24;
			arg.$mask = 0xff;
		}
		if (params.has("sc1")) {
			qstr += " AND (level >> $offset & $mask) >= $scacle_from";
			arg.$offset = 24;
			arg.$mask = 0xff;
			arg.$scacle_from = Number.parseInt(params.get("sc1"));
		}
		if (params.has("sc2")) {
			qstr += " AND (level >> $offset & $mask) <= $scacle_to";
			arg.$offset = 24;
			arg.$mask = 0xff;
			arg.$scacle_to = Number.parseInt(params.get("sc1"));
		}

		// attr, race
		let attr = 0;
		for (const val of params.getAll("attr")) {
			const idx = Number.parseInt(val) - 1;
			attr |= attr_list[idx];
			cb_attr[idx].checked = true;
		}
		if (attr) {
			qstr += " AND attribute & $attr";
			arg.$attr = attr;
			is_monster = true;
		}

		let race = 0;
		for (const val of params.getAll("race")) {
			const idx = Number.parseInt(val) - 1;
			race |= race_list[idx];
			cb_race[idx].checked = true;
		}
		if (race) {
			qstr += " AND race & $race";
			arg.$race = race;
			is_monster = true;
		}
		// marker
		let marker = 0;
		let marker_operator = 0;
		for (const val of params.getAll("marker")) {
			const idx = Number.parseInt(val) - 1;
			marker |= marker_list[idx];
			cb_marker[idx].checked = true;
		}
		if (params.get("marker_operator") === "1") {
			marker_operator = 1;
			select_marker_op.value = "1";
		}
		else {
			marker_operator = 0;
			select_marker_op.value = "0";
		}
		if (marker) {
			qstr += " AND type & $link";
			arg.$link = TYPE_LINK;
			if (marker_operator)
				qstr += " AND def & $marker == $marker";
			else
				qstr += " AND def & $marker";
			arg.$marker = marker;
			is_monster = true;
		}
		if (arg.$ctype === 0 && is_monster) {
			qstr += " AND type & $ctype";
			arg.$ctype = TYPE_MONSTER;
		}
	}

	const desc_str = "desc LIKE $desc ESCAPE '$'";
	const locale = params.get("locale");
	if (locale)
		select_locale.value = locale;
	const keyword = params.get("keyword");
	let name_cmd = process_name(locale, keyword, arg);
	if (name_cmd) {
		// keyword
		text_keyword.value = keyword;
		qstr += ` AND (${name_cmd} OR ${desc_str})`;
		arg.$desc = string_to_literal(keyword);
	}
	else {
		// name
		const name = params.get("cname");
		name_cmd = process_name(locale, name, arg);
		if (name_cmd) {
			text_name.value = name;
			qstr += ` AND (${name_cmd})`;
		}
		// desc
		const desc = params.get("desc");
		if (desc) {
			text_effect.value = desc;
			qstr += ` AND ${desc_str}`;
			arg.$desc = string_to_literal(desc);
		}
	}
	return qstr;
}

// entrance of query
function server_analyze1(params) {
	const qstr0 = stmt_base;
	const arg = Object.create(null);
	const valid_params = server_validate1(params);
	const condition = param_to_condition(valid_params, arg);
	result.length = 0;
	if (condition) {
		const qstr_final = `${qstr0}${condition};`;
		current_stmt = qstr_final;
		query(qstr_final, arg, result);
	}
	if (result.length === 1)
		document.title = result[0].tw_name;
	show_result(valid_params);
}

function get_sw_str(x) {
	const sw_str1 = `race == $race_${x} AND attribute != $attr_${x} AND (level & 0xff) != $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	const sw_str2 = ` OR race != $race_${x} AND attribute == $attr_${x} AND (level & 0xff) != $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	const sw_str3 = ` OR race != $race_${x} AND attribute != $attr_${x} AND (level & 0xff) == $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	const sw_str4 = ` OR race != $race_${x} AND attribute != $attr_${x} AND (level & 0xff) != $lv_${x} AND atk == $atk_${x} AND def != $def_${x}`;
	const sw_str5 = ` OR race != $race_${x} AND attribute != $attr_${x} AND (level & 0xff) != $lv_${x} AND atk != $atk_${x} AND def == $def_${x}`;
	return `(${sw_str1}${sw_str2}${sw_str3}${sw_str4}${sw_str5})`;
}

function get_single_card(cdata) {
	if (!cdata)
		return [null, 0];

	const qstr0 = `${stmt_default} AND type & $monster AND NOT type & $ext`;
	const arg = Object.create(null);
	arg.$monster = TYPE_MONSTER;
	arg.$ext = TYPE_EXTRA;

	let qstr = "";
	const list_tmp = [];


	if (re_id.test(cdata)) {
		const id = Number.parseInt(cdata);
		qstr = `${qstr0} AND datas.id == $id;`;
		arg.$id = id;
		query(qstr, arg, list_tmp);
		if (list_tmp.length === 1)
			return [list_tmp[0], list_tmp.length];
	}

	qstr = `${qstr0} AND name == $exact;`;
	arg.$exact = cdata;
	query(qstr, arg, list_tmp);
	if (list_tmp.length === 1)
		return [list_tmp[0], list_tmp.length];

	const cid = Object.keys(name_table_jp).find(key => name_table_jp[key] ? toHalfWidth(name_table_jp[key]) === toHalfWidth(cdata) : false);
	if (cid) {
		const nid = cid_to_id[cid];
		qstr = `${qstr0} AND datas.id == $nid;`;
		arg.$nid = nid;
		query(qstr, arg, list_tmp);
		if (list_tmp.length === 1)
			return [list_tmp[0], list_tmp.length];
	}

	qstr = `${qstr0} AND name LIKE $fuzzy ESCAPE '$';`;
	arg.$fuzzy = string_to_literal(cdata);
	query(qstr, arg, list_tmp);
	if (list_tmp.length === 1)
		return [list_tmp[0], list_tmp.length];
	return [null, list_tmp.length];
}

/**
 * entrance of small world
 * @param {URLSearchParams} params 
 * @returns 
 */
function server_analyze2(params) {
	// id or name
	const cdata1 = check_text(params, "begin");
	if (cdata1)
		text_id1.value = cdata1;
	const cdata2 = check_text(params, "end");
	if (cdata2)
		text_id2.value = cdata2;

	const [card_begin, result_len1] = get_single_card(cdata1);
	if (result_len1 > 1) {
		const row0 = table_result.insertRow(-1);
		const cell0 = row0.insertCell(-1);
		table_result.style.border = "1px solid black";
		cell0.textContent = "起點數量太多。";
		return;
	}
	else if (result_len1 < 1) {
		const row0 = table_result.insertRow(-1);
		const cell0 = row0.insertCell(-1);
		table_result.style.border = "1px solid black";
		cell0.textContent = "找不到起點。";
		return;
	}

	const [card_end, result_len2] = get_single_card(cdata2);
	if (result_len2 > 1) {
		const row0 = table_result.insertRow(-1);
		const cell0 = row0.insertCell(-1);
		table_result.style.border = "1px solid black";
		cell0.textContent = "終點數量太多。";
		return;
	}
	else if (result_len2 < 1) {
		const row0 = table_result.insertRow(-1);
		const cell0 = row0.insertCell(-1);
		table_result.style.border = "1px solid black";
		cell0.textContent = "找不到終點。";
		return;
	}

	params.set("type", "1");
	validate_params(params, false);
	const valid_params = new URLSearchParams();
	valid_params.set("begin", card_begin.id);
	valid_params.set("end", card_end.id);
	for (const key of Object.keys(form_keys)) {
		for (const value of params.getAll(key)) {
			valid_params.append(key, value);
		}
	}
	const qstr0 = `${stmt_default} AND NOT type & $ext`;
	const arg = Object.create(null);
	arg.$ext = TYPE_EXTRA;
	const condition = param_to_condition(valid_params, arg);
	const qstr_final = `${qstr0} AND ${get_sw_str("begin")} AND ${get_sw_str("end")}${condition};`;
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
	current_stmt = qstr_final;
	query(qstr_final, arg, result);
	show_result(valid_params);
}
