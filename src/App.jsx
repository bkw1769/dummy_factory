import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Home = lazy(() => import("./pages/Home.jsx"));
const DummyFactory = lazy(() => import("./pages/DummyFactory.jsx"));
const SvgLaundry = lazy(() => import("./pages/SvgLaundry.jsx"));
const Fastcampus = lazy(() => import("./pages/Fastcampus.jsx"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6 text-sm font-semibold">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dummy-factory" element={<DummyFactory />} />
          <Route path="/svg-laundry" element={<SvgLaundry />} />
          <Route path="/fastcampus" element={<Fastcampus />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
