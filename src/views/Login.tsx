import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";

type LoginProcessResponse = {
  status: string;
  token?: string;
  user?: unknown;
  message?: string;
};

function Login() {
  const BACKEND_IP = "https://proyectofinal-backend-1-uqej.onrender.com";
  // const BACKEND_PORT = "8000";
  const ENDPOINT = "users/loginUser";
  const LOGIN_URL = `${BACKEND_IP}/${ENDPOINT}`;

  const userInputRef = useRef<HTMLInputElement>(null);
  const passInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  function loginProcess(dataObject: LoginProcessResponse) {
    if (dataObject.status === "success") {
      localStorage.setItem("token", dataObject.token ?? "");
      localStorage.setItem("user", JSON.stringify(dataObject.user));
      navigate("/dashboard");
    } else {
      setMessage(dataObject.message ?? "Unknown error");
    }
  }

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const username = userInputRef.current?.value ?? "";
    const password = passInputRef.current?.value ?? "";

    fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((dataObject) => loginProcess(dataObject))
      .catch((error) => console.error("Error:", error));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-600 to-cyan-700 relative overflow-hidden px-4">

      {/* Fondo decorativo responsivo con blur */}
      <div className="absolute w-[60vw] h-[60vw] bg-white opacity-10 rounded-full blur-3xl -top-[20vh] -left-[20vw] z-0"></div>
      <div className="absolute w-[50vw] h-[50vw] bg-white opacity-10 rounded-full blur-2xl top-[40vh] -right-[25vw] z-0"></div>

      {/* Formulario */}
      <div className="bg-white px-8 py-10 rounded-lg shadow-xl w-full max-w-sm relative z-10">
        <h2 className="text-2xl font-semibold text-center text-teal-700 mb-6">Acceso</h2>
        <form onSubmit={handleLogin}>
          
          {/* Username */}
          <div className="flex items-center mb-4 border-b-2 border-teal-600">
            <FaUser className="text-teal-600 mr-3" />
            <input
              type="text"
              placeholder="Usuario"
              ref={userInputRef}
              className="w-full px-4 py-2 border-none bg-gray-100 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="flex items-center mb-4 border-b-2 border-teal-600">
            <FaLock className="text-teal-600 mr-3" />
            <input
              type="password"
              placeholder="Contraseña"
              ref={passInputRef}
              className="w-full px-4 py-2 border-none bg-gray-100 focus:outline-none"
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-2 rounded hover:bg-teal-600 transition font-semibold"
          >
            Iniciar sesión
          </button>

          {/* Mensaje */}
          {message && (
            <p className="text-red-500 text-sm text-center mt-2">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;













