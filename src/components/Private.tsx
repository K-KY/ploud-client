import {userAuthStore} from "../stores/token.store.ts";
import {Navigate} from "react-router-dom";

export function Private({children}: {children: React.ReactNode}) {
    const state = userAuthStore.getState();
    if (state.isAuthenticated) {
        return children;
    }

    return <Navigate to="/login" replace/>
}