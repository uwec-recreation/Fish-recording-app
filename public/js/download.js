function download() {
// var list = await Contestant.find({}).sort({createdAt: -1});

  var model = mongoXlsx().buildDynamicModel(data);

  /* Generate Excel */
  mongoXlsx().mongoData2Xlsx(data, model, function(err, data) {
    console.log('File saved at:', data.fullPath); 
  });  
}