"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useEffect, TextareaHTMLAttributes } from "react";

interface AutoResizeTextareaProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange"
  > {
  value: string;
  action: (value: string) => void;
}

export function AutoResizeTextarea({
  className,
  value,
  action,
  ...props
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [value]);

  return (
    <textarea
      {...props}
      value={value}
      ref={textareaRef}
      onChange={(e) => {
        action(e.target.value);
        resizeTextarea();
      }}
      className={cn(
        "border-input focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed rounded-md px-3 py-2 resize-none min-h-4 max-h-80",
        className,
      )}
    />
  );
}
