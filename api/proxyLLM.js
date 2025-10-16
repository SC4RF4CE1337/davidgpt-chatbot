// api/proxyLLM.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { question } = req.body;

  // Use the environment variable for your backend URL
  const apiUrl = process.env.LLM_BACKEND_URL; 
  // In Vercel dashboard, set LLM_BACKEND_URL = "http://16.176.51.19:8000/api/generate"

  try {
    const backendResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await backendResponse.json();
    res.status(200).json({ response: data.response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ response: "⚠️ Something went wrong while fetching the AI response." });
  }
}
