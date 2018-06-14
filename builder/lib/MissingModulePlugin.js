/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This Webpack plugin ensures `npm install <library>` forces a project rebuild.
// We’re not sure why this isn't Webpack's default behavior.
// See https://github.com/facebook/create-react-app/issues/186.
// 暂时fix creat-react-app未完全接入webpack的fix
// webpack4 将missingDependencies和contextDependencies变为set类型，之前为数组，这里参照官方尚未发布的fix


class WatchMissingNodeModulesPlugin {
    constructor(nodeModulesPath) {
        this.nodeModulesPath = nodeModulesPath;
    }

    apply(compiler) {
        compiler.hooks.emit.tap('WatchMissingNodeModulesPlugin', (compilation) => {
            const missingDeps = Array.from(compilation.missingDependencies);
            const nodeModulesPath = this.nodeModulesPath;

            // If any missing files are expected to appear in node_modules...
            if (missingDeps.some(file => file.includes(nodeModulesPath))) {
                // ...tell webpack to watch node_modules recursively until they appear.
                compilation.contextDependencies.add(nodeModulesPath);
            }
        });
    }
}

module.exports = WatchMissingNodeModulesPlugin;
