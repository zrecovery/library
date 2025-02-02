import { treaty } from "@elysiajs/eden";
import type { Server } from "web-api";

export const edenServer = treaty<Server>("localhost:3001");
