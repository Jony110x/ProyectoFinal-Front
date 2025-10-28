import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function Notifications() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    axios
      .get(`https://proyectofinal-backend-1-uqej.onrender.com/notifications/${user.id}`)
      .then((res) => setNotificaciones(res.data))
      .catch((err) => console.error("Error al cargar notificaciones", err));
  }, [user.id]);

  return (
    <motion.div
      className="w-full px-4 sm:px-6 bg-white rounded-lg shadow"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 text-teal-700">
            Notificaciones
          </h2>
          {notificaciones.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay notificaciones.</p>
          ) : (
            <ul className="space-y-3 text-gray-800 text-sm">
              {notificaciones.map((n: any, i) => (
                <li key={i} className="bg-gray-100 p-3 rounded shadow-sm">
                  <strong className="block text-teal-700 capitalize">
                    {n.tipo}
                  </strong>
                  {n.texto}
                  <div className="text-gray-500 text-xs mt-1">
                    {new Date(n.fecha).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default Notifications;
