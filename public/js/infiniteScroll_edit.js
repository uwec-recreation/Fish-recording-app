var skipValue = 50;
var waitForCall = false


function ajaxCall(skip) {
	return $.ajax({
		dataType: "json",
		async: true,
		url: "/editData/moreInfo/"+skip,
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
		var form = $("<form/>", {
			id: item._id,
			name: item._id,
			action: "/editData",
			method: "POST",
			onsubmit: "return confirm('Do you really want to Update/Delete?');"
		});
		var tableTR = $("<tr/>");
		var html = '';
		html += '<td style="display: none;"><input form="'+item._id+'" type="text" name="id" value="'+item._id+'" readonly></td>';
		html += '<td><h4><input form="'+item._id+'" type="text" class="form-control" name="ticket" autocomplete="off" value="'+item.ticket+'"></h4></td>';
		html += '<td><h4><input type="text" form="'+item._id+'" class="form-control" name="firstName" autocomplete="off" value="'+item.firstName+'"></h4></td>';
		html += '<td><h4><input type="text" form="'+item._id+'" class="form-control" name="lastName" autocomplete="off" value="'+item.lastName+'"></h4></td>';
		html += '<td><h4><input type="text" form="'+item._id+'" class="form-control" name="phoneNumber" autocomplete="off" value="'+item.phoneNumber+'"></h4></td>';
		html += '<td><h4><select form="'+item._id+'" class="form-control" name="fish"';
		html += '<option value="'+item.fish+'">'+item.fish+'</option>';
		html += '<option value="Northern">Northern</option>';
		html += '<option value="Walleye">Walleye</option>';
		html += '<option value="Bass">Bass</option>';
		html += '<option value="Yellow Perch">Yellow Perch</option>';
		html += '<option value="Bluegill">Bluegill</option>';
		html += '<option value="Crappie">Crappie</option>';
		html += '<option value="Pumpkinseed">Pumpkinseed</option>';
		html += '<option value="Sunfish">Sunfish</option>';
		html += '</h4></td>';
		html += '<td><h4><input type="text" form="'+item._id+'" class="form-control" name="weight" autocomplete="off" value="'+item.weight+'"></h4></td>';
		html += '<td><h4>'+moment(item.createdAt).format('h:mm:ss A')+'</h4></td>';

		if(clickValue) {
			html += '<td><button form="'+item._id+'" id="update" class="btn btn-primary btn-lg" type="submit" style="display: none">Update</button>'+
			'<button form="'+item._id+'" id="delete" class="btn btn-danger btn-lg" type="submit" formaction="/deleteTicket">Delete</button></td>';
		} else {
			html += '<td><button form="'+item._id+'" id="update" class="btn btn-primary btn-lg" type="submit">Update</button>'+
			'<button form="'+item._id+'" id="delete" class="btn btn-danger btn-lg" type="submit" formaction="/deleteTicket" style="display: none">Delete</button></td>';
		}

		table.append(form);
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