/**
 * 播放组件相关
 */

class Player {
  constructor(tag, options, ready) {

    this.tech_ = '';

    this.tag = tag;
    this.el_ = this.createEl();

    options.tag = this.tag;
    options.el_ = this.el_;

    this.options = options;
    this.loadTech();

    this.initChildren();

    ready && ready();
  }

  createEl() {
    var el = document.createElement('div');
    el.setAttribute("class", 'video-js');
    document.body.insertBefore(el, this.tag);

    el.appendChild(this.tag);

    return el;
  }

  initChildren() {
    this.createPlayButton();
  }

  createPlayButton() {
    var _this = this;
    var oDiv = document.createElement('div');

    var oButton = document.createElement('button');
    oButton.innerHTML = "播放";

    oDiv.appendChild(oButton);
    this.el_.appendChild(oDiv);

    this.playBtn = oButton;

    // 点击播放事件
    oButton.addEventListener('click', function () {

      _this.playToggle();
    })
  }

  // 定义一个按钮
  // 来控制播放
  playToggle() {

    var paused = this.paused();

    if(paused) {
      this.handleTechPlay_();
    } else {
      this.handleTechPause_();
    }
  }

  loadTech() {

    var tag = this.tag;
    var techOrder = this.options.techOrder;

    if(techOrder != 'Html5') {
      this.el_.removeChild(tag);
    }

    var techClass = Tech.getTech(techOrder);

    this.tech_ = new techClass(this.options);
  }

  handleTechPlay_() {
    this.playBtn.innerHTML = '暂停';

    this.techCall_('play');
  }

  handleTechPause_() {
    this.playBtn.innerHTML = '播放';

    this.techCall_('pause');
  }

  paused() {
    return (this.techGet_('paused') === false) ? false : true;
  }

  techCall_(method, arg) {
    this.tech_[method](arg);
  }

  techGet_(method) {
    return this.tech_[method]();
  }
}