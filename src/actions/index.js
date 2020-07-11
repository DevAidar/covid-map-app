import { FETCH_VIRUS_DATA, FETCH_COUNTRIES } from '../constants';

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

// const fetchVirusTotal = (from, to) => dispatch => {
//   axios.get(`https://api.covid19api.com/world?from=${from}&to=${to}`)
//     .then(res => {
//       axios.get('https://api.covid19api.com/world/total')
//         .then(res => {
//           return dispatch({
//             type: FETCH_VIRUS_TOTAL,
//             virusTotalData: res
//           })
//         })
//         .catch(res => {
//           console.error(res);
//           return dispatch({
//             type: FETCH_VIRUS_TOTAL,
//             virusTotalData: {
//               status: 404,
//             }
//           })
//         });
//       return dispatch({
//         type: FETCH_VIRUS_DAY_TOTAL,
//         virusDayTotalData: res
//       })
//     })
//     .catch(res => {
//       console.error(res);
//       return dispatch({
//         type: FETCH_VIRUS_DAY_TOTAL,
//         virusDayTotalData: {
//           status: 404,
//         }
//       })
//     });
// }

// const fetchVirusTotal = () => ({
//   type: FETCH_VIRUS_TOTAL,
// });

const fetchCountries = date => ({
  type: FETCH_COUNTRIES,
  date: date
});

export { fetchVirusData, fetchCountries };