import { Content } from "./request-processor";

export type ContentTransform = (content: Content) => Content | Promise<Content>; 