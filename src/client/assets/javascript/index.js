// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				//console.log(tracks.body);
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				//console.log(racers.body);
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()

			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate()
		}

	}, false)
}

async function delay(ms) {
	try
	{
		return await new Promise(resolve => setTimeout(resolve, ms));
	}

	catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// render starting UI
	renderAt('#race', renderRaceStartView(getTracks(), getRacers()))

	// TODO - Get player_id and track_id from the store
	let player = store.player_id;
	let track = store.track_id;

	// const race = TODO - invoke the API call to create the race, then save the result
	const race = await createRace(player, track)

	// TODO - update the store with the race id
	// For the API to work properly, the race id should be race id - 1
	store.race_id = parseInt(race.ID - 1);

	console.log(race);
	console.log(race.ID);
	console.log(store.race_id);

	// The race has been created, now start the countdown
	// TODO - call the async function runCountdown
	await runCountdown();

	// TODO - call the async function startRace
	await startRace(store.race_id);
	//await startRace2(store.race_id);

	// TODO - call the async function runRace
	runRace(store.race_id);
}

function runRace(raceID) {
	try{
		return new Promise(resolve => {

			// TODO - use Javascript's built in setInterval method to get race info every 500ms
			let interval = setInterval(() => {
				raceInfo(raceID, interval);
			}, 500)

			// resolve the promise
			resolve()
		})
	}

	// remember to add error handling for the Promise
	catch(error)
	{
		console.log(error);
	}
}

async function raceInfo (raceID, raceInterval)
{

		let raceInfo = await getRace(raceID)
		console.log(raceInfo);

		/*
		TODO - if the race info status property is "in-progress", update the leaderboard by calling:

		renderAt('#leaderBoard', raceProgress(res.positions))
		*/
		if(raceInfo.status === "in-progress")
		{
			renderAt('#leaderBoard', raceProgress(raceInfo.positions))
		}

		/*
		TODO - if the race info status property is "finished", run the following:

		clearInterval(raceInterval) // to stop the interval from repeating
		renderAt('#race', resultsView(res.positions)) // to render the results view
		reslove(res) // resolve the promise
		*/
		else if(raceInfo.status === "finished")
		{
			clearInterval(raceInterval) // to stop the interval from repeating
			renderAt('#race', resultsView(raceInfo.positions)) // to render the results view
		}
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3;

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			let interval = setInterval(time, 1000);

			function time()
			{
				// run this DOM manipulation to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = --timer;

				//if the countdown is done, clear the interval, resolve the promise, and return
				if(timer <= 0)
				{
					clearInterval(interval);
					resolve();
				}
			}
		}
	)}

	catch(error)
	{
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected racer to the store
	store.player_id = target.id;
	console.log(store.player_id);
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected track id to the store
	store.track_id = target.id;
	console.log(store.track_id);
}

function handleAccelerate() {
	console.log("accelerate button clicked")

	// TODO - Invoke the API call to accelerate
	accelerate(store.race_id);
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	console.log(tracks);
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	console.log(track)
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === parseInt(store.player_id))
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints

async function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	try{
		let tracks;
		await fetch(`${SERVER}/api/tracks`)
		.then((data) => data.json())
		.then(data => tracks = data)
		return tracks
	}

	catch(error)
	{
		console.log(error);
	}
}

async function getRacers() {
	// GET request to `${SERVER}/api/cars`
	try
	{
		let racers;
		await fetch(`${SERVER}/api/cars`)
		.then(data => data.json())
		.then(data => racers = data)
		console.log(racers);
		return racers;
	}

	catch(error)
	{
		console.log(error);
	}
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }

	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with createRace request::", err))
}

async function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	try
	{
		let races;
		await fetch(`${SERVER}/api/races/${id}`)
		.then((data) => data.json())
		.then(data => races = data)
		return races
	}

	catch(error)
	{
		console.log(error);
	}
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	// Error occurs here (i guess because there is no information returned from this api call)
	//.then(res => res.json())
	//.then(res => console.log(res))
	.catch(err => console.log("Problem with getRace request::", err))
}

// this was for testing purposes to see if it would fix the startRace problem
async function startRace2(id)
{
	try{
		let initData = await fetch(`${SERVER}/api/races/${id}/start`, {
			method: 'POST',
			...defaultFetchOpts(),
		})
		console.log(initData.body);
		let stringify = await JSON.stringify(initData);
		console.log(stringify);
		let viewData = await JSON.parse(stringify);
		// empty object...
		console.log(viewData);
		let actualData = await initData.json();
		return actualData;
	}

	catch(error)
	{
		console.log(error);
	}
}

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: "POST",
		...defaultFetchOpts()
	})
	.catch(error => console.log(error))
}
