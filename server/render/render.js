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
    username: req.user.username,
    administration: req.user.administration,
    editor: req.user.editor
  };
  _.merge(data, info);
  res.render('ticket.hbs', data);
};

register = (req, res, info) => {
  data = {
    pageTitle: 'Register | JigsUp',
  };
  _.merge(data, info);
  res.render('register.hbs', data);
};

registerAdmin = (req, res, info) => {
  data = {
    pageTitle: 'RegisterAdmin | JigsUp',
    username: req.user.username,
    administration: req.user.administration,
    editor: req.user.editor
  };
  _.merge(data, info);
  res.render('registerAdmin.hbs', data);
};

list = (req, res, info) => {
  data = {
    pageTitle: 'List | JigsUp',
    username: req.user.username,
    administration: req.user.administration,
    editor: req.user.editor
  };
  _.merge(data, info);
  res.render('list.hbs', data);
};

editData = (req, res, info) => {
  data = {
    pageTitle: 'Edit Data | JigsUp',
    username: req.user.username,
    administration: req.user.administration,
    editor: req.user.editor
  };
  _.merge(data, info);
  res.render('editData.hbs', data);
};

editUsers = (req, res, info) => {
  data = {
    pageTitle: 'Edit Users | JigsUp',
    username: req.user.username,
    administration: req.user.administration,
    editor: req.user.editor
  };
  _.merge(data, info);
  res.render('editUsers.hbs', data);
};


module.exports = {login, ticket, register, list, editData, editUsers, registerAdmin};
