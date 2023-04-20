import Layout from "../components/Layout";

export default function Keyword() {
	return (
		<Layout>
			<div className="container d-flex flex-column justify-content-center p-4" id="query_date_container">
				<h1>Query by Keyword</h1>
				<form className="col-2 query_form">
					<div className="form-group my-4">
						<label htmlFor="keyword">Keyword</label>
						<input type="text" className="form-control" id="keyword" aria-describedby="keywordHelp" placeholder="Enter keyword" />
						<small id="keywordHelp" className="form-text text-muted">
							Enter a word to search for.
						</small>
					</div>
				</form>
			</div>
		</Layout>
	);
}
