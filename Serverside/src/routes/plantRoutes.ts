import express, { Request, Response, Router } from 'express';
import {
  getAllPlants,
  getPlantById,
  createPlant,
  updatePlant,
  deletePlant,
  deleteAllPlants
} from '../controllers/plantController';
import { authenticateKey } from '../auth.middleware';
import Plant from '../models/plantModel'; 
import { upload } from '../middleware/multerMiddleware';

const router: Router = express.Router();

router.use(authenticateKey);

// Admin code verification route
router.post('/admin-code-check', (req: Request, res: Response) => {
  const providedCode = req.body.code;
  const adminCode = process.env.ADMIN_CODE;

  if (providedCode === adminCode) {
    res.status(200).json({ success: true });
  } else {
    res.status(403).json({ success: false, message: 'Invalid admin code' });
  }
});

// Debug/special routes
router.delete('/reset', async (req: Request, res: Response) => {
  try {
    const result = await Plant.deleteMany({});
    console.log(`Deleted all ${result.deletedCount} plants`);
    res.status(200).json({ message: `Deleted all ${result.deletedCount} plants` });
  } catch (error) {
    console.error('Error resetting plants:', error);
    res.status(500).json({ message: 'Error resetting plants', error });
  }
});

router.delete('/all/debug', async (req: Request, res: Response) => {
  try {
    await deleteAllPlants(req, res);
  } catch (error) {
    console.error('Error in DELETE /all/debug:', error);
    res.status(500).json({ message: 'Error deleting all plants', error });
  }
});

router.post('/fix-plants', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    console.log('Fixing plants for user ID:', userId);

    const plantsWithoutUserId = await Plant.find({ userId: { $exists: false } });
    console.log(`Found ${plantsWithoutUserId.length} plants without userId`);

    const updatePromises = plantsWithoutUserId.map(plant => 
      Plant.findByIdAndUpdate(plant._id, { userId: userId }, { new: true })
    );

    const updatedPlants = await Promise.all(updatePromises);
    console.log(`Updated ${updatedPlants.length} plants with userId: ${userId}`);

    res.status(200).json({ 
      message: `Fixed ${updatedPlants.length} plants`, 
      plants: updatedPlants
    });
  } catch (error) {
    console.error('Error fixing plants:', error);
    res.status(500).json({ message: 'Error fixing plants', error });
  }
});

// CRUD routes
router.get('/', async (req: Request, res: Response) => {
  try {
    await getAllPlants(req, res);
  } catch (error) {
    console.error('Error in GET /:', error);
    res.status(500).json({ message: 'Error fetching all plants', error });
  }
});

router.post(
  '/',
  (req: Request, res: Response, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      upload(req, res, (err) => {
        if (err) {
          console.error('Multer error:', err);
          return res.status(400).json({ message: 'File upload error', error: err });
        }
        next();
      });
    } else {
      next();
    }
  },
  async (req: Request, res: Response) => {
    try {
      await createPlant(req, res);
    } catch (error) {
      console.error('Error in POST /:', error);
      res.status(500).json({ message: 'Error creating plant', error });
    }
  }
);

router.get('/:id', async (req: Request, res: Response) => {
  try {
    await getPlantById(req, res);
  } catch (error) {
    console.error('Error in GET /:id:', error);
    res.status(500).json({ message: 'Error fetching plant by ID', error });
  }
});

router.put(
  '/:id',
  (req: Request, res: Response, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      upload(req, res, (err) => {
        if (err) {
          console.error('Multer error during update:', err);
          return res.status(400).json({ message: 'File upload error', error: err });
        }
        next();
      });
    } else {
      next();
    }
  },
  async (req: Request, res: Response) => {
    try {
      await updatePlant(req, res);
    } catch (error) {
      console.error('Error in PUT /:id:', error);
      res.status(500).json({ message: 'Error updating plant', error });
    }
  }
);

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await deletePlant(req, res);
  } catch (error) {
    console.error('Error in DELETE /:id:', error);
    res.status(500).json({ message: 'Error deleting plant', error });
  }
});

export default router;
