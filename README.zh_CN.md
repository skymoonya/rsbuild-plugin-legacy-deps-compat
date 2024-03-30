# rsbuild-plugin-legacy-deps-compat

[English](./src/README.md) | 简体中文

假设有一个老项目，这个项目使用了`webpack@4.x`和`postcss@7.x`，你想使用`rsbuild`来为开发和构建提效，但同时又想保留原有的构建方式。这时你可能会发现报错了，这个插件尝试解决这个问题，目前支持解决`webpack`和`postcss`相关的报错

## 快速开始
1. 安装依赖
```
npm i rsbuild-plugin-legacy-deps-compat -D
```
2. 配置 rsbuild
```js
import { defineConfig } from'@rsbuild/core'
import legacyDepsCompat from'rsbuild-plugin-legacy-deps-compat'

export default defineConfig({
  plugins: [
    // 项目中使用了任意版本的 webpack 和 postcss@7.x
    legacyDepsCompat(),

    // 项目中使用了任意的 webpack 和 postcss@<7 ，但是想在rsbuild中使用 postcss@8
    legacyDepsCompat({
      // 将 postcss.config.js 放在 compat 目录下
      configDir: 'compat',
    }),

    // 项目中使用了任意版本的 webpack 并且想使用项目中之前已经存在的 postcss
    legacyDepsCompat({
      customPostcssLoaderOptions: {
        // 这是填写 postcss-loader 的配置
      }
    }),
  ]
})
```

## 配置

| 名称                              | 类型            | 默认值     | 描述                                     |
| --------------------------------- | -------------- | ---------- | ---------------------------------------- |
| webpack                           | `boolean`      | `true`     | 是否给`webpack`设置别名                   |
| postcss                           | `false\|object`| `{}`       | `postcss`配置，设置为`false`不做任何修改   |
| postcss.clearBuiltinPlugins       | `boolean`      | `true`     | 是否清除内置`postcss`插件件               |
| postcss.configDir                 | `string`       | `./`       | `postcss`配置文件所在目录                 |
| postcss.customPostcssLoaderOptions| `any`          | `undefined`| `postcss-loader`配置，设置此项后将会使用自定义的`postcss-loader`，请确保已经安装了`postcss-loader`和`postcss`|
