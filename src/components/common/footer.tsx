import Image from "next/image";
import Typography from "../ui/typography";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex w-full items-center justify-center border-t">
      <div className="flex w-full max-w-[1280px] place-content-center px-4 md:px-8">
        <div className="hidden flex-1 gap-x-11 md:flex">
          <div className="md:flex-0 min-w-fit flex-1">
            <Link href="/" className="pointer flex items-center">
              <Image
                src="/jarvas.png"
                alt="Logo"
                width={150}
                height={100}
                style={{ width: "auto", height: "auto" }}
              />
            </Link>
          </div>
        </div>
        <div className="flex max-w-fit items-center gap-x-4">
          <a href="/terms-of-service" className="pointer block w-fit flex-1">
            <Typography variant="p" className="w-max">
              Termos de Serviço
            </Typography>
          </a>
          <a href="/privacy-policy" className="pointer block w-fit">
            <Typography variant="p">Política de Privacidade</Typography>
          </a>
          <a className="pointer block w-fit" href="mailto:founders@jarvas.com">
            <Typography variant="p">Contacte-nos</Typography>
          </a>
        </div>
      </div>
    </footer>
  );
}
