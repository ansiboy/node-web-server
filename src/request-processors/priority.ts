/** 内置页面处理优先级，小的优先处理 */
export let processorPriorities = {
    HeadersRequestProcessor: 100,
    ProxyRequestProcessor: 200,
    DynamicRequestProcessor: 300,
    Default: 350,
    FileRequestProcessor: 380,
    StaticFileRequestProcessor: 400,
}