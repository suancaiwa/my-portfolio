import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Search, Bell, Grid, User, LogIn, LogOut, 
  ThumbsUp, MessageSquare, Share2, MoreVertical, 
  Home, Compass, LayoutDashboard, Clock, Upload, X,
  Github, Code, Lock, Loader2, AlertTriangle, PenTool,
  Laptop, ExternalLink, Smile, Trash2, Image as ImageIcon, FileCheck,
  Eye, CheckCircle
} from 'lucide-react';

// --- 配置区域 (Bmob) ---
const BMOB_SECRET_KEY = "9fa1ba7ef19ef189"; 
const BMOB_API_KEY = "0713231xX";
const ADMIN_USERNAME = "cailixian2@gmail.com"; 

// --- 错误处理工具 ---
const getBmobErrorMsg = (err) => {
  const errorStr = JSON.stringify(err);
  if (errorStr.includes("safeToken") || (err.error && err.error.includes("safeToken"))) {
    return "API_SAFE_TOKEN_MISSING";
  }
  return err.error || errorStr;
};

// --- 子组件：项目卡片 (独立出来处理图片错误) ---
const ProjectCard = ({ p, isAdmin, handleDelete }) => {
  const [imgError, setImgError] = useState(false);
  
  // 判断是否是有效链接 (必须包含 http)
  const isValidUrl = p.image_url && p.image_url.startsWith('http') && !imgError;

  return (
    <div className="group cursor-pointer flex flex-col gap-3 relative">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 border border-gray-100 shadow-sm">
        {isValidUrl ? (
          <img 
            src={p.image_url} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
            onError={() => setImgError(true)} // 加载失败时切换状态
            alt={p.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
            <Code size={48} />
          </div>
        )}
        {isAdmin && (
          <button 
            onClick={(e) => handleDelete(e, p.objectId)} 
            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10" 
            title="删除项目"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      
      <div className="flex gap-3 pr-4 items-start">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 shrink-0 shadow-sm"></div>
        <div className="flex flex-col flex-1">
          <h3 className="text-[#0f0f0f] font-bold text-sm sm:text-base line-clamp-2 leading-tight mb-1 group-hover:text-[#065fd4] transition-colors">
            {p.title || '无标题'}
          </h3>
          <div className="text-[#606060] text-xs sm:text-sm flex flex-col">
             <span className="hover:text-[#0f0f0f] transition-colors">发布于</span>
             <span>{p.createdAt ? p.createdAt.split(' ')[0] : '未知日期'}</span>
          </div>
          {p.description && <p className="text-[#606060] text-xs mt-1 line-clamp-2">{p.description}</p>}
          
          <div className="flex gap-2 mt-2">
            {p.git_link && (
              <a href={p.git_link} target="_blank" className="text-xs bg-[#f2f2f2] hover:bg-[#e5e5e5] px-2 py-1 rounded text-[#0f0f0f] flex gap-1 items-center transition-colors border border-[#e5e5e5]" onClick={e=>e.stopPropagation()}>
                <Github size={12}/> 源码
              </a>
            )}
            <div className="text-xs bg-[#f2f2f2] hover:bg-[#e5e5e5] px-2 py-1 rounded text-[#0f0f0f] flex gap-1 items-center transition-colors border border-[#e5e5e5]">
               <ExternalLink size={12} /> 详情
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [Bmob, setBmob] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLibLoaded, setIsLibLoaded] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    if (window.Bmob) {
      initBmob();
      return;
    }
    const script = document.createElement('script');
    script.src = "https://unpkg.com/hydrogen-js-sdk/dist/Bmob-2.5.1.min.js";
    script.onload = initBmob;
    document.head.appendChild(script);

    function initBmob() {
      if (BMOB_SECRET_KEY && BMOB_API_KEY) {
        try {
          window.Bmob.initialize(BMOB_SECRET_KEY, BMOB_API_KEY);
          setBmob(window.Bmob);
          const current = window.Bmob.User.current();
          if (current) setCurrentUser(current);
          updateSiteViews(window.Bmob);
        } catch (e) {
          console.error("Bmob init error", e);
        }
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
    } catch (e) { console.log("Stats skipped"); }
  };

  if (globalError === "API_SAFE_TOKEN_MISSING") return <ConfigErrorScreen />;
  if (!isLibLoaded) return <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-800 gap-4"><Loader2 className="w-8 h-8 animate-spin text-red-600" /><p className="text-slate-500 text-sm">正在连接 Bmob 云服务...</p></div>;

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#0f0f0f] font-sans flex flex-col overflow-hidden">
      <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} currentUser={currentUser} setActiveTab={setActiveTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} Bmob={Bmob} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} totalViews={totalViews} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {activeTab === 'home' && <HomeView Bmob={Bmob} searchQuery={searchQuery} currentUser={currentUser} setGlobalError={setGlobalError}/>}
            {activeTab === 'community' && <CommunityView Bmob={Bmob} searchQuery={searchQuery} currentUser={currentUser} />}
            {activeTab === 'discussion' && <DiscussionView Bmob={Bmob} currentUser={currentUser} />}
            {activeTab === 'studio' && <StudioView Bmob={Bmob} currentUser={currentUser} setCurrentUser={setCurrentUser} />}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- 组件部分 ---

function Header({ isSidebarOpen, setIsSidebarOpen, currentUser, setActiveTab, searchQuery, setSearchQuery, Bmob }) {
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
    <header className="h-14 flex items-center justify-between px-4 bg-white sticky top-0 z-50 border-b border-[#e5e5e5]">
      <div className="flex items-center gap-4">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#f2f2f2] rounded-full text-[#0f0f0f]"><Menu size={24} /></button>
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-red-600 rounded-lg p-1 flex items-center justify-center"><Laptop size={16} className="text-white" /></div>
          <span className="text-xl font-bold tracking-tighter font-sans text-[#0f0f0f] relative top-[-1px]">DevSpace</span>
        </div>
      </div>
      <div className="hidden md:flex flex-1 max-w-[600px] mx-4">
        <div className="flex w-full group">
          <div className="flex-1 flex items-center bg-white border border-[#ccc] rounded-l-full px-4 py-1 ml-8 group-focus-within:border-[#1c62b9] shadow-inner transition-colors">
            <input type="text" placeholder="搜索项目与动态..." className="w-full bg-transparent outline-none text-[#0f0f0f] placeholder-gray-500 text-base" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
            {searchQuery && (<button onClick={() => setSearchQuery('')} className="mr-2 text-gray-500 hover:text-gray-700"><X size={16} /></button>)}
          </div>
          <button className="bg-[#f8f8f8] border border-l-0 border-[#ccc] px-5 rounded-r-full hover:bg-[#f0f0f0] transition-colors"><Search size={20} className="text-[#0f0f0f]" /></button>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 relative">
        <button className="hidden sm:block p-2 hover:bg-[#f2f2f2] rounded-full text-[#0f0f0f]"><Grid size={24} /></button>
        <div className="relative">
          <button onClick={handleOpenNotif} className="p-2 hover:bg-[#f2f2f2] rounded-full text-[#0f0f0f] relative">
            <Bell size={24} />
            {notifications.length > 0 && (<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white"></span>)}
          </button>
          {showNotifDropdown && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-[#e5e5e5] rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
              <div className="p-3 border-b border-[#e5e5e5] bg-gray-50 font-bold text-sm text-[#0f0f0f]">通知中心</div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[#606060] text-sm"><CheckCircle size={32} className="mx-auto mb-2 text-green-500 opacity-50"/>没有新通知</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.objectId} onClick={() => { setActiveTab('discussion'); setShowNotifDropdown(false); }} className="p-3 hover:bg-[#f2f2f2] cursor-pointer border-b border-[#f9f9f9] transition-colors">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">{n.name ? n.name[0].toUpperCase() : '?'}</div>
                        <div>
                          <p className="text-sm text-[#0f0f0f]"><span className="font-bold">{n.name}</span> {n.replyTo ? ` 回复了你` : ` 留了言`}</p>
                          <p className="text-xs text-[#606060] line-clamp-1 mt-0.5">"{n.message}"</p>
                          <p className="text-[10px] text-[#909090] mt-1">{n.createdAt}</p>
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
          <button onClick={() => setActiveTab('studio')} className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold select-none cursor-pointer text-white shadow-sm hover:ring-2 hover:ring-purple-200">{currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}</button>
        ) : (
          <button onClick={() => setActiveTab('studio')} className="flex items-center gap-2 border border-[#e5e5e5] text-[#065fd4] px-3 py-1.5 rounded-full hover:bg-[#def1ff] text-sm font-medium transition-colors"><User size={20} className="w-5 h-5" /> 登录</button>
        )}
      </div>
    </header>
  );
}

function Sidebar({ isOpen, activeTab, setActiveTab, currentUser, totalViews }) {
  if (!isOpen) return null;
  const MenuItem = ({ id, icon: Icon, label }) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-5 px-3 py-2.5 rounded-lg mb-1 transition-colors ${activeTab === id ? 'bg-[#f2f2f2] font-medium text-[#0f0f0f]' : 'hover:bg-[#f2f2f2] text-[#0f0f0f]'}`}>
      <Icon size={24} className={activeTab === id ? "text-[#0f0f0f]" : "text-[#606060]"} strokeWidth={activeTab === id ? 2.5 : 2}/><span className="text-sm tracking-wide truncate">{label}</span>
    </button>
  );
  const isAdmin = currentUser && currentUser.username === ADMIN_USERNAME;
  return (
    <aside className="w-[240px] flex-shrink-0 overflow-y-auto px-3 pb-4 hidden md:block custom-scrollbar pt-3 bg-white h-[calc(100vh-56px)] flex flex-col">
      <div className="border-b border-[#e5e5e5] pb-3 mb-3">
        <MenuItem id="home" icon={Home} label="首页 (项目)" />
        <MenuItem id="community" icon={Compass} label="日常动态" />
        <MenuItem id="discussion" icon={MessageSquare} label="留言板" />
      </div>
      <div className="border-b border-[#e5e5e5] pb-3 mb-3">
        <h3 className="px-3 py-2 text-base font-bold text-[#0f0f0f] flex items-center gap-2">{isAdmin ? "管理员后台" : "个人中心"}</h3>
        <MenuItem id="studio" icon={LayoutDashboard} label={isAdmin ? "管理控制台" : "我的账号"} />
      </div>
      <div className="mt-auto px-3 py-4 text-[12px] text-[#606060] font-medium leading-relaxed">
        <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded border border-gray-100">
          <Eye size={14} /> 
          <span>全站浏览: {totalViews}</span>
        </div>
        <p className="mb-1">关于 • 开发者 • 联系方式</p>
        <p>© 2026 DevSpace</p>
      </div>
    </aside>
  );
}

// --- 首页 (带搜索过滤) ---
function HomeView({ Bmob, searchQuery, currentUser, setGlobalError }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = currentUser && currentUser.username === ADMIN_USERNAME;

  const fetchProjects = async () => {
    const query = Bmob.Query("projects");
    query.order("-createdAt");
    try {
      const res = await query.find();
      if(Array.isArray(res)) setProjects(res);
    } catch(e) { 
      console.error(e); 
      if(getBmobErrorMsg(e) === "API_SAFE_TOKEN_MISSING") setGlobalError("API_SAFE_TOKEN_MISSING");
    }
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, [Bmob]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("确定要删除这个项目吗？")) return;
    const query = Bmob.Query("projects");
    try { await query.destroy(id); fetchProjects(); } catch(err) { alert("删除失败: " + err.error); }
  };

  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (p.title && p.title.toLowerCase().includes(q)) || 
           (p.description && p.description.toLowerCase().includes(q));
  });

  if (loading) return <div className="py-20 text-center text-[#606060] flex flex-col items-center gap-2"><Loader2 className="animate-spin text-gray-400"/>加载项目...</div>;

  return (
    <div>
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
         {['全部', 'Web开发', '移动端', '设计', 'AI工具', '笔记'].map((tag,i) => (
           <button key={i} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${i===0 ? 'bg-[#0f0f0f] text-white' : 'bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e5e5e5]'}`}>{tag}</button>
         ))}
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="col-span-full text-center text-[#606060] py-20">
          {searchQuery ? `未找到包含 "${searchQuery}" 的项目` : "暂无项目，去后台发布一个吧"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 animate-fadeIn">
          {filteredProjects.map(p => (
            <ProjectCard key={p.objectId} p={p} isAdmin={isAdmin} handleDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- 动态墙 (带搜索过滤) ---
function CommunityView({ Bmob, searchQuery, currentUser }) {
  const [blogs, setBlogs] = useState([]);
  const isAdmin = currentUser && currentUser.username === ADMIN_USERNAME;

  const fetchBlogs = () => {
    const q = Bmob.Query("blogs");
    q.order("-createdAt");
    q.find().then(res => { if(Array.isArray(res)) setBlogs(res); });
  };

  useEffect(() => { fetchBlogs(); }, [Bmob]);

  const handleDelete = async (id) => {
    if (!confirm("确定要删除这条动态吗？")) return;
    try { await Bmob.Query("blogs").destroy(id); fetchBlogs(); } catch(err) { alert("删除失败"); }
  };

  const handleLike = async (id, currentLikes) => {
    const query = Bmob.Query("blogs");
    try {
      setBlogs(blogs.map(b => b.objectId === id ? { ...b, likes: (b.likes || 0) + 1 } : b));
      await query.get(id).then(res => {
        res.set('likes', (res.likes || 0) + 1);
        res.save();
      });
    } catch(e) { console.error(e); }
  };

  const filteredBlogs = blogs.filter(b => {
    if (!searchQuery) return true;
    return b.content && b.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-[850px] mx-auto pt-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-[#0f0f0f]">动态墙</h2><div className="flex gap-4 text-sm text-[#606060]"><span className="text-[#0f0f0f] font-medium cursor-pointer border-b-2 border-[#0f0f0f] pb-1">全部</span><span className="hover:text-[#0f0f0f] cursor-pointer">最近更新</span></div></div>
      <div className="space-y-4">
        {filteredBlogs.length === 0 && searchQuery ? (
           <div className="text-center text-[#606060] py-10">未找到相关动态</div>
        ) : (
          filteredBlogs.map(b => (
            <div key={b.objectId} className="border border-[#e5e5e5] rounded-xl p-4 bg-white hover:shadow-md transition-shadow relative group">
              {isAdmin && <button onClick={() => handleDelete(b.objectId)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors" title="删除动态"><Trash2 size={18} /></button>}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 shrink-0 flex items-center justify-center font-bold text-sm text-white">D</div>
                <div className="flex-1">
                  <div className="flex gap-2 items-center mb-1"><span className="font-bold text-sm text-[#0f0f0f]">博主动态</span><span className="text-[#606060] text-xs">{b.createdAt}</span></div>
                  <p className="text-sm text-[#0f0f0f] whitespace-pre-wrap leading-relaxed mb-3">{b.content}</p>
                  <div className="flex gap-2">
                     <button 
                       onClick={() => handleLike(b.objectId, b.likes)}
                       className="flex items-center gap-2 px-2 py-1 hover:bg-[#f2f2f2] rounded-full text-[#606060] active:text-[#065fd4]"
                     >
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
function DiscussionView({ Bmob, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null); 
  const msgInputRef = useRef(null);
  
  const isAdmin = currentUser && currentUser.username === ADMIN_USERNAME;

  useEffect(() => { if (currentUser && currentUser.username) setName(currentUser.username); }, [currentUser]);
  
  const fetchMessages = () => {
    const q = Bmob.Query("guestbook");
    q.order("-createdAt");
    q.find().then(res => { if(Array.isArray(res)) setMessages(res); });
  };
  
  useEffect(() => { fetchMessages(); }, [Bmob]);
  
  const handleDelete = async (id) => {
    if (!confirm("确定要删除这条留言吗？")) return;
    try { await Bmob.Query("guestbook").destroy(id); fetchMessages(); } catch(err) { alert("删除失败"); }
  };

  const handleLike = async (id) => {
    setMessages(messages.map(m => m.objectId === id ? { ...m, likes: (m.likes || 0) + 1 } : m));
    const query = Bmob.Query("guestbook");
    await query.get(id).then(res => {
      res.set('likes', (res.likes || 0) + 1);
      res.save();
    });
  };

  const handleReplyClick = (targetName) => {
    setReplyTarget(targetName);
    if(msgInputRef.current) msgInputRef.current.focus();
  };

  const cancelReply = () => {
    setReplyTarget(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !msg.trim()) return;
    setLoading(true);
    const query = Bmob.Query("guestbook");
    query.set("name", name);
    query.set("message", msg);
    query.set("likes", 0);
    
    if (replyTarget) {
      query.set("replyTo", replyTarget);
    }

    query.save().then(() => {
      if(!currentUser) setName(''); 
      setMsg(''); 
      setReplyTarget(null); 
      setLoading(false); 
      fetchMessages();
      alert("评论发布成功！");
    }).catch(err => { alert("发布失败: " + getBmobErrorMsg(err)); setLoading(false); });
  };

  return (
    <div className="max-w-[850px] mx-auto pt-2 animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-6 text-[#0f0f0f]">{messages.length} 条留言</h2>
        
        <div className="flex gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold shrink-0 text-white">{currentUser ? (currentUser.username[0].toUpperCase()) : '?'}</div>
          <form onSubmit={handleSubmit} className="flex-1">
            {replyTarget && (
              <div className="flex items-center justify-between bg-blue-50 px-3 py-1.5 rounded-t-lg mb-1 border-b border-blue-100">
                <span className="text-xs text-blue-600 font-medium">正在回复 @{replyTarget}</span>
                <button type="button" onClick={cancelReply} className="text-blue-400 hover:text-blue-600"><X size={14}/></button>
              </div>
            )}

            <input value={name} onChange={e=>setName(e.target.value)} placeholder="怎么称呼你..." className="w-full bg-transparent border-b border-[#e5e5e5] focus:border-[#0f0f0f] outline-none pb-1 mb-2 text-sm text-[#0f0f0f] placeholder-[#606060]" disabled={!!currentUser}/>
            <input 
              ref={msgInputRef}
              value={msg} 
              onChange={e=>setMsg(e.target.value)} 
              placeholder={replyTarget ? `回复 @${replyTarget}...` : "写下你的留言..."} 
              className="w-full bg-transparent border-b border-[#e5e5e5] focus:border-[#0f0f0f] outline-none pb-1 text-sm text-[#0f0f0f] placeholder-[#606060]"
            />
            <div className="flex justify-end mt-2 gap-2"><button disabled={loading || !name || !msg} className={`px-3 py-1.5 rounded-full text-sm font-medium ${(!name || !msg) ? 'bg-[#f2f2f2] text-[#909090]' : 'bg-[#065fd4] text-white hover:bg-[#0056bf]'} transition-colors`}>{loading ? '发布中...' : '发布'}</button></div>
          </form>
        </div>
      </div>
      <div className="space-y-6">
        {messages.map(m => (
          <div key={m.objectId} className="flex gap-4 group relative">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center font-bold shrink-0 text-sm text-white">{m.name ? m.name[0].toUpperCase() : 'A'}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1"><span className="text-xs font-bold text-[#0f0f0f] bg-[#f2f2f2] px-2 py-0.5 rounded-full hover:bg-[#e5e5e5] cursor-pointer">@{m.name}</span><span className="text-xs text-[#606060] hover:text-[#0f0f0f] cursor-pointer">{m.createdAt}</span></div>
              
              {m.replyTo && (
                <div className="text-xs text-[#065fd4] bg-blue-50 inline-block px-1.5 py-0.5 rounded mb-1">
                  回复 @{m.replyTo}
                </div>
              )}

              <p className="text-sm text-[#0f0f0f] leading-relaxed">{m.message}</p>
              <div className="flex items-center gap-3 mt-2">
                <div onClick={()=>handleLike(m.objectId)} className="flex items-center gap-1 cursor-pointer hover:text-[#065fd4] text-[#606060] transition-colors">
                  <ThumbsUp size={14} /> <span className="text-xs">{m.likes || 0}</span>
                </div>
                <button 
                  onClick={() => handleReplyClick(m.name)}
                  className="text-xs font-medium text-[#606060] hover:text-[#0f0f0f] cursor-pointer ml-2 flex items-center gap-1"
                >
                  回复
                </button>
              </div>
            </div>
            {isAdmin && <button onClick={() => handleDelete(m.objectId)} className="absolute top-0 right-0 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="删除留言"><Trash2 size={16} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function StudioView({ Bmob, currentUser, setCurrentUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Inputs
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pLink, setPLink] = useState('');
  const [pImg, setPImg] = useState('');
  const [bContent, setBContent] = useState('');
  
  const fileInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleLogin = (e) => { e.preventDefault(); Bmob.User.login(username, password).then(res => { setCurrentUser(res); }).catch(err => { alert("登录失败: " + getBmobErrorMsg(err)); }); };
  const handleRegister = () => { let params = { username: username, password: password }; Bmob.User.register(params).then(res => { alert("注册成功，请登录"); }).catch(err => alert("注册失败: " + getBmobErrorMsg(err))); };
  const handleLogout = () => { Bmob.User.logout(); setCurrentUser(null); };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      setPImg('');
    } else {
      setSelectedFileName('');
    }
  };

  const clearSelectedFile = () => {
    setSelectedFileName('');
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = async (file) => {
    if(!file) return null;
    try {
      const extension = file.name.split('.').pop();
      // 强制生成纯数字文件名，避免中文乱码
      const safeName = `${Date.now()}.${extension}`; 
      
      const bmobFile = Bmob.File(safeName, file);
      
      const res = await bmobFile.save();
      console.log("Upload Response:", res);
      
      if (Array.isArray(res) && res.length > 0) {
        let url = res[0].url || res[0].fileUrl;
        
        if (!url && typeof res[0] === 'string') {
            try {
                const parsed = JSON.parse(res[0]);
                url = parsed.url;
            } catch(e) {}
        }

        if (url && url.startsWith('http:')) {
          url = url.replace('http:', 'https:');
        }
        return url;
      } else if (res && res.url) {
          let url = res.url;
          if (url.startsWith('http:')) url = url.replace('http:', 'https:');
          return url;
      }
      
      return null;
    } catch(e) {
      console.error("Upload Error:", e);
      alert("上传失败: " + (e.error || e.message || JSON.stringify(e)));
      return null;
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    let imageUrl = pImg;

    try {
      if (fileInputRef.current && fileInputRef.current.files[0]) {
        const file = fileInputRef.current.files[0];
        const uploadedUrl = await handleFileUpload(file);
        
        if(uploadedUrl) {
            imageUrl = uploadedUrl;
        } else {
            alert("图片上传成功但未返回链接，请检查Bmob控制台或重试");
            setIsUploading(false);
            return;
        }
      } else if (!pImg) {
         // 强制要求图片校验，如果没传图也没填URL，拒绝提交
         // alert("请上传图片或填写图片链接");
         // setIsUploading(false);
         // return;
      }
      
      // 最终确认 imageUrl 格式
      if (imageUrl && !imageUrl.startsWith('http')) {
         alert("无效的图片链接，无法发布。请重试。");
         setIsUploading(false);
         return;
      }

      const query = Bmob.Query("projects");
      query.set("title", pTitle);
      query.set("description", pDesc);
      query.set("git_link", pLink);
      query.set("image_url", imageUrl);
      await query.save();
      
      alert("项目发布成功"); 
      setPTitle(''); setPDesc(''); setPImg(''); setPLink('');
      clearSelectedFile();
    } catch (err) {
      console.error(err);
      alert("发布失败: " + (err.error || JSON.stringify(err)));
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddBlog = (e) => {
    e.preventDefault();
    const query = Bmob.Query("blogs");
    query.set("content", bContent);
    query.set("likes", 0);
    query.save().then(res => { alert("动态发布成功"); setBContent(''); }).catch(err => alert("发布失败: " + getBmobErrorMsg(err)));
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl border border-[#e5e5e5] text-center shadow-lg animate-fadeIn">
        <Lock size={32} className="text-[#065fd4] mx-auto mb-4" /><h2 className="text-xl font-bold mb-6 text-[#0f0f0f]">账号登录</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="用户名" className="studio-input"/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="密码" className="studio-input"/>
          <div className="flex gap-2"><button type="submit" className="flex-1 bg-[#065fd4] text-white font-medium py-2 rounded hover:bg-[#0056bf] transition-colors">登录</button><button type="button" onClick={handleRegister} className="flex-1 bg-[#f2f2f2] text-[#0f0f0f] font-medium py-2 rounded hover:bg-[#e5e5e5] transition-colors">注册</button></div>
        </form>
        <p className="text-xs text-[#606060] mt-4">登录后可参与评论。如果您是管理员，将进入后台。</p>
      </div>
    );
  }

  const isAdmin = currentUser.username === ADMIN_USERNAME;
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl border border-[#e5e5e5] text-center shadow-lg animate-fadeIn">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600 font-bold text-2xl">{currentUser.username[0].toUpperCase()}</div>
        <h2 className="text-xl font-bold mb-2 text-[#0f0f0f]">欢迎，{currentUser.username}</h2><p className="text-[#606060] mb-6">您已登录。现在您可以在留言板使用此身份发布评论。</p>
        <button onClick={handleLogout} className="w-full border border-[#e5e5e5] text-[#0f0f0f] font-medium py-2 rounded hover:bg-[#f2f2f2] flex items-center justify-center gap-2"><LogOut size={16}/> 退出登录</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pt-6 animate-fadeIn text-[#0f0f0f] px-4">
      <div className="flex justify-between items-center mb-8 border-b border-[#e5e5e5] pb-4"><h2 className="text-2xl font-bold flex items-center gap-2"><LayoutDashboard size={28} className="text-red-600"/>管理员控制台</h2><div className="flex items-center gap-4"><span className="text-sm text-[#606060] hidden sm:inline">当前身份: <span className="text-[#065fd4] font-medium">{currentUser.username}</span></span><button onClick={handleLogout} className="flex items-center gap-2 text-[#606060] hover:text-[#0f0f0f] transition-colors font-medium text-sm border border-[#e5e5e5] px-3 py-1.5 rounded-full hover:bg-[#f2f2f2]"><LogOut size={16}/> 退出</button></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="bg-white p-6 rounded-xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f2f2f2]"><div className="p-2 bg-blue-50 rounded-full"><Upload size={20} className="text-[#065fd4]"/></div><h3 className="font-bold text-lg text-[#0f0f0f]">发布项目</h3></div>
          <form onSubmit={handleAddProject} className="flex-1 flex flex-col gap-4">
            <div><label className="block text-xs font-medium text-[#606060] mb-1.5">项目标题</label><input value={pTitle} onChange={e=>setPTitle(e.target.value)} placeholder="输入项目标题..." className="studio-input w-full"/></div>
            <div className="flex-1"><label className="block text-xs font-medium text-[#606060] mb-1.5">项目介绍</label><textarea value={pDesc} onChange={e=>setPDesc(e.target.value)} placeholder="描述一下这个项目的功能和亮点..." className="studio-input w-full h-full resize-none min-h-[150px]"/></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#606060] mb-1.5">项目封面</label>
                {selectedFileName ? (
                  <div className="studio-input flex items-center justify-between bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-2 overflow-hidden"><FileCheck size={14} className="text-green-600 flex-shrink-0"/><span className="text-xs truncate">{selectedFileName}</span></div>
                    <button type="button" onClick={clearSelectedFile} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                  </div>
                ) : (
                  <div className="relative group">
                    <input type="file" ref={fileInputRef} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} accept="image/*"/>
                    <div className="studio-input flex items-center justify-center gap-2 cursor-pointer group-hover:bg-gray-50 transition-colors text-gray-500">
                      <ImageIcon size={16}/> <span className="text-xs">点击上传图片</span>
                    </div>
                  </div>
                )}
              </div>
              <div><label className="block text-xs font-medium text-[#606060] mb-1.5">项目链接</label><input value={pLink} onChange={e=>setPLink(e.target.value)} placeholder="GitHub / Demo" className="studio-input w-full"/></div>
            </div>
            <div className="mt-auto pt-4"><button disabled={isUploading} className="w-full bg-[#065fd4] text-white font-medium py-2.5 rounded-lg text-sm hover:bg-[#0056bf] transition-colors shadow-sm active:transform active:scale-[0.99] disabled:bg-gray-400 disabled:cursor-not-allowed">{isUploading ? '正在上传图片...' : '发布项目'}</button></div>
          </form>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f2f2f2]"><div className="p-2 bg-green-50 rounded-full"><PenTool size={20} className="text-[#0fa958]"/> </div><h3 className="font-bold text-lg text-[#0f0f0f]">发布动态</h3></div>
          <form onSubmit={handleAddBlog} className="flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col"><label className="block text-xs font-medium text-[#606060] mb-1.5">动态内容</label><textarea value={bContent} onChange={e=>setBContent(e.target.value)} placeholder="分享今天的技术思考或生活点滴..." className="studio-input flex-1 resize-none min-h-[320px] w-full"/></div>
            <div className="mt-auto pt-4"><button className="w-full bg-[#065fd4] text-white font-medium py-2.5 rounded-lg text-sm hover:bg-[#0056bf] transition-colors shadow-sm active:transform active:scale-[0.99]">发布动态</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ConfigErrorScreen() {
  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#0f0f0f] flex items-center justify-center p-4">
      <div className="max-w-md text-center bg-white p-8 rounded-xl border border-[#e5e5e5] shadow-lg">
        <AlertTriangle size={64} className="mx-auto text-red-600 mb-4" /><h1 className="text-2xl font-bold mb-2">配置错误：API 安全码</h1>
        <p className="text-[#606060] mb-6">你的代码填入了 API 安全码，但 Bmob 后台似乎还没有启用它，或者不一致。<br/><br/><strong>请执行以下修复步骤：</strong></p>
        <ol className="text-left text-sm text-[#0f0f0f] bg-[#f2f2f2] p-4 rounded mb-6 list-decimal list-inside space-y-2"><li>登录 <a href="https://www.bmob.cn/console" target="_blank" className="text-blue-600 underline">Bmob 后台</a></li><li>点击左侧 <strong>设置</strong> -&gt; <strong>应用配置</strong></li><li>找到 <strong>API 安全码</strong> 一栏</li><li>输入 <code>0713231xX</code> 并点击 <strong>保存</strong> (页面底部)</li></ol>
        <button onClick={()=>window.location.reload()} className="bg-[#065fd4] text-white px-6 py-2 rounded-full hover:bg-[#0056bf]">设置好了，刷新页面</button>
      </div>
    </div>
  );
}

const style = document.createElement('style');
style.innerHTML = `
  .custom-scrollbar::-webkit-scrollbar { width: 8px; }
  .custom-scrollbar::-webkit-scrollbar-track { bg: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #aaa; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .studio-input { @apply bg-[#f9f9f9] border border-[#ccc] rounded p-3 text-[#0f0f0f] outline-none focus:border-[#065fd4] placeholder-gray-500 text-sm focus:bg-white transition-colors focus:ring-1 focus:ring-[#065fd4]; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } 
  .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
`;
document.head.appendChild(style);