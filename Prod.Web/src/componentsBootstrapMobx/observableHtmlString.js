import React from 'react';
import {PropTypes} from 'prop-types';
import {action} from 'mobx';
import {observer} from 'mobx-react';
import HtmlEditor from '../components/htmlEditor';
import {UserContext} from './components'

// removes MS Office generated guff
function cleanHTML(input) {
    // 1. remove line breaks / Mso classes
    const stringStripper = /(\n|\r| class=(")?Mso[a-zA-Z]+(")?)/g;
    var output = input.replace(stringStripper, ' ');
    // 2. strip Word generated HTML comments
    const commentSripper = new RegExp('<!--(.*?)-->', 'g');
    var output = output.replace(commentSripper, '');
    // 3. remove tags leave content if any
    let tagStripper = new RegExp('<(/)*(meta|link|span|\\?xml:|st1:|o:|font)(.*?)>', 'gi');
    output = output.replace(tagStripper, '');
    // 4. Remove everything in between and including tags '<style(.)style(.)>'
    const badTags = ['style', 'script', 'applet', 'embed', 'noframes', 'noscript', 'object'];
    for (var i = 0; i < badTags.length; i++) {
        tagStripper = new RegExp(`<${badTags[i]}.*?${badTags[i]}(.*?)>`, 'gi');
        output = output.replace(tagStripper, '');
    }
    // 5. remove attributes ' style="..."'
    const badAttributes = ['style', 'start'];
    for (var i = 0; i < badAttributes.length; i++) {
        const attributeStripper = new RegExp(` ${badAttributes[i]}="(.*?)"`, 'gi');
        output = output.replace(attributeStripper, '');
    }
    return output;
}


//const result = sanitizeHTML(text)
//const result = removeTags(text)
//const result = dompurify.sanitize(text); //, config)
//const result2 = dompurify.sanitize(result, config)
//const result = sanitize(text); //, config)

//////var config = {
//////    ALLOWED_TAGS: ['p', 'span', 'a', 'b', 'i', 'strong', '#text'], // only <P> and text nodes
//////    ALLOWED_ATTR: ['img', 'href'], 
//////    FORBID_ATTR: ['style'], 
//////    FORBID_TAGS: ['style']
//////    //KEEP_CONTENT: false
//////};

//////const sanitizeHTML = function (html, white,black) {
//////    if (!white) white="b|i|p|br";//allowed tags
//////    if (!black) black="script|object|embed|style";//complete remove tags
//////    var e=new RegExp("(<("+black+")[^>]*>.*</\\2>|(?!<[/]?("+white+")(\\s[^<]*>|[/]>|>))<[^<>]*>|(?!<[^<>\\s]+)\\s[^</>]+(?=[/>]))", "gi");
//////    return html.replace(e,"");
//////}

//////var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

//////var tagOrComment = new RegExp(
//////    '<(?:'
//////    // Comment body.
//////    + '!--(?:(?:-*[^->])*--+|-?)'
//////    // Special "raw text" elements whose content should be elided.
//////    + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
//////    + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
//////    // Regular name
//////    + '|/?[a-z]'
//////    + tagBody
//////    + ')>',
//////    'gi');
//////function removeTags(html) {
//////    var oldHtml;
//////    do {
//////        oldHtml = html;
//////        html = html.replace(tagOrComment, '');
//////    } while (html !== oldHtml);
//////    return html.replace(/</g, '&lt;');
//////}


//////var whitelist = {
//////    nodes: { BODY: true, FORM: true, A: true, B: true, IMG: true , P: true},
//////    attributes: { alt: true, style: true }
//////};

//////function cleanNode( node ) {
//////    if ( !whitelist.nodes[ node.nodeName ] ) {
//////        node.parentNode.removeChild( node );
//////        return;
//////    }
//////    var attributes = node.attributes;
//////    var children = node.childNodes;
//////    var l;

//////    l = attributes.length;
//////    while ( l-- ) {
//////        name = attributes[l].name;
//////        if ( !whitelist.attributes[ name ] ) {
//////            node.removeAttribute( name );
//////        }
//////    }

//////    l = children.length;
//////    while ( l-- ) {
//////        cleanNode( children[l] );
//////    }
//////}

//////function sanitizeHTML2( html ) {
//////    var doc = new DOMParser().parseFromString( html, 'text/html' );
//////    cleanNode( doc.body );
//////    return doc.body.innerHTML;
//////}

@observer
export default class ObservableHtmlString extends React.Component {
    constructor(props) {
        super(props)

        const style = {
            overflow: 'auto',
            width: '100%',
            height: '75%',
            borderRadius: '0'
        }
        this.pasteTransform = clip => {
            let text = clip.getData("text/html")
            if (!text) {
                text = clip.getData("text/plain")
            }
            const result = cleanHTML(text); //, config)
            return result;
        }
        const mergedstyle = Object.assign({}, style, props.style);
        this.style = mergedstyle;
    }
    render() {
        const context = UserContext.getContext()
        const {observableValue, label, disabled, editable} = this.props;        
        const readonly = !!context.readonly
        const [obj, prop] = observableValue;
        const hasLabel = !!label;
        return (<div>
            {hasLabel && <label htmlFor={prop}>{label}</label>}
            <HtmlEditor 
                        disabled={(readonly || disabled) && !editable }
                        style={this.style}
                        content={obj[prop] || ""}
                        onChange={action(e => {obj[prop] = e.target.value; return null})}
                        onPasteTransformer={this.pasteTransform}/>
        </div>
        )
    }
}

ObservableHtmlString.contextTypes = {
    readonly: PropTypes.bool
}
