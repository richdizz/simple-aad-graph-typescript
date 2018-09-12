import { authResult } from './authResult';
import { authHelper } from './authHelper';
import { utils } from './utils';
import * as http from 'http';
import * as fetch from 'node-fetch';

export class Server {
    run() {
        http.createServer((req, res) => {
            if (req.url != "/favicon.ico") {
                console.log("Request for " + req.url);

                // look for authorization code coming in (indicates redirect from interative login/consent)
                var code = utils.getUrlParam(req.url, 'code');
                if (code) {
                    authHelper.getTokenByAuthCode(code).then((authResult:authResult) => {
                        // cache the token and redirect to root
                        // NOTE: only caching refresh token, meaning we will go to server each time we need access token...not ideal
                        // NOTE: cookie token cache not ideal
                        // NOTE: cookie expiration set to 24 hours...this should likely be based on token expiration
                        res.writeHead (301, {
                            'Location': '/',
                            'Set-Cookie': 'tokenCache=' + authResult.refresh_token + '; expires='+new Date(new Date().getTime()+86409000).toUTCString()
                        });
                        res.end();
                    });
                }
                else {
                    // check token cache
                    var refreshToken = utils.getCookie(req, 'tokenCache');
                    if (refreshToken != null) {
                        // check if cache is still good
                        authHelper.getAccessTokenSilent(refreshToken).then((authResult:authResult) => {
                            // use the access token to call the graph for last high importance email
                            fetch('https://graph.microsoft.com/v1.0/me/messages', {
                                headers: {
                                    'Accept': 'application/json',
                                    'Authorization': 'Bearer ' + authResult.access_token
                                }
                            }).then(d => {
                                d.json().then((data) => {
                                    res.writeHead (200, {
                                        'Content-Type': 'text/html',
                                        'Set-Cookie': 'tokenCache=' + authResult.refresh_token + '; expires='+new Date(new Date().getTime()+86409000).toUTCString()
                                    });
                                    res.end(`<html><head></head><body>Last email: ${data.value[0].subject}</body></html>`);
                                });
                            }, (err) => {
                                res.writeHead (200, {
                                    'Content-Type': 'text/html'
                                });
                                res.end('<html><head></head><body>BAD</body></html>');
                            });

                        }, (err) => {
                            // refresh token is bad...redirect the user to interactive login for authorization code
                            res.writeHead (301, {'Location': authHelper.getAuthUrl()});
                            res.end();
                        });
                    }
                    else {
                        // redirect the user to interactive login for authorization code
                        res.writeHead (301, {'Location': authHelper.getAuthUrl()});
                        res.end();
                    }
                }
            }
        }).listen(8080);
        console.log('Server running at http://127.0.0.1:8080/');
    }
}

const server = new Server();
server.run();