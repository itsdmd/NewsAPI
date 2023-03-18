// Parse raw html response from cache
console.log("[parser.js]");

import * as dotenv from "dotenv";

import jsdom from "jsdom";
import mongoose from "mongoose";

import cacheModel from "../../models/cache.js";
import * as transactor from "./transactor.js";

dotenv.config();
const { JSDOM } = jsdom;

/* #region   */
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
console.log("[parser.js] Connecting to Database.");

db.on("error", (error) => console.log("[parser.js] Error connecting to database: " + error));
/* #endregion */
db.once("open", async () => {
	console.log("[parser.js] Connected to Database");
});

export function querySelectorFrom(selector, elements) {
	return [].filter.call(elements, function (element) {
		return element.matches(selector);
	});
}

export function htmlToJsdom(content) {
	console.log("[parser.js:httpToJsdom]");

	return new JSDOM(content).window.document;
}

export function parseDate(type, input) {
	console.log("[parser.js:parseDate]");

	switch (type) {
		default: {
			console.log("[parser.js:parseDate] Error: Invalid type");
			return;
		}
	}
}

export async function parseJsdom(dom, mode) {
	console.log("[parser.js:parseJsdom]");
	try {
		switch (mode) {
			case "vnx-article": {
				/* ------------ metadata ------------ */
				/* #region   */
				// id
				const id = dom.querySelector("meta[name*='tt_article_id']").getAttribute("content");
				console.log("[parser.js:parseJsdom] ID: " + id);

				// url
				const url = dom.querySelector("meta[name='its_url']").getAttribute("content");

				// type
				const type = dom.querySelector("meta[name*='tt_page_type']").getAttribute("content");

				// category
				const category = dom.querySelector("meta[name='tt_site_id_detail']").getAttribute("catename");

				// title
				const title = dom.querySelector("meta[name='its_title']").getAttribute("content");

				// description
				const description = dom.querySelector("meta[itemprop='description']").getAttribute("content");

				// keywords
				let keywords = dom.querySelector("meta[name*='keywords']").getAttribute("content");
				try {
					// console.log("[parser.js:parseJsdom] keywords: " + keywords);
					keywords = keywords.split(", ");
				} catch (error) {
					console.log("[parser.js:parseJsdom] Error parsing keywords: " + error);
				}

				// folders
				let folderIds = dom.querySelector("meta[name*='tt_list_folder']").getAttribute("content");
				try {
					// console.log("[parser.js:parseJsdom] folderIds: " + folderIds);
					folderIds = folderIds.split(",");
				} catch (error) {
					console.log("[parser.js:parseJsdom] Error parsing folders: " + error);
				}
				let folderNames = dom.querySelector("meta[name*='tt_list_folder_name']").getAttribute("content");
				try {
					// console.log("[parser.js:parseJsdom] folderNames: " + folderNames);
					folderNames = folderNames.split(",");
				} catch (error) {
					console.log("[parser.js:parseJsdom] Error parsing folder names: " + error);
				}
				let folders = [];
				for (let i = 0; i < folderIds.length; i++) {
					try {
						folders.push({
							id: folderIds[i],
							name: folderNames[i],
						});
					} catch (error) {
						console.log("[parser.js:parseJsdom] Error parsing folders: " + error);
						break;
					}
				}

				// tags
				let tags = [];
				dom.querySelector("meta[name='its_tag']")
					.getAttribute("content")
					.split(",")
					.forEach((tag) => {
						tags.push(tag.trim());
					});

				// published_date
				const published_date = dom.querySelector('meta[name="pubdate"]').getAttribute("content");

				// authors
				let authors = dom.querySelector("strong").textContent;
				try {
					// console.log("[parser.js:parseJsdom] Authors: " + authors);
					authors = authors.split(" - ");
				} catch (error) {
					console.log("[parser.js:parseJsdom] Error parsing authors: " + error);
				}
				/* #endregion */

				/* ------------- content ------------ */
				// content_blocks
				let content_blocks = [];
				dom.querySelectorAll("article.fck_detail > *").forEach((element) => {
					// text
					if (element.classList.contains("Normal")) {
						content_blocks.push({
							tag: element.tagName,
							content: element.textContent,
							attribute: {},
						});
					}

					// VnExpress implements one-time-usage token to view image so it's not possible to access the image's url
				});

				// create new vnxArticle
				const vnxArticle = {
					metadata: {
						id: id,
						url: url,
						type: type,
						category: category,
						title: title,
						description: description,
						keywords: keywords,
						folders: folders,
						tags: tags,
						published_date: published_date,
						authors: authors,
					},
					content_blocks: content_blocks,
				};

				console.log("[parser.js:parseJsdom] vnxArticle: " + JSON.stringify(vnxArticle));
				return vnxArticle;
			}

			case "vnx-feed": {
				let urls = [];

				let newsItems = dom.querySelectorAll("article.item-news.item-news-common.thumb-left .title-news a");

				newsItems.forEach((item) => {
					// exclude videophoto posts
					// check if any child have class "icon_thumb_videophoto"
					for (let i = 0; i < item.children.length; i++) {
						if (item.children[i].classList.contains("icon_thumb_videophoto")) {
							return;
						}
					}

					console.log("[parser.js:parseJsdom] " + item.getAttribute("href"));
					urls.push(item.getAttribute("href"));
				});

				return urls;
			}

			case "vnx-next-page": {
				return dom.querySelector("a.btn-page.next-page").getAttribute("href");
			}

			default: {
				console.log("[parser.js:parseJsdom] Unknown mode: " + mode);
				break;
			}
		}
	} catch (error) {
		console.log("[parser.js:parseJsdom] Error: " + error);
		return;
	}
}

export async function parseCache() {
	console.log("[parser.js:parseCache]");

	let numOfCachedDocs = await cacheModel.count();
	console.log("[parser.js:parseCache] numOfDocs: " + numOfCachedDocs);

	while (numOfCachedDocs > 0) {
		// create new vnexpressArticle
		try {
			// fetch oldest doc in cacheSchema
			const cachedDoc = await cacheModel
				.findOne({})
				.sort({ created_at: 1 })
				.catch((err) => {
					console.log("[parser.js:parseCache] Error when fetching oldest doc: " + err);
					return;
				});

			// parse cachedDoc
			console.log("[parser.js:parseCache] Parsing cachedDoc: " + cachedDoc._id);
			const httpDoc = htmlToJsdom(cachedDoc.content);
			const parsedHttp = await parseJsdom(httpDoc, cachedDoc.type);

			console.log("[parser.js:parseCache] Parsed successfully");

			await transactor
				.addVnxArticle(parsedHttp)
				.then(async () => {
					// delete cachedDoc;
					await cacheModel
						.deleteOne({ _id: cachedDoc._id })
						.then(console.log("[parser.js:parseCache] Deleted cachedDoc: " + cachedDoc._id))
						.catch((err) => {
							console.log("[parser.js:parseCache] Error when deleting cachedDoc: " + err);
							return;
						});
					numOfCachedDocs--;
				})
				.catch((err) => {
					console.log("[parser.js:parseCache] Error when call transactor: " + err);
				});

			continue;
		} catch (err) {
			console.log("[parser.js:parseCache] Error: " + err);
			return;
		}
	}
}
