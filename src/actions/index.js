import { FETCH_VIRUS_DATA, FETCH_COUNTRIES, FETCH_DATES, FETCH_TOTAL_CASES, FETCH_POINTS, FETCH_CLUSTER_POINTS } from '../constants';

import axios from 'axios';

const fetchVirusData = () => dispatch => {
  axios.get('https://api.covid19api.com/all')
    // axios.get('https://api.covid19api.com/countries')
    .then(res => {
      return dispatch({
        type: FETCH_VIRUS_DATA,
        virusData: res
      })
    })
    .catch(res => {
      console.error(res);
      return dispatch({
        type: FETCH_VIRUS_DATA,
        virusData: {
          status: 404,
        }
      })
    });

};

const fetchDates = () => ({
  type: FETCH_DATES,
});

const fetchCountries = date => ({
  type: FETCH_COUNTRIES,
  date: date
});

const fetchTotalCases = date => ({
  type: FETCH_TOTAL_CASES,
  date: date
})

const fetchPoints = date => ({
  type: FETCH_POINTS,
  date: date
})

const fetchClusterPoints = date => ({
  type: FETCH_CLUSTER_POINTS,
  date: date
})

export { fetchVirusData, fetchDates, fetchCountries, fetchTotalCases, fetchPoints, fetchClusterPoints };