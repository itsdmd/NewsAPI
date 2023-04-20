console.log("query/date loaded");

let fetchedData = null;

const container = document.querySelector("#query_date_container");
const submitBtn = container.querySelector("button[type='submit']");

submitBtn.addEventListener("click", (e) => {
	e.preventDefault();
	const date = container.querySelector("#date").value;
	console.log(date);
	if (date) {
		// fetch data
		const options = {
			method: "GET",
			headers: {
				"X-RapidAPI-Key": "",
				"X-RapidAPI-Host": "vietnamese-news.p.rapidapi.com",
				RAPID_KEY: "",
			},
		};

		fetch("https://vietnamese-news.p.rapidapi.com/date/" + date + "/0", options)
			.then((response) => response.json())
			.then((response) => console.log(response))
			.catch((err) => console.error(err));
	}
});
