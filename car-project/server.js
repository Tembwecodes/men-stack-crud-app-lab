const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('car-project'));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

//override method
  const methodOverride = require('method-override');
  app.use(methodOverride('_method'));


//rpoutes
app.get('/test', (req, res) => {
  res.send('Server is running properly!');
});

app.get('/', (req, res) => {
    res.redirect('/cars');
  });

//new page to handle car entries
app.get('/new', (req, res) => {
    res.render('new');
  });

//post route to handl e submitions
const Car = require('./models/car'); // Ensure you have required your Car model

app.post('/cars', async (req, res) => {
  const { make, model, year, price, description, image } = req.body;
  const newCar = new Car({ make, model, year, price, description, image });
  await newCar.save();
  res.redirect('/');
});

app.get('/cars/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received ID: ${id}`); // Log the received ID for debugging
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID');
    }
  
    try {
      const car = await Car.findById(id);
      if (!car) {
        return res.status(404).send('Car not found');
      }
      res.render('show', { car });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });


app.get('/cars', async (req, res) => {
    try {
      const cars = await Car.find({});
      res.render('index', { cars }); // Pass the cars variable to the view
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });


app.get('/cars/:id/edit', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID');
    }
    try {
      const car = await Car.findById(id);
      if (!car) {
        return res.status(404).send('Car not found');
      }
      res.render('edit', { car });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

app.put('/cars/:id', async (req, res) => {
    const { id } = req.params;
    const { make, model, year, price, description, image } = req.body;
    try {
      await Car.findByIdAndUpdate(id, { make, model, year, price, description, image });
      res.redirect(`/cars/${id}`);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

app.delete('/cars/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID');
    }
    try {
      await Car.findByIdAndDelete(id);
      res.redirect('/cars');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});