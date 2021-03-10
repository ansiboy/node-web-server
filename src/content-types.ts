const encoding = 'UTF-8'
export const defaultContentTypes: { [key: string]: string } = {
    ".css": `text/css; charset=${encoding}`,
    ".gif": 'image/gif',
    ".html": `text/html; charset=${encoding}`,
    ".jpg": 'image/jpeg',
    ".js": `application/x-javascript; charset=${encoding}`,
    ".json": `application/json; charset=${encoding}`,
    ".png": 'image/png',
    ".ttf": `font/ttf`,
    ".txt": `text/plain; charset=${encoding}`,
    ".webp": "image/webp",
    ".woff": `font/woff`,
    ".woff2": "font/woff2",
}