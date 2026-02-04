import React, { useState, useEffect } from 'react';
import { 
  Menu, Search, Bell, Grid, User, LogIn, LogOut, 
  ThumbsUp, MessageSquare, Share2, MoreVertical, 
  Home, Compass, LayoutDashboard, Clock, Upload, X,
  Github, Code, Lock, Loader2, AlertTriangle, PenTool,
  Laptop, ExternalLink
} from 'lucide-react';

// --- 配置区域 (Bmob) ---
// 1. Secret Key (你提供的)
const BMOB_SECRET_KEY = "9fa1ba7ef19ef189"; 

// 2. API 安全码 (必须手动设置)
// ！！！请务必去 Bmob 后台 -> 设置 -> 应用配置 -> API 安全码 中设置！！！
// 设置完后，点击保存，然后确保这里填的和后台设置的一模一样
const BMOB_API_KEY = "0713231xX";

// --- 错误处理工具 ---
const getBmobErrorMsg = (err) => {
  const errorStr = JSON.stringify(err);
  if (errorStr.includes("safeToken") || (err.error && err.error.includes("safeToken"))) {
    return "API_SAFE_TOKEN_MISSING";
  }
  return err.error || errorStr;
};

export default function App() {
  const [Bmob, setBmob] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLibLoaded, setIsLibLoaded] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // 1. 动态加载 Bmob SDK
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
          
          // 尝试获取用户以测试连接
          const current = window.Bmob.User.current();
          if (current) setCurrentUser(current);
          
          // 简单的连接测试
          const query = window.Bmob.Query("projects");
          query.limit(1).find().catch(err => {
            if(getBmobErrorMsg(err) === "API_SAFE_TOKEN_MISSING") {
              setGlobalError("API_SAFE_TOKEN_MISSING");
            }
          });

        } catch (e) {
          console.error("Bmob init error", e);
        }
      }
      setIsLibLoaded(true);
    }
  }, []);

  if (globalError === "API_SAFE_TOKEN_MISSING") {
    return <ConfigErrorScreen />;
  }

  if (!isLibLoaded) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-800 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      <p className="text-slate-500 text-sm">正在连接 Bmob 云服务...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#0f0f0f] font-sans flex flex-col overflow-hidden">
      <Header 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        currentUser={currentUser}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {activeTab === 'home' && <HomeView Bmob={Bmob} searchQuery={searchQuery} setGlobalError={setGlobalError}/>}
            {activeTab === 'community' && <CommunityView Bmob={Bmob} />}
            {activeTab === 'discussion' && <DiscussionView Bmob={Bmob} />}
            {activeTab === 'studio' && <StudioView Bmob={Bmob} currentUser={currentUser} setCurrentUser={setCurrentUser} />}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- 顶部导航栏 (Header) ---
function Header({ isSidebarOpen, setIsSidebarOpen, currentUser, setActiveTab, searchQuery, setSearchQuery }) {
  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white sticky top-0 z-50 border-b border-[#e5e5e5]">
      <div className="flex items-center gap-4">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors text-[#0f0f0f]">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-red-600 rounded-lg p-1 flex items-center justify-center">
            <Laptop size={16} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter font-sans text-[#0f0f0f] relative top-[-1px]">DevSpace</span>
        </div>
      </div>

      <div className="hidden md:flex flex-1 max-w-[600px] mx-4">
        <div className="flex w-full group">
          <div className="flex-1 flex items-center bg-white border border-[#ccc] rounded-l-full px-4 py-1 ml-8 group-focus-within:border-[#1c62b9] shadow-inner transition-colors">
            <input 
              type="text" 
              placeholder="搜索项目与动态" 
              className="w-full bg-transparent outline-none text-[#0f0f0f] placeholder-gray-500 text-base"
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="bg-[#f8f8f8] border border-l-0 border-[#ccc] px-5 rounded-r-full hover:bg-[#f0f0f0] transition-colors tooltip" title="搜索">
            <Search size={20} className="text-[#0f0f0f]" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="hidden sm:block p-2 hover:bg-[#f2f2f2] rounded-full text-[#0f0f0f]"><Grid size={24} /></button>
        <button className="hidden sm:block p-2 hover:bg-[#f2f2f2] rounded-full text-[#0f0f0f]"><Bell size={24} /></button>
        {currentUser ? (
          <button onClick={() => setActiveTab('studio')} className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold select-none cursor-pointer text-white shadow-sm">
            {currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}
          </button>
        ) : (
          <button onClick={() => setActiveTab('studio')} className="flex items-center gap-2 border border-[#e5e5e5] text-[#065fd4] px-3 py-1.5 rounded-full hover:bg-[#def1ff] text-sm font-medium transition-colors">
            <User size={20} className="w-5 h-5" /> 登录
          </button>
        )}
      </div>
    </header>
  );
}

// --- 左侧侧边栏 (Sidebar) ---
function Sidebar({ isOpen, activeTab, setActiveTab }) {
  if (!isOpen) return null;
  
  const MenuItem = ({ id, icon: Icon, label }) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)} 
        className={`w-full flex items-center gap-5 px-3 py-2.5 rounded-lg mb-1 transition-colors ${isActive ? 'bg-[#f2f2f2] font-medium text-[#0f0f0f]' : 'hover:bg-[#f2f2f2] text-[#0f0f0f]'}`}
      >
        <Icon size={24} className={isActive ? "text-[#0f0f0f]" : "text-[#606060]"} strokeWidth={isActive ? 2.5 : 2}/>
        <span className="text-sm tracking-wide truncate">{label}</span>
      </button>
    )
  };

  return (
    <aside className="w-[240px] flex-shrink-0 overflow-y-auto px-3 pb-4 hidden md:block custom-scrollbar pt-3 bg-white h-[calc(100vh-56px)]">
      <div className="border-b border-[#e5e5e5] pb-3 mb-3">
        <MenuItem id="home" icon={Home} label="首页 (项目)" />
        <MenuItem id="community" icon={Compass} label="日常动态" />
        <MenuItem id="discussion" icon={MessageSquare} label="留言板" />
      </div>
      <div className="border-b border-[#e5e5e5] pb-3 mb-3">
        <h3 className="px-3 py-2 text-base font-bold text-[#0f0f0f] flex items-center gap-2">
          管理 <span className="text-xs text-[#606060] font-normal">个人</span>
        </h3>
        <MenuItem id="studio" icon={LayoutDashboard} label="后台管理" />
      </div>
      
      <div className="px-3 py-2 text-[12px] text-[#606060] font-medium leading-relaxed">
        <p className="mb-2">关于 • 开发者 • 联系方式</p>
        <p>© 2026 DevSpace</p>
      </div>
    </aside>
  );
}

// --- 视图：首页 (项目展示) ---
function HomeView({ Bmob, searchQuery, setGlobalError }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const query = Bmob.Query("projects");
      query.order("-createdAt");
      if (searchQuery) {
         try {
           query.equalTo("title", searchQuery); 
         } catch(e) {}
      }
      try {
        const res = await query.find();
        if(Array.isArray(res)) setProjects(res);
      } catch(e) { 
        console.error(e); 
        if(getBmobErrorMsg(e) === "API_SAFE_TOKEN_MISSING") setGlobalError("API_SAFE_TOKEN_MISSING");
      }
      setLoading(false);
    };
    fetch();
  }, [Bmob, searchQuery]);

  if (loading) return <div className="py-20 text-center text-[#606060] flex flex-col items-center gap-2"><Loader2 className="animate-spin text-gray-400"/>加载项目...</div>;

  return (
    <div>
      {/* 分类标签 */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
         {['全部', 'Web开发', '移动端', '设计', 'AI工具', '笔记'].map((tag,i) => (
           <button key={i} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${i===0 ? 'bg-[#0f0f0f] text-white' : 'bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e5e5e5]'}`}>
             {tag}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 animate-fadeIn">
        {projects.length === 0 && <div className="col-span-full text-center text-[#606060] py-10">暂无项目，去后台发布一个吧</div>}
        {projects.map(p => (
          <div key={p.objectId} className="group cursor-pointer flex flex-col gap-3">
            {/* 封面 */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 border border-gray-100 shadow-sm">
              {p.image_url ? (
                <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" onError={(e)=>e.target.style.display='none'}/>
              ) : <div className="w-full h-full flex items-center justify-center text-gray-400"><Code size={48}/></div>}
            </div>
            
            {/* 信息 */}
            <div className="flex gap-3 pr-4 items-start">
              {/* 头像 */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 shrink-0 shadow-sm"></div>
              <div className="flex flex-col flex-1">
                <h3 className="text-[#0f0f0f] font-bold text-sm sm:text-base line-clamp-2 leading-tight mb-1 group-hover:text-[#065fd4] transition-colors">
                  {p.title}
                </h3>
                <div className="text-[#606060] text-xs sm:text-sm flex flex-col">
                   <span className="hover:text-[#0f0f0f] transition-colors">发布于</span>
                   <span>{p.createdAt.split(' ')[0]}</span>
                </div>
                {p.description && <p className="text-[#606060] text-xs mt-1 line-clamp-2">{p.description}</p>}
                
                {/* 按钮 */}
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
        ))}
      </div>
    </div>
  );
}

// --- 视图：动态墙 ---
function CommunityView({ Bmob }) {
  const [blogs, setBlogs] = useState([]);
  useEffect(() => {
    const q = Bmob.Query("blogs");
    q.order("-createdAt");
    q.find().then(res => { if(Array.isArray(res)) setBlogs(res); });
  }, [Bmob]);

  return (
    <div className="max-w-[850px] mx-auto pt-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#0f0f0f]">动态墙</h2>
        <div className="flex gap-4 text-sm text-[#606060]">
           <span className="text-[#0f0f0f] font-medium cursor-pointer border-b-2 border-[#0f0f0f] pb-1">全部</span>
           <span className="hover:text-[#0f0f0f] cursor-pointer">最近更新</span>
        </div>
      </div>
      <div className="space-y-4">
        {blogs.map(b => (
          <div key={b.objectId} className="border border-[#e5e5e5] rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 shrink-0 flex items-center justify-center font-bold text-sm text-white">D</div>
              <div className="flex-1">
                <div className="flex gap-2 items-center mb-1">
                  <span className="font-bold text-sm text-[#0f0f0f]">博主动态</span>
                  <span className="text-[#606060] text-xs">{b.createdAt}</span>
                </div>
                <p className="text-sm text-[#0f0f0f] whitespace-pre-wrap leading-relaxed mb-3">{b.content}</p>
                <div className="flex gap-2">
                   <button className="flex items-center gap-2 px-2 py-1 hover:bg-[#f2f2f2] rounded-full text-[#606060]">
                      <ThumbsUp size={16} /> <span className="text-xs">点赞</span>
                   </button>
                   <button className="flex items-center gap-2 px-2 py-1 hover:bg-[#f2f2f2] rounded-full text-[#606060]">
                      <Share2 size={16} /> <span className="text-xs">分享</span>
                   </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 视图：留言板 ---
function DiscussionView({ Bmob }) {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMessages = () => {
    const q = Bmob.Query("guestbook");
    q.order("-createdAt");
    q.find().then(res => { if(Array.isArray(res)) setMessages(res); });
  };

  useEffect(() => { fetchMessages(); }, [Bmob]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !msg.trim()) return;
    setLoading(true);
    const query = Bmob.Query("guestbook");
    query.set("name", name);
    query.set("message", msg);
    query.save().then(() => {
      setName(''); setMsg(''); fetchMessages(); setLoading(false);
    }).catch(err => {
      alert("发布失败: " + getBmobErrorMsg(err)); setLoading(false);
    });
  };

  return (
    <div className="max-w-[850px] mx-auto pt-2 animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-6 text-[#0f0f0f]">{messages.length} 条留言</h2>
        <div className="flex gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold shrink-0 text-white">?</div>
          <form onSubmit={handleSubmit} className="flex-1">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="怎么称呼你..." className="w-full bg-transparent border-b border-[#e5e5e5] focus:border-[#0f0f0f] outline-none pb-1 mb-2 text-sm text-[#0f0f0f] placeholder-[#606060]"/>
            <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="写下你的留言..." className="w-full bg-transparent border-b border-[#e5e5e5] focus:border-[#0f0f0f] outline-none pb-1 text-sm text-[#0f0f0f] placeholder-[#606060]"/>
            <div className="flex justify-end mt-2 gap-2">
              <button type="button" onClick={()=>{setName('');setMsg('')}} className="px-3 py-1.5 rounded-full text-sm font-medium text-[#0f0f0f] hover:bg-[#f2f2f2]">取消</button>
              <button disabled={loading || !name || !msg} className={`px-3 py-1.5 rounded-full text-sm font-medium ${(!name || !msg) ? 'bg-[#f2f2f2] text-[#909090]' : 'bg-[#065fd4] text-white hover:bg-[#0056bf]'} transition-colors`}>发布</button>
            </div>
          </form>
        </div>
      </div>
      <div className="space-y-6">
        {messages.map(m => (
          <div key={m.objectId} className="flex gap-4 group">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center font-bold shrink-0 text-sm text-white">
              {m.name ? m.name[0].toUpperCase() : 'A'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-xs font-bold text-[#0f0f0f] bg-[#f2f2f2] px-2 py-0.5 rounded-full hover:bg-[#e5e5e5] cursor-pointer">@{m.name}</span>
                 <span className="text-xs text-[#606060] hover:text-[#0f0f0f] cursor-pointer">{m.createdAt}</span>
              </div>
              <p className="text-sm text-[#0f0f0f] leading-relaxed">{m.message}</p>
              
              <div className="flex items-center gap-3 mt-2">
                 <div className="flex items-center gap-1 cursor-pointer">
                    <ThumbsUp size={14} className="text-[#606060] hover:text-[#0f0f0f]"/>
                 </div>
                 <span className="text-xs font-medium text-[#606060] hover:text-[#0f0f0f] cursor-pointer ml-2">回复</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 视图：后台管理 ---
function StudioView({ Bmob, currentUser, setCurrentUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pLink, setPLink] = useState('');
  const [pImg, setPImg] = useState('');
  const [bContent, setBContent] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    Bmob.User.login(username, password).then(res => {
      setCurrentUser(res);
    }).catch(err => {
      alert("登录失败: " + getBmobErrorMsg(err));
    });
  };

  const handleRegister = () => {
    let params = { username: username, password: password };
    Bmob.User.register(params).then(res => {
      alert("注册成功，请登录");
    }).catch(err => alert("注册失败: " + getBmobErrorMsg(err)));
  }

  const handleLogout = () => {
    Bmob.User.logout();
    setCurrentUser(null);
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    const query = Bmob.Query("projects");
    query.set("title", pTitle);
    query.set("description", pDesc);
    query.set("git_link", pLink);
    query.set("image_url", pImg);
    query.save().then(res => {
      alert("项目发布成功"); setPTitle(''); setPDesc('');
    }).catch(err => alert("发布失败: " + getBmobErrorMsg(err)));
  };

  const handleAddBlog = (e) => {
    e.preventDefault();
    const query = Bmob.Query("blogs");
    query.set("content", bContent);
    query.save().then(res => {
      alert("动态发布成功"); setBContent('');
    }).catch(err => alert("发布失败: " + getBmobErrorMsg(err)));
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl border border-[#e5e5e5] text-center shadow-lg animate-fadeIn">
        <Lock size={32} className="text-[#065fd4] mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-6 text-[#0f0f0f]">管理后台登录</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="用户名" className="studio-input"/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="密码" className="studio-input"/>
          <div className="flex gap-2">
             <button type="submit" className="flex-1 bg-[#065fd4] text-white font-medium py-2 rounded hover:bg-[#0056bf] transition-colors">登录</button>
             <button type="button" onClick={handleRegister} className="flex-1 bg-[#f2f2f2] text-[#0f0f0f] font-medium py-2 rounded hover:bg-[#e5e5e5] transition-colors">注册</button>
          </div>
        </form>
        <p className="text-xs text-[#606060] mt-4">这里是你发布内容的地方，非管理员请勿尝试。</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto pt-6 animate-fadeIn text-[#0f0f0f]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">后台管理中心</h2>
        <button onClick={handleLogout} className="flex items-center gap-2 text-[#606060] hover:text-[#0f0f0f]"><LogOut size={18}/> 退出</button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-[#e5e5e5] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2"><Upload size={20} className="text-[#065fd4]"/> 发布项目</h3>
          </div>
          <form onSubmit={handleAddProject} className="space-y-4">
            <input value={pTitle} onChange={e=>setPTitle(e.target.value)} placeholder="项目标题 (必填)" className="studio-input"/>
            <textarea value={pDesc} onChange={e=>setPDesc(e.target.value)} placeholder="项目介绍..." className="studio-input h-24"/>
            <input value={pImg} onChange={e=>setPImg(e.target.value)} placeholder="封面图链接 (可选)" className="studio-input"/>
            <input value={pLink} onChange={e=>setPLink(e.target.value)} placeholder="源码/演示链接" className="studio-input"/>
            <button className="bg-[#065fd4] text-white font-medium px-4 py-2 rounded text-sm uppercase hover:bg-[#0056bf] transition-colors w-full">发布项目</button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-lg border border-[#e5e5e5] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2"><PenTool size={20} className="text-[#065fd4]"/> 写动态</h3>
          </div>
          <form onSubmit={handleAddBlog} className="space-y-4">
            <textarea value={bContent} onChange={e=>setBContent(e.target.value)} placeholder="分享你的想法或更新..." className="studio-input h-32"/>
            <button className="bg-[#065fd4] text-white font-medium px-4 py-2 rounded text-sm uppercase hover:bg-[#0056bf] transition-colors w-full">发布动态</button>
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
        <AlertTriangle size={64} className="mx-auto text-red-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">配置错误：API 安全码</h1>
        <p className="text-[#606060] mb-6">
          你的代码填入了 API 安全码，但 Bmob 后台似乎还没有启用它，或者不一致。
          <br/><br/>
          <strong>请执行以下修复步骤：</strong>
        </p>
        <ol className="text-left text-sm text-[#0f0f0f] bg-[#f2f2f2] p-4 rounded mb-6 list-decimal list-inside space-y-2">
           <li>登录 <a href="https://www.bmob.cn/console" target="_blank" className="text-blue-600 underline">Bmob 后台</a></li>
           <li>点击左侧 <strong>设置</strong> -&gt; <strong>应用配置</strong></li>
           <li>找到 <strong>API 安全码</strong> 一栏</li>
           <li>输入 <code>0713231xX</code> 并点击 <strong>保存</strong> (页面底部)</li>
        </ol>
        <button onClick={()=>window.location.reload()} className="bg-[#065fd4] text-white px-6 py-2 rounded-full hover:bg-[#0056bf]">
          设置好了，刷新页面
        </button>
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
  .studio-input { @apply w-full bg-[#f9f9f9] border border-[#ccc] rounded p-2 text-[#0f0f0f] outline-none focus:border-[#065fd4] placeholder-gray-500 text-sm focus:bg-white transition-colors; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } 
  .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
  .tooltip:hover::after {
    content: attr(title);
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
  }
`;
document.head.appendChild(style);