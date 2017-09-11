const _ = require('lodash');
const express = require('express');

login = (req, res, {info}) => {
  data = {
    pageTitle: 'Login | Serenity'
  };
  _.merge(data, info);
  res.render('login.hbs', data);
};

ticket = (req, res, {info}) => {
  data = {
    pageTitle: 'Ticket | Serenity'
  };
  _.merge(data, info);
  res.render('ticket.hbs', data);
};

confirmation = (req, res, {info}) => {
  data = {
    pageTitle: 'Confirmation | Serenity'
  };
  _.merge(data, info);
  res.render('confirmation.hbs', data);
};

data = (req, res, {info}) => {
  data = {
    pageTitle: 'Data | Serenity'
  };
  _.merge(data, info);
  res.render('data.hbs', data);
};


module.exports = {login, ticket, confirmation, data};
