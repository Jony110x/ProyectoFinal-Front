import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./views/Login";
import PublicRoutes from "./componets/routes/PublicRoutes";
import ProtectedRoutes from "./componets/routes/ProtectedRoutes";
import MainLayout from "./componets/layouts/MainLayout";

function App() {
  const Notifications = lazy(() => import("./views/Notifications"));
  const Dashboard = lazy(() => import("./views/Dashboard"));
  const Profile = lazy(() => import("./views/Profile"));
  const ListaUsuarios = lazy(() => import("./views/ListaUsuarios"))
  const Pagos = lazy (() => import("./views/Pagos"))
  const MisPagos = lazy (() => import("./views/MisPagos"))
  const Career = lazy (() => import("./views/Career"))
  const CareerEstudiante = lazy (() => import("./views/CareersEstudiante"))
  const Materias = lazy (() => import("./views/Materia"))
  const BandejaMensajes = lazy (() => import("./views/BandejaMensajes"))
  const EditarUsuario = lazy (() => import("./views/EditarUsuario"))
  const RegistroUsuario = lazy (() => import("./componets/routes/Register"))

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoutes />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoutes />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/registro" element={<RegistroUsuario />} />
            <Route path="/pagos" element={<Pagos />} />
            <Route path="/vistaPagos" element={<MisPagos />} />
            <Route path="/editar-usuario" element={<EditarUsuario />} />
            <Route path="/mensajes" element={<BandejaMensajes />} />
            <Route path="/usuarios" element={<ListaUsuarios />} />
            <Route path="/career/:careerId/materia" element={<Materias />} />
            <Route path="/users/:userId/materias" element={<Materias />} />
            <Route path="/materias" element={<CareerEstudiante />} />
            <Route path="/career" element={<Career />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
