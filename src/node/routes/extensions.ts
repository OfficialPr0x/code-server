import { Router } from "express"
import { ExtensionManager } from "../extensions"

export function createExtensionRouter(extensionManager: ExtensionManager): Router {
  const router = Router()
  // Implement extension routes
  return router
} 