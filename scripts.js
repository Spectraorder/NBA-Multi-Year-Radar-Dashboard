const { useState, useEffect, useRef, useMemo, useCallback } = React;

function PlayerInfo({ name, team, rank }) {
  const [displayName, setDisplayName] = useState(name);
  const [displayTeam, setDisplayTeam] = useState(team);
  const [displayRank, setDisplayRank] = useState(rank);
  const [animClass, setAnimClass] = useState("fade-in");

  useEffect(() => {
    if (name !== displayName || team !== displayTeam || rank !== displayRank) {
      // Trigger fade-out
      setAnimClass("fade-out");
      const timeout = setTimeout(() => {
        setDisplayName(name);
        setDisplayTeam(team);
        setDisplayRank(rank);
        setAnimClass("fade-in");
      }, 500); // Duration should match your CSS fade-out duration
      return () => clearTimeout(timeout);
    }
  }, [name, team, rank, displayName, displayTeam, displayRank]);

  return (
    <div className={`player-info ${animClass}`}>
      <div className="player-name-text">{displayName}</div>
      {displayTeam && (
        <div className="team-info">
          {displayTeam} (Rank: {displayRank})
        </div>
      )}
    </div>
  );
}


function RadarDashboard() {
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hoveredYear, setHoveredYear] = useState(null);
  const pausedRef = useRef(false);

  // Hide the external chart title and nowShowing elements when the component mounts.
  useEffect(() => {
    const chartTitleEl = document.getElementById("chartTitle");
    if (chartTitleEl) {
      chartTitleEl.style.display = "none";
    }
    const nowShowingEl = document.getElementById("nowShowing");
    if (nowShowingEl) {
      nowShowingEl.style.display = "none";
    }
  }, []);

  // Keep pausedRef in sync with paused state.
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Load CSV data on mount.
  useEffect(() => {
    d3.csv("mvp_1981-2020.csv").then(rawData => {
      rawData.forEach(d => {
        d.Year = +d.Year;
        d["Pts Won"] = +d["Pts Won"];
        d["Pts Max"] = +d["Pts Max"];
        d.PTS = +d.PTS;
        d.TRB = +d.TRB;
        d.AST = +d.AST;
        d.STL = +d.STL;
        d.BLK = +d.BLK;
        d.TOV = +d.TOV;
      });
      setData(rawData);
    });
  }, []);

  // Create sorted list of unique players.
  const players = useMemo(() => {
    return Array.from(new Set(data.map(d => d.Player))).sort();
  }, [data]);

  // Memoize metrics and global min/max values.
  const metrics = useMemo(() => ["Pts Won", "Pts Max", "PTS", "TRB", "AST", "STL", "BLK", "TOV"], []);
  const { globalMaxValues, globalMinValues } = useMemo(() => {
    const maxValues = {};
    const minValues = {};
    if (data.length > 0) {
      metrics.forEach(metric => {
        maxValues[metric] = d3.max(data, d => +d[metric]) || 1;
        minValues[metric] = d3.min(data, d => +d[metric]) || 0;
      });
    }
    return { globalMaxValues: maxValues, globalMinValues: minValues };
  }, [data, metrics]);

  // Update selected player when currentIndex changes.
  useEffect(() => {
    if (players.length === 0) return;
    setSelectedPlayer(players[currentIndex]);
  }, [players, currentIndex]);

  // Combined interval: update progress every 50ms and advance player when progress reaches 1 (3000ms total).
  useEffect(() => {
    if (players.length === 0) return;
    const tick = 50;
    const totalDuration = 3000;
    const interval = setInterval(() => {
      if (!pausedRef.current) {
        setProgress(prev => {
          const newProgress = prev + tick / totalDuration;
          if (newProgress >= 1) {
            setCurrentIndex(prevIndex => {
              const nextIndex = (prevIndex + 1) % players.length;
              setSelectedPlayer(players[nextIndex]);
              return nextIndex;
            });
            return 0;
          }
          return newProgress;
        });
      }
    }, tick);
    return () => clearInterval(interval);
  }, [players]);

  // Reset progress when selectedPlayer changes.
  useEffect(() => {
    setProgress(0);
  }, [selectedPlayer]);

  // Stabilize event callbacks.
  // const handlePolygonHover = useCallback(() => setPaused(true), []);
  // const handlePolygonOut = useCallback(() => setPaused(false), []);

  const handlePolygonHover = useCallback((year) => {
    setPaused(true);
    setHoveredYear(year);
  }, []);

  const handlePolygonOut = useCallback(() => {
    setPaused(false);
    setHoveredYear(null);
  }, []);

  // Filter records for the selected player.
  const playerRecords = useMemo(
    () => data.filter(d => d.Player === selectedPlayer),
    [data, selectedPlayer]
  );

  const handleLineHover = useCallback((year) => {
    setHoveredYear(year);
    setPaused(year !== null);
  }, []);

  // Compute the latest record for the selected player.
  const latestRecord = useMemo(() => {
    if (playerRecords.length === 0) return null;
    return playerRecords.reduce((acc, d) => (d.Year > acc.Year ? d : acc), playerRecords[0]);
  }, [playerRecords]);

  return (
    <div className="dashboard-container">
      <div className="chart-wrapper">
        <PlayerInfo 
          name={selectedPlayer} 
          team={latestRecord ? latestRecord.Team : ""} 
          rank={latestRecord ? latestRecord.Team_Rank : ""}
        />
        <div className="radar-chart-container">
          <RadarChart 
            playerData={playerRecords} 
            metrics={metrics}
            globalMaxValues={globalMaxValues} 
            globalMinValues={globalMinValues} 
            onPolygonHover={handlePolygonHover}
            onPolygonOut={handlePolygonOut}
            hoveredYear={hoveredYear}
          />
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress * 100}%` }}></div>
        </div>
      </div>
      <div className="bottom-charts">
        <div className="line-chart-wrapper">
          {playerRecords.length > 0 && (
            <LineChart 
              playerData={playerRecords} 
              metrics={metrics}
              globalMinValues={globalMinValues}
              globalMaxValues={globalMaxValues}
              hoveredYear={hoveredYear}
              onLineHover={handleLineHover}
            />
          )}
        </div>
        <div className="pie-chart-wrapper">
          {playerRecords.length > 0 && (
            <PieChart 
              playerData={playerRecords} 
              hoveredYear={hoveredYear} 
              onPieHover={setPaused} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PieChart({ playerData, hoveredYear, onPieHover }) {
  const ref = useRef();

  // Helper: Hash a string into a number between 0 and 1.
  function hashStringToNumber(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (hash >>> 0) / 4294967295;
  }

  // Draw the pie chart initially.
  useEffect(() => {
    if (!playerData || playerData.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = 300,
          height = 300,
          radius = Math.min(width, height) / 2;

    svg.attr("width", width)
       .attr("height", height)
       .style("overflow", "visible");

    // Append a group and center it.
    const g = svg.append("g")
                 .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Group the player's records by Team (array of [team, count] pairs).
    const teamCounts = d3.rollups(playerData, v => v.length, d => d.Team);
    const teamNames = teamCounts.map(d => d[0]);
    // Generate a seed from the player's name.
    const playerName = playerData[0].Player || "";
    const base = hashStringToNumber(playerName);

    // Create a seeded ordinal color scale using d3.interpolateRainbow.
    const color = d3.scaleOrdinal()
      .domain(teamNames)
      .range(teamNames.map((team, i) => d3.interpolateRainbow((base + i / teamNames.length) % 1)));

    // Create a pie generator that doesn't sort the data.
    const pieGenerator = d3.pie()
      .value(d => d[1])
      .sort(null);
    const pieData = pieGenerator(teamCounts);

    // Create arc generators.
    const arcGenerator = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);
    const arcHover = d3.arc()
      .innerRadius(0)
      .outerRadius(radius + 10);

    // Remove any existing tooltip.
    d3.select(".pie-tooltip").remove();
    // Create a tooltip div appended to the body.
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "pie-tooltip")
      .style("position", "absolute")
      .style("background", "#333")
      .style("color", "#fff")
      .style("padding", "5px 10px")
      .style("border-radius", "5px")
      .style("visibility", "hidden")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    // Append arcs with interactivity.
    g.selectAll("path")
      .data(pieData)
      .enter()
      .append("path")
      .attr("d", arcGenerator)
      .attr("fill", d => color(d.data[0]))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("opacity", 0.8)
      .on("mouseover", function(event, d) {
          d3.select(this)
            .transition("arcTransition")
            .duration(200)
            .attr("d", arcHover);
          tooltip.style("visibility", "visible")
                 .html(`<strong>${d.data[0]}</strong><br>Count: ${d.data[1]}`);
          if (onPieHover) onPieHover(true);
      })
      .on("mousemove", function(event) {
          requestAnimationFrame(() => {
            tooltip.style("top", (event.pageY - 10) + "px")
                   .style("left", (event.pageX + 10) + "px");
          });
      })
      .on("mouseout", function(event, d) {
          d3.select(this)
            .transition("arcTransition")
            .duration(200)
            .attr("d", arcGenerator);
          tooltip.style("visibility", "hidden");
          if (onPieHover) onPieHover(false);
      });
  }, [playerData, onPieHover]);

  // Update highlighting and display a team card based on hoveredYear.
  useEffect(() => {
    if (!playerData || playerData.length === 0) return;
    // Determine the team corresponding to the hovered year.
    const hoveredTeam = hoveredYear !== null 
      ? (playerData.find(d => d.Year === hoveredYear) || {}).Team 
      : null;
    const width = 300,
          height = 300,
          radius = Math.min(width, height) / 2;
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

    const svg = d3.select(ref.current);
    const paths = svg.selectAll("path");

    // Use a named transition for stroke updates.
    paths.transition("strokeTransition").duration(200)
      .attr("stroke", d => (hoveredTeam && d.data[0] === hoveredTeam) ? "black" : "#fff")
      .attr("stroke-width", d => (hoveredTeam && d.data[0] === hoveredTeam) ? 4 : 2);

    // Bring the matching slice to the front.
    if (hoveredTeam) {
      paths.filter(d => d.data[0] === hoveredTeam).raise();
    }

    // Remove any existing card.
    const g = svg.select("g"); // The main group in the center.
    g.selectAll(".hover-card").remove();

    // If hoveredTeam is set, append a dynamically sized card.
    if (hoveredTeam) {
      // Create a new group for the card with initial opacity 0 and disable pointer events.
      const cardGroup = g.append("g")
                         .attr("class", "hover-card")
                         .style("opacity", 0)
                         .style("pointer-events", "none");

      // Append text for the team name (to measure it).
      const textElement = cardGroup.append("text")
        .text(hoveredTeam)
        .attr("font-size", "14px")
        .attr("fill", "#000");

      // Measure the text bounding box.
      const textBBox = textElement.node().getBBox();
      const cardWidth = textBBox.width + 20;  // horizontal padding
      const cardHeight = textBBox.height + 10; // vertical padding

      // Insert a rectangle behind the text with dynamic dimensions.
      cardGroup.insert("rect", "text")
        .attr("width", cardWidth)
        .attr("height", cardHeight)
        .attr("fill", "#fff")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("rx", 5)
        .attr("ry", 5);

      // Center the text inside the rectangle.
      textElement
        .attr("x", cardWidth / 2)
        .attr("y", cardHeight / 2)
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle");

      // Center the card group over the pie chart with a smooth fade-in.
      cardGroup.attr("transform", `translate(${-cardWidth / 2}, ${-cardHeight / 2})`)
        .transition("cardTransition")
        .duration(200)
        .style("opacity", 1);
    }
  }, [hoveredYear, playerData]);

  return <svg ref={ref}></svg>;
}


function LineChart({ playerData, metrics, globalMinValues, globalMaxValues, hoveredYear, onLineHover }) {
  const ref = useRef();

  useEffect(() => {
    if (!playerData || playerData.length === 0) return;
    
    const svg = d3.select(ref.current);
    const margin = { top: 20, right: 100, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Set SVG dimensions.
    svg.attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom);

    // Fade out and remove all existing content groups.
    const oldContents = svg.selectAll("g.content");
    if (!oldContents.empty()) {
      oldContents
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    }

    // Ensure the axes group exists.
    let axes = svg.select("g.axes");
    if (axes.empty()) {
      axes = svg.append("g")
                .attr("class", "axes")
                .attr("transform", `translate(${margin.left},${margin.top})`);
      axes.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0,${height})`);
      axes.append("g")
          .attr("class", "y-axis");
    }

    // Create new content group for updated lines (with fade in).
    const content = svg.append("g")
      .attr("class", "content")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .style("opacity", 0);

    // Define scales.
    const years = playerData.map(d => d.Year);
    const x = d3.scaleLinear()
      .domain(d3.extent(years))
      .range([0, width]);
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    // Update axes.
    axes.select("g.x-axis")
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")));
    axes.select("g.y-axis")
      .call(d3.axisLeft(y));

    // Define color scale.
    const color = d3.scaleOrdinal()
      .domain(metrics)
      .range(d3.schemeCategory10);

    // For each metric, draw the line, circles, and label.
    metrics.forEach(metric => {
      const sortedData = playerData.slice().sort((a, b) => a.Year - b.Year);
      const lineData = sortedData.map(d => {
        const minVal = globalMinValues[metric];
        const maxVal = globalMaxValues[metric];
        const norm = maxVal === minVal ? 0.5 : (d[metric] - minVal) / (maxVal - minVal);
        return { Year: d.Year, value: norm };
      });
      if (lineData.length === 0) return;
      const lineGenerator = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

      // Draw the line.
      content.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", color(metric))
        .attr("stroke-width", 2)
        .attr("d", lineGenerator);

      // Draw circles for each data point.
      content.selectAll("circle." + metric.replace(/\s/g, ''))
        .data(lineData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.Year))
        .attr("cy", d => y(d.value))
        .attr("r", 3)
        .attr("fill", color(metric));

      // Append a label at the last point of the line.
      const lastPoint = lineData[lineData.length - 1];
      if (lastPoint) {
        content.append("text")
          .attr("x", x(lastPoint.Year) + 5)
          .attr("y", y(lastPoint.value))
          .attr("fill", color(metric))
          .attr("font-size", "10px")
          .text(metric);
      }
    });

    // Fade in the new content group.
    content.transition().duration(500).style("opacity", 1);

    // Manage the hover line in a separate group that doesn't fade.
    svg.select("g.hover-line-group").remove();
    if (hoveredYear !== null) {
      svg.append("g")
         .attr("class", "hover-line-group")
         .append("line")
         .attr("x1", x(hoveredYear) + margin.left)
         .attr("x2", x(hoveredYear) + margin.left)
         .attr("y1", margin.top)
         .attr("y2", height + margin.top)
         .attr("stroke", "black")
         .attr("stroke-dasharray", "4,4")
         .attr("stroke-width", 1);
    }

    // Add interactivity on the SVG for hover events.
    svg.on("mousemove", function(event) {
      const [mx] = d3.pointer(event);
      const xPos = mx - margin.left;
      if (xPos < 0 || xPos > width) return;
      const year = x.invert(xPos);
      if (onLineHover) {
        onLineHover(Math.round(year));
      }
    })
    .on("mouseleave", function() {
      if (onLineHover) {
        onLineHover(null);
      }
    });
  }, [playerData, metrics, globalMinValues, globalMaxValues, hoveredYear, onLineHover]);

  return <svg ref={ref}></svg>;
}


function RadarChart({ playerData, metrics, globalMaxValues, globalMinValues, onPolygonHover, onPolygonOut, hoveredYear }) {
  const ref = useRef();
  const width = 500, height = 500, radius = Math.min(width, height) / 2 - 60, levels = 5;
  const angleSlice = (Math.PI * 2) / metrics.length;

  // Static Chart Setup
  useEffect(() => {
    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height);
    const chartGroup = svg.append("g")
      .attr("class", "chartGroup")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);
    for (let i = 0; i <= levels; i++) {
      const r = (radius * i) / levels;
      chartGroup.append("circle")
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#CDCDCD")
        .attr("stroke-width", 0.5);
    }
    metrics.forEach((m, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      chartGroup.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#CDCDCD")
        .attr("stroke-width", 1);
      chartGroup.append("text")
        .attr("x", (radius + 20) * Math.cos(angle))
        .attr("y", (radius + 20) * Math.sin(angle))
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .text(m);
    });
    chartGroup.append("text")
      .attr("id", "centerText")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "32px")
      .attr("fill", "#333")
      .attr("opacity", 0)
      .style("pointer-events", "none")
      .text("");
  }, [metrics, angleSlice, radius, levels, width, height]);

  // Dynamic Update for Polygons
  useEffect(() => {
    const svg = d3.select(ref.current);
    const chartGroup = svg.select("g.chartGroup");
    const color = d3.scaleOrdinal()
      .domain(playerData.map(d => d.Year))
      .range(d3.schemeCategory10);
    const radarLine = d3.lineRadial()
      .radius(d => d.value * radius)
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);
    const computeDataValues = (record) => metrics.map(m => {
      const value = +record[m];
      const minVal = globalMinValues[m];
      const maxVal = globalMaxValues[m];
      return { axis: m, value: maxVal === minVal ? 0.5 : (value - minVal) / (maxVal - minVal) };
    });

    const polygons = chartGroup.selectAll("path.radarPolygon")
      .data(playerData, (d, i) => i);
    polygons.exit()
      .transition()
      .duration(500)
      .style("opacity", 0)
      .remove();
    polygons.transition()
      .duration(500)
      .attr("d", d => radarLine(computeDataValues(d)));
    polygons.enter()
      .append("path")
      .attr("class", "radarPolygon")
      .attr("fill", d => color(d.Year))
      .attr("fill-opacity", 0.3)
      .attr("stroke", d => color(d.Year))
      .attr("stroke-width", 2)
      .attr("d", d => radarLine(metrics.map(m => ({ axis: m, value: 0 }))))
      .on("mouseover", function(event, d) {
        d3.select(this).attr("fill-opacity", 0.6);
        if (onPolygonHover) onPolygonHover(d.Year);
        const centerText = chartGroup.select("#centerText");
        centerText.text(d.Year)
          .interrupt()
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr("opacity", 1)
          .attr("font-size", "40px");
      })
      .on("mouseout", function(event, d) {
        d3.select(this).attr("fill-opacity", 0.3);
        if (onPolygonOut) onPolygonOut();
        const centerText = chartGroup.select("#centerText");
        centerText.interrupt()
          .transition()
          .duration(300)
          .ease(d3.easeCubicIn)
          .attr("opacity", 0)
          .attr("font-size", "32px")
          .on("end", () => { centerText.text(""); });
      })
      .transition()
      .duration(500)
      .attr("d", d => radarLine(computeDataValues(d)));
    svg.select("#centerText").raise();
    svg.on("mouseleave", () => {
      if (onPolygonOut) onPolygonOut();
    });
  }, [playerData, globalMaxValues, globalMinValues, metrics, angleSlice, radius, onPolygonHover, onPolygonOut]);

  // New Effect: Update hover effect based on hoveredYear.
  useEffect(() => {
    const svg = d3.select(ref.current);
    const chartGroup = svg.select("g.chartGroup");
    // Remove any existing value labels.
    chartGroup.selectAll(".value-labels").remove();
  
    if (hoveredYear !== null) {
      // Update center text.
      const centerText = chartGroup.select("#centerText");
      centerText.text(hoveredYear)
        .interrupt()
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr("opacity", 1)
        .attr("font-size", "40px");
  
      // For each polygon, update fill opacity.
      chartGroup.selectAll("path.radarPolygon")
        .attr("fill-opacity", d => d.Year === hoveredYear ? 0.6 : 0.3);
  
      // Find the polygon that matches hoveredYear and add value labels.
      const targetData = chartGroup.selectAll("path.radarPolygon").filter(d => d.Year === hoveredYear).data();
      if (targetData.length) {
        const d = targetData[0];
        // Create a group for the value labels.
        const labelGroup = chartGroup.append("g").attr("class", "value-labels");
        metrics.forEach((m, i) => {
          const value = d[m];
          const minVal = globalMinValues[m];
          const maxVal = globalMaxValues[m];
          let norm = maxVal === minVal ? 0.5 : (value - minVal) / (maxVal - minVal);
          const minNorm = 0.3;
          norm = Math.max(norm, minNorm);
          const angle = i * ((Math.PI * 2) / metrics.length) - Math.PI / 2;
          const x = norm * radius * Math.cos(angle);
          const y = norm * radius * Math.sin(angle);
          labelGroup.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("fill", "#000")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .text(value)
            .transition()
            .duration(300)
            .ease(d3.easeCubicOut)
            .style("opacity", 1);
        });
      }
    } else {
      // Revert center text.
      const centerText = chartGroup.select("#centerText");
      centerText.interrupt()
        .transition()
        .duration(300)
        .ease(d3.easeCubicIn)
        .attr("opacity", 0)
        .attr("font-size", "32px")
        .on("end", () => { centerText.text(""); });
      chartGroup.selectAll("path.radarPolygon")
        .attr("fill-opacity", 0.3);
    }
  }, [hoveredYear]);

  return <svg ref={ref}></svg>;
}


ReactDOM.render(<RadarDashboard />, document.getElementById("chartContainer"));
