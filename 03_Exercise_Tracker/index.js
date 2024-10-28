const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})




let userCounter = 1;
let userDB = [];
let newUser;

app.route('/api/users')
  .post((req, res) => {
    const username = req.body.username;
    const id = userCounter.toString();

    userCounter++;

    newUser = { username: username, _id: id };
    userDB.push(newUser);
    res.json({
      username: username,
      _id: id
    });

  })
  .get((req, res) => {
    res.json(userDB);

  })

app.route('/api/users/:_id/exercises')
  .post((req, res) => {
    const { description, duration, date } = req.body;
    const id = req.params._id;

    const user = userDB.find(u => u._id === id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const exercise = {
      description,
      duration: parseInt(duration),
      date: date ? new Date(date).toDateString() : new Date().toDateString()
    };

    if (!user.log) user.log = [];
    user.log.push(exercise);

    const response = {
      _id: user._id,
      username: user.username,
      ...exercise
    };

    res.json(response);
  });

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = userDB.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let log = user.log || [];


  if (from) {
    const fromDate = new Date(from);
    log = log.filter(exercise => new Date(exercise.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    log = log.filter(exercise => new Date(exercise.date) <= toDate);
  }
  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  const response = {
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log
  }

  res.json(response);

});