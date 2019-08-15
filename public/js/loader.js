var opts = {
  lines: 18, // The number of lines to draw
  length: 30, // The length of each line
  width: 15, // The line thickness
  radius: 50, // The radius of the inner circle
  scale: 1.2, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  color: "#9699a3", // CSS color or array of colors
  fadeColor: "transparent", // CSS color or array of colors
  speed: 1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: "spinner-line-fade-quick", // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  className: "spinner", // The CSS class to assign to the spinner
  top: "50%", // Top position relative to parent
  left: "50%", // Left position relative to parent
  shadow: "1px 1px 10px gray", // Box-shadow for the lines
  position: "absolute" // Element positioning
};

var target = document.getElementById("loader");
var spinner = new Spinner(opts).spin(target);

document.addEventListener("DOMContentLoaded", () => {
  newLine(myChart)
    .then(value => {
      spinner.stop();
      ctx.classList.toggle("invisible");
    })
    .catch(error => {
      console.log(error);
    });
});
