import { Footer } from "@/components/common/footer";
import Typography from "@/components/ui/typography";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex w-full items-center justify-center border-b">
        <div className="flex w-full max-w-[1280px] items-center py-4 gap-x-8 px-4 md:px-8">
          <div className="md:flex-0 min-w-fit flex-1">
            <Link href="/" className="pointer flex items-center">
              <Image
                priority
                src="/logo.svg"
                alt="Logo"
                width={150}
                height={100}
              />
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto my-20 flex h-full w-full max-w-[1280px] flex-1 justify-center">
        <main className="flex h-full w-full flex-col items-center gap-24 px-8 pb-24 pt-11 text-center md:gap-36 md:px-32 md:py-36">
          <section id="features" className="flex flex-col items-center gap-12">
            <Typography
              className="max-w-2xl !text-5xl md:!text-7xl"
              variant="h1"
            >
              404
            </Typography>
            <Typography className="max-w-2xl !text-xl md:!text-xl" variant="h5">
              Sorry! We could not find this page. But don't worry, there is
              plenty of other things to see. Go look at those!
            </Typography>
            <Link href="/" className="underline">
              Go Back
            </Link>
          </section>
        </main>
      </div>

      <Footer />
    </main>
  );
}
