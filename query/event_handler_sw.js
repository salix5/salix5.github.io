"use strict";
const text_id1 = document.getElementById('text_id1');
const text_id2 = document.getElementById('text_id2');
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

const select_ot = document.getElementById('select_ot');
const select_type = null;
const select_subtype_op = document.getElementById('select_subtype_op');

const subtype_m = document.getElementById('subtype_m');
const cb_mtype = document.getElementsByName('cb_mtype');
const cb_exclude = document.getElementsByName('cb_exclude');
const cb_attr = document.getElementsByName('cb_attr');
const cb_race = document.getElementsByName('cb_race');
const list_cb = ['cb_mtype', 'cb_exclude', 'cb_attr', 'cb_race'];

// reset combobox, excluding cb_marker
const cb_mtype_reset = document.getElementById('cb_mtype_reset');
const cb_exclude_reset = document.getElementById('cb_exclude_reset');
const cb_attr_reset = document.getElementById('cb_attr_reset');
const cb_race_reset = document.getElementById('cb_race_reset');

const row_lv = document.getElementById('row_lv');
const row_sc = document.getElementById('row_sc');
const row_attr = document.getElementById('row_attr');
const row_race = document.getElementById('row_race');
const row_atk = document.getElementById('row_atk');
const row_def = document.getElementById('row_def');
const row_subtype = document.getElementById('row_subtype');
const row_exclude = document.getElementById('row_exclude');
const row_button = document.getElementById('row_button');

const form1 = document.getElementById('form1');
const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');
const table_result = document.getElementById('table_result');


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

cb_mtype_reset.onchange = function(event){
	clear_cb('cb_mtype');
	select_subtype_op.selectedIndex = 0;
};
cb_exclude_reset.onchange = function(event){clear_cb('cb_exclude');};
cb_attr_reset.onchange = function(event){clear_cb('cb_attr');};
cb_race_reset.onchange = function(event){clear_cb('cb_race');};

function clear_query(){
	text_id1.value = '';
	text_id2.value = '';
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
	select_subtype_op.selectedIndex = 0;
	list_cb.forEach(element => clear_cb(element));
}

button2.onclick = function(event){
	clear_query();
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