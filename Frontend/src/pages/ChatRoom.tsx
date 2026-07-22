import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { io, Socket } from "socket.io-client"
import { toHiragana, isRomaji } from "wanakana"
import { API_URL, getToken } from "../api/client"
import { useAuth } from "../context/AuthContext"

type ChatMsg = {
  id: string
  roomId: string
  userId: string
  name: string
  text: string
  createdAt: string
  kind: "user" | "system" | "ai"
}

function socketBase() {
  // API is .../api/v1 — socket shares the same host
  return API_URL.replace(/\/api\/v1\/?$/, "") || "http://localhost:3000"
}

export default function ChatRoom() {
  const { user, refreshStats } = useAuth()
  const [roomId, setRoomId] = useState("lobby")
  const [joined, setJoined] = useState(false)
  const [members, setMembers] = useState(0)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [text, setText] = useState("")
  const [preview, setPreview] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [askAi, setAskAi] = useState(true)
  const socketRef = useRef<Socket | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const token = useMemo(() => getToken(), [])

  useEffect(() => {
    const converted = isRomaji(text) && text.trim() ? toHiragana(text) : text
    setPreview(converted)
  }, [text])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  const connectAndJoin = (id: string) => {
    setError(null)
    socketRef.current?.disconnect()

    const socket = io(socketBase(), {
      path: "/socket.io",
      auth: { token, name: user?.name || "Learner" },
      transports: ["websocket", "polling"],
    })
    socketRef.current = socket

    socket.on("connect_error", (err) => {
      setError(err.message || "Could not connect to chat")
      setJoined(false)
    })

    socket.on("room-joined", (payload: { roomId: string; members: number }) => {
      setJoined(true)
      setRoomId(payload.roomId)
      setMembers(payload.members)
    })

    socket.on("room-history", (history: ChatMsg[]) => {
      setMessages(history || [])
    })

    socket.on("chat-message", (msg: ChatMsg) => {
      setMessages((m) => [...m, msg])
      if (msg.kind === "user" && msg.userId === user?.id) {
        void refreshStats()
      }
    })

    socket.on("chat-error", (payload: { message: string }) => {
      setError(payload.message)
    })

    socket.emit("join-room", { roomId: id })
  }

  const send = () => {
    const payload = (preview || text).trim()
    if (!payload || !socketRef.current) return
    socketRef.current.emit("chat-message", { text: payload, askAi })
    setText("")
  }

  const askPartner = () => {
    const payload = (preview || text).trim()
    if (!payload || !socketRef.current) return
    socketRef.current.emit("ai-reply", { text: payload })
    setText("")
  }

  return (
    <main className="flex min-h-[100svh] flex-col bg-[#0b1220] text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <Link to="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          ←
        </Link>
        <div className="text-center min-w-0">
          <p className="font-anglo-japanese text-lg">Japanese Chat Room</p>
          <p className="text-[10px] uppercase tracking-widest text-white/45">
            {joined ? `${roomId} · ${members} online` : "not connected"}
          </p>
        </div>
        <div className="w-10" />
      </header>

      {!joined ? (
        <section className="mx-auto w-full max-w-md flex-1 px-4 py-10">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h1 className="font-anglo-japanese text-3xl mb-2">Join a room</h1>
            <p className="text-sm text-white/60 mb-5">
              Type Japanese or romaji. Toggle AI coach (Gemini) for corrections while you chat with others.
            </p>
            <label className="text-xs text-white/50">Room id</label>
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.slice(0, 40))}
              className="mt-1 mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 outline-none focus:border-pink-400/50"
              placeholder="lobby"
            />
            <button
              type="button"
              onClick={() => connectAndJoin(roomId || "lobby")}
              className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 py-3 font-semibold"
            >
              Enter room
            </button>
            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          </div>
        </section>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.kind === "ai"
                    ? "bg-indigo-500/20 border border-indigo-300/30"
                    : m.kind === "system"
                      ? "mx-auto bg-white/5 text-white/50 text-xs"
                      : m.userId === user?.id
                        ? "ml-auto bg-pink-500/25 border border-pink-400/30"
                        : "bg-white/10 border border-white/10"
                }`}
              >
                {m.kind !== "system" && (
                  <p className="text-[10px] uppercase tracking-wider text-white/45 mb-0.5">{m.name}</p>
                )}
                <p className="whitespace-pre-wrap font-japanese leading-relaxed">{m.text}</p>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {error && (
            <p className="mx-4 mb-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </p>
          )}

          <div className="border-t border-white/10 p-4 space-y-2">
            {preview && preview !== text && (
              <p className="text-xs text-emerald-200/80">
                Romaji → <span className="font-japanese">{preview}</span>
              </p>
            )}
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input type="checkbox" checked={askAi} onChange={(e) => setAskAi(e.target.checked)} />
              Ask ミケ AI (Gemini) to coach each message
            </label>
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder="Type Japanese or romaji…"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none focus:border-pink-400/50"
              />
              <button
                type="button"
                onClick={send}
                className="rounded-xl bg-pink-500 px-4 text-sm font-semibold"
              >
                Send
              </button>
              <button
                type="button"
                onClick={askPartner}
                className="rounded-xl bg-indigo-500 px-3 text-sm font-semibold"
                title="AI reply"
              >
                AI
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
