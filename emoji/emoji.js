'use strict';
const text1 = document.getElementById('text1');
const div_link = document.getElementById('div_link');
const div_date = document.getElementById('div_date');
const re_emoji = /<(a?):[^:]+:(\d+)>/;
const re_snowflake = /^\d+$/;

text1.value = '';
button1.onclick = create_url;

/**
 * @param {string} id 
 * @returns 
 */
function get_discord_timestamp(id) {
	if (!window.BigInt)
		return -1;
	const snowflake = BigInt(id);
	const offset = BigInt(22);
	const discord_epoch = BigInt(1420070400000);
	const timestamp = Number((snowflake >> offset) + discord_epoch);
	return timestamp;
}

function create_url(e) {
	const result = text1.value.match(re_emoji);
	let timestamp = -1;
	div_link.innerHTML = '';
	if (re_snowflake.test(text1.value)) {
		timestamp = get_discord_timestamp(text1.value);
	}
	else if (result) {
		const id = result[2];
		const ext = (result[1] === 'a') ? 'gif' : 'webp';
		const size = 96;
		const url = `https://cdn.discordapp.com/emojis/${id}.${ext}?size=${size}`;
		const link1 = document.createElement('a');
		link1.href = url;
		link1.target = '_blank';
		link1.rel = 'noreferrer nofollow';
		link1.textContent = url;
		div_link.appendChild(link1);
		timestamp = get_discord_timestamp(id);
	}
	if (timestamp > 0) {
		const birth = new Date(timestamp);
		div_date.textContent = `時間：${birth.toLocaleString()}`;
	}
	text1.value = '';
}
