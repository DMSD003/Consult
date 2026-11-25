import  { GoogleGenAI, Type } from '@google/genai';
import { ExtractedNeeds } from '../repositories/analyse.repository';
import { newAnalyseData } from '../services/analyse.service';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("The Gemeini API KEY is missing");
}
export const ai = new GoogleGenAI({apiKey: apiKey});

// =============== AI functions for the App ========================

// 1- Generate a project title when missing
export const generateTitle = async (description: string): Promise<string> => {
    const prompt = `Tu est un architecte logiciel ou un ingénieur des exigences, à partir de ${description}, créé un titre adapté à ce projet avec une llongeur de  trois mots au maximum. 
    La réponse doit être de type texte ou string uniquement, n'ajoute aucune expilcation, aucun commentaire, aucun texte avant et après le titre de type string, répond uniquement avec ce titre de type chaine de caractère ou string
`;
    let response
    try {
        response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
                candidateCount: 1
            }
        });
    } catch (error) {
        console.error("Project Title generation ERROR: ",error);
    }
    const text = response?.text;
    if (typeof(text) === "undefined") {
        console.error("THE SUGGESTED TITLE HASN'T THE CORRECT TYPE");
        return "Untitled Message";
    } 
    return text;
}

// 2- Retrieve the extracted needs of a project
export const extractNeeds =  async (data: newAnalyseData): Promise<ExtractedNeeds | string> => {
    const prompt = `Tu est un architecte logiciel ou un ingénieur des exigences, à partir de ${data} créé un JSON valide qui
        respecte le format de  project: {
        name: string | null;
        summary: string;                     // résumé en 1-2 phrases
        type: "web_app" | "mobile_app" | "desktop_app" | "game" | "api_backend"
            | "cli_tool" | "data_ml" | "iot_embedded" | "other";
        typeDetail: string | null;           // précision si type = "other"
        sector: string | null;               // e-commerce, santé, éducation...
        stage: "idea" | "prototype" | "mvp" | "production_rewrite" | null;
        platforms: ("web" | "ios" | "android" | "windows" | "macos" | "linux")[];
        };

        scale: {
        expectedUsers: number | null;        // utilisateurs totaux prévus
        concurrentUsers: number | null;      // pic simultané
        growthExpectation: "stable" | "moderate" | "fast" | "unknown";
        dataVolume: "small" | "medium" | "large" | "unknown";
        traffic: Level | null;
        };

        features: {
        name: string;                        // "authentification", "paiement"...
        priority: Priority;
        }[];

        technicalRequirements: {
        realtime: boolean | null;            // chat, notifications live, jeu
        offlineSupport: boolean | null;
        authentication: ("email_password" | "oauth" | "sso" | "none")[];
        payments: boolean | null;
        fileStorage: boolean | null;
        search: boolean | null;
        aiFeatures: boolean | null;
        seo: boolean | null;
        multiLanguage: boolean | null;
        thirdPartyIntegrations: string[];    // "Stripe", "Google Maps"...
        dataModel: "relational" | "document" | "graph" | "timeseries" | "unknown";
        performanceCritical: boolean | null;
        };

        security: {
        sensitiveData: boolean | null;
        compliance: ("rgpd" | "hipaa" | "pci_dss" | "other")[];
        securityLevel: Level | null;
        };

        constraints: {
        budget: {
        level: "none" | "low" | "medium" | "high" | null;
        amount: number | null;
        currency: string | null;           // "EUR", "XAF"
        period: "one_time" | "monthly" | "yearly" | null;
        };
        timeline: {
        deadlineWeeks: number | null;
        urgency: Level | null;
        };
        infrastructure: {
        hosting: "cloud" | "on_premise" | "hybrid" | "serverless" | "unknown";
        preferredProvider: string | null;  // "AWS", "Supabase"...
        mustBeFreeTier: boolean | null;
        };
        licensing: "open_source_only" | "commercial_ok" | "unknown";
        other: string[];                     // contraintes en texte libre
        };

        team: {
        size: number | null;
        soloDeveloper: boolean | null;
        };

        preferences: {
        preferredTechnologies: string[];     // favoris / souhaits
        excludedTechnologies: string[];      // à éviter
        priorities: ("performance" | "scalability" | "simplicity" | "cost"
               | "time_to_market" | "maintainability" | "security")[];
        maintenanceHorizon: "short" | "medium" | "long" | null;
        };

        meta: {
        confidence: number;                  // 0 à 1 : sûreté globale de l'extraction
        missingInfo: string[];               // infos utiles que l'utilisateur n'a pas données
        ambiguities: string[];               // points contradictoires ou flous
        lastUpdatedFrom: "form" | "chat";
        };
        }. Ne pas ajouter des expilcations, ni aucun commentaire, aucun texte avant et après le JSON qui respecte la structure ci après.
`;

    let response; 
    try {
        response = await  ai.models.generateContent({
            model: "gemeini-3.5-flash",
            contents: prompt,
            config: {
                candidateCount: 1
            }
        });
    } catch (error) {
        console.error("Extracted needs error:", error);
    }

    const text = response?.text;
    if (typeof(text) === "undefined") {
        console.error("THE SUGGESTED TITLE HASN'T THE CORRECT TYPE");
        return "No extracted Needs";
    } 
    return text;
}
