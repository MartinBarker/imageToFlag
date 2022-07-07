const myArgs = process.argv.slice(2)
var fs = require('fs'),
request = require('request');
const util = require('util');
const exec = util.promisify(require('child_process').exec);


//start

var imgUrl = myArgs[0]
console.log('imgUrl=',imgUrl)
makeFlag(imgUrl)

async function makeFlag(url){
    //download img
    await download(url, 'src.png', function(){
        console.log('done downloading image');
        //get colors
        var Vibrant = require('node-vibrant')
        Vibrant.from('src.png').getPalette()
        .then((palette) => {
            console.log(palette.length)
            let hexColors = []
            Object.keys(palette).forEach(key => {
                var rgb = palette[key]['_rgb']
                console.log(rgb);
                var hex = ConvertRGBtoHex(rgb[0],rgb[1],rgb[2]) 
                console.log(hex)
                hexColors.push(hex)
              });

              runImageMagikCmd(hexColors);


        })
        //make flag
    });


}

async function runImageMagikCmd(colors) {
    try {
        console.log('runImageMagikCmd colors=',colors)
        //create cmd
        let colorsStr = ``
        for(var x = 0; x < colors.length; x++){
            let color = colors[x]
            colorsStr=`${colorsStr} xc:${color}`
        }
        let cmd = `convert ${colorsStr.trim()} -append -scale 1800x900! +repage flag.png`
        console.log(cmd)

        //run it
        const { stdout, stderr } = await exec(cmd);
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
    }catch (err){
       console.error(err);
    };
  };
 

function ColorToHex(color) {
    var hexadecimal = color.toString(16);
    return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
  }
  
  function ConvertRGBtoHex(red, green, blue) {
    return "#" + ColorToHex(red) + ColorToHex(green) + ColorToHex(blue);
  }

function download(uri, filename, callback){
    request.head(uri, function(err, res, body){
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);
  
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  };