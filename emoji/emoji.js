'use strict';
const text1 = document.getElementById('text1');
const div_link = document.getElementById('div_link');
const div_date = document.getElementById('div_date');
const re_emoji = /<(a?):[^:]+:(\d+)>/g;
const re_snowflake = /^\d+$/;
const discord_epoch = 1420070400000;

text1.value = '';
button1.onclick = generate_url;

/**
 * @param {string} id 
 * @returns 
 */
function get_discord_timestamp(id) {
	const snowflake = BigInt(id);
	const offset = 22n;
	const timestamp = Number((snowflake >> offset)) + discord_epoch;
	return timestamp;
}

/**
 * 使用 Temporal 將毫秒時間戳轉為本地 24 小時制字串
 * @param {number} timestamp 
 * @returns {string}
 */
function temporal_local_24h(timestamp) {
	const instant = Temporal.Instant.fromEpochMilliseconds(timestamp);
	const localZdt = instant.toZonedDateTimeISO(Temporal.Now.timeZoneId());
	return localZdt.toLocaleString(undefined, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	});
}

function generate_url() {
	/**
	 * @type {RegExpMatchArray[]} 
	 */
	const results = [...text1.value.matchAll(re_emoji)];
	div_link.replaceChildren();
	div_date.replaceChildren();
	if (re_snowflake.test(text1.value)) {
		const timestamp = get_discord_timestamp(text1.value);
		if (timestamp > discord_epoch) {
			div_date.textContent = `${temporal_local_24h(timestamp)}`;
		}
	}
	else if (results.length > 0) {
		const size = 48;
		for (const match of results) {
			const id = match[2];
			const timestamp = get_discord_timestamp(id);
			if (timestamp < discord_epoch) {
				continue;
			}
			const ext = (match[1] === 'a') ? 'gif' : 'webp';
			const url = `https://cdn.discordapp.com/emojis/${id}.${ext}?size=${size}`;
			const div_item = document.createElement('div');
			const link1 = document.createElement('a');
			link1.href = url;
			link1.target = '_blank';
			link1.rel = 'noreferrer nofollow';
			link1.textContent = url;
			div_item.appendChild(link1);
			div_link.appendChild(div_item);
		}
	}
	text1.value = '';
}
