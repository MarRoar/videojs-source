
class Component {
  constructor() {

    this.el_ = this.createEl();
    
    evented(this, {eventBusKey: this.el_ ? 'el_' : null});
  }

  createEl() {
     return document.createElement('div');
  }

  blur() {
    this.el_.blur();
  }
}
