function key_search(){
	var button1 = document.getElementById('button1');
	if(button1.disabled)
		return;
	switch (event.key) {
		case 'Enter':
			button1.click();
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
	var select_ao1 = document.getElementById('select_ao1');
	var m = document.getElementById('subtype_m');
	var s = document.getElementById('subtype_s');
	var t = document.getElementById('subtype_t');
	var row_lv = document.getElementById('row_lv');
	var row_sc = document.getElementById('row_sc');
	var row_marker = document.getElementById('row_marker');
	var row_attr = document.getElementById('row_attr');
	var row_race = document.getElementById('row_race');
	var row_atk = document.getElementById('row_atk');
	var row_def = document.getElementById('row_def');
	
	switch(select_type.value){
		case '':
			m.style.display = 'none';
			s.style.display = 'none';
			t.style.display = 'none';
			select_ao1.style.display = 'none';
			row_lv.style.display = '';
			row_sc.style.display = '';
			row_marker.style.display = '';
			row_attr.style.display = '';
			row_race.style.display = '';
			row_atk.style.display = '';
			row_def.style.display = '';
			break;
		case 'm':
			m.style.display = '';
			s.style.display = 'none';
			t.style.display = 'none';
			select_ao1.style.display = '';
			row_lv.style.display = '';
			row_sc.style.display = '';
			row_marker.style.display = '';
			row_attr.style.display = '';
			row_race.style.display = '';
			row_atk.style.display = '';
			row_def.style.display = '';
			break;
		case 's':
			m.style.display = 'none';
			s.style.display = '';
			t.style.display = 'none';
			select_ao1.style.display = 'none';
			row_lv.style.display = 'none';
			row_sc.style.display = 'none';
			row_marker.style.display = 'none';
			row_attr.style.display = 'none';
			row_race.style.display = 'none';
			row_atk.style.display = 'none';
			row_def.style.display = 'none';
			break;
		case 't':
			m.style.display = 'none';
			s.style.display = 'none';
			t.style.display = '';
			select_ao1.style.display = 'none';
			row_lv.style.display = 'none';
			row_sc.style.display = 'none';
			row_marker.style.display = 'none';
			row_attr.style.display = 'none';
			row_race.style.display = 'none';
			row_atk.style.display = 'none';
			row_def.style.display = 'none';
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
