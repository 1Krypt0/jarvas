"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, FileText, MessageSquareText } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function UsageDisplay({
  fileCredits,
  messages,
}: {
  fileCredits: { used: number; limit: number };
  messages: { used: number; limit: number };
}) {
  const [isHovering, setIsHovering] = useState<string | null>(null);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Usage</CardTitle>
          <CardDescription>
            Your current usage and your account limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">File Upload Credits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">{fileCredits.used}</span>
                <span className="text-sm text-muted-foreground">
                  / {fileCredits.limit}
                </span>
                {fileCredits.used >= fileCredits.limit * 0.9 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>You are near your file upload limit!</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            <div
              className="relative"
              onMouseEnter={() => setIsHovering("fileCredits")}
              onMouseLeave={() => setIsHovering(null)}
            >
              <Progress
                value={(fileCredits.used / fileCredits.limit) * 100}
                className="h-2"
              />
              {isHovering === "fileCredits" && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md  px-2 py-1 text-xs shadow-md bg-primary text-primary-foreground">
                  {Math.round((fileCredits.used / fileCredits.limit) * 100)}%
                </div>
              )}
            </div>
          </div>
          {messages.limit && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Messages</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{messages.used}</span>
                  <span className="text-sm text-muted-foreground">
                    / {messages.limit}
                  </span>
                  {messages.used >= messages.limit * 0.9 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>You are near your message limit!</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
              <div
                className="relative"
                onMouseEnter={() => setIsHovering("messages")}
                onMouseLeave={() => setIsHovering(null)}
              >
                <Progress
                  value={(messages.used / messages.limit) * 100}
                  className="h-2"
                />
                {isHovering === "messages" && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-primary text-primary-foreground px-2 py-1 text-xs shadow-md">
                    {Math.round((messages.used / messages.limit) * 100)}%
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="gap-2 justify-between items-center"></CardFooter>
      </Card>
    </TooltipProvider>
  );
}
