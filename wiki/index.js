"use strict";
const path = "https://salix5.github.io/query/pack";
fetch(`${path}/wiki_link.json`)
	.then(response => response.json())
	.then(wiki_link => {
		const div_link = document.getElementById('div_link');
		for (const [pack, url] of Object.entries(wiki_link)) {
			const link1 = document.createElement('a');
			link1.href = url;
			link1.target = "_blank";
			link1.rel = "noreferrer";
			link1.textContent = pack;
			const div1 = document.createElement('div');
			div1.style.marginBottom = "10px";
			div1.appendChild(link1);
			div_link.appendChild(div1);
		}
		const link_tcg = document.createElement('a');
		link_tcg.href = "https://yugioh-wiki.net/index.php?%C6%FC%CB%DC%CC%A4%C8%AF%C7%E4%A5%AB%A1%BC%A5%C9";
		link_tcg.target = "_blank";
		link_tcg.rel = "noreferrer";
		link_tcg.textContent = "TCG";
		const div_tcg = document.createElement('div');
		div_tcg.style.marginBottom = "10px";
		div_tcg.appendChild(link_tcg);
		div_link.appendChild(div_tcg);
	});
