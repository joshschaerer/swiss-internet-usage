import { chartOne } from "./visualizations/chart-1.js";
import { chartTwo } from "./visualizations/chart-2.js";
import { chartFour } from "./visualizations/chart-4.js";
import { chartFive } from "./visualizations/chart-5.js";

chartOne();
chartTwo();
chartFour();
chartFive();

/*=============== SHOW HIDDEN MENU ===============*/
const showMenu = (toggleId, navbarId) => {
  const toggle = document.getElementById(toggleId),
    navbar = document.getElementById(navbarId);

  if (toggle && navbar) {
    toggle.addEventListener("click", () => {
      /* Show menu */
      navbar.classList.toggle("show-menu");
      /* Rotate toggle icon */
      toggle.classList.toggle("rotate-icon");
    });
  }
};
showMenu("nav-toggle", "nav");

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll("section[id]");

function scrollActive() {
  const scrollY = window.pageYOffset;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight,
      sectionTop = current.offsetTop - 58,
      sectionId = current.getAttribute("id");

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document
        .querySelector(".nav__menu a[href*=" + sectionId + "]")
        .classList.add("link--active");
    } else {
      document
        .querySelector(".nav__menu a[href*=" + sectionId + "]")
        .classList.remove("link--active");
    }
  });
}
window.addEventListener("scroll", scrollActive);

/*=============== DARK LIGHT THEME ===============*/
const themeButton = document.getElementById("nav-theme");
const darkTheme = "dark-theme";

// Activate / deactivate the theme manually with the button
themeButton.addEventListener("click", () => {
  // Add or remove the dark / icon theme
  document.body.classList.toggle(darkTheme);
  // Reload pie chart
  chartFive();
});
