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

// --- 错误处理工具 ---
const getBmobErrorMsg = (err) => {
  const errorStr = JSON.stringify(err);
  if (errorStr.includes("safeToken") || (err.error && err.error.includes("safeToken"))) return "API_SAFE_TOKEN_MISSING";
  if (errorStr.includes("MasterKey") || (err.error && err.error.includes("MasterKey"))) return "MASTER_KEY_MISSING";
  if (errorStr.includes("502")) return "SERVER_GATEWAY_ERROR (502)";
  return err.error || errorStr;
};

// --- 内置轻量级 Markdown 解析器 (零依赖) ---
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
    
    {/* Decorative Elements */}
    <div className="absolute -top-20 -right-20 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
  </div>
);

// --- 子组件：互动小宠物 ---
const InteractivePet = ({ currentUser, xp, level }) => {
  const [message, setMessage] = useState("");
  const [isBouncing, setIsBouncing] = useState(false);
  
  const quotes = [
    "暗黑模式好酷！",
    "记得多喝水~",
    "你的代码真棒！",
    "排行榜更新啦！",
    "冲刺 15 级大神！",
    "今天学到了什么？",
    "休息一下眼睛吧"
  ];

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
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl rounded-br-none shadow-lg mb-2 animate-fadeIn max-w-[200px] text-xs text-slate-800 dark:text-slate-200">
          {message}
        </div>
      )}
      <div 
        onClick={handlePetClick}
        className={`pointer-events-auto cursor-pointer bg-white dark:bg-slate-800 p-3 rounded-full shadow-xl border-2 border-[#065fd4] dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 transition-transform ${isBouncing ? 'animate-bounce' : ''} relative group`}
      >
        <Cat size={32} className="text-[#065fd4] dark:text-blue-400" />
        <div className="absolute -top-1 -left-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 rounded-full border border-white dark:border-slate-800 shadow-sm">
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
const ProjectCard = ({ p, isAdmin, handleDelete, handleEdit, onViewDetail }) => {
  const [imgError, setImgError] = useState(false);
  const url = p.image_url || p.imageUrl; 
  const isValidUrl = url && url.startsWith('http') && !imgError;
  const formatUrl = (link) => (!link ? '' : (link.startsWith('http') ? link : `https://${link}`));

  return (
    <div className="group cursor-pointer flex flex-col gap-3 relative transform transition-all duration-300 hover:-translate-y-2" onClick={() => onViewDetail(p)}>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm group-hover:shadow-xl transition-all">
        {isValidUrl ? (
          <img src={url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgError(true)} alt={p.title}/>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 flex-col gap-2">
            <Code size={40} />
            <span className="text-xs">暂无图片</span>
          </div>
        )}
        {/* Hover Actions */}
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
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 shrink-0 shadow-md ring-2 ring-white dark:ring-slate-800"></div>
        <div className="flex flex-col flex-1">
          <h3 className="text-slate-900 dark:text-slate-100 font-bold text-base line-clamp-2 leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.title || '无标题'}</h3>
          <div className="text-slate-500 dark:text-slate-400 text-xs flex flex-col mb-1"><span className="opacity-80">发布于 {p.createdAt ? p.createdAt.split(' ')[0] : '未知日期'}</span></div>
          <div className="flex gap-2 mt-2">
            {p.git_link ? (
              <a href={formatUrl(p.git_link)} target="_blank" rel="noreferrer" className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-2 py-1 rounded text-slate-800 dark:text-slate-200 flex gap-1 items-center transition-colors border border-slate-200 dark:border-slate-600" onClick={e=>e.stopPropagation()}><Github size={12}/> 源码</a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 子组件：项目详情页 ---
const ProjectDetailView = ({ project, onBack }) => {
  const [imgError, setImgError] = useState(false);
  const url = project.image_url || project.imageUrl;
  const htmlContent = parseMarkdownSafe(project.content || '');
  const formatUrl = (link) => (!link ? '' : (link.startsWith('http') ? link : `https://${link}`));

  return (
    <div className="bg-white dark:bg-slate-950 min-h-full animate-fadeIn pb-10">
      <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3 z-30 transition-colors">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-900 dark:text-slate-100 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <span className="font-bold text-lg truncate text-slate-900 dark:text-slate-100">项目详情</span>
        <div className="ml-auto flex gap-2">
            {project.git_link && (
                <a href={formatUrl(project.git_link)} target="_blank" rel="noreferrer" className="bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
                   <Github size={14}/> 源码
                </a>
            )}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 py-8">
         <div className="mb-8">
             <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                 <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-medium border border-blue-100 dark:border-blue-800">项目文档</span>
                 <span>•</span>
                 <span>{project.createdAt}</span>
             </div>
             <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">{project.title}</h1>
             
             <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
                {url && !imgError ? (
                    <img src={url} className="w-full h-full object-cover" onError={() => setImgError(true)} alt={project.title} />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2">
                        <ImageIcon size={48} />
                        <span className="text-sm">暂无配图</span>
                    </div>
                )}
             </div>

             {project.description && (
                 <div className="bg-slate-50 dark:bg-slate-800/50 border-l-4 border-[#065fd4] p-4 rounded-r-lg mb-8 text-slate-700 dark:text-slate-300 italic text-base leading-relaxed">
                     {project.description}
                 </div>
             )}
         </div>

         <div className="markdown-body dark:markdown-dark text-slate-900 dark:text-slate-200">
             {project.content ? (
                 <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
             ) : (
                 <div className="text-center py-10 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
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
  
  // 暗黑模式状态 - 核心修复：更稳健的初始化
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        const pref = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return saved === 'dark' || (!saved && pref);
    }
    return false;
  });

  // 核心修复：直接同步 DOM class，解决部署后不生效问题
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  useEffect(() => {
    // 注入全局样式 - 优化了 Dark Mode 颜色为 Slate 系
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar { width: 8px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background-color: ${darkMode ? '#475569' : '#ccc'}; border-radius: 4px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: ${darkMode ? '#64748b' : '#aaa'}; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      
      .studio-input { @apply bg-[#f9f9f9] dark:bg-slate-800 border border-[#ccc] dark:border-slate-700 rounded p-3 text-slate-900 dark:text-slate-100 outline-none focus:border-[#065fd4] placeholder-slate-500 text-sm focus:bg-white dark:focus:bg-slate-900 transition-colors focus:ring-1 focus:ring-[#065fd4]; }
      
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } 
      .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      
      @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
      }
      .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 6s ease infinite;
      }

      /* Markdown Light */
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

      /* Markdown Dark Overrides - Slate Theme */
      .dark .markdown-body { color: #cbd5e1; }
      .dark .markdown-body h1, .dark .markdown-body h2 { border-bottom-color: #1e293b; }
      .dark .markdown-body blockquote { border-left-color: #334155; color: #94a3b8; background-color: #0f172a; }
      .dark .markdown-body code { background-color: rgba(100,116,139,0.2); color: #e2e8f0; }
      .dark .markdown-body pre { background-color: #0f172a; border: 1px solid #1e293b; }
      .dark .markdown-body th, .dark .markdown-body td { border-color: #334155; }
      .dark .markdown-body tr:nth-child(2n) { background-color: #0f172a; }
      .dark .markdown-body table tr { background-color: #1e293b; }
    `;
    document.head.appendChild(style);

    // Bmob Init
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
    return () => { document.head.removeChild(style); };
  }, [darkMode]);

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
    const currentXP = currentUser.xp || 0;
    const currentLevel = currentUser.level || 1;
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
            headers: {
                'X-Bmob-Application-Id': BMOB_APP_ID,
                'X-Bmob-Master-Key': BMOB_MASTER_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        if (!response.ok) throw new Error(await response.text());
        setCurrentUser({ ...currentUser, ...updateData });
        if (newLevel > currentLevel) alert(`恭喜！你的等级提升到了 Lv.${newLevel}！`);
    } catch (e) {
        console.error("XP update failed", e);
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

  return (
    <div className={`${darkMode ? 'dark' : ''} h-full`}>
      <div className="min-h-screen bg-[#f9f9f9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col overflow-hidden transition-colors duration-300">
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
          <Sidebar isOpen={isSidebarOpen} activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSelectedProject(null); setEditingProject(null); }} currentUser={currentUser} totalViews={totalViews} onCheckIn={handleCheckIn} />
          <main className="flex-1 overflow-y-auto custom-scrollbar relative">
            
            {selectedProject ? (
               <ProjectDetailView project={selectedProject} onBack={() => setSelectedProject(null)} />
            ) : (
               <div className="p-4 sm:p-6 max-w-[1600px] mx-auto min-h-full">
                  {activeTab === 'home' && <HomeView Bmob={bmobRef.current} searchQuery={searchQuery} currentUser={currentUser} setGlobalError={setGlobalError} projectsUpdated={projectsUpdated} setProjectsUpdated={setProjectsUpdated} onViewDetail={setSelectedProject} onEdit={startEditProject} onNavigate={setActiveTab} />}
                  {activeTab === 'community' && <CommunityView Bmob={bmobRef.current} searchQuery={searchQuery} currentUser={currentUser} />}
                  {activeTab === 'discussion' && <DiscussionView Bmob={bmobRef.current} currentUser={currentUser} onInteraction={()=>handleAddXP(1)} />}
                  {activeTab === 'leaderboard' && <LeaderboardView Bmob={bmobRef.current} currentUser={currentUser} />}
                  {activeTab === 'studio' && <StudioView Bmob={bmobRef.current} currentUser={currentUser} setCurrentUser={setCurrentUser} setProjectsUpdated={setProjectsUpdated} editingProject={editingProject} onCancelEdit={() => setEditingProject(null)} />}
               </div>
            )}

            {currentUser && <InteractivePet currentUser={currentUser} xp={currentUser.xp || 0} level={currentUser.level || 1} />}
          </main>
        </div>
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
        if (Array.isArray(res)) {
          const newNotifs = res.filter(msg => {
            if (msg.createdAt <= lastReadTime) return false;
            if (currentUser && msg.name === currentUser.username) return false;
            if (isAdmin) return true; 
            else if (currentUser) return msg.replyTo === currentUser.username;
            return false;
          });
          setNotifications(newNotifs);
        }
      } catch (e) {}
    };
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [Bmob, currentUser, isAdmin]);

  const handleOpenNotif = () => {
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown && notifications.length > 0) {
      const newestTime = notifications[0].createdAt;
      localStorage.setItem('last_notif_time', newestTime);
    }
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-900 dark:text-slate-100 transition-colors"><Menu size={24} /></button>
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-red-600 rounded-lg p-1 flex items-center justify-center"><Laptop size={16} className="text-white" /></div>
          <span className="text-xl font-bold tracking-tighter font-sans text-slate-900 dark:text-slate-100 relative top-[-1px]">NineIce</span>
        </div>
      </div>
      <div className="hidden md:flex flex-1 max-w-[600px] mx-4">
        <div className="flex w-full group">
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-l-full px-4 py-1 ml-8 group-focus-within:border-blue-500 shadow-inner transition-colors">
            <input type="text" placeholder="搜索项目与动态..." className="w-full bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder-slate-500 text-base" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
            {searchQuery && (<button onClick={() => setSearchQuery('')} className="mr-2 text-slate-500 hover:text-slate-700"><X size={16} /></button>)}
          </div>
          <button className="bg-slate-100 dark:bg-slate-700 border border-l-0 border-slate-300 dark:border-slate-700 px-5 rounded-r-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><Search size={20} className="text-slate-600 dark:text-slate-300" /></button>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 relative">
        <button onClick={toggleDarkMode} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-colors" title="切换主题">
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        <div className="relative">
          <button onClick={handleOpenNotif} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 relative transition-colors">
            <Bell size={24} />
            {notifications.length > 0 && (<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white dark:border-slate-900"></span>)}
          </button>
          {showNotifDropdown && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-bold text-sm text-slate-900 dark:text-slate-100">通知中心</div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm"><CheckCircle size={32} className="mx-auto mb-2 text-green-500 opacity-50"/>没有新通知</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.objectId} onClick={() => { setActiveTab('discussion'); setShowNotifDropdown(false); }} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800 transition-colors">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xs font-bold shrink-0">{n.name ? n.name[0].toUpperCase() : '?'}</div>
                        <div>
                          <p className="text-sm text-slate-900 dark:text-slate-100"><span className="font-bold">{n.name}</span> {n.replyTo ? ` 回复了你` : ` 留了言`}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">"{n.message}"</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{n.createdAt}</p>
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
          <button onClick={() => setActiveTab('studio')} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
            <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col items-start hidden sm:flex">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 leading-none">{currentUser.username}</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 leading-none mt-0.5">Lv.{currentUser.level || 1}</span>
            </div>
          </button>
        ) : (
          <button onClick={() => setActiveTab('studio')} className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-[#065fd4] dark:text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-medium transition-colors"><User size={20} className="w-5 h-5" /> 登录</button>
        )}
      </div>
    </header>
  );
}

function Sidebar({ isOpen, activeTab, setActiveTab, currentUser, totalViews, onCheckIn }) {
  if (!isOpen) return null;
  const MenuItem = ({ id, icon: Icon, label }) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-5 px-3 py-2.5 rounded-lg mb-1 transition-colors ${activeTab === id ? 'bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
      <Icon size={24} className={activeTab === id ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"} strokeWidth={activeTab === id ? 2.5 : 2}/><span className="text-sm tracking-wide truncate">{label}</span>
    </button>
  );
  const isAdmin = currentUser && currentUser.username === ADMIN_USERNAME;
  const today = new Date().toLocaleDateString();
  const isCheckedIn = currentUser && currentUser.lastCheckInDate === today;

  return (
    <aside className="w-[240px] flex-shrink-0 overflow-y-auto px-3 pb-4 hidden md:block custom-scrollbar pt-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md h-[calc(100vh-56px)] flex flex-col border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
        <MenuItem id="home" icon={Home} label="首页 (项目)" />
        <MenuItem id="community" icon={Compass} label="日常动态" />
        <MenuItem id="discussion" icon={MessageSquare} label="留言板" />
        <MenuItem id="leaderboard" icon={Trophy} label="排行榜" />
      </div>
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
        <h3 className="px-3 py-2 text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">{isAdmin ? "管理员后台" : "个人中心"}</h3>
        <MenuItem id="studio" icon={LayoutDashboard} label={isAdmin ? "管理控制台" : "我的账号"} />
      </div>
      
      <div className="mt-auto px-3 mb-2 space-y-2">
        {currentUser && (
          <button 
            onClick={onCheckIn}
            disabled={isCheckedIn}
            className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-sm ${
              isCheckedIn 
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default' 
              : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300 hover:scale-[1.02]'
            }`}
          >
            {isCheckedIn ? (
              <><CheckCircle size={16}/> 今日已签到</>
            ) : (
              <><CalendarCheck size={16}/> 每日签到 (+5 XP)</>
            )}
          </button>
        )}

        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group">
           <p className="text-xs font-bold text-slate-400 group-hover:text-blue-500 transition-colors">📢 广告摊位</p>
           <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1 group-hover:text-blue-400 transition-colors">联系博主投放</p>
        </div>
      </div>

      <div className="px-3 py-4 text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
        <div className="flex items-center gap-2 mb-2 p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
          <Eye size={14} /> 
          <span>全站浏览: {totalViews}</span>
        </div>
        <p className="mb-1">关于 • 开发者 • 联系方式</p>
        <p>cailixian2@gmail.com</p>
        <p>© 2026 NineIce</p>
      </div>
    </aside>
  );
}

// --- 首页 (带搜索过滤) ---
function HomeView({ Bmob, searchQuery, currentUser, setGlobalError, projectsUpdated, setProjectsUpdated, onViewDetail, onEdit, onNavigate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const projectsRef = useRef(null); 
  const isAdmin = currentUser && currentUser.username === ADMIN_USERNAME;

  const fetchProjects = async () => {
    if (!Bmob) return;
    const query = Bmob.Query("projects");
    query.order("-createdAt");
    try {
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

  const handleScroll = () => {
    projectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("确定要删除这个项目吗？")) return;
    try { await Bmob.Query("projects").destroy(id); fetchProjects(); } catch(err) { fetchProjects(); }
  };

  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (p.title && p.title.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q));
  });

  if (loading) return <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-2"><Loader2 className="animate-spin text-slate-400"/>加载项目...</div>;

  return (
    <div>
      <HeroBanner user={currentUser} onViewDetail={onViewDetail} onScroll={handleScroll} onRegister={() => onNavigate('studio')} />
      
      <div ref={projectsRef} className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar scroll-mt-20">
         {['全部', 'Web开发', '移动端', '设计', 'AI工具', '笔记'].map((tag,i) => (
           <button key={i} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${i===0 ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{tag}</button>
         ))}
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="col-span-full text-center text-slate-500 dark:text-slate-400 py-20">
          {searchQuery ? `未找到包含 "${searchQuery}" 的项目` : "暂无项目，请去后台发布一个，并确保 Key 设置正确"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 animate-fadeIn">
          {filteredProjects.map(p => (
            <ProjectCard key={p.objectId} p={p} isAdmin={isAdmin} handleDelete={handleDelete} handleEdit={onEdit} onViewDetail={onViewDetail} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- 极客排行榜 (新功能) ---
function LeaderboardView({ Bmob }) {
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
        return <span className="font-bold text-slate-500 w-6 text-center">{index + 1}</span>;
    };

    if (loading) return <div className="py-20 text-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto"/>正在计算排名...</div>;

    return (
        <div className="max-w-[800px] mx-auto animate-fadeIn pt-4">
            <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-2xl text-white shadow-lg">
                <Trophy size={48} className="text-white fill-white/20"/>
                <div>
                    <h2 className="text-2xl font-bold">极客积分排行榜</h2>
                    <p className="opacity-90">看看谁是全站最强开发者？勤签到、多互动！</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">排名</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">极客</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">等级</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">XP 经验值</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {users.map((u, index) => (
                            <tr key={u.objectId} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${index < 3 ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''}`}>
                                <td className="px-6 py-4 flex items-center justify-center sm:justify-start">
                                    <div className="w-8 flex justify-center">{getMedal(index)}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-blue-500'}`}>
                                            {u.username ? u.username[0].toUpperCase() : '?'}
                                        </div>
                                        <span className={`font-medium ${index === 0 ? 'text-yellow-600 dark:text-yellow-400 font-bold' : 'text-slate-900 dark:text-slate-100'}`}>
                                            {u.username}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">Lv.{u.level || 1}</span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                                    {u.xp || 0}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <div className="p-8 text-center text-slate-400">暂无数据</div>}
            </div>
        </div>
    );
}

// --- 动态墙 (带搜索过滤) ---
function CommunityView({ Bmob, searchQuery, currentUser }) {
  const [blogs, setBlogs] = useState([]);
  const isAdmin = currentUser && currentUser.username === ADMIN_USERNAME;
  const fetchBlogs = () => { 
    if (!Bmob) return;
    const q = Bmob.Query("blogs");
    q.order("-createdAt");
    q.find().then(res => { if(Array.isArray(res)) setBlogs(res); }); 
  };
  useEffect(() => { fetchBlogs(); }, [Bmob]);
  const handleDelete = async (id) => { if (!confirm("确定要删除这条动态吗？")) return; try { await Bmob.Query("blogs").destroy(id); fetchBlogs(); } catch(err) { fetchBlogs(); } };
  const handleLike = async (id, currentLikes) => {
    try { setBlogs(blogs.map(b => b.objectId === id ? { ...b, likes: (b.likes || 0) + 1 } : b)); await Bmob.Query("blogs").get(id).then(res => { res.set('likes', (res.likes || 0) + 1); res.save(); }); } catch(e) {}
  };
  const filteredBlogs = blogs.filter(b => (!searchQuery) || (b.content && b.content.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className="max-w-[850px] mx-auto pt-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">动态墙</h2><div className="flex gap-4 text-sm text-slate-500"><span className="text-slate-900 dark:text-slate-100 font-medium cursor-pointer border-b-2 border-slate-900 dark:border-white pb-1">全部</span><span className="hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer">最近更新</span></div></div>
      <div className="space-y-4">
        {filteredBlogs.length === 0 && searchQuery ? (<div className="text-center text-slate-500 py-10">未找到相关动态</div>) : (
          filteredBlogs.map(b => (
            <div key={b.objectId} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow relative group">
              {isAdmin && <button onClick={() => handleDelete(b.objectId)} className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors" title="删除动态"><Trash2 size={18} /></button>}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 shrink-0 flex items-center justify-center font-bold text-sm text-white">D</div>
                <div className="flex-1">
                  <div className="flex gap-2 items-center mb-1"><span className="font-bold text-sm text-slate-900 dark:text-slate-100">博主动态</span><span className="text-slate-500 text-xs">{b.createdAt}</span></div>
                  <p className="text-sm text-slate-900 dark:text-slate-200 whitespace-pre-wrap leading-relaxed mb-3">{b.content}</p>
                  <div className="flex gap-2">
                     <button onClick={() => handleLike(b.objectId, b.likes)} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 active:text-blue-600">
                        <ThumbsUp size={16} /> <span className="text-xs">{b.likes || 0}</span>
                     </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- 留言板 (完善回复功能) ---
function DiscussionView({ Bmob, currentUser, onInteraction }) {
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
  const handleDelete = async (id) => { if (!confirm("确定要删除这条留言吗？")) return; try { await Bmob.Query("guestbook").destroy(id); fetchMessages(); } catch(err) { fetchMessages(); } };
  const handleLike = async (id) => { setMessages(messages.map(m => m.objectId === id ? { ...m, likes: (m.likes || 0) + 1 } : m)); await Bmob.Query("guestbook").get(id).then(res => { res.set('likes', (res.likes || 0) + 1); res.save(); }); };

  const handleReplyClick = (targetName) => { setReplyTarget(targetName); if(msgInputRef.current) msgInputRef.current.focus(); };
  const cancelReply = () => { setReplyTarget(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !msg.trim()) return;
    setLoading(true);
    const query = Bmob.Query("guestbook");
    query.set("name", name);
    query.set("message", msg);
    query.set("likes", 0);
    if (replyTarget) query.set("replyTo", replyTarget);
    query.save().then(() => { if(!currentUser) setName(''); setMsg(''); setReplyTarget(null); setLoading(false); fetchMessages(); if (onInteraction) onInteraction(); alert("评论发布成功！经验+1"); }).catch(err => { alert("发布失败: " + getBmobErrorMsg(err)); setLoading(false); });
  };

  return (
    <div className="max-w-[850px] mx-auto pt-2 animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-100">{messages.length} 条留言</h2>
        <div className="flex gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold shrink-0 text-white">{currentUser ? (currentUser.username[0].toUpperCase()) : '?'}</div>
          <form onSubmit={handleSubmit} className="flex-1">
            {replyTarget && (
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-t-lg mb-1 border-b border-blue-100 dark:border-blue-800">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">正在回复 @{replyTarget}</span>
                <button type="button" onClick={cancelReply} className="text-blue-400 hover:text-blue-600"><X size={14}/></button>
              </div>
            )}
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="怎么称呼你..." className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-slate-900 dark:focus:border-slate-100 outline-none pb-1 mb-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400" disabled={!!currentUser}/>
            <input ref={msgInputRef} value={msg} onChange={e=>setMsg(e.target.value)} placeholder={replyTarget ? `回复 @${replyTarget}...` : "写下你的留言..."} className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-slate-900 dark:focus:border-slate-100 outline-none pb-1 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400"/>
            <div className="flex justify-end mt-2 gap-2"><button disabled={loading || !name || !msg} className={`px-3 py-1.5 rounded-full text-sm font-medium ${(!name || !msg) ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-[#065fd4] text-white hover:bg-[#0056bf]'} transition-colors`}>{loading ? '发布中...' : '发布'}</button></div>
          </form>
        </div>
      </div>
      <div className="space-y-6">
        {messages.map(m => (
          <div key={m.objectId} className="flex gap-4 group relative">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center font-bold shrink-0 text-sm text-white">{m.name ? m.name[0].toUpperCase() : 'A'}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1"><span className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer">@{m.name}</span><span className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900">{m.createdAt}</span></div>
              {m.replyTo && (<div className="text-xs text-[#065fd4] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 inline-block px-1.5 py-0.5 rounded mb-1">回复 @{m.replyTo}</div>)}
              <p className="text-sm text-slate-900 dark:text-slate-200 leading-relaxed">{m.message}</p>
              <div className="flex items-center gap-3 mt-2">
                <div onClick={()=>handleLike(m.objectId)} className="flex items-center gap-1 cursor-pointer hover:text-[#065fd4] text-slate-500 dark:text-slate-400 transition-colors"><ThumbsUp size={14} /> <span className="text-xs">{m.likes || 0}</span></div>
                <button onClick={() => handleReplyClick(m.name)} className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer ml-2 flex items-center gap-1">回复</button>
              </div>
            </div>
            {isAdmin && <button onClick={() => handleDelete(m.objectId)} className="absolute top-0 right-0 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="删除留言"><Trash2 size={16} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function StudioView({ Bmob, currentUser, setCurrentUser, setProjectsUpdated, editingProject, onCancelEdit }) {
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
  const handleLogin = (e) => { e.preventDefault(); if (Bmob) { Bmob.User.login(username, password).then(res => { setCurrentUser(res); }).catch(err => { alert("登录失败: " + getBmobErrorMsg(err)); }); } else { alert("Bmob 未初始化"); } };
  const handleRegister = () => { if (Bmob) { let params = { username: username, password: password }; Bmob.User.register(params).then(res => { alert("注册成功，请登录"); }).catch(err => alert("注册失败: " + getBmobErrorMsg(err))); } else { alert("Bmob 未初始化"); } };
  const handleLogout = () => { if (Bmob) { Bmob.User.logout(); setCurrentUser(null); } };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    let imageUrl = pImg;
    try {
      if (!pTitle.trim()) { alert("请输入项目标题"); setIsUploading(false); return; }
      const query = Bmob.Query("projects");
      if (editingProject) { query.set('id', editingProject.objectId); }
      query.set("title", pTitle);
      query.set("description", pDesc);
      query.set("content", pContent);
      query.set("git_link", String(pLink || "")); 
      query.set("image_url", imageUrl || "");
      if (!editingProject) {
        try { const acl = Bmob.ACL(); acl.setPublicReadAccess(true); acl.setPublicWriteAccess(true); query.set("ACL", acl); } catch(e) {}
      }
      await query.save();
      if (setProjectsUpdated) setProjectsUpdated(true);
      alert(editingProject ? `✅ 项目更新成功!` : `✅ 发布成功!`); 
      clearForm();
    } catch (err) { alert((editingProject ? "更新失败: " : "发布失败: ") + (err.error || err.message || JSON.stringify(err))); } finally { setIsUploading(false); }
  };

  const handleAddBlog = (e) => {
    e.preventDefault();
    if (Bmob) { const query = Bmob.Query("blogs"); query.set("content", bContent); query.set("likes", 0); query.save().then(res => { alert("动态发布成功"); setBContent(''); }).catch(err => alert("发布失败: " + getBmobErrorMsg(err))); } else { alert("Bmob 未初始化"); }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center shadow-lg animate-fadeIn">
        <Lock size={32} className="text-[#065fd4] mx-auto mb-4" /><h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-100">账号登录</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="用户名" className="studio-input"/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="密码" className="studio-input"/>
          <div className="flex gap-2"><button type="submit" className="flex-1 bg-[#065fd4] text-white font-medium py-2 rounded hover:bg-[#0056bf] transition-colors">登录</button><button type="button" onClick={handleRegister} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium py-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">注册</button></div>
        </form>
        <p className="text-xs text-slate-500 mt-4">登录后可参与评论。如果您是管理员，将进入后台。</p>
      </div>
    );
  }

  const isAdmin = currentUser.username === ADMIN_USERNAME;
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center shadow-lg animate-fadeIn">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600 dark:text-purple-300 font-bold text-2xl">{currentUser.username[0].toUpperCase()}</div>
        <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">欢迎，{currentUser.username}</h2><p className="text-slate-500 mb-6">您已登录。现在您可以在留言板使用此身份发布评论。</p>
        <button onClick={handleLogout} className="w-full border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-2"><LogOut size={16}/> 退出登录</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pt-6 animate-fadeIn text-slate-900 dark:text-slate-100 px-4">
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 dark:border-slate-700 pb-4"><h2 className="text-2xl font-bold flex items-center gap-2"><LayoutDashboard size={28} className="text-red-600"/>管理员控制台</h2><div className="flex items-center gap-4"><span className="text-sm text-slate-500 hidden sm:inline">当前身份: <span className="text-[#065fd4] font-medium">{currentUser.username}</span></span><button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-sm border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><LogOut size={16}/> 退出</button></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className={`bg-white dark:bg-slate-800 p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow flex flex-col h-full ${editingProject ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700'}`}>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full"><Upload size={20} className="text-[#065fd4] dark:text-blue-400"/></div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{editingProject ? '编辑项目' : '发布项目'}</h3>
            </div>
            {editingProject && (<button onClick={clearForm} className="text-xs text-red-500 hover:text-red-700 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">取消编辑</button>)}
          </div>
          <form onSubmit={handleAddProject} className="flex-1 flex flex-col gap-4">
            <div><label className="block text-xs font-medium text-slate-500 mb-1.5">项目标题</label><input value={pTitle} onChange={e=>setPTitle(e.target.value)} placeholder="输入项目标题..." className="studio-input w-full"/></div>
            <div><label className="block text-xs font-medium text-slate-500 mb-1.5">项目简介 (显示在卡片上)</label><textarea value={pDesc} onChange={e=>setPDesc(e.target.value)} placeholder="简短的一句话描述..." className="studio-input w-full h-20 resize-none"/></div>
            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1"><BookOpen size={12}/> 项目详情 (Markdown)</span>
                <button type="button" onClick={() => setIsPreview(!isPreview)} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded transition-colors">{isPreview ? <><PenTool size={10} /> 编辑模式</> : <><EyeIcon size={10} /> 实时预览</>}</button>
              </label>
              {isPreview ? (<div className="studio-input w-full h-full min-h-[150px] overflow-auto markdown-body dark:markdown-dark bg-white dark:bg-slate-800 border-2 border-blue-100 dark:border-blue-900 p-4" dangerouslySetInnerHTML={{ __html: parseMarkdownSafe(pContent) }} />) : (<textarea value={pContent} onChange={e=>setPContent(e.target.value)} placeholder={`# 标题&#10;- 列表项`} className="studio-input w-full h-full resize-none min-h-[150px] font-mono text-xs"/>)}
            </div>
            <div className="grid grid-cols-1 gap-4">
               <div><label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><LinkIcon size={12}/> 项目封面链接</label><input value={pImg} onChange={e=>setPImg(e.target.value)} placeholder="https://..." className="studio-input w-full"/></div>
               <div><label className="block text-xs font-medium text-slate-500 mb-1.5">GitHub 链接</label><input value={pLink} onChange={e=>setPLink(e.target.value)} placeholder="GitHub URL" className="studio-input w-full"/></div>
            </div>
            <div className="mt-auto pt-4"><button disabled={isUploading} className={`w-full text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-sm active:transform active:scale-[0.99] disabled:bg-slate-400 ${editingProject ? 'bg-green-600 hover:bg-green-700' : 'bg-[#065fd4] hover:bg-[#0056bf]'}`}>{isUploading ? '正在处理...' : (editingProject ? '更新项目' : '发布项目')}</button></div>
          </form>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700"><div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full"><PenTool size={20} className="text-[#0fa958] dark:text-green-400"/> </div><h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">发布动态</h3></div>
          <form onSubmit={handleAddBlog} className="flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col"><label className="block text-xs font-medium text-slate-500 mb-1.5">动态内容</label><textarea value={bContent} onChange={e=>setBContent(e.target.value)} placeholder="分享今天的技术思考或生活点滴..." className="studio-input flex-1 resize-none min-h-[320px] w-full"/></div>
            <div className="mt-auto pt-4"><button className="w-full bg-[#065fd4] text-white font-medium py-2.5 rounded-lg text-sm hover:bg-[#0056bf] transition-colors shadow-sm active:transform active:scale-[0.99]">发布动态</button></div>
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
        {type === "MASTER_KEY_MISSING" ? (
          <>
            <h1 className="text-2xl font-bold mb-2">缺少 Master Key</h1>
            <p className="text-[#606060] mb-6">为了实现用户经验值的更新功能，需要在初始化时传入 Master Key。<br/>请在代码中填写 <code>BMOB_MASTER_KEY</code>。</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">配置错误：API 安全码</h1>
            <p className="text-[#606060] mb-6">你的代码填入了 API 安全码，但 Bmob 后台似乎还没有启用它。</p>
          </>
        )}
        <button onClick={()=>window.location.reload()} className="bg-[#065fd4] text-white px-6 py-2 rounded-full hover:bg-[#0056bf] mt-6">设置好了，刷新页面</button>
      </div>
    </div>
  );
}