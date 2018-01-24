var clickValue = false;

$('#deleteCheck').click(function() {
    toggleButtons(this);
    if(clickValue) {
    	clickValue = false;
    } else {
    	clickValue = true;
    }
});

function toggleButtons(toggle) {
	$("*#delete").toggle(toggle.checked);
    $("*#update").toggle(toggle.notChecked);
}
