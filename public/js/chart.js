//Get coinId form the link for further loading and save to Session Storage
const { pathname } = window.location;
const start = pathname.lastIndexOf("/");
const coin = pathname.slice(start + 1);

sessionStorage.setItem("coinId", coin);

//Determine What is coin symbol
axios
  .get(`/data/${coin}/symbol`)
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
          return time.format("Do MMM HH:mm");
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
              if (!(index % 24)) return item.format("Do MMM");
              else return "";
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
  const coinId = sessionStorage.getItem("coinId");
  const request = axios({ method: "get", url: `/data/${coinId}` });

  try {
    const response = await request;
    const { prices } = response.data;
    //Transform response data for easier use for rendering
    const chartData = prices.reduce(
      (acc, pair) => {
        acc.dates.push(moment(pair[0]));
        acc.data.push(pair[1]);
        return acc;
      },
      { dates: [], data: [] }
    );

    //Receive random graph color from server
    const borderColor = await getColor();

    const label = sessionStorage.getItem("symbol");

    //Create Chrat Specific dataset
    const newDataset = Object.assign(defaultDataset, {
      label,
      data: chartData.data,
      borderColor
    });

    //Load data into the chart
    chart.data.labels = chartData.dates;
    chart.data.datasets.push(newDataset);
    chart.update();
  } catch (error) {
    console.log(error);
  }
}

//Helper for handling color request
async function getColor() {
  return new Promise(async (resolve, reject) => {
    const request = axios({
      method: "get",
      url: "/data/misc/color"
    });
    try {
      const response = await request;
      const { color } = response.data;
      resolve(color);
    } catch (error) {
      reject(error);
    }
  });
}

//Function handles canvas resizing to make it responsive
function resize() {
  $("#myChart").outerHeight(
    $(window).height() -
      $("#canvas").offset().top -
      Math.abs($("#canvas").outerHeight(true) - $("#canvas").outerHeight())
  );
}

$(document).ready(function() {
  resize();
  $(window).on("resize", function() {
    resize();
  });
});
