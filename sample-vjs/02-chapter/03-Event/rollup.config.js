
import serve from 'rollup-plugin-serve';


const watch = {
  clearScreen: false
};

export default {
  input: 'main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs', // 输出格式
    
  },
  plugins: [
    serve({
      open: true,
      contentBase: './',
      historyApiFallback: true,
      host: 'localhost',
      port: '10001',
    })
  ],
  watch
}