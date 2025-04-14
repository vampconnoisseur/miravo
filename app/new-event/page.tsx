"use client";

import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { useActionState, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { fetchUserByEmail } from "@/app/lib/data";
import { createEvent } from "@/app/lib/actions";

interface FormState {
    message: string | null;
}

const initialState: FormState = { message: null };

const SubmitButton = () => {
    const { pending } = useFormStatus();

    return (
        <div className="py-4">
            {!pending ? (
                <Button type="submit" disabled={pending}>
                    Create Event
                </Button>
            ) : (
                <div className="loader mb-8"></div>
            )}
        </div>
    );
};

const CreateEventPage = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [authorizationStatus, setAuthorizationStatus] = useState<
        "loading" | "unauthorized" | "authorized"
    >("loading");
    const [state, formAction] = useActionState(createEvent, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.push("/");
            return;
        }

        const checkAdminStatus = async () => {
            if (session?.user?.email) {
                try {
                    const user = await fetchUserByEmail(session.user.email);
                    if (user?.isAdmin) {
                        setAuthorizationStatus("authorized");
                    } else {
                        setAuthorizationStatus("unauthorized");
                        toast({
                            title: "Unauthorized",
                            description:
                                "You do not have permission to access this page.",
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user:", error);
                    setAuthorizationStatus("unauthorized");
                }
            } else {
                setAuthorizationStatus("loading");
            }
        };

        checkAdminStatus();
    }, [session, status, toast, router]);

    useEffect(() => {
        if (state?.message) {
            toast({
                title: "Event Created",
                description: state.message,
            });
        }
    }, [state, toast]);

    if (authorizationStatus === "loading") {
        return (
            <div className="flex flex-col min-h-screen justify-center items-center">
                <div className="loader"></div>
            </div>
        );
    }

    if (authorizationStatus === "unauthorized") {
        return <div>Unauthorized Access.</div>;
    }

    return (
        <div className="w-2/4 p-4 my-8">
            <h1 className="text-4xl font-bold mb-8">Create New Event</h1>
            <form action={formAction} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">
                        Event Name
                    </label>
                    <Input
                        name="name"
                        placeholder="Event Name"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Place</label>
                    <Input
                        name="place"
                        placeholder="Event Location"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Time</label>
                    <Input
                        name="time"
                        type="datetime-local"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label
                        className="block text-sm font-medium"
                        htmlFor="s3Url"
                    >
                        Image URL (S3)
                    </label>
                    <Input
                        required
                        type="url"
                        id="s3Url"
                        name="s3Url"
                        placeholder="https://s3.amazonaws.com/bucket/image.jpg"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <SubmitButton />
            </form>
        </div>
    );
};

export default CreateEventPage;
