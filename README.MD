# FF14月儿分发中心

体验DEMO http://yuer.acgme.cn/

## 搭建分发中心

### 需求软件

+ Node.JS
+ MongoDB
+ GraphicsMagick
+ Nginx (Optional)

### 搭建过程

开发
```
git clone git@github.com:AlishaHawkward/yuer-mirai.git
cd yuer-mirai
npm install
npm run dev
```

编译
```
npm run dist
```

运行前请务必创建 `/src/configs/secret.ts` 文件
```
const secret = {
  tencentai: {
    appid: 0, // 腾讯闲聊API的AppID
    secret: '' // 腾讯闲聊API的Secret
  },
  alivision: {
    accessKeyId: '', // 阿里云的accessKeyId
    accessKeySecret: '' // 阿里云的accessKeySecret
  }
}

export default secret
```

## 月華使用说明

### 相关软件下载地址：

Java 下载地址：[JAVA](https://www.java.com/)  
CqHttp-Mirai-Embedded 下载地址：[GITHUB](https://github.com/yyuueexxiinngg/cqhttp-mirai/tree/embedded)

### 使用说明：
1. 下载 Java 运行环境。
2. 下载 CqHttp-Mirai-Embedded 客户端，放置于一个目录内。
3. 在该目录内打开一个终端，输入 `java -jar <cqhttp-mirai-embedded.jar>`。
4. 输入 `login <qq number> <password>` 登录QQ账号。
5. 下载月華的配置文件，将其放至于 `X:\Mirai\plugins\setting.yml`。
6. 重启Mirai。