import { UsersView } from "@/modules/admin/users/users-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Usuarios | Daimo for admins",
};

const ServerPage = () => {
  return <UsersView />;
};

export default ServerPage;
