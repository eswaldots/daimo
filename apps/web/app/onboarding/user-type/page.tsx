import { UserTypeView } from "@/modules/onboarding/user-type/user-type-view";
import { Metadata } from "next";

export const metadata: Metadata = {
		title: "¿Quién usará Daimo? - Daimo"
}

const ServerPage = () => {
		return <UserTypeView />
}

export default ServerPage;
