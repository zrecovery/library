import { type Component, ErrorBoundary } from "solid-js";
import { novel } from "./.tmp";
import Reader from "./components/reader/reader";

const App: Component = () => {
    return (
        <div>
            <p class="text-4xl text-green-700 text-center py-20">Hello</p>
            <ErrorBoundary
                fallback={(error, reset) => (
                    <div>
                        <p>Something went wrong: {error.message}</p>
                        <button onClick={reset}>Try Again</button>
                    </div>
                )}
            >
                <Reader article={novel} />
            </ErrorBoundary>
        </div>
    );
};

export default App;
