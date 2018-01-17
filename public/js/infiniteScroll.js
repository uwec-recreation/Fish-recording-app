var skipValue = 50;

loadData = () => {
	console.log("Loadings New Data");
	var xhttp = new XMLHttpRequest(); 
	xhttp.open("POST", "/moreInfo", true);
	xhttp.setRequestHeader('skipValue', skipValue);
	xhttp.send();

	// var objectData = {skipValue: skipValue};

	// var objectDataString = JSON.stringify(objectData);

	// $.ajax({
	// 	type: "POST",
	// 	url: "/moreInfo",
	// 	dataType: "json",
	// 	data: {
	// 		o: objectDataString
	// 	},
	// 	success: function (data) {
	// 		console.log('Success');

	// 	},
	// 	error: function () {
	// 		console.log('Error');
	// 	}
	// });



};


assembleTable = (data) => {
};


window.onscroll = function(ev) {
	if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
		loadData();
	}
};