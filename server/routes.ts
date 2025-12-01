import type { Express } from "express";
import { createServer, type Server } from "http";
import { getChessMove } from "./chessAI";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Chess AI move endpoint
  app.post("/api/chess/move", async (req, res) => {
    try {
      const { playerId, fen, legalMoves, moveHistory } = req.body;
      
      if (!playerId || !fen || !Array.isArray(legalMoves) || legalMoves.length === 0) {
        return res.status(400).json({ 
          error: "Missing required fields: playerId, fen, legalMoves" 
        });
      }
      
      const result = await getChessMove(
        playerId, 
        fen, 
        legalMoves, 
        moveHistory || []
      );
      
      if (result.move) {
        return res.json({ 
          move: result.move,
          error: result.error 
        });
      } else {
        return res.status(500).json({ 
          error: result.error || "Failed to get move" 
        });
      }
    } catch (error) {
      console.error("Chess move error:", error);
      return res.status(500).json({ 
        error: "Internal server error" 
      });
    }
  });

  return httpServer;
}
