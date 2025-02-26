"use client";
import { MessageSquareText, Minus, Plus } from "lucide-react";
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
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { Chat } from "@/db/schema";
import ChatLink from "./chat-link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export const NavConversations = ({
  conversations,
}: {
  conversations: Chat[];
}) => {
  const [showAll, setShowAll] = useState(false);

  const clippingLimit = 5;
  const displayedItems = showAll
    ? conversations
    : conversations.slice(0, clippingLimit);

  const router = useRouter();
  const { id } = useParams();

  const [deleteId, setDeleteId] = useState("");
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { setOpenMobile } = useSidebar();

  const handleDelete = async () => {
    const res = await fetch(`/api/chat?id=${deleteId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      console.error("Error deleting chat");
    }

    setDeleteDialogOpen(false);

    if (deleteId === id) {
      router.push("/");
    }

    router.refresh();
  };

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>
          <MessageSquareText className="mr-2 size-4" />
          Conversas
        </SidebarGroupLabel>

        <SidebarMenu>
          {conversations.length === 0 ? (
            <SidebarMenuItem>
              <p className="h-8 pl-2 text-sm">
                As suas Conversas vão aparecer aqui
              </p>
            </SidebarMenuItem>
          ) : (
            <>
              {displayedItems.map((chat) => (
                <ChatLink
                  chat={chat}
                  key={chat.id}
                  isActive={chat.id === id}
                  onDelete={() => {
                    setDeleteId(chat.id);
                    setDeleteDialogOpen(true);
                  }}
                  setOpenMobile={setOpenMobile}
                />
              ))}
              {conversations.length > clippingLimit && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="text-sidebar-foreground/70"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? (
                      <>
                        <Minus />
                        <span>Mostrar Menos</span>
                      </>
                    ) : (
                      <>
                        <Plus />
                        <span>Mostrar Mais</span>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </>
          )}
        </SidebarMenu>
      </SidebarGroup>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Apagar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
