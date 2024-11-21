const five =require('johnny-five');
const board=new five.Board({
    port:"COM4"
})

board.on("ready",function(){
    console.log("on ready")
})