import { ChatRequestOptions, Message } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SparklesIcon } from "lucide-react";
import { Markdown } from "./markdown";
import cx from "classnames";
import { MessageReasoning } from "./message-reasoning";
import { PreviewAttachment } from "./preview-attachment";
import MessageActions from "./message-actions";

export const PreviewMessage = ({
  chatId,
  message,
  isLoading,
  // setMessages,
  // reload,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}) => {
  const reasoning = message.parts?.find((part) => part.type === "reasoning");
  const toolInvocations = message.parts?.filter(
    (part) => part.type === "tool-invocation",
  );

  const uniqueSources = toolInvocations?.reduce(
    (sources: Set<string>, result) => {
      if (
        result.toolInvocation.toolName === "getInformation" &&
        result.toolInvocation.state === "result"
      ) {
        const chunks = result.toolInvocation.result;
        for (const chunk of chunks) {
          sources.add(chunk.metadata.documentName);
        }
      }

      return sources;
    },
    new Set([]),
  );

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div className="flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:w-fit">
          {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 w-full">
            {message.experimental_attachments && (
              <div className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {uniqueSources && uniqueSources.size > 0 && (
              <Sources sources={[...uniqueSources]} />
            )}

            {reasoning && (
              <MessageReasoning
                isLoading={isLoading}
                reasoning={reasoning.reasoning}
              />
            )}

            {(message.content || reasoning?.reasoning) && (
              <div className="flex flex-row gap-2 items-start">
                <div
                  className={cn("flex flex-col gap-4", {
                    "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                      message.role === "user",
                  })}
                >
                  <Markdown>{message.content as string}</Markdown>
                </div>
              </div>
            )}

            <MessageActions
              key={`action-${message.id}`}
              chatId={chatId}
              message={message}
              isLoading={isLoading}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const Sources = ({ sources }: { sources: string[] }) => {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold">Sources Used:</p>
      <ul>
        {sources.map((source, index) => (
          <Markdown key={index}>{`- ${source}`}</Markdown>
        ))}
      </ul>
    </div>
  );
};

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking and gathering information...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
