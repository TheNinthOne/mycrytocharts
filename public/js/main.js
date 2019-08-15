document.addEventListener("DOMContentLoaded", () => {
  //When document is ready for js
  setInterval(async () => {
    update();
  }, 5 * 60 * 1000); //Update() every 5 minutes
});

const update = async () => {
  //Update values of currencies
  const valueLabels = Array.from(document.getElementsByClassName("value")); //Find all tags that display currency value
  const reqs = valueLabels.map(valueLabel => {
    //Create array of promises that request new values from server
    const { id } = valueLabel;
    const request = axios({ method: "get", url: `/api/${id}/value` });
    return request;
  });

  const ress = await Promise.all(reqs); //Get new values

  valueLabels.forEach((valueLabel, i) => {
    //For each display tag
    const { update } = ress[i].data;
    if (update)
      //Update if it should be updated
      valueLabel.innerHTML = `$ ${ress[i].data.data.value.toLocaleString()}`;
  });
};
