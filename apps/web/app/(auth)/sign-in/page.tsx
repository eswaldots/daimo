import SignIn from "@/modules/auth/sign-in-view";
import { Metadata } from "next";

export const metadata: Metadata = {
		title: "Iniciar sesión - Daimo"
}

// TODO: Conseguir parametros
const ServerPage = () => {
		return (
		<SignIn /> 
		)
}

export default ServerPage; 
