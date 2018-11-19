declare class Response extends http$ServerResponse mixins express$RequestResponseBase {
    // Custom fields
    redirectBackWithSuccess: (string) => void;
    // Default fields
    headersSent: boolean;
    locals: { [name: string]: mixed };
    append(field: string, value?: string): this;
    attachment(filename?: string): this;
    cookie(name: string, value: string, options?: express$CookieOptions): this;
    clearCookie(name: string, options?: express$CookieOptions): this;
    download(
        path: string,
        filename?: string,
        callback?: (err?: ?Error) => void
    ): this;
    format(typesObject: { [type: string]: Function }): this;
    json(body?: mixed): this;
    jsonp(body?: mixed): this;
    links(links: { [name: string]: string }): this;
    location(path: string): this;
    redirect(url: string, ...args: Array<void>): this;
    redirect(status: number, url: string, ...args: Array<void>): this;
    render(
        view: string,
        locals?: { [name: string]: mixed },
        callback?: express$RenderCallback
    ): this;
    send(body?: mixed): this;
    sendFile(
        path: string,
        options?: express$SendFileOptions,
        callback?: (err?: ?Error) => mixed
    ): this;
    sendStatus(statusCode: number): this;
    header(field: string, value?: string): this;
    header(headers: { [name: string]: string }): this;
    set(field: string, value?: string | string[]): this;
    set(headers: { [name: string]: string }): this;
    status(statusCode: number): this;
    type(type: string): this;
    vary(field: string): this;
    req: express$Request;
}