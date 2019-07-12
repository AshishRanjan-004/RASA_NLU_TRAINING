//all variables that used
var filesCount = "";
var textFile = "";
var startDate = "";
var endDate = "";
var firstParty = "";
var secondParty = "";
var secondPartyAddress = "";
let jsonArray = [];
var $template = $(".template");


//function that create the collapsible frame to show the multiple document in the window.
function generateCollapsibleFrame(
  index,
  fileText,
  fileName,
  effectivedate,
  enddate,
  firstparty,
  secondparty,
  firstpartyaddress,
  secondpartyaddress
) {
  
//Panel creation.
  var hash = index;
  var $newPanel = $template.clone();
  $newPanel.find(".collapse").removeClass("in");
  $newPanel
    .find(".accordion-toggle")
    .attr("href", "#" + ++hash)
    .text(fileName);
  $newPanel
    .find(".panel-collapse")
    .attr("id", hash)
    .addClass("collapse")
    .removeClass("in");
  $newPanel
    .find(".text0")
    .attr("id", "text" + index)
    .val(fileText);
  $newPanel
    .find("#startDate0")
    .attr("id", "startDate" + index)
    .val(effectivedate);
  $newPanel
    .find("#endDate0")
    .attr("id", "endDate" + index)
    .val(enddate);
  $newPanel
    .find("#firstParty0")
    .attr("id", "firstParty" + index)
    .val(firstparty);
  $newPanel
    .find("#secondParty0")
    .attr("id", "secondParty" + index)
    .val(secondparty);
  $newPanel
    .find("#firstPartyAddress0")
    .attr("id", "firstPartyAddress" + index)
    .val(firstpartyaddress);
  $newPanel
    .find("#secondPartyAddress0")
    .attr("id", "secondPartyAddress" + index)
    .val(secondpartyaddress);
  $newPanel.find("#collapseHeader0").attr("id", "collapseHeader" + index);
  $(".fileDetailsFrame").append($newPanel.fadeIn());
}

//fetching the entities from the RASA model.
async function fetchRasaEntitiesFromFile(file) {
  var fileData = "";
  var formData = new FormData();
  formData.append("file", file);
  await $.ajax({
    type: "POST",
    headers: {
      accept: "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    url: "http://localhost:8000/upload",
    data: formData,
    processData: false,
    contentType: false,
    async: true,
    success: function(data) {
      fileData = data;
      console.log(fileData.entities);
    }
  });
  //console.log(fileData);
  return fileData;
}

//function of Populating the entities on the UI
async function populateEntitiesOnUI(
  abstractEntities,
  index,
  fileName,
  fileText
) {
  //console.log("populateEntitiesOnUI called");
  var effectivedate = "";
  var enddate = "";
  var firstparty = "";
  var secondparty = "";
  var firstpartyaddress = "";
  var secondpartyaddress = "";

  Object.keys(abstractEntities).forEach(function(key) {
    value = abstractEntities[key];
    if (key.toLowerCase() == "effectivedate") effectivedate = value.replace(/\n/g, " ");
    else if (key.toLowerCase() == "validity") enddate = value.replace(/\n/g, " ");
    else if (key.toLowerCase() == "firstparty") firstparty = value.replace(/\n/g, " ");
    else if (key.toLowerCase() == "secondparty") secondparty = value.replace(/\n/g, " ");
    else if (key.toLowerCase() == "firstpartyaddress")
      firstpartyaddress = value;
    else if (key.toLowerCase() == "secondpartyaddress")
      secondpartyaddress = value;
  });
  if (index == 0) {
    $("#text" + index).val(fileText);
    $("#startDate" + index).val(effectivedate);
    $("#endDate" + index).val(enddate);
    $("#firstParty" + index).val(firstparty);
    $("#secondParty" + index).val(secondparty);
    $("#firstPartyAddress" + index).val(firstpartyaddress);
    $("#secondPartyAddress" + index).val(secondpartyaddress);
  } else {
    await generateCollapsibleFrame(
      index,
      fileText,
      fileName,
      effectivedate,
      enddate,
      firstparty,
      secondparty,
      firstpartyaddress,
      secondpartyaddress
    );
  }
}

//function the process the file.
async function processFileData(file, index) {
  var rasaResponseData = await fetchRasaEntitiesFromFile(file);
  var abstractEntities = {};
  var confidences = {};
  var entities = rasaResponseData.entities;
  entities.forEach(function(item) {
    if (abstractEntities[item.entity]) {
      if (parseFloat(confidences[item.entity]) < parseFloat(item.confidence)) {
        abstractEntities[item.entity] = item.value;
        confidences[item.entity] = item.confidence;
      }
    } else {
      abstractEntities[item.entity] = item.value;
      confidences[item.entity] = item.confidence;
    }
  });
 
  await populateEntitiesOnUI(
    abstractEntities,
    index,
    file.name,
    rasaResponseData.text
  );
  
}

var fileText = "";

$("form").submit(function() {
  var $template = $(".template");
  $(".fileUploaderDiv").hide();
  $(".fileDetailsFrame").removeClass("hide");
  $(".actionButtons").removeClass("hide");
  processAllFiles();
  return false;
});
//function of processing all the files.
async function processAllFiles() {
  filesCount = document.getElementById("file").files.length;
  for (var index = 0; index < filesCount; index++) {
    var file = document.getElementById("file").files[index];
    if (index == 0) $("#collapseHeader0").text(file.name);
    await processFileData(file, index);
  }
}

$("#generateJsonBTN0").click(function() {
  //console.log("generate JSON clicked");
  let data = [];
  for (var index = 0; index < filesCount; index++) {
    textFile = $("#text" + index).val();
    startDate = $("#startDate" + index).val();
    endDate = $("#endDate" + index).val();
    firstParty = $("#firstParty" + index).val();
    secondParty = $("#secondParty" + index).val();
    firstPartyAddress = $("#firstPartyAddress" + index).val();
    secondPartyAddress = $("#secondPartyAddress" + index).val();

    let entity = {
      effectiveDate: startDate,
      validity: endDate,
      firstParty: firstParty,
      firstPartyAddress: firstPartyAddress,
      secondParty: secondParty,
      secondPartyAddress: secondPartyAddress,
      text: textFile
    };

    data.push(entity);
  }
  fetch("http://localhost:3001/url", {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(res => {
    console.log(res.status);
    location.reload();
  });
});
