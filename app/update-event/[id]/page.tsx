"use client";

import { useRouter } from "next/navigation";
import { updateEvent } from "@/app/lib/actions";
import { use, useActionState, useEffect, useState } from "react";
import { AppEvent } from "@prisma/client";
import { fetchEvent } from "@/app/lib/data";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

const SubmitButton = () => {
    const { pending } = useFormStatus();

    return (
        <div className="py-4">
            {!pending ? (
                <Button type="submit" disabled={pending} className="">
                    Update
                </Button>
            ) : (
                <div className="loader mb-8"></div>
            )}
        </div>
    );
};

const PAGE = ({ params }: { params: Promise<{ id: string }> }) => {
    const router = useRouter();
    const [event, setEvent] = useState<AppEvent | null>(null);
    const [formState, formAction] = useActionState(updateEvent, {
        message: "",
    });
    const id = use(params).id;

    useEffect(() => {
        async function getEvent() {
            try {
                const eventData = await fetchEvent(id);
                setEvent(eventData);
            } catch (err) {
                console.error("Error fetching event:", err);
            }
        }
        getEvent();
    }, [id]);

    if (!event) {
        return <p className="text-center mt-10">Loading event...</p>;
    }

    return (
        <form
            action={async (formData) => {
                formAction(formData);
                router.push("/events");
            }}
            className="max-w-md mx-auto mt-10"
        >
            <h1 className="text-4xl font-bold mb-8">Update Event</h1>

            <input type="hidden" name="eventId" value={event.id} />
            <input type="hidden" name="s3Url" value={event.imageUrl ?? ""} />

            <input
                type="text"
                name="name"
                placeholder="Event name"
                defaultValue={event.name}
                className="w-full p-2 border rounded mb-4"
            />
            <input
                type="text"
                name="place"
                placeholder="Place"
                defaultValue={event.place}
                className="w-full p-2 border rounded mb-4"
            />
            <input
                type="datetime-local"
                name="time"
                defaultValue={
                    event.time
                        ? new Date(event.time).toISOString().slice(0, 16)
                        : ""
                }
                className="w-full p-2 border rounded mb-4"
            />

            <SubmitButton />

            {formState.message && (
                <p className="mt-4 text-sm text-red-500">{formState.message}</p>
            )}
        </form>
    );
};

export default PAGE;
