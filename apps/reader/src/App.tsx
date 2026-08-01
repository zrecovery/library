import { type Component, ErrorBoundary, Suspense } from "solid-js";
import { novel } from "./.tmp";
import { Route, Router } from "@solidjs/router";
import NavigationMenuComponent from "./components/navigation";
import Reader from "./components/reader/reader";

const App: Component = () => {
	return (
		<>
			<nav>
				<NavigationMenuComponent />
			</nav>
			<main>
				<ErrorBoundary
					fallback={(error, reset) => (
						<div>
							<p>Something went wrong: {error.message}</p>
							<button onClick={reset}>Try Again</button>
						</div>
					)}
				>
					<Suspense fallback={<h2>Loading profile...</h2>}>
						<Router>
							<Route path="/" component={() => <h1>Hello</h1>} />
							<Route
								path="/novel"
								component={() => <Reader article={novel} />}
							/>
						</Router>
					</Suspense>
				</ErrorBoundary>
			</main>
		</>
	);
};

export default App;
