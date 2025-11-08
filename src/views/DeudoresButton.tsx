//#region IMPORTACIONES
import { useNavigate } from "react-router-dom";
//#endregion

//#region COMPONENTE PRINCIPAL DEUDORESBUTTON
export default function DeudoresButton() {
  //#region HOOKS Y ESTADOS
  const navigate = useNavigate();
  //#endregion

  //#region MANEJADORES DE EVENTOS
  /**
   * Maneja la navegación a la vista de deudores
   */
  const handleClick = () => {
    navigate("/deudores");
  };
  //#endregion

  //#region RENDER 
  return (
    <button
      onClick={handleClick}
      className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 border-2 border-teal-600 text-white px-4 py-2 rounded-md shadow text-sm sm:text-base flex items-center justify-center gap-2 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      Ver Deudores
    </button>
  );
  //#endregion
}
//#endregion