const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

async function movBase64ToMp4Base64(name, base64) {
  const tmpDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  const movPath = path.join(tmpDir, `${name}`);
  const mp4Path = path.join(tmpDir, `${name}.mp4`);

  fs.writeFileSync(movPath, Buffer.from(base64, "base64"));

  await new Promise((resolve, reject) => {
    ffmpeg(movPath).output(mp4Path).on("end", resolve).on("error", reject).run();
  });

  const mp4Buffer = fs.readFileSync(mp4Path);
  const base64Mp4 = `data:video/mp4;base64,${mp4Buffer.toString("base64")}`;

  fs.unlinkSync(movPath);
  fs.unlinkSync(mp4Path);

  return base64Mp4;
}

module.exports = { movBase64ToMp4Base64 };