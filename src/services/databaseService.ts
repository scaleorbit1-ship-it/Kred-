/**
 * KRED Sovereign Database Service
 * Provides cryptographic persistence for user credentials, AI chat history, and verification dossiers.
 * Stores only real user-created data (no example mock cards or fake chat histories).
 */

import { db, auth, isFirebaseConfigured } from '../firebase.config';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export interface StoredCredential {
  id: string;
  name: string;
  type: 'degree' | 'transcript' | 'test' | 'license' | 'id' | 'letter' | 'other';
  issuer: string;
  purpose: string;
  status: 'verified' | 'pending';
  dateAdded: string;
  fileSize?: string;
  extractedDetails?: {
    gpa?: string;
    score?: string;
    level?: string;
    validity?: string;
  };
}

export interface ClarificationOption {
  id: string;
  label: string;
}

export interface ClarificationQuestion {
  id: string;
  title: string;
  multiSelect?: boolean;
  options: ClarificationOption[];
}

export interface FormField {
  id: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'email' | 'tel';
  defaultValue?: string;
  required?: boolean;
}

export interface InteractiveForm {
  id: string;
  type: 'cv' | 'cover_letter' | 'assignment' | 'study_plan' | 'slides' | 'general';
  title: string;
  description: string;
  fields: FormField[];
  questions?: ClarificationQuestion[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
  actionLabel?: string;
  actionPayload?: string;
  timestamp?: string;
  questions?: ClarificationQuestion[];
  form?: InteractiveForm;
  searchResults?: Array<{ title: string; snippet: string; url: string; source?: string }>;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  category: 'cv' | 'assignment' | 'audit' | 'waiver';
  status: 'ready' | 'completed' | 'in_progress';
  prompt: string;
  createdAt?: string;
}

const STORAGE_KEYS = {
  CREDENTIALS: 'kred_vault_credentials_v2',
  THREADS: 'kred_chat_threads_v2',
  ACTIVE_THREAD: 'kred_active_thread_v2',
  TASKS: 'kred_agent_tasks_v2',
};

// Start with clean, empty data arrays
const MOCK_IDS = new Set(['c1', 'c2', 'c3', 'c4', 't1', 't2', 't3', 't4', 't5', 't6', 'task-1', 'task-2', 'task-3', 'task-4']);

/**
 * Deeply sanitizes an object before writing to Firestore.
 * Firestore rejects any document containing `undefined` values at any depth.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  return JSON.parse(JSON.stringify(data));
}

class DatabaseService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Clear legacy mock storage keys
    try {
      localStorage.removeItem('kred_vault_credentials_v1');
      localStorage.removeItem('kred_chat_threads_v1');
      localStorage.removeItem('kred_active_thread_v1');
      localStorage.removeItem('kred_agent_tasks_v1');

      // Clean any legacy mock tasks from storage
      const rawTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (rawTasks) {
        try {
          const parsed = JSON.parse(rawTasks);
          if (Array.isArray(parsed)) {
            const clean = parsed.filter((t: any) => !MOCK_IDS.has(t?.id));
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(clean));
          }
        } catch {}
      }
    } catch {
      // ignore
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Credentials Vault
  public getCredentials(): StoredCredential[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
      if (!data) {
        return [];
      }
      const parsed: StoredCredential[] = JSON.parse(data);
      // Filter out any leftover mock entries
      const clean = parsed.filter((c) => !MOCK_IDS.has(c.id));
      if (clean.length !== parsed.length) {
        this.saveCredentials(clean);
      }
      return clean;
    } catch {
      return [];
    }
  }

  public saveCredentials(creds: StoredCredential[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(creds));
      this.notify();
    } catch (err) {
      console.error('Failed to save credentials to local database', err);
    }
  }

  public addCredential(cred: Omit<StoredCredential, 'id' | 'dateAdded'>): StoredCredential {
    const all = this.getCredentials();
    const newCred: StoredCredential = {
      ...cred,
      id: `c_${Date.now()}`,
      dateAdded: 'Just now',
    };
    this.saveCredentials([newCred, ...all]);

    // Asynchronously sync to Cloud Firestore
    if (isFirebaseConfigured() && auth.currentUser) {
      try {
        const credRef = doc(db, 'users', auth.currentUser.uid, 'credentials', newCred.id);
        setDoc(credRef, sanitizeForFirestore(newCred)).catch((err) => console.warn('Firestore addCredential error:', err));
      } catch (err) {
        console.warn('Firestore sync skipped:', err);
      }
    }

    return newCred;
  }

  public removeCredential(id: string) {
    const all = this.getCredentials().filter((c) => c.id !== id);
    this.saveCredentials(all);

    if (isFirebaseConfigured() && auth.currentUser) {
      try {
        const credRef = doc(db, 'users', auth.currentUser.uid, 'credentials', id);
        deleteDoc(credRef).catch((err) => console.warn('Firestore removeCredential error:', err));
      } catch (err) {
        console.warn('Firestore delete skipped:', err);
      }
    }
  }

  public updateCredential(id: string, updates: Partial<StoredCredential>): StoredCredential | null {
    const all = this.getCredentials();
    const index = all.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const updated = { ...all[index], ...updates };
    all[index] = updated;
    this.saveCredentials([...all]);

    if (isFirebaseConfigured() && auth.currentUser) {
      try {
        const credRef = doc(db, 'users', auth.currentUser.uid, 'credentials', id);
        updateDoc(credRef, sanitizeForFirestore(updates) as any).catch((err) => console.warn('Firestore updateCredential error:', err));
      } catch (err) {
        console.warn('Firestore update skipped:', err);
      }
    }
    return updated;
  }

  // Chat Threads
  public getThreads(): ChatThread[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THREADS);
      if (!data) {
        return [];
      }
      const parsed: ChatThread[] = JSON.parse(data);
      const clean = parsed.filter((t) => !MOCK_IDS.has(t.id));
      if (clean.length !== parsed.length) {
        this.saveThreads(clean);
      }
      return clean;
    } catch {
      return [];
    }
  }

  public saveThreads(threads: ChatThread[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(threads));
      this.notify();

      // Asynchronously sync to Cloud Firestore
      if (isFirebaseConfigured() && auth.currentUser && Array.isArray(threads)) {
        threads.forEach((thread) => {
          if (thread && thread.id) {
            const threadRef = doc(db, 'users', auth.currentUser!.uid, 'threads', thread.id);
            setDoc(threadRef, sanitizeForFirestore(thread)).catch((err) => console.warn('Firestore saveThreads error:', err));
          }
        });
      }
    } catch (err) {
      console.error('Failed to save threads', err);
    }
  }

  public addMessage(threadId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const threads = this.getThreads();
    let thread = threads.find((t) => t.id === threadId);
    const newMsg: ChatMessage = {
      ...message,
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (!thread) {
      thread = {
        id: threadId,
        title: message.text.slice(0, 35) + '...',
        messages: [newMsg],
        updatedAt: 'Just now',
      };
      threads.unshift(thread);
    } else {
      thread.messages.push(newMsg);
      thread.updatedAt = 'Just now';
    }

    this.saveThreads(threads);

    // Asynchronously sync to Cloud Firestore
    if (isFirebaseConfigured() && auth.currentUser && thread) {
      try {
        const threadRef = doc(db, 'users', auth.currentUser.uid, 'threads', threadId);
        setDoc(threadRef, sanitizeForFirestore(thread)).catch((err) => console.warn('Firestore addMessage error:', err));
      } catch (err) {
        console.warn('Firestore thread sync skipped:', err);
      }
    }

    return newMsg;
  }

  public createNewThread(initialPrompt?: string): ChatThread {
    const threads = this.getThreads();
    const newThread: ChatThread = {
      id: `t_${Date.now()}`,
      title: initialPrompt ? initialPrompt.slice(0, 36) + '...' : 'New AI Conversation',
      messages: [],
      updatedAt: 'Just now',
    };
    threads.unshift(newThread);
    this.saveThreads(threads);
    return newThread;
  }

  public renameThread(threadId: string, newTitle: string) {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const threads = this.getThreads().map((t) => (t.id === threadId ? { ...t, title: trimmed, updatedAt: 'Just now' } : t));
    this.saveThreads(threads);

    if (isFirebaseConfigured() && auth.currentUser) {
      try {
        const threadRef = doc(db, 'users', auth.currentUser.uid, 'threads', threadId);
        updateDoc(threadRef, sanitizeForFirestore({ title: trimmed })).catch((err) => console.warn('Firestore renameThread error:', err));
      } catch (err) {
        console.warn('Firestore rename skipped:', err);
      }
    }
  }

  public deleteThread(threadId: string) {
    const threads = this.getThreads().filter((t) => t.id !== threadId);
    this.saveThreads(threads);

    if (isFirebaseConfigured() && auth.currentUser) {
      try {
        const threadRef = doc(db, 'users', auth.currentUser.uid, 'threads', threadId);
        deleteDoc(threadRef).catch((err) => console.warn('Firestore deleteThread error:', err));
      } catch (err) {
        console.warn('Firestore delete thread skipped:', err);
      }
    }
  }

  // Agent Tasks Management (Real User Tasks Only - No Mocks)
  public getTasks(): AgentTask[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        return [];
      }
      const parsed: AgentTask[] = JSON.parse(data);
      const clean = parsed.filter((t) => !MOCK_IDS.has(t.id));
      if (clean.length !== parsed.length) {
        this.saveTasks(clean);
      }
      return clean;
    } catch {
      return [];
    }
  }

  public saveTasks(tasks: AgentTask[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      this.notify();

      if (isFirebaseConfigured() && auth.currentUser && Array.isArray(tasks)) {
        tasks.forEach((task) => {
          if (task && task.id) {
            const taskRef = doc(db, 'users', auth.currentUser!.uid, 'tasks', task.id);
            setDoc(taskRef, sanitizeForFirestore(task)).catch((err) => console.warn('Firestore task sync error:', err));
          }
        });
      }
    } catch (err) {
      console.error('Failed to save tasks to local database', err);
    }
  }

  public addTask(task: Omit<AgentTask, 'id'> & { id?: string }): AgentTask {
    const all = this.getTasks();
    const newTask: AgentTask = {
      ...task,
      id: task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    this.saveTasks([newTask, ...all]);

    if (isFirebaseConfigured() && auth.currentUser) {
      try {
        const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', newTask.id);
        setDoc(taskRef, sanitizeForFirestore(newTask)).catch((err) => console.warn('Firestore addTask error:', err));
      } catch (err) {
        console.warn('Firestore sync task skipped:', err);
      }
    }

    return newTask;
  }

  public deleteTask(id: string) {
    const all = this.getTasks().filter((t) => t.id !== id);
    this.saveTasks(all);

    if (isFirebaseConfigured() && auth.currentUser) {
      try {
        const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', id);
        deleteDoc(taskRef).catch((err) => console.warn('Firestore deleteTask error:', err));
      } catch (err) {
        console.warn('Firestore delete task skipped:', err);
      }
    }
  }

  public clearAllData() {
    this.saveCredentials([]);
    this.saveThreads([]);
    this.saveTasks([]);
  }
}

export const dbService = new DatabaseService();
export default dbService;
