import { join } from 'path';
import { builtinModules } from 'module';
import typescriptPlugin from 'rollup-plugin-typescript2';

import modulePkg from './package.json';

const src = join(__dirname, 'src');
const lib = join(__dirname, 'lib');

export default {
    input: 'src/index.ts',
    output: [
      {
        file: join(lib, 'lib/index.js'),
        format: 'cjs',
        exports: 'named'
      },
      {
        file: join(lib, 'lib/index.mjs'),
        format: 'esm'
      }
    ],
    plugins: [
        typescriptPlugin({
            useTsconfigDeclarationDir: false,
            tsconfigOverride: {
                outDir: lib,
                rootDir: src,
                include: [src]
            }
        })
    ],
    external: [
        ...Object.keys(modulePkg.dependencies || {}),
        ...Object.keys(modulePkg.peerDependencies || {}),
        ...builtinModules
    ],
};
