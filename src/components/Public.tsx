import {userAuthStore} from "../stores/token.store.ts";
import {Navigate} from "react-router-dom";

export function Public({children}: {children: React.ReactNode}) {
    const state = userAuthStore.getState();
    if (state.accessToken) {
        console.log('isAuthenticated')
        return <Navigate to="/" replace />
    }

    console.log("not authenticated", state);

    return children
}