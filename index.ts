import { ChatService } from "./chatService";

async function main() {
	const chatService = new ChatService();
	await chatService.processUserInput(
		"tell what is name of this current directory",
	);
}

main().catch(console.error);
