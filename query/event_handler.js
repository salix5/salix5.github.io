"use strict";
const text_id = document.getElementById("text_id");
const text_name = document.getElementById("text_name");
const text_effect = document.getElementById("text_effect");
const text_keyword = document.getElementById("text_keyword");

const text_lv1 = document.getElementById("text_lv1");
const text_lv2 = document.getElementById("text_lv2");
const text_sc1 = document.getElementById("text_sc1");
const text_sc2 = document.getElementById("text_sc2");
const text_atk1 = document.getElementById("text_atk1");
const text_atk2 = document.getElementById("text_atk2");
const text_def1 = document.getElementById("text_def1");
const text_def2 = document.getElementById("text_def2");
const text_sum = document.getElementById("text_sum");
const text_mat = document.getElementById("text_mat");
const monster_textbox = [text_lv1, text_lv2, text_sc1, text_sc2, text_atk1, text_atk2, text_def1, text_def2, text_sum, text_mat];

const select_locale = document.getElementById("select_locale");
const select_ot = document.getElementById("select_ot");
const select_type = document.getElementById("select_type");

const select_subtype_op = document.getElementById("select_subtype_op");
const select_marker_op = document.getElementById("select_marker_op");
const monster_select = [select_marker_op];

// 3 div for different type
const subtype_m = document.getElementById("subtype_m");
const subtype_s = document.getElementById("subtype_s");
const subtype_t = document.getElementById("subtype_t");

const stype1 = document.getElementById("stype1");
const ttype1 = document.getElementById("ttype1");

const cb_mtype = document.getElementsByName("mtype");
const cb_exclude = document.getElementsByName("exclude");
const cb_stype = document.getElementsByName("stype");
const cb_ttype = document.getElementsByName("ttype");

const cb_marker = document.getElementsByName("marker");
const cb_attr = document.getElementsByName("attr");
const cb_race = document.getElementsByName("race");
const monster_checkbox = ["marker", "attr", "race"];

const subtype_operator = document.getElementById("subtype_operator");
const subtype_reset = document.getElementById("subtype_reset");
const exclude_reset = document.getElementById("exclude_reset");
const attr_reset = document.getElementById("attr_reset");
const race_reset = document.getElementById("race_reset");
const marker_reset = document.getElementById("marker_reset");

const row_subtype = document.getElementsByClassName("row_subtype");
const row_exclude = document.getElementsByClassName("row_exclude");
const monster_row = document.getElementsByClassName("monster_property");

const form1 = document.getElementById("form1");
const row_button = document.getElementById("row_button");
const button1 = document.getElementById("button1");
const button2 = document.getElementById("button2");

const div_count = document.getElementById("div_count");
const div_page = document.getElementById("div_page");
const select_page = document.getElementById("select_page");
const table_result = document.getElementById("table_result");

function clear_cb(name) {
	let cb_list = document.getElementsByName(name);
	for (const cb of cb_list) {
		cb.checked = false;
	}
}

function disable_cb(name, status) {
	let cb_list = document.getElementsByName(name);
	for (const cb of cb_list) {
		cb.disabled = status;
	}
}

function hide_type(type, status) {
	switch (type) {
		case 0:
			for (const row of monster_row) {
				row.hidden = status;
			}
			for (const textbox of monster_textbox) {
				textbox.disabled = status;
			}
			for (const select of monster_select) {
				select.disabled = status;
			}
			for (const cbname of monster_checkbox) {
				disable_cb(cbname, status);
			}
			break;
		case 1:
			for (const row of row_subtype)
				row.hidden = status;
			for (const row of row_exclude)
				row.hidden = status;
			subtype_operator.hidden = status;
			subtype_m.hidden = status;
			select_subtype_op.disabled = status;
			disable_cb("mtype", status);
			disable_cb("exclude", status);
			break;
		case 2:
			for (const row of row_subtype)
				row.hidden = status;
			subtype_s.hidden = status;
			disable_cb("stype", status);
			break;
		case 3:
			for (const row of row_subtype)
				row.hidden = status;
			subtype_t.hidden = status;
			disable_cb("ttype", status);
			break;
		default:
			break;
	}
}

select_type.addEventListener("change", function (event) {
	switch (event.currentTarget.value) {
		case "1":
			hide_type(2, true);
			hide_type(3, true);
			hide_type(0, false);
			hide_type(1, false);
			break;
		case "2":
			hide_type(0, true);
			hide_type(1, true);
			hide_type(3, true);
			hide_type(2, false);
			break;
		case "3":
			hide_type(0, true);
			hide_type(1, true);
			hide_type(2, true);
			hide_type(3, false);
			break;
		default:
			hide_type(1, true);
			hide_type(2, true);
			hide_type(3, true);
			hide_type(0, false);
			break;
	}
});

subtype_reset.addEventListener("click", function (event) {
	clear_cb("mtype");
	clear_cb("stype");
	clear_cb("ttype");
});
exclude_reset.addEventListener("click", function (event) {
	clear_cb("exclude");
});
attr_reset.addEventListener("click", function (event) {
	clear_cb("attr");
});
race_reset.addEventListener("click", function (event) {
	clear_cb("race");
});
marker_reset.addEventListener("click", function (event) {
	clear_cb("marker");
});

form1.addEventListener("reset", function (event) {
	select_type.value = "";
	select_type.dispatchEvent(new Event("change"));
});

window.addEventListener("DOMContentLoaded", function (event) {
	if (window.innerWidth > MAX_WIDTH) {
		div_count.style.width = MAX_WIDTH + "px";
		div_page.style.width = MAX_WIDTH + "px";
		table_result.style.width = MAX_WIDTH + "px";
	}
	else {
		div_count.style.width = "100%";
		div_page.style.width = "100%";
		table_result.style.width = "100%";
	}

	let params = new URLSearchParams(window.location.search);
	switch (params.get("type")) {
		case "1":
			select_type.value = "1";
			select_type.dispatchEvent(new Event("change"));
			break;
		case "2":
			select_type.value = "2";
			select_type.dispatchEvent(new Event("change"));
			break;
		case "3":
			select_type.value = "3";
			select_type.dispatchEvent(new Event("change"));
			break;
		default:
			break;
	}
});
