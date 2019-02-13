import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { defineMessages, FormattedMessage, injectIntl, intlShape } from "react-intl";
import styled from "styled-components";
import colors from "yoast-components/style-guide/colors";
import { LargeButtonLink, makeButtonFullWidth } from "../Button";
import { retrieveFeed } from "../../actions/home";
import Link from "../Link.js";

const messages = defineMessages( {
	loading: {
		id: "blogcard.loading",
		defaultMessage: "Retrieving recent blog posts...",
	},
} );

const ActionBlock = styled.div`
	text-align: center;
`;

const Header = styled.h2`
	padding: 0;
	margin: 0;
	margin-bottom: 15px;
	color: ${ colors.$color_pink_dark };
	font-weight: 300;
	font-size: 1.5em;
	text-decoration: none;
`;

const Details = styled.div`
	margin: 24px 0;
	border-bottom: 1px ${ colors.$color_grey } solid;
	flex-grow: 1;
`;

const WordpressFeedList = styled.ul`
	margin: 0;
	list-style: none;
	padding: 0;
`;

const WordpressFeedLink = styled( Link )`
	display: inline-block;
	padding-bottom: 4px;
	font-weight: bold;
`;

const WordpressFeedListItemContainer = styled.li`
	margin: 8px 0 24px;
`;

const FeedDescription = styled.p`
	margin-top: 0;
`;

/**
 * A WordpressFeedList item.
 *
 * @param {object} props The props needed to create the WordpressFeedList item
 *
 * @returns {ReactElement} The WordpressFeedList item
 */
const WordpressFeedListItem = ( props ) => {
	return (
		<WordpressFeedListItemContainer>
			<WordpressFeedLink
				to={ props.link.replace(
					"#utm_source=yoast-seo&utm_medium=software&utm_campaign=wordpress-general&utm_content=wordpress-dashboard", "" )
				}
				linkTarget="_blank"
			>
				{ props.title }
			</WordpressFeedLink>
			<FeedDescription>
				{ props.description }
			</FeedDescription>
		</WordpressFeedListItemContainer>
	);
};

WordpressFeedListItem.propTypes = {
	link: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
};

/**
 * The WordpressFeedList.
 *
 * @param {object} props The props needed to create the WordpressFeedList
 *
 * @returns {ReactElement} The WordpressFeedList
 */
const FeedList = ( props ) => {
	if ( props.retrievingFeed ) {
		return <p><FormattedMessage { ...messages.loading } /></p>;
	}
	return (
		<WordpressFeedList
			role="list"
		>
			{ props.blogFeed.items.map( item => (
				<WordpressFeedListItem
					key={ item.title }
					title={ item.title }
					link={ item.link }
					description={ item.description }
				/>
			) ) }
		</WordpressFeedList>
	);
};

FeedList.propTypes = {
	blogFeed: PropTypes.object.isRequired,
	retrievingFeed: PropTypes.bool.isRequired,
};

const ResponsiveButtonLink = makeButtonFullWidth( LargeButtonLink );

/**
 * A function that returns the SitesCard component.
 *
 * @param {Object} props The props required for the SitesCard.
 *
 * @returns {ReactElement} The component that contains the progress tab of the course page.
 */
class BlogContent extends React.Component {
	/**
	 * Initializes the class with the specified props.
	 *
	 * @param {Object} props The props to be passed to the class that was extended from.
	 *
	 * @returns {void}
	 */
	constructor( props ) {
		super( props );
	}

	/**
	 * Calls a callback after this component has been mounted.
	 *
	 * @returns {void}
	 */
	componentDidMount() {
		this.props.getFeed();
	}

	/**
	 * Renders the component.
	 *
	 * @returns {ReactElement} The rendered component.
	 */
	render() {
		return (
			<Fragment>
				<Details>
					<Header>
						<FormattedMessage id={ "home.blogcard.header" } defaultMessage={ "Learn more about SEO" } />
					</Header>
					<FeedList { ...this.props } />
				</Details>
				<ActionBlock>
					<ResponsiveButtonLink
						to="https://yoast.com/seo-blog/"
						linkTarget="_blank"
					>
						<FormattedMessage
							id={ "home.blogcard.blogbutton" }
							defaultMessage="SEO blog"
						/>
					</ResponsiveButtonLink>
				</ActionBlock>
			</Fragment>
		);
	}
}

BlogContent.propTypes = {
	getFeed: PropTypes.func.isRequired,
	retrievingFeed: PropTypes.bool.isRequired,
	blogFeed: PropTypes.object.isRequired,
	errorFound: PropTypes.bool,
	error: PropTypes.object,
	intl: intlShape.isRequired,
};

BlogContent.defaultProps = {
	error: null,
	errorFound: false,
};

/* eslint-disable require-jsdoc */
export const mapStateToProps = ( state ) => {
	const blogFeed = state.ui.home.blogFeed;

	const errorFound = state.ui.home.blogFeedErrorFound;
	const error = state.ui.home.blogFeedError;
	const retrievingFeed = state.ui.home.retrievingFeed;

	return {
		blogFeed,
		retrievingFeed,
		errorFound,
		error,
	};
};

export const mapDispatchToProps = ( dispatch ) => {
	return {
		getFeed: () => {
			// Currently, this number doesn't do anything, because the feed at yoast.com/feed/widget is constrained to two posts.
			dispatch( retrieveFeed( 3 ) );
		},
	};
};
/* eslint-enable require-jsdoc */

const BlogFeed = connect(
	mapStateToProps,
	mapDispatchToProps
)( BlogContent );

export default injectIntl( BlogFeed );
