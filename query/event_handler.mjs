const select_type = document.getElementById("select_type");
const select_subtype_op = document.getElementById("select_subtype_op");

const cb_marker = document.getElementsByName("linkbtn");
const cb_attr = document.getElementsByName("attr");
const cb_race = document.getElementsByName("species");
const cb_level = document.getElementsByName("level");
const cb_scale = document.getElementsByName("scale");
const monster_checkbox = ["linkbtn", "attr", "species", "level", "scale"];

const row_subtype = document.querySelectorAll(".row_subtype");
const row_exclude = document.querySelectorAll(".row_exclude");
const monster_row = document.querySelectorAll(".monster-row");
const monster_input = document.querySelectorAll(".monster-input");

const subtype_operator = document.getElementById("subtype_operator");
const subtype_m = document.getElementById("subtype_m");
const subtype_s = document.getElementById("subtype_s");
const subtype_t = document.getElementById("subtype_t");

function clear_cb(name) {
	for (const cb of document.getElementsByName(name)) {
		cb.checked = false;
	}
}

function disable_cb(name, status) {
	for (const cb of document.getElementsByName(name)) {
		cb.disabled = status;
	}
}

function hide_type(type, hidden) {
	switch (type) {
		case 0:
			monster_row.forEach(row => row.hidden = hidden);
			monster_input.forEach(input => input.disabled = hidden);
			monster_checkbox.forEach(cbname => disable_cb(cbname, hidden));
			break;
		case 1:
			row_subtype.forEach(row => row.hidden = hidden);
			row_exclude.forEach(row => row.hidden = hidden);
			subtype_operator.hidden = hidden;
			subtype_m.hidden = hidden;
			select_subtype_op.disabled = hidden;
			disable_cb("mtype", hidden);
			disable_cb("exclude", hidden);
			break;
		case 2:
			row_subtype.forEach(row => row.hidden = hidden);
			subtype_s.hidden = hidden;
			disable_cb("stype", hidden);
			break;
		case 4:
			row_subtype.forEach(row => row.hidden = hidden);
			subtype_t.hidden = hidden;
			disable_cb("ttype", hidden);
			break;
		default:
			break;
	}
}

select_type.addEventListener("change", function (event) {
	switch (event.currentTarget.value) {
		case "1":
			hide_type(2, true);
			hide_type(4, true);
			hide_type(0, false);
			hide_type(1, false);
			break;
		case "2":
			hide_type(0, true);
			hide_type(1, true);
			hide_type(4, true);
			hide_type(2, false);
			break;
		case "4":
			hide_type(0, true);
			hide_type(1, true);
			hide_type(2, true);
			hide_type(4, false);
			break;
		default:
			hide_type(1, true);
			hide_type(2, true);
			hide_type(4, true);
			hide_type(0, false);
			break;
	}
});

document.getElementById("subtype_reset").addEventListener("click", function (event) {
	clear_cb("mtype");
	clear_cb("stype");
	clear_cb("ttype");
});
document.getElementById("exclude_reset").addEventListener("click", function (event) {
	clear_cb("exclude");
});
document.getElementById("attr_reset").addEventListener("click", function (event) {
	clear_cb("attr");
});
document.getElementById("race_reset").addEventListener("click", function (event) {
	clear_cb("species");
});
document.getElementById("level_reset").addEventListener("click", function (event) {
	clear_cb("level");
});
document.getElementById("scale_reset").addEventListener("click", function (event) {
	clear_cb("scale");
});
document.getElementById("marker_reset").addEventListener("click", function (event) {
	clear_cb("linkbtn");
});

document.getElementById("form1").addEventListener("reset", function (event) {
	select_type.value = "";
	select_type.dispatchEvent(new Event("change"));
});

document.querySelectorAll('.value-helper').forEach(btn => {
	btn.addEventListener("click", function (event) {
		const target = event.currentTarget;
		document.getElementById(`text_${target.dataset.type}1`).value = target.dataset.value;
	});
});
