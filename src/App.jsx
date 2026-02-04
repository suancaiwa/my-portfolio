import React, { useState, useEffect } from 'react';
import { 
  Menu, Search, Bell, Video, Grid, User, LogIn, LogOut, 
  ThumbsUp, MessageSquare, Share2, MoreVertical, 
  Home, Compass, PlaySquare, Clock, Upload, X,
  Github, Code, Lock, Loader2
} from 'lucide-react';

// --- 配置区域 (Bmob) ---
// 1. Secret Key (你提供的)
const BMOB_SECRET_KEY = "9fa1ba7ef19ef189"; 

// 2. API 安全码 (需要手动设置)
// 请去 Bmob 后台 -> 设置 -> 应用配置 -> API 安全码 中设置一个代码
// 然后填入下方引号中 (例如 "123456")
const BMOB_API_KEY = "0713231xX";

// --- 主应用组件 ---
export default function App() {
  const [Bmob, setBmob] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLibLoaded, setIsLibLoaded] = useState(false);

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
      if (BMOB_SECRET_KEY && BMOB_API_KEY && !BMOB_API_KEY.includes("你的")) {
        try {
          // Bmob 初始化: initialize(Secret Key, API 安全码)
          window.Bmob.initialize(BMOB_SECRET_KEY, BMOB_API_KEY);
          setBmob(window.Bmob);
          
          // 检查当前用户
          const current = window.Bmob.User.current();
          if (current) setCurrentUser(current);
        } catch (e) {
          console.error("Bmob init error", e);
        }
      }
      setIsLibLoaded(true);
    }
  }, []);

  // 如果配置未填，显示提示屏幕
  if (isLibLoaded && (!Bmob || BMOB_API_KEY.includes("你的"))) {
     return <ConfigErrorScreen />;
  }

  // 加载中
  if (!isLibLoaded) return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center text-white gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      <p className="text-[#aaaaaa] text-sm">正在连接 Bmob 云服务...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans flex flex-col overflow-hidden">
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
            {activeTab === 'home' && <HomeView Bmob={Bmob} searchQuery={searchQuery} />}
            {activeTab === 'community' && <CommunityView Bmob={Bmob} />}
            {activeTab === 'discussion' && <DiscussionView Bmob={Bmob} />}
            {activeTab === 'studio' && <StudioView Bmob={Bmob} currentUser={currentUser} setCurrentUser={setCurrentUser} />}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- 组件部分 ---

function Header({ isSidebarOpen, setIsSidebarOpen, currentUser, setActiveTab, searchQuery, setSearchQuery }) {
  return (
    <header className="h-14 flex items-center justify-between px-4 bg-[#0f0f0f] sticky top-0 z-50 border-b border-[#272727]">
      <div className="flex items-center gap-4">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#272727] rounded-full transition-colors">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-white rounded-lg p-0.5 flex items-center justify-center h-6 w-8">
            <Video size={16} fill="#FF0000" stroke="#FF0000" />
          </div>
          <span className="text-xl font-bold tracking-tighter font-sans">DevTube</span>
        </div>
      </div>

      <div className="hidden md:flex flex-1 max-w-[600px] mx-4">
        <div className="flex w-full group">
          <div className="flex-1 flex items-center bg-[#121212] border border-[#303030] rounded-l-full px-4 py-1 ml-8 group-focus-within:border-[#1c62b9] transition-colors">
            <input 
              type="text" 
              placeholder="搜索项目" 
              className="w-full bg-transparent outline-none text-white placeholder-gray-400 text-base"
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="bg-[#222222] border border-l-0 border-[#303030] px-5 rounded-r-full hover:bg-[#303030] transition-colors tooltip" title="搜索">
            <Search size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="hidden sm:block p-2 hover:bg-[#272727] rounded-full"><Video size={24} /></button>
        <button className="hidden sm:block p-2 hover:bg-[#272727] rounded-full"><Bell size={24} /></button>
        {currentUser ? (
          <button onClick={() => setActiveTab('studio')} className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold select-none cursor-pointer">
            {currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}
          </button>
        ) : (
          <button onClick={() => setActiveTab('studio')} className="flex items-center gap-2 border border-[#303030] text-[#3ea6ff] px-3 py-1.5 rounded-full hover:bg-[#263850] text-sm font-medium transition-colors">
            <User size={20} className="w-5 h-5" /> 登录
          </button>
        )}
      </div>
    </header>
  );
}

function Sidebar({ isOpen, activeTab, setActiveTab }) {
  if (!isOpen) return null; // 移动端或折叠状态
  
  const MenuItem = ({ id, icon: Icon, label, activeIcon: ActiveIcon }) => {
    const isActive = activeTab === id;
    const TheIcon = isActive && ActiveIcon ? ActiveIcon : Icon;
    return (
      <button 
        onClick={() => setActiveTab(id)} 
        className={`w-full flex items-center gap-5 px-3 py-2.5 rounded-lg mb-1 transition-colors ${isActive ? 'bg-[#272727] font-medium' : 'hover:bg-[#272727]'}`}
      >
        <TheIcon size={24} className={isActive ? "text-white fill-white" : "text-gray-300"} strokeWidth={isActive ? 2.5 : 2}/>
        <span className="text-sm tracking-wide truncate">{label}</span>
      </button>
    )
  };

  return (
    <aside className="w-[240px] flex-shrink-0 overflow-y-auto px-3 pb-4 hidden md:block custom-scrollbar pt-3">
      <div className="border-b border-[#303030] pb-3 mb-3">
        <MenuItem id="home" icon={Home} label="首页" />
        <MenuItem id="community" icon={Compass} label="社区" />
        <MenuItem id="discussion" icon={MessageSquare} label="评论区" />
      </div>
      <div className="border-b border-[#303030] pb-3 mb-3">
        <h3 className="px-3 py-2 text-base font-bold text-white flex items-center gap-2">
          我的频道 <span className="text-xs text-[#aaaaaa] font-normal">后台</span>
        </h3>
        <MenuItem id="studio" icon={PlaySquare} label="工作室" />
      </div>
      
      <div className="px-3 py-2 text-[10px] text-[#aaaaaa] font-medium leading-relaxed">
        <p className="mb-2">关于 开发者 联系方式</p>
        <p>© 2026 DevTube Portfolio</p>
      </div>
    </aside>
  );
}

function HomeView({ Bmob, searchQuery }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const query = Bmob.Query("projects");
      query.order("-createdAt");
      // 注意：Bmob 免费版对模糊查询支持可能有限，这里做兼容处理
      if (searchQuery) {
         try {
           // 尝试简单查询
           query.equalTo("title", searchQuery); 
         } catch(e) {}
      }
      try {
        const res = await query.find();
        if(Array.isArray(res)) setProjects(res);
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, [Bmob, searchQuery]);

  if (loading) return <div className="py-20 text-center text-[#aaaaaa] flex flex-col items-center gap-2"><Loader2 className="animate-spin"/>加载内容...</div>;

  return (
    <div>
      {/* 分类标签栏 (装饰) */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
         {['全部', 'React', 'Vue', '前端', '后端', '全栈', 'Web3', 'AI'].map((tag,i) => (
           <button key={i} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${i===0 ? 'bg-white text-black' : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'}`}>
             {tag}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 animate-fadeIn">
        {projects.length === 0 && <div className="col-span-full text-center text-[#aaaaaa] py-10">暂无项目，快去工作室发布吧</div>}
        {projects.map(p => (
          <div key={p.objectId} className="group cursor-pointer flex flex-col gap-3">
            {/* 封面 */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1f1f1f]">
              {p.image_url ? (
                <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" onError={(e)=>e.target.style.display='none'}/>
              ) : <div className="w-full h-full flex items-center justify-center text-gray-600"><Code size={48}/></div>}
              {/* 时长角标 (装饰) */}
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs font-bold px-1 py-0.5 rounded">DEV</div>
            </div>
            
            {/* 信息 */}
            <div className="flex gap-3 pr-4 items-start">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shrink-0"></div>
              <div className="flex flex-col">
                <h3 className="text-white font-bold text-sm sm:text-base line-clamp-2 leading-tight mb-1 group-hover:text-blue-400 transition-colors">{p.title}</h3>
                <div className="text-[#aaaaaa] text-xs sm:text-sm flex flex-col">
                   <span className="hover:text-white transition-colors">Developer</span>
                   <span>1.2万次观看 • {p.createdAt.split(' ')[0]}</span>
                </div>
                {p.description && <p className="text-[#aaaaaa] text-xs mt-1 line-clamp-1">{p.description}</p>}
                
                {/* 按钮 */}
                <div className="flex gap-2 mt-2">
                  {p.git_link && (
                    <a href={p.git_link} target="_blank" className="text-xs bg-[#272727] hover:bg-[#3f3f3f] px-2 py-1 rounded text-white flex gap-1 items-center transition-colors" onClick={e=>e.stopPropagation()}>
                      <Github size={12}/> 源码
                    </a>
                  )}
                </div>
              </div>
              <div className="ml-auto">
                 <MoreVertical size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
        <h2 className="text-xl font-bold">最新动态</h2>
        <div className="flex gap-4 text-sm text-[#aaaaaa]">
           <span className="text-white font-medium cursor-pointer">全部</span>
           <span className="hover:text-white cursor-pointer">项目更新</span>
        </div>
      </div>
      <div className="space-y-4">
        {blogs.map(b => (
          <div key={b.objectId} className="border border-[#303030] rounded-xl p-4 bg-[#0f0f0f] hover:bg-[#1f1f1f] transition-colors">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 shrink-0 flex items-center justify-center font-bold text-sm">D</div>
              <div className="flex-1">
                <div className="flex gap-2 items-center mb-1">
                  <span className="font-bold text-sm">Developer Channel</span>
                  <span className="text-[#aaaaaa] text-xs">{b.createdAt}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed mb-3">{b.content}</p>
                <div className="flex gap-2">
                   <button className="flex items-center gap-2 px-2 py-1 hover:bg-[#303030] rounded-full text-[#aaaaaa]">
                      <ThumbsUp size={16} /> <span className="text-xs">12</span>
                   </button>
                   <button className="flex items-center gap-2 px-2 py-1 hover:bg-[#303030] rounded-full text-[#aaaaaa]">
                      <Share2 size={16} />
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
      alert("发布失败: " + JSON.stringify(err)); setLoading(false);
    });
  };

  return (
    <div className="max-w-[850px] mx-auto pt-2 animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-6">{messages.length} 条评论</h2>
        <div className="flex gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold shrink-0">?</div>
          <form onSubmit={handleSubmit} className="flex-1">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="添加昵称..." className="w-full bg-transparent border-b border-[#303030] focus:border-white outline-none pb-1 mb-2 text-sm text-white placeholder-[#aaaaaa]"/>
            <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="发表评论..." className="w-full bg-transparent border-b border-[#303030] focus:border-white outline-none pb-1 text-sm text-white placeholder-[#aaaaaa]"/>
            <div className="flex justify-end mt-2 gap-2">
              <button type="button" onClick={()=>{setName('');setMsg('')}} className="px-3 py-1.5 rounded-full text-sm font-medium text-white hover:bg-[#272727]">取消</button>
              <button disabled={loading || !name || !msg} className={`px-3 py-1.5 rounded-full text-sm font-medium ${(!name || !msg) ? 'bg-[#272727] text-[#717171]' : 'bg-[#3ea6ff] text-black hover:bg-[#65b8ff]'} transition-colors`}>评论</button>
            </div>
          </form>
        </div>
      </div>
      <div className="space-y-6">
        {messages.map(m => (
          <div key={m.objectId} className="flex gap-4 group">
            <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center font-bold shrink-0 text-sm">
              {m.name ? m.name[0].toUpperCase() : 'A'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-xs font-bold text-white bg-[#272727] px-1.5 py-0.5 rounded-full hover:bg-[#3f3f3f] cursor-pointer">@{m.name}</span>
                 <span className="text-xs text-[#aaaaaa] hover:text-white cursor-pointer">{m.createdAt}</span>
              </div>
              <p className="text-sm text-white leading-relaxed">{m.message}</p>
              
              <div className="flex items-center gap-3 mt-2">
                 <div className="flex items-center gap-1 cursor-pointer">
                    <ThumbsUp size={14} className="text-[#aaaaaa] hover:text-white"/>
                 </div>
                 <div className="flex items-center gap-1 cursor-pointer">
                    <ThumbsUp size={14} className="text-[#aaaaaa] hover:text-white rotate-180 mt-1"/>
                 </div>
                 <span className="text-xs font-medium text-[#aaaaaa] hover:text-white cursor-pointer ml-2">回复</span>
              </div>
            </div>
            <MoreVertical size={20} className="text-white opacity-0 group-hover:opacity-100 cursor-pointer" />
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

  const handleLogin = (e) => {
    e.preventDefault();
    Bmob.User.login(username, password).then(res => {
      setCurrentUser(res);
    }).catch(err => {
      alert("登录失败: " + (err.error || JSON.stringify(err)));
    });
  };

  const handleRegister = () => {
    let params = { username: username, password: password };
    Bmob.User.register(params).then(res => {
      alert("注册成功，请登录");
    }).catch(err => alert("注册失败: " + (err.error || JSON.stringify(err))));
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
    }).catch(err => alert("发布失败"));
  };

  const handleAddBlog = (e) => {
    e.preventDefault();
    const query = Bmob.Query("blogs");
    query.set("content", bContent);
    query.save().then(res => {
      alert("动态发布成功"); setBContent('');
    }).catch(err => alert("发布失败"));
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-[#1f1f1f] rounded-xl border border-[#303030] text-center animate-fadeIn">
        <Lock size={32} className="text-[#3ea6ff] mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-6">Studio 登录</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="用户名" className="studio-input"/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="密码" className="studio-input"/>
          <div className="flex gap-2">
             <button type="submit" className="flex-1 bg-[#3ea6ff] text-black font-medium py-2 rounded hover:bg-[#65b8ff] transition-colors">登录</button>
             <button type="button" onClick={handleRegister} className="flex-1 bg-[#272727] text-white font-medium py-2 rounded hover:bg-[#3f3f3f] transition-colors">注册</button>
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-4">首次使用请直接输入账号密码点击「注册」</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto pt-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">频道内容 (后台)</h2>
        <button onClick={handleLogout} className="flex items-center gap-2 text-[#aaaaaa] hover:text-white"><LogOut size={18}/> 退出</button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#1f1f1f] p-6 rounded-md border border-[#303030]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold">上传视频 (项目)</h3>
            <Upload className="text-[#3ea6ff]" size={20}/>
          </div>
          <form onSubmit={handleAddProject} className="space-y-4">
            <input value={pTitle} onChange={e=>setPTitle(e.target.value)} placeholder="标题 (必填)" className="studio-input"/>
            <textarea value={pDesc} onChange={e=>setPDesc(e.target.value)} placeholder="说明" className="studio-input h-24"/>
            <input value={pImg} onChange={e=>setPImg(e.target.value)} placeholder="缩略图 URL" className="studio-input"/>
            <input value={pLink} onChange={e=>setPLink(e.target.value)} placeholder="视频链接 (Git/Demo)" className="studio-input"/>
            <button className="bg-[#3ea6ff] text-black font-medium px-4 py-2 rounded text-sm uppercase hover:bg-[#65b8ff] transition-colors">发布</button>
          </form>
        </div>
        <div className="bg-[#1f1f1f] p-6 rounded-md border border-[#303030]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold">创建帖子 (动态)</h3>
            <MessageSquare className="text-[#3ea6ff]" size={20}/>
          </div>
          <form onSubmit={handleAddBlog} className="space-y-4">
            <textarea value={bContent} onChange={e=>setBContent(e.target.value)} placeholder="分享你的想法..." className="studio-input h-32"/>
            <button className="bg-[#3ea6ff] text-black font-medium px-4 py-2 rounded text-sm uppercase hover:bg-[#65b8ff] transition-colors">发布</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ConfigErrorScreen() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center p-4">
      <div className="max-w-md text-center bg-[#1f1f1f] p-8 rounded-xl border border-[#303030]">
        <Lock size={64} className="mx-auto text-red-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">需要 API 安全码</h1>
        <p className="text-[#aaaaaa] mb-6">
          Bmob 的 API 安全码需要你手动设置。
          <br/><br/>
          请前往 Bmob 后台 → 设置 → 应用配置 → API 安全码。
          <br/>
          设置一个密码，然后填入代码中的 BMOB_API_KEY。
        </p>
      </div>
    </div>
  );
}

const style = document.createElement('style');
style.innerHTML = `
  .custom-scrollbar::-webkit-scrollbar { width: 8px; }
  .custom-scrollbar::-webkit-scrollbar-track { bg: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #717171; border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #a0a0a0; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .studio-input { @apply w-full bg-[#121212] border border-[#303030] rounded p-2 text-white outline-none focus:border-[#3ea6ff] placeholder-gray-500 text-sm focus:bg-black transition-colors; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } 
  .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
`;
document.head.appendChild(style);