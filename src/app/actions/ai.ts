"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemSettingsAction } from "./settings";
import { createClient } from "@/utils/supabase/server";

export async function generateBlogContentAction(theme: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    // Get settings
    const { settings, error: settingsError } = await getSystemSettingsAction();

    if (settingsError || !settings?.gemini_api_key) {
        return { error: "Configurações de AI não encontradas. Por favor, configure a Gemini API Key nas Definições." };
    }

    try {
        const apiKey = settings.gemini_api_key.trim();

        // Fetch available models first to avoid 404 on deprecated models
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        let targetModelStr = "gemini-2.5-flash"; // Default to a modern one

        if (modelsRes.ok) {
            const data = await modelsRes.json();
            if (data.models && Array.isArray(data.models)) {
                // Find a suitable flash model. Prefer newer ones.
                const models = data.models.map((m: any) => m.name.replace('models/', ''));
                if (models.includes("gemini-3.0-flash")) targetModelStr = "gemini-3.0-flash";
                else if (models.includes("gemini-2.5-flash")) targetModelStr = "gemini-2.5-flash";
                else if (models.includes("gemini-2.0-flash")) targetModelStr = "gemini-2.0-flash";
                else if (models.includes("gemini-1.5-flash")) targetModelStr = "gemini-1.5-flash";
                else {
                    // Fallback to the first available generateContent model that is a gemini model
                    const fallback = data.models.find((m: any) => m.supportedGenerationMethods?.includes("generateContent") && m.name.includes("gemini"));
                    if (fallback) {
                        targetModelStr = fallback.name.replace('models/', '');
                    }
                }
            }
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: targetModelStr });

        const prompt = `
            És um redator profissional especializado em lifestyle náutico e sustentabilidade para a marina GreenBreeze.
            O teu objetivo é escrever um artigo de blog cativante sobre o tema: "${theme}".
            
            Tom de voz: ${settings.brand_tone || "Sofisticado, sustentável e profissional"}.
            Palavras-chave SEO a incluir: ${settings.seo_keywords || "marina, sustentabilidade, navegação sustentável"}.
            
            Regras de Escrita:
            1. Usa Português de Portugal (PT-PT).
            2. Estrutura o texto com títulos (H1 para o título, H2/H3 para seções).
            3. Responde APENAS em formato JSON com a seguinte estrutura:
               {
                 "title": "Título sugerido do artigo",
                 "content": "Conteúdo completo em HTML (vários parágrafos, subtítulos, etc.)",
                 "category": "Marina, Lifestyle, Eventos ou Dicas"
               }
            4. O conteúdo deve ser rico, detalhado e focado em SEO e GEO (LLM SEO).
            5. Não uses blocos de código markdown (\`\`\`), envia apenas o JSON cru.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up response if it has markdown blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : text;

        const data = JSON.parse(cleanJson);
        return { data };
    } catch (error: any) {
        console.error("Gemini AI Error:", error);

        try {
            const apiKey = settings?.gemini_api_key?.trim();
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await res.json();
            const models = data.models ? data.models.map((m: any) => m.name.replace('models/', '')).join(', ') : JSON.stringify(data);
            return { error: `Erro de modelo. Detalhe: ${error.message}. Modelos disponíveis: ${models}` };
        } catch (e) {
            return { error: `Erro ao comunicar com a inteligência artificial. Detalhe: ${error.message}` };
        }
    }
}
