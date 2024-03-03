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

function prob(n, x) {
	return C(n, x) * Math.pow(0.5, n);
}

function check(e) {
	let acc = 0;
	let i = 0;
	let n = Number.parseInt(text1.value);
	if (!Number.isSafeInteger(n) || n < 10 || n > 200) {
		div1.innerHTML = '請輸入10~200的整數';
		text1.value = '';
		text1.focus();
		return;
	}

	for (i = 0; i <= n - 1; ++i) {
		acc = acc + prob(n, i) * 2;
		if (acc > err)
			break;
	}
	--i;
	div1.innerHTML = `拒絕域：正面${i}次以下或${n - i}次以上`;
}
