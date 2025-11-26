import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Google AdSense 스크립트 동적 로드
const loadAdSense = () => {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

  if (clientId && clientId !== "ca-pub-PLACEHOLDER") {
    // AdSense 스크립트가 이미 로드되었는지 확인
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }
};

// 페이지 로드 후 AdSense 스크립트 로드 (성능 최적화)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadAdSense);
} else {
  // 이미 로드된 경우 약간 지연 후 실행
  setTimeout(loadAdSense, 1000);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
