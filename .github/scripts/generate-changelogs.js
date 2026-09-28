import { writeFileSync, mkdirSync, readdirSync, rmSync } from 'fs';
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
  return text
    .replace(/\[([^\]]*)\]\((\/[^)]*)\)/g, (match, label, path) => {
      const isDir = path.endsWith('/');
      const type = isDir ? 'tree' : 'blob';
      return `[${label}](${REPO_BASE}/${type}/${REPO_BRANCH}${path})`;
    })
    .replace(/\[([^\]]*)\]\(([0-9a-f]{7,40})\)/g, (match, label, hash) => {
      return `[${label}](${REPO_BASE}/commit/${hash})`;
    });
}

function existingPages() {
  try {
    return readdirSync(OUT_DIR).filter((f) => /^v.+\.md$/.test(f));
  } catch {
    return [];
  }
}

console.log(`Fetching changelog from ${CHANGELOG_URL} …`);
const raw = await fetch(CHANGELOG_URL).then((r) => {
  if (!r.ok)
    throw new Error(`Failed to fetch changelog: ${r.status} ${r.statusText}`);
  return r.text();
});

// ^ Split on every heading so prerelease sections don't fold into the stable page above them.
const sections = raw.split(/^(?=## \[)/m);

const VERSION_HEADING = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})[^\n]*/;
const LINK_REFERENCE = /^\[[^\]]+\]:\s+\S+\s*$/gm;

const pages = [];
for (const section of sections) {
  const match = section.match(VERSION_HEADING);
  if (!match) continue;

  const [heading, version, date] = match;
  const body = rewriteRepoLinks(
    section.slice(heading.length).replace(LINK_REFERENCE, '').trim(),
  );

  pages.push({
    file: `v${version}.md`,
    content: [
      '---',
      `description: Changelog for Horizon v${version}. New features, changes, and bug fixes.`,
      '---',
      '',
      `# Horizon ${version}`,
      '',
      `**Released on ${date}**`,
      '',
      `Download [here](https://horizn.moe/download.html?ver=v${version}).`,
      '',
      body,
      '',
    ].join('\n'),
  });
}

if (!pages.length) {
  console.error('No version sections found in changelog, check the format.');
  process.exit(1);
}

for (const file of existingPages()) rmSync(join(OUT_DIR, file));
mkdirSync(OUT_DIR, { recursive: true });

for (const { file, content } of pages) {
  writeFileSync(join(OUT_DIR, file), content, 'utf8');
  console.log(`  wrote ${file}`);
}

console.log(
  `\nDone! ${pages.length} changelog file(s) written to src/docs/changelogs/.`,
);
