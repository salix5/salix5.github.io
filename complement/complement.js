'use strict';
const text1 = document.getElementById('text1');
const text_from = document.getElementById('text_from');
const text_to = document.getElementById('text_to');
const button1 = document.getElementById('button1');
const div1 = document.getElementById('div1');
const div2 = document.getElementById('div2');
const INT32_MAX = 2147483647;
const INT32_MIN = -2147483648;

/**
 * @param {number} x 
 * @returns 
 */
function twos_complement(x) {
	return (~x) + 1;
}

/**
 * @param {number} x 
 * @returns 
 */
function print_bit(x) {
	return (x >>> 0).toString(2).padStart(32, '0');
}

/**
 * @param {number} x 
 * @returns 
 */
function is_int32(x) {
	return Number.isSafeInteger(x) && x >= INT32_MIN && x <= INT32_MAX;
}

function convert(event) {
	const from = Number.parseInt(text1.value);
	if (!is_int32(from)) {
		text1.value = '';
		div1.textContent = `x`;
		text_from.value = '?';
		div2.textContent = '-x';
		text_to.value = '';
		text1.focus();
		return;
	}
	const to = twos_complement(from);
	div1.textContent = `${from}`;
	text_from.value = print_bit(from)
	div2.textContent = `${to}`;
	text_to.value = print_bit(to);
}
button1.onclick = convert;

window.addEventListener("load", (event) => {
	text1.value = '';
	text_from.value = '';
	text_to.value = '';
});
