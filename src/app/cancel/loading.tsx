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
          <CardTitle>Uh Oh! Algo se passou!</CardTitle>
          <CardDescription>
            A tua subscrição foi cancelada ou algum erro ocorreu. Vais agora ser
            automaticamente redirecionado para a tua página. Se não fores
            automaticamente redirecionado, clica aqui.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <Button
              onClick={() => {
                redirect("/register");
              }}
            >
              Redirecionar Manualment
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  );
}
