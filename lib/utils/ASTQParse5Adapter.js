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

module.exports = {
    taste: function (node) {
        return (
            typeof node === "object"
            && node !== null
            && typeof node.nodeName === "string"
            && node.nodeName !== ""
        )
    },
    getParentNode: function (node) {
        return node.parentNode || null
    },
    getChildNodes: function (node) {
        var children = []
        if (node.hasOwnProperty("childNodes")) {
            children = node.childNodes
        }
        return children
    },
    getNodeType: function (node) {
        return node.nodeName
    },
    getNodeAttrNames: function (node) {
        var names = []
        if (typeof node.attrs === "object" && node.attrs instanceof Array) {
            node.attrs.forEach(function (each) {
                if (typeof each === "object" &&
                    typeof each.name === "string")
                    names.push(each.name)
            })
        }
        return names
    },
    getNodeAttrValue: function (node, attr) {
        var value = undefined
        if (typeof node.attrs === "object" && node.attrs instanceof Array) {
            node.attrs.forEach(function (each) {
                if (typeof each === "object" &&
                    typeof each.name === "string" &&
                    each.name === attr)
                    value = each.value
            })
        }
        return value
    }
}