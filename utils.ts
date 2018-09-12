import { IncomingMessage } from "http";

export class utils {
    static getUrlParam(url:string, key:string) : string {
        var params = {};
        url = url.substr(url.indexOf('?') + 1);
        var definitions = url.split('&');
        definitions.forEach(( val, key ) => {
            var parts = val.split( '=', 2 );
            params[ parts[ 0 ] ] = parts[ 1 ];
        });

        return (key && key in params) ? params[key] : null;
    }

    static getCookie (request, key:string) : string {
        var list = {},
            rc = request.headers.cookie;
    
        rc && rc.split(';').forEach(function( cookie ) {
            var parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        })

        return (key && key in list) ? list[key] : null;
    }
}