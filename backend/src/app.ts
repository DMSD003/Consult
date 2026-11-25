import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import analyseRoutes from './routes/analyse.routes';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:4173', // activate cors for my frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/process', analyseRoutes);

export default app; 
