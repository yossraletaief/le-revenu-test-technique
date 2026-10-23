/**
 * Renders user text safely: paragraphs on blank lines, line breaks kept with whitespace-pre-line.
 * No HTML is ever interpreted (React escapes text), so no dangerouslySetInnerHTML.
 */
export function Prose({ text, className = '' }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={`max-w-[68ch] space-y-[0.8em] leading-relaxed [overflow-wrap:anywhere] ${className}`}>
      {paragraphs.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
    </div>
  );
}
