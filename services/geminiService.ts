import { GoogleGenAI, Type } from "@google/genai";
import { WorkflowConfig, PostDraft, Platform } from "../types";

// Initialize the client
// NOTE: In a real app, ensure process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generatePostContent = async (
  topic: string, 
  platform: Platform, 
  media?: { data: string, mimeType: string }
) => {
  const model = "gemini-2.5-flash";

  const promptText = `
    You are an expert Social Media Manager for ${platform}.
    ${topic ? `The user has provided the topic/context: "${topic}".` : 'Analyze the provided media to create a post.'}
    ${media ? 'Please analyze the attached media (image or video) deeply to create relevant content.' : ''}
    
    Please generate:
    1. A suggested post type (Photo Post or Reel). If a video is provided, strictly select 'Reel'.
    2. A short visual description or context (captionStarter). If media is provided, describe what is seen in the media.
    3. An engaging, trend-aware caption with emojis that matches the content.
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
  const model = "gemini-2.5-flash";
  // ... existing implementation if needed for other flows ...
  return []; 
};

export const generateImageForPost = async (post: PostDraft): Promise<string> => {
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