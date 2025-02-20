import { ChatRequestOptions, Message } from "ai";
import Typography from "./ui/typography";
import { PreviewMessage, ThinkingMessage } from "./message-types";

export default function Messages({
  chatId,
  isLoading,
  messages,
  setMessages,
  reload,
}: {
  chatId: string;
  isLoading: boolean;
  messages: Message[];
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}) {
  console.log("Messages are");
  console.log(messages);

  return (
    <div className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4">
      {messages.length === 0 && (
        <Typography variant="h1" className="mx-auto mt-24">
          Em que o posso ajudar?
        </Typography>
      )}

      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={isLoading && messages.length - 1 === index}
          setMessages={setMessages}
          reload={reload}
        />
      ))}

      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && <ThinkingMessage />}

      <div className="shrink-0 min-w-[24px] min-h-[24px]" />
    </div>
  );
}
