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
          //   console.log("--replaceText--", node.textContent);
        }
        replaceText();
      }

      if (node.nodeType === 1) {
        const attributes = node.attributes;
        [...attributes].forEach((attr) => {
          const { name, value: exp } = attr;
          if (name.indexOf("v-") >= 0) {
            console.log(name, exp);

            let val = vm
            exp.split('.').forEach(key => {
                val = val[key]
            })
            node.value = val
            
            new Watcher(vm, exp, function(nv) {
                node.value = nv
            })

            node.addEventListener('input', e => {
                console.log('input--', e.target.value);
                vm[exp] = e.target.value
            })
          }
        });
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
  let dep = new Dep(JSON.stringify(obj));
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

class Dep {
  constructor(name) {
    this.name = name;
    this.subs = [];
  }
}

Dep.prototype.addSub = function (sub) {
  this.subs.push(sub);
};
Dep.prototype.notify = function () {
  this.subs.forEach((sub) => sub.update());
};

function Watcher(vm, exp, fn) {
  this.vm = vm;
  this.exp = exp;
  this.fn = fn;
  // Dep 的全局对象, 每次收集依赖时会指向一个 watcher 实例, 然后推入 subs
  Dep.target = this;

  // 触发 get
  let arr = exp.split(".");
  let val = vm;
  arr.forEach((key) => {
    val = val[key];
  });
  // 将 Dep.target 设置为 null, 每次触发 get 时会做一个判断, 如果 target 存在才会推入
  Dep.target = null;
}
Watcher.prototype.update = function () {
  let val = this.vm;
  this.exp.split(".").forEach((key) => {
    val = val[key];
  });
  this.fn(val);
};
