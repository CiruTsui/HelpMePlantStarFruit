
let params = {
  savePNG: () => saveCanvas('starfruit_garden', 'png'),
  musicVolume: 0.5,
  toggleMusic: () => {
    if (bgmReady) {
      if (bgm.isPlaying()) bgm.pause();
      else bgm.loop();
      bgm.setVolume(params.musicVolume);
    }
  }
};

const MAX_PLANTS = 12;
const START_SEEDS = 10;


// sizes of the starfruits 
const INIT_MIN = 12, INIT_MAX = 22;
const RIPE_MIN = 40, RIPE_MAX = 100;
let seeds = START_SEEDS;
let score = 0;
//random size
let plants = [];

//top/mid/but
const RATE_TOP = 0.0;   // not growing
const RATE_MID = 0.12;  // grow slow
const RATE_BOT = 0.25;  // grow fast

//bgm
let bgm, bgmReady = false, musicStarted = false;

function preload() {
  
  starFruitImg = loadImage(
    "assets/Star fruit Stardew Valley.png",
    () => imgReady = true,
    () => console.error("Failed to load star fruit image")
  );
  bgm = loadSound(
    "assets/c.mp3",
    () => { bgmReady = true; console.log("BGM loaded"); },
    
  );
}

function setup() {
  createCanvas(600, 400);
  textAlign(CENTER, CENTER);
  noCursor();

  const gui = new dat.GUI();
  gui.add(params, 'savePNG').name('Save PNG');
  gui.add(params, 'toggleMusic').name('Play / Pause BGM');
  gui.add(params, 'musicVolume', 0, 1, 0.01).name('Volume').onChange(v => {
    if (bgmReady) bgm.setVolume(v);
  });
}

function draw() {
  drawThreeStopGradient(color(0), color(255,128,0), color(255,255,0)); 

  drawCenterHint();
  updatePlants();
  drawPlants();
  drawHUD();
  drawCursor();


}


function updatePlants() {
  for (let p of plants) {
    if (p.state === 'ripe') continue; // no growing after
    const rate = growthRateForY(p.y);
    p.size += rate;
    if (p.size >= p.ripeSize) {
      p.size = p.ripeSize;
      p.state = 'ripe';
    } else if (p.size > INIT_MIN) {
      p.state = 'growing';
    }
  }
}

function drawPlants() {
  push();
  imageMode(CENTER);
  for (let p of plants) {
    if (p.state === 'seed') {
      noFill();
      stroke(40, 120, 40);
      strokeWeight(2);
      ellipse(p.x, p.y, p.size * 0.8);
    } else if (p.state === 'growing') {
      noStroke();
      fill(80, 180, 80, 180);
      ellipse(p.x, p.y, p.size);
    } else { // ripe
      if (imgReady) image(starFruitImg, p.x, p.y, p.size, p.size);
      else { noStroke(); fill(255,210,0); ellipse(p.x, p.y, p.size); }
    }
  }
  pop();
}

function mousePressed() {

  if (bgmReady && !musicStarted) {//music plays
    bgm.loop();
    bgm.setVolume(params.musicVolume);
    musicStarted = true;
  }

  // return to seed
  if (tryHarvest(mouseX, mouseY)) return;

  // 2) plant/no）
  if (seeds <= 0) return;
  if (plants.length >= MAX_PLANTS) return;

  const initSize = random(INIT_MIN, INIT_MAX);
  const targetRipe = random(RIPE_MIN, RIPE_MAX);
  plants.push({ x: mouseX, y: mouseY, size: initSize, ripeSize: targetRipe, state: 'seed' });
  seeds--;
}

function tryHarvest(mx, my) {
  for (let i = plants.length - 1; i >= 0; i--) {
    const p = plants[i];
    if (p.state !== 'ripe') continue;
    if (dist(mx, my, p.x, p.y) <= p.size * 0.5) {
      plants.splice(i, 1);
      score++;
      seeds++; 
      return true;
    }
  }
  return false;
}

function growthRateForY(y) {
  if (y < height / 3) return RATE_TOP;
  if (y < (2 * height) / 3) return RATE_MID;
  return RATE_BOT;
}

function drawThreeStopGradient(topCol, midCol, botCol) {
  noStroke();
  for (let y = 0; y < height / 2; y++) {
    const t = y / (height / 2);
    fill(lerpColor(topCol, midCol, t));
    rect(0, y, width, 1);
  }
  for (let y = height / 2; y < height; y++) {
    const t = (y - height / 2) / (height / 2);
    fill(lerpColor(midCol, botCol, t));
    rect(0, y, width, 1);
  }
}

function drawCenterHint() {
  push();
  textSize(18);
  if (mouseY < height / 3) {
    fill(0);
    text("Night: you can plant, but plants won't grow here, are you sure about this?", width/2, height/2);
  } else if (mouseY < 2 * height / 3) {
    fill(255);
    text("Sunrise: slow growth - click to plant", width/2, height/2);
  } else {
    fill(0, 255, 0);
    text("Morning: faster growth - click to plant", width/2, height/2);
  }
  pop();
}

function drawHUD() {
  push();
  textSize(14);
  noStroke();
  fill(0, 120);
  rect(8, 8, 190, 66, 6);
  fill(255);
  text(`Seeds: ${seeds}`, 103, 25);
  text(`Score: ${score}`, 103, 44);
  text(`Music: ${bgmReady ? (bgm.isPlaying() ? 'Playing' : 'Paused') : 'Loading...'}`, 103, 62);
  pop();
}

function drawCursor() {
  imageMode(CENTER);
  if (imgReady) image(starFruitImg, mouseX, mouseY, 36, 36);
  else { fill(0); ellipse(mouseX, mouseY, 10); }
}




