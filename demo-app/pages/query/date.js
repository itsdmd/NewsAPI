import Script from "next/script";
import Layout from "../components/Layout";

export default function Date() {
	return (
		<Layout>
			<div className="container d-flex flex-column justify-content-center p-4" id="query_date_container">
				<h1>Query by Date</h1>
				<form className="col-2 query_form">
					<div className="form-group my-4">
						<label htmlFor="date">Date</label>
						<input type="date" className="form-control" id="date" aria-describedby="dateHelp" placeholder="Enter date" />
					</div>
					<button type="submit" className="btn btn-primary">
						Submit
					</button>
				</form>
			</div>
			<Script src="/scripts/query/date.js" />
		</Layout>
	);
}
