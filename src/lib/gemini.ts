import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (aiInstance) return aiInstance;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // We log the error but don't throw immediately at the top level to avoid blank pages
    console.warn("GEMINI_API_KEY is missing. AI features will be unavailable.");
    return null;
  }
  
  aiInstance = new GoogleGenAI({ apiKey });
  return aiInstance;
}

export async function evaluateAnswer(answer: string) {
  const ai = getAI();
  if (!ai) throw new Error("AI Client not initialized. Please check your API key.");
  
  const model = "gemini-3-flash-preview";
  const prompt = `
    You are an expert interviewer and communication coach.
    Evaluate the following answer to an interview question.
    Provide detailed feedback including:
    - A score out of 10.
    - Key strengths.
    - Areas for improvement/weaknesses.
    - An 'Ideal Answer' version of their response.

    Answer to evaluate: "${answer}"

    Format your response EXACTLY as follows:
    Score: [score]/10
    Strength: [Detailed strength]
    Weakness: [Detailed weakness]
    Ideal Answer: [Your version]
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}

export async function getInterviewQuestion(topic: string, difficulty: string, history: string[] = []) {
  const ai = getAI();
  if (!ai) throw new Error("AI Client not initialized. Please check your API key.");
  
  const model = "gemini-3-flash-preview";
  const prompt = `
    You are a professional technical and behavioral interviewer.
    Current Topic: ${topic}
    Difficulty Level: ${difficulty}
    Previous context/answers: ${history.join("\n")}

    Generate ONE challenging and appropriate interview question for this user.
    Do not provide feedback yet, just the question.
    Format your response as:
    Question: [The question]
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}

export async function evaluateInterviewTurn(answer: string, question: string) {
  const ai = getAI();
  if (!ai) throw new Error("AI Client not initialized. Please check your API key.");
  
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the user's answer to the interview question below.
    Question: "${question}"
    User Answer: "${answer}"

    Provide:
    - Feedback: [Brief, constructive feedback on their answer]
    - Next Question: [A follow-up question related to their answer or the next logical interview question]

    Format your response EXACTLY as follows:
    Feedback: [Your feedback]
    Next Question: [The next question]
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}
