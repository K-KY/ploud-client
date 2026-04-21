import type {StorageRequest} from "../types/StorageRequest.ts";
import axios from "axios";
import type {FileWithId} from "../types/FileWithId.ts";
import {userAuthStore} from "../stores/token.store.ts";
import {refresh} from "./UserApi.ts";
import type {FileInfo} from "../types/FileInfo.ts";
import type {DirectoryInfo} from "../types/DirectoryInfo.ts";

export const api = axios.create({

    baseURL: "http://localhost:8080",
    withCredentials: true,
})

const getDirs = async (request: StorageRequest) => {
    return await api.post("/api/v1/dirs", request)
        .then(response => {
            return response.data
        })
}

const getFiles = async (request: StorageRequest) => {
    return await api.post("/api/v1/files", request)
        .then(response => {
            return response.data
        })
}

const getParentDir = async (request: StorageRequest) => {
    return await api.post("/api/v1/dirs/current", request)
        .then(response => {
            return response.data
        })
}

const getPresignedUrl = async (files: FileWithId[]) => {
    return await api.post("/storages", {
        fileNames: files.map(fileWithId => ({
            fileName: fileWithId.file.webkitRelativePath || fileWithId.file.name,
            fileId: fileWithId.id
        }))
    })
        .then(response => {
            console.log(response)
            return response.data
        })
}

const getDownloadUrl = async (file: FileInfo) => {
    console.log(file)
    return await api.post("/storages/download", {
            fileName: file.title,
            fileId: file.fileSeq,
            storageKey: file.storageKey,
        }
    ).then(response => {
        console.log(response)
        return response.data
    })
}

const getDirDownloadUrl = async (dir: DirectoryInfo) => {
    const downloadUrl = "http://localhost:8081/download-zip?dirSeq=" + dir.dirSeq ;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download =dir.dirName;
    a.click();
}

api.interceptors.request.use(async (config) => {

    const token = userAuthStore.getState().accessToken
    if (!token) {
        await refresh()
        config.headers.Authorization = `Bearer ${userAuthStore.getState().accessToken}`
    }
    if (token) {
        console.log("tokenExist : ", token)
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

export {getDirs, getFiles, getParentDir, getPresignedUrl, getDownloadUrl, getDirDownloadUrl}