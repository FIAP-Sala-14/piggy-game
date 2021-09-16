// Código desenvolvido integralmente pela equipe
// Não há apoio de frameworks, apenas JavaScript puro, como solicitado na atividade

window.onload=function(){
    const vid = document.getElementById("v_intro");
    vid.addEventListener('ended',myHandler,false);
    function myHandler(e) {
        vid.hidden = true;
        game();
    }
}

function game(){

    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    let log = document.getElementById('log');

    const canvas_WIDTH = canvas.width = 480;
    const canvas_HEIGHT = canvas.height = 320;


    // GAME META
    let game = {
        state: null, // 'null', 'main_menu', 'pause_menu', 'level_running', 'game_over'
        speedModifier: 0.00005,
        speed: 1, // Velocidade game, em percentual
        tick: 0, // Ou iteração atual
        gravityAceleration: 0.3, // Aceleração da gravidade, subtraída da aceleração do pulo do personagem
        startTime: null,
        score: 0
    }



    // ANIMAÇÕES
    class Animation {
        constructor(
            imageSrc,
            src_width, src_height, row, startFrame, qtdFrames, repeat,
            dest_x=0, dest_y=0, dest_width=0, dest_height=0,
            ticksForAFrame=3
        ) {
            // Posições originais
            this.src_x = 0;
            this.src_y = 0;
            // Dimensões originais
            this.src_width = src_width;
            this.src_height = src_height;
            // Posições tela
            this.dest_x = dest_x;
            this.dest_y = dest_y;
            // Dimensões tela
            this.dest_width = dest_width;
            this.dest_height = dest_height;
            // Animação
            this.row = row;
            this.frame = 0;
            this.startFrame = startFrame;
            this.qtdFrames = qtdFrames;
            this.lastFrame = startFrame + qtdFrames - 1;
            this.repeat = repeat;
            this.isFirstFrame = true;
            this.isLastFrame = false;
            this.ticksForAFrame = ticksForAFrame;
            // Visualizaçao
            this.image = new Image();
            this.image.src = imageSrc;
        }
        toFrame(frame, row=this.row) {
            if (!(this.startFrame >= frame <= this.lastFrame)) {
                throw ("Frame " + frame + " solicitado, mas animação possui apenas frames " +
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
        addFrames(frames,tolerant=true) {
            if (tolerant) {
                if (this.frame + frames < this.startFrame) {
                    return this.toFrame(this.qtdFrames - (this.frame + frames) % this.qtdFrames);
                } else if (this.frame + frames > this.lastFrame) {
                    return this.toFrame((this.frame + frames) % this.qtdFrames);
                }
                 
            }
            else return this.toFrame(this.frame + frames);
        }
        toFirstFrame(){
            return this.toFrame(this.startFrame);
        }
        toLastFrame(){
            return this.toFrame(this.lastFrame);
        }
        prevFrame(tolerant=true){
            if (tolerant && this.isFirstFrame) {
                if (this.repeat) return this.toFrame(this.lastFrame);
                else return this;
            } else {
                return this.toFrame(this.frame - 1);
            }
        }
        nextFrame(tolerant=true){
            if (tolerant && this.isLastFrame) {
                if (this.repeat) return this.toFrame(this.startFrame);
                else return this;
            } else {
                return this.toFrame(this.frame + 1);
            }
        }
        prevTimedFrame(tolerant=true){
            if (game.tick % this.ticksForAFrame == 0) return this.prevFrame(tolerant);
            else return this;
        }
        nextTimedFrame(tolerant=true) {
            if (game.tick % this.ticksForAFrame == 0) return this.nextFrame(tolerant);
            else return this;
        }
        draw(dest_x=this.dest_x, dest_y=this.dest_y, dest_width=this.dest_width, dest_height=this.dest_height) {
            ctx.drawImage(
                this.image, // Image
                this.src_x, this.src_y, // Source X/Y
                this.src_width, this.src_height, // Source Width/Height
                dest_x - dest_width/2, dest_y - dest_height/2, // Destination X/Y
                dest_width, dest_height // Destination Width/Height
            );
            return this;
        }
    }



    // INSTRUÇAO
    const help1 = new Animation(
        imageSrc="./images/GUI/clique.png", src_width=400, src_height=485,
        row=0, startFrame=0, qtdFrames=2, repeat=true,
        dest_x=canvas_WIDTH/2, dest_y=canvas_HEIGHT/2, dest_width=400/5, dest_height=485/5,
        ticksForAFrame=30
    );
  


    // BACKGROUND PARALLAX
    class Layer {
        constructor(imageSrc, vX_layerModifier){
            // Posição
            this.pX = 0;
            this.pY = 0;
            // Vetores
            this.vX_layersDefault = -1.5;
            this.vX_layerModifier = vX_layerModifier;
            this.vX = game.speed * (this.vX_layersDefault + this.vX_layerModifier * this.vX_layersDefault);
            // Dimensões
            this.sW = 659; // Largura frame original
            this.sH = 320; // Altura frame original
            this.dW = 659; // Largura desenhada
            this.dH = 320; // Altura desenhada
            // Visualizaçao
            this.image = new Image();
            this.image.src = imageSrc;
        }
        update(){
            game.speed += game.speed * game.speedModifier;
            this.vX = game.speed * (this.vX_layersDefault + this.vX_layerModifier * this.vX_layersDefault);
            if (this.pX > -this.dW && this.pX <= 0) {
                this.pX += this.vX;
            } else if (this.pX <= -this.dW) {
                this.pX = this.vX;
            } else {
                this.pX = this.vX;
            }
        }
        draw(){
            ctx.drawImage(this.image, this.pX, this.pY, this.sW, this.sH);
            ctx.drawImage(this.image, this.pX + this.dW-2, this.pY, this.sW, this.sH);
        }
    }
    
    const layer1 = new Layer("./images/Fundos/bg_1.png", -0.9);
    const layer2 = new Layer("./images/Fundos/bg_2.png", -0.8);
    const layer3 = new Layer("./images/Fundos/bg_3.png", -0.7);
    const layer4 = new Layer("./images/Fundos/bg_4.png", -0.6);
    const layer5 = new Layer("./images/Fundos/bg_5.png", -0.5);
    const layer6 = new Layer("./images/Fundos/bg_6.png", 0);
    
    const gameBackground = [layer1, layer2, layer3, layer4, layer5, layer6]
    
    

    // PLAYER
    class Player{
        constructor(){
            // Posição
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
            // Animação
            this.anim = {
                "idle": new Animation(
                    imageSrc="./images/Sprites/Idle_24.png", src_width=343, src_height=248,
                    row=0, startFrame=0, qtdFrames=24, repeat=true,
                    dest_x=75, dest_y=255, dest_width=343/4, dest_height=248/4,
                    ticksForAFrame=3
                ),
                "walking": new Animation(
                    imageSrc="./images/Sprites/walk_24.png", src_width=345, src_height=259,
                    row=0, startFrame=0, qtdFrames=24, repeat=true,
                    dest_x=75, dest_y=255, dest_width=345/4, dest_height=259/4,
                    ticksForAFrame=1
                ),
                "running": new Animation(
                    imageSrc="./images/Sprites/run_9.png", src_width=351, src_height=261,
                    row=0, startFrame=0, qtdFrames=9, repeat=true,
                    dest_x=75, dest_y=255, dest_width=351/4, dest_height=261/4,
                    ticksForAFrame=3
                ),
                "jumping_up": new Animation(
                    imageSrc="./images/Sprites/jump_24.png", src_width=350, src_height=317,
                    row=0, startFrame=0, qtdFrames=14, repeat=false,
                    dest_x=75, dest_y=255, dest_width=350/4, dest_height=317/4,
                    ticksForAFrame=4
                ),
                "jumping_down": new Animation(
                    imageSrc="./images/Sprites/jump_24.png", src_width=350, src_height=317,
                    row=0, startFrame=14, qtdFrames=10, repeat=false,
                    dest_x=75, dest_y=255, dest_width=350/4, dest_height=317/4,
                    ticksForAFrame=4
                ),
                "flying": new Animation(
                    imageSrc="./images/Sprites/fly_14.png", src_width=384, src_height=354,
                    row=0, startFrame=0, qtdFrames=14, repeat=true,
                    dest_x=75, dest_y=255, dest_width=384/4, dest_height=354/4,
                    ticksForAFrame=3
                ),
                "dying": new Animation(
                    imageSrc="./images/Sprites/die_14.png", src_width=357, src_height=259,
                    row=0, startFrame=0, qtdFrames=14, repeat=false,
                    dest_x=75, dest_y=255, dest_width=357/4, dest_height=259/4,
                    ticksForAFrame=3
                )
            }
        }
        update(){
            switch (game.state) {
                case 'level_running':
                    switch (this.state) {
                        case 'jumping_down':
                            if (mousePressed) this.aY = game.gravityAceleration * 0.3;
                            else this.aY = game.gravityAceleration;
        
                            this.vY += this.aY;
                            this.pY += this.vY;
                            
                            if (this.pY >= this.pY_max) {
                                this.state = 'walking';
                                this.anim[this.state].toFirstFrame();
                                this.pY = this.pY_max;
                                this.vY = 0;
                                this.aY = 0;
                            }
                            break;
                        case 'jumping_up':
                            if (mousePressed) this.aY = game.gravityAceleration * 0.6;
                            else this.aY = game.gravityAceleration;
        
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
                        this.aY = game.gravityAceleration;
                        this.vY += this.aY;
                        this.pY += this.vY;
                    }
                    break;
            }
        }
        draw(){
            this.anim[this.state].dest_x = this.pX;
            this.anim[this.state].dest_y = this.pY;
            this.anim[this.state].draw();
        }
    }
    
    var player = new Player();
    

    
    //MOUSE INTERACTIVITY
    let mousePressed = false;
    canvas.addEventListener('mousedown', function(event) { mousePressed = true; } );
    canvas.addEventListener('mouseup', function(event){ mousePressed = false; });
    

    
    //OBSTÁCULOS
    let obstacles = [];
    let waitingObstacles = [];

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
            }
        }
        update(){
            switch (game.state) {
                case 'level_running':
                    this.pX += layer6.vX; //multiplicado pelo spedModifier do chao
                    if (this.pX <= -this.anim[this.state].dest_width*2) {
                        this.state = 'out_of_scene';
                    }
                    
                    //colisao
                    const dx = this.pX - player.pX;
                    const dy = this.pY - player.pY;
                    const distance = Math.sqrt(dx*dx + dy*dy)
                    if (distance < this.radius + player.radius) {
                        game.state = 'game_over';
                        this.state = 'closing';
                        this.anim[this.state].toFirstFrame();
                        player.state = 'dying';
                        player.anim[player.state].toFirstFrame();
                    }
                    break;
            }

            this.anim[this.state].nextTimedFrame();
        }
        draw(){
            this.anim[this.state].dest_x = this.pX;
            this.anim[this.state].dest_y = this.pY;
            this.anim[this.state].draw();
        };
    }
    

    // FASE
    function dificuldade(){
        game.speed += game.speedModifier * game.speed; //com aleatoriedade
    }



    // ITERAÇÕES
    function animate(){
        ctx.clearRect(0, 0, canvas_WIDTH, canvas_HEIGHT);
              
        // BACKGROUND PARALLAX
        function updateBG(meta=true, draw=true) {
            gameBackground.forEach(object => {
                if (meta) object.update();
                if (draw) object.draw();
            }); 
        }
        // MENU CLICK  
        function updateMainMenu(meta=true, draw=true){
            if (meta) help1.nextTimedFrame();
            if (draw) help1.draw();
        }
        // SCOREBOARD
        function pontuacao(){
            const now = new Date().getTime();
            game.score = Math.floor((now - game.startTime)/1000);
        }
        //PLAYER
        function updatePlayer(meta=true, draw=true){
            if (meta) {
                player.update();
                player.anim[player.state].nextTimedFrame();
            }
            if (draw) player.draw();
        }
        //OBSTACLES
        function updateObstacles(meta=true, draw=true){
            if (obstacles.length + waitingObstacles.length < 4) {
                waitingObstacles.push(game.tick + Math.floor(Math.random() * 2000) + 300);
            }
            waitingObstacles.forEach(function(item, index, object){
                if (item <= game.tick) {
                    obstacles.push(new Obstaculo);
                    object.splice(index, 1);
                }
            });
            obstacles.forEach(function(item, index, object){
                if (item.state == 'out_of_scene') {
                    object.splice(index, 1);
                } else {
                    if (meta) item.update();
                    if (draw) item.draw();
                }
            });
        }

        switch (game.state) {
            case null:
                updateBG(meta=true, draw=true);
                game.state = 'main_menu';
                player.frameY = 0;

                game.tick++;
                requestAnimationFrame(animate);

                break;
            case 'main_menu':
                updateBG(meta=false, draw=true);
                updateMainMenu(meta=true, draw=true);
                updatePlayer(meta=true, draw=true);
                if (mousePressed) {
                    game.state = 'level_running';
                    player.state = 'walking';
                    game.startTime = new Date().getTime();
                }
                game.tick++;
                requestAnimationFrame(animate);

                break;
            case 'level_running':
                updateBG(meta=true, draw=true);

                //OBSTACULOS
                updateObstacles(meta=true, draw=true);
                updatePlayer(meta=true, draw=true);
                if (game.tick % 100 == 0) console.log(game.tick,waitingObstacles, obstacles);
                //DIFICULDADE
                dificuldade();

                pontuacao();

                game.tick++;
                requestAnimationFrame(animate);
                
                break;
            case 'game_over':
                updateBG(meta=false, draw=true);
                updateObstacles(meta=true, draw=true);
                updatePlayer(meta=true, draw=true);

                ctx.font = "bold 16px Georgia";
                ctx.fillStyle = 'black';
                ctx.fillText('FIM DE JOGO', canvas.width/2-40, canvas.height/2);
                ctx.fillText('sua pontuação é de '+ game.score, canvas.width/2-60, canvas.height/2+20);

                setTimeout(function(){}, 200);
                if (mousePressed) {
                    game = {
                        state: null, // 'null', 'main_menu', 'pause_menu', 'level_running', 'game_over'
                        speedModifier: 0.00005,
                        speed: 1, // Velocidade game, em percentual
                        tick: 0, // Ou iteração atual
                        gravityAceleration: 0.3, // Aceleração da gravidade, subtraída da aceleração do pulo do personagem
                        startTime: null,
                        score: 0
                    };
                    player = new Player();
                    obstacles = [];
                    waitingObstacles = [];
                }

                game.tick++;
                requestAnimationFrame(animate);

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



    animate();
}
    
    
    