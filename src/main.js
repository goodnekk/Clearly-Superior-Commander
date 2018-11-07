const m = require("mithril")
const fs = require('fs')
const exec = require('child_process').exec
const shell = require('shelljs')


let selected = 0
let stack = ["home", "beheerder"]
let posstack = [0,0]
let files = []
let cons = []

function update(){
    let location = stack.reduce((acc, red)=>{
        return acc+red+"/"
    },"/")
    fs.readdir(location, (err, f) => {
      files = f.filter((f)=>f[0]!==".").map(file => {
          return {
              path: location+file,
              name: file,
              directory: fs.lstatSync(location+file).isDirectory()
          }
      }).sort((a,b)=>{
          if(a.directory == b.directory){
              if(a.name < b.name) { return -1; }
              if(a.name > b.name) { return 1; }
          } else {
              if(a.directory) return -1;
              return 1;
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
        if(selected<files.length-1){
            selected++
        }
    }

    if(e.key==="ArrowUp"){
        e.preventDefault()
        if(selected > 0){
            selected--
        }
    }

    if(e.key==="ArrowRight"){
        if(files[selected].directory){
            stack.push(files[selected].name)
            posstack.push(selected)
            selected = 0
            update()
        } else {
            console.log("xdg-open "+files[selected].path);
            exec("xdg-open '"+files[selected].path+"'", function(err, data) {
                console.log(err)
                console.log(data.toString());
            });

        }
    }

    if(e.key==="ArrowLeft"){
        if(stack.length>0){
            stack.pop()
            selected = posstack.pop()
        }

        update()
    }

    //if(e.key==="Enter"){
    //    let location = stack.reduce((acc, red)=>{
    //        return acc+red+"/"
    //    },"/")
    //    exec("atom .", {
    //        cwd: location
    //    }, function(err, data) {
    //        console.log(err)
    //        console.log(data.toString());
    //    })
    //}
    console.log(e);
    m.redraw();
}, false);


var App = function(){
    return {
        view: function(vnode) {
            return m(".app", [
                m(".position",stack.map(f=>m(".position__segment",f))),
                m(".filelist",files.map((f, i)=>{
                    return m(".file", {
                        class: (selected === i ? "--selected ": "") + (f.directory ? "--directory" : "")
                    },[
                        m("i.material-icons",f.directory ? "folder" : "insert_drive_file"),
                        m(".file__name",f.name),
                    ])
                })),
                m(".console", [
                    cons.map(line=>m(".console__line",line)),
                    m("input.commandline",{
                        onkeypress: (e)=>{
                            if(e.key==="Enter"){
                                let location = stack.reduce((acc, red)=>{
                                    return acc+red+"/"
                                },"/")
                                cons.push(e.target.value)
                                shell.cd(location)
                                shell.exec(e.target.value, function(code, stdout, stderr) {
                                    cons.push(stdout)
                                    m.redraw()
                                    console.log('Exit code:', code);
                                    console.log('Program output:', stdout);
                                    console.log('Program stderr:', stderr);
                                });
                                e.target.value = ""
                            }
                        }
                    })
                ]),

            ])

        }
    };
};

m.mount(document.getElementById("app"), App);
