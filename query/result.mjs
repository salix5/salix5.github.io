import { link_markers, marker_char, MAX_CARD_ID, MAX_WIDTH, monster_types } from "./ygo-constant.mjs";
import { genesys_point, ltable_md, ltable_ocg, ltable_tcg, keyword, fictional_names, get_pack_name } from "./ygo-json-loader.mjs";
import { print_db_link, print_qa_link } from "./ygo-utility.mjs";
import { print_data } from "./ygo-query.mjs";

const table_result = document.getElementById("table_result");
const div_count = document.getElementById("div_count");
const div_page = document.getElementById("div_page");
const select_page = document.getElementById("select_page");

const mention_set = new Set([
	101306052,
]);

function print_pack_number(pack, card) {
	const pack_name = pack.substring(0, 4);
	const locale = (card.ot === 2) ? 'EN' : 'JP';
	const cat = pack_name.substring(0, 2);
	const index = card.pack_index;
	let str_index = '';

	if (pack_name === 'WPP2' && index > 70) {
		let sub_index = index - 70;
		str_index = `S${sub_index.toString().padStart(2, '0')}`;
	}
	else if (pack_name === 'WPP3' && index > 60) {
		let sub_index = index - 60;
		str_index = `S${sub_index.toString().padStart(2, '0')}`;
	}
	else if ((cat === 'SD' || cat === 'SR') && index > 50) {
		let sub_index = index - 50;
		str_index = `P${sub_index.toString().padStart(2, '0')}`;
	}
	else {
		str_index = index.toString().padStart(3, '0');
	}
	return `${pack_name}-${locale}${str_index}`;
}

/**
 * Print the card id.
 * @param {Card} card 
 * @param {string?} pack 
 * @returns 
 */
function print_id(card, pack) {
	if (card.type & monster_types.TYPE_TOKEN) {
		return 'token';
	}
	if (pack && Object.hasOwn(card, 'pack_index')) {
		return print_pack_number(pack, card);
	}
	if (get_pack_name(card.id)) {
		const ot = (card.ot === 2) ? 'EN' : 'JP';
		const index = (card.id % 1000).toString().padStart(3, '0');
		return `${get_pack_name(card.id)}-${ot}${index}`;
	}
	return card.id.toString().padStart(8, '0');
}

function print_limit(limit) {
	if (!Number.isSafeInteger(limit) || limit < 0 || limit > 2)
		return null;
	const img = document.createElement('img');
	img.src = `icon/${limit}.png`;
	img.height = 18;
	img.width = 18;
	return img;
}

/**
 * Handle image loading error by setting a default image.
 * @param {Event} event 
 */
function imgError(event) {
	event.currentTarget.removeEventListener('error', imgError);
	event.currentTarget.src = "icon/unknown.jpg";
}

function is_mentionable(card) {
	return !(card.type & monster_types.TYPE_TOKEN) && (card.id <= MAX_CARD_ID || mention_set.has(card.id));
}

/**
 * @param {string} str 
 * @returns {boolean}
 */
function is_keyword(str) {
	if (str.length > 25 || str.includes('，') || str.includes('場上'))
		return true;
	return Object.hasOwn(keyword, str);
}

/**
 * @param {string} str 
 * @returns {boolean}
 */
function is_fictional(str) {
	if (str.endsWith('衍生物'))
		return true;
	return Object.hasOwn(fictional_names, str);
}


/**
 * @param {string} name 
 */
function text_link(name) {
	if (is_keyword(name)) {
		return document.createTextNode(name);
	}
	const anchor = document.createElement('a');
	anchor.textContent = name;
	anchor.target = "_blank";
	anchor.rel = "noreferrer";
	if (is_fictional(name)) {
		anchor.href = `./?desc=${encodeURIComponent(name)}`;
		return anchor;
	}
	anchor.href = `./?cardname=${encodeURIComponent(name)}`;
	return anchor;
}

/**
 * @param {Card} card 
 * @param {string?} pack 
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
	const pics_id = card.artid || card.id;
	if (Number.isSafeInteger(pics_id) && pics_id <= MAX_CARD_ID)
		img_card.src = `https://cdn.jsdelivr.net/gh/salix5/query-data@master/pics/${pics_id}.jpg`;
	else
		img_card.src = `icon/unknown.jpg`;
	img_card.addEventListener('error', imgError);

	if (is_mentionable(card)) {
		const params = new URLSearchParams({ "mention": card.id });
		const link_id = document.createElement('a');
		link_id.href = `./?${params.toString()}`;
		link_id.target = '_blank';
		link_id.rel = 'noreferrer';
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
	if (card.ot === 2) {
		const img_tcg = document.createElement('img');
		img_tcg.src = 'icon/tcg.png';
		img_tcg.height = 20;
		img_tcg.width = 40;
		div_name.appendChild(img_tcg);
	}
	cell_data.appendChild(div_name);

	const div_alias = document.createElement('div');
	div_alias.className = 'minor';

	// db link
	if (!(card.type & monster_types.TYPE_TOKEN)) {
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
		else if (get_pack_name(card.id)) {
			link_db_text = 'Yugipedia';
			const ot = (card.ot === 2) ? 'EN' : 'JP';
			const index = (card.id % 1000).toString().padStart(3, '0');
			const card_number = `${get_pack_name(card.id)}-${ot}${index}`;
			db_url = `https://yugipedia.com/wiki/${card_number}`;
		}
		const div_db = document.createElement('div');
		if (db_url) {
			const link_db = document.createElement('a');
			link_db.textContent = link_db_text;
			link_db.href = db_url;
			link_db.target = '_blank';
			link_db.rel = 'noreferrer';
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
			div_md.textContent = `MD：${card.md_rarity}`;
			div_alias.appendChild(div_md);
		}
	}

	// id
	const div_id = document.createElement('div');
	div_id.textContent = print_id(card, pack);
	div_alias.appendChild(div_id);
	if (card.cid && card.ot !== 2) {
		const div_qa = document.createElement('div');
		const link_faq = document.createElement('a');
		link_faq.textContent = 'Q&A';
		link_faq.href = print_qa_link(card.cid);
		link_faq.target = '_blank';
		link_faq.rel = 'noreferrer';
		div_qa.appendChild(link_faq);
		div_alias.appendChild(div_qa);
	}

	// limit
	const limit_ocg = ltable_ocg[card.id] ?? null;
	const limit_tcg = ltable_tcg[card.id] ?? null;
	const limit_md = ltable_md[card.id] ?? null;
	if (limit_ocg !== null || limit_tcg !== null || limit_md !== null) {
		const div_limit = document.createElement('div');
		const img1 = print_limit(limit_ocg);
		if (img1) {
			div_limit.appendChild(document.createTextNode('OCG：'));
			div_limit.appendChild(img1);
		}
		else {
			div_limit.appendChild(document.createTextNode('OCG：-'));
		}
		const img2 = print_limit(limit_tcg);
		if (img2) {
			div_limit.appendChild(document.createTextNode(' / TCG：'));
			div_limit.appendChild(img2);
		}
		else {
			div_limit.appendChild(document.createTextNode(' / TCG：-'));
		}
		const img3 = print_limit(limit_md);
		if (img3) {
			div_limit.appendChild(document.createTextNode(' / MD：'));
			div_limit.appendChild(img3);
		}
		else {
			div_limit.appendChild(document.createTextNode(' / MD：-'));
		}
		div_alias.appendChild(div_limit);
	}
	if (card.cid && genesys_point[card.cid]) {
		const genesys_status = `Genesys：${genesys_point[card.cid]}`;
		const div_genesys = document.createElement('div');
		div_genesys.textContent = genesys_status;
		div_alias.appendChild(div_genesys);
	}
	cell_data.appendChild(div_alias);

	const row_effect = table_result.insertRow(-1);
	const cell_effect = row_effect.insertCell(-1);
	cell_effect.className = "effect";
	const div_stat = document.createElement('div');
	div_stat.className = 'stat';
	for (const line of print_data(card)) {
		const div_line = document.createElement('div');
		div_line.textContent = line;
		div_stat.appendChild(div_line);
	}
	cell_effect.appendChild(div_stat);

	if (card.type & monster_types.TYPE_LINK) {
		const marker1 = document.createElement('div');
		for (let marker = link_markers.LINK_MARKER_TOP_LEFT; marker <= link_markers.LINK_MARKER_TOP_RIGHT; marker <<= 1) {
			if (card.marker & marker)
				marker1.appendChild(document.createTextNode(marker_char[marker]));
			else
				marker1.appendChild(document.createTextNode(marker_char.default));
		}
		cell_effect.appendChild(marker1);

		const marker2 = document.createElement('div');
		if (card.marker & link_markers.LINK_MARKER_LEFT)
			marker2.appendChild(document.createTextNode(marker_char[link_markers.LINK_MARKER_LEFT]));
		else
			marker2.appendChild(document.createTextNode(marker_char.default));

		const center = document.createElement('span');
		center.textContent = marker_char.center;
		center.className = 'transparent';
		marker2.appendChild(center);

		if (card.marker & link_markers.LINK_MARKER_RIGHT)
			marker2.appendChild(document.createTextNode(marker_char[link_markers.LINK_MARKER_RIGHT]));
		else
			marker2.appendChild(document.createTextNode(marker_char.default));
		cell_effect.appendChild(marker2);

		const marker3 = document.createElement('div');
		for (let marker = link_markers.LINK_MARKER_BOTTOM_LEFT; marker <= link_markers.LINK_MARKER_BOTTOM_RIGHT; marker <<= 1) {
			if (card.marker & marker)
				marker3.appendChild(document.createTextNode(marker_char[marker]));
			else
				marker3.appendChild(document.createTextNode(marker_char.default));
		}
		cell_effect.appendChild(marker3);
	}
	cell_effect.appendChild(document.createElement('hr'));

	const div_desc = document.createElement('div');
	const lines = card.text.desc.split('\n');
	if (!(card.type & monster_types.TYPE_NORMAL) || (card.type & monster_types.TYPE_PENDULUM)) {
		const re_mention = /(?<=「)(?!」)[^「」]*「?[^「」]*」?[^「」]*(?=」)/g;
		for (const line of lines) {
			let lastIndex = 0;
			for (const match of line.matchAll(re_mention)) {
				const textBefore = line.substring(lastIndex, match.index);
				div_desc.appendChild(document.createTextNode(textBefore));
				div_desc.appendChild(text_link(match[0]));
				lastIndex = match.index + match[0].length;
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
		}
	}
	cell_effect.appendChild(div_desc);

	if (window.innerWidth <= MAX_WIDTH) {
		cell_effect.colSpan = 2;
	}
}

function verify_card(card) {
	if (!Number.isSafeInteger(card.id))
		return false;
	if (Object.hasOwn(card, 'cid') && !Number.isSafeInteger(card.cid))
		return false;
	if (!Number.isSafeInteger(card.ot))
		return false;
	return true;
}

export function clear_result() {
	div_count.textContent = "";
	table_result.replaceChildren();
	select_page.options.length = 0;
	div_page.hidden = true;
}

const result_per_page = 50;
const null_card = {
	id: -1,
	type: 0,
	text: {
		desc: "",
	},
	tw_name: "null"
};
/**
 * @param {object} response
 */
export function show_result(response) {
	clear_result();
	const result = response.result;
	const total = response.meta.total;
	const page = response.page;
	const total_pages = Math.ceil(total / result_per_page);
	const pack = response.meta.pack ?? null;
	if (total_pages && page <= total_pages) {
		const index_begin = result_per_page * (page - 1);
		const index_end = Math.min(result_per_page * page - 1, total - 1);
		div_count.textContent = `搜尋結果共${total}筆，此為${index_begin + 1}~${index_end + 1}筆。`;
		if (window.innerWidth > MAX_WIDTH)
			table_result.style.border = "1px solid black";
		for (const card of result) {
			if (!verify_card(card)) {
				console.error("Invalid card data:", card);
				create_rows(null_card, null);
				continue;
			}
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
