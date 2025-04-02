import type { Message } from "ai";
import { useCopyToClipboard } from "usehooks-ts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { CopyIcon } from "lucide-react";
export default function MessageActions({
  message,
  isLoading,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, copyToClipboard] = useCopyToClipboard();

  const toolInvocations = message.parts?.filter(
    (part) => part.type === "tool-invocation",
  );

  if (isLoading) return null;
  if (message.role === "user") return null;
  if (toolInvocations && toolInvocations.length > 0) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground"
              variant="outline"
              onClick={async () => {
                await copyToClipboard(message.content);
                toast.success("Message copied to clipboard!");
              }}
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
