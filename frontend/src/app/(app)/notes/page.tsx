"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pin,
  FileText,
  X,
  Tag,
  Check,
  Palette,
} from "lucide-react";
import { useNotesStore, Tag as TagType } from "@/store/notes.store";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import api from "@/lib/api";

const TAG_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#14b8a6",
  "#3b82f6",
  "#06b6d4",
];

export default function NotesPage() {
  const { notes, tags, isLoading, fetchNotes, fetchTags, createNote } =
    useNotesStore();

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  // Create note modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNoteTags, setNewNoteTags] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  // Tag management modal
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const [creatingTag, setCreatingTag] = useState(false);
  const [deletingTag, setDeletingTag] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes({});
    fetchTags();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchNotes({ search, tagId: selectedTag });
    }, 400);
    return () => clearTimeout(t);
  }, [search, selectedTag]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const note = await createNote({ title: newTitle, tagIds: newNoteTags });
    setCreating(false);
    setCreateOpen(false);
    setNewTitle("");
    setNewNoteTags([]);
    window.location.href = `/notes/${note.id}`;
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setCreatingTag(true);
    try {
      await api.post("/tags", { name: newTagName.trim(), color: newTagColor });
      await fetchTags();
      setNewTagName("");
      setNewTagColor("#6366f1");
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to create tag");
    } finally {
      setCreatingTag(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm("Delete this tag? It will be removed from all notes.")) return;
    setDeletingTag(tagId);
    try {
      await api.delete(`/tags/${tagId}`);
      await fetchTags();
      if (selectedTag === tagId) setSelectedTag("");
    } finally {
      setDeletingTag(null);
    }
  };

  const toggleNoteTag = (tagId: string) => {
    setNewNoteTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 fade-up">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Notes
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            {notes.length} notes in your library
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={<Tag size={15} />}
            onClick={() => setTagModalOpen(true)}
          >
            Manage Tags
          </Button>
          <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
            New Note
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 fade-up">
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={16} />}
        />
      </div>

      {/* Tag filters */}
      <div className="flex gap-2 flex-wrap mb-8 fade-up">
        <button
          onClick={() => setSelectedTag("")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
            !selectedTag
              ? "bg-[var(--accent)] text-white border-[var(--accent)]"
              : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-hover)]"
          }`}
        >
          All notes
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => setSelectedTag(tag.id === selectedTag ? "" : tag.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              selectedTag === tag.id
                ? "text-white border-transparent"
                : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-hover)]"
            }`}
            style={
              selectedTag === tag.id
                ? { backgroundColor: tag.color, borderColor: tag.color }
                : {}
            }
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            {tag.name}
          </button>
        ))}
        {tags.length === 0 && (
          <button
            onClick={() => setTagModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-dashed border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
          >
            <Plus size={12} /> Create your first tag
          </button>
        )}
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-24 text-[var(--text-muted)]">
          <FileText size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium text-[var(--text-secondary)]">
            {search || selectedTag
              ? "No notes match your filters"
              : "No notes yet"}
          </p>
          <p className="text-sm mt-1">
            {search || selectedTag
              ? "Try different search terms or tags"
              : "Create your first note to get started"}
          </p>
          {!search && !selectedTag && (
            <Button
              className="mt-6"
              icon={<Plus size={16} />}
              onClick={() => setCreateOpen(true)}
            >
              Create Note
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note, i) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="group bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 fade-up block"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {note.is_pinned && (
                <div className="flex items-center gap-1.5 mb-3">
                  <Pin size={12} className="text-[var(--accent)]" />
                  <span className="text-[10px] text-[var(--accent)] font-medium uppercase tracking-wider">
                    Pinned
                  </span>
                </div>
              )}
              <h3 className="font-semibold text-[var(--text-primary)] mb-2 line-clamp-2">
                {note.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] line-clamp-3 mb-4">
                {note.content?.replace(/<[^>]+>/g, "").slice(0, 150) ||
                  "No content yet..."}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-1.5 flex-wrap">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {new Date(note.updated_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Create Note Modal ── */}
      <Modal
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setNewNoteTags([]);
        }}
        title="New Note"
      >
        <div className="space-y-5">
          <Input
            label="Note Title"
            placeholder="e.g. Linear Algebra — Chapter 3"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />

          {/* Tag picker */}
          {tags.length > 0 && (
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">
                Add Tags (optional)
              </label>
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag) => {
                  const selected = newNoteTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleNoteTag(tag.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border"
                      style={
                        selected
                          ? {
                              backgroundColor: tag.color,
                              borderColor: tag.color,
                              color: "white",
                            }
                          : {
                              backgroundColor: `${tag.color}15`,
                              borderColor: `${tag.color}30`,
                              color: tag.color,
                            }
                      }
                    >
                      {selected && <Check size={11} />}
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tags.length === 0 && (
            <p className="text-xs text-[var(--text-muted)]">
              No tags yet.{" "}
              <button
                onClick={() => {
                  setCreateOpen(false);
                  setTagModalOpen(true);
                }}
                className="text-[var(--accent)] hover:underline"
              >
                Create tags
              </button>{" "}
              to organize your notes.
            </p>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setCreateOpen(false);
                setNewNoteTags([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              loading={creating}
              disabled={!newTitle.trim()}
            >
              Create Note
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Tag Management Modal ── */}
      <Modal
        isOpen={tagModalOpen}
        onClose={() => setTagModalOpen(false)}
        title="Manage Tags"
        size="md"
      >
        <div className="space-y-6">
          {/* Create new tag */}
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Create New Tag
            </p>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  placeholder="Tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                />
              </div>
              <Button
                onClick={handleCreateTag}
                loading={creatingTag}
                disabled={!newTagName.trim()}
              >
                Add
              </Button>
            </div>

            {/* Color picker */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewTagColor(color)}
                  className="w-7 h-7 rounded-lg transition-all"
                  style={{
                    backgroundColor: color,
                    outline:
                      newTagColor === color
                        ? `3px solid white`
                        : "2px solid transparent",
                    outlineOffset: "2px",
                    transform:
                      newTagColor === color ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>

            {/* Preview */}
            {newTagName && (
              <div className="mt-3">
                <p className="text-xs text-[var(--text-muted)] mb-1">
                  Preview:
                </p>
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full inline-block"
                  style={{
                    backgroundColor: `${newTagColor}20`,
                    color: newTagColor,
                  }}
                >
                  {newTagName}
                </span>
              </div>
            )}
          </div>

          {/* Existing tags */}
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Your Tags ({tags.length})
            </p>
            {tags.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-4 text-center">
                No tags yet. Create one above!
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm font-medium">{tag.name}</span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {(tag as any).note_count || 0} notes
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      disabled={deletingTag === tag.id}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
