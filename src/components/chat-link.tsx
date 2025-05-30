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
import Link from "next/link";
import { Input } from "./ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ChatLink({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(chat.title);

  const handleSave = async () => {
    const res = await fetch(`/api/chat?id=${chat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newName: tempText }),
    });

    setIsEditing(false);

    if (!res.ok) {
      toast.error("There was an error updating your chat. Please try again");
    } else {
      toast.success("Chat updated successfully!");
    }

    router.refresh();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempText(chat.title);
  };

  if (isEditing) {
    return (
      <SidebarMenuItem>
        <Input
          type="text"
          value={tempText}
          autoFocus
          onBlur={handleCancel}
          onChange={(e) => setTempText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link
          href={`/chat/${chat.id}`}
          title={chat.title}
          onClick={() => setOpenMobile(false)}
        >
          <span>{chat.title}</span>
        </Link>
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
          <DropdownMenuItem onSelect={() => setIsEditing(true)}>
            <Pencil className="text-muted-foreground" />
            <span>Rename</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onDelete(chat.id)}>
            <Trash2 className="text-muted-foreground" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
