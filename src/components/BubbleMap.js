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
          height: window.innerHeight * 0.8, // Slightly taller
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!data || !data.length || !dimensions.width || !dimensions.height) {
      console.log('Missing data or dimensions:', { data, dimensions });
      return;
    }

    console.log('Rendering bubble map with data:', data);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Process the data for the current timeframe
    const processedData = data.map(d => {
      const change = d.changes[timeframe] || 0;
      console.log(`Processing ${d.name}:`, {
        timeframe,
        rawChange: d.changes[timeframe],
        processedChange: change
      });
      return {
        ...d,
        value: Math.max(40, Math.abs(change)), // Larger minimum bubble size
        color: change >= 0 
          ? d3.interpolateRgb('#1b5e20', '#4caf50')(Math.min(Math.abs(change) / 100, 1)) // Green gradient
          : d3.interpolateRgb('#b71c1c', '#f44336')(Math.min(Math.abs(change) / 100, 1)) // Red gradient
      };
    });

    // Create bubble layout
    const bubble = d3.pack()
      .size([dimensions.width, dimensions.height])
      .padding(5); // More padding between bubbles

    // Process the data
    const root = d3.hierarchy({ children: processedData })
      .sum(d => d.value);

    const nodes = bubble(root).leaves();

    // Create container for bubbles
    const g = svg.append("g");

    // Create bubble groups with transition
    const bubbles = g.selectAll('.bubble')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'bubble')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // Add circles with animation
    bubbles.append('circle')
      .attr('r', 0) // Start with radius 0
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .attr('r', d => d.r)
      .style('fill', d => d.data.color)
      .style('opacity', 0.9)
      .style('stroke', '#fff')
      .style('stroke-width', '2px');

    // Add interactive elements
    bubbles.selectAll('circle')
      .style('cursor', 'pointer')
      .attr('data-tooltip-id', 'bubble-tooltip')
      .attr('data-tooltip-content', d => {
        const change = d.data.changes[timeframe];
        return `${d.data.name}\nChange: ${change ? change.toFixed(2) : '0'}%`;
      });

    // Add token name text
    bubbles.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.1em')
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .style('font-size', d => Math.min(d.r / 3, 16) + 'px')
      .style('pointer-events', 'none')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)')
      .text(d => d.data.name);

    // Add percentage text with animation
    bubbles.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .style('fill', 'white')
      .style('font-size', d => Math.min(d.r / 3.5, 14) + 'px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)')
      .text(d => {
        const change = d.data.changes[timeframe];
        return change ? `${change.toFixed(1)}%` : '0%';
      })
      .style('opacity', 0)
      .transition()
      .delay(1000)
      .duration(500)
      .style('opacity', 1);

  }, [data, dimensions, timeframe]);

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', bgcolor: '#1a1a1a' }}>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      <Tooltip id="bubble-tooltip" />
    </Box>
  );
};

export default BubbleMap;
