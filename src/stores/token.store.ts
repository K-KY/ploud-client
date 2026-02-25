import { create } from "zustand"

interface ATStore {
    accessToken: string|null;
    isAuthenticated: boolean

    setAccessToken: (token: string | null) => void;
    logout: () => void
}

export const userAuthStore = create<ATStore>((set) => ({
    accessToken: null,
    isAuthenticated: false,

    setAccessToken: (token) =>
        set({
            accessToken: token,
            isAuthenticated: !!token,
        }),

    logout: () =>
        set({
            accessToken: null,
            isAuthenticated: false,
        }),
}))

