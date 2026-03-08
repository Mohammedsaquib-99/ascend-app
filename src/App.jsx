import confetti from "canvas-confetti";
import completeSound from "./assets/sounds/complete.mp3";
// Boss defeat sound using Web Audio API (no extra file needed)
import { useState, useEffect, useRef } from "react";

// ─── THEME SYSTEM ─────────────────────────────────────────────────────────────
const THEMES = {
  purple: { a: "#8B5CF6", b: "#06B6D4", name: "Void" },
  fire:   { a: "#EF4444", b: "#F59E0B", name: "Inferno" },
  nature: { a: "#10B981", b: "#06B6D4", name: "Forest" },
  gold:   { a: "#F59E0B", b: "#FBBF24", name: "Gold" },
  pink:   { a: "#EC4899", b: "#8B5CF6", name: "Sakura" },
};
function getTheme(id) { return THEMES[id] || THEMES.purple; }

// ─── WEEKLY BOSS ROSTER ────────────────────────────────────────────────────────
const BOSS_ROSTER = [
  { name: "THE PROCRASTINATOR", icon: "🦹", color: "#EF4444", trait: "Drains will — defeats 2 hard habits first!" },
  { name: "THE DISTRACTOR",     icon: "🌀", color: "#8B5CF6", trait: "Scrambles focus — no screen time allowed!" },
  { name: "THE SLOTH",          icon: "🦥", color: "#10B981", trait: "Slows momentum — body habits do 2× damage!" },
  { name: "THE PERFECTIONIST",  icon: "👁️",  color: "#06B6D4", trait: "Blocks progress — all habits must be flawless!" },
  { name: "THE DOUBTER",        icon: "😈", color: "#F59E0B", trait: "Weakens resolve — mind habits strike hardest!" },
  { name: "SHADOW SELF",        icon: "🕷️", color: "#EC4899", trait: "Mirrors your weakness — discipline is the key!" },
  { name: "THE VOID",           icon: "🌑", color: "#6366F1", trait: "Consumes all — every habit counts double!" },
];
function getWeeklyBoss() {
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return BOSS_ROSTER[week % BOSS_ROSTER.length];
}

const HABITS_DATA = [
  { id: 1, name: "Morning Meditation", category: "Mind", difficulty: "Medium", xp: 50, icon: "🧘", streak: 0, completed: false, time: "06:00 AM" },
  { id: 2, name: "Cold Shower", category: "Body", difficulty: "Hard", xp: 80, icon: "🌊", streak: 0, completed: false, time: "06:30 AM" },
  { id: 3, name: "Read 20 Pages", category: "Mind", difficulty: "Easy", xp: 30, icon: "📖", streak: 0, completed: false, time: "07:00 AM" },
  { id: 4, name: "Workout 45 min", category: "Body", difficulty: "Hard", xp: 100, icon: "⚡", streak: 0, completed: false, time: "08:00 AM" },
  { id: 5, name: "Journal Entry", category: "Discipline", difficulty: "Easy", xp: 25, icon: "✍️", streak: 0, completed: false, time: "09:00 PM" },
];

const SKILL_TREES = [
  { name: "Mind", icon: "🧠", level: 14, max: 20, color: "#8B5CF6", glow: "#7C3AED" },
  { name: "Body", icon: "⚡", level: 9, max: 20, color: "#06B6D4", glow: "#0891B2" },
  { name: "Wealth", icon: "💎", level: 6, max: 20, color: "#F59E0B", glow: "#D97706" },
  { name: "Discipline", icon: "🔥", level: 18, max: 20, color: "#EF4444", glow: "#DC2626" },
  { name: "Social", icon: "🌟", level: 4, max: 20, color: "#10B981", glow: "#059669" },
];

const ACHIEVEMENTS = [
  { name: "Iron Will", rarity: "legendary", icon: "👑", desc: "30-day streak" },
  { name: "Mind Bender", rarity: "epic", icon: "🔮", desc: "100 meditations" },
  { name: "First Blood", rarity: "rare", icon: "⚔️", desc: "First habit done" },
];

const RARITY_COLORS = {
  legendary: { bg: "linear-gradient(135deg, #F59E0B, #EF4444)", border: "#F59E0B", glow: "#F59E0B88" },
  epic: { bg: "linear-gradient(135deg, #8B5CF6, #EC4899)", border: "#8B5CF6", glow: "#8B5CF688" },
  rare: { bg: "linear-gradient(135deg, #06B6D4, #3B82F6)", border: "#06B6D4", glow: "#06B6D488" },
};


const LEVEL_TITLES = [
  { min: 1,  title: "Rookie",      color: "#10B981", icon: "🌱" },
  { min: 3,  title: "Apprentice",  color: "#06B6D4", icon: "⚡" },
  { min: 5,  title: "Warrior",     color: "#8B5CF6", icon: "🛡️" },
  { min: 8,  title: "Knight",      color: "#8B5CF6", icon: "⚔️" },
  { min: 10, title: "Champion",    color: "#F59E0B", icon: "🏆" },
  { min: 13, title: "Elite",       color: "#F59E0B", icon: "💎" },
  { min: 15, title: "Legend",      color: "#EF4444", icon: "👑" },
  { min: 18, title: "Mythic",      color: "#EF4444", icon: "🔱" },
  { min: 20, title: "Ascendant",   color: "#fff",    icon: "✨" },
];
function getLevelTitle(lvl) {
  return [...LEVEL_TITLES].reverse().find(t => lvl >= t.min) || LEVEL_TITLES[0];
}

const DAILY_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "The pain of discipline is far less than the pain of regret.", author: "Anonymous" },
  { text: "Your future self is watching you right now through memories.", author: "Aubrey de Grey" },
  { text: "Champions aren't made in gyms. They're made from vision.", author: "Muhammad Ali" },
  { text: "Do something today that your future self will thank you for.", author: "Anonymous" },
  { text: "It's not about perfect. It's about effort.", author: "Jillian Michaels" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "The body achieves what the mind believes.", author: "Anonymous" },
  { text: "Push yourself because no one else is going to do it for you.", author: "Anonymous" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Dream big. Start small. Act now.", author: "Robin Sharma" },
  { text: "Don't wish for it. Work for it.", author: "Anonymous" },
  { text: "Your only limit is your mind.", author: "Anonymous" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Anonymous" },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Anonymous" },
  { text: "Great things never come from comfort zones.", author: "Anonymous" },
  { text: "Work hard in silence. Let success make the noise.", author: "Frank Ocean" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only bad workout is the one that didn't happen.", author: "Anonymous" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Consistency is what transforms average into excellence.", author: "Anonymous" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "You are one decision away from a totally different life.", author: "Anonymous" },
  { text: "Every expert was once a beginner.", author: "Helen Hayes" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "Be the person your future self needs you to be today.", author: "Anonymous" },
];
function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

const XP_PER_LEVEL = 500;
const BASE_XP = 0;

// Returns how many days since the user first joined
function getDayNumber() {
  const start = localStorage.getItem("ascend-start-date");
  if (!start) return 1;
  const diff = Date.now() - new Date(start).getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
}

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      color: ["#8B5CF6", "#06B6D4", "#EF4444", "#F59E0B"][Math.floor(Math.random() * 4)],
    }));
    let frame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

function XPParticle({ x, y, amount, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1200); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 9999,
      animation: "xpFloat 1.2s ease-out forwards",
      fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: 18,
      color: "#F59E0B", textShadow: "0 0 20px #F59E0B, 0 0 40px #F59E0B",
      userSelect: "none",
    }}>+{amount} XP</div>
  );
}

export default function App() {
  const [screen, setScreen] = useState(() => {
    const savedName = localStorage.getItem("ascend-username");
    return savedName ? "home" : "welcome";
  });

  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem("ascend-data");
    return saved ? JSON.parse(saved).habits : HABITS_DATA;
  });

  const [hasEnteredName, setHasEnteredName] = useState(() => {
    return !!localStorage.getItem("ascend-username");
  });

  const [username, setUsername] = useState(() => {
    return localStorage.getItem("ascend-username") || "";
  });

  useEffect(() => {
    localStorage.setItem("ascend-username", username);
  }, [username]);

  const playCompleteSound = () => {
    const audio = new Audio(completeSound);
    audio.volume = 0.7;
    audio.play().catch(() => {});
  };

  const playBossDefeatSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = (freq, start, duration, type = "sine") => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = type;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      // Victory fanfare: ascending triumphant tones
      playTone(261, 0,    0.15, "square");
      playTone(329, 0.15, 0.15, "square");
      playTone(392, 0.3,  0.15, "square");
      playTone(523, 0.45, 0.4,  "square");
      playTone(659, 0.6,  0.6,  "sine");
    } catch(e) {}
  };

  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem("ascend-data");
    return saved ? JSON.parse(saved).xp : BASE_XP;
  });

  const [particles, setParticles] = useState([]);
  const [completedFlash, setCompletedFlash] = useState(null);
  const [showBoss, setShowBoss] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", category: "Mind", difficulty: "Medium", icon: "⭐" });
  const [activeTab, setActiveTab] = useState("today");
  const [focusActive, setFocusActive] = useState(false);
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [xpLog, setXpLog] = useState(() => {
    const saved = localStorage.getItem("ascend-xplog");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("ascend-xplog", JSON.stringify(xpLog.slice(-50)));
  }, [xpLog]);
  const [pendingNoteHabit, setPendingNoteHabit] = useState(null);
  const [noteText, setNoteText] = useState("");

  const [editingHabit, setEditingHabit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [onboardStep, setOnboardStep] = useState(() => {
    return localStorage.getItem("ascend-onboarded") ? null : 1;
  });
  const [dailyChallenge, setDailyChallenge] = useState(() => {
    const saved = localStorage.getItem("ascend-challenge");
    const today = new Date().toDateString();
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) return parsed;
    }
    // Generate daily challenge
    const challenges = [
      { name: "Meditate 10 min", icon: "🧘", category: "Mind", xp: 100 },
      { name: "Run 1km", icon: "🏃", category: "Body", xp: 120 },
      { name: "Read 30 Pages", icon: "📖", category: "Mind", xp: 100 },
      { name: "No Sugar Today", icon: "🚫", category: "Discipline", xp: 150 },
      { name: "Cold Shower 3 min", icon: "🌊", category: "Body", xp: 120 },
      { name: "Write 500 Words", icon: "✍️", category: "Discipline", xp: 100 },
      { name: "10 min Stretch", icon: "🤸", category: "Body", xp: 80 },
      { name: "Save ₹100 Today", icon: "💰", category: "Wealth", xp: 100 },
      { name: "Call a Mentor", icon: "📞", category: "Social", xp: 100 },
      { name: "Wake Before 6AM", icon: "⏰", category: "Discipline", xp: 150 },
      { name: "No Screen 1 Hour", icon: "📵", category: "Discipline", xp: 120 },
      { name: "Drink 3L Water", icon: "💧", category: "Body", xp: 80 },
      { name: "Learn Something New", icon: "🧠", category: "Mind", xp: 100 },
      { name: "100 Pushups", icon: "💪", category: "Body", xp: 150 },
    ];
    const dayIdx = Math.floor(Date.now() / 86400000) % challenges.length;
    const challenge = { ...challenges[dayIdx], date: today, completed: false, id: "daily-challenge" };
    localStorage.setItem("ascend-challenge", JSON.stringify(challenge));
    return challenge;
  });
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem("ascend-profile");
    return saved ? JSON.parse(saved) : { age: "", gender: "", avatar: "⚔️", theme: "purple", soundEnabled: true, reminderEnabled: false, reminderTime: "08:00" };
  });

  useEffect(() => {
    const data = { habits, xp };
    localStorage.setItem("ascend-data", JSON.stringify(data));
  }, [habits, xp]);

  useEffect(() => {
    localStorage.setItem("ascend-profile", JSON.stringify(userProfile));
  }, [userProfile]);

  // ── NOTIFICATION SCHEDULER ──────────────────────────────────────
  useEffect(() => {
    if (!userProfile.reminderEnabled) return;
    const scheduleNotif = () => {
      const [hh, mm] = (userProfile.reminderTime || "08:00").split(":").map(Number);
      const now = new Date();
      const target = new Date(); target.setHours(hh, mm, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const ms = target - now;
      return setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification("⚔️ Ascend — Daily Mission Awaits!", {
            body: `${username || "Champion"}, your habits are waiting. Don't break the streak! 🔥`,
            icon: "/vite.svg",
          });
        }
      }, ms);
    };
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
    const t = scheduleNotif();
    return () => clearTimeout(t);
  }, [userProfile.reminderEnabled, userProfile.reminderTime, username]);

  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const levelXp = xp % XP_PER_LEVEL;
  const levelProgress = (levelXp / XP_PER_LEVEL) * 100;
  const theme = getTheme(userProfile.theme);
  const TC = theme.a;  // primary theme color
  const TC2 = theme.b; // secondary theme color
  const completedToday = habits.filter(h => h.completed).length;
  const totalToday = habits.length;
  const hardHabits = habits.filter(h => h.difficulty === "Hard");
  const hardDone = hardHabits.filter(h => h.completed).length;
  const bossHp = hardHabits.length === 0 ? 100 : Math.max(0, Math.round(100 - (hardDone / hardHabits.length) * 100));

  useEffect(() => {
    if (!focusRunning) return;
    const t = setInterval(() => setFocusTime(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [focusRunning]);

  useEffect(() => {
    if (xp !== 0 && xp % XP_PER_LEVEL === 0) {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    }
  }, [xp]);

  const [streak, setStreak] = useState(() => {
    return Number(localStorage.getItem("ascend-streak")) || 0;
  });

  useEffect(() => {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem("ascend-last-reset");
    if (lastReset !== today) {
      // Check if ALL habits were completed BEFORE resetting
      const saved = localStorage.getItem("ascend-data");
      const savedHabits = saved ? JSON.parse(saved).habits : [];
      const allCompleted = savedHabits.length > 0 && savedHabits.every(h => h.completed);
      if (allCompleted) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem("ascend-streak", String(newStreak));
      } else if (lastReset) {
        // Missed a day — reset streak to 0
        setStreak(0);
        localStorage.setItem("ascend-streak", "0");
      }
      // Now reset habits for the new day
      setHabits(prev => prev.map(h => ({ ...h, completed: false })));
      localStorage.setItem("ascend-last-reset", today);
    }
  }, []);

  const prevLevel = useRef(level);
  useEffect(() => {
    if (level > prevLevel.current) { setShowLevelUp(true); setTimeout(() => setShowLevelUp(false), 3000); }
    prevLevel.current = level;
  }, [level]);

  const completeHabit = (id, e) => {
    const habit = habits.find(h => h.id === id);
    if (habit.completed) return;
    const xpGain = habit.xp * (habit.difficulty === "Hard" ? 1.5 : habit.difficulty === "Medium" ? 1.2 : 1);
    const gain = Math.floor(xpGain);

    const updatedHabits = habits.map(h => h.id === id ? { ...h, completed: true, streak: h.streak + 1 } : h);
    const allDone = updatedHabits.every(h => h.completed);

    setHabits(updatedHabits);
    setXp(prev => {
      const newXp = prev + gain;
      if (allDone) {
        const nextLevelXp = (Math.floor(newXp / XP_PER_LEVEL) + 1) * XP_PER_LEVEL;
        return nextLevelXp;
      }
      return newXp;
    });

    // Log XP gain
    setXpLog(prev => [{
      id: Date.now(), habitName: habit.name, habitIcon: habit.icon,
      xp: gain, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
    }, ...prev].slice(0, 50));

    setCompletedFlash(id);
    playCompleteSound();
    const rect = e.currentTarget.getBoundingClientRect();
    const pid = Date.now();
    setParticles(prev => [...prev, { id: pid, x: rect.left + rect.width / 2, y: rect.top, amount: allDone ? "ALL DONE! +LEVEL" : gain }]);
    setTimeout(() => setCompletedFlash(null), 600);

    // Trigger note modal after short delay
    setTimeout(() => { setPendingNoteHabit({ id, name: habit.name, icon: habit.icon }); setNoteText(""); }, 700);

    if (allDone) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ["#F59E0B", "#8B5CF6", "#10B981", "#06B6D4"] });
      setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 } }), 500);
    }
  };

  const saveNote = () => {
    if (noteText.trim() && pendingNoteHabit) {
      setHabits(prev => prev.map(h => h.id === pendingNoteHabit.id ? { ...h, lastNote: noteText.trim(), lastNoteDate: new Date().toLocaleDateString() } : h));
      setXpLog(prev => prev.map((e, i) => i === 0 ? { ...e, note: noteText.trim() } : e));
    }
    setPendingNoteHabit(null);
    setNoteText("");
  };

  const openEditHabit = (habit) => {
    setEditingHabit({ ...habit });
    setShowEditModal(true);
  };

  const saveEditHabit = () => {
    const xpMap = { Easy: 25, Medium: 50, Hard: 80 };
    setHabits(prev => prev.map(h =>
      h.id === editingHabit.id
        ? { ...editingHabit, xp: xpMap[editingHabit.difficulty] }
        : h
    ));
    setShowEditModal(false);
    setEditingHabit(null);
  };

  const deleteHabit = (id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setShowEditModal(false);
    setEditingHabit(null);
  };

  const completeDailyChallenge = (e) => {
    if (dailyChallenge.completed) return;
    const gain = dailyChallenge.xp * 2; // 2x XP
    setXp(prev => prev + gain);
    const updated = { ...dailyChallenge, completed: true };
    setDailyChallenge(updated);
    localStorage.setItem("ascend-challenge", JSON.stringify(updated));
    playCompleteSound();
    const rect = e.currentTarget.getBoundingClientRect();
    const pid = Date.now();
    setParticles(prev => [...prev, { id: pid, x: rect.left + rect.width / 2, y: rect.top, amount: `+${gain} XP` }]);
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 }, colors: ["#F59E0B", "#EF4444", "#fff"] });
  };

  const addHabits = (newHabits) => {
    setHabits(prev => [...prev, ...newHabits]);
  };

  useEffect(() => {
    const handler = (e) => addHabits(e.detail);
    window.addEventListener("ascend-add-habits", handler);
    return () => window.removeEventListener("ascend-add-habits", handler);
  }, []);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const dayNumber = getDayNumber();

  const screens = {
    home: <HomeScreen
      habits={habits} xp={xp} level={level} levelProgress={levelProgress}
      completedToday={completedToday} totalToday={totalToday}
      completeHabit={completeHabit} completedFlash={completedFlash}
      activeTab={activeTab} setActiveTab={setActiveTab}
      setShowBoss={setShowBoss} setShowAddHabit={setShowAddHabit}
      username={username} streak={streak} bossHp={bossHp}
      dayNumber={dayNumber} onLongPressHabit={openEditHabit}
      userProfile={userProfile} dailyChallenge={dailyChallenge}
      completeDailyChallenge={completeDailyChallenge}
      levelTitle={getLevelTitle(level)} TC={TC} TC2={TC2}
    />,
    skills: <SkillScreen habits={habits} streak={streak} xp={xp} />,
    analytics: <AnalyticsScreen habits={habits} xp={xp} level={level} levelProgress={levelProgress} streak={streak} TC={TC} TC2={TC2} />,
    focus: <FocusScreen focusTime={focusTime} focusRunning={focusRunning} setFocusRunning={setFocusRunning} setFocusTime={setFocusTime} formatTime={formatTime} focusActive={focusActive} setFocusActive={setFocusActive} />,
    profile: <ProfileScreen xp={xp} level={level} levelProgress={levelProgress} habits={habits} streak={streak} username={username} userProfile={userProfile} onOpenSettings={() => setShowSettings(true)} xpLog={xpLog} TC={TC} TC2={TC2} />,
  };

  if (!hasEnteredName) {
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 20% 50%, #0d0520 0%, #030712 50%, #020a18 100%)", display: "flex", justifyContent: "center" }}>
      <div style={{
        width: "100%", maxWidth: 430,
        height: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #030712, #0f0720)",
        color: "#fff", gap: 0, position: "relative", overflow: "hidden"
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } @keyframes glow { 0%,100% { box-shadow: 0 0 20px #8B5CF644; } 50% { box-shadow: 0 0 40px #8B5CF6aa; } } @keyframes orb { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } } input::placeholder { color: #ffffff30; }`}</style>
        <ParticleCanvas />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 360, padding: "0 28px" }}>
          {/* Logo */}
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, margin: "0 auto 20px", boxShadow: "0 0 40px #8B5CF655, 0 0 80px #8B5CF622", animation: "glow 3s ease-in-out infinite" }}>⚔️</div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 32, fontWeight: 900, background: "linear-gradient(135deg, #fff 40%, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 4 }}>ASCEND</div>
            <div style={{ fontSize: 11, color: "#ffffff35", letterSpacing: 4, fontFamily: "'Orbitron', monospace", marginTop: 6 }}>LEVEL UP YOUR LIFE</div>
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" }}>
            {["⚡ XP System", "💀 Boss Battles", "🔥 Streaks", "📊 Analytics"].map(f => (
              <div key={f} style={{ padding: "5px 12px", borderRadius: 20, background: "#ffffff08", border: "1px solid #ffffff15", fontSize: 11, color: "#ffffff60", fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>{f}</div>
            ))}
          </div>

          {/* Name input */}
          <div style={{ width: "100%", marginBottom: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#8B5CF6", fontFamily: "'Orbitron', monospace", marginBottom: 8, textAlign: "center" }}>ENTER YOUR NAME, WARRIOR</div>
            <input
              type="text"
              placeholder="Your name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && username.trim()) {
                  localStorage.setItem("ascend-username", username);
                  if (!localStorage.getItem("ascend-start-date")) localStorage.setItem("ascend-start-date", new Date().toISOString());
                  setHasEnteredName(true);
                }
              }}
              style={{
                width: "100%", padding: "16px 20px", borderRadius: 16,
                border: "1px solid #8B5CF655", background: "#ffffff0a",
                color: "#fff", fontSize: 18, fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 600, outline: "none", textAlign: "center",
                letterSpacing: 1,
              }}
            />
          </div>

          <button
            onClick={() => {
              if (!username.trim()) return;
              localStorage.setItem("ascend-username", username);
              if (!localStorage.getItem("ascend-start-date")) localStorage.setItem("ascend-start-date", new Date().toISOString());
              setHasEnteredName(true);
            }}
            style={{
              width: "100%", padding: "16px 0", borderRadius: 16, border: "none",
              background: username.trim() ? "linear-gradient(135deg, #8B5CF6, #06B6D4)" : "#ffffff15",
              color: username.trim() ? "#fff" : "#ffffff30",
              fontFamily: "'Orbitron', monospace", fontSize: 13,
              fontWeight: 700, letterSpacing: 3, cursor: username.trim() ? "pointer" : "default",
              boxShadow: username.trim() ? "0 0 30px #8B5CF655" : "none",
              transition: "all 0.3s", marginBottom: 20,
            }}
          >
            BEGIN ASCENT →
          </button>

          <div style={{ fontSize: 11, color: "#ffffff20", textAlign: "center", lineHeight: 1.6, fontFamily: "'Rajdhani', sans-serif" }}>
            Build habits. Earn XP. Defeat procrastination.<br/>Your hero journey starts today.
          </div>
        </div>
      </div>
      </div>
    );
  }

  // ── ONBOARDING ──────────────────────────────────────────────────────────────
  if (onboardStep !== null) {
    return <OnboardingScreen username={username} onFinish={(habits) => {
      if (habits.length > 0) setHabits(prev => { const names = prev.map(h => h.name); return [...prev, ...habits.filter(h => !names.includes(h.name))]; });
      localStorage.setItem("ascend-onboarded", "true");
      setOnboardStep(null);
    }} />;
  }

  return (
    <div style={{
      fontFamily: "'Rajdhani', 'Orbitron', sans-serif",
      background: "radial-gradient(ellipse at 20% 50%, #0d0520 0%, #030712 50%, #020a18 100%)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "stretch",
      justifyContent: "center",
      color: "#fff",
      position: "relative",
    }}>
      {/* Desktop background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, #8B5CF608 0%, transparent 70%)", top: "10%", left: "5%", animation: "orb 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #06B6D406 0%, transparent 70%)", bottom: "15%", right: "8%", animation: "orb 12s ease-in-out infinite reverse" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, #EF444404 0%, transparent 70%)", top: "50%", right: "20%", animation: "orb 10s ease-in-out infinite" }} />
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #8B5CF644; border-radius: 2px; }
        @keyframes xpFloat { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-80px) scale(1.4); opacity: 0; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px #8B5CF644; } 50% { box-shadow: 0 0 40px #8B5CF6aa; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes bossShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        @keyframes levelUp { 0% { transform: scale(0.5) translateY(50px); opacity:0; } 50% { transform: scale(1.1) translateY(0); opacity:1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes orb { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-15px) scale(1.05); } }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes flash { 0%,100% { opacity:0; } 50% { opacity:1; } }
        @keyframes borderGlow { 0%,100% { border-color: #8B5CF6; box-shadow: 0 0 10px #8B5CF644; } 50% { border-color: #06B6D4; box-shadow: 0 0 30px #06B6D488; } }
        @keyframes modalIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes screenIn { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes screenOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-30px); opacity: 0; } }
        .screen-enter { animation: screenIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
        .habit-card { animation: slideUp 0.4s ease both; }
        .habit-card:nth-child(1) { animation-delay: 0.05s; }
        .habit-card:nth-child(2) { animation-delay: 0.1s; }
        .habit-card:nth-child(3) { animation-delay: 0.15s; }
        .habit-card:nth-child(4) { animation-delay: 0.2s; }
        .habit-card:nth-child(5) { animation-delay: 0.25s; }
        .nav-btn:hover { opacity: 0.8; }
        .complete-btn:hover { filter: brightness(1.2); transform: scale(1.05); }
        .complete-btn:active { transform: scale(0.95); }
        input::placeholder { color: #ffffff30; }
      `}</style>

      {/* Phone frame - centered app container */}
      <div style={{
        width: "100%", maxWidth: 430, minHeight: "100vh",
        background: "#030712", position: "relative", overflow: "hidden",
        zIndex: 1, flexShrink: 0,
        boxShadow: `0 0 0 1px ${TC}18, 0 0 80px ${TC}22, 0 0 120px ${TC2}10`,
      }}>

      {/* Ambient background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${TC}18 0%, transparent 70%)`, animation: "orb 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: -50, right: -100, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${TC2}18 0%, transparent 70%)`, animation: "orb 6s ease-in-out infinite 3s" }} />
        <div style={{ position: "absolute", top: "40%", right: -80, width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, ${TC}10 0%, transparent 70%)` }} />
        <ParticleCanvas />
      </div>

      {particles.map(p => <XPParticle key={p.id} {...p} onDone={() => setParticles(prev => prev.filter(x => x.id !== p.id))} />)}

      {showLevelUp && (
        <div style={{ position: "fixed", top: "25%", left: "50%", transform: "translateX(-50%)", zIndex: 9998, textAlign: "center", animation: "levelUp 0.6s ease", width: 280 }}>
          <div style={{ background: "linear-gradient(135deg, #1a0f2e, #0f1a1a)", border: "1px solid #F59E0B66", borderRadius: 24, padding: "28px 32px", boxShadow: `0 0 80px #F59E0B55, 0 0 30px ${TC}44` }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>🏆</div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, letterSpacing: 4, color: "#F59E0B", marginBottom: 6 }}>ALL MISSIONS COMPLETE</div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 900, background: "linear-gradient(135deg, #F59E0B, #EF4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>LEVEL UP!</div>
            <div style={{ fontSize: 16, color: "#ffffff80", marginTop: 4, fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>You reached <span style={{ color: "#F59E0B", fontFamily: "'Orbitron', monospace" }}>Level {level}</span></div>
            <div style={{ marginTop: 14, height: 3, background: "linear-gradient(90deg, #F59E0B, #8B5CF6, #06B6D4)", borderRadius: 2 }} />
          </div>
        </div>
      )}

      {showBoss && <BossModal bossHp={bossHp} onClose={() => setShowBoss(false)} habits={habits} playBossDefeatSound={playBossDefeatSound} />}

      {showAddHabit && (
        <AddHabitModal
          newHabit={newHabit} setNewHabit={setNewHabit}
          onClose={() => setShowAddHabit(false)}
          onSave={() => {
            const xpMap = { Easy: 25, Medium: 50, Hard: 80 };
            setHabits(prev => [...prev, { id: Date.now(), ...newHabit, xp: xpMap[newHabit.difficulty], streak: 0, completed: false, time: "Any time" }]);
            setShowAddHabit(false);
            setNewHabit({ name: "", category: "Mind", difficulty: "Medium", icon: "⭐" });
          }}
        />
      )}

      {/* Edit/Delete Modal */}
      {showEditModal && editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          setHabit={setEditingHabit}
          onClose={() => { setShowEditModal(false); setEditingHabit(null); }}
          onSave={saveEditHabit}
          onDelete={() => deleteHabit(editingHabit.id)}
        />
      )}

      {showSettings && (
        <SettingsModal
          username={username} setUsername={setUsername}
          userProfile={userProfile} setUserProfile={setUserProfile}
          onClose={() => setShowSettings(false)}
          onReset={() => { if (confirm("Reset ALL data? This cannot be undone.")) { localStorage.clear(); window.location.reload(); } }}
          onLogout={() => {
            localStorage.removeItem("ascend-username");
            localStorage.removeItem("ascend-start-date");
            setUsername("");
            setHasEnteredName(false);
            setShowSettings(false);
            setScreen("welcome");
          }}
        />
      )}

      <div key={screen} className="screen-enter" style={{ position: "relative", zIndex: 1, paddingBottom: 80 }}>
        {screens[screen]}
      </div>

      {/* ── COMPLETION NOTE MODAL ── */}
      {pendingNoteHabit && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 430, background: "linear-gradient(135deg, #0f0f1a, #1a1a2e)", border: "1px solid #10B98144", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", animation: "modalIn 0.3s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 40, height: 4, background: "#ffffff20", borderRadius: 2, margin: "0 auto 16px" }} />
              <div style={{ fontSize: 32, marginBottom: 8 }}>{pendingNoteHabit.icon}</div>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#10B981" }}>✅ MISSION COMPLETE</div>
              <div style={{ fontSize: 14, color: "#ffffff60", marginTop: 4, fontFamily: "'Rajdhani', sans-serif" }}>{pendingNoteHabit.name}</div>
            </div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff35", fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>ADD A NOTE <span style={{ color: "#ffffff20" }}>(optional)</span></div>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="How did it go? Any thoughts..."
              autoFocus
              rows={3}
              style={{ width: "100%", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 14, padding: "12px 14px", color: "#fff", fontSize: 14, fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, outline: "none", resize: "none", marginBottom: 14, lineHeight: 1.5 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setPendingNoteHabit(null); setNoteText(""); }}
                style={{ flex: 1, padding: 14, borderRadius: 14, border: "1px solid #ffffff15", background: "transparent", color: "#ffffff40", fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>SKIP</button>
              <button onClick={saveNote}
                style={{ flex: 2, padding: 14, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #10B981, #06B6D4)", color: "#fff", fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: "pointer" }}>SAVE NOTE</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav screen={screen} setScreen={setScreen} TC={TC} />
      </div> {/* end phone frame */}
    </div>
  );
}

// ─── ONBOARDING SCREEN ────────────────────────────────────────────────────────
function OnboardingScreen({ username, onFinish }) {
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedTemplates, setSelectedTemplates] = useState([]);

  const GOALS = [
    { id: "fitness",    label: "Get Fit",          icon: "💪", color: "#EF4444" },
    { id: "mindset",    label: "Sharpen Mind",     icon: "🧠", color: "#8B5CF6" },
    { id: "wealth",     label: "Build Wealth",     icon: "💎", color: "#F59E0B" },
    { id: "discipline", label: "Get Disciplined",  icon: "🔥", color: "#06B6D4" },
    { id: "social",     label: "Grow Socially",    icon: "🌟", color: "#10B981" },
    { id: "allround",   label: "All-Round Hero",   icon: "⚔️", color: "#8B5CF6" },
  ];
  const PACKS = { fitness: ["Gym Pack"], mindset: ["Scholar Pack"], wealth: ["Wealth Builder"], discipline: ["Morning Warrior"], social: ["Social Legend"], allround: ["Morning Warrior","Gym Pack"] };
  const STEP_TEMPLATES = [
    { id: "morning", name: "Morning Warrior", icon: "🌅", color: "#F59E0B", desc: "Rise early, meditate, cold shower" },
    { id: "gym",     name: "Gym Pack",        icon: "💪", color: "#EF4444", desc: "Workout, water, protein, sleep" },
    { id: "scholar", name: "Scholar Pack",    icon: "📚", color: "#8B5CF6", desc: "Read, study, avoid distractions" },
    { id: "wealth",  name: "Wealth Builder",  icon: "💎", color: "#10B981", desc: "Track money, save, learn skills" },
  ];
  const HABIT_PACKS = {
    "Morning Warrior": [
      { name: "Wake up at 6AM", icon: "⏰", category: "Discipline", difficulty: "Hard" },
      { name: "Morning Meditation", icon: "🧘", category: "Mind", difficulty: "Medium" },
      { name: "Cold Shower", icon: "🌊", category: "Body", difficulty: "Hard" },
      { name: "Journaling", icon: "✍️", category: "Discipline", difficulty: "Easy" },
    ],
    "Gym Pack": [
      { name: "Workout 45 min", icon: "⚡", category: "Body", difficulty: "Hard" },
      { name: "Drink 3L Water", icon: "💧", category: "Body", difficulty: "Easy" },
      { name: "Protein Intake", icon: "🥩", category: "Body", difficulty: "Medium" },
      { name: "Sleep 8 Hours", icon: "😴", category: "Body", difficulty: "Medium" },
    ],
    "Scholar Pack": [
      { name: "Read 20 Pages", icon: "📖", category: "Mind", difficulty: "Easy" },
      { name: "Study 2 Hours", icon: "🧠", category: "Mind", difficulty: "Hard" },
      { name: "No Social Media", icon: "🚫", category: "Discipline", difficulty: "Hard" },
    ],
    "Wealth Builder": [
      { name: "Track Expenses", icon: "💰", category: "Wealth", difficulty: "Easy" },
      { name: "Read Finance News", icon: "📈", category: "Wealth", difficulty: "Easy" },
      { name: "Save 10% Income", icon: "🏦", category: "Wealth", difficulty: "Medium" },
    ],
  };

  const finishOnboarding = () => {
    const xpMap = { Easy: 25, Medium: 50, Hard: 80 };
    const toAdd = selectedTemplates.flatMap(t =>
      (HABIT_PACKS[t] || []).map(h => ({ id: Date.now() + Math.random(), ...h, xp: xpMap[h.difficulty], streak: 0, completed: false, time: "Any time" }))
    );
    onFinish(toAdd);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, #030712, #0f0720)", color: "#fff", maxWidth: 430, margin: "0 auto", position: "relative", overflow: "hidden", fontFamily: "'Rajdhani', 'Orbitron', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } @keyframes glow { 0%,100% { box-shadow: 0 0 20px #8B5CF644; } 50% { box-shadow: 0 0 40px #8B5CF6aa; } } @keyframes screenIn { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      <ParticleCanvas />
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", padding: "50px 24px 30px", overflowY: "auto" }}>
        {/* Progress bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {[1,2,3].map(s => <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? "#8B5CF6" : "#ffffff15", transition: "background 0.4s" }} />)}
        </div>

        {/* Step 1 — Goal */}
        {step === 1 && (
          <div style={{ animation: "screenIn 0.3s ease" }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#8B5CF6", fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>STEP 1 OF 3</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, lineHeight: 1.2 }}>What's your<br/>main goal?</div>
            <div style={{ fontSize: 13, color: "#ffffff40", marginBottom: 24 }}>We'll personalize your journey</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {GOALS.map(g => (
                <button key={g.id} onClick={() => setSelectedGoal(g.id)}
                  style={{ padding: "18px 12px", borderRadius: 16, border: `2px solid ${selectedGoal === g.id ? g.color : "#ffffff12"}`, background: selectedGoal === g.id ? `${g.color}18` : "#ffffff06", cursor: "pointer", textAlign: "center", transition: "all 0.2s", boxShadow: selectedGoal === g.id ? `0 0 20px ${g.color}44` : "none" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{g.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: selectedGoal === g.id ? g.color : "#ffffff80", fontFamily: "'Rajdhani', sans-serif" }}>{g.label}</div>
                </button>
              ))}
            </div>
            <button onClick={() => { if (selectedGoal) { setSelectedTemplates(PACKS[selectedGoal] || []); setStep(2); } }} disabled={!selectedGoal}
              style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", background: selectedGoal ? "linear-gradient(135deg, #8B5CF6, #06B6D4)" : "#ffffff12", color: selectedGoal ? "#fff" : "#ffffff30", fontFamily: "'Orbitron', monospace", fontSize: 12, fontWeight: 700, letterSpacing: 2, cursor: selectedGoal ? "pointer" : "default", transition: "all 0.3s" }}>
              CONTINUE →
            </button>
          </div>
        )}

        {/* Step 2 — Templates */}
        {step === 2 && (
          <div style={{ animation: "screenIn 0.3s ease" }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#8B5CF6", fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>STEP 2 OF 3</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, lineHeight: 1.2 }}>Pick your<br/>habit packs</div>
            <div style={{ fontSize: 13, color: "#ffffff40", marginBottom: 20 }}>Select all that apply</div>
            {STEP_TEMPLATES.map(t => {
              const sel = selectedTemplates.includes(t.name);
              return (
                <div key={t.id} onClick={() => setSelectedTemplates(prev => sel ? prev.filter(x => x !== t.name) : [...prev, t.name])}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, border: `2px solid ${sel ? t.color : "#ffffff10"}`, background: sel ? `${t.color}12` : "#ffffff06", marginBottom: 10, cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: `${t.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{t.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: sel ? t.color : "#fff" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "#ffffff40", marginTop: 2 }}>{t.desc}</div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${sel ? t.color : "#ffffff20"}`, background: sel ? t.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, color: "#fff" }}>{sel ? "✓" : ""}</div>
                </div>
              );
            })}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: 14, borderRadius: 14, border: "1px solid #ffffff15", background: "transparent", color: "#ffffff50", fontFamily: "'Orbitron', monospace", fontSize: 11, cursor: "pointer" }}>← BACK</button>
              <button onClick={() => setStep(3)} style={{ flex: 2, padding: 14, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", color: "#fff", fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: "pointer" }}>CONTINUE →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Ready */}
        {step === 3 && (
          <div style={{ animation: "screenIn 0.3s ease", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#8B5CF6", fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>STEP 3 OF 3</div>
            <div style={{ fontSize: 64, marginBottom: 16, animation: "glow 2s ease-in-out infinite" }}>⚔️</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 10, background: "linear-gradient(135deg, #fff, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>You're Ready,<br/>{username}!</div>
            <div style={{ fontSize: 14, color: "#ffffff50", marginBottom: 28, lineHeight: 1.7 }}>Your journey begins today.<br/>Complete habits. Earn XP. Level up.<br/><span style={{ color: "#F59E0B" }}>Every day counts.</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", marginBottom: 24 }}>
              {selectedTemplates.length > 0
                ? selectedTemplates.map(t => <div key={t} style={{ padding: "10px 16px", borderRadius: 12, background: "#ffffff08", border: "1px solid #10B98133", fontSize: 13, color: "#ffffff70", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#10B981" }}>✓</span> {t} added to missions</div>)
                : <div style={{ fontSize: 12, color: "#ffffff30" }}>Start fresh — add your own habits</div>}
            </div>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: 14, borderRadius: 14, border: "1px solid #ffffff15", background: "transparent", color: "#ffffff50", fontFamily: "'Orbitron', monospace", fontSize: 11, cursor: "pointer" }}>← BACK</button>
              <button onClick={finishOnboarding} style={{ flex: 2, padding: 16, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", color: "#fff", fontFamily: "'Orbitron', monospace", fontSize: 13, fontWeight: 700, letterSpacing: 2, cursor: "pointer", boxShadow: "0 0 30px #8B5CF655" }}>BEGIN ASCENT 🚀</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({ habits, xp, level, levelProgress, completedToday, totalToday, completeHabit, completedFlash, activeTab, setActiveTab, setShowBoss, setShowAddHabit, username, streak, bossHp, dayNumber, onLongPressHabit, userProfile, dailyChallenge, completeDailyChallenge, levelTitle, TC = "#8B5CF6", TC2 = "#06B6D4" }) {
  const dailyXpEarned = habits.filter(h => h.completed).reduce((s, h) => s + h.xp, 0);
  const quote = getDailyQuote();

  return (
    <div style={{ padding: "0 0 20px" }}>
      {/* ── HEADER ── */}
      <div style={{ position: "relative", padding: "52px 20px 20px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${TC}08 1px, transparent 1px), linear-gradient(90deg, ${TC}08 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
        <div style={{ position: "absolute", top: 0, left: 20, right: 20, height: 1, background: `linear-gradient(90deg, transparent, ${TC}55, transparent)` }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: TC, fontFamily: "'Orbitron', monospace", marginBottom: 6, opacity: 0.8 }}>
              ASCEND // DAY {dayNumber}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, background: `linear-gradient(135deg, #fff 50%, ${TC}aa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Good Morning,<br />{username || "Champion"}.
            </div>
            {levelTitle && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "4px 12px", borderRadius: 20, background: `${levelTitle.color}18`, border: `1px solid ${levelTitle.color}44` }}>
                <span style={{ fontSize: 12 }}>{levelTitle.icon}</span>
                <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 9, fontWeight: 700, color: levelTitle.color, letterSpacing: 2 }}>{levelTitle.title}</span>
              </div>
            )}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              marginTop: 10, padding: "4px 10px",
              background: streak > 0 ? "#EF444418" : "#ffffff08",
              border: `1px solid ${streak > 0 ? "#EF444440" : "#ffffff15"}`,
              borderRadius: 20, fontSize: 12, color: streak > 0 ? "#EF4444" : "#ffffff40"
            }}>
              🔥 <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>{streak}</span>
              <span style={{ opacity: 0.6 }}>day streak</span>
            </div>
          </div>

          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: `linear-gradient(135deg, ${TC}, ${TC2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: `2px solid ${TC}44`, animation: "glow 3s ease-in-out infinite", overflow: "hidden" }}>
              {userProfile?.avatarImg
                ? <img src={userProfile.avatarImg} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (userProfile?.avatar || "⚔️")}
            </div>
            <div style={{ position: "absolute", bottom: -3, right: -3, background: "linear-gradient(135deg, #F59E0B, #EF4444)", color: "#000", fontSize: 9, fontWeight: 900, fontFamily: "'Orbitron', monospace", borderRadius: 6, padding: "2px 5px", letterSpacing: 1 }}>LV{level}</div>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 10, letterSpacing: 2, color: "#ffffff40", fontFamily: "'Orbitron', monospace" }}>LEVEL {level} — {Math.floor(levelProgress)}% COMPLETE</span>
            <span style={{ fontSize: 10, color: "#F59E0B", fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>{xp} XP</span>
          </div>
          <div style={{ height: 5, background: "#ffffff08", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${levelProgress}%`, background: `linear-gradient(90deg, ${TC}, ${TC2}, ${TC})`, backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite", borderRadius: 3, transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)" }} />
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[
            { label: "TODAY'S XP", value: `+${dailyXpEarned}`, color: "#F59E0B", bg: "#F59E0B" },
            { label: "STREAK",     value: `${streak}🔥`,         color: "#EF4444", bg: "#EF4444" },
            { label: "MISSIONS",  value: `${completedToday}/${totalToday}`, color: TC2, bg: TC2 },
          ].map(s => (
            <div key={s.label} style={{ background: `${s.bg}0c`, border: `1px solid ${s.bg}25`, borderRadius: 14, padding: "12px 8px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${s.bg}88, transparent)` }} />
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 15, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 8, letterSpacing: 2, color: "#ffffff35", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DAILY QUOTE ── */}
      <div style={{ padding: "0 20px", marginBottom: 14 }}>
        <div style={{ background: "linear-gradient(135deg, #1a0f2e, #0f1a2e)", border: `1px solid ${TC}30`, borderRadius: 20, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
          {/* Glow orbs */}
          <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle, ${TC}22 0%, transparent 70%)` }} />
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${TC2}15 0%, transparent 70%)` }} />
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${TC}, ${TC2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✦</div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 9, fontWeight: 700, letterSpacing: 3, color: TC }}>DAILY WISDOM</div>
            <div style={{ marginLeft: "auto", fontSize: 9, color: "#ffffff20", fontFamily: "'Orbitron', monospace" }}>{new Date().toLocaleDateString([], { month: "short", day: "numeric" }).toUpperCase()}</div>
          </div>
          {/* Quote */}
          <div style={{ fontSize: 15, color: "#ffffffee", lineHeight: 1.65, fontStyle: "italic", fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, marginBottom: 12, position: "relative" }}>
            <span style={{ fontSize: 28, color: `${TC}44`, fontFamily: "Georgia, serif", lineHeight: 0, verticalAlign: -8, marginRight: 4 }}>"</span>
            {quote.text}
            <span style={{ fontSize: 28, color: `${TC}44`, fontFamily: "Georgia, serif", lineHeight: 0, verticalAlign: -8, marginLeft: 2 }}>"</span>
          </div>
          {/* Author + divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #8B5CF633, transparent)" }} />
            <div style={{ fontSize: 11, color: "#ffffff45", fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: 1 }}>— {quote.author}</div>
          </div>
        </div>
      </div>

      {/* ── DAILY CHALLENGE ── */}
      {dailyChallenge && (
        <div style={{ padding: "0 20px", marginBottom: 16 }}>
          <div style={{ background: "linear-gradient(135deg, #F59E0B0a, #EF44440a)", border: `1px solid ${dailyChallenge.completed ? "#10B98133" : "#F59E0B33"}`, borderRadius: 18, padding: "14px 16px", position: "relative", overflow: "hidden", transition: "all 0.4s" }}>
            <div style={{ position: "absolute", top: -25, right: -25, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${dailyChallenge.completed ? "#10B98122" : "#F59E0B22"} 0%, transparent 70%)` }} />
            <div style={{ fontSize: 9, letterSpacing: 3, color: dailyChallenge.completed ? "#10B981" : "#F59E0B", fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>⚡ DAILY CHALLENGE · 2× XP</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: dailyChallenge.completed ? "#10B98120" : "#F59E0B20", border: `1px solid ${dailyChallenge.completed ? "#10B98140" : "#F59E0B40"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                {dailyChallenge.completed ? "✅" : dailyChallenge.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: dailyChallenge.completed ? "#10B981" : "#fff", textDecoration: dailyChallenge.completed ? "line-through" : "none" }}>{dailyChallenge.name}</div>
                <div style={{ fontSize: 11, color: "#ffffff40", marginTop: 2 }}>{dailyChallenge.category} · <span style={{ color: "#F59E0B", fontWeight: 700 }}>+{dailyChallenge.xp * 2} XP</span></div>
              </div>
              {!dailyChallenge.completed && (
                <button onClick={completeDailyChallenge}
                  style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #F59E0B, #EF4444)", color: "#fff", fontFamily: "'Orbitron', monospace", fontSize: 9, fontWeight: 700, letterSpacing: 1, cursor: "pointer", flexShrink: 0, boxShadow: "0 0 14px #F59E0B44" }}>
                  DONE
                </button>
              )}
              {dailyChallenge.completed && (
                <div style={{ padding: "6px 12px", borderRadius: 10, background: "#10B98120", border: "1px solid #10B98140", color: "#10B981", fontFamily: "'Orbitron', monospace", fontSize: 9, fontWeight: 700 }}>CLAIMED</div>
              )}
            </div>
          </div>
        </div>
      )}
      <div style={{ padding: "0 20px", marginBottom: 16 }}>
        <div onClick={() => setShowBoss(true)} style={{ background: "linear-gradient(135deg, #EF444412, #F59E0B0a)", border: "1px solid #EF444430", borderRadius: 18, padding: "14px 16px", cursor: "pointer", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 90, height: 90, borderRadius: "50%", background: "radial-gradient(circle, #EF444428 0%, transparent 70%)", animation: "pulse 2s ease-in-out infinite" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 32, animation: "bossShake 3s ease-in-out infinite", flexShrink: 0 }}>🦹</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: "#EF4444", fontFamily: "'Orbitron', monospace", marginBottom: 3 }}>⚔️ WEEKLY BOSS</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>The Procrastinator</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 8, color: "#EF4444aa", fontFamily: "'Orbitron', monospace", letterSpacing: 2 }}>HP</div>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 20, fontWeight: 900, color: "#EF4444", lineHeight: 1 }}>{bossHp}%</div>
                </div>
              </div>
              <div style={{ marginTop: 8, height: 5, background: "#ffffff0d", borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${100 - bossHp}%`, background: "linear-gradient(90deg, #EF4444, #F59E0B)", borderRadius: 3, boxShadow: "0 0 8px #EF444466" }} />
              </div>
              <div style={{ fontSize: 10, color: "#ffffff40", marginTop: 5 }}>Complete 5 Hard habits to defeat</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ padding: "0 20px", marginBottom: 14 }}>
        <div style={{ display: "flex", background: "#ffffff07", borderRadius: 12, padding: 3, border: "1px solid #ffffff08" }}>
          {["today", "weekly", "templates"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "7px 0", borderRadius: 9, border: "none", background: activeTab === tab ? "#8B5CF6" : "transparent", color: activeTab === tab ? "#fff" : "#ffffff35", fontSize: 10, letterSpacing: 2.5, fontFamily: "'Orbitron', monospace", fontWeight: 700, cursor: "pointer", transition: "all 0.25s", textTransform: "uppercase", boxShadow: activeTab === tab ? "0 2px 12px #8B5CF666" : "none" }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── TODAY TAB ── */}
      {activeTab === "today" && (
        <>
          <div style={{ padding: "0 20px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 9, letterSpacing: 3, color: "#ffffff30", fontFamily: "'Orbitron', monospace" }}>
              {completedToday}/{totalToday} MISSIONS COMPLETE
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: totalToday }).map((_, i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i < completedToday ? "#8B5CF6" : "#ffffff15", transition: "background 0.3s", boxShadow: i < completedToday ? "0 0 6px #8B5CF6" : "none" }} />
              ))}
            </div>
          </div>

          {habits.length === 0 ? (
            /* ── EMPTY STATE ── */
            <div style={{ padding: "0 20px" }}>
              <div style={{ textAlign: "center", padding: "40px 20px", background: "#ffffff05", border: "1px dashed #ffffff15", borderRadius: 20 }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>⚔️</div>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, color: "#8B5CF6", marginBottom: 8 }}>NO MISSIONS YET</div>
                <div style={{ fontSize: 13, color: "#ffffff35", lineHeight: 1.7, marginBottom: 24 }}>Your quest board is empty, warrior.<br/>Add your first habit to begin earning XP.</div>
                <button onClick={() => setShowAddHabit(true)}
                  style={{ padding: "12px 28px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", color: "#fff", fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: "pointer", boxShadow: "0 0 20px #8B5CF644" }}>
                  + ADD FIRST MISSION
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: "0 20px" }}>
              {/* Group by time slot */}
              {(() => {
                const getSlot = (h) => {
                  const t = h.time || "";
                  const hour = parseInt(t.split(":")[0]) || 0;
                  const isPM = t.includes("PM");
                  const h24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
                  if (h24 < 12) return "morning";
                  if (h24 < 17) return "afternoon";
                  return "evening";
                };
                const slots = [
                  { key: "morning",   label: "🌅 MORNING",   color: "#F59E0B" },
                  { key: "afternoon", label: "☀️ AFTERNOON", color: "#06B6D4" },
                  { key: "evening",   label: "🌙 EVENING",   color: "#8B5CF6" },
                ];
                const grouped = slots.map(s => ({ ...s, habits: habits.filter(h => getSlot(h) === s.key) })).filter(s => s.habits.length > 0);
                return grouped.map(slot => (
                  <div key={slot.key}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, marginTop: 4 }}>
                      <div style={{ fontSize: 9, letterSpacing: 3, color: slot.color, fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>{slot.label}</div>
                      <div style={{ flex: 1, height: 1, background: `${slot.color}22` }} />
                      <div style={{ fontSize: 9, color: "#ffffff25", fontFamily: "'Orbitron', monospace" }}>{slot.habits.filter(h => h.completed).length}/{slot.habits.length}</div>
                    </div>
                    {slot.habits.map((habit, i) => (
                      <HabitCard key={habit.id} habit={habit} onComplete={completeHabit} flash={completedFlash === habit.id} delay={i * 50} onLongPress={() => onLongPressHabit(habit)} />
                    ))}
                  </div>
                ));
              })()}
              <div style={{ fontSize: 9, color: "#ffffff20", letterSpacing: 1, textAlign: "center", fontFamily: "'Orbitron', monospace", margin: "10px 0 6px" }}>HOLD ANY HABIT TO EDIT OR DELETE</div>
              <button onClick={() => setShowAddHabit(true)}
                style={{ width: "100%", padding: "14px 0", border: "1px dashed #8B5CF633", borderRadius: 16, background: "transparent", color: "#8B5CF6", fontSize: 12, fontFamily: "'Orbitron', monospace", fontWeight: 700, letterSpacing: 3, cursor: "pointer", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#8B5CF610"; e.currentTarget.style.borderColor = "#8B5CF666"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#8B5CF633"; }}>
                + ADD MISSION
              </button>
            </div>
          )}
        </>
      )}

      {/* ── WEEKLY TAB ── */}
      {activeTab === "weekly" && (
        <div style={{ padding: "0 20px" }}>
          {/* Week grid */}
          {(() => {
            const today = new Date();
            const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
            const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
            const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
            const weekXp = habits.reduce((sum, h) => sum + (h.completed ? h.xp : 0), 0) * 7;
            // Simulated past days — today is real
            const dayData = dayNames.map((d, i) => ({
              day: d,
              isToday: i === todayIdx,
              isFuture: i > todayIdx,
              rate: i === todayIdx ? completionRate : i < todayIdx ? Math.floor(Math.random() * 60 + 40) : 0,
            }));
            return (
              <>
                {/* 7-day grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 20 }}>
                  {dayData.map((d, i) => {
                    const color = d.rate >= 80 ? "#10B981" : d.rate >= 50 ? "#F59E0B" : d.rate > 0 ? "#EF4444" : "#ffffff10";
                    return (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <div style={{ fontSize: 8, color: d.isToday ? "#8B5CF6" : "#ffffff30", fontFamily: "'Orbitron', monospace", letterSpacing: 1 }}>{d.day}</div>
                        <div style={{ width: "100%", aspectRatio: "1", borderRadius: 10, background: d.isFuture ? "#ffffff06" : `${color}${d.isToday ? "ff" : "aa"}`, border: `1px solid ${d.isToday ? "#8B5CF6" : "#ffffff10"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: d.isToday ? "0 0 12px #8B5CF666" : "none", transition: "all 0.3s" }}>
                          {d.isFuture ? <span style={{ fontSize: 10, color: "#ffffff15" }}>·</span>
                            : d.rate >= 80 ? <span style={{ fontSize: 12 }}>✓</span>
                            : d.rate > 0 ? <span style={{ fontSize: 9, color: "#fff", fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>{d.rate}%</span>
                            : <span style={{ fontSize: 10, color: "#ffffff30" }}>·</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* This week summary */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                  {[
                    { label: "BEST DAY",    value: `${Math.max(...dayData.filter(d => !d.isFuture).map(d => d.rate))}%`, color: "#10B981", icon: "🏆" },
                    { label: "AVG RATE",    value: `${Math.round(dayData.filter(d => !d.isFuture && d.rate > 0).reduce((s, d) => s + d.rate, 0) / Math.max(1, dayData.filter(d => !d.isFuture && d.rate > 0).length))}%`, color: "#8B5CF6", icon: "📊" },
                    { label: "WEEK XP",     value: `${weekXp}`, color: "#F59E0B", icon: "⚡" },
                  ].map(s => (
                    <div key={s.label} style={{ background: `${s.color}0c`, border: `1px solid ${s.color}22`, borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 8, color: "#ffffff30", letterSpacing: 2, marginTop: 3, fontFamily: "'Orbitron', monospace" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Weekly habit breakdown */}
                <div style={{ background: "#ffffff07", border: "1px solid #ffffff10", borderRadius: 18, padding: 18, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff35", fontFamily: "'Orbitron', monospace", marginBottom: 14 }}>THIS WEEK'S MISSIONS</div>
                  {habits.map((h, i) => {
                    const catColors = { Mind: "#8B5CF6", Body: "#06B6D4", Wealth: "#F59E0B", Discipline: "#EF4444", Social: "#10B981" };
                    const color = catColors[h.category] || "#8B5CF6";
                    const weekDone = Math.min(7, h.streak + (h.completed ? 1 : 0));
                    return (
                      <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < habits.length - 1 ? 14 : 0 }}>
                        <div style={{ fontSize: 18, flexShrink: 0 }}>{h.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</span>
                            <span style={{ fontSize: 10, color: color, fontFamily: "'Orbitron', monospace", flexShrink: 0, marginLeft: 8 }}>{weekDone}/7</span>
                          </div>
                          <div style={{ display: "flex", gap: 3 }}>
                            {Array.from({ length: 7 }).map((_, j) => (
                              <div key={j} style={{ flex: 1, height: 5, borderRadius: 2, background: j < weekDone ? color : "#ffffff10", transition: "background 0.3s" }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Streak reminder */}
                <div style={{ background: "linear-gradient(135deg, #F59E0B0a, #EF44440a)", border: "1px solid #F59E0B22", borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 24 }}>🔥</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B", fontFamily: "'Orbitron', monospace", marginBottom: 2 }}>CURRENT STREAK: {streak} DAYS</div>
                    <div style={{ fontSize: 11, color: "#ffffff40" }}>Complete all habits today to keep it going!</div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ── TEMPLATES TAB ── */}
      {activeTab === "templates" && (
        <div style={{ padding: "0 20px" }}>
          <div style={{ fontSize: 11, color: "#ffffff30", textAlign: "center", marginBottom: 16, fontFamily: "'Rajdhani', sans-serif" }}>
            Tap a pack to instantly add those habits
          </div>
          {[
            {
              name: "Morning Warrior", icon: "🌅", color: "#F59E0B", desc: "Start every day with power",
              habits: [
                { name: "Wake up at 6AM", icon: "⏰", category: "Discipline", difficulty: "Hard" },
                { name: "Morning Meditation", icon: "🧘", category: "Mind", difficulty: "Medium" },
                { name: "Cold Shower", icon: "🌊", category: "Body", difficulty: "Hard" },
                { name: "Journaling", icon: "✍️", category: "Discipline", difficulty: "Easy" },
              ]
            },
            {
              name: "Gym Pack", icon: "💪", color: "#EF4444", desc: "Build an elite physique",
              habits: [
                { name: "Workout 45 min", icon: "⚡", category: "Body", difficulty: "Hard" },
                { name: "Drink 3L Water", icon: "💧", category: "Body", difficulty: "Easy" },
                { name: "Protein Intake", icon: "🥩", category: "Body", difficulty: "Medium" },
                { name: "Sleep 8 Hours", icon: "😴", category: "Body", difficulty: "Medium" },
              ]
            },
            {
              name: "Scholar Pack", icon: "📚", color: "#8B5CF6", desc: "Feed your mind daily",
              habits: [
                { name: "Read 20 Pages", icon: "📖", category: "Mind", difficulty: "Easy" },
                { name: "Study 2 Hours", icon: "🧠", category: "Mind", difficulty: "Hard" },
                { name: "No Social Media", icon: "🚫", category: "Discipline", difficulty: "Hard" },
                { name: "Review Notes", icon: "📝", category: "Mind", difficulty: "Medium" },
              ]
            },
            {
              name: "Wealth Builder", icon: "💎", color: "#10B981", desc: "Build your financial future",
              habits: [
                { name: "Track Expenses", icon: "💰", category: "Wealth", difficulty: "Easy" },
                { name: "Read Finance News", icon: "📈", category: "Wealth", difficulty: "Easy" },
                { name: "Save 10% Income", icon: "🏦", category: "Wealth", difficulty: "Medium" },
                { name: "Learn New Skill", icon: "🎯", category: "Wealth", difficulty: "Hard" },
              ]
            },
            {
              name: "Social Legend", icon: "🌟", color: "#06B6D4", desc: "Level up your relationships",
              habits: [
                { name: "Call a Friend", icon: "📞", category: "Social", difficulty: "Easy" },
                { name: "Random Act of Kindness", icon: "🤝", category: "Social", difficulty: "Easy" },
                { name: "Network 15 min", icon: "💬", category: "Social", difficulty: "Medium" },
              ]
            },
          ].map((pack, pi) => {
            const alreadyAdded = pack.habits.every(ph => habits.some(h => h.name === ph.name));
            return (
              <div key={pi} style={{ background: `${pack.color}08`, border: `1px solid ${pack.color}25`, borderRadius: 18, padding: 18, marginBottom: 12, animation: `slideUp 0.4s ease ${pi * 0.07}s both` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: `${pack.color}20`, border: `1px solid ${pack.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{pack.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{pack.name}</div>
                    <div style={{ fontSize: 11, color: "#ffffff40", marginTop: 2 }}>{pack.desc}</div>
                  </div>
                  <div style={{ fontSize: 10, color: pack.color, fontFamily: "'Orbitron', monospace", flexShrink: 0 }}>{pack.habits.length} habits</div>
                </div>

                {/* Habit preview pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {pack.habits.map((h, hi) => (
                    <div key={hi} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: "#ffffff08", border: "1px solid #ffffff10" }}>
                      <span style={{ fontSize: 12 }}>{h.icon}</span>
                      <span style={{ fontSize: 10, color: "#ffffff60", fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>{h.name}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (alreadyAdded) return;
                    const xpMap = { Easy: 25, Medium: 50, Hard: 80 };
                    const newHabits = pack.habits
                      .filter(ph => !habits.some(h => h.name === ph.name))
                      .map(ph => ({ id: Date.now() + Math.random(), ...ph, xp: xpMap[ph.difficulty], streak: 0, completed: false, time: "Any time" }));
                    if (newHabits.length > 0) {
                      window.dispatchEvent(new CustomEvent("ascend-add-habits", { detail: newHabits }));
                    }
                  }}
                  style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: `1px solid ${alreadyAdded ? "#ffffff15" : pack.color + "55"}`, background: alreadyAdded ? "#ffffff08" : `${pack.color}18`, color: alreadyAdded ? "#ffffff30" : pack.color, fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: alreadyAdded ? "default" : "pointer", transition: "all 0.25s" }}>
                  {alreadyAdded ? "✓ ALREADY ADDED" : `+ ADD ${pack.name.toUpperCase()}`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── HABIT CARD ───────────────────────────────────────────────────────────────
function HabitCard({ habit, onComplete, flash, onLongPress }) {
  const diffColors = { Easy: "#10B981", Medium: "#F59E0B", Hard: "#EF4444" };
  const diffBg     = { Easy: "#10B98115", Medium: "#F59E0B15", Hard: "#EF444415" };
  const catColors  = { Mind: "#8B5CF6", Body: "#06B6D4", Wealth: "#F59E0B", Discipline: "#EF4444", Social: "#10B981" };
  const accent = catColors[habit.category] || "#8B5CF6";

  // Long press / double-tap detection
  const pressTimer = useRef(null);
  const lastTap = useRef(0);

  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => {
      onLongPress();
    }, 500); // 500ms hold
  };

  const handlePressEnd = () => {
    clearTimeout(pressTimer.current);
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      onLongPress();
    }
    lastTap.current = now;
  };

  return (
    <div
      className="habit-card"
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={() => { handlePressEnd(); handleDoubleTap(); }}
      onClick={handleDoubleTap}
      style={{
        background: habit.completed ? `${accent}0a` : "#ffffff06",
        border: `1px solid ${habit.completed ? `${accent}33` : "#ffffff0d"}`,
        borderRadius: 18, padding: "14px 16px", marginBottom: 10,
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        transform: flash ? "scale(1.02)" : "scale(1)",
        boxShadow: flash ? `0 0 28px ${accent}55, 0 4px 20px ${accent}22` : habit.completed ? `0 0 12px ${accent}15` : "0 2px 8px #00000030",
        position: "relative", overflow: "hidden", cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Left accent bar */}
      <div style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 3, borderRadius: "0 3px 3px 0", background: habit.completed ? `linear-gradient(180deg, ${accent}, ${accent}44)` : `${accent}30`, transition: "all 0.3s" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 8 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: `${accent}18`, border: `1px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, opacity: habit.completed ? 0.5 : 1, transition: "opacity 0.3s" }}>
          {habit.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, textDecoration: habit.completed ? "line-through" : "none", color: habit.completed ? "#ffffff40" : "#fff", marginBottom: 5, transition: "color 0.3s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {habit.name}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, letterSpacing: 1.5, color: accent, fontFamily: "'Orbitron', monospace", background: `${accent}15`, padding: "2px 7px", borderRadius: 6 }}>
              {habit.category.toUpperCase()}
            </span>
            <span style={{ fontSize: 9, letterSpacing: 1, color: diffColors[habit.difficulty], background: diffBg[habit.difficulty], padding: "2px 7px", borderRadius: 6, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>
              {habit.difficulty.toUpperCase()}
            </span>
            {habit.streak > 0 && <span style={{ fontSize: 11, color: "#ffffff35" }}>🔥 {habit.streak}</span>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: "#F59E0B", fontFamily: "'Orbitron', monospace", fontWeight: 700, opacity: habit.completed ? 0.4 : 1 }}>
            +{habit.xp}
          </div>
          <button
            className="complete-btn"
            onClick={(e) => { e.stopPropagation(); onComplete(habit.id, e); }}
            onMouseDown={e => e.stopPropagation()}
            style={{
              width: 34, height: 34, borderRadius: "50%",
              border: `2px solid ${habit.completed ? accent : "#ffffff20"}`,
              background: habit.completed ? `linear-gradient(135deg, ${accent}, ${accent}88)` : `${accent}10`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: habit.completed ? "default" : "pointer",
              transition: "all 0.3s", color: "#fff", fontSize: 15,
              boxShadow: habit.completed ? `0 0 14px ${accent}55` : "none",
            }}
          >
            {habit.completed ? "✓" : "○"}
          </button>
        </div>
      </div>

      {habit.streak > 0 && (
        <div style={{ marginTop: 10, paddingLeft: 8 }}>
          <div style={{ height: 2, background: "#ffffff08", borderRadius: 1, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, (habit.streak / 30) * 100)}%`, background: `linear-gradient(90deg, ${accent}, ${accent}55)`, borderRadius: 1, transition: "width 0.6s ease" }} />
          </div>
        </div>
      )}
      {habit.lastNote && habit.completed && (
        <div style={{ marginTop: 8, paddingLeft: 8, display: "flex", alignItems: "flex-start", gap: 6 }}>
          <span style={{ fontSize: 10, flexShrink: 0, opacity: 0.5 }}>📝</span>
          <div style={{ fontSize: 11, color: "#ffffff45", fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, fontStyle: "italic", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {habit.lastNote}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EDIT HABIT MODAL ─────────────────────────────────────────────────────────
function EditHabitModal({ habit, setHabit, onClose, onSave, onDelete }) {
  const icons = ["⭐", "🧘", "🌊", "📖", "⚡", "✍️", "🏃", "💪", "🧠", "💰", "🎯", "🌅"];
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", backdropFilter: "blur(8px)", zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 430, background: "linear-gradient(135deg, #0f0f1a, #1a1a2e)", border: "1px solid #8B5CF644", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", animation: "modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>

        {/* Handle + title */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 40, height: 4, background: "#ffffff20", borderRadius: 2, margin: "0 auto 16px" }} />
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#8B5CF6" }}>EDIT MISSION</div>
        </div>

        {/* Icon picker */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 16 }}>
          {icons.map(ic => (
            <button key={ic} onClick={() => setHabit(p => ({ ...p, icon: ic }))} style={{ padding: "10px 0", borderRadius: 12, border: `2px solid ${habit.icon === ic ? "#8B5CF6" : "transparent"}`, background: habit.icon === ic ? "#8B5CF620" : "#ffffff08", fontSize: 22, cursor: "pointer" }}>{ic}</button>
          ))}
        </div>

        {/* Name input */}
        <input
          value={habit.name}
          onChange={e => setHabit(p => ({ ...p, name: e.target.value }))}
          placeholder="Habit name..."
          style={{ width: "100%", background: "#ffffff08", border: "1px solid #ffffff20", borderRadius: 12, padding: "14px 16px", color: "#fff", fontSize: 16, fontFamily: "'Rajdhani', sans-serif", marginBottom: 12, outline: "none" }}
        />

        {/* CATEGORY row */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#ffffff40", marginBottom: 6 }}>CATEGORY</div>
          <select value={habit.category} onChange={e => setHabit(p => ({ ...p, category: e.target.value }))} style={{ width: "100%", background: "#0f0f1a", border: "1px solid #ffffff20", borderRadius: 10, padding: "10px 12px", color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: 14 }}>
            {["Mind", "Body", "Wealth", "Discipline", "Social"].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* TIME SLOT row — between Category and Difficulty */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#ffffff40", marginBottom: 8 }}>TIME SLOT</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { key: "morning",   label: "🌅 Morning",   time: "07:00 AM", color: "#F59E0B" },
              { key: "afternoon", label: "☀️ Afternoon", time: "01:00 PM", color: "#06B6D4" },
              { key: "evening",   label: "🌙 Evening",   time: "08:00 PM", color: "#8B5CF6" },
            ].map(s => {
              const t = habit.time || "";
              const hour = parseInt(t.split(":")[0]) || 0;
              const isPM = t.includes("PM");
              const h24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
              const selected = h24 < 12 ? s.key === "morning" : h24 < 17 ? s.key === "afternoon" : s.key === "evening";
              return (
                <button key={s.key} onClick={() => setHabit(p => ({ ...p, time: s.time }))}
                  style={{ flex: 1, padding: "11px 4px", borderRadius: 12, border: `2px solid ${selected ? s.color : "#ffffff12"}`, background: selected ? `${s.color}18` : "#ffffff06", color: selected ? s.color : "#ffffff45", fontSize: 11, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* DIFFICULTY row */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#ffffff40", marginBottom: 6 }}>DIFFICULTY</div>
          <select value={habit.difficulty} onChange={e => setHabit(p => ({ ...p, difficulty: e.target.value }))} style={{ width: "100%", background: "#0f0f1a", border: "1px solid #ffffff20", borderRadius: 10, padding: "10px 12px", color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: 14 }}>
            {["Easy", "Medium", "Hard"].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        {/* Save + Cancel */}
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 14, borderRadius: 14, border: "1px solid #ffffff20", background: "transparent", color: "#ffffff60", fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>CANCEL</button>
          <button onClick={onSave} disabled={!habit.name} style={{ flex: 2, padding: 14, borderRadius: 14, border: "none", background: habit.name ? "linear-gradient(135deg, #8B5CF6, #06B6D4)" : "#ffffff20", color: "#fff", fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: habit.name ? "pointer" : "default" }}>
            SAVE CHANGES
          </button>
        </div>

        {/* Delete */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid #EF444433", background: "#EF444410", color: "#EF4444", fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: "pointer" }}
          >
            🗑 DELETE MISSION
          </button>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: 14, borderRadius: 14, border: "1px solid #ffffff20", background: "transparent", color: "#ffffff60", fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>CANCEL</button>
            <button onClick={onDelete} style={{ flex: 2, padding: 14, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #EF4444, #DC2626)", color: "#fff", fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: "pointer" }}>
              CONFIRM DELETE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SKILL SCREEN ─────────────────────────────────────────────────────────────
function SkillScreen({ habits, streak, xp }) {
  const [selected, setSelected] = useState(null);

  // Map habit categories to skill trees
  const catMap = { Mind: 0, Body: 1, Wealth: 2, Discipline: 3, Social: 4 };
  const skillData = SKILL_TREES.map((s, i) => {
    const catHabits = habits.filter(h => h.category === s.name);
    const done = catHabits.filter(h => h.completed).length;
    const totalStreak = catHabits.reduce((sum, h) => sum + h.streak, 0);
    // Level derived from streak in that category (base + earned)
    const earnedLevel = Math.min(s.max, s.level + Math.floor(totalStreak / 3));
    return { ...s, earnedLevel, done, catHabits, totalStreak };
  });

  const totalLevel = skillData.reduce((sum, s) => sum + s.earnedLevel, 0);
  const maxTotal = skillData.reduce((sum, s) => sum + s.max, 0);

  // Unlock nodes per skill (3 nodes, unlock at level thresholds)
  const NODES = [
    { label: "Novice",   threshold: 3,  icon: "🌱" },
    { label: "Adept",    threshold: 10, icon: "⚡" },
    { label: "Master",   threshold: 18, icon: "👑" },
  ];

  return (
    <div style={{ padding: "50px 20px 100px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#8B5CF6", fontFamily: "'Orbitron', monospace", marginBottom: 6 }}>SKILL TREE</div>
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, background: "linear-gradient(135deg, #fff 50%, #8B5CF6aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Your Mastery<br />Domains
        </div>
      </div>

      {/* Overall power bar */}
      <div style={{ background: "linear-gradient(135deg, #8B5CF608, #06B6D408)", border: "1px solid #8B5CF622", borderRadius: 16, padding: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ textAlign: "center", minWidth: 56 }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 26, fontWeight: 900, background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{totalLevel}</div>
          <div style={{ fontSize: 8, letterSpacing: 2, color: "#ffffff30", fontFamily: "'Orbitron', monospace" }}>POWER</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#ffffff30", fontFamily: "'Orbitron', monospace", marginBottom: 6, letterSpacing: 2 }}>
            <span>TOTAL MASTERY</span><span>{Math.round((totalLevel / maxTotal) * 100)}%</span>
          </div>
          <div style={{ height: 6, background: "#ffffff08", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(totalLevel / maxTotal) * 100}%`, background: "linear-gradient(90deg, #8B5CF6, #06B6D4, #F59E0B)", borderRadius: 3, transition: "width 1s ease", boxShadow: "0 0 10px #8B5CF644" }} />
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
            {skillData.map(s => (
              <div key={s.name} style={{ flex: 1, height: 3, borderRadius: 2, background: s.color, opacity: 0.6 + (s.earnedLevel / s.max) * 0.4 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Skill cards */}
      {skillData.map((skill, i) => {
        const pct = (skill.earnedLevel / skill.max) * 100;
        const r = 30;
        const circ = 2 * Math.PI * r;
        const isOpen = selected === i;
        return (
          <div key={skill.name} onClick={() => setSelected(isOpen ? null : i)}
            style={{ background: isOpen ? `${skill.color}0f` : "#ffffff07", border: `1px solid ${isOpen ? skill.color + "55" : skill.color + "22"}`, borderRadius: 20, padding: 18, marginBottom: 10, cursor: "pointer", transition: "all 0.3s", animation: `slideUp 0.4s ease ${i * 0.07}s both` }}>

            {/* Top row */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Mini ring */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="36" cy="36" r={r} fill="none" stroke="#ffffff08" strokeWidth="5" />
                  <circle cx="36" cy="36" r={r} fill="none" stroke={skill.color} strokeWidth="5"
                    strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
                    strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 5px ${skill.color})` }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <div style={{ fontSize: 18 }}>{skill.icon}</div>
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{skill.name}</div>
                    <div style={{ fontSize: 9, letterSpacing: 3, color: skill.color, fontFamily: "'Orbitron', monospace", marginTop: 2 }}>LVL {skill.earnedLevel} · {Math.round(pct)}% MASTERY</div>
                  </div>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 24, fontWeight: 900, color: skill.color, lineHeight: 1 }}>{skill.earnedLevel}</div>
                </div>

                {/* Segment bar */}
                <div style={{ display: "flex", gap: 2, marginTop: 10 }}>
                  {Array.from({ length: skill.max }).map((_, j) => (
                    <div key={j} style={{ flex: 1, height: 4, borderRadius: 1, background: j < skill.earnedLevel ? skill.color : "#ffffff10", transition: "background 0.3s", boxShadow: j < skill.earnedLevel ? `0 0 4px ${skill.color}88` : "none" }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Expanded detail */}
            {isOpen && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${skill.color}22` }}>
                {/* Today's habits in this category */}
                {skill.catHabits.length > 0 ? (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 9, letterSpacing: 3, color: "#ffffff40", fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>ACTIVE MISSIONS</div>
                    {skill.catHabits.map(h => (
                      <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #ffffff08" }}>
                        <div style={{ fontSize: 16 }}>{h.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: h.completed ? skill.color : "#fff" }}>{h.name}</div>
                          <div style={{ fontSize: 10, color: "#ffffff40" }}>🔥 {h.streak} day streak · {h.xp} XP</div>
                        </div>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: h.completed ? skill.color : "#ffffff10", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{h.completed ? "✓" : "·"}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "#ffffff30", marginBottom: 14, fontStyle: "italic" }}>No missions in this category yet</div>
                )}

                {/* Unlock nodes */}
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#ffffff40", fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>UNLOCK NODES</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {NODES.map(node => {
                    const unlocked = skill.earnedLevel >= node.threshold;
                    return (
                      <div key={node.label} style={{ flex: 1, textAlign: "center", padding: "10px 6px", borderRadius: 12, background: unlocked ? `${skill.color}20` : "#ffffff06", border: `1px solid ${unlocked ? skill.color + "55" : "#ffffff10"}`, transition: "all 0.3s" }}>
                        <div style={{ fontSize: 18, marginBottom: 4, filter: unlocked ? "none" : "grayscale(1) opacity(0.25)" }}>{node.icon}</div>
                        <div style={{ fontSize: 8, color: unlocked ? skill.color : "#ffffff25", fontFamily: "'Orbitron', monospace", letterSpacing: 1 }}>{node.label}</div>
                        <div style={{ fontSize: 8, color: "#ffffff20", marginTop: 2 }}>Lv {node.threshold}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Achievements */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#F59E0B", fontFamily: "'Orbitron', monospace", marginBottom: 14 }}>🏆 ACHIEVEMENTS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            ...ACHIEVEMENTS,
            { name: "First Step",  rarity: "rare",      icon: "👟", desc: "Complete 1 habit",   unlocked: habits.some(h => h.streak > 0) },
            { name: "On Fire",     rarity: "epic",      icon: "🔥", desc: "3-day streak",        unlocked: streak >= 3 },
            { name: "Week Warrior",rarity: "legendary", icon: "⚔️", desc: "7-day streak",        unlocked: streak >= 7 },
          ].map((a, i) => {
            const unlocked = a.unlocked !== undefined ? a.unlocked : true;
            return (
              <div key={a.name + i} style={{ borderRadius: 16, padding: 14, textAlign: "center", background: unlocked ? RARITY_COLORS[a.rarity].bg : "#ffffff08", boxShadow: unlocked ? `0 0 20px ${RARITY_COLORS[a.rarity].glow}` : "none", border: `1px solid ${unlocked ? RARITY_COLORS[a.rarity].border + "44" : "#ffffff10"}`, transition: "all 0.3s", filter: unlocked ? "none" : "grayscale(1) opacity(0.4)" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{a.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{a.name}</div>
                <div style={{ fontSize: 8, color: unlocked ? "#ffffffaa" : "#ffffff40", letterSpacing: 1 }}>{unlocked ? a.rarity.toUpperCase() : a.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ANALYTICS SCREEN ─────────────────────────────────────────────────────────
function AnalyticsScreen({ habits, xp, level, levelProgress, streak, TC = "#8B5CF6", TC2 = "#06B6D4" }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date().getDay(); // 0=Sun, 1=Mon...
  const todayIndex = today === 0 ? 6 : today - 1; // convert to M=0 index

  // Real data: habits completed today by category
  const completedHabits = habits.filter(h => h.completed);
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedHabits.length / totalHabits) * 100) : 0;

  // Category breakdown from real habits
  const catColors = { Mind: "#8B5CF6", Body: "#06B6D4", Wealth: "#F59E0B", Discipline: "#EF4444", Social: "#10B981" };
  const categories = ["Mind", "Body", "Wealth", "Discipline", "Social"];
  const catStats = categories.map(cat => {
    const catHabits = habits.filter(h => h.category === cat);
    const catDone = catHabits.filter(h => h.completed).length;
    return { cat, total: catHabits.length, done: catDone, color: catColors[cat] };
  }).filter(c => c.total > 0);

  // Total habits ever completed (from streaks)
  const totalEver = habits.reduce((sum, h) => sum + h.streak, 0);

  // Discipline score based on completion rate + streak
  const disciplineScore = Math.min(100, Math.round(completionRate * 0.6 + Math.min(streak * 2, 40)));

  // Simulated weekly data with today highlighted
  const weekData = [2, 4, 3, 5, 4, 2, completedHabits.length];

  return (
    <div style={{ padding: "50px 20px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, position: "relative" }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#06B6D4", fontFamily: "'Orbitron', monospace", marginBottom: 6, opacity: 0.8 }}>GROWTH HQ</div>
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, background: "linear-gradient(135deg, #fff 50%, #06B6D4aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Your Progress<br />Dashboard
        </div>
      </div>

      {/* ── TOP STAT CARDS (real data) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "DISCIPLINE SCORE", value: disciplineScore, unit: "/100", color: TC,  icon: "🔥", bg: TC },
          { label: "CURRENT STREAK",   value: streak,          unit: " days", color: "#F59E0B", icon: "⚡", bg: "#F59E0B" },
          { label: "TOTAL XP",         value: xp.toLocaleString(), unit: "", color: "#06B6D4", icon: "💎", bg: "#06B6D4" },
          { label: "HABITS DONE",      value: totalEver,       unit: " total", color: "#10B981", icon: "✓", bg: "#10B981" },
        ].map((s, i) => (
          <div key={s.label} style={{ background: `${s.bg}0c`, border: `1px solid ${s.bg}25`, borderRadius: 16, padding: 16, position: "relative", overflow: "hidden", animation: `slideUp 0.4s ease ${i * 0.08}s both` }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${s.bg}88, transparent)` }} />
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 20, fontWeight: 900, color: s.color }}>
              {s.value}<span style={{ fontSize: 11, color: "#ffffff50" }}>{s.unit}</span>
            </div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#ffffff35", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── TODAY'S COMPLETION RING ── */}
      <div style={{ background: "#ffffff08", border: "1px solid #ffffff10", borderRadius: 20, padding: 20, marginBottom: 14, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
            <defs>
              <filter id="ringGlow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <circle cx="45" cy="45" r="38" fill="none" stroke="#ffffff08" strokeWidth="7" />
            <circle cx="45" cy="45" r="38" fill="none" stroke={TC2} strokeWidth="7"
              strokeDasharray={2 * Math.PI * 38}
              strokeDashoffset={2 * Math.PI * 38 * (1 - completionRate / 100)}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease", filter: "drop-shadow(0 0 8px #06B6D4) drop-shadow(0 0 16px #06B6D488)" }} />
            {/* Glowing tip dot at leading edge */}
            {completionRate > 2 && (() => {
              const angle = (completionRate / 100) * 2 * Math.PI - Math.PI / 2;
              const cx = 45 + 38 * Math.cos(angle);
              const cy = 45 + 38 * Math.sin(angle);
              return (
                <g filter="url(#ringGlow)">
                  <circle cx={cx} cy={cy} r="5" fill="#fff" opacity="0.9" />
                  <circle cx={cx} cy={cy} r="3.5" fill="#06B6D4" />
                </g>
              );
            })()}
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 16, fontWeight: 900, color: TC2 }}>{completionRate}%</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff40", fontFamily: "'Orbitron', monospace", marginBottom: 6 }}>TODAY'S PROGRESS</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            {completedHabits.length}<span style={{ fontSize: 13, color: "#ffffff40" }}>/{totalHabits} missions</span>
          </div>
          <div style={{ fontSize: 12, color: completionRate === 100 ? "#10B981" : "#ffffff50" }}>
            {completionRate === 100 ? "🏆 All missions complete!" : completionRate >= 50 ? "⚡ Keep pushing!" : "🎯 Get started!"}
          </div>
        </div>
      </div>

      {/* ── CATEGORY BREAKDOWN ── */}
      {catStats.length > 0 && (
        <div style={{ background: "#ffffff08", border: "1px solid #ffffff10", borderRadius: 20, padding: 20, marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff40", fontFamily: "'Orbitron', monospace", marginBottom: 14 }}>CATEGORY BREAKDOWN</div>
          {catStats.map((c, i) => (
            <div key={c.cat} style={{ marginBottom: i < catStats.length - 1 ? 14 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{c.cat}</span>
                </div>
                <span style={{ fontSize: 11, color: c.color, fontFamily: "'Orbitron', monospace" }}>{c.done}/{c.total}</span>
              </div>
              <div style={{ height: 5, background: "#ffffff08", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${c.total > 0 ? (c.done / c.total) * 100 : 0}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}88)`, borderRadius: 3, transition: "width 0.8s ease", boxShadow: `0 0 8px ${c.color}44` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── THIS WEEK BAR CHART ── */}
      <div style={{ background: "#ffffff08", border: "1px solid #ffffff10", borderRadius: 20, padding: 20, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff40", fontFamily: "'Orbitron', monospace" }}>THIS WEEK</div>
          <div style={{ fontSize: 10, color: "#8B5CF6", fontFamily: "'Orbitron', monospace" }}>{weekData.reduce((a, b) => a + b, 0)} TOTAL</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80 }}>
          {weekData.map((v, i) => {
            const isToday = i === todayIndex;
            const maxV = Math.max(...weekData, 1);
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: "100%", height: `${Math.max(4, (v / maxV) * 65)}px`, background: isToday ? "linear-gradient(180deg, #8B5CF6, #06B6D4)" : "#ffffff12", borderRadius: "4px 4px 0 0", transition: "height 0.6s ease", boxShadow: isToday ? "0 0 12px #8B5CF666" : "none", position: "relative" }}>
                  {isToday && v > 0 && <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: 9, color: "#8B5CF6", fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>{v}</div>}
                </div>
                <div style={{ fontSize: 9, color: isToday ? "#8B5CF6" : "#ffffff30", fontWeight: isToday ? 700 : 400 }}>{days[i]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STREAK MILESTONE ── */}
      <div style={{ background: "linear-gradient(135deg, #F59E0B0c, #EF44440c)", border: "1px solid #F59E0B22", borderRadius: 20, padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#F59E0B", fontFamily: "'Orbitron', monospace", marginBottom: 12 }}>🔥 STREAK MILESTONES</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { days: 7,  label: "7 Days",  icon: "🥉" },
            { days: 14, label: "14 Days", icon: "🥈" },
            { days: 30, label: "30 Days", icon: "🥇" },
            { days: 60, label: "60 Days", icon: "👑" },
          ].map(m => {
            const reached = streak >= m.days;
            return (
              <div key={m.days} style={{ flex: 1, textAlign: "center", padding: "10px 4px", borderRadius: 12, background: reached ? "#F59E0B20" : "#ffffff08", border: `1px solid ${reached ? "#F59E0B44" : "#ffffff10"}`, transition: "all 0.3s" }}>
                <div style={{ fontSize: 20, marginBottom: 4, filter: reached ? "none" : "grayscale(1) opacity(0.3)" }}>{m.icon}</div>
                <div style={{ fontSize: 8, color: reached ? "#F59E0B" : "#ffffff25", fontFamily: "'Orbitron', monospace", letterSpacing: 1 }}>{m.label}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#ffffff40", marginBottom: 5 }}>
            <span style={{ fontFamily: "'Orbitron', monospace" }}>NEXT: {streak < 7 ? `${7 - streak} days to 7-day` : streak < 14 ? `${14 - streak} days to 14-day` : streak < 30 ? `${30 - streak} days to 30-day` : `${60 - streak} days to 60-day`}</span>
          </div>
          <div style={{ height: 4, background: "#ffffff08", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${Math.min(100, (streak / (streak < 7 ? 7 : streak < 14 ? 14 : streak < 30 ? 30 : 60)) * 100)}%`, background: "linear-gradient(90deg, #F59E0B, #EF4444)", borderRadius: 2, transition: "width 0.8s ease" }} />
          </div>
        </div>
      </div>

      {/* ── ACTIVITY HEATMAP ── */}
      <div style={{ background: "#ffffff08", border: "1px solid #ffffff10", borderRadius: 20, padding: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff40", fontFamily: "'Orbitron', monospace", marginBottom: 14 }}>ACTIVITY HEATMAP</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 3 }}>
          {Array.from({ length: 98 }).map((_, i) => {
            const isRecent = i > 85;
            const intensity = isRecent ? Math.random() * 0.6 + 0.4 : Math.random();
            const color = intensity > 0.7 ? "#8B5CF6" : intensity > 0.4 ? "#8B5CF680" : intensity > 0.15 ? "#8B5CF630" : "#ffffff08";
            return <div key={i} style={{ aspectRatio: "1", borderRadius: 2, background: color, transition: "background 0.3s" }} />;
          })}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 10, justifyContent: "space-between" }}>
          <span style={{ fontSize: 9, color: "#ffffff20", fontFamily: "'Orbitron', monospace" }}>14 WEEKS</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 9, color: "#ffffff25" }}>Less</span>
            {["#ffffff08", "#8B5CF630", "#8B5CF680", "#8B5CF6"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />)}
            <span style={{ fontSize: 9, color: "#ffffff25" }}>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FOCUS SCREEN ─────────────────────────────────────────────────────────────
function FocusScreen({ focusTime, focusRunning, setFocusRunning, setFocusTime, formatTime, focusActive, setFocusActive }) {
  const [mode, setMode] = useState("pomodoro");
  const [sessions, setSessions] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [justFinished, setJustFinished] = useState(false);
  const prevTime = useRef(focusTime);

  const modes = { pomodoro: 25 * 60, short: 5 * 60, long: 15 * 60 };
  const modeXp = { pomodoro: 50, short: 10, long: 25 };
  const modeLabels = { pomodoro: "FOCUS", short: "SHORT BREAK", long: "LONG BREAK" };
  const progress = 1 - focusTime / modes[mode];
  const circumference = 2 * Math.PI * 108;

  // Detect timer completion
  useEffect(() => {
    if (prevTime.current > 0 && focusTime === 0 && !justFinished) {
      setJustFinished(true);
      setFocusRunning(false);
      const earned = modeXp[mode];
      setSessions(s => s + 1);
      setSessionXp(s => s + earned);
      // Play completion chime
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [[523, 0], [659, 0.2], [784, 0.4], [1047, 0.65]].forEach(([freq, t]) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = freq; o.type = "sine";
          g.gain.setValueAtTime(0.25, ctx.currentTime + t);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.4);
          o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.5);
        });
      } catch(e) {}
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 }, colors: ["#06B6D4", "#8B5CF6", "#F59E0B"] });
      setTimeout(() => setJustFinished(false), 3000);
    }
    prevTime.current = focusTime;
  }, [focusTime]);

  const TIPS = [
    "Close all notifications. One task. Full presence.",
    "Your brain reaches peak focus after 15 minutes. Push through.",
    "The session isn't done until the timer hits zero.",
    "Elite performers do deep work in focused blocks. So do you.",
    "Distraction is the enemy. Focus is the weapon.",
  ];
  const tip = TIPS[sessions % TIPS.length];

  const handleModeSwitch = (m) => {
    setMode(m); setFocusTime(modes[m]); setFocusRunning(false); setJustFinished(false);
  };

  return (
    <div style={{ padding: "50px 20px 100px", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

      {/* Ambient background glow */}
      <div style={{ position: "fixed", top: "30%", left: "50%", transform: "translateX(-50%)", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, #06B6D4${focusRunning ? "18" : "08"} 0%, transparent 70%)`, pointerEvents: "none", transition: "all 2s ease", zIndex: 0 }} />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1, marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#06B6D4", fontFamily: "'Orbitron', monospace", marginBottom: 6 }}>DEEP FOCUS</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, background: "linear-gradient(135deg, #fff 50%, #06B6D4aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Enter the<br />Flow State</div>
          {/* Session counter */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 900, color: "#06B6D4" }}>{sessions}</div>
            <div style={{ fontSize: 8, letterSpacing: 2, color: "#ffffff30", fontFamily: "'Orbitron', monospace" }}>SESSIONS</div>
          </div>
        </div>
      </div>

      {/* Mode tabs */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 6, marginBottom: 32, background: "#ffffff06", borderRadius: 14, padding: 4 }}>
        {Object.keys(modes).map(m => (
          <button key={m} onClick={() => handleModeSwitch(m)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", background: mode === m ? "#06B6D4" : "transparent", color: mode === m ? "#000" : "#ffffff40", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', monospace", fontWeight: 700, cursor: "pointer", transition: "all 0.25s" }}>
            {m === "pomodoro" ? "FOCUS" : m === "short" ? "SHORT" : "LONG"}
          </button>
        ))}
      </div>

      {/* Big timer ring */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", marginBottom: 36 }}>
        <div style={{ position: "relative", width: 260, height: 260 }}>
          {/* Outer glow rings */}
          <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: `1px solid #06B6D4${focusRunning ? "22" : "0a"}`, transition: "all 1.5s" }} />
          <div style={{ position: "absolute", inset: -22, borderRadius: "50%", border: `1px solid #06B6D4${focusRunning ? "12" : "06"}`, transition: "all 2s" }} />

          {/* Inner radial glow */}
          <div style={{ position: "absolute", inset: 20, borderRadius: "50%", background: `radial-gradient(circle, #06B6D4${focusRunning ? "25" : "10"} 0%, transparent 65%)`, transition: "all 1.5s" }} />

          <svg width="260" height="260" style={{ transform: "rotate(-90deg)", position: "relative", zIndex: 1 }}>
            <defs>
              <filter id="focusGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            {/* Track */}
            <circle cx="130" cy="130" r="108" fill="none" stroke="#ffffff06" strokeWidth="10" />
            {/* Progress arc */}
            <circle cx="130" cy="130" r="108" fill="none"
              stroke={justFinished ? "#10B981" : "#06B6D4"} strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: focusRunning ? "stroke-dashoffset 1s linear" : "stroke-dashoffset 0.4s ease, stroke 0.5s", filter: `drop-shadow(0 0 10px ${justFinished ? "#10B981" : "#06B6D4"}) drop-shadow(0 0 20px ${justFinished ? "#10B98166" : "#06B6D444"})` }} />
            {/* Tip dot */}
            {progress > 0.01 && (() => {
              const angle = progress * 2 * Math.PI - Math.PI / 2;
              const cx = 130 + 108 * Math.cos(angle);
              const cy = 130 + 108 * Math.sin(angle);
              return (
                <g filter="url(#focusGlow)">
                  <circle cx={cx} cy={cy} r="7" fill="#fff" opacity="0.85" />
                  <circle cx={cx} cy={cy} r="4.5" fill={justFinished ? "#10B981" : "#06B6D4"} />
                </g>
              );
            })()}
          </svg>

          {/* Center content */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
            {justFinished ? (
              <>
                <div style={{ fontSize: 36, marginBottom: 4 }}>✅</div>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 900, color: "#10B981", letterSpacing: 2 }}>COMPLETE!</div>
                <div style={{ fontSize: 12, color: "#F59E0B", fontFamily: "'Orbitron', monospace", marginTop: 4 }}>+{modeXp[mode]} XP</div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 46, fontWeight: 900, letterSpacing: 4, color: focusRunning ? "#fff" : "#ffffff80", transition: "color 0.5s" }}>{formatTime(focusTime)}</div>
                <div style={{ fontSize: 10, letterSpacing: 4, color: focusRunning ? "#06B6D4" : "#ffffff25", fontFamily: "'Orbitron', monospace", marginTop: 6, transition: "color 0.5s" }}>{focusRunning ? modeLabels[mode] : "READY"}</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 20, justifyContent: "center", alignItems: "center", marginBottom: 32 }}>
        <button onClick={() => { setFocusTime(modes[mode]); setFocusRunning(false); setJustFinished(false); }}
          style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid #ffffff18", background: "#ffffff0a", color: "#ffffff60", fontSize: 20, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>↺</button>

        <button onClick={() => { if (!justFinished) setFocusRunning(r => !r); }}
          style={{ width: 80, height: 80, borderRadius: "50%", border: `2px solid ${focusRunning ? "#06B6D4" : "#06B6D455"}`, background: focusRunning ? "linear-gradient(135deg, #06B6D430, #8B5CF630)" : "linear-gradient(135deg, #06B6D415, #8B5CF615)", color: "#fff", fontSize: 28, cursor: "pointer", boxShadow: focusRunning ? "0 0 40px #06B6D455, inset 0 0 20px #06B6D415" : "0 0 20px #06B6D422", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {focusRunning ? "⏸" : "▶"}
        </button>

        <button onClick={() => { handleModeSwitch(mode === "pomodoro" ? "short" : "pomodoro"); }}
          style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid #ffffff18", background: "#ffffff0a", color: "#ffffff60", fontSize: 20, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>⏭</button>
      </div>

      {/* Session XP earned */}
      {sessionXp > 0 && (
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", gap: 20, marginBottom: 24 }}>
          {[{ label: "SESSION XP", value: `+${sessionXp}`, color: "#F59E0B" }, { label: "SESSIONS", value: sessions, color: "#06B6D4" }, { label: "FOCUS TIME", value: `${sessions * 25}m`, color: "#8B5CF6" }].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 8, letterSpacing: 2, color: "#ffffff25", fontFamily: "'Orbitron', monospace", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Session dots */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < sessions % 4 ? "#06B6D4" : "#ffffff10", boxShadow: i < sessions % 4 ? "0 0 8px #06B6D4" : "none", transition: "all 0.4s" }} />
        ))}
      </div>

      {/* Flow tip */}
      <div style={{ position: "relative", zIndex: 1, background: "linear-gradient(135deg, #06B6D408, #8B5CF608)", border: "1px solid #06B6D420", borderRadius: 16, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ fontSize: 18, flexShrink: 0 }}>💡</div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#06B6D4", fontFamily: "'Orbitron', monospace", marginBottom: 5 }}>FLOW TIP</div>
          <div style={{ fontSize: 13, color: "#ffffff70", lineHeight: 1.6, fontFamily: "'Rajdhani', sans-serif" }}>{tip}</div>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
function ProfileScreen({ xp, level, levelProgress, habits, streak, username, userProfile, onOpenSettings, xpLog, TC = "#8B5CF6", TC2 = "#06B6D4" }) {
  const [showShare, setShowShare] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeLink, setChallengeLink] = useState("");
  const shareCardRef = useRef(null);

  const generateChallengeLink = () => {
    const data = btoa(JSON.stringify({ name: username, level, streak, xp, habits: habits.length }));
    const link = `${window.location.origin}?challenge=${data}`;
    setChallengeLink(link);
    setShowChallenge(true);
  };

  const shareCard = () => {
    // Use html2canvas-like approach via canvas
    const canvas = document.createElement("canvas");
    canvas.width = 600; canvas.height = 340;
    const ctx = canvas.getContext("2d");
    const t = getTheme(userProfile?.theme || "purple");

    // Background
    const grad = ctx.createLinearGradient(0, 0, 600, 340);
    grad.addColorStop(0, "#030712"); grad.addColorStop(1, "#0f0720");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 600, 340);

    // Glow circle
    const glow = ctx.createRadialGradient(80, 170, 0, 80, 170, 160);
    glow.addColorStop(0, t.a + "33"); glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 600, 340);

    // Border
    ctx.strokeStyle = t.a + "44"; ctx.lineWidth = 1.5;
    ctx.strokeRect(1, 1, 598, 338);

    // ASCEND logo text
    ctx.fillStyle = t.a; ctx.font = "bold 13px monospace";
    ctx.letterSpacing = "6px"; ctx.fillText("⚔  ASCEND", 36, 50);

    // Level badge
    ctx.fillStyle = t.a + "22"; ctx.beginPath();
    ctx.roundRect(36, 70, 160, 80, 14); ctx.fill();
    ctx.strokeStyle = t.a + "55"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(36, 70, 160, 80, 14); ctx.stroke();

    ctx.fillStyle = t.a; ctx.font = "bold 42px monospace";
    ctx.fillText(`LV${level}`, 46, 128);
    ctx.fillStyle = "#ffffff55"; ctx.font = "11px monospace";
    ctx.fillText("LEVEL", 46, 148);

    // XP
    ctx.fillStyle = "#F59E0B"; ctx.font = "bold 28px monospace";
    ctx.fillText(`${xp.toLocaleString()} XP`, 220, 120);
    ctx.fillStyle = "#ffffff40"; ctx.font = "11px monospace";
    ctx.fillText("TOTAL XP", 220, 140);

    // Streak
    ctx.fillStyle = "#EF4444"; ctx.font = "bold 28px monospace";
    ctx.fillText(`🔥 ${streak}`, 220, 180);
    ctx.fillStyle = "#ffffff40"; ctx.font = "11px monospace";
    ctx.fillText("DAY STREAK", 220, 198);

    // Username
    ctx.fillStyle = "#fff"; ctx.font = "bold 32px sans-serif";
    ctx.fillText(username || "Champion", 36, 230);
    ctx.fillStyle = "#ffffff40"; ctx.font = "13px monospace";
    ctx.fillText("is leveling up their life on Ascend", 36, 255);

    // Bottom bar
    const bar = ctx.createLinearGradient(0, 290, 600, 290);
    bar.addColorStop(0, t.a); bar.addColorStop(1, t.b);
    ctx.fillStyle = bar; ctx.fillRect(0, 300, 600 * (levelProgress / 100), 6);
    ctx.fillStyle = "#ffffff10"; ctx.fillRect(0, 300, 600, 6);
    ctx.fillStyle = bar; ctx.fillRect(0, 300, 600 * (levelProgress / 100), 6);

    ctx.fillStyle = "#ffffff25"; ctx.font = "10px monospace";
    ctx.fillText(`${Math.floor(levelProgress)}% TO NEXT LEVEL  ·  ascend-app.vercel.app`, 36, 326);

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `ascend-level-${level}.png`; a.click();
      URL.revokeObjectURL(url);
    });
  };
  const xpToNext = 500 - (xp % 500);
  const completedToday = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;
  const totalEver = habits.reduce((sum, h) => sum + h.streak, 0);

  // Rank title based on level — uses shared getLevelTitle system
  const rank = getLevelTitle(level);

  const r = 80;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ padding: "50px 20px 100px" }}>

      {/* ── HERO CARD ── */}
      <div style={{ position: "relative", background: "linear-gradient(135deg, #8B5CF615, #06B6D415)", border: "1px solid #8B5CF633", borderRadius: 24, padding: 24, marginBottom: 16, overflow: "hidden" }}>
        {/* bg decoration */}
        <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle, #8B5CF622 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Settings button */}
        <button onClick={onOpenSettings} style={{ position: "absolute", top: 16, right: 16, width: 34, height: 34, borderRadius: 10, border: "1px solid #ffffff15", background: "#ffffff08", color: "#ffffff60", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>⚙</button>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Avatar with XP ring */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
              <defs>
                <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r={r * 0.6} fill="none" stroke="#ffffff08" strokeWidth="6" />
              <circle cx="50" cy="50" r={r * 0.6} fill="none" stroke="url(#xpGrad)" strokeWidth="6"
                strokeDasharray={circ * 0.6} strokeDashoffset={circ * 0.6 * (1 - levelProgress / 100)}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease", filter: "drop-shadow(0 0 6px #8B5CF6)" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, animation: "glow 3s ease-in-out infinite", overflow: "hidden" }}>
                {userProfile?.avatarImg
                  ? <img src={userProfile.avatarImg} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : (userProfile?.avatar || "⚔️")}
              </div>
            </div>
            {/* Level badge */}
            <div style={{ position: "absolute", bottom: 2, right: 2, background: "linear-gradient(135deg, #F59E0B, #EF4444)", borderRadius: 8, padding: "2px 7px", fontFamily: "'Orbitron', monospace", fontSize: 10, fontWeight: 900, zIndex: 2 }}>LV{level}</div>
          </div>

          {/* Name & rank */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff35", fontFamily: "'Orbitron', monospace", marginBottom: 4 }}>HERO</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{username || "Warrior"}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${rank.color}22`, border: `1px solid ${rank.color}44`, borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ fontSize: 12 }}>{rank.icon}</span>
              <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 9, fontWeight: 700, color: rank.color, letterSpacing: 2 }}>{rank.title}</span>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#ffffff30", fontFamily: "'Orbitron', monospace", letterSpacing: 2, marginBottom: 6 }}>
            <span>{xp} XP</span><span>{xpToNext} TO NEXT LEVEL</span>
          </div>
          <div style={{ height: 5, background: "#ffffff08", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${levelProgress}%`, background: "linear-gradient(90deg, #8B5CF6, #06B6D4)", borderRadius: 3, transition: "width 1s ease", boxShadow: "0 0 10px #8B5CF644" }} />
          </div>
        </div>
      </div>

      {/* ── STAT GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "STREAK",   value: streak,         unit: "days", icon: "🔥", color: "#F59E0B" },
          { label: "TODAY",    value: `${completedToday}/${totalHabits}`, unit: "done", icon: "✅", color: "#10B981" },
          { label: "ALL TIME", value: totalEver,       unit: "habits", icon: "⚡", color: "#06B6D4" },
        ].map((s, i) => (
          <div key={s.label} style={{ background: `${s.color}0c`, border: `1px solid ${s.color}22`, borderRadius: 16, padding: "14px 10px", textAlign: "center", animation: `slideUp 0.4s ease ${i * 0.07}s both` }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 8, letterSpacing: 2, color: "#ffffff30", fontFamily: "'Orbitron', monospace", marginTop: 3 }}>{s.unit}</div>
          </div>
        ))}
      </div>

      {/* ── SKILL SUMMARY ── */}
      <div style={{ background: "#ffffff07", border: "1px solid #ffffff10", borderRadius: 20, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff35", fontFamily: "'Orbitron', monospace", marginBottom: 16 }}>SKILL SUMMARY</div>
        {SKILL_TREES.map((skill, i) => {
          const catHabits = habits.filter(h => h.category === skill.name);
          const earned = Math.min(skill.max, skill.level + Math.floor(catHabits.reduce((s, h) => s + h.streak, 0) / 3));
          return (
            <div key={skill.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < SKILL_TREES.length - 1 ? 14 : 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${skill.color}18`, border: `1px solid ${skill.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{skill.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{skill.name}</span>
                  <span style={{ fontSize: 10, color: skill.color, fontFamily: "'Orbitron', monospace" }}>LV {earned}</span>
                </div>
                <div style={{ height: 4, background: "#ffffff08", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(earned / skill.max) * 100}%`, background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)`, borderRadius: 2, transition: "width 0.8s ease", boxShadow: `0 0 6px ${skill.color}44` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── EQUIPPED BADGES ── */}
      <div style={{ background: "#ffffff07", border: "1px solid #ffffff10", borderRadius: 20, padding: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff35", fontFamily: "'Orbitron', monospace", marginBottom: 16 }}>EQUIPPED BADGES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            ...ACHIEVEMENTS,
            { name: "On Fire",      rarity: streak >= 3 ? "epic"      : null, icon: "🔥" },
            { name: "Week Warrior", rarity: streak >= 7 ? "legendary" : null, icon: "⚔️" },
            { name: "Dedicated",    rarity: totalEver >= 10 ? "rare"   : null, icon: "💪" },
          ].map((a, i) => {
            const unlocked = !!a.rarity;
            const style = unlocked ? RARITY_COLORS[a.rarity] : null;
            return (
              <div key={i} style={{ borderRadius: 16, padding: "14px 8px", textAlign: "center", background: unlocked ? style.bg : "#ffffff06", border: `1px solid ${unlocked ? style.border + "44" : "#ffffff08"}`, boxShadow: unlocked ? `0 0 16px ${style.glow}` : "none", filter: unlocked ? "none" : "grayscale(1) opacity(0.3)", transition: "all 0.3s" }}>
                <div style={{ fontSize: 26, marginBottom: 5 }}>{a.icon}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: unlocked ? "#fff" : "#ffffff30" }}>{a.name}</div>
                {unlocked && <div style={{ fontSize: 8, color: "#ffffff60", marginTop: 2, letterSpacing: 1 }}>{a.rarity.toUpperCase()}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── WEEKLY SUMMARY ── */}
      {(() => {
        const today = new Date();
        const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
        const completedToday = habits.filter(h => h.completed).length;
        const totalHabits = habits.length;
        const rate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
        const weekXp = (xpLog || []).reduce((s, e) => s + (e.xp || 0), 0);
        const totalNotes = (xpLog || []).filter(e => e.note).length;
        return (
          <div style={{ margin: "0 16px 16px" }}>
            <div style={{ background: "linear-gradient(135deg, #1a0f2e, #0f1a2e)", border: `1px solid ${TC}30`, borderRadius: 20, padding: 18, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, #F59E0B18 0%, transparent 70%)" }} />
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#F59E0B", fontFamily: "'Orbitron', monospace", marginBottom: 14 }}>📅 THIS WEEK</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { label: "DAY", value: `${dayOfWeek + 1}/7`, color: TC },
                  { label: "TODAY", value: `${rate}%`, color: rate >= 80 ? "#10B981" : rate >= 50 ? "#F59E0B" : "#EF4444" },
                  { label: "WEEK XP", value: weekXp, color: "#F59E0B" },
                  { label: "NOTES", value: totalNotes, color: "#06B6D4" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center", background: `${s.color}0c`, border: `1px solid ${s.color}20`, borderRadius: 12, padding: "10px 4px" }}>
                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 7, color: "#ffffff30", letterSpacing: 2, marginTop: 3, fontFamily: "'Orbitron', monospace" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Day progress bar */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {["M","T","W","T","F","S","S"].map((d, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: "100%", height: 28, borderRadius: 6, background: i < dayOfWeek ? "#8B5CF644" : i === dayOfWeek ? "#8B5CF6" : "#ffffff08", border: `1px solid ${i === dayOfWeek ? "#8B5CF6" : "#ffffff08"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {i < dayOfWeek && <span style={{ fontSize: 10 }}>✓</span>}
                        {i === dayOfWeek && <span style={{ fontSize: 9, color: "#fff", fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>•</span>}
                      </div>
                      <div style={{ fontSize: 7, color: i === dayOfWeek ? "#8B5CF6" : "#ffffff25", fontFamily: "'Orbitron', monospace" }}>{d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── SHARE & CHALLENGE BUTTONS ── */}
      <div style={{ margin: "0 16px 16px", display: "flex", gap: 10 }}>
        <button onClick={shareCard}
          style={{ flex: 1, padding: "13px 8px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${TC}, ${TC2})`, color: "#fff", fontFamily: "'Orbitron', monospace", fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: `0 0 20px ${TC}44` }}>
          📤 SHARE CARD
        </button>
        <button onClick={generateChallengeLink}
          style={{ flex: 1, padding: "13px 8px", borderRadius: 14, border: `1px solid ${TC}44`, background: `${TC}12`, color: TC, fontFamily: "'Orbitron', monospace", fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          🤝 CHALLENGE
        </button>
      </div>

      {/* ── FRIEND CHALLENGE MODAL ── */}
      {showChallenge && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 430, background: "linear-gradient(135deg, #0f0f1a, #1a1a2e)", border: `1px solid ${TC}44`, borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", animation: "modalIn 0.3s ease" }}>
            <div style={{ width: 40, height: 4, background: "#ffffff20", borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🤝</div>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, letterSpacing: 3, color: TC }}>CHALLENGE A FRIEND</div>
              <div style={{ fontSize: 13, color: "#ffffff50", marginTop: 6, fontFamily: "'Rajdhani', sans-serif" }}>Share this link and race to build better habits!</div>
            </div>
            {/* Stats being challenged */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                { label: "LEVEL", value: level, color: TC },
                { label: "STREAK", value: `${streak}🔥`, color: "#EF4444" },
                { label: "HABITS", value: habits.length, color: TC2 },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, textAlign: "center", background: `${s.color}0c`, border: `1px solid ${s.color}22`, borderRadius: 12, padding: "10px 4px" }}>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 8, color: "#ffffff30", letterSpacing: 2, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {/* Link box */}
            <div style={{ background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 12, padding: "12px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, fontSize: 11, color: "#ffffff60", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{challengeLink}</div>
              <button onClick={() => { navigator.clipboard.writeText(challengeLink); }}
                style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: TC, color: "#fff", fontFamily: "'Orbitron', monospace", fontSize: 9, fontWeight: 700, letterSpacing: 1, cursor: "pointer", flexShrink: 0 }}>
                COPY
              </button>
            </div>
            {/* Share via */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[
                { label: "WhatsApp", color: "#25D366", emoji: "💬", url: `https://wa.me/?text=${encodeURIComponent(`I'm Level ${level} on Ascend! Can you beat my ${streak}-day streak? ${challengeLink}`)}` },
                { label: "Twitter",  color: "#1DA1F2", emoji: "🐦", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I'm Level ${level} on Ascend with a ${streak}-day streak! Challenge me 🔥 ${challengeLink}`)}` },
              ].map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${s.color}44`, background: `${s.color}12`, color: s.color, fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {s.emoji} {s.label}
                </a>
              ))}
            </div>
            <button onClick={() => setShowChallenge(false)}
              style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid #ffffff15", background: "transparent", color: "#ffffff50", fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* ── XP HISTORY LOG ── */}
      <div style={{ margin: "0 16px 24px" }}>
        <div style={{ background: "#ffffff05", border: "1px solid #ffffff0a", borderRadius: 20, padding: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff35", fontFamily: "'Orbitron', monospace", marginBottom: 14 }}>⚡ XP HISTORY</div>
          {(!xpLog || xpLog.length === 0) ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📜</div>
              <div style={{ fontSize: 12, color: "#ffffff25", fontFamily: "'Rajdhani', sans-serif" }}>Complete habits to see your XP history</div>
            </div>
          ) : (
            xpLog.slice(0, 15).map((entry, i) => (
              <div key={entry.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: i < xpLog.length - 1 ? 12 : 0, marginBottom: i < xpLog.length - 1 ? 12 : 0, borderBottom: i < Math.min(xpLog.length, 15) - 1 ? "1px solid #ffffff08" : "none", animation: `slideUp 0.3s ease ${i * 0.04}s both` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${TC}15`, border: `1px solid ${TC}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{entry.habitIcon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.habitName}</div>
                  {entry.note && <div style={{ fontSize: 11, color: "#ffffff40", marginTop: 2, lineHeight: 1.4, fontStyle: "italic" }}>"{entry.note}"</div>}
                  <div style={{ fontSize: 10, color: "#ffffff25", marginTop: 2, fontFamily: "'Orbitron', monospace" }}>{entry.date} · {entry.time}</div>
                </div>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, fontWeight: 700, color: "#F59E0B", flexShrink: 0 }}>+{entry.xp}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
function SettingsModal({ username, setUsername, userProfile, setUserProfile, onClose, onReset, onLogout }) {
  const [localName, setLocalName] = useState(username);
  const [localProfile, setLocalProfile] = useState({ ...userProfile });
  const fileInputRef = useRef(null);

  // Compute age from DOB
  const computeAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };
  const age = computeAge(localProfile.dob);

  const avatars = ["⚔️", "🧙", "🦸", "🥷", "🧝", "🤺", "🦊", "🐉", "🦅", "🌟"];
  const themes = [
    { id: "purple", label: "Void",    a: "#8B5CF6", b: "#06B6D4" },
    { id: "fire",   label: "Inferno", a: "#EF4444", b: "#F59E0B" },
    { id: "nature", label: "Forest",  a: "#10B981", b: "#06B6D4" },
    { id: "gold",   label: "Gold",    a: "#F59E0B", b: "#FBBF24" },
    { id: "pink",   label: "Sakura",  a: "#EC4899", b: "#8B5CF6" },
  ];

  const handleGallery = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLocalProfile(p => ({ ...p, avatar: null, avatarImg: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (localName.trim()) setUsername(localName.trim());
    setUserProfile(localProfile);
    onClose();
  };

  const Toggle = ({ optKey, label, icon }) => (
    <div onClick={() => setLocalProfile(p => ({ ...p, [optKey]: !p[optKey] }))}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: "1px solid #ffffff08", cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: "'Rajdhani', sans-serif" }}>{label}</span>
      </div>
      <div style={{ width: 44, height: 24, borderRadius: 12, background: localProfile[optKey] ? "#8B5CF6" : "#ffffff15", position: "relative", transition: "background 0.3s", boxShadow: localProfile[optKey] ? "0 0 10px #8B5CF666" : "none" }}>
        <div style={{ position: "absolute", top: 3, left: localProfile[optKey] ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.3s" }} />
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", backdropFilter: "blur(8px)", zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 430, background: "linear-gradient(135deg, #0f0f1a, #1a1a2e)", border: "1px solid #8B5CF644", borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", animation: "modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)", maxHeight: "92vh", overflowY: "auto" }}>

        {/* Handle + header */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ width: 40, height: 4, background: "#ffffff20", borderRadius: 2, margin: "0 auto 16px" }} />
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, letterSpacing: 3, color: "#8B5CF6" }}>⚙ SETTINGS</div>
        </div>

        {/* ── HERO NAME ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff40", fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>HERO NAME</div>
          <input value={localName} onChange={e => setLocalName(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #8B5CF633", background: "#ffffff08", color: "#fff", fontSize: 15, fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, outline: "none" }} />
        </div>

        {/* ── DATE OF BIRTH ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff40", fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>DATE OF BIRTH</div>
          <div style={{ position: "relative" }}>
            <input type="date" value={localProfile.dob || ""}
              max={new Date().toISOString().split("T")[0]}
              onChange={e => setLocalProfile(p => ({ ...p, dob: e.target.value }))}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #8B5CF633", background: "#ffffff08", color: localProfile.dob ? "#fff" : "#ffffff40", fontSize: 15, fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, outline: "none", colorScheme: "dark" }} />
          </div>
          {age !== null && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ padding: "4px 14px", borderRadius: 20, background: "#8B5CF622", border: "1px solid #8B5CF644", fontSize: 12, color: "#8B5CF6", fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>
                {age} years old
              </div>
              {age < 18 && <span style={{ fontSize: 11, color: "#F59E0B" }}>⚡ Young warrior!</span>}
              {age >= 18 && <span style={{ fontSize: 11, color: "#10B981" }}>🔥 Prime ascender!</span>}
            </div>
          )}
        </div>

        {/* ── GENDER ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff40", fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>GENDER</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ id: "Male", icon: "♂", color: "#06B6D4" }, { id: "Female", icon: "♀", color: "#EC4899" }].map(g => (
              <button key={g.id} onClick={() => setLocalProfile(p => ({ ...p, gender: g.id }))}
                style={{ flex: 1, padding: "14px 0", borderRadius: 14, border: `2px solid ${localProfile.gender === g.id ? g.color : "#ffffff15"}`, background: localProfile.gender === g.id ? `${g.color}18` : "transparent", color: localProfile.gender === g.id ? g.color : "#ffffff40", fontSize: 22, cursor: "pointer", transition: "all 0.25s", boxShadow: localProfile.gender === g.id ? `0 0 16px ${g.color}44` : "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 26 }}>{g.icon}</span>
                <span style={{ fontSize: 11, fontFamily: "'Orbitron', monospace", letterSpacing: 2 }}>{g.id.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── AVATAR ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff40", fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>AVATAR</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {avatars.map(av => {
              const isSelected = localProfile.avatar === av && !localProfile.avatarImg;
              return (
                <button key={av} onClick={() => setLocalProfile(p => ({ ...p, avatar: av, avatarImg: null }))}
                  style={{ width: 44, height: 44, borderRadius: 12, border: `2px solid ${isSelected ? "#8B5CF6" : "#ffffff10"}`, background: isSelected ? "#8B5CF622" : "#ffffff06", fontSize: 21, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", boxShadow: isSelected ? "0 0 12px #8B5CF666" : "none" }}>
                  {av}
                </button>
              );
            })}
            {/* Gallery button */}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleGallery} style={{ display: "none" }} />
            <button onClick={() => fileInputRef.current?.click()}
              style={{ width: 44, height: 44, borderRadius: 12, border: `2px solid ${localProfile.avatarImg ? "#F59E0B" : "#ffffff15"}`, background: localProfile.avatarImg ? "#F59E0B15" : "#ffffff06", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", overflow: "hidden", position: "relative", boxShadow: localProfile.avatarImg ? "0 0 12px #F59E0B66" : "none" }}>
              {localProfile.avatarImg
                ? <img src={localProfile.avatarImg} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                : <span style={{ fontSize: 20 }}>🖼</span>}
            </button>
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: "#ffffff25", fontFamily: "'Rajdhani', sans-serif" }}>Tap 🖼 to upload from gallery</div>
        </div>

        {/* ── THEME ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff40", fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>THEME</div>
          <div style={{ display: "flex", gap: 8 }}>
            {themes.map(t => (
              <button key={t.id} onClick={() => setLocalProfile(p => ({ ...p, theme: t.id }))}
                style={{ flex: 1, padding: "10px 4px", borderRadius: 12, border: `2px solid ${localProfile.theme === t.id ? t.a : "#ffffff10"}`, background: localProfile.theme === t.id ? `${t.a}22` : "#ffffff06", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: 26, height: 10, borderRadius: 5, background: `linear-gradient(90deg, ${t.a}, ${t.b})`, boxShadow: localProfile.theme === t.id ? `0 0 8px ${t.a}` : "none" }} />
                <div style={{ fontSize: 8, color: localProfile.theme === t.id ? t.a : "#ffffff30", fontFamily: "'Orbitron', monospace", letterSpacing: 1 }}>{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── PREFERENCES ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff40", fontFamily: "'Orbitron', monospace", marginBottom: 4 }}>PREFERENCES</div>
          <Toggle optKey="soundEnabled"    label="Sound Effects"  icon="🔊" />
          <Toggle optKey="reminderEnabled" label="Daily Reminder" icon="🔔" />
          {localProfile.reminderEnabled && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", marginBottom: 4, background: "#ffffff06", borderRadius: 12, border: "1px solid #06B6D422" }}>
              <span style={{ fontSize: 16 }}>⏰</span>
              <span style={{ flex: 1, fontSize: 13, color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>Reminder Time</span>
              <input
                type="time"
                value={localProfile.reminderTime || "08:00"}
                onChange={e => setLocalProfile(p => ({ ...p, reminderTime: e.target.value }))}
                style={{ background: "#ffffff10", border: "1px solid #06B6D444", borderRadius: 8, padding: "5px 10px", color: "#06B6D4", fontFamily: "'Orbitron', monospace", fontSize: 12, fontWeight: 700, outline: "none", cursor: "pointer" }}
              />
            </div>
          )}
          <Toggle optKey="showStreakAlert" label="Streak Alerts"  icon="🔥" />
        </div>

        {/* ── SAVE / CANCEL ── */}
        <button onClick={save} style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", color: "#fff", fontFamily: "'Orbitron', monospace", fontSize: 12, fontWeight: 700, letterSpacing: 2, cursor: "pointer", marginBottom: 10, boxShadow: "0 0 20px #8B5CF644" }}>
          SAVE CHANGES
        </button>
        <button onClick={onClose} style={{ width: "100%", padding: 12, borderRadius: 14, border: "1px solid #ffffff15", background: "transparent", color: "#ffffff50", fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>
          CANCEL
        </button>

        {/* ── LOGOUT ── */}
        <button onClick={onLogout}
          style={{ width: "100%", padding: 13, borderRadius: 14, border: "1px solid #F59E0B33", background: "#F59E0B0a", color: "#F59E0B", fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          🚪 LOG OUT
        </button>

        {/* ── DANGER ZONE ── */}
        <div style={{ padding: 16, borderRadius: 14, border: "1px solid #EF444422", background: "#EF44440a" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#EF4444", fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>⚠ DANGER ZONE</div>
          <button onClick={onReset} style={{ width: "100%", padding: 11, borderRadius: 10, border: "1px solid #EF444433", background: "transparent", color: "#EF4444", fontFamily: "'Orbitron', monospace", fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: "pointer" }}>
            RESET ALL DATA
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── BOSS MODAL ───────────────────────────────────────────────────────────────
function BossModal({ bossHp, onClose, habits, playBossDefeatSound }) {
  const boss = getWeeklyBoss();
  const hardCompleted = habits.filter(h => h.difficulty === "Hard" && h.completed).length;
  const hardTotal = habits.filter(h => h.difficulty === "Hard").length;
  const defeated = bossHp === 0;

  useEffect(() => {
    if (defeated) {
      if (playBossDefeatSound) playBossDefeatSound();
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 }, colors: ["#F59E0B", boss.color, "#10B981"] });
      setTimeout(() => confetti({ particleCount: 100, spread: 80, origin: { y: 0.4 } }), 600);
    }
  }, [defeated]);

  if (defeated) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#000000dd", backdropFilter: "blur(8px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 390, background: "linear-gradient(135deg, #0f1a0f, #1a1a0f)", border: "1px solid #F59E0B66", borderRadius: 24, padding: 28, animation: "slideUp 0.4s ease", textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 8 }}>💀</div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg, #F59E0B, #10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>BOSS SLAIN!</div>
          <div style={{ fontSize: 13, color: "#ffffff60", marginBottom: 24 }}>{boss.name} has been defeated!</div>
          <div style={{ background: "linear-gradient(135deg, #F59E0B22, #10B98122)", border: "1px solid #F59E0B55", borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🏆</div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, color: "#F59E0B", fontWeight: 700, marginBottom: 6, letterSpacing: 2 }}>VICTORY REWARDS</div>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Orbitron', monospace", color: "#10B981", marginBottom: 4 }}>+500 XP</div>
            <div style={{ fontSize: 12, color: "#ffffff50" }}>Legendary Badge · Weekly Champion</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {["👑", "⚔️", "🔥"].map((icon, i) => (
              <div key={i} style={{ flex: 1, background: `linear-gradient(135deg, #F59E0B, ${boss.color})`, borderRadius: 12, padding: "12px 0", fontSize: 24, boxShadow: "0 0 20px #F59E0B44" }}>{icon}</div>
            ))}
          </div>
          <button onClick={onClose} style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #10B981, #06B6D4)", color: "#fff", fontFamily: "'Orbitron', monospace", fontSize: 13, fontWeight: 700, letterSpacing: 2, cursor: "pointer", boxShadow: "0 0 30px #10B98144" }}>
            CLAIM VICTORY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", backdropFilter: "blur(8px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 390, background: "linear-gradient(135deg, #0f0f1a, #1a0f1a)", border: `1px solid ${boss.color}44`, borderRadius: 24, padding: 24, animation: "slideUp 0.4s ease" }}>
        {/* Boss header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 64, animation: bossHp > 50 ? "bossShake 2s ease-in-out infinite" : "pulse 1s ease-in-out infinite" }}>{boss.icon}</div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 18, fontWeight: 900, color: boss.color, marginTop: 8, letterSpacing: 1 }}>{boss.name}</div>
          <div style={{ fontSize: 10, color: "#ffffff40", marginTop: 4, fontFamily: "'Orbitron', monospace", letterSpacing: 2 }}>WEEK {Math.floor(Date.now() / (7*24*60*60*1000)) % 52 + 1} BOSS</div>
        </div>
        {/* Trait card */}
        <div style={{ background: `${boss.color}12`, border: `1px solid ${boss.color}33`, borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <span style={{ fontSize: 11, color: `${boss.color}dd`, fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontStyle: "italic" }}>{boss.trait}</span>
        </div>
        {/* HP bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, letterSpacing: 2, color: boss.color, fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>
            <span>BOSS HP</span><span style={{ color: bossHp < 30 ? "#F59E0B" : boss.color }}>{bossHp}%</span>
          </div>
          <div style={{ height: 12, background: "#ffffff10", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${bossHp}%`, background: bossHp < 30 ? "linear-gradient(90deg, #F59E0B, #EF4444)" : `linear-gradient(90deg, ${boss.color}, ${boss.color}88)`, transition: "width 1s ease", borderRadius: 6, boxShadow: `0 0 15px ${bossHp < 30 ? "#F59E0B88" : boss.color + "88"}` }} />
          </div>
          {bossHp < 30 && <div style={{ fontSize: 10, color: "#F59E0B", fontFamily: "'Orbitron', monospace", marginTop: 6, letterSpacing: 2, animation: "pulse 1s ease-in-out infinite" }}>⚠ BOSS IS WEAKENING...</div>}
        </div>
        {/* Hard habits progress */}
        <div style={{ background: "#ffffff08", borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#ffffff60", marginBottom: 8 }}>HARD HABITS DEFEATED</div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 900, color: hardCompleted === hardTotal && hardTotal > 0 ? "#10B981" : "#fff" }}>{hardCompleted}<span style={{ fontSize: 16, color: "#ffffff40" }}>/{hardTotal}</span></div>
          <div style={{ marginTop: 8, height: 4, background: "#ffffff10", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${hardTotal > 0 ? (hardCompleted / hardTotal) * 100 : 0}%`, background: "linear-gradient(90deg, #10B981, #06B6D4)", borderRadius: 2, transition: "width 0.6s ease" }} />
          </div>
          <div style={{ fontSize: 12, color: "#ffffff40", marginTop: 6 }}>Complete all Hard habits to slay the boss!</div>
        </div>
        {/* Reward */}
        <div style={{ display: "flex", gap: 8, padding: 12, background: "#F59E0B15", border: "1px solid #F59E0B44", borderRadius: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 20 }}>🏆</span>
          <div>
            <div style={{ fontSize: 12, color: "#F59E0B", fontWeight: 700 }}>BOSS KILL REWARD</div>
            <div style={{ fontSize: 11, color: "#ffffff60" }}>+500 XP · Legendary Badge · Weekly Champion</div>
          </div>
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${boss.color}, #8B5CF6)`, color: "#fff", fontFamily: "'Orbitron', monospace", fontSize: 13, fontWeight: 700, letterSpacing: 2, cursor: "pointer" }}>
          BACK TO BATTLE
        </button>
      </div>
    </div>
  );
}

// ─── ADD HABIT MODAL ──────────────────────────────────────────────────────────
function AddHabitModal({ newHabit, setNewHabit, onClose, onSave }) {
  const icons = ["⭐", "🧘", "🌊", "📖", "⚡", "✍️", "🏃", "💪", "🧠", "💰", "🎯", "🌅"];
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", backdropFilter: "blur(8px)", zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 430, background: "linear-gradient(135deg, #0f0f1a, #1a1a2e)", border: "1px solid #8B5CF644", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", animation: "modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 40, height: 4, background: "#ffffff20", borderRadius: 2, margin: "0 auto 16px" }} />
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, letterSpacing: 3, color: "#8B5CF6" }}>NEW MISSION</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 16 }}>
          {icons.map(ic => (
            <button key={ic} onClick={() => setNewHabit(p => ({ ...p, icon: ic }))} style={{ padding: "10px 0", borderRadius: 12, border: `2px solid ${newHabit.icon === ic ? "#8B5CF6" : "transparent"}`, background: newHabit.icon === ic ? "#8B5CF620" : "#ffffff08", fontSize: 22, cursor: "pointer" }}>{ic}</button>
          ))}
        </div>
        <input placeholder="Habit name..." value={newHabit.name} onChange={e => setNewHabit(p => ({ ...p, name: e.target.value }))} style={{ width: "100%", background: "#ffffff08", border: "1px solid #ffffff20", borderRadius: 12, padding: "14px 16px", color: "#fff", fontSize: 16, fontFamily: "'Rajdhani', sans-serif", marginBottom: 12, outline: "none" }} />
        {/* CATEGORY */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#ffffff40", marginBottom: 6 }}>CATEGORY</div>
          <select value={newHabit.category} onChange={e => setNewHabit(p => ({ ...p, category: e.target.value }))} style={{ width: "100%", background: "#0f0f1a", border: "1px solid #ffffff20", borderRadius: 10, padding: "10px 12px", color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: 14 }}>
            {["Mind", "Body", "Wealth", "Discipline", "Social"].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        {/* TIME SLOT — between Category and Difficulty */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#ffffff40", marginBottom: 8 }}>TIME SLOT</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { key: "morning",   label: "🌅 Morning",   time: "07:00 AM", color: "#F59E0B" },
              { key: "afternoon", label: "☀️ Afternoon", time: "01:00 PM", color: "#06B6D4" },
              { key: "evening",   label: "🌙 Evening",   time: "08:00 PM", color: "#8B5CF6" },
            ].map(s => {
              const t = newHabit.time || "";
              const hour = parseInt(t.split(":")[0]) || 0;
              const isPM = t.includes("PM");
              const h24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
              const selected = h24 < 12 ? s.key === "morning" : h24 < 17 ? s.key === "afternoon" : s.key === "evening";
              return (
                <button key={s.key} onClick={() => setNewHabit(p => ({ ...p, time: s.time }))}
                  style={{ flex: 1, padding: "11px 4px", borderRadius: 12, border: `2px solid ${selected ? s.color : "#ffffff12"}`, background: selected ? `${s.color}18` : "#ffffff06", color: selected ? s.color : "#ffffff45", fontSize: 11, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* DIFFICULTY */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#ffffff40", marginBottom: 6 }}>DIFFICULTY</div>
          <select value={newHabit.difficulty} onChange={e => setNewHabit(p => ({ ...p, difficulty: e.target.value }))} style={{ width: "100%", background: "#0f0f1a", border: "1px solid #ffffff20", borderRadius: 10, padding: "10px 12px", color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: 14 }}>
            {["Easy", "Medium", "Hard"].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 16, borderRadius: 14, border: "1px solid #ffffff20", background: "transparent", color: "#ffffff60", fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>CANCEL</button>
          <button onClick={onSave} disabled={!newHabit.name} style={{ flex: 2, padding: 16, borderRadius: 14, border: "none", background: newHabit.name ? "linear-gradient(135deg, #8B5CF6, #06B6D4)" : "#ffffff20", color: "#fff", fontFamily: "'Orbitron', monospace", fontSize: 12, fontWeight: 700, letterSpacing: 2, cursor: newHabit.name ? "pointer" : "default" }}>
            ACTIVATE
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ screen, setScreen, TC = "#8B5CF6" }) {
  const tabs = [
    { id: "home", icon: "⚔️", label: "BASE" },
    { id: "skills", icon: "🌳", label: "SKILLS" },
    { id: "analytics", icon: "📊", label: "STATS" },
    { id: "focus", icon: "🎯", label: "FOCUS" },
    { id: "profile", icon: "👤", label: "HERO" },
  ];

  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#0a0a14ee", backdropFilter: "blur(20px)", borderTop: `1px solid ${TC}22`, padding: "12px 20px 20px", zIndex: 100 }}>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        {tabs.map(tab => (
          <button key={tab.id} className="nav-btn" onClick={() => setScreen(tab.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, border: "none", cursor: "pointer", padding: "6px 12px", borderRadius: 12, transition: "all 0.3s", background: screen === tab.id ? `${TC}22` : "transparent" }}>
            <span style={{ fontSize: 20, filter: screen === tab.id ? `drop-shadow(0 0 8px ${TC})` : "grayscale(0.5) opacity(0.5)" }}>{tab.icon}</span>
            <span style={{ fontSize: 8, letterSpacing: 2, color: screen === tab.id ? TC : "#ffffff30", fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}