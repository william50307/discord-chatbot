import { option, optionFromNullable } from "io-ts-types";

type Option = {
    'Content-Type': 'application/json',
    'method' : string,
    'headers' : {'Content-Type': 'application/json'},
    'body' ?: string,
}


const API_URL = 'https://18b1-140-113-73-94.ngrok.io';


export const apiFetch = async (url : string, method :string = 'GET', data = null) => {
    let options : Option = {
        'Content-Type': 'application/json',
        'method' : method,
        'headers' : {'Content-Type': 'application/json'},
    };

    if (data){
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const status = await response.status;    
    const json_data = await response.json();
    return [status, json_data];
  };

export const api_get = async (path:string) => apiFetch(API_URL + path, 'GET', null);
export const api_post = async (path:string, data:any) => apiFetch(API_URL + path, 'POST', data);
export const api_delete = async (path:string, data:any) => apiFetch(API_URL + path, 'DELETE', data);
export const api_patch = async (path:string, data:any) => apiFetch(API_URL + path, 'PATCH', data);
export const api_put = async (path:string, data:any) => apiFetch(API_URL + path, 'PUT', data);
