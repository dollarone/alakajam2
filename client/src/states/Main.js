class Main extends Phaser.State {

    init(gameType = "local", level = 0) {
        this.playerName = "Player"
        this.gameType = "online"//gameType//
        this.level = level
    }

	create() {

		this.game.stage.backgroundColor = '#8da8f1'//'#5fcde4'//'#98FB98'
        this.sprite = this.game.add.sprite(0, 70, 'castle')

        this.yourHealth = 10
        this.enemyHealth = 10
        this.winnerDecided = false

        this.leftLaneQueue = []
        this.centralLaneQueue = []
        this.rightLaneQueue = []
        this.enemyLeftLaneQueue = []
        this.enemyCentralLaneQueue = []
        this.enemyRightLaneQueue = []

        this.combatResolved = false
        this.processedUnits = 0
        this.processedEnemyUnits = 0

        this.rectsOn = true
		this.step = -1

        this.smokes = 2
        this.laneToBeDeployed = -1 
        this.enemySmokeUsed = false

		this.statusLabel = this.add.text(this.game.world.width/2 - 360, 10, '')
		this.timeLabel = this.add.text(700, 10, '')
		this.speed = 0

        this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
        this.enterKey.onDown.add(this.skip, this)

        this.rKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R)
    	this.rKey.onDown.add(this.restart, this)

        this.mKey = this.game.input.keyboard.addKey(Phaser.Keyboard.M)
        this.mKey.onDown.add(this.switchRedRects, this)

        this.openConnection()
        this.myText = this.game.add.text(332, 32, "started (not yet connected)", { font: "14px Arial", fill: "#ff0044"})
        this.game.time.advancedTiming = true
        this.gameStarted = false
        this.myText.visible = false
        
        this.game.input.mouse.capture = true
        this.game.input.onTap.add(this.skip, this)
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
        this.canDeploy = true

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
        this.leftLaneBorderTween = this.game.add.tween(this.leftLaneBorder).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true, 0, -1)
        this.leftLaneBorderTween.yoyo(true, 0)

        this.centralLaneBorder = this.game.add.graphics(0, 0)
        this.centralLaneBorder.lineStyle(2, 0xff3c39, 2)
        this.centralLaneBorder.drawRect(250, 330, 240, 169)
        this.centralLaneBorderTween = this.game.add.tween(this.centralLaneBorder).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true, 0, -1)
        this.centralLaneBorderTween.yoyo(true, 0)

        this.rightLaneBorder = this.game.add.graphics(0, 0)
        this.rightLaneBorder.lineStyle(2, 0xf23c39, 2)
        this.rightLaneBorder.drawRect(515, 330, 184, 169)
        this.rightLaneBorderTween = this.game.add.tween(this.rightLaneBorder).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true, 0, -1)
        this.rightLaneBorderTween.yoyo(true, 0)

        this.peasant = this.createUnit('peasant', '1','1', 150, 625)
        this.swordsman = this.createUnit('swordsman', '2','2', 250, 625)
        this.knight = this.createUnit('knight', '3','3', 350, 625)
        this.shieldman = this.createUnit('shieldman', '1','2', 450, 625)
        this.pikeman = this.createUnit('pikeman', '3','1', 550, 625)

        this.enemySmoke1 = this.createUnit('enemyCloud', '?','?', -265, 150, true)
        this.enemySmoke2 = this.createUnit('enemyCloud', '?','?', -265, 150, true)
        this.enemyPeasant = this.createUnit('enemyPeasant', '1','1', -265, -150, true)
        this.enemySwordsman = this.createUnit('enemySwordsman', '2','2', -265, -150, true)
        this.enemyKnight = this.createUnit('enemyKnight', '3','3', -265, -150, true)
        this.enemyShieldman = this.createUnit('enemyShieldman', '1','2', -265, -150, true)
        this.enemyPikeman = this.createUnit('enemyPikeman', '3','1', -265, -150, true)

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

        this.gameoverOverlay = this.game.add.graphics(100, 205)
        this.gameoverOverlay.beginFill(0x545454)
        this.gameoverOverlay.lineStyle(2, 0x444444, 2)
        this.gameoverOverlay.lineTo(480, 0)
        this.gameoverOverlay.lineTo(480, 320)
        this.gameoverOverlay.lineTo(0, 320)
        this.gameoverOverlay.lineTo(0, 0)
        this.gameoverOverlay.endFill()
        this.winorlose = "You lose..."
        this.gameoverLabel = this.game.add.text(239, 240, this.winorlose, { font: "15px Arial", fill: "#000000"})
        //this.selectionLabel.smoothed = true
        this.gameoverLabel.anchor.setTo(0.5)
        this.gameoverSprite = this.game.add.sprite(80, 60, 'gameoverScreen')
        this.gameoverSprite.frame = 1
        this.rematchButton = this.createButton(165, 280, this.rematch, 14, 15)
        this.endgameButton = this.createButton(315, 280, this.endgame, 16, 17)
        this.gameoverOverlay.addChild(this.rematchButton)
        this.gameoverOverlay.addChild(this.endgameButton)
        this.gameoverOverlay.addChild(this.gameoverLabel)
        this.gameoverOverlay.addChild(this.gameoverSprite)

        this.gameoverOverlay.visible = false


        this.yesButton = this.createButton(100, 100, this.deployWithSmoke, 2, 3, this.selectionOverlay)
        this.noButton = this.createButton(175, 100, this.deployWithoutSmoke, 4, 5, this.selectionOverlay)
        this.continueButton = this.createButton(175, 100, this.continue, 12, 13)
        this.continueButton.visible = false
        
        //this.rematchButton.visible = false

//        this.selectionOverlay.visible = false

        this.modal = false
        
        this.winMusic = this.game.add.audio('m_win')
        this.loseMusic = this.game.add.audio('m_lose')

        this.gameMusic = this.game.add.audio('gameplay')
        this.gameMusic.loopFull() 

        this.stepDelay = 200
        this.displayState = 1//"waitForNextResolve"
        this.nextStateChange = 0

        // 
        this.addedSlashes = false
        this.currentLane = 0
        this.switchRedRects(false)
	}

    addSlashes() {
        this.slashes = []
        let slash = this.game.add.sprite(200,200,'cut')
        slash.anchor.setTo(0.5)
        slash.visible = false
        this.slashes.push(slash)

        
        slash = this.game.add.sprite(200,200,'cut')
        slash.anchor.setTo(0.5)
        slash.visible = false
        this.slashes.push(slash)

        slash = this.game.add.sprite(200,200,'cut')
        slash.anchor.setTo(0.5)
        slash.visible = false
        this.slashes.push(slash)
        
        slash = this.game.add.sprite(300,200,'cut')
        slash.anchor.setTo(0.5)
        slash.visible = false
        this.slashes.push(slash)

        slash = this.game.add.sprite(300,200,'cut')
        slash.anchor.setTo(0.5)
        slash.visible = false
        this.slashes.push(slash)

        slash = this.game.add.sprite(300,200,'cut')
        slash.anchor.setTo(0.5)
        slash.visible = false
        this.slashes.push(slash)
        
        this.slashes[1].angle -= 45
        this.slashes[2].angle += 45
        this.slashes[4].angle -= 45
        this.slashes[5].angle += 45


    }

    createButton(x,y, clickFunction, frame1, frame2, parent=null) {
        let b = this.game.add.button(x, y, 'buttons', clickFunction, this)//, null, null, 0, 1)
        b.anchor.setTo(0.5)
        b.frame = frame1
        b._onUpFrame = frame1
        b._onDownFrame = frame2
        b.input.useHandCursor = true
        if (parent != null) {
            parent.addChild(b)
        }
        return b
    }
    createUnit(type, attack, health, x, y, enemy=false) {
        let unit = this.game.add.sprite(x, y, type)
        unit.anchor.setTo(0.5)
        unit.orgX = x
        unit.orgY = y
        unit.orgType = type
        unit.attack = attack
        unit.health = health
        let unitLabel = this.game.add.text(2, 60, attack + "/" + health, { font: "14px Arial", fill: "#fff"})
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
    console.log("this.canDeploy: " + this.canDeploy + " this.myTurn: " + this.myTurn + " this.modal: " + this.modal)

        if(this.canDeploy && this.myTurn && !this.modal && pointer.y>330 && pointer.y<330+169) {
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
            this.ws.send(JSON.stringify({action: "deploy", unit: this.unitToBeDeployed.key, lane: this.laneToBeDeployed, smoke: smoke, nick:this.nameInput.value}))
        }
        this.myTurn = false
        this.canDeploy = false
        this.switchRedRects(false)
        if  (smoke) {
            this.unitToBeDeployed.loadTexture('cloud', 0)
            this.smokes-=1
            this.selectionLabel.text = "Do you want to deploy this unit\nunder a smoke screen?\n(" + this.smokes + " smoke screen left)"
        }
    }

    addEnemy(lane, unit) {
        this.canDeploy = true
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
    continue() {
        this.ws.send(JSON.stringify({action: "continue", nick:this.nameInput.value}))
        console.log("continue")
    }
    rematch() {
        this.ws.send(JSON.stringify({action: "rematch", nick:this.nameInput.value}))
    }
    endgame() {
        this.ws.send(JSON.stringify({action: "endgame", nick:this.nameInput.value}))
        this.gameover = true
        this.gameMusic.stop()
        this.game.state.start("MainMenu")
    }
	restart() {
        this.gameMusic.stop()
		this.game.state.start("MainMenu")
	}
	update() {
		this.step += 1
        if (this.nextTurnCooldown > 0) {
            this.nextTurnCooldown -= 1
        }

        if (this.combatResolved && !this.winnerDecided) {
            console.log("yeah" + this.currentLane)
            if (this.processedUnits + this.processedEnemyUnits == 10) {
                //this.continueButton.visible = true
            }
            else {
                if (this.step == this.nextStateChange) {
                    this.cleanUp()
                    console.log("lane: " + this.currentLane)
                    switch (this.currentLane) {
                    
                    case 0: this.resolveNext(0, this.leftLaneQueue, this.enemyLeftLaneQueue)
                        break
                    case 1: this.resolveNext(1, this.centralLaneQueue, this.enemyCentralLaneQueue)
                        break
                    case 2: if(!this.resolveNext(2, this.rightLaneQueue, this.enemyRightLaneQueue)) {
                            this.canContinue = true
                            this.continueButton.visible = true
                        }
                        break
                    
                    default:
                    }
                }
            }
            if (this.yourHealth<1) {
                console.log("You lose")
                this.winnerDecided = true
                this.gameMusic.stop()
                this.loseMusic.play() 
                this.winorlose = "You lose..."
                this.gameoverLabel.text = this.winorlose
                this.gameoverSprite.frame = 1
                this.gameoverOverlay.visible = true
                this.rematchButton.visible = true

            }
            else if(this.enemyHealth<1) {
                console.log("You win")
                this.winnerDecided = true
                this.gameMusic.stop()
                this.winMusic.play() 
                this.gameoverOverlay.visible = true
                this.winorlose = "You win!"
                this.gameoverLabel.text = this.winorlose
                this.gameoverSprite.frame = 0
                this.rematchButton.visible = true
            }

        }
        if (this.winnerDecided) {
            if (this.yourHealth<1) {
            }
            else if(this.enemyHealth<1) {
            }
            else { // wtf

            }
        }
        //this.statusLabel.text = "Pointer is at " + this.game.input.x + "/" + this.game.input.y
	}

    skip() {
        this.nextStateChange = this.step + 1

    }

    cleanUp() {
        for (let i=0; i<6; i++) {
            this.slashes[i].visible = false
        }
        for (let i=0; i < this.leftLaneQueue.length; i++) {
            if (this.leftLaneQueue[i].health < 1) {
                this.leftLaneQueue[i].visible = false
            }
        }
        for (let i=0; i < this.enemyLeftLaneQueue.length; i++) {
            if (this.enemyLeftLaneQueue[i].health < 1) {
                this.enemyLeftLaneQueue[i].visible = false
            }
        }
        for (let i=0; i < this.centralLaneQueue.length; i++) {
            if (this.centralLaneQueue[i].health < 1) {
                this.centralLaneQueue[i].visible = false
            }
        }
        for (let i=0; i < this.enemyCentralLaneQueue.length; i++) {
            if (this.enemyCentralLaneQueue[i].health < 1) {
                this.enemyCentralLaneQueue[i].visible = false
            }
        }
        for (let i=0; i < this.rightLaneQueue.length; i++) {
            if (this.rightLaneQueue[i].health < 1) {
                this.rightLaneQueue[i].visible = false
            }
        }
        for (let i=0; i < this.enemyRightLaneQueue.length; i++) {
            if (this.enemyRightLaneQueue[i].health < 1) {
                this.enemyRightLaneQueue[i].visible = false
            }
        }
    }

    resolveNext(lane, myQueue, enemyQueue) {
        if (enemyQueue.length == this.processedEnemyUnits && myQueue.length == this.processedUnits) {
            this.processedUnits = 0
            this.processedEnemyUnits = 0
            this.currentLane+=1
            console.log("new lane")
            this.nextStateChange = this.step + this.stepDelay
            return false
        }
        else if (enemyQueue.length == this.processedEnemyUnits) {
            let yourUnit = myQueue[this.processedUnits]
            if (this.displayState == 1) {
                let targetX = 275 
                let targetY = 140
                if (lane==1) {
                    targetX = 350 
                }
                else if (lane==2) {
                    targetX = 445 
                }
                
                let tween3 = this.game.add.tween(yourUnit)
                tween3.to({x:targetX}, 500, Phaser.Easing.Linear.None)
                let tween4 = this.game.add.tween(yourUnit)
                tween4.to({y:targetY}, 500, Phaser.Easing.Linear.None)
                tween3.start()
                tween4.start()
                this.displayState = 2
                this.nextStateChange = this.step + this.stepDelay
                return true
            }
            else {
                this.displayState = 1
                
                for (let i=0; i<yourUnit.attack; i++) {
                    this.slashes[i].bringToTop = true
                    this.slashes[i].x = this.enemyHPField.x+5
                    this.slashes[i].y = this.enemyHPField.y+5
                    this.slashes[i].visible = true
                }

                this.nextStateChange = this.step + this.stepDelay
                this.enemyHealth = this.enemyHealth - yourUnit.attack
                this.enemyHPField.text = this.enemyHealth

                this.processedUnits += 1
                yourUnit.visible = false
                
                return true

            }

        }
        else if (myQueue.length == this.processedUnits) {
            let enemyUnit = enemyQueue[this.processedEnemyUnits]
            if (this.displayState == 1) {
                let targetX = 80
                let targetY = 520
                if (lane==1) {
                    targetX = 350 
                }
                else if (lane==2) {
                    targetX = 620 
                }
                
                let tween3 = this.game.add.tween(enemyUnit)
                tween3.to({x:targetX+15}, 500, Phaser.Easing.Linear.None)
                let tween4 = this.game.add.tween(enemyUnit)
                tween4.to({y:targetY}, 500, Phaser.Easing.Linear.None)
                tween3.start()
                tween4.start()
                this.displayState = 2
                this.nextStateChange = this.step + this.stepDelay
                return true
            }
            else {
                this.displayState = 1
                
                for (let i=0; i<enemyUnit.attack; i++) {
                    this.slashes[i].bringToTop = true
                    this.slashes[i].x = this.yourHPField.x
                    this.slashes[i].y = this.yourHPField.y+5
                    this.slashes[i].visible = true
                }

                this.nextStateChange = this.step + this.stepDelay
                this.yourHealth = this.yourHealth - enemyUnit.attack
                this.yourHPField.text = this.yourHealth

                this.processedEnemyUnits += 1
                enemyUnit.visible = false
                enemyUnit.x = -200

                return true

            }
        }
        else {
            let yourUnit = myQueue[this.processedUnits]
            let enemyUnit = enemyQueue[this.processedEnemyUnits]

            console.log("yourUnit: " + yourUnit.attack + "/" + yourUnit.health + "(" + this.processedUnits + ")")
            console.log("enemyUnit: " + enemyUnit.attack + "/" + enemyUnit.health + "(" + this.processedEnemyUnits + ")")

            if (this.displayState == 1) {
                let targetX = (yourUnit.x + enemyUnit.x) / 2 +5
                let targetY = (yourUnit.y + enemyUnit.y) / 2
                
                let tween = this.game.add.tween(yourUnit)
                tween.to({x:targetX-15}, 500, Phaser.Easing.Linear.None)
                let tween2 = this.game.add.tween(yourUnit)
                tween2.to({y:targetY-10}, 500, Phaser.Easing.Linear.None)
                tween.start()
                tween2.start()

                let tween3 = this.game.add.tween(enemyUnit)
                tween3.to({x:targetX+15}, 500, Phaser.Easing.Linear.None)
                let tween4 = this.game.add.tween(enemyUnit)
                tween4.to({y:targetY}, 500, Phaser.Easing.Linear.None)
                tween3.start()
                tween4.start()
                this.displayState = 2
                this.nextStateChange = this.step + this.stepDelay
                return true
            }
            else {
                this.displayState = 1
                console.log("myUNIT " + yourUnit.attack + "/" + yourUnit.health + yourUnit.unit)
                console.log("enemyUNIT " + enemyUnit.unit)
                for (let i=0; i<enemyUnit.attack; i++) {
                    this.slashes[i].bringToTop = true
                    this.slashes[i].x = yourUnit.x
                    this.slashes[i].y = yourUnit.y
                    this.slashes[i].visible = true
                }

                for (let i=0; i<yourUnit.attack; i++) {
                    this.slashes[3+i].bringToTop = true
                    this.slashes[3+i].x = enemyUnit.x
                    this.slashes[3+i].y = enemyUnit.y
                    this.slashes[3+i].visible = true
                }
                this.nextStateChange = this.step + this.stepDelay
                yourUnit.health -= enemyUnit.attack
                enemyUnit.health -= yourUnit.attack

                yourUnit.getChildAt(0).text = yourUnit.attack + "/" + yourUnit.health
                enemyUnit.getChildAt(0).text = enemyUnit.attack + "/" + enemyUnit.health

                if (yourUnit.health < 1) {
                    yourUnit.getChildAt(0).text = yourUnit.attack + "/" + '💀'
                    this.processedUnits += 1
                    //yourUnit.visible = false
                }
                if (enemyUnit.health < 1) {
                    enemyUnit.getChildAt(0).text = enemyUnit.attack + "/" + '💀'
                    this.processedEnemyUnits += 1
                    //enemyUnit.visible = false
                }
                return true
            }
        }
        return true
    }

    yourTurn() {
        this.myTurn = true
        let tween = this.game.add.tween(this.yourTurnTextLabel);
        
        tween.to({alpha:1}, 1000, Phaser.Easing.Linear.None);
        tween.onComplete.add(this.fadeOutSlowly, this)
        tween.start()
        this.switchRedRects(true)

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

    addSmoke() {
        if (this.enemySmokeUsed) {
            this.addEnemy(this.laneToBeDeployed, this.enemySmoke2)
        }
        else {
            this.addEnemy(this.laneToBeDeployed, this.enemySmoke1)
            this.enemySmokeUsed = true
        }
    }
    addPeasant() {
        this.addEnemy(this.laneToBeDeployed, this.enemyPeasant)
    }
    addSwordsman() {
        this.addEnemy(this.laneToBeDeployed, this.enemySwordsman)
    }
    addKnight() {
        this.addEnemy(this.laneToBeDeployed, this.enemyKnight)
    }
    addShieldman() {
         this.addEnemy(this.laneToBeDeployed, this.enemyShieldman)
    }
    addPikeman() {
        this.addEnemy(this.laneToBeDeployed, this.enemyPikeman)
    }
    switchRedRects(on) {

        if(!on) {
            this.leftLaneBorderTween.pause()
            this.leftLaneBorder.alpha = 0
            this.centralLaneBorderTween.pause()
            this.centralLaneBorder.alpha = 0
            this.rightLaneBorderTween.pause()
            this.rightLaneBorder.alpha = 0
        }
        else {
            this.leftLaneBorderTween.resume()
            this.leftLaneBorder.alpha = 1
            this.centralLaneBorderTween.resume()
            this.centralLaneBorder.alpha = 1
            this.rightLaneBorderTween.resume()
            this.rightLaneBorder.alpha = 1            
        }
        this.rectsOn = !this.rectsOn
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

        let rematchStarted = false
        
        var msg = JSON.parse(message.data);
         console.log(msg);
        if (undefined == msg.status) {
        	//do nutjimng
        }
        else if (undefined != msg.status && msg.status == "newTurn") {

            this.turn+=1
            this.turnNumber.text = this.turn
            this.currentPlayerNumber = msg.currentPlayer


            if (this.playerNumber == 0) {
                //this.nameInput.setText(msg.players[0]["nick"])
                this.opponentTextLabel.text = msg.players[1]["nick"]

            }
            else {
                this.opponentTextLabel.text = msg.players[0]["nick"]
                //this.nameInput.setText(msg.players[1]["nick"])
            }


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
                this.switchRedRects(false)
            }

        }
        else if (undefined != msg.status && msg.status == "registered") {
            this.ws.send(JSON.stringify({action: "findGame", gameType: this.gameType, level: this.level}))
        }
        else if (undefined != msg.status && msg.status == "gameStarted") {
        	//console.log( "received gameStarted with robots: " + msg.robots)
        	
            this.currentPlayerNumber = msg.currentPlayer
            this.playerNumber = msg.playerNumber
            this.yourHP = 10
            this.enemyHP = 10
            this.yourHPField.text = this.yourHP
            this.enemyHPField.text = this.enemyHP

            if (msg.rematchStarted==true) {
                console.log("rematch triggered")
                rematchStarted = true
                this.gameoverOverlay.visible = false
            }

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
        if (rematchStarted || (undefined != msg.status && msg.status == "newRoundStarted")) {
            console.log("newround - rematch? " + rematchStarted)
            this.enemyPeasant.x = -200
            this.enemySwordsman.x = -200
            this.enemyKnight.x = -200
            this.enemyShieldman.x = -200
            this.enemyPikeman.x = -200
            this.enemySmoke1.x = -200
            this.enemySmoke2.x = -200
            this.continueButton.visible = false
            this.enemySmokeUsed = false
            this.peasant.x = 150
            this.peasant.y = 625
            this.peasant.health = 1
            this.peasant.visible = true
            this.peasant.inputEnabled = true
            this.peasant.getChildAt(0).text = this.peasant.attack + "/" + this.peasant.health
            this.swordsman.x = 250
            this.swordsman.y = 625
            this.swordsman.health = 2
            this.swordsman.visible = true
            this.swordsman.inputEnabled = true
            this.swordsman.getChildAt(0).text = this.swordsman.attack + "/" + this.swordsman.health
            this.knight.x = 350
            this.knight.y = 625
            this.knight.health = 3
            this.knight.visible = true
            this.knight.inputEnabled = true
            this.knight.getChildAt(0).text = this.knight.attack + "/" + this.knight.health
            this.shieldman.x = 450
            this.shieldman.y = 625
            this.shieldman.health = 2
            this.shieldman.visible = true
            this.shieldman.inputEnabled = true
            this.shieldman.getChildAt(0).text = this.shieldman.attack + "/" + this.shieldman.health
            this.pikeman.x = 550
            this.pikeman.y = 625
            this.pikeman.health = 1
            this.pikeman.visible = true
            this.pikeman.inputEnabled = true
            this.pikeman.getChildAt(0).text = this.pikeman.attack + "/" + this.pikeman.health
            
            this.turn+=1
            this.turnNumber.text = this.turn
            this.currentPlayerNumber = msg.currentPlayer

            if (this.currentPlayerNumber == this.playerNumber) {
                this.yourTurn()
                this.game.currentPlayer = this.players[this.playerNumber]
                this.canDeploy = true
            }
            else {
                this.game.currentPlayer = "Cantseleectanything"
            }
            this.leftLaneQueue = []
            this.centralLaneQueue = []
            this.rightLaneQueue = []
            this.enemyLeftLaneQueue = []
            this.enemyCentralLaneQueue = []
            this.enemyRightLaneQueue = []

            this.combatResolved = false
            this.processedUnits = 0
            this.processedEnemyUnits = 0


            this.smokes = 2
            this.selectionLabel.text = "Do you want to deploy this unit\nunder a smoke screen?\n(" + this.smokes + " smoke screens left)"
            this.laneToBeDeployed = -1 
            this.currentLane = 0


        }
        else if (undefined != msg.status && msg.status == "waitingForGame") {
            this.waitingForGameLabel.text = "Waiting for game ... you are the first in the queue"
            //this.sfx_swords.play()
            console.log("waitingForGame")
        }
        else if (undefined != msg.status && msg.status == "deployed") {

            let timer = 0
            if (false && this.gameType == "ai_easy" && this.turn < 9) { // game == vs ai 
                timer = this.game.rnd.integerInRange(1,3)
            }
            if (msg.playerNumber != this.playerNumber) {
                if (msg.unitDeployed == "smoke") {
                    this.laneToBeDeployed = msg.laneDeployed
                    this.game.time.events.add(Phaser.Timer.SECOND * timer, this.addSmoke, this)
                }
                else if (msg.unitDeployed == "peasant") {
                    this.laneToBeDeployed = msg.laneDeployed
                    this.game.time.events.add(Phaser.Timer.SECOND * timer, this.addPeasant, this)
                }
                else if (msg.unitDeployed == "swordsman") {
                    this.laneToBeDeployed = msg.laneDeployed
                    this.game.time.events.add(Phaser.Timer.SECOND * timer, this.addSwordsman, this)
                }
                else if (msg.unitDeployed == "knight") {
                    this.laneToBeDeployed = msg.laneDeployed
                    this.game.time.events.add(Phaser.Timer.SECOND * timer, this.addKnight, this)
                }
                else if (msg.unitDeployed == "shieldman") {
                    this.laneToBeDeployed = msg.laneDeployed
                    this.game.time.events.add(Phaser.Timer.SECOND * timer, this.addShieldman, this)
                }
                else if (msg.unitDeployed == "pikeman") {
                    this.laneToBeDeployed = msg.laneDeployed
                    this.game.time.events.add(Phaser.Timer.SECOND * timer, this.addPikeman, this)
                }
            }
        }
        else if (undefined != msg.status && msg.status == "updateUnits") {
            this.switchRedRects(!this.rectsOn)
            let enemy = 0
            if (this.playerNumber == 0) {
                enemy = 1
            }

            for(let i=0; i<this.enemyLeftLaneQueue.length; i++) {
                console.log(this.enemyLeftLaneQueue.length + " // " + msg.units[enemy][0].toString())
                let enemyKey = "enemyPeasant"
                let attack = msg.units[enemy][0][i]["attack"]
                let health = msg.units[enemy][0][i]["health"]
                let unit = msg.units[enemy][0][i]["unit"]
                if (unit == "shieldman") {
                    enemyKey = "enemyShieldman"
                }
                else if (unit == "pikeman") {
                    enemyKey = "enemyPikeman"
                }
                else if (unit == "swordsman") {
                    enemyKey = "enemySwordsman"
                }
                else if (unit == "knight") {
                    enemyKey = "enemyKnight"
                }
                this.enemyLeftLaneQueue[i].loadTexture(enemyKey, 0)
                this.enemyLeftLaneQueue[i].getChildAt(0).text = attack + "/" + health
                this.enemyLeftLaneQueue[i].attack = attack
                this.enemyLeftLaneQueue[i].health = health
                this.enemyLeftLaneQueue[i].unit = unit
                //"Attack: " + attack + "\nHealth: " + health
            }
            for(let i=0; i<this.enemyCentralLaneQueue.length; i++) {
                let enemyKey = "enemyPeasant"
                console.log(this.enemyCentralLaneQueue.length + " - " + msg.units[enemy][1].toString())
                let attack = msg.units[enemy][1][i]["attack"]
                let health = msg.units[enemy][1][i]["health"]
                let unit = msg.units[enemy][1][i]["unit"]
                if (unit == "shieldman") {
                    enemyKey = "enemyShieldman"
                }
                else if (unit == "pikeman") {
                    enemyKey = "enemyPikeman"
                }
                else if (unit == "swordsman") {
                    enemyKey = "enemySwordsman"
                }
                else if (unit == "knight") {
                    enemyKey = "enemyKnight"
                }
                this.enemyCentralLaneQueue[i].loadTexture(enemyKey, 0)
                this.enemyCentralLaneQueue[i].getChildAt(0).text = attack + "/" + health
                this.enemyCentralLaneQueue[i].attack = attack
                this.enemyCentralLaneQueue[i].health = health
                this.enemyCentralLaneQueue[i].unit = unit

            }
            for(let i=0; i<this.enemyRightLaneQueue.length; i++) {
                let enemyKey = "enemyPeasant"
                console.log(this.enemyRightLaneQueue.length + "/" + msg.units[enemy][2].toString())
                let attack = msg.units[enemy][2][i]["attack"]
                let health = msg.units[enemy][2][i]["health"]
                let unit = msg.units[enemy][2][i]["unit"]
                if (unit == "shieldman") {
                    enemyKey = "enemyShieldman"
                }
                else if (unit == "pikeman") {
                    enemyKey = "enemyPikeman"
                }
                else if (unit == "swordsman") {
                    enemyKey = "enemySwordsman"
                }
                else if (unit == "knight") {
                    enemyKey = "enemyKnight"
                }
                this.enemyRightLaneQueue[i].loadTexture(enemyKey, 0)
                this.enemyRightLaneQueue[i].getChildAt(0).text = attack + "/" + health
                this.enemyRightLaneQueue[i].attack = attack
                this.enemyRightLaneQueue[i].health = health
                this.enemyRightLaneQueue[i].unit = unit

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
        else if (undefined != msg.status && msg.status == "combatResolved") {
            if (this.playerNumber == 0) {
                //this.yourHPField.text = msg.players[0]
                //this.enemyHPField.text = msg.players[1]
            }
            else {
                //this.yourHPField.text = msg.players[1]
                //this.enemyHPField.text = msg.players[0]

            }
            this.combatResolved = true
            this.processedUnits = 0
            this.processedEnemyUnits = 0
            console.log("combatResolved")
            if (!this.addedSlashes) {
                this.addSlashes()
            }
            this.displayState = 1//"waitForNextResolve"
            this.nextStateChange = this.step + this.stepDelay


            this.switchRedRects(false)

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
        this.game.add.text(100, 600, "Web Socket error - the server is unreachable or dead. Sorry!\nYour best bet is to reload - or wait a bit and then try again:/", { font: "20px Arial", fill: "#ff0044"})
    }

	
	render() {
		
	}
}

export default Main
