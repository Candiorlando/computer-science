"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadProfile, type UserProfile } from "@/lib/storage";
import { rankOccupations } from "@/lib/onet-data";
import { Disclaimer } from "@/components/Disclaimer";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function CoachPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [shareProfile, setShareProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setProfile(loadProfile()), []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  if (!profile) return <p>Loading…</p>;

  const hasAssessment = !!profile.riasec && !!profile.bigFive;

  async function send() {
    if (!input.trim() || streaming) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setError(null);

    // Build the profile payload — empty if user opted out of sharing.
    const profileToSend: UserProfile = shareProfile ? profile! : {};
    const topMatches = shareProfile && profile?.riasec
      ? rankOccupations(profile.riasec).slice(0, 5).map((m) => m.occ.title)
      : [];

    try {
      const resp = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: profileToSend,
          messages: next,
          topMatches,
        }),
      });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({ error: "Request failed" }));
        setError(errBody.error ?? "Request failed");
        setStreaming(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No response stream");
      const decoder = new TextDecoder();
      let assistant = "";
      setMessages((cur) => [...cur, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistant += decoder.decode(value, { stream: true });
        setMessages((cur) => {
          const copy = [...cur];
          copy[copy.length - 1] = { role: "assistant", content: assistant };
          return copy;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setStreaming(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl mb-1">Career coach</h1>
        <p className="text-ink/70 text-sm">
          Ask about specific occupations, applications, training, accommodations, or
          anything else career-related.
        </p>
      </div>

      <Disclaimer kind="coach" />

      {!hasAssessment && (
        <div className="border border-amber-700/40 bg-amber-50 text-amber-900 rounded p-4 text-sm">
          You haven't completed the assessments yet. The coach will work, but advice
          will be less tailored.
          <Link href="/assessment" className="underline ml-1">Take the assessments →</Link>
        </div>
      )}

      <div className="flex items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={shareProfile}
            onChange={(e) => setShareProfile(e.target.checked)}
          />
          Share my profile with the coach this session
        </label>
        <span className="text-ink/40">|</span>
        <Link href="/intake" className="text-accent underline">Update profile</Link>
      </div>

      <div className="border border-ink/15 rounded-lg bg-white/60 min-h-[400px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[60vh]">
          {messages.length === 0 && (
            <div className="text-ink/50 text-sm">
              Try: <em>"Walk me through what it takes to become an electrician in my state."</em><br/>
              Or: <em>"My top match is medical assistant — what's a realistic timeline if I'm starting from a high-school diploma?"</em><br/>
              Or: <em>"I have a chronic illness — how do I think about disclosing during applications?"</em>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : ""}>
              <div
                className={`inline-block max-w-[85%] text-left whitespace-pre-wrap rounded-lg px-4 py-2.5 ${
                  m.role === "user"
                    ? "bg-accent text-white"
                    : "bg-cream border border-ink/10"
                }`}
              >
                {m.content || (streaming ? "…" : "")}
              </div>
            </div>
          ))}
          {error && (
            <div className="text-red-700 text-sm border border-red-300 bg-red-50 rounded p-3">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-ink/10 p-3 flex gap-2">
          <textarea
            className="flex-1 resize-none border border-ink/20 rounded px-3 py-2 min-h-[44px] max-h-[160px] bg-white"
            value={input}
            placeholder="Ask the coach…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={streaming}
            rows={1}
          />
          <button
            onClick={send}
            disabled={streaming || !input.trim()}
            className="px-4 py-2 bg-accent text-white rounded disabled:opacity-50"
          >
            {streaming ? "…" : "Send"}
          </button>
        </div>
      </div>

      <div className="text-xs text-ink/50 prose-narrow pt-2">
        <strong>Privacy:</strong> Your conversation is sent to Anthropic's Claude API
        to generate replies. It is not stored on our servers. Don't paste anything
        you wouldn't want a model provider to process — for example, your Social
        Security number, full medical records, or anyone else's confidential information.
      </div>
    </div>
  );
}
