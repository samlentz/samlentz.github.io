document.getElementById('leaderboard-button').addEventListener('click', function() {
    let password = document.getElementById('password').value;
    fetch('https://us-central1-famous-sunbeam-382202.cloudfunctions.net/getLeaderboard', {
        headers: { 'Password': password,"Content-Type": "application/json"}
    })
    .then(response => response.json())
    .then(data => {
        // populate leaderboard table
        let table = document.getElementById('leaderboard-table');
        // clear the table
        table.innerHTML = '';
        // add table headers
        let thead = table.createTHead();
        let row = thead.insertRow();
        let headers = ["Name", "Elo", "Wins", "Losses"];
        headers.forEach(header => {
            let th = document.createElement('th');
            let text = document.createTextNode(header);
            th.appendChild(text);
            row.appendChild(th);
        });
        // add table data
        data.forEach(player => {
            let row = table.insertRow();
            for (const [key, value] of Object.entries(player)) {
                let cell = row.insertCell();
                let text = document.createTextNode(value);
                cell.appendChild(text);
            }
        });
        document.getElementById('leaderboard-section').style.display = 'block';

    });
});
document.getElementById('submit-match-button').addEventListener('click', function() {
    fetch('https://us-central1-famous-sunbeam-382202.cloudfunctions.net/getUsers', {
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        // populate dropdowns
        let winnerDropdown = document.getElementById('winner-dropdown');
        let loserDropdown = document.getElementById('loser-dropdown');
        // clear the dropdowns
        winnerDropdown.innerHTML = '';
        loserDropdown.innerHTML = '';
        // add options to dropdowns
        data.forEach(user => {
            let winnerOption = document.createElement('option');
            winnerOption.text = user.Name;
            winnerDropdown.add(winnerOption);
            let loserOption = document.createElement('option');
            loserOption.text = user.Name;
            loserDropdown.add(loserOption);
        });
    });
    document.getElementById('match-section').style.display = 'block';

    // enable submit button
    document.getElementById('submit-match').disabled = false;
});

document.getElementById('submit-match').addEventListener('click', function() {
    let password = document.getElementById('password').value;
    let winner = document.getElementById('winner-dropdown').value;
    let loser = document.getElementById('loser-dropdown').value;
    fetch('https://us-central1-famous-sunbeam-382202.cloudfunctions.net/submitMatch', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            Winner: winner, 
            Loser: loser
        })
    
    }
    );
    document.getElementById('match-section').style.display = 'allow';


});
