import { create } from 'zustand'
import type { CategoryState } from './types'

export const useCategoryStore = create<CategoryState>((set) => ({
    category: null,
    setCategory: (category) => {
        set({ category })
    },
    reset: () => {
        set({ category: null })
    }
}))