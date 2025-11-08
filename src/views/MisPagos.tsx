//#region IMPORTACIONES
import { useEffect, useState } from "react";
import VistaPagos from "../views/VistaPagos";
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

//#region COMPONENTE PRINCIPAL MISPAGOS
export default function MisPagos() {
  //#region ESTADOS Y HOOKS
  const [toast, setToast] = useState<{ type: "success" | "error" | "info" | "warning"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  //#endregion

  //#region TOAST
  const showToast = (text: string, type: "success" | "error" | "info" | "warning") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 1000);
  };
  //#endregion

  //#region EFFECTS Y LIFECYCLE
  /**
   * Valida los datos del usuario al montar el componente
   */
  useEffect(() => {
    const userRaw = localStorage.getItem("user");

    if (!userRaw) {
      showToast("❌ Error: usuario no logueado", "error");
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      
      if (!user.username) {
        showToast("❌ Error: datos de usuario incompletos", "error");
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (err) {
      showToast("❌ Error: datos corruptos en localStorage", "error");
      setLoading(false);
    }
  }, []);
  //#endregion

  //#region VALIDACIONES INICIALES
  // Verificar si el usuario está logueado
  const userRaw = localStorage.getItem("user");

  if (!userRaw) {
    return (
      <>
        {toast && <Toast message={toast.text} type={toast.type} />}
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Usuario no autenticado</h2>
            <p className="text-gray-600">Por favor, inicia sesión para ver tus pagos.</p>
          </div>
        </div>
      </>
    );
  }

  try {
    const user = JSON.parse(userRaw);
    
    // Verificar si los datos del usuario están completos
    if (!user.username) {
      return (
        <>
          {toast && <Toast message={toast.text} type={toast.type} />}
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-yellow-600 mb-2">Datos incompletos</h2>
              <p className="text-gray-600">La información de usuario está incompleta.</p>
            </div>
          </div>
        </>
      );
    }
  //#endregion

  //#region RENDER 
    return (
      <>
        {/* Notificaciones Toast */}
        {toast && <Toast message={toast.text} type={toast.type} />}
        
        {/* Estado de carga */}
        {loading ? (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="text-gray-600 mt-2">Cargando pagos...</p>
            </div>
          </div>
        ) : (
          // Vista principal de pagos
          <VistaPagos username={user.username} type={user.type} />
        )}
      </>
    );
  } catch (err) {
    // Manejo de errores en el parseo de datos
    return (
      <>
        {toast && <Toast message={toast.text} type={toast.type} />}
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Error en los datos</h2>
            <p className="text-gray-600">Los datos de usuario están corruptos.</p>
          </div>
        </div>
      </>
    );
  }
  //#endregion
}
//#endregion