import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Version {
  id: number;
  timestamp: number;
  label: string;
  data: any;
}

export interface MakeMessage {
  id: string;
  type: "user" | "bot" | "error" | "reasoning";
  content?: string;
  image?: string;
  steps?: string[];
  label?: string;
  expanded?: boolean;
  versionName?: string;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: MakeMessage[];
  updatedAt: number;
}

interface MakeState {
  siteDocument: any;
  setSiteDocument: (doc: any) => void;
  
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  
  // UI State
  leftOpen: boolean;
  setLeftOpen: (open: boolean) => void;
  rightOpen: boolean;
  setRightOpen: (open: boolean) => void;
  previewMode: "desktop" | "tablet" | "mobile" | "fluid";
  setPreviewMode: (mode: "desktop" | "tablet" | "mobile" | "fluid") => void;
  isInspectEnabled: boolean;
  setIsInspectEnabled: (enabled: boolean) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  autoFitZoom: boolean;
  setAutoFitZoom: (auto: boolean) => void;
  gridEnabled: boolean;
  setGridEnabled: (enabled: boolean) => void;
  snapEnabled: boolean;
  setSnapEnabled: (enabled: boolean) => void;
  activeSlideOver: "audit" | "settings" | null;
  setActiveSlideOver: (mode: "audit" | "settings" | null) => void;
  leftTab: "pages" | "layers";
  setLeftTab: (tab: "pages" | "layers") => void;
  inspectTab: "properties" | "chat" | "audit" | "code" | "versions";
  setInspectTab: (tab: "properties" | "chat" | "audit" | "code" | "versions") => void;
  
  // AI State
  generationState: "idle" | "generating" | "result";
  setGenerationState: (state: "idle" | "generating" | "result") => void;
  promptText: string;
  setPromptText: (text: string) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  provider: string;
  setProvider: (provider: string) => void;
  pendingImage: string | null;
  setPendingImage: (img: string | null) => void;
  
  // Chat History
  chatThreads: ChatThread[];
  currentChatId: string | null;
  historyOpen: boolean;
  setHistoryOpen: (open: boolean) => void;
  startNewChat: () => void;
  switchChat: (id: string) => void;
  deleteChat: (id: string) => void;
  
  messages: MakeMessage[];
  setMessages: (msgs: MakeMessage[] | ((prev: MakeMessage[]) => MakeMessage[])) => void;
  ghostDiff: any | null;
  setGhostDiff: (diff: any | null) => void;
  
  // Audit State
  isAuditing: boolean;
  setIsAuditing: (isAuditing: boolean) => void;
  auditReport: any | null;
  setAuditReport: (report: any | null) => void;
  auditFilter: "all" | "error" | "warning" | "info";
  setAuditFilter: (filter: "all" | "error" | "warning" | "info") => void;
  
  versions: Version[];
  currentVersionId: number;
  addVersion: (label: string, data: any) => void;
  revertToVersion: (id: number) => void;
  
  updateSelectedNodeData: (patch: any) => void;
}

export const useMakeStore = create<MakeState>()(
  persist(
    (set, get) => ({
      siteDocument: {},
      setSiteDocument: (doc) => set({ siteDocument: doc }),
      
      selectedNodeId: null,
      setSelectedNodeId: (id) => set({ selectedNodeId: id }),
      
      leftOpen: true,
      setLeftOpen: (open) => set({ leftOpen: open }),
      rightOpen: false,
      setRightOpen: (open) => set({ rightOpen: open }),
      previewMode: "desktop",
      setPreviewMode: (mode) => set({ previewMode: mode }),
      isInspectEnabled: true,
      setIsInspectEnabled: (enabled) => set({ isInspectEnabled: enabled }),
      zoom: 100,
      setZoom: (zoom) => set({ zoom }),
      autoFitZoom: true,
      setAutoFitZoom: (auto) => set({ autoFitZoom: auto }),
      gridEnabled: false,
      setGridEnabled: (enabled) => set({ gridEnabled: enabled }),
      snapEnabled: false,
      setSnapEnabled: (enabled) => set({ snapEnabled: enabled }),
      activeSlideOver: null,
      setActiveSlideOver: (mode) => set({ activeSlideOver: mode }),
      leftTab: "layers",
      setLeftTab: (tab) => set({ leftTab: tab }),
      inspectTab: "properties",
      setInspectTab: (tab) => set({ inspectTab: tab }),
      generationState: "idle",
      setGenerationState: (state) => set({ generationState: state }),
      promptText: "",
      setPromptText: (text) => set({ promptText: text }),
      chatOpen: false,
      setChatOpen: (open) => set({ chatOpen: open }),
      provider: "gemini",
      setProvider: (provider) => set({ provider }),
      pendingImage: null,
      setPendingImage: (img) => set({ pendingImage: img }),
      
      // Chat History Implementation
      chatThreads: [],
      currentChatId: null,
      historyOpen: false,
      setHistoryOpen: (open) => set({ historyOpen: open }),
      startNewChat: () => set((state) => {
        const newId = crypto.randomUUID();
        const newThread: ChatThread = { id: newId, title: "New Chat", messages: [], updatedAt: Date.now() };
        return {
          chatThreads: [newThread, ...state.chatThreads],
          currentChatId: newId,
          messages: [],
          generationState: "idle",
          ghostDiff: null,
          historyOpen: false // Auto close history when starting new chat
        };
      }),
      switchChat: (id) => set((state) => {
        const thread = state.chatThreads.find(t => t.id === id);
        if (!thread) return state;
        return {
          currentChatId: id,
          messages: thread.messages,
          generationState: "idle",
          ghostDiff: null,
          historyOpen: false // close history when switching
        };
      }),
      deleteChat: (id) => set((state) => {
        const remaining = state.chatThreads.filter(t => t.id !== id);
        if (state.currentChatId === id) {
          if (remaining.length > 0) {
            return {
              chatThreads: remaining,
              currentChatId: remaining[0].id,
              messages: remaining[0].messages
            };
          } else {
            return {
              chatThreads: [],
              currentChatId: null,
              messages: []
            };
          }
        }
        return { chatThreads: remaining };
      }),
      
      messages: [],
      setMessages: (updater) => set((state) => {
        const newMessages = typeof updater === "function" ? updater(state.messages) : updater;
        
        // Find or create current thread
        let threadId = state.currentChatId;
        let threads = [...state.chatThreads];
        let title = "New Chat";
        
        // Auto-generate title from first user prompt
        const firstUserMsg = newMessages.find(m => m.type === "user");
        if (firstUserMsg && firstUserMsg.content) {
          title = firstUserMsg.content.length > 30 ? firstUserMsg.content.substring(0, 30) + '...' : firstUserMsg.content;
        }

        if (!threadId) {
          threadId = crypto.randomUUID();
          threads.unshift({ id: threadId, title, messages: newMessages, updatedAt: Date.now() });
        } else {
          const idx = threads.findIndex(t => t.id === threadId);
          if (idx !== -1) {
            threads[idx] = { ...threads[idx], title, messages: newMessages, updatedAt: Date.now() };
            // Move updated thread to top
            const updated = threads.splice(idx, 1)[0];
            threads.unshift(updated);
          } else {
            threads.unshift({ id: threadId, title, messages: newMessages, updatedAt: Date.now() });
          }
        }

        return { 
          messages: newMessages,
          currentChatId: threadId,
          chatThreads: threads
        };
      }),
      
      ghostDiff: null,
      setGhostDiff: (diff) => set({ ghostDiff: diff }),
      isAuditing: false,
      setIsAuditing: (isAuditing) => set({ isAuditing }),
      auditReport: null,
      setAuditReport: (report) => set({ auditReport: report }),
      auditFilter: "all",
      setAuditFilter: (filter) => set({ auditFilter: filter }),
      
      versions: [],
      currentVersionId: 0,
      addVersion: (label, data) => set((state) => {
        const maxId = state.versions.length > 0 ? Math.max(...state.versions.map(v => v.id)) : 0;
        const newId = maxId + 1;
        return {
          versions: [...state.versions, { id: newId, timestamp: Date.now(), label, data: JSON.parse(JSON.stringify(data)) }],
          currentVersionId: newId,
          siteDocument: JSON.parse(JSON.stringify(data))
        };
      }),
      revertToVersion: (id) => set((state) => {
        const version = state.versions.find(v => v.id === id);
        if (!version) return state;
        return {
          currentVersionId: id,
          siteDocument: JSON.parse(JSON.stringify(version.data))
        };
      }),
      
      updateSelectedNodeData: (patch) => set((state) => {
        if (!state.selectedNodeId) return state;
        const [section, idOrIndex] = state.selectedNodeId.split('.');
        if (!state.siteDocument[section]) return state;

        const newDoc = JSON.parse(JSON.stringify(state.siteDocument));
        if (Array.isArray(newDoc[section])) {
          const index = newDoc[section].findIndex((item: any, i: number) => 
            item.slug === idOrIndex || i.toString() === idOrIndex
          );
          if (index !== -1) {
            newDoc[section][index] = { ...newDoc[section][index], ...patch };
          }
        } else {
           if (idOrIndex) {
             if (typeof newDoc[section] === 'object') {
               newDoc[section][idOrIndex] = patch;
             }
           } else {
             newDoc[section] = { ...newDoc[section], ...patch };
           }
        }
        return { siteDocument: newDoc };
      })
    }),
    {
      name: 'make-storage',
      partialize: (state) => ({ 
        chatThreads: state.chatThreads, 
        currentChatId: state.currentChatId,
        messages: state.messages,
        versions: state.versions,
        currentVersionId: state.currentVersionId,
        siteDocument: state.siteDocument
      }),
    }
  )
);
