import SignUp from "@/modules/auth/sign-up-view";
import { Metadata } from "next";

export const metadata: Metadata = {
		title: "Crear cuenta - Daimo"
}

const ServerPage = () => {
		return (
				<SignUp />
		)
}

export default ServerPage;
