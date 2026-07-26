interface ATStore {
    accessToken: string | null;
    isAuthenticated: boolean;
    setAccessToken: (token: string | null) => void;
    logout: () => void;
}

export type {ATStore};
