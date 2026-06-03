export default function ConceptPrimer({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="card card-pad border-accent/30 bg-gradient-to-br from-accent/[0.06] to-transparent">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-sm">
          💡
        </span>
        <span className="label text-accent">Concept Primer</span>
      </div>
      <h3 className="text-base font-semibold text-steel-50">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-steel-300">{body}</p>
    </div>
  );
}
