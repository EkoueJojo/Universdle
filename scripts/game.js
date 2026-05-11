const params = new URLSearchParams(window.location.search);
let universeFileName = params.get('universe');
let language = "fr";
let attemptedCharacters = Array();
let resultFocusIndex = 0;

getUniverseData(universeFileName).then
	(
		universeData =>
		{
			ShowPageContent(universeData);
			//retrieveCharacters(universeData);

			let fieldElement = document.getElementById("GuessField");

			fieldElement.addEventListener
				(
					"keyup",
					function (e)
					{
						let resultsContainer = document.getElementById("SearchResults");
						let children = resultsContainer.children;

						if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Enter")
						{
							e.preventDefault();

							switch (e.key)
							{
								case "ArrowUp":
									resultFocusIndex--;
									break;
								case "ArrowDown":
									resultFocusIndex++;
									break;
								case "Enter":
									fieldElement.value = children[resultFocusIndex].children[1].textContent;
									attemptedCharacters.push(fieldElement.value.trim());
									guess(universeData, answer[language]);
									fieldElement.value = "";
									resultsContainer.innerHTML = "";
									break;
							}

							if (children.length == 0)
							{
								resultFocusIndex = 0;
								return;
							}

							if (resultFocusIndex >= 0)
							{
								resultFocusIndex %= children.length;
							}
							else
							{
								resultFocusIndex = children.length - 1;
							}

							Array.from(document.getElementsByClassName("SelectedResult")).forEach(element =>
							{
								element.classList.remove("SelectedResult");
							});

							children[resultFocusIndex].classList.add("SelectedResult");
							children[resultFocusIndex].scrollIntoView({ behavior: "smooth", block: "nearest" });

							return;
						}

						resultsContainer.innerHTML = "";
						let characterCount = 0;

						for (let character of universeData.characters)
						{
							for (let name of character[language].names)
							{
								if (fieldElement.value.trim() != "" && (name.toLowerCase().startsWith(fieldElement.value) || name.toUpperCase().startsWith(fieldElement.value)))
								{
									if (!attemptedCharacters.includes(character[language].names[0]))
									{
										let characterI = characterCount;

										let resultContainer = document.createElement("div");
										resultContainer.className = "SearchResult";

										let imageElement = document.createElement("img");
										imageElement.className = "CharacterImageSelect";
										imageElement.src = getCharacterImage(universeFileName, character[language].imagePath);

										let nameElement = document.createElement("p");
										nameElement.innerText = character[language].names[0];

										let surnameElement = document.createElement("p");
										if (character[language].names.length > 1)
										{
											surnameElement.innerText = "alias " + character[language].names[1];
											surnameElement.className = "alias";
										}

										resultContainer.appendChild(imageElement);
										resultContainer.appendChild(nameElement);
										resultContainer.appendChild(surnameElement);
										resultsContainer.appendChild(resultContainer);

										resultContainer.addEventListener("click", function ()
										{
											fieldElement.value = children[resultFocusIndex].children[1].textContent;
											attemptedCharacters.push(resultsContainer.children[resultFocusIndex].children[1].textContent);
											guess(universeData, answer[language]);
											fieldElement.value = "";
											resultsContainer.innerHTML = "";
										});

										resultContainer.addEventListener("mouseover", function ()
										{
											if (resultFocusIndex == characterI)
											{
												return;
											}

											resultFocusIndex = characterI;

											Array.from(document.getElementsByClassName("SelectedResult")).forEach(element =>
											{
												element.classList.remove("SelectedResult");
											});

											resultContainer.classList.add("SelectedResult");
											resultContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
										});

										characterCount++;
									}
									break;
								}
							}
						}

						resultFocusIndex = 0;

						Array.from(document.getElementsByClassName("SelectedResult")).forEach(element =>
						{
							element.classList.remove("SelectedResult");
						});

						children[resultFocusIndex].classList.add("SelectedResult");
						children[resultFocusIndex].scrollIntoView({ behavior: "smooth", block: "nearest" });
					}
				);

			document.getElementById("GuessButton").addEventListener("click", function ()
			{
				if (!attemptedCharacters.includes(fieldElement.value.trim()))
				{
					attemptedCharacters.push(fieldElement.value.trim());
					guess(universeData, answer[language]);
					fieldElement.value = "";
				}
			});

			let answer = getAnswerOfTheDay(universeData.characters);
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

function getAnswerOfTheDay(characters, date = new Date())
{
	let seed = getDateString(date);

	rng = new Math.seedrandom(seed);
	let randomNumber = Math.floor(rng() * characters.length);

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
		datalistElement.addEventListener("click", guess);
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
			break;
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
				characterField.readOnly = true;
				//alert("vous avez trouvé");
				let victoryField = document.getElementById("Victory");
				let div = document.createElement("h1");
				div.id = "victory";
				div.textContent = "🎉 Vous avez trouvé en " + attemptedCharacters.length + " essai(s) ! 🎉";
				victoryField.appendChild(div);
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

		if (attemptFieldValue === null || answerFieldValue === null)
		{
			attemptValues = [];
			answerValues = answerFieldValue === null ? [] : [null];
		}
		else if (typeof attemptFieldValue != "object")
		{
			if (typeof attemptFieldValue == "number" && answerFieldValue !== null)
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

		if (nbCorrect == attemptValues.length && nbCorrect == answerValues.length)
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