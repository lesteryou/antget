const _ = require('underscore.js');
const savepath = '/sdcard/脚本/data/'+_.now()+'.js';
//depth(0).find().forEach(e=>log(e));
//className("android.view.View").depth(1)

auto();
launchApp("支付宝");
packageName("com.eg.android.AlipayGphone").waitFor();
//sleep(3000);


var walk = function(ele, depth) {
  depth = depth || 0;
  return ele && {
    depth: depth,
    desc: ele.desc()||undefined,
    text: ele.text()||undefined,
//    packageName: ele.packageName(),
    className: ele.className(),
    id: ele.id()||undefined,
    clickable: ele.clickable()||undefined,
    enabled: ele.enabled()||undefined,
    boundsInParent: [
      ele.boundsInParent().left,
      ele.boundsInParent().top,
      ele.boundsInParent().right,
      ele.boundsInParent().bottom
    ],
    bounds: [
      ele.bounds().left,
      ele.bounds().top,
      ele.bounds().right,
      ele.bounds().bottom
    ],
    center: [
      ele.bounds().centerX(),
      ele.bounds().centerY()
    ],
    size: [
      ele.bounds().width(),
      ele.bounds().height()
    ],
    children: (ele.childCount() ? ele.children().map(c => walk(c, depth + 1)) : undefined)
  };

}

//log(JSON.stringify(_.map(depth(0).find(), walk),null,2));

files.append(savepath, JSON.stringify(_.map(depth(0).find(), walk),null,0));