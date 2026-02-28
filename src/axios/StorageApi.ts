import type {StorageRequest} from "../types/StorageRequest.ts";
import axios from "axios";
import type {FileWithId} from "../types/FileWithId.ts";
import {userAuthStore} from "../stores/token.store.ts";
import {refresh} from "./UserApi.ts";

export const api = axios.create({

    baseURL: "http://localhost:8080",
    withCredentials: true,
})

const getDirs = async (request: StorageRequest) => {
    return await api.post("/api/v1/dirs", request)
        .then(response => {return response.data})
}

const getFiles = async (request: StorageRequest) => {
    return await api.post("/api/v1/files", request)
        .then(response => {return response.data})
}

const getParentDir = async (request: StorageRequest) => {
    return await api.post("/api/v1/dirs/current", request)
        .then(response => {return response.data})
}

const getPresignedUrl = async (files: FileWithId[]) => {
    return await api.post("/storages", {
        fileNames: files.map(fileWithId => ({
            fileName: fileWithId.file.name,
            fileId: fileWithId.id
        }))
    })
        .then(response => {
            console.log(response)
            return response.data})
}

api.interceptors.request.use(async (config) => {
    const token = userAuthStore.getState().accessToken

    console.log(token)
    if (!token) {
        await refresh()
        config.headers.Authorization = `Bearer ${userAuthStore.getState().accessToken}`

    }
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})


export {getDirs, getFiles, getParentDir, getPresignedUrl}