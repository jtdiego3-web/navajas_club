import Image from "next/image";
import Link from "next/link";

export default function Logo({ size = 44, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      {/* El logo original es dorado sobre marrón oscuro: lo integramos con blend + marco dorado
          para que no rompa el UX sobre el header carbón */}
      <span
        className="relative overflow-hidden rounded-full shrink-0 ring-1 ring-[#D4A94E]/50 shadow-[0_4px_18px_-4px_rgba(212,169,78,0.6)]"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo-navajas.png"
          alt="Navaja's Club"
          fill
          className="object-cover scale-110"
          priority
        />
      </span>
      {withText && (
        <span className="leading-none">
          <span className="font-display block text-[1.15rem] font-800 tracking-wide text-[#F5F2EB] group-hover:text-[#E3C77F] transition-colors font-bold">
            NAVAJA&rsquo;S
          </span>
          <span className="block text-[0.68rem] tracking-[0.45em] text-[#D4A94E] font-medium mt-0.5">
            CLUB
          </span>
        </span>
      )}
    </Link>
  );
}
