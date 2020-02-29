function key_search(e){
	if(!ready)
		return;
	switch (e.key) {
		case 'Enter':
			query();
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
		case '0x1':
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
		case '0x2':
			add_opt(select_subtype1, 0, '通常');
			add_opt(select_subtype1, TYPE_QUICKPLAY, '速攻');
			add_opt(select_subtype1, TYPE_CONTINUOUS, '永續');
			add_opt(select_subtype1, TYPE_EQUIP, '裝備');
			add_opt(select_subtype1, TYPE_RITUAL, '儀式');
			add_opt(select_subtype1, TYPE_FIELD, '場地');
			break;
		case '0x4':
			add_opt(select_subtype1, 0, '通常');
			add_opt(select_subtype1, TYPE_CONTINUOUS, '永續');
			add_opt(select_subtype1, TYPE_COUNTER, '反擊');
			break;
	}
}
function clear_attr(){
	var cb_attr = document.getElementsByName("cb_attr");
	for(let i = 0; i < cb_attr.length; ++i){
		cb_attr[i].checked = false;
	}
	var rst = document.getElementById('attr_reset');
	rst.checked = false;
}

function clear_race(){
	var cb_race = document.getElementsByName("cb_race");
	for(let i = 0; i < cb_race.length; ++i){
		cb_race[i].checked = false;
	}
	var rst = document.getElementById('race_reset');
	rst.checked = false;
}
