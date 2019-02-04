var navigate = (function() {
  $('.dd').toggle();
  $('.dd_btn').click(function() {
    var dataName = $(this).attr('data-name');
    $('.dd').hide();
    $('.' + dataName).toggle();
  });
})();


// You can change these
const precision = 6; // also controls speed

// Don't change anything below
const timeBetweenLines = 380;
const canvas = document.getElementById("can");
const ctx = canvas.getContext("2d");
const results = document.getElementById('results')
const width = ctx.canvas.width;
const height = ctx.canvas.height;
const half = width / 2;
const center = {
  x: width / 2,
  y: height / 2
};
let then = Date.now();
let startTime = then;
let frameCount = 0;
let fpsTrackingId, intervalId, timeoutId, isColourful, cool, numberOfLines, glow, maxLineThickness;

function fetchVariables() {
  isColourful = document.getElementById("colourful").checked;
  cool = parseInt(document.getElementById("cool").value);
  numberOfLines = parseInt(document.getElementById("numberOfLines").value);
  maxLineThickness = parseInt(document.getElementById("maxLineThickness").value);
  glow = document.getElementById("glow").checked;

  const spinCanvas = document.getElementById("spin").checked;
  if (spinCanvas) {
    document.getElementById('can').className = 'spin';
  } else {
    document.getElementById('can').className = '';
  }
}

function startInterval() {
  fetchVariables();
  ctx.clearRect(0, 0, width, height);
  // Make canvas circular
  ctx.beginPath();
  ctx.arc(half, half, 200, 0, Math.PI * 2, true);

  ctx.shadowBlur = 10;
  ctx.shadowColor = "#cd7f32";
  ctx.shadowBlur = 0;

  ctx.stroke();
  ctx.fill();
  ctx.clip();

  ctx.closePath();

  intervalId = setInterval(function() {
    const coords = getRandomEdgePosition();
    const vertices = getSpiral({
      x: 0,
      y: 0
    }, coords);
    const pts = vertices.reverse();
    const t = 0;
    const id = fpsTrackingId = 'animate_' + Math.floor(Math.random() * 1000);
    const color = isColourful ? generateRGB() : generateCyanOrPurple();
    ctx.strokeStyle = color;
    if (glow) {
      ctx.shadowBlur = 2;
      ctx.shadowColor = color;
    }
    ctx.lineWidth = Math.floor(Math.random() * maxLineThickness);
    ctx.lineCap = "round";

    animate(pts, t, id);
  }, timeBetweenLines);
}

function startFinishTimer() {
  timeoutId = setTimeout(function() {
    clearInterval(intervalId);
  }, timeBetweenLines * numberOfLines);
}

startInterval();
startFinishTimer();

const getDistance = function(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

const getAngle = function(p1, p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

const drawStroke = function(points, offset, strokeColor) {
  const p = points[0];

  // Default value
  offset = offset || {
    x: 0,
    y: 0
  }; // Offset to center on screen
  strokeColor = strokeColor || "black";

  ctx.strokeStyle = strokeColor;
  ctx.beginPath();
  ctx.moveTo(offset.x + p.x, offset.y + p.y);

  for (const i = 1; i < points.length; i++) {
    p = points[i];
    ctx.lineTo(offset.x + p.x, offset.y + p.y);
  }
  ctx.stroke();
};

const FibonacciGenerator = function() {
  const thisFibonacci = this;

  thisFibonacci.array = [0, 1, 2];

  thisFibonacci.getDiscrete = function(n) {
    // If the Fibonacci number is not in the array, calculate it
    while (n >= thisFibonacci.array.length) {
      const length = thisFibonacci.array.length;
      const nextFibonacci = thisFibonacci.array[length - 1] + thisFibonacci.array[length - 2];
      thisFibonacci.array.push(nextFibonacci);
    }

    return thisFibonacci.array[n];
  };

  thisFibonacci.getNumber = function(n) {
    const floor = Math.floor(n);
    const ceil = Math.ceil(n);

    if (Math.floor(n) == n) {
      return thisFibonacci.getDiscrete(n);
    }

    const a = Math.pow(n - floor, 1.15);
    const fibFloor = thisFibonacci.getDiscrete(floor);
    const fibCeil = thisFibonacci.getDiscrete(ceil);

    return fibFloor + a * (fibCeil - fibFloor);
  };

  return thisFibonacci;
};

const getSpiral = function(pA, pB) {
  const startStep = 0;
  const endStep = 4; // Each "step" is 90º, so 4 steps is a full turn=
  const angleToPointB = getAngle(pA, pB); // Angle between pA and pB
  const distToPointB = getDistance(pA, pB); // Distance between pA and pB
  const fibonacci = new FibonacciGenerator();
  // Find scale so that the last point of the curve is at distance to pB
  const endRadius = fibonacci.getNumber(endStep);
  const scale = distToPointB / endRadius;
  // Find angle offset so that last point of the curve is at angle to pB
  const angleOffset = angleToPointB - endStep * Math.PI / 2;
  const path = [];

  for (let i = startStep * precision; i <= endStep * precision; i++) {
    const step = i / precision;
    const radius = fibonacci.getNumber(step);
    const angle = step * Math.PI / 2;
    const p = {
      x: scale * radius * Math.cos(angle + angleOffset) + pA.x,
      y: scale * radius * Math.sin(angle + angleOffset) + pA.y
    };

    path.push(p);
  }
  return path;
};


function generateCyanOrPurple() {
  const rand = Math.random();

  if (rand <= 0.25) {
    return 'rgba(158, 80, 240, ' + Math.random() + ')'; // purple
  } else {
    return 'rgba(0, 255, 255, ' + Math.random() + ')'; //cyan
  }
}

/*function getRandomEdgePosition() {
	const rand = Math.random();

    if (rand < 0.25) { // Top border
        return { x: Math.random()*500 - half, y: -half };
    } else if (rand >= 0.25 && rand < 0.5) { // Right border
        return { x: half, y: Math.random()*500 - half };
    } else if (rand >= 0.5 && rand < 0.75) { // Bottom border
        return { x: Math.random()*500 - half, y: half };
    } else if (rand >= 0.75) { // Left border
        return { x: -half, y: Math.random()*500 - half }
    }
}

function getRandomSign(){
    const random = Math.floor(Math.random()*199) - 99;
    if (random === 0) {
    	return getNonZeroRandomNumber();
    }
    return Math.sign(random);
}
function generateRandomColour() {
	return Math.floor(Math.random()*255);
}
function generateRGB(){
    const red = generateRandomColour();
    const green = generateRandomColour();
    const blue = generateRandomColour();

	return `rgb(${red},${green},${blue})`
}

function animate(points, t, id) {
    if (t++ < points.length - 1) {
        // Uncomment to throttle requestAnimationFrame to watch the rendering slowly. Best to only render single line.
        // setTimeout(function() {
        requestAnimationFrame(animate.bind(self, points, t, id));
        // }, 1000 / 3);
    }
    ctx.beginPath();
    ctx.moveTo(points[t - 1].x + center.x, points[t - 1].y + center.y);
    const point = points.length > t + cool ? points[t + cool] : points[points.length - 1];
    ctx.lineTo(point.x + center.x, point.y + center.y);
    ctx.stroke();

    if (id === fpsTrackingId) {
        displayFrameData();
    }
}


function displayFrameData() {
	const now = Date.now();
    const elapsed = now - then;
	const sinceStart = now - startTime;
    const currentFps = Math.round(1000 / (sinceStart / ++frameCount) * 100) / 100;
    const totalTime = Math.round(sinceStart / 1000 * 100) / 100;
    const totalFrames = Math.round(currentFps*totalTime);

	then = now - (elapsed % 60);
    results.innerText = totalTime + " secs @ " + currentFps + " fps" + ' = ' + totalFrames + ' frames';
}

document.getElementById('can').addEventListener('click', function () {
    clearInterval(intervalId);
    clearTimeout(timeoutId);
    startInterval()
    startFinishTimer();
});
document.getElementById('can').addEventListener('contextmenu', function () {
   clearInterval(intervalId);
});
