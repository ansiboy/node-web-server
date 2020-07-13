declare module "zombie" {
    class Browser {
        visit(url: string): Promise<any>;
        source: string;
        status: number;
        response: {
            headers: Headers
        };
    }

    interface Headers {
        get(name: string): string;
    }

    export = Browser;
}