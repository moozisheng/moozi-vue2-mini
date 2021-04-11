class Vue{
    constructor(opts){
        this.$options = opts;
        this.observe(opts.data);
        this._data = opts.data;
        this.compile();
    }
    // 观察数据
    observe(data){
        let keys = Object.keys(data);
        keys.forEach(key=>{
            let dep = new Dep();
            let value = data[key];
            Object.defineProperty(data,key,{
                configurable:true,
                enumerable:true,
                get(){
                    console.log("get");
                    // dep.addSub(new Watcher((newValue)=>{
                    //     console.log("触发了更新做更新",newValue);
                    // }))
                    if(Dep.target){
                        dep.addSub(Dep.target)
                    }
                    return value;
                },
                set(newValue){
                    // 修改之后做响应；
                    console.log("set",newValue);
                    // 发布
                    dep.notify(newValue);
                    // 触发compile编译；
                    value = newValue;
                }
            })
        })
    }

    compile(){
        let el = document.querySelector(this.$options.el);
        this.compileNodes(el);
    }
    compileNodes(el){
        let childNodes = el.childNodes;
        // console.log(childNodes);
        childNodes.forEach(node=>{
            if(node.nodeType===1){
                let attrs = node.attributes;
                console.log(attrs);
                [...attrs].forEach(attr=>{
                    let attrName = attr.name;
                    let attrValue = attr.value;
                    // console.log(attrName);
                    if(attrName==="v-model"){
                        node.value = this._data[attrValue];
                        node.addEventListener("input",e=>{
                            // console.log(e.target.value);
                            this._data[attrValue] = e.target.value;
                        })
                    }
                })

                // 元素节点
                if(node.childNodes.length>0){
                    this.compileNodes(node);
                }
            }else if(node.nodeType === 3){
                // 文本
                let textContent = node.textContent;
                // console.log(textContent);
                let reg = /\{\{\s*([^\{\}\s]+)\s*\}\}/g;
                if(reg.test(textContent)){
                    let $1 = RegExp.$1;
                    // console.log("有大胡子语法","("+$1+")");
                    // console.log(this._data[$1]);
                    node.textContent = node.textContent.replace(reg,this._data[$1]);
                    // 1生成watcher 2触发watcher 收集（触发get）
                    new Watcher(this._data,$1,(newValue)=>{
                        console.log("cb:",newValue);
                        let oldValue  = this._data[$1];
                        node.textContent = node.textContent.replace(oldValue,newValue);
                    })
                }
            }
        })
    }
}



// 收集器
class Dep{
    constructor(){
        this.subs = [];
    }
    addSub(sub){
        this.subs.push(sub);
    }
    notify(newValue){
        this.subs.forEach(sub=>{
            sub.update(newValue);
        })
    }
}

// 订阅者
class Watcher{
    constructor(data,key,cb){
        this.cb = cb;
        Dep.target = this;
        data[key]  //触发get  --->收集Watcher
        Dep.target = null;
    }
    update(newValue){
        this.cb(newValue);
    }
}
