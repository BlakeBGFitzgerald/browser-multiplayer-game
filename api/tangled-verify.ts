import { cleanTangledUser, fetchTangledProfile, isCampusTangled, tangledHost } from "../src/tangled-check";

type Req = { url?: string; query?: Record<string, string | string[] | undefined> };
type Res = {
  setHeader: (k: string, v: string) => void;
  statusCode: number;
  end: (s: string) => void;
};

function send(res: Res, body: unknown, status = 200): void {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

export default async function handler(req: Req, res: Res): Promise<void> {
  let user = "";
  const q = req.query?.u;
  if (typeof q === "string") user = q;
  else if (Array.isArray(q) && q[0]) user = q[0];
  else if (req.url) {
    try {
      user = new URL(req.url, "http://127.0.0.1").searchParams.get("u") ?? "";
    } catch {
      user = "";
    }
  }
  user = cleanTangledUser(user);
  if (!user) {
    send(res, { ok: false, user: "", reason: "bad", host: "tangled.com" }, 400);
    return;
  }
  if (isCampusTangled(user)) {
    send(res, { ok: true, user, reason: "campus", host: tangledHost(user) });
    return;
  }
  send(res, await fetchTangledProfile(user));
}
