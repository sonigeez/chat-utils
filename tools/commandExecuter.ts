import { exec } from "node:child_process";
import { promisify } from "util";
import type { Tool } from "../utils/types";
import type { ChatCompletionTool } from "openai/resources/index.mjs";

const execAsync = promisify(exec);

export class CommandExecutor implements Tool {
  async run(args: { command: string }): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(args.command);
      if (stderr) {
        console.warn(`Command produced stderr output: ${stderr}`);
      }
      console.log(stdout);
      return stdout.trim();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error executing command: ${error.message}`);
      } else {
        throw new Error(`Error executing command: ${String(error)}`);
      }
    }
  }
}

// tool definition
export const commandExecutorToolDefinition: ChatCompletionTool = {
  type: "function",
  function: {
    name: "executeCommand",
    description: "Executes a shell command and returns the output",
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The command to execute",
        },
      },
      required: ["command"],
    },
  },
};
