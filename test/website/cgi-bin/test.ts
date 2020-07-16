import { CGIFunction, ExecuteResult } from "../../../out";

let func = () => {
    return { content: "hello world" } as ExecuteResult;
}

export default func;