'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, CreditCard, Flame, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface DashboardData {
  stats: { total_notes: string; total_flashcards: string; cards_due_today: string; study_streak: string };
  dueCards: any[];
  weeklyActivity: { date: string; count: string }[];
  recentNotes: { id: string; title: string; updated_at: string }[];
}

function StatCard({ icon: Icon, label, value, color, href }: any) {
  return (
    <Link href={href} className="group relative overflow-hidden bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg block">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 ${color} -translate-y-1/2 translate-x-1/2 pointer-events-none`} />
      <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-20 flex items-center justify-center mb-4`}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
      <p className="text-3xl font-bold font-[family-name:'Syne']" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
      <p className="text-sm text-[var(--text-secondary)] mt-1">{label}</p>
      <ArrowRight size={16} className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)]" />
    </Link>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/dashboard').then((res) => {
      setData(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const maxActivity = Math.max(...(data?.weeklyActivity.map((d) => parseInt(d.count)) || [1]), 1);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10 fade-up">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
          Hey, {user?.full_name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Here's your learning overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)
        ) : (
          <>
            <StatCard icon={FileText} label="Total Notes" value={data?.stats.total_notes || 0} color="bg-blue-500" href="/notes" />
            <StatCard icon={CreditCard} label="Flashcards" value={data?.stats.total_flashcards || 0} color="bg-purple-500" href="/flashcards" />
            <StatCard icon={Flame} label="Due Today" value={data?.stats.cards_due_today || 0} color="bg-orange-500" href="/review" />
            <StatCard icon={TrendingUp} label="Study Days" value={data?.stats.study_streak || 0} color="bg-green-500" href="/review" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 fade-up">
          <h2 className="text-lg font-semibold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Weekly Activity</h2>
          {data?.weeklyActivity.length ? (
            <div className="flex items-end gap-2 h-32">
              {data.weeklyActivity.map((d) => {
                const pct = (parseInt(d.count) / maxActivity) * 100;
                const day = new Date(d.date).toLocaleDateString('en', { weekday: 'short' });
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-[var(--bg-elevated)] rounded-lg overflow-hidden" style={{ height: '80px' }}>
                      <div
                        className="w-full bg-[var(--accent)] rounded-lg transition-all duration-500"
                        style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">{day}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-[var(--text-muted)]">
              <p className="text-sm">No reviews this week yet</p>
              <Link href="/review" className="mt-2 text-xs text-[var(--accent)] hover:underline">Start reviewing →</Link>
            </div>
          )}
        </div>

        {/* Recent Notes */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 fade-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>Recent Notes</h2>
            <Link href="/notes" className="text-xs text-[var(--accent)] hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {data?.recentNotes.length ? data.recentNotes.map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
                  <FileText size={14} className="text-[var(--accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{note.title}</p>
                  <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                    <Clock size={10} />
                    {new Date(note.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)]" />
              </Link>
            )) : (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <p className="text-sm">No notes yet</p>
                <Link href="/notes" className="mt-2 text-xs text-[var(--accent)] hover:underline">Create your first note →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}