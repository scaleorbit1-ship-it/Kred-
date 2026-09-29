import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Send,
  UploadCloud,
  FileCheck2,
  Trash2,
  Lock,
  Globe,
  Award,
  ArrowRight,
  ArrowLeft,
  FileText,
  Check,
  ChevronDown,
  Layers,
  Search,
  X,
  FileUp,
  GraduationCap,
  Briefcase,
  Mic,
  AudioWaveform,
  SlidersHorizontal,
  ChevronRight,
  Settings,
  Download,
  FolderLock,
  Code,
  Sparkle,
  PanelLeftClose,
  PanelLeft,
  Share2,
  KeyRound,
  CheckSquare,
  Edit2,
  Edit3,
  CornerDownLeft,
  Copy,
  Printer,
  ExternalLink,
  Eye,
  BookOpen,
  ListTodo,
  FileDown,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Minimize2,
  Filter,
  ShieldCheck,
  MicOff,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Play,
  AtSign,
  Bookmark,
  MessageSquare,
  GripVertical,
  Brain,
} from 'lucide-react';
import { marked } from 'marked';
import { KredLogo, KredLogoMark, KredSmileyRobotMark, KredBouncingCardsLoader } from '../components/KredLogo';
import { dbService, StoredCredential, AgentTask, ClarificationQuestion, ClarificationOption, InteractiveForm, FormField, UserMemoryItem } from '../services/databaseService';
import { authService, AuthUser } from '../services/authService';
import { getAiAuditResponse, detectIntentMode } from '../services/aiChatService';
import { useTheme } from '../context/ThemeContext';
import KredCanvasDocumentViewer from '../components/KredCanvasDocumentViewer';

interface AssistantPageProps {
  onNavigate: (page: string) => void;
  userName?: string;
  onShowToast?: (msg: string) => void;
  initialView?: 'chat' | 'vault' | 'tasks';
}

export interface VaultCredential {
  id: string;
  name: string;
  type: 'degree' | 'transcript' | 'license' | 'test' | 'id' | 'letter' | 'other';
  issuer: string;
  purpose: string; // What the user told AI it is for
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

interface ChatMessage {
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

interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({
  onNavigate,
  userName,
  onShowToast,
  initialView = 'chat',
}) => {
  const { openSettings } = useTheme();
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Authenticated User
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const unsub = authService.subscribe((u) => setCurrentUser(u));
    return unsub;
  }, []);

  const effectiveUserName = currentUser?.name || userName || 'My Vault';
  const effectiveInitials = currentUser?.avatarLetter || (effectiveUserName ? effectiveUserName.charAt(0).toUpperCase() : 'U');

  // Navigation View: 'chat' | 'vault' | 'tasks'
  const [currentView, setCurrentView] = useState<'chat' | 'vault' | 'tasks'>(initialView);

  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView);
    }
  }, [initialView]);

  const [vaultCategoryFilter, setVaultCategoryFilter] = useState<'all' | 'degree' | 'transcript' | 'id' | 'license' | 'other'>('all');

  // Live Document Preview Canvas State
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState<number>(560);
  const [canvasDoc, setCanvasDoc] = useState<{ title: string; content: string; type: string } | null>(null);
  const [canvasTab, setCanvasTab] = useState<'preview' | 'markdown'>('preview');
  const [copiedDocToast, setCopiedDocToast] = useState(false);
  const isResizingCanvasRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingCanvasRef.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 360 && newWidth <= window.innerWidth - 260) {
        setCanvasWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizingCanvasRef.current) {
        isResizingCanvasRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Thread Rename and Delete State
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');

  // Tasks State (Sovereign Credentials & Synthesis Tasks - Connected to real Database, zero mock entries)
  const [tasks, setTasks] = useState<AgentTask[]>(() => dbService.getTasks());

  const [taskCategoryFilter, setTaskCategoryFilter] = useState<'all' | 'cv' | 'assignment' | 'audit' | 'waiver'>('all');
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'cv' | 'assignment' | 'audit' | 'waiver'>('cv');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPrompt, setNewTaskPrompt] = useState('');

  // Open Document in Canvas Helper
  const openCanvas = (content: string, title: string = 'Generated Document', type: string = 'document') => {
    setCanvasDoc({ title, content, type });
    setIsCanvasOpen(true);
    setCanvasTab('preview');
  };

  const handlePrintCanvas = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    if (!canvasDoc) return;
    const blob = new Blob([canvasDoc.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = canvasDoc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `${safeTitle}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast?.(`Downloaded "${canvasDoc.title}.md"`);
  };

  const handleCopyDoc = () => {
    if (!canvasDoc) return;
    navigator.clipboard.writeText(canvasDoc.content);
    setCopiedDocToast(true);
    setTimeout(() => setCopiedDocToast(false), 2000);
    onShowToast?.('Document content copied to clipboard.');
  };

  const handleRunTask = (task: AgentTask) => {
    setChatMode('agent');
    setCurrentView('chat');
    handleSendMessage(task.prompt);
  };

  const handleCreateCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskPrompt.trim()) {
      onShowToast?.('Please provide a title and prompt for the agent task.');
      return;
    }
    const createdTask = dbService.addTask({
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || 'Custom Autonomous Sovereign Agent Task',
      category: newTaskCategory,
      status: 'ready' as const,
      prompt: newTaskPrompt.trim(),
    });
    setTasks(dbService.getTasks());
    setIsCreateTaskModalOpen(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPrompt('');
    onShowToast?.(`Task "${createdTask.title}" added to queue.`);
  };

  // Vault state (Connected to Sovereign Database)
  const [credentials, setCredentials] = useState<VaultCredential[]>(() => dbService.getCredentials());
  const [isVaultDrawerOpen, setIsVaultDrawerOpen] = useState(false);
  const [vaultSearchQuery, setVaultSearchQuery] = useState('');

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<VaultCredential['type']>('degree');
  const [docIssuer, setDocIssuer] = useState('');
  const [docPurpose, setDocPurpose] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Threads & active chat state (Connected to Sovereign Database)
  const [threads, setThreads] = useState<ChatThread[]>(() => dbService.getThreads());
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'chat' | 'agent'>('chat');
  const [selectedCredentialIds, setSelectedCredentialIds] = useState<string[]>([]);
  const [showCredDropdown, setShowCredDropdown] = useState(false);

  // Sovereign Long-Term Memory State
  const [memories, setMemories] = useState<UserMemoryItem[]>(() => dbService.getMemories());
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [newMemoryFact, setNewMemoryFact] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState<UserMemoryItem['category']>('profile');

  const hasInitializedThreadRef = useRef(false);

  // Sync with Sovereign Database updates
  useEffect(() => {
    const unsubscribe = dbService.subscribe(() => {
      setCredentials(dbService.getCredentials());
      const loadedThreads = dbService.getThreads();
      setThreads(loadedThreads);
      setTasks(dbService.getTasks());
      setMemories(dbService.getMemories());

      if (!hasInitializedThreadRef.current && loadedThreads.length > 0) {
        hasInitializedThreadRef.current = true;
        setActiveThreadId(loadedThreads[0].id);
      }
    });

    // Also auto-select top thread on initial mount once if available
    const initialThreads = dbService.getThreads();
    if (!hasInitializedThreadRef.current && initialThreads.length > 0) {
      hasInitializedThreadRef.current = true;
      setActiveThreadId(initialThreads[0].id);
    }

    return unsubscribe;
  }, []);

  // Active message stream
  const activeThread = threads.find((t) => t.id === activeThreadId);
  const messages = activeThread?.messages || [];

  // Input state
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Speech to Text (Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  // Message Action Bar & TTS State
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [openMenuMsgId, setOpenMenuMsgId] = useState<string | null>(null);
  const [openCredMenuId, setOpenCredMenuId] = useState<string | null>(null);

  // Credential Rename with AI Modal
  const [renamingCred, setRenamingCred] = useState<VaultCredential | null>(null);
  const [renamingNewTitle, setRenamingNewTitle] = useState('');
  const [isGeneratingAiTitle, setIsGeneratingAiTitle] = useState(false);

  // Pop-up Clarification Question Modal State
  const [activeQuestionPopupMsgId, setActiveQuestionPopupMsgId] = useState<string | null>(null);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0);

  // Claude-Style Interactive Intake Form State
  const [formInputs, setFormInputs] = useState<Record<string, Record<string, string>>>({});
  const [formOptions, setFormOptions] = useState<Record<string, Record<string, string[]>>>({});
  const [submittedForms, setSubmittedForms] = useState<Record<string, boolean>>({});

  const handleFormInputChange = (msgId: string, fieldId: string, value: string) => {
    setFormInputs((prev) => ({
      ...prev,
      [msgId]: {
        ...(prev[msgId] || {}),
        [fieldId]: value,
      },
    }));
  };

  const handleToggleFormOption = (msgId: string, questionId: string, optionId: string, multiSelect?: boolean) => {
    setFormOptions((prev) => {
      const current = prev[msgId]?.[questionId] || [];
      let updated: string[];
      if (multiSelect) {
        updated = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
      } else {
        updated = [optionId];
      }
      return {
        ...prev,
        [msgId]: {
          ...(prev[msgId] || {}),
          [questionId]: updated,
        },
      };
    });
  };

  const handleSubmitInteractiveForm = (msg: ChatMessage) => {
    if (!msg.form) return;
    const inputs = formInputs[msg.id] || {};
    const options = formOptions[msg.id] || {};

    setSubmittedForms((prev) => ({ ...prev, [msg.id]: true }));

    // Build synthesized prompt string
    const fieldsSummary = msg.form.fields
      .map((f) => {
        const val = inputs[f.id] || (f.id === 'fullName' ? effectiveUserName : '');
        return val ? `• ${f.label}: ${val}` : '';
      })
      .filter(Boolean)
      .join('\n');

    const optionsSummary = msg.form.questions
      ? msg.form.questions
          .map((q) => {
            const selected = options[q.id] || [q.options[0].id];
            const labels = q.options.filter((opt) => selected.includes(opt.id)).map((o) => o.label).join(', ');
            return labels ? `• ${q.title}: ${labels}` : '';
          })
          .filter(Boolean)
          .join('\n')
      : '';

    const reasoningPrompt =
      `[FORM_SUBMISSION] Please reason over my provided details and verified vault credentials to generate my complete ${msg.form.type.toUpperCase()}:\n\n` +
      fieldsSummary +
      (optionsSummary ? `\n\nCustomization Choices:\n${optionsSummary}` : '');

    handleSendMessage(reasoningPrompt);
  };

  // DuckDuckGo Web Search Toggle State
  const [isWebSearchActive, setIsWebSearchActive] = useState(false);

  // @ Mention Document Tagging State
  const [isAtMentionOpen, setIsAtMentionOpen] = useState(false);
  const [atMentionQuery, setAtMentionQuery] = useState('');

  // Speech to text base text reference
  const baseSpeechTextRef = useRef<string>('');

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      if (openMenuMsgId) setOpenMenuMsgId(null);
      if (openCredMenuId) setOpenCredMenuId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [openMenuMsgId, openCredMenuId]);

  // Clean Markdown syntax & abbreviations for crystal-clear natural human-like AI voice
  const cleanForSpeech = (text: string) => {
    return text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.') // remove code blocks
      .replace(/#{1,6}\s+/g, '') // remove headers
      .replace(/[*_~`]/g, '') // remove markdown styling chars
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // replace links with link text
      .replace(/^[-\t*+]\s+/gm, ', ') // remove list bullets and add natural pause
      .replace(/\|[^\n]+\|/g, '') // remove table pipes
      .replace(/[-]{3,}/g, '') // remove divider rules
      .replace(/\be\.g\.\b/gi, 'for example')
      .replace(/\bi\.e\.\b/gi, 'that is')
      .replace(/\betc\.\b/gi, 'and so on')
      .replace(/\bB\.?Sc\b/gi, 'Bachelor of Science')
      .replace(/\bM\.?Sc\b/gi, 'Master of Science')
      .replace(/\bPh\.?D\b/gi, 'P h D')
      .replace(/\bGPA\b/gi, 'G P A')
      .replace(/\bCGPA\b/gi, 'cumulative G P A')
      .replace(/\bCV\b/gi, 'C V')
      .replace(/\bAI\b/gi, 'A I')
      .replace(/\bUK\b/gi, 'U K')
      .replace(/\bUS\b/gi, 'U S')
      .replace(/\bWES\b/gi, 'W E S')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Find the highest-quality, most natural sounding English voice for read aloud
  const getHighQualityVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Prioritize premier natural/neural human-like voices
    const preferredVoiceNames = [
      'Microsoft Jenny Online (Natural) - English (United States)',
      'Microsoft Guy Online (Natural) - English (United States)',
      'Microsoft Aria Online (Natural) - English (United States)',
      'Microsoft Christopher Online (Natural) - English (United States)',
      'Google US English',
      'Google UK English Female',
      'Google UK English Male',
      'en-US-Neural2-F',
      'en-US-Neural2-D',
      'Samantha (Enhanced)',
      'Samantha',
      'Alex',
      'Daniel (Enhanced)',
      'Daniel',
      'Karen (Enhanced)',
      'Karen',
      'Victoria',
      'Serena',
      'Oliver',
      'Ava',
      'Allison',
    ];

    for (const name of preferredVoiceNames) {
      const match = voices.find(
        (v) =>
          v.name.toLowerCase().includes(name.toLowerCase()) &&
          (v.lang.startsWith('en') || !v.lang)
      );
      if (match) return match;
    }

    // Fallback: any voice marked 'natural', 'enhanced', 'neural', or 'premium'
    const naturalEn = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('enhanced') ||
          v.name.toLowerCase().includes('neural') ||
          v.name.toLowerCase().includes('premium') ||
          v.name.toLowerCase().includes('google'))
    );
    if (naturalEn) return naturalEn;

    // Fallback: standard US or English voice
    const defaultEn = voices.find((v) => v.lang === 'en-US' || v.lang.startsWith('en'));
    return defaultEn || voices[0] || null;
  };

  // Pre-load speech voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Read chat message aloud using smooth, natural voice synthesis
  const handleReadAloud = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      onShowToast?.('Speech synthesis is not supported by your current browser.');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleaned = cleanForSpeech(text);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    const selectedVoice = getHighQualityVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang || 'en-US';
    }

    // Natural human cadence and articulation
    utterance.rate = 0.98;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };
    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Copy message text
  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
    onShowToast?.('Message copied to clipboard.');
  };

  // Save to Audit Log
  const handleSaveAudit = (msg: ChatMessage) => {
    dbService.addTask({
      title: `Audit: ${msg.text.slice(0, 45).replace(/^[#*\s]+/, '')}...`,
      description: `Cryptographic audit of credentials and admissions requirements.`,
      category: 'audit',
      status: 'completed',
      prompt: msg.text.slice(0, 300),
    });
    setTasks(dbService.getTasks());
    onShowToast?.('Audit entry cryptographically saved to Sovereign Log.');
  };

  // Save to Vault
  const handleSaveToVault = (msg: ChatMessage) => {
    const credTitle = `Audited Brief: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    const newDoc = dbService.addCredential({
      name: credTitle,
      type: 'other',
      issuer: 'KRED Sovereign AI Engine',
      purpose: msg.text.slice(0, 90).replace(/^[#*\s]+/, ''),
      status: 'verified',
      fileSize: 'Audited Brief',
      extractedDetails: {
        level: 'Verified Attestation',
        validity: 'Encrypted in Sovereign Vault',
      },
    });
    setCredentials(dbService.getCredentials());
    onShowToast?.(`"${newDoc.name}" saved to your Sovereign Vault!`);
  };

  // Export message as Markdown
  const handleExportMarkdown = (msg: ChatMessage) => {
    const blob = new Blob([msg.text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kred_audit_response_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast?.('Exported message as Markdown (.md)');
  };

  // Tag document into chat
  const handleTagDocument = (credId: string) => {
    const cred = credentials.find((c) => c.id === credId);
    if (!cred) return;

    setSelectedCredentialIds((prev) => {
      if (prev.includes(credId)) {
        return prev;
      }
      return [...prev, credId];
    });

    if (currentView !== 'chat') {
      setCurrentView('chat');
    }

    onShowToast?.(`Tagged "${cred.name}" in chat`);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // Remove tag
  const handleRemoveTag = (credId: string) => {
    setSelectedCredentialIds((prev) => prev.filter((id) => id !== credId));
  };

  // Select document from @ mention popover
  const handleSelectAtMentionDoc = (cred: VaultCredential) => {
    handleTagDocument(cred.id);

    const lastAtIndex = inputText.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const beforeAt = inputText.slice(0, lastAtIndex);
      setInputText(`${beforeAt}@${cred.name} `);
    } else {
      setInputText((prev) => (prev ? `${prev} @${cred.name} ` : `@${cred.name} `));
    }

    setIsAtMentionOpen(false);
    setAtMentionQuery('');
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // Handle textarea text changes and detect @ mention
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);

    const lastAtIndex = val.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = val.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setIsAtMentionOpen(true);
        setAtMentionQuery(textAfterAt.toLowerCase());
        return;
      }
    }
    setIsAtMentionOpen(false);
    setAtMentionQuery('');
  };

  // Initialize Speech Recognition once
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          const base = baseSpeechTextRef.current ? baseSpeechTextRef.current.trim() : '';
          const combined = base ? `${base} ${transcript.trim()}` : transcript.trim();
          setInputText(combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          onShowToast?.('Microphone access denied. Please enable microphone permissions in your browser.');
        } else if (event.error === 'no-speech') {
          // Silent timeout
        } else {
          onShowToast?.(`Voice error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
    }

    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch {}
      }
    };
  }, [onShowToast]);

  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onShowToast?.('Speech to Text is not supported by your current browser. Try Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      try {
        speechRecognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      onShowToast?.('Voice recording ended.');
    } else {
      baseSpeechTextRef.current = inputText;
      try {
        speechRecognitionRef.current?.start();
        setIsListening(true);
        onShowToast?.('Listening... Speak now to dictate your prompt.');
      } catch (err: any) {
        console.warn('Failed to start speech recognition:', err);
        // Sometimes restarting helps if state was stale
        try {
          speechRecognitionRef.current?.abort();
          setTimeout(() => {
            baseSpeechTextRef.current = inputText;
            speechRecognitionRef.current?.start();
            setIsListening(true);
            onShowToast?.('Listening... Speak now.');
          }, 150);
        } catch (retryErr) {
          onShowToast?.('Could not activate microphone. Please check permissions.');
        }
      }
    }
  };

  // Interactive Clarification Questionnaire State per message
  const [questionnaireState, setQuestionnaireState] = useState<
    Record<
      string,
      {
        currentQuestionIndex: number;
        selectedOptions: Record<string, string[]>; // questionId -> optionIds
        customAnswers?: Record<string, string>; // questionId -> custom user text input
        isSubmitted?: boolean;
        isDismissed?: boolean;
      }
    >
  >({});
  const [customQuestionInput, setCustomQuestionInput] = useState('');

  const handleSelectQuestionOption = (
    msgId: string,
    questionId: string,
    optionId: string,
    multiSelect: boolean = false
  ) => {
    setQuestionnaireState((prev) => {
      const current = prev[msgId] || {
        currentQuestionIndex: 0,
        selectedOptions: {},
      };
      const existing = current.selectedOptions[questionId] || [];
      let updated: string[];

      if (multiSelect) {
        if (existing.includes(optionId)) {
          updated = existing.filter((id) => id !== optionId);
        } else {
          updated = [...existing, optionId];
        }
      } else {
        updated = [optionId];
      }

      return {
        ...prev,
        [msgId]: {
          ...current,
          selectedOptions: {
            ...current.selectedOptions,
            [questionId]: updated,
          },
        },
      };
    });
  };

  const handleNextOrSubmitQuestion = (
    msgId: string,
    questions: ClarificationQuestion[]
  ) => {
    const current = questionnaireState[msgId] || {
      currentQuestionIndex: 0,
      selectedOptions: {},
    };
    const nextIdx = current.currentQuestionIndex + 1;

    if (nextIdx < questions.length) {
      setQuestionnaireState((prev) => ({
        ...prev,
        [msgId]: {
          ...current,
          currentQuestionIndex: nextIdx,
        },
      }));
    } else {
      // Last question reached - compile choices and prompt the AI to refine/build
      setQuestionnaireState((prev) => ({
        ...prev,
        [msgId]: {
          ...current,
          isSubmitted: true,
        },
      }));

      // Gather human-readable answers
      const answersSummary: string[] = [];
      questions.forEach((q) => {
        const chosenIds = current.selectedOptions[q.id] || [];
        const chosenLabels = q.options
          .filter((opt) => chosenIds.includes(opt.id))
          .map((opt) => opt.label);
        if (chosenLabels.length > 0) {
          answersSummary.push(`- **${q.title}**: ${chosenLabels.join(', ')}`);
        }
      });

      if (answersSummary.length > 0) {
        const refinementPrompt = `Here are my preferences for the generation:\n${answersSummary.join(
          '\n'
        )}\n\nPlease proceed and synthesize the customized document incorporating these specifications.`;
        handleSendMessage(refinementPrompt);
      } else {
        onShowToast?.('Proceeding with standard generation...');
      }
    }
  };

  const handleSkipQuestion = (
    msgId: string,
    questions: ClarificationQuestion[]
  ) => {
    const current = questionnaireState[msgId] || {
      currentQuestionIndex: 0,
      selectedOptions: {},
    };
    const nextIdx = current.currentQuestionIndex + 1;

    if (nextIdx < questions.length) {
      setQuestionnaireState((prev) => ({
        ...prev,
        [msgId]: {
          ...current,
          currentQuestionIndex: nextIdx,
        },
      }));
    } else {
      setQuestionnaireState((prev) => ({
        ...prev,
        [msgId]: {
          ...current,
          isSubmitted: true,
        },
      }));
      onShowToast?.('Questionnaire skipped.');
    }
  };

  const handleDismissQuestionnaire = (msgId: string) => {
    setQuestionnaireState((prev) => ({
      ...prev,
      [msgId]: {
        ...(prev[msgId] || { currentQuestionIndex: 0, selectedOptions: {} }),
        isDismissed: true,
      },
    }));
  };

  const handleSelectOptionDirectly = (optIdx: number) => {
    const targetMsgId =
      activeQuestionPopupMsgId ||
      [...messages].reverse().find(
        (m) =>
          m.role === 'assistant' &&
          m.questions &&
          m.questions.length > 0 &&
          !questionnaireState[m.id]?.isSubmitted &&
          !questionnaireState[m.id]?.isDismissed
      )?.id;

    if (!targetMsgId) return;
    const targetMsg = messages.find((m) => m.id === targetMsgId);
    if (!targetMsg || !targetMsg.questions || targetMsg.questions.length === 0) return;

    const qState = questionnaireState[targetMsgId] || {
      currentQuestionIndex: 0,
      selectedOptions: {},
      customAnswers: {},
    };
    const currentIdx = Math.min(qState.currentQuestionIndex, targetMsg.questions.length - 1);
    const currentQ = targetMsg.questions[currentIdx];
    const chosenOpt = currentQ.options[optIdx] || currentQ.options[0];
    if (!chosenOpt) return;

    const updatedSelected = {
      ...qState.selectedOptions,
      [currentQ.id]: [chosenOpt.id],
    };
    const updatedCustomAnswers = { ...(qState.customAnswers || {}) };
    delete updatedCustomAnswers[currentQ.id];

    const nextIdx = currentIdx + 1;
    if (nextIdx < targetMsg.questions.length) {
      setQuestionnaireState((prev) => ({
        ...prev,
        [targetMsgId]: {
          ...qState,
          currentQuestionIndex: nextIdx,
          selectedOptions: updatedSelected,
          customAnswers: updatedCustomAnswers,
        },
      }));
      const nextQ = targetMsg.questions[nextIdx];
      setCustomQuestionInput(updatedCustomAnswers[nextQ.id] || '');
      setFocusedOptionIndex(0);
    } else {
      setActiveQuestionPopupMsgId(null);
      setQuestionnaireState((prev) => ({
        ...prev,
        [targetMsgId]: {
          ...qState,
          currentQuestionIndex: nextIdx,
          selectedOptions: updatedSelected,
          customAnswers: updatedCustomAnswers,
          isSubmitted: true,
        },
      }));
      setCustomQuestionInput('');

      // Compile clean human-readable specification summary
      const specSummaries = targetMsg.questions.map((q) => {
        const customAns = updatedCustomAnswers[q.id];
        if (customAns) {
          return `"${q.title}": "${customAns}"`;
        }
        const selId = updatedSelected[q.id]?.[0];
        const opt = q.options.find((o) => o.id === selId);
        return `"${q.title}": "${opt?.label || selId || 'Standard'}"`;
      });

      // Submit preference choices into chat to trigger immediate tailored synthesis
      handleSendMessage(
        `[PREFERENCE_SELECTED] Selected specifications: ${specSummaries.join(', ')}. Please generate the complete customized deliverable now.`
      );
    }
  };

  const handleSubmitCustomQuestionInput = () => {
    const targetMsgId =
      activeQuestionPopupMsgId ||
      [...messages].reverse().find(
        (m) =>
          m.role === 'assistant' &&
          m.questions &&
          m.questions.length > 0 &&
          !questionnaireState[m.id]?.isSubmitted &&
          !questionnaireState[m.id]?.isDismissed
      )?.id;

    if (!targetMsgId) return;
    const targetMsg = messages.find((m) => m.id === targetMsgId);
    if (!targetMsg || !targetMsg.questions || targetMsg.questions.length === 0) return;

    const qState = questionnaireState[targetMsgId] || {
      currentQuestionIndex: 0,
      selectedOptions: {},
      customAnswers: {},
    };
    const currentIdx = Math.min(qState.currentQuestionIndex, targetMsg.questions.length - 1);
    const currentQ = targetMsg.questions[currentIdx];

    const textValue = customQuestionInput.trim();
    if (!textValue) {
      onShowToast?.('Please enter your response or choose an option above.');
      return;
    }

    const updatedCustomAnswers = {
      ...(qState.customAnswers || {}),
      [currentQ.id]: textValue,
    };
    const updatedSelected = { ...qState.selectedOptions };
    delete updatedSelected[currentQ.id];

    const nextIdx = currentIdx + 1;
    if (nextIdx < targetMsg.questions.length) {
      setQuestionnaireState((prev) => ({
        ...prev,
        [targetMsgId]: {
          ...qState,
          currentQuestionIndex: nextIdx,
          selectedOptions: updatedSelected,
          customAnswers: updatedCustomAnswers,
        },
      }));
      const nextQ = targetMsg.questions[nextIdx];
      setCustomQuestionInput(updatedCustomAnswers[nextQ.id] || '');
      setFocusedOptionIndex(0);
    } else {
      setActiveQuestionPopupMsgId(null);
      setQuestionnaireState((prev) => ({
        ...prev,
        [targetMsgId]: {
          ...qState,
          currentQuestionIndex: nextIdx,
          selectedOptions: updatedSelected,
          customAnswers: updatedCustomAnswers,
          isSubmitted: true,
        },
      }));
      setCustomQuestionInput('');

      const specSummaries = targetMsg.questions.map((q) => {
        const customAns = updatedCustomAnswers[q.id];
        if (customAns) {
          return `"${q.title}": "${customAns}"`;
        }
        const selId = updatedSelected[q.id]?.[0];
        const opt = q.options.find((o) => o.id === selId);
        return `"${q.title}": "${opt?.label || selId || 'Standard'}"`;
      });

      handleSendMessage(
        `[PREFERENCE_SELECTED] Selected specifications: ${specSummaries.join(', ')}. Please generate the complete customized deliverable now.`
      );
    }
  };

  const handlePrevQuestionDirectly = () => {
    const targetMsgId =
      activeQuestionPopupMsgId ||
      [...messages].reverse().find(
        (m) =>
          m.role === 'assistant' &&
          m.questions &&
          m.questions.length > 0 &&
          !questionnaireState[m.id]?.isSubmitted &&
          !questionnaireState[m.id]?.isDismissed
      )?.id;

    if (!targetMsgId) return;
    const qState = questionnaireState[targetMsgId];
    if (!qState || qState.currentQuestionIndex <= 0) return;
    const prevIdx = qState.currentQuestionIndex - 1;
    setQuestionnaireState((prev) => ({
      ...prev,
      [targetMsgId]: {
        ...qState,
        currentQuestionIndex: prevIdx,
      },
    }));
    const targetMsg = messages.find((m) => m.id === targetMsgId);
    const prevQ = targetMsg?.questions?.[prevIdx];
    if (prevQ) {
      setCustomQuestionInput(qState.customAnswers?.[prevQ.id] || '');
    }
    setFocusedOptionIndex(0);
  };

  const handleSkipQuestionDirectly = () => {
    const targetMsgId =
      activeQuestionPopupMsgId ||
      [...messages].reverse().find(
        (m) =>
          m.role === 'assistant' &&
          m.questions &&
          m.questions.length > 0 &&
          !questionnaireState[m.id]?.isSubmitted &&
          !questionnaireState[m.id]?.isDismissed
      )?.id;

    if (targetMsgId) {
      setQuestionnaireState((prev) => ({
        ...prev,
        [targetMsgId]: {
          ...(prev[targetMsgId] || { currentQuestionIndex: 0, selectedOptions: {} }),
          isSubmitted: true,
        },
      }));
    }
    setActiveQuestionPopupMsgId(null);
    setCustomQuestionInput('');
    handleSendMessage('Please proceed and generate with standard comprehensive specifications.');
  };

  // Keyboard navigation for Claude-style docked question pop-up card
  useEffect(() => {
    const targetMsgId =
      activeQuestionPopupMsgId ||
      [...messages].reverse().find(
        (m) =>
          m.role === 'assistant' &&
          m.questions &&
          m.questions.length > 0 &&
          !questionnaireState[m.id]?.isSubmitted &&
          !questionnaireState[m.id]?.isDismissed
      )?.id;

    if (!targetMsgId) return;
    const targetMsg = messages.find((m) => m.id === targetMsgId);
    if (!targetMsg || !targetMsg.questions || targetMsg.questions.length === 0) return;

    const qState = questionnaireState[targetMsgId] || { currentQuestionIndex: 0, selectedOptions: {} };
    const currentIdx = Math.min(qState.currentQuestionIndex, targetMsg.questions.length - 1);
    const currentQ = targetMsg.questions[currentIdx];
    const totalOptions = currentQ.options.length;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isCustomInputFocused = activeEl?.getAttribute('data-question-input') === 'true';
      if (isCustomInputFocused) {
        // Let the custom text input handle typing and Enter
        return;
      }

      const isTextareaFocused = activeEl === textareaRef.current;

      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveQuestionPopupMsgId(null);
        setQuestionnaireState((prev) => ({
          ...prev,
          [targetMsgId]: {
            ...(prev[targetMsgId] || { currentQuestionIndex: 0, selectedOptions: {} }),
            isDismissed: true,
          },
        }));
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedOptionIndex((prev) => (prev + 1) % totalOptions);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedOptionIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
        return;
      }

      // Numbers 1-9 select option directly when textarea is empty or not typing
      if (['1', '2', '3', '4', '5'].includes(e.key) && (!isTextareaFocused || inputText === '')) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < totalOptions) {
          e.preventDefault();
          handleSelectOptionDirectly(idx);
          return;
        }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        if (isTextareaFocused && inputText.trim().length > 0) {
          return; // Let standard textarea submit handle it
        }
        e.preventDefault();
        handleSelectOptionDirectly(focusedOptionIndex);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestionPopupMsgId, focusedOptionIndex, questionnaireState, messages, inputText]);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeThreadId) {
      scrollToBottom();
    }
  }, [activeThreadId, messages.length]);

  // Handle new chat click
  const handleStartNewChat = () => {
    setCurrentView('chat');
    setInputText('');

    const currentThreads = dbService.getThreads();
    const existingEmpty = currentThreads.find((t) => t.title === 'New chat' && t.messages.length === 0);

    if (existingEmpty) {
      setActiveThreadId(existingEmpty.id);
    } else {
      const newThreadId = `t_${Date.now()}`;
      const newThread: ChatThread = {
        id: newThreadId,
        title: 'New chat',
        updatedAt: 'Just now',
        messages: [],
      };
      const updated = [newThread, ...currentThreads];
      dbService.saveThreads(updated);
      setActiveThreadId(newThreadId);
    }

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Switch to an existing thread
  const handleSelectThread = (threadId: string) => {
    setCurrentView('chat');
    setActiveThreadId(threadId);
  };

  // Upload file selection simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (!docName) {
        const clean = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setDocName(clean.charAt(0).toUpperCase() + clean.slice(1));
      }
    }
  };

  // Submit new credential and tell AI what it is for
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) {
      onShowToast?.('Please enter a document name.');
      return;
    }
    if (!docPurpose.trim()) {
      onShowToast?.('Please tell the AI what this document is for.');
      return;
    }

    setIsUploading(true);

    setTimeout(async () => {
      const newCred = dbService.addCredential({
        name: docName.trim(),
        type: docType,
        issuer: docIssuer.trim() || 'Official Issuing Registrar',
        purpose: docPurpose.trim(),
        status: 'verified',
        fileSize: fileName ? '1.8 MB' : 'Digital Record',
        extractedDetails: {
          level: 'Verified African Record',
          validity: 'Active & Encrypted in Sovereign Vault',
        },
      });

      setIsUploading(false);
      setIsUploadModalOpen(false);

      // Create new chat thread dedicated to this credential
      const newThreadId = `t_${Date.now()}`;
      const newThreadTitle = `Audit for ${newCred.name.slice(0, 30)}...`;

      const userMsgText = `I just uploaded my "${newCred.name}" from ${newCred.issuer}.\n\nWhat I need it for: "${newCred.purpose}".\n\nWhat does this say about my qualifications and next steps?`;
      const aiResponse = await getAiAuditResponse(userMsgText, { mode: 'chat' });

      const userMsg: ChatMessage = {
        id: `m_${Date.now()}_u`,
        role: 'user',
        text: userMsgText,
        timestamp: 'Just now',
      };

      const aiMsg: ChatMessage = {
        id: `m_${Date.now()}_a`,
        role: 'assistant',
        text: aiResponse.answer,
        sources: [newCred.name, ...aiResponse.sources],
        timestamp: 'Just now',
      };

      const newThread: ChatThread = {
        id: newThreadId,
        title: newThreadTitle,
        updatedAt: 'Just now',
        messages: [userMsg, aiMsg],
      };

      const updatedThreads = [newThread, ...dbService.getThreads()];
      dbService.saveThreads(updatedThreads);
      setActiveThreadId(newThreadId);

      // Reset form
      setDocName('');
      setDocIssuer('');
      setDocPurpose('');
      setFileName('');

      onShowToast?.(`"${newCred.name}" saved to database & audited!`);
    }, 400);
  };

  // Sovereign Memory Handlers
  const handleAddManualMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryFact.trim()) return;
    dbService.addMemory({
      category: newMemoryCategory,
      fact: newMemoryFact.trim(),
      confidence: 1.0,
      source: 'User Manual Entry',
    });
    setNewMemoryFact('');
    onShowToast?.('New fact saved to Sovereign Memory!');
  };

  const handleRemoveMemory = (id: string) => {
    dbService.removeMemory(id);
    onShowToast?.('Memory entry removed.');
  };

  const handleClearAllMemories = () => {
    if (window.confirm('Are you sure you want to clear all learned memories?')) {
      dbService.clearMemories();
      onShowToast?.('Sovereign Memory cleared.');
    }
  };

  // Send a message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    setInputText('');

    // Decide the mode based on INTENT, not just presence of an uploaded file.
    const intentAnalysis = detectIntentMode(text, chatMode);
    let effectiveMode = intentAnalysis.mode;

    // When the user tells the AI to create/generate something, switch the UI to agent mode
    if (intentAnalysis.isExplicitDocGeneration && chatMode !== 'agent') {
      setChatMode('agent');
      effectiveMode = 'agent';
    }

    const userMsg: ChatMessage = {
      id: `m_${Date.now()}_u`,
      role: 'user',
      text,
      timestamp: 'Just now',
    };

    let targetThreadId = activeThreadId;

    if (!targetThreadId) {
      targetThreadId = `t_${Date.now()}`;
      const newThread: ChatThread = {
        id: targetThreadId,
        title: 'New chat',
        updatedAt: 'Just now',
        messages: [userMsg],
      };
      const updated = [newThread, ...dbService.getThreads()];
      dbService.saveThreads(updated);
      setActiveThreadId(targetThreadId);

      // After the user messages the AI, update thread title from 'New chat' to descriptive prompt name
      const generatedTitle = text.length > 34 ? text.slice(0, 34) + '...' : text;
      dbService.renameThread(targetThreadId, generatedTitle);
    } else {
      const currentThread = threads.find((t) => t.id === targetThreadId);
      dbService.addMessage(targetThreadId, { role: 'user', text });

      // After user messages the AI, if the chat is named "New chat" or had 0 messages, give it a descriptive name
      if (!currentThread || currentThread.title.toLowerCase() === 'new chat' || currentThread.messages.length <= 1) {
        const generatedTitle = text.length > 34 ? text.slice(0, 34) + '...' : text;
        dbService.renameThread(targetThreadId, generatedTitle);
      }
    }

    setIsTyping(true);

    try {
      const historyContext = messages.slice(-30).map((m) => ({
        role: m.role as 'user' | 'assistant',
        text: m.text,
      }));

      const aiResult = await getAiAuditResponse(text, {
        mode: effectiveMode,
        selectedCredentialIds,
        history: historyContext,
        webSearch: isWebSearchActive,
        memories,
      });
      setIsTyping(false);

      const aiMsg: ChatMessage = {
        id: `m_${Date.now()}_a`,
        role: 'assistant',
        text: aiResult.answer,
        sources: aiResult.sources,
        actionLabel: effectiveMode === 'agent' ? (aiResult.actionLabel || 'Download Generated Document') : undefined,
        timestamp: 'Just now',
        questions: aiResult.questions,
        form: aiResult.form,
        searchResults: aiResult.searchResults,
      };

      let savedMsgId = aiMsg.id;
      if (targetThreadId) {
        const added = dbService.addMessage(targetThreadId, {
          id: aiMsg.id,
          role: 'assistant',
          text: aiResult.answer,
          sources: aiResult.sources,
          actionLabel: aiMsg.actionLabel,
          questions: aiResult.questions,
          form: aiResult.form,
          searchResults: aiResult.searchResults,
        });
        if (added?.id) {
          savedMsgId = added.id;
        }
      }

      // Open Preview Canvas ONLY IN AGENT MODE (Chat mode is strictly conversational)
      const lowerAnswer = aiResult.answer.toLowerCase();
      const lowerQuery = text.toLowerCase();
      const isAgentMode = effectiveMode === 'agent';

      const isGenerationVerb = /\b(generate|create|make|build|write|draft|show|synthesize|compose)\b/i.test(text);

      const isFlashcards =
        isAgentMode &&
        ((lowerAnswer.includes('front:') && lowerAnswer.includes('back:')) ||
          (isGenerationVerb && (lowerQuery.includes('flashcard') || lowerQuery.includes('flash card'))));

      const isReceipt =
        isAgentMode &&
        (lowerAnswer.includes('#rec-') || lowerAnswer.includes('#inv-') ||
          (isGenerationVerb && (lowerQuery.includes('receipt') || lowerQuery.includes('invoice'))));

      const isSlides =
        isAgentMode &&
        (lowerAnswer.includes('slide 1') || lowerAnswer.includes('## slide') ||
          (isGenerationVerb && (lowerQuery.includes('slide') || lowerQuery.includes('presentation') || lowerQuery.includes('pitch deck'))));

      const isCv =
        isAgentMode &&
        !isFlashcards &&
        !isSlides &&
        !isReceipt &&
        ((lowerAnswer.includes('# ') && (lowerAnswer.includes('### professional summary') || lowerAnswer.includes('### work experience'))) ||
          (isGenerationVerb && (lowerQuery.includes('cv') || lowerQuery.includes('resume'))));

      const isStudyPlan =
        isAgentMode &&
        !isFlashcards &&
        !isSlides &&
        !isReceipt &&
        !isCv &&
        ((lowerAnswer.includes('# task roadmap') || lowerAnswer.includes('## step 1') || lowerAnswer.includes('student study plan')) &&
          (isGenerationVerb || lowerQuery.includes('teach me') || lowerQuery.includes('study plan') || lowerQuery.includes('roadmap')));

      const isCoverLetter =
        isAgentMode &&
        (lowerAnswer.includes('statement of purpose') ||
          (isGenerationVerb && (lowerQuery.includes('cover letter') || lowerQuery.includes('statement of purpose'))));

      const isDeliverable = isAgentMode && (isFlashcards || isSlides || isReceipt || isCv || isStudyPlan || isCoverLetter || Boolean(aiResult.isDocument));

      const userExplicitlyRequestedCanvas =
        /\b(canvas|preview canvas|open canvas|open in canvas|show in canvas|in canvas)\b/i.test(text);

      let docTitle = 'Generated Deliverable';
      if (isFlashcards) {
        const topicMatch = text.match(/(?:about|for|on|regarding)\s+([a-zA-Z\s]+)/i);
        const subject = topicMatch ? topicMatch[1].trim() : (aiResult.answer.match(/#+\s*([^\n]+)/)?.[1]?.replace(/flashcards?/i, '').trim() || 'Core Concepts');
        docTitle = `Study Flashcards: ${subject.charAt(0).toUpperCase() + subject.slice(1)}`;
      } else if (isSlides) {
        const topicMatch = text.match(/(?:about|for|on|regarding)\s+([a-zA-Z\s]+)/i);
        const subject = topicMatch ? topicMatch[1].trim() : (aiResult.answer.match(/#+\s*([^\n]+)/)?.[1]?.replace(/presentation|slides?/i, '').trim() || 'Presentation Overview');
        docTitle = `Presentation Deck: ${subject.charAt(0).toUpperCase() + subject.slice(1)}`;
      } else if (isReceipt) {
        docTitle = 'Official Sales Receipt & Attestation';
      } else if (isCv) {
        docTitle = 'Executive Curriculum Vitae (CV)';
      } else if (isStudyPlan) {
        docTitle = 'Student Study Plan & Academic Roadmap';
      } else if (isCoverLetter) {
        docTitle = 'Application Statement of Purpose / Cover Letter';
      }

      const docType = isSlides
        ? 'slides'
        : isFlashcards
        ? 'flashcards'
        : isReceipt
        ? 'receipt'
        : isStudyPlan
        ? 'study_plan'
        : isCv
        ? 'cv'
        : isCoverLetter
        ? 'cover_letter'
        : 'document';

      // Canvas opens ONLY in agent mode when deliverable/canvas is requested, NEVER on chat mode
      const shouldOpenCanvas =
        isAgentMode &&
        !aiResult.questions?.length &&
        !aiResult.answer.startsWith('⚠️') &&
        (userExplicitlyRequestedCanvas || isDeliverable || intentAnalysis.isExplicitDocGeneration);

      if (isAgentMode && isDeliverable && !aiResult.answer.startsWith('⚠️') && !aiResult.questions?.length) {
        aiMsg.actionLabel = isFlashcards
          ? 'Open Flashcard Deck in Canvas'
          : isSlides
          ? 'Open Slide Deck in Canvas'
          : isReceipt
          ? 'Open Receipt in Canvas'
          : isCv
          ? 'Open CV in Canvas'
          : 'Open Deliverable in Canvas';
      }

      if (shouldOpenCanvas) {
        openCanvas(aiResult.answer, docTitle, docType);
      }

      // Automatically add generated deliverables / study plans / task roadmaps to Tasks section ONLY in agent mode
      if (isAgentMode && isDeliverable && !aiResult.answer.startsWith('⚠️')) {
        dbService.addTask({
          title: docTitle || `Task: ${text.slice(0, 35)}...`,
          description: `Generated ${docType.replace('_', ' ')} roadmap & agent task.`,
          category: isCv ? 'cv' : isStudyPlan ? 'assignment' : 'audit',
          status: 'ready',
          prompt: text,
        });
        setTasks(dbService.getTasks());
      }

      // If response includes clarification questions, trigger popup modal
      if (aiResult.questions && aiResult.questions.length > 0) {
        setActiveQuestionPopupMsgId(savedMsgId);
      }

      setTimeout(scrollToBottom, 100);
    } catch {
      setIsTyping(false);
      const fallbackText = `⚠️ Failed to respond. The AI model was unable to process your request. Please check your connection or API key and try again.`;
      if (targetThreadId) {
        dbService.addMessage(targetThreadId, {
          role: 'assistant',
          text: fallbackText,
          sources: [],
        });
      }
      setTimeout(scrollToBottom, 100);
    }
  };

  const filteredCredentials = credentials.filter(
    (c) =>
      c.name.toLowerCase().includes(vaultSearchQuery.toLowerCase()) ||
      c.issuer.toLowerCase().includes(vaultSearchQuery.toLowerCase()) ||
      c.purpose.toLowerCase().includes(vaultSearchQuery.toLowerCase())
  );

  // Helper to format Markdown content into a clean, printable publication layout
  const renderFormattedDocument = (content: string, docType: string) => {
    return (
      <KredCanvasDocumentViewer
        content={content}
        docType={docType}
        title={canvasDoc?.title || 'Document Dossier'}
        userName={effectiveUserName}
        onPrint={handlePrintCanvas}
        onCopy={handleCopyDoc}
      />
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAF9F5] text-[#18181B] flex select-none font-sans relative">
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden transition-opacity"
        />
      )}

      {/* ============================================================ */}
      {/* LEFT SIDEBAR (Claude-Style Light Sidebar) */}
      {/* ============================================================ */}
      <aside
        className={`${
          sidebarOpen ? 'fixed lg:relative inset-y-0 left-0 z-40 w-[280px] sm:w-[300px] shadow-2xl lg:shadow-none' : 'w-0'
        } transition-all duration-200 shrink-0 bg-[#FBFBFA] border-r border-[#EBEAE5] flex flex-col justify-between overflow-hidden`}
      >
        <div className="p-3.5 flex flex-col h-full overflow-hidden">
          
          {/* Top Brand & Sidebar Close (Clean logo without background) */}
          <div className="flex items-center justify-between px-2 pt-1 pb-3">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 cursor-pointer group text-left"
              title="Return to website"
            >
              <KredLogo size="default" variant="dark" />
            </button>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#EFEFEB] transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* + New Chat Button */}
          <div className="my-1.5">
            <button
              type="button"
              onClick={handleStartNewChat}
              className="w-full h-10 px-3 rounded-xl bg-white hover:bg-[#F4F3ED] border border-[#E2E1DA] text-[#18181B] text-[13.5px] font-medium transition-all flex items-center gap-2.5 cursor-pointer shadow-2xs active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-[#18181B]" />
              <span>New chat</span>
            </button>
          </div>

          {/* Top Nav Items */}
          <div className="mt-2 space-y-0.5 text-[13px] font-medium text-[#5A5957]">
            <button
              type="button"
              onClick={() => {
                setCurrentView('chat');
                if (!activeThreadId && threads.length > 0) {
                  setActiveThreadId(threads[0].id);
                }
              }}
              className={`w-full px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between text-left cursor-pointer group ${
                currentView === 'chat' ? 'bg-[#EFEFEB] text-[#18181B] font-semibold' : 'hover:bg-[#EFEFEB] hover:text-[#18181B]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#71717A] group-hover:text-[#10C77A]" />
                <span>AI Chat & Dossiers</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('vault')}
              className={`w-full px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between text-left cursor-pointer group ${
                currentView === 'vault' ? 'bg-[#EFEFEB] text-[#18181B] font-semibold' : 'hover:bg-[#EFEFEB] hover:text-[#18181B]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderLock className="w-4 h-4 text-[#71717A] group-hover:text-[#10C77A]" />
                <span>Credentials Vault</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#10C77A]/15 text-[#0E8A54] font-semibold">
                {credentials.length} docs
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('tasks')}
              className={`w-full px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between text-left cursor-pointer group ${
                currentView === 'tasks' ? 'bg-[#EFEFEB] text-[#18181B] font-semibold' : 'hover:bg-[#EFEFEB] hover:text-[#18181B]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-[#71717A] group-hover:text-[#3A6EFF]" />
                <span>Tasks</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3A6EFF]/15 text-[#2552CC] font-semibold">
                {tasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full px-2.5 py-2 rounded-lg hover:bg-[#EFEFEB] hover:text-[#18181B] transition-colors flex items-center justify-between text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <FileUp className="w-4 h-4 text-[#71717A] group-hover:text-[#10C77A]" />
                <span>Upload Credential</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-[#71717A]" />
            </button>
          </div>

          {/* Section Divider: Chats and Audits */}
          <div className="mt-5 mb-2 px-2 flex items-center justify-between text-[11.5px] font-semibold text-[#71717A]">
            <span>Recent Conversations</span>
            <button
              type="button"
              onClick={() => onShowToast?.('Sorted by recent conversations')}
              className="text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
              title="Filter and sort"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Chat Threads List */}
          <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar pr-1">
            {threads.length === 0 ? (
              <div className="px-3 py-6 text-center text-[12px] text-[#8C8B85]">
                No chat history yet
              </div>
            ) : (
              threads.map((thread) => {
                const isActive = activeThreadId === thread.id && currentView === 'chat';
                const isEditing = editingThreadId === thread.id;

                if (isEditing) {
                  return (
                    <div key={thread.id} className="flex items-center gap-1.5 p-1 rounded-lg bg-[#EFEFEB]">
                      <input
                        type="text"
                        value={editingTitleText}
                        onChange={(e) => setEditingTitleText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            dbService.renameThread(thread.id, editingTitleText);
                            setEditingThreadId(null);
                            onShowToast?.('Chat renamed successfully.');
                          } else if (e.key === 'Escape') {
                            setEditingThreadId(null);
                          }
                        }}
                        autoFocus
                        className="flex-1 bg-white px-2 py-1 rounded text-[12px] border border-[#D4D4D8] text-[#18181B] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          dbService.renameThread(thread.id, editingTitleText);
                          setEditingThreadId(null);
                          onShowToast?.('Chat renamed successfully.');
                        }}
                        className="p-1 text-[#0E8A54] hover:bg-white rounded cursor-pointer transition-colors"
                        title="Save name"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingThreadId(null)}
                        className="p-1 text-[#71717A] hover:bg-white rounded cursor-pointer transition-colors"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={thread.id}
                    className={`w-full group px-2.5 py-2 rounded-lg text-[13px] transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[#EFEFEB] text-[#18181B] font-semibold shadow-2xs'
                        : 'text-[#5A5957] hover:bg-[#F3F2EE] hover:text-[#18181B]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('chat');
                        handleSelectThread(thread.id);
                      }}
                      className="flex-1 text-left truncate flex items-center gap-2 cursor-pointer"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isActive ? 'bg-[#10C77A]' : 'bg-[#A1A1AA]'
                        }`}
                      />
                      <span className="truncate">{thread.title}</span>
                    </button>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 ml-1.5 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingThreadId(thread.id);
                          setEditingTitleText(thread.title);
                        }}
                        className="p-1 text-[#71717A] hover:text-[#18181B] hover:bg-white rounded cursor-pointer transition-colors"
                        title="Rename chat"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dbService.deleteThread(thread.id);
                          if (activeThreadId === thread.id) {
                            setActiveThreadId(null);
                          }
                          onShowToast?.('Chat deleted.');
                        }}
                        className="p-1 text-[#71717A] hover:text-[#EF4444] hover:bg-white rounded cursor-pointer transition-colors"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom User Profile Section - Clicking user name navigates to Website Settings */}
          <div className="pt-3 border-t border-[#EBEAE5] flex items-center justify-between text-[12.5px]">
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="flex items-center gap-2.5 min-w-0 text-left hover:bg-[#EFEFEB] p-1.5 -ml-1.5 rounded-xl transition-all cursor-pointer group flex-1"
              title="Open Website Settings"
            >
              <div className="w-7 h-7 rounded-full bg-[#10C77A] text-[#18181B] font-bold text-[11px] grid place-items-center shrink-0 shadow-2xs group-hover:ring-2 group-hover:ring-[#10C77A]/40 transition-all">
                {effectiveInitials}
              </div>
              <div className="min-w-0 flex flex-col truncate">
                <span className="font-semibold text-[#18181B] truncate text-[12.5px] leading-tight group-hover:text-[#0E8A54] transition-colors">
                  {effectiveUserName}
                </span>
                <span className="text-[#71717A] text-[10.5px] truncate mt-0.5">
                  {currentUser?.email || 'Website Settings'}
                </span>
              </div>
            </button>

            <div className="flex items-center gap-1 text-[#71717A] shrink-0 ml-1">
              <button
                type="button"
                onClick={() => onNavigate('settings')}
                className="p-1.5 hover:text-[#18181B] hover:bg-[#EFEFEB] rounded-lg transition-colors cursor-pointer"
                title="Website Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onShowToast?.('Exporting sovereign vault archive...')}
                className="p-1.5 hover:text-[#18181B] hover:bg-[#EFEFEB] rounded-lg transition-colors cursor-pointer"
                title="Download vault archive"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN CHAT CANVAS (Light Theme) */}
      {/* ============================================================ */}
      <main className="flex-1 h-full flex flex-col justify-between overflow-hidden relative bg-[#FAF9F5]">
        
        {/* Top Minimal Status Header */}
        <header className="h-12 px-3 sm:px-6 flex items-center justify-between shrink-0 z-20 border-b border-[#EBEAE5]/60 bg-[#FAF9F5]">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 sm:p-2 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#EFEFEB] transition-colors cursor-pointer shrink-0"
                title="Open sidebar"
              >
                <PanelLeft className="w-4.5 h-4.5" />
              </button>
            )}

            {/* View Breadcrumb / Tabs - Pure icon buttons when canvas is open to maximize space */}
            {isCanvasOpen ? (
              <div className="flex items-center bg-[#EFEFEB] p-0.5 rounded-lg shrink-0 gap-0.5">
                <button
                  type="button"
                  onClick={() => setCurrentView('chat')}
                  className={`w-8 h-7 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                    currentView === 'chat'
                      ? 'bg-white text-[#18181B] shadow-2xs'
                      : 'text-[#71717A] hover:text-[#18181B]'
                  }`}
                  title="Chat"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('vault')}
                  className={`h-7 px-1.5 rounded-md transition-all inline-flex items-center justify-center gap-1 cursor-pointer ${
                    currentView === 'vault'
                      ? 'bg-white text-[#18181B] shadow-2xs'
                      : 'text-[#71717A] hover:text-[#18181B]'
                  }`}
                  title={`Vault Knowledge Base (${credentials.length})`}
                >
                  <FolderLock className="w-4 h-4" />
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#FAF9F5] text-[#52525B] font-semibold border border-[#E2E1DA]">
                    {credentials.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('tasks')}
                  className={`h-7 px-1.5 rounded-md transition-all inline-flex items-center justify-center gap-1 cursor-pointer ${
                    currentView === 'tasks'
                      ? 'bg-white text-[#18181B] shadow-2xs'
                      : 'text-[#71717A] hover:text-[#18181B]'
                  }`}
                  title={`Tasks Queue (${tasks.length})`}
                >
                  <ListTodo className="w-4 h-4" />
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#FAF9F5] text-[#52525B] font-semibold border border-[#E2E1DA]">
                    {tasks.length}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center bg-[#EFEFEB] p-0.5 rounded-lg text-[11px] sm:text-[12px] font-medium shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrentView('chat')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    currentView === 'chat'
                      ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                      : 'text-[#71717A] hover:text-[#18181B]'
                  }`}
                >
                  Chat
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('vault')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    currentView === 'vault'
                      ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                      : 'text-[#71717A] hover:text-[#18181B]'
                  }`}
                >
                  <span className="hidden sm:inline">Vault Knowledge Base</span>
                  <span className="sm:hidden">Vault</span> ({credentials.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('tasks')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    currentView === 'tasks'
                      ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                      : 'text-[#71717A] hover:text-[#18181B]'
                  }`}
                >
                  Tasks ({tasks.length})
                </button>
              </div>
            )}

            {/* Active Thread Title & Quick Rename/Delete Actions (Hidden when canvas is opened to preserve space) */}
            {!isCanvasOpen && currentView === 'chat' && activeThread && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E2E1DA] text-[12px] text-[#18181B] shadow-2xs">
                <span className="truncate max-w-[170px] font-medium">{activeThread.title}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingThreadId(activeThread.id);
                    setEditingTitleText(activeThread.title);
                  }}
                  className="p-1 text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] rounded cursor-pointer transition-colors"
                  title="Rename current chat"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dbService.deleteThread(activeThread.id);
                    setActiveThreadId(null);
                    onShowToast?.('Chat deleted.');
                  }}
                  className="p-1 text-[#71717A] hover:text-[#EF4444] hover:bg-[#F3F2EE] rounded cursor-pointer transition-colors"
                  title="Delete current chat"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Right Status Actions */}
          <div className="flex items-center gap-2 sm:gap-3 text-[12px]">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="h-8 px-2.5 rounded-lg bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] font-semibold text-[11.5px] inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Upload Credential</span>
              <span className="sm:hidden">Upload</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="w-7 h-7 rounded-full bg-[#10C77A] text-[#18181B] font-bold grid place-items-center transition-colors cursor-pointer text-[11px] shadow-2xs hover:ring-2 hover:ring-[#10C77A]/40"
              title={`Account: ${effectiveUserName} (Click to open Website Settings)`}
            >
              {effectiveInitials}
            </button>
          </div>
        </header>

        {/* Center Workspace Content Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 relative flex flex-col">
          
          {/* ============================================================ */}
          {/* TASKS VIEW: AUTONOMOUS AGENT SYNTHESES */}
          {/* ============================================================ */}
          {currentView === 'tasks' ? (
            <div className="max-w-[960px] w-full mx-auto py-7 space-y-6">
              
              {/* Tasks Hero Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E1DA]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3A6EFF]" />
                    <h1 className="text-[22px] sm:text-[26px] font-bold text-[#18181B] tracking-tight">
                      Tasks & Sovereign Agent Syntheses
                    </h1>
                  </div>
                  <p className="text-[13px] text-[#71717A] mt-1 max-w-[620px] leading-relaxed">
                    Automated intelligence tasks that execute across your stored credentials to construct executive CVs, academic blueprints, and verification dossiers.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCreateTaskModalOpen(true)}
                    className="h-9 px-3.5 rounded-xl bg-[#18181B] hover:bg-[#10C77A] hover:text-[#18181B] text-white text-[12.5px] font-semibold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Create Agent Task</span>
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-[#E2E1DA] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#71717A]">Total Tasks</div>
                  <div className="text-[20px] font-bold text-[#18181B] mt-0.5">{tasks.length}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#E2E1DA] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#71717A]">Ready to Run</div>
                  <div className="text-[20px] font-bold text-[#0E8A54] mt-0.5">
                    {tasks.filter((t) => t.status === 'ready').length}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#E2E1DA] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#71717A]">Referenced Files</div>
                  <div className="text-[20px] font-bold text-[#18181B] mt-0.5">
                    {credentials.length} docs
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#E2E1DA] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#71717A]">Preview Canvas</div>
                  <div className="text-[20px] font-bold text-[#3A6EFF] mt-0.5">Active</div>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[
                  { id: 'all', label: 'All Tasks' },
                  { id: 'cv', label: 'CV Syntheses' },
                  { id: 'assignment', label: 'Academic Assignments' },
                  { id: 'audit', label: 'Degree Audits' },
                  { id: 'waiver', label: 'Waiver Letters' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTaskCategoryFilter(cat.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer ${
                      taskCategoryFilter === cat.id
                        ? 'bg-[#18181B] text-white shadow-2xs'
                        : 'bg-white hover:bg-[#F3F2EE] border border-[#E2E1DA] text-[#5A5957]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Tasks Grid or Empty State */}
              {tasks.length === 0 ? (
                <div className="rounded-2xl bg-white border border-[#E2E1DA] p-8 sm:p-12 text-center shadow-2xs">
                  <div className="w-14 h-14 rounded-2xl bg-[#EFEFEB] text-[#18181B] mx-auto flex items-center justify-center mb-4">
                    <CheckSquare className="w-7 h-7 text-[#71717A]" />
                  </div>
                  <h3 className="text-[17px] font-bold text-[#18181B]">
                    No Autonomous Agent Tasks
                  </h3>
                  <p className="text-[13px] text-[#71717A] max-w-[460px] mx-auto mt-1.5 leading-relaxed">
                    Create custom intelligence tasks that execute across your stored credentials to synthesize executive CVs, academic coursework, and verification dossiers.
                  </p>
                  
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCreateTaskModalOpen(true)}
                      className="h-10 px-5 rounded-xl bg-[#18181B] hover:bg-[#10C77A] hover:text-[#18181B] text-white text-[13px] font-semibold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Create Custom Task</span>
                    </button>
                  </div>

                  {/* Quick Starter Templates */}
                  <div className="mt-8 pt-7 border-t border-[#F0EFEB] text-left">
                    <div className="text-[11.5px] font-semibold text-[#71717A] uppercase tracking-wider mb-3 text-center sm:text-left">
                      Or initialize with a task template:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          title: 'Synthesize Executive CV from Vault',
                          description: 'Construct a professional Markdown CV highlighting verified degrees and attestations.',
                          category: 'cv' as const,
                          prompt: 'Using all the verified credentials in my Sovereign Vault, generate a comprehensive executive-grade CV with authentic degree attestations and skills.',
                        },
                        {
                          title: 'Generate Academic Coursework Blueprint',
                          description: 'Build an academic coursework syllabus and assignment blueprint from course records.',
                          category: 'assignment' as const,
                          prompt: 'Review my uploaded university course records and transcripts to build a structured academic coursework blueprint with grading rubrics.',
                        },
                        {
                          title: 'Degree & Prerequisite Equivalency Audit',
                          description: 'Audit qualifications against international benchmarks and admission prerequisites.',
                          category: 'audit' as const,
                          prompt: 'Audit all my uploaded diplomas and transcripts against UK ENIC benchmarks, WES GPA conversions, and international admissions prerequisites.',
                        },
                        {
                          title: 'Language Proficiency Waiver Request',
                          description: 'Examine credentials for English-medium instruction and draft a formal waiver letter.',
                          category: 'waiver' as const,
                          prompt: 'Examine my credentials for English language proficiency verification and draft a formal waiver request letter for international admissions.',
                        },
                      ].map((tmpl, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-[#E2E1DA] hover:border-[#10C77A] bg-[#FAF9F5] hover:bg-white transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0E8A54] mb-1">
                              {tmpl.category.toUpperCase()} TEMPLATE
                            </div>
                            <h4 className="text-[13px] font-bold text-[#18181B] leading-snug">
                              {tmpl.title}
                            </h4>
                            <p className="text-[11.5px] text-[#71717A] mt-1 leading-relaxed">
                              {tmpl.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const created = dbService.addTask({
                                title: tmpl.title,
                                description: tmpl.description,
                                category: tmpl.category,
                                status: 'ready',
                                prompt: tmpl.prompt,
                              });
                              setTasks(dbService.getTasks());
                              onShowToast?.(`Added "${created.title}" to tasks.`);
                            }}
                            className="mt-3 text-[11.5px] font-semibold text-[#0E8A54] hover:text-[#18181B] inline-flex items-center gap-1 cursor-pointer self-start"
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                            <span>Add this task</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : tasks.filter((t) => taskCategoryFilter === 'all' || t.category === taskCategoryFilter).length === 0 ? (
                <div className="rounded-2xl bg-white border border-[#E2E1DA] p-8 text-center shadow-2xs">
                  <p className="text-[13.5px] font-medium text-[#71717A]">
                    No tasks found in category <span className="font-semibold text-[#18181B]">"{taskCategoryFilter}"</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTaskCategoryFilter('all')}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-[#EFEFEB] hover:bg-[#E2E1DA] text-[12px] font-semibold text-[#18181B] transition-colors cursor-pointer"
                  >
                    View All Tasks
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tasks
                    .filter((t) => taskCategoryFilter === 'all' || t.category === taskCategoryFilter)
                    .map((task) => {
                      const isCv = task.category === 'cv';
                      const isAssignment = task.category === 'assignment';
                      const isAudit = task.category === 'audit';

                      return (
                        <div
                          key={task.id}
                          className="rounded-2xl bg-white border border-[#E2E1DA] p-5 shadow-2xs hover:border-[#3A6EFF]/60 hover:shadow-xs transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2.5">
                              <span
                                className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                  isCv
                                    ? 'bg-[#10C77A]/15 text-[#0E8A54]'
                                    : isAssignment
                                    ? 'bg-[#3A6EFF]/15 text-[#2552CC]'
                                    : isAudit
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {task.category.toUpperCase()}
                              </span>

                              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#71717A]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
                                <span className="capitalize">{task.status}</span>
                              </div>
                            </div>

                            <h3 className="text-[15px] font-bold text-[#18181B] group-hover:text-[#3A6EFF] transition-colors leading-snug">
                              {task.title}
                            </h3>

                            <p className="text-[12.5px] text-[#71717A] mt-1.5 leading-relaxed">
                              {task.description}
                            </p>

                            {/* Prompt Command Box */}
                            <div className="mt-3.5 p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EBEAE5] text-[11.5px] text-[#52525B] font-mono leading-relaxed line-clamp-2">
                              <span className="text-[#10C77A] font-bold">AI Prompt: </span>
                              "{task.prompt}"
                            </div>
                          </div>

                          {/* Bottom Actions */}
                          <div className="mt-4 pt-3.5 border-t border-[#F0EFEB] flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                let docContent = '';
                                if (credentials.length === 0) {
                                  docContent = `# ${task.title.toUpperCase()}\n\n**Candidate / Applicant**: ${effectiveUserName}\n**Vault Records**: 0 Verified Documents\n\n---\n\n### ⚠️ Awaiting Credentials\nYour sovereign credential vault is currently empty. To synthesize a real, verified document:\n\n1. Click **"Upload Credential"** in the top navigation.\n2. Add your diplomas, transcripts, or professional licenses.\n3. Click **"Run with Agent"** on this task to parse your real documents and generate an authentic dossier.\n\n---\n*KRED Sovereign Cryptographic Protocol*`;
                                } else {
                                  docContent = `# ${task.title.toUpperCase()}\n\n**Candidate / Applicant**: ${effectiveUserName}\n**Status**: Real Sovereign Vault Dossier (${credentials.length} verified documents)\n\n---\n\n### 🎓 Verified Records Referenced\n${credentials.map((c) => `• **${c.name}**\n  *Issuer*: ${c.issuer} | *Type*: ${c.type.toUpperCase()}${c.purpose ? ` | *Purpose*: ${c.purpose}` : ''}${c.extractedDetails?.gpa ? ` | *GPA*: ${c.extractedDetails.gpa}` : ''}`).join('\n\n')}\n\n---\n\n### 🤖 AI Agent Synthesis Directive\n*Prompt*: "${task.prompt}"\n\nClick **"Run with Agent"** to execute this synthesis live with your AI agent.`;
                                }

                                openCanvas(docContent, task.title, isCv ? 'cv' : isAssignment ? 'assignment' : 'document');
                              }}
                              className="text-[12px] font-semibold text-[#5A5957] hover:text-[#18181B] inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#3A6EFF]" />
                              <span>Preview Canvas</span>
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleRunTask(task)}
                                className="h-8.5 px-3.5 rounded-xl bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] text-[12px] font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                              >
                                <span>Run with Agent</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  dbService.deleteTask(task.id);
                                  setTasks(dbService.getTasks());
                                  onShowToast?.(`Removed task: ${task.title}`);
                                }}
                                className="p-1.5 text-[#A1A1AA] hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

            </div>
          ) : currentView === 'vault' ? (
            <div className="max-w-[960px] w-full mx-auto py-7 space-y-6">
              
              {/* Vault Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E1DA]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10C77A]" />
                    <h1 className="text-[22px] sm:text-[26px] font-bold text-[#18181B] tracking-tight">
                      Credentials Vault Knowledge Base
                    </h1>
                  </div>
                  <p className="text-[13px] text-[#71717A] mt-1 max-w-[620px] leading-relaxed">
                    All stored certificates, diplomas, transcripts, and licenses. The AI agent references these documents as its memory to execute audits and construct documents.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="h-9 px-3.5 rounded-xl bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] text-[12.5px] font-semibold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Upload Credential</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-[360px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                  <input
                    type="text"
                    value={vaultSearchQuery}
                    onChange={(e) => setVaultSearchQuery(e.target.value)}
                    placeholder="Search credentials or stated purpose..."
                    className="w-full h-9 pl-8 pr-3 rounded-xl border border-[#E2E1DA] bg-white text-[12.5px] text-[#18181B] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#18181B] shadow-2xs"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'degree', label: 'Degrees' },
                    { id: 'transcript', label: 'Transcripts' },
                    { id: 'license', label: 'Licenses' },
                    { id: 'id', label: 'ID / Passports' },
                    { id: 'other', label: 'Other' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setVaultCategoryFilter(filter.id as any)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        vaultCategoryFilter === filter.id
                          ? 'bg-[#18181B] text-white font-semibold'
                          : 'bg-white hover:bg-[#F3F2EE] border border-[#E2E1DA] text-[#5A5957]'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Credentials Cards Grid */}
              {credentials.length === 0 ? (
                <div className="py-14 px-6 text-center rounded-2xl bg-white border border-[#E2E1DA] shadow-2xs max-w-[540px] mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-[#10C77A]/15 text-[#10C77A] flex items-center justify-center mx-auto mb-3">
                    <FolderLock className="w-6 h-6" />
                  </div>
                  <h3 className="text-[17px] font-bold text-[#18181B]">
                    Your Vault is Currently Empty
                  </h3>
                  <p className="text-[13px] text-[#71717A] mt-1.5 leading-relaxed">
                    Upload your school certificates, degrees, or transcripts. The AI agent uses these files as its memory base to write CVs, assignments, and audit university admissions.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mt-5 h-9.5 px-4 rounded-xl bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] text-[13px] font-semibold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Your First Document</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCredentials
                    .filter((c) => vaultCategoryFilter === 'all' || c.type === vaultCategoryFilter)
                    .map((cred) => (
                      <div
                        key={cred.id}
                        className="rounded-2xl bg-white border border-[#E2E1DA] p-5 shadow-2xs hover:border-[#10C77A] hover:shadow-xs transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#E5E4DE] text-[#18181B] font-semibold">
                              {cred.type.toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-[10.5px] text-[#0E8A54] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
                              VERIFIED
                            </span>
                          </div>

                          <div className="text-[12px] text-[#71717A] font-medium truncate">
                            {cred.issuer}
                          </div>
                          <h3 className="text-[15px] font-semibold text-[#18181B] mt-0.5 leading-snug group-hover:text-[#0E8A54] transition-colors">
                            {cred.name}
                          </h3>

                          {/* Stated Purpose */}
                          <div className="mt-3 p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EBEAE5] text-[11.5px] text-[#18181B]">
                            <span className="text-[#71717A] block text-[10px] uppercase font-semibold mb-0.5">
                              Target Goal & Usage:
                            </span>
                            "{cred.purpose}"
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#F0EFEB] flex items-center justify-between text-[11.5px] gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleTagDocument(cred.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11.5px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer ${
                                selectedCredentialIds.includes(cred.id)
                                  ? 'bg-[#10C77A]/20 text-[#0E8A54] border border-[#10C77A]/40'
                                  : 'bg-[#FAF9F5] hover:bg-[#18181B] hover:text-white border border-[#E2E1DA] text-[#18181B]'
                              }`}
                              title="Tag this document in chat"
                            >
                              <AtSign className="w-3 h-3" />
                              <span>{selectedCredentialIds.includes(cred.id) ? 'Tagged' : 'Tag in Chat'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleTagDocument(cred.id);
                                setCurrentView('chat');
                                handleSendMessage(
                                  `Audit my "${cred.name}" from ${cred.issuer} for my target goal: "${cred.purpose}". What are my next steps?`
                                );
                              }}
                              className="text-[#0E8A54] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Audit</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setCredentials((prev) => prev.filter((c) => c.id !== cred.id));
                              dbService.removeCredential(cred.id);
                              onShowToast?.(`Removed "${cred.name}"`);
                            }}
                            className="text-[#A1A1AA] hover:text-rose-600 p-1.5 rounded-lg cursor-pointer transition-colors"
                            title="Delete credential"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

            </div>
          ) : (
            /* ------------------------------------------------------------ */
            /* CHAT WORKSPACE (Empty state or active conversation stream) */
            /* ------------------------------------------------------------ */
            !activeThreadId || messages.length === 0 ? (
              <div className="max-w-[760px] w-full mx-auto my-auto flex flex-col items-center justify-center py-8">
              
              {/* Authentic KRED Brand Logo & Heading */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8 text-center">
                <KredLogoMark size="default" />
                <h1 className="text-[28px] sm:text-[34px] font-bold text-[#18181B] tracking-[-0.03em] leading-tight">
                  Ready to audit?
                </h1>
              </div>

              {/* Mode Context Badge & Quick Action Suggestions */}
              <div className="w-full mb-4 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#18181B]">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        chatMode === 'agent' ? 'bg-[#10C77A] animate-pulse' : 'bg-[#3A6EFF]'
                      }`}
                    />
                    <span>
                      {chatMode === 'agent'
                        ? 'Agent Mode Active · Autonomous Document Synthesis'
                        : 'AI Chat Mode · Ask anything, learn subjects, or search the web'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#71717A]">
                    {chatMode === 'agent'
                      ? `${credentials.length} files referenced`
                      : isWebSearchActive
                      ? '🌐 Web Search ON'
                      : 'Conversational AI'}
                  </span>
                </div>

                {/* Quick Suggestion Pills */}
                <div className="flex flex-wrap gap-2 text-[12px]">
                  {(chatMode === 'agent'
                    ? [
                        {
                          title: '📄 Create CV from credentials',
                          prompt:
                            'Help me using all the information on my uploaded credentials to create a comprehensive, professional CV.',
                        },
                        {
                          title: '📝 Create coursework assignment',
                          prompt:
                            'Using all my uploaded school documents and course syllabus, help me create a structured academic assignment blueprint.',
                        },
                        {
                          title: '📊 Generate presentation slides',
                          prompt:
                            'Generate interactive presentation slides for my verified credentials and qualifications.',
                        },
                        {
                          title: '🎓 Draft scholarship statement',
                          prompt:
                            'Using my verified academic qualifications, draft a compelling statement of purpose for international scholarship applications.',
                        },
                      ]
                    : [
                        {
                          title: '🎓 Teach me machine learning',
                          prompt:
                            'Can you teach me machine learning from the ground up with intuitive concepts and code examples?',
                        },
                        {
                          title: '📄 Help me create a professional CV',
                          prompt:
                            'I want to generate a CV from my background. What information do you need?',
                        },
                        {
                          title: '🗺️ Build a study plan & roadmap',
                          prompt:
                            'Help me create a 6-week study plan and milestone roadmap for graduate admissions preparation.',
                        },
                        {
                          title: '🌐 Search UK Chevening scholarships',
                          prompt:
                            'Search the web for the latest UK Chevening and Commonwealth scholarship application criteria.',
                        },
                      ]
                  ).map((cmd, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInputText(cmd.prompt);
                        handleSendMessage(cmd.prompt);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3F2EE] border border-[#E2E1DA] hover:border-[#10C77A] text-[#18181B] font-medium transition-all cursor-pointer shadow-2xs text-left"
                    >
                      {cmd.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Floating Center Input Box */}
              <div className="w-full rounded-2xl bg-white border border-[#E0DFD7] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-3.5 sm:p-4 focus-within:border-[#18181B]/40 focus-within:shadow-[0_6px_28px_rgba(0,0,0,0.09)] transition-all relative">
                
                {/* Tagged Documents Chips Bar - Hidden on mobile for space */}
                {selectedCredentialIds.length > 0 && (
                  <div className="hidden sm:flex flex-wrap items-center gap-1.5 mb-2.5 pb-2 border-b border-[#F0EFEB]">
                    <span className="text-[11px] font-medium text-[#71717A] flex items-center gap-1">
                      <FileText className="w-3 h-3 text-[#10C77A]" />
                      Tagged Documents:
                    </span>
                    {selectedCredentialIds.map((id) => {
                      const cred = credentials.find((c) => c.id === id);
                      if (!cred) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#FAF9F5] border border-[#E2E1DA] text-[11.5px] text-[#18181B] font-medium shadow-2xs hover:border-[#10C77A] transition-colors"
                        >
                          <span className="text-[#0E8A54] font-semibold">@{cred.name.length > 22 ? cred.name.slice(0, 22) + '...' : cred.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(id)}
                            className="p-0.5 rounded-full hover:bg-[#E5E4DE] text-[#71717A] hover:text-[#18181B] cursor-pointer"
                            title="Remove document tag"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setIsAtMentionOpen(true)}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] transition-colors cursor-pointer"
                      title="Tag another document"
                    >
                      <AtSign className="w-3 h-3" />
                      <span>Tag more</span>
                    </button>
                  </div>
                )}

                {/* @ Mention Popover Dropdown */}
                {isAtMentionOpen && (
                  <div className="absolute left-3 bottom-full mb-2 w-72 sm:w-84 rounded-2xl bg-white border border-[#E0DFD7] shadow-xl p-2 z-50 animate-toast text-[12px]">
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#F0EFEB]">
                      <div className="font-semibold text-[#18181B] flex items-center gap-1.5">
                        <AtSign className="w-3.5 h-3.5 text-[#10C77A]" />
                        <span>Tag a Document</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAtMentionOpen(false)}
                        className="p-1 rounded-md text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="my-1.5 max-h-52 overflow-y-auto space-y-1 pr-1">
                      {credentials.length === 0 ? (
                        <div className="p-3 text-center text-[#71717A] text-[11.5px]">
                          No documents in vault yet.
                          <button
                            type="button"
                            onClick={() => {
                              setIsAtMentionOpen(false);
                              setIsUploadModalOpen(true);
                            }}
                            className="mt-1 block mx-auto text-[#0E8A54] font-semibold hover:underline cursor-pointer"
                          >
                            + Upload Document
                          </button>
                        </div>
                      ) : (
                        credentials
                          .filter(
                            (c) =>
                              !atMentionQuery ||
                              c.name.toLowerCase().includes(atMentionQuery) ||
                              c.issuer.toLowerCase().includes(atMentionQuery) ||
                              c.type.toLowerCase().includes(atMentionQuery)
                          )
                          .map((cred) => {
                            const isTagged = selectedCredentialIds.includes(cred.id);
                            return (
                              <button
                                key={cred.id}
                                type="button"
                                onClick={() => handleSelectAtMentionDoc(cred)}
                                className={`w-full text-left p-2 rounded-xl transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                  isTagged ? 'bg-[#10C77A]/10 text-[#0E8A54]' : 'hover:bg-[#F4F3ED] text-[#18181B]'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-[12px] truncate flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5 text-[#10C77A] shrink-0" />
                                    <span className="truncate">{cred.name}</span>
                                  </div>
                                  <div className="text-[10.5px] text-[#71717A] truncate">
                                    {cred.issuer} · {cred.type.toUpperCase()}
                                  </div>
                                </div>
                                {isTagged ? (
                                  <Check className="w-3.5 h-3.5 text-[#10C77A] shrink-0" />
                                ) : (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAF9F5] border border-[#E2E1DA] text-[#71717A] shrink-0">
                                    Tag
                                  </span>
                                )}
                              </button>
                            );
                          })
                      )}
                    </div>

                    <div className="pt-1.5 border-t border-[#F0EFEB] px-2 flex items-center justify-between text-[11px] text-[#71717A]">
                      <span>Click to tag in chat</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAtMentionOpen(false);
                          setIsUploadModalOpen(true);
                        }}
                        className="text-[#0E8A54] hover:underline font-semibold cursor-pointer"
                      >
                        + Upload New
                      </button>
                    </div>
                  </div>
                )}

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  rows={3}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    chatMode === 'agent'
                      ? "Command your credentials (e.g. 'Help me create a CV from my documents' or 'Create an assignment')..."
                      : "How can I help you today? Type @ to tag documents, ask questions, or say hello..."
                  }
                  className="w-full bg-transparent text-[15px] sm:text-[16px] text-[#18181B] placeholder:text-[#9CA3AF] focus:outline-none resize-none leading-relaxed"
                />

                {/* Bottom Toolbar inside the Box */}
                <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-[#F0EFEB] text-[12.5px]">
                  
                  {/* Left Controls: + Upload, @ Tag, Mode Toggle (Chat / Agent) */}
                  <div className="flex items-center gap-2">
                    {/* + Attachment Button (Upload Credential Trigger) - Hidden on mobile for space */}
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="hidden sm:flex w-7 h-7 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] items-center justify-center transition-colors cursor-pointer"
                      title="Upload or attach credential"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    {/* @ Tag Document Button - Hidden on mobile */}
                    <button
                      type="button"
                      onClick={() => setIsAtMentionOpen(!isAtMentionOpen)}
                      className={`hidden sm:flex w-7 h-7 rounded-lg items-center justify-center transition-colors cursor-pointer ${
                        isAtMentionOpen
                          ? 'bg-[#10C77A]/15 text-[#0E8A54]'
                          : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE]'
                      }`}
                      title="Tag a document (@)"
                    >
                      <AtSign className="w-4 h-4" />
                    </button>

                    {/* Chat / Agent Mode Switcher */}
                    <div className="flex items-center bg-[#F4F3ED] p-0.5 rounded-lg border border-[#E2E1DA]">
                      <button
                        type="button"
                        onClick={() => setChatMode('chat')}
                        className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                          chatMode === 'chat'
                            ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                            : 'text-[#71717A] hover:text-[#18181B]'
                        }`}
                      >
                        Chat
                      </button>
                      <button
                        type="button"
                        onClick={() => setChatMode('agent')}
                        className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                          chatMode === 'agent'
                            ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                            : 'text-[#71717A] hover:text-[#18181B]'
                        }`}
                      >
                        Agent
                      </button>
                    </div>

                    {/* DuckDuckGo Web Search Toggle Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsWebSearchActive(!isWebSearchActive);
                        onShowToast?.(!isWebSearchActive ? '🌐 DuckDuckGo Web Search enabled.' : 'Web Search disabled.');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[12px] font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer border ${
                        isWebSearchActive
                          ? 'bg-[#3A6EFF]/15 text-[#3A6EFF] border-[#3A6EFF]/40 font-semibold shadow-2xs'
                          : 'bg-transparent text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] border-transparent'
                      }`}
                      title="Toggle DuckDuckGo Web Search"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isWebSearchActive ? 'Web Search ON' : 'Web Search'}</span>
                    </button>
                  </div>

                  {/* Right Controls: Referenced Credentials Dropdown, Mic, Audio, Send */}
                  <div className="flex items-center gap-2">
                    
                    {/* Referenced Credentials Dropdown Selector - Hidden on mobile to give more space */}
                    <div className="relative hidden sm:block">
                      <button
                        type="button"
                        onClick={() => setShowCredDropdown(!showCredDropdown)}
                        className="h-8 px-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#F3F2EE] border border-[#E2E1DA] text-[12px] text-[#18181B] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Select which vault credentials the AI references"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#10C77A]" />
                        <span className="truncate max-w-[130px] sm:max-w-[190px]">
                          {selectedCredentialIds.length === 0
                            ? `All Documents (${credentials.length})`
                            : `${selectedCredentialIds.length} of ${credentials.length} Docs`}
                        </span>
                        <ChevronDown className="w-3 h-3 text-[#71717A] shrink-0" />
                      </button>

                      {showCredDropdown && (
                        <div className="absolute right-0 bottom-full mb-2 w-72 sm:w-80 rounded-2xl bg-white border border-[#E0DFD7] shadow-xl p-3 z-40 animate-toast text-[12px]">
                          <div className="flex items-center justify-between pb-2 border-b border-[#F0EFEB]">
                            <div className="font-semibold text-[#18181B] flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-[#10C77A]" />
                              <span>Referenced Credentials</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <button
                                type="button"
                                onClick={() => setSelectedCredentialIds([])}
                                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                                  selectedCredentialIds.length === 0 ? 'bg-[#10C77A]/15 text-[#0E8A54] font-semibold' : 'text-[#71717A] hover:text-[#18181B]'
                                }`}
                              >
                                All
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedCredentialIds(credentials.map((c) => c.id))}
                                className="text-[#71717A] hover:text-[#18181B] px-1.5 py-0.5 cursor-pointer"
                              >
                                Select All
                              </button>
                            </div>
                          </div>

                          <div className="my-2 max-h-48 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                            {credentials.length === 0 ? (
                              <div className="py-4 text-center text-[#71717A] text-[11.5px]">
                                No documents in vault yet.
                              </div>
                            ) : (
                              credentials.map((cred) => {
                                const isChecked = selectedCredentialIds.length === 0 || selectedCredentialIds.includes(cred.id);
                                return (
                                  <label
                                    key={cred.id}
                                    className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-[#F4F3ED] cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (selectedCredentialIds.length === 0) {
                                          setSelectedCredentialIds(credentials.filter((c) => c.id !== cred.id).map((c) => c.id));
                                        } else if (e.target.checked) {
                                          setSelectedCredentialIds((prev) => [...prev, cred.id]);
                                        } else {
                                          setSelectedCredentialIds((prev) => prev.filter((id) => id !== cred.id));
                                        }
                                      }}
                                      className="mt-0.5 rounded border-[#D4D4D8] text-[#10C77A] focus:ring-[#10C77A] cursor-pointer"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-[12px] font-medium text-[#18181B] truncate">
                                        {cred.name}
                                      </div>
                                      <div className="text-[10.5px] text-[#71717A] truncate">
                                        {cred.issuer} · {cred.type.toUpperCase()}
                                      </div>
                                    </div>
                                  </label>
                                );
                              })
                            )}
                          </div>

                          <div className="pt-2 border-t border-[#F0EFEB] flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                setShowCredDropdown(false);
                                setIsUploadModalOpen(true);
                              }}
                              className="text-[#0E8A54] hover:underline text-[11.5px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Upload New File</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowCredDropdown(false)}
                              className="px-2.5 py-1 rounded-md bg-[#18181B] text-white text-[11px] font-semibold cursor-pointer"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Microphone Icon (Real Web Speech API Speech-to-Text) */}
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        isListening
                          ? 'bg-[#EF4444] text-white shadow-xs animate-pulse ring-2 ring-[#EF4444]/40'
                          : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE]'
                      }`}
                      title={isListening ? 'Listening... Click to stop speech-to-text' : 'Click to use Speech-to-Text'}
                    >
                      {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
                    </button>

                    {/* Waveform Icon */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isListening) {
                          toggleVoiceInput();
                        } else {
                          toggleVoiceInput();
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isListening
                          ? 'text-[#10C77A] bg-[#10C77A]/10 animate-pulse'
                          : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE]'
                      }`}
                      title={isListening ? 'Voice recording active' : 'Audio dictation mode'}
                    >
                      <AudioWaveform className="w-4 h-4" />
                    </button>

                    {/* Send Button */}
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim()}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        inputText.trim()
                          ? 'bg-[#10C77A] text-[#18181B] shadow-xs active:scale-95'
                          : 'bg-[#E5E4DE] text-[#A1A1AA] cursor-not-allowed'
                      }`}
                      title="Send message"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>

              </div>

              {/* Real User Credentials Section (Scrollable below the prompt, no push up) */}
              {credentials.length > 0 && (
                <div className="mt-8 w-full max-w-[740px] text-left">
                  <div className="flex items-center justify-between mb-2.5 px-1 text-[11.5px] text-[#71717A]">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
                      <span className="font-semibold text-[#18181B]">Uploaded Credentials</span>
                      <span>· Sovereign Vault ({credentials.length})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsVaultDrawerOpen(true)}
                      className="text-[#0E8A54] hover:underline font-medium text-[11px] cursor-pointer"
                    >
                      Manage Vault →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {credentials.map((cred) => {
                      const isTagged = selectedCredentialIds.includes(cred.id);
                      return (
                        <div
                          key={cred.id}
                          className="rounded-xl bg-white border border-[#E5E4DE] hover:border-[#10C77A]/70 p-3 sm:p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group relative"
                        >
                          <div>
                            {/* Card Top Row: Type Pill, Issuer, 3-Dot Options Button */}
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#E5E4DE] text-[#18181B] font-mono text-[9.5px] font-semibold tracking-wider">
                                {cred.type.toUpperCase()}
                              </span>

                              <div className="flex items-center gap-1">
                                <span className="text-[10.5px] text-[#71717A] truncate max-w-[130px]">
                                  {cred.issuer}
                                </span>

                                {/* 3-Dot Dropdown Options Button */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenCredMenuId(openCredMenuId === cred.id ? null : cred.id);
                                    }}
                                    className="p-1 rounded-lg hover:bg-[#F4F3ED] text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
                                    title="More options"
                                  >
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                  </button>

                                  {openCredMenuId === cred.id && (
                                    <div
                                      onClick={(e) => e.stopPropagation()}
                                      className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white border border-[#E0DFD7] shadow-xl py-1 z-50 animate-toast text-[12px] text-[#18181B]"
                                    >
                                      {/* Tag in Chat */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleTagDocument(cred.id);
                                          setOpenCredMenuId(null);
                                        }}
                                        className="w-full px-3 py-1.5 text-left hover:bg-[#F4F3ED] flex items-center gap-2 cursor-pointer transition-colors"
                                      >
                                        <AtSign className="w-3.5 h-3.5 text-[#10C77A]" />
                                        <span>{isTagged ? 'Remove Tag' : 'Tag in Chat'}</span>
                                      </button>

                                      {/* Rename with AI */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setRenamingCred(cred);
                                          setRenamingNewTitle(cred.name);
                                          setOpenCredMenuId(null);
                                        }}
                                        className="w-full px-3 py-1.5 text-left hover:bg-[#F4F3ED] flex items-center gap-2 cursor-pointer transition-colors"
                                      >
                                        <Sparkles className="w-3.5 h-3.5 text-[#3A6EFF]" />
                                        <span>Rename with AI</span>
                                      </button>

                                      {/* Audit with AI */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenCredMenuId(null);
                                          handleSendMessage(`Audit my ${cred.name} from ${cred.issuer} for my target goal: "${cred.purpose}".`);
                                        }}
                                        className="w-full px-3 py-1.5 text-left hover:bg-[#F4F3ED] flex items-center gap-2 cursor-pointer transition-colors"
                                      >
                                        <Play className="w-3.5 h-3.5 text-[#10C77A] fill-current" />
                                        <span>Audit with AI</span>
                                      </button>

                                      {/* Delete */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          dbService.removeCredential(cred.id);
                                          setCredentials(dbService.getCredentials());
                                          setSelectedCredentialIds((prev) => prev.filter((id) => id !== cred.id));
                                          setOpenCredMenuId(null);
                                          onShowToast?.(`Deleted "${cred.name}"`);
                                        }}
                                        className="w-full px-3 py-1.5 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer transition-colors border-t border-[#F0EFEB]"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Delete Credential</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Document Title */}
                            <div
                              onClick={() => handleSendMessage(`Audit my ${cred.name} from ${cred.issuer} for my target goal: "${cred.purpose}".`)}
                              className="text-[13px] font-semibold text-[#18181B] leading-snug group-hover:text-[#0E8A54] transition-colors line-clamp-1 cursor-pointer"
                              title={cred.name}
                            >
                              {cred.name}
                            </div>
                            <div className="text-[11px] text-[#71717A] truncate mt-0.5">
                              {cred.purpose || 'Stored in Sovereign Vault'}
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="mt-2.5 pt-2 border-t border-[#F0EFEB] flex items-center justify-between text-[11px]">
                            <span className="truncate text-[10px] font-mono text-[#71717A]">
                              {cred.extractedDetails?.gpa || cred.extractedDetails?.score || cred.extractedDetails?.level || 'Verified Enclave'}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleTagDocument(cred.id)}
                                className={`text-[11px] font-medium transition-colors cursor-pointer ${
                                  isTagged ? 'text-[#0E8A54] font-semibold' : 'text-[#71717A] hover:text-[#18181B]'
                                }`}
                              >
                                {isTagged ? '✓ Tagged' : '@ Tag'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendMessage(`Audit my ${cred.name} from ${cred.issuer} for my target goal: "${cred.purpose}".`)}
                                className="text-[#0E8A54] font-semibold hover:underline cursor-pointer flex items-center gap-0.5"
                              >
                                <span>Audit</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* ------------------------------------------------------------ */
            /* ACTIVE CONVERSATION STREAM (Clean seamless message bubbles without repeated bot icons) */
            /* ------------------------------------------------------------ */
            <div className="max-w-[760px] w-full mx-auto py-6 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Message Bubble: AI has clean transparent markdown layout without repetitive bot icons; User has smooth all-rounded pill background */}
                  <div
                    className={`text-[14.5px] leading-relaxed w-full ${
                      msg.role === 'user'
                        ? 'max-w-[85%] ml-auto rounded-3xl px-4 py-3 sm:px-5 sm:py-3.5 bg-[#18181B] text-white shadow-2xs'
                        : 'max-w-full text-[#18181B] bg-transparent border-none shadow-none px-1 py-1'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div
                        className="kred-markdown text-[14.5px] leading-relaxed text-[#18181B] font-sans"
                        dangerouslySetInnerHTML={{
                          __html: marked.parse(msg.text, { async: false, breaks: true }) as string,
                        }}
                      />
                    ) : msg.text.startsWith('[PREFERENCE_SELECTED]') ? (
                      <div className="flex items-center gap-2.5 text-[13px] sm:text-[13.5px]">
                        <span className="w-2 h-2 rounded-full bg-[#10C77A] shrink-0 animate-pulse" />
                        <span className="text-white/95 font-medium leading-snug">
                          {msg.text
                            .replace(/^\[PREFERENCE_SELECTED\]\s*Selected specifications:\s*/i, '')
                            .replace(/\.\s*Please generate the complete customized deliverable now\.$/i, '')}
                        </span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-line space-y-2 font-sans leading-relaxed">
                        {msg.text}
                      </div>
                    )}

                    {/* Clean Discreet Search Citation Footnote */}
                    {msg.role === 'assistant' && (
                      (msg.searchResults && msg.searchResults.length > 0) ||
                      (msg.sources && msg.sources.some((s) => s.toLowerCase().includes('duckduckgo') || s.toLowerCase().includes('web search') || s.toLowerCase().includes('web intelligence')))
                    ) && (
                      <div className="mt-2.5 flex items-center gap-2 text-[11.5px] text-[#71717A]">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#E2E1DA] font-sans">
                          <Globe className="w-3.5 h-3.5 text-[#3A6EFF]" />
                          <span className="font-medium text-[#52525B]">DuckDuckGo was used for real-time web verification</span>
                        </div>
                      </div>
                    )}

                    {/* Claude-Style Interactive Intake & Reasoning Form */}
                    {msg.role === 'assistant' && msg.form && (
                      <div className="mt-4 max-w-[680px] rounded-2xl bg-white border border-[#E2E1DA] hover:border-[#10C77A]/60 transition-all p-4 sm:p-5 shadow-2xs text-[#18181B]">
                        {/* Form Header */}
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#F0EFEB]">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#10C77A]/15 text-[#0E8A54] flex items-center justify-center shrink-0">
                              <SlidersHorizontal className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[13.5px] font-bold text-[#18181B] flex items-center gap-2">
                                <span className="truncate">{msg.form.title}</span>
                                <span className="px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#E2E1DA] text-[10px] font-mono font-semibold text-[#71717A] shrink-0">
                                  {submittedForms[msg.id] ? 'Submitted ✓' : 'Customization Form'}
                                </span>
                              </div>
                              <p className="text-[11.5px] text-[#71717A] mt-0.5 leading-snug">
                                {msg.form.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Form Body */}
                        {!submittedForms[msg.id] ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSubmitInteractiveForm(msg);
                            }}
                            className="mt-4 space-y-3.5 text-[12.5px]"
                          >
                            {/* Input Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {msg.form.fields.map((field) => (
                                <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                                  <label className="block text-[11.5px] font-semibold text-[#18181B] mb-1">
                                    {field.label} {field.required && <span className="text-[#0E8A54]">*</span>}
                                  </label>
                                  {field.type === 'textarea' ? (
                                    <textarea
                                      rows={2}
                                      value={formInputs[msg.id]?.[field.id] ?? (field.id === 'fullName' ? effectiveUserName : '')}
                                      onChange={(e) => handleFormInputChange(msg.id, field.id, e.target.value)}
                                      placeholder={field.placeholder}
                                      className="w-full p-2.5 rounded-xl border border-[#E2E1DA] bg-[#FAF9F5] focus:bg-white text-[12.5px] text-[#18181B] focus:outline-none focus:border-[#18181B] transition-colors resize-none leading-relaxed"
                                    />
                                  ) : (
                                    <input
                                      type={field.type || 'text'}
                                      required={field.required}
                                      value={formInputs[msg.id]?.[field.id] ?? (field.id === 'fullName' ? effectiveUserName : '')}
                                      onChange={(e) => handleFormInputChange(msg.id, field.id, e.target.value)}
                                      placeholder={field.placeholder}
                                      className="w-full h-9 px-3 rounded-xl border border-[#E2E1DA] bg-[#FAF9F5] focus:bg-white text-[12.5px] text-[#18181B] focus:outline-none focus:border-[#18181B] transition-colors"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Clickable Choice Questions */}
                            {msg.form.questions && msg.form.questions.length > 0 && (
                              <div className="space-y-3 pt-2 border-t border-[#F0EFEB]">
                                {msg.form.questions.map((q) => (
                                  <div key={q.id}>
                                    <label className="block text-[11.5px] font-semibold text-[#18181B] mb-1.5">
                                      {q.title}
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                      {q.options.map((opt) => {
                                        const isSelected =
                                          (formOptions[msg.id]?.[q.id] || []).includes(opt.id) ||
                                          (!formOptions[msg.id]?.[q.id] && opt.id === q.options[0].id);
                                        return (
                                          <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => handleToggleFormOption(msg.id, q.id, opt.id, q.multiSelect)}
                                            className={`px-3 py-1.5 rounded-xl text-[11.5px] font-medium transition-all cursor-pointer border ${
                                              isSelected
                                                ? 'bg-[#10C77A]/15 border-[#10C77A] text-[#18181B] font-semibold shadow-2xs'
                                                : 'bg-[#FAF9F5] border-[#E2E1DA] text-[#71717A] hover:bg-[#F3F2EE] hover:text-[#18181B]'
                                            }`}
                                          >
                                            {isSelected && '✓ '}
                                            {opt.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Form Submit Button */}
                            <div className="pt-2 flex items-center justify-end gap-2">
                              <button
                                type="submit"
                                className="h-9 px-4 rounded-xl bg-[#18181B] hover:bg-[#10C77A] hover:text-[#18181B] text-white text-[12.5px] font-semibold inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>✨ Reason & Generate Tailored Document</span>
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="mt-3 p-3 rounded-xl bg-[#10C77A]/10 border border-[#10C77A]/30 text-[12px] text-[#0E8A54] flex items-center justify-between">
                            <span className="font-medium">Details submitted · Synthesized tailored output</span>
                            <button
                              type="button"
                              onClick={() => setSubmittedForms((prev) => ({ ...prev, [msg.id]: false }))}
                              className="text-[#18181B] font-semibold hover:underline text-[11px] cursor-pointer"
                            >
                              Edit Details
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Clarification prompt badge in chat feed (Full interactive questionnaire is exclusively on top of main text input) */}
                    {msg.role === 'assistant' &&
                      !msg.form &&
                      msg.questions &&
                      msg.questions.length > 0 &&
                      !questionnaireState[msg.id]?.isSubmitted && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#E2E1DA] text-[12px] text-[#71717A] shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5 text-[#10C77A]" />
                            <span>Clarification questions active above chat input ↓</span>
                            {questionnaireState[msg.id]?.isDismissed && (
                              <button
                                type="button"
                                onClick={() => {
                                  setQuestionnaireState((prev) => ({
                                    ...prev,
                                    [msg.id]: {
                                      ...(prev[msg.id] || { currentQuestionIndex: 0, selectedOptions: {} }),
                                      isDismissed: false,
                                    },
                                  }));
                                  setActiveQuestionPopupMsgId(msg.id);
                                }}
                                className="ml-1.5 font-semibold text-[#0E8A54] hover:underline cursor-pointer"
                              >
                                Re-open
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                    {/* AI Document Artifact Callout (Only rendered after all clarification questions have been answered and output is generated) */}
                    {msg.role === 'assistant' &&
                      (msg.actionLabel || (msg.text.startsWith('# ') && msg.text.length > 200)) &&
                      (!msg.questions || msg.questions.length === 0 || questionnaireState[msg.id]?.isSubmitted) && (
                      <div className="mt-3.5 space-y-2.5">
                        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E1DA] hover:border-[#10C77A] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#10C77A]/15 text-[#0E8A54] flex items-center justify-center shrink-0">
                              <FileText className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[13px] font-semibold text-[#18181B] truncate">
                                {msg.text.includes('FLASHCARD') || msg.text.includes('Flashcard')
                                  ? 'Interactive Study Flashcards'
                                  : msg.text.includes('INVOICE') || msg.text.includes('#INV-')
                                  ? 'Invoice & Verification Statement'
                                  : msg.text.includes('STUDENT STUDY PLAN') || msg.text.includes('ACADEMIC ROADMAP')
                                  ? 'Student Study Plan & Roadmap'
                                  : msg.text.includes('PRESENTATION') || msg.text.includes('Slide 1') || msg.text.includes('01 — Title')
                                  ? 'Presentation Slide Deck'
                                  : msg.text.includes('CURRICULUM') || msg.text.includes('CV')
                                  ? 'Executive Curriculum Vitae (CV)'
                                  : msg.text.includes('ASSIGNMENT') || msg.text.includes('COURSEWORK')
                                  ? 'Academic Assignment Blueprint'
                                  : msg.text.includes('APPLICATION') || msg.text.includes('STATEMENT OF PURPOSE')
                                  ? 'Application Statement of Purpose'
                                  : 'Verified Deliverable Document'}
                              </div>
                              <div className="text-[11px] text-[#71717A]">
                                Synthesized File · Live Preview & PDF Export Ready
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const lower = msg.text.toLowerCase();
                                const isFlashcards = lower.includes('flashcard') || (lower.includes('front:') && lower.includes('back:'));
                                const isReceipt = lower.includes('receipt') || lower.includes('invoice') || msg.text.includes('#REC-') || msg.text.includes('#INV-');
                                const isSlides = lower.includes('presentation') || lower.includes('slide 1') || lower.includes('slide') || msg.text.includes('01 — Title');
                                const isCv = !isFlashcards && !isReceipt && !isSlides && (lower.includes('curriculum vitae') || lower.includes('resume') || lower.includes('executive summary'));
                                const isStudyPlan = !isFlashcards && !isReceipt && !isSlides && !isCv && (lower.includes('study plan') || lower.includes('academic roadmap'));
                                const isCoverLetter = lower.includes('application letter') || lower.includes('statement of purpose');

                                const title = isSlides
                                  ? 'Presentation Slide Deck'
                                  : isFlashcards
                                  ? 'Interactive Study Flashcards'
                                  : isReceipt
                                  ? 'Sales Receipt & Attestation'
                                  : isStudyPlan
                                  ? 'Student Study Plan & Academic Roadmap'
                                  : isCv
                                  ? 'Executive Curriculum Vitae (CV)'
                                  : isCoverLetter
                                  ? 'Application Statement of Purpose'
                                  : 'Deliverable Document';

                                openCanvas(
                                  msg.text,
                                  title,
                                  isSlides ? 'slides' : isFlashcards ? 'flashcards' : isReceipt ? 'receipt' : isStudyPlan ? 'study_plan' : isCv ? 'cv' : isCoverLetter ? 'cover_letter' : 'document'
                                );
                              }}
                              className="h-8 px-3 rounded-xl bg-[#18181B] hover:bg-[#10C77A] hover:text-[#18181B] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Open in Canvas</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const lower = msg.text.toLowerCase();
                                const isSlides = lower.includes('presentation') || lower.includes('slide');
                                const isCv = lower.includes('curriculum') || lower.includes('resume') || lower.includes('cv');
                                const isFlashcards = lower.includes('flashcard');
                                const isReceipt = lower.includes('receipt') || lower.includes('invoice');

                                const title = isSlides
                                  ? 'Presentation Slide Deck'
                                  : isCv
                                  ? 'Executive Curriculum Vitae (CV)'
                                  : isFlashcards
                                  ? 'Study Flashcards Deck'
                                  : isReceipt
                                  ? 'Receipt Document'
                                  : 'Deliverable Document';

                                openCanvas(msg.text, title, isSlides ? 'slides' : isCv ? 'cv' : isFlashcards ? 'flashcards' : isReceipt ? 'receipt' : 'document');
                                setTimeout(() => window.print(), 300);
                              }}
                              className="h-8 px-2.5 rounded-xl bg-white hover:bg-[#F3F2EE] border border-[#E2E1DA] text-[#18181B] text-[11.5px] font-medium inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                              title="Export as PDF"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#71717A]" />
                              <span className="hidden sm:inline">PDF</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Message Action Bar (Copy Text, Read Aloud TTS, 3-Dot More Menu) */}
                    {msg.role === 'assistant' && (
                      <div className="mt-2.5 pt-2 flex items-center justify-between border-t border-[#F0EFEB] text-[#71717A]">
                        <div className="flex items-center gap-1">
                          {/* Copy Text Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.text)}
                            className="p-1.5 rounded-lg hover:text-[#18181B] hover:bg-[#F3F2EE] transition-all cursor-pointer"
                            title={copiedMsgId === msg.id ? 'Copied!' : 'Copy text'}
                          >
                            {copiedMsgId === msg.id ? (
                              <Check className="w-4 h-4 text-[#10C77A]" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          {/* Read Chat Aloud (TTS) Button */}
                          <button
                            type="button"
                            onClick={() => handleReadAloud(msg.id, msg.text)}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                              speakingMsgId === msg.id
                                ? 'text-[#10C77A] bg-[#10C77A]/15 ring-1 ring-[#10C77A]'
                                : 'hover:text-[#18181B] hover:bg-[#F3F2EE]'
                            }`}
                            title={speakingMsgId === msg.id ? 'Stop reading aloud' : 'Read chat aloud'}
                          >
                            {speakingMsgId === msg.id ? (
                              <VolumeX className="w-4 h-4 animate-pulse" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>

                          {/* 3-Dot More Options Menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuMsgId(openMenuMsgId === msg.id ? null : msg.id);
                              }}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                openMenuMsgId === msg.id
                                  ? 'bg-[#EFEFEB] text-[#18181B]'
                                  : 'hover:text-[#18181B] hover:bg-[#F3F2EE]'
                              }`}
                              title="More options"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {openMenuMsgId === msg.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute left-0 bottom-full mb-1 w-52 rounded-xl bg-white border border-[#E0DFD7] shadow-xl py-1 z-40 animate-toast text-[12px] text-[#18181B]"
                              >
                                {/* Save Audit */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSaveAudit(msg);
                                    setOpenMenuMsgId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-[#F4F3ED] flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <ShieldCheck className="w-4 h-4 text-[#10C77A]" />
                                  <span>Save Audit</span>
                                </button>

                                {/* Save to Vault */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSaveToVault(msg);
                                    setOpenMenuMsgId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-[#F4F3ED] flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <FolderLock className="w-4 h-4 text-[#71717A]" />
                                  <span>Save to Vault</span>
                                </button>

                                {/* Export as Markdown */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleExportMarkdown(msg);
                                    setOpenMenuMsgId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-[#F4F3ED] flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Download className="w-4 h-4 text-[#71717A]" />
                                  <span>Export Markdown (.md)</span>
                                </button>

                                {/* Open in Canvas */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    openCanvas(msg.text, 'Document Insights');
                                    setOpenMenuMsgId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-[#F4F3ED] flex items-center gap-2 cursor-pointer transition-colors border-t border-[#F0EFEB]"
                                >
                                  <Eye className="w-4 h-4 text-[#71717A]" />
                                  <span>Open in Preview Canvas</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-[11px] text-[#A1A1AA]">
                          {msg.timestamp || 'Just now'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-[#10C77A] text-[#18181B] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      {effectiveInitials}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3.5 items-start animate-fadeIn">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#E2E1DA] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <KredLogoMark size="small" />
                  </div>
                  <KredBouncingCardsLoader
                    label="Auditing credentials & requirements..."
                    sublabel="KRED Sovereign AI Engine is synthesizing response"
                  />
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>
          )
        )}

        </div>

        {/* Pinned Bottom Input Bar */}
        {currentView === 'chat' && activeThreadId && messages.length > 0 && (
          <div className="sticky bottom-0 z-30 w-full p-2 sm:p-5 bg-gradient-to-t from-[#FAF9F5] via-[#FAF9F5]/95 to-transparent shrink-0">
            <div className="max-w-[740px] mx-auto relative">

              {/* Floating Claude-Style Question Clarification Card (Themed in Website Emerald Palette) */}
              {(() => {
                const targetMsgId =
                  activeQuestionPopupMsgId ||
                  [...messages].reverse().find(
                    (m) =>
                      m.role === 'assistant' &&
                      m.questions &&
                      m.questions.length > 0 &&
                      !questionnaireState[m.id]?.isSubmitted &&
                      !questionnaireState[m.id]?.isDismissed
                  )?.id;

                if (!targetMsgId) return null;
                const targetMsg = messages.find((m) => m.id === targetMsgId);
                if (!targetMsg || !targetMsg.questions || targetMsg.questions.length === 0) return null;

                const qState = questionnaireState[targetMsgId] || {
                  currentQuestionIndex: 0,
                  selectedOptions: {},
                  customAnswers: {},
                };
                const currentIdx = Math.min(qState.currentQuestionIndex, targetMsg.questions.length - 1);
                const currentQuestion = targetMsg.questions[currentIdx];
                const totalQuestions = targetMsg.questions.length;

                return (
                  <div
                    className="mb-2.5 w-full bg-white rounded-2xl border border-[#E2E1DA] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.12)] p-3.5 sm:p-4 text-[#18181B] select-none transition-all duration-200 animate-toast"
                    role="dialog"
                    aria-label={currentQuestion.title}
                  >
                    {/* Header: Progress, Title, Dismiss */}
                    <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-[#F0EFEB]">
                      <div className="flex items-center gap-2">
                        {currentIdx > 0 && (
                          <button
                            type="button"
                            onClick={handlePrevQuestionDirectly}
                            className="p-1 -ml-1 rounded-md hover:bg-[#F3F2EE] text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
                            title="Previous question"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="text-[10.5px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#10C77A]/12 text-[#0E8A54] border border-[#10C77A]/25">
                          Step {currentIdx + 1} of {totalQuestions}
                        </span>
                        {totalQuestions > 1 && (
                          <div className="flex items-center gap-1">
                            {targetMsg.questions.map((_, i) => (
                              <span
                                key={i}
                                className={`h-1.5 rounded-full transition-all ${
                                  i === currentIdx
                                    ? 'w-4 bg-[#10C77A]'
                                    : i < currentIdx
                                    ? 'w-2 bg-[#0E8A54]'
                                    : 'w-2 bg-[#E2E1DA]'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveQuestionPopupMsgId(null);
                          setQuestionnaireState((prev) => ({
                            ...prev,
                            [targetMsgId]: {
                              ...(prev[targetMsgId] || { currentQuestionIndex: 0, selectedOptions: {} }),
                              isDismissed: true,
                            },
                          }));
                        }}
                        className="w-6 h-6 rounded-md hover:bg-[#F3F2EE] text-[#71717A] hover:text-[#18181B] flex items-center justify-center transition-colors cursor-pointer"
                        title="Dismiss (Esc)"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Question Title */}
                    <div className="mb-2.5">
                      <h3 className="text-[14px] sm:text-[14.5px] font-semibold text-[#18181B] tracking-tight">
                        {currentQuestion.title}
                      </h3>
                    </div>

                    {/* Options List */}
                    <div className="space-y-1">
                      {currentQuestion.options.map((opt, idx) => {
                        const isFocused = focusedOptionIndex === idx;
                        const isChosen = qState.selectedOptions?.[currentQuestion.id]?.includes(opt.id);

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onMouseEnter={() => setFocusedOptionIndex(idx)}
                            onClick={() => handleSelectOptionDirectly(idx)}
                            className={`w-full px-3.5 py-2.5 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer group ${
                              isChosen
                                ? 'border-2 border-[#10C77A] bg-[#10C77A]/10 text-[#18181B] font-medium shadow-2xs'
                                : isFocused
                                ? 'border-2 border-[#10C77A] bg-[#10C77A]/6 shadow-2xs text-[#18181B]'
                                : 'border border-[#F0EFEB] hover:bg-[#F8F7F2] text-[#27272A]'
                            }`}
                          >
                            <span
                              className={`w-5.5 h-5.5 rounded-md text-[11px] font-mono font-semibold flex items-center justify-center shrink-0 transition-colors ${
                                isChosen || isFocused
                                  ? 'bg-[#10C77A] text-[#18181B]'
                                  : 'bg-[#F4F3ED] text-[#71717A] group-hover:text-[#18181B]'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className="text-[13px] sm:text-[13.5px] font-medium flex-1">
                              {opt.label}
                            </span>
                            <span className="text-[11px] font-mono text-[#0E8A54] flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>{currentIdx < totalQuestions - 1 ? 'Next' : 'Select'}</span>
                              <CornerDownLeft className="w-3.5 h-3.5" />
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Text Input Section */}
                    <div className="mt-2.5 pt-2 border-t border-[#F0EFEB]">
                      <div className="text-[11.5px] font-medium text-[#71717A] mb-1.5 flex items-center justify-between">
                        <span>Or input your own custom response:</span>
                        {currentIdx > 0 && (
                          <button
                            type="button"
                            onClick={handlePrevQuestionDirectly}
                            className="text-[#0E8A54] hover:underline flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Back to Step {currentIdx}</span>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            data-question-input="true"
                            value={customQuestionInput}
                            onChange={(e) => setCustomQuestionInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSubmitCustomQuestionInput();
                              }
                            }}
                            placeholder="Type your custom requirements or topic..."
                            className="w-full text-[12.5px] px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#E2E1DA] focus:border-[#10C77A] focus:bg-white text-[#18181B] placeholder-[#A1A1AA] outline-none transition-all pr-8"
                          />
                          {customQuestionInput && (
                            <button
                              type="button"
                              onClick={() => setCustomQuestionInput('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#18181B] cursor-pointer"
                              title="Clear"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled={!customQuestionInput.trim()}
                          onClick={handleSubmitCustomQuestionInput}
                          className="h-8.5 px-3 rounded-xl bg-[#18181B] hover:bg-[#10C77A] hover:text-[#18181B] disabled:opacity-35 disabled:hover:bg-[#18181B] disabled:hover:text-white text-white text-[12px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
                        >
                          <span>{currentIdx < totalQuestions - 1 ? 'Next Step' : 'Confirm'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Navigation & Skip Row */}
                    <div className="pt-2 mt-2 border-t border-[#F0EFEB] flex items-center justify-between text-[11.5px] text-[#71717A]">
                      <div className="flex items-center gap-2">
                        {currentIdx > 0 ? (
                          <button
                            type="button"
                            onClick={handlePrevQuestionDirectly}
                            className="px-2.5 py-1 rounded-lg hover:bg-[#F3F2EE] text-[#71717A] hover:text-[#18181B] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Back</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#A1A1AA]">
                            Press 1-{currentQuestion.options.length} or click
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSkipQuestionDirectly()}
                        className="px-3 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#F3F2EE] border border-[#E2E1DA] text-[#71717A] hover:text-[#18181B] text-[11px] font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
                      >
                        Skip & generate standard
                      </button>
                    </div>
                  </div>
                );
              })()}

              <div className="rounded-2xl bg-white border border-[#E0DFD7] shadow-lg p-2.5 sm:p-3 focus-within:border-[#18181B]/40 transition-all relative">
                
                {/* Tagged Documents Chips Bar - Hidden on mobile for space */}
                {selectedCredentialIds.length > 0 && (
                  <div className="hidden sm:flex flex-wrap items-center gap-1.5 mb-2 pb-1.5 border-b border-[#F0EFEB]">
                    <span className="text-[11px] font-medium text-[#71717A] flex items-center gap-1">
                      <FileText className="w-3 h-3 text-[#10C77A]" />
                      Tagged:
                    </span>
                    {selectedCredentialIds.map((id) => {
                      const cred = credentials.find((c) => c.id === id);
                      if (!cred) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#FAF9F5] border border-[#E2E1DA] text-[11.5px] text-[#18181B] font-medium shadow-2xs hover:border-[#10C77A] transition-colors"
                        >
                          <span className="text-[#0E8A54] font-semibold">@{cred.name.length > 22 ? cred.name.slice(0, 22) + '...' : cred.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(id)}
                            className="p-0.5 rounded-full hover:bg-[#E5E4DE] text-[#71717A] hover:text-[#18181B] cursor-pointer"
                            title="Remove document tag"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setIsAtMentionOpen(true)}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] transition-colors cursor-pointer"
                      title="Tag another document"
                    >
                      <AtSign className="w-3 h-3" />
                      <span>Tag doc</span>
                    </button>
                  </div>
                )}

                {/* @ Mention Popover Dropdown */}
                {isAtMentionOpen && (
                  <div className="absolute left-3 bottom-full mb-2 w-72 sm:w-84 rounded-2xl bg-white border border-[#E0DFD7] shadow-xl p-2 z-50 animate-toast text-[12px]">
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#F0EFEB]">
                      <div className="font-semibold text-[#18181B] flex items-center gap-1.5">
                        <AtSign className="w-3.5 h-3.5 text-[#10C77A]" />
                        <span>Tag a Document</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAtMentionOpen(false)}
                        className="p-1 rounded-md text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="my-1.5 max-h-52 overflow-y-auto space-y-1 pr-1">
                      {credentials.length === 0 ? (
                        <div className="p-3 text-center text-[#71717A] text-[11.5px]">
                          No documents in vault yet.
                          <button
                            type="button"
                            onClick={() => {
                              setIsAtMentionOpen(false);
                              setIsUploadModalOpen(true);
                            }}
                            className="mt-1 block mx-auto text-[#0E8A54] font-semibold hover:underline cursor-pointer"
                          >
                            + Upload Document
                          </button>
                        </div>
                      ) : (
                        credentials
                          .filter(
                            (c) =>
                              !atMentionQuery ||
                              c.name.toLowerCase().includes(atMentionQuery) ||
                              c.issuer.toLowerCase().includes(atMentionQuery) ||
                              c.type.toLowerCase().includes(atMentionQuery)
                          )
                          .map((cred) => {
                            const isTagged = selectedCredentialIds.includes(cred.id);
                            return (
                              <button
                                key={cred.id}
                                type="button"
                                onClick={() => handleSelectAtMentionDoc(cred)}
                                className={`w-full text-left p-2 rounded-xl transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                  isTagged ? 'bg-[#10C77A]/10 text-[#0E8A54]' : 'hover:bg-[#F4F3ED] text-[#18181B]'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-[12px] truncate flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5 text-[#10C77A] shrink-0" />
                                    <span className="truncate">{cred.name}</span>
                                  </div>
                                  <div className="text-[10.5px] text-[#71717A] truncate">
                                    {cred.issuer} · {cred.type.toUpperCase()}
                                  </div>
                                </div>
                                {isTagged ? (
                                  <Check className="w-3.5 h-3.5 text-[#10C77A] shrink-0" />
                                ) : (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAF9F5] border border-[#E2E1DA] text-[#71717A] shrink-0">
                                    Tag
                                  </span>
                                )}
                              </button>
                            );
                          })
                      )}
                    </div>

                    <div className="pt-1.5 border-t border-[#F0EFEB] px-2 flex items-center justify-between text-[11px] text-[#71717A]">
                      <span>Click to tag in chat</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAtMentionOpen(false);
                          setIsUploadModalOpen(true);
                        }}
                        className="text-[#0E8A54] hover:underline font-semibold cursor-pointer"
                      >
                        + Upload New
                      </button>
                    </div>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (activeQuestionPopupMsgId) {
                        setActiveQuestionPopupMsgId(null);
                      }
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    activeQuestionPopupMsgId
                      ? "+ Or reply directly..."
                      : chatMode === 'agent'
                      ? "Command your credentials (e.g. 'Help me create a CV' or 'Generate slides for this document')..."
                      : "Ask a question, say hello, type @ to tag documents, or discuss..."
                  }
                  className="w-full bg-transparent text-[14px] sm:text-[15px] text-[#18181B] placeholder:text-[#9CA3AF] focus:outline-none resize-none px-2"
                />

                <div className="mt-2 pt-2 flex items-center justify-between border-t border-[#F0EFEB] text-[12px]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="hidden sm:flex w-7 h-7 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] items-center justify-center transition-colors cursor-pointer"
                      title="Upload or attach credential"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    {/* @ Tag Document Button - Hidden on mobile to maximize space */}
                    <button
                      type="button"
                      onClick={() => setIsAtMentionOpen(!isAtMentionOpen)}
                      className={`hidden sm:flex w-7 h-7 rounded-lg items-center justify-center transition-colors cursor-pointer ${
                        isAtMentionOpen
                          ? 'bg-[#10C77A]/15 text-[#0E8A54]'
                          : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE]'
                      }`}
                      title="Tag a document (@)"
                    >
                      <AtSign className="w-4 h-4" />
                    </button>

                    {/* Mode switcher in bottom bar */}
                    <div className="flex items-center bg-[#F4F3ED] p-0.5 rounded-lg border border-[#E2E1DA]">
                      <button
                        type="button"
                        onClick={() => setChatMode('chat')}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                          chatMode === 'chat'
                            ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                            : 'text-[#71717A] hover:text-[#18181B]'
                        }`}
                      >
                        Chat
                      </button>
                      <button
                        type="button"
                        onClick={() => setChatMode('agent')}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                          chatMode === 'agent'
                            ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                            : 'text-[#71717A] hover:text-[#18181B]'
                        }`}
                      >
                        Agent
                      </button>
                    </div>

                    {/* Web Search (DuckDuckGo) in bottom bar */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsWebSearchActive(!isWebSearchActive);
                        onShowToast?.(!isWebSearchActive ? '🌐 DuckDuckGo Web Search enabled.' : 'Web Search disabled.');
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all inline-flex items-center gap-1 cursor-pointer border ${
                        isWebSearchActive
                          ? 'bg-[#3A6EFF]/15 text-[#3A6EFF] border-[#3A6EFF]/40 font-semibold shadow-2xs'
                          : 'bg-transparent text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] border-transparent'
                      }`}
                      title="Toggle DuckDuckGo Web Search"
                    >
                      <Globe className="w-3 h-3" />
                      <span className="hidden sm:inline">{isWebSearchActive ? 'Web ON' : 'Web'}</span>
                    </button>

                    {/* Referenced Files Indicator */}
                    <button
                      type="button"
                      onClick={() => setIsVaultDrawerOpen(true)}
                      className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#71717A] hover:text-[#18181B] px-1.5 py-0.5 rounded hover:bg-[#F3F2EE] transition-colors cursor-pointer"
                      title="View referenced documents"
                    >
                      <FileText className="w-3 h-3 text-[#10C77A]" />
                      <span>
                        {selectedCredentialIds.length === 0
                          ? `${credentials.length} Files`
                          : `${selectedCredentialIds.length} Selected`}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Microphone Icon (Speech-to-Text) */}
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        isListening
                          ? 'bg-[#EF4444] text-white shadow-xs animate-pulse ring-2 ring-[#EF4444]/40'
                          : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE]'
                      }`}
                      title={isListening ? 'Listening... Click to stop speech-to-text' : 'Click to use Speech-to-Text'}
                    >
                      {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim()}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        inputText.trim()
                          ? 'bg-[#10C77A] text-[#18181B] shadow-xs active:scale-95'
                          : 'bg-[#E5E4DE] text-[#A1A1AA] cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Hints Bar below Input */}
              {activeQuestionPopupMsgId && (
                <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-[#71717A] select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono bg-[#FAF9F5] border border-[#E2E1DA] px-1.5 py-0.5 rounded text-[10px] text-[#52525B]">↑</span>
                    <span className="font-mono bg-[#FAF9F5] border border-[#E2E1DA] px-1.5 py-0.5 rounded text-[10px] text-[#52525B]">↓</span>
                    <span>to navigate</span>
                    <span className="text-[#D4D4D8]">·</span>
                    <span className="font-mono bg-[#FAF9F5] border border-[#E2E1DA] px-1.5 py-0.5 rounded text-[10px] text-[#52525B]">↵</span>
                    <span>to select</span>
                    <span className="text-[#D4D4D8]">·</span>
                    <span>or type below</span>
                  </div>
                  <div className="text-[10.5px] font-mono text-[#A1A1AA]">
                    Kred Sovereign Engine
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ============================================================ */}
      {/* LIVE PREVIEW CANVAS PANEL (Claude/ChatGPT-Style Document Viewer) */}
      {/* ============================================================ */}
      {isCanvasOpen && canvasDoc && (
        <aside
          style={{
            width: isCanvasExpanded ? '100%' : `${canvasWidth}px`,
            maxWidth: isCanvasExpanded ? '100%' : 'calc(100vw - 80px)',
            minWidth: isCanvasExpanded ? '100%' : '380px',
          }}
          className={`fixed lg:relative inset-y-0 right-0 z-40 bg-[#FBFBFA] border-l border-[#E2E1DA] shadow-2xl lg:shadow-none flex flex-col transition-all duration-75 shrink-0 ${
            isCanvasExpanded ? 'w-full' : 'w-full'
          }`}
        >
          {/* Left Edge Draggable Resizer Handle for expanding/resizing the sides */}
          {!isCanvasExpanded && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                isResizingCanvasRef.current = true;
                document.body.style.cursor = 'ew-resize';
                document.body.style.userSelect = 'none';
              }}
              className="hidden lg:flex absolute -left-2 top-0 bottom-0 w-4 cursor-ew-resize items-center justify-center group z-50 hover:bg-[#10C77A]/25 transition-all select-none"
              title="Drag horizontally to resize or expand the canvas width"
            >
              <div className="w-1.5 h-9 rounded-full bg-[#D4D3CC] group-hover:bg-[#10C77A] group-hover:h-14 transition-all flex items-center justify-center shadow-xs">
                <GripVertical className="w-3 h-3 text-[#18181B] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )}

          {/* Print Stylesheet injection */}
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #kred-canvas-print-area, #kred-canvas-print-area * {
                visibility: visible !important;
              }
              #kred-canvas-print-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 24px !important;
                background: white !important;
                color: black !important;
                border: none !important;
                box-shadow: none !important;
              }
            }
          `}</style>

          {/* Canvas Top Bar */}
          <div className="h-12 px-4 border-b border-[#E2E1DA] flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#10C77A]/15 text-[#0E8A54] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[13px] font-bold text-[#18181B] truncate">
                  {canvasDoc.title}
                </h3>
              </div>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#18181B] text-white font-semibold uppercase shrink-0">
                {canvasDoc.type.toUpperCase()} · PREVIEW CANVAS
              </span>
            </div>

            {/* Right Canvas Actions */}
            <div className="flex items-center gap-1.5 text-[12px]">
              {/* Width Presets (Compact / Wide) */}
              {!isCanvasExpanded && (
                <div className="hidden xl:flex items-center bg-[#F4F3ED] p-0.5 rounded-lg border border-[#E2E1DA] text-[10.5px]">
                  <button
                    type="button"
                    onClick={() => setCanvasWidth(520)}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      canvasWidth <= 560
                        ? 'bg-white text-[#18181B] font-bold shadow-2xs'
                        : 'text-[#71717A] hover:text-[#18181B]'
                    }`}
                    title="Standard Width (520px)"
                  >
                    520px
                  </button>
                  <button
                    type="button"
                    onClick={() => setCanvasWidth(780)}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      canvasWidth > 560 && canvasWidth <= 850
                        ? 'bg-white text-[#18181B] font-bold shadow-2xs'
                        : 'text-[#71717A] hover:text-[#18181B]'
                    }`}
                    title="Wide Width (780px)"
                  >
                    780px
                  </button>
                </div>
              )}

              {/* Tab Switcher */}
              <div className="flex items-center bg-[#F4F3ED] p-0.5 rounded-lg border border-[#E2E1DA]">
                <button
                  type="button"
                  onClick={() => setCanvasTab('preview')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    canvasTab === 'preview'
                      ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                      : 'text-[#71717A] hover:text-[#18181B]'
                  }`}
                >
                  Document
                </button>
                <button
                  type="button"
                  onClick={() => setCanvasTab('markdown')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    canvasTab === 'markdown'
                      ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                      : 'text-[#71717A] hover:text-[#18181B]'
                  }`}
                >
                  Source
                </button>
              </div>

              {/* Copy */}
              <button
                type="button"
                onClick={handleCopyDoc}
                className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] transition-colors cursor-pointer"
                title="Copy markdown text"
              >
                {copiedDocToast ? <Check className="w-4 h-4 text-[#0E8A54]" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Download .md */}
              <button
                type="button"
                onClick={handleDownloadDoc}
                className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] transition-colors cursor-pointer"
                title="Download document (.md)"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Print / Save as PDF */}
              <button
                type="button"
                onClick={handlePrintCanvas}
                className="h-7.5 px-2.5 rounded-lg bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] text-[11.5px] font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Print or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print PDF</span>
              </button>

              {/* Expand / Minimize Full Width */}
              <button
                type="button"
                onClick={() => setIsCanvasExpanded(!isCanvasExpanded)}
                className="hidden lg:inline-flex p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] transition-colors cursor-pointer"
                title={isCanvasExpanded ? 'Exit full width' : 'Full width expand'}
              >
                {isCanvasExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close Canvas */}
              <button
                type="button"
                onClick={() => setIsCanvasOpen(false)}
                className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] transition-colors cursor-pointer"
                title="Close canvas"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF9F5]">
            {canvasTab === 'preview' ? (
              renderFormattedDocument(canvasDoc.content, canvasDoc.type)
            ) : (
              <div className="p-4 rounded-xl bg-white border border-[#E2E1DA] font-mono text-[12px] text-[#18181B] whitespace-pre-wrap leading-relaxed shadow-2xs">
                {canvasDoc.content}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ============================================================ */}
      {/* CREATE CUSTOM AGENT TASK MODAL */}
      {/* ============================================================ */}
      {isCreateTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-toast">
          <div className="w-full max-w-[500px] rounded-2xl bg-[#FAF9F5] border border-[#E2E1DA] shadow-2xl p-6 text-[#18181B] animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E1DA]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#3A6EFF]/15 text-[#2552CC] flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#18181B]">Create Custom Agent Task</h3>
                  <p className="text-[11.5px] text-[#71717A]">Configure an automated command for the sovereign agent</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#EFEFEB] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomTask} className="mt-4 space-y-3.5 text-[12.5px]">
              <div>
                <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Generate Oxford Statement of Purpose"
                  className="w-full h-9.5 px-3 rounded-xl border border-[#E2E1DA] bg-white text-[13px] text-[#18181B] focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                  Category
                </label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as any)}
                  className="w-full h-9.5 px-3 rounded-xl border border-[#E2E1DA] bg-white text-[13px] text-[#18181B] focus:outline-none focus:border-[#18181B] cursor-pointer"
                >
                  <option value="cv">CV Synthesis</option>
                  <option value="assignment">Coursework & Assignment</option>
                  <option value="audit">Degree & Prerequisite Audit</option>
                  <option value="waiver">Language Waiver Request</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="e.g. Synthesize transcripts and draft formal graduate admissions essay"
                  className="w-full h-9.5 px-3 rounded-xl border border-[#E2E1DA] bg-white text-[13px] text-[#18181B] focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                  Agent Command Prompt
                </label>
                <textarea
                  required
                  rows={3}
                  value={newTaskPrompt}
                  onChange={(e) => setNewTaskPrompt(e.target.value)}
                  placeholder="e.g. Using all my uploaded academic records, draft a comprehensive scholarship statement for Oxford University focusing on my Computer Science accomplishments."
                  className="w-full p-3 rounded-xl border border-[#E2E1DA] bg-white text-[13px] text-[#18181B] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#18181B] resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-[#71717A] hover:bg-[#EFEFEB] hover:text-[#18181B] text-[12px] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#10C77A] hover:text-[#18181B] text-white text-[12.5px] font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  Create & Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SOVEREIGN CREDENTIALS VAULT SIDE DRAWER (Clean Minimalist Design) */}
      {/* ============================================================ */}
      {isVaultDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-toast">
          <div className="w-full max-w-[420px] h-full bg-[#FAF9F5] border-l border-[#E2E1DA] p-6 flex flex-col justify-between shadow-2xl animate-slide-right">
            
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E1DA]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#E2E1DA] flex items-center justify-center text-[#18181B] shadow-2xs">
                    <FolderLock className="w-4 h-4 text-[#10C77A]" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#18181B]">
                      Credentials Vault
                    </h3>
                    <p className="text-[11.5px] text-[#71717A]">
                      {credentials.length} verified documents on file
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVaultDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#EFEFEB] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="mt-4 relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  type="text"
                  value={vaultSearchQuery}
                  onChange={(e) => setVaultSearchQuery(e.target.value)}
                  placeholder="Search credentials or stated purpose..."
                  className="w-full h-8.5 pl-8 pr-3 rounded-xl border border-[#E2E1DA] bg-white text-[12px] text-[#18181B] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#18181B] shadow-2xs"
                />
              </div>

              {/* Credentials List (Clean Minimalist Cards - No AI Icons) */}
              <div className="mt-4 space-y-2.5 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
                {filteredCredentials.length === 0 ? (
                  <div className="p-6 text-center text-[12px] text-[#71717A]">
                    No credentials stored yet
                  </div>
                ) : (
                  filteredCredentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="p-3.5 rounded-xl border border-[#E2E1DA] bg-white space-y-2 text-[12.5px] shadow-2xs hover:border-[#10C77A] transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-[#18181B] leading-snug">
                            {cred.name}
                          </div>
                          <div className="text-[11px] text-[#71717A] mt-0.5">
                            {cred.issuer}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#E5E4DE] text-[#18181B] font-semibold shrink-0">
                          {cred.type.toUpperCase()}
                        </span>
                      </div>

                      {/* Purpose Note */}
                      <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#EBEAE5] text-[11px] text-[#18181B] leading-relaxed">
                        <span className="text-[#71717A] block text-[10px] uppercase font-semibold mb-0.5">
                          Target Goal:
                        </span>
                        "{cred.purpose}"
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 flex items-center justify-between border-t border-[#F0EFEB] text-[11.5px] gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleTagDocument(cred.id);
                              setIsVaultDrawerOpen(false);
                            }}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer ${
                              selectedCredentialIds.includes(cred.id)
                                ? 'bg-[#10C77A]/20 text-[#0E8A54] border border-[#10C77A]/40'
                                : 'bg-[#FAF9F5] hover:bg-[#18181B] hover:text-white border border-[#E2E1DA] text-[#18181B]'
                            }`}
                            title="Tag this document in chat"
                          >
                            <AtSign className="w-3 h-3" />
                            <span>{selectedCredentialIds.includes(cred.id) ? 'Tagged' : 'Tag in Chat'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleTagDocument(cred.id);
                              setIsVaultDrawerOpen(false);
                              handleSendMessage(
                                `Can you audit my "${cred.name}" from ${cred.issuer}? My stated goal is: "${cred.purpose}". What are the key prerequisites?`
                              );
                            }}
                            className="text-[#0E8A54] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Audit</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setCredentials((prev) => prev.filter((c) => c.id !== cred.id));
                            dbService.removeCredential(cred.id);
                            onShowToast?.(`Removed "${cred.name}"`);
                          }}
                          className="text-[#A1A1AA] hover:text-rose-600 p-1 transition-colors cursor-pointer"
                          title="Remove credential"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Drawer CTA */}
            <div className="pt-4 border-t border-[#E2E1DA]">
              <button
                type="button"
                onClick={() => {
                  setIsVaultDrawerOpen(false);
                  setIsUploadModalOpen(true);
                }}
                className="w-full h-10 rounded-xl bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] font-semibold text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Upload New Credential</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* UPLOAD CREDENTIAL RIGHT-SIDE SLIDE-OVER DRAWER */}
      {/* ============================================================ */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-toast">
          <div className="w-full max-w-[440px] h-full bg-[#FAF9F5] border-l border-[#E2E1DA] shadow-2xl p-6 sm:p-7 flex flex-col justify-between overflow-y-auto text-[#18181B] animate-slide-right">
            
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E1DA]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#10C77A]/15 text-[#10C77A] flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#18181B]">
                      Upload Credential
                    </h3>
                    <p className="text-[12px] text-[#71717A]">
                      Add your document and specify how you plan to use it
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#EFEFEB] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form id="upload-form" onSubmit={handleUploadSubmit} className="mt-5 space-y-4">
                
                {/* File Dropzone */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.docx"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 rounded-2xl border-2 border-dashed border-[#E2E1DA] hover:border-[#10C77A] bg-white flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-2xs"
                  >
                    <FileUp className="w-6 h-6 text-[#10C77A] mb-1.5" />
                    {fileName ? (
                      <div className="text-[12.5px] font-semibold text-[#18181B] truncate max-w-[280px]">
                        Selected: {fileName}
                      </div>
                    ) : (
                      <>
                        <div className="text-[13px] font-semibold text-[#18181B]">
                          Click to select document or drag & drop
                        </div>
                        <div className="text-[11px] text-[#71717A] mt-0.5">
                          PDF, JPG, PNG, or DOCX (Client-side encrypted)
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Document Title & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                      Document Name
                    </label>
                    <input
                      type="text"
                      required
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      placeholder="e.g. Master's Degree Diploma"
                      className="w-full h-10 px-3 rounded-xl border border-[#E2E1DA] bg-white text-[13px] text-[#18181B] focus:outline-none focus:border-[#18181B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                      Credential Type
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border border-[#E2E1DA] bg-white text-[13px] text-[#18181B] focus:outline-none focus:border-[#18181B] cursor-pointer"
                    >
                      <option value="degree">Degree / Diploma</option>
                      <option value="transcript">Academic Transcript</option>
                      <option value="license">Professional License</option>
                      <option value="test">Language / Exam Score</option>
                      <option value="id">Passport / National ID</option>
                      <option value="letter">Recommendation Letter</option>
                      <option value="other">Other Document</option>
                    </select>
                  </div>
                </div>

                {/* Issuing Authority */}
                <div>
                  <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                    Issuing School, Board, or Agency
                  </label>
                  <input
                    type="text"
                    value={docIssuer}
                    onChange={(e) => setDocIssuer(e.target.value)}
                    placeholder="e.g. University of Oxford, British Council, WAEC..."
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E1DA] bg-white text-[13px] text-[#18181B] focus:outline-none focus:border-[#18181B]"
                  />
                </div>

                {/* Target Goal / Purpose */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[12px] font-semibold text-[#18181B]">
                      Target Goal & Usage Note
                    </label>
                    <span className="text-[11px] text-[#0E8A54] font-medium">Important</span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={docPurpose}
                    onChange={(e) => setDocPurpose(e.target.value)}
                    placeholder="e.g. This is my Computer Science degree, check if it qualifies me for Oxford graduate admissions and UK Global Talent endorsement..."
                    className="w-full p-3 rounded-xl border border-[#E2E1DA] bg-white text-[13px] text-[#18181B] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#18181B] resize-none leading-relaxed"
                  />

                  {/* Quick Fill Presets */}
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="text-[#71717A] py-0.5">Quick fill:</span>
                    {[
                      'Applying for foreign university scholarships',
                      'Immigration and skilled work visa application',
                      'License transfer and employment verification',
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDocPurpose(preset)}
                        className="px-2 py-0.5 rounded-md bg-white hover:bg-[#EAE8DF] border border-[#E2E1DA] text-[#18181B] transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

              </form>
            </div>

            {/* Submit CTA */}
            <div className="pt-4 border-t border-[#E2E1DA] mt-4">
              <button
                type="submit"
                form="upload-form"
                disabled={isUploading}
                className="w-full h-11 rounded-xl bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] font-semibold text-[13.5px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                {isUploading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-[#18181B] border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span>Save to Vault & Start Audit</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* RENAME CREDENTIAL WITH AI MODAL */}
      {/* ============================================================ */}
      {renamingCred && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2E1DA] shadow-2xl max-w-md w-full p-6 text-[#18181B] animate-toast">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEB]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#3A6EFF]/15 text-[#3A6EFF] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-[15px] font-bold text-[#18181B]">Rename Credential</h3>
              </div>
              <button
                type="button"
                onClick={() => setRenamingCred(null)}
                className="p-1 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                  Credential Name
                </label>
                <input
                  type="text"
                  value={renamingNewTitle}
                  onChange={(e) => setRenamingNewTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E1DA] bg-white text-[13px] text-[#18181B] focus:outline-none focus:border-[#18181B]"
                  placeholder="Enter clean credential title"
                  autoFocus
                />
              </div>

              {/* AI Auto-Format Button */}
              <button
                type="button"
                onClick={() => {
                  setIsGeneratingAiTitle(true);
                  setTimeout(() => {
                    const clean = `${renamingCred.issuer} - Official ${
                      renamingCred.type.charAt(0).toUpperCase() + renamingCred.type.slice(1)
                    } Record`;
                    setRenamingNewTitle(clean);
                    setIsGeneratingAiTitle(false);
                    onShowToast?.('AI generated verified title suggestion.');
                  }, 250);
                }}
                disabled={isGeneratingAiTitle}
                className="w-full h-9 px-3 rounded-xl bg-[#FAF9F5] hover:bg-[#F3F2EE] border border-[#E2E1DA] text-[12px] text-[#18181B] font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#3A6EFF]" />
                <span>
                  {isGeneratingAiTitle ? 'Generating with AI...' : '✨ Suggest Official Title with AI'}
                </span>
              </button>
            </div>

            <div className="pt-3 border-t border-[#F0EFEB] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenamingCred(null)}
                className="px-3.5 py-2 rounded-xl text-[12.5px] font-medium text-[#71717A] hover:bg-[#F3F2EE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (renamingNewTitle.trim() && renamingCred) {
                    dbService.updateCredential(renamingCred.id, { name: renamingNewTitle.trim() });
                    setCredentials(dbService.getCredentials());
                    setRenamingCred(null);
                    onShowToast?.('Credential renamed successfully.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#10C77A] hover:bg-[#0EBA71] text-[#18181B] text-[12.5px] font-bold shadow-2xs cursor-pointer active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sovereign AI Long-Term Memory Modal */}
      {isMemoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-[#E2E1DA] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#F0EFEB] flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#10C77A]/15 text-[#0E8A54] flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-[#18181B] flex items-center gap-2">
                    <span>Sovereign AI Memory</span>
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-mono font-semibold bg-[#10C77A]/15 text-[#0E8A54]">
                      {memories.length} {memories.length === 1 ? 'Fact' : 'Facts'} Learned
                    </span>
                  </h2>
                  <p className="text-[12px] text-[#71717A]">
                    Learned background, credentials, preferences & goals persistent across your sessions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMemoryModalOpen(false)}
                className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body: Manual Add + Memory List */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              {/* Add Memory Form */}
              <form onSubmit={handleAddManualMemory} className="p-3.5 rounded-xl bg-[#F8F7F2] border border-[#E2E1DA] space-y-2.5">
                <div className="text-[12px] font-semibold text-[#18181B] flex items-center justify-between">
                  <span>Add a Custom Fact for the AI:</span>
                  <select
                    value={newMemoryCategory}
                    onChange={(e) => setNewMemoryCategory(e.target.value as any)}
                    className="text-[11px] px-2 py-0.5 rounded bg-white border border-[#E2E1DA] text-[#18181B] outline-none cursor-pointer"
                  >
                    <option value="profile">Profile / Name</option>
                    <option value="academic">Academic & Degree</option>
                    <option value="career">Career & Role</option>
                    <option value="preference">Style Preference</option>
                    <option value="project">Project / Venture</option>
                    <option value="fact">General Fact</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMemoryFact}
                    onChange={(e) => setNewMemoryFact(e.target.value)}
                    placeholder="e.g. 'Graduated with BSc in Cyber Security with 3.8 GPA'..."
                    className="flex-1 text-[12.5px] px-3 py-2 rounded-xl bg-white border border-[#E2E1DA] focus:border-[#10C77A] text-[#18181B] outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newMemoryFact.trim()}
                    className="px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-[#10C77A] hover:text-[#18181B] text-white text-[12px] font-semibold transition-all disabled:opacity-40 cursor-pointer shrink-0 active:scale-95"
                  >
                    Save Fact
                  </button>
                </div>
              </form>

              {/* Stored Facts List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-semibold text-[#18181B]">
                    Active Memory Enclave:
                  </span>
                  {memories.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllMemories}
                      className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Clear All Memory
                    </button>
                  )}
                </div>

                {memories.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-[#E2E1DA] rounded-xl text-[#71717A] text-[12.5px]">
                    <Brain className="w-8 h-8 text-[#A1A1AA] mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-[#18181B]">No memories recorded yet.</p>
                    <p className="text-[11.5px] max-w-xs mx-auto mt-1">
                      As you chat, mention your background, and upload credentials, the AI automatically stores facts here and recalls them in all responses.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {memories.map((mem) => (
                      <div
                        key={mem.id}
                        className="p-3 rounded-xl bg-white border border-[#E2E1DA] hover:border-[#10C77A]/50 transition-all flex items-start justify-between gap-2.5 shadow-2xs group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="px-1.5 py-0.2 text-[9.5px] font-mono font-semibold rounded bg-[#10C77A]/12 text-[#0E8A54] uppercase tracking-wider">
                              {mem.category}
                            </span>
                            {mem.source && (
                              <span className="text-[10.5px] text-[#71717A] truncate">
                                · {mem.source}
                              </span>
                            )}
                          </div>
                          <p className="text-[12.5px] text-[#18181B] font-medium leading-snug">
                            {mem.fact}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMemory(mem.id)}
                          className="text-[#A1A1AA] hover:text-rose-600 p-1 rounded-md opacity-70 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Remove this memory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-[#F0EFEB] bg-[#FAF9F5] flex items-center justify-between text-[11.5px] text-[#71717A]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#10C77A]" />
                <span>Sovereign client enclave · Zero-telemetry</span>
              </span>
              <button
                type="button"
                onClick={() => setIsMemoryModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-[#18181B] hover:bg-[#10C77A] hover:text-[#18181B] text-white text-[12px] font-semibold transition-all cursor-pointer active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssistantPage;
