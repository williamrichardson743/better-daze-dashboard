import axios, { AxiosInstance } from 'axios';

/**
 * TikTok API Client
 * Handles OAuth, video posting, and analytics retrieval
 */
export class TikTokClient {
  private client: AxiosInstance;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;

    this.client = axios.create({
      baseURL: 'https://open.tiktokapis.com/v1',
      timeout: 10000,
    });
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_key: this.clientId,
      response_type: 'code',
      scope: 'user.info.basic,video.upload,video.publish',
      redirect_uri: this.redirectUri,
      state,
    });

    return `https://www.tiktok.com/v3/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    open_id: string;
  }> {
    try {
      const response = await this.client.post('/oauth/token', {
        client_key: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      });

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to exchange code for token: ${error}`);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    try {
      const response = await this.client.post('/oauth/token', {
        client_key: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error}`);
    }
  }

  /**
   * Post video to TikTok
   */
  async postVideo(
    accessToken: string,
    videoUrl: string,
    caption: string,
    hashtags: string[] = []
  ): Promise<{
    video_id: string;
    share_url: string;
  }> {
    try {
      // Step 1: Initialize video upload
      const initResponse = await this.client.post(
        '/video/upload/init/',
        {
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: 0, // Would be actual size
          },
          post_info: {
            title: `${caption} ${hashtags.map((h) => `#${h}`).join(' ')}`,
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_comment: false,
            disable_duet: false,
            disable_stitch: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const uploadToken = initResponse.data.data.upload_token;

      // Step 2: Upload video file
      // In production, would upload actual video file
      // For now, simulating successful upload

      // Step 3: Publish video
      const publishResponse = await this.client.post(
        '/video/publish/',
        {
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: 0,
          },
          post_info: {
            title: `${caption} ${hashtags.map((h) => `#${h}`).join(' ')}`,
            privacy_level: 'PUBLIC_TO_EVERYONE',
          },
          upload_token: uploadToken,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return {
        video_id: publishResponse.data.data.video_id,
        share_url: `https://www.tiktok.com/@user/video/${publishResponse.data.data.video_id}`,
      };
    } catch (error) {
      throw new Error(`Failed to post video: ${error}`);
    }
  }

  /**
   * Get video analytics
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
      const response = await this.client.get('/video/query/', {
        params: {
          fields: 'id,create_time,video_description,like_count,comment_count,share_count,view_count',
          video_ids: [videoId],
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const video = response.data.data.videos[0];

      return {
        views: video.view_count || 0,
        likes: video.like_count || 0,
        comments: video.comment_count || 0,
        shares: video.share_count || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get video stats: ${error}`);
    }
  }

  /**
   * Get trending sounds
   */
  async getTrendingSounds(): Promise<
    Array<{
      id: string;
      name: string;
      artist: string;
      duration: number;
    }>
  > {
    try {
      // This would call TikTok's trending sounds API
      // For now, return mock data
      return [
        {
          id: 'sound_1',
          name: 'Trending Sound 1',
          artist: 'Artist Name',
          duration: 15,
        },
        {
          id: 'sound_2',
          name: 'Trending Sound 2',
          artist: 'Artist Name',
          duration: 20,
        },
      ];
    } catch (error) {
      throw new Error(`Failed to get trending sounds: ${error}`);
    }
  }

  /**
   * Get trending hashtags
   */
  async getTrendingHashtags(): Promise<
    Array<{
      hashtag: string;
      views: number;
      videos: number;
    }>
  > {
    try {
      // This would call TikTok's trending hashtags API
      // For now, return mock data
      return [
        { hashtag: 'FYP', views: 1000000000, videos: 50000000 },
        { hashtag: 'ForYou', views: 900000000, videos: 45000000 },
        { hashtag: 'Trending', views: 800000000, videos: 40000000 },
      ];
    } catch (error) {
      throw new Error(`Failed to get trending hashtags: ${error}`);
    }
  }

  /**
   * Get user info
   */
  async getUserInfo(accessToken: string): Promise<{
    open_id: string;
    display_name: string;
    avatar_url: string;
    follower_count: number;
  }> {
    try {
      const response = await this.client.get('/user/info/', {
        params: {
          fields: 'open_id,display_name,avatar_url,follower_count',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.data.user;
    } catch (error) {
      throw new Error(`Failed to get user info: ${error}`);
    }
  }
}

/**
 * Initialize TikTok client
 */
export function createTikTokClient(): TikTokClient {
  const clientId = process.env.TIKTOK_CLIENT_ID || '';
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET || '';
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || '';

  if (!clientId || !clientSecret) {
    throw new Error('TikTok credentials not configured');
  }

  return new TikTokClient(clientId, clientSecret, redirectUri);
}
