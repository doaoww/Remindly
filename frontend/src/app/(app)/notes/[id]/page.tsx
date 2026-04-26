"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ArrowLeft,
  Pin,
  Trash2,
  Sparkles,
  Tag,
  Save,
  Bold,
  Italic,
  List,
  Code,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useNotesStore } from "@/store/notes.store";
import { useFlashcardsStore } from "@/store/flashcards.store";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { clsx } from "clsx";

type SaveStatus = "saved" | "saving" | "unsaved";

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentNote, fetchNote, updateNote, deleteNote } = useNotesStore();
  const { generateFlashcards } = useFlashcardsStore();

  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<{
    count: number;
    mode: string;
  } | null>(null);
  const [genOpen, setGenOpen] = useState(false);

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
  }, [saveStatus, title, editor]);

  const handleDelete = async () => {
    if (!confirm("Delete this note?")) return;
    await deleteNote(id);
    router.push("/notes");
  };

  const handleGenerate = async (mode: "rule" | "ai") => {
    setGenerating(true);
    try {
      const result = await generateFlashcards(id, mode);
      setGenResult({ count: result.generated, mode });
    } catch (e: any) {
      alert(e?.response?.data?.message || "Generation failed");
    } finally {
      setGenerating(false);
      setGenOpen(false);
    }
  };

  if (!currentNote && !editor) return null;

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto fade-up">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-8">
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
              <Loader2 size={12} className="animate-spin" /> Saving...
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <CheckCircle size={12} className="text-green-400" /> Saved
            </>
          )}
          {saveStatus === "unsaved" && (
            <span className="text-yellow-400">Unsaved changes</span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={<Pin size={14} />}
          onClick={() => updateNote(id, { is_pinned: !currentNote?.is_pinned })}
        >
          {currentNote?.is_pinned ? "Unpin" : "Pin"}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<Sparkles size={14} />}
          onClick={() => setGenOpen(true)}
        >
          Generate Cards
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
      {currentNote?.tags && currentNote.tags.length > 0 && (
        <div className="flex gap-2 mt-4 flex-wrap">
          {currentNote.tags.map((tag) => (
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

      {/* Success banner */}
      {genResult && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">
              Generated {genResult.count} flashcards using{" "}
              {genResult.mode === "ai" ? "AI" : "pattern matching"}!
            </span>
          </div>
          <button
            onClick={() => setGenResult(null)}
            className="text-green-400/50 hover:text-green-400"
          >
            <ArrowLeft size={14} className="rotate-180" />
          </button>
        </div>
      )}

      {/* Generate Modal */}
      <Modal
        isOpen={genOpen}
        onClose={() => setGenOpen(false)}
        title="Generate Flashcards"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Choose how to generate flashcards from this note:
          </p>
          <button
            onClick={() => handleGenerate("rule")}
            disabled={generating}
            className="w-full p-4 bg-[var(--bg-elevated)] hover:bg-[var(--border)] rounded-xl text-left transition-colors border border-[var(--border)] hover:border-[var(--accent)]"
          >
            <p className="font-semibold text-sm">Pattern Matching</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Detects "Term = Definition" patterns. Fast and free.
            </p>
          </button>
          <button
            onClick={() => handleGenerate("ai")}
            disabled={generating}
            className="w-full p-4 bg-[var(--accent-subtle)] hover:bg-[var(--accent-glow)] rounded-xl text-left transition-colors border border-[var(--accent)]/30 hover:border-[var(--accent)]"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-[var(--accent)]" />
              <p className="font-semibold text-sm text-[var(--accent)]">
                AI Generation
              </p>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Claude reads your notes and creates smart Q&A pairs.
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
    </div>
  );
}
