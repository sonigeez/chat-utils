import dotenv from "dotenv";

dotenv.config();

console.log(process.env.OPENAI_API_KEY);
export const CONFIG = {
	OPENAI_API_KEY: process.env.OPENAI_API_KEY,
	MODEL: process.env.MODEL,
};
