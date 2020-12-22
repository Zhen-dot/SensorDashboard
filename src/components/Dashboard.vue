<template>
  <div id="dashboard" ref="container">
    <h1>Dashboard</h1>
    <canvas id="dashboard/summary" height="150" width="400"></canvas>
  </div>
</template>

<script>
import {db} from "@/firebase";
import Chart from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Device from "@/components/Device";
import Vue from "vue";
import {getTime} from "@/components/functions";

Chart.plugins.unregister(ChartDataLabels);

export default {
  name: "Dashboard",

  data() {
    return {
      devices: [],
      summary_graph: null
    }
  },

  methods: {
    updateSummary() {
      this.summary_graph.data.datasets[0].data = Object.keys(this.devices).map(k => this.devices[k].temperature);
      this.summary_graph.data.datasets[1].data = Object.keys(this.devices).map(k => this.devices[k].humidity);
      this.summary_graph.update();
    }
  },

  mounted() {
    // Init graph
    this.summary_graph = new Chart(document.getElementById("dashboard/summary").getContext('2d'), {
      plugins: [ChartDataLabels],
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Temperature',
          data: [],
          borderColor: 'rgba(255, 165, 0, 1)',
          backgroundColor: 'rgba(255, 165, 0, 0.2)',
          borderWidth: 3
        }, {
          label: 'Humidity',
          data: [],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 3
        }]
      },
      options: {
        title: {
          display: true,
          text: 'Device summary'
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
        }
      }
    });

    (async () => {
      // Get devices from firestore documents & create components
      const DeviceClass = Vue.extend(Device);
      await db.get().then(docs => {
        docs.forEach(doc => {
          this.devices.push(new DeviceClass({
            propsData: {
              d_name: doc.id
            }
          }));
        });
      });

      this.devices.forEach(device => {
        // Mount and init device components
        device.$mount();
        this.$refs.container.appendChild(device.$el);
        device.init();

        // Firestore listener
        db.doc(device.d_name).onSnapshot(snapshot => {
          const data = snapshot.data();
          device.updateRtG(getTime(data.time), data.temperature.toFixed(2), data.humidity.toFixed(2));
          this.updateSummary();
        });
      });

      // Update summary graph labels
      this.summary_graph.data.labels = Object.keys(this.devices).map(k => this.devices[k].d_name);

      // Exits open modals when clicking outside of modal
      const modals = this.devices.map(d => d.modal);
      window.onclick = (ev) => {
        const i = modals.indexOf(ev.target);
        if (i !== -1) {
          modals[i].classList.remove('show');
        }
      }
    })();
  }
}
</script>
