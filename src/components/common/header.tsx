"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";
import Typography from "../ui/typography";
import { cn } from "@/lib/utils";

export function Header() {
  const items = [
    {
      href: "#pricing",
      title: "Planos",
    },
  ];

  const pathName = "test";

  return (
    <div className="flex w-full items-center justify-center border-b">
      <div className="flex w-full max-w-[1280px] items-center gap-x-8 px-4 md:px-8">
        <div className="md:flex-0 min-w-fit flex-1">
          <Link href="/" className="pointer flex items-center">
            <Image
              src="/jarvas.png"
              alt="Logo"
              width="150"
              height="100"
              className="mr-3"
            />
          </Link>
        </div>
        <div className="hidden w-full items-center md:flex">
          <div className="flex flex-1 items-center gap-x-12">
            {items.map((item) => {
              const selected =
                pathName === item.href || pathName.includes(item.href);
              return (
                <Link href={item.href} className="block w-fit" key={item.title}>
                  <Typography
                    variant="p"
                    className={cn(selected && "text-primary")}
                  >
                    {item.title}
                  </Typography>
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-x-8">
            <a href="/login">
              <p className="text-minor text-sm leading-7 md:text-sm">Entrar</p>
            </a>
            <a href="/register">
              <Button size="sm">
                <p className="text-minor text-sm leading-7 md:text-sm">
                  Registar
                </p>
              </Button>
            </a>
          </div>
        </div>
        <div className="flex items-center gap-x-4 md:hidden">
          <div className="flex items-center gap-x-8">
            <a href="/login">
              <p className="text-minor text-sm leading-7 md:text-sm">Entrar</p>
            </a>
            <a href="/register">
              <Button size="sm">
                <p className="text-minor text-sm leading-7 md:text-sm">
                  Registar
                </p>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
