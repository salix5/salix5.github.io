"use strict";
const MAX_RESULT_LEN = 200;
var result_per_page = 50;
var current_params = null;

function is_booster(pack) {
	if (pack_list[pack] && pack_list[pack][82] === 1)
		return true;
	else
		return false;
}

function print_pack_number(pack, index) {
	let str_pack = '';
	let str_ot = '';
	let str_index = '';

	// ot
	if (pack.charAt(0) === '_') {
		str_pack = pack.substring(1);
		str_ot = 'EN';
	}
	else {
		str_pack = pack;
		str_ot = 'JP';
	}
	const cat = str_pack.substring(0, 2);

	// index
	if (pack === 'WPP2' && index > 70) {
		let sub_index = index - 70;
		str_index = `S${sub_index.toString().padStart(2, '0')}`;
	}
	else if (pack === 'WPP3' && index > 60) {
		let sub_index = index - 60;
		str_index = `S${sub_index.toString().padStart(2, '0')}`;
	}
	else if ((cat === 'SD' || cat === 'SR') && index > 50) {
		let sub_index = index - 50;
		str_index = `P${sub_index.toString().padStart(2, '0')}`;
	}
	else if (is_booster(pack) && index > 80) {
		let sub_index = index - 80;
		str_index = `S${sub_index.toString().padStart(2, '0')}`;
	}
	else if (pack === 'VJMP' || cat === 'SL') {
		str_index = index.toString().padStart(3, '0');
	}
	else if (index === null || index > 200) {
		str_index = '???';
	}
	else {
		str_index = index.toString().padStart(3, '0');
	}
	return `${str_pack}-${str_ot}${str_index}`;
}

/**
 * Print the card id.
 * @param {Card} card 
 * @param {string} pack 
 * @returns 
 */
function print_id(card, pack) {
	const str_id = card.id.toString().padStart(8, '0');
	let link_text = '';

	if (card.type & TYPE_TOKEN) {
		link_text = 'token';
	}
	else if (pack && 'pack_index' in card) {
		link_text = print_pack_number(pack, card.pack_index);
	}
	else if (card.id > 99999999) {
		link_text = print_pack_number(pre_id_to_pack(card.id), card.pack_index);
	}
	else {
		link_text = str_id;
	}
	return link_text;
}

function print_ad(x) {
	if (x === -2)
		return '?';
	else
		return x;
}

function print_limit(limit) {
	if (limit === 0)
		return '<img src="icon/0.png" height="18" width="18">';
	else if (limit === 1)
		return '<img src="icon/1.png" height="18" width="18">';
	else if (limit === 2)
		return '<img src="icon/2.png" height="18" width="18">';
	else
		return '';
}

/**
 * case-insensitive equal
 * @param {string} a 
 * @param {string} b 
 * @returns 
 */
function is_equal(a, b) {
	return toHalfWidth(a.toLowerCase()) === toHalfWidth(b.toLowerCase());
}

/**
 * @param {Card} a 
 * @param {Card} b 
 * @returns 
 */
function compare_id(a, b) {
	return a.pack_index - b.pack_index;
}

function compare_card() {
	const name = check_text(current_params, "cname");
	const locale = check_text(current_params, "locale");
	const zh_collator = new Intl.Collator('zh-Hant');

	return function (a, b) {
		if (locale === 'en') {
			const match1 = (a.en_name && is_equal(a.en_name, name)) || (a.md_name_en && is_equal(a.md_name_en, name));
			const match2 = (b.en_name && is_equal(b.en_name, name)) || (b.md_name_en && is_equal(b.md_name_en, name));
			if (match1 && match2)
				return 0;
			else if (match1)
				return -1;
			else if (match2)
				return 1;
		}
		else {
			const match1 = (a.jp_name && is_equal(a.jp_name, name)) || (a.md_name_jp && is_equal(a.md_name_jp, name));
			const match2 = (b.jp_name && is_equal(b.jp_name, name)) || (b.md_name_jp && is_equal(b.md_name_jp, name));
			if (is_equal(a.tw_name, name) && is_equal(b.tw_name, name))
				return 0;
			else if (is_equal(a.tw_name, name))
				return -1;
			else if (is_equal(b.tw_name, name))
				return 1;
			else if (match1 && match2)
				return 0;
			else if (match1)
				return -1;
			else if (match2)
				return 1;
		}

		if (a.color !== b.color) {
			return a.color - b.color;
		}
		else if (a.level !== b.level) {
			return b.level - a.level;
		}
		else {
			return zh_collator.compare(a.tw_name, b.tw_name);
		}
	}
}


function imgError(event) {
	this.onerror = null;
	this.src = "icon/unknown.jpg";
}

function pre_id_to_pack(id) {
	for (const [key, value] of Object.entries(pre_release)) {
		if (id >= value && id <= value + 998)
			return key;
	}
	return 'XXXX';
}

function is_real(id, type) {
	return id <= 99999999 && !(type & TYPE_TOKEN);
}

/**
 * @param {Card} card 
 * @param {string} pack 
 */
function create_rows(card, pack) {
	const row_pic = table_result.insertRow(-1);
	const cell_pic = row_pic.insertCell(-1);
	cell_pic.className = 'pic';
	if (window.innerWidth > MAX_WIDTH) {
		cell_pic.style.width = '30%';
		cell_pic.rowSpan = 2;
		cell_pic.style.borderBottom = '1px solid black';
	}
	else {
		cell_pic.style.width = '35%';
	}
	const img_card = document.createElement('img');
	img_card.className = 'pic';
	if (card.id <= 99999999)
		img_card.src = `https://salix5.github.io/query-data/pics/${card.id}.jpg`;
	else
		img_card.src = `../cdb/expansions/pics/${card.id}.jpg`;
	img_card.onerror = imgError;

	if (is_real(card.id, card.type)) {
		const params = new URLSearchParams({ "code": card.id.toString().padStart(8, '0') });
		const link_id = document.createElement('a');
		link_id.href = `https://salix5.github.io/query/?${params.toString()}`;
		link_id.target = '_blank';
		link_id.appendChild(img_card);
		cell_pic.appendChild(link_id);
	}
	else {
		cell_pic.appendChild(img_card);
	}

	const cell_data = row_pic.insertCell(-1);
	cell_data.className = "data";

	const div_name = document.createElement('div');
	const st = document.createElement('strong');
	st.textContent = card.tw_name;
	div_name.appendChild(st);
	if (card.ot === 2)
		div_name.insertAdjacentHTML('beforeend', '<img src="icon/tcg.png" height="20" width="40">');
	cell_data.appendChild(div_name);

	const div_alias = document.createElement('div');
	div_alias.className = 'minor';

	// db link
	if (!(card.type & TYPE_TOKEN)) {
		let link_db_text = '';
		let db_url = '';

		if (card.cid) {
			if (card.jp_name)
				link_db_text = card.jp_name;
			else if (card.md_name_jp)
				link_db_text = `${card.md_name_jp}`;
			else
				link_db_text = card.en_name;
			const request_locale = (card.ot === 2) ? 'en' : 'ja';
			db_url = print_db_link(card.cid, request_locale);
		}
		else if (card.cid === 0) {
			link_db_text = card.en_name;
			db_url = print_yp_link(card.id);
		}
		else {
			const pre_pack = pre_id_to_pack(card.id)
			let str_site = '';
			let str_pack = '';
			if (pre_pack.charAt(0) === '_') {
				str_site = 'Yugipedia';
				str_pack = pre_pack.substring(1);
			}
			else {
				str_site = 'Wiki';
				str_pack = pre_pack;
			}
			link_db_text = `${str_site}: ${str_pack}`;
			if (wiki_link[pre_pack])
				db_url = wiki_link[pre_pack];
		}
		const div_db = document.createElement('div');
		if (db_url) {
			const link_db = document.createElement('a');
			link_db.href = db_url;
			link_db.target = '_blank';
			link_db.rel = 'noreferrer nofollow';
			link_db.textContent = link_db_text;
			div_db.appendChild(link_db);
		}
		else {
			div_db.textContent = link_db_text;
		}
		div_alias.appendChild(div_db);
		if ((card.jp_name || card.md_name_jp) && (card.en_name || card.md_name_en)) {
			const div_en = document.createElement('div');
			if (card.en_name)
				div_en.textContent = card.en_name;
			else
				div_en.textContent = `${card.md_name_en}  (MD)`;
			div_alias.appendChild(div_en);
		}
		if (card.md_rarity) {
			const div_md = document.createElement('div');
			div_md.textContent = `MD：${rarity[card.md_rarity]}`;
			div_alias.appendChild(div_md);
		}
	}

	// id
	const div_id = document.createElement('div');
	div_id.textContent = print_id(card, pack);
	div_alias.appendChild(div_id);
	if (card.cid && card.ot !== 2) {
		const div_qa = document.createElement('div');
		const faq_url = `https://www.db.yugioh-card.com/yugiohdb/faq_search.action?ope=4&cid=${card.cid}&request_locale=ja`;
		const link_faq = document.createElement('a');
		link_faq.href = faq_url;
		link_faq.target = '_blank';
		link_faq.rel = 'noreferrer nofollow';
		link_faq.textContent = 'Q&A';
		div_qa.appendChild(link_faq);
		div_alias.appendChild(div_qa);
	}

	// limit
	let lfstr_ocg = '';
	let lfstr_tcg = '';
	let lfstr_md = '';
	if (ltable_ocg[card.real_id] !== undefined)
		lfstr_ocg = `OCG：${print_limit(ltable_ocg[card.real_id])}`;
	else
		lfstr_ocg = `OCG：-`;
	if (ltable_tcg[card.real_id] !== undefined)
		lfstr_tcg = `TCG：${print_limit(ltable_tcg[card.real_id])}`;
	else
		lfstr_tcg = `TCG：-`;
	if (ltable_md[card.real_id] !== undefined)
		lfstr_md = `MD：${print_limit(ltable_md[card.real_id])}`;
	else
		lfstr_md = `MD：-`;
	if (ltable_ocg[card.real_id] !== undefined || ltable_tcg[card.real_id] !== undefined || ltable_md[card.real_id] !== undefined) {
		const div_limit = document.createElement('div');
		div_limit.innerHTML = `${lfstr_ocg} / ${lfstr_tcg} / ${lfstr_md}`;
		div_alias.appendChild(div_limit);
	}
	cell_data.appendChild(div_alias);

	const row_effect = table_result.insertRow(-1);
	const cell_effect = row_effect.insertCell(-1);
	cell_effect.className = "effect";
	const div_stat = document.createElement('div');
	div_stat.className = 'stat';
	div_stat.innerHTML = `${print_data(card, '<br>')}`;
	cell_effect.appendChild(div_stat);

	if (card.type & TYPE_LINK) {
		let marker_text = '';
		for (let marker = LINK_MARKER_TOP_LEFT; marker <= LINK_MARKER_TOP_RIGHT; marker <<= 1) {
			if (card.def & marker)
				marker_text += marker_char[marker];
			else
				marker_text += marker_char.default;
		}
		marker_text += '<br>';

		if (card.def & LINK_MARKER_LEFT)
			marker_text += marker_char[LINK_MARKER_LEFT];
		else
			marker_text += marker_char.default;

		marker_text += '<span class="transparent">⬛</span>';

		if (card.def & LINK_MARKER_RIGHT)
			marker_text += marker_char[LINK_MARKER_RIGHT];
		else
			marker_text += marker_char.default;

		marker_text += '<br>';

		for (let marker = LINK_MARKER_BOTTOM_LEFT; marker <= LINK_MARKER_BOTTOM_RIGHT; marker <<= 1) {
			if (card.def & marker)
				marker_text += marker_char[marker];
			else
				marker_text += marker_char.default;
		}
		const div_marker = document.createElement("div");
		div_marker.innerHTML = marker_text;
		cell_effect.appendChild(div_marker);
	}
	cell_effect.appendChild(document.createElement('hr'));

	const mapObj = Object.create(null);
	mapObj['\r\n'] = '<br>';
	mapObj['&'] = '&amp;';
	mapObj['<'] = '&lt;';
	mapObj['>'] = '&gt;';
	mapObj['"'] = '&quot;';
	const div_desc = document.createElement('div');
	div_desc.innerHTML = card.desc.replace(/\r\n|&|<|>|"/g, (x) => mapObj[x]);
	cell_effect.appendChild(div_desc);

	if (window.innerWidth <= MAX_WIDTH) {
		cell_effect.colSpan = 2;
	}
}

/**
 * @param {URLSearchParams} params 
 * @param {Card[]} result 
 */
function show_result(params, result) {
	table_result.innerHTML = "";
	select_page.innerHTML = "";
	div_page.hidden = true;
	const total_pages = Math.ceil(result.length / result_per_page);
	const page = params.get("page") ? Number.parseInt(params.get("page"), 10) : 1;
	let pack = params.get("pack");
	if (pack === "o" || pack === "t" || !is_pack(pack))
		pack = null;
	if (total_pages && page <= total_pages) {
		current_params = params;
		const index_begin = result_per_page * (page - 1);
		const index_end = Math.min(result_per_page * page - 1, result.length - 1);
		if (pack)
			result.sort(compare_id);
		else
			result.sort(compare_card());
		div_count.textContent = `搜尋結果共${result.length}筆，此為${index_begin + 1}~${index_end + 1}筆。`;
		div_count.hidden = false;
		if (window.innerWidth > MAX_WIDTH)
			table_result.style.border = "1px solid black";
		for (let i = index_begin; i <= index_end; ++i) {
			create_rows(result[i], pack);
		}
		if (total_pages > 1) {
			for (let i = 1; i <= total_pages; ++i) {
				select_page.add(new Option(`第${i}頁`));
			}
			select_page.selectedIndex = page - 1;
			div_page.hidden = false;
		}
	}
	else {
		current_params = null;
		const row0 = table_result.insertRow(-1);
		const cell0 = row0.insertCell(-1);
		table_result.style.border = "1px solid black";
		cell0.textContent = "沒有符合搜尋的項目。";
	}
}

select_page.onchange = (event) => {
	if (current_params) {
		current_params.set("page", select_page.selectedIndex + 1);
		window.location.search = '?' + current_params.toString();
	}
};
