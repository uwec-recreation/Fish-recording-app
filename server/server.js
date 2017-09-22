require('./config/config');
const path = require('path');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
const Moment = require('moment');
const bcrypt = require('bcryptjs');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Contestant} = require('./models/contestant');
var {User} = require('./models/user');
var {authenticate, getUser, admin, editor} = require('./middleware/authenticate');
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

app.get('/ticket', editor, (req, res) => {

  render.ticket(req, res);
});

app.post('/ticket', editor, (req, res) => {

  var contestant = new Contestant({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    ticket: parseInt(req.body.ticketNumber, 10),
    fish: req.body.fish,
    weight: req.body.weight,
    createdAt: new Moment().valueOf(),
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

  render.login(req, res);
});


app.post('/login', async (req, res) => {
  try {
    const body = _.pick(req.body, ['username', 'password']);
    body.username = body.username.toLowerCase();
    const user = await User.findByCredentials(body.username, body.password);
    const token = await user.generateAuthToken();
    await res.cookie('x-auth', token);
    res.redirect('/list');
  } catch (e) {
    render.login(req, res, {error:'Login Attempt Failed'});
  }
});



////////////REGISTER////////////
app.get('/register', (req, res) => {

  render.register(req, res);
});


app.post('/register', async (req,res) => {
  try {
    const body = await _.pick(req.body, ['username', 'password']);
    body.username = body.username.toLowerCase();
    const user = await new User(body);
    await user.save();
    render.register(req, res, {register: 'Registration Successful'});
  } catch (e) {
    render.register(req, res, {error: 'Registration Failed'});
  }
});

app.get('/registerAdmin', admin, (req, res) => {

  render.registerAdmin(req, res);
});


app.post('/registerAdmin', admin, async (req,res) => {
  try {
    const body = await _.pick(req.body, ['username', 'password', 'administration', 'editor']);
    body.username = body.username.toLowerCase();
    body.administration = (body.administration == 'true');
    body.editor = (body.editor == 'true');
    const user = await new User(body);
    await user.save();
    render.registerAdmin(req, res, {register: 'Registration Successful'});
  } catch (e) {
    render.registerAdmin(req, res, {error: 'Registration Failed'});
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



////////////LIST////////////

app.get('/list', authenticate, async (req, res) => {

  data = await Contestant.find({}).sort({createdAt: -1});

  render.list(req, res, {data});


});




////////////EDIT DATA////////////

app.get('/editData', admin, async (req, res) => {

  data = await Contestant.find({});

  render.editData(req, res, {data});

});

app.post('/editData', admin, async (req, res) => {

  var body = _.pick(req.body, ['firstName', 'lastName', 'ticket', 'fish', 'weight']);

  try {
    await Contestant.findOneAndUpdate({_id: req.body.id}, {$set: body}, {new: true});

    data = await Contestant.find({});
    _.merge(data, {success: 'Data Successfully Udpated'});
    render.editData(req, res, {data});
  }
  catch (e) {

    data = await Contestant.find({});
    _.merge(data, {error: 'Something Went Wrong'});
    render.editData(req, res, {data});
  }
});


app.post('/deleteTicket', admin, async (req, res) => {

  await Contestant.findOneAndRemove({_id: req.body.id});


    data = await Contestant.find({});
    _.merge(data, {success: 'Data Successfully Udpated'});
    render.editData(req, res, {data});

});



////////////EDIT USERS////////////

app.get('/editUsers', admin, async (req, res) => {

  data = await User.find({});

  render.editUsers(req, res, {data});

});

app.post('/editUsers', admin, async (req, res) => {

  var body = _.pick(req.body, ['username', 'administration', 'editor']);

  try {
    body.administration = (body.administration == 'true');
    body.editor = (body.editor == 'true');
    await User.findOneAndUpdate({_id: req.body.id}, {$set: body}, {new: true});

    data = await User.find({});
    _.merge(data, {success: 'Data Successfully Udpated'});
    render.editUsers(req, res, {data});
  }
  catch (e) {
    console.log(e);
    data = await User.find({});
    _.merge(data, {error: 'Something Went Wrong'});
    render.editUsers(req, res, {data});
  }
});


app.post('/deleteUser', admin, async (req, res) => {

  await User.findOneAndRemove({_id: req.body.id});

    data = await User.find({});
    _.merge(data, {success: 'Data Successfully Udpated'});
    render.editUsers(req, res, {data});

});































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
