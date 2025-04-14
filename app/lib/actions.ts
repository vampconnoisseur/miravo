"use server";

import { prisma } from "./prisma";
import { z } from "zod";
import {
    SNSClient,
    CreateTopicCommand,
    SubscribeCommand,
    PublishCommand,
} from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        sessionToken: process.env.AWS_SESSION_TOKEN!,
    },
});

export const createEvent = async (
    prevState: unknown,
    formData: FormData
): Promise<{ message: string }> => {
    const EventSchema = z.object({
        name: z.string().min(1, "Event name is required."),
        place: z.string().min(1, "Place is required."),
        time: z.coerce.date(),
        imageUrl: z.string().url("A valid image URL is required."),
    });

    const eventData = {
        name: (formData.get("name") as string) || "",
        place: (formData.get("place") as string) || "",
        time: formData.get("time") as string,
        imageUrl: (formData.get("s3Url") as string) || "",
    };

    try {
        const validatedData = EventSchema.parse(eventData);

        const createTopic = new CreateTopicCommand({
            Name: `event-${validatedData.name}-${Date.now()}`,
        });

        const topicResponse = await snsClient.send(createTopic);
        const topicArn = topicResponse.TopicArn!;

        await prisma.appEvent.create({
            data: {
                ...validatedData,
                snsTopicArn: topicArn,
            },
        });

        return { message: "Event created and topic registered successfully." };
    } catch (error) {
        console.error(error);
        return { message: "Failed to create event." };
    }
};

export const updateEvent = async (
    prevState: unknown,
    formData: FormData
): Promise<{ message: string }> => {
    const EventSchema = z.object({
        name: z.string().min(1, "Event name is required."),
        place: z.string().min(1, "Place is required."),
        time: z.coerce.date(),
        imageUrl: z.string().url("A valid image URL is required."),
    });

    const eventId = formData.get("eventId") as string;

    const eventData = {
        name: (formData.get("name") as string) || "",
        place: (formData.get("place") as string) || "",
        time: formData.get("time") as string,
        imageUrl: (formData.get("s3Url") as string) || "",
    };

    try {
        const validatedData = EventSchema.parse(eventData);

        await prisma.appEvent.update({
            where: { id: eventId },
            data: validatedData,
        });

        return { message: "Event updated successfully." };
    } catch (error) {
        console.error(error);
        return { message: "Failed to update event." };
    }
};

export async function registerUserForEvent(
    eventId: string,
    userEmail: string,
    role: Role
): Promise<void> {
    try {
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
        });
        if (!user) throw new Error("User not found");

        const event = await prisma.appEvent.findUnique({
            where: { id: eventId },
        });
        if (!event?.snsTopicArn)
            throw new Error("SNS topic not found for this event.");

        await prisma.registration.upsert({
            where: {
                userId_eventId: {
                    userId: user.id,
                    eventId,
                },
            },
            update: { role },
            create: {
                userId: user.id,
                eventId,
                role,
                present: false,
            },
        });

        const subscribeCommand = new SubscribeCommand({
            Protocol: "email",
            TopicArn: event.snsTopicArn,
            Endpoint: userEmail,
        });

        await snsClient.send(subscribeCommand);
    } catch (error) {
        console.error("Error registering user:", error);
        throw new Error("Failed to register for event.");
    }
}

export async function sendBroadcastEmails(eventId: string, role: Role) {
    const event = await prisma.appEvent.findUnique({
        where: { id: eventId },
    });

    if (!event?.snsTopicArn) throw new Error("Event topic not found.");

    const registrations = await prisma.registration.findMany({
        where: {
            eventId,
            role,
            user: { email: { not: null } },
        },
        include: { user: true },
    });

    const emails = registrations
        .map((r) => r.user.email)
        .filter((e): e is string => !!e);

    const message = `You are registered as a ${role.toLowerCase()} for the event: ${event.name}.`;

    for (const email of emails) {
        const command = new PublishCommand({
            Message: message,
            Subject: "Event Update",
            TopicArn: event.snsTopicArn,
        });

        try {
            await snsClient.send(command);
        } catch (err) {
            console.error(`Failed to notify ${email}`, err);
        }
    }
}
