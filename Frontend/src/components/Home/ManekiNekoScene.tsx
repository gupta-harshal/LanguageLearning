/**
 * Interactive Maneki Neko — embeds a real CC-BY low-poly 3D model
 * from Sketchfab (Rice & Soy Sauce) with orbit / auto-spin.
 * Falls back to a local Three.js neko if the embed is blocked.
 */
import { Canvas, useFrame } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import type { Group } from "three"

const SKETCHFAB_EMBED =
  "https://sketchfab.com/models/50b5d360717c442c971b3db0576606c4/embed?autostart=1&autospin=0.6&ui_theme=dark&ui_infos=0&ui_controls=1&ui_stop=0&ui_watermark_link=0&transparent=0&ui_hint=0"

function LocalNekoFallback() {
  const root = useRef<Group>(null)
  const arm = useRef<Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (arm.current) arm.current.rotation.z = -0.2 + Math.sin(t * 3.6) * 0.85
    if (root.current) root.current.rotation.y = Math.sin(t * 0.4) * 0.25
  })

  return (
    <group ref={root} position={[0, -0.55, 0]} scale={1.15}>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.7, 40, 40]} />
        <meshStandardMaterial color="#FFF5F0" roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.35, 0.22]}>
        <sphereGeometry args={[0.38, 28, 28]} />
        <meshStandardMaterial color="#FFE4EC" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.07, 14, 40]} />
        <meshStandardMaterial color="#E11D48" />
      </mesh>
      <mesh position={[0, 0.82, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.045, 28]} />
        <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.55, 40, 40]} />
        <meshStandardMaterial color="#FFF5F0" roughness={0.28} />
      </mesh>
      <mesh position={[-0.36, 1.85, 0]} rotation={[0, 0, -0.35]}>
        <coneGeometry args={[0.17, 0.36, 18]} />
        <meshStandardMaterial color="#FFF5F0" />
      </mesh>
      <mesh position={[0.36, 1.85, 0]} rotation={[0, 0, 0.35]}>
        <coneGeometry args={[0.17, 0.36, 18]} />
        <meshStandardMaterial color="#FFF5F0" />
      </mesh>
      <mesh position={[-0.2, 1.5, 0.45]}>
        <sphereGeometry args={[0.08, 14, 14]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.2, 1.5, 0.45]}>
        <sphereGeometry args={[0.08, 14, 14]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, 1.38, 0.52]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#FB7185" />
      </mesh>
      <group ref={arm} position={[0.55, 1.15, 0.05]}>
        <mesh position={[0.05, 0.35, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.6, 14]} />
          <meshStandardMaterial color="#FFF5F0" />
        </mesh>
        <mesh position={[0.05, 0.72, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#FFF5F0" />
        </mesh>
      </group>
      <mesh position={[-0.5, 0.15, 0.35]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#FFF5F0" />
      </mesh>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 2]} intensity={1.5} />
      <pointLight position={[-2, 2, 2]} color="#ff6b9d" intensity={1} />
    </group>
  )
}

export default function ManekiNekoScene() {
  const [useFallback, setUseFallback] = useState(false)
  const [embedReady, setEmbedReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!embedReady) setUseFallback(true)
    }, 6000)
    return () => window.clearTimeout(timer)
  }, [embedReady])

  if (useFallback) {
    return (
      <div className="relative h-full w-full min-h-[360px] bg-gradient-to-b from-[#2a1b38] to-[#1a1224]">
        <Canvas camera={{ position: [0, 1.1, 3.4], fov: 40 }} className="h-full w-full touch-none">
          <color attach="background" args={["#1a1224"]} />
          <LocalNekoFallback />
        </Canvas>
        <p className="pointer-events-none absolute bottom-3 inset-x-0 text-center text-[10px] font-japanese tracking-widest text-white/55">
          招き猫
        </p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full min-h-[360px] bg-[#121018]">
      {!embedReady && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#121018]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-primary/25 border-t-pink-primary" />
          <p className="text-xs font-bold tracking-widest text-white/50 uppercase">Loading 3D model…</p>
        </div>
      )}
      <iframe
        title="Maneki Neko 3D model"
        src={SKETCHFAB_EMBED}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
        onLoad={() => setEmbedReady(true)}
        onError={() => setUseFallback(true)}
      />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
        <p className="text-center text-[10px] sm:text-xs font-japanese tracking-widest text-white/70">
          招き猫 · drag to orbit · model by Rice &amp; Soy Sauce (CC-BY)
        </p>
      </div>
    </div>
  )
}
