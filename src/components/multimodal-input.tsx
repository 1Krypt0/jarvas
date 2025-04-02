import { Attachment, ChatRequestOptions, Message } from "ai";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useWindowSize, useLocalStorage } from "usehooks-ts";
import { Textarea } from "./ui/textarea";
import cx from "classnames";
import { Button } from "./ui/button";
import { ArrowUpIcon, Loader2, LoaderIcon, PaperclipIcon } from "lucide-react";
import { sanitizeUIMessages } from "@/lib/utils";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MultimodalInput({
  chatId,
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  setMessages,
  handleSubmit,
  className,
}: {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = "98px";
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    "",
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || "";
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    window.history.replaceState({}, "", `/chat/${chatId}`);

    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    setAttachments([]);
    setLocalStorageInput("");
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }

      toast.error("There was an error processing the file. Please try again");
    } catch {
      toast.error("There was an error processing the file. Please try again");
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch {
        toast.error("There was an error processing the file. Please try again");
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  return (
    <div className="relative w-full flex flex-col gap-4">
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row gap-2 overflow-x-scroll items-end">
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: "",
                name: filename,
                contentType: "",
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <Textarea
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className={cx(
          "min-h-[24px] max-h-[calc(25dvh)] overflow-y-scroll resize-none rounded-2xl text-base! bg-muted pb-10 scrollbar-track-accent",
          className,
        )}
        rows={3}
        autoFocus
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            if (isLoading) {
              toast.warning(
                "Please wait until the model finishes generating an answer!",
              );
            } else {
              submitForm();
            }
          }
        }}
      />

      <div className="absolute bottom-0 p-2 w-fit flex flex-row justify-start">
        <AttachmentsButton fileInputRef={fileInputRef} isLoading={isLoading} />
      </div>

      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
        {isLoading ? (
          <StopButton stop={stop} setMessages={setMessages} />
        ) : (
          <SendButton
            input={input}
            submitForm={submitForm}
            uploadQueue={uploadQueue}
          />
        )}
      </div>
    </div>
  );
}

function PreviewAttachment({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) {
  const { name, url, contentType } = attachment;

  return (
    <div className="flex flex-col gap-2">
      <div className="w-20 h-16 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center">
        {contentType ? (
          contentType.startsWith("image") ? (
            <Image
              key={url}
              src={url}
              alt={name ?? "An image attachment"}
              className="rounded-md size-full object-cover"
            />
          ) : (
            <div className="" />
          )
        ) : (
          <div className="" />
        )}

        {isUploading && (
          <div className="animate-spin absolute text-zinc-500">
            <LoaderIcon />
          </div>
        )}
      </div>
      <div className="text-xs text-zinc-500 max-w-16 truncate">{name}</div>
    </div>
  );
}

function AttachmentsButton({
  isLoading,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isLoading: boolean;
}) {
  const router = useRouter();

  const fileUploadSchema = z.object({
    files: z.unknown({ message: "Upload a file here" }),
  });

  const form = useForm<z.infer<typeof fileUploadSchema>>({
    resolver: zodResolver(fileUploadSchema),
  });
  const fileRef = form.register("files");

  const onSubmit = async (values: z.infer<typeof fileUploadSchema>) => {
    setLoading(true);
    const files = values.files as FileList;

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    const res = await fetch("/api/file", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      if (res.statusText === "Limit hit") {
        toast.error(
          "Unfortunately, the files your uploading exceed the credit limits of the free tier",
        );
      } else {
        toast.error("There was an error processing the file. Please try again");
      }
    } else {
      toast.success("File uploaded successfully!");
    }

    router.refresh();
    setLoading(false);
    setIsOpen(false);
  };

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="rounded-md rounded-bl-lg p-[7px] h-fit dark:hover:bg-primary dark:hover:text-accent "
          variant="ghost"
          disabled={isLoading}
        >
          <PaperclipIcon size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Upload your Files here. Click on Upload once you are done.
        </DialogDescription>

        <Form {...form}>
          <form
            className="grid gap-4 py-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              name="files"
              control={form.control}
              render={() => (
                <FormItem>
                  <FormLabel>Files</FormLabel>
                  <FormControl>
                    <Input type="file" required multiple {...fileRef} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                "Upload Files"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function SendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

function StopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
  return (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => sanitizeUIMessages(messages));
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg
      height={size}
      viewBox="0 0 16 16"
      width={size}
      style={{ color: "currentcolor" }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 3H13V13H3V3Z"
        fill="currentColor"
      />
    </svg>
  );
};
