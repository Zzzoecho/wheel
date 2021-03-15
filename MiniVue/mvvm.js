function Mvvm(options = {}) {
    this.$options = options;
    this.init = true;
    let data = (this._data = options.data);
  
    Observe(data);
  
    // this -> this._data
    for (const key in data) {
      Object.defineProperty(this, key, {
        configurable: true,
        get() {
          return this._data[key];
        },
        set(nv) {
          this._data[key] = nv;
        },
      });
    }
  
    Compile(options.el, this);
  }
  
  function Compile(el, vm) {
    const $el = document.querySelector(el);
    let fragment = document.createDocumentFragment();
    Array.from($el.childNodes).forEach((node) => {
      fragment.appendChild(node);
    });
  
    function replace(frag) {
      Array.from(frag.childNodes).forEach((node) => {
        let text = node.textContent;
        const reg = /\{\{(.*?)\}\}/g;
  
        if (node.nodeType === 3 && reg.test(node.textContent)) {
          function replaceText() {
            node.textContent = text.replace(reg, (matched, placeholder) => {
              vm.init && new Watcher(vm, placeholder, replaceText);
              return placeholder.split(".").reduce((val, key) => {
                return val[key];
              }, vm);
            });
            console.log("--replaceText--", node.textContent);
          }
          replaceText();
        }
        if (node.childNodes && node.childNodes.length) {
          replace(node);
        }
      });
    }
  
    replace(fragment);
    $el.appendChild(fragment);
    vm.init = false;
  }
  
  function Observe(obj) {
    if (!obj || typeof obj !== "object") return;
    let dep = new Dep();
    for (const key in obj) {
      let val = obj[key];
      Object.defineProperty(obj, key, {
        configurable: true,
        get() {
          console.log("---get---", key);
          Dep.target && dep.addSub(Dep.target);
          return val;
        },
        set(newVal) {
          if (val === newVal) return;
          console.log("---set---", key, newVal);
  
          val = newVal;
          Observe(newVal);
          dep.notify();
        },
      });
      Observe(val);
    }
  }
  
  function Dep() {
    this.subs = [];
  }
  
  Dep.prototype.addSub = function (sub) {
    this.subs.push(sub);
  };
  Dep.prototype.notify = function () {
    console.log("Dep notify", this.subs);
    this.subs.forEach((sub) => sub.update());
  };
  
  function Watcher(vm, exp, fn) {
    this.vm = vm;
    this.exp = exp;
    this.fn = fn;
    Dep.target = this;
  
    // 触发 get
    let arr = exp.split(".");
    let val = vm;
    arr.forEach((key) => {
      val = val[key];
    });
    Dep.target = null;
  }
  Watcher.prototype.update = function () {
    let val = this.vm;
    this.exp.split(".").forEach((key) => {
      val = val[key];
    });
    console.log("update", this.exp, val);
    this.fn(val);
  };
  