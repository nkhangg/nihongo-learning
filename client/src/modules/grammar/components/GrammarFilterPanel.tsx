"use client";

import { Button } from "@shared/components/ui";
import { Checkbox } from "@shared/components/ui";
import { Separator } from "@shared/components/ui";
import { cn } from "@shared/utils";
import type { GrammarFilter, JLPTLevel } from "../types";

const JLPT_LEVELS = [
  { value: "all", label: "Tất cả" },
  { value: "n5", label: "N5" },
  { value: "n4", label: "N4" },
  { value: "n3", label: "N3" },
  { value: "n2", label: "N2" },
  { value: "n1", label: "N1" },
] as const;

const LEVEL_COLORS: Record<string, string> = {
  n5: "text-teal-600 border-teal-300",
  n4: "text-blue-600 border-blue-300",
  n3: "text-amber-600 border-amber-300",
  n2: "text-red-500 border-red-300",
  n1: "text-foreground border-border",
};

const GRAMMAR_TYPES = [
  "Nối câu",
  "Điều kiện",
  "Bị động",
  "Khả năng",
  "So sánh",
  "Lịch sự",
  "Trạng từ",
  "Kinh nghiệm",
  "Đồng thời",
];

const PROGRESS_OPTIONS = [
  { value: "learned", label: "Đã học xong" },
  { value: "studying", label: "Đang học" },
  { value: "unlearned", label: "Chưa học" },
] as const;

interface GrammarFilterPanelProps {
  filter: GrammarFilter;
  onLevelChange: (level: JLPTLevel | "all") => void;
  onTypeToggle: (type: string) => void;
  onProgressToggle: (value: "learned" | "studying" | "unlearned") => void;
  progressChecked: Record<string, boolean>;
  onReset: () => void;
}

export function GrammarFilterPanel({
  filter,
  onLevelChange,
  onTypeToggle,
  onProgressToggle,
  progressChecked,
  onReset,
}: GrammarFilterPanelProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold">Lọc</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground"
          onClick={onReset}
        >
          Đặt lại
        </Button>
      </div>

      <div className="px-4 py-3">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Cấp độ JLPT
        </p>
        <div className="flex flex-wrap gap-1.5">
          {JLPT_LEVELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onLevelChange(value as JLPTLevel | "all")}
              className={cn(
                "rounded-full border-[1.5px] px-2.5 py-1 text-[11px] font-medium transition-colors",
                filter.level === value
                  ? "border-foreground bg-foreground text-background"
                  : value === "all"
                    ? "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    : cn(
                        LEVEL_COLORS[value],
                        "bg-background hover:border-foreground/40",
                      ),
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="px-4 py-3">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Loại ngữ pháp
        </p>
        <div className="flex flex-wrap gap-1.5">
          {GRAMMAR_TYPES.map((type) => {
            const active = filter.types.includes(type);
            return (
              <button
                key={type}
                onClick={() => onTypeToggle(type)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                  active
                    ? "border-border bg-muted text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="px-4 py-3">
        <p className="mb-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Tiến độ
        </p>
        <div className="flex flex-col gap-2">
          {PROGRESS_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 text-xs text-foreground/80"
            >
              <Checkbox
                checked={progressChecked[value] ?? true}
                onCheckedChange={() => onProgressToggle(value)}
                className="h-3.5 w-3.5"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
