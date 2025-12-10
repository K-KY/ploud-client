import type {StorageRequest} from "../types/StorageRequest.ts";
import axios from "axios";

const getDirs = async (request: StorageRequest) => {
    return await axios({
        url:"http://localhost:8080/api/v1/dirs",
        method: "POST",
        data: request,
    }).then((response) => {
        return response.data;
    })
}

const getFiles = async (request: StorageRequest) => {
    return await axios({
        url:"http://localhost:8080/api/v1/files",
        method: "POST",
        data: request,
    }).then((response) => {
        return response.data;
    })
}

export {getDirs, getFiles}