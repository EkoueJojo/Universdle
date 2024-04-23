let universeFileName = "one_piece";
let language = "fr"

getUniverseData(universeFileName).then
(
	universeData =>
	{
		console.log(getAnswerOfTheDay(universeData.characters, 0, true)[language]);
	}
);

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

async function getUniverseData(fileName)
{
	return (await fetch(`./database/${fileName}.json`)).json();
}