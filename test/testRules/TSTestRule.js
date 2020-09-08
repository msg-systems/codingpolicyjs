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

var _ = require("lodash")

module.exports = (function () {

    return function (options, tools) {
        var findings = []

        var astList = tools.astTS.findAstList(options.root, options.includeFiles, options.excludedFiles)
        astList.forEach(function (astObj) {
            // test different Attributes for kind Identifier
            findings = tools.astTS.findViolations(astObj.ast, astObj.file, "//BinaryExpression [ /Identifier [ @text == 'nameX' || @escapedText == 'idX' ]]")
            // test different Attributes that are valid for all different kinds
            findings = findings.concat(tools.astTS.findViolations(astObj.ast, astObj.file, "//MethodDeclaration [ //IfStatement //Identifier [ @leadingTriviaWidth >= 2 ]]"))
            findings = findings.concat(tools.astTS.findViolations(astObj.ast, astObj.file, "//MethodDeclaration [ /OpenParenToken [ @leadingTriviaWidth >= 2 ]]"))
            // test for getting a parent
            findings = findings.concat(tools.astTS.findViolations(astObj.ast, astObj.file, "//IfStatement ..//MethodDeclaration"))
        })

        return findings
    }

}());
