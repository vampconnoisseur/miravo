import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { redirect } from "next/navigation";
import AdminEventsClient from "../components/AdminClient";

export default async function AdminEventsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user?.isAdmin) return redirect("/");

    const events = await prisma.appEvent.findMany({
        include: {
            registrations: {
                include: { user: true },
            },
        },
    });

    return <AdminEventsClient events={events} />;
}
