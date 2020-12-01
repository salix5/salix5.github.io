const MAX_WIDTH = 900;	// table width

function add_opt(sel, value, text){
	var opt = document.createElement("option");
	opt.value = value.toString(16);
	opt.text = text;
	sel.add(opt);
}

function create_subtype(){
	var select_type = document.getElementById('select_type');
	var select_ao1 = document.getElementById('select_ao1');
	var subtype_m = document.getElementById('subtype_m');
	var subtype_s = document.getElementById('subtype_s');
	var subtype_t = document.getElementById('subtype_t');
	var row_lv = document.getElementById('row_lv');
	var row_sc = document.getElementById('row_sc');
	var row_marker = document.getElementById('row_marker');
	var row_attr = document.getElementById('row_attr');
	var row_race = document.getElementById('row_race');
	var row_atk = document.getElementById('row_atk');
	var row_def = document.getElementById('row_def');
	
	switch(select_type.value){
		case '':
			subtype_m.style.display = 'none';
			subtype_s.style.display = 'none';
			subtype_t.style.display = 'none';
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
			subtype_m.style.display = '';
			subtype_s.style.display = 'none';
			subtype_t.style.display = 'none';
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
			subtype_m.style.display = 'none';
			subtype_s.style.display = '';
			subtype_t.style.display = 'none';
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
			subtype_m.style.display = 'none';
			subtype_s.style.display = 'none';
			subtype_t.style.display = '';
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
	if(type != 'marker'){
		var rst = document.getElementById(type + '_reset');
		rst.checked = false;
	}
}

function clear_query(){
	var text_id = document.getElementById('text_id');
	var text_name = document.getElementById('text_name');
	var text_effect = document.getElementById('text_effect');
	
	var text_lv1 = document.getElementById('text_lv1');
	var text_lv2 = document.getElementById('text_lv2');
	var text_sc1 = document.getElementById('text_sc1');
	var text_sc2 = document.getElementById('text_sc2');
	
	var text_atk1 = document.getElementById('text_atk1');
	var text_atk2 = document.getElementById('text_atk2');
	var text_def1 = document.getElementById('text_def1');
	var text_def2 = document.getElementById('text_def2');
	
	var select_ot  = document.getElementById('select_ot');
	var select_type = document.getElementById('select_type');
	var select_ao1 = document.getElementById('select_ao1');
	var select_ao2 = document.getElementById('select_ao2');
	
	var dm = document.getElementById('subtype_m');
	var ds = document.getElementById('subtype_s');
	var dt = document.getElementById('subtype_t');
	
	var row_lv = document.getElementById('row_lv');
	var row_sc = document.getElementById('row_sc');
	var row_marker = document.getElementById('row_marker');
	var row_attr = document.getElementById('row_attr');
	var row_race = document.getElementById('row_race');
	var row_atk = document.getElementById('row_atk');
	var row_def = document.getElementById('row_def');
	
	text_id.value = '';
	text_name.value = '';
	text_lv1.value = '';
	text_lv2.value = '';
	text_sc1.value = '';
	text_sc2.value = '';
	
	text_atk1.value = '';
	text_atk2.value = '';
	text_def1.value = '';
	text_def2.value = '';
	text_effect.value = '';
	
	select_ot.selectedIndex = 0;
	select_type.selectedIndex = 0;
	select_ao1.selectedIndex = 0;
	select_ao1.style.display = 'none';
	select_ao2.selectedIndex = 0;
	
	clear_cb('mtype');
	clear_cb('stype');
	clear_cb('ttype');
	dm.style.display = 'none';
	ds.style.display = 'none';
	dt.style.display = 'none';
	row_lv.style.display = '';
	row_sc.style.display = '';
	row_marker.style.display = '';
	row_attr.style.display = '';
	row_race.style.display = '';
	row_atk.style.display = '';
	row_def.style.display = '';
	
	clear_cb('attr');
	clear_cb('race');
	clear_cb('marker');
}

function init(){
	var button1 = document.getElementById('button1');
	var button2 = document.getElementById('button2');
	var table_result = document.getElementById('table_result');
	if(window.innerWidth > MAX_WIDTH)
		table_result.style.width = MAX_WIDTH + 'px';
	else
		table_result.style.width = '90%';
	clear_query();
	button1.disabled = true;
	button2.disabled = true;
}
