import React, { useState, useEffect } from 'react';
import { 
  Github, 
  ExternalLink, 
  MessageSquare, 
  BookOpen, 
  Code, 
  Send, 
  Eye, 
  PlusCircle, 
  Trash2, 
  User,
  Menu,
  X,
  Sparkles,
  Loader2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy, 
  serverTimestamp, 
  deleteDoc, 
  doc,
  updateDoc,
  getDoc,
  setDoc,
  increment
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- Gemini API Configuration ---
const apiKey = ""; // API Key will be injected by the environment

// --- Gemini API Helper Function ---
async function callGemini(prompt) {
  if (!apiKey) {
    alert("API Key missing. Please check configuration.");
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  try {
    // Simple retry logic with exponential backoff
    for (let i = 0; i < 3; i++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "AI 暂时无法响应，请稍后再试。";
      } catch (e) {
        if (i === 2) throw e;
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 服务繁忙，请稍后重试。";
  }
}

// --- Firebase Configuration & Initialization ---
// 1. 你的个人配置 (来自截图)
// 修正了 API Key (s -> S)
const myFirebaseConfig = {
  apiKey: "AIzaSyAGciSQji6nkotPuRqcBImjqotBdQWuKns", 
  authDomain: "myplatform-69db2.firebaseapp.com",
  projectId: "myplatform-69db2",
  storageBucket: "myplatform-69db2.firebasestorage.app",
  messagingSenderId: "625057750309",
  appId: "1:625057750309:web:22c06e0447ab2e99044ecc",
  measurementId: "G-H5G5PTY94N"
};

// 2. 智能配置切换
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : myFirebaseConfig;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 3. 确定数据存储路径
const appId = typeof __app_id !== 'undefined' ? __app_id : 'my-portfolio-production';

// --- Component: Main App ---
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('projects'); // projects, blog, guestbook, admin
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  // Authentication & Page View Logic
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
         // In a real scenario with custom token
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        incrementPageView(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Increment Page View (Simple implementation)
  const incrementPageView = async (uid) => {
    // 修复：增加了 'total' 作为文档 ID，确保路径层级为偶数 (6层)
    const statsRef = doc(db, 'artifacts', appId, 'public', 'data', 'stats_page_views', 'total');
    try {
      const docSnap = await getDoc(statsRef);
      if (docSnap.exists()) {
        await updateDoc(statsRef, { count: increment(1) });
      } else {
        await setDoc(statsRef, { count: 1 });
      }
    } catch (e) {
      console.error("Error updating views", e);
    }
  };

  // Listen to View Count
  useEffect(() => {
    if (!user) return;
    // 修复：同样在这里更新了路径，确保与上面一致
    const statsRef = doc(db, 'artifacts', appId, 'public', 'data', 'stats_page_views', 'total');
    const unsub = onSnapshot(statsRef, (doc) => {
      if (doc.exists()) {
        setViewCount(doc.data().count);
      }
    });
    return () => unsub();
  }, [user]);

  // Navigation Helper
  const navClass = (tab) => 
    `cursor-pointer px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`;

  // Mobile Menu Helper
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      
      {/* Header / Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
              <Code className="w-6 h-6" />
              <span>DevPortfolio</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-2">
              <button onClick={() => setActiveTab('projects')} className={navClass('projects')}>
                <Code className="w-4 h-4" /> 项目展示
              </button>
              <button onClick={() => setActiveTab('blog')} className={navClass('blog')}>
                <BookOpen className="w-4 h-4" /> 日常动态
              </button>
              <button onClick={() => setActiveTab('guestbook')} className={navClass('guestbook')}>
                <MessageSquare className="w-4 h-4" /> 留言墙
              </button>
              <button onClick={() => setActiveTab('admin')} className={navClass('admin')}>
                <User className="w-4 h-4" /> 管理后台
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={toggleMenu} className="text-slate-600 hover:text-indigo-600">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-2 space-y-1 shadow-lg">
             <button onClick={() => {setActiveTab('projects'); toggleMenu();}} className={`w-full text-left ${navClass('projects')}`}>项目展示</button>
             <button onClick={() => {setActiveTab('blog'); toggleMenu();}} className={`w-full text-left ${navClass('blog')}`}>日常动态</button>
             <button onClick={() => {setActiveTab('guestbook'); toggleMenu();}} className={`w-full text-left ${navClass('guestbook')}`}>留言墙</button>
             <button onClick={() => {setActiveTab('admin'); toggleMenu();}} className={`w-full text-left ${navClass('admin')}`}>管理后台</button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Loading State */}
        {!user && (
          <div className="flex justify-center items-center h-64 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="ml-2">正在连接数据服务...</span>
          </div>
        )}

        {user && (
          <>
            {activeTab === 'projects' && <ProjectsView user={user} />}
            {activeTab === 'blog' && <BlogView user={user} />}
            {activeTab === 'guestbook' && <GuestbookView user={user} />}
            {activeTab === 'admin' && <AdminView user={user} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>© 2026 My Personal Website. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
              <Eye className="w-3 h-3" />
              <span>浏览量: {viewCount}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- View: Projects ---
function ProjectsView({ user }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'projects'), 
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800">我的项目</h2>
        <p className="text-slate-500 mt-2">这里展示了我近期开发的一些有趣的作品。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
            <p className="text-slate-400">暂无项目，请去后台添加。</p>
          </div>
        )}
        {projects.map(project => (
          <div key={project.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden flex flex-col">
            <div className="h-48 bg-slate-200 relative overflow-hidden group">
               {project.imageUrl ? (
                 <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => e.target.style.display='none'} />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">No Image</div>
               )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{project.title}</h3>
              <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow whitespace-pre-line">{project.description}</p>
              <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3">
                {project.gitLink && (
                  <a href={project.gitLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                    <Github className="w-4 h-4" /> 源码
                  </a>
                )}
                {project.demoLink && (
                  <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                    <ExternalLink className="w-4 h-4" /> 演示
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- View: Blog ---
function BlogView({ user }) {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'blogs'), 
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">日常动态</h2>
        <p className="text-slate-500 mt-1">记录生活点滴与技术思考。</p>
      </div>

      <div className="space-y-8">
        {blogs.length === 0 && (
           <p className="text-center text-slate-400 py-10">暂无动态。</p>
        )}
        {blogs.map((blog, index) => (
          <div key={blog.id} className="relative pl-8 border-l-2 border-slate-200 pb-2">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-100 border-2 border-indigo-600"></div>
            <div className="mb-1 text-sm text-slate-400 font-mono">
              {blog.createdAt?.seconds ? new Date(blog.createdAt.seconds * 1000).toLocaleDateString() : '刚刚'}
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-100">
               <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{blog.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- View: Guestbook ---
function GuestbookView({ user }) {
  const [messages, setMessages] = useState([]);
  const [newName, setNewName] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'guestbook'), 
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newMessage.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'guestbook'), {
        name: newName,
        message: newMessage,
        createdAt: serverTimestamp()
      });
      setNewName('');
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
    setIsSubmitting(false);
  };

  const handleAISummary = async () => {
    if (messages.length === 0) return;
    setIsSummarizing(true);
    const textToSummarize = messages.slice(0, 20).map(m => `${m.name}: ${m.message}`).join("\n");
    const prompt = `请用一段简短、温暖的中文，总结以下留言墙上访客们的主要反馈和情绪。如果留言大多是正面的，请体现出大家的喜爱之情：\n\n${textToSummarize}`;
    
    const result = await callGemini(prompt);
    if (result) setSummary(result);
    setIsSummarizing(false);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">留言墙</h2>
        <p className="text-slate-500 mt-2">欢迎留下你的足迹，无需登录。</p>
      </div>

      {/* AI Summary Section */}
      {messages.length > 0 && (
        <div className="mb-8 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
           <div className="flex justify-between items-start">
             <div className="flex gap-2 text-indigo-800 font-medium items-center mb-2">
               <Sparkles className="w-4 h-4" />
               <span>AI 留言总结</span>
             </div>
             {!summary && (
               <button 
                 onClick={handleAISummary}
                 disabled={isSummarizing}
                 className="text-xs bg-white text-indigo-600 px-3 py-1 rounded-full border border-indigo-200 hover:bg-indigo-50 transition-colors flex items-center gap-1"
               >
                 {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3" />}
                 {isSummarizing ? "分析中..." : "生成总结"}
               </button>
             )}
           </div>
           
           {summary ? (
             <p className="text-sm text-indigo-700 leading-relaxed animate-fadeIn">{summary}</p>
           ) : (
             <p className="text-xs text-indigo-400">点击按钮，让 AI 帮你读读大家的留言...</p>
           )}
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 mb-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">昵称</label>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="怎么称呼你？"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">留言内容</label>
            <textarea 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="说点什么吧..."
              rows="3"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
              required
            ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? '发送中...' : <><Send className="w-4 h-4" /> 发布留言</>}
          </button>
        </form>
      </div>

      {/* Message List */}
      <div className="space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
              {msg.name ? msg.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold text-slate-800">{msg.name}</span>
                <span className="text-xs text-slate-400">
                  {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString() : '刚刚'}
                </span>
              </div>
              <p className="text-slate-600 text-sm">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- View: Admin (Management) ---
function AdminView({ user }) {
  // Project State
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pGit, setPGit] = useState('');
  const [pImg, setPImg] = useState('');
  const [isOptimizingProject, setIsOptimizingProject] = useState(false);
  
  // Blog State
  const [bContent, setBContent] = useState('');
  const [isExpandingBlog, setIsExpandingBlog] = useState(false);

  // Lists for deletion
  const [projects, setProjects] = useState([]);
  const [blogs, setBlogs] = useState([]);

  // Fetch for Admin list
  useEffect(() => {
    if (!user) return;
    const unsubP = onSnapshot(
        query(collection(db, 'artifacts', appId, 'public', 'data', 'projects'), orderBy('createdAt', 'desc')),
        (snap) => setProjects(snap.docs.map(d => ({id: d.id, ...d.data()})))
    );
    const unsubB = onSnapshot(
        query(collection(db, 'artifacts', appId, 'public', 'data', 'blogs'), orderBy('createdAt', 'desc')),
        (snap) => setBlogs(snap.docs.map(d => ({id: d.id, ...d.data()})))
    );
    return () => { unsubP(); unsubB(); };
  }, [user]);

  const handleAddProject = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'projects'), {
      title: pTitle,
      description: pDesc,
      gitLink: pGit,
      imageUrl: pImg, 
      createdAt: serverTimestamp()
    });
    setPTitle(''); setPDesc(''); setPGit(''); setPImg('');
    alert('项目已发布！');
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'blogs'), {
      content: bContent,
      createdAt: serverTimestamp()
    });
    setBContent('');
    alert('动态已发布！');
  };

  const handleDelete = async (collectionName, id) => {
    if(confirm('确定要删除吗？')) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id));
    }
  };

  // --- AI Features Handlers ---
  const handleAIOptimizeProject = async () => {
    if (!pDesc) return alert("请先填写一些简单的项目描述！");
    setIsOptimizingProject(true);
    const prompt = `请作为一个专业的技术文档写手，帮我重写以下项目描述。要求：强调技术亮点，语言专业且富有吸引力，适合展示在个人作品集中。如果原描述是中文则用中文，英文则用英文。\n\n原描述：${pDesc}`;
    const result = await callGemini(prompt);
    if (result) setPDesc(result);
    setIsOptimizingProject(false);
  };

  const handleAIExpandBlog = async () => {
    if (!bContent) return alert("请先写一点点想法！");
    setIsExpandingBlog(true);
    const prompt = `请作为一个亲切、热爱技术的开发者博主，帮我将以下简单的想法扩写成一篇简短的日常动态（100字左右）。语调轻松自然，像是在和朋友聊天：\n\n想法：${bContent}`;
    const result = await callGemini(prompt);
    if (result) setBContent(result);
    setIsExpandingBlog(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn pb-20">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <p className="text-yellow-700 text-sm">
          <strong>注意：</strong> 管理后台区域。使用 ✨ 按钮体验 AI 辅助写作功能。
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Add Project */}
        <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-600" /> 发布新项目
          </h3>
          <form onSubmit={handleAddProject} className="space-y-3">
            <input className="admin-input" placeholder="项目标题" value={pTitle} onChange={e=>setPTitle(e.target.value)} required />
            
            <div className="relative">
              <textarea 
                className="admin-input pr-10" 
                placeholder="项目描述 (输入草稿，点击右下角星星优化)" 
                value={pDesc} 
                onChange={e=>setPDesc(e.target.value)} 
                rows="4" 
                required 
              />
              <button
                type="button"
                onClick={handleAIOptimizeProject}
                disabled={isOptimizingProject}
                className="absolute bottom-2 right-2 text-indigo-500 hover:text-indigo-700 bg-indigo-50 p-1.5 rounded-md transition-colors"
                title="AI 优化描述"
              >
                {isOptimizingProject ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
              </button>
            </div>

            <input className="admin-input" placeholder="Git/Demo 链接" value={pGit} onChange={e=>setPGit(e.target.value)} />
            <input className="admin-input" placeholder="封面图片 URL" value={pImg} onChange={e=>setPImg(e.target.value)} />
            <button type="submit" className="admin-btn">发布项目</button>
          </form>

          {/* Mini List for deletion */}
          <div className="mt-6 border-t pt-4">
             <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">管理已发布项目</h4>
             <ul className="space-y-2 max-h-40 overflow-y-auto">
               {projects.map(p => (
                 <li key={p.id} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded">
                   <span className="truncate w-40">{p.title}</span>
                   <button onClick={() => handleDelete('projects', p.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                 </li>
               ))}
             </ul>
          </div>
        </div>

        {/* Add Blog */}
        <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-600" /> 发布日常动态
          </h3>
          <form onSubmit={handleAddBlog} className="space-y-3">
            <div className="relative">
              <textarea 
                className="admin-input pr-10" 
                placeholder="今天发生了什么？(输入关键词，点击星星扩写)" 
                value={bContent} 
                onChange={e=>setBContent(e.target.value)} 
                rows="6" 
                required 
              />
              <button
                type="button"
                onClick={handleAIExpandBlog}
                disabled={isExpandingBlog}
                className="absolute bottom-2 right-2 text-indigo-500 hover:text-indigo-700 bg-indigo-50 p-1.5 rounded-md transition-colors"
                title="AI 扩写动态"
              >
                {isExpandingBlog ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
              </button>
            </div>
            <button type="submit" className="admin-btn">发布动态</button>
          </form>

          {/* Mini List for deletion */}
          <div className="mt-6 border-t pt-4">
             <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">管理已发布动态</h4>
             <ul className="space-y-2 max-h-40 overflow-y-auto">
               {blogs.map(b => (
                 <li key={b.id} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded">
                   <span className="truncate w-40">{b.content}</span>
                   <button onClick={() => handleDelete('blogs', b.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Styles injection for Tailwind extensions ---
const style = document.createElement('style');
style.innerHTML = `
  .admin-input {
    @apply w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none;
  }
  .admin-btn {
    @apply w-full bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-900 text-sm font-medium transition-colors;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.4s ease-out forwards;
  }
`;
document.head.appendChild(style);