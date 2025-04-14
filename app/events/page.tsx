"use client";

import { useState, useEffect } from "react";
import { fetchEvents, fetchUserByEmail } from "../lib/data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import EventRegistrationSelect from "../components/RegisterButton";

const PAGE = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { data: sessionData } = useSession();
    const [events, setEvents] = useState<AppEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<AppEvent[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [userRegistrationsByEventId, setUserRegistrationsByEventId] =
        useState<Record<string, "ATTENDEE" | "VOLUNTEER">>({});

    useEffect(() => {
        const initializeData = async () => {
            try {
                setIsLoading(true);
                if (sessionData?.user?.email) {
                    const user = await fetchUserByEmail(sessionData.user.email);
                    setIsAdmin(user?.isAdmin ?? false);

                    const registrationMap: Record<
                        string,
                        "ATTENDEE" | "VOLUNTEER"
                    > = {};
                    user?.registrations?.forEach((reg: Registration) => {
                        registrationMap[reg.eventId] = reg.role;
                    });
                    setUserRegistrationsByEventId(registrationMap);
                }

                const allEvents = await fetchEvents();
                setEvents(allEvents);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeData();
    }, [sessionData]);

    useEffect(() => {
        let result = events;
        if (searchTerm) {
            result = result.filter((event) =>
                event.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredEvents(result);
    }, [events, searchTerm]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setSearchTerm(e.target.value);

    return (
        <>
            <div className="mt-8 ml-8">
                <div className="flex gap-4 mb-6">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search events..."
                        className="p-2 border border-gray-300 rounded"
                    />
                </div>
            </div>
            {!isLoading && isAdmin !== null ? (
                <div className="flex justify-center">
                    <div className="max-w-7xl p-4">
                        {filteredEvents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredEvents.map((event) => {
                                    const userRole =
                                        userRegistrationsByEventId[event.id];
                                    return (
                                        <div
                                            key={event.id}
                                            className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 relative flex flex-col justify-between sm:min-w-[450px] md:min-w-[200px] lg:min-w-[300px] xl:min-w-[300px]"
                                        >
                                            <Link href={`/events/${event.id}`}>
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
                                                        Created:{" "}
                                                        {new Date(
                                                            event.createdAt
                                                        ).toLocaleString()}
                                                    </p>
                                                </div>
                                            </Link>
                                            {sessionData?.user?.email &&
                                                (isAdmin ? (
                                                    <Link
                                                        href={`/update-event/${event.id}`}
                                                    >
                                                        <Button className="m-4">
                                                            Update
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <EventRegistrationSelect
                                                        eventId={event.id}
                                                        userEmail={
                                                            sessionData.user
                                                                .email
                                                        }
                                                        currentRole={userRole}
                                                    />
                                                ))}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <h1 className="flex flex-col min-h-screen justify-center items-center">
                                No events to show.
                            </h1>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col min-h-screen justify-center items-center">
                    <div className="loader"></div>
                </div>
            )}
        </>
    );
};

export default PAGE;
