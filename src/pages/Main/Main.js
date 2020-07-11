import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux';

import { fetchVirusData, fetchCountries } from '../../actions';

import Header from '../../components/Header/Header';
import Map from '../../components/Map/Map';

const Main = ({ virusData, locations, points, fetchVirusData, fetchCountries }) => {
  const [didFetchData, setDidFetchData] = useState(false);
  useEffect(() => {
    console.log(virusData);
    if (!didFetchData) {
      console.log('Getting Virus Data');
      fetchVirusData();
      setDidFetchData(true);
    }

    if (didFetchData && virusData) {
      console.log('Getting Countries');
      fetchCountries();
    }
  }, [virusData]);

  return (
    <>
      <Header />
      <div className='container'>
        {console.log(locations, points)}
        {locations.length > 0 ? <Map width='100%' height='50vh' /> : <h1>Loading . . .</h1>}
      </div>
    </>
  )
}

const mapStateToProps = (state) => ({
  virusData: state.virusData,
  locations: state.locations,
  points: state.points,
});

const mapDispatchToProps = {
  fetchVirusData,
  fetchCountries,
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
