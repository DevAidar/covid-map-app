import React from 'react';
import { connect } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';

import Header from '../../components/Header/Header';
import Map from '../../components/Map/Map';

const Location = ({
	virusData,
	points,
	clusterPoints,
}) => {
	let location = useLocation();
	console.log('Location', location);
  
	let history = useHistory();
	console.log('History', history);

	return (
		<>
			<Header />
			{points.length > 0 && clusterPoints.length > 0 
				? <Map width="100%" height="50vh" />
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
};

const mapStateToProps = (state) => ({
	virusData: state.virusData,
	points: state.points,
	clusterPoints: state.clusterPoints,
});

export default connect(mapStateToProps, {})(Location);

//coordinates
