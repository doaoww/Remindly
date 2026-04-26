'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Tag, Pin, FileText, X } from 'lucide-react';
import { useNotesStore } from '@/store/notes.store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';

export default function NotesPage() {
  const { notes, tags, isLoading, fetchNotes, fetchTags, createNote } = useNotesStore();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchNotes({ search, tagId: selectedTag });
    fetchTags();
  }, []);

  const handleSearch = useCallback(() => {
    fetchNotes({ search, tagId: selectedTag });
  }, [search, selectedTag, fetchNotes]);

  useEffect(() => {
    const t = setTimeout(handleSearch, 400);
    return () => clearTimeout(t);
  }, [search, selectedTag]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const note = await createNote({ title: newTitle });
    setCreating(false);
    setCreateOpen(false);
    setNewTitle('');
    window.location.href = `/notes/${note.id}`;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 fade-up">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Notes</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">{notes.length} notes in your library</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>New Note</Button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-4 mb-6 fade-up">
        <div className="flex-1">
          <Input placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={16} />} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedTag('')}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${!selectedTag ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >All</button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id === selectedTag ? '' : tag.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${selectedTag === tag.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-24 text-[var(--text-muted)]">
          <FileText size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium text-[var(--text-secondary)]">No notes found</p>
          <p className="text-sm mt-1">Create your first note to get started</p>
          <Button className="mt-6" icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>Create Note</Button>
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
                  <span className="text-[10px] text-[var(--accent)] font-medium uppercase tracking-wider">Pinned</span>
                </div>
              )}
              <h3 className="font-semibold text-[var(--text-primary)] mb-2 line-clamp-2">{note.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] line-clamp-3 mb-4">
                {note.content?.replace(/<[^>]+>/g, '').slice(0, 150) || 'No content yet...'}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-1.5 flex-wrap">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
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

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Note">
        <div className="space-y-4">
          <Input
            label="Note Title"
            placeholder="e.g. Linear Algebra — Chapter 3"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating} disabled={!newTitle.trim()}>Create Note</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}