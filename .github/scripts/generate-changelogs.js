import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CHANGELOG_URL =
  process.env.CHANGELOG_URL ??
  'https://raw.githubusercontent.com/Fchat-Horizon/Horizon/refs/heads/development/CHANGELOG.md';

const OUT_DIR = join(__dirname, '../../src/docs/changelogs');

const REPO_BASE = 'https://github.com/Fchat-Horizon/Horizon';
const REPO_BRANCH = 'development';

function rewriteRepoLinks(text) {
  return text.replace(/\[([^\]]*)\]\((\/[^)]*)\)/g, (match, label, path) => {
    const isDir = path.endsWith('/');
    const type = isDir ? 'tree' : 'blob';
    return `[${label}](${REPO_BASE}/${type}/${REPO_BRANCH}${path})`;
  });
}

// ---------------------------------------------------------------------------

console.log(`Fetching changelog from ${CHANGELOG_URL} …`);
const raw = await fetch(CHANGELOG_URL).then(r => {
  if (!r.ok)
    throw new Error(`Failed to fetch changelog: ${r.status} ${r.statusText}`);
  return r.text();
});

const VERSION_HEADING = /^## \[(\d+\.\d+\.\d+)\][^\n]*/m;
const sections = raw
  .split(/(?=^## \[\d+\.\d+\.\d+\])/m)
  .filter(s => VERSION_HEADING.test(s));

if (!sections.length) {
  console.error('No version sections found in changelog — check the format.');
  process.exit(1);
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

let written = 0;
for (const section of sections) {
  const match = section.match(VERSION_HEADING);
  if (!match) continue;

  const version = match[1];
  const body = rewriteRepoLinks(
    section.replace(/^## \[\d+\.\d+\.\d+\][^\n]*\n/, '').trim()
  );

  const content = [
    `# Horizon ${version}`,
    '',
    `Download [here](https://horizn.moe/download.html?ver=v${version}).`,
    '',
    body,
    ''
  ].join('\n');

  writeFileSync(join(OUT_DIR, `v${version}.md`), content, 'utf8');
  console.log(`  wrote v${version}.md`);
  written++;
}

console.log(
  `\nDone — ${written} changelog file(s) written to src/docs/changelogs/.`
);
