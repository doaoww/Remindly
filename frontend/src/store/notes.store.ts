import { create } from 'zustand';
import api from '@/lib/api';

export interface Tag { id: string; name: string; color: string; }
export interface Note {
  id: string; title: string; content: string;
  is_pinned: boolean; tags: Tag[];
  created_at: string; updated_at: string;
}

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  tags: Tag[];
  total: number;
  isLoading: boolean;
  fetchNotes: (params?: { search?: string; tagId?: string; page?: number }) => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  createNote: (data: Partial<Note & { tagIds: string[] }>) => Promise<Note>;
  updateNote: (id: string, data: Partial<Note & { tagIds: string[] }>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  fetchTags: () => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [], currentNote: null, tags: [], total: 0, isLoading: false,

  fetchNotes: async (params = {}) => {
    set({ isLoading: true });
    try {
      const res = await api.get('/notes', { params });
      set({ notes: res.data.data.notes, total: res.data.data.pagination.total, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  fetchNote: async (id) => {
    const res = await api.get(`/notes/${id}`);
    set({ currentNote: res.data.data });
  },

  createNote: async (data) => {
    const res = await api.post('/notes', data);
    const note = res.data.data;
    set((s) => ({ notes: [note, ...s.notes] }));
    return note;
  },

  updateNote: async (id, data) => {
    const res = await api.put(`/notes/${id}`, data);
    const updated = res.data.data;
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? updated : n)),
      currentNote: updated,
    }));
    return updated;
  },

  deleteNote: async (id) => {
    await api.delete(`/notes/${id}`);
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id), currentNote: null }));
  },

  fetchTags: async () => {
    const res = await api.get('/tags');
    set({ tags: res.data.data });
  },

  setCurrentNote: (note) => set({ currentNote: note }),
}));