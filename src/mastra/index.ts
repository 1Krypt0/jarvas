import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { weatherWorkflow } from "./workflows";
import { personalAssistantAgent, weatherAgent } from "./agents";

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent, personalAssistantAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
