import express from "express";
import * as path from "path";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { existsSync, readdirSync, Dirent } from "fs";

// Load env from Serverside/.env when running from Serverside/
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- DB ----------------------------------------------------------------------
const mongoUri = process.env.MONGO_URI ?? "";
if (!mongoUri) {
  console.warn("MONGO_URI not set");
} else {
  mongoose
    .connect(mongoUri)
    .then(() => console.log("Mongo connected"))
    .catch((e) => console.error("Mongo connect error:", e));
}

// --- API routes (MOUNT BEFORE STATIC / WILDCARD) -----------------------------
import userRoutes from "./routes/userRoutes";
import plantRoutes from "./routes/plantRoutes";
import adminRoutes from "./routes/adminRoutes"; // <-- add admin

app.use("/users", userRoutes);
app.use("/plants", plantRoutes);
app.use("/admin", adminRoutes); // <-- MUST be before static + SPA fallback

// --- Health ------------------------------------------------------------------
app.get("/health", (_req, res) => res.status(200).send("ok"));

// --- Static client (Angular) -------------------------------------------------
// Prefer Serverside/dist/client (our build target), but auto-fallback to common Angular outputs.
function findIndexDir(root: string): string | undefined {
  try {
    const stack: string[] = [root];
    while (stack.length) {
      const dir = stack.pop()!;
      if (existsSync(path.join(dir, "index.html"))) return dir;
      let entries: Dirent[];
      try {
        entries = readdirSync(dir, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const e of entries) if (e.isDirectory()) stack.push(path.join(dir, e.name));
    }
  } catch {}
  return undefined;
}

const candidates = [
  // preferred build targets we use in scripts
  path.resolve(__dirname, "client"),
  path.resolve(__dirname, "client/browser"),

  // common Angular defaults if outputPath wasn't overridden
  path.resolve(__dirname, "../../Clientside/dist/greenhouse-app-part2/browser"),
  path.resolve(__dirname, "../../Clientside/dist/greenhouse-app-part2"),
];

let clientDist =
  candidates.find((p) => existsSync(path.join(p, "index.html"))) ??
  findIndexDir(path.resolve(__dirname, "../../Clientside/dist")) ??
  candidates[0];

console.log("Serving client from:", clientDist);
app.use(express.static(clientDist));

// --- SPA fallback LAST -------------------------------------------------------
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

// --- Start -------------------------------------------------------------------
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));
