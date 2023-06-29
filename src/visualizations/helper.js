// SOURCE: https://brendansudol.com/writing/responsive-d3
function responsivefy(svg) {
  // get container + svg aspect ratio
  var container = d3.select(svg.node().parentNode),
    width = parseInt(svg.style("width")),
    height = parseInt(svg.style("height")),
    aspect = width / height;

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("perserveAspectRatio", "xMinYMid")
    .call(resize);

  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  d3.select(window).on("resize." + container.attr("id"), resize);

  // get width of container and resize svg to fit it
  function resize() {
    var targetWidth = parseInt(container.style("width"));
    svg.attr("width", targetWidth);
    svg.attr("height", Math.round(targetWidth / aspect));
  }
}

// Custom function to create dropdowns
function createDropDown(dropdown, name, array, callback) {
  d3.select(`#${name}`)
    .selectAll("myOptions")
    .data(array)
    .enter()
    .append("option")
    .text(function (d) {
      return d.en;
    }) // text showed in the menu
    .attr("value", function (d) {
      return d.de;
    }); // corresponding value returned by the button

  if (dropdown) {
    dropdown.addEventListener("change", () => {
      callback();
    });
  }
}

// Custom function to remove dropdowns
function removeDropDown(dropdown, name) {
  d3.select(`#${name}`).selectAll("option").remove();
}

export { responsivefy, createDropDown, removeDropDown };
