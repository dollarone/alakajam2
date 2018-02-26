class Main extends Phaser.State {

    init(gameType = "local", level = 0) {
        this.playerName = "Player"
        this.gameType = gameType
        this.level = level
    }

	create() {

		this.game.stage.backgroundColor = '#8da8f1'//'#5fcde4'//'#98FB98'
        this.sprite = this.game.add.sprite(0, 70, 'castle')

        this.yourHealth = 20
        this.enemyHealth = 20
        this.leftLaneQueue = []
        this.centralLaneQueue = []
        this.rightLaneQueue = []
        this.enemyLeftLaneQueue = []
        this.enemyCentralLaneQueue = []
        this.enemyRightLaneQueue = []

		this.step = -1

        this.smokes = 2

		this.statusLabel = this.add.text(this.game.world.width/2 - 360, 10, '')
		this.timeLabel = this.add.text(700, 10, '')
		this.speed = 0

        this.gameover = false

        this.rKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R)
    	this.rKey.onDown.add(this.restart, this)

        this.openConnection()
        this.myText = this.game.add.text(332, 32, "started (not yet connected)", { font: "14px Arial", fill: "#ff0044"})
        this.game.time.advancedTiming = true
        this.gameStarted = false
        this.myText.visible = false
        
        this.game.input.mouse.capture = true
/*
        this.resignButton = this.game.add.button(5, 40, 'buttons', this.resign, this)//, null, null, 0, 1)
        this.resignButton.frame = 10
        this.resignButton._onUpFrame = 10
        this.resignButton._onDownFrame = 11
        this.resignButton.input.useHandCursor = true
*/
        this.currentPlayerLabel = this.game.add.text(5, 1, "", { font: "14px Arial", fill: "#000000"})
        this.currentPlayerNumber = -1

        this.turn = 0

        this.turnLabel = this.game.add.text(5, 20, "Turns played:", { font: "14px Arial", fill: "#000000"})
        this.turnNumber = this.game.add.text(95, 23, this.turn, { font: "11px Monospace", fill: "#000000"})

        this.nextTurnCooldown = 0
        
        this.players = [2]
        // doesnt matter which order, just used for win condition
        this.players[0] = "Player 1"
        this.players[1] = "Player 2"

        this.myTurn = false

        this.firstTurn = true

        this.gameover = false

        this.yourHP = 10
        this.enemyHP = 10
        this.turn = 0

        this.nameLabel = this.game.add.text(170, 1, "You:", { font: "14px Arial", fill: "#000000"})
        this.opponentTextLabel = this.game.add.text(200, 23, "Opponent:", { font: "11px Monospace", fill: "#000000"})
        this.nameInput = this.game.add.inputField(200, 3, {width:105, max: 15, font: '11px Monospace'})
        this.opponentLabel = this.game.add.text(132, 20, "Opponent:", { font: "14px Arial", fill: "#000000"})
        this.waitingForGameLabel = this.game.add.text(100, 400, "", { font: "24px Arial", fill: "#ff0044"})
        this.yourTurnTextLabel = this.game.add.text(340, 485, "Your turn!", { font: "11px Monospace", fill: "#000000"})
        this.yourTurnTextLabel.alpha = 0

        this.yourHPLabel = this.game.add.text(360, 1, "Your HP:", { font: "14px Arial", fill: "#000000"})
        this.yourHPField = this.game.add.text(420, 4, this.yourHP, { font: "11px Monospace", fill: "#000000"})
        this.enemyHPLabel = this.game.add.text(317, 20, "Opponent's HP:", { font: "14px Arial", fill: "#000000"})
        this.enemyHPField = this.game.add.text(420, 23, this.enemyHP, { font: "11px Monospace", fill: "#000000"})



        if (this.gameType == "local") {
            this.nameLabel.visible = false
            this.opponentTextLabel.visible = false
            this.nameInput.visible = false
            this.opponentLabel.visible = false
            this.waitingForGameLabel.visible = false
            this.yourTurnTextLabel.visible = false
        }
   
        this.leftLaneBorder = this.game.add.graphics(0, 0)
        this.leftLaneBorder.lineStyle(2, 0xf23c39, 2)
        this.leftLaneBorder.drawRect(1, 330, 210, 169)
        let tween1 = this.game.add.tween(this.leftLaneBorder).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true, 0, -1)
        tween1.yoyo(true, 0)

        this.centralLaneBorder = this.game.add.graphics(0, 0)
        this.centralLaneBorder.lineStyle(2, 0xff3c39, 2)
        this.centralLaneBorder.drawRect(250, 330, 240, 169)
        let tween2 = this.game.add.tween(this.centralLaneBorder).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true, 0, -1)
        tween2.yoyo(true, 0)

        this.rightLaneBorder = this.game.add.graphics(0, 0)
        this.rightLaneBorder.lineStyle(2, 0xf23c39, 2)
        this.rightLaneBorder.drawRect(515, 330, 184, 169)
        let tween3 = this.game.add.tween(this.rightLaneBorder).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true, 0, -1)
        tween3.yoyo(true, 0)

        this.peasant = this.createUnit('peasant', '1/1', 589, 32)
        this.swordsman = this.createUnit('swordsman', '2/2', 632, 32)
        this.knight = this.createUnit('knight', '3/3', 675, 32)
        this.shieldman = this.createUnit('shieldman', '1/2', 632, 144)
        this.pikeman = this.createUnit('pikeman', '3/1', 675, 144)

        this.selectionOverlay = this.game.add.graphics(220, 205)
        this.selectionOverlay.beginFill(0x545454)
        this.selectionOverlay.lineStyle(2, 0x444444, 2)
        this.selectionOverlay.lineTo(280, 0)
        this.selectionOverlay.lineTo(280, 120)
        this.selectionOverlay.lineTo(0, 120)
        this.selectionOverlay.lineTo(0, 0)
        this.selectionOverlay.endFill()
        this.selectionLabel = this.game.add.text(130, 50, "Do you want to deploy this unit\nunder a smoke screen?\n(" + this.smokes + " smoke screens left)", { font: "15px Arial", fill: "#000000"})
        //this.selectionLabel.smoothed = true
        this.selectionLabel.anchor.setTo(0.5)
        this.selectionOverlay.addChild(this.selectionLabel)

        this.selectionOverlay.visible = false


        this.yesButton = this.game.add.button(100, 100, 'buttons', this.deployWithSmoke, this)//, null, null, 0, 1)
        this.yesButton.anchor.setTo(0.5)
        this.yesButton.frame = 2
        this.yesButton._onUpFrame = 2
        this.yesButton._onDownFrame = 3
        this.yesButton.input.useHandCursor = true
        this.selectionOverlay.addChild(this.yesButton)

        this.noButton = this.game.add.button(175, 100, 'buttons', this.deployWithoutSmoke, this)//, null, null, 0, 1)
        this.noButton.anchor.setTo(0.5)
        this.noButton.frame = 4
        this.noButton._onUpFrame = 4
        this.noButton._onDownFrame = 5
        this.noButton.input.useHandCursor = true
        this.selectionOverlay.addChild(this.noButton)


//        this.selectionOverlay.visible = false

        this.modal = false
        

        this.gameMusic = this.game.add.audio('gameplay')
        this.gameMusic.loopFull() 
	}

    createUnit(type, stats, x, y, enemy=false) {
        let unit = this.game.add.sprite(x, y, type)
        unit.anchor.setTo(0.5)
        unit.orgX = x
        unit.orgY = y
        unit.orgType = type
        let unitLabel = this.game.add.text(2, 60, stats, { font: "14px Arial", fill: "#fff"})
        unitLabel.anchor.setTo(0.5)
        if (enemy) {
            unitLabel.y-=18
        }
        else {
            unit.inputEnabled = true
            unit.input.useHandCursor = true
            unit.input.enableDrag(true)
            unit.events.onDragStop.add(this.onDragStop, this)

        }
        unit.addChild(unitLabel)

        return unit
    }
    onDragStop(sprite, pointer) {

    //    result = sprite.key + " dropped at x:" + pointer.x + " y: " + pointer.y;

        if(this.myTurn && !this.modal && pointer.y>330) {
            if(pointer.x < 210) {
                this.chooseLane(0,sprite)
            }
            else if(pointer.x > 250 && pointer.x < 490) {
                this.chooseLane(1,sprite)
            }
            else if(pointer.x > 515) {
                this.chooseLane(2,sprite)
            }
            else {
                sprite.x = sprite.orgX
                sprite.y = sprite.orgY
            }
        }
        else {
            sprite.x = sprite.orgX
            sprite.y = sprite.orgY
        }
    }

    chooseLane(lane, unit) {
        this.unitToBeDeployed = unit
        this.laneToBeDeployed = lane

        unit.inputEnabled = false
        let startX = 33
        let startY = 432
        switch(lane) {
            case 0:
                this.leftLaneQueue.push(unit)
                
                for (let i=this.leftLaneQueue.length;i>0;i--) {
                    this.leftLaneQueue[i-1].y = startY
                    this.leftLaneQueue[i-1].x = startX
                    startX+=55
                    startY-=19
                    if ((this.leftLaneQueue.length==4 && i==2) || 
                        (this.leftLaneQueue.length==5 && i==3)) {
                        startX=33
                        startY-=57
                    }
                }
                break
            case 1:
                this.centralLaneQueue.push(unit)
                startX = 420
                for (let i=this.centralLaneQueue.length;i>0;i--) {
                    this.centralLaneQueue[i-1].y = startY
                    this.centralLaneQueue[i-1].x = startX
                    startX-=55
                    startY-=19
                    if ((this.centralLaneQueue.length==4 && i==2) || 
                        (this.centralLaneQueue.length==5 && i==3)) {
                        startX=420
                        startY-=43
                    }
                }
                break
            case 2:
                this.rightLaneQueue.push(unit)
                startX = 665
                for (let i=this.rightLaneQueue.length;i>0;i--) {
                    this.rightLaneQueue[i-1].y = startY
                    this.rightLaneQueue[i-1].x = startX
                    startX-=55
                    startY-=19
                    if ((this.rightLaneQueue.length==4 && i==2) || 
                        (this.rightLaneQueue.length==5 && i==3)) {
                        startX=615
                        startY-=57+19
                    }
                }
                break
        } 
        if (this.smokes > 0) {
            this.modal = true
            this.game.world.bringToTop(this.selectionOverlay)
            this.selectionOverlay.visible = true
        }
        else {
            this.deployWithoutSmoke()
        }
    }

    deployWithoutSmoke() {
        this.deploy(false)

    }

    deployWithSmoke() {

        this.deploy(true)
    }

    deploy(smoke) {
        this.selectionOverlay.visible = false
        this.modal = false
        if (true || (this.connected && this.myTurn && !this.gameOver)) {
            this.ws.send(JSON.stringify({action: "deploy", unit: this.unitToBeDeployed.key, lane: this.laneToBeDeployed, smoke: smoke}))
        }
        this.myTurn = false
        if  (smoke) {
            this.unitToBeDeployed.loadTexture('cloud', 0)
            this.smokes-=1
            this.selectionLabel.text = "Do you want to deploy this unit\nunder a smoke screen?\n(" + this.smokes + " smoke screen left)"
        }
    
    }

    addEnemy(lane, unit) {

        let startX = 255
        let startY = 158
        switch(lane) {
            case 0:
                this.enemyLeftLaneQueue.push(unit)
                
                for (let i=this.enemyLeftLaneQueue.length;i>0;i--) {
                    this.enemyLeftLaneQueue[i-1].y = startY
                    this.enemyLeftLaneQueue[i-1].x = startX
                    startX-=32
                    startY+=20
                    if ((this.enemyLeftLaneQueue.length==4 && i==2) || 
                        (this.enemyLeftLaneQueue.length==5 && i==3)) {
                        startX=238
                        startY+=40
                    }
                }
                break
            case 1:
                this.enemyCentralLaneQueue.push(unit)
                startX = 380
                startY = 155
                for (let i=this.enemyCentralLaneQueue.length;i>0;i--) {
                    this.enemyCentralLaneQueue[i-1].y = startY
                    this.enemyCentralLaneQueue[i-1].x = startX
                    startX-=30
                    startY+=20
                    if ((this.enemyCentralLaneQueue.length==4 && i==2) || 
                        (this.enemyCentralLaneQueue.length==5 && i==3)) {
                        startX=400
                        startY+=20
                    }
                    if (this.enemyCentralLaneQueue.length==5 && i==2) {
                        startX-=60
                        startY+=20
                    }
                }
                break
            case 2:
                this.enemyRightLaneQueue.push(unit)
                startX = 445
                for (let i=this.enemyRightLaneQueue.length;i>0;i--) {
                    this.enemyRightLaneQueue[i-1].y = startY
                    this.enemyRightLaneQueue[i-1].x = startX
                    startX+=35
                    startY+=20
                    if ((this.enemyRightLaneQueue.length==4 && i==2) || 
                        (this.enemyRightLaneQueue.length==5 && i==3)) {
                        startX=480
                        startY+=40
                    }
                }
                break
        } 
    }



    resign() {
        this.ws.send(JSON.stringify({action: "resign", nick:this.nameInput.value}))
    }

	restart() {
        this.gameMusic.stop()
		this.game.state.start("MainMenu")
	}

	endgame() {
		this.gameover = true
	}
	update() {
		this.step += 1
        if (this.nextTurnCooldown > 0) {
            this.nextTurnCooldown -= 1
        }

        //if (this.game.input.mousePointer.isDown) {
        //}
        //this.statusLabel.text = "Pointer is at " + this.game.input.x + "/" + this.game.input.y
	}

    yourTurn() {
        this.myTurn = true
        let tween = this.game.add.tween(this.yourTurnTextLabel);
        
        tween.to({alpha:1}, 1000, Phaser.Easing.Linear.None);
        tween.onComplete.add(this.fadeOutSlowly, this)
        tween.start()

    }

    fadeOutSlowly() {

        let s = this.game.add.tween(this.yourTurnTextLabel)
        s.to({alpha:0.98}, 1000, Phaser.Easing.Linear.None)
        s.onComplete.add(this.fadeOut, this)
        s.start()

    }

    fadeOut() {

        let s = this.game.add.tween(this.yourTurnTextLabel)
        s.to({alpha:0}, 1000, Phaser.Easing.Linear.None)
        s.start()

    }

    announceWin(pl) {
        this.result = this.players[pl] + " has won!"
        this.gameover = true
        this.game.add.text(200, 400, this.result, { font: "24px Arial", fill: "#ff0044"})

    }

    openConnection() {
        this.ws = new WebSocket("ws:dollarone.games:9977")   //"ws://localhost:9977") // "ws://dollarone.games:9988")
        this.connected = false
        this.ws.onmessage = this.onMessage.bind(this)
        this.ws.onerror = this.displayError.bind(this)
        this.ws.onopen = this.connectionOpen.bind(this)
    }

    connectionOpen() {
        this.connected = true
        this.myText.text = 'connected\n'
	//	this.ws.send(JSON.stringify({action: "setNick", nick: this.playerName}))

    }

    onMessage(message) {

        this.queuedAction = ""
        
        var msg = JSON.parse(message.data);
         console.log(msg);
        if (undefined == msg.status) {
        	//do nutjimng
        }
        else if (undefined != msg.status && msg.status == "newTurn") {

            this.turn+=1
            this.turnNumber.text = this.turn
            this.currentPlayerNumber = msg.currentPlayer

            if (this.currentPlayerNumber == this.playerNumber) {
                this.yourTurn()
                this.game.currentPlayer = this.players[this.playerNumber]
                if (msg.opponentNick != undefined) {
                    this.opponentTextLabel.text = msg.opponentNick
                }
                this.currentPlayerLabel.text = this.nameInput.value + "'s turn"
            }
            else {
                this.currentPlayerLabel.text = this.opponentTextLabel.text + "'s turn"
            }
            


            console.log(" current player " + this.currentPlayerNumber + " robots: " + JSON.stringify(msg.robots))
        }
        else if (undefined != msg.status && msg.status == "registered") {
            this.ws.send(JSON.stringify({action: "findGame", gameType: this.gameType, level: this.level}))
        }
        else if (undefined != msg.status && msg.status == "gameStarted") {
        	//console.log( "received gameStarted with robots: " + msg.robots)
        	
            this.currentPlayerNumber = msg.currentPlayer
            this.playerNumber = msg.playerNumber


            console.log(this.currentPlayer + " and I am " + this.playerNumber)

            if (this.playerNumber == 0) {
                this.nameInput.setText("Player 1")
                this.opponentTextLabel.text = "Player 2"

            }
            else {
                this.opponentTextLabel.text = "Player 1"
                this.nameInput.setText("Player 2")
            }
            if (msg.opponentNick != undefined) {
                this.opponentTextLabel.text = msg.opponentNick
            }

            this.currentPlayerLabel.text =  this.players[this.currentPlayerNumber] + "'s turn"

            if (this.currentPlayerNumber == this.playerNumber) {
                this.yourTurn()
                this.game.currentPlayer = this.players[this.playerNumber]
            }
            else {
                this.game.currentPlayer = "Cantseleectanything"
            }
            this.gameStarted = true

            this.firstTurn = true
            this.waitingForGameLabel.text = ""

        }
        else if (undefined != msg.status && msg.status == "waitingForGame") {
            this.waitingForGameLabel.text = "Waiting for game ... you are the first in the queue"
            //this.sfx_swords.play()
            console.log("waitingForGame")
        }
        else if (undefined != msg.status && msg.status == "deployed") {

            if (msg.playerNumber != this.playerNumber) {
                if (msg.unitDeployed == "smoke") {
                    this.addEnemy(msg.laneDeployed, this.createUnit('enemyCloud', '?/?', -265, 150, true))
                }
                else if (msg.unitDeployed == "peasant") {
                    this.addEnemy(msg.laneDeployed, this.createUnit('enemyPeasant', '1/1', -265, 150, true))
                }
                else if (msg.unitDeployed == "swordsman") {
                    this.addEnemy(msg.laneDeployed, this.createUnit('enemySwordsman', '2/2', -265, 150, true))
                }
                else if (msg.unitDeployed == "knight") {
                    this.addEnemy(msg.laneDeployed, this.createUnit('enemyKnight', '3/3', -265, 150, true))
                }
                else if (msg.unitDeployed == "shieldman") {
                    this.addEnemy(msg.laneDeployed, this.createUnit('enemyShieldman', '1/2', -265, 150, true))
                }
                else if (msg.unitDeployed == "pikeman") {
                    this.addEnemy(msg.laneDeployed, this.createUnit('enemyPikeman', '3/1', -265, 150, true))
                }
            }
        }
        else if (undefined != msg.status && msg.status == "updateUnits") {

            let enemy = 0
            if (this.playerNumber == 0) {
                enemy = 1
            }
            for(let i=0; i<this.enemyLeftLaneQueue.length; i++) {
                let enemyKey = "enemyPeasant"
                let stat = "1/1"
                if (msg.units[enemy][0][i] == "shieldman") {
                    enemyKey = "enemyShieldman"
                    stat = "1/2"
                }
                else if (msg.units[enemy][0][i] == "pikeman") {
                    enemyKey = "enemyPikeman"
                    stat = "3/1"
                }
                else if (msg.units[enemy][0][i] == "swordsman") {
                    enemyKey = "enemySwordsman"
                    stat = "2/2"
                }
                else if (msg.units[enemy][0][i] == "knight") {
                    enemyKey = "enemyKnight"
                    stat = "3/3"
                }
                this.enemyLeftLaneQueue[i].loadTexture(enemyKey, 0)
                this.enemyLeftLaneQueue[i].getChildAt(0).text = stat
            }
            for(let i=0; i<this.enemyCentralLaneQueue.length; i++) {
                let enemyKey = "enemyPeasant"
                let stat = "1/1"
                if (msg.units[enemy][1][i] == "shieldman") {
                    enemyKey = "enemyShieldman"
                    stat = "1/2"
                }
                else if (msg.units[enemy][1][i] == "pikeman") {
                    enemyKey = "enemyPikeman"
                    stat = "3/1"
                }
                else if (msg.units[enemy][1][i] == "swordsman") {
                    enemyKey = "enemySwordsman"
                    stat = "2/2"
                }
                else if (msg.units[enemy][1][i] == "knight") {
                    enemyKey = "enemyKnight"
                    stat = "3/3"
                }
                this.enemyCentralLaneQueue[i].loadTexture(enemyKey, 0)
                this.enemyCentralLaneQueue[i].getChildAt(0).text = stat

            }
            for(let i=0; i<this.enemyRightLaneQueue.length; i++) {
                let enemyKey = "enemyPeasant"
                let stat = "1/1"
                if (msg.units[enemy][2][i] == "shieldman") {
                    enemyKey = "enemyShieldman"
                    stat = "1/2"
                }
                else if (msg.units[enemy][2][i] == "pikeman") {
                    enemyKey = "enemyPikeman"
                    stat = "3/1"
                }
                else if (msg.units[enemy][2][i] == "swordsman") {
                    enemyKey = "enemySwordsman"
                    stat = "2/2"
                }
                else if (msg.units[enemy][2][i] == "knight") {
                    enemyKey = "enemyKnight"
                    stat = "3/3"
                }
                this.enemyRightLaneQueue[i].loadTexture(enemyKey, 0)
                this.enemyRightLaneQueue[i].getChildAt(0).text = stat

            }
            for(let i=0; i<this.leftLaneQueue.length; i++) {
                if (this.leftLaneQueue[i].key = "cloud") {
                    this.leftLaneQueue[i].loadTexture(this.leftLaneQueue[i].orgType, 0)
                }
            }
            for(let i=0; i<this.centralLaneQueue.length; i++) {
                if (this.centralLaneQueue[i].key = "cloud") {
                    this.centralLaneQueue[i].loadTexture(this.centralLaneQueue[i].orgType, 0)
                }
            }
            for(let i=0; i<this.rightLaneQueue.length; i++) {
                if (this.rightLaneQueue[i].key = "cloud") {
                    this.rightLaneQueue[i].loadTexture(this.rightLaneQueue[i].orgType, 0)
                }
            }

        }
        else if (undefined != msg.status && msg.status == "gameOver") {
            if (msg.loser == 0) {
                this.announceWin(1)
            }
            else {
                this.announceWin(0)
            }
        }
        else {

        }
        this.myText.text = 'connected ' + this.nick + '\n' + message.data

    }

    displayError(err) {
        console.log('Web Socket error - probably the server died. Sorry! Error: ' + err)
        this.game.add.text(100, 400, "Web Socket error - the server is unreachable or dead. Sorry!\nYour best bet is to reload - or wait a bit and then try again:/", { font: "20px Arial", fill: "#ff0044"})
    }

	
	render() {
		
	}
}

export default Main
