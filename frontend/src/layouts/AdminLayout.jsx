import { Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Sidebar from "../components/layout/Sidebar/Sidebar";
import Header from "../components/layout/Header/Header";
import "./DashboardLayout.css";

function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-layout">
      <Sidebar
        role="admin"
        userName={user?.nombre}
        userEmail={user?.correo}
        onLogout={logout}
      />

      <div className="dashboard-layout__content">
        <Header
          title="Panel de administración"
          user={user || { nombre: "", rol: "" }}
          onToggleSidebar={() => {}}
        />

        <main className="dashboard-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
