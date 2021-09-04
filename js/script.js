//CANVAS, SPRITE, DEGREE E FRAMES - AULA 01
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const sprite = new Image();
sprite.src = "../assets/sprite.png";
//sprite.src = "./assets/images/mars2.png";

const DEGREE = Math.PI / 180;

let frames = 0;

//background AULA 01
const bg = {
  sX: 0,
  sY: 0,
  w: 275,
  h: 226,
  x: 0,
  y: canvas.height - 226,
  draw() {
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );

    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  }
};

//foreground AULA 02
const fg = {
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  y: canvas.height - 112,
  dx: 2,
  draw() {
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );

    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  },
  update() {
    if (state.current !== state.game) return;

    this.x = (this.x - this.dx) % (this.w / 2);
  }
};

//pipes AULA 03
const pipes = {
  position: [],
  top: {
    sX: 553,
    sY: 0
  },
  bottom: {
    sX: 502,
    sY: 0
  },
  w: 53,
  h: 400,
  gap: 85,
  dx: 2,
  maxYPos: -150,
  draw() {
    for (const { x, y } of this.position) {
      ctx.drawImage(
        sprite,
        this.top.sX,
        this.top.sY,
        this.w,
        this.h,
        x,
        y,
        this.w,
        this.h
      );

      ctx.drawImage(
        sprite,
        this.bottom.sX,
        this.bottom.sY,
        this.w,
        this.h,
        x,
        y + this.h + this.gap,
        this.w,
        this.h
      );
    }
  },
  update() {
    if (state.current !== state.game) return;

    for (const p of this.position) {
      p.x -= this.dx;

      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > p.y &&
        bird.y - bird.radius < p.y + this.h
      ) {
        state.current = state.over;
        return;
      }

      const bPipeY = p.y + this.gap + this.h;

      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > bPipeY &&
        bird.y - bird.radius < bPipeY + this.h
      ) {
        state.current = state.over;
        return;
      }

      if (p.x + this.w <= 0) {
        this.position.shift();
        score.value++;
      }
    }

    if (frames % 150 !== 0) return;

    this.position.push({
      x: canvas.width,
      y: this.maxYPos * (Math.random() + 1)
    });
  },
  reset() {
    this.position = [];
  }
};

//bird AULA 01
const bird = {
  animation: [
    { sX: 277, sY: 112 },
    { sX: 277, sY: 139 },
    { sX: 277, sY: 164 },
    { sX: 277, sY: 139 }
  ],
  x: 50,
  y: 150,
  w: 34,
  h: 26,
  frame: 0,
  speed: 0,
  gravity: 0.5,
  jump: 4.6,
  rotation: 0,
  radius: 12,
  draw() {
    const bird = this.animation[this.frame];

    ctx.save();

    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.drawImage(
      sprite,
      bird.sX,
      bird.sY,
      this.w,
      this.h,
      -this.w / 2,
      -this.h / 2,
      this.w,
      this.h
    );

    ctx.restore();
  },
  go() {
    this.speed = -this.jump;
  },
  update() {
    if (state.current === state.over) return;

    const period = state.current === state.game ? 5 : 10;

    if (frames % period !== 0) return;

    this.frame = (this.frame + 1) % this.animation.length;

    if (state.current === state.getReady) {
      this.y = 150;
      this.rotation = 0 * DEGREE;

      return;
    }

    this.speed += this.gravity;
    this.y += this.speed;

    if (this.y + this.h / 2 >= canvas.height - fg.h) {
      this.y = canvas.height - fg.h - this.h / 2;

      state.current = state.over;

      return;
    }

    if (this.speed >= this.jump) {
      this.rotation = 25 * DEGREE;
      this.frame = 1;
    } else {
      this.rotation = -25 * DEGREE;
    }
  },
  reset() {
    this.speed = 0;
  }
};

//start game AULA 01
const getReady = {
  sX: 0,
  sY: 228,
  w: 173,
  h: 152,
  x: canvas.width / 2 - 173 / 2,
  y: 80,
  draw() {
    if (state.current !== state.getReady) return;

    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );
  }
};

//end game AULA 04
const gameOver = {
  sX: 175,
  sY: 228,
  w: 225,
  h: 202,
  x: canvas.width / 2 - 225 / 2,
  y: 90,
  draw() {
    if (state.current !== state.over) return;

    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );
  }
};

//score AULA 04
const score = {
  best: +localStorage.getItem("best-score") || 0,
  value: 0,
  draw() {
    if (state.current === state.getReady) return;

    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";

    if (state.current === state.game) {
      ctx.lineWidth = 2;
      ctx.font = "35px Teko";

      ctx.fillText(this.value, canvas.width / 2, 50);
      ctx.strokeText(this.value, canvas.width / 2, 50);
    } else if (state.current === state.over) {
      ctx.lineWidth = 2;
      ctx.font = "25px Teko";

      this.best = Math.max(this.best, this.value);
      localStorage.setItem("best-score", this.best);

      ctx.fillText(this.value, 225, 186);
      ctx.strokeText(this.value, 225, 186);
      ctx.fillText(this.best, 225, 228);
      ctx.strokeText(this.best, 225, 228);
    }
  },
  reset() {
    this.value = 0;
  }
};

//start button AULA 04
const startBtn = {
  x: 120,
  y: 263,
  w: 83,
  h: 29
};

//game states AULA 01
const state = {
  current: 0,
  getReady: 0,
  game: 1,
  over: 2
};

//draw game
function draw() {
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  bg.draw(); //AULA 01
  pipes.draw(); //AULA 03
  fg.draw(); //AULA 02
  bird.draw(); // AULA 01
  getReady.draw(); //AULA 01
  gameOver.draw(); //AULA 04
  score.draw(); // AULA 04
}

//update AULA 01
function update() {
  pipes.update(); //AULA 03
  fg.update(); //AULA 02
  bird.update(); //AULA 01
}

function loop() {
  update();
  draw();

  frames++;

  requestAnimationFrame(loop);
}

//AULA 01
canvas.addEventListener("click", (evt) => {
  switch (state.current) {
    case state.getReady:
      state.current = state.game;
      break;

    case state.game:
      bird.go();
      break;

    case state.over:
      const { left, top } = canvas.getBoundingClientRect();
      const { clientX, clientY } = evt;

      const clickX = clientX - left;
      const clickY = clientY - top;

      const { x, y, w, h } = startBtn;

      if (clickX > x && clickX <= x + w && clickY > y && clickY <= y + h) {
        state.current = state.getReady;

        bird.reset(); //AULA 01
        pipes.reset(); //AULA 03
        score.reset(); //AULA 04
      }
      break;

    default:
  }
});

loop();
