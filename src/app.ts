import express from 'express';
import cors from 'cors';
import urlRoutes from './routes/url.routes.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/urls', urlRoutes);