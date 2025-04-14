import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { fetchEvent, fetchUserByEmail } from "@/app/lib/data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import EventRegistrationSelect from "@/app/components/RegisterButton";

export default async function EventDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const id = (await params).id;

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return redirect("/");
    }

    try {
        const event = await fetchEvent(id);
        const user = await fetchUserByEmail(session.user.email);
        const isAdmin = user?.isAdmin ?? false;

        if (!event) {
            return (
                <div className="text-center mt-12">
                    <h1 className="text-xl font-semibold text-red-600">
                        Event not found.
                    </h1>
                </div>
            );
        }

        const registration = user?.registrations?.find(
            (r) => r.eventId === event.id
        );
        const currentRole = registration?.role;

        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mb-6">
                    <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="mb-4 w-full h-128 object-cover rounded-md"
                    />
                    <h2 className="text-4xl font-bold mb-2 text-center text-gray-800">
                        {event.name}
                    </h2>
                    <div className="text-gray-700 text-center mb-4">
                        <p className="mb-2">
                            <strong>Place:</strong> {event.place}
                        </p>
                        <p>
                            <strong>Time:</strong>{" "}
                            {new Date(event.time).toLocaleString()}
                        </p>
                    </div>

                    <div className="mt-4 text-center">
                        {isAdmin ? (
                            <Link href={`/update-event/${event.id}`}>
                                <Button>Update</Button>
                            </Link>
                        ) : (
                            <>
                                {currentRole && (
                                    <div className="mb-2 text-sm text-green-700 font-semibold">
                                        You are registered as:{" "}
                                        <span className="uppercase">
                                            {currentRole}
                                        </span>
                                    </div>
                                )}
                                <EventRegistrationSelect
                                    eventId={event.id}
                                    userEmail={session.user.email}
                                    currentRole={currentRole}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        if (error instanceof Error) {
            return (
                <div className="text-center mt-12">
                    <h1 className="text-xl font-semibold text-red-600">
                        Error fetching event.
                    </h1>
                </div>
            );
        }
    }
}
