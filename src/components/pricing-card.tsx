"use client";
import { Check, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useRouter } from "next/navigation";

export default function PricingCard({
  id,
  name,
  description,
  price,
  features,
  cta,
  isPopular,
}: {
  id: string;
  name: string;
  description: string;
  price: number;
  features: { description: string; additional?: string }[];
  cta: string;
  isPopular: boolean;
}) {
  const router = useRouter();
  return (
    <Card className={isPopular ? "flex flex-col relative" : "flex flex-col"}>
      {isPopular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <Badge className="px-3 py-1 bg-primary text-primary-foreground">
            Popular
          </Badge>
        </div>
      )}
      <CardHeader className="flex flex-col space-y-1.5 pb-4">
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4 flex items-baseline text-5xl font-extrabold">
          {price}€
          <span className="ml-1 text-xl font-normal text-muted-foreground">
            /mês
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature) => (
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
          variant={isPopular ? "default" : "outline"}
          onClick={() => router.push(`/register?plan=${id}`)}
        >
          {cta}
        </Button>
      </CardFooter>
    </Card>
  );
}
