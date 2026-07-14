"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  // Suggested typed signature (the counselor's name). Pre-fills the
  // "Type" mode input when no saved signature is loaded.
  suggestedName: string;
  // The credentials line shown under the printed name (e.g., "CRC · LPC").
  credentials?: string;
  // If the counselor previously saved a signature on their profile,
  // pass it in so they can re-use it instead of redrawing.
  savedDataUrl?: string;
  savedText?: string;
  onSave: (sig: SignatureValue) => void;
  onCancel?: () => void;
}

export interface SignatureValue {
  dataUrl?: string; // Drawn signature, base64 PNG
  text?: string;    // Typed cursive signature
  printedName: string;
  credentials?: string;
  rememberOnProfile: boolean;
}

type Mode = "type" | "draw";

export function SignaturePad({
  suggestedName,
  credentials,
  savedDataUrl,
  savedText,
  onSave,
  onCancel,
}: Props) {
  const [mode, setMode] = useState<Mode>(savedDataUrl ? "draw" : "type");
  const [typedText, setTypedText] = useState(savedText ?? suggestedName);
  const [remember, setRemember] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(Boolean(savedDataUrl));

  // Initialize the canvas: load any saved signature on first paint.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (savedDataUrl) {
      const img = new window.Image();
      img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height);
      img.src = savedDataUrl;
    }
  }, [savedDataUrl, mode]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * e.currentTarget.width) / r.width,
      y: ((e.clientY - r.top) * e.currentTarget.height) / r.height,
    };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastRef.current = pos(e);
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    const last = lastRef.current ?? p;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
    setHasInk(true);
  }
  function end() {
    drawingRef.current = false;
    lastRef.current = null;
  }

  function clearCanvas() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    setHasInk(false);
  }

  function handleSave() {
    if (mode === "type") {
      if (!typedText.trim()) return;
      onSave({
        text: typedText.trim(),
        printedName: suggestedName,
        credentials,
        rememberOnProfile: remember,
      });
      return;
    }
    const c = canvasRef.current;
    if (!c || !hasInk) return;
    onSave({
      dataUrl: c.toDataURL("image/png"),
      printedName: suggestedName,
      credentials,
      rememberOnProfile: remember,
    });
  }

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Signature input mode"
        className="flex gap-2"
      >
        <button
          role="tab"
          aria-selected={mode === "type"}
          onClick={() => setMode("type")}
          className={`text-sm px-3 py-1.5 rounded-md font-semibold ${mode === "type" ? "grad-tealblue text-white" : "border border-ink/15 hover:bg-ink/5"}`}
        >
          ✍️ Type signature
        </button>
        <button
          role="tab"
          aria-selected={mode === "draw"}
          onClick={() => setMode("draw")}
          className={`text-sm px-3 py-1.5 rounded-md font-semibold ${mode === "draw" ? "grad-tealblue text-white" : "border border-ink/15 hover:bg-ink/5"}`}
        >
          🖊️ Draw signature
        </button>
      </div>

      {mode === "type" ? (
        <div>
          <label className="block text-xs font-semibold text-ink/65 uppercase tracking-wider mb-2">
            Type your full legal name
          </label>
          <input
            type="text"
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            className="w-full bg-white border border-ink/15 rounded-md px-3 py-2 text-sm"
            placeholder={suggestedName}
            autoComplete="off"
          />
          <div className="mt-3 bg-white border border-ink/15 rounded-md p-6">
            <div className="text-[10px] uppercase tracking-wider text-ink/55 mb-2">
              Preview
            </div>
            <div
              className="signature-cursive text-3xl text-ink"
              aria-label="Cursive signature preview"
            >
              {typedText || suggestedName}
            </div>
            <div className="mt-2 border-t border-ink/25 pt-2">
              <div className="text-sm font-semibold">{suggestedName}</div>
              {credentials && (
                <div className="text-xs text-ink/65">{credentials}</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-ink/65 uppercase tracking-wider mb-2">
            Draw your signature inside the box
          </label>
          <div className="bg-white border border-ink/15 rounded-md p-3 inline-block">
            <canvas
              ref={canvasRef}
              width={500}
              height={160}
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerLeave={end}
              className="border border-dashed border-ink/25 rounded touch-none cursor-crosshair block max-w-full"
              aria-label="Signature drawing area"
            />
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-xs text-ink/55">
                Use mouse, trackpad, or touch to sign
              </span>
              <button
                onClick={clearCanvas}
                className="text-xs text-ink/65 hover:text-ink underline"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs text-ink/65">
            Printed under signature:{" "}
            <strong>{suggestedName}</strong>
            {credentials && `, ${credentials}`}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="rounded"
        />
        <span>Save this signature on my profile for future deliverables</span>
      </label>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={mode === "type" ? !typedText.trim() : !hasInk}
          className="grad-tealblue text-white font-semibold px-5 py-2 rounded-md text-sm disabled:opacity-50"
        >
          ✓ Apply signature
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-ink/65 px-4 py-2 hover:text-ink"
          >
            Cancel
          </button>
        )}
      </div>

      <style jsx global>{`
        .signature-cursive {
          font-family: "Brush Script MT", "Lucida Handwriting", "Segoe Script",
            "Comic Sans MS", cursive;
          font-style: italic;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
}

// Renders an already-saved signature inside a deliverable footer.
// Use this anywhere we need to show the counselor's signature read-only.
export function SignatureBlock({
  dataUrl,
  text,
  printedName,
  credentials,
  signedAt,
}: {
  dataUrl?: string;
  text?: string;
  printedName: string;
  credentials?: string;
  signedAt?: string;
}) {
  const hasSig = Boolean(dataUrl || text);
  return (
    <div className="mt-6 pt-3 border-t border-ink/15 text-sm">
      <div className="text-[10px] uppercase tracking-wider text-ink/55 mb-1">
        Counselor signature
      </div>
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          alt={`Signature of ${printedName}`}
          className="h-16 object-contain"
        />
      ) : text ? (
        <div className="signature-cursive text-3xl text-ink py-1">{text}</div>
      ) : (
        <div className="h-12 border-b border-ink/40 w-64" aria-hidden />
      )}
      <div className="mt-1">
        <div className="font-semibold">{printedName}</div>
        {credentials && (
          <div className="text-xs text-ink/65">{credentials}</div>
        )}
        {hasSig && signedAt && (
          <div className="text-xs text-ink/55 mt-0.5">
            Signed {new Date(signedAt).toLocaleString()}
          </div>
        )}
      </div>
      <style jsx global>{`
        .signature-cursive {
          font-family: "Brush Script MT", "Lucida Handwriting", "Segoe Script",
            "Comic Sans MS", cursive;
          font-style: italic;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
}
