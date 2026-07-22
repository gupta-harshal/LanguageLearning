/**
 * 2D animated ミケ (Maneki Neko) for the video call — pure SVG + Framer Motion.
 * No 3D/three.js. Moods drive the mouth, ears, paw and aura.
 */
import { motion } from "framer-motion"

type Mood = "idle" | "listening" | "talking" | "happy"

export default function TalkAvatar({ mood = "idle" }: { mood?: Mood }) {
  const talking = mood === "talking"
  const listening = mood === "listening"
  const happy = mood === "happy"

  return (
    <div className="relative flex h-full w-full min-h-[280px] items-center justify-center overflow-hidden bg-gradient-to-b from-[#1a1028] via-[#241536] to-[#170f22]">
      {/* soft stage lights */}
      <div className="pointer-events-none absolute -top-16 left-1/4 h-64 w-64 rounded-full bg-pink-500/20 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-indigo-500/20 blur-[90px]" />

      {/* aura ring reacts to mood */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 340, height: 340 }}
        animate={{
          boxShadow: listening
            ? "0 0 90px 18px rgba(74,222,128,0.35)"
            : talking
              ? "0 0 90px 18px rgba(255,107,157,0.4)"
              : happy
                ? "0 0 100px 22px rgba(251,191,36,0.4)"
                : "0 0 70px 10px rgba(129,140,248,0.25)",
          scale: talking ? [1, 1.04, 1] : 1,
        }}
        transition={{ duration: 0.9, repeat: talking ? Infinity : 0 }}
      />

      <motion.svg
        width="300"
        height="320"
        viewBox="0 0 300 320"
        className="relative z-10 drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
        animate={{ y: [0, -8, 0], rotate: listening ? [0, -2, 2, 0] : 0 }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* tail */}
        <motion.path
          d="M 232 250 q 40 -8 36 -46 q -3 -26 -28 -24"
          fill="none"
          stroke="#F5E9DA"
          strokeWidth="18"
          strokeLinecap="round"
          animate={{ rotate: [0, 6, 0] }}
          style={{ originX: "230px", originY: "250px" }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* body */}
        <ellipse cx="150" cy="235" rx="86" ry="72" fill="#FFF6EC" />
        <ellipse cx="150" cy="252" rx="52" ry="42" fill="#FFE9F0" />

        {/* left arm resting */}
        <ellipse cx="92" cy="252" rx="20" ry="34" fill="#FFF6EC" transform="rotate(14 92 252)" />

        {/* waving paw */}
        <motion.g
          style={{ originX: "208px", originY: "212px" }}
          animate={{ rotate: talking || happy ? [-12, 28, -12] : [-6, 14, -6] }}
          transition={{ duration: talking || happy ? 0.7 : 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ellipse cx="212" cy="188" rx="19" ry="38" fill="#FFF6EC" transform="rotate(-18 212 188)" />
          <circle cx="222" cy="156" r="17" fill="#FFF6EC" />
          <circle cx="222" cy="153" r="10" fill="#FFD9E4" />
        </motion.g>

        {/* head */}
        <motion.g
          style={{ originX: "150px", originY: "150px" }}
          animate={{ rotate: listening ? [0, 3, -3, 0] : [0, 1.5, -1.5, 0] }}
          transition={{ duration: listening ? 1.6 : 5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* ears */}
          <motion.path
            d="M 84 92 L 72 38 L 118 68 Z"
            fill="#FFF6EC"
            animate={{ rotate: listening ? [0, -6, 0] : 0 }}
            style={{ originX: "95px", originY: "80px" }}
            transition={{ duration: 0.8, repeat: listening ? Infinity : 0 }}
          />
          <path d="M 88 84 L 81 52 L 110 71 Z" fill="#FFB7CD" />
          <motion.path
            d="M 216 92 L 228 38 L 182 68 Z"
            fill="#FFF6EC"
            animate={{ rotate: listening ? [0, 6, 0] : 0 }}
            style={{ originX: "205px", originY: "80px" }}
            transition={{ duration: 0.8, repeat: listening ? Infinity : 0, delay: 0.2 }}
          />
          <path d="M 212 84 L 219 52 L 190 71 Z" fill="#FFB7CD" />

          {/* face */}
          <circle cx="150" cy="128" r="74" fill="#FFF6EC" />

          {/* patches */}
          <path d="M 96 90 q 22 -18 44 -4 q -18 20 -44 26 Z" fill="#F5A623" opacity="0.85" />
          <path d="M 204 90 q -22 -18 -44 -4 q 18 20 44 26 Z" fill="#4A4A58" opacity="0.85" />

          {/* eyes — blink on idle, closed-happy arcs when happy */}
          {happy ? (
            <>
              <path d="M 112 122 q 12 -12 24 0" stroke="#1c1c28" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M 164 122 q 12 -12 24 0" stroke="#1c1c28" strokeWidth="5" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <motion.ellipse
                cx="124" cy="122" rx="9" ry="12" fill="#1c1c28"
                animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
                transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.46, 0.5, 0.54, 1] }}
              />
              <motion.ellipse
                cx="176" cy="122" rx="9" ry="12" fill="#1c1c28"
                animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
                transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.46, 0.5, 0.54, 1] }}
              />
              <circle cx="127" cy="118" r="3" fill="#fff" />
              <circle cx="179" cy="118" r="3" fill="#fff" />
            </>
          )}

          {/* blush */}
          <circle cx="104" cy="146" r="10" fill="#FFB7CD" opacity="0.7" />
          <circle cx="196" cy="146" r="10" fill="#FFB7CD" opacity="0.7" />

          {/* nose */}
          <path d="M 146 138 q 4 -4 8 0 q -4 6 -8 0" fill="#FF7A9A" />

          {/* whiskers */}
          <g stroke="#D8C6B4" strokeWidth="2.5" strokeLinecap="round">
            <line x1="70" y1="140" x2="102" y2="144" />
            <line x1="72" y1="154" x2="102" y2="152" />
            <line x1="230" y1="140" x2="198" y2="144" />
            <line x1="228" y1="154" x2="198" y2="152" />
          </g>

          {/* mouth — opens rhythmically while talking */}
          {talking ? (
            <motion.ellipse
              cx="150" cy="158" rx="11" fill="#B2503F"
              animate={{ ry: [3, 9, 4, 10, 3] }}
              transition={{ duration: 0.55, repeat: Infinity }}
            />
          ) : (
            <path
              d={happy ? "M 138 154 q 12 14 24 0" : "M 140 156 q 10 8 20 0"}
              stroke="#1c1c28"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </motion.g>

        {/* collar + bell */}
        <path d="M 108 190 q 42 20 84 0 l -4 14 q -38 16 -76 0 Z" fill="#E11D48" />
        <motion.g
          animate={{ rotate: talking ? [0, 8, -8, 0] : [0, 3, -3, 0] }}
          style={{ originX: "150px", originY: "204px" }}
          transition={{ duration: talking ? 0.5 : 2.4, repeat: Infinity }}
        >
          <circle cx="150" cy="212" r="11" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
          <line x1="150" y1="206" x2="150" y2="214" stroke="#B45309" strokeWidth="2" />
          <circle cx="150" cy="217" r="2" fill="#B45309" />
        </motion.g>

        {/* koban coin */}
        <ellipse cx="150" cy="272" rx="28" ry="18" fill="#FBBF24" stroke="#B45309" strokeWidth="3" />
        <text x="150" y="279" textAnchor="middle" fontSize="16" fill="#8a5a00" fontWeight="bold">
          福
        </text>
      </motion.svg>

      {/* listening waveform */}
      {listening && (
        <div className="pointer-events-none absolute bottom-5 left-0 right-0 flex justify-center gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 rounded-full bg-emerald-400"
              animate={{ height: [8, 22 + (i % 3) * 8, 8] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      )}

      {/* talking sound waves */}
      {talking && (
        <div className="pointer-events-none absolute right-8 top-1/3 flex flex-col gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1 rounded-full bg-pink-300/80"
              style={{ width: 18 + i * 10 }}
              animate={{ opacity: [0, 1, 0], x: [0, 8, 16] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
