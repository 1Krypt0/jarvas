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
          <CardTitle>Success!</CardTitle>
          <CardDescription>
            Your subscription was aquired successfully! You should now be
            redirected automatically. If that does not happen, please click here
            to proceed to the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <Button
              onClick={() => {
                redirect("/app");
              }}
            >
              Access Jarvas
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  );
}
