#!/usr/bin/env node
/*jshint node:true*/

// This script is for integration with Jenkins server
// steps: npm install static
// npm install optimist
// npm install beautify-js
// npm install beautifyjs
// In the Jenkins server: create a task for batch execution
//mkdir %WORKSPACE%\reports;
//node E:\ScanJS_Repo\ScanJS_Local\scanjs\scanner.js -t E:\GitHub\MyRepo\bodgeit -o %WORKSPACE%\reports\report_%BUILD_NUMBER%

// publish the report using htmlpublisher...

var fs = require('fs');
var path = require('path');
var beautify = require('js-beautify').js_beautify;

var parser = require(__dirname+ '/client/js/lib/acorn.js');
var ScanJS = require(__dirname + '/common/scan');

var signatures = JSON.parse(fs.readFileSync(__dirname + "/common/rules.json", "utf8"));

ScanJS.parser(parser);
ScanJS.loadRules(signatures);

var argv = require('optimist').usage('Usage: $node scan.js -t [path/to/app] -o [resultFile.json]').demand(['t']).argv;

var dive = function(dir, action) {
  if( typeof action !== 'function') {
    action = function(error, file) {
      console.log(">" + file)
    };
  }
  list = fs.readdirSync(dir);
  list.forEach(function(file) {
    var fullpath = dir + '/' + file;
    try {
      var stat = fs.statSync(fullpath);
    } catch(e) {
      console.log("SKIPPING FILE: Could not stat " + fullpath);
    }
    if(stat && stat.isDirectory()) {
      dive(fullpath, action);
    } else {
      action(file, fullpath);
    }
  });
};

// working JSON formatted function
/*var writeReport = function(results, name) {
 if(fs.existsSync(name)) {
    console.log("Error:output file already exists (" + name + "). Supply a different name using: -o [filename]")
  }
 //fs.writeFile(name, JSON.stringify(results, null, 2), function(err) {
  fs.writeFile(name, JSON.stringify(results), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("The scan results were saved to " + name);
    }
  });
};*/

var writeReport = function(results, name) {
if(fs.existsSync(name)) {
 console.log("Error:output file already exists (" + name + "). Supply a different name using: -o [filename]")
}
var contentsInJSON = JSON.stringify(results, null, 2);
var arrayOfObjects = JSON.parse(contentsInJSON);
var items = [];
var itemLine = [];
var rules = [];
for (var item in arrayOfObjects){
  items.push(arrayOfObjects[item]);
  for (var rule in arrayOfObjects[item]){
    rules.push(arrayOfObjects[item][rule]);
  }
}
//console.log('File: ' + rules[1].filename + '   Line:  '+ rules[1].line);
//console.log('Issue:  '+ rules[1].rule.name + ' Description: '+ rules[1].rule.desc + '  Threat:  '+ rules[1].rule.threat);
function createHtmlTable(){

  var table = '<html><title> ScanJS security test report</title><table border="1" style="width:100%">'; 
  var cell1;

  for(var i=0 ; i< rules.length; i++){
    table = table + '\n'+ '<tr>'+cell1;
    cell1 = '<td>'+'file: '+ '<a href="file:///' + rules[i].filename +'"> '+ rules[i].filename+ '</a>'+ '</td>' + '<td>'+ '   line:  '+ rules[i].line + '</td>' + '<td>'+'Issue:  '+ rules[i].rule.name + '</td>' + '<td>'+' Description: '+ rules[i].rule.desc + '</td>' + '<td>'+'  Threat:  '+ rules[i].rule.threat+ '</td>' ; 
    table = table + '\n' + '</tr>'
  }
  table = table+ '\n'+ '</table></html>';
  return table;
}

var table = createHtmlTable();
  fs.writeFile(name, table, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("The scan results were saved to " + name);
    }
  });
};

if( typeof process != 'undefined' && process.argv[2]) {
  results = {};
  reportname = argv.o ? argv.o : 'scanresults';
  reportdir = reportname + "_files";
  if(fs.existsSync(reportname) || fs.existsSync(reportdir)) {
    console.log("Error:output file or dir already exists (" + reportname + "). Supply a different name using: -o [filename]")

  } 
 else {
    fs.mkdirSync(reportdir);
    dive(argv.t, function(file, fullpath) {
      var ext = path.extname(file.toString());

      if(ext == '.js') {
        var content = fs.readFileSync(fullpath, 'utf8');
        //beautify source so result snippet is meaningful
        var content = beautify(content, { indent_size: 2 });

        var ast = parser.parse(content, { locations: true });

        var scanresult = ScanJS.scan(ast, fullpath);
        if (scanresult.type == 'error') {
          console.log("SKIPPING FILE: Error in "+ fullpath+", at Line "+ scanresult.error.loc.line +", Column "+scanresult.error.loc.column+ ": " + scanresult.error.message);
        }
        results[fullpath] = scanresult;
      }
    });
    // Flatten report file to remove files with no findings and tests with no results (i.e. empty arr)
    // TODO: Don't even store empty unless --overly-verbose or so..
    for (var testedFile in results) {
      for (var testCase in results[testedFile]) {
        if (results[testedFile][testCase].length == 0) {
          delete(results[testedFile][testCase]);
        }
      }
      if (Object.keys(results[testedFile]).length == 0) {
        delete(results[testedFile]);
      }
    }
    writeReport(results, reportname + '.html');
  }
} else {
  console.log('usage: $ node scan.js path/to/app ')
}
