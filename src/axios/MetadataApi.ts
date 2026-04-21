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

api.interceptors.response.use(
    res => res,
    async (error) => {
        //기존 요청
        const originalRequest = error.config;


        //현재 서버에서 토큰 만료시 403 반환 중
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await refresh();
            } catch (refreshError) {
                console.log("refresh 실패", refreshError);

                // refresh 토큰이 문제
                userAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }

            const newToken = userAuthStore.getState().accessToken;
            //헤더에 새 인증 토큰 추가
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            try {
                //api 기존 요청으로 재호출
                return await api(originalRequest);
            } catch (retryError) {
                console.log("재요청 실패", retryError);
                // api 실패
                return Promise.reject(retryError);
            }
        }

        return Promise.reject(error);
    }
);


export {postFile}