# rsbuild-plugin-legacy-deps

English | [简体中文](README.zh_CN.md)

Suppose you have an old project that uses `webpack@4.x` and `postcss@7.x`, and you want to use `rsbuild` to improve efficiency for development and building while also retaining the original build method. You might encounter errors at this point, and this plugin attempts to solve this problem, currently supporting solutions for `webpack` and `postcss` related errors.

## Configuration

| Name                        | Type            | Default| Description                                                    |
| --------------------------- | --------------- | ------ | -------------------------------------------------------------- |
| webpack                     | `boolean`       | `true` | Whether to set an alias for `webpack`                          |
| postcss                     | `false\|object` | `{}`   | `postcss` related configuration, set to `false` for no changes |
| postcss.clearBuiltinPlugins | `boolean`       | `true` | Whether to clear built-in `postcss` plugins                    |
| postcss.configDir           | `string`        | `./`   | The directory where the `postcss` configuration file is located|
