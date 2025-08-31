import express, { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import Plant from "../models/plantModel";
import { authenticateKey } from "../auth.middleware";

const router = express.Router();

// Read from env, fall back for local dev
const ADMIN_CODE = (process.env.ADMIN_CODE || "letmein2025").trim();

/**
 * JWT auth first (expects Authorization: Bearer <token>)
 */
router.use(authenticateKey);

/**
 * Then require admin code via header: x-admin-code
 */
router.use((req: Request, res: Response, next: NextFunction) => {
  const headerVal = req.header("x-admin-code"); // coerces to string | null
  const code = (headerVal || "").trim();

  if (!code || code !== ADMIN_CODE) {
    return res.status(401).json({ message: "Invalid admin code" });
  }
  next();
});

/**
 * GET /admin/stats
 * Returns total users and total plants
 */
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [totalUsers, totalPlants] = await Promise.all([
      User.countDocuments({}),
      Plant.countDocuments({}),
    ]);
    return res.status(200).json({ totalUsers, totalPlants });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching stats", error });
  }
});

/**
 * GET /admin/all
 * Returns all users (without password) and all plants
 */
router.get("/all", async (_req: Request, res: Response) => {
  try {
    const [users, plants] = await Promise.all([
      User.find({}, { password: 0 }).lean(),
      Plant.find({}).lean(),
    ]);
    return res.status(200).json({ users, plants });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching users and plants", error });
  }
});

/**
 * DELETE /admin/delete-user/:userId
 * Deletes a user and all of their plants.
 * Supports both userId and userEmail field on plants (whichever your schema uses).
 */
router.delete("/delete-user/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).lean();
    await User.findByIdAndDelete(userId);

    // Build an $or to handle either schema style
    const or: any[] = [{ userId }];
    if (user?.email) or.push({ userEmail: user.email });

    await Plant.deleteMany({ $or: or });

    return res.status(200).json({ message: "User and their plants deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting user", error });
  }
});

/**
 * DELETE /admin/delete-plant/:plantId
 * Deletes a single plant by id
 */
router.delete("/delete-plant/:plantId", async (req: Request, res: Response) => {
  const { plantId } = req.params;
  try {
    await Plant.findByIdAndDelete(plantId);
    return res.status(200).json({ message: "Plant deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting plant", error });
  }
});

export default router;
