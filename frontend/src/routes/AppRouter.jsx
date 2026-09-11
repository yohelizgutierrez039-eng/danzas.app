import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
/* import Clases from "../pages/Clases";
import Academias from "../pages/Academias";
import Login from "../pages/Login";
import Registro from "../pages/Registro"; */

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/clases" element={<Clases />} />

        <Route path="/academias" element={<Academias />} />

        <Route path="/login" element={<Login />} />

        <Route path="/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
