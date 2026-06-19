"use client";

// Cross-role messaging — threaded conversations between any two roles.
// Counselor ↔ Client / Business / Vendor. Persisted to localStorage in
// the demo; the shape maps onto a normal Postgres `messages` /
// `message_threads` schema when the backend arrives.

import { recordCaseNoteEvent } from "./case-notes";

export type Role = "counselor" | "client" | "business" | "vendor" | "partner";

export type ThreadTag =
  | "customized-employment"
  | "supported-employment"
  | "accommodation"
  | "general";

export type ThreadContext =
  | { kind: "client-case"; caseId: string; clientName: string }
  | { kind: "business-org"; orgId: string; orgName: string }
  | { kind: "vendor-org"; vendorOrgId: string; vendorOrgName: string }
  | { kind: "partner-org"; partnerOrgId: string; partnerOrgName: string }
  | { kind: "general" };

export interface Participant {
  email: string;
  name: string;
  role: Role;
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: Participant[];
  context: ThreadContext;
  createdAt: string;
  lastMessageAt: string;
  lastMessagePreview: string;
}

export interface Attachment {
  name: string;
  kind: string;            // "pdf" | "image" | "doc" | ...
  size?: number;
}

export interface Message {
  id: string;
  threadId: string;
  fromEmail: string;
  fromName: string;
  fromRole: Role;
  body: string;
  attachments: Attachment[];
  createdAt: string;
  readBy: Record<string, string>; // email -> ISO timestamp
}

const THREADS_KEY = "pathways-pro:message-threads-v1";
const MESSAGES_KEY = "pathways-pro:messages-v1";

function readList<T>(k: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}
function writeList<T>(k: string, list: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(list));
}

export function loadThreads(): MessageThread[] {
  return readList<MessageThread>(THREADS_KEY);
}
export function loadMessages(threadId: string): Message[] {
  return readList<Message>(MESSAGES_KEY)
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

export function threadsForUser(email: string): MessageThread[] {
  return loadThreads()
    .filter((t) => t.participants.some((p) => p.email === email))
    .sort((a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt));
}

export function getThread(id: string): MessageThread | null {
  return loadThreads().find((t) => t.id === id) ?? null;
}

export function createThread(
  subject: string,
  participants: Participant[],
  context: ThreadContext,
): MessageThread {
  const t: MessageThread = {
    id: "thread-" + Math.random().toString(36).slice(2, 10),
    subject,
    participants,
    context,
    createdAt: new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
    lastMessagePreview: "",
  };
  writeList(THREADS_KEY, [t, ...loadThreads()]);
  return t;
}

// Find or create a 1:1 thread scoped to a context. Counselor messages
// with a client get one persistent thread per case; same for business
// orgs and vendor orgs.
export function getOrCreateContextThread(
  subject: string,
  participants: Participant[],
  context: ThreadContext,
): MessageThread {
  if (context.kind === "general") return createThread(subject, participants, context);
  const all = loadThreads();
  const existing = all.find((t) => {
    if (t.context.kind !== context.kind) return false;
    if (context.kind === "client-case" && t.context.kind === "client-case")
      return t.context.caseId === context.caseId;
    if (context.kind === "business-org" && t.context.kind === "business-org")
      return t.context.orgId === context.orgId;
    if (context.kind === "vendor-org" && t.context.kind === "vendor-org")
      return t.context.vendorOrgId === context.vendorOrgId;
    return false;
  });
  if (existing) return existing;
  return createThread(subject, participants, context);
}

export function sendMessage(
  threadId: string,
  from: Participant,
  body: string,
  attachments: Attachment[] = [],
): Message | null {
  const thread = getThread(threadId);
  if (!thread) return null;
  const msg: Message = {
    id: "msg-" + Math.random().toString(36).slice(2, 10),
    threadId,
    fromEmail: from.email,
    fromName: from.name,
    fromRole: from.role,
    body,
    attachments,
    createdAt: new Date().toISOString(),
    readBy: { [from.email]: new Date().toISOString() },
  };
  writeList(MESSAGES_KEY, [...readList<Message>(MESSAGES_KEY), msg]);

  // Bump thread's lastMessageAt + preview
  const threads = loadThreads().map((t) =>
    t.id === threadId
      ? {
          ...t,
          lastMessageAt: msg.createdAt,
          lastMessagePreview: body.slice(0, 100),
        }
      : t,
  );
  writeList(THREADS_KEY, threads);

  // Auto-generate a case note when a client sends a message — this is
  // explicit in the user's spec.
  if (from.role === "client" && thread.context.kind === "client-case") {
    recordCaseNoteEvent({
      kind: "resume-generated",      // closest existing client-event;
      participantType: "individual-client",
      caseId: thread.context.caseId,
      clientName: from.name,
      targetJob: `Message: "${body.slice(0, 40)}…"`,
    });
  }

  return msg;
}

export function markThreadRead(threadId: string, email: string) {
  const msgs = readList<Message>(MESSAGES_KEY).map((m) =>
    m.threadId === threadId
      ? {
          ...m,
          readBy: { ...m.readBy, [email]: new Date().toISOString() },
        }
      : m,
  );
  writeList(MESSAGES_KEY, msgs);
}

export function unreadCount(email: string): number {
  return readList<Message>(MESSAGES_KEY).filter(
    (m) => m.fromEmail !== email && !m.readBy[email],
  ).length;
}

export function unreadCountInThread(threadId: string, email: string): number {
  return readList<Message>(MESSAGES_KEY).filter(
    (m) => m.threadId === threadId && m.fromEmail !== email && !m.readBy[email],
  ).length;
}
