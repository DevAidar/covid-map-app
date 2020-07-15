import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import {
	fetchVirusData,
	fetchDates,
	fetchCountries,
	fetchTotalCases,
	fetchPoints,
	fetchClusterPoints,
} from "../../actions";

import Header from "../../components/Header/Header";
import Map from "../../components/Map/Map";

const Main = ({
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
		if (!didFetchData) {
			console.log("Getting Virus Data");
			fetchVirusData();
			setDidFetchData(true);
		}

		if (didFetchData && virusData) {
			console.log("Getting Dates");
			fetchDates();
			console.log("Getting Countries");
			fetchCountries();
			console.log("Getting Total Cases");
			fetchTotalCases();
			console.log("Getting Points");
			fetchPoints();
			fetchClusterPoints();
		}
	}, [
		didFetchData,
		fetchClusterPoints,
		fetchCountries,
		fetchDates,
		fetchPoints,
		fetchTotalCases,
		fetchVirusData,
		virusData,
	]);

	return (
		<>
			<Header />
			<div className="container">
				{console.log(points)}
				{points.length > 0 && clusterPoints.length > 0 ? (
					<Map width="100%" height="50vh" />
				) : (
					<h1>Loading . . .</h1>
				)}
			</div>
		</>
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

export default connect(mapStateToProps, mapDispatchToProps)(Main);
