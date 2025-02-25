"use client";

import { ChevronsUpDown, CreditCard, LogOut, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { env } from "@/env";

export function NavUser({
  user,
  hasPaid,
}: {
  user: {
    id: string;
    name: string;
    email: string;
  };
  hasPaid: boolean;
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const handleBilling = async () => {
    const res = await fetch("/api/stripe");
    if (!res.ok) {
      // TODO: Show error
      return;
    }
    const { id } = await res.json();

    const stripe = await loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    await stripe?.redirectToCheckout({ sessionId: id });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {user.name.at(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {user.name.at(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => {
                  router.push("/dashboard");
                }}
              >
                <User />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  if (hasPaid) {
                    router.push(
                      "https://billing.stripe.com/p/login/test_6oEaGV2yKd0o14Q6oo",
                    );
                  } else {
                    handleBilling();
                  }
                }}
              >
                {hasPaid ? (
                  <>
                    <CreditCard />
                    Manage Billing
                  </>
                ) : (
                  <>
                    <CreditCard />
                    Set Up Billing
                  </>
                )}
              </DropdownMenuItem>
              {/* <DropdownMenuItem> */}
              {/*   <Bell /> */}
              {/*   Notifications */}
              {/* </DropdownMenuItem> */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/");
                    },
                  },
                })
              }
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
