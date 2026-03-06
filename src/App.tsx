/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, 
  Map, 
  Code2, 
  Calendar, 
  Search, 
  Moon, 
  Sun, 
  ExternalLink, 
  CheckCircle2, 
  Circle,
  MessageSquare,
  LayoutGrid,
  Zap,
  BookOpen,
  Settings,
  Plus,
  Trash2,
  X,
  Link as LinkIcon,
  Bot,
  Sparkles,
  Brain,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Resource {
  id: string;
  title: string;
  label: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  category: string;
}

const DEFAULT_RESOURCES: Resource[] = [
  {
    id: 'striver',
    title: 'Striver’s A2Z',
    label: 'DSA Comprehensive Guide',
    description: 'Master Data Structures and Algorithms with a step-by-step curated path.',
    url: 'https://takeuforward.org/strivers-a2z-dsa-course/',
    icon: <Code2 className="w-6 h-6 text-blue-400" />,
    category: 'Practice'
  },
  {
    id: 'hello-interview',
    title: 'Hello Interview',
    label: 'System Design & Patterns',
    description: 'Deep dives into system design patterns and real-world interview scenarios.',
    url: 'https://www.hellointerview.com/',
    icon: <LayoutGrid className="w-6 h-6 text-purple-400" />,
    category: 'Roadmaps'
  },
  {
    id: 'roadmap-sh',
    title: 'Roadmap.sh',
    label: 'Computer Science Roadmaps',
    description: 'Visual guides to learning paths for frontend, backend, and DevOps.',
    url: 'https://roadmap.sh/',
    icon: <Map className="w-6 h-6 text-emerald-400" />,
    category: 'Roadmaps'
  },
  {
    id: 'neetcode',
    title: 'NeetCode',
    label: 'Leetcoding Roadmap',
    description: 'The ultimate guide to solving LeetCode problems efficiently.',
    url: 'https://neetcode.io/',
    icon: <Zap className="w-6 h-6 text-yellow-400" />,
    category: 'Practice'
  },
  {
    id: 'interview-kickstart',
    title: 'Interview Kickstart',
    label: 'My Class Schedule',
    description: 'Access your live classes, recordings, and personalized feedback.',
    url: 'https://www.interviewkickstart.com/',
    icon: <Calendar className="w-6 h-6 text-orange-400" />,
    category: 'Schedule'
  },
  {
    id: 'discord',
    title: 'Discord',
    label: 'Study Community',
    description: 'Connect with peers, share resources, and stay motivated together.',
    url: 'https://discord.com/',
    icon: <MessageSquare className="w-6 h-6 text-indigo-400" />,
    category: 'Home'
  },
  {
    id: 'udemy',
    title: 'Udemy',
    label: 'Online Courses',
    description: 'Access your technical courses, certifications, and personal development library.',
    url: 'https://www.udemy.com/',
    icon: <BookOpen className="w-6 h-6 text-red-400" />,
    category: 'Home'
  },
  {
    id: 'leetcode',
    title: 'LeetCode',
    label: 'Coding Practice',
    description: 'The world\'s leading platform for practicing coding skills and interview preparation.',
    url: 'https://leetcode.com/',
    icon: <Code2 className="w-6 h-6 text-yellow-500" />,
    category: 'Practice'
  },
  {
    id: 'in28minutes-java',
    title: 'Java Interview Guide',
    label: 'in28minutes',
    description: 'Comprehensive Java interview preparation with 200+ questions and answers.',
    url: 'https://interview.in28minutes.com/java/',
    icon: <Code2 className="w-6 h-6 text-orange-500" />,
    category: 'Practice'
  }
];

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [newTodoText, setNewTodoText] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    label: '',
    description: '',
    url: ''
  });

  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem('lumina_resources');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Re-attach icons which are JSX and not serializable
      return parsed.map((res: any) => ({
        ...res,
        icon: res.icon || <LinkIcon className="w-6 h-6 text-purple-400" />
      }));
    }
    return DEFAULT_RESOURCES;
  });

  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('lumina_todos');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, text: 'Complete 2 LeetCode Mediums', completed: false },
      { id: 2, text: 'Review System Design Patterns', completed: true },
      { id: 3, text: 'Watch Roadmap.sh Video', completed: false },
    ];
  });

  useEffect(() => {
    localStorage.setItem('lumina_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    // Save resources but omit the icon JSX
    const toSave = resources.map(({ icon, ...rest }) => rest);
    localStorage.setItem('lumina_resources', JSON.stringify(toSave));
  }, [resources]);

  // Timer State
  const [baseMinutes, setBaseMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredResources = useMemo(() => {
    return resources.filter(res => 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, resources]);

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newTodo: Todo = {
      id: Date.now(),
      text: newTodoText.trim(),
      completed: false
    };
    setTodos(prev => [...prev, newTodo]);
    setNewTodoText('');
  };

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const addResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.title || !newResource.url) return;

    const resource: Resource = {
      id: Date.now().toString(),
      title: newResource.title,
      label: newResource.label || 'Resource',
      description: newResource.description || 'Quick access link.',
      url: newResource.url.startsWith('http') ? newResource.url : `https://${newResource.url}`,
      icon: <LinkIcon className="w-6 h-6 text-purple-400" />,
      category: 'Home'
    };

    setResources(prev => [resource, ...prev]);
    setNewResource({ title: '', label: '', description: '', url: '' });
    setIsAddModalOpen(false);
  };

  const deleteResource = (id: string) => {
    setResources(prev => prev.filter(res => res.id !== id));
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ease-in-out ${isFocusMode ? 'bg-black' : 'bg-[#0a0a0c]'} text-white font-sans selection:bg-purple-500/30`}>
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] transition-opacity duration-1000 ${isFocusMode ? 'opacity-20' : 'opacity-100'}`} />
        <div className={`absolute top-1/2 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] transition-opacity duration-1000 ${isFocusMode ? 'opacity-10' : 'opacity-100'}`} />
      </div>

      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <nav className="w-20 lg:w-24 flex flex-col items-center py-8 border-r border-white/5 bg-black/20 backdrop-blur-xl">
          <div className="mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <BookOpen className="text-white w-6 h-6" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              {[
                { icon: Home, label: 'Home' }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  className={`group relative p-3 rounded-2xl transition-all duration-300 ${
                    activeTab === item.label 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="absolute left-full ml-4 px-2 py-1 bg-white/10 backdrop-blur-md rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 z-50">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="w-8 h-px bg-white/10 mx-auto" />

            <div className="flex flex-col gap-4">
              {[
                { 
                  icon: (props: any) => <Bot className={props.className} />, 
                  label: 'ChatGPT', 
                  url: 'https://chatgpt.com',
                  color: 'text-[#10a37f]' // ChatGPT Emerald
                },
                { 
                  icon: (props: any) => <img src="https://cdn.simpleicons.org/anthropic/ffffff" className={props.className} alt="Claude" referrerPolicy="no-referrer" />, 
                  label: 'Claude', 
                  url: 'https://claude.ai' 
                },
                { 
                  icon: (props: any) => <Brain className={props.className} />, 
                  label: 'DeepSeek', 
                  url: 'https://chat.deepseek.com',
                  color: 'text-[#60a5fa]' // DeepSeek Blue
                },
                { 
                  icon: (props: any) => <img src="https://cdn.simpleicons.org/x/ffffff" className={props.className} alt="Grok" referrerPolicy="no-referrer" />, 
                  label: 'Grok', 
                  url: 'https://x.com/i/grok' 
                },
                { 
                  icon: (props: any) => <img src="https://cdn.simpleicons.org/perplexity/ffffff" className={props.className} alt="Perplexity" referrerPolicy="no-referrer" />, 
                  label: 'Perplexity', 
                  url: 'https://www.perplexity.ai' 
                }
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  <item.icon className={`w-6 h-6 opacity-40 group-hover:opacity-100 transition-all duration-300 ${'color' in item ? item.color : ''} group-hover:scale-110`} />
                  <span className="absolute left-full ml-4 px-2 py-1 bg-white/10 backdrop-blur-md rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 z-50">
                    {item.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="p-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            {isFocusMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-black/10 backdrop-blur-md">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all placeholder:text-white/20"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 ml-8">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all active:scale-95 text-sm font-bold"
              >
                <Plus className="w-4 h-4" /> Add Card
              </button>
              <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </header>

          {/* Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
              
              {/* Grid Section */}
              <div className="flex-1">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, Scholar</h1>
                  <p className="text-white/40">Your learning ecosystem is ready. What's the plan today?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredResources.map((resource, index) => (
                      <motion.div
                        layout
                        key={resource.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500" />
                        <div className="relative h-full bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl flex flex-col hover:bg-white/[0.08] transition-all duration-300">
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                              {resource.icon}
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => deleteResource(resource.id)}
                                className="p-2 rounded-xl text-white/0 group-hover:text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                title="Delete Resource"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2 py-1 rounded-full border border-white/5">
                                {resource.category}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1 group-hover:text-purple-400 transition-colors">{resource.title}</h3>
                            <p className="text-xs font-medium text-purple-400/80 mb-3 uppercase tracking-wide">{resource.label}</p>
                            <p className="text-sm text-white/50 leading-relaxed mb-6">
                              {resource.description}
                            </p>
                          </div>

                          <a 
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-95"
                          >
                            Launch <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {filteredResources.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-white/20">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg">No resources found matching your search.</p>
                  </div>
                )}
              </div>

              {/* Sidebar Widget Panel */}
              <aside className="w-full lg:w-80 flex flex-col gap-6">
                {/* Daily Goal Widget */}
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">Daily Goals</h2>
                    <span className="text-xs text-purple-400 font-bold">
                      {todos.length > 0 ? `${todos.filter(t => t.completed).length}/${todos.length}` : '0/0'}
                    </span>
                  </div>

                  <form onSubmit={addTodo} className="mb-6 flex gap-2">
                    <input 
                      type="text"
                      placeholder="Add a goal..."
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-white/20"
                    />
                    <button 
                      type="submit"
                      className="p-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </form>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    <AnimatePresence mode="popLayout">
                      {todos.map(todo => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={todo.id}
                          className="flex items-center gap-2 group"
                        >
                          <button
                            onClick={() => toggleTodo(todo.id)}
                            className="flex-1 flex items-center gap-3 text-left"
                          >
                            <div className={`shrink-0 transition-colors ${todo.completed ? 'text-emerald-400' : 'text-white/20 group-hover:text-white/40'}`}>
                              {todo.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                            </div>
                            <span className={`text-sm transition-all ${todo.completed ? 'text-white/30 line-through' : 'text-white/70'}`}>
                              {todo.text}
                            </span>
                          </button>
                          <button 
                            onClick={() => deleteTodo(todo.id)}
                            className="p-1.5 rounded-lg text-white/10 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {todos.length === 0 && (
                      <p className="text-center text-white/20 text-xs py-4">No goals set for today.</p>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${todos.length > 0 ? (todos.filter(t => t.completed).length / todos.length) * 100 : 0}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      />
                    </div>
                    <p className="text-[10px] text-white/30 mt-3 text-center uppercase tracking-widest font-bold">Daily Progress</p>
                  </div>
                </div>

                {/* Quick Stats Widget */}
                <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Zap className="w-20 h-20 text-white" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <h2 className="text-lg font-bold">Focus Session</h2>
                    {!isTimerRunning && (
                      <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {showSettings && !isTimerRunning && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4 relative z-10"
                      >
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
                          <span className="text-xs text-white/60 font-medium">Set Duration</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              min="1"
                              max="120"
                              value={baseMinutes}
                              onChange={(e) => {
                                const val = Math.max(1, Math.min(120, parseInt(e.target.value) || 1));
                                setBaseMinutes(val);
                                setTimerSeconds(val * 60);
                              }}
                              className="w-12 bg-white/10 border border-white/10 rounded-lg py-1 text-center text-sm font-bold focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                            />
                            <span className="text-[10px] text-white/40 uppercase font-bold">min</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mb-6 relative z-10">
                    <p className="text-4xl font-mono font-bold tracking-tighter text-white mb-2">
                      {formatTime(timerSeconds)}
                    </p>
                    <p className="text-sm text-white/60">
                      {isTimerRunning ? 'Session in progress...' : 'Ready for a deep work session?'}
                    </p>
                  </div>
                  <div className="flex gap-2 relative z-10">
                    <button 
                      onClick={() => {
                        setIsTimerRunning(!isTimerRunning);
                        setShowSettings(false);
                      }}
                      className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 ${
                        isTimerRunning 
                          ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' 
                          : 'bg-white text-black hover:bg-white/90'
                      }`}
                    >
                      {isTimerRunning ? 'Pause' : 'Start Timer'}
                    </button>
                    {timerSeconds !== baseMinutes * 60 && (
                      <button 
                        onClick={() => {
                          setIsTimerRunning(false);
                          setTimerSeconds(baseMinutes * 60);
                        }}
                        className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95 text-xs font-bold uppercase tracking-widest"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </aside>

            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#121214] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Add New Resource</h2>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={addResource} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Title</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. GitHub"
                    value={newResource.title}
                    onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Label</label>
                  <input 
                    type="text"
                    placeholder="e.g. Code Repository"
                    value={newResource.label}
                    onChange={(e) => setNewResource({...newResource, label: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">URL</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. github.com"
                    value={newResource.url}
                    onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Description</label>
                  <textarea 
                    placeholder="Briefly describe this resource..."
                    value={newResource.description}
                    onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all h-24 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all active:scale-[0.98] mt-4"
                >
                  Create Resource Card
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
