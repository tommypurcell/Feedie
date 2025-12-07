import React, { useState } from 'react';
import { WorkflowConfig, Platform, ContentSource } from '../types';
import { 
  Sparkles, 
  Upload,
  Zap,
  X,
  Building2,
  Settings,
  ChevronRight
} from 'lucide-react';

interface Props {
  onStart: (config: WorkflowConfig) => void;
}

const WorkflowConfigModal: React.FC<Props> = ({ onStart }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'strategy'>('profile');
  
  // Strategy State
  const [postCount, setPostCount] = useState<number>(3);
  const [platforms, setPlatforms] = useState<Platform[]>(['Instagram']);
  const [contentSource, setContentSource] = useState<ContentSource>('AI Generated');

  // Business Profile State
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');

  const togglePlatform = (p: Platform) => {
    setPlatforms(prev => 
      prev.includes(p) 
        ? prev.filter(item => item !== p)
        : [...prev, p]
    );
  };

  const handleStart = () => {
    if (!businessName.trim()) {
        alert("Please enter your business name.");
        setActiveTab('profile');
        return;
    }
    onStart({
      workflowType: 'Plan Posts',
      postCount,
      platforms: platforms.length > 0 ? platforms : ['Instagram'], // Fallback
      contentSource,
      businessName,
      businessDescription
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-orange-600 p-6 flex justify-between items-start text-white">
          <div className="flex gap-4">
            <div className="p-2 bg-white/20 rounded-lg h-10 w-10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">New Workflow</h2>
              <p className="text-orange-100 text-sm opacity-90">Setup your content generation agent</p>
            </div>
          </div>
          <button className="text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
            <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'profile' 
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
                <Building2 className="w-4 h-4" /> 1. Business Profile
            </button>
            <button 
                onClick={() => setActiveTab('strategy')}
                className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'strategy' 
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
                <Settings className="w-4 h-4" /> 2. Content Strategy
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          
          {activeTab === 'profile' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
                    <input 
                        type="text" 
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g., Luxe Bakery, TechStart Solutions"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Business Description</label>
                    <textarea 
                        value={businessDescription}
                        onChange={(e) => setBusinessDescription(e.target.value)}
                        placeholder="Describe what your business does, your target audience, and your brand voice..."
                        rows={5}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-2">The AI will use this to tailor captions and hashtags to your brand.</p>
                </div>
             </div>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Post Count */}
                <div>
                    <h3 className="text-sm font-semibold bg-white text-gray-800 mb-2">Post Quantity</h3>
                    <input 
                    type="number" 
                    min={1}
                    max={10}
                    value={postCount}
                    onChange={(e) => setPostCount(parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                </div>

                {/* Platforms */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Target Platforms</h3>
                    <div className="flex gap-3 flex-wrap">
                    {(['Instagram', 'Tiktok', 'Threads', 'YouTube Shorts'] as Platform[]).map(p => (
                        <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg border font-medium transition-all ${
                            platforms.includes(p)
                            ? 'border-orange-500 text-orange-600 bg-orange-50 ring-1 ring-orange-500'
                            : 'border-gray-200 text-gray-600 hover:border-orange-300'
                        }`}
                        >
                        {p}
                        </button>
                    ))}
                    </div>
                </div>

                {/* Content Source */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Content Source</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                        onClick={() => setContentSource('AI Generated')}
                        className={`cursor-pointer p-4 rounded-xl border flex items-center gap-4 transition-all ${
                        contentSource === 'AI Generated' 
                            ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                        <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                        <div className="font-semibold text-gray-900">AI Generated</div>
                        <div className="text-xs text-gray-500">Create with AI</div>
                        </div>
                    </div>

                    <div 
                        onClick={() => setContentSource('Upload')}
                        className={`cursor-pointer p-4 rounded-xl border flex items-center gap-4 transition-all ${
                        contentSource === 'Upload' 
                            ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                        <Upload className="w-5 h-5" />
                        </div>
                        <div>
                        <div className="font-semibold text-gray-900">Upload</div>
                        <div className="text-xs text-gray-500">Use your files</div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50">
          <button className="text-gray-500 font-medium hover:text-gray-700">Cancel</button>
          
          {activeTab === 'profile' ? (
             <button 
                onClick={() => setActiveTab('strategy')}
                className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
             >
                Next <ChevronRight className="w-4 h-4" />
             </button>
          ) : (
            <button 
                onClick={handleStart}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md active:transform active:scale-95"
            >
                <Zap className="w-4 h-4 fill-current" />
                Start Workflow
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowConfigModal;