import { promisify } from "util";
import fs from "fs";
import https from "https";

function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export async function encodeImageToBase64(imagePath: string): Promise<string> {
  try {
    let data: Buffer;

    if (isUrl(imagePath)) {
      // Handle URL
      data = await new Promise<Buffer>((resolve, reject) => {
        https
          .get(imagePath, (response) => {
            const chunks: Buffer[] = [];
            response.on("data", (chunk) => chunks.push(chunk));
            response.on("end", () => resolve(Buffer.concat(chunks)));
          })
          .on("error", reject);
      });
    } else {
      // Handle file path
      const readFile = promisify(fs.readFile);
      data = await readFile(imagePath);
    }

    console.log(`Original file size: ${data.length} bytes`);
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch (error) {
    throw new Error(`Failed to encode image: ${error}`);
  }
}
