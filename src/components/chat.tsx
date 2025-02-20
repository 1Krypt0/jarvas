"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import Messages from "./messages";
import MultiModalInput from "./multimodal-input";
import { Attachment, Message } from "ai";
import { v4 as uuid } from "uuid";

export default function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Message[];
}) {
  const {
    messages,
    input,
    handleSubmit,
    setMessages,
    status,
    stop,
    reload,
    setInput,
  } = useChat({
    id,
    body: { id },
    initialMessages,
    generateId: uuid,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
  });

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="flex flex-col min-w-0 h-full bg-background">
      <Messages
        chatId={id}
        isLoading={status === "submitted" || status === "streaming"}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
      />

      <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <MultiModalInput
          chatId={id}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={status === "submitted" || status === "streaming"}
          stop={stop}
          attachments={attachments}
          setAttachments={setAttachments}
          setMessages={setMessages}
        />
      </form>
    </div>
  );
}
