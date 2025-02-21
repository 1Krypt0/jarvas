"use client";
import { Ellipsis, MessageSquareText } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Chat } from "@/db/schema";
import ChatLink from "./chat-link";

export const NavConversations = ({
  conversations,
}: {
  conversations: Chat[];
}) => {
  const clippingLimit = 5;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
        <MessageSquareText className="mr-2 size-4" />
        Conversations
      </SidebarGroupLabel>

      <SidebarMenu>
        {conversations.length === 0 ? (
          <SidebarMenuItem>
            <p className="h-8 pl-2 text-sm">Conversations will appear here</p>
          </SidebarMenuItem>
        ) : (
          <>
            {conversations.slice(0, clippingLimit).map((item) => {
              return <ChatLink item={item} key={item.id} />;
            })}
            {conversations.length > clippingLimit && (
              <SidebarMenuItem>
                <SidebarMenuButton className="text-sidebar-foreground/70">
                  <Ellipsis />
                  <span>More</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
};
