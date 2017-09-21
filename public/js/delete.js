function EnableDelete() {
  $('button:last').attr('hidden', 'hidden');
  $('form:last').attr('action', '/deleteUser');
};
