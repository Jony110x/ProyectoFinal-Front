//#region IMPORTACIONES
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
//#endregion

//#region TIPOS E INTERFACES
type LoginProcessResponse = {
  status: string;
  token?: string;
  user?: unknown;
  message?: string;
};
//#endregion

//#region COMPONENTE PRINCIPAL LOGIN
function Login() {
  //#region CONSTANTES Y CONFIGURACIÓN
  const BACKEND_IP = "https://proyectofinal-backend-1-uqej.onrender.com";
  const ENDPOINT = "users/loginUser";
  const LOGIN_URL = `${BACKEND_IP}/${ENDPOINT}`;
  //#endregion

  //#region REFERENCIAS Y ESTADOS
  const userInputRef = useRef<HTMLInputElement>(null);
  const passInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  //#endregion

  //#region FUNCIONES 
  /**
   * Procesa la respuesta del login y maneja el redireccionamiento
   */
  function loginProcess(dataObject: LoginProcessResponse) {
    if (dataObject.status === "success") {
      localStorage.setItem("token", dataObject.token ?? "");
      localStorage.setItem("user", JSON.stringify(dataObject.user));
      navigate("/dashboard");
    } else {
      setMessage(dataObject.message ?? "Unknown error");
    }
  }

  /**
   * Maneja el envío del formulario de login
   */
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
  //#endregion

  //#region RENDER 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-600 to-cyan-700 relative overflow-hidden px-4">
      {/* Fondos decorativos con efecto blur */}
      <div className="absolute w-[60vw] h-[60vw] bg-white opacity-10 rounded-full blur-3xl -top-[20vh] -left-[20vw] z-0"></div>
      <div className="absolute w-[50vw] h-[50vw] bg-white opacity-10 rounded-full blur-2xl top-[40vh] -right-[25vw] z-0"></div>

      {/* Contenedor del formulario */}
      <div className="bg-white px-8 py-10 rounded-lg shadow-xl w-full max-w-sm relative z-10">
        {/* Título del formulario */}
        <h2 className="text-2xl font-semibold text-center text-teal-700 mb-6">Acceso</h2>
        
        <form onSubmit={handleLogin}>
          {/* Campo de usuario */}
          <div className="flex items-center mb-4 border-b-2 border-teal-600">
            <FaUser className="text-teal-600 mr-3" />
            <input
              type="text"
              placeholder="Usuario"
              ref={userInputRef}
              className="w-full px-4 py-2 border-none bg-gray-100 focus:outline-none"
            />
          </div>

          {/* Campo de contraseña */}
          <div className="flex items-center mb-4 border-b-2 border-teal-600">
            <FaLock className="text-teal-600 mr-3" />
            <input
              type="password"
              placeholder="Contraseña"
              ref={passInputRef}
              className="w-full px-4 py-2 border-none bg-gray-100 focus:outline-none"
            />
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-2 rounded hover:bg-teal-600 transition font-semibold"
          >
            Iniciar sesión
          </button>

          {/* Mensaje de error */}
          {message && (
            <p className="text-red-500 text-sm text-center mt-2">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
  //#endregion
}
export default Login;
//#endregion