import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getDocuments } from "@/db/queries";
import { auth } from "@/lib/auth";
import { hasUserPaid } from "@/lib/stripe";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return unauthorized();
  }

  const hasPaid = await hasUserPaid(session.user.id);

  const documents = await getDocuments(session.user.id);

  return (
    <SidebarProvider>
      <AppSidebar documents={documents} user={session.user} hasPaid={hasPaid} />
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
