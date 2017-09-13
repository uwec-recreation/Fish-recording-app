const _ = require('lodash');
const express = require('express');

login = (req, res, info) => {
  data = {
    pageTitle: 'Login | JigsUp'
  };
  _.merge(data, info);
  res.render('login.hbs', data);
};

ticket = (req, res, info) => {
  data = {
    pageTitle: 'Ticket | JigsUp',
    username: req.user.username
  };
  _.merge(data, info);
  res.render('ticket.hbs', data);
};

register = (req, res, info) => {
  data = {
    pageTitle: 'Register | JigsUp',
    username: req.user.username
  };
  _.merge(data, info);
  res.render('register.hbs', data);
};

data = (req, res, info) => {
  data = {
    pageTitle: 'Data | JigsUp',
    username: req.user.username
  };
  _.merge(data, info);
  res.render('data.hbs', data);
};


module.exports = {login, ticket, register, data};
