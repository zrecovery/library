import type { Component } from "solid-js";
import Navbar from "./components/navbar";
import "./app.css";

const App: Component = () => {
  const data = createArticle();
  console.log(data);
  return <Navbar />;
};

export default App;
