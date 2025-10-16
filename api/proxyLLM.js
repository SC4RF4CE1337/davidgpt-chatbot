// api/proxyLLM.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { question } = req.body;

  if (!question || question.trim() === "") {
    return res.status(400).json({ response: "Question is required." });
  }

  try {
    // Use environment variable for your backend
    const backendUrl = process.env.LLM_BACKEND_URL;

    if (!backendUrl) {
      return res.status(500).json({ response: "Backend URL not configured." });
    }

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend returned status ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    res.status(200).json({ response: data.response });
  } catch (err) {
    console.error("Error calling backend:", err);
    res.status(500).json({ response: "⚠️ Something went wrong fetching AI response." });
  }
}
