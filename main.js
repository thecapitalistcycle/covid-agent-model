import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
import sendDataToChart from "./sendDataToCharts/index.js";

function addToTable(data) {
  const oldTbody = document.getElementById("model-table-tbody");

  const tbody = document.createElement("tbody");
  function addData(row, item) {
    const newCell = row.insertCell();
    const newText = document.createTextNode(item);
    newCell.appendChild(newText);
  }

  data.forEach((element) => {
    const newRow = tbody.insertRow();
    addData(newRow, element.day);
    addData(newRow, element.susceptible);
    addData(newRow, element.infected);
    addData(newRow, element.recovered);
    addData(newRow, element.newlyInfected);
    addData(newRow, element.newlyRecovered);
  });
  tbody.id = "model-table-tbody";
  oldTbody.parentNode.replaceChild(tbody, oldTbody);
}

let workerObj;
function init() {
  const worker = new Worker("./worker.js");
  // WebWorkers use `postMessage` and therefore work with Comlink.
  workerObj = Comlink.wrap(worker);
}
init();

async function runModel(settings) {
  console.log(settings);

  let results;
  if (settings.modelSelection === "compartment-model") {
    results = await workerObj.runSimpleCompartmentModelWrapper(settings);
  } else if (settings.modelSelection === "simple-agent-model") {
    results = await workerObj.runSimpleAgentModelWrapper(settings);
  } else {
    throw new Error("settings.modelSelection not found");
  }
  addToTable(results);
  sendDataToChart(results);
}

function getInputVals() {
  const modelSelection = document.getElementById("model-selection").value;

  const numberOfPeople = parseFloat(
    document.getElementById("numberOfPeopleSlider").value
  );
  const initialInfected = parseFloat(
    document.getElementById("initialInfectedSlider").value
  );

  const medianTimeUntilRecovery = parseFloat(
    document.getElementById("medianTimeUntilRecoverySlider").value
  );

  const connectionsPerPerson = parseFloat(
    document.getElementById("connectionsPerPersonSlider").value
  );
  const infectionProbability = parseFloat(
    document.getElementById("infectionProbabilitySlider").value
  );
  const infectionRate = parseFloat(
    document.getElementById("infectionRateSlider").value
  );
  const interventionStart = parseFloat(
    document.getElementById("interventionStartSlider").value
  );
  const infectionDuration = parseFloat(
    document.getElementById("interventionDurationSlider").value
  );

  return {
    modelSelection,
    numberOfPeople,
    initialInfected,
    connectionsPerPerson,
    medianTimeUntilRecovery,
    infectionProbability,
    infectionRate,
    interventionStart,
    infectionDuration,
  };
}

runModel(getInputVals());

// Set up the start button
const buttonRef = document.getElementById("start-button");

buttonRef.addEventListener(
  "click",
  function () {
    // Clear the graph on every click
    d3.select("#data-chart").html("");

    // Run the modal function
    runModel(getInputVals());
  },
  false
);

// Set up dropdown handler
const dropdownRef = document.getElementById("model-selection");

function dropdownHandler() {
  const modelSelection = dropdownRef.value;
  console.log(`Dropdown is set to: ${modelSelection}`);
  // TODO:

  if (modelSelection === "compartment-model") {
  } else if (modelSelection === "simple-agent-model") {
  }
}

dropdownRef.addEventListener("change", dropdownHandler);

// Run function once to set up default
dropdownHandler();
