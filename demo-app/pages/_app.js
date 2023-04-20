import { ClerkProvider } from "@clerk/nextjs";

function App({ Component, pageProps }) {
	return (
		<ClerkProvider {...pageProps}>
			<Component {...pageProps} />
		</ClerkProvider>
	);
}

export default App;
