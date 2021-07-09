// Source code modified from this project: https://github.com/sonyan/react-wysiwyg-editor
'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');


var HtmlEditor = createReactClass({
        displayName: 'EditableDiv',

        propTypes: {
            content: PropTypes.string.isRequired,
            onChange: PropTypes.func.isRequired,
            onPasteTransformer: PropTypes.func
        },

        getInitialState: function () {
            // this is anti-pattern but we treat this.props.content as initial content
            return {html: this.props.content};
        },

        emitChange: function () {
            var editor = this.refs.editor, // .getDOMNode(),
                newHtml = editor.innerHTML;

            this.setState({html: newHtml}, function () {
                this.props.onChange({
                    target: {
                        value: newHtml
                    }
                });
            }.bind(this));
        },

        handlePaste: function (e) {
            // alternative: http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser/6804718#6804718
            // alternotive: https://gist.github.com/Schniz/e398a630c81cfd8a3d1e
            // some info: https://www.lucidchart.com/techblog/2014/12/02/definitive-guide-copying-pasting-javascript/

          let text = this.props.onPasteTransformer ? this.props.onPasteTransformer(e.clipboardData) : e.clipboardData.getData("text/plain");
            // regExp for å fjerne header-tags
          
          var headerRegex = /([<h|</h])+([0-9])+\s?([-A-Z0-9+&@#\/%?=~_|!:,.;/""/]*)>/ig;
          let headers = text.match(headerRegex);
          if (headers) {
              
            for (let i = 0; i < headers.length; i++) {
                text = text.replace(headers[i], " ");
              }
          }
          
           // regExp for å finne og fjerne mellomrom som skaper innrykk             
            //var spaceRegex = />\s+(<|[A-Z0-9.-])/ig;
            var spaceRegex = />\s+<body>\s*(<|[A-Z0-9.-])/ig;
            let matches = text.match(spaceRegex);
            
            if (matches) {   
                for (let i = 0; i < matches.length; i++){
                  let lastChar = matches[i].charAt(matches[i].length-1);
                 text = text.replace(matches[i], '><body>'+lastChar);
              }            
            } 
           

            // regExp for å fjerne stylingen fra copy/paste
            var stylingRegex = /style/ig;
            let s = text.match(stylingRegex);
            if (s) {
                for (let i = 0; i < s.length; i++) {
                    text = text.replace(s[i], " ");
                }
            }

            e.preventDefault();
            document.execCommand('insertHTML', false, text);  // IE legacy use e.clipboardData.setData ?
        },

        componentDidUpdate: function (prevProps) {
            if(prevProps.content !== this.state.html) {
                this.setState({
                    html: prevProps.content
                });
            }
        },

        shouldComponentUpdate: function (nextProps) {
            return nextProps.content !== this.state.html || 
                nextProps.disabled !== this.props.disabled
        },

        execCommand: function (command, arg) {
            document.execCommand(command, false, arg);
        },

        render: function () {
            // customize css rules here
            var buttonSpacing = {marginRight: 0},
                toolbarStyle = {marginBottom: '5px'};
            return (
                React.createElement("div", {className: "input_field"},
                    React.createElement("div", {className: "toolbar_styling", style: toolbarStyle},

                        /** feel free to customize buttons below.
                         for list of supported commands, please see https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand */
                        React.createElement("div", {className: "btn-group", style: buttonSpacing},
                            React.createElement("button", {
                                    className: "btn btn-default btn-xs dropdown-toggle",
                                    type: "button", "data-toggle": "dropdown",
                                    "aria-expanded": "true"
                                },
                                //React.createElement("i", {className: "fa fa-paragraph"}), " ", React.createElement("i", {className: "fa fa-caret-down"})
                                React.createElement("i", {className: "fa fa-paragraph"}), " "
                            ),
                            React.createElement("ul", {className: "dropdown-menu", role: "menu"},
                                React.createElement("li", null,
                                    React.createElement("a", {
                                            href: "javascript:;",
                                            onClick: this.execCommand.bind(this, 'formatBlock', 'P')
                                        },
                                        "Paragraph"
                                    )
                                ),
                                React.createElement("li", null,
                                    React.createElement("a", {
                                            href: "javascript:;",
                                            onClick: this.execCommand.bind(this, 'formatBlock', 'BLOCKQUOTE')
                                        },
                                        "Block Quote"
                                    )
                                ),
                                React.createElement("li", null,
                                    React.createElement("a", {
                                            href: "javascript:;",
                                            onClick: this.execCommand.bind(this, 'formatBlock', 'H1')
                                        },
                                        "Header 1"
                                    )
                                ),
                                React.createElement("li", null,
                                    React.createElement("a", {
                                            href: "javascript:;",
                                            onClick: this.execCommand.bind(this, 'formatBlock', 'H2')
                                        },
                                        "Header 2"
                                    )
                                ),
                                React.createElement("li", null,
                                    React.createElement("a", {
                                            href: "javascript:;",
                                            onClick: this.execCommand.bind(this, 'formatBlock', 'H3')
                                        },
                                        "Header 3"
                                    )
                                ),
                                React.createElement("li", null,
                                    React.createElement("a", {
                                            href: "javascript:;",
                                            onClick: this.execCommand.bind(this, 'formatBlock', 'H4')
                                        },
                                        "Header 4"
                                    )
                                ),
                                React.createElement("li", null,
                                    React.createElement("a", {
                                            href: "javascript:;",
                                            onClick: this.execCommand.bind(this, 'formatBlock', 'H5')
                                        },
                                        "Header 5"
                                    )
                                ),
                                React.createElement("li", null,
                                    React.createElement("a", {
                                            href: "javascript:;",
                                            onClick: this.execCommand.bind(this, 'formatBlock', 'H6')
                                        },
                                        "Header 6"
                                    )
                                )
                            )
                        ),

                        React.createElement("div", {
                                className: "btn-group btn-group-xs",
                                role: "group",
                                style: buttonSpacing
                            },
                            React.createElement("button", {
                                    type: "button",
                                    className: "btn btn-default",
                                    onClick: this.execCommand.bind(this, 'bold')
                                },
                                React.createElement("i", {className: "fa fa-bold"})
                            ),
                            React.createElement("button", {
                                    type: "button",
                                    className: "btn btn-default",
                                    onClick: this.execCommand.bind(this, 'italic')
                                },
                                React.createElement("i", {className: "fa fa-italic"})
                            ),
                            React.createElement("button", {
                                    type: "button",
                                    className: "btn btn-default",
                                    onClick: this.execCommand.bind(this, 'underline')
                                },
                                React.createElement("i", {className: "fa fa-underline"})
                            ),
                            React.createElement("button", {
                                    type: "button",
                                    className: "btn btn-default",
                                    onClick: this.execCommand.bind(this, 'strikeThrough')
                                },
                                React.createElement("i", {className: "fa fa-strikethrough"})
                            ),

                            React.createElement("div", {className: "btn-group", role: "group"},
                                React.createElement("button", {
                                        className: "btn btn-default btn-xs dropdown-toggle",
                                        type: "button", "data-toggle": "dropdown",
                                        "aria-expanded": "true"
                                    },
                                    //React.createElement("i", {className: "fa fa-text-height"}), " ", React.createElement("i", {className: "fa fa-caret-down"})
                                    React.createElement("i", {className: "fa fa-text-height"}), " "
                                ),
                                React.createElement("ul", {className: "dropdown-menu", role: "menu"},
                                    React.createElement("li", null,
                                        React.createElement("a", {
                                            href: "javascript:;",
                                            onClick: this.execCommand.bind(this, 'fontSize', 1)
                                        }, "1")
                                    ),
                                    React.createElement("li", null,
                                        React.createElement("a", {
                                            href: "javascript:;",
                                            onClick: this.execCommand.bind(this, 'fontSize', 2)
                                        }, "2")
                                    ),
                                    React.createElement("li", null,
                                        React.createElement("a", {
                                            href: "javascript:;",
                                            onClick: this.execCommand.bind(this, 'fontSize', 3)
                                        }, "3")
                                    ),
                                    React.createElement("li", null,
                                        React.createElement("a", {
                                            href: "javascript:;",
                                            onClick: this.execCommand.bind(this, 'fontSize', 4)
                                        }, "4")
                                    ),
                                    React.createElement("li", null,
                                        React.createElement("a", {
                                            href: "javascript:;",
                                            onClick: this.execCommand.bind(this, 'fontSize', 5)
                                        }, "5")
                                    ),
                                    React.createElement("li", null,
                                        React.createElement("a", {
                                            href: "javascript:;",
                                            onClick: this.execCommand.bind(this, 'fontSize', 6)
                                        }, "6")
                                    ),
                                    React.createElement("li", null,
                                        React.createElement("a", {
                                            href: "javascript:;",
                                            onClick: this.execCommand.bind(this, 'fontSize', 7)
                                        }, "7")
                                    )
                                )
                            )
                        ),

                        React.createElement("div", {
                                className: "btn-group btn-group-xs",
                                role: "group",
                                style: buttonSpacing
                            },
                            React.createElement("button", {
                                    type: "button",
                                    className: "btn btn-default",
                                    onClick: this.execCommand.bind(this, 'insertOrderedList')
                                },
                                React.createElement("i", {className: "fa fa-list-ol"})
                            ),
                            React.createElement("button", {
                                    type: "button",
                                    className: "btn btn-default",
                                    onClick: this.execCommand.bind(this, 'insertUnorderedList')
                                },
                                React.createElement("i", {className: "fa fa-list-ul"})
                            )
                        ),

                        React.createElement("div", {className: "btn-group", style: buttonSpacing},
                            React.createElement("button", {
                                    className: "btn btn-default btn-xs dropdown-toggle",
                                    type: "button",
                                    "data-toggle": "dropdown",
                                    "aria-expanded": "false"
                                },
                                //React.createElement("i", {className: "fa fa-align-left"}), " ", React.createElement("i", {className: "fa fa-caret-down"})
                                React.createElement("i", {className: "fa fa-align-left"}), " "
                            ),
                            React.createElement("ul", {className: "dropdown-menu", role: "menu"},
                                React.createElement("li", null,
                                    React.createElement("a", {
                                        href: "javascript:;",
                                        onClick: this.execCommand.bind(this, 'justifyLeft')
                                    }, "Align Left")
                                ),
                                React.createElement("li", null,
                                    React.createElement("a", {
                                        href: "javascript:;",
                                        onClick: this.execCommand.bind(this, 'justifyRight')
                                    }, "Align Right")
                                ),
                                React.createElement("li", null,
                                    React.createElement("a", {
                                        href: "javascript:;",
                                        onClick: this.execCommand.bind(this, 'justifyCenter')
                                    }, "Align Center")
                                ),
                                React.createElement("li", null,
                                    React.createElement("a", {
                                        href: "javascript:;",
                                        onClick: this.execCommand.bind(this, 'justifyFull')
                                    }, "Align Justify")
                                )
                            )
                        ),

                        React.createElement("button", {
                                type: "button",
                                className: "btn btn-default btn-xs",
                                onClick: this.execCommand.bind(this, 'removeFormat')
                            },
                            React.createElement("i", {className: "fa fa-eraser"})
                        )
                    ),
                    React.createElement("div", {
                        ref: "editor",
                        className: "form-control",
                        style: this.props.style,
                        disabled: this.props.disabled,
                        onPaste: this.handlePaste,
                        placeholder: this.props.placeholder,
                        contentEditable: (!this.context.readonly && !this.props.disabled),
                        dangerouslySetInnerHTML: {__html: this.state.html},
                        onInput: this.emitChange
                    })
                )
            );
        }
    }
)

HtmlEditor.contextTypes = {
    readonly: PropTypes.bool
}

module.exports = HtmlEditor