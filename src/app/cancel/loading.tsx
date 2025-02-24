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
          <CardTitle>Something happenned!</CardTitle>
          <CardDescription>
            Your subscription was cancelled or some error occurred. You will now
            be automatically redirected to the register page. If any error
            persists, please contact us.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <Button
              onClick={() => {
                redirect("/register");
              }}
            >
              Redirect Manually
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  );
}
