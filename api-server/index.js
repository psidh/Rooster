require("dotenv").config();
console.log(process.env); 
const express = require("express");
const { generateSlug } = require("random-word-slugs");
const cors = require("cors");

const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const { Server } = require("socket.io");
const Redis = require("ioredis");

const app = express();
app.use(cors());
const PORT = 9000;
app.use(express.json());
const subscriber = new Redis(process.env.REDIS_URI);

console.log("Subscriber connected to Redis");

const io = new Server({ cors: "*" });

io.on("connection", (socket) => {
  socket.on("subscribe", (channel) => {
    socket.join(channel);
    socket.emit("message", `Joined ${channel}`);
  });
});

io.listen(9001, () => console.log("Socket Server 9001"));

console.log("Socket Server running on port 9001");

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const config = {
  CLUSTER: process.env.CLUSTER,
  TASK: process.env.TASK,
};

app.post("/project", async (req, res) => {
  console.log(req.body);
  const { gitURL, slug } = req.body;
  const projectSlug = slug ? slug : generateSlug();
  const command = new RunTaskCommand({
    cluster: config.CLUSTER,
    taskDefinition: config.TASK,
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: [process.env.SUBNET_ONE, process.env.SUBNET_TWO, process.env.SUBNET_THREE],
        assignPublicIp: "ENABLED",
        securityGroups: [process.env.SECURITY_GROUP],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "builder-image",
          environment: [
            {
              name: "GIT_REPOSITORY_URL",
              value: gitURL,
            },
            {
              name: "PROJECT_ID",
              value: projectSlug,
            },
          ],
        },
      ],
    },
  });

  await ecsClient.send(command);
  return res.json({
    status: "queued",
    data: {
      projectSlug,
      url: `http://${projectSlug}.localhost:8000`,
    },
  });
});

async function subscribeRedis() {
  console.log("Subscribed to logs....");
  subscriber.psubscribe("logs:*");
  subscriber.on("pmessage", (pattern, channel, message) => {
    const isComplete = message.includes("All files uploaded successfully");
    const logMessage = JSON.stringify({ log: message, complete: isComplete });
    console.log("logmessage: ", logMessage);
    console.log("simple message: ", message);
    io.to(channel).emit("message", logMessage);
  });
}

subscribeRedis();

app.listen(PORT, () => {
  console.log(`API server Proxy running on port ${PORT}`);
});
