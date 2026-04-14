import fetch from "node-fetch";

export async function callGemini(prompt, apiKey) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log("Gemini Response:", JSON.stringify(data, null, 2));

    if (data.candidates) {
      return data.candidates[0].content.parts[0].text;
    }

    if (data.error) {
      return "❌ " + data.error.message;
    }

    return "No response from AI";

  } catch (error) {
    return "❌ API Error";
  }
}