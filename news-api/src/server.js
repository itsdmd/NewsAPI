console.log("\n[server.js]");

import * as dotenv from "dotenv";
dotenv.config();

import express from "express";

import { dateRouter } from "./routers/date.js";
import * as scraper from "./scripts/scraper/scraper.js";

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use("/date", dateRouter);

app.listen(port, () => {
	console.log("\n[server:main] Listening on port " + port);
});

async function main(mode, baseUrl, startUrl, limit = 1) {
	console.log("\n[server:main]");

	/* ------------ scraping ------------ */
	await scraper
		.scrape(mode, baseUrl, startUrl, limit)
		.catch((error) => {
			console.log("\n[server:main] Error: " + error.message);
		})
		.finally(async () => {
			console.log("\n[server:main] Done scraping");
		});

	return;
}

/* -------------- tt-vn ------------- */
// https://tuoitre.vn/timeline/3/trang-1.htm
// 		3:news
// 		11:business

/* -------------- tn-vn ------------- */
// https://thanhnien.vn/timelinelist/1854/1.htm
// 		1854:news
// 		18549:business

// import * as cacher from "./scripts/scraper/cacher.js";
// import * as parser from "./scripts/scraper/parser.js";
async function test() {
	// await cacher.cacheOne("https://thanhnien.vn/ngan-ngua-tham-nhung-tang-hieu-qua-giai-quyet-an-hanh-chinh-185230320225820281.htm", false);
	// await cacher.cacheOne("https://thanhnien.vn/dot-rac-chay-lan-uy-hiep-khu-nha-tro-duong-dien-cao-the-185230321144835029.htm", false);
	// await cacher.cacheOne("https://thanhnien.vn/xu-ly-hinh-su-nguoi-dung-dau-cac-cong-ty-doi-no-sai-quy-dinh-duoc-khong-185230316164022666.htm", false);
	// await cacher.cacheOne("https://thanhnien.vn/bo-cong-an-rut-de-xuat-thoi-han-bang-lai-xe-con-5-nam-185988475.htm", false);
	// await cacher.cacheOne("https://thanhnien.vn/trang-dem-di-dan-chay-lu-185874066.htm", false);
	// await cacher.cacheOne("https://thanhnien.vn/hon-2511-ti-dong-boi-thuong-giai-phong-mat-bang-2-du-an-o-dung-quat-185445866.htm", false);
	// await cacher.cacheOne("https://thanhnien.vn/ha-noi-chay-lien-kho-hang-thiet-hai-hang-tram-ti-dong-185359224.htm", false);
	// await cacher.cacheOne("https://thanhnien.vn/da-den-luc-rut-kinh-nghiem-thuc-su-185418775.htm", false);
	// await cacher.cacheOne("https://thanhnien.vn/5-cuu-tuong-canh-sat-bien-tham-o-chia-nhau-50-ti-dong-185230203021230689.htm", false);
	// await cacher.cacheOne("https://thanhnien.vn/de-dat-mo-cua-1851112538.htm", false);
	// await parser.parseCache("tn-vn", false);
	// await main("tt-vn", "https://tuoitre.vn/timeline/3/", "https://tuoitre.vn/timeline/3/trang-4.htm", 3);
	// await main("tn-vn", "https://thanhnien.vn/timelinelist/1854/", "https://thanhnien.vn/timelinelist/1854/1.htm", 3);
	/* ---------------- - --------------- */
	// await main("tt-vn", "https://tuoitre.vn/timeline/3/", "https://tuoitre.vn/timeline/3/trang-1.htm", 3300);
	// await main("tt-vn", "https://tuoitre.vn/timeline/3/", "https://tuoitre.vn/timeline/11/trang-1.htm", 3300);
	/* ---------------- - --------------- */
	// TODO: Refetch "quote" docs
	await main("tn-vn", "https://thanhnien.vn/timelinelist/1854/", "https://thanhnien.vn/timelinelist/1854/5587.htm", 10920 - 5587);
	await main("tn-vn", "https://thanhnien.vn/timelinelist/18549/", "https://thanhnien.vn/timelinelist/18549/38.htm", 4800 - 38);
}

await test();

process.exit(0);
