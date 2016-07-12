#!/usr/bin/env node
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

/* global require: false */
/* global process: false */

/*  standard requirements  */
var fs = require("fs")
var path = require("path")
var util = require("util")

/*  extra requirements  */
var pkg = require("package")
var dashdash = require("dashdash")
var colors = require("colors")

/*  internal requirements  */
var codingPolicy = require("../lib/codingpolicy.js")

/*  gracefully die  */
var die = function (msg) {
    console.error("codingpolicyjs: ERROR: ", msg)
    process.exit(1)
}

/*  command-line argument parsing  */
var options = [
    {names: ["version", "V"], type: "bool", "default": false, help: "Print tool version and exit."},
    {names: ["help", "h"], type: "bool", "default": false, help: "Print this help and exit."},
    {names: ["verbose", "v"], type: "bool", "default": false, help: "Print verbose processing information."},
    {names: ["root", "r"], type: "string", "default": ".", help: "Root directory for include files."}
]
var parser = dashdash.createParser({
    options: options,
    interspersed: false
})
try {
    var opts = parser.parse(process.argv)
    var args = opts._args
} catch (e) {
    die(e.message)
}
if (opts.help) {
    var help = parser.help().trimRight()
    console.log(util.format("%s: USAGE: codingpolicy [options] arguments\noptions:\n%s", pkg(module).name, help))
    process.exit(0)
}
else if (opts.version) {
    var p = pkg(module)
    console.log(util.format("%s codingpolicy %s", p.name, p.version))
    process.exit(0)
}
var input = args.length ? args : ["."]

var files = []
input.forEach(function (filepath) {
    try {
        var stat = fs.statSync(filepath)
        if (stat.isDirectory()) {
            try {
                stat = fs.statSync(path.join(filepath, codingPolicy.filename))
                if (stat.isFile()) files.push(path.join(filepath, codingPolicy.filename))
            } catch (e) {
            }
        } else if (stat.isFile()) {
            files.push(filepath)
        }
    } catch (e) {
    }
})

codingPolicy.codingPolicy(files, {
    log: function (msg) {
        process.stdout.write(msg + "\n")
    },
    verbose: function (filename, action, msg) {
        if (opts.verbose) {
            var message = msg + "\n"
            if (filename && action) {
                filename = path.relative(process.cwd(), filename)
                message = "++ " + colors.cyan.bold(filename) + ": " + colors.yellow(action) + ": " + msg + "\n"
            }
            process.stderr.write(message)
        }
    },
    error: function (filename, action, msg, fix) {
        var message = msg + "\n"
        if (filename && action) {
            filename = path.relative(process.cwd(), filename)
            message = "++ " + colors.cyan.bold(filename) + ": " + colors.red.bold(action) + ": " + msg + "\n"
        }
        process.stderr.write(message)
        if (fix) {
            process.stderr.write("Solution: " + colors.yellow.bold(fix) + "\n")
        }
        die("process stopped".red.bold)
    },
    root: opts.root
})