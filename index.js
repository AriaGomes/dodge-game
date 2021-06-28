/* ---------------------------- Canvas ------------------------------- */

function selectID(elem) {
    return document.getElementById(elem);
}

const canvas = selectID("myCanvas");
const ctx = canvas.getContext("2d");
const button1 = selectID("button1");
const buttonBack = selectID("buttonBack");
const headmenu = selectID("headmenu");
const gameovermenu = selectID("gameovermenu");
const ingame = selectID("ingame");
const pointsSpan = selectID("pointsSpan");
const highScoreSpan = selectID("highScoreSpan");
const endPointsSpan = selectID("endPointsSpan");
const textHighScore = selectID("textHighScore");

var proMode = true;


document.oncontextmenu = function() {
    return false;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    game.StartMenu();
}

/* ---------------------------- Algorithm ------------------------------- */

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function calculateAngle(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function calculateDistance(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/* ---------------------------- Classes ------------------------------- */

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Size {
    constructor(w, h) {
        this.w = w;
        this.h = h;
    }
}

/* ---------------------------- Mouse Cursor ------------------------------- */

var mousePosition = new Position(0, 0);
var mousePressedDown = false;

function setMousePosition(e) {
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
}

function mouseDown(e) {
    mousePressedDown = true;
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
}

function mouseUp() {
    mousePressedDown = false;
}


/* ---------------------------- Game ------------------------------- */

class Game {

    constructor() {
        this.ball = [];
        this.ballMemory = [];
        this.obstacles = [];
        this.colorPallete = ["#24BCFF", "#4FDE36", "#FFE200"];
        this.startPos = [0.3, 0.7, 0.5];
        this.startOptions = [];
        this.obstacleTimer = new ObstacleTimer();
        this.player = 0;
        this.createObstacles = false;
        this.running = false;
        this.buttonStart = false;
        this.score = new Score;
        this.setDefaults = false;
    }
    load() {
        resizeCanvas();
    }
    start(player, ort) {
        if (this.running === false) {
            this.buttonStart = true;
            this.score.points = 0;
            this.running = true;
            for (var i = 0; i < player; i++) {
                this.ball.push(new Ball(this.startPos[i], 0.25, this.colorPallete[i], i));
            }
            if (ort === "mainM" || this.setDefaults) {
                this.setDefaults = false;
            }
            this.createObstacles = true;
            this.score.renderHighScore();





            this.player = player;
            this.loop();
            headmenu.classList.add("headmenu-fadeOut");
            ingame.classList.add("ingame-fadeIn");
        }
    }




    end(n) {
        let a = this.ball[n].control;
        this.ball.splice(n,1);
        if (this.ball.length <= 0) {
            if (this.player > 1) {
                this.ballMemory[a].count();
            }
            this.gameOver();
        }
    }
    gameOver() {
        this.running = false;
        cancelAnimationFrame(this.frame);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ball.splice(0, this.ball.length);
        this.obstacles.splice(0, this.obstacles.length);
        this.createObstacles = false;
        this.obstacleTimer = new ObstacleTimer();
        this.buttonStart = true;
        if (this.score.points > this.score.highScore) {
            this.score.highScore = this.score.points;
            textHighScore.classList.add("textHighScore-fadeIn");
        }
        endPointsSpan.innerText = Math.round(this.score.points);
        ingame.classList.remove("ingame-fadeIn");
        gameovermenu.classList.add("gameovermenu-fadeIn");
    }
    newStart() {
        if (this.buttonStart) {
            this.buttonStart = false;
            this.start(this.player, "overM");
            this.classAddRemove();
        }
    }
    back() {
        if (this.buttonStart) {
            this.buttonStart = false;
            this.classAddRemove();
            headmenu.classList.remove("headmenu-fadeOut");
        }
    }
    classAddRemove() {
        gameovermenu.classList.remove("gameovermenu-fadeIn");
        textHighScore.classList.remove("textHighScore-fadeIn");
        textHighScore.classList.remove("textHighScore-bottom");
    }
    StartMenu() {
        this.startOptions.splice(0, this.startOptions.length);
        var a = 150;
        for (var i = 0; i < canvas.width; i++) {
            this.startOptions.push(new Position(i,0-a));
            this.startOptions.push(new Position(i,canvas.height+0.5*a));
        }
        for (var i = 0; i < canvas.height; i++) {
            this.startOptions.push(new Position(0-a,i));
            this.startOptions.push(new Position(canvas.width+0.5*a,i));
        }
    }
    newObstacle() {
        this.obstacles.push(new Obstacles());
    }
    loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < this.ball.length; i++) {
            this.ball[i].collisionBall(i);
        }
        for (var i = 0; i < this.ball.length; i++) {
            this.ball[i].move();
            this.ball[i].collisionRand();
            this.ball[i].paint();
        }
        for (var i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i].move();
            this.obstacles[i].paint();
            this.obstacles[i].setDeletion();
            this.obstacles[i].collisionDetection();

            if (this.obstacles[i] && this.obstacles[i].delete) {
                this.obstacles.splice(i,1);
                i -= 1;
            }
        }

        if (this.createObstacles) {
            this.obstacleTimer.count();
        }

        this.score.counter();

        if (this.running) {
            this.frame = requestAnimationFrame(() => {this.loop()});
        }
    }
}

/* ---------------------------- Score ------------------------------- */

class Score {
    constructor() {
        this.points = 0;
        this.highScore = 0;
    }
    counter() {
        this.points += 16.7;
        this.render();
    }
    render() {
        let p = Math.round(this.points);
        pointsSpan.innerText = p;
    }
    renderHighScore() {
        let h = Math.round(this.highScore);
        highScoreSpan.innerText = h;
    }
}

/* ---------------------------- ObstacleTimer ------------------------------- */

class ObstacleTimer {
    constructor() {
        this.timer = 0;
        this.countTo = 60;

        this.value = 0;
        if (proMode === true) {
            this.countTo = 7;
        }
    }
    count() {
        this.timer += 1;
        if (this.timer >= 60) {
            this.timer = 0;

            this.decreaseInterval();
        }

        this.value += 1;
        if (this.value >= this.countTo) {
            this.value = 0;
            game.newObstacle();
        }
    }
    decreaseInterval() {
        if (this.countTo > 7) {
            this.countTo -= 0.6;
        }
    }
}

/* ---------------------------- Obstacles ------------------------------- */

class Obstacles {
    constructor() {
        let a = this.getRandomPos();
        this.position = new Position(game.startOptions[a].x, game.startOptions[a].y);
        this.size = this.setSize();
        this.speed = getRandomArbitrary(1,4);
        this.direction = this.setDirection();
        this.counter = 0;
        this.erasable = 6000/this.speed;
        this.delete = false;
        this.color = "rgb(182,182,182)";
    }
    setDeletion() {
        this.counter += 1;
        if (this.counter > this.erasable) {
            this.delete = true;
        }
    }
    collisionDetection() {
        for (var i = 0; i < game.ball.length; i++) {

            let cc = new Position (game.ball[i].position.x, game.ball[i].position.y);

            if (game.ball[i].position.x < this.position.x) {
                cc.x = this.position.x;
            }
            else if (game.ball[i].position.x > this.position.x + this.size.w) {
                cc.x = this.position.x + this.size.w;
            }
            if (game.ball[i].position.y < this.position.y) {
                cc.y = this.position.y;
            }
            else if (game.ball[i].position.y > this.position.y + this.size.h) {
                cc.y = this.position.y + this.size.h;
            }

            let distance = calculateDistance(game.ball[i].position, cc);

            if (distance <= game.ball[i].radius) {
                this.delete = true;
                game.end(i);
            }
        }
    }
    getRandomPos() {
        return getRandomInt(0, game.startOptions.length - 1);
    }
    setSize() {
        let a = getRandomInt(1,2);
        switch (a) {
            case 1 :
                return new Size(getRandomInt(40, 120),getRandomInt(12, 40));
                break;
            case 2 :
                return new Size(getRandomInt(12, 40),getRandomInt(40, 120));
        }
    }
    setDirection() {
        var a = 50;
        var x = getRandomInt(0 + a, canvas.width - a);
        var y = getRandomInt(0 + a, canvas.height - a);
        var position2 = new Position(x,y)
        var angle = calculateAngle(this.position, position2);
        return angle;
    }
    move() {
        this.position.x += this.speed * Math.cos(this.direction);
        this.position.y += this.speed * Math.sin(this.direction);
    }
    paint() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.rect(this.position.x, this.position.y, this.size.w, this.size.h);
        ctx.fill();
        ctx.closePath();
    }
}

/* ---------------------------- Player ------------------------------- */

class Ball {
    constructor(x,y,f,s) {
        this.position = new Position(x*canvas.width,y*canvas.height);
        this.color = f;
        this.radius = 30;
        this.speed = 6;
        this.angle = -0.2*Math.PI;
        this.velocity = this.speed;
        this.control = s;

        this.collision = false;
        this.angleH = 0;
        this.sHilfs = 25;
        this.sHilfs2 = this.sHilfs;
        this.abstossHilfs = 6;
        this.abstoss = this.abstossHilfs;
    }

    move() {
        if (this.control === 0) { //Mouse
            this.velocity = this.speed;
            let distance = calculateDistance(this.position, mousePosition);
            this.angle = calculateAngle(this.position, mousePosition);

            let slowDown = 100;
            let b = slowDown/this.speed;
            if (distance <= slowDown) {
                this.velocity = distance/b;
            }
        }


        if (this.collision) {
            this.position.x -= this.abstoss * Math.cos(this.angleH);
            this.position.y -= this.abstoss * Math.sin(this.angleH);
        }
        if (this.collision && this.abstoss <= this.velocity) {
            let g = this.velocity - this.abstoss;
            this.position.x += g * Math.cos(this.angle);
            this.position.y += g * Math.sin(this.angle);
        }
        if (this.collision === false) { //normal
            this.position.x += this.velocity * Math.cos(this.angle);
            this.position.y += this.velocity * Math.sin(this.angle);
        }
    }

    collisionRand() {
        if (this.position.x + this.radius >= canvas.width) {
            this.position.x = canvas.width - this.radius;
        }
        if (this.position.x - this.radius <= 0) {
            this.position.x = 0 + this.radius;
        }
        if (this.position.y + this.radius >= canvas.height) {
            this.position.y = canvas.height - this.radius;
        }
        if (this.position.y - this.radius <= 0) {
            this.position.y = 0 + this.radius;
        }
    }

    collisionBall(n) {
        for (var i = 0; i < game.ball.length; i++) {
            if (i != n) {
                if (calculateDistance(this.position, game.ball[i].position) <= this.radius*2) {
                    this.collision = true;
                    this.angleH = calculateAngle(this.position, game.ball[i].position);
                    this.sHilfs2 = this.sHilfs;
                    this.abstoss = this.abstossHilfs;
                }
            }
        }

        if (this.collision === true && this.sHilfs2 >= 0) {
            this.sHilfs2 -= 1;
            this.abstoss -= 0.2;
        }
        if (this.sHilfs2 <= 0) {
            this.collision = false;
            this.sHilfs2 = this.sHilfs;
            this.abstoss = this.abstossHilfs;
        }
    }

    paint() {
        var p1 = this.position.x;
        var p2 = this.position.y;

        ctx.beginPath();
        ctx.arc(p1, p2, this.radius, 0, Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(p1 + 14.5 * Math.cos(this.angle), p2 + 14.5 * Math.sin(this.angle), 14, 0, Math.PI*2);
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
    }
}

/* ---------------------------- Create new game ------------------------------- */

var game = new Game();
game.load();

/* ---------------------------- Event Listeners ------------------------------- */

window.addEventListener("resize", resizeCanvas, false);

document.addEventListener("mousemove", setMousePosition, false);
document.addEventListener("mousedown", mouseDown, false);
document.addEventListener("mouseup", mouseUp, false);
button1.addEventListener("mousedown", () => {game.start(1, "mainM")}, false);
gameovermenu.addEventListener("click", () => {game.newStart()}, false);