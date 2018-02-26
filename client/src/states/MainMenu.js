class MainMenu extends Phaser.State {

	init(colour = "#243a2b") {
		this.colour = colour
	}

	create() {
		this.game.stage.backgroundColor = this.colour

		this.game.add.plugin(PhaserInput.Plugin)

		this.sprite = this.game.add.sprite(30, 50, 'title')

		this.startX = 73
		this.startY = 170
		this.inc = 150

//    	this.button = this.game.add.button(this.game.world.centerX - 35 , this.game.world.centerY+190, 'tiles', this.startButton, this, 2, 1, 0)

		this.gameType = "ai_easy"
    	this.level = 0

		this.startGameTypeX = 244
    	
    	this.startGameLabel = this.game.add.text(this.game.world.centerX - 45, this.game.world.centerY+168, "Ready?", { font: "14px Arial", fill: "#000000"})
/*
		this.chooseGametypeLabel = this.game.add.text(this.game.world.centerX - 80, this.game.world.centerY+50, "Choose game type", { font: "14px Arial", fill: "#000000"})
        this.hotseatButton = this.game.add.button(this.startGameTypeX, this.game.world.centerY+90, 'buttons', this.chooseHotseat, this)//, null, null, 0, 1)
        this.hotseatButton.frame = 8
        this.hotseatButton._onUpFrame = 8
        this.hotseatButton._onDownFrame = 9
        this.hotseatButton.input.useHandCursor = true
        this.onlineButton = this.game.add.button(this.startGameTypeX + 110, this.game.world.centerY+90, 'buttons', this.chooseOnline, this)//, null, null, 0, 1)
        this.onlineButton.frame = 6
        this.onlineButton._onUpFrame = 6
        this.onlineButton._onDownFrame = 7
        this.onlineButton.input.useHandCursor = true


        this.graphics2 = this.game.add.graphics(0, 0)//this.game.height - 300)
        this.graphics2.lineStyle(2, 0x323c39, 1)
        this.graphics2.drawRect(this.hotseatButton.x-1, this.hotseatButton.y+1, 64, 30)
  */      
        this.startButton = this.game.add.button(this.game.world.centerX - 55 , this.game.world.centerY+190, 'buttons', this.findGame, this)//, null, null, 0, 1)
        this.startButton.frame = 0
        this.startButton._onUpFrame = 0
        this.startButton._onDownFrame = 1
        this.startButton.input.useHandCursor = true

        this.smokes = []
        for (let i=0; i<20; i++) {
	        let smoke = this.game.add.sprite(-130-i*20, 99+this.game.rnd.integerInRange(-4,20), 'smoke')
	        smoke.anchor.setTo(0.45)
	        this.smokes.push(smoke)
	    }
	    this.game.time.advancedTiming = true
        this.splashMusic = this.game.add.audio('splash')
        this.splashMusic.loopFull()	
    }

	chooseHotseat() {	
		this.gameType = "ai_easy"
		this.graphics2.x = this.hotseatButton.x - this.startGameTypeX 
	}
	chooseOnline() {	
		this.gameType = "online"
		this.graphics2.x = this.onlineButton.x - this.startGameTypeX
	}

	findGame() {	
		this.startGame()
	}

	update() {
		let test = this.smokes[0].x
		for (let i=0; i<20; i++) {
			this.smokes[i].x+=2
			this.smokes[i].y+=0.01
			this.smokes[i].angle+=0.5
			if (test >= 1300) {
				this.smokes[i].x=-130-i*20
				this.smokes[i].y=99+this.game.rnd.integerInRange(-4,20)
			}
		}
	}


	startGame() {
		this.splashMusic.stop()
		this.game.state.start("Main",  true, false, this.gameType)
	}
	render() {
//		this.game.debug.text(this.game.time.fps, 420, 20, "#00ff00")
		
	}

}

export default MainMenu
