'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, CreditCard, Play, Sparkles, FileText, Check } from 'lucide-react';
import Link from 'next/link';
import { useFlashcardsStore } from '@/store/flashcards.store';
import { useNotesStore, Note } from '@/store/notes.store';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function FlashcardsPage() {
  const { flashcards, total, isLoading, fetchFlashcards, createFlashcard, deleteFlashcard, generateFlashcards } = useFlashcardsStore();
  const { notes, fetchNotes } = useNotesStore();

  // Manual create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [creating, setCreating] = useState(false);

  // Generate from notes modal
  const [genOpen, setGenOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [genMode, setGenMode] = useState<'rule' | 'ai'>('rule');
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<{ count: number } | null>(null);

  useEffect(() => {
    fetchFlashcards();
    fetchNotes();
  }, []);

  const handleCreate = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setCreating(true);
    await createFlashcard(form);
    setCreating(false);
    setCreateOpen(false);
    setForm({ question: '', answer: '' });
  };

  const handleGenerate = async () => {
    if (!selectedNote) return;
    setGenerating(true);
    setGenResult(null);
    try {
      const result = await generateFlashcards(selectedNote.id, genMode);
      setGenResult({ count: result.generated });
      await fetchFlashcards(); // refresh list
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Generation failed. Check your note has content.');
    } finally {
      setGenerating(false);
    }
  };

  const openGenModal = () => {
    setSelectedNote(null);
    setGenResult(null);
    setGenMode('rule');
    setGenOpen(true);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 fade-up">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Flashcards</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">{total} cards in your deck</p>
        </div>
        <div className="flex gap-3">
          <Link href="/review">
            <Button variant="secondary" icon={<Play size={16} />}>Start Review</Button>
          </Link>
          <Button variant="secondary" icon={<Sparkles size={16} />} onClick={openGenModal}>
            Generate from Notes
          </Button>
          <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>Add Card</Button>
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : flashcards.length === 0 ? (
        <div className="text-center py-24 text-[var(--text-muted)]">
          <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium text-[var(--text-secondary)]">No flashcards yet</p>
          <p className="text-sm mt-1">Create cards manually or generate them from your notes</p>
          <div className="flex gap-3 justify-center mt-6">
            <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>Add Card</Button>
            <Button variant="secondary" icon={<Sparkles size={16} />} onClick={openGenModal}>
              Generate from Notes
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcards.map((card, i) => {
            const isDue = new Date(card.next_review_date) <= new Date();
            return (
              <div
                key={card.id}
                className="group bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] rounded-2xl p-5 transition-all duration-200 fade-up relative"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {isDue && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-400 ring-2 ring-orange-400/20" title="Due for review" />
                )}
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2 font-medium">Question</p>
                <p className="font-medium text-sm mb-4 line-clamp-3">{card.question}</p>
                <div className="border-t border-[var(--border)] pt-3">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 font-medium">Answer</p>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{card.answer}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-muted)]">×{card.repetition_count} reviewed</span>
                    {isDue && <span className="text-[10px] text-orange-400 font-medium">Due</span>}
                  </div>
                  <button
                    onClick={() => deleteFlashcard(card.id)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Manual Create Modal ── */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Flashcard">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
              Question (Front)
            </label>
            <textarea
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              placeholder="What is photosynthesis?"
              rows={3}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
              Answer (Back)
            </label>
            <textarea
              value={form.answer}
              onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
              placeholder="The process by which plants use sunlight to produce food..."
              rows={4}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              loading={creating}
              disabled={!form.question.trim() || !form.answer.trim()}
            >
              Add Card
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Generate from Notes Modal ── */}
      <Modal isOpen={genOpen} onClose={() => { setGenOpen(false); setGenResult(null); }} title="Generate Flashcards from Note" size="md">
        <div className="space-y-5">

          {/* Success state */}
          {genResult && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
              <Check size={18} />
              <div>
                <p className="font-medium text-sm">Generated {genResult.count} flashcards!</p>
                <p className="text-xs opacity-70 mt-0.5">Cards added to your deck</p>
              </div>
            </div>
          )}

          {/* Step 1 — Pick a note */}
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Step 1 — Select a Note
            </p>
            {notes.length === 0 ? (
              <div className="text-center py-6 text-[var(--text-muted)] bg-[var(--bg-elevated)] rounded-xl">
                <FileText size={24} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No notes found. Create a note first.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      selectedNote?.id === note.id
                        ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                        : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-hover)]'
                    }`}
                  >
                    <FileText size={15} className={selectedNote?.id === note.id ? 'text-[var(--accent)] mt-0.5' : 'text-[var(--text-muted)] mt-0.5'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{note.title}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">
                        {note.content?.replace(/<[^>]+>/g, '').slice(0, 80) || 'No content'}
                      </p>
                    </div>
                    {selectedNote?.id === note.id && (
                      <Check size={15} className="text-[var(--accent)] mt-0.5 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2 — Pick mode */}
          {selectedNote && (
            <div>
              <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                Step 2 — Choose Method
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGenMode('rule')}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    genMode === 'rule'
                      ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                      : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <p className="font-semibold text-sm mb-1">Pattern Matching</p>
                  <p className="text-xs text-[var(--text-secondary)]">Finds "Term = Definition" patterns. Free & instant.</p>
                </button>
                <button
                  onClick={() => setGenMode('ai')}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    genMode === 'ai'
                      ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                      : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={13} className="text-[var(--accent)]" />
                    <p className="font-semibold text-sm text-[var(--accent)]">AI (Gemini)</p>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">Smart Q&A from any note. Needs API key.</p>
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-1">
            <Button variant="secondary" onClick={() => { setGenOpen(false); setGenResult(null); }}>
              {genResult ? 'Close' : 'Cancel'}
            </Button>
            {!genResult && (
              <Button
                onClick={handleGenerate}
                loading={generating}
                disabled={!selectedNote || generating}
                icon={<Sparkles size={15} />}
              >
                Generate Cards
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}