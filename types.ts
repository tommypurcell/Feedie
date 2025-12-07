export type Platform = 'Instagram' | 'Tiktok' | 'Threads' | 'YouTube Shorts';
export type WorkflowType = 'Plan Posts';
export type ContentSource = 'AI Generated' | 'Upload';
export type PostType = 'Photo Post' | 'Reel' | 'Carousel';

export interface WorkflowConfig {
  workflowType: WorkflowType;
  postCount: number;
  platforms: Platform[];
  contentSource: ContentSource;
  businessName: string;
  businessDescription: string;
}

export interface PostDraft {
  id: number;
  platform: Platform;
  topic: string;
  type: PostType;
  captionStarter: string;
  generatedCaption: string;
  hashtags: string[];
  imageUrl?: string; // Used for preview URL (blob or base64)
  mediaType?: 'image' | 'video';
  uploadedFileBase64?: string; // Raw base64 data for AI API
  uploadedFileMimeType?: string; // Mime type for AI API
  isGeneratingImage: boolean;
  isGeneratingText?: boolean;
  scheduledTime: string;
}

export interface GenerationStatus {
  isGenerating: boolean;
  message: string;
}