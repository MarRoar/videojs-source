/**
 * 中间件
 */

class Flash extends Tech {
  constructor(options) {
    super(options);

   console.log('options = ', options);

    this.el_ = options.el_;

    var oDiv = document.createElement('div');
    oDiv.innerHTML = 'flash.js 窗口';
    this.el_.appendChild(oDiv);
  }

  play() {
    console.log('Flash 里面控制的播放事件');
  }

  pause() {
    console.log('Flash 里面控制的暂停事件');
  }

  paused() {
    console.log('Flash 里面播放状态');
  }
}

Tech.registerTech('Flash', Flash);
