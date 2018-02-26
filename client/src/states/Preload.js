class Preload extends Phaser.State {

	preload() {
		/* Preload required assets */
		this.game.load.spritesheet('logo-tiles', 'assets/gfx/logo-tiles.png', 17, 16)
		this.game.load.spritesheet('tiles', 'assets/gfx/tiles.png', 32, 32)
		this.game.load.spritesheet('buttons', 'assets/gfx/buttons.png', 64, 32)
		this.game.load.audio('dollarone', 'assets/sfx/dollarone.ogg')
		this.game.load.audio('splash', 'assets/sfx/smokescreen-mainmenu.ogg')
		this.game.load.audio('gameplay', 'assets/sfx/smokescreen-gameplay.ogg')
		this.game.load.image('title', 'assets/gfx/smokescreen.png')
		this.game.load.image('smoke', 'assets/gfx/smoke.png')
		this.game.load.image('castle', 'assets/gfx/castle2.png')
		this.game.load.image('pikeman', 'assets/gfx/pikeman2.png')
		this.game.load.image('shieldman', 'assets/gfx/shieldman.png')
		this.game.load.image('knight', 'assets/gfx/knight.png')
		this.game.load.image('swordsman', 'assets/gfx/swordsman.png')
		this.game.load.image('peasant', 'assets/gfx/peasant.png')
		this.game.load.image('cloud', 'assets/gfx/cloud.png')
		this.game.load.image('enemyPikeman', 'assets/gfx/enemyPikemanDark.png')
		this.game.load.image('enemyCloud', 'assets/gfx/enemyCloudDark.png')
		this.game.load.image('enemyPeasant', 'assets/gfx/enemyPeasantDark.png')
		this.game.load.image('enemyKnight', 'assets/gfx/enemyKnightDark.png')
		this.game.load.image('enemyShieldman', 'assets/gfx/enemyShieldmanDark.png')
		this.game.load.image('enemySwordsman', 'assets/gfx/enemySwordsmanDark.png')
	}

	create() {
		//this.game.state.start("Logo")
		this.game.state.start("MainMenu")
	//	this.game.state.start("Logo", true, false, "#639bff")
	}

}

export default Preload
