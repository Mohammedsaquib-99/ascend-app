import { useState } from "react";

// ─── PASTE THIS to replace your HomeScreen function in App.jsx ───

function HomeScreen({ habits, xp, level, levelProgress, completedToday, totalToday, completeHabit, completedFlash, activeTab, setActiveTab, setShowBoss, setShowAddHabit, username, streak }) {
  const dailyXpEarned = habits.filter(h => h.completed).reduce((s, h) => s + h.xp, 0);
  const bossHp = 60; // pass this as a prop if you want it dynamic

  return (
    <div style={{ padding: "0 0 20px" }}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={{ position: "relative", padding: "52px 20px 20px", overflow: "hidden" }}>
        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(#8B5CF606 1px, transparent 1px), linear-gradient(90deg, #8B5CF606 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />
        {/* Top accent line */}
        <div style={{ position: "absolute", top: 0, left: 20, right: 20, height: 1, background: "linear-gradient(90deg, transparent, #8B5CF666, transparent)" }} />

        {/* Greeting row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#8B5CF6", fontFamily: "'Orbitron', monospace", marginBottom: 6, opacity: 0.8 }}>
              ASCEND // DAY 47
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, background: "linear-gradient(135deg, #fff 50%, #8B5CF6aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Good Morning,<br />{username || "Champion"}.
            </div>
            {/* Streak pill */}
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

          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 58, height: 58, borderRadius: "50%",
              background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, border: "2px solid #8B5CF644",
              animation: "glow 3s ease-in-out infinite"
            }}>⚔️</div>
            <div style={{
              position: "absolute", bottom: -3, right: -3,
              background: "linear-gradient(135deg, #F59E0B, #EF4444)",
              color: "#000", fontSize: 9, fontWeight: 900,
              fontFamily: "'Orbitron', monospace",
              borderRadius: 6, padding: "2px 5px", letterSpacing: 1
            }}>LV{level}</div>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 10, letterSpacing: 2, color: "#ffffff40", fontFamily: "'Orbitron', monospace" }}>
              LEVEL {level} — {Math.floor(levelProgress)}% COMPLETE
            </span>
            <span style={{ fontSize: 10, color: "#F59E0B", fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>
              {xp} XP
            </span>
          </div>
          <div style={{ height: 5, background: "#ffffff08", borderRadius: 3, overflow: "hidden", position: "relative" }}>
            <div style={{
              height: "100%", width: `${levelProgress}%`,
              background: "linear-gradient(90deg, #8B5CF6, #06B6D4, #8B5CF6)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s linear infinite",
              borderRadius: 3, transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)",
            }} />
          </div>
        </div>

        {/* ── STAT CARDS ───────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[
            { label: "TODAY'S XP", value: `+${dailyXpEarned}`, color: "#F59E0B", bg: "#F59E0B" },
            { label: "STREAK",     value: `${streak}🔥`,        color: "#EF4444", bg: "#EF4444" },
            { label: "MISSIONS",   value: `${completedToday}/${totalToday}`, color: "#06B6D4", bg: "#06B6D4" },
          ].map(s => (
            <div key={s.label} style={{
              background: `${s.bg}0c`,
              border: `1px solid ${s.bg}25`,
              borderRadius: 14, padding: "12px 8px", textAlign: "center",
              position: "relative", overflow: "hidden"
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${s.bg}88, transparent)`
              }} />
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 15, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 8, letterSpacing: 2, color: "#ffffff35", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WEEKLY BOSS ─────────────────────────────────────────── */}
      <div style={{ padding: "0 20px", marginBottom: 16 }}>
        <div
          onClick={() => setShowBoss(true)}
          style={{
            background: "linear-gradient(135deg, #EF444412, #F59E0B0a)",
            border: "1px solid #EF444430",
            borderRadius: 18, padding: "14px 16px",
            cursor: "pointer", position: "relative", overflow: "hidden",
            transition: "all 0.25s",
          }}
        >
          {/* Animated corner glow */}
          <div style={{
            position: "absolute", top: -30, right: -30, width: 90, height: 90,
            borderRadius: "50%", background: "radial-gradient(circle, #EF444428 0%, transparent 70%)",
            animation: "pulse 2s ease-in-out infinite"
          }} />

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 32, animation: "bossShake 3s ease-in-out infinite", flexShrink: 0 }}>👹</div>
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
              {/* HP bar */}
              <div style={{ marginTop: 8, height: 5, background: "#ffffff0d", borderRadius: 3 }}>
                <div style={{
                  height: "100%", width: `${100 - bossHp}%`,
                  background: "linear-gradient(90deg, #EF4444, #F59E0B)",
                  borderRadius: 3, transition: "width 0.8s ease",
                  boxShadow: "0 0 8px #EF444466"
                }} />
              </div>
              <div style={{ fontSize: 10, color: "#ffffff40", marginTop: 5 }}>Complete 5 Hard habits to defeat</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────────── */}
      <div style={{ padding: "0 20px", marginBottom: 14 }}>
        <div style={{ display: "flex", background: "#ffffff07", borderRadius: 12, padding: 3, border: "1px solid #ffffff08" }}>
          {["today", "weekly", "templates"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: "7px 0", borderRadius: 9, border: "none",
              background: activeTab === tab ? "#8B5CF6" : "transparent",
              color: activeTab === tab ? "#fff" : "#ffffff35",
              fontSize: 10, letterSpacing: 2.5,
              fontFamily: "'Orbitron', monospace", fontWeight: 700,
              cursor: "pointer", transition: "all 0.25s", textTransform: "uppercase",
              boxShadow: activeTab === tab ? "0 2px 12px #8B5CF666" : "none"
            }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── SECTION LABEL ───────────────────────────────────────── */}
      <div style={{ padding: "0 20px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 9, letterSpacing: 3, color: "#ffffff30", fontFamily: "'Orbitron', monospace" }}>
          {completedToday}/{totalToday} MISSIONS COMPLETE
        </span>
        {/* Mini progress dots */}
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: totalToday }).map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: i < completedToday ? "#8B5CF6" : "#ffffff15",
              transition: "background 0.3s",
              boxShadow: i < completedToday ? "0 0 6px #8B5CF6" : "none"
            }} />
          ))}
        </div>
      </div>

      {/* ── HABIT LIST ──────────────────────────────────────────── */}
      <div style={{ padding: "0 20px" }}>
        {habits.map((habit, i) => (
          <HabitCard key={habit.id} habit={habit} onComplete={completeHabit} flash={completedFlash === habit.id} delay={i * 50} />
        ))}

        {/* Add Mission Button */}
        <button
          onClick={() => setShowAddHabit(true)}
          style={{
            width: "100%", padding: "14px 0",
            border: "1px dashed #8B5CF633", borderRadius: 16,
            background: "transparent",
            color: "#8B5CF6", fontSize: 12,
            fontFamily: "'Orbitron', monospace", fontWeight: 700,
            letterSpacing: 3, cursor: "pointer", marginTop: 6,
            transition: "all 0.25s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#8B5CF610"; e.currentTarget.style.borderColor = "#8B5CF666"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#8B5CF633"; }}
        >
          + ADD MISSION
        </button>
      </div>
    </div>
  );
}

// ─── IMPROVED HabitCard ─────────────────────────────────────────────────────
// Replace your existing HabitCard with this one

function HabitCard({ habit, onComplete, flash }) {
  const diffColors  = { Easy: "#10B981", Medium: "#F59E0B", Hard: "#EF4444" };
  const diffBg      = { Easy: "#10B98115", Medium: "#F59E0B15", Hard: "#EF444415" };
  const catColors   = { Mind: "#8B5CF6", Body: "#06B6D4", Wealth: "#F59E0B", Discipline: "#EF4444", Social: "#10B981" };

  const accent = catColors[habit.category] || "#8B5CF6";

  return (
    <div
      className="habit-card"
      style={{
        background: habit.completed ? `${accent}0a` : "#ffffff06",
        border: `1px solid ${habit.completed ? `${accent}33` : "#ffffff0d"}`,
        borderRadius: 18, padding: "14px 16px", marginBottom: 10,
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        transform: flash ? "scale(1.02)" : "scale(1)",
        boxShadow: flash
          ? `0 0 28px ${accent}55, 0 4px 20px ${accent}22`
          : habit.completed
            ? `0 0 12px ${accent}15`
            : "0 2px 8px #00000030",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 8, bottom: 8, width: 3,
        borderRadius: "0 3px 3px 0",
        background: habit.completed
          ? `linear-gradient(180deg, ${accent}, ${accent}44)`
          : `${accent}30`,
        transition: "all 0.3s"
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 8 }}>
        {/* Icon */}
        <div style={{
          width: 46, height: 46, borderRadius: 13,
          background: `${accent}18`,
          border: `1px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, flexShrink: 0,
          opacity: habit.completed ? 0.5 : 1,
          transition: "opacity 0.3s"
        }}>
          {habit.icon}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 14,
            textDecoration: habit.completed ? "line-through" : "none",
            color: habit.completed ? "#ffffff40" : "#fff",
            marginBottom: 5, transition: "color 0.3s",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>
            {habit.name}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {/* Category pill */}
            <span style={{
              fontSize: 9, letterSpacing: 1.5,
              color: accent, fontFamily: "'Orbitron', monospace",
              background: `${accent}15`, padding: "2px 7px", borderRadius: 6
            }}>
              {habit.category.toUpperCase()}
            </span>
            {/* Difficulty pill */}
            <span style={{
              fontSize: 9, letterSpacing: 1,
              color: diffColors[habit.difficulty],
              background: diffBg[habit.difficulty],
              padding: "2px 7px", borderRadius: 6,
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700
            }}>
              {habit.difficulty.toUpperCase()}
            </span>
            {/* Streak */}
            {habit.streak > 0 && (
              <span style={{ fontSize: 11, color: "#ffffff35" }}>🔥 {habit.streak}</span>
            )}
          </div>
        </div>

        {/* XP + Complete button */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <div style={{
            fontSize: 11, color: "#F59E0B",
            fontFamily: "'Orbitron', monospace", fontWeight: 700,
            opacity: habit.completed ? 0.4 : 1
          }}>
            +{habit.xp}
          </div>
          <button
            onClick={(e) => onComplete(habit.id, e)}
            style={{
              width: 34, height: 34, borderRadius: "50%",
              border: `2px solid ${habit.completed ? accent : "#ffffff20"}`,
              background: habit.completed
                ? `linear-gradient(135deg, ${accent}, ${accent}88)`
                : `${accent}10`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: habit.completed ? "default" : "pointer",
              transition: "all 0.3s", color: "#fff", fontSize: 15,
              boxShadow: habit.completed ? `0 0 14px ${accent}55` : "none"
            }}
          >
            {habit.completed ? "✓" : "○"}
          </button>
        </div>
      </div>

      {/* Bottom progress bar (streak) */}
      {habit.streak > 0 && (
        <div style={{ marginTop: 12, paddingLeft: 8 }}>
          <div style={{ height: 2, background: "#ffffff08", borderRadius: 1, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.min(100, (habit.streak / 30) * 100)}%`,
              background: `linear-gradient(90deg, ${accent}, ${accent}55)`,
              borderRadius: 1, transition: "width 0.6s ease"
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
