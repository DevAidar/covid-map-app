import React, { useState, useRef } from "react";
import { connect } from "react-redux";
import ReactMapGL, { Marker, FlyToInterpolator } from "react-map-gl";
import useSupercluster from "use-supercluster";

const Map = ({ width, height, points, total, clusterPoints }) => {
  const options = {
    ACTIVE: "active",
    CONFIRMED: "totalConfirmed",
    DEATHS: "totalDeaths",
    RECOVERED: "totalRecovered",
    DEFAULT: "totalDeaths",
  };

  const [option, setOption] = useState(options.DEFAULT);

  // setup map
  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    width: width,
    height: height,
    zoom: 0,
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

  console.log(generalSupercluster);

  const {
    clusters: countryClusters,
    supercluster: countrySupercluster,
  } = useSupercluster({
    points: points.reduce(
      (countriesPoints, country) =>
        country.point.geometry.type === "None" ||
        country.provincePoints.length > 0
          ? countriesPoints
          : [...countriesPoints, country.point],
      []
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
        0
      );
  };

  const getTotal = () => total[option];

  return (
    <>
      <ReactMapGL
        {...viewport}
        maxZoom={20}
        mapboxApiAccessToken={
          process.env.REACT_APP_MAPBOX_TOKEN
            ? process.env.REACT_APP_MAPBOX_TOKEN
            : "pk.eyJ1IjoibGltZXBlYWNoIiwiYSI6ImNrY2RyNXVicDAxN2UzM3A4aGVkbmNlazMifQ.Yz5AUxZ_z7jd5QrcJS1mpQ"
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
                onClick={() =>
                  console.log(
                    cluster,
                    getVirusInfo(cluster, countrySupercluster)
                  )
                }
                className={
                  getVirusInfo(cluster, countrySupercluster)
                    ? "country-marker"
                    : "zero-marker"
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
          ) : null
        )}
        {generalClusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster } = cluster.properties;

          let count = getVirusInfo(cluster, generalSupercluster);
          console.log(generalSupercluster.getLeaves(cluster.id, 25, 0));

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
                      ? "cluster-marker"
                      : "zero-marker"
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
                  onClick={() =>
                    console.log(generalSupercluster.getChildren(cluster.id))
                  }
                />
              </Marker>
            ) : null;
          }
          return count ? (
            <Marker
              key={`${cluster.properties.countryCode}${
                cluster.properties.province
                  ? "-" + cluster.properties.province
                  : ""
              }${
                cluster.properties.cityCode
                  ? "-" + cluster.properties.cityCode
                  : ""
              }`}
              latitude={latitude}
              longitude={longitude}
            >
              <div
                onClick={() => console.log(cluster)}
                className={
                  getVirusInfo(cluster, generalSupercluster)
                    ? "cluster-marker"
                    : "zero-marker"
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
      <button onClick={() => console.log(points)}> Show Points </button>
    </>
  );
};

const mapStateToProps = (state) => ({
  total: state.total,
  points: state.points,
  clusterPoints: state.clusterPoints,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Map);
