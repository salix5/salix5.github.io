"use strict";
const MAX_WIDTH = 900;	// table width

const text_id = document.getElementById('text_id');
const text_name = document.getElementById('text_name');
const text_effect = document.getElementById('text_effect');
const text_multi = document.getElementById('text_multi');

const text_lv1 = document.getElementById('text_lv1');
const text_lv2 = document.getElementById('text_lv2');
const text_sc1 = document.getElementById('text_sc1');
const text_sc2 = document.getElementById('text_sc2');

const text_atk1 = document.getElementById('text_atk1');
const text_atk2 = document.getElementById('text_atk2');
const text_def1 = document.getElementById('text_def1');
const text_def2 = document.getElementById('text_def2');

const select_ot  = document.getElementById('select_ot');
const select_type = document.getElementById('select_type');
const select_ao1 = document.getElementById('select_ao1');
const select_ao2 = document.getElementById('select_ao2');

const subtype_m = document.getElementById('subtype_m');
const subtype_s = document.getElementById('subtype_s');
const subtype_t = document.getElementById('subtype_t');

const mtype_deck = document.getElementById('mtype_deck');
const stype1 = document.getElementById('stype1');
const ttype1 = document.getElementById('ttype1');

const cb_mtype = document.getElementsByName('cb_mtype');
const cb_stype = document.getElementsByName('cb_stype');
const cb_ttype = document.getElementsByName('cb_ttype');
const cb_marker = document.getElementsByName('cb_marker');
const cb_attr = document.getElementsByName("cb_attr");
const cb_race = document.getElementsByName("cb_race");

const cb_mtype_reset  = document.getElementById('cb_mtype_reset');
const cb_stype_reset  = document.getElementById('cb_stype_reset');
const cb_ttype_reset  = document.getElementById('cb_ttype_reset');
const cb_attr_reset  = document.getElementById('cb_attr_reset');
const cb_race_reset  = document.getElementById('cb_race_reset');

const row_lv = document.getElementById('row_lv');
const row_sc = document.getElementById('row_sc');
const row_marker = document.getElementById('row_marker');
const row_attr = document.getElementById('row_attr');
const row_race = document.getElementById('row_race');
const row_atk = document.getElementById('row_atk');
const row_def = document.getElementById('row_def');

const form1 = document.getElementById('form1');
const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');
const table_result = document.getElementById('table_result');

function create_subtype(event){
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
select_type.onchange = create_subtype;

function clear_cb(name){
	var cb_list = document.getElementsByName(name);
	for(let i = 0; i < cb_list.length; ++i){
		cb_list[i].checked = false;
	}
	if(name != 'cb_marker'){
		var rst = document.getElementById(name + '_reset');
		rst.checked = false;
	}
}
cb_mtype_reset.onchange = function(event){clear_cb('cb_mtype');};
cb_stype_reset.onchange = function(event){clear_cb('cb_stype');};
cb_ttype_reset.onchange = function(event){clear_cb('cb_ttype');};
cb_attr_reset.onchange = function(event){clear_cb('cb_attr');};
cb_race_reset.onchange = function(event){clear_cb('cb_race');};

function clear_query(){
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
	text_multi.value = '';
	
	select_ot.selectedIndex = 0;
	select_type.selectedIndex = 0;
	select_ao1.selectedIndex = 0;
	select_ao1.style.display = 'none';
	select_ao2.selectedIndex = 0;
	
	clear_cb('cb_mtype');
	clear_cb('cb_stype');
	clear_cb('cb_ttype');
	subtype_m.style.display = 'none';
	subtype_s.style.display = 'none';
	subtype_t.style.display = 'none';
	row_lv.style.display = '';
	row_sc.style.display = '';
	row_marker.style.display = '';
	row_attr.style.display = '';
	row_race.style.display = '';
	row_atk.style.display = '';
	row_def.style.display = '';
	
	clear_cb('cb_attr');
	clear_cb('cb_race');
	clear_cb('cb_marker');
}
button2.onclick = function(event){
	clear_query();
	if(window.location.search.substring(1))
		window.location.search = '';
};

function init(event){
	if(window.innerWidth > MAX_WIDTH)
		table_result.style.width = MAX_WIDTH + 'px';
	else
		table_result.style.width = '100%';
	clear_query();
	button1.disabled = true;
	button2.disabled = true;
}
document.body.onload = init;
