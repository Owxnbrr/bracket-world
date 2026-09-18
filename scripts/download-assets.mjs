import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const source = 'https://blast.tv/rl/tournaments/rlcs-world-championship-2026';
const names = {
  'Twisted Minds': 'twisted-minds', 'Spacestation': 'spacestation',
  'Manchester City': 'manchester-city', 'Gentle Mates': 'gentle-mates',
  'Team Falcons': 'falcons', 'Furia': 'furia', 'Shopify Rebellion': 'shopify-rebellion',
  'Vitality': 'vitality', 'Karmine Corp': 'karmine-corp', 'Virtus.pro': 'virtus-pro',
  'FUT Esports': 'fut', 'NRG': 'nrg',
};
const response = await fetch(source);
if (!response.ok) throw new Error(`Source des logos : HTTP ${response.status}`);
const html = await response.text();
await mkdir('public/logos', { recursive: true });
const found = new Map();
for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
  const name = tag.match(/\balt="([^"]+)"/)?.[1];
  const src = tag.match(/\bsrc="([^"]+)"/)?.[1]?.replaceAll('&amp;', '&');
  if (names[name] && src?.startsWith('https://assets.blast.tv/images/teams/')) {
    const url = new URL(src);
    url.searchParams.delete('width');
    url.searchParams.set('height', '64');
    url.searchParams.set('format', 'png');
    found.set(names[name], url.href);
  }
}
const sources = [];
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [id, url] of found) {
  const result = await fetch(url);
  if (!result.ok) throw new Error(`${id} : HTTP ${result.status}`);
  let bytes = Buffer.from(await result.arrayBuffer());
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    const input = `data:${result.headers.get('content-type')};base64,${bytes.toString('base64')}`;
    const png = await page.evaluate(async (src) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement('canvas');
      const scale = 64 / Math.max(image.naturalWidth, image.naturalHeight);
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png').split(',')[1];
    }, input);
    bytes = Buffer.from(png, 'base64');
  }
  await writeFile(`public/logos/${id}.png`, bytes);
  sources.push(`- \`${id}.png\` — ${url}`);
  console.log(`${id}.png (${bytes.length} octets)`);
}
await browser.close();
if (found.size !== Object.keys(names).length) throw new Error(`Seulement ${found.size}/12 logos trouvés.`);
await writeFile('public/logos/README.md', `# Logos des équipes\n\nSource : [BLAST, RLCS World Championship 2026](${source}).\nTéléchargés le 18 septembre 2026. Les marques appartiennent à leurs propriétaires respectifs.\n\n${sources.join('\n')}\n\nLes logos sont servis localement. Un fichier absent ou illisible est remplacé par les initiales de l’équipe.\n`);

await mkdir('public/fonts', { recursive: true });
const fontRequest = 'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&display=swap';
const fontResponse = await fetch(fontRequest, { headers: { 'User-Agent': 'Mozilla/5.0' } });
if (!fontResponse.ok) throw new Error('Téléchargement des polices indisponible.');
let css = await fontResponse.text();
const urls = [...new Set([...css.matchAll(/url\((https:\/\/[^)]+)\)/g)].map((match) => match[1]))];
for (const [index, url] of urls.entries()) {
  const file = `barlow-${index}.${new URL(url).pathname.split('.').pop()}`;
  const font = await fetch(url);
  if (!font.ok) throw new Error(`Police ${file} indisponible.`);
  await writeFile(`public/fonts/${file}`, Buffer.from(await font.arrayBuffer()));
  css = css.replaceAll(url, `/fonts/${file}`);
}
await writeFile('public/fonts/fonts.css', css);
const license = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/barlow/OFL.txt');
if (!license.ok) throw new Error('Licence des polices indisponible.');
await writeFile('public/fonts/OFL.txt', await license.text());
console.log(`${urls.length} polices enregistrées en local.`);
