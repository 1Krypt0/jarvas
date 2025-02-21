import { Chat } from "@/db/schema";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export default function ChatLink({ item }: { item: Chat }) {
  const { isMobile } = useSidebar();
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteFormRef = useRef<HTMLFormElement>(null);
  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: "DELETE",
    });

    setDeleteDialogOpen(false);

    if (deleteId === id) {
      router.push("/");
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <a href={`/app/chats/${item.id}`} title={item.title}>
          <span>{item.title}</span>
        </a>
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction showOnHover>
            <Ellipsis />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-56 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "end" : "start"}
        >
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Pencil className="text-muted-foreground" />
            <span>Rename</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="text-muted-foreground" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Conversation Name</DialogTitle>
          </DialogHeader>
          <form
            method="post"
            action="/app?/changeChatName"
            className="grid gap-4"
          >
            {/* <Form.Field {form} name="title" class="grid gap-2"> */}
            {/* 	<Form.Control> */}
            {/* 		{#snippet children({ props })} */}
            {/* 			<Form.Label>New Name</Form.Label> */}
            {/* 			<Input {...props} type="text" required bind:value={$formData.title} /> */}
            {/* 		{/snippet} */}
            {/* 	</Form.Control> */}
            {/* 	<Form.FieldErrors /> */}
            {/* </Form.Field> */}
            {/**/}
            {/* <Form.Field {form} name="id" class="hidden"> */}
            {/* 	<Form.Control> */}
            {/* 		{#snippet children({ props })} */}
            {/* 			<Input {...props} type="text" class="hidden" required bind:value={$formData.id} /> */}
            {/* 		{/snippet} */}
            {/* 	</Form.Control> */}
            {/* 	<Form.FieldErrors /> */}
            {/* </Form.Field> */}
            <DialogFooter>
              {/* <Form.Button type="submit" class="w-full">Save changes</Form.Button> */}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form
            method="post"
            ref={deleteFormRef}
            action="/app?/deleteChat"
            className="grid gap-4"
          >
            <input type="text" name="id" value={item.id} hidden />
          </form>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteFormRef?.submit()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenuItem>
  );
}
