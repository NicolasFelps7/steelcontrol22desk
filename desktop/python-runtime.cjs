'use strict';
const fs = require('node:fs');
const path = require('node:path');

// npm start deve usar as mesmas dependências que INSTALAR_EDGE.ps1 instalou.
function developmentPython(projectRoot, options = {}) {
  const env = options.env || process.env;
  if (env.STEELCONTROL_PYTHON) return env.STEELCONTROL_PYTHON;
  const platform = options.platform || process.platform;
  const exists = options.exists || fs.existsSync;
  const local = path.join(projectRoot, '.venv-edge', ...(platform === 'win32'
    ? ['Scripts', 'python.exe'] : ['bin', 'python']));
  return exists(local) ? local : platform === 'win32' ? 'python' : 'python3';
}

module.exports = { developmentPython };
