"use strict";

function submit_query(event){
	var params = new URLSearchParams();
	
	button1.disabled = true;
	button2.disabled = true;
	// id or name of the 2 cards
	let cdata1 = text_id1.value.toHalfWidth();
	if (is_str(cdata1))
		params.set('id1', cdata1);
	let cdata2 = text_id2.value.toHalfWidth();
	if (is_str(cdata2))
		params.set('id2', cdata2);
	
	// pack
	let pack = select_ot.value.toHalfWidth();
	if(is_str(pack))
		params.set('pack', pack);
	
	// type
	params.set('type', TYPE_MONSTER);
	let subtype = 0;
	for(let i = 0; i < cb_mtype.length; ++i){
		if(cb_mtype[i].checked)
			subtype |= id_to_type[cb_mtype[i].id];
	}
	if(subtype){
		params.set('subtype', subtype.toString(10));
		// default: or
		if(select_subtype_op.value == 'and')
			params.set('sub_op', 1);
		else
			params.set('sub_op', 0);
	}
	// exclude has the same checkboxes
	let exc = 0;
	for(let i = 0; i < cb_exclude.length; ++i){
		if(cb_exclude[i].checked)
			exc |= id_to_type[cb_mtype[i].id];
	}
	if(exc) {
		params.set('exc', exc.toString(10));
	}
	
	// atk
	let atk1 = -10;
	let atk2 = -10;
	if(text_atk1.value && text_atk1.value.length <= MAX_DIGIT)
		atk1 = parseInt(text_atk1.value, 10);
	if(text_atk2.value && text_atk2.value.length <= MAX_DIGIT)
		atk2 = parseInt(text_atk2.value, 10);

	if(is_atk(atk1) || is_atk(atk2)){
		if(atk1 == -1 || atk2 == -1){
			params.set('atk1', -1);
		}
		else if(!is_atk(atk2)){
			params.set('atk1', atk1);
		}
		else if(!is_atk(atk1)){
			params.set('atk1', atk2);
		}
		else {
			params.set('atk1', atk1);
			params.set('atk2', atk2);
		}
	}

	let atk_mod = -10;
	if (text_atk_mod.value && text_atk_mod.value.length <= MAX_DIGIT)
		atk_mod = parseInt(text_atk_mod.value, 10);
	if (is_normal_atk(atk_mod))
		params.set('atkm', atk_mod);
	
	// def, exclude link monsters
	let def1 = -10;
	let def2 = -10;
	if(text_def1.value && text_def1.value.length <= MAX_DIGIT)
		def1 = parseInt(text_def1.value, 10);
	if(text_def2.value && text_def2.value.length <= MAX_DIGIT)
		def2 = parseInt(text_def2.value, 10);
	if(is_def(def1) || is_def(def2)){
		if(def1 == -1 || def2 == -1){
			params.set('def1', -1);
		}
		else if(def1 == -2 || def2 == -2){
			params.set('def1', -2);
		}
		else if(!is_def(def2)){
			params.set('def1', def1);
		}
		else if(!is_def(def1)){
			params.set('def1', def2);
		}
		else {
			params.set('def1', def1);
			params.set('def2', def2);
		}
	}

	let def_mod = -10;
	if (text_def_mod.value && text_def_mod.value.length <= MAX_DIGIT)
		def_mod = parseInt(text_def_mod.value, 10);
	if (is_normal_atk(def_mod))
		params.set('defm', def_mod);

	// sum
	let sum = -10;
	if(text_sum.value && text_sum.value.length <= MAX_DIGIT)
		sum = parseInt(text_sum.value, 10);
	if(is_normal_atk(sum))
		params.set('sum', sum);
	
	// lv, scale
	let lv1 = -10;
	let lv2 = -10;
	let sc1 = -10;
	let sc2 = -10;
	if(text_lv1.value && text_lv1.value.length <= MAX_DIGIT)
		lv1 = parseInt(text_lv1.value, 10);
	if(text_lv2.value && text_lv2.value.length <= MAX_DIGIT)
		lv2 = parseInt(text_lv2.value, 10);
	if(text_sc1.value && text_sc1.value.length <= MAX_DIGIT)
		sc1 = parseInt(text_sc1.value, 10);
	if(text_sc2.value && text_sc2.value.length <= MAX_DIGIT)
		sc2 = parseInt(text_sc2.value, 10);
	if(is_lv(lv1) || is_lv(lv2)){
		if(!is_lv(lv2)){
			params.set('lv1', lv1);
		}
		else if(!is_lv(lv1)){
			params.set('lv1', lv2);
		}
		else{
			params.set('lv1', lv1);
			params.set('lv2', lv2);
		}
	}
	if(is_scale(sc1) || is_scale(sc2)){			
		if(!is_scale(sc2)){
			params.set('sc1', sc1);
		}
		else if(!is_scale(sc1)){
			params.set('sc1', sc2);
		}
		else{
			params.set('sc1', sc1);
			params.set('sc2', sc2);
		}
	}
	
	// attr, race
	let cattr = 0;
	for(let i = 0; i < cb_attr.length; ++i){
		if(cb_attr[i].checked)
			cattr |= index_to_attr[i];
	}
	if(cattr){
		params.set('attr', cattr.toString(10));
	}
	
	let crace = 0;
	for(let i = 0; i < cb_race.length; ++i){
		if(cb_race[i].checked)
			crace |= index_to_race[i];
	}
	if(crace){
		params.set('race', crace.toString(10));
	}
			
		
	//multi
	let cmulti = text_multi.value.toHalfWidth();
	if(is_str(cmulti))
		params.set('multi', cmulti);
	else{
		// name
		let cname = text_name.value.toHalfWidth();
		if(is_str(cname))
			params.set('name', cname);
		
		//effect
		let cdesc = text_effect.value.toHalfWidth();
		if(is_str(cdesc))
			params.set('desc', cdesc);
	}
	let clocale = select_locale.value;
	if(is_str(clocale))
		params.set('locale', clocale);
	
	document.activeElement.blur();
	event.preventDefault();
	if(params.toString() != ''){
		window.location.search = '?' + params.toString();
	}
	else{
		button1.disabled = false;
		button2.disabled = false;
	}
}
form1.onsubmit = submit_query;

function url_query(){
	if(window.location.search.substring(1) == '')
		return;
	var params = new URLSearchParams(window.location.search);
	server_analyze2(params);
}
