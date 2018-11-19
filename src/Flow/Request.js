declare class Request extends http$IncomingMessage mixins express$RequestResponseBase {
    // Custom fields
    application: Mongoose$Document;
    isSecret: boolean;
    user: any;
    flash: (string, string) => void,
    // Directly fetched from flow-typed
    baseUrl: string;
    body: any;
    cookies: { [cookie: string]: string };
    connection: Socket;
    fresh: boolean;
    hostname: string;
    ip: string;
    ips: Array<string>;
    method: string;
    originalUrl: string;
    params: express$RequestParams;
    path: string;
    protocol: "https" | "http";
    query: { [name: string]: string | Array<string> };
    route: string;
    secure: boolean;
    signedCookies: { [signedCookie: string]: string };
    stale: boolean;
    subdomains: Array<string>;
    xhr: boolean;
    accepts(types: string): string | false;
    accepts(types: Array<string>): string | false;
    acceptsCharsets(...charsets: Array<string>): string | false;
    acceptsEncodings(...encoding: Array<string>): string | false;
    acceptsLanguages(...lang: Array<string>): string | false;
    header(field: string): string | void;
    is(type: string): boolean;
    param(name: string, defaultValue?: string): string | void;
}
