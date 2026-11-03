import { copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ensureDir, exists, hashContent, walk } from "./utils.mjs";

const MAX_WIDTH = 1600;
const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const CACHE_DIR = path.resolve("node_modules/.cache/rl-images");

/**
 * Copie `public/` vers `dist/`.
 * Les photos déposées dans `public/uploads/` sont automatiquement :
 *   - redressées selon l'EXIF puis débarrassées de leurs métadonnées (GPS, etc.) ;
 *   - réduites à 1600 px de large maximum et recompressées.
 * Retourne les dimensions des images (pour éviter les sauts de mise en page).
 */
export async function buildPublic(publicDir, outDir) {
  const dims = new Map();
  await ensureDir(CACHE_DIR);
  const files = await walk(publicDir);

  await Promise.all(
    files.map(async (file) => {
      const rel = path.relative(publicDir, file).split(path.sep).join("/");
      const dest = path.join(outDir, rel);
      await ensureDir(path.dirname(dest));
      const ext = path.extname(file).toLowerCase();
      const isUpload = rel.startsWith("uploads/");

      if (!isUpload) return copyFile(file, dest);

      if (RASTER.has(ext)) {
        const buf = await readFile(file);
        const key = hashContent(buf);
        const cached = path.join(CACHE_DIR, `${key}${ext}`);
        const cachedMeta = `${cached}.json`;
        if (!(await exists(cached)) || !(await exists(cachedMeta))) {
          let img = sharp(buf, { failOn: "none" }).rotate();
          const meta = await img.metadata();
          // .rotate() échange largeur/hauteur pour les orientations 5-8
          const swapped = meta.orientation && meta.orientation >= 5;
          const width = swapped ? meta.height : meta.width;
          if (width > MAX_WIDTH) img = img.resize({ width: MAX_WIDTH, withoutEnlargement: true });
          if (ext === ".png") img = img.png({ compressionLevel: 9, palette: true });
          else if (ext === ".webp") img = img.webp({ quality: 82 });
          else img = img.jpeg({ quality: 82, mozjpeg: true });
          const { data, info } = await img.toBuffer({ resolveWithObject: true });
          await writeFile(cached, data);
          await writeFile(cachedMeta, JSON.stringify({ width: info.width, height: info.height }));
        }
        await copyFile(cached, dest);
        const { width, height } = JSON.parse(await readFile(cachedMeta, "utf8"));
        dims.set(`/${rel}`, { width, height });
        return;
      }

      await copyFile(file, dest);
      if (ext === ".svg" || ext === ".gif") {
        try {
          const { width, height } = await sharp(file).metadata();
          if (width && height) dims.set(`/${rel}`, { width, height });
        } catch {
          /* dimensions facultatives */
        }
      }
    }),
  );

  return dims;
}
