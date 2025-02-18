import { Footer } from "@/components/common/footer";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col">
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
        </div>
      </div>
      <div className="mx-auto flex h-full w-full max-w-[1280px] flex-1 justify-center">
        {children}
      </div>

      <Footer />
    </main>
  );
}
