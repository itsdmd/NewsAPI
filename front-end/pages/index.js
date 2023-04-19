import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
	const user = useUser();

	return (
		<>
			<Head>
				<title>VN News Archive</title>
				<meta name="description" content="Front-end demo for Vietnamese News Archive API" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
				<link
					href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css"
					rel="stylesheet"
					integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ"
					crossOrigin="anonymous"
				></link>
			</Head>
			<main>
				<nav className="navbar navbar-expand-lg bg-body-tertiary">
					<div className="container-fluid">
						<a className="navbar-brand" href="/">
							<img src="/logo.png" alt="Logo" width="30" height="24" />
						</a>

						<a className="navbar-brand fw-bold" href="/">
							Vietnamese News Archive
						</a>
						<button
							className="navbar-toggler"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target="#navbarSupportedContent"
							aria-controls="navbarSupportedContent"
							aria-expanded="false"
							aria-label="Toggle navigation"
						>
							<span className="navbar-toggler-icon"></span>
						</button>
						<div className="collapse navbar-collapse" id="navbarSupportedContent">
							<ul className="navbar-nav me-auto mb-2 mb-lg-0">
								<li className="nav-item dropdown">
									<a
										className="nav-link active dropdown-toggle"
										href="#"
										aria-current="page"
										aria-expanded="false"
										data-bs-toggle="dropdown"
										role="button"
									>
										Query
									</a>
									<ul className="dropdown-menu">
										<li>
											<a className="dropdown-item" href="/query/date">
												Date
											</a>
										</li>
										<li>
											<a className="dropdown-item" href="/query/keyword">
												Keyword
											</a>
										</li>
									</ul>
								</li>
								<li className="nav-item dropdown">
									<a className="nav-link dropdown-toggle" href="/" aria-expanded="false" data-bs-toggle="dropdown" role="button">
										Analytics
									</a>
									<ul className="dropdown-menu">
										<li>
											<a className="dropdown-item" href="/analytics/statistics">
												Statistics
											</a>
										</li>
										<li>
											<a className="dropdown-item" href="/analytics/graphical">
												Graphical
											</a>
										</li>
									</ul>
								</li>
							</ul>
							<div>{user.isSignedIn ? <SignOutButton className="btn btn-danger" /> : <SignInButton className="btn btn-success" />}</div>
						</div>
					</div>
				</nav>
				<SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
				<script
					src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"
					integrity="sha384-ENjdO4Dr2bkBIFxQpeoTz1HIcje39Wm4jDKdf19U8gI4ddQ3GYNS7NTKfAdVQSZe"
					crossOrigin="anonymous"
				></script>
			</main>
		</>
	);
}
