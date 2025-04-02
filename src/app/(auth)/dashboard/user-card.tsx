"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, type Session } from "@/lib/auth-client";
import { Edit, Key, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function UserCard({ session }: { session: Session }) {
  const router = useRouter();
  const [isSignOut, setIsSignOut] = useState<boolean>(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Profile</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8 grid-cols-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex ">
              <AvatarImage src={session.user.image || "#"} alt="Avatar" />
              <AvatarFallback>
                {session?.user.name.at(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                {session?.user.name}
              </p>
              <p className="text-sm">{session?.user.email}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <EditUserDialog name={session.user.name} />
            <ChangePasswordDialog />
          </div>
        </div>
        <Separator />
      </CardContent>

      <CardFooter className="gap-2 justify-between items-center">
        <Button
          className="gap-2 z-10"
          variant="secondary"
          onClick={async () => {
            setIsSignOut(true);
            await authClient.signOut({
              fetchOptions: {
                onSuccess: () => router.push("/login"),
              },
            });
            setIsSignOut(false);
          }}
          disabled={isSignOut}
        >
          <span className="text-sm">
            {isSignOut ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <LogOut size={16} />
                Logout
              </div>
            )}
          </span>
        </Button>
        <DeleteUserDialog />
      </CardFooter>
    </Card>
  );
}

function EditUserDialog({ name }: { name: string }) {
  const [newName, setName] = useState(name);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2" variant="secondary">
          <Edit size={13} />
          Edit User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Edit User Details</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="name"
            value={newName}
            required
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </div>
        <DialogFooter>
          <Button
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              await authClient.updateUser({
                name: newName ? newName : undefined,
                fetchOptions: {
                  onSuccess: () => {
                    toast.success("Your information was updated successfully!");
                  },
                  onError: () => {
                    toast.error(
                      "There was a problem updating your information.",
                    );
                  },
                },
              });
              setName("");
              router.refresh();
              setIsLoading(false);
              setIsOpen(false);
            }}
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteUserDialog() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. It will permanently erase your
            account, your subscription, and remove all documents and chats from
            our server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              setIsLoading(true);
              await authClient.deleteUser({
                callbackURL: "/",
              });
              router.push("/");
            }}
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              "Delete Account"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ChangePasswordDialog() {
  const changePasswordSchema = z
    .object({
      currentPassword: z.string(),
      newPassword: z
        .string()
        .min(8, { message: "Your password needs at least 8 characters." }),
      confirmNewPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "The passwords must match.",
      path: ["confirmNewPassword"],
    });

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const onSubmit = async (values: z.infer<typeof changePasswordSchema>) => {
    setLoading(true);

    const res = await authClient.changePassword({
      newPassword: values.newPassword,
      currentPassword: values.currentPassword,
    });

    setLoading(false);

    if (res.error) {
      if (res.error.code === "CREDENTIAL_ACCOUNT_NOT_FOUND") {
        toast.warning(
          "Your account was created with Google and, as such, has no password associated with it.",
        );
      } else {
        toast.error(
          "There was an error updating your password. Please try again.",
        );
      }
    } else {
      setOpen(false);
      toast.success("Your password was updated successfully!");
    }

    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 " variant="secondary" size="sm">
          <Key />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Update your Password</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your Password here"
                      type="password"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your New Password here"
                      type="password"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your New Password again"
                      type="password"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
