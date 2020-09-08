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
            && typeof node.type === "string"
            && node.type !== ""
        )
    },
    getParentNode: function (node) {
        return node.parent || null
    },
    getChildNodes: function (node) {
        var self = this;
        var childs = [];
        for (var field in node) {
            if (node.hasOwnProperty(field)
                && this.taste(node[field]))
                childs.push(node[field]);
            else if (node.hasOwnProperty(field)
                && typeof node[field] === "object"
                && node[field] instanceof Array) {
                node[field].forEach(function (node2) {
                    if (self.taste(node2))
                        childs.push(node2)
                })
            }
        }
        return childs
    },
    getNodeType: function (node) {
        return node.type
    },
    getNodeAttrNames: function (node) {
        var names = [];
        for (var field in node)
            if (node.hasOwnProperty(field)
                && typeof node[field] !== "object"
                && field !== "type"
                && field !== "loc")
                names.push(field);
        return names
    },
    getNodeAttrValue: function (node, attr) {
        if (node.hasOwnProperty(attr)
            && typeof node[attr] !== "object"
            && attr !== "type"
            && attr !== "loc")
            return node[attr];
        else
            return undefined
    }
};