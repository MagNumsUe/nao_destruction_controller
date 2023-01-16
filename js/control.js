var self = this;


function qrCreate(){

	var ipAddress = $('#socketServerIP').val();
	var portNumber = $('#socketServerPort').val();

	var jsonText = 	'{"ip":"' +
									ipAddress +
									'","port":' +
									portNumber +
									'}'
	console.log(jsonText)
	$('#qrcodeCanvas').empty();


	$('#qrcodeCanvas').qrcode({
		text	: jsonText
	});
}

function connect(){
	// 入力されたロボットのIPアドレスを取得
	var pepperIp = $("#pepperIP").val();

	// 接続が成功したら、各種プロキシを作成して代入しておく
    var setupIns_ = function(){
    	self.qims.service("ALTextToSpeech").done(function(ins){
    		self.alTextToSpeech = ins;
        });
        self.qims.service("ALAnimatedSpeech").done(function(ins){
    		self.alAnimatedSpeech = ins;
        });
        self.qims.service("ALMotion").done(function(ins){
        	self.alMotion = ins;
        });
		self.qims.service("ALRobotPosture").done(function(ins){
        	self.aLRobotPosture = ins;
        });
        self.qims.service("ALBehaviorManager").done(function(ins){
        	self.alBehavior = ins;
        });
    	self.qims.service("ALAutonomousLife").done(function(ins){
    		self.alAutonomousLife = ins;
        });
        self.qims.service("ALAudioDevice").done(function(ins){
            self.alAudioDevice = ins;
            self.alAudioDevice.getOutputVolume().done(function(val){
		    self.showAudioVolume(val);
		    });
        });
        self.qims.service("ALMemory").done(function(ins){
    		self.alMemory = ins;

    		// メモリ監視
    		qimessagingMemorySubscribe();
        });
    }

	// ロボットへの接続を開始する
	self.qims = new QiSession(pepperIp);
	self.qims.socket()
		// 接続成功したら
		.on('connect', function ()
		{
   	 		self.qims.service("ALTextToSpeech")
   	 			.done(function (tts)
   	 			{
   	 	        	tts.say("接続、成功しました");
   	 	       });
				// 接続成功したら各種セットアップを行う
				setupIns_();

				// 接続成功表示切り替え
				$(".connectedState > .connected > .connectedText").text("接続成功");
				$(".connectedState > .connected > .glyphicon").removeClass("glyphicon-remove");
				$(".connectedState > .connected > .glyphicon").addClass("glyphicon-signal");
				$(".connectedState > .connected").css("color","Blue");


     	})
     	// 接続失敗したら
		.on('disconnect', function () {
			//self.nowState("切断");
			$(".connectedState > .connected > .connectedText").text("未接続");
			$(".connectedState > .connected").css("color","Red");
			$("#pepperVolume").val("waiting...");
		});
}


function showAudioVolume(val){
	console.log(val);
	// あとからページに表示させる
	$("#pepperVolume").val(val);
}

function changeAudioVolume(){
	var volume = $("#pepperVolume").val();
	volume = Number(volume);
	console.log(Number(volume));
	self.alAudioDevice.setOutputVolume(volume);
	self.hello();

}


// 動作確認用Hello
function hello(){
	console.log("hello");
	this.alAnimatedSpeech.say("はい");

}

// おしゃべり
function say(){
	console.log("say");
	var value = $("#sayText").val();
	this.alTextToSpeech.say(value);
}

// 動きながらおしゃべり
function animatedSay(){
	console.log("say");
	var value = "\\vct=135\\\\rspd=90\\" + $("#animatedSayText").val();
	this.alAnimatedSpeech.say(value);
}


// 移動
function move(to){
	if (self.alMotion){
		console.log("move to");
		switch (to){
			case 0:
				self.alMotion.moveTo(0, 0, 0.5).fail(function(err){console.log(err);});
				break;

			case 1:
				self.alMotion.moveTo(0, 0, -0.5).fail(function(err){console.log(err);});
				break;

			case 2:
				self.alMotion.moveTo(0.3, 0, 0).fail(function(err){console.log(err);});
				break;

			case 3:
				self.alMotion.moveTo(-0.3, 0, 0).fail(function(err){console.log(err);});
				break;
			case 4:
				self.alMotion.moveTo(0, 0, 0).fail(function(err){console.log(err);});
				break;

		}
	}
}

// ビヘイビアアクション
function action(num){
	switch (num){
		case 0:
			this.alAnimatedSpeech.say("\\vct=130\\\\rspd=100\\おわるね？");
			self.alBehavior.stopAllBehaviors();
			break;
		case 1:
			this.alAnimatedSpeech.say("\\vct=130\\\\rspd=100\\いいよ、ちょっと待ってね？");
			self.alBehavior.runBehavior("nao_destruction_program/behavior_1");
			break;
		case 2:
			self.alBehavior.runBehavior("pepper_self_introduction_waist_sample/.");
			break;
		case 3:
			self.alBehavior.runBehavior("pepper_tongue_twister_sample/.");
			break;
		case 4:
			self.alBehavior.runBehavior("animations/Stand/Emotions/Positive/Laugh_1");
			break;
		case 5:
			self.alBehavior.runBehavior("animations/Stand/Emotions/Negative/Sad_1");
			break;
		case 6:
			self.alBehavior.runBehavior("animations/Stand/Gestures/ComeOn_1");
			break;
		case 7:
			self.alBehavior.runBehavior("pepper_anim_sample/d-110-owata");
			break;
		case 8:
			self.alBehavior.runBehavior("pepper_anim_sample/d-110-glad-3");
			break;
		case 9:
			self.alBehavior.runBehavior("animations/Stand/Gestures/Angry_1");
			break;

	}
}

function autonomousSwitch(bl){
	var status;
	if (bl)
	{
		console.log("ON");
		self.alAutonomousLife.getState().done(function(val){console.log(val)});
		self.alAutonomousLife.setState("solitary");

	}else
	{
		console.log("OFF");
		self.alAutonomousLife.getState().done(function(val){console.log(val)});
		self.alAutonomousLife.setState("disabled");
	}
}

function sleepSwitch(bl){
	var status;
	if (bl)
	{
		console.log("ON");
		self.alMotion.wakeUp();

	}else
	{
		console.log("OFF");
		self.alMotion.rest();
	}
}

function sittingSwitch(sl){
	var status;
	if (sl)
	{
		console.log("Sitting");
		self.aLRobotPosture.goToPosture("Sit", 0.8);

	}else
	{
		console.log("STAND");
		self.aLRobotPosture.goToPosture("Stand", 0.8);
	}
}


function say_1(){
	self.alMemory.raiseEvent("nao_destruction_program/say", "0");
}
function say_2(){
	self.alMemory.raiseEvent("nao_destruction_program/say", "1");
}
function say_3(){
	self.alMemory.raiseEvent("nao_destruction_program/say", "2");
}
function say_4(){
	self.alMemory.raiseEvent("nao_destruction_program/say", "3");
}
function say_5(){
	self.alMemory.raiseEvent("nao_destruction_program/say", "4");
}
function say_6(){
	self.alMemory.raiseEvent("nao_destruction_program/say", "5");
}
function say_7(){
	self.alMemory.raiseEvent("nao_destruction_program/say", "6");
}
function say_8(){
	self.alMemory.raiseEvent("nao_destruction_program/say", "7");
}
function say_9(){
	self.alMemory.raiseEvent("nao_destruction_program/say", "8");
}
function say_10(){
	self.alMemory.raiseEvent("nao_destruction_program/say", "9");
}
function say_11(){
	self.alMemory.raiseEvent("nao_destruction_program/say", "10");
}
function say_12(){
	self.alMemory.raiseEvent("nao_destruction_program/say", "11");
}

//役割停止
function contents_stop(){
	self.alMemory.raiseEvent("nao_destruction_program/contents_stop", "1");
}

//処理前
function contents_1(){
	self.alMemory.raiseEvent("nao_destruction_program/contents", "1");
}
function contents_2(){
	self.alMemory.raiseEvent("nao_destruction_program/contents", "2");
}
function contents_3(){
	self.alMemory.raiseEvent("nao_destruction_program/contents", "3");
}
function contents_4(){
	self.alMemory.raiseEvent("nao_destruction_program/contents", "4");
}

//処理中
function contents_11(){
	self.alMemory.raiseEvent("nao_destruction_program/contents", "11");
}
function contents_12(){
	self.alMemory.raiseEvent("nao_destruction_program/contents", "12");
}
function contents_13(){
	self.alMemory.raiseEvent("nao_destruction_program/contents", "13");
}
function contents_14(){
	self.alMemory.raiseEvent("nao_destruction_program/contents", "14");
}
function contents_15(){
	self.alMemory.raiseEvent("nao_destruction_program/contents", "15");
}
function contents_16(){
	self.alMemory.raiseEvent("nao_destruction_program/answer_correct", "1");
}

//処理後
function contents_21(){
	self.alMemory.raiseEvent("nao_destruction_program/contents", "21");
}
function contents_22(){
	self.alMemory.raiseEvent("nao_destruction_program/contents", "22");
}
function contents_23(){
	self.alMemory.raiseEvent("nao_destruction_program/contents", "23");
}

function qimessagingMemorySubscribe(){
	console.log("subscriber!");
	self.alMemory.subscriber("PepperQiMessaging/Reco").done(function(subscriber)
		{
            subscriber.signal.connect(toTabletHandler);
        }
    );
}


function toTabletHandler(value) {
        console.log("PepperQiMessaging/Recoイベント発生: " + value);
        $(".memory").text(value);
}
