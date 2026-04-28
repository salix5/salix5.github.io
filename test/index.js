'use strict';
const is_pu = false;
const pu_quotes = [
	'那還是人嗎',
];

const ssr_quotes = [
	'那還是人嗎',
];

const normal_quotes = [
	'那還可以吧', 
	'那還不錯嘛', 
	'NZMB',
	'好8我接受',
	'嗯 你說得對',
	'對',
	'等於等於',
	'好窩',
	'有這種事',
	'那根本就不可能！',
	'(躺',
	'該下載了8',
	'該退坑了吧',
	'(本留言違反數位中介法已被刪除)',
];
	
const new_year_quotes = [
	'年終獎金幾個月啊？',
	'現在薪水夠用嗎？',
	'在哪裡上班啊？',
	'打算什麼時候結婚？',
	'有沒有正在交往的對象啊？',
];

const text1 = document.getElementById('text1');
const div_dawn = document.getElementById('dawn');

function get_text(layer){
	let r = 0;
	let text = '';
	if(1<= layer && layer <= 8){ 
		// pick up
		r = getRandomInt(0, pu_quotes.length - 1);
		text = pu_quotes[r];
	}
	else if(is_pu && 9 <= layer && layer <= 10){
		r = getRandomInt(0, ssr_quotes.length - 1);
		text = ssr_quotes[r];
	}
	else{
		r = getRandomInt(0, normal_quotes.length - 1);
		text = normal_quotes[r];
		if(r == 8){
			const msg = document.createElement('div');
			msg.textContent = 'To absent friend.';
			div_dawn.appendChild(msg);
		}
	}
	return text;
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	if (min == max)
		return min;
	
	const range = max - min + 1;
	const bound = (-range >>> 0) % range;
	const randomBuffer = new Uint32Array(1);
	do {
		crypto.getRandomValues(randomBuffer);
	} while (randomBuffer[0] < bound);
	return min + randomBuffer[0] % range;
}

function mark_of_time(){
	text1.select();
	document.execCommand("copy");
}

function until_dawn(){
	let times = 0;
	let layer = 0;
	do {
		layer = getRandomInt(1, 1000);
		times++;
	} while (layer > 8);
	
	text1.value = get_text(layer);
	const msg = document.createElement('div');
	msg.textContent = `總共抽了${times}次！`;
	div_dawn.appendChild(msg);
}

const gacha = getRandomInt(1, 1000);
text1.value = get_text(gacha);
