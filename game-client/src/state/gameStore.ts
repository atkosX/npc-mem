// Central game store (Zustand). The backend is the source of truth; this store
// caches /game/state and the current conversation, and drives every API call.
import { create } from 'zustand'
import { api } from '../api/client'
import { NPCS } from '../data/npcs'
import type { GameState, MemoryEvent, NpcId, TalkResponse } from '../types'

type Screen = 'start' | 'game' | 'ending'

interface Store {
  screen: Screen
  state: GameState | null
  talk: TalkResponse | null
  selectedNpc: NpcId | null
  loading: boolean
  busyChoice: string | null
  error: string | null

  // UI panels
  showNotebook: boolean
  showDebugger: boolean
  showHowItWorks: boolean
  debug: Partial<Record<NpcId, MemoryEvent[]>>

  startGame: (reseed?: boolean) => Promise<void>
  selectNpc: (npcId: NpcId) => Promise<void>
  backToMap: () => void
  choose: (choiceId: string) => Promise<void>
  advanceDay: () => Promise<void>
  concludeGame: () => Promise<void>
  loadDebug: (npcId: NpcId) => Promise<void>
  loadAllDebug: () => Promise<void>
  toggleNotebook: () => void
  toggleDebugger: () => void
  toggleHowItWorks: (v?: boolean) => void
  clearError: () => void
}

export const useGame = create<Store>((set, get) => ({
  screen: 'start',
  state: null,
  talk: null,
  selectedNpc: null,
  loading: false,
  busyChoice: null,
  error: null,
  showNotebook: false,
  showDebugger: false,
  showHowItWorks: false,
  debug: {},

  startGame: async (reseed = false) => {
    set({ loading: true, error: null })
    try {
      const state = await api.start(reseed)
      set({
        state,
        screen: 'game',
        talk: null,
        selectedNpc: null,
        debug: {},
        showNotebook: false,
        showDebugger: false,
      })
    } catch (e) {
      set({ error: errMsg(e) })
    } finally {
      set({ loading: false })
    }
  },

  selectNpc: async (npcId) => {
    set({ selectedNpc: npcId, loading: true, error: null, talk: null })
    try {
      const talk = await api.talk(npcId)
      set({ talk })
      void get().loadDebug(npcId)
    } catch (e) {
      set({ error: errMsg(e) })
    } finally {
      set({ loading: false })
    }
  },

  backToMap: () => set({ selectedNpc: null, talk: null }),

  choose: async (choiceId) => {
    const npcId = get().selectedNpc
    if (!npcId) return
    set({ busyChoice: choiceId, error: null })
    try {
      const { state } = await api.choose(npcId, choiceId)
      set({ state })
      // Re-talk to render the next node (line + freshly-gated choices).
      const talk = await api.talk(npcId)
      set({ talk })
      void get().loadDebug(npcId)
    } catch (e) {
      set({ error: errMsg(e) })
    } finally {
      set({ busyChoice: null })
    }
  },

  advanceDay: async () => {
    set({ loading: true, error: null })
    try {
      const state = await api.advanceDay()
      set({ state, selectedNpc: null, talk: null })
      void get().loadAllDebug()
    } catch (e) {
      set({ error: errMsg(e) })
    } finally {
      set({ loading: false })
    }
  },

  concludeGame: async () => {
    set({ loading: true, error: null })
    try {
      const state = await api.conclude()
      set({ state, screen: 'ending' })
    } catch (e) {
      set({ error: errMsg(e) })
    } finally {
      set({ loading: false })
    }
  },

  loadDebug: async (npcId) => {
    try {
      const { memories } = await api.debugMemories(npcId)
      set((s) => ({ debug: { ...s.debug, [npcId]: memories } }))
    } catch {
      /* debugger is best-effort */
    }
  },

  loadAllDebug: async () => {
    await Promise.all((Object.keys(NPCS) as NpcId[]).map((id) => get().loadDebug(id)))
  },

  toggleNotebook: () => set((s) => ({ showNotebook: !s.showNotebook, showDebugger: false })),
  toggleDebugger: () => {
    const next = !get().showDebugger
    set({ showDebugger: next, showNotebook: false })
    if (next) void get().loadAllDebug()
  },
  toggleHowItWorks: (v) => set((s) => ({ showHowItWorks: v ?? !s.showHowItWorks })),
  clearError: () => set({ error: null }),
}))

function errMsg(e: unknown): string {
  if (e instanceof Error) {
    if (e.message.includes('Failed to fetch'))
      return 'Cannot reach the backend on :8000. Start it with: uvicorn api:app --port 8000'
    return e.message
  }
  return String(e)
}
