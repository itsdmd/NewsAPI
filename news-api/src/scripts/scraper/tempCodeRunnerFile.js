async function test(url) {
	let test = await fetch(url)
		.then((response) => {
			return response.text();
		})
		.then((html) => {
			return html;
		});

	console.log(test);
}

await test("https://vnexpress.net/alcaraz-de-doa-dinh-bang-atp-cua-djokovic-4582578.html");