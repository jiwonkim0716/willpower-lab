import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Zap, 
  Ghost as GhostIcon, 
  Music, 
  Dog, 
  GraduationCap, 
  Skull, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  Activity,
  Terminal,
  Volume2,
  Calendar,
  Clock,
  ListTodo,
  TrendingUp,
  X,
  History,
  LayoutGrid,
  ArrowRightLeft,
  Award
} from 'lucide-react';
import { 
  analyzeWillpower, 
  WillpowerResponse, 
  generateSchedule, 
  analyzePerformance, 
  ScheduleItem, 
  PerformanceResponse,
  analyzeDayComparison,
  ComparisonResponse
} from './services/gemini';

type Persona = 'professor' | 'puppy' | 'fact_bomber';
type MainTab = 'planning' | 'excuse_lab';

interface DailyLog {
  date: string;
  planned: ScheduleItem[];
  actual: string[];
  score: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('planning');
  const [input, setInput] = useState('');
  const [tasksInput, setTasksInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WillpowerResponse | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [actualTasks, setActualTasks] = useState<string[]>([]);
  const [architectAdvice, setArchitectAdvice] = useState('');
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [activePersona, setActivePersona] = useState<Persona>('professor');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [history, setHistory] = useState<WillpowerResponse[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const savedLogs = localStorage.getItem('willpower_logs');
    if (savedLogs) setDailyLogs(JSON.parse(savedLogs));
  }, []);

  useEffect(() => {
    localStorage.setItem('willpower_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const data = await analyzeWillpower(input, false);
      setResult(data);
      setHistory(prev => [data, ...prev].slice(0, 20));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    if (!tasksInput.trim()) return;
    setLoading(true);
    try {
      const data = await generateSchedule(tasksInput);
      setSchedule(data.schedule);
      setActualTasks(new Array(data.schedule.length).fill(''));
      setArchitectAdvice(data.architect_advice);
      setComparison(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleActualTaskChange = (index: number, value: string) => {
    const newActual = [...actualTasks];
    newActual[index] = value;
    setActualTasks(newActual);
  };

  const handleAnalyzeComparison = async () => {
    setLoading(true);
    try {
      const data = await analyzeDayComparison(schedule, actualTasks);
      setComparison(data);
      
      const newLog: DailyLog = {
        date: new Date().toLocaleDateString(),
        planned: schedule,
        actual: actualTasks,
        score: data.score
      };
      setDailyLogs(prev => [newLog, ...prev].slice(0, 7)); // Keep last 7 days
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyAverage = () => {
    if (dailyLogs.length === 0) return 0;
    const sum = dailyLogs.reduce((acc, log) => acc + log.score, 0);
    return Math.round(sum / dailyLogs.length);
  };

  const getMechanismStats = () => {
    const stats: Record<string, number> = {};
    history.forEach(item => {
      const mech = item.diagnosis.defense_mechanism;
      stats[mech] = (stats[mech] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  };

  return (
    <div className="min-h-screen bg-lab-bg text-lab-text selection:bg-lab-accent selection:text-lab-bg overflow-hidden relative">
      {/* Scanline Effect */}
      <div className="scanline pointer-events-none" />
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(42,43,47,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(42,43,47,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-20">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-lab-border pb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-lab-accent shadow-[0_0_15px_rgba(0,255,157,0.8)] animate-pulse" />
              <span className="text-[10px] font-mono tracking-[0.3em] text-lab-accent uppercase font-bold">System Status: Optimal</span>
            </div>
            <h1 className="text-6xl font-extrabold tracking-tighter text-white flex items-baseline gap-2">
              의지 <span className="text-lab-accent font-serif italic font-light text-5xl">Architect</span>
            </h1>
            <p className="text-lab-muted font-mono text-[9px] mt-3 tracking-[0.2em] uppercase opacity-60">Willpower Research Laboratory // Graduate Student Rehabilitation Unit // v2.0.4</p>
          </div>
          <div className="mt-6 md:mt-0 flex flex-col items-end gap-4">
            <button 
              onClick={() => setShowReport(!showReport)}
              className="px-6 py-2.5 bg-lab-accent/5 border border-lab-accent/30 text-lab-accent rounded-full text-[10px] font-mono uppercase tracking-widest hover:bg-lab-accent hover:text-lab-bg transition-all duration-500 flex items-center gap-3 group"
            >
              <Activity className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
              의지력 리포트
            </button>
            <div className="text-right font-mono">
              <div className="text-3xl font-light text-white/90 tabular-nums tracking-tighter">
                {currentTime.toLocaleTimeString('ko-KR', { hour12: false })}
              </div>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Ghost Overlay for high levels */}
          <AnimatePresence>
            {result && result.ghost_warning.ghost_level >= 7 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: (result.ghost_warning.ghost_level - 6) * 0.15 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 pointer-events-none flex items-center justify-center"
              >
                <div className="text-lab-warning/20 text-[20vw] font-black select-none rotate-12">
                  FAILURE
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Report Modal */}
          <AnimatePresence>
            {showReport && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
                onClick={() => setShowReport(false)}
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="glass p-10 rounded-[3rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto relative shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-lab-accent/10 rounded-2xl border border-lab-accent/20">
                        <Activity className="w-6 h-6 text-lab-accent" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-lab-accent font-bold block mb-1">Analytics Module</span>
                        <h2 className="text-3xl font-black text-white tracking-tighter">주간 의지력 리포트</h2>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowReport(false)} 
                      className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lab-muted hover:text-white hover:bg-white/10 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/5 text-center group hover:border-lab-accent/30 transition-colors">
                        <h3 className="text-[10px] font-mono text-lab-muted uppercase mb-4 tracking-[0.2em] font-bold">주간 평균 점수</h3>
                        <div className="text-5xl font-black text-lab-accent font-mono text-glow">{getWeeklyAverage()}</div>
                      </div>
                      <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/5 text-center group hover:border-white/20 transition-colors">
                        <h3 className="text-[10px] font-mono text-lab-muted uppercase mb-4 tracking-[0.2em] font-bold">기록된 일수</h3>
                        <div className="text-5xl font-black text-white font-mono">{dailyLogs.length}<span className="text-xl ml-1 text-lab-muted">d</span></div>
                      </div>
                      <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/5 text-center group hover:border-lab-accent/30 transition-colors">
                        <h3 className="text-[10px] font-mono text-lab-muted uppercase mb-4 tracking-[0.2em] font-bold">최고 점수</h3>
                        <div className="text-5xl font-black text-lab-accent font-mono text-glow">
                          {dailyLogs.length > 0 ? Math.max(...dailyLogs.map(l => l.score)) : 0}
                        </div>
                      </div>
                    </div>

                    {dailyLogs.length > 0 ? (
                      <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lab-accent/20 to-transparent" />
                        <h3 className="text-xs font-mono text-lab-muted uppercase mb-10 tracking-[0.3em] font-bold flex items-center gap-3">
                          <TrendingUp className="w-4 h-4 text-lab-accent" />
                          최근 7일 성과 추이
                        </h3>
                        <div className="flex items-end justify-between h-48 gap-4">
                          {dailyLogs.slice().reverse().map((log, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                              <div className="w-full bg-white/5 rounded-2xl relative flex items-end overflow-hidden h-full">
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${log.score}%` }}
                                  transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                  className="w-full bg-gradient-to-t from-lab-accent/40 to-lab-accent rounded-2xl relative"
                                >
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-lab-accent font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    {log.score}
                                  </div>
                                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                              </div>
                              <span className="text-[10px] font-mono text-lab-muted font-bold tracking-tighter">{log.date.split('.')[2]}일</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-24 bg-black/20 rounded-[2.5rem] border border-dashed border-white/10 text-lab-muted font-mono text-xs uppercase tracking-[0.2em] italic">
                        분석 데이터가 충분하지 않습니다.
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.05] rounded-2xl backdrop-blur-2xl">
              <button 
                onClick={() => setActiveTab('planning')}
                className={`flex-1 py-3 px-4 rounded-xl font-mono text-[9px] uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'planning' ? 'bg-lab-accent text-lab-bg font-bold shadow-[0_0_20px_rgba(0,255,157,0.3)]' : 'text-lab-muted hover:text-white hover:bg-white/5'}`}
              >
                일정 설계
              </button>
              <button 
                onClick={() => setActiveTab('excuse_lab')}
                className={`flex-1 py-3 px-4 rounded-xl font-mono text-[9px] uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'excuse_lab' ? 'bg-lab-accent text-lab-bg font-bold shadow-[0_0_20px_rgba(0,255,157,0.3)]' : 'text-lab-muted hover:text-white hover:bg-white/5'}`}
              >
                변명 연구소
              </button>
            </div>

            {activeTab === 'planning' ? (
              <section className="glass p-8 rounded-[2rem] relative overflow-hidden shadow-2xl group">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-lab-accent/5 rounded-full blur-3xl group-hover:bg-lab-accent/10 transition-colors duration-700" />
                <div className="space-y-8 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-lab-accent/10 rounded-2xl border border-lab-accent/20">
                        <ListTodo className="w-5 h-5 text-lab-accent" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-lab-accent uppercase tracking-[0.3em] font-bold block mb-1">Input Module</span>
                        <h2 className="text-xl font-bold text-white tracking-tight">오늘의 할 일</h2>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-lab-muted bg-white/5 px-2 py-1 rounded border border-white/10 uppercase tracking-widest">10:00 - 17:00</span>
                  </div>
                  
                  <div className="relative">
                    <textarea 
                      value={tasksInput}
                      onChange={(e) => setTasksInput(e.target.value)}
                      placeholder="오늘 수행해야 할 연구 및 과업들을 나열하세요. (예: 논문 리뷰 2편, 실험 데이터 정리, 운동...)"
                      className="w-full h-56 bg-black/40 border border-lab-border rounded-2xl p-6 text-sm focus:ring-2 focus:ring-lab-accent/30 focus:border-lab-accent/50 transition-all outline-none resize-none placeholder:text-lab-muted/30 font-medium leading-relaxed"
                    />
                    <div className="absolute bottom-4 right-4 text-[9px] font-mono text-lab-muted/50 uppercase tracking-widest">
                      Ready for analysis
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerateSchedule}
                    disabled={loading || !tasksInput.trim()}
                    className="w-full py-5 bg-white text-lab-bg font-black rounded-2xl flex items-center justify-center gap-4 hover:bg-lab-accent hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-2xl disabled:opacity-20 disabled:grayscale group"
                  >
                    {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover:fill-current" />}
                    <span className="text-xs uppercase tracking-[0.2em]">최적 일정 설계 프로세스 시작</span>
                  </button>
                </div>
              </section>
            ) : (
              <section className="glass p-8 rounded-[2rem] relative overflow-hidden shadow-2xl group">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-lab-warning/5 rounded-full blur-3xl group-hover:bg-lab-warning/10 transition-colors duration-700" />
                <div className="space-y-8 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-lab-warning/10 rounded-2xl border border-lab-warning/20">
                        <Brain className="w-5 h-5 text-lab-warning" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-lab-warning uppercase tracking-[0.3em] font-bold block mb-1">Diagnosis Module</span>
                        <h2 className="text-xl font-bold text-white tracking-tight">변명 분석기</h2>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="예: 너무 피곤하고 주제가 너무 어려워서 손이 안 가요..."
                      className="w-full h-48 bg-black/40 border border-lab-border rounded-2xl p-6 text-sm focus:ring-2 focus:ring-lab-warning/30 focus:border-lab-warning/50 transition-all outline-none resize-none placeholder:text-lab-muted/30 font-medium leading-relaxed"
                    />
                  </div>

                  <button 
                    onClick={handleSubmit}
                    disabled={loading || !input.trim()}
                    className="w-full py-5 bg-lab-warning text-lab-bg font-black rounded-2xl flex items-center justify-center gap-4 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-2xl disabled:opacity-20 group"
                  >
                    {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Skull className="w-5 h-5" />}
                    <span className="text-xs uppercase tracking-[0.2em]">심리 방어기제 해체</span>
                  </button>
                </div>
              </section>
            )}

            {/* System Monitor Style Info */}
            <section className="bg-lab-card border border-lab-border p-6 rounded-xl font-mono text-[10px] space-y-2 text-lab-muted">
              <div className="flex justify-between border-b border-lab-border/50 pb-1">
                <span>DOPAMINE_LEVEL</span>
                <span className="text-lab-accent">STABLE</span>
              </div>
              <div className="flex justify-between border-b border-lab-border/50 pb-1">
                <span>PROCRASTINATION_RISK</span>
                <span className={result && result.ghost_warning.ghost_level > 7 ? "text-lab-warning" : "text-lab-accent"}>
                  {result ? (result.ghost_warning.ghost_level * 10) + "%" : "대기 중"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>COGNITIVE_LOAD</span>
                <span>42.8%</span>
              </div>
            </section>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {activeTab === 'excuse_lab' ? (
                result ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-8"
                  >
                    {/* Diagnosis Section */}
                    <section className="glass rounded-[2.5rem] overflow-hidden shadow-2xl">
                      <div className="bg-white/[0.03] px-10 py-6 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-lab-accent/10 rounded-xl">
                            <Brain className="w-5 h-5 text-lab-accent" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-lab-accent block mb-0.5">Diagnostic Module</span>
                            <h3 className="text-xl font-bold text-white tracking-tight">Psychological Analysis</h3>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-lab-muted bg-white/5 px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest">REF_ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                      </div>
                      <div className="p-10">
                        <div className="mb-8">
                          <span className="text-[10px] font-mono text-lab-accent uppercase block mb-3 tracking-[0.4em] font-bold">Detected Defense Mechanism</span>
                          <h3 className="text-4xl font-black text-white font-serif italic tracking-tight">{result.diagnosis.defense_mechanism}</h3>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-6 top-0 bottom-0 w-1.5 bg-gradient-to-b from-lab-accent to-transparent rounded-full" />
                          <p className="text-lg leading-relaxed text-lab-text/90 pl-2 font-medium italic">
                            "{result.diagnosis.analysis}"
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Persona Response Section */}
                    <section className="glass rounded-[2.5rem] overflow-hidden shadow-2xl">
                      <div className="flex border-b border-white/5 bg-black/20 p-1">
                        {(['professor', 'puppy', 'fact_bomber'] as Persona[]).map((p) => (
                          <button
                            key={p}
                            onClick={() => setActivePersona(p)}
                            className={`flex-1 py-6 flex flex-col items-center gap-3 transition-all duration-500 rounded-2xl ${activePersona === p ? 'bg-white/5 text-lab-accent shadow-inner' : 'hover:bg-white/[0.02] opacity-30 hover:opacity-100'}`}
                          >
                            {p === 'professor' && <GraduationCap className={`w-6 h-6 ${activePersona === p ? 'text-lab-accent' : 'text-lab-muted'}`} />}
                            {p === 'puppy' && <Dog className={`w-6 h-6 ${activePersona === p ? 'text-lab-accent' : 'text-lab-muted'}`} />}
                            {p === 'fact_bomber' && <Zap className={`w-6 h-6 ${activePersona === p ? 'text-lab-accent' : 'text-lab-muted'}`} />}
                            <span className={`text-[9px] font-mono uppercase tracking-[0.3em] font-bold ${activePersona === p ? 'text-lab-accent' : 'text-lab-muted'}`}>
                              {p === 'professor' ? 'Professor' : p === 'puppy' ? 'Puppy' : 'Fact Bomber'}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="p-12 min-h-[200px] flex items-center justify-center text-center bg-[radial-gradient(circle_at_center,rgba(0,255,157,0.05)_0%,transparent_70%)]">
                        <motion.p 
                          key={activePersona}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-2xl font-serif italic text-white leading-snug font-medium"
                        >
                          "{result.persona_response[activePersona]}"
                        </motion.p>
                      </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Reward Section */}
                      <section className="glass rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                          <Music className="w-20 h-20" />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-lab-accent/10 rounded-xl">
                            <Volume2 className="w-5 h-5 text-lab-accent" />
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-lab-muted">Dopamine Reward</span>
                        </div>
                        <div className="space-y-5">
                          <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-[10px] break-all leading-relaxed">
                            <span className="text-lab-muted opacity-50">PROMPT_GEN: </span>
                            <span className="text-lab-accent">{result.dopamine_reward.music_prompt}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-lab-muted uppercase tracking-widest">Vibe: {result.dopamine_reward.vibe}</span>
                            <div className="flex gap-1.5">
                              {[...Array(5)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-2.5 h-5 rounded-sm transition-all duration-500 ${i < result.dopamine_reward.intensity ? 'bg-lab-accent shadow-[0_0_10px_rgba(0,255,157,0.5)]' : 'bg-white/5'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Ghost Section */}
                      <section className="glass rounded-3xl p-8 relative overflow-hidden group border-lab-warning/20">
                        <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                          <GhostIcon className="w-32 h-32 text-lab-warning" />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-lab-warning/10 rounded-xl">
                            <Skull className="w-5 h-5 text-lab-warning" />
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-lab-warning">Future Projection</span>
                        </div>
                        <div className="space-y-5">
                          <p className="text-base font-bold text-lab-warning/90 leading-snug italic">
                            "{result.ghost_warning.future_scenario}"
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono text-lab-muted uppercase tracking-widest">Ghost Level</span>
                              <span className="text-[10px] font-mono text-lab-warning font-bold">{result.ghost_warning.ghost_level * 10}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${result.ghost_warning.ghost_level * 10}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-lab-warning shadow-[0_0_15px_rgba(255,204,0,0.5)]"
                              />
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-lab-muted border-2 border-dashed border-lab-border rounded-2xl p-12 text-center">
                    <Terminal className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-mono text-sm uppercase tracking-widest mb-2">데이터 대기 중</p>
                    <p className="text-xs max-w-xs">현재의 심리 상태나 미루고 싶은 이유를 입력하여 분석을 시작하세요.</p>
                  </div>
                )
              ) : (
                <motion.div 
                  key="planning"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  {schedule.length > 0 ? (
                    <>
                      <section className="glass rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
                        <div className="bg-white/[0.03] px-10 py-6 flex items-center justify-between border-b border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-lab-accent/10 rounded-xl">
                              <LayoutGrid className="w-5 h-5 text-lab-accent" />
                            </div>
                            <div>
                              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-lab-accent block mb-0.5">Timeline Module</span>
                              <h3 className="text-xl font-bold text-white tracking-tight">Visual Timetable</h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 px-4 py-2 bg-black/40 rounded-full border border-white/5">
                            <ArrowRightLeft className="w-3 h-3 text-lab-muted" />
                            <span className="text-[9px] font-mono text-lab-muted uppercase tracking-widest">Plan vs Reality</span>
                          </div>
                        </div>
                        
                        <div className="p-0">
                          <div className="grid grid-cols-12 border-b border-white/5 bg-white/[0.02] font-mono text-[9px] uppercase tracking-[0.2em] text-lab-muted font-bold">
                            <div className="col-span-2 p-4 border-r border-white/5 text-center">Time</div>
                            <div className="col-span-5 p-4 border-r border-white/5">Planned Task</div>
                            <div className="col-span-5 p-4">Actual Activity</div>
                          </div>
                          
                          <div className="divide-y divide-white/5">
                            {schedule.map((item, i) => (
                              <motion.div 
                                key={i} 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="grid grid-cols-12 group hover:bg-white/[0.03] transition-all duration-500"
                              >
                                <div className="col-span-2 p-6 border-r border-white/5 flex flex-col items-center justify-center gap-2">
                                  <span className="text-xs font-mono text-lab-accent font-bold tracking-tighter">{item.time.split('-')[0]}</span>
                                  <div className="w-[1px] h-6 bg-gradient-to-b from-lab-accent/40 to-transparent" />
                                  <span className="text-[10px] font-mono text-lab-muted/60">{item.time.split('-')[1]}</span>
                                </div>
                                <div className="col-span-5 p-6 border-r border-white/5 relative">
                                  <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 group-hover:w-1.5 ${item.priority === 'high' ? 'bg-lab-warning shadow-[0_0_15px_rgba(255,204,0,0.3)]' : 'bg-lab-accent/20'}`} />
                                  <h4 className="text-base font-bold text-white mb-2 tracking-tight group-hover:text-lab-accent transition-colors">{item.task}</h4>
                                  <p className="text-[10px] text-lab-muted italic leading-relaxed opacity-70">
                                    <span className="text-lab-accent/50 mr-1">◆</span> {item.focus_tip}
                                  </p>
                                </div>
                                <div className="col-span-5 p-3 flex items-center">
                                  <input 
                                    type="text"
                                    value={actualTasks[i] || ''}
                                    onChange={(e) => handleActualTaskChange(i, e.target.value)}
                                    placeholder="실제 수행 내용 입력..."
                                    className="w-full h-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono text-lab-accent placeholder:text-lab-muted/20 focus:ring-1 focus:ring-lab-accent/30 focus:border-lab-accent/30 transition-all outline-none"
                                  />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </section>

                      <section className="glass p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
                          <Award className="w-32 h-32 text-lab-accent" />
                        </div>
                        <div className="flex items-center justify-between mb-10">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-lab-accent/10 rounded-2xl border border-lab-accent/20">
                              <Award className="w-6 h-6 text-lab-accent" />
                            </div>
                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-lab-accent font-bold block mb-1">Evaluation Module</span>
                              <h3 className="text-xl font-bold text-white tracking-tight">Daily Performance Analysis</h3>
                            </div>
                          </div>
                          <button 
                            onClick={handleAnalyzeComparison}
                            disabled={loading}
                            className="px-8 py-4 bg-white text-lab-bg font-black rounded-2xl flex items-center gap-4 hover:bg-lab-accent hover:scale-[1.05] transition-all duration-500 shadow-2xl disabled:opacity-20 group"
                          >
                            {loading ? <Activity className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />}
                            <span className="text-xs uppercase tracking-widest">성과 비교 분석</span>
                          </button>
                        </div>

                        {comparison ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                          >
                            <div className="flex items-center gap-10 bg-white/[0.02] p-8 rounded-3xl border border-white/5">
                              <div className="relative">
                                <div className="w-32 h-32 rounded-full border-[6px] border-lab-accent/20 flex items-center justify-center text-5xl font-black text-lab-accent font-mono text-glow">
                                  {comparison.score}
                                </div>
                                <div className="absolute inset-0 rounded-full border-[6px] border-lab-accent border-t-transparent animate-spin-slow opacity-40" />
                              </div>
                              <div className="flex-1">
                                <span className="text-[10px] font-mono text-lab-muted uppercase tracking-[0.3em] font-bold block mb-3">Architect's Verdict</span>
                                <p className="text-xl text-white leading-snug font-serif italic font-medium">"{comparison.analysis}"</p>
                              </div>
                            </div>
                            <div className="bg-lab-accent/5 p-8 rounded-3xl border border-lab-accent/10 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-lab-accent/30" />
                              <span className="text-[10px] font-mono text-lab-accent uppercase tracking-[0.3em] font-bold block mb-3">Optimization Strategy</span>
                              <p className="text-base text-lab-text/90 leading-relaxed font-medium">{comparison.advice}</p>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="text-center py-12 bg-black/20 rounded-3xl border border-dashed border-white/5 text-lab-muted font-mono text-[10px] uppercase tracking-[0.2em] italic">
                            일과를 마친 후 실제 수행 내용을 입력하고 분석을 실행하십시오.
                          </div>
                        )}
                      </section>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-lab-muted border-2 border-dashed border-lab-border rounded-2xl p-12 text-center">
                      <Calendar className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-mono text-sm uppercase tracking-widest mb-2">일정 설계 대기 중</p>
                      <p className="text-xs max-w-xs">왼쪽 창에 오늘 할 일들을 입력하고 버튼을 눌러 AI 최적 일정을 생성하세요.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-lab-border flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-lab-muted uppercase tracking-widest">
          <div className="flex gap-6">
            <span>&copy; 2026 의지 연구소 (Willpower Research Lab)</span>
            <span>보안: 암호화됨</span>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-lab-accent" />
              코어: Gemini-3-Flash
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-lab-accent" />
              음악: Lyria-3
            </span>
          </div>
        </footer>
      </div>

      {/* Floating Ghost Visual (Decorative) */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: result.ghost_warning.ghost_level * 0.08, 
            scale: 0.5 + (result.ghost_warning.ghost_level * 0.15),
            filter: `grayscale(${100 - (result.ghost_warning.ghost_level * 10)}%)`,
            y: [0, -40, 0],
            x: [0, 20, 0]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            opacity: { duration: 1 },
            scale: { duration: 1 }
          }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
        >
          <GhostIcon className="w-96 h-96 text-lab-warning blur-2xl" />
        </motion.div>
      )}
    </div>
  );
}
