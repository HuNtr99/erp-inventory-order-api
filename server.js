require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ---------- PRODUCTS ----------

app.get('/products', async (req, res) => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/products', async (req, res) => {
  const { sku, name, description, category_id, quantity, unit_price } = req.body;
  const { data, error } = await supabase
    .from('products')
    .insert([{ sku, name, description, category_id, quantity, unit_price }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

// ---------- ORDERS (Sales) ----------

app.post('/orders', async (req, res) => {
  console.log('Received body:', req.body);
  const { customer_name, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must have at least one item' });
  }

  try {
    let totalAmount = 0;
    const orderItemsToInsert = [];

    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.product_id)
        .single();

      if (productError || !product) {
        return res.status(404).json({ error: `Product ${item.product_id} not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${product.name}` });
      }

      totalAmount += product.unit_price * item.quantity;
      orderItemsToInsert.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.unit_price,
      });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ customer_name, total_amount: totalAmount }])
      .select()
      .single();

    if (orderError) return res.status(500).json({ error: orderError.message });

    const itemsWithOrderId = orderItemsToInsert.map(i => ({ ...i, order_id: order.id }));
    const { error: itemsError } = await supabase.from('order_items').insert(itemsWithOrderId);
    if (itemsError) return res.status(500).json({ error: itemsError.message });

    for (const item of items) {
      const { data: current } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', item.product_id)
        .single();

      await supabase
        .from('products')
        .update({ quantity: current.quantity - item.quantity })
        .eq('id', item.product_id);
    }

    res.status(201).json({ order, items: itemsWithOrderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/orders', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ---------- START SERVER ----------

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));