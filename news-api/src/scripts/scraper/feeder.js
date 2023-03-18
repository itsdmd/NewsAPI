// Feed fetched urls into cacher
console.log("[feeder.js]");

export async function feed(urls) {
	urls = [
		"https://vnexpress.net/rao-chan-nha-g6a-thanh-cong-4582550.html",
		"https://vnexpress.net/bo-truong-cong-an-ly-giai-de-xuat-cap-can-cuoc-cho-tre-duoi-14-tuoi-4582359.html",
		"https://vnexpress.net/alcaraz-de-doa-dinh-bang-atp-cua-djokovic-4582578.html",
	];

	let cacher = await import("./cacher.js").then((cacher) => {
		return cacher;
	});
	await cacher(urls, "vnexpress-article")
		.then(() => console.log("[feeder.js:feed] Success"))
		.catch((error) => console.error("[feeder.js:feed] Error: " + error.message));
}
