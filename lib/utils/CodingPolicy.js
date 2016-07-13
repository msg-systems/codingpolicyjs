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

/*  standard requirements  */
var fs = require("fs-extra");
var path = require("path");

/*  extra requirements  */
var YAML = require("js-yaml");
var _ = require("lodash");
var colors = require("colors");
var glob = require("glob");

/*  rule registry        */
var registry = {};

/*  rules to execute     */
var rules = {};

/* overall error count   */
var errorCount = 0;

/* overall warning count */
var warningCount = 0;

/* tool options for each rule        */
var toolOpts = {
    astJS: require("./ASTUtilsJS"),
    astHTML5: require("./ASTUtilsHTML5"),
    regExpFileScanner: require("./RegExpFileScanner"),
    parse5FileScanner: require("./Parse5FileScanner")
};

/*  send caller log information      */
var log = function (options, msg) {
    if (typeof options.log === "function")
        options.log(msg);
};

/*  send caller verbose information  */
var verbose = function (options, filename, action, msg) {
    if (typeof options.verbose === "function")
        options.verbose(filename, action, msg);
};

/*  send caller error information    */
var error = function (options, filename, action, msg, fix) {
    if (typeof options.error === "function")
        options.error(filename, action, msg, fix);
};

var findFileInNodeModulesHierarchy = function (file, filePath) {
    try {
        var fileName = path.join(filePath, "node_modules", file);
        var stat = fs.statSync(fileName);
        if (stat.isFile()) {
            return fileName;
        }
    } catch (e) {
        var idx = filePath.lastIndexOf("node_modules");
        if (idx === -1) {
            throw e;
        } else {
            return findFileInNodeModulesHierarchy(file, filePath.substr(0, idx))
        }
    }
};

var resolveNodeModulesFile = function (libPath, file) {
    var absFile = path.join(libPath, file);
    var idx = path.join(file).lastIndexOf("node_modules" + path.sep);
    if (idx != -1) {
        idx = idx + ("node_modules" + path.sep).length;
        var absPath = path.join(libPath, file.substr(0, idx));
        var fileName = file.substr(idx, file.length - 1);

        var foundFile = findFileInNodeModulesHierarchy(fileName, absPath);
        if (foundFile) {
            absFile = foundFile;
        }
    }
    return absFile;
};

var loadSource = function (options, source) {
    var contentYAML = fs.readFileSync(source, {encoding: "utf8"});
    var contentObj = YAML.safeLoad(contentYAML);
    importParts(options, source, contentObj);
    registerRules(options, source, contentObj);
    buildRules(options, source, contentObj);
};

var importParts = function (options, source, content) {
    var absPath = path.resolve(path.dirname(source));
    if (content && content.import) {
        _.forEach(content.import, function (importValue) {
            try {
                // importValue might be a node module
                var fileName = findFileInNodeModulesHierarchy(path.join(importValue, "codingpolicy.yaml"), absPath);
                if (fileName) {
                    loadSource(options, fileName);
                }
            } catch (e) {
                // if no module is given - assume importValue is a file/dir glob pattern
                var sources = glob.sync(importValue, {cwd: absPath});
                _.forEach(sources, function (anotherSource) {
                    loadSource(options, path.join(absPath, anotherSource));
                })
            }
        })
    }
};

var registerRules = function (options, source, content) {
    var absPath = path.resolve(path.dirname(source));
    if (content && content.register) {
        for (var key in content.register) {
            if (!content.register.hasOwnProperty(key))
                continue;
            var register = content.register[key];
            if (typeof register === 'string')
                register = {name: register};

            // remember the absolute path of the config file
            register.path = absPath;
            register.source = path.basename(source);

            if (!registry.hasOwnProperty(key)) {
                verbose(options, source, "REGISTER", key);
                registry[key] = register;
            } else {
                if (absPath !== registry[key].path || path.basename(source) !== registry[key].source) {
                    error(options, source, "DUPLICATE REGISTER", key,
                        "Ensure that no coding policy rule is registered twice. Either by not loading a config file or by registering the coding policy rule with a different name.")
                }
            }
        }
    }
};

var buildRules = function (options, source, content) {
    if (content && content.rules) {
        for (var key in content.rules) {
            if (!content.rules.hasOwnProperty(key))
                continue;
            var rule = content.rules[key];
            if (typeof rule === 'string')
                rule = {rule: key, ruleText: rule};

            // default rule to content key
            rule.rule = rule.rule || key
            // default the severity to error
            rule.severity = rule.severity || 'error';
            // default the includeFiles to all JS files
            rule.options = rule.options || {};
            rule.options.includeFiles = rule.options.includeFiles || '**/*.js';

            if (!rules.hasOwnProperty(key)) {
                verbose(options, source, "RULE", key);
                rules[key] = rule;
            } else {
                error(options, source, "DUPLICATE RULE", key,
                    "Ensure that no coding policy rule is activated twice. Either by not loading a config file or by defining the coding policy rule with a different name.")
            }
        }
    }
};

var runRules = function (options) {
    var root = path.join("./", options.root || "");

    _.forEach(rules, function (ruleObj) {
        var ruleOpts = _.cloneDeep(ruleObj.options);
        if (typeof ruleOpts.excludedFiles === "string")
            ruleOpts.excludedFiles = [ruleOpts.excludedFiles]
        ruleOpts.excludedFiles = _.map(ruleOpts.excludedFiles, function (excludedFile) {
            return path.join(root, excludedFile);
        });
        ruleOpts.root = root;
        if (ruleObj.rule && registry[ruleObj.rule]) {
            var rule = registry[ruleObj.rule];
            var ruleClazz = require(path.join(rule.path, rule.name));
            findings = ruleClazz(ruleOpts, toolOpts);
            if (ruleObj.findingAccessors) {
                _.forEach(ruleObj.findingAccessors, function (accessor, i) {
                    handleFindings(options, findings[accessor], ruleObj.severity, ruleObj.ruleText[i], ruleObj.fixText)
                })
            } else {
                handleFindings(options, findings, ruleObj.severity, ruleObj.ruleText, ruleObj.fixText);
            }
        } else {
            error(options, "", "UNKNOWN RULE", ruleObj.rule,
                "Ensure that the coding policy rule is registered.")
        }
    });

};

var handleFindings = function (options, findings, severity, title, fixText) {
    // Log the remaining findings
    var severityName = severity === "error" ? "violated ".red.bold : "warned ".yellow.bold;
    var result = findings.length ? severityName + findings.length + " times" : "passed".green.bold;
    log(options, "Scan for ".bold + title + " " + result);
    findings.forEach(function (finding) {
        log(options, path.relative(path.dirname(root), finding.file).cyan.bold + " " + finding.text.grey);
    });
    if (severity === "error") {
        errorCount += findings.length;
    }
    if (severity === "warning") {
        warningCount += findings.length;
    }
    if (findings.length > 0) {
        log(options, "How to solve:".red.bold + " " + fixText.red.bold);
    }
};

/*  export the packing API function  */
module.exports = function (sources, options) {
    // analyse all configs and build up the rules config
    sources.forEach(function (source) {
        log(options, "using config file " + source.cyan.bold + "\n");
        loadSource(options, source);
    });

    // run the coding policy
    runRules(options)

    // log results
    var prefix = "\nCodingPolicy check";
    // Final Check if any violations occured
    if (errorCount > 0) {
        var warnings = warningCount > 0 ? " and " + (warningCount + " Warnings").yellow.bold : "";
        error(options, null, null, prefix + " failed".red.bold + " with " + ("" + errorCount + " Errors").red.bold + warnings);
        process.exit(1);
    }
    if (warningCount > 0) {
        log(options, prefix + " completed without Errors".green.bold + " but we have " + (warningCount + " Warnings").yellow.bold);
    } else {
        log(options, prefix + " completed without Errors or Warnings - well done".green.bold);
    }
};