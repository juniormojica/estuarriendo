class SSEService {
  constructor() {
    this.clients = new Map(); // Map admin userId to their response object
    
    // Setup heartbeat to keep connections alive
    setInterval(() => {
      this.broadcast('heartbeat', { timestamp: new Date().toISOString() });
    }, 30000); // 30 seconds
  }

  addClient(userId, res) {
    this.clients.set(userId, res);
    console.log(`[SSE] Admin ${userId} connected. Total active connections: ${this.clients.size}`);
    
    // Listen for client disconnect
    res.on('close', () => {
      this.removeClient(userId);
    });
  }

  removeClient(userId) {
    if (this.clients.has(userId)) {
      this.clients.delete(userId);
      console.log(`[SSE] Admin ${userId} disconnected. Total active connections: ${this.clients.size}`);
    }
  }

  /**
   * Broadcast an event to all connected admins
   * @param {string} eventType - Type of event (e.g., 'property_submitted')
   * @param {object} data - Payload to send
   */
  broadcast(eventType, data) {
    if (this.clients.size === 0) return;

    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;

    this.clients.forEach((res, userId) => {
      try {
        res.write(payload);
      } catch (error) {
        console.error(`[SSE] Error broadcasting to admin ${userId}:`, error);
        this.removeClient(userId);
      }
    });
  }
}

// Export a singleton instance
export const sseService = new SSEService();
