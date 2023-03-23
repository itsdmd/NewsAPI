import * as scraper from "./scraper/scraper.js";

async function scrape(mode, baseUrl, startUrl, limit = 1) {
	/* ------------ scraping ------------ */
	await scraper
		.scrape(mode, baseUrl, startUrl, limit)
		.catch((error) => {
			console.log("\n[refetch:scrape] Error: " + error.message);
		})
		.finally(async () => {
			console.log("\n[refetch:scrape] Done scraping");
		});

	return;
}

async function test() {
	/* #region   */
	/* -------------- tt-vn ------------- */
	// https://tuoitre.vn/timeline/3/trang-1.htm
	// 		3:news
	// 		11:business

	/* -------------- tn-vn ------------- */
	// https://thanhnien.vn/timelinelist/1854/1.htm
	// 		1854:news
	// 		18549:business
	/* #endregion */

	// dynamically load modules
	const cacher = await import("./scripts/scraper/cacher.js");
	const parser = await import("./scripts/scraper/parser.js");

	/* ------- initialize database ------ */
	await cacher.cacheOne(
		"https://thanhnien.vn/4-nu-tiep-vien-hang-khong-duoc-tra-tu-do-nhung-van-phai-hop-tac-dieu-tra-185230323193115031.htm",
		"tn-vn",
		false
	);
	await parser.parseCache("tn-vn");
}

// await test();

await scrape("tn-vn", "https://thanhnien.vn/timelinelist/1854/", "https://thanhnien.vn/timelinelist/1854/1.htm", 5);
process.exit(0);
