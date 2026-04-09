"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/auth";
import { createContentSchema, type CreateContentInput } from "@/lib/validations/content";

/**
 * Initiates the content creation process by saving the initial configuration
 * to the database as a DRAFT.
 */
export const initiateContentDraft = async (data: CreateContentInput) => {
  try {
    // 1. Verify User Session
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    // 2. Validate Inputs with Zod
    const parsedData = createContentSchema.safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "Invalid configuration parameters." };
    }

    const { keyword, contentType, writingGoal, contentDepth, wordCount } = parsedData.data;

    // 3. Create Draft in Database
    const newContent = await prisma.content.create({
      data: {
        userId: session.user.id,
        targetKeyword: keyword,
        contentType,
        writingGoal,
        contentDepth,
        targetWordCount: wordCount,
        status: "DRAFT",
      },
    });

    return { 
      success: true, 
      contentId: newContent.id 
    };

  } catch (error) {
    console.error("Content Initialization Error:", error);
    return { success: false, error: "Failed to initialize content draft." };
  }
};