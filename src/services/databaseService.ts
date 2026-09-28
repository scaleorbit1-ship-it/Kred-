/**
 * KRED Sovereign Database Service
 * Provides bidirectional real-time synchronization between Cloud Firestore and local client enclave.
 * Ensures credentials, AI chat history, tasks, and Sovereign Long-Term Memories follow the user across browsers, devices, and sessions.
 */

import { db, auth, isFirebaseConfigured } from '../firebase.config';
import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  collection,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

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

export interface UserMemoryItem {
  id: string;
  category: 'profile' | 'academic' | 'career' | 'preference' | 'project' | 'fact';
  fact: string;
  confidence?: number;
  createdAt: string;
  source?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Info: ', JSON.stringify(errInfo));
}

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
  private currentUserId: string | null = null;
  private unsubscribers: Unsubscribe[] = [];

  // In-memory cache for fast, synchronous UI reads
  private cachedCredentials: StoredCredential[] = [];
  private cachedThreads: ChatThread[] = [];
  private cachedTasks: AgentTask[] = [];
  private cachedMemories: UserMemoryItem[] = [];
  public isCloudSyncActive = false;

  constructor() {
    this.cleanLegacyStorage();
    this.initAuthListener();
  }

  private cleanLegacyStorage() {
    try {
      localStorage.removeItem('kred_vault_credentials_v1');
      localStorage.removeItem('kred_chat_threads_v1');
      localStorage.removeItem('kred_active_thread_v1');
      localStorage.removeItem('kred_agent_tasks_v1');
    } catch {}
  }

  private getUserStorageKey(baseKey: string): string {
    const uid = this.currentUserId || auth.currentUser?.uid || 'guest';
    return `${baseKey}_${uid}`;
  }

  private initAuthListener() {
    if (!isFirebaseConfigured()) {
      this.loadFromLocalCache();
      return;
    }

    try {
      onAuthStateChanged(auth, (user: FirebaseUser | null) => {
        this.handleAuthChange(user);
      });
    } catch (err) {
      console.warn('Firebase Auth State listener init failed:', err);
      this.loadFromLocalCache();
    }
  }

  private handleAuthChange(user: FirebaseUser | null) {
    // Unsubscribe from previous user's Firestore listeners
    this.unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch {}
    });
    this.unsubscribers = [];

    if (user) {
      this.currentUserId = user.uid;
      this.loadFromLocalCache();
      this.attachFirestoreListeners(user.uid);
    } else {
      this.currentUserId = null;
      this.loadFromLocalCache();
    }
  }

  private attachFirestoreListeners(userId: string) {
    if (!isFirebaseConfigured()) return;
    this.isCloudSyncActive = true;

    try {
      // 1. Live Sync User Profile
      const userDocRef = doc(db, 'users', userId);
      const unsubUser = onSnapshot(
        userDocRef,
        (snap) => {
          if (!snap.exists() && auth.currentUser) {
            // Auto-create user profile document if missing
            setDoc(
              userDocRef,
              sanitizeForFirestore({
                id: userId,
                name: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'User',
                email: auth.currentUser.email || '',
                role: 'student',
                createdAt: new Date().toISOString(),
              })
            ).catch((err) => handleFirestoreError(err, OperationType.WRITE, `users/${userId}`));
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, `users/${userId}`)
      );
      this.unsubscribers.push(unsubUser);

      // 2. Live Sync Credentials Vault
      const credsColRef = collection(db, 'users', userId, 'credentials');
      const unsubCreds = onSnapshot(
        credsColRef,
        (snapshot) => {
          const remoteCreds: StoredCredential[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as StoredCredential;
            if (data && data.id && !MOCK_IDS.has(data.id)) {
              remoteCreds.push(data);
            }
          });

          remoteCreds.sort((a, b) => (b.id > a.id ? 1 : -1));

          if (remoteCreds.length === 0 && this.cachedCredentials.length > 0) {
            this.cachedCredentials.forEach((cred) => {
              const credDoc = doc(db, 'users', userId, 'credentials', cred.id);
              setDoc(credDoc, sanitizeForFirestore(cred)).catch((e) =>
                handleFirestoreError(e, OperationType.CREATE, `users/${userId}/credentials/${cred.id}`)
              );
            });
          } else {
            this.cachedCredentials = remoteCreds;
            this.saveLocal('kred_vault_credentials_v2', remoteCreds);
            this.notify();
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/credentials`)
      );
      this.unsubscribers.push(unsubCreds);

      // 3. Live Sync Chat Threads & AI Messages
      const threadsColRef = collection(db, 'users', userId, 'threads');
      const unsubThreads = onSnapshot(
        threadsColRef,
        (snapshot) => {
          const remoteThreads: ChatThread[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as ChatThread;
            if (data && data.id && !MOCK_IDS.has(data.id)) {
              remoteThreads.push(data);
            }
          });

          remoteThreads.sort((a, b) => (b.id > a.id ? 1 : -1));

          if (remoteThreads.length === 0 && this.cachedThreads.length > 0) {
            this.cachedThreads.forEach((thread) => {
              const tDoc = doc(db, 'users', userId, 'threads', thread.id);
              setDoc(tDoc, sanitizeForFirestore(thread)).catch((e) =>
                handleFirestoreError(e, OperationType.CREATE, `users/${userId}/threads/${thread.id}`)
              );
            });
          } else {
            this.cachedThreads = remoteThreads;
            this.saveLocal('kred_chat_threads_v2', remoteThreads);
            this.notify();
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/threads`)
      );
      this.unsubscribers.push(unsubThreads);

      // 4. Live Sync Agent Tasks
      const tasksColRef = collection(db, 'users', userId, 'tasks');
      const unsubTasks = onSnapshot(
        tasksColRef,
        (snapshot) => {
          const remoteTasks: AgentTask[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as AgentTask;
            if (data && data.id && !MOCK_IDS.has(data.id)) {
              remoteTasks.push(data);
            }
          });

          remoteTasks.sort((a, b) => (b.id > a.id ? 1 : -1));

          if (remoteTasks.length === 0 && this.cachedTasks.length > 0) {
            this.cachedTasks.forEach((task) => {
              const taskDoc = doc(db, 'users', userId, 'tasks', task.id);
              setDoc(taskDoc, sanitizeForFirestore(task)).catch((e) =>
                handleFirestoreError(e, OperationType.CREATE, `users/${userId}/tasks/${task.id}`)
              );
            });
          } else {
            this.cachedTasks = remoteTasks;
            this.saveLocal('kred_agent_tasks_v2', remoteTasks);
            this.notify();
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/tasks`)
      );
      this.unsubscribers.push(unsubTasks);

      // 5. Live Sync Sovereign Long-Term Memory
      const memoriesColRef = collection(db, 'users', userId, 'memories');
      const unsubMemories = onSnapshot(
        memoriesColRef,
        (snapshot) => {
          const remoteMemories: UserMemoryItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as UserMemoryItem;
            if (data && data.id && data.fact) {
              remoteMemories.push(data);
            }
          });

          remoteMemories.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

          if (remoteMemories.length === 0 && this.cachedMemories.length > 0) {
            this.cachedMemories.forEach((mem) => {
              const memDoc = doc(db, 'users', userId, 'memories', mem.id);
              setDoc(memDoc, sanitizeForFirestore(mem)).catch((e) =>
                handleFirestoreError(e, OperationType.CREATE, `users/${userId}/memories/${mem.id}`)
              );
            });
          } else {
            this.cachedMemories = remoteMemories;
            this.saveLocal('kred_user_memories_v2', remoteMemories);
            this.notify();
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/memories`)
      );
      this.unsubscribers.push(unsubMemories);
    } catch (err) {
      console.warn('Error attaching Firestore listeners:', err);
    }
  }

  private loadFromLocalCache() {
    try {
      const credKey = this.getUserStorageKey('kred_vault_credentials_v2');
      const threadKey = this.getUserStorageKey('kred_chat_threads_v2');
      const taskKey = this.getUserStorageKey('kred_agent_tasks_v2');
      const memKey = this.getUserStorageKey('kred_user_memories_v2');

      const rawCreds = localStorage.getItem(credKey) || localStorage.getItem('kred_vault_credentials_v2');
      const rawThreads = localStorage.getItem(threadKey) || localStorage.getItem('kred_chat_threads_v2');
      const rawTasks = localStorage.getItem(taskKey) || localStorage.getItem('kred_agent_tasks_v2');
      const rawMem = localStorage.getItem(memKey) || localStorage.getItem('kred_user_memories_v2');

      this.cachedCredentials = rawCreds ? JSON.parse(rawCreds).filter((c: any) => !MOCK_IDS.has(c?.id)) : [];
      this.cachedThreads = rawThreads ? JSON.parse(rawThreads).filter((t: any) => !MOCK_IDS.has(t?.id)) : [];
      this.cachedTasks = rawTasks ? JSON.parse(rawTasks).filter((t: any) => !MOCK_IDS.has(t?.id)) : [];
      this.cachedMemories = rawMem ? JSON.parse(rawMem) : [];
    } catch {
      this.cachedCredentials = [];
      this.cachedThreads = [];
      this.cachedTasks = [];
      this.cachedMemories = [];
    }
    this.notify();
  }

  private saveLocal(baseKey: string, data: any) {
    try {
      const key = this.getUserStorageKey(baseKey);
      localStorage.setItem(key, JSON.stringify(data));
      // Also keep baseline key in sync for backwards compatibility
      localStorage.setItem(baseKey, JSON.stringify(data));
    } catch (err) {
      console.warn('Local storage write warning:', err);
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
    return this.cachedCredentials;
  }

  public saveCredentials(creds: StoredCredential[]) {
    this.cachedCredentials = creds.filter((c) => !MOCK_IDS.has(c.id));
    this.saveLocal('kred_vault_credentials_v2', this.cachedCredentials);
    this.notify();
  }

  public addCredential(cred: Omit<StoredCredential, 'id' | 'dateAdded'>): StoredCredential {
    const newCred: StoredCredential = {
      ...cred,
      id: `c_${Date.now()}`,
      dateAdded: 'Just now',
    };
    const updated = [newCred, ...this.cachedCredentials];
    this.saveCredentials(updated);

    // Sync to Cloud Firestore
    const userId = this.currentUserId || auth.currentUser?.uid;
    if (isFirebaseConfigured() && userId) {
      try {
        const credRef = doc(db, 'users', userId, 'credentials', newCred.id);
        setDoc(credRef, sanitizeForFirestore(newCred)).catch((err) =>
          handleFirestoreError(err, OperationType.CREATE, `users/${userId}/credentials/${newCred.id}`)
        );
      } catch (err) {
        console.warn('Firestore credential write error:', err);
      }
    }

    // Auto-record memory of newly added credential
    this.addMemory({
      category: 'academic',
      fact: `Holds verified credential "${newCred.name}" issued by "${newCred.issuer}" (${newCred.type}). Purpose: "${newCred.purpose}".`,
      confidence: 0.98,
      source: 'Sovereign Vault Upload',
    });

    return newCred;
  }

  public removeCredential(id: string) {
    const updated = this.cachedCredentials.filter((c) => c.id !== id);
    this.saveCredentials(updated);

    const userId = this.currentUserId || auth.currentUser?.uid;
    if (isFirebaseConfigured() && userId) {
      try {
        const credRef = doc(db, 'users', userId, 'credentials', id);
        deleteDoc(credRef).catch((err) =>
          handleFirestoreError(err, OperationType.DELETE, `users/${userId}/credentials/${id}`)
        );
      } catch (err) {
        console.warn('Firestore credential delete error:', err);
      }
    }
  }

  public updateCredential(id: string, updates: Partial<StoredCredential>): StoredCredential | null {
    const index = this.cachedCredentials.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const updated = { ...this.cachedCredentials[index], ...updates };
    this.cachedCredentials[index] = updated;
    this.saveCredentials([...this.cachedCredentials]);

    const userId = this.currentUserId || auth.currentUser?.uid;
    if (isFirebaseConfigured() && userId) {
      try {
        const credRef = doc(db, 'users', userId, 'credentials', id);
        updateDoc(credRef, sanitizeForFirestore(updates) as any).catch((err) =>
          handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/credentials/${id}`)
        );
      } catch (err) {
        console.warn('Firestore credential update error:', err);
      }
    }
    return updated;
  }

  // Chat Threads
  public getThreads(): ChatThread[] {
    return this.cachedThreads;
  }

  public saveThreads(threads: ChatThread[]) {
    this.cachedThreads = threads.filter((t) => !MOCK_IDS.has(t.id));
    this.saveLocal('kred_chat_threads_v2', this.cachedThreads);
    this.notify();

    const userId = this.currentUserId || auth.currentUser?.uid;
    if (isFirebaseConfigured() && userId && Array.isArray(threads)) {
      threads.forEach((thread) => {
        if (thread && thread.id) {
          const threadRef = doc(db, 'users', userId, 'threads', thread.id);
          setDoc(threadRef, sanitizeForFirestore(thread)).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, `users/${userId}/threads/${thread.id}`)
          );
        }
      });
    }
  }

  public addMessage(
    threadId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
  ): ChatMessage {
    const threads = [...this.cachedThreads];
    let thread = threads.find((t) => t.id === threadId);
    const newMsg: ChatMessage = {
      ...message,
      id: message.id || `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

    const userId = this.currentUserId || auth.currentUser?.uid;
    if (isFirebaseConfigured() && userId && thread) {
      try {
        const threadRef = doc(db, 'users', userId, 'threads', threadId);
        setDoc(threadRef, sanitizeForFirestore(thread)).catch((err) =>
          handleFirestoreError(err, OperationType.WRITE, `users/${userId}/threads/${threadId}`)
        );
      } catch (err) {
        console.warn('Firestore message sync error:', err);
      }
    }

    // Auto-extract memory from user messages
    if (message.role === 'user' && typeof message.text === 'string') {
      this.extractAndSaveMemoryFromUserText(message.text);
    }

    return newMsg;
  }

  public createNewThread(initialPrompt?: string): ChatThread {
    const threads = [...this.cachedThreads];
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
    const threads = this.cachedThreads.map((t) =>
      t.id === threadId ? { ...t, title: trimmed, updatedAt: 'Just now' } : t
    );
    this.saveThreads(threads);

    const userId = this.currentUserId || auth.currentUser?.uid;
    if (isFirebaseConfigured() && userId) {
      try {
        const threadRef = doc(db, 'users', userId, 'threads', threadId);
        updateDoc(threadRef, sanitizeForFirestore({ title: trimmed })).catch((err) =>
          handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/threads/${threadId}`)
        );
      } catch (err) {
        console.warn('Firestore rename thread error:', err);
      }
    }
  }

  public deleteThread(threadId: string) {
    const threads = this.cachedThreads.filter((t) => t.id !== threadId);
    this.saveThreads(threads);

    const userId = this.currentUserId || auth.currentUser?.uid;
    if (isFirebaseConfigured() && userId) {
      try {
        const threadRef = doc(db, 'users', userId, 'threads', threadId);
        deleteDoc(threadRef).catch((err) =>
          handleFirestoreError(err, OperationType.DELETE, `users/${userId}/threads/${threadId}`)
        );
      } catch (err) {
        console.warn('Firestore delete thread error:', err);
      }
    }
  }

  // Agent Tasks Management
  public getTasks(): AgentTask[] {
    return this.cachedTasks;
  }

  public saveTasks(tasks: AgentTask[]) {
    this.cachedTasks = tasks.filter((t) => !MOCK_IDS.has(t.id));
    this.saveLocal('kred_agent_tasks_v2', this.cachedTasks);
    this.notify();

    const userId = this.currentUserId || auth.currentUser?.uid;
    if (isFirebaseConfigured() && userId && Array.isArray(tasks)) {
      tasks.forEach((task) => {
        if (task && task.id) {
          const taskRef = doc(db, 'users', userId, 'tasks', task.id);
          setDoc(taskRef, sanitizeForFirestore(task)).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, `users/${userId}/tasks/${task.id}`)
          );
        }
      });
    }
  }

  public addTask(task: Omit<AgentTask, 'id'> & { id?: string }): AgentTask {
    const newTask: AgentTask = {
      ...task,
      id: task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...this.cachedTasks];
    this.saveTasks(updated);

    const userId = this.currentUserId || auth.currentUser?.uid;
    if (isFirebaseConfigured() && userId) {
      try {
        const taskRef = doc(db, 'users', userId, 'tasks', newTask.id);
        setDoc(taskRef, sanitizeForFirestore(newTask)).catch((err) =>
          handleFirestoreError(err, OperationType.CREATE, `users/${userId}/tasks/${newTask.id}`)
        );
      } catch (err) {
        console.warn('Firestore add task error:', err);
      }
    }

    return newTask;
  }

  public deleteTask(id: string) {
    const updated = this.cachedTasks.filter((t) => t.id !== id);
    this.saveTasks(updated);

    const userId = this.currentUserId || auth.currentUser?.uid;
    if (isFirebaseConfigured() && userId) {
      try {
        const taskRef = doc(db, 'users', userId, 'tasks', id);
        deleteDoc(taskRef).catch((err) =>
          handleFirestoreError(err, OperationType.DELETE, `users/${userId}/tasks/${id}`)
        );
      } catch (err) {
        console.warn('Firestore delete task error:', err);
      }
    }
  }

  // Sovereign Long-Term Memory Enclave
  public getMemories(): UserMemoryItem[] {
    return this.cachedMemories;
  }

  public saveMemories(memories: UserMemoryItem[]) {
    this.cachedMemories = memories;
    this.saveLocal('kred_user_memories_v2', this.cachedMemories);
    this.notify();

    const userId = this.currentUserId || auth.currentUser?.uid;
    if (isFirebaseConfigured() && userId && Array.isArray(memories)) {
      memories.forEach((mem) => {
        if (mem && mem.id) {
          const memRef = doc(db, 'users', userId, 'memories', mem.id);
          setDoc(memRef, sanitizeForFirestore(mem)).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, `users/${userId}/memories/${mem.id}`)
          );
        }
      });
    }
  }

  public addMemory(memory: Omit<UserMemoryItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): UserMemoryItem {
    // Avoid duplicate or very similar facts
    const trimmedFact = memory.fact.trim();
    if (!trimmedFact) {
      return this.cachedMemories[0];
    }

    const existingIndex = this.cachedMemories.findIndex(
      (m) => m.fact.toLowerCase() === trimmedFact.toLowerCase()
    );

    if (existingIndex !== -1) {
      // Update existing
      const updated = {
        ...this.cachedMemories[existingIndex],
        ...memory,
        createdAt: new Date().toISOString(),
      };
      this.cachedMemories[existingIndex] = updated;
      this.saveMemories([...this.cachedMemories]);
      return updated;
    }

    const newMemory: UserMemoryItem = {
      ...memory,
      fact: trimmedFact,
      id: memory.id || `mem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: memory.createdAt || new Date().toISOString(),
      confidence: memory.confidence || 0.95,
    };

    const updated = [newMemory, ...this.cachedMemories];
    this.saveMemories(updated);

    const userId = this.currentUserId || auth.currentUser?.uid;
    if (isFirebaseConfigured() && userId) {
      try {
        const memRef = doc(db, 'users', userId, 'memories', newMemory.id);
        setDoc(memRef, sanitizeForFirestore(newMemory)).catch((err) =>
          handleFirestoreError(err, OperationType.CREATE, `users/${userId}/memories/${newMemory.id}`)
        );
      } catch (err) {
        console.warn('Firestore add memory error:', err);
      }
    }

    return newMemory;
  }

  public removeMemory(id: string) {
    const updated = this.cachedMemories.filter((m) => m.id !== id);
    this.saveMemories(updated);

    const userId = this.currentUserId || auth.currentUser?.uid;
    if (isFirebaseConfigured() && userId) {
      try {
        const memRef = doc(db, 'users', userId, 'memories', id);
        deleteDoc(memRef).catch((err) =>
          handleFirestoreError(err, OperationType.DELETE, `users/${userId}/memories/${id}`)
        );
      } catch (err) {
        console.warn('Firestore delete memory error:', err);
      }
    }
  }

  public clearMemories() {
    this.saveMemories([]);
  }

  // Automatic heuristic memory extraction from user conversation
  public extractAndSaveMemoryFromUserText(text: string) {
    const raw = text.trim();
    if (raw.length < 5 || raw.startsWith('#') || raw.startsWith('[PREFERENCE_SELECTED]')) return;

    // Name extraction
    const nameMatch = raw.match(/(?:my name is|i am called|call me|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (nameMatch && !nameMatch[1].match(/^(looking|trying|hoping|interested|ready|here|glad|going|asking)$/i)) {
      this.addMemory({
        category: 'profile',
        fact: `User's name is ${nameMatch[1].trim()}.`,
        confidence: 0.95,
        source: 'User Chat Input',
      });
    }

    // Academic field / university extraction
    const schoolMatch = raw.match(/(?:i (?:study|studied|attend|graduated from)|student at|studying at|degree from)\s+([A-Za-z0-9\s&,.'-]+?)(?:\.|\n|,\s*and|;\s*|$)/i);
    if (schoolMatch && schoolMatch[1].length > 3 && schoolMatch[1].length < 80) {
      this.addMemory({
        category: 'academic',
        fact: `Academic background / Institution: ${schoolMatch[1].trim()}.`,
        confidence: 0.9,
        source: 'User Chat Input',
      });
    }

    // Target goal / program extraction
    const goalMatch = raw.match(/(?:i (?:want to apply to|am applying to|target|am targeting|plan to join|am aiming for)|target (?:university|school|role|company|job) is)\s+([A-Za-z0-9\s&,.'-]+?)(?:\.|\n|,\s*and|;\s*|$)/i);
    if (goalMatch && goalMatch[1].length > 3 && goalMatch[1].length < 80) {
      this.addMemory({
        category: 'career',
        fact: `Target goal / application: ${goalMatch[1].trim()}.`,
        confidence: 0.9,
        source: 'User Chat Input',
      });
    }

    // GPA / Academic performance extraction
    const gpaMatch = raw.match(/(?:my gpa is|gpa of|cgpa of|with a gpa|grade of)\s+([0-9.]+(?:\s*\/\s*[0-9.]+)?|\bfirst class\b|\bdistinction\b)/i);
    if (gpaMatch) {
      this.addMemory({
        category: 'academic',
        fact: `Academic GPA / grade standing: ${gpaMatch[1].trim()}.`,
        confidence: 0.95,
        source: 'User Chat Input',
      });
    }

    // Profession / Current Role extraction
    const roleMatch = raw.match(/(?:i work as (?:a|an)|i'm a|i am a|my profession is|my role is)\s+([A-Za-z0-9\s-]+?)(?:\.|\n|,\s*and|;\s*|$|with|at)/i);
    if (roleMatch && roleMatch[1].length > 3 && roleMatch[1].length < 50 && !roleMatch[1].match(/^(student|user|person|human)$/i)) {
      this.addMemory({
        category: 'career',
        fact: `Current profession / role: ${roleMatch[1].trim()}.`,
        confidence: 0.9,
        source: 'User Chat Input',
      });
    }
  }

  public clearAllData() {
    this.saveCredentials([]);
    this.saveThreads([]);
    this.saveTasks([]);
    this.saveMemories([]);
  }
}

export const dbService = new DatabaseService();
export default dbService;
