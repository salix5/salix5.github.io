"use strict";
// type
const TYPE_MONSTER		=0x1		//怪兽卡
const TYPE_SPELL		=0x2		//魔法卡
const TYPE_TRAP			=0x4		//陷阱卡

// subtype
const TYPE_NORMAL			=0x10		//通常怪兽
const TYPE_EFFECT			=0x20		//效果
const TYPE_FUSION			=0x40		//融合
const TYPE_RITUAL			=0x80		//仪式
const TYPE_SYNCHRO		=0x2000		//同调
const TYPE_XYZ			=0x800000	//超量
const TYPE_PENDULUM		=0x1000000	//灵摆
const TYPE_LINK			=0x4000000	//连接
const ext = TYPE_FUSION | TYPE_SYNCHRO | TYPE_XYZ | TYPE_LINK;   

//extype
const TYPE_SPIRIT		=0x200		//灵魂
const TYPE_UNION		=0x400		//同盟
const TYPE_DUAL			=0x800		//二重
const TYPE_TUNER		=0x1000		//调整
const TYPE_TOKEN		=0x4000		//衍生物
const TYPE_FLIP			=0x200000	//翻转
const TYPE_TOON			=0x400000	//卡通
const TYPE_SPSUMMON		=0x2000000	//特殊召唤

// spell type
const TYPE_QUICKPLAY		=0x10000	//速攻
const TYPE_CONTINUOUS		=0x20000	//永续
const TYPE_EQUIP			=0x40000	//装备
//const TYPE_RITUAL			=0x80
const TYPE_FIELD			=0x80000	//场地

// trap type
//const TYPE_CONTINUOUS		=0x20000
const TYPE_COUNTER		=0x100000	//反击

// race
const RACE_WARRIOR		=0x1		//战士
const RACE_SPELLCASTER	=0x2		//魔法师
const RACE_FAIRY			=0x4		//天使
const RACE_FIEND			=0x8		//恶魔
const RACE_ZOMBIE			=0x10		//不死
const RACE_MACHINE		=0x20		//机械
const RACE_AQUA			=0x40		//水
const RACE_PYRO			=0x80		//炎
const RACE_ROCK			=0x100		//岩石
const RACE_WINDBEAST		=0x200		//鸟兽
const RACE_PLANT			=0x400		//植物
const RACE_INSECT			=0x800		//昆虫
const RACE_THUNDER		=0x1000			//雷
const RACE_DRAGON			=0x2000		//龙
const RACE_BEAST			=0x4000		//兽
const RACE_BEASTWARRIOR	=0x8000			//兽战士
const RACE_DINOSAUR		=0x10000		//恐龙
const RACE_FISH			=0x20000		//鱼
const RACE_SEASERPENT		=0x40000	//海龙
const RACE_REPTILE		=0x80000		//爬虫类
const RACE_PSYCHO			=0x100000	//念动力
const RACE_DIVINE			=0x200000	//幻神兽
const RACE_CREATORGOD		=0x400000	//创造神
const RACE_WYRM			=0x800000		//幻龙
const RACE_CYBERSE		=0x1000000		//电子界

// attr
const ATTRIBUTE_EARTH	=0x01		//地
const ATTRIBUTE_WATER	=0x02		//水
const ATTRIBUTE_FIRE	=0x04		//炎
const ATTRIBUTE_WIND	=0x08		//风
const ATTRIBUTE_LIGHT	=0x10		//光
const ATTRIBUTE_DARK	=0x20		//暗
const ATTRIBUTE_DIVINE	=0x40		//神

// Link Marker
const LINK_MARKER_BOTTOM_LEFT	=0x001 // ↙
const LINK_MARKER_BOTTOM		=0x002 // ↓
const LINK_MARKER_BOTTOM_RIGHT	=0x004 // ↘

const LINK_MARKER_LEFT			=0x008 // ←
const LINK_MARKER_RIGHT			=0x020 // →

const LINK_MARKER_TOP_LEFT		=0x040 // ↖
const LINK_MARKER_TOP			=0x080 // ↑
const LINK_MARKER_TOP_RIGHT		=0x100 // ↗

// table width
const max_witdh = 1000;	

var config = {   
  locateFile: filename => `./dist/${filename}`    
}   

var db, db2;
var ready = false;
var ltable = new Object();
var cid_table;

var lflist = new XMLHttpRequest();
lflist.onload = e => {
	var ldata = lflist.responseText.replace(/\r\n/g, '\n');
	var line = ldata.split('\n');
	var count = 0;
	for(var i = 0; i < line.length; ++i){
		var init = line[i].substring(0, 1);
		if(init == '!'){
			++count;
			if(count == 2)
				break;
		}
		else if(init == '#'){}
		else{
			var part = line[i].split(' ');
			var id = parseInt(part[0], 10);
			var limit = parseInt(part[1], 10);
			ltable[id] = limit;
			}
	}
};
lflist.open('GET', 'https://salix5.github.io/CardEditor/lflist.conf', true);
lflist.send();

var cid_xhr = new XMLHttpRequest();
cid_xhr.onload = e => {
	cid_table = cid_xhr.response;
};
cid_xhr.open('GET', 'cid.json', true);	
cid_xhr.responseType = 'json';
cid_xhr.send();

// The `initSqlJs` function is globally provided by all of the main dist files if loaded in the browser.   
// We must specify this locateFile function if we are loading a wasm file from anywhere other than the current html page's folder.   
initSqlJs(config).then(function(SQL){   

	var xhr = new XMLHttpRequest();
	xhr.onload = e => {
		var arr1 = new Uint8Array(xhr.response);
		var button1 = document.getElementById('button1');
		db = new SQL.Database(arr1);
		button1.disabled = false;
		ready = true;
	};
	xhr.open('GET', 'https://salix5.github.io/CardEditor/cards.cdb', true);
	xhr.responseType = 'arraybuffer';
	xhr.send();
	
	var xhr2 = new XMLHttpRequest();
	xhr2.onload = e => {
		var arr1 = new Uint8Array(xhr2.response);
		db2 = new SQL.Database(arr1);
	};
	xhr2.open('GET', 'beta.cdb', true);
	xhr2.responseType = 'arraybuffer';	
	xhr2.send();
	}
);

// require: id, alias, type
function is_virtual(result) {
	if(Math.abs(result.alias-result.id) < 10)
		return true;
	if(result.type & TYPE_TOKEN)
		return true;
}

function is_legal(atk){
	if(atk == -1 || atk >= 0)
	    return true;
	else
	    return false;
}

function print_attr(x){
	switch(x){
		case ATTRIBUTE_EARTH:
			return '地';
		case ATTRIBUTE_WATER:
			return '水';
		case ATTRIBUTE_FIRE:
			return '炎';
		case ATTRIBUTE_WIND:
			return '風';
		case ATTRIBUTE_LIGHT:
			return '光';
		case ATTRIBUTE_DARK:
			return '暗';
		case ATTRIBUTE_DIVINE:
			return '神';
	}
}

function print_race(x){
	switch(x){
		case RACE_WARRIOR:
			return '戰士';
		case RACE_SPELLCASTER:
			return '魔法使';
		case RACE_FAIRY:
			return '天使';
		case RACE_FIEND:
			return '惡魔';
		case RACE_ZOMBIE:
			return '不死';
		case RACE_MACHINE:
			return '機械';
		case RACE_AQUA:
			return '水';
		case RACE_PYRO:
			return '炎';
		case RACE_ROCK:
			return '岩石';
		case RACE_WINDBEAST:
			return '鳥獸';
		case RACE_PLANT:
			return '植物';
		case RACE_INSECT:
			return '昆蟲';
		case RACE_THUNDER:
			return '雷';
		case RACE_DRAGON:
			return '龍';
		case RACE_BEAST:
			return '獸';
		case RACE_BEASTWARRIOR:
			return '獸戰士';
		case RACE_DINOSAUR:
			return '恐龍';
		case RACE_FISH:
			return '魚';
		case RACE_SEASERPENT:
			return '海龍';
		case RACE_REPTILE:
			return '爬蟲類';
		case RACE_PSYCHO:
			return '超能';
		case RACE_DIVINE:
			return '幻神獸';
		case RACE_CREATORGOD:
			return '創造神';
		case RACE_WYRM:
			return '幻龍';
		case RACE_CYBERSE:
			return '電子界';
	}
}

function print_ad(x){
	if(x == -2)
		return '?';
	else
		return x;
}

function print_link(id, ot){
	switch(id){
		case 68811206:
			return 'https://yugipedia.com/wiki/68811206'
		default:
			var url = 'https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=' + cid_table[id];
			if(ot == 2)
				return url + '&request_locale=en';
			else
				return url + '&request_locale=ja';
	}
}

function print_limit(id){
	if(ltable[id] == 0)
		return '<img src="0.png" height="20" width="20">';
	else if(ltable[id] == 1)
		return '<img src="1.png" height="20" width="20">';
	else if(ltable[id] == 2)
		return '<img src="2.png" height="20" width="20">';
	else
		return '';
}

function create_rows(result){
	//var table1 = document.getElementById('table1');
	var div_result = document.getElementById('div_result');
	var table1 = document.createElement('table');
	table1.className = "query";
	if(window.innerWidth > max_witdh){
		table1.style.width = max_witdh.toString() + 'px';
	}
	var row = table1.insertRow(-1);
		var cell1 = row.insertCell(-1);
		var cell2 = row.insertCell(-1);
		var cell3 = row.insertCell(-1);
		
		cell1.className = "query";
		cell2.className = "query";
		cell3.className = "query";
		if(result.id <= 99999999)
			cell1.innerHTML = '<a href="' + print_link(result.id, result.ot) + '" target="_blank">' + result.id.toString().padStart(8, '0') + '</a>';
		else
			cell1.innerHTML = result.id.toString();
		
		if(result.ot == 2)
			cell2.innerHTML = '<span style="color: red;">' + result.name + '</span>' + print_limit(result.id);
		else
			cell2.innerHTML = result.name + print_limit(result.id);
		
		var mtype = '';
		var subtype = '';
		var extype = '';
		var lvstr = 'L';
                var marker = '';

		if(result.type & TYPE_MONSTER){
			mtype = '怪獸';
			if(result.type & TYPE_RITUAL)
				subtype = '儀式';
			else if(result.type & TYPE_FUSION)
				subtype = '融合';
			else if(result.type & TYPE_SYNCHRO)
				subtype = '同步';
			else if(result.type & TYPE_XYZ){
				subtype = '超量';
				lvstr = 'R';
			}
			else if(result.type & TYPE_LINK){
				subtype = '連結';
				lvstr = 'LINK-';
			}
			// extype
			if(result.type & TYPE_PENDULUM){
			        if(subtype == ''){
			            subtype = '靈擺';
			            if(result.type & TYPE_NORMAL)
			                extype = '/通常';
			            else
			                extype = '/效果';
			        }
			        else {
			            extype = '/靈擺';
			        }
			}
			else if(result.type & TYPE_NORMAL)
				subtype = '通常';
			else if(subtype == '')
				subtype = '效果';
			
			if(result.type & TYPE_SPIRIT)
				extype = extype + '/靈魂';
			if(result.type & TYPE_UNION)
				extype = extype + '/聯合';
			if(result.type & TYPE_DUAL)
				extype = extype + '/二重';
			if(result.type & TYPE_TUNER)
				extype = extype + '/協調';
			if(result.type & TYPE_FLIP)
				extype = extype + '/反轉';
			if(result.type & TYPE_TOON)
				extype = extype + '/卡通';
			if(result.type & TYPE_SPSUMMON)
				extype = extype + '/特殊召喚';
		}
		else if(result.type & TYPE_SPELL){
			mtype = '魔法';
			if(result.type & TYPE_QUICKPLAY)
				subtype = '速攻';
			else if(result.type & TYPE_CONTINUOUS)
				subtype = '永續';
			else if(result.type & TYPE_EQUIP)
				subtype = '裝備';
			else if(result.type & TYPE_RITUAL)
				subtype = '儀式';
			else if(result.type & TYPE_FIELD)
				subtype = '場地';
			else
				subtype = '通常';
		}
		else if(result.type & TYPE_TRAP){
			mtype = '陷阱';
			if(result.type & TYPE_CONTINUOUS)
				subtype = '永續';
			else if(result.type & TYPE_COUNTER)
				subtype = '反擊';
			else
				subtype = '通常';
		}
		cell3.innerHTML = subtype + mtype + extype;
		
		if(result.type & TYPE_MONSTER){
		    var row_data = table1.insertRow(-1);
		    var cell_data = row_data.insertCell(-1);
			var data = '';
			
			data = data + lvstr + (result.level & 0xff);
			data = data + '/' + print_attr(result.attribute);
			data = data + '/' + print_race(result.race) + '族';
			data = data + '/' + print_ad(result.atk);
			if(result.type & TYPE_LINK){
				marker = '<br>';
				if(result.def & LINK_MARKER_TOP_LEFT)
					marker = marker + '↖';
				else
					marker = marker + '　';
				if(result.def & LINK_MARKER_TOP )
					marker = marker + ' ↑ ';
				else
					marker = marker + '　';
				if(result.def & LINK_MARKER_TOP_RIGHT)
					marker = marker + '↗';
				else
					marker = marker + '　';

				marker = marker + '<br>';
				if(result.def & LINK_MARKER_LEFT)
					marker = marker + '←';
				else
					marker = marker + '　';
				marker = marker + '　';
				if(result.def & LINK_MARKER_RIGHT)
					marker = marker + '→';
				else
					marker = marker + '　';
				marker = marker + '<br>';

				if(result.def & LINK_MARKER_BOTTOM_LEFT)
					marker = marker + '↙';
				else
					marker = marker + '　';
				if(result.def & LINK_MARKER_BOTTOM )
					marker = marker + ' ↓ ';
				else
					marker = marker + '　';
				if(result.def & LINK_MARKER_BOTTOM_RIGHT)
					marker = marker + '↘';
				else
					marker = marker + '　';
			}
			else{
				data = data + '/' + print_ad(result.def);
			}
			if(result.type & TYPE_PENDULUM){
				data = data + '/刻度' + ((result.level >> 24) & 0xff);
			}
			cell_data.className = "query";
			cell_data.innerHTML = data + marker;
			cell_data.colSpan = "3";
		}
		
		var row_effect = table1.insertRow(-1);    
		var cell_effect = row_effect.insertCell(-1);
		cell_effect.className = "query";
		cell_effect.innerHTML = result.desc.replace(/\r\n/g, "<br>");
		cell_effect.colSpan = "3";
		div_result.insertBefore(table1, null);
}

function query(){
	var text_id = document.getElementById('text_id');
	var text_name = document.getElementById('text_name');
	var text_effect = document.getElementById('text_effect');
	
	var text_atk1 = document.getElementById('text_atk1');
	var text_atk2 = document.getElementById('text_atk2');
	var text_def1 = document.getElementById('text_def1');
    var text_def2 = document.getElementById('text_def2');
	//var atk_relation = document.getElementById('atk_relation');
	//var def_relation = document.getElementById('def_relation');
	
	var select_type = document.getElementById('select_type');
	var select_subtype1 = document.getElementById('select_subtype1');
	var select_subtype2 = document.getElementById('select_subtype2');
	var select_lv1 = document.getElementById('select_lv1');
	var select_lv2 = document.getElementById('select_lv2');
	var select_scale1 = document.getElementById('select_scale1');
	var select_scale2 = document.getElementById('select_scale2');
	var select_race = document.getElementById('select_race');
	var select_attr  = document.getElementById('select_attr');
	
	//var table1 = document.getElementById('table1');
	var div_result = document.getElementById('div_result');
	var qstr = 'SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts WHERE datas.id==texts.id';
	var cid = 0;
	var ctype = 0;
	var atk1 = 0;
	var atk2 = 0;
	var def1 = 0;
	var def2 = 0;
	var lv1 = 0;
	var lv2 = 0;
	var sc1 = 0;
	var sc2 = 0;
	
	var arg = new Object();
	var valid = false;
	var monly = false;
	
	// id
	cid = parseInt(text_id.value, 10);
	if(cid > 0){
		qstr = qstr + " AND datas.id == $id";
		arg.$id = cid;
		valid = true;
	}
	
	// type
	if(select_type.value != ''){
		ctype = parseInt(select_type.value, 16);
		if(select_subtype1.value != ''){
			if(select_subtype1.value == 'deck'){
			        qstr = qstr + " AND NOT type&" + ext;
			}
			else if(select_subtype1.value == 'extra'){
			        qstr = qstr + " AND type&" + ext;
			}
			else
			        ctype = ctype | parseInt(select_subtype1.value, 16);
		}
		if(select_subtype2.value != ''){
			ctype = ctype | parseInt(select_subtype2.value, 16);
		}
		qstr = qstr + " AND type & $type == $type";
		arg.$type = ctype;
		valid = true;
	}
	// atk
	atk1 = parseInt(text_atk1.value, 10);
    atk2 = parseInt(text_atk2.value, 10);

	if(is_legal(atk1) || is_legal(atk2)){
		if(atk1 == -1 || atk2 == -1){
			qstr = qstr + " AND atk == $atk";
			arg.$atk = -2;
		}
		else if(!is_legal(atk2)){
			qstr = qstr + " AND atk == $atk";
			arg.$atk = atk1;
		}
		else if(!is_legal(atk1)){
			qstr = qstr + " AND atk == $atk";
			arg.$atk = atk2;
		}
		else {
			var atk_min = Math.min(atk1, atk2);
			var atk_max = Math.max(atk1, atk2);
			qstr = qstr + " AND atk >= $atk_min AND atk <= $atk_max";
			arg.$atk_min = atk_min;
			arg.$atk_max = atk_max;
		}
		valid = true;
		monly = true;
	}
	
	// def, exclude link monsters
	def1 = parseInt(text_def1.value, 10);
    def2 = parseInt(text_def2.value, 10);

	if(is_legal(def1) || is_legal(def2)){
		qstr = qstr + " AND NOT type & " + TYPE_LINK;
		if(def1 == -1 || def2 == -1){
			qstr = qstr + " AND def == $def";
			arg.$def = -2;
		}
		else if(!is_legal(def2)){
			qstr = qstr + " AND def == $def";
			arg.$def = def1;
		}
		else if(!is_legal(def1)){
			qstr = qstr + " AND def == $def";
			arg.$def = def2;
		}
		else {
			var def_min = Math.min(def1, def2);
			var def_max = Math.max(def1, def2);
			qstr = qstr + " AND def >= $def_min AND def <= $def_max";
			arg.$def_min = def_min;
			arg.$def_max = def_max;
		}
		valid = true;
		monly = true;
	}
	
	// lv, scale
	lv1 = select_lv1.selectedIndex;
	lv2 = select_lv2.selectedIndex;
	sc1 = select_scale1.selectedIndex;
	sc2 = select_scale2.selectedIndex;
	var lv_min = 0;
	var lv_max = 0;
	var sc_min = 0;
	var sc_min = 0;
	if(lv1 || lv2){
		if(!lv2){
			qstr = qstr + " AND level & 0xff == $lv";
			arg.$lv = lv1;
		}
		else if(!lv1){
			qstr = qstr + " AND level & 0xff == $lv";
			arg.$lv = lv2;
		}
		else{
			lv_min = Math.min(lv1, lv2);
			lv_max = Math.max(lv1, lv2);
			qstr = qstr + " AND level & 0xff >= $lv_min AND level & 0xff <= $lv_max";
			arg.$lv_min = lv_min;
			arg.$lv_max = lv_max;
		}
		valid = true;
		monly = true;
	}
	if(sc1 || sc2){
		qstr = qstr + " AND type&" + TYPE_PENDULUM;
		if(!sc2){
			qstr = qstr + " AND (level >> 24) & 0xff == $sc";
			arg.$sc = sc1 - 1;
		}
		else if(!sc1){
			qstr = qstr + " AND (level >> 24) & 0xff == $sc";
			arg.$sc = sc2 - 1;
		}
		else{
			sc_min = Math.min(sc1 - 1, sc2 - 1);
			sc_max = Math.max(sc1 - 1, sc2 - 1);
			qstr = qstr + " AND level & 0xff >= $sc_min AND level & 0xff <= $sc_max";
			arg.$sc_min = sc_min;
			arg.$sc_max = sc_max;
		}
		valid = true;
		monly = true;
	}
	
	// attr, race
	if(select_attr.value != ''){
		qstr = qstr + " AND attribute & $attr";
		arg.$attr = parseInt(select_attr.value, 16);
		valid = true;
		monly = true;
	}
	if(select_race.value != ''){
		qstr = qstr + " AND race & $race";
		arg.$race = parseInt(select_race.value, 16);
		valid = true;
		monly = true;
	}
	
	// name, effect
	if(text_name.value != ''){
		qstr = qstr + " AND name LIKE $name";
		arg.$name = '%' + text_name.value.replace(/[%_]/, '') + '%';
		valid = true;
	}
	if(text_effect.value != ''){
		qstr = qstr + " AND desc LIKE $desc";
		arg.$desc = '%' + text_effect.value.replace(/[%_]/, '') + '%';
		valid = true;
	}
	if(monly)
		qstr = qstr + " AND type & " + TYPE_MONSTER;

	// clear
	/*var n = table1.rows.length;
	for(let i = 0; i<=n-1; ++i)
		table1.deleteRow(-1); */
	
	div_result.innerHTML = '';
	text_id.value = '';
	text_name.value = '';
	text_atk1.value = '';
	text_atk2.value = '';
	text_def1.value = '';
	text_def2.value = '';
	text_effect.value = '';
	
	select_type.selectedIndex = 0;
	
	var len = select_subtype1.length;
	for(let i=1; i < len; ++i)
		select_subtype1.remove(select_subtype1.length - 1);
	
	len = select_subtype2.length;
	for(let i=1; i < len; ++i)
		select_subtype2.remove(select_subtype2.length - 1);
	select_subtype2.style.visibility = "hidden";
	
	select_lv1.selectedIndex = 0;
	select_lv2.selectedIndex = 0;
	select_scale1.selectedIndex = 0;
	select_scale2.selectedIndex = 0;
	select_race.selectedIndex = 0;
	select_attr.selectedIndex = 0;
	//atk_relation.selectedIndex = 0;
	//def_relation.selectedIndex = 0;
	
	if(!valid)
		return;
	
	// Prepare a statement
	var stmt = db.prepare(qstr);
	stmt.bind(arg);
	while(stmt.step()) {
		// execute
		var result = stmt.getAsObject();

		if(is_virtual(result))
			continue;
                create_rows(result);			
	}
	stmt = db2.prepare(qstr);
	stmt.bind(arg);
	while(stmt.step()) {
		// execute
		var result = stmt.getAsObject();

		if(is_virtual(result))
			continue;
                create_rows(result);			
	}
}
