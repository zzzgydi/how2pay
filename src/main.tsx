import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./assets/index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="flex flex-col w-full h-screen">
      <div className="flex-auto w-full">
        <App />
      </div>

      <footer className="text-xs text-center py-2 text-slate-400 bg-slate-800">
        <div className="mb-1">
          由于作者水平问题，如最终价格与实际价格有出入，请以购物软件实际价格为准
        </div>
        <div>
          Copyright&copy; 2022{" "}
          <a className="underline" href="https://github.com/zzzgydi/how2pay">
            zzzgydi
          </a>
        </div>
      </footer>
    </div>
  </React.StrictMode>
);
