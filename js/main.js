// Código desenvolvido integralmente pela equipe
// Não há apoio de frameworks, apenas JavaScript puro, como solicitado na atividade


window.onload=function(){

    function include(file) {
      
        var script  = document.createElement('script');
        script.src  = file;
        script.type = 'text/javascript';
        script.defer = true;
        
        document.getElementsByTagName('head').item(0).appendChild(script);
    }
    
    const vid = document.getElementById("v_intro");
    //vid.addEventListener('ended',myHandler,false);
    function myHandler(e) {
        include('./js/start_game.js');
        vid.hidden = true;
    }
    myHandler(1);
}


    
    
    