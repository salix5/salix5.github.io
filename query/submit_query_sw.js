"use strict";

function submit_query(event) {
	var params = new URLSearchParams();

	button1.disabled = true;
	button2.disabled = true;
	// id or name of the 2 cards
	let cdata1 = text_id1.value;
	if (cdata1)
		params.set("id1", cdata1);
	let cdata2 = text_id2.value;
	if (cdata2)
		params.set("id2", cdata2);

	// pack
	let pack = select_ot.value;
	if (pack)
		params.set("pack", pack);

	// type
	params.set("type", TYPE_MONSTER);
	let subtype = 0;
	for (let i = 0; i < cb_mtype.length; ++i) {
		if (cb_mtype[i].checked)
			subtype |= id_to_type[cb_mtype[i].id];
	}
	if (subtype) {
		params.set("subtype", subtype.toString(10));
		// default: or
		if (select_subtype_op.value === "1")
			params.set("sub_op", 1);
		else
			params.set("sub_op", 0);
	}
	// exclude has the same checkboxes
	let exc = 0;
	for (let i = 0; i < cb_exclude.length; ++i) {
		if (cb_exclude[i].checked)
			exc |= id_to_type[cb_mtype[i].id];
	}
	if (exc) {
		params.set("exc", exc.toString(10));
	}

	// atk
	if (text_atk1.value)
		params.set("atk1", text_atk1.value);
	if (text_atk2.value)
		params.set("atk2", text_atk2.value);

	// def
	if (text_def1.value)
		params.set("def1", text_def1.value);
	if (text_def2.value)
		params.set("def2", text_def2.value);

	// sum
	if (text_sum.value)
		params.set("sum", text_sum.value);

	// lv, scale
	if (text_lv1.value)
		params.set("lv1", text_lv1.value);
	if (text_lv2.value)
		params.set("lv2", text_lv2.value);
	if (text_sc1.value)
		params.set("sc1", text_sc1.value);
	if (text_sc2.value)
		params.set("sc2", text_sc2.value);

	// attr, race
	let cattr = 0;
	for (let i = 0; i < cb_attr.length; ++i) {
		if (cb_attr[i].checked)
			cattr |= index_to_attr[i];
	}
	if (cattr) {
		params.set("attr", cattr.toString(10));
	}

	let crace = 0;
	for (let i = 0; i < cb_race.length; ++i) {
		if (cb_race[i].checked)
			crace |= index_to_race[i];
	}
	if (crace) {
		params.set("race", crace.toString(10));
	}


	//multi
	let cmulti = text_multi.value;
	if (cmulti)
		params.set("multi", cmulti);
	else {
		// name
		let cname = text_name.value;
		if (cname)
			params.set("name", cname);

		//effect
		let cdesc = text_effect.value;
		if (cdesc)
			params.set("desc", cdesc);
	}
	let clocale = select_locale.value;
	if (clocale)
		params.set("locale", clocale);

	document.activeElement.blur();
	event.preventDefault();
	button1.disabled = false;
	button2.disabled = false;
	if (params.toString() !== "") {
		window.location.search = "?" + params.toString();
	}
}
form1.onsubmit = submit_query;

function url_query() {
	if (window.location.search.substring(1) === "")
		return;
	var params = new URLSearchParams(window.location.search);
	server_analyze2(params);
}

db_ready.then(() => {
	url_query();
	button1.disabled = false;
	button2.disabled = false;
});
