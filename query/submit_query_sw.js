"use strict";
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
