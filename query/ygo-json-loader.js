"use strict";
const last_pack = "BLZD#3";

function object_to_map(obj) {
	const map = new Map();
	for (const [key, value] of Object.entries(obj))
		map.set(Number.parseInt(key, 10), value);
	return map;
}

let SQL = null;
const db_list = [];
const fetch_list = [];
// sqlite
const promise_sql = initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${filename}` });
const promise_db = fetch('https://salix5.github.io/archive/cards.zip')
	.then(response => response.blob())
	.then(JSZip.loadAsync)
	.then(zip_file => zip_file.file("cards.cdb").async("uint8array"));
const promise_db2 = fetch('https://salix5.github.io/cdb/expansions/pre-release.cdb')
	.then(response => response.arrayBuffer())
	.then(buf => new Uint8Array(buf));
fetch_list.push(Promise.all([promise_sql, promise_db, promise_db2])
	.then(([sql, file1, file2]) => {
		SQL = sql;
		db_list.push(new SQL.Database(file1));
		db_list.push(new SQL.Database(file2));
	}));

const bls_postfix = Object.create(null);
bls_postfix['en'] = ' (Normal)';
bls_postfix['ja'] = '（通常モンスター）';
bls_postfix['ko'] = ' (일반)';
bls_postfix['zh-tw'] = '（通常怪獸）';

const official_name = Object.create(null);
official_name['en'] = 'en_name';
official_name['ja'] = 'jp_name';

const game_name = Object.create(null);
game_name['en'] = 'md_name_en';
game_name['ja'] = 'md_name_jp';

const name_table = Object.create(null);
const md_table = Object.create(null);
const complete_name_table = Object.create(null);
let cid_table = null
let replace_name = null;
let pre_release = null;
let wiki_link = null;
fetch_list.push(fetch(`text/name_table_jp.json`).then(response => response.json()).then(data => name_table['ja'] = object_to_map(data)));
fetch_list.push(fetch(`text/name_table_en.json`).then(response => response.json()).then(data => name_table['en'] = object_to_map(data)));
fetch_list.push(fetch(`text/replace_name.json`).then(response => response.json()).then(data => replace_name = data));
fetch_list.push(fetch(`pack/pre_release.json`).then(response => response.json()).then(data => pre_release = data));
fetch_list.push(fetch(`pack/wiki_link.json`).then(response => response.json()).then(data => wiki_link = data));

// local
let md_card_list = null;
let setname = null;
let pack_list = null;
let ltable_ocg = null;
let ltable_tcg = null;
let ltable_md = null;
try {
	if (localStorage.getItem("last_pack") === last_pack) {
		cid_table = new Map(JSON.parse(localStorage.getItem("cid_table")));
		md_table['ja'] = new Map(JSON.parse(localStorage.getItem("md_name_jp")));
		md_table['en'] = new Map(JSON.parse(localStorage.getItem("md_name_en")));
		md_card_list = JSON.parse(localStorage.getItem("md_card_list"));
		setname = JSON.parse(localStorage.getItem("setname"));
		pack_list = JSON.parse(localStorage.getItem("pack_list"));
		ltable_ocg = JSON.parse(localStorage.getItem("ltable_ocg"));
		ltable_tcg = JSON.parse(localStorage.getItem("ltable_tcg"));
		ltable_md = JSON.parse(localStorage.getItem("ltable_md"));
	}
	else {
		localStorage.clear();
	}
}
catch (e) {
	try {
		localStorage.clear();
	}
	catch {
	}
}
const from_local = cid_table && md_table['ja'] && md_table['en'] && md_card_list && setname && pack_list && ltable_ocg && ltable_tcg && ltable_md;
if (!from_local) {
	fetch_list.push(fetch(`text/cid_table.json`).then(response => response.json()).then(data => cid_table = object_to_map(data)));
	fetch_list.push(fetch(`text/md_name_jp.json`).then(response => response.json()).then(data => md_table['ja'] = object_to_map(data)));
	fetch_list.push(fetch(`text/md_name_en.json`).then(response => response.json()).then(data => md_table['en'] = object_to_map(data)));
	fetch_list.push(fetch(`text/CardList.json`).then(response => response.json()).then(data => md_card_list = data));
	fetch_list.push(fetch(`text/setname.json`).then(response => response.json()).then(data => setname = data));
	fetch_list.push(fetch(`pack/pack_list.json`).then(response => response.json()).then(data => pack_list = data));
	fetch_list.push(fetch(`text/lflist.json`).then(response => response.json()).then(data => ltable_ocg = data));
	fetch_list.push(fetch(`text/lflist_tcg.json`).then(response => response.json()).then(data => ltable_tcg = data));
	fetch_list.push(fetch(`text/lflist_md.json`).then(response => response.json()).then(data => ltable_md = data));
}

let id_to_cid = null;
const db_ready = Promise.all(fetch_list)
	.then(() => {
		for (const locale of Object.keys(official_name)) {
			const table1 = new Map(name_table[locale]);
			if (md_table[locale]) {
				for (const [cid, name] of md_table[locale]) {
					table1.set(cid, name);
				}
			}
			complete_name_table[locale] = table1;
		}
		id_to_cid = inverse_mapping(cid_table);
		if (!from_local) {
			try {
				localStorage.setItem("cid_table", JSON.stringify([...cid_table]));
				localStorage.setItem("md_name_jp", JSON.stringify([...md_table['ja']]));
				localStorage.setItem("md_name_en", JSON.stringify([...md_table['en']]));
				localStorage.setItem("md_card_list", JSON.stringify(md_card_list));
				localStorage.setItem("setname", JSON.stringify(setname));
				localStorage.setItem("pack_list", JSON.stringify(pack_list));
				localStorage.setItem("ltable_ocg", JSON.stringify(ltable_ocg));
				localStorage.setItem("ltable_tcg", JSON.stringify(ltable_tcg));
				localStorage.setItem("ltable_md", JSON.stringify(ltable_md));
				localStorage.setItem("last_pack", last_pack);
			}
			catch (e) {
			}
		}
	});
