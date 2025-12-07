import React, { useState, useRef } from 'react';
import { PostDraft, WorkflowConfig } from '../types';
import { generateImageForPost, generatePostContent } from '../services/geminiService';
import { 
  ArrowLeft, 
  RefreshCw, 
  Image as ImageIcon, 
  CheckCircle,
  Hash,
  Wand2,
  Upload,
  Video,
  Play,
  Loader2,
  Type as TypeIcon,
  Sparkles,
  FileVideo,
  Clock
} from 'lucide-react';

interface Props {
  config: WorkflowConfig;
  initialPosts: PostDraft[];
  onBack: () => void;
  onFinish: (posts: PostDraft[]) => void;
}

const WorkflowPlanner: React.FC<Props> = ({ config, initialPosts, onBack, onFinish }) => {
  const [posts, setPosts] = useState<PostDraft[]>(initialPosts);
  const [currentIdx, setCurrentIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentPost = posts[currentIdx];

  const handleGenerateTextDetails = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    
    // Allow generation if Topic exists OR File exists
    if (!post || (!post.topic.trim() && !post.uploadedFileBase64)) {
      alert("Please enter a topic or upload media first.");
      return;
    }

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isGeneratingText: true } : p));

    try {
      const media = post.uploadedFileBase64 && post.uploadedFileMimeType 
        ? { data: post.uploadedFileBase64, mimeType: post.uploadedFileMimeType }
        : undefined;

      // Pass Business Context to Service
      const details = await generatePostContent(
        post.topic, 
        post.platform, 
        { name: config.businessName, description: config.businessDescription },
        media
      );
      
      setPosts(prev => prev.map(p => 
        p.id === postId ? { 
          ...p, 
          type: details.type,
          captionStarter: details.captionStarter,
          generatedCaption: details.generatedCaption,
          hashtags: details.hashtags,
          isGeneratingText: false 
        } : p
      ));
    } catch (e) {
      console.error(e);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isGeneratingText: false } : p));
    }
  };

  const handleGenerateImage = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post || !post.topic.trim()) {
      alert("Please enter a topic first.");
      return;
    }

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isGeneratingImage: true } : p));
    
    const newUrl = await generateImageForPost(post);
    
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, imageUrl: newUrl, mediaType: 'image', isGeneratingImage: false } : p
    ));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, postId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value to allow re-uploading the same file
    e.target.value = '';

    // Create object URL for preview
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video');

    // Read file as Base64 for API
    const reader = new FileReader();
    reader.onloadend = () => {
        const result = reader.result as string;
        // Check if result is valid data URI
        if (!result || !result.includes(',')) return;
        
        const base64String = result.split(',')[1];
        
        setPosts(prev => prev.map(p => 
            p.id === postId ? { 
                ...p, 
                imageUrl: url, 
                mediaType: isVideo ? 'video' : 'image',
                type: isVideo ? 'Reel' : 'Photo Post',
                uploadedFileBase64: base64String,
                uploadedFileMimeType: file.type
            } : p
        ));
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePost = (field: keyof PostDraft, value: any) => {
    setPosts(prev => prev.map((p, idx) => 
      idx === currentIdx ? { ...p, [field]: value } : p
    ));
  };

  const handleNext = () => {
    if (currentIdx < posts.length - 1) {
        setCurrentIdx(c => c + 1);
    } else {
        // Trigger finish when on the last post
        onFinish(posts);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(c => c - 1);
  };

  if (!currentPost) return <div className="p-10 text-center">Loading planner...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-5xl mx-auto shadow-xl bg-white min-h-screen">
      
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-gray-800 transition-colors text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workflow Planner</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              {posts.length} posts • {config.platforms.join(', ')} • {config.businessName}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-orange-600">
              {currentIdx + 1}<span className="text-gray-300 text-2xl">/{posts.length}</span>
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Drafting</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-6 overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-300 ease-out"
            style={{ width: `${((currentIdx + 1) / posts.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        
        {/* Post Meta Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
              <TypeIcon className="w-4 h-4" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Post {currentPost.id}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">{currentPost.platform}</span>
          </div>
          <div className="text-gray-400 text-sm flex items-center gap-2 border px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            {currentPost.scheduledTime ? `Scheduled: ${currentPost.scheduledTime}` : 'Unscheduled'}
          </div>
        </div>

        {/* TOPIC INPUT SECTION */}
        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm space-y-4">
           <div>
             <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2 mb-2">
               <span className="w-2 h-4 bg-orange-500 rounded-full"></span>
               Step 1: Content Input
             </label>
             <div className="flex flex-col md:flex-row gap-3">
               <div className="flex-1 relative">
                 <input 
                   type="text" 
                   value={currentPost.topic}
                   placeholder="Enter a topic..."
                   onChange={(e) => handleUpdatePost('topic', e.target.value)}
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-14 py-4 text-gray-900 font-medium text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-gray-400"
                 />
                 <label 
                   className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-orange-500 hover:border-orange-300 cursor-pointer transition-all shadow-sm"
                   title="Upload Image/Video"
                 >
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(e, currentPost.id)}
                    />
                    <Upload className="w-5 h-5" />
                 </label>
               </div>

               <button 
                 onClick={() => handleGenerateTextDetails(currentPost.id)}
                 disabled={(!currentPost.topic && !currentPost.uploadedFileBase64) || currentPost.isGeneratingText}
                 className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md whitespace-nowrap min-w-[180px]"
               >
                 {currentPost.isGeneratingText ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                 ) : (
                    <Sparkles className="w-5 h-5" />
                 )}
                 {currentPost.uploadedFileBase64 ? 'Analyze Media' : 'Generate'}
               </button>
             </div>
             <p className="text-xs text-gray-400 mt-2 ml-1 flex items-center gap-1">
               {currentPost.uploadedFileBase64 
                  ? <><CheckCircle className="w-3 h-3 text-green-500"/> Media attached! Click 'Analyze Media' to generate captions.</>
                  : "Enter a topic or click the upload icon to attach media."
               }
             </p>
           </div>
        </div>

        {/* Visual Preview Area */}
        <div className="w-full aspect-video sm:aspect-[2/1] bg-gray-100 rounded-2xl overflow-hidden relative group border border-gray-200">
           {currentPost.imageUrl ? (
             <>
                {currentPost.mediaType === 'video' ? (
                    <div className="w-full h-full bg-black flex items-center justify-center relative">
                        <video 
                            src={currentPost.imageUrl} 
                            className="w-full h-full object-contain"
                            controls
                        />
                         <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur-md">
                             <FileVideo className="w-3.5 h-3.5" /> Video Post
                         </div>
                    </div>
                ) : (
                    <div className="w-full h-full relative bg-gray-900">
                        <img 
                            src={currentPost.imageUrl} 
                            alt="Preview" 
                            className="w-full h-full object-contain opacity-100"
                        />
                         <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur-md">
                             <ImageIcon className="w-3.5 h-3.5" /> Photo Post
                         </div>
                    </div>
                )}
                
                <button 
                  onClick={() => {
                      handleUpdatePost('imageUrl', undefined);
                      handleUpdatePost('uploadedFileBase64', undefined);
                      handleUpdatePost('uploadedFileMimeType', undefined);
                  }}
                  className="absolute top-4 right-4 bg-white/90 text-red-500 p-2 rounded-full hover:bg-white shadow-sm transition-transform hover:scale-105"
                  title="Remove content"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
             </>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-slate-50 relative p-6">
                
                {/* AI Loading State */}
                {currentPost.isGeneratingImage ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <Wand2 className="w-10 h-10 mb-2 text-orange-400 animate-spin" />
                        <span className="text-sm font-medium text-orange-500">AI is crafting your image...</span>
                    </div>
                ) : (
                    /* Initial Empty State Options */
                    <div className="text-center w-full max-w-md">
                        {config.contentSource === 'AI Generated' ? (
                            <div className="space-y-4">
                                <div className="mb-4">
                                    <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-20" />
                                    <p className="text-gray-500 text-sm">
                                      {currentPost.topic 
                                        ? `Ready to generate image for "${currentPost.topic}"`
                                        : "Enter a topic above first."}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                  <button 
                                      onClick={() => handleGenerateImage(currentPost.id)}
                                      disabled={!currentPost.topic}
                                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 mx-auto transition-all shadow-lg hover:scale-105"
                                  >
                                      <Wand2 className="w-5 h-5" />
                                      Generate AI Image
                                  </button>
                                  <div className="text-xs text-gray-400 font-medium divider flex items-center gap-2 justify-center my-1">
                                    <span className="h-px w-8 bg-gray-200"></span> OR <span className="h-px w-8 bg-gray-200"></span>
                                  </div>
                                   <label className="cursor-pointer bg-white border border-gray-200 hover:border-orange-500 hover:text-orange-600 text-gray-600 px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
                                      <span className="font-semibold flex items-center gap-2 text-sm"><Upload className="w-4 h-4"/> Upload Media Instead</span>
                                      <input 
                                          type="file" 
                                          className="hidden" 
                                          accept="image/*,video/*"
                                          onChange={(e) => handleFileUpload(e, currentPost.id)}
                                      />
                                  </label>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="mb-4">
                                    <Upload className="w-16 h-16 mx-auto mb-2 opacity-20" />
                                    <p className="text-gray-500 text-sm">Upload your content to schedule.</p>
                                </div>
                                <label className="cursor-pointer bg-white border-2 border-dashed border-orange-200 hover:border-orange-500 text-orange-600 px-8 py-6 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-orange-50">
                                    <span className="font-semibold flex items-center gap-2"><Upload className="w-4 h-4"/> Upload Video or Image</span>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*,video/*"
                                        onChange={(e) => handleFileUpload(e, currentPost.id)}
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                )}
             </div>
           )}
        </div>

        {/* Post Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 space-y-6">
            
            {/* Post Type & Time Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Post Type</label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['Photo Post', 'Reel'].map((type) => (
                        <button
                            key={type}
                            onClick={() => handleUpdatePost('type', type)}
                            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                            currentPost.type === type 
                                ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {type}
                        </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheduled Time</label>
                    <div className="relative">
                        <input 
                            type="time" 
                            value={currentPost.scheduledTime}
                            onChange={(e) => handleUpdatePost('scheduledTime', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-3 py-2 text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* AI Caption */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
                <span>Caption</span>
                <span className="text-orange-500 text-[10px] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">Optimized for engagement</span>
              </label>
              <textarea 
                value={currentPost.generatedCaption}
                onChange={(e) => handleUpdatePost('generatedCaption', e.target.value)}
                rows={5}
                placeholder="Caption will appear here after generation..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 leading-relaxed focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              />
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
               <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hashtags</label>
               </div>
               <div className="flex flex-wrap gap-2">
                 {currentPost.hashtags.length > 0 ? currentPost.hashtags.map((tag, i) => (
                   <span key={i} className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-orange-100 flex items-center">
                     <Hash className="w-3 h-3 mr-0.5 opacity-50" />
                     {tag.replace('#', '')}
                   </span>
                 )) : (
                     <div className="w-full text-gray-400 text-sm italic bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
                       Hashtags will appear here...
                     </div>
                 )}
               </div>
            </div>
          </div>

          {/* Sidebar / Context */}
          <div className="hidden md:block border-l border-gray-100 pl-6 space-y-6">
             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-blue-800 font-semibold text-sm mb-2">Workflow Guide</h4>
                <ul className="text-blue-600 text-xs leading-5 list-disc pl-4 space-y-1">
                  <li>Enter your main topic <strong>OR</strong> upload a file.</li>
                  <li>Click <strong>Analyze & Generate</strong> to let AI watch the video/image and write the caption.</li>
                  <li>Set your preferred <strong>Scheduled Time</strong>.</li>
                  <li>Review and move to the next post.</li>
                </ul>
             </div>
          </div>

        </div>

      </div>

      {/* Footer Nav */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg flex justify-between items-center">
        <button 
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="px-6 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <div className="flex gap-2">
           {posts.map((_, idx) => (
             <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-all ${idx === currentIdx ? 'bg-orange-500 w-4' : 'bg-gray-300'}`} 
             />
           ))}
        </div>

        <button 
          onClick={handleNext}
          className="px-8 py-2.5 rounded-lg font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md transform active:scale-95 transition-all"
        >
          {currentIdx === posts.length - 1 ? 'Finish & Schedule' : 'Next Post'}
        </button>
      </div>

    </div>
  );
};

export default WorkflowPlanner;