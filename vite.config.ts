import { defineConfig, type Plugin } from "vite";
import { cleanTangledUser, fetchTangledProfile, isCampusTangled, tangledHost } from "./src/tangled-check";

function sendJson(res: { setHeader: (k: string, v: string) => void; statusCode: number; end: (s: string) => void }, body: unknown, status = 200): void {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

function tangledVerifyPlugin(): Plugin {
  return {
    name: "tangled-verify",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handleVerify(req.url ?? "", res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        void handleVerify(req.url ?? "", res, next);
      });
    },
  };
}

async function handleVerify(
  raw: string,
  res: { setHeader: (k: string, v: string) => void; statusCode: number; end: (s: string) => void },
  next: () => void,
): Promise<void> {
  if (!raw.startsWith("/api/tangled-verify")) {
    next();
    return;
  }
  let user = "";
  try {
    user = cleanTangledUser(new URL(raw, "http://127.0.0.1").searchParams.get("u") ?? "");
  } catch {
    user = "";
  }
  if (!user) {
    sendJson(res, { ok: false, user: "", reason: "bad", host: "tangled.com" }, 400);
    return;
  }
  if (isCampusTangled(user)) {
    sendJson(res, { ok: true, user, reason: "campus", host: tangledHost(user) });
    return;
  }
  const check = await fetchTangledProfile(user);
  sendJson(res, check);
}

const betaProxy = {
  "/play": {
    target: "http://127.0.0.1:43148",
    ws: true,
  },
};

export default defineConfig({
  plugins: [tangledVerifyPlugin()],
  ssr: {
    noExternal: true,
  },
  server: {
    host: "127.0.0.1",
    port: 43147,
    strictPort: true,
    proxy: betaProxy,
  },
  preview: {
    host: "127.0.0.1",
    port: 43147,
    strictPort: true,
    proxy: betaProxy,
  },
});
