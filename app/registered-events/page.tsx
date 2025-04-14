import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { fetchUserByEmail } from "@/app/lib/data";

const MyEvents = async () => {
    const session = await getServerSession(authOptions);

    try {
        if (!session || !session.user || !session.user.email) {
            return redirect("/");
        }

        const userEmail = session.user.email;
        const user = await fetchUserByEmail(userEmail);
        const registeredEvents =
            user?.registrations?.map((reg) => reg.event) || [];

        if (registeredEvents.length === 0) {
            return (
                <div className="p-4 text-center">
                    <h1 className="text-xl font-bold">My Events</h1>
                    <p>You have not registered for any events yet.</p>
                </div>
            );
        }

        return (
            <div className="min-h-screen p-6">
                <h1 className="text-4xl font-bold my-4 ml-6">My Events</h1>
                <div className="p-8 flex justify-center">
                    <div className="w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                            {registeredEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105"
                                >
                                    <Link href={`/events/${event.id}`}>
                                        <>
                                            {event.imageUrl && (
                                                <img
                                                    src={event.imageUrl}
                                                    alt={event.name}
                                                    className="w-full h-80 object-cover"
                                                />
                                            )}
                                            <div className="p-4">
                                                <h2 className="text-xl font-bold mb-2">
                                                    {event.name}
                                                </h2>
                                                <p className="text-gray-700 mb-1">
                                                    Place:{" "}
                                                    <span className="font-semibold">
                                                        {event.place}
                                                    </span>
                                                </p>
                                                <p className="text-gray-700 mb-1">
                                                    Time:{" "}
                                                    <span className="font-semibold">
                                                        {new Date(
                                                            event.time
                                                        ).toLocaleString()}
                                                    </span>
                                                </p>
                                                <p className="text-gray-500 text-sm">
                                                    Registered on:{" "}
                                                    {new Date(
                                                        event.createdAt
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        </>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        if (error instanceof Error) {
            return (
                <div className="p-4">
                    <h1 className="text-xl font-bold">Error</h1>
                    <p>Failed to load your events. Please try again later.</p>
                </div>
            );
        }
    }
};

export default MyEvents;
