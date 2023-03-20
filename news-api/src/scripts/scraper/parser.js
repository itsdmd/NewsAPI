// Parse raw html response from cache
console.log("[parser.js]");

import * as dotenv from "dotenv";

import jsdom from "jsdom";
import mongoose from "mongoose";

import * as cacher from "./cacher.js";
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

export function htmlToJsdom(content) {
	// console.log("[parser:httpToJsdom]");

	return new JSDOM(content).window.document;
}

export async function parseDom(dom, mode) {
	// console.log("[parser:parseDom]");
	try {
		switch (mode) {
			/* ------------- TuoiTre ------------ */
			case "tt-vn-feed": {
				let urls = [];

				dom.querySelectorAll("h3 a").forEach((node) => {
					urls.push("https://tuoitre.vn" + node.getAttribute("href"));
				});

				return urls;
			}

			case "tt-vn-article": {
				/* ------------ metadata ------------ */
				/* #region   */
				// id
				let id = null;
				try {
					id = dom.querySelector("#hidNewsId").getAttribute("value");
				} catch (e) {
					console.log("[parser:parseDom] Error parsing id: " + e);
				}

				// url
				let url = null;
				try {
					url = dom.querySelector("#hidNewsUrl").getAttribute("value");
				} catch (e) {
					console.log("[parser:parseDom] Error parsing url: " + e);
				}

				// category
				let category = null;
				try {
					category = dom.querySelector("div.detail-cate a").textContent;
				} catch (e) {
					console.log("[parser:parseDom] Error parsing category: " + e);
				}

				// title
				let title = null;
				try {
					title = dom.querySelector("h1.detail-title").textContent;
				} catch (e) {
					console.log("[parser:parseDom] Error parsing title: " + e);
				}

				// description
				let description = null;
				try {
					description = dom.querySelector("h2.detail-sapo").textContent;
				} catch (e) {
					console.log("[parser:parseDom] Error parsing description: " + e);
				}

				// tags
				let tagNodes = dom.querySelectorAll("div.detail-tab > a");
				let tags = [];
				try {
					tagNodes.forEach((tag) => {
						tag.getAttribute("title");

						tags.push({
							title: tag.textContent,
							url: "https://tuoitre.vn" + tag.getAttribute("href"),
						});
					});
				} catch (e) {
					console.log("[parser:parseDom] Error parsing tags: " + e);
				}

				// publish_date
				// 18/03/2023 18:37 GMT+7
				// convert to isodate (2023-03-18T18:37:00+7:00)
				let rawDate = dom.querySelector("div[data-role='publishdate']").textContent.trim();
				let publish_date = null;
				try {
					publish_date =
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
				} catch (e) {
					console.log("[parser:parseDom] Error parsing publish_date: " + e);
				}

				// authors
				let authors = [];
				let authorNodes = dom.querySelectorAll(".author-item-name a.name");

				try {
					authorNodes.forEach((author) => {
						authors.push({
							name: author.textContent,
							url: author.getAttribute("href") === "javascript:;" ? "" : "https://tuoitre.vn" + author.getAttribute("href"),
						});
					});
				} catch (e) {
					console.log("[parser:parseDom] Error parsing authors: " + e);
				}

				/* #endregion */

				/* ------------- content ------------ */
				/* #region   */
				// content_blocks
				let content_blocks = [];

				// audio
				let audioplayer = dom.querySelector("div.audioplayer");
				if (audioplayer !== null && audioplayer !== undefined) {
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
					let attributes = [];
					let attr = {};

					let childNode = contentContainer.childNodes[i];

					switch (childNode.tagName) {
						// text
						case "H2":
						case "P": {
							if (childNode.childElementCount) {
								for (let j = 0; j < childNode.childElementCount; j++) {
									if (childNode.childNodes[j].tagName === "A") {
										try {
											attr = {
												tag: childNode.childNodes[j].tagName,
												content: childNode.childNodes[j].textContent,
												href: childNode.childNodes[j].getAttribute("href"),
											};
											attributes.push(attr);
										} catch (e) {
											console.log("[parser:parseDom] Error parsing content_blocks/A: " + e);
										}
									}
								}
							}

							break;
						}

						// photo
						case "FIGURE": {
							if (childNode.getAttribute("type") === "Photo") {
								try {
									attr = {
										src: childNode.childNodes[0].childNodes[0].getAttribute("src"),
										caption: childNode.childNodes[1].childNodes[0].textContent,
									};
									attributes.push(attr);
								} catch (e) {
									console.log("[parser:parseDom] Error parsing content_blocks/FIGURE: " + e);
								}
							}

							break;
						}

						// video
						case "DIV": {
							if (childNode.getAttribute("type") === "VideoStream") {
								try {
									attr = {
										src: "https://tuoitre.vn" + childNode.getAttribute("data-vid"),
										thumbnail: childNode.getAttribute("data-thumb"),
										caption: childNode.childNodes[0].childNodes[0].textContent,
									};
									attributes.push(attr);
								} catch (e) {
									console.log("[parser:parseDom] Error parsing content_blocks/DIV: " + e);
								}
							}

							break;
						}

						default:
							break;
					}

					if (childNode.tagName === "FIGURE") {
						content_blocks.push({
							tag: childNode.tagName,
							attributes: attributes,
						});
					} else if (attributes.length === 0) {
						content_blocks.push({
							tag: childNode.tagName,
							content: childNode.textContent,
						});
					} else {
						content_blocks.push({
							tag: childNode.tagName,
							content: childNode.textContent,
							attributes: attributes,
						});
					}
				}
				/* #endregion */

				// create new ttVnArticle
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

				// console.log("[parser:parseDom] ttVnArticle: " + JSON.stringify(ttVnArticle));
				return ttVnArticle;
			}

			/* ------------ ThanhNien ----------- */
			case "tn-vn-feed": {
				let urls = [];

				dom.querySelectorAll("a.box-category-link-title").forEach((node) => {
					urls.push("https://thanhnien.vn" + node.getAttribute("href"));
				});

				return urls;
			}

			case "tn-vn-article": {
				/* ------------ metadata ------------ */
				/* #region   */
				// id
				let id = "";
				try {
					id = dom.querySelector("meta[property='dable:item_id']").getAttribute("content");
				} catch (e) {
					console.log("[parser:parseDom] id: " + e);
				}

				// url
				let url = "";
				try {
					url = dom.querySelector("meta[property='og:url']").getAttribute("content");
				} catch (e) {
					console.log("[parser:parseDom] url: " + e);
				}

				// type
				let type = "";
				try {
					type = dom.querySelector("meta[property='og:type']").getAttribute("content");
				} catch (e) {
					console.log("[parser:parseDom] type: " + e);
				}

				// category
				let category = "";
				try {
					category = dom.querySelector("meta[property='article:section']").getAttribute("content");
				} catch (e) {
					console.log("[parser:parseDom] category: " + e);
				}

				// title
				let title = "";
				try {
					title = dom.querySelector("meta[property='og:title']").getAttribute("content");
				} catch (e) {
					console.log("[parser:parseDom] title: " + e);
				}

				// description
				let description = "";
				try {
					description = dom.querySelector("meta[property='og:description']").getAttribute("content");
				} catch (e) {
					console.log("[parser:parseDom] description: " + e);
				}

				// keywords
				let keywords = dom.querySelector("meta[name*='keywords']").getAttribute("content");
				try {
					keywords = keywords.split(", ");
				} catch (error) {
					console.log("[parser:parseDom] Error parsing keywords: " + error);
				}

				// tags
				let tags = [];
				try {
					let tagNodes = dom.querySelectorAll("div[data-role='tags'] a");
					tagNodes.forEach((node) => {
						tags.push({
							title: node.getAttribute("title"),
							url: "https://thanhnien.vn" + node.getAttribute("href"),
						});
					});
				} catch (e) {
					console.log("[parser:parseDom] tags: " + e);
				}

				// publish_date
				let publish_date = "";
				try {
					publish_date = dom.querySelector("meta[property='article:published_time']").getAttribute("content") + "+07:00";
				} catch (e) {
					console.log("[parser:parseDom] publish_date: " + e);
				}

				// authors
				let authors = [];
				try {
					if (dom.querySelector(".mauthor-title") === null || dom.querySelector(".mauthor-title") === undefined) {
						authors.push({
							name: dom.querySelector(".author-info-top a").title,
							url: "https://thanhnien.vn" + dom.querySelector(".author-info-top a").href,
						});
					} else {
						dom.querySelectorAll(".mauthor-title a").forEach((node) => {
							authors.push({
								name: node.title,
								url: "https://thanhnien.vn" + node.href,
							});
						});
					}
				} catch (e) {
					console.log("[parser:parseDom] authors: " + e);
				}
				/* #endregion */

				/* ------------- content ------------ */
				// content_blocks

				let content_blocks = [];
				let contentContainer = dom.querySelector("div.detail-content");

				for (let i = 1; i < contentContainer.childElementCount; i++) {
					let attributes = null;

					let childNode = contentContainer.childNodes[i];

					switch (childNode.tagName) {
						// text
						case "H2":
						case "P": {
							if (childNode.textContent.length === 0) {
								break;
							}

							attributes = [];

							if (childNode.childElementCount) {
								for (let j = 0; j < childNode.childElementCount; j++) {
									if (childNode.childNodes[j].tagName === "A") {
										let attr = {};
										try {
											attr = {
												tag: childNode.childNodes[j].tagName,
												content: childNode.childNodes[j].textContent,
												href: "https://thanhnien.vn" + childNode.childNodes[j].getAttribute("href"),
											};

											attributes.push(attr);
										} catch (e) {
											console.log("[parser:parseDom] content_blocks/A: " + e);
										}
									}
								}
							}

							if (attributes.length === 0) {
								content_blocks.push({
									tag: childNode.tagName,
									content: childNode.textContent,
								});
							} else {
								content_blocks.push({
									tag: childNode.tagName,
									content: childNode.textContent,
									attributes: { links: attributes },
								});
							}

							break;
						}

						// photo
						case "FIGURE": {
							if (childNode.getAttribute("type") === "Photo") {
								attributes = {};

								try {
									attributes.src = childNode.childNodes[0].childNodes[0].getAttribute("src");
								} catch (e) {
									console.log("[parser:parseDom] content_blocks/FIGURE/src missing");
								}

								try {
									attributes.caption = childNode.childNodes[1].childNodes[0].textContent;
								} catch (e) {
									console.log("[parser:parseDom] content_blocks/FIGURE/caption missing");
								}

								try {
									attributes.author = childNode.childNodes[2].childNodes[0].textContent;
								} catch (e) {
									console.log("[parser:parseDom] content_blocks/FIGURE/author missing");
								}
							}

							content_blocks.push({
								tag: childNode.tagName,
								content: childNode.textContent,
								attributes: attributes,
							});

							break;
						}

						// videos seems very rare within articles (they have a dedicated category)

						default:
							break;
					}
				}

				// create new ttVnArticle
				const TnVnArticle = {
					metadata: {
						id: id,
						url: url,
						type: type,
						category: category,
						title: title,
						description: description,
						keywords: keywords,
						tags: tags,
						publish_date: publish_date,
						authors: authors,
					},
					content_blocks: content_blocks,
				};

				// console.log("[parser:parseDom] tnVnArticle: " + JSON.stringify(TnVnArticle));
				return TnVnArticle;
			}

			default: {
				console.log("[parser:parseDom] Unknown mode: " + mode);
				break;
			}
		}
	} catch (error) {
		console.log("[parser:parseDom] Error: " + error);
		throw error;
	}
}

import cliProgress from "cli-progress";
export async function parseCache(mode, skipped = false) {
	// console.log("[parser:parseCache]");

	const startingCachedDoc = await cacheModel.count();
	let currentCachedDocs = startingCachedDoc;
	console.log("[parser:parseCache] numOfCachedDocs: " + currentCachedDocs);

	const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
	bar.start(startingCachedDoc, 0);

	while (currentCachedDocs > 0) {
		// create new vnexpressArticle
		try {
			// fetch doc in cacheSchema
			const cachedDoc = await cacheModel.findOne({ skipped: skipped }).catch((err) => {
				console.log("[parser:parseCache] Error when fetching doc: " + err);
				return;
			});

			// parse cachedDoc
			// console.log("[parser:parseCache] Parsing: " + cachedDoc._id); //+ " (url: " + cachedDoc.url + ")");
			const httpDoc = htmlToJsdom(cachedDoc.content);

			switch (mode) {
				case "tt-vn": {
					await parseDom(httpDoc, "tt-vn-article")
						.then(async (parsedHttp) => {
							// console.log("[parser:parseCache] Parsed successfully");

							await transactor
								.addTtVnArticle(parsedHttp)
								.then(async () => {
									// delete cachedDoc;
									await cacheModel.deleteOne({ _id: cachedDoc._id }).catch((err) => {
										console.log("[parser:parseCache] Error when deleting cachedDoc: " + err);
										return;
									});
									// .finally(console.log("[parser:parseCache] Deleted cachedDoc: " + cachedDoc._id));
									currentCachedDocs--;
								})
								.catch(async (err) => {
									console.log("[parser:parseCache] Error when call transactor: " + err);

									await cacheModel
										.deleteOne({ _id: cachedDoc._id })
										// .then(console.log("[parser:parseCache] Deleted cachedDoc: " + cachedDoc._id))
										.catch(async (err) => {
											console.log("[parser:parseCache] Error when deleting cachedDoc: " + err);

											return;
										});

									currentCachedDocs--;

									await cacher.cacheOne(cachedDoc.url, "tt-vn", true).then(() => {
										console.log("[parser:parseCache] Added back to cache");
									});
								});
						})
						.catch(async (err) => {
							console.log("[parser:parseCache] Error when parsing cachedDoc: " + err);

							await cacheModel
								.deleteOne({ _id: cachedDoc._id })
								// .then(console.log("[parser:parseCache] Deleted cachedDoc: " + cachedDoc._id))
								.catch((err) => {
									console.log("[parser:parseCache] Error when deleting cachedDoc: " + err);
									return;
								});
							currentCachedDocs--;

							await cacher.cacheOne(cachedDoc.url, "tt-vn", true).then(() => {
								console.log("[parser:parseCache] Added back to cache");
							});

							return;
						});

					break;
				}

				case "tn-vn": {
					await parseDom(httpDoc, mode + "-article")
						.then(async (parsedHttp) => {
							// console.log("[parser:parseCache] Parsed successfully");

							await transactor
								.addTnVnArticle(parsedHttp)
								.then(async () => {
									// delete cachedDoc;
									await cacheModel.deleteOne({ _id: cachedDoc._id }).catch((err) => {
										console.log("[parser:parseCache] Error when deleting cachedDoc: " + err);
										return;
									});
									// .finally(console.log("[parser:parseCache] Deleted cachedDoc: " + cachedDoc._id));
									currentCachedDocs--;
								})
								.catch(async (err) => {
									console.log("[parser:parseCache] Error when call transactor: " + err);

									await cacheModel
										.deleteOne({ _id: cachedDoc._id })
										// .then(console.log("[parser:parseCache] Deleted cachedDoc: " + cachedDoc._id))
										.catch(async (err) => {
											console.log("[parser:parseCache] Error when deleting cachedDoc: " + err);

											return;
										});

									currentCachedDocs--;

									await cacher.cacheOne(cachedDoc.url, "tt-vn", true).then(() => {
										console.log("[parser:parseCache] Added back to cache");
									});
								});
						})
						.catch(async (err) => {
							console.log("[parser:parseCache] Error when parsing cachedDoc: " + err);

							await cacheModel
								.deleteOne({ _id: cachedDoc._id })
								// .then(console.log("[parser:parseCache] Deleted cachedDoc: " + cachedDoc._id))
								.catch((err) => {
									console.log("[parser:parseCache] Error when deleting cachedDoc: " + err);
									return;
								});
							currentCachedDocs--;

							await cacher.cacheOne(cachedDoc.url, mode, true).then(() => {
								console.log("[parser:parseCache] Added back to cache");
							});

							return;
						});

					break;
				}
			}

			continue;
		} catch (err) {
			console.log("[parser:parseCache] Error: " + err);
			return;
		} finally {
			bar.update(startingCachedDoc - currentCachedDocs);
		}
	}

	bar.stop();
}
