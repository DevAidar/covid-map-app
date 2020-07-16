import React from 'react';
import { connect } from 'react-redux';

import Header from '../../components/Header/Header';
import Map from '../../components/Map/Map';

const Main = ({
	virusData,
	points,
	clusterPoints,
}) => (
	<>
		<Header />
		{points.length > 0 && clusterPoints.length > 0 
			? <Map width="100%" height="90vh" />
			: null}
		<div className="container">
			{console.log(points)}
			{points.length > 0 && clusterPoints.length > 0 
				? null
				: <h1>Loading . . .</h1>
			}
		</div>
	</>
);

const mapStateToProps = (state) => ({
	virusData: state.virusData,
	points: state.points,
	clusterPoints: state.clusterPoints,
});

export default connect(mapStateToProps, {})(Main);
