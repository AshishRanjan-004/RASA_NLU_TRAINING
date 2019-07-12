const IncomingForm = require("formidable").IncomingForm;
var fs = require("fs");
var axios = require("axios");

module.exports = function upload(req, res) {
  var form = new IncomingForm();
  var entities = [];

  form.on("file", (field, file) => {
    console.log("File Location: ", file.path);
    var query = fs.readFileSync(file.path).toString();

    var headers = {
      "Content-Length": 0,
      "Content-Type": "text/plain"
    };
    var data = query;
   //fetching the data from RASA model.
    axios
      .post("http://localhost:5000/parse", {
        query: data,
        project: "current",
        model: "nlu"
      })
      .then(function(response) {
        console.log(response.data);
        if (response.data.entities.length != 0)
          response.data.entities.forEach(element => {
            if (element.confidence > 0.5) {
              entities.push(element);
            }
          });
        console.log(entities);

        res.json({ entities: entities, text: data });
      })
      .catch(function(error) {
        console.log(error);
      });
  });

  form.parse(req);
};
