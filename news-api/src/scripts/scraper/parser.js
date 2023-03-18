// Parse raw html response from cache
console.log("[parser.js]");

async function domParser(content) {
	let jsdom = await import("jsdom").then((jsdom) => {
		return jsdom;
	});
	const { JSDOM } = jsdom;

	return new JSDOM(content).window.document;
}

function parseDate(publisher, input) {
	switch (publisher) {
		case "vnexpress-article": {
			// "Thứ 6, 20/09/2019, 10:00 (GMT+7)"
			const date = input.split(", ")[1];
			const time = input.split(", ")[2];
			const utc = input.split(", ")[3];

			const day = parseInt(date.split("/")[0]);
			const month = parseInt(date.split("/")[1]);
			const year = parseInt(date.split("/")[2]);
			const hour = parseInt(time.split(":")[0]);
			const minute = parseInt(time.split(":")[1]);

			return new Date(`${year}-${month}-${day}T${hour}:${minute}:00.000Z+07:00`);
		}
	}
}

export async function parseCache() {
	let dotenv = await import("dotenv").then((dotenv) => {
		return dotenv;
	});
	dotenv.config();
	if (process.env.DATABASE_URL === undefined || process.env.DATABASE_URL === "") {
		console.log("[parser.js] Error: DATABASE_URL is not defined.");
		return;
	}

	let mongoose = await import("mongoose").then((mongoose) => {
		return mongoose;
	});

	if (process.env.DATABASE_URL === undefined || process.env.DATABASE_URL === "") {
		console.log("[parser.js] Error: DATABASE_URL is not defined.");
		return;
	}

	let model = await import("../../models/cache.js").then((model) => {
		return model;
	});

	mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
	const db = mongoose.connection;
	console.log("[parser.js] Connecting to Database.");

	db.on("error", (error) => console.error("[parser.js] Error connecting to database: " + error));
	db.once("open", async () => {
		console.log("[parser.js] Connected to Database");

		while ((await model.countDocuments()) > 0) {
			// fetch oldest doc in cacheSchema
			const cachedDoc = await model.findOne({}).sort({ created_at: 1 });
			const parsedDom = domParser(cachedDoc.content);

			switch (cachedDoc.publisher) {
				case "vnexpress-article": {
					/* ------------ metadata ------------ */
					/* #region   */
					// id
					const id = parsedDom.querySelector("meta[name*='tt_article_id']").getAttribute("content");

					// type
					const type = parsedDom.querySelector("meta[name*='tt_page_type']").getAttribute("content");

					// title
					const title = parsedDom.querySelector("h1.title-detail").textContent;

					// description
					const description = parsedDom.querySelector("p.description").textContent;

					// keywords
					const keywords = parsedDom.querySelector("meta[name*='keywords']").getAttribute("content").split(", ");

					// folders
					const foldersId = parsedDom.querySelector("meta[name*='tt_list_folder']").getAttribute("content").split(",");
					const foldersName = parsedDom.querySelector("meta[name*='tt_list_folder_name']").getAttribute("content").split(",");
					const folders = [];
					for (let i = 0; i < foldersId.length; i++) {
						folders.push({
							id: foldersId[i],
							name: foldersName[i],
						});
					}

					// tags
					const tags = [];
					parsedDom.querySelectorAll("h4.item-tag").forEach((tag) => {
						tags.push({
							url: tag.getAttribute("href"),
							name: tag.getAttribute("title"),
						});
					});

					// published_date
					const published_date = parseDate(cachedDoc.publisher, parsedDom.querySelector("span.date").textContent);

					// authors
					const authors = parsedDom.querySelector("p.Normal[styles*='text-align: right'] strong").textContent.split(", ");
					/* #endregion */

					/* ------------- content ------------ */
					// content_blocks
					let content_blocks = [];
					parsedDom.querySelectorAll("article.fck_detail").children.forEach((element) => {
						if (element.tagName === "figure") {
							// image
							if (element.hasAttribute("itemprop") && element.getAttribute("itemprop") === "image") {
								let img = element.querySelector("img");

								content_blocks.push({
									tag: img.tagName,
									content: img.getAttribute("src"),
									attributes: {
										alt: img.getAttribute("alt"),
									},
								});
							}
							// embeded video. only get the thumbnail image
							else if (element.getAttribute("class").contains("item_slide_show")) {
								let thumb = element.querySelector("div.box_img_video.embed-container img");

								content_blocks.push({
									tag: thumb.tagName,
									content: thumb.getAttribute("src"),
									attributes: {
										alt: thumb.getAttribute("alt"),
									},
								});
							}
						} else {
							content_blocks.push({
								tag: element.tagName,
								content: element.textContent,
								attributes: {},
							});
						}
					});

					/* ------------ comments ------------ */
					/* #region   */
					const allCmtElements = parsedDom.querySelectorAll("div.content-comment");
					let allCmts = [];

					allCmtElements.forEach((cmt) => {
						allCmts.push({
							author: {
								username: cmt.querySelector("a.nickname b").textContent,
								url: cmt.querySelector("a.nickname").getAttribute("href"),
								avatar: cmt.querySelector(".img_avatar").getAttribute("src"),
							},
							content: cmt.querySelector("p.full_content").textContent,
							created_at: cmt.querySelector("div").hasAttribute("data-time") ? cmt.querySelector("div").getAttribute("data-time") : null,
							likes: cmt.querySelector("span.total_like").textContent,
						});
					});
					/* #endregion */

					// create new vnexpressArticle
					try {
						const newArticle = {
							metadata: {
								id: id,
								type: type,
								typeNew: typeNew,
								title: title,
								description: description,
								keywords: keywords,
								folders: folders,
								tags: tags,
								published_date: published_date,
								authors: authors,
							},
							content_blocks: content_blocks,
							comments: allCmts,
						};

						let transactor = await import("../scripts/scraper/transactor").then((model) => {
							return model;
						});

						await transactor
							.addVnExpressArticle(newArticle)
							.then(() => {
								// delete cachedDoc
								model.deleteOne({ _id: cachedDoc._id }, (err) => {
									console.log("[parser.js:parseCache] Error deleting cachedDoc: " + err);
								});
							})
							.catch((err) => {
								console.log("[parser.js:parseCache] Error when call transactor: " + err);
							});
					} catch (err) {
						console.log("[parser.js:parseCache] Error: " + err);
					}
				}
			}
		}
	});
}
