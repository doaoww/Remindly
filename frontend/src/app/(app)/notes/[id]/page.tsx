"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { showToast } from '@/components/ui/Toast';
import {
  ArrowLeft,
  Pin,
  Trash2,
  Sparkles,
  Save,
  Bold,
  Italic,
  List,
  Code,
  Loader2,
  CheckCircle,
  CreditCard,
  Plus,
  X,
} from "lucide-react";
import { useNotesStore } from "@/store/notes.store";
import { useFlashcardsStore, Flashcard } from "@/store/flashcards.store";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { clsx } from "clsx";

type SaveStatus = "saved" | "saving" | "unsaved";

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentNote, fetchNote, updateNote, deleteNote } = useNotesStore();
  const {
    generateFlashcards,
    fetchFlashcards,
    flashcards,
    createFlashcard,
    deleteFlashcard,
  } = useFlashcardsStore();

  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<{
    count: number;
    skipped: number;
    mode: string;
  } | null>(null);
  const [genOpen, setGenOpen] = useState(false);

  // Note's own flashcards panel
  const [showCards, setShowCards] = useState(false);
  const noteCards = flashcards.filter((c) => c.note_id === id);

  // Manual add card modal
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [newCard, setNewCard] = useState({ question: "", answer: "" });
  const [addingCard, setAddingCard] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing your notes..." }),
    ],
    content: "",
    editorProps: { attributes: { class: "tiptap focus:outline-none" } },
    onUpdate: () => setSaveStatus("unsaved"),
  });

  useEffect(() => {
    fetchNote(id);
    fetchFlashcards({ noteId: id });
  }, [id]);

  useEffect(() => {
    if (currentNote && editor) {
      setTitle(currentNote.title);
      editor.commands.setContent(currentNote.content || "");
      setSaveStatus("saved");
    }
  }, [currentNote, editor]);

  // Auto-save after 1.5s
  useEffect(() => {
    if (saveStatus !== "unsaved") return;
    const t = setTimeout(async () => {
      setSaveStatus("saving");
      await updateNote(id, { title, content: editor?.getHTML() || "" });
      setSaveStatus("saved");
    }, 1500);
    return () => clearTimeout(t);
  }, [saveStatus, title]);

  const handleDelete = async () => {
    if (!confirm("Delete this note and all its flashcards?")) return;
    await deleteNote(id);
    router.push("/notes");
  };

  const handleGenerate = async (mode: 'rule' | 'ai') => {
  setGenerating(true);
  try {
    const result = await generateFlashcards(id, mode);
    setGenResult({ count: result.generated, skipped: (result as any).skipped || 0, mode });
    await fetchFlashcards({ noteId: id });
    setShowCards(true);
    if (result.generated === 0) {
      showToast('No patterns found. Try "Term = Definition" format or use AI mode.', 'warning');
    } else {
      showToast(`Generated ${result.generated} flashcards!`, 'success');
    }
  } catch (e: any) {
    const msg = e?.response?.data?.message || 'Generation failed';
    showToast(msg, 'error');
  } finally {
    setGenerating(false);
    setGenOpen(false);
  }
};

  const handleAddCard = async () => {
    if (!newCard.question.trim() || !newCard.answer.trim()) return;
    setAddingCard(true);
    await createFlashcard({ ...newCard, noteId: id });
    await fetchFlashcards({ noteId: id });
    setAddingCard(false);
    setAddCardOpen(false);
    setNewCard({ question: "", answer: "" });
    setShowCards(true);
  };

  return (
    <div className="min-h-screen" style={{ display: "flex" }}>
      {/* ── Main Editor Area ── */}
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <button
            onClick={() => router.push("/notes")}
            className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1" />

          {/* Save status */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            {saveStatus === "saving" && (
              <>
                <Loader2 size={12} className="animate-spin" />
                Saving...
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <CheckCircle size={12} className="text-green-400" />
                Saved
              </>
            )}
            {saveStatus === "unsaved" && (
              <span className="text-yellow-400">Unsaved</span>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={
              <Pin
                size={14}
                className={currentNote?.is_pinned ? "text-[var(--accent)]" : ""}
              />
            }
            onClick={() =>
              updateNote(id, { is_pinned: !currentNote?.is_pinned } as any)
            }
          >
            {currentNote?.is_pinned ? "Pinned" : "Pin"}
          </Button>

          {/* Flashcards toggle button with count badge */}
          <button
            onClick={() => setShowCards((s) => !s)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
              showCards
                ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-hover)]",
            )}
          >
            <CreditCard size={14} />
            Cards
            {noteCards.length > 0 && (
              <span
                className={clsx(
                  "text-xs px-1.5 py-0.5 rounded-full font-bold",
                  showCards
                    ? "bg-white/20 text-white"
                    : "bg-[var(--accent)] text-white",
                )}
              >
                {noteCards.length}
              </span>
            )}
          </button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Sparkles size={14} />}
            onClick={() => setGenOpen(true)}
          >
            Generate
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaveStatus("unsaved");
          }}
          placeholder="Note title..."
          className="w-full bg-transparent text-4xl font-bold mb-6 focus:outline-none placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
          style={{ fontFamily: "Syne, sans-serif" }}
        />

        {/* Editor toolbar */}
        <div className="flex items-center gap-1 mb-4 p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
          {[
            {
              icon: Bold,
              cmd: () => editor?.chain().focus().toggleBold().run(),
              active: editor?.isActive("bold"),
            },
            {
              icon: Italic,
              cmd: () => editor?.chain().focus().toggleItalic().run(),
              active: editor?.isActive("italic"),
            },
            {
              icon: List,
              cmd: () => editor?.chain().focus().toggleBulletList().run(),
              active: editor?.isActive("bulletList"),
            },
            {
              icon: Code,
              cmd: () => editor?.chain().focus().toggleCode().run(),
              active: editor?.isActive("code"),
            },
          ].map(({ icon: Icon, cmd, active }, i) => (
            <button
              key={i}
              onClick={cmd}
              className={clsx(
                "p-2 rounded-lg transition-colors",
                active
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]",
              )}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 min-h-[400px]">
          <EditorContent editor={editor} />
        </div>

        {/* Tags */}
        {(currentNote?.tags?.length ?? 0) > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap items-center">
            {(currentNote?.tags ?? []).map((tag) => (
              <span
                key={tag.id}
                className="text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Generation success banner */}
        {genResult && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">
                Generated {genResult.count} cards
                {genResult.skipped > 0 &&
                  ` · ${genResult.skipped} duplicates skipped`}{" "}
                using {genResult.mode === "ai" ? "AI" : "pattern matching"}
              </span>
            </div>
            <button
              onClick={() => setGenResult(null)}
              className="text-green-400/50 hover:text-green-400"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Flashcards Side Panel ── */}
      {showCards && (
        <div className="w-80 border-l border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col h-screen sticky top-0">
          {/* Panel header */}
          <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h3
                className="font-semibold text-sm"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Flashcards
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {noteCards.length} cards for this note
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAddCardOpen(true)}
                className="p-1.5 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
                title="Add card manually"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => setShowCards(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Cards list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {noteCards.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">
                <CreditCard size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No cards yet</p>
                <p className="text-xs mt-1">Generate or add manually</p>
                <button
                  onClick={() => setGenOpen(true)}
                  className="mt-4 text-xs text-[var(--accent)] hover:underline flex items-center gap-1 mx-auto"
                >
                  <Sparkles size={12} /> Generate cards
                </button>
              </div>
            ) : (
              noteCards.map((card, i) => {
                const isDue = new Date(card.next_review_date) <= new Date();
                return (
                  <div
                    key={card.id}
                    className="group bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3 hover:border-[var(--border-hover)] transition-all fade-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
                        Q
                      </p>
                      <div className="flex items-center gap-1.5">
                        {isDue && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-orange-400"
                            title="Due for review"
                          />
                        )}
                        <button
                          onClick={() => deleteFlashcard(card.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-all"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-medium mb-2 line-clamp-2">
                      {card.question}
                    </p>
                    <div className="border-t border-[var(--border)] pt-2">
                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium mb-1">
                        A
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                        {card.answer}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-[var(--text-muted)]">
                        ×{card.repetition_count}
                      </span>
                      {isDue && (
                        <span className="text-[10px] text-orange-400 font-medium">
                          Due
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Panel footer */}
          {noteCards.length > 0 && (
            <div className="p-4 border-t border-[var(--border)]">
              <button
                onClick={() => router.push("/review")}
                className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={14} /> Review These Cards
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Generate Modal ── */}
      <Modal
        isOpen={genOpen}
        onClose={() => setGenOpen(false)}
        title="Generate Flashcards"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Choose how to generate flashcards from this note. Duplicates are
            automatically skipped.
          </p>
          <button
            onClick={() => handleGenerate("rule")}
            disabled={generating}
            className="w-full p-4 bg-[var(--bg-elevated)] hover:bg-[var(--border)] rounded-xl text-left transition-colors border border-[var(--border)] hover:border-[var(--accent)] disabled:opacity-50"
          >
            <p className="font-semibold text-sm">Pattern Matching</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Finds "Term = Definition", "Term: Definition", "Term — Definition"
              etc.
            </p>
          </button>
          <button
            onClick={() => handleGenerate("ai")}
            disabled={generating}
            className="w-full p-4 bg-[var(--accent-subtle)] hover:bg-[var(--accent-glow)] rounded-xl text-left transition-colors border border-[var(--accent)]/30 hover:border-[var(--accent)] disabled:opacity-50"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-[var(--accent)]" />
              <p className="font-semibold text-sm text-[var(--accent)]">
                AI Generation (Gemini)
              </p>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Works on any note format. Intelligently creates Q&A pairs.
            </p>
          </button>
          {generating && (
            <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)] py-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Generating...</span>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Add Card Manually Modal ── */}
      <Modal
        isOpen={addCardOpen}
        onClose={() => setAddCardOpen(false)}
        title="Add Flashcard"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
              Question
            </label>
            <textarea
              value={newCard.question}
              onChange={(e) =>
                setNewCard((c) => ({ ...c, question: e.target.value }))
              }
              placeholder="What is...?"
              rows={3}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
              Answer
            </label>
            <textarea
              value={newCard.answer}
              onChange={(e) =>
                setNewCard((c) => ({ ...c, answer: e.target.value }))
              }
              placeholder="The answer is..."
              rows={3}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setAddCardOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCard}
              loading={addingCard}
              disabled={!newCard.question.trim() || !newCard.answer.trim()}
            >
              Add Card
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
