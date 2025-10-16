export async function callLLM(messages) {
  const latestMessage = messages[messages.length - 1]?.content || "";

  try {
    const response = await fetch("/api/proxyLLM", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: latestMessage }),
    });

    const data = await response.json();
    return data.response || "No response from AI";
  } catch (err) {
    console.error("Error calling LLM:", err);
    return "⚠️ Something went wrong while fetching the AI response.";
  }
}
