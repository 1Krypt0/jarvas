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
import { Chat, Document } from "@/db/schema";
import Link from "next/link";

export const AppSidebar = ({
  conversations,
  documents,
  user,
  hasPaid,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  conversations: Chat[];
  documents: Document[];
  user: {
    id: string;
    email: string;
    name: string;
  };
  hasPaid: boolean;
}) => {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild disabled={hasPaid}>
              <Link href="/app">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Novo Chat</span>
                  <span className="truncate text-xs">
                    Comece uma nova conversa
                  </span>
                </div>
              </Link>
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
        <NavUser user={user} hasPaid={hasPaid} />
      </SidebarFooter>
    </Sidebar>
  );
};
