import React, { useState, useEffect, useRef } from 'react';
import { PostDraft, Platform } from '../types';
import { 
  CheckCircle, 
  MessageCircle, 
  Heart, 
  Send, 
  Terminal, 
  Loader2, 
  Play,
  Share2,
  Bookmark,
  MoreHorizontal,
  Battery,
  Wifi,
  Signal,
  Instagram,
  Repeat,
  User,
  MessageSquare,
  Activity,
  Box,
  Music2,
  Search,
  Plus
} from 'lucide-react';

interface Props {
  posts: PostDraft[];
  onReset: () => void;
}

interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'success' | 'action' | 'dm';
}

interface ChatMessage {
  id: string;
  text: string;
  isAgent: boolean;
  timestamp: Date;
}

interface ChatThread {
  id: string;
  username: string;
  userHandle: string;
  avatarColor: string;
  platform: Platform;
  messages: ChatMessage[];
  isTyping: boolean;
  lastUpdated: number;
}

interface PostEngagement {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

const AgentSimulation: React.FC<Props> = ({ posts, onReset }) => {
  // --- STATE ---
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [conversations, setConversations] = useState<ChatThread[]>([]);
  const [stats, setStats] = useState({
    postsPublished: 0,
    dmsReplied: 0
  });
  
  // Real-time engagement stats per post
  const [postStats, setPostStats] = useState<Record<number, PostEngagement>>({});

  const [currentTask, setCurrentTask] = useState<string>('Initializing Agent...');
  const [leftPanelTab, setLeftPanelTab] = useState<'inbox' | 'terminal'>('inbox');

  // Platform Management
  const distinctPlatforms = Array.from(new Set(posts.map(p => p.platform)));
  const [activePlatform, setActivePlatform] = useState<Platform>(distinctPlatforms[0] || 'Instagram');
  
  // Ensure active platform is valid
  useEffect(() => {
    if (!distinctPlatforms.includes(activePlatform) && distinctPlatforms.length > 0) {
      setActivePlatform(distinctPlatforms[0]);
    }
  }, [distinctPlatforms, activePlatform]);

  const feedPosts = posts.filter(p => p.platform === activePlatform);
  const filteredConversations = conversations.filter(c => c.platform === activePlatform);
  const isTikTok = activePlatform === 'Tiktok';

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // --- LOGIC ---

  // 1. Initialize Post Stats & Run Engagement Ticker
  useEffect(() => {
    // Initialize stats for all posts
    const initial: Record<number, PostEngagement> = {};
    posts.forEach(p => {
        initial[p.id] = { likes: 0, comments: 0, shares: 0, saves: 0 };
    });
    setPostStats(initial);

    // Fast interval for counter animation
    const ticker = setInterval(() => {
        setPostStats(prev => {
            const next = { ...prev };
            let updated = false;
            
            posts.forEach(post => {
                // Initialize if missing (safety check)
                if (!next[post.id]) next[post.id] = { likes: 0, comments: 0, shares: 0, saves: 0 };

                // Random chance to get engagement on each tick
                if (Math.random() > 0.4) {
                    // Likes grow fastest
                    next[post.id].likes += Math.floor(Math.random() * 5) + 1; 
                    
                    // Comments grow slower
                    if (Math.random() > 0.85) next[post.id].comments += 1;
                    
                    // Shares/Saves grow slowest
                    if (Math.random() > 0.95) next[post.id].shares += 1;
                    if (Math.random() > 0.92) next[post.id].saves += 1;
                    
                    updated = true;
                }
            });
            
            return updated ? next : prev;
        });
    }, 800); // Tick every 800ms

    return () => clearInterval(ticker);
  }, [posts]);

  const totalEngagement = Object.values(postStats).reduce((acc, curr) => acc + curr.likes + curr.comments + curr.shares, 0);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      time: timeString,
      message,
      type
    }].slice(-50));
  };

  const createConversation = () => {
    const users = [
        { name: 'Sarah Jenkins', handle: '@sarah_j', color: 'bg-pink-500' },
        { name: 'Mike Design', handle: '@mike_ux', color: 'bg-blue-500' },
        { name: 'Alex Creator', handle: '@alex_c', color: 'bg-green-500' },
        { name: 'Travel Bug', handle: '@wanderlust', color: 'bg-yellow-500' },
        { name: 'Foodie Daily', handle: '@tasty_eats', color: 'bg-orange-500' }
    ];
    const user = users[Math.floor(Math.random() * users.length)];
    const targetPlatform = distinctPlatforms[Math.floor(Math.random() * distinctPlatforms.length)];
    
    const openers = [
        "Love the new post! 🔥",
        "Where did you get that?",
        "This is exactly what I needed today.",
        "Collaboration?",
        "Can you send me the link?"
    ];
    const opener = openers[Math.floor(Math.random() * openers.length)];

    const threadId = Math.random().toString(36).substr(2, 9);
    
    // Add new conversation
    const newThread: ChatThread = {
        id: threadId,
        username: user.name,
        userHandle: user.handle,
        avatarColor: user.color,
        platform: targetPlatform,
        messages: [{
            id: 'msg-1',
            text: opener,
            isAgent: false,
            timestamp: new Date()
        }],
        isTyping: true, // Agent starts typing immediately
        lastUpdated: Date.now()
    };

    setConversations(prev => [newThread, ...prev].slice(0, 8)); // Keep last 8 threads visible
    addLog(`📩 New DM from ${user.handle} on ${targetPlatform}`, 'dm');

    // Simulate Agent Reply
    setTimeout(() => {
        const replies = [
            "Thanks so much! glad you liked it 🙌",
            "DM sent!",
            "Appreciate the support! ❤️",
            "Let's connect soon.",
            "Check the link in bio!"
        ];
        const reply = replies[Math.floor(Math.random() * replies.length)];

        setConversations(prev => prev.map(t => {
            if (t.id === threadId) {
                return {
                    ...t,
                    isTyping: false,
                    messages: [...t.messages, {
                        id: 'msg-2',
                        text: reply,
                        isAgent: true,
                        timestamp: new Date()
                    }]
                };
            }
            return t;
        }));
        
        setStats(s => ({ ...s, dmsReplied: s.dmsReplied + 1 }));
        addLog(`↩️ Replied to ${user.handle}`, 'action');
    }, 2500);
  };

  useEffect(() => {
    let timeoutIds: NodeJS.Timeout[] = [];

    // Phase 1: Publish Posts
    let delay = 1000;
    posts.forEach((post) => {
      // 1. Preparing
      timeoutIds.push(setTimeout(() => {
        setCurrentTask(`[${post.platform}] Publishing: ${post.topic.substring(0, 15)}...`);
        addLog(`Preparing content for ${post.platform} (ID: ${post.id})...`, 'info');
      }, delay));
      delay += 800;

      // 2. Uploading
      timeoutIds.push(setTimeout(() => {
        addLog(`Uploading media to ${post.platform} servers...`, 'action');
      }, delay));
      delay += 1200;

      // 3. Published
      timeoutIds.push(setTimeout(() => {
        addLog(`✅ Published to ${post.platform}!`, 'success');
        setStats(s => ({ ...s, postsPublished: s.postsPublished + 1 }));
      }, delay));
      delay += 500;
    });

    // Phase 2: Engagement Simulation
    timeoutIds.push(setTimeout(() => {
      setCurrentTask('Monitoring Inbox & Engagement...');
      addLog('All posts live. Listening for interactions...', 'info');
    }, delay));
    
    // Interval for Random Events
    const intervalId = setInterval(() => {
      if (delay <= 0) { 
         // Random Events Logic
         const rand = Math.random();
         if (rand > 0.6) {
             // New DM
             createConversation();
         } else if (rand > 0.3) {
             // Just Log interaction (Numbers handled by other effect)
             const user = ['@gym_rat', '@travel_guru', '@foodie_life'][Math.floor(Math.random() * 3)];
             addLog(`❤️ Liked comment by ${user}`, 'action');
         } else {
            // General Info
            addLog(`📈 Reach growing on ${activePlatform}...`, 'info');
         }
      } else {
        delay -= 2000;
      }
    }, 2500);

    return () => {
      timeoutIds.forEach(clearTimeout);
      clearInterval(intervalId);
    };
  }, [posts]);

  // Brand colors helper
  const getPlatformColor = (p: Platform) => {
    switch (p) {
      case 'Instagram': return 'from-purple-500 to-pink-500';
      case 'Tiktok': return 'from-black to-gray-800';
      case 'Threads': return 'from-black to-gray-900';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const getPlatformIcon = (p: Platform) => {
    switch (p) {
        case 'Instagram': return <Instagram className="w-4 h-4" />;
        case 'Tiktok': return <MessageCircle className="w-4 h-4" />; 
        case 'Threads': return <Repeat className="w-4 h-4" />;
        default: return <Activity className="w-4 h-4" />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center">
      
      {/* --- TOP BAR: Global Controls --- */}
      <div className="w-full bg-gray-800 border-b border-gray-700 sticky top-0 z-20 shadow-md">
         <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Agent Status */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-gray-700">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping absolute top-0 right-0"></div>
                        <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                            <Terminal className="w-4 h-4 text-green-400" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white tracking-wide leading-tight">SOCIAL AGENT</h1>
                        <p className="text-xs text-green-400 font-mono">● Online</p>
                    </div>
                </div>
                <div className="hidden md:block h-8 w-px bg-gray-700"></div>
                <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {currentTask}
                </div>
            </div>

            {/* Platform Switcher */}
            <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-700">
                {distinctPlatforms.map(p => (
                <button
                    key={p}
                    onClick={() => setActivePlatform(p)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                    activePlatform === p 
                        ? `bg-gradient-to-r ${getPlatformColor(p)} text-white shadow-lg` 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                >
                    {getPlatformIcon(p)}
                    {p}
                </button>
                ))}
            </div>

            <button 
                onClick={onReset}
                className="text-xs text-red-400 hover:text-red-300 border border-red-900/50 hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
            >
                Stop Simulation
            </button>
         </div>
      </div>

      <div className="w-full max-w-7xl p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* --- LEFT COLUMN: Intelligence & Stats (7 Cols) --- */}
        <div className="lg:col-span-7 space-y-6">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Posts Live', val: stats.postsPublished, icon: Send, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'DMs Handling', val: stats.dmsReplied, icon: MessageCircle, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                    { label: 'Engagement', val: formatNumber(totalEngagement), icon: Heart, color: 'text-pink-400', bg: 'bg-pink-400/10' }
                ].map((stat, i) => (
                    <div key={i} className="bg-gray-800 border border-gray-700 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-white mb-1">{stat.val}</div>
                            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{stat.label}</div>
                        </div>
                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* INTELLIGENCE PANEL (Inbox/Logs) */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
                {/* Panel Tabs */}
                <div className="flex border-b border-gray-700">
                    <button 
                        onClick={() => setLeftPanelTab('inbox')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                            leftPanelTab === 'inbox' ? 'bg-gray-800 text-white border-b-2 border-blue-500' : 'bg-gray-900/50 text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                        }`}
                    >
                        <MessageSquare className="w-4 h-4" /> Live Inbox
                        {filteredConversations.length > 0 && (
                            <span className="bg-blue-500 text-white text-[10px] px-1.5 rounded-full">{filteredConversations.length}</span>
                        )}
                    </button>
                    <button 
                        onClick={() => setLeftPanelTab('terminal')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                            leftPanelTab === 'terminal' ? 'bg-gray-800 text-white border-b-2 border-green-500' : 'bg-gray-900/50 text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                        }`}
                    >
                        <Terminal className="w-4 h-4" /> System Logs
                    </button>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-hidden relative bg-gray-900/50">
                    
                    {/* VIEW: LIVE INBOX */}
                    {leftPanelTab === 'inbox' && (
                        <div className="h-full overflow-y-auto p-4 space-y-4 scrollbar-thin">
                            {filteredConversations.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                    <MessageSquare className="w-12 h-12 mb-2" />
                                    <p className="text-sm">Waiting for new messages on {activePlatform}...</p>
                                </div>
                            ) : (
                                filteredConversations.map((thread) => (
                                    <div key={thread.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 animate-in slide-in-from-bottom-2 duration-300">
                                        {/* Thread Header */}
                                        <div className="flex justify-between items-start mb-3 border-b border-gray-700/50 pb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full ${thread.avatarColor} flex items-center justify-center text-white font-bold text-xs`}>
                                                    {thread.username.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white flex items-center gap-2">
                                                        {thread.username}
                                                        <span className="text-gray-500 font-normal text-xs">{thread.userHandle}</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                        {getPlatformIcon(thread.platform)} via {thread.platform}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-gray-500">Just now</div>
                                        </div>

                                        {/* Messages Area */}
                                        <div className="space-y-3 pl-4">
                                            {thread.messages.map((msg) => (
                                                <div key={msg.id} className={`flex ${msg.isAgent ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                                                        msg.isAgent 
                                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                                            : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                                    }`}>
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {/* Typing Indicator */}
                                            {thread.isTyping && (
                                                <div className="flex justify-end">
                                                    <div className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-2xl rounded-br-none flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* VIEW: TERMINAL */}
                    {leftPanelTab === 'terminal' && (
                        <div className="h-full p-4 font-mono text-xs overflow-y-auto scrollbar-thin space-y-2 bg-black">
                            {logs.map((log) => (
                                <div key={log.id} className="flex gap-3 text-gray-300">
                                    <span className="text-gray-600 shrink-0">[{log.time}]</span>
                                    <span className={`
                                    ${log.type === 'success' ? 'text-green-400' : ''}
                                    ${log.type === 'info' ? 'text-blue-300' : ''}
                                    ${log.type === 'action' ? 'text-yellow-300' : ''}
                                    ${log.type === 'dm' ? 'text-pink-400' : ''}
                                    `}>
                                    {log.type === 'success' && '✔ '}
                                    {log.type === 'action' && '➜ '}
                                    {log.message}
                                    </span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    )}

                </div>
            </div>
        </div>

        {/* --- RIGHT COLUMN: Phone Preview (5 Cols) --- */}
        <div className="lg:col-span-5 flex justify-center sticky top-24">
            <div className="relative w-[340px] h-[680px] bg-black rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden flex flex-col">
                {/* Status Bar */}
                <div className="h-8 bg-black w-full flex justify-between items-center px-6 pt-2 text-white text-[10px] z-10">
                    <span>9:41</span>
                    <div className="flex gap-1.5 items-center">
                        <Signal className="w-3 h-3" />
                        <Wifi className="w-3 h-3" />
                        <Battery className="w-4 h-4" />
                    </div>
                </div>

                {/* App Header */}
                {isTikTok ? (
                   <div className="absolute top-8 left-0 w-full z-20 text-white font-bold text-sm flex justify-center gap-4 pt-4 drop-shadow-md">
                     <span className="opacity-60 cursor-pointer">Following</span>
                     <span className="border-b-2 border-white pb-1 cursor-pointer">For You</span>
                     <div className="absolute right-6 top-4">
                       <Search className="w-5 h-5" />
                     </div>
                   </div>
                ) : (
                  <div className="h-14 bg-black/90 backdrop-blur-md text-white flex items-center justify-between px-4 border-b border-gray-800 sticky top-0 z-10">
                      <span className="font-bold text-lg tracking-tight capitalize">
                      {activePlatform}
                      </span>
                      <div className="flex gap-4">
                      <Heart className="w-6 h-6" />
                      <MessageCircle className="w-6 h-6" />
                      </div>
                  </div>
                )}

                {/* Feed Content */}
                <div className={`flex-1 overflow-y-auto scrollbar-hide bg-black text-white ${isTikTok ? 'snap-y snap-mandatory' : 'pb-20'}`}>
                    {feedPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
                        <Box className="w-12 h-12 mb-4 opacity-50" />
                        <p>No content scheduled for {activePlatform}</p>
                    </div>
                    ) : (
                    feedPosts.map((post) => {
                        const metrics = postStats[post.id] || { likes: 0, comments: 0, shares: 0, saves: 0 };
                        
                        // TIKTOK LAYOUT
                        if (isTikTok) {
                            return (
                                <div key={post.id} className="relative w-full h-full snap-start bg-gray-900 border-b border-gray-800">
                                    {/* Full Screen Media */}
                                    <div className="absolute inset-0 bg-gray-900">
                                        {post.mediaType === 'video' ? (
                                            <video src={post.imageUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                                        ) : (
                                            <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
                                        )}
                                        {/* Gradient overlay for readability */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
                                    </div>

                                    {/* Right Sidebar Actions */}
                                    <div className="absolute right-2 bottom-20 flex flex-col items-center gap-6 text-white z-10">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-white p-0.5 border border-white overflow-hidden">
                                                <div className="w-full h-full bg-gradient-to-tr from-purple-500 to-orange-500 flex items-center justify-center text-[8px] font-bold">AI</div>
                                            </div>
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 rounded-full p-0.5">
                                                <Plus className="w-3 h-3 text-white" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center gap-1">
                                            <Heart className={`w-8 h-8 drop-shadow-lg ${metrics.likes > 0 ? 'fill-red-500 text-red-500' : 'fill-white/10 text-white'}`} />
                                            <span className="text-xs font-bold drop-shadow-md">{formatNumber(metrics.likes)}</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-1">
                                            <MessageCircle className="w-8 h-8 fill-white/10 text-white drop-shadow-lg" />
                                            <span className="text-xs font-bold drop-shadow-md">{formatNumber(metrics.comments)}</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-1">
                                            <Bookmark className="w-8 h-8 fill-white/10 text-white drop-shadow-lg" />
                                            <span className="text-xs font-bold drop-shadow-md">{formatNumber(metrics.saves)}</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-1">
                                            <Share2 className="w-8 h-8 fill-white/10 text-white drop-shadow-lg" />
                                            <span className="text-xs font-bold drop-shadow-md">{formatNumber(metrics.shares)}</span>
                                        </div>
                                        
                                        <div className="mt-2 animate-spin-slow rounded-full bg-gray-800 p-2 border border-gray-600">
                                           <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                                             <Music2 className="w-3 h-3" />
                                           </div>
                                        </div>
                                    </div>

                                    {/* Bottom Info Area */}
                                    <div className="absolute left-4 bottom-4 right-16 text-white z-10 text-left pb-16">
                                        <div className="font-bold text-md mb-2 drop-shadow-md">@social_agent_ai</div>
                                        <div className="text-sm opacity-90 leading-tight drop-shadow-md mb-3 line-clamp-2">
                                            {post.generatedCaption} {post.hashtags.map(h => h).join(' ')}
                                        </div>
                                        <div className="text-xs font-bold flex items-center gap-2 mb-2">
                                            <Music2 className="w-3 h-3" /> 
                                            <div className="w-32 overflow-hidden whitespace-nowrap">
                                                <span className="animate-marquee inline-block">Original Sound - Social Agent AI • Original Sound</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // STANDARD LAYOUT (Instagram/Threads)
                        return (
                            <div key={post.id} className="mb-6 border-b border-gray-800 pb-4">
                            {/* Post Header */}
                            <div className="flex items-center justify-between px-3 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold">
                                        AI
                                    </div>
                                    </div>
                                    <span className="text-sm font-semibold">social_agent_ai</span>
                                </div>
                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                            </div>

                            {/* Media */}
                            <div className="w-full bg-gray-900 aspect-square flex items-center justify-center overflow-hidden">
                                {post.mediaType === 'video' ? (
                                    <div className="relative w-full h-full bg-black">
                                        <video src={post.imageUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                                        <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full">
                                            <Play className="w-3 h-3 fill-white text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover" />
                                )}
                            </div>

                            {/* Actions */}
                            <div className="px-3 pt-3 flex justify-between items-center">
                                <div className="flex gap-4">
                                    <Heart className={`w-6 h-6 ${metrics.likes > 0 ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                                    <MessageCircle className="w-6 h-6 text-white" />
                                    <Send className="w-6 h-6 text-white -rotate-45 mb-1" />
                                </div>
                                <Bookmark className="w-6 h-6 text-white" />
                            </div>

                            {/* Likes */}
                            <div className="px-3 py-2 text-sm font-semibold">
                                {formatNumber(metrics.likes)} likes
                            </div>

                            {/* Caption */}
                            <div className="px-3 text-sm">
                                <span className="font-semibold mr-2">social_agent_ai</span>
                                <span className="text-gray-100">{post.generatedCaption}</span>
                                <div className="mt-1 text-blue-400">
                                    {post.hashtags.map((h, i) => (
                                    <span key={i} className="mr-1">{h.startsWith('#') ? h : `#${h}`}</span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="px-3 mt-2 text-xs text-gray-500 uppercase">
                            {post.scheduledTime ? `Scheduled for ${post.scheduledTime}` : 'Just now'}
                            </div>
                            </div>
                        )
                    })
                    )}
                    
                    {/* End of Feed Indicator (Non-TikTok only) */}
                    {feedPosts.length > 0 && !isTikTok && (
                        <div className="py-10 text-center text-gray-600 text-xs flex flex-col items-center">
                            <CheckCircle className="w-6 h-6 mb-2 text-gray-700" />
                            You're all caught up
                        </div>
                    )}
                </div>

                {/* Bottom Nav Bar */}
                <div className={`h-16 border-t flex justify-around items-center px-2 z-10 ${isTikTok ? 'bg-black border-gray-800 text-white' : 'bg-black border-gray-800'}`}>
                    {isTikTok ? (
                       <>
                         <div className="p-2 flex flex-col items-center gap-1 cursor-pointer">
                           <div className="w-5 h-5 bg-white/10 rounded-sm flex items-center justify-center"><Box className="w-3 h-3 text-white" /></div>
                           <span className="text-[9px] font-bold">Home</span>
                         </div>
                         <div className="p-2 flex flex-col items-center gap-1 opacity-60 cursor-pointer">
                           <div className="w-5 h-5 border border-white/40 rounded-sm" />
                           <span className="text-[9px]">Friends</span>
                         </div>
                         <div className="p-0 mx-2 cursor-pointer transform hover:scale-105 transition-transform">
                             {/* Custom TikTok Plus Button */}
                            <div className="w-11 h-7 bg-white rounded-lg relative flex items-center justify-center">
                                <div className="absolute left-0.5 w-full h-full bg-cyan-400 rounded-lg -z-10 translate-x-[-2px]"></div>
                                <div className="absolute right-0.5 w-full h-full bg-red-500 rounded-lg -z-10 translate-x-[2px]"></div>
                                <div className="w-full h-full bg-white rounded-lg flex items-center justify-center z-10">
                                    <Plus className="w-4 h-4 text-black font-bold" />
                                </div>
                            </div>
                         </div>
                         <div className="p-2 flex flex-col items-center gap-1 opacity-60 cursor-pointer">
                           <MessageCircle className="w-5 h-5" />
                           <span className="text-[9px]">Inbox</span>
                         </div>
                         <div className="p-2 flex flex-col items-center gap-1 opacity-60 cursor-pointer">
                           <User className="w-5 h-5" />
                           <span className="text-[9px]">Profile</span>
                         </div>
                       </>
                    ) : (
                       // Instagram Bottom Nav
                       <>
                        <div className="p-2"><div className="w-6 h-6 rounded bg-gray-600" /></div>
                        <div className="p-2"><div className="w-6 h-6 rounded bg-gray-800" /></div>
                        <div className="p-2"><div className="w-8 h-8 rounded-lg border-2 border-white bg-black" /></div>
                        <div className="p-2"><div className="w-6 h-6 rounded bg-gray-800" /></div>
                        <div className="p-2"><div className="w-6 h-6 rounded-full bg-gray-600" /></div>
                       </>
                    )}
                </div>
                
                {/* Home Indicator */}
                <div className="h-1 w-1/3 bg-gray-700 rounded-full mx-auto mb-2 opacity-50 absolute bottom-1 left-1/3 pointer-events-none z-20"></div>
            </div>
        </div>

      </div>

    </div>
  );
};

export default AgentSimulation;