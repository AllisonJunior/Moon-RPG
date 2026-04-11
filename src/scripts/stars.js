const container = document.querySelector(".stars");

const quantidade = 100;
const velocidadeBase = 1.0; // quanto maior, mais lento

for (let i = 0; i < quantidade; i++) {
    const star = document.createElement("div");
    star.classList.add("star");

    star.style.animationDuration = ((Math.random() * 3 + 2) * velocidadeBase) + "s";

    // posição horizontal distribuída
    let posX = (i / quantidade) * 100;
    posX += (Math.random() * 10 - 5);

    // posição vertical aleatória (ESSENCIAL)
    let posY = Math.random() * 100;

    star.style.left = posX + "vw";
    star.style.top = posY + "vh";

    star.style.animationDuration = (Math.random() * 3 + 2) + "s";
    star.style.opacity = Math.random();

    container.appendChild(star);
}