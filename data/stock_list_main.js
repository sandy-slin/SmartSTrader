// javascript document
// work with stock_list.js
var markets = { 'NYSE': '纽约交易所','NASDAQ': '纳斯达克','AMEX': '美国交易所' };
S_SL_MAIN = function(){
	this.Init.apply(this, arguments);
};

S_SL_MAIN.prototype = {
    Init: function (f)
    {
        this._frame = f;
        this.svcParam = { page: 1,num: 20,sort: '',asc: 0,market: '',id: '' };
        this.css = { up: 'green',down: 'red',highlight: 'highlight',
            sortasc: 'sort_up',sortdesc: 'sort_down',
            pagediv: 'pages',pagedisabled: 'pagedisabled',pagecurr: 'pagecurr'
        };
        this.aRowCss = ['','row_2'];
        this.outputParam = ['sort','page','num','asc'];
        this.colorfield = 4;
        this.pagetags = 5;
        //无前缀的css
        this.tmrInt = 60000;
        this.tmrCntFull = 1;
        //列表：f=字段名，t=显示名/字段标题，d=小数位数（-1不起作用，-2表示字符）
        //s: 1=显示名称连接 2=不允许排序 4=强制+号 8=千位逗号 16=使用th 32=默认递增 64=涨跌箭头
        //   128=innerHTML/DOM
        //c: custom_css
        //p: template
        this.aFields = [
		  { f: 'cname',t: '名称',d: -2,s: 1 + 2,c: 'nocolor max_name' },
		  { f: 'symbol',t: '代码',d: -2,s: 1,c: 'nocolor' },
		  { f: 'price',t: '最新价',d: 2,s: 8 + 16,c: ' nocolor' },
		  { f: 'diff',t: '涨跌额',d: 2,s: 4 + 8 + 16,c: 'text_right' },
		  { f: 'chg',t: '涨跌幅',d: 2,s: 4 + 8 + 16,p: '$1%',c: '' },
		  { f: 'amplitude',t: '振幅',d: 2,s: 8 + 16,p: '$1',c: 'nocolor' },
		  { f: 'shou_kai',t: '昨收/今开盘',d: -2,s: 2,c: 'nocolor' },
		  { f: 'gao_di',t: '最高/最低价',d: -2,s: 2,c: 'nocolor' },
		  { f: 'volume',t: '成交量',d: 0,s: 8 + 16,c: 'nocolor' },
		  { f: 'mktcap',t: '市值(亿)',d: 2,s: 8 + 16,c: 'nocolor' },
		  { f: 'pe',t: '市盈率',d: 2,s: 8 + 16,/*p:'$1%',*/c: 'nocolor' },
		  { f: 'category',t: '行业板块',d: -2,s: 0,c: 'nocolor max_bk' },
		  { f: 'market',t: '上市地',d: -2,s: 0,c: 'nocolor' }
		];
        this.indexField = 'symbol';
        this.detailPage = 'http://biz.finance.sina.com.cn/suggest/lookup_n.php?q=$1&country=usstock';
        this._aCodes = [];
        this._srv = this._frame.SRVProvider();
    },
    GetData: function (cb)
    {
        getScript('http://hq.sinajs.cn/rn=' + random() + '&list=gb_dji',function ()
        {
            var _time = hq_str_gb_dji.split(',')[25];
            _time = _time.replace('AM',' 上午').replace('PM',' 下午');
            _time = _time.split(' ');
            if(_time[3] == '下午')
            {
                var _tmp = _time[2].split(':');
                if(_tmp[0] == 12)
                {
                    _tmp[0] -= 12;
                }
                _time[2] = _tmp[0] - -12 + ':' + _tmp[1];
            }
            //	        if(parseInt(_time[2]) - 16 >= 0)
            //	        {
            //	            _time[2] = '16:00';
            //	        }
            var _mon = { Jan: 1,Feb: 2,Mar: 3,Apr: 4,May: 5,Jun: 6,Jul: 7,Aug: 8,Sep: 9,Oct: 10,Nov: 11,Dec: 12 };
            document.getElementById('updateTime').innerHTML = _mon[_time[0]] + '月' + _time[1] + '日 ' + _time[2];
        });
        this._cbSVC = cb;
        //不支持并发且回调不同的情况，实践中没有这种情况
        this._frame.SRVCall('US_CategoryService.getList',this._gotData._Bind(this),this.svcParam);
    },
    _gotData: function (o)
    {
		o = o || {
			count : 0,
			data : []
		};
        this.cb(o.count);
        this._cbSVC(this._makeData(o.data));
    },
    GetDataLight: function ()
    {
    },
    GetListLength: function (cb)
    {
        this.cb = cb;
    },
    CodesChange: function (c)
    {
        this._aCodes = c;
        if(this._oQDL)
        {
            this._oQDL.changeCodes(c);
        }
    },
    _makeData: function (argData)
    {
        for(var i = 0;i < argData.length;i++)
        {
            //            if(argData[i].market != 'A')
            //            {
            //                argData[i].market = _marketType[argData[i].market];
        	//            }
        	argData[i].cname = argData[i].cname || argData[i].symbol;
            var _name = document.createElement('a');
            _name.href = 'http://biz.finance.sina.com.cn/suggest/lookup_n.php?q=$1&country=usstock'.replace('$1',argData[i].symbol);
            _name.target = '_blank';
            _name.innerHTML = argData[i].cname;
            _name.title = argData[i].cname;
            argData[i].cname = _name;
            if(argData[i].preclose * 1 > 10000)
            {
                argData[i].preclose = Math.round(argData[i].preclose * 1);
            }
            if(argData[i].open * 1 > 10000)
            {
                argData[i].open = Math.round(argData[i].open * 1);
            }
            if(argData[i].high * 1 > 10000)
            {
                argData[i].high = Math.round(argData[i].high * 1);
            }
            if(argData[i].low * 1 > 10000)
            {
                argData[i].low = Math.round(argData[i].low * 1);
            }
            argData[i].shou_kai = argData[i].preclose + '/' + argData[i].open;
            argData[i].gao_di = argData[i].high + '/' + argData[i].low;

            argData[i].mktcap = argData[i].mktcap / 100000000;
            if(argData[i].turnover === null)
            {
                var _span = document.createElement('span');
                _span.innerHTML = '--';
                argData[i].turnover = _span;
            }
            if(argData[i].mktcap == 0)
            {
                var _span = document.createElement('span');
                _span.innerHTML = '--';
                argData[i].mktcap = _span;
            }
            var _cate = document.createElement('a');
            _cate.href = 'javascript:void(0);';
            _cate.onclick = selectCate.bindArg(argData[i].category_id);
            _cate.innerHTML = argData[i].category || '--';
            _cate.title = argData[i].category;
            argData[i].category = _cate;
            if(markets[argData[i].market])
            {
                var _market = document.createElement('a');
                _market.href = 'javascript:void(0);';
                _market.onclick = dataCtrl.select.fnBind(dataCtrl,[undefined,{ 'NYSE': 'N','NASDAQ': 'O','AMEX': 'A'}[argData[i].market]]);
                _market.innerHTML = markets[argData[i].market] || argData[i].market;
                argData[i].market = _market;
            }
            else
            {
                argData[i].market = markets[argData[i].market] || argData[i].market;
            }
            if(argData[i].pe <= 0)
            {
                argData[i].pe = '--';
            }
        }
        return argData;
    }
};
