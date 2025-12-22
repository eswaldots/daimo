import { Metadata } from "next";
import { Overview } from "@/components/views/overview";

export const metadata: Metadata = {
  title: "Inicio - Daimo",
};

export default function Page() {
  return (
    <>
      <Overview />
    </>
  );
}
