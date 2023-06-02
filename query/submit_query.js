"use strict";

function submit_query(event) {
	var params = new URLSearchParams();
	var cid = 0;

	button1.disabled = true;
	button2.disabled = true;
	// id
	if (text_id.value)
		cid = parseInt(text_id.value, 10);
	if (cid && cid > 0) {
		params.set('id', cid.toString().padStart(8, '0'));
	}
	else {
		// pack
		let pack = select_ot.value;
		if (pack)
			params.set('pack', pack);

		// type
		let subtype = 0;
		switch (select_type.value) {
			case '1':
				params.set('type', TYPE_MONSTER);
				for (let i = 0; i < cb_mtype.length; ++i) {
					if (cb_mtype[i].checked)
						subtype |= id_to_type[cb_mtype[i].id];
				}
				if (subtype) {
					params.set('subtype', subtype.toString(10));
					// default: or
					if (select_subtype_op.value == 'and')
						params.set('sub_op', 1);
					else
						params.set('sub_op', 0);
				}
				// exclude has the same checkboxes
				let exc = 0;
				for (let i = 0; i < cb_exclude.length; ++i) {
					if (cb_exclude[i].checked)
						exc |= id_to_type[cb_mtype[i].id];
				}
				if (exc) {
					params.set('exc', exc.toString(10));
				}
				break;
			case '2':
				params.set('type', TYPE_SPELL);
				for (let i = 0; i < cb_stype.length; ++i) {
					if (cb_stype[i].checked)
						subtype |= id_to_type[cb_stype[i].id];
				}
				if (subtype)
					params.set('subtype', subtype.toString(10));
				break;
			case '3':
				params.set('type', TYPE_TRAP);
				for (let i = 0; i < cb_ttype.length; ++i) {
					if (cb_ttype[i].checked)
						subtype |= id_to_type[cb_ttype[i].id];
				}
				if (subtype)
					params.set('subtype', subtype.toString(10));
				break;
			default:
				break;
		}

		if (select_type.value === '' || select_type.value === '1') {
			// mat
			let mat = text_mat.value;
			if (mat)
				params.set('mat', mat);

			// atk
			if (text_atk1.value)
				params.set('atk1', text_atk1.value);
			if (text_atk2.value)
				params.set('atk2', text_atk2.value);

			// def
			if (text_def1.value)
				params.set('def1', text_def1.value);
			if (text_def2.value)
				params.set('def2', text_def2.value);

			// sum
			if (text_sum.value)
				params.set('sum', text_sum.value);

			// lv, scale
			if (text_lv1.value)
				params.set('lv1', text_lv1.value);
			if (text_lv2.value)
				params.set('lv2', text_lv2.value);
			if (text_sc1.value)
				params.set('sc1', text_sc1.value);
			if (text_sc2.value)
				params.set('sc2', text_sc2.value);

			// attr, race
			let cattr = 0;
			for (let i = 0; i < cb_attr.length; ++i) {
				if (cb_attr[i].checked)
					cattr |= index_to_attr[i];
			}
			if (cattr) {
				params.set('attr', cattr.toString(10));
			}

			let crace = 0;
			for (let i = 0; i < cb_race.length; ++i) {
				if (cb_race[i].checked)
					crace |= index_to_race[i];
			}
			if (crace) {
				params.set('race', crace.toString(10));
			}

			// marker
			let cmarker = 0;
			for (let i = 0; i < cb_marker.length; ++i) {
				if (cb_marker[i].checked) {
					cmarker |= index_to_marker[i];
				}
			}
			if (cmarker) {
				params.set('marker', cmarker.toString(10));
				if (select_marker_op.value === 'and')
					params.set('marker_op', 1);
				else
					params.set('marker_op', 0);
			}
		}

		//multi
		let cmulti = text_multi.value;
		if (cmulti)
			params.set('multi', cmulti);
		else {
			// name
			let cname = text_name.value;
			if (cname)
				params.set('name', cname);

			//effect
			let cdesc = text_effect.value;
			if (cdesc)
				params.set('desc', cdesc);
		}
		let clocale = select_locale.value;
		if (clocale)
			params.set('locale', clocale);
	}
	document.activeElement.blur();
	event.preventDefault();
	button1.disabled = false;
	button2.disabled = false;
	if (params.toString() !== '') {
		window.location.search = '?' + params.toString();
	}
}
//form1.onsubmit = submit_query;

function url_query() {
	if (window.location.search.substring(1) === '')
		return;
	let params = new URLSearchParams(window.location.search);
	server_analyze1(params);
}

/*db_ready.then(() => {
	url_query();
	button1.disabled = false;
	button2.disabled = false;
});*/
