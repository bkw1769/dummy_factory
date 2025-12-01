import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DummyFactory from "./pages/DummyFactory";
import SvgLaundry from "./pages/SvgLaundry";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dummy-factory" element={<DummyFactory />} />
        <Route path="/svg-laundry" element={<SvgLaundry />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
