/**
 * Step 6 — Social Distribution (Ayrshare)
 * Schedules posts to TikTok, Instagram, and YouTube via the Ayrshare API.
 * Posts are scheduled 2 hours from now.
 * Falls back to mock data when AYRSHARE_API_KEY is absent.
 */

import axios from 'axios';

export interface ScheduledPost {
  platform: string;
  scheduledTime: string;
  postId?: string;
}

export interface SocialDistributionResult {
  scheduledPosts: ScheduledPost[];
}

const AYRSHARE_BASE = 'https://app.ayrshare.com/api';
const PLATFORMS = ['tiktok', 'instagram', 'youtube'];

async function scheduleWithAyrshare(
  keyword: string,
  videoUrl: string,
  script: string,
  apiKey: string,
  scheduledTime: Date
): Promise<ScheduledPost[]> {
  const caption =
    `${script}\n\n` +
    `#${keyword.replace(/\s+/g, '')} #trending #limitededition #tshirt #printOnDemand`;

  const payload = {
    post: caption,
    platforms: PLATFORMS,
    mediaUrls: [videoUrl],
    scheduleDate: scheduledTime.toISOString(),
  };

  const response = await axios.post(`${AYRSHARE_BASE}/post`, payload, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const data = response.data;
  const scheduledTimeStr = scheduledTime.toISOString();

  return PLATFORMS.map((platform) => ({
    platform,
    scheduledTime: scheduledTimeStr,
    postId: data?.postIds?.[platform] ?? undefined,
  }));
}

export async function distributeToSocial(
  keyword: string,
  videoUrl: string,
  script: string = ''
): Promise<SocialDistributionResult> {
  console.log(`📱 [Step 6] Scheduling social posts for: "${keyword}"...`);

  const apiKey = process.env.AYRSHARE_API_KEY;
  const scheduledTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

  if (!apiKey) {
    console.warn('   ⚠️  AYRSHARE_API_KEY not set — using mock scheduled posts');
    const scheduledTimeStr = scheduledTime.toISOString();
    return {
      scheduledPosts: PLATFORMS.map((platform) => ({
        platform,
        scheduledTime: scheduledTimeStr,
        postId: `mock-${platform}-${Date.now()}`,
      })),
    };
  }

  try {
    const scheduledPosts = await scheduleWithAyrshare(
      keyword,
      videoUrl,
      script,
      apiKey,
      scheduledTime
    );
    console.log(`   ✅ Scheduled ${scheduledPosts.length} posts for ${scheduledTime.toISOString()}`);
    scheduledPosts.forEach((p) =>
      console.log(`   • ${p.platform}: ${p.postId ?? 'pending'}`)
    );
    return { scheduledPosts };
  } catch (err: any) {
    console.error(`   ❌ Ayrshare scheduling failed: ${err.message}`);
    const scheduledTimeStr = scheduledTime.toISOString();
    return {
      scheduledPosts: PLATFORMS.map((platform) => ({
        platform,
        scheduledTime: scheduledTimeStr,
        postId: `fallback-${platform}-${Date.now()}`,
      })),
    };
  }
}
