import express, { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import Plant from '../models/plantModel';
import { authenticateKey } from '../auth.middleware';

const router = express.Router();

const ADMIN_CODE = process.env.ADMIN_CODE || 'letmein2025';

router.use(authenticateKey);

router.use((req: Request, res: Response, next: NextFunction) => {
  const code = req.headers['x-admin-code'];
  if (code === ADMIN_CODE) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden. Invalid admin code.' });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPlants = await Plant.countDocuments();
    res.status(200).json({ totalUsers, totalPlants });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
});

router.get('/all', async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, '-password');
    const plants = await Plant.find();
    res.status(200).json({ users, plants });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users and plants', error });
  }
});

router.delete('/delete-user/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    await User.findByIdAndDelete(userId);
    await Plant.deleteMany({ userId });
    res.status(200).json({ message: 'Deleted user and their plants.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

router.delete('/delete-user/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    await User.findByIdAndDelete(userId);
    await Plant.deleteMany({ userEmail: (await User.findById(userId))?.email });
    res.status(200).json({ message: 'User and their plants deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

router.delete('/delete-plant/:plantId', async (req: Request, res: Response) => {
  const { plantId } = req.params;
  try {
    await Plant.findByIdAndDelete(plantId);
    res.status(200).json({ message: 'Plant deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plant', error });
  }
});

export default router;
