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
        <CardTitle className="text-xl">Perfil</CardTitle>
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
                onSuccess: () => router.push("/"),
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
                Terminar Sessão
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
          Editar Utilizador
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Editar Informação</DialogTitle>
          <DialogDescription>Editar Informação do Utilizador</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="name">Nome</Label>
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
                    toast.success("Informação atualizada com sucesso!");
                  },
                  onError: () => {
                    toast.error("Ocorreu um erro ao atualizar a informação!");
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
              "Atualizar"
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
        <Button variant="destructive">Apagar Conta</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isto irá permanentemente apagar a
            sua conta, a sua subscrição, e remover todos os seus documentos e
            conversas do nosso servidor.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
              "Apagar Conta"
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
        .min(8, { message: "A password precisa de pelo menos 8 dígitos" }),
      confirmNewPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "As passwords têm de condizer",
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
          "A sua conta foi criada com a Google e, portanto, não tem uma password associada.",
        );
      } else {
        toast.error(
          "Ocorreu um erro ao atualizar a password. Por favor, tente de novo.",
        );
      }
      console.error("Error:", res.error);
    } else {
      setOpen(false);
      toast.success("Password atualizada com sucesso!");
    }

    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 " variant="secondary" size="sm">
          <Key />
          Alterar Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Alterar Password</DialogTitle>
          <DialogDescription>Altere a sua Password</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Password Atual</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Escreva a sua Password atual aqui"
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
                  <FormLabel>Nova Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Escreva a sua nova Password atual aqui"
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
                  <FormLabel>Confirme a Nova Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Escreva a sua Password novamente"
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
                "Atualizar Password"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
