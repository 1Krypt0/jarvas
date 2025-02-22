import { Document } from "@/db/schema";
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
import { Input } from "./ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FileLink({
  file,
  onDelete,
}: {
  file: Document;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(file.name);

  const handleSave = async () => {
    const res = await fetch(`/api/file?id=${file.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newName: tempText }),
    });

    if (!res.ok) {
      console.error("Error updating file name");
    }

    router.refresh();
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempText(file.name);
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
      <SidebarMenuButton asChild>
        <span>{file.name}</span>
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
          <DropdownMenuItem onSelect={() => onDelete(file.id)}>
            <Trash2 className="text-muted-foreground" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
