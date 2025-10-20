const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

// ✅ CONFIGURACIÓN PARA WINDOWS
// ⚠️ Asegúrate de que estas rutas coincidan con donde instalaste ffmpeg
// (usa `where ffmpeg` en la terminal para verificar)
const ffmpegPath = "C:\\ffmpeg-8.0-full_build\\bin\\ffmpeg.exe";
const ffprobePath = "C:\\ffmpeg-8.0-full_build\\bin\\ffprobe.exe";

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// ✅ Conversión base64 MOV → MP4 (solo si es necesario)
async function movBase64ToMp4Base64(name, base64) {
  try {
    if (!base64) throw new Error("Base64 vacío o indefinido");

    // ⚡ Si ya es MP4 o viene con prefijo correcto, no convertir
    if (
      base64.trim().startsWith("data:video/mp4") ||
      name.toLowerCase().endsWith(".mp4")
    ) {
      if (!base64.trim().startsWith("data:video/mp4")) {
        return `data:video/mp4;base64,${base64}`;
      }
      return base64;
    }

    // 🗂 Crear carpeta temporal si no existe
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const movPath = path.join(tmpDir, name);
    const mp4Path = path.join(tmpDir, `${name}.mp4`);

    // 📝 Guardar archivo temporal MOV
    fs.writeFileSync(movPath, Buffer.from(base64, "base64"));

    console.log(`🎞️ Convirtiendo ${name} a MP4...`);

    // 🚀 Ejecutar conversión con ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(movPath)
        .output(mp4Path)
        .on("end", () => {
          console.log(`✅ Conversión completa: ${mp4Path}`);
          resolve();
        })
        .on("error", (err) => {
          console.error("❌ Error en ffmpeg:", err.message);
          reject(err);
        })
        .run();
    });

    // 📦 Leer archivo convertido
    const mp4Buffer = fs.readFileSync(mp4Path);
    const base64Mp4 = `data:video/mp4;base64,${mp4Buffer.toString("base64")}`;

    // 🧹 Limpiar archivos temporales
    fs.unlinkSync(movPath);
    fs.unlinkSync(mp4Path);

    return base64Mp4;
  } catch (err) {
    console.error("⚠️ Error en movBase64ToMp4Base64:", err.message);
    // 🔄 Devolver el base64 original como respaldo (sin romper la app)
    return `data:video/mp4;base64,${base64 || ""}`;
  }
}

module.exports = { movBase64ToMp4Base64 };
