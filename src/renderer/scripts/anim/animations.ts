import increaseBtn from "@assets/ui/buttons/increase.png";
import increaseBtnPress from "@assets/ui/buttons/increase-press.png";

import powerBtn from "@assets/ui/buttons/decrease.png";
import powerBtnPress from "@assets/ui/buttons/decrease-press.png";

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

export const btnImages = {
  increase: {
    normal: increaseBtn,
    pressed: increaseBtnPress,
  },
  decrease: {
    normal: powerBtn,
    pressed: powerBtnPress,
  },
};

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

// clicking animation
export function animateBtn(btnType: string, disabled = false) {
  const img = document.getElementById(`${btnType}-img`) as HTMLImageElement;
  img.src = btnImages[btnType].pressed;

  if (disabled) {
    playAnimation(img, "no-boosts-shake");
    img.animate(
      [
        {
          filter:
            "opacity(0.4) drop-shadow(0 0 0 red) drop-shadow(0 0 0 red) brightness(0.8) saturate(120%)",
        },
        { filter: "none" },
      ],
      {
        duration: 800,
        easing: "ease",
        fill: "forwards",
      },
    );
  }
  setTimeout(() => {
    img.src = btnImages[btnType].normal;
  }, 100);
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
