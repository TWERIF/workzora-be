export interface Participant {
    name: string;
    email: string;
}

export interface EmailData {
    html: string;
    subject: string;
    from: Participant;
    to: Participant;
}