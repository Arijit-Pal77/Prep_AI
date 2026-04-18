import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function evaluateAnswer(answer: string) {
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

export async function generateExplanation(content: string, language: "English" | "Hindi" = "English", mode: "Normal" | "ELI10" | "Exam" = "Normal") {
  const model = "gemini-3-flash-preview";
  
  const modeInstruction = mode === "ELI10" 
    ? "Explain like I'm 10 years old (ELI5/ELI10 style), using very simple metaphors and no complex jargon." 
    : mode === "Exam" 
    ? "Focus strictly on exam-ready points, definitions, and technical accuracy." 
    : "Provide a balanced, clear academic explanation.";

  const prompt = `
    You are an expert teacher who explains academic topics in the simplest possible way.
    Language: ${language}
    Mode: ${modeInstruction}

    Rules:
    - Always explain in simple language
    - Avoid jargon unless necessary (explain it if used)
    - Use relatable examples
    - Structure output strictly using the following headings:

    1. Simple Explanation
    2. Key Concepts (bullet points)
    3. Real-life Examples
    4. Important Points for Exams
    5. Short Summary

    Content/Topic to explain: "${content}"

    If the language is Hindi, translate everything clearly into Hindi.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}
