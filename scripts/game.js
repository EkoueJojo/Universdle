let universeFileName = "one_piece";
let language = "fr";

getUniverseData(universeFileName).then
(
	universeData =>
	{
		ShowPageContent(universeData);
		retrieveCharacters(universeData);

		let answer = getAnswerOfTheDay(universeData.characters, 0, true);
		document.getElementById("GuessButton").addEventListener("click", function () { guess(universeData, answer[language]); });
	}
);

async function getUniverseData(fileName)
{
	return (await fetch(`../database/${fileName}.json`)).json();
}

function getAnswerOfTheDay(characters, day, relative = false, remainingCalls = 20)
{
	let date = relative ? new Date() : day;

	if (relative)
	{
		date.setDate(date.getDate() + day);
	}

	let seed = `${date.getUTCFullYear()}-${date.getUTCDate()}-${date.getUTCMonth()}`;

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
			console.log(attempt.names[0], answer.names[0]);
			attemptFieldValue = attempt.names[0];
			answerFieldValue = answer.names[0];
		}
		else
		{
			console.log(attempt[fieldNames[i]], answer[fieldNames[i]]);
			attemptFieldValue = attempt[fieldNames[i]];
			answerFieldValue = answer[fieldNames[i]];
		}

		let attemptFieldElement = document.createElement("td");
		attemptFieldElement.className = "AttemptField";

		let attemptValues;

		if (typeof attemptFieldValue != "object")
		{
			attemptValues = [attemptFieldValue];
		}
		else
		{
			attemptValues = attemptFieldValue;
		}

		if (JSON.stringify(attemptFieldValue) == JSON.stringify(answerFieldValue))
		{
			attemptFieldElement.className += " Correct";
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

	console.log(attempt);
	console.log(answer[language]);
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