import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ReactMapGL, { Marker, FlyToInterpolator } from 'react-map-gl';
import useSupercluster from 'use-supercluster';

const Map = ({ width, height, points, total, clusterPoints }) => {
	let history = useHistory();
  
	const getSearchResult = (param) => history.location.pathname.split('/').slice(-1)[0].toLocaleLowerCase() === 'location' && history.location.search
		? history.location.search.substr(1).split('&').reduce((result, elem) => !result && elem.startsWith(param) ? elem.split('=')[1] : result, null)
		: null;

	const options = {
		ACTIVE: 'active',
		CONFIRMED: 'totalConfirmed',
		DEATHS: 'totalDeaths',
		RECOVERED: 'totalRecovered',
		DEFAULT: 'totalDeaths',
	};

	const option = getSearchResult('option') 
		? options[getSearchResult('option').toUpperCase()]
		: options.DEFAULT;

	// setup map
	const [viewport, setViewport] = useState({
		latitude: getSearchResult('lat') ? parseFloat(getSearchResult('lat')) : 0,
		longitude: getSearchResult('lon') ? parseFloat(getSearchResult('lon')) : 0,
		width: width,
		height: height,
		zoom: getSearchResult('zoom') ? parseFloat(getSearchResult('zoom')) : 0,
	});
  
	const mapRef = useRef();

	// get map bounds
	const bounds = mapRef.current
		? mapRef.current.getMap().getBounds().toArray().flat()
		: null;

	// get clusters
	const {
		clusters: generalClusters,
		supercluster: generalSupercluster,
	} = useSupercluster({
		points: clusterPoints,
		zoom: viewport.zoom,
		bounds,
		options: {
			radius: 75,
			maxZoom: 20,
		},
	});

	const {
		clusters: countryClusters,
		supercluster: countrySupercluster,
	} = useSupercluster({
		points: points.reduce(
			(countriesPoints, country) =>
				country.point.geometry.type === 'None' ||
          country.provincePoints.length > 0
					? countriesPoints
					: [...countriesPoints, country.point],
			[],
		),
		zoom: viewport.zoom,
		bounds,
		options: {
			radius: 75,
			maxZoom: 20,
		},
	});

	// get virus information from all clusters
	const getVirusInfo = (cluster, superclusterX) => {
		if (!cluster.properties.cluster) return cluster.properties.cases[option];

		return superclusterX
			.getChildren(cluster.id)
			.reduce(
				(total, clusterX) => total + getVirusInfo(clusterX, superclusterX),
				0,
			);
	};

	const getTotal = () => total[option];

	return (
		<ReactMapGL
			{...viewport}
			maxZoom={20}
			mapboxApiAccessToken={
				process.env.REACT_APP_MAPBOX_TOKEN
					? process.env.REACT_APP_MAPBOX_TOKEN
					: 'pk.eyJ1IjoibGltZXBlYWNoIiwiYSI6ImNrY2RyNXVicDAxN2UzM3A4aGVkbmNlazMifQ.Yz5AUxZ_z7jd5QrcJS1mpQ'
			}
			onViewportChange={(viewport) => setViewport(viewport)}
			mapStyle="mapbox://styles/mapbox/dark-v10"
			ref={mapRef}
		>
			{countryClusters.map((cluster) =>
				getVirusInfo(cluster, countrySupercluster) ? (
					<Marker
						key={`countryCluster-${
							cluster.id ? cluster.id : cluster.properties.country
						}`}
						latitude={cluster.geometry.coordinates[1]}
						longitude={cluster.geometry.coordinates[0]}
					>
						<div
							onClick={() => {
								const expansionZoom = cluster.id 
									? Math.min(countrySupercluster.getClusterExpansionZoom(cluster.id), 20)
									: viewport.zoom;
								setViewport({
									...viewport,
									latitude: cluster.geometry.coordinates[1],
									longitude: cluster.geometry.coordinates[0],
									zoom: expansionZoom,
									transitionInterpolator: new FlyToInterpolator({
										speed: 2,
									}),
									transitionDuration: 'auto',
								});
                
								console.log(history);
                
								history.push({
									pathname: `/covid-map-app/location`,
									search: `?lat=${cluster.geometry.coordinates[1]}&lon=${cluster.geometry.coordinates[0]}&zoom=${expansionZoom}`,
								});
							}}
							className={
								getVirusInfo(cluster, countrySupercluster)
									? 'country-marker'
									: 'zero-marker'
							}
							style={{
								width: `${
									5 +
                  viewport.zoom / 5 +
                  (getVirusInfo(cluster, countrySupercluster) / getTotal()) *
                  (200 + viewport.zoom * 300) +
                  getTotal() /
                  (getVirusInfo(cluster, countrySupercluster) * 1000000) /
                  5
								}px`,
								height: `${
									5 +
                  viewport.zoom / 5 +
                  (getVirusInfo(cluster, countrySupercluster) / getTotal()) *
                  (200 + viewport.zoom * 300) +
                  getTotal() /
                  (getVirusInfo(cluster, countrySupercluster) * 1000000) /
                  5
								}px`,
							}}
						/>
					</Marker>
				) : null,
			)}
			{generalClusters.map((cluster) => {
				const [longitude, latitude] = cluster.geometry.coordinates;
				const { cluster: isCluster } = cluster.properties;

				let count = getVirusInfo(cluster, generalSupercluster);

				if (isCluster) {
					return count ? (
						<Marker
							key={`generalCluster-${cluster.id}`}
							latitude={latitude}
							longitude={longitude}
						>
							<div
								className={
									getVirusInfo(cluster, generalSupercluster)
										? 'cluster-marker'
										: 'zero-marker'
								}
								style={{
									width: `${
										5 +
                    viewport.zoom / 5 +
                    (count / getTotal()) * (200 + viewport.zoom * 300) +
                    getTotal() / (count * 1000000) / 5
									}px`,
									height: `${
										5 +
                    viewport.zoom / 5 +
                    (count / getTotal()) * (200 + viewport.zoom * 300) +
                    getTotal() / (count * 1000000) / 5
									}px`,
								}}
								onClick={() => {
									const expansionZoom = Math.min(generalSupercluster.getClusterExpansionZoom(cluster.id), 20);
									setViewport({
										...viewport,
										latitude,
										longitude,
										zoom: expansionZoom,
										transitionInterpolator: new FlyToInterpolator({
											speed: 2,
										}),
										transitionDuration: 'auto',
									});
								}}
							/>
						</Marker>
					) : null;
				}
				return count ? (
					<Marker
						key={`${cluster.properties.countryCode}${
							cluster.properties.province
								? '-' + cluster.properties.province
								: ''
						}${
							cluster.properties.cityCode
								? '-' + cluster.properties.cityCode
								: ''
						}`}
						latitude={latitude}
						longitude={longitude}
					>
						<div
							onClick={() => {
								setViewport({
									...viewport,
									latitude,
									longitude,
									transitionInterpolator: new FlyToInterpolator({
										speed: 2,
									}),
									transitionDuration: 'auto',
								});
							}}
							className={
								getVirusInfo(cluster, generalSupercluster)
									? 'cluster-marker'
									: 'zero-marker'
							}
							style={{
								width: `${
									5 +
                  viewport.zoom / 5 +
                  (count / getTotal()) * (200 + viewport.zoom * 300) +
                  getTotal() / (count * 1000000) / 5
								}px`,
								height: `${
									5 +
                  viewport.zoom / 5 +
                  (count / getTotal()) * (200 + viewport.zoom * 300) +
                  getTotal() / (count * 1000000) / 5
								}px`,
							}}
						/>
					</Marker>
				) : null;
			})}
		</ReactMapGL>
	);
};

const mapStateToProps = (state) => ({
	total: state.total,
	points: state.points,
	clusterPoints: state.clusterPoints,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Map);
