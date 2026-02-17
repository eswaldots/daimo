import { AccountView } from "@/modules/settings/account/account-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuración | Daimo",
};

/**
 * Renders the account page by mounting the AccountView component.
 *
 * @returns The page's JSX content containing the Overview component.
 */
export default function Page() {
  return (
    <>
      <AccountView />
    </>
  );
}
