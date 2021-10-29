//function gameplay() {



    //##################################################################################################################
    //###   CANVAS & CONTEXT
    //##################################################################################################################



    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    const log = document.getElementById('log');

    const canvas_WIDTH = canvas.width = 480;
    const canvas_HEIGHT = canvas.height = 320;

    const now = function() {return new Date().getTime()};



    //##################################################################################################################
    //###   MOUSE INTERACTIVITY
    //##################################################################################################################
    
    
    
    let mousePressed = false;
    canvas.addEventListener('mousedown', function(event) { mousePressed = true; } );
    canvas.addEventListener('mouseup', function(event){ mousePressed = false; });



    //##################################################################################################################
    //###   ANIMACOES
    //##################################################################################################################



    class Animation {
        constructor(
            imageSrc,
            src_width, src_height, row, startFrame, qtdFrames, repeat,
            dest_x = 0, dest_y = 0, dest_width = 0, dest_height = 0,
            ticksForAFrame = 3
        ) {
            // Posi��es originais
            this.src_x = 0;
            this.src_y = 0;
            // Dimens�es originais
            this.src_width = src_width;
            this.src_height = src_height;
            // Posi��es tela
            this.dest_x = dest_x;
            this.dest_y = dest_y;
            // Dimens�es tela
            this.dest_width = dest_width;
            this.dest_height = dest_height;
            // Anima��o
            this.row = row;
            this.frame = 0;
            this.startFrame = startFrame;
            this.qtdFrames = qtdFrames;
            this.lastFrame = startFrame + qtdFrames - 1;
            this.repeat = repeat;
            this.isFirstFrame = true;
            this.isLastFrame = false;
            this.ticksForAFrame = ticksForAFrame;
            // Visualiza�ao
            this.image = new Image();
            this.image.src = imageSrc;
        }
        toFrame(frame, row = this.row) {
            if (!(this.startFrame >= frame <= this.lastFrame)) {
                throw ("Frame " + frame + " solicitado, mas anima��o possui apenas frames " +
                    this.startFrame + "-" + this.lastFrame + "!");
            }
            this.row = row;
            this.src_x = Math.floor(frame) * this.src_width;
            this.src_y = row * this.src_height;

            this.isFirstFrame = (Math.floor(frame) == this.startFrame);
            this.isLastFrame = (Math.floor(frame) == this.lastFrame);

            this.frame = frame;

            return this;
        }
        addFrames(frames, tolerant = true) {
            if (tolerant) {
                if (this.frame + frames < this.startFrame) {
                    return this.toFrame(this.qtdFrames - (this.frame + frames) % this.qtdFrames);
                } else if (this.frame + frames > this.lastFrame) {
                    return this.toFrame((this.frame + frames) % this.qtdFrames);
                }

            }
            else return this.toFrame(this.frame + frames);
        }
        toFirstFrame() {
            return this.toFrame(this.startFrame);
        }
        toLastFrame() {
            return this.toFrame(this.lastFrame);
        }
        prevFrame(tolerant = true) {
            if (tolerant && this.isFirstFrame) {
                if (this.repeat) return this.toFrame(this.lastFrame);
                else return this;
            } else {
                return this.toFrame(this.frame - 1);
            }
        }
        nextFrame(tolerant = true) {
            if (tolerant && this.isLastFrame) {
                if (this.repeat) return this.toFrame(this.startFrame);
                else return this;
            } else {
                return this.toFrame(this.frame + 1);
            }
        }
        prevTimedFrame(tolerant = true) {
            if (game.tick % parseInt(this.ticksForAFrame) == 0) return this.prevFrame(tolerant);
            else return this;
        }
        nextTimedFrame(tolerant = true) {
            if (game.tick % parseInt(this.ticksForAFrame) == 0) return this.nextFrame(tolerant);
            else return this;
        }
        draw(dest_x = this.dest_x, dest_y = this.dest_y, dest_width = this.dest_width, dest_height = this.dest_height) {
            ctx.drawImage(
                this.image, // Image
                this.src_x, this.src_y, // Source X/Y
                this.src_width, this.src_height, // Source Width/Height
                dest_x - dest_width / 2, dest_y - dest_height / 2, // Destination X/Y
                dest_width, dest_height // Destination Width/Height
            );
            return this;
        }
    }



    //##################################################################################################################
    //###   PROGRESS & LIFE BAR
    //##################################################################################################################



    class ProgressBar {
        constructor(pX, pY, dW, dH, min, max, color) {
            this.pX = pX;
            this.pY = pY;
            this.dW = dW;
            this.dH = dH;
            this.minProgress = min;
            this.maxProgress = max;
            this.currProgress = 0;
            this.currProgressPerc = 0;
            this.color = color;
            this.playerIcon = new Image();
            this.playerIcon.src = "./images/progressBar/pig_bar.png";
            this.endIcon = new Image();
            this.endIcon.src = "./images/progressBar/end_bar.png";
        }
        setValue(value) {
            if (value > this.maxProgress) {
                this.currProgress = this.maxProgress;
                this.currProgressPerc = 1;
            } else if (value < this.minProgress) {
                this.currProgress = this.minProgress;
                this.currProgressPerc = 0;
            } else {
                this.currProgress = value;
                this.currProgressPerc = (value - this.minProgress) / (this.maxProgress - this.minProgress);
            };
        }
        setPerc(percentual) {
            if (percentual > 1) {
                this.currProgress = this.maxProgress;
                this.currProgressPerc = 1;
            } else if (percentual < 0) {
                this.currProgress = this.minProgress;
                this.currProgressPerc = 0;
            } else {
                this.currProgress = percentual * (this.maxProgress - this.minProgress) + this.minProgress;
                this.currProgressPerc = percentual;
            };
        }
        addValue(value) {
            this.setValue(this.currProgress + value);
        }
        addPerc(percentual) {
            this.setPerc(this.currProgressPerc + percentual);
        }
        draw() {
            ctx.lineWith = 5;
            ctx.strokeStyle = "#333";
            ctx.fillStyle = this.color;
            let drawX = this.pX - this.dW / 2;
            let drawY = this.pY - this.dH / 2;
            ctx.fillRect(drawX, drawY, this.currProgressPerc * this.dW, this.dH);
            ctx.strokeRect(drawX, drawY, this.dW, this.dH);
            ctx.drawImage(
                this.endIcon, // Image
                0, 0, // Source X/Y
                168, 138, // Source Width/Height
                drawX + this.dW - 17, drawY - (this.dH)/2, // Destination X/Y
                34, 27 // Destination Width/Height
            );
            ctx.drawImage(
                this.playerIcon, // Image
                0, 0, // Source X/Y
                197, 140, // Source Width/Height
                drawX + this.currProgressPerc*this.dW - 20, drawY - 28/2 + this.dH/2, // Destination X/Y
                39, 28 // Destination Width/Height
            );
        }
    }

    class LifeBar {
        constructor(pX, pY, dW, dH) {
            this.pX = pX;
            this.pY = pY;
            this.dW = dW;
            this.dH = dH;
            this.icoW = dW/3;
            this.livesLeft = 3;
            this.lifeIcon = new Image();
            this.lifeIcon.src = "./images/lifeBar/heart.png";
            this.lifeEmptyIcon = new Image();
            this.lifeEmptyIcon.src = "./images/lifeBar/heart_empty.png";
        }
        setLives(value) {
            value = parseInt(value);
            if (value > 3) this.livesLeft = 3;
            else if (value < 0) this.livesLeft = 0;
            else this.livesLeft = value;
        }
        addLives(value) {
            value = parseInt(this.livesLeft + value);
            this.setLives(value);
        }
        draw() {
            let measures = {
                drawX: this.pX - this.dW / 2,
                drawY: this.pY - this.dH / 2
            };
            function printIcon(iconIndex, lifeBar, measures) {
                let icon;
                if (lifeBar.livesLeft >= iconIndex) icon = lifeBar.lifeIcon;
                else icon = lifeBar.lifeEmptyIcon;

                ctx.drawImage(
                    icon, // Image
                    0, 0, // Source X/Y
                    168, 144, // Source Width/Height
                    measures.drawX + lifeBar.icoW*(iconIndex-1), measures.drawY, // Destination X/Y
                    lifeBar.icoW, lifeBar.dH // Destination Width/Height
                );
            }
            printIcon(1, this, measures);
            printIcon(2, this, measures);
            printIcon(3, this, measures);
        }
    }



    //##################################################################################################################
    //###   UI
    //##################################################################################################################



    const help1 = new Animation(
        imageSrc="./images/GUI/clique.png", src_width=400, src_height=485,
        row=0, startFrame=0, qtdFrames=2, repeat=true,
        dest_x=canvas_WIDTH/2, dest_y=canvas_HEIGHT/2, dest_width=400/5, dest_height=485/5,
        ticksForAFrame=30
    );



    //##################################################################################################################
    //###   PLAYER
    //##################################################################################################################
    
    
    
    class Player {
        constructor() {
          // Posi��o
          this.pX = 75;
          this.pY_default = 255;
          this.pY_max = 255; // Limite inferior
          this.pY = this.pY_default;
          // Vetores
          this.vY = 0;
          this.aY = 0;
          this.jumpAceleration = -8;
          this.state = 'idle'; // 'walking', 'running', 'jumping_up', 'jumping_down', 'flying', 'dying'
          this.radius = 31;
          // Anima��o
          this.anim = {
              "idle": new Animation(
                  imageSrc = "./images/Sprites/Idle_24.png", src_width = 343, src_height = 248,
                  row = 0, startFrame = 0, qtdFrames = 24, repeat = true,
                  dest_x = 75, dest_y = 255, dest_width = 343 / 4, dest_height = 248 / 4,
                  ticksForAFrame = 3
              ),
              "walking": new Animation(
                  imageSrc = "./images/Sprites/walk_24.png", src_width = 345, src_height = 259,
                  row = 0, startFrame = 0, qtdFrames = 24, repeat = true,
                  dest_x = 75, dest_y = 255, dest_width = 345 / 4, dest_height = 259 / 4,
                  ticksForAFrame = 1
              ),
              "running": new Animation(
                  imageSrc = "./images/Sprites/run_9.png", src_width = 351, src_height = 261,
                  row = 0, startFrame = 0, qtdFrames = 9, repeat = true,
                  dest_x = 75, dest_y = 255, dest_width = 351 / 4, dest_height = 261 / 4,
                  ticksForAFrame = 2.5
              ),
              "jumping_up": new Animation(
                  imageSrc = "./images/Sprites/jump_24.png", src_width = 350, src_height = 317,
                  row = 0, startFrame = 0, qtdFrames = 14, repeat = false,
                  dest_x = 75, dest_y = 255, dest_width = 350 / 4, dest_height = 317 / 4,
                  ticksForAFrame = 4
              ),
              "jumping_down": new Animation(
                  imageSrc = "./images/Sprites/jump_24.png", src_width = 350, src_height = 317,
                  row = 0, startFrame = 14, qtdFrames = 10, repeat = false,
                  dest_x = 75, dest_y = 255, dest_width = 350 / 4, dest_height = 317 / 4,
                  ticksForAFrame = 4
              ),
              "flying": new Animation(
                  imageSrc = "./images/Sprites/fly_14.png", src_width = 384, src_height = 354,
                  row = 0, startFrame = 0, qtdFrames = 14, repeat = true,
                  dest_x = 75, dest_y = 255, dest_width = 384 / 4, dest_height = 354 / 4,
                  ticksForAFrame = 3
              ),
              "dying": new Animation(
                  imageSrc = "./images/Sprites/die_14.png", src_width = 357, src_height = 259,
                  row = 0, startFrame = 0, qtdFrames = 14, repeat = false,
                  dest_x = 75, dest_y = 255, dest_width = 357 / 4, dest_height = 259 / 4,
                  ticksForAFrame = 3
              )
          };
          // Pontuacao
          this.score = 0;
        }
        update() {
            switch (game.state) {
                case 'level_running':
                    switch (this.state) {
                        case 'jumping_down':
                            if (mousePressed) this.aY = game.level.gravityAceleration * 0.3;
                            else this.aY = game.level.gravityAceleration;
    
                            this.vY += this.aY;
                            this.pY += this.vY;
    
                            if (this.pY >= this.pY_max) {
                                this.state = 'running';
                                this.anim[this.state].toFirstFrame();
                                this.pY = this.pY_max;
                                this.vY = 0;
                                this.aY = 0;
                            }
                            break;
                        case 'jumping_up':
                            if (mousePressed) this.aY = game.level.gravityAceleration * 0.6;
                            else this.aY = game.level.gravityAceleration;
    
                            this.vY += this.aY;
                            this.pY += this.vY;
    
                            if (this.vY > 0) {
                                this.state = 'jumping_down';
                                this.anim[this.state].toFirstFrame();
                            }
                            break;
                        case 'idle':
                        case 'walking':
                        case 'running':
                            if (mousePressed) {
                                this.state = 'jumping_up';
                                this.anim[this.state].toFirstFrame();
                                this.vY = this.jumpAceleration;
                            }
                            break;
                    }
                    break;
                case 'game_over':
                    if (this.pY < this.pY_max) {
                        this.aY = game.level.gravityAceleration;
                        this.vY += this.aY;
                        this.pY += this.vY;
                    }
                    break;
            }
        }
        draw() {
            this.anim[this.state].dest_x = this.pX;
            this.anim[this.state].dest_y = this.pY;
            this.anim[this.state].draw();
        }
    }



    //##################################################################################################################
    //###   BACKGROUND PARALLAX
    //##################################################################################################################
    
    
    
    class Layer {
        constructor(imageSrc, vX_layerModifier, level_speed) {
            // Posi��o
            this.pX = 0;
            this.pY = 0;
            // Vetores
            this.vX_layersDefault = -3;
            this.vX_layerModifier = vX_layerModifier;
            this.vX = level_speed * (this.vX_layersDefault + this.vX_layerModifier * this.vX_layersDefault);
            // Dimens�es
            this.sW = 659; // Largura frame original
            this.sH = 320; // Altura frame original
            this.dW = 659; // Largura desenhada
            this.dH = 320; // Altura desenhada
            // Visualiza�ao
            this.image = new Image();
            this.image.src = imageSrc;
        }
        update(level_speed) {
            this.vX = level_speed * (this.vX_layersDefault + this.vX_layerModifier * this.vX_layersDefault);
            if (this.pX > -this.dW && this.pX <= 0) {
                this.pX += this.vX;
            } else if (this.pX <= -this.dW) {
                this.pX = this.vX;
            } else {
                this.pX = this.vX;
            }
        }
        draw() {
            ctx.drawImage(this.image, this.pX, this.pY, this.sW, this.sH);
            ctx.drawImage(this.image, this.pX + this.dW - 2, this.pY, this.sW, this.sH);
        }
    }
    
    
    
    //##################################################################################################################
    //###   LEVELS
    //##################################################################################################################
    
    
    
    class Level {
        constructor(name, res_path, type, speedModifier, start_speed, gravityAceleration, duration, backgrounds) {
            this.name = name; // 'Campo do caçador'; // Exibido para o jogador
            this.res_path = res_path; // 'lv1'; // Utilizado ao puxar texturas e outros recursos
            this.type = type; // 'endless-running-side-2d'; // Utilizado para definir todos os próximos parametros
            this.speedModifier = speedModifier; // 0.00005;
            this.start_speed = start_speed; // Velocidade game, em percentual
            this.speed = start_speed; // Velocidade game, em percentual
            this.gravityAceleration = gravityAceleration; // 0.3; // Aceleração da gravidade, subtraída da aceleração do pulo do personagem
            this.startTime = null;
            this.tick = 0;
            let layers = [];
            backgrounds.forEach(bg => {
                let bgLen = backgrounds.length;
                let lrLen = layers.length;
                let vX_layerModifier;
                if (lrLen < bgLen) vX_layerModifier = -0.5 - 0.4 * (bgLen - lrLen) / (bgLen - 1);
                else vX_layerModifier = 0;
                layers.push(new Layer(res_path + "/" + bg, vX_layerModifier, start_speed));
            });
            this.layers = layers;
            //PLAYER
            this.player = null; //new Player();
            //this.player.frameY = 0;
            //PROGRESS BAR
            this.progressBar = new ProgressBar(canvas_WIDTH/3 * 2, 30, canvas_WIDTH/3 * 2 * 0.8, 16, 0, duration, 'green');
            this.lifeBar = new LifeBar(canvas_WIDTH/6, 30, canvas_WIDTH/3 * 0.8, 35)
            this.duration = duration;
            //OBSTÁCULOS
            this.obstacles = [];
            this.waitingObstacles = [];
    
            this.reset();
        }
        dificuldade() {
            this.speed += this.speedModifier * this.speed; //com aleatoriedade
        }
        //CENARIO
        update_scene(meta=true, draw=true) {
            this.layers.forEach(object => {
                if (meta) {
                    this.speed += this.speed * this.speedModifier;
                    object.update(this.speed);
                }
                if (draw) object.draw();
            }); 
        }
        //OBSTACLES
        update_obstacles(meta=true, draw=true){
            if (this.obstacles.length + this.waitingObstacles.length < 4) {
                this.waitingObstacles.push(this.tick + Math.floor(Math.random() * 2000) + 300);
            }
            
            for (var i = this.waitingObstacles.length-1; i >= 0; i--) {
              if (this.waitingObstacles[i] <= this.tick) {
                  this.obstacles.push(new Obstaculo());
                  this.waitingObstacles.splice(i, 1);
              }
            }
            for (var i = this.obstacles.length-1; i >= 0; i--) {
              if (this.obstacles[i].state == 'out_of_scene') {
                  this.obstacles.splice(i, 1);
              } else {
                  if (meta) this.obstacles[i].update();
                  if (draw) this.obstacles[i].draw();
              }
            };
        }
        //PLAYER
        update_player(meta=true, draw=true) {
            if (meta) {
                this.player.update();
                this.player.anim[this.player.state].nextTimedFrame();
            }
            if (draw) this.player.draw();
        }
        update_progressBar(meta=true, draw=true) {
            if (meta) this.progressBar.setValue(now() - this.startTime);
            if (draw) this.progressBar.draw();
        }
        update_lifeBar(meta=true, draw=true) {
            if (draw) this.lifeBar.draw();
        }
        reset() {
            this.speed = this.start_speed;
            this.startTime = null;
            this.player = new Player();
            this.player.frameY = 0;
            this.obstacles = [];
            this.waitingObstacles = [];
        }
    }
    
    var levels = {
        lv1: new Level(
            name = 'Fase 1', res_path = "./images/levels/lv1", type = 'endless-running-side-2d',
            speedModifier = 0.00005, start_speed = 1, gravityAceleration = 0.3, duration = 40000,
            backgrounds = ["bg1.png", "bg2.png", "bg3.png", "bg4.png", "bg5.png", "bg6.png"]
        ),
    
        lv2: new Level(
            name = 'Fase 2', res_path = "./images/levels/lv1", type = 'endless-running-side-2d',
            speedModifier = 0.00005, start_speed = 1, gravityAceleration = 0.3, duration = 40000,
            backgrounds = ["bg1.png", "bg2.png", "bg3.png", "bg4.png", "bg5.png", "bg6.png"]
        ),
    
        lv3: new Level(
            name = 'Fase 3', res_path = "./images/levels/lv1", type = 'endless-running-side-2d',
            speedModifier = 0.00005, start_speed = 1, gravityAceleration = 0.3, duration = 40000,
            backgrounds = ["bg1.png", "bg2.png", "bg3.png", "bg4.png", "bg5.png", "bg6.png"]
        )
    }
    
    
    
    //##################################################################################################################
    //###   OBSTACULO
    //##################################################################################################################
    
    
    
    class Obstaculo {
        constructor(){
            this.pX = canvas_WIDTH;
            this.pY = 270;
            this.radius = 20;
            this.state = "idle"; // "closing", "out_of_scene"
            this.anim = {
                "idle": new Animation(
                    imageSrc="./images/Obstaculos/trap miss_13.png", src_width=411, src_height=273,
                    row=0, startFrame=0, qtdFrames=13, repeat=true,
                    dest_x=canvas_WIDTH, dest_y=270, dest_width=62, dest_height=40,
                    ticksForAFrame=3
                ),
                "closing": new Animation(
                    imageSrc="./images/Obstaculos/trap hit_4.png", src_width=411, src_height=254,
                    row=0, startFrame=0, qtdFrames=4, repeat=false,
                    dest_x=canvas_WIDTH, dest_y=270, dest_width=73, dest_height=51,
                    ticksForAFrame=2
                ),
                "out_of_scene": new Animation(
                    imageSrc="./images/Obstaculos/trap miss_13.png", src_width=411, src_height=273,
                    row=0, startFrame=0, qtdFrames=13, repeat=true,
                    dest_x=canvas_WIDTH, dest_y=270, dest_width=62, dest_height=40,
                    ticksForAFrame=3
                )
            };
        }
        update(){
            this.pX += game.level.speed; //multiplicado pelo speedModifier do chao
            if (this.pX <= -this.anim[this.state].dest_width*2) {
                this.state = 'out_of_scene';
            }
            
            //colisao
            const dx = this.pX - game.level.player.pX;
            const dy = this.pY - game.level.player.pY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < this.radius + game.level.player.radius & this.state == 'idle') {
                game.state = 'game_over';
                this.state = 'closing';
                this.anim[this.state].toFirstFrame();
                game.level.player.state = 'dying';
                game.level.player.anim[game.level.player.state].toFirstFrame();
            }
    
            this.anim[this.state].nextTimedFrame();
        }
        draw(){
            this.anim[this.state].dest_x = this.pX;
            this.anim[this.state].dest_y = this.pY;
            this.anim[this.state].draw();
        }
    }




    //##################################################################################################################
    //###   GAME
    //##################################################################################################################
    
    
    
    class Game {
        constructor() {
            this.state = 'main_menu';
            this.levels = levels;
            this.level = levels.lv1;
            this.tick = 0;
            this.startTime = null;
        }
    
        // ITERAÇÕES
        next_tick(){
            if (this.startTime == null) this.startTime = now();
            ctx.clearRect(0, 0, canvas_WIDTH, canvas_HEIGHT);
    
            // MENU CLICK  
            function updateMainMenu(meta=true, draw=true){
                if (meta) help1.nextTimedFrame();
                if (draw) help1.draw();
            };
    
            switch (this.state) {
                case null:
                    //CENARIO
                    this.level.update_scene();
                    //PLAYER
                    this.level.player.state = 'running';
                    this.level.update_player();
                    //ESTADO DO GAME
                    this.state = 'main_menu';
    
                    this.level.tick++;
                    this.tick++;
    
                    break;
                case 'main_menu':
                    //CENARIO
                    this.level.update_scene();
                    //MENU
                    updateMainMenu();
                    //PLAYER
                    this.level.player.state = 'running';
                    this.level.update_player();
                    if (mousePressed) {
                        this.state = 'level_running';
                        this.level.player.state = 'running';
                        this.level.startTime = now();
                    }
    
                    this.level.tick++;
                    this.tick++;
    
                    break;
                case 'level_running':
                    //if (this.level.startTime == null) this.level.startTime = now();
                    //CENARIO
                    this.level.update_scene();
                    //OBSTACULOS
                    this.level.update_obstacles();
                    if (this.level.tick % 100 == 0) console.log(this.level.tick, this.level.waitingObstacles, this.level.obstacles);
                    //PLAYER
                    this.level.update_player();
                    //PROGRESS/LIFE BAR
                    this.level.update_progressBar();
                    this.level.update_lifeBar();
                    //DIFICULDADE
                    this.level.dificuldade();
    
                    this.level.tick++;
                    this.tick++;
                    
                    if (this.level.progressBar.currProgressPerc == 1) {
                        if (this.level.name == this.levels.lv1.name) {
                            this.state = 'game_finish';
                            //this.level = this.levels.lv2;
                        } else if (this.level.name == this.levels.lv2.name) {
                            this.levels.lv3;
                        } else if (this.level.name == this.levels.lv3.name) {
                            this.state = 'game_finish';
                        }
                    };

                    console.log(this.levels);

                    
                    break;
                case 'level_end':
                    //CENARIO
                    this.level.speed = 0;
                    this.level.update_scene();
                    //OBSTACULOS
                    this.level.update_obstacles();
                    //PLAYER
                    this.level.update_player();
                    //PROGRESS BAR
                    this.level.update_progressBar();
                    //DIFICULDADE
                    this.level.dificuldade();
    
                    this.level.tick++;
                    this.tick++;

                    videoEnding();
                    
                    break;
                case 'game_finish':
                    break;
                case 'game_over':
                    //CENARIO
                    this.level.speed = 0;
                    this.level.update_scene();
                    //OBSTACULOS
                    this.level.update_obstacles();
                    //PLAYER
                    this.level.update_player();
                    //PROGRESS BAR
                    this.level.progressBar.draw();
    
                    ctx.font = "bold 16px Georgia";
                    ctx.fillStyle = 'black';
                    ctx.fillText('FIM DE JOGO', canvas.width/2-40, canvas.height/2);
                    ctx.fillText('sua pontuação é de '+ this.level.player.score, canvas.width/2-60, canvas.height/2+20);
    
                    setTimeout(function(){}, 200);
                    if (mousePressed) {
                        this.state = null;
                        this.level.reset();
                    }
    
                    this.level.tick++;
                    this.tick++;
    
                    break;
            }
    
            //var obj;
            // if (obstacles.length > 0) {
                // obj = obstacles[0];
                // log.textContent = (
                //     'sprite: ( ' + String(obj.state) + ', ' + String(obj.anim[obj.state].frame) + ' )\r\n' +
                //     'pos: ( ' + String(obj.anim[obj.state].dest_x) + ', ' + String(obj.anim[obj.state].dest_y) + ' )\r\n' +
                //     'dim: ( ' + String(obj.anim[obj.state].dest_width) + ', ' + String(obj.anim[obj.state].dest_height) + ' )\r\n' +
                //     'srcPos: ( ' + String(obj.anim[obj.state].src_x) + ', ' + String(obj.anim[obj.state].src_y) + ' )\r\n' +
                //     'srcDim: ( ' + String(obj.anim[obj.state].src_width) + ', ' + String(obj.anim[obj.state].src_height) + ' )\r\n' +
                //     'vY: ' + String(obj.vY) + '\r\n' +
                //     'aY: ' + String(obj.aY) + '\r\n' +
                //     'state: ' + String(obj.state) + '\r\n' +
                //     'player pX: ' + String(obj.pX)
                // );
                
            //     var dx = obj.pX - player.pX;
            //     var dy = obj.pY - player.pY;
            //     var distance = Math.sqrt(dx*dx + dy*dy);
            //     if (game.tick % 50 == 0) console.log(distance, obj.radius + player.radius);
            // }
        }
    }
    
    var game = new Game();
    
    function gameloop() {
        game.next_tick();
        requestAnimationFrame(gameloop);
        function videoEnding() {
          const vidEnding = document.getElementById("v_ending");
          vidEnding.hidden = false;
        }
    }
    gameloop();
//}
//gameplay();