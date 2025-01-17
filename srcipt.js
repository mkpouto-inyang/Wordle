const rows = document.querySelectorAll('.row');
const allRowInputs = {};
const youWinSection = document.querySelector('.result')

const toggleLoadingState = (isLoading) => {
    const loadingSection = document.querySelector('.loading-state');
    loadingSection.style.display = isLoading ? 'block' : 'none';
};

//Get word of the day
const getWordOfTheDay = async () =>{
    const url = "https://words.dev-apis.com/word-of-the-day";
    toggleLoadingState(true);
    try{
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }
        const data = await response.json();
        const answer = data.word;
        console.log('Answer fetched')
        return answer;

    }catch (error) {
        console.error(error.message);
    }finally {
        toggleLoadingState(false);
    }
}

//Verify English Word
const postUrl = "https://words.dev-apis.com/validate-word";

const validateWord = async (index) =>{
    const userGuess = storeWord(index).toLowerCase(); 

    const data = {
        word: `${userGuess}`
    };

    toggleLoadingState(true);
    try{
        const response = await fetch(postUrl,{
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        })

        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json();

        return result;
    }catch (error){
        console.error("Error:", error.message);
    }finally {
        toggleLoadingState(false);
    }
}

const isLetter = (letter) => {
    return /^[a-zA-Z]$/.test(letter);
}

const isAllFilled = (rowName) => {
    const inputs = allRowInputs[rowName];
    const allFilled = Array.from(inputs).every((input)=> input.value)
    return allFilled;
}

const checkAnswer = async (index) => {
    const currentRow = allRowInputs[`row${index + 1}`];
    const inputs = Array.from(currentRow);

    if (isAllFilled(`row${index + 1}`)) {
        toggleLoadingState(true);
        try {
            const userGuess = storeWord(index).toLowerCase();
            const answer = await getWordOfTheDay();
            const serverResponse = await validateWord(index);
            console.log(`Answer:${answer}`)

            inputs.forEach((input, i) => {
                //validates English word
                if (serverResponse.validWord === false) {
                    console.log('Not an English word');
                    input.style.borderColor = "red";
                } else if 
                //correct letter in correct position
                (answer.includes(userGuess[i]) && answer[i] === userGuess[i]) {
                    input.style.backgroundColor = "darkgreen";
                    input.style.color = "white";
                    input.setAttribute("readonly", "");
                } else if 
                //correct letter but in wrong position
                (answer.includes(userGuess[i]) && answer[i] !== userGuess[i]) {
                    input.style.backgroundColor = "goldenrod";
                    input.style.color = "white";
                    input.setAttribute("readonly", "");
                } else {
                //Incorrect letter that does not even exist in the word
                    input.style.backgroundColor = "#888888";
                    input.style.color = "white";
                    input.setAttribute("readonly", "");
                }
            });

            const isCorrectWord = inputs.every(input => input.style.backgroundColor === "darkgreen");
            console.log(`isCorrectWord:${isCorrectWord}`);

            if (isCorrectWord) {
                const newDiv = document.createElement('div');
                newDiv.textContent = 'You Win';
                youWinSection.appendChild(newDiv);
                youWinSection.classList.add('you-win');
                confetti();
            }
        } catch (error) {
            console.error(error.message);
        } finally {
            toggleLoadingState(false); 
        }
    }
};

 

 const storeWord = (index) => {
    let text = '';
    const inputs = allRowInputs[`row${index + 1}`];

    if (!inputs) {
        console.error(`Inputs for row${index + 1} not found.`);
        return ''; // If inputs not found, return empty string
    }

    inputs.forEach(input => {
        text += input.value;
    });

    console.log(text); // Log the word being formed
    return text;
}


rows.forEach(function(row, index){
    const rowInputs = row.querySelectorAll('input');

    allRowInputs[`row${index + 1}`] = rowInputs; // Store inputs for each row

    rowInputs.forEach(function(inputBox){
        inputBox.addEventListener('input', (e)=> {
            const target = e.target;
            storeWord(index);

            if(target.nextElementSibling ){
               target.nextElementSibling.focus()
            }
        })
    
        inputBox.addEventListener("keydown", function(event) {
            //Makes sure input can only be letters
            if (!isLetter(event.key)) {
              event.preventDefault();
            }
            
            // backspace functionality
            if (event.key === "Backspace") {
                event.preventDefault();
                inputBox.value = '';
                inputBox.style.backgroundColor = "white";
                inputBox.style.color = "black";
                inputBox.style.borderColor = "#ccc";

                if (inputBox.previousElementSibling) {
                    inputBox.previousElementSibling.focus();
                }
            } else if (inputBox.value && inputBox.nextElementSibling) {
                inputBox.nextElementSibling.focus();
            }

            //Checks answer after user clicks enter
            if (event.key === "Enter"){
                checkAnswer(index);
            }
          });
      
    })

})