import {
	FETCH_VIRUS_DATA,
	FETCH_DATES,
	FETCH_TOTAL_CASES,
	FETCH_COUNTRIES,
	FETCH_POINTS,
	FETCH_CLUSTER_POINTS,
} from '../constants';

const INITIAL_STATE = {
	virusData: {},
	dates: new Map(),
	countries: new Map(),
	points: [],
	total: 0,
	clusterPoints: [],
};

const rootReducer = (state = INITIAL_STATE, action) => {
	switch (action.type) {
	case FETCH_VIRUS_DATA:
		console.log('Virus Data', action.virusData);
		return {
			...state,
			virusData: action.virusData,
		};
	case FETCH_DATES:
		let dates = new Map();
		state.virusData.data.forEach((data) =>
			dates.has(data.Date)
				? dates.set(data.Date, [...dates.get(data.Date), data])
				: dates.set(data.Date, [data]),
		);

		console.log('Dates', dates);

		return {
			...state,
			dates: dates,
		};
	case FETCH_COUNTRIES:
		let countries = new Map();
		state.dates
			.get(
				action.date
					? action.date
					: [...state.dates.keys()][state.dates.size - 1],
			)
			.forEach((place) => {
				let provinces = new Map();
				let cities = new Map();
				let totalCases = {};
				let coordinates = {};

				if (countries.has(place.Country)) {
					provinces = countries.get(place.Country).provinces;
					if (place.Province.length > 0) {
						if (countries.get(place.Country).provinces.has(place.Province)) {
							cities = countries
								.get(place.Country)
								.provinces.get(place.Province).cities;
							if (place.City && !cities.has(place.City)) {
								cities.set(place.City, place);
							}
						}
						if (provinces.has(place.Province))
							provinces.set(place.Province, {
								places: [...provinces.get(place.Province).places, place],
								cities: cities,
							});
						else
							provinces.set(place.Province, {
								places: [place],
								cities: cities,
							});
					}

					if (
						!place.Province &&
							(!place.City || place.City === 'Unassigned')
					) {
						totalCases = {
							active: place.Active,
							totalConfirmed: place.Confirmed,
							totalDeaths: place.Deaths,
							totalRecovered: place.Recovered,
						};
						coordinates = {
							Lon: place.Lon,
							Lat: place.Lat,
						};
					} else {
						totalCases = countries.get(place.Country).totalCases;
						coordinates = countries.get(place.Country).coordinates;
					}

					countries.set(place.Country, {
						places: [...countries.get(place.Country).places, place],
						totalCases: totalCases,
						coordinates: coordinates,
						countryCode: place.CountryCode,
						provinces: provinces,
					});
				} else {
					if (place.Province.length > 0) {
						if (place.City) {
							cities.set(place.City, place);
						}
						provinces.set(place.Province, {
							places: [place],
							cities: cities,
						});
					}
					if (
						!place.Province &&
							(!place.City || place.City === 'Unassigned')
					) {
						totalCases = {
							active: place.Active,
							totalConfirmed: place.Confirmed,
							totalDeaths: place.Deaths,
							totalRecovered: place.Recovered,
						};
						coordinates = {
							Lon: place.Lon,
							Lat: place.Lat,
						};
					}

					countries.set(place.Country, {
						places: [place],
						totalCases: totalCases,
						coordinates: coordinates,
						countryCode: place.CountryCode,
						provinces: provinces,
					});
				}
			});

		console.log('Countries', countries);

		return {
			...state,
			countries: countries,
		};
	case FETCH_TOTAL_CASES:
		let total = [...state.countries.keys()].reduce(
			(dt, country) =>
				Object.keys(state.countries.get(country).totalCases).length > 0
					? {
						...dt,
						active:
									dt.active + state.countries.get(country).totalCases.active,
						totalConfirmed:
									dt.totalConfirmed +
									state.countries.get(country).totalCases.totalConfirmed,
						totalDeaths:
									dt.totalDeaths +
									state.countries.get(country).totalCases.totalDeaths,
						totalRecovered:
									dt.totalRecovered +
									state.countries.get(country).totalCases.totalRecovered,
						  }
					: {
						...dt,
						...state.countries.get(country).places.reduce(
							(total, place, index) => ({
								active: total.active + place.Active,
								totalConfirmed: total.totalConfirmed + place.Confirmed,
								totalDeaths: total.totalDeaths + place.Deaths,
								totalRecovered: total.totalRecovered + place.Recovered,
							}),
							dt,
						),
						  },
			{
				day: action.date
					? action.date
					: [...state.dates.keys()][state.dates.size - 1],
				active: 0,
				totalConfirmed: 0,
				totalDeaths: 0,
				totalRecovered: 0,
			},
		);

		console.log('Total', total);

		return {
			...state,
			total: total,
		};
	case FETCH_POINTS:
		let points = [...state.countries.keys()].map((country) => ({
			point: {
				type: 'Feature',
				properties: {
					cluster: false,
					category: 'country',
					cases:
							Object.keys(state.countries.get(country).totalCases).length > 0
							  ? state.countries.get(country).totalCases
							  : state.countries.get(country).places.reduce(
							    (total, place) =>
							      place.Province.length > 0 || place.City.length > 0
							        ? {
							          active: total.active + place.Active,
							          totalConfirmed:
															total.totalConfirmed + place.Confirmed,
							          totalDeaths: total.totalDeaths + place.Deaths,
							          totalRecovered:
															total.totalRecovered + place.Recovered,
												  }
							        : total,
							    {
							      active: 0,
							      totalConfirmed: 0,
							      totalDeaths: 0,
							      totalRecovered: 0,
							    },
								  ),
					country: country,
					countryCode: state.countries.get(country).countryCode,
				},
				geometry: {
					type:
							Object.keys(state.countries.get(country).coordinates).length > 0
							  ? 'Point'
							  : 'None',
					coordinates:
							Object.keys(state.countries.get(country).coordinates).length > 0
							  ? [
							    parseFloat(state.countries.get(country).coordinates.Lon),
							    parseFloat(state.countries.get(country).coordinates.Lat),
								  ]
							  : [],
				},
			},
			provincePoints: state.countries.get(country).provinces
				? [...state.countries.get(country).provinces.keys()].map((province) =>
					state.countries
						.get(country)
						.provinces.get(province)
						.places.map((place) => ({
							type: 'Feature',
							properties: {
								cluster: false,
								category: place.City ? 'city' : 'province',
								cases: {
									active: place.Active,
									totalConfirmed: place.Confirmed,
									totalDeaths: place.Deaths,
									totalRecovered: place.Recovered,
								},
								city: place.City,
								cityCode: place.CityCode,
								country: country,
								countryCode: state.countries.get(country).countryCode,
								province: place.Province,
							},
							geometry: {
								type: 'Point',
								coordinates: [parseFloat(place.Lon), parseFloat(place.Lat)],
							},
						})),
					  )
				: [],
		}));

		console.log('Points', points);

		return {
			...state,
			points: points,
		};
	case FETCH_CLUSTER_POINTS:
		let clusterPoints = state.points.reduce(
			(totalPoints, points) =>
				points.provincePoints.length > 0
					? [
						...totalPoints,
						...points.provincePoints.reduce(
							(total, pointsX) => [...total, ...pointsX],
							[],
						),
						  ]
					: totalPoints,
			[],
		);

		console.log('Cluster Points', clusterPoints);

		return {
			...state,
			clusterPoints: clusterPoints,
		};
	default:
		return { ...state };
	}
};

export default rootReducer;
