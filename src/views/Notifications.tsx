//#region IMPORTACIONES
import { useEffect, useState } from "react";
import axios from "axios";
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

//#region COMPONENTE PRINCIPAL NOTIFICATIONS
function Notifications() {
  //#region ESTADOS Y HOOKS
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [notificaciones, setNotificaciones] = useState([]);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info" | "warning"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  //#endregion

  //#region TOAS
  const showToast = (text: string, type: "success" | "error" | "info" | "warning") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 1000);
  };
  //#endregion

  //#region FUNCIONES DE DATOS
  /**
   * Obtiene las notificaciones del usuario desde la API
   */
  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://proyectofinal-backend-1-uqej.onrender.com/notifications/${user.id}`);
      setNotificaciones(res.data);
      
    } catch (err) {
      console.error("Error al cargar notificaciones", err);
      showToast("❌ Error al cargar notificaciones", "error");
    } finally {
      setLoading(false);
    }
  };
  //#endregion

  //#region EFFECTS Y LIFECYCLE
  /**
   * Carga las notificaciones al montar el componente
   */
  useEffect(() => {
    cargarNotificaciones();
  }, [user.id]);
  //#endregion

  //#region RENDER 
  return (
    <>
      {/* Notificaciones Toast */}
      {toast && <Toast message={toast.text} type={toast.type} />}
      
      <motion.div
        className="w-full px-4 sm:px-6 bg-white rounded-lg shadow"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-md">
            {/* Header de notificaciones */}
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 text-teal-700">
              Notificaciones
            </h2>
            
            {/* Estado de carga */}
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <p className="text-gray-500 mt-2">Cargando notificaciones...</p>
              </div>
            ) : 
            
            {/* Estado sin notificaciones */}
            notificaciones.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500">No hay notificaciones.</p>
                <p className="text-gray-400 text-sm mt-2">Cuando tengas notificaciones, aparecerán aquí.</p>
              </div>
            ) : 
            
            {/* Lista de notificaciones */}
            (
              <ul className="space-y-3 text-gray-800 text-sm">
                {notificaciones.map((n: any, i) => (
                  <li 
                    key={i} 
                    className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icono según tipo de notificación */}
                      <div className="flex-shrink-0">
                        {n.tipo === 'pago' && <div className="text-2xl">💰</div>}
                        {n.tipo === 'mensaje' && <div className="text-2xl">💬</div>}
                        {n.tipo === 'academico' && <div className="text-2xl">📚</div>}
                        {!['pago', 'mensaje', 'academico'].includes(n.tipo) && <div className="text-2xl">🔔</div>}
                      </div>
                      
                      {/* Contenido de la notificación */}
                      <div className="flex-1">
                        <strong className="block text-teal-700 capitalize text-base">
                          {n.tipo}
                        </strong>
                        <p className="text-gray-700 mt-1">{n.texto}</p>
                        <div className="text-gray-500 text-xs mt-2">
                          {new Date(n.fecha).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            {/* Contador de notificaciones */}
            {notificaciones.length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Mostrando {notificaciones.length} notificación{notificaciones.length !== 1 ? 'es' : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
  //#endregion
}
export default Notifications;
//#endregion