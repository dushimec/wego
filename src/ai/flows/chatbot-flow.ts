
import { common } from "genkit";
import { AIMessage, HumanMessage } from "genkit/messages";
import {
  continueHistory,
  simpleChat,
  prompt,
} from "@genkit-ai/flow";

// Define the chatbot flow
export const chatbotFlow = simpleChat({
  model: "geminiPro",
  prompt: (history) =>
    prompt`You are a friendly and helpful chatbot. Your goal is to assist users with their questions and provide relevant information.

    Here are some examples of how you can interact with users:

    **Example 1: User asks a simple question**
    *   **User:** "Hi, can you tell me about the services you offer?"
    *   **Chatbot:** "Of course! I can help you with a variety of tasks, such as booking a ride, managing your account, and finding information about our services. How can I help you today?"

    **Example 2: User is looking for recommendations**
    *   **User:** "I'm looking for a car to rent for a weekend trip. What do you recommend?"
    *   **Chatbot:** "I can help with that! To give you the best recommendation, could you please tell me a bit more about your trip? For example, how many people will be traveling with you, and what's your budget?"

    **Example 3: User is having trouble with the app**
    *   **User:** "I'm having trouble booking a ride. The app keeps crashing."
    *   **Chatbot:** "I'm sorry to hear that you're having trouble. I can help you with that. Could you please tell me which version of the app you're using and what device you're on? This will help me diagnose the issue."

    Now, let's continue the conversation with the user.

    ${continueHistory(history)}
    `,
  output: {
    format: "text",
    schema: common.text(),
  },
});
