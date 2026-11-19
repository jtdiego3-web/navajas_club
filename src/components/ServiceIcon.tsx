import { Scissors, Zap, Crown, Brush, Smile, Sparkles } from "lucide-react";

export default function ServiceIcon({ icon, size = 22 }: { icon: string; size?: number }) {
  const cls = "text-[#D4A94E]";
  switch (icon) {
    case "zap":
      return <Zap size={size} className={cls} />;
    case "razor":
      return <Sparkles size={size} className={cls} />;
    case "crown":
      return <Crown size={size} className={cls} />;
    case "brush":
      return <Brush size={size} className={cls} />;
    case "smile":
      return <Smile size={size} className={cls} />;
    default:
      return <Scissors size={size} className={cls} />;
  }
}
