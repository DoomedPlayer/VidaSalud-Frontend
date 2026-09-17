export const msalConfig = {
    auth: {
        clientId: "3666de5f-f393-474b-a2b8-e9140225e3af",
        authority: "https://login.microsoftonline.com/43341e84-316b-40a7-a02f-5c94afd3d730/",
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: "sessionStorage", 
        storeAuthStateInCookie: false, 
    }
};

export const loginRequest = {
    scopes: ["User.Read"] 
};