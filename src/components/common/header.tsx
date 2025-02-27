import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";

export function Header() {
  return (
    <div className="flex w-full items-center justify-center border-b">
      <div className="flex w-full max-w-[1280px] items-center py-4 gap-x-8 px-4 md:px-8">
        <div className="md:flex-0 min-w-fit flex-1">
          <Link href="/" className="pointer flex items-center">
            <Image src="/logo.svg" alt="Logo" width={150} height={100} />
          </Link>
        </div>
        <div className="hidden items-center md:flex">
          <div className="flex items-center gap-x-8">
            <Link href="/login">
              <p className="text-minor text-sm leading-7 md:text-sm">Entrar</p>
            </Link>
            <Button size="sm">
              <Link href="/register">
                <p className="text-minor text-sm leading-7 md:text-sm">
                  Registar
                </p>
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-x-4 md:hidden">
          <div className="flex items-center gap-x-8">
            <Link href="/login">
              <p className="text-minor text-sm leading-7 md:text-sm">Entrar</p>
            </Link>
            <Button size="sm">
              <Link href="/register">
                <p className="text-minor text-sm leading-7 md:text-sm">
                  Registar
                </p>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
