import { authClient } from "./auth/auth-client";

export type Session = typeof authClient.$Infer.Session;
