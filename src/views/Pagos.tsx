import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

export default function CreatePaymentForm() {
  const [carers, setCarers] = useState<Carer[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [form, setForm] = useState({
    user_id: "",
    carer_id: "",
    amount: "",
    affected_month: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<{ text: string; color: "green" | "red" } | null>(null);

  const navigate = useNavigate();

  // Cargar carreras al inicio
  useEffect(() => {
    axios.get("https://proyectofinal-backend-1-uqej.onrender.com/carer/all").then((res) => {
      setCarers(res.data);
    });
  }, []);

  // Buscar alumnos dinámicamente
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchTerm) searchStudents(searchTerm);
    }, 300); // debounce de 300ms

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const searchStudents = async (term: string) => {
  try {
    const token = localStorage.getItem("token"); // tu token guardado
    const res = await axios.get(
      "https://proyectofinal-backend-1-uqej.onrender.com/users/search-by-type",
      {
        params: { q: term, user_type: "estudiante", limit: 20, offset: 0 },
        headers: {
          Authorization: `Bearer ${token}`, // clave: enviar token
        },
      }
    );
    console.log(res.data);
    setStudents(res.data.users || res.data);
  } catch (error) {
    console.error("Error buscando estudiantes:", error);
  }
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("https://proyectofinal-backend-1-uqej.onrender.com/payment/new", {
        ...form,
        user_id: parseInt(form.user_id),
        carer_id: parseInt(form.carer_id),
        amount: parseInt(form.amount),
        affected_month: form.affected_month,
      });

      setMessage({ text: "✅ Pago creado con éxito", color: "green" });
      setTimeout(() => {
        setMessage(null);
        navigate("/vistaPagos");
      }, 2000);
    } catch (error) {
      console.error("Error creando pago:", error);
      setMessage({ text: "❌ Error al crear el pago", color: "red" });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleCancel = () => {
    navigate("/vistaPagos");
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto p-0 bg-white rounded-lg shadow mt-0"
      initial={{ opacity: 0, x: -50 }} // arranca invisible y un poco a la izquierda
      animate={{ opacity: 1, x: 0 }} // entra deslizándose al centro
      exit={{ opacity: 0, x: 50 }} // cuando salga, se desliza a la derecha
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
    <div className="max-w-md mx-auto mt-10 bg-white shadow-md p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">Crear Nuevo Pago</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Buscador de estudiantes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar alumno..."
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          {students.length > 0 && (
            <ul className="border mt-1 max-h-40 overflow-y-auto rounded-md">
              {students.map((s) => (
                <li
                  key={s.id}
                  onClick={() => {
                    setForm({ ...form, user_id: s.id.toString() });
                    setSearchTerm(s.firstName + " " + s.lastName);
                    setStudents([]);
                  }}
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

        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto:</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        {/* Mes afectado */}
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

        {/* Botones */}
        <div className="flex justify-between mt-6">
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md shadow"
          >
            Crear Pago
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

      {/* Mensajes de éxito/error */}
      {message && (
        <div
          className={`mt-4 text-sm font-semibold p-3 rounded-md text-center ${
            message.color === "green"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
    </motion.div>
  );
}
