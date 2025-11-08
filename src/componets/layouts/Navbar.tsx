//#region IMPORTACIONES
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
  FaBars,
  FaTimes,
} from "react-icons/fa";
import logo from "../../assets/JyMchiquito.jpg";
import axios from "axios";
//#endregion

//#region INTERFACES Y TYPES
interface Notificacion {
  tipo: "mensaje" | "nota" | "pago" | "asignacion";
  texto: string;
}
//#endregion

//#region COMPONENTE PRINCIPAL NAVBAR
const Navbar = () => {
  //#region ESTADOS Y HOOKS
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);
  const menuRef = useRef(null);

  // Obtener datos del usuario desde localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { 
    firstName, 
    lastName: lastName, 
    id, 
    type 
  } = user;

  console.log("Verificando nombres:", { firstName, lastName, id, type });

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [mostrarNotif, setMostrarNotif] = useState(false);
  const [sinLeer, setSinLeer] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [acciones, setAcciones] = useState<
    { label: string; path: string; icon: JSX.Element }[]
  >([]);
  //#endregion

  //#region EFECTOS Y LIFECYCLE
  /**
   * Configura las acciones de navegación según el tipo de usuario
   */
  useEffect(() => {
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

  /**
   * Carga las notificaciones del usuario desde la API
   */
  useEffect(() => {
    const cargarNotificaciones = async () => {
      try {
        const res = await axios.get(
          `https://proyectofinal-backend-1-uqej.onrender.com/notifications/${id}/${type}`
        );
        setNotificaciones(res.data.slice(0, 5)); // Limitar a 5 notificaciones
        setSinLeer(res.data.length);
      } catch (err) {
        console.error("Error al cargar notificaciones:", err);
      }
    };

    cargarNotificaciones();
  }, [id, type]);

  /**
   * Maneja el cierre de menús al hacer click fuera de ellos
   */
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        notifRef.current &&
        !(notifRef.current as any).contains(event.target)
      ) {
        setMostrarNotif(false);
      }
      if (
        menuRef.current &&
        !(menuRef.current as any).contains(event.target)
      ) {
        setMenuAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Marca notificaciones como leídas cuando se navega a secciones relacionadas
   */
  useEffect(() => {
    const ruta = location.pathname;
    const tiposLeidos: Notificacion["tipo"][] = [];

    // Determinar qué tipos de notificaciones marcar como leídas según la ruta
    if (ruta === "/mensajes") tiposLeidos.push("mensaje");
    else if (ruta === "/vistaPagos") tiposLeidos.push("pago");
    else if (
      ruta === "/materias" ||
      ruta === "/career" ||
      ruta.includes("/materias")
    ) {
      tiposLeidos.push("nota", "asignacion");
    }

    // Filtrar notificaciones y actualizar estado
    if (tiposLeidos.length > 0) {
      const restantes = notificaciones.filter(
        (n) => !tiposLeidos.includes(n.tipo)
      );

      if (restantes.length !== notificaciones.length) {
        setNotificaciones(restantes);
        setSinLeer(restantes.length);

        // Marcar como leídas en el backend
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
  //#endregion

  //#region FUNCIONES PRINCIPALES
  /**
   * Cierra la sesión del usuario y redirige al login
   */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

    /**
   * Obtiene las iniciales del usuario para mostrar en el avatar
   */
  const obtenerIniciales = () => {
    // Verificar datos directamente del objeto user
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    
    // Fallbacks en caso de que no estén disponibles los nombres
    if (user.firstName) return user.firstName[0].toUpperCase();
    if (user.username) return user.username[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    
    return "U"; // Inicial por defecto
  };

  const iniciales = obtenerIniciales();

  /**
   * Alterna la visibilidad del panel de notificaciones
   */
  const handleAbrirNotificaciones = () => {
    setMostrarNotif(!mostrarNotif);
    setMenuAbierto(false); // Cerrar menú móvil si está abierto
  };

  /**
   * Alterna la visibilidad del menú móvil
   */
  const toggleMenuMovil = () => {
    setMenuAbierto(!menuAbierto);
    setMostrarNotif(false); // Cerrar notificaciones si están abiertas
  };

  /**
   * Navega a una ruta y cierra el menú móvil
   */
  const navegarYCerrarMenu = (path: string) => {
    navigate(path);
    setMenuAbierto(false);
  };

  /**
   * Determina si un botón de navegación está activo según la ruta actual
   */
  const esActivo = (accion: { path: string; label: string }) => {
    const esUsuarios =
      accion.path === "/usuarios" &&
      (location.pathname === "/usuarios" ||
        location.pathname === "/registro");

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

    return esUsuarios || esPerfil || esMaterias || esCareer || esPago ||
      location.pathname === accion.path;
  };
  //#endregion

  //#region RENDER 
  return (
    <nav className="bg-teal-50 border-b border-teal-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-50">
      
      {/* Grupo izquierdo: logo + botones desktop */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
          <span className="text-teal-700 font-semibold text-base sm:text-lg hidden sm:block">
            J & M University
          </span>
          <span className="text-teal-700 font-semibold text-base sm:hidden">
            J&M
          </span>
        </div>

        {/* Botones de navegación - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {acciones.map((accion, i) => (
            <button
              key={i}
              onClick={() => navigate(accion.path)}
              className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-md border border-teal-600 hover:bg-teal-100 transition-all ${
                esActivo(accion) ? "bg-teal-200" : "text-teal-700"
              }`}
            >
              {accion.icon}
              {accion.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grupo derecho: elementos del lado derecho */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Grupo derecho móvil: campanita + hamburguesa */}
        <div className="flex md:hidden items-center gap-2">
          
          {/* Campanita móvil */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleAbrirNotificaciones}
              className="relative text-teal-600 hover:text-teal-800 p-2 rounded-md hover:bg-teal-100 transition-colors"
            >
              <FaBell size={18} />
              {sinLeer > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {sinLeer > 9 ? "9+" : sinLeer}
                </span>
              )}
            </button>

            {/* Panel de notificaciones móvil */}
            {mostrarNotif && (
              <div className="absolute right-0 top-10 mt-2 bg-white shadow-lg rounded-lg p-3 w-72 z-50 border border-teal-200">
                <p className="text-sm font-bold mb-2 text-teal-800">Notificaciones</p>
                {notificaciones.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-2">
                    Sin notificaciones nuevas.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notificaciones.map((n: any, i) => (
                      <div
                        key={i}
                        className="text-sm border-b border-gray-100 pb-2 text-gray-800 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                        onClick={async () => {
                          // Navegar según el tipo de notificación
                          if (n.tipo === "mensaje") navigate("/mensajes");
                          else if (n.tipo === "nota") navigate("/materias");
                          else if (n.tipo === "asignacion") navigate("/users/:userId/materias");
                          else if (n.tipo === "pago") navigate("/vistaPagos");

                          // Marcar como leída en el backend
                          try {
                            await axios.post(
                              "https://proyectofinal-backend-1-uqej.onrender.com/notifications/marcar-leida",
                              { user_id: id, texto: n.texto }
                            );
                          } catch (err) {
                            console.error("Error al marcar como leída:", err);
                          }

                          // Actualizar estado local
                          setNotificaciones((prev) => prev.filter((_, index) => index !== i));
                          setSinLeer((prev) => Math.max(prev - 1, 0));
                          setMostrarNotif(false);
                          setMenuAbierto(false);
                        }}
                      >
                        <div className="flex items-start gap-2">
                          {/* Indicador de tipo de notificación */}
                          <span className={`inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            n.tipo === 'mensaje' ? 'bg-blue-500' :
                            n.tipo === 'nota' ? 'bg-green-500' :
                            n.tipo === 'pago' ? 'bg-yellow-500' : 'bg-purple-500'
                          }`}></span>
                          <div className="flex-1">
                            <strong className="text-xs uppercase text-gray-600">{n.tipo}</strong>
                            <p className="text-gray-800 mt-1 text-xs">{n.texto}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Menú móvil - Hamburguesa */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={toggleMenuMovil}
              className="text-teal-700 p-2 rounded-md hover:bg-teal-100 transition-colors"
            >
              {menuAbierto ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            {/* Menú desplegable móvil */}
            {menuAbierto && (
              <div className="absolute right-0 top-10 mt-2 bg-white shadow-lg rounded-lg p-4 w-64 z-50 border border-teal-200">
                <div className="space-y-2">
                  {acciones.map((accion, i) => (
                    <button
                      key={i}
                      onClick={() => navegarYCerrarMenu(accion.path)}
                      className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md hover:bg-teal-50 transition-colors ${
                        esActivo(accion) ? "bg-teal-100 text-teal-800" : "text-gray-700"
                      }`}
                    >
                      <span className="text-teal-600">{accion.icon}</span>
                      <span className="font-medium">{accion.label}</span>
                    </button>
                  ))}
                  
                  {/* Separador */}
                  <div className="border-t border-gray-200 my-2"></div>
                  
                  {/* Perfil y logout en menú móvil */}
                  <button
                    onClick={() => navegarYCerrarMenu("/profile")}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md hover:bg-teal-50 transition-colors ${
                      esActivo({ path: "/profile", label: "Perfil" }) ? "bg-teal-100 text-teal-800" : "text-gray-700"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold text-sm">
                      {iniciales}
                    </div>
                    <span className="font-medium">Mi Perfil</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md hover:bg-red-50 transition-colors text-red-600"
                  >
                    <FaSignOutAlt className="text-red-500" />
                    <span className="font-medium">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grupo derecho desktop: avatar + campanita + logout */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Avatar */}
          <button
            onClick={() => navigate("/profile")}
            title="Perfil"
            className="transition duration-200"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold cursor-pointer ${
                esActivo({ path: "/profile", label: "Perfil" })
                  ? "border-2 border-black bg-teal-600 text-white"
                  : "bg-teal-600 text-white hover:bg-teal-700 hover:text-gray-100"
              }`}
            >
              {iniciales}
            </div>
          </button>

          {/* Campanita desktop */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleAbrirNotificaciones}
              className="relative text-teal-600 hover:text-teal-800 p-2 rounded-md hover:bg-teal-100 transition-colors"
            >
              <FaBell size={20} />
              {sinLeer > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {sinLeer > 9 ? "9+" : sinLeer}
                </span>
              )}
            </button>

            {/* Panel de notificaciones desktop */}
            {mostrarNotif && (
              <div className="absolute right-0 top-12 mt-2 bg-white shadow-lg rounded-lg p-4 w-80 z-50 border border-teal-200">
                <p className="text-sm font-bold mb-3 text-teal-800">Notificaciones</p>
                {notificaciones.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-2">
                    Sin notificaciones nuevas.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notificaciones.map((n: any, i) => (
                      <div
                        key={i}
                        className="text-sm border-b border-gray-100 pb-2 text-gray-800 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
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
                        <div className="flex items-start gap-2">
                          {/* Indicador de tipo de notificación */}
                          <span className={`inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            n.tipo === 'mensaje' ? 'bg-blue-500' :
                            n.tipo === 'nota' ? 'bg-green-500' :
                            n.tipo === 'pago' ? 'bg-yellow-500' : 'bg-purple-500'
                          }`}></span>
                          <div className="flex-1">
                            <strong className="text-xs uppercase text-gray-600">{n.tipo}</strong>
                            <p className="text-gray-800 mt-1">{n.texto}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logout desktop */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
          >
            <FaSignOutAlt />
            <span className="hidden lg:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </nav>
  );
  //#endregion
};

export default Navbar;
//#endregion