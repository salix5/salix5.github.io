"use strict";
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

let pack_list = null;
let ltable_ocg = null;
let ltable_tcg = null;
let ltable_md = null;
fetch_list.push(fetch(`pack/pack_list.json`).then(response => response.json()).then(data => pack_list = data));
fetch_list.push(fetch(`text/lflist.json`).then(response => response.json()).then(data => ltable_ocg = data));
fetch_list.push(fetch(`text/lflist_tcg.json`).then(response => response.json()).then(data => ltable_tcg = data));
fetch_list.push(fetch(`text/lflist_md.json`).then(response => response.json()).then(data => ltable_md = data));
const db_ready = Promise.all(fetch_list);
