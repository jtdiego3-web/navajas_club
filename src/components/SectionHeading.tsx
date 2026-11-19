export default function SectionHeading({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10">
      <p className="text-[0.72rem] tracking-[0.35em] uppercase text-[#D4A94E] font-medium">{kicker}</p>
      <h2 className="font-display text-3xl sm:text-4xl mt-2 text-[#F5F2EB]">{title}</h2>
      <div className="ornament-line mt-4 max-w-[220px] mx-auto">
        <span className="text-[#D4A94E] text-lg leading-none">✦</span>
      </div>
      {sub && <p className="mt-4 text-[#F5F2EB]/60 text-[0.95rem] leading-relaxed">{sub}</p>}
    </div>
  );
}
