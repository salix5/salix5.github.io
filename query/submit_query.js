"use strict";
function url_query() {
	if (window.location.search.substring(1) === "")
		return;
	const params = new URLSearchParams(window.location.search);
	server_analyze1(params);
}

db_ready.then(() => {
	url_query();
	button1.disabled = false;
	button2.disabled = false;
});
