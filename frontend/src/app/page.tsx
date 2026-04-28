"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  RotateCcw,
  BarChart3,
  ArrowRight,
  Check,
  Star,
  ChevronDown,
  Brain,
  Zap,
  Shield,
} from "lucide-react";

function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = end / (1500 / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else setCount(Math.floor(start));
      }, 16);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function FlashcardDemo() {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setFlipped((f) => !f), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="card-scene mx-auto cursor-pointer select-none"
      style={{ width: "340px", height: "200px" }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div className={`card-flip ${flipped ? "flipped" : ""}`}>
        <div
          className="card-face w-full h-full rounded-2xl flex flex-col items-center justify-center p-8 text-center"
          style={{
            background: "linear-gradient(135deg, #1a2540 0%, #0f1629 100%)",
            border: "1px solid rgba(99,102,241,0.3)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}
          >
            Question
          </span>
          <p
            className="text-white font-semibold text-lg leading-snug"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            What is the mitochondria's primary function?
          </p>
        </div>
        <div
          className="card-back card-face w-full h-full rounded-2xl flex flex-col items-center justify-center p-8 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, #0f1629 100%)",
            border: "1px solid rgba(99,102,241,0.4)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}
          >
            Answer
          </span>
          <p style={{ color: "#e8eaf6", fontWeight: 500, lineHeight: 1.6 }}>
            Producing ATP through cellular respiration — the cell's main energy
            source.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Smooth scroll handler
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      style={{
        background: "#070b14",
        color: "#e8eaf6",
        fontFamily: "DM Sans, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(7,11,20,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              <BookOpen size={16} className="text-white" />
            </div>
            <span
              className="font-bold text-lg text-white"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Remindly
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Features", id: "features" },
              { label: "How it works", id: "how-it-works" },
              { label: "Pricing", id: "pricing" },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-sm transition-colors bg-transparent border-none cursor-pointer"
                style={{ color: "#8892b0" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#e8eaf6")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#8892b0")}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              style={{ color: "#8892b0" }}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 0 20px rgba(99,102,241,0.3)",
              }}
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <div
          className="absolute pointer-events-none"
          style={{
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          }}
        />

        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 fade-up"
          style={{
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.25)",
            color: "#a5b4fc",
          }}
        >
          <Sparkles size={12} /> AI-Powered Learning Platform{" "}
          <Sparkles size={12} />
        </div>

        <h1
          className="text-5xl md:text-7xl font-bold mb-6 fade-up leading-tight"
          style={{ fontFamily: "Syne, sans-serif", animationDelay: "0.1s" }}
        >
          Study smarter,
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            remember longer.
          </span>
        </h1>

        <p
          className="text-lg md:text-xl mb-10 max-w-2xl fade-up"
          style={{ color: "#8892b0", lineHeight: 1.7, animationDelay: "0.2s" }}
        >
          Remindly turns your notes into flashcards automatically, then uses
          spaced repetition to make sure you never forget what you've learned.
          Built for students who want real results.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 mb-16 fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            href="/register"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white text-base"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 0 40px rgba(99,102,241,0.35)",
            }}
          >
            Start for free <ArrowRight size={18} />
          </Link>
          <button
            onClick={() => scrollTo("how-it-works")}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base cursor-pointer border-none"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e8eaf6",
            }}
          >
            See how it works
          </button>
        </div>

        <div
          className="fade-up w-full max-w-sm mx-auto"
          style={{ animationDelay: "0.4s" }}
        >
          <p className="text-xs text-center mb-4" style={{ color: "#4a5568" }}>
            ↓ Live demo — auto-flipping card
          </p>
          <FlashcardDemo />
        </div>

        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "#4a5568" }}
        >
          <span className="text-xs">Scroll to explore</span>
          <ChevronDown size={16} className="animate-bounce" />
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: 10000, suffix: "+", label: "Students learning" },
            { value: 500000, suffix: "+", label: "Flashcards created" },
            { value: 98, suffix: "%", label: "Retention rate" },
            { value: 4, suffix: ".9★", label: "Average rating" },
          ].map(({ value, suffix, label }) => (
            <div
              key={label}
              className="text-center p-6 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="text-3xl font-bold mb-1"
                style={{ fontFamily: "Syne, sans-serif", color: "#a5b4fc" }}
              >
                <Counter end={value} suffix={suffix} />
              </p>
              <p className="text-sm" style={{ color: "#4a5568" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        className="py-24 px-6"
        style={{ scrollMarginTop: "80px" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full inline-block mb-4"
              style={{
                background: "rgba(99,102,241,0.1)",
                color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              Everything you need
            </span>
            <h2
              className="text-4xl md:text-5xl font-bold"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              One platform for all your studying
            </h2>
            <p
              className="mt-4 text-lg max-w-xl mx-auto"
              style={{ color: "#8892b0" }}
            >
              No more switching between apps. Notes, flashcards, and review —
              all connected.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: BookOpen,
                color: "#6366f1",
                title: "Smart Notes",
                desc: "Write rich notes with formatting, tags, and search. Everything organized the way you need it.",
              },
              {
                icon: Sparkles,
                color: "#8b5cf6",
                title: "AI Flashcard Generation",
                desc: "Paste your notes and AI instantly creates perfect flashcards. Pattern matching or DeepSeek AI.",
              },
              {
                icon: RotateCcw,
                color: "#06b6d4",
                title: "Spaced Repetition",
                desc: "Our SM-2 algorithm shows you cards at the perfect moment — just before you'd forget them.",
              },
              {
                icon: BarChart3,
                color: "#10b981",
                title: "Progress Tracking",
                desc: "Visual dashboard shows your weekly study activity, streak, and cards due for review today.",
              },
              {
                icon: Brain,
                color: "#f59e0b",
                title: "Review Mode",
                desc: "Focused review sessions with flip cards. Rate yourself Easy, Hard, or Again after each card.",
              },
              {
                icon: Shield,
                color: "#ec4899",
                title: "Secure & Private",
                desc: "Your notes are yours. JWT authentication, bcrypt encryption, zero data selling ever.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.border =
                    `1px solid ${color}40`;
                  (e.currentTarget as HTMLElement).style.background =
                    `${color}08`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.border =
                    "1px solid rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.03)";
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}20` }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <h3
                  className="font-bold text-lg mb-2 text-white"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#8892b0" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        className="py-24 px-6"
        style={{ scrollMarginTop: "80px" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full inline-block mb-4"
              style={{
                background: "rgba(99,102,241,0.1)",
                color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              Simple process
            </span>
            <h2
              className="text-4xl md:text-5xl font-bold"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              From notes to memory in 3 steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: BookOpen,
                title: "Write your notes",
                desc: "Use the rich editor to write study notes. Add tags to organize by subject or topic.",
                color: "#6366f1",
              },
              {
                step: "02",
                icon: Sparkles,
                title: "Generate flashcards",
                desc: 'Click "Generate" and AI converts your notes into question-answer flashcards instantly.',
                color: "#8b5cf6",
              },
              {
                step: "03",
                icon: Brain,
                title: "Review and remember",
                desc: "Study cards daily. The algorithm schedules reviews so you remember 90%+ long term.",
                color: "#06b6d4",
              },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="text-center">
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${color}20, ${color}08)`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  <Icon size={36} style={{ color }} />
                </div>
                <div
                  className="text-xs font-bold mb-3 tracking-widest"
                  style={{ color }}
                >
                  STEP {step}
                </div>
                <h3
                  className="text-xl font-bold mb-3 text-white"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#8892b0" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Students love Remindly
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "Assylzat B.",
                role: "Medical Student",
                text: "I used to spend hours making flashcards. Now Remindly generates them from my lecture notes in seconds. My exam scores went up significantly.",
                stars: 5,
              },
              {
                name: "Marzhan M.",
                role: "Computer Science",
                text: "The spaced repetition is exactly like Anki but built right into where I take notes. I actually remember algorithms now instead of just reading them.",
                stars: 5,
              },
              {
                name: "Dilyara V.",
                role: "Law Student",
                text: "Case law is all about repetition. Remindly helped me retain so much more information before my exams. The AI generation is incredibly accurate.",
                stars: 5,
              },
            ].map(({ name, role, text, stars }) => (
              <div
                key={name}
                className="p-6 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex gap-1 mb-4">
                  {Array(stars)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className="fill-current"
                        style={{ color: "#fbbf24" }}
                      />
                    ))}
                </div>
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: "#8892b0" }}
                >
                  "{text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    }}
                  >
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs" style={{ color: "#4a5568" }}>
                      {role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section
        id="pricing"
        className="py-24 px-6"
        style={{ scrollMarginTop: "80px" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full inline-block mb-4"
              style={{
                background: "rgba(99,102,241,0.1)",
                color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              Simple pricing
            </span>
            <h2
              className="text-4xl md:text-5xl font-bold"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Free while in beta
            </h2>
            <p className="mt-4" style={{ color: "#8892b0" }}>
              All features available during our beta period. No credit card
              required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div
              className="p-8 rounded-3xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h3
                className="text-xl font-bold mb-1 text-white"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Free
              </h3>
              <p className="text-sm mb-6" style={{ color: "#4a5568" }}>
                Perfect to get started
              </p>
              <p
                className="text-4xl font-bold mb-8 text-white"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                0 KZT
                <span
                  className="text-lg font-normal"
                  style={{ color: "#4a5568" }}
                >
                  /month
                </span>
              </p>
              {[
                "Unlimited notes",
                "100 flashcards/month",
                "Pattern matching generation",
                "Spaced repetition",
                "Progress dashboard",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3 mb-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(99,102,241,0.2)" }}
                  >
                    <Check size={11} style={{ color: "#6366f1" }} />
                  </div>
                  <span className="text-sm" style={{ color: "#8892b0" }}>
                    {f}
                  </span>
                </div>
              ))}
              <Link
                href="/register"
                className="block text-center mt-8 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "rgba(99,102,241,0.15)",
                  color: "#818cf8",
                  border: "1px solid rgba(99,102,241,0.3)",
                }}
              >
                Get started free
              </Link>
            </div>

            <div
              className="p-8 rounded-3xl relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)",
                border: "1px solid rgba(99,102,241,0.4)",
                boxShadow: "0 0 40px rgba(99,102,241,0.15)",
              }}
            >
              <div
                className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                }}
              >
                POPULAR
              </div>
              <h3
                className="text-xl font-bold mb-1 text-white"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Pro
              </h3>
              <p className="text-sm mb-6" style={{ color: "#8892b0" }}>
                For serious learners
              </p>
              <p
                className="text-4xl font-bold mb-8 text-white"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                2 000 KZT
                <span
                  className="text-lg font-normal"
                  style={{ color: "#8892b0" }}
                >
                  /month
                </span>
              </p>
              {[
                "Everything in Free",
                "Unlimited AI flashcards",
                "AI generation (DeepSeek)",
                "Priority support",
                "Advanced analytics",
                "Export to PDF/Anki",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3 mb-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(99,102,241,0.3)" }}
                  >
                    <Check size={11} style={{ color: "#a5b4fc" }} />
                  </div>
                  <span className="text-sm" style={{ color: "#c4c9d4" }}>
                    {f}
                  </span>
                </div>
              ))}
              <Link
                href="/register"
                className="block text-center mt-8 py-3 rounded-xl text-sm font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 0 20px rgba(99,102,241,0.3)",
                }}
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-6">
        <div
          className="max-w-4xl mx-auto text-center rounded-3xl p-16 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)",
            border: "1px solid rgba(99,102,241,0.25)",
          }}
        >
          <Zap
            size={40}
            className="mx-auto mb-6"
            style={{ color: "#6366f1" }}
          />
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Ready to remember everything?
          </h2>
          <p
            className="text-lg mb-10 max-w-xl mx-auto"
            style={{ color: "#8892b0" }}
          >
            Join thousands of students using Remindly to study smarter and score
            higher. It's free to get started.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-lg"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 0 50px rgba(99,102,241,0.4)",
            }}
          >
            Create free account <ArrowRight size={20} />
          </Link>
          <p className="mt-4 text-xs" style={{ color: "#4a5568" }}>
            No credit card required · Free forever plan available
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="py-12 px-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                }}
              >
                <BookOpen size={14} className="text-white" />
              </div>
              <span
                className="font-bold text-white"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Remindly
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { label: "Features", action: () => scrollTo("features") },
                {
                  label: "How it works",
                  action: () => scrollTo("how-it-works"),
                },
                { label: "Pricing", action: () => scrollTo("pricing") },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="text-sm bg-transparent border-none cursor-pointer transition-colors"
                  style={{ color: "#4a5568" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#8892b0")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#4a5568")
                  }
                >
                  {label}
                </button>
              ))}
              <Link
                href="/privacy"
                className="text-sm transition-colors"
                style={{ color: "#4a5568" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#8892b0")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#4a5568")}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm transition-colors"
                style={{ color: "#4a5568" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#8892b0")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#4a5568")}
              >
                Terms
              </Link>
            </div>

            <p className="text-xs" style={{ color: "#4a5568" }}>
              © 2025 Remindly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
