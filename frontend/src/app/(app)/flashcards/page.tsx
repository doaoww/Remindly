'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, CreditCard, Play, Sparkles, FileText, Check, FolderOpen, Folder, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { useFlashcardsStore, Flashcard } from '@/store/flashcards.store';
import { useNotesStore, Note } from '@/store/notes.store';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';

type ViewMode = 'folders' | 'note';

export default function FlashcardsPage() {
  const { flashcards, total, isLoading, fetchFlashcards, createFlashcard, deleteFlashcard, generateFlashcards } = useFlashcardsStore();
  const { notes, fetchNotes } = useNotesStore();

  const [viewMode, setViewMode] = useState<ViewMode>('folders');
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  // Manual create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [creating, setCreating] = useState(false);

  // Generate modal
  const [genOpen, setGenOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [genMode, setGenMode] = useState<'rule' | 'ai'>('rule');
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<{ count: number; skipped?: number } | null>(null);

  useEffect(() => {
    fetchFlashcards();
    fetchNotes();
  }, []);

  // Group flashcards by note
  const noteMap = new Map(notes.map(n => [n.id, n]));

  // Cards with a note (in folders)
  const cardsByNote = new Map<string, Flashcard[]>();
  // Cards without a note (standalone)
  const standaloneCards: Flashcard[] = [];

  flashcards.forEach(card => {
    if (card.note_id) {
      const existing = cardsByNote.get(card.note_id) || [];
      cardsByNote.set(card.note_id, [...existing, card]);
    } else {
      standaloneCards.push(card);
    }
  });

  // Folders = notes that have at least 1 flashcard
  const folders = Array.from(cardsByNote.entries()).map(([noteId, cards]) => ({
    note: noteMap.get(noteId),
    noteId,
    cards,
    dueCount: cards.filter(c => new Date(c.next_review_date) <= new Date()).length,
  }));

  const handleCreate = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setCreating(true);
    await createFlashcard({ ...form, noteId: activeNote?.id });
    await fetchFlashcards();
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
    setGenResult({ count: result.generated, skipped: (result as any).skipped });
    await fetchFlashcards();
    if (result.generated === 0) {
      showToast('No patterns found in this note. Try AI mode or use "Term = Definition" format.', 'warning');
    } else {
      showToast(`Generated ${result.generated} cards!`, 'success');
    }
  } catch (e: any) {
    const msg = e?.response?.data?.message || 'Generation failed';
    showToast(msg, 'error');
  } finally {
    setGenerating(false);
  }
};

  const openFolder = (note: Note | undefined, noteId: string) => {
    if (note) {
      setActiveNote(note);
      setViewMode('note');
    }
  };

  const activeCards = activeNote
    ? (cardsByNote.get(activeNote.id) || [])
    : standaloneCards;

  // ── Folder view ──────────────────────────────────────────────────────────────
  if (viewMode === 'folders') return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 fade-up">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Flashcards</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            {total} cards · {folders.length} folders
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/review">
            <Button variant="secondary" icon={<Play size={16} />}>Review All Due</Button>
          </Link>
          <Button
            variant="secondary"
            icon={<Sparkles size={16} />}
            onClick={() => { setSelectedNote(null); setGenResult(null); setGenOpen(true); }}
          >
            Generate
          </Button>
          <Button icon={<Plus size={16} />} onClick={() => { setActiveNote(null); setCreateOpen(true); }}>
            Add Card
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Note folders */}
          {folders.map(({ note, noteId, cards, dueCount }, i) => (
            <button
              key={noteId}
              onClick={() => openFolder(note, noteId)}
              className="group bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)]/40 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-left fade-up relative overflow-hidden"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Folder accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ background: 'linear-gradient(to right, var(--accent), #818cf8)' }}
              />

              <div className="flex items-start justify-between mb-4 mt-1">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center">
                  <FolderOpen size={20} className="text-[var(--accent)]" />
                </div>
                {dueCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">
                    {dueCount} due
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-sm mb-1 truncate">
                {note?.title || 'Unknown Note'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                {cards.length} card{cards.length !== 1 ? 's' : ''}
              </p>

              {/* Mini card preview */}
              <div className="space-y-1">
                {cards.slice(0, 2).map(card => (
                  <div key={card.id} className="text-[10px] text-[var(--text-secondary)] truncate bg-[var(--bg-elevated)] px-2 py-1 rounded-lg">
                    {card.question}
                  </div>
                ))}
                {cards.length > 2 && (
                  <div className="text-[10px] text-[var(--text-muted)] px-2">
                    +{cards.length - 2} more...
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 mt-4 text-[var(--accent)] text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Open folder <ChevronRight size={12} />
              </div>
            </button>
          ))}

          {/* Standalone cards folder */}
          {standaloneCards.length > 0 && (
            <button
              onClick={() => { setActiveNote(null); setViewMode('note'); }}
              className="group bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-left fade-up relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-[var(--bg-elevated)]" />
              <div className="flex items-start justify-between mb-4 mt-1">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center">
                  <Folder size={20} className="text-[var(--text-muted)]" />
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-1">Standalone Cards</h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                {standaloneCards.length} card{standaloneCards.length !== 1 ? 's' : ''} · not linked to a note
              </p>
              <div className="flex items-center gap-1 mt-4 text-[var(--text-muted)] text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Open folder <ChevronRight size={12} />
              </div>
            </button>
          )}

          {/* Empty state */}
          {folders.length === 0 && standaloneCards.length === 0 && (
            <div className="col-span-full text-center py-24 text-[var(--text-muted)]">
              <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium text-[var(--text-secondary)]">No flashcards yet</p>
              <p className="text-sm mt-1 mb-6">Generate from notes or create manually</p>
              <div className="flex gap-3 justify-center">
                <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
                  Add Card
                </Button>
                <Button
                  variant="secondary"
                  icon={<Sparkles size={16} />}
                  onClick={() => setGenOpen(true)}
                >
                  Generate from Notes
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <CreateCardModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        form={form}
        setForm={setForm}
        onCreate={handleCreate}
        creating={creating}
        noteLabel={activeNote?.title}
      />
      <GenerateModal
        isOpen={genOpen}
        onClose={() => { setGenOpen(false); setGenResult(null); }}
        notes={notes}
        selectedNote={selectedNote}
        setSelectedNote={setSelectedNote}
        genMode={genMode}
        setGenMode={setGenMode}
        generating={generating}
        genResult={genResult}
        onGenerate={handleGenerate}
      />
    </div>
  );

  // ── Note folder view ──────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 fade-up">
        <button
          onClick={() => { setViewMode('folders'); setActiveNote(null); }}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
        >
          <CreditCard size={16} />
          Flashcards
        </button>
        <ChevronRight size={14} className="text-[var(--text-muted)]" />
        <span className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
          <FolderOpen size={16} className="text-[var(--accent)]" />
          {activeNote?.title || 'Standalone Cards'}
        </span>
        <div className="flex-1" />
        <div className="flex gap-3">
          {activeNote && (
            <Link href={`/notes/${activeNote.id}`}>
              <Button variant="ghost" size="sm" icon={<FileText size={14} />}>
                Open Note
              </Button>
            </Link>
          )}
          <Button
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setCreateOpen(true)}
          >
            Add Card
          </Button>
        </div>
      </div>

      {/* Cards count */}
      <p className="text-[var(--text-secondary)] text-sm mb-6">
        {activeCards.length} card{activeCards.length !== 1 ? 's' : ''}
        {activeCards.filter(c => new Date(c.next_review_date) <= new Date()).length > 0 && (
          <span className="ml-2 text-orange-400">
            · {activeCards.filter(c => new Date(c.next_review_date) <= new Date()).length} due
          </span>
        )}
      </p>

      {/* Cards grid */}
      {activeCards.length === 0 ? (
        <div className="text-center py-24 text-[var(--text-muted)]">
          <CreditCard size={40} className="mx-auto mb-4 opacity-20" />
          <p className="text-[var(--text-secondary)] font-medium mb-1">No cards in this folder</p>
          <p className="text-sm mb-6">Add cards manually or generate from the note</p>
          <div className="flex gap-3 justify-center">
            <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
              Add Card
            </Button>
            {activeNote && (
              <Button
                variant="secondary"
                icon={<Sparkles size={16} />}
                onClick={() => { setSelectedNote(activeNote); setGenOpen(true); }}
              >
                Generate from Note
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCards.map((card, i) => {
            const isDue = new Date(card.next_review_date) <= new Date();
            return (
              <div
                key={card.id}
                className="group bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] rounded-2xl p-5 transition-all duration-200 fade-up relative"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {isDue && (
                  <div
                    className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-400 ring-2"
                    style={{ boxShadow: '0 0 0 3px rgba(251,146,60,0.2)' }}
                    title="Due for review"
                  />
                )}
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2 font-medium">
                  Question
                </p>
                <p className="font-medium text-sm mb-4 line-clamp-3 pr-4">{card.question}</p>
                <div className="border-t border-[var(--border)] pt-3">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 font-medium">
                    Answer
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{card.answer}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      ×{card.repetition_count} reviewed
                    </span>
                    {isDue && (
                      <span className="text-[10px] text-orange-400 font-medium">Due</span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteFlashcard(card.id).then(() => fetchFlashcards())}
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

      {/* Modals */}
      <CreateCardModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        form={form}
        setForm={setForm}
        onCreate={handleCreate}
        creating={creating}
        noteLabel={activeNote?.title}
      />
      <GenerateModal
        isOpen={genOpen}
        onClose={() => { setGenOpen(false); setGenResult(null); }}
        notes={notes}
        selectedNote={selectedNote ?? activeNote}
        setSelectedNote={setSelectedNote}
        genMode={genMode}
        setGenMode={setGenMode}
        generating={generating}
        genResult={genResult}
        onGenerate={handleGenerate}
      />
    </div>
  );
}

// ── Reusable Modals ───────────────────────────────────────────────────────────
function CreateCardModal({ isOpen, onClose, form, setForm, onCreate, creating, noteLabel }: any) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Flashcard" size="sm">
      <div className="space-y-4">
        {noteLabel && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--accent-subtle)] rounded-xl border border-[var(--accent)]/20">
            <FolderOpen size={13} className="text-[var(--accent)]" />
            <span className="text-xs text-[var(--accent)] font-medium truncate">{noteLabel}</span>
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
            Question (Front)
          </label>
          <textarea
            value={form.question}
            onChange={(e: any) => setForm((f: any) => ({ ...f, question: e.target.value }))}
            placeholder="What is...?"
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
            onChange={(e: any) => setForm((f: any) => ({ ...f, answer: e.target.value }))}
            placeholder="The answer is..."
            rows={3}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={onCreate}
            loading={creating}
            disabled={!form.question.trim() || !form.answer.trim()}
          >
            Add Card
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function GenerateModal({
  isOpen, onClose, notes, selectedNote, setSelectedNote,
  genMode, setGenMode, generating, genResult, onGenerate,
}: any) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Flashcards" size="md">
      <div className="space-y-5">
        {genResult && (
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
            <Check size={18} />
            <div>
              <p className="font-medium text-sm">Generated {genResult.count} flashcards!</p>
              {genResult.skipped > 0 && (
                <p className="text-xs opacity-70 mt-0.5">{genResult.skipped} duplicates skipped</p>
              )}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Select Note
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {notes.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">
                No notes found. Create a note first.
              </p>
            ) : notes.map((note: Note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  selectedNote?.id === note.id
                    ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                    : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-hover)]'
                }`}
              >
                <FileText size={14} className={selectedNote?.id === note.id ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} />
                <span className="text-sm font-medium truncate flex-1">{note.title}</span>
                {selectedNote?.id === note.id && <Check size={14} className="text-[var(--accent)] shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {selectedNote && (
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Method
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
                <p className="text-xs text-[var(--text-secondary)]">
                  "Term = Definition" patterns. Fast & free.
                </p>
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
                <p className="text-xs text-[var(--text-secondary)]">
                  Smart Q&A from any note format.
                </p>
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-1">
          <Button variant="secondary" onClick={onClose}>
            {genResult ? 'Close' : 'Cancel'}
          </Button>
          {!genResult && (
            <Button
              onClick={onGenerate}
              loading={generating}
              disabled={!selectedNote || generating}
              icon={<Sparkles size={15} />}
            >
              Generate
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}