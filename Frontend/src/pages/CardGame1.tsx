import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import { useRecoilState } from "recoil"
import { score as scoreAtom } from "../atoms/flashcardreading/score"
import { playChime, playThunder, setMuted, isMuted } from "../utils/sound"
import { api } from "../api/client"

function awardGameXp(xpGained: number) {
  void api("/srs/ping", {
    method: "POST",
    body: { xpGained, source: "game1" },
  }).catch(() => {
    /* offline / unauthenticated demo — ignore */
  })
}

type Round = {
  prompt: string
  reading: string
  meaning: string
  options: string[]
  correct: string
}

const ROUNDS: Round[] = [
  { prompt: "三", reading: "さん", meaning: "three", options: ["One", "Two", "Three", "Four", "Five", "Six"], correct: "Three" },
  { prompt: "一", reading: "いち", meaning: "one", options: ["One", "Seven", "Three", "Eight", "Five", "Nine"], correct: "One" },
  { prompt: "五", reading: "ご", meaning: "five", options: ["Two", "Four", "Five", "Six", "Eight", "Ten"], correct: "Five" },
  { prompt: "月", reading: "つき", meaning: "moon", options: ["Sun", "Moon", "Star", "Fire", "Water", "Tree"], correct: "Moon" },
  { prompt: "水", reading: "みず", meaning: "water", options: ["Fire", "Wind", "Water", "Earth", "Metal", "Wood"], correct: "Water" },
]

const CLOUD_SHADOW = "drop-shadow(0 12px 18px rgba(60,90,120,0.28))"

/* ----------------------------- Cloud visual ----------------------------- */
function CloudBody({ word, storm = false }: { word: string; storm?: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ filter: CLOUD_SHADOW }}>
      <svg width="150" height="92" viewBox="0 0 150 92" className="block">
        <defs>
          <linearGradient id={`cg-${storm ? "storm" : "day"}`} x1="0" y1="0" x2="0" y2="1">
            {storm ? (
              <>
                <stop offset="0%" stopColor="#8a93a6" />
                <stop offset="100%" stopColor="#5b6475" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#dceafe" />
              </>
            )}
          </linearGradient>
        </defs>
        <g fill={`url(#cg-${storm ? "storm" : "day"})`}>
          <ellipse cx="45" cy="58" rx="42" ry="30" />
          <ellipse cx="95" cy="58" rx="46" ry="32" />
          <circle cx="55" cy="40" r="26" />
          <circle cx="90" cy="34" r="30" />
          <circle cx="112" cy="48" r="22" />
        </g>
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-anglo-japanese text-xl font-semibold ${
          storm ? "text-white/90" : "text-[#22415a]"
        }`}
      >
        {word}
      </span>
    </div>
  )
}

/* --------------------------- Draggable cloud --------------------------- */
function AnswerCloud({ id, word, removed }: { id: string; word: string; removed: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled: removed })

  if (removed) {
    return <div className="h-[92px] w-[150px] opacity-0" aria-hidden />
  }

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 60 } : undefined}
      className={`relative touch-none select-none outline-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <motion.div
        animate={isDragging ? { y: 0 } : { y: [0, -8, 0] }}
        transition={isDragging ? { duration: 0 } : { duration: 3 + (id.length % 3), repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.05 }}
      >
        <CloudBody word={word} />
      </motion.div>
    </button>
  )
}

/* ------------------------------- The orb ------------------------------- */
function Orb({
  prompt,
  reading,
  state,
}: {
  prompt: string
  reading: string
  state: "idle" | "good" | "bad"
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "orb" })

  const ring =
    state === "good"
      ? "0 0 90px 12px rgba(122,255,168,0.75)"
      : state === "bad"
        ? "0 0 90px 12px rgba(255,90,90,0.8)"
        : isOver
          ? "0 0 90px 16px rgba(150,200,255,0.85)"
          : "0 0 70px 6px rgba(130,170,255,0.55)"

  return (
    <div ref={setNodeRef} className="relative flex items-center justify-center">
      {/* outer aura */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 260, height: 260, boxShadow: ring }}
        animate={{ scale: isOver ? 1.12 : [1, 1.06, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* halo rings */}
      <motion.div
        className="absolute rounded-full border border-white/30"
        style={{ width: 230, height: 230 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute rounded-full border border-white/20"
        style={{ width: 190, height: 190 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      />

      {/* the sphere */}
      <motion.div
        className="relative flex h-40 w-40 sm:h-48 sm:w-48 items-center justify-center rounded-full overflow-hidden"
        style={{
          background:
            state === "good"
              ? "radial-gradient(circle at 32% 28%, #d6ffe6 0%, #47d98a 45%, #1f7a4d 100%)"
              : state === "bad"
                ? "radial-gradient(circle at 32% 28%, #ffd6d6 0%, #ff6b6b 45%, #7a1f1f 100%)"
                : "radial-gradient(circle at 32% 28%, #eaf2ff 0%, #7aa7ff 42%, #3b4db8 100%)",
        }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* swirling energy */}
        <motion.div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.5) 60deg, transparent 140deg, rgba(255,255,255,0.35) 220deg, transparent 300deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        {/* glossy highlight */}
        <div className="absolute left-6 top-5 h-12 w-16 rounded-full bg-white/50 blur-md" />
        {/* prompt */}
        <div className="relative z-10 flex flex-col items-center">
          <span className="font-japanese text-6xl sm:text-7xl text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] leading-none">
            {prompt}
          </span>
          <span className="mt-1 font-japanese text-base sm:text-lg text-white/90">{reading}</span>
        </div>
      </motion.div>

      {/* pedestal glow */}
      <div className="absolute -bottom-8 h-6 w-40 rounded-full bg-black/20 blur-xl" />
    </div>
  )
}

/* --------------------------- Lightning bolts --------------------------- */
function jaggedPath(x: number) {
  let d = `M ${x} 0`
  let y = 0
  let cx = x
  while (y < 100) {
    y += 8 + Math.random() * 12
    cx += (Math.random() - 0.5) * 14
    d += ` L ${cx} ${y}`
  }
  return d
}

function LightningStorm() {
  const bolts = useMemo(() => [15, 38, 60, 82].map((p) => jaggedPath(p + (Math.random() - 0.5) * 8)), [])
  return (
    <svg className="pointer-events-none absolute inset-0 z-40 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <filter id="boltGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {bolts.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke="#fdf6b2"
          strokeWidth={0.5}
          vectorEffect="non-scaling-stroke"
          filter="url(#boltGlow)"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: [0, 1, 0.2, 1, 0], pathLength: 1 }}
          transition={{ duration: 0.9, delay: i * 0.06 }}
        />
      ))}
    </svg>
  )
}

/* --------------------------- Cherry blossoms --------------------------- */
function Petal({ index }: { index: number }) {
  const left = Math.random() * 100
  const drift = 40 + Math.random() * 120
  const duration = 4 + Math.random() * 3
  const delay = Math.random() * 0.6
  const size = 12 + Math.random() * 12
  const spin = Math.random() > 0.5 ? 360 : -360
  return (
    <motion.div
      className="pointer-events-none fixed z-50"
      style={{ left: `${left}%`, top: "-6%" }}
      initial={{ opacity: 0 }}
      animate={{ y: "112vh", x: [0, drift * 0.5, drift], rotate: [0, spin], opacity: [0, 1, 1, 0.5] }}
      transition={{ duration, delay, ease: "easeInOut" }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path
          d="M12 2 C14 7 20 8 20 13 C20 17 16 19 12 22 C8 19 4 17 4 13 C4 8 10 7 12 2 Z"
          fill={index % 2 === 0 ? "#ffb7d5" : "#ff9ec4"}
          opacity="0.95"
        />
        <path d="M12 6 C13 9 15 10 15 13" stroke="#ff6fa5" strokeWidth="0.8" fill="none" opacity="0.6" />
      </svg>
    </motion.div>
  )
}

/* ------------------------------ Background ----------------------------- */
function DriftingClouds() {
  const layer = (top: string, size: number, dur: number, opacity: number, delay = 0) => (
    <motion.div
      className="pointer-events-none absolute"
      style={{ top }}
      initial={{ x: "-30%" }}
      animate={{ x: "130%" }}
      transition={{ duration: dur, repeat: Infinity, ease: "linear", delay }}
    >
      <svg width={size} height={size * 0.6} viewBox="0 0 150 92" style={{ opacity }}>
        <g fill="#ffffff">
          <ellipse cx="45" cy="58" rx="42" ry="26" />
          <ellipse cx="95" cy="58" rx="46" ry="28" />
          <circle cx="55" cy="42" r="24" />
          <circle cx="92" cy="36" r="28" />
        </g>
      </svg>
    </motion.div>
  )
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {layer("8%", 220, 55, 0.7)}
      {layer("24%", 150, 42, 0.55, 6)}
      {layer("46%", 280, 70, 0.5, 3)}
      {layer("62%", 120, 38, 0.45, 10)}
    </div>
  )
}

/* ------------------------------- Game ---------------------------------- */
export default function CardGame1() {
  const [roundIndex, setRoundIndex] = useState(0)
  const [removed, setRemoved] = useState<string[]>([])
  const [lives, setLives] = useState(3)
  const [combo, setCombo] = useState(0)
  const [message, setMessage] = useState("Drag the matching cloud into the orb")
  const [orbState, setOrbState] = useState<"idle" | "good" | "bad">("idle")
  const [effect, setEffect] = useState<"sakura" | "thunder" | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [won, setWon] = useState(false)
  const [muted, setMutedState] = useState(isMuted())
  const [score, setScore] = useRecoilState(scoreAtom)
  const shake = useAnimationControls()

  const round = ROUNDS[roundIndex]
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 90, tolerance: 8 } })
  )

  const options = useMemo(
    () => round.options.map((word, i) => ({ id: `opt-${roundIndex}-${i}`, word })),
    [round, roundIndex]
  )
  const topClouds = options.slice(0, 3)
  const bottomClouds = options.slice(3)
  const activeWord = options.find((o) => o.id === activeId)?.word

  useEffect(() => {
    setScore(0)
  }, [setScore])

  const resetAll = () => {
    setRoundIndex(0)
    setRemoved([])
    setLives(3)
    setCombo(0)
    setScore(0)
    setWon(false)
    setOrbState("idle")
    setEffect(null)
    setMessage("Drag the matching cloud into the orb")
  }

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (over?.id !== "orb") return

    const picked = options.find((o) => o.id === active.id)
    if (!picked || removed.includes(picked.id)) return

    const isCorrect = picked.word === round.correct
    setRemoved((prev) => [...prev, picked.id])

    if (isCorrect) {
      const gained = 15 + combo * 5
      setScore((s) => s + gained)
      setCombo((c) => c + 1)
      setOrbState("good")
      setEffect("sakura")
      setMessage(`正解! ${round.prompt} (${round.reading}) = ${round.meaning}  +${gained}`)
      playChime()
      awardGameXp(Math.min(20, 8 + combo))
      if (roundIndex >= ROUNDS.length - 1) {
        setTimeout(() => setWon(true), 900)
      } else {
        setTimeout(() => {
          setRoundIndex((i) => i + 1)
          setRemoved([])
          setOrbState("idle")
          setMessage("Next kanji — keep the streak going!")
        }, 1100)
      }
    } else {
      setCombo(0)
      setLives((l) => Math.max(0, l - 1))
      setOrbState("bad")
      setEffect("thunder")
      setMessage(`Not ${picked.word.toLowerCase()} — the storm rolls in`)
      playThunder()
      awardGameXp(2)
      shake.start({ x: [0, -12, 10, -8, 6, 0], transition: { duration: 0.5 } })
      setTimeout(() => setOrbState("idle"), 800)
    }

    setTimeout(() => setEffect(null), 1900)
  }

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <motion.div
        animate={shake}
        className="relative w-screen h-[100svh] overflow-hidden text-[#22415a]"
      >
        {/* Sky */}
        <div
          className="absolute inset-0 transition-colors duration-700"
          style={{
            background:
              effect === "thunder"
                ? "linear-gradient(to bottom, #2b3550 0%, #47506b 55%, #6b6f86 100%)"
                : "linear-gradient(to bottom, #5fb6ff 0%, #a9dbff 45%, #dff1ff 75%, #fbe7c6 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/40 to-transparent" />
        <DriftingClouds />

        {/* Sun / storm orb-light */}
        <motion.div
          className="pointer-events-none absolute right-10 top-16 h-24 w-24 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,246,196,0.95), rgba(255,224,150,0.2) 70%, transparent)" }}
          animate={{ opacity: effect === "thunder" ? 0.15 : 1, scale: [1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        {/* Distant hills */}
        <svg className="pointer-events-none absolute bottom-0 w-full h-32 text-[#5FA36A]" viewBox="0 0 1440 160" preserveAspectRatio="none">
          <path fill="currentColor" opacity="0.9" d="M0,120 C180,40 320,140 480,90 C640,40 780,130 960,80 C1120,40 1280,110 1440,70 L1440,160 L0,160 Z" />
        </svg>
        <svg className="pointer-events-none absolute bottom-0 w-full h-20 text-[#4b8f5a]" viewBox="0 0 1440 160" preserveAspectRatio="none">
          <path fill="currentColor" opacity="0.9" d="M0,140 C240,90 420,150 720,120 C1020,90 1200,150 1440,110 L1440,160 L0,160 Z" />
        </svg>

        {/* HUD */}
        <header className="relative z-30 mx-3 sm:mx-6 mt-3 sm:mt-4 flex items-center justify-between gap-2 rounded-2xl bg-white/45 backdrop-blur-md border border-white/60 px-3 sm:px-5 py-2.5 shadow-lg">
          <Link
            to="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-lg shadow-sm hover:scale-105 transition-transform"
            aria-label="Back to dashboard"
          >
            ←
          </Link>
          <div className="min-w-0 text-center">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#2f5163]">
              Sky Orb · Round {roundIndex + 1}/{ROUNDS.length}
            </p>
            <div className="mt-0.5 flex items-center justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`text-sm ${i < lives ? "" : "opacity-25 grayscale"}`}>❤️</span>
              ))}
              {combo > 1 && (
                <span className="ml-2 rounded-full bg-amber-400/90 px-2 text-[10px] font-bold text-white">
                  x{combo} combo
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-base shadow-sm hover:scale-105 transition-transform"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? "🔇" : "🔊"}
            </button>
            <div className="rounded-xl bg-[#1F4E5F] px-3 py-1.5 text-white font-anglo-japanese text-lg sm:text-xl shadow-md">
              {score}
              <span className="ml-1 text-[10px] font-sans opacity-80">pts</span>
            </div>
          </div>
        </header>

        <p className="relative z-20 mx-auto mt-3 max-w-lg px-4 text-center text-sm sm:text-base font-semibold text-[#1F4E5F] drop-shadow-sm">
          {message}
        </p>

        {/* Playfield: top clouds / orb / bottom clouds */}
        <div className="relative z-20 flex h-[calc(100svh-8rem)] flex-col items-center justify-between px-2 sm:px-6 pb-6 pt-2">
          <div className="flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-8">
            {topClouds.map((c) => (
              <AnswerCloud key={c.id} id={c.id} word={c.word} removed={removed.includes(c.id)} />
            ))}
          </div>

          <div className="flex flex-1 items-center justify-center">
            <Orb prompt={round.prompt} reading={round.reading} state={orbState} />
          </div>

          <div className="flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-8">
            {bottomClouds.map((c) => (
              <AnswerCloud key={c.id} id={c.id} word={c.word} removed={removed.includes(c.id)} />
            ))}
          </div>
        </div>

        {/* Drag preview */}
        <DragOverlay dropAnimation={null}>
          {activeWord ? (
            <div className="rotate-[-4deg] scale-110">
              <CloudBody word={activeWord} />
            </div>
          ) : null}
        </DragOverlay>

        {/* Effects */}
        <AnimatePresence>
          {effect === "thunder" && (
            <>
              <motion.div
                className="pointer-events-none absolute inset-0 z-40 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.85, 0.1, 0.6, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9 }}
              />
              <LightningStorm />
              <motion.div
                className="pointer-events-none absolute inset-0 z-30"
                style={{ background: "radial-gradient(circle at 50% 40%, transparent 40%, rgba(20,25,45,0.55) 100%)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </>
          )}
        </AnimatePresence>

        {effect === "sakura" && [...Array(36)].map((_, i) => <Petal key={i} index={i} />)}

        {/* Win / lose */}
        {(lives === 0 || won) && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[#14202a]/50 backdrop-blur-sm px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm rounded-3xl bg-[#FFFDF8] p-8 text-center shadow-2xl border border-[#E8D5B5]"
            >
              <div className="mb-2 text-5xl">{won ? "🌸" : "⛈️"}</div>
              <h2 className="font-anglo-japanese text-3xl text-[#1F4E5F] mb-2">{won ? "Victory!" : "Out of lives"}</h2>
              <p className="text-[#4A6070] mb-2">
                {won ? `You scored ${score} points across ${ROUNDS.length} rounds.` : "The storm won this time."}
              </p>
              <p className="font-japanese text-lg text-[#C45C26] mb-6">{won ? "よくできました！" : "もう一度！"}</p>
              <button
                type="button"
                onClick={resetAll}
                className="rounded-full bg-gradient-to-r from-[#FF7A45] to-[#E85D04] px-8 py-3 font-bold text-white shadow-lg hover:scale-105 transition-transform"
              >
                {won ? "Play again" : "Retry"}
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </DndContext>
  )
}
