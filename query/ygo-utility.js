/**
 * @param {number} cid 
 * @param {string} request_locale 
 * @returns 
 */
function print_db_link(cid, request_locale) {
	if (!Number.isSafeInteger(cid))
		return "";
	const params = new URLSearchParams({
		ope: "2",
		cid: cid.toString(),
		request_locale: request_locale
	});
	return `https://www.db.yugioh-card.com/yugiohdb/card_search.action?${params.toString()}`;
}

function print_yp_link(id) {
	if (!Number.isSafeInteger(id))
		return "";
	const link_id = id.toString().padStart(8, "0");
	return `https://yugipedia.com/wiki/${link_id}`;
}

function print_qa_link(cid) {
	if (!Number.isSafeInteger(cid))
		return "";
	const params = new URLSearchParams({
		ope: "4",
		cid: cid.toString(),
		sort: "2",
		request_locale: "ja"
	});
	return `https://www.db.yugioh-card.com/yugiohdb/faq_search.action?${params.toString()}`;
}
