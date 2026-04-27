'use client';
import { useEffect, useState } from 'react';
import { useFlashcardsStore, Flashcard } from '@/store/flashcards.store';
import Button from '@/components/ui/Button';
import {
  CheckCircle, XCircle, RotateCcw, Trophy,
  Play, ArrowLeft, Star, Zap, Brain,
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

type Rating = 'easy' | 'hard' | 'again';

function FlashcardReview({
  card,
  onRate,
  index,
  total,
}: {
  card: Flashcard;
  onRate: (r: Rating) => void;
  index: number;
  total: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Reset flip when card changes
  useEffect(() => {
    setFlipped(false);
    setLeaving(false);
  }, [card.id]);

  const handleRate = (rating: Rating) => {
    setLeaving(true);
    setTimeout(() => {
      onRate(rating);
    }, 250);
  };

  const progress = Math.round((index / total) * 100);

  return (
    <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto w-full">
      {/* Progress bar */}
      <div className="w-full">
        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
          <span className="font-medium">{index + 1} <span className="opacity-50">/ {total}</span></span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(to right, var(--accent), #818cf8)',
            }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className="card-scene w-full cursor-pointer select-none"
        style={{ height: '320px' }}
        onClick={() => !leaving && setFlipped(f => !f)}
      >
        <div
          className={clsx(
            'card-flip',
            flipped && 'flipped',
            leaving && 'opacity-0 scale-95 transition-all duration-200'
          )}
        >
          {/* Front */}
          <div className="card-face w-full h-full bg-[var(--bg-card)] border-2 border-[var(--border)] hover:border-[var(--accent)]/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-2xl transition-colors">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-6 font-medium bg-[var(--bg-elevated)] px-3 py-1 rounded-full">
              Question
            </span>
            <p
              className="text-xl font-semibold leading-relaxed text-[var(--text-primary)] max-w-md"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              {card.question}
            </p>
            <div className="mt-8 flex items-center gap-2 text-[var(--text-muted)]">
              <div className="w-1 h-1 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs ml-1">tap to reveal</span>
            </div>
          </div>

          {/* Back */}
          <div className="card-back card-face w-full h-full rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-2xl border-2 border-[var(--accent)]/30"
            style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(91,110,245,0.08) 100%)' }}
          >
            <span className="text-[10px] text-[var(--accent)] uppercase tracking-widest mb-6 font-medium bg-[var(--accent)]/10 px-3 py-1 rounded-full">
              Answer
            </span>
            <p className="text-lg font-medium leading-relaxed text-[var(--text-primary)] max-w-md">
              {card.answer}
            </p>
          </div>
        </div>
      </div>

      {/* Hint when not flipped */}
      {!flipped && (
        <p className="text-xs text-[var(--text-muted)] text-center">
          Click the card to reveal the answer, then rate yourself
        </p>
      )}

      {/* Rating buttons — slide up when flipped */}
      <div
        className={clsx(
          'flex gap-3 w-full transition-all duration-400',
          flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        )}
      >
        <button
          onClick={() => handleRate('again')}
          className="flex-1 py-4 rounded-2xl border transition-all duration-200 text-sm flex flex-col items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: 'rgba(239,68,68,0.08)',
            borderColor: 'rgba(239,68,68,0.25)',
            color: '#f87171',
          }}
        >
          <XCircle size={22} />
          <span className="font-semibold">Again</span>
          <span className="text-[10px] opacity-60">Tomorrow</span>
        </button>

        <button
          onClick={() => handleRate('hard')}
          className="flex-1 py-4 rounded-2xl border transition-all duration-200 text-sm flex flex-col items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: 'rgba(251,191,36,0.08)',
            borderColor: 'rgba(251,191,36,0.25)',
            color: '#fbbf24',
          }}
        >
          <RotateCcw size={22} />
          <span className="font-semibold">Hard</span>
          <span className="text-[10px] opacity-60">+{Math.max(1, Math.round((card.interval_days || 1) * 0.6))}d</span>
        </button>

        <button
          onClick={() => handleRate('easy')}
          className="flex-1 py-4 rounded-2xl border transition-all duration-200 text-sm flex flex-col items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: 'rgba(52,211,153,0.08)',
            borderColor: 'rgba(52,211,153,0.25)',
            color: '#34d399',
          }}
        >
          <CheckCircle size={22} />
          <span className="font-semibold">Easy</span>
          <span className="text-[10px] opacity-60">+{Math.round((card.interval_days || 1) * 2)}d</span>
        </button>
      </div>
    </div>
  );
}

// ── Completion Screen ─────────────────────────────────────────────────────────
function CompletionScreen({
  stats,
  total,
  onRestart,
}: {
  stats: { easy: number; hard: number; again: number };
  total: number;
  onRestart: () => void;
}) {
  const accuracy = total > 0 ? Math.round((stats.easy / total) * 100) : 0;

  const getMessage = () => {
    if (accuracy >= 80) return { text: "Outstanding! 🔥", sub: "Your memory is razor sharp." };
    if (accuracy >= 60) return { text: "Great work! 💪", sub: "You're making solid progress." };
    if (accuracy >= 40) return { text: "Keep going! 📚", sub: "Practice makes perfect." };
    return { text: "Good effort! 🌱", sub: "Every review session counts." };
  };

  const { text, sub } = getMessage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-lg mx-auto text-center fade-up px-4">
      {/* Trophy animation */}
      <div
        className="w-28 h-28 rounded-3xl flex items-center justify-center mb-8 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.05))',
          border: '2px solid rgba(251,191,36,0.3)',
          animation: 'glowPulse 2s infinite',
        }}
      >
        <Trophy size={52} className="text-yellow-400" />
      </div>

      <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
        {text}
      </h1>
      <p className="text-[var(--text-secondary)] mb-10 text-lg">{sub}</p>

      {/* Accuracy ring */}
      <div className="relative w-32 h-32 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke="url(#grad)" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${accuracy * 2.51} 251`}
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5b6ef5" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{accuracy}%</span>
          <span className="text-xs text-[var(--text-muted)]">accuracy</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mb-10 w-full">
        {[
          { label: 'Easy', count: stats.easy, color: '#34d399', bg: 'rgba(52,211,153,0.1)', icon: CheckCircle },
          { label: 'Hard', count: stats.hard, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', icon: RotateCcw },
          { label: 'Again', count: stats.again, color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: XCircle },
        ].map(({ label, count, color, bg, icon: Icon }) => (
          <div
            key={label}
            className="flex-1 rounded-2xl py-4 px-2 flex flex-col items-center gap-1"
            style={{ backgroundColor: bg, border: `1px solid ${color}30` }}
          >
            <Icon size={18} style={{ color }} />
            <p className="text-2xl font-bold" style={{ color, fontFamily: 'Syne, sans-serif' }}>{count}</p>
            <p className="text-xs" style={{ color, opacity: 0.7 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* XP earned */}
      <div
        className="flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 text-sm font-medium"
        style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid rgba(91,110,245,0.2)' }}
      >
        <Zap size={15} />
        +{total * 10} XP earned this session
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/dashboard">
          <Button variant="secondary" icon={<ArrowLeft size={16} />}>Dashboard</Button>
        </Link>
        <Button icon={<Play size={16} />} onClick={onRestart}>
          Review Again
        </Button>
      </div>
    </div>
  );
}

// ── Main Review Page ──────────────────────────────────────────────────────────
export default function ReviewPage() {
  const { dueCards, fetchDueCards, reviewFlashcard } = useFlashcardsStore();
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'review' | 'done'>('intro');
  const [sessionStats, setSessionStats] = useState({ easy: 0, hard: 0, again: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDueCards().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (dueCards.length > 0) setQueue([...dueCards]);
  }, [dueCards]);

  const handleStart = () => {
    setPhase('review');
    setCurrentIdx(0);
    setSessionStats({ easy: 0, hard: 0, again: 0 });
  };

  const handleRate = async (rating: Rating) => {
    const card = queue[currentIdx];
    try {
      await reviewFlashcard(card.id, rating);
    } catch (e) {
      console.error('Review failed:', e);
    }
    setSessionStats(s => ({ ...s, [rating]: s[rating] + 1 }));

    if (currentIdx + 1 >= queue.length) {
      setPhase('done');
    } else {
      setCurrentIdx(i => i + 1);
    }
  };

  const handleRestart = () => {
    fetchDueCards().then(() => {
      setPhase('intro');
      setCurrentIdx(0);
      setSessionStats({ easy: 0, hard: 0, again: 0 });
    });
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── Done ──
  if (phase === 'done') return (
    <div className="p-8">
      <CompletionScreen
        stats={sessionStats}
        total={queue.length}
        onRestart={handleRestart}
      />
    </div>
  );

  // ── Reviewing ──
  if (phase === 'review') return (
    <div className="p-8 min-h-screen fade-up">
      <div className="flex items-center gap-3 mb-10 max-w-2xl mx-auto">
        <button
          onClick={() => setPhase('intro')}
          className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Review Mode</h1>
        <div className="flex-1" />
        <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] px-3 py-1.5 rounded-full">
          {queue.length - currentIdx - 1} remaining
        </span>
      </div>

      {queue[currentIdx] ? (
        <FlashcardReview
          card={queue[currentIdx]}
          onRate={handleRate}
          index={currentIdx}
          total={queue.length}
        />
      ) : null}
    </div>
  );

  // ── Intro ──
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[80vh] fade-up">
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, var(--accent-subtle), rgba(91,110,245,0.05))',
          border: '2px solid rgba(91,110,245,0.3)',
          animation: 'glowPulse 3s infinite',
        }}
      >
        <Brain size={40} className="text-[var(--accent)]" />
      </div>

      <h1 className="text-4xl font-bold mb-3 text-center" style={{ fontFamily: 'Syne, sans-serif' }}>
        Review Session
      </h1>

      {queue.length > 0 ? (
        <>
          <p className="text-[var(--text-secondary)] mb-3 text-center text-lg">
            You have{' '}
            <span className="text-[var(--accent)] font-semibold">{queue.length}</span>
            {' '}card{queue.length !== 1 ? 's' : ''} due for review
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-10 text-center">
            Rate each card as Easy, Hard, or Again to schedule your next review
          </p>

          {/* Stats preview */}
          <div className="flex gap-4 mb-10">
            {[
              { icon: Star, label: 'New', color: '#6366f1' },
              { icon: Brain, label: 'Learning', color: '#8b5cf6' },
              { icon: CheckCircle, label: 'Review', color: '#34d399' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2 text-sm" style={{ color }}>
                <Icon size={16} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <Button size="lg" icon={<Play size={18} />} onClick={handleStart}>
            Start Review
          </Button>
        </>
      ) : (
        <>
          <p className="text-[var(--text-secondary)] mb-3 text-center text-lg">
            🎉 You're all caught up!
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-10 text-center max-w-sm">
            No cards are due right now. Come back later or create more flashcards.
          </p>
          <div className="flex gap-3">
            <Link href="/flashcards">
              <Button variant="secondary">View Flashcards</Button>
            </Link>
            <Link href="/notes">
              <Button>Create Notes</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}