import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';
import { Tooltip } from 'react-tooltip';

const BubbleMap = ({ data, timeframe }) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef();

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: window.innerHeight * 0.8,
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!data || !data.length || !dimensions.width || !dimensions.height) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Process data for visualization
    const processedData = data.map(token => {
      const change = token.changes[timeframe] || 0;
      return {
        name: token.name,
        value: Math.abs(change), // Use absolute value for size
        actualChange: change,    // Keep actual value for color and display
        id: token.id
      };
    });

    // Create bubble layout
    const bubble = d3.pack()
      .size([dimensions.width, dimensions.height])
      .padding(2);

    // Hierarchy
    const root = d3.hierarchy({ children: processedData })
      .sum(d => Math.max(30, Math.sqrt(Math.abs(d.value)) * 20)) // Adjusted size scaling
      .sort((a, b) => b.value - a.value);

    bubble(root);

    // Create a color scale
    const colorScale = d3.scaleLinear()
      .domain([-50, 0, 50])  // Adjusted for better color distribution
      .range(['#ef5350', '#ef5350', '#4caf50'])  // Red for negative, green for positive
      .clamp(true);

    // Create container
    const bubbleGroup = svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g');

    // Create bubbles
    const bubbles = bubbleGroup
      .selectAll('g')
      .data(root.children)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // Add circles
    bubbles
      .append('circle')
      .attr('r', d => d.r)
      .style('fill', d => colorScale(d.data.actualChange))
      .style('opacity', 0.8)
      .style('stroke', d => d3.color(colorScale(d.data.actualChange)).darker(0.5))
      .style('stroke-width', 2)
      .style('cursor', 'pointer')
      .attr('data-tooltip-id', 'bubble-tooltip')
      .attr('data-tooltip-content', d => {
        const change = d.data.actualChange;
        const sign = change >= 0 ? '+' : '';
        return `${d.data.name}\n${sign}${change.toFixed(1)}%`;
      });

    // Add token names
    bubbles
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.1em')
      .style('fill', 'white')
      .style('font-size', d => Math.min(d.r / 3, 16) + 'px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)')
      .text(d => d.data.name);

    // Add percentage changes
    bubbles
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .style('fill', 'white')
      .style('font-size', d => Math.min(d.r / 3, 14) + 'px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)')
      .text(d => {
        const change = d.data.actualChange;
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}%`;
      });

  }, [data, dimensions, timeframe]);

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', bgcolor: '#1a1a1a' }}>
      <svg ref={svgRef} />
      <Tooltip id="bubble-tooltip" />
    </Box>
  );
};

export default BubbleMap;
