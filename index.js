const crypto = require('crypto')
const hash = crypto.createHash('sha256')
const path = require('path');
const fs = require('fs')
try {
    var config = JSON.parse(fs.readFileSync('config.json')) || {ignore: [path.basename(__filename),"config.json"], correcthash: ""}
} catch {

    config = {ignore: [path.basename(__filename),"config.json"], correcthash: ""}
}

console.log('File hash checker v1.0 by ThatNerd')

var walkSync = function(dir, filelist) {
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

console.log('Listing files..')
walkSync('./',array)
var filtered = array.filter(function(value, index, arr){ 
   return !config.ignore.includes(value)
});

console.log('Hashing with SHA256...')
for (i = 0; i < filtered.length; i++) {
    hash.update(fs.readFileSync(filtered[i]))
    hashedfiles.push(hash.copy().digest('base64'))
}

hash.update(Buffer.from(hashedfiles))
hashedresult = hash.digest('base64')

console.log('Result: ' + hashedresult)


if (process.argv.slice(2)[0] == '--generate') {
    var config = {ignore: [], correcthash: ""}
    config.ignore.push(path.basename(__filename))
    config.ignore.push('config.json')
    config.correcthash = hashedresult
    fs.writeFileSync('config.json',JSON.stringify(config))
    console.log('Config generated.')
} else {
   console.log('Correct hash: ' + config.correcthash)
   if (config.correcthash == hashedresult) {
       console.log('Congratulations, all of your files have been checked and is consistent with what ThatNerd sent you.')
   } else {
       console.log('Hmm, there is an inconsistency with one of the files, remember, adding or removing files will cause this.')
   }
}

