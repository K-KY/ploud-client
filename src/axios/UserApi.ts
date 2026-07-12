import axios from "axios";
import type {LoginForm} from "../types/LoginForm.ts";
import {userAuthStore} from "../stores/token.store.ts";
import type {SignupRequest} from "../components/Signup.tsx";

export const api = axios.create({

    baseURL: "https://kky.tail0a6d17.ts.net/ploud/api",
    withCredentials: true,
})

const login = async (request: LoginForm) => {
    return await api.post("/login", request)
        .then((res) => {
            userAuthStore.setState({
                accessToken: res.data.accessToken,
            })
        });
}

const signUp = async (form:SignupRequest) => {
    return await api.post("/signup", form)
}

const verifySignUp = async (token: string) => {
    return await api.get("/signup", {
        params: {
            token,
        },
    })
}

const refresh = async () => {
    return await api.post("/refresh")
        .then((res) => {
            console.log('refresh success');
            userAuthStore.setState({
                accessToken: res.data.accessToken,
                isAuthenticated: true
            })
        }).catch((err) => {
            console.log('refresh fail', err);
        });
}

const logout = async () => {
    return await api.post("/logout")
}

export {login, signUp, verifySignUp, refresh, logout}
