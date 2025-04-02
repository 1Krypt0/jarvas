"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { env } from "@/env";
import { Session } from "@/lib/auth-client";
import { pricingTiers } from "@/lib/constants";
import { loadStripe } from "@stripe/stripe-js";
import { Check, ChevronRight, CreditCard, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function BillingCard({
  session,
  hasPaid,
}: {
  session: Session;
  hasPaid: boolean;
}) {
  const currentPlan = pricingTiers.find(
    (tier) => tier.id === session.user.plan,
  ) ?? { id: "", name: "", price: 0, features: [] };

  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const handleBilling = async (newPlanId: string) => {
    setLoading((prev) => ({ ...prev, [newPlanId]: true }));

    const res = await fetch(`/api/stripe?plan=${newPlanId}`);

    if (!res.ok) {
      switch (res.statusText) {
        case "Unresolved Subscription":
          toast.error(
            "Your current subscription state does not allow you to switch plans.",
          );
          break;
        default:
          toast.error(
            "There was an error processing your subscription. Please try again. If the problem persists, please contact us.",
          );
          break;
      }

      setLoading((prev) => ({ ...prev, [newPlanId]: false }));
      return;
    }

    const { id } = await res.json();

    if (id) {
      const stripe = await loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      setLoading((prev) => ({ ...prev, [newPlanId]: false }));
      await stripe?.redirectToCheckout({ sessionId: id });
    } else {
      setLoading((prev) => ({ ...prev, [newPlanId]: false }));
      toast.success("Your plan was updated successfully!");
    }

    router.refresh();
  };

  return (
    <Card id="billing">
      <CardHeader>
        <CardTitle className="text-xl">Plan</CardTitle>
        <CardDescription>
          Your current plan is <strong>{currentPlan?.name}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-5xl font-bold">
              {currentPlan?.price}€
              <span className="text-sm font-normal text-muted-foreground">
                /month
              </span>
            </p>
          </div>
          <div>
            <ul className="space-y-2 grid grid-cols-2 pt-4">
              {currentPlan?.features.map((feature) => (
                <li className="flex items-center" key={feature.description}>
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>{feature.description}</span>
                </li>
              ))}

              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>24/7 Support</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Regular Updates</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4">
          {hasPaid && currentPlan.id !== "free" && (
            <Button size="sm" className="gap-2" variant="secondary" asChild>
              <Link href={env.NEXT_PUBLIC_STRIPE_BILLING_LINK}>
                <CreditCard />
                Manage Subscription
              </Link>
            </Button>
          )}
        </div>

        <Separator className="my-8" />
        <h3 className="text-xl font-bold mb-4">Change Plan</h3>
        <h5 className="text-sm text-muted-foreground">
          Feel like the current plan is not enough? Or that it is too much for
          your use case? Check our other plans here.
        </h5>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-8">
          {pricingTiers
            .filter((plan) => plan.id !== currentPlan.id)
            .map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    {currentPlan?.price < plan.price
                      ? `Upgrade to ${plan.name} and unlock neww limits`
                      : `Downgrade to ${plan.name}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grow">
                  <p className="text-3xl font-bold mb-4">
                    {plan.price}€
                    <span className="text-sm font-normal text-muted-foreground">
                      /mês
                    </span>
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.description}
                        className="flex text-start items-center justify-between"
                      >
                        <div className="flex text-start items-center">
                          <Check className="mr-2 h-4 w-4 text-primary" />
                          <span>{feature.description}</span>
                        </div>

                        {feature.additional && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{feature.additional}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleBilling(plan.id)}
                    disabled={loading[plan.id]}
                  >
                    {loading[plan.id] ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <>
                        Change to {plan.name}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
      </CardContent>

      <CardFooter className="gap-2 justify-between items-center"></CardFooter>
    </Card>
  );
}
