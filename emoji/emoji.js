'use strict';
const text1 = document.getElementById('text1');
const div_link = document.getElementById('div_link');
const div_date = document.getElementById('div_date');
const re_id = /<(a?):[^:]+:(\d+)>/

text1.value = '';
button1.onclick = create_url;
function create_url(e) {
	const result = text1.value.match(re_id);
	text1.value = '';
	div_link.innerHTML = '';
	if (result) {
		const id = result[2];
		const ext = (result[1] === 'a') ? 'gif' : 'webp';
		const size = 64;
		const url = `https://cdn.discordapp.com/emojis/${id}.${ext}?size=${size}&quality=lossless`;
		const link1 = document.createElement('a');
		link1.href = url;
		link1.target = '_blank';
		link1.rel = 'noreferrer nofollow';
		link1.textContent = url;
		div_link.appendChild(link1);
		if (window.BigInt) {
			const snowflake = BigInt(id);
			const offset = BigInt(22);
			const base = BigInt(1420070400000);
			const timestamp = Number((snowflake >> offset) + base);
			const birth = new Date(timestamp);
			div_date.textContent = `生於：${birth.toLocaleString()}`;
		}
	}
}
