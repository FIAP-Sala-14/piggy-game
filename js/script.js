window.onload=function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d'); 
    const v = document.getElementById('v');

    const canvas_WIDTH = canvas.width = 480;
    const canvas_HEIGHT = canvas.height = 320; 
    

    let gameSpeed = 2;
    let gameFrame = 0;
    let gameOver = false;

    
    let score = 0;
    var tInicial = new Date().getTime();
    var tAtual;


    //INSTRUÇAO
    const clickImage = new Image();
    clickImage.src = "./images/GUI/clique.png"

   class menuClick {
       constructor(image){
           this.x = canvas_WIDTH/2
           this.y = canvas_HEIGHT/2
           this.frameX = 0
           this.frameY = 0
           this.width = 400
           this.height = 485
           this.image = image
       }
       update(){
            if (gameFrame % 12 == 0){
                if (this.frameX <1){
                this.frameX++
                } else {
                this.frameX=0
                }
            } 
        }   
       draw(){
          ctx.drawImage(clickImage, this.frameX*this.width, this.frameY*this.height, this.width, this.height, this.x, this.y, this.width/8, this.height/8)
        }
   }
    
   const clique = new menuClick;
  

    //BACKGROUND PARALLAX
    const backgroundLayer1 = new Image();
    backgroundLayer1.src = "./images/Fundos/bg_1.png"
    const backgroundLayer2 = new Image();
    backgroundLayer2.src = "./images/Fundos/bg_2.png"
    const backgroundLayer3 = new Image();
    backgroundLayer3.src = "./images/Fundos/bg_3.png"
    const backgroundLayer4 = new Image();
    backgroundLayer4.src = "./images/Fundos/bg_4.png"
    const backgroundLayer5 = new Image();
    backgroundLayer5.src = "./images/Fundos/bg_5.png"
    const backgroundLayer6 = new Image();
    backgroundLayer6.src = "./images/Fundos/bg_6.png"
    
    
    class Layer {
        constructor(image, speedModifier){
            this.x = 0;
            this.y = 0;
            this.width = 659;
            this.height = 320;
            this.x2 = this.width;
            this.image = image;
            this.speedModifier = speedModifier;
            this.speed = gameSpeed * this.speedModifier;
        }
        update(){
            this.speed = gameSpeed * this.speedModifier;
            if (this.x <= -this.width){
                this.x = this.width + this.x2 - this.speed;
    
            }
            if (this.x2 <= -this.width){
                this.x2 = this.width + this.x - this.speed;
                
            }
            this.x = Math.floor(this.x - this.speed);
            this.x2 = Math.floor(this.x2 - this.speed);
        }
        draw(){
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            ctx.drawImage(this.image, this.x2, this.y, this.width, this.height);
        }
    }
    
    const layer1 = new Layer(backgroundLayer1, 0.2);
    const layer2 = new Layer(backgroundLayer2, 0.5);
    const layer3 = new Layer(backgroundLayer3, 1.0);
    const layer4 = new Layer(backgroundLayer4, 1.1);
    const layer5 = new Layer(backgroundLayer5, 1.1);
    const layer6 = new Layer(backgroundLayer6, 1.1);
    
    const gameBackgrounds = [layer1, layer2, layer3, layer4, layer5, layer6]
    
    
    
    
    //PLAYER
    const piggyPic = new Image();
    piggyPic.src = "./images/Sprites/piggy sprites.png"
    //let angle = 0

    class Player{
        constructor(){
            this.x = 110;
            this.y = 260;
            this.vy = 0; //velocidade de queda
            this.radius = 25;
            this.frameX = 0;
            this.frameY = 0;
            this.width = 666;
            this.height = 511;
            this.weight = 1;
        }
        update(){
           // let curve = Math.sin(angle)
            if (this.y > 260){
                this.y = 260;
                this.vy = 0;  //limite inferior
            } else{
                this.vy += this.weight;
                this.y += this.vy; //essas duas linhas fazem o porco cair e quanto mais ele cai, mais rápido fica (efeito gravidade)    
            }
            if (this.y < 160){ //+ curve){
                this.y = 160 //+ curve;
                this.vy = 0;  //limite superior do pulo + animação de "esforço"=curve
            }
    
    
            if (mousePressed) {
                this.vy -=2;
                this.frameY = 3;
                if (gameFrame % 2.8 == 0){
                    if (this.frameX < 23){
                        this.frameX++
                    } else {
                    this.frameX=0
                }
            }
            } else {    
                this.frameY = 2;
            if (gameFrame % 5 == 0){
                if (this.frameX < 8){
                    this.frameX++
                } else {
                    this.frameX= 0
                }
            }
            }
            
        }
        draw(){
          /*ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            ctx.fill();
            ctx.closePath();
          */     
            ctx.drawImage(piggyPic, this.frameX*this.width, this.frameY*this.height, this.width, this.height, this.x - 35, this.y -35, this.width/8, this.height/8)
        }
    }
    
    const piggy = new Player();
    
    function gravidade() {
        mousePressed = false //limite de tempo no ar
    }
    
    //MOUSE INTERACTIVITY
    let mousePressed = false;
    canvas.addEventListener('mousedown', function(event){
        mousePressed = true;
        setTimeout(gravidade, 1500/gameSpeed); //limite de quanto ele segura em cima
    });
    canvas.addEventListener('mouseup', function(event){
        mousePressed = false;
    });
    
    
    //OBSTÁCULOS
    const trapImage = new Image();
    trapImage.src ="./images/Obstaculos/trap miss_13.png"

    class obstaculo {
        constructor(){
            this.x = canvas_WIDTH + 500
            this.y = 280
            this.radius = 20;
            this.frameX = 0;
            this.frameY = 0;
            this.width = 411;
            this.height = 273;
        }
        update(){
            this.x = Math.floor(this.x - layer6.speed) //multiplicado pelo spedModifier do chao
            if (this.x < 0 - this.radius*2) {
                this.x = canvas_WIDTH + this.width
            }
            if (gameFrame % 5 == 0){
                if (this.frameX < 12){
                    this.frameX++
                } else {
                    this.frameX= 0
                }
            } 
            
            //colisao
            const dx= this.x - piggy.x;
            const dy = this.y - piggy.y;
            const distance = Math.sqrt(dx*dx + dy*dy)
            if (distance < this.radius + piggy.radius) 
            gameOver=true;
        }
        draw(){
            /*ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            ctx.fill();
            ctx.closePath();
             */  
            ctx.drawImage(trapImage, this.frameX*this.width, this.frameY*this.height, this.width, this.height, this.x - 35, this.y -40, this.width/6, this.height/6)
        
        }
    }


    const trap1 = new obstaculo();

    //pontuação
    function pontuacao(){
    tAtual = new Date().getTime();
    score = Math.floor((tAtual-tInicial)/1000);
    }
    
    //fase
    function dificuldade(){
        if (gameFrame % 260 ==0){
            gameSpeed += Math.random() * 3 //com aleatoriedade
        }
    }


    function instrucao(){
        if (gameFrame < 100) {
            clique.update()
            clique.draw()
        }
    } 
   
    
    function animate(){
        ctx.clearRect(0, 0, canvas_WIDTH, canvas_HEIGHT)

              
       //BACKGROUND PARALLAX
        gameBackgrounds.forEach(object => {
            object.update();
            object.draw();
        }); 
        
        //OBSTACULOS
       trap1.update()
       trap1.draw()
        
        //PLAYER
        piggy.update();
        piggy.draw();
       // angle++;
        
       
       //MENU CLICK   
       instrucao();

       //DIFICULDADE
       dificuldade();

       console.log(gameSpeed)
      
       gameFrame++;

       pontuacao();

       if (!gameOver){
        requestAnimationFrame(animate) 
        } else{
        ctx.font = "bold 16px Georgia";
        ctx.fillStyle = 'black';
        ctx.fillText('FIM DE JOGO', canvas.width/2-40, canvas.height/2);
        ctx.fillText('sua pontuação é de '+ score, canvas.width/2-60, canvas.height/2+20)
        } 
    }       
    
    
      animate();
    
    
}
    
    
    