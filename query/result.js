"use strict";

const MAX_WIDTH = 900;
const MAX_RESULT_LEN = 200;
var result_per_page = 50;
var current_params = null;

function is_booster(pack) {
	if (pack_list[pack] && pack_list[pack][0] === 1)
		return true;
	else if (pack === 'DUNE')
		return true;
	else
		return false;
}

function print_card_number(pack, index) {
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
	let cat = str_pack.substring(0, 2);

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

function print_id(id, type, pack, pack_id) {
	let str_id = id.toString().padStart(8, '0');
	let link_text = '';

	if (type & TYPE_TOKEN) {
		link_text = 'token';
	}
	else if (pack) {
		link_text = print_card_number(pack, pack_id);
	}
	else if (id > 99999999) {
		link_text = print_card_number(pre_id_to_pack(id), pack_id);
	}
	else {
		link_text = str_id;
	}
	return `${link_text}`;
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
 *  is_equal() - case-insensitive equal
 *  @param {string} a
 *  @param {string} b
 */
function is_equal(a, b) {
	return a.toHalfWidth().toLowerCase() === b.toHalfWidth().toLowerCase();
}

function compare_id(a, b) {
	return a.pack_id - b.pack_id;
}

function compare_card() {
	const name = check_str(current_params.get("name"));
	const locale = check_str(current_params.get("locale"));

	return function (a, b) {
		if (locale === 'en') {
			if (a.en_name && is_equal(a.en_name, name)) {
				return -1;
			}
			else if (b.en_name && is_equal(b.en_name, name)) {
				return 1;
			}
			if (a.md_name_en && is_equal(a.md_name_en, name)) {
				return -1;
			}
			else if (b.md_name_en && is_equal(b.md_name_en, name)) {
				return 1;
			}
		}
		else {
			if (is_equal(a.name, name)) {
				return -1;
			}
			else if (is_equal(b.name, name)) {
				return 1;
			}
			else if (a.jp_name && is_equal(a.jp_name, name)) {
				return -1;
			}
			else if (b.jp_name && is_equal(b.jp_name, name)) {
				return 1;
			}
		}

		if (a.color !== b.color) {
			return a.color - b.color;
		}
		else if (a.level !== b.level) {
			return b.level - a.level;
		}
		else {
			return a.name.localeCompare(b.name, 'zh-Hant');
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

function create_rows(card, pack) {
	let row_pic = table_result.insertRow(-1);
	let cell_pic = row_pic.insertCell(-1);
	cell_pic.className = 'pic';
	if (window.innerWidth > MAX_WIDTH) {
		cell_pic.style.width = '30%';
		cell_pic.rowSpan = 2;
		cell_pic.style.borderBottom = '1px solid black';
	}
	else {
		cell_pic.style.width = '35%';
	}
	let img_card = document.createElement('img');
	img_card.className = 'pic';
	if (card.id <= 99999999)
		img_card.src = `https://salix5.github.io/query-data/pics/${card.id}.jpg`;
	else
		img_card.src = `../cdb/pics/${card.id}.jpg`;
	img_card.onerror = imgError;

	if (is_real(card.id, card.type)) {
		let params = new URLSearchParams({ "cid": card.id.toString().padStart(8, '0') });
		let link_id = document.createElement('a');
		link_id.href = `https://salix5.github.io/query/?${params.toString()}`;
		link_id.target = '_blank';
		link_id.appendChild(img_card);
		cell_pic.appendChild(link_id);
	}
	else {
		cell_pic.appendChild(img_card);
	}

	let cell_data = row_pic.insertCell(-1);
	cell_data.className = "data";

	let div_name = document.createElement('div');
	let st = document.createElement('strong');
	st.textContent = card.name;
	div_name.appendChild(st);
	if (card.ot === 2)
		div_name.insertAdjacentHTML('beforeend', '<img src="icon/tcg.png" height="20" width="40">');
	cell_data.appendChild(div_name);

	let div_alias = document.createElement('div');
	div_alias.className = 'minor';

	// db link
	if (!(card.type & TYPE_TOKEN)) {
		let str_link = '';
		let db_url = '';

		if (card.cid) {
			str_link = card.jp_name ? card.jp_name : card.en_name;
			db_url = print_db_link(card.cid, card.ot);
		}
		else if (card.cid === 0) {
			str_link = card.jp_name ? card.jp_name : card.en_name;
			db_url = print_wiki_link(card.id);
		}
		else {
			let pre_pack = pre_id_to_pack(card.id)
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
			str_link = `${str_site}: ${str_pack}`;
			db_url = wiki_link[pre_pack];
		}
		let div_db = document.createElement('div');
		let link_db = document.createElement('a');
		link_db.href = db_url;
		link_db.target = '_blank';
		link_db.rel = 'noreferrer';
		link_db.textContent = str_link;
		div_db.appendChild(link_db);
		div_alias.appendChild(div_db);
		if (card.jp_name && (card.en_name || card.md_name_en)) {
			let div_en = document.createElement('div');
			if (card.en_name)
				div_en.textContent = card.en_name;
			else
				div_en.textContent = `${card.md_name_en} (MD)`;
			div_alias.appendChild(div_en);
		}
	}

	// id
	let div_id = document.createElement('div');
	if (card.cid && card.ot !== 2) {
		let faq_url = `https://www.db.yugioh-card.com/yugiohdb/faq_search.action?ope=4&cid=${card.cid}&request_locale=ja`;
		let link_faq = document.createElement('a');
		link_faq.href = faq_url;
		link_faq.target = '_blank';
		link_faq.rel = 'noreferrer';
		link_faq.textContent = print_id(card.id, card.type, pack, card.pack_id);
		div_id.appendChild(link_faq);
	}
	else {
		div_id.textContent = print_id(card.id, card.type, pack, card.pack_id);
	}
	div_alias.appendChild(div_id);

	// limit
	let lfstr_o = '';
	let lfstr_m = '';
	let seperator = '';
	if (ltable[card.id] !== undefined)
		lfstr_o = `OCG：${print_limit(ltable[card.id])}`;
	if (ltable_md[card.id] !== undefined || (is_released(card) && !card.md_name)) {
		if (ltable_md[card.id] !== undefined) {
			lfstr_m = `MD：${print_limit(ltable_md[card.id])}`;
		}
		else {
			lfstr_m = 'MD：未收錄';
		}
	}
	if (lfstr_o && lfstr_m)
		seperator = ' / ';
	if (lfstr_o || lfstr_m) {
		let div_limit = document.createElement('div');
		div_limit.innerHTML = `${lfstr_o}${seperator}${lfstr_m}`;
		div_alias.appendChild(div_limit);
	}
	cell_data.appendChild(div_alias);

	let mtype = '';
	let subtype = '';
	let lvstr = `\u2605`;
	let data = '';
	if (card.type & TYPE_MONSTER) {
		mtype = '怪獸';
		if (card.type & TYPE_RITUAL)
			subtype = '/儀式';
		else if (card.type & TYPE_FUSION)
			subtype = '/融合';
		else if (card.type & TYPE_SYNCHRO)
			subtype = '/同步';
		else if (card.type & TYPE_XYZ) {
			subtype = '/超量';
			lvstr = `\u2606`;
		}
		else if (card.type & TYPE_LINK) {
			subtype = '/連結';
			lvstr = 'LINK-';
		}
		if (card.type & TYPE_PENDULUM) {
			subtype += '/靈擺';
		}

		// extype
		if (card.type & TYPE_NORMAL)
			subtype += '/通常';
		if (card.type & TYPE_SPIRIT)
			subtype += '/靈魂';
		if (card.type & TYPE_UNION)
			subtype += '/聯合';
		if (card.type & TYPE_DUAL)
			subtype += '/二重';
		if (card.type & TYPE_TUNER)
			subtype += '/協調';
		if (card.type & TYPE_FLIP)
			subtype += '/反轉';
		if (card.type & TYPE_TOON)
			subtype += '/卡通';
		if (card.type & TYPE_SPSUMMON)
			subtype += '/特殊召喚';
		if (card.type & TYPE_EFFECT)
			subtype += '/效果';
		data = '[' + mtype + subtype + ']';
		data = `[${mtype}${subtype}]<br>`;

		data += `${lvstr}${card.level === 0 ? "?" : card.level}`;
		if (card.attribute)
			data += `/${attr_to_str[card.attribute]}`;
		else
			data += '/？';
		if (card.race)
			data += `/${race_to_str[card.race]}族`;
		else
			data += '/？族';
		data += '<br>';

		data += `攻${print_ad(card.atk)}`;
		if (!(card.type & TYPE_LINK)) {
			data += `/守${print_ad(card.def)}`;
		}
		data += '<br>';

		if (card.type & TYPE_PENDULUM) {
			data += `【靈擺刻度：${card.scale}】<br>`;
		}
	}
	else if (card.type & TYPE_SPELL) {
		mtype = '魔法';
		if (card.type & TYPE_QUICKPLAY)
			subtype = '速攻';
		else if (card.type & TYPE_CONTINUOUS)
			subtype = '永續';
		else if (card.type & TYPE_EQUIP)
			subtype = '裝備';
		else if (card.type & TYPE_RITUAL)
			subtype = '儀式';
		else if (card.type & TYPE_FIELD)
			subtype = '場地';
		else
			subtype = '通常';
		data = `[${subtype}${mtype}]<br>`;
	}
	else if (card.type & TYPE_TRAP) {
		mtype = '陷阱';
		if (card.type & TYPE_CONTINUOUS)
			subtype = '永續';
		else if (card.type & TYPE_COUNTER)
			subtype = '反擊';
		else
			subtype = '通常';
		data = `[${subtype}${mtype}]<br>`;
	}

	let row_effect = table_result.insertRow(-1);
	let cell_effect = row_effect.insertCell(-1);
	cell_effect.className = "effect";
	let div_stat = document.createElement('div');
	div_stat.className = 'stat';
	div_stat.innerHTML = `${data}`;
	cell_effect.appendChild(div_stat);

	if (card.type & TYPE_LINK) {
		let marker_text = '';
		for (let marker = LINK_MARKER_TOP_LEFT; marker <= LINK_MARKER_TOP_RIGHT; marker <<= 1) {
			if (card.def & marker)
				marker_text += marker_to_str[marker];
			else
				marker_text += marker_to_str.default;
		}
		marker_text += '<br>';

		if (card.def & LINK_MARKER_LEFT)
			marker_text += marker_to_str[LINK_MARKER_LEFT];
		else
			marker_text += marker_to_str.default;

		marker_text += '<span class="transparent">⬛</span>';

		if (card.def & LINK_MARKER_RIGHT)
			marker_text += marker_to_str[LINK_MARKER_RIGHT];
		else
			marker_text += marker_to_str.default;

		marker_text += '<br>';

		for (let marker = LINK_MARKER_BOTTOM_LEFT; marker <= LINK_MARKER_BOTTOM_RIGHT; marker <<= 1) {
			if (card.def & marker)
				marker_text += marker_to_str[marker];
			else
				marker_text += marker_to_str.default;
		}
		let div_marker = document.createElement("div");
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
	let div_desc = document.createElement('div');
	div_desc.innerHTML = card.desc.replace(/\r\n|&|<|>|"/g, (x) => mapObj[x]);
	cell_effect.appendChild(div_desc);

	if (window.innerWidth <= MAX_WIDTH) {
		cell_effect.colSpan = 2;
	}
}

function show_result(params) {
	table_result.innerHTML = "";
	select_page.innerHTML = "";
	div_page.hidden = true;
	let total_pages = Math.ceil(result.length / result_per_page);
	let page = check_int(params.get("page"));
	let pack = params.get("pack");
	if (pack === "o" || pack === "t" || !is_pack(pack))
		pack = null;
	if (total_pages && page <= total_pages) {
		current_params = params;
		let index_begin = result_per_page * (page - 1);
		let index_end = Math.min(result_per_page * page - 1, result.length - 1);
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
		let row0 = table_result.insertRow(-1);
		let cell0 = row0.insertCell(-1);
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
