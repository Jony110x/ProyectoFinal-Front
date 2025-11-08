//#region IMPORTACIONES
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/LogoPNGtransparente.png";
import {
  FaMoneyBillWave,
  FaEnvelope,
  FaBook,
  FaUserPlus,
} from "react-icons/fa";
import { motion } from "framer-motion";
//#endregion

//#region COMPONENTE TOAST
const Toast = ({ message, type }: { message: string; type: "success" | "error" | "info" | "warning" }) => {
  return (
    <motion.div
      className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-medium ${
        type === "success" 
          ? "bg-green-500 text-white" 
          : type === "error"
          ? "bg-red-500 text-white"
          : type === "warning"
          ? "bg-yellow-500 text-white"
          : "bg-blue-500 text-white"
      }`}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
    >
      {message}
    </motion.div>
  );
};
//#endregion

//#region COMPONENTE PRINCIPAL DASHBOARD
function Dashboard() {
  //#region ESTADOS Y HOOKS
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { firstName, lastName, type, username, id } = user;

  const [pagosRecientes, setPagosRecientes] = useState([]);
  const [mensajesRecientes, setMensajesRecientes] = useState([]);
  const [usuariosRecientes, setUsuariosRecientes] = useState([]);
  const [carrerasRecientes, setCarrerasRecientes] = useState([]);
  const [noPagaron, setNoPagaron] = useState([]);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info" | "warning"; text: string } | null>(null);
  //#endregion

  //#region FUNCIONES DE UTILIDAD
  /**
   * Muestra un mensaje toast de notificación
   */
  const showToast = (text: string, type: "success" | "error" | "info" | "warning") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 1000);
  };

  /**
   * Maneja la navegación a diferentes secciones
   */
  const handleNavigation = (path: string, section: string) => {
    console.log("redirigue ---> ", section)
    setTimeout(() => {
      navigate(path);
    }, 300);
  };
  //#endregion

  //#region FUNCIONES DE DATOS
  /**
   * Carga los datos básicos del dashboard según el tipo de usuario
   */
  const cargarDatos = async () => {
    try {
      const [pagosRes, mensajesRes] = await Promise.all([
        axios.get(`https://proyectofinal-backend-1-uqej.onrender.com/payment/user/${username}`),
        axios.get(`https://proyectofinal-backend-1-uqej.onrender.com/messages/${id}`),
      ]);

      setPagosRecientes(pagosRes.data.slice(0, 2));
      setMensajesRecientes(mensajesRes.data.slice(0, 2));
      
    } catch (error) {
      console.error("Error cargando datos básicos:", error);
      showToast("❌ Error al cargar datos del dashboard", "error");
    }
  };

  /**
   * Carga datos específicos para usuarios administradores
   */
  const cargarAdminData = async () => {
    try {
      const [usuarios, carreras, sinPagos] = await Promise.all([
        axios.get("https://proyectofinal-backend-1-uqej.onrender.com/users/alls"),
        axios.get("https://proyectofinal-backend-1-uqej.onrender.com/carer/all"),
        axios.get("https://proyectofinal-backend-1-uqej.onrender.com/payment/pending"),
      ]);

      setUsuariosRecientes(usuarios.data.slice(-3));
      setCarrerasRecientes(carreras.data.slice(-3));
      setNoPagaron(sinPagos.data);
      
    } catch (error) {
      console.error("Error cargando datos admin:", error);
      showToast("❌ Error al cargar datos de administración", "error");
    }
  };
  //#endregion

  //#region EFFECTS Y LIFECYCLE
  /**
   * Carga los datos del dashboard al montar el componente
   */
  useEffect(() => {
    cargarDatos();
    if (type === "admin") {
      cargarAdminData();
    }
  }, [username, id, type]);
  //#endregion

  //#region RENDER 
  return (
    <>
      {/* Notificaciones Toast */}
      {toast && <Toast message={toast.text} type={toast.type} />}
      
      <motion.div
        className="min-h-screen bg-gradient-to-r from-teal-100 to-white w-full"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="w-full px-4 sm:px-6 py-4 sm:py-8">
          {/* Sección de bienvenida */}
          <div className="text-center mb-6 sm:mb-10">
            <img
              src={logo}
              alt="Logo universidad"
              className="h-24 sm:h-32 mx-auto mb-2 object-contain"
            />
            <h1 className="text-xl sm:text-3xl font-bold text-teal-800">
              Bienvenido/a, {firstName} {lastName}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mt-2 capitalize">Rol: {type}</p>
          </div>

          {/* Panel de accesos rápidos */}
          <div className="w-full flex justify-center">
            <div
              className="flex flex-wrap justify-center gap-4 sm:gap-6"
              style={{ maxWidth: "1000px" }}
            >
              {/* Tarjetas para estudiantes */}
              {type === "estudiante" && (
                <>
                  <div
                    onClick={() => handleNavigation("/vistaPagos", "Pagos")}
                    className="bg-white shadow-xl rounded-xl w-full sm:w-64 px-4 py-3 flex flex-col items-center justify-center hover:bg-teal-50 cursor-pointer transition"
                  >
                    <FaMoneyBillWave size={32} className="text-teal-600 mb-2" />
                    <h3 className="text-base sm:text-lg font-semibold text-teal-800 mb-1">
                      Pagos recientes
                    </h3>
                    {pagosRecientes.length > 0 ? (
                      pagosRecientes.map((p: any, i) => (
                        <p key={i} className="text-xs sm:text-sm text-gray-700 text-center">
                          💰 ${p.amount} - {p.affected_month.slice(0, 10)}
                        </p>
                      ))
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-500 text-center">
                        No hay pagos recientes
                      </p>
                    )}
                  </div>

                  <div
                    onClick={() => handleNavigation("/mensajes", "Mensajes")}
                    className="bg-white shadow-xl rounded-xl w-full sm:w-64 px-4 py-3 flex flex-col items-center justify-center hover:bg-teal-50 cursor-pointer transition"
                  >
                    <FaEnvelope size={32} className="text-teal-600 mb-2" />
                    <h3 className="text-base sm:text-lg font-semibold text-teal-800 mb-1">
                      Mensajes
                    </h3>
                    {mensajesRecientes.length > 0 ? (
                      mensajesRecientes.map((m: any, i) => (
                        <p key={i} className="text-xs sm:text-sm text-gray-700 text-center">
                          💬 {m.sender_name}: {m.content.slice(0, 30)}...
                        </p>
                      ))
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-500 text-center">
                        No hay mensajes nuevos
                      </p>
                    )}
                  </div>

                  <div
                    onClick={() => handleNavigation("/career", "Materias")}
                    className="bg-white shadow-xl rounded-xl w-full sm:w-64 px-4 py-3 flex flex-col items-center justify-center hover:bg-teal-50 cursor-pointer transition"
                  >
                    <FaBook size={32} className="text-teal-600 mb-2" />
                    <h3 className="text-base sm:text-lg font-semibold text-teal-800 mb-1">
                      Materias
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700 text-center">
                      Ver materias o inscribirse a nuevas carreras.
                    </p>
                  </div>
                </>
              )}

              {/* Tarjetas para profesores */}
              {type === "profesor" && (
                <>
                  <div
                    onClick={() => handleNavigation("/mensajes", "Mensajes")}
                    className="bg-white shadow-xl rounded-xl w-full sm:w-64 px-4 py-3 flex flex-col items-center justify-center hover:bg-teal-50 cursor-pointer transition"
                  >
                    <FaEnvelope size={32} className="text-teal-600 mb-2" />
                    <h3 className="text-base sm:text-lg font-semibold text-teal-800 mb-1">
                      Mensajes
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700 text-center">
                      Accedé a tus conversaciones y respondé consultas.
                    </p>
                  </div>

                  <div
                    onClick={() => handleNavigation("/users/:userId/materias", "Materias")}
                    className="bg-white shadow-xl rounded-xl w-full sm:w-64 px-4 py-3 flex flex-col items-center justify-center hover:bg-teal-50 cursor-pointer transition"
                  >
                    <FaBook size={32} className="text-teal-600 mb-2" />
                    <h3 className="text-base sm:text-lg font-semibold text-teal-800 mb-1">
                      Materias
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700 text-center">
                      Gestioná tus materias y colocá notas.
                    </p>
                  </div>
                </>
              )}

              {/* Tarjetas para administradores */}
              {type === "admin" && (
                <>
                  <div
                    onClick={() => handleNavigation("/mensajes", "Mensajes")}
                    className="bg-white shadow-xl rounded-xl w-full sm:w-64 px-4 py-3 flex flex-col items-center justify-center hover:bg-teal-50 cursor-pointer transition"
                  >
                    <FaEnvelope size={32} className="text-teal-600 mb-2" />
                    <h3 className="text-base sm:text-lg font-semibold text-teal-800 mb-1">
                      Mensajes
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700 text-center">
                      Visualizá y respondé los mensajes recibidos.
                    </p>
                  </div>

                  <div
                    onClick={() => handleNavigation("/pagos", "Pagos")}
                    className="bg-white shadow-xl rounded-xl w-full sm:w-64 px-4 py-3 flex flex-col items-center justify-center hover:bg-teal-50 cursor-pointer transition"
                  >
                    <FaMoneyBillWave size={32} className="text-teal-600 mb-2" />
                    <h3 className="text-base sm:text-lg font-semibold text-teal-800 mb-1">
                      Realizar Pagos
                    </h3>
                    {noPagaron.length === 0 ? (
                      <p className="text-xs sm:text-sm text-gray-500 text-center">Todos al día este mes</p>
                    ) : (
                      noPagaron.slice(0, 3).map((p: any, i) => (
                        <p key={i} className="text-xs sm:text-sm text-red-600 text-center">
                          {p.fullname}
                        </p>
                      ))
                    )}
                  </div>

                  <div
                    onClick={() => handleNavigation("/career", "Carreras")}
                    className="bg-white shadow-xl rounded-xl w-full sm:w-64 px-4 py-3 flex flex-col items-center justify-center hover:bg-teal-50 cursor-pointer transition"
                  >
                    <FaBook size={32} className="text-teal-600 mb-2" />
                    <h3 className="text-base sm:text-lg font-semibold text-teal-800 mb-1">
                      Carreras recientes
                    </h3>
                    {carrerasRecientes.length === 0 ? (
                      <p className="text-xs sm:text-sm text-gray-500 text-center">Sin novedades</p>
                    ) : (
                      carrerasRecientes.slice(0, 3).map((c: any, i) => (
                        <p key={i} className="text-xs sm:text-sm text-gray-700 text-center">
                          📚 {c.name}
                        </p>
                      ))
                    )}
                  </div>

                  <div
                    onClick={() => handleNavigation("/registro", "Registro")}
                    className="bg-white shadow-xl rounded-xl w-full sm:w-64 px-4 py-3 flex flex-col items-center justify-center hover:bg-teal-50 cursor-pointer transition"
                  >
                    <FaUserPlus size={32} className="text-teal-600 mb-2" />
                    <h3 className="text-base sm:text-lg font-semibold text-teal-800 mb-1">
                      Usuarios nuevos
                    </h3>
                    {usuariosRecientes.length === 0 ? (
                      <p className="text-xs sm:text-sm text-gray-500 text-center">Sin registros nuevos</p>
                    ) : (
                      usuariosRecientes.slice(0, 3).map((u: any, i) => (
                        <p key={i} className="text-xs sm:text-sm text-gray-700 text-center">
                          👤 {u.firstName} {u.lastName}
                        </p>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
  //#endregion
}
export default Dashboard;
//#endregion