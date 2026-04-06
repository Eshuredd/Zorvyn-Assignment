import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendTone?: "up" | "down" | "neutral";
  valueClassName?: string;
}

const trendClass = {
  up: "text-[hsl(146_61%_26%)]",
  down: "text-[hsl(6_57%_46%)]",
  neutral: "text-muted-foreground",
};

export function StatCard({ title, value, trend, trendTone = "neutral", valueClassName }: StatCardProps) {
  return (
    <Card className="animate-fade-in rounded-xl border-border shadow-sm">
      <div className="p-5">
        <p className="ledger-kpi-label">{title}</p>
        <p className={cn("font-mono text-[26px] font-semibold leading-tight tracking-tight text-foreground", valueClassName)}>
          {value}
        </p>
        {trend && <p className={cn("mt-1 text-[11px]", trendClass[trendTone])}>{trend}</p>}
      </div>
    </Card>
  );
}
