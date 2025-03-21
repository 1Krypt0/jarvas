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
          <CardTitle>Funcionou!</CardTitle>
          <CardDescription>
            A sua subscrição foi adquirida com sucesso! Vai agora ser
            automaticamente redirecionado para a aplicação. Se isso não
            acontecer, por favor clica aqui.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <Button
              onClick={() => {
                redirect("/");
              }}
            >
              Aceder ao Jarvas
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  );
}
