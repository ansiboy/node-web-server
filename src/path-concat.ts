/** 连接多个路径 */
export function pathConcat(...paths: string[]) {
    paths = paths || [];
    if (paths.length == 0)
        return "";
    if (paths.length == 1) {
        return paths[0];
    }
    let str = paths.join("/");
    // 将一个或多个的 / 或者 变为一个 /，例如：/shop/test// 转换为 /shop/test/
    // 或者 D:\shop\test\  转换为 D:/shop/test/
    str = str.replace(/(\/+\\*|\\+\/*)/g, '/');
    //======================================================
    // fixed 把 http:// https:// 变为 http:/ https:/ 的 BUG
    str = str.replace("http:/", "http://");
    str = str.replace("https:/", "https://");
    //======================================================
    return str;
}
