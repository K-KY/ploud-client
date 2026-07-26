import { create } from "zustand"
import type {ATStore} from "../types/AuthStoreTypes.ts";

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

