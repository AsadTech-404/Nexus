import express from "express"
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import collabRoute from "./routes/collab.route.js";
import dashboardRoute from "./routes/dashboard.route.js";
import cors from "cors";
import documentRoute from "./routes/document.route.js";
import notificationRoute from "./routes/notification.route.js";
import meetingRoute from './routes/meeting.route.js';
import messageRoute from "./routes/message.route.js";


const app = express();

app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }
))
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/collab", collabRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/document", documentRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/meeting", meetingRoute);
app.use("/api/message", messageRoute);

export default app