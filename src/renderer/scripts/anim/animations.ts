const animClasses = [
  "pop",
  "pop-dec",
  "pop-right",
  "pop-min",
  "reset-shake",
  "no-boosts-shake",
  "no-boosts-flash",
  "new-goal",
  "boost-notification",
  "penalty-shake",
];

// main animation function
export function playAnimation(
  element: HTMLElement | SVGElement,
  className: string,
) {
  // reset animations
  element.style.animation = "none	";
  element.getBoundingClientRect();
  element.style.animation = "";

  // remove old anim classes -> add new anim
  element.classList.remove(...animClasses);
  element.classList.add(className);
}

export function playAnimationMulti(elements: HTMLElement[], className: string) {
  elements.forEach((element) => {
    playAnimation(element, className);
  });
}

export function resetHeartEffect() {
  const heartIds = ["heart1", "heart2", "heart3", "heart4"];

  heartIds.forEach((id) => {
    const heart = document.getElementById(id);
    if (heart) {
      heart.style.visibility = "hidden";
      heart.getBoundingClientRect();
      heart.style.visibility = "visible";
    }
  });
}
