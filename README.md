# NODE-WEB-SERVER

采用 nodejs 编写的 WEB SERVER

## 功能列表

- 支持静态文件
- 支持脚本文件
- 支持扩展

## 快速入门

示例一：

自动设置端口

```ts
let webserver = new WebServer()
console.log(`Web server port is ${webserver.port}.`)
```

示例二：

设置端口

```ts
let settings: Settings = { port: 8085 }
let webserver = new WebServer(settings)
console.log(`Web server port is ${webserver.port}.`)
```

示例三：

设置网站文件夹

```ts
let settings: Settings = { websiteDirectory: 'your website path' }
let webserver = new WebServer(settings)
console.log(`Web server port is ${webserver.port}.`)
```

示例四：

使用动态脚本文件

- 创建网站文件夹
- 在网站文件夹内创建 cgi-bin 文件夹
- 创建 hello-world.js 文件

文件夹如下：

```
website
|--cgi-bin
|--|--hello-world.js
|--index.js
```

index.js 文件内容：

```js
const { WebServer } = require('maishu-node-web-server')
let webserver = new WebServer({
  port: 8080,
  websiteDirectory: 'your website path'
})
```

hello-world.js 文件内容：

```js
exports.default = function (args) {
  content: 'Hello World'
}
```

在浏览器地址栏输入 http://127.0.0.1:8080/hello-world.js ，浏览器显示内容：

```
Hello World
```

## node-web-server 设置

**设置**

```ts
export interface Settings {
  /** 服务端口 */
  port?: number
  /** 绑定的 IP 地址，客户端只能通过绑定的 IP 进行连接，为空即所有可用 IP */
  bindIP?: string
  /** 日志 */
  log?: {
    /** 日志等级 */
    level?: LogLevel
  }
  /** 请求处理器类型 */
  requestProcessorTypes?: { new (config?: any): RequestProcessor }[]
  /** 请求处理器配置 */
  requestProcessorConfigs?: { [key: string]: any }
  /** 网站文件夹 */
  websiteDirectory?: string | VirtualDirectory
  /** 请求结果转换器 */
  requestResultTransforms?: RequestResultTransform[]
}
```

**属性**

| 名称              | 类型                     | 只读 | 定义                                           |
| ----------------- | ------------------------ | ---- | ---------------------------------------------- |
| port              | number                   | 是   | 端口，用于和客户端进行连接                     |
| bindIP            | string                   | 是   | 绑定 IP                                        |
| requestProcessors | RequestProcessor[]       | 是   | 请求处理器实例                                 |
| source            | http.Server              | 是   |
| contentTransforms | RequestResultTransform[] | 是   | 内容转换器，用于对请求处理器输出的内容进行转换 |

---

**示例**

## 请求处理器

node-web-server 通过 RequestProcessor 类处理客户端提交上来的请求。通过 settings 的 requestProcessorTypes （数组类型） 参数设置。node-web-server 内置三个请求处理器，分别是 ProxyRequestProcessor, CGIRequestProcessor, StaticFileRequestProcessor。它们分别处理三类请求：

- 请求代理
- 动态脚本的请求
- 静态文件请求

### 请求代理

ProxyRequestProcessor 类用于处理代理请求，它内置于 node-web-server。设置定义：

```ts
export interface ProxyItem {
  targetUrl: string
  headers?:
    | { [name: string]: string }
    | ((
        requestContext: RequestContext
      ) => { [name: string]: string } | Promise<{ [name: string]: string }>)
}

export interface ProxyConfig {
  proxyTargets: { [key: string]: ProxyItem | string }
}
```

| 字段      | 解释                                 |
| --------- | ------------------------------------ |
| targetUrl | 转发请求的目标地址，支持正则表达式   |
| headers   | 转发请求到目标地址时，附件的 HTTP 头 |

ProxyRequestProcessor 是内置于 node-web-server 中，使用是只需要配置即可。

**示例**

```ts
let proxyConfig: ProxyConfig = {
  proxyTargets: {
    '/AdminWeiXin/(\\S+)': {
      targetUrl: `http://127.0.0.1:${station.port}/$1`,
      headers: function () {
        return { token }
      }
    },
    // 用于测试异步 headers
    '/Proxy1/(\\S+)': {
      targetUrl: `http://127.0.0.1:${station.port}/$1`,
      headers: async function () {
        return { token }
      }
    }
  }
}

let w = new WebServer({
  requestProcessorConfigs: {
    Proxy: proxyConfig
  }
})
```

### 请求处理机制

Settings 接口定义

```ts
export interface Settings {
  port?: number
  bindIP?: string
  logLevel?: LogLevel
  requestProcessorTypes?: { new (config?: any): RequestProcessor }[]
  requestProcessorConfigs?: { [key: string]: any }
  websiteDirectory?: string | VirtualDirectory
  requestResultTransforms?: RequestResultTransform[]
}
```

RequestProcessor 接口定义

```ts
export interface RequestProcessor {
  execute(
    args: RequestContext
  ): RequestResult | Promise<RequestResult | null> | null
}
```

node-web-server 依照照 requestProcessorTypes 数组创建一组 RequestProcessor 对象， 通过这个 RequestProcessor 数组对客户端提交的请求进行处理（调用 execute 方法），如果 execute 方法返回 null 值，则调用下一个 RequestProcessor 对象的 execute 方法。如果返回的不是 null 值，则将结果输出到客户端。

### 添加请求处理
