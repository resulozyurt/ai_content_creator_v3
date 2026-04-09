import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { auth } from "@/auth";
import { ResearchWorkspace } from "@/components/research/research-workspace";

/**
 * Defines the parameters expected from the dynamic route segment.
 */
interface ResearchPageProps {
    params: {
        id: string;
    };
}

/**
 * Server Component responsible for validating the session, fetching the draft content,
 * and passing the structured data to the interactive client workspace.
 */
export default async function ResearchPage({ params }: ResearchPageProps) {
    // 1. Validate Active Session
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    // 2. Fetch specific content owned by the authenticated user
    const content = await prisma.content.findUnique({
        where: {
            id: params.id,
            userId: session.user.id,
        },
    });

    // 3. Security check: Ensure content exists and belongs to user
    if (!content) {
        notFound();
    }

    // 4. Render the interactive client workspace with fetched data
    return <ResearchWorkspace initialData={content} />;
}