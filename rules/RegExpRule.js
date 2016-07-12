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
        var regExps = options.regExp;
        if (Object.prototype.toString.call(options.regExp) !== Object.prototype.toString.call([])) {
            regExps = [options.regExp];
        }
        var result = []
        _.forEach(regExps, function (regExp) {
            var opts = "";
            var match = /^\/(.*)\/(.*)?$/gm.exec(regExp);
            if (match.length >= 2) {
                pattern = match[1];
            }
            if (match.length === 3) {
                opts = match[2]
            }
            var newRegExp = new RegExp(pattern, opts);
            // Scan for the given RegExp
            result = result.concat(tools.regExpFileScanner.scan(options.root, options.includeFiles, options.excludedFiles, newRegExp));
        })
        // Return the result
        return result;
    }

}());