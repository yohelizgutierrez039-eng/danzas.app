import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../screens/public/Home";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
