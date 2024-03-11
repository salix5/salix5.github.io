'use strict';
const text1 = document.getElementById('text1');
const div_link = document.getElementById('div_link');
const re_id = /<:[^:]+:(\d+)>/

text1.value = '';
button1.onclick = create_url;
function create_url(e) {
	const result = text1.value.match(re_id);
	text1.value = '';
	if (result) {
		const id = result[1];
		const size = 48;
		const url = `https://cdn.discordapp.com/emojis/${id}.webp?size=${size}&quality=lossless`;
		const link1 = document.createElement('a');
		link1.href = url;
		link1.target = '_blank';
		link1.rel = 'noreferrer nofollow';
		link1.textContent = url;
		div_link.innerHTML = '';
		div_link.appendChild(link1);
	}
}
