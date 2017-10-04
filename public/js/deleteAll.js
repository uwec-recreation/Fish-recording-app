$('#deleteAll').on('keyup', function () {
  if($('#deleteAll').val() === 'DELETE') {
    $('#deleteAllButton').removeAttr('disabled');
  }
  else {
    $('#deleteAllButton').attr('disabled', 'disabled')
  }
});
