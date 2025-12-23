import { Metadata } from "next";
import { Overview } from "@/components/views/overview";

export const metadata: Metadata = {
  title: "Inicio - Daimo",
};

/**
 * Renders the home page by mounting the Overview component.
 *
 * @returns The page's JSX content containing the Overview component.
 */
export default function Page() {
  return (
    <>
      <Overview />
    </>
  );
}