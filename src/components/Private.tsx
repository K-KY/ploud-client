import {userAuthStore} from "../stores/token.store.ts";
import {Navigate} from "react-router-dom";

export function Private({children}: {children: React.ReactNode}) {
    const token = userAuthStore.getState().accessToken;
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (children)
}