import { Component } from "solid-js";
import Reader from "./components/reader/reader";
import { novel } from "./tmp"

const App: Component = () => {
    return (
        <div>
            <p class="text-4xl text-green-700 text-center py-20">
                Hello
            </p>
            <article id="art" class="w-80vw h-24rem">
            </article>
            <Reader article={novel} />
        </div>
    );
};

export default App;
