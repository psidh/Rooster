const { exec } = require("child_process");
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const app = require("express")();
const cors = require("cors");
app.use(cors());
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const Redis = require("ioredis");

const PROJECT_ID = process.env.PROJECT_ID;
const accessKeyId = "";
const secretAccessKey = "";
const publisher = new Redis(
  ""
);

function publishLog(log) {
  publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({ log }));
}

if (!accessKeyId || !secretAccessKey) {
  console.error("Error: AWS credentials are not set.");
  process.exit(1);
}

const client = new S3Client({
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  region: "ap-south-1",
});

async function init() {
  console.log("Executing _init_ in script.js");
  publishLog("build started...");
  const outDirPath = path.join(__dirname, "output");

  const process = exec(`cd ${outDirPath} && npm install && npm run build`);

  process.stdout.on("data", (data) => {
    console.log(data.toString());
    publishLog(data.toString());
  });

  process.stderr.on("error", (err) => {
    console.log("init function => Error:", err.toString());
    publishLog("init function => Error:", err.toString());
  });

  process.on("close", async function () {
    console.log("Build Completed");
    publishLog("Build Completed");
    const distPath = path.join(__dirname, "output", "dist");
    console.log("distPath:", distPath);

    if (!fs.existsSync(distPath)) {
      console.log("Error: 'dist' directory does not exist:", distPath);
      return;
    }

    const distContents = fs.readdirSync(distPath, { recursive: true });

    console.log("distContents:", distContents);
    publishLog("Uploading files to S3...");
    for (const file of distContents) {
      const filePath = path.join(distPath, file);

      if (fs.lstatSync(filePath).isDirectory()) {
        continue;
      }

      console.log("Uploading file:", filePath);
      publishLog(`Uploading file: ${file}`);

      const command = new PutObjectCommand({
        Bucket: "psidh-deployment-pipeline",
        Key: `__outputs/${PROJECT_ID}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath) || "application/octet-stream",
      });

      try {
        await client.send(command);
        console.log("File uploaded successfully:", filePath);
        publishLog(`File uploaded successfully: ${filePath}`);
      } catch (error) {
        console.log("Upload error:", error);
      }
    }

    console.log("All files uploaded successfully");
    publishLog("All files uploaded successfully");
  });
}

init();
