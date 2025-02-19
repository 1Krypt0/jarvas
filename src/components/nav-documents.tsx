"use client";

import { Ellipsis, FileText } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Document } from "./app-sidebar";

export const NavDocuments = ({ documents }: { documents: Document[] }) => {
  const clippingLimit = 5;
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
        <FileText className="mr-2 size-4" />
        Documents
      </SidebarGroupLabel>
      <SidebarMenu>
        {documents.length === 0 ? (
          <SidebarMenuItem>
            <p className="h-8 pl-2 text-sm">Upload a file to get started</p>
          </SidebarMenuItem>
        ) : (
          <>
            {documents.slice(0, clippingLimit).map((item) => {
              // <FileLink {item} {changeFileNameForm} />
              <p>{item.name}</p>;
            })}
            {documents.length > clippingLimit && (
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
