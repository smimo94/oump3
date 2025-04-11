const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.post("/download", (req, res) => {
  const videoUrl = req.body.url;
  const outputDir = "downloads";
  const outputFile = `${Date.now()}.mp3`;

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const command = `yt-dlp -x --audio-format mp3 -o "${outputDir}/%(title)s.%(ext)s" ${videoUrl}`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Download failed:", stderr);
      return res.status(500).send("Download failed.");
    }

    // Get filename from stdout or from the folder
    fs.readdir(outputDir, (err, files) => {
      if (err || files.length === 0) return res.status(500).send("File not found.");

      const filePath = path.join(__dirname, outputDir, files[0]);
      res.setHeader("Content-Disposition", `attachment; filename="${path.basename(filePath)}"`);
        res.download(filePath, () => fs.unlink(filePath, () => {}));
    });
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
