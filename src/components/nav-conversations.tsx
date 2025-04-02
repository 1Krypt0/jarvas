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
import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { toast } from "sonner";

export const NavConversations = () => {
  const [showAll, setShowAll] = useState(false);

  const pathname = usePathname();

  const {
    data: conversations,
    isLoading,
    mutate,
  } = useSWR<Array<Chat>>("/api/conversations", fetcher, {
    fallbackData: [],
  });

  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const clippingLimit = 5;

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
      toast.error(
        "There was an error when deleting the chat. Please try again.",
      );
    } else {
      toast.success("Chat deleted successfully!");
    }

    setDeleteDialogOpen(false);

    if (deleteId === id) {
      router.push("/");
    }

    router.refresh();
  };

  if (isLoading) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>
          <MessageSquareText className="mr-2 size-4" />
          Chats
        </SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <p className="h-8 pl-2 text-sm">Your chats will appear here</p>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>
          <MessageSquareText className="mr-2 size-4" />
          Chats
        </SidebarGroupLabel>

        <SidebarMenu>
          {conversations &&
            (() => {
              const displayedItems = showAll
                ? conversations
                : conversations.slice(0, clippingLimit);
              return (
                <>
                  {conversations.length === 0 ? (
                    <SidebarMenuItem>
                      <p className="h-8 pl-2 text-sm">
                        Your chats will appear here
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
                                <span>Show Less</span>
                              </>
                            ) : (
                              <>
                                <Plus />
                                <span>Show More</span>
                              </>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                    </>
                  )}
                </>
              );
            })()}
        </SidebarMenu>
      </SidebarGroup>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
