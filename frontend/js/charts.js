// D3.js Chart Functions
function createDamagePieChart(data, containerId = 'damage-pie-chart') {
    // Clear previous chart
    d3.select(`#${containerId}`).html('');

    const width = 250;
    const height = 200;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Color scale matching your Mapbox colors
    const colorScale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4])
        .range(['#cccccc','#2a630e', '#d1d569', '#d57438', '#cd2667']);

    // Prepare data for pie chart
    const pieData = Object.entries(data.building_count)
        .map(([category, count]) => ({
            category: parseInt(category),
            count: count,
            percentage: (count / data.total_buildings * 100).toFixed(1)
        }))
        .sort((a, b) => a.category - b.category);

    // Pie generator
    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    // Arc generator
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius - 10);

    // Create slices
    const slices = svg.selectAll('path')
        .data(pie(pieData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => colorScale(d.data.category))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('opacity', 0.8);

    // Add hover effects
    slices.on('mouseover', function(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr('transform', 'scale(1.1)')
            .style('opacity', 1);

        // Show tooltip
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'chart-tooltip')
            .style('opacity', 0);

        tooltip.html(`
            <strong>Category ${d.data.category}</strong><br>
            ${d.data.count.toLocaleString()} buildings<br>
            ${d.data.percentage}%
        `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px')
            .transition()
            .duration(200)
            .style('opacity', 0.9);
    })
        .on('mouseout', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('transform', 'scale(1)')
                .style('opacity', 0.8);

            // Remove tooltip
            d3.selectAll('.chart-tooltip').remove();
        });

    // Add labels
    const labelArc = d3.arc()
        .innerRadius(radius - 40)
        .outerRadius(radius - 40);

    svg.selectAll('text')
        .data(pie(pieData))
        .enter()
        .append('text')
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .text(d => `${d.data.percentage}%`)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#333');
}