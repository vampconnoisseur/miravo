"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "./prisma";

export async function fetchUserByEmail(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                registrations: {
                    include: {
                        event: true,
                    },
                },
            },
        });
        return user;
    } catch (error) {
        console.error("Error fetching user by email:", error);
        throw error;
    }
}

export async function fetchEvents(): Promise<AppEvent[]> {
    noStore();
    try {
        return await prisma.appEvent.findMany({
            include: {
                registrations: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: {
                time: "asc",
            },
        });
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch events.");
    }
}

export async function fetchEvent(id: string): Promise<AppEvent | null> {
    noStore();
    try {
        const event = await prisma.appEvent.findUnique({
            where: { id },
            include: {
                registrations: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        return event;
    } catch (error) {
        console.error("Error fetching event:", error);
        throw new Error("Failed to fetch event.");
    }
}
