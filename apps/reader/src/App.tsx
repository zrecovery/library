import { type Component, ErrorBoundary } from "solid-js";
import { novel } from "./.tmp";
import Reader from "./components/reader/reader";
import { Route, Router } from "@solidjs/router";
import NavigationMenuComponent from "./components/navigation";

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
                    <Router>
                        <Route path="/" component={() => <h1>Hello</h1>} />
                        <Route path="/novel" component={() => <Reader article={novel} />} />
                    </Router>
                </ErrorBoundary>
            </main>
        </>
    );
};

export default App;
