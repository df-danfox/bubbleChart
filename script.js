//make variables global
var DeathRate = []
var Year = []
var Cause = []
var fiveCauses = ["Accident", "Cancer", "Influenza and Pneumonia", "Heart Disease", "Stroke"]

d3.csv("CDC_10yr_avg.csv", function(data){
  d3.select("body").selectAll("div")
    .data(data)
    .enter()
    .append("div")
    .text(function(d){
      return d.year;
    });
console.log (data)

data.forEach (d => {
    DeathRate.push(d.DeathRate);
    Cause.push(d.Cause);
    Year.push(d.year);})
});



var ColorScale = d3.scaleOrdinal(d3.schemeSet1)
  .domain(0,4)

  var width = 1200,
      height = 800;
  var svg,
      circles,
      circleSize = { min: 10, max: 80 };
  var circleRadiusScale = d3.scaleSqrt()
    .domain(DeathRate)
    .range([circleSize.min, circleSize.max]);

  var forces,
      forceSimulation;

  createSVG();
  toggleCauseKey();
  createCircles();
  createForces();
  createForceSimulation();
  // // addFlagDefinitions();
  // // addFillListener();
  addGroupingListeners();

  function createSVG() {
    svg = d3.select("#bubble-chart")
      .append("svg")
        .attr("width", width)
        .attr("height", height);
  }
// this is the legend at the bottom
  function toggleCauseKey(showCauseKey) {
    var keyElementWidth = 150,
        keyElementHeight = 30;
    var onScreenYOffset = keyElementHeight*1.5,
        offScreenYOffset = 100;

    if (d3.select(".Cause-key").empty()) {
      createCauseKey();
    }
    var CauseKey = d3.select(".Cause-key");

    if (showCauseKey) {
      translateCauseKey("translate(0," + (height - onScreenYOffset) + ")");
    } else {
      translateCauseKey("translate(0," + (height + offScreenYOffset) + ")");
    }

    function createCauseKey() {
      var keyWidth = keyElementWidth * fiveCauses.length;
      var CauseKeyScale = d3.scaleBand()
        .domain(fiveCauses)
        .range([(width - keyWidth) / 2, (width + keyWidth) / 2]);

      svg.append("g")
        .attr("class", "iveCauses")
        .attr("transform", "translate(0," + (height + offScreenYOffset) + ")")
        .selectAll("g")
        .data(fiveCauses)
        .enter()
          .append("g")
            .attr("class", "Cause-key-element");

      d3.selectAll("g.Cause-key-element")
        .append("rect")
          .attr("width", keyElementWidth)
          .attr("height", keyElementHeight)
          .attr("x", function(d) { return CauseKeyScale(d); })
          .attr("fill", function(d) { return ColorScale(d); });

      d3.selectAll("g.Cause-key-element")
        .append("text")
          .attr("text-anchor", "middle")
          .attr("x", function(d) { return CauseKeyScale(d) + keyElementWidth/2; })
          .text(function(d) { return causes[d]; });

      // The text BBox has non-zero values only after rendering
      d3.selectAll("g.Cause-key-element text")
          .attr("y", function(d) {
            var textHeight = this.getBBox().height;
            // The BBox.height property includes some extra height we need to remove
            var unneededTextHeight = 4;
            return ((keyElementHeight + textHeight) / 2) - unneededTextHeight;
          });
    }

    function translateCauseKey(translation) {
      CauseKey
        .transition()
        .duration(500)
        .attr("transform", translation);
    }
  }

  // function flagFill() {
  //   return isChecked();
  // }

  // function isChecked(elementID) {
  //   return d3.select(elementID).property(;
  // }

  function createCircles() {
    circles = svg.selectAll("circle")
      .data(DeathRate)
      .enter()
        .append("circle")
        .attr("r", function(d) { return circleRadiusScale(d.DeathRate); })
        .on("mouseover", function(d) {
          updatYearInfo(d);
        })
        .on("mouseout", function(d) {
          updateYearInfo();
        });
    updateCircles();

    function updateYearInfo(Year) {
      var info = "";
      if (Year) {
        info = [Year.causes, formatDeathRate(Year.DeathRate)].join(": ");
      }
      d3.select("#Year-info").html(info);
    }
  }

  function updateCircles() {
    circles
      .attr("fill", function(d) {
        return flagFill() ? "url(#" + d.Year + ")" : ColorScale(d.Cause);
      });
  }

  function createForces() {
    var forceStrength = 0.05;

    forces = {
      combine:        createCombineForces(),
      //countryCenters: createCountryCenterForces(),
      Cause:      createCauseForces(),
      //population:     createPopulationForces()
    };

    function createCombineForces() {
      return {
        x: d3.forceX(width / 2).strength(forceStrength),
        y: d3.forceY(height / 2).strength(forceStrength)
      };
    }

    // function createCountryCenterForces() {
    //   var projectionStretchY = 0.25,
    //       projectionMargin = circleSize.max,
    //       projection = d3.geoEquirectangular()
    //         .scale((width / 2 - projectionMargin) / Math.PI)
    //         .translate([width / 2, height * (1 - projectionStretchY) / 2]);

    //   return {
    //     x: d3.forceX(function(d) {
    //         return projection([d.CenterLongitude, d.CenterLatitude])[0];
    //       }).strength(forceStrength),
    //     y: d3.forceY(function(d) {
    //         return projection([d.CenterLongitude, d.CenterLatitude])[1] * (1 + projectionStretchY);
    //       }).strength(forceStrength)
    //   };
    // }

    function createCauseForces() {
      return {
        x: d3.forceX(CauseForceX).strength(forceStrength),
        y: d3.forceY(CauseForceY).strength(forceStrength)
      };

      function CauseForceX(d) {
        if (d.Cause === "fiveCauses [0]") {
          return left(width);
        } else if (d.Cause === "fiveCauses [1]") {
          return left(width);
        } else if (d.Cause === "fiveCauses [2]") {
          return right(width);
        } else if (d.Cause === "fiveCauses []3") {
          return right(width);
        }
        return center(width);
      }

      function CauseForceY(d) {
        if (d.Cause === "fiveCauses [0]") {
          return top(height);
        } else if (d.Cause === "fiveCauses [1]") {
          return bottom(height);
        } else if (d.Cause === "fiveCauses [2]") {
          return top(height);
        } else if (d.Cause === "fiveCauses [3]") {
          return bottom(height);
        }
        return center(height);
      }

      function left(dimension) { return dimension / 4; }
      function center(dimension) { return dimension / 2; }
      function right(dimension) { return dimension / 4 * 3; }
      function top(dimension) { return dimension / 4; }
      function bottom(dimension) { return dimension / 4 * 3; }
    }

    // function createPopulationForces() {
    //   var CauseDomain = Cause.values().map(function(Cause) {
    //     return Causes[Cause];
    //   });
    //   var scaledPopulationMargin = circleSize.max;

    //   populationScaleX = d3.scaleBand()
    //     .domain(continentNamesDomain)
    //     .range([scaledPopulationMargin, width - scaledPopulationMargin*2]);
    //   populationScaleY = d3.scaleLog()
    //     .domain(populationExtent)
    //     .range([height - scaledPopulationMargin, scaledPopulationMargin*2]);

    //   var centerCirclesInScaleBandOffset = populationScaleX.bandwidth() / 2;
    //   return {
    //     x: d3.forceX(function(d) {
    //         return populationScaleX(Causes[d.ContinentCode]) + centerCirclesInScaleBandOffset;
    //       }).strength(forceStrength),
    //     y: d3.forceY(function(d) {
    //       return populationScaleY(d.Population);
    //     }).strength(forceStrength)
    //   };
    // }

  }

  function createForceSimulation() {
    forceSimulation = d3.forceSimulation()
      .force("x", forces.combine.x)
      .force("y", forces.combine.y)
      .force("collide", d3.forceCollide(forceCollide));
    forceSimulation.nodes(Year)
      .on("tick", function() {
        circles
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
      });
  }

  // function forceCollide(d) {
  //   return countryCenterGrouping() || populationGrouping() ? 0 : circleRadiusScale(d.Population) + 1;
  // }

  // function countryCenterGrouping() {
  //   return isChecked("#country-centers");
  // }

  // function populationGrouping() {
  //   return isChecked("#population");
  // }

  // function addFlagDefinitions() {
  //   var defs = svg.append("defs");
  //   defs.selectAll(".flag")
  //     .data(countries)
  //     .enter()
  //       .append("pattern")
  //       .attr("id", function(d) { return d.CountryCode; })
  //       .attr("class", "flag")
  //       .attr("width", "100%")
  //       .attr("height", "100%")
  //       .attr("patternContentUnits", "objectBoundingBox")
  //         .append("image")
  //         .attr("width", 1)
  //         .attr("height", 1)
  //         // xMidYMid: center the image in the circle
  //         // slice: scale the image to fill the circle
  //         .attr("preserveAspectRatio", "xMidYMid slice")
  //         .attr("xlink:href", function(d) {
  //           return "flags/" + d.CountryCode + ".svg";
  //         });

  function addFillListener() {
    d3.selectAll('input[name="fill"]')
      .on("change", function() {
        toggleCauseKey(!flagFill());
        updateCircles();
      });
  }

  function addGroupingListeners() {
    addListener("#combine",         forces.combine);
    addListener("#Cause",      forces.Cause);


    function addListener(selector, forces) {
      d3.select(selector).on("click", function() {
        updateForces(forces);
        toggleCauseKey(!flagFill());

      });
    }

    function updateForces(forces) {
      forceSimulation
        .force("x", forces.x)
        .force("y", forces.y)
        .force("collide", d3.forceCollide(forceCollide))
        .alphaTarget(0.5)
        .restart();
    }
  }
