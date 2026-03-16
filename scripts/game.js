let universeFileName = "one_piece";
let language = "fr";

getUniverseData(universeFileName).then
(
	universeData =>
	{
		ShowPageContent(universeData);
		retrieveCharacters(universeData);

		document.getElementById("GuessField").addEventListener
		(
			"keyup",
			function ()
			{
				let fieldElement = document.getElementById("GuessField");
				let resultsContainer = document.getElementById("SearchResults");
				resultsContainer.innerHTML = "";

				for (let character of universeData.characters)
				{
					for (let name of character[language].names)
					{
						if (fieldElement.value.trim() != "" && name.toLowerCase().startsWith(fieldElement.value))
						{
							let resultContainer = document.createElement("div");
							resultContainer.className = "SearchResult";
	
							let imageElement = document.createElement("img");
							imageElement.className = "CharacterImage";
							imageElement.src = getCharacterImage(universeFileName, character[language].imagePath);
	
							let nameElement = document.createElement("p");
							nameElement.innerText = character[language].names[0];
	
							resultContainer.appendChild(imageElement);
							resultContainer.appendChild(nameElement);
							resultsContainer.appendChild(resultContainer);
							break;
						}
					}
				}
			}
		);

		let answer = getAnswerOfTheDay(universeData.characters, 0, true);
		document.getElementById("GuessButton").addEventListener("click", function () { guess(universeData, answer[language]); });
	}
);

async function getUniverseData(fileName)
{
	return (await fetch(`../database/${fileName}.json`)).json();
}

function getDateString(date)
{
	return `${date.getUTCFullYear()}-${date.getUTCDate()}-${date.getUTCMonth()}`;
}

function getCharacterImage(universeFileName, imagePath)
{
	return `../images/${universeFileName}/${imagePath}`;
}

function getAnswerOfTheDay(characters, day, relative = false, remainingCalls = 20)
{
	let date = relative ? new Date() : day;

	if (relative)
	{
		date.setDate(date.getDate() + day);
	}

	let seed = getDateString(date);

	rng = new Math.seedrandom(seed);
	let randomNumber = Math.floor(rng() * characters.length);

	if (remainingCalls > 0)
	{
		date.setDate(date.getDate() - 1);
		let lastDayAnswer = getAnswerOfTheDay(characters, date, false, remainingCalls - 1);

		while (characters[randomNumber] == lastDayAnswer)
		{
			randomNumber = Math.floor(rng() * characters.length);
		}
	}

	return characters[randomNumber];
}

async function retrieveCharacters(universeData)
{
	let datalistElement = document.getElementById("GuessFieldList");

	for (let i = 0; i < universeData.characters.length; i++)
	{
		let option = document.createElement("option");
		let characterName = universeData.characters[i][language].names[0];
		option.innerText = characterName;

		datalistElement.appendChild(option);
	}
}

function guess(universeData, answer)
{
	let characterField = document.getElementById("GuessField");
	let guessesBody = document.getElementById("GuessesBody");
	let attemptName = characterField.value;
	let attempt = null;

	if (attemptName == "")
		return;

	for (const character of universeData.characters)
	{
		if (character[language].names.includes(attemptName))
		{
			attempt = character[language];
		}
	}

	let attemptRow = document.createElement("tr");
	let fieldNames = Object.keys(universeData.metadata.fieldNames[language]);

	for (let i = 0; i < fieldNames.length; i++)
	{
		let attemptFieldValue;
		let answerFieldValue;

		if (fieldNames[i] == "names")
		{
			attemptFieldValue = attempt.names[0];
			answerFieldValue = answer.names[0];

			if (attemptFieldValue == answerFieldValue)
			{
				localStorage.setItem(getDateString(new Date()), true);
			}
		}
		else if (fieldNames[i] == "imagePath")
		{
			let attemptFieldElement = document.createElement("td");
			attemptFieldElement.className = "AttemptField";

			if (localStorage.getItem(getDateString(new Date())) ?? false)
			{
				attemptFieldElement.className += " Correct";
			}

			let image = document.createElement("img");
			image.className = "CharacterImage";
			image.src = getCharacterImage(universeFileName, attempt.imagePath);

			attemptFieldElement.appendChild(image);
			attemptRow.appendChild(attemptFieldElement);
			continue;
		}
		else
		{
			attemptFieldValue = attempt[fieldNames[i]];
			answerFieldValue = answer[fieldNames[i]];
		}

		let attemptFieldElement = document.createElement("td");
		attemptFieldElement.className = "AttemptField";

		let attemptValues;
		let answerValues;

		if (typeof attemptFieldValue != "object")
		{
			if (typeof attemptFieldValue == "number")
			{
				if (answerFieldValue > attemptFieldValue)
				{
					attemptFieldElement.classList.add("Higher");
				}
				else if (answerFieldValue < attemptFieldValue)
				{
					attemptFieldElement.classList.add("Lower");
				}
			}
			else if (Object.keys(universeData.metadata.orders).includes(fieldNames[i]))
			{
				let order = universeData.metadata.orders[fieldNames[i]];
				let attemptValueIndex = order.indexOf(attemptFieldValue);
				let answerValueIndex = order.indexOf(answerFieldValue);

				if (answerValueIndex > attemptValueIndex)
				{
					attemptFieldElement.classList.add("Higher");
				}
				else if (answerValueIndex < attemptValueIndex)
				{
					attemptFieldElement.classList.add("Lower");
				}
			}

			attemptValues = [attemptFieldValue];
			answerValues = [answerFieldValue];
		}
		else
		{
			attemptValues = attemptFieldValue;
			answerValues = answerFieldValue;
		}

		let nbCorrect = 0;

		for (const arrayValue of attemptValues)
		{
			if (answerValues.includes(arrayValue))
				nbCorrect++;
		}

		if (nbCorrect == attemptValues.length)
		{
			attemptFieldElement.className += " Correct";
		}
		else if (nbCorrect > 0)
		{
			attemptFieldElement.className += " Partial";
		}

		if (attemptValues.length <= 0)
		{
			attemptValues = "×";
		}

		for (let value of attemptValues)
		{
			let valueParagraph = document.createElement("p");
			valueParagraph.innerText = value;
			attemptFieldElement.appendChild(valueParagraph);
		}

		attemptRow.appendChild(attemptFieldElement);
	}

	guessesBody.prepend(attemptRow);
}

function ShowPageContent(universeData)
{
	let guessesHeadElement = document.getElementById("GuessesHead");
	document.getElementById("Title").innerText = universeData.metadata.universeName;
	document.getElementsByTagName("Title")[0].innerText = "Universdle - " + universeData.metadata.universeName;

	for (let fieldName in universeData.metadata.fieldNames[language])
	{
		if (Object.hasOwnProperty.call(universeData.metadata.fieldNames[language], fieldName))
		{
			let headCell = document.createElement("th");
			headCell.innerText = universeData.metadata.fieldNames[language][fieldName];
			guessesHeadElement.appendChild(headCell);
		}
	}
}