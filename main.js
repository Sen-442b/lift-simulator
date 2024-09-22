const LIFT_SPEED = 2000;
const DOOR_OPEN_CLOSE_DURATION = 2500; //ms
const FLOOR_DISTANCE = 120 + 1; //floor height + apprx val
let lifts = [];
let floors = [];

function createElementWithClassName(tagName, className = "") {
  const element = document.createElement(tagName);
  element.className = className;
  return element;
}

function getAvailableLift(floorId) {
  let nearbyLift = null;
  let shortestDistance = Infinity;
  for (const lift of lifts) {
    if (!lift.isMoving) {
      const distance = Math.abs(lift.currentFloor - floorId);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearbyLift = lift;
      }
    }
  }
  return nearbyLift;
}

async function moveLift(lift) {
  lift.isMoving = true;

  while (lift.targetFloors.length > 0) {
    const targetFloor = lift.targetFloors.shift();
    const floorsToMove = Math.abs(targetFloor - lift.currentFloor);
    const moveTime = floorsToMove * LIFT_SPEED;
    lift.element.style.transition = `transform ${moveTime}ms ease-in-out`;
    lift.element.style.transform = `translateY(${-(
      targetFloor * FLOOR_DISTANCE
    )}px)`;
    lift.currentFloor = targetFloor;
    await new Promise((resolve) => setTimeout(resolve, moveTime));

    // Open and close doors
    const doors = lift.element.querySelectorAll(".door");
    const openDoorsPromise = new Promise((resolve) => {
      doors.forEach((door, idx) => {
        door.style.transform = `translateX(${idx === 0 ? "-" : ""}60px)`;
      });
      setTimeout(resolve, DOOR_OPEN_CLOSE_DURATION);
    });

    await openDoorsPromise;

    console.log("Doors opened");

    const closeDoorsPromise = new Promise((resolve) => {
      doors.forEach((door) => {
        door.style.transform = `translateX(0)`;
      });
      setTimeout(resolve, DOOR_OPEN_CLOSE_DURATION);
    });

    await closeDoorsPromise;
  }
  console.log("lift moved");
  lift.isMoving = false;
}

function callLift(floorId) {
  const staleLiftExistsOnFloor = lifts.find(({ currentFloor }) => {
    return currentFloor === floorId;
  });
  console.log({ staleLiftExistsOnFloor });
  if (staleLiftExistsOnFloor) {
    if (!staleLiftExistsOnFloor.isMoving) {
      staleLiftExistsOnFloor.targetFloors.push(floorId);
    }
    moveLift(staleLiftExistsOnFloor);
  } else {
    const availableLift = getAvailableLift(floorId);
    if (availableLift) {
      availableLift.targetFloors.push(floorId);

      if (!availableLift.isMoving) {
        moveLift(availableLift);
      }
    }
  }
}

function createFloor(floorId, numLifts, numFloors) {
  const floor = createElementWithClassName("div", "floor");
  const buttons = createElementWithClassName("div", "buttons");
  const floorNumber = createElementWithClassName("div", "floor-number");
  const isMobile = window.innerWidth <= 768;
  floorNumber.textContent = isMobile ? `${floorId}` : `Floor ${floorId}`;
  const upButton = createElementWithClassName("button", "btn btn-up");
  upButton.textContent = "↑";
  upButton.onclick = () => callLift(floorId);
  const downButton = createElementWithClassName("button", "btn btn-down");
  downButton.textContent = "↓";
  downButton.onclick = () => callLift(floorId);
  buttons.appendChild(upButton);
  buttons.appendChild(downButton);
  if (floorId === numFloors - 1) upButton.style.display = "none";
  if (floorId === 0) downButton.style.display = "none";

  const liftShaft = createElementWithClassName("div", "lift-shaft");

  let shaftWidth = 0;
  for (let i = 0; i < numLifts; i++) {
    shaftWidth += 60; //add current lift width
  }
  liftShaft.style.width = `${shaftWidth}px`;
  floor.appendChild(floorNumber);
  floor.appendChild(buttons);
  floor.appendChild(liftShaft);
  return floor;
}

function createLift(liftId) {
  return {
    id: liftId,
    element: createElementWithClassName("div", "lift"),
    currentFloor: 0,
    targetFloors: [],
    isMoving: false,
  };
}

function startLiftSim() {
  lifts = [];
  floors = [];
  const liftSimDiv = document.getElementById("lift-sim");
  liftSimDiv.innerHTML = "";
  const numFloors = parseInt(document.getElementById("num-floors").value);
  const numLifts = parseInt(document.getElementById("num-lifts").value);

  for (let i = 0; i < numFloors; i++) {
    const floor = createFloor(i, numLifts, numFloors);
    floors.push(floor);
    liftSimDiv.appendChild(floor);
  }

  for (let i = 0; i < numLifts; i++) {
    const lift = createLift(i);
    lift.element.appendChild(createElementWithClassName("div", "door"));
    lift.element.appendChild(createElementWithClassName("div", "door"));
    lifts.push(lift);

    floors[0].querySelector(".lift-shaft").appendChild(lift.element);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateLiftLimit();
  const form = document.getElementById("lift-sim-form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    startLiftSim();
  });
});

function validateInput(input) {
  const value = parseFloat(input.value);

  if (isNaN(value)) {
    input.setCustomValidity("Please enter a valid number");
  } else if (value < input.min) {
    input.setCustomValidity(`At least ${input.min} ${input.name} required`);
  } else if (value > input.max) {
    input.setCustomValidity(`maximum ${input.max} ${input.name}s are allowed`);
  } else {
    input.setCustomValidity("");
  }
}

function updateLiftLimit() {
  const liftInput = document.getElementById("num-lifts");
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  if (isMobile) {
    liftInput.max = 4;
    liftInput.value = Math.min(liftInput.value, 3);
    validateInput(liftInput);
  } else {
    liftInput.max = 10;
    validateInput(liftInput);
  }
}

window.addEventListener("resize", updateLiftLimit);
