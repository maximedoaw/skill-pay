import { NextRequest, NextResponse } from "next/server";

const MODEL = "gemini-2.5-flash";

// System instructions pour l'assistant SkillPay
const SKILLPAY_SYSTEM_INSTRUCTION = `
Tu es "SkillPay AI Assistant", l'assistant virtuel officiel de la plateforme SkillPay au Cameroun.
Tu es accueillant, précis, professionnel et tu maîtrises parfaitement l'écosystème de paiement SkillPay.

Informations clés sur SkillPay :
1. **Mission** : SkillPay est une plateforme d'intégration unifiée au Cameroun qui permet d'accepter les paiements Mobile Money (Orange Money et MTN MoMo) via une seule API REST et un seul tableau de bord.
2. **Opérateurs supportés** :
   - Orange Money (intégration Web Payment)
   - MTN Mobile Money (API Collection)
3. **Fonctionnalités principales** :
   - API unifiée pour les développeurs.
   - Tableau de bord en temps réel.
   - Webhooks automatisés et notifications SMS (via Twilio).
   - Réconciliation automatique des paiements en attente.
4. **Processus d'Onboarding & Sécurité** :
   - Création de compte via Clerk.
   - Soumission des documents légaux (CNI / Passeport, Registre du Commerce RCCM).
   - Validation par l'équipe d'administration dans la console /admin avant activation des clés API (sk_pub_...).
5. **Directives de réponse** :
   - Réponds toujours en français.
   - Adopte un ton professionnel, clair, chaleureux et structuré (style Notion).
   - Utilise des listes à puces et du gras pour faciliter la lecture.
   - Si une question sort du périmètre de SkillPay, redirige poliment vers le support ou la documentation.
`.trim();

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("La variable GEMINI_API_KEY est manquante dans l'environnement.");
  }
  return apiKey;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, prompt } = body;

    const apiKey = getApiKey();

    // Tente l'import dynamique de @google/genai si présent
    let responseText = "";

    try {
      const { GoogleGenAI } = require("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      
      const contents = Array.isArray(messages) && messages.length > 0
        ? messages.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          }))
        : prompt || "Bonjour, présentations ?";

      const response = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction: SKILLPAY_SYSTEM_INSTRUCTION,
        },
      });

      responseText = response.text || "Désolé, je n'ai pas pu générer de réponse.";
    } catch (sdkError) {
      // Fallback direct sur l'API REST v1beta Gemini si l'import SDK a un souci
      console.warn("[Gemini API] SDK non disponible, utilisation du fallback REST HTTP direct...");
      
      const userPrompt = Array.isArray(messages) && messages.length > 0
        ? messages[messages.length - 1].content
        : prompt || "Bonjour";

      const restEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const res = await fetch(restEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: `${SKILLPAY_SYSTEM_INSTRUCTION}\n\nQuestion de l'utilisateur : ${userPrompt}` }
              ]
            }
          ]
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Erreur de communication avec l'API Gemini REST.");
      }

      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, aucune réponse disponible.";
    }

    return NextResponse.json({ reply: responseText });
  } catch (error: any) {
    console.error("[Gemini Route Error]:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Erreur interne lors de la communication avec l'assistant AI." },
      { status: 500 }
    );
  }
}
