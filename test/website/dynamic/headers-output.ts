import { RequestContext } from "../../../out";

export default function (args: RequestContext) {
    return { content: JSON.stringify(args.req.headers) };
}