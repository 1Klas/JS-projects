export class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    Normalize() {
        var length = Math.sqrt(this.x * this.x + this.y * this.y);
        if (length != 0) {
            return new Vector2(this.x / length, this.y / length);
        }
    }

    DistanceTo(other) {
        return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
    }

    DirectionTo(other) {
        return new Vector2(other.x - this.x, other.y - this.y);
    }
}

var zoom = 2;
var cameraPos = new Vector2(0, 0);
export var controller = {};

const sizeMultiplier = 5;

function RandomColor() {
    var r = RandomIntInRange(32, 230);
    var g = RandomIntInRange(32, 230);
    var b = RandomIntInRange(32, 230);
    return "#" + r.toString(16) + g.toString(16) + b.toString(16);
}

function GetDarkerColor(color) {
    var r = parseInt(color.substring(1, 3), 16);
    var g = parseInt(color.substring(3, 5), 16);
    var b = parseInt(color.substring(5, 7), 16);
    r = Math.floor(r * 0.9);
    g = Math.floor(g * 0.9);
    b = Math.floor(b * 0.9);
    return "#" + r.toString(16) + g.toString(16) + b.toString(16);
}

function RandomIntInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export class Blob {
    constructor(position, color, name) {
        this.pos = position;
        this.vel = new Vector2(0, 0);
        this.color = color;
        this.outlineColor = GetDarkerColor(color);
        this.score = Math.random() * 10 + 10;
        this.size = Math.sqrt(this.score) * sizeMultiplier;
        this.name = name;
        this.target = null;
    }

    GetMinimalSizeToEat() {
        return this.size + this.size / 10;
    }

    AddScore(amount) {
        this.score += amount;
        this.size = Math.sqrt(this.score) * sizeMultiplier;
    }

    Draw = function(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc((this.pos.x - cameraPos.x) * zoom, (this.pos.y - cameraPos.y) * zoom, this.size * zoom, 0, 2 * Math.PI);
        ctx.fill();
        ctx.lineWidth = 2 * zoom * this.size / 30;
        ctx.strokeStyle = this.outlineColor;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";

        if (this.target != null) {
            ctx.beginPath();
            ctx.moveTo((this.pos.x - cameraPos.x) * zoom, (this.pos.y - cameraPos.y) * zoom);
            ctx.lineTo((this.target.pos.x - cameraPos.x) * zoom, (this.target.pos.y - cameraPos.y) * zoom);
            ctx.stroke();
        }

        var fontSize = this.size * zoom / 2
        ctx.font = fontSize + "px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.name, (this.pos.x - cameraPos.x) * zoom, (this.pos.y - cameraPos.y) * zoom - this.size * zoom / 2 + fontSize * 1.2);
    }

    CalculateSpeed() {
        if (this.size < 600) {
            return 1 - this.size * 0.00125;
        }
        return 0.25;
    }

    NormalizeVelocity() {
        var length = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
        if (length != 0 && length > 1) {
            this.vel.x /= length;
            this.vel.y /= length;
        }
    }

    Tick = function(limitX, limitY) {
        this.NormalizeVelocity();
        var speed = this.CalculateSpeed();
        if (this.vel.x > 0) {
            if (this.pos.x + this.size < limitX) {
                this.pos.x += this.vel.x * speed;
            }
        } else if (this.vel.x < 0) {
            if (this.pos.x - this.size > 0) {
                this.pos.x += this.vel.x * speed;
            }
        }
        if (this.vel.y > 0) {
            if (this.pos.y + this.size < limitY) {
                this.pos.y += this.vel.y * speed;
            }
        } else if (this.vel.y < 0) {
            if (this.pos.y - this.size > 0) {
                this.pos.y += this.vel.y * speed;
            }
        }
        this.vel.x *= 0.982;
        this.vel.y *= 0.982;
    }

}

class Food {
    constructor(position) {
        this.pos = position;
        this.size = Math.random() * 4 + 3;
        this.color = RandomColor();
    }

    Draw = function(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc((this.pos.x - cameraPos.x) * zoom, (this.pos.y - cameraPos.y) * zoom, this.size * zoom, 0, 2 * Math.PI);
        ctx.fill();
    }
}

const cellSize = 25;
const speedFactor = 10;

export class Game {
    constructor(gridsize) {
        this.gridsize = gridsize;
        this.map = new Vector2(gridsize * cellSize, gridsize * cellSize);
        this.localPlayer = new Blob(this.RandomPosition(), RandomColor(), "You");
        this.blobs = [this.localPlayer];
        var count = Math.floor(Math.random() * 20) + 20;
        for (var i = 1; i <= count; i++) {
            this.blobs[i] = new Blob(this.RandomPosition(), RandomColor(), "Bot " + i);
        }
        this.food = [];
        for (var i = 0; i < gridsize * 10; i++) {
            this.food[i] = new Food(this.RandomPosition());
        }
    }
    
    RandomPosition() {
        return new Vector2(RandomIntInRange(10, this.map.x - 10), RandomIntInRange(10, this.map.y - 10));
    }

    ApplyInput() {
        if (controller["w"]) {
            if (this.localPlayer.vel.y > -1) {
                this.localPlayer.vel.y -= 1 / speedFactor;
            }
        }
        if (controller["s"]) {
            if (this.localPlayer.vel.y < 1) {
                this.localPlayer.vel.y += 1 / speedFactor;
            }
        }
        if (controller["a"]) {
            if (this.localPlayer.vel.x > -1) {
                this.localPlayer.vel.x -= 1 / speedFactor;
            }
        }
        if (controller["d"]) {
            if (this.localPlayer.vel.x < 1) {
                this.localPlayer.vel.x += 1 / speedFactor;
            }
        }
        if (controller[" "]) {
            this.localPlayer.AddScore(10);
        }
    }

    SolveCollisions() {
        for (var i = 0; i < this.blobs.length; i++) {
            var blob = this.blobs[i];
           
            for (var j = 0; j < this.blobs.length; j++) {
                if (i == j) {
                    continue;
                }
                var other = this.blobs[j];
                var distance = blob.pos.DistanceTo(other.pos);
                if (distance < blob.size) {
                    if (blob.size > other.GetMinimalSizeToEat()) {
                        blob.AddScore(other.score * 0.5);
                        if (other == this.localPlayer) {
                            this.blobs[j] = new Blob(this.RandomPosition(), RandomColor(), "You");
                            this.localPlayer = this.blobs[j];
                        }
                        else
                        {
                            this.blobs[j] = new Blob(this.RandomPosition(), RandomColor(), "Bot " + j);
                        }
                        
                    } else if (other.size > blob.GetMinimalSizeToEat()) {
                        other.AddScore(blob.score * 0.5);
                        if (blob == this.localPlayer) {
                            this.blobs[i] = new Blob(this.RandomPosition(), RandomColor(), "You");
                            this.localPlayer = this.blobs[i];
                        }
                        else
                        {
                            this.blobs[i] = new Blob(this.RandomPosition(), RandomColor(), "Bot " + i);
                        }
                    }
                }
            }

            for (var j = 0; j < this.food.length; j++) {
                var food = this.food[j];
                var dist = blob.pos.DistanceTo(food.pos);
                if (dist < blob.size) {
                    blob.AddScore(1);
                    this.food[j] = new Food(this.RandomPosition());
                }
            }
        }
    }

    GetClosestFood = function(blob) {
        var closestFood = null;
        var closestDistance = 999999999;
        for (var i = 0; i < this.food.length; i++) {
            var food = this.food[i];
            var dist = blob.pos.DistanceTo(food.pos);
            if (dist < closestDistance) {
                closestDistance = dist;
                closestFood = food;
            }
        }
        return closestFood;
    }

    GetBestTarget = function(blob) {
        var best = null;
        var score = 0;
        const sizeBias = 0.25;
        const distanceBias = -0.01;
        for (var i = 0; i < this.blobs.length; i++) {
            var other = this.blobs[i];
            if (other != blob) {
                var dist = blob.pos.DistanceTo(other.pos);
                var size = other.score;
                var newScore = size * sizeBias + dist * distanceBias;
                if (newScore > score) {
                    score = newScore;
                    best = other;
                }
            }
        }
        return best;
    }

    SolveAI() {
        for (var i = 0; i < this.blobs.length; i++) {
            var blob = this.blobs[i];
            if (blob != this.localPlayer) {
                var closestBlob = this.GetBestTarget(blob);
                if (closestBlob != null) {
                    var dist = blob.pos.DistanceTo(closestBlob.pos);
                    if (dist < 500 && blob.size > closestBlob.GetMinimalSizeToEat())
                    {
                        var dir = blob.pos.DirectionTo(closestBlob.pos).Normalize();
                        blob.vel.x = dir.x;
                        blob.vel.y = dir.y;
                        blob.target = closestBlob;
                        continue;
                    }
                }
            }
        }
    }

    Tick() {
        this.ApplyInput();
        for (var i = 0; i < this.blobs.length; i++) {
            this.blobs[i].Tick(this.map.x, this.map.y);
        }
        this.SolveCollisions();
        this.SolveAI();
        if (zoom > 0.3) {
            zoom = 3 - Math.log10(this.localPlayer.size);
        }
        cameraPos.x = this.localPlayer.pos.x - canvas.width / 2 / zoom;
        cameraPos.y = this.localPlayer.pos.y - canvas.height / 2 / zoom;
    }

    Draw = function(ctx) {
        ctx.strokeStyle = "#aaaaaa";
        ctx.lineWidth = 1;
        for (var i = 0; i < this.gridsize; i++) {
            ctx.beginPath();
            ctx.moveTo((i * cellSize - cameraPos.x) * zoom, (-cameraPos.y) * zoom);
            ctx.lineTo((i * cellSize - cameraPos.x) * zoom, (this.map.y - cameraPos.y) * zoom);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo((-cameraPos.x) * zoom, (i * cellSize - cameraPos.y) * zoom);
            ctx.lineTo((this.map.x - cameraPos.x) * zoom, (i * cellSize - cameraPos.y) * zoom);
            ctx.stroke();
        }

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo((-cameraPos.x) * zoom, (-cameraPos.y) * zoom);
        ctx.lineTo((this.map.x - cameraPos.x) * zoom, (-cameraPos.y) * zoom);
        ctx.lineTo((this.map.x - cameraPos.x) * zoom, (this.map.y - cameraPos.y) * zoom);
        ctx.lineTo((-cameraPos.x) * zoom, (this.map.y - cameraPos.y) * zoom);
        ctx.lineTo((-cameraPos.x) * zoom, (-cameraPos.y) * zoom);
        ctx.stroke();

        for (var i = 0; i < this.food.length; i++) {
            this.food[i].Draw(ctx);
        }

        for (var i = 0; i < this.blobs.length; i++) {
            this.blobs[i].Draw(ctx);
        }

        this.localPlayer.Draw(ctx);

        ctx.font = "20px Roboto";
        ctx.fillStyle = "#aacc00";
        ctx.textAlign = "left";
        ctx.fillText("Score: " + parseInt(this.localPlayer.score), 10, ctx.canvas.height - 30);
    }
}