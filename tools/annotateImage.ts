import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import type { Tool } from "../utils/types";
import https from "https";

import type { ChatCompletionTool } from "openai/resources/index.mjs";

function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

async function fetchImageBuffer(imageSource: string): Promise<Buffer> {
  if (isUrl(imageSource)) {
    return new Promise<Buffer>((resolve, reject) => {
      https
        .get(imageSource, (response) => {
          const chunks: Buffer[] = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () => resolve(Buffer.concat(chunks)));
        })
        .on("error", reject);
    });
  } else {
    return fs.readFile(imageSource);
  }
}

export class AnnotateImage implements Tool {
  async run(args: { image: string; boundings: number[] }): Promise<string> {
    const { image, boundings } = args;

    try {
      const inputBuffer = await fetchImageBuffer(image);
      const metadata = await sharp(inputBuffer).metadata();
      const width = metadata.width ?? 0;
      const height = metadata.height ?? 0;

      if (width === 0 || height === 0) {
        throw new Error("Failed to get image dimensions");
      }

      const svg = this.createSvgWithBoundingBoxes(boundings, width, height);

      const outputBuffer = await sharp(inputBuffer)
        .composite([
          {
            input: Buffer.from(svg),
            top: 0,
            left: 0,
          },
        ])
        .toBuffer();

      // Save the annotated image
      const outputPath = path.join(
        path.dirname(isUrl(image) ? "." : image),
        `annotated.jpg`
      );
      await fs.writeFile(outputPath, outputBuffer);

      return `Annotated image saved as ${outputPath}`;
    } catch (error) {
      console.error("Error annotating image:", error);
      throw new Error("Failed to annotate image");
    }
  }

  private createSvgWithBoundingBoxes(
    boundings: number[],
    width: number,
    height: number
  ): string {
    const svgRects = boundings.reduce((acc, _, index, array) => {
      if (index % 4 === 0) {
        const [x, y, w, h] = array.slice(index, index + 4);
        acc += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="red" stroke-width="2"/>`;
      }
      return acc;
    }, "");

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${svgRects}
      </svg>
    `;
  }
}

// tool definition
export const annotateImageToolDefinition: ChatCompletionTool = {
  type: "function",
  function: {
    name: "annotateImage",
    description: "Annotate an image with bounding boxes",
    parameters: {
      type: "object",
      properties: {
        image: {
          type: "string",
          description: "The image to annotate",
        },
        boundings: {
          type: "array",
          description:
            "An array of bounding boxes in the format [ymin, xmin, ymax, xmax]",
          items: {
            type: "number",
          },
        },
      },
      required: ["image", "boundings"],
    },
  },
};
