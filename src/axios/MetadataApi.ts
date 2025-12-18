import axios from "axios";
import type {StorageInfo} from "../types/StorageInfo.ts";

const postFile = async (request: StorageInfo, isHls:boolean) => {
    request.isHls = isHls;
    console.log(request);
    return await axios({
        url:"http://localhost:8080/api/v1/files/upload",
        method: "POST",
        data: request,
    }).then((response) => {
        return response.data;
    })
}

export {postFile}