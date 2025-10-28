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

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { firstName, lastName, type, username, id } = user;

  const [pagosRecientes, setPagosRecientes] = useState([]);
  const [mensajesRecientes, setMensajesRecientes] = useState([]);
  const [usuariosRecientes, setUsuariosRecientes] = useState([]);
  const [carrerasRecientes, setCarrerasRecientes] = useState([]);
  const [noPagaron, setNoPagaron] = useState([]);

  useEffect(() => {
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
      }
    };

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
      }
    };

    cargarDatos();
    if (type === "admin") cargarAdminData();
  }, [username, id, type]);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-r from-teal-100 to-white w-full"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="w-full px-4 sm:px-6 py-4 sm:py-8">
        {/* Bienvenida */}
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

        {/* Accesos rápidos */}
        <div className="w-full flex justify-center">
          <div
            className="flex flex-wrap justify-center gap-4 sm:gap-6"
            style={{ maxWidth: "1000px" }}
          >
            {type === "estudiante" && (
              <>
                <div
                  onClick={() => navigate("/vistaPagos")}
                  className="bg-white shadow-xl rounded-xl w-full sm:w-64 px-4 py-3 flex flex-col items-center justify-center hover:bg-teal-50 cursor-pointer transition"
                >
                  <FaMoneyBillWave size={32} className="text-teal-600 mb-2" />
                  <h3 className="text-base sm:text-lg font-semibold text-teal-800 mb-1">
                    Pagos recientes
                  </h3>
                  {pagosRecientes.map((p: any, i) => (
                    <p key={i} className="text-xs sm:text-sm text-gray-700 text-center">
                      💰 ${p.amount} - {p.affected_month.slice(0, 10)}
                    </p>
                  ))}
                </div>

                <div
                  onClick={() => navigate("/mensajes")}
                  className="bg-white shadow-xl rounded-xl w-full sm:w-64 px-4 py-3 flex flex-col items-center justify-center hover:bg-teal-50 cursor-pointer transition"
                >
                  <FaEnvelope size={32} className="text-teal-600 mb-2" />
                  <h3 className="text-base sm:text-lg font-semibold text-teal-800 mb-1">
                    Mensajes
                  </h3>
                  {mensajesRecientes.map((m: any, i) => (
                    <p key={i} className="text-xs sm:text-sm text-gray-700 text-center">
                      💬 {m.sender_name}: {m.content.slice(0, 30)}...
                    </p>
                  ))}
                </div>

                <div
                  onClick={() => navigate("/career")}
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

            {type === "profesor" && (
              <>
                <div
                  onClick={() => navigate("/mensajes")}
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
                  onClick={() => navigate("/users/:userId/materias")}
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

            {type === "admin" && (
              <>
                <div
                  onClick={() => navigate("/mensajes")}
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
                  onClick={() => navigate("/pagos")}
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
                  onClick={() => navigate("/career")}
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
                  onClick={() => navigate("/registro")}
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
  );
}

export default Dashboard;