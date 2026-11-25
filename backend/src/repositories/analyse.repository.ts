import { prisma } from '../configs/db';
import { Prisma } from '../../generated/prisma/client';
import { NewAnalyseDataSchema } from '../zod.schemas/analyse.schema';

interface newAnalyseData {
    title: string | null;
    description: string;
    sector: string;
    projectSize: string | null;
}

type Level = "low" | "medium" | "high";
type Priority = "must" | "should" | "nice";

export interface ExtractedNeeds {
  schemaVersion: number;                 // 1, pour faire évoluer la structure plus tard

  project: {
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
}

export class AnalyseRepository {
    createNewConversation = async(analyseData: NewAnalyseDataSchema, userId: string) => {
        const data = await prisma.$transaction( async(tx) => {
            const result = await tx.conversation.create({
                data: {userId: userId, title: analyseData.title, description:analyseData.description, sector: analyseData.sector,projectSize: analyseData.projectSize} 
            });

            const conversationId = result.id;

            const newAnalyse = await tx.analysis.create({
                data: {input: JSON.stringify(analyseData)}
            });
            return {analyseId: newAnalyse.id, conversationId};
        });

        return data;
    };

    updateConversatinoTitle = async(conversationId: number, title: string) =>{
      const newTitle = await prisma.conversation.update({
        where: {id: conversationId},
        data: {title: title}
      });
    };


    saveConversationNeeds = async (needs: ExtractedNeeds, conversationId: number) => {
      const savingNeeds = await prisma.conversation.update({
        where: {id: conversationId},
        data: { extractedNeeds: needs as unknown as Prisma.InputJsonValue}
      })
    }

}