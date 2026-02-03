import type {StorageRequest} from "../types/StorageRequest.ts";
import axios from "axios";
import type {FileWithId} from "../types/FileWithId.ts";

const getDirs = async (request: StorageRequest) => {
    return await axios({
        url: "http://localhost:8080/api/v1/dirs",
        method: "POST",
        data: request,
    }).then((response) => {
        return response.data;
    })
}

const getFiles = async (request: StorageRequest) => {
    return await axios({
        url: "http://localhost:8080/api/v1/files",
        method: "POST",
        data: request,
    }).then((response) => {
        return response.data;
    })
}

const getParentDir = async (request: StorageRequest) => {
    return await axios({
        url: "http://localhost:8080/api/v1/dirs/current",
        method: "POST",
        data: request,
    }).then((response) => {
        return response.data;
    })
}

const getPresignedUrl = async (files: FileWithId[]) => {
    return await axios({
        url: "http://localhost:8080/storages",
        method: "POST",
        data: {
            ownerId: "김규영", // jwt로 대체할거
            fileNames: files.map(fileWithId => ({
                fileName: fileWithId.file.name,
                fileId: fileWithId.id
            }))
        }
    }).then((response) => {
        console.log(response);
        return response.data;
    });
}

export {getDirs, getFiles, getParentDir, getPresignedUrl}