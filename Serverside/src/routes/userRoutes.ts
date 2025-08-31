import express, { Router } from 'express';
import {registerUser, loginUser, validateToken} from '../controllers/userController';
import { authenticateKey } from '../auth.middleware';

const router: Router = express.Router();

router.post('/register', registerUser); //Route for registering users
router.post('/login', loginUser); //Route for logging in users
router.get('/validate', authenticateKey, validateToken); //validate token

export default router;

router.get('/test', (req, res) => {
    res.json({ message: 'User routes are working!' });
  });
  