import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';

import {
	fetchVirusData,
	fetchDates,
	fetchCountries,
	fetchTotalCases,
	fetchPoints,
	fetchClusterPoints,
} from './actions';

import Main from './pages/Main/Main';
import Location from './pages/Location/Location';
import PageNotFound from './pages/PageNotFound/PageNotFound';

import './App.css';

const App = ({
	virusData,
	points,
	clusterPoints,
	fetchVirusData,
	fetchDates,
	fetchCountries,
	fetchTotalCases,
	fetchPoints,
	fetchClusterPoints,
}) => {
	const [didFetchData, setDidFetchData] = useState(false);

	useEffect(() => {
		const transformData = () => {
			console.log('Getting Dates');
			fetchDates();
			console.log('Getting Countries');
			fetchCountries();
			console.log('Getting Total Cases');
			fetchTotalCases();
			console.log('Getting Points');
			fetchPoints();
			fetchClusterPoints();
		};

		if (!didFetchData) {
			console.log('Getting Virus Data');
			fetchVirusData();
			setDidFetchData(true);
		}

		if (didFetchData && Object.keys(virusData).length > 0) {
			transformData();
		}
	}, [didFetchData, virusData, fetchVirusData, fetchDates, fetchCountries, fetchTotalCases, fetchPoints, fetchClusterPoints]);

	return (
		<div className="App">
			<Switch>
				<Route exact path="/">
					<Redirect to="/covid-map-app/" />
				</Route>
				<Route exact path="/covid-map-app/">
					<Main />
				</Route>
				<Route path ="/covid-map-app/location">
					<Location />
				</Route>
				<PageNotFound />
			</Switch>
		</div>
	);
};

const mapStateToProps = (state) => ({
	virusData: state.virusData,
	points: state.points,
	clusterPoints: state.clusterPoints,
});

const mapDispatchToProps = {
	fetchVirusData,
	fetchDates,
	fetchCountries,
	fetchTotalCases,
	fetchPoints,
	fetchClusterPoints,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
