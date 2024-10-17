import { exec } from "node:child_process";
import { promisify } from "util";
import sharp from "sharp";
import fs from "fs";
import type { Tool } from "../utils/types";
import type { ChatCompletionTool } from "openai/resources/index.mjs";
import { getScreenResolution } from "../utils/getScreenResolution";

const execAsync = promisify(exec);

export class ScreenshotTool implements Tool {
  async run(): Promise<string> {
    try {
      const timestamp = Date.now();
      const originalFilename = `screenshot_${timestamp}.png`;
      const modifiedFilename = `screenshot_modified_${timestamp}.png`;
      const command = `screencapture -x ${originalFilename}`;
      await execAsync(command);
      return originalFilename;
      const image = sharp(originalFilename);
      const metadata = await image.metadata();

      const width = metadata.width || 0;
      const height = metadata.height || 0;

      // Draw lines
      const lineThickness = 2;
      const horizontalLines = 10;
      const verticalLines = 10;

      const svgLines = [];
      const svgNumbers = [];

      const boxWidth = width / verticalLines;
      const boxHeight = height / horizontalLines;
      const fontSize = Math.min(boxWidth, boxHeight) * 0.5;

      // Draw horizontal lines
      for (let i = 1; i < horizontalLines; i++) {
        const y = (i * height) / horizontalLines;
        svgLines.push(
          `<rect x="0" y="${
            y - lineThickness / 2
          }" width="${width}" height="${lineThickness}" fill="red" />`
        );
      }

      // Draw vertical lines
      for (let i = 1; i < verticalLines; i++) {
        const x = (i * width) / verticalLines;
        svgLines.push(
          `<rect x="${
            x - lineThickness / 2
          }" y="0" width="${lineThickness}" height="${height}" fill="red" />`
        );
      }

      // Add centered numbers
      for (let i = 0; i < horizontalLines; i++) {
        for (let j = 0; j < verticalLines; j++) {
          const number = i * verticalLines + j + 1;
          if (number <= 100) {
            const x = (j + 0.5) * boxWidth;
            const y = (i + 0.5) * boxHeight;
            svgNumbers.push(
              `<text x="${x}" y="${y}" fill="red" font-size="${fontSize}px" 
              text-anchor="middle" dominant-baseline="central">${number}</text>`
            );
          }
        }
      }

      const svg = `
        <svg width="${width}" height="${height}">
          ${svgLines.join("\n")}
          ${svgNumbers.join("\n")}
        </svg>
      `;
      const svgBuffer = Buffer.from(svg);

      await image
        .composite([{ input: svgBuffer, blend: "over" }])
        .toFile(modifiedFilename);
      fs.unlinkSync(originalFilename);
      const resolution = await getScreenResolution();
      console.log(resolution);
      const message = `Screenshot taken and saved as ${modifiedFilename}. `;

      return message;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error taking screenshot: ${error.message}`);
      } else {
        throw new Error(`Error taking screenshot: ${String(error)}`);
      }
    }
  }
}

export const screenshotToolDefinition: ChatCompletionTool = {
  type: "function",
  function: {
    name: "takeScreenshot",
    description:
      "Takes a screenshot of the current window and returns it as a base64 encoded string",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};
