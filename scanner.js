#!/usr/bin/env node

/*jshint node:true*/

// This script is for integration with Jenkins server
// steps: npm install static
// npm install optimist
// npm install js-beautify
// In the Jenkins server: create a task for batch execution
//mkdir %WORKSPACE%\reports;
//node E:\ScanJS_Repo\ScanJS_Local\scanjs\scanner.js -t E:\GitHub\MyRepo\bodgeit -o %WORKSPACE%\reports\report_%BUILD_NUMBER%

// publish the report using htmlpublisher...

var fs = require('fs');
var path = require('path');
var beautify = require('js-beautify').js_beautify;

var parser = require(__dirname + '/client/js/lib/acorn.js');
var ScanJS = require(__dirname + '/common/scan');

var signatures = JSON.parse(fs.readFileSync(__dirname + "/common/rules.json", "utf8"));

ScanJS.parser(parser);
ScanJS.loadRules(signatures);

var argv = require('optimist').usage('Usage: $node scan.js -t [path/to/app] -o [resultFile.json] -s [high/medium/all]').demand(['t']).argv;

var dive = function(dir, action) {
    if (typeof action !== 'function') {
        action = function(error, file) {
            console.log(">" + file)
        };
    }
    list = fs.readdirSync(dir);
    list.forEach(function(file) {
        var fullpath = dir + '/' + file;

        try {
            var stat = fs.statSync(fullpath);
            //if ( stat === argv[])
        } catch (e) {
            console.log("SKIPPING FILE: Could not stat " + fullpath);
        }
        if (stat && stat.isDirectory()) {
            dive(fullpath, action);
        } else {
            console.log("Scanning File: "+ fullpath);
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
    //if (fs.existsSync(name)) {
    //    console.log("Error:output file already exists (" + name + "). Supply a different name using: -o [filename]")
    //}
    var contentsInJSON = JSON.stringify(results, null, 2);
    var arrayOfObjects = JSON.parse(contentsInJSON);
    var items = [];
    var itemLine = [];
    var rules = [];
    for (var item in arrayOfObjects) {
        items.push(arrayOfObjects[item]);
        for (var rule in arrayOfObjects[item]) {
            rules.push(arrayOfObjects[item][rule]);
        }
    }
    //console.log('File: ' + rules[1].filename + '   Line:  '+ rules[1].line);
    //console.log('Issue:  '+ rules[1].rule.name + ' Description: '+ rules[1].rule.desc + '  Threat:  '+ rules[1].rule.threat);


    function createHtmlTableHIGH() {

        /*var table = '<html><title> ScanJS security test report</title><head><link rel="stylesheet" type="text/css" href="mystyle.css"></head><body><table id="issues">';*/
        var table = '<html><title> ScanJS security test report</title><body><table border="0" bgcolor="#a3a3a3" id="issues">';
        /*var table = '<html><title> ScanJS security test report</title><body><table style="font-family:"Trebuchet MS",Arial,Helvetica,sans-serif;border-collapse:collapse;width: 100%;" id="issues">';*/
        var cell1 = '<tr bgcolor="#000099"><strong><th><font face="verdana" color="white">File Name</font></th><th><font face="verdana" color="white">Line Number</font></th><th><font face="verdana" color="white">Rule Violation</font></th><th><font face="verdana" color="white">Issue Details & Secure Coding Guideline</font></th><th><font face="verdana" color="white">Severity </font></th></strong></tr>';
       /* var cell1 = '<tr><th style="border: 1px solid #ddd;text-align: left;padding: 8px;padding-top: 12px;padding-bottom: 12px;background-color: #4CAF50;color: white;">File Name</th><th style="border: 1px solid #ddd;text-align: left;padding: 8px;padding-top: 12px;padding-bottom: 12px;background-color: #4CAF50;color: white;">Line Number</th><th style="border: 1px solid #ddd;text-align: left;padding: 8px;padding-top: 12px;padding-bottom: 12px;background-color: #4CAF50;color: white;">Rule Violation</th><th style="border: 1px solid #ddd;text-align: left;padding: 8px;padding-top: 12px;padding-bottom: 12px;background-color: #4CAF50;color: white;">Issue Details & Secure Coding Guideline</th><th style="border: 1px solid #ddd;text-align: left;padding: 8px;padding-top: 12px;padding-bottom: 12px;background-color: #4CAF50;color: white;">Severity</th></tr>';*/
        var cellRow = '';
        /*  for(var i=0 ; i< rules.length; i++){
            table = table + '<tr>'+cell1;
            cell1 = '<td>'+ '<a href="'+rules[i].filename+'" ng-click="predicate = ' + rules[i].filename +'\'; reverse=!reverse">'
            + rules[i].filename+ '</a>'+ '</td>' + '<td>'+ '   Line:  '+ rules[i].line + '</td>' + '<td>'
            + rules[i].rule.name + '</td>' + '<td>'+ rules[i].rule.desc + '</td>' + '<td>'
            + rules[i].rule.threat+ '</td>' ; 
            table = table + '\n' + '</tr>'
          }*/
        table = table + cell1;
        //var counter = 1;
        for (var i = 0; i < rules.length; i++) {

            table = table + '<tr bgcolor="#e6ffe6">' + cellRow;
            if (rules[i].rule.threat === "HIGH" || rules[i].rule.threat === "high") {
                cellRow = '<td>' + '<a href="view-source:file:///' + rules[i].filename + '">' + rules[i].filename + '</a>' + '</td>' + '<td>' + '   Line:  ' + rules[i].line + '</td>' + '<td>' + rules[i].rule.name + '</td>' + '<td>' + rules[i].rule.desc + '</td>' + '<td>' + rules[i].rule.threat + '</td>';
                /*cellRow = '<td style="border: 1px solid #ddd;text-align: left;padding: 8px;">' + '<a href="view-source:file:///' + rules[i].filename + '">' + rules[i].filename + '</a>' + '</td>' + '<td style="border: 1px solid #ddd;text-align: left;padding: 8px;">' + '   Line:  ' + rules[i].line + '</td>' + '<td style="border: 1px solid #ddd;text-align: left;padding: 8px;">' + rules[i].rule.name + '</td>' + '<td style="border: 1px solid #ddd;text-align: left;padding: 8px;">' + rules[i].rule.desc + '</td>' + '<td style="border: 1px solid #ddd;text-align: left;padding: 8px;">' + rules[i].rule.threat + '</td>';*/
                table = table + '\n' + '</tr>';

            }
            //counter ++;
        }
        table = table + '\n' + '</table></body></html>';
        return table;
    }

    function createHtmlTableMEDIUM() {

      /*  var table = '<html><title> ScanJS security test report</title><head><link rel="stylesheet" type="text/css" href="mystyle.css"></head><body><table id="issues">';*/
       //var table = '<html><title> ScanJS security test report</title><body><table style="font-family:"Trebuchet MS",Arial,Helvetica,sans-serif;border-collapse:collapse;width: 100%;" id="issues">';
        /*var cell1 = '<tr><th>File Name</th><th>Line Number</th><th>Rule Violation</th><th>Issue Details & Secure Coding Guideline</th><th>Severity</th></tr>';*/
        //var cell1 = '<tr><th style="border: 1px solid #ddd;text-align: left;padding: 8px;padding-top: 12px;padding-bottom: 12px;background-color: #4CAF50;color: white;">File Name</th><th style="border: 1px solid #ddd;text-align: left;padding: 8px;padding-top: 12px;padding-bottom: 12px;background-color: #4CAF50;color: white;">Line Number</th><th style="border: 1px solid #ddd;text-align: left;padding: 8px;padding-top: 12px;padding-bottom: 12px;background-color: #4CAF50;color: white;">Rule Violation</th><th style="border: 1px solid #ddd;text-align: left;padding: 8px;padding-top: 12px;padding-bottom: 12px;background-color: #4CAF50;color: white;">Issue Details & Secure Coding Guideline</th><th style="border: 1px solid #ddd;text-align: left;padding: 8px;padding-top: 12px;padding-bottom: 12px;background-color: #4CAF50;color: white;">Severity</th></tr>';
        var table = '<html><title> ScanJS security test report</title><body><table border="1" bgcolor="#a3a3a3" id="issues">';
        var cell1 = '<tr bgcolor="#000099"><strong><th><font face="verdana" color="white">File Name</font></th><th><font face="verdana" color="white">Line Number</font></th><th><font face="verdana" color="white">Rule Violation</font></th><th><font face="verdana" color="white">Issue Details & Secure Coding Guideline</font></th><th><font face="verdana" color="white">Severity </font></th></strong></tr>';
        var cellRow = '';
        /*  for(var i=0 ; i< rules.length; i++){
            table = table + '<tr>'+cell1;
            cell1 = '<td>'+ '<a href="'+rules[i].filename+'" ng-click="predicate = ' + rules[i].filename +'\'; reverse=!reverse">'
            + rules[i].filename+ '</a>'+ '</td>' + '<td>'+ '   Line:  '+ rules[i].line + '</td>' + '<td>'
            + rules[i].rule.name + '</td>' + '<td>'+ rules[i].rule.desc + '</td>' + '<td>'
            + rules[i].rule.threat+ '</td>' ; 
            table = table + '\n' + '</tr>'
          }*/
        table = table + cell1;
        //var counter = 1;
        for (var i = 0; i < rules.length; i++) {

            table = table + '<tr bgcolor="#e6ffe6">' + cellRow
           /* table = table + '<tr style="background-color: #f2f2f2">' + cellRow;*/
            if (rules[i].rule.threat === "HIGH" || rules[i].rule.threat === "high" || rules[i].rule.threat === "medium" || rules[i].rule.threat === "MEDIUM") {
                /*cellRow = '<td>' + '<a href="view-source:file:///' + rules[i].filename + '" ng-click="predicate = ' + rules[i].filename + '\'; reverse=!reverse">' + rules[i].filename + '</a>' + '</td>' + '<td>' + '   Line:  ' + rules[i].line + '</td>' + '<td>' + rules[i].rule.name + '</td>' + '<td>' + rules[i].rule.desc + '</td>' + '<td>' + rules[i].rule.threat + '</td>';*/
                /*cellRow = '<td style="border: 1px solid #ddd;text-align: left;padding: 8px;">' + '<a href="view-source:file:///' + rules[i].filename + '">' + rules[i].filename + '</a>' + '</td>' + '<td style="border: 1px solid #ddd;text-align: left;padding: 8px;">' + '   Line:  ' + rules[i].line + '</td>' + '<td style="border: 1px solid #ddd;text-align: left;padding: 8px;">' + rules[i].rule.name + '</td>' + '<td style="border: 1px solid #ddd;text-align: left;padding: 8px;">' + rules[i].rule.desc + '</td>' + '<td style="border: 1px solid #ddd;text-align: left;padding: 8px;">' + rules[i].rule.threat + '</td>';*/
                cellRow = '<td>' + '<a href="view-source:file:///' + rules[i].filename + '">' + rules[i].filename + '</a>' + '</td>' + '<td>' + '   Line:  ' + rules[i].line + '</td>' + '<td>' + rules[i].rule.name + '</td>' + '<td>' + rules[i].rule.desc + '</td>' + '<td>' + rules[i].rule.threat + '</td>';
                table = table + '\n' + '</tr>';
                //counter ++;
            }
        }
        table = table + '\n' + '</table></body></html>';
        return table;
    }

    function createHtmlTableALL() {

        /*var table = '<html><title> ScanJS security test report</title><head></head><body><table id="issues">';*/
       // var table = '<html><title> ScanJS security test report</title><body><table style="font-family:"Trebuchet MS",Arial,Helvetica,sans-serif;border-collapse:collapse;width: 100%;" id="issues">';
        var table = '<html><title> ScanJS security test report</title><body><table border="1" bgcolor="#a3a3a3" id="issues">';
        var cell1 = '<tr bgcolor="#000099"><strong><th><font face="verdana" color="white">SN</font></th><th><font face="verdana" color="white">File Name</font></th><th><font face="verdana" color="white">Line Number</font></th><th><font face="verdana" color="white">Rule Violation</font></th><th><font face="verdana" color="white">Issue Details & Secure Coding Guideline</font></th><th><font face="verdana" color="white">Severity</font></th></tr>';

        var cellRow = '';
        /*  for(var i=0 ; i< rules.length; i++){
            table = table + '<tr>'+cell1;
            cell1 = '<td>'+ '<a href="'+rules[i].filename+'" ng-click="predicate = ' + rules[i].filename +'\'; reverse=!reverse">'
            + rules[i].filename+ '</a>'+ '</td>' + '<td>'+ '   Line:  '+ rules[i].line + '</td>' + '<td>'
            + rules[i].rule.name + '</td>' + '<td>'+ rules[i].rule.desc + '</td>' + '<td>'
            + rules[i].rule.threat+ '</td>' ; 
            table = table + '\n' + '</tr>'
          }*/
        table = table + cell1;
        for (var i = 0; i < rules.length; i++) {
            var counter = i + 1;
            table = table + '<tr bgcolor="#e6ffe6">' + cellRow
            cellRow = '<td>' + counter + '</td>' + '<td>' + '<a href="view-source:file:///' + rules[i].filename + '"' + rules[i].filename + '</a>' + '</td>' + '<td>' + '   Line:  ' + rules[i].line + '</td>' + '<td>' + rules[i].rule.name + '</td>' + '<td>' + rules[i].rule.desc + '</td>' + '<td>' + rules[i].rule.threat + '</td>';
            table = table + '\n' + '</tr>'
        }
        table = table + '\n' + '</table></body></html>';
        return table;
    }


    var table = '';
    if (argv.s === 'HIGH' || argv.s === 'high') {
        table = createHtmlTableHIGH();
    } else if (argv.s === 'medium' || argv.s === 'MEDIUM') {
        table = createHtmlTableMEDIUM();
    } else if (argv.s === 'all' || argv.s === 'ALL' || argv.s === undefined) {
        table = createHtmlTableALL();
    }

    fs.writeFile(name, table, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("The scan results were saved to " + name);
        }
    });
};

if (typeof process != 'undefined' && process.argv[2]) {
    results = {};
    reportname = argv.o ? argv.o : 'scanresults';
    //reportdir = "report" + "_files";
    if (fs.existsSync(reportname)) {
        console.log("Error:output file or dir already exists (" + reportname + "). Supply a different name using: -o [filename]")

    } else {
       // fs.mkdirSync(reportdir);
        dive(argv.t, function(file, fullpath) {

            /*var exclude1 = path.normalize(argv.e1);
            var exclude2 = path.normalize(argv.e2);
            var exclude2 = path.normalize(argv.e3);
*/
            var ext = path.extname(file.toString());

            //var directoryNameOfScannedFile = path.dirname(file.toString());

            if (ext == '.js' ){ //&& directoryNameOfScannedFile !== exclude1 && directoryNameOfScannedFile !== exclude2 && directoryNameOfScannedFile !== exclude3) {
                var content = fs.readFileSync(fullpath, 'utf8');
                //beautify source so result snippet is meaningful
                var content = beautify(content, {
                    indent_size: 2
                });

                try{
                    var ast = parser.parse(content, {
                        locations: true
                    });

                    var scanresult = ScanJS.scan(ast, fullpath);
                    if (scanresult.type == 'error') {
                        console.log("SKIPPING FILE: Error in " + fullpath + ", at Line " + scanresult.error.loc.line + ", Column " + scanresult.error.loc.column + ": " + scanresult.error.message);
                    }
                    results[fullpath] = scanresult;
                }catch(e){
                    console.log("There is a syntax error in file that is being scanned");
                }
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