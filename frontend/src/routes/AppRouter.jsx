import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

import ProtectedRoute from "./ProtectedRoute";

import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import StudentLayout from "../layouts/StudentLayout";
import ParentLayout from "../layouts/ParentLayout";
import InstructorLayout from "../layouts/InstructorLayout";
import AuthLayout from "../layouts/AuthLayout";

// Público
import Home from "../screens/public/Home";
import ExploreClasses from "../screens/public/ExploreClasses";
import ClassDetail from "../screens/public/ClassDetail";
import Academies from "../screens/public/Academies";
import AcademyDetail from "../screens/public/AcademyDetail";
import HowItWorks from "../screens/public/HowItWorks";
import About from "../screens/public/About";

// Autenticación
import Login from "../screens/auth/Login";
import Register from "../screens/auth/Register";
import ForgotPassword from "../screens/auth/ForgotPassword";
import ResetPassword from "../screens/auth/ResetPassword";

// Admin
import DashboardAdmin from "../screens/admin/DashboardAdmin";
import AcademiesAdmin from "../screens/admin/academies/AcademiesAdmin";
import AcademyReview from "../screens/admin/academies/AcademyReview";
import AcademyDetailAdmin from "../screens/admin/academies/AcademyDetailAdmin";
import ClassesAdmin from "../screens/admin/classes/ClassesAdmin";
import ClassDetailAdmin from "../screens/admin/classes/ClassDetailAdmin";

// Estudiante
import DashboardStudent from "../screens/student/DashboardStudent";
import ClassDetailStudent from "../screens/student/ClassDetailStudent";
import EnrollmentProcess from "../screens/student/EnrollmentProcess";

// Padre / acudiente
import DashboardParent from "../screens/parent/DashboardParent";
import ExploreClassesParent from "../screens/parent/ExploreClassesParent";
import Dependents from "../screens/parent/Dependents";
import DependentForm from "../screens/parent/DependentForm";

// Instructor
import DashboardInstructor from "../screens/instructor/DashboardInstructor";
import MyClasses from "../screens/instructor/MyClasses";
import ClassForm from "../screens/instructor/ClassForm";
import ClassDetailInstructor from "../screens/instructor/ClassDetailInstructor";

function AppRouter() {
  const { isAuthenticated, user } = useAuth();
  const userRole = user?.rol;

  return (
    <BrowserRouter>
      <Routes>
        {/* ===== Público (RF-005: navegación como invitado) ===== */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/clases" element={<ExploreClasses />} />
          <Route path="/clases/:id" element={<ClassDetail />} />
          <Route path="/academias" element={<Academies />} />
          <Route path="/academias/:id" element={<AcademyDetail />} />
          <Route path="/como-funciona" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* ===== Autenticación (pantallas de página completa) ===== */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/recuperar-password" element={<ForgotPassword />} />
          <Route path="/restablecer-password" element={<ResetPassword />} />
        </Route>

        {/* ===== Administrador ===== */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["admin"]}
            />
          }
        >
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<DashboardAdmin />} />
            <Route path="/admin/academias" element={<AcademiesAdmin />} />
            <Route
              path="/admin/academias/:id/revisar"
              element={<AcademyReview />}
            />
            <Route
              path="/admin/academias/:id"
              element={<AcademyDetailAdmin />}
            />
            <Route path="/admin/classes" element={<ClassesAdmin />} />
            <Route
              path="/admin/classes/:id"
              element={<ClassDetailAdmin />}
            />
          </Route>
        </Route>

        {/* ===== Estudiante ===== */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["estudiante"]}
            />
          }
        >
          <Route element={<StudentLayout />}>
            <Route path="/estudiante" element={<DashboardStudent />} />
            <Route
              path="/estudiante/clases/:id"
              element={<ClassDetailStudent />}
            />
            <Route
              path="/estudiante/clases/:id/inscribir"
              element={<EnrollmentProcess />}
            />
          </Route>
        </Route>

        {/* ===== Padre / acudiente ===== */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["padre"]}
            />
          }
        >
          <Route element={<ParentLayout />}>
            <Route path="/padre" element={<DashboardParent />} />
            <Route path="/padre/clases" element={<ExploreClassesParent />} />
            <Route path="/padre/menores" element={<Dependents />} />
            <Route path="/padre/menores/nuevo" element={<DependentForm />} />
          </Route>
        </Route>

        {/* ===== Instructor ===== */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["instructor"]}
            />
          }
        >
          <Route element={<InstructorLayout />}>
            <Route path="/instructor" element={<DashboardInstructor />} />
            <Route path="/instructor/clases" element={<MyClasses />} />
            <Route path="/instructor/clases/nueva" element={<ClassForm />} />
            <Route
              path="/instructor/clases/:id/editar"
              element={<ClassForm />}
            />
            <Route
              path="/instructor/clases/:id"
              element={<ClassDetailInstructor />}
            />
          </Route>
        </Route>

        {/* ===== Fallbacks ===== */}
        <Route
          path="/no-autorizado"
          element={
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <h1>No autorizado</h1>
              <p>No tenés permiso para ver esta sección.</p>
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
