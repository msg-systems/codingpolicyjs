/*
 **  codingpolicyjs -- JavaScript coding policy engine for architectonical rules
 **  Design and Development by msg Applied Technology Research
 **  Copyright (c) 2016 msg systems ag (http://www.msg-systems.com/)
 **
 **  Permission is hereby granted, free of charge, to any person obtaining
 **  a copy of this software and associated documentation files (the
 **  "Software"), to deal in the Software without restriction, including
 **  without limitation the rights to use, copy, modify, merge, publish,
 **  distribute, sublicense, and/or sell copies of the Software, and to
 **  permit persons to whom the Software is furnished to do so, subject to
 **  the following conditions:
 **
 **  The above copyright notice and this permission notice shall be included
 **  in all copies or substantial portions of the Software.
 **
 **  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 **  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 **  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 **  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 **  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 **  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 **  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var htmlFileScanner = require("./Parse5FileScanner");
var ASTQ = require("astq");
var ASTQParse5Adapter = require("./ASTQParse5Adapter");

var astq = new ASTQ();
astq.adapter(ASTQParse5Adapter);

module.exports = (function () {
    var self = {};

    self.astq = astq

    self.astToString = function (ast) {
        return htmlFileScanner.serialize(ast)
    }

    self.findViolations = function (ast, file, query) {
        var result = [];
        var violations = self.astq.query(ast, query)
        violations.forEach(function (finding) {
            result.push({file: file, text: "\n" + self.astToString(finding)});
        })
        return result;
    }

    self.findAstList = function (root, clazzRegexp, excludedFiles) {
        var astList = [];
        //check if clazzRegexp is an array
        if (Object.prototype.toString.call(clazzRegexp) === Object.prototype.toString.call([])) {
            _.forEach(clazzRegexp, function (regex) {
                astList = astList.concat(htmlFileScanner.scan(root, regex, excludedFiles))
            });
        } else {
            astList = htmlFileScanner.scan(root, clazzRegexp, excludedFiles)
        }
        return astList
    }

    return self;
}());