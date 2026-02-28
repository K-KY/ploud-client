import axios from "axios";
import type {StorageInfo} from "../types/StorageInfo.ts";
import {userAuthStore} from "../stores/token.store.ts";
import {refresh} from "./UserApi.ts";

const api = axios.create({
    baseURL: "http://localhost:8080",
    withCredentials: true
})
const postFile = async (request: StorageInfo) => {
    console.log(request)
    return await api.post("/api/v1/files/upload", request)
        .then(response => {
        return response.data;
    })
}
api.interceptors.request.use(async (config) => {
    const token = userAuthStore.getState().accessToken

    console.log(token)
    if (!token) {
        console.log("리프레시")
        await refresh()
        config.headers.Authorization = `Bearer ${userAuthStore.getState().accessToken}`

    }
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

export {postFile}