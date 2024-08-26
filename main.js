//#region Main
  var canvas = new fabric.Canvas('c', 
  {
    selection : false,
    controlsAboveOverlay:true,
    centeredScaling:true,
    allowTouchScrolling: true
  }
);
  // canvas.selection = false;
  var canvasWidth = canvas.getWidth();
  var canvasHeight = canvas.getHeight();
  var isEnded = false;
  const automaticPlayer = {id: 2, name: '20-100', color:'#D33F49'};
  turnId = automaticPlayer.id;
  var players = [
    {id: 1, name: 'Karolina', isFirst:true, color:'#77BA99'},
    // {id: 2, name: 'Clervil', isFirst: false, color:'#D33F49'}
    automaticPlayer
  ];

  var lastPin;

  document.getElementById("box-1").style.backgroundColor = players.find(x => x.id === 1).color;
  document.getElementById("box-2").style.backgroundColor =players.find(x => x.id === 2).color;

  document.getElementById("player-1").innerHTML  = players.find(x => x.id === 1).name;
  document.getElementById("player-2").innerHTML  = players.find(x => x.id === 2).name;


  var pins = [];
  var directions = [{x:0, y:1}, {x:1, y:0}, {x:1, y:1}, {x:-1, y:1} ];
  var tmp;
  
  canvas.on('mouse:move', function(options) {

    var result = calculatePosition(options.e.layerX, options.e.layerY, 10); 

    if(tmp) canvas.remove(tmp);
    tmp = addCircle(result.left, result.top, players.find(x => x.id === turnId).color, 0.4);

  });
  canvas.on('mouse:out', function(options) {
    if(tmp) canvas.remove(tmp);
  });

  canvas.on('mouse:down', function(options) {
    var result = calculatePosition(options.e.layerX, options.e.layerY, 10); 
    var pin = {x:result.left, y:result.top};

    play(pin);
    
  });

  function play(pin) {
    
    var circleResult = addCircle(pin.x, pin.y, players.find(x => x.id === turnId).color);
    if (!circleResult) return circleResult;

    if(lastPin) canvas.remove(lastPin);
    lastPin = addLastCircle(pin.x, pin.y, players.find(x => x.id === turnId).color);

    pin.playerId = turnId;
    pin.id = pins.length;

    pins.push(pin);
        
    var alignPins = isComplete(pin); 
    if (alignPins) {
      var turnIdLocal = turnId;
      addLine(alignPins[0], alignPins[alignPins.length-1], players.find(x => x.id === turnIdLocal).color);
      isEnded = true;
    }

    changePlayer();
    automaticPlay();

    return circleResult;
  }

  function calculatePosition(left, top, width) {
     var calculateLeft = Math.round(left / (width*4));
     var calculateTop = Math.round(top / (width*4));

     return {
       top:  calculateTop*4*width,
       left: calculateLeft*4*width
     }

  }

  // draw_grid(10, 0.3);
  draw_grid(40, 0.8);

  
  function draw_grid(size, opacity = 0.3) {

    let line = null;
    let rect = [];


    for (let i = 0; i < Math.ceil(canvasWidth / size); ++i) {
        rect[0] = i * size;
        rect[1] = 0;

        rect[2] = i * size;
        rect[3] = canvasWidth;

        line = null;
        line = new fabric.Line(rect, {
            stroke: '#999',
            opacity: opacity,
            excludeFromExport: true
        });

        line.selectable = false;
        line.hoverCursor = 'default';
        canvas.add(line);
        line.sendToBack();

    } 
 
    for (let i = 0; i < Math.ceil(canvasWidth / size); ++i) {
      rect[0] = 0;
      rect[1] = i * size;

      rect[2] = canvasWidth;
      rect[3] = i * size;

      line = null;
      line = new fabric.Line(rect, {
          stroke: '#999',
          opacity: opacity,
          excludeFromExport: true
      });
      line.selectable = false;
      line.hoverCursor = 'default';
      canvas.add(line);
      line.sendToBack();

  }
 
  canvas.renderAll();
}

function isPinValid(pin) {
  return !(pin.x<20 || pin.y<20 || pin.x>xTot-20 || pin.y>yTot-20);
}

function addCircle(x, y, color='black', opacity=1) {
  if( !isPinValid({x:x, y:y}) || isEnded) return;
  if(pins.find(p => p.x === x && p.y ===y)) return;
  var circle = new fabric.Circle({ 
    angle: 30,
    radius: 10,
    top: y,
    left: x,
    opacity: opacity,
    fill:color,
    originX: 'center',
    originY: 'center'
   });
  circle.selectable = false;
  circle.hoverCursor = 'default';
  canvas.add(circle);
  return circle;
}

function addLastCircle(left, top, color='black', opacity= 0.5) {
  var circle = new fabric.Circle({ 
    angle: 30, 
    radius: 10, 
    top: top, 
    left: left, 
    opacity: opacity, 
    fill:color,
    originX: 'center',
    originY: 'center',
  });
  circle.selectable = false;
  circle.hoverCursor = 'default';
  canvas.add(circle);

  animateCircle(circle, 1);

  checkIsMapIsFull();

  return circle;
}

function checkIsMapIsFull() {
  if (totalPins === pins.length) {
    isEnded = true;
    alert('Ya no hay más jugada posible');
  }
}

function addRect(left, top, width, borderWidth) {
  const rect = new fabric.Rect({
    top: top,
    left: left,
    width: width,
    height: width,
    hasBorder: true,
    stroke: 'black',
    strokeWidth: borderWidth,
    fill:'transparent'
  });
  canvas.add(rect);
}

function addLine(pinFirst, pinLast, color='black') {
  const line = new fabric.Line([pinFirst.x, pinFirst.y, pinFirst.x, pinFirst.y], {
    stroke: color,
    strokeWidth: 3,
    originX: 'center',
    originY: 'center'
  });
  line.selectable = false;
  line.hoverCursor = 'default';
  canvas.add(line);
  line.animate({
    x2: pinLast.x,
    y2: pinLast.y
  }, {
    onChange: canvas.renderAll.bind(canvas),
    onComplete: function() {
      line.setCoords();
      alert(` ${players.find(x => x.id === pinLast.playerId).name} ha completado un cinco!!!` );
    },
    duration: 2000
  });
}

function isComplete(pin, toGroup=true, directionIndex = null, otherPlayer= false) {
  var alignPins = [];

  localDirections = directionIndex ? [ directions[directionIndex] ] : directions;
  

  for (let ind = 0; ind < localDirections.length; ind++) {
    const element = localDirections[ind];
    alignPins = [...getAligns(pin, element, -1, otherPlayer), ...getAligns(pin, element, 1, otherPlayer)];

    if (alignPins.length === 5) {
      return alignPins;
    }
    else if(toGroup && alignPins.length < 5) group(alignPins, ind);

  }

  function getAligns(pin, element, sign, otherPlayer) {
    var alignPins = [];
    const playerId = !otherPlayer ? turnId : players.find(x => x.id != turnId).id;  
    if(sign === 1) alignPins.push(pin);
    for (let index = 1; index <= 6; index++) {
      var nextPin = calculateNextPin(pin, element, sign, index);
      nextPin.playerId = playerId;
      nextPin = pins.find(p => p.x === nextPin.x && p.y === nextPin.y && p.playerId === playerId);
      if(nextPin) 
        if(sign === 1) alignPins.push(nextPin);
        else alignPins.unshift(nextPin);
      else break;      
    }
    return alignPins;
  }

}



function calculateNextPin(originPin, direction, sign, distance) {
  return {
    x: originPin.x + (direction.x*40*distance*sign), 
    y: originPin.y + (direction.y*40*distance*sign)
  }
}

function changePlayer() {
  turnId = players.find(x => x.id != turnId).id;
  if (turnId === automaticPlayer.id) automaticPlay();
}


function animateCircle(circle, dir, max=1) {
  const minScale = 1;
  const maxScale = 1.5;
  let counter = 1;
  action(dir);
  function action(dir) {
    return new Promise(resolve => {
      circle.animate({
        scaleX: dir ? maxScale : minScale,
        scaleY: dir ? maxScale : minScale
      }, {
        easing: fabric.util.ease.easeOutCubic,
        duration: 1000,
        onChange: canvas.renderAll.bind(canvas),
        onComplete: function() {
          if (counter >= max) {
            resolve('finished animating the point');
          } else {
            if (dir == 1)
              action(0);
            else
              action(1);
  
          }
          counter++;
        }
  
      });
    });
  }

}

function orderTwoPins(pinA, pinB) {
  let result = [];
  if(pinA.y === pinB.y) {
    result = pinA.x - pinB.x < 0 ? [pinA, pinB] : [pinB, pinA]; 
  } else {
    result = pinA.y -pinB.y < 0 ? [pinA, pinB] : [pinB, pinA]; 
  }
  return result;
}

function getPinById(id) {
  return pins.find(x => x.id === id);
}
function getPinByXY(pin) {
  return pins.find(p => p.x === pin.x && p.y === pin.y);
}
function getPinByXYAndUserId(pin, playerId) {
  return pins.find(p => p.x === pin.x && p.y === pin.y && p.playerId === playerId);
}


//#endregion



//#region AutomaticPlayer
let onePins = [];
let twoPins = []; 
let threePins = []; 
let fourPins = [];  

// goodOption = []; 


const starterPatterns = [
  {name: 'line'},
  // {name: 'triangle'},
  // {name: 'bigTriangle'},
]
const starterPattern = starterPatterns[getRandomInt(0, starterPatterns.length-1)];
const xTot = 1200 ;
const yTot = 600 ;
const totalPins = ((xTot / 40) - 1) * ((yTot / 40) - 1);
function calculateCenter() {


  return randomCenter({x: correctCenter(xTot) , y: correctCenter(yTot)});
  
  function correctCenter(num) {
    var middleNum = (num/2);
    return  middleNum - (middleNum%40);
  }
  
  function randomCenter(pin) {
    
    var localDirections = [
      ...[{x:0, y:0}], 
      ...directions, 
      ...directions.map(p => { return {x:p.x * 2, y:p.y *2} }),
      // ...directions.map(p => { return {x:p.x * 3, y:p.y *3} }),
    ];

    rnd = getRandomInt(0,localDirections.length - 1);
    const result ={x: pin.x + 40 * localDirections[rnd].x , y: pin.y + 40 * localDirections[rnd].y}
    // console.log(result);
    return result;
  }

}

automaticPlay();
function automaticPlay() {
  if(turnId != automaticPlayer.id) return;

  //first player, first pin
  if (pins.length === 0) {
    play(calculateCenter());
    return;
  }
  //first player, second pin
  if (pins.length === 2) {
    play(calculateSecondPin(pins[0]));
    return;
  }
  //first player, third pin
  if (pins.length === 4) {
    play(calculateSecondPin(pins[0]));
    return;
  }

  else {
    smartPlay();
  }
}

function calculateSecondPin(pin, distance=1) {
  possibilities = directions.map(p => {
    return {x: pin.x + 40 * distance * p.x , y: pin.y + 40 * distance * p.y}
  });

  possibilities = possibilities.filter(x => pins.filter(p => p.x === x.x && p.y === x.y).length === 0 );

  return possibilities[getRandomInt(0, possibilities.length - 1)];

}


function group(pins, directionIndex) {
  const pinsGroup = {playerId:pins[0].playerId, directionIndex: directionIndex, pinIds: pins.map(x => x.id)};

  if (pins.length > 1) {
    const badOnesFilter = onePins.filter(x => pinsGroup.pinIds.find(p => p === x.pinIds[0]) && x.directionIndex === pinsGroup.directionIndex);
    badOnesFilter.forEach(element => {
      RemoveSubGroupFromGroup(onePins, element);
    });
  }

  switch (pins.length) {
    case 1:
      const isOnePinValid = isGroupValid(pinsGroup);
      // if (!onePins.find(x => x === pins)) {
        if ( isOnePinValid.result && 
            ((isOnePinValid.startAdditionalPins > 0 && isValidOnePattern(isOnePinValid.startPattern)) || 
              (isOnePinValid.endAdditionalPins > 0 && isValidOnePattern(isOnePinValid.endPattern)))
        ) {
          onePins.push(pinsGroup);
        }
      // }
      break;
    case 2:
      twoPins.push(pinsGroup);
      break;
    case 3:
      threePins.push(pinsGroup);
      RemoveSubGroupFromGroup(twoPins, pinsGroup);
      break;
    case 4:
      fourPins.push(pinsGroup);
      RemoveSubGroupFromGroup(threePins, pinsGroup);
      break;
  
    default:
      break;
  }

}

function isValidOnePattern(pattern) {
  let element = pattern[0];
  for (let index = 0; index < pattern.length - 1; index++) {
    const elementTmp = pattern[index + 1];
    if(element === 1 && element === elementTmp)
      return false;
    
    element = elementTmp;
  }
  return true;
}


function RemoveSubGroupFromGroup(bigGroup, pinsGroup) {
  var indexToRemove = bigGroup.findIndex(x => 
    pinsGroup.directionIndex === x.directionIndex &&  
    pinsGroup.pinIds.findIndex(p => p === x.pinIds[0]) > -1 &&  
    pinsGroup.pinIds.findIndex(p => p === x.pinIds[x.pinIds.length-1]) > -1)
  if(indexToRemove > -1) {
      bigGroup.splice(indexToRemove,1);
    }
}

function isGroupValid(group) {

  const otherPlayerId = players.find(x => x.id != group.playerId).id;

  const start = operation(getPinById(group.pinIds[0]), -1);
  const end = operation(getPinById(group.pinIds[group.pinIds.length-1]), 1);
  

  const result = {
    result: start.count === 5 || end.count === 5,
    start: start.count === 5,
    end: end.count === 5,
    startAdditionalPins: start.additionalPinsCount,
    endAdditionalPins: end.additionalPinsCount,
    startPattern: start.pattern,
    endPattern: end.pattern
  };


  return result;
  function operation(pin, sign) {
    let count = group.pinIds.length;
    const c = 7 - group.pinIds.length;
    additionalPinsCount = 0;

    let pattern = [1];

    for (let index = 1; index < c; index++) {
      const nextPin = calculateNextPin(pin, directions[group.directionIndex], sign, index);
      if (count < 5) {
        if(!isPinValid(nextPin) || getPinByXYAndUserId(nextPin, otherPlayerId)) break;
        else {
          count++;
          if(getPinByXYAndUserId(nextPin, group.playerId)) 
          {
            additionalPinsCount++;
            pattern.push(1);
          }
          else {
             pattern.push(0);
          }
        } 
      } else {
        if(getPinByXYAndUserId(nextPin, group.playerId)) count++;
      }
    }

    return {
      count: count,
      additionalPinsCount: additionalPinsCount,
      pattern: pattern,
    };
  }

}



function smartPlay() {

  //fourPins --automaticPlayer
  const autoFourPins = fourPins.filter(x => x.playerId === automaticPlayer.id);

  if(autoFourPins.length > 0) {
    processSmartPlay(autoFourPins, fourPins);
     return;
  }

  // //fourPins --player
  const playerFourPins = fourPins.filter(x => x.playerId != automaticPlayer.id);
  if(playerFourPins.length > 0) {
    processSmartPlay(playerFourPins, fourPins);
     return;
  }
  
  //threePins --automaticPlayer
  const autoThreePins = threePins.filter(x => x.playerId === automaticPlayer.id);
  if(autoThreePins.length > 0) {
    processSmartPlay(autoThreePins, threePins);
    return;
  }
  
  
  //threePins --player
  const playerThreePins = threePins.filter(x => x.playerId != automaticPlayer.id);
  if(playerThreePins.length > 0) {
    processSmartPlay(playerThreePins, threePins);
    return;
}

  //twoPins --automaticPlayer
  const autoTwoPins = twoPins.filter(x => x.playerId === automaticPlayer.id);
  if(autoTwoPins.length > 0) {
    processSmartPlay(autoTwoPins, twoPins);
     return;
  }

  //twoPins --player
  const playerTwoPins = twoPins.filter(x => x.playerId != automaticPlayer.id);
  if(playerTwoPins.length > 0) {
    processSmartPlay(playerTwoPins, twoPins);
     return;
  }

  //onePins --automaticPlayer
  const autoOnePins = onePins.filter(x => x.playerId === automaticPlayer.id);
  if(autoOnePins.length > 0) {
    processSmartPlay(autoOnePins, onePins);
     return;
  }

  //onePins --player
  const playerOnePins = onePins.filter(x => x.playerId != automaticPlayer.id);
  if(playerOnePins.length > 0) {
    processSmartPlay(playerOnePins, onePins);
     return;
  }

  playLastPin();

}

function playLastPin() {
  let totYs = yTot / 40;
  let totXs = xTot / 40;
  let theYs = [];
  
  for (let index = 1; index < totYs; index++) {
    theYs.push(index * 40);
  }

  while (theYs.length > 0) {
    let aleatoryPin = {y: getRandomInt(0, theYs.length - 1)};
    for (let index = 1; index < totXs; index++) {
      aleatoryPin.x = (index * 40);

      if(getPinByXY(aleatoryPin)) break;
    }
    if(getPinByXY(aleatoryPin)) break;

    theYs.splice(theYs.findIndex(y => y === aleatoryPin.y), 1);
  }
  
}

function processGroupToPlay(isGValid, group) {
  

  const startPin =  isGValid.start ? calculateNextPin(getPinById(group.pinIds[0]), directions[group.directionIndex], -1, 1) : null;
  const endPin =  isGValid.end ? calculateNextPin(getPinById(group.pinIds[group.pinIds.length - 1]), directions[group.directionIndex], 1, 1) : null;

  if(isGValid.start && isGValid.end) {


    if (isGValid.startAdditionalPins > isGValid.endAdditionalPins) {
      play(startPin);
    } else if((isGValid.startAdditionalPins < isGValid.endAdditionalPins)) {
      play(endPin);
    } else {
      playRandom([startPin, endPin]);
    }

    return;
  }
  if(isGValid.start) {

    play(startPin);
    return;
  }
  if(isGValid.end) {
    play(endPin);
    return;
  }
  console.log('error: processGroupToPlay');
}

function processSmartPlay(pinsGroup, bigGroup) {

  let additionalGroupPin;

  switch (bigGroup) {
    case fourPins:
      additionalGroupPin = 0;
      break;
    case threePins:
      additionalGroupPin = 1;
      break;
    case twoPins:
      additionalGroupPin = 2;
      break;
    case onePins:
      additionalGroupPin = 3;
      break;

    default:
      break;
  }

  // let pinsGroup;

    let isValidPinGroups = pinsGroup.map(group => {
      return {
        isGroupValid: isGroupValid(group), 
        group: group
      };
    });
  
    
    isValidPinGroups.filter(x => !x.isGroupValid.result).forEach(element => {
      bigGroup.splice(bigGroup.findIndex(grp => grp === element.group), 1);
    });
  
    const validPins = isValidPinGroups.filter(x => x.isGroupValid.result);
    const twoWaysValidPins = validPins.filter(x => 
      (x.isGroupValid.start && x.isGroupValid.end) || 
      (x.isGroupValid.start && x.isGroupValid.endPattern[x.isGroupValid.endPattern.length - 1] === 0) ||
      (x.isGroupValid.end && x.isGroupValid.startPattern[x.isGroupValid.startPattern.length - 1] === 0)
      );
    const oneWayValidPins = validPins.filter(x => !twoWaysValidPins.find(y => y === x ));
    const orderedPins = [...twoWaysValidPins, ...oneWayValidPins];
  console.log(orderedPins);
    if(orderedPins.length > 0) {
      let isValidGroupToPlay;
      // let isValidGroupToPlay = orderedPins.find(x => x.isGroupValid.startAdditionalPins === additionalGroupPin || x.isGroupValid.endAdditionalPins === additionalGroupPin);

      for (let index = 0; index < additionalGroupPin; index++) {
        if (isValidGroupToPlay) break;
        isValidGroupToPlay = orderedPins.find(x => x.isGroupValid.startAdditionalPins === additionalGroupPin - index);
      }

      isValidGroupToPlay = isValidGroupToPlay ?? orderedPins[0]; 

      processGroupToPlay(isValidGroupToPlay.isGroupValid, isValidGroupToPlay.group);
    } else {
      smartPlay();
    }
  
    return;
}

function playRandom(pinGroup) {
let rdmPin;
  
  while (pinGroup.length > 0) {
    rdmPin = pinGroup[getRandomInt(0, pinGroup.length - 1)];
    if(play(rdmPin)) {
      return true;
    } else {
      pinGroup.splice(pinGroup.findIndex(p => p.x === rdmPin.x && p.y === rdmPin.y), 1);
    }
  }
  return false;
}

//#endregion

//#region Helpers

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//#endregion
