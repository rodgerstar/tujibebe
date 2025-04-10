const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection (replace with your Atlas URI)
mongoose.connect('mongodb+srv://rodgers:rodgers1234@cluster0.fjysqux.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'));

// Customer Schema
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  loan: { type: Number, default: 0 },
  loanLimit: { type: Number, default: 0 },
  gender: String,
  age: Number,
  homeAddress: String,
  profilePic: { type: String, default: 'https://via.placeholder.com/150' },
});

const Customer = mongoose.model('Customer', customerSchema);

// API Routes
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  } catch (error) {
    console.error('Error fetching customer by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.json(customer);
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/customers/:id/deposit', async (req, res) => {
  try {
    const { amount } = req.body;
    const customer = await Customer.findById(req.params.id);
    customer.balance += amount;
    await customer.save();
    res.json(customer);
  } catch (error) {
    console.error('Error depositing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/customers/:id/withdraw', async (req, res) => {
  try {
    const { amount } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (customer.balance >= amount) {
      customer.balance -= amount;
      await customer.save();
      res.json(customer);
    } else {
      res.status(400).json({ error: 'Insufficient balance' });
    }
  } catch (error) {
    console.error('Error withdrawing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/customers/:id/loan', async (req, res) => {
  try {
    const { amount } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (customer.loan + amount <= customer.loanLimit) {
      customer.loan += amount;
      customer.balance += amount;
      await customer.save();
      res.json(customer);
    } else {
      res.status(400).json({ error: 'Loan exceeds limit' });
    }
  } catch (error) {
    console.error('Error issuing loan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/customers/username/:username', async (req, res) => {
  try {
    const customer = await Customer.findOne({ username: req.params.username });
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  } catch (error) {
    console.error('Error finding customer by username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));