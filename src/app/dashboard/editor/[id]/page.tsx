import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { auth } from "@/auth";
import { EditorWorkspace } from "@/components/editor/editor-workspace";

interface EditorPageProps {
    params: {
        id: string;
    };
}

/**
 * Server Component for the final Content Generation and Editing workspace.
 */
export default async function EditorPage({ params }: EditorPageProps) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const content = await prisma.content.findUnique({
        where: {
            id: params.id,
            userId: session.user.id,
        },
    });

    if (!content) {
        notFound();
    }

    return <EditorWorkspace initialData={content} />;
}