interface SignupRequest {
    userName: string;
    userEmail: string;
    password: string;
}

type SignupStatus = "form" | "emailSent" | "verifying" | "success" | "failure";

export type {SignupRequest, SignupStatus};
