// sehat-ai-admin/src/components/chat/ChatPanel.tsx
// ─── Real-time Doctor–Patient Chat Panel ─────────────────────────────────────
// Connects to Socket.IO, loads history, and streams messages live.

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  X,
  Send,
  MessageSquare,
  Loader2,
  Paperclip,
  CheckCheck,
} from "lucide-react";
import api from "../../lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  appointmentId: string;
  senderId: number;
  senderRole: "patient" | "doctor";
  senderName: string;
  message: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  isRead: boolean;
  createdAt: string;
}

interface Appointment {
  id: string;
  patient?: { fullName?: string };
  timeSlot?: string;
  appointmentDate?: string;
  reason?: string;
}

interface ChatPanelProps {
  appointment: Appointment;
  doctorDbId: number;
  doctorName: string;
  onClose: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const SOCKET_URL = (() => {
  // Strip /api suffix from the API base URL to get the socket root
  const base = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";
  return base.replace(/\/api\/?$/, "");
})();

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupByDate(messages: ChatMessage[]) {
  const groups: { date: string; messages: ChatMessage[] }[] = [];
  let lastDate = "";
  for (const msg of messages) {
    const date = new Date(msg.createdAt).toDateString();
    if (date !== lastDate) {
      groups.push({ date: formatDate(msg.createdAt), messages: [msg] });
      lastDate = date;
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }
  return groups;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const ChatPanel = ({
  appointment,
  doctorDbId,
  doctorName,
  onClose,
}: ChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [connected, setConnected] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const patientName = appointment.patient?.fullName || "Patient";

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser, scrollToBottom]);

  // ── Load REST history first, then open socket ───────────────────────────────
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // 1. Load history via REST (fastest first paint)
      try {
        const res = await api.get(`/chat/${appointment.id}/history`);
        if (mounted) {
          setMessages(res.data.messages || []);
          setLoadingHistory(false);
        }
      } catch {
        if (mounted) setLoadingHistory(false);
      }

      // 2. Connect socket
      const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
      socketRef.current = socket;

      socket.on("connect", () => {
        if (!mounted) return;
        setConnected(true);
        socket.emit("JOIN_CHAT_ROOM", {
          appointmentId: appointment.id,
          userId: doctorDbId,
          role: "doctor",
          name: doctorName,
        });
      });

      socket.on("disconnect", () => {
        if (mounted) setConnected(false);
      });

      // Socket history overrides REST (more authoritative / latest)
      socket.on("CHAT_HISTORY", ({ messages: history }: { messages: ChatMessage[] }) => {
        if (mounted) setMessages(history || []);
      });

      // Real-time incoming messages
      socket.on("NEW_MESSAGE", (msg: ChatMessage) => {
        if (!mounted) return;
        setMessages((prev) => {
          // Prevent duplicates (socket may echo our own SEND_MESSAGE)
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTypingUser(null);
      });

      socket.on("TYPING_INDICATOR", ({ senderName }: { senderName: string }) => {
        if (mounted) setTypingUser(senderName);
      });

      socket.on("STOP_TYPING_INDICATOR", () => {
        if (mounted) setTypingUser(null);
      });

      socket.on("CHAT_ERROR", ({ error }: { error: string }) => {
        console.error("Chat error:", error);
      });
    };

    init();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.emit("LEAVE_CHAT_ROOM", { appointmentId: appointment.id });
        socketRef.current.disconnect();
      }
    };
  }, [appointment.id, doctorDbId, doctorName]);

  // ── Mark messages as read when panel opens ──────────────────────────────────
  useEffect(() => {
    if (!loadingHistory) {
      api.post(`/chat/${appointment.id}/read`).catch(() => {});
    }
  }, [loadingHistory, appointment.id]);

  // ── Typing indicator ────────────────────────────────────────────────────────
  const handleTyping = () => {
    if (!socketRef.current) return;
    socketRef.current.emit("TYPING", {
      appointmentId: appointment.id,
      senderName: doctorName,
    });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit("STOP_TYPING", { appointmentId: appointment.id });
    }, 2000);
  };

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || !socketRef.current || !connected) return;

    setSending(true);
    socketRef.current.emit("SEND_MESSAGE", {
      appointmentId: appointment.id,
      senderId: doctorDbId,
      senderRole: "doctor",
      senderName: doctorName,
      message: text,
    });

    setInputText("");
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    socketRef.current.emit("STOP_TYPING", { appointmentId: appointment.id });

    // Clear sending state after short delay (server will echo back via NEW_MESSAGE)
    setTimeout(() => setSending(false), 300);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const grouped = groupByDate(messages);
  const patientInitials = patientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-gradient-to-r from-[#199A8E] to-[#15857a]">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-white/20 text-white font-bold flex items-center justify-center text-sm flex-shrink-0 ring-2 ring-white/30">
            {patientInitials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{patientName}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-300" : "bg-white/40"}`}
              />
              <span className="text-xs text-white/80">
                {connected ? "Connected · Live" : "Connecting…"}
              </span>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
            title="Close chat"
          >
            <X size={16} />
          </button>
        </div>

        {/* Appointment meta strip */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
          <span className="font-medium text-slate-700 truncate">
            {appointment.reason || "General Consultation"}
          </span>
          {appointment.appointmentDate && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{appointment.appointmentDate}</span>
            </>
          )}
          {appointment.timeSlot && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{appointment.timeSlot}</span>
            </>
          )}
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#F8FAFC]">
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <Loader2 size={28} className="animate-spin text-[#199A8E]" />
              <p className="text-sm">Loading conversation…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-[#199A8E]/10 flex items-center justify-center">
                <MessageSquare size={24} className="text-[#199A8E]" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No messages yet</p>
              <p className="text-xs text-slate-400">
                Start the conversation. Messages sent by the patient from the mobile app will appear here in real time.
              </p>
            </div>
          ) : (
            grouped.map(({ date, messages: dayMsgs }) => (
              <div key={date} className="space-y-2">
                {/* Date separator */}
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] font-semibold text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full">
                    {date}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {dayMsgs.map((msg) => {
                  const isDoctor = msg.senderRole === "doctor";
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isDoctor ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar (patient only) */}
                      {!isDoctor && (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#483D8B] to-[#5B4FB5] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mb-1">
                          {patientInitials}
                        </div>
                      )}

                      <div className={`max-w-[75%] ${isDoctor ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        {/* Bubble */}
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            isDoctor
                              ? "bg-[#199A8E] text-white rounded-br-sm"
                              : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"
                          }`}
                        >
                          {msg.message && <p>{msg.message}</p>}

                          {/* Attachment */}
                          {msg.attachmentUrl && (
                            <a
                              href={msg.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 mt-1.5 text-xs font-medium underline underline-offset-2 ${
                                isDoctor ? "text-white/80" : "text-[#199A8E]"
                              }`}
                            >
                              <Paperclip size={11} />
                              {msg.attachmentName || "View attachment"}
                            </a>
                          )}
                        </div>

                        {/* Time + read status */}
                        <div
                          className={`flex items-center gap-1 text-[10px] text-slate-400 ${
                            isDoctor ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span>{formatTime(msg.createdAt)}</span>
                          {isDoctor && (
                            <CheckCheck
                              size={12}
                              className={msg.isRead ? "text-[#199A8E]" : "text-slate-300"}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          {/* Typing indicator */}
          {typingUser && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#483D8B] to-[#5B4FB5] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {patientInitials}
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ── */}
        <div className="px-4 py-3 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder={connected ? "Type a message…" : "Connecting…"}
              disabled={!connected || sending}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#199A8E]/20 focus:border-[#199A8E] outline-none transition-all placeholder:text-slate-400 disabled:opacity-50"
              autoFocus
            />

            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || !connected || sending}
              className="p-2.5 bg-[#199A8E] text-white rounded-xl hover:bg-[#15857a] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-sm shadow-[#199A8E]/30"
              title="Send message"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 mt-1.5 text-center">
            Messages are delivered to the patient's mobile app in real time
          </p>
        </div>
      </div>
    </>
  );
};
