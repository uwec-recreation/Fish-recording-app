var skipValue = 50;
var waitForCall = false


function ajaxCall(skip) {
	return $.ajax({
		dataType: "json",
		async: true,
		url: "/moreInfo/"+skip,
		method: 'PUT',
		beforeSend: function() {
			// showLoading(card);
		},
		success: function(object) {
			skipValue += object.length;
			assembleTable(object);
			waitForCall = false;
		}
	}).responseJSON;
}

function assembleTable(data) {
	var table = $("#table").find("tbody");
	

	data.forEach(function(item) {
		var tableTR = $("<tr/>");
		var html = '';
		html += "<td><h4>"+item.firstName+"</h4></td>";
		html += "<td><h4>"+item.lastName+"</h4></td>";
		html += "<td><h4>"+item.fish+"</h4></td>";
		html += "<td><h4>"+item.weight+"</h4></td>";
		html += "<td><h4>"+moment(item.createdAt).format('h:mm:ss A')+"</h4></td>";
		tableTR.append(html);
		table.append(tableTR);
	});
};





window.onscroll = function(ev) {
	if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
		if(!waitForCall) {
			waitForCall = true;
			ajaxCall(skipValue);
		}
	}
};