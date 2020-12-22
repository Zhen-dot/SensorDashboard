import Chart from "chart.js";
import {Circle, SemiCircle} from "progressbar.js";

function getTime(time) {
    return new Date(time).toLocaleTimeString()
}

function initChart(ctx, title, data, limit) {
    if (data.length > limit) data = data.slice(0, limit);
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => getTime(d.time)),
            datasets: [{
                label: 'Temperature',
                yAxisID: 'Temperature',
                data: data.map(d => d.temperature.toFixed(2)),
                borderColor: 'rgba(255, 165, 0, 1)',
                backgroundColor: 'rgba(255, 165, 0, 0.2)'
            }, {
                label: 'Humidity',
                yAxisID: 'Humidity',
                data: data.map(d => d.humidity.toFixed(2)),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)'
            },
            ]
        },
        options: {
            title: {
                display: true,
                text: title
            },
            scales: {
                yAxes: [{
                    id: 'Temperature',
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        suggestedMin: 15,
                        suggestedMax: 35
                    }
                }, {
                    id: 'Humidity',
                    type: 'linear',
                    position: 'right',
                    ticks: {
                        suggestedMin: 50,
                        suggestedMax: 85
                    }
                }]
            },
            elements: {
                point: {
                    radius: 0
                }
            },
        }
    })
}

function initCircle(mode, container) {
    switch (mode) {
        case "tem": {
            return new Circle(container, {
                strokeWidth: 9,
                trailColor: '#eee',
                trailWidth: 3,
                easing: 'easeInOut',
                duration: 1000,
                svgStyle: null,
                text: {value: ''},
                from: {color: '#ec9706'},
                to: {color: '#fc6a03'},
                // Set default step function for all animate calls
                step: (state, bar) => {
                    bar.path.setAttribute('stroke', state.color);
                    if (bar.value() === 0) bar.setText('20.00')
                    bar.text.style.color = state.color;
                }
            });
        }
        case "hum": {
            return new Circle(container, {
                strokeWidth: 9,
                trailColor: '#eee',
                trailWidth: 3,
                easing: 'easeInOut',
                duration: 1000,
                svgStyle: null,
                text: {value: ''},
                from: {color: '#57a0d2'},
                to: {color: '#008ecc'},
                // Set default step function for all animate calls
                step: (state, bar) => {
                    bar.path.setAttribute('stroke', state.color);
                    if (bar.value() === 0) bar.setText('55.00')
                    bar.text.style.color = state.color;
                }
            });
        }
    }
}

export {
    getTime, initChart, initCircle
}
