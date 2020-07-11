import React, { useState, useRef, useEffect } from 'react'
import { connect } from 'react-redux';
import ReactMapGL, { Marker, FlyToInterpolator } from 'react-map-gl';
import useSupercluster from 'use-supercluster';

import { fetchCountries } from '../../actions';

const Map = ({ width, height, locations, points }) => {
  // setup map
  const [viewport, setViewport] = useState({
    latitude: 0, longitude: 0,
    width: width,
    height: height,
    zoom: 0,
  });

  const mapRef = useRef();

  // get map bounds
  const bounds = mapRef.current ? mapRef.current.getMap().getBounds().toArray().flat() : null;

  // get clusters
  const { clusters, supercluster } = useSupercluster({
    points,
    zoom: viewport.zoom,
    bounds,
    options: {
      radius: 50,
      maxZoom: 20
    }
  });

  // console.log(clusters, supercluster);

  return (
    <>
      <ReactMapGL
        {...viewport}
        maxZoom={20}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        onViewportChange={viewport => setViewport(viewport)}
        mapStyle='mapbox://styles/mapbox/dark-v10'
        ref={mapRef}
      >
        {clusters.map(cluster => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {
            cluster: isCluster,
            point_count: pointCount
          } = cluster.properties;





          if (isCluster) {
            return (
              <Marker key={cluster.id} latitude={latitude} longitude={longitude}>
                <div className='cluster-marker' style={{ width: `${20 + (pointCount / locations.length) * 50}px`, height: `${20 + (pointCount / locations.length) * 50}px` }}>
                  <p className='cluster-count'>{pointCount}</p>
                </div>
              </Marker>
            )
          }
          return (
            <Marker key={`${cluster.properties.countryCode}${cluster.properties.province ? '-' + cluster.properties.province : ''}${cluster.properties.cityCode ? '-' + cluster.properties.countryCode : ''}`} latitude={latitude} longitude={longitude}>
              <button onClick={() => console.log(cluster)} />
            </Marker>
          );
        })}
      </ReactMapGL>
      <button onClick={() => console.log(locations)}>Show Countries</button>
    </>
  );
};

const mapStateToProps = (state) => ({
  locations: state.locations,
  points: state.points,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Map);
