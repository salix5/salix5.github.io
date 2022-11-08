"use strict";

const MAX_WIDTH = 900;
const MAX_RESULT_LEN = 200;
var result_per_page = 100;
var current_params = null;

function is_booster(pack) {
	if (pack_list[pack] && pack_list[pack][0] === 1)
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
	let cat = str_pack.substr(0, 2);

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

function print_db_link(id, ot, cid) {
	switch (id) {
		case 68811206:
			return 'https://yugipedia.com/wiki/68811206';
		default:
			let url = `https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=${cid}`;
			let locale = 'ja';
			if (ot === 2)
				locale = 'en';
			return url + `&request_locale=${locale}`;
	}
}

function print_limit(limit) {
	if (limit === 0)
		return '<img src="icon/0.png" height="20" width="20">';
	else if (limit === 1)
		return '<img src="icon/1.png" height="20" width="20">';
	else if (limit === 2)
		return '<img src="icon/2.png" height="20" width="20">';
	else
		return '';
}

function compare_id(a, b) {
	return a.pack_id - b.pack_id;
}

function compare_type(a, b) {
	let name = check_str(current_params.get("name"));
	let jp_name = name.toHalfWidth();
	let en_name = name.toLowerCase();
	if (a.name === name) {
		return -1;
	}
	else if (b.name === name) {
		return 1;
	}
	else if (a.jp_name && a.jp_name.toHalfWidth() === jp_name) {
		return -1;
	}
	else if (b.jp_name && b.jp_name.toHalfWidth() === jp_name) {
		return 1;
	}
	else if (a.en_name && a.en_name.toLowerCase() === en_name) {
		return -1;
	}
	else if (b.en_name && b.en_name.toLowerCase() === en_name) {
		return 1;
	}
	else if (a.color !== b.color) {
		return a.color - b.color;
	}
	else if (a.level && b.level && a.level !== b.level) {
		return b.level - a.level;
	}
	else {
		return a.name.localeCompare(b.name);
	}
}

function imgError(event) {
	this.onerror = null;
	this.src = "icon/unknown.jpg";
}

function pre_id_to_pack(id) {
	for (const prop in pre_release) {
		if (id >= pre_release[prop] && id <= pre_release[prop] + 998)
			return prop;
	}
	return 'XXXX';
}

function create_rows(card, pack) {
	let card_name = '';
	let card_alias = '';
	card_name = `<strong>${card.name}</strong>${print_limit(card.limit)}`;
	if (card.ot === 2)
		card_name += '<img src="icon/tcg.png" height="20" width="40">';
	// db link
	if (!(card.type & TYPE_TOKEN)) {
		let link_text = '';
		let db_url = '';
		let pre_pack = '';

		if (card.id <= 99999999) {
			link_text = card.jp_name;
			db_url = print_db_link(card.id, card.ot, card.cid);
		}
		else if (pre_pack = pre_id_to_pack(card.id)) {
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
			link_text = `${str_site}: ${str_pack}`;
			db_url = wiki_link[pre_pack];
		}
		if (link_text)
			card_alias = `<a href="${db_url}" target="_blank" rel="noreferrer">${link_text}</a><br>`;
		if (card.en_name && !(card.ot === 2 && card.en_name === card.jp_name))
			card_alias += `${card.en_name}<br>`;
	}
	if (card.cid && card.ot !== 2) {
		let faq_url = `https://www.db.yugioh-card.com/yugiohdb/faq_search.action?ope=4&cid=${card.cid}&request_locale=ja`;
		card_alias += `<a href="${faq_url}" target="_blank" rel="noreferrer">${print_id(card.id, card.type, pack, card.pack_id)}</a><br>`;
	}
	else {
		card_alias += `${print_id(card.id, card.type, pack, card.pack_id)}<br>`;
	}

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
	cell_pic.appendChild(img_card);

	let cell_data = row_pic.insertCell(-1);
	cell_data.className = "data";

	let mtype = '';
	let subtype = '';
	let lvstr = `\u2605`;
	let marker = '';
	let data = '';

	cell_data.innerHTML = card_name;
	let div_alias = document.createElement('div');
	div_alias.className = 'minor';
	div_alias.innerHTML = card_alias;
	cell_data.appendChild(div_alias);

	if (card.type & TYPE_LINK) {
		let card_marker = document.createElement("div");
		card_marker.className = "marker";
		if (card.def & LINK_MARKER_TOP_LEFT)
			marker += '<span class="ul t">▲</span>';
		else
			marker += '<span class="ul f">△</span>';
		if (card.def & LINK_MARKER_TOP)
			marker += '<span class="t">▲</span>';
		else
			marker += '<span class="f">△</span>';
		if (card.def & LINK_MARKER_TOP_RIGHT)
			marker += '<span class="ur t">▲</span>';
		else
			marker += '<span class="ur f">△</span>';

		marker += '<br>';
		if (card.def & LINK_MARKER_LEFT)
			marker += '<span class="l t">▲</span>';
		else
			marker += '<span class="l f">△</span>';
		marker += '<span class="transparent">△</span>';
		if (card.def & LINK_MARKER_RIGHT)
			marker += '<span class="r t">▲</span>';
		else
			marker += '<span class="r f">△</span>';
		marker += '<br>';

		if (card.def & LINK_MARKER_BOTTOM_LEFT)
			marker += '<span class="dl t">▲</span>';
		else
			marker += '<span class="dl f">△</span>';
		if (card.def & LINK_MARKER_BOTTOM)
			marker += '<span class="d t">▲</span>';
		else
			marker += '<span class="d f">△</span>';
		if (card.def & LINK_MARKER_BOTTOM_RIGHT)
			marker += '<span class="dr t">▲</span>';
		else
			marker += '<span class="dr f">△</span>';
		card_marker.innerHTML = marker;
		cell_data.appendChild(card_marker);
	}

	let div_stat = document.createElement('div');
	div_stat.className = 'stat';

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
	div_stat.innerHTML = `${data}<br>`;
	cell_effect.appendChild(div_stat);

	let div_desc = document.createElement('div');
	div_desc.innerHTML = card.desc.replace(/\n/g, "<br>");
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
	if (pack === "o" || pack === "t")
		pack = null;
	if (total_pages && page <= total_pages) {
		current_params = params;
		let index_begin = result_per_page * (page - 1);
		let index_end = Math.min(result_per_page * page - 1, result.length - 1);
		if (pack)
			result.sort(compare_id);
		else
			result.sort(compare_type);
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
