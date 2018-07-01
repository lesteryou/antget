const _ = require('underscore.js');
const handimg = images.read('/sdcard/脚本/antget/hand.png');

const TFI = id("com.alipay.mobile.nebula:id/h5_tv_title").text("好友排行榜");
const CONTDOWN = depth(12).className('android.view.View').descEndsWith('’');

const noMoreFlag = depth(12).className("android.view.View").desc("没有更多了");
const topFlag = depth(11).idEndsWith('J_rank_list_self');

const CY = 760;

const canget = packageName("com.eg.android.AlipayGphone")
	.className("android.view.View")
	.descEndsWith("收取");
const inforest = packageName("com.eg.android.AlipayGphone")
	.className('android.widget.TextView')
	.depth(12)
	.textEndsWith('的蚂蚁森林');

const alipayPackage = packageName("com.eg.android.AlipayGphone");

const alipayHome = id("com.alipay.android.phone.openplatform:id/tab_description").text("首页").depth(10);
const antIcon = id("com.alipay.android.phone.openplatform:id/app_text").text("蚂蚁森林").depth(19);
const myAntForest = id("com.alipay.mobile.nebula:id/h5_tv_title").text("蚂蚁森林");
const moreFriend = depth(13).className('android.view.View').desc('查看更多好友');



auto();

function findHand() {
	try {
		images.requestScreenCapture();
		return images.findImage(images.captureScreen(), handimg, {
			region: [1030, 300]
		})
	} catch (err) {
		log(err);
		return null;
	}
}

function readFData(fData) {
	if (!TFI.findOne(0)) {
		//toastLog("不在好友列表，读取失败");
		throw "readFData:不在好友列表，读取失败";
		return false;
	}
	if (CONTDOWN.exists()) {
		CONTDOWN.find().each(function(e) {
			var i = parseInt(e.boundsInParent().top / 66);
			var cd = fData[i] = fData[i] || {};
			cd.latestTime = _.now();
			cd.countdown = parseInt(e.desc()) * 60 * 1000;
			var newTime = cd.latestTime + cd.countdown;
			cd.collectTime = cd.collectTime || 0;
			cd.collectTime = cd.collectTime < _.now() ? newTime :
				newTime < cd.collectTime ? newTime :
				cd.collectTime;
			cd.clickPoint = {
				x: e.bounds().centerX() - 511,
				y: e.bounds().centerY() + 60
			};
		});
		return true;
	}
}


function fillFList(timeout) {
	log("in fillFList")
	if (noMoreFlag.findOne(100)) {
		toastLog('好友排行榜，加载完成');
		return true;
	}

	var ending = _.now() + timeout;
	if (!TFI.findOne(0)) {
		//toastLog('当前位置不在好友排行榜，加载失败。');
		throw 'fillFList:当前位置不在好友排行榜，加载失败。'
		return false;
	} else {
		//toastLog('开始加载好友排行榜')
		while (ending > _.now()) {
			if (!TFI.findOne(0)) {
				//toastLog('离开友排行榜，加载失败。');
				throw 'fillFList:离开友排行榜，加载失败。';
				return false;
			}
			swipe(100, 1900, 100, 100, 10); //快速向上滑动。
			if (noMoreFlag.findOne(200)) {
				toastLog('好友排行榜，加载完成');
				return true;
			}
		}
		toastLog('加载好友列表操作超时');
		throw 'fillFList:加载好友列表操作超时';
		return false;
	}
}

function scrollElementInScreen(y) {
	//log(y);
	while (y < 400) {
		y = y + (1900 - 400);
		swipe(100, 400, 100, 1900, 100);
	}
	while (y > device.height) {
		y = y - (1900 - 400);
		swipe(100, 1900, 100, 400, 100);
	}
	return y;
}

function getEnergy(timeout) {
	const ending = _.now() + timeout;
	while (_.now() < ending) {
		if (!inforest.findOne(timeout)) { //等待进入好友蚂蚁森林
			toastLog('不在好友的蚂蚁森林，收取失败');
			throw 'getEnergy:不在好友的蚂蚁森林，收取失败';
			return false;
		}
		log("进入好友森林，开始查找可收取能量");
		var finded = false;
		while (_.now() < ending) {
			if (!inforest.findOne(0)) {
				break;
			}
			var places = canget
				.find().map(e => e.bounds())
				.map(b => ({
					k: '(' + b.centerX() + ',' + (b.centerY() - 60) + ')',
					x: b.centerX(),
					y: b.centerY() - 60,
					w: b.width(),
					h: b.height()
				}))
				.reduce((r, b) => (r[b.k] = b, r), {});

			if (_.size(places)) {
				finded = true;

				log("places:" + JSON.stringify(_.values(places)));
				_.each(places, (p, k) => {
					click(p.x, p.y);
					log(p.k + " clicked");
				});
			}
			if (finded && !canget.findOne(0)) {
				toastLog("收取完成~");
				return true;
			}
		}
	}
	toastLog('慢人一步，收取失败~');
	return false;
}

var inTop = (function() {
	var distance;
	return function() {
		if (!topFlag.findOne(100)) {
			throw 'inTop:没找到顶部控件';
		}
//		log('inTop.bottom:' + topFlag.findOne().bounds().bottom);
		return topFlag.findOne().bounds().bottom > 300;
	}
})();

function inBottom() {
	return noMoreFlag.findOne(0) && noMoreFlag.findOne().bounds().top < device.height;
}

var findForthcoming = (function() {
	var flData = {};
	return function() {
		if (readFData(flData)) {
			var fDataSize = _.size(flData);
			log("findForthcoming.fDataSize:" + fDataSize);
			if (fDataSize) {
				var tl = _.filter(_.values(flData),
					d => d.collectTime > _.now() && d.collectTime <= _.now() + 30000); //找30秒内即将可收取的
				if (tl.length) {
					return _.min(tl, 'collectTime');
				}
			}
		}
		return null;
	}
})();

function getEnergy2(point, timeout) {
	timeout = timeout || 60000;
	click(point.x, point.y); //进入好友蚂蚁森林
	getEnergy(timeout); //收取能量，1分钟超时
	back(); //返回好友列表
	if (!TFI.findOne(500)) { //等待返回好友列表，500毫秒超时
		throw 'getEnergy2:返回好友列表失败'
		return false;
	} else {
		return true;
	}
}

function forthcomingCollect() {
	log('最近时间查找');

	var forthcoming = findForthcoming();
	//log(JSON.stringify(forthcoming));
	//log(forthcoming);
	if (forthcoming) {
		log('发现30秒内可收取对象：' + JSON.stringify(forthcoming) + ' 定位中..');
		//log(forthcoming);
		scrollElementInScreen(forthcoming.clickPoint.y); //滑动到屏幕中央
		forthcoming = findForthcoming(); //再找一次确保位置准确, 可能找到不同的元素，以后再解决
		return getEnergy2(forthcoming.clickPoint, forthcoming.collectTime - _.now() + 3000); //
	}

	return false;
}



var handCollect = (function() {
	var handCollectPlace = 0;
	//log('handCollect init:' + handCollectPlace);
	var down = true;
	return function() {
		if (!TFI.findOne(0)) {
			throw "handCollect:不在好友列表，查找失败";
			return false;
		}
		log('图像搜索查找， 定位中');
		//log(down ? '下行' : '上行');
		//log(noMoreFlag.findOne().bounds().top);
		//log(handCollectPlace)
		scrollElementInScreen(handCollectPlace + topFlag.findOne().bounds().bottom); //回到上次的位置。
		var handSpace = findHand();
		if (handSpace) {
			if (getEnergy2({x:handSpace.x-200, y:handSpace.y+20}, 5000)) {
				return true;
			}
		}

		if (down && !inBottom()) { //下行，且没到底。
			handCollectPlace += 1500;
		} else if (down && inBottom()) {
			down = !down;
			handCollectPlace -= 1500; //下行，且到底，调转方向
		} else if (!down && !inTop()) {
			handCollectPlace -= 1500; //上行，且没到顶，继续上行
		} else if (!down && inTop()) {
			down = !down;
			handCollectPlace += 1500; //上行，到顶，调转方向
		}

	}
})();

var localtionCorrect = (function() {
	var latestReLoadTime = _.now();
	return function() { //位置矫正；
		log('位置校准中....');

		if (_.now() - latestReLoadTime > 600000) { //10分钟，强制全部刷新。
			toastLog('界面更新....');
			back();
			latestReLoadTime = _.now();
			myAntForest.findOne(500);
		}

		while (true) {
			alipayPackage.waitFor(); //必须在支付宝环境内才进行位置矫正。
			if (TFI.exists()) { //好友排行榜，无需处理
				if (!noMoreFlag.findOne(5000)) {
					//log("localtionCorrect:fillFList");
					//fillFList(10000);
				}
				log('校准完成。');
				return;
			} else if (alipayHome.findOne(500)) { //支付宝首页
				toastLog('localtionCorrect:支付宝首页');
				var mysl = antIcon.findOne(3000);
				click(mysl.bounds().centerX(), mysl.bounds().centerY());
				myAntForest.findOne(3000);
			} else if (myAntForest.findOne(500)) { //我的蚂蚁森林首页
				toastLog('localtionCorrect:蚂蚁森林首页');
				var mf = moreFriend.findOne(500);
				scrollElementInScreen(mf.bounds().centerY());
				mf = moreFriend.findOne(3000);
				click(mf.bounds().centerX(), mf.bounds().centerY());
				TFI.findOne(3000);
			} else { //支付宝其他地方，直接返回
				toastLog('localtionCorrect:未知位置');
				back();
				TFI.findOne(3000);
			}

		}

	}
})();

function antForestWalk() {
	while (true) {
		try {
			localtionCorrect();
			while (handCollect()); //收取页面上所有可以收取的能量
			//while (forthcomingCollect()); //收取最近1分钟即将可以收取的能量
		} catch (e) {
			err(e);
		}
	}
}

launch("com.eg.android.AlipayGphone"); //启动支付宝
antForestWalk();