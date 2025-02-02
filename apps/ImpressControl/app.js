g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
g.setFont("6x8",2);
g.setFontAlign(-1,-1);
g.setColor(1);
g.drawString('Connecting...',10,60,true);
g.drawString(NRF.getAddress(true),5,90,true);

var start_time;
var slide_index;
var slide_tot;
var paused;
var bootTimer = 0;
var secondInterval;
var reloadInterval;

function draw(){
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  g.setColor(1);

  if(slide_index!=undefined && slide_tot){ // slide index
    g.setFont("6x8:7");
    let nb = g.stringWidth(slide_index+1);
    g.setFont("6x8:2");
    let tot = g.stringWidth('/'+slide_tot);
    let margin = (176-tot-nb)/2;
    g.setFontAlign(1,0);
    g.drawString('/'+slide_tot,176-margin,90);
    g.setFont("6x8:7");
    g.setFontAlign(-1,0);
    g.drawString(slide_index+1 ,margin,80);
  }

  // draw current time
  let d = new Date();
  let clock = require("locale").time(d);
  g.setFont("6x8:2");
  g.setFontAlign(-1,0);
  g.drawString(clock ,5,35);

  if(start_time){
    let clock = new Date(d-start_time);
    clock.setHours(clock.getHours()-1);
    clock = require("locale").time(clock);
    g.setFont("6x8:2");
    g.setFontAlign(0,0);
    g.drawString(clock ,88,160);
  }

  // draw if show is paused
  if(paused){
    g.setFont("6x8:3");
    g.setFontAlign(0,0);
    g.setColor(0.5,0,5,0.5);
    g.drawString('paused' ,88,130);
  }
}

function get_data(data){
  data = data.split(':');
  namespace = data[0];
  data = data[1];
  switch (namespace){
    case('Start'):
      start_time = new Date(parseFloat(data)*1000);
      break;
    case 'Pause':
      paused = data == 'paused';
      break;
    case 'Slide':
      slide_index = parseInt(data);
      break;
    case 'SlideTot':
      slide_tot = parseInt(data);
      break;
  }
  draw();
}

NRF.on('connect', function() {
  draw();
  secondInterval = setInterval(draw, 1000);

  // disable app reload
  Bangle.setOptions({btnLoadTimeout:0}); 
  reloadInterval = setInterval(function() {
    if (BTN.read()) bootTimer++;
    else bootTimer=0;
    if (bootTimer<5) E.kickWatchdog();
    else Bangle.showClock();
  }, 2000); // return to clock after 10 sec
  
  Bangle.setUI({
    mode:'custom',
    btn:()=>{
      Bluetooth.print('NextSlide');
    }
  });
});

NRF.on('disconnect', function(){
  start_time=undefined;
  slide_index=undefined;
  slide_tot=undefined;
  paused=undefined;
  
  clearInterval(secondInterval);
  clearInterval(reloadInterval);
  Bangle.setOptions({btnLoadTimeout:1500}); 
  
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  g.setFont("6x8",2);
  g.setFontAlign(-1,-1);
  g.setColor(1);
  g.drawString('Connecting...',10,60,true);
  g.drawString(NRF.getAddress(true),5,90,true);
});
