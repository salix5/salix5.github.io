"use strict";
// cleanup localStorage
// TODO: remove this after all users have updated to the new version
localStorage.clear();
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

const replace_name = Object.create(null);
const pre_release = Object.create(null);
const wiki_link = Object.create(null);
fetch_list.push(fetch(`text/replace_name.json`).then(response => response.json()).then(data => Object.assign(replace_name, data)));
fetch_list.push(fetch(`pack/pre_release.json`).then(response => response.json()).then(data => Object.assign(pre_release, data)));
fetch_list.push(fetch(`pack/wiki_link.json`).then(response => response.json()).then(data => Object.assign(wiki_link, data)));

const pack_list = Object.create(null);
const ltable_ocg = Object.create(null);
const ltable_tcg = Object.create(null);
const ltable_md = Object.create(null);
fetch_list.push(fetch(`pack/pack_list.json`).then(response => response.json()).then(data => Object.assign(pack_list, data)));
fetch_list.push(fetch(`text/lflist.json`).then(response => response.json()).then(data => Object.assign(ltable_ocg, data)));
fetch_list.push(fetch(`text/lflist_tcg.json`).then(response => response.json()).then(data => Object.assign(ltable_tcg, data)));
fetch_list.push(fetch(`text/lflist_md.json`).then(response => response.json()).then(data => Object.assign(ltable_md, data)));
const db_ready = Promise.all(fetch_list);
