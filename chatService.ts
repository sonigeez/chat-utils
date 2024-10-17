import { OpenAI } from "openai";
import { CONFIG } from "./utils/config";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { commandExecutorToolDefinition } from "./tools/commandExecuter";
import { moveMouseToolDefinition } from "./tools/moveMouse";
import { handleTool } from "./tools/toolCallHandler";
import { analyzeImageToolDefinition } from "./tools/analyzeImage";
import { annotateImageToolDefinition } from "./tools/annotateImage";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

export class ChatService {
	private client: OpenAI;
	private chats: ChatCompletionMessageParam[];
	private tools: ChatCompletionTool[];

	constructor() {
		this.client = new OpenAI({
			apiKey: CONFIG.OPENAI_API_KEY,
		});
		this.chats = [
			{
				role: "system",
				content:
					"You are a helpful assistant. You can take screenshots, analyze images, screenshot.",
			},
		];
		this.tools = [
			commandExecutorToolDefinition,
			moveMouseToolDefinition,
			analyzeImageToolDefinition,
			annotateImageToolDefinition,
		];
	}

	async processUserInput(userInput: string, imageBase64?: string) {
		this.chats.push({
			role: "user",
			content: imageBase64
				? [
						{ type: "text", text: userInput },
						{
							type: "image_url",
							image_url: {
								url: imageBase64,
							},
						},
					]
				: [{ type: "text", text: userInput }],
		});

		let response = await this.client.chat.completions.create({
			model: CONFIG.MODEL ?? "gpt-4o-2024-08-06",
			tools: this.tools,
			messages: this.chats,
		});
		console.log(JSON.stringify(response));

		this.chats.push(response.choices[0].message);
		console.log(response.choices[0].message.content);

		let toolCalls = response.choices[0].message.tool_calls ?? [];

		while (toolCalls.length > 0) {
			// Handle all tool calls
			for (const toolCall of toolCalls) {
				const toolResponse = await handleTool(toolCall);

				this.chats.push({
					role: "tool" as const,
					content: toolResponse,
					tool_call_id: toolCall.id,
				});
			}

			// Make the next API call after handling all tool calls
			response = await this.client.chat.completions.create({
				model: CONFIG.MODEL ?? "gpt-4o-2024-08-06",
				messages: this.chats,
				tools: this.tools,
			});
			console.log(JSON.stringify(response));
			this.chats.push(response.choices[0].message);
			toolCalls = response.choices[0].message.tool_calls ?? [];
		}
	}
}
