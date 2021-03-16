//import dompurify from 'dompurify';
//import { DOMParser } from 'xmldom';
//import sanitizeHtml3 from 'sanitize-html';

const sanitizeHTML = function (html, white, black) {
    if (!white) white = "b|i|p|br";//allowed tags
    if (!black) black = "script|object|embed|style";//complete remove tags
    var e = new RegExp("(<(" + black + ")[^>]*>.*</\\2>|(?!<[/]?(" + white + ")(\\s[^<]*>|[/]>|>))<[^<>]*>|(?!<[^<>\\s]+)\\s[^</>]+(?=[/>]))", "gi");
    return html.replace(e, "");
}

var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

var tagOrComment = new RegExp(
    '<(?:'
    // Comment body.
    + '!--(?:(?:-*[^->])*--+|-?)'
    // Special "raw text" elements whose content should be elided.
    + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
    + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
    // Regular name
    + '|/?[a-z]'
    + tagBody
    + ')>',
    'gi');
function removeTags(html) {
    var oldHtml;
    do {
        oldHtml = html;
        html = html.replace(tagOrComment, '');
    } while (html !== oldHtml);
    return html.replace(/</g, '&lt;');
}


var whitelist = {
    nodes: { BODY: true, FORM: true, A: true, B: true, IMG: true, P: true },
    attributes: { alt: true, style: true }
};

function cleanNode(node) {
    if (!node) {
        console.log("*skip*")
        return;
    }
    if (!whitelist.nodes[node.nodeName]) {
        node.parentNode.removeChild(node);
        return;
    }
    var attributes = node.attributes;
    var children = node.childNodes;
    var l;

    l = attributes.length;
    while (l--) {
        name = attributes[l].name;
        if (!whitelist.attributes[name]) {
            node.removeAttribute(name);
        }
    }

    l = children.length;
    while (l--) {
        cleanNode(children[l]);
    }
}

function sanitizeHTML2(html) {
    const domparser =  new DOMParser();
    var doc = domparser.parseFromString(html, 'text/html');
    console.log("parser : " + !!domparser + "doc :" + !!doc);
    cleanNode(doc.body);
    return doc.body.innerHTML;
}
