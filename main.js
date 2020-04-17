// Load the datasets and call the functions to make the visualizations

Promise.all([
  d3.csv('data/aiddata_countries_cumsum.csv', d3.autoType),
  d3.json('data/countries.json'),
]).then(([aiddata, geoJSON]) => {
  vis1(aiddata, d3.select('#vis1'));
  vis2(geoJSON, d3.select('#vis2'));
});
