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
			case "vnx-vn-article": {
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

				// publish_date
				const publish_date = dom.querySelector('meta[name="pubdate"]').getAttribute("content");

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
				const vnxVnArticle = {
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
						publish_date: publish_date,
						authors: authors,
					},
					content_blocks: content_blocks,
				};

				console.log("[parser.js:parseJsdom] vnxVnArticle: " + JSON.stringify(vnxVnArticle));
				return vnxVnArticle;
			}

			case "vnx-en-article": {
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
				const category = dom.querySelector("meta[name='tt_category_id']").getAttribute("content");

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
					.split(", ")
					.forEach((tag) => {
						tags.push(tag.trim());
					});

				// publish_date
				// 2023-03-16 06:25 + 07:00
				// convert to isodate
				const publish_date = dom
					.querySelector('meta[name="pubdate"]')
					.getAttribute("content")
					// replace first space with T
					.replace(" ", "T")
					// replace " +" with ":00+"
					.replace(" +", ":00.000Z+")
					// remove other spaces
					.replace(" ", "");

				// authors
				let authors = dom.querySelector(".author a").textContent;
				try {
					// console.log("[parser.js:parseJsdom] Authors: " + authors);
					authors = authors.split(", ");
				} catch (error) {
					console.log("[parser.js:parseJsdom] Error parsing authors: " + error);
				}
				/* #endregion */

				/* ------------- content ------------ */
				// content_blocks
				let content_blocks = [];
				dom.querySelectorAll("div.fck_detail > *").forEach((element) => {
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
				const vnxEnArticle = {
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
						publish_date: publish_date,
						authors: authors,
					},
					content_blocks: content_blocks,
				};

				console.log("[parser.js:parseJsdom] vnxEnArticle: " + JSON.stringify(vnxEnArticle));
				return vnxEnArticle;
			}

			case "vnx-vn-feed": {
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

			case "vnx-en-feed": {
				let urls = [];

				let newsItems = dom.querySelectorAll("div.item_news .title_news_site a");

				newsItems.forEach((item) => {
					console.log("[parser.js:parseJsdom] " + item.getAttribute("href"));
					urls.push(item.getAttribute("href"));
				});

				return urls;
			}

			case "tt-vn-article": {
				/* ------------ metadata ------------ */
				/* #region   */
				// id
				const id = dom.querySelector("#hidNewsId").getAttribute("value");
				// console.log("[parser.js:parseJsdom] ID: " + id);

				// url
				const url = dom.querySelector("#hidNewsUrl").getAttribute("value");
				// console.log("[parser.js:parseJsdom] URL: " + url);

				// category
				const category = dom.querySelector("div.detail-cate a").textContent;
				// console.log("[parser.js:parseJsdom] Category: " + category);

				// title
				const title = dom.querySelector("h1.detail-title").textContent;
				// console.log("[parser.js:parseJsdom] Title: " + title);

				// description
				const description = dom.querySelector("h2.detail-sapo").textContent;
				// console.log("[parser.js:parseJsdom] Description: " + description);

				// tags
				let tagNodes = dom.querySelectorAll("div.detail-tab > a");
				let tags = [];
				tagNodes.forEach((tag) => {
					tag.getAttribute("title");

					tags.push({
						title: tag.textContent,
						url: "https://tuoitre.vn" + tag.getAttribute("href"),
					});
				});
				// console.log("[parser.js:parseJsdom] Tags: " + JSON.stringify(tags));

				// publish_date
				// 18/03/2023 18:37 GMT+7
				// convert to isodate (2023-03-18T18:37:00+7:00)
				let rawDate = dom.querySelector("div[data-role='publishdate']").textContent.trim();
				const publish_date =
					rawDate.substring(6, 10) +
					"-" +
					rawDate.substring(3, 5) +
					"-" +
					rawDate.substring(0, 2) +
					"T" +
					rawDate.substring(11, 13) +
					":" +
					rawDate.substring(14, 16) +
					":00+07:00";
				// console.log("[parser.js:parseJsdom] Publish date: " + publish_date);

				// authors
				let authors = [];
				dom.getElementsByClassName("author-item-name")[0].children[0].getAttribute("title");

				for (let i = 0; i < dom.getElementsByClassName("author-item-name").length; i++) {
					authors.push({
						title: dom.getElementsByClassName("author-item-name")[0].children[0].getAttribute("title"),
						url: "https://tuoitre.vn" + dom.getElementsByClassName("author-item-name")[0].children[0].getAttribute("href"),
					});
				}
				// console.log("[parser.js:parseJsdom] Authors: " + JSON.stringify(authors));

				/* #endregion */

				/* ------------- content ------------ */
				/* #region   */
				// content_blocks
				let content_blocks = [];

				// audio
				let audioplayer = dom.querySelector("div.audioplayer");
				if (audioplayer !== null) {
					content_blocks.push({
						tag: audioplayer.tagName,
						content: "audioplayer",
						attributes: {
							src: audioplayer.getAttribute("data-file"),
						},
					});
				}

				let contentContainer = dom.querySelector("div.detail-content");
				for (let i = 1; i < contentContainer.childElementCount; i++) {
					let attributes = {};

					let childNode = contentContainer.childNodes[i];

					switch (childNode.tagName) {
						// text
						case "H2":
						case "P": {
							if (dom.querySelector("div.detail-content").childNodes[i].childElementCount) {
								for (let j = 0; j < dom.querySelector("div.detail-content").childNodes[i].childElementCount; j++) {
									if (dom.querySelector("div.detail-content").childNodes[i].childNodes[j].tagName === "A") {
										attributes.tag = dom.querySelector("div.detail-content").childNodes[i].childNodes[j].tagName;
										attributes.href = dom.querySelector("div.detail-content").childNodes[i].childNodes[j].getAttribute("href");
									}
								}
							}

							break;
						}

						// photo
						case "FIGURE": {
							if (childNode.getAttribute("type") === "Photo") {
								attributes.src = childNode.childNodes[0].childNodes[0].getAttribute("href");
								attributes.caption = childNode.childNodes[0].childNodes[0].getAttribute("data-caption");

								break;
							}
						}

						// video
						case "DIV": {
							if (childNode.getAttribute("type") === "VideoStream") {
								attributes.src = "https://tuoitre.vn" + childNode.getAttribute("data-vid");
								attributes.thumbnail = childNode.getAttribute("data-thumb");
								attributes.caption = childNode.childNode[1].childNode[1].textContent;
							}

							break;
						}

						default:
							break;
					}

					content_blocks.push({
						tag: childNode.tagName,
						content: childNode.textContent,
						attributes: attributes,
					});
				}
				/* #endregion */

				// create new vnxArticle
				const ttVnArticle = {
					metadata: {
						id: id,
						url: url,
						category: category,
						title: title,
						description: description,
						tags: tags,
						publish_date: publish_date,
						authors: authors,
					},
					content_blocks: content_blocks,
				};

				// console.log("[parser.js:parseJsdom] ttVnArticle: " + JSON.stringify(ttVnArticle));
				return ttVnArticle;
			}

			case "tt-vn-feed": {
				let urls = [];

				dom.querySelectorAll("h3 a").forEach((node) => {
					urls.push("https://tuoitre.vn" + node.getAttribute("href"));
				});

				return urls;
			}

			case "tt-en-article": {
			}

			case "tt-en-feed": {
			}

			case "vnx-vn-next-page": {
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

export async function parseCache(mode) {
	console.log("[parser.js:parseCache]");

	let numOfCachedDocs = await cacheModel.count();
	console.log("[parser.js:parseCache] numOfCachedDocs: " + numOfCachedDocs);

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

			switch (mode) {
				case "vnx-vn": {
					const parsedHttp = await parseJsdom(httpDoc, "vnx-vn-article").catch((err) => {
						console.log("[parser.js:parseCache] Error when parsing cachedDoc: " + err);
						return;
					});
					console.log("[parser.js:parseCache] Parsed successfully");

					await transactor
						.addVnxVnArticle(parsedHttp)
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

					break;
				}

				case "vnx-en": {
					const parsedHttp = await parseJsdom(httpDoc, "vnx-en-article").catch((err) => {
						console.log("[parser.js:parseCache] Error when parsing cachedDoc: " + err);
						return;
					});
					console.log("[parser.js:parseCache] Parsed successfully");

					await transactor
						.addVnxEnArticle(parsedHttp)
						.then(async () => {
							// delete cachedDoc;
							await cacheModel
								.deleteOne({ _id: cachedDoc._id })
								.catch((err) => {
									console.log("[parser.js:parseCache] Error when deleting cachedDoc: " + err);
									return;
								})
								.finally(console.log("[parser.js:parseCache] Deleted cachedDoc: " + cachedDoc._id));
							numOfCachedDocs--;
						})
						.catch((err) => {
							console.log("[parser.js:parseCache] Error when call transactor: " + err);
						});

					break;
				}

				case "tt-vn": {
					const parsedHttp = await parseJsdom(httpDoc, "tt-vn-article").catch((err) => {
						console.log("[parser.js:parseCache] Error when parsing cachedDoc: " + err);
						return;
					});
					console.log("[parser.js:parseCache] Parsed successfully");

					await transactor
						.addTtVnArticle(parsedHttp)
						.then(async () => {
							// delete cachedDoc;
							await cacheModel
								.deleteOne({ _id: cachedDoc._id })
								.catch((err) => {
									console.log("[parser.js:parseCache] Error when deleting cachedDoc: " + err);
									return;
								})
								.finally(console.log("[parser.js:parseCache] Deleted cachedDoc: " + cachedDoc._id));
							numOfCachedDocs--;
						})
						.catch((err) => {
							console.log("[parser.js:parseCache] Error when call transactor: " + err);
						});

					break;
				}
			}

			continue;
		} catch (err) {
			console.log("[parser.js:parseCache] Error: " + err);
			return;
		}
	}
}
