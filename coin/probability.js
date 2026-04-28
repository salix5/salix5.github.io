'use strict';
const text1 = document.getElementById('text1');
const div1 = document.getElementById('div1');
const button1 = document.getElementById('button1');
button1.onclick = check;

const err = 0.05;

function C(n, k) {
	if (n - k < k)
		return C(n, n - k);
	let x1 = 1, x2 = 1;
	for (let i = 1; i <= k; ++i) {
		x1 *= (n - k + i);
		x2 *= i;
	}
	return x1 / x2;
}

function check(e) {
	let acc = 0;
	let i = 0;
	let n = Number.parseInt(text1.value);
	if (!Number.isSafeInteger(n) || n < 10 || n > 1000) {
		div1.textContent = '請輸入10~1000的整數';
		text1.value = '';
		text1.focus();
		return;
	}

	let currentProb = Math.pow(0.5, n);
	for (i = 0; i <= n; ++i) {
		acc += currentProb * 2;
		if (acc > err)
			break;
		currentProb = currentProb * (n - i) / (i + 1);
	}
	const boundary = i - 1;
	div1.textContent = `拒絕域：正面${boundary}次以下或${n - boundary}次以上`;
}
