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

var ts = require("typescript")

module.exports = {
    taste: function (node) {
        return (
            typeof node === "object"
            && node !== null
            && typeof node.kind === "number"
            && ts.SyntaxKind[node.kind] !== undefined
        )
    },
    getParentNode: function (node) {
        return node.parent || null
    },
    getChildNodes: function (node) {
        return node.getChildren()
    },
    getNodeType: function (node) {
        return ts.SyntaxKind[node.kind]
    },
    // Return the list of all attribute names of node: String[]
    getNodeAttrNames: function (node) {
        // TODO fullText in query does not get results -> not working
        var names = [];
        if (ts.SyntaxKind[node.kind] === "Identifier") {
            if (typeof node.getFullText == "function")
                names.push("fullText")
            if (typeof node.getText == "function") {
                names.push("text")
                names.push("name")
            }
            if (typeof node.escapedText == "string")
                names.push("escapedText")
        }
        // all kinds of node
        if (typeof node.getFullWidth == "function")
            names.push("fullWidth")
        if (typeof node.getWidth == "function")
            names.push("width")
        if (typeof node.getLeadingTriviaWidth == "function")
            names.push("leadingTriviaWidth")
        return names
    },
    // Return the value of attribute attr of node: Any
    getNodeAttrValue: function (node, attr) {
        if (ts.SyntaxKind[node.kind] === "Identifier") {
            switch (attr) {
                case "fullText":
                    return node.getFullText()
                case "text":
                case "name":
                    return node.getText()
                case "escapedText":
                    return node.escapedText
            }
        }
        // all kinds of node
        switch (attr) {
            case "fullWidth":
                return node.getFullWidth()
            case "width":
                return node.getWidth()
            case "leadingTriviaWidth":
                return node.getLeadingTriviaWidth()
            default:
                return undefined
        }
    }
};
