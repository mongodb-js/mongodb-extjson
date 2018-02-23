import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
  input: 'index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'mongodb-extjson',
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({
      presets: [
        [
          'env',
          {
            modules: false
          }
        ]
      ]
    })
  ],
  external: ['bson'],
}
