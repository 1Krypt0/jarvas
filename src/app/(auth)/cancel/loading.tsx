"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { redirect } from "next/navigation";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Uh Oh! Something happened!</CardTitle>
          <CardDescription>
            Your subscription purchase was cancelled or an error occurred. You
            will now be redirected to your dashboard. If you are not
            automatically redirected, click here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <Button
              onClick={() => {
                redirect("/dashboard");
              }}
            >
              Manually Redirect
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  );
}
