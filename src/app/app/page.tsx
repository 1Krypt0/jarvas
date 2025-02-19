"use client";
import { AutoResizeTextarea } from "@/components/auto-resize-textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function AppPage() {
  const chatSchema = z.object({
    query: z.string().nonempty(),
  });

  const chatForm = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      query: "",
    },
  });

  const handleKeyDown = () => {
    console.log("Key down");
  };

  const [input, setInput] = useState("");

  return (
    <>
      <section className="prose flex h-full items-center self-center">
        <h1>Em que o posso ajudar?</h1>
      </section>

      <section className="flex h-20 items-end justify-center gap-4">
        <div className="md:w-1/3">
          <Form {...chatForm}>
            <form
              className="mx-auto max-w-3xl"
              onSubmit={chatForm.handleSubmit(console.log)}
            >
              <FormField
                control={chatForm.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="grid gap-2 relative">
                    <FormControl>
                      <AutoResizeTextarea
                        {...field}
                        onKeyDown={handleKeyDown}
                        action={(v) => setInput(v)}
                        value={input}
                        placeholder="Enter a message"
                        className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none"
                      />
                    </FormControl>

                    {input !== "" && (
                      <Button
                        type="submit"
                        className="absolute bottom-2 right-2 rounded-md"
                      >
                        <Send size={16} />
                        <span className="sr-only">Send message</span>
                      </Button>
                    )}
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <Dialog>
          <DialogTrigger className={`${buttonVariants({ size: "icon" })} mb-2`}>
            <Upload className="size-4" />
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>Submit a File</DialogHeader>
            <DialogDescription>
              Submit a File here. Click Upload when you are done.
            </DialogDescription>

            {/* <form */}
            {/* 	method="POST" */}
            {/* 	className="grid gap-4 py-4" */}
            {/* 	action="?/fileUpload" */}
            {/* > */}
            {/* 	<Form.Field form={fileUploadForm} name="file"> */}
            {/* 		<Form.Control> */}
            {/* 			{#snippet children({ props })} */}
            {/* 				<Form.Label>File Upload</Form.Label> */}
            {/* 				<FileInput required type="file" {...props} bind:files={$file} /> */}
            {/* 			{/snippet} */}
            {/* 		</Form.Control> */}
            {/* 		<Form.FieldErrors /> */}
            {/* 	</Form.Field> */}
            {/* 	<Form.Button>Upload File</Form.Button> */}
            {/* </form> */}
          </DialogContent>
        </Dialog>
      </section>
    </>
  );
}
