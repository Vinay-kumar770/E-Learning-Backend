import express, { Application, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import socketIo, { Server as SocketIOServer } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
// import { RedisClient, createClient } from "redis";

import authRoutes from "./routes/auth";
import teacherRoutes from "./routes/teacher";
import homeRoutes from "./routes/homepage";
import courseRoutes from "./routes/coursepage";
import stripeRoute from "./routes/stripe";
import { config } from "./config/config";

dotenv.config();

const app: Application = express();
const server = createServer(app);
const io: SocketIOServer = new socketIo.Server(server);

const MONGODB_URI: string = config.mongoDatabase;
const port = 8080;
// const client: RedisClient = createClient({
//   host: api_key.redisHost,
//   port: api_key.redisPort,
//   password: api_key.redisPassword
// });

io.on("connect", (socket) => {
  socket.on("join", ({ UserName, room, userId }, callback) => {
    console.log(UserName, room, userId);
    let newUser = false;
    let users = [{ id: [] as string[], names: [] as string[] }];

    // Redis logic (commented for now)
    // if (client.exists(room)) {
    //   client.lrange(room, 0, -1, (err, result) => {
    //     if (err) {
    //       callback(err);
    //     } else {
    //       const History: any[] = [];
    //       result.forEach((user) => {
    //         const parsedUser = JSON.parse(user);
    //         History.push(parsedUser);
    //         if (!users[0].id.includes(parsedUser.userId)) {
    //           users[0].id.push(parsedUser.userId);
    //           users[0].names.push(parsedUser.UserName);
    //         }
    //       });

    //       if (!users[0].id.includes(userId)) {
    //         newUser = true;
    //         users[0].id.push(userId);
    //         users[0].names.push(UserName);
    //       }

    //       socket.emit("history", { History, users: users[0].names });
    //       socket.join(room);
    //       io.to(room).emit("admin", {
    //         users: users[0].names,
    //         UserName: "admin",
    //         newUser,
    //         Message: newUser
    //           ? `Welcome to the class ${UserName}!`
    //           : `Welcome back to the class ${UserName}!`,
    //       });

    //       socket.broadcast.to(room).emit("admin", {
    //         users,
    //         UserName: `${UserName}`,
    //         newUser,
    //         Message: `${UserName} has joined!`,
    //       });
    //     }
    //   });
    // }

    callback();
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.use(bodyParser.json());

const allowedOrigins = [
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://e-learning-frontend-beta-pink.vercel.app/",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin as any) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/videos", express.static(path.join(__dirname, "videos")));
app.use("/Files", express.static(path.join(__dirname, "Files")));

const _dirname = path.dirname("");
const buildpath = path.join(_dirname, "../Front-end/build");
app.use(express.static(buildpath));

// app.use((req: Request, res: Response, next: NextFunction) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "OPTIONS,GET,POST,PUT,PATCH,DELETE"
//   );
//   res.setHeader("Access-Control-Allow-Headers", "*");
//   next();
// });

// Routes
app.use(authRoutes);
app.use(teacherRoutes);
app.use(homeRoutes);
app.use(courseRoutes);
app.use(stripeRoute);
app.use("/", (req, res) => {
  res.json({ message: "working" });
});

const connect = async () => {
  try {
    if (!MONGODB_URI) {
      console.log("No mongoDB string defined");
    } else {
      console.log(MONGODB_URI);
      await mongoose.connect(MONGODB_URI);
      console.log("mongo connection successful");
    }
  } catch (error) {
    console.log("error: ", error);
  }
};

app.listen(port, () => {
  console.log(`HTTP Server running on port ${port}`);
  connect();
});

export default app;
