"use client";

import { FileText, Minus, Plus } from "lucide-react";
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
import { Document } from "@/db/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FileLink from "./file-link";
import { toast } from "sonner";

export const NavDocuments = ({ documents }: { documents: Document[] }) => {
  const [showAll, setShowAll] = useState(false);

  const clippingLimit = 5;
  const displayedItems = showAll
    ? documents
    : documents.slice(0, clippingLimit);

  const router = useRouter();

  const [deleteId, setDeleteId] = useState("");
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { setOpenMobile } = useSidebar();

  const handleDelete = async () => {
    const res = await fetch(`/api/file?id=${deleteId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("There was an error deleting the file. Please try again.");
    } else {
      toast.success("File deleted successfully!");
    }

    setDeleteDialogOpen(false);

    router.refresh();
  };

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>
          <FileText className="mr-2 size-4" />
          Files
        </SidebarGroupLabel>
        <SidebarMenu>
          {documents.length === 0 ? (
            <SidebarMenuItem>
              <p className="h-8 pl-2 text-sm">Your files will appear here</p>
            </SidebarMenuItem>
          ) : (
            <>
              {displayedItems.map((file) => (
                <FileLink
                  file={file}
                  key={file.id}
                  onDelete={() => {
                    setDeleteId(file.id);
                    setDeleteDialogOpen(true);
                  }}
                  setOpenMobile={setOpenMobile}
                />
              ))}

              {documents.length > clippingLimit && (
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
