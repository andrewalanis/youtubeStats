import { google, youtube_v3 } from 'googleapis';
import { config } from '../config/config';
import { cacheService } from './cacheService';

const youtube = google.youtube({
  version: 'v3',
  auth: config.youtubeApiKey,
});

export class YouTubeService {
  async getChannelUploadsPlaylistId(channelId: string): Promise<string> {
    const cacheKey = `channel_${channelId}`;
    const cachedData = cacheService.get<string>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const channelResponse = await youtube.channels.list({
      part: ['contentDetails'],
      id: [channelId],
    });

    const uploadsPlaylistId = channelResponse.data.items?.[0].contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      throw new Error('Could not find uploads playlist ID');
    }

    cacheService.set(cacheKey, uploadsPlaylistId);
    return uploadsPlaylistId;
  }

  async getVideoList(uploadsPlaylistId: string, pageToken: string, pageSize: number): Promise<youtube_v3.Schema$PlaylistItemListResponse> {
    const cacheKey = `videolist_${uploadsPlaylistId}_${pageToken}_${pageSize}`;
    const cachedData = cacheService.get<youtube_v3.Schema$PlaylistItemListResponse>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const videosResponse = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId: uploadsPlaylistId,
      maxResults: pageSize,
      pageToken: pageToken,
    });

    cacheService.set(cacheKey, videosResponse.data);
    return videosResponse.data;
  }

  async getVideoDetails(videoIds: string[]): Promise<youtube_v3.Schema$Video[]> {
    const videoStatsResponse = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: videoIds,
    });

    return videoStatsResponse.data.items || [];
  }
}

export const youtubeService = new YouTubeService();