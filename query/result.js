"use strict";

function print_id(id, type){
	let pre_id = id % 1000;
	let str_id = id.toString().padStart(8, '0');
	let params = new URLSearchParams();
	params.set('id', str_id);
	
	let url = `https://salix5.github.io/query/?${params.toString()}`;
	let link_text = '';
	let pack_name = '';
	let pack_id = '';
	
	if(pre_id <= 100)
		pack_id = pre_id.toString().padStart(3, '0');
	else
		pack_id = '???';
	
	if(type & TYPE_TOKEN){
		link_text = 'null';
		return `<a href="${url}" target="_blank" rel="noreferrer">${link_text}</a>`;
	}
	else if(id >= 101105001 && id <= 101105999){
		pack_name = 'DAMA-JP';
		link_text = `${pack_name}${pack_id}`;
		return `<a href="${url}" target="_blank" rel="noreferrer">${link_text}</a>`;
	}
	else if(id >= 100341001 && id <= 100341999){
		pack_name = 'SD41-JP';
		link_text = `${pack_name}${pack_id}`;
		return `<a href="${url}" target="_blank" rel="noreferrer">${link_text}</a>`;
	}
	else{
		link_text = str_id;
		return `<a href="${url}" target="_blank" rel="noreferrer">${link_text}</a>`;
	}
}

function print_ad(x){
	if(x == -2)
		return '?';
	else
		return x;
}

function print_link(id, ot, db_id){
	switch(id){
		case 68811206:
			return 'https://yugipedia.com/wiki/68811206';
		default:
			let url = `https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=${db_id}`
			let locale = '';
			if(ot == 2){
				locale = 'en';
				return url + `&request_locale=${locale}`;
			}
			else{
				locale = 'ja';
				return url + `&request_locale=${locale}`;
			}
	}
}

function print_limit(limit){
	if(limit == 0)
		return '<img src="icon/0.png" height="20" width="20">';
	else if(limit == 1)
		return '<img src="icon/1.png" height="20" width="20">';
	else if(limit == 2)
		return '<img src="icon/2.png" height="20" width="20">';
	else
		return '';
}

function compare_id(a, b){
	return a.id - b.id;
}

function compare_name(a, b){
	return a.name.localeCompare(b.name);
}

function imgError(event) {
	this.onerror = null;
	this.src = 'https://salix5.github.io/CardEditor/textures/unknown.jpg';
}

function create_rows(card){
	var row_name = table_result.insertRow(-1);
	var cell_name = row_name.insertCell(-1);
	var out_name = '';
	
	cell_name.className = 'name';
	cell_name.colSpan = 2;
	out_name = `<strong>${card.name}</strong>${print_limit(card.limit)}`;
	if(card.ot == 2)
		out_name += '<img src="icon/tcg.png" height="20" width="40">';
	if(card.id <= 99999999 && !(card.type & TYPE_TOKEN)){
		let str_class ='';
		if(window.innerWidth > MAX_WIDTH)
			str_class = '';
		else
			str_class = ` class="mobile"`;
		out_name += `<br><a${str_class} href="${print_link(card.id, card.ot, card.db_id)}" target="_blank" rel="noreferrer">${card.jp_name}</a>`;
	}
	cell_name.innerHTML = out_name;
	
	var row_pic = table_result.insertRow(-1);
	var cell_pic = row_pic.insertCell(-1);
	cell_pic.className = 'pic';
	if(window.innerWidth > MAX_WIDTH){
		cell_pic.style.width = '30%';
		cell_pic.rowSpan = 2;
		cell_pic.style.borderBottom = '1px solid black';
	}
	else{
		cell_pic.style.width = '50%';
	}
	var img_card = document.createElement('img');
	img_card.className = 'pic';
	if(card.id <= 99999999)
		img_card.src = `https://salix5.github.io/CardEditor/pics/${card.id}.jpg`;
	else
		img_card.src = `https://salix5.github.io/CardEditor/expansions/pics/${card.id}.jpg`;
	img_card.onerror = imgError;
	cell_pic.appendChild(img_card);
	
	var cell_data = row_pic.insertCell(-1);
	cell_data.className = "data";
	
	var mtype = '';
	var subtype = '';
	var lvstr = '等級';
	var marker = '';
	var data = '';
	var output_data = '';
	output_data += `ID: ${print_id(card.id, card.type)}<br><br>`;
	
	if(card.type & TYPE_MONSTER){
		mtype = '怪獸';
		if(card.type & TYPE_RITUAL)
			subtype = '/儀式';
		else if(card.type & TYPE_FUSION)
			subtype = '/融合';
		else if(card.type & TYPE_SYNCHRO)
			subtype = '/同步';
		else if(card.type & TYPE_XYZ){
			subtype = '/超量';
			lvstr = '階級';
		}
		else if(card.type & TYPE_LINK){
			subtype = '/連結';
			lvstr = 'LINK-';
		}
		if(card.type & TYPE_PENDULUM){
			subtype += '/靈擺';
		}
		
		// extype
		if(card.type & TYPE_NORMAL)
			subtype += '/通常';
		if(card.type & TYPE_SPIRIT)
			subtype += '/靈魂';
		if(card.type & TYPE_UNION)
			subtype += '/聯合';
		if(card.type & TYPE_DUAL)
			subtype += '/二重';
		if(card.type & TYPE_TUNER)
			subtype += '/協調';
		if(card.type & TYPE_FLIP)
			subtype += '/反轉';
		if(card.type & TYPE_TOON)
			subtype += '/卡通';
		if(card.type & TYPE_SPSUMMON)
			subtype += '/特殊召喚';
		if(card.type & TYPE_EFFECT)
			subtype += '/效果';
		data = '[' + mtype + subtype + ']';
		data = `[${mtype}${subtype}]`;
	}
	else if(card.type & TYPE_SPELL){
		mtype = '魔法';
		if(card.type & TYPE_QUICKPLAY)
			subtype = '速攻';
		else if(card.type & TYPE_CONTINUOUS)
			subtype = '永續';
		else if(card.type & TYPE_EQUIP)
			subtype = '裝備';
		else if(card.type & TYPE_RITUAL)
			subtype = '儀式';
		else if(card.type & TYPE_FIELD)
			subtype = '場地';
		else
			subtype = '通常';
		data = `[${subtype}${mtype}]`;
	}
	else if(card.type & TYPE_TRAP){
		mtype = '陷阱';
		if(card.type & TYPE_CONTINUOUS)
			subtype = '永續';
		else if(card.type & TYPE_COUNTER)
			subtype = '反擊';
		else
			subtype = '通常';
		data = `[${subtype}${mtype}]`;
	}
	
	if(card.type & TYPE_MONSTER){
		data += '<br>';
		if(card.level & 0xff)
			data += lvstr + (card.level & 0xff);
		if(card.attribute)
			data += '/' + attr_to_str[card.attribute];
		if(card.race)
			data += '/' + race_to_str[card.race] + '族'; 
		data += '<br>' + print_ad(card.atk);
		if(card.type & TYPE_LINK){
			data += '/-';
			marker = '<div class="marker">';
			if(card.def & LINK_MARKER_TOP_LEFT)
				marker += '<span class="ul t">▲</span>';
			else
				marker += '<span class="ul f">△</span>';
			if(card.def & LINK_MARKER_TOP )
				marker += '<span class="t">▲</span>';
			else
				marker += '<span class="f">△</span>';
			if(card.def & LINK_MARKER_TOP_RIGHT)
				marker += '<span class="ur t">▲</span>';
			else
				marker += '<span class="ur f">△</span>';
	
			marker += '<br>';
			if(card.def & LINK_MARKER_LEFT)
				marker += '<span class="l t">▲</span>';
			else
				marker += '<span class="l f">△</span>';
			marker += '<span>　</span>';
			if(card.def & LINK_MARKER_RIGHT)
				marker += '<span class="r t">▲</span>';
			else
				marker += '<span class="r f">△</span>';
			marker = marker + '<br>';
	
			if(card.def & LINK_MARKER_BOTTOM_LEFT)
				marker += '<span class="dl t">▲</span>';
			else
				marker += '<span class="dl f">△</span>';
			if(card.def & LINK_MARKER_BOTTOM )
				marker += '<span class="d t">▲</span>';
			else
				marker += '<span class="d f">△</span>';
			if(card.def & LINK_MARKER_BOTTOM_RIGHT)
				marker += '<span class="dr t">▲</span>';
			else
				marker += '<span class="dr f">△</span>';
			marker += '</div>';
		}
		else{
			data += '/' + print_ad(card.def);
		}
		if(card.type & TYPE_PENDULUM){
			data += '/刻度' + ((card.level >> 24) & 0xff);
		}
	}
	output_data += `<span style="color: Blue;">${data}</span>`;
	if(card.type & TYPE_LINK)
		output_data += `<br>${marker}`;
	cell_data.innerHTML = output_data;
	
	var row_effect = table_result.insertRow(-1);	
	var cell_effect = row_effect.insertCell(-1);
	cell_effect.className = "effect";
	cell_effect.innerHTML = card.desc.replace(/\n/g, "<br>");
	if(window.innerWidth <= MAX_WIDTH){
		cell_effect.colSpan = 2;
	}
}

function show_result(pre_release){
	table_result.innerHTML = '';
	if(result.length > 0){
		if(pre_release)
			result.sort(compare_id);
		else
			result.sort(compare_name);
		if(window.innerWidth > MAX_WIDTH)
			table_result.style.border = '1px solid black';
		result.forEach(create_rows);
	}
	else{
		var row0 = table_result.insertRow(-1);
		var cell0 = row0.insertCell(-1);
		table_result.style.border = '1px solid black';
		cell0.innerHTML = '沒有符合搜尋的項目。';
	}
}
