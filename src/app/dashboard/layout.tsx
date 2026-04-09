import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Sunucu tarafında güvenlik kontrolü: Sadece giriş yapmış kullanıcılar görebilir
    const session = await auth();
    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen overflow-hidden bg-muted/20">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}