import { Router } from "express"
import { FileSystemProvider } from "../filesystem"

export function createFSRouter(fsProvider: FileSystemProvider): Router {
  const router = Router()
  // Implement filesystem routes
  return router
} 