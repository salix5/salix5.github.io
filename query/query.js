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

// from json
var cid_table = Object.create(null);
var name_table = Object.create(null);
var name_table_en = Object.create(null);
var pack_list = Object.create(null);
var setname = Object.create(null);
var ltable = Object.create(null);
var ltable_md = Object.create(null);

var result = [];

//re_wildcard = /(?<!\$)[%_]/ (lookbehind)
const re_wildcard = /(^|[^\$])[%_]/;
const re_bad_escape = /\$(?![%_])/g;
const re_all_digit = /^\d+$/;

String.prototype.toHalfWidth = function () {
	return this.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) { return String.fromCharCode(s.charCodeAt(0) - 0xFEE0) });
};

String.prototype.toFullWidth = function () {
	return this.replace(/[A-Za-z0-9]/g, function (s) { return String.fromCharCode(s.charCodeAt(0) + 0xFEE0); });
};

function process_buffer(buf) {
	let arr = new Uint8Array(buf);
	return arr;
}

function is_alternative(id, alias, type) {
	if (type & TYPE_TOKEN)
		return alias !== 0;
	else
		return Math.abs(id - alias) < 10;
}

function query_card(db, qstr, arg, ret) {
	let stmt = db.prepare(qstr);
	stmt.bind(arg);

	let inv_pack = Object.create(null);
	if (arg.pack && pack_list[arg.pack]) {
		for (let i = 0; i < pack_list[arg.pack].length; ++i) {
			if (pack_list[arg.pack][i] !== 0 && pack_list[arg.pack][i] !== 1)
				inv_pack[pack_list[arg.pack][i]] = i;
		}
	}

	while (stmt.step()) {
		let card = stmt.getAsObject();
		if (is_alternative(card.id, card.alias, card.type))
			continue;

		// spell & trap reset data
		if (card.type & (TYPE_SPELL | TYPE_TRAP)) {
			card.atk = 0;
			card.def = 0;
			card.level = 0;
			card.race = 0;
			card.attribute = 0;
		}
		card.scale = (card.level >> 24) & 0xff;
		card.level = card.level & 0xff;

		// color
		if (card.type & TYPE_MONSTER) {
			if (!(card.type & TYPE_EXT)) {
				if (card.type & TYPE_TOKEN)
					card.color = 0;
				else if (card.type & TYPE_NORMAL)
					card.color = 1;
				else if (card.type & TYPE_RITUAL)
					card.color = 3;
				else if (card.type & TYPE_EFFECT)
					card.color = 2;
				else
					card.color = null;
			}
			else {
				if (card.type & TYPE_FUSION)
					card.color = 4;
				else if (card.type & TYPE_SYNCHRO)
					card.color = 5;
				else if (card.type & TYPE_XYZ)
					card.color = 6;
				else if (card.type & TYPE_LINK)
					card.color = 7;
				else
					card.color = null;
			}
		}
		else if (card.type & TYPE_SPELL) {
			if (card.type === TYPE_SPELL)
				card.color = 10;
			else if (card.type & TYPE_QUICKPLAY)
				card.color = 11;
			else if (card.type & TYPE_CONTINUOUS)
				card.color = 12;
			else if (card.type & TYPE_EQUIP)
				card.color = 13;
			else if (card.type & TYPE_RITUAL)
				card.color = 14;
			else if (card.type & TYPE_FIELD)
				card.color = 15;
			else
				card.color = null;
		}
		else if (card.type & TYPE_TRAP) {
			if (card.type === TYPE_TRAP)
				card.color = 20;
			else if (card.type & TYPE_CONTINUOUS)
				card.color = 21;
			else if (card.type & TYPE_COUNTER)
				card.color = 22;
			else
				card.color = null;
		}
		else {
			card.color = null;
		}

		// cid
		card.cid = cid_table[card.id] ? cid_table[card.id] : null;
		card.jp_name = name_table[card.id] ? name_table[card.id] : null;
		card.en_name = name_table_en[card.id] ? name_table_en[card.id] : null;

		// pack_id
		if (card.id <= 99999999) {
			if (arg.pack && pack_list[arg.pack])
				card.pack_id = inv_pack[card.id];
			else
				card.pack_id = null;
		}
		else {
			card.pack_id = card.id % 1000;
		}
		ret.push(card);
	}
	stmt.free();
}

const promise_db = fetch(`https://salix5.github.io/CardEditor/${cdb_tag}.zip`).then(response => response.blob()).then(JSZip.loadAsync).then(zip_file => zip_file.files["cards.cdb"].async("uint8array"));
const promise_db2 = fetch(extra_url).then(response => response.arrayBuffer()).then(process_buffer);
const promise_sql = initSqlJs(config).then(response => { SQL = response; });

var promise_text = null;
if (localStorage.getItem("last_pack") === last_pack) {
	cid_table = Object.assign(cid_table, JSON.parse(localStorage.getItem("cid_table")));
	name_table = Object.assign(name_table, JSON.parse(localStorage.getItem("name_table")));
	name_table_en = Object.assign(name_table_en, JSON.parse(localStorage.getItem("name_table_en")));
	pack_list = Object.assign(pack_list, JSON.parse(localStorage.getItem("pack_list")));
	setname = Object.assign(setname, JSON.parse(localStorage.getItem("setname")));
	ltable = Object.assign(ltable, JSON.parse(localStorage.getItem("ltable")));
	ltable_md = Object.assign(ltable_md, JSON.parse(localStorage.getItem("ltable_md")));
	promise_text = Promise.resolve(true);
}
else {
	localStorage.clear();
	const promise_cid = fetch("text/cid.json").then(response => response.json()).then(data => { cid_table = Object.assign(cid_table, data); });
	const promise_name = fetch("text/name_table.json").then(response => response.json()).then(data => { name_table = Object.assign(name_table, data); });
	const promise_name_en = fetch("text/name_table_en.json").then(response => response.json()).then(data => { name_table_en = Object.assign(name_table_en, data); });
	const promise_pack = fetch("text/pack_list.json").then(response => response.json()).then(data => { pack_list = Object.assign(pack_list, data); });
	const promise_setname = fetch("text/setname.json").then(response => response.json()).then(data => { setname = Object.assign(setname, data); });
	const promise_lflist = fetch("text/lflist.json").then(response => response.json()).then(data => { ltable = Object.assign(ltable, data); });
	const promise_lflist2 = fetch("text/lflist_md.json").then(response => response.json()).then(data => { ltable_md = Object.assign(ltable_md, data); });
	promise_text = Promise.all([promise_cid, promise_name, promise_name_en, promise_pack, promise_setname, promise_lflist, promise_lflist2]).then(function (values) {
		try {
			localStorage.setItem("last_pack", last_pack);
			localStorage.setItem("cid_table", JSON.stringify(cid_table));
			localStorage.setItem("name_table", JSON.stringify(name_table));
			localStorage.setItem("name_table_en", JSON.stringify(name_table_en));
			localStorage.setItem("pack_list", JSON.stringify(pack_list));
			localStorage.setItem("setname", JSON.stringify(setname));
			localStorage.setItem("ltable", JSON.stringify(ltable));
			localStorage.setItem("ltable_md", JSON.stringify(ltable_md));
		} catch (ex) {
		}
	});
}

Promise.all([promise_sql, promise_db, promise_db2, promise_text]).then(function (values) {
	db = new SQL.Database(values[1]);
	db2 = new SQL.Database(values[2]);
	url_query();
	button1.disabled = false;
	button2.disabled = false;
}
);

function is_positive(x) {
	return x !== null && x > 0;
}

function is_page(x) {
	return x !== null && x >= 1 && x <= 1000;
}

function is_atk(x) {
	return x !== null && x >= -1;
}

function is_def(x) {
	return x !== null && x >= -2;
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

function is_str(x) {
	return x && x.length <= MAX_STRLEN;
}

function check_int(val) {
	if (val && val.length <= MAX_DIGIT) {
		let x = parseInt(val, 10);
		if (Number.isNaN(x))
			return null;
		else
			return x;
	}
	else
		return null;
}

function check_str(val) {
	if (!is_str(val))
		return '';
	return val;
}

function pack_cmd(pack) {
	let cmd = '';
	cmd = ` AND (0`;
	for (let i = 0; i < pack.length; ++i) {
		if (pack[i] !== 0 && pack[i] !== 1)
			cmd += ` OR datas.id=${pack[i]}`;
	}
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

function server_validate1(params) {
	let valid_params = new URLSearchParams();
	// id, primary key
	let id = check_int(params.get("id"));
	if (is_positive(id)) {
		valid_params.set("id", id);
	}
	else {
		let type = check_int(params.get("type"));
		let subtype = check_int(params.get("subtype"));
		let sub_op = check_int(params.get("sub_op"));
		let exc = check_int(params.get("exc"));
		let atk1 = check_int(params.get("atk1"));
		let atk2 = check_int(params.get("atk2"));
		let atkm = check_int(params.get("atkm"));
		let def1 = check_int(params.get("def1"));
		let def2 = check_int(params.get("def2"));
		let defm = check_int(params.get("defm"));
		let sum = check_int(params.get("sum"));
		let lv1 = check_int(params.get("lv1"));
		let lv2 = check_int(params.get("lv2"));
		let sc1 = check_int(params.get("sc1"));
		let sc2 = check_int(params.get("sc2"));
		let attr = check_int(params.get("attr"));
		let race = check_int(params.get("race"));
		let marker = check_int(params.get("marker"));
		let marker_op = check_int(params.get("marker_op"));

		if (is_positive(type))
			valid_params.set("type", type);
		if (is_positive(subtype)) {
			valid_params.set("subtype", subtype);
			if (sub_op)
				valid_params.set("sub_op", 1);
			else
				valid_params.set("sub_op", 0);
		}
		if (is_positive(exc))
			valid_params.set("exc", exc);
		if (is_atk(atk1))
			valid_params.set("atk1", atk1);
		if (is_atk(atk2))
			valid_params.set("atk2", atk2);
		if (is_modulus(atkm))
			valid_params.set("atkm", atkm);
		if (is_def(def1))
			valid_params.set("def1", def1);
		if (is_def(def2))
			valid_params.set("def2", def2);
		if (is_modulus(defm))
			valid_params.set("defm", defm);
		if (is_normal_atk(sum))
			valid_params.set("sum", sum);
		if (is_lv(lv1))
			valid_params.set("lv1", lv1);
		if (is_lv(lv2))
			valid_params.set("lv2", lv2);
		if (is_scale(sc1))
			valid_params.set("sc1", sc1);
		if (is_scale(sc2))
			valid_params.set("sc2", sc2);
		if (is_positive(attr))
			valid_params.set("attr", attr);
		if (is_positive(race))
			valid_params.set("race", race);
		if (is_positive(marker)) {
			valid_params.set("marker", marker);
			if (marker_op)
				valid_params.set("marker_op", 1);
			else
				valid_params.set("marker_op", 0);
		}

		// string
		let pack = check_str(params.get("pack"));
		let locale = check_str(params.get("locale"));
		let mat = check_str(params.get("mat")).replace(/(^|[^\$])[%_]/g, "");
		let multi = check_str(params.get("multi")).replace(re_bad_escape, "");
		let name = check_str(params.get("name")).replace(re_bad_escape, "");
		let desc = check_str(params.get("desc")).replace(re_bad_escape, "");
		if (pack === "o" || pack === "t" || pack_list[pack] || pre_release[pack])
			valid_params.set("pack", pack);
		if (locale === "en")
			valid_params.set("locale", locale);
		if (mat)
			valid_params.set("mat", mat);
		if (multi)
			valid_params.set("multi", multi);
		if (name)
			valid_params.set("name", name);
		if (desc)
			valid_params.set("desc", desc);
	}
	// page
	let page = check_int(params.get("page"));
	if (is_page(page))
		valid_params.set("page", page);
	else
		valid_params.set("page", 1);
	return valid_params;
}

function server_validate2(params) {
	let valid_params = new URLSearchParams();
	valid_params.set("id1", params.get("id1"));
	valid_params.set("id2", params.get("id2"));

	let subtype = check_int(params.get("subtype"));
	let sub_op = check_int(params.get("sub_op"));
	let exc = check_int(params.get("exc"));
	let atk1 = check_int(params.get("atk1"));
	let atk2 = check_int(params.get("atk2"));
	let def1 = check_int(params.get("def1"));
	let def2 = check_int(params.get("def2"));
	let sum = check_int(params.get("sum"));
	let lv1 = check_int(params.get("lv1"));
	let lv2 = check_int(params.get("lv2"));
	let sc1 = check_int(params.get("sc1"));
	let sc2 = check_int(params.get("sc2"));
	let attr = check_int(params.get("attr"));
	let race = check_int(params.get("race"));

	valid_params.set("type", TYPE_MONSTER);
	if (is_positive(subtype)) {
		valid_params.set("subtype", subtype);
		if (sub_op)
			valid_params.set("sub_op", 1);
		else
			valid_params.set("sub_op", 0);
	}
	if (is_positive(exc))
		valid_params.set("exc", exc);
	if (is_atk(atk1))
		valid_params.set("atk1", atk1);
	if (is_atk(atk2))
		valid_params.set("atk2", atk2);
	if (is_def(def1))
		valid_params.set("def1", def1);
	if (is_def(def2))
		valid_params.set("def2", def2);
	if (is_normal_atk(sum))
		valid_params.set("sum", sum);
	if (is_lv(lv1))
		valid_params.set("lv1", lv1);
	if (is_lv(lv2))
		valid_params.set("lv2", lv2);
	if (is_scale(sc1))
		valid_params.set("sc1", sc1);
	if (is_scale(sc2))
		valid_params.set("sc2", sc2);
	if (is_positive(attr))
		valid_params.set("attr", attr);
	if (is_positive(race))
		valid_params.set("race", race);

	// string
	let pack = check_str(params.get("pack"));
	let locale = check_str(params.get("locale"));
	let multi = check_str(params.get("multi")).replace(re_bad_escape, "");
	let name = check_str(params.get("name")).replace(re_bad_escape, "");
	let desc = check_str(params.get("desc")).replace(re_bad_escape, "");
	if (pack === "o" || pack === "t" || pack_list[pack] || pre_release[pack])
		valid_params.set("pack", pack);
	if (locale === "en")
		valid_params.set("locale", locale);
	if (multi)
		valid_params.set("multi", multi);
	if (name)
		valid_params.set("name", name);
	if (desc)
		valid_params.set("desc", desc);

	// page
	let page = check_int(params.get("page"));
	if (is_page(page))
		valid_params.set("page", page);
	else
		valid_params.set("page", 1);
	return valid_params;
}

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
function process_name(locale, str_name, arg) {
	if (!str_name)
		return "";
	const setcode_str = ` OR ${setcode_cmd("$setcode")}`;
	let name_cmd = "";
	switch (locale) {
		case "en":
			let en_list = [];
			let str_en = str_name.toLowerCase();
			for (const [key, value] of Object.entries(name_table_en)) {
				if (value && value.toLowerCase().includes(str_en))
					en_list.push(key);
				if (en_list.length > MAX_RESULT_LEN) {
					en_list.length = 0;
					break;
				}
			}
			name_cmd = "0";
			for (let i = 0; i < en_list.length; ++i)
				name_cmd += ` OR datas.id=${en_list[i]}`;
			break;
		default:
			// ja, name
			let jp_list = [];
			let str_jp = str_name.toHalfWidth().toLowerCase();
			for (const [key, value] of Object.entries(name_table)) {
				if (value.toHalfWidth().toLowerCase().includes(str_jp))
					jp_list.push(key);
				if (jp_list.length > MAX_RESULT_LEN) {
					jp_list.length = 0;
					break;
				}
			}
			name_cmd = "0";
			for (let i = 0; i < jp_list.length; ++i)
				name_cmd += ` OR datas.id=${jp_list[i]}`;
			// zh, setcode
			if (!re_wildcard.test(str_name)) {
				let real_str = str_name.replace(/\$%/g, '%').replace(/\$_/g, '_').toLowerCase();
				for (const [key, value] of Object.entries(setname)) {
					if (key.toLowerCase() === real_str) {
						name_cmd += setcode_str;
						arg.$setcode = value;
						break;
					}
				}
			}
			// zh, name
			name_cmd += " OR name LIKE $name ESCAPE '$' OR desc LIKE $kanji ESCAPE '$'";
			name_cmd += " OR alias IN (SELECT datas.id FROM datas, texts WHERE datas.id == texts.id AND alias == 0 AND NOT type & $token AND name LIKE $name ESCAPE '$')";
			arg.$name = string_to_literal(str_name);
			arg.$kanji = `%※${string_to_literal(str_name)}`;
			break;
	}
	return name_cmd;
}


// entrance of query
function server_analyze1(params) {
	let qstr0 = "SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts WHERE datas.id == texts.id";
	let arg = new Object();
	arg.$monster = TYPE_MONSTER;
	arg.$spell = TYPE_SPELL;
	arg.$trap = TYPE_TRAP;
	arg.$link = TYPE_LINK;
	arg.$pendulum = TYPE_PENDULUM;
	arg.$token = TYPE_TOKEN;

	let valid_params = server_validate1(params);
	let condition = param_to_condition(valid_params, arg);
	if (arg.$ctype === TYPE_MONSTER && arg.$stype && (arg.$stype & TYPE_TOKEN)) {
		qstr0 += " AND (type & $token OR abs(datas.id - alias) >= 10) AND (NOT type & $token OR alias == 0)";
	}
	else {
		qstr0 += " AND NOT type & $token AND abs(datas.id - alias) >= 10";
	}

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
	let sw_str1 = `race == $race_${x} AND attribute != $attr_${x} AND level != $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	let sw_str2 = ` OR race != $race_${x} AND attribute == $attr_${x} AND level != $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	let sw_str3 = ` OR race != $race_${x} AND attribute != $attr_${x} AND level == $lv_${x} AND atk != $atk_${x} AND def != $def_${x}`;
	let sw_str4 = ` OR race != $race_${x} AND attribute != $attr_${x} AND level != $lv_${x} AND atk == $atk_${x} AND def != $def_${x}`;
	let sw_str5 = ` OR race != $race_${x} AND attribute != $attr_${x} AND level != $lv_${x} AND atk != $atk_${x} AND def == $def_${x}`;
	return `(${sw_str1}${sw_str2}${sw_str3}${sw_str4}${sw_str5})`;
}

function get_single_card(cdata) {
	if (!cdata)
		return [null, 0];

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

	let qstr = "";
	let list_tmp = [];

	let id = check_int(cdata);
	if (is_positive(id)) {
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

	let nid = Object.keys(name_table).find(key => name_table[key].toHalfWidth() === cdata.toHalfWidth());
	if (nid && nid > 0) {
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
	let cdata1 = check_str(params.get("id1"));
	text_id1.value = cdata1;
	let ret1 = get_single_card(cdata1);
	let card_begin = ret1[0];
	let result_len1 = ret1[1];

	let cdata2 = check_str(params.get("id2"));
	text_id2.value = cdata2;
	let ret2 = get_single_card(cdata2);
	let card_end = ret2[0];
	let result_len2 = ret2[1];

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

	let qstr0 = "SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts";
	qstr0 += " WHERE datas.id == texts.id AND abs(datas.id - alias) >= 10 AND NOT type & ($token | $ext)";
	let arg = new Object();
	arg.$monster = TYPE_MONSTER;
	arg.$spell = TYPE_SPELL;
	arg.$trap = TYPE_TRAP;
	arg.$link = TYPE_LINK;
	arg.$pendulum = TYPE_PENDULUM;
	arg.$token = TYPE_TOKEN;
	arg.$ext = TYPE_EXT;

	params.set("id1", card_begin.id);
	params.set("id2", card_end.id);
	let valid_params = server_validate2(params);
	let condition = param_to_condition(valid_params, arg);
	let qstr_final = `${qstr0} AND ${get_sw_str('begin')} AND ${get_sw_str('end')}${condition};`;
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

function param_to_condition(params, arg) {
	let qstr = '';
	// id, primary key
	let id = check_int(params.get("id"));
	if (id) {
		text_id.value = id;
		qstr += " AND datas.id == $id;";
		arg.$id = id;
		return qstr;
	}
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
	let ctype = check_int(params.get("type"));
	let subtype = check_int(params.get("subtype"));
	let sub_op = check_int(params.get("sub_op"));
	let exc = check_int(params.get("exc"));

	arg.$ctype = 0;
	arg.$stype = 0;
	switch (ctype) {
		case TYPE_MONSTER:
			qstr += " AND type & $ctype";
			arg.$ctype = ctype;
			if (subtype) {
				for (let i = 0; i < cb_mtype.length; ++i) {
					if (subtype & id_to_type[cb_mtype[i].id])
						cb_mtype[i].checked = true;
				}
				if (sub_op) {
					select_subtype_op.value = 'and';
					qstr += " AND type & $stype == $stype";
				}
				else {
					select_subtype_op.value = 'or';
					qstr += " AND type & $stype";
				}
				arg.$stype = subtype;
			}
			if (exc) {
				for (let i = 0; i < cb_exclude.length; ++i) {
					if (exc & id_to_type[cb_mtype[i].id])
						cb_exclude[i].checked = true;
				}
				qstr += " AND NOT type & $exc";
				arg.$exc = exc;
			}
			break;
		case TYPE_SPELL:
			qstr += " AND type & $ctype";
			arg.$ctype = ctype;
			if (subtype) {
				for (let i = 0; i < cb_stype.length; ++i) {
					if (subtype & id_to_type[cb_stype[i].id])
						cb_stype[i].checked = true;
				}
				if (subtype & TYPE_NORMAL) {
					if (subtype === TYPE_NORMAL) {
						qstr += " AND type == $spell";
					}
					else {
						qstr += " AND (type == $spell OR type & $stype)";
						arg.$stype = subtype & ~TYPE_NORMAL;
					}
				}
				else {
					qstr += " AND type & $stype";
					arg.$stype = subtype;
				}
			}
			break;
		case TYPE_TRAP:
			qstr += " AND type & $ctype";
			arg.$ctype = ctype;
			if (subtype) {
				for (let i = 0; i < cb_ttype.length; ++i) {
					if (subtype & id_to_type[cb_ttype[i].id])
						cb_ttype[i].checked = true;
				}
				if (subtype & TYPE_NORMAL) {
					if (subtype === TYPE_NORMAL) {
						qstr += " AND type == $trap";
					}
					else {
						qstr += " AND (type == $trap OR type & $stype)";
						arg.$stype = subtype & ~TYPE_NORMAL;
					}
				}
				else {
					qstr += " AND type & $stype";
					arg.$stype = subtype;
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
		let atk1 = check_int(params.get("atk1"));
		let atk2 = check_int(params.get("atk2"));
		let atk_mod = check_int(params.get("atkm"));
		if (atk1 === -1) {
			text_atk1.value = -1;
			qstr += " AND atk == -2";
			is_monster = true;
		}
		else if (atk1 !== null) {
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
			is_monster = true;
		}
		if (atk_mod !== null) {
			qstr += " AND atk % 1000 == $atkm";
			arg.$atkm = atk_mod;
			is_monster = true;
		}

		// def, exclude link monsters
		let def1 = check_int(params.get("def1"));
		let def2 = check_int(params.get("def2"));
		let sum = check_int(params.get("sum"));
		let def_mod = check_int(params.get("defm"));
		if (def1 !== null || def2 !== null || sum !== null || def_mod !== null)
			qstr += " AND NOT type & $link";
		if (def1 === -1) {
			text_def1.value = -1;
			qstr += " AND def == -2";
			is_monster = true;
		}
		else if (def1 === -2) {
			text_def1.value = -2;
			qstr += " AND def == atk AND def != -2";
			is_monster = true;
		}
		else if (def1 !== null) {
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
			is_monster = true;
		}
		if (def_mod !== null) {
			qstr += " AND def % 1000 == $defm";
			arg.$defm = def_mod;
			is_monster = true;
		}

		// sum
		if (sum !== null) {
			text_sum.value = sum;
			qstr += " AND atk != -2 AND def != -2 AND atk + def == $sum";
			arg.$sum = sum;
			is_monster = true;
		}

		// lv, rank, link
		let lv1 = check_int(params.get("lv1"));
		let lv2 = check_int(params.get("lv2"));
		if (lv1 !== null) {
			text_lv1.value = lv1;
			if (lv2 !== null) {
				text_lv2.value = lv2;
				qstr += " AND (level & 0xff) >= $lv1 AND (level & 0xff) <= $lv2";
				arg.$lv1 = lv1;
				arg.$lv2 = lv2;
			}
			else {
				qstr += " AND (level & 0xff) == $lv1";
				arg.$lv1 = lv1;
			}
			is_monster = true;
		}

		// scale, pendulum monster only
		let sc1 = check_int(params.get("sc1"));
		let sc2 = check_int(params.get("sc2"));
		if (sc1 !== null) {
			text_sc1.value = sc1;
			qstr += " AND type & $pendulum";
			if (sc2 !== null) {
				text_sc2.value = sc2;
				qstr += " AND (level >> 24 & 0xff) >= $sc1 AND (level >> 24 & 0xff) <= $sc2";
				arg.$sc1 = sc1;
				arg.$sc2 = sc2;
			}
			else {
				qstr += " AND (level >> 24 & 0xff) == $sc1";
				arg.$sc1 = sc1;
			}
			is_monster = true;
		}

		// attr, race
		let attr = check_int(params.get("attr"));
		let race = check_int(params.get("race"));
		if (attr) {
			for (let i = 0; i < cb_attr.length; ++i) {
				if (attr & index_to_attr[i])
					cb_attr[i].checked = true;
			}
			qstr += " AND attribute & $attr";
			arg.$attr = attr;
			is_monster = true;
		}
		if (race) {
			for (let i = 0; i < cb_race.length; ++i) {
				if (race & index_to_race[i])
					cb_race[i].checked = true;
			}
			qstr += " AND race & $race";
			arg.$race = race;
			is_monster = true;
		}
		// marker
		let marker = check_int(params.get("marker"));
		let marker_op = check_int(params.get("marker_op"));
		if (marker) {
			for (let i = 0; i < cb_marker.length; ++i) {
				if (marker & index_to_marker[i])
					cb_marker[i].checked = true;
			}
			qstr += " AND type & $link";
			if (marker_op) {
				select_marker_op.value = 'and';
				qstr += " AND def & $marker == $marker";
			}
			else {
				select_marker_op.value = 'or';
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
	let multi = params.get("multi");
	let name_cmd = process_name(locale, multi, arg);
	if (name_cmd) {
		// multi
		text_multi.value = multi;
		qstr += ` AND (${name_cmd} OR ${desc_str})`;
		arg.$desc = string_to_literal(multi);
	}
	else {
		// name
		let name = params.get("name");
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

function query(qstr, arg, ret) {
	ret.length = 0;
	query_card(db, qstr, arg, ret);
	query_card(db2, qstr, arg, ret);
}
