import React from "react";

// use this for react 17
import ReactDOM from "react-dom";

// use this for react 18
// import ReactDOM from 'react-dom/client';

import "./index.css";
import { PUBLISHABLE_KEY } from "./config.ts";
import { App } from "./App.tsx";

const rootEl = document.getElementById("root")!;

// Use this for React 17
ReactDOM.render(
  <React.StrictMode>
    <App PUBLISHABLE_KEY={PUBLISHABLE_KEY} />
  </React.StrictMode>,
  rootEl
);

// Use this for React 18
// ReactDOM.createRoot(rootEl).render(
//   <React.StrictMode>
//     <App PUBLISHABLE_KEY={PUBLISHABLE_KEY} />
//   </React.StrictMode>
// );
