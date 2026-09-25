import { readFileSync, writeFileSync } from 'node:fs';

const raw = JSON.parse(readFileSync('scripts/photos.json', 'utf8'));

const extra = {
  gordon: {
    en: 'Anthony Gordon',
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Team_England_England_v_Ghana_at_2026_Fifa_World_Cup_by_YantsImages_03_%28Anthony_Gordon%29.jpg/500px-Team_England_England_v_Ghana_at_2026_Fifa_World_Cup_by_YantsImages_03_%28Anthony_Gordon%29.jpg',
  },
  king: {
    en: 'Leon King',
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Leon_King_2022.jpg/500px-Leon_King_2022.jpg',
  },
  suarez: {
    en: 'Luis Suárez',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Luis_Su%C3%A1rez_2018.jpg',
  },
};

const photos = { ...raw.found, ...extra };
for (const row of Object.values(photos)) {
  row.photo = row.photo.split('?')[0];
}

const lines = Object.entries(photos)
  .map(([id, row]) => `  ${id}: { en: ${JSON.stringify(row.en)}, photo: ${JSON.stringify(row.photo)} },`)
  .join('\n');

writeFileSync(
  'lib/playerPhotos.ts',
  `export const PLAYER_PHOTOS: Record<string, { en: string; photo: string }> = {\n${lines}\n};\n`,
);

console.log(Object.keys(photos).length);
