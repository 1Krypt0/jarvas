import { env } from "@/env";
import { Resend } from "resend";

export const from = "noreply@askjarvas.com";
export const resend = new Resend(env.RESEND_API_KEY);

export const createEmailTemplate = (
  title: string,
  description: string,
  footer: string,
  url?: string,
  urlText?: string,
) => `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
</head>
<body style="background-color: #FFE5E0; margin: 0; padding: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
    <center style="width: 100%;">
        <div style="max-width: 600px; margin: 0 auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 40px 0 20px; text-align: center;">
                        <h1 style="color: #4A1A0D; margin: 0; font-size: 32px;">Jarvas</h1>
                    </td>
                </tr>
            </table>
            <table style="width: 100%; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 16px rgba(0,0,0,0.1);">
                <tr>
                    <td>
                        <h2 style="color: #4A1A0D; margin-top: 0;">${title}</h2>
                        <p style="color: #666; line-height: 1.6;">${description}</p>

                        ${
                          url
                            ? `<div style="padding: 16px; border-radius: 8px; margin: 24px 0; text-align: center;">
                            <a href="${url}" style="background-color: #4A1A0D; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0; font-weight: 500;">
                           ${urlText}
                        </a>
                        </div>`
                            : ""
                        }

                    </td>
                </tr>
            </table>

            <!-- Footer -->
            <table style="width: 100%; margin-top: 24px;">
                <tr>
                    <td style="text-align: center; color: #999; font-size: 14px;">
                        <p style="margin: 8px 0;">${footer}</p>
                    </td>
                </tr>
            </table>
        </div>
    </center>
</body>
</html>`;

export const warnUserLimit = async (
  email: string,
  type: "page" | "message",
  amount: number,
) => {
  const resource = type === "page" ? "Páginas" : "Mensagens";
  await resend.emails.send({
    from,
    to: email,
    subject: `Atingiu ${amount}% do seu limite de utilização de ${resource}`,
    html: createEmailTemplate(
      "Está prestes a atingir o limite!",
      `Reparamos que atingiu ${amount}% do seu limite de ${resource} para este mês. Estamos a enviar este e-mail para o relembrar que, atingindo os 100%, qualquer uso extra irá incorrer custos adicionais.`,
      `Precisa de ajuda? Contacte a nossa <a href="askjarvas@gmail.com" style="color: #4A1A0D; text-decoration: none;">equipa de apoio.</a>`,
    ),
  });
};
