import { createClient } from "@sanity/client";

const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2026-03-01",
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question } = req.body || {};

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // Search Knowledge Base in Sanity
    const knowledge = await sanity.fetch(
      `*[_type == "knowledge" && (
        title match $search ||
        content match $search
      )][0...10]{
        title,
        content,
        category
      }`,
      { search: `*${question}*` }
    );

    const context = knowledge
      .map(
        (item) =>
          `Title: ${item.title}\nCategory: ${item.category || ""}\nContent: ${
            item.content || ""
          }`
      )
      .join("\n\n");

    // OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI assistant. Answer using the provided Sanity Knowledge Base context. If the context does not contain enough information, clearly say that.",
          },
          {
            role: "user",
            content: `Knowledge Base:\n${context}\n\nQuestion: ${question}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(response.status).json({
        error: "OpenAI request failed",
        details: data,
      });
    }

    const answer = data.choices?.[0]?.message?.content;

    return res.status(200).json({
      answer: answer || "No answer generated.",
    });
  } catch (error) {
    console.error("Agent error:", error);

    return res.status(500).json({
      error: "AI request failed",
    });
  }
}