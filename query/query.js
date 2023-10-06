"use strict";
// max of int32: 10 digit
const MAX_DIGIT = 10;

const LOCALE_LIMIT = 2;
const PACK_LIMIT = 5;
const NAME_LIMIT = 100;
const DESC_LIMIT = 500;

const result = [];

//re_wildcard = /(?<!\$)[%_]/ (lookbehind)
const re_wildcard = /(^|[^\$])[%_]/;
const re_bad_escape = /\$(?![%_])/g;
const re_all_digit = /^\d+$/;
const re_id = /^\d{1,9}$/;
const re_value = /^\d{1,2}$/;
const re_atkfr = /^-?\d{1,6}$/;
const re_atkto = /^\d{1,6}$/;
const re_mod = /^\d{1,3}$/;
const re_page = /^\d{1,3}$/;

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

const cid_to_id = inverse_mapping(cid_table);

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

function inverse_mapping(table) {
	const inverse = Object.create(null);
	for (const [key, value] of Object.entries(table)) {
		if (inverse[value]) {
			return null;
		}
		inverse[value] = key;
	}
	return inverse;
}

function is_locale(x) {
	switch (x) {
		case "en":
			return true;
		default:
			return false;
	}
}

function is_atkfr(x) {
	return re_atkfr.test(x) && Number.parseInt(x) >= -1;
}

function is_atkto(x) {
	return re_atkto.test(x);
}

function is_deffr(x) {
	return re_atkfr.test(x) && Number.parseInt(x) >= -2;
}

function is_defto(x) {
	return re_atkto.test(x);
}

function is_range_mode(fr) {
	return fr === null || fr >= 0;
}

function is_page(x) {
	return x !== null && x >= 1 && x <= 1000;
}

function is_normal_atk(x) {
	return x !== null && x >= 0;
}

function is_modulus(x) {
	return x !== null && x >= 0 && x <= 999;
}

function is_lv(x) {
	return x !== null && x >= 1 && x <= 13;
}

function is_scale(x) {
	return x !== null && x >= 0 && x <= 13;
}

function is_pack(x) {
	switch (x) {
		case "o":
			return true;
		case "t":
			return true;
		default:
			return /^_?\w{4}$/.test(x) && !!(pack_list[x] || pre_release[x]);
	}
}

function is_valid(x, type) {
	let len = 0;
	switch (type) {
		case "mtype":
			len = mtype_list.length;
			break;
		case "exclude":
			len = exclude_list.length;
			break;
		case "stype":
			len = stype_list.length;
			break;
		case "ttype":
			len = ttype_list.length;
			break;
		case "attr":
			len = attr_list.length;
			break;
		case "race":
			len = race_list.length;
			break;
		case "marker":
			len = marker_list.length;
			break;
		default:
			break;
	}
	return re_value.test(x) && Number.parseInt(x) <= len;
}

function check_str(val, limit) {
	if (typeof val !== "string" || val.length > limit)
		return "";
	else
		return val;
}

/**
 * server_validate1() - Validate the input of query.
 * @param {URLSearchParams} params original params
 * @returns validated params
 */
function server_validate1(params) {
	let valid_params = new URLSearchParams();
	// id, primary key
	if (re_id.test(params.get("cid"))) {
		valid_params.set("cid", params.get("cid"));
	}
	else {
		let keyword = check_str(params.get("keyword"), DESC_LIMIT).replace(re_bad_escape, "");
		let cname = check_str(params.get("cname"), NAME_LIMIT).replace(re_bad_escape, "");
		let locale = check_str(params.get("locale"), LOCALE_LIMIT);
		let desc = check_str(params.get("desc"), DESC_LIMIT).replace(re_bad_escape, "");
		if (keyword) {
			valid_params.set("keyword", keyword);
		}
		else {
			if (cname)
				valid_params.set("cname", cname);
			if (is_locale(locale))
				valid_params.set("locale", locale);
			if (desc)
				valid_params.set("desc", desc);
		}
		let pack = check_str(params.get("pack"), PACK_LIMIT);
		if (is_pack(pack))
			valid_params.set("pack", pack);

		let monster_type = false;
		switch (params.get("type")) {
			case "1":
				valid_params.set("type", "1");
				for (const val of params.getAll("mtype")) {
					if (is_valid(val, "mtype"))
						valid_params.append("mtype", val);
				}
				if (params.get("mtype_operator") === "1")
					valid_params.set("mtype_operator", "1");
				else
					valid_params.set("mtype_operator", "0");
				for (const val of params.getAll("exclude")) {
					if (is_valid(val, "exclude"))
						valid_params.append("exclude", val);
				}
				monster_type = true;
				break;
			case "2":
				valid_params.set("type", "2");
				for (const val of params.getAll("stype")) {
					if (is_valid(val, "stype"))
						valid_params.append("stype", val);
				}
				break;
			case "3":
				valid_params.set("type", "3");
				for (const val of params.getAll("ttype")) {
					if (is_valid(val, "ttype"))
						valid_params.append("ttype", val);
				}
				break;
			default:
				monster_type = true;
				break;
		}

		if (monster_type) {
			let mat = check_str(params.get("mat"), NAME_LIMIT).replace(/(^|[^\$])[%_]/g, "");
			if (mat)
				valid_params.set("mat", mat);
			// attr
			for (const val of params.getAll("attr")) {
				if (is_valid(val, "attr"))
					valid_params.append("attr", val);
			}
			// race
			for (const val of params.getAll("race")) {
				if (is_valid(val, "race"))
					valid_params.append("race", val);
			}
			// lv
			// scale
			let lv1 = params.get("lv1");
			let lv2 = params.get("lv2");
			if (re_value.test(lv1))
				valid_params.set("lv1", lv1);
			if (re_value.test(lv2))
				valid_params.set("lv2", lv2);
			let sc1 = params.get("sc1");
			let sc2 = params.get("sc2");
			if (re_value.test(sc1))
				valid_params.set("sc1", sc1);
			if (re_value.test(sc2))
				valid_params.set("sc2", sc2);

			for (const val of params.getAll("marker")) {
				if (is_valid(val, "marker"))
					valid_params.append("marker", val);
			}
			if (params.get("marker_operator") === "1")
				valid_params.set("marker_operator", "1");
			else
				valid_params.set("marker_operator", "0");

			let atk1 = params.get("atk1");
			let atk2 = params.get("atk2");
			let atkm = params.get("atkm");
			if (atk1 && is_atkfr(atk1))
				valid_params.set("atk1", atk1);
			if (atk2 && is_atkto(atk2))
				valid_params.set("atk2", atk2);
			if (atkm && re_mod.test(atkm))
				valid_params.set("atkm", atkm);
			let def1 = params.get("def1");
			let def2 = params.get("def2");
			let defm = params.get("defm");
			if (def1 && is_deffr(def1))
				valid_params.set("def1", def1);
			if (def2 && is_defto(def2))
				valid_params.set("def2", def2);
			if (defm && re_mod.test(defm))
				valid_params.set("defm", defm);
			let sum = params.get("sum");
			if (sum && is_atkto(sum))
				valid_params.set("sum", sum);
		}
	}
	// page
	let page = params.get("page");
	if (re_page.test(page))
		valid_params.set("page", page);
	return valid_params;
}

function server_validate2(params) {
	let valid_params = new URLSearchParams();
	valid_params.set("begin", params.get("begin"));
	valid_params.set("end", params.get("end"));

	let keyword = check_str(params.get("keyword"), DESC_LIMIT).replace(re_bad_escape, "");
	let cname = check_str(params.get("cname"), NAME_LIMIT).replace(re_bad_escape, "");
	let locale = check_str(params.get("locale"), LOCALE_LIMIT);
	let desc = check_str(params.get("desc"), DESC_LIMIT).replace(re_bad_escape, "");
	if (keyword) {
		valid_params.set("keyword", keyword);
	}
	else {
		if (cname)
			valid_params.set("cname", cname);
		if (is_locale(locale))
			valid_params.set("locale", locale);
		if (desc)
			valid_params.set("desc", desc);
	}
	let pack = check_str(params.get("pack"), PACK_LIMIT);
	if (is_pack(pack))
		valid_params.set("pack", pack);

	valid_params.set("type", "1");
	for (const val of params.getAll("mtype")) {
		if (is_valid(val, "mtype"))
			valid_params.append("mtype", val);
	}
	if (params.get("mtype_operator") === "1")
		valid_params.set("mtype_operator", "1");
	else
		valid_params.set("mtype_operator", "0");
	for (const val of params.getAll("exclude")) {
		if (is_valid(val, "exclude"))
			valid_params.append("exclude", val);
	}

	// attr
	for (const val of params.getAll("attr")) {
		if (is_valid(val, "attr"))
			valid_params.append("attr", val);
	}
	// race
	for (const val of params.getAll("race")) {
		if (is_valid(val, "race"))
			valid_params.append("race", val);
	}
	// lv
	// scale
	let lv1 = params.get("lv1");
	let lv2 = params.get("lv2");
	if (lv1 && re_value.test(lv1))
		valid_params.set("lv1", lv1);
	if (lv2 && re_value.test(lv2))
		valid_params.set("lv2", lv2);
	let sc1 = params.get("sc1");
	let sc2 = params.get("sc2");
	if (sc1 && re_value.test(sc1))
		valid_params.set("sc1", sc1);
	if (sc2 && re_value.test(sc2))
		valid_params.set("sc2", sc2);

	let atk1 = params.get("atk1");
	let atk2 = params.get("atk2");
	if (atk1 && is_atkfr(atk1))
		valid_params.set("atk1", atk1);
	if (atk2 && is_atkto(atk2))
		valid_params.set("atk2", atk2);
	let def1 = params.get("def1");
	let def2 = params.get("def2");
	if (def1 && is_deffr(def1))
		valid_params.set("def1", def1);
	if (def2 && is_defto(def2))
		valid_params.set("def2", def2);
	let sum = params.get("sum");
	if (sum && is_atkto(sum))
		valid_params.set("sum", sum);
	// page
	let page = params.get("page");
	if (re_page.test(page))
		valid_params.set("page", page);
	return valid_params;
}

// legal string -> sqlite literal
function string_to_literal(str) {
	return re_wildcard.test(str) ? str : `%${str}%`;
}

// en: table, ja: table, zh: query
/**
 * process_name() - Generate the name condition of a statement.
 * @param {string} locale 
 * @param {string} name_string 
 * @param {Object} arg 
 * @returns name condition
 */
function process_name(locale, name_string, arg) {
	if (!name_string)
		return '';
	const setcode_str = ` OR ${setcode_condition('$setcode')}`;
	let name_cmd = '';
	switch (locale) {
		case 'en':
			let en_list = [];
			let en_name = name_string.toLowerCase();
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
		default:
			name_cmd = '0';
			let is_setname = false;
			// zh, setcode
			if (!re_wildcard.test(name_string)) {
				const mapObj = Object.create(null);
				mapObj['$%'] = '%';
				mapObj['$_'] = '_';
				let zh_name = name_string.replace(/\$%|\$_/g, (x) => mapObj[x]).toLowerCase();
				for (const [key, value] of Object.entries(setname)) {
					if (key.toLowerCase() === zh_name) {
						name_cmd += setcode_str;
						arg.$setcode = value;
						is_setname = true;
						break;
					}
				}
			}
			// zh, name
			name_cmd += ` OR name LIKE $name ESCAPE '$' OR desc LIKE $kanji ESCAPE '$'`;
			name_cmd += ` OR alias IN (SELECT datas.id FROM datas, texts WHERE datas.id == texts.id AND alias == 0 AND NOT type & $token AND name LIKE $name ESCAPE '$')`;
			arg.$name = string_to_literal(name_string);
			arg.$kanji = `%※${string_to_literal(name_string)}`;
			// ja, name
			if (!is_setname) {
				let jp_list = [];
				let jp_name = toHalfWidth(name_string.toLowerCase());
				for (const [cid, name] of Object.entries(name_table)) {
					if (toHalfWidth(name.toLowerCase()).includes(jp_name))
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
	return name_cmd;
}

/**
 * param_to_condition() - Parse param into sqlite statement condition.
 * @param {URLSearchParams} params 
 * @param {Object} arg 
 * @returns sqlite statement condition
 */
function param_to_condition(params, arg) {
	let qstr = "";
	// id, primary key
	let id = Number.parseInt(params.get("cid"), 10);
	if (id) {
		text_id.value = id;
		qstr += " AND datas.id == $id;";
		arg.$id = id;
		return qstr;
	}

	qstr += artwork_filter;
	// pack
	let pack = params.get("pack");
	if (pack === "o") {
		qstr += " AND datas.ot != 2";
	}
	else if (pack === "t") {
		qstr += " AND datas.ot == 2";
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
		case "1":
			qstr += " AND type & $ctype";
			arg.$ctype = TYPE_MONSTER;
			for (const val of params.getAll("mtype")) {
				let idx = Number.parseInt(val) - 1;
				subtype |= mtype_list[idx];
				if (cb_mtype[idx].type === "checkbox")
					cb_mtype[idx].checked = true;
			}
			if (subtype) {
				let mtype_operator = params.get("mtype_operator");
				if (params.get("mtype_operator") === "1") {
					select_subtype_op.value = "1";
					qstr += " AND type & $mtype == $mtype";
				}
				else {
					select_subtype_op.value = "0";
					qstr += " AND type & $mtype";
				}
				arg.$mtype = subtype;
			}
			for (const val of params.getAll("exclude")) {
				let idx = Number.parseInt(val) - 1;
				exc |= exclude_list[idx];
				if (cb_exclude[idx].type === "checkbox")
					cb_exclude[idx].checked = true;
			}
			if (exc) {
				qstr += " AND NOT type & $exclude";
				arg.$exclude = exc;
			}
			break;
		case "2":
			qstr += " AND type & $ctype";
			arg.$ctype = TYPE_SPELL;
			for (const val of params.getAll("stype")) {
				let idx = Number.parseInt(val) - 1;
				subtype |= stype_list[idx];
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
		case "3":
			qstr += " AND type & $ctype";
			arg.$ctype = TYPE_TRAP;
			for (const val of params.getAll("ttype")) {
				let idx = Number.parseInt(val) - 1;
				subtype |= ttype_list[idx];
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
		default:
			break;
	}

	if (arg.$ctype === 0 || arg.$ctype === TYPE_MONSTER) {
		let is_monster = false;
		// mat
		let mat = params.get("mat");
		if (mat) {
			text_mat.value = mat;
			qstr += " AND (desc LIKE $mat1 ESCAPE '$' OR desc LIKE $mat2 ESCAPE '$' OR desc LIKE $mat3 ESCAPE '$')";
			arg.$mat1 = `%${mat}+%`;
			arg.$mat2 = `%+${mat}%`;
			arg.$mat3 = `%${mat}×%`;
			is_monster = true;
		}

		// atk
		let atk1 = null;
		if (params.has("atk1")) {
			atk1 = Number.parseInt(params.get("atk1"));
			text_atk1.value = atk1;
			is_monster = true;
			if (atk1 === -1) {
				qstr += " AND atk == -2";
			}
			else {
				qstr += " AND atk >= $atk1";
				arg.$atk1 = atk1;
			}
		}
		if (is_range_mode(atk1)) {
			if (params.has("atk2")) {
				let atk2 = Number.parseInt(params.get("atk2"));
				text_atk2.value = atk2;
				is_monster = true;
				if (atk1 === null) {
					qstr += " AND atk >= 0 AND atk <= $atk2";
					arg.$atk2 = atk2;
				}
				else {
					qstr += " AND atk <= $atk2";
					arg.$atk2 = atk2;
				}
			}
			if (params.has("atkm")) {
				let atk_mod = Number.parseInt(params.get("atkm"));
				qstr += " AND atk % 1000 == $atkm";
				arg.$atkm = atk_mod;
				is_monster = true;
			}
		}

		// def, exclude link monsters
		if (params.has("def1") || params.has("def2") || params.has("defm") || params.has("sum")) {
			qstr += " AND NOT type & $link";
			is_monster = true;
		}

		let def1 = null;
		if (params.has("def1")) {
			def1 = Number.parseInt(params.get("def1"));
			text_def1.value = def1;
			if (def1 === -1) {
				qstr += " AND def == -2";
			}
			else if (def1 === -2) {
				qstr += " AND def == atk AND def >= 0";
			}
			else {
				qstr += " AND def >= $def1";
				arg.$def1 = def1;
			}
		}
		if (is_range_mode(def1)) {
			if (params.has("def2")) {
				let def2 = Number.parseInt(params.get("def2"));
				text_def2.value = def2;
				if (def1 === null) {
					qstr += " AND def >= 0 AND def <= $def2";
					arg.$def2 = def2;
				}
				else {
					qstr += " AND def <= $def2";
					arg.$def2 = def2;
				}
			}
			if (params.has("defm")) {
				let def_mod = Number.parseInt(params.get("defm"));
				qstr += " AND def % 1000 == $defm";
				arg.$defm = def_mod;
			}
			if (params.has("sum")) {
				let sum = Number.parseInt(params.get("sum"));
				text_sum.value = sum;
				qstr += " AND atk != -2 AND def != -2 AND atk + def == $sum";
				arg.$sum = sum;
			}
		}

		// lv, rank, link
		if (params.has("lv1")) {
			let lv1 = Number.parseInt(params.get("lv1"));
			text_lv1.value = lv1;
			is_monster = true;
			qstr += " AND (level & 0xff) >= $lv1";
			arg.$lv1 = lv1;
		}
		if (params.has("lv2")) {
			let lv2 = Number.parseInt(params.get("lv2"));
			text_lv2.value = lv2;
			is_monster = true;
			qstr += " AND (level & 0xff) <= $lv2";
			arg.$lv2 = lv2;
		}

		// scale, pendulum monster only
		if (params.has("sc1") || params.has("sc2")) {
			qstr += " AND type & $pendulum";
			is_monster = true;
		}
		if (params.has("sc1")) {
			let sc1 = Number.parseInt(params.get("sc1"));
			text_sc1.value = sc1;
			qstr += " AND (level >> 24 & 0xff) >= $sc1";
			arg.$sc1 = sc1;
		}
		if (params.has("sc2")) {
			let sc2 = Number.parseInt(params.get("sc2"));
			text_sc2.value = sc2;
			qstr += " AND (level >> 24 & 0xff) <= $sc2";
			arg.$sc2 = sc2;
		}

		// attr, race
		let attr = 0;
		for (const val of params.getAll("attr")) {
			let idx = Number.parseInt(val) - 1;
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
			let idx = Number.parseInt(val) - 1;
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
		for (const val of params.getAll("marker")) {
			let idx = Number.parseInt(val) - 1;
			marker |= marker_list[idx];
			cb_marker[idx].checked = true;
		}
		if (marker) {
			qstr += " AND type & $link";
			if (params.get("marker_operator") === "1") {
				select_marker_op.value = "1";
				qstr += " AND def & $marker == $marker";
			}
			else {
				select_marker_op.value = "0";
				qstr += " AND def & $marker";
			}
			arg.$marker = marker;
			is_monster = true;
		}
		if (arg.$ctype === 0 && is_monster)
			qstr += " AND type & $monster";
	}

	const desc_str = "desc LIKE $desc ESCAPE '$'";
	let locale = params.get("locale");
	switch (locale) {
		case "en":
			select_locale.value = locale;
			break;
		default:
			locale = "";
			select_locale.value = "";
			break;
	}
	let keyword = params.get("keyword");
	let name_cmd = process_name(locale, keyword, arg);
	if (name_cmd) {
		// keyword
		text_keyword.value = keyword;
		qstr += ` AND (${name_cmd} OR ${desc_str})`;
		arg.$desc = string_to_literal(keyword);
	}
	else {
		// name
		let name = params.get("cname");
		name_cmd = process_name(locale, name, arg);
		if (name_cmd) {
			text_name.value = name;
			qstr += ` AND (${name_cmd})`;
		}
		// desc
		let desc = params.get("desc");
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
	let qstr0 = stmt_default;
	let arg = new Object();
	arg.$monster = TYPE_MONSTER;
	arg.$link = TYPE_LINK;
	arg.$pendulum = TYPE_PENDULUM;
	arg.$token = TYPE_TOKEN;

	let valid_params = server_validate1(params);
	let condition = param_to_condition(valid_params, arg);
	//qstr0 += " AND (type & $token OR abs(datas.id - alias) >= 10) AND (NOT type & $token OR alias == 0)";

	result.length = 0;
	if (condition) {
		let qstr_final = `${qstr0}${condition};`;
		query(qstr_final, arg, result);
	}
	if (result.length === 1)
		document.title = result[0].name;
	show_result(valid_params);
}

function get_sw_str(x) {
	let sw_str1 = `race == $race_${x} AND attribute != $attr_${x} AND (level & 0xff) != $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	let sw_str2 = ` OR race != $race_${x} AND attribute == $attr_${x} AND (level & 0xff) != $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	let sw_str3 = ` OR race != $race_${x} AND attribute != $attr_${x} AND (level & 0xff) == $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	let sw_str4 = ` OR race != $race_${x} AND attribute != $attr_${x} AND (level & 0xff) != $lv_${x} AND atk == $atk_${x} AND def != $def_${x}`;
	let sw_str5 = ` OR race != $race_${x} AND attribute != $attr_${x} AND (level & 0xff) != $lv_${x} AND atk != $atk_${x} AND def == $def_${x}`;
	return `(${sw_str1}${sw_str2}${sw_str3}${sw_str4}${sw_str5})`;
}

function get_single_card(cdata) {
	if (!cdata)
		return [null, 0];

	let qstr0 = "SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts";
	qstr0 += " WHERE datas.id == texts.id AND abs(datas.id - alias) >= 10 AND type & $monster AND NOT type & ($token | $ext)";
	let arg = new Object();
	arg.$monster = TYPE_MONSTER;
	arg.$link = TYPE_LINK;
	arg.$pendulum = TYPE_PENDULUM;
	arg.$token = TYPE_TOKEN;
	arg.$ext = TYPE_EXT;

	let qstr = "";
	let list_tmp = [];


	if (re_id.test(cdata)) {
		let id = Number.parseInt(cdata);
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

	let cid = Object.keys(name_table).find(key => name_table[key] ? toHalfWidth(name_table[key]) === toHalfWidth(cdata) : false);
	if (cid) {
		let nid = cid_to_id[cid];
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

// entrance of small world
function server_analyze2(params) {
	// id or name
	let cdata1 = check_str(params.get("begin"), NAME_LIMIT);
	text_id1.value = cdata1;
	let ret1 = get_single_card(cdata1);
	let card_begin = ret1[0];
	let result_len1 = ret1[1];

	let cdata2 = check_str(params.get("end"), NAME_LIMIT);
	text_id2.value = cdata2;
	let ret2 = get_single_card(cdata2);
	let card_end = ret2[0];
	let result_len2 = ret2[1];

	if (result_len1 > 1) {
		let row0 = table_result.insertRow(-1);
		let cell0 = row0.insertCell(-1);
		table_result.style.border = "1px solid black";
		cell0.textContent = "起點數量太多。";
		return;
	}
	else if (result_len1 < 1) {
		let row0 = table_result.insertRow(-1);
		let cell0 = row0.insertCell(-1);
		table_result.style.border = "1px solid black";
		cell0.textContent = "找不到起點。";
		return;
	}

	if (result_len2 > 1) {
		let row0 = table_result.insertRow(-1);
		let cell0 = row0.insertCell(-1);
		table_result.style.border = "1px solid black";
		cell0.textContent = "終點數量太多。";
		return;
	}
	else if (result_len2 < 1) {
		let row0 = table_result.insertRow(-1);
		let cell0 = row0.insertCell(-1);
		table_result.style.border = "1px solid black";
		cell0.textContent = "找不到終點。";
		return;
	}

	let qstr0 = "SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts";
	qstr0 += " WHERE datas.id == texts.id AND abs(datas.id - alias) >= 10 AND NOT type & ($token | $ext)";
	let arg = new Object();
	arg.$monster = TYPE_MONSTER;
	arg.$link = TYPE_LINK;
	arg.$pendulum = TYPE_PENDULUM;
	arg.$token = TYPE_TOKEN;
	arg.$ext = TYPE_EXT;

	params.set("begin", card_begin.id);
	params.set("end", card_end.id);
	let valid_params = server_validate2(params);
	let condition = param_to_condition(valid_params, arg);
	let qstr_final = `${qstr0} AND ${get_sw_str("begin")} AND ${get_sw_str("end")}${condition};`;
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
	query(qstr_final, arg, result);
	show_result(valid_params);
}
