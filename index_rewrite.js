const fs = require('fs-std')
const crypto = require('crypto-browserify')
const hash = crypto.createHash('sha256')
const path = require('path');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on("close", function() {
    process.exit(0);
 });

 function sleep(ms) {
   // return new Promise(resolve => setTimeout(resolve, ms));
 }



var walkSync = function(dir, filelist) {
    
    process.stdout.write('Listing files.. :' + dir + ' ');
    process.stdout.cursorTo(0);
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        }
        else {
            filelist.push(path.join(dir, file));
        }
    });
    return filelist;
};


var array = []
var hashedfiles = []

if (process.argv.slice(2)[0] == '--help') {
    console.log(`
File hash checker v1.0 by ThatNerd 
Running this program without any parameteres will check all files (including subdirectories) and compare all of them against a known good hash. \n
--generate - Will generate a new config that the program will test against
    `)
    process.exit()
}

console.log('File hash checker v1.0 by ThatNerd')
function checkperm(){
try {
    fs.writeFileSync('test.tmp','abc')
    if (fs.readFileSync('test.tmp') != 'abc') {
        throw('File write error')
    }
    fs.unlinkSync('test.tmp')
    run()
} catch (error) {
    console.log('ERROR: Unable to write. (please try again with administrator permissions.)')
    console.log('Program halted. Press close or CTRL+C to close this window.')
    console.log(error)
}
}
checkperm()

function run(){
try {
   var config = JSON.parse(fs.readFileSync('config.json')) || {ignore: [path.basename(__filename),"config.json"], correcthash: ""}
} catch (error) {
    config = {ignore: [path.basename(__filename),"config.json"], correcthash: ""}
}
console.log('Listing files..')
walkSync('./',array)
var filtered = array.filter(function(value, index, arr){ 
   return !config.ignore.includes(value)
});


process.stdout.write('\n');
process.stdout.cursorTo(0);

console.log('Hashing with SHA256...')
file = {}
for (i = 0; i < filtered.length; i++) {
    process.stdout.write('Hashing: ' + filtered[i] + ' ');
    process.stdout.cursorTo(0);
    hash.update(fs.readFileSync(filtered[i]))
    hashedfiles.push(filtered[i] + hash.copy().digest('base64'))
}

process.stdout.write('\n');
hash.update(Buffer.from(hashedfiles))
hashedresult = hash.digest('base64')

console.log('Result: ' + hashedresult)


if (process.argv.slice(2)[0] == '--generate') {
    config = {ignore: [], correcthash: ""}
    config.ignore.push(path.basename(__filename))
    config.ignore.push('config.json')
    config.correcthash = hashedresult
    fs.writeFileSync('config.json',JSON.stringify(config))
    console.log('Config generated.')
    console.log('Press CTRL+C to exit this window.')
} else {
   console.log('Correct hash: ' + config.correcthash)
   if (config.correcthash == hashedresult) {
       console.log('Congratulations, all of your files have been checked and is consistent with what ThatNerd sent you.')
       console.log('Press CTRL+C to exit this window.')
   } else {
       console.log('Hmm, there is an inconsistency with one of the files, remember, adding or removing files will cause this.')
       console.log('Press CTRL+C to exit this window.')
   }
}

}
