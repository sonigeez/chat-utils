import type { ChatCompletionTool } from "openai/resources/index.mjs";
import robot from "@jitsi/robotjs";

import type { Tool } from "../utils/types";

export class MoveMouse implements Tool {
  async run(args: { x: number; y: number }): Promise<string> {
    console.log(args);
    robot.moveMouse(args.x, args.y);
    return "Mouse moved successfully";
  }
}

export const moveMouseToolDefinition: ChatCompletionTool = {
  type: "function",
  function: {
    name: "moveMouse",
    description: "Moves the mouse to the specified coordinates",
    parameters: {
      type: "object",
      properties: {
        x: {
          type: "number",
          description: "The x coordinate",
        },
        y: {
          type: "number",
          description: "The y coordinate",
        },
      },
      required: ["x", "y"],
    },
  },
};
