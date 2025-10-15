// src/callLLM.js
export async function callLLM(messages) {
  const latestMessage = messages[messages.length - 1].content;

  try {
    const response = await fetch("/.netlify/functions/proxyLLM", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: latestMessage,
        context: messages.map((m) => m.content).join(" "),
      }),
    });

    const data = await response.json();
    return data.response || "No response from the AI.";
  } catch (err) {
    console.error("Error calling LLM:", err);
    return "⚠️ Something went wrong while fetching the response.";
  }
}
