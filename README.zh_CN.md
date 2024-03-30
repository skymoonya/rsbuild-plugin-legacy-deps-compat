# rsbuild-plugin-legacy-deps-compat

[English](./src/README.md) | 简体中文

假设有一个老项目，这个项目使用了`webpack@4.x`和`postcss@7.x`，你想使用`rsbuild`来为开发和构建提效，但同时又想保留原有的构建方式。这时你可能会发现报错了，这个插件尝试解决这个问题，目前支持解决`webpack`和`postcss`相关的报错

## 配置

| 名称                         | 类型            | 默认值  | 描述                                     |
| --------------------------- | --------------- | ------ | --------------------------------------- |
| webpack                     | `boolean`       | `true` | 是否给`webpack`设置别名                    |
| postcss                     | `false\|object` | `{}`   | `postcss`配置，设置为`false`不做任何修改 |
| postcss.clearBuiltinPlugins | `boolean`       | `true` | 是否清除内置`postcss`插件件                |
| postcss.configDir           | `string`        | `./`   | `postcss`配置文件所在目录                  |
