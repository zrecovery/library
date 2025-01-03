import { cors } from "@elysiajs/cors";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { swagger } from "@elysiajs/swagger";
import Elysia from "elysia";

import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";

export const app = new Elysia()
  .use(swagger())
  .use(cors({ origin: "localhost:3002" }))
  .use(
    opentelemetry({
      spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
    }),
  )
  .group("/api", (api) => api.use(ArticleController))
  .listen(3001);

export type Server = typeof app;
