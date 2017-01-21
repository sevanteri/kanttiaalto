var playState = {
    create: function() {
        var that = this;
        this.syntwave = null;
        this.soundLevel = 0.5;
        this.difficulty = 0.3;
        this.sampleSkipCounter = 0;
        this.treshold = 0.1;

        this.bg = game.add.sprite(0, 0, 'grid');
        this.music = game.add.audio('testmusic');
        this.emitter = game.add.emitter(game.world.centerX, 200, 200);
        this.emitter.makeParticles(['particle']);
        this.emitter.setAlpha(0.3, 0.8);
        this.emitter.setScale(0.5, 1);
        this.emitter.gravity = 200;

        // ****************    Music   **********************
        this.filter = this.music.context.createBiquadFilter();
        this.analyser = this.music.context.createScriptProcessor(0,1,1);

        var filterval = 0.05;
        this.filter.type = 'bandpass';
        this.filter.frequency.value = 200;
        this.filter.gain.value = filterval;

        //console.log(filterval);

        //this.music.masterGainNode.disconnect();
        this.music.masterGainNode.connect(this.filter);
        //this.music.masterGainNode.connect(this.listenFilter);
        //this.listenFilter.connect(this.music.context.destination);
        this.filter.connect(this.analyser);
        this.analyser.connect(this.music.context.destination);

        // Adapted from http://thecodeplayer.com/walkthrough/5b66bac8ec98ba14a80ca0c83169d51f
        this.analyser.onaudioprocess = function(e){
            var out = e.outputBuffer.getChannelData(0);
            var int = e.inputBuffer.getChannelData(0);
            var max = 0;

            for(var i = 0; i < int.length; i++){
                out[i] = 0;
                max = Math.max(int[i], max);
            }
            console.log(max);
            //convert from magitude to decibel
            // that.soundLevel = 20*Math.log(Math.max(max,Math.pow(10,-72/20)))/Math.LN10;

            that.sampleSkipCounter++;
            if(that.sampleSkipCounter % 2 === 0) {
                that.sampleSkipCounter = 0;
                that.previousSoundLevel = that.soundLevel;
                var delta = that.soundLevel > max ? that.soundLevel - max : max - that.soundLevel;
                delta = delta > that.difficulty ? that.difficulty : delta;
                delta = delta < that.treshold ? 0 : delta;
                that.soundLevel = that.soundLevel > max ? that.soundLevel - delta : that.soundLevel + delta;
            } else {
                that.previousSoundLevel = max;
            }
        };
        this.music.loopFull();

        // ****************    Synthwave   **********************
        var motoOffset = 32;
        var length = (354 - motoOffset) / 80;
        var points = [];

        for (var i = 0; i < 80; i++) {
            points.push(new Phaser.Point(0, motoOffset + i * length));
        }
        this.syntwave = game.add.rope(this.game.world.centerX, 0, 'synthline', null, points);

        this.moto = game.add.sprite(this.game.world.centerX, 16, 'moto');
        this.moto.anchor.setTo(0.5, 0.5);

        this.syntwave.updateAnimation = function() {
            that.moto.x = this.game.world.centerX + this.points[0].x;
            for (var i = this.points.length - 1; i > 0; i--) {
                this.points[i].x = this.points[i - 1].x;
            }

            // sound level is in range of [0, 1]

            this.points[0].x = (that.soundLevel) * that.game.world.width - that.game.world.width/2;
        };

        // ****************    Touch   **********************
        this.player = game.add.sprite(game.world.centerX, game.world.centerY, 'touchSprite');
        this.player.scale.set(0.05);
        game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.anchor.setTo(0.5, 0.5);
    },
    update: function() {
      this.movePlayerToPointer();
    },
    movePlayerToPointer: function() {
      // Update player coordinates to pointer
      this.player.x = game.input.x;
      this.player.y = game.input.y;
      this.emitter.x = game.input.x;
      this.emitter.y = game.input.y;
      if(this.sampleSkipCounter % 2 === 0) {
        this.emitter.start(true, 1000, 0, Math.random() > 0.5 ? 2 : 1);
      }
    }
};
