import { Router } from 'express';
import { youtubeService } from '../services/youtubeService';
import { dislikeService } from '../services/dislikeService';
import { databaseService } from '../services/databaseService';

const router = Router();

router.get('/api/channel-stats', async (req, res) => {
  const channelId = req.query.channelId as string;
  const pageToken = (req.query.pageToken as string) || '';
  const pageSize = 50;

  try {
    const uploadsPlaylistId = await youtubeService.getChannelUploadsPlaylistId(channelId);
    const videosData = await youtubeService.getVideoList(uploadsPlaylistId, pageToken, pageSize);

    const videoIds = videosData.items?.map(item => item.contentDetails?.videoId as string) || [];
    const videoDetails = await youtubeService.getVideoDetails(videoIds);

    const processedVideos = await Promise.all(videoDetails.map(async (video) => {
      const dislikes = await dislikeService.getDislikesForVideo(video.id as string);
      const duration = parseDuration(video.contentDetails?.duration || '');
      const isShort = duration.totalSeconds <= 60;

      const processedVideo = {
        videoId: video.id,
        name: video.snippet?.title,
        publishDate: video.snippet?.publishedAt,
        views: parseInt(video.statistics?.viewCount || '0'),
        duration: `${duration.minutes}:${duration.seconds.toString().padStart(2, '0')}`,
        isShort,
        likes: parseInt(video.statistics?.likeCount || '0'),
        dislikes,
        comments: parseInt(video.statistics?.commentCount || '0'),
      };

      // Save to database
      await databaseService.upsertVideo(processedVideo);

      return processedVideo;
    }));

    res.json({
      videos: processedVideos,
      nextPageToken: videosData.nextPageToken || null,
      totalResults: videosData.pageInfo?.totalResults || 0,
    });
  } catch (error) {
    console.error('Error fetching channel stats:', error);
    res.status(500).json({ error: 'Error fetching channel stats' });
  }
});

function parseDuration(duration: string) {
  const matches = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(matches?.[1] || '0');
  const minutes = parseInt(matches?.[2] || '0');
  const seconds = parseInt(matches?.[3] || '0');
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return { hours, minutes, seconds, totalSeconds };
}

export default router;