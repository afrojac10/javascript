import { connect } from "react-redux";
import { onSearchQueryChange } from "../actions/search";
import DownloadsPage from "../components/DownloadsPage";
import { getAllProducts } from "../actions/products";
import { getAllSubscriptions } from "../actions/subscriptions";
import { getOrders } from "../actions/orders";
import { getEbooks, getPlugins } from "../functions/products";
import _filter from "lodash/filter";
import _includes from "lodash/includes";
import _flatMap from "lodash/flatMap";
import _isEmpty from "lodash/isEmpty";

const getEbookProducts = ( state ) =>  {
	let eBooks =  getEbooks( state.entities.products.byId );
	let completedOrders = _filter( state.entities.orders.byId, { status: "completed" } );
	let lineItems = _flatMap( completedOrders, ( order ) => {
		return order.items;
	} );
	let boughtProductIds = lineItems.map( ( lineItem ) => {
		return lineItem.productId;
	} );
	return _filter( eBooks, ( eBook ) => {
		let boughtEbook = false;
		eBook.ids.forEach( ( eBookId ) => {
			if ( _includes( boughtProductIds,  eBookId ) ) {
				boughtEbook = true;
			}
		} );
		return boughtEbook;
	} );
};

const getPluginProducts = ( state ) =>  {
	let plugins = getPlugins( state.entities.products.byId );
	let activeSubscriptions = _filter( state.entities.subscriptions.byId, { status: "active" } );
	let activeSubscriptionIds = activeSubscriptions.map( ( subscription ) => {
		return subscription.productId;
	} );
	return _filter( plugins, ( plugin ) => {
		let boughtPlugin = false;
		plugin.ids.forEach( ( pluginId ) => {
			if ( _includes( activeSubscriptionIds,  pluginId ) ) {
				boughtPlugin = true;
			}
		} );
		return boughtPlugin;
	} );
};

const setDownloadProps = ( products, state ) => {
	return products.map( ( product ) => {
		let downloadButtons = [];

		if ( ! _isEmpty( product.downloads ) ) {
			downloadButtons = product.downloads.map( ( download ) => {
				return {
					label: download.name,
					onButtonClick: ( () => window.open( download.file, "_blank" ) ),
				};
			} );
		}

		return {
			ids: product.ids,
			glNumber: product.glNumber,
			name: product.name,
			currentVersion: product.currentVersion,
			icon: product.icon,
			category: product.type,
			buttons: downloadButtons,
		};
	} );
};

export const mapStateToProps = ( state ) => {
	let eBooks = setDownloadProps( getEbookProducts( state ), state );
	let plugins = setDownloadProps( getPluginProducts( state ), state );

	let query = state.ui.search.query;
	if ( query.length > 0 ) {
		eBooks = eBooks.filter( ( eBook ) => {
			return eBook.name.toUpperCase().includes( query.toUpperCase() );
		} );
		plugins = plugins.filter( ( plugin ) => {
			return plugin.name.toUpperCase().includes( query.toUpperCase() );
		} );
	}

	return {
		query,
		eBooks,
		plugins,
	};
};

export const mapDispatchToProps = ( dispatch, ownProps ) => {
	dispatch( getAllProducts() );
	dispatch( getAllSubscriptions() );
	dispatch( getOrders() );
	return {
		onSearchChange: ( query ) => {
			dispatch( onSearchQueryChange( query ) );
		},
	};
};

const DownloadsPageContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)( DownloadsPage );

export default DownloadsPageContainer;
