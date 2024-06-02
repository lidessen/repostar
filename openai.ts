import { load } from "@std/dotenv";
import { AzureOpenAI } from "openai";

const env = await load();

const openai = new AzureOpenAI({
  apiKey: env["AZURE_OPENAI_API_KEY"],
  endpoint: env["AZURE_OPENAI_ENDPOINT"],
  apiVersion: env["AZURE_OPENAI_API_VERSION"],
  deployment: env["AZURE_OPENAI_DEPLOYMENT"],
});

export async function repoTags(repos: unknown[]) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text:
            "Generate tags for these GitHub repositories based on their name, description, and language. Return plain JSON text with the repository name as the key and an array of tags as the value. Do not use ```json``` code blocks.",
        },
        {
          type: "text",
          text: "Repository list:",
        },
        {
          type: "text",
          text: JSON.stringify(repos),
        },
      ],
    }],
    model: "gpt-4o-2024-05-13",
  });

  return chatCompletion.choices[0].message.content;
}
