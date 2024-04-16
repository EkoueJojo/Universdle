let universeFileName = "one_piece";

getUniverseData(universeFileName).then
(
	universeData =>
	{
		console.log(universeData);

		for (let i = 0; i < 20; i++)
		{
			console.log(getAnswerOfTheDay(universeData, i, true).fr.names[0]);
		}
	}
);

function getAnswerOfTheDay(universeData, day, relative = false, remainingCalls = 50)
{
	let date = relative ? new Date() : day;

	if (relative)
	{
		date.setDate(date.getDate() + day);
	}

	let seed = `${date.getUTCFullYear()}-${date.getUTCDate()}-${date.getUTCMonth()}`;
	console.log(seed);

	rng = new Math.seedrandom(seed);
	let randomNumber = Math.floor(rng() * universeData.length);

	if (remainingCalls > 0)
	{
		let lastDayAnswer = getAnswerOfTheDay(universeData, day - 1 * 1000 * 60 * 60 * 24, false, remainingCalls - 1);

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