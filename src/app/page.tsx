import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";
import { ArrowUpDown, Timer, Workflow } from "lucide-react";
import Link from "next/link";
import { Feature } from "./feature";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PricingCard from "@/components/pricing-card";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/app");
  }

  const pricingTiers = [
    {
      id: "free",
      name: "Free",
      description: "Perfeito para experimentar e começar",
      price: 0,
      features: [
        { description: "100 páginas" },
        { description: "30 mensagens" },
      ],
      cta: "Use gratuitamente",
      isPopular: false,
    },
    {
      id: "starter",
      name: "Starter",
      description: "Para equipas e projetos de menor dimensão",
      price: 25,
      features: [
        {
          description: "10,000 páginas",
          additional: "Páginas adicionais: 0.02€ cada",
        },
        {
          description: "2,500 mensagens",
          additional: "Mensagens adicionais: 0.05€ cada",
        },
      ],
      cta: "Subscreva",
      isPopular: false,
    },
    {
      id: "pro",
      name: "Pro",
      description: "O ideal para a sua empresa em crescimento",
      price: 49,
      features: [
        {
          description: "25,000 páginas",
          additional: "Páginas adicionais: 0.01€ cada",
        },
        {
          description: "7,500 mensagens",
          additional: "Mensagens adicionais: 0.02€ cada",
        },
      ],
      cta: "Subscreva",
      isPopular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Para equipas grandes, com uso avançado",
      price: 199,
      features: [
        {
          description: "100,000 páginas",
          additional: "Páginas adicionais: 0.005€ cada",
        },
        {
          description: "Mensagens ilimitadas",
        },
        {
          description: "Apoio dedicado",
        },
      ],
      cta: "Subscreva Agora",
      isPopular: false,
    },
  ];

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
      headline: "Useintuitivamente",
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
            id="Pricing"
            className="flex min-w-full flex-col items-center gap-8"
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Typography className="max-w-2xl" variant="h1">
                  Preço simples e direto
                </Typography>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Um preço simples e transparente que se adapta às suas
                  necessidades. Todos os planos incluem todas as
                  funcionalidades.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 mt-12 md:grid-cols-2 lg:grid-cols-4">
              {pricingTiers.map((tier) => (
                <PricingCard
                  key={tier.name}
                  id={tier.id}
                  name={tier.name}
                  description={tier.description}
                  price={tier.price}
                  features={tier.features}
                  cta={tier.cta}
                  isPopular={tier.isPopular}
                />
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground">
                Precisa de um plano diferente?{" "}
                <a
                  href="mailto:askjarvas@gmail.com"
                  className="text-primary hover:underline"
                >
                  Contacte-nos
                </a>{" "}
                diretamente.
              </p>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </main>
  );
}
