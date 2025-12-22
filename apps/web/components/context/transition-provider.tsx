"use client";

import { ReactNode, ViewTransition } from "react";

export default function TransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <ViewTransition>{children}</ViewTransition>;
}
