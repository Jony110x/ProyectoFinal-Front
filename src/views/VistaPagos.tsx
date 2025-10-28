import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type Props = {
  username: string;
  type?: string;
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

export default function VistaPagos({ username, type = "estudiante" }: Props) {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [pagosFiltrados, setPagosFiltrados] = useState<Pago[]>([]);
  const [carers, setCarers] = useState<Carer[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [pagoEditando, setPagoEditando] = useState<Pago | null>(null);
  const [pagoAConfirmar, setPagoAConfirmar] = useState<number | null>(null);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const isAdmin = type === "admin";
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://proyectofinal-backend-1-uqej.onrender.com/carer/all")
      .then((res) => setCarers(res.data))
      .catch((err) => console.error("Error al traer materias:", err));
  }, []);

  useEffect(() => {
    cargarPagos(true);
  }, [username, isAdmin]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
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

  const cargarPagos = async (reload = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const body: any = { limit: 10 };
      if (!reload && nextCursor) body.last_seen_id = nextCursor;
      if (!isAdmin) body.user_id = username;

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

      if (reload) setPagos(nuevosPagos);
      else setPagos((prev) => [...prev, ...nuevosPagos]);

      setNextCursor(res.data.next_cursor);
    } catch (error) {
      console.error("Error al cargar pagos paginados:", error);
      setMensaje("❌ Error al cargar pagos");
    } finally {
      setLoading(false);
    }
  };

  const buscarPagos = async (query: string) => {
    setBusqueda(query);

    if (!query.trim()) {
      setPagosFiltrados(pagos);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const params = new URLSearchParams({ q: query, limit: "50", offset: "0" });
      if (!isAdmin) params.append("user_id", username);

      const res = await axios.get(`https://proyectofinal-backend-1-uqej.onrender.com/payment/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPagosFiltrados(res.data.payments);
    } catch (error) {
      console.error("Error al buscar pagos:", error);
      setMensaje("❌ Error al buscar pagos");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pagoEditando) return;
    try {
      await axios.put(`https://proyectofinal-backend-1-uqej.onrender.com/payment/${pagoEditando.id}`, {
        carer_id: pagoEditando.carer_id,
        amount: pagoEditando.amount,
        affected_month: pagoEditando.affected_month,
      });
      setMensaje("✅ Pago actualizado correctamente");
      setPagoEditando(null);
      cargarPagos(true);
    } catch {
      setMensaje("❌ Error al actualizar el pago");
    }
  };

  const handleEliminarPago = async (id: number) => {
    try {
      await axios.delete(`https://proyectofinal-backend-1-uqej.onrender.com/payment/${id}`);
      setPagos((prev) => prev.filter((p) => p.id !== id));
      setMensaje("✅ Pago eliminado correctamente");
    } catch {
      setMensaje("❌ Error al eliminar el pago");
    } finally {
      setPagoAConfirmar(null);
    }
  };

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  useEffect(() => {
    if (!busqueda.trim()) setPagosFiltrados(pagos);
  }, [pagos, busqueda]);

  return (
    <motion.div
      className="w-full px-4 sm:px-6 bg-white rounded-lg shadow"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-teal-700">
            {isAdmin ? "Todos los Pagos" : "Mis Pagos"}
          </h2>
          {isAdmin && (
            <button
              onClick={() => navigate("/pagos")}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md shadow text-sm sm:text-base"
            >
              + Agregar Pago
            </button>
          )}
        </div>

        {/* BARRA DE BUSQUEDA */}
        <input
          type="text"
          placeholder="Buscar pagos..."
          value={busqueda}
          onChange={(e) => buscarPagos(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm sm:text-base"
        />

        {mensaje && (
          <div className="mb-4 text-sm font-medium text-green-800 bg-green-100 p-3 rounded">
            {mensaje}
          </div>
        )}

        {pagosFiltrados.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-8">No hay pagos para mostrar.</p>
        )}

        {/* Vista de tabla para desktop */}
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
                  <tr className="border-t hover:bg-gray-50">
                    <td className="py-2 px-4">{p.id}</td>
                    {isAdmin && <td className="py-2 px-4">{p.username}</td>}
                    <td className="py-2 px-4">${p.amount}</td>
                    <td className="py-2 px-4">{p.affected_month.slice(0, 10)}</td>
                    <td className="py-2 px-4">{p.carer}</td>
                    {isAdmin && (
                      <td className="py-2 px-4 align-middle">
                        {pagoAConfirmar === p.id ? (
                          <div className="flex gap-2">
                            <div className="text-sm">¿?</div>
                            <button
                              onClick={() => handleEliminarPago(p.id)}
                              className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 transition"
                            >
                              Si
                            </button>
                            <button
                              onClick={() => setPagoAConfirmar(null)}
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

                  {/* Formulario edición inline */}
                  {pagoEditando?.id === p.id && (
                    <tr className="bg-gray-100">
                      <td colSpan={isAdmin ? 6 : 5} className="p-4">
                        <form onSubmit={handleGuardarPago} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm mb-1">Monto</label>
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
                              <label className="block text-sm mb-1">Mes Afectado</label>
                              <input
                                type="date"
                                value={pagoEditando.affected_month.slice(0, 10)}
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
                              <label className="block text-sm mb-1">Materia</label>
                              <select
                                value={pagoEditando.carer_id}
                                onChange={(e) =>
                                  setPagoEditando({
                                    ...pagoEditando,
                                    carer_id: parseInt(e.target.value),
                                    carer:
                                      carers.find(
                                        (c) => c.id === parseInt(e.target.value)
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
                              onClick={() => setPagoEditando(null)}
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

        {/* Vista de cards para móvil */}
        <div className="block lg:hidden space-y-4">
          {pagosFiltrados.map((p, index) => (
            <div key={`${p.id}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
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
                
                {isAdmin && (
                  <div className="pt-3 border-t mt-2">
                    {pagoAConfirmar === p.id ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700 text-center">¿Eliminar pago?</p>
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEliminarPago(p.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setPagoAConfirmar(null)}
                            className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 text-sm"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : pagoEditando?.id === p.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs mb-1">Monto</label>
                            <input
                              type="number"
                              value={pagoEditando.amount}
                              onChange={(e) =>
                                setPagoEditando({
                                  ...pagoEditando,
                                  amount: parseInt(e.target.value),
                                })
                              }
                              className="w-full border px-2 py-1 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs mb-1">Mes</label>
                            <input
                              type="date"
                              value={pagoEditando.affected_month.slice(0, 10)}
                              onChange={(e) =>
                                setPagoEditando({
                                  ...pagoEditando,
                                  affected_month: e.target.value,
                                })
                              }
                              className="w-full border px-2 py-1 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs mb-1">Materia</label>
                            <select
                              value={pagoEditando.carer_id}
                              onChange={(e) =>
                                setPagoEditando({
                                  ...pagoEditando,
                                  carer_id: parseInt(e.target.value),
                                  carer:
                                    carers.find(
                                      (c) => c.id === parseInt(e.target.value)
                                    )?.name || "",
                                })
                              }
                              className="w-full border px-2 py-1 rounded text-sm"
                            >
                              {carers.map((carer) => (
                                <option key={carer.id} value={carer.id}>
                                  {carer.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleGuardarPago}
                            className="flex-1 bg-teal-600 text-white px-3 py-2 rounded hover:bg-teal-700 text-sm"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setPagoEditando(null)}
                            className="flex-1 bg-gray-400 text-white px-3 py-2 rounded hover:bg-gray-500 text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPagoEditando(p)}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setPagoAConfirmar(p.id)}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
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

        {loading && (
          <p className="text-center mt-4 text-gray-600">Cargando pagos...</p>
        )}
      </div>
    </motion.div>
  );
}