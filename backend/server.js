// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());

// In-memory storage (replace with DB later)
let products = [];
let bids = [];

// Create product (Seller)
app.post('/products', (req, res) => {
  const product = {
    id: Date.now().toString(),
    title: req.body.title,
    description: req.body.description,
    startPrice: req.body.startPrice,
    currentPrice: req.body.startPrice,
    endTime: req.body.endTime,
    seller: req.body.seller,
    status: 'ACTIVE'
  };
  products.push(product);
  res.json(product);
});

// Get all products
app.get('/products', (req, res) => {
  res.json(products);
});

// Place bid
app.post('/bids', (req, res) => {
  const { productId, bidder, amount } = req.body;
  const product = products.find(p => p.id === productId);

  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (amount <= product.currentPrice) {
    return res.status(400).json({ error: 'Bid must be higher than current price' });
  }

  product.currentPrice = amount;

  const bid = {
    id: Date.now().toString(),
    productId,
    bidder,
    amount,
    time: new Date()
  };

  bids.push(bid);
  io.emit('newBid', { productId, amount, bidder });
  res.json(bid);
});

// Socket.IO
io.on('connection', socket => {
  console.log('User connected');
});

server.listen(5000, () => {
  console.log('Bidzio backend running on port 5000');
});

