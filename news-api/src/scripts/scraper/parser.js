// Parse raw html response from cache
console.log("\n[parser.js]");

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
console.log("\n[parser.js] Connecting to Database.");

db.on("error", (error) => console.log("\n[parser.js] Error connecting to database: " + error));
/* #endregion */
db.once("open", async () => {
	console.log("\n[parser.js] Connected to Database");
});

export function htmlToJsdom(content) {
	// console.log("\n[parser:httpToJsdom]");

	return new JSDOM(content).window.document;
}

export async function parseDom(dom, mode) {
	// console.log("\n[parser:parseDom]");
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
					console.log("\n[parser:parseDom] Error parsing id: " + e);
				}

				// url
				let url = null;
				try {
					url = dom.querySelector("#hidNewsUrl").getAttribute("value");
				} catch (e) {
					console.log("\n[parser:parseDom] Error parsing url: " + e);
				}

				// category
				let category = null;
				try {
					category = dom.querySelector("div.detail-cate a").textContent.replace(/\n/g, "").trim();
				} catch (e) {
					console.log("\n[parser:parseDom] Error parsing category: " + e);
				}

				// title
				let title = null;
				try {
					title = dom.querySelector("h1.detail-title").textContent.replace(/\n/g, "").trim();
				} catch (e) {
					console.log("\n[parser:parseDom] Error parsing title: " + e);
				}

				// description
				let description = null;
				try {
					description = dom.querySelector("h2.detail-sapo").textContent.replace(/\n/g, "").trim();

					// format: "\n       Description       \n"
					// remove \n and trim
					description = description.replace(/(\r \n|\n|\r)/gm, "").trim();
				} catch (e) {
					console.log("\n[parser:parseDom] Error parsing description: " + e);
				}

				// tags
				let tagNodes = dom.querySelectorAll("div.detail-tab > a");
				let tags = [];
				try {
					tagNodes.forEach((tag) => {
						tag.getAttribute("title");

						tags.push({
							title: tag.textContent.replace(/\n/g, "").trim(),
							url: "https://tuoitre.vn" + tag.getAttribute("href"),
						});
					});
				} catch (e) {
					console.log("\n[parser:parseDom] Error parsing tags: " + e);
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
					console.log("\n[parser:parseDom] Error parsing publish_date: " + e);
				}

				// authors
				let authors = [];
				let authorNodes = dom.querySelectorAll(".author-item-name a.name");

				try {
					authorNodes.forEach((author) => {
						authors.push({
							name: author.textContent.replace(/\n/g, "").trim(),
							url: author.getAttribute("href") === "javascript:;" ? "" : "https://tuoitre.vn" + author.getAttribute("href"),
						});
					});
				} catch (e) {
					console.log("\n[parser:parseDom] Error parsing authors: " + e);
				}

				/* #endregion */

				/* ------------- content ------------ */
				/* #region   */
				// content
				let content = [];

				// audio
				let audioplayer = dom.querySelector("div.audioplayer");
				if (audioplayer !== null && audioplayer !== undefined) {
					content.push({
						tag: audioplayer.tagName,
						content: "audioplayer",
						attributes: {
							src: audioplayer.getAttribute("data-file"),
						},
					});
				}

				let contentContainer = dom.querySelector("div.detail-content");
				for (let i = 0; i < contentContainer.childNodes.length; i++) {
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
												content: childNode.childNodes[j].textContent.replace(/\n/g, "").trim(),
												href: childNode.childNodes[j].getAttribute("href"),
											};
										} catch (e) {
											console.log("\n[parser:parseDom] Error parsing content/A");
										}

										try {
											attributes.push(attr);
										} catch (e) {
											console.log("\n[parser:parseDom] Error parsing content/A/push");
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
									attr.src = childNode.childNodes[0].childNodes[0].getAttribute("src");
								} catch (e) {
									console.log("\n[parser:parseDom] Error parsing content/FIGURE/src");
								}

								// the author is inside the caption
								// Example: Caption goes here - Ảnh: PHẠM TUẤN -> author name is "PHẠM TUẤN"
								let caption = "";
								try {
									caption = childNode.childNodes[1].childNodes[0].textContent.replace(/\n/g, "").trim();
								} catch (e) {
									console.log("\n[parser:parseDom] Error retreiving content/FIGURE/caption");
								}
								try {
									attr.caption = caption.slice(0, caption.lastIndexOf("-")).trim();
								} catch (e) {
									console.log("\n[parser:parseDom] Error parsing content/FIGURE/caption");
								}
								try {
									attr.author = caption
										.slice(caption.lastIndexOf("-") + 1)
										.split(":")
										.slice(1)
										.join(" ")
										.trim();
								} catch (e) {
									console.log("\n[parser:parseDom] Error parsing content/FIGURE/author");
								}

								try {
									attributes.push(attr);
								} catch (e) {
									console.log("\n[parser:parseDom] Error parsing content/FIGURE/push");
								}
							}

							break;
						}

						case "DIV": {
							// video
							if (childNode.getAttribute("type") === "VideoStream") {
								try {
									attr.src = "https://tuoitre.vn" + childNode.getAttribute("data-vid");
								} catch (e) {
									console.log("\n[parser:parseDom] Error parsing content/DIV/src(data-vid)");
								}

								if (attr.src === null || attr.src === undefined || attr.src === "") {
									try {
										attr.src = "https:" + childNode.getAttribute("data-src");
									} catch (e) {
										console.log("\n[parser:parseDom] Error parsing content/DIV/src(data-src)");
									}
								}

								try {
									attr.thumbnail = childNode.getAttribute("data-thumb");
								} catch (e) {
									// console.log("\n[parser:parseDom] Error parsing content/DIV/thumbnail");
								}

								try {
									attr.caption = childNode.childNodes[0].childNodes[0].textContent.replace(/\n/g, "").trim();
								} catch (e) {
									console.log("\n[parser:parseDom] Error parsing content/DIV/caption");
								}
							}

							// photo (old)
							else if (childNode.getAttribute("type") === "Photo") {
								try {
									attr.src = childNode.childNodes[0].childNodes[0].getAttribute("src");
								} catch (e) {
									console.log("\n[parser:parseDom] Error parsing content/DIV/src");
								}

								let caption = "";
								try {
									caption = childNode.childNodes[1].childNodes[0].textContent.replace(/\n/g, "").trim();
								} catch (e) {
									console.log("\n[parser:parseDom] Error retreiving content/DIV/caption");
								}
								try {
									attr.caption = caption.slice(0, caption.lastIndexOf("-")).trim();
								} catch (e) {
									console.log("\n[parser:parseDom] Error parsing content/DIV/caption");
								}
								try {
									attr.author = caption
										.slice(caption.lastIndexOf("-") + 1)
										.split(":")
										.slice(1)
										.join(" ")
										.trim();
								} catch (e) {
									console.log("\n[parser:parseDom] Error parsing content/DIV/author");
								}
							} else {
								continue;
							}

							try {
								attributes.push(attr);
							} catch (e) {
								console.log("\n[parser:parseDom] Error parsing content/DIV/push");
							}

							break;
						}

						case "TABLE": {
							// photo
							if (childNode.classList.contains("desc_image")) {
								try {
									attr.src = "https:" + childNode.querySelector("img").getAttribute("src");
								} catch (e) {
									console.log("\n[parser:parseDom] Error parsing content/TABLE/src");
								}

								try {
									attr.caption = childNode.childNodes[0].childNodes[1].childNodes[0].textContent.replace(/\n/g, "").trim();
								} catch (e) {
									console.log("\n[parser:parseDom] Error parsing content/TABLE/caption");
								}
							} else break;

							try {
								attributes.push(attr);
							} catch (e) {
								console.log("\n[parser:parseDom] Error parsing content/TABLE/push");
							}

							break;
						}

						default:
							if (childNode.textContent.trim() !== "") {
								content.push({
									tag: "P",
									content: childNode.textContent.trim(),
								});
								// continue;
							}

							// console.log("\n[parser:parseDom] Unknown tag: " + childNode.tagName);
							continue;
					}

					try {
						// video
						if (childNode.tagName === "FIGURE" || childNode.getAttribute("type") === "VideoStream") {
							content.push({
								tag: childNode.tagName,
								attributes: attributes,
							});
						}

						// photo in table (old)
						else if (childNode.tagName === "TABLE" && attributes.length > 0) {
							content.push({
								tag: "FIGURE",
								attributes: attributes,
							});
						}

						// blank attributes
						else if (attributes.length === 0) {
							content.push({
								tag: childNode.tagName,
								content: childNode.textContent.trim(),
							});
						}

						// other
						else {
							content.push({
								tag: childNode.tagName,
								content: childNode.textContent.trim(),
								attributes: attributes,
							});
						}
					} catch (e) {
						try {
							content.push({
								tag: "P",
								content: childNode.textContent.trim(),
							});
							continue;
						} catch (e) {
							console.log("\n[parser:parseDom] Error pushing to content: " + e);
						}
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
					content: content,
				};

				// console.log("\n[parser:parseDom] ttVnArticle: " + JSON.stringify(ttVnArticle));
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
					console.log("\n[parser:parseDom] id: " + e);
				}

				// url
				let url = "";
				try {
					url = dom.querySelector("meta[property='og:url']").getAttribute("content");
				} catch (e) {
					console.log("\n[parser:parseDom] url: " + e);
				}

				// category
				let category = "";
				try {
					category = dom.querySelector("meta[property='article:section']").getAttribute("content");
				} catch (e) {
					console.log("\n[parser:parseDom] category: " + e);
				}

				// title
				let title = "";
				try {
					title = dom.querySelector("meta[property='og:title']").getAttribute("content").trim();
				} catch (e) {
					console.log("\n[parser:parseDom] title: " + e);
				}

				// description
				let description = "";
				try {
					description = dom.querySelector("meta[property='og:description']").getAttribute("content").trim();
				} catch (e) {
					console.log("\n[parser:parseDom] description: " + e);
				}

				// keywords
				let keywords = [];
				try {
					keywords = dom.querySelector("meta[name*='keywords']").getAttribute("content").replace(/\n/g, "").split(",");

					keywords = keywords.map((keyword) => keyword.trim().toLowerCase());
				} catch (error) {
					console.log("\n[parser:parseDom] Error parsing keywords: " + error);
				}

				// tags
				let tags = [];
				try {
					let tagNodes = dom.querySelectorAll("div[data-role='tags'] a");
					tagNodes.forEach((node) => {
						tags.push({
							title: node.getAttribute("title").trim().toLowerCase(),
							url: "https://thanhnien.vn" + node.getAttribute("href"),
						});
					});
				} catch (e) {
					console.log("\n[parser:parseDom] tags: " + e);
				}

				// publish_date
				/* #region   */
				let pubdate = {};
				try {
					pubdate.year = dom.querySelector("meta[property='article:published_time']").getAttribute("content").split("T")[0].split("-")[0];
				} catch (e) {
					console.log("\n[parser:parseDom] publish_date/year");
				}
				try {
					// left pad with 0
					pubdate.month = dom
						.querySelector("meta[property='article:published_time']")
						.getAttribute("content")
						.split("T")[0]
						.split("-")[1]
						.padStart(2, "0");
				} catch (e) {
					console.log("\n[parser:parseDom] publish_date/month");
				}
				try {
					pubdate.day = dom
						.querySelector("meta[property='article:published_time']")
						.getAttribute("content")
						.split("T")[0]
						.split("-")[2]
						.padStart(2, "0");
				} catch (e) {
					console.log("\n[parser:parseDom] publish_date/day");
				}
				try {
					pubdate.hour = dom
						.querySelector("meta[property='article:published_time']")
						.getAttribute("content")
						.split("T")[1]
						.split(":")[0]
						.padStart(2, "0");
				} catch (e) {
					console.log("\n[parser:parseDom] publish_date/hour");
				}
				try {
					pubdate.minute = dom
						.querySelector("meta[property='article:published_time']")
						.getAttribute("content")
						.split("T")[1]
						.split(":")[1]
						.padStart(2, "0");
				} catch (e) {
					console.log("\n[parser:parseDom] publish_date/minute");
				}
				try {
					pubdate.isodate = pubdate.year + "-" + pubdate.month + "-" + pubdate.day + "T" + pubdate.hour + ":" + pubdate.minute + ":00+07:00";
					pubdate.isodate = new Date(pubdate.isodate).toISOString();
				} catch (e) {
					console.log("\n[parser:parseDom] publish_date/isodate");
				}

				/* #endregion */

				// authors
				let authors = [];
				try {
					if (dom.querySelector(".mauthor-title")) {
						dom.querySelectorAll(".mauthor-title a").forEach((node) => {
							authors.push({
								name: node.title.replace(/\n/g, "").trim(),
								url: node.href === "javascript:;" ? "" : "https://thanhnien.vn" + node.href,
							});
						});
					} else {
						// older articles have the author name at the bottom right but still have a blank div.author-info-top
						if (dom.querySelector(".author-info-top a").textContent.length) {
							authors.push({
								name: dom.querySelector(".author-info-top a").textContent.replace(/\n/g, "").trim(),
								url:
									dom.querySelector(".author-info-top a").href === "javascript:;"
										? ""
										: "https://tuoitre.vn" + dom.querySelector(".author-info-top a").href,
							});
						} else {
							authors.push({
								name: dom.querySelector("strong").textContent.replace(/\n/g, "").trim(),
							});
						}
					}
				} catch (e) {
					// older articles have the author name at the bottom right
					try {
						authors.push({
							name: dom.querySelector("strong").textContent.replace(/\n/g, "").trim(),
						});
					} catch (e) {
						console.log("\n[parser:parseDom] authors: " + e);
					}
				}
				/* #endregion */

				/* ------------- content ------------ */
				let content = [];
				let contentContainer = dom.querySelectorAll("div.detail-content > *");

				for (let i = 0; i < contentContainer.length; i++) {
					/* #region   */
					// remove all \n and trim. if empty, continue
					if (contentContainer[i].textContent.replace(/\n/g, "").trim().length === 0) {
						continue;
					}

					// for older articles, there's a sneaky script div
					if (contentContainer[i].textContent.includes("function")) {
						continue;
					}
					// and usually the <strong> tag is the author name so break
					if (contentContainer[i].childNodes[0].tagName === "STRONG") {
						break;
					}

					let type = "";
					let addContentKey = true;

					let tagOverride = {
						yes: false,
						to: "",
					};
					/* #endregion */

					let attributes = [];
					let attr = {};

					let childElement = contentContainer[i];

					switch (childElement.tagName) {
						// text
						case "H2":
						case "P": {
							// skip right-aligned text since it's the author's name in older articles
							try {
								if (childElement.getAttribute("align") === "right") {
									continue;
								}
							} catch (e) {}

							type = "text";
							if (childElement.textContent.length === 0) {
								break;
							}

							if (childElement.childElementCount) {
								if (childElement.querySelectorAll("BR").length === childElement.childElementCount) {
									type = "text";
									break;
								}

								type = "texta";
								for (let j = 0; j < childElement.childElementCount; j++) {
									if (childElement.children[j].tagName === "A") {
										try {
											attr.tag = childElement.children[j].tagName;
										} catch (e) {
											console.log("\n[parser:parseDom] content/P/A/tag");
										}

										try {
											attr.content = childElement.children[j].textContent.trim();

											if (attr.content.length === 0) {
												continue;
											}
										} catch (e) {
											console.log("\n[parser:parseDom] content/P/A/content");
										}

										try {
											attr.href = "https://thanhnien.vn" + childElement.children[j].getAttribute("href");
										} catch (e) {
											console.log("\n[parser:parseDom] content/P/A/href");

											attr.href = null;
										}

										try {
											attributes.push({
												tag: attr.tag,
												content: attr.content,
												href: attr.href,
											});
										} catch (e) {
											console.log("\n[parser:parseDom] content/P/A/push");
										}
									}
								}
							}

							break;
						}

						// photo
						case "FIGURE": {
							type = "image";
							addContentKey = false;

							if (childElement.getAttribute("type") === "Photo") {
								try {
									attr.src = childElement.querySelector("img").getAttribute("src");
								} catch (e) {
									console.log("\n[parser:parseDom] content/FIGURE/src");

									attr.src = "";
								}

								try {
									attr.caption = childElement.querySelector("figcaption").textContent.replace(/\n/g, "").trim();
								} catch (e) {
									// console.log("\n[parser:parseDom] content/FIGURE/caption");
								}

								try {
									attr.author = childElement.childNodes[2].childNodes[0].textContent.replace(/\n/g, "").trim();
								} catch (e) {
									// console.log("\n[parser:parseDom] content/FIGURE/author");
								}

								try {
									attributes.push({
										src: attr.src,
										caption: attr.caption,
										author: attr.author,
									});
								} catch (e) {
									console.log("\n[parser:parseDom] content/FIGURE/push");
								}
							}

							break;
						}

						// content
						case "DIV": {
							// video
							if (childElement.getAttribute("type") === "VideoStream") {
								type = "video";
								addContentKey = false;

								try {
									attr.src = "https://" + childElement.getAttribute("data-vid");
								} catch (e) {
									try {
										attr.src = dom.querySelector(".box-video").querySelector("iframe").getAttribute("src");
									} catch (e) {
										console.log("\n[parser:parseDom] content/DIV/video/src");
									}

									if (attr.src === null || attr.src === undefined) {
										attr.src = "";
									}
								}

								try {
									attr.caption = childElement.querySelector(".VideoCMS_Caption").querySelector("p").textContent.replace(/\n/g, "").trim();
								} catch (e) {
									// console.log("\n[parser:parseDom] content/DIV/video/caption");
								}

								try {
									attr.author = childElement.querySelector(".VideoCMS_Author").querySelector("p").textContent.replace(/\n/g, "").trim();
								} catch (e) {
									// console.log("\n[parser:parseDom] content/DIV/author");
								}

								attributes.push({
									src: attr.src,
									caption: attr.caption,
									author: attr.author,
								});

								break;
							}

							// older photo
							// else if (childElement.querySelector("table").querySelector("img")) {
							// 	type = "image";
							// 	tagOverride.yes = true;
							// 	tagOverride.to = "FIGURE";
							// 	addContentKey = false;

							// 	try {
							// 		attr.src = childElement.querySelector("table").querySelector("img").getAttribute("src");
							// 	} catch (e) {
							// 		console.log("\n[parser:parseDom] content/DIV/image/src");
							// 	}

							// 	try {
							// 		attr.caption = childElement
							// 			.querySelector("table")
							// 			.querySelector("img")
							// 			.getAttribute("alt")
							// 			.textContent.replace(/\n/g, "")
							// 			.trim();
							// 	} catch (e) {
							// 		try {
							// 			attr.caption = childElement.querySelector("table").textContent.replace(/\n/g, "").trim();
							// 		} catch (e) {
							// 			// console.log("\n[parser:parseDom] content/DIV/image/caption");
							// 		}
							// 	}

							// 	attributes.push({
							// 		src: attr.src,
							// 		caption: attr.caption,
							// 	});

							// 	break;
							// }

							// highlight
							// NOTE: <a> tags within the highlight are very rare and will be ignored
							else if (childElement.getAttribute("type") === "boxhighlight") {
								type = "highlight";
								addContentKey = false;

								let highlightContent = [];

								try {
									childElement.querySelector("div.boxhighlight-content").childNodes.forEach((node) => {
										if (node.getAttribute("align") === "right") {
											attr.author = node.textContent.replace(/\n/g, "").trim();
										} else if (node.textContent.length > 0) {
											try {
												highlightContent.push({
													tag: node.tagName,
													content: node.textContent.replace(/\n/g, "").trim(),
												});
											} catch (e) {
												console.log("\n[parser:parseDom] content/DIV/boxhighlight/P/attr");
											}
										}
									});
								} catch (e) {
									try {
										let childNodes = childElement.querySelector("div.boxhighlight-content").childNodes;
										for (let i = 0; i < childNodes.length; i++) {
											try {
												if (childNodes[i].tagName === "BR") {
													continue;
												} else {
													highlightContent.push({
														tag: "P",
														content: childNodes[i].textContent.replace(/\n/g, "").trim(),
													});
												}
											} catch (e) {
												highlightContent.push(childNodes[i].textContent.replace(/\n/g, "").trim());
											}
										}
									} catch (e) {
										console.log("\n[parser:parseDom] content/DIV/boxhighlight/content");
									}
								}

								attributes.push({
									content: highlightContent,
									author: attr.author,
								});

								break;
							}

							// quote
							else if (childElement.getAttribute("type") === "block-quote-info") {
								type = "quote";
								addContentKey = false;

								try {
									attr.content = childElement.querySelector(".quote-content").textContent.replace(/\n/g, "").trim();
								} catch (e) {
									// console.log("\n[parser:parseDom] content/DIV/quote/content");
								}

								try {
									attr.author = childElement.querySelector(".quote-author-info .q-name").textContent.replace(/\n/g, "").trim();
								} catch (e) {
									// console.log("\n[parser:parseDom] content/DIV/quote/author");
								}

								attributes.push({
									content: attr.content,
									author: attr.author,
								});

								break;
							}

							// older highlight
							// else if (childElement.querySelector("div.quote")) {
							// 	type = "highlight";
							// 	addContentKey = false;

							// 	if (childElement.querySelector("div.quote__content").childElementCount) {
							// 		let content = [];
							// 		let node = childElement.querySelector("div.quote");

							// 		for (let i = 0; i < node.childElementCount; i++) {
							// 			if (node.children[i].tagName === "H3") {
							// 				try {
							// 					content.push({
							// 						tag: "H3",
							// 						content: node.children[i].textContent.replace(/\n/g, "").trim(),
							// 					});
							// 				} catch (e) {
							// 					// console.log("\n[parser:parseDom] content/DIV/quote/content");
							// 				}
							// 			} else if (node.children[i].textContent.length) {
							// 				try {
							// 					content.push({
							// 						tag: "P",
							// 						content: node.children[i].textContent.replace(/\n/g, "").trim(),
							// 					});
							// 				} catch (e) {
							// 					// console.log("\n[parser:parseDom] content/DIV/quote/content");
							// 				}
							// 			}
							// 		}

							// 		try {
							// 			attr.author = childElement.querySelector("strong").textContent.replace(/\n/g, "").trim();
							// 		} catch (e) {
							// 			// console.log("\n[parser:parseDom] content/DIV/quote/author");
							// 		}

							// 		attributes.push({
							// 			content: content,
							// 			author: attr.author,
							// 		});

							// 		break;
							// 	}

							// 	break;
							// }

							/* ------------- legacy ------------- */
							/* #region   */
							// plain text
							// else if (childElement.childElementCount === 0 && childElement.textContent.replace(/\n/g, "").trim().length > 0) {
							// 	type = "text";
							// 	tagOverride.yes = true;
							// 	tagOverride.to = "P";

							// 	break;
							// }

							// // complex
							// else if (childElement.childElementCount > 0) {
							// 	// text with <a> tag
							// 	if (childElement.querySelector("a")) {
							// 		type = "texta";
							// 		tagOverride.yes = true;
							// 		tagOverride.to = "P";

							// 		let children = childElement.children;

							// 		for (let j = 0; j < children.length; j++) {
							// 			let child = children[j];

							// 			if (child.tagName === "A") {
							// 				try {
							// 					attr.tag = child.tagName;
							// 				} catch (e) {
							// 					// console.log("\n[parser:parseDom] content/DIV/A/tag");
							// 				}

							// 				try {
							// 					attr.content = child.textContent.trim();
							// 				} catch (e) {
							// 					// console.log("\n[parser:parseDom] content/DIV/A/content");
							// 				}

							// 				try {
							// 					attr.href = "https://thanhnien.vn" + child.getAttribute("href");
							// 				} catch (e) {
							// 					console.log("\n[parser:parseDom] content/DIV/A/href");

							// 					attr.href = null;
							// 				}

							// 				try {
							// 					attributes.push({
							// 						tag: attr.tag,
							// 						content: attr.content,
							// 						href: attr.href,
							// 					});
							// 				} catch (e) {
							// 					console.log("\n[parser:parseDom] content/DIV/A/push");
							// 				}
							// 			}
							// 		}

							// 		break;
							// 	}

							// 	// photo & video
							// 	else if (childElement.querySelector("table")) {
							// 		// photo
							// 		if (childElement.querySelector("table.imagefull")) {
							// 			type = "image";
							// 			addContentKey = false;
							// 			tagOverride.yes = true;
							// 			tagOverride.to = "FIGURE";

							// 			try {
							// 				attr.src = childElement.querySelector("img").getAttribute("src");
							// 			} catch (e) {
							// 				console.log("\n[parser:parseDom] content/DIV/img/src");

							// 				attr.src = "";
							// 			}

							// 			try {
							// 				attr.caption = childElement.querySelector("div.imgcaption p").textContent.replace(/\n/g, "").trim();
							// 			} catch (e) {
							// 				try {
							// 					attr.caption = childElement.querySelector("span").textContent.replace(/\n/g, "").trim();
							// 				} catch (e) {
							// 					// console.log("\n[parser:parseDom] content/DIV/img/caption");
							// 				}
							// 			}

							// 			try {
							// 				attr.author = childElement
							// 					.querySelector("div.imgcaption .source")
							// 					.textContent.replace(/\n/g, "")
							// 					.split(":")[1]
							// 					.trim();
							// 			} catch (e) {
							// 				try {
							// 					attr.caption = childElement.querySelector("span").textContent.replace(/\n/g, "").split(":")[1].trim();
							// 				} catch (e) {
							// 					// console.log("\n[parser:parseDom] content/DIV/img/author");
							// 				}
							// 			}

							// 			attributes.push({
							// 				src: attr.src,
							// 				caption: attr.caption,
							// 				attr: attr.author,
							// 			});

							// 			tagOverride.yes = true;
							// 			tagOverride.to = "FIGURE";

							// 			break;
							// 		}

							// 		// video
							// 		else if (childElement.querySelector("table.video")) {
							// 			type = "video";
							// 			addContentKey = false;

							// 			try {
							// 				attr.src = "https://hls.mediacdn.vn/" + childElement.querySelector("video").getAttribute("data-vid");
							// 			} catch (e) {
							// 				console.log("\n[parser:parseDom] content/DIV/video/src");

							// 				attr.src = "";
							// 			}

							// 			try {
							// 				attr.caption = childElement.querySelector(".imgcaption").textContent.replace(/\n/g, "").trim();
							// 			} catch (e) {
							// 				// console.log("\n[parser:parseDom] content/DIV/video/caption");
							// 			}

							// 			try {
							// 				attr.author = childElement
							// 					.querySelector("div.imgcaption .source")
							// 					.textContent.replace(/\n/g, "")
							// 					.split(":")[1]
							// 					.trim();
							// 			} catch (e) {
							// 				// console.log("\n[parser:parseDom] content/DIV/video/author");
							// 			}

							// 			try {
							// 				attr.thumbnail = childElement.querySelector("video").getAttribute("poster");
							// 			} catch (e) {
							// 				// console.log("\n[parser:parseDom] content/DIV/video/thumbnail");
							// 			}

							// 			attributes.push({
							// 				src: attr.src,
							// 				author: attr.author,
							// 				caption: attr.caption,
							// 				thumbnail: attr.thumbnail,
							// 			});

							// 			break;
							// 		}

							// 		// highlight
							// 		else if (childElement.querySelector("table.quotetable")) {
							// 			type = "highlight";
							// 			addContentKey = false;

							// 			let highlightContent = [];

							// 			// title
							// 			try {
							// 				let tagName = childElement.querySelector(".quote > *").tagName;
							// 				if (tagName === "H2" || tagName === "H3") {
							// 					highlightContent.push({
							// 						tag: tagName,
							// 						content: childElement
							// 							.querySelector(".quote > " + tagName)
							// 							.textContent.replace(/\n/g, "")
							// 							.trim(),
							// 					});
							// 				} else {
							// 					tagName = childElement.querySelector(".quote__content > *").tagName;
							// 					if (tagName === "H2" || tagName === "H3") {
							// 						highlightContent.push({
							// 							tag: tagName,
							// 							content: childElement
							// 								.querySelector(".quote__content > " + tagName)
							// 								.textContent.replace(/\n/g, "")
							// 								.trim(),
							// 						});
							// 					}
							// 				}
							// 			} catch (e) {
							// 				// console.log("\n[parser:parseDom] content/DIV/quotetable/title");
							// 			}

							// 			// content
							// 			try {
							// 				childElement.querySelector(".quote > div").childNodes.forEach((node) => {
							// 					if (node.textContent.replace(/\n/g, "").trim().length > 0) {
							// 						highlightContent.push({
							// 							tag: node.tagName,
							// 							content: node.textContent.replace(/\n/g, "").trim(),
							// 						});
							// 					}
							// 				});
							// 			} catch (e) {
							// 				console.log("\n[parser:parseDom] content/DIV/quotetable/content");
							// 			}

							// 			attributes.push({
							// 				content: highlightContent,
							// 			});
							// 		}
							// 	}
							// } else {
							// 	continue;
							// }
							/* #endregion */

							break;
						}

						// legacy photo/video
						// case "TABLE": {
						// 	// photo
						// 	if (childElement.classList.contains("picture") || childElement.querySelector("img")) {
						// 		type = "image";
						// 		tagOverride.yes = true;
						// 		tagOverride.to = "FIGURE";
						// 		addContentKey = false;

						// 		try {
						// 			attr.src = childElement.querySelector("img").getAttribute("src");
						// 		} catch (e) {
						// 			console.log("\n[parser:parseDom] content/TABLE/img/src");

						// 			attr.src = "";
						// 		}

						// 		try {
						// 			attr.caption = childElement.querySelector("[class~='caption']").textContent.replace(/\n/g, "").trim();
						// 		} catch (e) {
						// 			try {
						// 				attr.caption = childElement.querySelector("span").textContent.replace(/\n/g, "").trim();
						// 			} catch (e) {
						// 				// console.log("\n[parser:parseDom] content/TABLE/img/caption");
						// 			}
						// 		}

						// 		try {
						// 			attr.author = childElement.querySelector("[class~='author']").textContent.replace(/\n/g, "").trim();
						// 		} catch (e) {
						// 			// console.log("\n[parser:parseDom] content/TABLE/img/author");
						// 		}

						// 		try {
						// 			attributes.push({
						// 				src: attr.src,
						// 				caption: attr.caption,
						// 				author: attr.author,
						// 			});
						// 		} catch (e) {
						// 			console.log("\n[parser:parseDom] content/TABLE/img/attributes");
						// 		}
						// 	}

						// 	// video
						// 	else if (childElement.classList.contains("video")) {
						// 		type = "video";
						// 		tagOverride.yes = true;
						// 		tagOverride.to = "DIV";
						// 		addContentKey = false;

						// 		try {
						// 			attr.src = childElement.querySelector("video").getAttribute("src");
						// 		} catch (e) {
						// 			console.log("\n[parser:parseDom] content/TABLE/video/src");

						// 			attr.src = "";
						// 		}

						// 		try {
						// 			attr.caption = childElement.querySelector("[class~='caption']").textContent.replace(/\n/g, "").trim();
						// 		} catch (e) {
						// 			try {
						// 				attr.caption = childElement.querySelector("span").textContent.replace(/\n/g, "").trim();
						// 			} catch (e) {
						// 				// console.log("\n[parser:parseDom] content/TABLE/video/caption");
						// 			}
						// 		}

						// 		try {
						// 			attr.author = childElement.querySelector("[class~='author']").textContent.replace(/\n/g, "").trim();
						// 		} catch (e) {
						// 			// console.log("\n[parser:parseDom] content/TABLE/video/author");
						// 		}

						// 		try {
						// 			attr.thumbnail = childElement.querySelector("video").getAttribute("poster");
						// 		} catch (e) {
						// 			// console.log("\n[parser:parseDom] content/TABLE/video/thumbnail");
						// 		}

						// 		try {
						// 			attributes.push({
						// 				src: attr.src,
						// 				caption: attr.caption,
						// 				author: attr.author,
						// 				thumbnail: attr.thumbnail,
						// 			});
						// 		} catch (e) {
						// 			console.log("\n[parser:parseDom] content/TABLE/video/attributes");
						// 		}
						// 	} else {
						// 		// console.log("\n[parser:parseDom] content/TABLE/else");
						// 		continue;
						// 	}

						// 	break;
						// }

						// highlight
						case "NOTEBOX": {
							type = "highlight";
							tagOverride.yes = true;
							tagOverride.to = "DIV";

							try {
								for (let i = 0; i < childElement.children.length; i++) {
									if (childElement.children[i].querySelector("A")) {
										let allA = childElement.children[i].querySelectorAll("A");
										allA.forEach((a) => {
											attributes.push({
												tag: a.tagName,
												content: a.textContent.replace(/\n/g, "").trim(),
											});
										});
									} else {
										attributes.push({
											tag: childElement.children[i].tagName,
											content: childElement.children[i].textContent.replace(/\n/g, "").trim(),
										});
									}
								}

								break;
							} catch (e) {
								console.log("\n[parser:parseDom] content/NOTEBOX");
							}

							break;
						}

						default:
							// console.log("\n[parser:parseDom] Unknown tag: " + childElement.tagName);
							continue;
					}

					if (type === "") {
						continue;
					}

					try {
						let c = {};

						if (tagOverride.yes) {
							c.tag = tagOverride.to;
						} else {
							c.tag = childElement.tagName;
						}

						c.type = type;

						if (addContentKey === false) {
							c.attributes = attributes;
						} else if (attributes.length === 0) {
							c.content = childElement.textContent.replace(/\n/g, "").trim();
						} else {
							c.content = childElement.textContent.replace(/\n/g, "").trim();
							c.attributes = attributes;
						}

						content.push(c);
					} catch (e) {
						console.log("\n[parser:parseDom] Error pushing to content: " + e);
					}
				}

				/* #region   */

				// console.log("id: " + id);
				// console.log("url: " + url);
				// console.log("type: " + type);
				// console.log("category: " + category);
				// console.log("title: " + title);
				// console.log("description: " + description);
				// console.log("keywords: " + keywords);
				// console.log("tags: " + JSON.stringify(tags));
				// console.log("publish_date: " + JSON.stringify(publish_date));
				// console.log("authors: " + JSON.stringify(authors));
				// console.log("content: " + JSON.stringify(content));

				/* #endregion */

				// create new ttVnArticle
				const TnVnArticle = {
					metadata: {
						id: id,
						url: url,
						category: category,
						title: title,
						description: description,
						keywords: keywords,
						tags: tags,
						pubdate: pubdate,
						authors: authors,
					},
					content: content,
				};

				return TnVnArticle;
			}

			default: {
				console.log("\n[parser:parseDom] Unknown mode: " + mode);
				break;
			}
		}
	} catch (error) {
		console.log("\n[parser:parseDom] Error: " + error);
		throw error;
	}
}

import cliProgress from "cli-progress";
export async function parseCache(mode, skipped = false) {
	// console.log("\n[parser:parseCache]");

	const startingCachedDoc = await cacheModel.find({ skipped: skipped }).count();
	let currentCachedDocs = startingCachedDoc;
	// console.log("\n[parser:parseCache] numOfCachedDocs: " + currentCachedDocs);
	console.log("\n");

	const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
	bar.start(startingCachedDoc, 0);

	while (currentCachedDocs > 0) {
		// create new vnexpressArticle
		try {
			// fetch doc in cacheSchema
			const cachedDoc = await cacheModel.findOne({ skipped: skipped }).catch((err) => {
				console.log("\n[parser:parseCache] Error when fetching doc: " + err);
				return;
			});

			// parse cachedDoc
			// console.log("\n[parser:parseCache] Parsing: " + cachedDoc._id); //+ " (url: " + cachedDoc.url + ")");
			const httpDoc = htmlToJsdom(cachedDoc.content);

			switch (mode) {
				case "tt-vn": {
					await parseDom(httpDoc, "tt-vn-article")
						.then(async (parsedHttp) => {
							// console.log("\n[parser:parseCache] Parsed successfully");

							await transactor
								.addTtVnArticle(parsedHttp)
								.then(async () => {
									// delete cachedDoc;
									await cacheModel.deleteOne({ _id: cachedDoc._id }).catch((err) => {
										console.log("\n[parser:parseCache] Error when deleting cachedDoc: " + err);
										return;
									});
									// .finally(console.log("\n[parser:parseCache] Deleted cachedDoc: " + cachedDoc._id));
									currentCachedDocs--;
								})
								.catch(async (err) => {
									console.log("\n[parser:parseCache] Error when call transactor: " + err);

									await cacheModel
										.deleteOne({ _id: cachedDoc._id })
										// .then(console.log("\n[parser:parseCache] Deleted cachedDoc: " + cachedDoc._id))
										.catch(async (err) => {
											console.log("\n[parser:parseCache] Error when deleting cachedDoc: " + err);

											return;
										});

									currentCachedDocs--;

									await cacher.cacheOne(cachedDoc.url, "tt-vn", true).then(() => {
										console.log("\n[parser:parseCache] Added back to cache");
									});
								});
						})
						.catch(async (err) => {
							console.log("\n[parser:parseCache] Error when parsing cachedDoc: " + err);

							await cacheModel
								.deleteOne({ _id: cachedDoc._id })
								// .then(console.log("\n[parser:parseCache] Deleted cachedDoc: " + cachedDoc._id))
								.catch((err) => {
									console.log("\n[parser:parseCache] Error when deleting cachedDoc: " + err);
									return;
								});
							currentCachedDocs--;

							await cacher.cacheOne(cachedDoc.url, "tt-vn", true).then(() => {
								console.log("\n[parser:parseCache] Added back to cache");
							});

							return;
						});

					break;
				}

				case "tn-vn": {
					await parseDom(httpDoc, mode + "-article")
						.then(async (parsedHttp) => {
							// console.log("\n[parser:parseCache] Parsed successfully");

							await transactor
								.addTnVnArticle(parsedHttp)
								.then(async () => {
									// delete cachedDoc;
									await cacheModel.deleteOne({ _id: cachedDoc._id }).catch((err) => {
										console.log("\n[parser:parseCache] Error when deleting cachedDoc: " + err);
										return;
									});
									// .finally(console.log("\n[parser:parseCache] Deleted cachedDoc: " + cachedDoc._id));
									currentCachedDocs--;
								})
								.catch(async (err) => {
									console.log("\n[parser:parseCache] Error when call transactor: " + err);

									await cacheModel
										.deleteOne({ _id: cachedDoc._id })
										// .then(console.log("\n[parser:parseCache] Deleted cachedDoc: " + cachedDoc._id))
										.catch(async (err) => {
											console.log("\n[parser:parseCache] Error when deleting cachedDoc: " + err);

											return;
										});

									currentCachedDocs--;

									// await cacher.cacheOne(cachedDoc.url, "tt-vn", true).then(() => {
									// 	console.log("\n[parser:parseCache] Added back to cache");
									// });
								});
						})
						.catch(async (err) => {
							console.log("\n[parser:parseCache] Error when parsing cachedDoc: " + err);

							await cacheModel
								.deleteOne({ _id: cachedDoc._id })
								// .then(console.log("\n[parser:parseCache] Deleted cachedDoc: " + cachedDoc._id))
								.catch((err) => {
									console.log("\n[parser:parseCache] Error when deleting cachedDoc: " + err);
									return;
								});
							currentCachedDocs--;

							await cacher.cacheOne(cachedDoc.url, mode, true).then(() => {
								console.log("\n[parser:parseCache] Added back to cache");
							});

							return;
						});

					break;
				}
			}

			continue;
		} catch (err) {
			console.log("\n[parser:parseCache] Error: " + err);
			return;
		} finally {
			bar.update(startingCachedDoc - currentCachedDocs);
		}
	}

	bar.stop();
}
