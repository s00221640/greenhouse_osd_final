import express from "express";
import * as path from "path";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { existsSync, readdirSync, Dirent } from "fs";

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

// --- API routes (add yours above the SPA fallback) ---------------------------
// import authRouter from "./routes/authRoutes";
// import plantRouter from "./routes/plantRoutes";
// app.use("/api/auth", authRouter);
// app.use("/api/plants", plantRouter);

// --- Health ------------------------------------------------------------------
app.get("/health", (_req, res) => res.status(200).send("ok"));

// --- Static client (Angular) -------------------------------------------------
// Try the usual places first; if not found, search Clientside/dist recursively.
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
