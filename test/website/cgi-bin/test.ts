import { RequestResult } from "../../../out";

let func = () => {
    return { content: "hello world" } as RequestResult;
}

export default func;