export const metadata = {
  title: "Personaje no encontrado",
};

/**
 * Render a centered 404 view indicating the requested character was not found.
 *
 * Renders a centered container with a prominent "404" heading and the Spanish message
 * "No pudimos encontrar ese personaje".
 *
 * @returns A JSX element displaying a centered 404 page with the message "No pudimos encontrar ese personaje".
 */
export default function NotFound() {
  return (
    <div
      className="top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 absolute"
      style={{
        viewTransitionName: "disabled",
      }}
    >
      <section className="text-center space-y-4">
        <h1 className="font-medium tracking-tight text-8xl">404</h1>
        <p className="text-foreground/50 font-light text-xl">
          No pudimos encontrar ese personaje
        </p>
      </section>
    </div>
  );
}