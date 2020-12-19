# NODE-WEB-SERVER

采用 nodejs 编写的 WEB SERVER，插件化处理各种类型的请求。

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

### 静态文件

node-web-server 默认支持以下扩展名的静态文件：

.txt .html .js .css .json .jpg

如果需要支持更多类型的静态文件，需要进行设置。比如说需要支持扩展名为 .jpg .gif 的图片

```ts
let settings: Settings = {
  websiteDirectory: 'your website path',
  requestProcessorConfigs: {
    StaticFile: {
      staticFileExtentions: ['.jpg', '.gif']
    }
  }
}
let webserver = new WebServer(settings)
console.log(`Web server port is ${webserver.port}.`)
```

### 动态脚本

node-web-server 支持使用 js 编写的动态脚本文件，动态脚本文件需要放在名为特定的文件夹，该文件夹默认为 **dynamic**，可以同通过配置修改该文件夹路径。

**演示**

- 创建网站文件夹
- 在网站文件夹内创建 dynamic 文件夹
- 创建 hello-world.js 文件

文件夹如下：

```
website
|--dynamic
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
  return {
    content: 'Hello World',
    headers: {
      'Content-Type': 'text/plain'
    }
  }
}
```

**备注**

args 参数类型为 **RequestContext** 定义如下：

```ts
type RequestContext = {
  /** 请求文件的虚拟路径 */
  virtualPath: string
  /** 站点根目录 */
  rootDirectory: VirtualDirectory
  /** 日志级别 */
  logLevel: LogLevel
  res: http.ServerResponse
  req: http.IncomingMessage
}
```

在浏览器地址栏输入 http://127.0.0.1:8080/dynamic/hello-world.js ，浏览器显示内容：

```
Hello World
```

修改动态文件夹路径，例如下面的示例中，把 cgi-bin 文件夹设置动态脚本文件夹。

```ts
const { WebServer } = require('maishu-node-web-server')
let webserver = new WebServer({
  port: 8080,
  websiteDirectory: 'your website path',
  requestProcessorConfigs: {
    Dynamic: {
      path: 'cgi-bin'
    }
  }
})
```

### 请求代理

Node Web Server 内置请求的转发，即可以把接收到的请求，转发到指定的服务器。

下面的示例中，Node Web Server 把接收到的，路径为 "/AdminWeiXin/Index.html" 的请求，转发到地址 "http://127.0.0.1:8085/Index.html" 。

**示例:**

```ts
import { ProxyProcessor, ProxyConfig } from 'maishu-node-web-server'
let webserver = new WebServer({
  port: 8080,
  requestProcessorConfigs: {
    Proxy: {
      proxyTargets: {
        '/AdminWeiXin/Index.html': `http://127.0.0.1:8085/Index.html`
      }
    }
  }
})
```

请求代理的路径支持使用正则表式进行匹配，下面的示例中，使用正则表达式对路径进行匹配。

**示例：**

```ts
import { ProxyProcessor, ProxyConfig } from 'maishu-node-web-server'
let webserver = new WebServer({
  port: 8080,
  requestProcessorConfigs: {
    Proxy: {
      proxyTargets: {
        '/AdminWeiXin/(\\S+)': `http://127.0.0.1:8085/$1`
      }
    }
  }
})
```

请求代理在转发请求的时候，可以额外附加 HTTP 头。

**示例：**

```ts
import { ProxyProcessor, ProxyConfig } from 'maishu-node-web-server'
let webserver = new WebServer({
  port: 8080,
  requestProcessorConfigs: {
    Proxy: {
      proxyTargets: {
        '/AdminWeiXin/(\\S+)': {
          targetUrl: `http://127.0.0.1:8085/$1`,
          headers: {
            token: '1603161114105'
          }
        }
      }
    }
  }
})
```

headers 可以是键值对，也可以是一个函数。

**示例：**

```ts
import { ProxyProcessor, ProxyConfig } from 'maishu-node-web-server'
let webserver = new WebServer({
  port: 8080,
  requestProcessorConfigs: {
    Proxy: {
      proxyTargets: {
        '/AdminWeiXin/(\\S+)': {
          targetUrl: `http://127.0.0.1:8085/$1`,
          headers: function () {
            return {
              token: '1603161114105'
            }
          }
        }
      }
    }
  }
})
```

## 深入了解

### 请求的处理

Node Web Server 在接收到客户端的请求后，会将接收到的请求进行处理，然后将结果输出。这个过程涉及两个接口：

- RequestProcessor（请求处理器） 负责对接收到的请求进行处理
- RequestResultTransform（请求结果转换器） 对请求后的结果进行转换

Node Web Server 内置多个请求处理器，用于对各种请求进行处理，包括：

- DynamicRequestProcessor 用于处理动态脚本文件
- ProxyRequestProcessor 用于处理代理请求
- StaticFileRequestProcessor 用于处理静态文件

默认情况下，这几个请求处理器处理请求的顺序是：

- ProxyRequestProcessor
- DynamicRequestProcessor
- StaticFileRequestProcessor

**示例：**

文件夹如下

```
website
|--index.html
```

```ts
import { ProxyProcessor, ProxyConfig } from 'maishu-node-web-server'
let webserver = new WebServer({
  port: 8080,
  requestProcessorConfigs: {
    Proxy: {
      proxyTargets: {
        '/index.html': `http://127.0.0.1:8085/index.html`
      }
    }
  }
})
```

在浏览器输入地址：http://127.0.0.1:8080/index.html ，实际看到的并不是文件夹下的 index.html 文件，而且 http://127.0.0.1:8085/index.html 页面。这是因为 ProxyRequestProcessor 比 StaticFileRequestProcessor 具有高的优先级

### 请求处理器的实现



### 请求结果转换 (RequestResultTransform) 函数



