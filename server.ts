import express from 'express';
import cors from 'cors';
import { config } from './src/config/config';
import channelStatsRouter from './src/routes/channelStats';

const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(channelStatsRouter);

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});

export default app;