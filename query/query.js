"use strict";
const MAX_TEXT_LEN = 200;
const MAX_RESULT_LEN = 500;

let current_stmt = "";
let current_arg = null;

const re_id = /^\d{1,9}$/;

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
 * Set the checkboxes by name.
 * @param {URLSearchParams} params 
 * @param {string} inputName 
 * @param {number} offset 
 */
function checkByName(params, inputName, offset) {
	const elements = document.getElementsByName(inputName);
	for (const val of params.getAll(inputName)) {
		const idx = Number.parseInt(val) + offset;
		if (!Number.isNaN(idx) && idx >= 0 && idx < elements.length) {
			elements[idx].checked = true;
		}
	}
}

/**
 * Initialize the form based on URL parameters.
 * @param {URLSearchParams} params 
 */
function init_form(params) {
	document.getElementById("text_id").value = params.get("code") ?? "";
	document.getElementById("select_pack").value = params.get("pack") ?? "";

	// type
	let type = 0;
	switch (params.get("type")) {
		case "1": {
			type = TYPE_MONSTER;
			checkByName(params, "mtype", -1);
			if (params.get("monster_type_op") === "1") {
				document.getElementById("select_subtype_op").value = "1";
			}
			checkByName(params, "exclude", -1);
			break;
		}
		case "2": {
			type = TYPE_SPELL;
			checkByName(params, "stype", -1);
			break;
		}
		case "4": {
			type = TYPE_TRAP;
			checkByName(params, "ttype", -1);
			break;
		}
		default:
			break;
	}

	if (type === 0 || type === TYPE_MONSTER) {
		document.getElementById("text_mat").value = params.get("material") ?? "";
		document.getElementById("text_atk1").value = params.get("atk_from") ?? "";
		document.getElementById("text_atk2").value = params.get("atk_to") ?? "";
		document.getElementById("text_def1").value = params.get("def_from") ?? "";
		document.getElementById("text_def2").value = params.get("def_to") ?? "";
		document.getElementById("text_sum").value = params.get("sum") ?? "";

		checkByName(params, "level", 0);
		checkByName(params, "scale", 0);
		checkByName(params, "attr", -1);
		checkByName(params, "species", -1);
		checkByName(params, "linkbtn", -1);
		if (params.get("marker_op") === "1") {
			document.getElementById("select_marker_op").value = "1";
		}
	}

	document.getElementById("select_locale").value = params.get("locale") ?? "";
	if (params.get("keyword")) {
		document.getElementById("text_keyword").value = params.get("keyword");
	}
	else {
		document.getElementById("text_name").value = params.get("cardname") ?? "";
		document.getElementById("text_effect").value = params.get("desc") ?? "";
	}
}

async function fetch_query(params) {
	const url = new URL('https://salix5.up.railway.app/query');
	url.search = params.toString();
	const response = await fetch(url);
	const data = await response.json();
	if (data.result.length === 1)
		document.title = data.result[0].tw_name;
	else
		document.title = "卡片查詢";
	show_result(params, data);
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
