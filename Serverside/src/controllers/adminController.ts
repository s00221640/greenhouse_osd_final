import { Request, Response } from 'express';
import Plant from '../models/plantModel';
import User from '../models/userModel';

export const verifyAdminCode = (req: Request, res: Response) => {
  const adminCode = req.body.code;
  if (adminCode === process.env.ADMIN_CODE) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid admin code' });
  }
};

export const getAllUsersAndPlants = async (_req: Request, res: Response) => {
  try {
    const users = await User.find({}, '-password');
    const plants = await Plant.find();
    res.status(200).json({ users, plants });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users and plants', error });
  }
};

export const deleteAnyUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    await User.findByIdAndDelete(userId);
    await Plant.deleteMany({ userId });
    res.status(200).json({ message: `Deleted user and their plants.` });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

export const deleteAnyPlant = async (req: Request, res: Response) => {
  const { plantId } = req.params;
  try {
    await Plant.findByIdAndDelete(plantId);
    res.status(200).json({ message: `Deleted plant.` });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plant', error });
  }
};

export const getAdminStats = async (_req: Request, res: Response) => {
  try {
    const userCount = await User.countDocuments();
    const plantCount = await Plant.countDocuments();
    res.status(200).json({ userCount, plantCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};
