//Get coinId form the link for further loading and save to Session Storage
const { pathname } = window.location;
const start = pathname.lastIndexOf("/");
const coin = pathname.slice(start + 1);

sessionStorage.setItem("coinId", coin);

//Determine What is coin symbol
axios
  .get(`/api/${coin}/symbol`)
  .then(response => {
    const { symbol } = response.data;
    sessionStorage.setItem("symbol", symbol.toUpperCase());
  })
  .catch(error => {
    console.log(error);
  });

//Canvas for rendering chart
const ctx = document.getElementById("myChart");

const defaultDataset = {
  //Default configuration for each new dataset(chart data)
  fill: false,
  borderWidth: 3,
  lineTension: 0,
  pointRadius: 0,
  borderColor: "#fc03f8",
  pointHitRadius: 30
};

const myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [], //X Axis labels
    datasets: [] //Values for plotting + how chart line looks
  },
  options: {
    legend: { display: false },
    tooltips: {
      displayColors: false,
      callbacks: {
        //Called when rendering a tooltip
        title: function(tooltipItem, data) {
          const time = data.labels[tooltipItem[0].index];
          return moment(time).format("Do MMM HH:mm");
        },
        label: function(tooltipItem, data) {
          return (
            data.datasets[tooltipItem.datasetIndex].label +
            ` $${tooltipItem.yLabel.toLocaleString()}`
          );
        }
      }
    },
    scales: {
      yAxes: [
        {
          gridLines: { borderDash: [5, 5] },
          ticks: {
            fontColor: "#007bff",
            callback: function(value, index, values) {
              return "$" + value.toLocaleString();
            }
          }
        }
      ],
      xAxes: [
        {
          gridLines: { display: false },
          ticks: {
            fontColor: "#007bff",
            callback: function(item, index) {
              //Render only every 24th X axis because they are repeating
              // if (!(index % 24)) return moment(item).format("Do MMM");
              // else return "";
              return moment(item).format("Do MMM");
            },
            autoSkip: false //Required for tick skiping to work
          }
        }
      ]
    }
  }
});

//Function to render a chart line
async function newLine(chart) {
  return new Promise(async (resolve, reject) => {
    const coinId = sessionStorage.getItem("coinId");
    const request = axios({ method: "get", url: `/api/${coinId}` });

    try {
      const response = await request;
      const { data, dates } = response.data;

      const label = sessionStorage.getItem("symbol");

      //Create Chrat Specific dataset
      const newDataset = Object.assign(defaultDataset, {
        label,
        data
      });

      //Load data into the chart
      myChart.data.labels = dates;
      myChart.data.datasets.push(newDataset);
      myChart.update();
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}

//Function handles canvas resizing to make it responsive
function resize() {
  $("#myChart").outerHeight(
    $(window).height() -
      $("#myChart").offset().top -
      Math.abs($("#canvas").outerHeight(true) - $("#canvas").outerHeight())
  );
}

$(document).ready(function() {
  const id = sessionStorage.getItem("coinId");
  setInterval(async () => {
    //Handle value updates every
    const request = axios({ method: "get", url: `/api/${id}/value` });
    const response = await request;
    if (response.data.update)
      document.getElementById(
        "value"
      ).innerHTML = `$ ${response.data.data.value.toLocaleString()}`;
  }, 5 * 60 * 1000); //5 minutes

  resize();
  $(window).on("resize", function() {
    resize();
  });
});
