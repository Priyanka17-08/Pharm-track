import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Mock Database (Array based). In production this connects to Supabase/PostgreSQL.
const db = {
  users: [{ id: "u1", shop_id: "s1", username: "admin", password: "password", role: "admin" }],
  shops: [{ id: "s1", name: "Care Pharmacy", owner: "John Doe" }],
  medicines: [
    { id: "m1", shop_id: "s1", name: "Paracetamol 500mg", generic_name: "Acetaminophen 500mg", category: "Antipyretics & Analgesics", manufacturer: "GSK", batch_number: "B-102", mrp: 15, purchase_price: 10, selling_price: 14, stock_quantity: 500, expiry_date: "2026-10-01", supplier: "MedLife Distributors", created_at: "2024-01-01T00:00:00Z" },
    { id: "m2", shop_id: "s1", name: "Amoxicillin 250mg", generic_name: "Amoxicillin Trihydrate", category: "Antibiotics", manufacturer: "Pfizer", batch_number: "A-505", mrp: 50, purchase_price: 35, selling_price: 45, stock_quantity: 3, expiry_date: "2025-11-15", supplier: "Global Pharma", created_at: "2024-02-01T00:00:00Z" }, // low stock
    { id: "m3", shop_id: "s1", name: "Cough Syrup Dx", generic_name: "Dextromethorphan", category: "Cough & Cold Medicines", manufacturer: "Cipla", batch_number: "C-221", mrp: 120, purchase_price: 80, selling_price: 110, stock_quantity: 45, expiry_date: "2024-06-15", supplier: "City Med Supply", created_at: "2024-02-15T00:00:00Z" } // Expiring soon for alerts
  ],
  bills: [],
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // === API ROUTES ===
  
  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.users.find(u => u.username === username && u.password === password);
    if (user) {
      // Mock JWT token
      const token = Buffer.from(JSON.stringify({ userId: user.id, shopId: user.shop_id })).toString('base64');
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Middleware to extract simple mock token
  const authMw = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // Inventory
  app.get("/api/medicines", authMw, (req, res) => {
    res.json(db.medicines.filter(m => m.shop_id === (req as any).user.shopId));
  });

  app.post("/api/medicines", authMw, (req, res) => {
    const newMed = { ...req.body, id: "m" + Date.now(), shop_id: (req as any).user.shopId };
    db.medicines.push(newMed);
    res.json(newMed);
  });
  
  app.put("/api/medicines/:id", authMw, (req, res) => {
    const idx = db.medicines.findIndex(m => m.id === req.params.id && m.shop_id === (req as any).user.shopId);
    if (idx !== -1) {
      db.medicines[idx] = { ...db.medicines[idx], ...req.body };
      res.json(db.medicines[idx]);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  // Billing
  app.post("/api/bills", authMw, (req, res) => {
    const bill = { ...req.body, id: "b" + Date.now(), shop_id: (req as any).user.shopId, date: new Date().toISOString() };
    db.bills.push(bill);
    
    // Deduct stock
    bill.items.forEach(item => {
      const med = db.medicines.find(m => m.id === item.medicine_id);
      if (med) {
        med.stock_quantity = Math.max(0, med.stock_quantity - item.quantity);
      }
    });

    res.json(bill);
  });

  app.get("/api/bills", authMw, (req, res) => {
    res.json(db.bills.filter(b => b.shop_id === (req as any).user.shopId));
  });

  // Sync Endpoint (Offline-first support)
  app.post("/api/sync", authMw, (req, res) => {
    const { medicines, bills } = req.body;
    
    // Process offline creations/updates for medicines
    if (medicines && Array.isArray(medicines)) {
      medicines.forEach(med => {
        if (!med.id.startsWith("m")) {
           // Generated offline ID? Just replace or push (Simplified)
           const newMed = { ...med, id: "m" + Date.now(), shop_id: (req as any).user.shopId };
           db.medicines.push(newMed);
        } else {
           const idx = db.medicines.findIndex(m => m.id === med.id);
           if (idx !== -1) {
             db.medicines[idx] = { ...db.medicines[idx], ...med };
           } else {
             db.medicines.push({ ...med, shop_id: (req as any).user.shopId });
           }
        }
      });
    }

    // Process new bills
    if (bills && Array.isArray(bills)) {
      bills.forEach(bill => {
        if (!db.bills.find(b => b.id === bill.id)) {
           // New offline bill
           const newBill = { ...bill, id: "b" + Date.now(), shop_id: (req as any).user.shopId };
           db.bills.push(newBill);
           newBill.items.forEach(item => {
             const med = db.medicines.find(m => m.id === item.medicine_id);
             if (med) med.stock_quantity = Math.max(0, med.stock_quantity - item.quantity);
           });
        }
      });
    }

    res.json({ success: true, timestamp: Date.now() });
  });

  // === END API ROUTES ===

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // In Express v4, use get('*')
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
