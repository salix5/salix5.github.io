function key_search(){
	if(!ready)
		return;
	switch (event.key) {
		case 'Enter':
			query();
			return;
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
	var select_ao = document.getElementById('select_ao');
	var m = document.getElementById('subtype_m');
	var s = document.getElementById('subtype_s');
	var t = document.getElementById('subtype_t');
	/*var select_subtype1 = document.getElementById('select_subtype1');
	var select_subtype2 = document.getElementById('select_subtype2');
	var opt;
	
	var len = select_subtype1.length;
	for(var i=1; i < len; ++i)
		select_subtype1.remove(select_subtype1.length - 1);
	
	len = select_subtype2.length;
	for(var i=1; i < len; ++i)
		select_subtype2.remove(select_subtype2.length - 1);
	select_subtype2.style.visibility = "hidden";*/
	switch(select_type.value){
		case '':
			m.style.display = 'none';
			s.style.display = 'none';
			t.style.display = 'none';
			select_ao.style.display = 'none';
			break;
		case 'm':
			/*add_opt(select_subtype1, TYPE_NORMAL, '通常');
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
			select_subtype2.style.visibility = 'visible';*/
			m.style.display = 'initial';
			s.style.display = 'none';
			t.style.display = 'none';
			select_ao.style.display = 'initial';
			break;
		case 's':
			/*add_opt(select_subtype1, 0, '通常');
			add_opt(select_subtype1, TYPE_QUICKPLAY, '速攻');
			add_opt(select_subtype1, TYPE_CONTINUOUS, '永續');
			add_opt(select_subtype1, TYPE_EQUIP, '裝備');
			add_opt(select_subtype1, TYPE_RITUAL, '儀式');
			add_opt(select_subtype1, TYPE_FIELD, '場地');*/
			s.style.display = 'initial';
			m.style.display = 'none';
			t.style.display = 'none';
			select_ao.style.display = 'none';
			break;
		case 't':
			/*add_opt(select_subtype1, 0, '通常');
			add_opt(select_subtype1, TYPE_CONTINUOUS, '永續');
			add_opt(select_subtype1, TYPE_COUNTER, '反擊');*/
			t.style.display = 'initial';
			m.style.display = 'none';
			s.style.display = 'none';
			select_ao.style.display = 'none';
			break;
	}
	
}

function clear_cb(type){
	var cb_list = document.getElementsByName('cb_' + type);
	for(let i = 0; i < cb_list.length; ++i){
		cb_list[i].checked = false;
	}
	var rst = document.getElementById(type + '_reset');
	rst.checked = false;
}
