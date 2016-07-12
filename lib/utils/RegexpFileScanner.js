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
var glob = require("glob")
var fs = require("fs")
var path = require("path")
var _ = require("lodash")

module.exports = (function () {
    var self = {}

    self.scan = function (root, clazzRegexp, excludedFiles, searchRegexp) {
        var findings = []

        var clazzGlobs = clazzRegexp
        if (typeof clazzRegexp === "string")
            clazzGlobs = [clazzRegexp]
        //search for all desired files in the given folder
        _.forEach(clazzGlobs, function (globPattern) {
            var files = glob.sync(globPattern, {cwd: root})
            files.forEach(function (file) {
                var exclude = false
                excludedFiles.forEach(function (excludeFile) {
                    if (path.join(excludeFile) === path.join(file)) {
                        exclude = true
                    }
                })
                if (!exclude) {
                    // read in the file contents
                    var content = fs.readFileSync(path.join(root, file), {encoding: "utf8"})
                    var m = content.match(searchRegexp)
                    if (m) {
                        m.forEach(function (line) {
                            findings.push({file: path.join(root, file), text: line})
                        })
                    }
                }
            })
        })
        return findings
    }

    return self
}())