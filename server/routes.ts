import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./firebase-storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Umbrella routes
  
  // Get all umbrellas
  app.get("/api/umbrellas", async (req, res) => {
    try {
      const umbrellas = await storage.getAllUmbrellas();
      res.json(umbrellas);
    } catch (error) {
      console.error('Error fetching umbrellas:', error);
      res.status(500).json({ error: "Failed to fetch umbrellas" });
    }
  });

  // Get umbrella by number
  app.get("/api/umbrellas/:number", async (req, res) => {
    try {
      const umbrellaNumber = parseInt(req.params.number);
      const umbrella = await storage.getUmbrellaByNumber(umbrellaNumber);
      
      if (!umbrella) {
        return res.status(404).json({ error: "Umbrella not found" });
      }
      
      res.json(umbrella);
    } catch (error) {
      console.error('Error fetching umbrella:', error);
      res.status(500).json({ error: "Failed to fetch umbrella" });
    }
  });

  // Create umbrella
  app.post("/api/umbrellas", async (req, res) => {
    try {
      const { umbrellaNumber } = req.body;
      
      if (!umbrellaNumber || umbrellaNumber < 1 || umbrellaNumber > 21) {
        return res.status(400).json({ error: "Invalid umbrella number (1-21)" });
      }

      const umbrella = await storage.createUmbrella({
        umbrellaNumber,
        status: "available",
      });
      
      res.status(201).json(umbrella);
    } catch (error) {
      console.error('Error creating umbrella:', error);
      res.status(500).json({ error: "Failed to create umbrella" });
    }
  });

  // Borrow umbrella
  app.post("/api/umbrellas/:number/borrow", async (req, res) => {
    try {
      const umbrellaNumber = parseInt(req.params.number);
      const { borrower, borrowerPhone, borrowLocation } = req.body;
      
      if (!borrower || !borrowerPhone || !borrowLocation) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if umbrella exists and is available
      const existingUmbrella = await storage.getUmbrellaByNumber(umbrellaNumber);
      if (!existingUmbrella) {
        return res.status(404).json({ error: "Umbrella not found" });
      }
      
      if (existingUmbrella.status === "borrowed") {
        return res.status(400).json({ error: "Umbrella is already borrowed" });
      }

      // Update umbrella
      const umbrella = await storage.updateUmbrella(umbrellaNumber, {
        status: "borrowed",
        borrower,
        borrowerPhone,
        borrowLocation,
        borrowedAt: new Date(),
        returnLocation: null,
        returnedAt: null,
      });

      // Create activity
      await storage.createActivity({
        type: "borrow",
        umbrellaNumber,
        borrower,
        location: borrowLocation,
      });
      
      res.json(umbrella);
    } catch (error) {
      console.error('Error borrowing umbrella:', error);
      res.status(500).json({ error: "Failed to borrow umbrella" });
    }
  });

  // Return umbrella
  app.post("/api/umbrellas/:number/return", async (req, res) => {
    try {
      const umbrellaNumber = parseInt(req.params.number);
      const { returnLocation } = req.body;
      
      if (!returnLocation) {
        return res.status(400).json({ error: "Return location is required" });
      }

      // Check if umbrella exists and is borrowed
      const existingUmbrella = await storage.getUmbrellaByNumber(umbrellaNumber);
      if (!existingUmbrella) {
        return res.status(404).json({ error: "Umbrella not found" });
      }
      
      if (existingUmbrella.status === "available") {
        return res.status(400).json({ error: "Umbrella is not borrowed" });
      }

      const borrower = existingUmbrella.borrower || "Unknown";

      // Update umbrella
      const umbrella = await storage.updateUmbrella(umbrellaNumber, {
        status: "available",
        borrower: null,
        borrowerPhone: null,
        borrowLocation: null,
        borrowedAt: null,
        returnLocation,
        returnedAt: new Date(),
      });

      // Create activity
      await storage.createActivity({
        type: "return",
        umbrellaNumber,
        borrower,
        location: returnLocation,
      });
      
      res.json(umbrella);
    } catch (error) {
      console.error('Error returning umbrella:', error);
      res.status(500).json({ error: "Failed to return umbrella" });
    }
  });

  // Initialize all 21 umbrellas
  app.post("/api/umbrellas/initialize", async (req, res) => {
    try {
      await storage.initializeAllUmbrellas();
      res.json({ success: true, message: "All 21 umbrellas initialized successfully" });
    } catch (error) {
      console.error('Error initializing umbrellas:', error);
      res.status(500).json({ error: "Failed to initialize umbrellas" });
    }
  });

  // Activity routes
  
  // Get all activities
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getAllActivities();
      res.json(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Database management

  // Reset database
  app.post("/api/reset", async (req, res) => {
    try {
      await storage.resetDatabase();
      res.json({ success: true, message: "Database reset successfully" });
    } catch (error) {
      console.error('Error resetting database:', error);
      res.status(500).json({ error: "Failed to reset database" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
