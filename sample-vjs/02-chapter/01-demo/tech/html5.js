/**
 * 中间件
 */

class Html5 extends Tech {
  constructor(options) {
    super(options);

    this.options = options;
    
    this.el_ = options.tag; // video标签
  }

  play() {
    this.el_.play();
  }

  pause() {
    this.el_.pause();
  }

  paused() {
    return this.el_.paused;
  }
}

/**
 *  如果不是用h5播放器来播放，就删除这个标签
 */
Html5.disposeMediaElement = function (el) {
  
}

Tech.registerTech('Html5', Html5);
