import type { Express } from "express";
import { createServer } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";

export async function registerRoutes(app: Express) {
  // Proxy everything under /api to your Flask backend on localhost:8000
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8000",
      changeOrigin: true,
      pathRewrite: {
        // strip off the `/api` prefix when forwarding
        "^/api": "",
      },
      logLevel: "debug",
    })
  );

  // If you wanted to add any Node‑side routes you can still do it here,
  // but since your Flask app already speaks /artist, /artist/top-listeners, etc.,
  // you don’t need any additional Express handlers.

  // Return the HTTP server so your index.ts can `listen()` on it
  return createServer(app);
}
/*
import type { Router } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";

const router = Router();

router.get("/artist/by-id", (req, res) => {
  res.json({ success: true });
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api", router);
  const server = createServer(app);
  return server;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Static API route to serve the music data
  app.get("/api/music-profile", (req, res) => {
    const musicData = {
      user: {
        username: "@daniel123",
        swag: 240,
        profileImage: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=200&h=200",
      },
      topArtists: [
        {
          id: 1,
          name: "Beyonce",
          scrobbles: 1240,
          imageUrl: "https://images.unsplash.com/photo-1604514628550-37477afdf4e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBhcnRpc3R8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&h=100"
        },
        {
          id: 2,
          name: "Laufey",
          scrobbles: 987,
          imageUrl: "https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG11c2ljJTIwYXJ0aXN0fGVufDB8fDB8fHww&auto=format&fit=crop&w=100&h=100"
        },
        {
          id: 3,
          name: "Fred Again",
          scrobbles: 856,
          imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bXVzaWMlMjBhcnRpc3R8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&h=100"
        },
        {
          id: 4,
          name: "JORDY",
          scrobbles: 745,
          imageUrl: "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bXVzaWMlMjBhcnRpc3R8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&h=100"
        },
        {
          id: 5,
          name: "Mitski",
          scrobbles: 698,
          imageUrl: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&h=100"
        }
      ]
    };

    res.json(musicData);
  });

  const httpServer = createServer(app);
  return httpServer;
}
  */
