"use client";

import { ReactNode, ViewTransition } from "react";

/**
 * Wraps the given children in React's ViewTransition to enable view transitions.
 *
 * @param children - Child elements to be wrapped by the transition provider
 * @returns A JSX element that wraps `children` with a `ViewTransition`
 */
export default function TransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <ViewTransition>{children}</ViewTransition>;
}