"use client";

import { useState, useEffect, useMemo } from "react";
import {
    CalendarRange,
    CalendarCheck2,
    ChevronUp,
    CalendarPlus,
    User,
    LayoutDashboard,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { redirect, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { fetchUserByEmail } from "../lib/data";

export function AppSidebar() {
    const currentPath = usePathname();
    const { data: session, status } = useSession();

    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [userName, setUserName] = useState<string | null>(null);

    const redirectToHome = () => {
        redirect("/");
    };

    useEffect(() => {
        const storedAdminStatus = localStorage.getItem("isAdmin");
        const storedUserName = localStorage.getItem("userName");

        if (storedAdminStatus !== null) {
            setIsAdmin(JSON.parse(storedAdminStatus));
        }

        if (storedUserName !== null) {
            setUserName(storedUserName);
        }
    }, []);

    useEffect(() => {
        const getUserData = async () => {
            if (session?.user?.email) {
                try {
                    const user = await fetchUserByEmail(session.user.email);
                    setIsAdmin(user!.isAdmin);
                    setUserName(user!.name);
                    localStorage.setItem(
                        "isAdmin",
                        JSON.stringify(user?.isAdmin)
                    );
                    localStorage.setItem("userName", user?.name || "");
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                }
            }
        };
        getUserData();
    }, [session?.user?.email]);

    useEffect(() => {
        if (status === "unauthenticated") {
            localStorage.removeItem("isAdmin");
            localStorage.removeItem("userName");
            setIsAdmin(null);
            setUserName(null);
        }
    }, [status]);

    const items = useMemo(() => {
        const menuItems = [
            { title: "Events", url: "/events", icon: CalendarRange },
        ];

        if (isAdmin !== null) {
            if (!isAdmin) {
                menuItems.push({
                    title: "My Events",
                    url: "/registered-events",
                    icon: CalendarCheck2,
                });
            }
            if (isAdmin) {
                menuItems.push({
                    title: "Create Event",
                    url: "/new-event",
                    icon: CalendarPlus,
                });
                menuItems.push({
                    title: "Dashboard",
                    url: "/admin-dashboard",
                    icon: LayoutDashboard,
                });
            }
        }

        return menuItems;
    }, [isAdmin]);

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="pr-8">
                        miravo
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        isActive={currentPath === item.url}
                                        asChild
                                    >
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="font-medium">
                                    <User />{" "}
                                    {status === "loading"
                                        ? userName
                                        : session
                                          ? userName
                                          : "Login"}
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width] mb-2 p-2 rounded-md bg-gray-300"
                            >
                                <button
                                    className="w-full flex"
                                    onClick={() =>
                                        session ? signOut() : redirectToHome()
                                    }
                                >
                                    <DropdownMenuItem className="text-black font-medium text-semibold px-2 text-sm">
                                        {session ? "Sign Out" : "Sign In"}
                                    </DropdownMenuItem>
                                </button>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
