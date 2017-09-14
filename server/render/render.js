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

list = (req, res, info) => {
  data = {
    pageTitle: 'List | JigsUp',
    username: req.user.username
  };
  _.merge(data, info);
  res.render('list.hbs', data);
};


module.exports = {login, ticket, register, list};
