//#region IMPORTACIONES
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
//#endregion

//#region INTERFACES Y TYPES
interface Carer {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  type: string;
}
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

//#region COMPONENTE PRINCIPAL CREATEPAYMENTFORM
export default function CreatePaymentForm() {
  //#region ESTADOS Y HOOKS
  const [carers, setCarers] = useState<Carer[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [form, setForm] = useState({
    user_id: "",
    carer_id: "",
    amount: "",
    affected_month: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error" | "info" | "warning"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  //#endregion

  //#region TOAS
  const showToast = (text: string, type: "success" | "error" | "info" | "warning") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 1000);
  };
  //#endregion

  //#region FUNCIONES DE DATOS
  /**
   * Busca estudiantes según el término ingresado
   */
  const searchStudents = async (term: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://proyectofinal-backend-1-uqej.onrender.com/users/search-by-type",
        {
          params: { q: term, user_type: "estudiante", limit: 20, offset: 0 },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res.data);
      setStudents(res.data.users || res.data);
      
    } catch (error) {
      console.error("Error buscando estudiantes:", error);
      showToast("❌ Error al buscar estudiantes", "error");
    }
  };
  //#endregion

  //#region MANEJADORES DE FORMULARIO
  /**
   * Maneja los cambios en los campos del formulario
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Maneja el envío del formulario de creación de pago
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validaciones del formulario
    if (!form.user_id) {
      showToast("⚠️ Selecciona un estudiante", "warning");
      setLoading(false);
      return;
    }

    if (!form.carer_id) {
      showToast("⚠️ Selecciona una carrera", "warning");
      setLoading(false);
      return;
    }

    if (!form.amount || parseInt(form.amount) <= 0) {
      showToast("⚠️ Ingresa un monto válido", "warning");
      setLoading(false);
      return;
    }

    if (!form.affected_month) {
      showToast("⚠️ Selecciona un mes afectado", "warning");
      setLoading(false);
      return;
    }

    try {
      await axios.post("https://proyectofinal-backend-1-uqej.onrender.com/payment/new", {
        ...form,
        user_id: parseInt(form.user_id),
        carer_id: parseInt(form.carer_id),
        amount: parseInt(form.amount),
        affected_month: form.affected_month,
      });

      showToast("✅ Pago creado con éxito", "success");
      
      setTimeout(() => {
        navigate("/vistaPagos");
      }, 1000);
    } catch (error) {
      console.error("Error creando pago:", error);
      showToast("❌ Error al crear el pago", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la selección de un estudiante del listado
   */
  const handleStudentSelect = (student: User) => {
    setForm({ ...form, user_id: student.id.toString() });
    setSearchTerm(`${student.firstName} ${student.lastName}`);
    setStudents([]);
  };

  /**
   * Limpia la búsqueda de estudiantes
   */
  const clearStudentSearch = () => {
    setSearchTerm("");
    setStudents([]);
    setForm({ ...form, user_id: "" });
  };

  /**
   * Maneja la cancelación y navegación de vuelta
   */
  const handleCancel = () => {
    setTimeout(() => {
      navigate("/vistaPagos");
    }, 300);
  };
  //#endregion

  //#region EFFECTS Y LIFECYCLE
  // Effect para cargar carreras al inicio
  useEffect(() => {
    axios.get("https://proyectofinal-backend-1-uqej.onrender.com/carer/all")
      .then((res) => {
        setCarers(res.data);
      })
      .catch((err) => {
        console.error("Error al cargar carreras:", err);
        showToast("❌ Error al cargar carreras", "error");
      });
  }, []);

  // Effect para búsqueda de estudiantes con debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchTerm) searchStudents(searchTerm);
    }, 300); // debounce de 300ms

    return () => clearTimeout(timeout);
  }, [searchTerm]);
  //#endregion

  //#region RENDER 
  return (
    <>
      {/* Notificaciones Toast */}
      {toast && <Toast message={toast.text} type={toast.type} />}
      
      <motion.div
        className="max-w-2xl mx-auto p-0 bg-white rounded-lg shadow mt-0"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="max-w-md mx-auto mt-10 bg-white shadow-md p-6 rounded-lg">
          {/* Header del formulario */}
          <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">Crear Nuevo Pago</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo de búsqueda de estudiantes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante:</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar alumno..."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearStudentSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                )}
              </div>
              {/* Lista de resultados de búsqueda */}
              {students.length > 0 && (
                <ul className="border mt-1 max-h-40 overflow-y-auto rounded-md">
                  {students.map((s) => (
                    <li
                      key={s.id}
                      onClick={() => handleStudentSelect(s)}
                      className="p-2 hover:bg-teal-100 cursor-pointer"
                    >
                      {s.firstName} {s.lastName}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Selección de carrera */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carrera:</label>
              <select
                name="carer_id"
                value={form.carer_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="">Seleccionar carrera</option>
                {carers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo de monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto:</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Campo de mes afectado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mes afectado:</label>
              <input
                type="date"
                name="affected_month"
                value={form.affected_month}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md shadow ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creando..." : "Crear Pago"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-400 hover:bg-gray-600 text-white px-4 py-2 rounded-md shadow"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
  //#endregion
}
//#endregion