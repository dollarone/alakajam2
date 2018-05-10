let WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: 9977})

console.log('Server started on 9977')


let players = []
currentPlayer = 0

let start_x = 4
let start_y = 2

let next_player_id = 0

let playerName = [2]
playerName[0] = "Player 1"
playerName[1] = "Player 2"

let factions = [2]
factions[0] = "Player 1"
factions[1] = "Player 2"

let turn = 0

let staticUsers = {}
let games = {}
let staticGameNumber = -1
let earliestOnGoingGame = 0

let waiting = {}
for (let y=0; y<4; y++) {
    waiting[y] = {}
    waiting[y]["user"] = null
    waiting[y]["ws"] = null
}

wss.on('connection', function(ws) {
console.log(ws)
    console.log('connected: ' + ws.upgradeReq.headers['sec-websocket-key'])
    var user = ws.upgradeReq.headers['sec-websocket-key']
//    console.log('connected: ' + ws.upgradeReq.headers['sec-websocket-key']);
    if (user in staticUsers) {
        console.log("user already registered?")
    }
    else {
        staticUsers[user] = {}

        let payload = new Object()
        payload["status"] = "registered"
        console.log("registration: #" + " (" + user + ")")
        ws.send(JSON.stringify(payload))
    }

    let usersGameNumber = 0

    ws.on('message', function(message) {       
        let incomingMsg = JSON.parse(message)

        if (usersGameNumber == -1) {
            usersGameNumber = ws.gameNumber
            console.log("it worked! setting " + usersGameNumber + " to " + ws.gameNumber)
        }
        if (user in staticUsers) {
            
            //players[users[user]].action = incomingMsg.action;
            //console.log("action from #" + users[user] + " " + players[users[user]].nick + ": " + incomingMsg.action);
            console.log("action from #" + user + " (current nick: " + staticUsers[user].nick + ") " + ": " + incomingMsg.action + " [" + incomingMsg.gameType + "]")
            for ( a in incomingMsg) { console.log(a + ": " + incomingMsg[a])}

            //if (incomingMsg.action == "setNick") {
            if ("nick" in incomingMsg) {
                if (incomingMsg.nick == null || incomingMsg.nick == undefined || incomingMsg.nick == "" || incomingMsg["nick"] == undefined) {
                    if (staticUsers[user] != undefined && (staticUsers[user].nick == null || staticUsers[user].nick == undefined || staticUsers[user].nick == "" || staticUsers[user]["nick"] == undefined)) {
                        //staticUsers[user].nick = "Dr. Rust"
                    }
                }
                else {
                    for(let i=0; i<games[usersGameNumber]["playerCount"]; i++) {
                        let userString = games[usersGameNumber]["players"][i]["user"]
                        if (userString == user && games[usersGameNumber]["currentPlayer"] == i) {
                            staticUsers[user].nick = incomingMsg.nick
                            games[usersGameNumber]["players"][i]["nick"] = incomingMsg.nick
                            console.log(user + " setNick to : " + staticUsers[user].nick)
                        }
                    }
                }



                //let payload = new Object();
                //payload["status"] = "nickChanged";
                //payload["nick"] = staticUsers[user].nick
                //ws.send(JSON.stringify(payload));
            }
            if (incomingMsg.action == "findGame") {
                if (incomingMsg.gameType == "online") {
                    if (waiting[incomingMsg.level]["user"] == null) {
                        //wait
                        waiting[incomingMsg.level]["user"] = user
                        waiting[incomingMsg.level]["ws"] = ws

                        usersGameNumber = -1

                        let payload = new Object()
                        payload["status"] = "waitingForGame"
                        console.log("waiting for game: " + user + " on level " + incomingMsg.level)
                        ws.send(JSON.stringify(payload))
                    }
                    else {
                        let usersInGame = [2]
                        usersInGame[0] = waiting[incomingMsg.level]["user"]
                        usersInGame[1] = user
                        waiting[incomingMsg.level]["user"] = null
                        let usersWs = [2]
                        usersWs[0] = waiting[incomingMsg.level]["ws"]
                        usersWs[1] = ws

                        waiting[incomingMsg.level]["ws"] = null
                        usersGameNumber = startNewGame(usersWs, usersInGame, incomingMsg.gameType, false)
                        usersWs[0].gameNumber = usersGameNumber
                    }
                }
                // if another findGame, join and send Start
                // type: local = just start immediately, assume client will send both p1 and p2 (>2?)
                // ,ai,
                // ,online
                // also provide map (or random)
                else if (incomingMsg.gameType == "ai_easy") {
                    let usersInGame = [2]
                    usersInGame[0] = user
                    usersInGame[1] = user
                    let usersWs = [2]
                    usersWs[0] = ws
                    usersWs[1] = ws
                    usersGameNumber = startNewGame(usersWs, usersInGame, incomingMsg.gameType, false)
                }

            }
            else if (incomingMsg.action == "endTurn") {
                for(let i=0; i<games[usersGameNumber]["playerCount"]; i++) {
                    let userString = games[usersGameNumber]["players"][i]["user"]
                    if (userString == user && games[usersGameNumber]["currentPlayer"] == i) {
                        console.log(user + " ending turn in game " + usersGameNumber)
                        endTurn(incomingMsg, usersGameNumber)
                        break // because local multiplayer
                    }
                }
            }
            else if (incomingMsg.action == "rematch") {
                for(let i=0; i<games[usersGameNumber]["playerCount"]; i++) {
                    let userString = games[usersGameNumber]["players"][i]["user"]
                    if (userString == user) {
                        console.log(user + " want rematch in game " + usersGameNumber)
                        games[usersGameNumber]["players"][i]["status"] = "rematch"
                    }
                }
                let rematch = true
                for(let i=0; i<games[usersGameNumber]["playerCount"]; i++) {
                    if (games[usersGameNumber]["players"][i]["status"] != "rematch") {
                        rematch = false
                        console.log("but " + games[usersGameNumber]["players"][i]["user"] + " says no")
                    }
                }
                if (rematch) {
                    usersGameNumber = startRematch(usersGameNumber)
                }
            }
            else if (incomingMsg.action == "endgame") {
                for(let i=0; i<games[usersGameNumber]["playerCount"]; i++) {
                    let userString = games[usersGameNumber]["players"][i]["user"]
                    if (userString == user) {
                        console.log(user + " ending game " + usersGameNumber)
//                        endTurn(incomingMsg, usersGameNumber)
                        break // because local multiplayer
                    }
                }
            }
            else if (incomingMsg.action == "deploy") {
                console.log(user + " moving in game  " + usersGameNumber + " currentplayer is " + games[usersGameNumber]["currentPlayer"])
                for(let i=0; i<games[usersGameNumber]["playerCount"]; i++) {
                    let userString = games[usersGameNumber]["players"][i]["user"]
                    if (userString == user && games[usersGameNumber]["currentPlayer"] == i) {
                        console.log(user + " playing " + usersGameNumber)
                        deploy(incomingMsg, usersGameNumber, i)
                        endTurn(incomingMsg, usersGameNumber)

                        if (games[usersGameNumber]["gameType"] == "ai_easy" && games[usersGameNumber]["turns"] <= 9) {
                            
                            deployRandom(usersGameNumber)
                            endTurn(incomingMsg, usersGameNumber)
                        }
                        //iif ai_game, deploy or calculate combat
                        if (games[usersGameNumber]["turns"] > 9) {
                            updateUnits(usersGameNumber)
                            resolveCombat(usersGameNumber)
                        }
                        break // because local multiplayer
                    }
                    else {
                        console.log(user + " fail " + userString)
                    }
                }


            }
            else if (incomingMsg.action == "continue") {
                console.log(user + " continuing in game  " + usersGameNumber + " currentplayer is " + games[usersGameNumber]["currentPlayer"])
                for(let i=0; i<games[usersGameNumber]["playerCount"]; i++) {
                    let userString = games[usersGameNumber]["players"][i]["user"]
                    if (userString == user) {
                        games[usersGameNumber]["players"][i]["status"] = "continue"
                    }
                }
                let allContinue = true
                for(let i=0; i<games[usersGameNumber]["playerCount"]; i++) {
                    if(games[usersGameNumber]["players"][i]["status"] != "continue") {
                        allContinue = false
                    }
                }
                if (allContinue) {
                    startNewRound(usersGameNumber)
                }

            }
            else {
                console.log("action from unknown user (" + user + "): " + incomingMsg.action)
            }

        }
        
    })
})

//             this.ws.send(JSON.stringify({action: "attack", orgX: attacker.mapX, orgY: attacker.mapY, destX: target, destY: destY, frame:attacker.sprite.frame}))

function surrender(incomingMsg, gameNumber) {

    games[gameNumber]["status"] = "surrendered"
    let returnStatus = "gameOver"
    let sentUsers = {}
    let users = games[gameNumber]["players"]
    for (let user=0; user<users.length; user++) {
        let userString = games[gameNumber]["players"][user]["user"]
        let payload = new Object()
        payload["status"] = returnStatus
        payload["loser"] = games[gameNumber]["currentPlayer"]
        console.log("in attack loop " + user + " /" + userString )

        if (sentUsers[userString] != undefined) {
        }
        else {
            games[gameNumber]["players"][user]["ws"].send(JSON.stringify(payload))
            sentUsers[userString] = true
            console.log( "sending " + payload["status"] + " to " + userString)
            console.log(JSON.stringify(sentUsers))
            delete staticUsers[userString]
        }
    }    
}


function checkWin(gameNumber) {
}

function announceWin(gameNumber, pl) {

    games[gameNumber]["status"] = "finished"
    let returnStatus = "gameOver"
    let sentUsers = {}
    let users = games[gameNumber]["players"]
    for (let user=0; user<users.length; user++) {
        let userString = games[gameNumber]["players"][user]["user"]
        let payload = new Object()
        payload["status"] = returnStatus
        payload["loser"] = pl
        console.log("in attack loop " + user + " /" + userString )

        if (sentUsers[userString] != undefined) {
        }
        else {
            games[gameNumber]["players"][user]["ws"].send(JSON.stringify(payload))
            sentUsers[userString] = true
            console.log( "sending " + payload["status"] + " to " + userString)
            console.log(JSON.stringify(sentUsers))
            delete staticUsers[userString]
        }
    }    

}

function deployRandom(gameNumber) {
    let player = games[gameNumber]["currentPlayer"]
    let nextToDeploy = games[gameNumber]["players"][player]["nextToDeploy"]
    games[gameNumber]["players"][player]["nextToDeploy"] += 1
    console.log("gameNumber " + gameNumber + " and player " + player + " and nextToDeploy " + nextToDeploy)// + games[gameNumber])//["players"][player]["unitsToDeploy"])
    let incomingMsg = {}
    incomingMsg.unit = games[gameNumber]["players"][player]["unitsToDeploy"][nextToDeploy]
    incomingMsg.lane = getRandomInt(0, 3)
    if (nextToDeploy < 2) {
        incomingMsg.smoke = true
    }
    else {
        incomingMsg.smoke = false
    }
    deploy(incomingMsg, gameNumber, player)

}

function updateUnits(gameNumber) {
    let payload = new Object()
    let sentUsers = {}
    let returnStatus = "updateUnits"

    let users = games[gameNumber]["players"]
    for (let user=0; user<users.length; user++) {
        let userString = games[gameNumber]["players"][user]["user"]
        
        payload["status"] = returnStatus
        payload["units"] = {}
        payload["units"][0] = games[gameNumber]["players"][0]["deployedLanes"]
        payload["units"][1] = games[gameNumber]["players"][1]["deployedLanes"]
        if (sentUsers[userString] != undefined) {
        }
        else {
            games[gameNumber]["players"][user]["ws"].send(JSON.stringify(payload))
            sentUsers[userString] = true
            console.log( "sending " + payload["status"] + " to " + userString)
            console.log(JSON.stringify(sentUsers))
        }
    }    
}

function resolveCombat(gameNumber) {
    let damage = {}
    damage[0] = 0
    damage[1] = 0
    let lane0 = resolve(gameNumber, 0)
    games[gameNumber]["players"][0]["hp"] -= lane0[0]
    games[gameNumber]["players"][1]["hp"] -= lane0[1]
    let lane1 = resolve(gameNumber, 1)
    games[gameNumber]["players"][0]["hp"] -= lane1[0]
    games[gameNumber]["players"][1]["hp"] -= lane1[1]
    let lane2 = resolve(gameNumber, 2)
    games[gameNumber]["players"][0]["hp"] -= lane2[0]
    games[gameNumber]["players"][1]["hp"] -= lane2[1]

    damage[0] += lane0[0] + lane1[0] + lane2[0]
    damage[1] += lane0[1] + lane1[1] + lane2[1]
    console.log("damege to player 0: " + damage[0])
    console.log("damege to player 1: " + damage[1])

    let payload = new Object()
    let sentUsers = {}

    let returnStatus = "combatResolved"

    let users = games[gameNumber]["players"]
    let user0HP = games[gameNumber]["players"][0]["hp"]
    let user1HP = games[gameNumber]["players"][1]["hp"]

/*
    let user0HP = games[gameNumber]["players"][0]["hp"] - damage[0]
    let user1HP = games[gameNumber]["players"][1]["hp"] - damage[1]
    games[gameNumber]["players"][0]["hp"] -= damage[0]
    games[gameNumber]["players"][1]["hp"] -= damage[1]
*/
    for (let user=0; user<users.length; user++) {
        let userString = games[gameNumber]["players"][user]["user"]
        
        payload["status"] = returnStatus
        payload["players"] = {}
        payload["players"][0] = user0HP
        payload["players"][1] = user1HP

        if (sentUsers[userString] != undefined) {
        }
        else {
            games[gameNumber]["players"][user]["ws"].send(JSON.stringify(payload))
            sentUsers[userString] = true
            console.log( "sending " + payload["status"] + " to " + userString)
            console.log(JSON.stringify(sentUsers))
        }
    }    

}

let damageFrom = {}
damageFrom["peasant"] = 1
damageFrom["swordsman"] = 2
damageFrom["knight"] = 3
damageFrom["pikeman"] = 3
damageFrom["shieldman"] = 1

let unitStats = {}
unitStats["peasant"] = {}
unitStats["peasant"]["attack"] = 1
unitStats["peasant"]["health"] = 1
unitStats["swordsman"] = {}
unitStats["swordsman"]["attack"] = 2
unitStats["swordsman"]["health"] = 2
unitStats["knight"] = {}
unitStats["knight"]["attack"] = 3
unitStats["knight"]["health"] = 3
unitStats["pikeman"] = {}
unitStats["pikeman"]["attack"] = 3
unitStats["pikeman"]["health"] = 1
unitStats["shieldman"] = {}
unitStats["shieldman"]["attack"] = 1
unitStats["shieldman"]["health"] = 2


function resolve(gameNumber, lane) {
    let size0 = games[gameNumber]["players"][0]["deployedLanes"][lane]["size"]
    let size1 = games[gameNumber]["players"][1]["deployedLanes"][lane]["size"]
    let unit0 = null
    let unit1 = null
    console.log("size1: " +  size1)
    let damage = {}
    damage[0] = 0
    damage[1] = 0

    if ((games[gameNumber]["players"][0]["hp"] - damage[0] < 1) ||
        (games[gameNumber]["players"][1]["hp"] - damage[1] < 1)) {
        return damage
    }

    while (size0 + size1 > 0) {
        if (size0 == 0) {
            for (let i=0; i<size1; i++) {
                let unit = games[gameNumber]["players"][1]["deployedLanes"][lane][i]["unit"]
                console.log( "adding dmg from " + games[gameNumber]["players"][1]["deployedLanes"][lane][i])
                damage[0] += games[gameNumber]["players"][1]["deployedLanes"][lane][i]["attack"]
                if (games[gameNumber]["players"][0]["hp"] - damage[0] < 1) {
                    return damage
                }

            }

            return damage
        }
        else if (size1 == 0) {
            for (let i=0; i<size0; i++) {
                let unit = games[gameNumber]["players"][0]["deployedLanes"][lane][i]["unit"]
                console.log( "adding dmg from " + games[gameNumber]["players"][0]["deployedLanes"][lane][i])
                damage[1] += games[gameNumber]["players"][0]["deployedLanes"][lane][i]["attack"]
                if (games[gameNumber]["players"][1]["hp"] - damage[1] < 1) {
                    return damage
                }
            }
            return damage
        }
        else {
            let team0Challenger = games[gameNumber]["players"][0]["deployedLanes"][lane][0]
            let team1Challenger = games[gameNumber]["players"][1]["deployedLanes"][lane][0]
            console.log("CHALLENGER team0: " + team0Challenger["unit"] + " " + team0Challenger["attack"] + "/" + team0Challenger["health"])
            console.log("CHALLENGER team1: " + team1Challenger["unit"] + " " + team1Challenger["attack"] + "/" + team1Challenger["health"])
            team0Challenger["health"] -=  team1Challenger["attack"]
            team1Challenger["health"] -=  team0Challenger["attack"]
            if (team0Challenger["health"] < 1) {
                //games[gameNumber]["players"][0]["deployedLanes"][lane]["size"] -= 1
                size0-=1
                // = games[gameNumber]["players"][0]["deployedLanes"][lane]["size"]
                for (let i=0; i<size0; i++) {
                    games[gameNumber]["players"][0]["deployedLanes"][lane][i] = games[gameNumber]["players"][0]["deployedLanes"][lane][i+1]
                }
                console.log("A DEATH!")
            }
            if (team1Challenger["health"] < 1) {
                ///games[gameNumber]["players"][1]["deployedLanes"][lane]["size"] -= 1
                size1 -= 1
                //games[gameNumber]["players"][1]["deployedLanes"][lane]["size"]
                for (let i=0; i<size1; i++) {
                    games[gameNumber]["players"][1]["deployedLanes"][lane][i] = games[gameNumber]["players"][1]["deployedLanes"][lane][i+1]
                }
                console.log("A DEATH!")
            }
            console.log("CHALLENGER team0: " + team0Challenger["unit"] + " " + team0Challenger["attack"] + "/" + team0Challenger["health"])
            console.log("CHALLENGER team1: " + team1Challenger["unit"] + " " + team1Challenger["attack"] + "/" + team1Challenger["health"])


            //return damage

        }
    }
    return damage
}

function deploy(incomingMsg, gameNumber, i) {
    console.log("deploy: " + incomingMsg)
    let payload = new Object()
    
    if (!'lane' in incomingMsg || parseInt(incomingMsg.lane) > 2) {
        console.log("unknown lane " + incomingMsg.lane)
        return 0
    }
    let siz = games[staticGameNumber]["players"][i]["deployedLanes"][incomingMsg.lane]["size"]
    if(incomingMsg.unit in unitStats) {
        games[staticGameNumber]["players"][i]["deployedLanes"][incomingMsg.lane][siz] = {}
        games[staticGameNumber]["players"][i]["deployedLanes"][incomingMsg.lane][siz]["unit"] = incomingMsg.unit
        games[staticGameNumber]["players"][i]["deployedLanes"][incomingMsg.lane][siz]["attack"] = unitStats[incomingMsg.unit]["attack"]
        games[staticGameNumber]["players"][i]["deployedLanes"][incomingMsg.lane][siz]["health"] = unitStats[incomingMsg.unit]["health"]
        console.log("added zaza " + games[staticGameNumber]["players"][i]["deployedLanes"][incomingMsg.lane][siz])
        games[staticGameNumber]["players"][i]["deployedLanes"][incomingMsg.lane]["size"] += 1
    }
    else {
        console.log("unknown unit: " + incomingMsg.unit)
    }


    if (incomingMsg.smoke && games[staticGameNumber]["players"][i]["smokes"] > 0) {
        let size = games[staticGameNumber]["players"][i]["displayedLanes"][incomingMsg.lane]["size"]
        games[staticGameNumber]["players"][i]["displayedLanes"][incomingMsg.lane][size] = "smoke"
        payload["unitDeployed"] = "smoke"
        games[staticGameNumber]["players"][i]["smokes"] -= 1
    
    }
    else {
        let size = games[staticGameNumber]["players"][i]["displayedLanes"][incomingMsg.lane]["size"]
        if(incomingMsg.unit in unitStats) {
            games[staticGameNumber]["players"][i]["displayedLanes"][incomingMsg.lane][size] = incomingMsg.unit
            games[staticGameNumber]["players"][i]["displayedLanes"][incomingMsg.lane]["size"] += 1
            payload["unitDeployed"] = incomingMsg.unit
        }
        else {
            console.log("2unknown unit: " + incomingMsg.unit)
        }
    }
    payload["laneDeployed"] = incomingMsg.lane

    let sentUsers = {}


    let returnStatus = "deployed"

    let users = games[gameNumber]["players"]

    for (let user=0; user<users.length; user++) {
        let userString = games[gameNumber]["players"][user]["user"]
        
        payload["status"] = returnStatus
        payload["playerNumber"] = i


        if (sentUsers[userString] != undefined) {
        }
        else {
            games[gameNumber]["players"][user]["ws"].send(JSON.stringify(payload))
            sentUsers[userString] = true
            console.log( "sending " + payload["status"] + " to " + userString)
            console.log(JSON.stringify(sentUsers))
        }
    }    
}


function endTurn(incomingMsg, gameNumber) {
    let sentUsers = {}
    let users = games[gameNumber]["players"]
    
    games[gameNumber]["turns"] += 1
    games[gameNumber]["currentPlayer"] = games[gameNumber]["currentPlayer"] +1//)% games[gameNumber]["playerCount"]
    games[gameNumber]["currentPlayer"] = games[gameNumber]["currentPlayer"] % 2

    for (let user=0; user<users.length; user++) {
        let userString = games[gameNumber]["players"][user]["user"]
        let payload = new Object()
        payload["status"] = "newTurn"
        payload["currentPlayer"] = games[gameNumber]["currentPlayer"]
        payload["players"] = {}
        payload["players"][0] = {}
        payload["players"][0]["nick"] = games[gameNumber]["players"][0]["nick"]
        payload["players"][1] = {}
        payload["players"][1]["nick"] = games[gameNumber]["players"][1]["nick"]
//        payload["opponentNick"] = incomingMsg.nick
        console.log("in loop " + user + " /" + users[user] )

        if (sentUsers[userString] != undefined) {
        }
        else {
            games[gameNumber]["players"][user]["ws"].send(JSON.stringify(payload))
            sentUsers[userString] = true
            console.log( "sending " + payload["status"] + " to " + userString)
            console.log(JSON.stringify(sentUsers))
        }
    }

}

randomNames = {}
randomNames[0] = "Arthur"
randomNames[1] = "Merlin"
randomNames[2] = "Lancelot"
randomNames[3] = "Gawain"
randomNames[4] = "Geraint"
randomNames[5] = "Percival"
randomNames[6] = "Bors"
randomNames[7] = "Kay"
randomNames[8] = "Lamorak"
randomNames[9] = "Brave Sir Robin"
randomNames[10] = "Lancelot"
randomNames[11] = "Patsy"
randomNames[12] = "Bedevere"
randomNames[13] = "Galahad"
randomNames[14] = "Venger"
randomNames[15] = "Frank"
randomNames[16] = "Wenger"


function startNewRound(staticGameNumber) {
    let usersLength = 2
    games[staticGameNumber]["currentPlayer"] = (games[staticGameNumber]["currentPlayer"] + 1) % 2

    for (let x=0; x<usersLength; x++) {
        games[staticGameNumber]["players"][x]["deployedLanes"][0] = {}
        games[staticGameNumber]["players"][x]["deployedLanes"][1] = {}
        games[staticGameNumber]["players"][x]["deployedLanes"][2] = {}
        games[staticGameNumber]["players"][x]["deployedLanes"][0]["size"] = 0
        games[staticGameNumber]["players"][x]["deployedLanes"][1]["size"] = 0 
        games[staticGameNumber]["players"][x]["deployedLanes"][2]["size"] = 0
        games[staticGameNumber]["players"][x]["displayedLanes"][0] = {}
        games[staticGameNumber]["players"][x]["displayedLanes"][1] = {}
        games[staticGameNumber]["players"][x]["displayedLanes"][2] = {}
        games[staticGameNumber]["players"][x]["displayedLanes"][0]["size"] = 0
        games[staticGameNumber]["players"][x]["displayedLanes"][1]["size"] = 0 
        games[staticGameNumber]["players"][x]["displayedLanes"][2]["size"] = 0
        games[staticGameNumber]["players"][x]["smokes"] = 2
        games[staticGameNumber]["players"][x]["status"] = "init"
    }
    games[staticGameNumber]["turns"] = 0

    games[staticGameNumber]["status"] = "started"
    games[staticGameNumber]["totalTurns"] += games[staticGameNumber]["turns"]
    games[staticGameNumber]["turns"] = 0

    let gameType = games[staticGameNumber]["gameType"]

    let units = {}
    units[0] = "peasant"
    units[1] = "swordsman"
    units[2] = "knight"
    units[3] = "shieldman"
    units[4] = "pikeman"
    let payload = new Object();
    if (gameType == "ai_easy") {
        games[staticGameNumber]["players"][1]["nextToDeploy"] = 0
        games[staticGameNumber]["players"][1]["unitsToDeploy"] = {}
        let done = 0
        while (done < 5) {
            let rn = getRandomInt(0,5)
            while (games[staticGameNumber]["players"][1]["unitsToDeploy"][rn] != undefined) {
                 rn = getRandomInt(0,5)
            }
            games[staticGameNumber]["players"][1]["unitsToDeploy"][rn] = units[done]

            done += 1
            console.log(rn + ": " + games[staticGameNumber]["players"][1]["unitsToDeploy"][rn])
        }
    }
    let sentUsers = {}

    for (let user=0; user<usersLength; user++) {
        
        let userString = games[staticGameNumber]["players"][user]["user"]
        payload["status"] = "newRoundStarted"
        payload["playerCount"] = games[staticGameNumber]["playerCount"]
        payload["currentPlayer"] = games[staticGameNumber]["currentPlayer"]
        payload["playerNumber"] = user
        if (sentUsers[userString] != undefined) {
        }
        else {
            games[staticGameNumber]["players"][user]["ws"].send(JSON.stringify(payload))
            sentUsers[userString] = true
            console.log( "sending newRoundStarted to " + userString)
            console.log(JSON.stringify(sentUsers))
        }

    }
    if (gameType == "ai_easy" && games[staticGameNumber]["currentPlayer"] == 1) {
        deployRandom(staticGameNumber)
        endTurn(new Object(), staticGameNumber)

    }

}

function startRematch(usersGameNumber) {
    console.log("rematch! in game " + usersGameNumber)
    let usersWs = [2]
    let usersInGame = [2]
    let gameType = games[usersGameNumber]["gameType"]
    for(let i=0; i<games[usersGameNumber]["playerCount"]; i++) {
        usersWs[i] = games[usersGameNumber]["players"][i]["ws"]
        usersInGame[i] = games[usersGameNumber]["players"][i]["user"]
    }
    usersGameNumber = startNewGame(usersWs, usersInGame, gameType, true)
    usersWs[0].gameNumber = usersGameNumber
    usersWs[1].gameNumber = usersGameNumber
    console.log("now is game " + usersGameNumber)

}
function startNewGame(ws, users, gameType, rematch) {
    staticGameNumber++
    games[staticGameNumber] = {}
    games[staticGameNumber]["gameNumber"] = staticGameNumber
    games[staticGameNumber]["playerCount"] = users.length
    games[staticGameNumber]["players"] = [users.length]
    games[staticGameNumber]["currentPlayer"] = getRandomInt(0, 2)
    console.log("starting player: " + games[staticGameNumber]["currentPlayer"])

    for (let x=0; x<users.length; x++) {
        games[staticGameNumber]["players"][x] = {}
        games[staticGameNumber]["players"][x]["user"] = users[x]
        games[staticGameNumber]["players"][x]["ws"] = ws[x]
        games[staticGameNumber]["players"][x]["deployedLanes"] = {}
        games[staticGameNumber]["players"][x]["displayedLanes"] = {}
        games[staticGameNumber]["players"][x]["deployedLanes"][0] = {}
        games[staticGameNumber]["players"][x]["deployedLanes"][1] = {}
        games[staticGameNumber]["players"][x]["deployedLanes"][2] = {}
        games[staticGameNumber]["players"][x]["deployedLanes"][0]["size"] = 0
        games[staticGameNumber]["players"][x]["deployedLanes"][1]["size"] = 0 
        games[staticGameNumber]["players"][x]["deployedLanes"][2]["size"] = 0
        games[staticGameNumber]["players"][x]["displayedLanes"][0] = {}
        games[staticGameNumber]["players"][x]["displayedLanes"][1] = {}
        games[staticGameNumber]["players"][x]["displayedLanes"][2] = {}
        games[staticGameNumber]["players"][x]["displayedLanes"][0]["size"] = 0
        games[staticGameNumber]["players"][x]["displayedLanes"][1]["size"] = 0 
        games[staticGameNumber]["players"][x]["displayedLanes"][2]["size"] = 0
        games[staticGameNumber]["players"][x]["smokes"] = 2
        games[staticGameNumber]["players"][x]["hp"] = 10
        games[staticGameNumber]["players"][x]["status"] = "init"
        games[staticGameNumber]["players"][x]["nick"] = "Player " + x+1
    }

    games[staticGameNumber]["gameType"] = gameType
    games[staticGameNumber]["turns"] = 0
    games[staticGameNumber]["totalTurns"] = 0
    games[staticGameNumber]["status"] = "started"
   
    let units = {}
    units[0] = "peasant"
    units[1] = "swordsman"
    units[2] = "knight"
    units[3] = "shieldman"
    units[4] = "pikeman"
    console.log(units)
    let payload = new Object();
    if (gameType == "ai_easy") {
        games[staticGameNumber]["players"][1]["nextToDeploy"] = 0
        games[staticGameNumber]["players"][1]["unitsToDeploy"] = {}
        let done = 0
        while (done < 5) {
            let rn = getRandomInt(0,5)
            while (games[staticGameNumber]["players"][1]["unitsToDeploy"][rn] != undefined) {
                 rn = getRandomInt(0,5)
            }
            games[staticGameNumber]["players"][1]["unitsToDeploy"][rn] = units[done]

            done += 1
            console.log(rn + ": " + games[staticGameNumber]["players"][1]["unitsToDeploy"][rn])
        }
        payload["opponentNick"] = randomNames[getRandomInt(0,14)]
    }
    let sentUsers = {}

    for (let user=0; user<users.length; user++) {
        
        let userString = games[staticGameNumber]["players"][user]["user"]
        payload["status"] = "gameStarted"
        payload["playerCount"] = games[staticGameNumber]["playerCount"]
        payload["currentPlayer"] = games[staticGameNumber]["currentPlayer"]
        payload["playerNumber"] = user
        payload["rematchStarted"] = rematch

        if (sentUsers[userString] != undefined) {
        }
        else {
            if(games[staticGameNumber]["players"][user]["ws"].readyState != games[staticGameNumber]["players"][user]["ws"].OPEN) {
                console.error('Client state is ' + games[staticGameNumber]["players"][user]["ws"].readyState)
                // TODO remove client and kill game and inform other player 
            }
            else{
                games[staticGameNumber]["players"][user]["ws"].send(JSON.stringify(payload))
                sentUsers[userString] = true
                console.log( "sending gameStarted to " + users[user] + " robots: " + payload["robots"])
                console.log(JSON.stringify(sentUsers))
            }
        }

    }


    if (gameType == "ai_easy" && games[staticGameNumber]["currentPlayer"] == 1) {
        deployRandom(staticGameNumber)
        endTurn(new Object(), staticGameNumber)

    }

    return staticGameNumber

}

let fs = require('fs')

let arg = process.argv[2]

function getDateTime() {

    let date = new Date();

    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    let min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    let sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    let year = date.getFullYear();

    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    let day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "/" + month + "/" + day + " " + hour + ":" + min + ":" + sec;

}



function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}



function distanceBetweenTwoPoints(a, b) {
    var xs = b.x - a.x;
    xs = xs * xs;

    var ys = b.y - a.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
}