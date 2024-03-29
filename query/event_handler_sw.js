"use strict";
const text_id1 = document.getElementById("text_id1");
const text_id2 = document.getElementById("text_id2");
const text_name = document.getElementById("text_name");
const text_effect = document.getElementById("text_effect");
const text_keyword = document.getElementById("text_keyword");

const text_lv1 = document.getElementById("text_lv1");
const text_lv2 = document.getElementById("text_lv2");
const text_atk1 = document.getElementById("text_atk1");
const text_atk2 = document.getElementById("text_atk2");
const text_def1 = document.getElementById("text_def1");
const text_def2 = document.getElementById("text_def2");
const text_sum = document.getElementById("text_sum");

const select_locale = document.getElementById("select_locale");
const select_ot = document.getElementById("select_ot");
const select_subtype_op = document.getElementById("select_subtype_op");

const subtype_m = document.getElementById("subtype_m");
const cb_mtype = document.getElementsByName("mtype");
const cb_exclude = document.getElementsByName("exclude");
const cb_attr = document.getElementsByName("attr");
const cb_race = document.getElementsByName("race");
const cb_scale = document.getElementsByName("scale");

const subtype_reset = document.getElementById("subtype_reset");
const exclude_reset = document.getElementById("exclude_reset");
const attr_reset = document.getElementById("attr_reset");
const race_reset = document.getElementById("race_reset");
const scale_reset = document.getElementById("scale_reset");

const form1 = document.getElementById("form1");
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

subtype_reset.addEventListener("click", function (event) {
	clear_cb("mtype");
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
scale_reset.addEventListener("click", function (event) {
	clear_cb("scale");
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
});
