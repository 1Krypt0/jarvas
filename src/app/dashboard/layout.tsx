import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Command, Ellipsis, FileText, MessageSquareText } from "lucide-react";

interface Document {
  id: string;
  name: string;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
}

const clippingLimit = 5;

const NavConversations = ({
  conversations,
}: {
  conversations: Conversation[];
}) => {
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
              <p>{item.title}</p>;
              // <ChatLink /* {item} {changeChatNameForm} */ />
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

const NavDocuments = ({ documents }: { documents: Document[] }) => {
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

const AppSidebar = ({
  conversations,
  documents,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  conversations: Conversation[];
  documents: Document[];
}) => {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/app">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">New Chat</span>
                  <span className="truncate text-xs">
                    Start a new conversation
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavConversations conversations={conversations} />
        <NavDocuments documents={documents} />
        {/* <NavSecondary items={data.navSecondary} class="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
    </Sidebar>
  );
};

export default function AppLayout(/* { children }: { children: ReactNode } */) {
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* {children} */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
