import { createClient } from "@sanity/client";

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      const { question } = await request.json();

      if (!question) {
        return new Response(
          JSON.stringify({ error: "Question is required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const sanity = createClient({
        projectId: env.SANITY_PROJECT_ID,
        dataset: env.SANITY_DATASET || "production",
        apiVersion: "2026-03-01",
        useCdn: false,
        token: env.SANITY_API_READ_TOKEN,
      });

      const knowledge = await sanity.fetch(
        `*[_type == "knowledge" && (
          title match $search ||
          content match $search
        )][0...10]{
          title,
          content,
          category
        }`,
        {
          search: `*${question}*`,
        }
      );

      const context = knowledge
        .map(
          (item) =>
            `Title: ${item.title || ""}
Category: ${item.category || ""}
Content: ${item.content || ""}`
        )
        .join("\n\n");

      const prompt = `You are a helpful AI assistant.

Use the Sanity Knowledge Base context to answer the user's question.

Knowledge Base:
${context || "No matching knowledge was found."}

Question:
${question}

If the Knowledge Base does not contain enough information, clearly say so instead of inventing information.`;

      if (!env.GEMINI_API_KEY) {
        return new Response(
          JSON.stringify({
            error: "GEMINI_API_KEY is missing in Cloudflare.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      const data = await geminiRes.json();

      if (!geminiRes.ok) {
        return new Response(
          JSON.stringify({
            error: "Gemini API request failed",
            details: data,
          }),
          {
            status: geminiRes.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const answer =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No answer generated.";

      return new Response(JSON.stringify({ answer }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Agent error:", error);

      return new Response(
        JSON.stringify({
          error: "AI request failed",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};