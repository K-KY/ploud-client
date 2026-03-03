import axios from "axios";
import type {LoginForm} from "../types/LoginForm.ts";
import {userAuthStore} from "../stores/token.store.ts";

export const api = axios.create({

    baseURL: "http://localhost:8080",
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

const refresh = async () => {
    return await api.post("/refresh")
        .then((res) => {
            console.log('refresh success', res.data);
            userAuthStore.setState({
                accessToken: res.data.accessToken,
                isAuthenticated: true
            })
        }).catch((err) => {
            console.log('refresh fail', err);
        });
}

const logout = async () => {
    return await api.post("auth/logout")
}

export {login, refresh, logout}