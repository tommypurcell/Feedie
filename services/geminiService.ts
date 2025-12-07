import { GoogleGenAI, Type } from "@google/genai";
import { WorkflowConfig, PostDraft, Platform } from "../types";

export const generatePostContent = async (
  topic: string, 
  platform: Platform, 
  businessContext: { name: string, description: string },
  media?: { data: string, mimeType: string }
) => {
  // Initialize client per request to ensure latest key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const model = "gemini-2.5-flash";

  const promptText = `
    You are an expert Social Media Manager for ${platform} representing the business "${businessContext.name}".
    
    Business Description:
    ${businessContext.description}

    Task:
    ${topic ? `The user has provided the topic/context: "${topic}".` : 'Analyze the provided media to create a post.'}
    ${media ? 'Please analyze the attached media (image or video) deeply to create relevant content that aligns with the business brand.' : ''}
    
    Please generate:
    1. A suggested post type (Photo Post or Reel). If a video is provided, strictly select 'Reel'.
    2. A short visual description or context (captionStarter). If media is provided, describe what is seen in the media.
    3. An engaging, trend-aware caption with emojis that matches the content and the business voice.
    4. A list of 5-10 relevant hashtags.
    
    Return response in strictly valid JSON.
  `;

  const parts: any[] = [{ text: promptText }];

  if (media) {
    // Add media as the first part for better context understanding
    parts.unshift({
      inlineData: {
        data: media.data,
        mimeType: media.mimeType
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['Photo Post', 'Reel'] },
            captionStarter: { type: Type.STRING },
            generatedCaption: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['type', 'captionStarter', 'generatedCaption', 'hashtags']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result;

  } catch (error) {
    console.error("Error generating post content:", error);
    throw error;
  }
};

// Kept for reference, but currently bypassed in App.tsx
export const generatePostPlan = async (config: WorkflowConfig): Promise<PostDraft[]> => {
  return []; 
};

export const generateImageForPost = async (post: PostDraft): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    // Using gemini-2.5-flash-image for general image generation as per guidelines
    const model = 'gemini-2.5-flash-image';
    
    // Fallback to topic if captionStarter is empty
    const context = post.captionStarter || post.topic;
    
    const prompt = `
      Create a high-quality, aesthetic social media image for Instagram/TikTok.
      Topic: ${post.topic}.
      Context: ${context}.
      Style: Professional, bright, engaging, trending aesthetic. 
      Aspect Ratio: 1:1.
      No text on the image.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {}
    });

    // Parse response for image data
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Error generating image:", error);
    return `https://picsum.photos/800/800?random=${post.id}`;
  }
};

export const generateVideoForPost = async (post: PostDraft): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const model = 'veo-3.1-fast-generate-preview';
    const context = post.captionStarter || post.topic;
    
    // Create a descriptive prompt for Veo
    const prompt = `
      Create a high quality vertical video for social media (Reels/TikTok).
      Subject: ${post.topic}.
      Details: ${context}.
      Style: Cinematic, professional, trending, good lighting, high resolution, photorealistic.
      Aspect Ratio: 9:16 (Vertical).
    `;

    let operation = await ai.models.generateVideos({
      model: model,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("No video URI returned from Veo");

    // Fetch the actual video content using the API key
    const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    
    // Create a local object URL for the video blob
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};