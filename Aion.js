// netlify/functions/Aion.js
// AION Brain / Governor — secure server-side Gemini connector.
// Milestone 1 scope: genuine Gemini reasoning + truthful execution states.
// No real tool execution, no persistence, no specialist runtime yet — those are M2–M4.

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `You are AION — an outcome-driven Autonomous Business Operating System.

You are currently running at Milestone 1 (Intelligence Core). At this milestone:
- You have real reasoning ability (this call), but you do NOT have real tools, integrations, memory across sessions, or a working specialist workforce yet.
- You must NEVER claim an action is COMPLETED, published, sent, booked, called, connected, or paid. Nothing can actually execute yet.
- Any "plan" you produce is PLANNED only — a proposal for what the workforce will eventually do once Milestones 3 and 4 exist.
- If the user asks you to actually do something external (publish, send, call, connect), your executionState must be WAITING_FOR_CONNECTION or WAITING_FOR_HUMAN, and you must say plainly that this capability isn't connected yet.
- Be honest about uncertainty. If you don't have enough business context to answer well, say what you don't know and ask a short, useful question.
- Resolve contextual references ("do it", "continue", "handle it") using the conversation history provided.
- Keep "reply" conversational and concise — this is a voice-first product, not a report generator. No walls of text.

You must respond with ONLY valid JSON matching the provided schema. No markdown, no commentary outside the JSON.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    reply: { type: "STRING", description: "Short, natural, conversational response to speak/show to the user." },
    understanding: { type: "STRING", description: "One or two sentences: what AION currently understands about the business/request, including known gaps." },
    objective: {
      type: "OBJECT",
      properties: {
        statement: { type: "STRING", description: "The current business outcome being pursued, or empty string if none yet." },
        successCriteria: { type: "STRING", description: "What would prove the outcome is fulfilled." },
        gap: { type: "STRING", description: "The measurable difference between current state and success, or 'unknown — insufficient context'." }
      },
      required: ["statement", "successCriteria", "gap"]
    },
    plan: {
      type: "ARRAY",
      description: "Proposed next steps. Always PLANNED — never executed at this milestone.",
      items: {
        type: "OBJECT",
        properties: {
          step: { type: "STRING" },
          specialist: { type: "STRING", description: "Which future specialist domain would own this (e.g. Research, Content, Attraction, Prospecting, Qualification, Analytics, Sales, Website, Landing Page, Customer, Appointment, Mission)." },
          status: { type: "STRING", enum: ["PLANNED"] }
        },
        required: ["step", "specialist", "status"]
      }
    },
    executionState: {
      type: "STRING",
      enum: ["UNDERSTANDING", "PLANNED", "WAITING_FOR_APPROVAL", "WAITING_FOR_CONNECTION", "WAITING_FOR_HUMAN", "BLOCKED"],
      description: "Truthful state. Never COMPLETED at this milestone — no real execution capability exists yet."
    },
    nextAction: { type: "STRING", description: "The single highest-value next step, in plain language." }
  },
  required: ["reply", "understanding", "objective", "plan", "executionState", "nextAction"]
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  // Health check
  if (event.httpMethod === "GET") {
    return jsonResponse(200, {
      ok: true,
      message: "AION backend is connected.",
      milestone: "M1",
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
    });
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, errorType: "METHOD_NOT_ALLOWED", error: "Use GET for health check or POST to talk to AION." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, {
      ok: false,
      errorType: "MISSING_CONFIGURATION",
      error: "AI reasoning unavailable — GEMINI_API_KEY is not configured on the server."
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return jsonResponse(400, { ok: false, errorType: "BAD_REQUEST", error: "Request body must be valid JSON." });
  }

  const message = (payload.message || "").toString().trim();
  const businessId = (payload.businessId || "unknown").toString();
  const history = Array.isArray(payload.history) ? payload.history : [];

  if (!message) {
    return jsonResponse(400, { ok: false, errorType: "BAD_REQUEST", error: "No active outcome — message is required." });
  }

  // Build Gemini "contents" from history + new message.
  // history items expected as { role: "user"|"model", text: string }
  const contents = history
    .filter((h) => h && h.text)
    .slice(-20) // keep recent context bounded
    .map((h) => ({
      role: h.role === "model" ? "model" : "user",
      parts: [{ text: String(h.text) }]
    }));

  contents.push({ role: "user", parts: [{ text: message }] });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const requestBody = {
    system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION + `\n\nCurrent businessId: ${businessId}` }] },
    contents,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.6
    }
  };

  let geminiRes;
  try {
    geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
  } catch (networkErr) {
    return jsonResponse(502, {
      ok: false,
      errorType: "GEMINI_UNREACHABLE",
      error: "AI reasoning unavailable — connection required."
    });
  }

  if (!geminiRes.ok) {
    let detail = "";
    try { detail = await geminiRes.text(); } catch (e) {}
    return jsonResponse(502, {
      ok: false,
      errorType: "GEMINI_ERROR",
      error: "AI reasoning unavailable — the model returned an error.",
      status: geminiRes.status,
      detail: detail.slice(0, 500)
    });
  }

  let geminiJson;
  try {
    geminiJson = await geminiRes.json();
  } catch (e) {
    return jsonResponse(502, { ok: false, errorType: "GEMINI_BAD_RESPONSE", error: "AI reasoning unavailable — malformed response." });
  }

  const textOut = geminiJson &&
    geminiJson.candidates &&
    geminiJson.candidates[0] &&
    geminiJson.candidates[0].content &&
    geminiJson.candidates[0].content.parts &&
    geminiJson.candidates[0].content.parts[0] &&
    geminiJson.candidates[0].content.parts[0].text;

  if (!textOut) {
    const blockReason = geminiJson && geminiJson.promptFeedback && geminiJson.promptFeedback.blockReason;
    return jsonResponse(502, {
      ok: false,
      errorType: "GEMINI_EMPTY_RESPONSE",
      error: blockReason ? `AI reasoning blocked: ${blockReason}` : "AI reasoning unavailable — empty response."
    });
  }

  let structured;
  try {
    structured = JSON.parse(textOut);
  } catch (e) {
    return jsonResponse(502, {
      ok: false,
      errorType: "GEMINI_PARSE_ERROR",
      error: "AI reasoning unavailable — response was not valid structured output.",
      raw: textOut.slice(0, 500)
    });
  }

  return jsonResponse(200, {
    ok: true,
    businessId,
    ...structured
  });
};
