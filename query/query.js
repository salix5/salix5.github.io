"use strict";
const MAX_TEXT_LEN = 200;
const MAX_RESULT_LEN = 500;

let current_stmt = "";
let current_arg = null;

const re_wildcard = /(?<!\$)[%_]/;
const re_special = /[$%_]/;

const re_id = /^\d{1,9}$/;
const re_value = /^\d{1,2}$/;
const re_pack = /^_?\w{4}$/;
const re_number = /^-?\d{1,10}$/;

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
	...mtype_list,
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

/**
 * Convert a string to a LIKE pattern.
 * @param {string} str 
 * @returns {string}
 */
function like_pattern(str) {
	if (!str)
		return '';
	if (re_wildcard.test(str))
		return str;
	return `%${str.replace(/\$(?![%_])/g, '$$$&')}%`;
}

/**
 * Parse param into sqlite statement condition.
 * @param {URLSearchParams} params 
 * @returns {[string, Object]}sqlite statement condition
 */
function param_to_condition(params) {
	let qstr = "";
	const arg = { ...arg_default };
	// id, primary key
	const id = Number.parseInt(params.get("code"), 10);
	if (id) {
		document.getElementById("text_id").value = id;
		qstr += " AND datas.id == $id";
		arg.$id = id;
		return [qstr, arg];
	}

	qstr += no_alt_filter;
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
		qstr +=` AND ${list_condition("id", "pack", pack_list[pack], arg)}`;
		arg.pack = pack;
	}
	else if (pre_release[pack]) {
		qstr += " AND datas.id>=$begin AND datas.id<=$end";
		arg.$begin = pre_release[pack];
		arg.$end = pre_release[pack] + 998;
		arg.pack = pack;
	}
	document.getElementById("select_pack").value = pack;

	// type
	arg.$ctype = 0;
	let subtype = 0;
	let exc = 0;
	switch (params.get("ctype")) {
		case "1": {
			arg.$ctype = TYPE_MONSTER;
			for (const val of params.getAll("mtype")) {
				const idx = Number.parseInt(val) - 1;
				subtype |= mtype_list[idx];
				if (document.getElementsByName("mtype")[idx].type === "checkbox")
					document.getElementsByName("mtype")[idx].checked = true;
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
				if (document.getElementsByName("exclude")[idx].type === "checkbox")
					document.getElementsByName("exclude")[idx].checked = true;
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
				if (document.getElementsByName("stype").length)
					document.getElementsByName("stype")[idx].checked = true;
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
				if (document.getElementsByName("ttype").length)
					document.getElementsByName("ttype")[idx].checked = true;
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
		// material
		if (params.has("material")) {
			const material = params.get("material").replace(/[%_$]/g, '$$$&');
			qstr += ` AND ("desc" LIKE $mat1 ESCAPE '$' OR "desc" LIKE $mat2 ESCAPE '$' OR "desc" LIKE $mat3 ESCAPE '$')`;
			arg.$mat1 = `「${material}」%+%`;
			arg.$mat2 = `%+「${material}」%`;
			arg.$mat3 = `%「${material}」×%`;
			arg.$ctype = TYPE_MONSTER;
			document.getElementById("text_mat").value = params.get("material");
		}

		// atk
		if (params.has("atk_from")) {
			const atk_from = Number.parseInt(params.get("atk_from"));
			arg.$ctype = TYPE_MONSTER;
			if (atk_from === -1) {
				qstr += " AND atk == $unknown";
				arg.$unknown = -2;
			}
			else {
				qstr += " AND atk >= $atk_from";
				arg.$atk_from = atk_from;
			}
			document.getElementById("text_atk1").value = atk_from;
		}
		if (params.has("atk_to")) {
			const atk_to = Number.parseInt(params.get("atk_to"));
			arg.$ctype = TYPE_MONSTER;
			qstr += " AND atk >= $zero AND atk <= $atk_to";
			arg.$zero = 0;
			arg.$atk_to = atk_to;
			document.getElementById("text_atk2").value = atk_to;
		}
		if (params.has("atkm")) {
			const atk_mod = Number.parseInt(params.get("atkm"));
			qstr += " AND atk % 1000 == $atkm";
			arg.$atkm = atk_mod;
			arg.$ctype = TYPE_MONSTER;
		}

		// def, exclude link monsters
		if (params.has("def_from") || params.has("def_to") || params.has("defm") || params.has("sum")) {
			qstr += " AND NOT type & $link";
			arg.$link = TYPE_LINK;
			arg.$ctype = TYPE_MONSTER;
		}
		if (params.has("def_from")) {
			const def_from = Number.parseInt(params.get("def_from"));
			if (def_from === -1) {
				qstr += " AND def == $unknown";
				arg.$unknown = -2;
			}
			else if (def_from === -2) {
				qstr += " AND def == atk AND def >= $zero";
				arg.$zero = 0;
			}
			else {
				qstr += " AND def >= $def_from";
				arg.$def_from = def_from;
			}
			document.getElementById("text_def1").value = def_from;
		}
		if (params.has("def_to")) {
			const def_to = Number.parseInt(params.get("def_to"));
			qstr += " AND def >= $zero AND def <= $def_to";
			arg.$zero = 0;
			arg.$def_to = def_to;
			document.getElementById("text_def2").value = def_to;
		}
		if (params.has("defm")) {
			const def_mod = Number.parseInt(params.get("defm"));
			qstr += " AND def % 1000 == $defm";
			arg.$defm = def_mod;
		}
		if (params.has("sum")) {
			const sum = Number.parseInt(params.get("sum"));
			qstr += " AND atk >= $zero AND def >= $zero AND atk + def == $sum";
			arg.$zero = 0;
			arg.$sum = sum;
			document.getElementById("text_sum").value = sum;
		}

		// lv, rank, link
		if (params.has("level") || params.has("level_from") || params.has("level_to")) {
			arg.$ctype = TYPE_MONSTER;
		}
		if (params.has("level")) {
			let level_condtion = "0";
			let index = 0;
			for (const value of params.getAll("level")) {
				const level = Number.parseInt(value);
				level_condtion += ` OR (level & $mask) == $level${index}`;
				arg[`$level${index}`] = level;
				index++;
				cb_level[level].checked = true;
			}
			qstr += ` AND (${level_condtion})`;
			arg.$mask = 0xff;
		}
		if (params.has("level_from")) {
			qstr += " AND (level & $mask) >= $level_from";
			arg.$mask = 0xff;
			arg.$level_from = Number.parseInt(params.get("level_from"));
		}
		if (params.has("level_to")) {
			qstr += " AND (level & $mask) <= $level_to";
			arg.$mask = 0xff;
			arg.$level_to = Number.parseInt(params.get("level_to"));
		}

		// scale, pendulum monster only
		if (params.has("scale") || params.has("scale_from") || params.has("scale_to")) {
			qstr += " AND type & $pendulum";
			arg.$pendulum = TYPE_PENDULUM;
			arg.$ctype = TYPE_MONSTER;
		}
		if (params.has("scale")) {
			let scale_condtion = "0";
			let index = 0;
			for (const value of params.getAll("scale")) {
				const scale = Number.parseInt(value);
				scale_condtion += ` OR (level >> $offset & $mask) == $scale${index}`;
				arg[`$scale${index}`] = scale;
				index++;
				cb_scale[scale].checked = true;
			}
			qstr += ` AND (${scale_condtion})`;
			arg.$offset = 24;
			arg.$mask = 0xff;
		}
		if (params.has("scale_from")) {
			qstr += " AND (level >> $offset & $mask) >= $scale_from";
			arg.$offset = 24;
			arg.$mask = 0xff;
			arg.$scale_from = Number.parseInt(params.get("scale_from"));
		}
		if (params.has("scale_to")) {
			qstr += " AND (level >> $offset & $mask) <= $scale_to";
			arg.$offset = 24;
			arg.$mask = 0xff;
			arg.$scale_to = Number.parseInt(params.get("scale_to"));
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
			arg.$ctype = TYPE_MONSTER;
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
			arg.$ctype = TYPE_MONSTER;
		}
		// marker
		let marker = 0;
		let marker_operator = 0;
		for (const val of params.getAll("marker")) {
			const idx = Number.parseInt(val) - 1;
			marker |= marker_list[idx];
			if (cb_marker)
				cb_marker[idx].checked = true;
		}
		if (params.get("marker_operator") === "1") {
			marker_operator = 1;
			if (document.getElementById("select_marker_op"))
				document.getElementById("select_marker_op").value = "1";
		}
		if (marker) {
			qstr += " AND type & $link";
			arg.$link = TYPE_LINK;
			if (marker_operator)
				qstr += " AND def & $marker == $marker";
			else
				qstr += " AND def & $marker";
			arg.$marker = marker;
			arg.$ctype = TYPE_MONSTER;
		}
		if (arg.$ctype === TYPE_MONSTER) {
			qstr += " AND type & $ctype";
		}
	}

	const desc_str = `"desc" LIKE $desc ESCAPE '$'`;
	const locale = params.get("locale");
	if (locale)
		document.getElementById("select_locale").value = locale;
	const keyword = params.get("keyword");
	let name_cmd = process_name(locale, keyword, arg);
	if (name_cmd) {
		// keyword
		document.getElementById("text_keyword").value = keyword;
		qstr += ` AND (${name_cmd} OR ${desc_str})`;
		arg.$desc = like_pattern(keyword);
	}
	else {
		// name
		const name = params.get("cname");
		name_cmd = process_name(locale, name, arg);
		if (name_cmd) {
			document.getElementById("text_name").value = name;
			qstr += ` AND (${name_cmd})`;
		}
		// desc
		const desc = params.get("desc");
		if (desc) {
			document.getElementById("text_effect").value = desc;
			qstr += ` AND ${desc_str}`;
			arg.$desc = like_pattern(desc);
		}
	}
	return [qstr, arg];
}

// entrance of query
function server_analyze1(params) {
	const valid_params = server_validate1(params);
	const [condition, arg_final] = param_to_condition(valid_params);
	const stmt_final = valid_params.size ? `${stmt_base}${condition};` : "";
	current_stmt = stmt_final;
	current_arg = arg_final;
	const result = stmt_final ? query(stmt_final, arg_final) : [];
	if (result.length === 1)
		document.title = result[0].tw_name;
	show_result(valid_params, result);
}

function get_sw_str(x) {
	const sw_str1 = `race == $race_${x} AND attribute != $attr_${x} AND (level & 0xff) != $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	const sw_str2 = ` OR race != $race_${x} AND attribute == $attr_${x} AND (level & 0xff) != $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	const sw_str3 = ` OR race != $race_${x} AND attribute != $attr_${x} AND (level & 0xff) == $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	const sw_str4 = ` OR race != $race_${x} AND attribute != $attr_${x} AND (level & 0xff) != $lv_${x} AND atk == $atk_${x} AND def != $def_${x}`;
	const sw_str5 = ` OR race != $race_${x} AND attribute != $attr_${x} AND (level & 0xff) != $lv_${x} AND atk != $atk_${x} AND def == $def_${x}`;
	return `(${sw_str1}${sw_str2}${sw_str3}${sw_str4}${sw_str5})`;
}

/**
 * @param {string} cdata 
 * @returns 
 */
function get_single_card(cdata) {
	if (!cdata)
		return [null, 0];

	const qstr0 = `${stmt_default} AND type & $monster AND NOT type & $ext`;
	const arg = {
		...arg_default,
		$monster: TYPE_MONSTER,
		$ext: TYPE_EXTRA,
	};

	if (re_id.test(cdata)) {
		const id = Number.parseInt(cdata);
		const qstr = `${qstr0} AND datas.id == $id;`;
		arg.$id = id;
		const list1 = query(qstr, arg);
		if (list1.length === 1)
			return [list1[0], 1];
	}

	let qstr = `${qstr0} AND name == $exact;`;
	arg.$exact = cdata;
	const list2 = query(qstr, arg);
	if (list2.length === 1)
		return [list2[0], 1];

	let target_cid = 0;
	for (const [cid, name] of complete_name_table['ja']) {
		if (toHalfWidth(name) === toHalfWidth(cdata))
			target_cid = cid;
	}
	if (target_cid) {
		const nid = cid_table.get(target_cid);
		qstr = `${qstr0} AND datas.id == $nid;`;
		arg.$nid = nid;
		const list3 = query(qstr, arg);
		if (list3.length === 1)
			return [list3[0], 1];
	}

	qstr = `${qstr0} AND name LIKE $fuzzy ESCAPE '$';`;
	arg.$fuzzy = like_pattern(cdata);
	const list4 = query(qstr, arg);
	if (list4.length === 1)
		return [list4[0], 1];
	return [null, list4.length];
}

/**
 * entrance of small world
 * @param {URLSearchParams} params 
 * @returns 
 */
function server_analyze2(params) {
	if (!check_text(params, "begin") || !check_text(params, "end"))
		return;
	// id or name
	const cdata1 = params.get("begin");
	document.getElementById("text_id1").value = cdata1;
	const cdata2 = params.get("end");
	document.getElementById("text_id2").value = cdata2;
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

	params.set("ctype", "1");
	const valid_params = validate_params(params, false);
	valid_params.set("begin", card_begin.id);
	valid_params.set("end", card_end.id);
	const qstr0 = `${stmt_default} AND NOT type & $extra`;
	const [condition, arg_final] = param_to_condition(valid_params);
	arg_final.$extra = TYPE_EXTRA;
	const stmt_final = `${qstr0} AND ${get_sw_str("begin")} AND ${get_sw_str("end")}${condition};`;
	arg_final.$race_begin = card_begin.race;
	arg_final.$attr_begin = card_begin.attribute;
	arg_final.$lv_begin = card_begin.level;
	arg_final.$atk_begin = card_begin.atk;
	arg_final.$def_begin = card_begin.def;

	arg_final.$race_end = card_end.race;
	arg_final.$attr_end = card_end.attribute;
	arg_final.$lv_end = card_end.level;
	arg_final.$atk_end = card_end.atk;
	arg_final.$def_end = card_end.def;
	current_stmt = stmt_final;
	current_arg = arg_final;
	const result = query(stmt_final, arg_final);
	show_result(valid_params, result);
}
