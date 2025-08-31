import mongoose, { Schema, Document } from 'mongoose';

export interface IPlant extends Document {
  name: string;
  species: string;
  plantingDate: Date | null;
  wateringFrequency: number;
  lightRequirement: string;
  harvestDate?: Date;
  userEmail: string;
  imageUrl?: string;
}

const plantSchema = new Schema<IPlant>({
  name: { type: String, required: true },
  species: { type: String, required: true },
  plantingDate: { type: Date, default: null }, // ✅ allow nulls
  wateringFrequency: { type: Number, required: true },
  lightRequirement: { type: String, required: true },
  harvestDate: { type: Date },
  userEmail: { type: String, required: true },
  imageUrl: { type: String }
});

const Plant = mongoose.model<IPlant>('Plant', plantSchema);
export default Plant;
