import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  defaultCacheTTL: parseInt(process.env.CACHE_TTL || '3600', 10),
};