/**
 * Step 5 — Video Creation
 * Uses OpenAI to generate a 15-second video script, then ElevenLabs TTS
 * to produce a voiceover. Returns script + placeholder video URL.
 * Falls back gracefully when API keys are absent.
 */

import axios from 'axios';

export interface VideoResult {
  videoUrl: string;
  script: string;
  duration: number; // seconds
}

async function generateScript(keyword: string): Promise<string> {
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You write punchy 15-second video scripts for trending t-shirt products. ' +
          'Keep it under 40 words. Hook → product reveal → call to action. No hashtags in script.',
      },
      {
        role: 'user',
        content: `Write a 15-second TikTok/Reel script for a t-shirt with the theme: "${keyword}"`,
      },
    ],
    max_tokens: 100,
    temperature: 0.8,
  });

  return completion.choices[0]?.message?.content?.trim() ?? `Check out our "${keyword}" tee — limited edition, trending now. Link in bio!`;
}

async function generateVoiceover(script: string): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // default: Bella

  if (!apiKey) return null;

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: script,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
      }
    );

    // In production: upload the audio buffer to S3/Cloudinary and return the URL.
    // For now we acknowledge success and return a placeholder.
    console.log('   ✅ ElevenLabs voiceover generated (buffer received)');
    return 'https://placehold.co/voiceover.mp3';
  } catch (err: any) {
    console.warn(`   ⚠️  ElevenLabs TTS failed: ${err.message}`);
    return null;
  }
}

export async function createVideo(keyword: string): Promise<VideoResult> {
  console.log(`🎬 [Step 5] Creating video for: "${keyword}"...`);

  const openaiKey = process.env.OPENAI_API_KEY;

  let script: string;
  if (!openaiKey) {
    console.warn('   ⚠️  OPENAI_API_KEY not set — using placeholder script');
    script = `This "${keyword}" tee is going viral. Limited edition. Grab yours before it's gone — link in bio!`;
  } else {
    try {
      script = await generateScript(keyword);
      console.log(`   ✅ Script generated: "${script.substring(0, 60)}..."`);
    } catch (err: any) {
      console.error(`   ❌ Script generation failed: ${err.message}`);
      script = `This "${keyword}" tee is going viral. Limited edition. Grab yours before it's gone — link in bio!`;
    }
  }

  const voiceoverUrl = await generateVoiceover(script);

  const videoUrl = voiceoverUrl
    ? voiceoverUrl
    : `https://placehold.co/1080x1920/1a1a2e/ffffff?text=${encodeURIComponent(keyword)}`;

  console.log(`   ✅ Video asset ready`);

  return {
    videoUrl,
    script,
    duration: 15,
  };
}
