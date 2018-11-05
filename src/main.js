const m = require("mithril")
const fs = require('fs');



let selected = 0
let stack = ["home", "beheerder"]
let posstack = [0,0]
let files = []

function update(){
    let location = stack.reduce((acc, red)=>{
        return acc+red+"/"
    },"/")
    fs.readdir(location, (err, f) => {
      files = f.filter((f)=>f[0]!==".").map(file => {
          return {
              name: file,
              directory: fs.lstatSync(location+file).isDirectory()
          }
      })
      console.log(files);
      m.redraw()
    })
}

update()

document.addEventListener("keydown", function(e){

    if(e.key==="ArrowDown"){
        e.preventDefault()
        if(selected<=files.length){
            selected++
        }
    }

    if(e.key==="ArrowUp"){
        e.preventDefault()
        if(selected>=0){
            selected--
        }
    }

    if(e.key==="ArrowRight"){
        stack.push(files[selected].name)
        posstack.push(selected)
        selected = 0
        update()
    }

    if(e.key==="ArrowLeft"){
        if(stack.length>0){
            stack.pop()
            selected = posstack.pop()    
        }

        update()
    }
    console.log(e);
    m.redraw();
}, false);


var App = function(){
    return {
        view: function(vnode) {
            return files.map((f, i)=>{
                return m(".file", {
                    class: selected === i ? "--selected": ""
                },[
                    m(".file__name",f.name),
                    m(".file__type",f.directory ? "Directory" : "File"),
                ])
            })
        }
    };
};

m.mount(document.getElementById("app"), App);
