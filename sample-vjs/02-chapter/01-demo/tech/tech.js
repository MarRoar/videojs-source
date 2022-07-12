/**
 * 中间件
 */

class Tech {
  constructor(tag) {
    // this.el_ = tag; // video标签
  }

  // play() {
  //   this.el_.play();
  // }

  // pause() {
  //   this.el_.pause();
  // }

  // paused() {
  //   return this.el_.paused;
  // }

  static registerTech(name, tech) {

    if(!Tech.techs_) {
      Tech.techs_ = {};
    }

    Tech.techs_[name] = tech;
  }

  static getTech(name) {
    return Tech.techs_[name];
  }
}

/**
 *  如果不是用h5播放器来播放，就删除这个标签
 */
Tech.disposeMediaElement = function (el) {
  
}