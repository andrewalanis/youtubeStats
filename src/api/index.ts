import express from 'express';
import cors from 'cors';
import { config } from '../config/config';
import channelStatsRouter from '../routes/channelStats';

const app = express();

app.use(cors());
app.use('/api', channelStatsRouter);  // Add '/api' prefix to all routes

export default app;