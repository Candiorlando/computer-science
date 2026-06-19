"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { loadSession } from "@/lib/session";
import type { AnyUser } from "@/lib/users";
import {
  getOrCreateContextThread,
  getThread,
  loadMessages,
  markThreadRead,
  sendMessage,
  threadsForUser,
  unreadCountInThread,
  type Message,
  type MessageThread,
  type Participant,
  type Role,
} from "@/lib/messages";
import { CLIENTS, COUNSELORS, getAllBusinessUsers, getAllVendorUsers } from "@/lib/users";

export default function MessagesPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const search = useSearchParams();
  const [user, setUser] = useState<AnyUser | null>(null);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(search.get("thread"));
  const [showNew, setShowNew] = useState(false);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    setUser(s);
    const list = threadsForUser(s.email);
    setThreads(list);
    if (!activeId && list.length > 0) setActiveId(list[0].id);
  }, [router, bump, activeId]);

  if (!user) return null;

  const active = activeId ? getThread(activeId) : null;

  return (
    <div className="space-y-5">
      <header className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
            Messages
          </p>
          <h1 className="text-3xl font-semibold">Conversations</h1>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="grad-tealblue text-white px-4 py-2 rounded-md font-semibold text-sm"
        >
          + New conversation
        </button>
      </header>

      <div className="grid md:grid-cols-[320px_1fr] gap-4 min-h-[60vh]">
        <ThreadList
          threads={threads}
          user={user}
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id);
            markThreadRead(id, user.email);
            setBump((n) => n + 1);
          }}
        />
        {active ? (
          <ThreadView
            thread={active}
            user={user}
            onSend={() => setBump((n) => n + 1)}
          />
        ) : (
          <div className="saas-card grid place-items-center text-ink/55 text-sm">
            Pick a conversation to read it, or start a new one.
          </div>
        )}
      </div>

      {showNew && (
        <NewThreadModal
          user={user}
          onClose={() => setShowNew(false)}
          onCreated={(t) => {
            setActiveId(t.id);
            setShowNew(false);
            setBump((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}

// ───────────── Thread list ─────────────

function ThreadList({
  threads,
  user,
  activeId,
  onSelect,
}: {
  threads: MessageThread[];
  user: AnyUser;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <aside
      aria-label="Conversation list"
      className="saas-card overflow-y-auto max-h-[70vh]"
    >
      {threads.length === 0 ? (
        <p className="text-sm text-ink/55 italic">
          No conversations yet. Start one with the &ldquo;+ New&rdquo; button.
        </p>
      ) : (
        <ul role="list" className="space-y-1">
          {threads.map((t) => {
            const counterpart = t.participants.find((p) => p.email !== user.email);
            const unread = unreadCountInThread(t.id, user.email);
            const isActive = t.id === activeId;
            return (
              <li key={t.id}>
                <button
                  onClick={() => onSelect(t.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`w-full text-left rounded-md p-3 transition ${
                    isActive
                      ? "grad-tealblue text-white"
                      : "hover:bg-ink/5"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-sm">
                      {counterpart?.name ?? t.subject}
                    </span>
                    {unread > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive ? "bg-white/25 text-white" : "bg-cyan-500 text-white"
                        }`}
                      >
                        {unread}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-xs mt-0.5 truncate ${
                      isActive ? "text-white/80" : "text-ink/65"
                    }`}
                  >
                    {t.subject}
                  </div>
                  <div
                    className={`text-xs mt-1 truncate ${
                      isActive ? "text-white/75" : "text-ink/55"
                    }`}
                  >
                    {t.lastMessagePreview || "(no messages yet)"}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

// ───────────── Thread view ─────────────

function ThreadView({
  thread,
  user,
  onSend,
}: {
  thread: MessageThread;
  user: AnyUser;
  onSend: () => void;
}) {
  const [body, setBody] = useState("");
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [bump, setBump] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(() => loadMessages(thread.id), [thread.id, bump]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages.length]);

  function send() {
    if (!body.trim() && attachmentNames.length === 0) return;
    const from: Participant = {
      email: user.email,
      name: user.name,
      role: user.role,
    };
    sendMessage(
      thread.id,
      from,
      body.trim(),
      attachmentNames.map((n) => ({ name: n, kind: extOf(n) })),
    );
    setBody("");
    setAttachmentNames([]);
    setBump((n) => n + 1);
    onSend();
  }

  const counterparts = thread.participants.filter((p) => p.email !== user.email);

  return (
    <section
      aria-label="Conversation"
      className="saas-card flex flex-col max-h-[70vh]"
    >
      <header className="border-b border-ink/10 pb-3 mb-3">
        <h2 className="text-lg font-semibold">{thread.subject}</h2>
        <p className="text-xs text-ink/60">
          With{" "}
          {counterparts
            .map((p) => `${p.name} (${roleLabel(p.role)})`)
            .join(" · ")}
        </p>
        {thread.context.kind !== "general" && (
          <p className="text-xs text-ink/55 mt-0.5">
            Context: {contextLabel(thread.context)}
          </p>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 ? (
          <p className="text-sm text-ink/55 italic text-center py-8">
            No messages yet. Be the first to write.
          </p>
        ) : (
          messages.map((m) => (
            <Bubble key={m.id} message={m} isMine={m.fromEmail === user.email} />
          ))
        )}
      </div>

      <footer className="border-t border-ink/10 pt-3 mt-3 space-y-2">
        {attachmentNames.length > 0 && (
          <ul className="flex flex-wrap gap-2 text-xs">
            {attachmentNames.map((n, i) => (
              <li
                key={i}
                className="bg-cyan-100 text-cyan-900 px-2 py-1 rounded-full"
              >
                📎 {n}
                <button
                  onClick={() =>
                    setAttachmentNames((p) => p.filter((_, j) => j !== i))
                  }
                  className="ml-2 text-cyan-900/65 hover:text-cyan-900"
                  aria-label={`Remove ${n}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) send();
            }}
            placeholder="Write a message… (⌘+Enter to send)"
            className="flex-1 bg-white border border-ink/15 rounded-md px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 min-h-[60px]"
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                const n = window.prompt("Attachment file name (demo)");
                if (n) setAttachmentNames((p) => [...p, n.trim()]);
              }}
              className="text-xs border border-ink/15 px-3 py-1.5 rounded-md hover:bg-ink/5"
            >
              📎 Attach
            </button>
            <button
              onClick={send}
              className="grad-tealblue text-white px-4 py-2 rounded-md font-semibold text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}

function Bubble({ message, isMine }: { message: Message; isMine: boolean }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
          isMine
            ? "grad-tealblue text-white rounded-tr-sm"
            : "bg-cream border border-ink/10 text-ink rounded-tl-sm"
        }`}
      >
        {!isMine && (
          <div className="text-[11px] font-semibold opacity-80 mb-0.5">
            {message.fromName} · {roleLabel(message.fromRole)}
          </div>
        )}
        <div className="whitespace-pre-wrap leading-snug">{message.body}</div>
        {message.attachments.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {message.attachments.map((a, i) => (
              <li key={i} className="text-xs underline">
                📎 {a.name}
              </li>
            ))}
          </ul>
        )}
        <div
          className={`text-[10px] mt-1 ${isMine ? "text-white/70" : "text-ink/55"}`}
        >
          {new Date(message.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

// ───────────── New thread modal ─────────────

function NewThreadModal({
  user,
  onClose,
  onCreated,
}: {
  user: AnyUser;
  onClose: () => void;
  onCreated: (t: MessageThread) => void;
}) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [opening, setOpening] = useState("");

  const candidates = useMemo(() => candidateRecipients(user), [user]);

  function start() {
    if (!recipientEmail || !subject.trim()) return;
    const recipient = candidates.find((c) => c.email === recipientEmail);
    if (!recipient) return;
    const context = contextFor(user, recipient);
    const t = getOrCreateContextThread(
      subject.trim(),
      [
        { email: user.email, name: user.name, role: user.role },
        recipient,
      ],
      context,
    );
    if (opening.trim()) {
      sendMessage(
        t.id,
        { email: user.email, name: user.name, role: user.role },
        opening.trim(),
      );
    }
    onCreated(t);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-ink/40 grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-lg shadow-lg max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">Start a new conversation</h3>
        <Field label="To">
          <select
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="input"
          >
            <option value="">— Pick a recipient —</option>
            {candidates.map((c) => (
              <option key={c.email} value={c.email}>
                {c.name} · {roleLabel(c.role)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Subject">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input"
            placeholder="e.g., Question about my IPE plan"
          />
        </Field>
        <Field label="Opening message (optional)">
          <textarea
            value={opening}
            onChange={(e) => setOpening(e.target.value)}
            className="input min-h-[80px]"
          />
        </Field>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="border border-ink/15 px-4 py-1.5 rounded-md text-sm"
          >
            Cancel
          </button>
          <button
            onClick={start}
            className="grad-tealblue text-white px-4 py-1.5 rounded-md font-semibold text-sm"
          >
            Start →
          </button>
        </div>
        <style jsx>{`
          :global(.input) {
            width: 100%;
            background: white;
            border: 1px solid rgba(31, 29, 26, 0.15);
            border-radius: 8px;
            padding: 0.5rem 0.75rem;
            font-size: 0.9rem;
          }
          :global(.input:focus-visible) {
            outline: 2px solid #06b6d4;
            outline-offset: -1px;
          }
        `}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

// ───────────── Helpers ─────────────

function candidateRecipients(user: AnyUser): Participant[] {
  if (user.role === "counselor") {
    const out: Participant[] = [];
    if ("clientKeys" in user) {
      for (const k of user.clientKeys) {
        const c = CLIENTS[k];
        if (c) out.push({ email: c.email, name: c.name, role: "client" });
      }
    }
    // also add all business + vendor users for messaging
    for (const b of Object.values(getAllBusinessUsers()))
      out.push({ email: b.email, name: b.name, role: "business" });
    for (const v of Object.values(getAllVendorUsers()))
      out.push({ email: v.email, name: v.name, role: "vendor" });
    return out;
  }
  if (user.role === "client") {
    const c = (Object.values(CLIENTS) as { email: string; counselorEmail: string }[])
      .find((cl) => cl.email === user.email);
    const counselor = c
      ? Object.values(COUNSELORS).find((co) => co.email === c.counselorEmail)
      : null;
    return counselor
      ? [{ email: counselor.email, name: counselor.name, role: "counselor" }]
      : [];
  }
  // business + vendor → counselors
  return Object.values(COUNSELORS).map((co) => ({
    email: co.email,
    name: co.name,
    role: "counselor" as const,
  }));
}

function contextFor(user: AnyUser, recipient: Participant) {
  if (user.role === "client" && "caseId" in user)
    return {
      kind: "client-case" as const,
      caseId: user.caseId,
      clientName: user.name,
    };
  if (user.role === "counselor" && recipient.role === "client") {
    const client = Object.values(CLIENTS).find((c) => c.email === recipient.email);
    if (client)
      return {
        kind: "client-case" as const,
        caseId: client.caseId,
        clientName: client.name,
      };
  }
  if (user.role === "business" && "orgId" in user)
    return {
      kind: "business-org" as const,
      orgId: user.orgId,
      orgName: user.orgName,
    };
  if (user.role === "counselor" && recipient.role === "business") {
    const b = Object.values(getAllBusinessUsers()).find(
      (x) => x.email === recipient.email,
    );
    if (b)
      return {
        kind: "business-org" as const,
        orgId: b.orgId,
        orgName: b.orgName,
      };
  }
  if (user.role === "vendor" && "vendorOrgId" in user)
    return {
      kind: "vendor-org" as const,
      vendorOrgId: user.vendorOrgId,
      vendorOrgName: user.vendorOrgName,
    };
  if (user.role === "counselor" && recipient.role === "vendor") {
    const v = Object.values(getAllVendorUsers()).find(
      (x) => x.email === recipient.email,
    );
    if (v)
      return {
        kind: "vendor-org" as const,
        vendorOrgId: v.vendorOrgId,
        vendorOrgName: v.vendorOrgName,
      };
  }
  return { kind: "general" as const };
}

function roleLabel(r: Role): string {
  return {
    counselor: "Counselor",
    client: "Client",
    business: "Business",
    vendor: "Vendor",
  }[r];
}
function contextLabel(c: MessageThread["context"]): string {
  if (c.kind === "client-case") return `Case ${c.caseId} — ${c.clientName}`;
  if (c.kind === "business-org") return c.orgName;
  if (c.kind === "vendor-org") return c.vendorOrgName;
  return "General";
}
function extOf(name: string): string {
  const m = name.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "file";
}
