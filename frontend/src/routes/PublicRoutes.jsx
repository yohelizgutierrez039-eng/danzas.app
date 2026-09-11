import React from "react";
import { Routes, Route } from "react-router-dom";
import "./PublicRoutes.css";

// Páginas públicas
import Home from "../screens/public/Home";
import Login from "../screens/auth/Login";
import Register from "../screens/auth/Register";
import ClassSearch from "../screens/public/ClassSearch";
import ClassDetail from "../screens/public/ClassDetail";

function PublicRoutes() {
  return (
    <div className="public-routes">
      <Routes>
        {/* Página principal */}
        <Route path="/" element={<Home />} />

        {/* Autenticación */}
        <Route path="/login" element={<Login />} />

        <Route path="/registro" element={<Register />} />

        {/* Exploración de clases */}
        <Route path="/clases" element={<ClassSearch />} />

        <Route path="/clases/:id" element={<ClassDetail />} />
      </Routes>
    </div>
  );
}

export default PublicRoutes;
