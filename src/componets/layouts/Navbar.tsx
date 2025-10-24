import { useState, useEffect, useRef, type JSX } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaBell,
  FaSignOutAlt,
  FaUsers,
  FaMoneyBill,
  FaBook,
  FaComments,
  FaHome,
} from "react-icons/fa";
import logo from "../../assets/JyMchiquito.jpg";
import axios from "axios";

interface Notificacion {
  tipo: "mensaje" | "nota" | "pago" | "asignacion";
  texto: string;
}

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { firstName, lastName, id, type } = user;

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [mostrarNotif, setMostrarNotif] = useState(false);
  const [sinLeer, setSinLeer] = useState(0);

  const [acciones, setAcciones] = useState<
    { label: string; path: string; icon: JSX.Element }[]
  >([]);

  const iniciales = `${firstName?.[0] || ""}${
    lastName?.[0] || ""
  }`.toUpperCase();

  useEffect(() => {
    // Acciones según el tipo de usuario
    const base = [{ label: "Inicio", path: "/dashboard", icon: <FaHome /> }];

    if (type === "admin") {
      setAcciones([
        ...base,
        { label: "Usuarios", path: "/usuarios", icon: <FaUsers /> },
        { label: "Pagos", path: "/vistaPagos", icon: <FaMoneyBill /> },
        { label: "Carreras", path: "/career", icon: <FaBook /> },
        { label: "Mensajes", path: "/mensajes", icon: <FaComments /> },
      ]);
    } else if (type === "estudiante") {
      setAcciones([
        ...base,
        { label: "Mis Pagos", path: "/vistaPagos", icon: <FaMoneyBill /> },
        { label: "Mensajes", path: "/mensajes", icon: <FaComments /> },
        { label: "Mis Materias", path: "/materias", icon: <FaBook /> },
      ]);
    } else if (type === "profesor") {
      setAcciones([
        ...base,
        { label: "Mensajes", path: "/mensajes", icon: <FaComments /> },
        { label: "Materias", path: `/users/${id}/materias`, icon: <FaBook /> },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    const cargarNotificaciones = async () => {
      try {
        const res = await axios.get(
          `https://proyectofinal-backend-1-uqej.onrender.com/notifications/${id}/${type}`
        );
        setNotificaciones(res.data.slice(0, 5));
        setSinLeer(res.data.length);
      } catch (err) {
        console.error("Error al cargar notificaciones:", err);
      }
    };

    cargarNotificaciones();
  }, [id, type]);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        notifRef.current &&
        !(notifRef.current as any).contains(event.target)
      ) {
        setMostrarNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleAbrirNotificaciones = () => {
    setMostrarNotif(!mostrarNotif);
  };

  useEffect(() => {
    const ruta = location.pathname;
    const tiposLeidos: Notificacion["tipo"][] = [];

    if (ruta === "/mensajes") tiposLeidos.push("mensaje");
    else if (ruta === "/vistaPagos") tiposLeidos.push("pago");
    else if (
      ruta === "/materias" ||
      ruta === "/career" ||
      ruta.includes("/materias")
    ) {
      tiposLeidos.push("nota", "asignacion");
    }

    if (tiposLeidos.length > 0) {
      const restantes = notificaciones.filter(
        (n) => !tiposLeidos.includes(n.tipo)
      );

      if (restantes.length !== notificaciones.length) {
        setNotificaciones(restantes);
        setSinLeer(restantes.length);

        tiposLeidos.forEach((tipo) => {
          axios
            .post("https://proyectofinal-backend-1-uqej.onrender.com/notifications/marcar-tipo-leido", {
              user_id: id,
              tipo,
            })
            .catch((err) =>
              console.error("Error al marcar tipo como leído:", err)
            );
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <nav className="bg-teal-50 border-b border-teal-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      {/* Grupo izquierdo: logo + botones */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          <span className="text-teal-700 font-semibold text-lg">
            J & M University
          </span>
        </div>

        {/* Botones de navegación */}
        <div className="flex items-center gap-2">
          {acciones.map((accion, i) => {
            const esUsuarios =
              accion.path === "/usuarios" &&
              (location.pathname === "/usuarios" ||
                location.pathname === "/registro");

            // Logica para botones especiales relacionados
            const esPerfil =
              accion.path === "/profile" &&
              (location.pathname === "/profile" ||
                location.pathname === "/editar-usuario");

            const esPago =
              accion.path === "/vistaPagos" &&
              (location.pathname === "/vistaPagos" ||
                location.pathname === "/pagos");    

            const esMaterias =
              accion.path.includes("materias") &&
              (location.pathname === "/materias" ||
                location.pathname.startsWith("/career"));
            
            const esCareer =
              accion.path.includes("career") &&
              (location.pathname === "/career" ||
                location.pathname.startsWith("/career"));

            // Activo si coincide exacto, o si es una ruta relacionada
            const activo =
              esUsuarios ||
              esPerfil ||
              esMaterias ||
              esCareer ||
              esPago ||
              location.pathname === accion.path;

            return (
              <button
                key={i}
                onClick={() => navigate(accion.path)}
                className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-md border border-teal-600 hover:bg-teal-100 transition-all ${
                  activo ? "bg-teal-200" : "text-teal-700"
                }`}
              >
                {accion.icon}
                {accion.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grupo derecho: avatar + campanita + logout */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <button
          onClick={() => navigate("/profile")}
          title="Perfil"
          className="transition duration-200"
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold cursor-pointer ${
              location.pathname === "/profile" ||
              location.pathname === "/editar-usuario"
                ? "border-2 border-black bg-teal-600 text-white"
                : "bg-teal-600 text-white hover:bg-teal-700 hover:text-gray-100"
            }`}
          >
            {iniciales}
          </div>
        </button>

        {/* Campanita */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleAbrirNotificaciones}
            className="relative text-teal-600 hover:text-teal-800"
          >
            <FaBell size={20} />
            {sinLeer > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                {sinLeer}
              </span>
            )}
          </button>

          {mostrarNotif && (
            <div className="absolute right-0 top-8 mt-2 bg-white shadow-md rounded p-3 w-64 z-10">
              <p className="text-sm font-bold mb-2">Notificaciones</p>
              {notificaciones.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Sin notificaciones nuevas.
                </p>
              ) : (
                notificaciones.map((n: any, i) => (
                  <div
                    key={i}
                    className="text-sm border-b py-1 text-gray-800 cursor-pointer hover:bg-gray-100"
                    onClick={async () => {
                      // 1. Redirigir según tipo
                      if (n.tipo === "mensaje") navigate("/mensajes");
                      else if (n.tipo === "nota") navigate("/materias");
                      else if (n.tipo === "asignacion")
                        navigate("/users/:userId/materias");
                      else if (n.tipo === "pago") navigate("/vistaPagos");

                      // 2. Marcar como leída en backend
                      try {
                        await axios.post(
                          "https://proyectofinal-backend-1-uqej.onrender.com/notifications/marcar-leida",
                          {
                            user_id: id,
                            texto: n.texto,
                          }
                        );
                      } catch (err) {
                        console.error("Error al marcar como leída:", err);
                      }

                      // 3. Actualizar frontend
                      setNotificaciones((prev) =>
                        prev.filter((_, index) => index !== i)
                      );
                      setSinLeer((prev) => Math.max(prev - 1, 0));
                      setMostrarNotif(false);
                    }}
                  >
                    <strong>{n.tipo.toUpperCase()}</strong>: {n.texto}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-700"
        >
          <FaSignOutAlt />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
