import { Canvas, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import type { Group } from "three"

type Mood = "idle" | "listening" | "talking" | "happy"

function NekoModel({ mood }: { mood: Mood }) {
  const root = useRef<Group>(null)
  const arm = useRef<Group>(null)
  const mouth = useRef<Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (root.current) {
      root.current.rotation.y =
        mood === "listening" ? Math.sin(t * 1.2) * 0.15 : Math.sin(t * 0.35) * 0.2
    }
    if (arm.current) {
      const speed = mood === "talking" || mood === "happy" ? 5.2 : 2.2
      const amp = mood === "talking" || mood === "happy" ? 0.95 : 0.55
      arm.current.rotation.z = -0.2 + Math.sin(t * speed) * amp
    }
    if (mouth.current) {
      const open = mood === "talking" ? 0.08 + Math.abs(Math.sin(t * 12)) * 0.12 : 0.04
      mouth.current.scale.set(1, open / 0.05, 1)
    }
  })

  return (
    <group ref={root} position={[0, -0.7, 0]} scale={1.25}>
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
      <group ref={mouth} position={[0, 1.35, 0.52]}>
        <mesh>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#FB7185" />
        </mesh>
      </group>
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
    </group>
  )
}

export default function TalkAvatar({ mood = "idle" }: { mood?: Mood }) {
  return (
    <div className="relative h-full w-full min-h-[280px]">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.9, 3.1], fov: 42 }} className="h-full w-full">
        <color attach="background" args={["#1a1028"]} />
        <ambientLight intensity={1} />
        <directionalLight position={[4, 6, 3]} intensity={1.7} />
        <pointLight position={[-2, 2, 2]} intensity={1.1} color="#ff6b9d" />
        <NekoModel mood={mood} />
      </Canvas>
      {mood === "listening" && (
        <div className="pointer-events-none absolute bottom-4 left-0 right-0 flex justify-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="h-6 w-1.5 animate-pulse rounded-full bg-emerald-400"
              style={{ animationDelay: `${i * 0.1}s`, height: `${12 + (i % 3) * 8}px` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
