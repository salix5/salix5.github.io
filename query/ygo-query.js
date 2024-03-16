"use strict";
// dependency: sql.js, JSZIP
const last_pack = "QCCU#4";

// special ID
const ID_TYLER_THE_GREAT_WARRIOR = 68811206;
const ID_BLACK_LUSTER_SOLDIER = 5405695;
const CID_BLACK_LUSTER_SOLDIER = 19092;
const CARD_ARTWORK_VERSIONS_OFFSET = 20;

const select_all = `SELECT datas.id, ot, alias, setcode, type, atk, def, level, attribute, race, name, "desc" FROM datas, texts WHERE datas.id == texts.id`;
const select_id = `SELECT datas.id FROM datas, texts WHERE datas.id == texts.id`;

const base_filter = ` AND datas.id != ${ID_TYLER_THE_GREAT_WARRIOR} AND NOT type & ${TYPE_TOKEN}`;
const artwork_filter = ` AND (datas.id == ${ID_BLACK_LUSTER_SOLDIER} OR abs(datas.id - alias) >= ${CARD_ARTWORK_VERSIONS_OFFSET})`;
const physical_filter = `${base_filter}${artwork_filter}`;
const effect_filter = ` AND (NOT type & ${TYPE_NORMAL} OR type & ${TYPE_PENDULUM})`;

const stmt_base = `${select_all}${base_filter}`;
const stmt_default = `${select_all}${physical_filter}`;
const stmt_no_alias = `${select_id}${base_filter} AND alias == 0`;

let SQL = null;
const db_list = [];

const domain = "https://salix5.github.io/cdb";
const fetch_list = [];
// sqlite
const config = { locateFile: filename => `./dist/${filename}` };
const promise_db = fetch(`${domain}/cards.zip`)
	.then(response => response.blob())
	.then(JSZip.loadAsync)
	.then(zip_file => zip_file.files["cards.cdb"].async("uint8array"));
const promise_db2 = fetch(`${domain}/expansions/pre-release.cdb`)
	.then(response => response.arrayBuffer())
	.then(buf => new Uint8Array(buf));
fetch_list.push(Promise.all([initSqlJs(config), promise_db, promise_db2])
	.then(([sql, file1, file2]) => {
		SQL = sql;
		db_list.push(new SQL.Database(file1));
		db_list.push(new SQL.Database(file2));
	}));


const official_name = Object.create(null);
official_name['en'] = 'en_name';
official_name['ja'] = 'jp_name';

const game_name = Object.create(null);
game_name['en'] = 'md_name_en';
game_name['ja'] = 'md_name_jp';

let cid_table = null
const name_table = Object.create(null);
const md_table = Object.create(null);
const setname = Object.create(null);
const ltable_md = Object.create(null);
fetch_list.push(fetch(`text/md_name.json`).then(response => response.json()).then(entries => { name_table['md'] = new Map(entries) }));
fetch_list.push(fetch(`text/md_name_jp.json`).then(response => response.json()).then(entries => { md_table['ja'] = new Map(entries) }));
fetch_list.push(fetch(`text/md_name_en.json`).then(response => response.json()).then(entries => { md_table['en'] = new Map(entries) }));
fetch_list.push(fetch(`text/setname.json`).then(response => response.json()).then(data => Object.assign(setname, data)));
fetch_list.push(fetch(`text/lflist_md.json`).then(response => response.json()).then(data => Object.assign(ltable_md, data)));

// local
let cid_entries = null;
let jp_entries = null;
let en_entries = null;
const pack_list = Object.create(null);
const ltable_ocg = Object.create(null);
const ltable_tcg = Object.create(null);
if (localStorage.getItem("last_pack") === last_pack) {
	cid_entries = JSON.parse(localStorage.getItem("cid_table"));
	jp_entries = JSON.parse(localStorage.getItem("name_table_jp"));
	en_entries = JSON.parse(localStorage.getItem("name_table_en"));
	Object.assign(pack_list, JSON.parse(localStorage.getItem("pack_list")));
	Object.assign(ltable_ocg, JSON.parse(localStorage.getItem("ltable_ocg")));
	Object.assign(ltable_tcg, JSON.parse(localStorage.getItem("ltable_tcg")));
}
const from_local = !!(cid_entries && jp_entries && en_entries);
if (!from_local) {
	localStorage.clear();
	fetch_list.push(fetch(`text/cid_table.json`).then(response => response.json()).then(entries => cid_entries = entries));
	fetch_list.push(fetch(`text/name_table_jp.json`).then(response => response.json()).then(entries => jp_entries = entries));
	fetch_list.push(fetch(`text/name_table_en.json`).then(response => response.json()).then(entries => en_entries = entries));
	fetch_list.push(fetch(`text/pack_list.json`).then(response => response.json()).then(data => Object.assign(pack_list, data)));
	fetch_list.push(fetch(`text/lflist.json`).then(response => response.json()).then(data => Object.assign(ltable_ocg, data)));
	fetch_list.push(fetch(`text/lflist_tcg.json`).then(response => response.json()).then(data => Object.assign(ltable_tcg, data)));
}

let cid_to_id = null;
//let name_table_jp = null
let name_table_en = null
const db_ready = Promise.all(fetch_list)
	.then(() => {
		cid_table = new Map(cid_entries);
		name_table['ja'] = new Map(jp_entries);
		name_table['en'] = new Map(en_entries);
		cid_to_id = inverse_mapping(cid_table);
		if (!from_local) {
			try {
				localStorage.setItem("cid_table", JSON.stringify(Array.from(cid_table)));
				localStorage.setItem("name_table_jp", JSON.stringify(Array.from(name_table['ja'])));
				localStorage.setItem("name_table_en", JSON.stringify(Array.from(name_table['en'])));
				localStorage.setItem("pack_list", JSON.stringify(pack_list));
				localStorage.setItem("ltable_ocg", JSON.stringify(ltable_ocg));
				localStorage.setItem("ltable_tcg", JSON.stringify(ltable_tcg));
				localStorage.setItem("last_pack", last_pack);
			} catch (ex) {
			}
		}
	});

/**
 * @typedef {Object} Card
 * @property {number} id
 * @property {number} ot
 * @property {number} alias
 * @property {number[]} setcode
 * @property {number} real_id - The id of real card
 * 
 * @property {number} type
 * @property {number} atk
 * @property {number} def
 * @property {number} level
 * @property {number} scale
 * @property {number} race
 * @property {number} attribute
 * @property {number} color - Card color for sorting
 * 
 * @property {string} tw_name
 * @property {string} desc
 * 
 * @property {number} [cid]
 * @property {string} [en_name]
 * @property {string} [jp_name]
 * @property {string} [kr_name]
 * @property {string} [md_name]
 * @property {string} [md_name_en]
 * @property {string} [md_name_jp]
 * @property {number} [pack_index]
 */

const use_bigint = !!(window.BigInt);
const extra_setcode = {
	8512558: [0x8f, 0x54, 0x59, 0x82, 0x13a],
};

/**
 * Set `card.setcode` from int64.
 * @param {Card} card 
 * @param {bigint} setcode 
 */
function set_setcode(card, setcode) {
	const mask = BigInt(0xffff);
	const len = BigInt(16);
	const keep = BigInt(0xffffffffffff);
	while (setcode) {
		if (setcode & mask) {
			card.setcode.push(Number(setcode & mask));
		}
		setcode = (setcode >> len) & keep;
	}
}

/**
 * Check if `card.setode` contains `value`.
 * @param {Card} card 
 * @param {number} value 
 * @returns
 */
function is_setcode(card, value) {
	const settype = value & 0x0fff;
	const setsubtype = value & 0xf000;
	for (const x of card.setcode) {
		if ((x & 0x0fff) === settype && (x & 0xf000 & setsubtype) === setsubtype)
			return true;
	}
	return false;
}

/**
 * Query cards from `db` with statement `qstr` and binding object `arg` and put them in `ret`.
 * @param {initSqlJs.Database} db 
 * @param {string} qstr 
 * @param {Object} arg 
 * @param {Object[]} ret  
 */
function query_db(db, qstr, arg, ret) {
	if (!db)
		return;

	const stmt = db.prepare(qstr);
	stmt.bind(arg);
	while (stmt.step()) {
		const cdata = use_bigint ? stmt.getAsObject(null, { useBigInt: true }) : stmt.getAsObject();
		const card = Object.create(null);
		for (const [column, value] of Object.entries(cdata)) {
			switch (column) {
				case 'setcode':
					card.setcode = [];
					if (use_bigint && value) {
						if (extra_setcode[card.id]) {
							for (const x of extra_setcode[card.id])
								card.setcode.push(x);
						}
						else {
							set_setcode(card, value);
						}
					}
					break;
				case 'level':
					card.level = Number(value) & 0xff;
					card.scale = (Number(value) >> 24) & 0xff;
					break;
				default:
					if (typeof value === 'bigint')
						card[column] = Number(value);
					else
						card[column] = value;
					break;
			}
		}
		// extra column
		if ('id' in card && 'alias' in card) {
			card.real_id = is_alternative(card) ? card.alias : card.id;
		}
		if ('real_id' in card && cid_table.has(card.real_id)) {
			card.cid = cid_table.get(card.real_id);
		}
		ret.push(card);
	}
	stmt.free();
}

function finalize(card, index_table) {
	if (card.type & TYPE_MONSTER) {
		if (!(card.type & TYPE_EXTRA)) {
			if (card.type & TYPE_TOKEN)
				card.color = 0;
			else if (card.type & TYPE_NORMAL)
				card.color = 1;
			else if (card.type & TYPE_RITUAL)
				card.color = 3;
			else if (card.type & TYPE_EFFECT)
				card.color = 2;
			else
				card.color = -1;
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
				card.color = -1;
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
			card.color = -1;
	}
	else if (card.type & TYPE_TRAP) {
		if (card.type === TYPE_TRAP)
			card.color = 20;
		else if (card.type & TYPE_CONTINUOUS)
			card.color = 21;
		else if (card.type & TYPE_COUNTER)
			card.color = 22;
		else
			card.color = -1;
	}
	else {
		card.color = -1;
	}
	card.tw_name = card.name;
	delete card.name;
	if (card.cid) {
		for (const [locale, prop] of Object.entries(official_name)) {
			if (name_table[locale].has(card.cid))
				card[prop] = name_table[locale].get(card.cid);
			else if (md_table[locale] && md_table[locale].has(card.cid))
				card[game_name[locale]] = md_table[locale].get(card.cid);
		}
		if (name_table['md'].has(card.cid))
			card.md_name = name_table['md'].get(card.cid);
	}
	// pack index
	if (card.id <= 99999999) {
		if (index_table && index_table[card.id])
			card.pack_index = index_table[card.id];
	}
	else {
		card.pack_index = card.id % 1000;
	}
}

/**
 * Query cards and push into ret.
 * @param {string} qstr sqlite command
 * @param {Object} arg binding object
 * @returns {Card[]}
 */
function query(qstr, arg) {
	const ret = [];
	for (const db of db_list) {
		query_db(db, qstr, arg, ret);
	}
	let index_table = null;
	if (arg.pack && pack_list[arg.pack]) {
		index_table = Object.create(null);
		const pack = pack_list[arg.pack];
		for (let i = 0; i < pack.length; ++i) {
			if (pack[i] && pack[i] !== 1)
				index_table[pack[i]] = i;
		}
	}
	for (const card of ret) {
		finalize(card, index_table);
	}
	return ret;
}

/**
 * Return the link to DB page.
 * @param {number} cid 
 * @param {string} request_locale 
 * @returns URL
 */
function print_db_link(cid, request_locale) {
	return `https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=${cid}&request_locale=${request_locale}`;
}

/**
 * Return the link to Yugipedia page.
 * @param {number} id
 * @returns URL
 */
function print_yp_link(id) {
	return `https://yugipedia.com/wiki/${id.toString().padStart(8, '0')}`;
}

/**
 * Return the link to Q&A page.
 * @param {number} cid database id
 * @returns page address
 */
function print_qa_link(cid) {
	return `https://www.db.yugioh-card.com/yugiohdb/faq_search.action?ope=4&cid=${cid}&request_locale=ja`;
}

/**
 * Check if the card is an alternative artwork card.
 * @param {Card} card
 * @returns 
 */
function is_alternative(card) {
	if (card.id === ID_BLACK_LUSTER_SOLDIER)
		return false;
	else
		return Math.abs(card.id - card.alias) < CARD_ARTWORK_VERSIONS_OFFSET;
}

/**
 * Check if the card has an official card name.
 * @param {Card} card 
 * @returns 
 */
function is_released(card) {
	return !!(card.jp_name || card.en_name);
}

/**
 * Generate the setcode condition of a statement.
 * @param {number} setcode
 * @param {Object} arg
 * @returns setcode condition
 */
function setcode_condition(setcode, arg) {
	const setcode_str1 = `(setcode & $mask12) == $setname AND (setcode & $settype) == $settype`;
	const setcode_str2 = `(setcode >> $sec1 & $mask12) == $setname AND (setcode >> $sec1 & $settype) == $settype`;
	const setcode_str3 = `(setcode >> $sec2 & $mask12) == $setname AND (setcode >> $sec2 & $settype) == $settype`;
	const setcode_str4 = `(setcode >> $sec3 & $mask12) == $setname AND (setcode >> $sec3 & $settype) == $settype`;
	const ret = `(${setcode_str1} OR ${setcode_str2} OR ${setcode_str3} OR ${setcode_str4})`;
	arg.$setname = setcode & 0x0fff;
	arg.$settype = setcode & 0xf000;
	arg.$mask12 = 0x0fff;
	arg.$sec1 = 16;
	arg.$sec2 = 32;
	arg.$sec3 = 48;
	return ret;
}

/**
 * Print the card data (without Link Marker).
 * @param {Card} card
 * @param {string} newline newline char
 * @returns card data
 */
function print_data(card, newline) {
	let mtype = '';
	let subtype = '';
	let lvstr = '\u2605';
	let data = '';

	if (card.type & TYPE_MONSTER) {
		mtype = type_name[TYPE_MONSTER];
		if (card.type & TYPE_RITUAL)
			subtype = `/${type_name[TYPE_RITUAL]}`;
		else if (card.type & TYPE_FUSION)
			subtype = `/${type_name[TYPE_FUSION]}`;
		else if (card.type & TYPE_SYNCHRO)
			subtype = `/${type_name[TYPE_SYNCHRO]}`;
		else if (card.type & TYPE_XYZ) {
			subtype = `/${type_name[TYPE_XYZ]}`;
			lvstr = `\u2606`;
		}
		else if (card.type & TYPE_LINK) {
			subtype = `/${type_name[TYPE_LINK]}`;
			lvstr = `LINK-`;
		}
		if (card.type & TYPE_PENDULUM) {
			subtype += `/${type_name[TYPE_PENDULUM]}`;
		}

		// extype
		if (card.type & TYPE_NORMAL)
			subtype += `/${type_name[TYPE_NORMAL]}`;
		if (card.type & TYPE_SPIRIT)
			subtype += `/${type_name[TYPE_SPIRIT]}`;
		if (card.type & TYPE_UNION)
			subtype += `/${type_name[TYPE_UNION]}`;
		if (card.type & TYPE_DUAL)
			subtype += `/${type_name[TYPE_DUAL]}`;
		if (card.type & TYPE_TUNER)
			subtype += `/${type_name[TYPE_TUNER]}`;
		if (card.type & TYPE_FLIP)
			subtype += `/${type_name[TYPE_FLIP]}`;
		if (card.type & TYPE_TOON)
			subtype += `/${type_name[TYPE_TOON]}`;
		if (card.type & TYPE_SPSUMMON)
			subtype += `/${type_name[TYPE_SPSUMMON]}`;
		if (card.type & TYPE_EFFECT)
			subtype += `/${type_name[TYPE_EFFECT]}`;
		data = `[${mtype}${subtype}]${newline}`;

		let lv = card.level;
		data += `${lvstr}${lv == 0 ? '?' : lv}`;
		if (card.attribute)
			data += `/${attribute_name[card.attribute]}`;
		else
			data += `/${attribute_name['unknown']}`;
		if (card.race)
			data += `/${race_name[card.race]}`;
		else
			data += `/${race_name['unknown']}`;
		data += newline;

		data += `${value_name['atk']}${print_ad(card.atk)}`;
		if (!(card.type & TYPE_LINK)) {
			data += `/${value_name['def']}${print_ad(card.def)}`;
		}
		data += newline;

		if (card.type & TYPE_PENDULUM) {
			data += `【${value_name['scale']}：${card.scale}】${newline}`;
		}
	}
	else if (card.type & TYPE_SPELL) {
		mtype = `${type_name[TYPE_SPELL]}`;
		if (card.type & TYPE_QUICKPLAY)
			subtype = `/${type_name[TYPE_QUICKPLAY]}`;
		else if (card.type & TYPE_CONTINUOUS)
			subtype = `/${type_name[TYPE_CONTINUOUS]}`;
		else if (card.type & TYPE_EQUIP)
			subtype = `/${type_name[TYPE_EQUIP]}`;
		else if (card.type & TYPE_RITUAL)
			subtype = `/${type_name[TYPE_RITUAL]}`;
		else if (card.type & TYPE_FIELD)
			subtype = `/${type_name[TYPE_FIELD]}`;
		else
			subtype = `/${type_name[TYPE_NORMAL]}`;
		data = `[${mtype}${subtype}]${newline}`;
	}
	else if (card.type & TYPE_TRAP) {
		mtype = `${type_name[TYPE_TRAP]}`;
		if (card.type & TYPE_CONTINUOUS)
			subtype = `/${type_name[TYPE_CONTINUOUS]}`;
		else if (card.type & TYPE_COUNTER)
			subtype = `/${type_name[TYPE_COUNTER]}`;
		else
			subtype = `/${type_name[TYPE_NORMAL]}`;
		data = `[${mtype}${subtype}]${newline}`;
	}
	return data;
}

/**
 * Create the inverse mapping of `table`.
 * @param {Map} table 
 * @returns 
 */
function inverse_mapping(table) {
	const inverse = new Map();
	for (const [key, value] of table) {
		if (inverse.has(value)) {
			console.error('non-invertible', `${key}: ${value}`);
			return (new Map());
		}
		inverse.set(value, key);
	}
	return inverse;
}



// print condition for cards in pack
function pack_cmd(pack) {
	let cmd = "";
	cmd = ` AND (0`;
	for (let i = 0; i < pack.length; ++i) {
		if (pack[i] && pack[i] !== 1)
			cmd += ` OR datas.id=${pack[i]}`;
	}
	cmd += `)`;
	return cmd;
}
