//#region IMPORTACIONES
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
//#endregion

//#region INTERFACES Y TYPES
interface Deudor {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullname: string;
  email: string;
  dni: number;
  carer_id: number | null;
  total_pagos_realizados: number;
}

interface DeudoresData {
  count: number | null;
  month: number;
  year: number;
  deudores: Deudor[];
  next_cursor: number | null;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
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

//#region COMPONENTE PRINCIPAL DEUDORES
export default function Deudores() {
  //#region ESTADOS Y HOOKS
  const [deudores, setDeudores] = useState<Deudor[]>([]);
  const [deudoresFiltrados, setDeudoresFiltrados] = useState<Deudor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error" | "info" | "warning"; text: string } | null>(null);
  const [exportando, setExportando] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [mesActual, setMesActual] = useState<number>(0);
  const [anioActual, setAnioActual] = useState<number>(0);
  const [buscando, setBuscando] = useState(false);
  const navigate = useNavigate();
  //#endregion

  //#region TOAS
  const showToast = (text: string, type: "success" | "error" | "info" | "warning") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };
  //#endregion

  //#region FUNCIONES DE DATOS
  /**
   * Obtiene la lista de deudores desde la API
   */
  const fetchDeudores = async (reload = false) => {
    setLoading(true);
    try {
      const url = new URL("https://proyectofinal-backend-1-uqej.onrender.com/payment/pending");
      url.searchParams.append("limit", "10");
      
      if (!reload && nextCursor) {
        url.searchParams.append("last_seen_id", nextCursor.toString());
      }

      const response = await fetch(url.toString());
      const data: DeudoresData = await response.json();
      
      if (reload) {
        setDeudores(data.deudores);
        setDeudoresFiltrados(data.deudores);
        setTotalCount(data.count);
        setMesActual(data.month);
        setAnioActual(data.year);
      } else {
        setDeudores(prev => [...prev, ...data.deudores]);
        if (searchTerm.trim() === "") {
          setDeudoresFiltrados(prev => [...prev, ...data.deudores]);
        }
      }
      
      setNextCursor(data.next_cursor);
    } catch (error) {
      console.error("Error al cargar deudores:", error);
      showToast("❌ Error al cargar la lista de deudores", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca deudores según el término ingresado
   */
  const buscarDeudores = async (query: string) => {
    if (!query.trim()) {
      setDeudoresFiltrados(deudores);
      setBuscando(false);
      return;
    }

    setLoading(true);
    try {
      const url = new URL("https://proyectofinal-backend-1-uqej.onrender.com/payment/pending/search");
      url.searchParams.append("q", query);
      url.searchParams.append("limit", "100");

      const response = await fetch(url.toString());
      const data = await response.json();
      
      setDeudoresFiltrados(data.deudores || []);
      setBuscando(false);
    } catch (error) {
      console.error("Error al buscar deudores:", error);
      showToast("❌ Error al buscar deudores", "error");
      setBuscando(false);
    } finally {
      setLoading(false);
    }
  };
  //#endregion

  //#region FUNCIONES DE INTERACCIÓN
  /**
   * Maneja el registro de pago para un deudor
   */
  const handleRegistrarPago = (deudor: Deudor) => {
    console.log("Registrar pago para:", deudor);
    navigate("/pagos", { state: { userId: deudor.id, userName: deudor.fullname, carerId: deudor.carer_id } });
  };

  /**
   * Maneja la navegación de vuelta a la vista de pagos
   */
  const handleVolver = () => {
    console.log("Volver a vista pagos");
    navigate("/vistaPagos");
  };

  /**
   * Exporta la lista de deudores a formato CSV
   */
  const exportarCSV = () => {
    setExportando(true);
    try {
      const headers = ["DNI", "Nombre Completo", "Usuario", "Email", "Pagos Realizados"];
      const rows = deudoresFiltrados.map(d => [
        d.dni,
        d.fullname,
        d.username,
        d.email,
        d.total_pagos_realizados
      ]);

      let csvContent = headers.join(",") + "\n";
      rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `deudores_${MESES[mesActual - 1]}_${anioActual}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast("✅ CSV exportado exitosamente", "success");
    } catch (error) {
      console.error("Error al exportar:", error);
      showToast("❌ Error al exportar CSV", "error");
    } finally {
      setExportando(false);
    }
  };
  //#endregion

  //#region EFFECTS Y LIFECYCLE
  // Effect para cargar datos iniciales
  useEffect(() => {
    fetchDeudores(true);
  }, []);

  // Effect para infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !loading &&
        nextCursor !== null &&
        searchTerm.trim() === ""
      ) {
        fetchDeudores(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, nextCursor, searchTerm]);

  // Effect para búsqueda con debounce
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setDeudoresFiltrados(deudores);
      setBuscando(false);
      return;
    }

    setBuscando(true);
    const timeoutId = setTimeout(() => {
      buscarDeudores(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, deudores]);
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
        <div className="py-6">
          {/* Header y Controles */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleVolver}
                  className="text-teal-600 hover:text-teal-700 transition-colors"
                  title="Volver a Pagos"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-teal-700 flex items-center gap-2">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Estudiantes Deudores
                </h2>
              </div>
              {mesActual > 0 && (
                <p className="text-sm text-gray-600 mt-2 ml-9">
                  {MESES[mesActual - 1]} {anioActual} • {totalCount !== null ? `${totalCount} estudiante${totalCount !== 1 ? 's' : ''} pendiente${totalCount !== 1 ? 's' : ''}` : 'Cargando...'}
                </p>
              )}
            </div>
            
            {/* Botón de exportación */}
            <button
              onClick={exportarCSV}
              disabled={exportando || deudoresFiltrados.length === 0}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md shadow text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {exportando ? "Exportando..." : "Exportar CSV"}
            </button>
          </div>

          {/* Barra de Búsqueda */}
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Buscar por nombre, usuario, email, DNI o carrera..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm sm:text-base"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <p className="text-xs text-gray-500 mt-1 ml-12">
                {buscando ? "Buscando..." : `Buscando en todos los deudores`}
              </p>
            )}
          </div>

          {/* Estados de carga y resultados */}
          {/* Loading inicial */}
          {loading && deudores.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
              <p className="text-gray-500 mt-4">Cargando deudores...</p>
            </div>
          )}

          {/* Sin resultados sin búsqueda */}
          {!loading && deudores.length === 0 && !searchTerm && (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">¡Todos al día!</h3>
              <p className="text-gray-500">No hay estudiantes deudores este mes</p>
            </div>
          )}

          {/* Sin resultados de búsqueda */}
          {!loading && deudoresFiltrados.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No se encontraron resultados</h3>
              <p className="text-gray-500">Intenta con otro término de búsqueda</p>
            </div>
          )}

          {/* Vista de Escritorio - Tabla */}
          {deudoresFiltrados.length > 0 && (
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-md">
                <thead className="bg-teal-100 text-teal-800">
                  <tr>
                    <th className="py-2 px-4 text-left">DNI</th>
                    <th className="py-2 px-4 text-left">Nombre Completo</th>
                    <th className="py-2 px-4 text-left">Usuario</th>
                    <th className="py-2 px-4 text-left">Email</th>
                    <th className="py-2 px-4 text-left">Pagos Realizados</th>
                    <th className="py-2 px-4 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {deudoresFiltrados.map((deudor, index) => (
                    <motion.tr
                      key={`${deudor.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="py-2 px-4">{deudor.dni}</td>
                      <td className="py-2 px-4 font-medium">{deudor.fullname}</td>
                      <td className="py-2 px-4">@{deudor.username}</td>
                      <td className="py-2 px-4 text-sm">{deudor.email}</td>
                      <td className="py-2 px-4 text-center">{deudor.total_pagos_realizados}</td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => handleRegistrarPago(deudor)}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Registrar Pago
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Vista Móvil - Cards */}
          {deudoresFiltrados.length > 0 && (
            <div className="block lg:hidden space-y-4">
              {deudoresFiltrados.map((deudor, index) => (
                <motion.div
                  key={`${deudor.id}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-500 p-4 rounded-lg shadow-sm"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {deudor.firstName.charAt(0)}{deudor.lastName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {deudor.fullname}
                      </h3>
                      <p className="text-sm text-gray-600">@{deudor.username}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">DNI:</span>
                      <span className="text-gray-600">{deudor.dni}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Email:</span>
                      <span className="text-gray-600 truncate ml-2">{deudor.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Pagos realizados:</span>
                      <span className="text-gray-600">{deudor.total_pagos_realizados}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRegistrarPago(deudor)}
                    className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Registrar Pago
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Loading de más resultados */}
          {loading && deudores.length > 0 && !searchTerm && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              <p className="text-gray-500 ml-3">Cargando más deudores...</p>
            </div>
          )}

          {/* Información del pie */}
          {deudoresFiltrados.length > 0 && (
            <div className="mt-6 pt-4 border-t text-center text-sm text-gray-600">
              Mostrando {deudoresFiltrados.length} de {searchTerm ? deudoresFiltrados.length : (totalCount !== null ? totalCount : deudores.length)} deudores
              {nextCursor && searchTerm === "" && (
                <span className="block mt-1 text-teal-600">
                  Sigue scrolleando para cargar más...
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
  //#endregion
}
//#endregion