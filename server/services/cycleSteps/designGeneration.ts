/**
 * Step 2 — Design Generation
 * Calls OpenAI DALL-E 3 to generate a product design image, then
 * optionally removes the background via Remove.bg.
 * Falls back to placeholder URLs when API keys are absent.
 */

import axios from 'axios';

export interface DesignResult {
  designUrl: string;
  removedBgUrl: string;
}

async function generateWithDallE(keyword: string): Promise<string> {
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt =
    `Bold, minimalist typography t-shirt design for the phrase "${keyword}". ` +
    `White background, high contrast, print-ready, no people, no faces. ` +
    `Clean graphic design style.`;

  const response = await client.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
    response_format: 'url',
  });

  const url = response.data[0]?.url;
  if (!url) throw new Error('DALL-E 3 returned no image URL');
  return url;
}

async function removeBackground(imageUrl: string): Promise<string> {
  const apiKey = process.env.REMOVEBG_API_KEY;
  if (!apiKey) {
    console.warn('   ⚠️  REMOVEBG_API_KEY not set — skipping background removal');
    return imageUrl;
  }

  const response = await axios.post(
    'https://api.remove.bg/v1.0/removebg',
    { image_url: imageUrl, size: 'auto' },
    {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
    }
  );

  // In production you'd upload the buffer to S3/Cloudinary and return the URL.
  // For now we return the original URL since we can't persist the binary here.
  console.log('   ✅ Background removed (buffer received, returning original URL for now)');
  return imageUrl;
}

export async function generateDesign(keyword: string): Promise<DesignResult> {
  console.log(`🎨 [Step 2] Generating design for keyword: "${keyword}"...`);

  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    console.warn('   ⚠️  OPENAI_API_KEY not set — using placeholder design');
    const placeholder = `https://placehold.co/1024x1024/1a1a2e/ffffff?text=${encodeURIComponent(keyword)}`;
    return { designUrl: placeholder, removedBgUrl: placeholder };
  }

  try {
    const designUrl = await generateWithDallE(keyword);
    console.log(`   ✅ Design generated: ${designUrl.substring(0, 60)}...`);

    const removedBgUrl = await removeBackground(designUrl);

    return { designUrl, removedBgUrl };
  } catch (err: any) {
    console.error(`   ❌ Design generation failed: ${err.message}`);
    const placeholder = `https://placehold.co/1024x1024/1a1a2e/ffffff?text=${encodeURIComponent(keyword)}`;
    return { designUrl: placeholder, removedBgUrl: placeholder };
  }
}
