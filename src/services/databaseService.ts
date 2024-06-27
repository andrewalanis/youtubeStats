import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../src/config/config';

class DatabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(config.supabaseUrl ?? '', config.supabaseKey ?? '');
  }

  async upsertVideo(video: any) {
    const { data, error } = await this.client
      .from('videos')
      .upsert(video, { onConflict: 'videoId' });

    if (error) throw error;
    return data;
  }

  async getVideoByVideoId(videoId: string) {
    const { data, error } = await this.client
      .from('videos')
      .select('*')
      .eq('videoId', videoId)
      .single();

    if (error) throw error;
    return data;
  }
}

export const databaseService = new DatabaseService();