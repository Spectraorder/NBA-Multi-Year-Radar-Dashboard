# NBA Multi-Year Radar Dashboard

## Overview

This interactive visualization provides a multi-view dashboard for exploring NBA player performance data over multiple seasons. The dashboard brings together several visualization components and filtering options, allowing users to dive into players’ performance metrics, team affiliations, and career spans.

## Live Demo

Access the live version of the dashboard here:  
[https://spectraorder.github.io/NBA-Multi-Year-Radar-Dashboard/](https://spectraorder.github.io/NBA-Multi-Year-Radar-Dashboard/)

## Goals

- **Explore Multi-Year Performance:**  
  Enable users to inspect and compare key performance metrics for NBA players over different seasons.

- **Interactive Analysis:**  
  Allow users to interact with different visualization components—including radar, line, and pie charts—while filtering results by team, single-team experience, and year range.

- **Dynamic Linking Across Views:**  
  Ensure that user interactions in one view (e.g., hover events on the line chart) automatically update corresponding details in other views (such as highlighting the relevant polygon in the radar chart or team slice in the pie chart).

## Supported User Tasks and Visualization Components

- **Task: Compare Performance Metrics Across Seasons**
  - **Radar Chart:**  
    - Displays a radar chart for the selected player, showing eight key performance metrics.
    - Interactive polygons update on hover to reveal performance details for individual seasons.
    - Auto-cycling of player data has been replaced with manual selection for a static view, providing more direct user control.

- **Task: Examine Performance Trends Over Time**
  - **Line Chart:**  
    - Plots normalized performance metrics over time, with each metric represented by a separate line.
    - Interactive hover on the line chart pauses any cycling and updates a shared `hoveredYear` state that influences other charts.
    - This highlights corresponding details across the radar and pie charts.

- **Task: Understand Team Affiliations and Career Profiles**
  - **Pie Chart:**  
    - Displays the distribution of teams that a selected player has been a part of.
    - Uses a seeded color scheme to distinguish teams, ensuring even closely related teams appear unique.
    - Hovering over slices expands the segment and shows a tooltip with team details and highlights the corresponding season’s data.
  - **Team and Single-Team Filtering:**  
    - A team selection dropdown filters the players list to only those from the selected team or shows all players if “All Teams” is chosen.
    - An additional checkbox ("Single Team Only") limits the player list to those who have played for only one team over their career.
  - **Year Range Slider:**  
    - Two range sliders let users define a start and end year.
    - The dashboard filters the available data based on the selected years, allowing users to focus on a specific period of NBA history.

- **Task: Cross-Component Visual Linking**
  - **Dynamic Filtering and Updates:**  
    - Changes in team, player, or year range filters update all visualization components simultaneously.
    - Hovering in one component (like the line chart) highlights related data in the radar chart and pie chart, supporting a cohesive exploratory experience.

## How to Test the Visualization

- **Filtering and Selection Controls:**  
  - Use the team dropdown to filter the list of players to those who played for a particular team.  
  - Toggle the "Single Team Only" checkbox to view only those players who have played for a single team throughout their careers.  
  - Adjust the year range sliders to focus on a specific period. Verify that all charts update to reflect the filtered data.

- **Chart Interactions:**  
  - Hover over the radar chart polygons to see season-specific performance metrics and observe animated value labels.
  - Hover over the line chart; the relevant year will be highlighted in all views.
  - Interact with the pie chart slices to see them expand and display team-specific tooltips.

- **Visual Linking:**  
  - Confirm that selecting a team, a player, or a specific year range consistently updates all the visualization components.  
  - Ensure that hover actions in one chart are appropriately reflected in the others.

