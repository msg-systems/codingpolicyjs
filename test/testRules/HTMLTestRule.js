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

var path = require("path")

module.exports = (function () {

    return function (options, tools) {
        var findings = []

        var astList = tools.astHTML5.findAstList(options.root, options.includeFiles, options.excludedFiles)
        astList.forEach(function (astObj) {
            // Test for parent findings
            var inputFindings = tools.astHTML5.astq.query(astObj.ast, "//input")
            inputFindings.forEach(function(inputObj) {
                var appInputfieldFindings = tools.astHTML5.findViolations(inputObj, astObj.file, "..//app-inputfield")
                if (appInputfieldFindings.length > 0) {
                    findings.push({file: path.join(astObj.file), text: "\n" + tools.astHTML5.astToString(inputObj)})
                }
            })
        })

        return findings
    }
}());
