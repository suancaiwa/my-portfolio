import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Search, Bell, Grid, User, LogIn, LogOut, 
  ThumbsUp, MessageSquare, Share2, MoreVertical, 
  Home, Compass, LayoutDashboard, Clock, Upload, X,
  Github, Code, Lock, Loader2, AlertTriangle, PenTool,
  Laptop, ExternalLink, Smile, Trash2, Image as ImageIcon, FileCheck,
  Eye, CheckCircle, Cat, Zap, Award, CalendarCheck, HelpCircle, Link as LinkIcon,
  ChevronLeft, BookOpen, Layers, Edit3, Eye as EyeIcon, RefreshCw,
  Moon, Sun, Trophy, Medal
} from 'lucide-react';

// --- 配置区域 (Bmob) ---
const BMOB_APP_ID = "469b0e80e238277a812f77075df7e2e8"; 
const BMOB_REST_API_KEY = "ab10e715d2bc9ec35256d5e0ddbdb74a"; 
const BMOB_SECRET_KEY = "9fa1ba7ef19ef189";          
const BMOB_API_KEY = "0713231xX";                    
const BMOB_MASTER_KEY = "dd7f68bab0a99345940dd336396b9541"; 

// --- 权限配置 ---
const ADMIN_USERNAME = "cailixian2@gmail.com"; 

// --- 常量定义 ---
const MAX_LEVEL = 15;
const MAX_XP = 10000;

// --- 通用样式常量 ---
const INPUT_STYLES = "bg-[#f9f9f9] dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-3 text-slate-900 dark:text-slate-100 outline-none focus:border-[#065fd4] placeholder-slate-500 text-sm focus:bg-white dark:focus:bg-slate-900 transition-colors focus:ring-1 focus:ring-[#065fd4]";

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
    let tableHtml = '<div class="table-container"><table>';
    const headers = rows[0].split('|').filter(cell => cell.trim() !== '');
    tableHtml += '<thead><tr>' + headers.map(h => `<th>${h.trim()}</th>`).join('') + '</tr></thead>';
    tableHtml += '<tbody>';
    for (let i = 2; i < rows.length; i++) {
        const cells = rows[i].split('|').filter(cell => cell.trim() !== '');
        if (cells.length > 0) {
            tableHtml += '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
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
  html = html.replace(/!\[([^\]]+)\]\(([^\)]+)\)/gim, '<img src="$2" alt="$1" class="md-img" />');
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/^\s*-\s+(.*$)/gim, '<ul><li>$1</li></ul>');
  html = html.replace(/<\/ul>\s*<ul>/gim, '');
  html = html.replace(/\n/gim, '<br />');
  html = html.replace(/<\/h(\d)><br \/>/gim, '</h$1>');
  html = html.replace(/<\/pre><br \/>/gim, '</pre>');
  html = html.replace(/<\/table><\/div><br \/>/gim, '</table></div>');
  return html;
};

// --- 子组件：Hero Banner ---
const HeroBanner = ({ user, onViewDetail, onScroll, onRegister }) => (
  <div className="relative mb-8 rounded-2xl overflow-hidden p-8 sm:p-12 text-white shadow-xl group transform transition-all hover:scale-[1.01] duration-500">
    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 animate-gradient-xy"></div>
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
    
    <div className="relative z-10 flex flex-col items-start max-w-3xl">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-4 border border-white/30 text-white">
        <Zap size={14} className="fill-yellow-400 text-yellow-400" />
        <span>NineIce 2.0 更新已上线</span>
      </div>
      <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
        {user ? `欢迎回来, ${user.username}!` : '探索极客代码世界'}
      </h1>
      <p className="text-lg sm:text-xl text-indigo-100 mb-8 max-w-2xl leading-relaxed">
        在这里发现优质开源项目，分享你的技术见解。加入极客榜单，与顶尖开发者一较高下。
      </p>
      <div className="flex gap-4">
        <button onClick={onScroll} className="bg-white text-indigo-700 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2">
           开始探索 <ChevronLeft className="rotate-180" size={18}/>
        </button>
        {!user && (
          <button onClick={onRegister} className="bg-indigo-800/50 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-full font-bold hover:bg-indigo-800/70 transition-all">
            立即注册
          </button>
        )}
      </div>
    </div>
    
    <div className="absolute -top-20 -right-20 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
  </div>
);

// --- 子组件：互动小宠物 ---
const InteractivePet = ({ xp, level, darkMode }) => {
  const [message, setMessage] = useState("");
  const [isBouncing, setIsBouncing] = useState(false);
  
  const quotes = ["暗黑模式好酷！", "记得多喝水~", "你的代码真棒！", "排行榜更新啦！", "冲刺 15 级大神！", "今天学到了什么？"];

  const handlePetClick = () => {
    setIsBouncing(true);
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setMessage(randomQuote);
    setTimeout(() => setIsBouncing(false), 500);
    setTimeout(() => setMessage(""), 3000);
  };

  const progress = Math.min(100, Math.floor((xp / MAX_XP) * 100));

  return (
    <div className="fixed bottom-20 right-6 z-40 flex flex-col items-end pointer-events-none">
      {message && (
        <div className={`${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} border px-4 py-2 rounded-xl rounded-br-none shadow-lg mb-2 animate-fadeIn max-w-[200px] text-xs`}>
          {message}
        </div>
      )}
      <div 
        onClick={handlePetClick}
        className={`pointer-events-auto cursor-pointer p-3 rounded-full shadow-xl border-2 border-[#065fd4] hover:scale-105 transition-transform ${isBouncing ? 'animate-bounce' : ''} relative group ${darkMode ? 'bg-slate-800 border-blue-500' : 'bg-white'}`}
      >
        <Cat size={32} className={`${darkMode ? 'text-blue-400' : 'text-[#065fd4]'}`} />
        <div className={`absolute -top-1 -left-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 rounded-full border shadow-sm ${darkMode ? 'border-slate-800' : 'border-white'}`}>
          Lv.{level || 1}
        </div>
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm">
          <div className="mb-1 flex justify-between gap-4">
            <span>XP</span>
            <span>{xp}/{MAX_XP}</span>
          </div>
          <div className="w-24 h-1.5 bg-slate-600 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 子组件：项目卡片 ---
const ProjectCard = ({ p, isAdmin, handleDelete, handleEdit, onViewDetail, darkMode }) => {
  const [imgError, setImgError] = useState(false);
  const url = p.image_url || p.imageUrl; 
  const isValidUrl = url && url.startsWith('http') && !imgError;
  const formatUrl = (link) => (!link ? '' : (link.startsWith('http') ? link : `https://${link}`));

  const cardBg = darkMode ? "bg-[#0f172a] border-[#1e293b]" : "bg-white border-[#e5e5e5]";
  const textTitle = darkMode ? "text-slate-100 group-hover:text-blue-400" : "text-[#0f0f0f] group-hover:text-[#065fd4]";
  const textDesc = darkMode ? "text-slate-400" : "text-[#606060]";
  const btnBg = darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700" : "bg-[#f2f2f2] hover:bg-[#e5e5e5] text-[#0f0f0f] border-transparent";

  return (
    <div className="group cursor-pointer flex flex-col gap-3 relative transform transition-all duration-300 hover:-translate-y-2" onClick={() => onViewDetail(p)}>
      <div className={`relative aspect-video rounded-xl overflow-hidden border shadow-sm group-hover:shadow-xl transition-all ${cardBg}`}>
        {isValidUrl ? (
          <img src={url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgError(true)} alt={p.title}/>
        ) : (
          <div className={`w-full h-full flex items-center justify-center flex-col gap-2 ${darkMode ? 'bg-slate-800 text-slate-600' : 'bg-gray-100 text-gray-400'}`}>
            <Code size={40} />
            <span className="text-xs">暂无图片</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <button className="bg-white/90 text-black px-4 py-2 rounded-full font-bold text-xs transform scale-90 group-hover:scale-100 transition-all shadow-lg hover:bg-white flex items-center gap-2">
                <Eye size={14}/> 查看详情
            </button>
        </div>
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button onClick={(e) => { e.stopPropagation(); handleEdit(p); }} className="bg-blue-600/90 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors backdrop-blur-sm"><Edit3 size={14} /></button>
            <button onClick={(e) => handleDelete(e, p.objectId)} className="bg-red-600/90 text-white p-2 rounded-full shadow-md hover:bg-red-700 transition-colors backdrop-blur-sm"><Trash2 size={14} /></button>
          </div>
        )}
      </div>
      <div className="flex gap-3 pr-2 items-start">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 shrink-0 shadow-md ring-2 ${darkMode ? 'ring-slate-800' : 'ring-white'}`}></div>
        <div className="flex flex-col flex-1">
          <h3 className={`font-bold text-base line-clamp-2 leading-tight mb-1 transition-colors ${textTitle}`}>{p.title || '无标题'}</h3>
          <div className={`text-xs flex flex-col mb-1 ${textDesc}`}><span className="opacity-80">发布于 {p.createdAt ? p.createdAt.split(' ')[0] : '未知日期'}</span></div>
          <div className="flex gap-2 mt-2">
            {p.git_link ? (
              <a href={formatUrl(p.git_link)} target="_blank" rel="noreferrer" className={`text-xs px-2 py-1 rounded flex gap-1 items-center transition-colors border ${btnBg}`} onClick={e=>e.stopPropagation()}><Github size={12}/> 源码</a>
            ) : null}
          </div>
        </div>
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

  const bgMain = darkMode ? "bg-[#020617]" : "bg-white";
  const textMain = darkMode ? "text-slate-200" : "text-[#0f0f0f]";
  const headerBg = darkMode ? "bg-[#0f172a]/80 border-slate-800" : "bg-white/80 border-[#e5e5e5]";
  const iconBtn = darkMode ? "hover:bg-slate-800 text-slate-100" : "hover:bg-[#f2f2f2] text-[#0f0f0f]";
  const cardBg = darkMode ? "bg-[#0f172a] border-slate-800" : "bg-gray-100 border-[#e5e5e5]";
  const quoteBg = darkMode ? "bg-[#0f172a]/50 text-slate-300" : "bg-[#f9f9f9] text-[#0f0f0f]";

  return (
    <div className={`${bgMain} min-h-full animate-fadeIn pb-10 transition-colors`}>
      <div className={`sticky top-0 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3 z-30 transition-colors ${headerBg}`}>
        <button onClick={onBack} className={`p-2 rounded-full transition-colors ${iconBtn}`}>
          <ChevronLeft size={24} />
        </button>
        <span className={`font-bold text-lg truncate ${textMain}`}>项目详情</span>
        <div className="ml-auto flex gap-2">
            {project.git_link && (
                <a href={formatUrl(project.git_link)} target="_blank" rel="noreferrer" className={`${darkMode ? 'bg-white text-black' : 'bg-[#0f0f0f] text-white'} px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:opacity-80 transition-opacity`}>
                   <Github size={14}/> 源码
                </a>
            )}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 py-8">
         <div className="mb-8">
             <div className={`flex items-center gap-2 text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-[#606060]'}`}>
                 <span className={`px-2 py-0.5 rounded font-medium border ${darkMode ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>项目文档</span>
                 <span>•</span>
                 <span>{project.createdAt}</span>
             </div>
             <h1 className={`text-3xl sm:text-4xl font-extrabold leading-tight mb-6 ${textMain}`}>{project.title}</h1>
             
             <div className={`w-full aspect-video rounded-xl overflow-hidden border shadow-sm mb-8 ${cardBg}`}>
                {url && !imgError ? (
                    <img src={url} className="w-full h-full object-cover" onError={() => setImgError(true)} alt={project.title} />
                ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${darkMode ? 'text-slate-600' : 'text-gray-400'}`}>
                        <ImageIcon size={48} />
                        <span className="text-sm">暂无配图</span>
                    </div>
                )}
             </div>

             {project.description && (
                 <div className={`border-l-4 border-[#065fd4] p-4 rounded-r-lg mb-8 italic text-base leading-relaxed ${quoteBg}`}>
                     {project.description}
                 </div>
             )}
         </div>

         <div className={`markdown-body ${darkMode ? 'dark-mode-content' : ''} ${textMain}`}>
             {project.content ? (
                 <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
             ) : (
                 <div className={`text-center py-10 rounded-xl border border-dashed ${darkMode ? 'bg-slate-900/50 border-slate-700 text-slate-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                     <FileCheck size={32} className="mx-auto mb-2 opacity-50"/>
                     <p>该项目暂无详细文档内容。</p>
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
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
    const root = window.document.documentElement;
    if (darkMode) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        document.body.style.backgroundColor = '#020617';
        document.body.style.color = '#f1f5f9';
    } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        document.body.style.backgroundColor = '#f9f9f9';
        document.body.style.color = '#0f0f0f';
    }

    const style = document.createElement('style');
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar { width: 8px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background-color: ${darkMode ? '#475569' : '#ccc'}; border-radius: 4px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: ${darkMode ? '#64748b' : '#aaa'}; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } 
      .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      @keyframes gradient-xy { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      .animate-gradient-xy { background-size: 200% 200%; animation: gradient-xy 6s ease infinite; }
      
      .markdown-body { font-size: 16px; line-height: 1.7; word-wrap: break-word; }
      .markdown-body h1, .markdown-body h2 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; margin-top: 24px; margin-bottom: 16px; font-weight: 700; }
      .markdown-body p { margin-bottom: 16px; }
      .markdown-body ul, .markdown-body ol { padding-left: 2em; margin-bottom: 16px; list-style: disc; }
      .markdown-body blockquote { border-left: 4px solid #dfe2e5; color: #6a737d; padding: 0 1em; background-color: #f9f9f9; }
      .markdown-body code { background-color: rgba(27,31,35,0.05); padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
      .markdown-body pre { background-color: #f6f8fa; padding: 16px; overflow: auto; border-radius: 6px; margin-bottom: 16px; }
      .markdown-body img { max-width: 100%; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .markdown-body table { width: 100%; border-collapse: collapse; }
      .markdown-body th, .markdown-body td { border: 1px solid #dfe2e5; padding: 6px 13px; }
      .markdown-body tr:nth-child(2n) { background-color: #f6f8fa; }

      .dark-mode-content { color: #cbd5e1; }
      .dark-mode-content h1, .dark-mode-content h2 { border-bottom-color: #1e293b; }
      .dark-mode-content blockquote { border-left-color: #334155; color: #94a3b8; background-color: #0f172a; }
      .dark-mode-content code { background-color: rgba(100,116,139,0.2); color: #e2e8f0; }
      .dark-mode-content pre { background-color: #0f172a; border: 1px solid #1e293b; }
      .dark-mode-content th, .dark-mode-content td { border-color: #334155; }
      .dark-mode-content tr:nth-child(2n) { background-color: #0f172a; }
      .dark-mode-content table tr { background-color: #1e293b; }
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
                setCurrentUser(prev => ({...prev, xp: userObj.xp || 0, level: userObj.level || 1, lastCheckInDate: userObj.lastCheckInDate}));
             }).catch(e => {
                 if(e && e.code === 206) { window.Bmob.User.logout(); setCurrentUser(null); }
             });
          }
          updateSiteViews(window.Bmob);
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

  const handleAddXP = async (amount = 1, extraUpdates = {}) => {
    if (!bmobRef.current || !currentUser) return;
    const currentXP = Number(currentUser.xp) || 0;
    const currentLevel = Number(currentUser.level) || 1;
    let newXP = currentXP + amount;
    let newLevel = currentLevel;
    if (currentLevel < MAX_LEVEL) {
        newLevel = Math.min(MAX_LEVEL, Math.floor((newXP / MAX_XP) * (MAX_LEVEL - 1)) + 1);
        if (newXP >= MAX_XP) newLevel = MAX_LEVEL;
    } else { newXP = currentXP; }
    const updateData = { xp: newXP, level: newLevel, ...extraUpdates };
    try {
        const url = `https://api.bmobcloud.com/1/classes/_User/${currentUser.objectId}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'X-Bmob-Application-Id': BMOB_APP_ID, 'X-Bmob-Master-Key': BMOB_MASTER_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        if (!response.ok) throw new Error(await response.text());
        setCurrentUser({ ...currentUser, ...updateData });
        if (newLevel > currentLevel) alert(`恭喜！你的等级提升到了 Lv.${newLevel}！`);
    } catch (e) {
        if (getBmobErrorMsg(e) === "MASTER_KEY_MISSING") setGlobalError("MASTER_KEY_MISSING");
    }
  };

  const handleCheckIn = async () => {
    if (!bmobRef.current || !currentUser) return;
    const today = new Date().toLocaleDateString(); 
    if (currentUser.lastCheckInDate === today) { alert("今天已经签到过了哦！"); return; }
    await handleAddXP(5, { lastCheckInDate: today });
    alert("签到成功！经验 +5");
  };

  const startEditProject = (project) => { setEditingProject(project); setActiveTab('studio'); setSelectedProject(null); };

  if (globalError === "API_SAFE_TOKEN_MISSING" || globalError === "MASTER_KEY_MISSING") return <ConfigErrorScreen type={globalError} />;
  if (!isLibLoaded) return <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-800 gap-4"><Loader2 className="w-8 h-8 animate-spin text-red-600" /><p className="text-slate-500 text-sm">正在连接 Bmob 云服务...</p></div>;

  const appBg = darkMode ? 'bg-[#020617] text-slate-100' : 'bg-[#f9f9f9] text-slate-900';

  return (
    <div className={`h-full ${appBg} font-sans flex flex-col overflow-hidden transition-colors duration-300`}>
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
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSelectedProject(null); setEditingProject(null); }} currentUser={currentUser} totalViews={totalViews} onCheckIn={handleCheckIn} darkMode={darkMode} />
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          
          {selectedProject ? (
             <ProjectDetailView project={selectedProject} onBack={() => setSelectedProject(null)} darkMode={darkMode} />
          ) : (
             <div className="p-4 sm:p-6 max-w-[1600px] mx-auto min-h-full">
                {activeTab === 'home' && <HomeView Bmob={bmobRef.current} searchQuery={searchQuery} currentUser={currentUser} setGlobalError={setGlobalError} projectsUpdated={projectsUpdated} setProjectsUpdated={setProjectsUpdated} onViewDetail={setSelectedProject} onEdit={startEditProject} onNavigate={setActiveTab} darkMode={darkMode} />}
                {activeTab === 'community' && <CommunityView Bmob={bmobRef.current} searchQuery={searchQuery} currentUser={currentUser} darkMode={darkMode} />}
                {activeTab === 'discussion' && <DiscussionView Bmob={bmobRef.current} currentUser={currentUser} onInteraction={()=>handleAddXP(1)} darkMode={darkMode} />}
                {activeTab === 'leaderboard' && <LeaderboardView Bmob={bmobRef.current} currentUser={currentUser} darkMode={darkMode} />}
                {activeTab === 'studio' && <StudioView Bmob={bmobRef.current} currentUser={currentUser} setCurrentUser={setCurrentUser} setProjectsUpdated={setProjectsUpdated} editingProject={editingProject} onCancelEdit={() => setEditingProject(null)} darkMode={darkMode} />}
             </div>
          )}

          {currentUser && <InteractivePet xp={currentUser.xp || 0} level={currentUser.level || 1} darkMode={darkMode} />}
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

  const headerClass = darkMode ? "bg-[#0f172a]/80 border-slate-800" : "bg-white/80 border-[#e5e5e5]";
  const iconClass = darkMode ? "text-slate-100 hover:bg-slate-800" : "text-[#0f0f0f] hover:bg-[#f2f2f2]";
  const searchBg = darkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-[#ccc]";
  const inputColor = darkMode ? "text-slate-100 placeholder-slate-500" : "text-[#0f0f0f] placeholder-gray-500";
  const searchBtn = darkMode ? "bg-[#1e293b] border-slate-700 text-slate-300" : "bg-[#f8f8f8] border-[#ccc] text-[#0f0f0f]";

  return (
    <header className={`h-14 flex items-center justify-between px-4 backdrop-blur-md sticky top-0 z-50 border-b transition-colors duration-300 ${headerClass}`}>
      <div className="flex items-center gap-4">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-full transition-colors ${iconClass}`}><Menu size={24} /></button>
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-red-600 rounded-lg p-1 flex items-center justify-center"><Laptop size={16} className="text-white" /></div>
          <span className={`text-xl font-bold tracking-tighter font-sans relative top-[-1px] ${darkMode ? 'text-slate-100' : 'text-[#0f0f0f]'}`}>NineIce</span>
        </div>
      </div>
      <div className="hidden md:flex flex-1 max-w-[600px] mx-4">
        <div className="flex w-full group">
          <div className={`flex-1 flex items-center border rounded-l-full px-4 py-1 ml-8 shadow-inner transition-colors ${searchBg}`}>
            <input type="text" placeholder="搜索项目与动态..." className={`w-full bg-transparent outline-none text-base ${inputColor}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
            {searchQuery && (<button onClick={() => setSearchQuery('')} className="mr-2 opacity-50 hover:opacity-100"><X size={16} /></button>)}
          </div>
          <button className={`border border-l-0 px-5 rounded-r-full hover:brightness-95 transition-colors ${searchBtn}`}><Search size={20} /></button>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 relative">
        <button onClick={toggleDarkMode} className={`p-2 rounded-full transition-colors ${iconClass}`} title="切换主题">{darkMode ? <Sun size={24} /> : <Moon size={24} />}</button>
        <div className="relative">
          <button onClick={handleOpenNotif} className={`p-2 rounded-full relative transition-colors ${iconClass}`}>
            <Bell size={24} />
            {notifications.length > 0 && (<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white"></span>)}
          </button>
          {showNotifDropdown && (
            <div className={`absolute right-0 top-12 w-80 border rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn ${darkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-[#e5e5e5]'}`}>
              <div className={`p-3 border-b font-bold text-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-gray-50 border-[#e5e5e5] text-[#0f0f0f]'}`}>通知中心</div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className={`p-8 text-center text-sm ${darkMode ? 'text-slate-500' : 'text-[#606060]'}`}><CheckCircle size={32} className="mx-auto mb-2 text-green-500 opacity-50"/>没有新通知</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.objectId} onClick={() => { setActiveTab('discussion'); setShowNotifDropdown(false); }} className={`p-3 cursor-pointer border-b transition-colors ${darkMode ? 'hover:bg-slate-800 border-slate-800' : 'hover:bg-[#f2f2f2] border-[#f9f9f9]'}`}>
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{n.name ? n.name[0].toUpperCase() : '?'}</div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-slate-200' : 'text-[#0f0f0f]'}`}><span className="font-bold">{n.name}</span> {n.replyTo ? ` 回复了你` : ` 留了言`}</p>
                          <p className={`text-xs line-clamp-1 mt-0.5 ${darkMode ? 'text-slate-400' : 'text-[#606060]'}`}>"{n.message}"</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {currentUser ? (
          <button onClick={() => setActiveTab('studio')} className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-colors ${darkMode ? 'border-blue-900 bg-blue-900/30 hover:bg-blue-900/50' : 'border-purple-200 bg-purple-50 hover:bg-purple-100'}`}>
            <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">{currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}</div>
            <div className="flex flex-col items-start hidden sm:flex">
              <span className={`text-xs font-bold leading-none ${darkMode ? 'text-blue-300' : 'text-purple-900'}`}>{currentUser.username}</span>
              <span className={`text-[10px] leading-none mt-0.5 ${darkMode ? 'text-blue-400' : 'text-purple-600'}`}>Lv.{currentUser.level || 1}</span>
            </div>
          </button>
        ) : (
          <button onClick={() => setActiveTab('studio')} className={`flex items-center gap-2 border px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${darkMode ? 'border-slate-700 text-blue-400 hover:bg-slate-800' : 'border-[#e5e5e5] text-[#065fd4] hover:bg-[#def1ff]'}`}><User size={20} className="w-5 h-5" /> 登录</button>
        )}
      </div>
    </header>
  );
}

function Sidebar({ isOpen, activeTab, setActiveTab, currentUser, totalViews, onCheckIn, darkMode }) {
  if (!isOpen) return null;
  
  const sidebarClass = darkMode ? "bg-[#0f172a]/80 border-slate-800" : "bg-white border-[#f0f0f0]";
  const menuActive = darkMode ? "bg-slate-800 text-slate-100 font-medium" : "bg-[#f2f2f2] text-[#0f0f0f] font-medium";
  const menuInactive = darkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-[#f2f2f2] text-[#0f0f0f]";
  const iconActive = darkMode ? "text-slate-100" : "text-[#0f0f0f]";
  const iconInactive = darkMode ? "text-slate-500" : "text-[#606060]";

  const MenuItem = ({ id, icon: Icon, label }) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-5 px-3 py-2.5 rounded-lg mb-1 transition-colors ${activeTab === id ? menuActive : menuInactive}`}>
      <Icon size={24} className={activeTab === id ? iconActive : iconInactive} strokeWidth={activeTab === id ? 2.5 : 2}/><span className="text-sm tracking-wide truncate">{label}</span>
    </button>
  );
  
  const isAdmin = currentUser && currentUser.username === ADMIN_USERNAME;
  const isCheckedIn = currentUser && currentUser.lastCheckInDate === (new Date().toLocaleDateString());

  return (
    <aside className={`w-[240px] flex-shrink-0 overflow-y-auto px-3 pb-4 hidden md:block custom-scrollbar pt-3 backdrop-blur-md h-[calc(100vh-56px)] flex flex-col border-r transition-colors duration-300 ${sidebarClass}`}>
      <div className={`border-b pb-3 mb-3 ${darkMode ? 'border-slate-800' : 'border-[#e5e5e5]'}`}>
        <MenuItem id="home" icon={Home} label="首页 (项目)" />
        <MenuItem id="community" icon={Compass} label="日常动态" />
        <MenuItem id="discussion" icon={MessageSquare} label="留言板" />
        <MenuItem id="leaderboard" icon={Trophy} label="排行榜" />
      </div>
      <div className={`border-b pb-3 mb-3 ${darkMode ? 'border-slate-800' : 'border-[#e5e5e5]'}`}>
        <h3 className={`px-3 py-2 text-base font-bold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-[#0f0f0f]'}`}>{isAdmin ? "管理员后台" : "个人中心"}</h3>
        <MenuItem id="studio" icon={LayoutDashboard} label={isAdmin ? "管理控制台" : "我的账号"} />
      </div>
      
      <div className="mt-auto px-3 mb-2 space-y-2">
        {currentUser && (
          <button onClick={onCheckIn} disabled={isCheckedIn} className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-sm ${isCheckedIn ? (darkMode ? 'bg-slate-800 text-slate-500' : 'bg-gray-100 text-gray-400') : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300 hover:scale-[1.02]'}`}>
            {isCheckedIn ? <><CheckCircle size={16}/> 今日已签到</> : <><CalendarCheck size={16}/> 每日签到 (+5 XP)</>}
          </button>
        )}
        <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer group ${darkMode ? 'border-slate-700 hover:border-blue-900 hover:bg-blue-900/10' : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'}`}>
           <p className={`text-xs font-bold transition-colors ${darkMode ? 'text-slate-400 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-blue-500'}`}>📢 广告摊位</p>
           <p className={`text-[10px] mt-1 transition-colors ${darkMode ? 'text-slate-600' : 'text-gray-300'}`}>联系博主投放</p>
        </div>
      </div>

      <div className={`px-3 py-4 text-[12px] font-medium leading-relaxed ${darkMode ? 'text-slate-500' : 'text-[#606060]'}`}>
        <div className={`flex items-center gap-2 mb-2 p-2 rounded border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
          <Eye size={14} /> <span>全站浏览: {totalViews}</span>
        </div>
        <p className="mb-1">关于 • 开发者 • 联系方式</p>
        <p>cailixian2@gmail.com</p>
        <p>© 2026 NineIce</p>
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
    if (!confirm("确定要删除这个项目吗？")) return;
    try { const q = Bmob.Query("projects"); await q.destroy(id); fetchProjects(); } catch(err) { fetchProjects(); }
  };

  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (p.title && p.title.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q));
  });

  if (loading) return <div className={`py-20 text-center flex flex-col items-center gap-2 ${darkMode ? 'text-slate-500' : 'text-[#606060]'}`}><Loader2 className="animate-spin"/>加载项目...</div>;

  return (
    <div>
      <HeroBanner user={currentUser} onViewDetail={onViewDetail} onScroll={handleScroll} onRegister={() => onNavigate('studio')} />
      
      <div ref={projectsRef} className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar scroll-mt-20">
         {['全部', 'Web开发', '移动端', '设计', 'AI工具', '笔记'].map((tag,i) => (
           <button key={i} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${i===0 ? (darkMode ? 'bg-slate-100 text-black' : 'bg-[#0f0f0f] text-white') : (darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e5e5e5]')}`}>{tag}</button>
         ))}
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className={`col-span-full text-center py-20 ${darkMode ? 'text-slate-500' : 'text-[#606060]'}`}>
          {searchQuery ? `未找到包含 "${searchQuery}" 的项目` : "暂无项目，请去后台发布一个，并确保 Key 设置正确"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 animate-fadeIn">
          {filteredProjects.map(p => (
            <ProjectCard key={p.objectId} p={p} isAdmin={isAdmin} handleDelete={handleDelete} handleEdit={onEdit} onViewDetail={onViewDetail} darkMode={darkMode} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- 极客排行榜 ---
function LeaderboardView({ Bmob, darkMode }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!Bmob) return;
        const q = Bmob.Query("_User");
        q.order("-xp");
        q.limit(20);
        q.find().then(res => {
            if (Array.isArray(res)) setUsers(res);
            setLoading(false);
        }).catch(e => { console.error(e); setLoading(false); });
    }, [Bmob]);

    const getMedal = (index) => {
        if (index === 0) return <Medal size={24} className="text-yellow-400 fill-yellow-400 animate-pulse" />;
        if (index === 1) return <Medal size={24} className="text-slate-400 fill-slate-300" />;
        if (index === 2) return <Medal size={24} className="text-orange-400 fill-orange-300" />;
        return <span className={`font-bold w-6 text-center ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>{index + 1}</span>;
    };

    if (loading) return <div className={`py-20 text-center ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}><Loader2 className="w-8 h-8 animate-spin mx-auto"/>正在计算排名...</div>;

    const tableHeader = darkMode ? "bg-slate-900 border-slate-700 text-slate-400" : "bg-gray-50 border-gray-200 text-gray-500";
    const rowHover = darkMode ? "hover:bg-slate-700/50 border-slate-800" : "hover:bg-gray-50 border-gray-100";
    const textMain = darkMode ? "text-slate-100" : "text-gray-900";

    return (
        <div className="max-w-[800px] mx-auto animate-fadeIn pt-4">
            <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-2xl text-white shadow-lg">
                <Trophy size={48} className="text-white fill-white/20"/>
                <div><h2 className="text-2xl font-bold">极客积分排行榜</h2><p className="opacity-90">看看谁是全站最强开发者？勤签到、多互动！</p></div>
            </div>
            <div className={`rounded-xl border shadow-sm overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <table className="w-full text-left">
                    <thead className={`border-b ${tableHeader}`}>
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase">排名</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase">极客</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase">等级</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-right">XP 经验值</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-gray-100'}`}>
                        {users.map((u, index) => (
                            <tr key={u.objectId} className={`transition-colors ${rowHover} ${index < 3 ? (darkMode ? 'bg-yellow-900/10' : 'bg-yellow-50/30') : ''}`}>
                                <td className="px-6 py-4 flex justify-center sm:justify-start"><div className="w-8 flex justify-center">{getMedal(index)}</div></td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-blue-500'}`}>{u.username ? u.username[0].toUpperCase() : '?'}</div>
                                        <span className={`font-medium ${index === 0 ? 'text-yellow-500 font-bold' : textMain}`}>{u.username}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>Lv.{u.level || 1}</span></td>
                                <td className={`px-6 py-4 text-right font-mono font-medium ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>{u.xp || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
  const handleDelete = async (id) => { if (!confirm("确定删除？")) return; try { const q = Bmob.Query("blogs"); await q.destroy(id); fetchBlogs(); } catch(err) { fetchBlogs(); } };
  const handleLike = async (id, currentLikes) => {
    try { setBlogs(blogs.map(b => b.objectId === id ? { ...b, likes: (b.likes || 0) + 1 } : b)); const q = Bmob.Query("blogs"); await q.get(id).then(res => { res.set('likes', (res.likes || 0) + 1); res.save(); }); } catch(e) {}
  };
  const filteredBlogs = blogs.filter(b => (!searchQuery) || (b.content && b.content.toLowerCase().includes(searchQuery.toLowerCase())));

  const cardClass = darkMode ? "bg-slate-800 border-slate-700 hover:shadow-slate-900" : "bg-white border-[#e5e5e5] hover:shadow-md";
  const textMain = darkMode ? "text-slate-100" : "text-[#0f0f0f]";
  const textSub = darkMode ? "text-slate-400" : "text-[#606060]";

  return (
    <div className="max-w-[850px] mx-auto pt-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-4"><h2 className={`text-xl font-bold ${textMain}`}>动态墙</h2><div className={`flex gap-4 text-sm ${textSub}`}><span className={`${textMain} font-medium border-b-2 border-current pb-1`}>全部</span></div></div>
      <div className="space-y-4">
        {filteredBlogs.length === 0 && searchQuery ? (<div className={`text-center py-10 ${textSub}`}>未找到相关动态</div>) : (
          filteredBlogs.map(b => (
            <div key={b.objectId} className={`border rounded-xl p-4 transition-shadow relative group ${cardClass}`}>
              {isAdmin && <button onClick={() => handleDelete(b.objectId)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600" title="删除"><Trash2 size={18} /></button>}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 shrink-0 flex items-center justify-center font-bold text-sm text-white">D</div>
                <div className="flex-1">
                  <div className="flex gap-2 items-center mb-1"><span className={`font-bold text-sm ${textMain}`}>博主动态</span><span className={`text-xs ${textSub}`}>{b.createdAt}</span></div>
                  <p className={`text-sm whitespace-pre-wrap leading-relaxed mb-3 ${darkMode ? 'text-slate-200' : 'text-[#0f0f0f]'}`}>{b.content}</p>
                  <button onClick={() => handleLike(b.objectId, b.likes)} className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs active:scale-95 transition-transform ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-[#f2f2f2] text-[#606060]'}`}><ThumbsUp size={16} /> {b.likes || 0}</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- 留言板 ---
function DiscussionView({ Bmob, currentUser, onInteraction, darkMode }) {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null); 
  const msgInputRef = useRef(null);
  const isAdmin = currentUser && currentUser.username === ADMIN_USERNAME;

  useEffect(() => { if (currentUser && currentUser.username) setName(currentUser.username); }, [currentUser]);
  const fetchMessages = () => { 
    if (!Bmob) return; 
    const q = Bmob.Query("guestbook");
    q.order("-createdAt");
    q.find().then(res => { if(Array.isArray(res)) setMessages(res); }); 
  };
  useEffect(() => { fetchMessages(); }, [Bmob]);
  const handleDelete = async (id) => { if (!confirm("删除？")) return; try { const q = Bmob.Query("guestbook"); await q.destroy(id); fetchMessages(); } catch(err) { fetchMessages(); } };
  const handleLike = async (id) => { setMessages(messages.map(m => m.objectId === id ? { ...m, likes: (m.likes || 0) + 1 } : m)); const q = Bmob.Query("guestbook"); await q.get(id).then(res => { res.set('likes', (res.likes || 0) + 1); res.save(); }); };
  const handleReplyClick = (targetName) => { setReplyTarget(targetName); if(msgInputRef.current) msgInputRef.current.focus(); };
  const cancelReply = () => { setReplyTarget(null); };
  const handleSubmit = (e) => { e.preventDefault(); if (!name.trim() || !msg.trim()) return; setLoading(true); const query = Bmob.Query("guestbook"); query.set("name", name); query.set("message", msg); query.set("likes", 0); if (replyTarget) query.set("replyTo", replyTarget); query.save().then(() => { if(!currentUser) setName(''); setMsg(''); setReplyTarget(null); setLoading(false); fetchMessages(); if (onInteraction) onInteraction(); }).catch(err => { setLoading(false); }); };

  const inputClass = darkMode ? "border-slate-700 focus:border-slate-500 text-slate-100 placeholder-slate-500" : "border-[#e5e5e5] focus:border-[#0f0f0f] text-[#0f0f0f] placeholder-[#606060]";
  const textMain = darkMode ? "text-slate-100" : "text-[#0f0f0f]";
  const textSub = darkMode ? "text-slate-400" : "text-[#606060]";

  return (
    <div className="max-w-[850px] mx-auto pt-2 animate-fadeIn">
      <div className="mb-6">
        <h2 className={`text-xl font-bold mb-6 ${textMain}`}>{messages.length} 条留言</h2>
        <div className="flex gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold shrink-0 text-white">{currentUser ? (currentUser.username[0].toUpperCase()) : '?'}</div>
          <form onSubmit={handleSubmit} className="flex-1">
            {replyTarget && (<div className={`flex items-center justify-between px-3 py-1.5 rounded-t-lg mb-1 border-b ${darkMode ? 'bg-blue-900/20 border-blue-900' : 'bg-blue-50 border-blue-100'}`}><span className="text-xs text-blue-500 font-medium">回复 @{replyTarget}</span><button type="button" onClick={cancelReply} className="text-blue-400"><X size={14}/></button></div>)}
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="称呼..." className={`w-full bg-transparent border-b outline-none pb-1 mb-2 text-sm ${inputClass}`} disabled={!!currentUser}/>
            <input ref={msgInputRef} value={msg} onChange={e=>setMsg(e.target.value)} placeholder={replyTarget ? `回复...` : "留言..."} className={`w-full bg-transparent border-b outline-none pb-1 text-sm ${inputClass}`}/>
            <div className="flex justify-end mt-2"><button disabled={loading || !name || !msg} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${(!name || !msg) ? (darkMode ? 'bg-slate-800 text-slate-600' : 'bg-[#f2f2f2] text-[#909090]') : 'bg-[#065fd4] text-white hover:bg-[#0056bf]'}`}>{loading ? '...' : '发布'}</button></div>
          </form>
        </div>
      </div>
      <div className="space-y-6">
        {messages.map(m => (
          <div key={m.objectId} className="flex gap-4 group relative">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center font-bold shrink-0 text-sm text-white">{m.name ? m.name[0].toUpperCase() : 'A'}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1"><span className={`text-xs font-bold px-2 py-0.5 rounded-full cursor-pointer ${darkMode ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' : 'bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e5e5e5]'}`}>@{m.name}</span><span className={`text-xs ${textSub}`}>{m.createdAt}</span></div>
              {m.replyTo && (<div className={`text-xs inline-block px-1.5 py-0.5 rounded mb-1 text-blue-500 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>回复 @{m.replyTo}</div>)}
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-200' : 'text-[#0f0f0f]'}`}>{m.message}</p>
              <div className="flex items-center gap-3 mt-2">
                <div onClick={()=>handleLike(m.objectId)} className={`flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors ${textSub}`}><ThumbsUp size={14} /> <span className="text-xs">{m.likes || 0}</span></div>
                <button onClick={() => handleReplyClick(m.name)} className={`text-xs font-medium hover:text-blue-500 cursor-pointer ml-2 ${textSub}`}>回复</button>
              </div>
            </div>
            {isAdmin && <button onClick={() => handleDelete(m.objectId)} className="absolute top-0 right-0 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 后台管理 ---
function StudioView({ Bmob, currentUser, setCurrentUser, setProjectsUpdated, editingProject, onCancelEdit, darkMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pContent, setPContent] = useState(''); 
  const [pLink, setPLink] = useState('');
  const [pImg, setPImg] = useState('');
  const [bContent, setBContent] = useState('');
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
  const handleLogin = (e) => { e.preventDefault(); if (Bmob) { Bmob.User.login(username, password).then(res => { setCurrentUser(res); }).catch(err => { alert("登录失败"); }); } };
  const handleRegister = () => { if (Bmob) { Bmob.User.register({ username, password }).then(res => { alert("注册成功"); }).catch(err => alert("注册失败")); } };
  const handleLogout = () => { if (Bmob) { Bmob.User.logout(); setCurrentUser(null); } };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      if (!pTitle.trim()) { alert("请输入项目标题"); setIsUploading(false); return; }
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
      alert(editingProject ? `✅ 更新成功!` : `✅ 发布成功!`); 
      clearForm();
    } catch (err) { alert("操作失败"); } finally { setIsUploading(false); }
  };

  const handleAddBlog = (e) => {
    e.preventDefault();
    if (Bmob) { const query = Bmob.Query("blogs"); query.set("content", bContent); query.set("likes", 0); query.save().then(res => { alert("动态发布成功"); setBContent(''); }); }
  };

  // 样式
  const cardClass = darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-[#e5e5e5]";
  const inputClass = darkMode ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500" : "bg-[#f9f9f9] border-[#ccc] text-[#0f0f0f] placeholder-gray-500 focus:border-[#065fd4]";
  const labelClass = darkMode ? "text-slate-400" : "text-[#606060]";
  const textMain = darkMode ? "text-slate-100" : "text-[#0f0f0f]";

  if (!currentUser) {
    return (
      <div className={`max-w-md mx-auto mt-20 p-8 rounded-xl border text-center shadow-lg animate-fadeIn ${cardClass}`}>
        <Lock size={32} className="text-[#065fd4] mx-auto mb-4" /><h2 className={`text-xl font-bold mb-6 ${textMain}`}>账号登录</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="用户名" className={`w-full p-3 rounded outline-none border transition-colors ${inputClass}`}/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="密码" className={`w-full p-3 rounded outline-none border transition-colors ${inputClass}`}/>
          <div className="flex gap-2"><button type="submit" className="flex-1 bg-[#065fd4] text-white font-medium py-2 rounded hover:bg-[#0056bf] transition-colors">登录</button><button type="button" onClick={handleRegister} className={`flex-1 font-medium py-2 rounded transition-colors ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e5e5e5]'}`}>注册</button></div>
        </form>
        <p className={`text-xs mt-4 ${labelClass}`}>登录后可参与评论。如果您是管理员，将进入后台。</p>
      </div>
    );
  }

  const isAdmin = currentUser.username === ADMIN_USERNAME;
  if (!isAdmin) {
    return (
      <div className={`max-w-md mx-auto mt-20 p-8 rounded-xl border text-center shadow-lg animate-fadeIn ${cardClass}`}>
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600 font-bold text-2xl">{currentUser.username[0].toUpperCase()}</div>
        <h2 className={`text-xl font-bold mb-2 ${textMain}`}>欢迎，{currentUser.username}</h2><p className={`mb-6 ${labelClass}`}>您已登录。</p>
        <button onClick={handleLogout} className={`w-full border font-medium py-2 rounded flex items-center justify-center gap-2 ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-[#e5e5e5] text-[#0f0f0f] hover:bg-[#f2f2f2]'}`}><LogOut size={16}/> 退出登录</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pt-6 animate-fadeIn px-4">
      <div className={`flex justify-between items-center mb-8 border-b pb-4 ${darkMode ? 'border-slate-700' : 'border-[#e5e5e5]'}`}><h2 className={`text-2xl font-bold flex items-center gap-2 ${textMain}`}><LayoutDashboard size={28} className="text-red-600"/>管理员控制台</h2><div className="flex items-center gap-4"><span className={`text-sm hidden sm:inline ${labelClass}`}>当前身份: <span className="text-[#065fd4] font-medium">{currentUser.username}</span></span><button onClick={handleLogout} className={`flex items-center gap-2 font-medium text-sm border px-3 py-1.5 rounded-full ${darkMode ? 'border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700' : 'border-[#e5e5e5] text-[#606060] hover:text-[#0f0f0f] hover:bg-[#f2f2f2]'}`}><LogOut size={16}/> 退出</button></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className={`p-6 rounded-xl border shadow-sm flex flex-col h-full ${cardClass} ${editingProject ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
          <div className={`flex items-center justify-between mb-6 pb-4 border-b ${darkMode ? 'border-slate-700' : 'border-[#f2f2f2]'}`}>
            <div className="flex items-center gap-3"><div className={`p-2 rounded-full ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}><Upload size={20} className={darkMode ? 'text-blue-400' : 'text-[#065fd4]'}/></div><h3 className={`font-bold text-lg ${textMain}`}>{editingProject ? '编辑项目' : '发布项目'}</h3></div>
            {editingProject && (<button onClick={clearForm} className="text-xs text-red-500 font-medium border border-red-500/20 px-2 py-1 rounded">取消编辑</button>)}
          </div>
          <form onSubmit={handleAddProject} className="flex-1 flex flex-col gap-4">
            <div><label className={`block text-xs font-medium mb-1.5 ${labelClass}`}>标题</label><input value={pTitle} onChange={e=>setPTitle(e.target.value)} className={`w-full p-3 rounded outline-none border transition-colors ${inputClass}`}/></div>
            <div><label className={`block text-xs font-medium mb-1.5 ${labelClass}`}>简介</label><textarea value={pDesc} onChange={e=>setPDesc(e.target.value)} className={`w-full h-20 resize-none p-3 rounded outline-none border transition-colors ${inputClass}`}/></div>
            <div className="flex-1 flex flex-col">
              <label className={`block text-xs font-medium mb-1.5 flex items-center justify-between ${labelClass}`}><span className="flex items-center gap-1"><BookOpen size={12}/> 详情 (Markdown)</span><button type="button" onClick={() => setIsPreview(!isPreview)} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>{isPreview ? '编辑' : '预览'}</button></label>
              {isPreview ? (<div className={`w-full h-full min-h-[150px] overflow-auto markdown-body p-4 border rounded ${darkMode ? 'dark-mode-content bg-slate-900 border-slate-700' : 'bg-white border-blue-100'}`} dangerouslySetInnerHTML={{ __html: parseMarkdownSafe(pContent) }} />) : (<textarea value={pContent} onChange={e=>setPContent(e.target.value)} className={`w-full h-full resize-none min-h-[150px] font-mono text-xs p-3 rounded outline-none border transition-colors ${inputClass}`}/>)}
            </div>
            <div className="grid grid-cols-1 gap-4">
               <div><label className={`block text-xs font-medium mb-1.5 ${labelClass}`}>封面链接</label><input value={pImg} onChange={e=>setPImg(e.target.value)} className={`w-full p-3 rounded outline-none border transition-colors ${inputClass}`}/></div>
               <div><label className={`block text-xs font-medium mb-1.5 ${labelClass}`}>GitHub</label><input value={pLink} onChange={e=>setPLink(e.target.value)} className={`w-full p-3 rounded outline-none border transition-colors ${inputClass}`}/></div>
            </div>
            <div className="mt-auto pt-4"><button disabled={isUploading} className={`w-full text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-sm active:transform active:scale-[0.99] disabled:bg-slate-400 ${editingProject ? 'bg-green-600 hover:bg-green-700' : 'bg-[#065fd4] hover:bg-[#0056bf]'}`}>{isUploading ? '处理中...' : (editingProject ? '更新' : '发布')}</button></div>
          </form>
        </div>
        <div className={`p-6 rounded-xl border shadow-sm flex flex-col h-full ${cardClass}`}>
          <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${darkMode ? 'border-slate-700' : 'border-[#f2f2f2]'}`}><div className={`p-2 rounded-full ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}><PenTool size={20} className={darkMode ? 'text-green-400' : 'text-[#0fa958]'}/> </div><h3 className={`font-bold text-lg ${textMain}`}>发布动态</h3></div>
          <form onSubmit={handleAddBlog} className="flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col"><label className={`block text-xs font-medium mb-1.5 ${labelClass}`}>动态内容</label><textarea value={bContent} onChange={e=>setBContent(e.target.value)} className={`flex-1 resize-none min-h-[320px] w-full p-3 rounded outline-none border transition-colors ${inputClass}`}/></div>
            <div className="mt-auto pt-4"><button className="w-full bg-[#065fd4] text-white font-medium py-2.5 rounded-lg text-sm hover:bg-[#0056bf] transition-colors shadow-sm">发布动态</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ConfigErrorScreen({ type }) {
  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#0f0f0f] flex items-center justify-center p-4">
      <div className="max-w-md text-center bg-white p-8 rounded-xl border border-[#e5e5e5] shadow-lg">
        <AlertTriangle size={64} className="mx-auto text-red-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">{type === "MASTER_KEY_MISSING" ? "缺少 Master Key" : "配置错误"}</h1>
        <p className="text-[#606060] mb-6">请检查代码顶部的 Bmob 配置。</p>
        <button onClick={()=>window.location.reload()} className="bg-[#065fd4] text-white px-6 py-2 rounded-full hover:bg-[#0056bf] mt-6">刷新页面</button>
      </div>
    </div>
  );
}