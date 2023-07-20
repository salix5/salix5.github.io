// dependency: sql.js, JSZIP
"use strict";
const load_md = true;
const load_prerelease = true;
const last_pack = "SD46#5";

const default_query1 = `SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts WHERE datas.id == texts.id AND NOT type & ${TYPE_TOKEN}`;
const default_query2 = `SELECT datas.id FROM datas, texts WHERE datas.id == texts.id AND alias == 0 AND NOT type & ${TYPE_TOKEN}`;
const artwork_filter = ` AND abs(datas.id - alias) >= 10`;

/**
 * query() - query cards and push into ret
 * @param {string} qstr sqlite command
 * @param {object} arg binding object
 * @param {Array} ret result
 */
function query(qstr, arg, ret) {
	ret.length = 0;
	query_db(db, qstr, arg, ret);
	if (load_prerelease)
		query_db(db2, qstr, arg, ret);
}

/**
 * print_db_link() - return the link to official database
 * @param {number} cid database id
 * @param {number} ot OCT/TCG tag
 */
function print_db_link(cid, ot) {
	let locale = "ja";
	if (ot === 2)
		locale = "en";
	return `https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=${cid}&request_locale=${locale}`;
}

/**
 * print_wiki_link() - return the link to Yugipedia
 * @param {number} id card id
 */
function print_wiki_link(id) {
	return `https://yugipedia.com/wiki/${id}`;
}

/**
 * print_qa_link() - return the link to Q&A page
 * @param {number} cid
 */
function print_qa_link(cid) {
	return `https://www.db.yugioh-card.com/yugiohdb/faq_search.action?ope=4&cid=${cid}&request_locale=ja`;
}



const domain = "https://salix5.github.io";
// sqlite
const promise_db = fetch(`${domain}/CardEditor/cards.zip`).then(response => response.blob()).then(JSZip.loadAsync).then(zip_file => zip_file.files["cards.cdb"].async("uint8array"));
const config = { locateFile: filename => `./dist/${filename}` };
const list_promise = [initSqlJs(config), promise_db];
if (load_prerelease) {
	list_promise.push(fetch(`${domain}/cdb/pre-release.cdb`).then(response => response.arrayBuffer()).then(buf => new Uint8Array(buf)));
}

// JSON
const cid_table = Object.create(null);
const name_table = Object.create(null);
const name_table_en = Object.create(null);
const pack_list = Object.create(null);
const setname = Object.create(null);
const ltable = Object.create(null);

if (localStorage.getItem("last_pack") === last_pack) {
	Object.assign(cid_table, JSON.parse(localStorage.getItem("cid_table")));
	Object.assign(name_table, JSON.parse(localStorage.getItem("name_table")));
	Object.assign(name_table_en, JSON.parse(localStorage.getItem("name_table_en")));
	Object.assign(pack_list, JSON.parse(localStorage.getItem("pack_list")));
	Object.assign(setname, JSON.parse(localStorage.getItem("setname")));
	Object.assign(ltable, JSON.parse(localStorage.getItem("ltable")));
}
else {
	localStorage.clear();
	const promise_cid = fetch(`text/cid.json`).then(response => response.json()).then(data => Object.assign(cid_table, data));
	const promise_name = fetch(`text/name_table.json`).then(response => response.json()).then(data => Object.assign(name_table, data));
	const promise_name_en = fetch(`text/name_table_en.json`).then(response => response.json()).then(data => Object.assign(name_table_en, data));
	const promise_pack = fetch(`text/pack_list.json`).then(response => response.json()).then(data => Object.assign(pack_list, data));
	const promise_setname = fetch(`text/setname.json`).then(response => response.json()).then(data => Object.assign(setname, data));
	const promise_lflist = fetch(`text/lflist.json`).then(response => response.json()).then(data => Object.assign(ltable, data));
	const promise_local = Promise.all([promise_cid, promise_name, promise_name_en, promise_pack, promise_setname, promise_lflist]).then(function () {
		try {
			localStorage.setItem("cid_table", JSON.stringify(cid_table));
			localStorage.setItem("name_table", JSON.stringify(name_table));
			localStorage.setItem("name_table_en", JSON.stringify(name_table_en));
			localStorage.setItem("pack_list", JSON.stringify(pack_list));
			localStorage.setItem("setname", JSON.stringify(setname));
			localStorage.setItem("ltable", JSON.stringify(ltable));
			localStorage.setItem("last_pack", last_pack);
		} catch (ex) {
		}
	});
	list_promise.push(promise_local);
}

// MD
const ltable_md = Object.create(null);
const md_name = Object.create(null);
const md_name_en = Object.create(null);
if (load_md) {
	list_promise.push(fetch(`text/lflist_md.json`).then(response => response.json()).then(data => Object.assign(ltable_md, data)));
	list_promise.push(fetch(`text/md_name.json`).then(response => response.json()).then(data => Object.assign(md_name, data)));
	list_promise.push(fetch(`text/md_name_en.json`).then(response => response.json()).then(data => Object.assign(md_name_en, data)));
}

var SQL = null;
var db = null, db2 = null;
const db_ready = Promise.all(list_promise).then(function (values) {
	SQL = values[0];
	db = new SQL.Database(values[1]);
	if (load_prerelease)
		db2 = new SQL.Database(values[2]);
});

// print condition for cards in pack
function pack_cmd(pack) {
	let cmd = "";
	cmd = ` AND (0`;
	for (let i = 0; i < pack.length; ++i) {
		if (pack[i] !== 0 && pack[i] !== 1)
			cmd += ` OR datas.id=${pack[i]}`;
	}
	cmd += `)`;
	return cmd;
}

// check if card is alternative art
function is_alternative(card) {
	if (card.type & TYPE_TOKEN)
		return card.alias !== 0;
	else
		return Math.abs(card.id - card.alias) < 10;
}

function is_released(card) {
	return !!(card.jp_name || card.en_name);
}

// query cards in db
function query_db(db, qstr, arg, ret) {
	let stmt = db.prepare(qstr);
	stmt.bind(arg);

	// pack_id
	let inv_pack = Object.create(null);
	if (arg.pack && pack_list[arg.pack]) {
		for (let i = 0; i < pack_list[arg.pack].length; ++i) {
			if (pack_list[arg.pack][i] !== 0 && pack_list[arg.pack][i] !== 1)
				inv_pack[pack_list[arg.pack][i]] = i;
		}
	}

	while (stmt.step()) {
		let card = stmt.getAsObject();
		// real_id
		card.real_id = is_alternative(card) ? card.alias : card.id;

		// spell & trap reset data
		if (card.type & (TYPE_SPELL | TYPE_TRAP)) {
			card.atk = 0;
			card.def = 0;
			card.level = 0;
			card.race = 0;
			card.attribute = 0;
		}
		else if (card.type & TYPE_PENDULUM) {
			card.scale = (card.level >> 24) & 0xff;
			card.level = card.level & 0xff;
		}

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
		if (typeof cid_table[card.real_id] === "number")
			card.cid = cid_table[card.real_id];
		if (name_table[card.real_id])
			card.jp_name = name_table[card.real_id];
		if (name_table_en[card.real_id])
			card.en_name = name_table_en[card.real_id];
		else if (md_name_en[card.real_id])
			card.md_name_en = md_name_en[card.real_id];
		if (md_name[card.real_id])
			card.md_name = md_name[card.real_id];

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
