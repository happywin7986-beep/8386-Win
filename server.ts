import express from 'express';
import path from 'path';
import fs from 'fs';
import { defaultProducts, defaultCategories } from './src/data';
import { Product, Category, User, PaymentRequest } from './src/types';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'server-db.json');

app.use(express.json());

// Helper to secure prompts
function maskPrompt(prompt: string): string {
  if (!prompt) return '';
  const parts = prompt.split('--');
  const mainText = parts[0].trim();
  const parameters = parts.slice(1).map(p => '--' + p.trim()).join(' ');
  const words = mainText.split(' ');
  const maskedWords = words.map((w, index) => {
    if (index < 2 || w.startsWith('--')) return w;
    return '***';
  });
  return maskedWords.join(' ') + (parameters ? ' ' + parameters : '');
}

// Read database file
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      // Seed initial database
      const initialDb = {
        products: defaultProducts.map((p) => ({
          ...p,
          prompt: maskPrompt(p.prompt),
          articles: p.articles?.map((art) => ({
            ...art,
            prompt: maskPrompt(art.prompt),
          })),
        })),
        categories: defaultCategories,
        users: [
          {
            username: 'admin',
            password: 'admin123',
            points: 99999,
            unlockedProducts: [],
          }
        ],
        paymentRequests: []
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    
    // Ensure structure is correct
    if (!data.products) data.products = [];
    if (!data.categories) data.categories = [];
    if (!data.users) data.users = [];
    if (!data.paymentRequests) data.paymentRequests = [];
    
    // Make sure admin exists
    if (!data.users.some((u: any) => u.username.toLowerCase() === 'admin')) {
      data.users.push({
        username: 'admin',
        password: 'admin123',
        points: 99999,
        unlockedProducts: [],
      });
    }
    
    return data;
  } catch (err) {
    console.error('Database read error:', err);
    return {
      products: [],
      categories: [],
      users: [],
      paymentRequests: []
    };
  }
}

// Write to database file
function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database write error:', err);
  }
}

// --- API ENDPOINTS ---

// Fetch full synchronized state
app.get('/api/db', (req, res) => {
  res.json(readDb());
});

// Sync products list
app.post('/api/products/sync', (req, res) => {
  const { products } = req.body;
  const dbData = readDb();
  if (Array.isArray(products)) {
    dbData.products = products;
    writeDb(dbData);
  }
  res.json({ success: true, db: dbData });
});

// Save or Update single product
app.post('/api/products', (req, res) => {
  const product: Product = req.body;
  const dbData = readDb();
  
  const securedProd: Product = {
    ...product,
    sold: Math.min(3000000, product.sold || 0),
    prompt: maskPrompt(product.prompt),
    articles: product.articles?.map((art) => ({
      ...art,
      prompt: maskPrompt(art.prompt),
    })),
  };

  const idx = dbData.products.findIndex((p: Product) => p.id === product.id);
  if (idx > -1) {
    dbData.products[idx] = securedProd;
  } else {
    dbData.products.push(securedProd);
  }
  dbData.products.sort((a: Product, b: Product) => a.id - b.id);
  writeDb(dbData);
  res.json({ success: true, products: dbData.products });
});

// Delete single product
app.delete('/api/products/:id', (req, res) => {
  const productId = Number(req.params.id);
  const dbData = readDb();
  dbData.products = dbData.products.filter((p: Product) => p.id !== productId);
  writeDb(dbData);
  res.json({ success: true, products: dbData.products });
});

// Reset products to defaults
app.post('/api/products/reset', (req, res) => {
  const dbData = readDb();
  dbData.products = defaultProducts.map((p) => ({
    ...p,
    prompt: maskPrompt(p.prompt),
    articles: p.articles?.map((art) => ({
      ...art,
      prompt: maskPrompt(art.prompt),
    })),
  }));
  writeDb(dbData);
  res.json({ success: true, products: dbData.products });
});

// Add single category
app.post('/api/categories', (req, res) => {
  const category: Category = req.body;
  const dbData = readDb();
  if (!dbData.categories.some((c: Category) => c.slug === category.slug)) {
    dbData.categories.push(category);
    writeDb(dbData);
    res.json({ success: true, categories: dbData.categories });
  } else {
    res.json({ success: false, error: 'Category duplicated', categories: dbData.categories });
  }
});

// Delete single category
app.delete('/api/categories/:slug', (req, res) => {
  const slug = req.params.slug;
  const dbData = readDb();
  dbData.categories = dbData.categories.filter((c: Category) => c.slug !== slug);
  
  // Remap products to fallback category
  if (dbData.categories.length > 0) {
    const fallbackSlug = dbData.categories[0].slug;
    dbData.products = dbData.products.map((p: Product) => {
      if (p.category === slug) {
        return { ...p, category: fallbackSlug };
      }
      return p;
    });
  }
  writeDb(dbData);
  res.json({ success: true, categories: dbData.categories, products: dbData.products });
});

// Reset categories to defaults
app.post('/api/categories/reset', (req, res) => {
  const dbData = readDb();
  dbData.categories = defaultCategories;
  
  if (dbData.categories.length > 0) {
    const fallbackSlug = dbData.categories[0].slug;
    dbData.products = dbData.products.map((p: Product) => {
      const hasValidCat = dbData.categories.some((c: Category) => c.slug === p.category);
      if (!hasValidCat) {
        return { ...p, category: fallbackSlug };
      }
      return p;
    });
  }
  
  writeDb(dbData);
  res.json({ success: true, categories: dbData.categories, products: dbData.products });
});

// Update or Save a User account (points, lock state, etc.)
app.post('/api/users/update', (req, res) => {
  const user: User = req.body;
  const dbData = readDb();
  
  const idx = dbData.users.findIndex((u: User) => u.username.toLowerCase() === user.username.toLowerCase());
  if (idx > -1) {
    dbData.users[idx] = { ...dbData.users[idx], ...user };
  } else {
    dbData.users.push(user);
  }
  
  writeDb(dbData);
  res.json({ success: true, users: dbData.users, user: idx > -1 ? dbData.users[idx] : user });
});

// User registration
app.post('/api/users/register', (req, res) => {
  const { username, password } = req.body;
  const dbData = readDb();
  
  if (username.toLowerCase() === 'admin') {
    return res.json({ success: false, error: 'Admin username is reserved!' });
  }
  
  if (dbData.users.some((u: User) => u.username.toLowerCase() === username.toLowerCase())) {
    return res.json({ success: false, error: 'User is duplicate' });
  }
  
  const newUser: User = {
    username,
    password,
    points: 100, // starting balance
    unlockedProducts: [],
  };
  
  dbData.users.push(newUser);
  writeDb(dbData);
  res.json({ success: true, user: newUser });
});

// Save or add payment request
app.post('/api/payments', (req, res) => {
  const paymentRequest: PaymentRequest = req.body;
  const dbData = readDb();
  
  dbData.paymentRequests.unshift(paymentRequest);
  writeDb(dbData);
  res.json({ success: true, paymentRequests: dbData.paymentRequests });
});

// Approve payment request (and add points)
app.post('/api/payments/approve', (req, res) => {
  const { requestId } = req.body;
  const dbData = readDb();
  
  const reqIdx = dbData.paymentRequests.findIndex((r: PaymentRequest) => r.id === requestId);
  if (reqIdx > -1 && dbData.paymentRequests[reqIdx].status !== 'approved') {
    const request = dbData.paymentRequests[reqIdx];
    request.status = 'approved';
    
    // add points to user
    const userIdx = dbData.users.findIndex((u: User) => u.username.toLowerCase() === request.username.toLowerCase());
    if (userIdx > -1) {
      dbData.users[userIdx].points = (dbData.users[userIdx].points || 0) + request.points;
    }
    
    writeDb(dbData);
    res.json({ success: true, paymentRequests: dbData.paymentRequests, users: dbData.users });
  } else {
    res.json({ success: false, error: 'Request not found or already approved' });
  }
});

// Reject payment request
app.post('/api/payments/reject', (req, res) => {
  const { requestId } = req.body;
  const dbData = readDb();
  
  const reqIdx = dbData.paymentRequests.findIndex((r: PaymentRequest) => r.id === requestId);
  if (reqIdx > -1) {
    dbData.paymentRequests[reqIdx].status = 'rejected';
    writeDb(dbData);
    res.json({ success: true, paymentRequests: dbData.paymentRequests });
  } else {
    res.json({ success: false, error: 'Request not found' });
  }
});

// Configure Vite and boot server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
