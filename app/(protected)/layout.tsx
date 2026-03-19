
// import { requireVerifiedEmail } from "@/lib/auth/auth-service.server";
import { UserProvider } from "@/lib/auth/user-context";
import { HeaderBar } from "@/app/(protected)/(dashboard)/component/header-bar";
import { requireAuth } from "@/lib/auth/auth-service.server";
import { Hospital } from "lucide-react";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
})
{
    // const user = await requireVerifiedEmail();
    const user = await requireAuth();
    return (
        <UserProvider user={user}>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <HeaderBar>
                    <span className="flex items-center gap-2">
                        <Hospital className="size-6 stroke-2 stroke-blue-800 dark:stroke-blue-400" />
                        HSM
                    </span>
                </HeaderBar>
                <main style={{ flex: 1 }}>
                    {children}
                </main>
            </div>
        </UserProvider>
    );
}