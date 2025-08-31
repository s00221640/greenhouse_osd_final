import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Plant, { IPlant } from '../models/plantModel';

export const getAllPlants = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const email = user?.email;
    if (!email) return res.status(401).json({ message: 'User email not found' });

    const userPlants = await Plant.find({ userEmail: email });
    res.status(200).json(userPlants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plants' });
  }
};

export const getPlantById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userEmail = (req as any).user.email;

  try {
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid Plant ID format.' });
    const plant = await Plant.findOne({ _id: id, userEmail });
    if (!plant) return res.status(404).json({ message: 'Plant not found.' });
    res.status(200).json(plant);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plant.' });
  }
};

export const createPlant = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const email = user?.email;
    if (!email) return res.status(401).json({ message: 'User email not found' });

    // Extract data from req.body + req.file
    const plantData = {
      name: String(req.body.name || ''),
      species: String(req.body.species || ''),
      plantingDate: req.body.plantingDate ? new Date(req.body.plantingDate) : null,
      wateringFrequency: Number(req.body.wateringFrequency || 0),
      lightRequirement: String(req.body.lightRequirement || ''),
      userEmail: email,
      imageUrl: (req as any).file?.path || null,
    };

    const plant = new Plant(plantData);
    const savedPlant = await plant.save();
    res.status(201).json(savedPlant);
  } catch (error) {
    res.status(500).json({ message: 'Error creating plant', error });
  }
};

export const updatePlant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userEmail = (req as any).user.email;

  try {
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid Plant ID format.' });

    // Check if the plant exists and belongs to the user
    const existingPlant = await Plant.findOne({ _id: id, userEmail });
    if (!existingPlant) return res.status(404).json({ message: 'Plant not found.' });

    // Build update data, checking for file upload
    const updateData: Partial<IPlant> = {
      name: req.body.name,
      species: req.body.species,
      plantingDate: req.body.plantingDate ? new Date(req.body.plantingDate) : undefined,
      wateringFrequency: Number(req.body.wateringFrequency),
      lightRequirement: req.body.lightRequirement,
      harvestDate: req.body.harvestDate ? new Date(req.body.harvestDate) : undefined,
    };

    // If there's a new image file, add it to updateData
    if ((req as any).file && (req as any).file.path) {
      updateData.imageUrl = (req as any).file.path;
    }

    const updatedPlant = await Plant.findOneAndUpdate(
      { _id: id, userEmail },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPlant) return res.status(404).json({ message: 'Plant not found after update attempt.' });

    res.status(200).json(updatedPlant);
  } catch (error) {
    console.error('Error updating plant:', error);
    res.status(500).json({ message: 'Error updating plant.' });
  }
};
export const deletePlant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userEmail = (req as any).user.email;

  try {
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid Plant ID format.' });
    const deletedPlant = await Plant.findOneAndDelete({ _id: id, userEmail });
    if (!deletedPlant) return res.status(404).json({ message: 'Plant not found.' });
    res.status(200).json({ message: 'Plant deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plant.' });
  }
};

export const deleteAllPlants = async (_req: Request, res: Response) => {
  try {
    const result = await Plant.deleteMany({});
    res.status(200).json({ message: `Deleted ${result.deletedCount} plants` });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting all plants', error });
  }
};
