let universeFileName = "one_piece";
let language = "fr";

getUniverseData(universeFileName).then
(
	universeData =>
	{
		updatePage(universeData);
		retrieveCharacters(universeData);

		let answer = getAnswerOfTheDay(universeData.characters, 0, true);
		document.getElementById("GuessButton").addEventListener("click", function () { guess(universeData, answer); });
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
	let attemptName = characterField.value;
	let attempt = null;

	for (const character of universeData.characters)
	{
		if (character[language].names.includes(attemptName))
		{
			attempt = character[language];
		}
	}

	console.log(universeData.metadata);

	console.log(attempt);
	console.log(answer[language]);
}

function updatePage(universeData)
{
	document.getElementById("Title").innerText = universeData.metadata.universeName;
	document.getElementsByTagName("Title")[0].innerText = "Universdle - " + universeData.metadata.universeName;

	for (const fieldName in universeData.metadata.fieldNames[language])
	{
		if (Object.hasOwnProperty.call(universeData.metadata.fieldNames[language], fieldName))
		{
			if (fieldName != "hints")
			{
				let headerText = universeData.metadata.fieldNames[language][fieldName];
				console.log(fieldName, headerText);
			}
		}
	}
}