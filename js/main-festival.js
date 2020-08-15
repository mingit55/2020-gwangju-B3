class App {
    constructor(){
        this.$content = $("#content");
        this.$paging = $(".paging");
        this.$modal = $("#view-modal");

        this.getFestivals().then(festivals => {
            this.festivals = festivals;

            this.render();
            this.setEvents();
        });
    }

    // 데이터 그리기
    render(){
        let qs = location.getQueryString();
        let page = parseInt(qs.page);
        page = isNaN(page) || !page || page < 1 ? 1 : page;

        let view_type = qs.type;
        view_type = ["normal", "list"].includes(view_type) ? view_type : "normal";
        
        let view_list = this.festivals;

        const PAGE__LENGTH = view_type === "normal" ? 6 : 10;
        const PAGE__BLENGTH = 5;

        let total_page = Math.ceil(view_list.length / PAGE__LENGTH);
        let current_block = Math.ceil(page / PAGE__BLENGTH);

        let start = current_block * PAGE__BLENGTH - PAGE__BLENGTH + 1;
        let end = start + PAGE__BLENGTH - 1;

        let prev = true;
        if(start - 1 < 1){
            start = 1;
            prev = false;
        }
        let next = true;
        if(end + 1 > total_page) {
            end = total_page;
            next = false;
        }

        let htmlPage = "";
        for(let i = start; i <= end; i++)
            htmlPage += `<a href="?page=${i}&type=${view_type}" class="paging__link ${page == i ? 'active' : ''}">${i}</a>`;

        this.$paging.html(`<a href="?page=${prev ? start - 1 : start}&type=${view_type}" class="paging__blink">
                                <i class="fa fa-angle-left"></i>
                            </a>
                            ${htmlPage}
                            <a href="?page=${next ? end + 1 : end}&type=${view_type}" class="paging__blink">
                                <i class="fa fa-angle-right"></i>
                            </a>`);
                        
        $(".tabs__item").removeClass("active");
        $(".tabs__item."+view_type).addClass("active");

        let sp = (page - 1) * PAGE__LENGTH;
        let ep = sp + PAGE__LENGTH;
        view_list = view_list.slice(sp, ep);

        if(view_type === "normal"){
            this.showByAlbum(view_list);
        } else {
            this.showByList(view_list);
        }
    }

    // 앨범 형태로 데이터 그리기
    showByAlbum(view_list){
        let lastItem = this.festivals[this.festivals.length - 1];
        let htmlItems = view_list.map(item => `<div class="col-lg-4 mb-4">
                                                    <div class="festival-item border" data-id="${item.id}" data-target="#view-modal" data-toggle="modal">
                                                        <div class="festival-item__count">${item.images.length}</div>
                                                        <img class="hx-200 fit-cover" src="${item.imagePath}/${item.images[0]}" alt="축제 이미지">
                                                        <div class="px-3 py-3">
                                                            <div class="fx-2 font-weight-bold text-ellipsis">${item.name}</div>
                                                            <div class="fx-n1 text-muted mt-1">${item.period}</div>
                                                        </div>
                                                    </div>
                                                </div>`);

        this.$content.html(`<div class="row mt-4" data-id="${lastItem.id}" data-target="#view-modal" data-toggle="modal">
                                <div class="col-lg-5">
                                    <img src="${lastItem.imagePath}/${lastItem.images[0]}" alt="축제 이미지" class="hx-250 fit-cover">
                                </div>
                                <div class="col-lg-7">
                                    <div class="fx-n2 text-muted">추천 축제</div>
                                    <div class="fx-4 font-weight-bold">${lastItem.name}</div>
                                    <div class="mt-4">
                                        <span class="fx-n2 text-muted mr-2">기간</span>
                                        <span class="fx-n1">${lastItem.period}</span>
                                    </div>
                                    <div class="mt-3">
                                        <p class="fx-n2 text-muted">${lastItem.content}</p>
                                    </div>
                                    <div class="mt-3">
                                        <button class="btn-filled">자세히 보기</button>
                                    </div>
                                </div>
                            </div>
                            <div class="row mt-5">
                                ${htmlItems.join('')}
                            </div>`);
        this.$content.find("img").on("error", function(){
            this.src = "/images/no-image.png";
            $(this).siblings(".festival-item__count").remove();
        });
    }   

    // 리스트 형태로 데이터 그리기
    showByList(view_list){
        let htmlItems = view_list.map(item => `<div class="t-row" data-id="${item.id}" data-target="#view-modal" data-toggle="modal">
                                                    <div class="cell-10">${item.no}</div>
                                                    <div class="cell-50 px-3 text-ellipsis text-left">${item.name}</div>
                                                    <div class="cell-30">${item.period}</div>
                                                    <div class="cell-10">${item.area}</div>
                                                </div>`);

        this.$content.html(`<div>
                                <div class="t-head">
                                    <div class="cell-10">번호</div>
                                    <div class="cell-50">축제명</div>
                                    <div class="cell-30">기간</div>
                                    <div class="cell-10">장소</div>
                                </div>
                                ${htmlItems.join('')}
                            </div>`);
    }

    // 축제 정보 가져오기
    getFestivals(){
        return fetch("/xml/festivalList.xml")
            .then(res => res.text())
            .then(xmlText => {
                let parser = new DOMParser();
                let xmlData = parser.parseFromString(xmlText, "text/xml");
                return Array.from(xmlData.querySelectorAll("item")).map(xmlItem => {
                    let id = xmlItem.querySelector("sn").innerHTML;
                    let no = xmlItem.querySelector("no").innerHTML;
                    let name = xmlItem.querySelector("nm").innerHTML;
                    let location = xmlItem.querySelector("location").innerHTML;
                    let period = xmlItem.querySelector("dt").innerHTML;
                    let content = xmlItem.querySelector("cn").innerHTML;
                    let images = Array.from(xmlItem.querySelectorAll("image")).map(xmlImage => xmlImage.innerHTML);
                    let imagePath = "/xml/festivalImages/" + id.padStart(3, "0") + "_" + no;
                    let area = xmlItem.querySelector("area").innerHTML;
                    return {id, no, name, location, period, content, images, area, imagePath};
                });
            });
    }

    setEvents(){
        this.$content.on("click", "[data-target='#view-modal']", e => {
            let id = e.currentTarget.dataset.id;
            let festival = this.festivals.find(item => item.id == id);

            
            let imgLen = festival.images.length;
            let htmlImages = festival.images.map(image => `<img style="width: ${100 / imgLen}%" src="${festival.imagePath}/${image}" alt="축제 이미지">`);
            let htmlBtns = festival.images.map((img, idx) => `<button class="f-control__btn ${idx == 0 ? 'active' : ''}" data-no="${idx}">${idx + 1}</button>`);

            this.$modal.data("sno", 0);
            this.$modal.html(`<div class="modal-dialog modal-lg">
                                <div class="modal-content">
                                    <div class="modal-header d-between">
                                        <div class="font-weight-bold fx-4">축제 상세 정보</div>
                                        <span class="icon" data-dismiss="modal">&times;</span>
                                    </div>
                                    <div class="modal-body">
                                        <div class="row">
                                            <div class="col-lg-5">
                                                <img class="fit-cover hx-200" src="${festival.imagePath}/${festival.images[0]}" alt="축제 이미지">
                                            </div>
                                            <div class="col-lg-7">
                                                <div class="fx-4 font-weight-bold">${festival.name}</div>
                                                <div class="mt-4">
                                                    <div class="mt-1">
                                                        <span class="fx-n2 text-muted mr-2">지역</span>
                                                        <span class="fx-n1">${festival.area}</span>
                                                    </div>
                                                    <div class="mt-1">
                                                        <span class="fx-n2 text-muted mr-2">장소</span>
                                                        <span class="fx-n1">${festival.location}</span>
                                                    </div>
                                                    <div class="mt-1">
                                                        <span class="fx-n2 text-muted mr-2">기간</span>
                                                        <span class="fx-n1">${festival.period}</span>
                                                    </div>
                                                </div>
                                                <div class="mt-3">
                                                    <p class="fx-n2 text-muted">${festival.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <hr class="mt-4">
                                        <div class="fx-3 font-weight-bold">축제 사진</div>
                                        <div class="f-slide mt-4">
                                            <div class="f-slide__inner" style="width: ${100 * imgLen}%">
                                                ${htmlImages.join('')}
                                            </div>
                                        </div>
                                        <div class="f-control">
                                            <button class="btn-filled relative" data-no="-1" disabled>이전</button>
                                                ${htmlBtns.join('')}
                                            <button class="btn-filled relative" data-no="1">다음</button>
                                        </div>
                                    </div>
                                </div>
                            </div>`);
            this.$modal.find("img").on("error", function(){
                this.src = "/images/no-image.png";
            });
        });

        this.$modal.on("click", ".f-control > button", e => {
            let sno;
            let no = parseInt(e.currentTarget.dataset.no);
            let cno = this.$modal.data("sno");
            let imgLen = this.$modal.find(".f-slide__inner > img").length;

            // 이전 & 다음
            if(e.currentTarget.classList.contains("relative")) sno = cno + no;    
            // 일반 숫자
            else sno = no;

            console.log(e.currentTarget.classList.contains("relative"), sno);
            this.$modal.data("sno", sno);
            this.$modal.find(".f-slide__inner").css("left", -100 * sno + "%");

            $(".f-control__btn").removeClass("active");
            $(".f-control__btn").eq(sno).addClass("active");

            $(".f-control .relative").removeAttr("disabled");
            if(sno + 1 >= imgLen) $(".f-control .relative").eq(1).attr("disabled", "disabled");
            else if(sno - 1 < 0) $(".f-control .relative").eq(0).attr("disabled", "disabled");
        });
    }
}

$(function(){
    let app = new App();
});