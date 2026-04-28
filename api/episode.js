import OpenAI from "openai";

export default async function handler(req, res) {
  // --- CORS HEADERS ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // --- HANDLE PREFLIGHT ---
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // --- ONLY ALLOW POST ---
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const { prompt } = req.body;

    const completion = await client.chat.completions.create({
      model: process.env.MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "Return ONLY valid JSON." },
        { role: "user", content: prompt }
      ]
    });

    const text = completion.choices[0].message.content;

    // Ensure JSON
    const json = JSON.parse(text);

    return res.status(200).json(json);
  } catch (err) {
    console.error("Episode API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
