  // construct our labeler variables
  let anchor_array = []
  let label_array = []
  let anchor_data, labels, circ, links, bounds;

function redrawLabels() {
  // Redraw labels and leader lines

  labels
  .transition()
  .duration(800)
  .attr("x", function(d) { return (d.x); })
  .attr("y", function(d) { return (d.y); });

  links
  .transition()
  .duration(800)
  .attr("x2",function(d) { return (d.x); })
  .attr("y2",function(d) { return (d.y); });
}


function vis1(data, div) {
  const data2012 = data.filter(d=>d.year == 2012)
  const margin = {top: 40, right: 20, bottom: 40, left: 100};

  const visWidth = 760 - margin.left - margin.right;
  const visHeight = 700 - margin.top - margin.bottom;

  const x_mean = visWidth/2
  const y_mean = visHeight/2
  const offset = 4
  const radius = 4

  let regions = new Set()
  data2012.forEach(d=>regions.add(d.country_region))

  const svg = div.append('svg')
      .attr('width', visWidth + margin.left + margin.right)
      .attr('height', visHeight + margin.top + margin.bottom);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // add title

  g.append("text")
    .attr("x", visWidth / 2)
    .attr("y", -margin.top)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .attr("font-family", "sans-serif")
    .attr("font-size", "16px")
    .text("Aid Given vs Aid Received");

  // create scales

  const threshold = 10000
  
  const x = d3.scaleLog()
      .domain([threshold, d3.max(data2012, d => d.received)]).nice()
      .range([0, visWidth]);
  
  const y = d3.scaleLog()
      .domain([threshold, d3.max(data2012, d => d.donated)]).nice()
      .range([visHeight, 0]);
  
  const region_colors = d3.scaleOrdinal()
      .domain(regions)
      .range(d3.schemeCategory10)

  // Create our labeler arrays

  data2012.forEach(d=>{
    anchor_array.push({
      x: d.received <= threshold ? x(threshold) : x(d.received), 
      y: d.donated <= threshold ? y(threshold) : y(d.donated), 
      r: radius,
      region: d.country_region});
    label_array.push({
      x: d.received <= threshold ? x(threshold) : x(d.received), 
      y: d.donated <= threshold ? y(threshold) : y(d.donated), 
      name: d.country, 
      width: 0.0, 
      height: 0.0});
  })

  // create and add axes

  const xAxis = d3.axisBottom(x).ticks(6).tickFormat(d3.formatPrefix(".1", 1e6))
  const yAxis = d3.axisLeft(y).ticks(6).tickFormat(d3.formatPrefix(".1", 1e6))
    
  g.append("g")
      .attr("transform", `translate(0, ${visHeight})`)
      .call(xAxis)
      .call(g => g.selectAll(".domain").remove())
    .append("text")
      .attr("x", visWidth / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Aid Received");
  
  g.append("g")
      .call(yAxis)
      .call(g => g.selectAll(".domain").remove())
    .append("text")
      .attr("x", -50)
      .attr("y", visHeight / 2)
      .attr("fill", "black")
      .attr("dominant-baseline", "middle")
      .text("Aid Given");
  
  // add legend
  
  // draw grid, based on https://observablehq.com/@d3/scatterplot
  
  const grid = g.append("g")
      .attr("class", "grid");
  
  grid.append("g")
    .selectAll("line")
    .data(y.ticks(6))
    .join("line")
      .attr("stroke", "#dcdcdc")
      .attr("x1", 0)
      .attr("x2", visWidth)
      .attr("y1", d => 0.5 + y(d))
      .attr("y2", d => 0.5 + y(d));
  
  grid.append("g")
    .selectAll("line")
    .data(x.ticks(6))
    .join("line")
      .attr("stroke", "#dcdcdc")
      .attr("x1", d => 0.5 + x(d))
      .attr("x2", d => 0.5 + x(d))
      .attr("y1", d => 0)
      .attr("y2", d => visHeight);
  
  // Draw Diagonal Line

  g.append("g")
    .selectAll("line")
    .data(x.ticks())
    .join("line")
      .attr("stroke", "steelblue")
      .attr("stroke-opacity", "0.1")
      .attr("x1", d => x(threshold))
      .attr("x2", d => visWidth)
      .attr("y1", visHeight)
      .attr("y2", 0)
      .attr("stroke-dasharray", "5,5")

  // Draw anchors
  anchors = g.selectAll(".dot")
    .data(anchor_array)
    .enter()
    .append("circle")
      .attr("class", "dot")
      .attr("r", function(d) { return (d.r); })
      .attr("cx", function(d) { return (d.x); })
      .attr("cy", function(d) { return (d.y); })
      .attr("fill", d=>region_colors(d.region));

  // Draw labels
  labels = g.selectAll(".label")
    .data(label_array)
    .enter()
    .append("text")
      .attr("class", "label")
      .attr('text-anchor', 'start')
      .attr("font-size", 10)
      .text(function(d) { return d.name; })
      .attr("x", function(d) { return (d.x); })
      .attr("y", function(d) { return (d.y); })
      .attr("fill", "black");

  // Size of each label
  var index = 0;
  labels.each(function() {
      label_array[index].width = this.getBBox().width;
      label_array[index].height = this.getBBox().height;
      index += 1;
  });
  // labels.forEach((d,i) => {
  //     label_array[i].width = d.getBBox().width;
  //     label_array[i].height = d.getBBox().height;
  // });

  // Draw data points
  circ = g.selectAll(".circ")
    .data(label_array)
    .enter()
    .append("circle")
      .attr("class", ".circ")
      .attr("r", radius)
      .attr("cx", function(d) { return (d.x); })
      .attr("cy", function(d) { return (d.y - offset); })
      .style("fill", 'red')
      .attr('opacity',0.0);

  // Draw links
  links = g.selectAll(".link")
    .data(label_array)
    .enter()
    .append("line")
      .attr("class", "link")
      .attr("x1", function(d) { return (d.x); })
      .attr("y1", function(d) { return (d.y); })
      .attr("x2", function(d) { return (d.x); })
      .attr("y2", function(d) { return (d.y); })
      .attr("stroke-width", 0.6)
      .attr("stroke", "gray");

  var sim_ann = d3.labeler()
    .label(label_array)
    .anchor(anchor_array)
    .width(visWidth)
    .height(visHeight)
    sim_ann.start(100);
      
  redrawLabels();
}