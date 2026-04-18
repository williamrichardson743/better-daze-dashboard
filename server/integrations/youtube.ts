import axios, { AxiosInstance } from 'axios';

/**
 * YouTube API Client
 * Handles OAuth, Shorts upload, and analytics retrieval
 */
export class YouTubeClient {
  private client: AxiosInstance;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;

    this.client = axios.create({
      baseURL: 'https://www.googleapis.com/youtube/v3',
      timeout: 10000,
    });
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
      access_type: 'offline',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    try {
      const response = await this.client.post('/oauth2/v4/token', {
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      });

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
      };
    } catch (error) {
      throw new Error(`Failed to exchange code for token: ${error}`);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    try {
      const response = await this.client.post('/oauth2/v4/token', {
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
      });

      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
      };
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error}`);
    }
  }

  /**
   * Upload and publish a Short
   */
  async uploadShort(
    accessToken: string,
    videoPath: string,
    title: string,
    description: string,
    tags: string[] = []
  ): Promise<{
    video_id: string;
    url: string;
  }> {
    try {
      // Step 1: Create video metadata
      const metadata = {
        snippet: {
          title,
          description: `${description} ${tags.map((t) => `#${t}`).join(' ')}`,
          tags,
          categoryId: '24', // Entertainment category
        },
        status: {
          privacyStatus: 'public',
          madeForKids: false,
        },
      };

      // Step 2: Upload video file
      // In production, would upload actual video file
      // For now, simulating successful upload

      const response = await this.client.post(
        '/videos?part=snippet,status',
        metadata,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const videoId = response.data.id;

      return {
        video_id: videoId,
        url: `https://www.youtube.com/shorts/${videoId}`,
      };
    } catch (error) {
      throw new Error(`Failed to upload Short: ${error}`);
    }
  }

  /**
   * Get video statistics
   */
  async getVideoStats(
    accessToken: string,
    videoId: string
  ): Promise<{
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }> {
    try {
      const response = await this.client.get('/videos', {
        params: {
          part: 'statistics',
          id: videoId,
          access_token: accessToken,
        },
      });

      const stats = response.data.items[0]?.statistics || {};

      return {
        views: parseInt(stats.viewCount || '0'),
        likes: parseInt(stats.likeCount || '0'),
        comments: parseInt(stats.commentCount || '0'),
        shares: 0, // YouTube doesn't provide share count in public API
      };
    } catch (error) {
      throw new Error(`Failed to get video stats: ${error}`);
    }
  }

  /**
   * Get channel info
   */
  async getChannelInfo(accessToken: string): Promise<{
    channel_id: string;
    title: string;
    description: string;
    subscriber_count: number;
    view_count: number;
    video_count: number;
    profile_image_url: string;
  }> {
    try {
      const response = await this.client.get('/channels', {
        params: {
          part: 'snippet,statistics',
          mine: true,
          access_token: accessToken,
        },
      });

      const channel = response.data.items[0];
      const stats = channel.statistics;

      return {
        channel_id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        subscriber_count: parseInt(stats.subscriberCount || '0'),
        view_count: parseInt(stats.viewCount || '0'),
        video_count: parseInt(stats.videoCount || '0'),
        profile_image_url: channel.snippet.thumbnails.default.url,
      };
    } catch (error) {
      throw new Error(`Failed to get channel info: ${error}`);
    }
  }

  /**
   * Get trending videos
   */
  async getTrendingVideos(): Promise<
    Array<{
      video_id: string;
      title: string;
      views: number;
      channel: string;
    }>
  > {
    try {
      // This would call YouTube's trending API
      // For now, return mock data
      return [
        {
          video_id: 'video_1',
          title: 'Trending Video 1',
          views: 10000000,
          channel: 'Popular Channel',
        },
        {
          video_id: 'video_2',
          title: 'Trending Video 2',
          views: 9000000,
          channel: 'Another Channel',
        },
      ];
    } catch (error) {
      throw new Error(`Failed to get trending videos: ${error}`);
    }
  }

  /**
   * Get trending audio/music
   */
  async getTrendingAudio(): Promise<
    Array<{
      id: string;
      title: string;
      artist: string;
      duration: number;
    }>
  > {
    try {
      // This would call YouTube's audio library API
      // For now, return mock data
      return [
        {
          id: 'audio_1',
          title: 'Trending Audio 1',
          artist: 'Artist Name',
          duration: 30,
        },
        {
          id: 'audio_2',
          title: 'Trending Audio 2',
          artist: 'Artist Name',
          duration: 45,
        },
      ];
    } catch (error) {
      throw new Error(`Failed to get trending audio: ${error}`);
    }
  }

  /**
   * Search videos
   */
  async searchVideos(
    accessToken: string,
    query: string,
    maxResults: number = 10
  ): Promise<
    Array<{
      video_id: string;
      title: string;
      channel: string;
      views: number;
    }>
  > {
    try {
      const response = await this.client.get('/search', {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults,
          order: 'viewCount',
          access_token: accessToken,
        },
      });

      return response.data.items.map((item: any) => ({
        video_id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        views: 0, // Would need separate call to get view count
      }));
    } catch (error) {
      throw new Error(`Failed to search videos: ${error}`);
    }
  }
}

/**
 * Initialize YouTube client
 */
export function createYouTubeClient(): YouTubeClient {
  const clientId = process.env.YOUTUBE_CLIENT_ID || '';
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || '';
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || '';

  if (!clientId || !clientSecret) {
    throw new Error('YouTube credentials not configured');
  }

  return new YouTubeClient(clientId, clientSecret, redirectUri);
}
