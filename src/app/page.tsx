import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ArrowUpDown, Check, Info, Timer, Workflow } from "lucide-react";
import Link from "next/link";
import { Feature } from "./feature";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/app");
  }

  const features = [
    {
      icon: Timer,
      headline: "Obtenha Respostas",
      description:
        "Navegue na sua documentação mais rapidamente e encontre a informação que procura instantaneamente. Torne minutos de procura em segundos de espera",
    },
    {
      icon: ArrowUpDown,
      headline: "Nativamente Português",
      description:
        "Use um sistema capaz de interpretar documentos em português de Portugal e responder de forma apropriada, citando todas as fontes que usou",
    },
    {
      icon: Workflow,
      headline: "Use intuitivamente",
      description:
        "O Jarvas faz uso de uma interface já comum a todos os que já interagiram com Inteligência Artificial. Não vai ter problemas em adaptar-se a esta nova ferramenta.",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col">
      <Header />

      <div className="mx-auto flex h-full w-full max-w-[1280px] flex-1 justify-center">
        <main className="flex h-full w-full flex-col items-center gap-24 px-8 pb-24 pt-11 text-center md:gap-36 md:px-32 md:py-36">
          <section id="features" className="flex flex-col items-center gap-12 ">
            <Typography
              className="max-w-2xl !text-5xl md:!text-8xl"
              variant="h1"
            >
              Um assistente pessoal para a sua empresa
            </Typography>
            <Typography
              className="max-w-2xl !text-xl md:!text-2xl"
              variant="h5"
            >
              Simplifique o acesso à informação importante para si com o poder
              da Inteligência Artifical.
            </Typography>
            <Button size="lg" asChild>
              <Link href="/register">Aderir Agora</Link>
            </Button>
            {/* {/* TODO: Add video explaining how to use it */}
            {/* <Image */}
            {/*   alt="Jarvas hero" */}
            {/*   src="/hero1.png" */}
            {/*   width={1024} */}
            {/*   height={632} */}
            {/* /> */}
          </section>

          <section className="flex flex-col items-center gap-12">
            <Typography className="max-w-2xl" variant="h1">
              Tudo o que precisa, sem esforço adicional
            </Typography>
            <div className="flex flex-col gap-8 lg:flex-row">
              {features.map((feature, idx) => {
                return (
                  <Feature
                    icon={<feature.icon className="size-6" />}
                    headline={feature.headline}
                    description={feature.description}
                    key={idx}
                  />
                );
              })}
            </div>
          </section>

          <section
            id="pricing"
            className="flex min-w-full flex-col items-center gap-8"
          >
            <Typography className="max-w-2xl" variant="h1">
              Preço simples e direto
            </Typography>

            <Card className="w-72">
              <CardHeader className="text-start">
                <div className="text-center">
                  <span className="text-5xl font-bold">49€</span>
                  <span className="text-gray-500 dark:text-gray-400">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      10 Documentos
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Documentos adicionais: 0.10€ cada</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      100 Mensagens
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mensagens adicionais: 0.05€ cada</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    Apoio 24/7
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    Atualizações regulares
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <Link href="/register">Começar Agora</Link>
                </Button>
              </CardFooter>
            </Card>
          </section>
        </main>
      </div>

      <Footer />
    </main>
  );
}
