"use strict";


function print_ad(x){
	if(x == -2)
		return '?';
	else
		return x;
}

function print_link(id, ot, db_id){
	switch(id){
		case 68811206:
			return 'https://yugipedia.com/wiki/68811206'
		default:
			var url = 'https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=' + db_id;
			if(ot == 2)
				return url + '&request_locale=en';
			else
				return url + '&request_locale=ja';
	}
}

function print_limit(limit){
	if(limit == 0)
		return '<img src="0.png" height="20" width="20">';
	else if(limit == 1)
		return '<img src="1.png" height="20" width="20">';
	else if(limit == 2)
		return '<img src="2.png" height="20" width="20">';
	else
		return '';
}

function compare_card(a, b){
	return a.name.localeCompare(b.name);
}

function create_rows(card){
	//var div_card = document.getElementById('div_result');
	var table1 = document.getElementById('table_result');
	var row1 = table1.insertRow(-1);
	var cell1 = row1.insertCell(-1);
	var cell2 = row1.insertCell(-1);

	cell1.className = 'card_id';
	cell2.className = 'query';
	if(card.id <= 99999999)
		cell1.innerHTML = '<a href="' + print_link(card.id, card.ot, card.db_id) + '" target="_blank" rel="noreferrer">' + card.id.toString().padStart(8, '0') + '</a>';
	else
		cell1.innerHTML = card.id.toString();
	
	cell2.innerHTML = card.name + print_limit(card.limit);
	if(card.ot == 2)
		cell2.innerHTML += '<img src="tcg.png" height="20" width="40">';
	if(card.id <= 99999999)
		cell2.innerHTML += '<br>' + card.jp_name;
	
	var mtype = '';
	var subtype = '';
	var lvstr = '等級';
	var marker = '';
	var data = '';
	var output = '';
	
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
		// extype
		if(card.type & TYPE_PENDULUM){
		           subtype += '/靈擺';
		}
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
		data = '[' + mtype + subtype + '] ';
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
		data = '[' + subtype + mtype + '] ';
	}
	else if(card.type & TYPE_TRAP){
		mtype = '陷阱';
		if(card.type & TYPE_CONTINUOUS)
			subtype = '永續';
		else if(card.type & TYPE_COUNTER)
			subtype = '反擊';
		else
			subtype = '通常';
		data = '[' + subtype + mtype + '] ';
	}
	
	if(card.type & TYPE_MONSTER){
		data += lvstr + (card.level & 0xff);
		data += '/' + attr_to_str[card.attribute];
		data += '/' + race_to_str[card.race] + '族<br>'; 
		data += print_ad(card.atk);
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
			data +=  '/' + print_ad(card.def);
		}
		if(card.type & TYPE_PENDULUM){
			data += '/刻度' + ((card.level >> 24) & 0xff);
		}
	}
	output = '<span style="color: Blue;">' + data + '<br></span>' + marker;
	output += card.desc.replace(/\n/g, "<br>");
	var row_effect = table1.insertRow(-1);
	var cell_effect = row_effect.insertCell(-1);
	cell_effect.className = "query";
	cell_effect.innerHTML = output;
	cell_effect.colSpan = "2";
	
	/*div_result.insertBefore(table1, null);
	var div_half = document.createElement('div');
	div_half.className = 'half-line';
	div_half.innerHTML = '&nbsp;';
	div_result.insertBefore(div_half, null);*/
}
