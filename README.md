#  vue-webpack-weex
[详细文档](https://github.com/MZ-FE/vue-webpack-weex/wiki)

## Build Setup

```bash
# 安装依赖
pnpm i

# 启动dev服务，会监听文件修改并实时变化
pnpm dev

# 使用adb推送到手机，必须开启手机调试模式
# 先修改.env文件里的DEVICE_INFO，用于指定adb推送的目录
pnpm adb
```

## 模板使用
### 创建页面
在src/views下创建一个文件夹，并在里面创建index.vue，打包时会根据文件夹名字生成对应的entry文件，不建议创建多层文件夹，可能会有无法正常读取assets资源文件的bug。

### git commit
建议使用`pnpm/npm cz`代替`git commit`，可以通过commitlint生成符合angular规范的commit message。并且建议使用git bash或者powershell执行`pnpm/npm cz`，能够在commit前调用git钩子。

### 修改entry生成的文件
比如需要添加vue-i18n插件，可以在`build/makeEntryFile.js`里修改entry的模板。

## 一些已发现的问题
### ES版本支持情况
经过大致的测试支持的ES语法支持到2017或者2018，2019的可选链（Optional Chaining）语法不支持，预估2019之后的语法不支持。尝试过使用新的babel进行转译，但是weex会无法正常渲染页面，暂时没找到别的方法使用更新的ES语法。
