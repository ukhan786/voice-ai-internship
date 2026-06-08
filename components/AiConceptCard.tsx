function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((p, i) => (
        <p key={i} className="mt-2 text-sm leading-relaxed text-steel-300 first:mt-0">
          {p}
        </p>
      ))}
    </>
  );
}

export default function AiConceptCard({
  title,
  body,
  keyTerm,
  keyTermDef,
  resourceLabel,
  resourceUrl,
}: {
  title: string;
  body: string;
  keyTerm: string;
  keyTermDef: string;
  resourceLabel: string;
  resourceUrl: string;
}) {
  if (!title && !body) return null;
  return (
    <div className="card card-pad border-gold/30 bg-gradient-to-br from-gold/[0.06] to-transparent">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-sm">
          🧠
        </span>
        <span className="label text-gold">AI Concept of the Week</span>
      </div>
      <h3 className="text-base font-semibold text-steel-50">{title}</h3>
      <div className="mt-2">
        <Paragraphs text={body} />
      </div>

      {keyTerm && (
        <div className="mt-4 rounded-lg border border-ink-line bg-ink/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">📖</span>
            <span className="label">Key term</span>
          </div>
          <p className="mt-1 text-sm text-steel-100">
            <span className="font-semibold text-gold-soft">{keyTerm}</span>
            <span className="text-steel-300"> — {keyTermDef}</span>
          </p>
        </div>
      )}

      {resourceUrl && (
        <a
          href={resourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-soft"
        >
          ↗ Go deeper: {resourceLabel}
        </a>
      )}
    </div>
  );
}
