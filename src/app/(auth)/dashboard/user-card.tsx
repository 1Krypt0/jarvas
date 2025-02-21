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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { router } from "better-auth/api";
import { CreditCard, Edit, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserCard({ session }: { session: Session }) {
  const router = useRouter();
  const [isSignOut, setIsSignOut] = useState<boolean>(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8 grid-cols-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex ">
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

            <Button size="sm" className="gap-2" variant="secondary" asChild>
              <Link href="https://billing.stripe.com/p/login/test_6oEaGV2yKd0o14Q6oo">
                <CreditCard />
                Billing
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 justify-between items-center">
        {/* <ChangePassword /> */}
        <Button
          className="gap-2 z-10"
          variant="secondary"
          onClick={async () => {
            setIsSignOut(true);
            await authClient.signOut({
              fetchOptions: {
                onSuccess() {
                  router.push("/");
                },
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
                Sign Out
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
          <DialogDescription>Edit user information</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
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
                    //toast.success("User updated successfully");
                  },
                  onError: (error) => {
                    console.error("Error");
                    console.error(error);
                    //toast.error("Error updating user")
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
            This action cannot be undone. This will permanently delete your
            account, subscription data, and remove all your files and
            conversations from our servers.
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
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// async function convertImageToBase64(file: File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => resolve(reader.result as string);
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// }
//
// function ChangePassword() {
//   const [currentPassword, setCurrentPassword] = useState<string>("");
//   const [newPassword, setNewPassword] = useState<string>("");
//   const [confirmPassword, setConfirmPassword] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [open, setOpen] = useState<boolean>(false);
//   const [signOutDevices, setSignOutDevices] = useState<boolean>(false);
//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button className="gap-2 z-10" variant="outline" size="sm">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="1em"
//             height="1em"
//             viewBox="0 0 24 24"
//           >
//             <path
//               fill="currentColor"
//               d="M2.5 18.5v-1h19v1zm.535-5.973l-.762-.442l.965-1.693h-1.93v-.884h1.93l-.965-1.642l.762-.443L4 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L4 10.835zm8 0l-.762-.442l.966-1.693H9.308v-.884h1.93l-.965-1.642l.762-.443L12 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L12 10.835zm8 0l-.762-.442l.966-1.693h-1.931v-.884h1.93l-.965-1.642l.762-.443L20 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L20 10.835z"
//             ></path>
//           </svg>
//           <span className="text-sm text-muted-foreground">Change Password</span>
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[425px] w-11/12">
//         <DialogHeader>
//           <DialogTitle>Change Password</DialogTitle>
//           <DialogDescription>Change your password</DialogDescription>
//         </DialogHeader>
//         <div className="grid gap-2">
//           <Label htmlFor="current-password">Current Password</Label>
//           <PasswordInput
//             id="current-password"
//             value={currentPassword}
//             onChange={(e) => setCurrentPassword(e.target.value)}
//             autoComplete="new-password"
//             placeholder="Password"
//           />
//           <Label htmlFor="new-password">New Password</Label>
//           <PasswordInput
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             autoComplete="new-password"
//             placeholder="New Password"
//           />
//           <Label htmlFor="password">Confirm Password</Label>
//           <PasswordInput
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             autoComplete="new-password"
//             placeholder="Confirm Password"
//           />
//           <div className="flex gap-2 items-center">
//             <Checkbox
//               onCheckedChange={(checked) =>
//                 checked ? setSignOutDevices(true) : setSignOutDevices(false)
//               }
//             />
//             <p className="text-sm">Sign out from other devices</p>
//           </div>
//         </div>
//         <DialogFooter>
//           <Button
//             onClick={async () => {
//               if (newPassword !== confirmPassword) {
//                 toast.error("Passwords do not match");
//                 return;
//               }
//               if (newPassword.length < 8) {
//                 toast.error("Password must be at least 8 characters");
//                 return;
//               }
//               setLoading(true);
//               const res = await client.changePassword({
//                 newPassword: newPassword,
//                 currentPassword: currentPassword,
//                 revokeOtherSessions: signOutDevices,
//               });
//               setLoading(false);
//               if (res.error) {
//                 toast.error(
//                   res.error.message ||
//                     "Couldn't change your password! Make sure it's correct",
//                 );
//               } else {
//                 setOpen(false);
//                 toast.success("Password changed successfully");
//                 setCurrentPassword("");
//                 setNewPassword("");
//                 setConfirmPassword("");
//               }
//             }}
//           >
//             {loading ? (
//               <Loader2 size={15} className="animate-spin" />
//             ) : (
//               "Change Password"
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
//
