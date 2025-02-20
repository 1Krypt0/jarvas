"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Command } from "lucide-react";
import { NavConversations } from "./nav-conversations";
import { NavDocuments } from "./nav-documents";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export interface Document {
  id: string;
  name: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
}

export const AppSidebar = ({
  conversations,
  documents,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  conversations: Conversation[];
  documents: Document[];
}) => {
  "use client";
  const user = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/shadcn.jpg",
  };

  const router = useRouter();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Button
                onClick={() => {
                  router.push("/app");
                  router.refresh();
                }}
                variant="ghost"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">New Chat</span>
                  <span className="truncate text-xs">
                    Start a new conversation
                  </span>
                </div>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavConversations conversations={conversations} />
        <NavDocuments documents={documents} />
        <NavSecondary />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
};
