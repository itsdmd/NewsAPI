import * as cacher from "./scraper/cacher.js";
import * as parser from "./scraper/parser.js";
import * as scraper from "./scraper/scraper.js";

async function test() {
	/* #region   */
	/* -------------- tt-vn ------------- */
	// https://tuoitre.vn/timeline/3/trang-1.htm
	// 		3: news
	// 		11: business
	/* -------------- tn-vn ------------- */
	// https://thanhnien.vn/timelinelist/1854/1.htm
	// 		1854: news
	// 		18549: business
	/* #endregion */
	/* ------------- vnx-vn ------------- */
	// https://vnexpress.net/thoi-su-p1
	// 		thoi-su: news
	// 		kinh-doanh: business
	/* #endregion */
	// await cacher.cacheOne("https://vnexpress.net/kiem-tra-toan-quoc-ve-quan-ly-tien-cong-duc-4578636.html", "vnx-vn", false);
	// await parser.parseCache("vnx-vn-article");
	// await cacher.cacheOne("https://vnexpress.net/thu-tuong-khanh-hoa-phai-thanh-cuc-tang-truong-cua-ca-nuoc-4588331.html", false);
	// await parser.parseCache("vnx-vn-article");
	// await cacher.cacheOne("https://vnexpress.net/cao-toc-dau-giay-phan-thiet-truoc-mot-thang-thong-xe-4586719.html", "vnx-vn", false);
	// await parser.parseCache("vnx-vn-gallery");

	await scraper.scrape("vnx-vn", "https://vnexpress.net/thoi-su", "https://vnexpress.net/thoi-su-p1", 1);
}

await test();

process.exit(0);
