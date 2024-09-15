const LIFT_SPEED = 2000;
const DOOR_OPEN_CLOSE_DURATION = 1000;
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

    await new Promise((resolve) => setTimeout(resolve, moveTime));

    lift.currentFloor = targetFloor;
    // Open and close doors
    lift.element.style.backgroundColor = "#ffff00";
    await new Promise((resolve) =>
      setTimeout(resolve, DOOR_OPEN_CLOSE_DURATION)
    );
    lift.element.style.backgroundColor = "#f0f0f0";
  }
  lift.isMoving = false;
}

function callLift(floorId) {
  const availableLift = getAvailableLift(floorId);
  if (availableLift) {
    availableLift.targetFloors.push(floorId);

    if (!availableLift.isMoving) {
      moveLift(availableLift);
    }
  }
}

function createFloor(floorId, numLifts, numFloors) {
  const floor = createElementWithClassName("div", "floor");
  const buttons = createElementWithClassName("div", "buttons");
  const floorNumber = createElementWithClassName("div", "floor-number");
  floorNumber.textContent = `Floor ${floorId}`;
  const upButton = createElementWithClassName("button", "btn btn-up");
  upButton.textContent = "↑";
  upButton.onclick = () => callLift(floorId);
  const downButton = createElementWithClassName("button", "btn btn-down");
  downButton.textContent = "↓";
  downButton.onclick = () => callLift(floorId);
  buttons.appendChild(upButton);
  buttons.appendChild(downButton);
  console.log({ floorId, numFloors });
  if (floorId === numFloors - 1) upButton.style.display = "none";
  if (floorId === 0) downButton.style.display = "none";

  const liftShaft = createElementWithClassName("div", "lift-shaft");

  let shaftWidth = 0;
  for (let i = 0; i < numLifts; i++) {
    shaftWidth += 50; //add current lift width
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

// eslint-disable-next-line no-unused-vars
function startLiftSim() {
  console.log("trig function");
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
    lifts.push(lift);
    floors[0].querySelector(".lift-shaft").appendChild(lift.element);
  }
}
