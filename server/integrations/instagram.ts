import axios, { AxiosInstance } from 'axios';

/**
 * Instagram Graph API Client
 * Handles OAuth, Reels posting, and engagement metrics
 */
export class InstagramClient {
  private client: AxiosInstance;
  private appId: string;
  private appSecret: string;
  private redirectUri: string;

  constructor(appId: string, appSecret: string, redirectUri: string) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.redirectUri = redirectUri;

    this.client = axios.create({
      baseURL: 'https://graph.instagram.com/v18.0',
      timeout: 10000,
    });
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: 'instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages',
      response_type: 'code',
      state,
    });

    return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    user_id: string;
  }> {
    try {
      const response = await this.client.post('/oauth/access_token', {
        client_id: this.appId,
        client_secret: this.appSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code,
      });

      return {
        access_token: response.data.access_token,
        user_id: response.data.user_id,
      };
    } catch (error) {
      throw new Error(`Failed to exchange code for token: ${error}`);
    }
  }

  /**
   * Post Reel to Instagram
   */
  async postReel(
    accessToken: string,
    businessAccountId: string,
    videoUrl: string,
    caption: string,
    hashtags: string[] = []
  ): Promise<{
    media_id: string;
    permalink: string;
  }> {
    try {
      // Step 1: Create media container
      const containerResponse = await this.client.post(
        `/${businessAccountId}/media`,
        {
          media_type: 'REELS',
          video_url: videoUrl,
          caption: `${caption} ${hashtags.map((h) => `#${h}`).join(' ')}`,
          access_token: accessToken,
        }
      );

      const mediaId = containerResponse.data.id;

      // Step 2: Publish media
      const publishResponse = await this.client.post(
        `/${businessAccountId}/media_publish`,
        {
          creation_id: mediaId,
          access_token: accessToken,
        }
      );

      return {
        media_id: publishResponse.data.id,
        permalink: `https://www.instagram.com/reel/${publishResponse.data.id}`,
      };
    } catch (error) {
      throw new Error(`Failed to post Reel: ${error}`);
    }
  }

  /**
   * Get Reel engagement metrics
   */
  async getReelStats(
    accessToken: string,
    mediaId: string
  ): Promise<{
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
  }> {
    try {
      const response = await this.client.get(`/${mediaId}/insights`, {
        params: {
          metric: 'engagement,impressions,reach',
          access_token: accessToken,
        },
      });

      const insights = response.data.data;
      const metricsMap: Record<string, number> = {};

      insights.forEach((metric: any) => {
        metricsMap[metric.name] = metric.values[0]?.value || 0;
      });

      return {
        likes: metricsMap.likes || 0,
        comments: metricsMap.comments || 0,
        shares: metricsMap.shares || 0,
        reach: metricsMap.reach || 0,
        impressions: metricsMap.impressions || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get Reel stats: ${error}`);
    }
  }

  /**
   * Get trending hashtags
   */
  async getTrendingHashtags(): Promise<
    Array<{
      hashtag: string;
      posts: number;
    }>
  > {
    try {
      // This would call Instagram's trending hashtags API
      // For now, return mock data
      return [
        { hashtag: 'Reels', posts: 500000000 },
        { hashtag: 'Instagram', posts: 450000000 },
        { hashtag: 'Trending', posts: 400000000 },
      ];
    } catch (error) {
      throw new Error(`Failed to get trending hashtags: ${error}`);
    }
  }

  /**
   * Get business account info
   */
  async getBusinessAccountInfo(accessToken: string, businessAccountId: string): Promise<{
    id: string;
    name: string;
    biography: string;
    followers_count: number;
    profile_picture_url: string;
  }> {
    try {
      const response = await this.client.get(`/${businessAccountId}`, {
        params: {
          fields: 'id,name,biography,followers_count,profile_picture_url',
          access_token: accessToken,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get business account info: ${error}`);
    }
  }

  /**
   * Get media insights
   */
  async getMediaInsights(
    accessToken: string,
    mediaId: string
  ): Promise<{
    impressions: number;
    reach: number;
    engagement: number;
    saves: number;
  }> {
    try {
      const response = await this.client.get(`/${mediaId}/insights`, {
        params: {
          metric: 'impressions,reach,engagement,saves',
          access_token: accessToken,
        },
      });

      const insights = response.data.data;
      const metricsMap: Record<string, number> = {};

      insights.forEach((metric: any) => {
        metricsMap[metric.name] = metric.values[0]?.value || 0;
      });

      return {
        impressions: metricsMap.impressions || 0,
        reach: metricsMap.reach || 0,
        engagement: metricsMap.engagement || 0,
        saves: metricsMap.saves || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get media insights: ${error}`);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(accessToken: string): Promise<{
    access_token: string;
    token_type: string;
  }> {
    try {
      const response = await this.client.get('/refresh_access_token', {
        params: {
          grant_type: 'ig_refresh_token',
          access_token: accessToken,
        },
      });

      return {
        access_token: response.data.access_token,
        token_type: response.data.token_type,
      };
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error}`);
    }
  }
}

/**
 * Initialize Instagram client
 */
export function createInstagramClient(): InstagramClient {
  const appId = process.env.INSTAGRAM_APP_ID || '';
  const appSecret = process.env.INSTAGRAM_APP_SECRET || '';
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || '';

  if (!appId || !appSecret) {
    throw new Error('Instagram credentials not configured');
  }

  return new InstagramClient(appId, appSecret, redirectUri);
}
