# NBA Multi-Year Radar Dashboard

## Overview

This visualization is designed to provide an interactive, multi-view dashboard for exploring NBA player performance data over multiple years. The dashboard integrates several visualization components to help users gain insights into players’ performance metrics and team affiliations.

## Goals

- **Explore Multi-Year Performance:**  
  Allow users to see and compare key performance metrics for NBA players over multiple years.

- **Interactive Analysis:**  
  Enable users to interact with different visualization components (radar chart, line chart, pie chart) to discover detailed insights.

- **Dynamic Linking Across Views:**  
  Ensure that interactions in one visualization (e.g., hovering over a particular year in the line chart) update other views (e.g., highlighting the corresponding polygon in the radar chart and showing the team distribution in the pie chart).

## Supported User Tasks and Visualization Components

- **Task: Compare Performance Metrics Across Years**
  - **Radar Chart:**  
    - Displays a radar chart for the selected player showing eight performance metrics.
    - Interactive polygons update on hover to reveal specific year details.
    - The chart automatically cycles through players with a visible progress indicator.

- **Task: Examine Performance Trends Over Time**
  - **Line Chart:**  
    - Plots normalized performance metrics as separate lines over time.
    - Interactive hover on the line chart pauses the automatic player cycling.
    - Hovering over the line chart updates a shared `hoveredYear` state that highlights corresponding details in other views.

- **Task: Understand Team Affiliations**
  - **Pie Chart:**  
    - Displays a pie chart of the teams that a player has been on.
    - Uses a seeded color scheme so that even similar teams receive distinct colors.
    - On hover, slices expand and a tooltip appears; when the line chart’s hovered year is active, the corresponding team slice is highlighted with a thick border and an overlay card showing the team name.
    - The overlay card is dynamically sized based on the team name, and pointer events are disabled to avoid interaction lag.


## How to Test the Visualization

- **Automatic Cycling:**  
  Verify that the dashboard automatically cycles through different players and updates the radar chart, line chart, and pie chart accordingly.

- **Chart Interactions:**
  - Hover over the radar chart polygons to see the performance year highlighted with animated value labels.
  - Hover over the line chart to pause the cycling, update the hovered year, and observe the corresponding slice and team card in the pie chart.
  - Hover over the pie chart slices to see them expand and display a tooltip with team details.
  - Move the cursor across charts and verify that transitions (fade, stroke, and overlay card) animate independently and smoothly.

- **Visual Linking Across Components:**  
  Confirm that interactions in one component (like hovering over a specific year in the line chart) are reflected in the radar and pie charts (e.g., highlighting the corresponding radar polygon and team slice).
