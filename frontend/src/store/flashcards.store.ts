import { create } from 'zustand';
import api from '@/lib/api';

export interface Flashcard {
  id: string; user_id: string; note_id?: string;
  question: string; answer: string;
  difficulty: number; repetition_count: number;
  ease_factor: number; interval_days: number;
  last_review_date?: string; next_review_date: string;
  created_at: string;
}

interface FlashcardsState {
  flashcards: Flashcard[];
  dueCards: Flashcard[];
  total: number;
  isLoading: boolean;
  fetchFlashcards: (params?: { noteId?: string; dueOnly?: boolean }) => Promise<void>;
  fetchDueCards: () => Promise<void>;
  createFlashcard: (data: { question: string; answer: string; noteId?: string }) => Promise<void>;
  generateFlashcards: (noteId: string, mode?: 'rule' | 'ai') => Promise<{ generated: number }>;
  reviewFlashcard: (id: string, rating: 'easy' | 'hard' | 'again') => Promise<Flashcard>;
  deleteFlashcard: (id: string) => Promise<void>;
}

export const useFlashcardsStore = create<FlashcardsState>((set) => ({
  flashcards: [], dueCards: [], total: 0, isLoading: false,

  fetchFlashcards: async (params = {}) => {
    set({ isLoading: true });
    try {
      const res = await api.get('/flashcards', { params });
      set({ flashcards: res.data.data.flashcards, total: res.data.data.pagination.total, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  fetchDueCards: async () => {
    const res = await api.get('/flashcards', { params: { dueOnly: true, limit: 100 } });
    set({ dueCards: res.data.data.flashcards });
  },

  createFlashcard: async (data) => {
    const res = await api.post('/flashcards', data);
    set((s) => ({ flashcards: [res.data.data, ...s.flashcards] }));
  },

  generateFlashcards: async (noteId, mode = 'rule') => {
    const res = await api.post('/flashcards/generate', { noteId, mode });
    return res.data.data as { generated: number; skipped: number; flashcards: Flashcard[] };
  },

  reviewFlashcard: async (id, rating) => {
    const res = await api.post(`/flashcards/${id}/review`, { rating });
    const updated = res.data.data;
    set((s) => ({
      dueCards: s.dueCards.filter((c) => c.id !== id),
      flashcards: s.flashcards.map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  },

  deleteFlashcard: async (id) => {
    await api.delete(`/flashcards/${id}`);
    set((s) => ({ flashcards: s.flashcards.filter((c) => c.id !== id) }));
  },
}));