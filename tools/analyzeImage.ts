import { OpenAI } from "openai";
import { encodeImageToBase64 } from "../utils/encodeImageToBase64";
import { type Tool } from "../utils/types";
import { CONFIG } from "../utils/config";
import type { ChatCompletionTool } from "openai/resources/index.mjs";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: CONFIG.OPENAI_API_KEY,
});

export class ImageAnalyzer implements Tool {
  async run(args: { image: string; prompt: string }): Promise<string> {
    console.log(args);
    const image = args.image;
    const prompt = args.prompt;
    const base64Image = await encodeImageToBase64(image);
    let response = await client.chat.completions.create({
      model: CONFIG.MODEL,
      messages: [
        {
          role: "system",
          content: `You are an AI assistant to help people with their image analysis needs. you need to respond with bounding boxes of target mentioned in format [ymin, xmin, ymax, xmax]`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      temperature: 0,
    });
    console.log(response);

    const coordinates = response.choices[0].message.content ?? "";
    return coordinates;
  }
}

// tool definition
export const analyzeImageToolDefinition: ChatCompletionTool = {
  type: "function",
  function: {
    name: "analyzeImage",
    description: "Analyze an image and return a response based on the prompt",
    parameters: {
      type: "object",
      properties: {
        image: {
          type: "string",
          description: "The image to analyze",
        },
        prompt: {
          type: "string",
          description: "The prompt to use for analysis",
        },
      },
      required: ["image", "prompt"],
    },
  },
};
