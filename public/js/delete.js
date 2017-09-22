$('#deleteCheck').click(function() {
    $("*#delete").toggle(this.checked);
    $("*#update").toggle(this.notChecked);
});
