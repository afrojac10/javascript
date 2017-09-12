import { connect } from "react-redux";
import { updateSiteUrl, loadSites } from "../actions/sites";
import { siteAddSubscription, siteRemoveSubscription, siteRemove } from "../actions/site";
import SitePage from "../components/SitePage";
import { addLicensesPopupOpen, addLicensesPopupClose } from "../actions/subscriptions";
import { getPlugins } from "../functions/products";
import _isEmpty from "lodash/isEmpty";
import _includes from "lodash/includes";

export const mapStateToProps = ( state, ownProps ) => {
	let id = ownProps.match.params.id;

	let sites = state.entities.sites;

	if ( ! sites.byId.hasOwnProperty( id ) ) {
		return {
			loadingSite: true,
		};
	}
	let addSubscriptionModal = state.ui.addSubscriptionModal;

	let site = sites.byId[ id ];

	let subscriptions = state.entities.subscriptions.allIds.map( ( subscriptionId ) => {
		return state.entities.subscriptions.byId[ subscriptionId ];
	} );

	subscriptions = subscriptions.map( ( subscription ) => {
		return Object.assign(
			{},
			{
				productLogo: subscription.product.icon,
			},
			subscription,
			{
				isEnabled: ! ! site.subscriptions && site.subscriptions.includes( subscription.id ),
				price: subscription.product.price,
			}
		);
	} );

	let activeSubscriptions = subscriptions.filter( ( subscription ) => {
		return subscription.status === "active";
	} );

	let plugins = getPlugins( state.entities.products.byId ).map( ( plugin ) => {
		// Set defaults
		plugin.limit = 0;
		plugin.isEnabled = false;
		plugin.used = 0;
		plugin.subscriptionId = "";
		plugin.currency = "USD";

		// Get all subscriptions for this plugin
		activeSubscriptions.filter( ( subscription ) => {
			return plugin.ids.includes( subscription.productId );
		} ).forEach( ( subscription ) => {
			// Accumulate amount of slots for this plugin.
			plugin.limit += subscription.limit;
			// Accumulate amount of slots in use for this plugin.
			plugin.used += ( subscription.used || 0 );

			/*
			 * If the plugin subscription is enabled for this site, make sure it's
			 * subscriptionId is set on the plugin.
			 */
			if ( subscription.isEnabled === true ) {
				plugin.isEnabled = true;
				plugin.subscriptionId = subscription.id;
			/*
			 * If the plugin subscription Id has not been set and there are still slots
			 * available, set the first available product subscription for this plugin.
			 */
			} else if (
				_isEmpty( plugin.subscriptionId ) &&
				( subscription.limit > ( subscription.used || 0 ) )
			) {
				plugin.subscriptionId = subscription.id;
			}

			// Determine currency based on the subscription currency.
			// Eventually the currency should be made available on the products themselves.
			// This needs to be fixed in the shop.
			plugin.currency = subscription.currency;
		} );

		plugin.hasSubscriptions = plugin.limit > 0;
		plugin.isAvailable = plugin.limit > plugin.used || plugin.isEnabled;

		return plugin;
	} );

	/* Defines an array of plugin glnumbers in order of popularity:
     * Premium WP: "82101"
     * Local WP: "82103"
     * News WP : "82104"
     * WooCommerce: "82105"
     * Video WP: "82102"
     * Local WooCommerce: "82106"
     */
	let pluginsOrder = [ "82101", "82103", "82104", "82105", "82102", "82106" ];

	// Sorts Yoast plugins based on the index their glNumber have which are defined in pluginsOrder.
	plugins = plugins.sort( ( a, b ) => {
		// If the GL number is not present in the pluginsOrder array, force it to the bottom of the list.
		if ( ! _includes( pluginsOrder, b.glNumber ) ) {
			return -1;
		}

		return pluginsOrder.indexOf( a.glNumber ) > pluginsOrder.indexOf( b.glNumber );
	} );

	return {
		addSubscriptionModal,
		site,
		subscriptions,
		plugins,
		loadingSubscriptions: state.ui.subscriptions.requesting,
		uiSite: state.ui.site,
	};
};

export const mapDispatchToProps = ( dispatch, ownProps ) => {
	dispatch( loadSites() );
	let siteId = ownProps.match.params.id;

	return {
		onMoreInfoClick: () => {},
		onAddMoreSubscriptionsClick: ( subscriptionId ) => {
			dispatch( addLicensesPopupOpen( subscriptionId ) );
		},
		onToggleDisabled: ( subscriptionId ) => {
			dispatch( addLicensesPopupOpen( subscriptionId ) );
		},
		onClose: () => {
			dispatch( addLicensesPopupClose() );
		},
		onToggleSubscription: ( subscriptionId, enabled ) => {
			if ( enabled ) {
				dispatch( siteAddSubscription( siteId, subscriptionId ) );
			} else {
				dispatch( siteRemoveSubscription( siteId, subscriptionId ) );
			}
		},
		onChange: ( url ) => {
			dispatch( updateSiteUrl( url ) );
		},
		onRemove: () => {
			// eslint-disable-next-line
			if ( window.confirm( "Are you sure you want to remove this site from my.yoast?" ) ) {
				dispatch( siteRemove( siteId ) );
			}
		},
	};
};

const SitePageContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)( SitePage );

export default SitePageContainer;
