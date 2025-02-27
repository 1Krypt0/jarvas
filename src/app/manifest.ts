import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jarvas - O assistente pessoal da sua empresa",
    short_name: "Ask Jarvas",
    description:
      "Use a informação da sua empresa como um ativo com o qual pode falar",
    categories: ["productivity", "business", "utilities"],
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#ffebe5",
    icons: [
      {
        src: "icon.svg",
        sizes: "any",
      },
    ],
  };
}
