
let attempt = 0;
let word = "";
let wordsDictionary = [];
let answer = "";

const url = "https://gist.githubusercontent.com/cfreshman/a03ef2cba789d8cf00c08f767e0fad7b/raw/c915fa3264be6d35990d0edb8bf927df7a015602/wordle-answers-alphabetical.txt";

document.addEventListener('DOMContentLoaded', () => {
    fetch(url).then((resp) => resp.text()).then(data => {
        wordsDictionary = data.split("\n");
    }
)});

function AddLetter(letter) {
    if (letter === '←'){
        if (word.length > 0) {
            word = word.slice(0, -1);
            ApplyWord();
        }
    } else if (word.length < 5) {
    word += letter;
    ApplyWord();
  }
}

function ApplyWord() {
    for (let i = 0; i < 5; i++) {
        document.getElementById(`cell-${attempt}-${i}`).innerHTML = i < word.length ? word[i] : "";
    }
    document.getElementById("submit").disabled = word.length !== 5;
}

function RaiseInvalidWord() {
    document.getElementById("validationError").style.display = "";
    setTimeout(() => {
        document.getElementById("validationError").style.display = "none";
    }, 1000);
}

function PaintCells() {
    var elements = document.getElementsByClassName("key");
    for (let i = 0; i < 5; i++) {
        var el = document.getElementById(`cell-${attempt}-${i}`);
        var el2 = null;
        for (var j = 0; j < elements.length; j++) {
            if (elements[j].innerHTML === word[i]) {
                el2 = elements[j];
                break;
            }
        }
        if (word[i] === answer[i]) {
            el.style.backgroundColor = "green";
            el2.style.backgroundColor = "green";
        } else if (answer.includes(word[i])) {
            el.style.backgroundColor = "blue";
            el2.style.backgroundColor = "blue";
        }
        else {
            el.style.backgroundColor = "red";
            el2.style.backgroundColor = "red";
        }
    }
}

function ContainedLetter(letter, position)
{
    this.letter = letter;
    this.position = position;
}

function Suggest()
{
    var suggestion = "";
    var correctLetters = "00000";
    var containedLetters = [];
    var notContainedLetters = "";
    for (let i = 0; i < attempt; i++) {
        for (let j = 0; j < 5; j++) {
            var cell = document.getElementById(`cell-${i}-${j}`);
            if (cell.style.backgroundColor === "green") {
                correctLetters = correctLetters.substring(0, j) + cell.innerHTML + correctLetters.substring(j + 1);
            } else if (cell.style.backgroundColor === "blue") {
                containedLetters.push(new ContainedLetter(cell.innerHTML.toLowerCase(), j));
            }
            else {
                if (!notContainedLetters.includes(cell.innerHTML)) {
                    notContainedLetters += cell.innerHTML;
                }
            }
        }
    }

    correctLetters = correctLetters.toLowerCase();
    notContainedLetters = notContainedLetters.toLowerCase();

    for (let i = 0; i < wordsDictionary.length; i++) {
        var word = wordsDictionary[i];
        var isCorrect = true;
        for (let j = 0; j < 5; j++) {
            if (correctLetters[j] !== '0' && correctLetters[j] !== word[j]) {
                isCorrect = false;
                break;
            }
        }
        if (!isCorrect) {
            continue;
        }
        var isContained = true;
        for (let j = 0; j < containedLetters.length; j++) {
            var index = word.indexOf(containedLetters[j].letter);
            if (index === -1 || index === containedLetters[j].position) {
                isContained = false;
                break;
            }  
        }
        if (!isContained) {
            continue;
        }
        var isNotContained = true;
        for (let j = 0; j < notContainedLetters.length; j++) {
            if (word.includes(notContainedLetters[j])) {
                isNotContained = false;
                break;
            }
        }
        if (isNotContained) {
            suggestion = word;
            break;
        }    
    }
    document.getElementById("suggestion").innerHTML = "Suggested word: " + suggestion;
}

function SubmitWord() {
    if (word.length === 5) {
        if (wordsDictionary.includes(word.toLowerCase())) {
            PaintCells();
            if (word === answer) {
                ShowGameResult("Congratulations! You won!");
                return;
            }
            word = "";
            if (attempt < 5) {
                attempt++;
                ApplyWord();
            } else {
                ShowGameResult("You lost! The answer was " + answer);
            }
            Suggest();
        }
        else {
            RaiseInvalidWord();
        }
    }
}

function ShowGameResult(result) {
    var el = document.getElementById("result");
    el.style.display = "";
    document.getElementById("resultStatus").innerHTML = result;
    document.getElementById("keyboard").style.display = "none";
    document.getElementById("submit").style.display = "none";
    document.getElementById("wordle").style.display = "none";
    document.getElementById("suggestion").style.display = "none";
}

function InitializeGame()
{
    document.getElementById("wordle").style.display = "";
    document.getElementById("keyboard").style.display = "";
    document.getElementById("submit").style.display = "";
    document.getElementById("submit").disabled = true;
    document.getElementById("suggestion").style.display = "";
    document.getElementById("suggestion").innerHTML = "Suggested word: ";
    attempt = 0;
    word = "";
    answer = wordsDictionary[Math.floor(Math.random() * wordsDictionary.length)].toUpperCase();
    var elements = document.getElementsByClassName("key");
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.backgroundColor = "#ffcc00";
    }
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            var cell = document.getElementById(`cell-${i}-${j}`);
            cell.style.backgroundColor = "#15181c";
            cell.innerHTML = "";
        }
    }
}

document.getElementById("start").onclick = function() {
    document.getElementById("menu").style.display = "none";
    InitializeGame();
}

document.querySelectorAll(".key").forEach(function(element) {
    element.onclick = function() {
        AddLetter(element.innerHTML);
    }
});

document.getElementById("submit").onclick = function() {
    SubmitWord();
}

document.getElementById("restart").onclick = function() {
    document.getElementById("result").style.display = "none";
    InitializeGame();
}