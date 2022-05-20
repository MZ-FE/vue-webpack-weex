#  Weex template

## Build Setup

```bash
# 安装依赖
pnpm i

# 启动dev服务，会监听文件修改并实时变化
pnpm dev

# 使用adb推送到手机，必须开启手机调试模式
pnpm adb
```

## 项目配置
先将src/widgets下的demo修改成需要的品类码，然后修改package.json下的serve脚本，将CATE_NAME的参数改成品类码，最后修改adb脚本即可

项目配置了husky来调用git hook，并执行格式化和commit信息校验，
建议使用npx cz来代替git commit
