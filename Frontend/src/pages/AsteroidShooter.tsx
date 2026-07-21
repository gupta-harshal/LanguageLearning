import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import Asteroid from '../components/AsteroidShooter/asteroid';
import Laser from '../components/AsteroidShooter/laser';
import Spaceship from '../components/AsteroidShooter/spaceship';
import EngToJap from '../components/engtoJap';

interface AsteroidType {
  id: string;
  text: string;
  startLeft: number;
  spawnTime: number;
}

interface LaserShot {
  id: string;
  fromX: number;
  toX: number;
}

interface Explosion {
  id: string;
  x: number;
  y: number;
}

const GameCanvas = () => {
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [asteroids, setAsteroids] = useState<AsteroidType[]>([]);
  const [lasers, setLasers] = useState<LaserShot[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const viewportRef = useRef(viewport);
  const difficultyRef = useRef({ interval: 1600, fallSpeed: 15 });
  const spawnTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const asteroidSize = 96;
  const asteroidWords = ['くも', 'そら', 'ほし', 'つき', 'やま'];
  const shipBottom = 24;

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const level = Math.floor(score / 500);
    const newInterval = Math.max(600, 1600 - level * 100);
    const newFallSpeed = Math.max(6, 15 - level);
    difficultyRef.current = { interval: newInterval, fallSpeed: newFallSpeed };
  }, [score]);

  const spawnAsteroid = useCallback(() => {
    if (isGameOver) return;
    const id = `a-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const text = asteroidWords[Math.floor(Math.random() * asteroidWords.length)];
    const maxLeft = Math.max(viewportRef.current.width - asteroidSize, 0);
    const startLeft = Math.random() * maxLeft;

    setAsteroids(prev => [...prev, { id, text, startLeft, spawnTime: Date.now() }]);
  }, [isGameOver]);

  const scheduleNextSpawn = useCallback(() => {
    spawnTimeoutRef.current = setTimeout(() => {
      spawnAsteroid();
      scheduleNextSpawn();
    }, difficultyRef.current.interval);
  }, [spawnAsteroid]);

  useEffect(() => {
    if (!isGameOver) {
      scheduleNextSpawn();
    }
    return () => clearTimeout(spawnTimeoutRef.current);
  }, [isGameOver, scheduleNextSpawn]);

  const removeAsteroid = useCallback((id: string, isMiss = false) => {
    setAsteroids(prev => prev.filter(a => a.id !== id));
    if (isMiss) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setIsGameOver(true);
        }
        return newLives;
      });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
    }
  }, []);

  const handleFallComplete = useCallback((id: string) => {
    removeAsteroid(id, true);
  }, [removeAsteroid]);

  const removeLaser = useCallback((id: string) => {
    setLasers(prev => prev.filter(shot => shot.id !== id));
  }, []);

  const handleEnter = useCallback((input: string) => {
    if (isGameOver) return;
    const normalizedInput = input.trim();

    setAsteroids(prevAsteroids => {
      const match = prevAsteroids.find(a => a.text === normalizedInput);
      if (match) {
        const shipCenterX = viewportRef.current.width / 2;
        const asteroidCenterX = match.startLeft + asteroidSize / 2;
        const laserId = `l-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        setLasers(prevLasers => [...prevLasers, { id: laserId, fromX: shipCenterX, toX: asteroidCenterX }]);
        
        const elapsed = (Date.now() - match.spawnTime) / 1000;
        const totalDist = viewportRef.current.height - 50; 
        const y = -100 + (elapsed / difficultyRef.current.fallSpeed) * totalDist;

        const explosionId = `e-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        setExplosions(prevEx => [...prevEx, { id: explosionId, x: asteroidCenterX, y }]);
        setTimeout(() => {
          setExplosions(prevEx => prevEx.filter(e => e.id !== explosionId));
        }, 400);

        setScore(s => s + 100);
        return prevAsteroids.filter(a => a.id !== match.id);
      }
      return prevAsteroids;
    });
  }, [isGameOver]);

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setAsteroids([]);
    setLasers([]);
    setExplosions([]);
    setIsGameOver(false);
    difficultyRef.current = { interval: 1600, fallSpeed: 15 };
  };

  const stars = useMemo(() => {
    return Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      duration: 15 + Math.random() * 30,
      delay: -(Math.random() * 30),
      left: Math.random() * 100,
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, []);

  return (
    <div
      className={`relative min-h-screen overflow-hidden ${isShaking ? 'shake-animation' : ''}`}
      style={{
        background:
          'radial-gradient(circle at 22% 14%, rgba(78, 153, 255, 0.16), transparent 38%), radial-gradient(circle at 75% 30%, rgba(42, 109, 217, 0.12), transparent 46%), radial-gradient(circle at 50% 84%, rgba(31, 74, 153, 0.18), transparent 55%), linear-gradient(180deg, #01040c 0%, #020814 38%, #01060f 100%)',
      }}
    >
      <style>{`
        @keyframes starfall {
          from { transform: translateY(-10px); }
          to { transform: translateY(100vh); }
        }
        @keyframes explode {
          0% { transform: scale(0.3); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes screenShake {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-4px, 2px); }
          40% { transform: translate(4px, -2px); }
          60% { transform: translate(-2px, 4px); }
          80% { transform: translate(2px, -4px); }
        }
        .shake-animation {
          animation: screenShake 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>

      {isGameOver && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <h2 className="mb-4 text-5xl font-bold tracking-widest text-red-500 [text-shadow:0_0_20px_rgba(239,68,68,0.8)]">GAME OVER</h2>
          <p className="mb-8 text-2xl text-white">Final Score: <span className="font-bold text-sky-400">{score}</span></p>
          <button 
            onClick={resetGame} 
            className="rounded-full border border-sky-400/50 bg-sky-900/40 px-8 py-3 text-lg font-bold text-sky-200 transition-colors hover:bg-sky-800/60 hover:text-white hover:shadow-[0_0_20px_rgba(56,189,248,0.4)]"
          >
            Play Again
          </button>
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-[-20%] blur-2xl"
        style={{
          background:
            'radial-gradient(circle at 30% 18%, rgba(107, 186, 255, 0.11), transparent 35%), radial-gradient(circle at 75% 68%, rgba(69, 140, 247, 0.1), transparent 34%), radial-gradient(circle at 50% 80%, rgba(41, 96, 192, 0.08), transparent 42%)',
        }}
      />

      <div className="absolute left-1/2 top-3 z-40 flex w-[min(920px,94vw)] -translate-x-1/2 items-center justify-between gap-3 rounded-[14px] border border-blue-300/35 bg-gradient-to-b from-[#070e1ec7] to-[#040918f0] px-3.5 py-2.5 shadow-[0_12px_30px_rgba(0,4,16,0.55),inset_0_1px_0_rgba(151,199,255,0.12)] backdrop-blur-[10px] max-[720px]:w-[96vw] max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-2 max-[720px]:rounded-xl max-[720px]:px-2.5 max-[720px]:py-2">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sky-300/40 bg-[#040a19bf] text-lg text-slate-100 hover:bg-sky-500/20"
            aria-label="Back to dashboard"
          >
            ←
          </Link>
          <div className="grid gap-1">
            <p className="m-0 text-[11px] uppercase tracking-[0.18em] text-sky-200/80">Typing Defense</p>
            <h1 className="m-0 text-[clamp(15px,2vw,20px)] tracking-[0.04em] text-slate-100 [text-shadow:0_2px_12px_rgba(67,149,255,0.35)]">
              Orbital Kana Assault
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-blue-300/35 bg-[#040a19bf] px-2.5 py-1.5 max-[720px]:w-full max-[720px]:justify-between">
          <div className="grid gap-0.5 px-2">
            <span className="text-[10px] uppercase tracking-[0.12em] text-sky-200/85">Score</span>
            <span className="text-lg font-bold tracking-[0.05em] text-slate-100">{score}</span>
          </div>
          <div className="h-[30px] w-px bg-gradient-to-b from-blue-300/0 via-blue-300/70 to-blue-300/0" />
          <div className="grid gap-0.5 px-2">
            <span className="text-[10px] uppercase tracking-[0.12em] text-sky-200/85">Threats</span>
            <span className="text-lg font-bold tracking-[0.05em] text-slate-100">{asteroids.length}</span>
          </div>
          <div className="h-[30px] w-px bg-gradient-to-b from-blue-300/0 via-blue-300/70 to-blue-300/0" />
          <div className="grid gap-0.5 px-2">
            <span className="text-[10px] uppercase tracking-[0.12em] text-sky-200/85">Lives</span>
            <span className="flex h-[28px] items-center gap-1 text-sm tracking-[0.05em]">
              {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
                <span key={i}>❤️</span>
              ))}
            </span>
          </div>
        </div>
      </div>

      {stars.map((star) => (
        <div
          key={star.id}
          className="pointer-events-none absolute rounded-full bg-white"
          style={{
            top: 0,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animation: `starfall ${star.duration}s linear ${star.delay}s infinite`,
          }}
        />
      ))}

      <div className="pointer-events-none absolute right-[7%] top-[15%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.22)_0%,rgba(56,189,248,0.08)_34%,rgba(15,23,42,0)_72%)] blur-3xl max-[720px]:right-[-12%] max-[720px]:top-[10%] max-[720px]:h-56 max-[720px]:w-56" />
      <div className="pointer-events-none absolute left-[5%] bottom-[11%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.16)_0%,rgba(56,189,248,0.08)_32%,rgba(15,23,42,0)_74%)] blur-3xl max-[720px]:left-[-16%] max-[720px]:bottom-[5%] max-[720px]:h-64 max-[720px]:w-64" />
      <div className="pointer-events-none absolute left-[14%] top-[28%] h-36 w-36 rounded-full border border-sky-200/10 bg-[radial-gradient(circle_at_35%_35%,rgba(226,232,240,0.18)_0%,rgba(148,163,184,0.08)_28%,rgba(15,23,42,0.18)_56%,rgba(15,23,42,0)_72%)] shadow-[0_0_90px_rgba(125,211,252,0.18)] max-[720px]:left-[8%] max-[720px]:top-[24%] max-[720px]:h-28 max-[720px]:w-28" />

      <div className="pointer-events-none absolute bottom-24 left-1/2 z-12 h-[62vh] w-[2px] -translate-x-1/2 bg-gradient-to-b from-sky-300/0 via-sky-300/50 to-sky-300/0" />

      {asteroids.map(ast => (
        <Asteroid
          key={ast.id}
          id={ast.id}
          text={ast.text}
          startLeft={ast.startLeft}
          onFallComplete={handleFallComplete}
          fallSpeed={difficultyRef.current.fallSpeed}
          stageHeight={viewport.height}
        />
      ))}

      {lasers.map(shot => (
        <Laser
          key={shot.id}
          fromX={shot.fromX}
          toX={shot.toX}
          startBottom={shipBottom + 58}
          targetBottom={viewport.height - 170}
          onComplete={() => removeLaser(shot.id)}
        />
      ))}

      {explosions.map(ex => (
        <div
          key={ex.id}
          className="pointer-events-none absolute z-50 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.9)_0%,rgba(239,68,68,0.7)_40%,transparent_70%)]"
          style={{
            left: ex.x,
            top: ex.y,
            width: '100px',
            height: '100px',
            marginLeft: '-50px',
            marginTop: '-50px',
            animation: 'explode 0.4s ease-out forwards',
          }}
        />
      ))}

      <div className="absolute bottom-[24px] left-1/2 z-30 -translate-x-1/2 max-[720px]:bottom-[20px]">
        <Spaceship>
          <EngToJap
            placeholder="Type Romaji and press Enter to blast"
            className="w-full border border-sky-200/35 bg-[#080f22f2] text-center font-[japanese] text-[1.02rem] text-[#e0ecff] placeholder:text-sky-200/65 focus:border-sky-400/85 focus:ring-2 focus:ring-blue-500/35 max-[720px]:text-[0.95rem]"
            onEnter={handleEnter}
          />
        </Spaceship>
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, transparent 22%, rgba(0, 1, 4, 0.78) 100%), linear-gradient(180deg, rgba(2, 5, 14, 0.18), rgba(2, 5, 14, 0.64))',
        }}
      />
    </div>
  );
};

export default GameCanvas;
