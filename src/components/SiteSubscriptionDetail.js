import React from "react";
import MediaQuery from "react-responsive";
import styled from "styled-components";
import colors from "yoast-components/style-guide/colors.json";
import { LargeButtonLink } from "./Button";
import Toggle from "./Toggle";
import plusIcon from "../icons/blue-plus-circle.svg";
import { FormattedMessage } from "react-intl";
import { Row } from "./Tables";
import _partial from "lodash/partial";
import formatAmount from "../../../shared/currency";
import AddLicensesModal from "./AddLicensesModal";
import { injectIntl, intlShape } from "react-intl";

let responsiveWidthThreshold = 1355;

const SubscriptionLeftContainer = styled.span`
	margin: 0 40px;
	height: 66px;

	@media screen and ( min-width: ${ responsiveWidthThreshold }px ) {
		flex: 0 0 140px;
	}

	@media screen and ( max-width: ${ responsiveWidthThreshold }px ) {
		flex: 0 0 60px;
		margin: 0 10px;
	}
`;

const SubscriptionLogo = styled.img`
	width: 66px;
	height: 66px;

	@media screen and ( min-width: ${ responsiveWidthThreshold }px ) {
		float: right;
		margin-top: -9px;
	}
`;

const SubscriptionToggle = styled.span`
	margin-top: 15px;

	@media screen and ( min-width: ${ responsiveWidthThreshold }px ) {
		float: right;
		margin-right: 40px;
	}

	@media screen and ( max-width: ${ responsiveWidthThreshold }px ) {
		float: left;
		margin-top: 5px;
		margin-left: 20px;
	}
`;

const SubscriptionDetails = styled.div`
	color: ${ colors.$color_black };
	margin: 0 40px 0 0;
	flex: 1 1;
	overflow: hidden;
	max-width: 100%;
	@media screen and ( max-width: ${ responsiveWidthThreshold }px ) {
		margin: 0 10px;
		heigth: 150px;
	}
`;

const ProductName = styled.span`
	font-size: 16px;
	font-weight: 400;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	display: block;

	@media screen and ( max-width: ${ responsiveWidthThreshold }px ) {
		height: 60px;
		line-height: 60px;
	}
	@media screen and ( max-width: 350px ) {
		font-size: 14px;
		text-overflow: hidden;
	}
`;

const SubscriptionUsage = styled.span`
	font-size: 14px;
	font-weight: 300;
	font-style: italic;
	clear: left;

	@media screen and ( max-width: ${ responsiveWidthThreshold }px ) {
		margin-top: 10px;
		float: left;
		height: 20px;
		overflow: hidden;
		max-width: 100%;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
`;

const AddOneLicense = styled.a`
	font-size: 14px;
	font-weight: 300;
	font-style: italic;
	text-decoration: none;
	border: none;
	background: transparent url( ${ plusIcon } ) no-repeat 0 0;
	background-size: 16px;
	color: ${ colors.$color_blue };
	cursor: pointer;
	padding: 0 0 0 20px;
	margin-left: 10px;
	text-align: left;

	@media screen and ( max-width: ${ responsiveWidthThreshold }px ) {
		width: 100%;
		margin-left: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
`;

const Buttons = styled.span`
	margin: 0 40px 6px 0;

	button:last-child {
		margin-left: 40px;
	}
`;

/**
 * Creates Site Subscriptions component
 *
 * @param {Object} props The props to use
 *
 * @returns {ReactElement} The rendered component.
 */
function SiteSubscriptionDetail( props ) {
	let rowProps = [];
	if ( props.background ) {
		rowProps.background = props.background;
	}
	let modal = (
		<AddLicensesModal isOpen={ props.popupOpen } onUpgrade={ props.onUpgrade } onClose={ props.onClose }/>
	);

	let licensesRemaining = props.limit - props.used;

	let anotherLicense = null;
	if ( licensesRemaining === 0 ) {
		let price = props.intl.formatNumber( formatAmount( props.price ), { style: "currency", currency: props.currency } );

		anotherLicense = <AddOneLicense href={ props.storeUrl }><FormattedMessage
			id="site.subscriptions.licenses.add"
			defaultMessage="Add another license for { price }"
			values={{ price }} /></AddOneLicense>;
	}

	let disable = true;
	if ( props.subscriptionId !== "" ) {
		disable = false;
	}
	return (
		<Row { ...rowProps }>
			<SubscriptionLeftContainer>
				<SubscriptionLogo src={ props.icon } alt="" />
				<SubscriptionToggle>
					<Toggle
						onSetEnablement={ _partial( props.onToggleSubscription, props.subscriptionId ) }
						onToggleDisabled={ props.onToggleDisabled }
						isEnabled={ props.isEnabled }
						disable={ disable }
						ariaLabel={ props.id } />
				</SubscriptionToggle>
			</SubscriptionLeftContainer>

			<SubscriptionDetails>
				<ProductName>{ props.name }</ProductName>
				<SubscriptionUsage>
					<FormattedMessage id="subscriptions.remaining" defaultMessage={" { howMany } remaining "}
						values={{ howMany: licensesRemaining + " / " + props.limit }} />
				</SubscriptionUsage>
				{ anotherLicense }
			</SubscriptionDetails>
			{ modal }
			<MediaQuery query={ "(min-width: " + ( responsiveWidthThreshold + 1 ) + "px)" }>
				<Buttons>
					<LargeButtonLink to={`/account/subscriptions/${props.subscriptionId}`}>
						<FormattedMessage id="subscriptions.buttons.moreInfo" defaultMessage="Info" />
					</LargeButtonLink>
				</Buttons>
			</MediaQuery>
		</Row>
	);
}

SiteSubscriptionDetail.propTypes = {
	id: React.PropTypes.string.isRequired,
	subscriptionId: React.PropTypes.string,
	name: React.PropTypes.string.isRequired,
	onAddMoreLicensesClick: React.PropTypes.func,
	onClickToggle: React.PropTypes.func,
	onToggleSubscription: React.PropTypes.func,
	onToggleDisabled: React.PropTypes.func,
	onMoreInfoClick: React.PropTypes.func.isRequired,
	onSettingsClick: React.PropTypes.func.isRequired,
	onUpgrade: React.PropTypes.string.isRequired,
	isEnabled: React.PropTypes.bool,
	icon: React.PropTypes.string.isRequired,
	limit: React.PropTypes.number.isRequired,
	used: React.PropTypes.number.isRequired,
	background: React.PropTypes.string,
	price: React.PropTypes.number,
	intl: intlShape.isRequired,
	currency: React.PropTypes.string,
	popupOpen: React.PropTypes.bool,
	onClose: React.PropTypes.func.isRequired,
	storeUrl: React.PropTypes.string.isRequired,
};

SiteSubscriptionDetail.defaultProps = {
	onToggleSubscription: () => {},
	isEnabled: false,
};

export default injectIntl( SiteSubscriptionDetail );
