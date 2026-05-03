import { card_types } from './ygo-constant.mjs';
import { clear_result, show_result } from './result.mjs';

const api_endpoint = "https://salix5.up.railway.app/query/";
const form1 = document.getElementById("form1");

/**
 * toHalfWidth()
 * @param {string} str
 * @returns
 */
function toHalfWidth(str) {
	return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
}

/**
 * toFullWidth()
 * @param {string} str
 * @returns 
 */
function toFullWidth(str) {
	return str.replace(/[A-Za-z0-9]/g, (s) => String.fromCharCode(s.charCodeAt(0) + 0xFEE0));
}

/**
 * Set the checkboxes by name.
 * @param {URLSearchParams} params 
 * @param {string} inputName 
 * @param {number} offset 
 */
function checkByName(params, inputName, offset) {
	const elements = document.getElementsByName(inputName);
	for (const val of params.getAll(inputName)) {
		const idx = Number.parseInt(val) + offset;
		if (!Number.isNaN(idx) && idx >= 0 && idx < elements.length) {
			elements[idx].checked = true;
		}
	}
}

/**
 * Initialize the form based on URL parameters.
 * @param {URLSearchParams} params 
 */
function init_form(params) {
	form1.reset();
	const code = Number.parseInt(params.get("code") ?? "", 10);
	if (Number.isSafeInteger(code) && code > 0) {
		document.getElementById("text_id").value = code;
		return;
	}
	document.getElementById("select_pack").value = params.get("pack") ?? "";
	document.getElementById("text_mention").value = params.get("mention") ?? "";

	// type
	let type = 0;
	switch (params.get("type")) {
		case "1": {
			type = card_types.TYPE_MONSTER;
			checkByName(params, "mtype", -1);
			if (params.get("monster_type_op") === "1") {
				document.getElementById("select_subtype_op").value = "1";
			}
			checkByName(params, "exclude", -1);
			break;
		}
		case "2": {
			type = card_types.TYPE_SPELL;
			checkByName(params, "stype", -1);
			break;
		}
		case "4": {
			type = card_types.TYPE_TRAP;
			checkByName(params, "ttype", -1);
			break;
		}
		default:
			break;
	}
	if (type) {
		document.getElementById("select_type").value = params.get("type");
		document.getElementById("select_type").dispatchEvent(new Event("change"));
	}

	if (type === 0 || type === card_types.TYPE_MONSTER) {
		document.getElementById("text_atk1").value = params.get("atk_from") ?? "";
		document.getElementById("text_atk2").value = params.get("atk_to") ?? "";
		document.getElementById("text_def1").value = params.get("def_from") ?? "";
		document.getElementById("text_def2").value = params.get("def_to") ?? "";
		document.getElementById("text_sum").value = params.get("sum") ?? "";

		checkByName(params, "level", 0);
		checkByName(params, "scale", 0);
		checkByName(params, "attr", -1);
		checkByName(params, "species", -1);
		checkByName(params, "linkbtn", -1);
		if (params.get("marker_op") === "1") {
			document.getElementById("select_marker_op").value = "1";
		}
	}

	document.getElementById("select_locale").value = params.get("locale") ?? "";
	if (params.get("keyword")) {
		document.getElementById("text_keyword").value = params.get("keyword");
	}
	else {
		document.getElementById("text_name").value = params.get("cardname") ?? "";
		document.getElementById("text_effect").value = params.get("desc") ?? "";
	}
}

let currentController = null;
async function fetch_query(params) {
	if (currentController) {
		currentController.abort();
	}
	currentController = new AbortController();
	const url = new URL(api_endpoint);
	url.search = params.toString();
	const response = await fetch(url, { signal: currentController.signal });
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return response.json();
}

async function url_query() {
	if (window.location.search.substring(1) === "") {
		form1.reset();
		clear_result();
		return;
	}
	const div_count = document.getElementById("div_count");
	div_count.textContent = "Loading...";
	const params = new URLSearchParams(window.location.search);
	init_form(params);
	try {
		const data = await fetch_query(params);
		data.page = Number.parseInt(params.get("page") ?? "1");
		if (data.result.length === 1)
			document.title = data.result[0].tw_name;
		else
			document.title = "卡片查詢";
		show_result(data);
	}
	catch (error) {
		if (error.name === "AbortError") {
			return;
		}
		console.error("fetch error:", error);
		clear_result();
		div_count.textContent = "網路錯誤，請稍後再試。";
	}
}

form1.addEventListener("submit", event => {
	event.preventDefault();
	document.activeElement?.blur();
	const params = new URLSearchParams(new FormData(event.currentTarget));
	for (const [key, value] of [...params]) {
		if (value === "") {
			params.delete(key);
		}
	}
	if (!params.has("mtype")) {
		params.delete("monster_type_op");
	}
	if (!params.has("linkbtn")) {
		params.delete("marker_op");
	}
	const url = `${window.location.pathname}?${params.toString()}`;
	window.history.pushState({ path: url }, "", url);
	url_query();
});

document.getElementById("select_page").addEventListener("change", event => {
	const params = new URLSearchParams(window.location.search);
	params.set("page", event.currentTarget.selectedIndex + 1);
	const url = `${window.location.pathname}?${params.toString()}`;
	window.history.pushState({ path: url }, "", url);
	url_query();
	event.currentTarget.blur();
});

window.addEventListener("popstate", event => {
	url_query();
});

await url_query();
document.getElementById("button1").disabled = false;
document.getElementById("button2").disabled = false;
