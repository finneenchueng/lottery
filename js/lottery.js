var lottery = {
	user_list: [],
	randomsort: function(a, b) {
		return Math.random() > .5 ? -1 : 1; //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
	},
	shake: function(jqEle, oriCssOpt, chgCssOpt, times, callback) {
		var i = 0,
			t = false,
			c = chgCssOpt,
			times = times || 2;
		if (t) return;
		t = setInterval(function() {
			c = i % 2 == 0 ? chgCssOpt : oriCssOpt;
			jqEle.css(c);
			i++;
			if (i == times) {
				clearInterval(t);
				jqEle.css(oriCssOpt);
				if (callback != undefined) {
					setTimeout(function() {
						callback();
					}, 1500);
				}
			}
		}, 100);
	},
	initial: function(count) {
		this.cell_count = 9; //每行显示多少格子
		this.userCount = count; //抽奖人数
		this.imgOriTop = 260; //图片标题实际距顶高度
		var _img = new Image();
		_img.src = 'images/bg.jpg';
		_img.onload = function() {
			lottery.loadLotteryBox(_img);
		}
	},
	loadLotteryBox: function(_img) {
		var control_index = 0,
			count = this.userCount,
			tempCount = 1000;
		this.mar_top = Math.round(this.imgOriTop * ($(window).width() / _img.width));
		var _body = $('body');
		$('.container').remove();
		this.public_body = _body;
		var _container = $('<div class="container" style="display:none;margin-top:' + this.mar_top + 'px"></div>');
		var lotteryBox = $('<div id="lottery_box" class="lottery-box"></div>');
		lotteryBox.appendTo(_container);
		this.lottery_box = lotteryBox;
		var tempList = window.localStorage.getItem("user_list");
		if (tempList == null || tempList == '') {
			for (var i = 1; i <= tempCount; i++) {
				if (control_index == count) {
					break;
				}
				if (i.toString().indexOf('4') == -1 && i != 62) {
					var indexNo = i;
					if (i < 10) {
						indexNo = '0' + i;
					}
					var tempJson = {
						itemNo: indexNo,
						is_selected: false,
						cls_type: 0
					};
					this.user_list.push(tempJson);
					this.createBox(lotteryBox, tempJson);
					control_index++;
				}

			}
		} else {
			this.user_list = jQuery.parseJSON(tempList);
			var len = this.user_list.length;
			for (var i = 0; i < len; i++) {
				var tempJson = this.user_list[i];
				this.createBox(lotteryBox, tempJson);
			}
		}
		_container.appendTo(_body);
		lottery.initialSpeed();
		_container.slideDown('slow');
		var sel_type = '';
		$.each(lottery.typeJson, function(j, type_item) {
			sel_type += '<option data-type="' + type_item.typeNo + '" value="' + type_item.setNumber + '">' + type_item.cate + '</option>';
		});
		_body.append('<div id="btn_box" style="position:fixed;width:100%;padding-left:20px;height:40px;left:0;bottom:0;">' +
			'<select id="sel_type" type="number" style="width:200px;">' +
			'<option value="">请选择抽奖名目类型</option>' +
			sel_type +
			'</select>' +
			'<input id="set_cate_btn"  type="button" value="确定" /></div>');
		$("#btn_box").children().each(function(k, item_btn) {
			if (k == 1) {
				$(item_btn).on('click', function(e) {
					var cur_obj = $(this).prev();
					if ($(this).val() == "确定") {
						if (cur_obj.val() != '') {
							var _index = cur_obj.selectedIndex;
							lottery.curLotteryType = cur_obj.children("option:selected").attr("data-type");
							lottery.curLotteryTypeName = cur_obj.children("option:selected").text();
							lottery.curLotteryCount = cur_obj.val();
							$(this).val("重新设置");
							cur_obj.attr("disabled", "disabled");
							lottery.initialSpeed();
						} else {
							lottery.showPop('请选择相应抽奖类别再进行下一步操作');
						}
					} else {
						cur_obj.removeAttr("disabled");
						$(this).val("确定");
					}
					$(this).blur();

				});
			}
		});
		this.userSize = this.user_list.length;
		window.localStorage.setItem("user_list", JSON.stringify(this.user_list));
		lottery.fixedNavicator();
	},
	fixedNavicator: function() {
		this.nav_is_show = false, type_txt = '';
		var right_wid = '-114px';
		$.each(lottery.typeJson, function(j, type_item) {
			type_txt += '<a href="javascript:void(0)" data-type="' + type_item.typeNo + '" style="display:block;line-height:30px;color:#f0f0f0;text-decoration:none;">' + type_item.cate + '</a>';
		});
		var _sliderRight = $('<div id="nav_r" style="width:150px;height:100px;position:fixed;right:' + right_wid + ';top:' + (this.mar_top + 30) + 'px;background-color: #99583D;z-index: 1402;font-weight:bolder;cursor:pointer;">' +
			'<div style="width:36px;border-right:2px solid #fff;line-height:100px;text-align:center;vertical-align: middle;color:#fff;float:left;">' +
			'《</div>' +
			'<div id="slide_bar" style="height:100%;width:112px;text-align:center;color:#fff;float:left;">' +
			type_txt +
			'</div>' +
			'</div>');
		var nav_icon = _sliderRight.children(':eq(0)');
		nav_icon.on('mousedown', function() {
			if (lottery.nav_is_show) {
				_sliderRight.animate({
					right: right_wid
				}, '1500');
				nav_icon.html('《');
				lottery.nav_is_show = false;
			} else {
				_sliderRight.animate({
					right: 0
				}, '1000');
				nav_icon.html('》');
				lottery.nav_is_show = true;
			}

		});
		_sliderRight.children(':eq(1)').children('a').each(function(i, items) {
			$(items).on('click', function() {
				var _type = $(this).attr("data-type");
				lottery.getLotteryList(_type, $(this).text());
				lottery.nav_is_show = false;
				_sliderRight.css({
					right: right_wid
				});
			});

		});
		_sliderRight.appendTo($('body'));
	},
	getLotteryList: function(cls_type, cls_txt) {
		var _list = this.user_list,
			lottery_cell = '';
		$.each(_list, function(i, item_data) {
			if (item_data.is_selected && item_data.cls_type == cls_type) {
				lottery_cell += '<span style="padding:4px 10px;font-size:32px;display:inline-block;">' + item_data.itemNo + '</span>';
			}
		});
		var msg = '<div style="text-align:left;font-weight:bolder;font-size:16px;">恭喜以下 <b>"' + cls_txt + '"</b> 中奖号码：</div>' + lottery_cell;
		// var msg=lottery_cell;
		if (lottery_cell == '') {
			msg = '该奖项即将抽出，别急！-_-';
		}
		this.showPop(msg);
	},
	showPop: function(msg, limittime, callback) {
		var _height = $(window).height();
		var _width = $(document).width();
		var _html = $('<div id="loading" style="width:100%;height:100%;position:fixed;left:0;top:0;background-color: #777;z-index: 1402;filter:alpha(opacity=90);opacity:0.95;-moz-opacity:0.95;font-size:14px;text-align:center;color:#ff1010;overflow:hidden;">' +
			'<div style="position:absolute;width:50%;left:25%;background-color:#f1f1f1;padding:10px;box-shadow: 0 5px 20px rgba(0, 0, 0, 1.6);">' +
			'<div style="position:relative;width:100%;height:100%;clear:both;">' +
			'<div style="position: absolute;font-size: 20px;font-weight: bolder;top: -44px;right: -40px;cursor: pointer;padding: 6px 13px;background-color: f0f0f0;border-radius: 18px;">x</div>' +
			msg + '</div>' +
			'</div>' +
			'</div>');
		$('body').prepend(_html);
		var _child = $("#loading").children(":eq(0)");
		var _cur_wid = _child.outerWidth();
		var _h = _child.height();
		var _top = (_height - _h) / 3;
		var _left = (_width - _cur_wid) / 2;
		_child.css({
			"top": _top + "px"
		});
		_child.children(":eq(0)").children(":eq(0)").on('click', function() {
			$("#loading").remove();
		});
		var temp_timer;
		if (limittime != undefined) {
			var delaytime = limittime;
			if (callback != undefined) {
				callback();
				return;
			}
			temp_timer = window.setInterval(function() {
				if (delaytime == 0) {
					$("#loading").remove();
					window.clearInterval(temp_timer);
					// if(lottery.curLotteryCount>0){
					// 	lottery.isRunning=true;
					// 	lottery.executeLottery();
					// }
					// if(lottery.curLotteryCount==0){
					// 	lottery.curLotteryCount=-1;
					// 	lottery.showPop();
					// }

				} else {

					delaytime--;
				}
			}, 100);
		}
	},
	createBox: function(wrapEle, tempJson) {
		var itemCol = $('<div class="item-col"></div>');
		var defaultItem = $('<div class="default-item">' + tempJson.itemNo + '</div>');
		var grayItem = $('<div class="gray-item">' + tempJson.itemNo + '</div>');
		var yellowItem = $('<div class="yellow-item">' + tempJson.itemNo + '</div>');
		var redItem = $('<div class="red-item">' + tempJson.itemNo + '</div>');
		if (tempJson.is_selected) {
			itemCol.addClass("slelected");
			yellowItem.hide();
			redItem.hide();
			defaultItem.hide();
		} else {
			yellowItem.hide();
			redItem.hide();
			grayItem.hide();
		}
		defaultItem.appendTo(itemCol);
		grayItem.appendTo(itemCol);
		yellowItem.appendTo(itemCol);
		redItem.appendTo(itemCol);
		itemCol.appendTo(wrapEle);
	},
	getRandomIndex: function() {
		var _self = this,
			flag = true,
			k = 0;
		while (flag) {
			k = Math.floor(Math.random() * _self.userSize);
			if (_self.passIndex == k || _self.user_list[k].is_selected) {
				flag = true;
			} else {
				flag = false;
			}
		}
		return k;
	},
	isRunning: false,
	totalTime: 10,
	initSpeed: 100,
	maxSpeed: 100,
	acceleration: 20, //加速度
	executeLottery: function() {
		if (this.curSpeed == undefined) {
			this.curSpeed = this.initSpeed;
		}
		var this_speed = this.curSpeed;
		var intervalSec = this.totalTime;
		lottery.rePlay();
		var timer = setInterval(function() {
			var randomNo = lottery.getRandomIndex();
			if (!lottery.isRunning) {
				clearInterval(timer);
				lottery.stopPlay();
				lottery.curLotteryCount--;
				lottery.user_list[randomNo].is_selected = true;
				lottery.user_list[randomNo].cls_type = lottery.curLotteryType;
				if (lottery.passIndex != undefined) {
					lottery.lottery_box.children().eq(lottery.passIndex).children(":eq(2)").hide();
				}
				setTimeout(function() {
					lottery.lottery_box.children().eq(randomNo).children(":eq(3)").show();
					lottery.lottery_box.children().eq(randomNo).addClass("selected");
					lottery.passIndex = undefined;
					lottery.curLotteryUser = '<span style="padding:40px 10px;font-size:100px;font-weight:bolder;display:inline-block;">' + lottery.user_list[randomNo].itemNo + '</span>';
					setTimeout(function() {
						lottery.sortUserList(randomNo);
					}, 300);
					// if(lottery.curLotteryCount==0){
					// 	setTimeout(function() {
					// 		lottery.sortUserList(randomNo);
					// 	},300);
					// }else{
					// 	setTimeout(function() {
					// 		lottery.isRunning=true;
					// 		lottery.executeLottery();
					// 	},300);
					// }
				}, 200);
				lottery.isInitNo++;
				return;
			}
			if (lottery.passIndex != undefined) {
				lottery.lottery_box.children().eq(lottery.passIndex).children(":eq(2)").hide();
			}
			lottery.lottery_box.children().eq(randomNo).children(":eq(2)").show();
			lottery.passIndex = randomNo;
			// alert("end");
			intervalSec--;
		}, this_speed);
	},
	curLotteryUser: '',
	sortUserList: function(index) {
		// var tempList=window.localStorage.getItem("user_list");
		// this.user_list=jQuery.parseJSON(tempList);
		var _span_str = this.curLotteryUser;
		var curNumber = this.user_list[index].itemNo;
		window.localStorage.setItem("user_list", JSON.stringify(this.user_list));
		var typeName = lottery.curLotteryTypeName;
		if (lottery.curLotteryCount == 0) {
			lottery.curLotteryUser = '';
			lottery.roundingOffWork();
		}
		//'<div style="text-align:left;font-size:18px;padding-bottom:20px;">恭喜'+typeName+'中奖号码：</div>'
		this.showPop(_span_str, 30, function() {
			var _child = $("#loading").children(":eq(0)");
			// var ratio=0.6;
			// var _wid=_child.width(),_hei=_child.height(),_left=_child.offset().left,_top=_child.offset().top;
			// var cur_wid=_wid*0.6,cur_hei=_hei*0.6,cur_left=_wid-cur_wid+_left,cur_top=_hei-cur_hei+_top;
			var _left = ($(window).width() - 450) / 2;
			var oriCssOpt = {
				width: 450 + 'px',
				left: _left + 'px',
				height: '180px',
				'background': 'url(images/lottery_pop.png) no-repeat',
				'background-size': 'cover',
				'box-shadow': '0 5px 20px rgba(0, 0, 0, 1.6)',
				display: 'block'
			};
			var chgCssOpt = {
				display: 'none',
				'box-shadow': 'none'
			};
			lottery.shake(_child, oriCssOpt, chgCssOpt, 6, function() {

				// $("#loading").remove();
				// if(lottery.curLotteryCount==0){
				// 	lottery.isRunning=false;
				// }else{
				// 	lottery.curLotteryCount--;
				// 	lottery.executeLottery();
				// }
			});

		});

	},
	initialSpeed: function() {
		if (this.isInitNo == 0) {
			this.user_list.sort(this.randomsort);
		}
		var len = this.user_list.length;
		this.lottery_box.children().remove();
		for (var i = 0; i < len; i++) {
			var tempJson = this.user_list[i];
			this.createBox(this.lottery_box, tempJson);
		}
	},
	roundingOffWork: function() {
		$("#sel_type").children().each(function(i, sel_item) {
			if ($(sel_item).attr("data-type") == lottery.curLotteryType) {
				$(sel_item).remove();
				return false;
			}
		});
		this.isRunning = false;
		this.curLotteryType = undefined;
		this.curLotteryTypeName = undefined;
		this.curLotteryCount = undefined;
		this.passIndex = undefined;
	}
}
lottery.audio_obj = $("#curAudio")[0];
lottery.continuePlay = function() {
	//继续播放
	this.audio_obj.play();
}
lottery.pausePlay = function() {
	//暂停播放
	this.audio_obj.pause();
}
lottery.stopPlay = function() {
	//停止播放
	this.audio_obj.pause();
	this.audio_obj.currentTime = 0;
}
lottery.rePlay = function() {
	//重新播放
	// console.log(this.audio_obj);
	this.audio_obj.currentTime = 0;
	this.audio_obj.play();
}
$(function() {
	lottery.initial(79);
	lottery.typeJson = [{
		cate: "三等奖",
		setNumber: 3,
		typeNo: 1
	}, {
		cate: "二等奖",
		setNumber: 2,
		typeNo: 2
	}, {
		cate: "一等奖",
		setNumber: 1,
		typeNo: 3
	}];
	lottery.isInitNo = 0;
	lottery.spacingTimes = 0;
	$(document).keydown(function(e) {
		if (e.which == 13) {
			if (lottery.curLotteryType == undefined) {
				if ($("#loading").length > 0) {
					$("#loading").remove();
				} else {
					lottery.showPop('请在左下方选择抽奖类别再确定进行操作');
				}

				return;
			}
			$("#loading").remove();
			if (lottery.isRunning) {
				lottery.isRunning = false;
				//lottery.roundingOffWork();
			} else {
				// var cur_time=1000;
				// var timer = setInterval(function() {
				// 	if(cur_time<=0){
				// 		$("#loading").remove();
				// 		lottery.roundingOffWork();
				// 	}
				// 	lottery.executeLottery();
				// 	cur_time--;
				// },200);
				lottery.executeLottery();
				lottery.isRunning = true;
			}
		}
	});
});