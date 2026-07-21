import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <main className="relative min-h-[100svh] w-full overflow-hidden bg-[#0f0b18] text-white flex items-center justify-center px-4 py-10">
      {/* ambient gradient blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-pink-600/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-indigo-600/30 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:40px_40px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        <Link
          to="/"
          className="mb-6 inline-block font-anglo-japanese text-lg bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent"
        >
          日本語 Lab
        </Link>
        <h1 className="font-anglo-japanese text-3xl sm:text-4xl mb-2">{title}</h1>
        <p className="text-white/60 text-sm mb-7">{subtitle}</p>
        {children}
        <div className="mt-6 text-center text-sm text-white/60">{footer}</div>
      </motion.div>
    </main>
  )
}
