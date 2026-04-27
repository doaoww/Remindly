'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText, CreditCard, Flame, TrendingUp,
  ArrowRight, Clock, Play,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface Stats {
  total_notes: number;
  total_flashcards: number;
  cards_due_today: number;
  study_streak: number;
}

interface ActivityDay {
  date: string;
  count: number;
}

interface RecentNote {
  id: string;
  title: string;
  updated_at: string;
}

interface DashboardData {
  stats: Stats;
  dueCards: any[];
  weeklyActivity: ActivityDay[];
  recentNotes: RecentNote[];
}

function StatCard({
  icon: Icon, label, value, color, href,
}: {
  icon: any; label: string; value: number; color: string; href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 block"
    >
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
        style={{ backgroundColor: color, opacity: 0.12 }}
      />
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <p className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
        {value ?? 0}
      </p>
      <p className="text-sm text-[var(--text-secondary)] mt-1">{label}</p>
      <ArrowRight
        size={16}
        className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)]"
      />
    </Link>
  );
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      dateStr: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en', { weekday: 'short' }),
    };
  });
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchData = () => {
    api.get('/dashboard')
      .then((res) => {
        const raw = res.data.data;
        // Normalize stats to numbers
        setData({
          ...raw,
          stats: {
            total_notes: parseInt(raw.stats?.total_notes ?? 0),
            total_flashcards: parseInt(raw.stats?.total_flashcards ?? 0),
            cards_due_today: parseInt(raw.stats?.cards_due_today ?? 0),
            study_streak: parseInt(raw.stats?.study_streak ?? 0),
          },
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Build 7-day chart — fill missing days with 0
  const days = getLast7Days();
  const activityMap = new Map(
    (data?.weeklyActivity ?? []).map(d => [
      // handle both string dates and postgres date objects
      typeof d.date === 'string' ? d.date.split('T')[0] : d.date,
      Number(d.count),
    ])
  );
  const chartDays = days.map(d => ({
    label: d.label,
    count: activityMap.get(d.dateStr) ?? 0,
  }));
  const maxCount = Math.max(...chartDays.map(d => d.count), 1);
  const totalWeek = chartDays.reduce((s, d) => s + d.count, 0);

  // Max 5 recent notes
  const recentNotes = (data?.recentNotes ?? []).slice(0, 5);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10 fade-up">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
          Hey, {user?.full_name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">
          Here's your learning overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 fade-up">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard icon={FileText}   label="Total Notes"     value={data?.stats.total_notes ?? 0}      color="#3b82f6" href="/notes" />
            <StatCard icon={CreditCard} label="Flashcards"      value={data?.stats.total_flashcards ?? 0} color="#8b5cf6" href="/flashcards" />
            <StatCard icon={Flame}      label="Due Today"       value={data?.stats.cards_due_today ?? 0}  color="#f97316" href="/review" />
            <StatCard icon={TrendingUp} label="Study Days"      value={data?.stats.study_streak ?? 0}     color="#10b981" href="/review" />
          </>
        )}
      </div>

      {/* Bottom row — fixed height */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weekly Activity Chart */}
        <div
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 fade-up"
          style={{ height: '320px', display: 'flex', flexDirection: 'column' }}
        >
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
              Weekly Activity
            </h2>
            <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2.5 py-1 rounded-full">
              {totalWeek} reviews
            </span>
          </div>

          {loading ? (
            <div className="flex-1 skeleton rounded-xl" />
          ) : (
            <div className="flex-1 flex flex-col justify-end">
              {/* Bars */}
              <div className="flex items-end gap-2" style={{ height: '160px' }}>
                {chartDays.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                    {/* Count label */}
                    <div className="flex-shrink-0" style={{ height: '20px', display: 'flex', alignItems: 'flex-end' }}>
                      {day.count > 0 && (
                        <span className="text-[10px] font-semibold text-[var(--accent)]">
                          {day.count}
                        </span>
                      )}
                    </div>
                    {/* Bar area */}
                    <div className="flex-1 w-full flex items-end">
                      <div
                        className="w-full rounded-t-lg transition-all duration-700"
                        style={{
                          height: day.count > 0
                            ? `${Math.max((day.count / maxCount) * 100, 10)}%`
                            : '4px',
                          background: day.count > 0
                            ? 'linear-gradient(to top, #5b6ef5, #818cf8)'
                            : 'var(--bg-elevated)',
                          borderRadius: day.count > 0 ? '6px 6px 0 0' : '4px',
                          opacity: day.count > 0 ? 1 : 0.4,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Day labels */}
              <div className="flex gap-2 mt-2">
                {chartDays.map((day, i) => (
                  <div key={i} className="flex-1 text-center">
                    <span className="text-[11px] text-[var(--text-muted)] font-medium">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom stat */}
              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">
                  {totalWeek === 0 ? 'No reviews yet this week' : 'Keep the streak going! 🔥'}
                </span>
                {totalWeek === 0 && (
                  <Link href="/review" className="text-xs text-[var(--accent)] hover:underline">
                    Start reviewing →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent Notes — fixed height, max 5 */}
        <div
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 fade-up"
          style={{ height: '320px', display: 'flex', flexDirection: 'column' }}
        >
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
              Recent Notes
            </h2>
            <Link href="/notes" className="text-xs text-[var(--accent)] hover:underline">
              View all
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {loading ? (
              <div className="space-y-2">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="skeleton h-12 rounded-xl" />
                ))}
              </div>
            ) : recentNotes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)]">
                <FileText size={32} className="mb-3 opacity-20" />
                <p className="text-sm">No notes yet</p>
                <Link href="/notes" className="mt-2 text-xs text-[var(--accent)] hover:underline">
                  Create your first note →
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-0.5">
                  {recentNotes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/notes/${note.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-[var(--accent)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{note.title}</p>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {new Date(note.updated_at).toLocaleDateString('en', {
                            month: 'short', day: 'numeric',
                          })}
                        </p>
                      </div>
                      <ArrowRight
                        size={14}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] shrink-0"
                      />
                    </Link>
                  ))}
                </div>

                {/* Due cards CTA */}
                {(data?.stats.cards_due_today ?? 0) > 0 && (
                  <Link
                    href="/review"
                    className="flex items-center gap-3 p-3 rounded-xl border transition-colors mt-2 shrink-0"
                    style={{
                      backgroundColor: 'rgba(249,115,22,0.08)',
                      borderColor: 'rgba(249,115,22,0.2)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'rgba(249,115,22,0.15)' }}
                    >
                      <Play size={14} className="text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-orange-300">
                        {data?.stats.cards_due_today} card{data?.stats.cards_due_today !== 1 ? 's' : ''} due
                      </p>
                      <p className="text-xs text-orange-400/60 mt-0.5">Tap to review now</p>
                    </div>
                    <ArrowRight size={14} className="text-orange-400/50 shrink-0" />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}