"use strict";
// type
const TYPE_MONSTER		=0x1		//怪兽卡
const TYPE_SPELL			=0x2		//魔法卡
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
const TYPE_FIELD			=0x80000	//场地
// trap type
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
const ATTRIBUTE_EARTH		=0x01		//地
const ATTRIBUTE_WATER		=0x02		//水
const ATTRIBUTE_FIRE		=0x04		//炎
const ATTRIBUTE_WIND		=0x08		//风
const ATTRIBUTE_LIGHT		=0x10		//光
const ATTRIBUTE_DARK		=0x20		//暗
const ATTRIBUTE_DIVINE	=0x40		//神
  
var config = {   
  locateFile: filename => `./dist/${filename}`    
}   

var db;
var ready = false;


// The `initSqlJs` function is globally provided by all of the main dist files if loaded in the browser.   
// We must specify this locateFile function if we are loading a wasm file from anywhere other than the current html page's folder.   
initSqlJs(config).then(function(SQL){   

	var xhr = new XMLHttpRequest();
	xhr.open('GET', './cards.cdb', true);
	xhr.responseType = 'arraybuffer';
	
	xhr.onload = e => {
		var arr1 = new Uint8Array(xhr.response);
                var button1 = document.getElementById('button1');
		db = new SQL.Database(arr1);
		button1.disabled = false;
		ready = true;
	};
	xhr.send();
	}
);

function is_virtual(result) {
if(Math.abs(result.alias-result.id) <= 10)
	return true;
if(result.type & TYPE_TOKEN)
	return true;
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

function query1(){
	var text_id = document.getElementById('text_id');
	var text_name = document.getElementById('text_name');
	var text_effect = document.getElementById('text_effect');
	
	var text_atk = document.getElementById('text_atk');
	var text_def = document.getElementById('text_def');
	var atk_relation = document.getElementById('atk_relation');
	var def_relation = document.getElementById('def_relation');
	
	var select_type = document.getElementById('select_type');
	var select_subtype1 = document.getElementById('select_subtype1');
	var select_subtype2 = document.getElementById('select_subtype2');
	var select_lv1 = document.getElementById('select_lv1');
	var select_lv2 = document.getElementById('select_lv2');
	var select_scale1 = document.getElementById('select_scale1');
	var select_scale2 = document.getElementById('select_scale2');
	var select_race = document.getElementById('select_race');
	var select_attr  = document.getElementById('select_attr');
	
	var table1 = document.getElementById('table1');
	
	var qstr = 'SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts WHERE datas.id==texts.id';
	var cid = 0;
	var ctype = 0;
	var catk = 0;
	var cdef = 0;
	var lv1 = 0;
	var lv2 = 0;
	var sc1 = 0;
	var sc2 = 0;
	var cattr = 0;
	var crace = 0;
	
	var valid = false;
	var monly = false;
	
	if(window.innerWidth > 1200){
		table1.style.width = '1200px';
	}
	
	// id
	cid = parseInt(text_id.value, 10);
	if(cid > 0){
		qstr = qstr + " AND datas.id==@cid";
		valid = true;
	}
	
	// type
	if(select_type.value != ''){
		switch(select_type.value){
			case 'TYPE_MONSTER':
				ctype = TYPE_MONSTER;
				break;
			case 'TYPE_SPELL':
				ctype = TYPE_SPELL;
				break;
			case 'TYPE_TRAP':
				ctype = TYPE_TRAP;
				break;
		}
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
		qstr = qstr + " AND type&" + ctype + "==" + ctype;
		valid = true;
	}
	// atk
	catk = parseInt(text_atk.value, 10);
	if(catk >= 0 || catk == -1){
		if(catk == -1){
			catk = -2;
			qstr = qstr + " AND atk==" + catk;
		}
		else{
			var relation = '';
			switch(atk_relation.value){
				case '':
					relation = '==';
					break;
				case 'above':
					relation = '>=';
					break;
				case 'below':
					relation = '<=';
					break;
			}
			qstr = qstr + " AND atk" + relation + catk;
		}
		valid = true;
		monly = true;
	}
	
	// def, exclude link monsters
	cdef = parseInt(text_def.value, 10);
	if(cdef >= 0 || cdef == -1){
		qstr = qstr + " AND NOT type&" + TYPE_LINK;
		if(cdef == -1){
			cdef = -2;
			qstr = qstr + " AND def==" + cdef;
		}
		else{
			var relation = '';
			switch(def_relation.value){
				case '':
					relation = '==';
					break;
				case 'above':
					relation = '>=';
					break;
				case 'below':
					relation = '<=';
					break;
			}
			qstr = qstr + " AND def" + relation + cdef;
		}
		valid = true;
		monly = true;
	}
	
	// lv, scale
	lv1 = select_lv1.selectedIndex;
	lv2 = select_lv2.selectedIndex;
	sc1 = select_scale1.selectedIndex;
	sc2 = select_scale2.selectedIndex;
	if(lv1 || lv2){
		if(!lv2)
			qstr = qstr + " AND level & 0xff ==" + lv1;
		else if(!lv1)
			qstr = qstr + " AND level & 0xff ==" + lv2;
		else{
			var min = Math.min(lv1, lv2);
			var max = Math.max(lv1, lv2);
			qstr = qstr + " AND (level & 0xff)>=" + min + " AND (level & 0xff)<=" + max;
		}
		valid = true;
		monly = true;
	}
	if(sc1 || sc2){
		qstr = qstr + " AND type&" + TYPE_PENDULUM;
		if(!sc2)
			qstr = qstr + " AND (level >> 24) & 0xff == " + (sc1 - 1);
		else if(!sc1)
			qstr = qstr + " AND (level >> 24) & 0xff == " + (sc2 - 1);
		else{
			var min = Math.min(sc1 - 1, sc2 - 1);
			var max = Math.max(sc1 - 1, sc2 - 1);
			qstr = qstr + " AND (level >> 24) & 0xff >= " + min + " AND (level >> 24) & 0xff <= " + max;
		}
		valid = true;
		monly = true;
	}
	
	// attr, race
	if(select_attr.value != ''){
		switch(select_attr.value){
			case 'ATTRIBUTE_EARTH':
				cattr = ATTRIBUTE_EARTH;
				break;
			case 'ATTRIBUTE_WATER':
				cattr = ATTRIBUTE_WATER;
				break;
			case 'ATTRIBUTE_FIRE':
				cattr = ATTRIBUTE_FIRE;
				break;
			case 'ATTRIBUTE_WIND':
				cattr = ATTRIBUTE_WIND;
				break;
			case 'ATTRIBUTE_LIGHT':
				cattr = ATTRIBUTE_LIGHT;
				break;
			case 'ATTRIBUTE_DARK':
				cattr = ATTRIBUTE_DARK;
				break;
			case 'ATTRIBUTE_DIVINE':
				cattr = ATTRIBUTE_DIVINE;
				break;
		}
		qstr = qstr + " AND attribute&" + cattr;
		valid = true;
		monly = true;
	}
	if(select_race.value != ''){
		switch(select_race.value){
			case 'RACE_WARRIOR':
				crace = RACE_WARRIOR;
				break;
			case 'RACE_SPELLCASTER':
				crace = RACE_SPELLCASTER;
				break;
			case 'RACE_FAIRY':
				crace = RACE_FAIRY;
				break;
			case 'RACE_FIEND':
				crace = RACE_FIEND;
				break;
			case 'RACE_ZOMBIE':
				crace = RACE_ZOMBIE;
				break;
			case 'RACE_MACHINE':
				crace = RACE_MACHINE;
				break;
			case 'RACE_AQUA':
				crace = RACE_AQUA;
				break;
			case 'RACE_PYRO':
				crace = RACE_PYRO;
				break;
			case 'RACE_ROCK':
				crace = RACE_ROCK;
				break;
			case 'RACE_WINDBEAST':
				crace = RACE_WINDBEAST;
				break;
			case 'RACE_PLANT':
				crace = RACE_PLANT;
				break;
			case 'RACE_INSECT':
				crace = RACE_INSECT;
				break;
			case 'RACE_THUNDER':
				crace = RACE_THUNDER;
				break;
			case 'RACE_DRAGON':
				crace = RACE_DRAGON;
				break;
			case 'RACE_BEAST':
				crace = RACE_BEAST;
				break;
			case 'RACE_BEASTWARRIOR':
				crace = RACE_BEASTWARRIOR;
				break;
			case 'RACE_DINOSAUR':
				crace = RACE_DINOSAUR;
				break;
			case 'RACE_FISH':
				crace = RACE_FISH;
				break;
			case 'RACE_SEASERPENT':
				crace = RACE_SEASERPENT;
				break;
			case 'RACE_REPTILE':
				crace = RACE_REPTILE;
				break;
			case 'RACE_PSYCHO':
				crace = RACE_PSYCHO;
				break;
			case 'RACE_DIVINE':
				crace = RACE_DIVINE;
				break;
			case 'RACE_CREATORGOD':
				crace = RACE_CREATORGOD;
				break;
			case 'RACE_WYRM':
				crace = RACE_WYRM;
				break;
			case 'RACE_CYBERSE':
				crace = RACE_CYBERSE;
				break;
		}
		qstr = qstr + " AND race&" + crace;
		valid = true;
		monly = true;
	}
	
	// name, effect
	if(text_name.value != ''){
		qstr = qstr + " AND name LIKE \'%" + text_name.value + "%\'";
		valid = true;
	}
	if(text_effect.value != ''){
		qstr = qstr + " AND desc LIKE \'%" + text_effect.value + "%\'";
		valid = true;
	}
	if(monly)
		qstr = qstr + " AND type&" + TYPE_MONSTER;

	// clear
	var n = table1.rows.length;
	for(let i = 0; i<=n-1; ++i)
		table1.deleteRow(-1);
	
	text_id.value = '';
	text_name.value = '';
	text_atk.value = '';
	text_def.value = '';
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
	atk_relation.selectedIndex = 0;
	def_relation.selectedIndex = 0;
	
	if(!valid)
		return;
	
	// Prepare a statement
	var stmt = db.prepare(qstr);
        stmt.bind({'@cid': cid});
	while(stmt.step()) {
		// execute
		var result = stmt.getAsObject();
		
		if(is_virtual(result))
			continue;			
		var row = table1.insertRow(-1);
		var cell1 = row.insertCell(-1);
		var cell2 = row.insertCell(-1);
		var cell3 = row.insertCell(-1);
		
		
		cell1.innerHTML = "<a href=\'https://yugipedia.com/wiki/" + result.id.toString().padStart(8, '0') + "\' target=\'_blank\'>" + result.id.toString().padStart(8, '0') + "</a>";
		if(result.ot == 2)
			cell2.innerHTML = "<span style=\'color: red;\'>" + result.name + "</span>";
		else
			cell2.innerHTML = result.name;
		
		var mtype = '';
		var subtype = '';
		var extype = '';
		var lvstr = 'L';
		if(result.type & TYPE_MONSTER){
			mtype = '';
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
			
			if(!(result.type & TYPE_LINK)){
				//cell_def.innerHTML = print_ad(result.def);
				data = data + '/' + print_ad(result.def);
			}
			if(result.type & TYPE_PENDULUM){
				//cell_scale.innerHTML = "刻度" + ((result.level >> 24) & 0xff);
				data = data + '/刻度' + ((result.level >> 24) & 0xff);
			}
			cell_data.innerHTML = data;
			cell_data.colSpan = "3";
		}
		
		var row_effect = table1.insertRow(-1);    
		var cell_effect = row_effect.insertCell(-1);
		cell_effect.innerHTML = result.desc.replace(/\r\n/g, "<br>");
		cell_effect.colSpan = "3";
	}
}

function key_search(e){
	if(!ready)
		return;
	switch (e.key) {
		case 'Enter':
			query1();
			break;
	}
}

function add_opt(sel, value, text){
	var opt = document.createElement("option");
	opt.value = value.toString(16);
	opt.text = text;
	sel.add(opt);
}

function create_subtype(){
	var select_type = document.getElementById('select_type');
	var select_subtype1 = document.getElementById('select_subtype1');
	var select_subtype2 = document.getElementById('select_subtype2');
	var opt;
	
	var len = select_subtype1.length;
	for(var i=1; i < len; ++i)
		select_subtype1.remove(select_subtype1.length - 1);
	
	len = select_subtype2.length;
	for(var i=1; i < len; ++i)
		select_subtype2.remove(select_subtype2.length - 1);
	select_subtype2.style.visibility = "hidden";
	
	switch(select_type.value){
		case 'TYPE_MONSTER':
			add_opt(select_subtype1, TYPE_NORMAL, '通常');
			add_opt(select_subtype1, TYPE_RITUAL, '儀式');
			add_opt(select_subtype1, TYPE_FUSION, '融合');
			add_opt(select_subtype1, TYPE_SYNCHRO, '同步');
			add_opt(select_subtype1, TYPE_XYZ, '超量');
			add_opt(select_subtype1, TYPE_PENDULUM, '靈擺');
			add_opt(select_subtype1, TYPE_LINK, '連結');
			
			var opt = document.createElement("option");
			opt.value = 'deck';
			opt.text = '（牌組）';
			select_subtype1.add(opt);
			opt = document.createElement("option");
			opt.value = 'extra';
			opt.text = '（額外）'; 
			select_subtype1.add(opt);
			
			add_opt(select_subtype2, TYPE_SPIRIT, '/靈魂');
			add_opt(select_subtype2, TYPE_UNION, '/聯合');
			add_opt(select_subtype2, TYPE_DUAL, '/二重');
			add_opt(select_subtype2, TYPE_TUNER, '/協調');
			add_opt(select_subtype2, TYPE_FLIP, '/反轉');
			add_opt(select_subtype2, TYPE_TOON, '/卡通');
			add_opt(select_subtype2, TYPE_SPSUMMON, '/特殊召喚');
			select_subtype2.style.visibility = 'visible';
			break;
		case 'TYPE_SPELL':
			add_opt(select_subtype1, 0, '通常');
			add_opt(select_subtype1, TYPE_QUICKPLAY, '速攻');
			add_opt(select_subtype1, TYPE_CONTINUOUS, '永續');
			add_opt(select_subtype1, TYPE_EQUIP, '裝備');
			add_opt(select_subtype1, TYPE_FIELD, '場地');
			break;
		case 'TYPE_TRAP':
			add_opt(select_subtype1, 0, '通常');
			add_opt(select_subtype1, TYPE_CONTINUOUS, '永續');
			add_opt(select_subtype1, TYPE_COUNTER, '反擊');
			break;
	}
}
