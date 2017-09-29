import React from "react";
import config from "../config.json";
import { capitalize } from "../functions/helpers"

const Searchable     = config.searchable;
const SearchableKeys = Object.keys( Searchable );
const Headers        = config.headers;

export default class SearchForm extends React.Component {
	/**
	 * Sets the initial state for this form.
	 *
	 * @returns {void}
	 */
	constructor( props ) {
		super( props );

		this.state = {
			resource: SearchableKeys[0],
			filters:  [ [ Searchable[ SearchableKeys[0] ][0], '' ] ]
		};

		this.handleResourceChange = this.handleResourceChange.bind( this );
		this.addFilter            = this.addFilter.bind( this );
		this.removeFilter         = this.removeFilter.bind( this );
		this.submit               = this.submit.bind( this );
	}

	/**
	 * Callback used when the resource select changes.
	 *
	 * @param {Object} event The change event.
	 *
	 * @returns {void}
	 */
	handleResourceChange( event ) {
		let resource = event.target.value;

		this.setState( {
			resource: resource,
			filters:  [ [ Searchable[ resource ][0], '' ] ]
		} );
	}

	/**
	 * Callback used when the attribute select changes.
	 *
	 * @param {number} i     The number filter to change.
	 * @param {Object} event The change event.
	 *
	 * @returns {void}
	 */
	handleAttributeChange( i, event ) {
		let filters = this.state.filters;

		filters[ i ][0] = event.target.value;

		this.setState( { filters } );
	}

	/**
	 * Callback used when the search value input changes.
	 *
	 * @param {number} i     The number filter to change.
	 * @param {Object} event The change event.
	 *
	 * @returns {void}
	 */
	handleSearchValueChange( i, event ) {
		let filters = this.state.filters;

		filters[ i ][1] = event.target.value;

		this.setState( { filters } );
	}

	/**
	 * Generates options for an array of option values.
	 *
	 * @param {Object} options      An object of options to generate option element for.
	 * @param {Object} translations An object with
	 *
	 * @returns {ReactElement} The options.
	 */
	static generateOptions( options, translations = {} ) {
		return options.map( function ( option ) {
			let display = translations[ option ] || capitalize( option );

			return <option key={ option } value={ option }>{ display }</option>;
		} );
	}

	addFilter() {
		let filters = this.state.filters;

		filters.push( [ Searchable[ this.state.resource ][0], '' ] );

		this.setState( { filters } );
	}

	removeFilter() {
		let filters = this.state.filters;

		filters.pop();

		this.setState( { filters } );
	}

	/**
	 * Callback used when this form is submitted.
	 *
	 * @param {Object} event The submit event.
	 *
	 * @returns {void}
	 */
	submit( event ) {
		this.props.searchCallback( this.state );

		event.preventDefault();
	}

	/**
	 * Renders the component
	 *
	 * @returns {ReactElement} The rendered component.
	 */
	render() {
		return(
			<form onSubmit={ this.submit }>
				<fieldset>
					<select className="wide" onChange={ this.handleResourceChange } value={ this.state.resource }>
						{ SearchForm.generateOptions( SearchableKeys ) }
					</select>
					<button type="submit">Search</button>
				</fieldset>
				{ this.state.filters.map( ( filter, i ) =>
					<fieldset key={ i }>
						<select onChange={ this.handleAttributeChange.bind( this, i ) } value={ filter[0] }>
							{ SearchForm.generateOptions( Searchable[ this.state.resource ], Headers[ this.state.resource ] ) }
						</select>
						<input type="text" onChange={ this.handleSearchValueChange.bind( this, i ) } value={ filter[1] } />
						{ i === 0 &&
						  <button type="button" onClick={ this.addFilter }>Add filter</button>
						}
						{ i === this.state.filters.length - 1 && this.state.filters.length > 1 &&
						  	<button type="button" onClick={ this.removeFilter }>Remove filter</button>
						}
					</fieldset>
				) }
				<fieldset>


				</fieldset>
			</form>
		)
	}
}
