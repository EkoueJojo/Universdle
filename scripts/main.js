let universeFileName = "one_piece";

getUniverseData(universeFileName).then
(
	universeData =>
	{
		console.log(getAnswerOfTheDay(universeData, 0, true).fr);
	}
);

function getAnswerOfTheDay(universeData, day, relative = false, remainingCalls = 20)
{
	let date = relative ? new Date() : day;

	if (relative)
	{
		date.setDate(date.getDate() + day);
	}

	let seed = `${date.getUTCFullYear()}-${date.getUTCDate()}-${date.getUTCMonth()}`;

	rng = new Math.seedrandom(seed);
	let randomNumber = Math.floor(rng() * universeData.length);

	if (remainingCalls > 0)
	{
		date.setDate(date.getDate() - 1);
		let lastDayAnswer = getAnswerOfTheDay(universeData, date, false, remainingCalls - 1);

		while (universeData[randomNumber] == lastDayAnswer)
		{
			randomNumber = Math.floor(rng() * universeData.length);
		}
	}

	return universeData[randomNumber];
}

async function getUniverseData(fileName)
{
	return (await fetch(`./database/${fileName}.json`)).json();
}