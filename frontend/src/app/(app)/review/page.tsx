'use client';
import { useEffect, useState } from 'react';
import { useFlashcardsStore, Flashcard } from '@/store/flashcards.store';
import Button from '@/components/ui/Button';
import { CheckCircle, XCircle, RotateCcw, Trophy, Play, ArrowLeft } from 'lucide-react';
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
  const [animating, setAnimating] = useState(false);

  const handleRate = (rating: Rating) => {
    setAnimating(true);
    setTimeout(() => {
      setFlipped(false);
      setAnimating(false);
      onRate(rating);
    }, 200);
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="w-full">
        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
          <span>{index + 1} of {total}</span>
          <span>{Math.round(((index) / total) * 100)}% done</span>
        </div>
        <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className="card-scene w-full cursor-pointer"
        style={{ height: '340px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={clsx('card-flip', flipped && 'flipped', animating && 'opacity-0 transition-opacity')}>
          {/* Front */}
          <div className="card-face w-full h-full bg-[var(--bg-card)] border-2 border-[var(--border)] hover:border-[var(--border-hover)] rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-colors shadow-2xl">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-6 font-medium">Question</span>
            <p className="text-2xl font-semibold leading-relaxed text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>
              {card.question}
            </p>
            <span className="text-xs text-[var(--text-muted)] mt-8">Tap to reveal answer</span>
          </div>

          {/* Back */}
          <div className="card-back card-face w-full h-full bg-gradient-to-br from-[var(--accent)]/10 to-purple-500/10 border-2 border-[var(--accent)]/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-2xl">
            <span className="text-xs text-[var(--accent)] uppercase tracking-widest mb-6 font-medium">Answer</span>
            <p className="text-xl font-medium leading-relaxed text-[var(--text-primary)]">{card.answer}</p>
          </div>
        </div>
      </div>

      {/* Rating buttons — only show when flipped */}
      <div className={clsx('flex gap-4 w-full transition-all duration-300', flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none')}>
        <button
          onClick={() => handleRate('again')}
          className="flex-1 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-semibold transition-all text-sm flex flex-col items-center gap-1"
        >
          <XCircle size={22} />
          Again
          <span className="text-[10px] text-red-400/60 font-normal">Reset to day 1</span>
        </button>
        <button
          onClick={() => handleRate('hard')}
          className="flex-1 py-4 rounded-2xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 hover:border-yellow-500/40 text-yellow-400 font-semibold transition-all text-sm flex flex-col items-center gap-1"
        >
          <RotateCcw size={22} />
          Hard
          <span className="text-[10px] text-yellow-400/60 font-normal">Review sooner</span>
        </button>
        <button
          onClick={() => handleRate('easy')}
          className="flex-1 py-4 rounded-2xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 text-green-400 font-semibold transition-all text-sm flex flex-col items-center gap-1"
        >
          <CheckCircle size={22} />
          Easy
          <span className="text-[10px] text-green-400/60 font-normal">+{Math.round((card.interval_days || 1) * 2)}d next</span>
        </button>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const { dueCards, fetchDueCards, reviewFlashcard } = useFlashcardsStore();
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionStats, setSessionStats] = useState({ easy: 0, hard: 0, again: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDueCards().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (dueCards.length > 0) setQueue([...dueCards]);
  }, [dueCards]);

  const handleStart = () => setStarted(true);

  const handleRate = async (rating: Rating) => {
    const card = queue[currentIdx];
    await reviewFlashcard(card.id, rating);
    setSessionStats((s) => ({ ...s, [rating]: s[rating] + 1 }));

    if (currentIdx + 1 >= queue.length) {
      setDone(true);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="skeleton w-96 h-64 rounded-3xl" />
    </div>
  );

  if (!started) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[80vh] fade-up">
      <div className="w-20 h-20 rounded-3xl bg-[var(--accent)]/20 flex items-center justify-center mb-8 shadow-2xl shadow-[var(--accent-glow)]">
        <Play size={36} className="text-[var(--accent)]" />
      </div>
      <h1 className="text-4xl font-bold mb-4 text-center" style={{ fontFamily: 'Syne, sans-serif' }}>
        Review Session
      </h1>
      {queue.length > 0 ? (
        <>
          <p className="text-[var(--text-secondary)] mb-10 text-center text-lg">
            You have <span className="text-[var(--accent)] font-semibold">{queue.length}</span> cards due for review
          </p>
          <Button size="lg" icon={<Play size={18} />} onClick={handleStart}>
            Start Review
          </Button>
        </>
      ) : (
        <>
          <p className="text-[var(--text-secondary)] mb-6 text-center">
            🎉 No cards due! You're all caught up.
          </p>
          <Link href="/flashcards">
            <Button variant="secondary">View All Flashcards</Button>
          </Link>
        </>
      )}
    </div>
  );

  if (done) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[80vh] fade-up">
      <div className="w-24 h-24 rounded-3xl bg-yellow-500/20 flex items-center justify-center mb-8 shadow-2xl">
        <Trophy size={40} className="text-yellow-400" />
      </div>
      <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Session Complete!</h1>
      <p className="text-[var(--text-secondary)] mb-10">Great work. Your memory is getting stronger.</p>

      <div className="flex gap-4 mb-10">
        {[
          { label: 'Easy', count: sessionStats.easy, color: 'text-green-400 bg-green-500/10' },
          { label: 'Hard', count: sessionStats.hard, color: 'text-yellow-400 bg-yellow-500/10' },
          { label: 'Again', count: sessionStats.again, color: 'text-red-400 bg-red-500/10' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`${color} rounded-2xl px-8 py-5 text-center`}>
            <p className="text-3xl font-bold font-[family-name:'Syne']" style={{ fontFamily: 'Syne, sans-serif' }}>{count}</p>
            <p className="text-sm mt-1 opacity-80">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard"><Button variant="secondary" icon={<ArrowLeft size={16} />}>Dashboard</Button></Link>
        <Button icon={<Play size={16} />} onClick={() => { setDone(false); setCurrentIdx(0); setStarted(false); setSessionStats({ easy: 0, hard: 0, again: 0 }); }}>
          Review Again
        </Button>
      </div>
    </div>
  );

  // Guard to prevent rendering when queue is empty or currentIdx is out of bounds
  if (started && !done && (!queue.length || !queue[currentIdx])) {
    return (
      <div className="p-8 min-h-screen fade-up">
        <div className="flex items-center gap-3 mb-10">
          <button onClick={() => setStarted(false)} className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Review Mode</h1>
        </div>
        <div className="text-center py-24 text-[var(--text-muted)]">
          <p>Loading cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen fade-up">
      <div className="flex items-center gap-3 mb-10">
        <button onClick={() => setStarted(false)} className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Review Mode</h1>
      </div>
      <FlashcardReview
        card={queue[currentIdx]}
        onRate={handleRate}
        index={currentIdx}
        total={queue.length}
      />
    </div>
  );
}