/* eslint-disable @typescript-eslint/no-explicit-any */
//#region IMPORTACIONES
import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DeudoresButton from "./DeudoresButton";
//#endregion

//#region TIPOS E INTERFACES
type Props = {
  type?: string;
  username?: string;
};

interface Pago {
  id: number;
  amount: number;
  affected_month: string;
  carer: string;
  carer_id: number;
  username?: string;
}

interface Carer {
  id: number;
  name: string;
}
//#endregion

//#region COMPONENTE TOAST
const Toast = ({
  message,
  type,
}: {
  message: string;
  type: "success" | "error" | "info" | "warning";
}) => {
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

//#region COMPONENTE PRINCIPAL VISTAPAGOS
export default function VistaPagos({ type = "estudiante", username }: Props) {
  //#region ESTADOS Y HOOKS
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [pagosFiltrados, setPagosFiltrados] = useState<Pago[]>([]);
  const [carers, setCarers] = useState<Carer[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info" | "warning";
    text: string;
  } | null>(null);
  const [pagoEditando, setPagoEditando] = useState<Pago | null>(null);
  const [pagoAConfirmar, setPagoAConfirmar] = useState<number | null>(null);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  // Obtener datos del usuario desde localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;
  const userType = user.type || type;
  const userUsername = username || user.username;

  const isAdmin = userType === "admin";
  const navigate = useNavigate();
  //#endregion

  //#region TOAS
  const showToast = (
    text: string,
    type: "success" | "error" | "info" | "warning"
  ) => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 1000);
  };
  //#endregion

  //#region FUNCIONES DE DATOS
  /**
   * Carga los pagos desde la API con soporte para scroll infinito
   */
  const cargarPagos = async (reload = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";

      // ✅ SI ES ESTUDIANTE, USAR ENDPOINT ESPECÍFICO
      if (!isAdmin && userUsername) {
        const res = await axios.get(
          `https://proyectofinal-backend-1-uqej.onrender.com/payment/user/${userUsername}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const nuevosPagos: Pago[] = res.data.map((pago: any) => ({
          id: pago.id,
          amount: pago.amount,
          affected_month: pago.affected_month,
          carer: pago.carer,
          carer_id: pago.carer_id || 0,
          username: pago.username,
        }));

        setPagos(nuevosPagos);
        setNextCursor(null);
        return;
      }

      // ✅ SI ES ADMIN, USAR PAGINADO NORMAL
      const body: any = { limit: 10 };
      if (!reload && nextCursor) body.last_seen_id = nextCursor;

      const res = await axios.post(
        "https://proyectofinal-backend-1-uqej.onrender.com/payment/paginated",
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const nuevosPagos: Pago[] = res.data.payments;

      if (reload) {
        setPagos(nuevosPagos);
      } else {
        setPagos((prev) => [...prev, ...nuevosPagos]);
      }

      setNextCursor(res.data.next_cursor);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
      showToast("❌ Error al cargar pagos", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca pagos según el término ingresado en la barra de búsqueda
   */
  const buscarPagos = async (query: string) => {
    setBusqueda(query);

    if (!query.trim()) {
      setPagosFiltrados(pagos);
      return;
    }

    setLoading(true);
    try {
      // ✅ SI ES ESTUDIANTE, buscar solo en sus pagos cargados
      if (!isAdmin) {
        const filtrados = pagos.filter(
          (pago) =>
            pago.username?.toLowerCase().includes(query.toLowerCase()) ||
            pago.carer.toLowerCase().includes(query.toLowerCase()) ||
            pago.amount.toString().includes(query) ||
            pago.affected_month.includes(query)
        );
        setPagosFiltrados(filtrados);
        setLoading(false);
        return;
      }

      // ✅ SI ES ADMIN, usar endpoint de búsqueda
      const token = localStorage.getItem("token") || "";
      const params = new URLSearchParams({
        q: query,
        limit: "50",
        offset: "0",
      });

      const res = await axios.get(
        `https://proyectofinal-backend-1-uqej.onrender.com/payment/search?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPagosFiltrados(res.data.payments);
    } catch (error) {
      console.error("Error al buscar pagos:", error);
      showToast("❌ Error al buscar pagos", "error");
    } finally {
      setLoading(false);
    }
  };
  //#endregion

  //#region FUNCIONES DE GESTIÓN DE PAGOS
  /**
   * Guarda los cambios realizados en un pago editado
   */
  const handleGuardarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pagoEditando) return;
    try {
      await axios.put(
        `https://proyectofinal-backend-1-uqej.onrender.com/payment/${pagoEditando.id}`,
        {
          carer_id: pagoEditando.carer_id,
          amount: pagoEditando.amount,
          affected_month: pagoEditando.affected_month,
        }
      );
      showToast("✅ Pago actualizado correctamente", "success");
      setPagoEditando(null);
      cargarPagos(true);
    } catch {
      showToast("❌ Error al actualizar el pago", "error");
    }
  };

  /**
   * Elimina un pago de la base de datos
   */
  const handleEliminarPago = async (id: number) => {
    try {
      await axios.delete(
        `https://proyectofinal-backend-1-uqej.onrender.com/payment/${id}`
      );
      setPagos((prev) => prev.filter((p) => p.id !== id));
      showToast("✅ Pago eliminado correctamente", "success");
    } catch {
      showToast("❌ Error al eliminar el pago", "error");
    } finally {
      setPagoAConfirmar(null);
    }
  };

  /**
   * Cancela el modo de edición de un pago
   */
  const handleCancelarEdicion = () => {
    setPagoEditando(null);
  };

  /**
   * Cancela la confirmación de eliminación de un pago
   */
  const handleCancelarEliminacion = () => {
    setPagoAConfirmar(null);
  };

  /**
   * Navega a la página para agregar un nuevo pago
   */
  const handleNavigateToAddPago = () => {
    setTimeout(() => {
      navigate("/pagos");
    }, 300);
  };
  //#endregion

  //#region EFFECTS Y LIFECYCLE
  // Cargar lista de carreras al montar el componente
  useEffect(() => {
    axios
      .get("https://proyectofinal-backend-1-uqej.onrender.com/carer/all")
      .then((res) => setCarers(res.data))
      .catch((err) => {
        console.error("Error al traer materias:", err);
        showToast("❌ Error al cargar carreras", "error");
      });
  }, []);

  // Cargar pagos cuando cambia el usuario o tipo
  useEffect(() => {
    cargarPagos(true);
  }, [userId, isAdmin, userUsername]);

  // Configurar scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !loading &&
        nextCursor !== null &&
        busqueda.trim() === ""
      ) {
        cargarPagos(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, nextCursor, busqueda]);

  // Sincronizar pagos filtrados cuando cambian los pagos o la búsqueda
  useEffect(() => {
    if (!busqueda.trim()) setPagosFiltrados(pagos);
  }, [pagos, busqueda]);
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
            <h2 className="text-xl sm:text-2xl font-bold text-teal-700">
              {isAdmin ? "Todos los Pagos" : "Mis Pagos"}
            </h2>
            {isAdmin && (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <DeudoresButton />
                <button
                  onClick={handleNavigateToAddPago}
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md shadow text-sm sm:text-base"
                >
                  + Agregar Pago
                </button>
              </div>
            )}
          </div>

          {/* Barra de Búsqueda */}
          <input
            type="text"
            placeholder={
              isAdmin
                ? "Buscar en todos los pagos..."
                : "Buscar en mis pagos..."
            }
            value={busqueda}
            onChange={(e) => buscarPagos(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm sm:text-base"
          />

          {/* Mensaje de lista vacía */}
          {pagosFiltrados.length === 0 && !loading && (
            <p className="text-center text-gray-500 py-8">
              {isAdmin
                ? "No hay pagos para mostrar."
                : "No tienes pagos registrados."}
            </p>
          )}

          {/* Vista de Escritorio - Tabla */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-md">
              <thead className="bg-teal-100 text-teal-800">
                <tr>
                  <th className="py-2 px-4 text-left">ID</th>
                  {isAdmin && <th className="py-2 px-4 text-left">Usuario</th>}
                  <th className="py-2 px-4 text-left">Monto</th>
                  <th className="py-2 px-4 text-left">Mes</th>
                  <th className="py-2 px-4 text-left">Carrera</th>
                  {isAdmin && <th className="py-2 px-4 text-left">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {pagosFiltrados.map((p, index) => (
                  <Fragment key={`${p.id}-${index}`}>
                    {/* Fila de datos del pago */}
                    <tr className="border-t hover:bg-gray-50">
                      <td className="py-2 px-4">{p.id}</td>
                      {isAdmin && <td className="py-2 px-4">{p.username}</td>}
                      <td className="py-2 px-4">${p.amount}</td>
                      <td className="py-2 px-4">
                        {p.affected_month.slice(0, 10)}
                      </td>
                      <td className="py-2 px-4">{p.carer}</td>
                      
                      {/* Acciones para Admin */}
                      {isAdmin && (
                        <td className="py-2 px-4 align-middle">
                          {pagoAConfirmar === p.id ? (
                            <div className="flex gap-2">
                              <div className="text-sm">¿Eliminar?</div>
                              <button
                                onClick={() => handleEliminarPago(p.id)}
                                className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 transition"
                              >
                                Sí
                              </button>
                              <button
                                onClick={handleCancelarEliminacion}
                                className="bg-gray-300 text-gray-800 text-xs px-2 py-1 rounded hover:bg-gray-400 transition"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => setPagoEditando(p)}
                                className="text-blue-600 hover:underline text-sm mr-2"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => setPagoAConfirmar(p.id)}
                                className="text-red-600 hover:underline text-sm"
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>

                    {/* Formulario de Edición Inline */}
                    {pagoEditando?.id === p.id && (
                      <tr className="bg-gray-100">
                        <td colSpan={isAdmin ? 6 : 5} className="p-4">
                          <form
                            onSubmit={handleGuardarPago}
                            className="space-y-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm mb-1">
                                  Monto
                                </label>
                                <input
                                  type="number"
                                  value={pagoEditando.amount}
                                  onChange={(e) =>
                                    setPagoEditando({
                                      ...pagoEditando,
                                      amount: parseInt(e.target.value),
                                    })
                                  }
                                  className="w-full border px-3 py-2 rounded-md text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-1">
                                  Mes Afectado
                                </label>
                                <input
                                  type="date"
                                  value={pagoEditando.affected_month.slice(
                                    0,
                                    10
                                  )}
                                  onChange={(e) =>
                                    setPagoEditando({
                                      ...pagoEditando,
                                      affected_month: e.target.value,
                                    })
                                  }
                                  className="w-full border px-3 py-2 rounded-md text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-1">
                                  Materia
                                </label>
                                <select
                                  value={pagoEditando.carer_id}
                                  onChange={(e) =>
                                    setPagoEditando({
                                      ...pagoEditando,
                                      carer_id: parseInt(e.target.value),
                                      carer:
                                        carers.find(
                                          (c) =>
                                            c.id === parseInt(e.target.value)
                                        )?.name || "",
                                    })
                                  }
                                  className="w-full border px-3 py-2 rounded-md text-sm"
                                >
                                  {carers.map((carer) => (
                                    <option key={carer.id} value={carer.id}>
                                      {carer.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                              <button
                                type="submit"
                                className="w-full sm:w-auto bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 text-sm"
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelarEdicion}
                                className="w-full sm:w-auto bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 text-sm"
                              >
                                Cancelar
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista Móvil - Cards */}
          <div className="block lg:hidden space-y-4">
            {pagosFiltrados.map((p, index) => (
              <div
                key={`${p.id}-${index}`}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">ID:</span>
                    <span>{p.id}</span>
                  </div>
                  {isAdmin && (
                    <div className="flex justify-between">
                      <span className="font-semibold">Usuario:</span>
                      <span>{p.username}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-semibold">Monto:</span>
                    <span>${p.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Mes:</span>
                    <span>{p.affected_month.slice(0, 10)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Carrera:</span>
                    <span>{p.carer}</span>
                  </div>

                  {/* Acciones Móvil para Admin */}
                  {isAdmin && (
                    <div className="pt-3 border-t mt-2">
                      {pagoAConfirmar === p.id ? (
                        <div className="flex gap-2 items-center">
                          <span className="text-sm">¿Eliminar?</span>
                          <button
                            onClick={() => handleEliminarPago(p.id)}
                            className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700"
                          >
                            Sí
                          </button>
                          <button
                            onClick={handleCancelarEliminacion}
                            className="bg-gray-300 text-gray-800 text-xs px-3 py-1 rounded hover:bg-gray-400"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPagoEditando(p)}
                            className="flex-1 bg-blue-600 text-white text-sm px-3 py-2 rounded hover:bg-blue-700"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setPagoAConfirmar(p.id)}
                            className="flex-1 bg-red-600 text-white text-sm px-3 py-2 rounded hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Indicador de Carga */}
          {loading && (
            <p className="text-center mt-4 text-gray-600">Cargando pagos...</p>
          )}
        </div>
      </motion.div>
    </>
  );
  //#endregion
}
//#endregion