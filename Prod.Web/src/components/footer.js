import React from 'react'

const Footer = ({labels}) => (
	<footer className="footer fabfooter">
		{/* <strong>FAB</strong>&nbsp;{process.env.NODE_ENV}&nbsp;build&nbsp;{BUILD_NUMBER}&nbsp;git {VERSION}&nbsp; */}
		<span>© {labels.nbic} 2019&nbsp;</span>
		<span> {labels.developedBy} Helge, Svetlana, Bjørn, Stein  ASAP&nbsp;</span>
		<span>-&nbsp;{labels.inquiry}:&nbsp;</span>
		<a
			href="mailto:rodliste@artsdatabanken.no?Subject=Henvendelse%20om%20Fremmedartsbasen"
			target="_top">rodliste@artsdatabanken.no
		</a>
	</footer>
)

export default Footer