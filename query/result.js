"use strict";
const result_per_page = 50;

function is_booster(pack) {
	if (pack_list[pack] && pack_list[pack][82] === -1)
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

function pre_id_to_pack(id) {
	for (const [key, value] of Object.entries(pre_release)) {
		if (id >= value && id <= value + 998)
			return key;
	}
	return 'XXXX';
}

function print_pre_id(id) {
	const index = id % 1000;
	return print_pack_number(pre_id_to_pack(id), index);
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
		link_text = print_pre_id(card.id);
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
 * Handle image loading error by setting a default image.
 * @param {Event} event 
 */
function imgError(event) {
	event.currentTarget.onerror = null;
	event.currentTarget.src = "icon/unknown.jpg";
}

function is_mentioned(id, type) {
	return !(type & TYPE_TOKEN) && id <= MAX_CARD_ID;
}

/**
 * @param {string} name 
 */
function text_link(name) {
	if (name.length > 30 || replace_name[name] === null) {
		return document.createTextNode(name);
	}

	const anchor = document.createElement('a');
	anchor.target = "_blank";
	anchor.textContent = name;
	if (name.endsWith('衍生物')) {
		anchor.href = `./?desc=${encodeURIComponent(name)}`;
	}
	else {
		const queryName = replace_name[name] ? replace_name[name] : name;
		anchor.href = `./?cardname=${encodeURIComponent(queryName)}`;
	}
	return anchor;
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
		img_card.src = `https://salix5.github.io/query-data/pics/${card.artid ? card.artid : card.id}.jpg`;
	else
		img_card.src = `../cdb/expansions/pics/${card.id}.jpg`;
	img_card.addEventListener('error', imgError);

	if (is_mentioned(card.id, card.type)) {
		const params = new URLSearchParams({ "mention": card.id });
		const link_id = document.createElement('a');
		link_id.href = `./?${params.toString()}`;
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
			link_db.rel = 'noreferrer';
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
		const faq_url = print_qa_link(card.cid);
		const link_faq = document.createElement('a');
		link_faq.href = faq_url;
		link_faq.target = '_blank';
		link_faq.rel = 'noreferrer';
		link_faq.textContent = 'Q&A';
		div_qa.appendChild(link_faq);
		div_alias.appendChild(div_qa);
	}

	// limit
	let lfstr_ocg = '';
	let lfstr_tcg = '';
	let lfstr_md = '';
	let show_lflist = false;
	if (Number.isSafeInteger(ltable_ocg[card.id])) {
		lfstr_ocg = `OCG：${print_limit(ltable_ocg[card.id])}`;
		show_lflist = true;
	}
	else {
		lfstr_ocg = `OCG：-`;
	}
	if (Number.isSafeInteger(ltable_tcg[card.id])) {
		lfstr_tcg = `TCG：${print_limit(ltable_tcg[card.id])}`;
		show_lflist = true;
	}
	else {
		lfstr_tcg = `TCG：-`;
	}
	if (Number.isSafeInteger(ltable_md[card.id])) {
		lfstr_md = `MD：${print_limit(ltable_md[card.id])}`;
		show_lflist = true;
	}
	else {
		lfstr_md = `MD：-`;
	}
	if (show_lflist) {
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
			if (card.marker & marker)
				marker_text += marker_char[marker];
			else
				marker_text += marker_char.default;
		}
		marker_text += '<br>';

		if (card.marker & LINK_MARKER_LEFT)
			marker_text += marker_char[LINK_MARKER_LEFT];
		else
			marker_text += marker_char.default;

		marker_text += '<span class="transparent">⬜</span>';

		if (card.marker & LINK_MARKER_RIGHT)
			marker_text += marker_char[LINK_MARKER_RIGHT];
		else
			marker_text += marker_char.default;

		marker_text += '<br>';

		for (let marker = LINK_MARKER_BOTTOM_LEFT; marker <= LINK_MARKER_BOTTOM_RIGHT; marker <<= 1) {
			if (card.marker & marker)
				marker_text += marker_char[marker];
			else
				marker_text += marker_char.default;
		}
		const div_marker = document.createElement("div");
		div_marker.innerHTML = marker_text;
		cell_effect.appendChild(div_marker);
	}
	cell_effect.appendChild(document.createElement('hr'));

	const div_desc = document.createElement('div');
	const lines = card.text.desc.split('\n');
	if (!(card.type & TYPE_NORMAL) || (card.type & TYPE_PENDULUM)) {
		for (const line of lines) {
			const regex = /(?<=「)[^「」]*「?[^「」]*」?[^「」]*(?=」)/g;
			let lastIndex = 0;
			let match;
			while ((match = regex.exec(line)) !== null) {
				const textBefore = line.substring(lastIndex, match.index);
				div_desc.appendChild(document.createTextNode(textBefore));
				div_desc.appendChild(text_link(match[0]));
				lastIndex = regex.lastIndex;
			}
			const textAfter = line.substring(lastIndex);
			div_desc.appendChild(document.createTextNode(textAfter));
			div_desc.appendChild(document.createElement('br'));
		};
	}
	else {
		for (const line of lines) {
			div_desc.appendChild(document.createTextNode(line));
			div_desc.appendChild(document.createElement('br'));
		};
	}
	cell_effect.appendChild(div_desc);

	if (window.innerWidth <= MAX_WIDTH) {
		cell_effect.colSpan = 2;
	}
}

function reset_result() {
	div_count.textContent = "";
	table_result.innerHTML = "";
	select_page.options.length = 0;
	div_page.hidden = true;
}

/**
 * @param {object} response
 */
function show_result(response) {
	reset_result();
	const result = response.result;
	const total = response.meta.total;
	const page = response.page;
	const total_pages = Math.ceil(total / result_per_page);
	const pack = response.meta.pack;
	if (total_pages && page <= total_pages) {
		const index_begin = result_per_page * (page - 1);
		const index_end = Math.min(result_per_page * page - 1, total - 1);
		div_count.textContent = `搜尋結果共${total}筆，此為${index_begin + 1}~${index_end + 1}筆。`;
		if (window.innerWidth > MAX_WIDTH)
			table_result.style.border = "1px solid black";
		for (const card of result) {
			create_rows(card, pack);
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
		div_count.textContent = "沒有符合搜尋的項目。";
	}
	div_count.scrollIntoView();
}
