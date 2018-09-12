export class authResult {
    access_token:string;
    id_token:string;
    refresh_token:string;

    constructor(data:any) {
        this.access_token = data.access_token;
        this.id_token = data.id_token;
        this.refresh_token = data.refresh_token;
    }
}