import { authResult } from './authResult';
import * as fetch from 'node-fetch';

export class authHelper {
    // const app reg details  
    static id = '84f9f67f-71e5-447b-9d4b-140fb58c6cc7';
    static pwd = 'prrhHHX688#$smrVZMO40;:';
    static uri = 'http://127.0.0.1:8080/';
    static scp = ['openid', 'offline_access', 'mail.read'];

    // gets code authorization redirect
    static getAuthUrl() : string {
        return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${authHelper.id}&response_type=code&redirect_uri=${authHelper.uri}&scope=${authHelper.scp.join('%20')}`;
    }

    // gets tokens from authorization code
    static async getTokenByAuthCode(code:string) {
        return new Promise(async (resolve, reject) => {
            var data = `client_id=${authHelper.id}`;
            data += `&scope=${authHelper.scp.join('%20')}`;
            data += `&code=${code}`;
            data += `&redirect_uri=${authHelper.uri}`;
            data += `&grant_type=authorization_code&client_secret=${authHelper.pwd}`;

            fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: data
            })
            .then(res => {
                // get the json and resolve token details
                res.json().then((tokens) => {
                    resolve(new authResult(tokens));
                });
            });
        });
    }

    // gets new access token using refresh token
    static getAccessTokenSilent(refreshToken:string) {
        return new Promise(async (resolve, reject) => {
            var data = `client_id=${authHelper.id}`;
            data += `&scope=${authHelper.scp.join('%20')}`;
            data += `&refresh_token=${refreshToken}`;
            data += `&redirect_uri=${authHelper.uri}`;
            data += `&grant_type=refresh_token&client_secret=${authHelper.pwd}`;

            fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: data
            })
            .then(res => {
                // get the json and resolve token details
                res.json().then((tokens) => {
                    resolve(new authResult(tokens));
                });
            });
        });
    }
}