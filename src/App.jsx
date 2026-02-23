import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Search, Bell, Grid, User, LogIn, LogOut, 
  ThumbsUp, MessageSquare, Share2, MoreVertical, 
  Home, Compass, LayoutDashboard, Clock, Upload, X,
  Github, Code, Lock, Loader2, AlertTriangle, PenTool,
  Laptop, ExternalLink, Smile, Trash2, Image as ImageIcon, FileCheck,
  Eye, CheckCircle, Zap, Award, HelpCircle, Link as LinkIcon,
  ChevronLeft, BookOpen, Layers, Edit3, Eye as EyeIcon, RefreshCw,
  Moon, Sun, Megaphone, ArrowRight, Activity, Sparkles, Send
} from 'lucide-react';

// --- 配置区域 (Bmob) ---
const BMOB_APP_ID = "469b0e80e238277a812f77075df7e2e8"; 
const BMOB_REST_API_KEY = "ab10e715d2bc9ec35256d5e0ddbdb74a"; 
const BMOB_SECRET_KEY = "9fa1ba7ef19ef189";          
const BMOB_API_KEY = "0713231xX";                    
const BMOB_MASTER_KEY = "dd7f68bab0a99345940dd336396b9541"; 

// --- 权限配置 ---
const ADMIN_USERNAME = "cailixian2@gmail.com"; 

// --- 通用样式常量 (Quoti.ai Monochromatic Style) ---
const INPUT_STYLES = "w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 focus:border-zinc-900 dark:focus:border-white transition-all text-sm shadow-[0_2px_10px_rgb(0,0,0,0.02)]";
const BTN_PRIMARY = "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3.5 rounded-full font-medium hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/10 dark:hover:shadow-white/10 active:translate-y-0 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2";
const BTN_OUTLINE = "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white px-8 py-3.5 rounded-full font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 active:translate-y-0 active:scale-95 flex items-center justify-center gap-2";

// --- 错误处理工具 ---
const getBmobErrorMsg = (err) => {
  const errorStr = JSON.stringify(err);
  if (errorStr.includes("safeToken") || (err.error && err.error.includes("safeToken"))) return "API_SAFE_TOKEN_MISSING";
  if (errorStr.includes("MasterKey") || (err.error && err.error.includes("MasterKey"))) return "MASTER_KEY_MISSING";
  if (errorStr.includes("502")) return "SERVER_GATEWAY_ERROR (502)";
  return err.error || errorStr;
};

// --- 内置轻量级 Markdown 解析器 ---
const parseMarkdownSafe = (markdownText) => {
  if (!markdownText) return '';
  let html = markdownText;
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(/```([\s\S]*?)```/gm, '<pre><code>$1</code></pre>');
  const tableRegex = /((?:\|.*\|\r?\n)+)/g;
  html = html.replace(tableRegex, (match) => {
    if (!match.includes('|')) return match;
    const rows = match.trim().split('\n').map(row => row.trim());
    if (rows.length < 2) return match;
    const isTable = rows[1].includes('---');
    if (!isTable) return match;
    let tableHtml = '<div class="table-container rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 my-4"><table class="w-full text-sm">';
    const headers = rows[0].split('|').filter(cell => cell.trim() !== '');
    tableHtml += '<thead class="bg-zinc-50 dark:bg-zinc-900"><tr>' + headers.map(h => `<th class="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">${h.trim()}</th>`).join('') + '</tr></thead>';
    tableHtml += '<tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">';
    for (let i = 2; i < rows.length; i++) {
        const cells = rows[i].split('|').filter(cell => cell.trim() !== '');
        if (cells.length > 0) {
            tableHtml += '<tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">' + cells.map(c => `<td class="px-4 py-3 text-zinc-700 dark:text-zinc-300">${c.trim()}</td>`).join('') + '</tr>';
        }
    }
    tableHtml += '</tbody></table></div>';
    return tableHtml;
  });
  html = html
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/!\[([^\]]+)\]\(([^\)]+)\)/gim, '<img src="$2" alt="$1" class="md-img rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 my-4" />');
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="font-medium underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4 hover:decoration-zinc-900 dark:hover:decoration-white transition-colors">$1</a>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-zinc-900 dark:text-white">$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/^\s*-\s+(.*$)/gim, '<ul class="list-disc pl-5 my-2 space-y-1 text-zinc-600 dark:text-zinc-300"><li>$1</li></ul>');
  html = html.replace(/<\/ul>\s*<ul class="list-disc pl-5 my-2 space-y-1 text-zinc-600 dark:text-zinc-300">/gim, '');
  html = html.replace(/\n/gim, '<br />');
  html = html.replace(/<\/h(\d)><br \/>/gim, '</h$1>');
  html = html.replace(/<\/pre><br \/>/gim, '</pre>');
  html = html.replace(/<\/table><\/div><br \/>/gim, '</table></div>');
  return html;
};

// --- 子组件：高定感开场加载动画 (手动滑动版) ---
function IntroScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [isHiding, setIsHiding] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const runIntro = async () => {
      await new Promise(r => setTimeout(r, 300)); // 初始缓冲
      setStep(1); // 词汇 1
      await new Promise(r => setTimeout(r, 700));
      setStep(2); // 词汇 2
      await new Promise(r => setTimeout(r, 700));
      setStep(3); // 品牌揭示
      await new Promise(r => setTimeout(r, 1200));
      setCanScroll(true); // 动画播放完毕，允许手动滑动解锁
    };
    runIntro();
  }, []);

  useEffect(() => {
    const handleScroll = (e) => {
      if (canScroll && !isHiding) {
        // 检测向下滚动 (鼠标滚轮) 或触摸滑动
        if (e.deltaY > 0 || e.type === 'touchmove') {
          setIsHiding(true);
          setTimeout(() => onComplete(), 800); // 等待退场动画结束
        }
      }
    };
    window.addEventListener('wheel', handleScroll);
    window.addEventListener('touchmove', handleScroll);
    return () => {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
    };
  }, [canScroll, isHiding, onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09090b] text-white transition-transform duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${isHiding ? '-translate-y-full' : 'translate-y-0'}`}>
      {/* 高定网格与噪点背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b] opacity-80"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* 动态排版遮罩层 */}
        <div className="h-20 sm:h-32 overflow-hidden flex items-center justify-center relative w-[320px] sm:w-[600px]">
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${step === 1 ? 'translate-y-0 opacity-100' : step > 1 ? '-translate-y-full opacity-0 scale-95' : 'translate-y-full opacity-0'}`}>
                <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tighter">Architecture.</h1>
            </div>
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${step === 2 ? 'translate-y-0 opacity-100' : step > 2 ? '-translate-y-full opacity-0 scale-95' : 'translate-y-full opacity-0'}`}>
                <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tighter text-zinc-500">Logic.</h1>
            </div>
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${step === 3 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-110'}`}>
                <h1 className="text-5xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white pb-2 uppercase">NineIce</h1>
            </div>
        </div>

        {/* 极简进度条 */}
        <div className="mt-12 sm:mt-16 w-48 sm:w-64 h-[2px] bg-zinc-800/50 overflow-hidden relative">
           <div className="absolute top-0 left-0 h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-[700ms] ease-out" style={{ width: step === 0 ? '0%' : step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}></div>
        </div>
        
        {/* 系统状态 & 滑动提示 */}
        <div className="mt-8 h-12 flex items-center justify-center">
            {canScroll ? (
              <div className="flex flex-col items-center gap-2 animate-bounce text-zinc-400">
                  <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white">Scroll to unlock</span>
                  <ArrowRight size={14} className="rotate-90 text-white" />
              </div>
            ) : (
              <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em]">
                  <Loader2 size={14} className={`animate-spin ${step === 3 ? 'opacity-0 scale-50' : 'opacity-100 scale-100'} transition-all duration-300`} />
                  <span className={`transition-colors duration-500 ${step === 3 ? 'text-white font-bold' : ''}`}>
                     {step === 3 ? 'System Ready' : 'Initializing Sequence'}
                  </span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// --- 子组件：全屏首屏 (代替自动滑动开场) ---
const HeroBanner = ({ user, onScroll, onRegister, darkMode }) => (
  <div className="relative min-h-[85vh] sm:min-h-[80vh] mb-12 sm:mb-20 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-20 overflow-hidden flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm group">
    
    {/* 结构感网格背景 */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
    
    <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center animate-slideUpFade">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-white mb-8 shadow-sm tracking-widest uppercase">
        <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white animate-pulse"></span>
        <span>Architecture 2.0</span>
      </div>
      
      <h1 className="text-5xl sm:text-7xl md:text-[6.5rem] font-black tracking-tighter text-zinc-950 dark:text-white mb-6 leading-[0.95] uppercase">
        {user ? (
          <>System<br/><span className="text-zinc-400 dark:text-zinc-600">Online.</span></>
        ) : (
          <>Code<br/><span className="text-zinc-400 dark:text-zinc-600">Is Logic.</span></>
        )}
      </h1>
      
      <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl font-medium leading-relaxed mb-10">
        Discover open-source projects, share technical insights, and explore the elegant fusion of structure, form, and logic. No noise.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <button onClick={onScroll} className={BTN_PRIMARY}>
           Explore Workspace
        </button>
        {!user && (
          <button onClick={onRegister} className={BTN_OUTLINE}>
            Create Account
          </button>
        )}
      </div>
    </div>

    {/* 向下滚动提示 */}
    <div className="absolute bottom-8 sm:bottom-12 flex flex-col items-center gap-2 animate-bounce cursor-pointer text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" onClick={onScroll}>
        <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">Scroll</span>
        <ArrowRight size={16} className="rotate-90" />
    </div>
  </div>
);

// --- 子组件：Bento 风格项目卡片 ---
const ProjectCard = ({ p, isAdmin, handleDelete, handleEdit, onViewDetail, darkMode }) => {
  const [imgError, setImgError] = useState(false);
  const url = p.image_url || p.imageUrl; 
  const isValidUrl = url && url.startsWith('http') && !imgError;

  return (
    <div className="group cursor-pointer flex flex-col relative w-full bg-white dark:bg-zinc-900 rounded-[2rem] p-3 border border-zinc-200 dark:border-zinc-800 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-xl transition-all duration-500 hover:-translate-y-1" onClick={() => onViewDetail(p)}>
      <div className={`relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-5 bg-zinc-50 dark:bg-zinc-950`}>
        {isValidUrl ? (
          <img src={url} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out grayscale-[20%] group-hover:grayscale-0" onError={() => setImgError(true)} alt={p.title}/>
        ) : (
          <div className="w-full h-full flex items-center justify-center flex-col gap-3 opacity-40">
            <ImageIcon size={32} strokeWidth={1.5} className="text-zinc-400" />
          </div>
        )}
        
        {/* Soft Hover Overlay */}
        <div className="absolute inset-0 bg-black/5 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {isAdmin && (
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button onClick={(e) => { e.stopPropagation(); handleEdit(p); }} className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md text-zinc-900 dark:text-white p-2.5 rounded-full hover:bg-white transition-colors shadow-sm border border-zinc-200 dark:border-zinc-700"><Edit3 size={16} /></button>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(e, p.objectId); }} className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md text-red-600 p-2.5 rounded-full hover:bg-white transition-colors shadow-sm border border-zinc-200 dark:border-zinc-700"><Trash2 size={16} /></button>
          </div>
        )}
      </div>

      <div className="flex flex-col px-3 pb-3">
        <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white border border-zinc-200 dark:border-zinc-700">
               Project
            </span>
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                {p.createdAt ? p.createdAt.split(' ')[0] : 'Unknown'}
            </span>
        </div>
        <h3 className={`font-bold text-xl tracking-tight leading-tight transition-colors mb-2 text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 line-clamp-1`}>
            {p.title || 'Untitled'}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
            {p.description || 'No description provided for this project. Click to view details.'}
        </p>
      </div>
    </div>
  );
};

// --- 子组件：项目详情页 ---
const ProjectDetailView = ({ project, onBack, darkMode }) => {
  const [imgError, setImgError] = useState(false);
  const url = project.image_url || project.imageUrl;
  const htmlContent = parseMarkdownSafe(project.content || '');
  const formatUrl = (link) => (!link ? '' : (link.startsWith('http') ? link : `https://${link}`));

  return (
    <div className={`min-h-full animate-slideUpFade pb-20 transition-colors`}>
      <div className={`sticky top-0 backdrop-blur-2xl px-6 py-5 flex items-center justify-between z-30 transition-colors border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80`}>
        <button onClick={onBack} className={`flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-full`}>
          <ChevronLeft size={16} /> Back to Hub
        </button>
        {project.git_link && (
            <a href={formatUrl(project.git_link)} target="_blank" rel="noreferrer" className={`bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform shadow-md`}>
               <Github size={16}/> Source Code
            </a>
        )}
      </div>

      <div className="max-w-[800px] mx-auto px-6 py-12 sm:py-20">
         <div className="mb-12 sm:mb-16 text-center flex flex-col items-center animate-slideUpFade" style={{ animationDelay: '100ms' }}>
             <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs font-bold uppercase tracking-widest mb-6">
                 {project.createdAt}
             </div>
             <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-8 text-zinc-900 dark:text-white uppercase">{project.title}</h1>
             
             {project.description && (
                 <p className="text-lg sm:text-xl font-medium leading-relaxed max-w-2xl text-center text-zinc-500 dark:text-zinc-400">
                     {project.description}
                 </p>
             )}
         </div>

         {url && !imgError && (
             <div className="w-full aspect-video rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm mb-16 animate-slideUpFade" style={{ animationDelay: '200ms' }}>
                <img src={url} className="w-full h-full object-cover" onError={() => setImgError(true)} alt={project.title} />
             </div>
         )}

         <div className={`markdown-body max-w-3xl mx-auto animate-slideUpFade ${darkMode ? 'dark-mode-content text-zinc-300' : 'text-zinc-700'}`} style={{ animationDelay: '300ms' }}>
             {project.content ? (
                 <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
             ) : (
                 <div className="text-center py-24 rounded-[2rem] border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600">
                     <FileCheck size={48} strokeWidth={1} className="mx-auto mb-4 opacity-50"/>
                     <p className="text-sm font-medium">Documentation is empty</p>
                 </div>
             )}
         </div>
      </div>
    </div>
  );
}

// --- 主应用组件 ---
export default function App() {
  const bmobRef = useRef(null);
  const [showIntro, setShowIntro] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); 
  const [adConfig, setAdConfig] = useState(null); 
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') { return window.innerWidth >= 1024; }
    return true; 
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isLibLoaded, setIsLibLoaded] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [totalViews, setTotalViews] = useState(0);
  const [projectsUpdated, setProjectsUpdated] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        return saved === 'dark';
    }
    return false;
  });

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth >= 1024) {
            setIsSidebarOpen(true);
        } else {
            setIsSidebarOpen(false);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        document.body.style.backgroundColor = '#09090b';
        document.body.style.color = '#F4F4F5';
    } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        document.body.style.backgroundColor = '#FAFAFA';
        document.body.style.color = '#18181B';
    }

    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
      
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; }

      .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background-color: ${darkMode ? '#27272A' : '#E4E4E7'}; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: ${darkMode ? '#3F3F46' : '#D4D4D8'}; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      
      @keyframes slideUpFade { 
        from { opacity: 0; transform: translateY(20px) scale(0.98); } 
        to { opacity: 1; transform: translateY(0) scale(1); } 
      } 
      .animate-slideUpFade { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      
      .markdown-body { font-size: 1.05rem; line-height: 1.8; word-wrap: break-word; font-weight: 400; }
      .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 { font-weight: 800; letter-spacing: -0.04em; margin-top: 2.5rem; margin-bottom: 1rem; color: ${darkMode ? '#FFF' : '#18181B'}; }
      .markdown-body h1 { font-size: 2.5rem; border-bottom: 1px solid ${darkMode ? '#27272A' : '#E4E4E7'}; padding-bottom: 0.5rem; text-transform: uppercase; }
      .markdown-body h2 { font-size: 1.75rem; }
      .markdown-body p { margin-bottom: 1.5rem; }
      .markdown-body blockquote { border-left: 3px solid ${darkMode ? '#FFF' : '#000'}; padding: 0.5rem 1.5rem; font-style: italic; background: ${darkMode ? '#18181B' : '#F4F4F5'}; border-radius: 0 12px 12px 0; margin-bottom: 1.5rem; }
      .markdown-body code { background-color: ${darkMode ? '#18181B' : '#F4F4F5'}; padding: 0.2em 0.4em; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.85em; border-radius: 6px; border: 1px solid ${darkMode ? '#27272A' : '#E4E4E7'}; }
      .markdown-body pre { background-color: ${darkMode ? '#18181B' : '#FAFAFA'}; padding: 1.5rem; overflow: auto; margin-bottom: 1.5rem; border: 1px solid ${darkMode ? '#27272A' : '#E4E4E7'}; border-radius: 16px; }
      .markdown-body pre code { background: none; border: none; padding: 0; }
      .markdown-body img { max-width: 100%; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [darkMode]);

  useEffect(() => {
    if (window.Bmob) { initBmob(); return; }
    const script = document.createElement('script');
    script.src = "https://unpkg.com/hydrogen-js-sdk/dist/Bmob-2.5.1.min.js";
    script.onload = initBmob;
    document.head.appendChild(script);

    function initBmob() {
      if (BMOB_SECRET_KEY && BMOB_API_KEY) {
        try {
          window.Bmob.initialize(BMOB_SECRET_KEY, BMOB_API_KEY);
          bmobRef.current = window.Bmob;
          const current = window.Bmob.User.current();
          if (current) {
             setCurrentUser(current);
             const query = window.Bmob.Query("_User");
             query.get(current.objectId).then(userObj => {
                setCurrentUser(prev => ({...prev}));
             }).catch(e => {
                 if(e && e.code === 206) { window.Bmob.User.logout(); setCurrentUser(null); }
             });
          }
          updateSiteViews(window.Bmob);
          fetchAdConfig(window.Bmob); 
        } catch (e) { console.error("Bmob init error", e); }
      }
      setIsLibLoaded(true);
    }
  }, []);

  const updateSiteViews = async (bmobInstance) => {
    try {
      const query = bmobInstance.Query("SiteStats");
      const res = await query.find();
      if (res && res.length > 0) {
        const stat = res[0];
        const obj = bmobInstance.Query("SiteStats");
        await obj.get(stat.objectId).then(resObj => {
          resObj.set("views", (resObj.views || 0) + 1);
          resObj.save();
          setTotalViews((resObj.views || 0) + 1);
        });
      } else {
        const queryCreate = bmobInstance.Query("SiteStats");
        queryCreate.set("views", 1);
        await queryCreate.save();
        setTotalViews(1);
      }
    } catch (e) { }
  };

  const fetchAdConfig = async (bmobInstance) => {
    const bmob = bmobInstance || bmobRef.current;
    if (!bmob) return;
    try {
      const query = bmob.Query("AdConfig");
      const res = await query.find();
      if (res && res.length > 0) {
        setAdConfig(res[0]);
      }
    } catch (e) { 
        if (e && e.code === 101) console.log("AdConfig table not initialized yet.");
    }
  };

  const startEditProject = (project) => { setEditingProject(project); setActiveTab('studio'); setSelectedProject(null); };

  if (globalError === "API_SAFE_TOKEN_MISSING" || globalError === "MASTER_KEY_MISSING") return <ConfigErrorScreen type={globalError} darkMode={darkMode} />;
  
  if (!isLibLoaded) return <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center gap-4 font-mono text-xs tracking-widest uppercase"><Loader2 className="w-6 h-6 animate-spin text-zinc-500"/>Connecting to Workspace</div>;

  const appBg = darkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-[#FAFAFA] text-zinc-900';

  return (
    <div className={`h-full ${appBg} flex flex-col overflow-hidden transition-colors duration-500 relative`}>
      {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}
      <Header 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        currentUser={currentUser} 
        setActiveTab={(tab) => { setActiveTab(tab); setSelectedProject(null); setEditingProject(null); }} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        Bmob={bmobRef.current} 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <div className="flex flex-1 overflow-hidden relative">
        {isSidebarOpen && window.innerWidth < 1024 && (
            <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
        )}
        
        <Sidebar 
            isOpen={isSidebarOpen} 
            activeTab={activeTab} 
            setActiveTab={(tab) => { 
                setActiveTab(tab); 
                setSelectedProject(null); 
                setEditingProject(null); 
                if (window.innerWidth < 1024) setIsSidebarOpen(false); 
            }} 
            currentUser={currentUser} 
            totalViews={totalViews} 
            darkMode={darkMode}
            adConfig={adConfig} 
        />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar relative w-full">
          {selectedProject ? (
             <ProjectDetailView project={selectedProject} onBack={() => setSelectedProject(null)} darkMode={darkMode} />
          ) : (
             <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto min-h-full">
                {activeTab === 'home' && <HomeView Bmob={bmobRef.current} searchQuery={searchQuery} currentUser={currentUser} setGlobalError={setGlobalError} projectsUpdated={projectsUpdated} setProjectsUpdated={setProjectsUpdated} onViewDetail={setSelectedProject} onEdit={startEditProject} onNavigate={setActiveTab} darkMode={darkMode} />}
                {activeTab === 'community' && <CommunityView Bmob={bmobRef.current} searchQuery={searchQuery} currentUser={currentUser} darkMode={darkMode} />}
                {activeTab === 'discussion' && <DiscussionView Bmob={bmobRef.current} currentUser={currentUser} darkMode={darkMode} />}
                {activeTab === 'studio' && <StudioView Bmob={bmobRef.current} currentUser={currentUser} setCurrentUser={setCurrentUser} setProjectsUpdated={setProjectsUpdated} editingProject={editingProject} onCancelEdit={() => setEditingProject(null)} darkMode={darkMode} refreshAdConfig={() => fetchAdConfig(bmobRef.current)} />}
             </div>
          )}
        </main>
      </div>
    </div>
  );
}

// --- 组件部分 ---

function Header({ isSidebarOpen, setIsSidebarOpen, currentUser, setActiveTab, searchQuery, setSearchQuery, Bmob, darkMode, toggleDarkMode }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const isAdmin = currentUser && currentUser.username === ADMIN_USERNAME;

  useEffect(() => {
    if (!Bmob) return;
    const checkNotifications = async () => {
      const lastReadTime = localStorage.getItem('last_notif_time') || "2000-01-01 00:00:00";
      const query = Bmob.Query("guestbook");
      query.order("-createdAt");
      query.limit(20); 
      try {
        const res = await query.find();
        if (Array.isArray(res)) setNotifications(res.filter(msg => {
            if (msg.createdAt <= lastReadTime) return false;
            if (currentUser && msg.name === currentUser.username) return false;
            if (isAdmin) return true; 
            else if (currentUser) return msg.replyTo === currentUser.username;
            return false;
        }));
      } catch (e) {}
    };
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [Bmob, currentUser, isAdmin]);

  const handleOpenNotif = () => {
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown && notifications.length > 0) localStorage.setItem('last_notif_time', notifications[0].createdAt);
  };

  const headerClass = darkMode ? "bg-[#09090B]/80 border-zinc-800" : "bg-white/80 border-zinc-200";
  const iconClass = darkMode ? "text-zinc-400 hover:text-white hover:bg-zinc-800" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100";

  return (
    <header className={`h-20 flex items-center justify-between px-6 backdrop-blur-2xl sticky top-0 z-50 border-b transition-colors duration-500 ${headerClass}`}>
      <div className="flex items-center gap-6">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2.5 rounded-full transition-colors ${iconClass}`}><Menu size={20} strokeWidth={2} /></button>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
          <div className="w-9 h-9 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-all">
             <Layers size={20} className="text-white dark:text-zinc-900" />
          </div>
          <span className={`text-xl font-bold tracking-tight hidden sm:block ${darkMode ? 'text-white' : 'text-zinc-900'}`}>NineIce</span>
        </div>
      </div>
      
      <div className="hidden md:flex flex-1 max-w-xl mx-8">
        <div className={`flex items-center w-full border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'} rounded-full px-5 py-2.5 transition-all focus-within:ring-4 focus-within:ring-zinc-900/5 dark:focus-within:ring-white/5 focus-within:border-zinc-900 dark:focus-within:border-white`}>
            <Search size={18} className={darkMode ? 'text-zinc-500' : 'text-zinc-400'}/>
            <input type="text" placeholder="Search workspace..." className="w-full bg-transparent outline-none text-sm px-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
            {searchQuery && (<button onClick={() => setSearchQuery('')} className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"><X size={14} className="text-zinc-500" /></button>)}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 relative">
        <button onClick={toggleDarkMode} className={`p-2.5 rounded-full transition-colors ${iconClass}`} title="Toggle Theme">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
        <div className="relative">
          <button onClick={handleOpenNotif} className={`p-2.5 rounded-full relative transition-colors ${iconClass}`}>
            <Bell size={20} />
            {notifications.length > 0 && (<span className="absolute top-2 right-2 w-2.5 h-2.5 bg-zinc-900 dark:bg-white rounded-full border-2 border-white dark:border-[#09090b]"></span>)}
          </button>
          {showNotifDropdown && (
            <div className={`absolute right-0 top-14 w-80 border shadow-[0_10px_40px_rgb(0,0,0,0.1)] z-50 overflow-hidden animate-slideUpFade rounded-3xl ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <div className={`p-5 border-b font-semibold text-sm ${darkMode ? 'border-zinc-800 text-white' : 'border-zinc-100 text-zinc-900'}`}>Notifications</div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className={`p-10 text-center text-sm ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.objectId} onClick={() => { setActiveTab('discussion'); setShowNotifDropdown(false); }} className={`p-5 cursor-pointer border-b transition-colors ${darkMode ? 'hover:bg-zinc-800 border-zinc-800' : 'hover:bg-zinc-50 border-zinc-50'}`}>
                      <p className={`text-sm mb-1 font-medium ${darkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>{n.name} <span className="font-normal text-zinc-500">{n.replyTo ? `replied to you` : `left a message`}</span></p>
                      <p className={`text-sm line-clamp-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>"{n.message}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {currentUser ? (
          <button onClick={() => setActiveTab('studio')} className={`flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border transition-all ${darkMode ? 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800' : 'border-zinc-200 bg-white hover:bg-zinc-50 hover:shadow-sm'}`}>
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-full flex items-center justify-center text-sm font-bold text-white dark:text-zinc-900 shadow-inner">{currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}</div>
            <span className={`text-sm font-medium hidden sm:block ${darkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>{currentUser.username.split('@')[0]}</span>
          </button>
        ) : (
          <button onClick={() => setActiveTab('studio')} className={`text-sm font-medium px-6 py-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md ${darkMode ? 'bg-white text-zinc-900 hover:scale-105' : 'bg-zinc-900 text-white hover:scale-105'}`}>Sign In</button>
        )}
      </div>
    </header>
  );
}

function Sidebar({ isOpen, activeTab, setActiveTab, currentUser, totalViews, darkMode, adConfig }) {
  if (!isOpen) return null;
  
  const sidebarClass = darkMode ? "bg-[#09090b]/90 md:bg-transparent border-zinc-800" : "bg-white/90 md:bg-transparent border-zinc-200";
  const menuActive = darkMode ? "bg-zinc-800 text-white font-medium border border-zinc-700" : "bg-white text-zinc-900 font-medium border border-zinc-200 shadow-sm";
  const menuInactive = darkMode ? "hover:bg-zinc-900 text-zinc-400 border border-transparent" : "hover:bg-zinc-50 text-zinc-500 border border-transparent";
  const iconActive = darkMode ? "text-white" : "text-zinc-900";
  const iconInactive = darkMode ? "text-zinc-500" : "text-zinc-400";

  const MenuItem = ({ id, icon: Icon, label }) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl mb-1.5 transition-all duration-300 ${activeTab === id ? menuActive : menuInactive}`}>
      <Icon size={20} className={activeTab === id ? iconActive : iconInactive} strokeWidth={activeTab === id ? 2.5 : 2}/><span className="text-sm tracking-wide">{label}</span>
    </button>
  );
  
  const isAdmin = currentUser && currentUser.username === ADMIN_USERNAME;

  const layoutClass = "fixed inset-y-0 left-0 z-50 lg:static lg:z-auto h-full w-[280px] backdrop-blur-2xl lg:backdrop-blur-none border-r lg:border-r-0"; 
  const transformClass = isOpen ? "translate-x-0" : "-translate-x-full lg:hidden";

  return (
    <aside className={`flex-shrink-0 overflow-y-auto px-6 pb-6 pt-10 custom-scrollbar flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${layoutClass} ${transformClass} ${sidebarClass} mt-20 lg:mt-0`}>
      <div className="mb-8">
        <MenuItem id="home" icon={Grid} label="Projects" />
        <MenuItem id="community" icon={Activity} label="Activity Feed" />
        <MenuItem id="discussion" icon={MessageSquare} label="Guestbook" />
      </div>
      
      <div className="mb-8">
        <h3 className={`px-4 py-2 text-xs font-bold tracking-widest uppercase mb-2 ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{isAdmin ? "System" : "Account"}</h3>
        <MenuItem id="studio" icon={LayoutDashboard} label={isAdmin ? "Admin Console" : "My Profile"} />
      </div>
      
      <div className="mt-auto mb-6 space-y-4">
        {adConfig && adConfig.imageUrl ? (
            <a href={adConfig.linkUrl || '#'} target="_blank" rel="noreferrer" className="block w-full rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden group relative shadow-sm">
                <img src={adConfig.imageUrl} alt="Ad" className="w-full h-auto object-cover transform group-hover:scale-105 transition-all duration-700" />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/90 backdrop-blur-md text-zinc-900 dark:text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Ad</div>
            </a>
        ) : (
            <div className={`border border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer group transition-colors ${darkMode ? 'border-zinc-800 hover:border-zinc-600' : 'border-zinc-300 hover:border-zinc-400'}`}>
               <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${darkMode ? 'bg-zinc-900 group-hover:bg-zinc-800 text-zinc-500 group-hover:text-white' : 'bg-zinc-50 group-hover:bg-zinc-100 text-zinc-400 group-hover:text-zinc-900'}`}>
                   <Megaphone size={18} />
               </div>
               <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-zinc-400 group-hover:text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-700'}`}>Sponsor Space</p>
            </div>
        )}
      </div>

      <div className={`px-4 text-xs font-medium leading-loose ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
        <div className={`flex items-center gap-2 mb-4 pb-4 border-b ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <Eye size={14} /> <span>Total Views: {totalViews}</span>
        </div>
        <div className="flex gap-4 mb-2">
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Contact</a>
        </div>
        <p>© 2026 NineIce UI.</p>
      </div>
    </aside>
  );
}

// --- 首页 (带搜索过滤) ---
function HomeView({ Bmob, searchQuery, currentUser, setGlobalError, projectsUpdated, setProjectsUpdated, onViewDetail, onEdit, onNavigate, darkMode }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const projectsRef = useRef(null); 
  const isAdmin = currentUser && currentUser.username === ADMIN_USERNAME;

  const fetchProjects = async () => {
    if (!Bmob) return;
    try {
      const query = Bmob.Query("projects");
      query.order("-createdAt");
      const res = await query.find();
      if(Array.isArray(res)) setProjects(res);
      if (setProjectsUpdated) setProjectsUpdated(false);
    } catch(e) { 
      if(getBmobErrorMsg(e) === "API_SAFE_TOKEN_MISSING") setGlobalError("API_SAFE_TOKEN_MISSING");
    }
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, [Bmob]);
  useEffect(() => { if (projectsUpdated) fetchProjects(); }, [projectsUpdated, Bmob]);

  const handleScroll = () => { projectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;
    try { await Bmob.Query("projects").destroy(id); fetchProjects(); } catch(err) { fetchProjects(); }
  };

  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (p.title && p.title.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q));
  });

  if (loading) return <div className={`py-32 flex flex-col items-center justify-center gap-4 text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}><Loader2 className="animate-spin w-8 h-8 text-zinc-900 dark:text-white"/>Loading Workspace...</div>;

  return (
    <div className="animate-slideUpFade">
      {/* 沉浸式首屏 Hero */}
      <HeroBanner user={currentUser} onViewDetail={onViewDetail} onScroll={handleScroll} onRegister={() => onNavigate('studio')} darkMode={darkMode} />
      
      <div ref={projectsRef} className="flex gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar scroll-mt-32">
         {['All Projects', 'Web App', 'Mobile', 'UI/UX', 'AI Tools', 'Notes'].map((tag,i) => (
           <button key={i} className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-sm ${i===0 ? (darkMode ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white') : (darkMode ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900')}`}>
             {tag}
           </button>
         ))}
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className={`col-span-full text-center py-24 rounded-[3rem] border border-dashed ${darkMode ? 'border-zinc-800 text-zinc-500 bg-zinc-900/50' : 'border-zinc-200 text-zinc-500 bg-white'}`}>
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4"><Search size={24} className="opacity-50"/></div>
          <p className="text-lg font-medium">{searchQuery ? `No matches found for "${searchQuery}"` : "Workspace is empty."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {filteredProjects.map(p => (
            <ProjectCard key={p.objectId} p={p} isAdmin={isAdmin} handleDelete={handleDelete} handleEdit={onEdit} onViewDetail={onViewDetail} darkMode={darkMode} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- 动态墙 ---
function CommunityView({ Bmob, searchQuery, currentUser, darkMode }) {
  const [blogs, setBlogs] = useState([]);
  const isAdmin = currentUser && currentUser.username === ADMIN_USERNAME;
  const fetchBlogs = () => { 
    if (!Bmob) return; 
    const q = Bmob.Query("blogs");
    q.order("-createdAt");
    q.find().then(res => { if(Array.isArray(res)) setBlogs(res); }); 
  };
  useEffect(() => { fetchBlogs(); }, [Bmob]);
  const handleDelete = async (id) => { if (!confirm("Delete?")) return; try { const q = Bmob.Query("blogs"); await q.destroy(id); fetchBlogs(); } catch(err) { fetchBlogs(); } };
  const handleLike = async (id, currentLikes) => {
    try { setBlogs(blogs.map(b => b.objectId === id ? { ...b, likes: (b.likes || 0) + 1 } : b)); const q = Bmob.Query("blogs"); await q.get(id).then(res => { res.set('likes', (res.likes || 0) + 1); res.save(); }); } catch(e) {}
  };
  const filteredBlogs = blogs.filter(b => (!searchQuery) || (b.content && b.content.toLowerCase().includes(searchQuery.toLowerCase())));

  const textMain = darkMode ? "text-zinc-100" : "text-zinc-900";
  const textSub = darkMode ? "text-zinc-400" : "text-zinc-500";
  const cardBg = darkMode ? "bg-zinc-900 border-zinc-800 shadow-xl" : "bg-white border-zinc-200 shadow-[0_4px_20px_rgb(0,0,0,0.02)]";

  return (
    <div className="max-w-3xl mx-auto pt-4 animate-slideUpFade pb-20">
      <div className={`mb-12`}>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">Activity Feed.</h2>
        <p className={`text-lg font-medium ${textSub}`}>Latest updates, logs, and system announcements.</p>
      </div>
      
      <div className="space-y-6">
        {filteredBlogs.length === 0 && searchQuery ? (<div className={`text-center py-20 rounded-[2rem] border border-dashed ${darkMode ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-500'}`}>No logs match criteria</div>) : (
          filteredBlogs.map(b => (
            <div key={b.objectId} className={`border p-6 sm:p-8 rounded-[2.5rem] relative group transition-all duration-500 ${cardBg}`}>
              {isAdmin && <button onClick={() => handleDelete(b.objectId)} className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash2 size={18} /></button>}
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700"><Zap size={20} /></div>
                <div>
                    <h4 className={`font-bold ${textMain}`}>Admin Update</h4>
                    <span className={`text-xs font-medium ${textSub}`}>{b.createdAt}</span>
                </div>
              </div>
              
              <p className={`text-base sm:text-lg leading-relaxed whitespace-pre-wrap mb-8 font-medium ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{b.content}</p>
              
              <div className="flex justify-end">
                  <button onClick={() => handleLike(b.objectId, b.likes)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-white hover:text-zinc-900 hover:border-white' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-900 hover:text-white hover:border-zinc-900'}`}>
                    <ThumbsUp size={16} /> {b.likes || 0} Likes
                  </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- 留言板 ---
function DiscussionView({ Bmob, currentUser, darkMode }) {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null); 
  const msgInputRef = useRef(null);
  const isAdmin = currentUser && currentUser.username === ADMIN_USERNAME;

  useEffect(() => { if (currentUser && currentUser.username) setName(currentUser.username.split('@')[0]); }, [currentUser]);
  const fetchMessages = () => { 
    if (!Bmob) return; 
    const q = Bmob.Query("guestbook");
    q.order("-createdAt");
    q.find().then(res => { if(Array.isArray(res)) setMessages(res); }); 
  };
  useEffect(() => { fetchMessages(); }, [Bmob]);
  const handleDelete = async (id) => { if (!confirm("Delete this message?")) return; try { const q = Bmob.Query("guestbook"); await q.destroy(id); fetchMessages(); } catch(err) { fetchMessages(); } };
  const handleLike = async (id) => { setMessages(messages.map(m => m.objectId === id ? { ...m, likes: (m.likes || 0) + 1 } : m)); const q = Bmob.Query("guestbook"); await q.get(id).then(res => { res.set('likes', (res.likes || 0) + 1); res.save(); }); };
  const handleReplyClick = (targetName) => { setReplyTarget(targetName); if(msgInputRef.current) msgInputRef.current.focus(); };
  const cancelReply = () => { setReplyTarget(null); };
  const handleSubmit = (e) => { e.preventDefault(); if (!name.trim() || !msg.trim()) return; setLoading(true); const query = Bmob.Query("guestbook"); query.set("name", name); query.set("message", msg); query.set("likes", 0); if (replyTarget) query.set("replyTo", replyTarget); query.save().then(() => { if(!currentUser) setName(''); setMsg(''); setReplyTarget(null); setLoading(false); fetchMessages(); }).catch(err => { setLoading(false); }); };

  const textMain = darkMode ? "text-zinc-100" : "text-zinc-900";
  const textSub = darkMode ? "text-zinc-400" : "text-zinc-500";

  return (
    <div className="max-w-4xl mx-auto pt-4 animate-slideUpFade pb-20">
      <div className={`mb-12`}>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">Guestbook.</h2>
        <p className={`text-lg font-medium ${textSub}`}>Leave a message, share your thoughts, or say hi. ({messages.length} notes)</p>
      </div>

      <div className="mb-16">
        <form onSubmit={handleSubmit} className={`p-6 sm:p-8 rounded-[2.5rem] border shadow-sm ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
            {replyTarget && (<div className="flex items-center justify-between mb-4 pb-4 border-b border-dashed border-zinc-200 dark:border-zinc-800"><span className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 uppercase tracking-widest"><ArrowRight size={16}/> Replying to @{replyTarget}</span><button type="button" onClick={cancelReply} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><X size={16}/></button></div>)}
            <div className="flex flex-col gap-4">
                {!currentUser && (
                   <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your Name" className={`w-full md:w-1/3 p-4 rounded-2xl border outline-none transition-all text-sm font-medium ${INPUT_STYLES}`}/>
                )}
                <div className="relative">
                   <textarea ref={msgInputRef} value={msg} onChange={e=>setMsg(e.target.value)} placeholder={replyTarget ? `Write your reply...` : "What's on your mind?"} className={`w-full min-h-[120px] resize-none p-5 rounded-3xl border outline-none transition-all text-base font-medium ${INPUT_STYLES}`}/>
                   <div className="absolute bottom-4 right-4">
                      <button disabled={loading || !name || !msg} className={`p-3.5 rounded-full transition-all duration-300 shadow-md ${(!name || !msg) ? (darkMode ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-100 text-zinc-400') : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105 active:scale-95'}`}>
                         {loading ? <Loader2 size={20} className="animate-spin"/> : <Send size={20}/>}
                      </button>
                   </div>
                </div>
            </div>
        </form>
      </div>

      <div className="space-y-6">
        {messages.map((m, index) => (
          <div key={m.objectId} className={`group relative flex gap-4 sm:gap-6 p-6 rounded-[2rem] transition-all duration-300 ${darkMode ? 'hover:bg-zinc-900/40 border border-transparent hover:border-zinc-800' : 'hover:bg-white border border-transparent hover:border-zinc-200 hover:shadow-sm'}`} style={{ animation: `slideUpFade 0.5s ease forwards ${index * 0.05}s`, opacity: 0 }}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 border ${darkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}>
                {m.name ? m.name[0].toUpperCase() : 'A'}
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-3 mb-1">
                  <span className={`text-base font-bold uppercase tracking-tight ${textMain}`}>{m.name}</span>
                  <span className={`text-xs font-medium ${textSub}`}>{m.createdAt}</span>
              </div>
              {m.replyTo && (<div className={`text-sm mb-2 flex items-center gap-1.5 font-semibold ${darkMode ? 'text-zinc-300' : 'text-zinc-600'}`}><ArrowRight size={14}/> Replying to <span className="underline decoration-2 underline-offset-2">@{m.replyTo}</span></div>)}
              <p className={`text-base leading-relaxed mb-4 font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{m.message}</p>
              
              <div className="flex items-center gap-4">
                <button onClick={()=>handleLike(m.objectId)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-colors border ${darkMode ? 'bg-zinc-900 border-zinc-800 hover:bg-white hover:text-zinc-900 text-zinc-400' : 'bg-white border-zinc-200 hover:bg-zinc-900 hover:text-white text-zinc-600'}`}>
                    <ThumbsUp size={14} className={m.likes > 0 ? (darkMode ? "text-white" : "text-zinc-900") : ""} /> {m.likes || 0}
                </button>
                <button onClick={() => handleReplyClick(m.name)} className={`text-sm font-bold transition-colors ${darkMode ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}>Reply</button>
              </div>
            </div>
            {isAdmin && <button onClick={() => handleDelete(m.objectId)} className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 后台管理 ---
function StudioView({ Bmob, currentUser, setCurrentUser, setProjectsUpdated, editingProject, onCancelEdit, darkMode, refreshAdConfig }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pContent, setPContent] = useState(''); 
  const [pLink, setPLink] = useState('');
  const [pImg, setPImg] = useState('');
  const [bContent, setBContent] = useState('');
  
  const [adImg, setAdImg] = useState('');
  const [adLink, setAdLink] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isPreview, setIsPreview] = useState(false); 
  
  useEffect(() => {
    if (editingProject) {
      setPTitle(editingProject.title || '');
      setPDesc(editingProject.description || '');
      setPContent(editingProject.content || '');
      setPLink(editingProject.git_link || '');
      setPImg(editingProject.image_url || editingProject.imageUrl || '');
    }
  }, [editingProject]);

  const clearForm = () => { setPTitle(''); setPDesc(''); setPContent(''); setPImg(''); setPLink(''); setIsPreview(false); if (onCancelEdit) onCancelEdit(); };
  const handleLogin = (e) => { e.preventDefault(); if (Bmob) { Bmob.User.login(username, password).then(res => { setCurrentUser(res); }).catch(err => { alert("Login failed."); }); } };
  const handleRegister = () => { if (Bmob) { Bmob.User.register({ username, password }).then(res => { alert("Registered successfully."); }).catch(err => alert("Registration failed.")); } };
  const handleLogout = () => { if (Bmob) { Bmob.User.logout(); setCurrentUser(null); } };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      if (!pTitle.trim()) { alert("Title required."); setIsUploading(false); return; }
      const query = Bmob.Query("projects");
      if (editingProject) query.set('id', editingProject.objectId);
      query.set("title", pTitle);
      query.set("description", pDesc);
      query.set("content", pContent);
      query.set("git_link", String(pLink || "")); 
      query.set("image_url", pImg || "");
      if (!editingProject) { try { const acl = Bmob.ACL(); acl.setPublicReadAccess(true); acl.setPublicWriteAccess(true); query.set("ACL", acl); } catch(e) {} }
      await query.save();
      if (setProjectsUpdated) setProjectsUpdated(true);
      alert(editingProject ? `Project Updated!` : `Project Deployed!`); 
      clearForm();
    } catch (err) { alert("Operation failed."); } finally { setIsUploading(false); }
  };

  const handleAddBlog = (e) => {
    e.preventDefault();
    if (Bmob) { const query = Bmob.Query("blogs"); query.set("content", bContent); query.set("likes", 0); query.save().then(res => { alert("Log published."); setBContent(''); }); }
  };

  const handleUpdateAd = async (e) => {
    e.preventDefault();
    if (!Bmob) return;
    let existingId = null;
    try {
        const query = Bmob.Query("AdConfig");
        const res = await query.find();
        if (res && res.length > 0) existingId = res[0].objectId;
    } catch (err) {}

    try {
        const q = Bmob.Query("AdConfig");
        if (existingId) {
            const obj = await q.get(existingId);
            obj.set("imageUrl", adImg);
            obj.set("linkUrl", adLink);
            await obj.save();
        } else {
            q.set("imageUrl", adImg);
            q.set("linkUrl", adLink);
            await q.save();
        }
        alert("Ad config updated.");
        if (refreshAdConfig) refreshAdConfig();
    } catch (saveErr) { alert("Config failed: " + (saveErr.error || saveErr.message)); }
  };

  const cardClass = darkMode ? "border-zinc-800 bg-zinc-950 shadow-sm" : "border-zinc-200 bg-white shadow-sm";
  const labelClass = darkMode ? "text-zinc-400" : "text-zinc-500";
  const textMain = darkMode ? "text-white" : "text-zinc-900";

  if (!currentUser) {
    return (
      <div className={`max-w-md mx-auto mt-20 p-10 sm:p-14 rounded-[3rem] border animate-slideUpFade ${cardClass}`}>
        <div className="w-20 h-20 mx-auto bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-8 border border-zinc-200 dark:border-zinc-800">
            <Lock size={32} className="text-zinc-900 dark:text-white" />
        </div>
        <h2 className={`text-4xl font-black uppercase tracking-tighter text-center mb-8 ${textMain}`}>Authentication</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Email Address" className={INPUT_STYLES}/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className={INPUT_STYLES}/>
          <div className="flex flex-col gap-3 pt-6">
              <button type="submit" className={BTN_PRIMARY}>Sign In</button>
              <button type="button" onClick={handleRegister} className={`py-3.5 text-sm font-bold rounded-full border transition-all ${darkMode ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}>Create Account</button>
          </div>
        </form>
      </div>
    );
  }

  const isAdmin = currentUser.username === ADMIN_USERNAME;
  if (!isAdmin) {
    return (
      <div className={`max-w-md mx-auto mt-20 p-12 rounded-[3rem] border text-center animate-slideUpFade ${cardClass}`}>
        <div className={`w-24 h-24 mx-auto mb-6 flex items-center justify-center text-4xl font-bold rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg`}>{currentUser.username[0].toUpperCase()}</div>
        <h2 className={`text-3xl font-black uppercase tracking-tighter mb-3 ${textMain}`}>{currentUser.username.split('@')[0]}</h2>
        <p className={`text-sm font-medium mb-10 ${labelClass}`}>Your account is securely connected.</p>
        <button onClick={handleLogout} className={`w-full py-3.5 text-sm font-bold rounded-full border transition-all flex items-center justify-center gap-2 ${darkMode ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}><LogOut size={16}/> Sign Out</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pt-4 animate-slideUpFade pb-20">
      <div className={`flex flex-col md:flex-row md:justify-between md:items-end mb-12`}>
          <div>
            <h2 className={`text-5xl font-black tracking-tighter uppercase ${textMain}`}>Admin Console.</h2>
            <p className={`text-lg font-medium mt-3 ${labelClass}`}>Manage your projects, system logs, and ad placements.</p>
          </div>
          <button onClick={handleLogout} className={`mt-6 md:mt-0 flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-full border transition-all ${darkMode ? 'border-zinc-800 text-zinc-300 hover:bg-white hover:text-zinc-900' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-900 hover:text-white'}`}><LogOut size={16}/> Sign Out</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* 项目发布/编辑 */}
        <div className={`xl:col-span-8 p-8 sm:p-10 rounded-[2.5rem] border ${cardClass} ${editingProject ? 'ring-4 ring-zinc-900/10 dark:ring-white/10' : ''}`}>
          <div className={`flex items-center justify-between mb-8 pb-6 border-b ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <h3 className={`font-bold text-2xl uppercase tracking-tight flex items-center gap-3 ${textMain}`}>
               <div className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"><LayoutDashboard size={20}/></div>
               {editingProject ? 'Edit Project' : 'New Project'}
            </h3>
            {editingProject && (<button onClick={clearForm} className="text-xs font-bold uppercase tracking-widest border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-4 py-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</button>)}
          </div>
          <form onSubmit={handleAddProject} className="flex flex-col gap-6">
            <div><label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${labelClass}`}>Project Title</label><input value={pTitle} onChange={e=>setPTitle(e.target.value)} className={INPUT_STYLES}/></div>
            <div><label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${labelClass}`}>Short Description</label><textarea value={pDesc} onChange={e=>setPDesc(e.target.value)} className={`h-24 resize-none ${INPUT_STYLES}`}/></div>
            <div className="flex flex-col">
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-between ${labelClass}`}>
                  <span>Documentation (Markdown)</span>
                  <button type="button" onClick={() => setIsPreview(!isPreview)} className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors border ${darkMode ? 'border-zinc-700 hover:bg-white hover:text-zinc-900 text-white' : 'border-zinc-300 hover:bg-zinc-900 hover:text-white text-zinc-900'}`}>{isPreview ? 'Write' : 'Preview'}</button>
              </label>
              {isPreview ? (
                  <div className={`w-full min-h-[400px] overflow-auto markdown-body p-6 rounded-2xl border ${darkMode ? 'dark-mode-content bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`} dangerouslySetInnerHTML={{ __html: parseMarkdownSafe(pContent) }} />
              ) : (
                  <textarea value={pContent} onChange={e=>setPContent(e.target.value)} className={`min-h-[400px] resize-none font-mono text-sm leading-relaxed ${INPUT_STYLES}`}/>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div><label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${labelClass}`}>Cover Image URL</label><input value={pImg} onChange={e=>setPImg(e.target.value)} className={INPUT_STYLES}/></div>
               <div><label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${labelClass}`}>Repository URL</label><input value={pLink} onChange={e=>setPLink(e.target.value)} className={INPUT_STYLES}/></div>
            </div>
            <div className="mt-6 pt-8 border-t border-dashed dark:border-zinc-800 border-zinc-200">
                <button disabled={isUploading} className={BTN_PRIMARY}>{isUploading ? <Loader2 className="animate-spin"/> : (editingProject ? 'Save Changes' : 'Deploy Project')}</button>
            </div>
          </form>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-8">
            {/* 动态发布 */}
            <div className={`p-8 rounded-[2.5rem] border ${cardClass}`}>
              <div className={`mb-6 pb-4 border-b ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <h3 className={`font-bold text-xl uppercase tracking-tight flex items-center gap-3 ${textMain}`}>
                      <div className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"><PenTool size={20}/></div>
                      System Log
                  </h3>
              </div>
              <form onSubmit={handleAddBlog} className="flex flex-col gap-5">
                <div className="flex flex-col">
                    <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${labelClass}`}>Message Data</label>
                    <textarea value={bContent} onChange={e=>setBContent(e.target.value)} className={`resize-none min-h-[160px] ${INPUT_STYLES}`}/>
                </div>
                <button className={`w-full py-3.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all border ${darkMode ? 'bg-zinc-900 border-zinc-700 hover:bg-white hover:text-zinc-900 text-white' : 'bg-white border-zinc-300 hover:bg-zinc-900 hover:text-white text-zinc-900'}`}>Publish Log</button>
              </form>
            </div>

            {/* 广告位管理 */}
            <div className={`p-8 rounded-[2.5rem] border ${cardClass}`}>
              <div className={`mb-6 pb-4 border-b ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <h3 className={`font-bold text-xl uppercase tracking-tight flex items-center gap-3 ${textMain}`}>
                      <div className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"><Megaphone size={20}/></div>
                      Ad Config
                  </h3>
              </div>
              <form onSubmit={handleUpdateAd} className="flex flex-col gap-5">
                <div><label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${labelClass}`}>Media URL</label><input value={adImg} onChange={e=>setAdImg(e.target.value)} className={INPUT_STYLES}/></div>
                <div><label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${labelClass}`}>Target URL</label><input value={adLink} onChange={e=>setAdLink(e.target.value)} className={INPUT_STYLES}/></div>
                <button className={`w-full py-3.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all border ${darkMode ? 'bg-zinc-900 border-zinc-700 hover:bg-white hover:text-zinc-900 text-white' : 'bg-white border-zinc-300 hover:bg-zinc-900 hover:text-white text-zinc-900'}`}>Update Block</button>
              </form>
            </div>
        </div>
      </div>
    </div>
  );
}

function ConfigErrorScreen({ type, darkMode }) {
  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${darkMode ? 'bg-[#09090b] text-white' : 'bg-[#FAFAFA] text-zinc-900'}`}>
      <div className={`max-w-md w-full text-center p-12 rounded-[3rem] border shadow-sm ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
           <AlertTriangle size={32} className="text-zinc-900 dark:text-white" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-3">{type === "MASTER_KEY_MISSING" ? "Missing API Key" : "Config Error"}</h1>
        <p className={`text-sm font-medium mb-10 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Please verify your Bmob API keys at the top of the file.</p>
        <button onClick={()=>window.location.reload()} className={`px-8 py-3.5 text-sm font-bold uppercase tracking-widest rounded-full transition-all ${darkMode ? 'bg-white text-black hover:scale-105' : 'bg-black text-white hover:scale-105'}`}>Reload System</button>
      </div>
    </div>
  );
}