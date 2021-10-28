



//##################################################################################################################
//###   GUI
//##################################################################################################################



class GUI {
    constructor(imageSrc, vX_layerModifier) {
        // Posi��o
        this.pX = 0;
        this.pY = 0;
        // Vetores
        this.vX_layersDefault = -1.5;
        this.vX_layerModifier = vX_layerModifier;
        this.vX = game.speed * (this.vX_layersDefault + this.vX_layerModifier * this.vX_layersDefault);
        // Dimens�es
        this.sW = 659; // Largura frame original
        this.sH = 320; // Altura frame original
        this.dW = 659; // Largura desenhada
        this.dH = 320; // Altura desenhada
        // Visualiza�ao
        this.image = new Image();
        this.image.src = imageSrc;
    }
    update() {
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
    draw() {
        ctx.drawImage(this.image, this.pX, this.pY, this.sW, this.sH);
        ctx.drawImage(this.image, this.pX + this.dW - 2, this.pY, this.sW, this.sH);
    }
}