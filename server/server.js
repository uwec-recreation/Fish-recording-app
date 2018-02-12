require('./config/config');
const path = require('path');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
const Moment = require('moment');
// const MomentTZ = require('moment-timezone');
const bcrypt = require('bcryptjs');
var mongoXlsx = require('mongo-xlsx');
const fs = require('fs');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Contestant} = require('./models/contestant');
var {User} = require('./models/user');
var {authenticate, getUser, admin, editor} = require('./middleware/authenticate');
var render = require('./render/render');

const publicPath = path.join(__dirname, '../public');
const partialsViewsPath = path.join(__dirname, '../views/partials');
const viewsPath = path.join(__dirname, '../views');
var app = express();
hbs.registerPartials(partialsViewsPath);
var port = process.env.PORT;

app.use(bodyParser.json());
app.use(express.static(publicPath));
app.set('view engine', 'hbs');
app.set('views',viewsPath);
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
    render.ticket(req, res, {error:'Data you entered was incorrect or the Ticket Number is already in use'});
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
    const body = await _.pick(req.body, ['username', 'password', 'editor']);
    body.username = body.username.toLowerCase();
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

  data = await Contestant.find({}).limit(50).sort({createdAt: -1});

  render.list(req, res, {data});
});

app.get('/publicList', async (req, res) => {

  data = await Contestant.find({}).limit(50).sort({createdAt: -1});

  render.publicList(req, res, {data});
});

app.put('/moreInfo/:skip', async (req, res) => {
  var skip = req.params.skip;
  try {
    data = await Contestant.find({}).skip(parseInt(skip)).limit(50).sort({createdAt: -1});;
    res.send(data);
  } catch(e) {
    console.log(e);
    res.send(e);
  }
});

// ////////////LIST////////////

// app.get('/winners', authenticate, async (req, res) => {

//   data = await Contestant.find({}).sort({weight: -1});

//   render.winners(req, res, {data});


// });






////////////EDIT DATA////////////

app.get('/editData', admin, async (req, res) => {

  data = await Contestant.find({}).limit(50).sort({createdAt: -1});
  northern = await Contestant.find({fish: 'Northern'});
  walleye = await Contestant.find({fish: 'Walleye'});
  bass = await Contestant.find({fish: 'Bass'});
  yellowPerch = await Contestant.find({fish: 'Yellow Perch'});
  bluegill = await Contestant.find({fish: 'Bluegill'});
  crappie = await Contestant.find({fish: 'Crappie'});
  pumpkinseed = await Contestant.find({fish: 'Pumpkinseed'});
  sunfish = await Contestant.find({fish: 'Sunfish'});

  var totalLength = northern.length + walleye.length + bass.length + yellowPerch.length + bluegill.length + crappie.length + pumpkinseed.length + sunfish.length;

  render.editData(req, res, {data}, {total: totalLength, northern: northern.length, walleye: walleye.length,
   bass: bass.length, yellowPerch: yellowPerch.length, bluegill: bluegill.length, crappie: crappie.length,
   pumpkinseed: pumpkinseed.length, sunfish: sunfish.length});

});

app.post('/editData', admin, async (req, res) => {

  var body = _.pick(req.body, ['firstName', 'lastName', 'ticket', 'fish', 'weight']);
  
  try {
    await Contestant.findOneAndUpdate({_id: req.body.id}, {$set: body}, {new: true});

    data = await Contestant.find({}).limit(50).sort({createdAt: -1});
    northern = await Contestant.find({fish: 'Northern'});
    walleye = await Contestant.find({fish: 'Walleye'});
    bass = await Contestant.find({fish: 'Bass'});
    yellowPerch = await Contestant.find({fish: 'Yellow Perch'});
    bluegill = await Contestant.find({fish: 'Bluegill'});
    crappie = await Contestant.find({fish: 'Crappie'});
    pumpkinseed = await Contestant.find({fish: 'Pumpkinseed'});
    sunfish = await Contestant.find({fish: 'Sunfish'});

    render.editData(req, res, {data}, {total: data.length, northern: northern.length, walleye: walleye.length,
     bass: bass.length, yellowPerch: yellowPerch.length, bluegill: bluegill.length, crappie: crappie.length,
     pumpkinseed: pumpkinseed.length, sunfish: sunfish.length, success: 'Data Successfully Updated'});
  }
  catch (e) {

    data = await Contestant.find({}).limit(50).sort({createdAt: -1});
    northern = await Contestant.find({fish: 'Northern'});
    walleye = await Contestant.find({fish: 'Walleye'});
    bass = await Contestant.find({fish: 'Bass'});
    yellowPerch = await Contestant.find({fish: 'Yellow Perch'});
    bluegill = await Contestant.find({fish: 'Bluegill'});
    crappie = await Contestant.find({fish: 'Crappie'});
    pumpkinseed = await Contestant.find({fish: 'Pumpkinseed'});
    sunfish = await Contestant.find({fish: 'Sunfish'});
    render.editData(req, res, {data}, {total: data.length, northern: northern.length, walleye: walleye.length,
     bass: bass.length, yellowPerch: yellowPerch.length, bluegill: bluegill.length, crappie: crappie.length,
     pumpkinseed: pumpkinseed.length, sunfish: sunfish.length, error: 'Something Went Wrong'});
  }
});

app.put('/editData/moreInfo/:skip', authenticate, async (req, res) => {
  var skip = req.params.skip;
  try {
    data = await Contestant.find({}).skip(parseInt(skip)).limit(50).sort({createdAt: -1});;
    res.send(data);
  } catch(e) {
    console.log(e);
    res.send(e);
  }
});


app.post('/deleteTicket', admin, async (req, res) => {

  try {
    await Contestant.findOneAndRemove({_id: req.body.id});


    data = await Contestant.find({}).limit(50).sort({createdAt: -1});
    render.editData(req, res, {data}, {success: 'Data Successfully Updated', total: data.length});
  } catch (e) {
    data = await Contestant.find({}).limit(50).sort({createdAt: -1});
    render.editData(req, res, {data}, {error: 'Something Went Wrong', total: data.length});
  }

});

app.post('/deleteAll', admin, async (req, res) => {
  try {
    await Contestant.remove({});
    data = await Contestant.find({});
    render.editData(req, res, {data}, {success: 'All Has Successfully Been Removed', total: data.length});
  }
  catch (e) {
    data = await Contestant.find({});
    render.editData(req, res, {data}, {error: 'Something Went Wrong', total: data.length});
  }
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
    render.editUsers(req, res, {data}, {success: 'Data Successfully Updated'});
  }
  catch (e) {
    console.log(e);
    data = await User.find({});
    render.editUsers(req, res, {data}, {error: 'Something Went Wrong'});
  }
});


app.post('/deleteUser', admin, async (req, res) => {

  try {
    await User.findOneAndRemove({_id: req.body.id});

    data = await User.find({});
    render.editUsers(req, res, {data}, {success: 'Data Successfully Udpated'});
  } catch (e) {
    data = await User.find({});
    render.editUsers(req, res, {data}, {error: 'Something Went Wrong'});
  }
});


////////////CONVERT TO XLSX////////////

app.get('/getXlsx', admin, async (req, res) => {

  var list = await Contestant.find({}).sort({createdAt: -1});
  var fileList = [];

  for(var k in list) {
    fileList[k] = ({"ticket": list[k].ticket, "firstName": list[k].firstName, "lastName": list[k].lastName, "fish": list[k].fish, "weight": list[k].weight, "RegisterTime": Moment(list[k].createdAt).format('h:mm:ss A')});
  }


  var model = await mongoXlsx.buildDynamicModel(fileList);

  /* Generate Excel */
  var data = await mongoXlsx.mongoData2Xlsx(fileList, model, function(err, data) {

    console.log("downloading...");
    res.download(data.fullPath, function(err) {
      if(err) {
        console.log("Download Error");
        return err;
      }
      console.log("download complete");
      fs.unlink(data.fullPath, function(err) {
        if(err) {
          consol.log("Remove Error");
          return err;
        }
        console.log("removed old file");
      });
    });    
  });  
});


app.get("/retrieve/:id", admin, async (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  var options = {new: true};
  var search = {_creator: id}

  try {
    list = await Contestant.find(search)
    var fileList = [];

    for(var k in list) {
      fileList[k] = ({"ticket": list[k].ticket, "firstName": list[k].firstName, "lastName": list[k].lastName, "fish": list[k].fish, "weight": list[k].weight, "TimeFormatted": Moment(list[k].createdAt).format("MMMM Do YYYY, h:mm:ss a")});
    }
  } catch(e) {
    res.status(404).send(e)
  }

  var model = await mongoXlsx.buildDynamicModel(fileList);

  /* Generate Excel */
  var data = await mongoXlsx.mongoData2Xlsx(fileList, model, function(err, data) {

    console.log("downloading...");
    res.download(data.fullPath, function(err) {
      if(err) {
        console.log("Download Error");
        return err;
      }
      console.log("download complete");
      fs.unlink(data.fullPath, function(err) {
        if(err) {
          consol.log("Remove Error");
          return err;
        }
        console.log("removed old file");
      });
    });    
  });  
});



////////////CONVERT TO JSON////////////

app.get('/getJSON', admin, async (req, res) => {
  //NOT GOING TO DO
});



/////////////////////////////////////////////////////////////////////


app.listen(port, () => {
  console.log(`Started on port ${port}`);
});


module.exports = {app};
