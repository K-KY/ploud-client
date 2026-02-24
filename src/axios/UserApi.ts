import axios from "axios";
import type {LoginForm} from "../types/LoginForm.ts";

const api = "http://localhost:8080"

const login = async (request: LoginForm) => {
    return await axios({
        method: "POST",
        url: api+"/login",
        data: request,
    }).then((res) => {
        console.log(res);
    });
}

export {login}