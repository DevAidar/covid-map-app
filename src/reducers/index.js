import { FETCH_VIRUS_DATA, FETCH_COUNTRIES } from '../constants';

const INITIAL_STATE = {
  virusData: {},
  dates: new Map(),
  locations: [],
  points: [],
  total: 0,
  dailyTotal: [],
};

const rootReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_VIRUS_DATA:
      if (action.virusData.status !== 200)
        return { ...state, virusData: action.virusData };
      console.log(action.virusData)
      let dates = new Map();
      action.virusData.data.forEach(data => dates.has(data.Date) ? dates.set(data.Date, [...dates.get(data.Date), data]) : dates.set(data.Date, [data]));
      console.log(dates);
      console.log([...dates.keys()][dates.size - 1])

      let total = {
        day: [...dates.keys()][0],
        active: 0,
        totalConfirmed: 0,
        totalDeaths: 0,
        totalRecovered: 0
      };
      let dailyTotal = [...dates.keys()].map(day => {
        let prevTotal = total;
        total = dates.get(day).reduce((dt, pl) => ({
          ...dt,
          active: dt.active + pl.Active,
          totalConfirmed: dt.totalConfirmed + pl.Confirmed,
          totalDeaths: dt.totalDeaths + pl.Deaths,
          totalRecovered: dt.totalRecovered + pl.Recovered,
        }), {
          day: day,
          active: 0,
          totalConfirmed: 0,
          totalDeaths: 0,
          totalRecovered: 0
        })
        return {
          ...total,
          newConfirmed: prevTotal.totalConfirmed - total.totalConfirmed,
          newDeaths: prevTotal.totalDeaths - total.totalDeaths,
          newRecovered: prevTotal.totalRecovered - total.totalRecovered,
        }
      })
      console.log('Total', total);
      console.log('Daily Total', dailyTotal)

      return {
        ...state,
        virusData: action.virusData,
        dates: dates,
        total: total,
        dailyTotal: dailyTotal,
      };
    case FETCH_COUNTRIES:
      return {
        ...state,
        locations: state.dates.get(action.date ? action.date : [...state.dates.keys()][state.dates.size - 1]),
        points: [
          ...state.dates.get(action.date ? action.date : [...state.dates.keys()][state.dates.size - 1]).filter(country => country.Lat && country.Lon).map(location => ({
            type: 'Feature',
            properties: {
              cluster: false,
              category: location.City ? 'city' : location.Province ? 'province' : 'country',
              cases: {
                active: location.Active,
                confirmed: location.Confirmed,
                deaths: location.Deaths,
                recovered: location.Recovered
              },
              city: location.City,
              cityCode: location.CityCode,
              country: location.Country,
              countryCode: location.CountryCode,
              province: location.Province,
            },
            geometry: {
              type: 'Point',
              coordinates: [
                parseFloat(location.Lon),
                parseFloat(location.Lat)
              ]
            }
          }))
        ]
      }
    default:
      return { ...state };
  }
}

export default rootReducer;