import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
    title: "miravo",
    description: "Event management app",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html>
            <body>
                <SessionWrapper>
                    <SidebarProvider>
                        <AppSidebar />
                        <main className="w-full">
                            <div className="sticky top-0 z-10 flex items-center px-4 py-2 backdrop-blur-md backdrop-brightness-125 border border-gray-300/50 shadow-sm">
                                <SidebarTrigger className="" />
                                <h1 className="flex-1 text-center text-4xl pr-16">
                                    miravo
                                </h1>
                            </div>
                            <div className="flex flex-col min-h-screen justify-center items-center">
                                {children}
                            </div>
                        </main>
                    </SidebarProvider>
                </SessionWrapper>
                <Toaster />
            </body>
        </html>
    );
}
