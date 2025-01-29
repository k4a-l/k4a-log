import { Hono } from "hono";
import { handle } from "hono/vercel";

import { searchAPI } from "./search";

import type { PageConfig } from "next";

// basePath は API ルートのベースパスを指定します
// 以降、新たに生やす API ルートはこのパスを基準に追加されます
const app = new Hono().basePath("/api");
const route = app.route("/search", searchAPI);

export type AppType = typeof route;

export const GET = handle(app);
export const POST = handle(app);

export const config: PageConfig = { api: { bodyParser: false } };
