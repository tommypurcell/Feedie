import React, { useState } from 'react';
import WorkflowConfigModal from './components/WorkflowConfigModal';
import WorkflowPlanner from './components/WorkflowPlanner';
import AgentSimulation from './components/AgentSimulation';
import { WorkflowConfig, PostDraft, GenerationStatus, Platform } from './types';
import { Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'config' | 'planning' | 'simulation'>('config');
  const [config, setConfig] = useState<WorkflowConfig | null>(null);
  const [posts, setPosts] = useState<PostDraft[]>([]);

  const createEmptyDrafts = (config: WorkflowConfig): PostDraft[] => {
    return Array.from({ length: config.postCount }).map((_, idx) => ({
      id: idx + 1,
      platform: config.platforms[0] || 'Instagram',
      topic: '',
      type: 'Photo Post',
      captionStarter: '',
      generatedCaption: '',
      hashtags: [],
      isGeneratingImage: false,
      isGeneratingText: false,
      mediaType: 'image',
      scheduledTime: '10:00'
    }));
  };

  const handleStartWorkflow = (newConfig: WorkflowConfig) => {
    setConfig(newConfig);
    // Initialize empty drafts for both modes so user can input topics
    const emptyPosts = createEmptyDrafts(newConfig);
    setPosts(emptyPosts);
    setCurrentStep('planning');
  };

  const handleFinishPlanning = (finalPosts: PostDraft[]) => {
    // Cross-posting logic: Ensure content exists for all selected platforms
    if (config && config.platforms.length > 0) {
        const expandedPosts: PostDraft[] = [];
        let nextId = Math.max(...finalPosts.map(p => p.id), 0) + 1;

        finalPosts.forEach(originalPost => {
            // 1. Add the original post (usually for the primary platform)
            expandedPosts.push(originalPost);

            // 2. Clone for other platforms in the config
            config.platforms.forEach(targetPlatform => {
                if (targetPlatform !== originalPost.platform) {
                    expandedPosts.push({
                        ...originalPost,
                        id: nextId++,
                        platform: targetPlatform,
                        // Adapt type for video-centric platforms
                        type: (targetPlatform === 'Tiktok' || targetPlatform === 'YouTube Shorts') ? 'Reel' : originalPost.type
                    });
                }
            });
        });
        setPosts(expandedPosts);
    } else {
        setPosts(finalPosts);
    }
    
    setCurrentStep('simulation');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-800 font-sans">
      {currentStep === 'config' && (
        <WorkflowConfigModal onStart={handleStartWorkflow} />
      )}
      
      {currentStep === 'planning' && config && (
        <WorkflowPlanner 
          config={config} 
          initialPosts={posts} 
          onBack={() => setCurrentStep('config')}
          onFinish={handleFinishPlanning}
        />
      )}

      {currentStep === 'simulation' && config && (
        <AgentSimulation 
          config={config}
          posts={posts} 
          onReset={() => setCurrentStep('config')} 
        />
      )}
    </div>
  );
};

export default App;