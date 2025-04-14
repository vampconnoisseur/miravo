type Role = "ATTENDEE" | "VOLUNTEER";

type AppEvent = {
    id: string;
    name: string;
    place: string;
    time: Date;
    snsTopicArn: string;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
    registrations: Registration[];
};

type Registration = {
    id: string;
    userId: string;
    eventId: string;
    role: Role;
    present: boolean;
    appEvent?: AppEvent;
};

type User = {
    id: string;
    name?: string | null;
    email?: string | null;
    emailVerified?: Date | null;
    image?: string | null;
    isAdmin: boolean;
    accounts: Account[];
    sessions: Session[];
    registrations: Registration[];
};

type Account = {
    id: string;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token?: string | null;
    access_token?: string | null;
    expires_at?: number | null;
    token_type?: string | null;
    scope?: string | null;
    id_token?: string | null;
    session_state?: string | null;
    user: User;
};

type Session = {
    id: string;
    sessionToken: string;
    userId: string;
    expires: Date;
    user: User;
};
