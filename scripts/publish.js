#!/usr/bin/env node

/**
 * 发布 npm 包脚本
 * 用法: node scripts/publish.js [patch|minor|major]
 * 默认 bump patch
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function run(cmd) {
  const result = spawnSync(cmd, { stdio: 'inherit', shell: true });
  if (result.error || result.status !== 0) {
    console.error(`\n执行失败: ${cmd}`);
    process.exit(result.status ?? 1);
  }
}

run('npm run check');
run('npm run test');
run('npm run build');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.resolve(__dirname, '../package.json');
const bump = (process.argv[2] || 'patch').toLowerCase();

if (!['patch', 'minor', 'major'].includes(bump)) {
  console.error('用法: node scripts/publish.js [patch|minor|major]');
  process.exit(1);
}

const raw = fs.readFileSync(pkgPath, 'utf-8');
const pkg = JSON.parse(raw);
const current = pkg.version;

// 支持 x.y.z 或 x.y.z-prerelease（如 19.0.0-rc.1）
const dashIndex = current.indexOf('-');
const baseVersion = dashIndex === -1 ? current : current.slice(0, dashIndex);
let prerelease = dashIndex === -1 ? null : current.slice(dashIndex + 1);

const parts = baseVersion.split('.').map(Number);
if (parts.length !== 3 || parts.some(Number.isNaN)) {
  console.error('package.json 中 version 格式须为 x.y.z 或 x.y.z-prerelease');
  process.exit(1);
}

if (bump === 'major') {
  parts[0] += 1;
  parts[1] = 0;
  parts[2] = 0;
  prerelease = null;
} else if (bump === 'minor') {
  parts[1] += 1;
  parts[2] = 0;
  prerelease = null;
} else {
  if (prerelease !== null) {
    // 仅递增 prerelease 尾部的数字，如 rc.1 -> rc.2
    const match = prerelease.match(/^(.+?)(\d+)$/);
    if (match) {
      prerelease = match[1] + String(Number(match[2]) + 1);
    } else {
      prerelease = `${prerelease}.1`;
    }
  } else {
    parts[2] += 1;
  }
}

let nextVersion = parts.join('.');
if (prerelease !== null) {
  nextVersion += `-${prerelease}`;
}
pkg.version = nextVersion;

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8');
console.log(`版本已更新: ${current} -> ${nextVersion}`);


// run('npm login');
run('npm publish');
console.log(`已发布 v${nextVersion}`);
