require('./selectView.less');

define('SelectView', function(){

    var ITEM_HEIGHT = 40; //select项高度
    var height;           //select区域总高度
    var selections = [];  //选择项
    var selectBodys;      //滚动体
    var canMove = false, top, curMoveIndex, curMoveTarget, startY, startTY, isBusy = false;
    var isMount = false;

    var SelectView = React.createClass({

        getInitialState: function(){
            return {
                show: this.props.show
            };
        },

        componentWillReceiveProps: function(nextProps){
            this.state.show = nextProps.show;
            this.setState(this.state);
        },

        componentDidMount: function() {
            var me = this;
            var len = this.props.data.length;
            selections.length = len;
            var subviews = document.querySelectorAll('.select-sub-view');
            if(subviews && subviews.length > 0){
                height = subviews[0].offsetHeight;
                top = height/2 - ITEM_HEIGHT/2;
                selectBodys = document.querySelectorAll('.select-sub-view .select-body');

                for(var i=0; i<subviews.length; i++){
                    subviews[i].style.width = Math.floor(100/len) + "%";
                }
            }
            isMount = true;
        },

        componentDidUpdate: function() {
            var me = this;
            selectBodys = document.querySelectorAll('.select-sub-view .select-body');
            for(var i=0; i<selectBodys.length; i++){
                // if(i == 0){
                //     if(!selections[i]){
                //         me.selectIndex(i, 0, true);
                //     }
                // } else {
                //     me.selectIndex(i, 0, true);
                // }
                if(!selections[i]){
                    me.selectIndex(i, 0, true);
                }
            }
        },

        render: function(){
            var me = this;
            var sty;
            if(isMount){
                sty = {display: this.state.show ? 'block': 'none'};
            } else {
                sty = {visibility: this.state.show ? 'visible': 'hidden'};
            }
            return (
                <div className="component-selectView" style={sty} onTouchMove={this.touchMove} onTouchEnd={this.touchEnd}>
                    <div className="selectView-mask" onTouchEnd={this.hide}>
                    </div>

                    <div className="selectView-container">
                        <div className="top-area">
                            <div className="selectView-cancle" onTouchEnd={this.cancel}>取消</div>
                            <div className="selectView-title">{this.props.title}</div>
                            <div className="selectView-submit" onTouchEnd={this.submit}>确定</div>
                        </div>
                        <div className="selectView-body">
                            <div className="selectView-bodyMask"></div>
                            {
                                this.props.data.map(function(item, i){
                                    return (
                                        <div key={i} className="select-sub-view">
                                            <div className="select-body" data-index={i} onTouchStart={me.touchStart}>
                                            {
                                                item.map(function(itm, j){
                                                    return <div className="select-item" key={j} data-value={itm.value}>{itm.name}</div>;
                                                })
                                            }
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            )
        },

        touchStart: function(e){
            if(isBusy) return;

            canMove = true;
            var tt = e.targetTouches[0];
            startY = tt.pageY;
            var tar = e.currentTarget;
            curMoveIndex = tar.getAttribute('data-index');
            curMoveTarget = tar;
            startTY = this.getTransformValue(tar);
        },

        touchMove: function(e){
            if(canMove){
                var tar = curMoveTarget;
                var tt = e.changedTouches[0];
                var dis = tt.pageY - startY;
                tar.style.webkitTransition = 'all 0s linear';
                tar.style.webkitTransform = "translateY(" + (startTY + dis) + "px)";
            }
            e.preventDefault();
        },

        touchEnd: function(e){
            if(canMove){
                var me = this;
                canMove = false;
                isBusy = true;
                var tar = curMoveTarget;
                var ty = this.getTransformValue(tar);
                var lastTop = Math.round((top - ty) / ITEM_HEIGHT);
                this.selectIndex(curMoveIndex, lastTop);

                setTimeout(function(){
                    isBusy = false;
                }, 300);
            }
        },

        getTransformValue: function(tar){
            var val = tar.style.webkitTransform;
            var mats = val.match(/translateY\((.*?)\)/);
            if(mats){
                return parseInt(mats[1].replace('px', ''));
            }
            return 0;
        },

        cancel: function(){
            this.hide();
        },

        hide: function(){
            for(var i=0; i<selectBodys.length; i++){
                selectBodys[i].style.webkitTransition = 'all 0s linear';
            }
            this.state.show = false;
            this.props.change && this.props.change();
            this.setState(this.state);
        },

        submit: function(e){
            var me = this;
            me.hide();
            var result = [];
            selections.forEach(function(item, i){
                if(item){
                    result.push(me.props.data[i][item]);
                } else {
                    result.push(me.props.data[i][0]);
                }
            });
            me.props.change && me.props.change(result, selections[0]);
            e.stopPropagation();
            e.preventDefault();
        },

        selectIndex: function(index, itemIndex, ignore){
            var me = this;
            var sb = selectBodys[index];
            var len = me.props.data[index].length;
            if(len > 0){
                itemIndex < 0 && (itemIndex = 0);
                itemIndex >= len && (itemIndex = len-1);

                selections[index] = itemIndex;

                sb.style.webkitTransition = 'all 0.2s linear';
                sb.style.webkitTransform = "translateY(" + (top - itemIndex * ITEM_HEIGHT) + "px)";
                
                if(!ignore){
                    if(index == 0){
                        selections[1] = 0;
                        this.props.selectChange && this.props.selectChange(itemIndex);
                    }
                }
            }
        }
    });

    return SelectView;
});
