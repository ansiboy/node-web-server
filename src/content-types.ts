const encoding = 'UTF-8'
export const defaultContentTypes: { [key: string]: string } = {
    ".json": `application/json; charset=${encoding}`,
    ".txt": `text/plain; charset=${encoding}`,
    ".html": `text/html; charset=${encoding}`,
    ".js": `application/x-javascript; charset=${encoding}`,
    ".css": `text/css; charset=${encoding}`,
    ".woff": `font/woff`,
    ".woff2": "font/woff2",
    ".ttf": `font/ttf`,
    ".jpg": 'image/jpeg',
    ".png": 'image/png',
    ".gif": 'image/gif',
}