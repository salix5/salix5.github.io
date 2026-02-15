"use strict";
const last_pack = "BLZD#6";

function object_to_map(obj) {
	const map = new Map();
	for (const [key, value] of Object.entries(obj))
		map.set(Number.parseInt(key, 10), value);
	return map;
}

const fetch_list = [];

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

let replace_name = null;
let pre_release = null;
let wiki_link = null;
fetch_list.push(fetch(`text/replace_name.json`).then(response => response.json()).then(data => replace_name = data));
fetch_list.push(fetch(`pack/pre_release.json`).then(response => response.json()).then(data => pre_release = data));
fetch_list.push(fetch(`pack/wiki_link.json`).then(response => response.json()).then(data => wiki_link = data));

// local
let pack_list = null;
let ltable_ocg = null;
let ltable_tcg = null;
let ltable_md = null;
try {
	if (localStorage.getItem("last_pack") === last_pack) {
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
const from_local = pack_list && ltable_ocg && ltable_tcg && ltable_md;
if (!from_local) {
	fetch_list.push(fetch(`pack/pack_list.json`).then(response => response.json()).then(data => pack_list = data));
	fetch_list.push(fetch(`text/lflist.json`).then(response => response.json()).then(data => ltable_ocg = data));
	fetch_list.push(fetch(`text/lflist_tcg.json`).then(response => response.json()).then(data => ltable_tcg = data));
	fetch_list.push(fetch(`text/lflist_md.json`).then(response => response.json()).then(data => ltable_md = data));
}

const db_ready = Promise.all(fetch_list)
	.then(() => {
		if (!from_local) {
			try {
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
