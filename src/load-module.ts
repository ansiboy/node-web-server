import { dir } from "console";
import * as fs from "fs";
import * as path from "path";

export async function loadModule(name: string) {
    let filePath = process.argv[1];
    if (!filePath) throw new Error(`Process argv element 1 is null.`);

    let dirname = path.dirname(filePath);
    let type: "module" | "commonjs" = "commonjs";
    while (dirname) {
        let packageConfigPath = path.join(dirname, "package.json");
        if (fs.existsSync(packageConfigPath)) {
            let buffer = fs.readFileSync(packageConfigPath);
            let packageConfig = buffer.toString();
            let obj = JSON.parse(packageConfig);
            type = obj["type"] || type;
            break;
        }
        dirname = path.dirname(dirname);
    }

    if (type == "commonjs") {
        return require(name);
    }
    else {
        let ext = path.extname(name);
        let module = ext ? await eval(`import("file://${name}")`) : await import(name);
        return module;
    }
}