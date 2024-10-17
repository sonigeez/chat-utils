import type { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";
import type { Tool } from "../utils/types";
import { CommandExecutor } from "./commandExecuter";
import { MoveMouse } from "./moveMouse";
import { ScreenshotTool } from "./screenshotTool";
import { ImageAnalyzer } from "./analyzeImage";
import { AnnotateImage } from "./annotateImage";

const tools: Record<string, new () => Tool> = {
  executeCommand: CommandExecutor,
  moveMouse: MoveMouse,
  takeScreenshot: ScreenshotTool,
  analyzeImage: ImageAnalyzer,
  annotateImage: AnnotateImage,
};

export async function handleTool(
  toolCall: ChatCompletionMessageToolCall
): Promise<string> {
  const ToolClass = tools[toolCall.function.name];
  if (!ToolClass) {
    throw new Error(`Unknown tool: ${toolCall.function.name}`);
  }

  const toolInstance = new ToolClass();
  const args = JSON.parse(toolCall.function.arguments);
  return await toolInstance.run(args);
}
