class App {
    constructor(){
        this.$standard_date = $("#standard");
        this.$content = $("#content");


        if(this.loadData()){
            this.render();
            this.setEvents();
        } else {
            this.getExchangeData().then(data => {
                this.standard = data.dt;
                this.hasList = data.items;
                this.showList = data.items.splice(0, 10);

                this.render();
                this.setEvents();
            });
        }
        
    }

    // 데이터 그리기
    render(){
        this.$standard_date.text(this.standard);

        let htmlList = this.showList.map(item => `<div class="exchange-item ${item.result == 0 ? 'active' : ''} mb-4">
                                                    <hr>
                                                    <div class="fx-4 font-weight-bold">${item.cur_nm}</div>
                                                    <div class="mt-4 border-top">
                                                        <div class="t-row">
                                                            <div class="cell-30 fx-n2 text-muted text-left">통화 코드</div>
                                                            <div class="cell-70 text-left">${item.cur_unit}</div>
                                                        </div>
                                                        <div class="t-row">
                                                            <div class="cell-30 fx-n2 text-muted text-left">송금 시</div>
                                                            <div class="cell-70 text-left">${item.ttb}</div>
                                                        </div>
                                                        <div class="t-row">
                                                            <div class="cell-30 fx-n2 text-muted text-left">수금 시</div>
                                                            <div class="cell-70 text-left">${item.tts}</div>
                                                        </div>
                                                        <div class="t-row">
                                                            <div class="cell-30 fx-n2 text-muted text-left">매매 기준율</div>
                                                            <div class="cell-70 text-left">${item.deal_bas_r}</div>
                                                        </div>
                                                        <div class="t-row">
                                                            <div class="cell-30 fx-n2 text-muted text-left">장부가격</div>
                                                            <div class="cell-70 text-left">${item.bkpr}</div>
                                                        </div>
                                                        <div class="t-row">
                                                            <div class="cell-30 fx-n2 text-muted text-left">년환가료율</div>
                                                            <div class="cell-70 text-left">${item.yy_efee_r}</div>
                                                        </div>
                                                        <div class="t-row">
                                                            <div class="cell-30 fx-n2 text-muted text-left">10일환가료율</div>
                                                            <div class="cell-70 text-left">${item.ten_dd_efee_r}</div>
                                                        </div>
                                                        <div class="t-row">
                                                            <div class="cell-30 fx-n2 text-muted text-left">매매 기준율</div>
                                                            <div class="cell-70 text-left">${item.kftc_bkpr}</div>
                                                        </div>
                                                        <div class="t-row">
                                                            <div class="cell-30 fx-n2 text-muted text-left">장부가격</div>
                                                            <div class="cell-70 text-left">${item.kftc_deal_bas_r}</div>
                                                        </div>
                                                    </div>
                                                </div>`);

        this.$content.html(`<div>
                                ${htmlList.join('')}
                                ${this.hasList.length > 0 ? '<button class="btn-filled readmore">더 보기</button>' : ''}
                            </div>`);
    }

    // 이벤트 설정하기
    setEvents(){
        $(window).on("scroll", e => {
            let scrollBottom = window.innerHeight + window.scrollY;
            if(scrollBottom === document.body.parentElement.offsetHeight) {
                this.showList.push(...this.hasList.splice(0, 10));
                this.render();
                this.saveData();
            }
        });

        this.$content.on("click", ".readmore", e => {
            this.showList.push(...this.hasList.splice(0, 10));
            this.render();
            this.saveData();
        });
    }

    // 데이터 저장하기
    saveData(){
        let showList = this.showList, 
            hasList = this.hasList, 
            standard = this.standard, 
            scrollY = window.scrollY;

        localStorage.setItem("exchangeData", JSON.stringify({showList, hasList, standard, scrollY}));
    }


    // 데이터 불러오기
    loadData(){
        let data = localStorage.getItem("exchangeData");

        if(data){
            let {showList, hasList, standard, scrollY} = JSON.parse(data);
            this.showList = showList;
            this.hasList = hasList;
            this.standard = standard;

            setTimeout(() => {
                window.scrollTo(0, scrollY);
            });

            return true;
        } else {
            return false;
        }
    }

    getExchangeData(){
        return fetch("/restAPI/currentExchangeRate.php")
            .then(res => res.json());
    }
}

$(function(){
    let app = new App();
});