require('./config/config');
const path = require('path');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Contestant} = require('./models/contestant');
var {User} = require('./models/user');
var {authenticate, getUser} = require('./middleware/authenticate');
var render = require('./render/render');

const publicPath = path.join(__dirname, '../public');
const partialsViewsPath = path.join(__dirname, '../views/partials');
var app = express();
hbs.registerPartials(partialsViewsPath);
var port = process.env.PORT;

app.use(bodyParser.json());
app.use(express.static(publicPath));
app.set('view engine', 'hbs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.redirect('/login');
});



////////////TICKET////////////

app.get('/ticket', authenticate, (req, res) => {

  render.ticket(req, res);
});

app.post('/ticket', authenticate, (req, res) => {

  var contestant = new Contestant({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    ticket: parseInt(req.body.ticketNumber, 10),
    fish: req.body.fish,
    weight: req.body.weight,
    _creator: req.user._id
  });

  contestant.save().then(() => {
    render.ticket(req, res, {confirmation: 'Angler Successfully Added'});
  }, (e) => {
    render.ticket(req, res, {error:'you done goofed'});
  });
});



////////////LOGIN////////////
app.get('/login', getUser,(req, res) => {
  if(req.user) {
    res.redirect('/ticket');
  }

  render.login(req, res, {});
});


app.post('/login', async (req, res) => {
  try {
    const body = _.pick(req.body, ['username', 'password']);
    body.username = body.username.toLowerCase();
    const user = await User.findByCredentials(body.username, body.password);
    const token = await user.generateAuthToken();
    await res.cookie('x-auth', token);
    res.redirect('/ticket');
  } catch (e) {
    render.login(req, res, 'Login Attempt Failed');
  }
});



////////////REGISTER////////////
app.get('/register', getUser, (req, res) => {

  if(req.user) {
    res.redirect('/ticket');
  }

  res.render('register.hbs', {
    pageTitle: 'Register | JigsUp'
  });
});


app.post('/register', async (req,res) => {
  try {
    const body = _.pick(req.body, ['username', 'password']);
    body.username = body.username.toLowerCase();
    const user = new User(body);
    await user.save();
    const token = await user.generateAuthToken();
    res.cookie('x-auth', token);
    render.login(req, res, {register: 'Registration Successful'});
  } catch (e) {
    render.register(req, res, {error: 'Registration Failed'});
  }
});



////////////LOGOUT////////////

app.get('/logout', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    await res.clearCookie('x-auth');
    res.status(200).redirect('/');
  } catch(e) {
    res.status(400).send();
  }
});



////////////DATA////////////









////////////////////////////


app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.get('/contestants', authenticate, (req, res) => {
  // Contestant.find({_creator: req.user._id}).then((contestants) => {
  Contestant.find({}).then((contestants) => {
    res.send({contestants});
  }, (e) => {
    res.status(400).send(e);
  });
});

// app.get('/todos/:id', authenticate, (req, res) => {
//   var id = req.params.id;
//
//   if(!ObjectID.isValid(id)) {
//       return res.status(404).send();
//   }
//
//   Todo.findOne({
//     _id: id,
//     _creator: req.user._id
//   }).then((todo) => {
//     if(!todo) {
//       return res.status(404).send();
//     }
//     res.send({todo});
//   }).catch((e) => {
//     res.status(400).send();
//   });
// });

// app.delete('/todos/:id', authenticate, async (req, res) => {
//   const id = req.params.id;
//
//   if(!ObjectID.isValid(id)) {
//       return res.status(404).send();
//   }
//
//   try {
//     const todo = await Todo.findOneAndRemove({
//       _id: id,
//       _creator: req.user._id
//     });
//     if(!todo) {
//       return res.status(404).send();
//     }
//
//     res.send({todo});
//   } catch (e) {
//     res.status(400).send();
//   }
// });

// app.patch('/todos/:id', authenticate, (req, res) => {
//   var id = req.params.id;
//   var body = _.pick(req.body, ['text', 'completed']);
//
//   if(!ObjectID.isValid(id)) {
//       return res.status(404).send();
//   }
//
//   if(_.isBoolean(body.completed) && body.completed) {
//     body.completedAt = new Date().getTime();
//   } else {
//     body.completed = false;
//     body.completedAt = null;
//   }
//
//   Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
//       if (!todo) {
//         return res.status(404).send();
//       }
//       res.send({todo});
//   }).catch((e) => {
//     res.status(400).send()
//   })
// });


app.listen(port, () => {
  console.log(`Started on port ${port}`);
});


module.exports = {app};
