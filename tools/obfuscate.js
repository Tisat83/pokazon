/**
 * Обфускация и минификация OKO файлов.
 * Вход: ./public/sdk.js, ./public/oko-operator.js, ./public/oko-widget.js
 * Выход: ./dist/*.min.obf.js
 */
const fs = require('fs');
const path = require('path');
const Terser = require('terser');
const JavaScriptObfuscator = require('javascript-obfuscator');

const files = [
  { in: path.join('public', 'sdk.js'), out: path.join('dist', 'sdk.min.obf.js') },
  { in: path.join('public', 'oko-operator.js'), out: path.join('dist', 'oko-operator.min.obf.js') },
  { in: path.join('public', 'oko-widget.js'), out: path.join('dist', 'oko-widget.min.obf.js') },
];

const obfConfig = JSON.parse(fs.readFileSync(path.join('tools', 'obfuscate.config.json'), 'utf8'));

fs.mkdirSync('dist', { recursive: true });

(async function run() {
  for (const f of files) {
    if (!fs.existsSync(f.in)) {
      console.warn('[skip]', f.in, 'не найден');
      continue;
    }
    const src = fs.readFileSync(f.in, 'utf8');
    const min = await Terser.minify(src, {
      compress: true,
      mangle: true,
      ecma: 2020
    });
    if (min.error) {
      console.error('[terser error]', f.in, min.error);
      process.exit(1);
    }
    const obf = JavaScriptObfuscator.obfuscate(min.code, obfConfig);
    fs.writeFileSync(f.out, obf.getObfuscatedCode(), 'utf8');
    console.log('[ok]', f.out);
  }
})();