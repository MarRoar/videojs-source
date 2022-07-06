/**
 * video
 */

class Video {
  constructor() {
    console.log(" video ");
  }
}


/**
 * 全局函数
 */
function videojs(id, options, ready) {

  var el = document.getElementById(id);
  
  var player = new Player(el, options, ready);

  return player
}
