"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/auth";
import { fetchSerpData } from "@/lib/seo/serper";
import { generateArticleOutline } from "@/lib/ai/anthropic";

/**
 * Master server action that triggers the entire research pipeline:
 * 1. Fetches SERP data.
 * 2. Feeds data to Claude for structural analysis.
 * 3. Returns the structured JSON to the client workspace.
 */
export async function executeResearchPipeline(contentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }

    // 1. Retrieve the draft configuration from the database
    const contentDraft = await prisma.content.findUnique({
      where: { id: contentId, userId: session.user.id },
    });

    if (!contentDraft) {
      return { success: false, error: "Content draft not found." };
    }

    // 2. Execute SERP Extraction
    const serpData = await fetchSerpData(contentDraft.targetKeyword);

    // 3. Execute AI Architectural Analysis
    const aiAnalysis = await generateArticleOutline({
      keyword: contentDraft.targetKeyword,
      contentType: contentDraft.contentType,
      writingGoal: contentDraft.writingGoal,
      contentDepth: contentDraft.contentDepth,
      serpData: serpData,
    });

    // Merge API questions with AI structural output for the frontend
    const finalWorkspaceData = {
      ...aiAnalysis,
      questions: serpData.relatedQuestions,
      // Overwrite the AI's keyword list with actual SERP related searches if available
      keywords: serpData.relatedSearches.map((term: string) => ({
        term,
        volume: "N/A", // Serper doesn't provide volume, requires additional API
        difficulty: "Unknown"
      }))
    };

    return { success: true, data: finalWorkspaceData };

  } catch (error) {
    console.error("Pipeline Execution Failed:", error);
    return { success: false, error: "The research pipeline encountered a critical error." };
  }
}