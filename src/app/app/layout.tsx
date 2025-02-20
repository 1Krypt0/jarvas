import { AppSidebar, Conversation, Document } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const documents: Document[] = [{ id: "abc", name: "Test" }];
  const conversations: Conversation[] = [
    { id: "abc", title: "Test", createdAt: "Today" },
  ];
  return (
    <SidebarProvider>
      <AppSidebar documents={documents} conversations={conversations} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
