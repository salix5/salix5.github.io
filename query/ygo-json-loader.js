"use strict";
const last_pack = "QCCU#4";

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

let cid_table = null
const name_table = Object.create(null);
const md_table = Object.create(null);
const complete_name_table = Object.create(null);

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
const db_ready = Promise.all(fetch_list)
	.then(() => {
		cid_table = new Map(cid_entries);
		name_table['ja'] = new Map(jp_entries);
		name_table['en'] = new Map(en_entries);
		for (const locale of Object.keys(official_name)) {
			const table1 = new Map(name_table[locale]);
			if (md_table[locale]) {
				for (const [cid, name] of md_table[locale]) {
					table1.set(cid, name);
				}
			}
			complete_name_table[locale] = table1;
		}
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
