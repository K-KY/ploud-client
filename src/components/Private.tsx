import {userAuthStore} from "../stores/token.store.ts";
import {Navigate} from "react-router-dom";

export function Private({children}: {children: React.ReactNode}) {
    const state = userAuthStore.getState();
    if (state.accessToken) {
        console.log('isAuthenticated')
        return children;
    }

    console.log("not authenticated", state);

    return <Navigate to="/login" replace/>
}